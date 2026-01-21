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

	"github.com/google/uuid"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/idm/meta"

	_ "github.com/pydio/cells/v5/common/utils/cache/gocache"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	evTestcases = test.TemplateSQL(NewEntityValueDAO)
)

func TestEntityValueDAO_CreateEntity(t *testing.T) {
	test.RunStorageTests(evTestcases, t, func(ctx context.Context) {
		dao, err := manager.Resolve[meta.EntityValueDAO](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Create Entity without UUID", t, func() {
			entity := &idm.MetaEntity{
				Label:       "Department",
				Description: "Employee Department",
				LabelI18N:   `{"en":"Department","fr":"Département"}`,
			}

			created, err := dao.CreateEntity(ctx, entity)

			So(err, ShouldBeNil)
			So(created, ShouldNotBeNil)
			So(created.Uuid, ShouldNotBeEmpty)
			So(created.Label, ShouldEqual, "Department")
			So(created.Description, ShouldEqual, "Employee Department")
			So(created.LabelI18N, ShouldEqual, `{"en":"Department","fr":"Département"}`)
		})

		Convey("Fail to Create Duplicate Entity", t, func() {
			entity := &idm.MetaEntity{
				Label:       "Status",
				Description: "Project Status",
			}

			created1, err1 := dao.CreateEntity(ctx, entity)
			So(err1, ShouldBeNil)
			So(created1, ShouldNotBeNil)

			created2, err2 := dao.CreateEntity(ctx, entity)
			So(err2, ShouldNotBeNil)
			So(created2, ShouldBeNil)
		})
	})
}

func TestEntityValueDAO_SetEntities(t *testing.T) {
	test.RunStorageTests(evTestcases, t, func(ctx context.Context) {
		dao, err := manager.Resolve[meta.EntityValueDAO](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Set Multiple Entities", t, func() {
			entities := []*idm.MetaEntity{
				{
					Label:       "Priority",
					Description: "Task Priority",
				},
				{
					Label:       "Category",
					Description: "Item Category",
				},
				{
					Label:       "Type",
					Description: "Document Type",
				},
			}

			created, err := dao.SetEntities(ctx, entities)

			So(err, ShouldBeNil)
			So(created, ShouldHaveLength, 3)
			So(created[0].Label, ShouldEqual, "Priority")
			So(created[1].Label, ShouldEqual, "Category")
			So(created[2].Label, ShouldEqual, "Type")
			So(created[0].Uuid, ShouldNotBeEmpty)
			So(created[1].Uuid, ShouldNotBeEmpty)
			So(created[2].Uuid, ShouldNotBeEmpty)
		})
	})
}

func TestEntityValueDAO_GetEntity(t *testing.T) {
	test.RunStorageTests(evTestcases, t, func(ctx context.Context) {
		dao, err := manager.Resolve[meta.EntityValueDAO](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Get Existing Entity", t, func() {
			entity := &idm.MetaEntity{
				Label:       "Team",
				Description: "Team Name",
			}

			created, err := dao.CreateEntity(ctx, entity)
			So(err, ShouldBeNil)

			retrieved, err := dao.GetEntity(ctx, created.Uuid)
			So(err, ShouldBeNil)
			So(retrieved, ShouldNotBeNil)
			So(retrieved.Uuid, ShouldEqual, created.Uuid)
			So(retrieved.Label, ShouldEqual, "Team")
			So(retrieved.Description, ShouldEqual, "Team Name")
		})

		Convey("Get Non-existent Entity", t, func() {
			_, err := dao.GetEntity(ctx, "non-existent-uuid")
			So(err, ShouldNotBeNil)
		})
	})
}

