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
	"log"
	"os"
	"sync"
	"time"

	"github.com/spf13/cobra"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/micro"
)

var (
	path  string
	uuid  string
	flood int
)

// createCmd represents the create command
var dataCreateCmd = &cobra.Command{
	Use:   "create",
	Short: "Manually create a node in index",
	Long: `Manually create a node in index.

This should be done for testing purpose only, as the index should be automatically synced to the underlying "real" data.

`,
	Run: func(cmd *cobra.Command, args []string) {

		if path == "" {
			cmd.Help()
			os.Exit(1)
		}

		client := tree.NewNodeReceiverClient(serviceName, defaults.NewClient())

		if flood > 0 {
			var wg sync.WaitGroup
			for i := 0; i < flood; i++ {
				c := i
				wg.Add(1)
				go func() {

					response, err := client.CreateNode(context.Background(), &tree.CreateNodeRequest{
						Node: &tree.Node{
							Path: fmt.Sprintf(path+"-%v", c),
						},
					})

					<-time.After(1 * time.Second)
					wg.Done()
					log.Println(response, err)
				}()
			}

			return
		}

		response, err := client.CreateNode(context.Background(), &tree.CreateNodeRequest{
			Node: &tree.Node{
				Uuid: uuid,
				Path: path,
			},
		})

		if err != nil {
			log.Println(err)
		}

		log.Println(response)
	},
}

func init() {
	// Local flags
	dataCreateCmd.Flags().StringVarP(&path, "path", "p", "", "Path to the data")
	dataCreateCmd.Flags().StringVarP(&uuid, "uuid", "u", "", "UUID of the data")
	dataCreateCmd.Flags().IntVar(&flood, "flood", 0, "Floods of n create nodes")

	dataCmd.AddCommand(dataCreateCmd)
}
