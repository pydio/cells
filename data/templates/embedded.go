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
	"context"
	"embed"
	"io"
	"path"
	"sort"
	"strings"

	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/serviceerrors"
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
	*rest.Template
	box       statics.FS
	embedPath string
}

func NewEmbedded() DAO {
	e := &Embedded{}
	e.box = statics.AsFS(assets, "embed")
	return e
}

func (e *Embedded) List(ctx context.Context) ([]Node, error) {
	var nodes []Node
	for _, name := range e.box.List() {
		parts := strings.Split(name, "-")
		if len(parts) != 2 {
			continue
		}
		node := &EmbeddedNode{
			box:       e.box,
			embedPath: name,
		}
		label := strings.Replace(parts[1], "_", "/", -1)
		ext := path.Ext(label)
		label = strings.TrimSuffix(label, ext)

		node.Template = &rest.Template{
			UUID:  name,
			Label: label,
			Node: &rest.TemplateNode{
				Node: &tree.Node{Type: tree.NodeType_LEAF},
			},
		}
		nodes = append(nodes, node)
	}
	sort.Slice(nodes, func(i, j int) bool {
		return nodes[i].(*EmbeddedNode).UUID < nodes[j].(*EmbeddedNode).UUID
	})
	return nodes, nil
}

func (e *Embedded) ByUUID(ctx context.Context, uuid string) (Node, error) {
	var node Node
	nn, er := e.List(ctx)
	if er != nil {
		return nil, er
	}
	for _, n := range nn {
		if n.AsTemplate().UUID == uuid {
			node = n
			break
		}
	}
	if node == nil {
		return nil, serviceerrors.NotFound("template.not.found", "Cannot find template with this identifier")
	} else {
		return node, nil
	}
}

func (en *EmbeddedNode) IsLeaf() bool {
	return en.Template.Node.GetNode().IsLeaf()
}

func (en *EmbeddedNode) Read(ctx context.Context) (io.Reader, int64, error) {
	file, e := en.box.Open(en.embedPath)
	if e != nil {
		return nil, 0, e
	}
	data, _ := io.ReadAll(file)
	file.Close()
	r := bytes.NewReader(data)
	return r, int64(len(data)), nil
}

func (en *EmbeddedNode) AsTemplate() *rest.Template {
	return en.Template
}
