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
import Pydio from 'pydio'
import {MailerServiceApi, MailerMail, MailerUser} from 'cells-sdk'
const {moment} = Pydio.requireLib('boot');

class ShareHelper {

    static mailerSupported(pydio) {
        return pydio.Parameters.get('validMailer');
    }

    static getAuthorizations(){
        const pydio = Pydio.getInstance()
        const pluginConfigs = pydio.getPluginConfigs("action.share");
        let authorizations = {
            folder_public_link : pluginConfigs.get("ENABLE_FOLDER_PUBLIC_LINK"),
            folder_workspaces :  pluginConfigs.get("ENABLE_FOLDER_INTERNAL_SHARING"),
            file_public_link : pluginConfigs.get("ENABLE_FILE_PUBLIC_LINK"),
            file_workspaces : pluginConfigs.get("ENABLE_FILE_INTERNAL_SHARING"),
            editable_hash : pluginConfigs.get("HASH_USER_EDITABLE"),
            hash_min_length : pluginConfigs.get("HASH_MIN_LENGTH") || 6,
            password_mandatory: false,
            max_expiration : pluginConfigs.get("FILE_MAX_EXPIRATION"),
            max_downloads : pluginConfigs.get("FILE_MAX_DOWNLOAD"),
            cells_max_expiration : pluginConfigs.get("CELLS_MAX_EXPIRATION")
        };
        const passMandatory = pluginConfigs.get("SHARE_FORCE_PASSWORD");
        if(passMandatory){
            authorizations.password_mandatory = true;
        }
        authorizations.password_placeholder = passMandatory ? pydio.MessageHash['share_center.176'] : pydio.MessageHash['share_center.148'];
        return authorizations;
    }

    static buildPublicUrl(pydio, link, shortForm = false){
        const params = pydio.Parameters;
        if(shortForm) {
            return '...' + params.get('PUBLIC_BASEURI') + '/' + link.LinkHash;
        } else {
            if (link.LinkUrl && link.LinkUrl.match(new RegExp('^http:\/\/|^https:\/\/'))) {
                return link.LinkUrl;
            }
            const url = pydio.getFrontendUrl();
            return `${url.protocol}//${url.host}` + params.get('PUBLIC_BASEURI') + '/' + link.LinkHash;
        }
    }

    /**
     * @param pydio {Pydio}
     * @param node {AjxpNode}
     * @return {{preview: boolean, writeable: boolean}}
     */
    static nodeHasEditor(pydio, node) {
        if(!node.getMetadata().has('mime_has_preview_editor')) {
            let editors = pydio.Registry.findEditorsForMime(node.getAjxpMime());
            editors = editors.filter(e => {
                return e.id !== 'editor.browser' && e.id !== 'editor.other'
            });
            const writeable = editors.filter(e => e.canWrite);
            node.getMetadata().set("mime_has_preview_editor", editors.length > 0);
            node.getMetadata().set("mime_has_writeable_editor", writeable.length > 0);
        }
        return {
            preview: node.getMetadata().get("mime_has_preview_editor"),
            writeable: node.getMetadata().get("mime_has_writeable_editor"),
        };
    }

    /**
     *
     * @param pydio {Pydio}
     * @param linkModel {CompositeModel}
     * @return {*}
     */
    static compileLayoutData(pydio, linkModel){

        // Search registry for template nodes starting with minisite_
        let tmpl, currentExt;
        const node = linkModel.getNode();
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
        tmpl.map(function(xmlNode){
            const theme = xmlNode.getAttribute('theme');
            if(theme && theme !== crtTheme) {
                return;
            }
            const element = xmlNode.getAttribute('element');
            const name = xmlNode.getAttribute('name');
            let label = xmlNode.getAttribute('label');
            if(currentExt && name === "unique_preview_file" && !ShareHelper.nodeHasEditor(pydio, node).preview){
                // Ignore this template
                return
            }
            if(label) {
                if(MessageHash[label]) {
                    label = MessageHash[label];
                }
            }else{
                label = xmlNode.getAttribute('name');
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
        const mail = new MailerMail();
        const api = new MailerServiceApi(PydioApi.getRestClient());
        mail.To = [];
        let ignored = 0;
        Object.keys(targetUsers).map(k => {
            const u = targetUsers[k];
            const to = new MailerUser();
            if(u.IdmUser && u.IdmUser.Login && u.IdmUser.Attributes && (u.IdmUser.Attributes['hasEmail'] || u.IdmUser.Attributes['email'])){
                to.Uuid = u.IdmUser.Login;
                mail.To.push(to);
            } else {
               ignored++
            }
            return to;
        });
        const messages = Pydio.getInstance().MessageHash;
        if(mail.To.length){
            mail.TemplateId = templateId;
            mail.TemplateData = templateData;
            api.send(mail).then(() => {
                callback();
            });
            let msg = messages['core.mailer.1'].replace('%s', mail.To.length);
            if (ignored > 0) {
                msg += ' ' + messages['core.mailer.entries.ignored'];
            }
            Pydio.getInstance().UI.displayMessage('SUCCESS', msg)
        } else {
            Pydio.getInstance().UI.displayMessage('ERROR', messages['core.mailer.entries.ignored']);
        }
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
                templateData["FileName"] = linkObject.Label || node.getLabel();
            } else {
                templateId = "PublicFolder";
                templateData["FolderName"] = linkObject.Label || node.getLabel();
            }
            templateData["LinkPath"] = "/public/" + linkObject.LinkHash;
            if(linkObject.MaxDownloads){
                templateData["MaxDownloads"] = linkObject.MaxDownloads + "";
            }
            if(linkObject.AccessEnd){
                const m = moment(new Date(linkObject.AccessEnd * 1000));
                templateData["Expire"] = m.format('LL');
            }
        } else {
            templateId = "Cell";
            templateData["Cell"] = cellModel.getLabel();
        }

        return {
            templateId, templateData, message, linkModel
        };
    }

}

export {ShareHelper as default}