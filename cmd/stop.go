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

// +build ignore

package cmd

import (
	"context"
	"log"
	"strings"

	micro "github.com/micro/go-micro"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/registry"
	proto "github.com/pydio/cells/common/service/proto"
)

var filterStopTag string

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

		for _, srv := range allServices {
			if len(args) > 0 {
				found := false
				for _, arg := range args {
					for _, t := range srv.Tags() {
						if filterStopTag != "" && t != filterStopTag {
							continue
						}
					}
					if strings.HasPrefix(srv.Name(), arg) {
						found = true
						break
					}
				}

				if !found {
					continue
				}

				req := new(proto.StopEvent)
				req.ServiceName = srv.Name()

				p := micro.NewPublisher(common.TopicServiceStop, defaults.NewClient())
				p.Publish(context.Background(), req)
			} else {
				req := new(proto.StopEvent)
				req.ServiceName = srv.Name()

				p := micro.NewPublisher(common.TopicServiceStop, defaults.NewClient())
				if err := p.Publish(context.Background(), req); err != nil {
					log.Fatal(err)
				}
			}
		}
	},
}

func init() {
	stopCmd.Flags().StringVarP(&filterStopTag, "tags", "t", "", "Stop services for a given tag. Can be combined with argument for prefix filtering.")
	RootCmd.AddCommand(stopCmd)
}
