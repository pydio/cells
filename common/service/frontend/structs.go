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
)

type Caction struct {
	XMLName                  xml.Name          `xml:"action,omitempty" json:"action,omitempty"`
	AttrctrlDragndropDefault string            `xml:"ctrlDragndropDefault,attr,omitempty"  json:",omitempty"`
	AttrdirDefault           string            `xml:"dirDefault,attr,omitempty"  json:",omitempty"`
	AttrdragndropDefault     string            `xml:"dragndropDefault,attr,omitempty"  json:",omitempty"`
	AttrexpireDefault        string            `xml:"expireDefault,attr,omitempty"  json:",omitempty"`
	AttrfileDefault          string            `xml:"fileDefault,attr,omitempty"  json:",omitempty"`
	Attrname                 string            `xml:"name,attr,omitempty"  json:",omitempty"`
	AttrskipSecureToken      string            `xml:"skipSecureToken,attr,omitempty"  json:",omitempty"`
	Cgui                     *Cgui             `xml:"gui,omitempty" json:"gui,omitempty"`
	Cpost_processing         *Cpost_processing `xml:"post_processing,omitempty" json:"post_processing,omitempty"`
	Cpre_processing          *Cpre_processing  `xml:"pre_processing,omitempty" json:"pre_processing,omitempty"`
	Cprocessing              []*Cprocessing    `xml:"processing,omitempty" json:"processing,omitempty"`
	CrightsContext           *CrightsContext   `xml:"rightsContext,omitempty" json:"rightsContext,omitempty"`
	CsubMenu                 *CsubMenu         `xml:"subMenu,omitempty" json:"subMenu,omitempty"`
}

type Cactions struct {
	XMLName xml.Name   `xml:"actions,omitempty" json:"actions,omitempty"`
	Caction []*Caction `xml:"action,omitempty" json:"action,omitempty"`
}

type CactiveCondition struct {
	XMLName xml.Name `xml:"activeCondition,omitempty" json:"activeCondition,omitempty"`
	Cdata   string   `xml:",cdata" json:",omitempty"`
}

type CactivePlugin struct {
	XMLName        xml.Name `xml:"activePlugin,omitempty" json:"activePlugin,omitempty"`
	AttrpluginName string   `xml:"pluginName,attr,omitempty"  json:",omitempty"`
}

type CpluginResources struct {
	XMLName        xml.Name `xml:"pluginResources,omitempty" json:"pluginResources,omitempty"`
	AttrpluginName string   `xml:"pluginName,attr,omitempty"  json:",omitempty"`
}

type CpluginClass struct {
	XMLName        xml.Name `xml:"pluginClass,omitempty" json:"pluginClass,omitempty"`
	AttrpluginName string   `xml:"pluginName,attr,omitempty"  json:",omitempty"`
}

type Cactive_repo struct {
	XMLName xml.Name `xml:"active_repo,omitempty" json:"active_repo,omitempty"`
	Attrid  string   `xml:"id,attr,omitempty"  json:",omitempty"`
}

type Cadditional_column struct {
	XMLName              xml.Name `xml:"additional_column,omitempty" json:"additional_column,omitempty"`
	AttrattributeName    string   `xml:"attributeName,attr,omitempty"  json:",omitempty"`
	AttrdefaultVisibilty string   `xml:"defaultVisibilty,attr,omitempty"  json:",omitempty"`
	AttrmessageId        string   `xml:"messageId,attr,omitempty"  json:",omitempty"`
	AttrmessageString    string   `xml:"messageString,attr,omitempty"  json:",omitempty"`
	AttrsortType         string   `xml:"sortType,attr,omitempty"  json:",omitempty"`
	AttrreactModifier    string   `xml:"reactModifier,attr,omitempty"  json:",omitempty"`
	AttrmetaAdditional   string   `xml:"metaAdditional,attr,omitempty"  json:",omitempty"`
}

type Cajxpdriver struct {
	Cplugin
	XMLName xml.Name `xml:"ajxpdriver,omitempty" json:"ajxpdriver,omitempty"`
}

type Cclass_definition struct {
	XMLName       xml.Name `xml:"class_definition,omitempty" json:"class_definition,omitempty"`
	Attrclassname string   `xml:"classname,attr,omitempty"  json:",omitempty"`
	Attrfilename  string   `xml:"filename,attr,omitempty"  json:",omitempty"`
}

type CclientCallback struct {
	XMLName    xml.Name `xml:"clientCallback,omitempty" json:"clientCallback,omitempty"`
	Attrmodule string   `xml:"module,attr,omitempty"  json:",omitempty"`
	Cdata      string   `xml:",cdata" json:",omitempty"`
}

