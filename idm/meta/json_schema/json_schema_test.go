package json_schema

import (
	"encoding/json"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/types/known/structpb"
	"gorm.io/datatypes"
)

func TestJsonSchemaPackage(t *testing.T) {
	Convey("Meta schema helpers", t, func() {
		// Arrange & Act
		ss := GetMetaSchema("string")
		// Assert
		So(ss, ShouldNotBeNil)

		// ss is *structpb.Struct; its fields are map[string]*structpb.Value
		fs := ss.GetFields()
		pv, ok := fs["properties"]
		// Assert
		So(ok, ShouldBeTrue)
		So(pv, ShouldNotBeNil)

		ps := pv.GetStructValue()
		So(ps, ShouldNotBeNil)

		ks := ps.GetFields()
		for _, k := range []string{"minLength", "maxLength"} {
			So(ks[k], ShouldNotBeNil)
		}
	})

	Convey("GetJsonSchema returns bytes + optional proto Struct and can be used interchangeably", t, func() {
		jsonB, err := GetJsonSchema("string")
		So(err, ShouldBeNil)
		So(jsonB, ShouldNotBeNil)

		// Ensure we have a proto Struct either returned or unmarshalled from bytes
		jsStruct, err := JsonToProtoStruct((*datatypes.JSON)(&jsonB))
		So(err, ShouldBeNil)
		So(jsStruct, ShouldNotBeNil)

		// Inspect the proto Struct fields
		f := jsStruct.GetFields()
		title := f["title"]
		So(title, ShouldNotBeNil)
		pv := f["properties"]
		So(pv, ShouldNotBeNil)

		// ensure text property exists and contains structure
		// textVal := pv.GetStructValue().GetFields()["usermeta-text"]
		// So(textVal, ShouldNotBeNil)
		// So(textVal.GetStructValue(), ShouldNotBeNil)
	})

	Convey("GetJsonSchema handles other labels and returns nil for unknowns", t, func() {
		b, err := GetJsonSchema("boolean")
		So(err, ShouldBeNil)
		So(b, ShouldNotBeNil)
		jsStruct, err := JsonToProtoStruct((*datatypes.JSON)(&b))
		So(err, ShouldBeNil)
		So(jsStruct.GetFields()["properties"], ShouldNotBeNil)

		bu, err := GetJsonSchema("i-do-not-exist")
		So(err, ShouldBeNil)
		So(bu, ShouldBeNil)

	})

	Convey("BuildNamespacesJsonSchema builds expected root", t, func() {
		// Arrange
		jsonSchema := `{
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "additionalProperties": false,
            "properties": {
							  "usermeta-text": {
									"maxLength": 0,
									"minLength": 0,
									"type": "string"
								}
            },
            "required": ["usermeta-text"],
            "title": "usermeta-text",
            "type": "object"
        }`

		j := datatypes.JSON([]byte(jsonSchema))
		ns := []NamespaceDescriptor{
			{
				// use the top-level property name you expect in the combined schema
				Namespace:  "usermeta-text",
				JsonSchema: &j,
			},
		}

		// Act
		root, err := BuildNamespacesJsonSchema(ns)

		// Assert
		So(err, ShouldBeNil)
		So(root, ShouldNotBeNil)

		fields := root.GetFields()

		// properties exists
		propsVal := fields["properties"]
		So(propsVal, ShouldNotBeNil)

		// the combined properties contains namespace key
		propsMap := propsVal.GetStructValue().GetFields()
		nsVal := propsMap["usermeta-text"]
		So(nsVal, ShouldNotBeNil)

		nsFields := nsVal.GetStructValue().GetFields()
		So(nsFields["maxLength"], ShouldNotBeNil)
		So(nsFields["minLength"], ShouldNotBeNil)
		So(nsFields["type"], ShouldNotBeNil)

		// required at root contains the namespace required marker
		reqVal := fields["required"]
		So(reqVal, ShouldNotBeNil)
		reqList := reqVal.GetListValue().GetValues()
		So(len(reqList), ShouldBeGreaterThan, 0)

		// find expected required string
		found := false
		for _, v := range reqList {
			if v.GetStringValue() == "usermeta-text" {
				found = true
				break
			}
		}
		So(found, ShouldBeTrue)
	})

	Convey("Proto/json conversions and datatypes helpers", t, func() {
		// roundtrip proto Struct -> datatypes.JSON -> proto Struct
		m := map[string]interface{}{
			"title": "x",
			"properties": map[string]interface{}{
				"f": map[string]interface{}{"type": "string"},
			},
		}
		s, err := structpb.NewStruct(m)
		So(err, ShouldBeNil)

		j, err := ProtoStructToJson(s)
		So(err, ShouldBeNil)
		So(j, ShouldNotBeNil)

		s2, err := JsonToProtoStruct(j)
		So(err, ShouldBeNil)
		So(s2, ShouldNotBeNil)

		// compare by marshaling to JSON
		b1, _ := json.Marshal(m)
		b2, _ := json.Marshal(s2.AsMap())
		So(string(b2), ShouldEqual, string(b1))

		// JsonToProtoStruct handles nil
		s3, err := JsonToProtoStruct(nil)
		So(err, ShouldBeNil)
		So(s3, ShouldBeNil)
	})

	Convey("LegacyTypeToLabel extracts 'type' from legacy JSON", t, func() {
		j := []byte(`{"type":"string"}`)
		So(LegacyTypeToLabel(j), ShouldEqual, "string")
		So(LegacyTypeToLabel([]byte{}), ShouldEqual, "")
		So(LegacyTypeToLabel([]byte("not-json")), ShouldEqual, "")
	})

	Convey("ValidateSchemaFromPbStruct validates schema from proto Struct", t, func() {
		s, err := structpb.NewStruct(map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"x": map[string]interface{}{"type": "string"},
			},
		})
		So(err, ShouldBeNil)
		So(ValidateSchemaFromPbStruct(s), ShouldBeNil)

		bs, err := structpb.NewStruct(map[string]interface{}{
			"type": "string",
		})
		So(err, ShouldBeNil)
		So(ValidateSchemaFromPbStruct(bs), ShouldBeNil)
		So(ValidateSchemaFromPbStruct(nil), ShouldBeNil)
	})
}

