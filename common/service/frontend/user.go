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

package frontend

import (
	"context"
	"encoding/base64"
	"path"
	"strings"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/permissions"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/i18n/languages"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

type User struct {
	Logged           bool
	Claims           claim.Claims
	AccessList       *permissions.AccessList
	Workspaces       map[string]*Workspace
	UserObject       *idm.User
	ActiveWorkspace  string
	ActiveAccessType string
	HasLocks         bool
	Locks            []string
}

type Workspace struct {
	idm.Workspace
	AccessType  string
	AccessRight string
}

func (u *User) Load(ctx context.Context) error {

	u.Workspaces = make(map[string]*Workspace)

	claims, ok := ctx.Value(claim.ContextKey).(claim.Claims)
	if !ok {
		// No user logged
		return nil
	}
	u.Logged = true
	u.Claims = claims

	// Load user object
	userName, _ := permissions.FindUserNameInContext(ctx)
	if user, err := permissions.SearchUniqueUser(ctx, userName, ""); err != nil {
		return err
	} else {
		u.UserObject = user
	}

	// Check locks info
	if l, ok := u.UserObject.Attributes["locks"]; ok {
		var locks []string
		log.Logger(ctx).Debug("Checking Locks", zap.Any("l", l))
		if e := json.Unmarshal([]byte(l), &locks); e == nil {
			if len(locks) > 0 {
				u.HasLocks = true
				u.Locks = locks
			}
		}
	}

	accessList, err := permissions.AccessListFromContextClaims(ctx)
	if err != nil {
		return err
	}
	u.AccessList = accessList
	u.LoadWorkspaces(ctx, u.AccessList)

	permissions.AccessListLoadFrontValues(ctx, u.AccessList)

	return nil
}

func (u *User) GetActiveScopes() (scopes []string) {

	if u.ActiveWorkspace == "" {
		return
	}
	ws := u.Workspaces[u.ActiveWorkspace]
	scopes = permissions.FrontValuesScopesFromWorkspaces([]*idm.Workspace{&ws.Workspace})

	return
}

func (u *User) LoadActiveWorkspace(parameter string) {

	if u.HasLocks {
		return
	}

	if ws, ok := u.Workspaces[parameter]; ok {
		u.ActiveWorkspace = parameter
		u.ActiveAccessType = ws.AccessType
		return
	}
	// Check by slug
	for _, ws := range u.Workspaces {
		if ws.Slug == parameter {
			u.ActiveWorkspace = ws.UUID
			u.ActiveAccessType = ws.AccessType
			return
		}
	}
	// Load default repository from preferences, or start on home page
	var defaultStart = common.IdmWsInternalHomepageID
	if v := u.FlattenedRolesConfigByName("core.conf", "DEFAULT_START_REPOSITORY"); v != "" && v != "-1" {
		defaultStart = v
	}

	if ws, ok := u.Workspaces[defaultStart]; ok {
		u.ActiveWorkspace = defaultStart
		u.ActiveAccessType = ws.AccessType
		return
	}
	// Take first value
	for id, ws := range u.Workspaces {
		u.ActiveWorkspace = id
		u.ActiveAccessType = ws.AccessType
		return
	}

}

func (u *User) LoadActiveLanguage(parameter string) string {
	if parameter != "" {
		return parameter
	}
	lang := languages.GetDefaultLanguage(config.Get())
	if v := u.FlattenedRolesConfigByName("core.conf", "lang"); v != "" {
		lang = v
	}
	return lang
}

func (u *User) FlattenedRolesConfigs() configx.Values {
	if u.Logged {
		return u.AccessList.FlattenedFrontValues()
	} else {
		c := configx.New()
		// c.Set("actions", configx.New())
		// c.Set("parameters", configx.New())
		return c
	}
}

func (u *User) FlattenedRolesConfigByName(pluginId string, name string) string {
	return u.FlattenedRolesConfigs().Val("parameters", pluginId, name, permissions.FrontWsScopeAll).String()
}

func (u *User) LoadWorkspaces(ctx context.Context, accessList *permissions.AccessList) error {

	workspacesAccesses := accessList.DetectedWsRights(ctx)
	for wsId, right := range workspacesAccesses {
		if slug, ok := common.IdmWsInternalReservedSlugs[wsId]; ok {
			ws := &idm.Workspace{
				Scope: idm.WorkspaceScope_ADMIN,
				UUID:  wsId,
				Slug:  slug,
				Label: wsId,
			}
			u.Workspaces[wsId] = &Workspace{
				Workspace:   *ws,
				AccessType:  wsId,
				AccessRight: "rw",
			}
		} else {
			aclWs, ok := accessList.GetWorkspaces()[wsId]
			if !ok {
				log.Logger(ctx).Error("something went wrong, access list refers to unknown workspace", zap.String("wsId", wsId))
				continue
			}
			u.Workspaces[wsId] = &Workspace{
				Workspace:   *aclWs,
				AccessRight: right.UserStateString(),
				AccessType:  "gateway",
			}
		}
	}
	return nil
}

func (u *User) Publish(ctx context.Context, status RequestStatus, pool *PluginsPool) *Cuser {
	if !u.Logged {
		return nil
	}
	reg := &Cuser{
		Attrid:        u.UserObject.Login,
		Crepositories: &Crepositories{},
		Cpreferences:  &Cpreferences{},
	}
	if u.Claims.Profile == common.PydioProfileAdmin {
		reg.Cspecial_rights = &Cspecial_rights{
			Attris_admin: "1",
		}
	}
	reg.Cpreferences.Cpref = u.publishPreferences(ctx, status, pool)

	/*
		// Add locks info
		var hasLock bool
		if l, ok := u.UserObject.Attributes["locks"]; ok {
			var locks []string
			log.Logger(context.Background()).Info("Checking Locks", zap.Any("l", l))
			if e := json.Unmarshal([]byte(l), &locks); e == nil {
				if len(locks) > 0 {
					if reg.Cspecial_rights == nil {
						reg.Cspecial_rights = &Cspecial_rights{}
					}
					reg.Cspecial_rights.Attrlock = strings.Join(locks, ",")
					hasLock = true
				}
			}
		}
	*/

	if u.HasLocks {
		if reg.Cspecial_rights == nil {
			reg.Cspecial_rights = &Cspecial_rights{}
		}
		reg.Cspecial_rights.Attrlock = strings.Join(u.Locks, ",")
	} else {
		reg.Cactive_repo = &Cactive_repo{
			Attrid: u.ActiveWorkspace,
		}
		reg.Crepositories.Crepo = u.publishWorkspaces(ctx, status, pool)
	}

	return reg
}

func (u *User) publishPreferences(ctx context.Context, status RequestStatus, pool *PluginsPool) (preferencesNodes []*Cpref) {

	if preferences, ok := u.UserObject.Attributes["preferences"]; ok {
		var userPrefs map[string]string
		if e := json.Unmarshal([]byte(preferences), &userPrefs); e == nil {
			for k, v := range userPrefs {
				if k == "gui_preferences" {
					if decoded, e := base64.StdEncoding.DecodeString(v); e == nil {
						preferencesNodes = append(preferencesNodes, &Cpref{
							Attrname: k,
							Cdata:    string(decoded),
						})
					}
				} else {
					preferencesNodes = append(preferencesNodes, &Cpref{
						Attrname:  k,
						Attrvalue: v,
					})
				}
			}
		}
	}
	for _, exposed := range pool.ExposedParametersByScope("user", true) {
		if strings.Contains(exposed.Attrscope, "user") {
			if pref, ok := u.UserObject.Attributes[exposed.Attrname]; ok {
				preferencesNodes = append(preferencesNodes, &Cpref{
					Attrname:     exposed.Attrname,
					Attrvalue:    pref,
					AttrpluginId: exposed.PluginId,
				})
			} else if v := u.FlattenedRolesConfigByName(exposed.PluginId, exposed.Attrname); v != "" {
				//				log.Logger(ctx).Info("-- Pref found in flattened roles for " + exposed.Attrname)
				preferencesNodes = append(preferencesNodes, &Cpref{
					Attrname:     exposed.Attrname,
					Attrvalue:    v,
					AttrpluginId: exposed.PluginId,
				})
			}
		} else {
			plugin := pool.Plugins[exposed.PluginId]
			pref := plugin.PluginConfig(status, &exposed.Cglobal_param)
			if exposed.Attrtype == "string" || exposed.Attrtype == "select" || exposed.Attrtype == "autocomplete" {
				preferencesNodes = append(preferencesNodes, &Cpref{
					Attrname:     exposed.Attrname,
					Attrvalue:    pref.(string),
					AttrpluginId: exposed.PluginId,
				})
			} else {
				marsh, _ := json.Marshal(pref)
				preferencesNodes = append(preferencesNodes, &Cpref{
					Attrname:     exposed.Attrname,
					AttrpluginId: exposed.PluginId,
					Cdata:        string(marsh),
				})
			}
		}
	}

	return
}

func (u *User) publishWorkspaces(ctx context.Context, status RequestStatus, pool *PluginsPool) (workspaceNodes []*Crepo) {

	accessSettings := make(map[string]*Cclient_settings)
	for _, p := range pool.Plugins {
		if strings.HasPrefix(p.GetId(), "access.") {
			accessSettings[strings.TrimPrefix(p.GetId(), "access.")] = p.GetClientSettings()
		}
	}

	// Used to detect "personal files"-like workspace
	vNodeManager := abstract.GetVirtualNodesManager(ctx)
	var skipReserved bool
	if status.Request != nil {
		skipReserved = strings.Contains(status.Request.Header.Get("User-Agent"), "com.pydio.PydioPro;")
	}

	for _, ws := range u.Workspaces {
		if _, ok := common.IdmWsInternalReservedSlugs[ws.UUID]; ok && skipReserved {
			continue
		}
		repo := &Crepo{
			Attrid:             ws.UUID,
			Attraccess_type:    ws.AccessType,
			AttrrepositorySlug: ws.Slug,
			Clabel:             &Clabel{Cdata: ws.Label},
		}
		if cSettings, ok := accessSettings[ws.AccessType]; ok {
			repo.Cclient_settings = cSettings
		}
		if ws.Description != "" {
			repo.Cdescription = &Cdescription{Cdata: ws.Description}
		}
		if ws.Scope == idm.WorkspaceScope_ROOM {
			repo.Attrowner = "shared"
			// Use existing xml attribute to tell if user is owner or not
			// The real "editable" aspect is linked to PoliciesContextEditable value
			if u.isWorkspaceOwnerFromPolicy(ws.Workspace.Policies) {
				repo.Attruser_editable_repository = "true"
			} else {
				repo.Attruser_editable_repository = "false"
			}
			repo.Attrrepository_type = "cell"
		} else if ws.Scope == idm.WorkspaceScope_LINK {
			repo.Attrowner = "shared"
			repo.Attrrepository_type = "link"
			if ws.Label == "{{RefLabel}}" && len(ws.RootUUIDs) == 1 {
				// Load unique node to re-build label
				router := compose.UuidClient(status.RuntimeCtx)
				if rsp, e := router.ReadNode(status.Request.Context(), &tree.ReadNodeRequest{Node: &tree.Node{Uuid: ws.RootUUIDs[0]}}); e == nil {
					repo.Clabel = &Clabel{Cdata: path.Base(rsp.GetNode().GetPath())}
				}
			}
		} else {
			repo.Attrrepository_type = "workspace"
			if len(ws.RootUUIDs) == 1 {
				if _, ok := vNodeManager.ByUuid(ws.RootUUIDs[0]); ok {
					repo.Attrrepository_type = "workspace-personal"
				}
			}
		}
		repo.Attracl = ws.AccessRight
		if ws.AccessType == "gateway" && strings.Contains(ws.AccessRight, "w") {
			repo.AttrallowCrossRepositoryCopy = "true"
		}
		workspaceNodes = append(workspaceNodes, repo)
	}

	return
}

func (u *User) isWorkspaceOwnerFromPolicy(policies []*service.ResourcePolicy) bool {
	for _, pol := range policies {
		if pol.Action == service.ResourcePolicyAction_OWNER {
			return pol.Subject == u.UserObject.Uuid
		}
	}
	return false
}
