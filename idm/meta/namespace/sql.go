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

package namespace

import (
	"context"
	"embed"

	migrate "github.com/rubenv/sql-migrate"

	"github.com/pydio/cells/v4/common/proto/idm"
	service "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/sql/resources"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/statics"
)

var (
	//go:embed migrations/*
	migrationsFS embed.FS

	queries = map[string]string{
		"Add":    `insert into idm_usr_meta_ns (namespace, label, ns_order, indexable, definition) values (?,?,?,?,?)`,
		"Delete": `delete from idm_usr_meta_ns where namespace=?`,
		"List":   `select * from idm_usr_meta_ns order by ns_order asc`,
	}
)

// Impl of the SQL interface
type sqlimpl struct {
	*sql.Handler

	*resources.ResourcesSQL
}

// Init handler for the SQL DAO
func (dao *sqlimpl) Init(ctx context.Context, options configx.Values) error {

	// super
	if er := dao.DAO.Init(ctx, options); er != nil {
		return er
	}

	// Preparing the resources
	dao.ResourcesSQL = resources.NewDAO(dao.Handler, "idm_usr_meta_ns.namespace").(*resources.ResourcesSQL)
	if err := dao.ResourcesSQL.Init(ctx, options); err != nil {
		return err
	}

	// Doing the database migrations
	migrations := &sql.FSMigrationSource{
		Box:         statics.AsFS(migrationsFS, "migrations"),
		Dir:         dao.Driver(),
		TablePrefix: dao.Prefix() + "_ns",
	}

	_, err := sql.ExecMigration(dao.DB(), dao.Driver(), migrations, migrate.Up, "idm_usr_meta_ns_")
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

	dao.Add(&idm.UserMetaNamespace{
		Namespace: ReservedNamespaceBookmark,
		Label:     "Bookmarks",
		Policies: []*service.ResourcePolicy{
			{Action: service.ResourcePolicyAction_READ, Subject: "*", Effect: service.ResourcePolicy_allow},
			{Action: service.ResourcePolicyAction_WRITE, Subject: "*", Effect: service.ResourcePolicy_allow},
		},
	})

	return nil
}

// Add inserts a namespace
func (dao *sqlimpl) Add(ns *idm.UserMetaNamespace) error {
	indexableValue := 0
	if ns.Indexable {
		indexableValue = 1
	}

	stmt, er := dao.GetStmt("Add")
	if er != nil {
		return er
	}

	_, err := stmt.Exec(
		ns.Namespace,
		ns.Label,
		ns.Order,
		indexableValue,
		ns.JsonDefinition,
	)
	if err != nil {
		return err
	}
	if len(ns.Policies) > 0 {
		if err := dao.AddPolicies(false, ns.Namespace, ns.Policies); err != nil {
			return err
		}
	}
	return nil
}

// Del removes a namespace
func (dao *sqlimpl) Del(ns *idm.UserMetaNamespace) (e error) {

	stmt, er := dao.GetStmt("Delete")
	if er != nil {
		return er
	}

	if _, err := stmt.Exec(ns.Namespace); err != nil {
		return err
	}

	if err := dao.DeletePoliciesForResource(ns.Namespace); err != nil {
		return err
	}

	return nil
}

// List list all namespaces
func (dao *sqlimpl) List() (result map[string]*idm.UserMetaNamespace, err error) {

	stmt, er := dao.GetStmt("List")
	if er != nil {
		return nil, er
	}

	res, err := stmt.Query()
	if err != nil {
		return nil, err
	}
	defer res.Close()
	result = make(map[string]*idm.UserMetaNamespace)
	for res.Next() {
		ns := new(idm.UserMetaNamespace)
		var indexableValue int
		if err := res.Scan(&ns.Namespace, &ns.Label, &ns.Order, &indexableValue, &ns.JsonDefinition); err != nil {
			return nil, err
		}
		if indexableValue == 1 {
			ns.Indexable = true
		}
		// Add policies
		pol, err := dao.GetPoliciesForResource(ns.Namespace)
		if err != nil {
			return nil, err
		}
		ns.Policies = pol
		result[ns.Namespace] = ns
	}
	return
}
