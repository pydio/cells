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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (global) {

    var pydio = global.pydio;

    var Callbacks = (function () {
        function Callbacks() {
            _classCallCheck(this, Callbacks);
        }

        _createClass(Callbacks, null, [{
            key: 'duoPrompt',
            value: function duoPrompt() {
                pydio.UI.openComponentInModal('DuoSecurityActions', 'Dialog');
            }
        }]);

        return Callbacks;
    })();

    var DuoSecDialog = React.createClass({
        displayName: 'DuoSecDialog',

        mixins: [PydioReactUI.ActionDialogMixin],

        getDefaultProps: function getDefaultProps() {
            return {
                dialogTitle: "Duo Security Configuration",
                dialogIsModal: true
            };
        },

        componentDidMount: function componentDidMount() {
            var _props = this.props;
            var pydio = _props.pydio;
            var onDismiss = _props.onDismiss;
            var _global$PydioCore = global.PydioCore;
            var XMLUtils = _global$PydioCore.XMLUtils;
            var PydioApi = _global$PydioCore.PydioApi;

            var oForm = this.refs.form;

            Duo.init({
                host: pydio.getPluginConfigs('authfront.duosecurity').get('DUO_AUTH_HOST'),
                sig_request: pydio.getPluginConfigs('authfront.duosecurity').get('DUO_AUTH_LAST_SIGNATURE'),
                post_action: '',
                submit_callback: function submit_callback(oForm) {
                    var value = oForm.elements['sig_response'].value;
                    PydioApi.getClient().request({
                        sig_response: value,
                        get_action: 'duo_post_verification_code'
                    }, function () {
                        global.setTimeout(function () {
                            pydio.loadXmlRegistry();
                        }, 400);
                    });
                    onDismiss();
                }
            });
        },

        shouldComponentUpdate: function shouldComponentUpdate() {
            return false;
        },

        render: function render() {
            return React.createElement(
                'div',
                null,
                React.createElement('iframe', { id: 'duo_iframe', width: 370, height: 330, frameBorder: 0 })
            );
        }

    });

    global.DuoSecurityActions = {
        Callbacks: Callbacks,
        Dialog: DuoSecDialog
    };
})(window);
