package protos

import (
	"encoding/xml"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/forms"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
)

func TestGenerateProtoToForm(t *testing.T) {
	Convey("Test role", t, func() {
		f := GenerateProtoToForm(&idm.UserSingleQuery{})
		So(f.Groups[0].Fields, ShouldNotBeEmpty)
		f = GenerateProtoToForm(&idm.RoleSingleQuery{})
		So(f.Groups[0].Fields, ShouldNotBeEmpty)
		f2 := GenerateProtoToForm(&idm.RoleSingleQuery{}, true)
		So(f2.Groups[0].Fields, ShouldNotBeEmpty)
		serial2 := f2.Serialize()
		b2, _ := xml.Marshal(serial2)
		So(string(b2), ShouldEqual, `<form><param name="fieldname" type="group_switch:fieldname" label="Field Name" group=""></param><param group_switch_name="fieldname" group_switch_value="Uuid" group_switch_label="Uuid" name="@value" type="hidden" group="" default="Uuid"></param><param group_switch_name="fieldname" group_switch_value="Uuid" group_switch_label="Uuid" name="Uuid" type="string" label="Uuid" group="" replicationGroup="Uuid" replicationTitle="Uuid[]" replicationMandatory="true"></param><param group_switch_name="fieldname" group_switch_value="Label" group_switch_label="Label" name="@value" type="hidden" group="" default="Label"></param><param group_switch_name="fieldname" group_switch_value="Label" group_switch_label="Label" name="Label" type="string" label="Label" group=""></param><param group_switch_name="fieldname" group_switch_value="IsTeam" group_switch_label="IsTeam" name="@value" type="hidden" group="" default="IsTeam"></param><param group_switch_name="fieldname" group_switch_value="IsTeam" group_switch_label="IsTeam" name="IsTeam" type="boolean" label="IsTeam" group=""></param><param group_switch_name="fieldname" group_switch_value="IsGroupRole" group_switch_label="IsGroupRole" name="@value" type="hidden" group="" default="IsGroupRole"></param><param group_switch_name="fieldname" group_switch_value="IsGroupRole" group_switch_label="IsGroupRole" name="IsGroupRole" type="boolean" label="IsGroupRole" group=""></param><param group_switch_name="fieldname" group_switch_value="IsUserRole" group_switch_label="IsUserRole" name="@value" type="hidden" group="" default="IsUserRole"></param><param group_switch_name="fieldname" group_switch_value="IsUserRole" group_switch_label="IsUserRole" name="IsUserRole" type="boolean" label="IsUserRole" group=""></param><param group_switch_name="fieldname" group_switch_value="HasAutoApply" group_switch_label="HasAutoApply" name="@value" type="hidden" group="" default="HasAutoApply"></param><param group_switch_name="fieldname" group_switch_value="HasAutoApply" group_switch_label="HasAutoApply" name="HasAutoApply" type="boolean" label="HasAutoApply" group=""></param><param group_switch_name="fieldname" group_switch_value="not" group_switch_label="Not" name="@value" type="hidden" group="" default="not"></param><param group_switch_name="fieldname" group_switch_value="not" group_switch_label="Not" name="not" type="boolean" label="not" group=""></param></form>`)

		f = GenerateProtoToForm(&idm.ACLSingleQuery{}, true)
		sw := f.Groups[0].Fields[0].(*forms.SwitchField)
		a := GenerateProtoToForm(&idm.ACLAction{})
		sw.Values = append(sw.Values, &forms.SwitchValue{
			Name:  "Actions",
			Value: "Actions",
			Label: "Actions",
			Fields: []forms.Field{&forms.ReplicableFields{
				Id:          "Actions",
				Title:       "Actions",
				Description: "Acl Actions",
				Mandatory:   true,
				Fields:      a.Groups[0].Fields,
			}},
		})
		serial := f.Serialize()
		b, _ := xml.Marshal(serial)
		So(string(b), ShouldEqual, `<form><param name="fieldname" type="group_switch:fieldname" label="Field Name" group=""></param><param group_switch_name="fieldname" group_switch_value="RoleIDs" group_switch_label="RoleIDs" name="@value" type="hidden" group="" default="RoleIDs"></param><param group_switch_name="fieldname" group_switch_value="RoleIDs" group_switch_label="RoleIDs" name="RoleIDs" type="string" label="RoleIDs" group="" replicationGroup="RoleIDs" replicationTitle="RoleIDs[]" replicationMandatory="true"></param><param group_switch_name="fieldname" group_switch_value="WorkspaceIDs" group_switch_label="WorkspaceIDs" name="@value" type="hidden" group="" default="WorkspaceIDs"></param><param group_switch_name="fieldname" group_switch_value="WorkspaceIDs" group_switch_label="WorkspaceIDs" name="WorkspaceIDs" type="string" label="WorkspaceIDs" group="" replicationGroup="WorkspaceIDs" replicationTitle="WorkspaceIDs[]" replicationMandatory="true"></param><param group_switch_name="fieldname" group_switch_value="NodeIDs" group_switch_label="NodeIDs" name="@value" type="hidden" group="" default="NodeIDs"></param><param group_switch_name="fieldname" group_switch_value="NodeIDs" group_switch_label="NodeIDs" name="NodeIDs" type="string" label="NodeIDs" group="" replicationGroup="NodeIDs" replicationTitle="NodeIDs[]" replicationMandatory="true"></param><param group_switch_name="fieldname" group_switch_value="not" group_switch_label="Not" name="@value" type="hidden" group="" default="not"></param><param group_switch_name="fieldname" group_switch_value="not" group_switch_label="Not" name="not" type="boolean" label="not" group=""></param><param group_switch_name="fieldname" group_switch_value="Actions" group_switch_label="Actions" name="@value" type="hidden" group="" default="Actions"></param><param group_switch_name="fieldname" group_switch_value="Actions" group_switch_label="Actions" name="Name" type="string" label="Name" group="" replicationGroup="Actions" replicationTitle="Actions" replicationDescription="Acl Actions" replicationMandatory="true"></param><param group_switch_name="fieldname" group_switch_value="Actions" group_switch_label="Actions" name="Value" type="string" label="Value" group="" replicationGroup="Actions" replicationTitle="Actions" replicationDescription="Acl Actions" replicationMandatory="true"></param></form>`)

		So(f.Groups[0].Fields, ShouldNotBeEmpty)
		f = GenerateProtoToForm(&idm.WorkspaceSingleQuery{})
		So(f.Groups[0].Fields, ShouldNotBeEmpty)
		f = GenerateProtoToForm(&tree.Query{})
		So(f.Groups[0].Fields, ShouldNotBeEmpty)
	})
}