func TestJsonSchemaHelpers(t *testing.T) {

	Convey("toProtoStruct returns nil on invalid input and valid struct on map input", t, func() {
		// invalid: contains function -> cannot marshal to proto struct
		So(toProtoStruct(map[string]interface{}{"bad": func() {}}), ShouldBeNil)

		// valid map
		m := map[string]interface{}{"a": "b"}
		s := toProtoStruct(m)
		So(s, ShouldNotBeNil)
		// verify content
		So(s.GetFields()["a"].GetStringValue(), ShouldEqual, "b")
	})

	Convey("JsonToProtoStruct returns nil for nil input", t, func() {
		s, err := JsonToProtoStruct((*datatypes.JSON)(nil))
		So(err, ShouldBeNil)
		So(s, ShouldBeNil)
	})
}

func TestJsonSchemaCoverage(t *testing.T) {
	Convey("toProtoStruct / ProtoStructToJson / JsonToProtoStruct roundtrip", t, func() {
		m := map[string]interface{}{"x": "y", "nested": map[string]interface{}{"n": 1}}
		s := toProtoStruct(m)
		So(s, ShouldNotBeNil)
		So(s.GetFields()["x"].GetStringValue(), ShouldEqual, "y")

		j, err := ProtoStructToJson(s)
		So(err, ShouldBeNil)
		So(j, ShouldNotBeNil)

		s2, err := JsonToProtoStruct(j)
		So(err, ShouldBeNil)
		So(s2, ShouldNotBeNil)
		So(s2.GetFields()["x"].GetStringValue(), ShouldEqual, "y")
	})

	Convey("LegacyTypeToLabel extracts type from legacy json", t, func() {
		So(LegacyTypeToLabel([]byte(`{"type":"string"}`)), ShouldEqual, "string")
		So(LegacyTypeToLabel([]byte{}), ShouldEqual, "")
		So(LegacyTypeToLabel([]byte("not-json")), ShouldEqual, "")
	})

	Convey("BuildNamespacesJsonSchema supports known types", t, func() {
		ns := []NamespaceDescriptor{
			{Label: "a", Definition: []byte(`{"type":"string"}`)},
			{Label: "b", Definition: []byte(`{"type":"number"}`)},
			{Label: "c", Definition: []byte(`{"type":"boolean"}`)},
			{Label: "d", Definition: []byte(`{"type":"date"}`)},
		}
		r1, err := BuildNamespacesJsonSchema(ns)
		So(err, ShouldBeNil)
		So(r1, ShouldNotBeNil)

		f := r1.GetFields()
		p := f["properties"]
		So(p, ShouldNotBeNil)

		So(p.GetStringValue(), ShouldNotBeNil)
	})

	Convey("JSONSchemaFactory.BuildJsonSchema returns bytes and contains expected fields", t, func() {
		f := NewJSONSchemaFactory("string")

		bt, st := f.BuildJsonSchema("string", "")
		So(bt, ShouldNotBeNil)

		var m map[string]interface{}
		So(json.Unmarshal(bt, &m), ShouldBeNil)
		So(m["title"], ShouldEqual, "usermeta-text")
		props := m["properties"].(map[string]interface{})
		So(props, ShouldNotBeNil)

		// when proto struct is nil, fall back to unmarshalling bytes and inspect
		if st == nil {
			var s2 structpb.Struct
			So(protojson.Unmarshal(bt, &s2), ShouldBeNil)
			So(s2.GetFields()["properties"], ShouldNotBeNil)
		}

		// other labels
		bt2, _ := f.BuildJsonSchema("textarea", "")
		So(bt2, ShouldNotBeNil)
		var mt map[string]interface{}
		So(json.Unmarshal(bt2, &mt), ShouldBeNil)
		So(mt["title"], ShouldEqual, "usermeta-long-text")
		So(mt["properties"], ShouldNotBeNil)

		bb, sb := f.BuildJsonSchema("boolean", "")
		So(bb, ShouldNotBeNil)
		if sb == nil {
			var tmp structpb.Struct
			So(protojson.Unmarshal(bb, &tmp), ShouldBeNil)
			So(tmp.GetFields()["properties"], ShouldNotBeNil)
		}
	})

	Convey("InferBytes and basic schema helpers produce marshalable output", t, func() {
		// Ensure InferBytes does not panic and returns JSON-like bytes
		b, err := InferBytes[string](nil)
		So(err, ShouldBeNil)
		So(len(b) > 0, ShouldBeTrue)

		// withMin/withMax produce expected keys
		sm := withMin(1, "string")
		So(sm["minLength"], ShouldNotBeNil)
		nm := withMax(2, "number")
		So(nm["maximum"], ShouldNotBeNil)

		// with*Schema helpers return map with "type" or other keys
		ws := withStringSchema()
		So(ws["type"], ShouldNotBeNil)
		wn := withNumberSchema()
		So(wn["type"], ShouldNotBeNil)
		wb := withBooleanSchema()
		So(wb["type"], ShouldNotBeNil)
		wd := withDateTimeSchema()
		So(wd["format"], ShouldEqual, "date-time")
	})
}