func TestEntityValueDAO_CreateEntityValue(t *testing.T) {
	test.RunStorageTests(evTestcases, t, func(ctx context.Context) {
		dao, err := manager.Resolve[meta.EntityValueDAO](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Create Entity Value", t, func() {
			// First create an entity
			entity := &idm.MetaEntity{
				Label:       "Department",
				Description: "Employee Department",
			}
			createdEntity, err := dao.CreateEntity(ctx, entity)
			So(err, ShouldBeNil)

			// Create a value for this entity
			value := &idm.EntityValue{
				Label:      "Engineering",
				EntityUuid: createdEntity.Uuid,
			}

			createdValue, err := dao.CreateEntityValue(ctx, value)

			So(err, ShouldBeNil)
			So(createdValue, ShouldNotBeNil)
			So(createdValue.Uuid, ShouldNotBeEmpty)
			So(createdValue.Label, ShouldEqual, "Engineering")
			So(createdValue.EntityUuid, ShouldEqual, createdEntity.Uuid)
		})

		Convey("Create Duplicate Entity Value", t, func() {
			entity := &idm.MetaEntity{
				Label: "Status",
			}
			createdEntity, err := dao.CreateEntity(ctx, entity)
			So(err, ShouldBeNil)

			value := &idm.EntityValue{
				Label:      "Active",
				EntityUuid: createdEntity.Uuid,
			}

			created1, err1 := dao.CreateEntityValue(ctx, value)
			So(err1, ShouldBeNil)
			So(created1, ShouldNotBeNil)

			// Try to create duplicate
			created2, err2 := dao.CreateEntityValue(ctx, value)
			So(err2, ShouldBeNil)
			So(created2, ShouldNotBeNil)
			// Should return existing entity value
			So(created2.Uuid, ShouldEqual, created1.Uuid)
			So(created2.Label, ShouldEqual, "Active")
		})
	})
}

func TestEntityValueDAO_GetEntityValues(t *testing.T) {
	test.RunStorageTests(evTestcases, t, func(ctx context.Context) {
		dao, err := manager.Resolve[meta.EntityValueDAO](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Get Entity Values", t, func() {
			// Create an entity
			entity := &idm.MetaEntity{
				Label: "Priority",
			}
			createdEntity, err := dao.CreateEntity(ctx, entity)
			So(err, ShouldBeNil)

			// Create multiple values
			values := []string{"High", "Medium", "Low", "Critical"}
			for _, label := range values {
				_, err := dao.CreateEntityValue(ctx, &idm.EntityValue{
					Label:      label,
					EntityUuid: createdEntity.Uuid,
				})
				So(err, ShouldBeNil)
			}

			// Get all values for this entity
			retrievedValues, err := dao.GetEntityValues(ctx, createdEntity.Uuid)

			So(err, ShouldBeNil)
			So(retrievedValues, ShouldHaveLength, 4)

			labels := make([]string, len(retrievedValues))
			for i, v := range retrievedValues {
				labels[i] = v.Label
			}
			So(labels, ShouldContain, "High")
			So(labels, ShouldContain, "Medium")
			So(labels, ShouldContain, "Low")
			So(labels, ShouldContain, "Critical")
		})

		Convey("Get Entity Values for Non-existent Entity", t, func() {
			values, err := dao.GetEntityValues(ctx, "non-existent-entity-uuid")
			So(err, ShouldBeNil)
			So(values, ShouldHaveLength, 0)
		})
	})
}

