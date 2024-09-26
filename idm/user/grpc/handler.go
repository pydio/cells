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

package grpc

import (
	"context"
	"fmt"
	"path"
	"sort"
	"strings"
	"sync"
	"time"

	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/client/commons/idmc"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/permissions"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/jobs"
	pbservice "github.com/pydio/cells/v4/common/proto/service"
	service "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage/sql/resources"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/cache"
	cache_helper "github.com/pydio/cells/v4/common/utils/cache/helper"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/propagator"
	"github.com/pydio/cells/v4/idm/user"
	"github.com/pydio/cells/v4/scheduler/tasks"
)

var (
	defaultPolicies = []*pbservice.ResourcePolicy{
		{Subject: "profile:standard", Action: pbservice.ResourcePolicyAction_READ, Effect: pbservice.ResourcePolicy_allow},
		{Subject: "profile:admin", Action: pbservice.ResourcePolicyAction_WRITE, Effect: pbservice.ResourcePolicy_allow},
	}
	cacheConfig = cache.Config{
		Eviction:    "10s",
		CleanWindow: "20s",
	}

	hasher = auth.PydioPW{
		PBKDF2_HASH_ALGORITHM: "sha256",
		PBKDF2_ITERATIONS:     1000,
		PBKDF2_SALT_BYTE_SIZE: 32,
		PBKDF2_HASH_BYTE_SIZE: 24,
		HASH_SECTIONS:         4,
		HASH_ALGORITHM_INDEX:  0,
		HASH_ITERATION_INDEX:  1,
		HASH_SALT_INDEX:       2,
		HASH_PBKDF2_INDEX:     3,
	}
)

// ByOverride implements sort.Interface for []Role based on the ForceOverride field.
type ByOverride []*idm.Role

func (a ByOverride) Len() int { return len(a) }

func (a ByOverride) Swap(i, j int) { a[i], a[j] = a[j], a[i] }

func (a ByOverride) Less(i, j int) bool { return !a[i].ForceOverride && a[j].ForceOverride }

func resolveCache(ctx context.Context) (cache.Cache, error) {
	var mgr manager.Manager
	if propagator.Get(ctx, manager.ContextKey, &mgr) {
		return mgr.GetCache(ctx, "short", map[string]interface{}{
			"evictionTime": "10s",
			"cleanWindow":  "20s",
		})
	}
	return nil, errors.New("no manager found")
}

// Handler definition
type Handler struct {
	ctx context.Context
	idm.UnimplementedUserServiceServer
	service.UnimplementedLoginModifierServer
}

func NewHandler(ctx context.Context) *Handler {
	return &Handler{
		ctx: ctx,
	}
}

// BindUser binds a user with login/password
func (h *Handler) BindUser(ctx context.Context, req *idm.BindUserRequest) (*idm.BindUserResponse, error) {

	dao, err := manager.Resolve[user.DAO](ctx)
	if err != nil {
		return nil, err
	}

	u, err := dao.Bind(ctx, req.UserName, req.Password)
	if err != nil {
		return nil, err
	}
	u.Password = ""
	resp := &idm.BindUserResponse{
		User: u,
	}
	return resp, nil

}

