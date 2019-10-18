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
	"time"

	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/sync"
	context2 "github.com/pydio/cells/common/utils/context"
)

var (
	syncService string
	syncPath    string
)

var dataSyncCmd = &cobra.Command{
	Use:   "sync",
	Short: "Trigger index resync",
	Long:  `Trigger a re-indexation of a given datasource`,
	Run: func(cmd *cobra.Command, args []string) {
		client := sync.NewSyncEndpointClient(syncService, defaults.NewClient())
		c, _ := context.WithTimeout(context.Background(), 30*time.Minute)
		c = context2.WithUserNameMetadata(c, common.PYDIO_SYSTEM_USERNAME)
		resp, err := client.TriggerResync(c, &sync.ResyncRequest{Path: syncPath})
		if err != nil {
			cmd.Println("Resync Failed: " + err.Error())
			return
		}
		cmd.Println("Resync Triggered.\nResult: " + resp.JsonDiff)
	},
}

func init() {
	dataSyncCmd.PersistentFlags().StringVar(&syncService, "service", "", "Complete service name to resync")
	dataSyncCmd.PersistentFlags().StringVar(&syncPath, "path", "/", "Path to resync")

	dataCmd.AddCommand(dataSyncCmd)
}
