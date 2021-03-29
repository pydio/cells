package cmd

import (
	"github.com/pydio/cells/discovery/nats"
	"github.com/spf13/cobra"
)

// AdminCmd groups the data manipulation commands
// The sub-commands are connecting via gRPC to a **running** Cells instance.
var AdminCmd = &cobra.Command{
	Use:   "admin",
	Short: "Direct Read/Write access to Cells data",
	Long: `
DESCRIPTION

  Set of commands with direct access to Cells data.
	
  These commands require a running Cells instance. They connect directly to low-level services
  using gRPC connections. They are not authenticated.
`,
	PersistentPreRunE: func(cmd *cobra.Command, args []string) error {

		bindViperFlags(cmd.Flags(), map[string]string{})

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
	// Registry / Broker Flags
	addNatsFlags(AdminCmd.PersistentFlags())
	addNatsStreamingFlags(AdminCmd.PersistentFlags())
	addRegistryFlags(AdminCmd.PersistentFlags())
	RootCmd.AddCommand(AdminCmd)
}
