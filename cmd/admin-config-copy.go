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
	"fmt"
	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/config/revisions"
	"github.com/spf13/cobra"
	"math"
	"os"
)

var (
	configCopyFromURL  string
	configCopyToURL    string
	configCopyVersions bool
)

// delConfigCmd deletes a configuration
var copyConfigCmd = &cobra.Command{
	Use:   "copy",
	Short: "Copy configs between two stores",
	Long: `
DESCRIPTION

  Migrate all configurations from one store to another. 

SYNTAX

  Use configurations URLs schemes for --from and --to parameters.
  If store supports versioning 

EXAMPLE

  Copy config from local config file to ETCD 
  $ ` + os.Args[0] + ` admin config copy --from file:/// --to etcd://:2379/ --type config

`,
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := cmd.Context()
		from, er := config.OpenStore(ctx, configCopyFromURL)
		if er != nil {
			return er
		}
		to, er := config.OpenStore(ctx, configCopyToURL)
		if er != nil {
			return er
		}
		if configCopyVersions {
			var versionsFrom revisions.Store
			if revProvider, ok := from.(config.RevisionsProvider); ok {
				from, versionsFrom = revProvider.AsRevisionsStore()
			} else {
				return fmt.Errorf("source config is not a RevisionsProvider")
			}
			if revProvider, ok := to.(config.RevisionsProvider); ok {
				to, _ = revProvider.AsRevisionsStore()
			} else {
				return fmt.Errorf("target config is not a RevisionsProvider")
			}
			vv, er := versionsFrom.List(0, math.MaxUint64)
			if er != nil {
				return er
			}
			for i := len(vv) - 1; i >= 0; i-- {
				v := vv[i]
				if er := to.Set(v.Data); er != nil {
					return er
				}
				if er := to.Save(v.User, v.Log); er != nil {
					return er
				}
				cmd.Println("Copied values for version", v.Id, v.Log)
			}

		} else {

			full := from.Get()
			if er := to.Set(full); er != nil {
				return er
			}
			if er := to.Save(common.PydioSystemUsername, "Copied config from "+configCopyFromURL); er != nil {
				return er
			}
			cmd.Println("Copied all values")
		}
		return nil
	},
}

func init() {
	copyConfigCmd.Flags().StringVar(&configCopyFromURL, "from", "", "Config source")
	copyConfigCmd.Flags().StringVar(&configCopyToURL, "to", "", "Config target")
	copyConfigCmd.Flags().BoolVar(&configCopyVersions, "versions", false, "If store supports versioning, copy all versions")
	ConfigCmd.AddCommand(copyConfigCmd)
}
