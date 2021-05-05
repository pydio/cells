package proxy

import (
	"fmt"
	"github.com/pydio/cells/common/registry"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/mholt/caddy"
	"github.com/mholt/caddy/caddyfile"
	"github.com/mholt/caddy/caddyhttp/httpserver"
	"github.com/mholt/caddy/caddyhttp/proxy"
	microregistry "github.com/micro/go-micro/registry"
)

func init() {
	caddy.RegisterPlugin("pydioproxy", caddy.Plugin{
		ServerType: "http",
		Action:     setup,
	})
}

// setup configures a new Proxy middleware instance.
func setup(c *caddy.Controller) error {
	upstreams, err := NewRegistryUpstreams(c.Dispenser, httpserver.GetConfig(c).Host())
	if err != nil {
		return err
	}

	httpserver.GetConfig(c).AddMiddleware(func(next httpserver.Handler) httpserver.Handler {
		return proxy.Proxy{Next: next, Upstreams: upstreams}
	})

	// Register shutdown handlers.
	for _, upstream := range upstreams {
		c.OnShutdown(upstream.Stop)
	}

	return nil
}

type registryUpstream struct {
	name               string
	from               string
	stop               chan struct{} // Signals running goroutines to stop.
	upstreamHeaders    http.Header
	downstreamHeaders  http.Header
	KeepAlive          int
	Policy             proxy.Policy
	FailTimeout        time.Duration
	TryDuration        time.Duration
	TryInterval        time.Duration
	MaxConns           int64
	MaxFails           int32
	WithPathPrefix     string
	WithoutPathPrefix  string
	IgnoredSubPaths    []string
	Scheme             string
	insecureSkipVerify bool

	lock  *sync.RWMutex
	hosts map[string]*proxy.UpstreamHost
}

// NewStaticUpstreams parses the configuration input and sets up
// static upstreams for the proxy middleware. The host string parameter,
// if not empty, is used for setting the upstream Host header for the
// health checks if the upstream header config requires it.
func NewRegistryUpstreams(c caddyfile.Dispenser, host string) ([]proxy.Upstream, error) {
	var upstreams []proxy.Upstream
	for c.Next() {

		upstream := &registryUpstream{
			from:              "",
			stop:              make(chan struct{}),
			upstreamHeaders:   make(http.Header),
			downstreamHeaders: make(http.Header),
			MaxFails:          1,
			TryInterval:       250 * time.Millisecond,
			KeepAlive:         http.DefaultMaxIdleConnsPerHost,
			Scheme:            "http",
			lock:              new(sync.RWMutex),
			hosts:             make(map[string]*proxy.UpstreamHost),
		}

		if !c.Args(&upstream.from) {
			return upstreams, c.ArgErr()
		}

		var to []string
		hasSrv := false

		to = append(to, c.RemainingArgs()...)

		upstream.name = to[0]

		for c.NextBlock() {
			if err := parseBlock(&c, upstream, hasSrv); err != nil {
				return upstreams, err
			}
		}

		if len(to) == 0 {
			return upstreams, c.ArgErr()
		}

		services, _ := registry.ListRunningServices()
		for _, service := range services {
			if service.Name() == upstream.name {
				for _, node := range service.RunningNodes() {
					host, err := upstream.newHost(service.Name(), service.Version(), node)
					if err != nil {
						continue
					}
					upstream.lock.Lock()
					upstream.hosts[node.Id] = host
					upstream.lock.Unlock()
				}
			}
		}

		go func() {
			w, err := microregistry.Watch()
			if err != nil {
				return
			}
			for {
				res, err := w.Next()
				if err != nil {
					return
				}

				if res.Service.Name != upstream.name {
					continue
				}

				switch res.Action {
				case "create", "update":
					for _, node := range res.Service.Nodes {
						host, err := upstream.newHost(res.Service.Name, res.Service.Version, node)
						if err != nil {
							continue
						}
						upstream.lock.Lock()
						upstream.hosts[node.Id] = host
						upstream.lock.Unlock()
					}
				case "delete":
					for _, node := range res.Service.Nodes {
						upstream.lock.Lock()
						delete(upstream.hosts, node.Id)
						upstream.lock.Unlock()
					}
				}
			}
		}()

		upstreams = append(upstreams, upstream)
	}
	return upstreams, nil
}

func (r *registryUpstream) From() string {
	return r.from
}

// Selects an upstream host to be routed to. It
// should return a suitable upstream host, or nil
// if no such hosts are available.
func (r *registryUpstream) Select(req *http.Request) *proxy.UpstreamHost {
	var pool []*proxy.UpstreamHost

	for _, host := range r.hosts {
		pool = append(pool, host)
	}

	if r.Policy == nil {
		return (&proxy.Random{}).Select(pool, req)
	}
	return r.Policy.Select(pool, req)
}

// Checks if subpath is not an ignored path
func (r *registryUpstream) AllowedPath(string) bool {
	return true
}

// Gets how long to try selecting upstream hosts
// in the case of cascading failures.
func (r *registryUpstream) GetTryDuration() time.Duration {
	return 0
}

// Gets how long to wait between selecting upstream
// hosts in the case of cascading failures.
func (r *registryUpstream) GetTryInterval() time.Duration {
	return 10 * time.Second
}

// Gets the number of upstream hosts.
func (r *registryUpstream) GetHostCount() int {
	return 0
}

// Stops the upstream from proxying requests to shutdown goroutines cleanly.
func (r *registryUpstream) Stop() error {
	close(r.stop)
	return nil
}

