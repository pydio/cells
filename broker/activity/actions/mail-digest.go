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

package actions

import (
	"context"
	"strings"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	activity2 "github.com/pydio/cells/broker/activity"
	"github.com/pydio/cells/broker/activity/render"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/forms"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/activity"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/mailer"
	"github.com/pydio/cells/common/utils/i18n"
	"github.com/pydio/cells/scheduler/actions"
)

const (
	digestActionName = "broker.activity.actions.mail-digest"
)

type MailDigestAction struct {
	mailerClient   mailer.MailerServiceClient
	activityClient activity.ActivityServiceClient
	userClient     idm.UserServiceClient
	dryRun         bool
	dryMail        string
}

// GetDescription returns the action description
func (m *MailDigestAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:                digestActionName,
		Label:             "Email Digest",
		Icon:              "email",
		Category:          actions.ActionCategoryNotify,
		InputDescription:  "Single-selection of one user",
		OutputDescription: "Returns unchanged input",
		Description:       "Compute a summary of last notifications and send to user",
		SummaryTemplate:   "",
		HasForm:           false,
	}
}

// GetParametersForm returns an UX Form
func (m *MailDigestAction) GetParametersForm() *forms.Form {
	return nil
}

// GetName returns the Unique Identifier of the MailDigestAction.
func (m *MailDigestAction) GetName() string {
	return digestActionName
}

// Init passes parameters to a newly created instance.
func (m *MailDigestAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	if dR, ok := action.Parameters["dryRun"]; ok && dR == "true" {
		m.dryRun = true
	}
	if email, ok := action.Parameters["dryMail"]; ok && email != "" {
		m.dryMail = email
	}
	m.mailerClient = mailer.NewMailerServiceClient(common.ServiceGrpcNamespace_+common.ServiceMailer, cl)
	m.activityClient = activity.NewActivityServiceClient(common.ServiceGrpcNamespace_+common.ServiceActivity, cl)
	m.userClient = idm.NewUserServiceClient(common.ServiceGrpcNamespace_+common.ServiceUser, cl)
	return nil
}

// Run processes the actual action code
func (m *MailDigestAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	if !config.Get("services", common.ServiceGrpcNamespace_+common.ServiceMailer, "valid").Default(false).Bool() {
		log.Logger(ctx).Debug("Ignoring as no valid mailer was found")
		return input.WithIgnore(), nil
	}

	if len(input.Users) == 0 {
		e := errors.BadRequest(digestActionName, "action should be triggered with one user in input")
		return input.WithError(e), e
	}
	userObject := input.Users[0]
	ctx = auth.WithImpersonate(ctx, input.Users[0])

	var email, displayName string
	var has bool

	if email, has = userObject.Attributes["email"]; !has {
		// Ignoring as the user has no email address set up
		return input.WithIgnore(), nil
	}
	if displayName, has = userObject.Attributes["displayName"]; !has {
		displayName = userObject.Login
	}
	lang := i18n.UserLanguage(ctx, userObject, config.Get())

	query := &activity.StreamActivitiesRequest{
		Context:     activity.StreamContext_USER_ID,
		ContextData: userObject.Login,
		BoxName:     "inbox",
		AsDigest:    true,
	}

	streamer, e := m.activityClient.StreamActivities(ctx, query)
	if e != nil {
		output := input.WithError(e)
		return output, e
	}
	defer streamer.Close()
	var collection []*activity.Object
	for {
		resp, e := streamer.Recv()
		if e != nil {
			break
		}
		if resp == nil {
			continue
		}
		collection = append(collection, resp.Activity)
	}
	if len(collection) == 0 {
		log.TasksLogger(ctx).Info("No new activities detected for user " + userObject.Login)
		return input, nil
	}

	digest, err := activity2.Digest(ctx, collection)
	if err != nil {
		return input.WithError(err), err
	}

	md := render.Markdown(digest, activity.SummaryPointOfView_GENERIC, lang)
	if strings.TrimSpace(md) == "" {
		//log.Logger(ctx).Warn("Computed digest is empty, this is not expected (probably an unsupported AS2.ObjectType).")
		return input.WithIgnore(), nil
	}

	user := &mailer.User{
		Uuid:     userObject.Uuid,
		Address:  email,
		Name:     displayName,
		Language: lang,
	}
	if m.dryRun && m.dryMail != "" {
		user.Address = m.dryMail
	}

	_, err = m.mailerClient.SendMail(ctx, &mailer.SendMailRequest{
		Mail: &mailer.Mail{
			TemplateId:      "Digest",
			ContentMarkdown: md,
			To:              []*mailer.User{user},
		},
	})
	if err != nil {
		return input.WithError(err), err
	}

	log.TasksLogger(ctx).Info("Digest sent to user "+userObject.Login, userObject.ZapLogin())
	if len(collection) > 0 && !m.dryRun {
		lastActivity := collection[0] // Activities are in reverse order, the first one is the last id
		_, err := m.activityClient.SetUserLastActivity(ctx, &activity.UserLastActivityRequest{
			ActivityId: lastActivity.Id,
			UserId:     userObject.Login,
			BoxName:    "lastsent",
		})
		if err != nil {
			return input.WithError(err), err
		}
	}
	return input, nil
}
