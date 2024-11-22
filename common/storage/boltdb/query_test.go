//go:build storage || kv

/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package boltdb

import (
	"context"
	"encoding/json"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func id(s string) string {
	return s
}

func TestBleveQueryToJSONPath(t *testing.T) {

	Convey("Test JsonPath - Should", t, func() {
		jp, pa, er := BleveQueryToJSONPath("field1:value field2:value", "$", false, id, false)
		So(er, ShouldBeNil)
		So(pa, ShouldEqual, "$[?((@.field1==\"value\" || @.field2==\"value\"))]")
		So(jp, ShouldNotBeNil)
	})

	Convey("Test JsonPath - Must ", t, func() {
		jp, pa, er := BleveQueryToJSONPath("+field1:value +field2:value", "$", false, id, false)
		So(er, ShouldBeNil)
		So(pa, ShouldEqual, "$[?(@.field1==\"value\" && @.field2==\"value\")]")
		So(jp, ShouldNotBeNil)
	})

	Convey("Test JsonPath - MustNot ", t, func() {
		jp, pa, er := BleveQueryToJSONPath("-field1:value", "$", false, id, false)
		So(er, ShouldBeNil)
		So(pa, ShouldEqual, "$[?(@.field1!=\"value\")]")
		So(jp, ShouldNotBeNil)
	})

	Convey("Test JsonPath - Must and MustNot ", t, func() {
		jp, pa, er := BleveQueryToJSONPath("+field1:value -field2:value", "$", false, id, false)
		So(er, ShouldBeNil)
		So(pa, ShouldEqual, "$[?(@.field1==\"value\" && @.field2!=\"value\")]")
		So(jp, ShouldNotBeNil)
	})

	Convey("Test JsonPath - More Complex", t, func() {
		jp, pa, er := BleveQueryToJSONPath("field1:value field2:value -field2:value", "$", false, id, false)
		So(er, ShouldBeNil)
		So(pa, ShouldEqual, "$[?((@.field1==\"value\" || @.field2==\"value\") && @.field2!=\"value\")]")
		So(jp, ShouldNotBeNil)
	})

}

func TestBleveQueryToJSONPathData(t *testing.T) {

	Convey("Test JsonPath - Actual Data", t, func() {
		var jsonData map[string]interface{}
		So(json.Unmarshal([]byte(activities), &jsonData), ShouldBeNil)

		{
			eval, jpath, er := BleveQueryToJSONPath("id:\"/activity-13843\"", "$.items", false, id, true)
			So(er, ShouldBeNil)
			So(eval, ShouldNotBeNil)
			So(jpath, ShouldEqual, "length($.items[?(@.id==\"/activity-13843\")])")
			s, er := eval.EvalInt(context.Background(), jsonData)
			So(er, ShouldBeNil)
			So(s, ShouldEqual, 1)
		}

		{
			eval, jpath, er := BleveQueryToJSONPath("object.id:\"c6592312-d7c1-45fe-a283-93eee6e53e44\"", "$.items", false, id, true)
			So(er, ShouldBeNil)
			So(eval, ShouldNotBeNil)
			So(jpath, ShouldEqual, "length($.items[?(@.object.id==\"c6592312-d7c1-45fe-a283-93eee6e53e44\")])")
			s, er := eval.EvalInt(context.Background(), jsonData)
			So(er, ShouldBeNil)
			So(s, ShouldEqual, 1)
		}

		{
			eval, _, er := BleveQueryToJSONPath("object.name:\"accounting-2019*\"", "$.items", false, id, true)
			So(er, ShouldBeNil)
			So(eval, ShouldNotBeNil)
			s, er := eval.EvalInt(context.Background(), jsonData)
			So(er, ShouldBeNil)
			So(s, ShouldEqual, 1)
		}

		{
			eval, _, er := BleveQueryToJSONPath("id:\"*activity*\"", "$.items", false, id, true)
			So(er, ShouldBeNil)
			So(eval, ShouldNotBeNil)
			s, er := eval.EvalInt(context.Background(), jsonData)
			So(er, ShouldBeNil)
			So(s, ShouldEqual, 2)
		}

		{
			eval, _, er := BleveQueryToJSONPath("id:\"/activity*\"", "$.items", false, id, false)
			So(er, ShouldBeNil)
			So(eval, ShouldNotBeNil)
			res, er := eval(context.Background(), jsonData)
			So(er, ShouldBeNil)
			results := res.([]interface{})
			So(results, ShouldHaveLength, 2)
		}

		{
			eval, _, er := BleveQueryToJSONPath("id:\"/activity-13843\" id:\"/activity-13837\"", "$.items", false, id, true)
			So(er, ShouldBeNil)
			So(eval, ShouldNotBeNil)
			s, er := eval.EvalInt(context.Background(), jsonData)
			So(er, ShouldBeNil)
			So(s, ShouldEqual, 2)
		}

		{
			eval, _, er := BleveQueryToJSONPath("+id:\"/activity-13843\" +name:\"File Event\"", "$.items", false, id, true)
			So(er, ShouldBeNil)
			So(eval, ShouldNotBeNil)
			s, er := eval.EvalInt(context.Background(), jsonData)
			So(er, ShouldBeNil)
			So(s, ShouldEqual, 1)
		}

		{
			eval, jpath, er := BleveQueryToJSONPath("+id:\"/activity-13843\" -name:\"File Event\"", "$.items", false, id, true)
			So(er, ShouldBeNil)
			So(eval, ShouldNotBeNil)
			So(jpath, ShouldEqual, "length($.items[?(@.id==\"/activity-13843\" && @.name!=\"File Event\")])")
			s, er := eval.EvalInt(context.Background(), jsonData)
			So(er, ShouldBeNil)
			So(s, ShouldEqual, 0)
		}

	})

}

func TestBleveQueryToJSONPathOneField(t *testing.T) {

	Convey("Test JsonPath - Actual Data", t, func() {
		var jsonData map[string]interface{}
		er := json.Unmarshal([]byte(activities), &jsonData)
		So(er, ShouldBeNil)
		acJson := jsonData["items"].([]interface{})[0]
		So(acJson, ShouldNotBeNil)
		{
			eval, _, er := BleveQueryToJSONPath("id:\"*activity*\"", "$", false, id, true)
			So(er, ShouldBeNil)
			So(eval, ShouldNotBeNil)
			//So(jpath, ShouldEqual, "length($[?(@.id==\"/activity-13843\")])")
			s, er := eval(context.Background(), []interface{}{acJson})
			So(er, ShouldBeNil)
			So(s, ShouldEqual, 1)
		}

		{
			eval, p, er := BleveQueryToJSONPath("updatedTS:>=1715866720", "$", false, id, true)
			t.Log(p)
			So(er, ShouldBeNil)
			So(eval, ShouldNotBeNil)
			//So(jpath, ShouldEqual, "length($[?(@.id==\"/activity-13843\")])")
			s, er := eval(context.Background(), []interface{}{acJson})
			So(er, ShouldBeNil)
			So(s, ShouldEqual, 1)
		}

	})

}

var (
	activities = `
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Collection",
  "items": [
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "type": "Read",
      "id": "/activity-13843",
      "name": "File Event",
      "summary": "Répertoire [accounting-2019](doc://c6592312-d7c1-45fe-a283-93eee6e53e44) a été accédé par [guillaume](user://guillaume)",
      "updated": "2024-05-16T15:38:47Z",
	  "updatedTS": 1715866728,
      "actor": {
        "type": "Person",
        "id": "guillaume",
        "name": "guillaume"
      },
      "object": {
        "type": "Folder",
        "id": "c6592312-d7c1-45fe-a283-93eee6e53e44",
        "name": "accounting-2019/",
        "partOf": {
          "type": "Collection",
          "items": [
            {
              "type": "Workspace",
              "id": "e8a14392-9590-11e9-ae5d-de1a3425900a",
              "name": "Comptabilité",
              "rel": "accounting-2019/"
            },
            {
              "type": "Workspace",
              "id": "715ad095-5304-11e9-bf7d-de1a3425900a",
              "name": "Team",
              "rel": "team/COMPTA"
            },
            {
              "type": "Workspace",
              "id": "1c74865f-0a0e-11e9-83c6-de1a3425900a",
              "name": "Account",
              "rel": "account/Team/COMPTA"
            }
          ]
        }
      }
    },
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "type": "Read",
      "id": "/activity-13837",
      "name": "File Event",
      "summary": "Document [Bulletin 2023.pdf](doc://35bd484c-2dfb-4d8b-81b2-d72ba0f229ff) a été accédé par [ca43646e0b6d4e6f](user://ca43646e0b6d4e6f)",
      "updated": "2024-05-07T15:08:38Z",
      "actor": {
        "type": "Person",
        "id": "ca43646e0b6d4e6f",
        "name": "ca43646e0b6d4e6f"
      },
      "object": {
        "type": "Document",
        "id": "35bd484c-2dfb-4d8b-81b2-d72ba0f229ff",
        "name": "Engineering/2023/Bulletin 2023.pdf",
        "partOf": {
          "type": "Collection",
          "items": [
            {
              "type": "Workspace",
              "id": "1c74865f-0a0e-11e9-83c6-de1a3425900a",
              "name": "Account",
              "rel": "Engineering/2023/Bulletin 2023.pdf"
            }
          ]
        }
      }
    }
  ],
  "totalItems": 2
}
`
)
