/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

	"github.com/spf13/cobra"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/update"
	update2 "github.com/pydio/cells/discovery/update"
)

var updateToVersion string
var updateDryRun bool

// updateBinCmd represents the command to update Pydio Cells binary
var updateBinCmd = &cobra.Command{
	Use:   "update",
	Short: "Check for available updates and apply them",
	Long: `Without argument, this command will list the available updates for this binary.
To apply the actual update, re-run the command with a --version parameter.
`,
	Run: func(cmd *cobra.Command, args []string) {

		url := config.Default().Get("services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_UPDATE, "updateUrl").String("")
		channel := config.Default().Get("services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_UPDATE, "channel").String("stable")
		configs := config.Map{}
		configs.Set("url", url)
		configs.Set("channel", channel)

		binaries, e := update2.LoadUpdates(context.Background(), configs)
		if e != nil {
			log.Fatal("cannot retrieve available updates", zap.Error(e))
		}
		if len(binaries) == 0 {
			fmt.Println("No updates available for this version")
		}

		if updateToVersion == "" {
			// List versions
			fmt.Println("Following packages are available: please run pydio update --version=x.y.z to upgrade to a given version")
			for _, bin := range binaries {
				fmt.Println(fmt.Sprintf(" %s \t %s \t %s", bin.PackageName, bin.Version, bin.Label))
			}

		} else {

			var apply *update.Package
			for _, binary := range binaries {
				if binary.Version == updateToVersion {
					apply = binary
				}
			}
			if apply == nil {
				log.Fatal("cannot find the requested version")
			}

			fmt.Println("Updating binary now")
			if err := update2.ApplyUpdate(context.Background(), apply, updateDryRun); err != nil {
				log.Fatal("could not update the binary: " + err.Error())
			} else {
				fmt.Println("Successfully upgraded binary, you can restart pydio now!")
			}

		}

	},
}

func init() {

	RootCmd.AddCommand(updateBinCmd)

	updateBinCmd.Flags().StringVarP(&updateToVersion, "version", "v", "", "Pass a version number to apply the upgrade")
	updateBinCmd.Flags().BoolVarP(&updateDryRun, "dry-run", "d", false, "If set, this flag will grab the package and save it to the tmp directory instead of replacing current binary")

}
