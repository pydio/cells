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

package resources

import (
	"fmt"

	"github.com/gobuffalo/packr"
	migrate "github.com/rubenv/sql-migrate"

	"github.com/pydio/cells/common"
	service "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/sql"
	"gopkg.in/doug-martin/goqu.v4"
)

var (
	queries = map[string]string{
		"AddRuleForResource":              "insert into %%PREFIX%%_policies (resource, action, subject, effect, conditions) values (?, ?, ?, ?, ?)",
		"SelectRulesForResource":          "select * from %%PREFIX%%_policies where resource=?",
		"DeleteRulesForResource":          "delete from %%PREFIX%%_policies where resource=?",
		"DeleteRulesForResourceAndAction": "delete from %%PREFIX%%_policies where resource=? and action=?",
		"DeleteRulesForSubject":           "delete from %%PREFIX%%_policies where subject=?",
	}
)

// Impl of the SQL interface.
type ResourcesSQL struct {
	*sql.Handler

	LeftIdentifier string
}

// Init performs necessary migration.
func (s *ResourcesSQL) Init(options common.ConfigValues) error {

	migrations := &sql.PackrMigrationSource{
		Box:         packr.NewBox("../../../common/sql/resources/migrations"),
		Dir:         "./" + s.Driver(),
		TablePrefix: s.Prefix() + "_policies",
	}
	_, err := sql.ExecMigration(s.DB(), s.Driver(), migrations, migrate.Up, s.Prefix()+"_policies")
	if err != nil {
		return err
	}

	if prepare, ok := options.Get("prepare").(bool); !ok || prepare {
		for key, query := range queries {
			if err := s.Prepare(key, query); err != nil {
				fmt.Println(err)
				return err
			}
		}
	}

	return nil
}

// AddPolicy persists a policy in the underlying storage.
func (s *ResourcesSQL) AddPolicy(resourceId string, policy *service.ResourcePolicy) error {

	prepared := s.GetStmt("AddRuleForResource")
	if prepared == nil {
		return fmt.Errorf("Unknown statement")
	}

	_, err := prepared.Exec(resourceId, policy.Action.String(), policy.Subject, policy.Effect.String(), policy.JsonConditions)
	return err

}

// AddPolicies persists a set of policies. If update is true, it replace them by deleting existing ones.
func (s *ResourcesSQL) AddPolicies(update bool, resourceId string, policies []*service.ResourcePolicy) error {
	if update {
		if err := s.DeletePoliciesForResource(resourceId); err != nil {
			return err
		}
	}
	for _, policy := range policies {
		if err := s.AddPolicy(resourceId, policy); err != nil {
			return err
		}
	}
	return nil
}

// GetPoliciesForResource finds all policies for a given resource
func (s *ResourcesSQL) GetPoliciesForResource(resourceId string) ([]*service.ResourcePolicy, error) {

	var res []*service.ResourcePolicy

	prepared := s.GetStmt("SelectRulesForResource")
	if prepared == nil {
		return nil, fmt.Errorf("Unknown statement")
	}

	rows, err := prepared.Query(resourceId)
	if err != nil {
		return res, err
	}
	defer rows.Close()

	for rows.Next() {
		rule := new(service.ResourcePolicy)
		var actionString string
		var effectString string
		if e := rows.Scan(&rule.Id, &rule.Resource, &actionString, &rule.Subject, &effectString, &rule.JsonConditions); e != nil {
			return res, e
		}
		rule.Action = service.ResourcePolicyAction(service.ResourcePolicyAction_value[actionString])
		rule.Effect = service.ResourcePolicy_PolicyEffect(service.ResourcePolicy_PolicyEffect_value[effectString])
		res = append(res, rule)
	}
	return res, nil
}

// DeletePoliciesForResource removes all policies for a given resource
func (s *ResourcesSQL) DeletePoliciesForResource(resourceId string) error {

	prepared := s.GetStmt("DeleteRulesForResource")
	if prepared == nil {
		return fmt.Errorf("Unknown statement")
	}

	_, err := prepared.Exec(resourceId)
	return err

}

// DeletePoliciesForResource removes all policies for a given resource
func (s *ResourcesSQL) DeletePoliciesBySubject(subject string) error {

	prepared := s.GetStmt("DeleteRulesForSubject")
	if prepared == nil {
		return fmt.Errorf("Unknown statement")
	}

	_, err := prepared.Exec(subject)
	return err

}

// DeletePoliciesForResourceAndAction removes policies for a given resource only if they have the corresponding action
func (s *ResourcesSQL) DeletePoliciesForResourceAndAction(resourceId string, action service.ResourcePolicyAction) error {

	prepared := s.GetStmt("DeleteRulesForResourceAndAction")
	if prepared == nil {
		return fmt.Errorf("Unknown statement")
	}

	_, err := prepared.Exec(resourceId, action.String())
	return err

}

// BuildPolicyConditionForAction builds an ResourcesSQL condition from claims toward the associated resource table
func (s *ResourcesSQL) BuildPolicyConditionForAction(q *service.ResourcePolicyQuery, action service.ResourcePolicyAction) (expr goqu.Expression, e error) {

	if q == nil || q.Any {
		return nil, nil
	}

	leftIdentifier := s.LeftIdentifier
	resourcesTableName := s.Prefix() + "_policies"
	subjects := q.GetSubjects()

	if q.Empty {
		join := goqu.I(resourcesTableName + ".resource").Eq(goqu.I(leftIdentifier))
		actionQ := goqu.I(resourcesTableName + ".action").Eq(action.String())
		str, args, e := goqu.New(s.Driver(), s.DB()).
			From(resourcesTableName).
			Prepared(true).
			Select(goqu.L("1")).
			Where(goqu.And(join, actionQ)).
			ToSql()

		if e != nil {
			return nil, e
		}

		return goqu.L("NOT EXISTS ("+str+")", args...), nil

	} else {

		resSubject := resourcesTableName + ".subject"
		var ors []goqu.Expression
		var ands []goqu.Expression
		if len(subjects) > 0 {
			for _, subject := range subjects {
				ors = append(ors, goqu.I(resSubject).Eq(subject))
			}
			ands = append(ands, goqu.Or(ors...))
		}

		ands = append(ands, goqu.I(resourcesTableName+".resource").Eq(goqu.I(leftIdentifier))) // Join
		ands = append(ands, goqu.I(resourcesTableName+".action").Eq(action.String()))
		str, args, e := goqu.New(s.Driver(), s.DB()).
			From(resourcesTableName).
			Prepared(true).
			Select(goqu.L("1")).
			Where(goqu.And(ands...)).
			ToSql()

		if e != nil {
			return nil, e
		}
		return goqu.L("EXISTS ("+str+")", args...), nil

	}
}
