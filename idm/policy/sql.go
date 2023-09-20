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

package policy

import (
	"context"
	"embed"
	"fmt"
	"github.com/pydio/cells/v4/common"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/ory/ladon"
	migrate "github.com/rubenv/sql-migrate"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/sql/ladon-manager"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/statics"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"github.com/pydio/cells/v4/idm/policy/converter"
)

type sqlimpl struct {
	sql.DAO
	ladon.Ladon
	ladon_manager.SQLManager
}

var (
	//go:embed migrations/*
	migrationsFS embed.FS

	queries = map[string]string{
		"upsertPolicyGroup": `INSERT INTO idm_policy_group (uuid,name,description,owner_uuid,resource_group,last_updated) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=?,description=?,owner_uuid=?,resource_group=?,last_updated=?`,
		"deletePolicyGroup": `DELETE FROM idm_policy_group WHERE uuid=?`,
		"insertRelPolicy":   `INSERT INTO idm_policy_rel (group_uuid,policy_id) VALUES (?,?)`,
		"deleteRelPolicies": `DELETE FROM idm_policy_rel WHERE group_uuid=?`,
		"listJoined":        `SELECT p.uuid,p.name,p.description,p.owner_uuid,p.resource_group,p.last_updated,r.policy_id FROM idm_policy_group as p,idm_policy_rel as r WHERE r.group_uuid=p.uuid`,
		"listJoinedUuid":    `SELECT p.uuid,p.name,p.description,p.owner_uuid,p.resource_group,p.last_updated,r.policy_id FROM idm_policy_group as p,idm_policy_rel as r WHERE r.group_uuid=p.uuid AND p.uuid=?`,
		"listJoinedLike":    `SELECT p.uuid,p.name,p.description,p.owner_uuid,p.resource_group,p.last_updated,r.policy_id FROM idm_policy_group as p,idm_policy_rel as r WHERE r.group_uuid=p.uuid AND (p.name LIKE ? or p.description LIKE ?)`,
		"listJoinedRes":     `SELECT p.uuid,p.name,p.description,p.owner_uuid,p.resource_group,p.last_updated,r.policy_id FROM idm_policy_group as p,idm_policy_rel as r WHERE r.group_uuid=p.uuid AND p.resource_group=?`,
		"listRelPolicies":   `SELECT policy_id FROM idm_policy_rel WHERE group_uuid=?`,
	}
)

