package json_schema

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestMetaAndJsonSchemas(t *testing.T) {
	Convey("Meta schema for string contains expected properties", t, func() {
		ss := GetMetaSchema("string")
		So(ss, ShouldNotBeNil)

		fs := ss.GetFields()
		ps, ok := fs["properties"]
		So(ok, ShouldBeTrue)
		So(ps, ShouldNotBeNil)
		So(ps.GetStructValue(), ShouldNotBeNil)

		ks := ps.GetStructValue().GetFields()
		for _, k := range []string{"minLength", "maxLength", "pattern", "format"} {
			So(ks[k], ShouldNotBeNil)
		}
	})

	Convey("Meta schema for number and array expose numeric/array constraints", t, func() {
		sn := GetMetaSchema("number")
		So(sn, ShouldNotBeNil)

		fn := sn.GetFields()
		pn := fn["properties"]

		So(pn.GetStructValue(), ShouldNotBeNil)
		p := pn.GetStructValue().GetFields()
		for _, k := range []string{"minimum", "maximum"} {
			So(p[k], ShouldNotBeNil)
		}

		sa := GetMetaSchema("array")
		So(sa, ShouldNotBeNil)

		fa := sa.GetFields()
		pnp := fa["properties"]
		So(pnp.GetStructValue(), ShouldNotBeNil)

		msp := pnp.GetStructValue().GetFields()
		for _, k := range []string{"items", "minItems", "maxItems", "uniqueItems"} {
			So(msp[k], ShouldNotBeNil)
		}
	})

	Convey("JSON schema for string (text) and boolean contain expected keys", t, func() {
		ss := GetJsonSchema("string")
		So(ss, ShouldNotBeNil)

		fs := ss.GetFields()
		So(fs["title"], ShouldNotBeNil)
		So(fs["$id"], ShouldNotBeNil)

		ps := fs["properties"]
		So(ps.GetStructValue(), ShouldNotBeNil)

		props := ps.GetStructValue().GetFields()
		t := props["text"]
		So(t, ShouldNotBeNil)
		So(t.GetStructValue(), ShouldNotBeNil)

		tms := t.GetStructValue().GetFields()
		for _, k := range []string{"minLength", "maxLength", "pattern", "format", "default"} {
			So(tms[k], ShouldNotBeNil)
		}

		sb := GetJsonSchema("boolean")
		So(sb, ShouldNotBeNil)

		fb := sb.GetFields()
		pb := fb["properties"]
		So(pb.GetStructValue(), ShouldNotBeNil)

		pbp := pb.GetStructValue().GetFields()
		So(pbp["boolean"], ShouldNotBeNil)
	})

	Convey("JSON schema date and integer mapping", t, func() {
		sd := GetJsonSchema("date")
		So(sd, ShouldNotBeNil)

		fd := sd.GetFields()
		pd := fd["properties"]
		So(pd.GetStructValue(), ShouldNotBeNil)

		pdp := pd.GetStructValue().GetFields()
		dv := pdp["dateTime"]
		So(dv, ShouldNotBeNil)
		So(dv.GetStructValue().GetFields()["format"].GetStringValue(), ShouldEqual, "date-time")

		si := GetJsonSchema("integer")
		So(si, ShouldNotBeNil)

		fi := si.GetFields()
		pi := fi["properties"]
		So(pi.GetStructValue(), ShouldNotBeNil)

		pip := pi.GetStructValue().GetFields()
		So(pip["number"], ShouldNotBeNil)
	})

	Convey("LegacyTypeToLabel behavior", t, func() {
		j := []byte(`{"type":"string"}`)
		So(LegacyTypeToLabel(j), ShouldEqual, "string")
		So(LegacyTypeToLabel([]byte{}), ShouldEqual, "")
		So(LegacyTypeToLabel([]byte("not-json")), ShouldEqual, "")
	})
}
