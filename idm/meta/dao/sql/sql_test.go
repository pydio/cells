//go:build storage || sql

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
	"fmt"
	"io"
	"testing"

	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common/proto/idm"
	service "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/common/telemetry/log"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/uuid"
	"github.com/pydio/cells/v5/idm/meta"

	_ "github.com/pydio/cells/v5/common/utils/cache/gocache"

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

			_, err := mockDAO.AddPolicies(ctx, false, "resource-id", []*service.ResourcePolicy{{Action: service.ResourcePolicyAction_READ, Subject: "subject1"}})
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

			_, err := mockDAO.AddPolicies(ctx, false, "resource-id", []*service.ResourcePolicy{
				{Action: service.ResourcePolicyAction_READ, Subject: "subject1"},
				{Action: service.ResourcePolicyAction_WRITE, Subject: "subject1"},
			})
			So(err, ShouldBeNil)

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

func TestSearchWithTagCloudEntityValues(t *testing.T) {

	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[meta.DAO](ctx)
		if err != nil {
			panic(err)
		}
		sqlDAO := mockDAO.(*sqlimpl)
		evDAO := sqlDAO.entityValueDAO
		entityDAO := sqlDAO.entityDAO
		nsDAO := sqlDAO.nsDAO

		Convey("Search Returns Entity Values for Tag Cloud Namespace", t, func() {
			// Create an entity and values
			entity, err := entityDAO.CreateEntity(ctx, &idm.MetaEntity{
				Label:       "Tags",
				Description: "Tag entity for tag cloud",
			})
			So(err, ShouldBeNil)

			tag1, err := evDAO.CreateEntityValue(ctx, &idm.EntityValue{
				Label:      "important",
				EntityUuid: entity.Uuid,
			})
			So(err, ShouldBeNil)

			tag2, err := evDAO.CreateEntityValue(ctx, &idm.EntityValue{
				Label:      "urgent",
				EntityUuid: entity.Uuid,
			})
			So(err, ShouldBeNil)

			// Create a tag_cloud namespace
			nsKey := "usermeta-tagcloud"
			jsonDef := fmt.Sprintf(`{"type":"tag_cloud","entity":{"entity_id":"%s"},"data":{"entityItems":["important","urgent"]}}`, entity.Uuid)
			err, _ = nsDAO.Upsert(ctx, &idm.UserMetaNamespace{
				Namespace:      nsKey,
				Label:          "Tags",
				FieldType:      "tag_cloud",
				JsonDefinition: jsonDef,
				Policies: []*service.ResourcePolicy{
					{Subject: "*", Action: service.ResourcePolicyAction_READ},
				},
			})
			So(err, ShouldBeNil)

			// Create a meta and link entity values
			nodeUUID := uuid.New()
			meta, _, err := mockDAO.Set(ctx, &idm.UserMeta{
				NodeUuid:  nodeUUID,
				Namespace: nsKey,
				JsonValue: "[]",
				Policies: []*service.ResourcePolicy{
					{Subject: "*", Action: service.ResourcePolicyAction_READ},
				},
			})
			So(err, ShouldBeNil)

			linked, err := evDAO.LinkMetaValue(ctx, meta.Uuid, tag1.Uuid)
			So(err, ShouldBeNil)
			So(linked, ShouldBeTrue)

			linked, err = evDAO.LinkMetaValue(ctx, meta.Uuid, tag2.Uuid)
			So(err, ShouldBeNil)
			So(linked, ShouldBeTrue)

			// Search and verify entity values are returned as JSON array
			subQ, _ := anypb.New(&idm.SearchUserMetaRequest{
				NodeUuids: []string{nodeUUID},
			})
			query := &service.Query{
				SubQueries: []*anypb.Any{subQ},
			}

			results, err := mockDAO.Search(ctx, query)
			So(err, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

			var jsonArray []string
			err = json.Unmarshal([]byte(results[0].JsonValue), &jsonArray)
			So(err, ShouldBeNil)
			So(jsonArray, ShouldHaveLength, 2)
			So(jsonArray, ShouldContain, "important")
			So(jsonArray, ShouldContain, "urgent")
		})

		Convey("Search Returns Original Value When No Entity Values Linked", t, func() {
			// Create entity and namespace
			entity, err := entityDAO.CreateEntity(ctx, &idm.MetaEntity{
				Label: "Status",
			})
			So(err, ShouldBeNil)

			nsKey := "usermeta-status"
			jsonDef := fmt.Sprintf(`{"type":"tag_cloud","entity":{"entity_id":"%s"},"data":{"entityItems":[]}}`, entity.Uuid)
			err, _ = nsDAO.Upsert(ctx, &idm.UserMetaNamespace{
				Namespace:      nsKey,
				Label:          "Status",
				FieldType:      "tag_cloud",
				JsonDefinition: jsonDef,
				Policies: []*service.ResourcePolicy{
					{Subject: "*", Action: service.ResourcePolicyAction_READ},
				},
			})
			So(err, ShouldBeNil)

			// Create meta without linking any entity values
			nodeUUID := uuid.New()
			_, _, err = mockDAO.Set(ctx, &idm.UserMeta{
				NodeUuid:  nodeUUID,
				Namespace: nsKey,
				JsonValue: "[]",
				Policies: []*service.ResourcePolicy{
					{Subject: "*", Action: service.ResourcePolicyAction_READ},
				},
			})
			So(err, ShouldBeNil)

			// Search and verify original value is unchanged
			subQ, _ := anypb.New(&idm.SearchUserMetaRequest{
				NodeUuids: []string{nodeUUID},
			})
			query := &service.Query{
				SubQueries: []*anypb.Any{subQ},
			}

			results, err := mockDAO.Search(ctx, query)
			So(err, ShouldBeNil)
			So(results, ShouldHaveLength, 1)
			So(results[0].JsonValue, ShouldEqual, "[]")
		})

		Convey("Search Handles Mixed Namespace Types", t, func() {
			// Create tag_cloud namespace with entity values
			entity, err := entityDAO.CreateEntity(ctx, &idm.MetaEntity{
				Label: "Tags",
			})
			So(err, ShouldBeNil)

			tag1, err := evDAO.CreateEntityValue(ctx, &idm.EntityValue{
				Label:      "featured",
				EntityUuid: entity.Uuid,
			})
			So(err, ShouldBeNil)

			nsKeyTags := "usermeta-tags-test"
			jsonDefTags := fmt.Sprintf(`{"type":"tag_cloud","entity":{"entity_id":"%s"},"data":{"entityItems":["featured"]}}`, entity.Uuid)
			err, _ = nsDAO.Upsert(ctx, &idm.UserMetaNamespace{
				Namespace:      nsKeyTags,
				Label:          "Tags",
				FieldType:      "tag_cloud",
				JsonDefinition: jsonDefTags,
				Policies: []*service.ResourcePolicy{
					{Subject: "*", Action: service.ResourcePolicyAction_READ},
				},
			})
			So(err, ShouldBeNil)

			// Create string namespace
			nsKeyTitle := "usermeta-title-test"
			err, _ = nsDAO.Upsert(ctx, &idm.UserMetaNamespace{
				Namespace:      nsKeyTitle,
				Label:          "Title",
				FieldType:      "string",
				JsonDefinition: `{"type":"string"}`,
				Policies: []*service.ResourcePolicy{
					{Subject: "*", Action: service.ResourcePolicyAction_READ},
				},
			})
			So(err, ShouldBeNil)

			// Create node with both meta types
			nodeUUID := uuid.New()
			metaTags, _, err := mockDAO.Set(ctx, &idm.UserMeta{
				NodeUuid:  nodeUUID,
				Namespace: nsKeyTags,
				JsonValue: "[]",
				Policies: []*service.ResourcePolicy{
					{Subject: "*", Action: service.ResourcePolicyAction_READ},
				},
			})
			So(err, ShouldBeNil)

			linked, err := evDAO.LinkMetaValue(ctx, metaTags.Uuid, tag1.Uuid)
			So(err, ShouldBeNil)
			So(linked, ShouldBeTrue)

			_, _, err = mockDAO.Set(ctx, &idm.UserMeta{
				NodeUuid:  nodeUUID,
				Namespace: nsKeyTitle,
				JsonValue: `"My Document"`,
				Policies: []*service.ResourcePolicy{
					{Subject: "*", Action: service.ResourcePolicyAction_READ},
				},
			})
			So(err, ShouldBeNil)

			// Search and verify both types return correctly
			subQ, _ := anypb.New(&idm.SearchUserMetaRequest{
				NodeUuids: []string{nodeUUID},
			})
			query := &service.Query{
				SubQueries: []*anypb.Any{subQ},
			}

			results, err := mockDAO.Search(ctx, query)
			So(err, ShouldBeNil)
			So(results, ShouldHaveLength, 2)

			resultsByNamespace := make(map[string]*idm.UserMeta)
			for _, r := range results {
				resultsByNamespace[r.Namespace] = r
			}

			// Verify tag_cloud returns entity values
			So(resultsByNamespace[nsKeyTags].JsonValue, ShouldContainSubstring, "featured")
			// Verify string returns original value
			So(resultsByNamespace[nsKeyTitle].JsonValue, ShouldEqual, `"My Document"`)
		})
	})
}

