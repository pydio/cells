//go:build storage || sql

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

package sql

import (
	"context"
	"testing"

	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/idm/meta"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	mainTestcases = test.TemplateSQL(NewDAO)            // Main meta DAO
	eTestcases    = test.TemplateSQL(NewEntityDAO)      // Entity DAO
	evTestcases   = test.TemplateSQL(NewEntityValueDAO) // Entity value DAO
)

// Test fixtures
var (
	fixtureEntityCity = &idm.MetaEntity{
		Label:       "City",
		Description: "City labels",
	}

	fixtureEntitySimple = &idm.MetaEntity{
		Label:       "Test Entity",
		Description: "Test Description",
	}
)

// Helper functions
func createTestEntity(ctx context.Context, dao meta.EntityDAO, label string) (*idm.MetaEntity, error) {
	entity := &idm.MetaEntity{Label: label}
	return dao.CreateEntity(ctx, entity)
}

func createTestEntityValue(ctx context.Context, dao meta.EntityValueDAO, label, entityUuid string) (*idm.EntityValue, error) {
	value := &idm.EntityValue{
		Label:      label,
		EntityUuid: entityUuid,
	}
	return dao.CreateEntityValue(ctx, value)
}

func createTestMeta(ctx context.Context, metaDAO meta.DAO, nodeUuid, namespace string) (*idm.UserMeta, error) {
	metaWithId, _, err := metaDAO.Set(ctx, &idm.UserMeta{
		NodeUuid:  nodeUuid,
		Namespace: namespace,
		JsonValue: "test-value",
	})
	return metaWithId, err
}

func TestEntityCrud(t *testing.T) {
	test.RunStorageTests(mainTestcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[meta.DAO](ctx)
		if err != nil {
			panic(err)
		}
		sqlDAO := mockDAO.(*sqlimpl)
		entityDAO := sqlDAO.entityDAO
		// evDAO := sqlDAO.entityValueDAO

		Convey("Create Entity", t, func() {
			created, err := entityDAO.CreateEntity(ctx, fixtureEntityCity)
			So(err, ShouldBeNil)
			So(created, ShouldNotBeNil)
			So(created.Uuid, ShouldNotBeEmpty)
			So(created.Label, ShouldEqual, fixtureEntityCity.Label)
			So(created.Description, ShouldEqual, fixtureEntityCity.Description)
		})

		Convey("Get Entity", t, func() {
			created, err := entityDAO.CreateEntity(ctx, fixtureEntitySimple)
			So(err, ShouldBeNil)

			retrieved, err := entityDAO.GetEntity(ctx, created.Uuid)
			So(err, ShouldBeNil)
			So(retrieved, ShouldNotBeNil)
			So(retrieved.Uuid, ShouldEqual, created.Uuid)
			So(retrieved.Label, ShouldEqual, fixtureEntitySimple.Label)
		})

		Convey("Set Entities", t, func() {
			entities := []*idm.MetaEntity{
				{Label: "Entity 1", Description: "Description 1"},
				{Label: "Entity 2", Description: "Description 2"},
				{Label: "Entity 3", Description: "Description 3"},
			}

			created, err := entityDAO.SetEntities(ctx, entities)
			So(err, ShouldBeNil)
			So(created, ShouldHaveLength, 3)
			for i, e := range created {
				So(e.Uuid, ShouldNotBeEmpty)
				So(e.Label, ShouldEqual, entities[i].Label)
			}
		})

		Convey("List Entities", t, func() {
			_, err := entityDAO.CreateEntity(ctx, &idm.MetaEntity{Label: "List 1", Description: "Desc 1"})
			So(err, ShouldBeNil)

			_, err = entityDAO.CreateEntity(ctx, &idm.MetaEntity{Label: "List 2", Description: "Desc 2"})
			So(err, ShouldBeNil)

			list, err := entityDAO.ListEntities(ctx)
			So(err, ShouldBeNil)
			So(len(list), ShouldBeGreaterThanOrEqualTo, 2)
		})

		Convey("Get Non-existent Entity Returns Nil", t, func() {
			retrieved, err := entityDAO.GetEntity(ctx, "00000000-0000-0000-0000-000000000000")
			So(err, ShouldBeNil)
			So(retrieved, ShouldBeNil)
		})
	})
}

