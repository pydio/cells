package restv2

import (
	"context"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/commons"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/compose"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

func versionClient(ctx context.Context) tree.NodeVersionerClient {
	return tree.NewNodeVersionerClient(grpc.ResolveConn(ctx, common.ServiceVersionsGRPC))
}

// NodeVersions lists all versions of a node
func (h *Handler) NodeVersions(req *restful.Request, resp *restful.Response) error {

	nodeUuid := req.PathParameter("Uuid")
	ctx := req.Request.Context()
	filter := &rest.NodeVersionsFilter{}
	if err := req.ReadEntity(filter); err != nil {
		return err
	}

	rn, er := h.UuidClient(true).ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: nodeUuid}})
	if er != nil {
		return er
	}
	var mapFilter map[string]string
	if filter.FilterBy != rest.VersionsTypes_VersionsAll {
		mapFilter = make(map[string]string)
		if filter.FilterBy == rest.VersionsTypes_DraftsOnly {
			mapFilter["draftStatus"] = "draft"
		} else {
			mapFilter["draftStatus"] = "published"
		}
	}
	vcl := versionClient(ctx)
	st, er := vcl.ListVersions(ctx, &tree.ListVersionsRequest{
		Node:      rn.GetNode(),
		Limit:     filter.GetLimit(),
		Offset:    filter.GetOffset(),
		SortField: filter.GetSortField(),
		SortDesc:  filter.GetSortDirDesc(),
		Filters:   mapFilter,
	})
	versions := []*rest.Version{} // Create an empty array on purpose
	err := commons.ForEach(st, er, func(response *tree.ListVersionsResponse) error {
		vr := response.GetVersion()
		versions = append(versions, &rest.Version{
			VersionId:   vr.GetVersionId(),
			Description: vr.GetDescription(),
			Draft:       vr.GetDraft(),
			IsHead:      vr.GetIsHead(),
			MTime:       vr.GetMTime(),
			Size:        vr.GetSize(),
			ETag:        vr.GetETag(),
			OwnerName:   vr.GetOwnerName(),
			OwnerUuid:   vr.GetOwnerUuid(),
		})
		return nil
	})
	if err != nil {
		return err
	}
	return resp.WriteEntity(&rest.VersionCollection{Versions: versions})

}

func (h *Handler) PromoteVersion(req *restful.Request, resp *restful.Response) error {

	ctx := req.Request.Context()
	nodeUuid := req.PathParameter("Uuid")
	r, e := h.UuidClient(true).ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: nodeUuid}})
	if e != nil {
		return e
	}
	targetNode := r.GetNode()

	versionUuid := req.PathParameter("VersionId")
	input := &rest.PromoteParameters{}
	if err := req.ReadEntity(input); err != nil {
		return err
	}
	vcl := versionClient(ctx)
	hr, er := vcl.HeadVersion(ctx, &tree.HeadVersionRequest{NodeUuid: nodeUuid, VersionId: versionUuid})
	if er != nil {
		return er
	}
	revision := hr.GetVersion()
	_, cl := permissions.FindUserNameInContext(ctx)
	if revision.GetDraft() && cl.Subject != revision.GetOwnerUuid() {
		return errors.WithMessage(errors.StatusForbidden, "you are not allowed to promote this draft")
	}

	log.Logger(ctx).Info("Should now promote this revision: ", hr.GetVersion().Zap())
	// Copy draft version as new content - this should create a new version, we can remove this draft afterward
	pc := compose.PathClient()
	if _, er = pc.CopyObject(ctx, targetNode, targetNode, &models.CopyRequestData{SrcVersionId: hr.GetVersion().VersionId}); er != nil {
		log.Logger(ctx).Error("Cannot switch latest to head", zap.Error(er))
		return er
	}
	if revision.GetDraft() {
		if _, er = vcl.DeleteVersion(ctx, &tree.HeadVersionRequest{NodeUuid: nodeUuid, VersionId: versionUuid}); er != nil {
			log.Logger(ctx).Error("Cannot delete draft version", zap.Error(er))
		} else if _, er2 := compose.PathClient(nodes.AsAdmin()).DeleteNode(ctx, &tree.DeleteNodeRequest{Node: revision.GetLocation()}); er2 == nil {
			log.Logger(ctx).Info("Deleted version blob", revision.GetLocation().Zap())
		} else {
			log.Logger(ctx).Error("Could not delete draft version blob", revision.GetLocation().Zap())
		}
	}

	var published bool
	if input.Publish {
		ns, _ := h.UserMetaHandler.DraftMetaNamespace(ctx)
		if targetNode.GetMetaBool(ns) {
			log.Logger(ctx).Info("Should also publish this node")
			mcl := idm.NewUserMetaServiceClient(grpc.ResolveConn(ctx, common.ServiceUserMetaGRPC))
			_, er = mcl.UpdateUserMeta(ctx, &idm.UpdateUserMetaRequest{
				Operation: idm.UpdateUserMetaRequest_DELETE,
				MetaDatas: []*idm.UserMeta{{
					NodeUuid:     targetNode.GetUuid(),
					Namespace:    ns,
					ResolvedNode: targetNode,
				}},
			})
			if er != nil {
				return er
			} else {
				published = true
			}
		}
	}

	rsp := &rest.PromoteVersionResponse{
		Node:      h.TreeNodeToNode(targetNode),
		Success:   true,
		Published: published,
	}

	return resp.WriteEntity(rsp)
}

