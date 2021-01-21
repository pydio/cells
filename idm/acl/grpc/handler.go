package grpc

import (
	"context"
	"time"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/idm/acl"
)

// Handler definition
type Handler struct {
}

// CreateACL in database
func (h *Handler) CreateACL(ctx context.Context, req *idm.CreateACLRequest, resp *idm.CreateACLResponse) error {

	dao := servicecontext.GetDAO(ctx).(acl.DAO)

	if err := dao.Add(req.ACL); err != nil {
		return err
	}

	resp.ACL = req.ACL

	client.Publish(ctx, client.NewPublication(common.TopicIdmEvent, &idm.ChangeEvent{
		Type: idm.ChangeEventType_UPDATE,
		Acl:  req.ACL,
	}))

	return nil
}

// ExpireACL in database
func (h *Handler) ExpireACL(ctx context.Context, req *idm.ExpireACLRequest, resp *idm.ExpireACLResponse) error {

	dao := servicecontext.GetDAO(ctx).(acl.DAO)

	numRows, err := dao.SetExpiry(req.Query, time.Unix(req.Timestamp, 0))
	if err != nil {
		return err
	}

	resp.Rows = numRows

	return nil
}

// DeleteACL from database
func (h *Handler) DeleteACL(ctx context.Context, req *idm.DeleteACLRequest, response *idm.DeleteACLResponse) error {

	dao := servicecontext.GetDAO(ctx).(acl.DAO)

	acls := new([]interface{})
	if err := dao.Search(req.Query, acls); err != nil {
		return err
	}

	numRows, err := dao.Del(req.Query)
	response.RowsDeleted = numRows
	if err == nil {
		for _, in := range *acls {
			if val, ok := in.(*idm.ACL); ok {
				client.Publish(ctx, client.NewPublication(common.TopicIdmEvent, &idm.ChangeEvent{
					Type: idm.ChangeEventType_DELETE,
					Acl:  val,
				}))
			}
		}
	}
	return err
}

// SearchACL in database
func (h *Handler) SearchACL(ctx context.Context, request *idm.SearchACLRequest, response idm.ACLService_SearchACLStream) error {

	dao := servicecontext.GetDAO(ctx).(acl.DAO)

	acls := new([]interface{})
	if err := dao.Search(request.Query, acls); err != nil {
		return err
	}

	for _, in := range *acls {
		val, ok := in.(*idm.ACL)
		if !ok {
			return errors.InternalServerError(common.ServiceAcl, "Wrong type")
		}

		response.Send(&idm.SearchACLResponse{ACL: val})
	}

	response.Close()

	return nil
}

// StreamACL from database
func (h *Handler) StreamACL(ctx context.Context, streamer idm.ACLService_StreamACLStream) error {

	dao := servicecontext.GetDAO(ctx).(acl.DAO)

	defer streamer.Close()

	for {
		incoming, err := streamer.Recv()
		if incoming == nil || err != nil {
			break
		}

		acls := new([]interface{})
		if err := dao.Search(incoming.Query, acls); err != nil {
			return err
		}

		for _, in := range *acls {
			if val, ok := in.(*idm.ACL); ok {
				streamer.Send(&idm.SearchACLResponse{ACL: val})
			}
		}

		streamer.Send(nil)
	}

	return nil
}
