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

package object

import (
	"context"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/kv"
)

// noopSecretProvider returns an empty config for any secret lookup.
var noopSecretProvider SecretProvider = func(_ context.Context, _ string) kv.Values {
	return configx.New()
}

func TestDataSourceClientConfigPathStyle(t *testing.T) {

	ctx := context.Background()

	Convey("Testing DataSource.ClientConfig path_style propagation", t, func() {

		Convey("path_style=true should set bool true in config", func() {
			ds := &DataSource{
				StorageType: StorageType_S3,
				StorageConfiguration: map[string]string{
					StorageKeyPathStyle: "true",
				},
			}
			cfg := ds.ClientConfig(ctx, noopSecretProvider)
			So(cfg.Val(StorageKeyPathStyle).Bool(), ShouldBeTrue)
		})

		Convey("force_path_style=true should set bool true in config", func() {
			ds := &DataSource{
				StorageType: StorageType_S3,
				StorageConfiguration: map[string]string{
					StorageKeyForcePathStyle: "true",
				},
			}
			cfg := ds.ClientConfig(ctx, noopSecretProvider)
			So(cfg.Val(StorageKeyForcePathStyle).Bool(), ShouldBeTrue)
		})

		Convey("path_style=false should set bool false in config", func() {
			ds := &DataSource{
				StorageType: StorageType_S3,
				StorageConfiguration: map[string]string{
					StorageKeyPathStyle: "false",
				},
			}
			cfg := ds.ClientConfig(ctx, noopSecretProvider)
			So(cfg.Val(StorageKeyPathStyle).Bool(), ShouldBeFalse)
		})

		Convey("missing path_style key should return false", func() {
			ds := &DataSource{
				StorageType:          StorageType_S3,
				StorageConfiguration: map[string]string{},
			}
			cfg := ds.ClientConfig(ctx, noopSecretProvider)
			So(cfg.Val(StorageKeyPathStyle).Bool(), ShouldBeFalse)
			So(cfg.Val(StorageKeyForcePathStyle).Bool(), ShouldBeFalse)
		})

		Convey("nil StorageConfiguration should not panic", func() {
			ds := &DataSource{
				StorageType:          StorageType_S3,
				StorageConfiguration: nil,
			}
			So(func() { ds.ClientConfig(ctx, noopSecretProvider) }, ShouldNotPanic)
		})
	})
}

func TestMinioConfigClientConfigPathStyle(t *testing.T) {

	ctx := context.Background()

	Convey("Testing MinioConfig.ClientConfig path_style propagation", t, func() {

		Convey("GatewayConfiguration path_style=true should set bool true", func() {
			mc := &MinioConfig{
				StorageType: StorageType_S3,
				GatewayConfiguration: map[string]string{
					StorageKeyPathStyle: "true",
				},
			}
			cfg := mc.ClientConfig(ctx, noopSecretProvider, "", "")
			So(cfg.Val(StorageKeyPathStyle).Bool(), ShouldBeTrue)
		})

		Convey("GatewayConfiguration force_path_style=true should set bool true", func() {
			mc := &MinioConfig{
				StorageType: StorageType_S3,
				GatewayConfiguration: map[string]string{
					StorageKeyForcePathStyle: "true",
				},
			}
			cfg := mc.ClientConfig(ctx, noopSecretProvider, "", "")
			So(cfg.Val(StorageKeyForcePathStyle).Bool(), ShouldBeTrue)
		})

		Convey("nil GatewayConfiguration should not panic and return false", func() {
			mc := &MinioConfig{
				StorageType:          StorageType_S3,
				GatewayConfiguration: nil,
			}
			So(func() { mc.ClientConfig(ctx, noopSecretProvider, "", "") }, ShouldNotPanic)
			cfg := mc.ClientConfig(ctx, noopSecretProvider, "", "")
			So(cfg.Val(StorageKeyPathStyle).Bool(), ShouldBeFalse)
			So(cfg.Val(StorageKeyForcePathStyle).Bool(), ShouldBeFalse)
		})
	})
}
