package script

import (
	"context"
	"fmt"

	"github.com/pydio/cells/common/forms"

	"github.com/pydio/cells/common/log"
	"go.uber.org/zap"

	"github.com/mattn/anko/env"
	_ "github.com/mattn/anko/packages"
	"github.com/mattn/anko/vm"
	"github.com/micro/go-micro/client"

	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/scheduler/actions"
	anko_services "github.com/pydio/cells/scheduler/actions/script/anko-services"
)

var (
	ankoActionName = "actions.script.anko"
)

type AnkoAction struct {
	script string
}

func (a *AnkoAction) GetName() string {
	return ankoActionName
}

func (a *AnkoAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	var ok bool
	if a.script, ok = action.Parameters["script"]; !ok {
		return fmt.Errorf("missing parameter %s", "script")
	}
	return nil
}

func (a *AnkoAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {
	e := env.NewEnv()
	e.Define("IdmService", anko_services.NewIdmService(ctx))
	e.Define("TreeService", anko_services.NewTreeService(ctx))

	e.Define("input", &input)
	e.Define("arbitraryNode", func() *tree.Node {
		return &tree.Node{Path: "fake/path"}
	})
	if _, er := vm.Execute(e, &vm.Options{Debug: true}, a.script); er != nil {
		return input.WithError(er), er
	} else {
		if _, err := e.Get("testValue"); err == nil {
			//fmt.Println("GOT A VALUE FROM ENV", val)
		}
		if output, err := e.Get("output"); err == nil {
			if o, i := output.(jobs.ActionMessage); i {
				log.Logger(ctx).Info("Returning output from action", zap.Any("o", output))
				return o, nil
			}
		}

		return input.WithIgnore(), nil
	}
}

func (a *AnkoAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:              ankoActionName,
		Label:           "Anko Script",
		Icon:            "script",
		Description:     "User-defined script for manipulating action inputs",
		SummaryTemplate: "",
		HasForm:         true,
	}
}

func (a *AnkoAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{
		{
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "script",
					Type:        "textarea",
					Label:       "Script Content",
					Description: "Pseudo-go Anko script",
					Default:     "",
					Mandatory:   true,
					Editable:    true,
				},
			},
		},
	}}
}
