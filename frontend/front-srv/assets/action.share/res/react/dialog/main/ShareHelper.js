/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */
import XMLUtils from 'pydio/util/xml'
import PydioApi from 'pydio/http/api'

class ShareHelper {


    static getAuthorizations(pydio){

        const pluginConfigs = pydio.getPluginConfigs("action.share");
        let authorizations = {
            folder_public_link : pluginConfigs.get("ENABLE_FOLDER_PUBLIC_LINK"),
            folder_workspaces :  pluginConfigs.get("ENABLE_FOLDER_INTERNAL_SHARING"),
            file_public_link : pluginConfigs.get("ENABLE_FILE_PUBLIC_LINK"),
            file_workspaces : pluginConfigs.get("ENABLE_FILE_INTERNAL_SHARING"),
            editable_hash : pluginConfigs.get("HASH_USER_EDITABLE"),
            password_mandatory: false,
            max_expiration : pluginConfigs.get("FILE_MAX_EXPIRATION"),
            max_downloads : pluginConfigs.get("FILE_MAX_DOWNLOAD")
        };
        const passMandatory = pluginConfigs.get("SHARE_FORCE_PASSWORD");
        if(passMandatory){
            authorizations.password_mandatory = true;
        }
        authorizations.password_placeholder = passMandatory ? pydio.MessageHash['share_center.176'] : pydio.MessageHash['share_center.148'];
        return authorizations;
    }

    static buildPublicUrl(pydio, linkHash, shortForm = false){
        const pluginConfigs = pydio.Parameters;
        if(shortForm) {
            return '...' + pluginConfigs.get('PUBLIC_BASEURI') + '/' + linkHash;
        } else {
            return pluginConfigs.get('FRONTEND_URL') + pluginConfigs.get('PUBLIC_BASEURI') + '/' + linkHash;
        }
    }


    static compileLayoutData(pydio, node){

        // Search registry for template nodes starting with minisite_
        let tmpl, currentExt;
        if(node.isLeaf()){
            currentExt = node.getAjxpMime();
            tmpl = XMLUtils.XPathSelectNodes(pydio.getXmlRegistry(), "//template[contains(@name, 'unique_preview_')]");
        }else{
            tmpl = XMLUtils.XPathSelectNodes(pydio.getXmlRegistry(), "//template[contains(@name, 'minisite_')]");
        }

        if(!tmpl.length){
            return [];
        }
        if(tmpl.length === 1){
            return [{LAYOUT_NAME:tmpl[0].getAttribute('element'), LAYOUT_LABEL:''}];
        }
        const crtTheme = pydio.Parameters.get('theme');
        let values = [];
        let noEditorsFound = false;
        tmpl.map(function(node){
            const theme = node.getAttribute('theme');
            if(theme && theme !== crtTheme) {
                return;
            }
            const element = node.getAttribute('element');
            const name = node.getAttribute('name');
            let label = node.getAttribute('label');
            if(currentExt && name === "unique_preview_file"){
                const editors = pydio.Registry.findEditorsForMime(currentExt);
                if(!editors.length || (editors.length === 1 && editors[0].editorClass === "OtherEditorChooser")) {
                    noEditorsFound = true;
                    return;
                }
            }
            if(label) {
                if(MessageHash[label]) {
                    label = MessageHash[label];
                }
            }else{
                label = node.getAttribute('name');
            }
            values[name] = element;
            values.push({LAYOUT_NAME:name, LAYOUT_ELEMENT:element, LAYOUT_LABEL: label});
        });
        return values;

    }

    static forceMailerOldSchool(){
        return global.pydio.getPluginConfigs("action.share").get("EMAIL_INVITE_EXTERNAL");
    }

    static qrcodeEnabled(){
        return global.pydio.getPluginConfigs("action.share").get("CREATE_QRCODE");
    }

    /**
     *
     * @param node
     * @param cellModel
     * @param targetUsers
     * @param callback
     */
    static sendCellInvitation(node, cellModel, targetUsers, callback = ()=>{} ){
        const {templateId, templateData} = ShareHelper.prepareEmail(node, null, cellModel);
        let users = Object.keys(targetUsers).map(k => {
            const u = targetUsers[k];
            return u.IdmUser ? u.IdmUser.Login : u.id
        });
        const params = {
            get_action:'send_mail',
            'emails[]' : users,
            template_id: templateId,
            template_data: JSON.stringify(templateData)
        };
        const client = PydioApi.getClient();
        client.request(params, (transport) => {
            const res = client.parseXmlMessage(transport.responseXML);
            callback(res);
        });
    }

    /**
     *
     * @param node {Node}
     * @param linkModel {LinkModel}
     * @param cellModel {CellModel}
     * @return {{templateId: string, templateData: {}, message: string, linkModel: *}}
     */
    static prepareEmail(node, linkModel = null, cellModel = null){

        let templateData = {};
        let templateId = "";
        let message = "";
        const user = pydio.user;
        if(user.getPreference("displayName")){
            templateData["Inviter"] = user.getPreference("displayName");
        } else {
            templateData["Inviter"] = user.id;
        }
        if(linkModel){
            const linkObject = linkModel.getLink();
            if(node.isLeaf()){
                templateId = "PublicFile";
                templateData["FileName"] = node.getLabel();
            } else {
                templateId = "PublicFolder";
                templateData["FolderName"] = node.getLabel();
            }
            templateData["LinkPath"] = "/public/" + linkObject.LinkHash;
            if(linkObject.MaxDownloads){
                templateData["MaxDownloads"] = linkObject.MaxDownloads + "";
            }
            if(linkObject.AccessEnd){
                templateData["Expire"] = linkObject.AccessEnd;
            }
        } else {
            templateId = "Cell";
            templateData["Cell"] = cellModel.getLabel();
        }

        return {
            templateId, templateData, message, linkModel
        };
    }

    // Check if there are available editors for node with Write ability
    static fileHasWriteableEditors(pydio, node) {
        const previewEditors = pydio.Registry.findEditorsForMime(node.getAjxpMime()).filter(function(entry){
            return !(entry.editorClass === "OtherEditorChooser" || entry.editorClass === "BrowserOpener");
        });
        return previewEditors.filter(function(entry){
            return (entry.canWrite);
        }).length > 0;
    }


}

export {ShareHelper as default}