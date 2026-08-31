/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package grpc

import (
	"testing"

	"github.com/pydio/cells/v5/common/proto/idm"

	. "github.com/smartystreets/goconvey/convey"
)

func TestNewEvResolver(t *testing.T) {
	t.Parallel()

	Convey("NewEvResolver returns a non-nil resolver", t, func() {
		So(NewEvResolver(), ShouldNotBeNil)
	})
}

func TestNormalizeLabels(t *testing.T) {
	t.Parallel()

	Convey("nil input returns empty map", t, func() {
		So(normalizeLabels(nil), ShouldHaveLength, 0)
	})

	Convey("empty slice returns empty map", t, func() {
		So(normalizeLabels([]string{}), ShouldHaveLength, 0)
	})

	Convey("all-blank entries are dropped", t, func() {
		So(normalizeLabels([]string{"", "  ", "\t", " \t "}), ShouldHaveLength, 0)
	})

	Convey("leading and trailing whitespace is trimmed", t, func() {
		got := normalizeLabels([]string{"  foo  "})
		So(got, ShouldHaveLength, 1)
		_, ok := got["foo"]
		So(ok, ShouldBeTrue)
	})

	Convey("duplicates after trimming are collapsed", t, func() {
		got := normalizeLabels([]string{"foo", "foo", "  foo  ", "foo"})
		So(got, ShouldHaveLength, 1)
		_, ok := got["foo"]
		So(ok, ShouldBeTrue)
	})

	Convey("distinct labels are all preserved", t, func() {
		got := normalizeLabels([]string{"alpha", "beta", "gamma"})
		So(got, ShouldHaveLength, 3)
		for _, l := range []string{"alpha", "beta", "gamma"} {
			_, ok := got[l]
			So(ok, ShouldBeTrue)
		}
	})

	Convey("mix of blank, duplicate, and unique labels", t, func() {
		got := normalizeLabels([]string{"  foo  ", "bar", "foo", "", "  ", "baz", "bar"})
		So(got, ShouldHaveLength, 3)
		for _, l := range []string{"foo", "bar", "baz"} {
			_, ok := got[l]
			So(ok, ShouldBeTrue)
		}
	})

	Convey("single clean label", t, func() {
		got := normalizeLabels([]string{"hello"})
		So(got, ShouldHaveLength, 1)
		_, ok := got["hello"]
		So(ok, ShouldBeTrue)
	})

	Convey("label that is only internal spaces is preserved as-is after trim", t, func() {
		// "foo bar" has an internal space — it is not trimmed away
		got := normalizeLabels([]string{"foo bar"})
		So(got, ShouldHaveLength, 1)
		_, ok := got["foo bar"]
		So(ok, ShouldBeTrue)
	})
}

func TestEvResolverApplies(t *testing.T) {
	t.Parallel()
	r := NewEvResolver()

	Convey("returns true for every declared entity-backed field type with EntityUUID set", t, func() {
		for _, ft := range entityBackedFieldTypes {
			ns := &idm.UserMetaNamespace{FieldType: ft, EntityUUID: "some-uuid"}
			So(r.Applies(ns), ShouldBeTrue)
		}
	})

	Convey("returns false when EntityUUID is empty for an entity-backed field type", t, func() {
		for _, ft := range entityBackedFieldTypes {
			ns := &idm.UserMetaNamespace{FieldType: ft, EntityUUID: ""}
			So(r.Applies(ns), ShouldBeFalse)
		}
	})

	Convey("returns false for an unknown field type even with EntityUUID set", t, func() {
		for _, ft := range []string{"text", "integer", "boolean", "", "UNKNOWN"} {
			ns := &idm.UserMetaNamespace{FieldType: ft, EntityUUID: "some-uuid"}
			So(r.Applies(ns), ShouldBeFalse)
		}
	})

	Convey("returns false for a zero-value namespace", t, func() {
		So(r.Applies(&idm.UserMetaNamespace{}), ShouldBeFalse)
	})

	Convey("returns false when both FieldType and EntityUUID are empty", t, func() {
		ns := &idm.UserMetaNamespace{FieldType: "", EntityUUID: ""}
		So(r.Applies(ns), ShouldBeFalse)
	})
}