func TestEntityValueDAO_LinkMetaToValues(t *testing.T) {
	test.RunStorageTests(evTestcases, t, func(ctx context.Context) {
		dao, err := manager.Resolve[meta.EntityValueDAO](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Link Meta to Values", t, func() {
			// Create entity and values
			entity := &idm.MetaEntity{Label: "Tag"}
			createdEntity, err := dao.CreateEntity(ctx, entity)
			So(err, ShouldBeNil)

			value1, _ := dao.CreateEntityValue(ctx, &idm.EntityValue{
				Label:      "Important",
				EntityUuid: createdEntity.Uuid,
			})
			value2, _ := dao.CreateEntityValue(ctx, &idm.EntityValue{
				Label:      "Urgent",
				EntityUuid: createdEntity.Uuid,
			})

			metaUUID := "550e8400-e29b-41d4-a716-446655440005"
			valueUUIDs := []string{value1.Uuid, value2.Uuid}

			err = dao.LinkMetaToValues(ctx, metaUUID, valueUUIDs)
			So(err, ShouldBeNil)

			// Verify the link by getting meta entity values
			linkedValues, err := dao.GetMetaEntityValues(ctx, metaUUID)
			So(err, ShouldBeNil)
			So(linkedValues, ShouldHaveLength, 2)

			labels := []string{linkedValues[0].Label, linkedValues[1].Label}
			So(labels, ShouldContain, "Important")
			So(labels, ShouldContain, "Urgent")
		})

		Convey("Link Meta to Empty Values", t, func() {
			err := dao.LinkMetaToValues(ctx, "550e8400-e29b-41d4-a716-446655440006", []string{})
			So(err, ShouldBeNil)
		})

		Convey("Link Meta to Values Multiple Times (Idempotent)", t, func() {
			entity := &idm.MetaEntity{Label: "Category"}
			createdEntity, err := dao.CreateEntity(ctx, entity)
			So(err, ShouldBeNil)

			value1, _ := dao.CreateEntityValue(ctx, &idm.EntityValue{
				Label:      "Work",
				EntityUuid: createdEntity.Uuid,
			})

			metaUUID := "550e8400-e29b-41d4-a716-446655440007"

			// Link once
			err = dao.LinkMetaToValues(ctx, metaUUID, []string{value1.Uuid})
			So(err, ShouldBeNil)

			// Link again - should not error
			err = dao.LinkMetaToValues(ctx, metaUUID, []string{value1.Uuid})
			So(err, ShouldBeNil)

			// Should still have only one link
			linkedValues, err := dao.GetMetaEntityValues(ctx, metaUUID)
			So(err, ShouldBeNil)
			So(linkedValues, ShouldHaveLength, 1)
		})

		Convey("Link Meta with Invalid Meta UUID", t, func() {
			entity := &idm.MetaEntity{Label: "Test"}
			createdEntity, err := dao.CreateEntity(ctx, entity)
			So(err, ShouldBeNil)

			value1, _ := dao.CreateEntityValue(ctx, &idm.EntityValue{
				Label:      "TestValue",
				EntityUuid: createdEntity.Uuid,
			})

			// Try to link with invalid meta UUID
			err = dao.LinkMetaToValues(ctx, "invalid-uuid", []string{value1.Uuid})
			So(err, ShouldNotBeNil)
		})

		Convey("Link Meta with Invalid Value UUID", t, func() {
			validMetaUUID := "550e8400-e29b-41d4-a716-446655440000"

			// Try to link with invalid value UUID
			err := dao.LinkMetaToValues(ctx, validMetaUUID, []string{"invalid-uuid"})
			So(err, ShouldNotBeNil)
		})

		Convey("Link Meta with Mixed Valid and Invalid Value UUIDs", t, func() {
			entity := &idm.MetaEntity{Label: "Mixed"}
			createdEntity, err := dao.CreateEntity(ctx, entity)
			So(err, ShouldBeNil)

			value1, _ := dao.CreateEntityValue(ctx, &idm.EntityValue{
				Label:      "ValidValue",
				EntityUuid: createdEntity.Uuid,
			})

			validMetaUUID := "550e8400-e29b-41d4-a716-446655440000"

			// Try to link with one valid and one invalid value UUID
			err = dao.LinkMetaToValues(ctx, validMetaUUID, []string{value1.Uuid, "invalid-uuid"})
			So(err, ShouldNotBeNil)
		})
	})
}

