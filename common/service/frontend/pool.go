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

package frontend

import (
	"context"
	"fmt"
	"io"
	"path"
	"strings"

	"github.com/jinzhu/copier"
	toposort "github.com/philopon/go-toposort"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/i18n/languages"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
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
	data, e := io.ReadAll(index)
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
	for lang := range languages.AvailableLanguages {
		p.Messages[lang] = p.I18nMessages(lang)
		log.Logger(context.Background()).Debug("Loading messages for "+lang, zap.Int("m", len(p.Messages[lang].Messages)), zap.Int("conf", len(p.Messages[lang].ConfMessages)))
	}

	return nil

}

func (p *PluginsPool) RegistryForStatus(ctx context.Context, status RequestStatus) (*Cpydio_registry, error) {

	plugins := p.pluginsForStatus(ctx, status)
	registry := &Cpydio_registry{}
	registry.Cplugins = &Cplugins{}
	registry.Cactions = &Cactions{}
	registry.Cextensions = &Cextensions{}
	registry.Cclient_configs = &Cclient_configs{}
	registry.Cuser = status.User.Publish(ctx, status, p)

	messages := p.Messages["en-us"]
	if status.Lang != "" {
		if msg, ok := p.Messages[status.Lang]; ok {
			messages = msg
		}
	}

	for _, plugin := range plugins {

		configs := plugin.PluginConfigs(status)
		var contribs *Cregistry_contributions
		if p, ok := plugin.(*Cuploader); ok {
			clone := &Cuploader{}
			copier.Copy(&clone, p)
			clone.ExposeConfigs(configs)
			clone.Translate(messages)
			contribs = clone.GetRegistryContributions()
			clone.Cregistry_contributions = nil
			registry.Cplugins.Cuploader = append(registry.Cplugins.Cuploader, clone)
		} else if p, ok := plugin.(*Ceditor); ok {
			clone := &Ceditor{}
			copier.Copy(&clone, p)
			clone.ExposeConfigs(configs)
			clone.Translate(messages)
			contribs = clone.GetRegistryContributions()
			clone.Cregistry_contributions = nil
			registry.Cplugins.Ceditor = append(registry.Cplugins.Ceditor, clone)
		} else if p, ok := plugin.(*Cmeta); ok {
			clone := &Cmeta{}
			copier.Copy(&clone, p)
			clone.ExposeConfigs(configs)
			clone.Translate(messages)
			contribs = clone.GetRegistryContributions()
			clone.Cregistry_contributions = nil
			registry.Cplugins.Cmeta = append(registry.Cplugins.Cmeta, clone)
		} else if p, ok := plugin.(*Cajxpdriver); ok {
			clone := &Cajxpdriver{}
			copier.Copy(&clone, p)
			clone.ExposeConfigs(configs)
			clone.Translate(messages)
			contribs = clone.GetRegistryContributions()
			clone.Cregistry_contributions = nil
			registry.Cplugins.Cajxpdriver = append(registry.Cplugins.Cajxpdriver, clone)
		} else if p, ok := plugin.(*Cplugin); ok {
			clone := &Cplugin{}
			copier.Copy(&clone, p)
			clone.ExposeConfigs(configs)
			clone.Translate(messages)
			contribs = clone.GetRegistryContributions()
			clone.Cregistry_contributions = nil
			registry.Cplugins.Cplugin = append(registry.Cplugins.Cplugin, clone)
		}
		if contribs != nil && contribs.Cactions != nil {
			actions := plugin.FilterActions(status, p, plugin.GetRegistryContributions().Cactions.Caction)
			registry.Cactions.MergeActions(actions)
		}
		if contribs != nil && contribs.Cclient_configs != nil {
			registry.Cclient_configs.Ccomponent_config = append(registry.Cclient_configs.Ccomponent_config, plugin.GetRegistryContributions().Cclient_configs.Ccomponent_config...)
			registry.Cclient_configs.Ctemplate = append(registry.Cclient_configs.Ctemplate, plugin.GetRegistryContributions().Cclient_configs.Ctemplate...)
			registry.Cclient_configs.Ctemplate_part = append(registry.Cclient_configs.Ctemplate_part, plugin.GetRegistryContributions().Cclient_configs.Ctemplate_part...)
		}
		if contribs != nil && contribs.Cextensions != nil {
			registry.Cextensions.Cextension = append(registry.Cextensions.Cextension, contribs.Cextensions.Cextension...)
		}

	}

	if e := ApplyRegModifiers(ctx, status, registry); e != nil {
		return nil, e
	}

	return registry, nil

}

