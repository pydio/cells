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
	"testing"

	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/types/known/structpb"
	"gorm.io/datatypes"

	"github.com/pydio/cells/v5/common/proto/idm"
	service "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/test"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
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

			// Insert a meta
			err, _ := mockDAO.Upsert(ctx, &idm.UserMetaNamespace{
				Namespace:      "namespace",
				Label:          "label",
				Order:          1,
				JsonDefinition: "{\"type\":\"string\"}",
			})
			So(err, ShouldBeNil)

			// List meta
			result, er := mockDAO.List(ctx)
			So(er, ShouldBeNil)
			So(result, ShouldHaveLength, 2) // 2 because DAO automatically adds the Bookmarks namespace
			So(result["namespace"].Order, ShouldEqual, 1)

			jsonDef := result["namespace"].JsonDefinition
			var def map[string]string
			er = json.Unmarshal([]byte(jsonDef), &def)
			So(er, ShouldBeNil)
			So(def["type"], ShouldEqual, "string")

			e := mockDAO.Del(ctx, &idm.UserMetaNamespace{Namespace: "namespace"})
			So(e, ShouldBeNil)

			// List meta for the node
			result2, er := mockDAO.List(ctx)
			So(er, ShouldBeNil)
			So(result2, ShouldHaveLength, 2)
		})
	})

}

func TestNSResourceRules(t *testing.T) {
	test.RunStorageTests(nsTestcases, t, func(ctx context.Context) {
		mockDAO, er := manager.Resolve[meta.NamespaceDAO](ctx)
		if er != nil {
			panic(er)
		}

		Convey("Test Add Rule", t, func() {

			_, err := mockDAO.AddPolicies(ctx, false, "resource-id-ns", []*service.ResourcePolicy{{Action: service.ResourcePolicyAction_READ, Subject: "subject1"}})
			So(err, ShouldBeNil)

		})

		Convey("Select Rules", t, func() {

			rules, err := mockDAO.GetPoliciesForResource(ctx, "resource-id-ns")
			So(rules, ShouldHaveLength, 1)
			So(err, ShouldBeNil)

		})

		Convey("Delete Rules", t, func() {

			err := mockDAO.DeletePoliciesForResource(ctx, "resource-id-ns")
			So(err, ShouldBeNil)

			rules, err := mockDAO.GetPoliciesForResource(ctx, "resource-id-ns")
			So(rules, ShouldHaveLength, 0)
			So(err, ShouldBeNil)

		})

		Convey("Delete Rules For Action", t, func() {

			_, e := mockDAO.AddPolicies(ctx, false, "resource-id-ns", []*service.ResourcePolicy{
				{Action: service.ResourcePolicyAction_READ, Subject: "subject1"},
				{Action: service.ResourcePolicyAction_WRITE, Subject: "subject1"},
			})
			So(e, ShouldBeNil)

			rules, err := mockDAO.GetPoliciesForResource(ctx, "resource-id-ns")
			So(rules, ShouldHaveLength, 2)

			err = mockDAO.DeletePoliciesForResourceAndAction(ctx, "resource-id-ns", service.ResourcePolicyAction_READ)
			So(err, ShouldBeNil)

			rules, err = mockDAO.GetPoliciesForResource(ctx, "resource-id-ns")
			So(rules, ShouldHaveLength, 1)
			So(err, ShouldBeNil)

		})
	})
}

func TestNSNewFields(t *testing.T) {

	test.RunStorageTests(nsTestcases, t, func(ctx context.Context) {

		Convey("Create Meta Namespace with new fields", t, func() {
			mockDAO, err0 := manager.Resolve[meta.NamespaceDAO](ctx)
			So(err0, ShouldBeNil)
			tv := json_schema.LegacyTypeToLabel([]byte("{\"type\":\"string\"}"))
			jsb, err1 := json_schema.GetJsonSchema(tv)
			So(err1, ShouldBeNil)
			schemaAsJson := datatypes.JSON(jsb)
			jsStruct, err := json_schema.JsonToProtoStruct(&schemaAsJson)
			So(err, ShouldBeNil)
			in := &idm.UserMetaNamespace{
				Namespace:      "namespace-newfields",
				Label:          "label-newfields",
				Order:          2,
				JsonDefinition: "{\"type\":\"string\"}",
				JsonSchema:     jsStruct,
				PromptOnUpload: true,
			}

			// Insert a meta with new fields
			err2, _ := mockDAO.Upsert(ctx, in)
			So(err2, ShouldBeNil)

			// Assert
			result, err2 := mockDAO.List(ctx)
			So(err2, ShouldBeNil)

			ns, ok := result["namespace-newfields"]
			So(ok, ShouldBeTrue)

			// Basic fields
			So(ns.Label, ShouldEqual, "label-newfields")

			So(ns.JsonSchema, ShouldNotBeNil)
			So(ns.PromptOnUpload, ShouldBeTrue)

			// Cleanup
			err4 := mockDAO.Del(ctx, &idm.UserMetaNamespace{Namespace: "namespace-newfields"})
			So(err4, ShouldBeNil)
		})
	})
}

