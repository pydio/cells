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
	"time"
	"unicode"

	"go.uber.org/zap"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/pydio/cells/v5/common/auth"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/idm"
	service "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/common/storage/sql/index"
	resources2 "github.com/pydio/cells/v5/common/storage/sql/resources"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/idm/user"
	user_model "github.com/pydio/cells/v5/idm/user/dao/sql/model"
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

	DAOError = errors.RegisterBaseSentinel(errors.SqlDAO, "sql-users")
)

func wrap(err error) error {
	return errors.Tag(err, DAOError)
}

type indexDAO index.DAO

func init() {
	user.Drivers.Register(NewDAO)
}

// NewDAO wraps passed DAO with specific Pydio implementation of User DAO and returns it.
func NewDAO(ctx context.Context, db *gorm.DB) user.DAO {
	return &sqlimpl{
		AbstractResources: sql.NewAbstractResources(db).WithModels(func() []any {
			return []any{&user_model.User{}, &user_model.UserRole{}, &user_model.UserAttribute{}}
		}),
		indexDAO: index.NewDAO[*user_model.User](db),
	}
}

// Impl of the SQL interface
type sqlimpl struct {
	*sql.AbstractResources
	indexDAO

	// Handle logins in Case-Insensitive fashion
	loginCI bool
}

// var _ dao.DAO = (*sqlimpl)(nil)
var _ user.DAO = (*sqlimpl)(nil)

// Init handler for the SQL DAO
func (s *sqlimpl) Init(ctx context.Context, options configx.Values) error {

	if options.Val("loginCI").Default(false).Bool() {
		s.loginCI = true
	}

	return nil
}

func safeGroupPath(gPath string) string {
	return fmt.Sprintf("/%s", strings.Trim(gPath, "/"))
}

func (s *sqlimpl) Migrate(ctx context.Context) error {
	return s.AbstractResources.Migrate(ctx)
}

