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

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/common/sql/index"
	"github.com/pydio/cells/common/utils"
)

func (s *sqlimpl) makeSearchQuery(query sql.Enquirer, countOnly bool, withLimit bool, includeParent bool) string {

	converter := &queryConverter{
		treeDao:       s.IndexSQL,
		includeParent: includeParent,
	}

	var wheres []string

	if query.GetResourcePolicyQuery() != nil {
		resourceString := s.ResourcesSQL.BuildPolicyConditionForAction(query.GetResourcePolicyQuery(), service.ResourcePolicyAction_READ)
		if resourceString != "" {
			wheres = append(wheres, resourceString)
		}
	}

	whereString := sql.NewDAOQuery(query, converter).String()
	if len(whereString) > 0 {
		wheres = append(wheres, whereString)
	} else {
		wheres = append(wheres, "t.uuid = n.uuid")
	}

	whereString = sql.JoinWheresWithParenthesis(wheres, "AND")

	orderString := " ORDER BY n.name"

	limitString := ""
	if withLimit {

		offset, limit := int64(0), int64(0)
		limit = query.GetLimit()
		if query.GetOffset() > 0 {
			offset = query.GetOffset()
		}
		if limit == 0 {
			limit = 100
		}

		limitString = fmt.Sprintf(" limit %v,%v", offset, limit)
		if query.GetLimit() == -1 {
			limitString = ""
		}

	}

	//log.Logger(context.Background()).Info("Search Users: " + whereString, zap.Any("subjects", query.GetResourcePolicyQuery().GetSubjects()))

	if countOnly {
		result := count + whereString + limitString
		return result
	} else {
		result := search + whereString + orderString + limitString
		return result
	}

}

type queryConverter struct {
	treeDao       index.DAO
	includeParent bool
}

func (c *queryConverter) Convert(val *any.Any) (string, bool) {

	q := new(idm.UserSingleQuery)
	// Basic joint
	where := []string{
		"t.uuid = n.uuid",
	}

	if err := ptypes.UnmarshalAny(val, q); err != nil {
		log.Logger(context.Background()).Error("Cannot unmarshal", zap.Any("v", val), zap.Error(err))
		return "", false
	}

	if q.Uuid != "" {
		where = append(where, sql.GetQueryValueFor("t.uuid", q.Uuid))
	}

	if q.Login != "" {
		if q.Not {
			where = append(where, fmt.Sprintf("n.name!='%s'", q.Login))
		} else {
			loginQ := sql.GetQueryValueFor("n.name", q.Login)
			leafQ := "n.leaf = 1"
			where = append(where, fmt.Sprintf("(%s and %s)", loginQ, leafQ))
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
			where = append(where, "0") // Will make return 0 results anyway
			return strings.Join(where, " and "), true
		}
		if mpath == nil {
			log.Logger(context.Background()).Debug("Nil mpath for groupPath", zap.Any("g", groupPath))
			where = append(where, "0") // Will make return 0 results anyway
			return strings.Join(where, " and "), true
		}
		parentNode, err := c.treeDao.GetNode(mpath)
		if err != nil {
			log.Logger(context.Background()).Error("Error while getting parent node", zap.Any("g", groupPath), zap.Error(err))
			where = append(where, "0") // Will make return 0 results anyway
			return strings.Join(where, " and "), true
		}
		if fullPath {
			where = append(where, unPrepared["WhereGroupPathIncludeParent"](parentNode.MPath.String()))
		} else {
			var gPathQuery string
			if q.Recursive {
				// Get whole tree
				gPathQuery = unPrepared["WhereGroupPathRecursive"](parentNode.MPath.String(), parentNode.Level+1)
			} else {
				gPathQuery = unPrepared["WhereGroupPath"](parentNode.MPath.String(), parentNode.Level+1)
			}
			if c.includeParent {
				where = append(where, "("+gPathQuery+" or ("+unPrepared["WhereGroupPathIncludeParent"](parentNode.MPath.String())+"))")
			} else {
				where = append(where, gPathQuery)
			}
		}
	}

	// Filter by Node Type
	if q.NodeType == idm.NodeType_USER {
		where = append(where, fmt.Sprintf("n.leaf = 1"))
	} else if q.NodeType == idm.NodeType_GROUP {
		where = append(where, fmt.Sprintf("n.leaf = 0"))
	}

	if len(q.AttributeName) > 0 {
		// Make exist / not exist query
		attWheres := ""
		nameQ := sql.GetQueryValueFor("a.name", q.AttributeName)
		if q.AttributeAnyValue {
			attWheres = nameQ
		} else {
			valueQ := sql.GetQueryValueFor("a.value", q.AttributeValue)
			attWheres = nameQ + " and " + valueQ
		}
		attQ := unPrepared["WhereHasAttributes"](attWheres)
		if q.Not {
			attQ = "NOT " + attQ
		}
		where = append(where, attQ)
	}

	if len(q.HasRole) > 0 {
		roleQ := sql.GetQueryValueFor("r.role", q.HasRole)
		attR := unPrepared["WhereHasRoles"](roleQ)
		if q.Not {
			attR = "NOT " + attR
		}
		where = append(where, attR)
	}

	return strings.Join(where, " and "), true
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
		n.Etag = hasher.CreateHash(u.Password)
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

func nodeToUser(t *utils.TreeNode) *idm.User {
	u := &idm.User{
		Uuid:      t.Uuid,
		Login:     t.Name(),
		Password:  t.Etag,
		GroupPath: t.Path,
	}
	var gRoles []string
	t.GetMeta("GroupRoles", &gRoles)
	// Do not apply inheritence to anonymous user
	if t.Name() == common.PYDIO_S3ANON_USERNAME {
		u.Roles = []*idm.Role{}
		return u
	}
	if gRoles != nil {
		for _, rId := range gRoles {
			u.Roles = append(u.Roles, &idm.Role{Uuid: rId, GroupRole: true})
		}
	}
	return u
}

func nodeToGroup(t *utils.TreeNode) *idm.User {
	return &idm.User{
		Uuid:       t.Uuid,
		IsGroup:    true,
		GroupLabel: t.Name(),
		GroupPath:  t.Path,
	}
}
