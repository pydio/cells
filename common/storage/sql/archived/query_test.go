//go:build exclude

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

package archived

import (
	"fmt"
	"reflect"
	"strings"
	"testing"

	"google.golang.org/protobuf/types/known/anypb"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/pydio/cells/v4/common/proto/service"

	. "github.com/smartystreets/goconvey/convey"
)

type fakeConverter struct{}

func (*fakeConverter) Convert(any *anypb.Any) (string, bool) {
	return "CONVERTED", true
}

func TestQuery_String(t *testing.T) {

	marshalled1 := &anypb.Any{}
	marshalled2 := &anypb.Any{}
	marshalled3 := &anypb.Any{}

	Convey("Simplest Case", t, func() {

		enquirer := &service.Query{
			SubQueries: []*anypb.Any{marshalled1},
			Operation:  service.OperationType_AND,
		}

		query := NewDAOQuery(enquirer, new(fakeConverter))

		s := query.String()
		So(s, ShouldEqual, "CONVERTED")

	})

	Convey("Multiple Case AND", t, func() {

		enquirer := &service.Query{
			SubQueries: []*anypb.Any{marshalled1, marshalled2},
			Operation:  service.OperationType_AND,
		}

		query := NewDAOQuery(enquirer, new(fakeConverter))

		s := query.String()
		So(s, ShouldEqual, "(CONVERTED) AND (CONVERTED)")

	})

	Convey("Multiple Case OR", t, func() {

		enquirer := &service.Query{
			SubQueries: []*anypb.Any{marshalled1, marshalled2},
			Operation:  service.OperationType_OR,
		}

		query := NewDAOQuery(enquirer, new(fakeConverter))

		s := query.String()
		So(s, ShouldEqual, "(CONVERTED) OR (CONVERTED)")

	})

	Convey("Nested Cases OR", t, func() {

		enquirerNested := &service.Query{
			SubQueries: []*anypb.Any{marshalled1, marshalled2},
			Operation:  service.OperationType_AND,
		}
		subQ, _ := anypb.New(enquirerNested)

		enquirer := &service.Query{
			SubQueries: []*anypb.Any{subQ, marshalled3},
			Operation:  service.OperationType_OR,
		}

		query := NewDAOQuery(enquirer, new(fakeConverter))

		s := query.String()
		So(s, ShouldEqual, "((CONVERTED) AND (CONVERTED)) OR (CONVERTED)")

	})

	Convey("Nested Cases AND", t, func() {

		enquirerNested := &service.Query{
			SubQueries: []*anypb.Any{marshalled1, marshalled2},
			Operation:  service.OperationType_OR,
		}
		subQ, _ := anypb.New(enquirerNested)

		enquirer := &service.Query{
			SubQueries: []*anypb.Any{subQ, marshalled3},
			Operation:  service.OperationType_AND,
		}

		query := NewDAOQuery(enquirer, new(fakeConverter))

		s := query.String()
		So(s, ShouldEqual, "((CONVERTED) OR (CONVERTED)) AND (CONVERTED)")

	})

}

func TestGetQueryValueFor(t *testing.T) {

	Convey("Empty value", t, func() {

		s := GetQueryValueFor("field")
		So(s, ShouldEqual, "")

	})

	Convey("Simple value", t, func() {

		s := GetQueryValueFor("field", "value1")
		So(s, ShouldEqual, "field='value1'")

	})

	Convey("Dedup values", t, func() {

		s := GetQueryValueFor("field", "value1", "value1")
		So(s, ShouldEqual, "field='value1'")

	})

	Convey("Multiple values", t, func() {

		s := GetQueryValueFor("field", "value1", "value2")
		So(s, ShouldEqual, "field in ('value1','value2')")

	})

	Convey("Multiple values deduped", t, func() {

		s := GetQueryValueFor("field", "value1", "value2", "value1")
		So(s, ShouldEqual, "field in ('value1','value2')")

	})

	Convey("Wildcard value", t, func() {

		s := GetQueryValueFor("field", "value*")
		So(s, ShouldEqual, "field LIKE 'value%'")

		s = GetQueryValueFor("field", "*value*")
		So(s, ShouldEqual, "field LIKE '%value%'")

		s = GetQueryValueFor("field", "*value")
		So(s, ShouldEqual, "field LIKE '%value'")

	})

}