// Add to the underlying SQL DB.
func (s *sqlimpl) Add(ctx context.Context, in interface{}) (interface{}, []*idm.User, error) {

	var created []tree.ITreeNode
	var user *idm.User

	if u, ok := in.(*idm.User); !ok {
		return nil, nil, errors.WithMessage(DAOError, "invalid format, expecting idm.User")
	} else {
		user = proto.Clone(u).(*idm.User)
	}

	user.GroupPath = safeGroupPath(user.GroupPath)

	// Now carry on to potential updates
	var node tree.ITreeNode
	if !user.IsGroup {
		if len(user.Login) == 0 {
			return nil, nil, errors.WithMessage(DAOError, "warning, cannot create a user with an empty login")
		}
		node = userToNode(user)
	} else {
		node = groupToNode(user)
	}

	rootInfo := &tree.Node{
		Uuid:  "ROOT_GROUP",
		Path:  "/",
		Type:  tree.NodeType_COLLECTION,
		Mode:  0777,
		MTime: time.Now().Unix(),
	}

	replaced := false

	if node.GetNode().GetUuid() != "" {
		if existing, err := s.indexDAO.GetNodeByUUID(ctx, node.GetNode().GetUuid()); err == nil {
			s.rebuildGroupPath(ctx, existing)
			targetPath := node.GetNode().GetPath()
			sourcePath := existing.GetNode().GetPath()
			if existing.GetNode().GetPath() != targetPath {
				// Move in Tree, user or group
				nodeTo, cc, er := s.indexDAO.GetOrCreateNodeByPath(ctx, targetPath, nil)
				if er != nil || len(cc) == 0 { // Error or already existing, this is not expected
					return nil, nil, wrap(er)
				}
				pathTo := nodeTo.GetMPath()
				created = append(created, cc...)
				// Delete target before moving to it
				_ = s.indexDAO.DelNode(ctx, nodeTo)
				log.Logger(ctx).Debug("MOVE TREE", zap.Any("from", existing), zap.Any("to", nodeTo))
				if err = s.indexDAO.MoveNodeTree(ctx, existing, nodeTo); err != nil {
					return nil, nil, wrap(err)
				}
				if reload, er := s.indexDAO.GetNodeByMPath(ctx, pathTo); er != nil {
					return nil, nil, wrap(er)
				} else {
					reload.GetNode().SetPath(targetPath)
					nodeToUserOrGroup(reload, user)
					user.Attributes["original_group"] = sourcePath
				}
			} else {
				// Simple Update
				node.SetMPath(existing.GetMPath())
				if er := s.indexDAO.UpdateNode(ctx, node); er != nil {
					return nil, nil, wrap(er)
				}
				nodeToUserOrGroup(node, user)
			}
			replaced = true
		}
	}

	if !replaced {
		retrieved, cc, err := s.indexDAO.GetOrCreateNodeByPath(ctx, node.GetNode().GetPath(), node.GetNode(), rootInfo)
		if err != nil {
			return nil, nil, wrap(err)
		}
		if len(cc) == 0 {
			// A node already exists at the target path, we just need to update it
			node.GetNode().SetUuid(retrieved.GetNode().GetUuid())
			node.SetMPath(retrieved.GetMPath())
			node.SetName(retrieved.GetName())

			if err := s.indexDAO.UpdateNode(ctx, node); err != nil {
				return nil, nil, wrap(err)
			}
			nodeToUserOrGroup(node, user)
		} else {
			user.Uuid = retrieved.GetNode().GetUuid()
			nodeToUserOrGroup(retrieved, user)
			created = append(created, cc...)
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

	if err := s.Session(ctx).Transaction(func(tx *gorm.DB) error {
		tx = tx.WithContext(ctx)
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
		return nil, nil, wrap(err)
	}

	var createdNodes []*idm.User
	for _, n := range created {
		cu := &idm.User{}
		nodeToUserOrGroup(n, cu)
		createdNodes = append(createdNodes, cu)
	}

	// TODO ?
	//if movedOriginalPath != "" {
	//	user.Attributes["original_group"] = movedOriginalPath
	//}

	return user, createdNodes, nil
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

	nfErr := wrap(errors.WithMessagef(errors.UserNotFound, "cannot find user %s", userName))

	if len(results) == 0 {
		// The error code is actually very important
		return nil, nfErr
	}
	object := results[0]
	user = object.(*idm.User)

	if s.loginCI {
		if !strings.EqualFold(user.Login, userName) {
			return nil, nfErr
		}
	} else {
		if user.Login != userName {
			return nil, nfErr
		}
	}

	hashedPass := user.Password

	// Check password
	if valid, _ := hasher.CheckDBKDF2PydioPwd(password, hashedPass); valid {
		return user, nil
	} else if valid, _ = hasher.CheckDBKDF2PydioPwd(password, hashedPass, true); valid {
		// Recheck with legacy format (users coming from PHP, salt []byte is built differently)
		return user, nil
	}

	return nil, wrap(errors.WithMessage(errors.StatusForbidden, "password does not match"))

}

// TouchUser loads a user by UUID and updates its MTime to Now()
func (s *sqlimpl) TouchUser(ctx context.Context, userUuid string) error {

	nodeSrc, er := s.indexDAO.GetNodeByUUID(ctx, userUuid)
	if er != nil {
		return wrap(er)
	}
	nodeSrc.GetNode().SetMTime(time.Now().Unix())
	return wrap(s.indexDAO.UpdateNode(ctx, nodeSrc))

}

// Count counts the number of users matching the passed query in the SQL DB.
func (s *sqlimpl) Count(ctx context.Context, query service.Enquirer, includeParents ...bool) (int, error) {
	var includeParent bool
	if len(includeParents) > 0 && includeParents[0] {
		includeParent = includeParents[0]
	}
	converter := &queryConverter{
		treeDao:       s.indexDAO,
		includeParent: includeParent,
		loginCI:       s.loginCI,
	}

	session := s.Session(ctx)
	rqb, err := resources2.PrepareQueryBuilder(&user_model.User{}, s.Resources, session.NamingStrategy)
	if err != nil {
		return 0, err
	}

	var total int64
	db, er := service.NewQueryBuilder[*gorm.DB](query, converter, rqb).Build(ctx, session.Model(&user_model.User{}))
	if er != nil {
		return 0, wrap(er)
	}
	//tx := db.Group("name").Count(&total)
	tx := db.Count(&total)
	if tx.Error != nil {
		return 0, wrap(tx.Error)
	}

	return int(total), nil
}

// Search in the SQL DB
func (s *sqlimpl) Search(ctx context.Context, query service.Enquirer, users *[]interface{}, withParents ...bool) error {

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
	var can context.CancelFunc
	// Unless limit is exactly one, switch to LongConnectionTimeout
	if query.GetLimit() != 1 {
		ctx, can = context.WithTimeout(propagator.ForkedBackgroundWithMeta(ctx), sql.LongConnectionTimeout)
		defer can()
	}

	session := s.Session(ctx)
	rqb, err := resources2.PrepareQueryBuilder(&user_model.User{}, s.Resources, session.NamingStrategy)
	if err != nil {
		return err
	}

	var rows []*user_model.User
	db, er := service.NewQueryBuilder[*gorm.DB](query, converter, rqb).Build(ctx, session)
	if er != nil {
		return wrap(er)
	}

	tx := db.WithContext(ctx).Find(&rows)

	if tx.Error != nil {
		return wrap(tx.Error)
	}

	for _, row := range rows {

		s.rebuildGroupPath(ctx, row)

		userOrGroup := &idm.User{}

		if row.GetNode().GetType() == tree.NodeType_COLLECTION {
			nodeToGroup(row, userOrGroup)
		} else {
			nodeToUser(row, userOrGroup)

			var roles []*user_model.UserRole

			q := user_model.Use(s.Session(ctx))

			s.Session(ctx).Where(q.UserRole.UUID.Eq(userOrGroup.Uuid)).Find(&roles)

			for _, role := range roles {
				userOrGroup.Roles = append(userOrGroup.Roles, &idm.Role{Uuid: role.Role, Label: role.Role})
			}
			// User Role
			userOrGroup.Roles = append(userOrGroup.Roles, &idm.Role{Uuid: userOrGroup.Uuid, Label: userOrGroup.Login, UserRole: true})
		}

		// User Role
		userOrGroup.Attributes = make(map[string]string)

		var attributes []*user_model.UserAttribute

		q := user_model.Use(s.Session(ctx))

		s.Session(ctx).Where(q.UserAttribute.UUID.Eq(userOrGroup.Uuid)).Find(&attributes)

		for _, attribute := range attributes {
			userOrGroup.Attributes[attribute.Name] = attribute.Value
		}

		*users = append(*users, userOrGroup)

	}

	//log.Logger(context.Background()).Debug("Monitor DBStats after search", zap.Any("stats", s.SQLConn.DB.Stats()))

	return nil
}

// Del from the SQL DB
func (s *sqlimpl) Del(ctx context.Context, query service.Enquirer, users chan *idm.User) (int64, error) {

	var rows []*user_model.User
	converter := &queryConverter{
		treeDao:       s.indexDAO,
		includeParent: true,
		loginCI:       s.loginCI,
	}

	session := s.Session(ctx)
	rqb, err := resources2.PrepareQueryBuilder(&user_model.User{}, s.Resources, session.NamingStrategy)
	if err != nil {
		return 0, err
	}
	db, er := service.NewQueryBuilder[*gorm.DB](query, converter, rqb).Build(ctx, session)
	if er != nil {
		return 0, wrap(er)
	}
	if len(db.Statement.Clauses) == 0 {
		return 0, errors.WithMessage(DAOError, "delete conditions cannot be empty")
	}
	tx := db.WithContext(ctx).Find(&rows)
	if tx.Error != nil {
		return 0, wrap(tx.Error)
	}

	type delStruct struct {
		node   *user_model.User
		object *idm.User
	}
	log.Logger(ctx).Debug("Delete")

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
		if err := s.deleteNodeData(ctx, toDel.node); err != nil {
			return count, wrap(err)
		}

		if err := s.indexDAO.DelNode(ctx, toDel.node); err != nil {
			return count, wrap(err)
		}

		users <- toDel.object
		count++
	}

	return count, nil
}

func (s *sqlimpl) CleanRole(ctx context.Context, roleId string) error {

	db := s.Session(ctx)

	q := user_model.Use(db)

	tx := db.Where(q.UserRole.Role.Eq(roleId)).Delete(&user_model.UserRole{})
	if tx.Error != nil {
		return wrap(tx.Error)
	}

	return nil

}

func (s *sqlimpl) LoginModifiedAttr(ctx context.Context, oldName, newName string) (int64, error) {

	db := s.Session(ctx)

	tx := db.Model(&user_model.UserAttribute{}).
		Where("name = ?", "pydio:labelLike").
		Where("value = ?", oldName).
		Update("value", newName)

	if tx.Error != nil {
		return 0, wrap(tx.Error)
	}

	return tx.RowsAffected, nil
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

func (s *sqlimpl) deleteNodeData(ctx context.Context, node tree.ITreeNode) error {

	db := s.Session(ctx)

	subQ := db.Select("uuid").Where(tree.MPathEqualsOrLike{Value: node.GetMPath()}).Model(&user_model.User{})

	if tx := db.Where("uuid IN (?)", subQ).Delete(&user_model.UserAttribute{}); tx.Error != nil {
		return tx.Error
	}

	if tx := db.Where("uuid IN (?)", subQ).Delete(&user_model.UserRole{}); tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (s *sqlimpl) rebuildGroupPath(ctx context.Context, node tree.ITreeNode) {
	if len(node.GetNode().GetPath()) == 0 {
		var path []string
		roles := []string{}
		for pNode := range s.indexDAO.GetNodesByMPaths(ctx, node.GetMPath().Parents()...) {
			path = append(path, pNode.GetName())
			roles = append(roles, pNode.GetNode().GetUuid())
		}
		path = append(path, node.GetName())
		p := strings.Join(path, "/")
		node.GetNode().SetPath(fmt.Sprintf("/%s", strings.TrimLeft(p, "/")))
		node.GetNode().MustSetMeta("GroupRoles", roles)
	}
}

func buildMPathEquals(db *gorm.DB, mpath []byte) *gorm.DB {
	for {
		cnt := (len(mpath) - 1) / indexLen
		db = db.Where(clause.Like{
			Column: fmt.Sprintf("mpath%d", cnt+1),
			Value:  string(mpath[(cnt * indexLen):]),
		})
		if idx := cnt * indexLen; idx == 0 {
			break
		}
		mpath = mpath[0 : cnt*indexLen]
	}
	return db
}

func buildMPathLike(db *gorm.DB, mpath []byte) *gorm.DB {
	mpath = append(mpath, []byte(".%")...)

	//done := false
	for {
		cnt := (len(mpath) - 1) / indexLen
		db = db.Where(clause.Like{
			Column: fmt.Sprintf("mpath%d", cnt+1),
			Value:  string(mpath[(cnt * indexLen):]),
		})
		if idx := cnt * indexLen; idx == 0 {
			break
		}
		mpath = mpath[0 : cnt*indexLen]
	}
	return db

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
