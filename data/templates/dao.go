/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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
	"io"
	"path"
	"strings"

	"github.com/gobuffalo/packr"

	"github.com/pydio/cells/common/proto/rest"
)

type DAO interface {
	List() []Node
}

type Node interface {
	IsLeaf() bool
	Read() (io.Reader, int64, error)
	List() []Node
	AsTemplate() *rest.Template
}

type Embedded struct {
	box packr.Box
}

type EmbeddedNode struct {
	box packr.Box
	rest.Template
}

func NewEmbedded() DAO {
	e := &Embedded{}
	e.box = packr.NewBox("../../data/templates/embed")
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
	return nodes
}

func (en *EmbeddedNode) List() []Node {
	var nodes []Node
	return nodes
}

func (en *EmbeddedNode) IsLeaf() bool {
	return en.Template.Node.IsFile
}

func (en *EmbeddedNode) Read() (io.Reader, int64, error) {
	data := en.box.Bytes(en.Template.Node.EmbedPath)
	r := bytes.NewReader(data)
	return r, int64(len(data)), nil
}

func (en *EmbeddedNode) AsTemplate() *rest.Template {
	return &en.Template
}
