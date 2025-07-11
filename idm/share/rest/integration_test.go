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

package rest_test

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"
	"path"
	"testing"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/compose"
	omock "github.com/pydio/cells/v5/common/nodes/objects/mock"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/docstore"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/server/stubs/datatest"
	"github.com/pydio/cells/v5/common/server/stubs/idmtest"
	"github.com/pydio/cells/v5/common/server/stubs/resttest"
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
	"github.com/pydio/cells/v5/idm/share"
	rest2 "github.com/pydio/cells/v5/idm/share/rest"
	usrdao "github.com/pydio/cells/v5/idm/user/dao/sql"
	wsdao "github.com/pydio/cells/v5/idm/workspace/dao/sql"

	_ "github.com/pydio/cells/v5/common/utils/cache/gocache"

	. "github.com/smartystreets/goconvey/convey"
)

/*
func TestMain(m *testing.M) {

	cache_helper.SetStaticResolver("pm://", &gocache.URLOpener{})

	grpc2.UnitTests = true

	//_ = broker.Connect()
	nodes.UseMockStorageClientType()

	// TODO Context config
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
	if er := idmtest.RegisterIdmMocksWithData(nil, testData); er != nil {
		log.Fatal(er)
	}

	_ = broker.SubscribeCancellable(context.Background(), common.TopicIdmEvent, func(ctx context.Context, message broker.Message) error {
		msg := &idm.ChangeEvent{}
		if _, e := message.Unmarshal(ctx, msg); e == nil {
			fmt.Println(" - Received an idm.ChangeEvent!", msg)
		}
		return nil
	}, broker.WithCounterName("share"))

	nodes.SetSourcesPoolOpener(func(ctx context.Context) *openurl.Pool[nodes.SourcesPool] {
		return nodes.NewTestPool(ctx)
	})

	m.Run()
}
*/

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
				"func":     usrdao.NewDAO,
				"prefix":   "",
				"policies": "user_policies",
			},
		},
		common.ServiceRoleGRPC: {
			"sql": {
				"func":     roledao.NewDAO,
				"prefix":   "",
				"policies": "role_policies",
			},
		},
		common.ServiceAclGRPC: {
			"sql": {
				"func":   acldao.NewDAO,
				"prefix": "",
			},
		},
		common.ServiceWorkspaceGRPC: {
			"sql": {
				"func":     wsdao.NewDAO,
				"prefix":   "",
				"policies": "ws_policies",
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
				"func":   metadao.NewMetaDAO,
				"prefix": "",
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

	for _, ds := range dss {
		testServices[common.ServiceDataIndexGRPC_+ds] = map[string]map[string]any{"sql": {
			"func":   idxdao.NewDAO,
			"prefix": ds + "_",
		}}
	}

	testcases = []test.ServicesStorageTestCase{
		{
			DSN: map[string]string{
				"sql":     sql.SqliteDriver + "://" + sql.SharedMemDSN + "&hookNames=cleanTables&prefix=" + unique + "{{ .Meta.prefix }}&policies=" + unique + "{{ .Meta.policies }}",
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

func SkipTestShareLinks(t *testing.T) {
	sql.TestPrintQueries = true

	test.RunServicesTests(testcases, t, func(ctx context.Context) {

		sd, er := idmtest.GetStartData()
		fmt.Println(er)
		//So(er, ShouldBeNil)
		er = idmtest.RegisterIdmMocksWithData(ctx, sd)
		//So(er, ShouldBeNil)
		er = datatest.RegisterDataServices(ctx)
		//So(er, ShouldBeNil)

		Convey("Setup Mock Data", t, func() {
			//sd, er := idmtest.GetStartData()
			//So(er, ShouldBeNil)
			//er = idmtest.RegisterIdmMocksWithData(ctx, sd)
			//So(er, ShouldBeNil)
			//er = datatest.RegisterDataServices(ctx)
			//So(er, ShouldBeNil)

			// test docstore
			dcc := docstore.NewDocStoreClient(grpc.ResolveConn(ctx, common.ServiceDocStoreGRPC))
			dc, er := dcc.GetDocument(ctx, &docstore.GetDocumentRequest{
				StoreID:    common.DocStoreIdVirtualNodes,
				DocumentID: "my-files",
			})
			So(er, ShouldBeNil)
			So(dc.Document, ShouldNotBeNil)

		})

		Convey("Test CRUD Share Link on File", t, func() {

			u, e := permissions.SearchUniqueUser(ctx, "admin", "")
			So(e, ShouldBeNil)
			ctx = auth.WithImpersonate(ctx, u)

			newNode := &tree.Node{Path: "pydiods1/file.ex", Type: tree.NodeType_LEAF, Size: 24}
			nc := tree.NewNodeReceiverClient(grpc.ResolveConn(ctx, common.ServiceTreeGRPC))
			cR, e := nc.CreateNode(ctx, &tree.CreateNodeRequest{Node: newNode})
			So(e, ShouldBeNil)
			newNode = cR.GetNode()
			So(newNode.Uuid, ShouldNotBeEmpty)

			h := rest2.NewSharesHandler()
			payload := &rest.PutShareLinkRequest{
				ShareLink: &rest.ShareLink{
					Label:     "Link to File.ex",
					RootNodes: []*tree.Node{{Uuid: newNode.Uuid}},
					Permissions: []rest.ShareLinkAccessType{
						rest.ShareLinkAccessType_Download, rest.ShareLinkAccessType_Preview,
					},
				},
			}
			outputLink := &rest.ShareLink{}
			statusCode, er := resttest.RunRestfulHandler(ctx, h.PutShareLink, payload, outputLink, nil)
			So(er, ShouldBeNil)
			So(statusCode, ShouldEqual, http.StatusOK)

			// Now try to access link as the new user
			hiddenUser, e := permissions.SearchUniqueUser(ctx, outputLink.UserLogin, "")
			So(e, ShouldBeNil)
			So(hiddenUser.Attributes, ShouldContainKey, "hidden")
			hiddenCtx := auth.WithImpersonate(ctx, hiddenUser)

			ws, e := permissions.SearchUniqueWorkspace(hiddenCtx, outputLink.Uuid, "")
			So(e, ShouldBeNil)
			slugRoot := ws.GetSlug()

			// Create slug/
			hash := md5.New()
			hash.Write([]byte(newNode.Uuid))
			rand := hex.EncodeToString(hash.Sum(nil))
			rootKey := rand[0:8] + "-" + path.Base(newNode.GetPath())

			read, e := compose.PathClient().ReadNode(hiddenCtx, &tree.ReadNodeRequest{Node: &tree.Node{Path: path.Join(slugRoot, rootKey)}})
			So(e, ShouldBeNil)
			So(read, ShouldNotBeEmpty)
			t.Log("Router Accessed File from Hidden User", read.Node)

			payload2 := &rest.GetShareLinkRequest{Uuid: outputLink.Uuid}
			expected2 := &rest.ShareLink{}
			statusCode, er = resttest.RunRestfulHandler(ctx, h.GetShareLink, payload2, expected2, map[string]string{"Uuid": outputLink.Uuid})
			So(er, ShouldBeNil)
			So(statusCode, ShouldEqual, http.StatusOK)
			So(expected2.Label, ShouldEqual, outputLink.Label)

			payload3 := &rest.DeleteShareLinkRequest{Uuid: outputLink.Uuid}
			expected3 := &rest.DeleteShareLinkResponse{}
			statusCode, er = resttest.RunRestfulHandler(ctx, h.DeleteShareLink, payload3, expected3, map[string]string{"Uuid": outputLink.Uuid})
			So(er, ShouldBeNil)
			So(statusCode, ShouldEqual, http.StatusOK)

		})

		Convey("Test Basic Docstore Mock", t, func() {
			sc := share.NewClient(nil)
			e := sc.StoreHashDocument(ctx, &idm.User{Uuid: "uuid", Login: "login"}, &rest.ShareLink{
				Uuid:             "link-uuid",
				LinkHash:         "hash",
				Label:            "My Link",
				Description:      "My Description",
				PasswordRequired: false,
			})
			So(e, ShouldBeNil)
			loadLink := &rest.ShareLink{Uuid: "link-uuid"}
			e = sc.LoadHashDocumentData(ctx, loadLink, []*idm.ACL{})
			So(e, ShouldBeNil)
			So(loadLink.LinkHash, ShouldEqual, "hash")
		})

		Convey("Test Index Mock", t, func() {
			cl := tree.NewNodeReceiverClient(grpc.ResolveConn(ctx, common.ServiceDataIndexGRPC_+"pydiods1"))
			resp, e := cl.CreateNode(ctx, &tree.CreateNodeRequest{Node: &tree.Node{Path: "/test", Type: tree.NodeType_COLLECTION, Size: 24, Etag: "etag"}})
			So(e, ShouldBeNil)
			So(resp, ShouldNotBeNil)
			So(resp.Node.Uuid, ShouldNotBeEmpty)

			cl2 := tree.NewNodeProviderClient(grpc.ResolveConn(context.TODO(), common.ServiceDataIndexGRPC_+"pydiods1"))
			st, e := cl2.ListNodes(ctx, &tree.ListNodesRequest{Node: &tree.Node{Path: "/"}})
			So(e, ShouldBeNil)
			var nn []*tree.Node
			for {
				r, e := st.Recv()
				if e != nil {
					break
				}
				nn = append(nn, r.GetNode())
			}
			So(len(nn), ShouldBeGreaterThanOrEqualTo, 1) // Some other tests may create data at the same time
		})

		SkipConvey("Test Tree Mock", t, func() {
			conn := grpc.ResolveConn(context.TODO(), common.ServiceTreeGRPC)
			conn2 := grpc.ResolveConn(context.TODO(), common.ServiceMetaGRPC)
			cl := tree.NewNodeReceiverClient(conn)
			resp, e := cl.CreateNode(ctx, &tree.CreateNodeRequest{Node: &tree.Node{Path: "/pydiods1/test", Type: tree.NodeType_COLLECTION, Size: 24, Etag: "etag"}})
			So(e, ShouldBeNil)
			So(resp, ShouldNotBeNil)
			So(resp.Node.Uuid, ShouldNotBeEmpty)
			clM := tree.NewNodeReceiverClient(conn2)
			clone := resp.Node.Clone()
			clone.MustSetMeta("namespace", "\"value\"")
			_, e = clM.CreateNode(ctx, &tree.CreateNodeRequest{Node: clone})
			So(e, ShouldBeNil)

			cl2 := tree.NewNodeProviderClient(conn)
			st, e := cl2.ListNodes(ctx, &tree.ListNodesRequest{Node: &tree.Node{Path: "/"}, Recursive: true})
			So(e, ShouldBeNil)
			var nn []*tree.Node
			var cloneRes *tree.Node
			for {
				r, e := st.Recv()
				t.Log("ListNodes Received", r, e)
				if e != nil {
					break
				}
				if r.GetNode().GetUuid() == clone.GetUuid() {
					cloneRes = r.GetNode()
				}
				nn = append(nn, r.GetNode())
			}
			So(len(nn), ShouldBeGreaterThanOrEqualTo, 6) // All DSS Roots + New Node
			So(cloneRes, ShouldNotBeEmpty)
			So(cloneRes.HasMetaKey("namespace"), ShouldBeTrue)
		})
	})
}
