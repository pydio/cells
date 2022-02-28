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

package etl

import (
	"context"
	"fmt"
	"io"
	"strconv"
	"strings"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/etl/models"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
)

type Merger struct {
	Source  models.ReadableStore
	Target  models.WritableStore
	Options *models.MergeOptions
}

type MergeOperation struct {
	Description string
	Cursor      int
	Total       int
	Error       error
}

type Converter interface {
	Convert(interface{}) ([]models.Differ, bool)
}

var (
	converters []Converter
)

func RegisterConverter(converter Converter) {
	converters = append(converters, converter)
}

func NewMerger(source models.ReadableStore, target models.WritableStore, options *models.MergeOptions) *Merger {
	return &Merger{
		Source:  source,
		Target:  target,
		Options: options,
	}
}

func (m *Merger) LoadAndDiffUsers(ctx context.Context, progress chan float32) (*models.UserDiff, *models.RoleDiff, error) {

	var p1, p2 chan float32
	if progress != nil {
		done := make(chan bool)
		p1 = make(chan float32)
		p2 = make(chan float32)
		defer close(done)
		go func() {
			for {
				select {
				case p := <-p1:
					progress <- p / 2
				case p := <-p2:
					progress <- 0.5 + p/2
				case <-done:
					progress <- 1.0
					return
				}
			}
		}()
	}
	if sourceUsers, err := m.Source.ListUsers(ctx, nil, p1); err != nil {
		return nil, nil, err
	} else {
		if targetUsers, err2 := m.Target.ListUsers(ctx, nil, p2); err2 != nil {
			return nil, nil, err
		} else {
			usersDiff, rolesDiff := m.diffUsers(sourceUsers, targetUsers)
			return usersDiff, rolesDiff, nil
		}
	}
}

func (m *Merger) diffUsers(extUsers map[string]*idm.User, apiUsers map[string]*idm.User) (*models.UserDiff, *models.RoleDiff) {
	userDiff := models.NewUserDiff()
	roleDiff := models.NewRolesDiff()

	userToDelete := make(map[string]bool)
	oldRoles := make(map[string]*idm.Role)
	activeRoles := make(map[string]*idm.Role)

	for extUserId, extUser := range extUsers {
		// Convert idm.User to User structure
		ExtUser := models.User{extUser}
		//log.Println("Get api user id: " + ExtUser.GetUniqueId())
		//log.Println("Test user ldap: %s authSource name: %s", ExtUser.GetLogin, ExtUser.GetUniqueId())
		if apiUser, ok := apiUsers[extUserId]; ok {
			for _, role := range apiUser.Roles {
				if strings.HasPrefix(role.Uuid, m.Options.RolePrefix) {
					oldRoles[role.Uuid] = role
				}
			}
			userToDelete[extUserId] = false
			if len(ExtUser.Roles) > 0 {
				log.Logger(context.Background()).Info("External has roles", zap.Int("length", len(ExtUser.Roles)))
			}
			if ExtUser.IsMergeable(apiUser) {
				user, err, shouldBeUpdated := ExtUser.Merge(apiUser, m.Options)
				if err != nil {
					return nil, nil
				}
				if shouldBeUpdated {
					user.Password = ""
					userDiff.Update[extUserId] = user
					activeUser := models.User{user}
					for _, role := range activeUser.Roles {
						if strings.HasPrefix(role.Uuid, m.Options.RolePrefix) {
							activeRoles[role.Uuid] = role
						}
					}
				} else {
					for _, role := range apiUser.Roles {
						if strings.HasPrefix(role.Uuid, m.Options.RolePrefix) {
							activeRoles[role.Uuid] = role
						}
					}
				}
			}
			// does not exist in api, add new
		} else {
			userToDelete[extUserId] = false
			if extUser.Password != "" {
				if extUser.Attributes == nil {
					extUser.Attributes = make(map[string]string, 1)
				}

				if _, ok := extUser.Attributes[idm.UserAttrPassHashed]; !ok {
					extUser.Attributes[idm.UserAttrPassHashed] = "true"
				}
			}
			userDiff.Create[extUserId] = extUser
			activeUser := models.User{extUser}
			for _, role := range activeUser.Roles {
				activeRoles[role.Uuid] = role
			}
		}
	}

	for userId, user := range apiUsers {
		UserIntact := models.User{user}
		_, exist := userToDelete[userId]

		if !exist &&
			UserIntact.Attributes[idm.UserAttrAuthSource] == m.Options.AuthSource &&
			UserIntact.Attributes[idm.UserAttrOrigin] == m.Options.Origin {
			userDiff.Delete[userId] = UserIntact.User
		}
	}

	// ROLES WILL BE HANDLED LATER ON!
	for _, role := range oldRoles {
		if _, ok := activeRoles[role.Uuid]; !ok {
			roleDiff.Delete(role)
		}
	}

	for _, role := range activeRoles {
		if _, ok := oldRoles[role.Uuid]; !ok {
			roleDiff.Add(role)
		}
	}

	return userDiff, roleDiff
}

