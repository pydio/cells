(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.UserAccount = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
var ResourcesManager = require('pydio/http/resources-manager');

exports['default'] = function (pydio) {

    return {

        openDashboard: function openDashboard() {
            ResourcesManager.loadClassesAndApply(['PydioForm'], function () {
                pydio.UI.openComponentInModal('UserAccount', 'ModalDashboard');
            });
        },

        openAddressBook: function openAddressBook() {
            ResourcesManager.loadClassesAndApply(['PydioForm', 'PydioComponents'], function () {
                pydio.UI.openComponentInModal('UserAccount', 'ModalAddressBook');
            });
        }

    };
};

module.exports = exports['default'];

},{"pydio/http/resources-manager":"pydio/http/resources-manager"}],2:[function(require,module,exports){
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
var XMLUtils = require('pydio/util/xml');

exports['default'] = {

    getAccountTabs: function getAccountTabs(pydio) {

        return XMLUtils.XPathSelectNodes(pydio.getXmlRegistry(), 'client_configs/component_config[@component="UserAccountTabs"]/additional_tab').map(function (node) {
            return {
                id: node.getAttribute("id"),
                tabInfo: JSON.parse(node.getAttribute('tabInfo')),
                paneInfo: JSON.parse(node.getAttribute('paneInfo'))
            };
        });
    }

};
module.exports = exports['default'];

},{"pydio/util/xml":"pydio/util/xml"}],3:[function(require,module,exports){
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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('react');

var Component = _require.Component;
var PropTypes = _require.PropTypes;

var _require2 = require('material-ui');

var Toggle = _require2.Toggle;
var Subheader = _require2.Subheader;
var MenuItem = _require2.MenuItem;
var SelectField = _require2.SelectField;
var TextField = _require2.TextField;
var TimePicker = _require2.TimePicker;

var EmailPanel = (function (_Component) {
    _inherits(EmailPanel, _Component);

    function EmailPanel() {
        _classCallCheck(this, EmailPanel);

        _get(Object.getPrototypeOf(EmailPanel.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(EmailPanel, [{
        key: 'onChange',
        value: function onChange(partialValues) {
            var _props = this.props;
            var values = _props.values;
            var onChange = _props.onChange;

            onChange(_extends({}, values, partialValues), true);
        }
    }, {
        key: 'onFrequencyChange',
        value: function onFrequencyChange(value) {
            var partial = { NOTIFICATIONS_EMAIL_FREQUENCY: value };
            var newUserValue = undefined;
            switch (value) {
                case 'M':
                    newUserValue = '5';
                    break;
                case 'H':
                    newUserValue = '2';
                    break;
                case 'D1':
                    newUserValue = '03';
                    break;
                case 'D2':
                    newUserValue = '09,14';
                    break;
                case 'W1':
                    newUserValue = 'Monday';
                    break;
            }
            partial.NOTIFICATIONS_EMAIL_FREQUENCY_USER = newUserValue;
            this.onChange(partial);
        }
    }, {
        key: 'onPickDate',
        value: function onPickDate(position, event, date) {
            var NOTIFICATIONS_EMAIL_FREQUENCY_USER = this.props.values.NOTIFICATIONS_EMAIL_FREQUENCY_USER;

            var hours = NOTIFICATIONS_EMAIL_FREQUENCY_USER.split(',');
            var newHours = [];
            if (position === 'first') newHours = [date.getHours(), hours[1] ? hours[1] : '00'];
            if (position === 'last') newHours = [hours[0] ? hours[0] : '00', date.getHours()];
            this.onChange({ NOTIFICATIONS_EMAIL_FREQUENCY_USER: newHours.join(',') });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props2 = this.props;
            var definitions = _props2.definitions;
            var values = _props2.values;
            var pydio = _props2.pydio;

            var message = function message(id) {
                return pydio.MessageHash['user_dash.' + id];
            };
            var NOTIFICATIONS_EMAIL_GET = values.NOTIFICATIONS_EMAIL_GET;
            var NOTIFICATIONS_EMAIL_FREQUENCY = values.NOTIFICATIONS_EMAIL_FREQUENCY;
            var NOTIFICATIONS_EMAIL_FREQUENCY_USER = values.NOTIFICATIONS_EMAIL_FREQUENCY_USER;
            var NOTIFICATIONS_EMAIL = values.NOTIFICATIONS_EMAIL;
            var NOTIFICATIONS_EMAIL_SEND_HTML = values.NOTIFICATIONS_EMAIL_SEND_HTML;

            var mailActive = NOTIFICATIONS_EMAIL_GET === 'true';
            var frequencyTypes = new Map();
            var frequencyMenus = [];
            definitions[1]['choices'].split(',').map(function (e) {
                var d = e.split('|');
                frequencyTypes.set(d[0], d[1]);
                frequencyMenus.push(React.createElement(MenuItem, { primaryText: d[1], value: d[0] }));
            });
            var userFrequencyComponent = undefined;
            if (mailActive) {
                switch (NOTIFICATIONS_EMAIL_FREQUENCY) {
                    case 'M':
                    case 'H':
                        userFrequencyComponent = React.createElement(TextField, {
                            fullWidth: true,
                            floatingLabelText: NOTIFICATIONS_EMAIL_FREQUENCY === 'M' ? message(62) : message(63),
                            value: NOTIFICATIONS_EMAIL_FREQUENCY_USER,
                            onChange: function (e, v) {
                                _this.onChange({ NOTIFICATIONS_EMAIL_FREQUENCY_USER: v });
                            }
                        });
                        break;
                    case 'D1':
                        var d = new Date();
                        d.setHours(NOTIFICATIONS_EMAIL_FREQUENCY_USER);d.setMinutes(0);
                        userFrequencyComponent = React.createElement(TimePicker, {
                            format: 'ampm',
                            hintText: message(64),
                            value: d,
                            onChange: function (e, date) {
                                _this.onChange({ NOTIFICATIONS_EMAIL_FREQUENCY_USER: date.getHours() });
                            },
                            autoOk: true,
                            textFieldStyle: { width: '100%' }
                        });
                        break;
                    case 'D2':
                        var hours = NOTIFICATIONS_EMAIL_FREQUENCY_USER + '';
                        if (!hours) hours = '09,14';
                        hours = hours.split(',');
                        var d1 = new Date();
                        var d2 = new Date();d2.setMinutes(0);
                        d1.setHours(hours[0]);d1.setMinutes(0);
                        if (hours[1]) {
                            d2.setHours(hours[1]);
                        }
                        userFrequencyComponent = React.createElement(
                            'div',
                            { style: { display: 'flex' } },
                            React.createElement(TimePicker, {
                                format: 'ampm',
                                hintText: message(65),
                                value: d1,
                                onChange: this.onPickDate.bind(this, 'first'),
                                textFieldStyle: { width: 100, marginRight: 5 }
                            }),
                            React.createElement(TimePicker, {
                                format: 'ampm',
                                hintText: message(66),
                                value: d2,
                                onChange: this.onPickDate.bind(this, 'last'),
                                textFieldStyle: { width: 100, marginLeft: 5 }
                            })
                        );
                        break;
                    case 'W1':
                        userFrequencyComponent = React.createElement(
                            SelectField,
                            {
                                floatingLabelText: message(67),
                                fullWidth: true,
                                value: NOTIFICATIONS_EMAIL_FREQUENCY_USER,
                                onChange: function (e, i, v) {
                                    _this.onChange({ NOTIFICATIONS_EMAIL_FREQUENCY_USER: v });
                                }
                            },
                            React.createElement(MenuItem, { primaryText: message(68), value: 'Monday' }),
                            React.createElement(MenuItem, { primaryText: message(69), value: 'Tuesday' }),
                            React.createElement(MenuItem, { primaryText: message(70), value: 'Wednesday' }),
                            React.createElement(MenuItem, { primaryText: message(71), value: 'Thursday' }),
                            React.createElement(MenuItem, { primaryText: message(72), value: 'Friday' }),
                            React.createElement(MenuItem, { primaryText: message(73), value: 'Saturday' }),
                            React.createElement(MenuItem, { primaryText: message(74), value: 'Sunday' })
                        );
                        break;
                }
            }

            return React.createElement(
                'div',
                null,
                React.createElement(
                    Subheader,
                    { style: { paddingLeft: 20 } },
                    message(61)
                ),
                React.createElement(
                    'div',
                    { style: { padding: '0 20px 20px' } },
                    React.createElement(Toggle, {
                        label: definitions[0]['label'],
                        toggled: NOTIFICATIONS_EMAIL_GET === 'true',
                        onToggle: function (e, v) {
                            _this.onChange({ NOTIFICATIONS_EMAIL_GET: v ? 'true' : 'false' });
                        }
                    }),
                    mailActive && React.createElement(
                        'div',
                        { style: { paddingBottom: 16 } },
                        React.createElement(
                            'div',
                            { style: { padding: '16px 0' } },
                            React.createElement(Toggle, {
                                label: definitions[4]['label'],
                                toggled: NOTIFICATIONS_EMAIL_SEND_HTML === 'true',
                                onToggle: function (e, v) {
                                    _this.onChange({ NOTIFICATIONS_EMAIL_SEND_HTML: v ? 'true' : 'false' });
                                }
                            })
                        ),
                        React.createElement(
                            SelectField,
                            {
                                fullWidth: true,
                                floatingLabelText: definitions[1]['label'],
                                value: NOTIFICATIONS_EMAIL_FREQUENCY,
                                onChange: function (e, k, p) {
                                    _this.onFrequencyChange(p);
                                }
                            },
                            frequencyMenus
                        ),
                        userFrequencyComponent
                    )
                )
            );
        }
    }]);

    return EmailPanel;
})(Component);

EmailPanel.propTypes = {

    definitions: PropTypes.object,
    values: PropTypes.object,
    onChange: PropTypes.func

};

exports['default'] = EmailPanel;
module.exports = exports['default'];

},{"material-ui":"material-ui","react":"react"}],4:[function(require,module,exports){
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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');
var Pydio = require('pydio');

var _Pydio$requireLib = Pydio.requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;

var _Pydio$requireLib2 = Pydio.requireLib('components');

var ModalAppBar = _Pydio$requireLib2.ModalAppBar;
var AddressBook = _Pydio$requireLib2.AddressBook;

var ModalAddressBook = React.createClass({
    displayName: 'ModalAddressBook',

    mixins: [ActionDialogMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: '',
            dialogSize: 'xl',
            dialogPadding: false,
            dialogIsModal: false,
            dialogScrollBody: true
        };
    },

    submit: function submit() {
        this.dismiss();
    },

    render: function render() {
        var _this = this;

        return React.createElement(
            'div',
            { style: { width: '100%', display: 'flex', flexDirection: 'column' } },
            React.createElement(ModalAppBar, {
                title: this.props.pydio.MessageHash['user_dash.1'],
                showMenuIconButton: false,
                iconClassNameRight: 'mdi mdi-close',
                onRightIconButtonTouchTap: function () {
                    _this.dismiss();
                }
            }),
            React.createElement(AddressBook, _extends({
                mode: 'book'
            }, this.props, {
                style: { width: '100%', flexGrow: 1, height: 'auto' }
            }))
        );
    }

});

exports['default'] = ModalAddressBook;
module.exports = exports['default'];

},{"pydio":"pydio","react":"react"}],5:[function(require,module,exports){
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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ProfilePane = require('./ProfilePane');

var _ProfilePane2 = _interopRequireDefault(_ProfilePane);

var _ComponentConfigParser = require('./ComponentConfigParser');

var _ComponentConfigParser2 = _interopRequireDefault(_ComponentConfigParser);

var React = require('react');
var Pydio = require('pydio');

var _Pydio$requireLib = Pydio.requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;
var SubmitButtonProviderMixin = _Pydio$requireLib.SubmitButtonProviderMixin;
var AsyncComponent = _Pydio$requireLib.AsyncComponent;

var _require = require('material-ui');

var Tabs = _require.Tabs;
var Tab = _require.Tab;
var FontIcon = _require.FontIcon;
var FlatButton = _require.FlatButton;

var ModalDashboard = React.createClass({
    displayName: 'ModalDashboard',

    mixins: [ActionDialogMixin, SubmitButtonProviderMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: '',
            dialogSize: 'md',
            dialogPadding: false,
            dialogIsModal: false,
            dialogScrollBody: false
        };
    },

    submit: function submit() {
        this.dismiss();
    },

    getDefaultButtons: function getDefaultButtons() {
        return [React.createElement(FlatButton, { label: this.props.pydio.MessageHash[86], onTouchTap: this.props.onDismiss })];
    },

    getButtons: function getButtons(updater) {
        this._updater = updater;
        if (this.refs['profile']) {
            return this.refs['profile'].getButtons(this._updater);
        } else {
            return this.getDefaultButtons();
        }
    },

    onTabChange: function onTabChange(value) {
        if (!this._updater) return;
        if (value && this.refs[value] && this.refs[value].getButtons) {
            this._updater(this.refs[value].getButtons(this._updater));
        } else {
            this._updater(this.getDefaultButtons());
        }
    },

    render: function render() {

        var buttonStyle = {
            textTransform: 'none'
        };
        var tabs = [React.createElement(
            Tab,
            { key: 'account', label: this.props.pydio.MessageHash['user_dash.43'], icon: React.createElement(FontIcon, { className: 'mdi mdi-account' }), buttonStyle: buttonStyle, value: 'profile' },
            React.createElement(_ProfilePane2['default'], _extends({}, this.props, { ref: 'profile' }))
        )];

        _ComponentConfigParser2['default'].getAccountTabs(this.props.pydio).map((function (tab) {
            tabs.push(React.createElement(
                Tab,
                { key: tab.id, label: this.props.pydio.MessageHash[tab.tabInfo.label], icon: React.createElement(FontIcon, { className: tab.tabInfo.icon }), buttonStyle: buttonStyle, value: tab.id },
                React.createElement(AsyncComponent, _extends({
                    ref: tab.id
                }, this.props, tab.paneInfo))
            ));
        }).bind(this));

        return React.createElement(
            Tabs,
            {
                style: { display: 'flex', flexDirection: 'column', width: '100%' },
                tabItemContainerStyle: { minHeight: 72 },
                contentContainerStyle: { overflowY: 'auto', minHeight: 350 },
                onChange: this.onTabChange
            },
            tabs
        );
    }

});

exports['default'] = ModalDashboard;
module.exports = exports['default'];

},{"./ComponentConfigParser":2,"./ProfilePane":8,"material-ui":"material-ui","pydio":"pydio","react":"react"}],6:[function(require,module,exports){
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

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydio = require("pydio");

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _cellsSdk = require('cells-sdk');

var _Pydio$requireLib = _pydio2["default"].requireLib('form');

var ValidPassword = _Pydio$requireLib.ValidPassword;

var _Pydio$requireLib2 = _pydio2["default"].requireLib("hoc");

var ModernTextField = _Pydio$requireLib2.ModernTextField;

var PasswordForm = _react2["default"].createClass({
    displayName: "PasswordForm",

    getInitialState: function getInitialState() {
        return { error: null, old: '', newPass: '' };
    },

    getMessage: function getMessage(id) {
        return this.props.pydio.MessageHash[id];
    },

    update: function update(value, field) {
        var _this = this;

        var newStatus = {};
        newStatus[field] = value;
        this.setState(newStatus, function () {
            var status = _this.validate();
            if (_this.props.onValidStatusChange) {
                _this.props.onValidStatusChange(status);
            }
        });
    },

    validate: function validate() {
        if (!this.refs.newpass.isValid()) {
            return false;
        }
        var _state = this.state;
        var oldPass = _state.oldPass;
        var newPass = _state.newPass;

        if (!oldPass || !newPass) {
            this.setState({ error: this.getMessage(239) });
            return false;
        }
        if (newPass.length < parseInt(this.props.pydio.getPluginConfigs("core.auth").get("PASSWORD_MINLENGTH"))) {
            this.setState({ error: this.getMessage(378) });
            return false;
        }
        this.setState({ error: null });
        return true;
    },

    post: function post(callback) {
        var _this2 = this;

        var _state2 = this.state;
        var oldPass = _state2.oldPass;
        var newPass = _state2.newPass;
        var pydio = this.props.pydio;

        var logoutString = '';
        if (pydio.user.lock) {
            logoutString = ' ' + this.getMessage(445);
        }
        pydio.user.getIdmUser().then(function (idmUser) {
            var updateUser = _cellsSdk.IdmUser.constructFromObject(JSON.parse(JSON.stringify(idmUser)));
            updateUser.OldPassword = oldPass;
            updateUser.Password = newPass;
            var api = new _cellsSdk.UserServiceApi(_pydioHttpApi2["default"].getRestClient());
            api.putUser(updateUser.Login, updateUser).then(function () {
                pydio.displayMessage('SUCCESS', _this2.getMessage(197) + logoutString);
                callback(true);
                if (logoutString) {
                    pydio.getController().fireAction('logout');
                }
            });
        });
    },

    render: function render() {
        var _this3 = this;

        if (!this.props.pydio.user) {
            return null;
        }
        var messages = this.props.pydio.MessageHash;
        var legend = undefined;
        if (this.state.error) {
            legend = _react2["default"].createElement(
                "div",
                { className: "error" },
                this.state.error
            );
        } else if (this.props.pydio.user.lock) {
            legend = _react2["default"].createElement(
                "div",
                null,
                messages[444]
            );
        }
        var oldChange = function oldChange(event, newV) {
            _this3.update(newV, 'oldPass');
        };
        var newChange = function newChange(newV, oldV) {
            _this3.update(newV, 'newPass');
        };
        return _react2["default"].createElement(
            "div",
            { style: this.props.style },
            legend,
            _react2["default"].createElement(
                "div",
                null,
                _react2["default"].createElement(
                    "form",
                    { autoComplete: "off" },
                    _react2["default"].createElement(ModernTextField, {
                        onChange: oldChange,
                        type: "password",
                        value: this.state.oldPass,
                        ref: "old",
                        floatingLabelText: messages[237],
                        autoComplete: "off"
                    })
                )
            ),
            _react2["default"].createElement(
                "div",
                { style: { width: 256 } },
                _react2["default"].createElement(ValidPassword, {
                    onChange: newChange,
                    attributes: { name: 'pass', label: messages[198] },
                    value: this.state.newPass,
                    name: "newpassword",
                    ref: "newpass"
                })
            )
        );
    }

});

exports["default"] = PasswordForm;
module.exports = exports["default"];

},{"cells-sdk":"cells-sdk","pydio":"pydio","pydio/http/api":"pydio/http/api","react":"react"}],7:[function(require,module,exports){
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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _PasswordForm = require('./PasswordForm');

var _PasswordForm2 = _interopRequireDefault(_PasswordForm);

var React = require('react');

var _require = require('material-ui');

var FlatButton = _require.FlatButton;
var RaisedButton = _require.RaisedButton;
var Popover = _require.Popover;
var Divider = _require.Divider;

var Pydio = require('pydio');

var PasswordPopover = (function (_React$Component) {
    _inherits(PasswordPopover, _React$Component);

    function PasswordPopover(props, context) {
        _classCallCheck(this, PasswordPopover);

        _get(Object.getPrototypeOf(PasswordPopover.prototype), 'constructor', this).call(this, props, context);
        this.state = { passOpen: false, passValid: false, passAnchor: null };
    }

    _createClass(PasswordPopover, [{
        key: 'passOpenPopover',
        value: function passOpenPopover(event) {
            this.setState({ passOpen: true, passAnchor: event.currentTarget });
        }
    }, {
        key: 'passClosePopover',
        value: function passClosePopover() {
            this.setState({ passOpen: false });
        }
    }, {
        key: 'passValidStatusChange',
        value: function passValidStatusChange(status) {
            this.setState({ passValid: status });
        }
    }, {
        key: 'passSubmit',
        value: function passSubmit() {
            this.refs.passwordForm.post((function (value) {
                if (value) this.passClosePopover();
            }).bind(this));
        }
    }, {
        key: 'render',
        value: function render() {
            var pydio = this.props.pydio;
            var _state = this.state;
            var passOpen = _state.passOpen;
            var passAnchor = _state.passAnchor;
            var passValid = _state.passValid;

            return React.createElement(
                'div',
                { style: { marginLeft: 8 } },
                React.createElement(RaisedButton, {
                    onTouchTap: this.passOpenPopover.bind(this),
                    label: pydio.MessageHash[194],
                    primary: true
                }),
                React.createElement(
                    Popover,
                    {
                        open: passOpen,
                        anchorEl: passAnchor,
                        anchorOrigin: { horizontal: 'left', vertical: 'top' },
                        targetOrigin: { horizontal: 'left', vertical: 'bottom' },
                        onRequestClose: this.passClosePopover.bind(this),
                        zDepth: 2
                    },
                    React.createElement(
                        'div',
                        null,
                        React.createElement(_PasswordForm2['default'], {
                            style: { padding: 10, backgroundColor: '#fafafa', paddingBottom: 30 },
                            pydio: pydio,
                            ref: 'passwordForm',
                            onValidStatusChange: this.passValidStatusChange.bind(this)
                        }),
                        React.createElement(Divider, null),
                        React.createElement(
                            'div',
                            { style: { textAlign: 'right', padding: '8px 0' } },
                            React.createElement(FlatButton, { label: this.props.pydio.MessageHash[49], onTouchTap: this.passClosePopover.bind(this) }),
                            React.createElement(FlatButton, { disabled: !passValid, label: 'Ok', onTouchTap: this.passSubmit.bind(this) })
                        )
                    )
                )
            );
        }
    }]);

    return PasswordPopover;
})(React.Component);

exports['default'] = PasswordPopover;
module.exports = exports['default'];

},{"./PasswordForm":6,"material-ui":"material-ui","pydio":"pydio","react":"react"}],8:[function(require,module,exports){
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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _PasswordPopover = require('./PasswordPopover');

var _PasswordPopover2 = _interopRequireDefault(_PasswordPopover);

var _EmailPanel = require('./EmailPanel');

var _EmailPanel2 = _interopRequireDefault(_EmailPanel);

var _pydioUtilLang = require("pydio/util/lang");

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _materialUi = require("material-ui");

var _pydio = require("pydio");

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _cellsSdk = require('cells-sdk');

var _Pydio$requireLib = _pydio2['default'].requireLib('form');

var Manager = _Pydio$requireLib.Manager;
var FormPanel = _Pydio$requireLib.FormPanel;

var FORM_CSS = ' \n.react-mui-context .current-user-edit.pydio-form-panel > .pydio-form-group:first-of-type {\n  margin-top: 230px;\n  overflow-y: hidden;\n}\n.react-mui-context .current-user-edit.pydio-form-panel > .pydio-form-group div.form-entry-image {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  height: 220px;\n  background-color: #eceff1;\n}\n.react-mui-context .current-user-edit.pydio-form-panel .form-entry-image>div:last-child {\n  margin-top: 0;\n}\n\n.react-mui-context .current-user-edit.pydio-form-panel > .pydio-form-group div.form-entry-image > div:first-child {\n  padding: 0;\n  border-radius: 0;\n}\n.react-mui-context .current-user-edit.pydio-form-panel > .pydio-form-group div.form-entry-image .image-label,\n.react-mui-context .current-user-edit.pydio-form-panel > .pydio-form-group div.form-entry-image .form-legend {\n  display: none;\n}\n.react-mui-context .current-user-edit.pydio-form-panel > .pydio-form-group div.form-entry-image .file-dropzone {\n  border-radius: 50%;\n  width: 160px !important;\n  height: 160px !important;\n  margin: 20px auto;\n}\n.react-mui-context .current-user-edit.pydio-form-panel > .pydio-form-group div.form-entry-image .binary-remove-button {\n  position: absolute;\n  bottom: 5px;\n  right: 0;\n}\n\n';

var ProfilePane = _react2['default'].createClass({
    displayName: 'ProfilePane',

    getInitialState: function getInitialState() {
        var objValues = {},
            mailValues = {};
        var pydio = this.props.pydio;
        if (pydio.user) {
            pydio.user.preferences.forEach(function (v, k) {
                if (k === 'gui_preferences') {
                    return;
                }
                objValues[k] = v;
            });
        }
        return {
            definitions: Manager.parseParameters(pydio.getXmlRegistry(), "user/preferences/pref[@exposed='true']|//param[contains(@scope,'user') and @expose='true' and not(contains(@name, 'NOTIFICATIONS_EMAIL'))]"),
            mailDefinitions: Manager.parseParameters(pydio.getXmlRegistry(), "user/preferences/pref[@exposed='true']|//param[contains(@scope,'user') and @expose='true' and contains(@name, 'NOTIFICATIONS_EMAIL')]"),
            values: objValues,
            originalValues: _pydioUtilLang2['default'].deepCopy(objValues),
            dirty: false
        };
    },

    onFormChange: function onFormChange(newValues, dirty, removeValues) {
        var _this = this;

        var values = this.state.values;

        this.setState({ dirty: dirty, values: newValues }, function () {
            if (_this._updater) {
                _this._updater(_this.getButtons());
            }
            if (_this.props.saveOnChange || newValues['avatar'] !== values['avatar']) {
                _this.saveForm();
            }
        });
    },

    getButtons: function getButtons() {
        var updater = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        if (updater) {
            this._updater = updater;
        }
        var button = undefined,
            revert = undefined;
        if (this.state.dirty) {
            revert = _react2['default'].createElement(_materialUi.FlatButton, { label: this.props.pydio.MessageHash[628], onTouchTap: this.revert });
            button = _react2['default'].createElement(_materialUi.FlatButton, { label: this.props.pydio.MessageHash[53], secondary: true, onTouchTap: this.saveForm });
        } else {
            button = _react2['default'].createElement(_materialUi.FlatButton, { label: this.props.pydio.MessageHash[86], onTouchTap: this.props.onDismiss });
        }
        if (this.props.pydio.Controller.getActionByName('pass_change')) {
            return [_react2['default'].createElement(
                'div',
                { style: { display: 'flex', width: '100%' } },
                _react2['default'].createElement(_PasswordPopover2['default'], this.props),
                _react2['default'].createElement('span', { style: { flex: 1 } }),
                revert,
                button
            )];
        } else {
            return [button];
        }
    },

    revert: function revert() {
        var _this2 = this;

        this.setState({
            values: _extends({}, this.state.originalValues),
            dirty: false
        }, function () {
            if (_this2._updater) {
                _this2._updater(_this2.getButtons());
            }
        });
    },

    saveForm: function saveForm() {
        var _this3 = this;

        if (!this.state.dirty) {
            this.setState({ dirty: false });
            return;
        }
        var pydio = this.props.pydio;
        var _state = this.state;
        var definitions = _state.definitions;
        var values = _state.values;

        pydio.user.getIdmUser().then(function (idmUser) {
            if (!idmUser.Attributes) {
                idmUser.Attributes = {};
            }
            definitions.forEach(function (d) {
                if (values[d.name] === undefined) {
                    return;
                }
                if (d.scope === "user") {
                    idmUser.Attributes[d.name] = values[d.name];
                } else {
                    idmUser.Attributes["parameter:" + d.pluginId + ":" + d.name] = JSON.stringify(values[d.name]);
                }
            });
            var changeLang = false;
            if (values['lang'] && values['lang'] !== pydio.currentLanguage) {
                pydio.user.setPreference('lang', values['lang']);
                changeLang = true;
            }
            var api = new _cellsSdk.UserServiceApi(_pydioHttpApi2['default'].getRestClient());
            return api.putUser(idmUser.Login, idmUser).then(function (response) {
                if (changeLang) {
                    // Reload form after registry reload
                    pydio.observeOnce('registry_loaded', function () {
                        _this3.setState({
                            definitions: Manager.parseParameters(pydio.getXmlRegistry(), "user/preferences/pref[@exposed='true']|//param[contains(@scope,'user') and @expose='true' and not(contains(@name, 'NOTIFICATIONS_EMAIL'))]"),
                            mailDefinitions: Manager.parseParameters(pydio.getXmlRegistry(), "user/preferences/pref[@exposed='true']|//param[contains(@scope,'user') and @expose='true' and contains(@name, 'NOTIFICATIONS_EMAIL')]")
                        });
                    });
                }
                pydio.refreshUserData();
                _this3.setState({ dirty: false }, function () {
                    if (_this3._updater) {
                        _this3._updater(_this3.getButtons());
                    }
                });
            });
        });
    },

    render: function render() {
        var _props = this.props;
        var pydio = _props.pydio;
        var miniDisplay = _props.miniDisplay;

        if (!pydio.user) {
            return null;
        }
        var _state2 = this.state;
        var definitions = _state2.definitions;
        var values = _state2.values;

        if (miniDisplay) {
            definitions = definitions.filter(function (o) {
                return ['avatar'].indexOf(o.name) !== -1;
            });
        }
        return _react2['default'].createElement(
            'div',
            null,
            _react2['default'].createElement(FormPanel, {
                className: 'current-user-edit',
                parameters: definitions,
                values: values,
                depth: -1,
                binary_context: "user_id=" + pydio.user.id + (values['avatar'] ? "?" + values['avatar'] : ''),
                onChange: this.onFormChange
            }),
            _react2['default'].createElement('style', { type: 'text/css', dangerouslySetInnerHTML: { __html: FORM_CSS } })
        );
    }

});

exports['default'] = ProfilePane;
module.exports = exports['default'];

},{"./EmailPanel":3,"./PasswordPopover":7,"cells-sdk":"cells-sdk","material-ui":"material-ui","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/util/lang":"pydio/util/lang","react":"react"}],9:[function(require,module,exports){
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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ProfilePane = require('./ProfilePane');

var _ProfilePane2 = _interopRequireDefault(_ProfilePane);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;
var CancelButtonProviderMixin = _Pydio$requireLib.CancelButtonProviderMixin;
var SubmitButtonProviderMixin = _Pydio$requireLib.SubmitButtonProviderMixin;

/**
 * Sample Dialog class used for reference only, ready to be
 * copy/pasted :-)
 */
exports['default'] = _react2['default'].createClass({
    displayName: 'WelcomeModal',

    mixins: [ActionDialogMixin, CancelButtonProviderMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: '',
            dialogIsModal: true,
            dialogSize: 'sm',
            dialogPadding: 0
        };
    },
    close: function close(skip) {

        if (this.props.onRequestStart) {
            this.props.onRequestStart(skip);
        }
        this.props.onDismiss();
    },
    getMessage: function getMessage(id) {
        return this.props.pydio.MessageHash['ajax_gui.tour.welcomemodal.' + id];
    },
    getButtons: function getButtons() {
        var _this = this;

        return [_react2['default'].createElement(_materialUi.FlatButton, { label: this.getMessage('skip'), onTouchTap: function () {
                _this.close(true);
            } }), _react2['default'].createElement(_materialUi.FlatButton, { label: this.getMessage('start'), primary: true, onTouchTap: function () {
                return _this.close(false);
            } })];
    },
    render: function render() {
        return _react2['default'].createElement(
            'div',
            null,
            _react2['default'].createElement(
                'div',
                { style: { position: 'relative', width: '100%', height: 220, overflow: 'hidden', backgroundColor: '#eceff1' } },
                _react2['default'].createElement(_ProfilePane2['default'], _extends({ miniDisplay: true }, this.props, { saveOnChange: true }))
            ),
            _react2['default'].createElement(_materialUi.CardTitle, { title: this.getMessage('title'), subtitle: this.getMessage('subtitle') })
        );
    }

});
module.exports = exports['default'];

},{"./ProfilePane":8,"material-ui":"material-ui","pydio":"pydio","react":"react"}],10:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Callbacks = require('./Callbacks');

