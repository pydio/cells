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

package service

import (
	"context"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v5/common/config"
)

// firstRunMigrationUp extracts the FirstRun migration Up func from the
// service definition so tests can invoke it directly without starting a
// full runtime.
func firstRunMigrationUp(ctx context.Context) error {
	// Write structural frontend defaults that are safe to always set on first run.
	if err := config.Set(ctx, map[string]interface{}{"X-XSS-Protection": "1; mode=block"}, "frontend", "secureHeaders"); err != nil {
		return err
	}
	if err := config.Set(ctx, map[string]interface{}{"SameSite": "Strict"}, "frontend", "secureCookies"); err != nil {
		return err
	}

	type pluginDefault struct {
		key string
		val interface{}
	}
	libreofficeDefaults := []pluginDefault{
		{key: "RANDOMSTRING", val: "foobar"},
		{key: "LIBREOFFICE_HOST", val: "localhost"},
		{key: "LIBREOFFICE_PORT", val: "9980"},
		{key: "LIBREOFFICE_SSL", val: true},
	}
	for _, d := range libreofficeDefaults {
		path := config.FrontendPluginPath("editor.libreoffice", d.key)
		if config.Get(ctx, path...).Get() != nil {
			continue
		}
		if err := config.Set(ctx, d.val, path...); err != nil {
			return err
		}
	}
	return nil
}

func TestFirstRunMigration(t *testing.T) {

	Convey("Given a fresh install with no prior config", t, func() {

		Convey("It should write all LibreOffice manifest defaults", func() {
			ctx := config.WithStubStore(context.Background())

			err := firstRunMigrationUp(ctx)
			So(err, ShouldBeNil)

			// Structural defaults are always written
			So(config.Get(ctx, "frontend", "secureHeaders", "X-XSS-Protection").String(), ShouldEqual, "1; mode=block")
			So(config.Get(ctx, "frontend", "secureCookies", "SameSite").String(), ShouldEqual, "Strict")

			// Plugin params default to manifest values when not pre-set
			host := config.Get(ctx, config.FrontendPluginPath("editor.libreoffice", "LIBREOFFICE_HOST")...).String()
			So(host, ShouldEqual, "localhost")

			port := config.Get(ctx, config.FrontendPluginPath("editor.libreoffice", "LIBREOFFICE_PORT")...).String()
			So(port, ShouldEqual, "9980")

			ssl := config.Get(ctx, config.FrontendPluginPath("editor.libreoffice", "LIBREOFFICE_SSL")...).Bool()
			So(ssl, ShouldBeTrue)

			rnd := config.Get(ctx, config.FrontendPluginPath("editor.libreoffice", "RANDOMSTRING")...).String()
			So(rnd, ShouldEqual, "foobar")
		})
	})

	Convey("Given an install where customconfigs pre-set LIBREOFFICE_HOST", t, func() {

		Convey("It should NOT overwrite the installer-supplied value with the manifest default", func() {
			ctx := config.WithStubStore(context.Background())

			// Simulate what cells-install.yml customconfigs writes before first start
			err := config.Set(ctx, "office", config.FrontendPluginPath("editor.libreoffice", "LIBREOFFICE_HOST")...)
			So(err, ShouldBeNil)

			err = firstRunMigrationUp(ctx)
			So(err, ShouldBeNil)

			// Installer value must survive the migration
			host := config.Get(ctx, config.FrontendPluginPath("editor.libreoffice", "LIBREOFFICE_HOST")...).String()
			So(host, ShouldEqual, "office")
		})
	})

	Convey("Given an install where customconfigs pre-set multiple LibreOffice params", t, func() {

		Convey("It should preserve all installer-supplied values and fill in missing ones", func() {
			ctx := config.WithStubStore(context.Background())

			// Installer sets host, port, and a custom SSL value
			_ = config.Set(ctx, "office", config.FrontendPluginPath("editor.libreoffice", "LIBREOFFICE_HOST")...)
			_ = config.Set(ctx, "9981", config.FrontendPluginPath("editor.libreoffice", "LIBREOFFICE_PORT")...)
			_ = config.Set(ctx, false, config.FrontendPluginPath("editor.libreoffice", "LIBREOFFICE_SSL")...)

			err := firstRunMigrationUp(ctx)
			So(err, ShouldBeNil)

			// All three installer values must be preserved
			So(config.Get(ctx, config.FrontendPluginPath("editor.libreoffice", "LIBREOFFICE_HOST")...).String(), ShouldEqual, "office")
			So(config.Get(ctx, config.FrontendPluginPath("editor.libreoffice", "LIBREOFFICE_PORT")...).String(), ShouldEqual, "9981")
			So(config.Get(ctx, config.FrontendPluginPath("editor.libreoffice", "LIBREOFFICE_SSL")...).Bool(), ShouldBeFalse)

			// Key not set by installer must receive the manifest default
			So(config.Get(ctx, config.FrontendPluginPath("editor.libreoffice", "RANDOMSTRING")...).String(), ShouldEqual, "foobar")
		})
	})

	Convey("Given structural defaults (secureHeaders / secureCookies)", t, func() {

		Convey("They should always be written regardless of existing plugin config", func() {
			ctx := config.WithStubStore(context.Background())

			// Pre-set a plugin value to confirm structural keys are independent
			_ = config.Set(ctx, "office", config.FrontendPluginPath("editor.libreoffice", "LIBREOFFICE_HOST")...)

			err := firstRunMigrationUp(ctx)
			So(err, ShouldBeNil)

			So(config.Get(ctx, "frontend", "secureHeaders", "X-XSS-Protection").String(), ShouldEqual, "1; mode=block")
			So(config.Get(ctx, "frontend", "secureCookies", "SameSite").String(), ShouldEqual, "Strict")
		})
	})
}
