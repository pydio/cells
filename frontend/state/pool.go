package state

import (
	"context"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io/ioutil"
	"strings"

	"github.com/gyuho/goraph"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/service/frontend"
)

type PluginsPool struct {
	Plugins             map[string]Plugin
	loadedEditableMimes []string
}

func NewPluginsPool() *PluginsPool {
	p := &PluginsPool{}
	p.Plugins = make(map[string]Plugin)
	return p
}

func (p *PluginsPool) Load(fs *frontend.UnionHttpFs) error {

	index, e := fs.Open("index.json")
	if e != nil {
		return e
	}
	defer index.Close()
	data, e := ioutil.ReadAll(index)
	if e != nil {
		return e
	}
	var plugs []string
	e = json.Unmarshal(data, &plugs)
	if e != nil {
		return fmt.Errorf("Cannot parse json", string(data), e)
	}
	for _, plugin := range plugs {
		object, e := p.readManifest(fs, plugin)
		if e != nil {
			return e
		}
		p.Plugins[plugin] = object
	}
	return nil
}

func (p *PluginsPool) PluginsForStatus(ctx context.Context, status RequestStatus) []Plugin {

	var activeAccessType string
	if !status.NoClaims {
		activeAccessType = status.User.ActiveAccessType
	}
	// Filter Accesses
	filtered := make(map[string]Plugin)
	for id, p := range p.Plugins {
		if !p.PluginEnabled(status) {
			log.Logger(ctx).Info("Filtering out plugin " + id + " (disabled)")
			continue
		}
		parts := strings.Split(id, ".")
		if parts[0] == "access" && parts[1] != activeAccessType {
			log.Logger(ctx).Info("Filtering out plugin " + id + " (wrong access)")
			continue
		}
		filtered[id] = p
	}
	filteredDeps := make(map[string]Plugin)
	for id, plugin := range filtered {
		deps := plugin.ListDependencies()
		if len(deps) == 0 {
			filteredDeps[id] = plugin
			continue
		}
		foundOne := false
		for _, dep := range plugin.ListDependencies() {
			if _, ok := filtered[dep]; ok {
				foundOne = true
				break
			}
		}
		if foundOne {
			filteredDeps[id] = plugin
		} else {
			log.Logger(ctx).Info("Filtering out plugin " + id + " (missing dependencies)")
		}
	}
	sorted := p.sort(filteredDeps)

	return sorted
}

func (p *PluginsPool) ExposedParametersByScope(scopeName string, exposed bool) (params []*ExposedParam) {
	// Todo : cache?

	for _, plugin := range p.Plugins {
		s := plugin.GetServerSettings()
		if s == nil || s.Cparam == nil {
			continue
		}
		for _, param := range s.Cparam {
			if exposed && param.Attrexpose != "true" {
				continue
			}
			if strings.Contains(param.Attrscope, scopeName) {
				exposeP := &ExposedParam{
					PluginId: plugin.GetId(),
				}
				exposeP.Cparam = *param
				params = append(params, exposeP)
			}
		}
	}

	return
}

func (p *PluginsPool) ReplaceActionMimes(mime string) string {
	output := []string{}
	for _, m := range strings.Split(mime, ",") {
		switch m {
		case "PYDIO_MIMES_EDITABLE":
			output = append(output, p.editableMimes()...)
		case "PYDIO_MIMES_IMAGE":
			output = append(output, "png", "bmp", "jpg", "jpeg", "gif")
		case "PYDIO_MIMES_AUDIO":
			output = append(output, "mp3", "ogg", "wav")
		case "PYDIO_MIMES_ZIP":
			output = append(output, "zip", "ajxp_browsable_archive")
		default:
			output = append(output, m)
		}
	}
	return strings.Join(output, ",")
}

func (p *PluginsPool) editableMimes() (mimes []string) {
	if p.loadedEditableMimes != nil {
		return p.loadedEditableMimes
	}
	for _, plugin := range p.Plugins {
		if strings.HasPrefix(plugin.GetId(), "editor.") {
			editor := plugin.(*Ceditor)
			if editor.Attropenable == "true" {
				mimes = append(mimes, strings.Split(editor.Attrmimes, ",")...)
			}
		}
	}
	p.loadedEditableMimes = mimes
	return
}

func (p *PluginsPool) sort(plugins map[string]Plugin) []Plugin {
	output := []Plugin{}
	graph := goraph.NewGraph()
	for id, p := range plugins {
		plugNode := goraph.NewNode(id)
		if node, err := graph.GetNode(plugNode); err == nil && node != nil {
			plugNode = node
		} else {
			graph.AddNode(plugNode)
		}
		for _, dep := range p.ListDependencies() {
			depNode := goraph.NewNode(dep)
			if dNode, err := graph.GetNode(depNode); err == nil && dNode != nil {
				depNode = dNode
			} else {
				graph.AddNode(depNode)
			}
			graph.AddEdge(depNode, plugNode, 1)
		}
	}
	if sorted, ok := goraph.TopologicalSort(graph); ok {
		for _, nodeID := range sorted {
			if plu, ok1 := plugins[nodeID.String()]; ok1 {
				output = append(output, plu)
			}
		}
	}
	return output
}

func (p *PluginsPool) readManifest(fs *frontend.UnionHttpFs, plugin string) (output Plugin, err error) {

	var data []byte
	x, e := fs.Open(plugin + "/manifest.xml")
	if e == nil {
		defer x.Close()
		data, e = ioutil.ReadAll(x)
		if e != nil {
			return nil, e
		}
	} else {
		// Try real FS for now
		data, e = ioutil.ReadFile("/Users/charles/Sources/cells-front/plugins/" + plugin + "/manifest.xml")
		if e != nil {
			return nil, e
		}
	}
	plugType := strings.Split(plugin, ".")[0]

	switch plugType {
	case "editor":
		var target Ceditor
		if e1 := xml.Unmarshal(data, &target); e1 == nil {
			if target.Attrid == "" {
				target.Attrid = plugin
			}
			output = &target
		} else {
			err = fmt.Errorf("Could not load "+plugin, e1)
		}
	case "meta":
		var target Cmeta
		if e1 := xml.Unmarshal(data, &target); e1 == nil {
			if target.Attrid == "" {
				target.Attrid = plugin
			}
			output = &target
		} else {
			err = fmt.Errorf("Could not load "+plugin, e1)
		}
	case "access":
		var target Cajxpdriver
		if e1 := xml.Unmarshal(data, &target); e1 == nil {
			if target.Attrid == "" {
				target.Attrid = plugin
			}
			output = &target
		} else {
			err = fmt.Errorf("Could not load "+plugin, e1)
		}
	case "uploader":
		var target Cuploader
		if e1 := xml.Unmarshal(data, &target); e1 == nil {
			if target.Attrid == "" {
				target.Attrid = plugin
			}
			output = &target
		} else {
			err = fmt.Errorf("Could not load "+plugin, e1)
		}
	default:
		var target Cplugin
		if e1 := xml.Unmarshal(data, &target); e1 == nil {
			if target.Attrid == "" {
				target.Attrid = plugin
			}
			output = &target
		} else {
			err = fmt.Errorf("Could not load "+plugin, e1)
		}
	}
	return

}