func (m *Merger) LoadAndDiffRoles(ctx context.Context, params map[string]interface{}) (*models.RoleDiff, error) {

	diff := models.NewRolesDiff()
	src, e := m.Source.ListRoles(ctx, m.Target, params)
	if e != nil {
		return nil, e
	}
	log.Logger(ctx).Debug("Source Roles", zap.Any("params", params), zap.Int("list length", len(src)))
	target, e := m.Target.ListRoles(ctx, m.Target, params)
	if e != nil {
		return nil, e
	}
	log.Logger(ctx).Debug("Target Roles", zap.Any("params", params), zap.Int("list length", len(target)))
	m.Diff(src, target, diff)

	return diff, nil
}

func (m *Merger) LoadAndDiffACLs(ctx context.Context) (*models.ACLDiff, error) {

	if sourceACLs, err := m.Source.ListACLs(ctx, nil); err != nil {
		return nil, err
	} else {
		if targetACLs, err2 := m.Target.ListACLs(ctx, nil); err2 != nil {
			return nil, err2
		} else {
			aclsDiff := m.diffACLs(sourceACLs, targetACLs)
			return aclsDiff, nil
		}
	}
}

func (m *Merger) diffACLs(source []*idm.ACL, target []*idm.ACL) *models.ACLDiff {
	diff := new(models.ACLDiff)

	m.Diff(source, target, diff)

	return diff
}

func (m *Merger) LoadAndDiffShares(ctx context.Context, params map[string]interface{}) (*models.ShareDiff, error) {
	diff := new(models.ShareDiff)
	if src, err := m.Source.ListShares(ctx, params); err != nil {
		return nil, err
	} else {
		if target, err2 := m.Target.ListShares(ctx, params); err2 != nil {
			return nil, err2
		} else {
			m.Diff(src, target, diff)
		}
	}
	return diff, nil
}

func (m *Merger) Diff(source interface{}, target interface{}, res models.Diff) {

	var added, updated, deleted []interface{}

	for _, sourceObj := range m.convert(source) {

		found := false

		// Loop through all target data to find a match
		for _, targetObj := range m.convert(target) {
			if sourceObj.IsMergeable(targetObj) {
				found = true

				if sourceObj.Equals(targetObj) {
					// Do nothing
					continue
				}

				obj, err := sourceObj.Merge(targetObj, m.Options.ToMap())
				if err != nil {
					return
				}

				updated = append(updated, obj)
			}
		}

		if !found {
			added = append(added, sourceObj)
		}
	}

	for _, targetObj := range m.convert(target) {

		// No point checking if the target obj is not deletable
		if !targetObj.IsDeletable(m.Options.ToMap()) {
			continue
		}

		found := false
		for _, sourceObj := range m.convert(source) {
			if targetObj.IsMergeable(sourceObj) {
				found = true
				break
			}
		}

		if !found {
			deleted = append(deleted, targetObj)
		}
	}

	res.Add(added...)
	res.Update(updated...)
	res.Delete(deleted...)
}

