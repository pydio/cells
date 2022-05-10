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
	"github.com/pydio/cells/v4/common/server"
	"github.com/rivo/tview"
	"github.com/spf13/cobra"
	"net"
	"os/exec"
	"sort"
	"strings"

	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/runtime"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

type item struct {
	ri              registry.Item
	it              pb.ItemType
	main, secondary string
	shortcut        rune
	selected        func()
}

type itemsByName []item

func (b itemsByName) Len() int           { return len(b) }
func (b itemsByName) Less(i, j int) bool { return b[i].main < b[j].main }
func (b itemsByName) Swap(i, j int)      { b[i], b[j] = b[j], b[i] }

type itemsByType []item

func (b itemsByType) Len() int { return len(b) }
func (b itemsByType) Less(i, j int) bool {
	if b[i].it == b[j].it {
		return b[i].ri.Name() < b[j].ri.Name()
	}
	return b[i].it < b[j].it
}
func (b itemsByType) Swap(i, j int) { b[i], b[j] = b[j], b[i] }

type model struct {
	reg registry.Registry

	typesList *tview.List
	itemsList *tview.List
	metaView  *tview.TextView
	edgesList *tview.List

	items       []item
	edges       []item
	types       []item
	currentType int
	currentItem int
	currentEdge int

	itFilter   string
	filterText *tview.InputField

	pendingItem registry.Item
}

func (m *model) updateList(list *tview.List, items []item, current int) {
	list.Clear()
	for _, i := range items {
		if list == m.itemsList && m.itFilter != "" && !strings.Contains(i.main, m.itFilter) {
			continue
		}
		list.AddItem(i.main, i.secondary, i.shortcut, i.selected)
	}
	list.SetCurrentItem(current)
}

func (m *model) loadItems(preselect registry.Item, oo ...registry.Option) {
	m.items = []item{}
	//	m.currentItem = 0
	if ii, e := m.reg.List(oo...); e == nil {
		for _, i := range ii {
			name := i.Name()
			secondary := i.ID()
			if no, ok := i.(registry.Node); ok {
				name = "/" + no.Metadata()[server.NodeMetaStartTag]
				secondary = "Process ID: " + no.Metadata()[server.NodeMetaPID]
			} else if gen, ok := i.(registry.Generic); ok && gen.Type() == pb.ItemType_TAG {
				name = gen.ID()
			}
			m.items = append(m.items, item{ri: i, main: name, secondary: secondary})
		}
		sort.Sort(itemsByName(m.items))
		if preselect != nil {
			for idx, i := range m.items {
				if preselect.ID() == i.ri.ID() {
					m.currentItem = idx
					break
				}
			}
		}
	}
	m.updateList(m.itemsList, m.items, m.currentItem)
}

func (m *model) loadEdges(source registry.Item, oo ...registry.Option) {
	m.edges = []item{}
	//	m.currentEdge = 0
	for _, i := range m.reg.ListAdjacentItems(source, oo...) {
		eType := util.DetectType(i)
		m.edges = append(m.edges, item{ri: i, main: i.Name(), secondary: eType.String() + " - " + i.ID(), it: eType})
		sort.Sort(itemsByType(m.edges))
	}
	m.updateList(m.edgesList, m.edges, m.currentEdge)
}

func (m *model) itemsChanged(index int) {
	sel := m.items[index]
	m.currentItem = index

	m.renderMetaView(sel.ri)
	m.loadEdges(sel.ri)
}

func (m *model) typesChanged(index int) {
	t := m.types[index]
	m.currentType = index
	if t.it > 0 {
		m.itemsList.SetTitle("| Results for " + t.it.String() + " |")
		m.loadItems(m.pendingItem, registry.WithType(t.it))
		m.pendingItem = nil
		m.filterText.SetText("")
	}
}

func (m *model) edgesSelected(index int) {
	edge := m.edges[index]
	eType := edge.it
	// Update types list if necessary
	var tIndex int
	for idx, t := range m.types {
		if t.it == eType {
			tIndex = idx
			break
		}
	}
	if tIndex != m.currentType {
		m.pendingItem = edge.ri
		m.typesList.SetCurrentItem(tIndex)
	} else {
		m.loadItems(edge.ri, registry.WithType(eType))
	}
}

func (m *model) filterChanged(text string) {
	m.itFilter = text
	m.updateList(m.itemsList, m.items, m.currentItem)
}

func (m *model) renderMetaView(i registry.Item) {
	meta := make(map[string]interface{})
	for k, v := range i.Metadata() {
		meta[k] = v
	}
	switch util.DetectType(i) {
	case pb.ItemType_NODE:
		if lines, er := LsofLines([]string{"-p", i.Metadata()[server.NodeMetaPID]}); er == nil && len(lines) > 0 {
			lsofMeta := make(map[string]int)
			for lt, ll := range lines {
				lsofMeta[lt] = len(ll)
			}
			meta["LSOF"] = lsofMeta
		}
	case pb.ItemType_ADDRESS:
		if _, p, er := net.SplitHostPort(i.Name()); er == nil && p != "" {
			if lines, er := LsofLines([]string{"-i:" + p}); er == nil && len(lines) > 0 {
				meta["LSOF"] = lines
			}
		}
	case pb.ItemType_STATS:
		if sData, ok := i.Metadata()["Data"]; ok {
			_ = json.Unmarshal([]byte(sData), &meta)
		}
	}

	// Now marshall JSON
	js, _ := json.MarshalIndent(meta, "", "  ")
	m.metaView.SetTitle("| Meta: " + i.Name() + " |")
	m.metaView.SetText(string(js))
}

