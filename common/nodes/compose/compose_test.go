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
	"fmt"
	"os"
	"strings"
	"testing"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/compose"
	"github.com/pydio/cells/v5/common/nodes/models"
	omock "github.com/pydio/cells/v5/common/nodes/objects/mock"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/docstore"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/server/stubs/datatest"
	"github.com/pydio/cells/v5/common/server/stubs/idmtest"
	"github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/common/utils/cache/gocache"
	cache_helper "github.com/pydio/cells/v5/common/utils/cache/helper"
	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/openurl"
	"github.com/pydio/cells/v5/common/utils/uuid"
	dcdao "github.com/pydio/cells/v5/data/docstore/dao/bleve"
	metadao "github.com/pydio/cells/v5/data/meta/dao/sql"
	idxdao "github.com/pydio/cells/v5/data/source/index/dao/sql"
	acldao "github.com/pydio/cells/v5/idm/acl/dao/sql"
	roledao "github.com/pydio/cells/v5/idm/role/dao/sql"
	usrdao "github.com/pydio/cells/v5/idm/user/dao/sql"
	wsdao "github.com/pydio/cells/v5/idm/workspace/dao/sql"

	_ "github.com/pydio/cells/v5/common/utils/cache/gocache"
	_ "gocloud.dev/pubsub/mempubsub"

	. "github.com/smartystreets/goconvey/convey"
)

func TestMain(m *testing.M) {

	cache_helper.SetStaticResolver("pm://", &gocache.URLOpener{})

	nodes.UseMockStorageClientType()
	// Override default
	nodes.RegisterStorageClient("mock", func(cfg configx.Values) (nodes.StorageClient, error) {
		return mockClient, nil
	})

	m.Run()
}

var (
	testServices = map[string]map[string]map[string]any{
		common.ServiceUserGRPC: {
			"sql": {
				"func": usrdao.NewDAO,
			},
		},
		common.ServiceRoleGRPC: {
			"sql": {
				"func": roledao.NewDAO,
			},
		},
		common.ServiceAclGRPC: {
			"sql": {
				"func": acldao.NewDAO,
			},
		},
		common.ServiceWorkspaceGRPC: {
			"sql": {
				"func": wsdao.NewDAO,
			},
		},
		common.ServiceDocStoreGRPC: {
			"dcbolt": {
				"func": dcdao.NewBleveDAO,
			},
			"dcbleve": {
				"func": dcdao.NewBleveDAO,
			},
		},
		common.ServiceMetaGRPC: {
			"sql": {
				"func": metadao.NewMetaDAO,
			},
		},
		common.ServiceTreeGRPC: {},
	}
	dss        = []string{"pydiods1", "personal", "cellsdata", "thumbnails", "versions"}
	mockClient = omock.New(dss...)
	testcases  []test.ServicesStorageTestCase
)

func init() {
	tmpPath := os.TempDir()
	unique := uuid.New()[:6] + "_"
	sql.TestPrintQueries = false

	for _, ds := range dss {
		testServices[common.ServiceDataIndexGRPC_+ds] = map[string]map[string]any{"sql": {
			"func":   idxdao.NewDAO,
			"prefix": ds + "_",
		}}
	}

	testcases = []test.ServicesStorageTestCase{
		{
			DSN: map[string]string{
				"sql":     sql.SqliteDriver + "://" + sql.SharedMemDSN + "&hookNames=cleanTables&prefix=" + unique + "&policies=" + unique + "{{ .Meta.policies }}",
				"dcbolt":  "boltdb://" + tmpPath + "/docstore-" + unique + ".db",
				"dcbleve": "bleve://" + tmpPath + "/docstore-" + unique + ".bleve?rotationSize=-1",
			},
			Condition: os.Getenv("CELLS_TEST_SKIP_SQLITE") != "true",
			Services:  testServices,
			Label:     "Sqlite",
		},
	}
	nodes.SetSourcesPoolOpener(func(ctx context.Context) *openurl.Pool[nodes.SourcesPool] {
		return nodes.NewTestPoolWithDataSources(ctx, mockClient, dss...)
	})
}

func TestPersonalResolution(t *testing.T) {

	test.RunServicesTests(testcases, t, func(ctx context.Context) {

		Convey("Setup Mock Data", t, func() {
			sd, er := idmtest.GetStartData()
			So(er, ShouldBeNil)
			er = idmtest.RegisterIdmMocksWithData(ctx, sd)
			So(er, ShouldBeNil)
			er = datatest.RegisterDataServices(ctx)
			So(er, ShouldBeNil)

			// test docstore
			dcc := docstore.NewDocStoreClient(grpc.ResolveConn(ctx, common.ServiceDocStoreGRPC))
			dc, er := dcc.GetDocument(ctx, &docstore.GetDocumentRequest{
				StoreID:    common.DocStoreIdVirtualNodes,
				DocumentID: "my-files",
			})
			So(er, ShouldBeNil)
			So(dc.Document, ShouldNotBeNil)

		})

		client := compose.PathClient()
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
			// Warning - if this fails with a path.not.writeable error, this might be linked to an issue in the stub
			written, er := client.PutObject(userCtx, &tree.Node{Path: "/personal-files/AdminFolder/file.txt"}, strings.NewReader(contentString), &models.PutRequestData{
				Size: contentSize,
			})
			if er != nil {
				fmt.Printf("%+v", er)
			}
			So(er, ShouldBeNil)
			So(written.Size, ShouldEqual, contentSize)
		})
	})

}
