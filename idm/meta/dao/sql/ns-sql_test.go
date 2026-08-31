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
	"encoding/json"
	"testing"

	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/types/known/structpb"
	"gorm.io/datatypes"

	"github.com/pydio/cells/v5/common/proto/idm"
	service "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/idm/meta"
	"github.com/pydio/cells/v5/idm/meta/json_schema"

	_ "github.com/pydio/cells/v5/common/utils/cache/gocache"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	nsTestcases = test.TemplateSQL(NewNSDAO)
)

func TestNSCrud(t *testing.T) {

	test.RunStorageTests(nsTestcases, t, func(ctx context.Context) {

		Convey("Create Meta Namespace", t, func() {
			mockDAO, er := manager.Resolve[meta.NamespaceDAO](ctx)
			So(er, ShouldBeNil)

			// Only the bookmark namespace is seeded by Migrate.
			initial, er := mockDAO.List(ctx)
			So(er, ShouldBeNil)
			So(initial, ShouldHaveLength, 1)
			_, bookmarkPresent := initial[meta.ReservedNamespaceBookmark]
			So(bookmarkPresent, ShouldBeTrue)

			// Insert returns (error, isUpdate); a fresh key must not be an update.
			err, isUpdate := mockDAO.Upsert(ctx, &idm.UserMetaNamespace{
				Namespace:      "namespace",
				Label:          "label",
				Order:          1,
				JsonDefinition: `{"type":"string"}`,
			})
			So(err, ShouldBeNil)
			So(isUpdate, ShouldBeFalse)

			// List should now contain bookmark + new namespace.
			result, er := mockDAO.List(ctx)
			So(er, ShouldBeNil)
			So(result, ShouldHaveLength, 2)
			So(result["namespace"].Order, ShouldEqual, 1)
			So(result["namespace"].Label, ShouldEqual, "label")

			// JsonDefinition must round-trip cleanly.
			var def map[string]interface{}
			er = json.Unmarshal([]byte(result["namespace"].JsonDefinition), &def)
			So(er, ShouldBeNil)
			So(def["type"], ShouldEqual, "string")

			// Delete and verify the namespace is gone.
			e := mockDAO.Del(ctx, &idm.UserMetaNamespace{Namespace: "namespace", Label: "label"})
			So(e, ShouldBeNil)

			result2, er := mockDAO.List(ctx)
			So(er, ShouldBeNil)
			So(result2, ShouldHaveLength, 1)
			_, gone := result2["namespace"]
			So(gone, ShouldBeFalse)
		})

		Convey("Delete non-existent namespace is a no-op", t, func() {
			mockDAO, er := manager.Resolve[meta.NamespaceDAO](ctx)
			So(er, ShouldBeNil)

			err := mockDAO.Del(ctx, &idm.UserMetaNamespace{Namespace: "does-not-exist"})
			So(err, ShouldBeNil)
		})

		Convey("Upsert twice with same key is idempotent", t, func() {
			mockDAO, er := manager.Resolve[meta.NamespaceDAO](ctx)
			So(er, ShouldBeNil)

			ns := &idm.UserMetaNamespace{
				Namespace:      "namespace-idem",
				Label:          "first",
				JsonDefinition: `{"type":"string"}`,
			}
			err, isUpdate := mockDAO.Upsert(ctx, ns)
			So(err, ShouldBeNil)
			So(isUpdate, ShouldBeFalse)

			ns.Label = "second"
			err, isUpdate = mockDAO.Upsert(ctx, ns)
			So(err, ShouldBeNil)
			So(isUpdate, ShouldBeTrue)

			result, er := mockDAO.List(ctx)
			So(er, ShouldBeNil)
			So(result["namespace-idem"].Label, ShouldEqual, "second")

			So(mockDAO.Del(ctx, ns), ShouldBeNil)
		})
	})

}

