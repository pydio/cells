//go:build storage

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
	"io"
	"testing"

	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common/proto/idm"
	service "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage/test"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"github.com/pydio/cells/v4/idm/meta"

	_ "github.com/pydio/cells/v4/common/utils/cache/gocache"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = test.TemplateSQL(NewDAO)
)

func init() {
	log.SetLoggerInit(func(_ context.Context) (*zap.Logger, []io.Closer) {
		conf := zap.NewDevelopmentConfig()
		conf.OutputPaths = []string{"stdout"}
		logger, _ := conf.Build()
		return logger, nil
	}, nil)
}

func readableMetaForNode(ctx context.Context, dao meta.DAO, nodeId string) ([]*idm.UserMeta, error) {
	subQA, _ := anypb.New(&idm.SearchUserMetaRequest{
		NodeUuids: []string{nodeId},
	})
	rq, _ := anypb.New(&service.ResourcePolicyQuery{
		Subjects: []string{"sub1"},
		Action:   service.ResourcePolicyAction_READ,
	})
	queryA := &service.Query{
		SubQueries: []*anypb.Any{subQA, rq},
	}
	return dao.Search(ctx, queryA)
}

func TestCrud(t *testing.T) {

	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[meta.DAO](ctx)
		if err != nil {
			panic(err)
		}

		Convey("CRUD Meta on Node", t, func() {
			nodeUUID := uuid.New()
			_, _, err = mockDAO.Set(ctx, &idm.UserMeta{
				NodeUuid:  nodeUUID,
				Namespace: "usermeta-tags",
				JsonValue: "\"test\"",
				Policies: []*service.ResourcePolicy{
					{Subject: "*", Action: service.ResourcePolicyAction_READ},
				},
			})

			mm, er := readableMetaForNode(ctx, mockDAO, nodeUUID)
			So(er, ShouldBeNil)
			So(mm, ShouldHaveLength, 1)
			So(mm[0].JsonValue, ShouldEqual, "\"test\"")

			So(err, ShouldBeNil)
			_, _, err = mockDAO.Set(ctx, &idm.UserMeta{
				NodeUuid:  nodeUUID,
				Namespace: "usermeta-tags",
				JsonValue: "\"test2\"",
				Policies: []*service.ResourcePolicy{
					{Subject: "*", Action: service.ResourcePolicyAction_READ},
				},
			})
			So(err, ShouldBeNil)

			mm, er = readableMetaForNode(ctx, mockDAO, nodeUUID)
			So(er, ShouldBeNil)
			So(mm, ShouldHaveLength, 1)
			So(mm[0].JsonValue, ShouldEqual, "\"test2\"")

		})

		Convey("Create Meta", t, func() {
			// Insert a meta
			metaWithId, _, err := mockDAO.Set(ctx, &idm.UserMeta{
				NodeUuid:  "node-uuid",
				Namespace: "namespace",
				JsonValue: "stringvalue",
				Policies: []*service.ResourcePolicy{
					{Subject: "user:owner", Action: service.ResourcePolicyAction_OWNER},
				},
			})
			So(err, ShouldBeNil)
			So(metaWithId.Uuid, ShouldNotBeEmpty)

			// Insert a similar meta with another user
			_, _, err = mockDAO.Set(ctx, &idm.UserMeta{
				NodeUuid:  "node-uuid",
				Namespace: "namespace",
				JsonValue: "stringvalue",
				Policies: []*service.ResourcePolicy{
					{Subject: "user:owner2", Action: service.ResourcePolicyAction_OWNER},
				},
			})
			So(err, ShouldBeNil)

			// Update the first meta
			_, _, err = mockDAO.Set(ctx, &idm.UserMeta{
				NodeUuid:  "node-uuid",
				Namespace: "namespace",
				JsonValue: "newvalue",
				Policies: []*service.ResourcePolicy{
					{Subject: "user:owner", Action: service.ResourcePolicyAction_OWNER},
				},
			})
			So(err, ShouldBeNil)

			// List meta for the node
			subQA, _ := anypb.New(&idm.SearchUserMetaRequest{
				NodeUuids: []string{"node-uuid"},
			})
			queryA := &service.Query{
				SubQueries: []*anypb.Any{subQA},
			}
			result, er := mockDAO.Search(ctx, queryA)
			So(er, ShouldBeNil)
			So(result, ShouldHaveLength, 2)

			// List meta for the node, restricting by owner
			subQB, _ := anypb.New(&idm.SearchUserMetaRequest{
				NodeUuids:            []string{"node-uuid"},
				ResourceSubjectOwner: "user:owner",
			})
			queryB := &service.Query{
				SubQueries: []*anypb.Any{subQB},
			}
			result, er = mockDAO.Search(ctx, queryB)
			So(er, ShouldBeNil)
			So(result, ShouldHaveLength, 1)

			_, e := mockDAO.Del(ctx, &idm.UserMeta{Uuid: metaWithId.Uuid})
			So(e, ShouldBeNil)

			// List meta for the node
			result, er = mockDAO.Search(ctx, queryA)
			So(er, ShouldBeNil)
			So(result, ShouldHaveLength, 1)
		})

		Convey("Test Meta and Policies", t, func() {

			// Insert a meta
			metaWithId, _, err := mockDAO.Set(ctx, &idm.UserMeta{
				NodeUuid:  "node-policy",
				Namespace: "namespace",
				JsonValue: "stringvalue",
				Policies: []*service.ResourcePolicy{
					{Subject: "user:owner", Action: service.ResourcePolicyAction_OWNER, Effect: service.ResourcePolicy_allow},
					{Subject: "user:owner", Action: service.ResourcePolicyAction_READ, Effect: service.ResourcePolicy_allow},
				},
			})
			So(err, ShouldBeNil)
			So(metaWithId.Uuid, ShouldNotBeEmpty)

			// Insert a similar meta with another user
			otherMeta, _, err := mockDAO.Set(ctx, &idm.UserMeta{
				NodeUuid:  "node-policy",
				Namespace: "namespace",
				JsonValue: "stringvalue",
				Policies: []*service.ResourcePolicy{
					{Subject: "user:owner2", Action: service.ResourcePolicyAction_OWNER, Effect: service.ResourcePolicy_allow},
					{Subject: "user:owner2", Action: service.ResourcePolicyAction_READ, Effect: service.ResourcePolicy_allow},
				},
			})
			So(err, ShouldBeNil)
			So(otherMeta.Uuid, ShouldNotBeEmpty)
			So(otherMeta.Uuid, ShouldNotEqual, metaWithId.Uuid)

			// List meta for the node, restricting by owner
			// List meta for the node
			subQA, _ := anypb.New(&idm.SearchUserMetaRequest{
				Namespace: "namespace",
			})
			subQB, _ := anypb.New(&service.ResourcePolicyQuery{
				Subjects: []string{"user:owner"},
			})
			queryA := &service.Query{
				SubQueries: []*anypb.Any{subQA, subQB},
				Operation:  service.OperationType_AND,
			}

			result, er := mockDAO.Search(ctx, queryA)
			//result, er = mockDAO.Search([]string{}, []string{"node-policy"}, "namespace", "", nil)
			So(er, ShouldBeNil)
			So(result[0].GetPolicies(), ShouldHaveLength, 2)
		})
	})
}

