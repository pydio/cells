package json_schema

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestBuildJsonSchema(t *testing.T) {
	Convey("BuildJsonSchema returns expected schemas for known labels", t, func() {
		cases := []struct {
			label   string
			propKey string
		}{
			{"Text", "text"},
			{"string", "text"},
			{"Number", "number"},
			{"number", "number"},
			{"Boolean", "boolean"},
			{"boolean", "boolean"},
			{"Date Or Time", "dateTime"},
			{"dateTime", "dateTime"},
			{"Tags", "tags"},
			{"tags", "tags"},
			{"Stars Rating", "starsRating"},
			{"starsrating", "starsRating"},
			{"Long Text", "longText"},
			{"longText", "longText"},
			{"Colors Labels", "colorLabels"},
			{"External Url", "externalUrl"},
		}

		for _, c := range cases {
			s := BuildJsonSchema(c.label)
			So(s, ShouldNotBeNil)

			m := s.AsMap()
			props, ok := m["properties"].(map[string]interface{})
			So(ok, ShouldBeTrue)
			So(props, ShouldContainKey, c.propKey)
			So(props[c.propKey], ShouldNotBeNil)
		}
	})

	Convey("BuildJsonSchema returns nil for unknown label", t, func() {
		s := BuildJsonSchema("this-does-not-exist")
		So(s, ShouldBeNil)
	})
}
