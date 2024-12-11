package restv2

import (
	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v5/common/proto/rest"
)

// CreatePublicLink responds to POST /node/link
// Input rest.ShareLink | Output rest.ShareLink
func (h *Handler) CreatePublicLink(req *restful.Request, resp *restful.Response) error {
	in := &rest.UpsertPublicLinkRequest{}
	if err := req.ReadEntity(in); err != nil {
		return err
	}
	ctx := req.Request.Context()

	link, er := h.SharesHandler.PutOrUpdateShareLink(ctx, in.GetLink(), in)
	if er != nil {
		return er
	}

	return resp.WriteEntity(link)
}

// UpdatePublicLink responds to PATCH /node/link/{Uuid}
// Input rest.UpdatePublicLinkRequest | Output rest.ShareLink, Path Parameters {Uuid}
func (h *Handler) UpdatePublicLink(req *restful.Request, resp *restful.Response) error {
	in := &rest.UpsertPublicLinkRequest{}
	if err := req.ReadEntity(in); err != nil {
		return err
	}
	if in.Link.Uuid == "" {
		in.Link.Uuid = req.PathParameter("Uuid")
	}

	ctx := req.Request.Context()

	link, er := h.SharesHandler.PutOrUpdateShareLink(ctx, in.GetLink(), in)
	if er != nil {
		return er
	}

	return resp.WriteEntity(link)
}

// GetPublicLink responds to GET /node/link/{Uuid}
// Input rest.PublicLinkUuidRequest | Output rest.ShareLink
func (h *Handler) GetPublicLink(req *restful.Request, resp *restful.Response) error {
	uuid := req.PathParameter("Uuid")
	ctx := req.Request.Context()

	link, er := h.SharesHandler.GetShareClient().LinkById(ctx, uuid)
	if er != nil {
		return er
	}
	return resp.WriteEntity(link)
}

// DeletePublicLink responds to DELETE /node/link/{Uuid}
// Input rest.PublicLinkUuidRequest | Output rest.PublicLinkDeleteSuccess
func (h *Handler) DeletePublicLink(req *restful.Request, resp *restful.Response) error {
	uuid := req.PathParameter("Uuid")
	ctx := req.Request.Context()

	err := h.SharesHandler.GetShareClient().DeleteLink(ctx, uuid)
	if err != nil {
		return err
	}

	return resp.WriteEntity(&rest.PublicLinkDeleteSuccess{
		Uuid:    uuid,
		Message: "Successfully deleted",
	})
}
