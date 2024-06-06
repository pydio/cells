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

package sql

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"
	"unicode"

	"go.uber.org/zap"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
	"google.golang.org/protobuf/types/known/anypb"
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	service "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/sql"
	index "github.com/pydio/cells/v4/common/sql/indexgorm"
	"github.com/pydio/cells/v4/common/sql/resources"
	"github.com/pydio/cells/v4/idm/user"
	user_model "github.com/pydio/cells/v4/idm/user/dao/sql/model"
)

const (
	indexLen = 767
)

var (
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

type resourcesDAO resources.DAO

type indexDAO index.DAO

func init() {
	user.Drivers.Register(NewDAO)
}

// NewDAO wraps passed DAO with specific Pydio implementation of User DAO and returns it.
func NewDAO(db *gorm.DB) user.DAO {
	resDAO := resources.NewDAO(db)
	idxDAO := index.NewDAO[*user_model.User](db)

	return &sqlimpl{
		db:           db,
		resourcesDAO: resDAO,
		indexDAO:     idxDAO,
	}
}

// Impl of the SQL interface
type sqlimpl struct {
	db *gorm.DB

	once *sync.Once

	resourcesDAO
	indexDAO

	// Handle logins in Case-Insensitive fashion
	loginCI bool
}

// var _ dao.DAO = (*sqlimpl)(nil)
var _ user.DAO = (*sqlimpl)(nil)

// Init handler for the SQL DAO
//func (s *sqlimpl) Init(ctx context.Context, options configx.Values) error {
//
//	s.instance().AutoMigrate(&user_model.User{}, &user_model.UserRole{}, &user_model.UserAttribute{})
//
//	// Preparing the resources
//	if err := s.resourcesDAO.Init(ctx, options); err != nil {
//		return fmt.Errorf("cannot initialise resources DAO: %v", err)
//	}
//
//	// Preparing the index
//	if err := s.indexDAO.Init(ctx, options); err != nil {
//		return fmt.Errorf("cannot initialise index DAO: %v", err)
//	}
//
//	s.indexDAO.FixRandHash2(ctx)
//
//	if options.Val("loginCI").Default(false).Bool() {
//		s.loginCI = true
//	}
//
//	return nil
//}

func safeGroupPath(gPath string) string {
	return fmt.Sprintf("/%s", strings.Trim(gPath, "/"))
}

func (s *sqlimpl) instance(ctx context.Context) *gorm.DB {
	if s.once == nil {
		s.once = &sync.Once{}
	}

	db := s.db.Session(&gorm.Session{SkipDefaultTransaction: true}).WithContext(ctx)

	s.once.Do(func() {
		db.AutoMigrate(&user_model.User{}, &user_model.UserRole{}, &user_model.UserAttribute{})
	})

	return db
}

// Add to the underlying SQL DB.
func (s *sqlimpl) Add(ctx context.Context, in interface{}) (interface{}, []*idm.User, error) {

	var createdNodes []*idm.User

	var user *idm.User

	var ok bool
	if user, ok = in.(*idm.User); !ok {
		return nil, createdNodes, fmt.Errorf("invalid format, expecting idm.User")
	}

	user.GroupPath = safeGroupPath(user.GroupPath)

	// Now carry on to potential updates
	var node *user_model.User
	if !user.IsGroup {
		if len(user.Login) == 0 {
			return nil, createdNodes, fmt.Errorf("warning, cannot create a user with an empty login")
		}
		node = userToNode(user)
	} else {
		node = groupToNode(user)
	}

	mpath, created, err := s.indexDAO.Path(ctx, node, &user_model.User{}, true)
	if err != nil && err != gorm.ErrDuplicatedKey {
		return nil, createdNodes, err
	}

	if err == gorm.ErrDuplicatedKey {
		// Node uuid already exists somewhere else, we just need to move it to its new location
		nodeFrom, err := s.indexDAO.GetNodeByUUID(ctx, node.GetNode().GetUuid())
		if err != nil {
			return nil, createdNodes, err
		}
		s.rebuildGroupPath(ctx, nodeFrom)

		if nodeFrom.GetNode().GetPath() != node.GetNode().GetPath() {
			log.Logger(context.Background()).Debug("MOVE TREE", zap.Any("from", nodeFrom), zap.Any("to", node))
			if err := s.indexDAO.MoveNodeTree(ctx, nodeFrom, node); err != nil {
				return nil, createdNodes, err
			}
		} else {
			// TODO - this is a simple update
		}
	} else if len(created) == 0 {
		// A node already exists at the target path, we just need to update it
		nodeFrom, err := s.indexDAO.GetNode(ctx, mpath)
		if err != nil {
			return nil, createdNodes, err
		}

		node.GetNode().SetUuid(nodeFrom.GetNode().GetUuid())
		node.SetMPath(nodeFrom.GetMPath())
		node.SetName(nodeFrom.GetName())

		if err := s.indexDAO.SetNode(ctx, node); err != nil {
			return nil, createdNodes, err
		}

		nodeToUser(node, user)
	} else {
		node = created[0].(*user_model.User)
		user.Uuid = node.GetNode().GetUuid()
		if node.GetNode().IsLeaf() {
			nodeToUser(node, user)
		} else {
			nodeToGroup(node, user)
		}
	}

	//var needsUpdate bool
	//if !user.IsGroup && len(created) == 0 && node.GetNode().GetEtag() != "" {
	//	// This is an explicit password update
	//	log.Logger(context.Background()).Debug("User update w/ password")
	//	needsUpdate = true
	//} else if !user.IsGroup && len(created) > 0 && user.Password == "" {
	//	// User has been created with an empty password! Generate a random strong one now
	//	log.Logger(context.Background()).Warn("Generating random password for new user")
	//	needsUpdate = true
	//	node.GetNode().SetEtag(hasher.CreateHash(string(auth.RandStringBytes(20))))
	//}
	//
	//if needsUpdate {
	//	updateNode := &user_model.User{}
	//	updateNode.SetMPath(mPath)
	//	if mPath.Length() <= 1 {
	//		// This should never happen, it will delete the root!
	//		return nil, createdNodes, fmt.Errorf("interrupting, about to delNode a unique MPath (%s)", mPath.String())
	//	}
	//	if err := s.indexDAO.DelNode(ctx, updateNode); err != nil {
	//		return nil, createdNodes, err
	//	}
	//	newMPath, _, err := s.indexDAO.Path(ctx, node, &user_model.User{}, true)
	//	if err != nil {
	//		return nil, createdNodes, err
	//	}
	//	mPath = newMPath
	//}
	//if user.Uuid == "" {
	//	foundOrCreatedNode, err := s.indexDAO.GetNode(ctx, mPath)
	//	if err != nil {
	//		return nil, createdNodes, err
	//	}
	//	user.Uuid = foundOrCreatedNode.GetNode().GetUuid()
	//}

	// Remove existing attributes and roles, replace with new ones using a transaction
	if user.GroupLabel != "" {
		if user.Attributes == nil {
			user.Attributes = make(map[string]string, 1)
		}
		user.Attributes[idm.UserAttrLabelLike] = toASCII(user.GroupLabel)
		if user.Attributes[idm.UserAttrDisplayName] != "" {
			user.Attributes[idm.UserAttrLabelLike] = toASCII(user.Attributes[idm.UserAttrDisplayName])
		}
	} else if user.Login != "" {
		if user.Attributes == nil {
			user.Attributes = make(map[string]string, 1)
		}
		user.Attributes[idm.UserAttrLabelLike] = toASCII(user.Login)
		if user.Attributes[idm.UserAttrDisplayName] != "" {
			user.Attributes[idm.UserAttrLabelLike] = toASCII(user.Attributes[idm.UserAttrDisplayName])
		}
	}

	if err := s.instance(ctx).Transaction(func(tx *gorm.DB) error {
		delAttributes := tx.Where(&user_model.UserAttribute{UUID: user.Uuid}).Delete(&user_model.UserAttribute{})
		if delAttributes.Error != nil {
			return delAttributes.Error
		}

		for name, val := range user.Attributes {
			addAttribute := tx.Create(&user_model.UserAttribute{
				UUID:  user.Uuid,
				Name:  name,
				Value: val,
			})
			if addAttribute.Error != nil {
				return addAttribute.Error
			}
		}

		delUserRoles := tx.Where(&user_model.UserRole{UUID: user.Uuid}).Delete(&user_model.UserRole{})
		if delUserRoles.Error != nil {
			return delUserRoles.Error
		}

		uProf := ""
		if p, o := user.Attributes[idm.UserAttrProfile]; o {
			uProf = p
		}
		var weight int
		for _, role := range user.Roles {
			if role.UserRole || role.GroupRole || s.skipRoleAsAutoApplies(uProf, role) {
				continue
			}
			addUserRole := tx.Create(&user_model.UserRole{
				UUID:   user.Uuid,
				Role:   role.Uuid,
				Weight: weight,
			})
			weight++
			if addUserRole.Error != nil {
				return addUserRole.Error
			}
		}

		return nil
	}); err != nil {
		return nil, nil, err
	}

	for _, n := range created {
		um := n.(*user_model.User)
		createdNodes = append(createdNodes, &idm.User{
			Uuid:      um.GetNode().GetUuid(),
			GroupPath: um.GetNode().GetPath(),
			Login:     um.GetName(),
			IsGroup:   um.GetNode().GetType() == tree.NodeType_COLLECTION,
		})
	}

	//if movedOriginalPath != "" {
	//	user.Attributes["original_group"] = movedOriginalPath
	//}

	return user, createdNodes, nil
}

// skipRoleAsAutoApplies Check if role is here because of autoApply - if so, do not save
func (s *sqlimpl) skipRoleAsAutoApplies(profile string, role *idm.Role) bool {
	if profile == "" || len(role.AutoApplies) == 0 {
		return false
	}
	for _, p := range role.AutoApplies {
		if p == profile {
			return true
		}
	}
	return false
}

// Bind finds a user in the DB, and verify that password is correct.
// Password is passed in clear form, hashing method is kept internal to the user service
func (s *sqlimpl) Bind(ctx context.Context, userName string, password string) (user *idm.User, e error) {

	q := &idm.UserSingleQuery{
		Login: userName,
	}
	qA, _ := anypb.New(q)

	var results []interface{}
	er := s.Search(ctx, &service.Query{SubQueries: []*anypb.Any{qA}}, &results)
	if er != nil {
		return nil, er
	}

	if len(results) == 0 {
		// The error code is actually very important
		return nil, errors.NotFound(common.ServiceUser, "cannot find user %s", userName)
	}
	object := results[0]
	user = object.(*idm.User)

	if s.loginCI {
		if !strings.EqualFold(user.Login, userName) {
			return nil, errors.NotFound(common.ServiceUser, "cannot find user %s", userName)
		}
	} else {
		if user.Login != userName {
			return nil, errors.NotFound(common.ServiceUser, "cannot find user %s", userName)
		}
	}

	hashedPass := user.Password

	// Check password
	valid, _ := hasher.CheckDBKDF2PydioPwd(password, hashedPass)
	if valid {
		return user, nil
	}

	// Check with legacy format (coming from PHP, Salt []byte is built differently)
	valid, _ = hasher.CheckDBKDF2PydioPwd(password, hashedPass, true)
	if valid {
		return user, nil
	}

	return nil, errors.Forbidden(common.ServiceUser, "password does not match")

}

func (s *sqlimpl) TouchUser(ctx context.Context, userUuid string) error {
	node := &user_model.User{}
	node.SetNode(&tree.Node{
		Uuid:  userUuid,
		MTime: time.Now().Unix(),
	})

	return s.indexDAO.SetNode(ctx, node)

}

// Count counts the number of users matching the passed query in the SQL DB.
func (s *sqlimpl) Count(ctx context.Context, query sql.Enquirer, includeParents ...bool) (int, error) {
	var includeParent bool
	if len(includeParents) > 0 && includeParents[0] {
		includeParent = includeParents[0]
	}
	converter := &queryConverter{
		treeDao:       s.indexDAO,
		includeParent: includeParent,
		loginCI:       s.loginCI,
	}

	var total int64
	db, er := sql.NewQueryBuilder[*gorm.DB](query, converter, s.resourcesDAO.(sql.Converter[*gorm.DB])).Build(ctx, s.instance(ctx).Model(&user_model.User{}))
	if er != nil {
		return 0, er
	}
	tx := db.Count(&total)
	if tx.Error != nil {
		return 0, tx.Error
	}

	return int(total), nil
}

// Search in the SQL DB
func (s *sqlimpl) Search(ctx context.Context, query sql.Enquirer, users *[]interface{}, withParents ...bool) error {

	var includeParents bool
	if len(withParents) > 0 {
		includeParents = withParents[0]
	}

	converter := &queryConverter{
		treeDao:       s.indexDAO,
		includeParent: includeParents,
		loginCI:       s.loginCI,
	}
	// log.Logger(context.Background()).Debug("Users Search Query ", zap.String("q", queryString), log.DangerouslyZapSmallSlice("q2", query.GetSubQueries()))
	ctx, cancel := context.WithTimeout(context.Background(), sql.LongConnectionTimeout)
	defer cancel()

	var rows []*user_model.User
	db, er := sql.NewQueryBuilder[*gorm.DB](query, converter, s.resourcesDAO.(sql.Converter[*gorm.DB])).Build(ctx, s.instance(ctx))
	if er != nil {
		return er
	}

	tx := db.WithContext(ctx).Find(&rows)

	if tx.Error != nil {
		return tx.Error
	}

	for _, row := range rows {

		s.rebuildGroupPath(ctx, row)

		userOrGroup := &idm.User{}

		if row.GetNode().GetType() == tree.NodeType_COLLECTION {
			nodeToGroup(row, userOrGroup)
		} else {
			nodeToUser(row, userOrGroup)

			var roles []*user_model.UserRole

			q := user_model.Use(s.instance(ctx))

			s.instance(ctx).Where(q.UserRole.UUID.Eq(userOrGroup.Uuid)).Find(&roles)

			for _, role := range roles {
				userOrGroup.Roles = append(userOrGroup.Roles, &idm.Role{Uuid: role.Role, Label: role.Role})
			}
			// User Role
			userOrGroup.Roles = append(userOrGroup.Roles, &idm.Role{Uuid: userOrGroup.Uuid, Label: userOrGroup.Login, UserRole: true})
		}

		// User Role
		userOrGroup.Attributes = make(map[string]string)

		var attributes []*user_model.UserAttribute

		q := user_model.Use(s.instance(ctx))

		s.instance(ctx).Where(q.UserAttribute.UUID.Eq(userOrGroup.Uuid)).Find(&attributes)

		for _, attribute := range attributes {
			userOrGroup.Attributes[attribute.Name] = attribute.Value
		}

		*users = append(*users, userOrGroup)

	}

	//log.Logger(context.Background()).Debug("Monitor DBStats after search", zap.Any("stats", s.SQLConn.DB.Stats()))

	return nil
}

// Del from the SQL DB
func (s *sqlimpl) Del(ctx context.Context, query sql.Enquirer, users chan *idm.User) (int64, error) {

	var rows []*user_model.User
	converter := &queryConverter{
		treeDao:       s.indexDAO,
		includeParent: true,
		loginCI:       s.loginCI,
	}
	db, er := sql.NewQueryBuilder[*gorm.DB](query, converter, s.resourcesDAO.(sql.Converter[*gorm.DB])).Build(ctx, s.instance(ctx))
	if er != nil {
		return 0, er
	}
	if len(db.Statement.Clauses) == 0 {
		return 0, fmt.Errorf("condition cannot be empty")
	}
	tx := db.WithContext(ctx).Find(&rows)
	if tx.Error != nil {
		return 0, tx.Error
	}

	type delStruct struct {
		node   *user_model.User
		object *idm.User
	}
	log.Logger(context.Background()).Debug("Delete")

	var data []*delStruct

	for _, row := range rows {
		s.rebuildGroupPath(ctx, row)

		userOrGroup := &idm.User{}
		if row.Node.Type == tree.NodeType_COLLECTION {
			nodeToGroup(row, userOrGroup)
		} else {
			nodeToUser(row, userOrGroup)
		}

		data = append(data, &delStruct{node: row, object: userOrGroup})
	}

	var count = int64(0)
	for _, toDel := range data {

		if err := s.indexDAO.DelNode(ctx, toDel.node); err != nil {
			return count, err
		}

		if err := s.deleteNodeData(ctx, toDel.node.GetNode().GetUuid()); err != nil {
			return count, err
		}

		users <- toDel.object
		count++
	}

	return count, nil
}

func (s *sqlimpl) CleanRole(ctx context.Context, roleId string) error {

	db := s.instance(ctx)

	q := user_model.Use(db)

	tx := db.Where(q.UserRole.Role.Eq(roleId)).Delete(&user_model.UserRole{})
	if tx.Error != nil {
		return tx.Error
	}

	return nil

}

func (s *sqlimpl) LoginModifiedAttr(ctx context.Context, oldName, newName string) (int64, error) {

	db := s.instance(ctx)

	tx := db.Model(&user_model.UserAttribute{}).
		Where("name = ?", "pydio:labelLike").
		Where("value = ?", oldName).
		Update("value", newName)

	if tx.Error != nil {
		return 0, tx.Error
	}

	return tx.RowsAffected, nil
}

func (s *sqlimpl) deleteNodeData(ctx context.Context, uuid string) error {

	db := s.instance(ctx)

	q := user_model.Use(db)

	if tx := db.Where(q.UserAttribute.UUID.Eq(uuid)).Delete(&user_model.UserAttribute{}); tx.Error != nil {
		return tx.Error
	}

	if tx := db.Where(q.UserRole.UUID.Eq(uuid)).Delete(&user_model.UserRole{}); tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (s *sqlimpl) rebuildGroupPath(ctx context.Context, node tree.ITreeNode) {
	if len(node.GetNode().GetPath()) == 0 {
		var path []string
		roles := []string{}
		for pNode := range s.indexDAO.GetNodes(ctx, node.GetMPath().Parents()...) {
			path = append(path, pNode.GetName())
			roles = append(roles, pNode.GetNode().GetUuid())
		}
		path = append(path, node.GetName())
		p := strings.Join(path, "/")
		node.GetNode().SetPath(fmt.Sprintf("/%s", strings.TrimLeft(p, "/")))
		node.GetNode().MustSetMeta("GroupRoles", roles)
	}

}

// where t.mpath = ?
func getMPathEquals(mpath []byte) string {
	var res []string

	for {
		cnt := (len(mpath) - 1) / indexLen
		res = append(res, fmt.Sprintf(`mpath%d LIKE "%s"`, cnt+1, mpath[(cnt*indexLen):]))

		if idx := cnt * indexLen; idx == 0 {
			break
		}

		mpath = mpath[0 : cnt*indexLen]
	}

	return strings.Join(res, " and ")
}

// t.mpath LIKE ?
func getMPathLike(mpath []byte) string {
	var res []string

	mpath = append(mpath, []byte(".%")...)

	done := false
	for {
		cnt := (len(mpath) - 1) / indexLen
		if !done {
			res = append(res, fmt.Sprintf(`mpath%d LIKE "%s"`, cnt+1, mpath[(cnt*indexLen):]))
			done = true
		} else {
			res = append(res, fmt.Sprintf(`mpath%d LIKE "%s"`, cnt+1, mpath[(cnt*indexLen):]))
		}

		if idx := cnt * indexLen; idx == 0 {
			break
		}

		mpath = mpath[0 : cnt*indexLen]
	}

	return strings.Join(res, " and ")
}

func isMn(r rune) bool {
	return unicode.Is(unicode.Mn, r) // Mn: nonspacing marks
}

// toASCII removes accented chars and converts to lowercase
func toASCII(label string) string {
	label = strings.ToLower(label)
	t := transform.Chain(norm.NFD, transform.RemoveFunc(isMn), norm.NFC)
	if result, _, e := transform.String(t, label); e == nil {
		return result
	} else {
		return label
	}
}
