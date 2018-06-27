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

"use strict";

(function (global) {

    var Panel = React.createClass({
        displayName: "Panel",

        componentDidMount: function componentDidMount() {
            this.loadKeys();
        },

        getInitialState: function getInitialState() {
            return { loaded: false, keys: {} };
        },

        generateAllowed: function generateAllowed() {
            return this.props.pydio.getPluginConfigs("authfront.keystore").get("USER_GENERATE_KEYS");
        },

        loadKeys: function loadKeys() {
            this.setState({ loaded: false });
            PydioApi.getClient().request({
                get_action: 'keystore_list_tokens'
            }, (function (transport) {
                if (transport.responseJSON) {
                    this.setState({ keys: transport.responseJSON });
                }
                this.setState({ loaded: true });
            }).bind(this));
        },

        removeKey: function removeKey(k) {
            var _this = this;

            if (!window.confirm(MessageHash['keystore.7'])) {
                return;
            }
            var params = { get_action: 'keystore_revoke_tokens' };
            if (k) {
                params['key_id'] = k;
            }
            PydioApi.getClient().request(params, function () {
                _this.loadKeys();
            });
        },

        generateKey: function generateKey() {

            if (!this.generateAllowed()) return;

            PydioApi.getClient().request({
                get_action: "keystore_generate_auth_token"
            }, (function (transport) {
                var data = transport.responseJSON;
                this.setState({
                    newKey: data //'Token : ' + data['t'] + '<br> Private : ' + data['p']
                });
                this.loadKeys();
            }).bind(this));
        },

        render: function render() {
            var _this2 = this;

            var keys = [];

            var _loop = function (k) {
                if (!_this2.state.keys.hasOwnProperty(k)) return "continue";
                var item = _this2.state.keys[k];
                var remove = (function () {
                    this.removeKey(k);
                }).bind(_this2);
                var deviceId = item['DEVICE_ID'] || '';
                deviceId = deviceId.substring(0, 13) + (deviceId.length > 13 ? '...' : '');
                var primaryText = item.DEVICE_DESC + (item.DEVICE_OS !== item.DEVICE_DESC ? ' - ' + item.DEVICE_OS : '');
                var secondaryText = 'From: ' + (item.DEVICE_IP === '::1' ? 'Local' : item.DEVICE_IP) + (deviceId ? ' - Id: ' + deviceId : '');
                var leftIcon = React.createElement(MaterialUI.FontIcon, { className: "mdi mdi-responsive", style: { color: _this2.props.muiTheme.palette.primary1Color } });
                var rightIcon = React.createElement(MaterialUI.IconButton, { iconClassName: "mdi mdi-key-minus", onTouchTap: remove, iconStyle: { color: 'rgba(0,0,0,0.53)' } });
                keys.push(React.createElement(MaterialUI.ListItem, {
                    key: k,
                    primaryText: primaryText,
                    secondaryText: secondaryText,
                    disabled: true,
                    leftIcon: leftIcon,
                    rightIconButton: rightIcon
                }));
            };

            for (var k in this.state.keys) {
                var _ret = _loop(k);

                if (_ret === "continue") continue;
            }
            var mess = this.props.pydio.MessageHash;
            var tokenResult = undefined;
            if (this.state.newKey) {
                var getMessage = function getMessage(id) {
                    return mess[id];
                };
                tokenResult = React.createElement(
                    "div",
                    { id: "token_results", style: { backgroundColor: '#FFFDE7', padding: '8px 16px' } },
                    React.createElement(
                        "div",
                        { id: "token_results_content" },
                        React.createElement(PydioComponents.ClipboardTextField, { floatingLabelText: "Key", inputValue: this.state.newKey.t, getMessage: getMessage }),
                        React.createElement(PydioComponents.ClipboardTextField, { floatingLabelText: "Secret", inputValue: this.state.newKey.p, getMessage: getMessage })
                    ),
                    React.createElement(
                        "div",
                        { style: { textAlign: 'right' } },
                        React.createElement(MaterialUI.RaisedButton, { label: "OK", onTouchTap: function () {
                                _this2.setState({ newKey: null });
                            } })
                    )
                );
            }
            var list = this.state.loaded ? React.createElement(
                MaterialUI.List,
                null,
                keys
            ) : React.createElement(PydioReactUI.Loader, null);
            return React.createElement(
                "div",
                null,
                React.createElement(
                    MaterialUI.Toolbar,
                    null,
                    React.createElement(
                        "div",
                        { style: { color: 'white', padding: '18px 0px', marginLeft: -10, fontWeight: 500 } },
                        mess['keystore.9']
                    ),
                    React.createElement("div", { style: { flex: 1 } }),
                    React.createElement(
                        MaterialUI.ToolbarGroup,
                        { lastChild: true },
                        this.generateAllowed() && React.createElement(MaterialUI.IconButton, { tooltip: mess['keystore.3'], tooltipPosition: "bottom-left", iconClassName: "mdi mdi-key-plus", onTouchTap: this.generateKey, iconStyle: { color: 'white' } }),
                        React.createElement(MaterialUI.IconButton, { tooltip: mess['keystore.5'], tooltipPosition: "bottom-left", iconClassName: "mdi mdi-key-remove", onTouchTap: function () {
                                _this2.removeKey();
                            }, iconStyle: { color: 'white' } })
                    )
                ),
                tokenResult,
                list
            );
        }

    });

    global.ApiKeys = {
        Panel: MaterialUI.Style.muiThemeable()(Panel)
    };
})(window);