func TestResourceRules(t *testing.T) {

	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[meta.DAO](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Test Add Rule", t, func() {

			err := mockDAO.AddPolicy(ctx, "resource-id", &service.ResourcePolicy{Action: service.ResourcePolicyAction_READ, Subject: "subject1"})
			So(err, ShouldBeNil)

		})

		Convey("Select Rules", t, func() {

			rules, err := mockDAO.GetPoliciesForResource(ctx, "resource-id")
			So(rules, ShouldHaveLength, 1)
			So(err, ShouldBeNil)

		})

		Convey("Delete Rules", t, func() {

			err := mockDAO.DeletePoliciesForResource(ctx, "resource-id")
			So(err, ShouldBeNil)

			rules, err := mockDAO.GetPoliciesForResource(ctx, "resource-id")
			So(rules, ShouldHaveLength, 0)
			So(err, ShouldBeNil)

		})

		Convey("Delete Rules For Action", t, func() {

			mockDAO.AddPolicy(ctx, "resource-id", &service.ResourcePolicy{Action: service.ResourcePolicyAction_READ, Subject: "subject1"})
			mockDAO.AddPolicy(ctx, "resource-id", &service.ResourcePolicy{Action: service.ResourcePolicyAction_WRITE, Subject: "subject1"})

			rules, err := mockDAO.GetPoliciesForResource(ctx, "resource-id")
			So(rules, ShouldHaveLength, 2)

			err = mockDAO.DeletePoliciesForResourceAndAction(ctx, "resource-id", service.ResourcePolicyAction_READ)
			So(err, ShouldBeNil)

			rules, err = mockDAO.GetPoliciesForResource(ctx, "resource-id")
			So(rules, ShouldHaveLength, 1)
			So(err, ShouldBeNil)

		})
	})
}
