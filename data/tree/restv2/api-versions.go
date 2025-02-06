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
			mapFilter["draftStatus"] = "\"draft\""
		} else {
			mapFilter["draftStatus"] = "\"published\""
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
	_, claims := permissions.FindUserNameInContext(ctx)
	var versions []*rest.Version // Create an empty array on purpose
	err := commons.ForEach(st, er, func(response *tree.ListVersionsResponse) error {
		// Show only current user's drafts
		vr := response.GetVersion()
		if vr.Draft && vr.OwnerUuid != claims.Subject {
			return nil
		}
		versions = append(versions, &rest.Version{
			VersionId:   vr.GetVersionId(),
			Description: vr.GetDescription(),
			Draft:       vr.GetDraft(),
			IsHead:      vr.GetIsHead(),
			MTime:       vr.GetMTime(),
			Size:        vr.GetSize(),
			ETag:        vr.GetETag(),
			ContentHash: vr.GetContentHash(),
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

	pathClient := compose.PathClient()
	_, err := h.promoteDraftVersion(ctx, targetNode, versionUuid, pathClient, nil)
	if err != nil {
		return err
	}

	var published bool
	if input.Publish {
		var ctxWorkspace *idm.Workspace
		if bi, err := pathClient.BranchInfoForNode(ctx, targetNode); err == nil && bi.Workspace != nil {
			ctxWorkspace = bi.Workspace
		}
		if ns, ok := h.UserMetaHandler.DraftMetaNamespace(ctx, ctxWorkspace); ok && (targetNode.GetMetaBool(ns) || targetNode.GetMetaBool(common.MetaNamespaceNodeDraftMode)) {
			log.Logger(ctx).Info("Now publish this node")
			if er := h.publishDraftNode(ctx, targetNode, ns, nil); er != nil {
				return er
			} else {
				published = true
			}
		}
	}
	// Re-read updated node
	if tgr, err := pathClient.ReadNode(ctx, &tree.ReadNodeRequest{Node: targetNode}); err == nil {
		targetNode = tgr.GetNode()
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

	nodeUuid := req.PathParameter("Uuid")
	input := &rest.PublishNodeParameters{}
	if err := req.ReadEntity(input); err != nil {
		return err
	}

	rN, er := h.UuidClient(true).ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: nodeUuid}})
	if er != nil {
		return er
	}
	pc := compose.PathClient()
	var ctxWorkspace *idm.Workspace
	if bi, err := pc.BranchInfoForNode(ctx, rN.GetNode()); err == nil && bi.Workspace != nil {
		ctxWorkspace = bi.Workspace
	}
	ns, ok := h.UserMetaHandler.DraftMetaNamespace(ctx, ctxWorkspace)
	if !ok {
		return errors.WithMessage(errors.InvalidParameters, "no draft meta namespace defined")
	}

	mcl := idm.NewUserMetaServiceClient(grpc.ResolveConn(ctx, common.ServiceUserMetaGRPC))

	node := rN.GetNode()
	if er = h.publishDraftNode(ctx, node, ns, mcl); er != nil {
		return er
	}

	var cascades []*rest.PublishCascadeResult
	if !node.IsLeaf() && input.Cascade {
		// Loop on children and publish them
		vcl := versionClient(ctx)
		st, se := pc.ListNodes(ctx, &tree.ListNodesRequest{Node: node, Recursive: true})
		er = commons.ForEach(st, se, func(response *tree.ListNodesResponse) (ignore error) {
			child := response.GetNode()
			res := &rest.PublishCascadeResult{
				Node: h.TreeNodeToNode(child),
			}
			if child.IsLeaf() {
				rev, pe := h.promoteDraftVersion(ctx, child, "", pc, vcl)
				if pe != nil {
					res.Error = pe.Error()
					cascades = append(cascades, res)
					return
				}
				if rev != nil {
					log.Logger(ctx).Info("Promoted draft version", child.ZapPath(), rev.Zap())
					res.Promoted = true
				}
			}
			if pe := h.publishDraftNode(ctx, child, ns, mcl); pe != nil {
				res.Error = pe.Error()
			} else {
				res.Success = true
			}
			cascades = append(cascades, res)
			return
		})
		if er != nil {
			return er
		}
	}

	return resp.WriteEntity(&rest.PublishNodeResponse{Node: h.TreeNodeToNode(node), CascadeResults: cascades})

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

func (h *Handler) publishDraftNode(ctx context.Context, node *tree.Node, draftNS string, client idm.UserMetaServiceClient) error {
	if client == nil {
		client = idm.NewUserMetaServiceClient(grpc.ResolveConn(ctx, common.ServiceUserMetaGRPC))
	}
	_, er := client.UpdateUserMeta(ctx, &idm.UpdateUserMetaRequest{
		Operation: idm.UpdateUserMetaRequest_DELETE,
		MetaDatas: []*idm.UserMeta{{
			NodeUuid:     node.GetUuid(),
			Namespace:    draftNS,
			ResolvedNode: node,
		}},
	})
	return er
}

func (h *Handler) promoteDraftVersion(ctx context.Context, targetNode *tree.Node, versionUuid string, nodesCli nodes.Handler, versionCli tree.NodeVersionerClient) (*tree.ContentRevision, error) {
	if versionCli == nil {
		versionCli = versionClient(ctx)
	}
	var revision *tree.ContentRevision
	_, cl := permissions.FindUserNameInContext(ctx)
	if versionUuid != "" {
		hr, er := versionCli.HeadVersion(ctx, &tree.HeadVersionRequest{NodeUuid: targetNode.GetUuid(), VersionId: versionUuid})
		if er != nil {
			return nil, er
		}
		revision = hr.GetVersion()
		if revision.GetDraft() && cl.Subject != revision.GetOwnerUuid() {
			return nil, errors.WithMessage(errors.StatusForbidden, "you are not allowed to promote this draft")
		}
	} else {
		st, er := versionCli.ListVersions(ctx, &tree.ListVersionsRequest{Node: targetNode, Filters: map[string]string{"draftStatus": "\"draft\""}})
		err := commons.ForEach(st, er, func(response *tree.ListVersionsResponse) error {
			if revision != nil || !(response.GetVersion().GetDraft() && cl.Subject == response.GetVersion().GetOwnerUuid()) {
				return nil
			}
			revision = response.GetVersion()
			return nil
		})
		if err != nil {
			return nil, err
		}
		if revision == nil {
			// No revisions found to promote
			return nil, nil
		}
	}

	log.Logger(ctx).Info("Should now promote this revision: ", revision.Zap())
	// Copy draft version as new content - this should create a new version, we can remove this draft afterward
	if _, er := nodesCli.CopyObject(ctx, targetNode, targetNode, &models.CopyRequestData{SrcVersionId: revision.GetVersionId()}); er != nil {
		log.Logger(ctx).Error("Cannot switch latest to head", zap.Error(er))
		return nil, er
	}
	if revision.GetDraft() {
		if _, er := versionCli.DeleteVersion(ctx, &tree.HeadVersionRequest{NodeUuid: targetNode.GetUuid(), VersionId: revision.GetVersionId()}); er != nil {
			log.Logger(ctx).Error("Cannot delete draft version", zap.Error(er))
		} else if _, er2 := compose.PathClient(nodes.AsAdmin()).DeleteNode(ctx, &tree.DeleteNodeRequest{Node: revision.GetLocation()}); er2 == nil {
			log.Logger(ctx).Info("Deleted version blob", revision.GetLocation().Zap())
		} else {
			log.Logger(ctx).Error("Could not delete draft version blob", revision.GetLocation().Zap())
		}
	}
	return revision, nil
}
