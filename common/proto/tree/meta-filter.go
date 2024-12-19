/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package tree

import (
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/pydio/cells/v5/common"
)

const (
	MetaFilterGrep      = "grep"
	MetaFilterNoGrep    = "no-grep"
	MetaFilterForceGrep = "force-grep"
	MetaFilterTime      = "time"
	MetaFilterSize      = "size"
	MetaFilterETag      = "etag"
	MetaFilterDepth     = "depth"

	MetaSortTime   = "mtime"
	MetaSortSize   = "size"
	MetaSortName   = "name"
	MetaSortNameCI = "name_ci"
	MetaSortMPath  = "mpath1,mpath2,mpath3,mpath4"
	MetaSortType   = "leaf"
)

var (
	metaIntRegexp = regexp.MustCompile(`([<>])(=?)([0-9]+)`)
)

type cmp struct {
	field string
	dir   string
	eq    bool
	val   int64
}

func ValidSortField(sortField string) bool {
	return sortField == MetaSortName || sortField == MetaSortNameCI || sortField == MetaSortTime || sortField == MetaSortSize ||
		sortField == MetaSortType || sortField == MetaSortMPath
}

// MetaFilter holds specific filtering conditions, generally transformed from standard
// search queries to basic Listing options.
type MetaFilter struct {
	reqNode *Node

	forceGrep    bool
	filterType   NodeType
	grep         *regexp.Regexp
	negativeGrep *regexp.Regexp
	eTag         *regexp.Regexp
	intComps     []cmp

	sortField string
	sortDesc  bool
}

// FilterBuilder interfaces a DB clause builder
type FilterBuilder interface {
	// And appends an AND query
	And(query interface{}, args ...interface{})
	// OrderBy appends an ORDER BY instruction
	OrderBy(fieldName string, dir string)
	// Ors creates a combined query of ORS
	Ors(queries []string, args []interface{}) interface{}
}

// NewMetaFilter creates a meta filter looking for request node metadata specific keys.
func NewMetaFilter(node *Node) *MetaFilter {
	return &MetaFilter{reqNode: node}
}

// Parse loads the filter keys.
func (m *MetaFilter) Parse() bool {
	if gr := m.reqNode.GetStringMeta(MetaFilterGrep); gr != "" {
		if g, e := regexp.Compile(gr); e == nil {
			m.grep = g
		}
	} else if fgr := m.reqNode.GetStringMeta(MetaFilterForceGrep); fgr != "" {
		if g, e := regexp.Compile(fgr); e == nil {
			m.grep = g
			m.forceGrep = true
		}
	}
	if nr := m.reqNode.GetStringMeta(MetaFilterNoGrep); nr != "" {
		if g, e := regexp.Compile(nr); e == nil {
			m.negativeGrep = g
		}
	}
	if et := m.reqNode.GetStringMeta(MetaFilterETag); et != "" {
		if g, e := regexp.Compile(et); e == nil {
			m.eTag = g
		}
	}
	m.parseIntExpr(MetaFilterTime)
	m.parseIntExpr(MetaFilterSize)
	return m.grep != nil || m.negativeGrep != nil || m.eTag != nil || len(m.intComps) > 0
}

// LimitDepth returns an optional depth limitation.
func (m *MetaFilter) LimitDepth() int {
	var d int
	if er := m.reqNode.GetMeta(MetaFilterDepth, &d); er == nil && d > 0 {
		return d
	}
	return 0
}

// Build uses appends all clauses to a FilterBuilder
func (m *MetaFilter) Build(builder FilterBuilder) {

	if m.grep != nil && !m.forceGrep {
		m.grepToLikes("name", m.reqNode.GetStringMeta(MetaFilterGrep), false, builder)
	}
	if m.negativeGrep != nil {
		m.grepToLikes("name", m.reqNode.GetStringMeta(MetaFilterNoGrep), true, builder)
	}
	if m.eTag != nil {
		m.grepToLikes("etag", m.reqNode.GetStringMeta(MetaFilterETag), false, builder)
	}
	if m.filterType != NodeType_UNKNOWN {
		if m.filterType == NodeType_LEAF {
			builder.And("leaf = ?", 1)
		} else {
			builder.And("leaf = ?", 2)
		}
	}
	for _, c := range m.intComps {
		field := c.field
		if c.field == MetaFilterTime {
			field = "mtime"
		}
		comp := c.dir
		if c.eq {
			comp += "="
		}
		builder.And(field+" "+comp+" ?", c.val)
	}

	// Add orderBy
	if m.sortField != "" {
		sortDesc := m.sortDesc
		if m.sortField == MetaSortType { // Switch for backward compat on "leaf" : v4 was 0/1, v5 is 1/2
			sortDesc = !sortDesc
		}
		dir := "ASC"
		if sortDesc {
			dir = "DESC"
		}
		if m.sortField == MetaSortNameCI {
			builder.OrderBy("LOWER(name)", dir)
		} else {
			builder.OrderBy(m.sortField, dir)
		}
	}
	return

}

// HasSQLFilters returns true if MetaFilter has one of grep (unless forced), negativeGrep, filterType or int comparators set.
func (m *MetaFilter) HasSQLFilters() bool {
	return (m.grep != nil && !m.forceGrep) || m.negativeGrep != nil || m.filterType != NodeType_UNKNOWN || len(m.intComps) > 0 || m.eTag != nil || m.HasSort()
}