func (m *Merger) SaveUsers(ctx context.Context, userDiff *models.UserDiff, roleDiff *models.RoleDiff, progress chan MergeOperation) {

	total := len(userDiff.Create) + len(userDiff.Delete) + len(userDiff.Update) + len(roleDiff.ToAdd()) + len(roleDiff.ToDelete()) + len(roleDiff.ToUpdate())
	cursor := 0

	for _, user := range userDiff.Delete {
		if e := m.Target.DeleteUser(ctx, user); e == nil {
			progress <- MergeOperation{
				Description: "Deleted user " + user.Login + " in store",
				Cursor:      cursor,
				Total:       total,
			}
		} else {
			progress <- MergeOperation{
				Description: "Error while deleting user " + user.Login + " in store",
				Cursor:      cursor,
				Total:       total,
				Error:       e,
			}
		}
		cursor++
	}

	for _, user := range userDiff.Create {
		if _, e := m.Target.CreateUser(ctx, user); e == nil {
			// Slow down save request to DB
			time.Sleep(5 * time.Millisecond)
			progress <- MergeOperation{
				Description: "Created user " + user.Login + " in store",
				Cursor:      cursor,
				Total:       total,
			}
		} else {
			progress <- MergeOperation{
				Description: "Error while creating user " + user.Login + " in store",
				Cursor:      cursor,
				Total:       total,
				Error:       e,
			}
		}
		cursor++

	}

	for _, user := range userDiff.Update {
		if _, e := m.Target.UpdateUser(ctx, user); e == nil {
			// Slow down save request to DB
			time.Sleep(5 * time.Millisecond)
			progress <- MergeOperation{
				Description: "Updated user " + user.Login + " in store",
				Cursor:      cursor,
				Total:       total,
			}
		} else {
			progress <- MergeOperation{
				Description: "Error while updating user " + user.Login + " in store",
				Cursor:      cursor,
				Total:       total,
				Error:       e,
			}
		}
		cursor++
	}

	for _, v := range roleDiff.ToAdd() {
		role := v.(*idm.Role)
		if _, e := m.Target.PutRole(ctx, role); e == nil {
			// Slow down save request to DB
			time.Sleep(5 * time.Millisecond)
			progress <- MergeOperation{
				Description: "Created role " + role.Uuid + " in store",
				Cursor:      cursor,
				Total:       total,
			}
		} else {
			progress <- MergeOperation{
				Description: "Error while creating role " + role.Uuid + " in store",
				Cursor:      cursor,
				Total:       total,
				Error:       e,
			}
		}
		cursor++

	}

	for _, v := range roleDiff.ToDelete() {
		role := v.(*idm.Role)
		if e := m.Target.DeleteRole(ctx, role); e == nil {
			progress <- MergeOperation{
				Description: "Deleted role " + role.Uuid + " in store",
				Cursor:      cursor,
				Total:       total,
			}
		} else {
			progress <- MergeOperation{
				Description: "Error while deleting role " + role.Uuid + " in store",
				Cursor:      cursor,
				Total:       total,
				Error:       e,
			}
		}
		cursor++
	}

	for _, v := range roleDiff.ToUpdate() {
		role := v.(*idm.Role)
		if _, e := m.Target.PutRole(ctx, role); e == nil {
			// Slow down save request to DB
			time.Sleep(5 * time.Millisecond)
			progress <- MergeOperation{
				Description: "Updated role " + role.Uuid + " in store",
				Cursor:      cursor,
				Total:       total,
			}
		} else {
			progress <- MergeOperation{
				Description: "Error while updating user " + role.Uuid + " in store",
				Cursor:      cursor,
				Total:       total,
				Error:       e,
			}
		}
		cursor++
	}
}

func (m *Merger) Create(ctx context.Context, obj interface{}) error {
	switch v := obj.(type) {
	case *idm.ACL:
		return m.Target.PutACL(ctx, v)
	case *models.SyncShare:
		return m.Target.PutShare(ctx, v)
	}

	return fmt.Errorf("Type not creatable")
}

func (m *Merger) Update(ctx context.Context, obj interface{}) error {
	switch v := obj.(type) {
	case *idm.ACL:
		return m.Target.PutACL(ctx, v)
	}

	return fmt.Errorf("Type not updateable")
}

func (m *Merger) Delete(ctx context.Context, obj interface{}) error {
	switch v := obj.(type) {
	case *idm.ACL:
		return m.Target.DeleteACL(ctx, v)
	}

	return fmt.Errorf("Type not deletable")
}

