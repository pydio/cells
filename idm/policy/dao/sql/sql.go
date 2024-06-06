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
	"strings"
	"sync"
	"time"

	"github.com/ory/ladon"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"github.com/pydio/cells/v4/idm/policy"
)

func init() {
	policy.Drivers.Register(NewDAO)
}

func NewDAO(db *gorm.DB) policy.DAO {
	return &sqlimpl{DB: db, Manager: NewManager(db)}
}

type sqlimpl struct {
	DB *gorm.DB

	Manager

	once *sync.Once
}

var (
/*
	queries = map[string]string{
		"upsertPolicyGroup": `INSERT INTO idm_policy_group (uuid,name,description,owner_uuid,resource_group,last_updated) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=?,description=?,owner_uuid=?,resource_group=?,last_updated=?`,
		"deletePolicyGroup": `DELETE FROM idm_policy_group WHERE uuid=?`,
		"insertRelPolicy":   `INSERT INTO idm_policy_rel (group_uuid,policy_id) VALUES (?,?)`,
		"deleteRelPolicies": `DELETE FROM idm_policy_rel WHERE group_uuid=?`,
		"listJoined":        `SELECT p.GetUUID(),p.name,p.description,p.owner_uuid,p.resource_group,p.last_updated,r.policy_id FROM idm_policy_group as p,idm_policy_rel as r WHERE r.group_uuid=p.GetUUID()`,
		"listJoinedUuid":    `SELECT p.GetUUID(),p.name,p.description,p.owner_uuid,p.resource_group,p.last_updated,r.policy_id FROM idm_policy_group as p,idm_policy_rel as r WHERE r.group_uuid=p.GetUUID() AND p.GetUUID()=?`,
		"listJoinedLike":    `SELECT p.GetUUID(),p.name,p.description,p.owner_uuid,p.resource_group,p.last_updated,r.policy_id FROM idm_policy_group as p,idm_policy_rel as r WHERE r.group_uuid=p.GetUUID() AND (p.name LIKE ? or p.description LIKE ?)`,
		"listJoinedRes":     `SELECT p.GetUUID(),p.name,p.description,p.owner_uuid,p.resource_group,p.last_updated,r.policy_id FROM idm_policy_group as p,idm_policy_rel as r WHERE r.group_uuid=p.GetUUID() AND p.resource_group=?`,
		"listRelPolicies":   `SELECT policy_id FROM idm_policy_rel WHERE group_uuid=?`,
	}
*/
)

//type PolicyGroup struct {
//	UUID          string                  `gorm:"column:uuid;primaryKey"`
//	Name          string                  `gorm:"column:name;type:varchar(500);notNull;"`        // VARCHAR(500) NOT NULL,
//	Description   string                  `gorm:"column:description;type:varchar(500);notNull;"` // VARCHAR(500) NOT NULL,
//	OwnerUUID     string                  `gorm:"column:owner_uuid;type:varchar(500);null;"`     // VARCHAR(255) NULL,
//	ResourceGroup idm.PolicyResourceGroup `gorm:"column:resource_group;type:int;"`               // INT,
//	LastUpdated   int                     `gorm:"column:last_updated;type:int;"`
//	Policies      []Policy                `gorm:"many2many:policy_rel;foreignKey:UUID;joinForeignKey:GroupUUID;References:ID;joinReferences:PolicyID;"`
//}
//
//type PolicyRel struct {
//	ID        int    `gorm:"column:id;primaryKey;type:bigint;notNull;autoIncrement;"` // BIGINT NOT NULL AUTO_INCREMENT,
//	GroupUUID string `gorm:"column:group_uuid;type:varchar(255);notNull;"`            // VARCHAR(255) NOT NULL,
//	PolicyID  string `gorm:"colum:policy_id;type:varchar(255);notNull;"`              //  VARCHAR(255) NOT NULL,
//}

func (s *sqlimpl) instance(ctx context.Context) *gorm.DB {
	if s.once == nil {
		s.once = &sync.Once{}
	}

	db := s.DB.Session(&gorm.Session{SkipDefaultTransaction: true}).WithContext(ctx)

	s.once.Do(func() {
		db.SetupJoinTable(&idm.PolicyGroup{}, "Policies", &idm.PolicyRel{})
		db.SetupJoinTable(&idm.Policy{}, "Actions", &idm.PolicyActionRel{})
		db.SetupJoinTable(&idm.Policy{}, "Resources", &idm.PolicyResourceRel{})
		db.SetupJoinTable(&idm.Policy{}, "Subjects", &idm.PolicySubjectRel{})
		db.AutoMigrate(&idm.PolicyAction{}, &idm.PolicyResource{}, &idm.PolicySubject{}, &idm.Policy{}, &idm.PolicyGroup{})
	})

	return db
}

