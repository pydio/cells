package service

import (
	"context"
	"encoding/json"
	"testing"

	"google.golang.org/grpc"

	cgrpc "github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	pb "github.com/pydio/cells/v5/common/proto/config"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/kv"
	"github.com/pydio/cells/v5/common/utils/watch"

	_ "embed"
	_ "github.com/pydio/cells/v5/common/registry/config"
	_ "github.com/pydio/cells/v5/common/server/grpc"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	//go:embed remote_test.yaml
	connectionTestTemplate string
)

type testHandler struct {
	pb.UnimplementedConfigServer
	store   config.Store
	watcher watch.Watcher
}

func (t *testHandler) Get(ctx context.Context, request *pb.GetRequest) (*pb.GetResponse, error) {
	b, err := json.Marshal(t.store.Val(request.GetPath()).Get())
	if err != nil {
		return nil, err
	}
	return &pb.GetResponse{Value: &pb.Value{
		Data: b,
	}}, nil
}

func (t *testHandler) Set(ctx context.Context, request *pb.SetRequest) (*pb.SetResponse, error) {
	var data any
	if err := json.Unmarshal(request.GetValue().GetData(), &data); err != nil {
		return nil, errors.WithMessage(errors.StatusInternalServerError, err.Error())
	}
	t.store.Val(request.GetPath()).Set(data)
	return &pb.SetResponse{}, nil
}

func (t *testHandler) Delete(ctx context.Context, request *pb.DeleteRequest) (*pb.DeleteResponse, error) {
	if err := t.store.Val(request.GetPath()).Del(); err != nil {
		return nil, err
	}

	return &pb.DeleteResponse{}, nil
}

func (t *testHandler) Watch(request *pb.WatchRequest, stream pb.Config_WatchServer) error {
	w, err := t.watcher.Watch(watch.WithPath(request.GetPath()))
	if err != nil {
		return err
	}

	defer w.Stop()

	for {
		res, err := w.Next()
		if err != nil {
			return err
		}

		if v, ok := res.(configx.Values); ok {
			stream.Send(&pb.WatchResponse{
				Value: &pb.Value{
					Data: v.Bytes(),
				},
			})
		}
	}

	return nil
}

func TestManagerConnection(t *testing.T) {

	test.RunTests(t, func(ctx context.Context) {
		runtime.Register("test", func(ctx context.Context) {
			service.NewService(
				service.Name("service.test"),
				service.Context(ctx),
				service.WithGRPC(func(ctx context.Context, registrar grpc.ServiceRegistrar) error {
					st := kv.NewStore()
					w := watch.NewWatcher[kv.Store](st)
					pb.RegisterConfigServer(registrar, &testHandler{
						store:   st,
						watcher: w,
					})
					return nil
				}),
			)
		})
	}, func(ctx context.Context) {

		Convey("Testing the manager connections", t, func() {

			conn := cgrpc.ResolveConn(ctx, "service.test")
			So(conn, ShouldNotBeNil)

			c := New(ctx, conn, "", "")
			err := c.Val("whatever").Set("whatever")
			So(err, ShouldBeNil)

			str := c.Val("whatever").String()
			So(str, ShouldEqual, "whatever")

		})
	})
}
