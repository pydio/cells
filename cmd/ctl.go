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
	"context"
	"fmt"
	"github.com/gdamore/tcell/v2"
	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	clientcontext "github.com/pydio/cells/v4/common/client/context"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/std"
	"github.com/rivo/tview"
	"github.com/spf13/cobra"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"net"
	"net/url"
	"os/exec"
	"sort"
	"strings"
	"time"
)

type item struct {
	ri              registry.Item
	it              pb.ItemType
	main, secondary string
	shortcut        rune
	selected        func()
}

type itemsByName []item

func (b itemsByName) Len() int { return len(b) }
func (b itemsByName) Less(i, j int) bool {
	if b[i].main == b[j].main {
		return b[i].secondary < b[j].secondary
	}
	return b[i].main < b[j].main
}
func (b itemsByName) Swap(i, j int) { b[i], b[j] = b[j], b[i] }

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
	ctx      context.Context
	reg      registry.Registry
	regClose context.CancelFunc

	app          *tview.Application
	title        *tview.TextView
	typesList    *tview.List
	itemsList    *tview.List
	metaView     *tview.TextView
	edgesList    *tview.List
	buttonsPanel *tview.Flex
	crtButtons   []tview.Primitive

	items       []item
	edges       []item
	types       []item
	currentType int
	currentItem int
	currentEdge int

	itFilter   string
	filterText *tview.InputField

	pendingItem registry.Item
	br          broker.Broker
}

func (m *model) startRegistry(ctx context.Context) {
	m.app.QueueUpdateDraw(func() {
		// empty list
		m.loadItems(nil, registry.WithType(m.types[m.currentType].it))
	})
	er := std.Retry(ctx, func() error {
		m.app.QueueUpdateDraw(func() {
			m.title.Clear()
			fmt.Fprintf(m.title, "Connection to registry %s..., please wait\n", runtime.RegistryURL())
		})
		ct, can := context.WithCancel(ctx)
		reg, err := registry.OpenRegistry(ct, runtime.RegistryURL()+"?timeout=2s")
		if err != nil {
			m.app.QueueUpdateDraw(func() {
				m.title.Clear()
				fmt.Fprintf(m.title, "Cannot connect to registry, will retry in 10s: %s\n", err.Error())
			})
			can()
			return err
		}
		m.app.QueueUpdateDraw(func() {
			m.title.Clear()
			fmt.Fprintf(m.title, "Connected to %s\n", runtime.RegistryURL())
		})
		m.reg = reg
		m.regClose = can
		return nil
	}, 10*time.Second, 10*time.Minute)
	if er == nil {
		m.app.QueueUpdateDraw(func() {
			m.loadItems(nil, registry.WithType(m.types[m.currentType].it))
		})
		// Now connected, set up a watch to detect disconnection
		ww, er := m.reg.Watch(registry.WithType(pb.ItemType_SERVICE))
		if er != nil {
			return
		}
		for {
			_, e := ww.Next()
			if e != nil {
				m.regClose()
				m.reg = nil
				m.regClose = nil
				break
			}
		}
		ww.Stop()
		m.startRegistry(ctx)
	}
}

