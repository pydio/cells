package grpc

import (
	"context"
	"time"

	"github.com/pydio/cells/common/config"
	"github.com/spf13/viper"

	"github.com/pydio/cells/common/crypto/providers"
	"github.com/pydio/cells/common/proto/install"

	"github.com/micro/go-micro"
	"github.com/micro/go-micro/metadata"
	"github.com/micro/go-micro/server"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
	servicecontext "github.com/pydio/cells/common/service/context"
)

func init() {

	// Build options - optionally force port
	opts := []service.ServiceOption{
		service.Name(common.SERVICE_GATEWAY_GRPC),
		service.Tag(common.SERVICE_TAG_GATEWAY),
		service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_TREE, []string{}),
		service.Dependency(common.SERVICE_GATEWAY_PROXY, []string{}),
		service.Description("External gRPC Access"),
		service.WithMicro(func(m micro.Service) error {
			m.Init(micro.WrapHandler(jwtWrapper(m.Options().Context), httpMetaWrapper()))
			h := &TreeHandler{}
			srv := m.Options().Server
			tree.RegisterNodeProviderHandler(srv, h)
			tree.RegisterNodeReceiverHandler(srv, h)
			tree.RegisterNodeChangesStreamerHandler(srv, h)
			tree.RegisterNodeProviderStreamerHandler(srv, h)
			tree.RegisterNodeReceiverStreamHandler(srv, h)
			return nil
		}),
	}
	plugins.Register(func() {
		ss, _ := config.LoadSites()
		if len(ss) == 1 && !ss[0].HasTLS() {
			// This is a simple config without TLS - Access will be direct not through proxy
			//fmt.Println("[NO-TLS] " + common.SERVICE_GATEWAY_GRPC + " served as HTTP and should be accessed directly (no TLS)")
			if port := viper.Get("grpc_external"); port != nil {
				opts = append(opts, service.Port(port.(string)))
			}
		} else {
			localConfig := &install.ProxyConfig{
				Binds:     []string{common.SERVICE_GATEWAY_GRPC},
				TLSConfig: &install.ProxyConfig_SelfSigned{SelfSigned: &install.TLSSelfSigned{}},
			}
			if tls, e := providers.LoadTLSServerConfig(localConfig); e == nil {
				//fmt.Println("[TLS] Activating self-signed TLS on " + common.SERVICE_GATEWAY_GRPC)
				opts = append(opts, service.WithTLSConfig(tls))
			}
		}
		service.NewService(opts...)
	})

}

// jwtWrapper extracts x-pydio-bearer metadata to validate authentication
func jwtWrapper(serviceCtx context.Context) func(handlerFunc server.HandlerFunc) server.HandlerFunc {

	jwtVerifier := auth.DefaultJWTVerifier()

	return func(handlerFunc server.HandlerFunc) server.HandlerFunc {

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

// httpMetaWrapper translates gRPC meta headers (lowercase x-header-name) to standard cells metadata
func httpMetaWrapper() func(handlerFunc server.HandlerFunc) server.HandlerFunc {

	return func(handlerFunc server.HandlerFunc) server.HandlerFunc {
		return func(ctx context.Context, req server.Request, rsp interface{}) error {

			return handlerFunc(ctxRequestInfoToMetadata(ctx), req, rsp)

		}
	}
}

func ctxRequestInfoToMetadata(ctx context.Context) context.Context {

	meta := metadata.Metadata{}
	if existing, ok := metadata.FromContext(ctx); ok {
		if _, already := existing[servicecontext.HttpMetaExtracted]; already {
			return ctx
		}
		translate := map[string]string{
			"user-agent":      servicecontext.HttpMetaUserAgent,
			"content-type":    servicecontext.HttpMetaContentType,
			"x-forwarded-for": servicecontext.HttpMetaRemoteAddress,
			"x-pydio-span-id": servicecontext.SpanMetadataId,
		}
		for k, v := range existing {
			if newK, ok := translate[k]; ok {
				meta[newK] = v
			} else {
				meta[k] = v
			}
		}
		// Override with specific header
		if ua, ok := existing["x-pydio-grpc-user-agent"]; ok {
			meta[servicecontext.HttpMetaUserAgent] = ua
		}
	}
	meta[servicecontext.HttpMetaExtracted] = servicecontext.HttpMetaExtracted
	layout := "2006-01-02T15:04-0700"
	t := time.Now()
	meta[servicecontext.ServerTime] = t.Format(layout)
	// We currently use server time instead of client time. TODO: Retrieve client time and locale and set it here.
	meta[servicecontext.ClientTime] = t.Format(layout)

	return metadata.NewContext(ctx, meta)
}