// CreateUser adds or creates a user or a group in the underlying database.
func (h *Handler) CreateUser(ctx context.Context, req *idm.CreateUserRequest) (*idm.CreateUserResponse, error) {
	dao, err := manager.Resolve[user.DAO](ctx)
	if err != nil {
		return nil, err
	}

	passChange := req.User.Password
	// Create or update user
	newUser, createdNodes, err := dao.Add(ctx, req.User)
	if err != nil {
		log.Logger(ctx).Error("cannot put user "+req.User.Login, req.User.ZapUuid(), zap.Error(err))
		return nil, err
	}
	resp := &idm.CreateUserResponse{}

	out := newUser.(*idm.User)
	var movedGroup string
	if out.Attributes != nil && out.Attributes["original_group"] != "" {
		movedGroup = out.Attributes["original_group"]
		delete(out.Attributes, "original_group")
	}

	if passChange != "" {
		// Check if it is a "force pass change operation".
		ctxLogin, _ := permissions.FindUserNameInContext(ctx)
		if l, ok := out.Attributes["locks"]; ok && strings.Contains(l, "pass_change") && ctxLogin == out.Login {
			if req.User.Password == req.User.OldPassword {
				return nil, fmt.Errorf("new password is the same as the old password, please use a different one")
			}
			var locks, newLocks []string
			_ = json.Unmarshal([]byte(l), &locks)
			for _, lock := range locks {
				if lock != "pass_change" {
					newLocks = append(newLocks, lock)
				}
			}
			marsh, _ := json.Marshal(newLocks)
			out.Attributes["locks"] = string(marsh)
			if _, _, e := dao.Add(ctx, out); e == nil {
				log.Logger(ctx).Info("user "+req.User.Login+" successfully updated his password", req.User.ZapUuid())
			}
		}
	}
	out.Password = ""
	resp.User = out
	if len(req.User.Policies) == 0 {
		var userPolicies []*pbservice.ResourcePolicy
		userPolicies = append(userPolicies, defaultPolicies...)
		if !req.User.IsGroup {
			// A user must be able to edit his own profile!
			userPolicies = append(userPolicies, &pbservice.ResourcePolicy{
				Subject: "user:" + out.Login,
				Action:  pbservice.ResourcePolicyAction_WRITE,
				Effect:  pbservice.ResourcePolicy_allow,
			})
		}
		req.User.Policies = userPolicies
	}
	log.Logger(ctx).Debug("ADDING POLICIES NOW", zap.Int("p length", len(req.User.Policies)), zap.Int("createdNodes length", len(createdNodes)))
	if err := dao.AddPolicies(ctx, len(createdNodes) == 0, out.Uuid, req.User.Policies); err != nil {
		return nil, err
	}
	for _, g := range createdNodes {
		if g.GetUuid() != out.Uuid && g.GetIsGroup() {
			// Groups where created in the process, add default policies on them
			log.Logger(ctx).Info("Setting Default Policies on groups that were created automatically", zap.String("groupPath", g.GetGroupPath()))
			if err := dao.AddPolicies(ctx, false, g.GetUuid(), defaultPolicies); err != nil {
				return nil, err
			}
		}
	}

	// Fix output GroupPath for Groups
	publishUser := proto.Clone(out).(*idm.User)
	if out.IsGroup {
		publishUser.GroupPath, publishUser.GroupLabel = path.Split(publishUser.GroupPath)
	}
	if len(createdNodes) == 0 {
		// Propagate creation event
		cEvent := &idm.ChangeEvent{
			Type:       idm.ChangeEventType_UPDATE,
			User:       publishUser,
			Attributes: map[string]string{},
		}
		if movedGroup != "" {
			cEvent.Attributes["original_group"] = movedGroup
		}
		if cu, _ := permissions.FindUserNameInContext(ctx); cu != "" {
			cEvent.Attributes["ctx_username"] = cu
		}
		broker.MustPublish(ctx, common.TopicIdmEvent, cEvent)
		if out.IsGroup {
			log.Auditer(ctx).Info(
				fmt.Sprintf("Updated group [%s]", out.GroupLabel),
				log.GetAuditId(common.AuditGroupUpdate),
				out.ZapUuid(),
			)
		} else {
			log.Auditer(ctx).Info(
				fmt.Sprintf("Updated user [%s]", out.Login),
				log.GetAuditId(common.AuditUserUpdate),
				out.ZapUuid(),
			)
		}
	} else {
		// Propagate creation event
		broker.MustPublish(ctx, common.TopicIdmEvent, &idm.ChangeEvent{
			Type: idm.ChangeEventType_CREATE,
			User: publishUser,
		})
		if out.IsGroup {
			log.Auditer(ctx).Info(
				fmt.Sprintf("Created group [%s]", out.GroupPath),
				log.GetAuditId(common.AuditGroupCreate),
				out.ZapUuid(),
			)
		} else {
			log.Auditer(ctx).Info(
				fmt.Sprintf("Created user [%s]", path.Join(out.GroupPath, out.Login)),
				log.GetAuditId(common.AuditUserCreate),
				out.ZapUuid(),
				zap.String("GroupPath", out.GroupPath),
			)
		}
	}
	return resp, nil
}

