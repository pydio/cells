(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.UserAccount = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var React = require('react');
var Pydio = require('pydio');

var _require = require('material-ui');

var TextField = _require.TextField;

var _Pydio$requireLib = Pydio.requireLib('form');

var ValidPassword = _Pydio$requireLib.ValidPassword;

var PasswordForm = React.createClass({
    displayName: 'PasswordForm',

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
        var _state2 = this.state;
        var oldPass = _state2.oldPass;
        var newPass = _state2.newPass;

        var logoutString = '';
        if (this.props.pydio.user.lock) {
            logoutString = ' ' + this.getMessage(445);
        }
        PydioApi.getClient().request({
            get_action: 'pass_change',
            old_pass: oldPass,
            new_pass: newPass,
            pass_seed: '-1'
        }, (function (transport) {

            if (transport.responseText === 'PASS_ERROR') {

                this.setState({ error: this.getMessage(240) });
                callback(false);
            } else if (transport.responseText === 'SUCCESS') {

                this.props.pydio.displayMessage('SUCCESS', this.getMessage(197) + logoutString);
                callback(true);
                if (logoutString) {
                    this.props.pydio.getController().fireAction('logout');
                }
            }
        }).bind(this));
    },

    render: function render() {
        var _this2 = this;

        var messages = this.props.pydio.MessageHash;
        var legend = undefined;
        if (this.state.error) {
            legend = React.createElement(
                'div',
                { className: 'error' },
                this.state.error
            );
        } else if (this.props.pydio.user.lock) {
            legend = React.createElement(
                'div',
                null,
                messages[444]
            );
        }
        var oldChange = function oldChange(event, newV) {
            _this2.update(newV, 'oldPass');
        };
        var newChange = function newChange(newV, oldV) {
            _this2.update(newV, 'newPass');
        };
        return React.createElement(
            'div',
            { style: this.props.style },
            legend,
            React.createElement(
                'div',
                null,
                React.createElement(
                    'form',
                    { autoComplete: 'off' },
                    React.createElement(TextField, {
                        onChange: oldChange,
                        type: 'password',
                        value: this.state.oldPass,
                        ref: 'old',
                        floatingLabelText: messages[237],
                        autoComplete: 'off'
                    })
                )
            ),
            React.createElement(
                'div',
                { style: { width: 250 } },
                React.createElement(ValidPassword, {
                    onChange: newChange,
                    attributes: { name: 'pass', label: messages[198] },
                    value: this.state.newPass,
                    name: 'newpassword',
                    ref: 'newpass'
                })
            )
        );
    }

});

exports['default'] = PasswordForm;
module.exports = exports['default'];

},{"material-ui":"material-ui","pydio":"pydio","react":"react"}],7:[function(require,module,exports){
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

var _PasswordPopover = require('./PasswordPopover');

var _PasswordPopover2 = _interopRequireDefault(_PasswordPopover);

var _EmailPanel = require('./EmailPanel');

var _EmailPanel2 = _interopRequireDefault(_EmailPanel);

var React = require('react');
var LangUtils = require('pydio/util/lang');

var _require = require('material-ui');

var FlatButton = _require.FlatButton;
var Divider = _require.Divider;

var Pydio = require('pydio');

var _Pydio$requireLib = Pydio.requireLib('form');

var Manager = _Pydio$requireLib.Manager;
var FormPanel = _Pydio$requireLib.FormPanel;

var FORM_CSS = ' \n.react-mui-context .current-user-edit.pydio-form-panel > .pydio-form-group:first-of-type {\n  margin-top: 220px;\n  overflow-y: hidden;\n}\n.react-mui-context .current-user-edit.pydio-form-panel > .pydio-form-group div.form-entry-image {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  height: 200px;\n  background-color: #eceff1;\n}\n.react-mui-context .current-user-edit.pydio-form-panel > .pydio-form-group div.form-entry-image .image-label,\n.react-mui-context .current-user-edit.pydio-form-panel > .pydio-form-group div.form-entry-image .form-legend {\n  display: none;\n}\n.react-mui-context .current-user-edit.pydio-form-panel > .pydio-form-group div.form-entry-image .file-dropzone {\n  border-radius: 50%;\n  width: 160px !important;\n  height: 160px !important;\n  margin: 20px auto;\n}\n.react-mui-context .current-user-edit.pydio-form-panel > .pydio-form-group div.form-entry-image .binary-remove-button {\n  position: absolute;\n  bottom: 5px;\n  right: 0;\n}\n\n';

var ProfilePane = React.createClass({
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
            originalValues: LangUtils.deepCopy(objValues),
            dirty: false
        };
    },

    onFormChange: function onFormChange(newValues, dirty, removeValues) {
        var _this = this;

        this.setState({ dirty: dirty, values: newValues }, function () {
            if (_this._updater) {
                _this._updater(_this.getButtons());
            }
            if (_this.props.saveOnChange) {
                _this.saveForm();
            }
        });
    },

    getButtons: function getButtons() {
        var updater = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        if (updater) this._updater = updater;
        var button = undefined,
            revert = undefined;
        if (this.state.dirty) {
            revert = React.createElement(FlatButton, { label: this.props.pydio.MessageHash[628], onTouchTap: this.revert });
            button = React.createElement(FlatButton, { label: this.props.pydio.MessageHash[53], secondary: true, onTouchTap: this.saveForm });
        } else {
            button = React.createElement(FlatButton, { label: this.props.pydio.MessageHash[86], onTouchTap: this.props.onDismiss });
        }
        if (this.props.pydio.Controller.getActionByName('pass_change')) {
            return [React.createElement(
                'div',
                { style: { display: 'flex', width: '100%' } },
                React.createElement(_PasswordPopover2['default'], this.props),
                React.createElement('span', { style: { flex: 1 } }),
                revert,
                button
            )];
        } else {
            return [button];
        }
    },

    getButton: function getButton(actionName, messageId) {
        var pydio = this.props.pydio;
        if (!pydio.Controller.getActionByName(actionName)) {
            return null;
        }
        var func = function func() {
            pydio.Controller.fireAction(actionName);
        };
        return React.createElement(ReactMUI.RaisedButton, { label: pydio.MessageHash[messageId], onClick: func });
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
        if (!this.state.dirty) {
            this.setState({ dirty: false });
            return;
        }
        var pydio = this.props.pydio;
        var _state = this.state;
        var definitions = _state.definitions;
        var values = _state.values;

        var postValues = Manager.getValuesForPOST(definitions, values, 'PREFERENCES_');
        postValues['get_action'] = 'custom_data_edit';
        PydioApi.getClient().request(postValues, (function (transport) {
            var _this3 = this;

            PydioApi.getClient().parseXmlMessage(transport.responseXML);
            pydio.observeOnce('user_logged', function (userObject) {
                if (values.avatar && userObject.getPreference('avatar') !== values.avatar) {
                    _this3.setState({ values: _extends({}, values, { avatar: userObject.getPreference('avatar') }) });
                }
            });
            pydio.refreshUserData();
            this.setState({ dirty: false }, function () {
                if (_this3._updater) {
                    _this3._updater(_this3.getButtons());
                }
            });
        }).bind(this));
    },

    render: function render() {
        var _props = this.props;
        var pydio = _props.pydio;
        var miniDisplay = _props.miniDisplay;

        if (!pydio.user) return null;
        var _state2 = this.state;
        var definitions = _state2.definitions;
        var values = _state2.values;

        if (miniDisplay) {
            definitions = definitions.filter(function (o) {
                return ['avatar'].indexOf(o.name) !== -1;
            });
        }
        return React.createElement(
            'div',
            null,
            React.createElement(FormPanel, {
                className: 'current-user-edit',
                parameters: definitions,
                values: values,
                depth: -1,
                binary_context: "user_id=" + pydio.user.id,
                onChange: this.onFormChange
            }),
            React.createElement('style', { type: 'text/css', dangerouslySetInnerHTML: { __html: FORM_CSS } })
        );
    }

});

exports['default'] = ProfilePane;
module.exports = exports['default'];

},{"./EmailPanel":3,"./PasswordPopover":7,"material-ui":"material-ui","pydio":"pydio","pydio/util/lang":"pydio/util/lang","react":"react"}],9:[function(require,module,exports){
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
var React = require('react');

var _require = require('material-ui');

var Toggle = _require.Toggle;
var Divider = _require.Divider;
var TextField = _require.TextField;
var RaisedButton = _require.RaisedButton;

var _require$requireLib = require('pydio').requireLib('components');

var ClipboardTextField = _require$requireLib.ClipboardTextField;

var WebDAVPane = React.createClass({
    displayName: 'WebDAVPane',

    componentDidMount: function componentDidMount() {
        this.loadPrefs();
    },
    getMessage: function getMessage(id) {
        return this.props.pydio.MessageHash[id];
    },
    onToggleChange: function onToggleChange(event, newValue) {
        PydioApi.getClient().request({
            get_action: 'webdav_preferences',
            activate: newValue ? "true" : "false"
        }, (function (t) {
            this.setState({ preferences: t.responseJSON || {} });
            this.props.pydio.displayMessage("SUCCESS", this.props.pydio.MessageHash[newValue ? 408 : 409]);
        }).bind(this));
    },
    savePassword: function savePassword(event) {
        PydioApi.getClient().request({
            get_action: 'webdav_preferences',
            webdav_pass: this.refs['passfield'].getValue()
        }, (function (t) {
            this.setState({ preferences: t.responseJSON || {} });
            this.props.pydio.displayMessage("SUCCESS", this.props.pydio.MessageHash[410]);
        }).bind(this));
    },
    loadPrefs: function loadPrefs() {
        if (!this.isMounted()) return;
        PydioApi.getClient().request({
            get_action: 'webdav_preferences'
        }, (function (t) {
            this.setState({ preferences: t.responseJSON || {} });
        }).bind(this));
    },

    renderPasswordField: function renderPasswordField() {

        if (this.state.preferences.digest_set || !this.state.preferences.webdav_force_basic) {
            return null;
        }
        return React.createElement(
            'div',
            null,
            React.createElement(Divider, null),
            React.createElement(
                'div',
                { style: { padding: 16 } },
                React.createElement(
                    'div',
                    null,
                    this.getMessage(407)
                ),
                React.createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'baseline' } },
                    React.createElement(TextField, {
                        type: 'password',
                        floatingLabelText: this.getMessage(523),
                        ref: 'passfield',
                        style: { flex: 1, marginRight: 10 }
                    }),
                    React.createElement(RaisedButton, {
                        label: 'Save',
                        onClick: this.savePassword
                    })
                )
            ),
            React.createElement(Divider, null)
        );
    },

    renderUrls: function renderUrls() {
        var _this = this;

        var base = this.state.preferences.webdav_base_url;
        var otherUrls = [];
        var toggler = !!this.state.toggler;
        var pydio = this.props.pydio;
        var preferences = this.state.preferences;

        if (toggler) {
            (function () {
                var userRepos = pydio.user.getRepositoriesList();
                var webdavRepos = preferences.webdav_repositories;
                userRepos.forEach((function (repo, key) {
                    if (!webdavRepos[key]) return;
                    otherUrls.push(React.createElement(ClipboardTextField, { key: key, floatingLabelText: repo.getLabel(), inputValue: webdavRepos[key], getMessage: this.getMessage }));
                }).bind(_this));
            })();
        }

        return React.createElement(
            'div',
            null,
            React.createElement(
                'div',
                { style: { padding: 20 } },
                React.createElement(
                    'div',
                    null,
                    this.getMessage(405)
                ),
                React.createElement(ClipboardTextField, { floatingLabelText: this.getMessage(468), inputValue: base, getMessage: this.getMessage })
            ),
            toggler && React.createElement(Divider, null),
            React.createElement(
                'div',
                { style: { padding: 20 } },
                React.createElement(Toggle, { labelPosition: 'right', label: this.getMessage(465), onToggle: function () {
                        _this.setState({ toggler: !toggler });
                    }, toggled: toggler }),
                otherUrls
            )
        );
    },

    render: function render() {
        var webdavActive = this.state && this.state.preferences.webdav_active;
        return React.createElement(
            'div',
            { style: { fontSize: 14 } },
            React.createElement(
                'div',
                { style: { padding: 20 } },
                React.createElement(Toggle, {
                    labelPosition: 'right',
                    label: this.getMessage(406),
                    toggled: webdavActive,
                    onToggle: this.onToggleChange }),
                !webdavActive && React.createElement(
                    'div',
                    { style: { paddingTop: 20 } },
                    this.getMessage(404)
                )
            ),
            webdavActive && React.createElement(
                'div',
                null,
                React.createElement(Divider, null),
                this.renderPasswordField(),
                this.renderUrls()
            )
        );
    }

});

