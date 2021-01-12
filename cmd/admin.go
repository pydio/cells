package cmd

import "github.com/spf13/cobra"

// AdminCmd groups the data manipulation commands
// The sub-commands are connecting via gRPC to a **running** Cells instance.
var AdminCmd = &cobra.Command{
	Use:   "admin",
	Short: "Direct access to Cells data",
	Long: `Admin commands allow direct access to Cells data.

These commands require a running Cells instance. They connect directly to low-level service
using gRPC connections. They are not authenticated.
`,
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
	},
}

func init() {
	RootCmd.AddCommand(AdminCmd)
}
