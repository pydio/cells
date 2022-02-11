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

	"github.com/pydio/cells/v4/common"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

const (
	MetaFilterGrep   = "grep"
	MetaFilterNoGrep = "no-grep"
	MetaFilterTime   = "time"
	MetaFilterSize   = "size"
	MetaFilterDepth  = "depth"
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

type MetaFilter struct {
	reqNode *Node

	grep         *regexp.Regexp
	negativeGrep *regexp.Regexp
	intComps     []cmp
}

func NewMetaFilter(node *Node) *MetaFilter {
	return &MetaFilter{reqNode: node}
}

func (m *MetaFilter) Parse() bool {
	if m.reqNode.GetStringMeta(MetaFilterGrep) != "" {
		if g, e := regexp.Compile(m.reqNode.GetStringMeta(MetaFilterGrep)); e == nil {
			m.grep = g
		}
	}
	if m.reqNode.GetStringMeta(MetaFilterNoGrep) != "" {
		if g, e := regexp.Compile(m.reqNode.GetStringMeta(MetaFilterNoGrep)); e == nil {
			m.negativeGrep = g
		}
	}
	m.parseIntExpr(MetaFilterTime)
	m.parseIntExpr(MetaFilterSize)
	return m.grep != nil || m.negativeGrep != nil || len(m.intComps) > 0
}

func (m *MetaFilter) LimitDepth() int {
	var d *int
	if meta := m.reqNode.GetStringMeta(MetaFilterDepth); meta != "" {
		if e := json.Unmarshal([]byte(meta), &d); e == nil {
			return *d
		}
	}
	return 0
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

func (m *MetaFilter) Match(name string, n *Node) bool {
	if m.grep != nil && !m.grep.MatchString(name) {
		return false
	}
	if m.negativeGrep != nil && m.negativeGrep.MatchString(name) {
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

type IndexableNode struct {
	Node       `bson:"inline"`
	ReloadCore bool `bson:"-"`
	ReloadNs   bool `bson:"-"`

	ModifTime   time.Time              `bson:"modif_time"`
	Basename    string                 `bson:"basename"`
	NodeType    string                 `bson:"node_type"`
	Extension   string                 `bson:"extension"`
	TextContent string                 `bson:"text_content"`
	GeoPoint    map[string]interface{} `bson:"geo_point"`
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
