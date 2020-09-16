package configx

import (
	"encoding/json"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	data = []byte(`{
		"databases": {
			"default": {
			  "driver": "mysql",
			  "dsn": "root@tcp(localhost:3306)/cells?parseTime=true"
			}
		},
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
		var m config
		err := json.Unmarshal(data, &m)
		So(err, ShouldBeNil)

		So(m.Val("service").Get(), ShouldNotBeNil)
		So(m.Val("fakeservice").Get(), ShouldBeNil)

		So(m.Val("service/val").Get().String(), ShouldEqual, "test")
		So(m.Val("service/val").Get().String(), ShouldEqual, "test")
		So(m.Val("service/fakeval").Get(), ShouldBeNil)

		So(m.Val("service").Val("val").Default("").String(), ShouldEqual, "test")

		So(m.Val("frontend", "plugin", "gui.ajax", "CLIENT_TIMEOUT").Default(24).Int(), ShouldEqual, 24)

		So(m.Val("service/array"), ShouldNotBeNil)
		So(m.Val("service/array[1]").Get().Int(), ShouldEqual, 2)
		So(m.Val("service/array[1]").Get().Int(), ShouldEqual, 2)
		So(m.Val("service/array[5]").Get(), ShouldBeNil)

		So(m.Val("service/array[1]").Get().Int(), ShouldEqual, 2)
		So(m.Val("service/array[1][2]").Get(), ShouldBeNil)
		So(m.Val("service/array[1][2]").Get(), ShouldBeNil)

		So(m.Val("service/arrayMap[0]/val").Get().String(), ShouldEqual, "test")
		So(m.Val("service/arrayMap[0]/fakeval").Get(), ShouldBeNil)
		So(m.Val("service/arrayMap[1]/val").Get(), ShouldBeNil)
		So(m.Val("service/arrayMap[0]/map/val").Get().String(), ShouldEqual, "test")
		So(m.Val("service/arrayMap[0]/map[val]").Get().String(), ShouldEqual, "test")
	})

	Convey("Testing map full set", t, func() {
		m := New(WithJSON())

		err := m.Set(data)
		So(err, ShouldBeNil)

		So(m.Val("service").Get(), ShouldNotBeNil)
		So(m.Val("fakeservice").Get(), ShouldBeNil)

		So(m.Val("service/val").Get().String(), ShouldEqual, "test")
		So(m.Val("service/val").Get().String(), ShouldEqual, "test")
		So(m.Val("service/fakeval").Get(), ShouldBeNil)

		So(m.Val("service/array"), ShouldNotBeNil)
		So(m.Val("service/array[1]").Get().Int(), ShouldEqual, 2)
		So(m.Val("service/array[1]").Get().Int(), ShouldEqual, 2)
		So(m.Val("service/array[1][2]").Get(), ShouldBeNil)

		So(m.Val("service/array[1]").Get().Int(), ShouldEqual, 2)
		So(m.Val("service/array[1][2]").Get(), ShouldBeNil)
		So(m.Val("service/array[1][2]").Get(), ShouldBeNil)

		So(m.Val("service/arrayMap[0]/val").Get().String(), ShouldEqual, "test")
		So(m.Val("service/arrayMap[0]/fakeval").Get(), ShouldBeNil)
		So(m.Val("service/arrayMap[1]/val").Get(), ShouldBeNil)
		So(m.Val("service/arrayMap[0]/map/val").Get().String(), ShouldEqual, "test")
		So(m.Val("service/arrayMap[0]/map[val]").Get().String(), ShouldEqual, "test")
	})

	Convey("Testing replacing a string value", t, func() {
		m := New(WithJSON())

		err := m.Set(data)
		So(err, ShouldBeNil)

		// Replacing a value
		err = m.Val("service/map").Set(map[string]interface{}{
			"val2": "test2",
		})
		So(err, ShouldBeNil)

		type service struct {
			Servicebool bool `json:"bool,omitempty"`
		}

		// m.Val("service/struct").Set(&service{Servicebool: true})
		// So(m.Val("service/struct/bool").Bool(), ShouldBeTrue)

		// m.Val("service/struct").Set(&service{})
		// So(m.Val("service/struct/bool").Bool(), ShouldBeFalse)

		So(m.Val("service/fakemap/val").Set("test"), ShouldBeNil) // Should not throw an error
		So(m.Val("service/fakemap/val").Get().String(), ShouldEqual, "test")

		So(m.Val("service/fakemap2/fakemap2map/val").Set("test"), ShouldBeNil) // Should not throw an error
		So(m.Val("service/fakemap2/fakemap2map/val").Get().String(), ShouldEqual, "test")

		So(m.Val("service/map/val2").Set("test3"), ShouldBeNil) // Should not throw an error
		So(m.Val("service/map/val2").Get().String(), ShouldEqual, "test3")

		So(m.Val("service/map2").Set(make(map[string]interface{})), ShouldBeNil)
		So(m.Val("service/map2/val").Set("test"), ShouldBeNil)
		So(m.Val("service/map2/val").Get().String(), ShouldEqual, "test")
		So(m.Val("service/array2").Set(make([]interface{}, 2)), ShouldBeNil)
		So(m.Val("service/array2[val]").Set("test"), ShouldBeNil) // Array should have int index
		So(m.Val("service/array2[0]").Set("test"), ShouldBeNil)   // Array should have int index
		So(m.Val("service/array2[0]").Get().String(), ShouldEqual, "test")
		So(m.Val("service/array2[1]").Set(map[string]interface{}{
			"val": "test",
		}), ShouldBeNil)
		So(m.Val("service/array2[1]/val").Get().String(), ShouldEqual, "test")
		So(m.Val("service/array2[1]/val2").Set("test2"), ShouldBeNil)
		So(m.Val("service/array2[1]/val2").Get().String(), ShouldEqual, "test2")
		So(m.Val("service/array2").Set([]string{"test", "whatever"}), ShouldBeNil)
		So(m.Val("service/array2").StringArray(), ShouldResemble, []string{"test", "whatever"})
	})

	Convey("Testing default get", t, func() {
		var m config
		err := json.Unmarshal(data, &m)
		So(err, ShouldBeNil)

		So(m.Val("service/val").Default("").String(), ShouldEqual, "test")
		So(m.Val("service/fakeval").Default("").String(), ShouldEqual, "")
		So(m.Val("service/array[1]").Default(0).Int(), ShouldEqual, 2)
		So(m.Val("service/array[5]").Default(24).Int(), ShouldEqual, 24)
		So(m.Val("service/array[5]").Default(0).Int(), ShouldEqual, 0)
		So(m.Val("service/array[fakeval]").Default(0).Int(), ShouldEqual, 0)
	})
}

func TestMap(t *testing.T) {
	Convey("Testing map", t, func() {
		m := &config{}

		m.Val("newmap/test1").Set("test")
		m.Val("newmap/test2").Set("test2")

		So(m.Val("newmap/test1").String(), ShouldEqual, "test")
		So(m.Val("newmap/test2").String(), ShouldEqual, "test2")
		So(m.Val("newmap/test3").String(), ShouldEqual, "")
		So(m.Val("newmap/test3").Default("default").String(), ShouldEqual, "default")
	})
}

func TestReference(t *testing.T) {
	Convey("Testing reference", t, func() {
		var m config
		err := json.Unmarshal(data, &m)
		So(err, ShouldBeNil)

		So(m.Val("service/array").Val("#/defaults/val").String(), ShouldEqual, "test")

		So(m.Val("service/pointerMap/val").Get().String(), ShouldEqual, "test")
		So(m.Val("service/pointerMap/val").Default("").String(), ShouldEqual, "test")
		So(m.Val("service/pointerArray[0]").Default("").String(), ShouldEqual, "test2")

		So(m.Val("service/pointerMap/val2").Default(Reference("#/defaults/val2")).String(), ShouldEqual, "test2")

		So(m.Val("#/databases/wrongdefault").Default(Reference("#/databases/default")).StringMap(), ShouldEqual, "test2")
	})
}

func TestString(t *testing.T) {
	Convey("Testing reference", t, func() {
		m := New(WithJSON())

		err := m.Set(data)
		So(err, ShouldBeNil)

		So(m.String(), ShouldNotEqual, "")
	})
}
