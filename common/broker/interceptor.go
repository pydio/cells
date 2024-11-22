package broker

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/pydio/cells/v5/common/middleware"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

func TimeoutSubscriberInterceptor() SubscriberInterceptor {
	return func(ctx context.Context, m Message, handler SubscriberHandler) error {
		var dd []string
		if cf, ok := ctx.Value("CalleeFile").(string); ok {
			dd = append(dd, cf)
		}
		if cl, ok := ctx.Value("CalleeLine").(string); ok {
			dd = append(dd, cl)
		}
		if ct, ok := ctx.Value("CalleeTopic").(string); ok {
			dd = append(dd, ct)
		}

		d := make(chan bool, 1)
		defer close(d)
		go func() {
			select {
			case <-d:
				break
			case <-time.After(20 * time.Second):
				fmt.Println(os.Getpid(), "A Handler has not returned after 20s !", strings.Join(dd, "|"), " - This subscription will be blocked!")
			}
		}()

		return handler(ctx, m)
	}
}

func HeaderInjectorInterceptor() SubscriberInterceptor {
	return func(ctx context.Context, m Message, handler SubscriberHandler) error {
		header, _ := m.RawData()
		return handler(propagator.WithAdditionalMetadata(ctx, header), m)
	}
}

func ContextInjectorInterceptor() SubscriberInterceptor {
	return func(ctx context.Context, m Message, handler SubscriberHandler) error {
		if ct, ok, er := middleware.ApplyGRPCIncomingContextModifiers(ctx); ok && er == nil {
			return handler(ct, m)
		}
		return handler(ctx, m)
	}
}