func TestEntityValueCrud(t *testing.T) {
	test.RunStorageTests(mainTestcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[meta.DAO](ctx)
		if err != nil {
			panic(err)
		}
		sqlDAO := mockDAO.(*sqlimpl)
		entityDAO := sqlDAO.entityDAO
		evDAO := sqlDAO.entityValueDAO

		Convey("Create Entity Value", t, func() {
			createdEntity, err := createTestEntity(ctx, entityDAO, "Test Entity")
			So(err, ShouldBeNil)

			created, err := createTestEntityValue(ctx, evDAO, "Test Value", createdEntity.Uuid)
			So(err, ShouldBeNil)
			So(created, ShouldNotBeNil)
			So(created.Uuid, ShouldNotBeEmpty)
			So(created.Label, ShouldEqual, "Test Value")
			So(created.EntityUuid, ShouldEqual, createdEntity.Uuid)
		})

		Convey("Get Entity Values", t, func() {
			createdEntity, err := createTestEntity(ctx, entityDAO, "Test Entity")
			So(err, ShouldBeNil)

			_, err = createTestEntityValue(ctx, evDAO, "Value 1", createdEntity.Uuid)
			So(err, ShouldBeNil)

			_, err = createTestEntityValue(ctx, evDAO, "Value 2", createdEntity.Uuid)
			So(err, ShouldBeNil)

			values, err := evDAO.GetEntityValues(ctx, createdEntity.Uuid)
			So(err, ShouldBeNil)
			So(values, ShouldHaveLength, 2)
		})

		Convey("Create Entity Value with DisplayJSON", t, func() {
			createdEntity, err := createTestEntity(ctx, entityDAO, "Display JSON Entity")
			So(err, ShouldBeNil)

			value := &idm.EntityValue{
				Label:       "JSON Value",
				EntityUuid:  createdEntity.Uuid,
				DisplayJSON: `{"color":"red","icon":"star"}`,
			}

			created, err := evDAO.CreateEntityValue(ctx, value)
			So(err, ShouldBeNil)
			So(created.DisplayJSON, ShouldEqual, value.DisplayJSON)
		})

		Convey("Update Entity Value When Duplicate Label", t, func() {
			createdEntity, err := createTestEntity(ctx, entityDAO, "Update Entity")
			So(err, ShouldBeNil)

			value1 := &idm.EntityValue{
				Label:       "Duplicate Label",
				EntityUuid:  createdEntity.Uuid,
				DisplayJSON: `{"version":"1"}`,
			}

			created, err := evDAO.CreateEntityValue(ctx, value1)
			So(err, ShouldBeNil)
			originalUuid := created.Uuid

			// Try creating with same label - should update
			value2 := &idm.EntityValue{
				Label:       "Duplicate Label",
				EntityUuid:  createdEntity.Uuid,
				DisplayJSON: `{"version":"2"}`,
			}

			updated, err := evDAO.CreateEntityValue(ctx, value2)
			So(err, ShouldBeNil)
			So(updated.Uuid, ShouldEqual, originalUuid)
			So(updated.DisplayJSON, ShouldEqual, `{"version":"2"}`)

			// Verify only one value exists
			values, err := evDAO.GetEntityValues(ctx, createdEntity.Uuid)
			So(err, ShouldBeNil)
			So(values, ShouldHaveLength, 1)
		})

		Convey("Update Entity Value When UUID Provided", t, func() {
			createdEntity, err := createTestEntity(ctx, entityDAO, "UUID Update Entity")
			So(err, ShouldBeNil)

			value1 := &idm.EntityValue{
				Label:      "Original",
				EntityUuid: createdEntity.Uuid,
			}

			created, err := evDAO.CreateEntityValue(ctx, value1)
			So(err, ShouldBeNil)

			// Update by providing the UUID
			value2 := &idm.EntityValue{
				Uuid:        created.Uuid,
				Label:       "Updated",
				EntityUuid:  createdEntity.Uuid,
				DisplayJSON: `{"updated":true}`,
			}

			updated, err := evDAO.CreateEntityValue(ctx, value2)
			So(err, ShouldBeNil)
			So(updated.Uuid, ShouldEqual, created.Uuid)
			So(updated.Label, ShouldEqual, "Updated")
			So(updated.DisplayJSON, ShouldEqual, `{"updated":true}`)
		})

		Convey("Get Entity Values Returns Empty For Non-existent Entity", t, func() {
			values, err := evDAO.GetEntityValues(ctx, "00000000-0000-0000-0000-000000000000")
			So(err, ShouldBeNil)
			So(values, ShouldHaveLength, 0)
		})
	})
}

