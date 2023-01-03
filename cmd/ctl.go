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
	"net"
	"net/url"
	"os/exec"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gdamore/tcell/v2"
	"github.com/rivo/tview"
	"github.com/spf13/cobra"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	clientcontext "github.com/pydio/cells/v4/common/client/context"
	"github.com/pydio/cells/v4/common/config"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/utils/configx"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/std"
)

type item struct {
	ri              registry.Item
	it              pb.ItemType
	main, secondary string
	shortcut        rune
	selected        func()
	status          string
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
	ctx        context.Context
	reg        registry.Registry
	regClose   context.CancelFunc
	br         broker.Broker
	brClose    context.CancelFunc
	centerMode string

	app          *tview.Application
	title        *tview.TextView
	typesList    *tview.List
	itemsList    *tview.List
	metaView     *tview.TextView
	edgesList    *tview.List
	buttonsPanel *tview.Flex
	crtButtons   []tview.Primitive
	configsView  *tview.TreeView

	cfg         configx.Values
	items       []item
	edges       []item
	types       []item
	currentType int
	currentItem int

	currentEdge  int
	itFilter     string
	statusFilter bool

	filterText  *tview.InputField
	pendingItem registry.Item
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
			m.resetBroker()
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
				m.resetBroker()
				break
			}
		}
		ww.Stop()
		m.startRegistry(ctx)
	}
}

func (m *model) resetBroker() {
	if m.br == nil || m.brClose == nil {
		return
	}
	m.brClose()
	m.br = nil
	m.brClose = nil
}

func (m *model) lazyBroker() error {

	if m.br != nil {
		return nil
	}

	u, err := url.Parse(runtime.DiscoveryURL())
	if err != nil {
		return err
	}
	ct, ca := context.WithCancel(ctx)
	discoveryConn, err := grpc.DialContext(ct, u.Host, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		ca()
		return err
	}
	m.brClose = func() {
		ca()
		_ = discoveryConn.Close()
	}
	ct = clientcontext.WithClientConn(ct, discoveryConn)
	m.br = broker.NewBroker(runtime.BrokerURL(), broker.WithContext(ct))

	return nil

}

