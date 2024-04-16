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
	"os"
	"path"
	"strings"
	"time"

	humanize "github.com/dustin/go-humanize"
	"github.com/manifoldco/promptui"
	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/commons/treec"
	"github.com/pydio/cells/v4/common/proto/tree"
)

var (
	lsPath       string
	lsUuid       string
	lsRecursive  bool
	lsShowHidden bool
	lsShowUuid   bool
	lsOffset     int
	lsLimit      int
)

var lsCmd = &cobra.Command{
	Use:   "ls",
	Short: "List files",
	Long: `
DESCRIPTION
  
  List Nodes by querying the tree microservice. Paths are computed starting from the root, their first segment is always
  a datasource name.

EXAMPLE

  List all files at the root of the "Common Files" workspace

  $ ` + os.Args[0] + ` admin file ls --path pydiods1 --uuid
	+--------+---------------+--------------------------------------+--------+-----------------+
	|  TYPE  |     PATH      |                 UUID                 |  SIZE  |    MODIFIED     |
	+--------+---------------+--------------------------------------+--------+-----------------+
	| Folder | Shared Folder | dcabadd0-7d32-4e45-9d1f-a927d3d0c174 | 147 MB | 21 Oct 21 08:58 |
	+--------+---------------+--------------------------------------+--------+-----------------+

 `,
	RunE: func(cmd *cobra.Command, args []string) error {
		client := treec.NodeProviderClient(ctx)

		table := tablewriter.NewWriter(cmd.OutOrStdout())
		hh := []string{"Type", "Path", "Size", "Modified"}
		if lsShowUuid {
			hh = []string{"Type", "Path", "Uuid", "Size", "Modified"}
		}
		table.SetHeader(hh)
		res := 0
		hidden := 0

		if lsUuid != "" {

			cmd.Println("Lookup node with UUID " + promptui.Styler(promptui.FGUnderline)(lsUuid))

			// Special case for a node look up by its UUID
			r, e := client.ReadNode(context.Background(), &tree.ReadNodeRequest{Node: &tree.Node{Uuid: lsUuid}})
			if e != nil {
				return e
			}
			node := r.GetNode()
			p := node.GetPath()
			t := "Folder"
			s := humanize.Bytes(uint64(node.GetSize()))
			if node.GetSize() == 0 {
				s = "-"
			}
			m := time.Unix(node.GetMTime(), 0).Format("02 Jan 06 15:04")
			if node.GetMTime() == 0 {
				m = "-"
			}
			if node.IsLeaf() {
				t = "File"
			}
			if lsShowUuid {
				table.Append([]string{t, p, node.GetUuid(), s, m})
			} else {
				table.Append([]string{t, p, s, m})
			}
			res = 1
		} else {
			if lsRecursive {
				cmd.Println("Listing nodes recursively under " + promptui.Styler(promptui.FGUnderline)(lsPath))
			} else {
				cmd.Println("Listing nodes at " + promptui.Styler(promptui.FGUnderline)(lsPath))
			}

			// List all children
			// Note: if distant DS is structured, .pydio files are returned but not counted to compute the limit.
			streamer, err := client.ListNodes(context.Background(), &tree.ListNodesRequest{
				Node:      &tree.Node{Path: lsPath},
				Recursive: lsRecursive,
				Limit:     int64(lsLimit),
				Offset:    int64(lsOffset),
			})
			if err != nil {
				return err
			}

			for {
				resp, err := streamer.Recv()
				if err != nil {
					break
				}
				res++
				node := resp.GetNode()
				if path.Base(node.GetPath()) == common.PydioSyncHiddenFile && !lsShowHidden {
					hidden++
					continue
				}
				var t, p, s, m string
				p = strings.TrimLeft(strings.TrimPrefix(node.GetPath(), lsPath), "/")
				t = "Folder"
				s = humanize.Bytes(uint64(node.GetSize()))
				if node.GetSize() == 0 {
					s = "-"
				}
				m = time.Unix(node.GetMTime(), 0).Format("02 Jan 06 15:04")
				if node.GetMTime() == 0 {
					m = "-"
				}
				if node.IsLeaf() {
					t = "File"
				}
				if lsShowUuid {
					table.Append([]string{t, p, node.GetUuid(), s, m})
				} else {
					table.Append([]string{t, p, s, m})
				}
			}
		}

		if res > 0 {
			table.Render()

			msg := fmt.Sprintf("Showing %d result", res-hidden)
			if res > 1 {
				msg += "s"
			}
			if lsOffset > 0 {
				msg += fmt.Sprintf(" at offset %d", lsOffset)
			}
			if res >= lsLimit {
				msg += " (Max. row number limit has been hit)"
			}
			cmd.Println(msg)
			cmd.Println(" ")
		} else {
			cmd.Println("No results")
		}
		return nil
	},
}

func init() {
	lsCmd.Flags().StringVarP(&lsPath, "path", "p", "/", "List nodes under given path")
	lsCmd.Flags().StringVarP(&lsUuid, "by-uuid", "u", "", "Find a node by its UUID")
	lsCmd.Flags().BoolVarP(&lsRecursive, "recursive", "", false, "List nodes recursively")
	lsCmd.Flags().BoolVarP(&lsShowUuid, "uuid", "", false, "Show UUIDs")
	lsCmd.Flags().BoolVarP(&lsShowHidden, "hidden", "", false, "Show hidden files (.pydio)")
	lsCmd.Flags().IntVarP(&lsOffset, "offset", "o", 0, "Add an offset to the query when necessary")
	lsCmd.Flags().IntVarP(&lsLimit, "limit", "l", 100, "Max. number of returned rows, 0 for unlimited")
	FileCmd.AddCommand(lsCmd)
}
