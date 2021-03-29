package cmd

import (
	"github.com/spf13/pflag"
	"github.com/spf13/viper"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro/broker"
	"github.com/pydio/cells/common/micro/registry"
	"github.com/pydio/cells/common/micro/transport/grpc"
	cells_registry "github.com/pydio/cells/common/registry"
)

// addRegistryFlags registers necessary flags to connect to the registry
func addRegistryFlags(flags *pflag.FlagSet, hideAll ...bool) {
	flags.String("registry", "stan", "Registry used to manage services (currently nats only)")
	flags.String("broker", "stan", "Pub/sub service for events between services (currently nats only)")
	flags.String("transport", "grpc", "Transport protocol for RPC")

	if len(hideAll) > 0 && hideAll[0] {
		flags.MarkHidden("registry")
		flags.MarkHidden("broker")
		flags.MarkHidden("transport")
	}
}

// bindViperFlags visits all flags in FlagSet and bind their key to the corresponding viper variable
func bindViperFlags(flags *pflag.FlagSet, replaceKeys map[string]string) {
	flags.VisitAll(func(flag *pflag.Flag) {
		key := flag.Name
		if replace, ok := replaceKeys[flag.Name]; ok {
			key = replace
		}
		viper.BindPFlag(key, flag)
	})
}

// handleRegistry looks up for "registry" key in viper and starts the registry
func handleRegistry() {

	switch viper.Get("registry") {
	case "nats":
		registry.EnableNats()
	case "stan":
		registry.EnableStan()
	// case "etcd":
	// 	registry.EnableEtcd()
	default:
		log.Fatal("registry not supported - currently only nats is supported")
	}
}

// handleBroker looks up for "broker" key in viper and starts the registry
func handleBroker() {
	switch viper.Get("broker") {
	case "nats":
		broker.EnableNATS()
	case "stan":
		broker.EnableSTAN()
	case "http":
		broker.EnableHTTP()
	default:
		log.Fatal("broker not supported")
	}
}

// handleTransport looks up for "transport" key in viper and starts the registry
func handleTransport() {
	switch viper.Get("transport") {
	case "grpc":
		grpc.Enable()
	default:
		log.Fatal("transport not supported")
	}
}

// initServices initializes the Cells internal registry (different from micro registry)
func initServices() {
	cells_registry.Default.BeforeInit()

	cells_registry.Init()

	cells_registry.Default.AfterInit()
}
