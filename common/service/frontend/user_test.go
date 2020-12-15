package frontend

import (
	"context"
	"fmt"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/utils/permissions"
	"github.com/pydio/cells/x/configx"
)

func TestUser_FlattenedFrontValues(t *testing.T) {
	Convey("Test Flattened ACLs", t, func() {
		acl := &permissions.AccessList{
			OrderedRoles: []*idm.Role{
				{Uuid: "user_role", GroupRole: false, UserRole: true},
				{Uuid: "group_role", GroupRole: true, UserRole: false},
			},
			FrontPluginsValues: []*idm.ACL{
				{
					ID:          "lang",
					Action:      &idm.ACLAction{Name: "parameter:core.conf:lang", Value: "fr"},
					RoleID:      "user_role",
					WorkspaceID: "PYDIO_REPO_SCOPE_ALL",
				},
				{
					ID:          "a1",
					Action:      &idm.ACLAction{Name: "parameter:plugin.name:STRING_PARAMETER", Value: "parameterStringValue1"},
					RoleID:      "user_role",
					WorkspaceID: "other-workspace-id",
				},
				{
					ID:          "a2",
					Action:      &idm.ACLAction{Name: "parameter:plugin.name:STRING_PARAMETER", Value: "parameterStringValue2"},
					RoleID:      "user_role",
					WorkspaceID: "active-workspace-id",
				},
				{
					ID:          "a3",
					Action:      &idm.ACLAction{Name: "parameter:plugin.name:STRING_PARAMETER", Value: "parameterStringValue3"},
					RoleID:      "user_role",
					WorkspaceID: "PYDIO_REPO_SCOPE_ALL",
				},
				{
					ID:          "a4",
					Action:      &idm.ACLAction{Name: "parameter:plugin.name:STRING_PARAMETER", Value: "parameterStringValue4"},
					RoleID:      "group_role",
					WorkspaceID: "PYDIO_REPO_SCOPE_ALL",
				},
				{
					ID:          "a5",
					Action:      &idm.ACLAction{Name: "parameter:plugin.other:STRING_PARAMETER", Value: "parameterStringValue5"},
					RoleID:      "group_role",
					WorkspaceID: "PYDIO_REPO_SCOPE_ALL",
				},
				{
					ID:          "a6",
					Action:      &idm.ACLAction{Name: "parameter:plugin.other:STRING_PARAMETER", Value: "parameterStringValue6"},
					RoleID:      "other_role",
					WorkspaceID: "PYDIO_REPO_SCOPE_ALL",
				},
				{
					ID:          "a7",
					Action:      &idm.ACLAction{Name: "parameter:plugin.name:BOOL_PARAMETER", Value: "true"},
					RoleID:      "group_role",
					WorkspaceID: "PYDIO_REPO_SCOPE_ALL",
				},
				{
					ID:          "a8",
					Action:      &idm.ACLAction{Name: "parameter:plugin.name:INTEGER_PARAMETER", Value: "12"},
					RoleID:      "group_role",
					WorkspaceID: "PYDIO_REPO_SCOPE_ALL",
				},
			}}

		acl.Flatten(context.Background())

		u := &User{
			AccessList:      acl,
			ActiveWorkspace: "active-workspace-id",
			Workspaces: map[string]*Workspace{
				"active-workspace-id": {Workspace: idm.Workspace{UUID: "active-workspace-id", Scope: idm.WorkspaceScope_ADMIN}},
				"other-cell-id":       {Workspace: idm.Workspace{UUID: "other-cell-id", Scope: idm.WorkspaceScope_ROOM}},
			},
		}

		output := u.FlattenedFrontValues()
		So(output, ShouldNotBeNil)
		aa := output.Val("actions")
		So(aa, ShouldNotBeNil)
		pp := output.Val("parameters")
		So(pp, ShouldNotBeNil)
		So(pp.Val("core.conf").Get(), ShouldNotBeEmpty)
		So(pp.Val("plugin.name").Get(), ShouldNotBeEmpty)
		So(pp.Val("plugin.name", "STRING_PARAMETER").Get(), ShouldNotBeEmpty)
		pVal := pp.Val("plugin.name", "STRING_PARAMETER", "active-workspace-id").String()

		So(pVal, ShouldNotBeEmpty)
		So(pVal, ShouldEqual, "parameterStringValue2")

		lang := u.FlattenedRolesConfigByName("core.conf", "lang")
		So(lang, ShouldEqual, "")
		u.Logged = true
		lang = u.FlattenedRolesConfigByName("core.conf", "lang")
		So(lang, ShouldEqual, "fr")

		cfg := configx.New()
		cfg.Val("frontend", "plugin", "plugin.name", "STRING_PARAMETER").Set("globalValue1")
		cfg.Val("frontend", "plugin", "plugin.name", "NOT_REFINED_PARAMETER").Set("globalValue2")

		status := RequestStatus{
			Config:        cfg,
			User:          u,
			AclParameters: pp,
			WsScopes:      u.GetActiveScopes(),
		}

		fmt.Println(pp.Map())

		basicP := &Cglobal_param{Attrname: "NOT_REFINED_PARAMETER", Attrtype: "string"}
		stringP := &Cglobal_param{Attrname: "STRING_PARAMETER", Attrtype: "string"}
		intP := &Cglobal_param{Attrname: "INTEGER_PARAMETER", Attrtype: "integer"}
		boolP := &Cglobal_param{Attrname: "BOOL_PARAMETER", Attrtype: "boolean"}

		plugin := &Cplugin{Attrid: "plugin.name"}
		// Should read value from global config
		So(plugin.PluginConfig(status, basicP), ShouldEqual, "globalValue2")
		// Should find the more specific scope => active-workspace-id
		So(plugin.PluginConfig(status, stringP), ShouldEqual, "parameterStringValue2")
		// Should find SCOPE_ALL scope and parse it as integer
		So(plugin.PluginConfig(status, intP), ShouldEqual, 12)
		// Should find SCOPE_ALL scope and parse it as boolean
		So(plugin.PluginConfig(status, boolP), ShouldEqual, true)

		oplugin := &Cplugin{Attrid: "plugin.other"}
		// Should find SCOPE_ALL scope
		So(oplugin.PluginConfig(status, stringP), ShouldEqual, "parameterStringValue5")

	})
}
