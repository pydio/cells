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
	"context"
	"fmt"
	"math"
	"os"
	"sync"

	"github.com/fatih/color"
	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/update"
	update2 "github.com/pydio/cells/v4/discovery/update"
)

var updateToVersion string
var updateDryRun bool

var updateBinCmd = &cobra.Command{
	Use:   "update",
	Short: "Check for available updates and apply them",
	Long: `
DESCRIPTION

  List the available updates for the current binary.
  To apply the actual update, run the command with a --version parameter.
`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		bindViperFlags(cmd.Flags())
		_, _, er := initConfig(cmd.Context(), false)
		return er
	},
	Run: func(cmd *cobra.Command, args []string) {

		configs := config.GetUpdatesConfigs()
		binaries, e := update2.LoadUpdates(context.Background(), configs, &update.UpdateRequest{})
		if e != nil {
			log.Fatal("Cannot retrieve available updates", zap.Error(e))
		}
		if len(binaries) == 0 {
			c := color.New(color.FgRed)
			c.Println("\nNo updates are available for this version")
			c.Println("")
			return
		}

		if updateToVersion == "" {
			// List versions
			c := color.New(color.FgGreen)
			c.Println("\nNew packages are available. Please run the following command to upgrade to a given version")
			c.Println("")
			c = color.New(color.FgBlue, color.Bold)
			c.Println(os.Args[0] + " update --version=x.y.z")
			c.Println("")

			table := tablewriter.NewWriter(cmd.OutOrStdout())
			table.SetHeader([]string{"Version", "Package Name", "Description"})

			for _, bin := range binaries {
				table.Append([]string{bin.Version, bin.Label, bin.Description})
			}

			table.SetAlignment(tablewriter.ALIGN_LEFT)
			table.Render()

		} else {

			var apply *update.Package
			for _, binary := range binaries {
				if binary.Version == updateToVersion {
					apply = binary
				}
			}
			if apply == nil {
				log.Fatal("Cannot find the requested version")
			}

			c := color.New(color.FgBlue)
			c.Println("Updating binary now")
			c.Println("")
			pgChan := make(chan float64)
			errorChan := make(chan error)
			doneChan := make(chan bool)
			wg := &sync.WaitGroup{}
			wg.Add(1)
			go func() {
				defer wg.Done()
				for {
					select {
					case pg := <-pgChan:
						color.New(color.FgBlue).Printf("\rDownloading binary: %v%%", math.Floor(pg*100))
					case e := <-errorChan:
						color.New(color.FgRed).Println("\rError while updating binary: " + e.Error())
						return
					case <-doneChan:
						color.New(color.FgGreen, color.Bold).Println("\rBinary successfully upgraded, you can restart cells now!")
						fmt.Println("")
						return
					}
				}
			}()
			update2.ApplyUpdate(context.Background(), apply, configs, updateDryRun, pgChan, doneChan, errorChan)
			wg.Wait()
		}

	},
}

func init() {
	RootCmd.AddCommand(updateBinCmd)

	updateBinCmd.Flags().StringVarP(&updateToVersion, "version", "v", "", "Pass a version number to apply the upgrade")
	updateBinCmd.Flags().BoolVarP(&updateDryRun, "dry-run", "d", false, "If set, this flag will grab the package and save it to the tmp directory instead of replacing current binary")

}