func TestMetaValueLinking(t *testing.T) {
	test.RunStorageTests(mainTestcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[meta.DAO](ctx)
		if err != nil {
			panic(err)
		}

		sqlDAO := mockDAO.(*sqlimpl)
		eDAO := sqlDAO.entityDAO
		evDAO := sqlDAO.entityValueDAO

		Convey("Link Meta to Values", t, func() {
			createdEntity, err := createTestEntity(ctx, eDAO, "Link Entity")
			So(err, ShouldBeNil)

			value1, err := createTestEntityValue(ctx, evDAO, "Value 1", createdEntity.Uuid)
			So(err, ShouldBeNil)

			value2, err := createTestEntityValue(ctx, evDAO, "Value 2", createdEntity.Uuid)
			So(err, ShouldBeNil)

			metaWithId, err := createTestMeta(ctx, mockDAO, "test-node", "test-namespace")
			So(err, ShouldBeNil)

			linked, err := evDAO.LinkMetaValue(ctx, metaWithId.Uuid, value1.Uuid)
			So(err, ShouldBeNil)
			So(linked, ShouldBeTrue)

			linked, err = evDAO.LinkMetaValue(ctx, metaWithId.Uuid, value2.Uuid)
			So(err, ShouldBeNil)
			So(linked, ShouldBeTrue)

			linkedValues, err := evDAO.GetMetaEntityValues(ctx, metaWithId.Uuid)
			So(err, ShouldBeNil)
			So(linkedValues, ShouldHaveLength, 2)
		})

		Convey("Get Meta Entity Values", t, func() {
			createdEntity, err := createTestEntity(ctx, eDAO, "Get Entity")
			So(err, ShouldBeNil)

			value, err := createTestEntityValue(ctx, evDAO, "Test Value", createdEntity.Uuid)
			So(err, ShouldBeNil)

			metaWithId, err := createTestMeta(ctx, mockDAO, "test-node-get", "test-namespace")
			So(err, ShouldBeNil)

			linked, err := evDAO.LinkMetaValue(ctx, metaWithId.Uuid, value.Uuid)
			So(err, ShouldBeNil)
			So(linked, ShouldBeTrue)

			values, err := evDAO.GetMetaEntityValues(ctx, metaWithId.Uuid)
			So(err, ShouldBeNil)
			So(values, ShouldHaveLength, 1)
			So(values[0].Label, ShouldEqual, "Test Value")
		})

		Convey("Unlink Meta Value", t, func() {
			createdEntity, err := createTestEntity(ctx, eDAO, "Unlink Entity")
			So(err, ShouldBeNil)

			value, err := createTestEntityValue(ctx, evDAO, "Unlink Value", createdEntity.Uuid)
			So(err, ShouldBeNil)

			metaWithId, err := createTestMeta(ctx, mockDAO, "test-node-unlink", "test-namespace")
			So(err, ShouldBeNil)

			linked, err := evDAO.LinkMetaValue(ctx, metaWithId.Uuid, value.Uuid)
			So(err, ShouldBeNil)
			So(linked, ShouldBeTrue)

			values, err := evDAO.GetMetaEntityValues(ctx, metaWithId.Uuid)
			So(err, ShouldBeNil)
			So(values, ShouldHaveLength, 1)

			unlinked, err := evDAO.UnlinkMetaValue(ctx, metaWithId.Uuid, value.Uuid)
			So(err, ShouldBeNil)
			So(unlinked, ShouldBeTrue)

			values, err = evDAO.GetMetaEntityValues(ctx, metaWithId.Uuid)
			So(err, ShouldBeNil)
			So(values, ShouldHaveLength, 0)
		})

		Convey("Link Duplicate Meta Value Returns False", t, func() {
			createdEntity, err := createTestEntity(ctx, eDAO, "Duplicate Entity")
			So(err, ShouldBeNil)

			value, err := createTestEntityValue(ctx, evDAO, "Duplicate Value", createdEntity.Uuid)
			So(err, ShouldBeNil)

			metaWithId, err := createTestMeta(ctx, mockDAO, "test-node-duplicate", "test-namespace")
			So(err, ShouldBeNil)

			linked, err := evDAO.LinkMetaValue(ctx, metaWithId.Uuid, value.Uuid)
			So(err, ShouldBeNil)
			So(linked, ShouldBeTrue)

			linked, err = evDAO.LinkMetaValue(ctx, metaWithId.Uuid, value.Uuid)
			So(err, ShouldBeNil)
			So(linked, ShouldBeFalse)
		})
	})
}

