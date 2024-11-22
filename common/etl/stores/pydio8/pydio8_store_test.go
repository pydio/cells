//go:build integration
// +build integration

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

package pydio8

import (
	"context"
	"testing"

	sdkconfig "github.com/pydio/pydio-sdk-go/config"

	. "github.com/smartystreets/goconvey/convey"
)

func getPydio8Config() *sdkconfig.SdkConfig {

	config := &sdkconfig.SdkConfig{
		Protocol: "http",
		Url:      "INTEGRATION_URL",
		Path:     "",
		User:     "INTEGRATION_USER",
		Password: "INTEGRATION_PASSWORD",
	}

	return config
}

func TestPydio8GetAllUsers(t *testing.T) {
	Convey("Test get all users", t, func() {
		config := getPydio8Config()

		pydio8Store := NewPydio8UserStore(config)

		users, err := pydio8Store.ListUsers(context.Background(), nil, nil)
		So(err, ShouldBeNil)
		So(len(users), ShouldBeGreaterThan, 0)
	})
}
