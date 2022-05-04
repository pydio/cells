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

package config

import (
	"io/ioutil"
	"log"
	"os"
	"testing"
	"time"

	"github.com/google/uuid"

	"github.com/pydio/cells/common/config/micro"
	"github.com/pydio/cells/common/config/micro/file"
	"github.com/pydio/cells/common/config/micro/memory"
	microvault "github.com/pydio/cells/common/config/micro/vault"
	"github.com/pydio/go-os/config"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	vaultdata []byte
)

func TestVault(t *testing.T) {
	stdvault := New(micro.New(
		config.NewConfig(
			config.WithSource(
				memory.NewSource(memory.WithJSON(vaultdata)),
			),
			config.PollInterval(1*time.Second),
		),
	))

	vault := NewVault(std, stdvault)

	RegisterVaultKey("protectedValue")
	RegisterVaultKey("my-protected-map/my-protected-value")
	RegisterVaultKey("myjson/myprotectedmap/myprotectedvalue")

	Convey("Test Set", t, func() {
		vault.Val("protectedValue").Set("my-secret-data")
		So(vault.Val("protectedValue").Default("").String(), ShouldNotEqual, "my-secret-data")

		vault.Val("unprotectedValue").Set("my-test-config-value")

		So(vault.Val("unprotectedValue").String(), ShouldEqual, "my-test-config-value")
	})

	Convey("Test Setting a map", t, func() {
		vault.Val("my-protected-map").Set(map[string]string{
			"my-protected-value":   "test",
			"my-unprotected-value": "test",
		})

		So(vault.Val("my-protected-map/my-protected-value").Default("").String(), ShouldNotEqual, "test")
		So(vault.Val("my-protected-map").Val("my-protected-value").Default("").String(), ShouldNotEqual, "test")
		So(vault.Val("my-protected-map/my-protected-value").Default("").String(), ShouldNotEqual, "")
		So(vault.Val("my-protected-map").Val("my-protected-value").Default("").String(), ShouldNotEqual, "")

		So(vault.Val("my-protected-map/my-protected-value").Set("testing the test"), ShouldBeNil)
	})

	Convey("Test Setting a json byte value", t, func() {
		vault.Val("myjson/myprotectedmap").Set(map[string]interface{}{
			"myprotectedvalue":   "test",
			"myunprotectedvalue": "whatever",
		})

		So(vault.Val("myjson/myprotectedmap/myprotectedvalue").Default("").String(), ShouldNotEqual, "test")

		// Trying to reset
		uuid := vault.Val("myjson/myprotectedmap/myprotectedvalue").Default("").String()

		vault.Val("myjson/myprotectedmap").Set(map[string]interface{}{
			"myprotectedvalue": uuid,
		})

		// uuid should't have changed
		So(uuid, ShouldEqual, vault.Val("myjson/myprotectedmap/myprotectedvalue").Default("").String())

		vault.Val("myjson/myprotectedmap").Set(map[string]interface{}{
			"myprotectedvalue": "test",
		})

		// uuid should't have changed
		So(uuid, ShouldEqual, vault.Val("myjson/myprotectedmap/myprotectedvalue").Default("").String())

		vault.Val("myjson/myprotectedmap").Set(map[string]interface{}{
			"myprotectedvalue": "test2",
		})

		// uuid should have changed
		So(uuid, ShouldNotEqual, vault.Val("myjson/myprotectedmap/myprotectedvalue").Default("").String())
	})
}

func TestFile(t *testing.T) {
	dir := os.TempDir()
	fileConfig, err := ioutil.TempFile(dir, "testfileconfig")
	if err != nil {
		log.Fatal(err)
	}
	defer os.Remove(fileConfig.Name())

	fileVault, err := ioutil.TempFile(dir, "testfilevault")
	if err != nil {
		log.Fatal(err)
	}
	defer os.Remove(fileVault.Name())

	fileVaultKey, err := ioutil.TempFile(dir, "testfilevaultkey")
	if err != nil {
		log.Fatal(err)
	}
	defer os.Remove(fileVaultKey.Name())

	source := file.NewSource(
		config.SourceName(fileConfig.Name()),
	)

	vaultConfig := New(
		micro.New(
			config.NewConfig(
				config.WithSource(
					microvault.NewVaultSource(
						fileVault.Name(),
						fileVaultKey.Name(),
						true,
					),
				),
				config.PollInterval(10*time.Second),
			),
		),
	)

	conf := New(
		micro.New(
			config.NewConfig(
				config.WithSource(
					source,
				),
				config.PollInterval(10*time.Second),
			),
		),
	)

	conf = NewVault(vaultConfig, conf)
	RegisterVaultKey("test")
	Register(conf)
	RegisterVault(vaultConfig)
	RegisterVaultKey("service/pydio.grpc.mailer/password")
	Set("whatever", "test")

	Set(map[string]interface{}{
		"whatever": "boog",
		"password": "password-" + uuid.New().String(),
		"andever":  "rgsrgsrg",
	}, "service/pydio.grpc.mailer")

	<-time.After(10 * time.Second)

	Set(map[string]interface{}{
		"whatever": "boog",
		"password": "password-" + uuid.New().String(),
		"andever":  "rgsrgsrg",
	}, "service/pydio.grpc.mailer")

	Set(map[string]interface{}{
		"whatever": "boog",
		"password": "password-" + uuid.New().String(),
		"andever":  "rgsrgsrg",
	}, "service/pydio.grpc.mailer")
}