func TestNSResourceRules(t *testing.T) {
	test.RunStorageTests(nsTestcases, t, func(ctx context.Context) {
		mockDAO, er := manager.Resolve[meta.NamespaceDAO](ctx)
		if er != nil {
			t.Fatal(er)
		}

		// Each Convey block is fully self-contained: it sets up, asserts, and tears
		// down its own policies so blocks do not share state.

		Convey("Add and retrieve a single policy", t, func() {
			const rid = "resource-add-retrieve"

			_, err := mockDAO.AddPolicies(ctx, false, rid, []*service.ResourcePolicy{
				{Action: service.ResourcePolicyAction_READ, Subject: "subject1"},
			})
			So(err, ShouldBeNil)

			rules, err := mockDAO.GetPoliciesForResource(ctx, rid)
			So(err, ShouldBeNil)
			So(rules, ShouldHaveLength, 1)
			So(rules[0].Action, ShouldEqual, service.ResourcePolicyAction_READ)
			So(rules[0].Subject, ShouldEqual, "subject1")

			So(mockDAO.DeletePoliciesForResource(ctx, rid), ShouldBeNil)
		})

		Convey("Delete all policies for a resource", t, func() {
			const rid = "resource-delete-all"

			_, err := mockDAO.AddPolicies(ctx, false, rid, []*service.ResourcePolicy{
				{Action: service.ResourcePolicyAction_READ, Subject: "subject1"},
				{Action: service.ResourcePolicyAction_WRITE, Subject: "subject1"},
			})
			So(err, ShouldBeNil)

			So(mockDAO.DeletePoliciesForResource(ctx, rid), ShouldBeNil)

			rules, err := mockDAO.GetPoliciesForResource(ctx, rid)
			So(err, ShouldBeNil)
			So(rules, ShouldHaveLength, 0)
		})

		Convey("Delete policies for a specific action only", t, func() {
			const rid = "resource-delete-action"

			_, err := mockDAO.AddPolicies(ctx, false, rid, []*service.ResourcePolicy{
				{Action: service.ResourcePolicyAction_READ, Subject: "subject1"},
				{Action: service.ResourcePolicyAction_WRITE, Subject: "subject1"},
			})
			So(err, ShouldBeNil)

			err = mockDAO.DeletePoliciesForResourceAndAction(ctx, rid, service.ResourcePolicyAction_READ)
			So(err, ShouldBeNil)

			rules, err := mockDAO.GetPoliciesForResource(ctx, rid)
			So(err, ShouldBeNil)
			So(rules, ShouldHaveLength, 1)
			So(rules[0].Action, ShouldEqual, service.ResourcePolicyAction_WRITE)

			So(mockDAO.DeletePoliciesForResource(ctx, rid), ShouldBeNil)
		})
	})
}

func TestNSNewFields(t *testing.T) {

	test.RunStorageTests(nsTestcases, t, func(ctx context.Context) {

		Convey("Create Meta Namespace with new fields", t, func() {
			mockDAO, err := manager.Resolve[meta.NamespaceDAO](ctx)
			So(err, ShouldBeNil)

			initial, err := mockDAO.List(ctx)
			So(err, ShouldBeNil)

			tv := json_schema.LegacyTypeToLabel([]byte(`{"type":"string"}`))
			jsb, err := json_schema.GetJsonSchema(tv, "")
			So(err, ShouldBeNil)
			schemaAsJson := datatypes.JSON(jsb)
			jsStruct, err := json_schema.JsonToProtoStruct(&schemaAsJson)
			So(err, ShouldBeNil)

			in := &idm.UserMetaNamespace{
				Namespace:      "namespace-newfields",
				Label:          "label-newfields",
				Order:          2,
				Indexable:      true,
				JsonDefinition: `{"type":"string"}`,
				JsonSchema:     jsStruct,
				PromptOnUpload: true,
			}

			err, isUpdate := mockDAO.Upsert(ctx, in)
			So(err, ShouldBeNil)
			So(isUpdate, ShouldBeFalse)

			result, err := mockDAO.List(ctx)
			So(err, ShouldBeNil)
			So(result, ShouldHaveLength, len(initial)+1)
			ns, ok := result["namespace-newfields"]
			So(ok, ShouldBeTrue)

			So(ns.Label, ShouldEqual, "label-newfields")
			So(ns.Order, ShouldEqual, 2)
			So(ns.Indexable, ShouldBeTrue)
			So(ns.PromptOnUpload, ShouldBeTrue)
			So(ns.JsonSchema, ShouldNotBeNil)
			// JsonSchema must have a properties field, confirming it was stored intact.
			So(ns.JsonSchema.GetFields()["properties"], ShouldNotBeNil)

			So(mockDAO.Del(ctx, &idm.UserMetaNamespace{Namespace: "namespace-newfields"}), ShouldBeNil)
		})
	})
}