func TestBatchOperations(t *testing.T) {
	test.RunStorageTests(mainTestcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[meta.DAO](ctx)
		if err != nil {
			panic(err)
		}
		sqlDAO := mockDAO.(*sqlimpl)
		eDAO := sqlDAO.entityDAO
		evDAO := sqlDAO.entityValueDAO

		Convey("Create Entity Values Batch", t, func() {
			createdEntity, err := createTestEntity(ctx, eDAO, "Batch Entity")
			So(err, ShouldBeNil)

			values := []*idm.EntityValue{
				{Label: "Batch Value 1", EntityUuid: createdEntity.Uuid},
				{Label: "Batch Value 2", EntityUuid: createdEntity.Uuid},
				{Label: "Batch Value 3", EntityUuid: createdEntity.Uuid},
			}

			created, err := evDAO.CreateEntityValues(ctx, values)
			So(err, ShouldBeNil)
			So(created, ShouldHaveLength, 3)
			for i, val := range created {
				So(val.Uuid, ShouldNotBeEmpty)
				So(val.Label, ShouldEqual, values[i].Label)
				So(val.EntityUuid, ShouldEqual, createdEntity.Uuid)
			}
		})

		Convey("Create Entity Values Batch Empty", t, func() {
			created, err := evDAO.CreateEntityValues(ctx, []*idm.EntityValue{})
			So(err, ShouldBeNil)
			So(created, ShouldHaveLength, 0)
		})
	})
}

func TestDeleteOperations(t *testing.T) {
	test.RunStorageTests(mainTestcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[meta.DAO](ctx)
		if err != nil {
			panic(err)
		}
		sqlDAO := mockDAO.(*sqlimpl)
		eDAO := sqlDAO.entityDAO
		evDAO := sqlDAO.entityValueDAO

		Convey("Delete Entity Cascade", t, func() {
			createdEntity, err := createTestEntity(ctx, eDAO, "Delete Entity")
			So(err, ShouldBeNil)

			value1, err := createTestEntityValue(ctx, evDAO, "Delete Value 1", createdEntity.Uuid)
			So(err, ShouldBeNil)

			value2, err := createTestEntityValue(ctx, evDAO, "Delete Value 2", createdEntity.Uuid)
			So(err, ShouldBeNil)

			metaWithId, err := createTestMeta(ctx, mockDAO, "test-node-delete", "test-namespace")
			So(err, ShouldBeNil)

			linked, err := evDAO.LinkMetaValue(ctx, metaWithId.Uuid, value1.Uuid)
			So(err, ShouldBeNil)
			So(linked, ShouldBeTrue)

			linked, err = evDAO.LinkMetaValue(ctx, metaWithId.Uuid, value2.Uuid)
			So(err, ShouldBeNil)
			So(linked, ShouldBeTrue)

			valuesBefore, err := evDAO.GetEntityValues(ctx, createdEntity.Uuid)
			So(err, ShouldBeNil)
			So(valuesBefore, ShouldHaveLength, 2)

			linkedValuesBefore, err := evDAO.GetMetaEntityValues(ctx, metaWithId.Uuid)
			So(err, ShouldBeNil)
			So(linkedValuesBefore, ShouldHaveLength, 2)

			deleteResp, err := eDAO.DeleteEntity(ctx, createdEntity.Uuid)
			So(err, ShouldBeNil)
			So(deleteResp, ShouldNotBeNil)
			So(deleteResp.RowsDeleted, ShouldEqual, 1)

			retrieved, err := eDAO.GetEntity(ctx, createdEntity.Uuid)
			So(err, ShouldBeNil)
			So(retrieved, ShouldBeNil)

			valuesAfter, err := evDAO.GetEntityValues(ctx, createdEntity.Uuid)
			So(err, ShouldBeNil)
			So(valuesAfter, ShouldHaveLength, 0)

			linkedValuesAfter, err := evDAO.GetMetaEntityValues(ctx, metaWithId.Uuid)
			So(err, ShouldBeNil)
			So(linkedValuesAfter, ShouldHaveLength, 0)
		})

		Convey("Delete Non-existent Entity", t, func() {
			deleteResp, err := eDAO.DeleteEntity(ctx, "00000000-0000-0000-0000-000000000000")
			So(err, ShouldBeNil)
			So(deleteResp, ShouldNotBeNil)
			So(deleteResp.RowsDeleted, ShouldEqual, 0)
		})

		Convey("Delete Entity with Invalid UUID", t, func() {
			_, err := eDAO.DeleteEntity(ctx, "invalid-uuid")
			So(err, ShouldNotBeNil)
		})
	})
}