func (p *PluginsPool) AllPluginsManifests(ctx context.Context, lang string) *Cplugins {

	all := new(Cplugins)
	messages := p.Messages["en-us"]
	if lang != "" {
		if msg, ok := p.Messages[lang]; ok {
			messages = msg
		}
	}
	emptyStatus := RequestStatus{
		RuntimeCtx:    ctx,
		Config:        config.Get(ctx),
		Lang:          lang,
		NoClaims:      true,
		AclParameters: configx.New(),
		AclActions:    configx.New(),
	}

	for _, plugin := range p.Plugins {
		var enabled = "false"
		if plugin.AutoEnabled() {
			enabled = "auto"
		} else if plugin.PluginEnabled(emptyStatus) {
			if plugin.AlwaysEnabled() {
				enabled = "always"
			} else {
				enabled = "true"
			}
		}
		if cuploader, ok := plugin.(*Cuploader); ok {
			clone := &Cuploader{}
			copier.Copy(&clone, cuploader)
			clone.Translate(messages)
			clone.Attrenabled = enabled
			all.Cuploader = append(all.Cuploader, clone)
		} else if ceditor, ok := plugin.(*Ceditor); ok {
			clone := &Ceditor{}
			copier.Copy(&clone, ceditor)
			clone.Translate(messages)
			clone.Attrenabled = enabled
			all.Ceditor = append(all.Ceditor, clone)
		} else if cmeta, ok := plugin.(*Cmeta); ok {
			clone := &Cmeta{}
			copier.Copy(&clone, cmeta)
			clone.Translate(messages)
			clone.Attrenabled = enabled
			all.Cmeta = append(all.Cmeta, clone)
		} else if cajxpdriver, ok := plugin.(*Cajxpdriver); ok {
			clone := &Cajxpdriver{}
			copier.Copy(&clone, cajxpdriver)
			clone.Translate(messages)
			clone.Attrenabled = enabled
			all.Cajxpdriver = append(all.Cajxpdriver, clone)
		} else if cplugin, ok := plugin.(*Cplugin); ok {
			clone := &Cplugin{}
			copier.Copy(&clone, cplugin)
			clone.Translate(messages)
			clone.Attrenabled = enabled
			all.Cplugin = append(all.Cplugin, clone)
		}

	}

	return all
}

func (p *PluginsPool) pluginsForStatus(ctx context.Context, status RequestStatus) []Plugin {

	var activeAccessType string
	if !status.NoClaims {
		activeAccessType = status.User.ActiveAccessType
	}
	// Filter Accesses
	filtered := make(map[string]Plugin)

	for id, p := range p.Plugins {
		if err := ApplyPluginModifiers(ctx, status, p); err != nil {
			log.Logger(ctx).Error("Filtering out plugin "+id+" (error while applying filter)", zap.Error(err))
			continue
		}
		if !p.PluginEnabled(status) {
			log.Logger(ctx).Debug("Filtering out plugin " + id + " (disabled)")
			continue
		}
		parts := strings.Split(id, ".")
		if parts[0] == "access" && parts[1] != activeAccessType {
			log.Logger(ctx).Debug("Filtering out plugin " + id + " (wrong access)")
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
			log.Logger(ctx).Debug("Filtering out plugin " + id + " (missing dependencies)")
		}
	}
	sorted := p.sort(filteredDeps)

	return sorted
}

func (p *PluginsPool) I18nMessages(lang string) I18nMessages {

	if legacy, b := languages.LegacyNames[lang]; b {
		lang = legacy
	}

	if data, ok := p.Messages[lang]; ok {
		// Already parsed !
		return data
	}
	msg := make(map[string]string)
	conf := make(map[string]string)
	defaultLang := "en-us"
	for _, plugin := range p.Plugins {
		c := plugin.GetClientSettings()
		if c != nil && c.Cresources != nil && len(c.Cresources.Ci18n) > 0 {
			for _, tag := range c.Cresources.Ci18n {
				pa := strings.TrimPrefix(tag.Attrremote, "plug/")
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
	type Translation struct {
		Other string `json:"other"`
	}
	msg := map[string]string{}
	var f io.ReadCloser
	if f1, e1 := p.fs.Open(path.Join(libPath, lang+".all.json")); e1 == nil {
		f = f1
	} else if f2, e2 := p.fs.Open(path.Join(libPath, defaultLang+".all.json")); e2 == nil {
		f = f2
	}
	//TODO move to another layer
	//appTitle := config.Get(ctx, "frontend", "plugin", "core.pydio", "APPLICATION_TITLE").String()
	if f != nil {
		content, _ := io.ReadAll(f)
		var data map[string]Translation
		if e1 := json.Unmarshal(content, &data); e1 == nil {
			for k, trans := range data {
				v := trans.Other
				/*
					if appTitle != "" && strings.Contains(v, "APPLICATION_TITLE") {
						v = strings.Replace(v, "APPLICATION_TITLE", appTitle, -1)
					}
				*/
				if ns == "" {
					msg[k] = v
				} else {
					msg[ns+"."+k] = v
				}
			}
		} else {
			log.Logger(context.Background()).Error("Cannot parse language file: ", zap.String("lib", libPath), zap.String("lang", lang), zap.Error(e1))
		}
		f.Close()
	}
	return msg
}

func (p *PluginsPool) ExposedParametersByScope(scopeName string, exposed bool) (params []*ExposedParam) {

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
	var output []Plugin
	graph := toposort.NewGraph(len(plugins))
	for id, p := range plugins {
		graph.AddNode(id)
		for _, dep := range p.ListDependencies() {
			graph.AddEdge(id, dep)
		}
	}
	if result, ok := graph.Toposort(); ok {
		for i := len(result) - 1; i >= 0; i-- {
			plugId := result[i]
			if plu, ok1 := plugins[plugId]; ok1 {
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
		data, e = io.ReadAll(x)
		if e != nil {
			return nil, e
		}
	} else {
		return nil, e
	}

	output, err = LoadPluginFromXML(id, data)
	return
}
