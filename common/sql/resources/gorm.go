/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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
	"strings"
	"sync"
	"time"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/schema"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/service"
)

// gormImpl implements the SQL interface.
type gormImpl struct {
	*gorm.DB
}

func (s *gormImpl) instance(ctx context.Context) *gorm.DB {
	return s.DB.Session(&gorm.Session{SkipDefaultTransaction: true}).WithContext(ctx)
}

func (s *gormImpl) Migrate(ctx context.Context) error {
	return s.instance(ctx).AutoMigrate(&service.ResourcePolicy{})
}

// AddPolicy persists a policy in the underlying storage
func (s *gormImpl) AddPolicy(ctx context.Context, resourceId string, policy *service.ResourcePolicy) error {

	pol := proto.Clone(policy).(*service.ResourcePolicy)
	pol.Resource = resourceId

	return s.instance(ctx).Clauses(clause.OnConflict{DoNothing: true}).Create(pol).Error
}

// AddPolicies persists a set of policies. If update is true, it replace them by deleting existing ones
func (s *gormImpl) AddPolicies(ctx context.Context, update bool, resourceId string, policies []*service.ResourcePolicy) error {
	return s.instance(ctx).Transaction(func(tx *gorm.DB) error {
		if update {
			if err := tx.Where(&service.ResourcePolicy{Resource: resourceId}).Delete(&service.ResourcePolicy{}).Error; err != nil {
				return err
			}
		}

		for _, policy := range policies {
			pol := proto.Clone(policy).(*service.ResourcePolicy)
			pol.Resource = resourceId
			if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(pol).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

// GetPoliciesForResource finds all policies for a given resource
func (s *gormImpl) GetPoliciesForResource(ctx context.Context, resourceId string) ([]*service.ResourcePolicy, error) {

	var res []*service.ResourcePolicy

	timeout, cancel := context.WithTimeout(context.Background(), 50*time.Second)
	defer cancel()

	if err := s.instance(ctx).WithContext(timeout).Find(&res, &service.ResourcePolicy{Resource: resourceId}).Error; err != nil {
		return nil, err
	}

	return res, nil
}

// DeletePoliciesForResource removes all policies for a given resource
func (s *gormImpl) DeletePoliciesForResource(ctx context.Context, resourceId string) error {

	return s.instance(ctx).Delete(&service.ResourcePolicy{}, &service.ResourcePolicy{Resource: resourceId}).Error
}

// GetPoliciesForSubject finds all policies with a given subject
func (s *gormImpl) GetPoliciesForSubject(ctx context.Context, subject string) ([]*service.ResourcePolicy, error) {
	var res []*service.ResourcePolicy

	timeout, cancel := context.WithTimeout(context.Background(), 50*time.Second)
	defer cancel()

	if err := s.instance(ctx).WithContext(timeout).Find(&res, &service.ResourcePolicy{Subject: subject}).Error; err != nil {
		return nil, err
	}

	return res, nil
}

// ReplacePoliciesSubject set a new subject to all policies with the old subject
func (s *gormImpl) ReplacePoliciesSubject(ctx context.Context, oldSubject, newSubject string) (int, error) {

	timeout, cancel := context.WithTimeout(context.Background(), 50*time.Second)
	defer cancel()

	tx := s.instance(ctx).WithContext(timeout).Where(&service.ResourcePolicy{Subject: oldSubject}).Updates(&service.ResourcePolicy{Subject: newSubject})
	if err := tx.Error; err != nil {
		return 0, err
	}

	return int(tx.RowsAffected), nil

}

// DeletePoliciesBySubject removes all policies for a given resource
func (s *gormImpl) DeletePoliciesBySubject(ctx context.Context, subject string) error {
	return s.instance(ctx).Delete(&service.ResourcePolicy{}, &service.ResourcePolicy{Subject: subject}).Error
}

// DeletePoliciesForResourceAndAction removes policies for a given resource only if they have the corresponding action
func (s *gormImpl) DeletePoliciesForResourceAndAction(ctx context.Context, resourceId string, action service.ResourcePolicyAction) error {
	return s.instance(ctx).Delete(&service.ResourcePolicy{}, &service.ResourcePolicy{Resource: resourceId, Action: action}).Error
}

// BuildPolicyConditionForAction builds an ResourcesSQL condition from claims toward the associated resource table
func (s *gormImpl) BuildPolicyConditionForAction(ctx context.Context, q *service.ResourcePolicyQuery, action service.ResourcePolicyAction) (out any, e error) {

	return nil, errors.WithMessage(errors.StatusNotImplemented, "should use Convert API instead")

	if q == nil || q.Any {
		return nil, nil
	}

	//leftIdentifier := s.LeftIdentifier
	leftIdentifier := ""
	subjects := q.GetSubjects()

	if q.Empty {

		subQuery := s.instance(ctx).Model(&service.ResourcePolicy{}).Select("1").Where(&service.ResourcePolicy{Resource: leftIdentifier, Action: action})
		return s.instance(ctx).Not("EXISTS(?)", subQuery), nil

	} else {

		subQuery := s.DB.Model(&service.ResourcePolicy{}).Select("1").Where(&service.ResourcePolicy{Resource: leftIdentifier, Action: action})
		if len(subjects) > 0 {
			subjectQuery := s.DB
			for _, subject := range subjects {
				subjectQuery = subjectQuery.Or(&service.ResourcePolicy{Subject: subject})
			}
			subQuery = subQuery.Where(subjectQuery)
		}

		return s.instance(ctx).Where("EXISTS(?)", subQuery), nil
	}
}

// Convert a policy query to conditions from claims toward the associated resource table
// TODO - See BuildPolicyConditionForAction
// This ends up doing UUID IN (SELECT) whereas a Left Join is probably faster
func (s *gormImpl) Convert(ctx context.Context, val *anypb.Any, db *gorm.DB) (*gorm.DB, bool, error) {

	q := new(service.ResourcePolicyQuery)
	if err := anypb.UnmarshalTo(val, q, proto.UnmarshalOptions{}); err != nil {
		return db, false, nil
	}
	count := 0
	db = db.Session(&gorm.Session{})

	if q.Empty {
		args := strings.Split(q.LeftIdentifier, ".")

		subQuery := s.instance(ctx).Model(&service.ResourcePolicy{}).Select("resource").Where(clause.Eq{Column: "resource", Value: clause.Column{Table: args[0], Name: args[1]}}).Where(&service.ResourcePolicy{Action: q.Action})
		count++
		db = db.Not("uuid IN(?)", subQuery)
	} else {
		subjects := q.GetSubjects()

		subQuery := s.instance(ctx).Model(&service.ResourcePolicy{}).Select("resource")
		if len(subjects) > 0 {
			subjectQuery := s.instance(ctx)
			for _, subject := range subjects {
				subjectQuery = subjectQuery.Or(&service.ResourcePolicy{Subject: subject})
			}
			args := strings.Split(q.LeftIdentifier, ".")
			subQuery = subQuery.Where(clause.Eq{Column: "resource", Value: clause.Column{Table: args[0], Name: args[1]}}).Where(subjectQuery).Where(&service.ResourcePolicy{Action: q.Action})
		}
		count++
		db = db.Where("uuid IN (?)", subQuery)
	}

	return db, count > 0, nil
}

type QueryBuilder struct {
	DAO
	LeftIdentifier string
}

// PrepareQueryBuilder instantiates a QueryBuilder with a proper LeftIdentifier
func PrepareQueryBuilder(refModel any, refDAO DAO, naming schema.Namer) (*QueryBuilder, error) {
	sch, err := schema.Parse(refModel, &sync.Map{}, naming)
	if err != nil {
		return nil, err
	}
	rqb := new(QueryBuilder)
	rqb.DAO = refDAO
	rqb.LeftIdentifier = sch.Table + "." + sch.PrimaryFields[0].DBName
	return rqb, nil
}

func (r *QueryBuilder) Convert(ctx context.Context, val *anypb.Any, db *gorm.DB) (*gorm.DB, bool, error) { // Adding left identifier to resource policy query
	rq := new(service.ResourcePolicyQuery)
	if err := anypb.UnmarshalTo(val, rq, proto.UnmarshalOptions{}); err != nil {
		return db, false, nil
	}

	rq.LeftIdentifier = r.LeftIdentifier

	if err := anypb.MarshalFrom(val, rq, proto.MarshalOptions{}); err != nil {
		return db, false, err
	}

	return r.DAO.Convert(ctx, val, db)
}