func TestValidation(t *testing.T) {
	test.RunStorageTests(mainTestcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[meta.DAO](ctx)
		if err != nil {
			panic(err)
		}
		sqlDAO := mockDAO.(*sqlimpl)
		evDAO := sqlDAO.entityValueDAO

		Convey("Link with Invalid UUIDs", t, func() {
			_, err := evDAO.LinkMetaValue(ctx, "invalid-uuid", "valid-uuid")
			So(err, ShouldNotBeNil)

			_, err = evDAO.LinkMetaValue(ctx, "00000000-0000-0000-0000-000000000000", "invalid-uuid")
			So(err, ShouldNotBeNil)

			_, err = evDAO.LinkMetaValue(ctx, "", "00000000-0000-0000-0000-000000000000")
			So(err, ShouldNotBeNil)
		})

		Convey("Unlink with Invalid UUIDs", t, func() {
			_, err := evDAO.UnlinkMetaValue(ctx, "invalid-uuid", "valid-uuid")
			So(err, ShouldNotBeNil)

			_, err = evDAO.UnlinkMetaValue(ctx, "00000000-0000-0000-0000-000000000000", "invalid-uuid")
			So(err, ShouldNotBeNil)
		})

		Convey("Unlink Non-existent Link Returns False", t, func() {
			unlinked, err := evDAO.UnlinkMetaValue(ctx, "00000000-0000-0000-0000-000000000001", "00000000-0000-0000-0000-000000000002")
			So(err, ShouldBeNil)
			So(unlinked, ShouldBeFalse)
		})
	})
}