func TestEntityValueDAO_UnlinkMetaFromValues(t *testing.T) {
	test.RunStorageTests(evTestcases, t, func(ctx context.Context) {
		dao, err := manager.Resolve[meta.EntityValueDAO](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Unlink Meta from Values", t, func() {
			// Setup: create entity, values, and links
			entity := &idm.MetaEntity{Label: "Status"}
			createdEntity, err := dao.CreateEntity(ctx, entity)
			So(err, ShouldBeNil)

			value1, _ := dao.CreateEntityValue(ctx, &idm.EntityValue{
				Label:      "Active",
				EntityUuid: createdEntity.Uuid,
			})
			value2, _ := dao.CreateEntityValue(ctx, &idm.EntityValue{
				Label:      "Inactive",
				EntityUuid: createdEntity.Uuid,
			})
			value3, _ := dao.CreateEntityValue(ctx, &idm.EntityValue{
				Label:      "Pending",
				EntityUuid: createdEntity.Uuid,
			})

			metaUUID := "550e8400-e29b-41d4-a716-446655440008"
			dao.LinkMetaToValues(ctx, metaUUID, []string{value1.Uuid, value2.Uuid, value3.Uuid})

			// Verify all linked
			linkedValues, _ := dao.GetMetaEntityValues(ctx, metaUUID)
			So(linkedValues, ShouldHaveLength, 3)

			// Unlink one value
			err = dao.UnlinkMetaFromValues(ctx, metaUUID, []string{value2.Uuid})
			So(err, ShouldBeNil)

			// Verify only 2 remain
			linkedValues, err = dao.GetMetaEntityValues(ctx, metaUUID)
			So(err, ShouldBeNil)
			So(linkedValues, ShouldHaveLength, 2)

			labels := []string{linkedValues[0].Label, linkedValues[1].Label}
			So(labels, ShouldContain, "Active")
			So(labels, ShouldContain, "Pending")
			So(labels, ShouldNotContain, "Inactive")
		})

		Convey("Unlink Meta from Empty Values", t, func() {
			validMetaUUID := "550e8400-e29b-41d4-a716-446655440000"
			err := dao.UnlinkMetaFromValues(ctx, validMetaUUID, []string{})
			So(err, ShouldBeNil)
		})

		Convey("Unlink Meta with Invalid Meta UUID", t, func() {
			entity := &idm.MetaEntity{Label: "Test"}
			createdEntity, err := dao.CreateEntity(ctx, entity)
			So(err, ShouldBeNil)

			value1, _ := dao.CreateEntityValue(ctx, &idm.EntityValue{
				Label:      "TestValue",
				EntityUuid: createdEntity.Uuid,
			})

			// Try to unlink with invalid meta UUID
			err = dao.UnlinkMetaFromValues(ctx, "invalid-uuid", []string{value1.Uuid})
			So(err, ShouldNotBeNil)
		})

		Convey("Unlink Meta with Invalid Value UUID", t, func() {
			validMetaUUID := "550e8400-e29b-41d4-a716-446655440000"

			// Try to unlink with invalid value UUID
			err := dao.UnlinkMetaFromValues(ctx, validMetaUUID, []string{"invalid-uuid"})
			So(err, ShouldNotBeNil)
		})

		Convey("Unlink Meta with Mixed Valid and Invalid Value UUIDs", t, func() {
			entity := &idm.MetaEntity{Label: "Mixed"}
			createdEntity, err := dao.CreateEntity(ctx, entity)
			So(err, ShouldBeNil)

			value1, _ := dao.CreateEntityValue(ctx, &idm.EntityValue{
				Label:      "ValidValue",
				EntityUuid: createdEntity.Uuid,
			})

			validMetaUUID := "550e8400-e29b-41d4-a716-446655440000"

			// Try to unlink with one valid and one invalid value UUID
			err = dao.UnlinkMetaFromValues(ctx, validMetaUUID, []string{value1.Uuid, "invalid-uuid"})
			So(err, ShouldNotBeNil)
		})
	})
}

