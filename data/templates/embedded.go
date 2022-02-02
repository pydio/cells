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

package templates

import (
	"bytes"
	"embed"
	"io"
	"io/ioutil"
	"path"
	"sort"
	"strings"

	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/utils/statics"
)

var (
	//go:embed embed/*
	assets embed.FS
)

func init() {
	RegisterProvider(NewEmbedded())
}

type Embedded struct {
	box statics.FS
}

type EmbeddedNode struct {
	box statics.FS
	rest.Template
}

func NewEmbedded() DAO {
	e := &Embedded{}
	e.box = statics.AsFS(assets, "embed")
	return e
}

func (e *Embedded) List() []Node {
	var nodes []Node
	for _, name := range e.box.List() {
		parts := strings.Split(name, "-")
		if len(parts) != 2 {
			continue
		}
		node := &EmbeddedNode{
			box: e.box,
		}
		label := strings.Replace(parts[1], "_", "/", -1)
		ext := path.Ext(label)
		label = strings.TrimSuffix(label, ext)

		tpl := &rest.Template{
			UUID:  name,
			Label: label,
			Node: &rest.TemplateNode{
				IsFile:    true,
				EmbedPath: name,
			},
		}
		node.Template = *tpl
		nodes = append(nodes, node)
	}
	sort.Slice(nodes, func(i, j int) bool {
		return nodes[i].(*EmbeddedNode).UUID < nodes[j].(*EmbeddedNode).UUID
	})
	return nodes
}

func (e *Embedded) ByUUID(uuid string) (Node, error) {
	var node Node
	for _, n := range e.List() {
		if n.AsTemplate().UUID == uuid {
			node = n
			break
		}
	}
	if node == nil {
		return nil, errors.NotFound("template.not.found", "Cannot find template with this identifier")
	} else {
		return node, nil
	}
}

func (en *EmbeddedNode) List() []Node {
	var nodes []Node
	return nodes
}

func (en *EmbeddedNode) IsLeaf() bool {
	return en.Template.Node.IsFile
}

func (en *EmbeddedNode) Read() (io.Reader, int64, error) {
	file, e := en.box.Open(en.Template.Node.EmbedPath)
	if e != nil {
		return nil, 0, e
	}
	data, _ := ioutil.ReadAll(file)
	file.Close()
	r := bytes.NewReader(data)
	return r, int64(len(data)), nil
}

func (en *EmbeddedNode) AsTemplate() *rest.Template {
	return &en.Template
}
