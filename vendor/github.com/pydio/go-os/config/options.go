package config

import (
	"time"

	"github.com/micro/go-micro/client"

	"golang.org/x/net/context"
)

type Options struct {
	PollInterval time.Duration
	Reader       Reader
	Sources      []Source
	Client       client.Client
}

type SourceOptions struct {
	// Name, Url, etc
	Name string

	// Client
	Client client.Client
	Hosts  []string

	// Extra Options
	Context context.Context
}

// PollInterval is the time interval at which the sources are polled
// to retrieve config.
func PollInterval(i time.Duration) Option {
	return func(o *Options) {
		o.PollInterval = i
	}
}

// WithSource appends a source to our list of sources.
// This forms a hierarchy whereby all the configs are
// merged down with the last specified as favoured.
func WithSource(s Source) Option {
	return func(o *Options) {
		o.Sources = append(o.Sources, s)
	}
}

func WithClient(c client.Client) Option {
	return func(o *Options) {
		o.Client = c
	}
}

// WithReader is the reader used by config to parse
// ChangeSets, merge them and provide values.
// We're not as elegant here in terms of encoding.
func WithReader(r Reader) Option {
	return func(o *Options) {
		o.Reader = r
	}
}

// Source options

// SourceName is an option to provide name of a file,
// a url, key within etcd, consul, zookeeper, etc.
func SourceName(n string) SourceOption {
	return func(o *SourceOptions) {
		o.Name = n
	}
}

func SourceClient(c client.Client) SourceOption {
	return func(o *SourceOptions) {
		o.Client = c
	}
}

func SourceHosts(hosts ...string) SourceOption {
	return func(o *SourceOptions) {
		o.Hosts = hosts
	}
}
