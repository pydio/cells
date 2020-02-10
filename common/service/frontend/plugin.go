package frontend

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"strconv"
	"strings"

	"github.com/jinzhu/copier"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
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

	enabled := plugin.DefaultEnabled()
	// Override if not empty
	c := status.Config.Get("frontend", "plugin", plugin.GetId(), "PYDIO_PLUGIN_ENABLED")
	if c != nil && c.Bool(enabled) != enabled {
		enabled = c.Bool(enabled)
	}
	if p := status.AclParameters.Get(plugin.GetId()); p != nil {
		params := p.(*config.Map)
		if p2 := params.Get("PYDIO_PLUGIN_ENABLED"); p2 != nil {
			values := p2.(*config.Map)
			for _, scope := range status.WsScopes {
				enabled = values.Bool(scope, enabled) // Take last value
			}
		}
	}

	return enabled
}

func (plugin *Cplugin) FilterActions(status RequestStatus, pool *PluginsPool, actions []*Caction) (output []*Caction) {

	for _, action := range actions {
		actionName := action.Attrname
		aclValue := true
		if p := status.AclActions.Get(plugin.GetId()); p != nil {
			actions := p.(*config.Map)
			if p2 := actions.Get(actionName); p2 != nil {
				values := p2.(*config.Map)
				for _, scope := range status.WsScopes {
					aclValue = values.Bool(scope, aclValue) // Take last value
				}
			}
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
			if ctx.AttradminOnly == "true" && (status.NoClaims || (status.User.Claims.Profile != common.PYDIO_PROFILE_ADMIN)) {
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
	c := status.Config.Get("frontend", "plugin", plugin.GetId(), param.Attrname)
	var aclParam *config.Map

	if p := status.AclParameters.Get(plugin.GetId()); p != nil {
		params := p.(*config.Map)
		if p2 := params.Get(param.Attrname); p2 != nil {
			aclParam = p2.(*config.Map)
		}
	}

	switch param.Attrtype {
	case "boolean":
		var e error
		val, _ = strconv.ParseBool(param.Attrdefault)
		if e != nil {
			val = false
		}
		if c != nil {
			if c.String("") != "" {
				// May have been stored as a string
				val, _ = strconv.ParseBool(c.String("false"))
			} else {
				val = c.Bool(val.(bool))
			}
		}
		if aclParam != nil {
			for _, scope := range status.WsScopes {
				if aclParam.Bool(scope, val.(bool)) != val {
					val = aclParam.Bool(scope, val.(bool))
				}
			}
		}
	case "integer":
		var e error
		val, e = strconv.ParseInt(param.Attrdefault, 10, 32)
		if e != nil {
			val = 0
		}
		if c != nil {
			if c.String("") != "" {
				// May have been stored as a string
				val, _ = strconv.ParseInt(c.String(""), 10, 32)
			} else {
				val = c.Int(0)
			}
		}
		if aclParam != nil {
			for _, scope := range status.WsScopes {
				if aclParam.Int(scope, val.(int)) != val {
					val = aclParam.Int(scope, val.(int))
				}
			}
		}
	default:
		val = param.Attrdefault
		if c != nil && c.String(val.(string)) != "" {
			val = c.String(val.(string))
		}
		if aclParam != nil {
			for _, scope := range status.WsScopes {
				if aclParam.String(scope) != "" {
					val = aclParam.String(scope)
				}
			}
		}
	}

	return val
}
