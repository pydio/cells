package cmd

import (
	"github.com/spf13/pflag"
	"github.com/spf13/viper"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro/broker/http"
	"github.com/pydio/cells/common/micro/broker/nats"
	"github.com/pydio/cells/common/micro/registry"
	"github.com/pydio/cells/common/micro/transport/grpc"
	cells_registry "github.com/pydio/cells/common/registry"
)

// addRegistryFlags registers necessary flags to connect to the registry
func addRegistryFlags(flags *pflag.FlagSet, hideAll ...bool) {
	flags.String("registry", "nats", "Registry used to manage services (currently nats only)")
	flags.String("registry_address", ":4222", "Registry connection address")
	flags.String("registry_cluster_address", "", "Registry cluster address")
	flags.String("registry_cluster_routes", "", "Registry cluster routes")
	flags.String("broker", "nats", "Pub/sub service for events between services (currently nats only)")
	flags.String("broker_address", ":4222", "Nats broker port")
	flags.String("transport", "grpc", "Transport protocol for RPC")
	flags.String("transport_address", ":4222", "Transport protocol port")

	flags.MarkHidden("registry")

	if len(hideAll) > 0 && hideAll[0] {
		flags.MarkHidden("registry_address")
		flags.MarkHidden("registry_cluster_address")
		flags.MarkHidden("registry_cluster_routes")
		flags.MarkHidden("broker")
		flags.MarkHidden("broker_address")
		flags.MarkHidden("transport")
		flags.MarkHidden("transport_address")
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
	default:
		log.Fatal("registry not supported - currently only nats is supported")
	}
}

// handleBroker looks up for "broker" key in viper and starts the registry
func handleBroker() {
	switch viper.Get("broker") {
	case "nats":
		nats.Enable()
	case "http":
		http.Enable()
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
