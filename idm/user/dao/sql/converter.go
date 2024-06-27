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
	"path"
	"strings"
	"time"

	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"
	"gorm.io/gen/field"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	index "github.com/pydio/cells/v4/common/sql/indexgorm"
	"github.com/pydio/cells/v4/common/telemetry/log"
	user_model "github.com/pydio/cells/v4/idm/user/dao/sql/model"
)

type queryConverter struct {
	treeDao       index.DAO
	includeParent bool
	loginCI       bool
}

func (c *queryConverter) Convert(ctx context.Context, val *anypb.Any, db *gorm.DB) (*gorm.DB, bool, error) {

	query := user_model.Use(db)
	u := query.User
	a := query.UserAttribute
	r := query.UserRole

	// Adding left identifier to resource policy query
	rq := new(service.ResourcePolicyQuery)
	if err := anypb.UnmarshalTo(val, rq, proto.UnmarshalOptions{}); err == nil {
		rq.LeftIdentifier = u.TableName() + "." + u.Uuid.ColumnName().String()
		if err := anypb.MarshalFrom(val, rq, proto.MarshalOptions{}); err != nil {
			return db, false, err
		}

		return db, false, nil
	}

	var attributeOrLogin bool

	q := new(idm.UserSingleQuery)

	if err := anypb.UnmarshalTo(val, q, proto.UnmarshalOptions{}); err != nil {
		// This is not the expected val, just ignore
		return nil, false, nil
	}

	var wheres []*gorm.DB

	if q.Uuid != "" {
		if q.Not {
			wheres = append(wheres, db.Not(u.Uuid.Eq(q.Uuid)))
		} else {
			wheres = append(wheres, db.Where(u.Uuid.Eq(q.Uuid)))
		}
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
			if q.Not {
				wheres = append(wheres, db.Not(LowerEq{Column: u.Name, Value: q.Login}))
			} else {
				wheres = append(wheres, db.Where(LowerEq{Column: u.Name, Value: q.Login}))
			}
		} else {
			if q.Not {
				wheres = append(wheres, db.Not(u.Name.Eq(q.Login)))
			} else {
				wheres = append(wheres, db.Where(u.Name.Eq(q.Login)))
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
		user := &user_model.User{}
		user.SetNode(&tree.Node{
			Path: groupPath,
		})
		mpath, _, err := c.treeDao.Path(context.TODO(), user, tree.NewTreeNode(""), false)
		if err != nil && err.Error() != "not found" {
			log.Logger(context.Background()).Error("Error while getting parent mpath", zap.Any("g", groupPath), zap.Error(err))
			return db, false, err
		}
		if mpath == nil {
			//log.Logger(context.Background()).Debug("Nil mpath for groupPath", zap.Any("g", groupPath))
			// We do return a Where clause that always resolves to FALSE
			db = db.Where(false)
			return db, true, nil
		}
		parentNode, err := c.treeDao.GetNode(context.TODO(), mpath)
		if err != nil {
			log.Logger(context.Background()).Error("Error while getting parent node", zap.Any("g", groupPath), zap.Error(err))
			return db, false, err
		}
		if fullPath {
			wheres = append(wheres, db.Where(getMPathEquals([]byte(parentNode.GetMPath().ToString()))))
		} else {
			var gPathQuery *gorm.DB
			if q.Recursive {
				// Get whole tree
				gPathQuery = db.Where(getMPathLike([]byte(parentNode.GetMPath().ToString()))).Where("level >= ?", parentNode.GetLevel()+1)
			} else {
				gPathQuery = db.Where(getMPathLike([]byte(parentNode.GetMPath().ToString()))).Where("level = ?", parentNode.GetLevel()+1)
			}
			if c.includeParent {
				incParentQuery := db.Where(getMPathEquals([]byte(parentNode.GetMPath().ToString())))
				wheres = append(wheres, db.Where(db.Where(incParentQuery).Or(gPathQuery)))
			} else {
				wheres = append(wheres, db.Where(gPathQuery))
			}
		}
	}

	// Filter by Node Type
	if q.NodeType == idm.NodeType_USER {
		wheres = append(wheres, db.Where(u.Type.Eq(int32(tree.NodeType_LEAF))))
	} else if q.NodeType == idm.NodeType_GROUP {
		wheres = append(wheres, db.Where(u.Type.Neq(int32(tree.NodeType_LEAF))))
	}

	if q.HasProfile != "" {
		q.AttributeName = idm.UserAttrProfile
		q.AttributeValue = q.HasProfile
	}

	if len(q.AttributeName) > 0 {
		txAttributes := a.WithContext(context.TODO()).
			Select(a.Name).
			Where(a.Name.Eq(q.AttributeName)).
			Where(a.UUID.EqCol(u.Uuid))

		if !q.AttributeAnyValue {
			txAttributes = txAttributes.Where(a.Value.Like(strings.Replace(q.AttributeValue, "*", "%", -1)))
		}

		if q.Not {
			wheres = append(wheres, db.Not(field.CompareSubQuery(
				field.ExistsOp,
				u.Uuid,
				txAttributes.UnderlyingDB(),
			)))
		} else {
			wheres = append(wheres, db.Where(field.CompareSubQuery(
				field.ExistsOp,
				u.Uuid,
				txAttributes.UnderlyingDB(),
			)))
		}

		if attributeOrLogin {
			db = db.Or(u.Name.Eq(q.Login))
		}
	}

	if len(q.HasRole) > 0 {
		txRoles := r.WithContext(context.TODO()).
			Select(r.UUID).
			Where(r.Role.Eq(q.HasRole)).
			Where(r.UUID.EqCol(u.Uuid))

		if q.Not {
			wheres = append(wheres, db.Not(field.CompareSubQuery(
				field.ExistsOp,
				u.Uuid,
				txRoles.UnderlyingDB(),
			)))
		} else {
			wheres = append(wheres, db.Where(field.CompareSubQuery(
				field.ExistsOp,
				u.Uuid,
				txRoles.UnderlyingDB(),
			)))
		}
	}

	if len(q.ConnectedSince) > 0 {
		if lt, d, e := q.ParseLastConnected(); e == nil {
			ref := time.Now().Add(-d).Unix()
			if lt || q.Not {
				wheres = append(wheres, db.Where(u.MTime.Lt(ref)))
			} else {
				wheres = append(wheres, db.Where(u.MTime.Gt(ref)))
			}
		}
	}

	for _, where := range wheres {
		db = db.Where(where)
	}

	return db, len(wheres) > 0, nil
}

func userToNode(u *idm.User) *user_model.User {

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
	n.MustSetMeta(common.MetaNamespaceNodeName, u.Login)
	return &user_model.User{
		TreeNode: tree.TreeNode{
			Node: n,
		},
	}

}

func groupToNode(g *idm.User) *user_model.User {
	path := safeGroupPath(g.GroupPath)
	n := &tree.Node{
		Path:      path,
		Uuid:      g.Uuid,
		Type:      tree.NodeType_COLLECTION,
		MetaStore: map[string]string{"name": g.GroupLabel},
	}

	return &user_model.User{
		TreeNode: tree.TreeNode{
			Node: n,
		},
	}
}

func nodeToUser(t *user_model.User, u *idm.User) {
	u.Uuid = t.GetNode().GetUuid()
	u.Login = t.GetName()
	u.Password = t.GetNode().GetEtag()
	u.GroupPath = path.Dir(t.GetNode().GetPath())
	u.LastConnected = int32(t.GetNode().GetMTime())

	var gRoles []string
	t.GetNode().GetMeta("GroupRoles", &gRoles)
	// Do not apply inheritance to anonymous user
	if t.GetName() == common.PydioS3AnonUsername {
		u.Roles = []*idm.Role{}
	}
	for _, rId := range gRoles {
		u.Roles = append(u.Roles, &idm.Role{Uuid: rId, GroupRole: true})
	}
}

func nodeToGroup(t *user_model.User, u *idm.User) {
	u.Uuid = t.GetNode().GetUuid()
	u.IsGroup = true
	u.GroupLabel = t.GetName()
	u.GroupPath = path.Dir(t.GetNode().GetPath())
}

type LowerEq struct {
	Column interface{}
	Value  interface{}
}

func (eq *LowerEq) Build(builder clause.Builder) {
	builder.WriteString("LOWER(")
	builder.WriteQuoted(eq.Column)
	builder.WriteString(") = LOWER(")
	builder.AddVar(builder, eq.Value)
	builder.WriteString(")")
}
