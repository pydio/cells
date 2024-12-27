package configx

import (
	"fmt"
	"net/http"
	"strings"
	"sync"
	"testing"

	"github.com/pydio/cells/v5/common/config/revisions"
	"github.com/pydio/cells/v5/common/proto/docstore"
	"github.com/pydio/cells/v5/common/utils/std"

	. "github.com/smartystreets/goconvey/convey"
)

func TestMerge(t *testing.T) {
	a := []any{0, map[string]any{"1": 1}, 3, []any{}, []any{-1, 5}}
	b := []any{nil, 1, 2, 3, []any{4, nil, 6}}

	Convey("Testing merge", t, func() {
		c, err := merge(a, b)
		So(err, ShouldBeNil)
		So(c, ShouldHaveSameTypeAs, a)
	})
}

func TestMergeDelete(t *testing.T) {
	a := map[string]any{"1": 1}
	b := map[string]any{"1": nil}

	Convey("Testing merge", t, func() {
		c, err := merge(a, b)
		So(err, ShouldBeNil)
		So(c, ShouldHaveSameTypeAs, a)

		fmt.Println(c)
	})
}

func TestMergeSlices(t *testing.T) {
	a := []any{0, nil, 3, 3, []any{-1, 5}}
	b := []any{nil, 1, 2, nil, []any{4, nil, 6}}

	Convey("Testing merge slices", t, func() {
		c, err := merge(a, b)
		So(err, ShouldBeNil)
		So(c, ShouldHaveSameTypeAs, a)
	})
}

func TestMergeMaps(t *testing.T) {
	a := map[string]any{
		"0": 0,
		"2": map[string]any{
			"4": "0",
			"5": "5",
		},
	}

	b := map[string]any{
		"1": "1",
		"2": map[string]any{
			"3": "3",
			"4": "4",
			"6": "6",
		},
	}

	Convey("Testing merge", t, func() {
		c, err := merge(a, b)
		So(err, ShouldBeNil)
		So(c, ShouldHaveSameTypeAs, a)
	})
}

func TestCopy(t *testing.T) {

	a := map[string]any{
		"test": map[string]any{
			"test0": "test0_1",
		},
	}

	b := map[string]any{
		"test": map[string]any{
			"test1": "test0_1",
		},
	}

	Convey("Testing merge", t, func() {
		c, err := merge(a, b)
		So(err, ShouldBeNil)
		So(c, ShouldHaveSameTypeAs, a)
	})
}

// TODO - references are not in configx anymore
//func TestSetting(t *testing.T) {
//
//	Convey("Testing reference pool", t, func() {
//		r2 := New(WithJSON())
//		if err := r2.Set([]byte(`{"refparam2":"refvalue2"}`)); err != nil {
//			panic(err)
//		}
//
//		rp2, _ := openurl.OpenPool(context.Background(), []string{""}, func(ctx context.Context, u string) (Values, error) {
//			return r2, nil
//		})
//
//		r1 := New(WithJSON(), WithReferencePool("rp", rp2))
//		if err := r1.Set([]byte(`{"refparam1":{"$ref": "rp#/refparam2"}}`)); err != nil {
//			panic(err)
//		}
//
//		rp1, _ := openurl.OpenPool(context.Background(), []string{""}, func(ctx context.Context, u string) (Values, error) {
//			return r1, nil
//		})
//
//		c := New(WithJSON(), WithReferencePool("test1", rp1))
//
//		c.Val("test").Set("test")
//		c.Val("test[1]").Set("test")
//		c.Val("test[0][1]").Set("test")
//		c.Val("test[0][2]").Set(map[string]string{
//			"$ref": "test1#/refparam1",
//		})
//
//		So(c.Val("test[0][1]").String(), ShouldEqual, "test")
//		So(c.Val("test[0][2]").String(), ShouldEqual, "refvalue2")
//
//		fmt.Println("Starting replacement here ")
//		c.Val("test[0][2]").Set("newrefvalue1")
//
//		spew.Dump(r2.Get())
//		spew.Dump(r1.Get())
//		spew.Dump(c.Get())
//	})
//}