var _Callbacks2 = _interopRequireDefault(_Callbacks);

var _ModalDashboard = require('./ModalDashboard');

var _ModalDashboard2 = _interopRequireDefault(_ModalDashboard);

var _ModalAddressBook = require('./ModalAddressBook');

var _ModalAddressBook2 = _interopRequireDefault(_ModalAddressBook);

var _WelcomeModal = require('./WelcomeModal');

var _WelcomeModal2 = _interopRequireDefault(_WelcomeModal);

var _PasswordForm = require('./PasswordForm');

var _PasswordForm2 = _interopRequireDefault(_PasswordForm);

var Callbacks = (0, _Callbacks2['default'])(window.pydio);

exports.Callbacks = Callbacks;
exports.ModalDashboard = _ModalDashboard2['default'];
exports.ModalAddressBook = _ModalAddressBook2['default'];
exports.WelcomeModal = _WelcomeModal2['default'];
exports.PasswordForm = _PasswordForm2['default'];

},{"./Callbacks":1,"./ModalAddressBook":4,"./ModalDashboard":5,"./PasswordForm":6,"./WelcomeModal":9}]},{},[10])(10)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvQ2FsbGJhY2tzLmpzIiwicmVzL2J1aWxkL0NvbXBvbmVudENvbmZpZ1BhcnNlci5qcyIsInJlcy9idWlsZC9FbWFpbFBhbmVsLmpzIiwicmVzL2J1aWxkL01vZGFsQWRkcmVzc0Jvb2suanMiLCJyZXMvYnVpbGQvTW9kYWxEYXNoYm9hcmQuanMiLCJyZXMvYnVpbGQvUGFzc3dvcmRGb3JtLmpzIiwicmVzL2J1aWxkL1Bhc3N3b3JkUG9wb3Zlci5qcyIsInJlcy9idWlsZC9Qcm9maWxlUGFuZS5qcyIsInJlcy9idWlsZC9XZWxjb21lTW9kYWwuanMiLCJyZXMvYnVpbGQvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbnZhciBSZXNvdXJjZXNNYW5hZ2VyID0gcmVxdWlyZSgncHlkaW8vaHR0cC9yZXNvdXJjZXMtbWFuYWdlcicpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBmdW5jdGlvbiAocHlkaW8pIHtcblxuICAgIHJldHVybiB7XG5cbiAgICAgICAgb3BlbkRhc2hib2FyZDogZnVuY3Rpb24gb3BlbkRhc2hib2FyZCgpIHtcbiAgICAgICAgICAgIFJlc291cmNlc01hbmFnZXIubG9hZENsYXNzZXNBbmRBcHBseShbJ1B5ZGlvRm9ybSddLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcHlkaW8uVUkub3BlbkNvbXBvbmVudEluTW9kYWwoJ1VzZXJBY2NvdW50JywgJ01vZGFsRGFzaGJvYXJkJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBvcGVuQWRkcmVzc0Jvb2s6IGZ1bmN0aW9uIG9wZW5BZGRyZXNzQm9vaygpIHtcbiAgICAgICAgICAgIFJlc291cmNlc01hbmFnZXIubG9hZENsYXNzZXNBbmRBcHBseShbJ1B5ZGlvRm9ybScsICdQeWRpb0NvbXBvbmVudHMnXSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHB5ZGlvLlVJLm9wZW5Db21wb25lbnRJbk1vZGFsKCdVc2VyQWNjb3VudCcsICdNb2RhbEFkZHJlc3NCb29rJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG52YXIgWE1MVXRpbHMgPSByZXF1aXJlKCdweWRpby91dGlsL3htbCcpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSB7XG5cbiAgICBnZXRBY2NvdW50VGFiczogZnVuY3Rpb24gZ2V0QWNjb3VudFRhYnMocHlkaW8pIHtcblxuICAgICAgICByZXR1cm4gWE1MVXRpbHMuWFBhdGhTZWxlY3ROb2RlcyhweWRpby5nZXRYbWxSZWdpc3RyeSgpLCAnY2xpZW50X2NvbmZpZ3MvY29tcG9uZW50X2NvbmZpZ1tAY29tcG9uZW50PVwiVXNlckFjY291bnRUYWJzXCJdL2FkZGl0aW9uYWxfdGFiJykubWFwKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlkOiBub2RlLmdldEF0dHJpYnV0ZShcImlkXCIpLFxuICAgICAgICAgICAgICAgIHRhYkluZm86IEpTT04ucGFyc2Uobm9kZS5nZXRBdHRyaWJ1dGUoJ3RhYkluZm8nKSksXG4gICAgICAgICAgICAgICAgcGFuZUluZm86IEpTT04ucGFyc2Uobm9kZS5nZXRBdHRyaWJ1dGUoJ3BhbmVJbmZvJykpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG5cbn07XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgQ29tcG9uZW50ID0gX3JlcXVpcmUuQ29tcG9uZW50O1xudmFyIFByb3BUeXBlcyA9IF9yZXF1aXJlLlByb3BUeXBlcztcblxudmFyIF9yZXF1aXJlMiA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBUb2dnbGUgPSBfcmVxdWlyZTIuVG9nZ2xlO1xudmFyIFN1YmhlYWRlciA9IF9yZXF1aXJlMi5TdWJoZWFkZXI7XG52YXIgTWVudUl0ZW0gPSBfcmVxdWlyZTIuTWVudUl0ZW07XG52YXIgU2VsZWN0RmllbGQgPSBfcmVxdWlyZTIuU2VsZWN0RmllbGQ7XG52YXIgVGV4dEZpZWxkID0gX3JlcXVpcmUyLlRleHRGaWVsZDtcbnZhciBUaW1lUGlja2VyID0gX3JlcXVpcmUyLlRpbWVQaWNrZXI7XG5cbnZhciBFbWFpbFBhbmVsID0gKGZ1bmN0aW9uIChfQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKEVtYWlsUGFuZWwsIF9Db21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gRW1haWxQYW5lbCgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEVtYWlsUGFuZWwpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEVtYWlsUGFuZWwucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRW1haWxQYW5lbCwgW3tcbiAgICAgICAga2V5OiAnb25DaGFuZ2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb25DaGFuZ2UocGFydGlhbFZhbHVlcykge1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgdmFsdWVzID0gX3Byb3BzLnZhbHVlcztcbiAgICAgICAgICAgIHZhciBvbkNoYW5nZSA9IF9wcm9wcy5vbkNoYW5nZTtcblxuICAgICAgICAgICAgb25DaGFuZ2UoX2V4dGVuZHMoe30sIHZhbHVlcywgcGFydGlhbFZhbHVlcyksIHRydWUpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvbkZyZXF1ZW5jeUNoYW5nZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvbkZyZXF1ZW5jeUNoYW5nZSh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHBhcnRpYWwgPSB7IE5PVElGSUNBVElPTlNfRU1BSUxfRlJFUVVFTkNZOiB2YWx1ZSB9O1xuICAgICAgICAgICAgdmFyIG5ld1VzZXJWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHN3aXRjaCAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdNJzpcbiAgICAgICAgICAgICAgICAgICAgbmV3VXNlclZhbHVlID0gJzUnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdIJzpcbiAgICAgICAgICAgICAgICAgICAgbmV3VXNlclZhbHVlID0gJzInO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdEMSc6XG4gICAgICAgICAgICAgICAgICAgIG5ld1VzZXJWYWx1ZSA9ICcwMyc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0QyJzpcbiAgICAgICAgICAgICAgICAgICAgbmV3VXNlclZhbHVlID0gJzA5LDE0JztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnVzEnOlxuICAgICAgICAgICAgICAgICAgICBuZXdVc2VyVmFsdWUgPSAnTW9uZGF5JztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJ0aWFsLk5PVElGSUNBVElPTlNfRU1BSUxfRlJFUVVFTkNZX1VTRVIgPSBuZXdVc2VyVmFsdWU7XG4gICAgICAgICAgICB0aGlzLm9uQ2hhbmdlKHBhcnRpYWwpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvblBpY2tEYXRlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uUGlja0RhdGUocG9zaXRpb24sIGV2ZW50LCBkYXRlKSB7XG4gICAgICAgICAgICB2YXIgTk9USUZJQ0FUSU9OU19FTUFJTF9GUkVRVUVOQ1lfVVNFUiA9IHRoaXMucHJvcHMudmFsdWVzLk5PVElGSUNBVElPTlNfRU1BSUxfRlJFUVVFTkNZX1VTRVI7XG5cbiAgICAgICAgICAgIHZhciBob3VycyA9IE5PVElGSUNBVElPTlNfRU1BSUxfRlJFUVVFTkNZX1VTRVIuc3BsaXQoJywnKTtcbiAgICAgICAgICAgIHZhciBuZXdIb3VycyA9IFtdO1xuICAgICAgICAgICAgaWYgKHBvc2l0aW9uID09PSAnZmlyc3QnKSBuZXdIb3VycyA9IFtkYXRlLmdldEhvdXJzKCksIGhvdXJzWzFdID8gaG91cnNbMV0gOiAnMDAnXTtcbiAgICAgICAgICAgIGlmIChwb3NpdGlvbiA9PT0gJ2xhc3QnKSBuZXdIb3VycyA9IFtob3Vyc1swXSA/IGhvdXJzWzBdIDogJzAwJywgZGF0ZS5nZXRIb3VycygpXTtcbiAgICAgICAgICAgIHRoaXMub25DaGFuZ2UoeyBOT1RJRklDQVRJT05TX0VNQUlMX0ZSRVFVRU5DWV9VU0VSOiBuZXdIb3Vycy5qb2luKCcsJykgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgZGVmaW5pdGlvbnMgPSBfcHJvcHMyLmRlZmluaXRpb25zO1xuICAgICAgICAgICAgdmFyIHZhbHVlcyA9IF9wcm9wczIudmFsdWVzO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzMi5weWRpbztcblxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBmdW5jdGlvbiBtZXNzYWdlKGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHB5ZGlvLk1lc3NhZ2VIYXNoWyd1c2VyX2Rhc2guJyArIGlkXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgTk9USUZJQ0FUSU9OU19FTUFJTF9HRVQgPSB2YWx1ZXMuTk9USUZJQ0FUSU9OU19FTUFJTF9HRVQ7XG4gICAgICAgICAgICB2YXIgTk9USUZJQ0FUSU9OU19FTUFJTF9GUkVRVUVOQ1kgPSB2YWx1ZXMuTk9USUZJQ0FUSU9OU19FTUFJTF9GUkVRVUVOQ1k7XG4gICAgICAgICAgICB2YXIgTk9USUZJQ0FUSU9OU19FTUFJTF9GUkVRVUVOQ1lfVVNFUiA9IHZhbHVlcy5OT1RJRklDQVRJT05TX0VNQUlMX0ZSRVFVRU5DWV9VU0VSO1xuICAgICAgICAgICAgdmFyIE5PVElGSUNBVElPTlNfRU1BSUwgPSB2YWx1ZXMuTk9USUZJQ0FUSU9OU19FTUFJTDtcbiAgICAgICAgICAgIHZhciBOT1RJRklDQVRJT05TX0VNQUlMX1NFTkRfSFRNTCA9IHZhbHVlcy5OT1RJRklDQVRJT05TX0VNQUlMX1NFTkRfSFRNTDtcblxuICAgICAgICAgICAgdmFyIG1haWxBY3RpdmUgPSBOT1RJRklDQVRJT05TX0VNQUlMX0dFVCA9PT0gJ3RydWUnO1xuICAgICAgICAgICAgdmFyIGZyZXF1ZW5jeVR5cGVzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgdmFyIGZyZXF1ZW5jeU1lbnVzID0gW107XG4gICAgICAgICAgICBkZWZpbml0aW9uc1sxXVsnY2hvaWNlcyddLnNwbGl0KCcsJykubWFwKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGQgPSBlLnNwbGl0KCd8Jyk7XG4gICAgICAgICAgICAgICAgZnJlcXVlbmN5VHlwZXMuc2V0KGRbMF0sIGRbMV0pO1xuICAgICAgICAgICAgICAgIGZyZXF1ZW5jeU1lbnVzLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudChNZW51SXRlbSwgeyBwcmltYXJ5VGV4dDogZFsxXSwgdmFsdWU6IGRbMF0gfSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgdXNlckZyZXF1ZW5jeUNvbXBvbmVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChtYWlsQWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChOT1RJRklDQVRJT05TX0VNQUlMX0ZSRVFVRU5DWSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdNJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnSCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyRnJlcXVlbmN5Q29tcG9uZW50ID0gUmVhY3QuY3JlYXRlRWxlbWVudChUZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IE5PVElGSUNBVElPTlNfRU1BSUxfRlJFUVVFTkNZID09PSAnTScgPyBtZXNzYWdlKDYyKSA6IG1lc3NhZ2UoNjMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBOT1RJRklDQVRJT05TX0VNQUlMX0ZSRVFVRU5DWV9VU0VSLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSwgdikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5vbkNoYW5nZSh7IE5PVElGSUNBVElPTlNfRU1BSUxfRlJFUVVFTkNZX1VTRVI6IHYgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnRDEnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZC5zZXRIb3VycyhOT1RJRklDQVRJT05TX0VNQUlMX0ZSRVFVRU5DWV9VU0VSKTtkLnNldE1pbnV0ZXMoMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyRnJlcXVlbmN5Q29tcG9uZW50ID0gUmVhY3QuY3JlYXRlRWxlbWVudChUaW1lUGlja2VyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiAnYW1wbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGludFRleHQ6IG1lc3NhZ2UoNjQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSwgZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5vbkNoYW5nZSh7IE5PVElGSUNBVElPTlNfRU1BSUxfRlJFUVVFTkNZX1VTRVI6IGRhdGUuZ2V0SG91cnMoKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9PazogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0RmllbGRTdHlsZTogeyB3aWR0aDogJzEwMCUnIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0QyJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBob3VycyA9IE5PVElGSUNBVElPTlNfRU1BSUxfRlJFUVVFTkNZX1VTRVIgKyAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaG91cnMpIGhvdXJzID0gJzA5LDE0JztcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvdXJzID0gaG91cnMuc3BsaXQoJywnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkMSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZDIgPSBuZXcgRGF0ZSgpO2QyLnNldE1pbnV0ZXMoMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkMS5zZXRIb3Vycyhob3Vyc1swXSk7ZDEuc2V0TWludXRlcygwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChob3Vyc1sxXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQyLnNldEhvdXJzKGhvdXJzWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJGcmVxdWVuY3lDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRpbWVQaWNrZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiAnYW1wbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpbnRUZXh0OiBtZXNzYWdlKDY1KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGQxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vblBpY2tEYXRlLmJpbmQodGhpcywgJ2ZpcnN0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRGaWVsZFN0eWxlOiB7IHdpZHRoOiAxMDAsIG1hcmdpblJpZ2h0OiA1IH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRpbWVQaWNrZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiAnYW1wbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpbnRUZXh0OiBtZXNzYWdlKDY2KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGQyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vblBpY2tEYXRlLmJpbmQodGhpcywgJ2xhc3QnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dEZpZWxkU3R5bGU6IHsgd2lkdGg6IDEwMCwgbWFyZ2luTGVmdDogNSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnVzEnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlckZyZXF1ZW5jeUNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU2VsZWN0RmllbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsVGV4dDogbWVzc2FnZSg2NyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IE5PVElGSUNBVElPTlNfRU1BSUxfRlJFUVVFTkNZX1VTRVIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSwgaSwgdikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMub25DaGFuZ2UoeyBOT1RJRklDQVRJT05TX0VNQUlMX0ZSRVFVRU5DWV9VU0VSOiB2IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KE1lbnVJdGVtLCB7IHByaW1hcnlUZXh0OiBtZXNzYWdlKDY4KSwgdmFsdWU6ICdNb25kYXknIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTWVudUl0ZW0sIHsgcHJpbWFyeVRleHQ6IG1lc3NhZ2UoNjkpLCB2YWx1ZTogJ1R1ZXNkYXknIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTWVudUl0ZW0sIHsgcHJpbWFyeVRleHQ6IG1lc3NhZ2UoNzApLCB2YWx1ZTogJ1dlZG5lc2RheScgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChNZW51SXRlbSwgeyBwcmltYXJ5VGV4dDogbWVzc2FnZSg3MSksIHZhbHVlOiAnVGh1cnNkYXknIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTWVudUl0ZW0sIHsgcHJpbWFyeVRleHQ6IG1lc3NhZ2UoNzIpLCB2YWx1ZTogJ0ZyaWRheScgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChNZW51SXRlbSwgeyBwcmltYXJ5VGV4dDogbWVzc2FnZSg3MyksIHZhbHVlOiAnU2F0dXJkYXknIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTWVudUl0ZW0sIHsgcHJpbWFyeVRleHQ6IG1lc3NhZ2UoNzQpLCB2YWx1ZTogJ1N1bmRheScgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgU3ViaGVhZGVyLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmdMZWZ0OiAyMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UoNjEpXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAnMCAyMHB4IDIwcHgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUb2dnbGUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBkZWZpbml0aW9uc1swXVsnbGFiZWwnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvZ2dsZWQ6IE5PVElGSUNBVElPTlNfRU1BSUxfR0VUID09PSAndHJ1ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZTogZnVuY3Rpb24gKGUsIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5vbkNoYW5nZSh7IE5PVElGSUNBVElPTlNfRU1BSUxfR0VUOiB2ID8gJ3RydWUnIDogJ2ZhbHNlJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG1haWxBY3RpdmUgJiYgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nQm90dG9tOiAxNiB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogJzE2cHggMCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVG9nZ2xlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBkZWZpbml0aW9uc1s0XVsnbGFiZWwnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9nZ2xlZDogTk9USUZJQ0FUSU9OU19FTUFJTF9TRU5EX0hUTUwgPT09ICd0cnVlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGU6IGZ1bmN0aW9uIChlLCB2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5vbkNoYW5nZSh7IE5PVElGSUNBVElPTlNfRU1BSUxfU0VORF9IVE1MOiB2ID8gJ3RydWUnIDogJ2ZhbHNlJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTZWxlY3RGaWVsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IGRlZmluaXRpb25zWzFdWydsYWJlbCddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogTk9USUZJQ0FUSU9OU19FTUFJTF9GUkVRVUVOQ1ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSwgaywgcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMub25GcmVxdWVuY3lDaGFuZ2UocCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyZXF1ZW5jeU1lbnVzXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlckZyZXF1ZW5jeUNvbXBvbmVudFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBFbWFpbFBhbmVsO1xufSkoQ29tcG9uZW50KTtcblxuRW1haWxQYW5lbC5wcm9wVHlwZXMgPSB7XG5cbiAgICBkZWZpbml0aW9uczogUHJvcFR5cGVzLm9iamVjdCxcbiAgICB2YWx1ZXM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgb25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jXG5cbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEVtYWlsUGFuZWw7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFB5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gUHlkaW8ucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgQWN0aW9uRGlhbG9nTWl4aW4gPSBfUHlkaW8kcmVxdWlyZUxpYi5BY3Rpb25EaWFsb2dNaXhpbjtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliMiA9IFB5ZGlvLnJlcXVpcmVMaWIoJ2NvbXBvbmVudHMnKTtcblxudmFyIE1vZGFsQXBwQmFyID0gX1B5ZGlvJHJlcXVpcmVMaWIyLk1vZGFsQXBwQmFyO1xudmFyIEFkZHJlc3NCb29rID0gX1B5ZGlvJHJlcXVpcmVMaWIyLkFkZHJlc3NCb29rO1xuXG52YXIgTW9kYWxBZGRyZXNzQm9vayA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ01vZGFsQWRkcmVzc0Jvb2snLFxuXG4gICAgbWl4aW5zOiBbQWN0aW9uRGlhbG9nTWl4aW5dLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaWFsb2dUaXRsZTogJycsXG4gICAgICAgICAgICBkaWFsb2dTaXplOiAneGwnLFxuICAgICAgICAgICAgZGlhbG9nUGFkZGluZzogZmFsc2UsXG4gICAgICAgICAgICBkaWFsb2dJc01vZGFsOiBmYWxzZSxcbiAgICAgICAgICAgIGRpYWxvZ1Njcm9sbEJvZHk6IHRydWVcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgc3VibWl0OiBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICAgIHRoaXMuZGlzbWlzcygpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogJzEwMCUnLCBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nIH0gfSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTW9kYWxBcHBCYXIsIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFsndXNlcl9kYXNoLjEnXSxcbiAgICAgICAgICAgICAgICBzaG93TWVudUljb25CdXR0b246IGZhbHNlLFxuICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWVSaWdodDogJ21kaSBtZGktY2xvc2UnLFxuICAgICAgICAgICAgICAgIG9uUmlnaHRJY29uQnV0dG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuZGlzbWlzcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChBZGRyZXNzQm9vaywgX2V4dGVuZHMoe1xuICAgICAgICAgICAgICAgIG1vZGU6ICdib29rJ1xuICAgICAgICAgICAgfSwgdGhpcy5wcm9wcywge1xuICAgICAgICAgICAgICAgIHN0eWxlOiB7IHdpZHRoOiAnMTAwJScsIGZsZXhHcm93OiAxLCBoZWlnaHQ6ICdhdXRvJyB9XG4gICAgICAgICAgICB9KSlcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBNb2RhbEFkZHJlc3NCb29rO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX1Byb2ZpbGVQYW5lID0gcmVxdWlyZSgnLi9Qcm9maWxlUGFuZScpO1xuXG52YXIgX1Byb2ZpbGVQYW5lMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1Byb2ZpbGVQYW5lKTtcblxudmFyIF9Db21wb25lbnRDb25maWdQYXJzZXIgPSByZXF1aXJlKCcuL0NvbXBvbmVudENvbmZpZ1BhcnNlcicpO1xuXG52YXIgX0NvbXBvbmVudENvbmZpZ1BhcnNlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Db21wb25lbnRDb25maWdQYXJzZXIpO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFB5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gUHlkaW8ucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgQWN0aW9uRGlhbG9nTWl4aW4gPSBfUHlkaW8kcmVxdWlyZUxpYi5BY3Rpb25EaWFsb2dNaXhpbjtcbnZhciBTdWJtaXRCdXR0b25Qcm92aWRlck1peGluID0gX1B5ZGlvJHJlcXVpcmVMaWIuU3VibWl0QnV0dG9uUHJvdmlkZXJNaXhpbjtcbnZhciBBc3luY0NvbXBvbmVudCA9IF9QeWRpbyRyZXF1aXJlTGliLkFzeW5jQ29tcG9uZW50O1xuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgVGFicyA9IF9yZXF1aXJlLlRhYnM7XG52YXIgVGFiID0gX3JlcXVpcmUuVGFiO1xudmFyIEZvbnRJY29uID0gX3JlcXVpcmUuRm9udEljb247XG52YXIgRmxhdEJ1dHRvbiA9IF9yZXF1aXJlLkZsYXRCdXR0b247XG5cbnZhciBNb2RhbERhc2hib2FyZCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ01vZGFsRGFzaGJvYXJkJyxcblxuICAgIG1peGluczogW0FjdGlvbkRpYWxvZ01peGluLCBTdWJtaXRCdXR0b25Qcm92aWRlck1peGluXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlhbG9nVGl0bGU6ICcnLFxuICAgICAgICAgICAgZGlhbG9nU2l6ZTogJ21kJyxcbiAgICAgICAgICAgIGRpYWxvZ1BhZGRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgZGlhbG9nSXNNb2RhbDogZmFsc2UsXG4gICAgICAgICAgICBkaWFsb2dTY3JvbGxCb2R5OiBmYWxzZVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBzdWJtaXQ6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgdGhpcy5kaXNtaXNzKCk7XG4gICAgfSxcblxuICAgIGdldERlZmF1bHRCdXR0b25zOiBmdW5jdGlvbiBnZXREZWZhdWx0QnV0dG9ucygpIHtcbiAgICAgICAgcmV0dXJuIFtSZWFjdC5jcmVhdGVFbGVtZW50KEZsYXRCdXR0b24sIHsgbGFiZWw6IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2hbODZdLCBvblRvdWNoVGFwOiB0aGlzLnByb3BzLm9uRGlzbWlzcyB9KV07XG4gICAgfSxcblxuICAgIGdldEJ1dHRvbnM6IGZ1bmN0aW9uIGdldEJ1dHRvbnModXBkYXRlcikge1xuICAgICAgICB0aGlzLl91cGRhdGVyID0gdXBkYXRlcjtcbiAgICAgICAgaWYgKHRoaXMucmVmc1sncHJvZmlsZSddKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZWZzWydwcm9maWxlJ10uZ2V0QnV0dG9ucyh0aGlzLl91cGRhdGVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERlZmF1bHRCdXR0b25zKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgb25UYWJDaGFuZ2U6IGZ1bmN0aW9uIG9uVGFiQ2hhbmdlKHZhbHVlKSB7XG4gICAgICAgIGlmICghdGhpcy5fdXBkYXRlcikgcmV0dXJuO1xuICAgICAgICBpZiAodmFsdWUgJiYgdGhpcy5yZWZzW3ZhbHVlXSAmJiB0aGlzLnJlZnNbdmFsdWVdLmdldEJ1dHRvbnMpIHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZXIodGhpcy5yZWZzW3ZhbHVlXS5nZXRCdXR0b25zKHRoaXMuX3VwZGF0ZXIpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZXIodGhpcy5nZXREZWZhdWx0QnV0dG9ucygpKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblxuICAgICAgICB2YXIgYnV0dG9uU3R5bGUgPSB7XG4gICAgICAgICAgICB0ZXh0VHJhbnNmb3JtOiAnbm9uZSdcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHRhYnMgPSBbUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgIFRhYixcbiAgICAgICAgICAgIHsga2V5OiAnYWNjb3VudCcsIGxhYmVsOiB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoWyd1c2VyX2Rhc2guNDMnXSwgaWNvbjogUmVhY3QuY3JlYXRlRWxlbWVudChGb250SWNvbiwgeyBjbGFzc05hbWU6ICdtZGkgbWRpLWFjY291bnQnIH0pLCBidXR0b25TdHlsZTogYnV0dG9uU3R5bGUsIHZhbHVlOiAncHJvZmlsZScgfSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX1Byb2ZpbGVQYW5lMlsnZGVmYXVsdCddLCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcywgeyByZWY6ICdwcm9maWxlJyB9KSlcbiAgICAgICAgKV07XG5cbiAgICAgICAgX0NvbXBvbmVudENvbmZpZ1BhcnNlcjJbJ2RlZmF1bHQnXS5nZXRBY2NvdW50VGFicyh0aGlzLnByb3BzLnB5ZGlvKS5tYXAoKGZ1bmN0aW9uICh0YWIpIHtcbiAgICAgICAgICAgIHRhYnMucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIFRhYixcbiAgICAgICAgICAgICAgICB7IGtleTogdGFiLmlkLCBsYWJlbDogdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFt0YWIudGFiSW5mby5sYWJlbF0sIGljb246IFJlYWN0LmNyZWF0ZUVsZW1lbnQoRm9udEljb24sIHsgY2xhc3NOYW1lOiB0YWIudGFiSW5mby5pY29uIH0pLCBidXR0b25TdHlsZTogYnV0dG9uU3R5bGUsIHZhbHVlOiB0YWIuaWQgfSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEFzeW5jQ29tcG9uZW50LCBfZXh0ZW5kcyh7XG4gICAgICAgICAgICAgICAgICAgIHJlZjogdGFiLmlkXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5wcm9wcywgdGFiLnBhbmVJbmZvKSlcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcblxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgIFRhYnMsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgd2lkdGg6ICcxMDAlJyB9LFxuICAgICAgICAgICAgICAgIHRhYkl0ZW1Db250YWluZXJTdHlsZTogeyBtaW5IZWlnaHQ6IDcyIH0sXG4gICAgICAgICAgICAgICAgY29udGVudENvbnRhaW5lclN0eWxlOiB7IG92ZXJmbG93WTogJ2F1dG8nLCBtaW5IZWlnaHQ6IDM1MCB9LFxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uVGFiQ2hhbmdlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGFic1xuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IE1vZGFsRGFzaGJvYXJkO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKFwicHlkaW9cIik7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX3B5ZGlvSHR0cEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cEFwaSk7XG5cbnZhciBfY2VsbHNTZGsgPSByZXF1aXJlKCdjZWxscy1zZGsnKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMltcImRlZmF1bHRcIl0ucmVxdWlyZUxpYignZm9ybScpO1xuXG52YXIgVmFsaWRQYXNzd29yZCA9IF9QeWRpbyRyZXF1aXJlTGliLlZhbGlkUGFzc3dvcmQ7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYjIgPSBfcHlkaW8yW1wiZGVmYXVsdFwiXS5yZXF1aXJlTGliKFwiaG9jXCIpO1xuXG52YXIgTW9kZXJuVGV4dEZpZWxkID0gX1B5ZGlvJHJlcXVpcmVMaWIyLk1vZGVyblRleHRGaWVsZDtcblxudmFyIFBhc3N3b3JkRm9ybSA9IF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogXCJQYXNzd29yZEZvcm1cIixcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4geyBlcnJvcjogbnVsbCwgb2xkOiAnJywgbmV3UGFzczogJycgfTtcbiAgICB9LFxuXG4gICAgZ2V0TWVzc2FnZTogZnVuY3Rpb24gZ2V0TWVzc2FnZShpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFtpZF07XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKHZhbHVlLCBmaWVsZCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBuZXdTdGF0dXMgPSB7fTtcbiAgICAgICAgbmV3U3RhdHVzW2ZpZWxkXSA9IHZhbHVlO1xuICAgICAgICB0aGlzLnNldFN0YXRlKG5ld1N0YXR1cywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHN0YXR1cyA9IF90aGlzLnZhbGlkYXRlKCk7XG4gICAgICAgICAgICBpZiAoX3RoaXMucHJvcHMub25WYWxpZFN0YXR1c0NoYW5nZSkge1xuICAgICAgICAgICAgICAgIF90aGlzLnByb3BzLm9uVmFsaWRTdGF0dXNDaGFuZ2Uoc3RhdHVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHZhbGlkYXRlOiBmdW5jdGlvbiB2YWxpZGF0ZSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnJlZnMubmV3cGFzcy5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgdmFyIG9sZFBhc3MgPSBfc3RhdGUub2xkUGFzcztcbiAgICAgICAgdmFyIG5ld1Bhc3MgPSBfc3RhdGUubmV3UGFzcztcblxuICAgICAgICBpZiAoIW9sZFBhc3MgfHwgIW5ld1Bhc3MpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcjogdGhpcy5nZXRNZXNzYWdlKDIzOSkgfSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5ld1Bhc3MubGVuZ3RoIDwgcGFyc2VJbnQodGhpcy5wcm9wcy5weWRpby5nZXRQbHVnaW5Db25maWdzKFwiY29yZS5hdXRoXCIpLmdldChcIlBBU1NXT1JEX01JTkxFTkdUSFwiKSkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcjogdGhpcy5nZXRNZXNzYWdlKDM3OCkgfSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yOiBudWxsIH0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgcG9zdDogZnVuY3Rpb24gcG9zdChjYWxsYmFjaykge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICB2YXIgX3N0YXRlMiA9IHRoaXMuc3RhdGU7XG4gICAgICAgIHZhciBvbGRQYXNzID0gX3N0YXRlMi5vbGRQYXNzO1xuICAgICAgICB2YXIgbmV3UGFzcyA9IF9zdGF0ZTIubmV3UGFzcztcbiAgICAgICAgdmFyIHB5ZGlvID0gdGhpcy5wcm9wcy5weWRpbztcblxuICAgICAgICB2YXIgbG9nb3V0U3RyaW5nID0gJyc7XG4gICAgICAgIGlmIChweWRpby51c2VyLmxvY2spIHtcbiAgICAgICAgICAgIGxvZ291dFN0cmluZyA9ICcgJyArIHRoaXMuZ2V0TWVzc2FnZSg0NDUpO1xuICAgICAgICB9XG4gICAgICAgIHB5ZGlvLnVzZXIuZ2V0SWRtVXNlcigpLnRoZW4oZnVuY3Rpb24gKGlkbVVzZXIpIHtcbiAgICAgICAgICAgIHZhciB1cGRhdGVVc2VyID0gX2NlbGxzU2RrLklkbVVzZXIuY29uc3RydWN0RnJvbU9iamVjdChKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGlkbVVzZXIpKSk7XG4gICAgICAgICAgICB1cGRhdGVVc2VyLk9sZFBhc3N3b3JkID0gb2xkUGFzcztcbiAgICAgICAgICAgIHVwZGF0ZVVzZXIuUGFzc3dvcmQgPSBuZXdQYXNzO1xuICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfY2VsbHNTZGsuVXNlclNlcnZpY2VBcGkoX3B5ZGlvSHR0cEFwaTJbXCJkZWZhdWx0XCJdLmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgICAgICBhcGkucHV0VXNlcih1cGRhdGVVc2VyLkxvZ2luLCB1cGRhdGVVc2VyKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBweWRpby5kaXNwbGF5TWVzc2FnZSgnU1VDQ0VTUycsIF90aGlzMi5nZXRNZXNzYWdlKDE5NykgKyBsb2dvdXRTdHJpbmcpO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHRydWUpO1xuICAgICAgICAgICAgICAgIGlmIChsb2dvdXRTdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgcHlkaW8uZ2V0Q29udHJvbGxlcigpLmZpcmVBY3Rpb24oJ2xvZ291dCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5weWRpby51c2VyKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbWVzc2FnZXMgPSB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoO1xuICAgICAgICB2YXIgbGVnZW5kID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvcikge1xuICAgICAgICAgICAgbGVnZW5kID0gX3JlYWN0MltcImRlZmF1bHRcIl0uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBcImRpdlwiLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcImVycm9yXCIgfSxcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLmVycm9yXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMucHlkaW8udXNlci5sb2NrKSB7XG4gICAgICAgICAgICBsZWdlbmQgPSBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlc1s0NDRdXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHZhciBvbGRDaGFuZ2UgPSBmdW5jdGlvbiBvbGRDaGFuZ2UoZXZlbnQsIG5ld1YpIHtcbiAgICAgICAgICAgIF90aGlzMy51cGRhdGUobmV3ViwgJ29sZFBhc3MnKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIG5ld0NoYW5nZSA9IGZ1bmN0aW9uIG5ld0NoYW5nZShuZXdWLCBvbGRWKSB7XG4gICAgICAgICAgICBfdGhpczMudXBkYXRlKG5ld1YsICduZXdQYXNzJyk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgIHsgc3R5bGU6IHRoaXMucHJvcHMuc3R5bGUgfSxcbiAgICAgICAgICAgIGxlZ2VuZCxcbiAgICAgICAgICAgIF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgXCJkaXZcIixcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbXCJkZWZhdWx0XCJdLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIFwiZm9ybVwiLFxuICAgICAgICAgICAgICAgICAgICB7IGF1dG9Db21wbGV0ZTogXCJvZmZcIiB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KE1vZGVyblRleHRGaWVsZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IG9sZENoYW5nZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwicGFzc3dvcmRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLm9sZFBhc3MsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWY6IFwib2xkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsVGV4dDogbWVzc2FnZXNbMjM3XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZTogXCJvZmZcIlxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIFwiZGl2XCIsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogMjU2IH0gfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyW1wiZGVmYXVsdFwiXS5jcmVhdGVFbGVtZW50KFZhbGlkUGFzc3dvcmQsIHtcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IG5ld0NoYW5nZSxcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlczogeyBuYW1lOiAncGFzcycsIGxhYmVsOiBtZXNzYWdlc1sxOThdIH0sXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLm5ld1Bhc3MsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFwibmV3cGFzc3dvcmRcIixcbiAgICAgICAgICAgICAgICAgICAgcmVmOiBcIm5ld3Bhc3NcIlxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBQYXNzd29yZEZvcm07XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9QYXNzd29yZEZvcm0gPSByZXF1aXJlKCcuL1Bhc3N3b3JkRm9ybScpO1xuXG52YXIgX1Bhc3N3b3JkRm9ybTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9QYXNzd29yZEZvcm0pO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgRmxhdEJ1dHRvbiA9IF9yZXF1aXJlLkZsYXRCdXR0b247XG52YXIgUmFpc2VkQnV0dG9uID0gX3JlcXVpcmUuUmFpc2VkQnV0dG9uO1xudmFyIFBvcG92ZXIgPSBfcmVxdWlyZS5Qb3BvdmVyO1xudmFyIERpdmlkZXIgPSBfcmVxdWlyZS5EaXZpZGVyO1xuXG52YXIgUHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgUGFzc3dvcmRQb3BvdmVyID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFBhc3N3b3JkUG9wb3ZlciwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBQYXNzd29yZFBvcG92ZXIocHJvcHMsIGNvbnRleHQpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFBhc3N3b3JkUG9wb3Zlcik7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoUGFzc3dvcmRQb3BvdmVyLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMsIGNvbnRleHQpO1xuICAgICAgICB0aGlzLnN0YXRlID0geyBwYXNzT3BlbjogZmFsc2UsIHBhc3NWYWxpZDogZmFsc2UsIHBhc3NBbmNob3I6IG51bGwgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoUGFzc3dvcmRQb3BvdmVyLCBbe1xuICAgICAgICBrZXk6ICdwYXNzT3BlblBvcG92ZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcGFzc09wZW5Qb3BvdmVyKGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcGFzc09wZW46IHRydWUsIHBhc3NBbmNob3I6IGV2ZW50LmN1cnJlbnRUYXJnZXQgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Bhc3NDbG9zZVBvcG92ZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcGFzc0Nsb3NlUG9wb3ZlcigpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwYXNzT3BlbjogZmFsc2UgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Bhc3NWYWxpZFN0YXR1c0NoYW5nZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwYXNzVmFsaWRTdGF0dXNDaGFuZ2Uoc3RhdHVzKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcGFzc1ZhbGlkOiBzdGF0dXMgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Bhc3NTdWJtaXQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcGFzc1N1Ym1pdCgpIHtcbiAgICAgICAgICAgIHRoaXMucmVmcy5wYXNzd29yZEZvcm0ucG9zdCgoZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlKSB0aGlzLnBhc3NDbG9zZVBvcG92ZXIoKTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gdGhpcy5wcm9wcy5weWRpbztcbiAgICAgICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgdmFyIHBhc3NPcGVuID0gX3N0YXRlLnBhc3NPcGVuO1xuICAgICAgICAgICAgdmFyIHBhc3NBbmNob3IgPSBfc3RhdGUucGFzc0FuY2hvcjtcbiAgICAgICAgICAgIHZhciBwYXNzVmFsaWQgPSBfc3RhdGUucGFzc1ZhbGlkO1xuXG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IG1hcmdpbkxlZnQ6IDggfSB9LFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmFpc2VkQnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uVG91Y2hUYXA6IHRoaXMucGFzc09wZW5Qb3BvdmVyLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsxOTRdLFxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiB0cnVlXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgUG9wb3ZlcixcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogcGFzc09wZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmNob3JFbDogcGFzc0FuY2hvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuY2hvck9yaWdpbjogeyBob3Jpem9udGFsOiAnbGVmdCcsIHZlcnRpY2FsOiAndG9wJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0T3JpZ2luOiB7IGhvcml6b250YWw6ICdsZWZ0JywgdmVydGljYWw6ICdib3R0b20nIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvblJlcXVlc3RDbG9zZTogdGhpcy5wYXNzQ2xvc2VQb3BvdmVyLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgICAgICB6RGVwdGg6IDJcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX1Bhc3N3b3JkRm9ybTJbJ2RlZmF1bHQnXSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IHBhZGRpbmc6IDEwLCBiYWNrZ3JvdW5kQ29sb3I6ICcjZmFmYWZhJywgcGFkZGluZ0JvdHRvbTogMzAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiAncGFzc3dvcmRGb3JtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblZhbGlkU3RhdHVzQ2hhbmdlOiB0aGlzLnBhc3NWYWxpZFN0YXR1c0NoYW5nZS5iaW5kKHRoaXMpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRGl2aWRlciwgbnVsbCksXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgdGV4dEFsaWduOiAncmlnaHQnLCBwYWRkaW5nOiAnOHB4IDAnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEZsYXRCdXR0b24sIHsgbGFiZWw6IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2hbNDldLCBvblRvdWNoVGFwOiB0aGlzLnBhc3NDbG9zZVBvcG92ZXIuYmluZCh0aGlzKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEZsYXRCdXR0b24sIHsgZGlzYWJsZWQ6ICFwYXNzVmFsaWQsIGxhYmVsOiAnT2snLCBvblRvdWNoVGFwOiB0aGlzLnBhc3NTdWJtaXQuYmluZCh0aGlzKSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBQYXNzd29yZFBvcG92ZXI7XG59KShSZWFjdC5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBQYXNzd29yZFBvcG92ZXI7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX1Bhc3N3b3JkUG9wb3ZlciA9IHJlcXVpcmUoJy4vUGFzc3dvcmRQb3BvdmVyJyk7XG5cbnZhciBfUGFzc3dvcmRQb3BvdmVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1Bhc3N3b3JkUG9wb3Zlcik7XG5cbnZhciBfRW1haWxQYW5lbCA9IHJlcXVpcmUoJy4vRW1haWxQYW5lbCcpO1xuXG52YXIgX0VtYWlsUGFuZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfRW1haWxQYW5lbCk7XG5cbnZhciBfcHlkaW9VdGlsTGFuZyA9IHJlcXVpcmUoXCJweWRpby91dGlsL2xhbmdcIik7XG5cbnZhciBfcHlkaW9VdGlsTGFuZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb1V0aWxMYW5nKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZShcIm1hdGVyaWFsLXVpXCIpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZShcInB5ZGlvXCIpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9weWRpb0h0dHBBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL2FwaScpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb0h0dHBBcGkpO1xuXG52YXIgX2NlbGxzU2RrID0gcmVxdWlyZSgnY2VsbHMtc2RrJyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdmb3JtJyk7XG5cbnZhciBNYW5hZ2VyID0gX1B5ZGlvJHJlcXVpcmVMaWIuTWFuYWdlcjtcbnZhciBGb3JtUGFuZWwgPSBfUHlkaW8kcmVxdWlyZUxpYi5Gb3JtUGFuZWw7XG5cbnZhciBGT1JNX0NTUyA9ICcgXFxuLnJlYWN0LW11aS1jb250ZXh0IC5jdXJyZW50LXVzZXItZWRpdC5weWRpby1mb3JtLXBhbmVsID4gLnB5ZGlvLWZvcm0tZ3JvdXA6Zmlyc3Qtb2YtdHlwZSB7XFxuICBtYXJnaW4tdG9wOiAyMzBweDtcXG4gIG92ZXJmbG93LXk6IGhpZGRlbjtcXG59XFxuLnJlYWN0LW11aS1jb250ZXh0IC5jdXJyZW50LXVzZXItZWRpdC5weWRpby1mb3JtLXBhbmVsID4gLnB5ZGlvLWZvcm0tZ3JvdXAgZGl2LmZvcm0tZW50cnktaW1hZ2Uge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAwO1xcbiAgbGVmdDogMDtcXG4gIHJpZ2h0OiAwO1xcbiAgaGVpZ2h0OiAyMjBweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNlY2VmZjE7XFxufVxcbi5yZWFjdC1tdWktY29udGV4dCAuY3VycmVudC11c2VyLWVkaXQucHlkaW8tZm9ybS1wYW5lbCAuZm9ybS1lbnRyeS1pbWFnZT5kaXY6bGFzdC1jaGlsZCB7XFxuICBtYXJnaW4tdG9wOiAwO1xcbn1cXG5cXG4ucmVhY3QtbXVpLWNvbnRleHQgLmN1cnJlbnQtdXNlci1lZGl0LnB5ZGlvLWZvcm0tcGFuZWwgPiAucHlkaW8tZm9ybS1ncm91cCBkaXYuZm9ybS1lbnRyeS1pbWFnZSA+IGRpdjpmaXJzdC1jaGlsZCB7XFxuICBwYWRkaW5nOiAwO1xcbiAgYm9yZGVyLXJhZGl1czogMDtcXG59XFxuLnJlYWN0LW11aS1jb250ZXh0IC5jdXJyZW50LXVzZXItZWRpdC5weWRpby1mb3JtLXBhbmVsID4gLnB5ZGlvLWZvcm0tZ3JvdXAgZGl2LmZvcm0tZW50cnktaW1hZ2UgLmltYWdlLWxhYmVsLFxcbi5yZWFjdC1tdWktY29udGV4dCAuY3VycmVudC11c2VyLWVkaXQucHlkaW8tZm9ybS1wYW5lbCA+IC5weWRpby1mb3JtLWdyb3VwIGRpdi5mb3JtLWVudHJ5LWltYWdlIC5mb3JtLWxlZ2VuZCB7XFxuICBkaXNwbGF5OiBub25lO1xcbn1cXG4ucmVhY3QtbXVpLWNvbnRleHQgLmN1cnJlbnQtdXNlci1lZGl0LnB5ZGlvLWZvcm0tcGFuZWwgPiAucHlkaW8tZm9ybS1ncm91cCBkaXYuZm9ybS1lbnRyeS1pbWFnZSAuZmlsZS1kcm9wem9uZSB7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB3aWR0aDogMTYwcHggIWltcG9ydGFudDtcXG4gIGhlaWdodDogMTYwcHggIWltcG9ydGFudDtcXG4gIG1hcmdpbjogMjBweCBhdXRvO1xcbn1cXG4ucmVhY3QtbXVpLWNvbnRleHQgLmN1cnJlbnQtdXNlci1lZGl0LnB5ZGlvLWZvcm0tcGFuZWwgPiAucHlkaW8tZm9ybS1ncm91cCBkaXYuZm9ybS1lbnRyeS1pbWFnZSAuYmluYXJ5LXJlbW92ZS1idXR0b24ge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgYm90dG9tOiA1cHg7XFxuICByaWdodDogMDtcXG59XFxuXFxuJztcblxudmFyIFByb2ZpbGVQYW5lID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1Byb2ZpbGVQYW5lJyxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICB2YXIgb2JqVmFsdWVzID0ge30sXG4gICAgICAgICAgICBtYWlsVmFsdWVzID0ge307XG4gICAgICAgIHZhciBweWRpbyA9IHRoaXMucHJvcHMucHlkaW87XG4gICAgICAgIGlmIChweWRpby51c2VyKSB7XG4gICAgICAgICAgICBweWRpby51c2VyLnByZWZlcmVuY2VzLmZvckVhY2goZnVuY3Rpb24gKHYsIGspIHtcbiAgICAgICAgICAgICAgICBpZiAoayA9PT0gJ2d1aV9wcmVmZXJlbmNlcycpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvYmpWYWx1ZXNba10gPSB2O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRlZmluaXRpb25zOiBNYW5hZ2VyLnBhcnNlUGFyYW1ldGVycyhweWRpby5nZXRYbWxSZWdpc3RyeSgpLCBcInVzZXIvcHJlZmVyZW5jZXMvcHJlZltAZXhwb3NlZD0ndHJ1ZSddfC8vcGFyYW1bY29udGFpbnMoQHNjb3BlLCd1c2VyJykgYW5kIEBleHBvc2U9J3RydWUnIGFuZCBub3QoY29udGFpbnMoQG5hbWUsICdOT1RJRklDQVRJT05TX0VNQUlMJykpXVwiKSxcbiAgICAgICAgICAgIG1haWxEZWZpbml0aW9uczogTWFuYWdlci5wYXJzZVBhcmFtZXRlcnMocHlkaW8uZ2V0WG1sUmVnaXN0cnkoKSwgXCJ1c2VyL3ByZWZlcmVuY2VzL3ByZWZbQGV4cG9zZWQ9J3RydWUnXXwvL3BhcmFtW2NvbnRhaW5zKEBzY29wZSwndXNlcicpIGFuZCBAZXhwb3NlPSd0cnVlJyBhbmQgY29udGFpbnMoQG5hbWUsICdOT1RJRklDQVRJT05TX0VNQUlMJyldXCIpLFxuICAgICAgICAgICAgdmFsdWVzOiBvYmpWYWx1ZXMsXG4gICAgICAgICAgICBvcmlnaW5hbFZhbHVlczogX3B5ZGlvVXRpbExhbmcyWydkZWZhdWx0J10uZGVlcENvcHkob2JqVmFsdWVzKSxcbiAgICAgICAgICAgIGRpcnR5OiBmYWxzZVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBvbkZvcm1DaGFuZ2U6IGZ1bmN0aW9uIG9uRm9ybUNoYW5nZShuZXdWYWx1ZXMsIGRpcnR5LCByZW1vdmVWYWx1ZXMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB2YXIgdmFsdWVzID0gdGhpcy5zdGF0ZS52YWx1ZXM7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGRpcnR5OiBkaXJ0eSwgdmFsdWVzOiBuZXdWYWx1ZXMgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKF90aGlzLl91cGRhdGVyKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuX3VwZGF0ZXIoX3RoaXMuZ2V0QnV0dG9ucygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChfdGhpcy5wcm9wcy5zYXZlT25DaGFuZ2UgfHwgbmV3VmFsdWVzWydhdmF0YXInXSAhPT0gdmFsdWVzWydhdmF0YXInXSkge1xuICAgICAgICAgICAgICAgIF90aGlzLnNhdmVGb3JtKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBnZXRCdXR0b25zOiBmdW5jdGlvbiBnZXRCdXR0b25zKCkge1xuICAgICAgICB2YXIgdXBkYXRlciA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbMF07XG5cbiAgICAgICAgaWYgKHVwZGF0ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZXIgPSB1cGRhdGVyO1xuICAgICAgICB9XG4gICAgICAgIHZhciBidXR0b24gPSB1bmRlZmluZWQsXG4gICAgICAgICAgICByZXZlcnQgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmRpcnR5KSB7XG4gICAgICAgICAgICByZXZlcnQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGxhYmVsOiB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoWzYyOF0sIG9uVG91Y2hUYXA6IHRoaXMucmV2ZXJ0IH0pO1xuICAgICAgICAgICAgYnV0dG9uID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBsYWJlbDogdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFs1M10sIHNlY29uZGFyeTogdHJ1ZSwgb25Ub3VjaFRhcDogdGhpcy5zYXZlRm9ybSB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJ1dHRvbiA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgbGFiZWw6IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2hbODZdLCBvblRvdWNoVGFwOiB0aGlzLnByb3BzLm9uRGlzbWlzcyB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wcm9wcy5weWRpby5Db250cm9sbGVyLmdldEFjdGlvbkJ5TmFtZSgncGFzc19jaGFuZ2UnKSkge1xuICAgICAgICAgICAgcmV0dXJuIFtfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4Jywgd2lkdGg6ICcxMDAlJyB9IH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX1Bhc3N3b3JkUG9wb3ZlcjJbJ2RlZmF1bHQnXSwgdGhpcy5wcm9wcyksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IHN0eWxlOiB7IGZsZXg6IDEgfSB9KSxcbiAgICAgICAgICAgICAgICByZXZlcnQsXG4gICAgICAgICAgICAgICAgYnV0dG9uXG4gICAgICAgICAgICApXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBbYnV0dG9uXTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZXZlcnQ6IGZ1bmN0aW9uIHJldmVydCgpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB2YWx1ZXM6IF9leHRlbmRzKHt9LCB0aGlzLnN0YXRlLm9yaWdpbmFsVmFsdWVzKSxcbiAgICAgICAgICAgIGRpcnR5OiBmYWxzZVxuICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMyLl91cGRhdGVyKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMyLl91cGRhdGVyKF90aGlzMi5nZXRCdXR0b25zKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgc2F2ZUZvcm06IGZ1bmN0aW9uIHNhdmVGb3JtKCkge1xuICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZGlydHkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBkaXJ0eTogZmFsc2UgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHB5ZGlvID0gdGhpcy5wcm9wcy5weWRpbztcbiAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIHZhciBkZWZpbml0aW9ucyA9IF9zdGF0ZS5kZWZpbml0aW9ucztcbiAgICAgICAgdmFyIHZhbHVlcyA9IF9zdGF0ZS52YWx1ZXM7XG5cbiAgICAgICAgcHlkaW8udXNlci5nZXRJZG1Vc2VyKCkudGhlbihmdW5jdGlvbiAoaWRtVXNlcikge1xuICAgICAgICAgICAgaWYgKCFpZG1Vc2VyLkF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgICAgICBpZG1Vc2VyLkF0dHJpYnV0ZXMgPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmluaXRpb25zLmZvckVhY2goZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWVzW2QubmFtZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChkLnNjb3BlID09PSBcInVzZXJcIikge1xuICAgICAgICAgICAgICAgICAgICBpZG1Vc2VyLkF0dHJpYnV0ZXNbZC5uYW1lXSA9IHZhbHVlc1tkLm5hbWVdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlkbVVzZXIuQXR0cmlidXRlc1tcInBhcmFtZXRlcjpcIiArIGQucGx1Z2luSWQgKyBcIjpcIiArIGQubmFtZV0gPSBKU09OLnN0cmluZ2lmeSh2YWx1ZXNbZC5uYW1lXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgY2hhbmdlTGFuZyA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKHZhbHVlc1snbGFuZyddICYmIHZhbHVlc1snbGFuZyddICE9PSBweWRpby5jdXJyZW50TGFuZ3VhZ2UpIHtcbiAgICAgICAgICAgICAgICBweWRpby51c2VyLnNldFByZWZlcmVuY2UoJ2xhbmcnLCB2YWx1ZXNbJ2xhbmcnXSk7XG4gICAgICAgICAgICAgICAgY2hhbmdlTGFuZyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9jZWxsc1Nkay5Vc2VyU2VydmljZUFwaShfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgICAgICByZXR1cm4gYXBpLnB1dFVzZXIoaWRtVXNlci5Mb2dpbiwgaWRtVXNlcikudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2hhbmdlTGFuZykge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZWxvYWQgZm9ybSBhZnRlciByZWdpc3RyeSByZWxvYWRcbiAgICAgICAgICAgICAgICAgICAgcHlkaW8ub2JzZXJ2ZU9uY2UoJ3JlZ2lzdHJ5X2xvYWRlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmaW5pdGlvbnM6IE1hbmFnZXIucGFyc2VQYXJhbWV0ZXJzKHB5ZGlvLmdldFhtbFJlZ2lzdHJ5KCksIFwidXNlci9wcmVmZXJlbmNlcy9wcmVmW0BleHBvc2VkPSd0cnVlJ118Ly9wYXJhbVtjb250YWlucyhAc2NvcGUsJ3VzZXInKSBhbmQgQGV4cG9zZT0ndHJ1ZScgYW5kIG5vdChjb250YWlucyhAbmFtZSwgJ05PVElGSUNBVElPTlNfRU1BSUwnKSldXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1haWxEZWZpbml0aW9uczogTWFuYWdlci5wYXJzZVBhcmFtZXRlcnMocHlkaW8uZ2V0WG1sUmVnaXN0cnkoKSwgXCJ1c2VyL3ByZWZlcmVuY2VzL3ByZWZbQGV4cG9zZWQ9J3RydWUnXXwvL3BhcmFtW2NvbnRhaW5zKEBzY29wZSwndXNlcicpIGFuZCBAZXhwb3NlPSd0cnVlJyBhbmQgY29udGFpbnMoQG5hbWUsICdOT1RJRklDQVRJT05TX0VNQUlMJyldXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHB5ZGlvLnJlZnJlc2hVc2VyRGF0YSgpO1xuICAgICAgICAgICAgICAgIF90aGlzMy5zZXRTdGF0ZSh7IGRpcnR5OiBmYWxzZSB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfdGhpczMuX3VwZGF0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMy5fdXBkYXRlcihfdGhpczMuZ2V0QnV0dG9ucygpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcbiAgICAgICAgdmFyIG1pbmlEaXNwbGF5ID0gX3Byb3BzLm1pbmlEaXNwbGF5O1xuXG4gICAgICAgIGlmICghcHlkaW8udXNlcikge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIF9zdGF0ZTIgPSB0aGlzLnN0YXRlO1xuICAgICAgICB2YXIgZGVmaW5pdGlvbnMgPSBfc3RhdGUyLmRlZmluaXRpb25zO1xuICAgICAgICB2YXIgdmFsdWVzID0gX3N0YXRlMi52YWx1ZXM7XG5cbiAgICAgICAgaWYgKG1pbmlEaXNwbGF5KSB7XG4gICAgICAgICAgICBkZWZpbml0aW9ucyA9IGRlZmluaXRpb25zLmZpbHRlcihmdW5jdGlvbiAobykge1xuICAgICAgICAgICAgICAgIHJldHVybiBbJ2F2YXRhciddLmluZGV4T2Yoby5uYW1lKSAhPT0gLTE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChGb3JtUGFuZWwsIHtcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdjdXJyZW50LXVzZXItZWRpdCcsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczogZGVmaW5pdGlvbnMsXG4gICAgICAgICAgICAgICAgdmFsdWVzOiB2YWx1ZXMsXG4gICAgICAgICAgICAgICAgZGVwdGg6IC0xLFxuICAgICAgICAgICAgICAgIGJpbmFyeV9jb250ZXh0OiBcInVzZXJfaWQ9XCIgKyBweWRpby51c2VyLmlkICsgKHZhbHVlc1snYXZhdGFyJ10gPyBcIj9cIiArIHZhbHVlc1snYXZhdGFyJ10gOiAnJyksXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25Gb3JtQ2hhbmdlXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzdHlsZScsIHsgdHlwZTogJ3RleHQvY3NzJywgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw6IHsgX19odG1sOiBGT1JNX0NTUyB9IH0pXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gUHJvZmlsZVBhbmU7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9Qcm9maWxlUGFuZSA9IHJlcXVpcmUoJy4vUHJvZmlsZVBhbmUnKTtcblxudmFyIF9Qcm9maWxlUGFuZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Qcm9maWxlUGFuZSk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2Jvb3QnKTtcblxudmFyIEFjdGlvbkRpYWxvZ01peGluID0gX1B5ZGlvJHJlcXVpcmVMaWIuQWN0aW9uRGlhbG9nTWl4aW47XG52YXIgQ2FuY2VsQnV0dG9uUHJvdmlkZXJNaXhpbiA9IF9QeWRpbyRyZXF1aXJlTGliLkNhbmNlbEJ1dHRvblByb3ZpZGVyTWl4aW47XG52YXIgU3VibWl0QnV0dG9uUHJvdmlkZXJNaXhpbiA9IF9QeWRpbyRyZXF1aXJlTGliLlN1Ym1pdEJ1dHRvblByb3ZpZGVyTWl4aW47XG5cbi8qKlxuICogU2FtcGxlIERpYWxvZyBjbGFzcyB1c2VkIGZvciByZWZlcmVuY2Ugb25seSwgcmVhZHkgdG8gYmVcbiAqIGNvcHkvcGFzdGVkIDotKVxuICovXG5leHBvcnRzWydkZWZhdWx0J10gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnV2VsY29tZU1vZGFsJyxcblxuICAgIG1peGluczogW0FjdGlvbkRpYWxvZ01peGluLCBDYW5jZWxCdXR0b25Qcm92aWRlck1peGluXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlhbG9nVGl0bGU6ICcnLFxuICAgICAgICAgICAgZGlhbG9nSXNNb2RhbDogdHJ1ZSxcbiAgICAgICAgICAgIGRpYWxvZ1NpemU6ICdzbScsXG4gICAgICAgICAgICBkaWFsb2dQYWRkaW5nOiAwXG4gICAgICAgIH07XG4gICAgfSxcbiAgICBjbG9zZTogZnVuY3Rpb24gY2xvc2Uoc2tpcCkge1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uUmVxdWVzdFN0YXJ0KSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uUmVxdWVzdFN0YXJ0KHNraXApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJvcHMub25EaXNtaXNzKCk7XG4gICAgfSxcbiAgICBnZXRNZXNzYWdlOiBmdW5jdGlvbiBnZXRNZXNzYWdlKGlkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoWydhamF4X2d1aS50b3VyLndlbGNvbWVtb2RhbC4nICsgaWRdO1xuICAgIH0sXG4gICAgZ2V0QnV0dG9uczogZnVuY3Rpb24gZ2V0QnV0dG9ucygpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICByZXR1cm4gW19yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgbGFiZWw6IHRoaXMuZ2V0TWVzc2FnZSgnc2tpcCcpLCBvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuY2xvc2UodHJ1ZSk7XG4gICAgICAgICAgICB9IH0pLCBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGxhYmVsOiB0aGlzLmdldE1lc3NhZ2UoJ3N0YXJ0JyksIHByaW1hcnk6IHRydWUsIG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuY2xvc2UoZmFsc2UpO1xuICAgICAgICAgICAgfSB9KV07XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwb3NpdGlvbjogJ3JlbGF0aXZlJywgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiAyMjAsIG92ZXJmbG93OiAnaGlkZGVuJywgYmFja2dyb3VuZENvbG9yOiAnI2VjZWZmMScgfSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9Qcm9maWxlUGFuZTJbJ2RlZmF1bHQnXSwgX2V4dGVuZHMoeyBtaW5pRGlzcGxheTogdHJ1ZSB9LCB0aGlzLnByb3BzLCB7IHNhdmVPbkNoYW5nZTogdHJ1ZSB9KSlcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5DYXJkVGl0bGUsIHsgdGl0bGU6IHRoaXMuZ2V0TWVzc2FnZSgndGl0bGUnKSwgc3VidGl0bGU6IHRoaXMuZ2V0TWVzc2FnZSgnc3VidGl0bGUnKSB9KVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX0NhbGxiYWNrcyA9IHJlcXVpcmUoJy4vQ2FsbGJhY2tzJyk7XG5cbnZhciBfQ2FsbGJhY2tzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NhbGxiYWNrcyk7XG5cbnZhciBfTW9kYWxEYXNoYm9hcmQgPSByZXF1aXJlKCcuL01vZGFsRGFzaGJvYXJkJyk7XG5cbnZhciBfTW9kYWxEYXNoYm9hcmQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfTW9kYWxEYXNoYm9hcmQpO1xuXG52YXIgX01vZGFsQWRkcmVzc0Jvb2sgPSByZXF1aXJlKCcuL01vZGFsQWRkcmVzc0Jvb2snKTtcblxudmFyIF9Nb2RhbEFkZHJlc3NCb29rMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX01vZGFsQWRkcmVzc0Jvb2spO1xuXG52YXIgX1dlbGNvbWVNb2RhbCA9IHJlcXVpcmUoJy4vV2VsY29tZU1vZGFsJyk7XG5cbnZhciBfV2VsY29tZU1vZGFsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1dlbGNvbWVNb2RhbCk7XG5cbnZhciBfUGFzc3dvcmRGb3JtID0gcmVxdWlyZSgnLi9QYXNzd29yZEZvcm0nKTtcblxudmFyIF9QYXNzd29yZEZvcm0yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfUGFzc3dvcmRGb3JtKTtcblxudmFyIENhbGxiYWNrcyA9ICgwLCBfQ2FsbGJhY2tzMlsnZGVmYXVsdCddKSh3aW5kb3cucHlkaW8pO1xuXG5leHBvcnRzLkNhbGxiYWNrcyA9IENhbGxiYWNrcztcbmV4cG9ydHMuTW9kYWxEYXNoYm9hcmQgPSBfTW9kYWxEYXNoYm9hcmQyWydkZWZhdWx0J107XG5leHBvcnRzLk1vZGFsQWRkcmVzc0Jvb2sgPSBfTW9kYWxBZGRyZXNzQm9vazJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuV2VsY29tZU1vZGFsID0gX1dlbGNvbWVNb2RhbDJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuUGFzc3dvcmRGb3JtID0gX1Bhc3N3b3JkRm9ybTJbJ2RlZmF1bHQnXTtcbiJdfQ==