type CclientForm struct {
	XMLName    xml.Name `xml:"clientForm,omitempty" json:"clientForm,omitempty"`
	Attrid     string   `xml:"id,attr,omitempty"  json:",omitempty"`
	Attrmodule string   `xml:"module,attr,omitempty"  json:",omitempty"`
	Cdata      string   `xml:",cdata" json:",omitempty"`
}

type CclientListener struct {
	XMLName    xml.Name `xml:"clientListener,omitempty" json:"clientListener,omitempty"`
	Attrmodule string   `xml:"module,attr,omitempty"  json:",omitempty"`
	Attrname   string   `xml:"name,attr,omitempty"  json:",omitempty"`
}

type Cclient_configs struct {
	XMLName           xml.Name             `xml:"client_configs,omitempty" json:"client_configs,omitempty"`
	AttruuidAttr      string               `xml:"uuidAttr,attr,omitempty"  json:",omitempty"`
	Ccomponent_config []*Ccomponent_config `xml:"component_config,omitempty" json:"component_config,omitempty"`
	Ctemplate         []*Ctemplate         `xml:"template,omitempty" json:"template,omitempty"`
	Ctemplate_part    []*Ctemplate_part    `xml:"template_part,omitempty" json:"template_part,omitempty"`
}

type Cclient_settings struct {
	XMLName                  xml.Name        `xml:"client_settings,omitempty" json:"client_settings,omitempty"`
	Attrdescription_template string          `xml:"description_template,attr,omitempty"  json:",omitempty"`
	Attricon                 string          `xml:"icon,attr,omitempty"  json:",omitempty"`
	AttriconClass            string          `xml:"iconClass,attr,omitempty"  json:",omitempty"`
	Cnode_provider           *Cnode_provider `xml:"node_provider,omitempty" json:"node_provider,omitempty"`
	Cresources               *Cresources     `xml:"resources,omitempty" json:"resources,omitempty"`
}

type Ccolumn struct {
	XMLName              xml.Name `xml:"column,omitempty" json:"column,omitempty"`
	AttrattributeName    string   `xml:"attributeName,attr,omitempty"  json:",omitempty"`
	AttrdefaultVisibilty string   `xml:"defaultVisibilty,attr,omitempty"  json:",omitempty"`
	AttrdefaultWidth     string   `xml:"defaultWidth,attr,omitempty"  json:",omitempty"`
	AttrmessageId        string   `xml:"messageId,attr,omitempty"  json:",omitempty"`
	Attrmodifier         string   `xml:"modifier,attr,omitempty"  json:",omitempty"`
	AttrsortType         string   `xml:"sortType,attr,omitempty"  json:",omitempty"`
}

type Ccolumns struct {
	XMLName            xml.Name              `xml:"columns,omitempty" json:"columns,omitempty"`
	AttrswitchGridMode string                `xml:"switchGridMode,attr,omitempty"  json:",omitempty"`
	Cadditional_column []*Cadditional_column `xml:"additional_column,omitempty" json:"additional_column,omitempty"`
	Ccolumn            []*Ccolumn            `xml:"column,omitempty" json:"column,omitempty"`
}

type Ccomponent_config struct {
	XMLName       xml.Name      `xml:"component_config,omitempty" json:"component_config,omitempty"`
	Attrcomponent string        `xml:"component,attr,omitempty"  json:",omitempty"`
	Ccolumns      *Ccolumns     `xml:"columns,omitempty" json:"columns,omitempty"`
	CinfoPanel    []*CinfoPanel `xml:"infoPanel,omitempty" json:"infoPanel,omitempty"`
	Cmodifier     []*Cmodifier  `xml:"modifier,omitempty" json:"modifier,omitempty"`
	Cproperty     []*Cproperty  `xml:"property,omitempty" json:"property,omitempty"`
}

type Ccontext struct {
	XMLName            xml.Name `xml:"context,omitempty" json:"context,omitempty"`
	AttractionBar      string   `xml:"actionBar,attr,omitempty"  json:",omitempty"`
	AttractionBarGroup string   `xml:"actionBarGroup,attr,omitempty"  json:",omitempty"`
	Attrbehaviour      string   `xml:"behaviour,attr,omitempty"  json:",omitempty"`
	AttrcontextMenu    string   `xml:"contextMenu,attr,omitempty"  json:",omitempty"`
	Attrdir            string   `xml:"dir,attr,omitempty"  json:",omitempty"`
	AttrinZip          string   `xml:"inZip,attr,omitempty"  json:",omitempty"`
	AttrinfoPanel      string   `xml:"infoPanel,attr,omitempty"  json:",omitempty"`
	Attrrecycle        string   `xml:"recycle,attr,omitempty"  json:",omitempty"`
	Attrselection      string   `xml:"selection,attr,omitempty"  json:",omitempty"`
	AttrevalMetadata   string   `xml:"evalMetadata,attr,omitempty"  json:",omitempty"`
}

