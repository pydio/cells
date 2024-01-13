/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package resources

import (
	"context"
	"github.com/pydio/cells/v4/common/dao"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"
	"gorm.io/gorm"
	"time"

	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/utils/configx"
)

// ResourcesGORM implements the SQL interface.
type ResourcesGORM struct {
	*gorm.DB

	instance func() *gorm.DB

	LeftIdentifier string
}

func (s *ResourcesGORM) ID() string {
	//TODO implement me
	panic("implement me")
}

func (s *ResourcesGORM) Metadata() map[string]string {
	//TODO implement me
	panic("implement me")
}

func (s *ResourcesGORM) As(i interface{}) bool {
	//TODO implement me
	panic("implement me")
}

func (s *ResourcesGORM) Driver() string {
	//TODO implement me
	panic("implement me")
}

func (s *ResourcesGORM) Dsn() string {
	//TODO implement me
	panic("implement me")
}

func (s *ResourcesGORM) GetConn(ctx context.Context) (dao.Conn, error) {
	//TODO implement me
	panic("implement me")
}

func (s *ResourcesGORM) SetConn(ctx context.Context, conn dao.Conn) {
	//TODO implement me
	panic("implement me")
}

func (s *ResourcesGORM) CloseConn(ctx context.Context) error {
	//TODO implement me
	panic("implement me")
}

func (s *ResourcesGORM) Prefix() string {
	//TODO implement me
	panic("implement me")
}

func (s *ResourcesGORM) LocalAccess() bool {
	//TODO implement me
	panic("implement me")
}

func (s *ResourcesGORM) Stats() map[string]interface{} {
	//TODO implement me
	panic("implement me")
}

// Init performs necessary up migration.
func (s *ResourcesGORM) Init(ctx context.Context, options configx.Values) error {

	s.instance = func() *gorm.DB {
		return s.DB.Session(&gorm.Session{SkipDefaultTransaction: true}).Table("idm_role_policies")
	}

	s.instance().AutoMigrate(&service.ResourcePolicyORM{})

	//c, _ := cache.OpenCache(context.TODO(), runtime.ShortCacheURL("evictionTime", "30s", "cleanWindow", "2m"))
	//s.cache = c

	return nil
}

// AddPolicy persists a policy in the underlying storage
func (s *ResourcesGORM) AddPolicy(resourceId string, policy *service.ResourcePolicy) error {

	// s.cache.Delete(resourceId)

	policy.Resource = resourceId

	return s.instance().Create((*service.ResourcePolicyORM)(policy)).Error
}