func (h *Handler) PublishNode(req *restful.Request, resp *restful.Response) error {

	ctx := req.Request.Context()

	ns, ok := h.UserMetaHandler.DraftMetaNamespace(ctx)
	if !ok {
		return errors.WithMessage(errors.InvalidParameters, "no draft meta namespace defined")
	}

	nodeUuid := req.PathParameter("Uuid")
	input := &rest.PublishNodeParameters{}
	if err := req.ReadEntity(input); err != nil {
		return err
	}

	rN, er := h.UuidClient(true).ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: nodeUuid}})
	if er != nil {
		return er
	}

	node := rN.GetNode()
	if !node.IsLeaf() && input.Cascade {
		// DO SOMETHING WITH CHILDREN
	}

	mcl := idm.NewUserMetaServiceClient(grpc.ResolveConn(ctx, common.ServiceUserMetaGRPC))
	_, er = mcl.UpdateUserMeta(ctx, &idm.UpdateUserMetaRequest{
		Operation: idm.UpdateUserMetaRequest_DELETE,
		MetaDatas: []*idm.UserMeta{{
			NodeUuid:     node.GetUuid(),
			Namespace:    ns,
			ResolvedNode: node,
		}},
	})
	if er != nil {
		return er
	}

	return resp.WriteEntity(&rest.PublishNodeResponse{Node: h.TreeNodeToNode(node)})

}

func (h *Handler) DeleteVersion(req *restful.Request, resp *restful.Response) error {

	ctx := req.Request.Context()
	nodeUuid := req.PathParameter("Uuid")
	versionUuid := req.PathParameter("VersionId")
	router := h.UuidClient(false)

	rn, er := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: nodeUuid}})
	if er != nil {
		return er
	}
	targetNode := rn.GetNode()

	vcl := versionClient(ctx)
	st, er := vcl.ListVersions(ctx, &tree.ListVersionsRequest{Node: targetNode})
	var vv []*tree.ContentRevision
	var v *tree.ContentRevision
	_, cl := permissions.FindUserNameInContext(ctx)
	er = commons.ForEach(st, er, func(response *tree.ListVersionsResponse) error {
		if response.GetVersion().VersionId == versionUuid && response.GetVersion().OwnerUuid == cl.Subject {
			v = response.GetVersion()
		} else {
			vv = append(vv, response.GetVersion())
		}
		return nil
	})
	if er != nil {
		return er
	}
	if v == nil {
		return errors.WithStack(errors.VersionNotFound)
	}

	log.Logger(ctx).Info("Should delete this version: ", v.Zap())
	if _, er = vcl.DeleteVersion(ctx, &tree.HeadVersionRequest{NodeUuid: nodeUuid, VersionId: versionUuid}); er != nil {
		log.Logger(ctx).Error("Cannot delete draft version", zap.Error(er))
	} else if _, er2 := compose.PathClient(nodes.AsAdmin()).DeleteNode(ctx, &tree.DeleteNodeRequest{Node: v.GetLocation()}); er2 == nil {
		log.Logger(ctx).Info("Deleted version blob", v.GetLocation().Zap())
	} else {
		log.Logger(ctx).Error("Could not delete draft version blob", v.GetLocation().Zap())
	}

	if len(vv) == 0 {
		log.Logger(ctx).Info("Now we should also delete the node it it has no more versions")
		if _, er = router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: targetNode, Silent: true}); er != nil {
			return er
		}
	}

	rsp := &rest.PromoteVersionResponse{}

	return resp.WriteEntity(rsp)
}
