//go:build sql || storage

/*
 * Copyright (c) 2026. Abstrium SAS <team (at) pydio.com>
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
	stdErrors "errors"
	"testing"

	"github.com/ory/ladon"
	. "github.com/smartystreets/goconvey/convey"
	"gorm.io/gorm"

	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/runtime/manager"
	storagesql "github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/idm/policy"
	policycache "github.com/pydio/cells/v5/idm/policy/cache"
)

func TestCandidateCompleteTemplates(t *testing.T) {
	test.RunStorageTests(test.TemplateSQL(NewDAO), t, func(ctx context.Context) {
		Convey("candidate hydration preserves every template without Cartesian rows", t, func() {
			dao, err := manager.Resolve[policy.DAO](ctx)
			So(err, ShouldBeNil)
			_, err = dao.StorePolicyGroup(ctx, &idm.PolicyGroup{Uuid: "complete", Policies: []*idm.Policy{{ID: "complete-p", Effect: idm.PolicyEffect_allow, Subjects: []string{"alice", "bob"}, Resources: []string{"doc:1", "doc:2"}, Actions: []string{"read", "write"}}}})
			So(err, ShouldBeNil)
			got, err := dao.FindRequestCandidates(ctx, &ladon.Request{Subject: "alice", Resource: "doc:1", Action: "read"})
			So(err, ShouldBeNil)
			So(got, ShouldHaveLength, 1)
			So(got[0].GetSubjects(), ShouldResemble, []string{"alice", "bob"})
			So(got[0].GetResources(), ShouldResemble, []string{"doc:1", "doc:2"})
			So(got[0].GetActions(), ShouldResemble, []string{"read", "write"})
		})
	})
}

func TestGroupLookupIsSelective(t *testing.T) {
	test.RunStorageTests(test.TemplateSQL(NewDAO), t, func(ctx context.Context) {
		Convey("REST candidate discovery excludes unrelated conversation groups", t, func() {
			dao, err := manager.Resolve[policy.DAO](ctx)
			So(err, ShouldBeNil)
			for _, resource := range []string{"acl", "rest:<.*>"} {
				_, err = dao.StorePolicyGroup(ctx, &idm.PolicyGroup{Uuid: resource, Policies: []*idm.Policy{{ID: resource, Subjects: []string{"alice"}, Resources: []string{resource}, Actions: []string{"POST"}}}})
				So(err, ShouldBeNil)
			}
			src, ok := dao.(policycache.Source)
			So(ok, ShouldBeTrue)
			if !ok {
				return
			}
			ids, err := src.FindPolicyGroupIDs(ctx, &ladon.Request{Subject: "alice", Resource: "rest:/v2/n/nodes", Action: "POST"})
			So(err, ShouldBeNil)
			So(ids, ShouldResemble, []string{"rest:<.*>"})
		})
	})
}

func TestReplacementRollback(t *testing.T) {
	test.RunStorageTests(test.TemplateSQL(NewDAO), t, func(ctx context.Context) {
		Convey("failed replacement preserves the previously committed deny", t, func() {
			dao, err := manager.Resolve[policy.DAO](ctx)
			So(err, ShouldBeNil)
			group := &idm.PolicyGroup{Uuid: "atomic", Name: "original", Policies: []*idm.Policy{{ID: "deny", Effect: idm.PolicyEffect_deny, Subjects: []string{"alice"}, Resources: []string{"acl"}, Actions: []string{"read"}}}}
			_, err = dao.StorePolicyGroup(ctx, group)
			So(err, ShouldBeNil)
			impl := dao.(*sqlimpl)
			want := stdErrors.New("insertion failed")
			table := storagesql.TableNameFromModel(impl.DB, &idm.PolicyGroup{})
			So(impl.DB.Callback().Create().Before("gorm:create").Register("test:replacement", func(tx *gorm.DB) {
				if tx.Statement.Schema != nil && tx.Statement.Schema.Table == table {
					tx.AddError(want)
				}
			}), ShouldBeNil)
			defer func() { So(impl.DB.Callback().Create().Remove("test:replacement"), ShouldBeNil) }()
			group.Name = "replacement"
			_, err = dao.StorePolicyGroup(ctx, group)
			So(stdErrors.Is(err, want), ShouldBeTrue)
			groups, err := dao.ListPolicyGroups(ctx, nil)
			So(err, ShouldBeNil)
			So(groups, ShouldHaveLength, 1)
			So(groups[0].Name, ShouldEqual, "original")
		})
	})
}

func TestStaleMetadataCannotOmitDeny(t *testing.T) {
	test.RunStorageTests(test.TemplateSQL(NewDAO), t, func(ctx context.Context) {
		Convey("stale persisted compilation metadata cannot filter out a deny", t, func() {
			dao, err := manager.Resolve[policy.DAO](ctx)
			So(err, ShouldBeNil)
			_, err = dao.StorePolicyGroup(ctx, &idm.PolicyGroup{Uuid: "legacy", Policies: []*idm.Policy{{ID: "legacy-deny", Subjects: []string{"alice"}, Resources: []string{"doc:<.*>"}, Actions: []string{"read"}, Effect: idm.PolicyEffect_deny}}})
			So(err, ShouldBeNil)
			update := dao.(*sqlimpl).DB.Model(&idm.PolicyResource{}).Where("template = ?", "doc:<.*>").Updates(map[string]interface{}{"has_regex": false, "compiled": "^not-the-request$"})
			So(update.Error, ShouldBeNil)
			So(update.RowsAffected, ShouldEqual, 1)
			engine := &ladon.Ladon{Manager: dao, Metric: ladon.DefaultMetric}
			err = engine.IsAllowed(ctx, &ladon.Request{Subject: "alice", Resource: "doc:secret", Action: "read"})
			So(stdErrors.Is(err, ladon.ErrRequestForcefullyDenied), ShouldBeTrue)
		})
	})
}

func TestReplacementUsesCurrentPublicTemplates(t *testing.T) {
	test.RunStorageTests(test.TemplateSQL(NewDAO), t, func(ctx context.Context) {
		Convey("round-trip replacement does not retain old ORM subjects", t, func() {
			dao, err := manager.Resolve[policy.DAO](ctx)
			So(err, ShouldBeNil)
			group, err := dao.StorePolicyGroup(ctx, &idm.PolicyGroup{Uuid: "roundtrip", Policies: []*idm.Policy{{ID: "roundtrip-p", Subjects: []string{"alice"}, Resources: []string{"doc"}, Actions: []string{"read"}, Effect: idm.PolicyEffect_allow}}})
			So(err, ShouldBeNil)
			group.Policies[0].Subjects = []string{"bob"}
			_, err = dao.StorePolicyGroup(ctx, group)
			So(err, ShouldBeNil)
			groups, err := dao.ListPolicyGroups(ctx, nil)
			So(err, ShouldBeNil)
			So(groups, ShouldHaveLength, 1)
			So(groups[0].Policies[0].Subjects, ShouldResemble, []string{"bob"})
		})
	})
}