func TestNSDeleteWithJsonSchema(t *testing.T) {
	test.RunStorageTests(nsTestcases, t, func(ctx context.Context) {
		Convey("Delete namespace that has a JsonSchema removes it completely", t, func() {
			mockDAO, err := manager.Resolve[meta.NamespaceDAO](ctx)
			So(err, ShouldBeNil)

			beforeList, err := mockDAO.List(ctx)
			So(err, ShouldBeNil)
			beforeLen := len(beforeList)

			const nsKey = "namespace-delete-jsonschema"

			jsBytes, err := json_schema.GetJsonSchema(json_schema.LegacyTypeToLabel([]byte(`{"type":"string"}`)), "")
			So(err, ShouldBeNil)
			jsAsJSON := datatypes.JSON(jsBytes)
			jsStruct, err := json_schema.JsonToProtoStruct(&jsAsJSON)
			So(err, ShouldBeNil)

			sample := &idm.UserMetaNamespace{
				Namespace:      nsKey,
				Label:          "label-delete-jsonschema",
				JsonDefinition: `{"type":"string"}`,
				JsonSchema:     jsStruct,
			}
			err, isUpdate := mockDAO.Upsert(ctx, sample)
			So(err, ShouldBeNil)
			So(isUpdate, ShouldBeFalse)

			afterAdd, err := mockDAO.List(ctx)
			So(err, ShouldBeNil)
			So(afterAdd, ShouldHaveLength, beforeLen+1)
			_, ok := afterAdd[nsKey]
			So(ok, ShouldBeTrue)
			// Stored entry must carry the schema.
			So(afterAdd[nsKey].JsonSchema, ShouldNotBeNil)

			So(mockDAO.Del(ctx, sample), ShouldBeNil)

			afterDelete, err := mockDAO.List(ctx)
			So(err, ShouldBeNil)
			So(afterDelete, ShouldHaveLength, beforeLen)
			_, ok = afterDelete[nsKey]
			So(ok, ShouldBeFalse)
		})
	})
}

