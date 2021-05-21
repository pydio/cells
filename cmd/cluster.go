package cmd

import (
	"github.com/spf13/cobra"
)

// Cluster groups the cluster management operations
// The sub-commands are changing the configuration of the cluster registry.
var ClusterCmd = &cobra.Command{
	Use:   "cluster",
	Short: "Cluster management operations",
	Long: `
DESCRIPTION

  Set of commands for configuring a cluster node.
`,
	PersistentPreRunE: func(cmd *cobra.Command, args []string) error {

		initLogLevel()

		initConfig()

		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
	},
}

func init() {
	// Registry / Broker Flags
	RootCmd.AddCommand(ClusterCmd)
}