func (m *model) updateList(list *tview.List, items []item, current int) {
	list.Clear()
	for _, i := range items {
		if list == m.itemsList && m.itFilter != "" && !strings.Contains(i.main, m.itFilter) {
			continue
		}
		if list == m.itemsList && m.statusFilter && i.status == string(registry.StatusReady) {
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
				name = "/" + no.Metadata()[runtime.NodeMetaStartTag]
				secondary = "Process ID: " + no.Metadata()[runtime.NodeMetaPID]
			} else if gen, ok := i.(registry.Generic); ok && gen.Type() == pb.ItemType_TAG {
				name = gen.ID()
			} else if i.Name() == "fork" {
				name += " " + i.Metadata()["forkStartTag"]
			}
			status := i.Metadata()[registry.MetaStatusKey]
			if status != "" {
				if status == string(registry.StatusReady) {
					name += " - " + status
				} else {
					name += " - " + strings.ToUpper(status)
				}
			}
			m.items = append(m.items, item{
				ri:        i,
				main:      name,
				secondary: secondary,
				status:    status,
			})
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
	for n, t := range pb.ItemType_value {
		if n != "EDGE" && n != "ALL" {
			oo = append(oo, registry.WithType(pb.ItemType(t)))
		}
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
	if m.itFilter != "" || m.statusFilter {
		ii = []item{}
		for _, i := range m.items {
			if m.itFilter != "" && !strings.Contains(i.main, m.itFilter) {
				continue
			}
			if m.statusFilter && i.status == string(registry.StatusReady) {
				continue
			}
			ii = append(ii, i)
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
		if lines, er := m.LsofLines([]string{"-p", i.Metadata()[runtime.NodeMetaPID]}); er == nil && len(lines) > 0 {
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
		if i.Metadata()[registry.MetaStatusKey] == string(registry.StatusStopped) {
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

func (m *model) initConfigView() {
	if m.cfg == nil {
		_, _, _ = initConfig(m.ctx, false)
		m.cfg = config.Get()
		m.configsView.SetSelectedFunc(func(node *tview.TreeNode) {
			node.SetExpanded(!node.IsExpanded())
		})
		m.configsView.SetChangedFunc(func(node *tview.TreeNode) {
			defer func() {
				recover()
			}()
			js, _ := json.MarshalIndent(node.GetReference(), "", "  ")
			m.metaView.SetText(string(js))
		})
	}
	m.metaView.SetTitle("| JSON |")
	m.metaView.SetText("")
	root := tview.NewTreeNode("Configs")
	m.configsView.SetRoot(root).SetCurrentNode(root)
	root.SetExpanded(true).SetSelectable(true).SetReference(m.cfg.Interface())
	m.populateTreeNode(root, []string{}, m.cfg)
}

func (m *model) populateTreeNode(node *tview.TreeNode, pa []string, val configx.Values) {
	defer func() {
		recover()
	}()
	var childrenKeys []string
	children := make(map[string]*tview.TreeNode)

	var mi map[string]interface{}
	var sl []interface{}
	if er := val.Scan(&sl); er == nil {
		for k, i := range sl {
			c := tview.NewTreeNode(strconv.Itoa(k))
			var ref interface{}
			if conf, o := i.(configx.Values); o {
				ref = conf.Interface()
			} else {
				ref = i
			}
			c.SetExpanded(false).SetSelectable(true).SetReference(ref)
			children[c.GetText()] = c
			childrenKeys = append(childrenKeys, c.GetText())
			m.populateTreeNode(c, append(pa, strconv.Itoa(k)), configx.New(configx.WithInitData(i)))
		}
	} else if e := val.Scan(&mi); e == nil {
		for k := range mi {
			c := tview.NewTreeNode(k).SetReference(val.Val(k).Interface())
			children[c.GetText()] = c
			childrenKeys = append(childrenKeys, c.GetText())
			c.SetExpanded(false)
			c.SetSelectable(true)
			m.populateTreeNode(c, append(pa, k), val.Val(k))
		}
	} else {
		node.SetText(node.GetText() + ": " + val.String()).SetReference(val.Interface())
	}
	// Append children sorted
	sort.Strings(childrenKeys)
	for _, k := range childrenKeys {
		node.AddChild(children[k])
	}
}

func (m *model) sendCommand(cmdName, itemName string) {
	if m.br == nil {
		if er := m.lazyBroker(); er != nil {
			m.title.SetText("Cannot connect to broker! No action performed")
			return
		}
	}
	e := m.br.PublishRaw(ctx, common.TopicRegistryCommand, []byte("cmd"), map[string]string{
		"command":  cmdName,
		"itemName": itemName,
	})
	if e != nil {
		m.title.SetText("Cannot publish command: " + e.Error())
	}
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
	Short: "Explore all registered items in registry and configuration.",
	Long: `
DESCRIPTION

  This command connects to a Registry to list active items currently registered with their metadata. It can also display
  all configuration stored inside the config store.

  Item types are one of the following : 
	- Nodes
	- Services
	- Servers
	- DAOs
	- Addresses
	- Endpoints
	- Tags
	- Stats
`,
	PreRunE: func(cmd *cobra.Command, args []string) error {
		bindViperFlags(cmd.Flags())
		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {

		app := tview.NewApplication()

		m := &model{
			ctx:        cmd.Context(),
			app:        app,
			centerMode: "list",
			types: []item{
				{main: "Nodes", secondary: "Main Processes", shortcut: 'a', it: pb.ItemType_NODE},
				{main: "Services", secondary: "Cells Services", shortcut: 'b', it: pb.ItemType_SERVICE},
				{main: "Servers", secondary: "Cells Servers", shortcut: 's', it: pb.ItemType_SERVER},
				{main: "DAOs", secondary: "Data Stores", shortcut: 'd', it: pb.ItemType_DAO},
				{main: "Addresses", secondary: "Running Servers", shortcut: 'e', it: pb.ItemType_ADDRESS},
				{main: "Endpoints", secondary: "Registered API Endpoints", shortcut: 'f', it: pb.ItemType_ENDPOINT},
				{main: "Tags", secondary: "Grouping Tags", shortcut: 'g', it: pb.ItemType_TAG},
				{main: "Stats", secondary: "Statistics", shortcut: 'h', it: pb.ItemType_STATS},
				{main: "Configs", secondary: "Configuration Keys", shortcut: 'c'},
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

		centerPanel := tview.NewFlex().SetDirection(tview.FlexRow)
		rightPanel := tview.NewFlex().SetDirection(tview.FlexRow)

		m.configsView = tview.NewTreeView()
		m.configsView.SetBorder(true).SetTitle("| Configurations |")

		components := []tview.Primitive{
			m.typesList, m.itemsList, m.filterText, m.metaView, m.edgesList,
		}

		reloadButton := tview.NewButton("Reload")
		reloadButton.SetSelectedFunc(func() {
			m.loadItems(m.getCurrentItem().ri, registry.WithType(m.types[m.currentType].it))
			reloadButton.Blur()
		})

		statusButton := tview.NewButton("Hide Ready")
		statusButton.SetSelectedFunc(func() {
			m.statusFilter = !m.statusFilter
			statusLabel := "Hide Ready"
			if m.statusFilter {
				statusLabel = "Show All"
			}
			statusButton.SetLabel(statusLabel)
			m.loadItems(m.getCurrentItem().ri, registry.WithType(m.types[m.currentType].it))
			statusButton.Blur()
		})

		m.filterText.SetChangedFunc(func(text string) {
			m.filterChanged(text)
		})

		m.typesList.SetChangedFunc(func(index int, mainText string, secondaryText string, shortcut rune) {
			if mainText == "Configs" && m.centerMode == "list" {
				centerPanel.Clear()
				centerPanel.AddItem(m.configsView, 0, 1, false)
				m.centerMode = "config"
				m.initConfigView()
				m.renderMetaView(nil) // empty
				m.edgesList.Clear()
				rightPanel.ResizeItem(m.metaView, 0, 10)
				rightPanel.ResizeItem(m.edgesList, 1, 0)
			} else if mainText != "Configs" {
				if m.centerMode == "config" {
					m.centerMode = "list"
					centerPanel.Clear()
					centerPanel.
						AddItem(m.itemsList, 0, 1, false).
						AddItem(tview.NewFlex().
							AddItem(reloadButton, 10, 0, false).
							AddItem(m.filterText, 0, 1, false),
							3, 0, false)
					rightPanel.ResizeItem(m.metaView, 0, 1)
					rightPanel.ResizeItem(m.edgesList, 0, 2)
				}
				m.typesChanged(index)

			}
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

		flex := tview.NewFlex().
			AddItem(m.typesList, 0, 1, true).
			AddItem(centerPanel.
				AddItem(m.itemsList, 0, 1, false).
				AddItem(tview.NewFlex().
					AddItem(reloadButton, 10, 0, false).
					AddItem(tview.NewTextView().SetText(" "), 1, 0, false).
					AddItem(statusButton, 14, 0, false).
					AddItem(m.filterText, 0, 1, false),
					3, 0, false),
				0, 3, false).
			AddItem(rightPanel.
				AddItem(m.metaView, 0, 1, false).
				AddItem(m.edgesList, 0, 2, false).
				AddItem(m.buttonsPanel, 5, 0, false),
				0, 2, false)

		boxFocus := 0
		flex.SetInputCapture(func(event *tcell.EventKey) *tcell.EventKey {
			if event.Key() == tcell.KeyTab || event.Key() == tcell.KeyBacktab {
				m.configsView.Blur()
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
				next := components[boxFocus]
				if next == m.itemsList && m.centerMode == "config" {
					next = m.configsView
				}
				next.Focus(nil)
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
