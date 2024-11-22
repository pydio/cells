package tree

import (
	"context"
	"fmt"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/forms"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/scheduler/actions"
)

var (
	datasourceAttributeActionName = "actions.tree.ds-attribute"
)

type datasourceAttributeAction struct {
	common.RuntimeHolder
	attName, attValue string
}

func (d *datasourceAttributeAction) GetName() string {
	return datasourceAttributeActionName
}

func (d *datasourceAttributeAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:          datasourceAttributeActionName,
		Label:       "Set Datasource Attribute",
		Icon:        "mdi mdi-tag-multiple",
		IsInternal:  true,
		Description: "Update a datasource attribute in configs",
		Category:    actions.ActionCategoryTree,
		HasForm:     true,
	}
}

func (d *datasourceAttributeAction) GetParametersForm() *forms.Form {
	return &forms.Form{
		Groups: []*forms.Group{
			{
				Fields: []forms.Field{
					&forms.FormField{
						Name:        "attName",
						Type:        forms.ParamString,
						Label:       "Attribute Name",
						Description: "Name of the attribute to update",
						Mandatory:   true,
					},
					&forms.FormField{
						Name:        "attValue",
						Type:        forms.ParamString,
						Label:       "Attribute Value",
						Description: "Leave empty to clear attribute",
					},
				},
			},
		},
	}

}

func (d *datasourceAttributeAction) Init(job *jobs.Job, action *jobs.Action) error {
	for k, p := range action.Parameters {
		switch k {
		case "attName":
			d.attName = p
		case "attValue":
			d.attValue = p
		}
	}
	if d.attName == "" {
		return fmt.Errorf("missing mandatory parameters dsName or attName")
	}
	return nil
}

func (d *datasourceAttributeAction) Run(ctx context.Context, channels *actions.RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {
	attName := jobs.EvaluateFieldStr(ctx, input, d.attName)
	attValue := jobs.EvaluateFieldStr(ctx, input, d.attValue)
	if attName == "" {
		er := fmt.Errorf("missing mandatory parameters dsName or attName")
		return input.WithError(er), er
	}

	dss := input.GetDataSources()
	if len(dss) == 0 {
		er := fmt.Errorf("cannot find datasource")
		return input.WithError(er), er
	}
	ds := dss[0]

	if ds.StorageConfiguration == nil {
		ds.StorageConfiguration = map[string]string{}
	}
	crtValue := ds.StorageConfiguration[attName]
	if attValue == crtValue {
		log.TasksLogger(ctx).Info("Current value is already the same, nothing to update for " + ds.Name + " (" + attName + "=" + attValue + ")")
		return input.WithIgnore(), nil
	}

	if attValue == "" {
		delete(ds.StorageConfiguration, attName)
	} else {
		ds.StorageConfiguration[attName] = attValue
	}

	if er := config.Set(ctx, ds, "services", "pydio.grpc.data.sync."+ds.Name); er != nil {
		return input.WithError(er), er
	}
	if er := config.Save(ctx, common.PydioSystemUsername, "Flagging datasource "+ds.Name+" with "+attName+"="+attValue); er != nil {
		return input.WithError(er), er
	}

	if attValue != "" {
		log.TasksLogger(ctx).Info("Successfully updated datasource " + ds.Name + " with " + attName + "=" + attValue)
	} else {
		log.TasksLogger(ctx).Info("Successfully updated datasource " + ds.Name + ", cleared attribute " + attName)
	}

	return input.WithDataSource(ds), nil
}
