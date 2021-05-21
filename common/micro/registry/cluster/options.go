package cluster

import (
	"context"

	"github.com/micro/go-micro/registry"
	stan "github.com/nats-io/stan.go"
)

type clusterIDKey struct{}
type clientIDKey struct{}
type contextQuorumKey struct{}
type optionsKey struct{}
type watchTopicKey struct{}
type queryTopicKey struct{}

var (
	DefaultQuorum = 0
)

// ClusterID specify cluster id to connect
func ClusterID(clusterID string) registry.Option {
	return setRegistryOption(clusterIDKey{}, clusterID)
}

// ClientID specify client id to connect
func ClientID(clientID string) registry.Option {
	return setRegistryOption(clientIDKey{}, clientID)
}

func getQuorum(o registry.Options) int {
	if o.Context == nil {
		return DefaultQuorum
	}

	value := o.Context.Value(contextQuorumKey{})
	if v, ok := value.(int); ok {
		return v
	} else {
		return DefaultQuorum
	}
}

func Quorum(n int) registry.Option {
	return setRegistryOption(contextQuorumKey{}, n)
}

// Options allow to inject a nats.Options struct for configuring
// the nats connection
func Options(nopts ...stan.Option) registry.Option {
	return setRegistryOption(optionsKey{}, nopts)
}

// QueryTopic allows to set a custom nats topic on which service registries
// query (survey) other services. All registries listen on this topic and
// then respond to the query message.
func QueryTopic(s string) registry.Option {
	return setRegistryOption(queryTopicKey{}, s)
}

// WatchTopic allows to set a custom nats topic on which registries broadcast
// changes (e.g. when services are added, updated or removed). Since we don't
// have a central registry service, each service typically broadcasts in a
// determined frequency on this topic.
func WatchTopic(s string) registry.Option {
	return setRegistryOption(watchTopicKey{}, s)
}

// setRegistryOption returns a function to setup a context with given value
func setRegistryOption(k, v interface{}) registry.Option {
	return func(o *registry.Options) {
		if o.Context == nil {
			o.Context = context.Background()
		}
		o.Context = context.WithValue(o.Context, k, v)
	}
}
