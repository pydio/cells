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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _ServerConfigModel = require('./ServerConfigModel');

var _ServerConfigModel2 = _interopRequireDefault(_ServerConfigModel);

var _ConnectionPane = require('./ConnectionPane');

var _ConnectionPane2 = _interopRequireDefault(_ConnectionPane);

var _FilterPane = require('./FilterPane');

var _FilterPane2 = _interopRequireDefault(_FilterPane);

var _MappingsPane = require('./MappingsPane');

var _MappingsPane2 = _interopRequireDefault(_MappingsPane);

var _MemberOfPane = require('./MemberOfPane');

var _MemberOfPane2 = _interopRequireDefault(_MemberOfPane);

var _GeneralPane = require('./GeneralPane');

var _GeneralPane2 = _interopRequireDefault(_GeneralPane);

var _uuid4 = require('uuid4');

var _uuid42 = _interopRequireDefault(_uuid4);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var PaperEditorLayout = _Pydio$requireLib.PaperEditorLayout;
var PaperEditorNavEntry = _Pydio$requireLib.PaperEditorNavEntry;
var PaperEditorNavHeader = _Pydio$requireLib.PaperEditorNavHeader;

var LdapEditor = (function (_React$Component) {
    _inherits(LdapEditor, _React$Component);

    function LdapEditor(props) {
        var _this = this;

        _classCallCheck(this, LdapEditor);

        _get(Object.getPrototypeOf(LdapEditor.prototype), 'constructor', this).call(this, props);
        var config = props.config;

        var model = undefined,
            create = true;
        if (config) {
            model = new _ServerConfigModel2['default'](config.ConfigId, config);
            create = false;
        } else {
            var conf = new _pydioHttpRestApi.AuthLdapServerConfig();
            conf.ConfigId = (0, _uuid42['default'])();
            model = new _ServerConfigModel2['default'](conf.ConfigId, conf);
        }
        model.observe('update', function () {
            _this.setState({
                config: model.getConfig(),
                dirty: true,
                valid: model.isValid()
            }, function () {
                _this.forceUpdate();
            });
        });
        this.state = {
            model: model,
            config: model.getConfig(),
            snapshot: model.snapshot(),
            dirty: create,
            valid: !create,
            create: create,
            currentPane: 'general'
        };
    }

    _createClass(LdapEditor, [{
        key: 'isDirty',
        value: function isDirty() {
            return this.state.dirty;
        }
    }, {
        key: 'isValid',
        value: function isValid() {
            return this.state.valid;
        }
    }, {
        key: 'isCreate',
        value: function isCreate() {
            return this.state.create;
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            var _this2 = this;

            var config = newProps.config;

            if (config && this.props.config !== config) {
                (function () {
                    var model = new _ServerConfigModel2['default'](config.ConfigId, config);
                    model.observe('update', function () {
                        _this2.setState({
                            config: model.getConfig(),
                            dirty: true,
                            valid: model.isValid()
                        }, function () {
                            _this2.forceUpdate();
                        });
                    });
                    _this2.state = {
                        model: model,
                        config: model.getConfig(),
                        snapshot: model.snapshot()
                    };
                })();
            }
        }
    }, {
        key: 'revert',
        value: function revert() {
            var _state = this.state;
            var model = _state.model;
            var snapshot = _state.snapshot;

            var newConfig = model.revertTo(snapshot);
            this.setState({ config: newConfig, dirty: false });
        }
    }, {
        key: 'save',
        value: function save() {
            var _this3 = this;

            var model = this.state.model;
            var reload = this.props.reload;

            model.save().then(function (resp) {
                _this3.setState({ dirty: false, snapshot: model.snapshot() });
                reload();
            });
        }
    }, {
        key: 'setSelectedPane',
        value: function setSelectedPane(key) {
            this.setState({ currentPane: key });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var _state2 = this.state;
            var dirty = _state2.dirty;
            var valid = _state2.valid;
            var currentPane = _state2.currentPane;
            var config = _state2.config;

            var buttonMargin = { marginLeft: 6 };
            var actions = [];
            if (!this.isCreate()) {
                actions.push(_react2['default'].createElement(_materialUi.RaisedButton, { style: buttonMargin, disabled: !dirty, label: "Revert", onTouchTap: this.revert.bind(this) }));
            }
            actions.push(_react2['default'].createElement(_materialUi.RaisedButton, { style: buttonMargin, disabled: !dirty || !valid, label: "Save", onTouchTap: this.save.bind(this) }));
            if (this.isCreate()) {
                actions.push(_react2['default'].createElement(_materialUi.RaisedButton, { style: buttonMargin, label: "Cancel", onTouchTap: function () {
                        return _this4.props.onRequestTabClose(_this4);
                    } }));
            } else {
                actions.push(_react2['default'].createElement(_materialUi.RaisedButton, { style: buttonMargin, label: "Close", onTouchTap: function () {
                        return _this4.props.onRequestTabClose(_this4);
                    } }));
            }

            var leftNav = [_react2['default'].createElement(PaperEditorNavHeader, { key: 'h1', label: "Directory" }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'general', keyName: 'general', onClick: this.setSelectedPane.bind(this), label: pydio.MessageHash["ldap.2"], selectedKey: currentPane }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'connection', keyName: 'connection', onClick: this.setSelectedPane.bind(this), label: pydio.MessageHash["ldap.3"], selectedKey: currentPane }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'filter', keyName: 'filter', onClick: this.setSelectedPane.bind(this), label: pydio.MessageHash["ldap.4"], selectedKey: currentPane }), _react2['default'].createElement(PaperEditorNavHeader, { key: 'h2', label: "Mapping" }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'mappings', keyName: 'mappings', onClick: this.setSelectedPane.bind(this), label: pydio.MessageHash["ldap.5"], selectedKey: currentPane }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'memberof', keyName: 'memberof', onClick: this.setSelectedPane.bind(this), label: pydio.MessageHash["ldap.6"], selectedKey: currentPane })];

            var paneStyle = { padding: 20 };
            var titleStyle = { fontSize: 16, paddingBottom: 6 };
            var legendStyle = { fontSize: 13, color: '#9e9e9e' };
            var paneProps = {
                pydio: pydio,
                style: paneStyle,
                config: config,
                titleStyle: titleStyle,
                legendStyle: legendStyle,
                divider: _react2['default'].createElement(_materialUi.Divider, { style: { marginTop: 20, marginBottom: 20, marginLeft: -20, marginRight: -20 } })
            };

            var pane = undefined;
            switch (currentPane) {
                case "general":
                    pane = _react2['default'].createElement(_GeneralPane2['default'], paneProps);
                    break;
                case "connection":
                    pane = _react2['default'].createElement(_ConnectionPane2['default'], paneProps);
                    break;
                case "filter":
                    pane = _react2['default'].createElement(_FilterPane2['default'], paneProps);
                    break;
                case "mappings":
                    pane = _react2['default'].createElement(_MappingsPane2['default'], paneProps);
                    break;
                case "memberof":
                    pane = _react2['default'].createElement(_MemberOfPane2['default'], paneProps);
                    break;
                default:
                    break;
            }

            return _react2['default'].createElement(
                PaperEditorLayout,
                {
                    title: config.DomainName ? config.DomainName : 'New Directory',
                    titleActionBar: actions,
                    contentFill: false,
                    leftNav: leftNav
                },
                pane
            );
        }
    }]);

    return LdapEditor;
})(_react2['default'].Component);

exports['default'] = LdapEditor;
module.exports = exports['default'];
