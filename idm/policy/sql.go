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
	"time"

	"github.com/gobuffalo/packr"
	"github.com/jmoiron/sqlx"
	"github.com/ory/ladon"
	manager "github.com/ory/ladon/manager/sql"
	"github.com/pborman/uuid"
	"github.com/rubenv/sql-migrate"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/sql"
)

type sqlimpl struct {
	sql.DAO
	ladon.Ladon
	manager.SQLManager
}

var (
	queries = map[string]string{
		"upsertPolicyGroup": `INSERT INTO idm_policy_group (uuid,name,description,owner_uuid,resource_group,last_updated) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=?,description=?,owner_uuid=?,resource_group=?,last_updated=?`,
		"deletePolicyGroup": `DELETE FROM idm_policy_group WHERE uuid=?`,
		"insertRelPolicy":   `INSERT INTO idm_policy_rel (group_uuid,policy_id) VALUES (?,?)`,
		"deleteRelPolicies": `DELETE FROM idm_policy_rel WHERE group_uuid=?`,
		"listJoined":        `SELECT p.uuid,p.name,p.description,p.owner_uuid,p.resource_group,p.last_updated,r.policy_id FROM idm_policy_group as p,idm_policy_rel as r WHERE r.group_uuid=p.uuid`,
		"listRelPolicies":   `SELECT policy_id FROM idm_policy_rel WHERE group_uuid=?`,
	}
)

// Init of the MySQL DAO
func (s *sqlimpl) Init(options config.Map) error {

	// First - Create Ladon package tables
	db := sqlx.NewDb(s.DB(), s.Driver())
	manag := manager.NewSQLManager(db, nil)

	if _, err := manag.CreateSchemas("", ""); err != nil {
		return err
	}

	s.Manager = manag
	s.SQLManager = *manag

	// Doing the database migrations
	migrations := &sql.PackrMigrationSource{
		Box:         packr.NewBox("../../idm/policy/migrations"),
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

func (s *sqlimpl) StorePolicyGroup(ctx context.Context, group *idm.PolicyGroup) (*idm.PolicyGroup, error) {

	if group.Uuid == "" {
		group.Uuid = uuid.NewUUID().String()
	} else {
		// First clear relations
		s.GetStmt("deleteRelPolicies").Exec(group.Uuid)
	}

	// Insert or update Policies first
	for _, policy := range group.Policies {
		var upsertErr error
		if policy.Id == "" { // must be a new policy
			policy.Id = uuid.NewUUID().String()
			upsertErr = s.Manager.Create(ProtoToLadonPolicy(policy))
		} else { // maybe new or update
			if p, _ := s.Manager.Get(policy.Id); p != nil {
				upsertErr = s.Manager.Update(ProtoToLadonPolicy(policy))
			} else {
				upsertErr = s.Manager.Create(ProtoToLadonPolicy(policy))
			}
		}
		if upsertErr != nil {
			log.Logger(ctx).Error("Ladon Upsert Error", zap.Error(upsertErr))
			return group, upsertErr
		}
	}

	// Insert Policy Group
	now := int32(time.Now().Unix())
	_, err := s.GetStmt("upsertPolicyGroup").Exec(
		group.Uuid, group.Name, group.Description, group.OwnerUuid, group.ResourceGroup, now, // INSERT
		group.Name, group.Description, group.OwnerUuid, group.ResourceGroup, now, // UPDATE
	)
	if err != nil {
		log.Logger(ctx).Error("Policy GroupUpsert Error", zap.Error(err))
	}

	// Now recreate relations
	for _, policy := range group.Policies {
		if _, err := s.GetStmt("insertRelPolicy").Exec(group.Uuid, policy.Id); err != nil {
			log.Logger(ctx).Error("Error while inserting relation", zap.Error(err))
		}
	}

	return group, err

}

func (s *sqlimpl) ListPolicyGroups(ctx context.Context) (groups []*idm.PolicyGroup, e error) {

	res, err := s.GetStmt("listJoined").Query()
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
			policyGroup.Policies = append(policyGroup.Policies, LadonToProtoPolicy(policy))
		}
		policyGroup.ResourceGroup = idm.PolicyResourceGroup(resourceGroup)
		result[policyGroup.Uuid] = policyGroup
	}
	for _, group := range result {
		groups = append(groups, group)
	}
	return
}

func (s *sqlimpl) DeletePolicyGroup(ctx context.Context, group *idm.PolicyGroup) error {

	var policies []string
	if res, err := s.GetStmt("listRelPolicies").Query(group.Uuid); err == nil {
		defer res.Close()
		for res.Next() {
			var pId string
			res.Scan(&pId)
			policies = append(policies, pId)
		}
	}

	if _, err := s.GetStmt("deleteRelPolicies").Exec(group.Uuid); err != nil {
		return err
	}

	if _, err := s.GetStmt("deletePolicyGroup").Exec(group.Uuid); err != nil {
		return err
	}

	for _, policyId := range policies {
		if err := s.Delete(policyId); err != nil {
			log.Logger(ctx).Error("Cannot delete policy", zap.String("policyId", policyId), zap.Error(err))
		}
	}

	return nil
}
