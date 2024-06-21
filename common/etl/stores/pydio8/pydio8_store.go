/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package pydio8

import (
	"context"
	"fmt"
	"net/url"
	"path"
	"strings"

	"github.com/go-openapi/runtime"
	httptransport "github.com/go-openapi/runtime/client"
	"go.uber.org/zap"

	"github.com/pydio/pydio-sdk-go/client/provisioning"
	sdkconfig "github.com/pydio/pydio-sdk-go/config"
	models2 "github.com/pydio/pydio-sdk-go/models"
	"github.com/pydio/pydio-sdk-go/shares"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/etl/models"
	"github.com/pydio/cells/v4/common/etl/stores"
	"github.com/pydio/cells/v4/common/permissions"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/rest"
	service "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/log"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

func init() {
	stores.RegisterStore("pydio8", func(options *stores.Options) (interface{}, error) {

		rawurl, ok := options.Params["url"]
		if !ok {
			return nil, fmt.Errorf("missing url parameter")
		}

		user, ok := options.Params["user"]
		if !ok {
			return nil, fmt.Errorf("missing user parameter")
		}

		password, ok := options.Params["password"]
		if !ok {
			return nil, fmt.Errorf("missing password parameter")
		}

		u, err := url.Parse(rawurl)
		if err != nil {
			return nil, fmt.Errorf("could not parse url")
		}

		conf := &sdkconfig.SdkConfig{
			Protocol: u.Scheme,
			Url:      u.Host,
			Path:     u.Path,
			User:     user,
			Password: password,
		}

		if skipVerify, ok := options.Params["skipVerify"]; ok && skipVerify == "true" {
			conf.SkipVerify = true
		}

		src := "pydio8" + u.Host
		options.MergeOptions.AuthSource = src
		options.MergeOptions.RolePrefix = src
		options.MergeOptions.Origin = src
		return NewPydio8UserStore(conf), nil
	})
}

// Pydio8Store implements what it takes to communicate with a Pydio8 entity
type Pydio8Store struct {
	Config      *sdkconfig.SdkConfig
	sharesCache map[string]*shares.Share
}

func NewPydio8UserStore(c *sdkconfig.SdkConfig) *Pydio8Store {
	return &Pydio8Store{
		Config: c,
	}
}

// ListUsers from the pydio 8 api
func (s *Pydio8Store) ListUsers(ctx context.Context, params map[string]interface{}, progress chan float32) (map[string]*idm.User, error) {
	pa := "/"
	if p, ok := params["path"]; ok {
		pa = p.(string)
	}

	users, err := getUsersFromPath(s, pa, 1)
	if err != nil {
		return nil, err
	}

	ret := make(map[string]*idm.User)
	for _, u := range users {
		ret[u.Login] = u
	}

	return ret, nil
}

// ListGroups from the pydio 8 api
func (s *Pydio8Store) ListGroups(ctx context.Context, params map[string]interface{}) ([]*idm.User, error) {
	pa := "/"
	if p, ok := params["path"]; ok {
		pa = p.(string)
	}

	users, err := s.getGroupsFromPath(pa)
	if err != nil {
		return nil, err
	}

	var interfaceSlice = make([]*idm.User, len(users))
	for i, d := range users {
		interfaceSlice[i] = d
	}

	return interfaceSlice, nil
}

// Roles

func (s *Pydio8Store) getRoles(ctx context.Context, teams bool, userStore models.ReadableStore) ([]*idm.Role, error) {

	var roles []*idm.Role
	clientV1 := &ClientV1{}
	resp, e := clientV1.ListNonTechnicalRoles(teams, s.Config)
	if e != nil {
		return nil, e
	}
	builder := service.NewResourcePoliciesBuilder()
	for id, role := range resp {
		builder.Reset()
		var auto []string
		if len(role.AppliesTo) > 0 {
			auto = strings.Split(role.AppliesTo, ",")
		}
		idmRole := &idm.Role{
			Uuid:          id,
			Label:         role.RoleLabel,
			ForceOverride: role.ForceOverride,
			AutoApplies:   auto,
		}
		if role.OwnerId != "" {
			if targetUser, _, e := userStore.GetUserInfo(ctx, role.OwnerId, map[string]interface{}{}); e == nil {
				idmRole.IsTeam = true
				builder = builder.WithOwner(targetUser.Uuid)
				builder = builder.WithProfileRead(common.PydioProfileAdmin)
				builder = builder.WithProfileWrite(common.PydioProfileAdmin)
				builder = builder.WithUserRead(role.OwnerId)
				builder = builder.WithUserWrite(role.OwnerId)
			} else {
				log.Logger(ctx).Error("Got Role for team but cannot find user!")
				continue
			}
		} else {
			// SET DEFAULT POLICIES
			builder = builder.WithResourcePolicy(&service.ResourcePolicy{Subject: "*", Action: service.ResourcePolicyAction_READ})
			builder = builder.WithProfileWrite(common.PydioProfileAdmin)
		}
		idmRole.Policies = builder.Policies()
		roles = append(roles, idmRole)
	}

	return roles, nil
}

// ListRoles return a list of roles
func (s *Pydio8Store) ListRoles(ctx context.Context, userStore models.ReadableStore, params map[string]interface{}) ([]*idm.Role, error) {

	var teams bool
	if t, o := params["teams"]; o && t.(bool) {
		teams = true
	}

	return s.getRoles(ctx, teams, userStore)

}

// ListACLs returns acls from the pydio api
func (s *Pydio8Store) ListACLs(ctx context.Context, params map[string]interface{}) ([]*idm.ACL, error) {
	pa := "/"
	if p, ok := params["path"]; ok {
		pa = p.(string)
	}

	roleID := "/"
	if r, ok := params["roleID"]; ok {
		roleID = r.(string)
	}

	acls, err := s.getACLs(roleID, pa)
	if err != nil {
		return nil, err
	}

	var interfaceSlice = make([]*idm.ACL, len(acls))
	for i, d := range acls {
		interfaceSlice[i] = d
	}

	return interfaceSlice, nil
}

func (s *Pydio8Store) GetLdapDomainName() (string, error) {
	cV1 := &ClientV1{}
	if resp, e := cV1.GetDomainName(s.Config); e == nil {
		return resp.DomainName, nil
	}
	return "", nil
}

func getUsersFromPath(s *Pydio8Store, p string, page int64) ([]*idm.User, error) {

	log.Logger(context.Background()).Debug("P8Store:getUsersFromPath", zap.Any("path", p), zap.Any("page", page))
	builder := service.NewResourcePoliciesBuilder()

	var users []*idm.User

	httpClient := sdkconfig.GetHttpClient(s.Config)
	apiClient, ctx, err := sdkconfig.GetPreparedApiClient(s.Config)
	if err != nil {
		return nil, err
	}

	format := "json"

	params := &GetPeopleParams{
		Context:    ctx,
		HTTPClient: httpClient,
		Format:     &format,
		Path:       p,
		Page:       page,
	}

	c := &Client{apiClient}
	result, err := c.GetPeople(params)
	if err != nil {
		return nil, err
	}

	data := result.Payload.Data
	if data == nil {
		return nil, nil
	}
	log.Logger(context.Background()).Debug("Loaded a users page", zap.Int("count", len(data.Children)))
	cV1 := &ClientV1{}

	var contextDomain string
	// Load contextdomain

	if domain, e := cV1.GetDomainName(s.Config); e == nil {
		contextDomain = domain.DomainName
	}

	for key, node := range data.Children {
		if node.Type == "collection" {
			newUsers, err := getUsersFromPath(s, key, 1)

			if err != nil {
				log.Info("An error occurred while migrating group... Continuing", zap.Any("params", *params), zap.Error(err))
				return users, nil
			}

			users = append(users, newUsers...)
		} else {
			user := new(idm.User)

			groupPath := path.Dir(p + "/")
			if groupPath == "." {
				groupPath = "/"
			}
			user.GroupPath = groupPath

			var roles []*idm.Role

			if node.AjxpRoles != nil {
				d, _ := json.Marshal(node.AjxpRoles)
				var ajxpRoles map[string]string
				if err := json.Unmarshal(d, &ajxpRoles); err == nil {
					for _, ajxpRole := range ajxpRoles {
						role := new(idm.Role)
						role.Uuid = ajxpRole
						roles = append(roles, role)
					}
				}
			}

			user.Roles = roles
			user.Login = path.Base(key)
			user.IsGroup = false

			if len(user.Attributes) == 0 {
				user.Attributes = make(map[string]string)
			}

			type Plugin map[string]string
			type RepoScope map[string]Plugin

			if node.JSONMergedRole != nil && node.JSONMergedRole.PARAMETERS != nil {
				p, err := json.Marshal(node.JSONMergedRole.PARAMETERS)
				if err == nil {
					var roleParams map[string]RepoScope
					if err := json.Unmarshal(p, &roleParams); err == nil {
						if e, ok := roleParams["AJXP_REPO_SCOPE_ALL"]["core.conf"]["email"]; ok {
							user.Attributes[idm.UserAttrEmail] = e
						}
						if d, ok := roleParams["AJXP_REPO_SCOPE_ALL"]["core.conf"]["USER_DISPLAY_NAME"]; ok {
							user.Attributes[idm.UserAttrDisplayName] = d
						}
					}

				} else {
					log.Logger(context.Background()).Debug("JSON marshal error", zap.Error(err))
				}
			}

			// Load password
			if resp, e := cV1.GetAdvancedUserInfo(user.Login, s.Config); e == nil {
				user.Password = resp.Password
				// Load AuthSource
				if (resp.AuthSource != "") && (resp.AuthSource != "sql") {
					user.Attributes["AuthSource"] = resp.AuthSource
					if contextDomain != "" {
						user.GroupPath = "/" + strings.Replace(contextDomain, ",", ".", -1)
					}
				}
				if resp.Profile == common.PydioProfileStandard || resp.Profile == common.PydioProfileShared || resp.Profile == common.PydioProfileAdmin {
					user.Attributes[idm.UserAttrProfile] = resp.Profile
				}
				if resp.Profile == common.PydioProfileShared && resp.OwnerLogin != "" {
					builder.Reset()
					builder = builder.WithUserRead(resp.OwnerLogin).WithUserWrite(resp.OwnerLogin)
					builder = builder.WithUserRead(user.Login).WithUserWrite(user.Login)
					builder = builder.WithProfileRead(common.PydioProfileAdmin).WithProfileWrite(common.PydioProfileAdmin)
					user.Policies = builder.Policies()
				}
				log.Logger(ctx).Info("Loaded advanced user info", zap.String("login", user.Login), user.Zap())
			}
			users = append(users, user)
		}
	}

	if result.Payload.Pagination != nil {

		pagination := result.Payload.Pagination
		if page != pagination.Current {
			// We've already retrieved that data so just return without error
			return users, nil
		}

		if page < pagination.Total {
			newUsers, err := getUsersFromPath(s, p, page+1)
			if err != nil {
				return users, nil
			}

			if len(newUsers) == 0 {
				return users, nil
			}

			users = append(users, newUsers...)
		}
	}

	return users, nil
}

// Groups
func (s *Pydio8Store) getGroupsFromPath(p string) ([]*idm.User, error) {

	var groups []*idm.User

	// dir := path.Dir(p)
	// base := path.Base(p)

	httpClient := sdkconfig.GetHttpClient(s.Config)
	apiClient, ctx, err := sdkconfig.GetPreparedApiClient(s.Config)
	if err != nil {
		return nil, err
	}

	format := "json"
	params := &GetPeopleParams{
		Context:    ctx,
		HTTPClient: httpClient,
		Format:     &format,
		Path:       p,
	}

	c := &Client{apiClient}
	result, err := c.GetPeople(params)
	if err != nil {
		return nil, err
	}

	data := result.Payload.Data
	if data == nil {
		return nil, nil
	}

	for key, node := range data.Children {
		if node.Type == "collection" {
			newGroups, err := s.getGroupsFromPath(key)
			if err != nil {
				return nil, err
			}

			groups = append(groups, newGroups...)

			group := new(idm.User)
			group.GroupLabel = path.Base(key)
			group.GroupPath = path.Dir(key)
			group.IsGroup = true

			attributes := make(map[string]string)
			attributes["AuthSource"] = "pydio8-" + s.Config.Url

			group.Attributes = attributes

			// Do the roles
			groups = append(groups, group)
		}
	}

	return groups, nil
}

// ACLs
func (s *Pydio8Store) getACLs(roleID string, path string) ([]*idm.ACL, error) {

	var acls []*idm.ACL

	httpClient := sdkconfig.GetHttpClient(s.Config)
	apiClient, ctx, err := sdkconfig.GetPreparedApiClient(s.Config)
	if err != nil {
		return nil, err
	}

	format := "json"

	params := &provisioning.GetRoleParams{
		Context:    ctx,
		HTTPClient: httpClient,
		Format:     &format,
		RoleID:     path,
	}

	role, err := apiClient.Provisioning.GetRole(params, nil)
	if err != nil {
		return nil, err
	}

	aclData := role.Payload.ACL
	var roleACLs map[string]interface{}
	if sli, ok := aclData.([]interface{}); ok {
		roleACLs = make(map[string]interface{})
		for i, k := range sli {
			roleACLs[fmt.Sprintf("%d", i)] = k
		}
	} else if mapA, ok := aclData.(map[string]interface{}); ok {
		roleACLs = mapA
	} else {
		log.Logger(context.Background()).Debug("Cannot convert roles acls", zap.Any("result", aclData))
		return nil, fmt.Errorf("could not convert role acls")
	}

	log.Logger(context.Background()).Debug("Loaded role", zap.Any("path", path), zap.Any("roleID", roleID), zap.Any("result", roleACLs))

	rightsMap := map[rune]*idm.ACLAction{
		'r': {Name: "read", Value: "1"},
		'w': {Name: "write", Value: "1"},
		'd': {Name: "deny", Value: "1"},
	}

	wsMap := map[string]string{
		"ajxp_home": common.IdmWsInternalHomepageID,
		"ajxp_conf": common.IdmWsInternalSettingsID,
	}

	for ws, rights := range roleACLs {
		for c, action := range rightsMap {
			if rights == "AJXP_VALUE_CLEAR" {
				rights = "d"
			}
			if strings.ContainsRune(fmt.Sprint(rights), c) {
				wsID, ok := wsMap[ws]
				if !ok {
					wsID = ws
				}

				acls = append(acls, &idm.ACL{
					Action:      action,
					RoleID:      roleID,
					WorkspaceID: wsID,
				})
			}
		}
	}

	return acls, nil
}

func (s *Pydio8Store) GetAPIV1Client() *ClientV1 {
	resourcePath := path.Join(s.Config.Path, "/api")
	cli := httptransport.New(s.Config.Url, resourcePath, []string{s.Config.Protocol})
	// Making sure we also handle the text/xml case
	cli.Consumers["text/xml"] = runtime.XMLConsumer()
	basicAuth := httptransport.BasicAuth(s.Config.User, s.Config.Password)
	cli.DefaultAuthentication = basicAuth

	return &ClientV1{cli}
}

// SHARES
func (s *Pydio8Store) getSharesCache(ctx context.Context) (map[string]*shares.Share, error) {
	if s.sharesCache == nil {
		shares.SetConfig(s.Config)
		allShares, _, e := shares.LoadShares()
		if e != nil {
			return nil, e
		}
		s.sharesCache = allShares
	}
	return s.sharesCache, nil
}

func (s *Pydio8Store) CrossLoadShare(ctx context.Context, syncShare *models.SyncShare, target models.ReadableStore, params map[string]interface{}) error {

	share, ok := syncShare.InternalData.(*shares.Share)
	if !ok {
		return fmt.Errorf("invalid internal data")
	}

	if e := share.LoadElement(); e != nil {
		return e
	}
	// LOAD OWNER
	ownerId := share.GetOwnerId()
	ownerUser, usrCtx, e := target.GetUserInfo(ctx, ownerId, nil)
	if e != nil {
		return fmt.Errorf("cannot load access list for user %s: %s", ownerId, e.Error())
	}

	// Find Root N
	mapping := params["mapping"].(map[string]string)
	cache, _ := s.getSharesCache(ctx)
	fullPath, ws, ownerId, e := shares.RecurseParentPaths(cache, share)
	if e != nil {
		return e
	}
	cellsWs, ok := mapping[fmt.Sprintf("%v", ws.ID)]
	if !ok {
		return fmt.Errorf("cannot find corresponding workspace")
	}
	rootNode, e := target.ReadNode(usrCtx, cellsWs, fullPath)
	if e != nil {
		return e
	}
	//syncShare.OwnerUser = ownerUser
	//syncShare.RootNode = node
	label := share.GetMetadata().Label
	if label == "" {
		label = path.Base(share.GetMetadata().OriginalPath)
	}

	clientV1 := &ClientV1{}

	// Create Links Or Cells
	if share.SHARETYPE == "minisite" {

		for _, pydioLink := range share.GetElement().GetLinks() {
			log.Logger(ctx).Debug("Pydio Link", zap.Any("l", pydioLink), zap.Any("share", share))
			tpl := s.shareGetTemplateName(share, rootNode)
			var perms []rest.ShareLinkAccessType
			if !share.DOWNLOADDISABLED {
				perms = append(perms, rest.ShareLinkAccessType_Download)
			}
			if !(rootNode.IsLeaf() && tpl == "pydio_unique_dl") {
				perms = append(perms, rest.ShareLinkAccessType_Preview)
			}
			hiddenUser, ok := share.GetHiddenUser()
			if ok && strings.Contains(hiddenUser.Right, "w") {
				perms = append(perms, rest.ShareLinkAccessType_Upload)
			}

			link := &rest.ShareLink{
				LinkHash:         fmt.Sprintf("%v", pydioLink.Hash),
				Label:            label,
				Description:      share.GetElement().Description,
				RootNodes:        []*tree.Node{rootNode},
				Permissions:      perms,
				ViewTemplateName: tpl,
			}
			if share.DOWNLOADLIMIT > 0 {
				link.MaxDownloads = share.DOWNLOADLIMIT
			}
			if share.EXPIRETIME > 0 {
				link.AccessEnd = share.EXPIRETIME
			}
			if share.PRESETLOGIN != "" {
				r, e := clientV1.GetAdvancedUserInfo(share.PRESETLOGIN, s.Config)
				if e == nil {
					syncShare.LinkPassword = r.Password
					syncShare.PasswordHashed = true
				} else {
					log.Logger(ctx).Error("Password-Protected Link: could not load advanced user info, generating random password", zap.Any("share", share), zap.Error(e))
					syncShare.LinkPassword = uuid.New()[0:16]
				}
			}

			syncShare.OwnerUser = ownerUser
			syncShare.OwnerContext = usrCtx
			syncShare.Link = link
		}

	} else if share.SHARETYPE == "repository" && len(share.GetSharedUsers()) > 0 {

		cell := &rest.Cell{
			Label:       label,
			RootNodes:   []*tree.Node{rootNode},
			Description: share.GetElement().Description,
			ACLs:        map[string]*rest.CellAcl{},
		}
		for _, u := range share.GetSharedUsers() {
			roleId, e := s.shareRoleIdFromEntry(ctx, u, target)
			if e != nil {
				log.Logger(ctx).Error("Ignoring entry for shared users", zap.Error(e))
				continue
			}
			acl := &rest.CellAcl{
				RoleId:  roleId,
				Actions: []*idm.ACLAction{},
			}
			if strings.Contains(u.Right, "r") {
				acl.Actions = append(acl.Actions, permissions.AclRead)
			}
			if strings.Contains(u.Right, "w") {
				acl.Actions = append(acl.Actions, permissions.AclWrite)
			}
			cell.ACLs[roleId] = acl
		}

		syncShare.OwnerUser = ownerUser
		syncShare.OwnerContext = usrCtx
		syncShare.Cell = cell
	}

	return nil
}

func (s *Pydio8Store) ListShares(ctx context.Context, params map[string]interface{}) (res []*models.SyncShare, e error) {
	allShares, e := s.getSharesCache(ctx)
	var filterType string
	var filterOwners []string
	if v, o := params["ownerId"]; o {
		filterOwners = strings.Split(v.(string), ",")
	}
	if v, o := params["shareType"]; o {
		filterType = (v).(string)
	}
	for _, p8 := range allShares {
		if len(filterOwners) > 0 {
			var found bool
			for _, fo := range filterOwners {
				if strings.TrimSpace(fo) == p8.OWNERID {
					found = true
					break
				}
			}
			if !found {
				continue
			}
		}
		if filterType != "" && ((p8.SHARETYPE == "minisite" && filterType != "LINK") || (p8.SHARETYPE != "minisite" && filterType == "LINK")) {
			continue
		}
		p8share := &models.SyncShare{
			InternalData: p8,
		}
		res = append(res, p8share)
	}
	return res, nil
}

func (s *Pydio8Store) GetUserInfo(c context.Context, userName string, params map[string]interface{}) (u *idm.User, aclCtxt context.Context, e error) {
	return nil, nil, fmt.Errorf("not implemented")
}

func (s *Pydio8Store) GetGroupInfo(ctx context.Context, groupPath string, params map[string]interface{}) (u *idm.User, e error) {
	return nil, fmt.Errorf("not implemented")
}

func (s *Pydio8Store) ReadNode(c context.Context, wsUuid string, wsPath string) (*tree.Node, error) {
	return nil, fmt.Errorf("not implemented")
}

func (s *Pydio8Store) shareGetTemplateName(share *shares.Share, rootNode *tree.Node) string {
	tpl := share.GetTemplateName()
	switch tpl {
	case "ajxp_unique_strip":
		if rootNode.IsLeaf() && share.DOWNLOADLIMIT > 0 {
			return "pydio_unique_dl"
		} else {
			return "pydio_unique_strip"
		}
	case "ajxp_unique_dl":
		return "pydio_unique_dl"
	case "ajxp_dropbox_template":
		return "pydio_dropbox_template"
	case "ajxp_embed_template":
		return "pydio_shared_folder"
	case "ajxp_film_strip":
		return "pydio_film_strip"
	default:
		if rootNode.IsLeaf() {
			if share.DOWNLOADLIMIT > 0 {
				return "pydio_unique_dl"
			} else {
				return "pydio_unique_strip"
			}
		} else {
			return "pydio_shared_folder"
		}
	}
}

func (s *Pydio8Store) shareRoleIdFromEntry(ctx context.Context, entry *models2.ShareEntry, target models.ReadableStore) (string, error) {
	var roleId string
	switch entry.Type {
	case "user", "tmp_user":
		info, _, e := target.GetUserInfo(ctx, entry.ID, nil)
		if e != nil {
			return "", e
		}
		roleId = info.Uuid
	case "team":
		roleId = entry.ID
	case "group":
		groupPath := strings.TrimPrefix(entry.ID, "AJXP_GRP_")
		g, e := target.GetGroupInfo(ctx, groupPath, nil)
		if e != nil {
			return "", e
		}
		return g.Uuid, nil
	default:
		return "", fmt.Errorf("unsupported entry type : %s", entry.Type)
	}

	return roleId, nil
}
