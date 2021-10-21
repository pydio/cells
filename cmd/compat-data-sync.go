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
	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"
)

var compatResyncCmd = &cobra.Command{
	Use:     "sync",
	Short:   dataSyncCmd.Short,
	Long:    dataSyncCmd.Long,
	Example: dataSyncCmd.Example,
	Run: func(cmd *cobra.Command, args []string) {

		cmd.Println(promptui.IconWarn + " This command is deprecated, please use 'admin resync' instead.")

		dataSyncCmd.Run(cmd, args)
	},
}

func init() {
	compatResyncCmd.PersistentFlags().StringVar(&syncDsName, "datasource", "", "Name of datasource to resync")
	compatResyncCmd.PersistentFlags().StringVar(&syncService, "service", "", "If no datasource name is passed, use the complete service name to resync")
	compatResyncCmd.PersistentFlags().StringVar(&syncPath, "path", "/", "Path to resync")

	DataCmd.AddCommand(compatResyncCmd)
}
