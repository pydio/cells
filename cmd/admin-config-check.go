/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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
	"strings"

	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/runtime"
)

var (
	configCheckURL string
)

// delConfigCmd deletes a configuration
var copyConfigCheck = &cobra.Command{
	Use:   "check",
	Short: "Check if a valid config is found",
	Long: `
DESCRIPTION

  Use this command to automatically detect if config is already set and valid. 
  By default it points the URL provided by the **global** --config flag.
  You can override this with the --conf to specify a config not currently used by Cells. 

EXAMPLE

  Check if an etcd config is prepared 
  $ ` + os.Args[0] + ` admin config check --config etcd://:2379/

`,
	PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
		// Replace admin PersistentPreRunE
		bindViperFlags(cmd.Flags())
		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		if configCheckURL == "" {
			configCheckURL = runtime.ConfigURL()
		}
		if strings.Contains(configCheckURL, "?") {
			configCheckURL += "&readOnly=true"
		} else {
			configCheckURL += "?readOnly=true"
		}
		cmd.Println("Checking config at " + configCheckURL)
		s, e := config.OpenStore(cmd.Context(), configCheckURL)
		if e != nil {
			cmd.Println(promptui.IconBad + " Cannot open config: " + e.Error())
			os.Exit(1)
		}
		if s.Val("defaults", "datasource").String() == "" {
			cmd.Println(promptui.IconBad + " No default datasource found")
			os.Exit(1)
		}
		cmd.Println(promptui.IconGood + " Default datasource set. A config process has already been performed.")
	},
}

func init() {
	copyConfigCheck.Flags().StringVar(&configCheckURL, "conf", "", "Alternative config URL (overrides global flag)")
	ConfigCmd.AddCommand(copyConfigCheck)
}
