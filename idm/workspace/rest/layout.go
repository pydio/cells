package rest

import (
	"context"
	"fmt"
	"strings"

	"google.golang.org/protobuf/encoding/protojson"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/commons/docstorec"
	"github.com/pydio/cells/v5/common/client/commons/idmc"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/docstore"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/uuid"
)

// InstallLayout gets defaults layout from config for template paths and workspaces and install them
func InstallLayout(ctx context.Context) error {
	var templates []*tree.Node
	if config.Get(ctx, "defaults/layout/templates").Scan(&templates) == nil && len(templates) > 0 {
		// Set up templates in docstore
		dcClient := docstorec.DocStoreClient(ctx)
		for _, template := range templates {
			log.Logger(ctx).Info("Installing template " + template.Uuid)
			jsonTpl, _ := protojson.Marshal(template)
			if _, e := dcClient.GetDocument(ctx, &docstore.GetDocumentRequest{
				StoreID:    common.DocStoreIdVirtualNodes,
				DocumentID: template.Uuid,
			}); e == nil {
				log.Logger(ctx).Info("- ignoring as it already exists.")
			}
			_, er := dcClient.PutDocument(ctx, &docstore.PutDocumentRequest{
				DocumentID: template.Uuid,
				StoreID:    common.DocStoreIdVirtualNodes,
				Document: &docstore.Document{
					ID:    template.Uuid,
					Owner: common.PydioSystemUsername,
					Data:  string(jsonTpl),
				},
			})
			if er != nil {
				return er
			}
			log.Logger(ctx).Info("- template inserted.")
		}
	}
	var workspaces []*idm.Workspace
	if config.Get(ctx, "defaults/layout/workspaces").Scan(&workspaces) == nil && len(workspaces) > 0 {
		wsClient := idmc.WorkspaceServiceClient(ctx)
		for _, workspace := range workspaces {
			if len(workspace.RootUUIDs) != 1 {
				return errors.New("default workspace definition must contain exactly one root uuid")
			}
			ws := &idm.Workspace{
				UUID:        uuid.New(),
				Label:       workspace.Label,
				Description: workspace.Description,
				Slug:        workspace.Slug,
				Scope:       idm.WorkspaceScope_ADMIN,
			}
			perms := workspace.LoadAttributes().DefaultRights
			rootUuid := workspace.RootUUIDs[0]
			rootPath := rootUuid
			if strings.HasPrefix(rootUuid, "DATASOURCE:") {
				rootPath = strings.TrimPrefix(rootUuid, "DATASOURCE:")
			}
			log.Logger(ctx).Info("Installing workspace " + workspace.Label + " with '" + perms + "' permissions")
			if er := createWs(ctx, wsClient, ws, rootUuid, rootPath, perms); er != nil {
				return er
			}
		}
	}

	return nil
}

var (
	initialPolicies = []*service.ResourcePolicy{
		{Subject: permissions.PolicySubjectProfilePrefix + common.PydioProfileStandard, Action: service.ResourcePolicyAction_READ, Effect: service.ResourcePolicy_allow},
		{Subject: permissions.PolicySubjectProfilePrefix + common.PydioProfileAdmin, Action: service.ResourcePolicyAction_WRITE, Effect: service.ResourcePolicy_allow},
	}
)

func createWs(ctx context.Context, wsClient idm.WorkspaceServiceClient, ws *idm.Workspace, rootUuid string, rootPath string, rootPerms string) error {

	ws.Scope = idm.WorkspaceScope_ADMIN
	ws.Policies = initialPolicies

	if w, er := permissions.SearchUniqueWorkspace(ctx, "", ws.Slug); er == nil && w != nil {
		// Workspace was found, exit now, avoid creating duplicates
		log.Logger(ctx).Info(fmt.Sprintf("Ignoring creation of %s workspace as it already exists", ws.Label))
		return nil
	}

	if _, e := wsClient.CreateWorkspace(ctx, &idm.CreateWorkspaceRequest{Workspace: ws}); e != nil {
		return e
	}
	acls := []*idm.ACL{
		{NodeID: rootUuid, Action: &idm.ACLAction{Name: permissions.AclWsrootActionName, Value: rootPath}, WorkspaceID: ws.UUID},
		{NodeID: rootUuid, Action: permissions.AclRecycleRoot, WorkspaceID: ws.UUID},
	}
	if strings.Contains(rootPerms, "r") {
		acls = append(acls, &idm.ACL{NodeID: rootUuid, Action: permissions.AclRead, RoleID: "ROOT_GROUP", WorkspaceID: ws.UUID})
	}
	if strings.Contains(rootPerms, "w") {
		acls = append(acls, &idm.ACL{NodeID: rootUuid, Action: permissions.AclWrite, RoleID: "ROOT_GROUP", WorkspaceID: ws.UUID})
	}

	log.Logger(ctx).Info("Settings ACLs for workspace")
	aclClient := idmc.ACLServiceClient(ctx) //idm.NewACLServiceClient(grpc.ResolveConn(ctx, common.ServiceAcl))
	for _, acl := range acls {
		_, e := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl})
		if e != nil {
			return e
		}
	}
	return nil
}