// DeleteUser from database
func (h *Handler) DeleteUser(ctx context.Context, req *idm.DeleteUserRequest) (*idm.DeleteUserResponse, error) {
	usersChan := make(chan *idm.User)
	done := make(chan bool)

	var autoClient *tasks.ReconnectingClient
	var task *jobs.Task
	var taskChan chan interface{}
	uName, _ := permissions.FindUserNameInContext(ctx)
	if tU, ok := propagator.CanonicalMeta(ctx, common.CtxMetaTaskUuid); ok {
		jU, _ := propagator.CanonicalMeta(ctx, common.CtxMetaJobUuid)
		task = &jobs.Task{
			JobID:        jU,
			ID:           tU,
			TriggerOwner: uName,
			Status:       jobs.TaskStatus_Running,
			HasProgress:  true,
		}
		taskChan = make(chan interface{})
		autoClient = tasks.NewTaskReconnectingClient(ctx)
		autoClient.StartListening(taskChan)
		defer autoClient.Stop()
	}

	dao, err := manager.Resolve[user.DAO](ctx)
	if err != nil {
		return nil, err
	}

	i, err := dao.Count(ctx, req.Query, true)
	if err != nil {
		return nil, err
	}
	total := float32(i)
	wg := &sync.WaitGroup{}
	wg.Add(1)

	go func() {
		defer wg.Done()
		var crt float32
		for {
			select {
			case deleted := <-usersChan:
				if deleted == nil {
					continue
				}

				if pp, er := dao.GetPoliciesForResource(ctx, deleted.Uuid); er == nil {
					deleted.Policies = pp
				} else {
					log.Logger(ctx).Warn("cannot load policies on user deletion", zap.Error(er))
				}

				_ = dao.DeletePoliciesForResource(ctx, deleted.Uuid)
				if deleted.IsGroup {
					_ = dao.DeletePoliciesBySubject(ctx, fmt.Sprintf("role:%s", deleted.Uuid))
				} else {
					_ = dao.DeletePoliciesBySubject(ctx, fmt.Sprintf("user:%s", deleted.Uuid))
				}

				// Propagate deletion event
				broker.MustPublish(ctx, common.TopicIdmEvent, &idm.ChangeEvent{
					Type: idm.ChangeEventType_DELETE,
					User: deleted,
				})
				var msg string
				if deleted.IsGroup {
					msg = fmt.Sprintf("Deleted group [%s]", path.Join(deleted.GroupPath, deleted.GroupLabel))
					log.Auditer(ctx).Info(msg, log.GetAuditId(common.AuditGroupDelete), deleted.ZapUuid())
				} else {
					msg = fmt.Sprintf("Deleted user [%s] from [%s]", deleted.Login, deleted.GroupPath)
					log.Auditer(ctx).Info(msg, log.GetAuditId(common.AuditUserDelete), deleted.ZapUuid())
				}
				crt++
				percent := crt / total
				if task != nil {
					task.Progress = percent
					task.StatusMessage = msg
					task.Status = jobs.TaskStatus_Running
					log.TasksLogger(ctx).Info(msg)
					taskChan <- task
				}

			case <-done:
				if task != nil {
					task.Progress = 1
					task.StatusMessage = "Background delete complete"
					task.EndTime = int32(time.Now().Unix())
					task.Status = jobs.TaskStatus_Finished
					taskChan <- task
				}
				return
			}
		}
	}()

	numRows, err := dao.Del(ctx, req.Query, usersChan)
	close(done)
	close(usersChan)
	if err != nil {
		if task != nil {
			task.Progress = 1
			task.StatusMessage = err.Error()
			task.Status = jobs.TaskStatus_Error
			taskChan <- task
		}
		return nil, err
	}
	wg.Wait()
	if taskChan != nil {
		close(taskChan)
	}
	return &idm.DeleteUserResponse{RowsDeleted: numRows}, nil

}

