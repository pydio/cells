package restv2

import (
	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/scheduler/jobs/userspace"
)

// Templates forwards call to TemplatesHandler (same i/o format)
func (h *Handler) Templates(req *restful.Request, resp *restful.Response) error {
	return h.TemplatesHandler.ListTemplates(req, resp)
}

// CreateSelection forwards to userspace.PersistSelection
func (h *Handler) CreateSelection(req *restful.Request, resp *restful.Response) error {

	var input rest.Selection
	if e := req.ReadEntity(&input); e != nil {
		return e
	} else if len(input.Nodes) == 0 {
		return errors.WithMessage(errors.InvalidParameters, "please provide at least one node")
	}
	// Transform incoming node format to internal one
	var nn []*tree.Node
	for _, node := range input.Nodes {
		nn = append(nn, &tree.Node{Path: node.Path})
	}
	selectionUuid, err := userspace.PersistSelection(req.Request.Context(), nn)
	if err != nil {
		return err
	}
	response := &rest.Selection{
		Uuid:  selectionUuid,
		Nodes: input.Nodes,
	}
	return resp.WriteEntity(response)

}
