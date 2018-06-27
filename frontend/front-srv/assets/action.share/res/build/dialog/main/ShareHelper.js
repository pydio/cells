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
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydioUtilXml = require('pydio/util/xml');

var _pydioUtilXml2 = _interopRequireDefault(_pydioUtilXml);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var ShareHelper = (function () {
    function ShareHelper() {
        _classCallCheck(this, ShareHelper);
    }

    _createClass(ShareHelper, null, [{
        key: 'getAuthorizations',
        value: function getAuthorizations(pydio) {

            var pluginConfigs = pydio.getPluginConfigs("action.share");
            var authorizations = {
                folder_public_link: pluginConfigs.get("ENABLE_FOLDER_PUBLIC_LINK"),
                folder_workspaces: pluginConfigs.get("ENABLE_FOLDER_INTERNAL_SHARING"),
                file_public_link: pluginConfigs.get("ENABLE_FILE_PUBLIC_LINK"),
                file_workspaces: pluginConfigs.get("ENABLE_FILE_INTERNAL_SHARING"),
                editable_hash: pluginConfigs.get("HASH_USER_EDITABLE"),
                password_mandatory: false,
                max_expiration: pluginConfigs.get("FILE_MAX_EXPIRATION"),
                max_downloads: pluginConfigs.get("FILE_MAX_DOWNLOAD")
            };
            var passMandatory = pluginConfigs.get("SHARE_FORCE_PASSWORD");
            if (passMandatory) {
                authorizations.password_mandatory = true;
            }
            authorizations.password_placeholder = passMandatory ? pydio.MessageHash['share_center.176'] : pydio.MessageHash['share_center.148'];
            return authorizations;
        }
    }, {
        key: 'buildPublicUrl',
        value: function buildPublicUrl(pydio, linkHash) {
            var shortForm = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

            var pluginConfigs = pydio.Parameters;
            if (shortForm) {
                return '...' + pluginConfigs.get('PUBLIC_BASEURI') + '/' + linkHash;
            } else {
                return pluginConfigs.get('FRONTEND_URL') + pluginConfigs.get('PUBLIC_BASEURI') + '/' + linkHash;
            }
        }
    }, {
        key: 'compileLayoutData',
        value: function compileLayoutData(pydio, node) {

            // Search registry for template nodes starting with minisite_
            var tmpl = undefined,
                currentExt = undefined;
            if (node.isLeaf()) {
                currentExt = node.getAjxpMime();
                tmpl = _pydioUtilXml2['default'].XPathSelectNodes(pydio.getXmlRegistry(), "//template[contains(@name, 'unique_preview_')]");
            } else {
                tmpl = _pydioUtilXml2['default'].XPathSelectNodes(pydio.getXmlRegistry(), "//template[contains(@name, 'minisite_')]");
            }

            if (!tmpl.length) {
                return [];
            }
            if (tmpl.length === 1) {
                return [{ LAYOUT_NAME: tmpl[0].getAttribute('element'), LAYOUT_LABEL: '' }];
            }
            var crtTheme = pydio.Parameters.get('theme');
            var values = [];
            var noEditorsFound = false;
            tmpl.map(function (node) {
                var theme = node.getAttribute('theme');
                if (theme && theme !== crtTheme) {
                    return;
                }
                var element = node.getAttribute('element');
                var name = node.getAttribute('name');
                var label = node.getAttribute('label');
                if (currentExt && name === "unique_preview_file") {
                    var editors = pydio.Registry.findEditorsForMime(currentExt);
                    if (!editors.length || editors.length === 1 && editors[0].editorClass === "OtherEditorChooser") {
                        noEditorsFound = true;
                        return;
                    }
                }
                if (label) {
                    if (MessageHash[label]) {
                        label = MessageHash[label];
                    }
                } else {
                    label = node.getAttribute('name');
                }
                values[name] = element;
                values.push({ LAYOUT_NAME: name, LAYOUT_ELEMENT: element, LAYOUT_LABEL: label });
            });
            return values;
        }
    }, {
        key: 'forceMailerOldSchool',
        value: function forceMailerOldSchool() {
            return global.pydio.getPluginConfigs("action.share").get("EMAIL_INVITE_EXTERNAL");
        }
    }, {
        key: 'qrcodeEnabled',
        value: function qrcodeEnabled() {
            return global.pydio.getPluginConfigs("action.share").get("CREATE_QRCODE");
        }

        /**
         *
         * @param node
         * @param cellModel
         * @param targetUsers
         * @param callback
         */
    }, {
        key: 'sendCellInvitation',
        value: function sendCellInvitation(node, cellModel, targetUsers) {
            var callback = arguments.length <= 3 || arguments[3] === undefined ? function () {} : arguments[3];

            var _ShareHelper$prepareEmail = ShareHelper.prepareEmail(node, null, cellModel);

            var templateId = _ShareHelper$prepareEmail.templateId;
            var templateData = _ShareHelper$prepareEmail.templateData;

            var users = Object.keys(targetUsers).map(function (k) {
                var u = targetUsers[k];
                return u.IdmUser ? u.IdmUser.Login : u.id;
            });
            var params = {
                get_action: 'send_mail',
                'emails[]': users,
                template_id: templateId,
                template_data: JSON.stringify(templateData)
            };
            var client = _pydioHttpApi2['default'].getClient();
            client.request(params, function (transport) {
                var res = client.parseXmlMessage(transport.responseXML);
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
    }, {
        key: 'prepareEmail',
        value: function prepareEmail(node) {
            var linkModel = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
            var cellModel = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

            var templateData = {};
            var templateId = "";
            var message = "";
            var user = pydio.user;
            if (user.getPreference("displayName")) {
                templateData["Inviter"] = user.getPreference("displayName");
            } else {
                templateData["Inviter"] = user.id;
            }
            if (linkModel) {
                var linkObject = linkModel.getLink();
                if (node.isLeaf()) {
                    templateId = "PublicFile";
                    templateData["FileName"] = node.getLabel();
                } else {
                    templateId = "PublicFolder";
                    templateData["FolderName"] = node.getLabel();
                }
                templateData["LinkPath"] = "/public/" + linkObject.LinkHash;
                if (linkObject.MaxDownloads) {
                    templateData["MaxDownloads"] = linkObject.MaxDownloads + "";
                }
                if (linkObject.AccessEnd) {
                    templateData["Expire"] = linkObject.AccessEnd;
                }
            } else {
                templateId = "Cell";
                templateData["Cell"] = cellModel.getLabel();
            }

            return {
                templateId: templateId, templateData: templateData, message: message, linkModel: linkModel
            };
        }

        // Check if there are available editors for node with Write ability
    }, {
        key: 'fileHasWriteableEditors',
        value: function fileHasWriteableEditors(pydio, node) {
            var previewEditors = pydio.Registry.findEditorsForMime(node.getAjxpMime()).filter(function (entry) {
                return !(entry.editorClass === "OtherEditorChooser" || entry.editorClass === "BrowserOpener");
            });
            return previewEditors.filter(function (entry) {
                return entry.canWrite;
            }).length > 0;
        }
    }]);

    return ShareHelper;
})();

exports['default'] = ShareHelper;
module.exports = exports['default'];
