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

package scheduler

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/dchest/uniuri"
	"github.com/gosimple/slug"
	"github.com/micro/go-micro/client"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/scheduler/actions"
)

var (
	fakeUserCreationActionName = "fake.users.creation"
)

type FakeUsersAction struct {
	prefix string
	number int64
}

// GetName returns this action unique identifier
func (f *FakeUsersAction) GetName() string {
	return fakeUserCreationActionName
}

// Implement ControllableAction
func (f *FakeUsersAction) CanPause() bool {
	return false
}

// Implement ControllableAction
func (f *FakeUsersAction) CanStop() bool {
	return false
}

// ProvidesProgress mocks ProgressProviderAction interface method
func (f *FakeUsersAction) ProvidesProgress() bool {
	return true
}

// Init passes parameters to the action
func (f *FakeUsersAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	f.prefix = "user-"
	f.number = 200
	if prefix, ok := action.Parameters["prefix"]; ok {
		f.prefix = prefix
	}
	if strNumber, ok := action.Parameters["ticker"]; ok {
		if number, err := strconv.ParseInt(strNumber, 10, 64); err == nil {
			f.number = number
		}
	}
	return nil
}

// Run the actual action code
func (f *FakeUsersAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {
	log.Logger(ctx).Info("Starting fake users creation")

	outputMessage := input
	outputMessage.AppendOutput(&jobs.ActionOutput{StringBody: "Hello World"})

	userServiceClient := idm.NewUserServiceClient(registry.GetClient(common.SERVICE_USER))
	rolesServiceClient := idm.NewRoleServiceClient(registry.GetClient(common.SERVICE_ROLE))
	builder := service.NewResourcePoliciesBuilder()

	groupPaths := []string{"/"}
	// Create Groups
	for _, g := range []string{"Sales", "Marketing", "Developers", "Support"} {
		groupName := slug.Make(g)
		groupPaths = append(groupPaths, "/"+groupName)
		if r, e := userServiceClient.CreateUser(ctx, &idm.CreateUserRequest{
			User: &idm.User{
				IsGroup:    true,
				GroupLabel: groupName,
				GroupPath:  "/" + groupName,
				Attributes: map[string]string{"displayName": g},
				Policies:   builder.Reset().WithProfileRead(common.PYDIO_PROFILE_STANDARD).WithProfileWrite(common.PYDIO_PROFILE_ADMIN).Policies(),
			},
		}); e == nil {
			rolesServiceClient.CreateRole(ctx, &idm.CreateRoleRequest{
				Role: &idm.Role{
					Uuid:      r.User.Uuid,
					Label:     slug.Make(groupName),
					GroupRole: true,
					Policies:  r.User.Policies,
				},
			})
		}
	}

	steps := float32(f.number)
	step := float32(0)
	rand.Seed(time.Now().Unix())

	for i := int64(0); i < f.number; i++ {
		s := uniuri.NewLen(4)
		login := fmt.Sprintf("%s-%s-%d", f.prefix, s, i+1)
		label := login
		region := "France"
		if response, err := http.Get("https://uinames.com/api/?region=france"); err == nil {
			if contents, err := ioutil.ReadAll(response.Body); err == nil {
				type Response struct {
					Name    string `json:"name"`
					Surname string `json:"surname"`
					Region  string `json:"region"`
					Gender  string `json:"gender"`
				}
				var data Response
				if e := json.Unmarshal(contents, &data); e == nil {
					label = fmt.Sprintf("%s %s", data.Name, data.Surname)
					login = slug.Make(label)
					region = data.Region
				}
			}
			response.Body.Close()
		}
		groupPath := groupPaths[rand.Intn(len(groupPaths))]
		if response, err := userServiceClient.CreateUser(ctx, &idm.CreateUserRequest{
			User: &idm.User{
				Login:     login,
				Password:  "azeazeaze",
				GroupPath: groupPath,
				Attributes: map[string]string{
					"displayName": label,
					"country":     region,
					"profile":     "standard",
				},
				Policies: builder.Reset().WithStandardUserPolicies(login).Policies(),
			},
		}); err != nil {
			output := input.WithError(err)
			return output, err
		} else {
			_, e := rolesServiceClient.CreateRole(ctx, &idm.CreateRoleRequest{
				Role: &idm.Role{
					Uuid:     response.User.Uuid,
					Label:    slug.Make(label),
					UserRole: true,
					Policies: builder.Reset().WithStandardUserPolicies(login).Policies(),
				},
			})
			if e != nil {
				return input.WithError(e), e
			}
		}
		step = float32(i)
		channels.Progress <- step / steps
		channels.StatusMsg <- "Created user " + label
		<-time.After(100 * time.Millisecond)
	}

	return outputMessage, nil
}
