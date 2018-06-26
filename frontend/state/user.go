package state

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"strings"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"

	"fmt"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils"
)

type User struct {
	Logged           bool
	Claims           claim.Claims
	AccessList       *utils.AccessList
	Workspaces       map[string]*Workspace
	UserObject       *idm.User
	ActiveWorkspace  string
	ActiveAccessType string
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
	userName, _ := utils.FindUserNameInContext(ctx)
	if user, err := utils.SearchUniqueUser(ctx, userName, ""); err != nil {
		return err
	} else {
		u.UserObject = user
	}

	accessList, err := utils.AccessListFromContextClaims(ctx)
	if err != nil {
		return err
	}
	u.AccessList = accessList
	u.LoadWorkspaces(ctx, u.AccessList)

	utils.AccessListLoadFrontValues(ctx, u.AccessList)

	return nil
}

func (u *User) GetActiveScopes() (scopes []string) {

	if u.ActiveWorkspace == "" {
		return
	}
	ws := u.Workspaces[u.ActiveWorkspace]
	if ws.Scope != idm.WorkspaceScope_ADMIN {
		scopes = append(scopes, "PYDIO_REPO_SCOPE_SHARED")
	} else {
		scopes = append(scopes, "PYDIO_REPO_SCOPE_ALL")
	}
	scopes = append(scopes, ws.UUID)

	return
}

func (u *User) LoadActiveWorkspace(parameter string) {

	if ws, ok := u.Workspaces[parameter]; ok {
		u.ActiveWorkspace = parameter
		u.ActiveAccessType = ws.AccessType
		return
	}
	// Load default repository from preferences, or start on home page
	var defaultStart = "homepage"
	configs := u.FlattenedRolesConfigs().Get("parameters").(*config.Map)
	fmt.Println(configs)
	if c := configs.Get("core.conf"); c != nil {
		if p := c.(*config.Map).Get("DEFAULT_START_REPOSITORY"); p != nil {
			if v := p.(*config.Map).String("PYDIO_REPO_SCOPE_ALL"); v != "" {
				if _, ok := u.Workspaces[v]; ok {
					defaultStart = v
				}
			}
		}
	}
	fmt.Println("Default start", defaultStart)

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

func (u *User) FlattenedRolesConfigs() *config.Map {
	if u.Logged {
		return u.AccessList.FlattenedFrontValues()
	} else {
		c := config.NewMap()
		c.Set("actions", config.NewMap())
		c.Set("parameters", config.NewMap())
		return c
	}
}

func (u *User) LoadWorkspaces(ctx context.Context, accessList *utils.AccessList) error {

	workspacesAccesses := accessList.GetAccessibleWorkspaces(ctx)

	wsCli := idm.NewWorkspaceServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_WORKSPACE, defaults.NewClient())
	query := &service.Query{
		SubQueries: []*any.Any{},
		Operation:  service.OperationType_OR,
	}
	for wsId, _ := range workspacesAccesses {
		if wsId == "settings" || wsId == "homepage" {
			slug := "settings"
			if wsId == "homepage" {
				slug = "welcome"
			}
			ws := &idm.Workspace{
				Scope: idm.WorkspaceScope_ADMIN,
				UUID:  wsId,
				Slug:  slug,
				Label: wsId,
			}
			workspace := &Workspace{
				AccessType:  wsId,
				AccessRight: "rw",
			}
			workspace.Workspace = *ws
			u.Workspaces[wsId] = workspace
		} else {
			q, _ := ptypes.MarshalAny(&idm.WorkspaceSingleQuery{
				Uuid: wsId,
			})
			query.SubQueries = append(query.SubQueries, q)
		}
	}
	streamer, e := wsCli.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{Query: query})
	if e != nil {
		return e
	}
	defer streamer.Close()
	for {
		resp, e := streamer.Recv()
		if resp == nil || e != nil {
			break
		}
		if resp.Workspace != nil {
			respWs := resp.Workspace
			access := workspacesAccesses[respWs.UUID]
			access = strings.Replace(access, "read", "r", -1)
			access = strings.Replace(access, "write", "w", -1)
			access = strings.Replace(access, ",", "", -1)
			ws := &Workspace{}
			ws.Workspace = *respWs
			ws.AccessRight = access
			ws.AccessType = "gateway"
			u.Workspaces[respWs.UUID] = ws
		}
	}

	return nil
}

func (u *User) Publish(status RequestStatus, pool *PluginsPool) *Cuser {
	if !u.Logged {
		return nil
	}
	reg := &Cuser{
		Attrid: u.UserObject.Login,
		Cactive_repo: &Cactive_repo{
			Attrid: u.ActiveWorkspace,
		},
		Crepositories: &Crepositories{},
		Cpreferences:  &Cpreferences{},
	}
	if u.Claims.Profile == common.PYDIO_PROFILE_ADMIN {
		reg.Cspecial_rights = &Cspecial_rights{
			Attris_admin: "1",
		}
	}
	reg.Cpreferences.Cpref = u.publishPreferences(status, pool)
	reg.Crepositories.Crepo = u.publishWorkspaces(status, pool)

	return reg
}

func (u *User) publishPreferences(status RequestStatus, pool *PluginsPool) (preferencesNodes []*Cpref) {

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
		if exposed.Attrscope == "user" {
			if pref, ok := u.UserObject.Attributes[exposed.Attrname]; ok {
				preferencesNodes = append(preferencesNodes, &Cpref{
					Attrname:     exposed.Attrname,
					Attrvalue:    pref,
					AttrpluginId: exposed.PluginId,
				})
			}
		} else {
			plugin := pool.Plugins[exposed.PluginId]
			pref := plugin.PluginConfig(status, &exposed.Cglobal_param)
			if exposed.Attrtype == "string" {
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

func (u *User) publishWorkspaces(status RequestStatus, pool *PluginsPool) (workspaceNodes []*Crepo) {

	accessSettings := make(map[string]*Cclient_settings)
	for _, p := range pool.Plugins {
		if strings.HasPrefix(p.GetId(), "access.") {
			accessSettings[strings.TrimPrefix(p.GetId(), "access.")] = p.GetClientSettings()
		}
	}

	for _, ws := range u.Workspaces {
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
		if ws.Scope != idm.WorkspaceScope_ADMIN {
			repo.Attrowner = "shared"
			repo.Attruser_editable_repository = "true"
		}
		repo.Attracl = ws.AccessRight
		workspaceNodes = append(workspaceNodes, repo)
	}

	return
}
