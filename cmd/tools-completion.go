/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package cmd

import (
	"os"

	"github.com/spf13/cobra"
)

var completionExample = `
1) Using Bash

On Linux, you must insure the 'bash-completion' library is installed:
	
	on Debian / Ubuntu
		sudo apt install bash-completion

	on RHEL / CentOS
		sudo yum install bash-completion

	on MacOS (make sure to follow the instructions displayed on Homebrew)
		brew install bash-completion

Then, to enable completion in your current session:
	source <(` + os.Args[0] + ` completion bash)

Or persistently:
	Debian/Ubuntu/CentOS
		` + os.Args[0] + ` completion bash | sudo tee /etc/bash_completion.d/cells

	macOS
		` + os.Args[0] + ` completion bash | tee /usr/local/etc/bash_completion.d/cells

2) Using Zsh

	Add to current zsh session:
		source <(` + os.Args[0] + ` completion zsh)

	Add persistently:
		` + os.Args[0] + ` completion zsh | sudo tee <path>/<to>/<your-zsh-completion-folder>
	
	On macOS
		` + os.Args[0] + ` completion zsh | tee /Users/<your current user>/.zsh/completion/_cells
`

var completionCmd = &cobra.Command{
	Use:   "completion",
	Short: "Add auto-completion helper to Cells",
	Long: `
DESCRIPTION

  Install completion helper for Pydio Cells.
  This command installs an additional plugin to provide suggestions when working with the Cells CLI and hitting the 'tab' key.
`,
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
	},
	ValidArgs: []string{"zsh", "bash"},
	Args:      cobra.MinimumNArgs(1),
	Example:   completionExample,
}

var bashCompletionCmd = &cobra.Command{
	Use: "bash",
	Run: func(cmd *cobra.Command, args []string) {
		bashAutocomplete()
	},
}

var zshCompletionCmd = &cobra.Command{
	Use: "zsh",
	Run: func(cmd *cobra.Command, args []string) {
		zshAutocomplete()
	},
}

func init() {
	ToolsCmd.AddCommand(completionCmd)
	completionCmd.AddCommand(bashCompletionCmd)
	completionCmd.AddCommand(zshCompletionCmd)
}

// Reads the bash autocomplete file and prints it to stdout
func bashAutocomplete() {
	RootCmd.GenBashCompletion(os.Stdout)
}

func zshAutocomplete() {
	RootCmd.GenZshCompletion(os.Stdout)
}
