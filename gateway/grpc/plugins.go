package grpc

import (
	"context"

	"github.com/micro/go-micro"
	"github.com/micro/go-micro/metadata"
	"github.com/micro/go-micro/server"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
)

func init() {

	plugins.Register(func() {
		service.NewService(
			service.Name(common.SERVICE_GATEWAY_GRPC),
			service.Tag(common.SERVICE_TAG_GATEWAY),
			service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_TREE, []string{}),
			service.Description("External GRPC Access"),
			service.WithMicro(func(m micro.Service) error {

				m.Init(micro.WrapHandler(JWTWrapper(m.Options().Context)))

				h := &TreeHandler{}
				srv := m.Options().Server
				tree.RegisterNodeProviderHandler(srv, h)
				tree.RegisterNodeReceiverHandler(srv, h)
				tree.RegisterNodeChangesStreamerHandler(srv, h)

				return nil
			}),
		)
	})

}

func JWTWrapper(serviceCtx context.Context) func(handlerFunc server.HandlerFunc) server.HandlerFunc {

	return func(handlerFunc server.HandlerFunc) server.HandlerFunc {

		jwtVerifier := auth.DefaultJWTVerifier()

		return func(ctx context.Context, req server.Request, rsp interface{}) error {

			if meta, ok := metadata.FromContext(ctx); ok {

				bearer, o := meta["x-pydio-bearer"] //strings.Join(meta.Get("x-pydio-bearer"), "")
				if o {
					var err error
					ctx, _, err = jwtVerifier.Verify(ctx, bearer)
					if err != nil {
						log.Auditer(serviceCtx).Error(
							"Blocked invalid JWT",
							log.GetAuditId(common.AUDIT_INVALID_JWT),
						)
						return err
					} else {
						log.Logger(serviceCtx).Debug("Got valid Claims from Bearer!")
					}
				}
			}

			return handlerFunc(ctx, req, rsp)

		}
	}

}
