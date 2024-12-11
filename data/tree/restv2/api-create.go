package restv2

import (
	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
)

// Create creates folders or files - Files are empty or hydrated from a template
func (h *Handler) Create(req *restful.Request, resp *restful.Response) error {
	input := &rest.CreateRequest{}
	if err := req.ReadEntity(input); err != nil {
		return err
	}
	ctx := req.Request.Context()

	legacyReq := &rest.CreateNodesRequest{
		Recursive: input.Recursive,
	}
	for _, n := range input.GetInputs() {
		node := &tree.Node{
			Path: n.GetLocator().GetPath(),
			Type: n.GetType(),
		}
		// Todo - if multiple templates, run multiple times
		if tpl := n.GetTemplateUuid(); tpl != "" {
			legacyReq.TemplateUUID = tpl
		}
		if cType := n.GetContentType(); cType != "" {
			node.MustSetMeta(common.MetaNamespaceMime, cType)
		}
		legacyReq.Nodes = append(legacyReq.Nodes, node)
	}
	nn, er := h.TreeHandler.MkDirsOrFiles(ctx, legacyReq)
	if er != nil {
		return er
	}
	output := &rest.NodeCollection{
		Nodes: h.TreeNodesToNodes(nn),
	}
	return resp.WriteEntity(output)
}