func TestSet(t *testing.T) {

	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[meta.DAO](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Set creates a new meta and returns an assigned UUID with no prev value", t, func() {
			m, prev, err := mockDAO.Set(ctx, &idm.UserMeta{
				NodeUuid:  "set-node-1",
				Namespace: "set-ns",
				JsonValue: `"first"`,
				Policies: []*service.ResourcePolicy{
					{Subject: "user:alice", Action: service.ResourcePolicyAction_OWNER, Effect: service.ResourcePolicy_allow},
				},
			})
			So(err, ShouldBeNil)
			So(m.Uuid, ShouldNotBeEmpty)
			So(prev, ShouldBeEmpty) // no previous value on first create
		})

		Convey("Set on existing node/namespace/owner updates data, preserves UUID, and returns prev value", t, func() {
			// First call – create
			created, _, err := mockDAO.Set(ctx, &idm.UserMeta{
				NodeUuid:  "set-node-2",
				Namespace: "set-ns",
				JsonValue: `"original"`,
				Policies: []*service.ResourcePolicy{
					{Subject: "user:bob", Action: service.ResourcePolicyAction_OWNER, Effect: service.ResourcePolicy_allow},
				},
			})
			So(err, ShouldBeNil)
			So(created.Uuid, ShouldNotBeEmpty)

			// Second call – update same owner/node/namespace
			updated, prev, err := mockDAO.Set(ctx, &idm.UserMeta{
				NodeUuid:  "set-node-2",
				Namespace: "set-ns",
				JsonValue: `"updated"`,
				Policies: []*service.ResourcePolicy{
					{Subject: "user:bob", Action: service.ResourcePolicyAction_OWNER, Effect: service.ResourcePolicy_allow},
				},
			})
			So(err, ShouldBeNil)
			So(updated.Uuid, ShouldEqual, created.Uuid)  // UUID must be stable across updates
			So(prev, ShouldContainSubstring, "original") // prev must reflect the old stored value

			// Verify exactly one record exists for this owner/node/namespace
			subQ, _ := anypb.New(&idm.SearchUserMetaRequest{
				NodeUuids:            []string{"set-node-2"},
				ResourceSubjectOwner: "user:bob",
			})
			query := &service.Query{SubQueries: []*anypb.Any{subQ}}
			results, er := mockDAO.Search(ctx, query)
			So(er, ShouldBeNil)
			So(results, ShouldHaveLength, 1)
			So(results[0].JsonValue, ShouldEqual, `"updated"`)
		})

		Convey("Set with different owners on same node/namespace creates distinct records", t, func() {
			_, _, err := mockDAO.Set(ctx, &idm.UserMeta{
				NodeUuid:  "set-node-3",
				Namespace: "set-ns",
				JsonValue: `"alice-value"`,
				Policies: []*service.ResourcePolicy{
					{Subject: "user:alice", Action: service.ResourcePolicyAction_OWNER, Effect: service.ResourcePolicy_allow},
				},
			})
			So(err, ShouldBeNil)

			_, _, err = mockDAO.Set(ctx, &idm.UserMeta{
				NodeUuid:  "set-node-3",
				Namespace: "set-ns",
				JsonValue: `"bob-value"`,
				Policies: []*service.ResourcePolicy{
					{Subject: "user:bob", Action: service.ResourcePolicyAction_OWNER, Effect: service.ResourcePolicy_allow},
				},
			})
			So(err, ShouldBeNil)

			subQ, _ := anypb.New(&idm.SearchUserMetaRequest{
				NodeUuids: []string{"set-node-3"},
			})
			query := &service.Query{SubQueries: []*anypb.Any{subQ}}
			results, er := mockDAO.Search(ctx, query)
			So(er, ShouldBeNil)
			So(results, ShouldHaveLength, 2) // one per owner
		})

		Convey("Set attaches policies on create and update path", t, func() {
			// Create – policies must be returned
			m, _, err := mockDAO.Set(ctx, &idm.UserMeta{
				NodeUuid:  "set-node-4",
				Namespace: "set-ns",
				JsonValue: `"v1"`,
				Policies: []*service.ResourcePolicy{
					{Subject: "user:carol", Action: service.ResourcePolicyAction_OWNER, Effect: service.ResourcePolicy_allow},
					{Subject: "user:carol", Action: service.ResourcePolicyAction_READ, Effect: service.ResourcePolicy_allow},
				},
			})
			So(err, ShouldBeNil)
			So(m.Policies, ShouldHaveLength, 2)

			// Update – UUID stable, policies still present
			m2, _, err := mockDAO.Set(ctx, &idm.UserMeta{
				NodeUuid:  "set-node-4",
				Namespace: "set-ns",
				JsonValue: `"v2"`,
				Policies: []*service.ResourcePolicy{
					{Subject: "user:carol", Action: service.ResourcePolicyAction_OWNER, Effect: service.ResourcePolicy_allow},
					{Subject: "user:carol", Action: service.ResourcePolicyAction_READ, Effect: service.ResourcePolicy_allow},
				},
			})
			So(err, ShouldBeNil)
			So(m2.Uuid, ShouldEqual, m.Uuid)
			So(m2.Policies, ShouldHaveLength, 2)
		})
	})
}
