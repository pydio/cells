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
	"os"
	"path/filepath"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestNonInteractiveInstall(t *testing.T) {

	Convey("Given an empty config", t, func() {

		Convey("Bind and Ext should generate a NO TLS config", func() {
			niBindUrl = "localhost:80"
			niExtUrl = "http://localhost"
			pconf, err := proxyConfigFromArgs()
			So(err, ShouldBeNil)
			So(pconf.GetBindURL(), ShouldEqual, "http://"+niBindUrl)
			So(pconf.GetExternalURL(), ShouldEqual, niExtUrl)
			So(pconf.GetTLSConfig(), ShouldBeNil)
		})

		Convey("Selfsign flags is ok", func() {
			niBindUrl = "localhost:443"
			niExtUrl = "https://localhost"
			niSelfSigned = true
			pconf, err := proxyConfigFromArgs()
			So(err, ShouldBeNil)
			So(pconf.GetBindURL(), ShouldEqual, "https://"+niBindUrl)
			So(pconf.GetExternalURL(), ShouldEqual, niExtUrl)
			So(pconf.GetTLSConfig(), ShouldNotBeNil)
			// So(pconf.GetTLSConfig(), ShouldHaveSameTypeAs, *install.ProxyConfig_SelfSigned)

			niBindUrl = "http://localhost:443"
			niExtUrl = "https://localhost"
			niSelfSigned = true
			_, err = proxyConfigFromArgs()
			So(err, ShouldNotBeNil)

		})
	})

}

func TestJsonConfigInstall(t *testing.T) {

	Convey("Given an empty config", t, func() {

		// FIXME this will fail with modules.
		testDir := filepath.Join(os.Getenv("GOPATH"), "src", "github.com", "pydio", "cells", "cmd", "testdata")

		Convey("Bind and Ext should generate a NO TLS config", func() {
			// no TLS
			niJsonFile = filepath.Join(testDir, "no-tls.json")
			pconf, err := proxyConfigFromArgs()
			So(err, ShouldBeNil)
			So(pconf.GetBindURL(), ShouldEqual, "http://localhost:8080")
			So(pconf.GetExternalURL(), ShouldEqual, "http://localhost:8080")
			So(pconf.GetTLSConfig(), ShouldBeNil)
		})

		// Convey("Selfsign flags is ok", func() {
		// 	niBindUrl = "localhost:443"
		// 	niExtUrl = "https://localhost"
		// 	niSelfSigned = true
		// 	pconf, err := proxyConfigFromArgs()
		// 	So(err, ShouldBeNil)
		// 	So(pconf.GetBindURL(), ShouldEqual, "https://"+niBindUrl)
		// 	So(pconf.GetExternalURL(), ShouldEqual, niExtUrl)
		// 	So(pconf.GetTLSConfig(), ShouldNotBeNil)
		// 	// So(pconf.GetTLSConfig(), ShouldHaveSameTypeAs, *install.ProxyConfig_SelfSigned)

		// 	niBindUrl = "http://localhost:443"
		// 	niExtUrl = "https://localhost"
		// 	niSelfSigned = true
		// 	_, err = proxyConfigFromArgs()
		// 	So(err, ShouldNotBeNil)

		// })
	})
}

// TODO Implement a way to cleanly launch tests on fake commands and test the config store.

// var (
// 	isDebug = false
// )

// func init() {
// 	test = true
// }

// func executeCommand(root *cobra.Command, args ...string) error {

// 	buf := new(bytes.Buffer)
// 	root.SetOutput(buf)
// 	root.SetArgs(args)

// 	_, err := root.ExecuteC()
// 	if err != nil {
// 		return err
// 	}
// 	if isDebug {
// 		fmt.Println(buf.String())
// 	}
// 	return nil
// }

// func TestNonInteractiveInstall(t *testing.T) {

// 	Convey("Given an empty config", t, func() {

// 		Convey("Bind and Ext should generate a self signed config", func() {
// 			// Default self signed
// 			bind := "localhost:80"
// 			ext := "http://localhost"

// 			err := executeCommand(RootCmd, "install", "--bind="+bind, "--external="+ext)
// 			if err != nil {
// 				t.Errorf("Unexpected error: %v", err)
// 			}

// 			So(config.Get("defaults", "urlInternal").String(""), ShouldEqual, "http://"+bind)
// 			So(config.Get("defaults", "url").String(""), ShouldEqual, ext)
// 			So(config.Get("cert", "proxy", "ssl").Bool(false), ShouldBeFalse)
// 		})

// 	})

// }