func TestNSAddUpdatesJsonSchema(t *testing.T) {
	test.RunStorageTests(nsTestcases, t, func(ctx context.Context) {
		Convey("Upsert replaces JsonSchema on subsequent calls", t, func() {
			mockDAO, err := manager.Resolve[meta.NamespaceDAO](ctx)
			So(err, ShouldBeNil)

			const nsKey = "namespace-jsonschema-update"

			// Step 1: create with no explicit JsonSchema; the DAO should derive one from JsonDefinition.
			err, isUpdate := mockDAO.Upsert(ctx, &idm.UserMetaNamespace{
				Namespace:      nsKey,
				Label:          "label1",
				Order:          1,
				JsonDefinition: `{"type":"string"}`,
			})
			So(err, ShouldBeNil)
			So(isUpdate, ShouldBeFalse)

			result, err := mockDAO.List(ctx)
			So(err, ShouldBeNil)
			ns, ok := result[nsKey]
			So(ok, ShouldBeTrue)
			So(ns.JsonSchema, ShouldNotBeNil)

			// Step 2: update label + carry the same schema forward.
			err, isUpdate = mockDAO.Upsert(ctx, &idm.UserMetaNamespace{
				Namespace:      nsKey,
				Label:          "label2",
				JsonDefinition: `{"type":"textarea"}`,
				JsonSchema:     ns.JsonSchema,
			})
			So(err, ShouldBeNil)
			So(isUpdate, ShouldBeTrue)

			result2, err := mockDAO.List(ctx)
			So(err, ShouldBeNil)
			ns2, ok := result2[nsKey]
			So(ok, ShouldBeTrue)
			So(ns2.Label, ShouldEqual, "label2")
			So(ns2.JsonSchema, ShouldNotBeNil)

			// Step 3: replace with a structurally different schema.
			newSchemaMap := map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"newField": map[string]interface{}{
						"type": "string",
					},
				},
			}
			newStruct, err := structpb.NewStruct(newSchemaMap)
			So(err, ShouldBeNil)

			err, isUpdate = mockDAO.Upsert(ctx, &idm.UserMetaNamespace{
				Namespace:      nsKey,
				Label:          "label3",
				JsonDefinition: `{"type":"object"}`,
				JsonSchema:     newStruct,
				Order:          1,
			})
			So(err, ShouldBeNil)
			So(isUpdate, ShouldBeTrue)

			nss, err := mockDAO.List(ctx)
			So(err, ShouldBeNil)
			updated, ok := nss[nsKey]
			So(ok, ShouldBeTrue)
			So(updated.Label, ShouldEqual, "label3")
			So(updated.JsonDefinition, ShouldEqual, `{"type":"object"}`)
			So(updated.Order, ShouldEqual, 1)

			// Byte-level comparison of the stored schema.
			expectedBytes, err := protojson.Marshal(newStruct)
			So(err, ShouldBeNil)
			actualBytes, err := protojson.Marshal(updated.JsonSchema)
			So(err, ShouldBeNil)
			So(string(actualBytes), ShouldEqual, string(expectedBytes))

			So(mockDAO.Del(ctx, &idm.UserMetaNamespace{Namespace: nsKey}), ShouldBeNil)
		})
	})
}

func TestNSDescriptionAndEnforceDefault(t *testing.T) {
	test.RunStorageTests(nsTestcases, t, func(ctx context.Context) {
		Convey("Description, FieldType and EnforceDefault are stored and updated correctly", t, func() {
			mockDAO, err := manager.Resolve[meta.NamespaceDAO](ctx)
			So(err, ShouldBeNil)

			const nsKey = "usermeta-desc-enforce"

			schemaMap := map[string]interface{}{
				"$id":   "https://pydio.com/string",
				"title": nsKey,
				"type":  "object",
				"properties": map[string]interface{}{
					nsKey: map[string]interface{}{
						"type":      "string",
						"default":   "A short text",
						"minLength": 1,
						"maxLength": 12,
					},
				},
				"required": []interface{}{nsKey},
			}
			jsStruct, err := structpb.NewStruct(schemaMap)
			So(err, ShouldBeNil)

			// Create with all optional fields set.
			err, isUpdate := mockDAO.Upsert(ctx, &idm.UserMetaNamespace{
				Namespace:      nsKey,
				Label:          "string",
				Order:          15,
				JsonDefinition: `{"type":"string"}`,
				JsonSchema:     jsStruct,
				EnforceDefault: true,
				Description:    "A short text field",
				FieldType:      "string",
			})
			So(err, ShouldBeNil)
			So(isUpdate, ShouldBeFalse)

			result, err := mockDAO.List(ctx)
			So(err, ShouldBeNil)
			ns, ok := result[nsKey]
			So(ok, ShouldBeTrue)
			So(ns.Description, ShouldEqual, "A short text field")
			So(ns.EnforceDefault, ShouldBeTrue)
			So(ns.FieldType, ShouldEqual, "string")
			So(ns.Order, ShouldEqual, 15)
			So(ns.JsonSchema, ShouldNotBeNil)

			// Update: flip EnforceDefault and change description; FieldType intentionally cleared.
			err, isUpdate = mockDAO.Upsert(ctx, &idm.UserMetaNamespace{
				Namespace:      nsKey,
				Label:          "updated",
				JsonDefinition: `{"type":"string"}`,
				JsonSchema:     jsStruct,
				EnforceDefault: false,
				Description:    "Updated description",
			})
			So(err, ShouldBeNil)
			So(isUpdate, ShouldBeTrue)

			result2, err := mockDAO.List(ctx)
			So(err, ShouldBeNil)
			ns2, ok := result2[nsKey]
			So(ok, ShouldBeTrue)
			So(ns2.EnforceDefault, ShouldBeFalse)
			So(ns2.Description, ShouldEqual, "Updated description")
			So(ns2.Label, ShouldEqual, "updated")

			So(mockDAO.Del(ctx, &idm.UserMetaNamespace{Namespace: nsKey}), ShouldBeNil)
		})
	})
}

