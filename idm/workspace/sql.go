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
	"fmt"
	"time"

	"github.com/gobuffalo/packr"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/errors"
	migrate "github.com/rubenv/sql-migrate"
	"gopkg.in/doug-martin/goqu.v4"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/idm"
	service "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/common/sql/resources"
)

var (
	queries = map[string]string{
		"AddWorkspace":            `replace into idm_workspaces (uuid, label, description, attributes, slug, scope, last_updated) values (?, ?, ?, ?, ?, ?, ?)`,
		"GetWorkspace":            `select uuid from idm_workspaces where uuid = ?`,
		"ExistsWorkspace":         `select count(uuid) from idm_workspaces where uuid = ?`,
		"ExistsWorkspaceWithSlug": `select count(uuid) from idm_workspaces where slug = ?`,
	}
)

// Impl of the SQL interface.
type sqlimpl struct {
	*sql.Handler

	*resources.ResourcesSQL
}

// Init handler for the SQL DAO.
func (s *sqlimpl) Init(options common.ConfigValues) error {

	// super
	s.DAO.Init(options)

	// Preparing the resources
	s.ResourcesSQL = resources.NewDAO(s.Handler, "idm_workspaces.uuid").(*resources.ResourcesSQL)
	if err := s.ResourcesSQL.Init(options); err != nil {
		return err
	}
	// Doing the database migrations
	migrations := &sql.PackrMigrationSource{
		Box:         packr.NewBox("../../idm/workspace/migrations"),
		Dir:         s.Driver(),
		TablePrefix: s.Prefix(),
	}
	_, err := sql.ExecMigration(s.DB(), s.Driver(), migrations, migrate.Up, "idm_workspace_")
	if err != nil {
		return err
	}
	// Preparing the db statements
	if options.Bool("prepare", true) {
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
		return false, errors.BadRequest(common.SERVICE_WORKSPACE, "Wrong type")
	}
	update := false
	stmt := s.GetStmt("ExistsWorkspace")
	if stmt == nil {
		return false, fmt.Errorf("Unknown statement")
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
	stmt = s.GetStmt("AddWorkspace")
	if stmt == nil {
		return false, fmt.Errorf("Unknown statement")
	}

	_, err := stmt.Exec(workspace.UUID, workspace.Label, workspace.Description, workspace.Attributes, workspace.Slug, workspace.Scope, time.Now().Unix())
	if err != nil {
		return update, err
	}
	return update, nil
}

// slugExists checks in the DB if the slug already exists.
func (s *sqlimpl) slugExists(slug string) bool {
	if slug == common.PYDIO_DOCSTORE_BINARIES_NAMESPACE || slug == common.PYDIO_THUMBSTORE_NAMESPACE || slug == common.PYDIO_VERSIONS_NAMESPACE {
		return true
	}

	stmt := s.GetStmt("ExistsWorkspaceWithSlug")
	if stmt == nil {
		return false
	}

	exists := stmt.QueryRow(slug)
	count := new(int)
	if err := exists.Scan(&count); err != sql.ErrNoRows && *count > 0 {
		return true
	}
	return false
}

// Search searches.
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

// Del from the SQL DB.
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

func (c *queryBuilder) Convert(val *any.Any, driver string) (goqu.Expression, bool) {

	q := new(idm.WorkspaceSingleQuery)
	if err := ptypes.UnmarshalAny(val, q); err != nil {
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
		expressions = append(expressions, goqu.I("scope").Eq(q.Scope))
	}

	if len(expressions) == 0 {
		return nil, true
	}
	return goqu.And(expressions...), true

}