func TestGetMetaEntityValuesMap(t *testing.T) {
	test.RunStorageTests(mainTestcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[meta.DAO](ctx)
		if err != nil {
			panic(err)
		}
		sqlDAO := mockDAO.(*sqlimpl)
		eDAO := sqlDAO.entityDAO
		evDAO := sqlDAO.entityValueDAO

		Convey("Get Meta Entity Values For Multiple Metas", t, func() {
			// Create test entities
			entity1, err := createTestEntity(ctx, eDAO, "Test Entity 1")
			So(err, ShouldBeNil)

			entity2, err := createTestEntity(ctx, eDAO, "Test Entity 2")
			So(err, ShouldBeNil)

			// Create entity values
			value1, err := createTestEntityValue(ctx, evDAO, "Value 1", entity1.Uuid)
			So(err, ShouldBeNil)

			value2, err := createTestEntityValue(ctx, evDAO, "Value 2", entity1.Uuid)
			So(err, ShouldBeNil)

			value3, err := createTestEntityValue(ctx, evDAO, "Value 3", entity2.Uuid)
			So(err, ShouldBeNil)

			// Create metas
			meta1, err := createTestMeta(ctx, mockDAO, "node-1", "namespace-1")
			So(err, ShouldBeNil)

			meta2, err := createTestMeta(ctx, mockDAO, "node-2", "namespace-2")
			So(err, ShouldBeNil)

			meta3, err := createTestMeta(ctx, mockDAO, "node-3", "namespace-3")
			So(err, ShouldBeNil)

			// Link meta1 to value1 and value2
			linked, err := evDAO.LinkMetaValue(ctx, meta1.Uuid, value1.Uuid)
			So(err, ShouldBeNil)
			So(linked, ShouldBeTrue)

			linked, err = evDAO.LinkMetaValue(ctx, meta1.Uuid, value2.Uuid)
			So(err, ShouldBeNil)
			So(linked, ShouldBeTrue)

			// Link meta2 to value3
			linked, err = evDAO.LinkMetaValue(ctx, meta2.Uuid, value3.Uuid)
			So(err, ShouldBeNil)
			So(linked, ShouldBeTrue)

			// meta3 has no links

			// Test with all three metas
			metaUuids := []string{meta1.Uuid, meta2.Uuid, meta3.Uuid}
			result, err := evDAO.GetMetaEntityValuesMap(ctx, metaUuids)
			So(err, ShouldBeNil)
			So(result, ShouldNotBeNil)

			// Verify meta1 has 2 values
			So(result[meta1.Uuid], ShouldHaveLength, 2)
			labels := []string{result[meta1.Uuid][0].Label, result[meta1.Uuid][1].Label}
			So(labels, ShouldContain, "Value 1")
			So(labels, ShouldContain, "Value 2")

			// Verify meta2 has 1 value
			So(result[meta2.Uuid], ShouldHaveLength, 1)
			So(result[meta2.Uuid][0].Label, ShouldEqual, "Value 3")
			So(result[meta2.Uuid][0].EntityUuid, ShouldEqual, entity2.Uuid)

			// Verify meta3 has no values
			So(result[meta3.Uuid], ShouldBeNil)
		})

		Convey("Get Meta Entity Values For Empty Input", t, func() {
			result, err := evDAO.GetMetaEntityValuesMap(ctx, []string{})

			So(err, ShouldBeNil)
			So(result, ShouldBeNil)
		})

		Convey("Get Meta Entity Values For Nil Input", t, func() {
			result, err := evDAO.GetMetaEntityValuesMap(ctx, nil)
			So(err, ShouldBeNil)
			So(result, ShouldBeNil)
		})

		Convey("Get Meta Entity Values For Non-existent Metas", t, func() {
			fakeUuid1 := "00000000-0000-0000-0000-000000000001"
			fakeUuid2 := "00000000-0000-0000-0000-000000000002"

			result, err := evDAO.GetMetaEntityValuesMap(ctx, []string{fakeUuid1, fakeUuid2})
			So(err, ShouldBeNil)
			So(result, ShouldNotBeNil)

			// Non-existent metas should have no values
			So(result[fakeUuid1], ShouldBeNil)
			So(result[fakeUuid2], ShouldBeNil)
		})

		Convey("Get Meta Entity Values Preserves Entity UUID", t, func() {
			// Create entity and value
			entity, err := createTestEntity(ctx, eDAO, "UUID Test Entity")
			So(err, ShouldBeNil)

			value, err := createTestEntityValue(ctx, evDAO, "UUID Test Value", entity.Uuid)
			So(err, ShouldBeNil)

			// Create meta and link
			meta, err := createTestMeta(ctx, mockDAO, "uuid-test-node", "uuid-test-namespace")
			So(err, ShouldBeNil)

			linked, err := evDAO.LinkMetaValue(ctx, meta.Uuid, value.Uuid)
			So(err, ShouldBeNil)
			So(linked, ShouldBeTrue)

			// Retrieve and verify all fields are populated correctly
			result, err := evDAO.GetMetaEntityValuesMap(ctx, []string{meta.Uuid})
			So(err, ShouldBeNil)
			So(result[meta.Uuid], ShouldHaveLength, 1)

			retrievedValue := result[meta.Uuid][0]
			So(retrievedValue.Uuid, ShouldEqual, value.Uuid)
			So(retrievedValue.Label, ShouldEqual, value.Label)
			So(retrievedValue.EntityUuid, ShouldEqual, entity.Uuid)
		})
	})
}