// Init of the SQL DAO
func (s *sqlimpl) Init(ctx context.Context, options configx.Values) error {

	// First - Create Ladon package tables
	db := sqlx.NewDb(s.DB(), s.Driver())
	manag := ladon_manager.NewSQLManager(db, nil)

	sql.LockMigratePackage()
	if _, err := manag.CreateSchemas("", "ladon_migrations"); err != nil {
		sql.UnlockMigratePackage()
		return err
	}
	sql.UnlockMigratePackage()

	s.Manager = manag
	s.SQLManager = *manag

	// Detect version
	driverName := s.Driver()
	if driverName == "mysql" {
		var version string
		if e := db.QueryRow("SELECT VERSION()").Scan(&version); e == nil && strings.Contains(version, "MariaDB") {
			log.Logger(servicecontext.WithServiceName(context.Background(), common.ServiceGrpcNamespace_+common.ServicePolicy)).Info("MariaDB Detected - switching to specific migrations")
			driverName = "maria"
		}
	}

	// Doing the database migrations
	migrations := &sql.FSMigrationSource{
		Box:         statics.AsFS(migrationsFS, "migrations"),
		Dir:         driverName,
		TablePrefix: s.Prefix(),
	}

	_, err := sql.ExecMigration(s.DB(), s.Driver(), migrations, migrate.Up, "idm_policy_")
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

// StorePolicyGroup first upserts policies (and fail fast) before upserting the passed policy group
// and recreating corresponding relations.
func (s *sqlimpl) StorePolicyGroup(ctx context.Context, group *idm.PolicyGroup) (*idm.PolicyGroup, error) {

	if group.Uuid == "" {
		group.Uuid = uuid.New()
	} else {
		// Gather remove policies
		var delPolicies []string
		stmt, er := s.GetStmt("listRelPolicies")
		if er != nil {
			return nil, er
		}
		if res, err := stmt.Query(group.Uuid); err == nil {
			defer res.Close()
			for res.Next() {
				var pId string
				sE := res.Scan(&pId)
				if sE != nil {
					return nil, sE
				}
				var found bool
				for _, in := range group.Policies {
					if in.Id == pId {
						found = true
						break
					}
				}
				if !found {
					delPolicies = append(delPolicies, pId)
				}
			}
		}

		// First clear relations
		stmt, er = s.GetStmt("deleteRelPolicies")
		if er != nil {
			return nil, er
		}

		_, err := stmt.Exec(group.Uuid)
		if err != nil {
			log.Logger(ctx).Error(fmt.Sprintf("could not delete relation for policy group %s", group.Uuid), zap.Error(err))
			return group, err
		}

		// Delete removed ones
		for _, pID := range delPolicies {
			if er := s.Manager.Delete(pID); er != nil {
				return nil, er
			}
		}
	}

	// Insert or update Policies first
	for _, policy := range group.Policies {
		if policy.Id == "" { // must be a new policy
			policy.Id = uuid.New()
			err := s.Manager.Create(converter.ProtoToLadonPolicy(policy))
			if err != nil {
				log.Logger(ctx).Error(fmt.Sprintf("cannot create new ladon policy with description: %s", policy.Description), zap.Error(err))
				return group, err
			}
		} else { // maybe new or update
			p, err := s.Manager.Get(policy.Id)
			if err != nil && err.Error() != "sql: no rows in result set" {
				log.Logger(ctx).Error(fmt.Sprintf("unable to retrieve policy with id %s", policy.Id), zap.Error(err))
				return group, err
			}
			if p != nil {
				err = s.Manager.Update(converter.ProtoToLadonPolicy(policy))
			} else {
				err = s.Manager.Create(converter.ProtoToLadonPolicy(policy))
			}
			if err != nil {
				log.Logger(ctx).Error(fmt.Sprintf("cannot upsert policy with id %s", policy.Id), zap.Error(err))
				return group, err
			}
		}
	}

	// Insert Policy Group
	now := int32(time.Now().Unix())

	stmt, er := s.GetStmt("upsertPolicyGroup")
	if er != nil {
		return nil, er
	}

	_, err := stmt.Exec(
		group.Uuid, group.Name, group.Description, group.OwnerUuid, group.ResourceGroup, now, // INSERT
		group.Name, group.Description, group.OwnerUuid, group.ResourceGroup, now, // UPDATE
	)
	if err != nil {
		log.Logger(ctx).Error("cannot upsert policy group "+group.Uuid, zap.Error(err))
	}

	// Now recreate relations
	for _, policy := range group.Policies {
		stmt, er := s.GetStmt("insertRelPolicy")
		if er != nil {
			return nil, er
		}

		if _, err := stmt.Exec(group.Uuid, policy.Id); err != nil {
			log.Logger(ctx).Error(fmt.Sprintf("cannot insert relation between group %s and policy %s", group.Uuid, policy.Id), zap.Error(err))
		}
	}

	return group, err

}

// ListPolicyGroups searches the db and returns an array of PolicyGroup.
func (s *sqlimpl) ListPolicyGroups(ctx context.Context, filter string) (groups []*idm.PolicyGroup, e error) {

	stmtName := "listJoined"
	var args []interface{}
	if strings.HasPrefix(filter, "resource_group:") {
		res := strings.TrimPrefix(filter, "resource_group:")
		if resId, ok := idm.PolicyResourceGroup_value[res]; ok {
			stmtName = "listJoinedRes"
			args = append(args, resId)
		}
	} else if strings.HasPrefix(filter, "uuid:") {
		id := strings.TrimPrefix(filter, "uuid:")
		stmtName = "listJoinedUuid"
		args = append(args, id)
	} else if strings.HasPrefix(filter, "like:") {
		like := "%" + strings.TrimPrefix(filter, "like:") + "%"
		stmtName = "listJoinedLike"
		args = append(args, like, like)
	}

	stmt, er := s.GetStmt(stmtName)
	if er != nil {
		return nil, er
	}

	res, err := stmt.Query(args...)
	if err != nil {
		return groups, err
	}
	result := make(map[string]*idm.PolicyGroup)
	defer res.Close()
	for res.Next() {
		policyGroup := new(idm.PolicyGroup)
		var resourceGroup int32
		var policyId string
		res.Scan(
			&policyGroup.Uuid,
			&policyGroup.Name,
			&policyGroup.Description,
			&policyGroup.OwnerUuid,
			&resourceGroup,
			&policyGroup.LastUpdated,
			&policyId,
		)
		if alreadyScanned, ok := result[policyGroup.Uuid]; ok {
			policyGroup = alreadyScanned
		}
		if policy, e := s.Get(policyId); e == nil {
			policyGroup.Policies = append(policyGroup.Policies, converter.LadonToProtoPolicy(policy))
		}
		policyGroup.ResourceGroup = idm.PolicyResourceGroup(resourceGroup)
		result[policyGroup.Uuid] = policyGroup
	}
	for _, group := range result {
		groups = append(groups, group)
	}
	return
}

// DeletePolicyGroup deletes a policy group and all related policies.
func (s *sqlimpl) DeletePolicyGroup(ctx context.Context, group *idm.PolicyGroup) error {

	var policies []string

	stmt, er := s.GetStmt("listRelPolicies")
	if er != nil {
		return er
	}

	if res, err := stmt.Query(group.Uuid); err == nil {
		defer res.Close()
		for res.Next() {
			var pId string
			res.Scan(&pId)
			policies = append(policies, pId)
		}
	}

	stmt, er = s.GetStmt("deleteRelPolicies")
	if er != nil {
		return er
	}

	if _, err := stmt.Exec(group.Uuid); err != nil {
		return err
	}

	stmt, er = s.GetStmt("deletePolicyGroup")
	if er != nil {
		return er
	}
	if _, err := stmt.Exec(group.Uuid); err != nil {
		return err
	}

	for _, policyId := range policies {
		if err := s.Delete(policyId); err != nil {
			log.Logger(ctx).Error("cannot delete policy "+policyId, zap.String("policyId", policyId), zap.Error(err))
		}
	}

	return nil
}
