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
	"fmt"
	"strings"
	"time"

	"github.com/doug-martin/goqu"

	"github.com/gobuffalo/packr"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/errors"
	migrate "github.com/rubenv/sql-migrate"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/service/proto"
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

	search  = `select * from idm_workspaces`
	deleteQ = `delete from idm_workspaces`
)

// Impl of the Mysql interface
type sqlimpl struct {
	*sql.Handler

	*resources.ResourcesSQL
}

// Init handler for the SQL DAO
func (s *sqlimpl) Init(options config.Map) error {

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

	_, err := migrate.Exec(s.DB(), s.Driver(), migrations, migrate.Up)
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

// Add to the mysql DB
func (s *sqlimpl) Add(in interface{}) (bool, error) {

	workspace, ok := in.(*idm.Workspace)
	if !ok {
		return false, errors.BadRequest(common.SERVICE_WORKSPACE, "Wrong type")
	}
	update := false
	exists := s.GetStmt("ExistsWorkspace").QueryRow(workspace.UUID)
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
	_, err := s.GetStmt("AddWorkspace").Exec(workspace.UUID, workspace.Label, workspace.Description, workspace.Attributes, workspace.Slug, workspace.Scope, time.Now().Unix())
	if err != nil {
		return update, err
	}
	return update, nil
}

// slugExists check in the DB if the slug already exists
func (s *sqlimpl) slugExists(slug string) bool {
	if slug == common.PYDIO_DOCSTORE_BINARIES_NAMESPACE || slug == common.PYDIO_THUMBSTORE_NAMESPACE || slug == common.PYDIO_VERSIONS_NAMESPACE {
		return true
	}
	exists := s.GetStmt("ExistsWorkspaceWithSlug").QueryRow(slug)
	count := new(int)
	if err := exists.Scan(&count); err != sql.ErrNoRows && *count > 0 {
		return true
	}
	return false
}

// Search in the mysql DB
func (s *sqlimpl) Search(query sql.Enquirer, workspaces *[]interface{}) error {

	var wheres []string

	if query.GetResourcePolicyQuery() != nil {
		resourceString := s.ResourcesSQL.BuildPolicyConditionForAction(query.GetResourcePolicyQuery(), service.ResourcePolicyAction_READ)
		if resourceString != "" {
			wheres = append(wheres, resourceString)
		}
	}

	whereString := sql.NewDAOQuery(query, new(queryConverter)).String()
	if len(whereString) != 0 {
		wheres = append(wheres, whereString)
	}

	if len(wheres) > 0 {
		whereString = sql.JoinWheresWithParenthesis(wheres, "AND")
	}

	offset, limit := int64(query.GetOffset()), int64(query.GetLimit())
	if query.GetOffset() > 0 {
		offset = query.GetOffset()
	}
	if query.GetLimit() == 0 {
		// Default limit
		limit = 100
	}

	limitString := fmt.Sprintf(" limit %v,%v", offset, limit)
	if query.GetLimit() == -1 {
		limitString = ""
	}

	queryString := search + whereString + limitString

	log.Logger(context.Background()).Debug("Search Workspaces", zap.String("sql", queryString))

	res, err := s.DB().Query(queryString)
	if err != nil {
		return err
	}

	defer res.Close()
	for res.Next() {
		workspace := new(idm.Workspace)
		var lastUpdate int
		var scope int
		res.Scan(
			&workspace.UUID,
			&workspace.Label,
			&workspace.Description,
			&workspace.Attributes,
			&workspace.Slug,
			&scope,
			&lastUpdate,
		)
		workspace.LastUpdated = int32(lastUpdate)
		workspace.Scope = idm.WorkspaceScope(scope)

		*workspaces = append(*workspaces, workspace)
	}

	return nil
}

func (s *sqlimpl) SearchUsingBuilder(query sql.Enquirer, workspaces *[]interface{}) error {
	whereExpression := sql.NewQueryBuilder(query, new(queryBuilder)).Expression()
	if whereExpression == nil {
		return errors.New("internal", "failed to generate query conditions", 500)
	}

	var db *goqu.Database
	db = goqu.New("sqlite3", nil)

	dataset := db.From("idm_workspaces").Where(whereExpression)
	offset, limit := int64(0), int64(100)
	if query.GetOffset() > 0 {
		offset = query.GetOffset()
	}
	if query.GetLimit() == 0 {
		limit = 100
	}
	dataset = dataset.Offset(uint(offset)).Limit(uint(limit))

	queryString, _, err := dataset.ToSql()
	if err != nil {
		return err
	}

	res, err := s.DB().Query(queryString)
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

// Del from the mysql DB
func (s *sqlimpl) Del(query sql.Enquirer) (int64, error) {

	whereString := sql.NewDAOQuery(query, new(queryConverter)).String()

	if len(whereString) == 0 || len(strings.Trim(whereString, "()")) == 0 {
		return 0, errors.BadRequest(common.SERVICE_WORKSPACE, "Empty condition for Delete, this is too broad a query!")
	}

	if len(whereString) != 0 {
		whereString = " where " + whereString
	}

	queryString := deleteQ + whereString

	res, err := s.DB().Exec(queryString)
	if err != nil {
		return 0, err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}

	return rows, nil
}

type queryConverter idm.WorkspaceSingleQuery

func (c *queryConverter) Convert(val *any.Any) (string, bool) {

	q := new(idm.WorkspaceSingleQuery)

	if err := ptypes.UnmarshalAny(val, q); err != nil {
		return "", false
	}
	var wheres []string
	if q.Uuid != "" {
		wheres = append(wheres, sql.GetQueryValueFor("uuid", q.Uuid))
	}

	if q.Slug != "" {
		wheres = append(wheres, sql.GetQueryValueFor("slug", q.Slug))
	}

	if q.Label != "" {
		wheres = append(wheres, sql.GetQueryValueFor("label", q.Label))
	}

	if q.Scope != idm.WorkspaceScope_ANY {
		wheres = append(wheres, fmt.Sprintf("scope=%v", int32(q.Scope)))
	}

	if len(wheres) == 0 {
		return "", false
	}
	qString := strings.Join(wheres, " AND ")
	if q.Not {
		qString = fmt.Sprintf("NOT (%s)", qString)
	}

	return qString, true
}

type queryBuilder idm.WorkspaceSingleQuery

func (c *queryBuilder) Convert(val *any.Any) (goqu.Expression, bool) {
	q := new(idm.WorkspaceSingleQuery)

	if err := ptypes.UnmarshalAny(val, q); err != nil {
		return nil, false
	}

	var expressions []goqu.Expression

	if q.Uuid != "" {
		if strings.Contains(q.Uuid, "*") {
			expressions = append(expressions, goqu.I("uuid").Like(strings.Replace(q.Uuid, "*", "%", -1)))
		} else {
			expressions = append(expressions, goqu.I("uuid").Eq(q.Uuid))
		}
	}

	if q.Slug != "" {
		if strings.Contains(q.Slug, "*") {
			expressions = append(expressions, goqu.I("slug").Like(strings.Replace(q.Slug, "*", "%", -1)))
		} else {
			expressions = append(expressions, goqu.I("slug").Eq(q.Slug))
		}
	}

	if q.Label != "" {
		if strings.Contains(q.Label, "*") {
			expressions = append(expressions, goqu.I("label").Like(strings.Replace(q.Label, "*", "%", -1)))
		} else {
			expressions = append(expressions, goqu.I("label").Eq(q.Label))
		}
	}

	if q.Description != "" {
		if strings.Contains(q.Description, "*") {
			expressions = append(expressions, goqu.I("description").Like(strings.Replace(q.Description, "*", "%", -1)))
		} else {
			expressions = append(expressions, goqu.I("description").Eq(q.Label))
		}
	}

	if q.Scope != idm.WorkspaceScope_ANY {
		expressions = append(expressions, goqu.I("scope").Eq(q.Scope))
	}

	if len(expressions) > 0 {
		return goqu.And(expressions...), true
	}
	return nil, true
}
