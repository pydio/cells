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

package workspace

import (
	"context"
	"embed"
	"fmt"
	"time"

	goqu "github.com/doug-martin/goqu/v9"
	migrate "github.com/rubenv/sql-migrate"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/idm"
	service "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/sql/resources"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/statics"
)

var (
	//go:embed migrations/*
	migrationsFS embed.FS

	queries = map[string]string{
		"AddWorkspace":            `replace into idm_workspaces (uuid, label, description, attributes, slug, scope, last_updated) values (?, ?, ?, ?, ?, ?, ?)`,
		"GetWorkspace":            `select uuid from idm_workspaces where uuid = ?`,
		"ExistsWorkspace":         `select count(uuid) from idm_workspaces where uuid = ?`,
		"ExistsWorkspaceWithSlug": `select count(uuid) from idm_workspaces where slug = ?`,
	}
)

// Impl of the SQL interface
type sqlimpl struct {
	*sql.Handler

	*resources.ResourcesSQL
}

// Init handler for the SQL DAO
func (s *sqlimpl) Init(ctx context.Context, options configx.Values) error {

	// super
	if er := s.DAO.Init(ctx, options); er != nil {
		return er
	}

	// Preparing the resources
	s.ResourcesSQL = resources.NewDAO(s.Handler, "idm_workspaces.uuid").(*resources.ResourcesSQL)
	if err := s.ResourcesSQL.Init(ctx, options); err != nil {
		return err
	}
	// Doing the database migrations
	migrations := &sql.FSMigrationSource{
		Box:         statics.AsFS(migrationsFS, "migrations"),
		Dir:         s.Driver(),
		TablePrefix: s.Prefix(),
	}
	_, err := sql.ExecMigration(s.DB(), s.Driver(), migrations, migrate.Up, "idm_workspace_")
	if err != nil {
		return err
	}
	// Preparing the db statements
	if options.Val("prepare").Default(true).Bool() {
		for key, query := range queries {
			if err := s.Prepare(key, query); err != nil {
				return err
			}
		}
	}

	return nil
}

// Add to the SQL DB.
func (s *sqlimpl) Add(in interface{}) (bool, error) {

	workspace, ok := in.(*idm.Workspace)
	if !ok {
		return false, errors.BadRequest(common.ServiceWorkspace, "Wrong type")
	}
	update := false
	stmt, er := s.GetStmt("ExistsWorkspace")
	if er != nil {
		return false, er
	}

	exists := stmt.QueryRow(workspace.UUID)
	count := new(int)
	if err := exists.Scan(&count); err != sql.ErrNoRows && *count > 0 {
		update = true
	}
	if !update && s.slugExists(workspace.Slug) {
		index := 1
		baseSlug := workspace.Slug
		testSlug := fmt.Sprintf("%s-%v", baseSlug, index)
		for {
			if !s.slugExists(testSlug) {
				break
			}
			index++
			testSlug = fmt.Sprintf("%s-%v", baseSlug, index)
		}
		workspace.Slug = testSlug
	}
	stmt, er = s.GetStmt("AddWorkspace")
	if er != nil {
		return false, er
	}

	_, err := stmt.Exec(workspace.UUID, workspace.Label, workspace.Description, workspace.Attributes, workspace.Slug, workspace.Scope, time.Now().Unix())
	if err != nil {
		return update, err
	}
	return update, nil
}

// slugExists check in the DB if the slug already exists.
func (s *sqlimpl) slugExists(slug string) bool {
	if slug == common.PydioDocstoreBinariesNamespace || slug == common.PydioThumbstoreNamespace || slug == common.PydioVersionsNamespace {
		return true
	}

	stmt, er := s.GetStmt("ExistsWorkspaceWithSlug")
	if er != nil {
		return false
	}

	exists := stmt.QueryRow(slug)
	count := new(int)
	if err := exists.Scan(&count); err != sql.ErrNoRows && *count > 0 {
		return true
	}
	return false
}

// Search searches
func (s *sqlimpl) Search(query sql.Enquirer, workspaces *[]interface{}) error {

	whereExpression := sql.NewQueryBuilder(query, new(queryBuilder)).Expression(s.Driver())
	resourceExpr, e := s.ResourcesSQL.BuildPolicyConditionForAction(query.GetResourcePolicyQuery(), service.ResourcePolicyAction_READ)
	if e != nil {
		return e
	}
	queryString, args, err := sql.QueryStringFromExpression("idm_workspaces", s.Driver(), query, whereExpression, resourceExpr, -1)
	if err != nil {
		return err
	}

	res, err := s.DB().Query(queryString, args...)
	if err != nil {
		return err
	}

	defer res.Close()
	for res.Next() {
		workspace := new(idm.Workspace)
		var lastUpdate int
		var scope int
		res.Scan(&workspace.UUID, &workspace.Label, &workspace.Description, &workspace.Attributes, &workspace.Slug, &scope, &lastUpdate)
		workspace.LastUpdated = int32(lastUpdate)
		workspace.Scope = idm.WorkspaceScope(scope)
		*workspaces = append(*workspaces, workspace)
	}

	return nil
}

// Del from the SQL DB
func (s *sqlimpl) Del(query sql.Enquirer) (int64, error) {

	//whereString := sql.NewDAOQuery(query, new(queryConverter)).String()
	whereExpression := sql.NewQueryBuilder(query, new(queryBuilder)).Expression(s.Driver())
	queryString, args, err := sql.DeleteStringFromExpression("idm_workspaces", s.Driver(), whereExpression)
	if err != nil {
		return 0, err
	}

	res, err := s.DB().Exec(queryString, args...)
	if err != nil {
		return 0, err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}

	return rows, nil
}

type queryBuilder idm.WorkspaceSingleQuery

func (c *queryBuilder) Convert(val *anypb.Any, driver string) (goqu.Expression, bool) {

	q := new(idm.WorkspaceSingleQuery)
	if err := anypb.UnmarshalTo(val, q, proto.UnmarshalOptions{}); err != nil {
		return nil, false
	}

	var expressions []goqu.Expression

	if q.Uuid != "" {
		expressions = append(expressions, sql.GetExpressionForString(q.Not, "uuid", q.Uuid))
	}

	if q.Slug != "" {
		expressions = append(expressions, sql.GetExpressionForString(q.Not, "slug", q.Slug))
	}

	if q.Label != "" {
		expressions = append(expressions, sql.GetExpressionForString(q.Not, "label", q.Label))
	}

	if q.Scope != idm.WorkspaceScope_ANY {
		expressions = append(expressions, goqu.C("scope").Eq(q.Scope))
	}

	if q.LastUpdated != "" {
		if lt, d, e := q.ParseLastUpdated(); e == nil {
			ref := int32(time.Now().Add(-d).Unix())
			if lt || q.Not {
				expressions = append(expressions, goqu.C("last_updated").Lt(ref))
			} else {
				expressions = append(expressions, goqu.C("last_updated").Gt(ref))
			}
		}
	}

	if q.HasAttribute != "" {
		// search in JSON
		expressions = append(expressions, sql.GetExpressionForString(q.Not, "attributes", `*"`+q.HasAttribute+`":*`))
	}
	if q.AttributeName != "" && q.AttributeValue != "" {
		// search in JSON
		expressions = append(expressions, sql.GetExpressionForString(q.Not, "attributes", `*"`+q.AttributeName+`":"`+q.AttributeValue+`"*`))
	}

	if len(expressions) == 0 {
		return nil, true
	}
	return goqu.And(expressions...), true

}
