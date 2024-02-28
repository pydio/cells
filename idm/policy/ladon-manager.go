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

package policy

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/json"
	"fmt"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"sort"
	"strings"
	"sync"

	"github.com/ory/ladon"
	"github.com/ory/ladon/compiler"
)

var _ ladon.Manager = (*manager)(nil)
var _ ladon.Manager = (*managerWithContext)(nil)

type Manager interface {
	WithContext(ctx context.Context) ladon.Manager
	ladon.Manager
}

// Manager is a gorm implementation for Manager to store policies persistently.
type manager struct {
	db   *gorm.DB
	once *sync.Once
}

type managerWithContext struct {
	*manager
	ctx context.Context
}

type Policy struct {
	ID          string     `gorm:"column:id;primaryKey;"`
	Description string     `gorm:"column:description;"`
	Effect      string     `gorm:"column:effect;"`
	Conditions  string     `gorm:"column:conditions;"`
	Actions     []Action   `gorm:"many2many:policy_action_rel;foreignKey:ID;joinForeignKey:Policy;References:ID;joinReferences:Action;"`
	Resources   []Resource `gorm:"many2many:policy_resource_rel;foreignKey:ID;joinForeignKey:Policy;References:ID;joinReferences:Resource;"`
	Subjects    []Subject  `gorm:"many2many:policy_subject_rel;foreignKey:ID;joinForeignKey:Policy;References:ID;joinReferences:Subject;"`
}

type Resource struct {
	ID       string `gorm:"column:id; primaryKey"`
	HasRegex bool   `gorm:"column:has_regex;"`
	Compiled string `gorm:"column:compiled; unique"`
	Template string `gorm:"column:template; unique"`
}

type Subject struct {
	ID       string `gorm:"column:id; primaryKey"`
	HasRegex bool   `gorm:"column:has_regex;"`
	Compiled string `gorm:"column:compiled; unique"`
	Template string `gorm:"column:template; unique"`
}

type Action struct {
	ID       string `gorm:"column:id; primaryKey"`
	HasRegex bool   `gorm:"column:has_regex;"`
	Compiled string `gorm:"column:compiled; unique"`
	Template string `gorm:"column:template; unique"`
}

type PolicyResourceRel struct {
	Policy   string `gorm:"column:policy; primaryKey"`
	Resource string `gorm:"column:resource; primaryKey"`
}

type PolicySubjectRel struct {
	Policy  string `gorm:"column:policy; primaryKey"`
	Subject string `gorm:"column:subject; primaryKey"`
}

type PolicyActionRel struct {
	Policy string `gorm:"column:policy; primaryKey"`
	Action string `gorm:"column:action; primaryKey"`
}

func (u *Policy) As(res *ladon.DefaultPolicy) *ladon.DefaultPolicy {
	res.ID = u.ID
	res.Description = u.Description
	res.Effect = u.Effect
	res.Conditions = ladon.Conditions{}

	if err := json.Unmarshal([]byte(u.Conditions), &res.Conditions); err != nil {
		return nil
	}

	res.Actions = []string{}
	for _, action := range u.Actions {
		res.Actions = append(res.Actions, action.Template)
	}
	res.Subjects = []string{}
	for _, subject := range u.Subjects {
		res.Subjects = append(res.Subjects, subject.Template)
	}
	res.Resources = []string{}
	for _, resource := range u.Resources {
		res.Resources = append(res.Resources, resource.Template)
	}

	sort.Strings(res.Actions)
	sort.Strings(res.Subjects)
	sort.Strings(res.Resources)

	return res
}

func (u *Policy) From(res ladon.Policy) *Policy {
	u.ID = res.GetID()
	u.Description = res.GetDescription()
	u.Effect = res.GetEffect()
	if b, err := json.Marshal(res.GetConditions()); err == nil {
		u.Conditions = string(b)
	}

	for _, template := range res.GetActions() {
		h := sha256.New()
		h.Write([]byte(template))
		id := fmt.Sprintf("%x", h.Sum(nil))

		compiled, err := compiler.CompileRegex(template, res.GetStartDelimiter(), res.GetEndDelimiter())
		if err != nil {
			return nil
		}

		u.Actions = append(u.Actions, Action{
			ID:       id,
			Template: template,
			HasRegex: strings.Index(template, string(res.GetStartDelimiter())) >= -1,
			Compiled: compiled.String(),
		})
	}

	for _, template := range res.GetResources() {
		h := sha256.New()
		h.Write([]byte(template))
		id := fmt.Sprintf("%x", h.Sum(nil))

		compiled, err := compiler.CompileRegex(template, res.GetStartDelimiter(), res.GetEndDelimiter())
		if err != nil {
			return nil
		}

		u.Resources = append(u.Resources, Resource{
			ID:       id,
			Template: template,
			HasRegex: strings.Index(template, string(res.GetStartDelimiter())) >= -1,
			Compiled: compiled.String(),
		})
	}

	for _, template := range res.GetSubjects() {
		h := sha256.New()
		h.Write([]byte(template))
		id := fmt.Sprintf("%x", h.Sum(nil))

		compiled, err := compiler.CompileRegex(template, res.GetStartDelimiter(), res.GetEndDelimiter())
		if err != nil {
			return nil
		}

		u.Subjects = append(u.Subjects, Subject{
			ID:       id,
			Template: template,
			HasRegex: strings.Index(template, string(res.GetStartDelimiter())) >= -1,
			Compiled: compiled.String(),
		})
	}

	return u
}

