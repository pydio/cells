package crossds_test

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
	"os"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	ggrpc "google.golang.org/grpc"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/compose"
	"github.com/pydio/cells/v5/common/nodes/encryption/encryptiontest"
	"github.com/pydio/cells/v5/common/nodes/models"
	omock "github.com/pydio/cells/v5/common/nodes/objects/mock"
	"github.com/pydio/cells/v5/common/proto/encryption"
	"github.com/pydio/cells/v5/common/proto/object"
	pb "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/server/stubs"
	"github.com/pydio/cells/v5/common/server/stubs/datatest"
	"github.com/pydio/cells/v5/common/server/stubs/inject"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/common/utils/cache/gocache"
	cache_helper "github.com/pydio/cells/v5/common/utils/cache/helper"
	"github.com/pydio/cells/v5/common/utils/openurl"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/uuid"
	keydao "github.com/pydio/cells/v5/data/key/dao/sql"
	keysrv "github.com/pydio/cells/v5/data/key/grpc"
	metadao "github.com/pydio/cells/v5/data/meta/dao/sql"
	metasrv "github.com/pydio/cells/v5/data/meta/grpc"
	idxdao "github.com/pydio/cells/v5/data/source/index/dao/sql"
	treesrv "github.com/pydio/cells/v5/data/tree/grpc"

	_ "github.com/pydio/cells/v5/common/utils/cache/gocache"
	_ "gocloud.dev/pubsub/mempubsub"

	. "github.com/smartystreets/goconvey/convey"
)

// Copy / move of single files between flat datasources, encrypted or not, through the real router,
// index, tree, meta and key services. Storage is in-memory, events go through the in-memory broker.

const (
	masterKeyID = "test-master-key"
	userMetaKey = "crossds_tag"
)

var (
	dss          = []string{"enc1", "enc2", "clear1"}
	clients      = map[string]*failingClient{}
	testServices = map[string]map[string]map[string]any{
		common.ServiceMetaGRPC:   {"sql": {"func": metadao.NewMetaDAO}},
		common.ServiceEncKeyGRPC: {"sql": {"func": keydao.NewKeyDAO}},
		common.ServiceTreeGRPC:   {},
	}
	testcases []test.ServicesStorageTestCase
	content   = strings.Repeat("0123456789", 20000)
)

func TestMain(m *testing.M) {
	cache_helper.SetStaticResolver("pm://", &gocache.URLOpener{})
	nodes.IsUnitTestEnv = true
	m.Run()
}

func init() {
	unique := uuid.New()[:6] + "_"
	sql.TestPrintQueries = false
	sources := map[string]nodes.LoadedSource{}
	for _, ds := range dss {
		testServices[common.ServiceDataIndexGRPC_+ds] = map[string]map[string]any{"sql": {"func": idxdao.NewDAO, "prefix": ds + "_"}}
		dsObj := &object.DataSource{Name: ds, ObjectsBucket: ds, FlatStorage: true}
		if strings.HasPrefix(ds, "enc") {
			dsObj.EncryptionMode = object.EncryptionMode_MASTER
			dsObj.EncryptionKey = masterKeyID
		}
		// One client per datasource, otherwise CopyObject treats them as the same storage
		clients[ds] = &failingClient{StorageClient: omock.New(ds)}
		sources[ds] = nodes.LoadedSource{DataSource: dsObj, Client: clients[ds]}
	}
	// Same cases as test.TemplateSQLService, with a per-service table prefix: each datasource index needs its own tables
	tablePrefix := "&hookNames=cleanTables&prefix=" + unique + "{{ .Meta.prefix }}"
	testcases = []test.ServicesStorageTestCase{{
		DSN:       map[string]string{"sql": sql.SqliteDriver + "://" + sql.SharedMemDSN + tablePrefix},
		Condition: os.Getenv("CELLS_TEST_SKIP_SQLITE") != "true",
		Services:  testServices,
		Label:     "Sqlite",
	}}
	for _, dsn := range strings.Split(os.Getenv("CELLS_TEST_MYSQL_DSN"), ";") {
		if dsn = strings.TrimSpace(dsn); dsn != "" {
			testcases = append(testcases, test.ServicesStorageTestCase{DSN: map[string]string{"sql": dsn + "?parseTime=true" + tablePrefix}, Condition: true, Services: testServices, Label: "Mysql"})
		}
	}
	for _, dsn := range strings.Split(os.Getenv("CELLS_TEST_PGSQL_DSN"), ";") {
		if dsn = strings.TrimSpace(dsn); dsn != "" {
			testcases = append(testcases, test.ServicesStorageTestCase{DSN: map[string]string{"sql": dsn + tablePrefix}, Condition: true, Services: testServices, Label: "Postgres"})
		}
	}
	nodes.SetSourcesPoolOpener(func(ctx context.Context) *openurl.Pool[nodes.SourcesPool] {
		return nodes.NewTestPoolWithSources(ctx, sources)
	})
}

