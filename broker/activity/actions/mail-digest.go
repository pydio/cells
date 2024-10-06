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
	"time"

	activity2 "github.com/pydio/cells/v4/broker/activity"
	l "github.com/pydio/cells/v4/broker/activity/lang"
	"github.com/pydio/cells/v4/broker/activity/render"
	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/config/routing"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/forms"
	"github.com/pydio/cells/v4/common/permissions"
	"github.com/pydio/cells/v4/common/proto/activity"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/mailer"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/i18n/languages"
	"github.com/pydio/cells/v4/scheduler/actions"
)

const (
	digestActionName = "broker.activity.actions.mail-digest"
)

type MailDigestAction struct {
	common.RuntimeHolder
	dryRun  bool
	dryMail string
}

// GetDescription returns the action description
func (m *MailDigestAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:                digestActionName,
		Label:             "Email Digest",
		Icon:              "email-newsletter",
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
func (m *MailDigestAction) Init(job *jobs.Job, action *jobs.Action) error {
	if dR, ok := action.Parameters["dryRun"]; ok && dR == "true" {
		m.dryRun = true
	}
	if email, ok := action.Parameters["dryMail"]; ok && email != "" {
		m.dryMail = email
	}
	return nil
}

func mailerClient(ctx context.Context) mailer.MailerServiceClient {
	return mailer.NewMailerServiceClient(grpc.ResolveConn(ctx, common.ServiceMailerGRPC))
}

func activityClient(ctx context.Context) activity.ActivityServiceClient {
	return activity.NewActivityServiceClient(grpc.ResolveConn(ctx, common.ServiceActivityGRPC))
}

// Run processes the actual action code
func (m *MailDigestAction) Run(ctx context.Context, channels *actions.RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {

	if !config.Get(ctx, "services", common.ServiceMailerGRPC, "valid").Default(false).Bool() {
		log.Logger(ctx).Debug("Ignoring as no valid mailer was found")
		return input.WithIgnore(), nil
	}

	if len(input.Users) == 0 {
		return input.AsRunError(errors.WithMessage(errors.InvalidParameters, "action should be triggered with one user in input"))
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
	lang := languages.UserLanguage(ctx, userObject)

	query := &activity.StreamActivitiesRequest{
		Context:     activity.StreamContext_USER_ID,
		ContextData: userObject.Login,
		BoxName:     "inbox",
		AsDigest:    true,
	}

	streamer, e := activityClient(ctx).StreamActivities(ctx, query)
	if e != nil {
		output := input.WithError(e)
		return output, e
	}
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

	links := render.NewServerLinks()
	url := config.Get(ctx, "services", "pydio.grpc.mailer", "url").Default(routing.GetDefaultSiteURL(ctx)).String()
	linkUrl := config.Get(ctx, "services", "pydio.rest.share", "url").Default(url).String()
	if linkUrl != "" {
		links.UrlFuncs[render.ServerUrlTypeDocs] = func(object *activity.Object, label string) string {
			return render.MakeMarkdownLink(linkUrl+"/ws-"+strings.TrimLeft(object.Name, "/"), label)
		}
		links.UrlFuncs[render.ServerUrlTypeWorkspaces] = func(object *activity.Object, label string) string {
			if object.Href != "" {
				return render.MakeMarkdownLink(linkUrl+"/ws-"+strings.TrimLeft(object.Href, "/"), label)
			}
			return label
		}
		links.UrlFuncs[render.ServerUrlTypeUsers] = func(object *activity.Object, label string) string {
			if u, er := permissions.SearchUniqueUser(ctx, object.Name, ""); er == nil && u != nil && u.Attributes != nil && u.Attributes[idm.UserAttrDisplayName] != "" {
				label = u.Attributes[idm.UserAttrDisplayName]
			}
			return label
		}
		links.DateInterpreter = func(object *activity.Object, seconds int64) string {
			layout := "2006-01-02 15:04"
			if fo := l.T(lang)("DateFormat"); fo != "" {
				layout = fo
			}
			return ` - <span style="color: #BDBDBD">` + time.Unix(seconds, 0).Format(layout) + `</span>`
		}
	}

	md := render.Markdown(digest, activity.SummaryPointOfView_GENERIC, lang, links)
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

	_, err = mailerClient(ctx).SendMail(ctx, &mailer.SendMailRequest{
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
		_, err := activityClient(ctx).SetUserLastActivity(ctx, &activity.UserLastActivityRequest{
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
