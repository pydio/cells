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

package meta

import (
	"context"
	"embed"
	"time"

	goqu "github.com/doug-martin/goqu/v9"
	migrate "github.com/rubenv/sql-migrate"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	service "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/sql/resources"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/statics"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"github.com/pydio/cells/v4/idm/meta/namespace"
)

var (
	//go:embed migrations/*
	migrationsFS embed.FS

	queries = map[string]string{
		"AddMeta":      `insert into idm_usr_meta (uuid, node_uuid, namespace, owner, timestamp, format, data) values (?, ?,?,?,?,?,?)`,
		"UpdateMeta":   `update idm_usr_meta set node_uuid=?, namespace=?, owner=?, timestamp=?, format=?, data=? WHERE uuid=?`,
		"Exists":       `select uuid, data from idm_usr_meta where node_uuid=? and namespace=? and owner=?`,
		"ExistsByUuid": `select data from idm_usr_meta where uuid=?`,
		"DeleteMeta":   `delete from idm_usr_meta where uuid=?`,
	}
)

// Impl of the SQL interface
type sqlimpl struct {
	*sql.Handler

	*resources.ResourcesSQL

	nsDAO namespace.DAO
}

func (dao *sqlimpl) GetNamespaceDao() namespace.DAO {
	return dao.nsDAO
}

// Init handler for the SQL DAO
func (dao *sqlimpl) Init(options configx.Values) error {

	// super
	dao.DAO.Init(options)

	// Preparing the resources

	dao.ResourcesSQL = resources.NewDAO(dao.Handler, "idm_usr_meta.uuid").(*resources.ResourcesSQL)
	if err := dao.ResourcesSQL.Init(options); err != nil {
		return err
	}

	// Doing the database migrations
	migrations := &sql.FSMigrationSource{
		Box:         statics.AsFS(migrationsFS, "migrations"),
		Dir:         dao.Driver(),
		TablePrefix: dao.Prefix(),
	}

	_, err := sql.ExecMigration(dao.DB(), dao.Driver(), migrations, migrate.Up, "idm_usr_meta_")
	if err != nil {
		return err
	}

	// Preparing the db statements
	if options.Val("prepare").Default(true).Bool() {
		for key, query := range queries {
			if err := dao.Prepare(key, query); err != nil {
				return err
			}
		}
	}

	// Initing namespace
	nsDAO := namespace.NewDAO(dao.Handler)
	if err := nsDAO.Init(options); err != nil {
		return err
	}

	dao.nsDAO = nsDAO.(namespace.DAO)

	return nil
}

// Set adds or updates a UserMeta to the DB
func (dao *sqlimpl) Set(meta *idm.UserMeta) (*idm.UserMeta, string, error) {
	var (
		previousValue string
		metaId        string
		update        bool
	)

	owner := dao.extractOwner(meta.Policies)

	stmt, er := dao.GetStmt("Exists")
	if er != nil {
		return nil, previousValue, er
	}

	exists := stmt.QueryRow(meta.NodeUuid, meta.Namespace, owner)
	if err := exists.Scan(&metaId, &previousValue); err == nil && metaId != "" {
		update = true
		// Replace empty string by empty json meta
		if previousValue == "\"\"" {
			previousValue = ""
		}
	} else {
		metaId = uuid.New()
	}

	if update {
		stmt, er := dao.GetStmt("UpdateMeta")
		if er != nil {
			return nil, previousValue, er
		}

		if _, err := stmt.Exec(
			meta.NodeUuid,
			meta.Namespace,
			owner,
			int32(time.Now().Unix()),
			"json",
			meta.JsonValue,
			&metaId,
		); err != nil {
			return meta, previousValue, err
		}
	} else {
		stmt, er := dao.GetStmt("AddMeta")
		if er != nil {
			return nil, previousValue, er
		}

		if _, err := stmt.Exec(
			metaId,
			meta.NodeUuid,
			meta.Namespace,
			owner,
			time.Now().Unix(),
			"json",
			meta.JsonValue,
		); err != nil {
			return meta, previousValue, err
		}

	}
	meta.Uuid = metaId

	var err error
	if len(meta.Policies) > 0 {
		for _, p := range meta.Policies {
			p.Resource = meta.Uuid
		}
		err = dao.AddPolicies(update, meta.Uuid, meta.Policies)
	}

	return meta, previousValue, err
}