func TestCrossDatasourceCopyMove(t *testing.T) {
	test.RunServicesTests(uuid.New(), testcases, t, func(ctx context.Context) {
		events := &eventLog{}
		Convey("Setup services and event subscribers", t, func() {
			So(datatest.RegisterDataServices(ctx), ShouldBeNil)
			So(registerServices(ctx, events), ShouldBeNil)
		})

		cli := compose.PathClientAdmin()
		pairs := [][2]string{{"enc1", "clear1"}, {"clear1", "enc1"}, {"enc1", "enc2"}}

		for _, move := range []bool{false, true} {
			for _, p := range pairs {
				src, dst, op := p[0], p[1], opName(move)
				Convey(fmt.Sprintf("%s %s => %s", op, src, dst), t, func() {
					srcPath, dstPath := src+"/"+op+"-to-"+dst+".txt", dst+"/"+op+"-from-"+src+".txt"
					srcNode := createSource(ctx, cli, srcPath)

					e := nodes.CopyMoveNodes(ctx, cli, srcNode, &tree.Node{Path: dstPath}, move, false, make(chan string, 100), make(chan float32, 100))
					settle()
					if e != nil {
						t.Log("events:\n" + events.String())
					}
					So(e, ShouldBeNil)

					target, data, er := readContent(ctx, cli, dstPath)
					So(er, ShouldBeNil)
					So(data == content, ShouldBeTrue)

					if move {
						_, er = cli.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: srcPath}})
						So(er, ShouldNotBeNil)
						So(target.GetUuid(), ShouldEqual, srcNode.GetUuid())
						So(readUserMeta(ctx, srcNode.GetUuid()), ShouldEqual, srcPath)
						if isEnc(dst) {
							So(hasKey(ctx, srcNode.GetUuid(), dst), ShouldBeTrue)
						}
						if isEnc(src) {
							// Source datasource key is dropped on the paired move event
							So(hasKey(ctx, srcNode.GetUuid(), src), ShouldBeFalse)
						}
					} else {
						So(target.GetUuid(), ShouldNotEqual, srcNode.GetUuid())
						_, srcData, er := readContent(ctx, cli, srcPath)
						So(er, ShouldBeNil)
						So(srcData == content, ShouldBeTrue)
						So(readUserMeta(ctx, srcNode.GetUuid()), ShouldEqual, srcPath)
					}
				})
			}
		}

		for _, p := range pairs {
			src, dst := p[0], p[1]
			Convey(fmt.Sprintf("Failed move %s => %s, then delete leftover target", src, dst), t, func() {
				srcPath, dstPath := src+"/failed-to-"+dst+".txt", dst+"/failed-from-"+src+".txt"
				srcNode := createSource(ctx, cli, srcPath)

				clients[dst].failPut.Store(true)
				e := nodes.CopyMoveNodes(ctx, cli, srcNode, &tree.Node{Path: dstPath}, true, false, make(chan string, 100), make(chan float32, 100))
				clients[dst].failPut.Store(false)
				settle()
				So(e, ShouldNotBeNil)

				Convey("Source is intact after the failure", func() {
					_, data, er := readContent(ctx, cli, srcPath)
					So(er, ShouldBeNil)
					So(data == content, ShouldBeTrue)
					So(readUserMeta(ctx, srcNode.GetUuid()), ShouldEqual, srcPath)
				})

				deleteLeftover := func() {
					if leftover, er := cli.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: dstPath}}); er == nil {
						t.Log("leftover target", leftover.GetNode().Zap())
						_, er = cli.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: leftover.GetNode()})
						So(er, ShouldBeNil)
						settle()
					}
				}

				Convey("Source content and keys are intact after deleting the leftover target", func() {
					deleteLeftover()
					_, data, er := readContent(ctx, cli, srcPath)
					So(er, ShouldBeNil)
					So(data == content, ShouldBeTrue)
					if isEnc(src) {
						So(hasKey(ctx, srcNode.GetUuid(), src), ShouldBeTrue)
					}
				})

				// Desired behavior, skipped as a known gap: meta (and ACLs, versions...) are cleaned by UUID on any DELETE event,
				// and the leftover shares the source UUID, so deleting it currently wipes the source metadata
				SkipConvey("Source metadata is intact after deleting the leftover target", func() {
					deleteLeftover()
					So(readUserMeta(ctx, srcNode.GetUuid()), ShouldEqual, srcPath)
				})
			})
		}
	})
}