func (m *Merger) Save(ctx context.Context, diff models.Diff, progress chan MergeOperation) {

	create := diff.ToAdd()
	update := diff.ToUpdate()
	deletes := diff.ToDelete()

	total := len(create) + len(deletes) + len(update)

	cursor := 0

	// Create
	for _, obj := range create {
		if e := m.Create(ctx, obj); e == nil {
			// Slow down save request to DB
			time.Sleep(5 * time.Millisecond)
			progress <- MergeOperation{
				Description: fmt.Sprintf("Created %s in store", obj),
				Cursor:      cursor,
				Total:       total,
			}
		} else {
			progress <- MergeOperation{
				Description: fmt.Sprintf("Error while creating %s in store", obj),
				Cursor:      cursor,
				Total:       total,
				Error:       e,
			}
		}

		cursor++
	}

	// Delete
	for _, obj := range deletes {
		if e := m.Delete(ctx, obj); e == nil {
			// Slow down save request to DB
			time.Sleep(5 * time.Millisecond)
			progress <- MergeOperation{
				Description: fmt.Sprintf("Deleted %s in store", obj),
				Cursor:      cursor,
				Total:       total,
			}
		} else {
			progress <- MergeOperation{
				Description: fmt.Sprintf("Error while deleting %s in store", obj),
				Cursor:      cursor,
				Total:       total,
				Error:       e,
			}
		}

		cursor++
	}

	// Update
	for _, obj := range update {
		if e := m.Update(ctx, obj); e == nil {
			// Slow down save request to DB
			time.Sleep(5 * time.Millisecond)
			progress <- MergeOperation{
				Description: fmt.Sprintf("Updated %s in store", obj),
				Cursor:      cursor,
				Total:       total,
			}
		} else {
			progress <- MergeOperation{
				Description: fmt.Sprintf("Error while updating %s in store", obj),
				Cursor:      cursor,
				Total:       total,
				Error:       e,
			}
		}

		cursor++
	}
}

func (m *Merger) convert(i interface{}) []models.Differ {
	var res []models.Differ

	switch v := i.(type) {
	case []*idm.ACL:
		for _, a := range v {
			res = append(res, (*models.ACL)(a))
		}
	case []*models.SyncShare:
		for _, s := range v {
			res = append(res, s)
		}
	case []*idm.Role:
		for _, s := range v {
			res = append(res, (*models.Role)(s))
		}
	default:
		for _, converter := range converters {
			if r, ok := converter.Convert(v); ok {
				res = r
			}
		}
	}

	return res
}

func (m *Merger) SaveShares(ctx context.Context, diff *models.ShareDiff, progress chan MergeOperation, params map[string]interface{}) {

	total := len(diff.ToAdd())
	for i, a := range diff.ToAdd() {
		s, ok := a.(*models.SyncShare)
		if !ok {
			continue
		}
		log.Logger(ctx).Info("Cross Loading Share", zap.Any("s", s))
		e := m.Source.CrossLoadShare(ctx, s, m.Target, params)
		if e == nil {
			progress <- MergeOperation{
				Description: "Loaded share " + s.GetUniqueId(),
				Cursor:      i,
				Total:       total,
			}
			log.Logger(ctx).Debug("Share after load", zap.Any("link", s.Link), zap.Any("cell", s.Cell))
			log.Logger(ctx).Info("Migrating share ", zap.String("num", strconv.Itoa(i)+"/"+strconv.Itoa(total)))
			eS := m.Target.PutShare(ctx, s)
			if eS != nil {
				progress <- MergeOperation{
					Error:  e,
					Cursor: i,
					Total:  total,
				}
			} else {
				progress <- MergeOperation{
					Description: "Successfully created share " + s.GetUniqueId(),
					Cursor:      i,
					Total:       total,
				}
			}
		} else {
			log.Logger(ctx).Info("Error in migration of shares", zap.String(": ", strconv.Itoa(i)+"/"+strconv.Itoa(total)))
			progress <- MergeOperation{
				Error:  e,
				Cursor: i,
				Total:  total,
			}
		}
	}

}

func (m *Merger) Close() error {
	// Check if the left or right store need to be closed
	if c, ok := m.Source.(io.Closer); ok {
		if err := c.Close(); err != nil {
			return err
		}
	}

	if c, ok := m.Target.(io.Closer); ok {
		if err := c.Close(); err != nil {
			return err
		}
	}

	return nil
}
