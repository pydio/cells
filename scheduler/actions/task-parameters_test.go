package actions

import (
	"context"
	"github.com/pydio/cells/v4/common/forms"
	"github.com/pydio/cells/v4/common/proto/jobs"
	. "github.com/smartystreets/goconvey/convey"
	"testing"
)

func testForm() *forms.Form {
	return &forms.Form{
		Groups: []*forms.Group{{
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "inputVar",
					Type:        forms.ParamString,
					Default:     "Cell",
					Label:       "Variable Name",
					Mandatory:   true,
					Description: "Cell object stored in variable by previous actions",
				},
				&forms.FormField{
					Name:      "integer",
					Type:      forms.ParamInteger,
					Default:   0,
					Label:     "Integer type",
					Mandatory: false,
				},
				&forms.FormField{
					Name:      "boolean",
					Type:      forms.ParamBool,
					Default:   true,
					Label:     "Boolean Type",
					Mandatory: false,
				},
				&forms.SwitchField{
					Name:        "op",
					Label:       "Resource Type",
					Description: "Resource to modify",
					Mandatory:   true,
					Default:     "roots",
					Values: []*forms.SwitchValue{
						{
							Name:  "roots",
							Label: "Cell Root Nodes",
							Value: "roots",
							Fields: []forms.Field{
								&forms.FormField{
									Name:        "rootOp",
									Type:        forms.ParamSelect,
									Label:       "Operation Type",
									Description: "Roots Operations (read from Input.Nodes)",
									Default:     "a",
									Mandatory:   true,
									ChoicePresetList: []map[string]string{
										{"a": "Add node to roots"},
										{"d": "Delete node from roots"},
									},
								},
							},
						},
						{
							Name:  "acls",
							Label: "Cell Users",
							Value: "acls",
							Fields: []forms.Field{
								&forms.FormField{
									Name:        "aclOp",
									Type:        forms.ParamSelect,
									Label:       "Operation Type",
									Description: "Users Operations (read from Input.Users)",
									Default:     "r",
									Mandatory:   true,
									ChoicePresetList: []map[string]string{
										{"r": "Add - Read only"},
										{"rw": "Add - Read/Write"},
										{"w": "Add - Write only"},
										{"d": "Remove"},
									},
								},
							},
						},
						{
							Name:  "date",
							Label: "Update Expiration Date",
							Value: "date",
							Fields: []forms.Field{
								&forms.FormField{
									Name:        "expirationDate",
									Type:        forms.ParamInteger,
									Label:       "Expiration Date (Timestamp)",
									Description: "Disable Cell after this date",
									Mandatory:   false,
								},
							},
						},
					},
				},
				&forms.ReplicableFields{
					Id:          "columns",
					Title:       "Fields",
					Description: "Define target fields",
					Mandatory:   true,
					Fields: []forms.Field{
						&forms.FormField{
							Name:        "name",
							Type:        forms.ParamString,
							Label:       "Column Name",
							Description: "Column Name",
							Mandatory:   true,
							Editable:    true,
						},
						&forms.FormField{
							Name:        "jsonpath",
							Type:        forms.ParamString,
							Label:       "Selector (jsonpath or template)",
							Description: "Jsonpath Selector (applied to input)",
							Mandatory:   true,
							Editable:    true,
						},
						&forms.FormField{
							Name:        "dataformat",
							Type:        forms.ParamSelect,
							Label:       "Data Format",
							Description: "Make sure output is in the correct format",
							Mandatory:   false,
							ChoicePresetList: []map[string]string{
								{"string": "String"},
								{"number": "Integer (int64)"},
								{"float": "Float (float64)"},
								{"date": "Date (string)"},
								{"stamp": "Date (timestamp)"},
								{"bool": "Boolean (true/false)"},
							},
						},
						&forms.FormField{
							Name:        "expand",
							Type:        forms.ParamString,
							Label:       "Expander",
							Description: "Apply this selector on the expanded values",
							Mandatory:   false,
							Default:     "",
							Editable:    true,
						},
						&forms.FormField{
							Name:        "cellwidth",
							Type:        forms.ParamInteger,
							Label:       "[XSLX] Cell Width",
							Description: "Specify cell width",
							Mandatory:   false,
						},
					},
				},
			},
		}},
	}

}

func TestFlattenGroup(t *testing.T) {
	Convey("Test Flatten Group, all defaults", t, func() {
		form := testForm()
		tp := &TaskParameters{}
		tp.InitParameters(form, &jobs.Action{Parameters: map[string]string{}})
		ctx := context.Background()
		input := &jobs.ActionMessage{}
		tp.WithParametersRuntime(ctx, input)
		So(tp.String("inputVar"), ShouldEqual, "Cell")
		So(tp.Get("boolean").Raw(), ShouldEqual, "true")
		So(tp.MustBool("boolean"), ShouldBeTrue)
		So(tp.Get("op").IsSwitch(), ShouldBeTrue)
		sv, vv := tp.Get("op").SwitchValues()
		So(sv, ShouldEqual, "roots")
		So(vv.String("rootOp"), ShouldEqual, "a")
		oo := tp.Get("columns").Occurrences()
		So(oo, ShouldHaveLength, 0)
	})
	Convey("Test Flatten Group, with values", t, func() {
		form := testForm()
		tp := &TaskParameters{}
		tp.InitParameters(form, &jobs.Action{Parameters: map[string]string{
			"inputVar":   "MyVarName",
			"integer":    "50",
			"boolean":    "false",
			"op":         "{\"@value\":\"acls\", \"aclOp\":\"rw\"}",
			"name":       "col1",
			"jsonpath":   "toto",
			"name_1":     "col2",
			"jsonpath_1": "toto2",
		}})
		ctx := context.Background()
		input := &jobs.ActionMessage{}
		tp.WithParametersRuntime(ctx, input)
		So(tp.String("inputVar"), ShouldEqual, "MyVarName")
		So(tp.MustBool("boolean"), ShouldBeFalse)
		So(tp.MustInt("integer"), ShouldEqual, 50)
		So(tp.MustInt64("integer"), ShouldEqual, int64(50))
		sv, vv := tp.Get("op").SwitchValues()
		So(sv, ShouldEqual, "acls")
		So(vv.String("aclOp"), ShouldEqual, "rw")
		col := tp.Get("columns")
		So(col.IsMultiple(), ShouldBeTrue)
		oo := col.Occurrences()
		So(oo, ShouldHaveLength, 2)
		So(oo[1].String("jsonpath"), ShouldEqual, "toto2")
	})
}