func opName(move bool) string {
	if move {
		return "move"
	}
	return "copy"
}

func isEnc(ds string) bool {
	return strings.HasPrefix(ds, "enc")
}

// settle leaves time for broker events (and the tree move pairing, which waits 300ms) to be processed
func settle() {
	<-time.After(1500 * time.Millisecond)
}

// createSource uploads content at p and tags it with a user meta holding its path
func createSource(ctx context.Context, cli nodes.Client, p string) *tree.Node {
	_, er := cli.PutObject(ctx, &tree.Node{Path: p}, strings.NewReader(content), &models.PutRequestData{Size: int64(len(content))})
	So(er, ShouldBeNil)
	rsp, er := cli.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: p}})
	So(er, ShouldBeNil)
	n := rsp.GetNode()
	So(n.GetUuid(), ShouldNotBeEmpty)
	metaNode := &tree.Node{Uuid: n.GetUuid(), Path: p}
	metaNode.MustSetMeta(userMetaKey, p)
	_, er = tree.NewNodeReceiverClient(grpc.ResolveConn(ctx, common.ServiceMetaGRPC)).UpdateNode(ctx, &tree.UpdateNodeRequest{To: metaNode})
	So(er, ShouldBeNil)
	So(readUserMeta(ctx, n.GetUuid()), ShouldEqual, p)
	return n
}

func readContent(ctx context.Context, cli nodes.Client, p string) (*tree.Node, string, error) {
	rsp, er := cli.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: p}})
	if er != nil {
		return nil, "", er
	}
	r, er := cli.GetObject(ctx, rsp.GetNode(), &models.GetRequestData{Length: -1})
	if er != nil {
		return rsp.GetNode(), "", er
	}
	defer r.Close()
	b, er := io.ReadAll(r)
	return rsp.GetNode(), string(b), er
}

func readUserMeta(ctx context.Context, nodeUuid string) string {
	rsp, er := tree.NewNodeProviderClient(grpc.ResolveConn(ctx, common.ServiceMetaGRPC)).ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: nodeUuid}})
	if er != nil {
		return ""
	}
	return rsp.GetNode().GetStringMeta(userMetaKey)
}

func hasKey(ctx context.Context, nodeUuid, ds string) bool {
	_, er := encryption.NewNodeKeyManagerClient(grpc.ResolveConn(ctx, common.ServiceEncKeyGRPC)).GetNodeInfo(ctx, &encryption.GetNodeInfoRequest{NodeId: nodeUuid, UserId: "ds:" + ds})
	return er == nil
}