var ctlCmd = &cobra.Command{
	Use:   "ctl",
	Short: "Registry Explorer",
	PreRunE: func(cmd *cobra.Command, args []string) error {
		bindViperFlags(cmd.Flags(), map[string]string{})
		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		cmd.Printf("Connection to registry %s..., please wait\n", runtime.RegistryURL())
		reg, err := registry.OpenRegistry(ctx, runtime.RegistryURL())
		if err != nil {
			return err
		}

		app := tview.NewApplication()

		m := &model{
			reg: reg,
			types: []item{
				{main: "Nodes", secondary: "Main Processes", shortcut: 'a', it: pb.ItemType_NODE},
				{main: "Services", secondary: "Cells Services", shortcut: 'b', it: pb.ItemType_SERVICE},
				{main: "Servers", secondary: "Cells Servers", shortcut: 'c', it: pb.ItemType_SERVER},
				{main: "DAOs", secondary: "Data Stores", shortcut: 'd', it: pb.ItemType_DAO},
				{main: "Addresses", secondary: "Running Servers", shortcut: 'e', it: pb.ItemType_ADDRESS},
				{main: "Endpoints", secondary: "Registered API Endpoints", shortcut: 'f', it: pb.ItemType_ENDPOINT},
				{main: "Tags", secondary: "Grouping Tags", shortcut: 'g', it: pb.ItemType_TAG},
				{main: "Stats", secondary: "Statistics", shortcut: 'h', it: pb.ItemType_STATS},
				{main: "Quit", secondary: "Press to exit", shortcut: 'q', selected: func() {
					app.Stop()
				}},
			},
		}

		m.typesList = tview.NewList()
		m.typesList.SetBorder(true).SetTitle("| Item Types |")

		m.itemsList = tview.NewList()
		m.itemsList.SetWrapAround(false).ShowSecondaryText(true)
		m.itemsList.SetBorder(true).SetTitle("| Results |")

		m.edgesList = tview.NewList().ShowSecondaryText(true)
		m.edgesList.SetBorder(true).SetTitle("| Edges |")

		m.metaView = tview.NewTextView()
		m.metaView.SetBorder(true).SetTitle("| Item Meta |")

		m.filterText = tview.NewInputField()
		m.filterText.SetBorder(true).SetTitle("| Search by name |")

		components := []tview.Primitive{
			m.typesList, m.itemsList, m.filterText, m.metaView, m.edgesList,
		}

		m.filterText.SetChangedFunc(func(text string) {
			m.filterChanged(text)
		})

		m.typesList.SetChangedFunc(func(index int, mainText string, secondaryText string, shortcut rune) {
			m.typesChanged(index)
		})
		m.itemsList.SetChangedFunc(func(index int, mainText string, secondaryText string, shortcut rune) {
			m.itemsChanged(index)
		})
		m.edgesList.SetSelectedFunc(func(i int, s string, s2 string, r rune) {
			m.edgesSelected(i)
		})

		m.updateList(m.typesList, m.types, m.currentType)
		m.loadItems(nil, registry.WithType(pb.ItemType_NODE))

		flex := tview.NewFlex().
			AddItem(m.typesList, 0, 1, true).
			AddItem(tview.NewFlex().SetDirection(tview.FlexRow).
				AddItem(m.itemsList, 0, 1, false).
				AddItem(m.filterText, 3, 0, false),
				0, 3, false).
			AddItem(tview.NewFlex().SetDirection(tview.FlexRow).
				AddItem(m.metaView, 0, 1, false).
				AddItem(m.edgesList, 0, 2, false),
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

func LsofLines(args []string) (map[string][]string, error) {
	// Some systems (Arch, Debian) install lsof in /usr/bin and others (centos)
	// install it in /usr/sbin, even though regular users can use it too. FreeBSD,
	// on the other hand, puts it in /usr/local/sbin. So do not specify absolute path.
	command := "lsof"
	args = append([]string{"-w"}, args...)
	output, err := exec.Command(command, args...).Output()
	if err != nil {
		return nil, err
	}
	res := make(map[string][]string)
	lines := strings.Split(string(output), "\n")
	for i, line := range lines {
		if i == 0 || strings.TrimSpace(line) == "" {
			continue // Skip header line
		}
		// Todo : better parsing
		if strings.Contains(line, "DIR") || strings.Contains(line, "REG") {
			res["LSOF/Files"] = append(res["LSOF/Files"], line)
		} else if strings.Contains(line, "IPv4") || strings.Contains(line, "IPv6") {
			res["LSOF/Network"] = append(res["LSOF/Network"], line)
		} else {
			res["LSOF/Other"] = append(res["LSOF/Other"], line)
		}
	}
	return res, nil
}
