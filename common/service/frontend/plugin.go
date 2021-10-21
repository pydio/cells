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
	"encoding/xml"
	"fmt"
	"strconv"
	"strings"

	"github.com/jinzhu/copier"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	json "github.com/pydio/cells/x/jsonx"
)

type Plugin interface {
	GetDescription() string
	GetEnabled() string
	GetId() string
	GetLabel() string
	GetName() string
	GetClientSettings() *Cclient_settings
	GetPluginConfigs() *Cplugin_configs
	GetPluginInfo() *Cplugin_info
	GetServerSettings() *Cserver_settings
	GetRegistryContributions() *Cregistry_contributions
	GetDependencies() *Cdependencies

	ListDependencies() (ids []string)
	DefaultParameters() map[string]interface{}
	DefaultEnabled() bool
	AlwaysEnabled() bool
	AutoEnabled() bool
	ExposeConfigs(map[string]interface{})
	PluginEnabled(status RequestStatus) bool
	FilterActions(status RequestStatus, pool *PluginsPool, actions []*Caction) (output []*Caction)
	PluginConfigs(status RequestStatus) map[string]interface{}
	PluginConfig(status RequestStatus, param *Cglobal_param) interface{}
}

func (plugin *Cplugin) GetDescription() string {
	return plugin.Attrdescription
}
func (plugin *Cplugin) GetEnabled() string {
	return plugin.Attrenabled
}
func (plugin *Cplugin) GetId() string {
	return plugin.Attrid
}
func (plugin *Cplugin) GetLabel() string {
	return plugin.Attrlabel
}
func (plugin *Cplugin) GetName() string {
	return plugin.Attrname
}
func (plugin *Cplugin) GetClientSettings() *Cclient_settings {
	return plugin.Cclient_settings
}
func (plugin *Cplugin) GetPluginConfigs() *Cplugin_configs {
	return plugin.Cplugin_configs
}
func (plugin *Cplugin) GetPluginInfo() *Cplugin_info {
	return plugin.Cplugin_info
}
func (plugin *Cplugin) GetServerSettings() *Cserver_settings {
	return plugin.Cserver_settings
}
func (plugin *Cplugin) GetRegistryContributions() *Cregistry_contributions {
	return plugin.Cregistry_contributions
}
func (plugin *Cplugin) GetDependencies() *Cdependencies {
	return plugin.Cdependencies
}

func LoadPluginFromXML(id string, data []byte) (output Plugin, err error) {

	plugType := strings.Split(id, ".")[0]

	switch plugType {
	case "editor":
		var target Ceditor
		if e1 := xml.Unmarshal(data, &target); e1 == nil {
			if target.Attrid == "" {
				target.Attrid = id
			}
			output = &target
		} else {
			err = fmt.Errorf("Could not load "+id, e1)
		}
	case "meta":
		var target Cmeta
		if e1 := xml.Unmarshal(data, &target); e1 == nil {
			if target.Attrid == "" {
				target.Attrid = id
			}
			output = &target
		} else {
			err = fmt.Errorf("Could not load "+id, e1)
		}
	case "access":
		var target Cajxpdriver
		if e1 := xml.Unmarshal(data, &target); e1 == nil {
			if target.Attrid == "" {
				target.Attrid = id
			}
			output = &target
		} else {
			err = fmt.Errorf("Could not load "+id, e1)
		}
	case "uploader":
		var target Cuploader
		if e1 := xml.Unmarshal(data, &target); e1 == nil {
			if target.Attrid == "" {
				target.Attrid = id
			}
			output = &target
		} else {
			err = fmt.Errorf("Could not load "+id, e1)
		}
	default:
		var target Cplugin
		if e1 := xml.Unmarshal(data, &target); e1 == nil {
			if target.Attrid == "" {
				target.Attrid = id
			}
			output = &target
		} else {
			err = fmt.Errorf("Could not load "+id, e1)
		}
	}
	return

}

func (plugin *Cplugin) ListDependencies() (ids []string) {
	if plugin.Cdependencies == nil {
		return
	}
	if plugin.Cdependencies.CactivePlugin != nil {
		for _, id := range strings.Split(plugin.Cdependencies.CactivePlugin.AttrpluginName, "|") {
			ids = append(ids, id)
		}
	}
	return
}

func (plugin *Cplugin) DefaultEnabled() bool {
	return plugin.Attrenabled != "false"
}

func (plugin *Cplugin) AlwaysEnabled() bool {
	return plugin.Attrenabled == "always"
}

func (plugin *Cplugin) AutoEnabled() bool {
	return plugin.Attrenabled == "auto"
}

func (plugin *Cplugin) DefaultParameters() map[string]interface{} {
	pConf := make(map[string]interface{})
	if settings := plugin.GetServerSettings(); settings != nil {
		for _, param := range settings.Cglobal_param {
			if param.Attrdefault != "" {
				if param.Attrtype == "boolean" {
					val, _ := strconv.ParseBool(param.Attrdefault)
					pConf[param.Attrname] = val
				} else {
					pConf[param.Attrname] = param.Attrdefault
				}
			}
		}
	}
	return pConf
}

func (plugin *Cplugin) ExposeConfigs(c map[string]interface{}) {
	if len(c) == 0 {
		return
	}
	if plugin.Cplugin_configs == nil {
		plugin.Cplugin_configs = &Cplugin_configs{}
	}
	for k, v := range c {
		val, _ := json.Marshal(v)
		plugin.Cplugin_configs.Cproperty = append(plugin.Cplugin_configs.Cproperty, &Cproperty{Attrname: k, Cdata: string(val)})
	}
}