func (m *model) lazyBroker() error {

	if m.br != nil {
		return nil
	}

	u, err := url.Parse(runtime.DiscoveryURL())
	if err != nil {
		return err
	}
	discoveryConn, err := grpc.DialContext(ctx, u.Host, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return err
	}
	ctx = clientcontext.WithClientConn(ctx, discoveryConn)
	m.br = broker.NewBroker(runtime.BrokerURL(), broker.WithContext(ctx))

	return nil

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
	if m.reg == nil {
		// Empty list
		m.currentItem = 0
		m.updateList(m.itemsList, m.items, m.currentItem)
		return
	}
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
			if status, ok := i.Metadata()["status"]; ok {
				name += " - " + status
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
	if m.reg == nil {
		return
	}
	m.edges = []item{}
	if source == nil {
		m.updateList(m.edgesList, m.edges, m.currentEdge)
		return
	}
	//	m.currentEdge = 0
	for _, i := range m.reg.ListAdjacentItems(source, oo...) {
		eType := util.DetectType(i)
		m.edges = append(m.edges, item{ri: i, main: i.Name(), secondary: eType.String() + " - " + i.ID(), it: eType})
		sort.Sort(itemsByType(m.edges))
	}
	m.updateList(m.edgesList, m.edges, m.currentEdge)
}

func (m *model) itemsChanged(index int) {
	//	sel := m.items[index]
	m.currentItem = index
	sel := m.getCurrentItem()
	m.renderMetaView(sel.ri)
	m.loadEdges(sel.ri)
	m.renderButtons(sel.ri)
}

func (m *model) getCurrentItem() item {
	ii := m.items
	if m.itFilter != "" {
		ii = []item{}
		for _, i := range m.items {
			if strings.Contains(i.main, m.itFilter) {
				ii = append(ii, i)
			}
		}
	}
	if m.currentItem < len(ii) {
		return ii[m.currentItem]
	} else {
		return item{}
	}
}

func (m *model) typesChanged(index int) {
	t := m.types[index]
	m.currentType = index
	if t.it > 0 {
		m.filterText.SetText("")
		m.itemsList.SetTitle("| Results for " + t.it.String() + " |")
		m.loadItems(m.pendingItem, registry.WithType(t.it))
		m.pendingItem = nil
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
	m.itemsChanged(0)
	m.updateList(m.itemsList, m.items, m.currentItem)
}

func (m *model) renderMetaView(i registry.Item) {
	if i == nil {
		m.metaView.SetTitle("| No Selection |")
		m.metaView.SetText("")
		return
	}
	meta := make(map[string]interface{})
	for k, v := range i.Metadata() {
		meta[k] = v
	}
	switch util.DetectType(i) {
	case pb.ItemType_NODE:
		if lines, er := m.LsofLines([]string{"-p", i.Metadata()[server.NodeMetaPID]}); er == nil && len(lines) > 0 {
			lsofMeta := make(map[string]int)
			for lt, ll := range lines {
				lsofMeta[lt] = len(ll)
			}
			meta["LSOF"] = lsofMeta
		}
	case pb.ItemType_ADDRESS:
		if _, p, er := net.SplitHostPort(i.Name()); er == nil && p != "" {
			if lines, er := m.LsofLines([]string{"-i:" + p}); er == nil && len(lines) > 0 {
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

func (m *model) renderButtons(i registry.Item) {
	count := 0
	defer func() {
		if count == 0 {
			m.buttonsPanel.AddItem(tview.NewTextView().SetText("No Actions").SetTextAlign(tview.AlignCenter), 0, 1, false)
		}
	}()
	m.buttonsPanel.Clear()
	if i == nil {
		return
	}
	switch util.DetectType(i) {
	case pb.ItemType_SERVER, pb.ItemType_SERVICE:
		if i.Metadata()["status"] == "stopped" {
			startButton := tview.NewButton("Start").SetSelectedFunc(func() { m.sendCommand("start", i.ID()) })
			m.buttonsPanel.AddItem(startButton, 0, 1, false)
			count++
		} else {
			stopButton := tview.NewButton("Stop").SetSelectedFunc(func() { m.sendCommand("stop", i.ID()) })
			m.buttonsPanel.AddItem(stopButton, 0, 1, false)
			m.buttonsPanel.AddItem(tview.NewTextView().SetText(" "), 1, 0, false)
			restartButton := tview.NewButton("Restart").SetSelectedFunc(func() { m.sendCommand("restart", i.ID()) })
			m.buttonsPanel.AddItem(restartButton, 0, 1, false)
			count++
		}
	}
}

func (m *model) sendCommand(cmdName, itemName string) {
	if m.br == nil {
		if er := m.lazyBroker(); er != nil {
			m.title.SetText("Cannot connect to broker! No action performed")
			return
		}
	}
	_ = m.br.PublishRaw(ctx, common.TopicRegistryCommand, []byte("cmd"), map[string]string{
		"command":  cmdName,
		"itemName": itemName,
	})
	go func() {
		<-time.After(2 * time.Second)
		m.app.QueueUpdateDraw(func() {
			m.loadItems(m.getCurrentItem().ri, registry.WithType(m.types[m.currentType].it))
		})
	}()
}

func (m *model) LsofLines(args []string) (map[string][]string, error) {
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

var ctlCmd = &cobra.Command{
	Use:   "ctl",
	Short: "Registry Explorer",
	PreRunE: func(cmd *cobra.Command, args []string) error {
		bindViperFlags(cmd.Flags(), map[string]string{})
		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {

		app := tview.NewApplication()

		m := &model{
			ctx: cmd.Context(),
			app: app,
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
		m.title = tview.NewTextView().SetTextAlign(tview.AlignCenter).SetText("Cells Registry Browser - " + runtime.RegistryURL())
		m.title.SetBorder(true)

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

		m.buttonsPanel = tview.NewFlex()
		m.buttonsPanel.SetBackgroundColor(tview.Styles.PrimitiveBackgroundColor)
		m.buttonsPanel.SetTitle("| Actions |").SetBorder(true)

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

		go m.startRegistry(cmd.Context())

		m.updateList(m.typesList, m.types, m.currentType)
		//m.loadItems(nil, registry.WithType(pb.ItemType_NODE))

		reloadButton := tview.NewButton("Reload").SetSelectedFunc(func() {
			m.loadItems(m.getCurrentItem().ri, registry.WithType(m.types[m.currentType].it))
		})

		flex := tview.NewFlex().
			AddItem(m.typesList, 0, 1, true).
			AddItem(tview.NewFlex().SetDirection(tview.FlexRow).
				AddItem(m.itemsList, 0, 1, false).
				AddItem(tview.NewFlex().
					AddItem(reloadButton, 10, 0, false).
					AddItem(m.filterText, 0, 1, false),
					3, 0, false),
				0, 3, false).
			AddItem(tview.NewFlex().SetDirection(tview.FlexRow).
				AddItem(m.metaView, 0, 1, false).
				AddItem(m.edgesList, 0, 2, false).
				AddItem(m.buttonsPanel, 5, 0, false),
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

		mainFlex := tview.NewFlex().SetDirection(tview.FlexRow).
			AddItem(m.title, 3, 0, false).
			AddItem(flex, 0, 1, true)

		return app.SetRoot(mainFlex, true).EnableMouse(true).Run()
	},
}

func init() {
	addExternalCmdRegistryFlags(ctlCmd.Flags())
	RootCmd.AddCommand(ctlCmd)
}
