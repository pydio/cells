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
	"github.com/gdamore/tcell/v2"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/rivo/tview"
	"github.com/spf13/cobra"
)

var ctlCmd = &cobra.Command{
	Use:   "ctl",
	Short: "Registry Explorer",
	PreRunE: func(cmd *cobra.Command, args []string) error {
		bindViperFlags(cmd.Flags(), map[string]string{})
		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		reg, err := registry.OpenRegistry(ctx, runtime.RegistryURL())
		if err != nil {
			return err
		}

		app := tview.NewApplication()
		mainList := tview.NewList().
			AddItem("Nodes", "Main Processes", 'a', nil).
			AddItem("Services", "Cells Services", 'b', nil).
			AddItem("Servers", "Http/Grpc/Other Servers", 'c', nil).
			AddItem("DAOs", "Data Stores", 'd', nil).
			AddItem("Addresses", "Running Servers", 'e', nil).
			AddItem("Endpoints", "API Endpoints", 'f', nil).
			AddItem("Tags", "API Endpoints", 'g', nil).
			AddItem("Stats", "Statistics", 'h', nil).
			AddItem("Quit", "Press to exit", 'q', func() {
				app.Stop()
			})
		mainList.SetBorder(true).SetTitle("Left List")

		resList := tview.NewList()
		resList.SetWrapAround(false).ShowSecondaryText(true)
		resList.SetBorder(true).SetTitle("Results")

		edges := tview.NewList().ShowSecondaryText(true)
		edges.SetBorder(true).SetTitle("Edges")

		tv := tview.NewTextView()
		tv.SetBorder(true).SetTitle("Item Meta")

		updateCenter := func(oo ...registry.Option) {
			if ii, e := reg.List(oo...); e == nil {
				for _, i := range ii {
					func(i registry.Item) {
						js, _ := json.MarshalIndent(i.Metadata(), "", "  ")
						resList.AddItem(i.Name(), i.ID(), 0, func() {
							tv.SetText(string(js))
							edges.Clear()
							for _, a := range reg.ListAdjacentItems(i) {
								edges.AddItem(a.ID(), a.Name(), 0, func() {})
							}
						})
					}(i)
				}
			}
		}

		mainList.SetChangedFunc(func(index int, mainText string, secondaryText string, shortcut rune) {
			resList.Clear()
			tv.Clear()
			var oo []registry.Option
			switch shortcut {
			case 'a':
				oo = append(oo, registry.WithType(pb.ItemType_NODE))
			case 'b':
				oo = append(oo, registry.WithType(pb.ItemType_SERVICE))
			case 'c':
				oo = append(oo, registry.WithType(pb.ItemType_SERVER))
			case 'd':
				oo = append(oo, registry.WithType(pb.ItemType_DAO))
			case 'e':
				oo = append(oo, registry.WithType(pb.ItemType_ADDRESS))
			case 'f':
				oo = append(oo, registry.WithType(pb.ItemType_ENDPOINT))
			case 'g':
				oo = append(oo, registry.WithType(pb.ItemType_TAG))
			case 'h':
				oo = append(oo, registry.WithType(pb.ItemType_STATS))
			case 'q':
				return
			}
			updateCenter(oo...)
		})

		mainList.SetCurrentItem(0)

		components := []tview.Primitive{
			mainList, resList, tv, edges,
		}

		updateCenter(registry.WithType(pb.ItemType_NODE))

		flex := tview.NewFlex().
			AddItem(mainList, 0, 1, true).
			AddItem(resList, 0, 3, false).
			AddItem(tview.NewFlex().SetDirection(tview.FlexRow).
				AddItem(tv, 0, 1, false).
				AddItem(edges, 0, 2, false),
				0, 2, false)

		boxFocus := 0
		flex.SetInputCapture(func(event *tcell.EventKey) *tcell.EventKey {
			if event.Key() == tcell.KeyTab || event.Key() == tcell.KeyBacktab {
				components[boxFocus].Blur()
				if event.Key() == tcell.KeyTab {
					boxFocus++
				} else {
					boxFocus--
					if boxFocus < 0 {
						boxFocus = len(components) - 1
					}
				}
				boxFocus = boxFocus % len(components)
				components[boxFocus].Focus(nil)
				return nil
			}
			return event
		})

		title := tview.NewTextView().SetTextAlign(tview.AlignCenter).SetText("Cells Registry Browser - " + runtime.RegistryURL())
		title.SetBorder(true)
		mainFlex := tview.NewFlex().SetDirection(tview.FlexRow).
			AddItem(title, 3, 0, false).
			AddItem(flex, 0, 1, true)

		return app.SetRoot(mainFlex, true).EnableMouse(true).Run()
	},
}

func init() {
	addExternalCmdRegistryFlags(ctlCmd.Flags())
	RootCmd.AddCommand(ctlCmd)
}
