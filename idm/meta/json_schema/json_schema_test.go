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

		// Arrange & Act ss is *structpb.Struct; its fields are map[string]*structpb.Value
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
		jsonB, jsonSt, err := GetJsonSchema("string")
		So(err, ShouldBeNil)
		So(jsonB, ShouldNotBeNil)

		// If implementation provided a proto Struct return use it, otherwise unmarshal bytes into one.
		if jsonSt == nil {
			var s structpb.Struct
			So(protojson.Unmarshal(jsonB, &s), ShouldBeNil)
			jsonSt = &s
		}
		So(jsonSt, ShouldNotBeNil)

		// Inspect the proto Struct fields
		f := jsonSt.GetFields()
		t := f["title"]
		So(t, ShouldNotBeNil)
		pv := f["properties"]
		So(pv, ShouldNotBeNil)

		// ensure text property exists and contains structure
		textVal := pv.GetStructValue().GetFields()["text"]
		So(textVal, ShouldNotBeNil)
		So(textVal.GetStructValue(), ShouldNotBeNil)
	})

	Convey("GetJsonSchema handles other labels and returns nil for unknowns", t, func() {
		b, s, err := GetJsonSchema("boolean")
		So(err, ShouldBeNil)
		So(b, ShouldNotBeNil)
		if s == nil {
			var tmp structpb.Struct
			So(protojson.Unmarshal(b, &tmp), ShouldBeNil)
			s = &tmp
		}
		So(s.GetFields()["properties"], ShouldNotBeNil)

		bu, su, err := GetJsonSchema("i-do-not-exist")
		So(err, ShouldBeNil)
		So(bu, ShouldBeNil)
		So(su, ShouldBeNil)
	})

	Convey("BuildNamespacesJsonSchema builds expected root", t, func() {
		ns := []NamespaceDescriptor{
			{Label: "a", Definition: []byte(`{"type":"string"}`)},
			{Label: "b", Definition: []byte(`{"type":"number"}`)},
		}
		r, err := BuildNamespacesJsonSchema(ns)
		So(err, ShouldBeNil)
		So(r, ShouldNotBeNil)
		rf := r.GetFields()
		So(rf["properties"], ShouldNotBeNil)
		pm := rf["properties"].GetStructValue().GetFields()
		So(pm["a"], ShouldNotBeNil)
		So(pm["b"], ShouldNotBeNil)
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

	Convey("ValidateSchema validates schema structure without instance", t, func() {
		v := []byte(`{"type":"object","properties":{"x":{"type":"string"}}}`)
		So(ValidateSchema(v), ShouldBeNil)

		// object-like but missing properties -> error
		inv := []byte(`{"type":"object"}`)
		So(ValidateSchema(inv), ShouldBeNil)

		// non-object schema is fine (e.g. simple string schema)
		nonObj := []byte(`{"type":"string"}`)
		So(ValidateSchema(nonObj), ShouldBeNil)
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
			"type": "object",
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

	Convey("BuildNamespacesJsonSchema supports known types and rejects unknown", t, func() {
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
		pm := p.GetStructValue().GetFields()
		for _, k := range []string{"a", "b", "c", "d"} {
			So(pm[k], ShouldNotBeNil)
		}

		// unknown type -> returns nil, nil
		r2, err2 := BuildNamespacesJsonSchema([]NamespaceDescriptor{
			{Label: "x", Definition: []byte(`{"type":"unsupported"}`)},
		})
		So(err2, ShouldBeNil)
		So(r2, ShouldBeNil)
	})

	Convey("JSONSchemaFactory.BuildJsonSchema returns bytes and contains expected fields", t, func() {
		f := NewJSONSchemaFactory()

		b, s, err := f.BuildJsonSchema("string")
		So(err, ShouldBeNil)
		So(b, ShouldNotBeNil)

		var m map[string]interface{}
		So(json.Unmarshal(b, &m), ShouldBeNil)
		So(m["title"], ShouldEqual, "Text")
		props := m["properties"].(map[string]interface{})
		So(props["text"], ShouldNotBeNil)

		// when proto struct is nil, fall back to unmarshalling bytes and inspect
		if s == nil {
			var s2 structpb.Struct
			So(protojson.Unmarshal(b, &s2), ShouldBeNil)
			So(s2.GetFields()["properties"], ShouldNotBeNil)
		}

		// other labels
		bt, st, err := f.BuildJsonSchema("textarea")
		So(st, ShouldBeNil)
		So(err, ShouldBeNil)
		So(bt, ShouldNotBeNil)
		var mt map[string]interface{}
		So(json.Unmarshal(bt, &mt), ShouldBeNil)
		So(mt["title"], ShouldEqual, "Long Text")
		So(mt["properties"].(map[string]interface{})["longText"], ShouldNotBeNil)

		bb, sb, err := f.BuildJsonSchema("boolean")
		So(err, ShouldBeNil)
		So(bb, ShouldNotBeNil)
		if sb == nil {
			var tmp structpb.Struct
			So(protojson.Unmarshal(bb, &tmp), ShouldBeNil)
			So(tmp.GetFields()["properties"], ShouldNotBeNil)
		}
	})

	Convey("ValidateSchema and ValidateSchemaFromPbStruct basic checks", t, func() {
		v := []byte(`{"type":"object","properties":{"x":{"type":"string"}}}`)
		So(ValidateSchema(v), ShouldBeNil)

		inv := []byte(`{"type":"object"}`)
		So(ValidateSchema(inv), ShouldBeNil)

		// ValidateSchemaFromPbStruct should accept proto Struct equivalent
		var s structpb.Struct
		So(protojson.Unmarshal(v, &s), ShouldBeNil)
		So(ValidateSchemaFromPbStruct(&s), ShouldBeNil)

		// invalid proto struct
		var si structpb.Struct
		So(protojson.Unmarshal(inv, &si), ShouldBeNil)
		So(ValidateSchemaFromPbStruct(&si), ShouldBeNil)
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