func (r *registryUpstream) newHost(name string, version string, node *microregistry.Node) (*proxy.UpstreamHost, error) {
	host := fmt.Sprintf("%s://%s:%d%s", r.Scheme, node.Address, node.Port, r.WithPathPrefix)

	uh := &proxy.UpstreamHost{
		Name:              host,
		Conns:             0,
		Fails:             0,
		FailTimeout:       r.FailTimeout,
		Unhealthy:         0,
		UpstreamHeaders:   r.upstreamHeaders,
		DownstreamHeaders: r.downstreamHeaders,
		CheckDown: func(r *registryUpstream, nodeId string) proxy.UpstreamHostDownFunc {
			return func(uh *proxy.UpstreamHost) bool {
				if atomic.LoadInt32(&uh.Unhealthy) != 0 {
					microregistry.Deregister(&microregistry.Service{
						Name:    name,
						Version: version,
						Nodes: []*microregistry.Node{
							node,
						},
					})
					return true
				}
				if atomic.LoadInt32(&uh.Fails) >= r.MaxFails {
					microregistry.Deregister(&microregistry.Service{
						Name:    name,
						Version: version,
						Nodes: []*microregistry.Node{
							node,
						},
					})
					return true
				}

				return false
			}
		}(r, node.Id),
		WithoutPathPrefix: r.WithoutPathPrefix,
		MaxConns:          r.MaxConns,
		HealthCheckResult: atomic.Value{},
	}

	baseURL, err := url.Parse(uh.Name)
	if err != nil {
		return nil, err
	}

	uh.ReverseProxy = proxy.NewSingleHostReverseProxy(baseURL, uh.WithoutPathPrefix, r.KeepAlive)
	if r.insecureSkipVerify {
		uh.ReverseProxy.UseInsecureTransport()
	}

	return uh, nil
}

func parseBlock(c *caddyfile.Dispenser, r *registryUpstream, hasSrv bool) error {
	switch c.Val() {
	//case "policy":
	//	if !c.NextArg() {
	//		return c.ArgErr()
	//	}
	//	policyCreateFunc, ok := supportedPolicies[c.Val()]
	//	if !ok {
	//		return c.ArgErr()
	//	}
	//	arg := ""
	//	if c.NextArg() {
	//		arg = c.Val()
	//	}
	//	u.Policy = policyCreateFunc(arg)
	case "fail_timeout":
		if !c.NextArg() {
			return c.ArgErr()
		}
		dur, err := time.ParseDuration(c.Val())
		if err != nil {
			return err
		}
		r.FailTimeout = dur
	case "max_fails":
		if !c.NextArg() {
			return c.ArgErr()
		}
		n, err := strconv.Atoi(c.Val())
		if err != nil {
			return err
		}
		if n < 1 {
			return c.Err("max_fails must be at least 1")
		}
		r.MaxFails = int32(n)
	case "try_duration":
		if !c.NextArg() {
			return c.ArgErr()
		}
		dur, err := time.ParseDuration(c.Val())
		if err != nil {
			return err
		}
		r.TryDuration = dur
	case "try_interval":
		if !c.NextArg() {
			return c.ArgErr()
		}
		interval, err := time.ParseDuration(c.Val())
		if err != nil {
			return err
		}
		r.TryInterval = interval
	case "max_conns":
		if !c.NextArg() {
			return c.ArgErr()
		}
		n, err := strconv.ParseInt(c.Val(), 10, 64)
		if err != nil {
			return err
		}
		r.MaxConns = n
	case "header_upstream":
		var header, value string
		if !c.Args(&header, &value) {
			// When removing a header, the value can be optional.
			if !strings.HasPrefix(header, "-") {
				return c.ArgErr()
			}
		}
		r.upstreamHeaders.Add(header, value)
	case "header_downstream":
		var header, value string
		if !c.Args(&header, &value) {
			// When removing a header, the value can be optional.
			if !strings.HasPrefix(header, "-") {
				return c.ArgErr()
			}
		}
		r.downstreamHeaders.Add(header, value)
	case "transparent":
		r.upstreamHeaders.Add("Host", "{host}")
		r.upstreamHeaders.Add("X-Real-IP", "{remote}")
		r.upstreamHeaders.Add("X-Forwarded-For", "{remote}")
		r.upstreamHeaders.Add("X-Forwarded-Proto", "{scheme}")
	case "websocket":
		r.upstreamHeaders.Add("Connection", "{>Connection}")
		r.upstreamHeaders.Add("Upgrade", "{>Upgrade}")
	case "tls":
		r.Scheme = "https"
	case "with":
		if !c.NextArg() {
			return c.ArgErr()
		}
		r.WithPathPrefix = c.Val()
	case "without":
		if !c.NextArg() {
			return c.ArgErr()
		}
		r.WithoutPathPrefix = c.Val()
	case "except":
		ignoredPaths := c.RemainingArgs()
		if len(ignoredPaths) == 0 {
			return c.ArgErr()
		}
		r.IgnoredSubPaths = ignoredPaths
	case "insecure_skip_verify":
		r.insecureSkipVerify = true
	case "keepalive":
		if !c.NextArg() {
			return c.ArgErr()
		}
		n, err := strconv.Atoi(c.Val())
		if err != nil {
			return err
		}
		if n < 0 {
			return c.ArgErr()
		}
		r.KeepAlive = n
	default:
		return c.Errf("unknown property '%s'", c.Val())
	}
	return nil
}

