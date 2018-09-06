package frontend

import (
	"context"

	"github.com/emicklei/go-restful"
	"github.com/gorilla/sessions"
	"github.com/pydio/cells/common/proto/rest"
)

// RegistryModifier is a func type for dynamically filtering output of the registry
type RegistryModifier func(ctx context.Context, status RequestStatus, registry *Cpydio_registry) error

// PluginModifier is a func type for dynamically filtering the content of a plugin (e.g enabled/disabled),
// based on the current status
type PluginModifier func(ctx context.Context, status RequestStatus, plugin Plugin) error

// PluginModifier is a func type for dynamically filtering the content of a plugin (e.g enabled/disabled),
// based on the current status
type BootConfModifier func(bootConf *BootConf) error

type EnrollMiddlewareFunc func(req *restful.Request, rsp *restful.Response, inputRequest *rest.FrontEnrollAuthRequest) bool

type FrontMiddleware struct {
	Endpoint   string
	Middleware EnrollMiddlewareFunc
}

type AuthMiddleware func(req *restful.Request, rsp *restful.Response, in *rest.FrontSessionRequest, out *rest.FrontSessionResponse, session *sessions.Session) error

var (
	pluginsModifier   []PluginModifier
	bootConfModifiers []BootConfModifier
	modifiers         []RegistryModifier
	enrollMiddlewares []FrontMiddleware
	authMiddlewares   AuthMiddleware
)

// RegisterRegModifier appends a RegistryModifier to the list
func RegisterRegModifier(modifier RegistryModifier) {
	modifiers = append(modifiers, modifier)
}

// ApplyRegModifiers can filter the output of registry before sending, based on status
func ApplyRegModifiers(ctx context.Context, status RequestStatus, registry *Cpydio_registry) error {

	for _, m := range modifiers {
		if e := m(ctx, status, registry); e != nil {
			return e
		}
	}

	return nil
}

// RegisterPluginModifier appends a PluginModifier to the list
func RegisterPluginModifier(modifier PluginModifier) {
	pluginsModifier = append(pluginsModifier, modifier)
}

// ApplyPluginModifiers is called to apply all registered modifiers on a given plugin
func ApplyPluginModifiers(ctx context.Context, status RequestStatus, plugin Plugin) error {

	for _, m := range pluginsModifier {
		if e := m(ctx, status, plugin); e != nil {
			return e
		}
	}

	return nil

}

// RegisterPluginModifier appends a BootConfModifier to the list
func RegisterBootConfModifier(modifier BootConfModifier) {
	bootConfModifiers = append(bootConfModifiers, modifier)
}

// ApplyPluginModifiers is called to apply all registered modifiers on the boot configuration
func ApplyBootConfModifiers(bootConf *BootConf) error {

	for _, m := range bootConfModifiers {
		if e := m(bootConf); e != nil {
			return e
		}
	}

	return nil

}

// RegisterEnrollMiddleware registers a middleware for a given endpoint
func RegisterEnrollMiddleware(endpoint string, middleware EnrollMiddlewareFunc) {
	enrollMiddlewares = append(enrollMiddlewares, FrontMiddleware{
		Endpoint:   endpoint,
		Middleware: middleware,
	})
}

// ApplyEnrollMiddlewares goes through registered middlewares if there are any for the current endpoint
func ApplyEnrollMiddlewares(endpoint string, req *restful.Request, rsp *restful.Response) bool {

	var request rest.FrontEnrollAuthRequest
	req.ReadEntity(&request)
	for _, m := range enrollMiddlewares {
		if m.Endpoint != endpoint {
			continue
		}
		if breakNow := m.Middleware(req, rsp, &request); breakNow {
			return true
		}
	}

	return false
}

func WrapAuthMiddleware(middleware func(middleware AuthMiddleware) AuthMiddleware) {
	if authMiddlewares == nil {
		// First register, create a noop middleware
		authMiddlewares = func(req *restful.Request, rsp *restful.Response, in *rest.FrontSessionRequest, out *rest.FrontSessionResponse, session *sessions.Session) error {
			return nil
		}
	}
	authMiddlewares = middleware(authMiddlewares)
}

func ApplyAuthMiddlewares(req *restful.Request, rsp *restful.Response, in *rest.FrontSessionRequest, out *rest.FrontSessionResponse, session *sessions.Session) error {
	return authMiddlewares(req, rsp, in, out, session)
}
