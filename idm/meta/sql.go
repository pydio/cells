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
	"fmt"
	"time"

	"github.com/gobuffalo/packr"
	"github.com/pborman/uuid"
	migrate "github.com/rubenv/sql-migrate"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	service "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/common/sql/resources"
	"github.com/pydio/cells/idm/meta/namespace"
	"gopkg.in/doug-martin/goqu.v4"
)

var (
	queries = map[string]string{
		"AddMeta":    `insert into idm_usr_meta (uuid, node_uuid, namespace, owner, timestamp, format, data) values (?, ?,?,?,?,?,?)`,
		"UpdateMeta": `update idm_usr_meta set node_uuid=?, namespace=?, owner=?, timestamp=?, format=?, data=? WHERE uuid=?`,
		"Exists":     `select uuid from idm_usr_meta where node_uuid=? and namespace=? and owner=?`,
		"DeleteMeta": `delete from idm_usr_meta where uuid=?`,
	}
)

// Impl of the sql interface
type sqlimpl struct {
	*sql.Handler

	*resources.ResourcesSQL

	nsDAO namespace.DAO
}

func (dao *sqlimpl) GetNamespaceDao() namespace.DAO {
	return dao.nsDAO
}

// Init handler for the SQL DAO.
func (s *sqlimpl) Init(options common.ConfigValues) error {

	// super
	s.DAO.Init(options)

	// Preparing the resources

	s.ResourcesSQL = resources.NewDAO(s.Handler, "idm_usr_meta.uuid").(*resources.ResourcesSQL)
	if err := s.ResourcesSQL.Init(options); err != nil {
		return err
	}

	// Doing the database migrations
	migrations := &sql.PackrMigrationSource{
		Box:         packr.NewBox("../../idm/meta/migrations"),
		Dir:         s.Driver(),
		TablePrefix: s.Prefix(),
	}

	_, err := sql.ExecMigration(s.DB(), s.Driver(), migrations, migrate.Up, "idm_usr_meta_")
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

	// Initing namespace
	nsDAO := namespace.NewDAO(s.Handler)
	if err := nsDAO.Init(options); err != nil {
		return err
	}

	s.nsDAO = nsDAO.(namespace.DAO)

	return nil
}

// Add or Update a UserMeta to the DB.
func (dao *sqlimpl) Set(meta *idm.UserMeta) (*idm.UserMeta, bool, error) {
	var (
		update bool
		metaId string
	)

	owner := dao.extractOwner(meta.Policies)

	if stmt := dao.GetStmt("Exists"); stmt != nil {

		exists := stmt.QueryRow(meta.NodeUuid, meta.Namespace, owner)
		if err := exists.Scan(&metaId); err == nil && metaId != "" {
			update = true
		} else {
			metaId = uuid.NewUUID().String()
		}
	}

	var err error
	if update {
		stmt := dao.GetStmt("UpdateMeta")
		if stmt == nil {
			return nil, false, fmt.Errorf("Unknown statement")
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
			return meta, update, err
		}
	} else {
		stmt := dao.GetStmt("AddMeta")
		if stmt == nil {
			return nil, false, fmt.Errorf("Unknown statement")
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
			return meta, update, err
		}

	}
	meta.Uuid = metaId

	if err == nil && len(meta.Policies) > 0 {
		for _, p := range meta.Policies {
			p.Resource = meta.Uuid
		}
		err = dao.AddPolicies(update, meta.Uuid, meta.Policies)
	}

	return meta, update, err
}

// Delete meta by their Id.
func (dao *sqlimpl) Del(meta *idm.UserMeta) (e error) {
	stmt := dao.GetStmt("DeleteMeta")
	if stmt == nil {
		return fmt.Errorf("Unknown statement")
	}

	if _, e := stmt.Exec(meta.Uuid); e != nil {
		return e
	} else if e := dao.DeletePoliciesForResource(meta.Uuid); e != nil {
		return e
	}
	return nil
}

// Search meta on their conditions.
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
