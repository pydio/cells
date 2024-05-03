package broker

import (
	"context"
	"fmt"
	"os"
	"runtime/debug"
	"time"

	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"github.com/pydio/cells/v4/common"
	clientcontext "github.com/pydio/cells/v4/common/client/context"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
	"github.com/pydio/cells/v4/common/service/context/metadata"
)

func TimeoutSubscriberInterceptor() SubscriberInterceptor {
	return func(ctx context.Context, m Message, handler SubscriberHandler) error {
		dd := debug.Stack()

		d := make(chan bool, 1)
		defer close(d)
		go func() {
			select {
			case <-d:
				break
			case <-time.After(20 * time.Second):
				// TODO - topic in meta ?
				fmt.Println(os.Getpid(), "A Handler has not returned after 20s !", string(dd), " - This subscription will be blocked!")
			}
		}()

		return handler(ctx, m)
	}
}

var (
	clientConns = make(map[string]grpc.ClientConnInterface)
	configStore = make(map[string]config.Store)
)

func setContextForTenant(ctx context.Context, tenant string) context.Context {
	cc, ok := clientConns[tenant]
	if !ok {
		cc, _ = grpc.Dial("xds://"+tenant+".cells.com/cells",
			grpc.WithChainUnaryInterceptor(otelgrpc.UnaryClientInterceptor()),
			grpc.WithChainStreamInterceptor(otelgrpc.StreamClientInterceptor()),
			grpc.WithTransportCredentials(insecure.NewCredentials()))

		clientConns[tenant] = cc
	}
	ctx = clientcontext.WithClientConn(ctx, cc)

	cfg, ok := configStore[tenant]
	if !ok {
		cfg, _ = config.OpenStore(ctx, "xds://"+tenant+".cells.com/cells")
		configStore[tenant] = cfg
	}
	return runtimecontext.With(ctx, config.ContextKey, cfg)
}

func HeaderInjectorInterceptor() SubscriberInterceptor {
	return func(ctx context.Context, m Message, handler SubscriberHandler) error {
		header, _ := m.RawData()

		return handler(metadata.WithAdditionalMetadata(ctx, header), m)
	}
}

func ContextInjectorInterceptor() SubscriberInterceptor {
	return func(ctx context.Context, m Message, handler SubscriberHandler) error {
		tenant := "default"
		header, _ := m.RawData()
		if t, ok := header[common.XPydioTenantUuid]; ok {
			tenant = t
		}

		return handler(setContextForTenant(ctx, tenant), m)
	}
}
