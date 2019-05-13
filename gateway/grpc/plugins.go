package grpc

import (
	"fmt"
	"time"

	"github.com/pydio/cells/common/proto/tree"
	service2 "github.com/pydio/cells/common/service/proto"

	"github.com/micro/go-micro"
	"github.com/micro/go-micro/broker"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
)

func init() {
	plugins.Register(func() {
		service.NewService(
			service.Name(common.SERVICE_GATEWAY_GRPC),
			service.Tag(common.SERVICE_TAG_GATEWAY),
			service.RouterDependencies(),
			service.Description("GRPC Gateway to services"),
			func(o *service.ServiceOptions) {
				o.Version = common.Version().String()
				o.Micro = micro.NewService()

				o.MicroInit = func(s service.Service) error {

					name := s.Name()
					ctx := servicecontext.WithServiceName(s.Options().Context, name)

					s.Options().Micro.Init(
						micro.Client(defaults.NewClient()),
						micro.Server(defaults.NewServer()),
						micro.Registry(defaults.Registry()),
						micro.RegisterTTL(time.Second*30),
						micro.RegisterInterval(time.Second*10),
						micro.Transport(defaults.Transport()),
						micro.Broker(defaults.Broker()),
					)

					meta := registry.BuildServiceMeta()
					// context is always added last - so that there is no override
					s.Options().Micro.Init(
						micro.Context(ctx),
						micro.Name(name),
						micro.WrapClient(servicecontext.SpanClientWrapper),
						micro.Metadata(meta),
						micro.AfterStart(func() error {
							h := &TreeHandler{}
							tree.RegisterNodeProviderHandler(s.Options().Micro.Server(), h)
							sh := &service.StatusHandler{}
							fmt.Println(s.Address())
							sh.SetAddress(s.Address())
							st := &service.StopHandler{}
							st.SetService(s)
							service2.RegisterServiceHandler(s.Options().Micro.Server(), sh)
							micro.RegisterSubscriber(common.TOPIC_SERVICE_STOP, s.Options().Micro.Server(), st)

							log.Logger(ctx).Info("started")
							return nil
						}),
						micro.BeforeStop(func() error {
							log.Logger(ctx).Info("stopping")
							return nil
						}),
						micro.AfterStart(func() error {
							return broker.Publish(common.TOPIC_SERVICE_START, &broker.Message{Body: []byte(name)})
						}),
					)

					return nil
				}

			},
		)
	})

}