type Ccore_relation struct {
	XMLName            xml.Name `xml:"core_relation,omitempty" json:"core_relation,omitempty"`
	Attrpackaged       string   `xml:"packaged,attr,omitempty"  json:",omitempty"`
	Attrtested_version string   `xml:"tested_version,attr,omitempty"  json:",omitempty"`
}

type Ccss struct {
	XMLName      xml.Name `xml:"css,omitempty" json:"css,omitempty"`
	Attrautoload string   `xml:"autoload,attr,omitempty"  json:",omitempty"`
	Attrfile     string   `xml:"file,attr,omitempty"  json:",omitempty"`
}

type Cdescription struct {
	XMLName xml.Name `xml:"description,omitempty" json:"description,omitempty"`
	Cdata   string   `xml:",cdata" json:",omitempty"`
}

type Cdependencies struct {
	XMLName          xml.Name          `xml:"dependencies,omitempty" json:"dependencies,omitempty"`
	CactivePlugin    *CactivePlugin    `xml:"activePlugin,omitempty" json:"activePlugin,omitempty"`
	CpluginResources *CpluginResources `xml:"pluginResources,omitempty" json:"pluginResources,omitempty"`
	CpluginClass     *CpluginClass     `xml:"pluginClass,omitempty" json:"pluginClass,omitempty"`
}

type CdynamicBuilder struct {
	XMLName    xml.Name `xml:"dynamicBuilder,omitempty" json:"dynamicBuilder,omitempty"`
	Attrmodule string   `xml:"module,attr,omitempty"  json:",omitempty"`
}

type Ceditor struct {
	Cplugin
	XMLName             xml.Name       `xml:"editor,omitempty" json:"editor,omitempty"`
	Attractions         string         `xml:"actions,attr,omitempty"  json:",omitempty"`
	AttrcanWrite        string         `xml:"canWrite,attr,omitempty"  json:",omitempty"`
	AttrclassName       string         `xml:"className,attr,omitempty"  json:",omitempty"`
	AttrformId          string         `xml:"formId,attr,omitempty"  json:",omitempty"`
	AttriconClass       string         `xml:"iconClass,attr,omitempty"  json:",omitempty"`
	Attrmimes           string         `xml:"mimes,attr,omitempty"  json:",omitempty"`
	Attropenable        string         `xml:"openable,attr,omitempty"  json:",omitempty"`
	Attrextensions      string         `xml:"extensions,attr,omitempty"  json:",omitempty"`
	Attrorder           string         `xml:"order,attr,omitempty"  json:",omitempty"`
	AttrpreviewProvider string         `xml:"previewProvider,attr,omitempty"  json:",omitempty"`
	Attrtext            string         `xml:"text,attr,omitempty"  json:",omitempty"`
	Attrtitle           string         `xml:"title,attr,omitempty"  json:",omitempty"`
	CclientForm         *CclientForm   `xml:"clientForm,omitempty" json:"clientForm,omitempty"`
	Cprocessing         []*Cprocessing `xml:"processing,omitempty" json:"processing,omitempty"`
}

type Cextension struct {
	XMLName       xml.Name `xml:"extension,omitempty" json:"extension,omitempty"`
	Attrfont      string   `xml:"font,attr,omitempty"  json:",omitempty"`
	Attricon      string   `xml:"icon,attr,omitempty"  json:",omitempty"`
	AttrmessageId string   `xml:"messageId,attr,omitempty"  json:",omitempty"`
	Attrmime      string   `xml:"mime,attr,omitempty"  json:",omitempty"`
}

type CextensionOnInit struct {
	XMLName xml.Name `xml:"extensionOnInit,omitempty" json:"extensionOnInit,omitempty"`
	Cdata   string   `xml:",cdata" json:",omitempty"`
}

type Cextensions struct {
	XMLName    xml.Name      `xml:"extensions,omitempty" json:"extensions,omitempty"`
	Cextension []*Cextension `xml:"extension,omitempty" json:"extension,omitempty"`
}

