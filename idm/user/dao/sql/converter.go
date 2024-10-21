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
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/storage/sql/index"
	"github.com/pydio/cells/v4/common/telemetry/log"
	usermodel "github.com/pydio/cells/v4/idm/user/dao/sql/model"
)

type queryConverter struct {
	treeDao       index.DAO
	includeParent bool
	loginCI       bool
}

func (c *queryConverter) Convert(ctx context.Context, val *anypb.Any, db *gorm.DB) (*gorm.DB, bool, error) {

	db = db.Session(&gorm.Session{})
	query := usermodel.Use(db)

	u := query.User
	a := query.UserAttribute
	r := query.UserRole
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
			// Use Equal but make sure it's case-insensitive
			if q.Not {
				wheres = append(wheres, db.Not(&LowerEq{Column: u.Name.RawExpr(), Value: q.Login}))
			} else {
				wheres = append(wheres, db.Where(&LowerEq{Column: u.Name.RawExpr(), Value: q.Login}))
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

		parentNode, err := c.treeDao.GetNodeByPath(ctx, groupPath)
		if err != nil && !errors.Is(err, errors.NodeNotFound) {
			log.Logger(ctx).Error("Error while getting parent mpath", zap.Any("g", groupPath), zap.Error(err))
			return db, false, err
		}
		if parentNode == nil {
			// We do not want to break, but just make sure no results are returned.
			// => Return a Where clause that always resolves to FALSE
			log.Logger(ctx).Error("Nil MPath On Convert, add 1 = 0 condition", zap.Any("g", groupPath))
			db = db.Where("1 = 0")
			return db, true, nil
		}
		if fullPath {
			wheres = append(wheres, buildMPathEquals(db, []byte(parentNode.GetMPath().ToString())))
		} else {
			gPathQuery := buildMPathLike(db, []byte(parentNode.GetMPath().ToString()))
			if q.Recursive {
				// Get whole tree
				gPathQuery = gPathQuery.Where("level >= ?", parentNode.GetLevel()+1)
			} else {
				gPathQuery = gPathQuery.Where("level = ?", parentNode.GetLevel()+1)
			}
			if c.includeParent {
				incParentQuery := buildMPathEquals(db, []byte(parentNode.GetMPath().ToString()))
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
		txAttributes := a.WithContext(ctx).
			Select(a.Name).
			Where(a.Name.Eq(q.AttributeName)).
			Where(a.UUID.EqCol(u.Uuid))

		if !q.AttributeAnyValue {
			txAttributes = txAttributes.Where(a.Value.Like(strings.Replace(q.AttributeValue, "*", "%", -1)))
		}
		var wtx *gorm.DB
		if q.Not {
			wtx = db.Not(field.CompareSubQuery(
				field.ExistsOp,
				u.Uuid,
				txAttributes.UnderlyingDB(),
			))
		} else {
			wtx = db.Where(field.CompareSubQuery(
				field.ExistsOp,
				u.Uuid,
				txAttributes.UnderlyingDB(),
			))
		}

		if attributeOrLogin {
			wtx = wtx.Or(u.Name.Like(strings.Replace(q.AttributeValue, "*", "%", -1)))
		}
		wheres = append(wheres, wtx)
	}

	if len(q.HasRole) > 0 {
		txRoles := r.WithContext(ctx).
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

func userToNode(u *idm.User) *usermodel.User {

	pa := strings.TrimRight(u.GroupPath, "/") + "/" + u.Login
	pa = safeGroupPath(pa)
	n := &tree.Node{
		Path: pa,
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
	return &usermodel.User{
		TreeNode: tree.TreeNode{
			Node: n,
		},
	}

}

func groupToNode(g *idm.User) *usermodel.User {
	n := &tree.Node{
		Path:      safeGroupPath(g.GroupPath),
		Uuid:      g.Uuid,
		Type:      tree.NodeType_COLLECTION,
		MetaStore: map[string]string{"name": g.GroupLabel},
	}

	return &usermodel.User{
		TreeNode: tree.TreeNode{
			Node: n,
		},
	}
}

func nodeToUserOrGroup(t tree.ITreeNode, u *idm.User) {
	if t.GetNode().IsLeaf() {
		nodeToUser(t, u)
	} else {
		nodeToGroup(t, u)
	}
}

func nodeToUser(t tree.ITreeNode, u *idm.User) {
	u.Uuid = t.GetNode().GetUuid()
	u.Login = t.GetName()
	u.Password = t.GetNode().GetEtag()
	u.GroupPath = path.Dir(t.GetNode().GetPath())
	u.LastConnected = int32(t.GetNode().GetMTime())

	var gRoles []string
	_ = t.GetNode().GetMeta("GroupRoles", &gRoles)
	// Do not apply inheritance to anonymous user
	if t.GetName() == common.PydioS3AnonUsername {
		u.Roles = []*idm.Role{}
	}
	for _, rId := range gRoles {
		u.Roles = append(u.Roles, &idm.Role{Uuid: rId, GroupRole: true})
	}
}

func nodeToGroup(t tree.ITreeNode, u *idm.User) {
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
	_, _ = builder.WriteString("LOWER(")
	builder.WriteQuoted(eq.Column)
	_, _ = builder.WriteString(") = LOWER(")
	builder.AddVar(builder, eq.Value)
	_, _ = builder.WriteString(")")
}