func TestDeleteEntityValues(t *testing.T) {
	test.RunStorageTests(mainTestcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[meta.DAO](ctx)
		if err != nil {
			panic(err)
		}
		sqlDAO := mockDAO.(*sqlimpl)
		eDAO := sqlDAO.entityDAO
		// DeleteEntityValues is not part of the EntityValueDAO interface, so we
		// cast to the concrete implementation to access it directly.
		concreteEvDAO := sqlDAO.entityValueDAO.(*evSqlImpl)

		Convey("Delete Entity Values Removes All Values For Entity", t, func() {
			entity, err := createTestEntity(ctx, eDAO, "DEV Entity")
			So(err, ShouldBeNil)

			_, err = createTestEntityValue(ctx, concreteEvDAO, "DEV Value 1", entity.Uuid)
			So(err, ShouldBeNil)
			_, err = createTestEntityValue(ctx, concreteEvDAO, "DEV Value 2", entity.Uuid)
			So(err, ShouldBeNil)

			before, err := concreteEvDAO.GetEntityValues(ctx, entity.Uuid)
			So(err, ShouldBeNil)
			So(before, ShouldHaveLength, 2)

			deleted, err := concreteEvDAO.DeleteEntityValues(ctx, entity.Uuid)
			So(err, ShouldBeNil)
			So(deleted, ShouldBeTrue)

			after, err := concreteEvDAO.GetEntityValues(ctx, entity.Uuid)
			So(err, ShouldBeNil)
			So(after, ShouldHaveLength, 0)
		})

		Convey("Delete Entity Values Returns False When No Values Exist", t, func() {
			deleted, err := concreteEvDAO.DeleteEntityValues(ctx, "00000000-0000-0000-0000-000000000099")
			So(err, ShouldBeNil)
			So(deleted, ShouldBeFalse)
		})

		Convey("Delete Entity Values Makes Links Disappear From GetMetaEntityValues", t, func() {
			entity, err := createTestEntity(ctx, eDAO, "DEV Link Entity")
			So(err, ShouldBeNil)

			value, err := createTestEntityValue(ctx, concreteEvDAO, "DEV Linked Value", entity.Uuid)
			So(err, ShouldBeNil)

			metaWithId, err := createTestMeta(ctx, mockDAO, "dev-node", "dev-namespace")
			So(err, ShouldBeNil)

			linked, err := concreteEvDAO.LinkMetaValue(ctx, metaWithId.Uuid, value.Uuid)
			So(err, ShouldBeNil)
			So(linked, ShouldBeTrue)

			// Confirm the link is visible before deletion
			linkedBefore, err := concreteEvDAO.GetMetaEntityValues(ctx, metaWithId.Uuid)
			So(err, ShouldBeNil)
			So(linkedBefore, ShouldHaveLength, 1)

			// Delete all values for the entity
			_, err = concreteEvDAO.DeleteEntityValues(ctx, entity.Uuid)
			So(err, ShouldBeNil)

			// GetMetaEntityValues uses INNER JOIN so orphaned rel rows yield no results
			linkedAfter, err := concreteEvDAO.GetMetaEntityValues(ctx, metaWithId.Uuid)
			So(err, ShouldBeNil)
			So(linkedAfter, ShouldHaveLength, 0)
		})
	})
}

func TestDisplayJSONRoundTrip(t *testing.T) {
	test.RunStorageTests(mainTestcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[meta.DAO](ctx)
		if err != nil {
			panic(err)
		}
		sqlDAO := mockDAO.(*sqlimpl)
		eDAO := sqlDAO.entityDAO
		evDAO := sqlDAO.entityValueDAO

		Convey("DisplayJSON Is Preserved After Read Via GetEntityValues", t, func() {
			entity, err := createTestEntity(ctx, eDAO, "JSON Round-trip Entity")
			So(err, ShouldBeNil)

			payload := `{"color":"blue","icon":"check","priority":42}`
			value := &idm.EntityValue{
				Label:       "JSON Value",
				EntityUuid:  entity.Uuid,
				DisplayJSON: payload,
			}
			created, err := evDAO.CreateEntityValue(ctx, value)
			So(err, ShouldBeNil)
			So(created.DisplayJSON, ShouldEqual, payload)

			values, err := evDAO.GetEntityValues(ctx, entity.Uuid)
			So(err, ShouldBeNil)
			So(values, ShouldHaveLength, 1)
			So(values[0].DisplayJSON, ShouldEqual, payload)
		})

		Convey("Entity Value Without DisplayJSON Returns Empty String From GetEntityValues", t, func() {
			entity, err := createTestEntity(ctx, eDAO, "No JSON Entity")
			So(err, ShouldBeNil)

			created, err := createTestEntityValue(ctx, evDAO, "Plain Value", entity.Uuid)
			So(err, ShouldBeNil)
			So(created.DisplayJSON, ShouldBeEmpty)

			values, err := evDAO.GetEntityValues(ctx, entity.Uuid)
			So(err, ShouldBeNil)
			So(values, ShouldHaveLength, 1)
			So(values[0].DisplayJSON, ShouldBeEmpty)
		})

		Convey("Batch Create Preserves DisplayJSON Per Value", t, func() {
			entity, err := createTestEntity(ctx, eDAO, "Batch JSON Entity")
			So(err, ShouldBeNil)

			values := []*idm.EntityValue{
				{Label: "BJ 1", EntityUuid: entity.Uuid, DisplayJSON: `{"n":1}`},
				{Label: "BJ 2", EntityUuid: entity.Uuid, DisplayJSON: `{"n":2}`},
				{Label: "BJ 3", EntityUuid: entity.Uuid},
			}

			created, err := evDAO.CreateEntityValues(ctx, values)
			So(err, ShouldBeNil)
			So(created, ShouldHaveLength, 3)
			So(created[0].DisplayJSON, ShouldEqual, `{"n":1}`)
			So(created[1].DisplayJSON, ShouldEqual, `{"n":2}`)
			So(created[2].DisplayJSON, ShouldBeEmpty)
		})
	})
}

