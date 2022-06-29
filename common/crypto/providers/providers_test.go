/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package providers

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/pydio/cells/v4/common/proto/install"
	"github.com/pydio/cells/v4/common/utils/uuid"

	. "github.com/smartystreets/goconvey/convey"
)

func TestLoadCertificates(t *testing.T) {
	tmpFolder := filepath.Join(os.TempDir(), uuid.New())
	_ = os.MkdirAll(tmpFolder, 0777)
	// Override defaultLocation
	defaultLocation = tmpFolder
	defer os.RemoveAll(tmpFolder)

	local := true
	storageURL := "file://" + defaultLocation
	if os.Getenv("VAULT_ADDR") != "" && os.Getenv("VAULT_TOKEN") != "" {
		storageURL = os.Getenv("VAULT_ADDR")
		local = false
	}

	var cert, key string

	Convey("Test LoadCertificates first", t, func() {
		var err error
		cert, key, err = LoadCertificates(&install.ProxyConfig{
			Binds: []string{"https://0.0.0.0:8080"},
			TLSConfig: &install.ProxyConfig_SelfSigned{
				SelfSigned: &install.TLSSelfSigned{Hostnames: []string{"0.0.0.0"}},
			},
		}, storageURL)
		So(err, ShouldBeNil)
		So(cert, ShouldNotBeEmpty)
		So(key, ShouldNotBeEmpty)

		// Check if rootCA has been created
		if local {
			_, sE := os.Stat(filepath.Join(defaultLocation, "rootCA.pem"))
			So(sE, ShouldBeNil)
			_, sE = os.Stat(filepath.Join(defaultLocation, "rootCA-key.pem"))
			So(sE, ShouldBeNil)
		}

		entries, er := os.ReadDir(defaultLocation)
		So(er, ShouldBeNil)
		if local {
			So(entries, ShouldHaveLength, 4)
		} else {
			So(entries, ShouldHaveLength, 2)
		}

	})

	Convey("Test LoadCertificates second (existing one)", t, func() {
		cert2, key2, err := LoadCertificates(&install.ProxyConfig{
			Binds: []string{"0.0.0.0:8080"},
			TLSConfig: &install.ProxyConfig_SelfSigned{
				SelfSigned: &install.TLSSelfSigned{Hostnames: []string{"0.0.0.0"}},
			},
		}, storageURL)
		So(err, ShouldBeNil)
		So(cert2, ShouldEqual, cert)
		So(key2, ShouldEqual, key2)

		// Check that no new cert has been created
		entries, er := os.ReadDir(defaultLocation)
		So(er, ShouldBeNil)
		if local {
			So(entries, ShouldHaveLength, 4)
		} else {
			So(entries, ShouldHaveLength, 2)
		}
	})

	Convey("Test LoadCertificates third (different host)", t, func() {
		cert2, key2, err := LoadCertificates(&install.ProxyConfig{
			Binds: []string{"0.0.0.0:8080"},
			TLSConfig: &install.ProxyConfig_SelfSigned{
				SelfSigned: &install.TLSSelfSigned{Hostnames: []string{"0.0.0.0", "local.pydio"}},
			},
		}, storageURL)
		So(err, ShouldBeNil)
		So(cert2, ShouldNotBeEmpty)
		So(key2, ShouldNotBeEmpty)

		// Check that no new cert has been created
		entries, er := os.ReadDir(defaultLocation)
		So(er, ShouldBeNil)
		if local {
			So(entries, ShouldHaveLength, 6)
		} else {
			So(entries, ShouldHaveLength, 4)
		}
	})

}