// Del deletes meta by their Id.
func (dao *sqlimpl) Del(meta *idm.UserMeta) (previousValue string, e error) {

	stmt, er := dao.GetStmt("ExistsByUuid")
	if er != nil {
		return previousValue, er
	}
	exists := stmt.QueryRow(meta.Uuid)
	exists.Scan(&previousValue)
	// Replace empty string by empty json meta
	if previousValue == "\"\"" {
		previousValue = ""
	}

	stmt, er = dao.GetStmt("DeleteMeta")
	if er != nil {
		return "", er
	}

	if _, e := stmt.Exec(meta.Uuid); e != nil {
		return "", e
	} else if e := dao.DeletePoliciesForResource(meta.Uuid); e != nil {
		return "", e
	}
	return previousValue, nil
}

// Search meta on their conditions
func (dao *sqlimpl) Search(metaIds []string, nodeUuids []string, namespace string, ownerSubject string, resourceQuery *service.ResourcePolicyQuery) ([]*idm.UserMeta, error) {

	db := goqu.New(dao.Driver(), dao.DB())

	var wheres []goqu.Expression

	policyQ, err := dao.BuildPolicyConditionForAction(resourceQuery, service.ResourcePolicyAction_READ)
	if err != nil {
		return nil, err
	}
	if policyQ != nil {
		wheres = append(wheres, policyQ)
	}

	if len(metaIds) > 0 {
		var ors []goqu.Expression
		for _, metaId := range metaIds {
			ors = append(ors, goqu.I("uuid").Eq(metaId))
		}
		wheres = append(wheres, goqu.Or(ors...))
	}
	if len(nodeUuids) > 0 {
		var ors []goqu.Expression
		for _, nodeId := range nodeUuids {
			ors = append(ors, goqu.I("node_uuid").Eq(nodeId))
		}
		wheres = append(wheres, goqu.Or(ors...))
	}
	if namespace != "" {
		wheres = append(wheres, goqu.I("namespace").Eq(namespace))
	}
	if ownerSubject != "" {
		wheres = append(wheres, goqu.I("owner").Eq(ownerSubject))
	}
	if len(wheres) == 0 {
		return nil, err
	}

	dataset := db.
		From("idm_usr_meta").
		Prepared(true).
		Where(goqu.And(wheres...))

	var items []struct {
		UUID      string `db:"uuid"`
		NodeUUID  string `db:"node_uuid"`
		Namespace string `db:"namespace"`
		JSONValue string `db:"data"`
	}

	if err := dataset.ScanStructs(&items); err != nil {
		return nil, err
	}

	var results []*idm.UserMeta

	for _, item := range items {
		userMeta := new(idm.UserMeta)

		userMeta.Uuid = item.UUID
		userMeta.NodeUuid = item.NodeUUID
		userMeta.Namespace = item.Namespace
		userMeta.JsonValue = item.JSONValue

		if policies, e := dao.GetPoliciesForResource(userMeta.Uuid); e == nil {
			userMeta.Policies = policies
		} else {
			log.Logger(context.Background()).Error("cannot load resource policies for uuid: "+userMeta.Uuid, zap.Error(e))
		}
		results = append(results, userMeta)
	}

	return results, nil
}

func (*sqlimpl) extractOwner(policies []*service.ResourcePolicy) (owner string) {

	for _, policy := range policies {
		if policy.Action == service.ResourcePolicyAction_OWNER {
			return policy.Subject
		}
	}
	return ""

}