func mapToStruct(m map[string]interface{}) reflect.Value {
	var structFields []reflect.StructField

	for k, v := range m {
		sf := reflect.StructField{
			Name: strings.ToTitle(k),
			Type: reflect.TypeOf(v),
			Tag:  reflect.StructTag(fmt.Sprintf("gorm:\"column:%s\";", k)),
		}
		structFields = append(structFields, sf)
	}

	// Creates the struct type
	structType := reflect.StructOf(structFields)

	el := reflect.New(structType)

	// Setting value
	for k, v := range m {
		el.Elem().FieldByName(strings.ToTitle(k)).Set(reflect.ValueOf(v))

	}

	// Creates a new struct
	return el
}

func verifyStructFields(sr reflect.Value) {
	fmt.Println("\n---Fields found in struct..")

	val := reflect.ValueOf(sr.Interface()).Elem()
	for i := 0; i < val.NumField(); i++ {
		fmt.Println(val.Type().Field(i).Name, val.Type().Field(i).Type, val.Type().Field(i).Tag)
	}
}

func TestSQLITEReflect(t *testing.T) {
	dialector := sqlite.Dialector{
		DriverName: "sqlite3",
		DSN:        "test.db",
	}

	db, err := gorm.Open(dialector, &gorm.Config{
		Logger:         logger.Default.LogMode(logger.Info),
		TranslateError: true,
	})
	if err != nil {
		fmt.Println("ERROR ", err)
		return
	}

	v := mapToStruct(map[string]interface{}{
		"account":   "",
		"checkTime": 0,
		"remote_ip": "1.1.1.1",
		"version":   "2.0.1",
	})

	vv := v.Interface()

	verifyStructFields(v)

	tx := db.Table("test").Model(vv)

	if err := tx.AutoMigrate(vv); err != nil {
		fmt.Println(err)
	}

	tx.Create(vv)

	db.Table("test").Create(map[string]interface{}{
		"account":   "",
		"checkTime": 1,
		"remote_ip": "1.1.1.1",
		"version":   "2.0.1",
	})

	db.Table("test").Create(map[string]interface{}{
		"account":   "",
		"checkTime": 0,
		"remote_ip": "1.1.1.2",
		"version":   "2.0.3",
	})

	var count int64

	tx.Session(&gorm.Session{}).Where("key = ?", "value").Count(&count)
	fmt.Println("Nombre de key = value", count)

	tx.Session(&gorm.Session{}).Where("myint > ?", 11).Count(&count)
	fmt.Println("Nombre de valeurs au dessus de 11", count)

	tx.Session(&gorm.Session{}).Where("myint < ?", 11).Count(&count)
	fmt.Println("Nombre de valeurs en dessous de 11", count)

	res := map[string]interface{}{}
	tx.Session(&gorm.Session{}).Where("myint > ?", 11).Find(&res)

	fmt.Println("res ", res)
}

func TestSQLITEReflect2(t *testing.T) {
	dialector := sqlite.Dialector{
		DriverName: "sqlite3",
		DSN:        "test.db",
	}

	db, err := gorm.Open(dialector, &gorm.Config{
		Logger:         logger.Default.LogMode(logger.Info),
		TranslateError: true,
	})
	if err != nil {
		fmt.Println("ERROR ", err)
		return
	}

	v := mapToStruct(map[string]interface{}{
		"key":         "value",
		"myint":       0,
		"mybool":      true,
		"myothertruc": "whatever",
	})

	vv := v.Interface()

	verifyStructFields(v)

	tx := db.Table("test").Model(vv)

	res := map[string]interface{}{}
	tx.Session(&gorm.Session{}).Where("myint > ?", 11).Find(&res)

	fmt.Println("res ", res)
}