type Cglobal_param struct {
	XMLName                    xml.Name `xml:"global_param,omitempty" json:"global_param,omitempty"`
	Attrchoices                string   `xml:"choices,attr,omitempty"  json:",omitempty"`
	Attrdefault                string   `xml:"default,attr,omitempty"  json:",omitempty"`
	AttrdefaultImage           string   `xml:"defaultImage,attr,omitempty"  json:",omitempty"`
	Attrdescription            string   `xml:"description,attr,omitempty"  json:",omitempty"`
	Attreditable               string   `xml:"editable,attr,omitempty"  json:",omitempty"`
	Attrexpose                 string   `xml:"expose,attr,omitempty"  json:",omitempty"`
	Attrgroup                  string   `xml:"group,attr,omitempty"  json:",omitempty"`
	Attrlabel                  string   `xml:"label,attr,omitempty"  json:",omitempty"`
	AttrloadAction             string   `xml:"loadAction,attr,omitempty"  json:",omitempty"`
	Attrmandatory              string   `xml:"mandatory,attr,omitempty"  json:",omitempty"`
	Attrname                   string   `xml:"name,attr,omitempty"  json:",omitempty"`
	Attrtype                   string   `xml:"type,attr,omitempty"  json:",omitempty"`
	AttruploadAction           string   `xml:"uploadAction,attr,omitempty"  json:",omitempty"`
	AttrreplicationGroup       string   `xml:"replicationGroup,attr,omitempty" json:"replicationGroup,omitempty"`
	AttrreplicationTitle       string   `xml:"replicationTitle,attr,omitempty" json:"replicationTitle,omitempty"`
	AttrreplicationDescription string   `xml:"replicationDescription,attr,omitempty" json:"replicationDescription,omitempty"`
	AttrreplicationMandatory   string   `xml:"replicationMandatory,attr,omitempty" json:"replicationMandatory,omitempty"`
}

type Cgui struct {
	XMLName              xml.Name           `xml:"gui,omitempty" json:"gui,omitempty"`
	AttraccessKey        string             `xml:"accessKey,attr,omitempty"  json:",omitempty"`
	AttrhasAccessKey     string             `xml:"hasAccessKey,attr,omitempty"  json:",omitempty"`
	AttriconClass        string             `xml:"iconClass,attr,omitempty"  json:",omitempty"`
	AttrspecialAccessKey string             `xml:"specialAccessKey,attr,omitempty"  json:",omitempty"`
	Attrtext             string             `xml:"text,attr,omitempty"  json:",omitempty"`
	Attrtitle            string             `xml:"title,attr,omitempty"  json:",omitempty"`
	Attrweight           string             `xml:"weight,attr,omitempty"  json:",omitempty"`
	Ccontext             *Ccontext          `xml:"context,omitempty" json:"context,omitempty"`
	CselectionContext    *CselectionContext `xml:"selectionContext,omitempty" json:"selectionContext,omitempty"`
}

type Ci18n struct {
	XMLName       xml.Name `xml:"i18n,omitempty" json:"i18n,omitempty"`
	Attrnamespace string   `xml:"namespace,attr,omitempty"  json:",omitempty"`
	Attrpath      string   `xml:"path,attr,omitempty"  json:",omitempty"`
	Attrremote    string   `xml:"remote,attr,omitempty"  json:",omitempty"`
}

type Cinput_param struct {
	XMLName         xml.Name `xml:"input_param,omitempty" json:"input_param,omitempty"`
	Attrdefault     string   `xml:"default,attr,omitempty"  json:",omitempty"`
	Attrdescription string   `xml:"description,attr,omitempty"  json:",omitempty"`
	Attrmandatory   string   `xml:"mandatory,attr,omitempty"  json:",omitempty"`
	Attrname        string   `xml:"name,attr,omitempty"  json:",omitempty"`
	Attrtype        string   `xml:"type,attr,omitempty"  json:",omitempty"`
}

type CinfoPanel struct {
	XMLName            xml.Name `xml:"infoPanel,omitempty" json:"infoPanel,omitempty"`
	Attrmime           string   `xml:"mime,attr,omitempty"  json:",omitempty"`
	AttrreactComponent string   `xml:"reactComponent,attr,omitempty"  json:",omitempty"`
	Attrtheme          string   `xml:"theme,attr,omitempty"  json:",omitempty"`
	Attrweight         string   `xml:"weight,attr,omitempty"  json:",omitempty"`
}

type Cmodifier struct {
	XMLName    xml.Name `xml:"modifier,omitempty" json:"modifier,omitempty"`
	Attrmodule string   `xml:"module,attr,omitempty"  json:",omitempty"`
}

type Cjs struct {
	XMLName               xml.Name `xml:"js,omitempty" json:"js,omitempty"`
	AttrclassName         string   `xml:"className,attr,omitempty"  json:",omitempty"`
	Attrdepends           string   `xml:"depends,attr,omitempty"  json:",omitempty"`
	Attrexpose            string   `xml:"expose,attr,omitempty"  json:",omitempty"`
	AttrfallbackCondition string   `xml:"fallbackCondition,attr,omitempty"  json:",omitempty"`
	AttrfallbackFile      string   `xml:"fallbackFile,attr,omitempty"  json:",omitempty"`
	Attrfile              string   `xml:"file,attr,omitempty"  json:",omitempty"`
}

type Clabel struct {
	XMLName xml.Name `xml:"label,omitempty" json:"label,omitempty"`
	Cdata   string   `xml:",cdata" json:",omitempty"`
}