// StorePolicyGroup first upserts policies (and fail fast) before upserting the passed policy group
// and recreating corresponding relations.
func (s *sqlimpl) StorePolicyGroup(ctx context.Context, group *idm.PolicyGroup) (*idm.PolicyGroup, error) {

	if group.GetUUID() == "" {
		group.UUID = uuid.New()
	} else {
		if err := s.DeletePolicyGroup(ctx, group); err != nil {
			return nil, err
		}
	}

	//var policies []*Policy
	//for _, policy := range group.GetPolicies() {
	//	policies = append(policies, &Policy{
	//		ID:          policy.GetId(),
	//		Description: policy.GetDescription(),
	//		Effect:      policy.GetEffect(),
	//	})
	//}

	// Insert or update Policies first
	/*for _, policy := range group.Policies {
		if policy.GetID() == "" { // must be a new policy
			policy.ID = uuid.New()
			err := s.Manager.WithContext(ctx).Create(converter.ProtoToLadonPolicy(policy))
			if err != nil {
				log.Logger(ctx).Error(fmt.Sprintf("cannot create new ladon policy with description: %s", policy.Description), zap.Error(err))
				return group, err
			}
		} else { // maybe new or update
			p, err := s.Manager.WithContext(ctx).Get(policy.GetID())
			if err != nil && err.Error() != "sql: no rows in result set" {
				log.Logger(ctx).Error(fmt.Sprintf("unable to retrieve policy with id %s", policy.GetID()), zap.Error(err))
				return group, err
			}
			if p != nil {
				err = s.Manager.WithContext(ctx).Update(converter.ProtoToLadonPolicy(policy))
			} else {
				err = s.Manager.WithContext(ctx).Create(converter.ProtoToLadonPolicy(policy))
			}
			if err != nil {
				log.Logger(ctx).Error(fmt.Sprintf("cannot upsert policy with id %s", policy.GetID()), zap.Error(err))
				return group, err
			}
		}
	}*/

	// Insert Policy Group
	s.instance(ctx).Clauses(clause.OnConflict{
		DoUpdates: clause.AssignmentColumns([]string{"name", "description", "owner_uuid", "resource_group", "last_updated"}), // column needed to be updated
	}).Create(&idm.PolicyGroup{
		UUID:          group.GetUUID(),
		Name:          group.Name,
		Description:   group.Description,
		OwnerUUID:     group.GetOwnerUUID(),
		ResourceGroup: group.ResourceGroup,
		LastUpdated:   int32(time.Now().Unix()),
		Policies:      group.Policies,
	})

	return group, nil

}

// ListPolicyGroups searches the db and returns an array of PolicyGroup.
func (s *sqlimpl) ListPolicyGroups(ctx context.Context, filter string) (groups []*idm.PolicyGroup, e error) {

	tx := s.instance(ctx)

	if strings.HasPrefix(filter, "resource_group:") {

		res := strings.TrimPrefix(filter, "resource_group:")
		if resId, ok := idm.PolicyResourceGroup_value[res]; ok {
			tx = tx.Where(&idm.PolicyGroup{ResourceGroup: idm.PolicyResourceGroup(resId)})
		}
	} else if strings.HasPrefix(filter, "uuid:") {
		id := strings.TrimPrefix(filter, "uuid:")

		tx = tx.Where(&idm.PolicyGroup{UUID: id})
	} else if strings.HasPrefix(filter, "like:") {
		like := "%" + strings.TrimPrefix(filter, "like:") + "%"

		tx = tx.Where(clause.Like{Column: "name", Value: like}).Or(clause.Like{Column: "description", Value: like})
	}

	tx = tx.Preload("Policies.Actions").Preload("Policies.Resources").Preload("Policies.Subjects").Preload("Policies").Find(&groups)
	if tx.Error != nil {
		return nil, tx.Error
	}

	//for _, policyGroup := range policyGroups {
	//	var policies []*idm.Policy
	//	for _, policy := range policyGroup.Policies {
	//
	//		p := &idm.Policy{
	//			ID:          policy.GetID(),
	//			Description: policy.Description,
	//			//Subjects:    policy.Subjects,
	//			//Resources:   policy.Resources,
	//			//Actions:     policy.Actions,
	//			//Effect:      policy.Effect,
	//		}
	//
	//		if err := json.Unmarshal([]byte(policy.Conditions), p.Conditions); err != nil {
	//			return nil, err
	//		}
	//
	//		policies = append(policies, p)
	//	}
	//	groups = append(groups, &idm.PolicyGroup{
	//		UUID:          policyGroup.GetUUID(),
	//		OwnerUUID:     policyGroup.GetOwnerUUID(),
	//		Policies:      policies,
	//		ResourceGroup: policyGroup.ResourceGroup,
	//		LastUpdated:   int32(policyGroup.LastUpdated),
	//	})
	//}

	return
}

// DeletePolicyGroup deletes a policy group and all related policies.
func (s *sqlimpl) DeletePolicyGroup(ctx context.Context, group *idm.PolicyGroup) error {

	// TODO - cascade ?
	tx := s.instance(ctx).Where(&idm.PolicyGroup{UUID: group.GetUUID()}).Delete(&idm.PolicyGroup{})
	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

// IsAllowed implements API
func (s *sqlimpl) IsAllowed(ctx context.Context, r *ladon.Request) error {
	mg := NewManager(s.instance(ctx)).WithContext(ctx)
	return (&ladon.Ladon{Manager: mg}).IsAllowed(r)
}