// AddPolicies persists a set of policies. If update is true, it replace them by deleting existing ones
func (s *ResourcesGORM) AddPolicies(update bool, resourceId string, policies []*service.ResourcePolicy) error {

	// s.cache.Delete(resourceId)

	return s.instance().Transaction(func(tx *gorm.DB) error {
		if update {
			if err := tx.Where(&service.ResourcePolicyORM{Resource: resourceId}).Delete(&service.ResourcePolicyORM{}).Error; err != nil {
				return err
			}
		}

		for _, policy := range policies {
			policy.Resource = resourceId
			if err := tx.Create((*service.ResourcePolicyORM)(policy)).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

// GetPoliciesForResource finds all policies for a given resource
func (s *ResourcesGORM) GetPoliciesForResource(resourceId string) ([]*service.ResourcePolicy, error) {

	//var rules []*service.ResourcePolicy
	//if s.cache.Get(resourceId, &rules) {
	//	return rules, nil
	//}

	var res []*service.ResourcePolicy

	timeout, cancel := context.WithTimeout(context.Background(), 50*time.Second)
	defer cancel()

	if err := s.instance().WithContext(timeout).Find(&res, &service.ResourcePolicyORM{Resource: resourceId}).Error; err != nil {
		return nil, err
	}

	//s.cache.Set(resourceId, res)

	return res, nil
}

// DeletePoliciesForResource removes all policies for a given resource
func (s *ResourcesGORM) DeletePoliciesForResource(resourceId string) error {

	//s.cache.Delete(resourceId)

	return s.instance().Delete(&service.ResourcePolicyORM{}, &service.ResourcePolicyORM{Resource: resourceId}).Error
}

// DeletePoliciesBySubject removes all policies for a given resource
func (s *ResourcesGORM) DeletePoliciesBySubject(subject string) error {

	// Delete cache items that would contain this subject
	//s.cache.Iterate(func(key string, val interface{}) {
	//	if rules, ok := val.([]*service.ResourcePolicy); ok {
	//		for _, pol := range rules {
	//			if pol.Subject == subject {
	//				s.cache.Delete(key)
	//				break
	//			}
	//		}
	//	}
	//})

	return s.instance().Delete(&service.ResourcePolicyORM{}, &service.ResourcePolicyORM{Subject: subject}).Error
}

// DeletePoliciesForResourceAndAction removes policies for a given resource only if they have the corresponding action
func (s *ResourcesGORM) DeletePoliciesForResourceAndAction(resourceId string, action service.ResourcePolicyAction) error {

	//s.cache.Delete(resourceId)

	return s.instance().Delete(&service.ResourcePolicyORM{}, &service.ResourcePolicyORM{Resource: resourceId, Action: action}).Error

}

// BuildPolicyConditionForAction builds an ResourcesSQL condition from claims toward the associated resource table
func (s *ResourcesGORM) BuildPolicyConditionForAction(q *service.ResourcePolicyQuery, action service.ResourcePolicyAction) (out any, e error) {
	if q == nil || q.Any {
		return nil, nil
	}

	leftIdentifier := s.LeftIdentifier
	subjects := q.GetSubjects()

	if q.Empty {
		subQuery := s.DB.Model(&service.ResourcePolicyORM{}).Select("1").Where(&service.ResourcePolicyORM{Resource: leftIdentifier, Action: action})

		return s.DB.Not("EXISTS(?)", subQuery), nil

	} else {
		subQuery := s.DB.Model(&service.ResourcePolicyORM{}).Select("1").Where(&service.ResourcePolicyORM{Resource: leftIdentifier, Action: action})
		if len(subjects) > 0 {
			subjectQuery := s.DB
			for _, subject := range subjects {
				subjectQuery = subjectQuery.Or(&service.ResourcePolicyORM{Subject: subject})
			}

			subQuery.Where(subjectQuery)
		}

		return s.DB.Where("EXISTS(?)", subQuery), nil
	}

	return
}

// Convert a policy query to conditions from claims toward the associated resource table
func (s *ResourcesGORM) Convert(val *anypb.Any, in any) (out any, ok bool) {
	db, ok := in.(*gorm.DB)
	if !ok {
		return in, false
	}

	q := new(service.ResourcePolicyQuery)
	if err := anypb.UnmarshalTo(val, q, proto.UnmarshalOptions{}); err != nil {
		return in, false
	}

	db = db.Session(&gorm.Session{})

	if q.Empty {
		subQuery := s.instance().Select("resource").Where(&service.ResourcePolicyORM{Action: service.ResourcePolicyAction_ANY})

		db = db.Not("uuid IN(?)", subQuery)
	} else {
		subjects := q.GetSubjects()

		subQuery := s.instance().Select("resource")
		if len(subjects) > 0 {
			subjectQuery := s.instance()
			for i, subject := range subjects {
				if i == 0 {
					subjectQuery = subjectQuery.Where(&service.ResourcePolicyORM{Subject: subject})
				} else {
					subjectQuery = subjectQuery.Or(&service.ResourcePolicyORM{Subject: subject})
				}
			}

			subQuery = subQuery.Where(&service.ResourcePolicyORM{Action: service.ResourcePolicyAction_ANY}).Where(subjectQuery)
		}

		db = db.Where("uuid IN (?)", subQuery)
	}

	out = db
	ok = true

	return
}