exports['default'] = WebDAVPane;
module.exports = exports['default'];

},{"material-ui":"material-ui","pydio":"pydio","react":"react"}],10:[function(require,module,exports){
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
                { style: { position: 'relative', width: '100%', height: 205, overflow: 'hidden', backgroundColor: '#eceff1' } },
                _react2['default'].createElement(_ProfilePane2['default'], _extends({ miniDisplay: true }, this.props, { saveOnChange: true }))
            ),
            _react2['default'].createElement(_materialUi.CardTitle, { title: this.getMessage('title'), subtitle: this.getMessage('subtitle') })
        );
    }

});
module.exports = exports['default'];

},{"./ProfilePane":8,"material-ui":"material-ui","pydio":"pydio","react":"react"}],11:[function(require,module,exports){
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

var _WebdavPane = require('./WebdavPane');

var _WebdavPane2 = _interopRequireDefault(_WebdavPane);

var _WelcomeModal = require('./WelcomeModal');

var _WelcomeModal2 = _interopRequireDefault(_WelcomeModal);

var _PasswordForm = require('./PasswordForm');

var _PasswordForm2 = _interopRequireDefault(_PasswordForm);

var Callbacks = (0, _Callbacks2['default'])(window.pydio);

exports.Callbacks = Callbacks;
exports.ModalDashboard = _ModalDashboard2['default'];
exports.ModalAddressBook = _ModalAddressBook2['default'];
exports.WebDAVPane = _WebdavPane2['default'];
exports.WelcomeModal = _WelcomeModal2['default'];
exports.PasswordForm = _PasswordForm2['default'];

},{"./Callbacks":1,"./ModalAddressBook":4,"./ModalDashboard":5,"./PasswordForm":6,"./WebdavPane":9,"./WelcomeModal":10}]},{},[11])(11)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvQ2FsbGJhY2tzLmpzIiwicmVzL2J1aWxkL0NvbXBvbmVudENvbmZpZ1BhcnNlci5qcyIsInJlcy9idWlsZC9FbWFpbFBhbmVsLmpzIiwicmVzL2J1aWxkL01vZGFsQWRkcmVzc0Jvb2suanMiLCJyZXMvYnVpbGQvTW9kYWxEYXNoYm9hcmQuanMiLCJyZXMvYnVpbGQvUGFzc3dvcmRGb3JtLmpzIiwicmVzL2J1aWxkL1Bhc3N3b3JkUG9wb3Zlci5qcyIsInJlcy9idWlsZC9Qcm9maWxlUGFuZS5qcyIsInJlcy9idWlsZC9XZWJkYXZQYW5lLmpzIiwicmVzL2J1aWxkL1dlbGNvbWVNb2RhbC5qcyIsInJlcy9idWlsZC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG52YXIgUmVzb3VyY2VzTWFuYWdlciA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvcmVzb3VyY2VzLW1hbmFnZXInKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gZnVuY3Rpb24gKHB5ZGlvKSB7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIG9wZW5EYXNoYm9hcmQ6IGZ1bmN0aW9uIG9wZW5EYXNoYm9hcmQoKSB7XG4gICAgICAgICAgICBSZXNvdXJjZXNNYW5hZ2VyLmxvYWRDbGFzc2VzQW5kQXBwbHkoWydQeWRpb0Zvcm0nXSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHB5ZGlvLlVJLm9wZW5Db21wb25lbnRJbk1vZGFsKCdVc2VyQWNjb3VudCcsICdNb2RhbERhc2hib2FyZCcpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb3BlbkFkZHJlc3NCb29rOiBmdW5jdGlvbiBvcGVuQWRkcmVzc0Jvb2soKSB7XG4gICAgICAgICAgICBSZXNvdXJjZXNNYW5hZ2VyLmxvYWRDbGFzc2VzQW5kQXBwbHkoWydQeWRpb0Zvcm0nLCAnUHlkaW9Db21wb25lbnRzJ10sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBweWRpby5VSS5vcGVuQ29tcG9uZW50SW5Nb2RhbCgnVXNlckFjY291bnQnLCAnTW9kYWxBZGRyZXNzQm9vaycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xudmFyIFhNTFV0aWxzID0gcmVxdWlyZSgncHlkaW8vdXRpbC94bWwnKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0ge1xuXG4gICAgZ2V0QWNjb3VudFRhYnM6IGZ1bmN0aW9uIGdldEFjY291bnRUYWJzKHB5ZGlvKSB7XG5cbiAgICAgICAgcmV0dXJuIFhNTFV0aWxzLlhQYXRoU2VsZWN0Tm9kZXMocHlkaW8uZ2V0WG1sUmVnaXN0cnkoKSwgJ2NsaWVudF9jb25maWdzL2NvbXBvbmVudF9jb25maWdbQGNvbXBvbmVudD1cIlVzZXJBY2NvdW50VGFic1wiXS9hZGRpdGlvbmFsX3RhYicpLm1hcChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpZDogbm9kZS5nZXRBdHRyaWJ1dGUoXCJpZFwiKSxcbiAgICAgICAgICAgICAgICB0YWJJbmZvOiBKU09OLnBhcnNlKG5vZGUuZ2V0QXR0cmlidXRlKCd0YWJJbmZvJykpLFxuICAgICAgICAgICAgICAgIHBhbmVJbmZvOiBKU09OLnBhcnNlKG5vZGUuZ2V0QXR0cmlidXRlKCdwYW5lSW5mbycpKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG59O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZXF1aXJlID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIENvbXBvbmVudCA9IF9yZXF1aXJlLkNvbXBvbmVudDtcbnZhciBQcm9wVHlwZXMgPSBfcmVxdWlyZS5Qcm9wVHlwZXM7XG5cbnZhciBfcmVxdWlyZTIgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgVG9nZ2xlID0gX3JlcXVpcmUyLlRvZ2dsZTtcbnZhciBTdWJoZWFkZXIgPSBfcmVxdWlyZTIuU3ViaGVhZGVyO1xudmFyIE1lbnVJdGVtID0gX3JlcXVpcmUyLk1lbnVJdGVtO1xudmFyIFNlbGVjdEZpZWxkID0gX3JlcXVpcmUyLlNlbGVjdEZpZWxkO1xudmFyIFRleHRGaWVsZCA9IF9yZXF1aXJlMi5UZXh0RmllbGQ7XG52YXIgVGltZVBpY2tlciA9IF9yZXF1aXJlMi5UaW1lUGlja2VyO1xuXG52YXIgRW1haWxQYW5lbCA9IChmdW5jdGlvbiAoX0NvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhFbWFpbFBhbmVsLCBfQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIEVtYWlsUGFuZWwoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBFbWFpbFBhbmVsKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihFbWFpbFBhbmVsLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEVtYWlsUGFuZWwsIFt7XG4gICAgICAgIGtleTogJ29uQ2hhbmdlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uQ2hhbmdlKHBhcnRpYWxWYWx1ZXMpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHZhbHVlcyA9IF9wcm9wcy52YWx1ZXM7XG4gICAgICAgICAgICB2YXIgb25DaGFuZ2UgPSBfcHJvcHMub25DaGFuZ2U7XG5cbiAgICAgICAgICAgIG9uQ2hhbmdlKF9leHRlbmRzKHt9LCB2YWx1ZXMsIHBhcnRpYWxWYWx1ZXMpLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb25GcmVxdWVuY3lDaGFuZ2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb25GcmVxdWVuY3lDaGFuZ2UodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBwYXJ0aWFsID0geyBOT1RJRklDQVRJT05TX0VNQUlMX0ZSRVFVRU5DWTogdmFsdWUgfTtcbiAgICAgICAgICAgIHZhciBuZXdVc2VyVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBzd2l0Y2ggKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnTSc6XG4gICAgICAgICAgICAgICAgICAgIG5ld1VzZXJWYWx1ZSA9ICc1JztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnSCc6XG4gICAgICAgICAgICAgICAgICAgIG5ld1VzZXJWYWx1ZSA9ICcyJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnRDEnOlxuICAgICAgICAgICAgICAgICAgICBuZXdVc2VyVmFsdWUgPSAnMDMnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdEMic6XG4gICAgICAgICAgICAgICAgICAgIG5ld1VzZXJWYWx1ZSA9ICcwOSwxNCc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ1cxJzpcbiAgICAgICAgICAgICAgICAgICAgbmV3VXNlclZhbHVlID0gJ01vbmRheSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFydGlhbC5OT1RJRklDQVRJT05TX0VNQUlMX0ZSRVFVRU5DWV9VU0VSID0gbmV3VXNlclZhbHVlO1xuICAgICAgICAgICAgdGhpcy5vbkNoYW5nZShwYXJ0aWFsKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb25QaWNrRGF0ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvblBpY2tEYXRlKHBvc2l0aW9uLCBldmVudCwgZGF0ZSkge1xuICAgICAgICAgICAgdmFyIE5PVElGSUNBVElPTlNfRU1BSUxfRlJFUVVFTkNZX1VTRVIgPSB0aGlzLnByb3BzLnZhbHVlcy5OT1RJRklDQVRJT05TX0VNQUlMX0ZSRVFVRU5DWV9VU0VSO1xuXG4gICAgICAgICAgICB2YXIgaG91cnMgPSBOT1RJRklDQVRJT05TX0VNQUlMX0ZSRVFVRU5DWV9VU0VSLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICB2YXIgbmV3SG91cnMgPSBbXTtcbiAgICAgICAgICAgIGlmIChwb3NpdGlvbiA9PT0gJ2ZpcnN0JykgbmV3SG91cnMgPSBbZGF0ZS5nZXRIb3VycygpLCBob3Vyc1sxXSA/IGhvdXJzWzFdIDogJzAwJ107XG4gICAgICAgICAgICBpZiAocG9zaXRpb24gPT09ICdsYXN0JykgbmV3SG91cnMgPSBbaG91cnNbMF0gPyBob3Vyc1swXSA6ICcwMCcsIGRhdGUuZ2V0SG91cnMoKV07XG4gICAgICAgICAgICB0aGlzLm9uQ2hhbmdlKHsgTk9USUZJQ0FUSU9OU19FTUFJTF9GUkVRVUVOQ1lfVVNFUjogbmV3SG91cnMuam9pbignLCcpIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIGRlZmluaXRpb25zID0gX3Byb3BzMi5kZWZpbml0aW9ucztcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSBfcHJvcHMyLnZhbHVlcztcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wczIucHlkaW87XG5cbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gZnVuY3Rpb24gbWVzc2FnZShpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBweWRpby5NZXNzYWdlSGFzaFsndXNlcl9kYXNoLicgKyBpZF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIE5PVElGSUNBVElPTlNfRU1BSUxfR0VUID0gdmFsdWVzLk5PVElGSUNBVElPTlNfRU1BSUxfR0VUO1xuICAgICAgICAgICAgdmFyIE5PVElGSUNBVElPTlNfRU1BSUxfRlJFUVVFTkNZID0gdmFsdWVzLk5PVElGSUNBVElPTlNfRU1BSUxfRlJFUVVFTkNZO1xuICAgICAgICAgICAgdmFyIE5PVElGSUNBVElPTlNfRU1BSUxfRlJFUVVFTkNZX1VTRVIgPSB2YWx1ZXMuTk9USUZJQ0FUSU9OU19FTUFJTF9GUkVRVUVOQ1lfVVNFUjtcbiAgICAgICAgICAgIHZhciBOT1RJRklDQVRJT05TX0VNQUlMID0gdmFsdWVzLk5PVElGSUNBVElPTlNfRU1BSUw7XG4gICAgICAgICAgICB2YXIgTk9USUZJQ0FUSU9OU19FTUFJTF9TRU5EX0hUTUwgPSB2YWx1ZXMuTk9USUZJQ0FUSU9OU19FTUFJTF9TRU5EX0hUTUw7XG5cbiAgICAgICAgICAgIHZhciBtYWlsQWN0aXZlID0gTk9USUZJQ0FUSU9OU19FTUFJTF9HRVQgPT09ICd0cnVlJztcbiAgICAgICAgICAgIHZhciBmcmVxdWVuY3lUeXBlcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHZhciBmcmVxdWVuY3lNZW51cyA9IFtdO1xuICAgICAgICAgICAgZGVmaW5pdGlvbnNbMV1bJ2Nob2ljZXMnXS5zcGxpdCgnLCcpLm1hcChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHZhciBkID0gZS5zcGxpdCgnfCcpO1xuICAgICAgICAgICAgICAgIGZyZXF1ZW5jeVR5cGVzLnNldChkWzBdLCBkWzFdKTtcbiAgICAgICAgICAgICAgICBmcmVxdWVuY3lNZW51cy5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoTWVudUl0ZW0sIHsgcHJpbWFyeVRleHQ6IGRbMV0sIHZhbHVlOiBkWzBdIH0pKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIHVzZXJGcmVxdWVuY3lDb21wb25lbnQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAobWFpbEFjdGl2ZSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoTk9USUZJQ0FUSU9OU19FTUFJTF9GUkVRVUVOQ1kpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnTSc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0gnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlckZyZXF1ZW5jeUNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiBOT1RJRklDQVRJT05TX0VNQUlMX0ZSRVFVRU5DWSA9PT0gJ00nID8gbWVzc2FnZSg2MikgOiBtZXNzYWdlKDYzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogTk9USUZJQ0FUSU9OU19FTUFJTF9GUkVRVUVOQ1lfVVNFUixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUsIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMub25DaGFuZ2UoeyBOT1RJRklDQVRJT05TX0VNQUlMX0ZSRVFVRU5DWV9VU0VSOiB2IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0QxJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGQuc2V0SG91cnMoTk9USUZJQ0FUSU9OU19FTUFJTF9GUkVRVUVOQ1lfVVNFUik7ZC5zZXRNaW51dGVzKDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlckZyZXF1ZW5jeUNvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoVGltZVBpY2tlciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdDogJ2FtcG0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpbnRUZXh0OiBtZXNzYWdlKDY0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUsIGRhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMub25DaGFuZ2UoeyBOT1RJRklDQVRJT05TX0VNQUlMX0ZSRVFVRU5DWV9VU0VSOiBkYXRlLmdldEhvdXJzKCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvT2s6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dEZpZWxkU3R5bGU6IHsgd2lkdGg6ICcxMDAlJyB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdEMic6XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaG91cnMgPSBOT1RJRklDQVRJT05TX0VNQUlMX0ZSRVFVRU5DWV9VU0VSICsgJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWhvdXJzKSBob3VycyA9ICcwOSwxNCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBob3VycyA9IGhvdXJzLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZDEgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGQyID0gbmV3IERhdGUoKTtkMi5zZXRNaW51dGVzKDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZDEuc2V0SG91cnMoaG91cnNbMF0pO2QxLnNldE1pbnV0ZXMoMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaG91cnNbMV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkMi5zZXRIb3Vycyhob3Vyc1sxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyRnJlcXVlbmN5Q29tcG9uZW50ID0gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUaW1lUGlja2VyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdDogJ2FtcG0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaW50VGV4dDogbWVzc2FnZSg2NSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBkMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25QaWNrRGF0ZS5iaW5kKHRoaXMsICdmaXJzdCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0RmllbGRTdHlsZTogeyB3aWR0aDogMTAwLCBtYXJnaW5SaWdodDogNSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUaW1lUGlja2VyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdDogJ2FtcG0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaW50VGV4dDogbWVzc2FnZSg2NiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBkMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25QaWNrRGF0ZS5iaW5kKHRoaXMsICdsYXN0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRGaWVsZFN0eWxlOiB7IHdpZHRoOiAxMDAsIG1hcmdpbkxlZnQ6IDUgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ1cxJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJGcmVxdWVuY3lDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNlbGVjdEZpZWxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IG1lc3NhZ2UoNjcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBOT1RJRklDQVRJT05TX0VNQUlMX0ZSRVFVRU5DWV9VU0VSLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUsIGksIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm9uQ2hhbmdlKHsgTk9USUZJQ0FUSU9OU19FTUFJTF9GUkVRVUVOQ1lfVVNFUjogdiB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChNZW51SXRlbSwgeyBwcmltYXJ5VGV4dDogbWVzc2FnZSg2OCksIHZhbHVlOiAnTW9uZGF5JyB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KE1lbnVJdGVtLCB7IHByaW1hcnlUZXh0OiBtZXNzYWdlKDY5KSwgdmFsdWU6ICdUdWVzZGF5JyB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KE1lbnVJdGVtLCB7IHByaW1hcnlUZXh0OiBtZXNzYWdlKDcwKSwgdmFsdWU6ICdXZWRuZXNkYXknIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTWVudUl0ZW0sIHsgcHJpbWFyeVRleHQ6IG1lc3NhZ2UoNzEpLCB2YWx1ZTogJ1RodXJzZGF5JyB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KE1lbnVJdGVtLCB7IHByaW1hcnlUZXh0OiBtZXNzYWdlKDcyKSwgdmFsdWU6ICdGcmlkYXknIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTWVudUl0ZW0sIHsgcHJpbWFyeVRleHQ6IG1lc3NhZ2UoNzMpLCB2YWx1ZTogJ1NhdHVyZGF5JyB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KE1lbnVJdGVtLCB7IHByaW1hcnlUZXh0OiBtZXNzYWdlKDc0KSwgdmFsdWU6ICdTdW5kYXknIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIFN1YmhlYWRlcixcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nTGVmdDogMjAgfSB9LFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlKDYxKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogJzAgMjBweCAyMHB4JyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVG9nZ2xlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogZGVmaW5pdGlvbnNbMF1bJ2xhYmVsJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2dnbGVkOiBOT1RJRklDQVRJT05TX0VNQUlMX0dFVCA9PT0gJ3RydWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGU6IGZ1bmN0aW9uIChlLCB2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMub25DaGFuZ2UoeyBOT1RJRklDQVRJT05TX0VNQUlMX0dFVDogdiA/ICd0cnVlJyA6ICdmYWxzZScgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtYWlsQWN0aXZlICYmIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZ0JvdHRvbTogMTYgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmc6ICcxNnB4IDAnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRvZ2dsZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogZGVmaW5pdGlvbnNbNF1bJ2xhYmVsJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvZ2dsZWQ6IE5PVElGSUNBVElPTlNfRU1BSUxfU0VORF9IVE1MID09PSAndHJ1ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlOiBmdW5jdGlvbiAoZSwgdikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMub25DaGFuZ2UoeyBOT1RJRklDQVRJT05TX0VNQUlMX1NFTkRfSFRNTDogdiA/ICd0cnVlJyA6ICdmYWxzZScgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU2VsZWN0RmllbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiBkZWZpbml0aW9uc1sxXVsnbGFiZWwnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IE5PVElGSUNBVElPTlNfRU1BSUxfRlJFUVVFTkNZLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUsIGssIHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm9uRnJlcXVlbmN5Q2hhbmdlKHApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmVxdWVuY3lNZW51c1xuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJGcmVxdWVuY3lDb21wb25lbnRcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gRW1haWxQYW5lbDtcbn0pKENvbXBvbmVudCk7XG5cbkVtYWlsUGFuZWwucHJvcFR5cGVzID0ge1xuXG4gICAgZGVmaW5pdGlvbnM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgdmFsdWVzOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuY1xuXG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBFbWFpbFBhbmVsO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBQeWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IFB5ZGlvLnJlcXVpcmVMaWIoJ2Jvb3QnKTtcblxudmFyIEFjdGlvbkRpYWxvZ01peGluID0gX1B5ZGlvJHJlcXVpcmVMaWIuQWN0aW9uRGlhbG9nTWl4aW47XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYjIgPSBQeWRpby5yZXF1aXJlTGliKCdjb21wb25lbnRzJyk7XG5cbnZhciBNb2RhbEFwcEJhciA9IF9QeWRpbyRyZXF1aXJlTGliMi5Nb2RhbEFwcEJhcjtcbnZhciBBZGRyZXNzQm9vayA9IF9QeWRpbyRyZXF1aXJlTGliMi5BZGRyZXNzQm9vaztcblxudmFyIE1vZGFsQWRkcmVzc0Jvb2sgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdNb2RhbEFkZHJlc3NCb29rJyxcblxuICAgIG1peGluczogW0FjdGlvbkRpYWxvZ01peGluXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlhbG9nVGl0bGU6ICcnLFxuICAgICAgICAgICAgZGlhbG9nU2l6ZTogJ3hsJyxcbiAgICAgICAgICAgIGRpYWxvZ1BhZGRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgZGlhbG9nSXNNb2RhbDogZmFsc2UsXG4gICAgICAgICAgICBkaWFsb2dTY3JvbGxCb2R5OiB0cnVlXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIHN1Ym1pdDogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICB0aGlzLmRpc21pc3MoKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6ICcxMDAlJywgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyB9IH0sXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KE1vZGFsQXBwQmFyLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2hbJ3VzZXJfZGFzaC4xJ10sXG4gICAgICAgICAgICAgICAgc2hvd01lbnVJY29uQnV0dG9uOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lUmlnaHQ6ICdtZGkgbWRpLWNsb3NlJyxcbiAgICAgICAgICAgICAgICBvblJpZ2h0SWNvbkJ1dHRvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmRpc21pc3MoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQWRkcmVzc0Jvb2ssIF9leHRlbmRzKHtcbiAgICAgICAgICAgICAgICBtb2RlOiAnYm9vaydcbiAgICAgICAgICAgIH0sIHRoaXMucHJvcHMsIHtcbiAgICAgICAgICAgICAgICBzdHlsZTogeyB3aWR0aDogJzEwMCUnLCBmbGV4R3JvdzogMSwgaGVpZ2h0OiAnYXV0bycgfVxuICAgICAgICAgICAgfSkpXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gTW9kYWxBZGRyZXNzQm9vaztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9Qcm9maWxlUGFuZSA9IHJlcXVpcmUoJy4vUHJvZmlsZVBhbmUnKTtcblxudmFyIF9Qcm9maWxlUGFuZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Qcm9maWxlUGFuZSk7XG5cbnZhciBfQ29tcG9uZW50Q29uZmlnUGFyc2VyID0gcmVxdWlyZSgnLi9Db21wb25lbnRDb25maWdQYXJzZXInKTtcblxudmFyIF9Db21wb25lbnRDb25maWdQYXJzZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfQ29tcG9uZW50Q29uZmlnUGFyc2VyKTtcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBQeWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IFB5ZGlvLnJlcXVpcmVMaWIoJ2Jvb3QnKTtcblxudmFyIEFjdGlvbkRpYWxvZ01peGluID0gX1B5ZGlvJHJlcXVpcmVMaWIuQWN0aW9uRGlhbG9nTWl4aW47XG52YXIgU3VibWl0QnV0dG9uUHJvdmlkZXJNaXhpbiA9IF9QeWRpbyRyZXF1aXJlTGliLlN1Ym1pdEJ1dHRvblByb3ZpZGVyTWl4aW47XG52YXIgQXN5bmNDb21wb25lbnQgPSBfUHlkaW8kcmVxdWlyZUxpYi5Bc3luY0NvbXBvbmVudDtcblxudmFyIF9yZXF1aXJlID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIFRhYnMgPSBfcmVxdWlyZS5UYWJzO1xudmFyIFRhYiA9IF9yZXF1aXJlLlRhYjtcbnZhciBGb250SWNvbiA9IF9yZXF1aXJlLkZvbnRJY29uO1xudmFyIEZsYXRCdXR0b24gPSBfcmVxdWlyZS5GbGF0QnV0dG9uO1xuXG52YXIgTW9kYWxEYXNoYm9hcmQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdNb2RhbERhc2hib2FyZCcsXG5cbiAgICBtaXhpbnM6IFtBY3Rpb25EaWFsb2dNaXhpbiwgU3VibWl0QnV0dG9uUHJvdmlkZXJNaXhpbl0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpYWxvZ1RpdGxlOiAnJyxcbiAgICAgICAgICAgIGRpYWxvZ1NpemU6ICdtZCcsXG4gICAgICAgICAgICBkaWFsb2dQYWRkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGRpYWxvZ0lzTW9kYWw6IGZhbHNlLFxuICAgICAgICAgICAgZGlhbG9nU2Nyb2xsQm9keTogZmFsc2VcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgc3VibWl0OiBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICAgIHRoaXMuZGlzbWlzcygpO1xuICAgIH0sXG5cbiAgICBnZXREZWZhdWx0QnV0dG9uczogZnVuY3Rpb24gZ2V0RGVmYXVsdEJ1dHRvbnMoKSB7XG4gICAgICAgIHJldHVybiBbUmVhY3QuY3JlYXRlRWxlbWVudChGbGF0QnV0dG9uLCB7IGxhYmVsOiB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoWzg2XSwgb25Ub3VjaFRhcDogdGhpcy5wcm9wcy5vbkRpc21pc3MgfSldO1xuICAgIH0sXG5cbiAgICBnZXRCdXR0b25zOiBmdW5jdGlvbiBnZXRCdXR0b25zKHVwZGF0ZXIpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlciA9IHVwZGF0ZXI7XG4gICAgICAgIGlmICh0aGlzLnJlZnNbJ3Byb2ZpbGUnXSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVmc1sncHJvZmlsZSddLmdldEJ1dHRvbnModGhpcy5fdXBkYXRlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREZWZhdWx0QnV0dG9ucygpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uVGFiQ2hhbmdlOiBmdW5jdGlvbiBvblRhYkNoYW5nZSh2YWx1ZSkge1xuICAgICAgICBpZiAoIXRoaXMuX3VwZGF0ZXIpIHJldHVybjtcbiAgICAgICAgaWYgKHZhbHVlICYmIHRoaXMucmVmc1t2YWx1ZV0gJiYgdGhpcy5yZWZzW3ZhbHVlXS5nZXRCdXR0b25zKSB7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVyKHRoaXMucmVmc1t2YWx1ZV0uZ2V0QnV0dG9ucyh0aGlzLl91cGRhdGVyKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVyKHRoaXMuZ2V0RGVmYXVsdEJ1dHRvbnMoKSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cbiAgICAgICAgdmFyIGJ1dHRvblN0eWxlID0ge1xuICAgICAgICAgICAgdGV4dFRyYW5zZm9ybTogJ25vbmUnXG4gICAgICAgIH07XG4gICAgICAgIHZhciB0YWJzID0gW1JlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBUYWIsXG4gICAgICAgICAgICB7IGtleTogJ2FjY291bnQnLCBsYWJlbDogdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFsndXNlcl9kYXNoLjQzJ10sIGljb246IFJlYWN0LmNyZWF0ZUVsZW1lbnQoRm9udEljb24sIHsgY2xhc3NOYW1lOiAnbWRpIG1kaS1hY2NvdW50JyB9KSwgYnV0dG9uU3R5bGU6IGJ1dHRvblN0eWxlLCB2YWx1ZTogJ3Byb2ZpbGUnIH0sXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KF9Qcm9maWxlUGFuZTJbJ2RlZmF1bHQnXSwgX2V4dGVuZHMoe30sIHRoaXMucHJvcHMsIHsgcmVmOiAncHJvZmlsZScgfSkpXG4gICAgICAgICldO1xuXG4gICAgICAgIF9Db21wb25lbnRDb25maWdQYXJzZXIyWydkZWZhdWx0J10uZ2V0QWNjb3VudFRhYnModGhpcy5wcm9wcy5weWRpbykubWFwKChmdW5jdGlvbiAodGFiKSB7XG4gICAgICAgICAgICB0YWJzLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBUYWIsXG4gICAgICAgICAgICAgICAgeyBrZXk6IHRhYi5pZCwgbGFiZWw6IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2hbdGFiLnRhYkluZm8ubGFiZWxdLCBpY29uOiBSZWFjdC5jcmVhdGVFbGVtZW50KEZvbnRJY29uLCB7IGNsYXNzTmFtZTogdGFiLnRhYkluZm8uaWNvbiB9KSwgYnV0dG9uU3R5bGU6IGJ1dHRvblN0eWxlLCB2YWx1ZTogdGFiLmlkIH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChBc3luY0NvbXBvbmVudCwgX2V4dGVuZHMoe1xuICAgICAgICAgICAgICAgICAgICByZWY6IHRhYi5pZFxuICAgICAgICAgICAgICAgIH0sIHRoaXMucHJvcHMsIHRhYi5wYW5lSW5mbykpXG4gICAgICAgICAgICApKTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBUYWJzLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIHdpZHRoOiAnMTAwJScgfSxcbiAgICAgICAgICAgICAgICB0YWJJdGVtQ29udGFpbmVyU3R5bGU6IHsgbWluSGVpZ2h0OiA3MiB9LFxuICAgICAgICAgICAgICAgIGNvbnRlbnRDb250YWluZXJTdHlsZTogeyBvdmVyZmxvd1k6ICdhdXRvJywgbWluSGVpZ2h0OiAzNTAgfSxcbiAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vblRhYkNoYW5nZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRhYnNcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBNb2RhbERhc2hib2FyZDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBQeWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBUZXh0RmllbGQgPSBfcmVxdWlyZS5UZXh0RmllbGQ7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IFB5ZGlvLnJlcXVpcmVMaWIoJ2Zvcm0nKTtcblxudmFyIFZhbGlkUGFzc3dvcmQgPSBfUHlkaW8kcmVxdWlyZUxpYi5WYWxpZFBhc3N3b3JkO1xuXG52YXIgUGFzc3dvcmRGb3JtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnUGFzc3dvcmRGb3JtJyxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4geyBlcnJvcjogbnVsbCwgb2xkOiAnJywgbmV3UGFzczogJycgfTtcbiAgICB9LFxuXG4gICAgZ2V0TWVzc2FnZTogZnVuY3Rpb24gZ2V0TWVzc2FnZShpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFtpZF07XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKHZhbHVlLCBmaWVsZCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBuZXdTdGF0dXMgPSB7fTtcbiAgICAgICAgbmV3U3RhdHVzW2ZpZWxkXSA9IHZhbHVlO1xuICAgICAgICB0aGlzLnNldFN0YXRlKG5ld1N0YXR1cywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHN0YXR1cyA9IF90aGlzLnZhbGlkYXRlKCk7XG4gICAgICAgICAgICBpZiAoX3RoaXMucHJvcHMub25WYWxpZFN0YXR1c0NoYW5nZSkge1xuICAgICAgICAgICAgICAgIF90aGlzLnByb3BzLm9uVmFsaWRTdGF0dXNDaGFuZ2Uoc3RhdHVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHZhbGlkYXRlOiBmdW5jdGlvbiB2YWxpZGF0ZSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnJlZnMubmV3cGFzcy5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgdmFyIG9sZFBhc3MgPSBfc3RhdGUub2xkUGFzcztcbiAgICAgICAgdmFyIG5ld1Bhc3MgPSBfc3RhdGUubmV3UGFzcztcblxuICAgICAgICBpZiAoIW9sZFBhc3MgfHwgIW5ld1Bhc3MpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcjogdGhpcy5nZXRNZXNzYWdlKDIzOSkgfSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5ld1Bhc3MubGVuZ3RoIDwgcGFyc2VJbnQodGhpcy5wcm9wcy5weWRpby5nZXRQbHVnaW5Db25maWdzKFwiY29yZS5hdXRoXCIpLmdldChcIlBBU1NXT1JEX01JTkxFTkdUSFwiKSkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcjogdGhpcy5nZXRNZXNzYWdlKDM3OCkgfSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yOiBudWxsIH0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgcG9zdDogZnVuY3Rpb24gcG9zdChjYWxsYmFjaykge1xuICAgICAgICB2YXIgX3N0YXRlMiA9IHRoaXMuc3RhdGU7XG4gICAgICAgIHZhciBvbGRQYXNzID0gX3N0YXRlMi5vbGRQYXNzO1xuICAgICAgICB2YXIgbmV3UGFzcyA9IF9zdGF0ZTIubmV3UGFzcztcblxuICAgICAgICB2YXIgbG9nb3V0U3RyaW5nID0gJyc7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnB5ZGlvLnVzZXIubG9jaykge1xuICAgICAgICAgICAgbG9nb3V0U3RyaW5nID0gJyAnICsgdGhpcy5nZXRNZXNzYWdlKDQ0NSk7XG4gICAgICAgIH1cbiAgICAgICAgUHlkaW9BcGkuZ2V0Q2xpZW50KCkucmVxdWVzdCh7XG4gICAgICAgICAgICBnZXRfYWN0aW9uOiAncGFzc19jaGFuZ2UnLFxuICAgICAgICAgICAgb2xkX3Bhc3M6IG9sZFBhc3MsXG4gICAgICAgICAgICBuZXdfcGFzczogbmV3UGFzcyxcbiAgICAgICAgICAgIHBhc3Nfc2VlZDogJy0xJ1xuICAgICAgICB9LCAoZnVuY3Rpb24gKHRyYW5zcG9ydCkge1xuXG4gICAgICAgICAgICBpZiAodHJhbnNwb3J0LnJlc3BvbnNlVGV4dCA9PT0gJ1BBU1NfRVJST1InKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3I6IHRoaXMuZ2V0TWVzc2FnZSgyNDApIH0pO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHJhbnNwb3J0LnJlc3BvbnNlVGV4dCA9PT0gJ1NVQ0NFU1MnKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnB5ZGlvLmRpc3BsYXlNZXNzYWdlKCdTVUNDRVNTJywgdGhpcy5nZXRNZXNzYWdlKDE5NykgKyBsb2dvdXRTdHJpbmcpO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHRydWUpO1xuICAgICAgICAgICAgICAgIGlmIChsb2dvdXRTdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5weWRpby5nZXRDb250cm9sbGVyKCkuZmlyZUFjdGlvbignbG9nb3V0Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgIHZhciBtZXNzYWdlcyA9IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgIHZhciBsZWdlbmQgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVycm9yKSB7XG4gICAgICAgICAgICBsZWdlbmQgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnZXJyb3InIH0sXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5lcnJvclxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnB5ZGlvLnVzZXIubG9jaykge1xuICAgICAgICAgICAgbGVnZW5kID0gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzWzQ0NF1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG9sZENoYW5nZSA9IGZ1bmN0aW9uIG9sZENoYW5nZShldmVudCwgbmV3Vikge1xuICAgICAgICAgICAgX3RoaXMyLnVwZGF0ZShuZXdWLCAnb2xkUGFzcycpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgbmV3Q2hhbmdlID0gZnVuY3Rpb24gbmV3Q2hhbmdlKG5ld1YsIG9sZFYpIHtcbiAgICAgICAgICAgIF90aGlzMi51cGRhdGUobmV3ViwgJ25ld1Bhc3MnKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgc3R5bGU6IHRoaXMucHJvcHMuc3R5bGUgfSxcbiAgICAgICAgICAgIGxlZ2VuZCxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZm9ybScsXG4gICAgICAgICAgICAgICAgICAgIHsgYXV0b0NvbXBsZXRlOiAnb2ZmJyB9LFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRleHRGaWVsZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IG9sZENoYW5nZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdwYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS5vbGRQYXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiAnb2xkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiBtZXNzYWdlc1syMzddLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlOiAnb2ZmJ1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6IDI1MCB9IH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChWYWxpZFBhc3N3b3JkLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiBuZXdDaGFuZ2UsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHsgbmFtZTogJ3Bhc3MnLCBsYWJlbDogbWVzc2FnZXNbMTk4XSB9LFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS5uZXdQYXNzLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnbmV3cGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICAgICByZWY6ICduZXdwYXNzJ1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gUGFzc3dvcmRGb3JtO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX1Bhc3N3b3JkRm9ybSA9IHJlcXVpcmUoJy4vUGFzc3dvcmRGb3JtJyk7XG5cbnZhciBfUGFzc3dvcmRGb3JtMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1Bhc3N3b3JkRm9ybSk7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBGbGF0QnV0dG9uID0gX3JlcXVpcmUuRmxhdEJ1dHRvbjtcbnZhciBSYWlzZWRCdXR0b24gPSBfcmVxdWlyZS5SYWlzZWRCdXR0b247XG52YXIgUG9wb3ZlciA9IF9yZXF1aXJlLlBvcG92ZXI7XG52YXIgRGl2aWRlciA9IF9yZXF1aXJlLkRpdmlkZXI7XG5cbnZhciBQeWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBQYXNzd29yZFBvcG92ZXIgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoUGFzc3dvcmRQb3BvdmVyLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFBhc3N3b3JkUG9wb3Zlcihwcm9wcywgY29udGV4dCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUGFzc3dvcmRQb3BvdmVyKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihQYXNzd29yZFBvcG92ZXIucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcywgY29udGV4dCk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7IHBhc3NPcGVuOiBmYWxzZSwgcGFzc1ZhbGlkOiBmYWxzZSwgcGFzc0FuY2hvcjogbnVsbCB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhQYXNzd29yZFBvcG92ZXIsIFt7XG4gICAgICAgIGtleTogJ3Bhc3NPcGVuUG9wb3ZlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwYXNzT3BlblBvcG92ZXIoZXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwYXNzT3BlbjogdHJ1ZSwgcGFzc0FuY2hvcjogZXZlbnQuY3VycmVudFRhcmdldCB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncGFzc0Nsb3NlUG9wb3ZlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwYXNzQ2xvc2VQb3BvdmVyKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBhc3NPcGVuOiBmYWxzZSB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncGFzc1ZhbGlkU3RhdHVzQ2hhbmdlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBhc3NWYWxpZFN0YXR1c0NoYW5nZShzdGF0dXMpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwYXNzVmFsaWQ6IHN0YXR1cyB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncGFzc1N1Ym1pdCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwYXNzU3VibWl0KCkge1xuICAgICAgICAgICAgdGhpcy5yZWZzLnBhc3N3b3JkRm9ybS5wb3N0KChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUpIHRoaXMucGFzc0Nsb3NlUG9wb3ZlcigpO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSB0aGlzLnByb3BzLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgcGFzc09wZW4gPSBfc3RhdGUucGFzc09wZW47XG4gICAgICAgICAgICB2YXIgcGFzc0FuY2hvciA9IF9zdGF0ZS5wYXNzQW5jaG9yO1xuICAgICAgICAgICAgdmFyIHBhc3NWYWxpZCA9IF9zdGF0ZS5wYXNzVmFsaWQ7XG5cbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgbWFyZ2luTGVmdDogOCB9IH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChSYWlzZWRCdXR0b24sIHtcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFRhcDogdGhpcy5wYXNzT3BlblBvcG92ZXIuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWzE5NF0sXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnk6IHRydWVcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBQb3BvdmVyLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiBwYXNzT3BlbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuY2hvckVsOiBwYXNzQW5jaG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiB7IGhvcml6b250YWw6ICdsZWZ0JywgdmVydGljYWw6ICd0b3AnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRPcmlnaW46IHsgaG9yaXpvbnRhbDogJ2xlZnQnLCB2ZXJ0aWNhbDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVxdWVzdENsb3NlOiB0aGlzLnBhc3NDbG9zZVBvcG92ZXIuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHpEZXB0aDogMlxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChfUGFzc3dvcmRGb3JtMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgcGFkZGluZzogMTAsIGJhY2tncm91bmRDb2xvcjogJyNmYWZhZmEnLCBwYWRkaW5nQm90dG9tOiAzMCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY6ICdwYXNzd29yZEZvcm0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVmFsaWRTdGF0dXNDaGFuZ2U6IHRoaXMucGFzc1ZhbGlkU3RhdHVzQ2hhbmdlLmJpbmQodGhpcylcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChEaXZpZGVyLCBudWxsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB0ZXh0QWxpZ246ICdyaWdodCcsIHBhZGRpbmc6ICc4cHggMCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRmxhdEJ1dHRvbiwgeyBsYWJlbDogdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFs0OV0sIG9uVG91Y2hUYXA6IHRoaXMucGFzc0Nsb3NlUG9wb3Zlci5iaW5kKHRoaXMpIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRmxhdEJ1dHRvbiwgeyBkaXNhYmxlZDogIXBhc3NWYWxpZCwgbGFiZWw6ICdPaycsIG9uVG91Y2hUYXA6IHRoaXMucGFzc1N1Ym1pdC5iaW5kKHRoaXMpIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFBhc3N3b3JkUG9wb3Zlcjtcbn0pKFJlYWN0LkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFBhc3N3b3JkUG9wb3Zlcjtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9QYXNzd29yZFBvcG92ZXIgPSByZXF1aXJlKCcuL1Bhc3N3b3JkUG9wb3ZlcicpO1xuXG52YXIgX1Bhc3N3b3JkUG9wb3ZlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9QYXNzd29yZFBvcG92ZXIpO1xuXG52YXIgX0VtYWlsUGFuZWwgPSByZXF1aXJlKCcuL0VtYWlsUGFuZWwnKTtcblxudmFyIF9FbWFpbFBhbmVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0VtYWlsUGFuZWwpO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIExhbmdVdGlscyA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvbGFuZycpO1xuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgRmxhdEJ1dHRvbiA9IF9yZXF1aXJlLkZsYXRCdXR0b247XG52YXIgRGl2aWRlciA9IF9yZXF1aXJlLkRpdmlkZXI7XG5cbnZhciBQeWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IFB5ZGlvLnJlcXVpcmVMaWIoJ2Zvcm0nKTtcblxudmFyIE1hbmFnZXIgPSBfUHlkaW8kcmVxdWlyZUxpYi5NYW5hZ2VyO1xudmFyIEZvcm1QYW5lbCA9IF9QeWRpbyRyZXF1aXJlTGliLkZvcm1QYW5lbDtcblxudmFyIEZPUk1fQ1NTID0gJyBcXG4ucmVhY3QtbXVpLWNvbnRleHQgLmN1cnJlbnQtdXNlci1lZGl0LnB5ZGlvLWZvcm0tcGFuZWwgPiAucHlkaW8tZm9ybS1ncm91cDpmaXJzdC1vZi10eXBlIHtcXG4gIG1hcmdpbi10b3A6IDIyMHB4O1xcbiAgb3ZlcmZsb3cteTogaGlkZGVuO1xcbn1cXG4ucmVhY3QtbXVpLWNvbnRleHQgLmN1cnJlbnQtdXNlci1lZGl0LnB5ZGlvLWZvcm0tcGFuZWwgPiAucHlkaW8tZm9ybS1ncm91cCBkaXYuZm9ybS1lbnRyeS1pbWFnZSB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDA7XFxuICBsZWZ0OiAwO1xcbiAgcmlnaHQ6IDA7XFxuICBoZWlnaHQ6IDIwMHB4O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2VjZWZmMTtcXG59XFxuLnJlYWN0LW11aS1jb250ZXh0IC5jdXJyZW50LXVzZXItZWRpdC5weWRpby1mb3JtLXBhbmVsID4gLnB5ZGlvLWZvcm0tZ3JvdXAgZGl2LmZvcm0tZW50cnktaW1hZ2UgLmltYWdlLWxhYmVsLFxcbi5yZWFjdC1tdWktY29udGV4dCAuY3VycmVudC11c2VyLWVkaXQucHlkaW8tZm9ybS1wYW5lbCA+IC5weWRpby1mb3JtLWdyb3VwIGRpdi5mb3JtLWVudHJ5LWltYWdlIC5mb3JtLWxlZ2VuZCB7XFxuICBkaXNwbGF5OiBub25lO1xcbn1cXG4ucmVhY3QtbXVpLWNvbnRleHQgLmN1cnJlbnQtdXNlci1lZGl0LnB5ZGlvLWZvcm0tcGFuZWwgPiAucHlkaW8tZm9ybS1ncm91cCBkaXYuZm9ybS1lbnRyeS1pbWFnZSAuZmlsZS1kcm9wem9uZSB7XFxuICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICB3aWR0aDogMTYwcHggIWltcG9ydGFudDtcXG4gIGhlaWdodDogMTYwcHggIWltcG9ydGFudDtcXG4gIG1hcmdpbjogMjBweCBhdXRvO1xcbn1cXG4ucmVhY3QtbXVpLWNvbnRleHQgLmN1cnJlbnQtdXNlci1lZGl0LnB5ZGlvLWZvcm0tcGFuZWwgPiAucHlkaW8tZm9ybS1ncm91cCBkaXYuZm9ybS1lbnRyeS1pbWFnZSAuYmluYXJ5LXJlbW92ZS1idXR0b24ge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgYm90dG9tOiA1cHg7XFxuICByaWdodDogMDtcXG59XFxuXFxuJztcblxudmFyIFByb2ZpbGVQYW5lID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnUHJvZmlsZVBhbmUnLFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHZhciBvYmpWYWx1ZXMgPSB7fSxcbiAgICAgICAgICAgIG1haWxWYWx1ZXMgPSB7fTtcbiAgICAgICAgdmFyIHB5ZGlvID0gdGhpcy5wcm9wcy5weWRpbztcbiAgICAgICAgaWYgKHB5ZGlvLnVzZXIpIHtcbiAgICAgICAgICAgIHB5ZGlvLnVzZXIucHJlZmVyZW5jZXMuZm9yRWFjaChmdW5jdGlvbiAodiwgaykge1xuICAgICAgICAgICAgICAgIGlmIChrID09PSAnZ3VpX3ByZWZlcmVuY2VzJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9ialZhbHVlc1trXSA9IHY7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGVmaW5pdGlvbnM6IE1hbmFnZXIucGFyc2VQYXJhbWV0ZXJzKHB5ZGlvLmdldFhtbFJlZ2lzdHJ5KCksIFwidXNlci9wcmVmZXJlbmNlcy9wcmVmW0BleHBvc2VkPSd0cnVlJ118Ly9wYXJhbVtjb250YWlucyhAc2NvcGUsJ3VzZXInKSBhbmQgQGV4cG9zZT0ndHJ1ZScgYW5kIG5vdChjb250YWlucyhAbmFtZSwgJ05PVElGSUNBVElPTlNfRU1BSUwnKSldXCIpLFxuICAgICAgICAgICAgbWFpbERlZmluaXRpb25zOiBNYW5hZ2VyLnBhcnNlUGFyYW1ldGVycyhweWRpby5nZXRYbWxSZWdpc3RyeSgpLCBcInVzZXIvcHJlZmVyZW5jZXMvcHJlZltAZXhwb3NlZD0ndHJ1ZSddfC8vcGFyYW1bY29udGFpbnMoQHNjb3BlLCd1c2VyJykgYW5kIEBleHBvc2U9J3RydWUnIGFuZCBjb250YWlucyhAbmFtZSwgJ05PVElGSUNBVElPTlNfRU1BSUwnKV1cIiksXG4gICAgICAgICAgICB2YWx1ZXM6IG9ialZhbHVlcyxcbiAgICAgICAgICAgIG9yaWdpbmFsVmFsdWVzOiBMYW5nVXRpbHMuZGVlcENvcHkob2JqVmFsdWVzKSxcbiAgICAgICAgICAgIGRpcnR5OiBmYWxzZVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBvbkZvcm1DaGFuZ2U6IGZ1bmN0aW9uIG9uRm9ybUNoYW5nZShuZXdWYWx1ZXMsIGRpcnR5LCByZW1vdmVWYWx1ZXMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZGlydHk6IGRpcnR5LCB2YWx1ZXM6IG5ld1ZhbHVlcyB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMuX3VwZGF0ZXIpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5fdXBkYXRlcihfdGhpcy5nZXRCdXR0b25zKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKF90aGlzLnByb3BzLnNhdmVPbkNoYW5nZSkge1xuICAgICAgICAgICAgICAgIF90aGlzLnNhdmVGb3JtKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBnZXRCdXR0b25zOiBmdW5jdGlvbiBnZXRCdXR0b25zKCkge1xuICAgICAgICB2YXIgdXBkYXRlciA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbMF07XG5cbiAgICAgICAgaWYgKHVwZGF0ZXIpIHRoaXMuX3VwZGF0ZXIgPSB1cGRhdGVyO1xuICAgICAgICB2YXIgYnV0dG9uID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgcmV2ZXJ0ID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5kaXJ0eSkge1xuICAgICAgICAgICAgcmV2ZXJ0ID0gUmVhY3QuY3JlYXRlRWxlbWVudChGbGF0QnV0dG9uLCB7IGxhYmVsOiB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoWzYyOF0sIG9uVG91Y2hUYXA6IHRoaXMucmV2ZXJ0IH0pO1xuICAgICAgICAgICAgYnV0dG9uID0gUmVhY3QuY3JlYXRlRWxlbWVudChGbGF0QnV0dG9uLCB7IGxhYmVsOiB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoWzUzXSwgc2Vjb25kYXJ5OiB0cnVlLCBvblRvdWNoVGFwOiB0aGlzLnNhdmVGb3JtIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnV0dG9uID0gUmVhY3QuY3JlYXRlRWxlbWVudChGbGF0QnV0dG9uLCB7IGxhYmVsOiB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoWzg2XSwgb25Ub3VjaFRhcDogdGhpcy5wcm9wcy5vbkRpc21pc3MgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcHMucHlkaW8uQ29udHJvbGxlci5nZXRBY3Rpb25CeU5hbWUoJ3Bhc3NfY2hhbmdlJykpIHtcbiAgICAgICAgICAgIHJldHVybiBbUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4Jywgd2lkdGg6ICcxMDAlJyB9IH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChfUGFzc3dvcmRQb3BvdmVyMlsnZGVmYXVsdCddLCB0aGlzLnByb3BzKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSksXG4gICAgICAgICAgICAgICAgcmV2ZXJ0LFxuICAgICAgICAgICAgICAgIGJ1dHRvblxuICAgICAgICAgICAgKV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gW2J1dHRvbl07XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0QnV0dG9uOiBmdW5jdGlvbiBnZXRCdXR0b24oYWN0aW9uTmFtZSwgbWVzc2FnZUlkKSB7XG4gICAgICAgIHZhciBweWRpbyA9IHRoaXMucHJvcHMucHlkaW87XG4gICAgICAgIGlmICghcHlkaW8uQ29udHJvbGxlci5nZXRBY3Rpb25CeU5hbWUoYWN0aW9uTmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHZhciBmdW5jID0gZnVuY3Rpb24gZnVuYygpIHtcbiAgICAgICAgICAgIHB5ZGlvLkNvbnRyb2xsZXIuZmlyZUFjdGlvbihhY3Rpb25OYW1lKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3RNVUkuUmFpc2VkQnV0dG9uLCB7IGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFttZXNzYWdlSWRdLCBvbkNsaWNrOiBmdW5jIH0pO1xuICAgIH0sXG5cbiAgICByZXZlcnQ6IGZ1bmN0aW9uIHJldmVydCgpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB2YWx1ZXM6IF9leHRlbmRzKHt9LCB0aGlzLnN0YXRlLm9yaWdpbmFsVmFsdWVzKSxcbiAgICAgICAgICAgIGRpcnR5OiBmYWxzZVxuICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMyLl91cGRhdGVyKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMyLl91cGRhdGVyKF90aGlzMi5nZXRCdXR0b25zKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgc2F2ZUZvcm06IGZ1bmN0aW9uIHNhdmVGb3JtKCkge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZGlydHkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBkaXJ0eTogZmFsc2UgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHB5ZGlvID0gdGhpcy5wcm9wcy5weWRpbztcbiAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIHZhciBkZWZpbml0aW9ucyA9IF9zdGF0ZS5kZWZpbml0aW9ucztcbiAgICAgICAgdmFyIHZhbHVlcyA9IF9zdGF0ZS52YWx1ZXM7XG5cbiAgICAgICAgdmFyIHBvc3RWYWx1ZXMgPSBNYW5hZ2VyLmdldFZhbHVlc0ZvclBPU1QoZGVmaW5pdGlvbnMsIHZhbHVlcywgJ1BSRUZFUkVOQ0VTXycpO1xuICAgICAgICBwb3N0VmFsdWVzWydnZXRfYWN0aW9uJ10gPSAnY3VzdG9tX2RhdGFfZWRpdCc7XG4gICAgICAgIFB5ZGlvQXBpLmdldENsaWVudCgpLnJlcXVlc3QocG9zdFZhbHVlcywgKGZ1bmN0aW9uICh0cmFuc3BvcnQpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgICAgICBQeWRpb0FwaS5nZXRDbGllbnQoKS5wYXJzZVhtbE1lc3NhZ2UodHJhbnNwb3J0LnJlc3BvbnNlWE1MKTtcbiAgICAgICAgICAgIHB5ZGlvLm9ic2VydmVPbmNlKCd1c2VyX2xvZ2dlZCcsIGZ1bmN0aW9uICh1c2VyT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlcy5hdmF0YXIgJiYgdXNlck9iamVjdC5nZXRQcmVmZXJlbmNlKCdhdmF0YXInKSAhPT0gdmFsdWVzLmF2YXRhcikge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczMuc2V0U3RhdGUoeyB2YWx1ZXM6IF9leHRlbmRzKHt9LCB2YWx1ZXMsIHsgYXZhdGFyOiB1c2VyT2JqZWN0LmdldFByZWZlcmVuY2UoJ2F2YXRhcicpIH0pIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcHlkaW8ucmVmcmVzaFVzZXJEYXRhKCk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZGlydHk6IGZhbHNlIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoX3RoaXMzLl91cGRhdGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMy5fdXBkYXRlcihfdGhpczMuZ2V0QnV0dG9ucygpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuICAgICAgICB2YXIgbWluaURpc3BsYXkgPSBfcHJvcHMubWluaURpc3BsYXk7XG5cbiAgICAgICAgaWYgKCFweWRpby51c2VyKSByZXR1cm4gbnVsbDtcbiAgICAgICAgdmFyIF9zdGF0ZTIgPSB0aGlzLnN0YXRlO1xuICAgICAgICB2YXIgZGVmaW5pdGlvbnMgPSBfc3RhdGUyLmRlZmluaXRpb25zO1xuICAgICAgICB2YXIgdmFsdWVzID0gX3N0YXRlMi52YWx1ZXM7XG5cbiAgICAgICAgaWYgKG1pbmlEaXNwbGF5KSB7XG4gICAgICAgICAgICBkZWZpbml0aW9ucyA9IGRlZmluaXRpb25zLmZpbHRlcihmdW5jdGlvbiAobykge1xuICAgICAgICAgICAgICAgIHJldHVybiBbJ2F2YXRhciddLmluZGV4T2Yoby5uYW1lKSAhPT0gLTE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRm9ybVBhbmVsLCB7XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnY3VycmVudC11c2VyLWVkaXQnLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IGRlZmluaXRpb25zLFxuICAgICAgICAgICAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgICAgICAgICAgIGRlcHRoOiAtMSxcbiAgICAgICAgICAgICAgICBiaW5hcnlfY29udGV4dDogXCJ1c2VyX2lkPVwiICsgcHlkaW8udXNlci5pZCxcbiAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkZvcm1DaGFuZ2VcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnc3R5bGUnLCB7IHR5cGU6ICd0ZXh0L2NzcycsIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MOiB7IF9faHRtbDogRk9STV9DU1MgfSB9KVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFByb2ZpbGVQYW5lO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBUb2dnbGUgPSBfcmVxdWlyZS5Ub2dnbGU7XG52YXIgRGl2aWRlciA9IF9yZXF1aXJlLkRpdmlkZXI7XG52YXIgVGV4dEZpZWxkID0gX3JlcXVpcmUuVGV4dEZpZWxkO1xudmFyIFJhaXNlZEJ1dHRvbiA9IF9yZXF1aXJlLlJhaXNlZEJ1dHRvbjtcblxudmFyIF9yZXF1aXJlJHJlcXVpcmVMaWIgPSByZXF1aXJlKCdweWRpbycpLnJlcXVpcmVMaWIoJ2NvbXBvbmVudHMnKTtcblxudmFyIENsaXBib2FyZFRleHRGaWVsZCA9IF9yZXF1aXJlJHJlcXVpcmVMaWIuQ2xpcGJvYXJkVGV4dEZpZWxkO1xuXG52YXIgV2ViREFWUGFuZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1dlYkRBVlBhbmUnLFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmxvYWRQcmVmcygpO1xuICAgIH0sXG4gICAgZ2V0TWVzc2FnZTogZnVuY3Rpb24gZ2V0TWVzc2FnZShpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFtpZF07XG4gICAgfSxcbiAgICBvblRvZ2dsZUNoYW5nZTogZnVuY3Rpb24gb25Ub2dnbGVDaGFuZ2UoZXZlbnQsIG5ld1ZhbHVlKSB7XG4gICAgICAgIFB5ZGlvQXBpLmdldENsaWVudCgpLnJlcXVlc3Qoe1xuICAgICAgICAgICAgZ2V0X2FjdGlvbjogJ3dlYmRhdl9wcmVmZXJlbmNlcycsXG4gICAgICAgICAgICBhY3RpdmF0ZTogbmV3VmFsdWUgPyBcInRydWVcIiA6IFwiZmFsc2VcIlxuICAgICAgICB9LCAoZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwcmVmZXJlbmNlczogdC5yZXNwb25zZUpTT04gfHwge30gfSk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLnB5ZGlvLmRpc3BsYXlNZXNzYWdlKFwiU1VDQ0VTU1wiLCB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoW25ld1ZhbHVlID8gNDA4IDogNDA5XSk7XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgIH0sXG4gICAgc2F2ZVBhc3N3b3JkOiBmdW5jdGlvbiBzYXZlUGFzc3dvcmQoZXZlbnQpIHtcbiAgICAgICAgUHlkaW9BcGkuZ2V0Q2xpZW50KCkucmVxdWVzdCh7XG4gICAgICAgICAgICBnZXRfYWN0aW9uOiAnd2ViZGF2X3ByZWZlcmVuY2VzJyxcbiAgICAgICAgICAgIHdlYmRhdl9wYXNzOiB0aGlzLnJlZnNbJ3Bhc3NmaWVsZCddLmdldFZhbHVlKClcbiAgICAgICAgfSwgKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcHJlZmVyZW5jZXM6IHQucmVzcG9uc2VKU09OIHx8IHt9IH0pO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5weWRpby5kaXNwbGF5TWVzc2FnZShcIlNVQ0NFU1NcIiwgdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFs0MTBdKTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgfSxcbiAgICBsb2FkUHJlZnM6IGZ1bmN0aW9uIGxvYWRQcmVmcygpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzTW91bnRlZCgpKSByZXR1cm47XG4gICAgICAgIFB5ZGlvQXBpLmdldENsaWVudCgpLnJlcXVlc3Qoe1xuICAgICAgICAgICAgZ2V0X2FjdGlvbjogJ3dlYmRhdl9wcmVmZXJlbmNlcydcbiAgICAgICAgfSwgKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcHJlZmVyZW5jZXM6IHQucmVzcG9uc2VKU09OIHx8IHt9IH0pO1xuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyUGFzc3dvcmRGaWVsZDogZnVuY3Rpb24gcmVuZGVyUGFzc3dvcmRGaWVsZCgpIHtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5wcmVmZXJlbmNlcy5kaWdlc3Rfc2V0IHx8ICF0aGlzLnN0YXRlLnByZWZlcmVuY2VzLndlYmRhdl9mb3JjZV9iYXNpYykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KERpdmlkZXIsIG51bGwpLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmc6IDE2IH0gfSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRNZXNzYWdlKDQwNylcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2Jhc2VsaW5lJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAncGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IHRoaXMuZ2V0TWVzc2FnZSg1MjMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiAncGFzc2ZpZWxkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGZsZXg6IDEsIG1hcmdpblJpZ2h0OiAxMCB9XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFJhaXNlZEJ1dHRvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdTYXZlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IHRoaXMuc2F2ZVBhc3N3b3JkXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRGl2aWRlciwgbnVsbClcbiAgICAgICAgKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyVXJsczogZnVuY3Rpb24gcmVuZGVyVXJscygpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB2YXIgYmFzZSA9IHRoaXMuc3RhdGUucHJlZmVyZW5jZXMud2ViZGF2X2Jhc2VfdXJsO1xuICAgICAgICB2YXIgb3RoZXJVcmxzID0gW107XG4gICAgICAgIHZhciB0b2dnbGVyID0gISF0aGlzLnN0YXRlLnRvZ2dsZXI7XG4gICAgICAgIHZhciBweWRpbyA9IHRoaXMucHJvcHMucHlkaW87XG4gICAgICAgIHZhciBwcmVmZXJlbmNlcyA9IHRoaXMuc3RhdGUucHJlZmVyZW5jZXM7XG5cbiAgICAgICAgaWYgKHRvZ2dsZXIpIHtcbiAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHVzZXJSZXBvcyA9IHB5ZGlvLnVzZXIuZ2V0UmVwb3NpdG9yaWVzTGlzdCgpO1xuICAgICAgICAgICAgICAgIHZhciB3ZWJkYXZSZXBvcyA9IHByZWZlcmVuY2VzLndlYmRhdl9yZXBvc2l0b3JpZXM7XG4gICAgICAgICAgICAgICAgdXNlclJlcG9zLmZvckVhY2goKGZ1bmN0aW9uIChyZXBvLCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF3ZWJkYXZSZXBvc1trZXldKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIG90aGVyVXJscy5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ2xpcGJvYXJkVGV4dEZpZWxkLCB7IGtleToga2V5LCBmbG9hdGluZ0xhYmVsVGV4dDogcmVwby5nZXRMYWJlbCgpLCBpbnB1dFZhbHVlOiB3ZWJkYXZSZXBvc1trZXldLCBnZXRNZXNzYWdlOiB0aGlzLmdldE1lc3NhZ2UgfSkpO1xuICAgICAgICAgICAgICAgIH0pLmJpbmQoX3RoaXMpKTtcbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAyMCB9IH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0TWVzc2FnZSg0MDUpXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KENsaXBib2FyZFRleHRGaWVsZCwgeyBmbG9hdGluZ0xhYmVsVGV4dDogdGhpcy5nZXRNZXNzYWdlKDQ2OCksIGlucHV0VmFsdWU6IGJhc2UsIGdldE1lc3NhZ2U6IHRoaXMuZ2V0TWVzc2FnZSB9KVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIHRvZ2dsZXIgJiYgUmVhY3QuY3JlYXRlRWxlbWVudChEaXZpZGVyLCBudWxsKSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAyMCB9IH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUb2dnbGUsIHsgbGFiZWxQb3NpdGlvbjogJ3JpZ2h0JywgbGFiZWw6IHRoaXMuZ2V0TWVzc2FnZSg0NjUpLCBvblRvZ2dsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyB0b2dnbGVyOiAhdG9nZ2xlciB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgdG9nZ2xlZDogdG9nZ2xlciB9KSxcbiAgICAgICAgICAgICAgICBvdGhlclVybHNcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciB3ZWJkYXZBY3RpdmUgPSB0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUucHJlZmVyZW5jZXMud2ViZGF2X2FjdGl2ZTtcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgc3R5bGU6IHsgZm9udFNpemU6IDE0IH0gfSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAyMCB9IH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUb2dnbGUsIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxQb3NpdGlvbjogJ3JpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMuZ2V0TWVzc2FnZSg0MDYpLFxuICAgICAgICAgICAgICAgICAgICB0b2dnbGVkOiB3ZWJkYXZBY3RpdmUsXG4gICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlOiB0aGlzLm9uVG9nZ2xlQ2hhbmdlIH0pLFxuICAgICAgICAgICAgICAgICF3ZWJkYXZBY3RpdmUgJiYgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZ1RvcDogMjAgfSB9LFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldE1lc3NhZ2UoNDA0KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICB3ZWJkYXZBY3RpdmUgJiYgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRGl2aWRlciwgbnVsbCksXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJQYXNzd29yZEZpZWxkKCksXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJVcmxzKClcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBXZWJEQVZQYW5lO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfUHJvZmlsZVBhbmUgPSByZXF1aXJlKCcuL1Byb2ZpbGVQYW5lJyk7XG5cbnZhciBfUHJvZmlsZVBhbmUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfUHJvZmlsZVBhbmUpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdib290Jyk7XG5cbnZhciBBY3Rpb25EaWFsb2dNaXhpbiA9IF9QeWRpbyRyZXF1aXJlTGliLkFjdGlvbkRpYWxvZ01peGluO1xudmFyIENhbmNlbEJ1dHRvblByb3ZpZGVyTWl4aW4gPSBfUHlkaW8kcmVxdWlyZUxpYi5DYW5jZWxCdXR0b25Qcm92aWRlck1peGluO1xudmFyIFN1Ym1pdEJ1dHRvblByb3ZpZGVyTWl4aW4gPSBfUHlkaW8kcmVxdWlyZUxpYi5TdWJtaXRCdXR0b25Qcm92aWRlck1peGluO1xuXG4vKipcbiAqIFNhbXBsZSBEaWFsb2cgY2xhc3MgdXNlZCBmb3IgcmVmZXJlbmNlIG9ubHksIHJlYWR5IHRvIGJlXG4gKiBjb3B5L3Bhc3RlZCA6LSlcbiAqL1xuZXhwb3J0c1snZGVmYXVsdCddID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1dlbGNvbWVNb2RhbCcsXG5cbiAgICBtaXhpbnM6IFtBY3Rpb25EaWFsb2dNaXhpbiwgQ2FuY2VsQnV0dG9uUHJvdmlkZXJNaXhpbl0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpYWxvZ1RpdGxlOiAnJyxcbiAgICAgICAgICAgIGRpYWxvZ0lzTW9kYWw6IHRydWUsXG4gICAgICAgICAgICBkaWFsb2dTaXplOiAnc20nLFxuICAgICAgICAgICAgZGlhbG9nUGFkZGluZzogMFxuICAgICAgICB9O1xuICAgIH0sXG4gICAgY2xvc2U6IGZ1bmN0aW9uIGNsb3NlKHNraXApIHtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5vblJlcXVlc3RTdGFydCkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblJlcXVlc3RTdGFydChza2lwKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByb3BzLm9uRGlzbWlzcygpO1xuICAgIH0sXG4gICAgZ2V0TWVzc2FnZTogZnVuY3Rpb24gZ2V0TWVzc2FnZShpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFsnYWpheF9ndWkudG91ci53ZWxjb21lbW9kYWwuJyArIGlkXTtcbiAgICB9LFxuICAgIGdldEJ1dHRvbnM6IGZ1bmN0aW9uIGdldEJ1dHRvbnMoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIFtfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGxhYmVsOiB0aGlzLmdldE1lc3NhZ2UoJ3NraXAnKSwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzLmNsb3NlKHRydWUpO1xuICAgICAgICAgICAgfSB9KSwgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBsYWJlbDogdGhpcy5nZXRNZXNzYWdlKCdzdGFydCcpLCBwcmltYXJ5OiB0cnVlLCBvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLmNsb3NlKGZhbHNlKTtcbiAgICAgICAgICAgIH0gfSldO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcG9zaXRpb246ICdyZWxhdGl2ZScsIHdpZHRoOiAnMTAwJScsIGhlaWdodDogMjA1LCBvdmVyZmxvdzogJ2hpZGRlbicsIGJhY2tncm91bmRDb2xvcjogJyNlY2VmZjEnIH0gfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfUHJvZmlsZVBhbmUyWydkZWZhdWx0J10sIF9leHRlbmRzKHsgbWluaURpc3BsYXk6IHRydWUgfSwgdGhpcy5wcm9wcywgeyBzYXZlT25DaGFuZ2U6IHRydWUgfSkpXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2FyZFRpdGxlLCB7IHRpdGxlOiB0aGlzLmdldE1lc3NhZ2UoJ3RpdGxlJyksIHN1YnRpdGxlOiB0aGlzLmdldE1lc3NhZ2UoJ3N1YnRpdGxlJykgfSlcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9DYWxsYmFja3MgPSByZXF1aXJlKCcuL0NhbGxiYWNrcycpO1xuXG52YXIgX0NhbGxiYWNrczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9DYWxsYmFja3MpO1xuXG52YXIgX01vZGFsRGFzaGJvYXJkID0gcmVxdWlyZSgnLi9Nb2RhbERhc2hib2FyZCcpO1xuXG52YXIgX01vZGFsRGFzaGJvYXJkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX01vZGFsRGFzaGJvYXJkKTtcblxudmFyIF9Nb2RhbEFkZHJlc3NCb29rID0gcmVxdWlyZSgnLi9Nb2RhbEFkZHJlc3NCb29rJyk7XG5cbnZhciBfTW9kYWxBZGRyZXNzQm9vazIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Nb2RhbEFkZHJlc3NCb29rKTtcblxudmFyIF9XZWJkYXZQYW5lID0gcmVxdWlyZSgnLi9XZWJkYXZQYW5lJyk7XG5cbnZhciBfV2ViZGF2UGFuZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9XZWJkYXZQYW5lKTtcblxudmFyIF9XZWxjb21lTW9kYWwgPSByZXF1aXJlKCcuL1dlbGNvbWVNb2RhbCcpO1xuXG52YXIgX1dlbGNvbWVNb2RhbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9XZWxjb21lTW9kYWwpO1xuXG52YXIgX1Bhc3N3b3JkRm9ybSA9IHJlcXVpcmUoJy4vUGFzc3dvcmRGb3JtJyk7XG5cbnZhciBfUGFzc3dvcmRGb3JtMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1Bhc3N3b3JkRm9ybSk7XG5cbnZhciBDYWxsYmFja3MgPSAoMCwgX0NhbGxiYWNrczJbJ2RlZmF1bHQnXSkod2luZG93LnB5ZGlvKTtcblxuZXhwb3J0cy5DYWxsYmFja3MgPSBDYWxsYmFja3M7XG5leHBvcnRzLk1vZGFsRGFzaGJvYXJkID0gX01vZGFsRGFzaGJvYXJkMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5Nb2RhbEFkZHJlc3NCb29rID0gX01vZGFsQWRkcmVzc0Jvb2syWydkZWZhdWx0J107XG5leHBvcnRzLldlYkRBVlBhbmUgPSBfV2ViZGF2UGFuZTJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuV2VsY29tZU1vZGFsID0gX1dlbGNvbWVNb2RhbDJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuUGFzc3dvcmRGb3JtID0gX1Bhc3N3b3JkRm9ybTJbJ2RlZmF1bHQnXTtcbiJdfQ==
