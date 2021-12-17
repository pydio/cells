package service

import (
	"context"
	"crypto/tls"
	"github.com/micro/go-micro/web"
	"net/http"
	"regexp"

	"github.com/micro/go-web"
	"github.com/spf13/pflag"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/dao"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service/frontend"
	"github.com/pydio/cells/x/configx"
)

type dependency struct {
	Name string
	Tag  []string
}

// ServiceOptions 存储 pydio service 的所有 option
type ServiceOptions struct {
	Name string // 作为 micro 的 Name。micro 服务名
	Tags []string

	Version     string // 版本
	Description string // 描述
	Source      string

	Context context.Context    // 上下文
	Cancel  context.CancelFunc // 服务停止的时候执行

	DAO        func(dao.DAO) dao.DAO
	Prefix     interface{}
	Migrations []*Migration

	Port      string // 端口
	TLSConfig *tls.Config

	Micro Runnable
	Web   web.Service

	Dependencies []*dependency // 依赖哪些服务

	// Starting options
	AutoStart   bool // 是否自动启动
	AutoRestart bool // 是否自动重启
	Fork        bool
	Unique      bool
	Cluster     registry.Cluster

	Registry registry.Registry

	Regexp *regexp.Regexp
	Flags  pflag.FlagSet

	MinNumberOfNodes int

	// Before and After funcs
	BeforeInit  []func(Service) error
	AfterInit   []func(Service) error
	BeforeStart []func(Service) error
	AfterStart  []func(Service) error
	BeforeStop  []func(Service) error
	AfterStop   []func(Service) error

	OnRegexpMatch func(Service, []string) error

	// Micro init
	MicroInit   func(Service) error
	MicroCancel context.CancelFunc

	// Web init
	WebInit         func(Service) error
	webHandlerWraps []func(http.Handler) http.Handler

	// Watcher
	Watchers map[string][]func(Service, configx.Values)
}

// ServiceOption function to set ServiceOptions
type ServiceOption func(*ServiceOptions)

func newOptions(opts ...ServiceOption) ServiceOptions {
	opt := ServiceOptions{}

	opt.Registry = registry.Default
	opt.AutoStart = true
	opt.Watchers = make(map[string][]func(Service, configx.Values))

	for _, o := range opts {
		o(&opt)
	}

	return opt
}

// Name option for a service
func Name(n string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Name = n
	}
}

// Version option for a service
func Version(v string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Version = v
	}
}

// Migrations option for a service
func Migrations(migrations []*Migration) ServiceOption {
	return func(o *ServiceOptions) {
		o.Migrations = migrations
	}
}

// Tag option for a service
func Tag(t ...string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Tags = append(o.Tags, t...)
	}
}

// 服务的描述
func Description(d string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Description = d
	}
}

// Source option for a service
func Source(s string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Source = s
	}
}

// Context option for a service
func Context(c context.Context) ServiceOption {
	return func(o *ServiceOptions) {
		o.Context = c
	}
}

// Cancel option for a service
func Cancel(c context.CancelFunc) ServiceOption {
	return func(o *ServiceOptions) {
		o.Cancel = c
	}
}

// Regexp option for a service
func Regexp(r string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Name = r // We temporary save the regexp as name to ensure it's different from one service to another
		o.Regexp = regexp.MustCompile(r)
	}
}

// Port option for a service
func Port(p string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Port = p
	}
}

// WithTLSConfig option for a service
func WithTLSConfig(c *tls.Config) ServiceOption {
	return func(o *ServiceOptions) {
		o.TLSConfig = c
	}
}

// AutoStart option for a service
func AutoStart(b bool) ServiceOption {
	return func(o *ServiceOptions) {
		o.AutoStart = b
	}
}

// Fork option for a service
func Fork(b bool) ServiceOption {
	return func(o *ServiceOptions) {
		o.Fork = b
	}
}

// Unique option for a service
func Unique(b bool) ServiceOption {
	return func(o *ServiceOptions) {
		o.Unique = b
	}
}

// Cluster option for a service
func Cluster(c registry.Cluster) ServiceOption {
	return func(o *ServiceOptions) {
		o.Cluster = c
	}
}

// Dependency option for a service
func Dependency(n string, t []string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Dependencies = append(o.Dependencies, &dependency{n, t})
	}
}

// RouterDependencies option for a service
func RouterDependencies() ServiceOption {
	return func(o *ServiceOptions) {
		routerDependencies := []string{
			common.ServiceTree,
			common.ServiceAcl,
			common.ServiceVersions,
			common.ServiceDocStore,
		}
		for _, s := range routerDependencies {
			o.Dependencies = append(o.Dependencies, &dependency{common.ServiceGrpcNamespace_ + s, []string{}})
		}
	}
}

// PluginBoxes option for a service
func PluginBoxes(boxes ...frontend.PluginBox) ServiceOption {
	return func(o *ServiceOptions) {
		o.Dependencies = append(o.Dependencies, &dependency{common.ServiceWebNamespace_ + common.ServiceFrontStatics, []string{}})
		frontend.RegisterPluginBoxes(boxes...)
	}
}

// BeforeInit option for a service
func BeforeInit(fn func(Service) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.BeforeInit = append(o.BeforeInit, fn)
	}
}

// AfterInit option for a service
func AfterInit(fn func(Service) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.AfterInit = append(o.AfterInit, fn)
	}
}

// BeforeStart option for a service
func BeforeStart(fn func(Service) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.BeforeStart = append(o.BeforeStart, fn)
	}
}

// BeforeStop option for a service
func BeforeStop(fn func(Service) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.BeforeStop = append(o.BeforeStop, fn)
	}
}

// AfterStart option for a service
func AfterStart(fn func(Service) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.AfterStart = append(o.AfterStart, fn)
	}
}

// AfterStop option for a service
func AfterStop(fn func(Service) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.AfterStop = append(o.AfterStop, fn)
	}
}

// AutoRestart option for a service
func AutoRestart(b bool) ServiceOption {
	return func(o *ServiceOptions) {
		o.AutoRestart = b
	}
}

// Watch option for a service
func Watch(fn func(Service, configx.Values)) ServiceOption {
	return func(o *ServiceOptions) {
		watchers, ok := o.Watchers[""]
		if !ok {
			watchers = []func(Service, configx.Values){}
		}
		o.Watchers[""] = append(watchers, fn)
	}
}

// WatchPath option for a service
func WatchPath(path string, fn func(Service, configx.Values)) ServiceOption {
	return func(o *ServiceOptions) {
		watchers, ok := o.Watchers[path]
		if !ok {
			watchers = []func(Service, configx.Values){}
		}
		o.Watchers[path] = append(watchers, fn)
	}
}
