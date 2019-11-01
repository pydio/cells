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

package cmd

import (
	"bytes"
	"fmt"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common/config"
)

var (
	isDebug = false
)

func init() {
	test = true
}

func emptyRun(*cobra.Command, []string) {}

func executeCommand(root *cobra.Command, args ...string) error {

	buf := new(bytes.Buffer)
	root.SetOutput(buf)
	root.SetArgs(args)

	_, err := root.ExecuteC()
	if err != nil {
		return err
	}
	if isDebug {
		fmt.Println(buf.String())
	}
	return nil
}

// func TestLoadSampleConf(t *testing.T) {

// 	Convey("Testing json validity of sample config", t, func() {
// 		var data map[string]interface{}
// 		e := json.Unmarshal([]byte(SampleConfig), &data)
// 		So(e, ShouldBeNil)
// 		_, ok := data["services"]
// 		So(ok, ShouldBeTrue)
// 	})

// }

func TestNonInteractiveInstall(t *testing.T) {

	Convey("Given an empty config", t, func() {

		Convey("Bind and Ext should generate a self signed config", func() {
			// Default self signed
			bind := "localhost:443"
			ext := "https://localhost"

			err := executeCommand(RootCmd, "install", "--bind="+bind, "--external="+ext)
			if err != nil {
				t.Errorf("Unexpected error: %v", err)
			}

			So(config.Get("defaults", "urlInternal").String(""), ShouldEqual, "https://"+bind)
			So(config.Get("defaults", "url").String(""), ShouldEqual, ext)
			So(config.Get("cert", "proxy", "ssl").Bool(false), ShouldBeTrue)
			So(config.Get("cert", "proxy", "self").Bool(false), ShouldBeFalse)
			So(config.Get("cert", "proxy", "certFile").String(""), ShouldNotBeEmpty)
			So(config.Get("cert", "proxy", "keyFile").String(""), ShouldNotBeEmpty)
			So(config.Get("cert", "proxy", "autoCA").String(""), ShouldNotBeEmpty)
		})

		Convey("Skip TLS should generate a raw http config", func() {
			// Default self signed
			bind := "localhost:80"
			ext := "http://localhost"

			err := executeCommand(RootCmd, "install", "--bind="+bind, "--external="+ext, "--skip-ssl=true")
			if err != nil {
				t.Errorf("Unexpected error: %v", err)
			}

			So(config.Get("defaults", "urlInternal").String(""), ShouldEqual, "https://"+bind)
			So(config.Get("defaults", "url").String(""), ShouldEqual, ext)
			So(config.Get("cert", "proxy", "ssl").Bool(false), ShouldBeFalse)
			So(config.Get("cert", "proxy", "self").Bool(false), ShouldBeFalse)
			So(config.Get("cert", "proxy", "certFile").String(""), ShouldBeEmpty)
			So(config.Get("cert", "proxy", "keyFile").String(""), ShouldBeEmpty)
			So(config.Get("cert", "proxy", "autoCA").String(""), ShouldBeEmpty)
		})

	})

}