// registerServices replaces the datatest tree service with one whose event subscriber runs (it pairs cross-ds
// CREATE/DELETE into moves), wires the key service and a fixed master key, and subscribes the key and meta services
// to tree changes as their services do.
func registerServices(ctx context.Context, events *eventLog) error {
	svc := map[string]service.Service{}
	var reg registry.Registry
	if !propagator.Get(ctx, registry.ContextKey, &reg) {
		return fmt.Errorf("cannot find registry in context")
	}
	ii, _ := reg.List(registry.WithType(pb.ItemType_SERVICE))
	for _, item := range ii {
		svc[item.Name()] = item.(service.Service)
	}

	treeServer := treesrv.NewTreeServer("")
	for _, ds := range dss {
		conn := grpc.ResolveConn(ctx, common.ServiceDataIndexGRPC_+ds)
		treeServer.AppendDatasource(ctx, ds, treesrv.NewDataSource(ds, tree.NewNodeProviderClient(conn), tree.NewNodeReceiverClient(conn)))
	}
	mux := &stubs.MuxService{}
	mux.Register("tree.NodeProvider", &tree.NodeProviderStub{NodeProviderServer: treeServer})
	mux.Register("tree.NodeReceiver", &tree.NodeReceiverStub{NodeReceiverServer: treeServer})
	// In-process stubs share request pointers, unlike real gRPC: the tree server rewrites node.Path in place
	grpc.RegisterMock(common.ServiceTreeGRPC, &cloneArgsConn{ClientConnInterface: &inject.SvcInjectorMock{ClientConnInterface: mux, Svc: svc[common.ServiceTreeGRPC]}})

	keyStub := &encryptiontest.SetNodeInfoErrStub{NodeKeyManagerStub: encryption.NodeKeyManagerStub{NodeKeyManagerServer: keysrv.NewNodeKeyManagerHandler()}}
	grpc.RegisterMock(common.ServiceEncKeyGRPC, &inject.SvcInjectorMock{ClientConnInterface: keyStub, Svc: svc[common.ServiceEncKeyGRPC]})
	mk := make([]byte, 32)
	_, _ = rand.Read(mk)
	grpc.RegisterMock(common.ServiceUserKeyGRPC, &userKeyMock{content: base64.StdEncoding.EncodeToString(mk)})

	treeSubscriber := treesrv.NewEventSubscriber(treeServer)
	keyHandler := keysrv.NewNodeKeyManagerHandler()
	metaEngine := metasrv.NewMetaServer(ctx, "sample")

	subscribe := func(topic, name string, h func(context.Context, *tree.NodeChangeEvent) error) error {
		return broker.SubscribeCancellable(ctx, topic, func(ctx context.Context, message broker.Message) error {
			msg := &tree.NodeChangeEvent{}
			ct, e := message.Unmarshal(ctx, msg)
			if e != nil {
				return e
			}
			return h(ct, msg)
		}, broker.WithCounterName("crossds_"+name))
	}
	if e := subscribe(common.TopicIndexChanges, "tree", treeSubscriber.Handle); e != nil {
		return e
	}
	for _, topic := range []string{common.TopicIndexChanges, common.TopicTreeChanges} {
		tp := topic
		if e := subscribe(tp, "log"+tp, func(_ context.Context, msg *tree.NodeChangeEvent) error {
			events.add(tp, msg)
			return nil
		}); e != nil {
			return e
		}
	}
	if e := subscribe(common.TopicTreeChanges, "key", func(ct context.Context, msg *tree.NodeChangeEvent) error {
		return keyHandler.HandleTreeChanges(propagator.With(ct, service.ContextKey, svc[common.ServiceEncKeyGRPC]), msg)
	}); e != nil {
		return e
	}
	return subscribe(common.TopicTreeChanges, "meta", func(ct context.Context, msg *tree.NodeChangeEvent) error {
		if msg.Optimistic {
			return nil
		}
		return metaEngine.ProcessEvent(propagator.With(ct, service.ContextKey, svc[common.ServiceMetaGRPC]), msg)
	})
}

type eventLog struct {
	sync.Mutex
	lines []string
}

func (l *eventLog) add(topic string, msg *tree.NodeChangeEvent) {
	l.Lock()
	defer l.Unlock()
	l.lines = append(l.lines, fmt.Sprintf("%s %s %s %s => %s", topic, msg.Type, msg.GetSource().GetUuid()+msg.GetTarget().GetUuid(), msg.GetSource().GetPath(), msg.GetTarget().GetPath()))
}

func (l *eventLog) String() string {
	l.Lock()
	defer l.Unlock()
	return strings.Join(l.lines, "\n")
}

// failingClient makes PutObject return an error after the object is written (e.g. a timeout once uploaded),
// leaving a target object behind like a failed key save does
type failingClient struct {
	nodes.StorageClient
	failPut atomic.Bool
}

func (f *failingClient) PutObject(ctx context.Context, bucketName, objectName string, reader io.Reader, objectSize int64, opts models.PutMeta) (models.ObjectInfo, error) {
	oi, er := f.StorageClient.PutObject(ctx, bucketName, objectName, reader, objectSize, opts)
	if er == nil && f.failPut.Load() {
		return models.ObjectInfo{}, fmt.Errorf("injected PutObject failure")
	}
	return oi, er
}

type userKeyMock struct {
	content string
}

func (u *userKeyMock) Invoke(ctx context.Context, method string, args, reply any, opts ...ggrpc.CallOption) error {
	if method != "/encryption.UserKeyStore/GetKey" {
		return fmt.Errorf("%s not implemented", method)
	}
	reply.(*encryption.GetKeyResponse).Key = &encryption.Key{ID: masterKeyID, Content: u.content}
	return nil
}

func (u *userKeyMock) NewStream(ctx context.Context, desc *ggrpc.StreamDesc, method string, opts ...ggrpc.CallOption) (ggrpc.ClientStream, error) {
	return nil, fmt.Errorf("%s not implemented", method)
}

// cloneArgsConn copies requests before handing them to an in-process stub, as gRPC serialization would.
type cloneArgsConn struct {
	ggrpc.ClientConnInterface
}

func (c *cloneArgsConn) Invoke(ctx context.Context, method string, args, reply any, opts ...ggrpc.CallOption) error {
	if m, ok := args.(proto.Message); ok {
		args = proto.Clone(m)
	}
	return c.ClientConnInterface.Invoke(ctx, method, args, reply, opts...)
}
