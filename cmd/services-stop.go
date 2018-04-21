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
	"strings"
	"sync"

	"github.com/micro/go-micro"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service/proto"
	"github.com/spf13/cobra"
)

var filterStopTag string

// stopCmd represents the stop command
var stopCmd = &cobra.Command{
	Use:   "stop",
	Short: "Stop one or more services",
	// Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		allServices, err := registry.Default.ListServices()
		if err != nil {
			cmd.Println(err)
			return
		}

		var wg sync.WaitGroup

		background := context.Background()
		servicesToStop := []string{}

		for _, srv := range allServices {

			name := srv.Name()
			tags := srv.Tags()

			if len(args) > 0 {
				found := false
				for _, arg := range args {
					for _, t := range tags {
						if filterStopTag != "" && t != filterStopTag {
							continue
						}
					}
					if strings.HasPrefix(name, arg) {
						found = true
						break
					}
				}

				if !found {
					continue
				}
				servicesToStop = append(servicesToStop, name)
			}
		}

		if len(servicesToStop) > 0 {

			ctx, done := context.WithCancel(context.Background())
			oneSrv := micro.NewService(micro.Context(ctx))
			oneSrv.Init(micro.AfterStart(func() error {
				defer done()
				for _, srvName := range servicesToStop {
					log.Logger(oneSrv.Options().Context).Info("Sending Stop Event to " + srvName)
					oneSrv.Client().Publish(background, oneSrv.Client().NewPublication(common.TOPIC_SERVICE_STOP, &service.StopEvent{ServiceName: srvName}))
				}
				return nil
			}), micro.Context(ctx))
			oneSrv.Run()

		}

		wg.Wait()
	},
}

func init() {
	stopCmd.Flags().StringVarP(&filterStopTag, "tags", "t", "", "Stop services for a given tag. Can be combined with argument for prefix filtering.")
	RootCmd.AddCommand(stopCmd)
}
