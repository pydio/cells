package restv2

import (
	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/scheduler/jobs/userspace"
)

// Create creates folders or files - Files are empty or hydrated from a template
// Api Endpoint: POST /node/create
func (h *Handler) Create(req *restful.Request, resp *restful.Response) error {
	input := &rest.CreateRequest{}
	if err := req.ReadEntity(input); err != nil {
		return err
	}
	ctx := req.Request.Context()

	byTpl := map[string][]*tree.Node{}
	for _, n := range input.GetInputs() {
		node := &tree.Node{
			Path: n.GetLocator().GetPath(),
			Type: n.GetType(),
		}
		if cType := n.GetContentType(); cType != "" {
			node.MustSetMeta(common.MetaNamespaceMime, cType)
		}
		tpl := n.GetTemplateUuid()
		byTpl[tpl] = append(byTpl[tpl], node)
	}
	output := &rest.NodeCollection{}
	// tpl may be an empty string
	for tpl, nodes := range byTpl {
		nn, er := userspace.MkDirsOrFiles(ctx, h.TreeHandler.GetRouter(), nodes, input.Recursive, tpl)
		if er != nil {
			return er
		}
		output.Nodes = append(output.Nodes, h.TreeNodesToNodes(nn)...)
	}
	return resp.WriteEntity(output)
}
