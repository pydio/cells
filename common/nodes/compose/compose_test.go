//go:build exclude

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

package compose_test

import (
	"context"
	"log"
	"strings"
	"testing"

	"github.com/spf13/viper"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config/mock"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/compose"
	nodescontext "github.com/pydio/cells/v4/common/nodes/context"
	"github.com/pydio/cells/v4/common/nodes/models"
	omock "github.com/pydio/cells/v4/common/nodes/objects/mock"
	"github.com/pydio/cells/v4/common/permissions"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server/stubs/datatest"
	"github.com/pydio/cells/v4/common/server/stubs/idmtest"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/propagator"

	_ "github.com/pydio/cells/v4/common/utils/cache/gocache"
	_ "gocloud.dev/pubsub/mempubsub"

	. "github.com/smartystreets/goconvey/convey"
)

func TestMain(m *testing.M) {

	v := viper.New()
	v.SetDefault(runtime.KeyCache, "pm://")
	v.SetDefault(runtime.KeyShortCache, "pm://")
	runtime.SetRuntime(v)

	nodes.UseMockStorageClientType()

	// Override default
	nodes.RegisterStorageClient("mock", func(cfg configx.Values) (nodes.StorageClient, error) {
		return omock.New("pydiods1", "personal", "cellsdata", "thumbnails", "versions"), nil
	})

	if e := mock.RegisterMockConfig(); e != nil {
		log.Fatal(e)
	}

	testData, er := idmtest.GetStartData()
	if er != nil {
		log.Fatal(er)
	}

	ds, er := datatest.NewDocStoreService()
	if er != nil {
		log.Fatal(er)
	}
	grpc.RegisterMock(common.ServiceDocStore, ds)

	if er := datatest.RegisterTreeAndDatasources(); er != nil {
		log.Fatal(er)
	}
	if er := idmtest.RegisterIdmMocksWithData(testData); er != nil {
		log.Fatal(er)
	}

	m.Run()
}

func TestPersonalResolution(t *testing.T) {

	ctx := context.Background()
	reg, _ := registry.OpenRegistry(ctx, "mem:///")
	ctx = propagator.With(ctx, registry.ContextKey, reg)
	ctx = nodescontext.WithSourcesPool(ctx, nodes.NewTestPool(ctx))
	client := compose.PathClient(ctx)

	Convey("Test personal file", t, func() {
		user, e := permissions.SearchUniqueUser(ctx, "admin", "")
		So(e, ShouldBeNil)
		userCtx := auth.WithImpersonate(ctx, user)
		resp, e := client.ReadNode(userCtx, &tree.ReadNodeRequest{Node: &tree.Node{Path: "/personal-files"}})
		So(e, ShouldBeNil)
		t.Log("Output node is", resp.GetNode().Zap())

		cResp, e := client.CreateNode(userCtx, &tree.CreateNodeRequest{Node: &tree.Node{Path: "/personal-files/AdminFolder", Type: tree.NodeType_COLLECTION}})
		So(e, ShouldBeNil)
		t.Log("Created node is", cResp.GetNode().Zap())

		contentString := "content"
		contentSize := int64(len(contentString))
		written, er := client.PutObject(userCtx, &tree.Node{Path: "/personal-files/AdminFolder/file.txt"}, strings.NewReader(contentString), &models.PutRequestData{
			Size: contentSize,
		})
		So(er, ShouldBeNil)
		So(written.Size, ShouldEqual, contentSize)
	})

}