type Cmeta struct {
	Cplugin
	XMLName xml.Name `xml:"meta,omitempty" json:"meta,omitempty"`
}

type Cnode_provider struct {
	XMLName         xml.Name `xml:"node_provider,omitempty" json:"node_provider,omitempty"`
	AttrajxpClass   string   `xml:"ajxpClass,attr,omitempty"  json:",omitempty"`
	AttrajxpOptions string   `xml:"ajxpOptions,attr,omitempty"  json:",omitempty"`
}

type Coutput struct {
	XMLName  xml.Name `xml:"output,omitempty" json:"output,omitempty"`
	Attrtype string   `xml:"type,attr,omitempty"  json:",omitempty"`
}

type Cparam struct {
	Cglobal_param
	XMLName   xml.Name `xml:"param,omitempty" json:"param,omitempty"`
	Attrscope string   `xml:"scope,attr,omitempty"  json:",omitempty"`
	Attrname  string   `xml:"name,attr,omitempty"  json:",omitempty"`
	Attrvalue string   `xml:"value,attr,omitempty"  json:",omitempty"`
}

type Cplugin struct {
	XMLName                 xml.Name                 `xml:"plugin,omitempty" json:"plugin,omitempty"`
	Attrdescription         string                   `xml:"description,attr,omitempty"  json:",omitempty"`
	Attrenabled             string                   `xml:"enabled,attr,omitempty"  json:",omitempty"`
	Attrid                  string                   `xml:"id,attr,omitempty"  json:",omitempty"`
	Attrlabel               string                   `xml:"label,attr,omitempty"  json:",omitempty"`
	Attrname                string                   `xml:"name,attr,omitempty"  json:",omitempty"`
	Cclient_settings        *Cclient_settings        `xml:"client_settings,omitempty" json:"client_settings,omitempty"`
	Cplugin_configs         *Cplugin_configs         `xml:"plugin_configs,omitempty" json:"plugin_configs,omitempty"`
	Cplugin_info            *Cplugin_info            `xml:"plugin_info,omitempty" json:"plugin_info,omitempty"`
	Cserver_settings        *Cserver_settings        `xml:"server_settings,omitempty" json:"server_settings,omitempty"`
	Cregistry_contributions *Cregistry_contributions `xml:"registry_contributions,omitempty" json:"registry_contributions,omitempty"`
	Cdependencies           *Cdependencies           `xml:"dependencies,omitempty" json:"dependencies,omitempty"`
}

type Cplugin_author struct {
	XMLName xml.Name `xml:"plugin_author,omitempty" json:"plugin_author,omitempty"`
	string  string   `xml:",chardata,omitempty" json:",omitempty"`
}

type Cplugin_configs struct {
	XMLName   xml.Name     `xml:"plugin_configs,omitempty" json:"plugin_configs,omitempty"`
	Cproperty []*Cproperty `xml:"property,omitempty" json:"property,omitempty"`
}

type Cplugin_info struct {
	XMLName         xml.Name         `xml:"plugin_info,omitempty" json:"plugin_info,omitempty"`
	Ccore_relation  *Ccore_relation  `xml:"core_relation,omitempty" json:"core_relation,omitempty"`
	Cplugin_author  *Cplugin_author  `xml:"plugin_author,omitempty" json:"plugin_author,omitempty"`
	Cplugin_uri     *Cplugin_uri     `xml:"plugin_uri,omitempty" json:"plugin_uri,omitempty"`
	Cplugin_version *Cplugin_version `xml:"plugin_version,omitempty" json:"plugin_version,omitempty"`
}

type Cplugin_uri struct {
	XMLName xml.Name `xml:"plugin_uri,omitempty" json:"plugin_uri,omitempty"`
	Cdata   string   `xml:",cdata" json:",omitempty"`
}

type Cplugin_version struct {
	XMLName xml.Name `xml:"plugin_version,omitempty" json:"plugin_version,omitempty"`
	Cdata   string   `xml:",cdata" json:",omitempty"`
}

type Cplugins struct {
	XMLName      xml.Name       `xml:"plugins,omitempty" json:"plugins,omitempty"`
	AttruuidAttr string         `xml:"uuidAttr,attr,omitempty"  json:",omitempty"`
	Cplugin      []*Cplugin     `xml:"plugin,omitempty" json:"plugin,omitempty"`
	Cajxpdriver  []*Cajxpdriver `xml:"ajxpdriver,omitempty" json:"ajxpdriver,omitempty"`
	Ceditor      []*Ceditor     `xml:"editor,omitempty" json:"editor,omitempty"`
	Cmeta        []*Cmeta       `xml:"meta,omitempty" json:"meta,omitempty"`
	Cuploader    []*Cuploader   `xml:"uploader,omitempty" json:"uploader,omitempty"`
}