func (plugin *Cplugin) Translate(messages I18nMessages) {
	if debugMissingStrings {
		fmt.Println("Translate plugin " + plugin.Attrid)
	}
	if plugin.Cserver_settings != nil {
		newSettings := &Cserver_settings{}
		for _, orig := range plugin.Cserver_settings.Cglobal_param {
			param := &Cglobal_param{}
			copier.Copy(&param, orig)
			param.Attrlabel = i18nConfMessages(orig.Attrlabel, messages.ConfMessages)
			param.Attrdescription = i18nConfMessages(orig.Attrdescription, messages.ConfMessages)
			param.Attrchoices = i18nConfMessages(orig.Attrchoices, messages.ConfMessages)
			param.Attrdefault = i18nConfMessages(orig.Attrdefault, messages.ConfMessages)
			param.Attrgroup = i18nConfMessages(orig.Attrgroup, messages.ConfMessages)
			newSettings.Cglobal_param = append(newSettings.Cglobal_param, param)
		}
		for _, orig := range plugin.Cserver_settings.Cparam {
			param := &Cparam{}
			copier.Copy(&param, orig)
			param.Attrlabel = i18nConfMessages(orig.Attrlabel, messages.ConfMessages)
			param.Attrdescription = i18nConfMessages(orig.Attrdescription, messages.ConfMessages)
			param.Attrchoices = i18nConfMessages(orig.Attrchoices, messages.ConfMessages)
			param.Attrdefault = i18nConfMessages(orig.Attrdefault, messages.ConfMessages)
			param.Attrgroup = i18nConfMessages(orig.Attrgroup, messages.ConfMessages)
			newSettings.Cparam = append(newSettings.Cparam, param)
		}
		plugin.Cserver_settings = newSettings
	}
	plugin.Attrlabel = i18nConfMessages(plugin.Attrlabel, messages.ConfMessages)
	plugin.Attrdescription = i18nConfMessages(plugin.Attrdescription, messages.ConfMessages)
}

func (plugin *Cplugin) PluginEnabled(status RequestStatus) bool {

	enabled := status.Config.Val("frontend", "plugin", plugin.GetId(), config.KeyFrontPluginEnabled).Default(plugin.DefaultEnabled()).Bool()

	values := status.AclParameters.Val(plugin.GetId(), config.KeyFrontPluginEnabled)
	for _, scope := range status.WsScopes {
		enabled = values.Val(scope).Default(enabled).Bool() // Take last value
	}

	return enabled
}

func (plugin *Cplugin) FilterActions(status RequestStatus, pool *PluginsPool, actions []*Caction) (output []*Caction) {

	for _, action := range actions {
		actionName := action.Attrname
		aclValue := true

		values := status.AclActions.Val(plugin.GetId(), actionName)

		for _, scope := range status.WsScopes {
			aclValue = values.Val(scope).Default(aclValue).Bool() // Take last value
		}

		if !aclValue {
			continue
		}
		// Still enabled - check specific rightContext
		if action.CrightsContext != nil {
			ctx := action.CrightsContext
			if (ctx.AttruserLogged == "true" || ctx.AttruserLogged == "only") && status.NoClaims {
				continue
			}
			if (ctx.AttruserLogged == "false" || ctx.AttruserLogged == "hidden") && !status.NoClaims {
				continue
			}
			if ctx.AttradminOnly == "true" && (status.NoClaims || (status.User.Claims.Profile != common.PydioProfileAdmin)) {
				continue
			}
		}
		if action.Cgui != nil && action.Cgui.CselectionContext != nil && action.Cgui.CselectionContext.AttrallowedMimes != "" {
			action.Cgui.CselectionContext.AttrallowedMimes = pool.ReplaceActionMimes(action.Cgui.CselectionContext.AttrallowedMimes)
		}
		output = append(output, action)
	}
	return
}

func (plugin *Cplugin) PluginConfigs(status RequestStatus) map[string]interface{} {

	confs := make(map[string]interface{})

	if settings := plugin.GetServerSettings(); settings != nil {
		for _, param := range settings.Cglobal_param {
			confs[param.Attrname] = plugin.PluginConfig(status, param)
		}
	}

	return confs
}

func (plugin *Cplugin) PluginConfig(status RequestStatus, param *Cglobal_param) interface{} {

	var val interface{}

	switch param.Attrtype {
	case "boolean":
		var e error
		val, _ = strconv.ParseBool(param.Attrdefault)
		if e != nil {
			val = false
		}

		// First we look in the main config
		val = status.Config.Val("frontend", "plugin", plugin.GetId(), param.Attrname).Default(val).Bool()

		// Then we lookin foreach scope and get the last one set
		for _, scope := range status.WsScopes {
			val = status.AclParameters.Val(plugin.GetId(), param.Attrname, scope).Default(val).Bool()
		}
	case "integer":
		var e error
		val, e = strconv.ParseInt(param.Attrdefault, 10, 32)
		if e != nil {
			val = 0
		}

		// First we look in the main config
		val = status.Config.Val("frontend", "plugin", plugin.GetId(), param.Attrname).Default(val).Int()

		// Then we lookin foreach scope and get the last one set
		for _, scope := range status.WsScopes {
			val = status.AclParameters.Val(plugin.GetId(), param.Attrname, scope).Default(val).Int()
		}
	default:
		val = param.Attrdefault

		// First we look in the main config
		val = status.Config.Val("frontend", "plugin", plugin.GetId(), param.Attrname).Default(val).String()

		// Then we lookin foreach scope and get the last one set
		for _, scope := range status.WsScopes {
			val = status.AclParameters.Val(plugin.GetId(), param.Attrname, scope).Default(val).String()
		}
	}

	return val
}