// SearchUser in database
func (h *Handler) SearchUser(request *idm.SearchUserRequest, response idm.UserService_SearchUserServer) error {

	ctx := response.Context()

	dao, err := manager.Resolve[user.DAO](ctx)
	if err != nil {
		return err
	}

	autoApplies, er := h.loadAutoAppliesRoles(ctx)
	if er != nil {
		return er
	}

	usersGroups := new([]interface{})
	request.Query = service.PrepareResourcePolicyQuery(request.Query, service.ResourcePolicyAction_READ)
	if err := dao.Search(ctx, request.Query, usersGroups); err != nil {
		return err
	}

	var e error
	for _, in := range *usersGroups {
		if usr, ok := in.(*idm.User); ok {
			usr.Password = ""
			if usr.Policies, e = dao.GetPoliciesForResource(ctx, usr.Uuid); e != nil {
				log.Logger(ctx).Error("cannot load policies for user "+usr.Uuid, zap.Error(e))
				continue
			}
			h.applyAutoApplies(usr, autoApplies)
			response.Send(&idm.SearchUserResponse{User: usr})
		} else {
			return errors.WithMessagef(errors.StatusInternalServerError, "wrong type received, should have been idm.User or idm.Group")
		}
	}

	return nil
}

func (h *Handler) SearchOne(ctx context.Context, request *idm.SearchUserRequest) (*idm.SearchUserResponse, error) {

	dao, err := manager.Resolve[user.DAO](ctx)
	if err != nil {
		return nil, err
	}

	autoApplies, er := h.loadAutoAppliesRoles(ctx)
	if er != nil {
		return nil, er
	}

	// Force offset/limit
	request.Query.Offset = 0
	request.Query.Limit = 1
	request.Query = service.PrepareResourcePolicyQuery(request.Query, service.ResourcePolicyAction_READ)
	usersGroups := new([]interface{})
	if err := dao.Search(ctx, request.Query, usersGroups); err != nil {
		return nil, err
	}
	if len(*usersGroups) == 1 {
		res := (*usersGroups)[0]
		if usr, ok := res.(*idm.User); ok {
			usr.Password = ""
			if usr.Policies, err = dao.GetPoliciesForResource(ctx, usr.Uuid); err != nil {
				tz := errors.Tag(err, errors.DAO)
				tz = errors.WithDetails(tz, "query", request.Query)
				return nil, tz
			}
			h.applyAutoApplies(usr, autoApplies)
			return &idm.SearchUserResponse{User: usr}, nil
		}
	}
	return nil, errors.WithDetails(errors.UserNotFound, "query", request.Query)
}

// CountUser in database
func (h *Handler) CountUser(ctx context.Context, request *idm.SearchUserRequest) (*idm.CountUserResponse, error) {
	dao, err := manager.Resolve[user.DAO](ctx)
	if err != nil {
		return nil, err
	}

	request.Query = service.PrepareResourcePolicyQuery(request.Query, service.ResourcePolicyAction_READ)
	total, err := dao.Count(ctx, request.Query)
	if err != nil {
		return nil, err
	}
	return &idm.CountUserResponse{Count: int32(total)}, nil

}

// StreamUser from database
func (h *Handler) StreamUser(streamer idm.UserService_StreamUserServer) error {

	ctx := streamer.Context()

	dao, err := manager.Resolve[user.DAO](ctx)
	if err != nil {
		return err
	}

	autoApplies, e := h.loadAutoAppliesRoles(ctx)
	if e != nil {
		return e
	}

	for {
		incoming, err := streamer.Recv()
		if incoming == nil || err != nil {
			break
		}

		users := new([]interface{})
		incoming.Query = service.PrepareResourcePolicyQuery(incoming.Query, service.ResourcePolicyAction_READ)
		if err := dao.Search(ctx, incoming.Query, users); err != nil {
			return err
		}

		for _, in := range *users {
			if usr, ok := in.(*idm.User); ok {
				usr.Password = ""
				h.applyAutoApplies(usr, autoApplies)
				streamer.Send(&idm.SearchUserResponse{User: usr})
			}
		}

		streamer.Send(nil)
	}

	return nil
}

