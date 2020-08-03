package configx

import (
	"encoding/json"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	data = []byte(`{
		"defaults": {
			"val": "test",
			"val2": "test2"
		},
		"service": {
			"val": "test",
			"map": {
				"val": "test"
			},
			"array": [1,2,3,4],
			"arrayMap": [{
				"val": "test",
				"map": {
					"val": "test"
				}
			}],
			"pointerMap": {
				"val": {"$ref": "#/defaults/val"}
			},
			"pointerArray": [{
				"$ref": "#/defaults/val2"
			}]
		}
	}`)
)

func TestStd(t *testing.T) {
	Convey("Testing map get", t, func() {
		var m mymap
		err := json.Unmarshal(data, &m)
		So(err, ShouldBeNil)

		So(m.Values("service").Get(), ShouldNotBeNil)
		So(m.Values("fakeservice").Get(), ShouldBeNil)

		So(m.Values("service/val").Get().String(), ShouldEqual, "test")
		So(m.Values("service", "val").Get().String(), ShouldEqual, "test")
		So(m.Values("service", "fakeval").Get(), ShouldBeNil)

		So(m.Values("service", "array"), ShouldNotBeNil)
		So(m.Values("service", "array", "1").Get().Int(), ShouldEqual, 2)
		So(m.Values("service", "array", 1).Get().Int(), ShouldEqual, 2)
		So(m.Values("service", "array", 5).Get(), ShouldBeNil)

		So(m.Values("service/array[1]").Get().Int(), ShouldEqual, 2)
		So(m.Values("service/array[1][2]").Get(), ShouldBeNil)
		So(m.Values("service/array[1][2]").Get(), ShouldBeNil)

		So(m.Values("service/arrayMap[0]/val").Get().String(), ShouldEqual, "test")
		So(m.Values("service/arrayMap[0]/fakeval").Get(), ShouldBeNil)
		So(m.Values("service/arrayMap[1]/val").Get(), ShouldBeNil)
		So(m.Values("service/arrayMap[0]/map/val").Get().String(), ShouldEqual, "test")
		So(m.Values("service/arrayMap[0]/map[val]").Get().String(), ShouldEqual, "test")
	})

	Convey("Testing map full set", t, func() {
		var m mymap

		err := m.Set(data)
		So(err, ShouldBeNil)

		So(m.Values("service").Get(), ShouldNotBeNil)
		So(m.Values("fakeservice").Get(), ShouldBeNil)

		So(m.Values("service/val").Get().String(), ShouldEqual, "test")
		So(m.Values("service", "val").Get().String(), ShouldEqual, "test")
		So(m.Values("service", "fakeval").Get(), ShouldBeNil)

		So(m.Values("service", "array"), ShouldNotBeNil)
		So(m.Values("service", "array", "1").Get().Int(), ShouldEqual, 2)
		So(m.Values("service", "array", 1).Get().Int(), ShouldEqual, 2)
		So(m.Values("service", "array", 1, 2).Get(), ShouldBeNil)

		So(m.Values("service/array[1]").Get().Int(), ShouldEqual, 2)
		So(m.Values("service/array[1][2]").Get(), ShouldBeNil)
		So(m.Values("service/array[1][2]").Get(), ShouldBeNil)

		So(m.Values("service/arrayMap[0]/val").Get().String(), ShouldEqual, "test")
		So(m.Values("service/arrayMap[0]/fakeval").Get(), ShouldBeNil)
		So(m.Values("service/arrayMap[1]/val").Get(), ShouldBeNil)
		So(m.Values("service/arrayMap[0]/map/val").Get().String(), ShouldEqual, "test")
		So(m.Values("service/arrayMap[0]/map[val]").Get().String(), ShouldEqual, "test")
	})

	Convey("Testing replacing a string value", t, func() {
		var m mymap
		m.Set(data)

		// Replacing a value
		err := m.Values("service", "map").Set(map[string]interface{}{
			"val2": "test2",
		})
		So(err, ShouldBeNil)

		So(m.Values("service", "fakemap", "val").Set("test"), ShouldNotBeNil) // Should throw an error
		So(m.Values("service", "map", "val2").Set("test3"), ShouldBeNil)      // Should not throw an error
		So(m.Values("service", "map", "val2").Get().String(), ShouldEqual, "test3")

		So(m.Values("service", "map2").Set(make(map[string]interface{})), ShouldBeNil)
		So(m.Values("service", "map2", "val").Set("test"), ShouldBeNil)
		So(m.Values("service", "map2", "val").Get().String(), ShouldEqual, "test")
		So(m.Values("service", "array2").Set(make([]interface{}, 2)), ShouldBeNil)
		So(m.Values("service", "array2", "val").Set("test"), ShouldNotBeNil) // Array should have int index
		So(m.Values("service", "array2", "0").Set("test"), ShouldBeNil)      // Array should have int index
		So(m.Values("service", "array2", "0").Get().String(), ShouldEqual, "test")
		So(m.Values("service", "array2", "1").Set(map[string]interface{}{
			"val": "test",
		}), ShouldBeNil)
		So(m.Values("service", "array2", "1", "val").Get().String(), ShouldEqual, "test")
		So(m.Values("service", "array2", "1", "val2").Set("test2"), ShouldBeNil)
		So(m.Values("service", "array2", "1", "val2").Get().String(), ShouldEqual, "test2")
	})

	Convey("Testing default get", t, func() {
		var m mymap
		err := json.Unmarshal(data, &m)
		So(err, ShouldBeNil)

		So(m.Values("service/val").Default("").String(), ShouldEqual, "test")
		So(m.Values("service/fakeval").Default("").String(), ShouldEqual, "")
		So(m.Values("service/array[1]").Default(0).Int(), ShouldEqual, 2)
		So(m.Values("service/array[5]").Default(24).Int(), ShouldEqual, 24)
		So(m.Values("service/array[5]").Default(0).Int(), ShouldEqual, 0)
		So(m.Values("service/array[fakeval]").Default(0).Int(), ShouldEqual, 0)
	})
}

func TestReference(t *testing.T) {
	Convey("Testing reference", t, func() {
		var m mymap
		err := json.Unmarshal(data, &m)
		So(err, ShouldBeNil)

		So(m.Values("service/pointerMap/val").Get().String(), ShouldEqual, "test")
		So(m.Values("service/pointerMap/val").Default("").String(), ShouldEqual, "test")
		So(m.Values("service/pointerArray[0]").Default("").String(), ShouldEqual, "test2")

		So(m.Values("service/pointerMap/val2").Default(Reference("#/defaults/val2")).String(), ShouldEqual, "test2")
	})
}