type Cpost_processing struct {
	XMLName xml.Name `xml:"post_processing,omitempty" json:"post_processing,omitempty"`
}

type Cpre_processing struct {
	XMLName xml.Name `xml:"pre_processing,omitempty" json:"pre_processing,omitempty"`
}

type Cpref struct {
	XMLName      xml.Name `xml:"pref,omitempty" json:"pref,omitempty"`
	Attrname     string   `xml:"name,attr,omitempty"  json:",omitempty"`
	AttrpluginId string   `xml:"pluginId,attr,omitempty"  json:",omitempty"`
	Attrvalue    string   `xml:"value,attr,omitempty"  json:",omitempty"`
	Cdata        string   `xml:",cdata" json:",omitempty"`
}

type Cpreferences struct {
	XMLName xml.Name `xml:"preferences,omitempty" json:"preferences,omitempty"`
	Cpref   []*Cpref `xml:"pref,omitempty" json:"pref,omitempty"`
}

type Cprocessing struct {
	XMLName          xml.Name          `xml:"processing,omitempty" json:"processing,omitempty"`
	CactiveCondition *CactiveCondition `xml:"activeCondition,omitempty" json:"activeCondition,omitempty"`
	CclientCallback  *CclientCallback  `xml:"clientCallback,omitempty" json:"clientCallback,omitempty"`
	CclientForm      *CclientForm      `xml:"clientForm,omitempty" json:"clientForm,omitempty"`
	CclientListener  *CclientListener  `xml:"clientListener,omitempty" json:"clientListener,omitempty"`
	CextensionOnInit *CextensionOnInit `xml:"extensionOnInit,omitempty" json:"extensionOnInit,omitempty"`
	CserverCallback  *CserverCallback  `xml:"serverCallback,omitempty" json:"serverCallback,omitempty"`
}

type Cproperty struct {
	XMLName   xml.Name `xml:"property,omitempty" json:"property,omitempty"`
	Attrname  string   `xml:"name,attr,omitempty"  json:",omitempty"`
	Attrvalue string   `xml:"value,attr,omitempty"  json:",omitempty"`
	Cdata     string   `xml:",cdata" json:",omitempty"`
}

type Cpydio_registry struct {
	XMLName         xml.Name         `xml:"pydio_registry,omitempty" json:"pydio_registry,omitempty"`
	Cactions        *Cactions        `xml:"actions,omitempty" json:"actions,omitempty"`
	Cclient_configs *Cclient_configs `xml:"client_configs,omitempty" json:"client_configs,omitempty"`
	Cextensions     *Cextensions     `xml:"extensions,omitempty" json:"extensions,omitempty"`
	Cplugins        *Cplugins        `xml:"plugins,omitempty" json:"plugins,omitempty"`
	Cuser           *Cuser           `xml:"user,omitempty" json:"user,omitempty"`
}

type Cregistry_contributions struct {
	XMLName         xml.Name         `xml:"registry_contributions,omitempty" json:"registry_contributions,omitempty"`
	Cactions        *Cactions        `xml:"actions,omitempty" json:"actions,omitempty"`
	Cclient_configs *Cclient_configs `xml:"client_configs,omitempty" json:"client_configs,omitempty"`
	Cextensions     *Cextensions     `xml:"extensions,omitempty" json:"extensions,omitempty"`
}

type Crepo struct {
	XMLName                      xml.Name          `xml:"repo,omitempty" json:"repo,omitempty"`
	Attraccess_type              string            `xml:"access_type,attr,omitempty"  json:",omitempty"`
	Attracl                      string            `xml:"acl,attr,omitempty"  json:",omitempty"`
	AttrallowCrossRepositoryCopy string            `xml:"allowCrossRepositoryCopy,attr,omitempty"  json:",omitempty"`
	Attrid                       string            `xml:"id,attr,omitempty"  json:",omitempty"`
	Attrowner                    string            `xml:"owner,attr,omitempty"  json:",omitempty"`
	AttrrepositorySlug           string            `xml:"repositorySlug,attr,omitempty"  json:",omitempty"`
	Attrrepository_type          string            `xml:"repository_type,attr,omitempty"  json:",omitempty"`
	Attruser_editable_repository string            `xml:"user_editable_repository,attr,omitempty"  json:",omitempty"`
	Cclient_settings             *Cclient_settings `xml:"client_settings,omitempty" json:"client_settings,omitempty"`
	Cdescription                 *Cdescription     `xml:"description,omitempty" json:"description,omitempty"`
	Clabel                       *Clabel           `xml:"label,omitempty" json:"label,omitempty"`
}

type Crepositories struct {
	XMLName xml.Name `xml:"repositories,omitempty" json:"repositories,omitempty"`
	Crepo   []*Crepo `xml:"repo,omitempty" json:"repo,omitempty"`
}