// applyAutoApplies tries to find if some roles must be added to this user.
// If necessary, it adds role to the list AFTER the groupRoles and before other roles.
func (h *Handler) applyAutoApplies(usr *idm.User, autoApplies map[string][]*idm.Role) {
	// Apply automatically role for profile
	if usr.Attributes != nil {
		if profile, ok := usr.Attributes[idm.UserAttrProfile]; ok {
			// For shared users, disable group roles inheritance
			if profile == common.PydioProfileShared || profile == common.PydioProfileAnon {
				var newRoles []*idm.Role
				for _, role := range usr.Roles {
					if !role.GroupRole {
						newRoles = append(newRoles, role)
					}
				}
				usr.Roles = newRoles
			}
			if len(autoApplies) == 0 {
				return
			}
			// Apply AutoApply role if any
			if applies, has := autoApplies[profile]; has {
				var newRoles []*idm.Role
				var added = false
				for _, crt := range usr.Roles {
					if !added && !crt.GroupRole {
						newRoles = append(newRoles, applies...)
						added = true
					}
					newRoles = append(newRoles, crt)
				}
				usr.Roles = newRoles
			}
		}
	}
	// Sort so that ForceOverride are at the bottom of the list
	var head, body, foot []*idm.Role
	for _, r := range usr.Roles {
		if r.GroupRole {
			head = append(head, r)
		} else if r.UserRole {
			foot = append(foot, r)
		} else {
			body = append(body, r)
		}
	}
	sort.Sort(ByOverride(body))
	all := append(head, body...)
	all = append(all, foot...)
	usr.Roles = all

}

// LoadAutoAppliesRoles performs a request to the Roles service to find all roles that have a non-empty list
// of "AutoApplies" : these roles must be applied to user with a given profile.
func (h *Handler) loadAutoAppliesRoles(ctx context.Context) (autoApplies map[string][]*idm.Role, err error) {

	// Check if it's not already cached
	ca, cer := cache_helper.ResolveCache(ctx, "short", cacheConfig)
	if cer == nil && ca.Get("autoApplies", &autoApplies) {
		return
	}

	autoApplies = make(map[string][]*idm.Role)
	roleCli := idmc.RoleServiceClient(ctx) //idm.NewRoleServiceClient(grpc.ResolveConn(h.ctx, common.ServiceRole))
	q, _ := anypb.New(&idm.RoleSingleQuery{HasAutoApply: true})
	stream, e := roleCli.SearchRole(ctx, &idm.SearchRoleRequest{Query: &pbservice.Query{SubQueries: []*anypb.Any{q}}})
	if e != nil {
		return autoApplies, e
	}
	for {
		resp, e := stream.Recv()
		if e != nil {
			break
		}
		applies := resp.Role.AutoApplies
		for _, profileId := range applies {
			var data []*idm.Role
			var ok bool
			if data, ok = autoApplies[profileId]; !ok {
				data = []*idm.Role{}
			}
			data = append(data, resp.Role)
			autoApplies[profileId] = data
		}
	}

	if cer == nil {
		_ = ca.Set("autoApplies", autoApplies)
	}

	return
}

func (h *Handler) ModifyLogin(ctx context.Context, req *service.ModifyLoginRequest) (resp *service.ModifyLoginResponse, err error) {
	dao, err := manager.Resolve[user.DAO](ctx)
	if err != nil {
		return nil, err
	}

	var mm []string

	if req.GetDryRun() {

		// Check user in Tree
		usersGroups := new([]interface{})
		uQ, _ := anypb.New(&idm.UserSingleQuery{Login: req.OldLogin})
		er := dao.Search(ctx, &service.Query{SubQueries: []*anypb.Any{uQ}}, usersGroups)
		if er != nil {
			return nil, er
		}
		for _, us := range *usersGroups {
			if usr, ok := us.(*idm.User); ok {
				mm = append(mm, "Found user "+usr.GetLogin()+" ("+usr.GetUuid()+") in group "+usr.GetGroupPath())
			}
		}

	} else {
		// Apply change in Tree
		if uCount, er := dao.UpdateNameInPlace(ctx, req.OldLogin, req.NewLogin, "", -1); er != nil {
			return nil, er
		} else {
			mm = append(mm, fmt.Sprintf("Replace %d user(s) in index table", uCount))
		}

		// Apply change in Attributes
		if aCount, er := dao.LoginModifiedAttr(ctx, req.OldLogin, req.NewLogin); er != nil {
			return nil, er
		} else {
			mm = append(mm, fmt.Sprintf("Replace %d user(s) in attributes table", aCount))
		}

	}

	// Apply Policies
	if ppr, er := resources.ModifyLogin(ctx, dao, req); er != nil {
		return nil, er
	} else {
		mm = append(mm, ppr.Messages...)
	}

	return &service.ModifyLoginResponse{Messages: mm, Success: true}, nil
}
