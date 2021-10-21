// +build ignore

/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/registry"
	_ "github.com/pydio/cells/discovery/config/grpc"
	_ "github.com/pydio/cells/discovery/nats"
)

// This test fails because the call to registry.ListRunningServices()
// lists the services that are started on the local workstation rather than in the current test.
// We will then found ~70 services if a pydio server is running on the current machine
// or 0 otherwise but not the expected 1.

func TestCreationOfServices(t *testing.T) {
	Convey("Test Starting a service", t, func() {
		go func() {
			args := []string{"start", "nats"}
			RootCmd.SetOutput(os.Stdout)
			RootCmd.SetArgs(args)

			_, err := RootCmd.ExecuteC()
			So(err, ShouldBeNil)
		}()

		for {
			running, err := registry.ListRunningServices()
			if err != nil {
				<-time.After(100 * time.Millisecond)
				continue
			}

			So(len(running), ShouldEqual, 1)
			break
		}
	})
}