type Cresources struct {
	XMLName xml.Name `xml:"resources,omitempty" json:"resources,omitempty"`
	Ccss    []*Ccss  `xml:"css,omitempty" json:"css,omitempty"`
	Ci18n   []*Ci18n `xml:"i18n,omitempty" json:"i18n,omitempty"`
	Cjs     []*Cjs   `xml:"js,omitempty" json:"js,omitempty"`
}

type CrightsContext struct {
	XMLName          xml.Name `xml:"rightsContext,omitempty" json:"rightsContext,omitempty"`
	AttradminOnly    string   `xml:"adminOnly,attr,omitempty"  json:",omitempty"`
	AttrguestLogged  string   `xml:"guestLogged,attr,omitempty"  json:",omitempty"`
	AttrnoUser       string   `xml:"noUser,attr,omitempty"  json:",omitempty"`
	AttrparamDisable string   `xml:"paramDisable,attr,omitempty"  json:",omitempty"`
	Attrread         string   `xml:"read,attr,omitempty"  json:",omitempty"`
	AttruserLogged   string   `xml:"userLogged,attr,omitempty"  json:",omitempty"`
	Attrwrite        string   `xml:"write,attr,omitempty"  json:",omitempty"`
}

type CselectionContext struct {
	XMLName          xml.Name `xml:"selectionContext,omitempty" json:"selectionContext,omitempty"`
	AttrallowedMimes string   `xml:"allowedMimes,attr,omitempty"  json:",omitempty"`
	Attrbehaviour    string   `xml:"behaviour,attr,omitempty"  json:",omitempty"`
	Attrdir          string   `xml:"dir,attr,omitempty"  json:",omitempty"`
	Attreditable     string   `xml:"editable,attr,omitempty"  json:",omitempty"`
	AttrenableRoot   string   `xml:"enableRoot,attr,omitempty"  json:",omitempty"`
	AttrevalMetadata string   `xml:"evalMetadata,attr,omitempty"  json:",omitempty"`
	Attrfile         string   `xml:"file,attr,omitempty"  json:",omitempty"`
	Attrimage        string   `xml:"image,attr,omitempty"  json:",omitempty"`
	AttrmultipleOnly string   `xml:"multipleOnly,attr,omitempty"  json:",omitempty"`
	Attrrecycle      string   `xml:"recycle,attr,omitempty"  json:",omitempty"`
	Attrunique       string   `xml:"unique,attr,omitempty"  json:",omitempty"`
}

type Cserver_settings struct {
	XMLName       xml.Name         `xml:"server_settings,omitempty" json:"server_settings,omitempty"`
	Cglobal_param []*Cglobal_param `xml:"global_param,omitempty" json:"global_param,omitempty"`
	Cparam        []*Cparam        `xml:"param,omitempty" json:"param,omitempty"`
}

type CserverCallback struct {
	XMLName              xml.Name        `xml:"serverCallback,omitempty" json:"serverCallback,omitempty"`
	AttrcheckParams      string          `xml:"checkParams,attr,omitempty"  json:",omitempty"`
	AttrdeveloperComment string          `xml:"developerComment,attr,omitempty"  json:",omitempty"`
	AttrmethodName       string          `xml:"methodName,attr,omitempty"  json:",omitempty"`
	AttrpreferredHttp    string          `xml:"preferredHttp,attr,omitempty"  json:",omitempty"`
	AttrrestParams       string          `xml:"restParams,attr,omitempty"  json:",omitempty"`
	AttrsdkMethodName    string          `xml:"sdkMethodName,attr,omitempty"  json:",omitempty"`
	Cinput_param         []*Cinput_param `xml:"input_param,omitempty" json:"input_param,omitempty"`
	Coutput              *Coutput        `xml:"output,omitempty" json:"output,omitempty"`
}

type Cspecial_rights struct {
	XMLName      xml.Name `xml:"special_rights,omitempty" json:"special_rights,omitempty"`
	Attris_admin string   `xml:"is_admin,attr,omitempty"  json:",omitempty"`
	Attrlock     string   `xml:"lock,attr,omitempty"  json:",omitempty"`
}

type CsubMenu struct {
	XMLName          xml.Name         `xml:"subMenu,omitempty" json:"subMenu,omitempty"`
	AttrmasterAction string           `xml:"masterAction,attr,omitempty"  json:",omitempty"`
	CdynamicBuilder  *CdynamicBuilder `xml:"dynamicBuilder,omitempty" json:"dynamicBuilder,omitempty"`
}