// ParseType register a node filter type
func (m *MetaFilter) ParseType(t NodeType) {
	m.filterType = t
}

// MatchForceGrep applies if a meta specifically told to use grep filtering instead of SQL.
func (m *MetaFilter) MatchForceGrep(name string) bool {
	if m.grep != nil && m.forceGrep {
		return m.grep.MatchString(name)
	}
	return true
}

func (m *MetaFilter) parseIntExpr(meta string) bool {
	var val []string
	if e := m.reqNode.GetMeta(meta, &val); e == nil {
		for _, filter := range val {
			matches := metaIntRegexp.FindStringSubmatch(filter)
			if len(matches) == 4 {
				val, er := strconv.ParseInt(matches[3], 10, 64)
				if er != nil {
					continue
				}
				m.intComps = append(m.intComps, cmp{
					field: meta,
					dir:   matches[1],
					eq:    matches[2] != "",
					val:   val,
				})
			}
		}
	}
	return len(m.intComps) > 0
}

// Match checks node results against conditions.
func (m *MetaFilter) Match(name string, n *Node) bool {
	if m.grep != nil && !m.grep.MatchString(name) {
		return false
	}
	if m.negativeGrep != nil && m.negativeGrep.MatchString(name) {
		return false
	}
	if m.eTag != nil && !m.eTag.MatchString(n.Etag) {
		return false
	}
	for _, c := range m.intComps {
		var ref int64
		if c.field == MetaFilterTime {
			ref = n.MTime
		} else if c.field == MetaFilterSize {
			ref = n.Size
		}
		var match bool
		if c.dir == ">" {
			if c.eq {
				match = ref >= c.val
			} else {
				match = ref > c.val
			}
		} else {
			if c.eq {
				match = ref <= c.val
			} else {
				match = ref < c.val
			}
		}
		if !match {
			return false
		}
	}
	return true
}

// AddSort adds a sort instruction
func (m *MetaFilter) AddSort(defaultField, sortField string, sortDesc bool) {
	var filtered []string
	for _, f := range strings.Split(sortField, ",") {
		f = strings.TrimSpace(f)
		if ValidSortField(f) {
			filtered = append(filtered, f)
		}
	}
	sortField = strings.Join(filtered, ",")
	m.sortField = sortField
	m.sortDesc = sortDesc
	if m.sortDesc && m.sortField == "" {
		m.sortField = defaultField
	} else if m.sortField == defaultField && !sortDesc {
		m.sortField = ""
		m.sortDesc = false
	}
}

// HasSort checks if sortField is not empty
func (m *MetaFilter) HasSort() bool {
	return m.sortField != ""
}

func (m *MetaFilter) grepToLikes(field, g string, neg bool, builder FilterBuilder) {
	var parts []string
	var arguments []interface{}
	not := ""
	if neg {
		not = "NOT "
	}
	for _, p := range strings.Split(g, "|") {
		parts = append(parts, field+" "+not+"LIKE ?")
		arguments = append(arguments, m.grepToLike(p))
	}
	if len(parts) > 1 {
		if builder != nil {
			builder.And(builder.Ors(parts, arguments))
		}
	} else {
		if builder != nil {
			builder.And(parts[0], arguments...)
		}
	}
}

func (m *MetaFilter) grepToLike(g string) string {
	word := strings.ReplaceAll(g, "(?i)", "")
	word = strings.Trim(word, "^$")
	if !strings.HasPrefix(g, "^") {
		word = "%" + word
	}
	if !strings.HasSuffix(g, "$") {
		word += "%"
	}
	return word
}

type GeoJson struct {
	Type        string    `bson:"type"`
	Coordinates []float64 `bson:"coordinates"`
}

type IndexableNode struct {
	Node       `bson:"inline"`
	ReloadCore bool `bson:"-"`
	ReloadNs   bool `bson:"-"`

	ModifTime   time.Time              `bson:"modif_time"`
	Basename    string                 `bson:"basename"`
	NodeType    string                 `bson:"node_type"`
	Extension   string                 `bson:"extension"`
	TextContent string                 `bson:"text_content,omitempty"`
	GeoPoint    map[string]interface{} `bson:"-"`                  // Used by Bleve
	GeoJson     *GeoJson               `bson:"geo_json,omitempty"` // Used by Mongo
	Meta        map[string]interface{} `bson:"meta"`
}

func (i *IndexableNode) BleveType() string {
	return "node"
}

// IndexID implements IndexIDProvider interface
func (i *IndexableNode) IndexID() string {
	return i.GetUuid()
}

func (i *IndexableNode) MemLoad() {
	i.Meta = i.AllMetaDeserialized(nil)
	i.ModifTime = time.Unix(i.MTime, 0)
	var basename string
	i.GetMeta(common.MetaNamespaceNodeName, &basename)
	i.Basename = basename
	if i.Type == 1 {
		i.NodeType = "file"
		i.Extension = strings.ToLower(strings.TrimLeft(filepath.Ext(basename), "."))
	} else {
		i.NodeType = "folder"
	}
	i.GetMeta(common.MetaNamespaceGeoLocation, &i.GeoPoint)
	i.MetaStore = nil
}

func NewMemIndexableNode(n *Node) *IndexableNode {
	i := &IndexableNode{Node: *n}
	i.MemLoad()
	return i
}