func TestMem(t *testing.T) {
	c := New()
	err := c.Val("whatever").Set(&http.Client{})

	Convey("Testing merge", t, func() {
		So(err, ShouldBeNil)
		So(c.Val("whatever").Get(), ShouldHaveSameTypeAs, &http.Client{})
	})
}

// TODO
//func TestBinary(t *testing.T) {
//	c := New(WithBinary())
//
//	err := c.Set(map[string]string{
//		"param1": "param1",
//	})
//
//	if err != nil {
//		panic(err)
//	}
//
//	fmt.Println(c)
//
//	err = c.Set(struct {
//		Param1 string
//	}{"structparam1"})
//
//	if err != nil {
//		panic(err)
//	}
//
//	fmt.Println(c)
//}

//func TestDefaultVal(t *testing.T) {
//	Convey("Test default", t, func() {
//
//		c := New(WithJSON())
//		if err := c.Set([]byte(`{
//			"param1": "param1"
//		}`)); err != nil {
//			So(err, ShouldBeNil)
//		}
//
//		So(c.Val("param1").Default("default1").String(), ShouldEqual, "param1")
//	})
//}

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
			"@value": "default",
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
			}],
			"toDelete1": true,
			"toDelete2": true,
			"protoMessage":{
				"ID":"DocId",
				"Type":"JSON",
				"Owner":"DocOwner"
			}
		}
	}`)
)

func TestStd(t *testing.T) {
	Convey("Testing map get", t, func() {
		m := New(WithJSON())
		err := m.Set(data)
		So(err, ShouldBeNil)

		So(m.Val("service").Get(), ShouldNotBeNil)
		So(m.Val("fakeservice").Get(), ShouldBeNil)

		So(m.Val("service/val").String(), ShouldEqual, "test")
		So(m.Val("service/val").String(), ShouldEqual, "test")
		// So(m.Val("service/@value").Get().String(), ShouldEqual, "test")
		// So(m.Val("service", "@value").Get().String(), ShouldEqual, "test")
		So(m.Val("service/fakeval").Get(), ShouldBeNil)

		So(m.Val("service").Val("val").Default("").String(), ShouldEqual, "test")

		So(m.Val("frontend", "plugin", "gui.ajax", "CLIENT_TIMEOUT").Default(24).Int(), ShouldEqual, 24)

		So(m.Val("service/array"), ShouldNotBeNil)
		So(m.Val("service/array[1]").Int(), ShouldEqual, 2)
		So(m.Val("service/array[1]").Int(), ShouldEqual, 2)
		So(m.Val("service/array[5]").Get(), ShouldBeNil)

		So(m.Val("service/array[1]").Int(), ShouldEqual, 2)
		So(m.Val("service/array[1][2]").Get(), ShouldBeNil)
		So(m.Val("service/array[1][2]").Get(), ShouldBeNil)

		So(m.Val("service/arrayMap[0]/val").String(), ShouldEqual, "test")
		So(m.Val("service/arrayMap[0]/fakeval").Get(), ShouldBeNil)
		So(m.Val("service/arrayMap[1]/val").Get(), ShouldBeNil)
		So(m.Val("service/arrayMap[0]/map/val").String(), ShouldEqual, "test")
		So(m.Val("service/arrayMap[0]/map[val]").String(), ShouldEqual, "test")

		// m.Val("service/toDelete1").Del()
		// m.Val("service/toDelete2").Del()
	})

	Convey("Testing map full set", t, func() {
		m := New(WithJSON())

		err := m.Set(data)
		So(err, ShouldBeNil)

		So(m.Val("service").Get(), ShouldNotBeNil)
		So(m.Val("fakeservice").Get(), ShouldBeNil)

		So(m.Val("service/val").String(), ShouldEqual, "test")
		So(m.Val("service/val").String(), ShouldEqual, "test")
		So(m.Val("service/fakeval").Get(), ShouldBeNil)

		So(m.Val("service/array"), ShouldNotBeNil)
		So(m.Val("service/array[1]").Int(), ShouldEqual, 2)
		So(m.Val("service/array[1]").Int(), ShouldEqual, 2)
		So(m.Val("service/array[1][2]").Get(), ShouldBeNil)

		So(m.Val("service/array[1]").Int(), ShouldEqual, 2)
		So(m.Val("service/array[1][2]").Get(), ShouldBeNil)
		So(m.Val("service/array[1][2]").Get(), ShouldBeNil)

		So(m.Val("service/arrayMap[0]/val").String(), ShouldEqual, "test")
		So(m.Val("service/arrayMap[0]/fakeval").Get(), ShouldBeNil)
		So(m.Val("service/arrayMap[1]/val").Get(), ShouldBeNil)
		So(m.Val("service/arrayMap[0]/map/val").String(), ShouldEqual, "test")
		So(m.Val("service/arrayMap[0]/map[val]").String(), ShouldEqual, "test")
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
		So(m.Val("service/fakemap/val").String(), ShouldEqual, "test")

		So(m.Val("service/fakemap2/fakemap2map/val").Set("test"), ShouldBeNil) // Should not throw an error
		So(m.Val("service/fakemap2/fakemap2map/val").String(), ShouldEqual, "test")

		So(m.Val("service/map/val2").Set("test3"), ShouldBeNil) // Should not throw an error
		So(m.Val("service/map/val2").String(), ShouldEqual, "test3")

		So(m.Val("service/map2").Set(make(map[string]interface{})), ShouldBeNil)
		So(m.Val("service/map2/val").Set("test"), ShouldBeNil)
		So(m.Val("service/map2/val").String(), ShouldEqual, "test")
		So(m.Val("service/array2").Set(make([]interface{}, 2)), ShouldBeNil)
		So(m.Val("service/array2[0]").Set("test"), ShouldBeNil) // Array should have int index
		So(m.Val("service/array2[0]").String(), ShouldEqual, "test")
		So(m.Val("service/array2[1]").Set(map[string]interface{}{
			"val": "test",
		}), ShouldBeNil)
		So(m.Val("service/array2[1]/val").String(), ShouldEqual, "test")
		So(m.Val("service/array2[1]/val2").Set("test2"), ShouldBeNil)
		So(m.Val("service/array2[1]/val2").String(), ShouldEqual, "test2")
		So(m.Val("service/array2").Set([]string{"test", "whatever"}), ShouldBeNil)
		So(m.Val("service/array2").StringArray(), ShouldResemble, []string{"test", "whatever"})
	})

	Convey("Testing default get", t, func() {
		m := New(WithJSON())
		err := m.Set(data)
		So(err, ShouldBeNil)

		So(m.Val("service/val").Default("").String(), ShouldEqual, "test")
		So(m.Val("service/fakeval").Default("").String(), ShouldEqual, "")
		So(m.Val("service/array[1]").Default(0).Int(), ShouldEqual, 2)
		So(m.Val("service/array[5]").Default(24).Int(), ShouldEqual, 24)
		So(m.Val("service/array[5]").Default(0).Int(), ShouldEqual, 0)
		So(m.Val("service/array[fakeval]").Default(0).Int(), ShouldEqual, 0)
	})
}

var (
	dataArray = []byte(`[{"Id":0,"Date":"2021-04-19T15:26:56.276288+02:00","User":"pydio.system.user","Log":"Import done","Data":{"databases":{"bc1ffe07aa51180396883a100ca989df3e3430e8":{"driver":"mysql","dsn":"root@tcp(localhost:3306)/cells?parseTime=true"},"pydio.grpc.activity":{"driver":"boltdb","dsn":"/Users/ghecquet/Library/Application Support/Pydio/cells/services/pydio.grpc.activity/activities.db"},"pydio.grpc.chat":{"driver":"boltdb","dsn":"/Users/ghecquet/Library/Application Support/Pydio/cells/services/pydio.grpc.chat/chat.db"}},"defaults":{"database":{"$ref":"#/databases/bc1ffe07aa51180396883a100ca989df3e3430e8"},"update":{"publicKey":"-----BEGIN PUBLIC KEY-----\nMIIBCgKCAQEAwh/ofjZTITlQc4h/qDZMR3RquBxlG7UTunDKLG85JQwRtU7EL90v\nlWxamkpSQsaPeqho5Q6OGkhJvZkbWsLBJv6LZg+SBhk6ZSPxihD+Kfx8AwCcWZ46\nDTpKpw+mYnkNH1YEAedaSfJM8d1fyU1YZ+WM3P/j1wTnUGRgebK9y70dqZEo2dOK\nn98v3kBP7uEN9eP/wig63RdmChjCpPb5gK1/WKnY4NFLQ60rPAOBsXurxikc9N/3\nEvbIB/1vQNqm7yEwXk8LlOC6Fp8W/6A0DIxr2BnZAJntMuH2ulUfhJgw0yJalMNF\nDR0QNzGVktdLOEeSe8BSrASe9uZY2SDbTwIDAQAB\n-----END PUBLIC KEY-----","updateUrl":"https://updatecells.pydio.com/"}},"frontend":{"plugin":{"editor.libreoffice":{"LIBREOFFICE_HOST":"localhost","LIBREOFFICE_PORT":"9980","LIBREOFFICE_SSL":true}},"secureHeaders":{"X-XSS-Protection":"1; mode=block"}},"ports":{"nats":4222},"services":{"pydio.docstore-binaries":{"bucket":"binaries","datasource":"default"},"pydio.grpc.acl":{"dsn":"default"},"pydio.grpc.changes":{"dsn":"default"},"pydio.grpc.config":{"dsn":"default"},"pydio.grpc.data-key":{"dsn":"default"},"pydio.grpc.mailer":{"queue":{"@value":"boltdb"},"sender":{"@value":"smtp","host":"my.smtp.server","password":"","port":465,"user":"name"}},"pydio.grpc.meta":{"dsn":"default"},"pydio.grpc.policy":{"dsn":"databaseParseTime"},"pydio.grpc.role":{"dsn":"default"},"pydio.grpc.search":{"basenameAnalyzer":"standard","contentAnalyzer":"en","indexContent":false},"pydio.grpc.tasks":{"fork":true},"pydio.grpc.tree":{"dsn":"default"},"pydio.grpc.update":{"channel":"stable"},"pydio.grpc.user":{"dsn":"default","tables":{"attributes":"idm_user_attributes","nodes":"idm_user_nodes","roles":"idm_user_roles","tree":"idm_user_tree"}},"pydio.grpc.user-key":{"dsn":"default"},"pydio.grpc.user-meta":{"dsn":"default"},"pydio.grpc.workspace":{"dsn":"default"},"pydio.thumbs_store":{"bucket":"thumbs","datasource":"default"},"pydio.versions-store":{"bucket":"versions","datasource":"default"},"pydio.web.oauth":{"connectors":[{"id":"pydio","name":"Pydio Cells","type":"pydio"}],"cors":{"public":{"allowedOrigins":"*"}},"staticClients":[{"client_id":"cells-frontend","client_name":"CellsFrontend Application","grant_types":["authorization_code","refresh_token"],"post_logout_redirect_uris":["#default_bind#/auth/logout"],"redirect_uris":["#default_bind#/auth/callback"],"response_types":["code","token","id_token"],"revokeRefreshTokenAfterInactivity":"2h","scope":"openid email profile pydio offline"},{"client_id":"cells-sync","client_name":"CellsSync Application","grant_types":["authorization_code","refresh_token"],"redirect_uris":["http://localhost:3000/servers/callback","http://localhost:[3636-3666]/servers/callback"],"response_types":["code","token","id_token"],"scope":"openid email profile pydio offline"},{"client_id":"cells-client","client_name":"Cells Client CLI Tool","grant_types":["authorization_code","refresh_token"],"redirect_uris":["http://localhost:3000/servers/callback","#binds...#/oauth2/oob"],"response_types":["code","token","id_token"],"scope":"openid email profile pydio offline"},{"client_id":"cells-mobile","client_name":"Mobile Applications","grant_types":["authorization_code","refresh_token"],"redirect_uris":["cellsauth://callback"],"response_types":["code","token","id_token"],"scope":"openid email profile pydio offline"}]}},"version":"2.3.0-dev"}}]`)
)

func TestArray(t *testing.T) {
	Convey("Testing array get", t, func() {
		m := New(WithJSON())

		err := m.Set(dataArray)
		So(err, ShouldBeNil)

		So(m.Val("[0]/User").String(), ShouldEqual, "pydio.system.user")

		var versions []*revisions.Version
		err2 := m.Scan(&versions)
		So(err2, ShouldBeNil)
		So(len(versions), ShouldEqual, 1)
	})
}

// TODO - not in here anymore
//func TestReference(t *testing.T) {
//	Convey("Testing reference", t, func() {
//		m := New(WithJSON())
//		err := m.Set(data)
//		So(err, ShouldBeNil)
//
//		So(m.Val("service/array").Val("#/defaults/val").String(), ShouldEqual, "test")
//
//		So(m.Val("service/pointerMap/val").String(), ShouldEqual, "test")
//		So(m.Val("service/pointerMap/val").Default("").String(), ShouldEqual, "test")
//		So(m.Val("service/pointerArray[0]").Default("").String(), ShouldEqual, "test2")
//
//		// So(m.Val("service/pointerMap/val2").Default(Reference("#/defaults/val2")).String(), ShouldEqual, "test2")
//
//		// So(m.Val("#/databases/wrongdefault").Default(Reference("#/defaults/val2")).String(), ShouldEqual, "test2")
//
//	})
//}

func TestGetSet(t *testing.T) {
	Convey("Testing get / set", t, func() {
		m := New(WithJSON())
		err := m.Set(data)
		So(err, ShouldBeNil)

		oldArray := m.Val("service/arrayMap")
		newArray := m.Val("service/newarrayMap")
		newArray.Set(oldArray.Get())
		oldArray.Del()

		So(oldArray.Get(), ShouldBeNil)
		So(newArray.Get(), ShouldNotBeNil)

		newArray.Val("[1]").Set(newArray.Val("[0]").Get())
		newArray.Val("[0]").Del()

		So(newArray.Val("[1]").Get(), ShouldNotBeNil)
		// TODO - should be working
		//So(newArray.Val("[0]").Get(), ShouldBeNil)
	})
}

func TestGetSetWithFunc(t *testing.T) {
	Convey("Testing get / set", t, func() {
		m := New(WithJSON())
		err := m.Set(data)
		So(err, ShouldBeNil)

		copy := func(c Values, old, new string) {
			o := c.Val(old)
			n := c.Val(new)
			n.Set(o)
			o.Del()
		}

		v := m.Val("service")
		copy(v, "array", "newArray")
		copy(v, "arrayMap", "newArrayMap")

		So(m.Val("service/array").Get(), ShouldBeNil)
		So(m.Val("service/arrayMap").Get(), ShouldBeNil)
		So(m.Val("service/newArray").Get(), ShouldNotBeNil)
		So(m.Val("service/newArrayMap").Get(), ShouldNotBeNil)
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

func TestScan(t *testing.T) {
	Convey("Testing reference", t, func() {
		m := New(WithJSON())

		i := New(WithJSON())

		err := m.Scan(&i)
		So(err, ShouldBeNil)
	})
}

func TestDefault(t *testing.T) {
	Convey("Testing reference", t, func() {
		So(strings.Join(std.StringToKeys("1/2/#/3"), "/"), ShouldEqual, "3")
		So(strings.Join(std.StringToKeys("1/2/#/3/#/4"), "/"), ShouldEqual, "4")
	})
}

func TestProtoScan(t *testing.T) {
	Convey("Test Proto Scan", t, func() {
		m := New(WithJSON())
		err := m.Set(data)
		So(err, ShouldBeNil)
		p := &docstore.Document{}
		e := m.Val("service/protoMessage").Scan(p)
		So(e, ShouldBeNil)
		So(p.ID, ShouldEqual, "DocId")
		So(p.Owner, ShouldEqual, "DocOwner")
		So(p.Type, ShouldEqual, docstore.DocumentType_JSON)
	})
}

var (
	dataYAML = []byte(`
