package cmd

import (
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var DataSourceCmd = &cobra.Command{
	Use: "datasource",
	PersistentPreRun: func(cmd *cobra.Command, args []string) {
		bindViperFlags(cmd.Flags(), map[string]string{})

		viper.SetDefault("registry", "grpc://:8000")
		viper.SetDefault("broker", "grpc://:8003")

		// Initialise the default registry
		handleRegistry()

		// Initialise the default broker
		handleBroker()

		// Initialise the default transport
		handleTransport()

		initConfig()
	},
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
	},
	Short: "Datasource management commands",
	Long:  "Collection of tools for manipulating datasources",
}

func init() {
	AdminCmd.AddCommand(DataSourceCmd)
}