func TestNSPoliciesOnUpsert(t *testing.T) {
	test.RunStorageTests(nsTestcases, t, func(ctx context.Context) {
		mockDAO, er := manager.Resolve[meta.NamespaceDAO](ctx)
		if er != nil {
			t.Fatal(er)
		}

		Convey("Policies are stored on create and replaced on update", t, func() {
			const nsKey = "test-policies"

			ns := &idm.UserMetaNamespace{
				Namespace: nsKey,
				Label:     "Test Policies",
				Policies: []*service.ResourcePolicy{
					{Action: service.ResourcePolicyAction_READ, Subject: "user:admin"},
				},
			}

			// Create: error must be checked explicitly.
			err, isUpdate := mockDAO.Upsert(ctx, ns)
			So(err, ShouldBeNil)
			So(isUpdate, ShouldBeFalse)
			// The in-memory slice must be updated by Upsert.
			So(ns.Policies, ShouldHaveLength, 1)

			// Add a second policy and update.
			ns.Label = "Test Policies Updated"
			ns.Policies = append(ns.Policies, &service.ResourcePolicy{
				Action:  service.ResourcePolicyAction_WRITE,
				Subject: "user:admin",
			})
			err, isUpdate = mockDAO.Upsert(ctx, ns)
			So(err, ShouldBeNil)
			So(isUpdate, ShouldBeTrue)
			So(ns.Policies, ShouldHaveLength, 2)

			// Verify policies are reloaded correctly from storage.
			list, err := mockDAO.List(ctx)
			So(err, ShouldBeNil)
			found, ok := list[nsKey]
			So(ok, ShouldBeTrue)
			So(found.Label, ShouldEqual, "Test Policies Updated")
			So(found.Policies, ShouldHaveLength, 2)

			// Both actions must be present.
			actions := make(map[service.ResourcePolicyAction]struct{}, 2)
			for _, p := range found.Policies {
				actions[p.Action] = struct{}{}
			}
			_, hasRead := actions[service.ResourcePolicyAction_READ]
			_, hasWrite := actions[service.ResourcePolicyAction_WRITE]
			So(hasRead, ShouldBeTrue)
			So(hasWrite, ShouldBeTrue)

			So(mockDAO.Del(ctx, ns), ShouldBeNil)
		})
	})
}

