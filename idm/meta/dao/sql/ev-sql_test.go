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
	evTestcases = test.TemplateSQL(NewEntityValueDAO)
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
func createTestEntity(ctx context.Context, mockDAO meta.EntityValueDAO, label string) (*idm.MetaEntity, error) {
	entity := &idm.MetaEntity{Label: label}
	return mockDAO.CreateEntity(ctx, entity)
}

func createTestEntityValue(ctx context.Context, mockDAO meta.EntityValueDAO, label, entityUuid string) (*idm.EntityValue, error) {
	value := &idm.EntityValue{
		Label:      label,
		EntityUuid: entityUuid,
	}
	return mockDAO.CreateEntityValue(ctx, value)
}

func createTestMeta(ctx context.Context, nodeUuid, namespace string) (*idm.UserMeta, error) {
	metaDAO, err := manager.Resolve[meta.DAO](ctx)
	if err != nil {
		return nil, err
	}
	metaWithId, _, err := metaDAO.Set(ctx, &idm.UserMeta{
		NodeUuid:  nodeUuid,
		Namespace: namespace,
		JsonValue: "test-value",
	})
	return metaWithId, err
}

func TestEntityCrud(t *testing.T) {
	test.RunStorageTests(evTestcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[meta.EntityValueDAO](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Create Entity", t, func() {
			created, err := mockDAO.CreateEntity(ctx, fixtureEntityCity)
			So(err, ShouldBeNil)
			So(created, ShouldNotBeNil)
			So(created.Uuid, ShouldNotBeEmpty)
			So(created.Label, ShouldEqual, fixtureEntityCity.Label)
			So(created.Description, ShouldEqual, fixtureEntityCity.Description)
		})

		Convey("Get Entity", t, func() {
			created, err := mockDAO.CreateEntity(ctx, fixtureEntitySimple)
			So(err, ShouldBeNil)

			retrieved, err := mockDAO.GetEntity(ctx, created.Uuid)
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

			created, err := mockDAO.SetEntities(ctx, entities)
			So(err, ShouldBeNil)
			So(created, ShouldHaveLength, 3)
			for i, e := range created {
				So(e.Uuid, ShouldNotBeEmpty)
				So(e.Label, ShouldEqual, entities[i].Label)
			}
		})
	})
}

func TestEntityValueCrud(t *testing.T) {
	test.RunStorageTests(evTestcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[meta.EntityValueDAO](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Create Entity Value", t, func() {
			createdEntity, err := createTestEntity(ctx, mockDAO, "Test Entity")
			So(err, ShouldBeNil)

			created, err := createTestEntityValue(ctx, mockDAO, "Test Value", createdEntity.Uuid)
			So(err, ShouldBeNil)
			So(created, ShouldNotBeNil)
			So(created.Uuid, ShouldNotBeEmpty)
			So(created.Label, ShouldEqual, "Test Value")
			So(created.EntityUuid, ShouldEqual, createdEntity.Uuid)
		})

		Convey("Get Entity Values", t, func() {
			createdEntity, err := createTestEntity(ctx, mockDAO, "Test Entity")
			So(err, ShouldBeNil)

			_, err = createTestEntityValue(ctx, mockDAO, "Value 1", createdEntity.Uuid)
			So(err, ShouldBeNil)

			_, err = createTestEntityValue(ctx, mockDAO, "Value 2", createdEntity.Uuid)
			So(err, ShouldBeNil)

			values, err := mockDAO.GetEntityValues(ctx, createdEntity.Uuid)
			So(err, ShouldBeNil)
			So(values, ShouldHaveLength, 2)
		})

		Convey("Delete Entity values and meta relations", func() {
			createdEntity, err := createTestEntity(ctx, mockDAO, "Link Entity")
			So(err, ShouldBeNil)

			value1, err := createTestEntityValue(ctx, mockDAO, "Value 1", createdEntity.Uuid)
			So(err, ShouldBeNil)

			value2, err := createTestEntityValue(ctx, mockDAO, "Value 2", createdEntity.Uuid)
			So(err, ShouldBeNil)

			metaWithId, err := createTestMeta(ctx, "test-node", "test-namespace")
			So(err, ShouldBeNil)

			err = mockDAO.LinkMetaValue(ctx, metaWithId.Uuid, value1.Uuid)
			So(err, ShouldBeNil)

			err = mockDAO.LinkMetaValue(ctx, metaWithId.Uuid, value2.Uuid)
			So(err, ShouldBeNil)

			//delete all the entitites, values

			deletedRows, err := mockDAO.DeleteEntityValuesData(ctx, createdEntity.Uuid)

			So(err, ShouldBeNil)
			So(deletedRows, ShouldNotBeEmpty)

		})
	})
}

func TestMetaValueLinking(t *testing.T) {
	test.RunStorageTests(evTestcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[meta.EntityValueDAO](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Link Meta to Values", t, func() {
			createdEntity, err := createTestEntity(ctx, mockDAO, "Link Entity")
			So(err, ShouldBeNil)

			value1, err := createTestEntityValue(ctx, mockDAO, "Value 1", createdEntity.Uuid)
			So(err, ShouldBeNil)

			value2, err := createTestEntityValue(ctx, mockDAO, "Value 2", createdEntity.Uuid)
			So(err, ShouldBeNil)

			metaWithId, err := createTestMeta(ctx, "test-node", "test-namespace")
			So(err, ShouldBeNil)

			err = mockDAO.LinkMetaValue(ctx, metaWithId.Uuid, value1.Uuid)
			So(err, ShouldBeNil)

			err = mockDAO.LinkMetaValue(ctx, metaWithId.Uuid, value2.Uuid)
			So(err, ShouldBeNil)

			linkedValues, err := mockDAO.GetMetaEntityValues(ctx, metaWithId.Uuid)
			So(err, ShouldBeNil)
			So(linkedValues, ShouldHaveLength, 2)
		})

		Convey("Get Meta Entity Values", t, func() {
			createdEntity, err := createTestEntity(ctx, mockDAO, "Get Entity")
			So(err, ShouldBeNil)

			value, err := createTestEntityValue(ctx, mockDAO, "Test Value", createdEntity.Uuid)
			So(err, ShouldBeNil)

			metaWithId, err := createTestMeta(ctx, "test-node-get", "test-namespace")
			So(err, ShouldBeNil)

			err = mockDAO.LinkMetaValue(ctx, metaWithId.Uuid, value.Uuid)
			So(err, ShouldBeNil)

			values, err := mockDAO.GetMetaEntityValues(ctx, metaWithId.Uuid)
			So(err, ShouldBeNil)
			So(values, ShouldHaveLength, 1)
			So(values[0].Label, ShouldEqual, "Test Value")
		})
	})
}