// NewManager initializes a new SQLManager for given db instance.
func NewManager(db *gorm.DB) Manager {
	m := &manager{
		db: db,
	}

	return m
}

func (m *manager) WithContext(ctx context.Context) ladon.Manager {
	return &managerWithContext{
		manager: m,
		ctx:     ctx,
	}
}

func (m *manager) Create(policy ladon.Policy) error {
	panic("manager should be be called without context")
}

func (m *manager) Update(policy ladon.Policy) error {
	panic("manager should be be called without context")
}

func (m *manager) Get(id string) (ladon.Policy, error) {
	panic("manager should be be called without context")
}

func (m *manager) Delete(id string) error {
	panic("manager should be be called without context")
}

func (m *manager) GetAll(limit, offset int64) (ladon.Policies, error) {
	panic("manager should be be called without context")
}

func (m *manager) FindRequestCandidates(r *ladon.Request) (ladon.Policies, error) {
	panic("manager should be be called without context")
}

func (m *manager) FindPoliciesForSubject(subject string) (ladon.Policies, error) {
	panic("manager should be be called without context")
}

func (m *manager) FindPoliciesForResource(resource string) (ladon.Policies, error) {
	panic("manager should be be called without context")
}

func (s *managerWithContext) instance(ctx context.Context) *gorm.DB {
	if s.once == nil {
		s.once = &sync.Once{}
	}

	db := s.db.Session(&gorm.Session{SkipDefaultTransaction: true}).WithContext(ctx)

	s.once.Do(func() {
		db.SetupJoinTable(&Policy{}, "Subjects", &PolicySubjectRel{})
		db.SetupJoinTable(&Policy{}, "Resources", &PolicyResourceRel{})
		db.SetupJoinTable(&Policy{}, "Actions", &PolicyActionRel{})

		db.AutoMigrate(&Resource{}, &Action{}, &Subject{}, &Policy{})
	})

	return db
}

// Create inserts a new policy
func (s *managerWithContext) Create(policy ladon.Policy) (err error) {
	tx := s.instance(s.ctx).Clauses(clause.OnConflict{DoNothing: true}).Create((&Policy{}).From(policy))
	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

// Update updates an existing policy.
func (s *managerWithContext) Update(policy ladon.Policy) error {
	tx := s.instance(s.ctx).Updates((&Policy{}).From(policy))
	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (s *managerWithContext) FindRequestCandidates(r *ladon.Request) (ladon.Policies, error) {
	var policies []Policy

	db := s.instance(s.ctx)

	query1 := db.Model(&PolicySubjectRel{}).Select("policy as rel_policy_id, subject as rel_subject_id")
	query2 := db.Model(&Subject{}).Select("id as subject_id, has_regex as subject_regex, template as subject_template, compiled as subject_compiled")
	tx := db.Model(&Policy{}).
		Preload("Actions").Preload("Resources").Preload("Subjects").
		InnerJoins("inner join(?) q1 on id = q1.rel_policy_id", query1).
		InnerJoins("inner join(?) q2 on q1.rel_subject_id = q2.subject_id", query2).
		Where("q2.subject_regex = false and q2.subject_template = ?", r.Subject).
		Or("q2.subject_regex = true and REGEXP_LIKE(?, q2.subject_compiled)", r.Subject).
		Find(&policies)

	if tx.Error != nil {
		return nil, tx.Error
	}

	var res ladon.Policies
	for _, policy := range policies {
		res = append(res, policy.As(&ladon.DefaultPolicy{}))
	}

	return res, nil
}

func (s *managerWithContext) FindPoliciesForResource(resource string) (ladon.Policies, error) {
	return nil, fmt.Errorf("FindPoliciesForResource not implemented inside common/sql/ladon-manager/SQLManager as Ladon manager interface")
}

func (s *managerWithContext) FindPoliciesForSubject(subject string) (ladon.Policies, error) {
	return nil, fmt.Errorf("FindPoliciesForSubject not implemented inside common/sql/ladon-manager/SQLManager as Ladon manager interface")
}

// GetAll returns all policies
func (s *managerWithContext) GetAll(limit, offset int64) (ladon.Policies, error) {
	var policies []Policy
	tx := s.instance(s.ctx).
		Preload("Actions").Preload("Resources").Preload("Subjects").
		Limit(int(limit)).Offset(int(offset)).Find(&policies)

	if tx.Error != nil {
		return nil, tx.Error
	}

	var res ladon.Policies
	for _, policy := range policies {
		res = append(res, policy.As(&ladon.DefaultPolicy{}))
	}

	return res, nil
}

// Get retrieves a policy.
func (s *managerWithContext) Get(id string) (ladon.Policy, error) {
	var policy Policy
	tx := s.instance(s.ctx).Preload("Actions").Preload("Resources").Preload("Subjects").Where(&Policy{ID: id}).Find(&policy)

	if tx.Error != nil {
		return nil, tx.Error
	}

	if tx.RowsAffected == 0 {
		return nil, ladon.NewErrResourceNotFound(sql.ErrNoRows)
	}

	return policy.As(&ladon.DefaultPolicy{}), nil
}

// Delete removes a policy.
func (s *managerWithContext) Delete(id string) error {
	tx := s.instance(s.ctx).Where(&Policy{ID: id}).Delete(&Policy{})

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}