func TestNSGetJSONSchema(t *testing.T) {
	test.RunStorageTests(nsTestcases, t, func(ctx context.Context) {
		Convey("GetJSONSchema returns nil when no prompt_on_upload namespaces exist", t, func() {
			mockDAO, err := manager.Resolve[meta.NamespaceDAO](ctx)
			So(err, ShouldBeNil)

			// Fresh DB has only the bookmark namespace (prompt_on_upload = false).
			schema, err := mockDAO.GetJSONSchema(ctx)
			So(err, ShouldBeNil)
			So(schema, ShouldBeNil)
		})

		Convey("GetJSONSchema aggregates prompt_on_upload namespaces into one schema", t, func() {
			mockDAO, err := manager.Resolve[meta.NamespaceDAO](ctx)
			So(err, ShouldBeNil)

			// Build a JsonSchema with a single property so BuildNamespacesJsonSchema can merge it.
			const ns1Key = "prompt-ns-1"
			const ns2Key = "prompt-ns-2"

			makeSchema := func(key string) *structpb.Struct {
				m := map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						key: map[string]interface{}{"type": "string"},
					},
					"required": []interface{}{key},
				}
				s, er := structpb.NewStruct(m)
				So(er, ShouldBeNil)
				return s
			}

			err, _ = mockDAO.Upsert(ctx, &idm.UserMetaNamespace{
				Namespace:      ns1Key,
				Label:          "Prompt NS 1",
				JsonDefinition: `{"type":"string"}`,
				JsonSchema:     makeSchema(ns1Key),
				PromptOnUpload: true,
			})
			So(err, ShouldBeNil)

			err, _ = mockDAO.Upsert(ctx, &idm.UserMetaNamespace{
				Namespace:      ns2Key,
				Label:          "Prompt NS 2",
				JsonDefinition: `{"type":"string"}`,
				JsonSchema:     makeSchema(ns2Key),
				PromptOnUpload: true,
			})
			So(err, ShouldBeNil)

			schema, err := mockDAO.GetJSONSchema(ctx)
			So(err, ShouldBeNil)
			So(schema, ShouldNotBeNil)

			// Combined schema must expose a properties map containing both namespace keys.
			propsField := schema.GetFields()["properties"]
			So(propsField, ShouldNotBeNil)
			props := propsField.GetStructValue().GetFields()
			_, ok1 := props[ns1Key]
			_, ok2 := props[ns2Key]
			So(ok1, ShouldBeTrue)
			So(ok2, ShouldBeTrue)

			So(mockDAO.Del(ctx, &idm.UserMetaNamespace{Namespace: ns1Key}), ShouldBeNil)
			So(mockDAO.Del(ctx, &idm.UserMetaNamespace{Namespace: ns2Key}), ShouldBeNil)
		})

		Convey("GetJSONSchema ignores namespaces whose prompt_on_upload is false", t, func() {
			mockDAO, err := manager.Resolve[meta.NamespaceDAO](ctx)
			So(err, ShouldBeNil)

			const nsKey = "no-prompt-ns"
			jsStruct, err := structpb.NewStruct(map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					nsKey: map[string]interface{}{"type": "string"},
				},
			})
			So(err, ShouldBeNil)

			err, _ = mockDAO.Upsert(ctx, &idm.UserMetaNamespace{
				Namespace:      nsKey,
				Label:          "No Prompt",
				JsonDefinition: `{"type":"string"}`,
				JsonSchema:     jsStruct,
				PromptOnUpload: false,
			})
			So(err, ShouldBeNil)

			schema, err := mockDAO.GetJSONSchema(ctx)
			So(err, ShouldBeNil)
			// No prompt_on_upload namespace means the result must be nil.
			So(schema, ShouldBeNil)

			So(mockDAO.Del(ctx, &idm.UserMetaNamespace{Namespace: nsKey}), ShouldBeNil)
		})
	})
}

func TestNSGetNamespaceSchemaSample(t *testing.T) {
	test.RunStorageTests(nsTestcases, t, func(ctx context.Context) {
		Convey("GetNamespaceSchemaSample returns nil when format is empty", t, func() {
			mockDAO, err := manager.Resolve[meta.NamespaceDAO](ctx)
			So(err, ShouldBeNil)

			schema, err := mockDAO.GetNamespaceSchemaSample(ctx, "string", "my-ns", "")
			So(err, ShouldBeNil)
			So(schema, ShouldBeNil)
		})

		Convey("GetNamespaceSchemaSample returns a valid struct for known field types", t, func() {
			mockDAO, err := manager.Resolve[meta.NamespaceDAO](ctx)
			So(err, ShouldBeNil)

			types := []string{"string", "integer", "boolean", "date"}
			for _, ft := range types {
				schema, err := mockDAO.GetNamespaceSchemaSample(ctx, ft, "sample-ns", ft)
				So(err, ShouldBeNil)
				So(schema, ShouldNotBeNil)
				// Every sample schema must have a properties field.
				So(schema.GetFields()["properties"], ShouldNotBeNil)
			}
		})
	})
}
