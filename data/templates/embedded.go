package templates

import (
	"bytes"
	"io"
	"path"
	"sort"
	"strings"

	"github.com/micro/go-micro/errors"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/packr"
)

func init() {
	RegisterProvider(NewEmbedded())
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
	data := en.box.Bytes(en.Template.Node.EmbedPath)
	r := bytes.NewReader(data)
	return r, int64(len(data)), nil
}

func (en *EmbeddedNode) AsTemplate() *rest.Template {
	return &en.Template
}
