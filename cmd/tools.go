package cmd

import "github.com/spf13/cobra"

// ToolsCmd are tools that do not need a running Cells instance
var ToolsCmd = &cobra.Command{
	Use:   "tools",
	Short: "Additional tools",
	Long: `
DESCRIPTION

  Various commands that do not require a running Cells instance.
`,
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
	},
}

func init() {
	RootCmd.AddCommand(ToolsCmd)
}
