package permissions

import (
	"context"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestRunJavaScript(t *testing.T) {
	Convey("Test RunJavascript expect string", t, func() {
		script := `Path = "test/" + User.Name;`
		in := map[string]interface{}{
			"User": map[string]interface{}{
				"Name": "john",
			},
		}
		out := map[string]interface{}{
			"Path": "",
		}
		e := RunJavaScript(context.Background(), script, in, out)
		So(e, ShouldBeNil)
		So(out["Path"], ShouldEqual, "test/john")
	})
	Convey("Test RunJavascript expect bool", t, func() {
		script := `bVal = User.Name === "john";`
		in := map[string]interface{}{
			"User": map[string]interface{}{
				"Name": "john",
			},
		}
		out := map[string]interface{}{
			"bVal": false,
		}
		e := RunJavaScript(context.Background(), script, in, out)
		So(e, ShouldBeNil)
		So(out["bVal"], ShouldBeTrue)
	})
	Convey("Test unexpected output format", t, func() {
		script := `bVal = User.Name === "john";`
		in := map[string]interface{}{
			"User": map[string]interface{}{
				"Name": "john",
			},
		}
		out := map[string]interface{}{
			"bVal": 18,
		}
		e := RunJavaScript(context.Background(), script, in, out)
		So(e, ShouldNotBeNil)
	})
	Convey("Test invalid Javascript", t, func() {
		script := `Value = User/Name === john;`
		in := map[string]interface{}{
			"User": map[string]interface{}{
				"Name": "john",
			},
		}
		out := map[string]interface{}{
			"Value": false,
		}
		e := RunJavaScript(context.Background(), script, in, out)
		So(e, ShouldNotBeNil)
	})
}