func TestSetEntitiesEdgeCases(t *testing.T) {
	test.RunStorageTests(mainTestcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[meta.DAO](ctx)
		if err != nil {
			panic(err)
		}
		sqlDAO := mockDAO.(*sqlimpl)
		entityDAO := sqlDAO.entityDAO

		Convey("Set Entities With Empty Slice Returns Empty Slice", t, func() {
			created, err := entityDAO.SetEntities(ctx, []*idm.MetaEntity{})
			So(err, ShouldBeNil)
			So(created, ShouldHaveLength, 0)
		})

		Convey("Set Entities Assigns Unique UUIDs", t, func() {
			entities := []*idm.MetaEntity{
				{Label: "Unique A"},
				{Label: "Unique B"},
			}
			created, err := entityDAO.SetEntities(ctx, entities)
			So(err, ShouldBeNil)
			So(created, ShouldHaveLength, 2)
			So(created[0].Uuid, ShouldNotEqual, created[1].Uuid)
		})
	})
}

func TestGetMetaEntityValuesEmptySlice(t *testing.T) {
	test.RunStorageTests(mainTestcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[meta.DAO](ctx)
		if err != nil {
			panic(err)
		}
		sqlDAO := mockDAO.(*sqlimpl)
		evDAO := sqlDAO.entityValueDAO

		Convey("GetMetaEntityValues Returns Empty Slice Not Nil For Unlinked Meta", t, func() {
			metaWithId, err := createTestMeta(ctx, mockDAO, "empty-slice-node", "empty-slice-ns")
			So(err, ShouldBeNil)

			values, err := evDAO.GetMetaEntityValues(ctx, metaWithId.Uuid)
			So(err, ShouldBeNil)
			So(values, ShouldNotBeNil)
			So(values, ShouldHaveLength, 0)
		})
	})
}

func TestUnlinkIdempotency(t *testing.T) {
	test.RunStorageTests(mainTestcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[meta.DAO](ctx)
		if err != nil {
			panic(err)
		}
		sqlDAO := mockDAO.(*sqlimpl)
		eDAO := sqlDAO.entityDAO
		evDAO := sqlDAO.entityValueDAO

		Convey("Second Unlink Of Same Pair Returns False Without Error", t, func() {
			entity, err := createTestEntity(ctx, eDAO, "Idempotent Entity")
			So(err, ShouldBeNil)

			value, err := createTestEntityValue(ctx, evDAO, "Idempotent Value", entity.Uuid)
			So(err, ShouldBeNil)

			metaWithId, err := createTestMeta(ctx, mockDAO, "idempotent-node", "idempotent-ns")
			So(err, ShouldBeNil)

			linked, err := evDAO.LinkMetaValue(ctx, metaWithId.Uuid, value.Uuid)
			So(err, ShouldBeNil)
			So(linked, ShouldBeTrue)

			unlinked, err := evDAO.UnlinkMetaValue(ctx, metaWithId.Uuid, value.Uuid)
			So(err, ShouldBeNil)
			So(unlinked, ShouldBeTrue)

			// Second unlink — row is already gone
			unlinked, err = evDAO.UnlinkMetaValue(ctx, metaWithId.Uuid, value.Uuid)
			So(err, ShouldBeNil)
			So(unlinked, ShouldBeFalse)
		})
	})
}

func TestListEntitiesAfterDelete(t *testing.T) {
	test.RunStorageTests(mainTestcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[meta.DAO](ctx)
		if err != nil {
			panic(err)
		}
		sqlDAO := mockDAO.(*sqlimpl)
		eDAO := sqlDAO.entityDAO

		Convey("Deleted Entity Does Not Appear In ListEntities", t, func() {
			entity, err := createTestEntity(ctx, eDAO, "To Be Deleted")
			So(err, ShouldBeNil)

			before, err := eDAO.ListEntities(ctx)
			So(err, ShouldBeNil)
			countBefore := len(before)

			resp, err := eDAO.DeleteEntity(ctx, entity.Uuid)
			So(err, ShouldBeNil)
			So(resp.RowsDeleted, ShouldEqual, 1)

			after, err := eDAO.ListEntities(ctx)
			So(err, ShouldBeNil)
			So(len(after), ShouldEqual, countBefore-1)

			for _, e := range after {
				So(e.Uuid, ShouldNotEqual, entity.Uuid)
			}
		})
	})
}