func TestNSDeleteWithJsonSchema(t *testing.T) {
	test.RunStorageTests(nsTestcases, t, func(ctx context.Context) {
		Convey("Delete namespace with JsonSchema", t, func() {
			mockDAO, err := manager.Resolve[meta.NamespaceDAO](ctx)
			So(err, ShouldBeNil)

			beforeList, err := mockDAO.List(ctx)
			So(err, ShouldBeNil)
			beforeLen := len(beforeList)

			nsKey := "namespace-delete-jsonschema"
			nsLabel := "label-delete-jsonschema"

			jsBytes, err := json_schema.GetJsonSchema(json_schema.LegacyTypeToLabel([]byte("{\"type\":\"string\"}")))
			So(err, ShouldBeNil)
			jsAsJSON := datatypes.JSON(jsBytes)
			jsStruct, err := json_schema.JsonToProtoStruct(&jsAsJSON)
			So(err, ShouldBeNil)

			// Insert namespace with JsonSchema value
			err, _ = mockDAO.Upsert(ctx, &idm.UserMetaNamespace{
				Namespace:      nsKey,
				Label:          nsLabel,
				JsonDefinition: "{\"type\":\"string\"}",
				JsonSchema:     jsStruct,
			})
			So(err, ShouldBeNil)

			afterAdd, err := mockDAO.List(ctx)
			So(err, ShouldBeNil)
			So(afterAdd, ShouldHaveLength, beforeLen+1)
			_, ok := afterAdd[nsKey]
			So(ok, ShouldBeTrue)

			err = mockDAO.Del(ctx, &idm.UserMetaNamespace{Namespace: nsKey, Label: nsLabel})
			So(err, ShouldBeNil)

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
		Convey("Add should update JsonSchema when Namespace is stored in db before update", t, func() {
			mockDAO, er := manager.Resolve[meta.NamespaceDAO](ctx)
			So(er, ShouldBeNil)

			nsKey := "namespace-jsonschema-update"

			// Arrange create initial namespace
			err, _ := mockDAO.Upsert(ctx, &idm.UserMetaNamespace{
				Namespace:      nsKey,
				Label:          "label1",
				Order:          1,
				JsonDefinition: "{\"type\":\"string\"}",
			})
			So(err, ShouldBeNil)

			// verify stored schema
			result, er := mockDAO.List(ctx)
			So(er, ShouldBeNil)
			ns, ok := result[nsKey]
			So(ok, ShouldBeTrue)
			So(ns.JsonSchema, ShouldNotBeNil)

			// update using Add
			err1, _ := mockDAO.Upsert(ctx, &idm.UserMetaNamespace{
				JsonDefinition: "{\"type\":\"textarea\"}",
				Namespace:      nsKey,
				Label:          "label2",
				JsonSchema:     ns.JsonSchema,
			})
			So(err1, ShouldBeNil)

			// verify stored schema
			result2, er := mockDAO.List(ctx)
			So(er, ShouldBeNil)
			ns2, ok := result2[nsKey]
			So(ok, ShouldBeTrue)
			So(ns2.JsonSchema, ShouldNotBeNil)

			// Arrange Update schema value
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
			ns.JsonSchema = newStruct
			// Act - call Add to update JsonSchema
			err2, _ := mockDAO.Upsert(ctx, &idm.UserMetaNamespace{
				JsonDefinition: "{\"type\":\"object\"}",
				Namespace:      nsKey,
				Label:          "label3",
				JsonSchema:     ns.JsonSchema,
			})

			So(err2, ShouldBeNil)

			nss, err3 := mockDAO.List(ctx)
			So(err3, ShouldBeNil)

			// Assert
			updated, ok := nss[nsKey]
			So(ok, ShouldBeTrue)
			So(updated.Namespace, ShouldEqual, nsKey)
			So(updated.Label, ShouldEqual, "label3")
			So(updated.JsonDefinition, ShouldEqual, "{\"type\":\"object\"}")
			So(updated.Order, ShouldEqual, 1)

			// Compare
			expectedBytes, _ := protojson.Marshal(newStruct)
			actualBytes, _ := protojson.Marshal(updated.JsonSchema)
			So(string(actualBytes), ShouldEqual, string(expectedBytes))

			// cleanup
			e := mockDAO.Del(ctx, &idm.UserMetaNamespace{Namespace: nsKey})
			So(e, ShouldBeNil)
		})
	})
}
