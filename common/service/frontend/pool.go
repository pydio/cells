package frontend

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"strings"

	"io"
	"path"

	"github.com/gyuho/goraph"
	"github.com/jinzhu/copier"
	"github.com/pydio/cells/common/log"
	"go.uber.org/zap"
)

type PluginsPool struct {
	Plugins             map[string]Plugin
	loadedEditableMimes []string
	fs                  *UnionHttpFs
	Messages            map[string]I18nMessages
}

func NewPluginsPool() *PluginsPool {
	p := &PluginsPool{}
	p.Plugins = make(map[string]Plugin)
	return p
}

func (p *PluginsPool) Load(fs *UnionHttpFs) error {

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
		return fmt.Errorf("cannot parse json %s, %s", string(data), e.Error())
	}
	p.fs = fs
	for _, plugin := range plugs {
		object, e := p.readManifest(fs, plugin)
		if e != nil {
			log.Logger(context.Background()).Error("Ignoring "+plugin, zap.Error(e))
			continue
		}
		p.Plugins[plugin] = object
	}

	p.Messages = make(map[string]I18nMessages)
	for _, lang := range p.AvailableLanguages() {
		p.Messages[lang] = p.I18nMessages(lang)
		log.Logger(context.Background()).Info("Loading messages for "+lang, zap.Int("m", len(p.Messages[lang].Messages)), zap.Int("conf", len(p.Messages[lang].ConfMessages)))
	}

	return nil

}

func (p *PluginsPool) RegistryForStatus(ctx context.Context, status RequestStatus) *Cpydio_registry {

	plugins := p.pluginsForStatus(ctx, status)
	registry := &Cpydio_registry{}
	registry.Cplugins = &Cplugins{}
	registry.Cactions = &Cactions{}
	registry.Cclient_configs = &Cclient_configs{}
	registry.Cuser = status.User.Publish(status, p)

	messages := p.Messages["en"]
	if status.Lang != "" {
		if msg, ok := p.Messages[status.Lang]; ok {
			messages = msg
		}
	}

	for _, plugin := range plugins {

		configs := plugin.PluginConfigs(status)

		if p, ok := plugin.(*Cuploader); ok {
			clone := &Cuploader{}
			copier.Copy(&clone, p)
			clone.ExposeConfigs(configs)
			clone.Translate(messages)
			clone.Cregistry_contributions = nil
			registry.Cplugins.Cuploader = append(registry.Cplugins.Cuploader, clone)
		} else if p, ok := plugin.(*Ceditor); ok {
			clone := &Ceditor{}
			copier.Copy(&clone, p)
			clone.ExposeConfigs(configs)
			clone.Translate(messages)
			clone.Cregistry_contributions = nil
			registry.Cplugins.Ceditor = append(registry.Cplugins.Ceditor, clone)
		} else if p, ok := plugin.(*Cmeta); ok {
			clone := &Cmeta{}
			copier.Copy(&clone, p)
			clone.ExposeConfigs(configs)
			clone.Translate(messages)
			clone.Cregistry_contributions = nil
			registry.Cplugins.Cmeta = append(registry.Cplugins.Cmeta, clone)
		} else if p, ok := plugin.(*Cajxpdriver); ok {
			clone := &Cajxpdriver{}
			copier.Copy(&clone, p)
			clone.ExposeConfigs(configs)
			clone.Translate(messages)
			clone.Cregistry_contributions = nil
			registry.Cplugins.Cajxpdriver = append(registry.Cplugins.Cajxpdriver, clone)
		} else if p, ok := plugin.(*Cplugin); ok {
			clone := &Cplugin{}
			copier.Copy(&clone, p)
			clone.ExposeConfigs(configs)
			clone.Translate(messages)
			clone.Cregistry_contributions = nil
			registry.Cplugins.Cplugin = append(registry.Cplugins.Cplugin, clone)
		}
		contribs := plugin.GetRegistryContributions()
		if contribs != nil && contribs.Cactions != nil {
			actions := plugin.FilterActions(status, p, plugin.GetRegistryContributions().Cactions.Caction)
			registry.Cactions.MergeActions(actions)
		}
		if contribs != nil && contribs.Cclient_configs != nil {
			registry.Cclient_configs.Ccomponent_config = append(registry.Cclient_configs.Ccomponent_config, plugin.GetRegistryContributions().Cclient_configs.Ccomponent_config...)
			registry.Cclient_configs.Ctemplate = append(registry.Cclient_configs.Ctemplate, plugin.GetRegistryContributions().Cclient_configs.Ctemplate...)
			registry.Cclient_configs.Ctemplate_part = append(registry.Cclient_configs.Ctemplate_part, plugin.GetRegistryContributions().Cclient_configs.Ctemplate_part...)
		}

	}

	if e := ApplyRegModifiers(ctx, status, registry); e != nil {
		log.Logger(ctx).Error("Error while applying modifiers to registry!", zap.Error(e))
	}

	return registry

}

func (p *PluginsPool) pluginsForStatus(ctx context.Context, status RequestStatus) []Plugin {

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

func (p *PluginsPool) AvailableLanguages() []string {
	return []string{"en", "es", "de", "fr", "it", "pt-br"}
}

func (p *PluginsPool) I18nMessages(lang string) I18nMessages {
	msg := make(map[string]string)
	conf := make(map[string]string)
	defaultLang := "en"
	for _, plugin := range p.Plugins {
		c := plugin.GetClientSettings()
		if c != nil && c.Cresources != nil && len(c.Cresources.Ci18n) > 0 {
			for _, tag := range c.Cresources.Ci18n {
				var pa string
				pa = strings.TrimPrefix(tag.Attrremote, "plug/")
				ns := tag.Attrnamespace
				msgs := p.parseI18nFolder(ns, lang, defaultLang, pa)
				for k, v := range msgs {
					msg[k] = v
				}
				confs := p.parseI18nFolder("", lang, defaultLang, path.Join(pa, "conf"))
				for k, v := range confs {
					conf[k] = v
				}
			}
		}
	}
	return I18nMessages{Messages: msg, ConfMessages: conf}
}

func (p *PluginsPool) parseI18nFolder(ns string, lang string, defaultLang string, libPath string) map[string]string {
	msg := map[string]string{}
	var f io.ReadCloser
	if f1, e1 := p.fs.Open(path.Join(libPath, lang+".json")); e1 == nil {
		f = f1
	} else if f2, e2 := p.fs.Open(path.Join(libPath, defaultLang+".json")); e2 == nil {
		f = f2
	}
	if f != nil {
		content, _ := ioutil.ReadAll(f)
		var data map[string]string
		if e1 := json.Unmarshal(content, &data); e1 == nil {
			for k, v := range data {
				if ns == "" {
					msg[k] = v
				} else {
					msg[ns+"."+k] = v
				}
			}
		}
		f.Close()
	}
	return msg
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

func (p *PluginsPool) readManifest(fs *UnionHttpFs, id string) (output Plugin, err error) {

	var data []byte
	x, e := fs.Open(id + "/manifest.xml")
	if e == nil {
		defer x.Close()
		data, e = ioutil.ReadAll(x)
		if e != nil {
			return nil, e
		}
	} else {
		return nil, e
	}

	output, err = LoadPluginFromXML(id, data)
	return
}