type Ctemplate struct {
	XMLName       xml.Name `xml:"template,omitempty" json:"template,omitempty"`
	Attrcomponent string   `xml:"component,attr,omitempty"  json:",omitempty"`
	Attrelement   string   `xml:"element,attr,omitempty"  json:",omitempty"`
	Attrlabel     string   `xml:"label,attr,omitempty"  json:",omitempty"`
	Attrname      string   `xml:"name,attr,omitempty"  json:",omitempty"`
	Attrnamespace string   `xml:"namespace,attr,omitempty"  json:",omitempty"`
	Attrposition  string   `xml:"position,attr,omitempty"  json:",omitempty"`
	Attrprops     string   `xml:"props,attr,omitempty"  json:",omitempty"`
	Attrtheme     string   `xml:"theme,attr,omitempty"  json:",omitempty"`
}

type Ctemplate_part struct {
	XMLName          xml.Name `xml:"template_part,omitempty" json:"template_part,omitempty"`
	AttrajxpId       string   `xml:"ajxpId,attr,omitempty"  json:",omitempty"`
	AttrajxpClass    string   `xml:"ajxpClass,attr,omitempty"  json:",omitempty"`
	AttrajxpOptions  string   `xml:"ajxpOptions,attr,omitempty"  json:",omitempty"`
	Attrcomponent    string   `xml:"component,attr,omitempty"  json:",omitempty"`
	Attrdependencies string   `xml:"dependencies,attr,omitempty"  json:",omitempty"`
	Attrname         string   `xml:"name,attr,omitempty"  json:",omitempty"`
	Attrnamespace    string   `xml:"namespace,attr,omitempty"  json:",omitempty"`
	Attrprops        string   `xml:"props,attr,omitempty"  json:",omitempty"`
	Attrtheme        string   `xml:"theme,attr,omitempty"  json:",omitempty"`
}

type Cuploader struct {
	Cplugin
	XMLName       xml.Name       `xml:"uploader,omitempty" json:"uploader,omitempty"`
	AttrclassName string         `xml:"className,attr,omitempty"  json:",omitempty"`
	Attrorder     string         `xml:"order,attr,omitempty"  json:",omitempty"`
	Attrtext      string         `xml:"text,attr,omitempty"  json:",omitempty"`
	Attrtitle     string         `xml:"title,attr,omitempty"  json:",omitempty"`
	Cprocessing   []*Cprocessing `xml:"processing,omitempty" json:"processing,omitempty"`
}

type Cuser struct {
	XMLName         xml.Name         `xml:"user,omitempty" json:"user,omitempty"`
	Attrid          string           `xml:"id,attr,omitempty"  json:",omitempty"`
	Cactive_repo    *Cactive_repo    `xml:"active_repo,omitempty" json:"active_repo,omitempty"`
	Cpreferences    *Cpreferences    `xml:"preferences,omitempty" json:"preferences,omitempty"`
	Crepositories   *Crepositories   `xml:"repositories,omitempty" json:"repositories,omitempty"`
	Cspecial_rights *Cspecial_rights `xml:"special_rights,omitempty" json:"special_rights,omitempty"`
}

type Cajxpcore struct {
	XMLName          xml.Name          `xml:"ajxpcore,omitempty" json:"ajxpcore,omitempty"`
	Attrdescription  string            `xml:"description,attr,omitempty"  json:",omitempty"`
	Attrid           string            `xml:"id,attr,omitempty"  json:",omitempty"`
	Attrlabel        string            `xml:"label,attr,omitempty"  json:",omitempty"`
	Cclient_settings *Cclient_settings `xml:"client_settings,omitempty" json:"client_settings,omitempty"`
	Cserver_settings *Cserver_settings `xml:"server_settings,omitempty" json:"server_settings,omitempty"`
	Cplugin_configs  *Cplugin_configs  `xml:"plugin_configs,omitempty" json:"plugin_configs,omitempty"`
}

type Cadmin_data struct {
	XMLName                 xml.Name                 `xml:"admin_data,omitempty" json:"admin_data,omitempty"`
	Cajxpcore               *Cajxpcore               `xml:"ajxpcore,omitempty" json:"ajxpcore,omitempty"`
	Cplugin_settings_values *Cplugin_settings_values `xml:"plugin_settings_values,omitempty" json:"plugin_settings_values,omitempty"`
}

type Cplugin_settings_values struct {
	XMLName xml.Name  `xml:"plugin_settings_values,omitempty" json:"admin_data,omitempty"`
	Cparam  []*Cparam `xml:"param,omitempty" json:"param,omitempty"`
}

type ExposedParam struct {
	Cparam
	PluginId string
}

func (c *Cactions) MergeActions(actions []*Caction) {
	for _, a := range actions {
		replace := false
		for i, b := range c.Caction {
			if b.Attrname == a.Attrname {
				c.Caction[i] = a
				replace = true
				break
			}
		}
		if !replace {
			c.Caction = append(c.Caction, a)
		}
	}
}
