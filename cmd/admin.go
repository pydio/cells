package cmd

import (
	"strings"

	"github.com/pydio/cells/discovery/nats"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
)

// AdminCmd groups the data manipulation commands
// The sub-commands are connecting via gRPC to a **running** Cells instance.
var AdminCmd = &cobra.Command{
	Use:   "admin",
	Short: "Direct access to Cells data",
	Long: `Admin commands allow direct access to Cells data.

These commands require a running Cells instance. They connect directly to low-level service
using gRPC connections. They are not authenticated.
`,
	PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
		replaceKeys := map[string]string{}

		cmd.Flags().VisitAll(func(flag *pflag.Flag) {
			key := flag.Name
			if replace, ok := replaceKeys[flag.Name]; ok {
				key = replace
			}
			flag.Usage += " [" + strings.ToUpper("$"+EnvPrefixNew+"_"+key) + "]"
			viper.BindPFlag(key, flag)
		})

		nats.Init()

		// Initialise the default registry
		handleRegistry()

		// Initialise the default broker
		handleBroker()

		// Initialise the default transport
		handleTransport()

		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
	},
}

func init() {
	AdminCmd.PersistentFlags().String("registry", "nats", "Registry used to manage services (currently nats only)")
	AdminCmd.PersistentFlags().String("registry_address", ":4222", "Registry connection address")
	AdminCmd.PersistentFlags().String("registry_cluster_address", "", "Registry cluster address")
	AdminCmd.PersistentFlags().String("registry_cluster_routes", "", "Registry cluster routes")

	AdminCmd.PersistentFlags().String("broker", "nats", "Pub/sub service for events between services (currently nats only)")
	AdminCmd.PersistentFlags().String("broker_address", ":4222", "Broker port")

	AdminCmd.PersistentFlags().String("transport", "grpc", "Transport protocol for RPC")
	AdminCmd.PersistentFlags().String("transport_address", ":4222", "Transport protocol port")

	RootCmd.AddCommand(AdminCmd)
}
