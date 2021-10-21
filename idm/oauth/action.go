/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package oauth

import (
	"context"
	"fmt"
	"time"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/forms"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/auth"
	"github.com/pydio/cells/common/proto/docstore"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/utils/i18n"
	"github.com/pydio/cells/idm/oauth/lang"
	"github.com/pydio/cells/scheduler/actions"
)

func init() {
	actions.GetActionsManager().Register(pruneTokensActionName, func() actions.ConcreteAction {
		return &PruneTokensAction{}
	})
}

// InsertPruningJob adds a job to scheduler
func InsertPruningJob(ctx context.Context) error {

	T := lang.Bundle().GetTranslationFunc(i18n.GetDefaultLanguage(config.Get()))

	return service.Retry(ctx, func() error {

		cli := jobs.NewJobServiceClient(registry.GetClient(common.ServiceJobs))
		timeout := registry.ShortRequestTimeout()
		if resp, e := cli.GetJob(ctx, &jobs.GetJobRequest{JobID: pruneTokensActionName}, timeout); e == nil && resp.Job != nil {
			return nil // Already exists
		} else if e != nil && errors.Parse(e.Error()).Id == "go.micro.client" {
			return e // not ready yet, retry
		}
		log.Logger(ctx).Info("Inserting pruning job for revoked token and reset password tokens")
		_, e := cli.PutJob(ctx, &jobs.PutJobRequest{Job: &jobs.Job{
			ID:    pruneTokensActionName,
			Owner: common.PydioSystemUsername,
			Label: T("Auth.PruneJob.Title"),
			Schedule: &jobs.Schedule{
				Iso8601Schedule: "R/2012-06-04T19:25:16.828696-07:00/PT60M", // Every hour
			},
			AutoStart:      false,
			MaxConcurrency: 1,
			Actions: []*jobs.Action{{
				ID: pruneTokensActionName,
			}},
		}}, timeout)

		return e
	}, 5*time.Second)
}

var (
	pruneTokensActionName = "actions.auth.prune.tokens"
)

type PruneTokensAction struct{}

func (c *PruneTokensAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:              pruneTokensActionName,
		Label:           "Prune tokens",
		Icon:            "delete-sweep",
		Category:        actions.ActionCategoryIDM,
		Description:     "Delete expired and revoked token from internal registry",
		SummaryTemplate: "",
		HasForm:         false,
		IsInternal:      true,
	}
}

func (c *PruneTokensAction) GetParametersForm() *forms.Form {
	return nil
}

// GetName Unique identifier
func (c *PruneTokensAction) GetName() string {
	return pruneTokensActionName
}

// Init pass parameters
func (c *PruneTokensAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	return nil
}

// Run the actual action code
func (c *PruneTokensAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	T := lang.Bundle().GetTranslationFunc(i18n.GetDefaultLanguage(config.Get()))

	output := input

	// Prune revoked tokens on OAuth service
	cli := auth.NewAuthTokenPrunerClient(registry.GetClient(common.ServiceOAuth))
	if pruneResp, e := cli.PruneTokens(ctx, &auth.PruneTokensRequest{}); e != nil {
		return input.WithError(e), e
	} else {
		log.TasksLogger(ctx).Info("OAuth Service: " + T("Auth.PruneJob.Revoked", struct{ Count int32 }{Count: pruneResp.GetCount()}))
		output.AppendOutput(&jobs.ActionOutput{Success: true})
	}

	// Prune revoked tokens on OAuth service
	cli2 := auth.NewAuthTokenPrunerClient(registry.GetClient(common.ServiceToken))
	if pruneResp, e := cli2.PruneTokens(ctx, &auth.PruneTokensRequest{}); e != nil {
		return input.WithError(e), e
	} else {
		log.TasksLogger(ctx).Info("Token Service: " + T("Auth.PruneJob.Revoked", struct{ Count int32 }{Count: pruneResp.GetCount()}))
		output.AppendOutput(&jobs.ActionOutput{Success: true})
	}

	// Prune reset password tokens
	docCli := docstore.NewDocStoreClient(registry.GetClient(common.ServiceDocStore))
	deleteResponse, er := docCli.DeleteDocuments(ctx, &docstore.DeleteDocumentsRequest{
		StoreID: "resetPasswordKeys",
		Query: &docstore.DocumentQuery{
			MetaQuery: fmt.Sprintf("expiration<%d", time.Now().Unix()),
		},
	})
	if er != nil {
		return output.WithError(er), er
	} else {
		log.TasksLogger(ctx).Info(T("Auth.PruneJob.ResetToken", deleteResponse))
		output.AppendOutput(&jobs.ActionOutput{Success: true})
	}

	return output, nil
}
