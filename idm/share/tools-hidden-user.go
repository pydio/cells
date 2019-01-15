package share

import (
	"context"
	"fmt"
	"strings"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/errors"
	"github.com/pborman/uuid"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils"
)

// GetOrCreateHiddenUser will load or create a user to create a ShareLink with.
func GetOrCreateHiddenUser(ctx context.Context, link *rest.ShareLink, passwordEnabled bool, updatePassword string) (user *idm.User, err error) {

	// Create or Load corresponding Hidden User
	uClient := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())
	roleClient := idm.NewRoleServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ROLE, defaults.NewClient())
	if link.UserLogin == "" {
		claims := ctx.Value(claim.ContextKey).(claim.Claims)
		newUuid := strings.Replace(uuid.NewUUID().String(), "-", "", -1)
		login := newUuid[0:16]
		password := login + PasswordComplexitySuffix
		if passwordEnabled {
			if len(updatePassword) == 0 {
				return nil, errors.BadRequest(common.SERVICE_SHARE, "Please provide a non empty password!")
			}
			password = updatePassword
		}
		if len(link.Policies) == 0 {
			// Apply default policies and make sure user can read himself
			link.Policies = OwnerResourcePolicies(ctx, newUuid)
			link.Policies = append(link.Policies, &service.ResourcePolicy{
				Resource: newUuid,
				Subject:  fmt.Sprintf("user:%s", login),
				Action:   service.ResourcePolicyAction_READ,
				Effect:   service.ResourcePolicy_allow,
			})
		}
		resp, e := uClient.CreateUser(ctx, &idm.CreateUserRequest{User: &idm.User{
			Uuid:      newUuid,
			Login:     login,
			Password:  password,
			GroupPath: claims.GroupPath,
			Policies:  link.Policies,
			Attributes: map[string]string{
				"profile": "shared",
				"hidden":  "true",
			},
		}})
		if e != nil {
			return nil, e
		}
		user = resp.User
		// Create associated role
		_, e = roleClient.CreateRole(ctx, &idm.CreateRoleRequest{Role: &idm.Role{
			Uuid:     user.Uuid,
			Label:    user.Login,
			UserRole: true,
			Policies: link.Policies,
		}})
		if e != nil {
			return nil, e
		}

	} else {

		uQ, _ := ptypes.MarshalAny(&idm.UserSingleQuery{Login: link.UserLogin})
		stream, e := uClient.SearchUser(ctx, &idm.SearchUserRequest{Query: &service.Query{SubQueries: []*any.Any{uQ}}})
		if e != nil {
			return nil, e
		}
		defer stream.Close()
		for {
			rsp, e := stream.Recv()
			if e != nil {
				break
			}
			user = rsp.User
			break
		}

	}

	return
}

// UpdateACLsForHiddenUser deletes and replaces access ACLs for a hidden user.
func UpdateACLsForHiddenUser(ctx context.Context, roleId string, workspaceId string, rootNodes []*tree.Node, permissions []rest.ShareLinkAccessType, update bool) error {

	HasRead := false
	HasWrite := false
	for _, perm := range permissions {
		if perm == rest.ShareLinkAccessType_Download || perm == rest.ShareLinkAccessType_Preview {
			HasRead = true
		}
		if perm == rest.ShareLinkAccessType_Upload {
			HasWrite = true
		}
	}

	aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())
	if update {
		// Delete all existing acls for existing user
		q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{RoleIDs: []string{roleId}})
		_, e := aclClient.DeleteACL(ctx, &idm.DeleteACLRequest{Query: &service.Query{SubQueries: []*any.Any{q}}})
		if e != nil {
			return e
		}
	}

	if !HasRead && !HasWrite {
		return nil
	}

	acls, err := GetTemplateACLsForMinisite(ctx, roleId, permissions, aclClient)
	if err != nil {
		return err
	}
	for _, rootNode := range rootNodes {
		if HasRead {
			acls = append(acls, &idm.ACL{
				RoleID:      roleId,
				WorkspaceID: workspaceId,
				NodeID:      rootNode.Uuid,
				Action:      utils.ACL_READ,
			})
		}

		if HasWrite {
			acls = append(acls, &idm.ACL{
				RoleID:      roleId,
				WorkspaceID: workspaceId,
				NodeID:      rootNode.Uuid,
				Action:      utils.ACL_WRITE,
			})
		}
	}
	// Add default Repository Id for the role
	acls = append(acls, &idm.ACL{
		RoleID:      roleId,
		WorkspaceID: "PYDIO_REPO_SCOPE_ALL",
		Action: &idm.ACLAction{
			Name:  "parameter:core.conf:DEFAULT_START_REPOSITORY",
			Value: workspaceId,
		},
	})

	for _, acl := range acls {
		_, e := aclClient.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl})
		if e != nil {
			return e
		}
	}

	return nil
}
