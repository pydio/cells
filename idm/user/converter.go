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

package user

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"go.uber.org/zap"
	"gopkg.in/doug-martin/goqu.v4"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	service "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/common/sql/index"
	"github.com/pydio/cells/common/utils/mtree"
)

func (s *sqlimpl) makeSearchQuery(query sql.Enquirer, countOnly bool, includeParent bool, checkEmpty bool) (string, []interface{}, error) {

	converter := &queryConverter{
		treeDao:       s.IndexSQL,
		includeParent: includeParent,
		loginCI:       s.loginCI,
	}

	db := goqu.New(s.Driver(), s.DB())
	var wheres []goqu.Expression

	if query.GetResourcePolicyQuery() != nil {
		resourceExpr, e := s.ResourcesSQL.BuildPolicyConditionForAction(query.GetResourcePolicyQuery(), service.ResourcePolicyAction_READ)
		if e != nil {
			return "", nil, e
		}
		if resourceExpr != nil {
			wheres = append(wheres, resourceExpr)
		}
	}

	expression := sql.NewQueryBuilder(query, converter).Expression(s.Driver())
	if expression != nil {
		wheres = append(wheres, expression)
	} else {
		if checkEmpty {
			return "", nil, fmt.Errorf("condition cannot be empty")
		}
	}

	dataset := db.From(goqu.I("idm_user_idx_tree").As("t")).Prepared(true)
	if len(wheres) > 0 {
		dataset = dataset.Where(goqu.And(wheres...))
	}

	if countOnly {

		dataset = dataset.Select(goqu.COUNT("t.uuid"))

	} else {

		dataset = dataset.Select(goqu.I("t.uuid"), goqu.I("t.level"), goqu.I("t.mpath1"), goqu.I("t.mpath2"), goqu.I("t.mpath3"), goqu.I("t.mpath4"), goqu.I("t.name"), goqu.I("t.leaf"), goqu.I("t.etag"), goqu.I("t.mtime"))
		dataset = dataset.Order(goqu.I("t.name").Asc())
		offset, limit := int64(0), int64(-1)
		if query.GetLimit() > 0 {
			limit = query.GetLimit()
		}
		if limit > -1 {
			if query.GetOffset() > 0 {
				offset = query.GetOffset()
			}
			dataset = dataset.Offset(uint(offset)).Limit(uint(limit))
		}

	}

	return dataset.ToSql()
}

type queryConverter struct {
	treeDao       index.DAO
	includeParent bool
	loginCI       bool
}

