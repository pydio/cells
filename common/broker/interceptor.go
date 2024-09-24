package broker

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/pydio/cells/v4/common/middleware"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

func TimeoutSubscriberInterceptor() SubscriberInterceptor {
	return func(ctx context.Context, m Message, handler SubscriberHandler) error {
		var dd []string
		dd = append(dd, ctx.Value("CalleeFile").(string))
		dd = append(dd, ctx.Value("CalleeLine").(string))
		dd = append(dd, ctx.Value("CalleeTopic").(string))

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