---
defaults:
    key1: val1
    key2: val2

pointer:
    key1:
        $ref: "#/defaults/key2"
`)
)

func TestYAML(t *testing.T) {
	Convey("Testing yaml encoding", t, func() {
		m := New(WithYAML())
		err := m.Set(dataYAML)
		// m.Val("test").Set(Reference("#/defaults/key1"))
		So(err, ShouldBeNil)
		So(m.Val("defaults/key1").String(), ShouldEqual, "val1")
		// So(m.Val("pointer/key1").String(), ShouldEqual, "val2")
	})
}

func TestStringEncoding(t *testing.T) {
	Convey("Test string encoding", t, func() {
		m := New(WithString())
		err := m.Set("test")
		So(err, ShouldBeNil)
		So(m.String(), ShouldEqual, "test")
	})
}

func TestEncrypt(t *testing.T) {
	Convey("Testing encryption", t, func() {
		e := &mockEncDec{}
		m := New(WithYAML(), WithEncrypt(e), WithDecrypt(e))
		err := m.Set(dataYAML)
		So(err, ShouldBeNil)
		So(m.Val("secrets/test").Set("test"), ShouldBeNil)
	})
}

func TestStruct(t *testing.T) {
	Convey("Testing structure ", t, func() {
		m := New(WithJSON())

		t := struct {
			A string
			B string
		}{
			A: "a",
			B: "b",
		}

		err := m.Set(t)
		So(err, ShouldBeNil)

		So(m.Val("A").String(), ShouldEqual, "a")

		err2 := m.Val("C").Set("c")
		So(err2, ShouldBeNil)
		So(m.Val("A").String(), ShouldEqual, "a")
		So(m.Val("C").String(), ShouldEqual, "c")
	})
}

type MyStruct struct {
	A string
	B string
}

func TestMapStruct(t *testing.T) {
	Convey("Testing structure ", t, func() {
		m := New(WithJSON())

		err := m.Val("test").Set(&MyStruct{A: "a", B: "b"})
		So(err, ShouldBeNil)

		t2 := make(map[string]*MyStruct)
		err2 := m.Scan(t2)
		So(err2, ShouldBeNil)
	})
}

func TestSyncMap(t *testing.T) {
	Convey("Test synchronised map", t, func() {
		c := New(WithJSON())

		c.Set(map[string]interface{}{
			"test": &sync.Map{},
		})

		whatever1 := "whatever1"
		whatever2 := "whatever2"

		c.Val("test/testsyncmap").Set(&whatever1)
		c.Val("test/testsyncmap2").Set(&whatever2)

		clone := std.DeepClone(c.Get())

		o := New(WithJSON())
		o.Set(clone)

		whatever1 = "whatever3"
	})
}

// Testing the interfacing
type testconf struct {
	Values
}

func (c *testconf) Val(path ...string) Values {
	return c.Values.Val(path...)
}

func (c *testconf) Get() any {
	v := New()
	v.Val("whatever").Set("whatever")

	return v.Get()
}

// TODO
//func TestOverride(t *testing.T) {
//	c := &testconf{}
//	c.Values = New()
//
//	s := c.Val("whatever").Get()
//	Convey("Testing override", t, func() {
//		spew.Dump(c.Get())
//		So(s, ShouldEqual, "whatever")
//	})
//}

type implValuesOverride struct {
	k []string
	Values
}

func (i *implValuesOverride) Val(path ...string) Values {
	return &caster{
		Storer: &implValuesOverride{
			k:      std.StringToKeys(append(i.k, path...)...),
			Values: i.Values.Val(path...),
		},
	}
}

func (i *implValuesOverride) Default(def any) Values {
	return nil
}

func (i *implValuesOverride) Get(options ...WalkOption) any {
	i.Values.Get(WithInterceptor(func(i int, current any) (bool, any) {
		return true, current
	}))

	return "whatever"
}

func (i *implValuesOverride) Set(value any) error {
	return i.Values.Set(value)
}

func (i *implValuesOverride) Del() error {
	return i.Values.Del()
}

func TestStorer(t *testing.T) {
	v := &implValuesOverride{Values: New(WithJSON())}

	v.Val("whatever").Val("yessir").Val("Again").Set("whatever")

}