func (c *queryConverter) Convert(val *any.Any, driver string) (goqu.Expression, bool) {

	var expressions []goqu.Expression
	var attributeOrLogin bool

	q := new(idm.UserSingleQuery)

	if err := ptypes.UnmarshalAny(val, q); err != nil {
		log.Logger(context.Background()).Error("Cannot unmarshal", zap.Any("v", val), zap.Error(err))
		return nil, false
	}

	if q.Uuid != "" {
		expressions = append(expressions, sql.GetExpressionForString(q.Not, "t.uuid", q.Uuid))
	}

	if q.Login != "" {
		if strings.Contains(q.Login, "*") && !q.Not {
			// Special case for searching on "login LIKE" => use dedicated attribute instead
			attributeOrLogin = true
			q.Login = toASCII(q.Login)
			q.AttributeName = idm.UserAttrLabelLike
			q.AttributeValue = q.Login
		} else if c.loginCI {
			// Use Equal but make sure it's case insensitive
			var ex goqu.Expression
			if q.Not {
				ex = goqu.Func("LOWER", goqu.I("t.name")).Neq(goqu.Func("LOWER", q.Login))
			} else {
				ex = goqu.Func("LOWER", goqu.I("t.name")).Eq(goqu.Func("LOWER", q.Login))
				expressions = append(expressions, goqu.I("t.leaf").Eq(1))
			}
			expressions = append(expressions, ex)
		} else {
			expressions = append(expressions, sql.GetExpressionForString(q.Not, "t.name", q.Login))
			if !q.Not {
				expressions = append(expressions, goqu.I("t.leaf").Eq(1))
			}
		}
	}

	var groupPath string
	var fullPath bool
	if q.FullPath != "" {
		groupPath = safeGroupPath(q.FullPath)
		fullPath = true
	} else if q.GroupPath != "" {
		if q.GroupPath == "/" {
			groupPath = "/"
		} else {
			groupPath = safeGroupPath(q.GroupPath)
		}
	}

	if groupPath != "" {
		mpath, _, err := c.treeDao.Path(groupPath, false)
		if err != nil {
			log.Logger(context.Background()).Error("Error while getting parent mpath", zap.Any("g", groupPath), zap.Error(err))
			return goqu.L("0"), true
		}
		if mpath == nil {
			log.Logger(context.Background()).Debug("Nil mpath for groupPath", zap.Any("g", groupPath))
			return goqu.L("0"), true
		}
		parentNode, err := c.treeDao.GetNode(mpath)
		if err != nil {
			log.Logger(context.Background()).Error("Error while getting parent node", zap.Any("g", groupPath), zap.Error(err))
			return goqu.L("0"), true
		}
		if fullPath {
			expressions = append(expressions, goqu.L(unPrepared["WhereGroupPathIncludeParent"](parentNode.MPath.String())))
		} else {
			var gPathQuery string
			if q.Recursive {
				// Get whole tree
				gPathQuery = unPrepared["WhereGroupPathRecursive"](parentNode.MPath.String(), parentNode.Level+1)
			} else {
				gPathQuery = unPrepared["WhereGroupPath"](parentNode.MPath.String(), parentNode.Level+1)
			}
			if c.includeParent {
				incParentQuery := unPrepared["WhereGroupPathIncludeParent"](parentNode.MPath.String())
				expressions = append(expressions, goqu.Or(goqu.L(gPathQuery), goqu.L(incParentQuery)))
			} else {
				expressions = append(expressions, goqu.L(gPathQuery))
			}
		}
	}

	// Filter by Node Type
	if q.NodeType == idm.NodeType_USER {
		expressions = append(expressions, goqu.I("t.leaf").Eq(1))
	} else if q.NodeType == idm.NodeType_GROUP {
		expressions = append(expressions, goqu.I("t.leaf").Eq(0))
	}

	if q.HasProfile != "" {
		q.AttributeName = idm.UserAttrProfile
		q.AttributeValue = q.HasProfile
	}

	if len(q.AttributeName) > 0 {

		db := goqu.New(driver, nil)
		dataset := db.From(goqu.I("idm_user_attributes").As("a"))

		// Make exist / not exist query
		attWheres := []goqu.Expression{
			goqu.I("a.uuid").Eq(goqu.I("t.uuid")),
		}
		exprName := sql.GetExpressionForString(false, "a.name", q.AttributeName)
		if q.AttributeAnyValue {
			attWheres = append(attWheres, exprName)
		} else {
			exprValue := sql.GetExpressionForString(false, "a.value", q.AttributeValue)
			attWheres = append(attWheres, exprName)
			attWheres = append(attWheres, exprValue)
		}
		attQ, _, _ := dataset.Where(attWheres...).ToSql()
		if q.Not {
			attQ = "NOT EXISTS (" + attQ + ")"
		} else {
			attQ = "EXISTS (" + attQ + ")"
		}
		if attributeOrLogin {
			expressions = append(expressions, goqu.Or(goqu.L(attQ), sql.GetExpressionForString(false, "t.name", q.Login)))
		} else {
			expressions = append(expressions, goqu.L(attQ))
		}
	}

	if len(q.HasRole) > 0 {

		db := goqu.New(driver, nil)
		datasetR := db.From(goqu.I("idm_user_roles").As("r"))
		roleQuery := sql.GetExpressionForString(false, "r.role", q.HasRole)
		attWheresR := []goqu.Expression{
			goqu.I("r.uuid").Eq(goqu.I("t.uuid")),
			roleQuery,
		}
		attR, _, _ := datasetR.Where(attWheresR...).ToSql()
		if q.Not {
			attR = "NOT EXISTS (" + attR + ")"
		} else {
			attR = "EXISTS (" + attR + ")"
		}
		expressions = append(expressions, goqu.L(attR))
	}

	if len(q.ConnectedSince) > 0 {
		if lt, d, e := q.ParseLastConnected(); e == nil {
			ref := int32(time.Now().Add(-d).Unix())
			if lt || q.Not {
				expressions = append(expressions, goqu.I("t.mtime").Lt(ref))
			} else {
				expressions = append(expressions, goqu.I("t.mtime").Gt(ref))
			}
		}
	}

	if len(expressions) == 0 {
		return nil, true
	}
	return goqu.And(expressions...), true

}

func userToNode(u *idm.User) *tree.Node {

	path := strings.TrimRight(u.GroupPath, "/") + "/" + u.Login
	path = safeGroupPath(path)
	n := &tree.Node{
		Path: path,
		Uuid: u.Uuid,
		Type: tree.NodeType_LEAF,
		Size: 1,
	}
	if u.Password != "" {
		var alreadyHashed bool
		if u.Attributes != nil {
			if val, ok := u.Attributes[idm.UserAttrPassHashed]; ok && val == "true" {
				alreadyHashed = true
				delete(u.Attributes, idm.UserAttrPassHashed)
			}
		}
		if alreadyHashed {
			n.Etag = u.Password
		} else {
			n.Etag = hasher.CreateHash(u.Password)
		}
	}
	n.SetMeta("name", u.Login)
	return n

}

func groupToNode(g *idm.User) *tree.Node {
	path := safeGroupPath(g.GroupPath)
	n := &tree.Node{
		Path:      path,
		Uuid:      g.Uuid,
		Type:      tree.NodeType_COLLECTION,
		MetaStore: map[string]string{"name": g.GroupLabel},
	}
	return n
}

func nodeToUser(t *mtree.TreeNode) *idm.User {
	u := &idm.User{
		Uuid:          t.Uuid,
		Login:         t.Name(),
		Password:      t.Etag,
		GroupPath:     t.Path,
		LastConnected: int32(t.MTime),
	}
	var gRoles []string
	t.GetMeta("GroupRoles", &gRoles)
	// Do not apply inheritance to anonymous user
	if t.Name() == common.PydioS3AnonUsername {
		u.Roles = []*idm.Role{}
		return u
	}
	for _, rId := range gRoles {
		u.Roles = append(u.Roles, &idm.Role{Uuid: rId, GroupRole: true})
	}
	return u
}

func nodeToGroup(t *mtree.TreeNode) *idm.User {
	return &idm.User{
		Uuid:       t.Uuid,
		IsGroup:    true,
		GroupLabel: t.Name(),
		GroupPath:  t.Path,
	}
}