func TestEntityValueDAO_GetMetaEntityValues(t *testing.T) {
	test.RunStorageTests(evTestcases, t, func(ctx context.Context) {
		dao, err := manager.Resolve[meta.EntityValueDAO](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Get Meta Entity Values", t, func() {
			// Create entity and values
			entity := &idm.MetaEntity{Label: "Project"}
			createdEntity, err := dao.CreateEntity(ctx, entity)
			So(err, ShouldBeNil)

			value1, _ := dao.CreateEntityValue(ctx, &idm.EntityValue{
				Label:      "Alpha",
				EntityUuid: createdEntity.Uuid,
			})
			value2, _ := dao.CreateEntityValue(ctx, &idm.EntityValue{
				Label:      "Beta",
				EntityUuid: createdEntity.Uuid,
			})

			metaUUID := "550e8400-e29b-41d4-a716-446655440009"
			dao.LinkMetaToValues(ctx, metaUUID, []string{value1.Uuid, value2.Uuid})

			// Get meta entity values
			values, err := dao.GetMetaEntityValues(ctx, metaUUID)

			So(err, ShouldBeNil)
			So(values, ShouldHaveLength, 2)
			So(values[0].EntityUuid, ShouldEqual, createdEntity.Uuid)
			So(values[1].EntityUuid, ShouldEqual, createdEntity.Uuid)
		})

		Convey("Get Meta Entity Values for Non-linked Meta", t, func() {
			values, err := dao.GetMetaEntityValues(ctx, "550e8400-e29b-41d4-a716-446655440010")
			So(err, ShouldBeNil)
			So(values, ShouldHaveLength, 0)
		})
	})
}

func TestEntityValueDAO_CreateEntityValueAndLink(t *testing.T) {
	test.RunStorageTests(evTestcases, t, func(ctx context.Context) {
		dao, err := manager.Resolve[meta.EntityValueDAO](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Create Entity Values and Link", t, func() {
			// Create entity
			entity := &idm.MetaEntity{Label: "Skill"}
			createdEntity, err := dao.CreateEntity(ctx, entity)
			So(err, ShouldBeNil)

			metaUUID := uuid.New().String()
			labels := []string{"Go", "Python", "JavaScript", "Rust"}

			// Create values and link in one operation
			createdValues, err := dao.CreateEntityValueAndLink(ctx, metaUUID, createdEntity.Uuid, labels)

			So(err, ShouldBeNil)
			So(createdValues, ShouldHaveLength, 4)

			// Verify all values were created
			for i, value := range createdValues {
				So(value.Uuid, ShouldNotBeEmpty)
				So(value.Label, ShouldEqual, labels[i])
				So(value.EntityUuid, ShouldEqual, createdEntity.Uuid)
			}

			// Verify all values were linked
			linkedValues, err := dao.GetMetaEntityValues(ctx, metaUUID)
			So(err, ShouldBeNil)
			So(linkedValues, ShouldHaveLength, 4)

			linkedLabels := make([]string, len(linkedValues))
			for i, v := range linkedValues {
				linkedLabels[i] = v.Label
			}
			So(linkedLabels, ShouldContain, "Go")
			So(linkedLabels, ShouldContain, "Python")
			So(linkedLabels, ShouldContain, "JavaScript")
			So(linkedLabels, ShouldContain, "Rust")
		})

		Convey("Create Entity Values and Link with Empty Labels", t, func() {
			entity := &idm.MetaEntity{Label: "Empty"}
			createdEntity, err := dao.CreateEntity(ctx, entity)
			So(err, ShouldBeNil)

			metaUUID := "550e8400-e29b-41d4-a716-446655440002"
			createdValues, err := dao.CreateEntityValueAndLink(ctx, metaUUID, createdEntity.Uuid, []string{})

			So(err, ShouldBeNil)
			So(createdValues, ShouldHaveLength, 0)
		})

		Convey("Create Entity Values and Link with Duplicate Labels", t, func() {
			entity := &idm.MetaEntity{Label: "Color"}
			createdEntity, err := dao.CreateEntity(ctx, entity)
			So(err, ShouldBeNil)

			metaUUID := uuid.New().String()

			// First call
			createdValues1, err := dao.CreateEntityValueAndLink(ctx, metaUUID, createdEntity.Uuid, []string{"Red", "Blue"})
			So(err, ShouldBeNil)
			So(createdValues1, ShouldHaveLength, 2)

			// Second call with one duplicate
			createdValues2, err := dao.CreateEntityValueAndLink(ctx, uuid.New().String(), createdEntity.Uuid, []string{"Red", "Green"})
			So(err, ShouldNotBeNil)
			So(createdValues2, ShouldBeNil)
		})
	})
}
