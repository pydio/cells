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
	"log"
	"net/http"
	"path"
	"testing"

	"github.com/spf13/viper"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config/mock"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/compose"
	nodescontext "github.com/pydio/cells/v4/common/nodes/context"
	"github.com/pydio/cells/v4/common/permissions"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server/stubs/datatest"
	"github.com/pydio/cells/v4/common/server/stubs/idmtest"
	"github.com/pydio/cells/v4/common/server/stubs/resttest"
	grpc2 "github.com/pydio/cells/v4/data/tree/grpc"
	"github.com/pydio/cells/v4/idm/share"
	rest2 "github.com/pydio/cells/v4/idm/share/rest"

	_ "github.com/pydio/cells/v4/common/utils/cache/gocache"

	. "github.com/smartystreets/goconvey/convey"
)

func TestMain(m *testing.M) {

	v := viper.New()
	v.SetDefault(runtime.KeyCache, "pm://")
	v.SetDefault(runtime.KeyShortCache, "pm://")
	runtime.SetRuntime(v)

	grpc2.UnitTests = true

	//_ = broker.Connect()
	nodes.UseMockStorageClientType()

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

	_ = broker.SubscribeCancellable(context.Background(), common.TopicIdmEvent, func(ctx context.Context, message broker.Message) error {
		msg := &idm.ChangeEvent{}
		if _, e := message.Unmarshal(ctx, msg); e == nil {
			fmt.Println(" - Received an idm.ChangeEvent!", msg)
		}
		return nil
	}, broker.WithCounterName("share"))

	m.Run()
}

func TestShareLinks(t *testing.T) {

	Convey("Test CRUD Share Link on File", t, func() {

		ctx := context.Background()
		ctx = nodescontext.WithSourcesPool(ctx, nodes.NewTestPool(ctx))
		u, e := permissions.SearchUniqueUser(ctx, "admin", "")
		So(e, ShouldBeNil)
		ctx = auth.WithImpersonate(ctx, u)

		newNode := &tree.Node{Path: "pydiods1/file.ex", Type: tree.NodeType_LEAF, Size: 24}
		nc := tree.NewNodeReceiverClient(grpc.ResolveConn(ctx, common.ServiceTree))
		cR, e := nc.CreateNode(ctx, &tree.CreateNodeRequest{Node: newNode})
		So(e, ShouldBeNil)
		newNode = cR.GetNode()
		So(newNode.Uuid, ShouldNotBeEmpty)

		h := rest2.NewSharesHandler(ctx)
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
		hiddenUser, e := permissions.SearchUniqueUser(context.Background(), outputLink.UserLogin, "")
		So(e, ShouldBeNil)
		So(hiddenUser.Attributes, ShouldContainKey, "hidden")
		hiddenCtx := auth.WithImpersonate(context.Background(), hiddenUser)

		ws, e := permissions.SearchUniqueWorkspace(hiddenCtx, outputLink.Uuid, "")
		So(e, ShouldBeNil)
		slugRoot := ws.GetSlug()

		// Create slug/
		hash := md5.New()
		hash.Write([]byte(newNode.Uuid))
		rand := hex.EncodeToString(hash.Sum(nil))
		rootKey := rand[0:8] + "-" + path.Base(newNode.GetPath())

		read, e := compose.PathClient(ctx).ReadNode(hiddenCtx, &tree.ReadNodeRequest{Node: &tree.Node{Path: path.Join(slugRoot, rootKey)}})
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
}

func TestBasicMocks(t *testing.T) {
	bg := context.Background()
	Convey("Test Basic Docstore Mock", t, func() {
		sc := share.NewClient(context.Background(), nil)
		e := sc.StoreHashDocument(bg, &idm.User{Uuid: "uuid", Login: "login"}, &rest.ShareLink{
			Uuid:             "link-uuid",
			LinkHash:         "hash",
			Label:            "My Link",
			Description:      "My Description",
			PasswordRequired: false,
		})
		So(e, ShouldBeNil)
		loadLink := &rest.ShareLink{Uuid: "link-uuid"}
		e = sc.LoadHashDocumentData(bg, loadLink, []*idm.ACL{})
		So(e, ShouldBeNil)
		So(loadLink.LinkHash, ShouldEqual, "hash")
	})

	Convey("Test Index Mock", t, func() {
		cl := tree.NewNodeReceiverClient(grpc.ResolveConn(context.TODO(), common.ServiceDataIndex_+"pydiods1"))
		resp, e := cl.CreateNode(bg, &tree.CreateNodeRequest{Node: &tree.Node{Path: "/test", Type: tree.NodeType_COLLECTION, Size: 24, Etag: "etag"}})
		So(e, ShouldBeNil)
		So(resp, ShouldNotBeNil)
		So(resp.Node.Uuid, ShouldNotBeEmpty)

		cl2 := tree.NewNodeProviderClient(grpc.ResolveConn(context.TODO(), common.ServiceDataIndex_+"pydiods1"))
		st, e := cl2.ListNodes(bg, &tree.ListNodesRequest{Node: &tree.Node{Path: "/"}})
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

	Convey("Test Tree Mock", t, func() {
		conn := grpc.ResolveConn(context.TODO(), common.ServiceTree)
		conn2 := grpc.ResolveConn(context.TODO(), common.ServiceMeta)
		cl := tree.NewNodeReceiverClient(conn)
		resp, e := cl.CreateNode(bg, &tree.CreateNodeRequest{Node: &tree.Node{Path: "/pydiods1/test", Type: tree.NodeType_COLLECTION, Size: 24, Etag: "etag"}})
		So(e, ShouldBeNil)
		So(resp, ShouldNotBeNil)
		So(resp.Node.Uuid, ShouldNotBeEmpty)
		clM := tree.NewNodeReceiverClient(conn2)
		clone := resp.Node.Clone()
		clone.MustSetMeta("namespace", "\"value\"")
		_, e = clM.CreateNode(bg, &tree.CreateNodeRequest{Node: clone})
		So(e, ShouldBeNil)

		cl2 := tree.NewNodeProviderClient(conn)
		st, e := cl2.ListNodes(bg, &tree.ListNodesRequest{Node: &tree.Node{Path: "/"}, Recursive: true})
		So(e, ShouldBeNil)
		var nn []*tree.Node
		var cloneRes *tree.Node
		for {
			r, e := st.Recv()
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
}
