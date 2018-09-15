(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ShareDialog = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

exports['default'] = function (PydioComponent) {
    var ShareContextConsumer = (function (_React$Component) {
        _inherits(ShareContextConsumer, _React$Component);

        function ShareContextConsumer() {
            _classCallCheck(this, ShareContextConsumer);

            _get(Object.getPrototypeOf(ShareContextConsumer.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(ShareContextConsumer, [{
            key: 'render',
            value: function render() {
                var _context = this.context;
                var messages = _context.messages;
                var getMessage = _context.getMessage;
                var isReadonly = _context.isReadonly;

                var contextProps = { messages: messages, getMessage: getMessage, isReadonly: isReadonly };
                return React.createElement(PydioComponent, _extends({}, this.props, contextProps));
            }
        }]);

        return ShareContextConsumer;
    })(React.Component);

    ShareContextConsumer.contextTypes = {
        messages: React.PropTypes.object,
        getMessage: React.PropTypes.func,
        isReadonly: React.PropTypes.func
    };

    return ShareContextConsumer;
};

module.exports = exports['default'];

},{"react":"react"}],2:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _EditCellDialog = require('./EditCellDialog');

var _EditCellDialog2 = _interopRequireDefault(_EditCellDialog);

var _pydioModelCell = require('pydio/model/cell');

var _pydioModelCell2 = _interopRequireDefault(_pydioModelCell);

var _materialUi = require('material-ui');

var _mainGenericCard = require('../main/GenericCard');

var _mainShareHelper = require("../main/ShareHelper");

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var CellCard = (function (_React$Component) {
    _inherits(CellCard, _React$Component);

    function CellCard(props) {
        var _this = this;

        _classCallCheck(this, CellCard);

        _get(Object.getPrototypeOf(CellCard.prototype), 'constructor', this).call(this, props);
        this.state = { edit: false, model: new _pydioModelCell2['default']() };
        this._observer = function () {
            _this.forceUpdate();
        };
    }

    //CellCard = PaletteModifier({primary1Color:'#009688'})(CellCard);

    _createClass(CellCard, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var cellId = _props.cellId;

            if (pydio.user.activeRepository === cellId) {
                pydio.user.getActiveRepositoryAsCell().then(function (cell) {
                    _this2.setState({ model: cell });
                    cell.observe('update', _this2._observer);
                });
            } else {
                this.state.model.observe('update', function () {
                    _this2.forceUpdate();
                });
                this.state.model.load(this.props.cellId);
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.state.model.stopObserving('update', this._observer);
        }
    }, {
        key: 'usersInvitations',
        value: function usersInvitations(userObjects) {
            _mainShareHelper2['default'].sendCellInvitation(this.props.node, this.state.model, userObjects);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props2 = this.props;
            var mode = _props2.mode;
            var pydio = _props2.pydio;
            var _state = this.state;
            var edit = _state.edit;
            var model = _state.model;

            var m = function m(id) {
                return pydio.MessageHash['share_center.' + id];
            };

            var rootStyle = { width: 350, minHeight: 270 };
            var content = undefined;

            if (edit) {
                rootStyle = { width: 700, height: 500 };
                content = _react2['default'].createElement(_EditCellDialog2['default'], _extends({}, this.props, { model: model, sendInvitations: this.usersInvitations.bind(this) }));
            } else {
                var nodes = model.getRootNodes().map(function (node) {
                    return model.getNodeLabelInContext(node);
                }).join(', ');
                if (!nodes) {
                    nodes = model.getRootNodes().length + ' item(s)';
                }
                var deleteAction = undefined,
                    editAction = undefined,
                    moreMenuItems = undefined;
                if (mode !== 'infoPanel') {
                    moreMenuItems = [];
                    if (model.getUuid() !== pydio.user.activeRepository) {
                        moreMenuItems.push(_react2['default'].createElement(_materialUi.MenuItem, { primaryText: m(246), onTouchTap: function () {
                                pydio.triggerRepositoryChange(model.getUuid());
                                _this3.props.onDismiss();
                            } }));
                    }
                    if (model.isEditable()) {
                        deleteAction = function () {
                            model.deleteCell().then(function (res) {
                                _this3.props.onDismiss();
                            });
                        };
                        editAction = function () {
                            _this3.setState({ edit: true });
                            if (_this3.props.onHeightChange) {
                                _this3.props.onHeightChange(500);
                            }
                        };
                        moreMenuItems.push(_react2['default'].createElement(_materialUi.MenuItem, { primaryText: m(247), onTouchTap: function () {
                                return _this3.setState({ edit: true });
                            } }));
                        moreMenuItems.push(_react2['default'].createElement(_materialUi.MenuItem, { primaryText: m(248), onTouchTap: deleteAction }));
                    }
                }
                content = _react2['default'].createElement(
                    _mainGenericCard.GenericCard,
                    {
                        pydio: pydio,
                        title: model.getLabel(),
                        onDismissAction: this.props.onDismiss,
                        onDeleteAction: deleteAction,
                        onEditAction: editAction,
                        headerSmall: mode === 'infoPanel',
                        moreMenuItems: moreMenuItems
                    },
                    model.getDescription() && _react2['default'].createElement(_mainGenericCard.GenericLine, { iconClassName: 'mdi mdi-information', legend: m(145), data: model.getDescription() }),
                    _react2['default'].createElement(_mainGenericCard.GenericLine, { iconClassName: 'mdi mdi-account-multiple', legend: m(54), data: model.getAclsSubjects() }),
                    _react2['default'].createElement(_mainGenericCard.GenericLine, { iconClassName: 'mdi mdi-folder', legend: m(249), data: nodes })
                );
                if (mode === 'infoPanel') {
                    return content;
                }
            }

            return _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 0, style: rootStyle },
                content
            );
        }
    }]);

    return CellCard;
})(_react2['default'].Component);

exports['default'] = CellCard;
module.exports = exports['default'];

},{"../main/GenericCard":26,"../main/ShareHelper":29,"./EditCellDialog":4,"material-ui":"material-ui","pydio/model/cell":"pydio/model/cell","react":"react"}],3:[function(require,module,exports){
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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _SharedUsers = require('./SharedUsers');

var _SharedUsers2 = _interopRequireDefault(_SharedUsers);

var _NodesPicker = require('./NodesPicker');

var _NodesPicker2 = _interopRequireDefault(_NodesPicker);

var _pydioModelCell = require('pydio/model/cell');

var _pydioModelCell2 = _interopRequireDefault(_pydioModelCell);

/**
 * Dialog for letting users create a workspace
 */
var CreateCellDialog = _react2['default'].createClass({
    displayName: 'CreateCellDialog',

    childContextTypes: {
        messages: _react2['default'].PropTypes.object,
        getMessage: _react2['default'].PropTypes.func,
        isReadonly: _react2['default'].PropTypes.func
    },

    getChildContext: function getChildContext() {
        var messages = this.props.pydio.MessageHash;
        return {
            messages: messages,
            getMessage: function getMessage(messageId) {
                var namespace = arguments.length <= 1 || arguments[1] === undefined ? 'share_center' : arguments[1];

                try {
                    return messages[namespace + (namespace ? "." : "") + messageId] || messageId;
                } catch (e) {
                    return messageId;
                }
            },
            isReadonly: (function () {
                return false;
            }).bind(this)
        };
    },

    getInitialState: function getInitialState() {
        return { step: 'users', model: new _pydioModelCell2['default']() };
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        this.refs.title.focus();
        this.state.model.observe('update', function () {
            _this.forceUpdate();
        });
    },

    componentWillUnmount: function componentWillUnmount() {
        this.state.model.stopObserving('update');
    },

    submit: function submit() {
        var _this2 = this;

        var model = this.state.model;

        model.save().then(function (result) {
            _this2.props.onDismiss();
        })['catch'](function (reason) {
            pydio.UI.displayMessage('ERROR', reason.message);
        });
    },

    m: function m(id) {
        return this.props.pydio.MessageHash['share_center.' + id];
    },

    computeSummaryString: function computeSummaryString() {
        var model = this.state.model;

        var users = 0;
        var groups = 0;
        var teams = 0;
        var userString = [];
        var objs = model.getAcls();
        Object.keys(objs).map(function (k) {
            var acl = objs[k];
            if (acl.Group) groups++;else if (acl.Role) teams++;else users++;
        });
        if (users) userString.push(users + ' ' + this.m(270));
        if (groups) userString.push(groups + ' ' + this.m(271));
        if (teams) userString.push(teams + ' ' + this.m(272));
        var finalString = undefined;
        if (userString.length === 3) {
            finalString = userString[0] + ', ' + userString[1] + this.m(274) + userString[3];
        } else if (userString.length === 0) {
            finalString = this.m(273);
        } else {
            finalString = userString.join(this.m(274));
        }
        return this.m(269).replace('%USERS', finalString);
    },

    render: function render() {
        var _this3 = this;

        var buttons = [];
        var content = undefined;
        var _props = this.props;
        var pydio = _props.pydio;
        var muiTheme = _props.muiTheme;
        var _state = this.state;
        var step = _state.step;
        var model = _state.model;

        if (step === 'users') {

            content = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    null,
                    this.m(275)
                ),
                _react2['default'].createElement(_materialUi.TextField, { ref: "title", floatingLabelText: this.m(276), value: model.getLabel(), onChange: function (e, v) {
                        model.setLabel(v);
                    }, fullWidth: true }),
                _react2['default'].createElement(_materialUi.TextField, { floatingLabelText: this.m(277), value: model.getDescription(), onChange: function (e, v) {
                        model.setDescription(v);
                    }, fullWidth: true })
            );

            buttons.push(_react2['default'].createElement(_materialUi.FlatButton, {
                key: 'next1',
                disabled: !model.getLabel(),
                primary: true,
                label: pydio.MessageHash['179'], // Next
                onTouchTap: function () {
                    _this3.setState({ step: 'data' });
                } }));
        } else if (step === 'data') {

            content = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    null,
                    this.m(278)
                ),
                _react2['default'].createElement(_SharedUsers2['default'], {
                    pydio: pydio,
                    cellAcls: model.getAcls(),

                    excludes: [pydio.user.id],
                    onUserObjectAdd: model.addUser.bind(model),
                    onUserObjectRemove: model.removeUser.bind(model),
                    onUserObjectUpdateRight: model.updateUserRight.bind(model)
                })
            );

            buttons.push(_react2['default'].createElement(_materialUi.FlatButton, { key: 'prev1', primary: false, label: pydio.MessageHash['304'], onTouchTap: function () {
                    _this3.setState({ step: 'users' });
                } }));
            buttons.push(_react2['default'].createElement(_materialUi.FlatButton, { key: 'next2', primary: true, label: pydio.MessageHash['179'], onTouchTap: function () {
                    return _this3.setState({ step: 'label' });
                } }));
        } else {

            content = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    null,
                    this.computeSummaryString()
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { paddingTop: 24 } },
                    _react2['default'].createElement(_NodesPicker2['default'], { pydio: pydio, model: model })
                )
            );

            buttons.push(_react2['default'].createElement(_materialUi.FlatButton, { key: 'prev2', primary: false, label: pydio.MessageHash['304'], onTouchTap: function () {
                    _this3.setState({ step: 'data' });
                } }));
            buttons.push(_react2['default'].createElement(_materialUi.FlatButton, { key: 'submit', primary: true, label: this.m(279), onTouchTap: this.submit.bind(this) }));
        }

        var primary1Color = muiTheme.palette.primary1Color;

        return _react2['default'].createElement(
            'div',
            { style: { width: 380, fontSize: 13, color: 'rgba(0,0,0,.87)', display: 'flex', flexDirection: 'column', minHeight: 300 } },
            _react2['default'].createElement(
                'div',
                { style: { backgroundColor: primary1Color, color: 'white', display: 'flex', alignItems: 'center', paddingLeft: 20 } },
                _react2['default'].createElement(_materialUi.FontIcon, { className: "icomoon-cells-full-plus", color: "white" }),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: 20, fontSize: 22 } },
                    pydio.MessageHash['418']
                )
            ),
            _react2['default'].createElement(
                'div',
                { style: { padding: '20px 20px 10px', flex: 1 } },
                content
            ),
            _react2['default'].createElement(
                'div',
                { style: { padding: 8, textAlign: 'right' } },
                buttons
            )
        );
    }

});

exports['default'] = CreateCellDialog = (0, _materialUiStyles.muiThemeable)()(CreateCellDialog);
exports['default'] = CreateCellDialog;
module.exports = exports['default'];

},{"./NodesPicker":5,"./SharedUsers":7,"material-ui":"material-ui","material-ui/styles":"material-ui/styles","pydio/model/cell":"pydio/model/cell","react":"react"}],4:[function(require,module,exports){
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

var _SharedUsers = require('./SharedUsers');

var _SharedUsers2 = _interopRequireDefault(_SharedUsers);

var _NodesPicker = require('./NodesPicker');

var _NodesPicker2 = _interopRequireDefault(_NodesPicker);

var _mainGenericEditor = require('../main/GenericEditor');

var _mainGenericEditor2 = _interopRequireDefault(_mainGenericEditor);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var React = require('react');

var _require = require('material-ui');

var TextField = _require.TextField;

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var ResourcePoliciesPanel = _Pydio$requireLib.ResourcePoliciesPanel;

/**
 * Dialog for letting users create a workspace
 */
exports['default'] = React.createClass({
    displayName: 'EditCellDialog',

    childContextTypes: {
        messages: React.PropTypes.object,
        getMessage: React.PropTypes.func,
        isReadonly: React.PropTypes.func
    },

    getChildContext: function getChildContext() {
        var messages = this.props.pydio.MessageHash;
        return {
            messages: messages,
            getMessage: function getMessage(messageId) {
                var namespace = arguments.length <= 1 || arguments[1] === undefined ? 'share_center' : arguments[1];

                try {
                    return messages[namespace + (namespace ? "." : "") + messageId] || messageId;
                } catch (e) {
                    return messageId;
                }
            },
            isReadonly: function isReadonly() {
                return false;
            }
        };
    },

    submit: function submit() {
        var _this = this;

        var _props = this.props;
        var model = _props.model;
        var pydio = _props.pydio;

        var dirtyRoots = model.hasDirtyRootNodes();
        model.save().then(function (result) {
            _this.forceUpdate();
            if (dirtyRoots && model.getUuid() === pydio.user.getActiveRepository()) {
                pydio.goTo('/');
                pydio.fireContextRefresh();
            }
        })['catch'](function (reason) {
            pydio.UI.displayMessage('ERROR', reason.message);
        });
    },

    render: function render() {
        var _props2 = this.props;
        var pydio = _props2.pydio;
        var model = _props2.model;
        var sendInvitations = _props2.sendInvitations;

        var m = function m(id) {
            return pydio.MessageHash['share_center.' + id];
        };

        var header = React.createElement(
            'div',
            null,
            React.createElement(TextField, { style: { marginTop: -14 }, floatingLabelText: m(267), value: model.getLabel(), onChange: function (e, v) {
                    model.setLabel(v);
                }, fullWidth: true }),
            React.createElement(TextField, { style: { marginTop: -14 }, floatingLabelText: m(268), value: model.getDescription(), onChange: function (e, v) {
                    model.setDescription(v);
                }, fullWidth: true })
        );
        var tabs = {
            left: [{
                Label: m(54),
                Value: 'users',
                Component: React.createElement(_SharedUsers2['default'], {
                    pydio: pydio,
                    cellAcls: model.getAcls(),
                    excludes: [pydio.user.id],
                    sendInvitations: sendInvitations,
                    onUserObjectAdd: model.addUser.bind(model),
                    onUserObjectRemove: model.removeUser.bind(model),
                    onUserObjectUpdateRight: model.updateUserRight.bind(model)
                })
            }, {
                Label: m(253),
                Value: 'permissions',
                Component: React.createElement(ResourcePoliciesPanel, {
                    pydio: pydio,
                    resourceType: 'workspace',
                    resourceId: model.getUuid(),
                    style: {},
                    skipTitle: true,
                    onSavePolicies: function () {},
                    readonly: false,
                    cellAcls: model.getAcls()
                })
            }],
            right: [{
                Label: m(249),
                Value: 'content',
                Component: React.createElement(_NodesPicker2['default'], { pydio: pydio, model: model, mode: 'edit' })
            }]
        };

        return React.createElement(_mainGenericEditor2['default'], {
            pydio: pydio,
            tabs: tabs,
            header: header,
            saveEnabled: model.isDirty(),
            onSaveAction: this.submit.bind(this),
            onCloseAction: this.props.onDismiss,
            onRevertAction: function () {
                model.revertChanges();
            }
        });
    }

});
module.exports = exports['default'];

},{"../main/GenericEditor":27,"./NodesPicker":5,"./SharedUsers":7,"material-ui":"material-ui","pydio":"pydio","react":"react"}],5:[function(require,module,exports){
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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _require$requireLib = require('pydio').requireLib('components');

var FoldersTree = _require$requireLib.FoldersTree;

var NodesPicker = (function (_React$Component) {
    _inherits(NodesPicker, _React$Component);

    function NodesPicker(props) {
        _classCallCheck(this, NodesPicker);

        _get(Object.getPrototypeOf(NodesPicker.prototype), 'constructor', this).call(this, props);
        var crtWs = undefined;

        var user = props.pydio.user;
        var avail = [];
        user.getRepositoriesList().forEach(function (repo) {
            if (repo.getAccessType() === 'gateway') {
                if (repo.getId() === user.activeRepository) {
                    if (repo.getOwner() === 'shared') {
                        return; // do not push to the list
                    }
                    crtWs = repo;
                }
                avail.push(repo);
            }
        });
        var availableWs = [];
        var notOwned = avail.filter(function (repo) {
            return !repo.getOwner();
        });
        var owned = avail.filter(function (repo) {
            return repo.getOwner();
        });
        if (notOwned.length && owned.length) {
            availableWs = [].concat(_toConsumableArray(notOwned), ['DIVIDER'], _toConsumableArray(owned));
        } else {
            availableWs = [].concat(_toConsumableArray(notOwned), _toConsumableArray(owned));
        }

        var dm = undefined;
        if (availableWs.length) {
            if (!crtWs) {
                crtWs = availableWs[0];
            }
            dm = _pydioModelDataModel2['default'].RemoteDataModelFactory({ tmp_repository_id: crtWs.getId() });
            var root = dm.getRootNode();
            root.getMetadata().set('repository_id', crtWs.getId());
            root.load();
        }

        this.state = {
            dataModel: dm,
            open: false,
            availableWs: availableWs,
            crtWs: crtWs
        };
    }

    _createClass(NodesPicker, [{
        key: 'switchWorkspace',
        value: function switchWorkspace(ws) {
            var dm = _pydioModelDataModel2['default'].RemoteDataModelFactory({ tmp_repository_id: ws.getId() });
            var root = dm.getRootNode();
            root.getMetadata().set('repository_id', ws.getId());
            root.load();
            this.setState({ crtWs: ws, dataModel: dm });
        }
    }, {
        key: 'handleTouchTap',
        value: function handleTouchTap(event) {
            // This prevents ghost click.
            event.preventDefault();

            this.setState({
                open: true,
                anchorEl: event.currentTarget
            });
        }
    }, {
        key: 'handleRequestClose',
        value: function handleRequestClose() {
            this.setState({
                open: false
            });
        }
    }, {
        key: 'onValidateNode',
        value: function onValidateNode() {
            var node = this.state.node;

            this.props.model.addRootNode(node);
            this.handleRequestClose();
        }
    }, {
        key: 'onNodeSelected',
        value: function onNodeSelected(node) {
            node.load();
            this.setState({ node: node });
        }

        /**
         *
         * @param node TreeNode
         * @return {XML}
         */
    }, {
        key: 'renderNodeLine',
        value: function renderNodeLine(node) {
            var model = this.props.model;

            return _react2['default'].createElement(_materialUi.ListItem, {
                disabled: true,
                leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-folder' }),
                primaryText: model.getNodeLabelInContext(node),
                rightIconButton: _react2['default'].createElement(_materialUi.IconButton, { onTouchTap: function () {
                        model.removeRootNode(node.Uuid);
                    }, iconClassName: 'mdi mdi-delete', tooltip: 'Remove', iconStyle: { color: 'rgba(0,0,0,.43)' } })
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props = this.props;
            var model = _props.model;
            var muiTheme = _props.muiTheme;
            var mode = _props.mode;
            var pydio = _props.pydio;

            var m = function m(id) {
                return pydio.MessageHash['share_center.' + id];
            };
            var nodes = model.getRootNodes();
            var nodeLines = [],
                emptyStateString = undefined;
            nodes.map(function (node) {
                nodeLines.push(_this.renderNodeLine(node));
                nodeLines.push(_react2['default'].createElement(_materialUi.Divider, { inset: true }));
            });
            nodeLines.pop();
            if (!nodes.length) {
                if (mode === 'edit') {
                    emptyStateString = _react2['default'].createElement(
                        'span',
                        { style: { color: 'rgba(0,0,0,.54)', fontStyle: 'italic' } },
                        m(280)
                    );
                } else {
                    emptyStateString = _react2['default'].createElement(
                        'span',
                        { style: { color: 'rgba(0,0,0,.54)', fontStyle: 'italic' } },
                        m(281)
                    );
                }
            }
            var _state = this.state;
            var node = _state.node;
            var availableWs = _state.availableWs;
            var crtWs = _state.crtWs;

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(_materialUi.FlatButton, {
                    label: m(282),
                    onTouchTap: this.handleTouchTap.bind(this),
                    primary: true,
                    style: { marginBottom: 10 },
                    icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-folder-plus" })
                }),
                _react2['default'].createElement(
                    _materialUi.List,
                    null,
                    nodeLines
                ),
                emptyStateString,
                _react2['default'].createElement(
                    _materialUi.Popover,
                    {
                        open: this.state.open,
                        anchorEl: this.state.anchorEl,
                        anchorOrigin: { horizontal: 'left', vertical: 'bottom' },
                        targetOrigin: { horizontal: 'left', vertical: 'top' },
                        onRequestClose: this.handleRequestClose.bind(this)
                    },
                    _react2['default'].createElement(
                        'div',
                        { style: { width: 372, height: 300, display: 'flex', flexDirection: 'column' } },
                        _react2['default'].createElement(
                            _materialUi.DropDownMenu,
                            { style: { height: 54 }, value: crtWs, onChange: function (e, i, v) {
                                    _this.switchWorkspace(v);
                                } },
                            availableWs.map(function (ws) {
                                if (ws === 'DIVIDER') {
                                    return _react2['default'].createElement(_materialUi.Divider, null);
                                } else {
                                    return _react2['default'].createElement(_materialUi.MenuItem, { value: ws, primaryText: ws.getLabel() });
                                }
                            })
                        ),
                        _react2['default'].createElement(_materialUi.Divider, null),
                        _react2['default'].createElement(
                            'div',
                            { style: { marginLeft: -26, flex: '1', overflowY: 'auto', fontSize: 15, color: 'rgba(0,0,0,.73)' } },
                            _react2['default'].createElement(FoldersTree, {
                                pydio: this.props.pydio,
                                dataModel: this.state.dataModel,
                                onNodeSelected: this.onNodeSelected.bind(this),
                                showRoot: false,
                                draggable: false
                            })
                        ),
                        _react2['default'].createElement(_materialUi.Divider, null),
                        _react2['default'].createElement(
                            'div',
                            { style: { display: 'flex', padding: '4px 16px', alignItems: 'center', fontSize: 15 } },
                            node && _react2['default'].createElement(
                                'div',
                                { style: { flex: 1, color: 'rgba(0,0,0,.87)' } },
                                node && node.getPath()
                            ),
                            !node && _react2['default'].createElement(
                                'div',
                                { style: { flex: 1, color: 'rgba(0,0,0,.54)', fontWeight: 500 } },
                                m(283)
                            ),
                            _react2['default'].createElement(_materialUi.IconButton, { iconStyle: { color: muiTheme.palette.primary1Color }, disabled: !node, iconClassName: "mdi mdi-plus-circle-outline", onTouchTap: this.onValidateNode.bind(this) })
                        )
                    )
                )
            );
        }
    }]);

    return NodesPicker;
})(_react2['default'].Component);

exports['default'] = NodesPicker = (0, _materialUiStyles.muiThemeable)()(NodesPicker);
exports['default'] = NodesPicker;
module.exports = exports['default'];

},{"material-ui":"material-ui","material-ui/styles":"material-ui/styles","pydio":"pydio","pydio/model/data-model":"pydio/model/data-model","react":"react"}],6:[function(require,module,exports){
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

var _UserBadge = require('./UserBadge');

var _UserBadge2 = _interopRequireDefault(_UserBadge);

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var React = require('react');

var SharedUserEntry = React.createClass({
    displayName: 'SharedUserEntry',

    propTypes: {
        cellAcl: React.PropTypes.object.isRequired,
        sendInvitations: React.PropTypes.func,
        onUserObjectRemove: React.PropTypes.func.isRequired,
        onUserObjectUpdateRight: React.PropTypes.func.isRequired
    },
    onRemove: function onRemove() {
        this.props.onUserObjectRemove(this.props.cellAcl.RoleId);
    },
    onInvite: function onInvite() {
        var targets = {};
        var userObject = PydioUsers.User.fromIdmUser(this.props.cellAcl.User);
        targets[userObject.getId()] = userObject;
        this.props.sendInvitations(targets);
    },
    onUpdateRight: function onUpdateRight(event) {
        var target = event.target;
        this.props.onUserObjectUpdateRight(this.props.cellAcl.RoleId, target.name, target.checked);
    },
    render: function render() {
        var _props = this.props;
        var cellAcl = _props.cellAcl;
        var pydio = _props.pydio;

        var menuItems = [];
        var type = cellAcl.User ? 'user' : cellAcl.Group ? 'group' : 'team';

        // Do not render current user
        if (cellAcl.User && cellAcl.User.Login === pydio.user.id) {
            return null;
        }

        if (type != 'group') {
            if (this.props.sendInvitations) {
                // Send invitation
                menuItems.push({
                    text: this.props.getMessage('45'),
                    callback: this.onInvite
                });
            }
        }
        if (!this.props.isReadonly() && !this.props.readonly) {
            // Remove Entry
            menuItems.push({
                text: this.props.getMessage('257', ''),
                callback: this.onRemove
            });
        }

        var label = undefined,
            avatar = undefined;
        switch (type) {
            case "user":
                label = cellAcl.User.Attributes["displayName"] || cellAcl.User.Login;
                avatar = cellAcl.User.Attributes["avatar"];
                break;
            case "group":
                if (!cellAcl.Group.Attributes) {
                    label = cellAcl.Group.Uuid;
                } else {
                    label = cellAcl.Group.Attributes["displayName"] || cellAcl.Group.GroupLabel;
                }
                break;
            case "team":
                if (!cellAcl.Role) {
                    label = "No role found";
                } else {
                    label = cellAcl.Role.Label;
                }
                break;
            default:
                label = cellAcl.RoleId;
                break;
        }
        var read = false,
            write = false;
        cellAcl.Actions.map(function (action) {
            if (action.Name === 'read') read = true;
            if (action.Name === 'write') write = true;
        });

        return React.createElement(
            _UserBadge2['default'],
            {
                label: label,
                avatar: avatar,
                type: type,
                menus: menuItems
            },
            React.createElement(
                'span',
                { className: 'user-badge-rights-container', style: !menuItems.length ? { marginRight: 48 } : {} },
                React.createElement('input', { type: 'checkbox', name: 'read', disabled: this.props.isReadonly() || this.props.readonly, checked: read, onChange: this.onUpdateRight }),
                React.createElement('input', { type: 'checkbox', name: 'write', disabled: this.props.isReadonly() || this.props.readonly, checked: write, onChange: this.onUpdateRight })
            )
        );
    }
});

exports['default'] = SharedUserEntry = (0, _ShareContextConsumer2['default'])(SharedUserEntry);
exports['default'] = SharedUserEntry;
module.exports = exports['default'];

},{"../ShareContextConsumer":1,"./UserBadge":8,"react":"react"}],7:[function(require,module,exports){
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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var _UserBadge = require('./UserBadge');

var _UserBadge2 = _interopRequireDefault(_UserBadge);

var _SharedUserEntry = require('./SharedUserEntry');

var _SharedUserEntry2 = _interopRequireDefault(_SharedUserEntry);

var _mainActionButton = require('../main/ActionButton');

var _mainActionButton2 = _interopRequireDefault(_mainActionButton);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var UsersCompleter = _Pydio$requireLib.UsersCompleter;

var SharedUsers = _react2['default'].createClass({
    displayName: 'SharedUsers',

    propTypes: {
        pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default']),

        cellAcls: _react2['default'].PropTypes.object,

        saveSelectionAsTeam: _react2['default'].PropTypes.func,
        sendInvitations: _react2['default'].PropTypes.func,
        showTitle: _react2['default'].PropTypes.bool,

        onUserObjectAdd: _react2['default'].PropTypes.func.isRequired,
        onUserObjectRemove: _react2['default'].PropTypes.func.isRequired,
        onUserObjectUpdateRight: _react2['default'].PropTypes.func.isRequired

    },
    sendInvitationToAllUsers: function sendInvitationToAllUsers() {
        var _props = this.props;
        var cellAcls = _props.cellAcls;
        var pydio = _props.pydio;

        var userObjects = [];
        Object.keys(cellAcls).map(function (k) {
            var acl = cellAcls[k];
            if (acl.User && acl.User.Login === pydio.user.id) {
                return;
            }
            if (acl.User) {
                var userObject = PydioUsers.User.fromIdmUser(acl.User);
                userObjects[userObject.getId()] = userObject;
            }
        });
        this.props.sendInvitations(userObjects);
    },
    clearAllUsers: function clearAllUsers() {
        var _this = this;

        Object.keys(this.props.cellAcls).map(function (k) {
            _this.props.onUserObjectRemove(k);
        });
    },
    valueSelected: function valueSelected(userObject) {
        if (userObject.IdmUser) {
            this.props.onUserObjectAdd(userObject.IdmUser);
        } else {
            this.props.onUserObjectAdd(userObject.IdmRole);
        }
    },
    render: function render() {
        var _this2 = this;

        var _props2 = this.props;
        var cellAcls = _props2.cellAcls;
        var pydio = _props2.pydio;

        var index = 0;
        var userEntries = [];
        Object.keys(cellAcls).map(function (k) {
            var acl = cellAcls[k];
            if (acl.User && acl.User.Login === pydio.user.id) {
                return;
            }
            index++;
            userEntries.push(_react2['default'].createElement(_SharedUserEntry2['default'], {
                cellAcl: acl,
                key: index,
                pydio: _this2.props.pydio,
                readonly: _this2.props.readonly,
                sendInvitations: _this2.props.sendInvitations,
                onUserObjectRemove: _this2.props.onUserObjectRemove,
                onUserObjectUpdateRight: _this2.props.onUserObjectUpdateRight
            }));
        });

        var actionLinks = [];
        var aclsLength = Object.keys(this.props.cellAcls).length;
        if (aclsLength && !this.props.isReadonly() && !this.props.readonly) {
            actionLinks.push(_react2['default'].createElement(_mainActionButton2['default'], { key: 'clear', callback: this.clearAllUsers, mdiIcon: 'delete', messageId: '180' }));
        }
        if (aclsLength && this.props.sendInvitations) {
            actionLinks.push(_react2['default'].createElement(_mainActionButton2['default'], { key: 'invite', callback: this.sendInvitationToAllUsers, mdiIcon: 'email-outline', messageId: '45' }));
        }
        if (this.props.saveSelectionAsTeam && aclsLength > 1 && !this.props.isReadonly() && !this.props.readonly) {
            actionLinks.push(_react2['default'].createElement(_mainActionButton2['default'], { key: 'team', callback: this.props.saveSelectionAsTeam, mdiIcon: 'account-multiple-plus', messageId: '509', messageCoreNamespace: true }));
        }
        var rwHeader = undefined,
            usersInput = undefined;
        if (userEntries.length) {
            rwHeader = _react2['default'].createElement(
                'div',
                { style: { display: 'flex', marginBottom: -8, marginTop: -8, color: 'rgba(0,0,0,.33)', fontSize: 12 } },
                _react2['default'].createElement('div', { style: { flex: 1 } }),
                _react2['default'].createElement(
                    'div',
                    { style: { width: 43, textAlign: 'center' } },
                    _react2['default'].createElement(
                        'span',
                        { style: { borderBottom: '2px solid rgba(0,0,0,0.13)' } },
                        this.props.getMessage('361', '')
                    )
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { width: 43, textAlign: 'center' } },
                    _react2['default'].createElement(
                        'span',
                        { style: { borderBottom: '2px solid rgba(0,0,0,0.13)' } },
                        this.props.getMessage('181')
                    )
                ),
                _react2['default'].createElement('div', { style: { width: 52 } })
            );
        }
        if (!this.props.isReadonly() && !this.props.readonly) {
            usersInput = _react2['default'].createElement(UsersCompleter, {
                className: 'share-form-users',
                fieldLabel: this.props.getMessage('34'),
                onValueSelected: this.valueSelected,
                pydio: this.props.pydio,
                showAddressBook: true,
                usersFrom: 'local',
                excludes: Object.values(cellAcls)
            });
        }

        return _react2['default'].createElement(
            'div',
            null,
            _react2['default'].createElement(
                'div',
                { style: userEntries.length ? { margin: '-20px 8px 16px' } : { marginTop: -20 } },
                usersInput
            ),
            rwHeader,
            _react2['default'].createElement(
                'div',
                null,
                userEntries
            ),
            !userEntries.length && _react2['default'].createElement(
                'div',
                { style: { color: 'rgba(0,0,0,0.43)' } },
                this.props.getMessage('182')
            ),
            userEntries.length > 0 && _react2['default'].createElement(
                'div',
                { style: { textAlign: 'center' } },
                actionLinks
            )
        );
    }
});

exports['default'] = SharedUsers = (0, _ShareContextConsumer2['default'])(SharedUsers);
exports['default'] = SharedUsers;
module.exports = exports['default'];

},{"../ShareContextConsumer":1,"../main/ActionButton":25,"./SharedUserEntry":6,"./UserBadge":8,"pydio":"pydio","react":"react"}],8:[function(require,module,exports){
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('react');

var Component = _require.Component;
var PropTypes = _require.PropTypes;

var _require2 = require('material-ui');

var MenuItem = _require2.MenuItem;
var IconMenu = _require2.IconMenu;
var IconButton = _require2.IconButton;

var _require3 = require('material-ui/styles');

var muiThemeable = _require3.muiThemeable;

var Color = require('color');

var UserBadge = (function (_Component) {
    _inherits(UserBadge, _Component);

    function UserBadge() {
        _classCallCheck(this, UserBadge);

        _get(Object.getPrototypeOf(UserBadge.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(UserBadge, [{
        key: 'renderMenu',
        value: function renderMenu() {
            if (!this.props.menus || !this.props.menus.length) {
                return null;
            }
            var menuItems = this.props.menus.map(function (m) {
                var rightIcon = undefined;
                if (m.checked) {
                    rightIcon = React.createElement('span', { className: 'mdi mdi-check' });
                }
                return React.createElement(MenuItem, {
                    primaryText: m.text,
                    onTouchTap: m.callback,
                    rightIcon: rightIcon });
            });
            var iconStyle = { fontSize: 18 };
            return React.createElement(
                IconMenu,
                {
                    iconButtonElement: React.createElement(IconButton, { style: { padding: 16 }, iconStyle: iconStyle, iconClassName: 'icon-ellipsis-vertical' }),
                    anchorOrigin: { horizontal: 'right', vertical: 'top' },
                    targetOrigin: { horizontal: 'right', vertical: 'top' }
                },
                menuItems
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var avatar = undefined;
            var avatarColor = this.props.muiTheme.palette.avatarsColor;
            if (this.props.type == 'group') {
                avatarColor = Color(avatarColor).darken(.2).toString();
                avatar = React.createElement('span', { className: 'avatar mdi mdi-account-multiple', style: { backgroundColor: avatarColor } });
            } else if (this.props.type == 'team') {
                avatarColor = Color(avatarColor).darken(.2).toString();
                avatar = React.createElement('span', { className: 'avatar mdi mdi-account-multiple-outline', style: { backgroundColor: avatarColor } });
            } else if (this.props.type == 'temporary') {
                avatarColor = Color(avatarColor).lighten(.2).toString();
                avatar = React.createElement('span', { className: 'avatar mdi mdi-account-plus', style: { backgroundColor: avatarColor } });
            } else if (this.props.type == 'remote_user') {
                avatar = React.createElement('span', { className: 'avatar mdi mdi-account-network', style: { backgroundColor: avatarColor } });
            } else {
                avatar = React.createElement('span', { className: 'avatar mdi mdi-account', style: { backgroundColor: avatarColor } });
            }
            var menu = this.renderMenu();
            return React.createElement(
                'div',
                { className: "share-dialog user-badge user-type-" + this.props.type },
                avatar,
                React.createElement(
                    'span',
                    { className: 'user-badge-label' },
                    this.props.label
                ),
                this.props.children,
                menu
            );
        }
    }]);

    return UserBadge;
})(Component);

UserBadge.propTypes = {
    label: PropTypes.string,
    avatar: PropTypes.string,
    type: PropTypes.string,
    menus: PropTypes.object,
    muiTheme: PropTypes.object
};

exports['default'] = UserBadge = muiThemeable()(UserBadge);

exports['default'] = UserBadge;
module.exports = exports['default'];

},{"color":"color","material-ui":"material-ui","material-ui/styles":"material-ui/styles","react":"react"}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _CompositeModel = require('./CompositeModel');

var _CompositeModel2 = _interopRequireDefault(_CompositeModel);

var _cellsSharedUsers = require('../cells/SharedUsers');

var _cellsSharedUsers2 = _interopRequireDefault(_cellsSharedUsers);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUiStyles = require('material-ui/styles');

var _materialUi = require('material-ui');

var CellsList = (function (_React$Component) {
    _inherits(CellsList, _React$Component);

    function CellsList(props) {
        _classCallCheck(this, CellsList);

        _get(Object.getPrototypeOf(CellsList.prototype), 'constructor', this).call(this, props);
        this.state = { edit: null };
    }

    _createClass(CellsList, [{
        key: 'addToCellsMenuItems',
        value: function addToCellsMenuItems() {
            var _this = this;

            var items = [];
            // List user available cells - Exclude cells where this node is already shared
            var _props = this.props;
            var pydio = _props.pydio;
            var compositeModel = _props.compositeModel;

            var currentCells = compositeModel.getCells().map(function (cellModel) {
                return cellModel.getUuid();
            });
            pydio.user.getRepositoriesList().forEach(function (repository) {
                if (repository.getOwner() === 'shared' && currentCells.indexOf(repository.getId()) === -1) {
                    var touchTap = function touchTap() {
                        _this.setState({ addMenuOpen: false });
                        compositeModel.addToExistingCell(repository.getId());
                    };
                    items.push(_react2['default'].createElement(_materialUi.MenuItem, { primaryText: repository.getLabel(), onTouchTap: touchTap }));
                }
            });
            return items;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props2 = this.props;
            var compositeModel = _props2.compositeModel;
            var pydio = _props2.pydio;
            var usersInvitations = _props2.usersInvitations;
            var muiTheme = _props2.muiTheme;

            var m = function m(id) {
                return pydio.MessageHash['share_center.' + id];
            };
            var edit = this.state.edit;

            var cells = [];
            compositeModel.getCells().map(function (cellModel) {
                var label = cellModel.getLabel();
                var isEdit = !cellModel.getUuid() && edit === 'NEWCELL' || edit === cellModel.getUuid();
                var toggleState = function toggleState() {
                    if (isEdit && edit === 'NEWCELL') {
                        // Remove new cell if it was created empty
                        var acls = cellModel.getAcls();
                        if (!Object.keys(acls).length) {
                            compositeModel.removeNewCell(cellModel);
                        }
                    }
                    _this2.setState({ edit: isEdit ? null : cellModel.getUuid() });
                };

                var removeNode = function removeNode() {
                    cellModel.removeRootNode(compositeModel.getNode().getMetadata().get('uuid'));
                };
                var rightIcon = undefined;
                if (isEdit) {
                    rightIcon = _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-close", tooltip: pydio.MessageHash['86'], onTouchTap: toggleState });
                } else if (cellModel.isEditable()) {
                    rightIcon = _react2['default'].createElement(
                        _materialUi.IconMenu,
                        {
                            iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-dots-vertical" }),
                            anchorOrigin: { horizontal: 'right', vertical: 'top' },
                            targetOrigin: { horizontal: 'right', vertical: 'top' }
                        },
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: m(258), onTouchTap: toggleState }),
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: m(259), onTouchTap: removeNode })
                    );
                }
                cells.push(_react2['default'].createElement(_materialUi.ListItem, {
                    primaryText: label,
                    secondaryText: cellModel.getAclsSubjects(),
                    rightIconButton: rightIcon,
                    onTouchTap: toggleState,
                    style: isEdit ? { backgroundColor: 'rgb(245, 245, 245)' } : {},
                    disabled: edit === 'NEWCELL' && !isEdit
                }));
                if (isEdit) {
                    cells.push(_react2['default'].createElement(
                        _materialUi.Paper,
                        { zDepth: 0, style: { backgroundColor: 'rgb(245, 245, 245)', margin: '0 0 16px', padding: '0 10px 10px' } },
                        _react2['default'].createElement(_cellsSharedUsers2['default'], {
                            pydio: pydio,
                            cellAcls: cellModel.getAcls(),
                            excludes: [pydio.user.id],
                            onUserObjectAdd: cellModel.addUser.bind(cellModel),
                            onUserObjectRemove: cellModel.removeUser.bind(cellModel),
                            onUserObjectUpdateRight: cellModel.updateUserRight.bind(cellModel),
                            sendInvitations: function (targetUsers) {
                                return usersInvitations(targetUsers, cellModel);
                            },
                            saveSelectionAsTeam: false,
                            readonly: !cellModel.isEditable()
                        })
                    ));
                }
                cells.push(_react2['default'].createElement(_materialUi.Divider, null));
            });
            cells.pop();

            var legend = undefined;
            if (cells.length && edit !== 'NEWCELL') {
                legend = _react2['default'].createElement(
                    'div',
                    null,
                    m(260)
                );
            } else if (cells.length && edit === 'NEWCELL') {
                legend = _react2['default'].createElement(
                    'div',
                    null,
                    m(261)
                );
            } else {
                legend = _react2['default'].createElement(
                    'div',
                    { style: { padding: '21px 16px 21px 0px', cursor: 'pointer', display: 'flex', alignItems: 'center' }, onTouchTap: function () {
                            compositeModel.createEmptyCell();_this2.setState({ edit: 'NEWCELL' });
                        } },
                    _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "icomoon-cells-clear-plus", iconStyle: { color: muiTheme.palette.primary1Color } }),
                    _react2['default'].createElement(
                        'span',
                        { style: { flex: 1, marginLeft: 8 } },
                        m(262)
                    )
                );
            }

            var addCellItems = this.addToCellsMenuItems();
            var addToCellMenu = undefined;
            if (addCellItems.length) {
                addToCellMenu = _react2['default'].createElement(
                    'span',
                    null,
                    _react2['default'].createElement(_materialUi.RaisedButton, {
                        style: { marginLeft: 10 },
                        primary: true,
                        label: m(263),
                        onTouchTap: function (event) {
                            _this2.setState({ addMenuOpen: true, addMenuAnchor: event.target });
                        }
                    }),
                    _react2['default'].createElement(
                        _materialUi.Popover,
                        {
                            open: this.state.addMenuOpen,
                            anchorEl: this.state.addMenuAnchor,
                            onRequestClose: function () {
                                _this2.setState({ addMenuOpen: false });
                            },
                            anchorOrigin: { horizontal: 'left', vertical: 'bottom' },
                            targetOrigin: { horizontal: 'left', vertical: 'top' }
                        },
                        _react2['default'].createElement(
                            _materialUi.Menu,
                            null,
                            addCellItems
                        )
                    )
                );
            }

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { style: { paddingBottom: 20 } },
                    _react2['default'].createElement(_materialUi.RaisedButton, { label: m(264), primary: true, onTouchTap: function () {
                            compositeModel.createEmptyCell();_this2.setState({ edit: 'NEWCELL' });
                        } }),
                    addToCellMenu
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { fontSize: 13, fontWeight: 500, color: 'rgba(0, 0, 0, 0.43)' } },
                    legend
                ),
                _react2['default'].createElement(
                    _materialUi.List,
                    null,
                    cells
                )
            );
        }
    }]);

    return CellsList;
})(_react2['default'].Component);

CellsList.PropTypes = {
    pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default']),
    compositeModel: _react2['default'].PropTypes.instanceOf(_CompositeModel2['default']).isRequired,
    usersInvitations: _react2['default'].PropTypes.func
};

exports['default'] = CellsList = (0, _materialUiStyles.muiThemeable)()(CellsList);

exports['default'] = CellsList;
module.exports = exports['default'];

},{"../cells/SharedUsers":7,"./CompositeModel":12,"material-ui":"material-ui","material-ui/styles":"material-ui/styles","pydio":"pydio","react":"react"}],10:[function(require,module,exports){
(function (global){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _mainGenericCard = require('../main/GenericCard');

var _compositeCompositeModel = require('../composite/CompositeModel');

var _compositeCompositeModel2 = _interopRequireDefault(_compositeCompositeModel);

var _mainGenericEditor = require('../main/GenericEditor');

var _mainGenericEditor2 = _interopRequireDefault(_mainGenericEditor);

var _linksPanel = require('../links/Panel');

var _linksPanel2 = _interopRequireDefault(_linksPanel);

var _linksSecureOptions = require('../links/SecureOptions');

var _linksSecureOptions2 = _interopRequireDefault(_linksSecureOptions);

var _mainShareHelper = require('../main/ShareHelper');

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var _Mailer = require('./Mailer');

var _Mailer2 = _interopRequireDefault(_Mailer);

var _CellsList = require('./CellsList');

var _CellsList2 = _interopRequireDefault(_CellsList);

var _clipboard = require('clipboard');

var _clipboard2 = _interopRequireDefault(_clipboard);

var _linksPublicLinkTemplate = require('../links/PublicLinkTemplate');

var _linksPublicLinkTemplate2 = _interopRequireDefault(_linksPublicLinkTemplate);

var _linksVisibilityPanel = require('../links/VisibilityPanel');

var _linksVisibilityPanel2 = _interopRequireDefault(_linksVisibilityPanel);

var _linksLabelPanel = require('../links/LabelPanel');

var _linksLabelPanel2 = _interopRequireDefault(_linksLabelPanel);

var _materialUi = require('material-ui');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _require$requireLib = require('pydio').requireLib('hoc');

var PaletteModifier = _require$requireLib.PaletteModifier;

var _Pydio$requireLib = _pydio2['default'].requireLib("boot");

var Tooltip = _Pydio$requireLib.Tooltip;

var CompositeCard = (function (_React$Component) {
    _inherits(CompositeCard, _React$Component);

    function CompositeCard(props) {
        _classCallCheck(this, CompositeCard);

        _get(Object.getPrototypeOf(CompositeCard.prototype), 'constructor', this).call(this, props);
        this.state = {
            mode: this.props.mode || 'view',
            model: new _compositeCompositeModel2['default'](this.props.mode === 'edit')
        };
    }

    _createClass(CompositeCard, [{
        key: 'attachClipboard',
        value: function attachClipboard() {
            var pydio = this.props.pydio;

            var m = function m(id) {
                return pydio.MessageHash['share_center.' + id];
            };
            var model = this.state.model;

            this.detachClipboard();
            if (!model.getLinks().length) {
                return;
            }
            var linkModel = model.getLinks()[0];
            if (!linkModel.getLink()) {
                return;
            }
            if (this.refs['copy-button']) {
                this._clip = new _clipboard2['default'](this.refs['copy-button'], {
                    text: (function (trigger) {
                        return _mainShareHelper2['default'].buildPublicUrl(pydio, linkModel.getLink().LinkHash);
                    }).bind(this)
                });
                this._clip.on('success', (function () {
                    var _this = this;

                    this.setState({ copyMessage: m('192') }, function () {
                        setTimeout(function () {
                            _this.setState({ copyMessage: null });
                        }, 2500);
                    });
                }).bind(this));
                this._clip.on('error', (function () {
                    var _this2 = this;

                    var copyMessage = undefined;
                    if (global.navigator.platform.indexOf("Mac") === 0) {
                        copyMessage = m(144);
                    } else {
                        copyMessage = m(143);
                    }
                    this.setState({ copyMessage: copyMessage }, function () {
                        setTimeout(function () {
                            _this2.setState({ copyMessage: null });
                        }, 2500);
                    });
                }).bind(this));
            }
        }
    }, {
        key: 'detachClipboard',
        value: function detachClipboard() {
            if (this._clip) {
                this._clip.destroy();
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this3 = this;

            var _props = this.props;
            var node = _props.node;
            var mode = _props.mode;

            this.state.model.observe("update", function () {
                _this3.forceUpdate();
            });
            this.state.model.load(node, mode === 'infoPanel');
            this.attachClipboard();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.state.model.stopObserving("update");
            this.detachClipboard();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.attachClipboard();
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(props) {
            if (props.node && (props.node !== this.props.node || props.node.getMetadata('pydio_shares') !== this.props.node.getMetadata('pydio_shares'))) {
                this.state.model.load(props.node, props.mode === 'infoPanel');
            }
        }
    }, {
        key: 'usersInvitations',
        value: function usersInvitations(userObjects, cellModel) {
            _mainShareHelper2['default'].sendCellInvitation(this.props.node, cellModel, userObjects);
        }
    }, {
        key: 'linkInvitation',
        value: function linkInvitation(linkModel) {
            try {
                var mailData = _mainShareHelper2['default'].prepareEmail(this.props.node, linkModel);
                this.setState({ mailerData: _extends({}, mailData, { users: [], linkModel: linkModel }) });
            } catch (e) {
                alert(e.message);
            }
        }
    }, {
        key: 'dismissMailer',
        value: function dismissMailer() {
            this.setState({ mailerData: null });
        }
    }, {
        key: 'submit',
        value: function submit() {
            try {
                this.state.model.save();
            } catch (e) {
                this.props.pydio.UI.displayMessage('ERROR', e.message);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var _props2 = this.props;
            var node = _props2.node;
            var mode = _props2.mode;
            var pydio = _props2.pydio;
            var _state = this.state;
            var model = _state.model;
            var mailerData = _state.mailerData;
            var linkTooltip = _state.linkTooltip;
            var copyMessage = _state.copyMessage;

            var m = function m(id) {
                return pydio.MessageHash['share_center.' + id];
            };

            if (mode === 'edit') {

                var publicLinkModel = undefined;
                if (model.getLinks().length) {
                    publicLinkModel = model.getLinks()[0];
                }
                var header = undefined;
                if (publicLinkModel && publicLinkModel.getLinkUuid() && publicLinkModel.isEditable()) {
                    header = _react2['default'].createElement(
                        'div',
                        null,
                        _react2['default'].createElement(_Mailer2['default'], _extends({}, mailerData, { pydio: pydio, onDismiss: this.dismissMailer.bind(this) })),
                        _react2['default'].createElement(_linksLabelPanel2['default'], { pydio: pydio, linkModel: publicLinkModel })
                    );
                } else {
                    header = _react2['default'].createElement(
                        'div',
                        { style: { fontSize: 24, padding: '26px 10px 0 ', lineHeight: '26px' } },
                        _react2['default'].createElement(_Mailer2['default'], _extends({}, mailerData, { pydio: pydio, onDismiss: this.dismissMailer.bind(this) })),
                        m(256).replace('%s', node.getLabel())
                    );
                }
                var tabs = { left: [], right: [], leftStyle: { padding: 0 } };
                tabs.right.push({
                    Label: m(250),
                    Value: "cells",
                    Component: _react2['default'].createElement(_CellsList2['default'], { pydio: pydio, compositeModel: model, usersInvitations: this.usersInvitations.bind(this) })
                });
                var links = model.getLinks();
                if (publicLinkModel) {
                    tabs.left.push({
                        Label: m(251),
                        Value: 'public-link',
                        Component: _react2['default'].createElement(_linksPanel2['default'], {
                            pydio: pydio,
                            compositeModel: model,
                            linkModel: links[0],
                            showMailer: this.linkInvitation.bind(this)
                        })
                    });
                    if (publicLinkModel.getLinkUuid()) {

                        var layoutData = _mainShareHelper2['default'].compileLayoutData(pydio, model);
                        var templatePane = undefined;
                        if (layoutData.length > 1) {
                            templatePane = _react2['default'].createElement(_linksPublicLinkTemplate2['default'], {
                                linkModel: publicLinkModel,
                                pydio: pydio,
                                layoutData: layoutData,
                                style: { padding: '10px 16px' },
                                readonly: model.getNode().isLeaf()
                            });
                        }
                        tabs.left.push({
                            Label: m(252),
                            Value: 'link-secure',
                            Component: _react2['default'].createElement(
                                'div',
                                null,
                                _react2['default'].createElement(_linksSecureOptions2['default'], { pydio: pydio, linkModel: links[0] }),
                                templatePane && _react2['default'].createElement(_materialUi.Divider, null),
                                templatePane
                            )
                        });
                        tabs.left.push({
                            Label: m(253),
                            Value: 'link-visibility',
                            Component: _react2['default'].createElement(_linksVisibilityPanel2['default'], { pydio: pydio, linkModel: links[0] })
                        });
                    }
                }

                return _react2['default'].createElement(_mainGenericEditor2['default'], {
                    tabs: tabs,
                    pydio: pydio,
                    header: header,
                    saveEnabled: model.isDirty(),
                    onSaveAction: this.submit.bind(this),
                    onCloseAction: this.props.onDismiss,
                    onRevertAction: function () {
                        model.revertChanges();
                    },
                    style: { width: '100%', height: null, flex: 1, minHeight: 550, color: 'rgba(0,0,0,.83)', fontSize: 13 }
                });
            } else {
                var _ret = (function () {

                    var lines = [];
                    var cells = [];
                    model.getCells().map(function (cell) {
                        cells.push(cell.getLabel());
                    });
                    if (cells.length) {
                        lines.push(_react2['default'].createElement(_mainGenericCard.GenericLine, { iconClassName: 'mdi mdi-account-multiple', legend: m(254), data: cells.join(', ') }));
                    }
                    var links = model.getLinks();
                    if (links.length && links[0].getLink()) {
                        var publicLink = _mainShareHelper2['default'].buildPublicUrl(pydio, links[0].getLink().LinkHash, mode === 'infoPanel');
                        lines.push(_react2['default'].createElement(_mainGenericCard.GenericLine, { iconClassName: 'mdi mdi-link', legend: m(121), style: { overflow: 'visible' }, dataStyle: { overflow: 'visible' }, data: _react2['default'].createElement(
                                'div',
                                {
                                    ref: 'copy-button',
                                    style: { cursor: 'pointer', position: 'relative' },
                                    onMouseOver: function () {
                                        _this4.setState({ linkTooltip: true });
                                    },
                                    onMouseOut: function () {
                                        _this4.setState({ linkTooltip: false });
                                    }
                                },
                                _react2['default'].createElement(Tooltip, {
                                    label: copyMessage ? copyMessage : m(191),
                                    horizontalPosition: "left",
                                    verticalPosition: "top",
                                    show: linkTooltip
                                }),
                                publicLink
                            ) }));
                    }
                    var deleteAction = function deleteAction() {
                        if (confirm(m(255))) {
                            model.stopObserving('update');
                            model.deleteAll().then(function (res) {
                                model.updateUnderlyingNode();
                            });
                        }
                    };
                    return {
                        v: _react2['default'].createElement(
                            _mainGenericCard.GenericCard,
                            {
                                pydio: pydio,
                                title: pydio.MessageHash['share_center.50'],
                                onDismissAction: _this4.props.onDismiss,
                                onDeleteAction: deleteAction,
                                onEditAction: function () {
                                    pydio.Controller.fireAction('share-edit-shared');
                                },
                                headerSmall: mode === 'infoPanel'
                            },
                            lines
                        )
                    };
                })();

                if (typeof _ret === 'object') return _ret.v;
            }
        }
    }]);

    return CompositeCard;
})(_react2['default'].Component);

exports['default'] = CompositeCard = PaletteModifier({ primary1Color: '#009688' })(CompositeCard);
exports['default'] = CompositeCard;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../composite/CompositeModel":12,"../links/LabelPanel":16,"../links/Panel":18,"../links/PublicLinkTemplate":20,"../links/SecureOptions":21,"../links/VisibilityPanel":23,"../main/GenericCard":26,"../main/GenericEditor":27,"../main/ShareHelper":29,"./CellsList":9,"./Mailer":13,"clipboard":"clipboard","material-ui":"material-ui","pydio":"pydio","react":"react"}],11:[function(require,module,exports){
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

var _CompositeCard = require('./CompositeCard');

var _CompositeCard2 = _interopRequireDefault(_CompositeCard);

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var React = require('react');

var _require$requireLib = require('pydio').requireLib('boot');

var ActionDialogMixin = _require$requireLib.ActionDialogMixin;

var CompositeDialog = React.createClass({
    displayName: 'CompositeDialog',

    mixins: [ActionDialogMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: '',
            dialogIsModal: false,
            dialogPadding: false,
            dialogSize: 'lg'
        };
    },

    propTypes: {
        pydio: React.PropTypes.instanceOf(_pydio2['default']).isRequired,
        selection: React.PropTypes.instanceOf(_pydioModelDataModel2['default']),
        readonly: React.PropTypes.bool,
        create: React.PropTypes.bool
    },

    childContextTypes: {
        messages: React.PropTypes.object,
        getMessage: React.PropTypes.func,
        isReadonly: React.PropTypes.func
    },

    getChildContext: function getChildContext() {
        var messages = this.props.pydio.MessageHash;
        return {
            messages: messages,
            getMessage: function getMessage(messageId) {
                var namespace = arguments.length <= 1 || arguments[1] === undefined ? 'share_center' : arguments[1];

                try {
                    return messages[namespace + (namespace ? "." : "") + messageId] || messageId;
                } catch (e) {
                    return messageId;
                }
            },
            isReadonly: (function () {
                return this.props.readonly;
            }).bind(this)
        };
    },

    render: function render() {
        var _props = this.props;
        var pydio = _props.pydio;
        var selection = _props.selection;

        var node = undefined;
        if (selection.getUniqueNode()) {
            node = selection.getUniqueNode();
        }

        return React.createElement(_CompositeCard2['default'], {
            pydio: pydio,
            mode: 'edit',
            node: node,
            onDismiss: this.props.onDismiss
        });
    }
});

exports['default'] = CompositeDialog;
module.exports = exports['default'];

},{"./CompositeCard":10,"pydio":"pydio","pydio/model/data-model":"pydio/model/data-model","react":"react"}],12:[function(require,module,exports){
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

var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydioLangObservable = require('pydio/lang/observable');

var _pydioLangObservable2 = _interopRequireDefault(_pydioLangObservable);

var _linksLinkModel = require('../links/LinkModel');

var _linksLinkModel2 = _interopRequireDefault(_linksLinkModel);

var _mainShareHelper = require('../main/ShareHelper');

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var _pydioModelCell = require('pydio/model/cell');

var _pydioModelCell2 = _interopRequireDefault(_pydioModelCell);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var moment = _Pydio$requireLib.moment;

var CompositeModel = (function (_Observable) {
    _inherits(CompositeModel, _Observable);

    function CompositeModel() {
        var edit = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        _classCallCheck(this, CompositeModel);

        _get(Object.getPrototypeOf(CompositeModel.prototype), 'constructor', this).call(this);
        this.cells = [];
        this.links = [];
        this.edit = edit;
    }

    _createClass(CompositeModel, [{
        key: 'emptyLink',
        value: function emptyLink(node) {
            var _this = this;

            var link = new _linksLinkModel2['default']();
            var treeNode = new _pydioHttpRestApi.TreeNode();
            treeNode.Uuid = node.getMetadata().get('uuid');
            link.getLink().Label = node.getLabel();
            link.getLink().Description = pydio.MessageHash['share_center.257'].replace('%s', moment(new Date()).format("YYYY/MM/DD"));
            link.getLink().RootNodes.push(treeNode);
            // Template / Permissions from node
            var defaultTemplate = undefined;
            var defaultPermissions = [_pydioHttpRestApi.RestShareLinkAccessType.constructFromObject('Download')];
            if (node.isLeaf()) {
                defaultTemplate = "pydio_unique_dl";

                var _ShareHelper$nodeHasEditor = _mainShareHelper2['default'].nodeHasEditor(pydio, node);

                var preview = _ShareHelper$nodeHasEditor.preview;

                if (preview) {
                    defaultTemplate = "pydio_unique_strip";
                    defaultPermissions.push(_pydioHttpRestApi.RestShareLinkAccessType.constructFromObject('Preview'));
                }
            } else {
                defaultTemplate = "pydio_shared_folder";
                defaultPermissions.push(_pydioHttpRestApi.RestShareLinkAccessType.constructFromObject('Preview'));
            }
            link.getLink().ViewTemplateName = defaultTemplate;
            link.getLink().Permissions = defaultPermissions;

            link.observe("update", function () {
                _this.notify("update");
            });
            link.observe("save", function () {
                _this.updateUnderlyingNode();
            });
            return link;
        }
    }, {
        key: 'createEmptyCell',
        value: function createEmptyCell() {
            var _this2 = this;

            var cell = new _pydioModelCell2['default'](true);
            cell.setLabel(this.node.getLabel());
            cell.addRootNode(this.node);
            cell.observe("update", function () {
                _this2.notify("update");
            });
            cell.dirty = false;
            this.cells.push(cell);
            this.notify("update");
        }
    }, {
        key: 'addToExistingCell',
        value: function addToExistingCell(cellId) {
            var _this3 = this;

            var cell = new _pydioModelCell2['default'](true);
            cell.observe("update", function () {
                _this3.notify("update");
            });
            cell.load(cellId).then(function () {
                cell.addRootNode(_this3.node);
            });
            this.cells.push(cell);
        }
    }, {
        key: 'updateUnderlyingNode',
        value: function updateUnderlyingNode() {
            pydio.getContextHolder().requireNodeReload(this.node);
        }
    }, {
        key: 'deleteLink',
        value: function deleteLink(linkModel) {
            var _this4 = this;

            linkModel.deleteLink(this.emptyLink(this.node).getLink()).then(function (res) {
                _this4.updateUnderlyingNode();
            });
        }
    }, {
        key: 'getNode',
        value: function getNode() {
            return this.node;
        }

        /**
         * @param node {TreeNode}
         * @param observeReplace bool
         */
    }, {
        key: 'load',
        value: function load(node) {
            var _this5 = this;

            var observeReplace = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            this.node = node;
            this.cells = [];
            this.links = [];
            if (node.getMetadata().get('pydio_shares')) {
                var shareMeta = JSON.parse(node.getMetadata().get('pydio_shares'));
                shareMeta.map(function (sharedWorkspace) {
                    if (sharedWorkspace.Scope === 3) {
                        // Link
                        var linkModel = new _linksLinkModel2['default']();
                        linkModel.observe("update", function () {
                            _this5.notify("update");
                        });
                        linkModel.observe("save", function () {
                            _this5.updateUnderlyingNode();
                        });
                        linkModel.load(sharedWorkspace.UUID);
                        _this5.links.push(linkModel);
                    } else if (sharedWorkspace.Scope === 2) {
                        var cell = new _pydioModelCell2['default']();
                        cell.observe("update", function () {
                            _this5.notify("update");
                        });
                        cell.load(sharedWorkspace.UUID);
                        _this5.cells.push(cell);
                    }
                });
            }
            if (this.edit && !this.links.length) {
                this.links.push(this.emptyLink(node));
            }
            if (observeReplace) {
                this.node.observe('node_replaced', function () {
                    _this5.load(_this5.node, false);
                });
            }
        }
    }, {
        key: 'save',
        value: function save() {
            this.cells.map(function (r) {
                if (r.isDirty()) {
                    r.save();
                }
            });
            this.links.map(function (l) {
                if (l.isDirty()) {
                    l.save();
                }
            });
            // Remove cells that don't have this node anymore
            var nodeId = this.node.getMetadata().get('uuid');
            this.cells = this.cells.filter(function (r) {
                return r.hasRootNode(nodeId);
            });
            this.updateUnderlyingNode();
        }
    }, {
        key: 'deleteAll',
        value: function deleteAll() {
            var nodeUuid = this.node.getMetadata().get('uuid');
            var p = [];
            this.cells.map(function (r) {
                r.removeRootNode(nodeUuid);
                p.push(r.save());
            });
            this.links.map(function (l) {
                p.push(l.deleteLink());
            });
            return Promise.all(p);
        }
    }, {
        key: 'removeNewCell',
        value: function removeNewCell(cell) {
            this.cells = this.cells.filter(function (r) {
                return r !== cell;
            });
            this.notify("update");
        }
    }, {
        key: 'revertChanges',
        value: function revertChanges() {
            // Remove empty cells
            this.cells = this.cells.filter(function (r) {
                return r.getUuid();
            });
            this.cells.map(function (r) {
                if (r.isDirty()) {
                    r.revertChanges();
                }
            });
            this.links.map(function (l) {
                if (l.isDirty()) {
                    l.revertChanges();
                }
            });
            this.notify('update');
        }
    }, {
        key: 'isDirty',
        value: function isDirty() {
            return this.cells.filter(function (r) {
                return r.isDirty();
            }).length || this.links.filter(function (l) {
                return l.isDirty();
            }).length;
        }
    }, {
        key: 'stopObserving',
        value: function stopObserving(event) {
            var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            this.cells.map(function (cell) {
                cell.stopObserving("update");
            });
            this.links.map(function (link) {
                link.stopObserving("update");
            });
            _get(Object.getPrototypeOf(CompositeModel.prototype), 'stopObserving', this).call(this, event, callback);
        }
    }, {
        key: 'getCells',
        value: function getCells() {
            var _this6 = this;

            if (this.node) {
                var _ret = (function () {
                    var nodeId = _this6.node.getMetadata().get('uuid');
                    return {
                        v: _this6.cells.filter(function (r) {
                            return r.hasRootNode(nodeId);
                        })
                    };
                })();

                if (typeof _ret === 'object') return _ret.v;
            } else {
                return this.cells;
            }
        }
    }, {
        key: 'getLinks',
        value: function getLinks() {
            return this.links;
        }
    }]);

    return CompositeModel;
})(_pydioLangObservable2['default']);

exports['default'] = CompositeModel;
module.exports = exports['default'];

},{"../links/LinkModel":17,"../main/ShareHelper":29,"pydio":"pydio","pydio/http/rest-api":"pydio/http/rest-api","pydio/lang/observable":"pydio/lang/observable","pydio/model/cell":"pydio/model/cell"}],13:[function(require,module,exports){
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

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _mainShareHelper = require('../main/ShareHelper');

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var Mailer = (function (_React$Component) {
    _inherits(Mailer, _React$Component);

    function Mailer(props) {
        _classCallCheck(this, Mailer);

        _get(Object.getPrototypeOf(Mailer.prototype), 'constructor', this).call(this, props);
        this.state = { mailerData: null };
    }

    _createClass(Mailer, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            var _this = this;

            var subject = newProps.subject;
            var message = newProps.message;
            var users = newProps.users;
            var linkModel = newProps.linkModel;
            var templateId = newProps.templateId;
            var templateData = newProps.templateData;

            if (subject || templateId) {
                if (_mainShareHelper2['default'].forceMailerOldSchool()) {
                    var encSubject = encodeURIComponent(subject);
                    location.href = "mailto:custom-email@domain.com?Subject=" + encSubject + "&Body=" + message;
                    return;
                }
                //const linkData = hash ? this.state.model.getLinkData(hash) : undefined;
                _pydioHttpResourcesManager2['default'].loadClassesAndApply(['PydioMailer'], function () {
                    _this.setState({
                        mailerData: _extends({}, newProps, {
                            enableIdentification: linkModel && linkModel.getLink().TargetUsers,
                            identifiedOnly: linkModel && linkModel.getLink().RestrictToTargetUsers,
                            crippleIdentificationKeys: true
                        })
                    });
                });
            } else {
                this.setState({ mailerData: null });
            }
        }
    }, {
        key: 'toggleMailerData',
        value: function toggleMailerData(data) {
            this.setState({ mailerData: _extends({}, this.state.mailerData, data) });
        }
    }, {
        key: 'dismissMailer',
        value: function dismissMailer() {
            this.props.onDismiss();
        }
    }, {
        key: 'mailerProcessPost',
        value: function mailerProcessPost(Email, users, subject, message, link, callback) {
            var mailerData = this.state.mailerData;
            var crippleIdentificationKeys = mailerData.crippleIdentificationKeys;
            var identifiedOnly = mailerData.identifiedOnly;
            var linkModel = mailerData.linkModel;

            var linkObject = linkModel.getLink();
            if (!linkObject.TargetUsers) {
                linkObject.TargetUsers = {};
            }
            linkObject.RestrictToTargetUsers = identifiedOnly;

            var shareMails = {};
            Object.keys(users).forEach(function (u) {
                var k = crippleIdentificationKeys ? Math.random().toString(36).substring(7) : u;
                linkObject.TargetUsers[k] = _pydioHttpRestApi.RestShareLinkTargetUser.constructFromObject({ Display: users[u].getLabel(), DownloadCount: 0 });
                shareMails[k] = u;
            });
            linkModel.updateLink(linkObject);
            linkModel.save().then(function () {
                var email = new Email();
                var originalLink = linkModel.getPublicUrl();
                var regexp = new RegExp(originalLink, 'g');
                Object.keys(shareMails).forEach(function (u) {
                    var newLink = originalLink + '?u=' + u;
                    var newMessage = message.replace(regexp, newLink);
                    email.addTarget(shareMails[u], subject, newMessage);
                });
                email.post(function (res) {
                    callback(res);
                });
            });
        }
    }, {
        key: 'getMessage',
        value: function getMessage(key) {
            var namespace = arguments.length <= 1 || arguments[1] === undefined ? 'share_center' : arguments[1];

            return this.props.pydio.MessageHash[namespace + (namespace ? '.' : '') + key];
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            if (this.state.mailerData) {
                var mailerData = this.state.mailerData;

                var customizeMessagePane = undefined;
                if (mailerData.linkModel) {
                    var style = mailerData.enableIdentification ? { padding: '10px 20px', backgroundColor: '#ECEFF1', fontSize: 14 } : { padding: '10px 20px 0', fontSize: 14 };
                    var letUserChooseCripple = this.props.pydio.getPluginConfigs('action.share').get('EMAIL_PERSONAL_LINK_SEND_CLEAR');
                    customizeMessagePane = _react2['default'].createElement(
                        'div',
                        { style: style },
                        _react2['default'].createElement(_materialUi.Toggle, { label: this.getMessage(235), toggled: mailerData.enableIdentification, onToggle: function (e, c) {
                                _this2.toggleMailerData({ enableIdentification: c });
                            } }),
                        mailerData.enableIdentification && _react2['default'].createElement(_materialUi.Toggle, { label: "-- " + this.getMessage(236), toggled: mailerData.identifiedOnly, onToggle: function (e, c) {
                                _this2.toggleMailerData({ identifiedOnly: c });
                            } }),
                        mailerData.enableIdentification && letUserChooseCripple && _react2['default'].createElement(_materialUi.Toggle, { label: "-- " + this.getMessage(237), toggled: mailerData.crippleIdentificationKeys, onToggle: function (e, c) {
                                _this2.toggleMailerData({ crippleIdentificationKeys: c });
                            } })
                    );
                }
                return _react2['default'].createElement(PydioMailer.Pane, _extends({}, mailerData, {
                    onDismiss: this.dismissMailer.bind(this),
                    overlay: true,
                    className: 'share-center-mailer',
                    panelTitle: this.props.pydio.MessageHash["share_center.45"],
                    additionalPaneTop: customizeMessagePane,
                    processPost: mailerData.enableIdentification ? this.mailerProcessPost.bind(this) : null,
                    style: { width: 420, margin: '0 auto' }
                }));
            } else {
                return null;
            }
        }
    }]);

    return Mailer;
})(_react2['default'].Component);

exports['default'] = Mailer;
module.exports = exports['default'];

},{"../main/ShareHelper":29,"material-ui":"material-ui","pydio/http/resources-manager":"pydio/http/resources-manager","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],14:[function(require,module,exports){
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

var _cellsCreateCellDialog = require('./cells/CreateCellDialog');

var _cellsCreateCellDialog2 = _interopRequireDefault(_cellsCreateCellDialog);

var _cellsEditCellDialog = require('./cells/EditCellDialog');

var _cellsEditCellDialog2 = _interopRequireDefault(_cellsEditCellDialog);

var _cellsCellCard = require('./cells/CellCard');

var _cellsCellCard2 = _interopRequireDefault(_cellsCellCard);

var _mainInfoPanel = require('./main/InfoPanel');

var _mainInfoPanel2 = _interopRequireDefault(_mainInfoPanel);

var _compositeCompositeDialog = require('./composite/CompositeDialog');

var _compositeCompositeDialog2 = _interopRequireDefault(_compositeCompositeDialog);

var _linksLinkModel = require('./links/LinkModel');

var _linksLinkModel2 = _interopRequireDefault(_linksLinkModel);

var _mainShareHelper = require('./main/ShareHelper');

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var _listsShareView = require("./lists/ShareView");

exports.CreateCellDialog = _cellsCreateCellDialog2['default'];
exports.EditCellDialog = _cellsEditCellDialog2['default'];
exports.CellCard = _cellsCellCard2['default'];
exports.InfoPanel = _mainInfoPanel2['default'];
exports.CompositeDialog = _compositeCompositeDialog2['default'];
exports.LinkModel = _linksLinkModel2['default'];
exports.ShareHelper = _mainShareHelper2['default'];
exports.ShareViewModal = _listsShareView.ShareViewModal;
exports.ShareView = _listsShareView.ShareView;

},{"./cells/CellCard":2,"./cells/CreateCellDialog":3,"./cells/EditCellDialog":4,"./composite/CompositeDialog":11,"./links/LinkModel":17,"./lists/ShareView":24,"./main/InfoPanel":28,"./main/ShareHelper":29}],15:[function(require,module,exports){
(function (global){
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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var _TargetedUsers = require('./TargetedUsers');

var _TargetedUsers2 = _interopRequireDefault(_TargetedUsers);

var _materialUi = require('material-ui');

var _qrcodeReact = require('qrcode.react');

var _qrcodeReact2 = _interopRequireDefault(_qrcodeReact);

var _clipboard = require('clipboard');

var _clipboard2 = _interopRequireDefault(_clipboard);

var _mainActionButton = require('../main/ActionButton');

var _mainActionButton2 = _interopRequireDefault(_mainActionButton);

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _materialUiStyles = require('material-ui/styles');

var _mainShareHelper = require('../main/ShareHelper');

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _LinkModel = require('./LinkModel');

var _LinkModel2 = _interopRequireDefault(_LinkModel);

var _Pydio$requireLib = _pydio2['default'].requireLib("boot");

var Tooltip = _Pydio$requireLib.Tooltip;

var PublicLinkField = _react2['default'].createClass({
    displayName: 'PublicLinkField',

    propTypes: {
        linkModel: _react2['default'].PropTypes.instanceOf(_LinkModel2['default']),
        editAllowed: _react2['default'].PropTypes.bool,
        onChange: _react2['default'].PropTypes.func,
        showMailer: _react2['default'].PropTypes.func
    },
    getInitialState: function getInitialState() {
        return { editLink: false, copyMessage: '', showQRCode: false };
    },
    toggleEditMode: function toggleEditMode() {
        var linkModel = this.props.linkModel;

        if (this.state.editLink && this.state.customLink) {
            linkModel.setCustomLink(this.state.customLink);
            linkModel.save();
        }
        this.setState({ editLink: !this.state.editLink, customLink: undefined });
    },
    changeLink: function changeLink(event) {
        var value = event.target.value;
        value = _pydioUtilLang2['default'].computeStringSlug(value);
        this.setState({ customLink: value });
    },
    clearCopyMessage: function clearCopyMessage() {
        global.setTimeout((function () {
            this.setState({ copyMessage: '' });
        }).bind(this), 5000);
    },

    attachClipboard: function attachClipboard() {
        var _props = this.props;
        var linkModel = _props.linkModel;
        var pydio = _props.pydio;

        this.detachClipboard();
        if (this.refs['copy-button']) {
            this._clip = new _clipboard2['default'](this.refs['copy-button'], {
                text: (function (trigger) {
                    return _mainShareHelper2['default'].buildPublicUrl(pydio, linkModel.getLink().LinkHash);
                }).bind(this)
            });
            this._clip.on('success', (function () {
                this.setState({ copyMessage: this.props.getMessage('192') }, this.clearCopyMessage);
            }).bind(this));
            this._clip.on('error', (function () {
                var copyMessage = undefined;
                if (global.navigator.platform.indexOf("Mac") === 0) {
                    copyMessage = this.props.getMessage('144');
                } else {
                    copyMessage = this.props.getMessage('143');
                }
                this.refs['public-link-field'].focus();
                this.setState({ copyMessage: copyMessage }, this.clearCopyMessage);
            }).bind(this));
        }
    },
    detachClipboard: function detachClipboard() {
        if (this._clip) {
            this._clip.destroy();
        }
    },

    componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
        this.attachClipboard();
    },

    componentDidMount: function componentDidMount() {
        this.attachClipboard();
    },

    componentWillUnmount: function componentWillUnmount() {
        this.detachClipboard();
    },

    openMailer: function openMailer() {
        this.props.showMailer(this.props.linkModel);
    },

    toggleQRCode: function toggleQRCode() {
        this.setState({ showQRCode: !this.state.showQRCode });
    },

    render: function render() {
        var _this = this;

        var _props2 = this.props;
        var linkModel = _props2.linkModel;
        var pydio = _props2.pydio;

        var publicLink = _mainShareHelper2['default'].buildPublicUrl(pydio, linkModel.getLink().LinkHash);
        var editAllowed = this.props.editAllowed && !this.props.isReadonly() && linkModel.isEditable();
        if (this.state.editLink && editAllowed) {
            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', backgroundColor: '#f5f5f5', padding: '0 6px', margin: '0 -6px', borderRadius: 2 } },
                    _react2['default'].createElement(
                        'span',
                        { style: { fontSize: 16, color: 'rgba(0,0,0,0.4)', display: 'inline-block', maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } },
                        _pydioUtilPath2['default'].getDirname(publicLink) + '/ '
                    ),
                    _react2['default'].createElement(_materialUi.TextField, { style: { flex: 1, marginRight: 10, marginLeft: 10 }, onChange: this.changeLink, value: this.state.customLink !== undefined ? this.state.customLink : linkModel.getLink().LinkHash }),
                    _react2['default'].createElement(_mainActionButton2['default'], { mdiIcon: 'check', callback: this.toggleEditMode })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { textAlign: 'center', fontSize: 13, color: 'rgba(0,0,0,0.43)', paddingTop: 16 } },
                    this.props.getMessage('194')
                )
            );
        } else {
            var _state = this.state;
            var copyMessage = _state.copyMessage;
            var linkTooltip = _state.linkTooltip;

            var setHtml = (function () {
                return { __html: this.state.copyMessage };
            }).bind(this);
            var actionLinks = [],
                qrCode = undefined;
            var muiTheme = this.props.muiTheme;

            actionLinks.push(_react2['default'].createElement(
                'div',
                {
                    key: "copy",
                    ref: 'copy-button',
                    style: { position: 'relative', display: 'inline-block', width: 36, height: 36, padding: '8px 10px', margin: '0 6px', cursor: 'pointer', borderRadius: '50%', border: '1px solid ' + muiTheme.palette.primary1Color },
                    onMouseOver: function () {
                        _this.setState({ linkTooltip: true });
                    },
                    onMouseOut: function () {
                        _this.setState({ linkTooltip: false });
                    }
                },
                _react2['default'].createElement(Tooltip, {
                    label: copyMessage ? copyMessage : this.props.getMessage('191'),
                    horizontalPosition: "center",
                    verticalPosition: "bottom",
                    show: linkTooltip
                }),
                _react2['default'].createElement('span', { className: 'copy-link-button mdi mdi-content-copy', style: { color: muiTheme.palette.primary1Color } })
            ));

            if (this.props.showMailer) {
                actionLinks.push(_react2['default'].createElement(_mainActionButton2['default'], { key: 'outline', callback: this.openMailer, mdiIcon: 'email-outline', messageId: '45' }));
            }
            if (editAllowed) {
                actionLinks.push(_react2['default'].createElement(_mainActionButton2['default'], { key: 'pencil', callback: this.toggleEditMode, mdiIcon: 'pencil', messageId: "193" }));
            }
            if (_mainShareHelper2['default'].qrcodeEnabled()) {
                actionLinks.push(_react2['default'].createElement(_mainActionButton2['default'], { key: 'qrcode', callback: this.toggleQRCode, mdiIcon: 'qrcode', messageId: '94' }));
            }
            if (actionLinks.length) {
                actionLinks = _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', margin: '20px 0 10px' } },
                    _react2['default'].createElement('span', { style: { flex: 1 } }),
                    actionLinks,
                    _react2['default'].createElement('span', { style: { flex: 1 } })
                );
            } else {
                actionLinks = null;
            }
            if (this.state.showQRCode) {
                qrCode = _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 1, style: { width: 120, paddingTop: 10, overflow: 'hidden', margin: '0 auto', height: 120, textAlign: 'center' } },
                    _react2['default'].createElement(_qrcodeReact2['default'], { size: 100, value: publicLink, level: 'Q' })
                );
            } else {
                qrCode = _react2['default'].createElement(_materialUi.Paper, { zDepth: 0, style: { width: 120, overflow: 'hidden', margin: '0 auto', height: 0, textAlign: 'center' } });
            }
            return _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 0, rounded: false, className: 'public-link-container' },
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center' } },
                    _react2['default'].createElement(_materialUi.TextField, {
                        type: 'text',
                        name: 'Link',
                        ref: 'public-link-field',
                        value: publicLink,
                        onFocus: function (e) {
                            e.target.select();
                        },
                        fullWidth: true,
                        inputStyle: { textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: 2, padding: '0 5px' },
                        underlineStyle: { borderColor: '#f5f5f5', textDecoration: linkModel.isExpired() ? 'line-through' : null },
                        underlineFocusStyle: { bottom: 0 }
                    })
                ),
                false && this.props.linkData.target_users && _react2['default'].createElement(_TargetedUsers2['default'], this.props),
                actionLinks,
                qrCode
            );
        }
    }
});

exports['default'] = PublicLinkField = (0, _materialUiStyles.muiThemeable)()(PublicLinkField);
exports['default'] = PublicLinkField = (0, _ShareContextConsumer2['default'])(PublicLinkField);
exports['default'] = PublicLinkField;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../ShareContextConsumer":1,"../main/ActionButton":25,"../main/ShareHelper":29,"./LinkModel":17,"./TargetedUsers":22,"clipboard":"clipboard","material-ui":"material-ui","material-ui/styles":"material-ui/styles","pydio":"pydio","pydio/util/lang":"pydio/util/lang","pydio/util/path":"pydio/util/path","qrcode.react":"qrcode.react","react":"react"}],16:[function(require,module,exports){
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

var _LinkModel = require('./LinkModel');

var _LinkModel2 = _interopRequireDefault(_LinkModel);

var _materialUi = require('material-ui');

var LabelPanel = (function (_React$Component) {
    _inherits(LabelPanel, _React$Component);

    function LabelPanel() {
        _classCallCheck(this, LabelPanel);

        _get(Object.getPrototypeOf(LabelPanel.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(LabelPanel, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var pydio = _props.pydio;
            var linkModel = _props.linkModel;

            var m = function m(id) {
                return pydio.MessageHash['share_center.' + id];
            };
            var link = linkModel.getLink();
            var updateLabel = function updateLabel(e, v) {
                link.Label = v;
                linkModel.updateLink(link);
            };

            var updateDescription = function updateDescription(e, v) {
                link.Description = v;
                linkModel.updateLink(link);
            };

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(_materialUi.TextField, { style: { marginTop: -14 }, floatingLabelText: m(265), value: link.Label, onChange: updateLabel, fullWidth: true }),
                _react2['default'].createElement(_materialUi.TextField, { style: { marginTop: -14 }, floatingLabelText: m(266), value: link.Description, onChange: updateDescription, fullWidth: true })
            );
        }
    }]);

    return LabelPanel;
})(_react2['default'].Component);

LabelPanel.PropTypes = {

    pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default']),
    linkModel: _react2['default'].PropTypes.instanceOf(_LinkModel2['default'])

};

exports['default'] = LabelPanel;
module.exports = exports['default'];

},{"./LinkModel":17,"material-ui":"material-ui","pydio":"pydio","react":"react"}],17:[function(require,module,exports){
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

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioLangObservable = require('pydio/lang/observable');

var _pydioLangObservable2 = _interopRequireDefault(_pydioLangObservable);

var _mainShareHelper = require('../main/ShareHelper');

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _pydioUtilPass = require('pydio/util/pass');

var _pydioUtilPass2 = _interopRequireDefault(_pydioUtilPass);

var LinkModel = (function (_Observable) {
    _inherits(LinkModel, _Observable);

    function LinkModel() {
        _classCallCheck(this, LinkModel);

        _get(Object.getPrototypeOf(LinkModel.prototype), 'constructor', this).call(this);
        this.link = new _pydioHttpRestApi.RestShareLink();
        this.link.Permissions = [_pydioHttpRestApi.RestShareLinkAccessType.constructFromObject("Preview"), _pydioHttpRestApi.RestShareLinkAccessType.constructFromObject("Download")];
        this.link.Policies = [];
        this.link.PoliciesContextEditable = true;
        this.link.RootNodes = [];
        this.ValidPassword = true;
    }

    _createClass(LinkModel, [{
        key: 'isEditable',
        value: function isEditable() {
            return this.link.PoliciesContextEditable;
        }
    }, {
        key: 'isDirty',
        value: function isDirty() {
            return this.dirty;
        }
    }, {
        key: 'getLinkUuid',
        value: function getLinkUuid() {
            return this.link.Uuid;
        }

        /**
         * @return {RestShareLink}
         */
    }, {
        key: 'getLink',
        value: function getLink() {
            return this.link;
        }

        /**
         * @return {String}
         */
    }, {
        key: 'getPublicUrl',
        value: function getPublicUrl() {
            return _mainShareHelper2['default'].buildPublicUrl(pydio, this.link.LinkHash);
        }

        /**
         * @param link {RestShareLink}
         */
    }, {
        key: 'updateLink',
        value: function updateLink(link) {
            this.link = link;
            this.notifyDirty();
        }
    }, {
        key: 'notifyDirty',
        value: function notifyDirty() {
            this.dirty = true;
            this.notify('update');
        }
    }, {
        key: 'revertChanges',
        value: function revertChanges() {
            if (this.originalLink) {
                this.link = this.clone(this.originalLink);
                this.dirty = false;
                this.updatePassword = this.createPassword = null;
                this.ValidPassword = true;
                this.notify('update');
            }
        }
    }, {
        key: 'hasPermission',
        value: function hasPermission(permissionValue) {
            return this.link.Permissions.filter(function (perm) {
                return perm === permissionValue;
            }).length > 0;
        }
    }, {
        key: 'isExpired',
        value: function isExpired() {
            if (this.link.MaxDownloads && parseInt(this.link.CurrentDownloads) >= parseInt(this.link.MaxDownloads)) {
                return true;
            }
            if (this.link.AccessEnd) {
                // TODO
            }
            return false;
        }

        /**
         *
         * @param uuid string
         * @return {Promise.<RestShareLink>}
         */
    }, {
        key: 'load',
        value: function load(uuid) {
            var _this = this;

            var api = new _pydioHttpRestApi.ShareServiceApi(_pydioHttpApi2['default'].getRestClient());
            return api.getShareLink(uuid).then(function (result) {
                _this.link = result;
                if (!_this.link.Permissions) {
                    _this.link.Permissions = [];
                }
                if (!_this.link.Policies) {
                    _this.link.Policies = [];
                }
                if (!_this.link.RootNodes) {
                    _this.link.RootNodes = [];
                }
                _this.originalLink = _this.clone(_this.link);
                _this.notify("update");
            });
        }
    }, {
        key: 'setCreatePassword',
        value: function setCreatePassword(password) {
            var _this2 = this;

            if (password) {
                _pydioUtilPass2['default'].checkPasswordStrength(password, function (ok, msg) {
                    _this2.ValidPassword = ok;
                    _this2.ValidPasswordMessage = msg;
                });
            } else {
                this.ValidPassword = true;
            }
            this.createPassword = password;
            this.link.PasswordRequired = true;
            this.notifyDirty();
        }
    }, {
        key: 'setUpdatePassword',
        value: function setUpdatePassword(password) {
            var _this3 = this;

            if (password) {
                _pydioUtilPass2['default'].checkPasswordStrength(password, function (ok, msg) {
                    _this3.ValidPassword = ok;
                    _this3.ValidPasswordMessage = msg;
                });
            } else {
                this.ValidPassword = true;
            }
            this.updatePassword = password;
            this.notifyDirty();
        }
    }, {
        key: 'setCustomLink',
        value: function setCustomLink(newLink) {
            this.customLink = newLink;
        }

        /**
         *
         * @return {*|Promise.<RestShareLink>}
         */
    }, {
        key: 'save',
        value: function save() {
            var _this4 = this;

            if (!this.ValidPassword) {
                throw new Error(this.ValidPasswordMessage);
            }
            var api = new _pydioHttpRestApi.ShareServiceApi(_pydioHttpApi2['default'].getRestClient());
            var request = new _pydioHttpRestApi.RestPutShareLinkRequest();
            if (this.createPassword) {
                request.PasswordEnabled = true;
                request.CreatePassword = this.createPassword;
            } else if (this.updatePassword) {
                request.PasswordEnabled = true;
                if (!this.link.PasswordRequired) {
                    request.CreatePassword = this.updatePassword;
                } else {
                    request.UpdatePassword = this.updatePassword;
                }
            } else {
                request.PasswordEnabled = this.link.PasswordRequired;
            }
            if (_mainShareHelper2['default'].getAuthorizations(pydio).password_mandatory && !request.PasswordEnabled) {
                throw new Error('You cannot disable passowrd on this link');
            }
            if (this.customLink && this.customLink !== this.link.LinkHash) {
                request.UpdateCustomHash = this.customLink;
            }
            request.ShareLink = this.link;
            return api.putShareLink(request).then(function (result) {
                _this4.link = result;
                _this4.dirty = false;
                _this4.originalLink = _this4.clone(_this4.link);
                _this4.updatePassword = _this4.createPassword = _this4.customLink = null;
                _this4.ValidPassword = true;
                _this4.notify('update');
                _this4.notify('save');
            });
        }

        /**
         *
         * @return {*|Promise.<RestShareLink>}
         */
    }, {
        key: 'deleteLink',
        value: function deleteLink(emptyLink) {
            var _this5 = this;

            var api = new _pydioHttpRestApi.ShareServiceApi(_pydioHttpApi2['default'].getRestClient());
            return api.deleteShareLink(this.link.Uuid).then(function (result) {
                _this5.link = emptyLink;
                _this5.dirty = false;
                _this5.updatePassword = _this5.createPassword = _this5.customLink = null;
                _this5.notify('update');
            });
        }

        /**
         * @param link {RestShareLink}
         */
    }, {
        key: 'clone',
        value: function clone(link) {
            return _pydioHttpRestApi.RestShareLink.constructFromObject(JSON.parse(JSON.stringify(link)));
        }
    }]);

    return LinkModel;
})(_pydioLangObservable2['default']);

exports['default'] = LinkModel;
module.exports = exports['default'];

},{"../main/ShareHelper":29,"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","pydio/lang/observable":"pydio/lang/observable","pydio/util/pass":"pydio/util/pass"}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var _Field = require('./Field');

var _Field2 = _interopRequireDefault(_Field);

var _Permissions = require('./Permissions');

var _Permissions2 = _interopRequireDefault(_Permissions);

var _TargetedUsers = require('./TargetedUsers');

var _TargetedUsers2 = _interopRequireDefault(_TargetedUsers);

var _materialUi = require('material-ui');

var _LinkModel = require('./LinkModel');

var _LinkModel2 = _interopRequireDefault(_LinkModel);

var _compositeCompositeModel = require('../composite/CompositeModel');

var _compositeCompositeModel2 = _interopRequireDefault(_compositeCompositeModel);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _mainShareHelper = require('../main/ShareHelper');

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var _Pydio$requireLib = _pydio2['default'].requireLib('form');

var ValidPassword = _Pydio$requireLib.ValidPassword;

var PublicLinkPanel = _react2['default'].createClass({
    displayName: 'PublicLinkPanel',

    propTypes: {
        linkModel: _react2['default'].PropTypes.instanceOf(_LinkModel2['default']),
        compositeModel: _react2['default'].PropTypes.instanceOf(_compositeCompositeModel2['default']),
        pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default']),
        authorizations: _react2['default'].PropTypes.object,
        showMailer: _react2['default'].PropTypes.func
    },

    toggleLink: function toggleLink() {
        var _props = this.props;
        var linkModel = _props.linkModel;
        var pydio = _props.pydio;
        var showTemporaryPassword = this.state.showTemporaryPassword;

        if (showTemporaryPassword) {
            this.setState({ showTemporaryPassword: false, temporaryPassword: null });
        } else if (!linkModel.getLinkUuid() && _mainShareHelper2['default'].getAuthorizations(pydio).password_mandatory) {
            this.setState({ showTemporaryPassword: true, temporaryPassword: '' });
        } else {
            if (linkModel.getLinkUuid()) {
                this.props.compositeModel.deleteLink(linkModel);
            } else {
                linkModel.save();
            }
        }
    },

    getInitialState: function getInitialState() {
        return { showTemporaryPassword: false, temporaryPassword: null, disabled: false };
    },

    updateTemporaryPassword: function updateTemporaryPassword(value, event) {
        if (value === undefined) {
            value = event.currentTarget.getValue();
        }
        this.setState({ temporaryPassword: value });
    },

    enableLinkWithPassword: function enableLinkWithPassword() {
        var linkModel = this.props.linkModel;

        if (!this.refs['valid-pass'].isValid()) {
            this.props.pydio.UI.displayMessage('ERROR', 'Invalid Password');
            return;
        }
        linkModel.setCreatePassword(this.state.temporaryPassword);
        try {
            linkModel.save();
        } catch (e) {
            this.props.pydio.UI.displayMessage('ERROR', e.message);
        }
        this.setState({ showTemporaryPassword: false, temporaryPassword: null });
    },

    render: function render() {
        var _props2 = this.props;
        var linkModel = _props2.linkModel;
        var pydio = _props2.pydio;
        var compositeModel = _props2.compositeModel;

        var publicLinkPanes = undefined,
            publicLinkField = undefined;
        if (linkModel.getLinkUuid()) {
            publicLinkField = _react2['default'].createElement(_Field2['default'], {
                pydio: pydio,
                linkModel: linkModel,
                showMailer: this.props.showMailer,
                editAllowed: (!this.props.authorizations || this.props.authorizations.editable_hash) && linkModel.isEditable(),
                key: 'public-link'
            });
            publicLinkPanes = [_react2['default'].createElement(_materialUi.Divider, null), _react2['default'].createElement(_Permissions2['default'], {
                compositeModel: compositeModel,
                linkModel: linkModel,
                pydio: pydio,
                key: 'public-perm'
            })];
            if (linkModel.getLink().TargetUsers) {
                publicLinkPanes.push(_react2['default'].createElement(_materialUi.Divider, null));
                publicLinkPanes.push(_react2['default'].createElement(_TargetedUsers2['default'], { linkModel: linkModel, pydio: pydio }));
            }
        } else if (this.state.showTemporaryPassword) {
            publicLinkField = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { className: 'section-legend', style: { marginTop: 20 } },
                    this.props.getMessage('215')
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { width: '100%' } },
                    _react2['default'].createElement(ValidPassword, {
                        attributes: { label: this.props.getMessage('23') },
                        value: this.state.temporaryPassword,
                        onChange: this.updateTemporaryPassword,
                        ref: "valid-pass"
                    })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { textAlign: 'center', marginTop: 20 } },
                    _react2['default'].createElement(_materialUi.RaisedButton, { label: this.props.getMessage('92'), secondary: true, onClick: this.enableLinkWithPassword })
                )
            );
        } else {
            publicLinkField = _react2['default'].createElement(
                'div',
                { style: { fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.43)', paddingBottom: 16, paddingTop: 16 } },
                this.props.getMessage('190')
            );
        }
        return _react2['default'].createElement(
            'div',
            { style: this.props.style },
            _react2['default'].createElement(
                'div',
                { style: { padding: '15px 10px 11px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', fontSize: 15 } },
                _react2['default'].createElement(_materialUi.Toggle, {
                    disabled: this.props.isReadonly() || this.state.disabled || !linkModel.isEditable(),
                    onToggle: this.toggleLink,
                    toggled: linkModel.getLinkUuid() || this.state.showTemporaryPassword,
                    label: this.props.getMessage('189')
                })
            ),
            _react2['default'].createElement(
                'div',
                { style: { padding: 20 } },
                publicLinkField
            ),
            publicLinkPanes
        );
    }
});

exports['default'] = PublicLinkPanel = (0, _ShareContextConsumer2['default'])(PublicLinkPanel);
exports['default'] = PublicLinkPanel;
module.exports = exports['default'];

},{"../ShareContextConsumer":1,"../composite/CompositeModel":12,"../main/ShareHelper":29,"./Field":15,"./LinkModel":17,"./Permissions":19,"./TargetedUsers":22,"material-ui":"material-ui","pydio":"pydio","react":"react"}],19:[function(require,module,exports){
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

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var _materialUi = require('material-ui');

var _LinkModel = require('./LinkModel');

var _LinkModel2 = _interopRequireDefault(_LinkModel);

var _mainShareHelper = require('../main/ShareHelper');

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var PublicLinkPermissions = _react2['default'].createClass({
    displayName: 'PublicLinkPermissions',

    propTypes: {
        linkModel: _react2['default'].PropTypes.instanceOf(_LinkModel2['default']),
        style: _react2['default'].PropTypes.object
    },

    changePermission: function changePermission(event) {
        var name = event.target.name;
        var checked = event.target.checked;
        var _props = this.props;
        var compositeModel = _props.compositeModel;
        var linkModel = _props.linkModel;

        var link = linkModel.getLink();
        if (checked) {
            link.Permissions.push(_pydioHttpRestApi.RestShareLinkAccessType.constructFromObject(name));
        } else {
            link.Permissions = link.Permissions.filter(function (perm) {
                return perm !== name;
            });
        }
        if (compositeModel.getNode().isLeaf()) {
            // Readapt template depending on permissions
            if (linkModel.hasPermission('Preview')) {
                link.ViewTemplateName = "pydio_unique_strip";
            } else {
                link.ViewTemplateName = "pydio_unique_dl";
            }
        }
        this.props.linkModel.updateLink(link);
    },

    render: function render() {
        var _props2 = this.props;
        var linkModel = _props2.linkModel;
        var compositeModel = _props2.compositeModel;
        var pydio = _props2.pydio;

        var node = compositeModel.getNode();
        var perms = [],
            previewWarning = undefined;

        if (node.isLeaf()) {
            var _ShareHelper$nodeHasEditor = _mainShareHelper2['default'].nodeHasEditor(pydio, node);

            var preview = _ShareHelper$nodeHasEditor.preview;
            var writeable = _ShareHelper$nodeHasEditor.writeable;

            perms.push({
                NAME: 'Download',
                LABEL: this.props.getMessage('73'),
                DISABLED: !preview || !linkModel.hasPermission('Preview') // Download Only, cannot edit this
            });
            if (preview) {
                perms.push({
                    NAME: 'Preview',
                    LABEL: this.props.getMessage('72'),
                    DISABLED: !linkModel.hasPermission('Download')
                });
                if (linkModel.hasPermission('Preview')) {
                    if (writeable) {
                        perms.push({
                            NAME: 'Upload',
                            LABEL: this.props.getMessage('74b')
                        });
                    }
                }
            }
        } else {
            perms.push({
                NAME: 'Preview',
                LABEL: this.props.getMessage('72'),
                DISABLED: !linkModel.hasPermission('Upload')
            });
            perms.push({
                NAME: 'Download',
                LABEL: this.props.getMessage('73')
            });
            perms.push({
                NAME: 'Upload',
                LABEL: this.props.getMessage('74')
            });
        }

        /*
        if(this.props.shareModel.isPublicLinkPreviewDisabled() && this.props.shareModel.getPublicLinkPermission(linkId, 'read')){
            previewWarning = <div>{this.props.getMessage('195')}</div>;
        }
        */
        return _react2['default'].createElement(
            'div',
            { style: _extends({ padding: '10px 16px' }, this.props.style) },
            _react2['default'].createElement(
                'div',
                { style: { fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.43)' } },
                this.props.getMessage('70r')
            ),
            _react2['default'].createElement(
                'div',
                { style: { margin: '10px 0 20px' } },
                perms.map((function (p) {
                    return _react2['default'].createElement(_materialUi.Checkbox, {
                        key: p.NAME,
                        disabled: p.DISABLED || this.props.isReadonly() || !linkModel.isEditable(),
                        type: 'checkbox',
                        name: p.NAME,
                        label: p.LABEL,
                        onCheck: this.changePermission,
                        checked: linkModel.hasPermission(p.NAME),
                        labelStyle: { whiteSpace: 'nowrap' },
                        style: { margin: '10px 0' }
                    });
                }).bind(this)),
                previewWarning
            )
        );
    }
});

exports['default'] = PublicLinkPermissions = (0, _ShareContextConsumer2['default'])(PublicLinkPermissions);
exports['default'] = PublicLinkPermissions;
module.exports = exports['default'];

},{"../ShareContextConsumer":1,"../main/ShareHelper":29,"./LinkModel":17,"material-ui":"material-ui","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],20:[function(require,module,exports){
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

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var _materialUi = require('material-ui');

var _LinkModel = require('./LinkModel');

var _LinkModel2 = _interopRequireDefault(_LinkModel);

var PublicLinkTemplate = (function (_React$Component) {
    _inherits(PublicLinkTemplate, _React$Component);

    function PublicLinkTemplate() {
        _classCallCheck(this, PublicLinkTemplate);

        _get(Object.getPrototypeOf(PublicLinkTemplate.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(PublicLinkTemplate, [{
        key: 'onDropDownChange',
        value: function onDropDownChange(event, index, value) {
            var linkModel = this.props.linkModel;

            linkModel.getLink().ViewTemplateName = value;
            linkModel.notifyDirty();
        }
    }, {
        key: 'render',
        value: function render() {
            var crtLabel = undefined;
            var linkModel = this.props.linkModel;

            var selected = linkModel.getLink().ViewTemplateName;
            var menuItems = this.props.layoutData.map(function (l) {
                if (selected && l.LAYOUT_ELEMENT === selected) {
                    crtLabel = l.LAYOUT_LABEL;
                }
                if (!selected && !crtLabel) {
                    selected = l.LAYOUT_ELEMENT;
                    crtLabel = l.LAYOUT_LABEL;
                }
                return _react2['default'].createElement(_materialUi.MenuItem, { key: l.LAYOUT_ELEMENT, value: l.LAYOUT_ELEMENT, primaryText: l.LAYOUT_LABEL });
            });
            return _react2['default'].createElement(
                'div',
                { style: this.props.style },
                _react2['default'].createElement(
                    _materialUi.SelectField,
                    {
                        fullWidth: true,
                        value: selected,
                        onChange: this.onDropDownChange.bind(this),
                        disabled: this.props.isReadonly() || this.props.readonly || !linkModel.isEditable(),
                        floatingLabelText: this.props.getMessage('151')
                    },
                    menuItems
                )
            );
        }
    }]);

    return PublicLinkTemplate;
})(_react2['default'].Component);

PublicLinkTemplate.PropTypes = {
    linkModel: _react2['default'].PropTypes.instanceOf(_LinkModel2['default'])
};
PublicLinkTemplate = (0, _ShareContextConsumer2['default'])(PublicLinkTemplate);
exports['default'] = PublicLinkTemplate;
module.exports = exports['default'];

},{"../ShareContextConsumer":1,"./LinkModel":17,"material-ui":"material-ui","react":"react"}],21:[function(require,module,exports){
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

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var _materialUi = require('material-ui');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _LinkModel = require('./LinkModel');

var _LinkModel2 = _interopRequireDefault(_LinkModel);

var _mainShareHelper = require('../main/ShareHelper');

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var _pydioUtilPass = require('pydio/util/pass');

var _pydioUtilPass2 = _interopRequireDefault(_pydioUtilPass);

var _Pydio$requireLib = _pydio2['default'].requireLib('form');

var ValidPassword = _Pydio$requireLib.ValidPassword;

var globStyles = {
    leftIcon: {
        margin: '0 20px 0 4px',
        color: '#757575'
    }
};

var PublicLinkSecureOptions = _react2['default'].createClass({
    displayName: 'PublicLinkSecureOptions',

    propTypes: {
        linkModel: _react2['default'].PropTypes.instanceOf(_LinkModel2['default']).isRequired,
        style: _react2['default'].PropTypes.object
    },

    getInitialState: function getInitialState() {
        return {};
    },

    updateDLExpirationField: function updateDLExpirationField(event) {
        var newValue = event.currentTarget.value;
        if (parseInt(newValue) < 0) {
            newValue = -parseInt(newValue);
        }
        var linkModel = this.props.linkModel;

        var link = linkModel.getLink();
        link.MaxDownloads = newValue;
        linkModel.updateLink(link);
    },

    updateDaysExpirationField: function updateDaysExpirationField(event, newValue) {
        if (!newValue) {
            newValue = event.currentTarget.getValue();
        }
        var linkModel = this.props.linkModel;

        var link = linkModel.getLink();
        link.AccessEnd = newValue;
        linkModel.updateLink(link);
    },

    onDateChange: function onDateChange(event, value) {
        var date2 = Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
        this.updateDaysExpirationField(event, Math.floor(date2 / 1000) + "");
    },

    resetPassword: function resetPassword() {
        var linkModel = this.props.linkModel;

        linkModel.setUpdatePassword('');
        linkModel.getLink().PasswordRequired = false;
        linkModel.notifyDirty();
    },

    setUpdatingPassword: function setUpdatingPassword(newValue) {
        var _this = this;

        _pydioUtilPass2['default'].checkPasswordStrength(newValue, function (ok, msg) {
            _this.setState({ updatingPassword: newValue, updatingPasswordValid: ok });
        });
    },

    changePassword: function changePassword() {
        var linkModel = this.props.linkModel;
        var updatingPassword = this.state.updatingPassword;

        linkModel.setUpdatePassword(updatingPassword);
        this.setState({ pwPop: false, updatingPassword: "", updatingPasswordValid: false });
        linkModel.notifyDirty();
    },

    updatePassword: function updatePassword(newValue, oldValue) {
        var linkModel = this.props.linkModel;

        var valid = this.refs.pwd.isValid();
        if (valid) {
            this.setState({ invalidPassword: null, invalid: false }, function () {
                linkModel.setUpdatePassword(newValue);
            });
        } else {
            this.setState({ invalidPassword: newValue, invalid: true });
        }
    },

    resetDownloads: function resetDownloads() {
        if (window.confirm(this.props.getMessage('106'))) {
            var linkModel = this.props.linkModel;

            linkModel.getLink().CurrentDownloads = "0";
            linkModel.notifyDirty();
        }
    },

    resetExpiration: function resetExpiration() {
        var linkModel = this.props.linkModel;

        linkModel.getLink().AccessEnd = "0";
        linkModel.notifyDirty();
    },

    renderPasswordContainer: function renderPasswordContainer() {
        var _this2 = this;

        var linkModel = this.props.linkModel;

        var link = linkModel.getLink();
        var passwordField = undefined,
            resetPassword = undefined,
            updatePassword = undefined;
        if (link.PasswordRequired) {
            resetPassword = _react2['default'].createElement(_materialUi.FlatButton, {
                disabled: this.props.isReadonly() || !linkModel.isEditable(),
                secondary: true,
                onTouchTap: this.resetPassword,
                label: this.props.getMessage('174')
            });
            updatePassword = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(_materialUi.FlatButton, {
                    disabled: this.props.isReadonly() || !linkModel.isEditable(),
                    secondary: true,
                    onTouchTap: function (e) {
                        _this2.setState({ pwPop: true, pwAnchor: e.currentTarget });
                    },
                    label: this.props.getMessage('181')
                }),
                _react2['default'].createElement(
                    _materialUi.Popover,
                    {
                        open: this.state.pwPop,
                        anchorEl: this.state.pwAnchor,
                        anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
                        targetOrigin: { horizontal: 'right', vertical: 'top' },
                        onRequestClose: function () {
                            _this2.setState({ pwPop: false });
                        }
                    },
                    _react2['default'].createElement(
                        'div',
                        { style: { width: 280, padding: 8 } },
                        _react2['default'].createElement(ValidPassword, {
                            name: "update",
                            ref: "pwdUpdate",
                            attributes: { label: this.props.getMessage('23') },
                            value: this.state.updatingPassword ? this.state.updatingPassword : "",
                            onChange: function (v) {
                                _this2.setUpdatingPassword(v);
                            }
                        }),
                        _react2['default'].createElement(
                            'div',
                            { style: { paddingTop: 36, textAlign: 'right' } },
                            _react2['default'].createElement(_materialUi.FlatButton, { label: "OK", onTouchTap: function () {
                                    _this2.changePassword();
                                }, disabled: !this.state.updatingPassword || !this.state.updatingPasswordValid }),
                            _react2['default'].createElement(_materialUi.FlatButton, { label: "Cancel", onTouchTap: function () {
                                    _this2.setState({ pwPop: false, updatingPassword: '' });
                                } })
                        )
                    )
                )
            );
            passwordField = _react2['default'].createElement(_materialUi.TextField, {
                floatingLabelText: this.props.getMessage('23'),
                disabled: true,
                value: '********',
                fullWidth: true
            });
        } else if (!this.props.isReadonly() && linkModel.isEditable()) {
            passwordField = _react2['default'].createElement(ValidPassword, {
                name: 'share-password',
                ref: "pwd",
                attributes: { label: this.props.getMessage('23') },
                value: this.state.invalidPassword ? this.state.invalidPassword : linkModel.updatePassword,
                onChange: this.updatePassword
            });
        }
        if (passwordField) {
            return _react2['default'].createElement(
                'div',
                { className: 'password-container', style: { display: 'flex', alignItems: 'baseline' } },
                _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-file-lock', style: globStyles.leftIcon }),
                _react2['default'].createElement(
                    'div',
                    { style: { width: resetPassword ? '40%' : '100%', display: 'inline-block' } },
                    passwordField
                ),
                resetPassword && _react2['default'].createElement(
                    'div',
                    { style: { width: '60%', display: 'flex' } },
                    resetPassword,
                    ' ',
                    updatePassword
                )
            );
        } else {
            return null;
        }
    },

    formatDate: function formatDate(dateObject) {
        var dateFormatDay = this.props.getMessage('date_format', '').split(' ').shift();
        return dateFormatDay.replace('Y', dateObject.getFullYear()).replace('m', dateObject.getMonth() + 1).replace('d', dateObject.getDate());
    },

    render: function render() {
        var linkModel = this.props.linkModel;

        var link = linkModel.getLink();

        var passContainer = this.renderPasswordContainer();
        var crtLinkDLAllowed = linkModel.hasPermission('Download') && !linkModel.hasPermission('Preview') && !linkModel.hasPermission('Upload');
        var dlLimitValue = parseInt(link.MaxDownloads);
        var expirationDateValue = parseInt(link.AccessEnd);

        var calIcon = _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-calendar-clock', style: globStyles.leftIcon });
        var expDate = undefined,
            maxDate = undefined,
            dlCounterString = undefined,
            dateExpired = false,
            dlExpired = false;
        var today = new Date();

        var auth = _mainShareHelper2['default'].getAuthorizations(this.props.pydio);
        if (parseInt(auth.max_expiration) > 0) {
            maxDate = new Date();
            maxDate.setDate(today.getDate() + parseInt(auth.max_expiration));
        }
        if (parseInt(auth.max_downloads) > 0) {
            dlLimitValue = Math.min(dlLimitValue, parseInt(auth.max_downloads));
        }

        if (expirationDateValue) {
            if (expirationDateValue < 0) {
                dateExpired = true;
            }
            expDate = new Date(expirationDateValue * 1000);
            //expDate.setDate(today.getDate() + parseInt(expirationDateValue));
            calIcon = _react2['default'].createElement(_materialUi.IconButton, { iconStyle: { color: globStyles.leftIcon.color }, style: { marginLeft: -8, marginRight: 8 }, iconClassName: 'mdi mdi-close-circle', onTouchTap: this.resetExpiration.bind(this) });
        }
        if (dlLimitValue) {
            var dlCounter = parseInt(link.CurrentDownloads) || 0;
            var resetLink = undefined;
            if (dlCounter) {
                resetLink = _react2['default'].createElement(
                    'a',
                    { style: { cursor: 'pointer' }, onClick: this.resetDownloads.bind(this), title: this.props.getMessage('17') },
                    '(',
                    this.props.getMessage('16'),
                    ')'
                );
                if (dlCounter >= dlLimitValue) {
                    dlExpired = true;
                }
            }
            dlCounterString = _react2['default'].createElement(
                'span',
                { className: 'dlCounterString' },
                dlCounter + '/' + dlLimitValue,
                ' ',
                resetLink
            );
        }
        return _react2['default'].createElement(
            'div',
            { style: _extends({ padding: 10 }, this.props.style) },
            _react2['default'].createElement(
                'div',
                { style: { fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.43)' } },
                this.props.getMessage('24')
            ),
            _react2['default'].createElement(
                'div',
                { style: { paddingRight: 10 } },
                passContainer,
                _react2['default'].createElement(
                    'div',
                    { style: { flex: 1, display: 'flex', alignItems: 'baseline', position: 'relative' }, className: dateExpired ? 'limit-block-expired' : null },
                    calIcon,
                    _react2['default'].createElement(_materialUi.DatePicker, {
                        ref: 'expirationDate',
                        key: 'start',
                        value: expDate,
                        minDate: new Date(),
                        maxDate: maxDate,
                        autoOk: true,
                        disabled: this.props.isReadonly() || !linkModel.isEditable(),
                        onChange: this.onDateChange,
                        showYearSelector: true,
                        floatingLabelText: this.props.getMessage(dateExpired ? '21b' : '21'),
                        mode: 'landscape',
                        formatDate: this.formatDate,
                        style: { flex: 1 },
                        fullWidth: true
                    })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { flex: 1, alignItems: 'baseline', display: crtLinkDLAllowed ? 'flex' : 'none', position: 'relative' }, className: dlExpired ? 'limit-block-expired' : null },
                    _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-download', style: globStyles.leftIcon }),
                    _react2['default'].createElement(_materialUi.TextField, {
                        type: 'number',
                        disabled: this.props.isReadonly() || !linkModel.isEditable(),
                        floatingLabelText: this.props.getMessage(dlExpired ? '22b' : '22'),
                        value: dlLimitValue > 0 ? dlLimitValue : '',
                        onChange: this.updateDLExpirationField,
                        fullWidth: true,
                        style: { flex: 1 }
                    }),
                    _react2['default'].createElement(
                        'span',
                        { style: { fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.43)' } },
                        dlCounterString
                    )
                )
            )
        );
    }
});

exports['default'] = PublicLinkSecureOptions = (0, _ShareContextConsumer2['default'])(PublicLinkSecureOptions);
exports['default'] = PublicLinkSecureOptions;
module.exports = exports['default'];

},{"../ShareContextConsumer":1,"../main/ShareHelper":29,"./LinkModel":17,"material-ui":"material-ui","pydio":"pydio","pydio/util/pass":"pydio/util/pass","react":"react"}],22:[function(require,module,exports){
(function (global){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var _materialUi = require('material-ui');

var _clipboard = require('clipboard');

var _clipboard2 = _interopRequireDefault(_clipboard);

var _linksLinkModel = require('../links/LinkModel');

var _linksLinkModel2 = _interopRequireDefault(_linksLinkModel);

var TargetedUserLink = (function (_React$Component) {
    _inherits(TargetedUserLink, _React$Component);

    function TargetedUserLink(props) {
        _classCallCheck(this, TargetedUserLink);

        _get(Object.getPrototypeOf(TargetedUserLink.prototype), 'constructor', this).call(this, props);
        this.state = { copyMessage: '' };
    }

    _createClass(TargetedUserLink, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (this._clip) {
                this._clip.destroy();
            }
            if (this._button) {
                this._clip = new _clipboard2['default'](this._button, {
                    text: (function (trigger) {
                        return this.props.link;
                    }).bind(this)
                });
                this._clip.on('success', (function () {
                    this.setState({ copyMessage: this.props.getMessage('192') }, this.clearCopyMessage);
                }).bind(this));
                this._clip.on('error', (function () {
                    var copyMessage = undefined;
                    if (global.navigator.platform.indexOf("Mac") === 0) {
                        copyMessage = this.props.getMessage('144');
                    } else {
                        copyMessage = this.props.getMessage('share_center.143');
                    }
                    this.setState({ copyMessage: copyMessage }, this.clearCopyMessage);
                }).bind(this));
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this._clip) {
                this._clip.destroy();
            }
        }
    }, {
        key: 'clearCopyMessage',
        value: function clearCopyMessage() {
            setTimeout((function () {
                this.setState({ copyMessage: '' });
            }).bind(this), 5000);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props = this.props;
            var targetUser = _props.targetUser;
            var link = _props.link;

            return _react2['default'].createElement(
                'div',
                { style: { display: 'flex' } },
                _react2['default'].createElement(
                    'div',
                    { style: { flex: 1 } },
                    targetUser.Display,
                    _react2['default'].createElement(_materialUi.IconButton, {
                        pydio: this.props.pydio,
                        ref: function (ref) {
                            _this._button = _reactDom2['default'].findDOMNode(ref);
                        },
                        iconClassName: 'mdi mdi-link',
                        tooltip: this.state.copyMessage || link,
                        iconStyle: { fontSize: 13, lineHeight: '17px' }, style: { width: 34, height: 34, padding: 6 }
                    })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { width: 40, textAlign: 'center' } },
                    targetUser.DownloadCount
                )
            );
        }
    }]);

    return TargetedUserLink;
})(_react2['default'].Component);

var TargetedUsers = (function (_React$Component2) {
    _inherits(TargetedUsers, _React$Component2);

    function TargetedUsers(props, context) {
        _classCallCheck(this, TargetedUsers);

        _get(Object.getPrototypeOf(TargetedUsers.prototype), 'constructor', this).call(this, props, context);
        this.state = { open: false };
    }

    _createClass(TargetedUsers, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var linkModel = this.props.linkModel;

            var link = linkModel.getLink();
            var targetUsers = undefined;
            if (link.TargetUsers) {
                targetUsers = link.TargetUsers;
            }
            var items = Object.keys(targetUsers).map(function (k) {
                var title = linkModel.getPublicUrl() + '?u=' + k;
                return _react2['default'].createElement(TargetedUserLink, { targetUser: targetUsers[k], link: title });
            });
            if (!items.length) {
                return null;
            }

            var rootStyle = {
                lineHeight: '34px',
                padding: '4px 10px 4px',
                fontSize: 14,
                backgroundColor: '#fafafa',
                borderRadius: 2
            };
            var headerStyle = {
                borderBottom: this.state.open ? '1px solid #757575' : '',
                color: 'rgba(0, 0, 0, 0.36)'
            };

            return _react2['default'].createElement(
                'div',
                { style: rootStyle },
                _react2['default'].createElement(
                    'div',
                    { style: _extends({ display: 'flex' }, headerStyle) },
                    _react2['default'].createElement(
                        'div',
                        { style: { flex: 1 } },
                        this.props.getMessage('245').replace('%s', items.length),
                        ' ',
                        _react2['default'].createElement('span', { className: 'mdi mdi-chevron-' + (this.state.open ? 'up' : 'down'), style: { cursor: 'pointer' }, onClick: function () {
                                _this2.setState({ open: !_this2.state.open });
                            } })
                    ),
                    this.state.open && _react2['default'].createElement(
                        'div',
                        { style: { width: 40, textAlign: 'center' } },
                        '#DL'
                    )
                ),
                this.state.open && _react2['default'].createElement(
                    'div',
                    null,
                    items
                )
            );
        }
    }]);

    return TargetedUsers;
})(_react2['default'].Component);

TargetedUsers.propTypes = {
    linkModel: _react2['default'].PropTypes.instanceOf(_linksLinkModel2['default'])
};

exports['default'] = TargetedUsers = (0, _ShareContextConsumer2['default'])(TargetedUsers);
TargetedUserLink = (0, _ShareContextConsumer2['default'])(TargetedUserLink);

exports['default'] = TargetedUsers;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../ShareContextConsumer":1,"../links/LinkModel":17,"clipboard":"clipboard","material-ui":"material-ui","react":"react","react-dom":"react-dom"}],23:[function(require,module,exports){
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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpPolicies = require('pydio/http/policies');

var _pydioHttpPolicies2 = _interopRequireDefault(_pydioHttpPolicies);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _LinkModel = require('./LinkModel');

var _LinkModel2 = _interopRequireDefault(_LinkModel);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var ResourcePoliciesPanel = _Pydio$requireLib.ResourcePoliciesPanel;

var VisibilityPanel = _react2['default'].createClass({
    displayName: 'VisibilityPanel',

    /**
     * Update associated hidden users policies, otherwise
     * the public link visibility cannot be changed
     * @param diffPolicies
     */
    onSavePolicies: function onSavePolicies(diffPolicies) {
        var _this = this;

        var _props = this.props;
        var linkModel = _props.linkModel;
        var pydio = _props.pydio;

        var internalUser = linkModel.getLink().UserLogin;
        _pydioHttpPolicies2['default'].loadPolicies('user', internalUser).then(function (policies) {
            if (policies.length) {
                var resourceId = policies[0].Resource;
                var newPolicies = _this.diffPolicies(policies, diffPolicies, resourceId);
                _pydioHttpPolicies2['default'].savePolicies('user', internalUser, newPolicies);
            }
        });
    },

    diffPolicies: function diffPolicies(policies, _diffPolicies, resourceId) {
        var newPols = [];
        policies.map(function (p) {
            var key = p.Action + '///' + p.Subject;
            if (!_diffPolicies.remove[key]) {
                newPols.push(p);
            }
        });
        Object.keys(_diffPolicies.add).map(function (k) {
            var newPol = new _pydioHttpRestApi.ServiceResourcePolicy();

            var _k$split = k.split('///');

            var _k$split2 = _slicedToArray(_k$split, 2);

            var action = _k$split2[0];
            var subject = _k$split2[1];

            newPol.Resource = resourceId;
            newPol.Effect = _pydioHttpRestApi.ServiceResourcePolicyPolicyEffect.constructFromObject('allow');
            newPol.Subject = subject;
            newPol.Action = action;
            newPols.push(newPol);
        });
        return newPols;
    },

    render: function render() {
        var _props2 = this.props;
        var linkModel = _props2.linkModel;
        var pydio = _props2.pydio;

        var subjectsHidden = [];
        subjectsHidden["user:" + linkModel.getLink().UserLogin] = true;
        var subjectDisables = { READ: subjectsHidden, WRITE: subjectsHidden };
        return _react2['default'].createElement(
            'div',
            { style: this.props.style, title: this.props.getMessage('199') },
            linkModel.getLink().Uuid && _react2['default'].createElement(ResourcePoliciesPanel, {
                pydio: pydio,
                resourceType: 'workspace',
                resourceId: linkModel.getLink().Uuid,
                skipTitle: true,
                onSavePolicies: this.onSavePolicies.bind(this),
                subjectsDisabled: subjectDisables,
                subjectsHidden: subjectsHidden,
                readonly: this.props.isReadonly() || !linkModel.isEditable(),
                ref: 'policies'
            })
        );
    }
});

VisibilityPanel.PropTypes = {
    pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default']).isRequired,
    linkModel: _react2['default'].PropTypes.instanceOf(_LinkModel2['default']).isRequired
};

VisibilityPanel = (0, _ShareContextConsumer2['default'])(VisibilityPanel);
exports['default'] = VisibilityPanel;
module.exports = exports['default'];

},{"../ShareContextConsumer":1,"./LinkModel":17,"pydio":"pydio","pydio/http/policies":"pydio/http/policies","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _materialUi = require('material-ui');

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;
var Loader = _Pydio$requireLib.Loader;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('components');

var ModalAppBar = _Pydio$requireLib2.ModalAppBar;
var EmptyStateView = _Pydio$requireLib2.EmptyStateView;

var ShareView = (function (_React$Component) {
    _inherits(ShareView, _React$Component);

    _createClass(ShareView, [{
        key: 'getChildContext',
        value: function getChildContext() {
            var messages = this.props.pydio.MessageHash;
            return {
                messages: messages,
                getMessage: function getMessage(messageId) {
                    var namespace = arguments.length <= 1 || arguments[1] === undefined ? 'share_center' : arguments[1];

                    try {
                        return messages[namespace + (namespace ? "." : "") + messageId] || messageId;
                    } catch (e) {
                        return messageId;
                    }
                },
                isReadonly: (function () {
                    return false;
                }).bind(this)
            };
        }
    }]);

    function ShareView(props) {
        _classCallCheck(this, ShareView);

        _get(Object.getPrototypeOf(ShareView.prototype), 'constructor', this).call(this, props);
        this.state = {
            resources: [],
            loading: false,
            selectedModel: null,
            shareType: props.defaultShareType || 'LINKS'
        };
    }

    _createClass(ShareView, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.load();
        }
    }, {
        key: 'load',
        value: function load() {
            var _this = this;

            var api = new _pydioHttpRestApi.ShareServiceApi(_pydioHttpApi2['default'].getRestClient());
            var request = new _pydioHttpRestApi.RestListSharedResourcesRequest();
            request.ShareType = _pydioHttpRestApi.ListSharedResourcesRequestListShareType.constructFromObject(this.state.shareType);
            if (this.props.subject) {
                request.Subject = this.props.subject;
            } else {
                request.OwnedBySubject = true;
            }
            this.setState({ loading: true });
            api.listSharedResources(request).then(function (res) {
                _this.setState({ resources: res.Resources || [], loading: false });
            })['catch'](function () {
                _this.setState({ loading: false });
            });
        }
    }, {
        key: 'getLongestPath',
        value: function getLongestPath(node) {
            if (!node.AppearsIn) {
                return { path: node.Path, basename: node.Path };
            }
            var paths = {};
            node.AppearsIn.map(function (a) {
                paths[a.Path] = a;
            });
            var keys = Object.keys(paths);
            keys.sort();
            var longest = keys[keys.length - 1];
            var label = _pydioUtilPath2['default'].getBasename(longest);
            if (!label) {
                label = paths[longest].WsLabel;
            }
            return { path: longest, appearsIn: paths[longest], basename: label };
        }
    }, {
        key: 'goTo',
        value: function goTo(appearsIn) {
            var Path = appearsIn.Path;
            var WsLabel = appearsIn.WsLabel;
            var WsUuid = appearsIn.WsUuid;

            // Remove first segment (ws slug)
            var pathes = Path.split('/');
            pathes.shift();
            var pydioNode = new _pydioModelNode2['default'](pathes.join('/'));
            pydioNode.getMetadata().set('repository_id', WsUuid);
            pydioNode.getMetadata().set('repository_label', WsLabel);
            this.props.pydio.goTo(pydioNode);
            this.props.onRequestClose();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state = this.state;
            var loading = _state.loading;
            var resources = _state.resources;
            var _props = this.props;
            var pydio = _props.pydio;
            var style = _props.style;

            var m = function m(id) {
                return pydio.MessageHash['share_center.' + id];
            };
            resources.sort(function (a, b) {
                var kA = a.Node.Path;
                var kB = b.Node.Path;
                return kA === kB ? 0 : kA > kB ? 1 : -1;
            });
            var extensions = pydio.Registry.getFilesExtensions();
            return _react2['default'].createElement(
                'div',
                { style: _extends({}, style, { display: 'flex', flexDirection: 'column' }) },
                _react2['default'].createElement(
                    'div',
                    { style: { backgroundColor: '#F5F5F5', borderBottom: '1px solid #EEEEEE', padding: '3px 20px', height: 50 } },
                    _react2['default'].createElement(
                        _materialUi.SelectField,
                        {
                            value: this.state.shareType,
                            onChange: function (e, i, v) {
                                _this2.setState({ shareType: v }, function () {
                                    _this2.load();
                                });
                            },
                            underlineStyle: { display: 'none' },
                            style: { width: 160 }
                        },
                        _react2['default'].createElement(_materialUi.MenuItem, { value: "LINKS", primaryText: m(243) }),
                        _react2['default'].createElement(_materialUi.MenuItem, { value: "CELLS", primaryText: m(250) })
                    )
                ),
                loading && _react2['default'].createElement(Loader, { style: { height: 300, flex: 1 } }),
                !loading && resources.length === 0 && _react2['default'].createElement(EmptyStateView, {
                    pydio: pydio,
                    iconClassName: "mdi mdi-share-variant",
                    primaryTextId: m(131),
                    style: { flex: 1, height: 300, backgroundColor: 'transparent' }
                }),
                !loading && resources.length > 0 && _react2['default'].createElement(
                    _materialUi.List,
                    { style: { flex: 1, minHeight: 300, overflowY: 'auto', paddingTop: 0 } },
                    resources.map(function (res) {
                        var _getLongestPath = _this2.getLongestPath(res.Node);

                        var appearsIn = _getLongestPath.appearsIn;
                        var basename = _getLongestPath.basename;

                        var icon = undefined;
                        if (basename.indexOf('.') === -1) {
                            icon = 'mdi mdi-folder';
                        } else {
                            var ext = _pydioUtilPath2['default'].getFileExtension(basename);
                            if (extensions.has(ext)) {
                                var _extensions$get = extensions.get(ext);

                                var fontIcon = _extensions$get.fontIcon;

                                icon = 'mdi mdi-' + fontIcon;
                            } else {
                                icon = 'mdi mdi-file';
                            }
                        }
                        return _react2['default'].createElement(_materialUi.ListItem, {
                            primaryText: basename,
                            secondaryText: res.Link ? m(251) + ': ' + res.Link.Description : m(284).replace('%s', res.Cells.length),
                            onTouchTap: function () {
                                appearsIn ? _this2.goTo(appearsIn) : null;
                            },
                            disabled: !appearsIn,
                            leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: icon })
                        });
                    })
                )
            );
        }
    }]);

    return ShareView;
})(_react2['default'].Component);

ShareView.childContextTypes = {
    messages: _react2['default'].PropTypes.object,
    getMessage: _react2['default'].PropTypes.func,
    isReadonly: _react2['default'].PropTypes.func
};

var ShareViewModal = _react2['default'].createClass({
    displayName: 'ShareViewModal',

    mixins: [ActionDialogMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: '',
            dialogSize: 'lg',
            dialogPadding: false,
            dialogIsModal: false,
            dialogScrollBody: false
        };
    },

    submit: function submit() {
        this.dismiss();
    },

    render: function render() {
        var _this3 = this;

        return _react2['default'].createElement(
            'div',
            { style: { width: '100%', display: 'flex', flexDirection: 'column' } },
            _react2['default'].createElement(ModalAppBar, {
                title: this.props.pydio.MessageHash['share_center.98'],
                showMenuIconButton: false,
                iconClassNameRight: 'mdi mdi-close',
                onRightIconButtonTouchTap: function () {
                    _this3.dismiss();
                }
            }),
            _react2['default'].createElement(ShareView, _extends({}, this.props, { style: { width: '100%', flex: 1 }, onRequestClose: function () {
                    _this3.dismiss();
                } }))
        );
    }

});

exports.ShareView = ShareView;
exports.ShareViewModal = ShareViewModal;

},{"material-ui":"material-ui","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","pydio/model/node":"pydio/model/node","pydio/util/path":"pydio/util/path","react":"react"}],25:[function(require,module,exports){
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

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var _require = require('react');

var Component = _require.Component;
var PropTypes = _require.PropTypes;

var _require2 = require('material-ui');

var IconButton = _require2.IconButton;

var _require3 = require('material-ui/styles');

var muiThemeable = _require3.muiThemeable;

var ActionButton = (function (_Component) {
    _inherits(ActionButton, _Component);

    function ActionButton() {
        _classCallCheck(this, ActionButton);

        _get(Object.getPrototypeOf(ActionButton.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ActionButton, [{
        key: 'render',
        value: function render() {
            var palette = this.props.muiTheme.palette;

            var style = {
                root: {
                    borderRadius: '50%',
                    border: '1px solid ' + palette.primary1Color,
                    backgroundColor: 'transparent',
                    width: 36, height: 36,
                    padding: 8,
                    margin: '0 6px',
                    zIndex: 0
                },
                icon: {
                    color: palette.primary1Color,
                    fontSize: 20,
                    lineHeight: '20px'
                }
            };

            return React.createElement(IconButton, {
                style: style.root,
                iconStyle: style.icon,
                onTouchTap: this.props.callback || this.props.onTouchTap,
                iconClassName: "mdi mdi-" + this.props.mdiIcon,
                tooltip: this.props.getMessage(this.props.messageId, this.props.messageCoreNamespace ? '' : undefined)
            });
        }
    }]);

    return ActionButton;
})(Component);

ActionButton.propTypes = {
    callback: PropTypes.func,
    onTouchTap: PropTypes.func,
    mdiIcon: PropTypes.string,
    messageId: PropTypes.string
};

ActionButton = (0, _ShareContextConsumer2['default'])(ActionButton);
ActionButton = muiThemeable()(ActionButton);

exports['default'] = ActionButton;
module.exports = exports['default'];

},{"../ShareContextConsumer":1,"material-ui":"material-ui","material-ui/styles":"material-ui/styles","react":"react"}],26:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var globalStyles = {
    globalLeftMargin: 64
};

var GenericLine = (function (_React$Component) {
    _inherits(GenericLine, _React$Component);

    function GenericLine() {
        _classCallCheck(this, GenericLine);

        _get(Object.getPrototypeOf(GenericLine.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(GenericLine, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var iconClassName = _props.iconClassName;
            var legend = _props.legend;
            var data = _props.data;
            var dataStyle = _props.dataStyle;
            var legendStyle = _props.legendStyle;
            var iconStyle = _props.iconStyle;

            var style = {
                icon: _extends({
                    margin: '16px 20px 0'
                }, iconStyle),
                legend: _extends({
                    fontSize: 12,
                    color: '#aaaaaa',
                    fontWeight: 500,
                    textTransform: 'lowercase'
                }, legendStyle),
                data: _extends({
                    fontSize: 15,
                    paddingRight: 6,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }, dataStyle)
            };
            return _react2['default'].createElement(
                'div',
                { style: _extends({ display: 'flex', marginBottom: 8, overflow: 'hidden' }, this.props.style) },
                _react2['default'].createElement(
                    'div',
                    { style: { width: globalStyles.globalLeftMargin } },
                    _react2['default'].createElement(_materialUi.FontIcon, { color: '#aaaaaa', className: iconClassName, style: style.icon })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { flex: 1 } },
                    _react2['default'].createElement(
                        'div',
                        { style: style.legend },
                        legend
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: style.data },
                        data
                    )
                )
            );
        }
    }]);

    return GenericLine;
})(_react2['default'].Component);

var GenericCard = (function (_React$Component2) {
    _inherits(GenericCard, _React$Component2);

    function GenericCard() {
        _classCallCheck(this, GenericCard);

        _get(Object.getPrototypeOf(GenericCard.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(GenericCard, [{
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var title = _props2.title;
            var onDismissAction = _props2.onDismissAction;
            var onEditAction = _props2.onEditAction;
            var onDeleteAction = _props2.onDeleteAction;
            var moreMenuItems = _props2.moreMenuItems;
            var children = _props2.children;
            var muiTheme = _props2.muiTheme;
            var style = _props2.style;
            var headerSmall = _props2.headerSmall;
            var primary1Color = muiTheme.palette.primary1Color;

            var styles = {
                headerHeight: 100,
                buttonBarHeight: 60,
                fabTop: 80,
                button: {
                    style: {},
                    iconStyle: { color: 'white' }
                }
            };
            if (headerSmall) {
                styles = {
                    headerHeight: 80,
                    buttonBarHeight: 40,
                    fabTop: 60,
                    button: {
                        style: { width: 38, height: 38, padding: 9 },
                        iconStyle: { color: 'white', fontSize: 18 }
                    }
                };
            }

            return _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 0, style: _extends({ width: '100%', position: 'relative' }, style) },
                onEditAction && _react2['default'].createElement(
                    _materialUi.FloatingActionButton,
                    { onTouchTap: onEditAction, mini: true, style: { position: 'absolute', top: styles.fabTop, left: 10 } },
                    _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-pencil" })
                ),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 0, style: { backgroundColor: primary1Color, color: 'white', height: styles.headerHeight, borderRadius: '2px 2px 0 0' } },
                    _react2['default'].createElement(
                        'div',
                        { style: { display: 'flex', height: styles.buttonBarHeight } },
                        _react2['default'].createElement('span', { style: { flex: 1 } }),
                        onDeleteAction && _react2['default'].createElement(_materialUi.IconButton, { style: styles.button.style, iconStyle: styles.button.iconStyle, iconClassName: "mdi mdi-delete", onTouchTap: onDeleteAction }),
                        moreMenuItems && moreMenuItems.length > 0 && _react2['default'].createElement(
                            _materialUi.IconMenu,
                            {
                                anchorOrigin: { vertical: 'top', horizontal: headerSmall ? 'right' : 'left' },
                                targetOrigin: { vertical: 'top', horizontal: headerSmall ? 'right' : 'left' },
                                iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, { style: styles.button.style, iconStyle: styles.button.iconStyle, iconClassName: "mdi mdi-dots-vertical" })
                            },
                            moreMenuItems
                        ),
                        onDismissAction && _react2['default'].createElement(_materialUi.IconButton, { style: styles.button.style, iconStyle: styles.button.iconStyle, iconClassName: "mdi mdi-close", onTouchTap: onDismissAction })
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { paddingLeft: onEditAction ? globalStyles.globalLeftMargin : 20, fontSize: 20 } },
                        title
                    )
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { paddingTop: 12, paddingBottom: 8 } },
                    children
                )
            );
        }
    }]);

    return GenericCard;
})(_react2['default'].Component);

exports.GenericCard = GenericCard = (0, _materialUiStyles.muiThemeable)()(GenericCard);
exports.GenericCard = GenericCard;
exports.GenericLine = GenericLine;

},{"material-ui":"material-ui","material-ui/styles":"material-ui/styles","react":"react"}],27:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var EditorTab = (function (_React$Component) {
    _inherits(EditorTab, _React$Component);

    function EditorTab() {
        _classCallCheck(this, EditorTab);

        _get(Object.getPrototypeOf(EditorTab.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(EditorTab, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var tabs = _props.tabs;
            var active = _props.active;
            var onChange = _props.onChange;
            var style = _props.style;
            var muiTheme = _props.muiTheme;
            var primary1Color = muiTheme.palette.primary1Color;

            return _react2['default'].createElement(
                'div',
                { style: _extends({ display: 'flex' }, style) },
                tabs.map(function (t) {
                    var isActive = t.Value === active;
                    return _react2['default'].createElement(_materialUi.FlatButton, { label: t.Label, onTouchTap: function () {
                            onChange(t.Value);
                        }, primary: isActive, style: isActive ? { borderBottom: '2px solid ' + primary1Color } : { borderBottom: 0 } });
                }),
                _react2['default'].createElement('span', { style: { flex: 1 } })
            );
        }
    }]);

    return EditorTab;
})(_react2['default'].Component);

EditorTab = (0, _materialUiStyles.muiThemeable)()(EditorTab);

var EditorTabContent = (function (_React$Component2) {
    _inherits(EditorTabContent, _React$Component2);

    function EditorTabContent() {
        _classCallCheck(this, EditorTabContent);

        _get(Object.getPrototypeOf(EditorTabContent.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(EditorTabContent, [{
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var tabs = _props2.tabs;
            var active = _props2.active;

            var activeContent = null;
            tabs.map(function (t) {
                if (t.Value === active) {
                    activeContent = t.Component;
                }
            });
            return activeContent;
        }
    }]);

    return EditorTabContent;
})(_react2['default'].Component);

var GenericEditor = (function (_React$Component3) {
    _inherits(GenericEditor, _React$Component3);

    function GenericEditor(props) {
        _classCallCheck(this, GenericEditor);

        _get(Object.getPrototypeOf(GenericEditor.prototype), 'constructor', this).call(this, props);
        this.state = {
            left: props.tabs.left.length ? props.tabs.left[0].Value : '',
            right: props.tabs.right.length ? props.tabs.right[0].Value : ''
        };
    }

    _createClass(GenericEditor, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(props) {
            if (!this.state.left && props.tabs.left.length) {
                this.setState({ left: props.tabs.left[0].Value });
            }
            if (!this.state.right && props.tabs.right.length) {
                this.setState({ right: props.tabs.right[0].Value });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props3 = this.props;
            var tabs = _props3.tabs;
            var header = _props3.header;
            var onSaveAction = _props3.onSaveAction;
            var onCloseAction = _props3.onCloseAction;
            var onRevertAction = _props3.onRevertAction;
            var saveEnabled = _props3.saveEnabled;
            var style = _props3.style;
            var pydio = _props3.pydio;
            var _state = this.state;
            var left = _state.left;
            var right = _state.right;

            return _react2['default'].createElement(
                'div',
                { style: _extends({ display: 'flex', flexDirection: 'column', height: '100%' }, style) },
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', padding: '10px 20px 20px' } },
                    _react2['default'].createElement(
                        'div',
                        { style: { flex: 1, paddingRight: 20 } },
                        header
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { paddingTop: 10 } },
                        _react2['default'].createElement(_materialUi.RaisedButton, { disabled: !saveEnabled, primary: true, label: pydio.MessageHash['53'], onTouchTap: onSaveAction }),
                        _react2['default'].createElement(_materialUi.FlatButton, { disabled: !saveEnabled, label: pydio.MessageHash['628'], onTouchTap: onRevertAction, style: { marginLeft: 10 } }),
                        _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-close", tooltip: pydio.MessageHash['86'], onTouchTap: onCloseAction, style: { marginLeft: 10 } })
                    )
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex' } },
                    _react2['default'].createElement(EditorTab, { tabs: tabs.left, active: left, style: { flex: 1 }, onChange: function (value) {
                            _this.setState({ left: value });
                        } }),
                    _react2['default'].createElement(EditorTab, { tabs: tabs.right, active: right, style: { flex: 1 }, onChange: function (value) {
                            _this.setState({ right: value });
                        } })
                ),
                _react2['default'].createElement(_materialUi.Divider, null),
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', flex: 1 } },
                    _react2['default'].createElement(
                        'div',
                        { style: _extends({ overflowY: 'auto', width: '50%', borderRight: '1px solid #e0e0e0', height: '100%', padding: 10 }, tabs.leftStyle) },
                        _react2['default'].createElement(EditorTabContent, { tabs: tabs.left, active: left })
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: _extends({ overflowY: 'auto', width: '50%', height: '100%', padding: 10 }, tabs.rightStyle) },
                        _react2['default'].createElement(EditorTabContent, { tabs: tabs.right, active: right })
                    )
                )
            );
        }
    }]);

    return GenericEditor;
})(_react2['default'].Component);

exports['default'] = GenericEditor;
module.exports = exports['default'];

},{"material-ui":"material-ui","material-ui/styles":"material-ui/styles","react":"react"}],28:[function(require,module,exports){
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

var _materialUi = require('material-ui');

var _compositeCompositeCard = require('../composite/CompositeCard');

var _compositeCompositeCard2 = _interopRequireDefault(_compositeCompositeCard);

var _cellsCellCard = require('../cells/CellCard');

var _cellsCellCard2 = _interopRequireDefault(_cellsCellCard);

var InfoPanel = (function (_React$Component) {
    _inherits(InfoPanel, _React$Component);

    function InfoPanel(props) {
        _classCallCheck(this, InfoPanel);

        _get(Object.getPrototypeOf(InfoPanel.prototype), 'constructor', this).call(this, props);
        this.state = { popoverOpen: false };
    }

    _createClass(InfoPanel, [{
        key: 'openPopover',
        value: function openPopover(event) {
            this.setState({ popoverOpen: true, popoverAnchor: event.target });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var pydio = _props.pydio;
            var node = _props.node;

            if (node.isRoot()) {
                return _react2['default'].createElement(
                    PydioWorkspaces.InfoPanelCard,
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: 0 } },
                        _react2['default'].createElement(_cellsCellCard2['default'], { cellId: pydio.user.activeRepository, pydio: pydio, mode: 'infoPanel' })
                    )
                );
            } else {
                return _react2['default'].createElement(
                    PydioWorkspaces.InfoPanelCard,
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: 0 } },
                        _react2['default'].createElement(_compositeCompositeCard2['default'], { node: node, pydio: pydio, mode: 'infoPanel' })
                    )
                );
            }
        }
    }]);

    return InfoPanel;
})(_react2['default'].Component);

exports['default'] = InfoPanel;
module.exports = exports['default'];

},{"../cells/CellCard":2,"../composite/CompositeCard":10,"material-ui":"material-ui","react":"react"}],29:[function(require,module,exports){
(function (global){
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

var _pydioHttpRestApi = require('pydio/http/rest-api');

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

        /**
         * @param pydio {Pydio}
         * @param node {AjxpNode}
         * @return {{preview: boolean, writeable: boolean}}
         */
    }, {
        key: 'nodeHasEditor',
        value: function nodeHasEditor(pydio, node) {
            if (!node.getMetadata().has('mime_has_preview_editor')) {
                var editors = pydio.Registry.findEditorsForMime(node.getAjxpMime());
                editors = editors.filter(function (e) {
                    return e.id !== 'editor.browser' && e.id !== 'editor.other';
                });
                var writeable = editors.filter(function (e) {
                    return e.canWrite;
                });
                node.getMetadata().set("mime_has_preview_editor", editors.length > 0);
                node.getMetadata().set("mime_has_writeable_editor", writeable.length > 0);
            }
            return {
                preview: node.getMetadata().get("mime_has_preview_editor"),
                writeable: node.getMetadata().get("mime_has_writeable_editor")
            };
        }

        /**
         *
         * @param pydio {Pydio}
         * @param linkModel {CompositeModel}
         * @return {*}
         */
    }, {
        key: 'compileLayoutData',
        value: function compileLayoutData(pydio, linkModel) {

            // Search registry for template nodes starting with minisite_
            var tmpl = undefined,
                currentExt = undefined;
            var node = linkModel.getNode();
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
            tmpl.map(function (xmlNode) {
                var theme = xmlNode.getAttribute('theme');
                if (theme && theme !== crtTheme) {
                    return;
                }
                var element = xmlNode.getAttribute('element');
                var name = xmlNode.getAttribute('name');
                var label = xmlNode.getAttribute('label');
                if (currentExt && name === "unique_preview_file" && !ShareHelper.nodeHasEditor(pydio, node).preview) {
                    // Ignore this template
                    return;
                }
                if (label) {
                    if (MessageHash[label]) {
                        label = MessageHash[label];
                    }
                } else {
                    label = xmlNode.getAttribute('name');
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

            var mail = new _pydioHttpRestApi.MailerMail();
            var api = new _pydioHttpRestApi.MailerServiceApi(_pydioHttpApi2['default'].getRestClient());
            mail.To = Object.keys(targetUsers).map(function (k) {
                var u = targetUsers[k];
                var to = new _pydioHttpRestApi.MailerUser();
                if (u.IdmUser) {
                    to.Uuid = u.IdmUser.Login;
                } else {
                    to.Uuid = u.id;
                }
                return to;
            });
            mail.TemplateId = templateId;
            mail.TemplateData = templateData;
            api.send(mail).then(function () {
                callback();
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
    }]);

    return ShareHelper;
})();

exports['default'] = ShareHelper;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","pydio/util/xml":"pydio/util/xml"}]},{},[14])(14)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvZGlhbG9nL1NoYXJlQ29udGV4dENvbnN1bWVyLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9jZWxscy9DZWxsQ2FyZC5qcyIsInJlcy9idWlsZC9kaWFsb2cvY2VsbHMvQ3JlYXRlQ2VsbERpYWxvZy5qcyIsInJlcy9idWlsZC9kaWFsb2cvY2VsbHMvRWRpdENlbGxEaWFsb2cuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2NlbGxzL05vZGVzUGlja2VyLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9jZWxscy9TaGFyZWRVc2VyRW50cnkuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2NlbGxzL1NoYXJlZFVzZXJzLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9jZWxscy9Vc2VyQmFkZ2UuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2NvbXBvc2l0ZS9DZWxsc0xpc3QuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2NvbXBvc2l0ZS9Db21wb3NpdGVDYXJkLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9jb21wb3NpdGUvQ29tcG9zaXRlRGlhbG9nLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9jb21wb3NpdGUvQ29tcG9zaXRlTW9kZWwuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2NvbXBvc2l0ZS9NYWlsZXIuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2luZGV4LmpzIiwicmVzL2J1aWxkL2RpYWxvZy9saW5rcy9GaWVsZC5qcyIsInJlcy9idWlsZC9kaWFsb2cvbGlua3MvTGFiZWxQYW5lbC5qcyIsInJlcy9idWlsZC9kaWFsb2cvbGlua3MvTGlua01vZGVsLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9saW5rcy9QYW5lbC5qcyIsInJlcy9idWlsZC9kaWFsb2cvbGlua3MvUGVybWlzc2lvbnMuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2xpbmtzL1B1YmxpY0xpbmtUZW1wbGF0ZS5qcyIsInJlcy9idWlsZC9kaWFsb2cvbGlua3MvU2VjdXJlT3B0aW9ucy5qcyIsInJlcy9idWlsZC9kaWFsb2cvbGlua3MvVGFyZ2V0ZWRVc2Vycy5qcyIsInJlcy9idWlsZC9kaWFsb2cvbGlua3MvVmlzaWJpbGl0eVBhbmVsLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9saXN0cy9TaGFyZVZpZXcuanMiLCJyZXMvYnVpbGQvZGlhbG9nL21haW4vQWN0aW9uQnV0dG9uLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9tYWluL0dlbmVyaWNDYXJkLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9tYWluL0dlbmVyaWNFZGl0b3IuanMiLCJyZXMvYnVpbGQvZGlhbG9nL21haW4vSW5mb1BhbmVsLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9tYWluL1NoYXJlSGVscGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMzUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3paQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDalNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25TQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDaFlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdk9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9NQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGZ1bmN0aW9uIChQeWRpb0NvbXBvbmVudCkge1xuICAgIHZhciBTaGFyZUNvbnRleHRDb25zdW1lciA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgICAgICBfaW5oZXJpdHMoU2hhcmVDb250ZXh0Q29uc3VtZXIsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgICAgIGZ1bmN0aW9uIFNoYXJlQ29udGV4dENvbnN1bWVyKCkge1xuICAgICAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFNoYXJlQ29udGV4dENvbnN1bWVyKTtcblxuICAgICAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoU2hhcmVDb250ZXh0Q29uc3VtZXIucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF9jcmVhdGVDbGFzcyhTaGFyZUNvbnRleHRDb25zdW1lciwgW3tcbiAgICAgICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgICAgIHZhciBfY29udGV4dCA9IHRoaXMuY29udGV4dDtcbiAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZXMgPSBfY29udGV4dC5tZXNzYWdlcztcbiAgICAgICAgICAgICAgICB2YXIgZ2V0TWVzc2FnZSA9IF9jb250ZXh0LmdldE1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgdmFyIGlzUmVhZG9ubHkgPSBfY29udGV4dC5pc1JlYWRvbmx5O1xuXG4gICAgICAgICAgICAgICAgdmFyIGNvbnRleHRQcm9wcyA9IHsgbWVzc2FnZXM6IG1lc3NhZ2VzLCBnZXRNZXNzYWdlOiBnZXRNZXNzYWdlLCBpc1JlYWRvbmx5OiBpc1JlYWRvbmx5IH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUHlkaW9Db21wb25lbnQsIF9leHRlbmRzKHt9LCB0aGlzLnByb3BzLCBjb250ZXh0UHJvcHMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfV0pO1xuXG4gICAgICAgIHJldHVybiBTaGFyZUNvbnRleHRDb25zdW1lcjtcbiAgICB9KShSZWFjdC5Db21wb25lbnQpO1xuXG4gICAgU2hhcmVDb250ZXh0Q29uc3VtZXIuY29udGV4dFR5cGVzID0ge1xuICAgICAgICBtZXNzYWdlczogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgICAgZ2V0TWVzc2FnZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIGlzUmVhZG9ubHk6IFJlYWN0LlByb3BUeXBlcy5mdW5jXG4gICAgfTtcblxuICAgIHJldHVybiBTaGFyZUNvbnRleHRDb25zdW1lcjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9FZGl0Q2VsbERpYWxvZyA9IHJlcXVpcmUoJy4vRWRpdENlbGxEaWFsb2cnKTtcblxudmFyIF9FZGl0Q2VsbERpYWxvZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9FZGl0Q2VsbERpYWxvZyk7XG5cbnZhciBfcHlkaW9Nb2RlbENlbGwgPSByZXF1aXJlKCdweWRpby9tb2RlbC9jZWxsJyk7XG5cbnZhciBfcHlkaW9Nb2RlbENlbGwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9Nb2RlbENlbGwpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX21haW5HZW5lcmljQ2FyZCA9IHJlcXVpcmUoJy4uL21haW4vR2VuZXJpY0NhcmQnKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIgPSByZXF1aXJlKFwiLi4vbWFpbi9TaGFyZUhlbHBlclwiKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIENlbGxDYXJkID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKENlbGxDYXJkLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIENlbGxDYXJkKHByb3BzKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENlbGxDYXJkKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihDZWxsQ2FyZC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHsgZWRpdDogZmFsc2UsIG1vZGVsOiBuZXcgX3B5ZGlvTW9kZWxDZWxsMlsnZGVmYXVsdCddKCkgfTtcbiAgICAgICAgdGhpcy5fb2JzZXJ2ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vQ2VsbENhcmQgPSBQYWxldHRlTW9kaWZpZXIoe3ByaW1hcnkxQ29sb3I6JyMwMDk2ODgnfSkoQ2VsbENhcmQpO1xuXG4gICAgX2NyZWF0ZUNsYXNzKENlbGxDYXJkLCBbe1xuICAgICAgICBrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcbiAgICAgICAgICAgIHZhciBjZWxsSWQgPSBfcHJvcHMuY2VsbElkO1xuXG4gICAgICAgICAgICBpZiAocHlkaW8udXNlci5hY3RpdmVSZXBvc2l0b3J5ID09PSBjZWxsSWQpIHtcbiAgICAgICAgICAgICAgICBweWRpby51c2VyLmdldEFjdGl2ZVJlcG9zaXRvcnlBc0NlbGwoKS50aGVuKGZ1bmN0aW9uIChjZWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IG1vZGVsOiBjZWxsIH0pO1xuICAgICAgICAgICAgICAgICAgICBjZWxsLm9ic2VydmUoJ3VwZGF0ZScsIF90aGlzMi5fb2JzZXJ2ZXIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLm1vZGVsLm9ic2VydmUoJ3VwZGF0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMyLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5tb2RlbC5sb2FkKHRoaXMucHJvcHMuY2VsbElkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFVubW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLm1vZGVsLnN0b3BPYnNlcnZpbmcoJ3VwZGF0ZScsIHRoaXMuX29ic2VydmVyKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndXNlcnNJbnZpdGF0aW9ucycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1c2Vyc0ludml0YXRpb25zKHVzZXJPYmplY3RzKSB7XG4gICAgICAgICAgICBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLnNlbmRDZWxsSW52aXRhdGlvbih0aGlzLnByb3BzLm5vZGUsIHRoaXMuc3RhdGUubW9kZWwsIHVzZXJPYmplY3RzKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgbW9kZSA9IF9wcm9wczIubW9kZTtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wczIucHlkaW87XG4gICAgICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIHZhciBlZGl0ID0gX3N0YXRlLmVkaXQ7XG4gICAgICAgICAgICB2YXIgbW9kZWwgPSBfc3RhdGUubW9kZWw7XG5cbiAgICAgICAgICAgIHZhciBtID0gZnVuY3Rpb24gbShpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBweWRpby5NZXNzYWdlSGFzaFsnc2hhcmVfY2VudGVyLicgKyBpZF07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgcm9vdFN0eWxlID0geyB3aWR0aDogMzUwLCBtaW5IZWlnaHQ6IDI3MCB9O1xuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgIGlmIChlZGl0KSB7XG4gICAgICAgICAgICAgICAgcm9vdFN0eWxlID0geyB3aWR0aDogNzAwLCBoZWlnaHQ6IDUwMCB9O1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfRWRpdENlbGxEaWFsb2cyWydkZWZhdWx0J10sIF9leHRlbmRzKHt9LCB0aGlzLnByb3BzLCB7IG1vZGVsOiBtb2RlbCwgc2VuZEludml0YXRpb25zOiB0aGlzLnVzZXJzSW52aXRhdGlvbnMuYmluZCh0aGlzKSB9KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBub2RlcyA9IG1vZGVsLmdldFJvb3ROb2RlcygpLm1hcChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWwuZ2V0Tm9kZUxhYmVsSW5Db250ZXh0KG5vZGUpO1xuICAgICAgICAgICAgICAgIH0pLmpvaW4oJywgJyk7XG4gICAgICAgICAgICAgICAgaWYgKCFub2Rlcykge1xuICAgICAgICAgICAgICAgICAgICBub2RlcyA9IG1vZGVsLmdldFJvb3ROb2RlcygpLmxlbmd0aCArICcgaXRlbShzKSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBkZWxldGVBY3Rpb24gPSB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIGVkaXRBY3Rpb24gPSB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIG1vcmVNZW51SXRlbXMgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKG1vZGUgIT09ICdpbmZvUGFuZWwnKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vcmVNZW51SXRlbXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1vZGVsLmdldFV1aWQoKSAhPT0gcHlkaW8udXNlci5hY3RpdmVSZXBvc2l0b3J5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb3JlTWVudUl0ZW1zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgcHJpbWFyeVRleHQ6IG0oMjQ2KSwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBweWRpby50cmlnZ2VyUmVwb3NpdG9yeUNoYW5nZShtb2RlbC5nZXRVdWlkKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczMucHJvcHMub25EaXNtaXNzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG1vZGVsLmlzRWRpdGFibGUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlQWN0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsLmRlbGV0ZUNlbGwoKS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnByb3BzLm9uRGlzbWlzcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRBY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnNldFN0YXRlKHsgZWRpdDogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMy5wcm9wcy5vbkhlaWdodENoYW5nZSg1MDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBtb3JlTWVudUl0ZW1zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgcHJpbWFyeVRleHQ6IG0oMjQ3KSwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMzLnNldFN0YXRlKHsgZWRpdDogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcmVNZW51SXRlbXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyBwcmltYXJ5VGV4dDogbSgyNDgpLCBvblRvdWNoVGFwOiBkZWxldGVBY3Rpb24gfSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21haW5HZW5lcmljQ2FyZC5HZW5lcmljQ2FyZCxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW86IHB5ZGlvLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IG1vZGVsLmdldExhYmVsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkRpc21pc3NBY3Rpb246IHRoaXMucHJvcHMub25EaXNtaXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25EZWxldGVBY3Rpb246IGRlbGV0ZUFjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRWRpdEFjdGlvbjogZWRpdEFjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlclNtYWxsOiBtb2RlID09PSAnaW5mb1BhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcmVNZW51SXRlbXM6IG1vcmVNZW51SXRlbXNcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwuZ2V0RGVzY3JpcHRpb24oKSAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWFpbkdlbmVyaWNDYXJkLkdlbmVyaWNMaW5lLCB7IGljb25DbGFzc05hbWU6ICdtZGkgbWRpLWluZm9ybWF0aW9uJywgbGVnZW5kOiBtKDE0NSksIGRhdGE6IG1vZGVsLmdldERlc2NyaXB0aW9uKCkgfSksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYWluR2VuZXJpY0NhcmQuR2VuZXJpY0xpbmUsIHsgaWNvbkNsYXNzTmFtZTogJ21kaSBtZGktYWNjb3VudC1tdWx0aXBsZScsIGxlZ2VuZDogbSg1NCksIGRhdGE6IG1vZGVsLmdldEFjbHNTdWJqZWN0cygpIH0pLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWFpbkdlbmVyaWNDYXJkLkdlbmVyaWNMaW5lLCB7IGljb25DbGFzc05hbWU6ICdtZGkgbWRpLWZvbGRlcicsIGxlZ2VuZDogbSgyNDkpLCBkYXRhOiBub2RlcyB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKG1vZGUgPT09ICdpbmZvUGFuZWwnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb250ZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBhcGVyLFxuICAgICAgICAgICAgICAgIHsgekRlcHRoOiAwLCBzdHlsZTogcm9vdFN0eWxlIH0sXG4gICAgICAgICAgICAgICAgY29udGVudFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBDZWxsQ2FyZDtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBDZWxsQ2FyZDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX21hdGVyaWFsVWlTdHlsZXMgPSByZXF1aXJlKCdtYXRlcmlhbC11aS9zdHlsZXMnKTtcblxudmFyIF9TaGFyZWRVc2VycyA9IHJlcXVpcmUoJy4vU2hhcmVkVXNlcnMnKTtcblxudmFyIF9TaGFyZWRVc2VyczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TaGFyZWRVc2Vycyk7XG5cbnZhciBfTm9kZXNQaWNrZXIgPSByZXF1aXJlKCcuL05vZGVzUGlja2VyJyk7XG5cbnZhciBfTm9kZXNQaWNrZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfTm9kZXNQaWNrZXIpO1xuXG52YXIgX3B5ZGlvTW9kZWxDZWxsID0gcmVxdWlyZSgncHlkaW8vbW9kZWwvY2VsbCcpO1xuXG52YXIgX3B5ZGlvTW9kZWxDZWxsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvTW9kZWxDZWxsKTtcblxuLyoqXG4gKiBEaWFsb2cgZm9yIGxldHRpbmcgdXNlcnMgY3JlYXRlIGEgd29ya3NwYWNlXG4gKi9cbnZhciBDcmVhdGVDZWxsRGlhbG9nID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ0NyZWF0ZUNlbGxEaWFsb2cnLFxuXG4gICAgY2hpbGRDb250ZXh0VHlwZXM6IHtcbiAgICAgICAgbWVzc2FnZXM6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0LFxuICAgICAgICBnZXRNZXNzYWdlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIGlzUmVhZG9ubHk6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuY1xuICAgIH0sXG5cbiAgICBnZXRDaGlsZENvbnRleHQ6IGZ1bmN0aW9uIGdldENoaWxkQ29udGV4dCgpIHtcbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1lc3NhZ2VzOiBtZXNzYWdlcyxcbiAgICAgICAgICAgIGdldE1lc3NhZ2U6IGZ1bmN0aW9uIGdldE1lc3NhZ2UobWVzc2FnZUlkKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5hbWVzcGFjZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/ICdzaGFyZV9jZW50ZXInIDogYXJndW1lbnRzWzFdO1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2VzW25hbWVzcGFjZSArIChuYW1lc3BhY2UgPyBcIi5cIiA6IFwiXCIpICsgbWVzc2FnZUlkXSB8fCBtZXNzYWdlSWQ7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZUlkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpc1JlYWRvbmx5OiAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcylcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7IHN0ZXA6ICd1c2VycycsIG1vZGVsOiBuZXcgX3B5ZGlvTW9kZWxDZWxsMlsnZGVmYXVsdCddKCkgfTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMucmVmcy50aXRsZS5mb2N1cygpO1xuICAgICAgICB0aGlzLnN0YXRlLm1vZGVsLm9ic2VydmUoJ3VwZGF0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIHRoaXMuc3RhdGUubW9kZWwuc3RvcE9ic2VydmluZygndXBkYXRlJyk7XG4gICAgfSxcblxuICAgIHN1Ym1pdDogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICB2YXIgbW9kZWwgPSB0aGlzLnN0YXRlLm1vZGVsO1xuXG4gICAgICAgIG1vZGVsLnNhdmUoKS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIF90aGlzMi5wcm9wcy5vbkRpc21pc3MoKTtcbiAgICAgICAgfSlbJ2NhdGNoJ10oZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgICAgcHlkaW8uVUkuZGlzcGxheU1lc3NhZ2UoJ0VSUk9SJywgcmVhc29uLm1lc3NhZ2UpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgbTogZnVuY3Rpb24gbShpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFsnc2hhcmVfY2VudGVyLicgKyBpZF07XG4gICAgfSxcblxuICAgIGNvbXB1dGVTdW1tYXJ5U3RyaW5nOiBmdW5jdGlvbiBjb21wdXRlU3VtbWFyeVN0cmluZygpIHtcbiAgICAgICAgdmFyIG1vZGVsID0gdGhpcy5zdGF0ZS5tb2RlbDtcblxuICAgICAgICB2YXIgdXNlcnMgPSAwO1xuICAgICAgICB2YXIgZ3JvdXBzID0gMDtcbiAgICAgICAgdmFyIHRlYW1zID0gMDtcbiAgICAgICAgdmFyIHVzZXJTdHJpbmcgPSBbXTtcbiAgICAgICAgdmFyIG9ianMgPSBtb2RlbC5nZXRBY2xzKCk7XG4gICAgICAgIE9iamVjdC5rZXlzKG9ianMpLm1hcChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgdmFyIGFjbCA9IG9ianNba107XG4gICAgICAgICAgICBpZiAoYWNsLkdyb3VwKSBncm91cHMrKztlbHNlIGlmIChhY2wuUm9sZSkgdGVhbXMrKztlbHNlIHVzZXJzKys7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodXNlcnMpIHVzZXJTdHJpbmcucHVzaCh1c2VycyArICcgJyArIHRoaXMubSgyNzApKTtcbiAgICAgICAgaWYgKGdyb3VwcykgdXNlclN0cmluZy5wdXNoKGdyb3VwcyArICcgJyArIHRoaXMubSgyNzEpKTtcbiAgICAgICAgaWYgKHRlYW1zKSB1c2VyU3RyaW5nLnB1c2godGVhbXMgKyAnICcgKyB0aGlzLm0oMjcyKSk7XG4gICAgICAgIHZhciBmaW5hbFN0cmluZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHVzZXJTdHJpbmcubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICBmaW5hbFN0cmluZyA9IHVzZXJTdHJpbmdbMF0gKyAnLCAnICsgdXNlclN0cmluZ1sxXSArIHRoaXMubSgyNzQpICsgdXNlclN0cmluZ1szXTtcbiAgICAgICAgfSBlbHNlIGlmICh1c2VyU3RyaW5nLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgZmluYWxTdHJpbmcgPSB0aGlzLm0oMjczKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpbmFsU3RyaW5nID0gdXNlclN0cmluZy5qb2luKHRoaXMubSgyNzQpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5tKDI2OSkucmVwbGFjZSgnJVVTRVJTJywgZmluYWxTdHJpbmcpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIGJ1dHRvbnMgPSBbXTtcbiAgICAgICAgdmFyIGNvbnRlbnQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMucHlkaW87XG4gICAgICAgIHZhciBtdWlUaGVtZSA9IF9wcm9wcy5tdWlUaGVtZTtcbiAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIHZhciBzdGVwID0gX3N0YXRlLnN0ZXA7XG4gICAgICAgIHZhciBtb2RlbCA9IF9zdGF0ZS5tb2RlbDtcblxuICAgICAgICBpZiAoc3RlcCA9PT0gJ3VzZXJzJykge1xuXG4gICAgICAgICAgICBjb250ZW50ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubSgyNzUpXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5UZXh0RmllbGQsIHsgcmVmOiBcInRpdGxlXCIsIGZsb2F0aW5nTGFiZWxUZXh0OiB0aGlzLm0oMjc2KSwgdmFsdWU6IG1vZGVsLmdldExhYmVsKCksIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSwgdikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWwuc2V0TGFiZWwodik7XG4gICAgICAgICAgICAgICAgICAgIH0sIGZ1bGxXaWR0aDogdHJ1ZSB9KSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5UZXh0RmllbGQsIHsgZmxvYXRpbmdMYWJlbFRleHQ6IHRoaXMubSgyNzcpLCB2YWx1ZTogbW9kZWwuZ2V0RGVzY3JpcHRpb24oKSwgb25DaGFuZ2U6IGZ1bmN0aW9uIChlLCB2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbC5zZXREZXNjcmlwdGlvbih2KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZnVsbFdpZHRoOiB0cnVlIH0pXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBidXR0b25zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwge1xuICAgICAgICAgICAgICAgIGtleTogJ25leHQxJyxcbiAgICAgICAgICAgICAgICBkaXNhYmxlZDogIW1vZGVsLmdldExhYmVsKCksXG4gICAgICAgICAgICAgICAgcHJpbWFyeTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbJzE3OSddLCAvLyBOZXh0XG4gICAgICAgICAgICAgICAgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczMuc2V0U3RhdGUoeyBzdGVwOiAnZGF0YScgfSk7XG4gICAgICAgICAgICAgICAgfSB9KSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RlcCA9PT0gJ2RhdGEnKSB7XG5cbiAgICAgICAgICAgIGNvbnRlbnQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tKDI3OClcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9TaGFyZWRVc2VyczJbJ2RlZmF1bHQnXSwge1xuICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgIGNlbGxBY2xzOiBtb2RlbC5nZXRBY2xzKCksXG5cbiAgICAgICAgICAgICAgICAgICAgZXhjbHVkZXM6IFtweWRpby51c2VyLmlkXSxcbiAgICAgICAgICAgICAgICAgICAgb25Vc2VyT2JqZWN0QWRkOiBtb2RlbC5hZGRVc2VyLmJpbmQobW9kZWwpLFxuICAgICAgICAgICAgICAgICAgICBvblVzZXJPYmplY3RSZW1vdmU6IG1vZGVsLnJlbW92ZVVzZXIuYmluZChtb2RlbCksXG4gICAgICAgICAgICAgICAgICAgIG9uVXNlck9iamVjdFVwZGF0ZVJpZ2h0OiBtb2RlbC51cGRhdGVVc2VyUmlnaHQuYmluZChtb2RlbClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgYnV0dG9ucy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsga2V5OiAncHJldjEnLCBwcmltYXJ5OiBmYWxzZSwgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWyczMDQnXSwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczMuc2V0U3RhdGUoeyBzdGVwOiAndXNlcnMnIH0pO1xuICAgICAgICAgICAgICAgIH0gfSkpO1xuICAgICAgICAgICAgYnV0dG9ucy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsga2V5OiAnbmV4dDInLCBwcmltYXJ5OiB0cnVlLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbJzE3OSddLCBvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpczMuc2V0U3RhdGUoeyBzdGVwOiAnbGFiZWwnIH0pO1xuICAgICAgICAgICAgICAgIH0gfSkpO1xuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBjb250ZW50ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29tcHV0ZVN1bW1hcnlTdHJpbmcoKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmdUb3A6IDI0IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX05vZGVzUGlja2VyMlsnZGVmYXVsdCddLCB7IHB5ZGlvOiBweWRpbywgbW9kZWw6IG1vZGVsIH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgYnV0dG9ucy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsga2V5OiAncHJldjInLCBwcmltYXJ5OiBmYWxzZSwgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWyczMDQnXSwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczMuc2V0U3RhdGUoeyBzdGVwOiAnZGF0YScgfSk7XG4gICAgICAgICAgICAgICAgfSB9KSk7XG4gICAgICAgICAgICBidXR0b25zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBrZXk6ICdzdWJtaXQnLCBwcmltYXJ5OiB0cnVlLCBsYWJlbDogdGhpcy5tKDI3OSksIG9uVG91Y2hUYXA6IHRoaXMuc3VibWl0LmJpbmQodGhpcykgfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHByaW1hcnkxQ29sb3IgPSBtdWlUaGVtZS5wYWxldHRlLnByaW1hcnkxQ29sb3I7XG5cbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiAzODAsIGZvbnRTaXplOiAxMywgY29sb3I6ICdyZ2JhKDAsMCwwLC44NyknLCBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBtaW5IZWlnaHQ6IDMwMCB9IH0sXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGJhY2tncm91bmRDb2xvcjogcHJpbWFyeTFDb2xvciwgY29sb3I6ICd3aGl0ZScsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIHBhZGRpbmdMZWZ0OiAyMCB9IH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRm9udEljb24sIHsgY2xhc3NOYW1lOiBcImljb21vb24tY2VsbHMtZnVsbC1wbHVzXCIsIGNvbG9yOiBcIndoaXRlXCIgfSksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmc6IDIwLCBmb250U2l6ZTogMjIgfSB9LFxuICAgICAgICAgICAgICAgICAgICBweWRpby5NZXNzYWdlSGFzaFsnNDE4J11cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAnMjBweCAyMHB4IDEwcHgnLCBmbGV4OiAxIH0gfSxcbiAgICAgICAgICAgICAgICBjb250ZW50XG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiA4LCB0ZXh0QWxpZ246ICdyaWdodCcgfSB9LFxuICAgICAgICAgICAgICAgIGJ1dHRvbnNcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBDcmVhdGVDZWxsRGlhbG9nID0gKDAsIF9tYXRlcmlhbFVpU3R5bGVzLm11aVRoZW1lYWJsZSkoKShDcmVhdGVDZWxsRGlhbG9nKTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IENyZWF0ZUNlbGxEaWFsb2c7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfU2hhcmVkVXNlcnMgPSByZXF1aXJlKCcuL1NoYXJlZFVzZXJzJyk7XG5cbnZhciBfU2hhcmVkVXNlcnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU2hhcmVkVXNlcnMpO1xuXG52YXIgX05vZGVzUGlja2VyID0gcmVxdWlyZSgnLi9Ob2Rlc1BpY2tlcicpO1xuXG52YXIgX05vZGVzUGlja2VyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX05vZGVzUGlja2VyKTtcblxudmFyIF9tYWluR2VuZXJpY0VkaXRvciA9IHJlcXVpcmUoJy4uL21haW4vR2VuZXJpY0VkaXRvcicpO1xuXG52YXIgX21haW5HZW5lcmljRWRpdG9yMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21haW5HZW5lcmljRWRpdG9yKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgVGV4dEZpZWxkID0gX3JlcXVpcmUuVGV4dEZpZWxkO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignY29tcG9uZW50cycpO1xuXG52YXIgUmVzb3VyY2VQb2xpY2llc1BhbmVsID0gX1B5ZGlvJHJlcXVpcmVMaWIuUmVzb3VyY2VQb2xpY2llc1BhbmVsO1xuXG4vKipcbiAqIERpYWxvZyBmb3IgbGV0dGluZyB1c2VycyBjcmVhdGUgYSB3b3Jrc3BhY2VcbiAqL1xuZXhwb3J0c1snZGVmYXVsdCddID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnRWRpdENlbGxEaWFsb2cnLFxuXG4gICAgY2hpbGRDb250ZXh0VHlwZXM6IHtcbiAgICAgICAgbWVzc2FnZXM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgICAgIGdldE1lc3NhZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgICAgICBpc1JlYWRvbmx5OiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuICAgIH0sXG5cbiAgICBnZXRDaGlsZENvbnRleHQ6IGZ1bmN0aW9uIGdldENoaWxkQ29udGV4dCgpIHtcbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1lc3NhZ2VzOiBtZXNzYWdlcyxcbiAgICAgICAgICAgIGdldE1lc3NhZ2U6IGZ1bmN0aW9uIGdldE1lc3NhZ2UobWVzc2FnZUlkKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5hbWVzcGFjZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/ICdzaGFyZV9jZW50ZXInIDogYXJndW1lbnRzWzFdO1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2VzW25hbWVzcGFjZSArIChuYW1lc3BhY2UgPyBcIi5cIiA6IFwiXCIpICsgbWVzc2FnZUlkXSB8fCBtZXNzYWdlSWQ7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZUlkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpc1JlYWRvbmx5OiBmdW5jdGlvbiBpc1JlYWRvbmx5KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgc3VibWl0OiBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBtb2RlbCA9IF9wcm9wcy5tb2RlbDtcbiAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuXG4gICAgICAgIHZhciBkaXJ0eVJvb3RzID0gbW9kZWwuaGFzRGlydHlSb290Tm9kZXMoKTtcbiAgICAgICAgbW9kZWwuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgX3RoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgICAgIGlmIChkaXJ0eVJvb3RzICYmIG1vZGVsLmdldFV1aWQoKSA9PT0gcHlkaW8udXNlci5nZXRBY3RpdmVSZXBvc2l0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICBweWRpby5nb1RvKCcvJyk7XG4gICAgICAgICAgICAgICAgcHlkaW8uZmlyZUNvbnRleHRSZWZyZXNoKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pWydjYXRjaCddKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgICAgIHB5ZGlvLlVJLmRpc3BsYXlNZXNzYWdlKCdFUlJPUicsIHJlYXNvbi5tZXNzYWdlKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBweWRpbyA9IF9wcm9wczIucHlkaW87XG4gICAgICAgIHZhciBtb2RlbCA9IF9wcm9wczIubW9kZWw7XG4gICAgICAgIHZhciBzZW5kSW52aXRhdGlvbnMgPSBfcHJvcHMyLnNlbmRJbnZpdGF0aW9ucztcblxuICAgICAgICB2YXIgbSA9IGZ1bmN0aW9uIG0oaWQpIHtcbiAgICAgICAgICAgIHJldHVybiBweWRpby5NZXNzYWdlSGFzaFsnc2hhcmVfY2VudGVyLicgKyBpZF07XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGhlYWRlciA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRleHRGaWVsZCwgeyBzdHlsZTogeyBtYXJnaW5Ub3A6IC0xNCB9LCBmbG9hdGluZ0xhYmVsVGV4dDogbSgyNjcpLCB2YWx1ZTogbW9kZWwuZ2V0TGFiZWwoKSwgb25DaGFuZ2U6IGZ1bmN0aW9uIChlLCB2KSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsLnNldExhYmVsKHYpO1xuICAgICAgICAgICAgICAgIH0sIGZ1bGxXaWR0aDogdHJ1ZSB9KSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVGV4dEZpZWxkLCB7IHN0eWxlOiB7IG1hcmdpblRvcDogLTE0IH0sIGZsb2F0aW5nTGFiZWxUZXh0OiBtKDI2OCksIHZhbHVlOiBtb2RlbC5nZXREZXNjcmlwdGlvbigpLCBvbkNoYW5nZTogZnVuY3Rpb24gKGUsIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwuc2V0RGVzY3JpcHRpb24odik7XG4gICAgICAgICAgICAgICAgfSwgZnVsbFdpZHRoOiB0cnVlIH0pXG4gICAgICAgICk7XG4gICAgICAgIHZhciB0YWJzID0ge1xuICAgICAgICAgICAgbGVmdDogW3tcbiAgICAgICAgICAgICAgICBMYWJlbDogbSg1NCksXG4gICAgICAgICAgICAgICAgVmFsdWU6ICd1c2VycycsXG4gICAgICAgICAgICAgICAgQ29tcG9uZW50OiBSZWFjdC5jcmVhdGVFbGVtZW50KF9TaGFyZWRVc2VyczJbJ2RlZmF1bHQnXSwge1xuICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgIGNlbGxBY2xzOiBtb2RlbC5nZXRBY2xzKCksXG4gICAgICAgICAgICAgICAgICAgIGV4Y2x1ZGVzOiBbcHlkaW8udXNlci5pZF0sXG4gICAgICAgICAgICAgICAgICAgIHNlbmRJbnZpdGF0aW9uczogc2VuZEludml0YXRpb25zLFxuICAgICAgICAgICAgICAgICAgICBvblVzZXJPYmplY3RBZGQ6IG1vZGVsLmFkZFVzZXIuYmluZChtb2RlbCksXG4gICAgICAgICAgICAgICAgICAgIG9uVXNlck9iamVjdFJlbW92ZTogbW9kZWwucmVtb3ZlVXNlci5iaW5kKG1vZGVsKSxcbiAgICAgICAgICAgICAgICAgICAgb25Vc2VyT2JqZWN0VXBkYXRlUmlnaHQ6IG1vZGVsLnVwZGF0ZVVzZXJSaWdodC5iaW5kKG1vZGVsKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgTGFiZWw6IG0oMjUzKSxcbiAgICAgICAgICAgICAgICBWYWx1ZTogJ3Blcm1pc3Npb25zJyxcbiAgICAgICAgICAgICAgICBDb21wb25lbnQ6IFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVzb3VyY2VQb2xpY2llc1BhbmVsLCB7XG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VUeXBlOiAnd29ya3NwYWNlJyxcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VJZDogbW9kZWwuZ2V0VXVpZCgpLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge30sXG4gICAgICAgICAgICAgICAgICAgIHNraXBUaXRsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgb25TYXZlUG9saWNpZXM6IGZ1bmN0aW9uICgpIHt9LFxuICAgICAgICAgICAgICAgICAgICByZWFkb25seTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGNlbGxBY2xzOiBtb2RlbC5nZXRBY2xzKClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICByaWdodDogW3tcbiAgICAgICAgICAgICAgICBMYWJlbDogbSgyNDkpLFxuICAgICAgICAgICAgICAgIFZhbHVlOiAnY29udGVudCcsXG4gICAgICAgICAgICAgICAgQ29tcG9uZW50OiBSZWFjdC5jcmVhdGVFbGVtZW50KF9Ob2Rlc1BpY2tlcjJbJ2RlZmF1bHQnXSwgeyBweWRpbzogcHlkaW8sIG1vZGVsOiBtb2RlbCwgbW9kZTogJ2VkaXQnIH0pXG4gICAgICAgICAgICB9XVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYWluR2VuZXJpY0VkaXRvcjJbJ2RlZmF1bHQnXSwge1xuICAgICAgICAgICAgcHlkaW86IHB5ZGlvLFxuICAgICAgICAgICAgdGFiczogdGFicyxcbiAgICAgICAgICAgIGhlYWRlcjogaGVhZGVyLFxuICAgICAgICAgICAgc2F2ZUVuYWJsZWQ6IG1vZGVsLmlzRGlydHkoKSxcbiAgICAgICAgICAgIG9uU2F2ZUFjdGlvbjogdGhpcy5zdWJtaXQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIG9uQ2xvc2VBY3Rpb246IHRoaXMucHJvcHMub25EaXNtaXNzLFxuICAgICAgICAgICAgb25SZXZlcnRBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBtb2RlbC5yZXZlcnRDaGFuZ2VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxufSk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSBhcnIyW2ldID0gYXJyW2ldOyByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfbWF0ZXJpYWxVaVN0eWxlcyA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpL3N0eWxlcycpO1xuXG52YXIgX3B5ZGlvTW9kZWxEYXRhTW9kZWwgPSByZXF1aXJlKCdweWRpby9tb2RlbC9kYXRhLW1vZGVsJyk7XG5cbnZhciBfcHlkaW9Nb2RlbERhdGFNb2RlbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb01vZGVsRGF0YU1vZGVsKTtcblxudmFyIF9yZXF1aXJlJHJlcXVpcmVMaWIgPSByZXF1aXJlKCdweWRpbycpLnJlcXVpcmVMaWIoJ2NvbXBvbmVudHMnKTtcblxudmFyIEZvbGRlcnNUcmVlID0gX3JlcXVpcmUkcmVxdWlyZUxpYi5Gb2xkZXJzVHJlZTtcblxudmFyIE5vZGVzUGlja2VyID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKE5vZGVzUGlja2VyLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIE5vZGVzUGlja2VyKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBOb2Rlc1BpY2tlcik7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoTm9kZXNQaWNrZXIucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHZhciBjcnRXcyA9IHVuZGVmaW5lZDtcblxuICAgICAgICB2YXIgdXNlciA9IHByb3BzLnB5ZGlvLnVzZXI7XG4gICAgICAgIHZhciBhdmFpbCA9IFtdO1xuICAgICAgICB1c2VyLmdldFJlcG9zaXRvcmllc0xpc3QoKS5mb3JFYWNoKGZ1bmN0aW9uIChyZXBvKSB7XG4gICAgICAgICAgICBpZiAocmVwby5nZXRBY2Nlc3NUeXBlKCkgPT09ICdnYXRld2F5Jykge1xuICAgICAgICAgICAgICAgIGlmIChyZXBvLmdldElkKCkgPT09IHVzZXIuYWN0aXZlUmVwb3NpdG9yeSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVwby5nZXRPd25lcigpID09PSAnc2hhcmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBkbyBub3QgcHVzaCB0byB0aGUgbGlzdFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNydFdzID0gcmVwbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXZhaWwucHVzaChyZXBvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBhdmFpbGFibGVXcyA9IFtdO1xuICAgICAgICB2YXIgbm90T3duZWQgPSBhdmFpbC5maWx0ZXIoZnVuY3Rpb24gKHJlcG8pIHtcbiAgICAgICAgICAgIHJldHVybiAhcmVwby5nZXRPd25lcigpO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIG93bmVkID0gYXZhaWwuZmlsdGVyKGZ1bmN0aW9uIChyZXBvKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVwby5nZXRPd25lcigpO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKG5vdE93bmVkLmxlbmd0aCAmJiBvd25lZC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGF2YWlsYWJsZVdzID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShub3RPd25lZCksIFsnRElWSURFUiddLCBfdG9Db25zdW1hYmxlQXJyYXkob3duZWQpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF2YWlsYWJsZVdzID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShub3RPd25lZCksIF90b0NvbnN1bWFibGVBcnJheShvd25lZCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRtID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoYXZhaWxhYmxlV3MubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoIWNydFdzKSB7XG4gICAgICAgICAgICAgICAgY3J0V3MgPSBhdmFpbGFibGVXc1swXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRtID0gX3B5ZGlvTW9kZWxEYXRhTW9kZWwyWydkZWZhdWx0J10uUmVtb3RlRGF0YU1vZGVsRmFjdG9yeSh7IHRtcF9yZXBvc2l0b3J5X2lkOiBjcnRXcy5nZXRJZCgpIH0pO1xuICAgICAgICAgICAgdmFyIHJvb3QgPSBkbS5nZXRSb290Tm9kZSgpO1xuICAgICAgICAgICAgcm9vdC5nZXRNZXRhZGF0YSgpLnNldCgncmVwb3NpdG9yeV9pZCcsIGNydFdzLmdldElkKCkpO1xuICAgICAgICAgICAgcm9vdC5sb2FkKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZGF0YU1vZGVsOiBkbSxcbiAgICAgICAgICAgIG9wZW46IGZhbHNlLFxuICAgICAgICAgICAgYXZhaWxhYmxlV3M6IGF2YWlsYWJsZVdzLFxuICAgICAgICAgICAgY3J0V3M6IGNydFdzXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKE5vZGVzUGlja2VyLCBbe1xuICAgICAgICBrZXk6ICdzd2l0Y2hXb3Jrc3BhY2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc3dpdGNoV29ya3NwYWNlKHdzKSB7XG4gICAgICAgICAgICB2YXIgZG0gPSBfcHlkaW9Nb2RlbERhdGFNb2RlbDJbJ2RlZmF1bHQnXS5SZW1vdGVEYXRhTW9kZWxGYWN0b3J5KHsgdG1wX3JlcG9zaXRvcnlfaWQ6IHdzLmdldElkKCkgfSk7XG4gICAgICAgICAgICB2YXIgcm9vdCA9IGRtLmdldFJvb3ROb2RlKCk7XG4gICAgICAgICAgICByb290LmdldE1ldGFkYXRhKCkuc2V0KCdyZXBvc2l0b3J5X2lkJywgd3MuZ2V0SWQoKSk7XG4gICAgICAgICAgICByb290LmxvYWQoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjcnRXczogd3MsIGRhdGFNb2RlbDogZG0gfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2hhbmRsZVRvdWNoVGFwJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZVRvdWNoVGFwKGV2ZW50KSB7XG4gICAgICAgICAgICAvLyBUaGlzIHByZXZlbnRzIGdob3N0IGNsaWNrLlxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgb3BlbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBhbmNob3JFbDogZXZlbnQuY3VycmVudFRhcmdldFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2hhbmRsZVJlcXVlc3RDbG9zZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBoYW5kbGVSZXF1ZXN0Q2xvc2UoKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBvcGVuOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29uVmFsaWRhdGVOb2RlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uVmFsaWRhdGVOb2RlKCkge1xuICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnN0YXRlLm5vZGU7XG5cbiAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwuYWRkUm9vdE5vZGUobm9kZSk7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZVJlcXVlc3RDbG9zZSgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvbk5vZGVTZWxlY3RlZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvbk5vZGVTZWxlY3RlZChub2RlKSB7XG4gICAgICAgICAgICBub2RlLmxvYWQoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBub2RlOiBub2RlIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBub2RlIFRyZWVOb2RlXG4gICAgICAgICAqIEByZXR1cm4ge1hNTH1cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXJOb2RlTGluZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXJOb2RlTGluZShub2RlKSB7XG4gICAgICAgICAgICB2YXIgbW9kZWwgPSB0aGlzLnByb3BzLm1vZGVsO1xuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTGlzdEl0ZW0sIHtcbiAgICAgICAgICAgICAgICBkaXNhYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBsZWZ0SWNvbjogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRm9udEljb24sIHsgY2xhc3NOYW1lOiAnbWRpIG1kaS1mb2xkZXInIH0pLFxuICAgICAgICAgICAgICAgIHByaW1hcnlUZXh0OiBtb2RlbC5nZXROb2RlTGFiZWxJbkNvbnRleHQobm9kZSksXG4gICAgICAgICAgICAgICAgcmlnaHRJY29uQnV0dG9uOiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsLnJlbW92ZVJvb3ROb2RlKG5vZGUuVXVpZCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGljb25DbGFzc05hbWU6ICdtZGkgbWRpLWRlbGV0ZScsIHRvb2x0aXA6ICdSZW1vdmUnLCBpY29uU3R5bGU6IHsgY29sb3I6ICdyZ2JhKDAsMCwwLC40MyknIH0gfSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgbW9kZWwgPSBfcHJvcHMubW9kZWw7XG4gICAgICAgICAgICB2YXIgbXVpVGhlbWUgPSBfcHJvcHMubXVpVGhlbWU7XG4gICAgICAgICAgICB2YXIgbW9kZSA9IF9wcm9wcy5tb2RlO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuXG4gICAgICAgICAgICB2YXIgbSA9IGZ1bmN0aW9uIG0oaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci4nICsgaWRdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciBub2RlcyA9IG1vZGVsLmdldFJvb3ROb2RlcygpO1xuICAgICAgICAgICAgdmFyIG5vZGVMaW5lcyA9IFtdLFxuICAgICAgICAgICAgICAgIGVtcHR5U3RhdGVTdHJpbmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBub2Rlcy5tYXAoZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBub2RlTGluZXMucHVzaChfdGhpcy5yZW5kZXJOb2RlTGluZShub2RlKSk7XG4gICAgICAgICAgICAgICAgbm9kZUxpbmVzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRGl2aWRlciwgeyBpbnNldDogdHJ1ZSB9KSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG5vZGVMaW5lcy5wb3AoKTtcbiAgICAgICAgICAgIGlmICghbm9kZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1vZGUgPT09ICdlZGl0Jykge1xuICAgICAgICAgICAgICAgICAgICBlbXB0eVN0YXRlU3RyaW5nID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGNvbG9yOiAncmdiYSgwLDAsMCwuNTQpJywgZm9udFN0eWxlOiAnaXRhbGljJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtKDI4MClcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbXB0eVN0YXRlU3RyaW5nID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGNvbG9yOiAncmdiYSgwLDAsMCwuNTQpJywgZm9udFN0eWxlOiAnaXRhbGljJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtKDI4MSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIHZhciBub2RlID0gX3N0YXRlLm5vZGU7XG4gICAgICAgICAgICB2YXIgYXZhaWxhYmxlV3MgPSBfc3RhdGUuYXZhaWxhYmxlV3M7XG4gICAgICAgICAgICB2YXIgY3J0V3MgPSBfc3RhdGUuY3J0V3M7XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IG0oMjgyKSxcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFRhcDogdGhpcy5oYW5kbGVUb3VjaFRhcC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBtYXJnaW5Cb3R0b206IDEwIH0sXG4gICAgICAgICAgICAgICAgICAgIGljb246IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogXCJtZGkgbWRpLWZvbGRlci1wbHVzXCIgfSlcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuTGlzdCxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgbm9kZUxpbmVzXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBlbXB0eVN0YXRlU3RyaW5nLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5Qb3BvdmVyLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiB0aGlzLnN0YXRlLm9wZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmNob3JFbDogdGhpcy5zdGF0ZS5hbmNob3JFbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuY2hvck9yaWdpbjogeyBob3Jpem9udGFsOiAnbGVmdCcsIHZlcnRpY2FsOiAnYm90dG9tJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0T3JpZ2luOiB7IGhvcml6b250YWw6ICdsZWZ0JywgdmVydGljYWw6ICd0b3AnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvblJlcXVlc3RDbG9zZTogdGhpcy5oYW5kbGVSZXF1ZXN0Q2xvc2UuYmluZCh0aGlzKVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogMzcyLCBoZWlnaHQ6IDMwMCwgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5Ecm9wRG93bk1lbnUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBoZWlnaHQ6IDU0IH0sIHZhbHVlOiBjcnRXcywgb25DaGFuZ2U6IGZ1bmN0aW9uIChlLCBpLCB2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zd2l0Y2hXb3Jrc3BhY2Uodik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVXcy5tYXAoZnVuY3Rpb24gKHdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3cyA9PT0gJ0RJVklERVInKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRGl2aWRlciwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgdmFsdWU6IHdzLCBwcmltYXJ5VGV4dDogd3MuZ2V0TGFiZWwoKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRGl2aWRlciwgbnVsbCksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IG1hcmdpbkxlZnQ6IC0yNiwgZmxleDogJzEnLCBvdmVyZmxvd1k6ICdhdXRvJywgZm9udFNpemU6IDE1LCBjb2xvcjogJ3JnYmEoMCwwLDAsLjczKScgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEZvbGRlcnNUcmVlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvOiB0aGlzLnByb3BzLnB5ZGlvLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhTW9kZWw6IHRoaXMuc3RhdGUuZGF0YU1vZGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbk5vZGVTZWxlY3RlZDogdGhpcy5vbk5vZGVTZWxlY3RlZC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93Um9vdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIG51bGwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIHBhZGRpbmc6ICc0cHggMTZweCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBmb250U2l6ZTogMTUgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZsZXg6IDEsIGNvbG9yOiAncmdiYSgwLDAsMCwuODcpJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUgJiYgbm9kZS5nZXRQYXRoKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICFub2RlICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmbGV4OiAxLCBjb2xvcjogJ3JnYmEoMCwwLDAsLjU0KScsIGZvbnRXZWlnaHQ6IDUwMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oMjgzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBpY29uU3R5bGU6IHsgY29sb3I6IG11aVRoZW1lLnBhbGV0dGUucHJpbWFyeTFDb2xvciB9LCBkaXNhYmxlZDogIW5vZGUsIGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1wbHVzLWNpcmNsZS1vdXRsaW5lXCIsIG9uVG91Y2hUYXA6IHRoaXMub25WYWxpZGF0ZU5vZGUuYmluZCh0aGlzKSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBOb2Rlc1BpY2tlcjtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBOb2Rlc1BpY2tlciA9ICgwLCBfbWF0ZXJpYWxVaVN0eWxlcy5tdWlUaGVtZWFibGUpKCkoTm9kZXNQaWNrZXIpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gTm9kZXNQaWNrZXI7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX1VzZXJCYWRnZSA9IHJlcXVpcmUoJy4vVXNlckJhZGdlJyk7XG5cbnZhciBfVXNlckJhZGdlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1VzZXJCYWRnZSk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIgPSByZXF1aXJlKCcuLi9TaGFyZUNvbnRleHRDb25zdW1lcicpO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1NoYXJlQ29udGV4dENvbnN1bWVyKTtcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIFNoYXJlZFVzZXJFbnRyeSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1NoYXJlZFVzZXJFbnRyeScsXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgY2VsbEFjbDogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgICBzZW5kSW52aXRhdGlvbnM6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgICAgICBvblVzZXJPYmplY3RSZW1vdmU6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIG9uVXNlck9iamVjdFVwZGF0ZVJpZ2h0OiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkXG4gICAgfSxcbiAgICBvblJlbW92ZTogZnVuY3Rpb24gb25SZW1vdmUoKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25Vc2VyT2JqZWN0UmVtb3ZlKHRoaXMucHJvcHMuY2VsbEFjbC5Sb2xlSWQpO1xuICAgIH0sXG4gICAgb25JbnZpdGU6IGZ1bmN0aW9uIG9uSW52aXRlKCkge1xuICAgICAgICB2YXIgdGFyZ2V0cyA9IHt9O1xuICAgICAgICB2YXIgdXNlck9iamVjdCA9IFB5ZGlvVXNlcnMuVXNlci5mcm9tSWRtVXNlcih0aGlzLnByb3BzLmNlbGxBY2wuVXNlcik7XG4gICAgICAgIHRhcmdldHNbdXNlck9iamVjdC5nZXRJZCgpXSA9IHVzZXJPYmplY3Q7XG4gICAgICAgIHRoaXMucHJvcHMuc2VuZEludml0YXRpb25zKHRhcmdldHMpO1xuICAgIH0sXG4gICAgb25VcGRhdGVSaWdodDogZnVuY3Rpb24gb25VcGRhdGVSaWdodChldmVudCkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICB0aGlzLnByb3BzLm9uVXNlck9iamVjdFVwZGF0ZVJpZ2h0KHRoaXMucHJvcHMuY2VsbEFjbC5Sb2xlSWQsIHRhcmdldC5uYW1lLCB0YXJnZXQuY2hlY2tlZCk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBjZWxsQWNsID0gX3Byb3BzLmNlbGxBY2w7XG4gICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcblxuICAgICAgICB2YXIgbWVudUl0ZW1zID0gW107XG4gICAgICAgIHZhciB0eXBlID0gY2VsbEFjbC5Vc2VyID8gJ3VzZXInIDogY2VsbEFjbC5Hcm91cCA/ICdncm91cCcgOiAndGVhbSc7XG5cbiAgICAgICAgLy8gRG8gbm90IHJlbmRlciBjdXJyZW50IHVzZXJcbiAgICAgICAgaWYgKGNlbGxBY2wuVXNlciAmJiBjZWxsQWNsLlVzZXIuTG9naW4gPT09IHB5ZGlvLnVzZXIuaWQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGUgIT0gJ2dyb3VwJykge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc2VuZEludml0YXRpb25zKSB7XG4gICAgICAgICAgICAgICAgLy8gU2VuZCBpbnZpdGF0aW9uXG4gICAgICAgICAgICAgICAgbWVudUl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzQ1JyksXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiB0aGlzLm9uSW52aXRlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmlzUmVhZG9ubHkoKSAmJiAhdGhpcy5wcm9wcy5yZWFkb25seSkge1xuICAgICAgICAgICAgLy8gUmVtb3ZlIEVudHJ5XG4gICAgICAgICAgICBtZW51SXRlbXMucHVzaCh7XG4gICAgICAgICAgICAgICAgdGV4dDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcyNTcnLCAnJyksXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IHRoaXMub25SZW1vdmVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxhYmVsID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgYXZhdGFyID0gdW5kZWZpbmVkO1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJ1c2VyXCI6XG4gICAgICAgICAgICAgICAgbGFiZWwgPSBjZWxsQWNsLlVzZXIuQXR0cmlidXRlc1tcImRpc3BsYXlOYW1lXCJdIHx8IGNlbGxBY2wuVXNlci5Mb2dpbjtcbiAgICAgICAgICAgICAgICBhdmF0YXIgPSBjZWxsQWNsLlVzZXIuQXR0cmlidXRlc1tcImF2YXRhclwiXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJncm91cFwiOlxuICAgICAgICAgICAgICAgIGlmICghY2VsbEFjbC5Hcm91cC5BdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsID0gY2VsbEFjbC5Hcm91cC5VdWlkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsID0gY2VsbEFjbC5Hcm91cC5BdHRyaWJ1dGVzW1wiZGlzcGxheU5hbWVcIl0gfHwgY2VsbEFjbC5Hcm91cC5Hcm91cExhYmVsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJ0ZWFtXCI6XG4gICAgICAgICAgICAgICAgaWYgKCFjZWxsQWNsLlJvbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBcIk5vIHJvbGUgZm91bmRcIjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IGNlbGxBY2wuUm9sZS5MYWJlbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGxhYmVsID0gY2VsbEFjbC5Sb2xlSWQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlYWQgPSBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRlID0gZmFsc2U7XG4gICAgICAgIGNlbGxBY2wuQWN0aW9ucy5tYXAoZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgICAgICAgaWYgKGFjdGlvbi5OYW1lID09PSAncmVhZCcpIHJlYWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGFjdGlvbi5OYW1lID09PSAnd3JpdGUnKSB3cml0ZSA9IHRydWU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgX1VzZXJCYWRnZTJbJ2RlZmF1bHQnXSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgICAgICAgICAgYXZhdGFyOiBhdmF0YXIsXG4gICAgICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgICAgICBtZW51czogbWVudUl0ZW1zXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICd1c2VyLWJhZGdlLXJpZ2h0cy1jb250YWluZXInLCBzdHlsZTogIW1lbnVJdGVtcy5sZW5ndGggPyB7IG1hcmdpblJpZ2h0OiA0OCB9IDoge30gfSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHsgdHlwZTogJ2NoZWNrYm94JywgbmFtZTogJ3JlYWQnLCBkaXNhYmxlZDogdGhpcy5wcm9wcy5pc1JlYWRvbmx5KCkgfHwgdGhpcy5wcm9wcy5yZWFkb25seSwgY2hlY2tlZDogcmVhZCwgb25DaGFuZ2U6IHRoaXMub25VcGRhdGVSaWdodCB9KSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHsgdHlwZTogJ2NoZWNrYm94JywgbmFtZTogJ3dyaXRlJywgZGlzYWJsZWQ6IHRoaXMucHJvcHMuaXNSZWFkb25seSgpIHx8IHRoaXMucHJvcHMucmVhZG9ubHksIGNoZWNrZWQ6IHdyaXRlLCBvbkNoYW5nZTogdGhpcy5vblVwZGF0ZVJpZ2h0IH0pXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFNoYXJlZFVzZXJFbnRyeSA9ICgwLCBfU2hhcmVDb250ZXh0Q29uc3VtZXIyWydkZWZhdWx0J10pKFNoYXJlZFVzZXJFbnRyeSk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBTaGFyZWRVc2VyRW50cnk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIgPSByZXF1aXJlKCcuLi9TaGFyZUNvbnRleHRDb25zdW1lcicpO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1NoYXJlQ29udGV4dENvbnN1bWVyKTtcblxudmFyIF9Vc2VyQmFkZ2UgPSByZXF1aXJlKCcuL1VzZXJCYWRnZScpO1xuXG52YXIgX1VzZXJCYWRnZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Vc2VyQmFkZ2UpO1xuXG52YXIgX1NoYXJlZFVzZXJFbnRyeSA9IHJlcXVpcmUoJy4vU2hhcmVkVXNlckVudHJ5Jyk7XG5cbnZhciBfU2hhcmVkVXNlckVudHJ5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1NoYXJlZFVzZXJFbnRyeSk7XG5cbnZhciBfbWFpbkFjdGlvbkJ1dHRvbiA9IHJlcXVpcmUoJy4uL21haW4vQWN0aW9uQnV0dG9uJyk7XG5cbnZhciBfbWFpbkFjdGlvbkJ1dHRvbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYWluQWN0aW9uQnV0dG9uKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignY29tcG9uZW50cycpO1xuXG52YXIgVXNlcnNDb21wbGV0ZXIgPSBfUHlkaW8kcmVxdWlyZUxpYi5Vc2Vyc0NvbXBsZXRlcjtcblxudmFyIFNoYXJlZFVzZXJzID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1NoYXJlZFVzZXJzJyxcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBweWRpbzogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKF9weWRpbzJbJ2RlZmF1bHQnXSksXG5cbiAgICAgICAgY2VsbEFjbHM6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0LFxuXG4gICAgICAgIHNhdmVTZWxlY3Rpb25Bc1RlYW06IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgc2VuZEludml0YXRpb25zOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIHNob3dUaXRsZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5ib29sLFxuXG4gICAgICAgIG9uVXNlck9iamVjdEFkZDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIG9uVXNlck9iamVjdFJlbW92ZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIG9uVXNlck9iamVjdFVwZGF0ZVJpZ2h0OiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZFxuXG4gICAgfSxcbiAgICBzZW5kSW52aXRhdGlvblRvQWxsVXNlcnM6IGZ1bmN0aW9uIHNlbmRJbnZpdGF0aW9uVG9BbGxVc2VycygpIHtcbiAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBjZWxsQWNscyA9IF9wcm9wcy5jZWxsQWNscztcbiAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuXG4gICAgICAgIHZhciB1c2VyT2JqZWN0cyA9IFtdO1xuICAgICAgICBPYmplY3Qua2V5cyhjZWxsQWNscykubWFwKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICB2YXIgYWNsID0gY2VsbEFjbHNba107XG4gICAgICAgICAgICBpZiAoYWNsLlVzZXIgJiYgYWNsLlVzZXIuTG9naW4gPT09IHB5ZGlvLnVzZXIuaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYWNsLlVzZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgdXNlck9iamVjdCA9IFB5ZGlvVXNlcnMuVXNlci5mcm9tSWRtVXNlcihhY2wuVXNlcik7XG4gICAgICAgICAgICAgICAgdXNlck9iamVjdHNbdXNlck9iamVjdC5nZXRJZCgpXSA9IHVzZXJPYmplY3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnByb3BzLnNlbmRJbnZpdGF0aW9ucyh1c2VyT2JqZWN0cyk7XG4gICAgfSxcbiAgICBjbGVhckFsbFVzZXJzOiBmdW5jdGlvbiBjbGVhckFsbFVzZXJzKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMucHJvcHMuY2VsbEFjbHMpLm1hcChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgX3RoaXMucHJvcHMub25Vc2VyT2JqZWN0UmVtb3ZlKGspO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHZhbHVlU2VsZWN0ZWQ6IGZ1bmN0aW9uIHZhbHVlU2VsZWN0ZWQodXNlck9iamVjdCkge1xuICAgICAgICBpZiAodXNlck9iamVjdC5JZG1Vc2VyKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uVXNlck9iamVjdEFkZCh1c2VyT2JqZWN0LklkbVVzZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblVzZXJPYmplY3RBZGQodXNlck9iamVjdC5JZG1Sb2xlKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIGNlbGxBY2xzID0gX3Byb3BzMi5jZWxsQWNscztcbiAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzMi5weWRpbztcblxuICAgICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgICB2YXIgdXNlckVudHJpZXMgPSBbXTtcbiAgICAgICAgT2JqZWN0LmtleXMoY2VsbEFjbHMpLm1hcChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgdmFyIGFjbCA9IGNlbGxBY2xzW2tdO1xuICAgICAgICAgICAgaWYgKGFjbC5Vc2VyICYmIGFjbC5Vc2VyLkxvZ2luID09PSBweWRpby51c2VyLmlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgIHVzZXJFbnRyaWVzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX1NoYXJlZFVzZXJFbnRyeTJbJ2RlZmF1bHQnXSwge1xuICAgICAgICAgICAgICAgIGNlbGxBY2w6IGFjbCxcbiAgICAgICAgICAgICAgICBrZXk6IGluZGV4LFxuICAgICAgICAgICAgICAgIHB5ZGlvOiBfdGhpczIucHJvcHMucHlkaW8sXG4gICAgICAgICAgICAgICAgcmVhZG9ubHk6IF90aGlzMi5wcm9wcy5yZWFkb25seSxcbiAgICAgICAgICAgICAgICBzZW5kSW52aXRhdGlvbnM6IF90aGlzMi5wcm9wcy5zZW5kSW52aXRhdGlvbnMsXG4gICAgICAgICAgICAgICAgb25Vc2VyT2JqZWN0UmVtb3ZlOiBfdGhpczIucHJvcHMub25Vc2VyT2JqZWN0UmVtb3ZlLFxuICAgICAgICAgICAgICAgIG9uVXNlck9iamVjdFVwZGF0ZVJpZ2h0OiBfdGhpczIucHJvcHMub25Vc2VyT2JqZWN0VXBkYXRlUmlnaHRcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGFjdGlvbkxpbmtzID0gW107XG4gICAgICAgIHZhciBhY2xzTGVuZ3RoID0gT2JqZWN0LmtleXModGhpcy5wcm9wcy5jZWxsQWNscykubGVuZ3RoO1xuICAgICAgICBpZiAoYWNsc0xlbmd0aCAmJiAhdGhpcy5wcm9wcy5pc1JlYWRvbmx5KCkgJiYgIXRoaXMucHJvcHMucmVhZG9ubHkpIHtcbiAgICAgICAgICAgIGFjdGlvbkxpbmtzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21haW5BY3Rpb25CdXR0b24yWydkZWZhdWx0J10sIHsga2V5OiAnY2xlYXInLCBjYWxsYmFjazogdGhpcy5jbGVhckFsbFVzZXJzLCBtZGlJY29uOiAnZGVsZXRlJywgbWVzc2FnZUlkOiAnMTgwJyB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFjbHNMZW5ndGggJiYgdGhpcy5wcm9wcy5zZW5kSW52aXRhdGlvbnMpIHtcbiAgICAgICAgICAgIGFjdGlvbkxpbmtzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21haW5BY3Rpb25CdXR0b24yWydkZWZhdWx0J10sIHsga2V5OiAnaW52aXRlJywgY2FsbGJhY2s6IHRoaXMuc2VuZEludml0YXRpb25Ub0FsbFVzZXJzLCBtZGlJY29uOiAnZW1haWwtb3V0bGluZScsIG1lc3NhZ2VJZDogJzQ1JyB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuc2F2ZVNlbGVjdGlvbkFzVGVhbSAmJiBhY2xzTGVuZ3RoID4gMSAmJiAhdGhpcy5wcm9wcy5pc1JlYWRvbmx5KCkgJiYgIXRoaXMucHJvcHMucmVhZG9ubHkpIHtcbiAgICAgICAgICAgIGFjdGlvbkxpbmtzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21haW5BY3Rpb25CdXR0b24yWydkZWZhdWx0J10sIHsga2V5OiAndGVhbScsIGNhbGxiYWNrOiB0aGlzLnByb3BzLnNhdmVTZWxlY3Rpb25Bc1RlYW0sIG1kaUljb246ICdhY2NvdW50LW11bHRpcGxlLXBsdXMnLCBtZXNzYWdlSWQ6ICc1MDknLCBtZXNzYWdlQ29yZU5hbWVzcGFjZTogdHJ1ZSB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJ3SGVhZGVyID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgdXNlcnNJbnB1dCA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHVzZXJFbnRyaWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgcndIZWFkZXIgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgbWFyZ2luQm90dG9tOiAtOCwgbWFyZ2luVG9wOiAtOCwgY29sb3I6ICdyZ2JhKDAsMCwwLC4zMyknLCBmb250U2l6ZTogMTIgfSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IHN0eWxlOiB7IGZsZXg6IDEgfSB9KSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6IDQzLCB0ZXh0QWxpZ246ICdjZW50ZXInIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGJvcmRlckJvdHRvbTogJzJweCBzb2xpZCByZ2JhKDAsMCwwLDAuMTMpJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzM2MScsICcnKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6IDQzLCB0ZXh0QWxpZ246ICdjZW50ZXInIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGJvcmRlckJvdHRvbTogJzJweCBzb2xpZCByZ2JhKDAsMCwwLDAuMTMpJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE4MScpXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IHN0eWxlOiB7IHdpZHRoOiA1MiB9IH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5pc1JlYWRvbmx5KCkgJiYgIXRoaXMucHJvcHMucmVhZG9ubHkpIHtcbiAgICAgICAgICAgIHVzZXJzSW5wdXQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChVc2Vyc0NvbXBsZXRlciwge1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ3NoYXJlLWZvcm0tdXNlcnMnLFxuICAgICAgICAgICAgICAgIGZpZWxkTGFiZWw6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMzQnKSxcbiAgICAgICAgICAgICAgICBvblZhbHVlU2VsZWN0ZWQ6IHRoaXMudmFsdWVTZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBweWRpbzogdGhpcy5wcm9wcy5weWRpbyxcbiAgICAgICAgICAgICAgICBzaG93QWRkcmVzc0Jvb2s6IHRydWUsXG4gICAgICAgICAgICAgICAgdXNlcnNGcm9tOiAnbG9jYWwnLFxuICAgICAgICAgICAgICAgIGV4Y2x1ZGVzOiBPYmplY3QudmFsdWVzKGNlbGxBY2xzKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB1c2VyRW50cmllcy5sZW5ndGggPyB7IG1hcmdpbjogJy0yMHB4IDhweCAxNnB4JyB9IDogeyBtYXJnaW5Ub3A6IC0yMCB9IH0sXG4gICAgICAgICAgICAgICAgdXNlcnNJbnB1dFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIHJ3SGVhZGVyLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICB1c2VyRW50cmllc1xuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICF1c2VyRW50cmllcy5sZW5ndGggJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBjb2xvcjogJ3JnYmEoMCwwLDAsMC40MyknIH0gfSxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE4MicpXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgdXNlckVudHJpZXMubGVuZ3RoID4gMCAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHRleHRBbGlnbjogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgIGFjdGlvbkxpbmtzXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFNoYXJlZFVzZXJzID0gKDAsIF9TaGFyZUNvbnRleHRDb25zdW1lcjJbJ2RlZmF1bHQnXSkoU2hhcmVkVXNlcnMpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gU2hhcmVkVXNlcnM7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZXF1aXJlID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIENvbXBvbmVudCA9IF9yZXF1aXJlLkNvbXBvbmVudDtcbnZhciBQcm9wVHlwZXMgPSBfcmVxdWlyZS5Qcm9wVHlwZXM7XG5cbnZhciBfcmVxdWlyZTIgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgTWVudUl0ZW0gPSBfcmVxdWlyZTIuTWVudUl0ZW07XG52YXIgSWNvbk1lbnUgPSBfcmVxdWlyZTIuSWNvbk1lbnU7XG52YXIgSWNvbkJ1dHRvbiA9IF9yZXF1aXJlMi5JY29uQnV0dG9uO1xuXG52YXIgX3JlcXVpcmUzID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWkvc3R5bGVzJyk7XG5cbnZhciBtdWlUaGVtZWFibGUgPSBfcmVxdWlyZTMubXVpVGhlbWVhYmxlO1xuXG52YXIgQ29sb3IgPSByZXF1aXJlKCdjb2xvcicpO1xuXG52YXIgVXNlckJhZGdlID0gKGZ1bmN0aW9uIChfQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFVzZXJCYWRnZSwgX0NvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBVc2VyQmFkZ2UoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBVc2VyQmFkZ2UpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFVzZXJCYWRnZS5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhVc2VyQmFkZ2UsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlck1lbnUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyTWVudSgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5wcm9wcy5tZW51cyB8fCAhdGhpcy5wcm9wcy5tZW51cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBtZW51SXRlbXMgPSB0aGlzLnByb3BzLm1lbnVzLm1hcChmdW5jdGlvbiAobSkge1xuICAgICAgICAgICAgICAgIHZhciByaWdodEljb24gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKG0uY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICByaWdodEljb24gPSBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdtZGkgbWRpLWNoZWNrJyB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTWVudUl0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeVRleHQ6IG0udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFRhcDogbS5jYWxsYmFjayxcbiAgICAgICAgICAgICAgICAgICAgcmlnaHRJY29uOiByaWdodEljb24gfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBpY29uU3R5bGUgPSB7IGZvbnRTaXplOiAxOCB9O1xuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgSWNvbk1lbnUsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpY29uQnV0dG9uRWxlbWVudDogUmVhY3QuY3JlYXRlRWxlbWVudChJY29uQnV0dG9uLCB7IHN0eWxlOiB7IHBhZGRpbmc6IDE2IH0sIGljb25TdHlsZTogaWNvblN0eWxlLCBpY29uQ2xhc3NOYW1lOiAnaWNvbi1lbGxpcHNpcy12ZXJ0aWNhbCcgfSksXG4gICAgICAgICAgICAgICAgICAgIGFuY2hvck9yaWdpbjogeyBob3Jpem9udGFsOiAncmlnaHQnLCB2ZXJ0aWNhbDogJ3RvcCcgfSxcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0T3JpZ2luOiB7IGhvcml6b250YWw6ICdyaWdodCcsIHZlcnRpY2FsOiAndG9wJyB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBtZW51SXRlbXNcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgYXZhdGFyID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdmFyIGF2YXRhckNvbG9yID0gdGhpcy5wcm9wcy5tdWlUaGVtZS5wYWxldHRlLmF2YXRhcnNDb2xvcjtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnR5cGUgPT0gJ2dyb3VwJykge1xuICAgICAgICAgICAgICAgIGF2YXRhckNvbG9yID0gQ29sb3IoYXZhdGFyQ29sb3IpLmRhcmtlbiguMikudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBhdmF0YXIgPSBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdhdmF0YXIgbWRpIG1kaS1hY2NvdW50LW11bHRpcGxlJywgc3R5bGU6IHsgYmFja2dyb3VuZENvbG9yOiBhdmF0YXJDb2xvciB9IH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnR5cGUgPT0gJ3RlYW0nKSB7XG4gICAgICAgICAgICAgICAgYXZhdGFyQ29sb3IgPSBDb2xvcihhdmF0YXJDb2xvcikuZGFya2VuKC4yKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIGF2YXRhciA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ2F2YXRhciBtZGkgbWRpLWFjY291bnQtbXVsdGlwbGUtb3V0bGluZScsIHN0eWxlOiB7IGJhY2tncm91bmRDb2xvcjogYXZhdGFyQ29sb3IgfSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy50eXBlID09ICd0ZW1wb3JhcnknKSB7XG4gICAgICAgICAgICAgICAgYXZhdGFyQ29sb3IgPSBDb2xvcihhdmF0YXJDb2xvcikubGlnaHRlbiguMikudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBhdmF0YXIgPSBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdhdmF0YXIgbWRpIG1kaS1hY2NvdW50LXBsdXMnLCBzdHlsZTogeyBiYWNrZ3JvdW5kQ29sb3I6IGF2YXRhckNvbG9yIH0gfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMudHlwZSA9PSAncmVtb3RlX3VzZXInKSB7XG4gICAgICAgICAgICAgICAgYXZhdGFyID0gUmVhY3QuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnYXZhdGFyIG1kaSBtZGktYWNjb3VudC1uZXR3b3JrJywgc3R5bGU6IHsgYmFja2dyb3VuZENvbG9yOiBhdmF0YXJDb2xvciB9IH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhdmF0YXIgPSBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdhdmF0YXIgbWRpIG1kaS1hY2NvdW50Jywgc3R5bGU6IHsgYmFja2dyb3VuZENvbG9yOiBhdmF0YXJDb2xvciB9IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG1lbnUgPSB0aGlzLnJlbmRlck1lbnUoKTtcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcInNoYXJlLWRpYWxvZyB1c2VyLWJhZGdlIHVzZXItdHlwZS1cIiArIHRoaXMucHJvcHMudHlwZSB9LFxuICAgICAgICAgICAgICAgIGF2YXRhcixcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAndXNlci1iYWRnZS1sYWJlbCcgfSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5sYWJlbFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5jaGlsZHJlbixcbiAgICAgICAgICAgICAgICBtZW51XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFVzZXJCYWRnZTtcbn0pKENvbXBvbmVudCk7XG5cblVzZXJCYWRnZS5wcm9wVHlwZXMgPSB7XG4gICAgbGFiZWw6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgYXZhdGFyOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHR5cGU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgbWVudXM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgbXVpVGhlbWU6IFByb3BUeXBlcy5vYmplY3Rcbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFVzZXJCYWRnZSA9IG11aVRoZW1lYWJsZSgpKFVzZXJCYWRnZSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFVzZXJCYWRnZTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX0NvbXBvc2l0ZU1vZGVsID0gcmVxdWlyZSgnLi9Db21wb3NpdGVNb2RlbCcpO1xuXG52YXIgX0NvbXBvc2l0ZU1vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NvbXBvc2l0ZU1vZGVsKTtcblxudmFyIF9jZWxsc1NoYXJlZFVzZXJzID0gcmVxdWlyZSgnLi4vY2VsbHMvU2hhcmVkVXNlcnMnKTtcblxudmFyIF9jZWxsc1NoYXJlZFVzZXJzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NlbGxzU2hhcmVkVXNlcnMpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfbWF0ZXJpYWxVaVN0eWxlcyA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpL3N0eWxlcycpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgQ2VsbHNMaXN0ID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKENlbGxzTGlzdCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBDZWxsc0xpc3QocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENlbGxzTGlzdCk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoQ2VsbHNMaXN0LnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0geyBlZGl0OiBudWxsIH07XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKENlbGxzTGlzdCwgW3tcbiAgICAgICAga2V5OiAnYWRkVG9DZWxsc01lbnVJdGVtcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRUb0NlbGxzTWVudUl0ZW1zKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XG4gICAgICAgICAgICAvLyBMaXN0IHVzZXIgYXZhaWxhYmxlIGNlbGxzIC0gRXhjbHVkZSBjZWxscyB3aGVyZSB0aGlzIG5vZGUgaXMgYWxyZWFkeSBzaGFyZWRcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIGNvbXBvc2l0ZU1vZGVsID0gX3Byb3BzLmNvbXBvc2l0ZU1vZGVsO1xuXG4gICAgICAgICAgICB2YXIgY3VycmVudENlbGxzID0gY29tcG9zaXRlTW9kZWwuZ2V0Q2VsbHMoKS5tYXAoZnVuY3Rpb24gKGNlbGxNb2RlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjZWxsTW9kZWwuZ2V0VXVpZCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBweWRpby51c2VyLmdldFJlcG9zaXRvcmllc0xpc3QoKS5mb3JFYWNoKGZ1bmN0aW9uIChyZXBvc2l0b3J5KSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlcG9zaXRvcnkuZ2V0T3duZXIoKSA9PT0gJ3NoYXJlZCcgJiYgY3VycmVudENlbGxzLmluZGV4T2YocmVwb3NpdG9yeS5nZXRJZCgpKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRvdWNoVGFwID0gZnVuY3Rpb24gdG91Y2hUYXAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGFkZE1lbnVPcGVuOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvc2l0ZU1vZGVsLmFkZFRvRXhpc3RpbmdDZWxsKHJlcG9zaXRvcnkuZ2V0SWQoKSk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgcHJpbWFyeVRleHQ6IHJlcG9zaXRvcnkuZ2V0TGFiZWwoKSwgb25Ub3VjaFRhcDogdG91Y2hUYXAgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBjb21wb3NpdGVNb2RlbCA9IF9wcm9wczIuY29tcG9zaXRlTW9kZWw7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMyLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIHVzZXJzSW52aXRhdGlvbnMgPSBfcHJvcHMyLnVzZXJzSW52aXRhdGlvbnM7XG4gICAgICAgICAgICB2YXIgbXVpVGhlbWUgPSBfcHJvcHMyLm11aVRoZW1lO1xuXG4gICAgICAgICAgICB2YXIgbSA9IGZ1bmN0aW9uIG0oaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci4nICsgaWRdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciBlZGl0ID0gdGhpcy5zdGF0ZS5lZGl0O1xuXG4gICAgICAgICAgICB2YXIgY2VsbHMgPSBbXTtcbiAgICAgICAgICAgIGNvbXBvc2l0ZU1vZGVsLmdldENlbGxzKCkubWFwKGZ1bmN0aW9uIChjZWxsTW9kZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWwgPSBjZWxsTW9kZWwuZ2V0TGFiZWwoKTtcbiAgICAgICAgICAgICAgICB2YXIgaXNFZGl0ID0gIWNlbGxNb2RlbC5nZXRVdWlkKCkgJiYgZWRpdCA9PT0gJ05FV0NFTEwnIHx8IGVkaXQgPT09IGNlbGxNb2RlbC5nZXRVdWlkKCk7XG4gICAgICAgICAgICAgICAgdmFyIHRvZ2dsZVN0YXRlID0gZnVuY3Rpb24gdG9nZ2xlU3RhdGUoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0VkaXQgJiYgZWRpdCA9PT0gJ05FV0NFTEwnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgbmV3IGNlbGwgaWYgaXQgd2FzIGNyZWF0ZWQgZW1wdHlcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhY2xzID0gY2VsbE1vZGVsLmdldEFjbHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghT2JqZWN0LmtleXMoYWNscykubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9zaXRlTW9kZWwucmVtb3ZlTmV3Q2VsbChjZWxsTW9kZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IGVkaXQ6IGlzRWRpdCA/IG51bGwgOiBjZWxsTW9kZWwuZ2V0VXVpZCgpIH0pO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB2YXIgcmVtb3ZlTm9kZSA9IGZ1bmN0aW9uIHJlbW92ZU5vZGUoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNlbGxNb2RlbC5yZW1vdmVSb290Tm9kZShjb21wb3NpdGVNb2RlbC5nZXROb2RlKCkuZ2V0TWV0YWRhdGEoKS5nZXQoJ3V1aWQnKSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB2YXIgcmlnaHRJY29uID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGlmIChpc0VkaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmlnaHRJY29uID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBpY29uQ2xhc3NOYW1lOiBcIm1kaSBtZGktY2xvc2VcIiwgdG9vbHRpcDogcHlkaW8uTWVzc2FnZUhhc2hbJzg2J10sIG9uVG91Y2hUYXA6IHRvZ2dsZVN0YXRlIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2VsbE1vZGVsLmlzRWRpdGFibGUoKSkge1xuICAgICAgICAgICAgICAgICAgICByaWdodEljb24gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLkljb25NZW51LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25CdXR0b25FbGVtZW50OiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1kb3RzLXZlcnRpY2FsXCIgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiB7IGhvcml6b250YWw6ICdyaWdodCcsIHZlcnRpY2FsOiAndG9wJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE9yaWdpbjogeyBob3Jpem9udGFsOiAncmlnaHQnLCB2ZXJ0aWNhbDogJ3RvcCcgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHByaW1hcnlUZXh0OiBtKDI1OCksIG9uVG91Y2hUYXA6IHRvZ2dsZVN0YXRlIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgcHJpbWFyeVRleHQ6IG0oMjU5KSwgb25Ub3VjaFRhcDogcmVtb3ZlTm9kZSB9KVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjZWxscy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkxpc3RJdGVtLCB7XG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlUZXh0OiBsYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5VGV4dDogY2VsbE1vZGVsLmdldEFjbHNTdWJqZWN0cygpLFxuICAgICAgICAgICAgICAgICAgICByaWdodEljb25CdXR0b246IHJpZ2h0SWNvbixcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFRhcDogdG9nZ2xlU3RhdGUsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiBpc0VkaXQgPyB7IGJhY2tncm91bmRDb2xvcjogJ3JnYigyNDUsIDI0NSwgMjQ1KScgfSA6IHt9LFxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZWRpdCA9PT0gJ05FV0NFTEwnICYmICFpc0VkaXRcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgaWYgKGlzRWRpdCkge1xuICAgICAgICAgICAgICAgICAgICBjZWxscy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUGFwZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHpEZXB0aDogMCwgc3R5bGU6IHsgYmFja2dyb3VuZENvbG9yOiAncmdiKDI0NSwgMjQ1LCAyNDUpJywgbWFyZ2luOiAnMCAwIDE2cHgnLCBwYWRkaW5nOiAnMCAxMHB4IDEwcHgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9jZWxsc1NoYXJlZFVzZXJzMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW86IHB5ZGlvLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNlbGxBY2xzOiBjZWxsTW9kZWwuZ2V0QWNscygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4Y2x1ZGVzOiBbcHlkaW8udXNlci5pZF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Vc2VyT2JqZWN0QWRkOiBjZWxsTW9kZWwuYWRkVXNlci5iaW5kKGNlbGxNb2RlbCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Vc2VyT2JqZWN0UmVtb3ZlOiBjZWxsTW9kZWwucmVtb3ZlVXNlci5iaW5kKGNlbGxNb2RlbCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Vc2VyT2JqZWN0VXBkYXRlUmlnaHQ6IGNlbGxNb2RlbC51cGRhdGVVc2VyUmlnaHQuYmluZChjZWxsTW9kZWwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRJbnZpdGF0aW9uczogZnVuY3Rpb24gKHRhcmdldFVzZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB1c2Vyc0ludml0YXRpb25zKHRhcmdldFVzZXJzLCBjZWxsTW9kZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZVNlbGVjdGlvbkFzVGVhbTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhZG9ubHk6ICFjZWxsTW9kZWwuaXNFZGl0YWJsZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2VsbHMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5EaXZpZGVyLCBudWxsKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNlbGxzLnBvcCgpO1xuXG4gICAgICAgICAgICB2YXIgbGVnZW5kID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKGNlbGxzLmxlbmd0aCAmJiBlZGl0ICE9PSAnTkVXQ0VMTCcpIHtcbiAgICAgICAgICAgICAgICBsZWdlbmQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIG0oMjYwKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNlbGxzLmxlbmd0aCAmJiBlZGl0ID09PSAnTkVXQ0VMTCcpIHtcbiAgICAgICAgICAgICAgICBsZWdlbmQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIG0oMjYxKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxlZ2VuZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAnMjFweCAxNnB4IDIxcHggMHB4JywgY3Vyc29yOiAncG9pbnRlcicsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicgfSwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvc2l0ZU1vZGVsLmNyZWF0ZUVtcHR5Q2VsbCgpO190aGlzMi5zZXRTdGF0ZSh7IGVkaXQ6ICdORVdDRUxMJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBpY29uQ2xhc3NOYW1lOiBcImljb21vb24tY2VsbHMtY2xlYXItcGx1c1wiLCBpY29uU3R5bGU6IHsgY29sb3I6IG11aVRoZW1lLnBhbGV0dGUucHJpbWFyeTFDb2xvciB9IH0pLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgbWFyZ2luTGVmdDogOCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtKDI2MilcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBhZGRDZWxsSXRlbXMgPSB0aGlzLmFkZFRvQ2VsbHNNZW51SXRlbXMoKTtcbiAgICAgICAgICAgIHZhciBhZGRUb0NlbGxNZW51ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKGFkZENlbGxJdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBhZGRUb0NlbGxNZW51ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuUmFpc2VkQnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBtYXJnaW5MZWZ0OiAxMCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBtKDI2MyksXG4gICAgICAgICAgICAgICAgICAgICAgICBvblRvdWNoVGFwOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBhZGRNZW51T3BlbjogdHJ1ZSwgYWRkTWVudUFuY2hvcjogZXZlbnQudGFyZ2V0IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5Qb3BvdmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46IHRoaXMuc3RhdGUuYWRkTWVudU9wZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5jaG9yRWw6IHRoaXMuc3RhdGUuYWRkTWVudUFuY2hvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblJlcXVlc3RDbG9zZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBhZGRNZW51T3BlbjogZmFsc2UgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmNob3JPcmlnaW46IHsgaG9yaXpvbnRhbDogJ2xlZnQnLCB2ZXJ0aWNhbDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRPcmlnaW46IHsgaG9yaXpvbnRhbDogJ2xlZnQnLCB2ZXJ0aWNhbDogJ3RvcCcgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLk1lbnUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRDZWxsSXRlbXNcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nQm90dG9tOiAyMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhaXNlZEJ1dHRvbiwgeyBsYWJlbDogbSgyNjQpLCBwcmltYXJ5OiB0cnVlLCBvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9zaXRlTW9kZWwuY3JlYXRlRW1wdHlDZWxsKCk7X3RoaXMyLnNldFN0YXRlKHsgZWRpdDogJ05FV0NFTEwnIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgYWRkVG9DZWxsTWVudVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogNTAwLCBjb2xvcjogJ3JnYmEoMCwgMCwgMCwgMC40MyknIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgbGVnZW5kXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuTGlzdCxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgY2VsbHNcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIENlbGxzTGlzdDtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5DZWxsc0xpc3QuUHJvcFR5cGVzID0ge1xuICAgIHB5ZGlvOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoX3B5ZGlvMlsnZGVmYXVsdCddKSxcbiAgICBjb21wb3NpdGVNb2RlbDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKF9Db21wb3NpdGVNb2RlbDJbJ2RlZmF1bHQnXSkuaXNSZXF1aXJlZCxcbiAgICB1c2Vyc0ludml0YXRpb25zOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmNcbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IENlbGxzTGlzdCA9ICgwLCBfbWF0ZXJpYWxVaVN0eWxlcy5tdWlUaGVtZWFibGUpKCkoQ2VsbHNMaXN0KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ2VsbHNMaXN0O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfbWFpbkdlbmVyaWNDYXJkID0gcmVxdWlyZSgnLi4vbWFpbi9HZW5lcmljQ2FyZCcpO1xuXG52YXIgX2NvbXBvc2l0ZUNvbXBvc2l0ZU1vZGVsID0gcmVxdWlyZSgnLi4vY29tcG9zaXRlL0NvbXBvc2l0ZU1vZGVsJyk7XG5cbnZhciBfY29tcG9zaXRlQ29tcG9zaXRlTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY29tcG9zaXRlQ29tcG9zaXRlTW9kZWwpO1xuXG52YXIgX21haW5HZW5lcmljRWRpdG9yID0gcmVxdWlyZSgnLi4vbWFpbi9HZW5lcmljRWRpdG9yJyk7XG5cbnZhciBfbWFpbkdlbmVyaWNFZGl0b3IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpbkdlbmVyaWNFZGl0b3IpO1xuXG52YXIgX2xpbmtzUGFuZWwgPSByZXF1aXJlKCcuLi9saW5rcy9QYW5lbCcpO1xuXG52YXIgX2xpbmtzUGFuZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbGlua3NQYW5lbCk7XG5cbnZhciBfbGlua3NTZWN1cmVPcHRpb25zID0gcmVxdWlyZSgnLi4vbGlua3MvU2VjdXJlT3B0aW9ucycpO1xuXG52YXIgX2xpbmtzU2VjdXJlT3B0aW9uczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9saW5rc1NlY3VyZU9wdGlvbnMpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlciA9IHJlcXVpcmUoJy4uL21haW4vU2hhcmVIZWxwZXInKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9NYWlsZXIgPSByZXF1aXJlKCcuL01haWxlcicpO1xuXG52YXIgX01haWxlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9NYWlsZXIpO1xuXG52YXIgX0NlbGxzTGlzdCA9IHJlcXVpcmUoJy4vQ2VsbHNMaXN0Jyk7XG5cbnZhciBfQ2VsbHNMaXN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NlbGxzTGlzdCk7XG5cbnZhciBfY2xpcGJvYXJkID0gcmVxdWlyZSgnY2xpcGJvYXJkJyk7XG5cbnZhciBfY2xpcGJvYXJkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NsaXBib2FyZCk7XG5cbnZhciBfbGlua3NQdWJsaWNMaW5rVGVtcGxhdGUgPSByZXF1aXJlKCcuLi9saW5rcy9QdWJsaWNMaW5rVGVtcGxhdGUnKTtcblxudmFyIF9saW5rc1B1YmxpY0xpbmtUZW1wbGF0ZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9saW5rc1B1YmxpY0xpbmtUZW1wbGF0ZSk7XG5cbnZhciBfbGlua3NWaXNpYmlsaXR5UGFuZWwgPSByZXF1aXJlKCcuLi9saW5rcy9WaXNpYmlsaXR5UGFuZWwnKTtcblxudmFyIF9saW5rc1Zpc2liaWxpdHlQYW5lbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9saW5rc1Zpc2liaWxpdHlQYW5lbCk7XG5cbnZhciBfbGlua3NMYWJlbFBhbmVsID0gcmVxdWlyZSgnLi4vbGlua3MvTGFiZWxQYW5lbCcpO1xuXG52YXIgX2xpbmtzTGFiZWxQYW5lbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9saW5rc0xhYmVsUGFuZWwpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfcmVxdWlyZSRyZXF1aXJlTGliID0gcmVxdWlyZSgncHlkaW8nKS5yZXF1aXJlTGliKCdob2MnKTtcblxudmFyIFBhbGV0dGVNb2RpZmllciA9IF9yZXF1aXJlJHJlcXVpcmVMaWIuUGFsZXR0ZU1vZGlmaWVyO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYihcImJvb3RcIik7XG5cbnZhciBUb29sdGlwID0gX1B5ZGlvJHJlcXVpcmVMaWIuVG9vbHRpcDtcblxudmFyIENvbXBvc2l0ZUNhcmQgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoQ29tcG9zaXRlQ2FyZCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBDb21wb3NpdGVDYXJkKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDb21wb3NpdGVDYXJkKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihDb21wb3NpdGVDYXJkLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgbW9kZTogdGhpcy5wcm9wcy5tb2RlIHx8ICd2aWV3JyxcbiAgICAgICAgICAgIG1vZGVsOiBuZXcgX2NvbXBvc2l0ZUNvbXBvc2l0ZU1vZGVsMlsnZGVmYXVsdCddKHRoaXMucHJvcHMubW9kZSA9PT0gJ2VkaXQnKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhDb21wb3NpdGVDYXJkLCBbe1xuICAgICAgICBrZXk6ICdhdHRhY2hDbGlwYm9hcmQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gYXR0YWNoQ2xpcGJvYXJkKCkge1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gdGhpcy5wcm9wcy5weWRpbztcblxuICAgICAgICAgICAgdmFyIG0gPSBmdW5jdGlvbiBtKGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHB5ZGlvLk1lc3NhZ2VIYXNoWydzaGFyZV9jZW50ZXIuJyArIGlkXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgbW9kZWwgPSB0aGlzLnN0YXRlLm1vZGVsO1xuXG4gICAgICAgICAgICB0aGlzLmRldGFjaENsaXBib2FyZCgpO1xuICAgICAgICAgICAgaWYgKCFtb2RlbC5nZXRMaW5rcygpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSBtb2RlbC5nZXRMaW5rcygpWzBdO1xuICAgICAgICAgICAgaWYgKCFsaW5rTW9kZWwuZ2V0TGluaygpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMucmVmc1snY29weS1idXR0b24nXSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NsaXAgPSBuZXcgX2NsaXBib2FyZDJbJ2RlZmF1bHQnXSh0aGlzLnJlZnNbJ2NvcHktYnV0dG9uJ10sIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogKGZ1bmN0aW9uICh0cmlnZ2VyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5idWlsZFB1YmxpY1VybChweWRpbywgbGlua01vZGVsLmdldExpbmsoKS5MaW5rSGFzaCk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmJpbmQodGhpcylcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGlwLm9uKCdzdWNjZXNzJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29weU1lc3NhZ2U6IG0oJzE5MicpIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgY29weU1lc3NhZ2U6IG51bGwgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAyNTAwKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2xpcC5vbignZXJyb3InLCAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgICAgICAgICB2YXIgY29weU1lc3NhZ2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChnbG9iYWwubmF2aWdhdG9yLnBsYXRmb3JtLmluZGV4T2YoXCJNYWNcIikgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcHlNZXNzYWdlID0gbSgxNDQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29weU1lc3NhZ2UgPSBtKDE0Myk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvcHlNZXNzYWdlOiBjb3B5TWVzc2FnZSB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBjb3B5TWVzc2FnZTogbnVsbCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDI1MDApO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGV0YWNoQ2xpcGJvYXJkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRldGFjaENsaXBib2FyZCgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9jbGlwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2xpcC5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudERpZE1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIG5vZGUgPSBfcHJvcHMubm9kZTtcbiAgICAgICAgICAgIHZhciBtb2RlID0gX3Byb3BzLm1vZGU7XG5cbiAgICAgICAgICAgIHRoaXMuc3RhdGUubW9kZWwub2JzZXJ2ZShcInVwZGF0ZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUubW9kZWwubG9hZChub2RlLCBtb2RlID09PSAnaW5mb1BhbmVsJyk7XG4gICAgICAgICAgICB0aGlzLmF0dGFjaENsaXBib2FyZCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsVW5tb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUubW9kZWwuc3RvcE9ic2VydmluZyhcInVwZGF0ZVwiKTtcbiAgICAgICAgICAgIHRoaXMuZGV0YWNoQ2xpcGJvYXJkKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudERpZFVwZGF0ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgICAgICAgICB0aGlzLmF0dGFjaENsaXBib2FyZCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMocHJvcHMpIHtcbiAgICAgICAgICAgIGlmIChwcm9wcy5ub2RlICYmIChwcm9wcy5ub2RlICE9PSB0aGlzLnByb3BzLm5vZGUgfHwgcHJvcHMubm9kZS5nZXRNZXRhZGF0YSgncHlkaW9fc2hhcmVzJykgIT09IHRoaXMucHJvcHMubm9kZS5nZXRNZXRhZGF0YSgncHlkaW9fc2hhcmVzJykpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5tb2RlbC5sb2FkKHByb3BzLm5vZGUsIHByb3BzLm1vZGUgPT09ICdpbmZvUGFuZWwnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndXNlcnNJbnZpdGF0aW9ucycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1c2Vyc0ludml0YXRpb25zKHVzZXJPYmplY3RzLCBjZWxsTW9kZWwpIHtcbiAgICAgICAgICAgIF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uc2VuZENlbGxJbnZpdGF0aW9uKHRoaXMucHJvcHMubm9kZSwgY2VsbE1vZGVsLCB1c2VyT2JqZWN0cyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2xpbmtJbnZpdGF0aW9uJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxpbmtJbnZpdGF0aW9uKGxpbmtNb2RlbCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgbWFpbERhdGEgPSBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLnByZXBhcmVFbWFpbCh0aGlzLnByb3BzLm5vZGUsIGxpbmtNb2RlbCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1haWxlckRhdGE6IF9leHRlbmRzKHt9LCBtYWlsRGF0YSwgeyB1c2VyczogW10sIGxpbmtNb2RlbDogbGlua01vZGVsIH0pIH0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGFsZXJ0KGUubWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Rpc21pc3NNYWlsZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZGlzbWlzc01haWxlcigpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtYWlsZXJEYXRhOiBudWxsIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzdWJtaXQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLm1vZGVsLnNhdmUoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnB5ZGlvLlVJLmRpc3BsYXlNZXNzYWdlKCdFUlJPUicsIGUubWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIG5vZGUgPSBfcHJvcHMyLm5vZGU7XG4gICAgICAgICAgICB2YXIgbW9kZSA9IF9wcm9wczIubW9kZTtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wczIucHlkaW87XG4gICAgICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIHZhciBtb2RlbCA9IF9zdGF0ZS5tb2RlbDtcbiAgICAgICAgICAgIHZhciBtYWlsZXJEYXRhID0gX3N0YXRlLm1haWxlckRhdGE7XG4gICAgICAgICAgICB2YXIgbGlua1Rvb2x0aXAgPSBfc3RhdGUubGlua1Rvb2x0aXA7XG4gICAgICAgICAgICB2YXIgY29weU1lc3NhZ2UgPSBfc3RhdGUuY29weU1lc3NhZ2U7XG5cbiAgICAgICAgICAgIHZhciBtID0gZnVuY3Rpb24gbShpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBweWRpby5NZXNzYWdlSGFzaFsnc2hhcmVfY2VudGVyLicgKyBpZF07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAobW9kZSA9PT0gJ2VkaXQnKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgcHVibGljTGlua01vZGVsID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGlmIChtb2RlbC5nZXRMaW5rcygpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBwdWJsaWNMaW5rTW9kZWwgPSBtb2RlbC5nZXRMaW5rcygpWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgaGVhZGVyID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGlmIChwdWJsaWNMaW5rTW9kZWwgJiYgcHVibGljTGlua01vZGVsLmdldExpbmtVdWlkKCkgJiYgcHVibGljTGlua01vZGVsLmlzRWRpdGFibGUoKSkge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXIgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9NYWlsZXIyWydkZWZhdWx0J10sIF9leHRlbmRzKHt9LCBtYWlsZXJEYXRhLCB7IHB5ZGlvOiBweWRpbywgb25EaXNtaXNzOiB0aGlzLmRpc21pc3NNYWlsZXIuYmluZCh0aGlzKSB9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbGlua3NMYWJlbFBhbmVsMlsnZGVmYXVsdCddLCB7IHB5ZGlvOiBweWRpbywgbGlua01vZGVsOiBwdWJsaWNMaW5rTW9kZWwgfSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXIgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmb250U2l6ZTogMjQsIHBhZGRpbmc6ICcyNnB4IDEwcHggMCAnLCBsaW5lSGVpZ2h0OiAnMjZweCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX01haWxlcjJbJ2RlZmF1bHQnXSwgX2V4dGVuZHMoe30sIG1haWxlckRhdGEsIHsgcHlkaW86IHB5ZGlvLCBvbkRpc21pc3M6IHRoaXMuZGlzbWlzc01haWxlci5iaW5kKHRoaXMpIH0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oMjU2KS5yZXBsYWNlKCclcycsIG5vZGUuZ2V0TGFiZWwoKSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHRhYnMgPSB7IGxlZnQ6IFtdLCByaWdodDogW10sIGxlZnRTdHlsZTogeyBwYWRkaW5nOiAwIH0gfTtcbiAgICAgICAgICAgICAgICB0YWJzLnJpZ2h0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBMYWJlbDogbSgyNTApLFxuICAgICAgICAgICAgICAgICAgICBWYWx1ZTogXCJjZWxsc1wiLFxuICAgICAgICAgICAgICAgICAgICBDb21wb25lbnQ6IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9DZWxsc0xpc3QyWydkZWZhdWx0J10sIHsgcHlkaW86IHB5ZGlvLCBjb21wb3NpdGVNb2RlbDogbW9kZWwsIHVzZXJzSW52aXRhdGlvbnM6IHRoaXMudXNlcnNJbnZpdGF0aW9ucy5iaW5kKHRoaXMpIH0pXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdmFyIGxpbmtzID0gbW9kZWwuZ2V0TGlua3MoKTtcbiAgICAgICAgICAgICAgICBpZiAocHVibGljTGlua01vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhYnMubGVmdC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIExhYmVsOiBtKDI1MSksXG4gICAgICAgICAgICAgICAgICAgICAgICBWYWx1ZTogJ3B1YmxpYy1saW5rJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIENvbXBvbmVudDogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX2xpbmtzUGFuZWwyWydkZWZhdWx0J10sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9zaXRlTW9kZWw6IG1vZGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtNb2RlbDogbGlua3NbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd01haWxlcjogdGhpcy5saW5rSW52aXRhdGlvbi5iaW5kKHRoaXMpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHB1YmxpY0xpbmtNb2RlbC5nZXRMaW5rVXVpZCgpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsYXlvdXREYXRhID0gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5jb21waWxlTGF5b3V0RGF0YShweWRpbywgbW9kZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRlbXBsYXRlUGFuZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYXlvdXREYXRhLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVBhbmUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbGlua3NQdWJsaWNMaW5rVGVtcGxhdGUyWydkZWZhdWx0J10sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlua01vZGVsOiBwdWJsaWNMaW5rTW9kZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0RGF0YTogbGF5b3V0RGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgcGFkZGluZzogJzEwcHggMTZweCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhZG9ubHk6IG1vZGVsLmdldE5vZGUoKS5pc0xlYWYoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGFicy5sZWZ0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIExhYmVsOiBtKDI1MiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVmFsdWU6ICdsaW5rLXNlY3VyZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQ29tcG9uZW50OiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9saW5rc1NlY3VyZU9wdGlvbnMyWydkZWZhdWx0J10sIHsgcHlkaW86IHB5ZGlvLCBsaW5rTW9kZWw6IGxpbmtzWzBdIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVBhbmUgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRGl2aWRlciwgbnVsbCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlUGFuZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFicy5sZWZ0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIExhYmVsOiBtKDI1MyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVmFsdWU6ICdsaW5rLXZpc2liaWxpdHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbXBvbmVudDogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX2xpbmtzVmlzaWJpbGl0eVBhbmVsMlsnZGVmYXVsdCddLCB7IHB5ZGlvOiBweWRpbywgbGlua01vZGVsOiBsaW5rc1swXSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21haW5HZW5lcmljRWRpdG9yMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgICAgIHRhYnM6IHRhYnMsXG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyOiBoZWFkZXIsXG4gICAgICAgICAgICAgICAgICAgIHNhdmVFbmFibGVkOiBtb2RlbC5pc0RpcnR5KCksXG4gICAgICAgICAgICAgICAgICAgIG9uU2F2ZUFjdGlvbjogdGhpcy5zdWJtaXQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgb25DbG9zZUFjdGlvbjogdGhpcy5wcm9wcy5vbkRpc21pc3MsXG4gICAgICAgICAgICAgICAgICAgIG9uUmV2ZXJ0QWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbC5yZXZlcnRDaGFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IHdpZHRoOiAnMTAwJScsIGhlaWdodDogbnVsbCwgZmxleDogMSwgbWluSGVpZ2h0OiA1NTAsIGNvbG9yOiAncmdiYSgwLDAsMCwuODMpJywgZm9udFNpemU6IDEzIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIF9yZXQgPSAoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBsaW5lcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2VsbHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwuZ2V0Q2VsbHMoKS5tYXAoZnVuY3Rpb24gKGNlbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbGxzLnB1c2goY2VsbC5nZXRMYWJlbCgpKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjZWxscy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21haW5HZW5lcmljQ2FyZC5HZW5lcmljTGluZSwgeyBpY29uQ2xhc3NOYW1lOiAnbWRpIG1kaS1hY2NvdW50LW11bHRpcGxlJywgbGVnZW5kOiBtKDI1NCksIGRhdGE6IGNlbGxzLmpvaW4oJywgJykgfSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBsaW5rcyA9IG1vZGVsLmdldExpbmtzKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsaW5rcy5sZW5ndGggJiYgbGlua3NbMF0uZ2V0TGluaygpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHVibGljTGluayA9IF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uYnVpbGRQdWJsaWNVcmwocHlkaW8sIGxpbmtzWzBdLmdldExpbmsoKS5MaW5rSGFzaCwgbW9kZSA9PT0gJ2luZm9QYW5lbCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWFpbkdlbmVyaWNDYXJkLkdlbmVyaWNMaW5lLCB7IGljb25DbGFzc05hbWU6ICdtZGkgbWRpLWxpbmsnLCBsZWdlbmQ6IG0oMTIxKSwgc3R5bGU6IHsgb3ZlcmZsb3c6ICd2aXNpYmxlJyB9LCBkYXRhU3R5bGU6IHsgb3ZlcmZsb3c6ICd2aXNpYmxlJyB9LCBkYXRhOiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogJ2NvcHktYnV0dG9uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBwb3NpdGlvbjogJ3JlbGF0aXZlJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZU92ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczQuc2V0U3RhdGUoeyBsaW5rVG9vbHRpcDogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlT3V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXM0LnNldFN0YXRlKHsgbGlua1Rvb2x0aXA6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChUb29sdGlwLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogY29weU1lc3NhZ2UgPyBjb3B5TWVzc2FnZSA6IG0oMTkxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvcml6b250YWxQb3NpdGlvbjogXCJsZWZ0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNhbFBvc2l0aW9uOiBcInRvcFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvdzogbGlua1Rvb2x0aXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY0xpbmtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgZGVsZXRlQWN0aW9uID0gZnVuY3Rpb24gZGVsZXRlQWN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpcm0obSgyNTUpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsLnN0b3BPYnNlcnZpbmcoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsLmRlbGV0ZUFsbCgpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RlbC51cGRhdGVVbmRlcmx5aW5nTm9kZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdjogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX21haW5HZW5lcmljQ2FyZC5HZW5lcmljQ2FyZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHB5ZGlvLk1lc3NhZ2VIYXNoWydzaGFyZV9jZW50ZXIuNTAnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25EaXNtaXNzQWN0aW9uOiBfdGhpczQucHJvcHMub25EaXNtaXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkRlbGV0ZUFjdGlvbjogZGVsZXRlQWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkVkaXRBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvLkNvbnRyb2xsZXIuZmlyZUFjdGlvbignc2hhcmUtZWRpdC1zaGFyZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyU21hbGw6IG1vZGUgPT09ICdpbmZvUGFuZWwnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lc1xuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIF9yZXQgPT09ICdvYmplY3QnKSByZXR1cm4gX3JldC52O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIENvbXBvc2l0ZUNhcmQ7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ29tcG9zaXRlQ2FyZCA9IFBhbGV0dGVNb2RpZmllcih7IHByaW1hcnkxQ29sb3I6ICcjMDA5Njg4JyB9KShDb21wb3NpdGVDYXJkKTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IENvbXBvc2l0ZUNhcmQ7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX0NvbXBvc2l0ZUNhcmQgPSByZXF1aXJlKCcuL0NvbXBvc2l0ZUNhcmQnKTtcblxudmFyIF9Db21wb3NpdGVDYXJkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NvbXBvc2l0ZUNhcmQpO1xuXG52YXIgX3B5ZGlvTW9kZWxEYXRhTW9kZWwgPSByZXF1aXJlKCdweWRpby9tb2RlbC9kYXRhLW1vZGVsJyk7XG5cbnZhciBfcHlkaW9Nb2RlbERhdGFNb2RlbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb01vZGVsRGF0YU1vZGVsKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlcXVpcmUkcmVxdWlyZUxpYiA9IHJlcXVpcmUoJ3B5ZGlvJykucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgQWN0aW9uRGlhbG9nTWl4aW4gPSBfcmVxdWlyZSRyZXF1aXJlTGliLkFjdGlvbkRpYWxvZ01peGluO1xuXG52YXIgQ29tcG9zaXRlRGlhbG9nID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnQ29tcG9zaXRlRGlhbG9nJyxcblxuICAgIG1peGluczogW0FjdGlvbkRpYWxvZ01peGluXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlhbG9nVGl0bGU6ICcnLFxuICAgICAgICAgICAgZGlhbG9nSXNNb2RhbDogZmFsc2UsXG4gICAgICAgICAgICBkaWFsb2dQYWRkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGRpYWxvZ1NpemU6ICdsZydcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIHB5ZGlvOiBSZWFjdC5Qcm9wVHlwZXMuaW5zdGFuY2VPZihfcHlkaW8yWydkZWZhdWx0J10pLmlzUmVxdWlyZWQsXG4gICAgICAgIHNlbGVjdGlvbjogUmVhY3QuUHJvcFR5cGVzLmluc3RhbmNlT2YoX3B5ZGlvTW9kZWxEYXRhTW9kZWwyWydkZWZhdWx0J10pLFxuICAgICAgICByZWFkb25seTogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIGNyZWF0ZTogUmVhY3QuUHJvcFR5cGVzLmJvb2xcbiAgICB9LFxuXG4gICAgY2hpbGRDb250ZXh0VHlwZXM6IHtcbiAgICAgICAgbWVzc2FnZXM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgICAgIGdldE1lc3NhZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgICAgICBpc1JlYWRvbmx5OiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuICAgIH0sXG5cbiAgICBnZXRDaGlsZENvbnRleHQ6IGZ1bmN0aW9uIGdldENoaWxkQ29udGV4dCgpIHtcbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1lc3NhZ2VzOiBtZXNzYWdlcyxcbiAgICAgICAgICAgIGdldE1lc3NhZ2U6IGZ1bmN0aW9uIGdldE1lc3NhZ2UobWVzc2FnZUlkKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5hbWVzcGFjZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/ICdzaGFyZV9jZW50ZXInIDogYXJndW1lbnRzWzFdO1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2VzW25hbWVzcGFjZSArIChuYW1lc3BhY2UgPyBcIi5cIiA6IFwiXCIpICsgbWVzc2FnZUlkXSB8fCBtZXNzYWdlSWQ7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZUlkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpc1JlYWRvbmx5OiAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnByb3BzLnJlYWRvbmx5O1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcbiAgICAgICAgdmFyIHNlbGVjdGlvbiA9IF9wcm9wcy5zZWxlY3Rpb247XG5cbiAgICAgICAgdmFyIG5vZGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChzZWxlY3Rpb24uZ2V0VW5pcXVlTm9kZSgpKSB7XG4gICAgICAgICAgICBub2RlID0gc2VsZWN0aW9uLmdldFVuaXF1ZU5vZGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KF9Db21wb3NpdGVDYXJkMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICBtb2RlOiAnZWRpdCcsXG4gICAgICAgICAgICBub2RlOiBub2RlLFxuICAgICAgICAgICAgb25EaXNtaXNzOiB0aGlzLnByb3BzLm9uRGlzbWlzc1xuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ29tcG9zaXRlRGlhbG9nO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3g0LCBfeDUsIF94NikgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeDQsIHByb3BlcnR5ID0gX3g1LCByZWNlaXZlciA9IF94NjsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeDQgPSBwYXJlbnQ7IF94NSA9IHByb3BlcnR5OyBfeDYgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3B5ZGlvTGFuZ09ic2VydmFibGUgPSByZXF1aXJlKCdweWRpby9sYW5nL29ic2VydmFibGUnKTtcblxudmFyIF9weWRpb0xhbmdPYnNlcnZhYmxlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvTGFuZ09ic2VydmFibGUpO1xuXG52YXIgX2xpbmtzTGlua01vZGVsID0gcmVxdWlyZSgnLi4vbGlua3MvTGlua01vZGVsJyk7XG5cbnZhciBfbGlua3NMaW5rTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbGlua3NMaW5rTW9kZWwpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlciA9IHJlcXVpcmUoJy4uL21haW4vU2hhcmVIZWxwZXInKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9weWRpb01vZGVsQ2VsbCA9IHJlcXVpcmUoJ3B5ZGlvL21vZGVsL2NlbGwnKTtcblxudmFyIF9weWRpb01vZGVsQ2VsbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb01vZGVsQ2VsbCk7XG5cbnZhciBfcHlkaW9IdHRwUmVzdEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvcmVzdC1hcGknKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgbW9tZW50ID0gX1B5ZGlvJHJlcXVpcmVMaWIubW9tZW50O1xuXG52YXIgQ29tcG9zaXRlTW9kZWwgPSAoZnVuY3Rpb24gKF9PYnNlcnZhYmxlKSB7XG4gICAgX2luaGVyaXRzKENvbXBvc2l0ZU1vZGVsLCBfT2JzZXJ2YWJsZSk7XG5cbiAgICBmdW5jdGlvbiBDb21wb3NpdGVNb2RlbCgpIHtcbiAgICAgICAgdmFyIGVkaXQgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ29tcG9zaXRlTW9kZWwpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKENvbXBvc2l0ZU1vZGVsLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcyk7XG4gICAgICAgIHRoaXMuY2VsbHMgPSBbXTtcbiAgICAgICAgdGhpcy5saW5rcyA9IFtdO1xuICAgICAgICB0aGlzLmVkaXQgPSBlZGl0O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhDb21wb3NpdGVNb2RlbCwgW3tcbiAgICAgICAga2V5OiAnZW1wdHlMaW5rJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGVtcHR5TGluayhub2RlKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgbGluayA9IG5ldyBfbGlua3NMaW5rTW9kZWwyWydkZWZhdWx0J10oKTtcbiAgICAgICAgICAgIHZhciB0cmVlTm9kZSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5UcmVlTm9kZSgpO1xuICAgICAgICAgICAgdHJlZU5vZGUuVXVpZCA9IG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ3V1aWQnKTtcbiAgICAgICAgICAgIGxpbmsuZ2V0TGluaygpLkxhYmVsID0gbm9kZS5nZXRMYWJlbCgpO1xuICAgICAgICAgICAgbGluay5nZXRMaW5rKCkuRGVzY3JpcHRpb24gPSBweWRpby5NZXNzYWdlSGFzaFsnc2hhcmVfY2VudGVyLjI1NyddLnJlcGxhY2UoJyVzJywgbW9tZW50KG5ldyBEYXRlKCkpLmZvcm1hdChcIllZWVkvTU0vRERcIikpO1xuICAgICAgICAgICAgbGluay5nZXRMaW5rKCkuUm9vdE5vZGVzLnB1c2godHJlZU5vZGUpO1xuICAgICAgICAgICAgLy8gVGVtcGxhdGUgLyBQZXJtaXNzaW9ucyBmcm9tIG5vZGVcbiAgICAgICAgICAgIHZhciBkZWZhdWx0VGVtcGxhdGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgZGVmYXVsdFBlcm1pc3Npb25zID0gW19weWRpb0h0dHBSZXN0QXBpLlJlc3RTaGFyZUxpbmtBY2Nlc3NUeXBlLmNvbnN0cnVjdEZyb21PYmplY3QoJ0Rvd25sb2FkJyldO1xuICAgICAgICAgICAgaWYgKG5vZGUuaXNMZWFmKCkpIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0VGVtcGxhdGUgPSBcInB5ZGlvX3VuaXF1ZV9kbFwiO1xuXG4gICAgICAgICAgICAgICAgdmFyIF9TaGFyZUhlbHBlciRub2RlSGFzRWRpdG9yID0gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5ub2RlSGFzRWRpdG9yKHB5ZGlvLCBub2RlKTtcblxuICAgICAgICAgICAgICAgIHZhciBwcmV2aWV3ID0gX1NoYXJlSGVscGVyJG5vZGVIYXNFZGl0b3IucHJldmlldztcblxuICAgICAgICAgICAgICAgIGlmIChwcmV2aWV3KSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHRUZW1wbGF0ZSA9IFwicHlkaW9fdW5pcXVlX3N0cmlwXCI7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHRQZXJtaXNzaW9ucy5wdXNoKF9weWRpb0h0dHBSZXN0QXBpLlJlc3RTaGFyZUxpbmtBY2Nlc3NUeXBlLmNvbnN0cnVjdEZyb21PYmplY3QoJ1ByZXZpZXcnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0VGVtcGxhdGUgPSBcInB5ZGlvX3NoYXJlZF9mb2xkZXJcIjtcbiAgICAgICAgICAgICAgICBkZWZhdWx0UGVybWlzc2lvbnMucHVzaChfcHlkaW9IdHRwUmVzdEFwaS5SZXN0U2hhcmVMaW5rQWNjZXNzVHlwZS5jb25zdHJ1Y3RGcm9tT2JqZWN0KCdQcmV2aWV3JykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGluay5nZXRMaW5rKCkuVmlld1RlbXBsYXRlTmFtZSA9IGRlZmF1bHRUZW1wbGF0ZTtcbiAgICAgICAgICAgIGxpbmsuZ2V0TGluaygpLlBlcm1pc3Npb25zID0gZGVmYXVsdFBlcm1pc3Npb25zO1xuXG4gICAgICAgICAgICBsaW5rLm9ic2VydmUoXCJ1cGRhdGVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzLm5vdGlmeShcInVwZGF0ZVwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGluay5vYnNlcnZlKFwic2F2ZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMudXBkYXRlVW5kZXJseWluZ05vZGUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGxpbms7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NyZWF0ZUVtcHR5Q2VsbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjcmVhdGVFbXB0eUNlbGwoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGNlbGwgPSBuZXcgX3B5ZGlvTW9kZWxDZWxsMlsnZGVmYXVsdCddKHRydWUpO1xuICAgICAgICAgICAgY2VsbC5zZXRMYWJlbCh0aGlzLm5vZGUuZ2V0TGFiZWwoKSk7XG4gICAgICAgICAgICBjZWxsLmFkZFJvb3ROb2RlKHRoaXMubm9kZSk7XG4gICAgICAgICAgICBjZWxsLm9ic2VydmUoXCJ1cGRhdGVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5ub3RpZnkoXCJ1cGRhdGVcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNlbGwuZGlydHkgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuY2VsbHMucHVzaChjZWxsKTtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5KFwidXBkYXRlXCIpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdhZGRUb0V4aXN0aW5nQ2VsbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRUb0V4aXN0aW5nQ2VsbChjZWxsSWQpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgY2VsbCA9IG5ldyBfcHlkaW9Nb2RlbENlbGwyWydkZWZhdWx0J10odHJ1ZSk7XG4gICAgICAgICAgICBjZWxsLm9ic2VydmUoXCJ1cGRhdGVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzMy5ub3RpZnkoXCJ1cGRhdGVcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNlbGwubG9hZChjZWxsSWQpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNlbGwuYWRkUm9vdE5vZGUoX3RoaXMzLm5vZGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmNlbGxzLnB1c2goY2VsbCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3VwZGF0ZVVuZGVybHlpbmdOb2RlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZVVuZGVybHlpbmdOb2RlKCkge1xuICAgICAgICAgICAgcHlkaW8uZ2V0Q29udGV4dEhvbGRlcigpLnJlcXVpcmVOb2RlUmVsb2FkKHRoaXMubm9kZSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2RlbGV0ZUxpbmsnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZGVsZXRlTGluayhsaW5rTW9kZWwpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczQgPSB0aGlzO1xuXG4gICAgICAgICAgICBsaW5rTW9kZWwuZGVsZXRlTGluayh0aGlzLmVtcHR5TGluayh0aGlzLm5vZGUpLmdldExpbmsoKSkudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgICAgX3RoaXM0LnVwZGF0ZVVuZGVybHlpbmdOb2RlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0Tm9kZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXROb2RlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubm9kZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gbm9kZSB7VHJlZU5vZGV9XG4gICAgICAgICAqIEBwYXJhbSBvYnNlcnZlUmVwbGFjZSBib29sXG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbG9hZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBsb2FkKG5vZGUpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczUgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZVJlcGxhY2UgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICAgICAgdGhpcy5ub2RlID0gbm9kZTtcbiAgICAgICAgICAgIHRoaXMuY2VsbHMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMubGlua3MgPSBbXTtcbiAgICAgICAgICAgIGlmIChub2RlLmdldE1ldGFkYXRhKCkuZ2V0KCdweWRpb19zaGFyZXMnKSkge1xuICAgICAgICAgICAgICAgIHZhciBzaGFyZU1ldGEgPSBKU09OLnBhcnNlKG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ3B5ZGlvX3NoYXJlcycpKTtcbiAgICAgICAgICAgICAgICBzaGFyZU1ldGEubWFwKGZ1bmN0aW9uIChzaGFyZWRXb3Jrc3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNoYXJlZFdvcmtzcGFjZS5TY29wZSA9PT0gMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTGlua1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxpbmtNb2RlbCA9IG5ldyBfbGlua3NMaW5rTW9kZWwyWydkZWZhdWx0J10oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtNb2RlbC5vYnNlcnZlKFwidXBkYXRlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczUubm90aWZ5KFwidXBkYXRlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rTW9kZWwub2JzZXJ2ZShcInNhdmVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzNS51cGRhdGVVbmRlcmx5aW5nTm9kZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rTW9kZWwubG9hZChzaGFyZWRXb3Jrc3BhY2UuVVVJRCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczUubGlua3MucHVzaChsaW5rTW9kZWwpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNoYXJlZFdvcmtzcGFjZS5TY29wZSA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNlbGwgPSBuZXcgX3B5ZGlvTW9kZWxDZWxsMlsnZGVmYXVsdCddKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjZWxsLm9ic2VydmUoXCJ1cGRhdGVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzNS5ub3RpZnkoXCJ1cGRhdGVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbGwubG9hZChzaGFyZWRXb3Jrc3BhY2UuVVVJRCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczUuY2VsbHMucHVzaChjZWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuZWRpdCAmJiAhdGhpcy5saW5rcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxpbmtzLnB1c2godGhpcy5lbXB0eUxpbmsobm9kZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9ic2VydmVSZXBsYWNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlLm9ic2VydmUoJ25vZGVfcmVwbGFjZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzNS5sb2FkKF90aGlzNS5ub2RlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3NhdmUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2F2ZSgpIHtcbiAgICAgICAgICAgIHRoaXMuY2VsbHMubWFwKGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHIuaXNEaXJ0eSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHIuc2F2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5saW5rcy5tYXAoZnVuY3Rpb24gKGwpIHtcbiAgICAgICAgICAgICAgICBpZiAobC5pc0RpcnR5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbC5zYXZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBSZW1vdmUgY2VsbHMgdGhhdCBkb24ndCBoYXZlIHRoaXMgbm9kZSBhbnltb3JlXG4gICAgICAgICAgICB2YXIgbm9kZUlkID0gdGhpcy5ub2RlLmdldE1ldGFkYXRhKCkuZ2V0KCd1dWlkJyk7XG4gICAgICAgICAgICB0aGlzLmNlbGxzID0gdGhpcy5jZWxscy5maWx0ZXIoZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gci5oYXNSb290Tm9kZShub2RlSWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVVuZGVybHlpbmdOb2RlKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2RlbGV0ZUFsbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZWxldGVBbGwoKSB7XG4gICAgICAgICAgICB2YXIgbm9kZVV1aWQgPSB0aGlzLm5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ3V1aWQnKTtcbiAgICAgICAgICAgIHZhciBwID0gW107XG4gICAgICAgICAgICB0aGlzLmNlbGxzLm1hcChmdW5jdGlvbiAocikge1xuICAgICAgICAgICAgICAgIHIucmVtb3ZlUm9vdE5vZGUobm9kZVV1aWQpO1xuICAgICAgICAgICAgICAgIHAucHVzaChyLnNhdmUoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubGlua3MubWFwKGZ1bmN0aW9uIChsKSB7XG4gICAgICAgICAgICAgICAgcC5wdXNoKGwuZGVsZXRlTGluaygpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHApO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW1vdmVOZXdDZWxsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZU5ld0NlbGwoY2VsbCkge1xuICAgICAgICAgICAgdGhpcy5jZWxscyA9IHRoaXMuY2VsbHMuZmlsdGVyKGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHIgIT09IGNlbGw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5KFwidXBkYXRlXCIpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZXZlcnRDaGFuZ2VzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJldmVydENoYW5nZXMoKSB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgZW1wdHkgY2VsbHNcbiAgICAgICAgICAgIHRoaXMuY2VsbHMgPSB0aGlzLmNlbGxzLmZpbHRlcihmdW5jdGlvbiAocikge1xuICAgICAgICAgICAgICAgIHJldHVybiByLmdldFV1aWQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5jZWxscy5tYXAoZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgICAgICBpZiAoci5pc0RpcnR5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgci5yZXZlcnRDaGFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmxpbmtzLm1hcChmdW5jdGlvbiAobCkge1xuICAgICAgICAgICAgICAgIGlmIChsLmlzRGlydHkoKSkge1xuICAgICAgICAgICAgICAgICAgICBsLnJldmVydENoYW5nZXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5KCd1cGRhdGUnKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnaXNEaXJ0eScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBpc0RpcnR5KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2VsbHMuZmlsdGVyKGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHIuaXNEaXJ0eSgpO1xuICAgICAgICAgICAgfSkubGVuZ3RoIHx8IHRoaXMubGlua3MuZmlsdGVyKGZ1bmN0aW9uIChsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGwuaXNEaXJ0eSgpO1xuICAgICAgICAgICAgfSkubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzdG9wT2JzZXJ2aW5nJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHN0b3BPYnNlcnZpbmcoZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgICAgIHRoaXMuY2VsbHMubWFwKGZ1bmN0aW9uIChjZWxsKSB7XG4gICAgICAgICAgICAgICAgY2VsbC5zdG9wT2JzZXJ2aW5nKFwidXBkYXRlXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmxpbmtzLm1hcChmdW5jdGlvbiAobGluaykge1xuICAgICAgICAgICAgICAgIGxpbmsuc3RvcE9ic2VydmluZyhcInVwZGF0ZVwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoQ29tcG9zaXRlTW9kZWwucHJvdG90eXBlKSwgJ3N0b3BPYnNlcnZpbmcnLCB0aGlzKS5jYWxsKHRoaXMsIGV2ZW50LCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldENlbGxzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldENlbGxzKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzNiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm5vZGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3JldCA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBub2RlSWQgPSBfdGhpczYubm9kZS5nZXRNZXRhZGF0YSgpLmdldCgndXVpZCcpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdjogX3RoaXM2LmNlbGxzLmZpbHRlcihmdW5jdGlvbiAocikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByLmhhc1Jvb3ROb2RlKG5vZGVJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIF9yZXQgPT09ICdvYmplY3QnKSByZXR1cm4gX3JldC52O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jZWxscztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0TGlua3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0TGlua3MoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saW5rcztcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBDb21wb3NpdGVNb2RlbDtcbn0pKF9weWRpb0xhbmdPYnNlcnZhYmxlMlsnZGVmYXVsdCddKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ29tcG9zaXRlTW9kZWw7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gyLCBfeDMsIF94NCkgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeDIsIHByb3BlcnR5ID0gX3gzLCByZWNlaXZlciA9IF94NDsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeDIgPSBwYXJlbnQ7IF94MyA9IHByb3BlcnR5OyBfeDQgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHlkaW9IdHRwUmVzb3VyY2VzTWFuYWdlciA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvcmVzb3VyY2VzLW1hbmFnZXInKTtcblxudmFyIF9weWRpb0h0dHBSZXNvdXJjZXNNYW5hZ2VyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cFJlc291cmNlc01hbmFnZXIpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlciA9IHJlcXVpcmUoJy4uL21haW4vU2hhcmVIZWxwZXInKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9weWRpb0h0dHBSZXN0QXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9yZXN0LWFwaScpO1xuXG52YXIgTWFpbGVyID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKE1haWxlciwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBNYWlsZXIocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1haWxlcik7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoTWFpbGVyLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0geyBtYWlsZXJEYXRhOiBudWxsIH07XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKE1haWxlciwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgc3ViamVjdCA9IG5ld1Byb3BzLnN1YmplY3Q7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IG5ld1Byb3BzLm1lc3NhZ2U7XG4gICAgICAgICAgICB2YXIgdXNlcnMgPSBuZXdQcm9wcy51c2VycztcbiAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSBuZXdQcm9wcy5saW5rTW9kZWw7XG4gICAgICAgICAgICB2YXIgdGVtcGxhdGVJZCA9IG5ld1Byb3BzLnRlbXBsYXRlSWQ7XG4gICAgICAgICAgICB2YXIgdGVtcGxhdGVEYXRhID0gbmV3UHJvcHMudGVtcGxhdGVEYXRhO1xuXG4gICAgICAgICAgICBpZiAoc3ViamVjdCB8fCB0ZW1wbGF0ZUlkKSB7XG4gICAgICAgICAgICAgICAgaWYgKF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uZm9yY2VNYWlsZXJPbGRTY2hvb2woKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZW5jU3ViamVjdCA9IGVuY29kZVVSSUNvbXBvbmVudChzdWJqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IFwibWFpbHRvOmN1c3RvbS1lbWFpbEBkb21haW4uY29tP1N1YmplY3Q9XCIgKyBlbmNTdWJqZWN0ICsgXCImQm9keT1cIiArIG1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9jb25zdCBsaW5rRGF0YSA9IGhhc2ggPyB0aGlzLnN0YXRlLm1vZGVsLmdldExpbmtEYXRhKGhhc2gpIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIF9weWRpb0h0dHBSZXNvdXJjZXNNYW5hZ2VyMlsnZGVmYXVsdCddLmxvYWRDbGFzc2VzQW5kQXBwbHkoWydQeWRpb01haWxlciddLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1haWxlckRhdGE6IF9leHRlbmRzKHt9LCBuZXdQcm9wcywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuYWJsZUlkZW50aWZpY2F0aW9uOiBsaW5rTW9kZWwgJiYgbGlua01vZGVsLmdldExpbmsoKS5UYXJnZXRVc2VycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZGVudGlmaWVkT25seTogbGlua01vZGVsICYmIGxpbmtNb2RlbC5nZXRMaW5rKCkuUmVzdHJpY3RUb1RhcmdldFVzZXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyaXBwbGVJZGVudGlmaWNhdGlvbktleXM6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbWFpbGVyRGF0YTogbnVsbCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndG9nZ2xlTWFpbGVyRGF0YScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB0b2dnbGVNYWlsZXJEYXRhKGRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtYWlsZXJEYXRhOiBfZXh0ZW5kcyh7fSwgdGhpcy5zdGF0ZS5tYWlsZXJEYXRhLCBkYXRhKSB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGlzbWlzc01haWxlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBkaXNtaXNzTWFpbGVyKCkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkRpc21pc3MoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbWFpbGVyUHJvY2Vzc1Bvc3QnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbWFpbGVyUHJvY2Vzc1Bvc3QoRW1haWwsIHVzZXJzLCBzdWJqZWN0LCBtZXNzYWdlLCBsaW5rLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIG1haWxlckRhdGEgPSB0aGlzLnN0YXRlLm1haWxlckRhdGE7XG4gICAgICAgICAgICB2YXIgY3JpcHBsZUlkZW50aWZpY2F0aW9uS2V5cyA9IG1haWxlckRhdGEuY3JpcHBsZUlkZW50aWZpY2F0aW9uS2V5cztcbiAgICAgICAgICAgIHZhciBpZGVudGlmaWVkT25seSA9IG1haWxlckRhdGEuaWRlbnRpZmllZE9ubHk7XG4gICAgICAgICAgICB2YXIgbGlua01vZGVsID0gbWFpbGVyRGF0YS5saW5rTW9kZWw7XG5cbiAgICAgICAgICAgIHZhciBsaW5rT2JqZWN0ID0gbGlua01vZGVsLmdldExpbmsoKTtcbiAgICAgICAgICAgIGlmICghbGlua09iamVjdC5UYXJnZXRVc2Vycykge1xuICAgICAgICAgICAgICAgIGxpbmtPYmplY3QuVGFyZ2V0VXNlcnMgPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxpbmtPYmplY3QuUmVzdHJpY3RUb1RhcmdldFVzZXJzID0gaWRlbnRpZmllZE9ubHk7XG5cbiAgICAgICAgICAgIHZhciBzaGFyZU1haWxzID0ge307XG4gICAgICAgICAgICBPYmplY3Qua2V5cyh1c2VycykuZm9yRWFjaChmdW5jdGlvbiAodSkge1xuICAgICAgICAgICAgICAgIHZhciBrID0gY3JpcHBsZUlkZW50aWZpY2F0aW9uS2V5cyA/IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZyg3KSA6IHU7XG4gICAgICAgICAgICAgICAgbGlua09iamVjdC5UYXJnZXRVc2Vyc1trXSA9IF9weWRpb0h0dHBSZXN0QXBpLlJlc3RTaGFyZUxpbmtUYXJnZXRVc2VyLmNvbnN0cnVjdEZyb21PYmplY3QoeyBEaXNwbGF5OiB1c2Vyc1t1XS5nZXRMYWJlbCgpLCBEb3dubG9hZENvdW50OiAwIH0pO1xuICAgICAgICAgICAgICAgIHNoYXJlTWFpbHNba10gPSB1O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsaW5rTW9kZWwudXBkYXRlTGluayhsaW5rT2JqZWN0KTtcbiAgICAgICAgICAgIGxpbmtNb2RlbC5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVtYWlsID0gbmV3IEVtYWlsKCk7XG4gICAgICAgICAgICAgICAgdmFyIG9yaWdpbmFsTGluayA9IGxpbmtNb2RlbC5nZXRQdWJsaWNVcmwoKTtcbiAgICAgICAgICAgICAgICB2YXIgcmVnZXhwID0gbmV3IFJlZ0V4cChvcmlnaW5hbExpbmssICdnJyk7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoc2hhcmVNYWlscykuZm9yRWFjaChmdW5jdGlvbiAodSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TGluayA9IG9yaWdpbmFsTGluayArICc/dT0nICsgdTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld01lc3NhZ2UgPSBtZXNzYWdlLnJlcGxhY2UocmVnZXhwLCBuZXdMaW5rKTtcbiAgICAgICAgICAgICAgICAgICAgZW1haWwuYWRkVGFyZ2V0KHNoYXJlTWFpbHNbdV0sIHN1YmplY3QsIG5ld01lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGVtYWlsLnBvc3QoZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhyZXMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldE1lc3NhZ2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0TWVzc2FnZShrZXkpIHtcbiAgICAgICAgICAgIHZhciBuYW1lc3BhY2UgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAnc2hhcmVfY2VudGVyJyA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2hbbmFtZXNwYWNlICsgKG5hbWVzcGFjZSA/ICcuJyA6ICcnKSArIGtleV07XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUubWFpbGVyRGF0YSkge1xuICAgICAgICAgICAgICAgIHZhciBtYWlsZXJEYXRhID0gdGhpcy5zdGF0ZS5tYWlsZXJEYXRhO1xuXG4gICAgICAgICAgICAgICAgdmFyIGN1c3RvbWl6ZU1lc3NhZ2VQYW5lID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGlmIChtYWlsZXJEYXRhLmxpbmtNb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3R5bGUgPSBtYWlsZXJEYXRhLmVuYWJsZUlkZW50aWZpY2F0aW9uID8geyBwYWRkaW5nOiAnMTBweCAyMHB4JywgYmFja2dyb3VuZENvbG9yOiAnI0VDRUZGMScsIGZvbnRTaXplOiAxNCB9IDogeyBwYWRkaW5nOiAnMTBweCAyMHB4IDAnLCBmb250U2l6ZTogMTQgfTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxldFVzZXJDaG9vc2VDcmlwcGxlID0gdGhpcy5wcm9wcy5weWRpby5nZXRQbHVnaW5Db25maWdzKCdhY3Rpb24uc2hhcmUnKS5nZXQoJ0VNQUlMX1BFUlNPTkFMX0xJTktfU0VORF9DTEVBUicpO1xuICAgICAgICAgICAgICAgICAgICBjdXN0b21pemVNZXNzYWdlUGFuZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBzdHlsZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVG9nZ2xlLCB7IGxhYmVsOiB0aGlzLmdldE1lc3NhZ2UoMjM1KSwgdG9nZ2xlZDogbWFpbGVyRGF0YS5lbmFibGVJZGVudGlmaWNhdGlvbiwgb25Ub2dnbGU6IGZ1bmN0aW9uIChlLCBjKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi50b2dnbGVNYWlsZXJEYXRhKHsgZW5hYmxlSWRlbnRpZmljYXRpb246IGMgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1haWxlckRhdGEuZW5hYmxlSWRlbnRpZmljYXRpb24gJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVG9nZ2xlLCB7IGxhYmVsOiBcIi0tIFwiICsgdGhpcy5nZXRNZXNzYWdlKDIzNiksIHRvZ2dsZWQ6IG1haWxlckRhdGEuaWRlbnRpZmllZE9ubHksIG9uVG9nZ2xlOiBmdW5jdGlvbiAoZSwgYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIudG9nZ2xlTWFpbGVyRGF0YSh7IGlkZW50aWZpZWRPbmx5OiBjIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtYWlsZXJEYXRhLmVuYWJsZUlkZW50aWZpY2F0aW9uICYmIGxldFVzZXJDaG9vc2VDcmlwcGxlICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRvZ2dsZSwgeyBsYWJlbDogXCItLSBcIiArIHRoaXMuZ2V0TWVzc2FnZSgyMzcpLCB0b2dnbGVkOiBtYWlsZXJEYXRhLmNyaXBwbGVJZGVudGlmaWNhdGlvbktleXMsIG9uVG9nZ2xlOiBmdW5jdGlvbiAoZSwgYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIudG9nZ2xlTWFpbGVyRGF0YSh7IGNyaXBwbGVJZGVudGlmaWNhdGlvbktleXM6IGMgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoUHlkaW9NYWlsZXIuUGFuZSwgX2V4dGVuZHMoe30sIG1haWxlckRhdGEsIHtcbiAgICAgICAgICAgICAgICAgICAgb25EaXNtaXNzOiB0aGlzLmRpc21pc3NNYWlsZXIuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmxheTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnc2hhcmUtY2VudGVyLW1haWxlcicsXG4gICAgICAgICAgICAgICAgICAgIHBhbmVsVGl0bGU6IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2hbXCJzaGFyZV9jZW50ZXIuNDVcIl0sXG4gICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxQYW5lVG9wOiBjdXN0b21pemVNZXNzYWdlUGFuZSxcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc1Bvc3Q6IG1haWxlckRhdGEuZW5hYmxlSWRlbnRpZmljYXRpb24gPyB0aGlzLm1haWxlclByb2Nlc3NQb3N0LmJpbmQodGhpcykgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyB3aWR0aDogNDIwLCBtYXJnaW46ICcwIGF1dG8nIH1cbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIE1haWxlcjtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBNYWlsZXI7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9jZWxsc0NyZWF0ZUNlbGxEaWFsb2cgPSByZXF1aXJlKCcuL2NlbGxzL0NyZWF0ZUNlbGxEaWFsb2cnKTtcblxudmFyIF9jZWxsc0NyZWF0ZUNlbGxEaWFsb2cyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY2VsbHNDcmVhdGVDZWxsRGlhbG9nKTtcblxudmFyIF9jZWxsc0VkaXRDZWxsRGlhbG9nID0gcmVxdWlyZSgnLi9jZWxscy9FZGl0Q2VsbERpYWxvZycpO1xuXG52YXIgX2NlbGxzRWRpdENlbGxEaWFsb2cyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY2VsbHNFZGl0Q2VsbERpYWxvZyk7XG5cbnZhciBfY2VsbHNDZWxsQ2FyZCA9IHJlcXVpcmUoJy4vY2VsbHMvQ2VsbENhcmQnKTtcblxudmFyIF9jZWxsc0NlbGxDYXJkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NlbGxzQ2VsbENhcmQpO1xuXG52YXIgX21haW5JbmZvUGFuZWwgPSByZXF1aXJlKCcuL21haW4vSW5mb1BhbmVsJyk7XG5cbnZhciBfbWFpbkluZm9QYW5lbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYWluSW5mb1BhbmVsKTtcblxudmFyIF9jb21wb3NpdGVDb21wb3NpdGVEaWFsb2cgPSByZXF1aXJlKCcuL2NvbXBvc2l0ZS9Db21wb3NpdGVEaWFsb2cnKTtcblxudmFyIF9jb21wb3NpdGVDb21wb3NpdGVEaWFsb2cyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY29tcG9zaXRlQ29tcG9zaXRlRGlhbG9nKTtcblxudmFyIF9saW5rc0xpbmtNb2RlbCA9IHJlcXVpcmUoJy4vbGlua3MvTGlua01vZGVsJyk7XG5cbnZhciBfbGlua3NMaW5rTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbGlua3NMaW5rTW9kZWwpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlciA9IHJlcXVpcmUoJy4vbWFpbi9TaGFyZUhlbHBlcicpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYWluU2hhcmVIZWxwZXIpO1xuXG52YXIgX2xpc3RzU2hhcmVWaWV3ID0gcmVxdWlyZShcIi4vbGlzdHMvU2hhcmVWaWV3XCIpO1xuXG5leHBvcnRzLkNyZWF0ZUNlbGxEaWFsb2cgPSBfY2VsbHNDcmVhdGVDZWxsRGlhbG9nMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5FZGl0Q2VsbERpYWxvZyA9IF9jZWxsc0VkaXRDZWxsRGlhbG9nMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5DZWxsQ2FyZCA9IF9jZWxsc0NlbGxDYXJkMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5JbmZvUGFuZWwgPSBfbWFpbkluZm9QYW5lbDJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuQ29tcG9zaXRlRGlhbG9nID0gX2NvbXBvc2l0ZUNvbXBvc2l0ZURpYWxvZzJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuTGlua01vZGVsID0gX2xpbmtzTGlua01vZGVsMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5TaGFyZUhlbHBlciA9IF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J107XG5leHBvcnRzLlNoYXJlVmlld01vZGFsID0gX2xpc3RzU2hhcmVWaWV3LlNoYXJlVmlld01vZGFsO1xuZXhwb3J0cy5TaGFyZVZpZXcgPSBfbGlzdHNTaGFyZVZpZXcuU2hhcmVWaWV3O1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lciA9IHJlcXVpcmUoJy4uL1NoYXJlQ29udGV4dENvbnN1bWVyJyk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU2hhcmVDb250ZXh0Q29uc3VtZXIpO1xuXG52YXIgX1RhcmdldGVkVXNlcnMgPSByZXF1aXJlKCcuL1RhcmdldGVkVXNlcnMnKTtcblxudmFyIF9UYXJnZXRlZFVzZXJzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1RhcmdldGVkVXNlcnMpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX3FyY29kZVJlYWN0ID0gcmVxdWlyZSgncXJjb2RlLnJlYWN0Jyk7XG5cbnZhciBfcXJjb2RlUmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcXJjb2RlUmVhY3QpO1xuXG52YXIgX2NsaXBib2FyZCA9IHJlcXVpcmUoJ2NsaXBib2FyZCcpO1xuXG52YXIgX2NsaXBib2FyZDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jbGlwYm9hcmQpO1xuXG52YXIgX21haW5BY3Rpb25CdXR0b24gPSByZXF1aXJlKCcuLi9tYWluL0FjdGlvbkJ1dHRvbicpO1xuXG52YXIgX21haW5BY3Rpb25CdXR0b24yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpbkFjdGlvbkJ1dHRvbik7XG5cbnZhciBfcHlkaW9VdGlsUGF0aCA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvcGF0aCcpO1xuXG52YXIgX3B5ZGlvVXRpbFBhdGgyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9VdGlsUGF0aCk7XG5cbnZhciBfcHlkaW9VdGlsTGFuZyA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvbGFuZycpO1xuXG52YXIgX3B5ZGlvVXRpbExhbmcyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9VdGlsTGFuZyk7XG5cbnZhciBfbWF0ZXJpYWxVaVN0eWxlcyA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpL3N0eWxlcycpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlciA9IHJlcXVpcmUoJy4uL21haW4vU2hhcmVIZWxwZXInKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX0xpbmtNb2RlbCA9IHJlcXVpcmUoJy4vTGlua01vZGVsJyk7XG5cbnZhciBfTGlua01vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0xpbmtNb2RlbCk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKFwiYm9vdFwiKTtcblxudmFyIFRvb2x0aXAgPSBfUHlkaW8kcmVxdWlyZUxpYi5Ub29sdGlwO1xuXG52YXIgUHVibGljTGlua0ZpZWxkID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1B1YmxpY0xpbmtGaWVsZCcsXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgbGlua01vZGVsOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoX0xpbmtNb2RlbDJbJ2RlZmF1bHQnXSksXG4gICAgICAgIGVkaXRBbGxvd2VkOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIG9uQ2hhbmdlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIHNob3dNYWlsZXI6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuY1xuICAgIH0sXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7IGVkaXRMaW5rOiBmYWxzZSwgY29weU1lc3NhZ2U6ICcnLCBzaG93UVJDb2RlOiBmYWxzZSB9O1xuICAgIH0sXG4gICAgdG9nZ2xlRWRpdE1vZGU6IGZ1bmN0aW9uIHRvZ2dsZUVkaXRNb2RlKCkge1xuICAgICAgICB2YXIgbGlua01vZGVsID0gdGhpcy5wcm9wcy5saW5rTW9kZWw7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZWRpdExpbmsgJiYgdGhpcy5zdGF0ZS5jdXN0b21MaW5rKSB7XG4gICAgICAgICAgICBsaW5rTW9kZWwuc2V0Q3VzdG9tTGluayh0aGlzLnN0YXRlLmN1c3RvbUxpbmspO1xuICAgICAgICAgICAgbGlua01vZGVsLnNhdmUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZWRpdExpbms6ICF0aGlzLnN0YXRlLmVkaXRMaW5rLCBjdXN0b21MaW5rOiB1bmRlZmluZWQgfSk7XG4gICAgfSxcbiAgICBjaGFuZ2VMaW5rOiBmdW5jdGlvbiBjaGFuZ2VMaW5rKGV2ZW50KSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICAgICAgdmFsdWUgPSBfcHlkaW9VdGlsTGFuZzJbJ2RlZmF1bHQnXS5jb21wdXRlU3RyaW5nU2x1Zyh2YWx1ZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjdXN0b21MaW5rOiB2YWx1ZSB9KTtcbiAgICB9LFxuICAgIGNsZWFyQ29weU1lc3NhZ2U6IGZ1bmN0aW9uIGNsZWFyQ29weU1lc3NhZ2UoKSB7XG4gICAgICAgIGdsb2JhbC5zZXRUaW1lb3V0KChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29weU1lc3NhZ2U6ICcnIH0pO1xuICAgICAgICB9KS5iaW5kKHRoaXMpLCA1MDAwKTtcbiAgICB9LFxuXG4gICAgYXR0YWNoQ2xpcGJvYXJkOiBmdW5jdGlvbiBhdHRhY2hDbGlwYm9hcmQoKSB7XG4gICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgbGlua01vZGVsID0gX3Byb3BzLmxpbmtNb2RlbDtcbiAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuXG4gICAgICAgIHRoaXMuZGV0YWNoQ2xpcGJvYXJkKCk7XG4gICAgICAgIGlmICh0aGlzLnJlZnNbJ2NvcHktYnV0dG9uJ10pIHtcbiAgICAgICAgICAgIHRoaXMuX2NsaXAgPSBuZXcgX2NsaXBib2FyZDJbJ2RlZmF1bHQnXSh0aGlzLnJlZnNbJ2NvcHktYnV0dG9uJ10sIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiAoZnVuY3Rpb24gKHRyaWdnZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uYnVpbGRQdWJsaWNVcmwocHlkaW8sIGxpbmtNb2RlbC5nZXRMaW5rKCkuTGlua0hhc2gpO1xuICAgICAgICAgICAgICAgIH0pLmJpbmQodGhpcylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5fY2xpcC5vbignc3VjY2VzcycsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvcHlNZXNzYWdlOiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE5MicpIH0sIHRoaXMuY2xlYXJDb3B5TWVzc2FnZSk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMuX2NsaXAub24oJ2Vycm9yJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29weU1lc3NhZ2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKGdsb2JhbC5uYXZpZ2F0b3IucGxhdGZvcm0uaW5kZXhPZihcIk1hY1wiKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb3B5TWVzc2FnZSA9IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTQ0Jyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29weU1lc3NhZ2UgPSB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE0MycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnJlZnNbJ3B1YmxpYy1saW5rLWZpZWxkJ10uZm9jdXMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29weU1lc3NhZ2U6IGNvcHlNZXNzYWdlIH0sIHRoaXMuY2xlYXJDb3B5TWVzc2FnZSk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZGV0YWNoQ2xpcGJvYXJkOiBmdW5jdGlvbiBkZXRhY2hDbGlwYm9hcmQoKSB7XG4gICAgICAgIGlmICh0aGlzLl9jbGlwKSB7XG4gICAgICAgICAgICB0aGlzLl9jbGlwLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHMsIHByZXZTdGF0ZSkge1xuICAgICAgICB0aGlzLmF0dGFjaENsaXBib2FyZCgpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuYXR0YWNoQ2xpcGJvYXJkKCk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy5kZXRhY2hDbGlwYm9hcmQoKTtcbiAgICB9LFxuXG4gICAgb3Blbk1haWxlcjogZnVuY3Rpb24gb3Blbk1haWxlcigpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5zaG93TWFpbGVyKHRoaXMucHJvcHMubGlua01vZGVsKTtcbiAgICB9LFxuXG4gICAgdG9nZ2xlUVJDb2RlOiBmdW5jdGlvbiB0b2dnbGVRUkNvZGUoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzaG93UVJDb2RlOiAhdGhpcy5zdGF0ZS5zaG93UVJDb2RlIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBsaW5rTW9kZWwgPSBfcHJvcHMyLmxpbmtNb2RlbDtcbiAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzMi5weWRpbztcblxuICAgICAgICB2YXIgcHVibGljTGluayA9IF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uYnVpbGRQdWJsaWNVcmwocHlkaW8sIGxpbmtNb2RlbC5nZXRMaW5rKCkuTGlua0hhc2gpO1xuICAgICAgICB2YXIgZWRpdEFsbG93ZWQgPSB0aGlzLnByb3BzLmVkaXRBbGxvd2VkICYmICF0aGlzLnByb3BzLmlzUmVhZG9ubHkoKSAmJiBsaW5rTW9kZWwuaXNFZGl0YWJsZSgpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lZGl0TGluayAmJiBlZGl0QWxsb3dlZCkge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGJhY2tncm91bmRDb2xvcjogJyNmNWY1ZjUnLCBwYWRkaW5nOiAnMCA2cHgnLCBtYXJnaW46ICcwIC02cHgnLCBib3JkZXJSYWRpdXM6IDIgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZm9udFNpemU6IDE2LCBjb2xvcjogJ3JnYmEoMCwwLDAsMC40KScsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBtYXhXaWR0aDogMTYwLCB3aGl0ZVNwYWNlOiAnbm93cmFwJywgb3ZlcmZsb3c6ICdoaWRkZW4nLCB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3B5ZGlvVXRpbFBhdGgyWydkZWZhdWx0J10uZ2V0RGlybmFtZShwdWJsaWNMaW5rKSArICcvICdcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7IHN0eWxlOiB7IGZsZXg6IDEsIG1hcmdpblJpZ2h0OiAxMCwgbWFyZ2luTGVmdDogMTAgfSwgb25DaGFuZ2U6IHRoaXMuY2hhbmdlTGluaywgdmFsdWU6IHRoaXMuc3RhdGUuY3VzdG9tTGluayAhPT0gdW5kZWZpbmVkID8gdGhpcy5zdGF0ZS5jdXN0b21MaW5rIDogbGlua01vZGVsLmdldExpbmsoKS5MaW5rSGFzaCB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21haW5BY3Rpb25CdXR0b24yWydkZWZhdWx0J10sIHsgbWRpSWNvbjogJ2NoZWNrJywgY2FsbGJhY2s6IHRoaXMudG9nZ2xlRWRpdE1vZGUgfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB0ZXh0QWxpZ246ICdjZW50ZXInLCBmb250U2l6ZTogMTMsIGNvbG9yOiAncmdiYSgwLDAsMCwwLjQzKScsIHBhZGRpbmdUb3A6IDE2IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcxOTQnKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIHZhciBjb3B5TWVzc2FnZSA9IF9zdGF0ZS5jb3B5TWVzc2FnZTtcbiAgICAgICAgICAgIHZhciBsaW5rVG9vbHRpcCA9IF9zdGF0ZS5saW5rVG9vbHRpcDtcblxuICAgICAgICAgICAgdmFyIHNldEh0bWwgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IF9faHRtbDogdGhpcy5zdGF0ZS5jb3B5TWVzc2FnZSB9O1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIHZhciBhY3Rpb25MaW5rcyA9IFtdLFxuICAgICAgICAgICAgICAgIHFyQ29kZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHZhciBtdWlUaGVtZSA9IHRoaXMucHJvcHMubXVpVGhlbWU7XG5cbiAgICAgICAgICAgIGFjdGlvbkxpbmtzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBrZXk6IFwiY29weVwiLFxuICAgICAgICAgICAgICAgICAgICByZWY6ICdjb3B5LWJ1dHRvbicsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IHBvc2l0aW9uOiAncmVsYXRpdmUnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgd2lkdGg6IDM2LCBoZWlnaHQ6IDM2LCBwYWRkaW5nOiAnOHB4IDEwcHgnLCBtYXJnaW46ICcwIDZweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBib3JkZXI6ICcxcHggc29saWQgJyArIG11aVRoZW1lLnBhbGV0dGUucHJpbWFyeTFDb2xvciB9LFxuICAgICAgICAgICAgICAgICAgICBvbk1vdXNlT3ZlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBsaW5rVG9vbHRpcDogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgb25Nb3VzZU91dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBsaW5rVG9vbHRpcDogZmFsc2UgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFRvb2x0aXAsIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGNvcHlNZXNzYWdlID8gY29weU1lc3NhZ2UgOiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE5MScpLFxuICAgICAgICAgICAgICAgICAgICBob3Jpem9udGFsUG9zaXRpb246IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsUG9zaXRpb246IFwiYm90dG9tXCIsXG4gICAgICAgICAgICAgICAgICAgIHNob3c6IGxpbmtUb29sdGlwXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ2NvcHktbGluay1idXR0b24gbWRpIG1kaS1jb250ZW50LWNvcHknLCBzdHlsZTogeyBjb2xvcjogbXVpVGhlbWUucGFsZXR0ZS5wcmltYXJ5MUNvbG9yIH0gfSlcbiAgICAgICAgICAgICkpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5zaG93TWFpbGVyKSB7XG4gICAgICAgICAgICAgICAgYWN0aW9uTGlua3MucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWFpbkFjdGlvbkJ1dHRvbjJbJ2RlZmF1bHQnXSwgeyBrZXk6ICdvdXRsaW5lJywgY2FsbGJhY2s6IHRoaXMub3Blbk1haWxlciwgbWRpSWNvbjogJ2VtYWlsLW91dGxpbmUnLCBtZXNzYWdlSWQ6ICc0NScgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVkaXRBbGxvd2VkKSB7XG4gICAgICAgICAgICAgICAgYWN0aW9uTGlua3MucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWFpbkFjdGlvbkJ1dHRvbjJbJ2RlZmF1bHQnXSwgeyBrZXk6ICdwZW5jaWwnLCBjYWxsYmFjazogdGhpcy50b2dnbGVFZGl0TW9kZSwgbWRpSWNvbjogJ3BlbmNpbCcsIG1lc3NhZ2VJZDogXCIxOTNcIiB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5xcmNvZGVFbmFibGVkKCkpIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25MaW5rcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYWluQWN0aW9uQnV0dG9uMlsnZGVmYXVsdCddLCB7IGtleTogJ3FyY29kZScsIGNhbGxiYWNrOiB0aGlzLnRvZ2dsZVFSQ29kZSwgbWRpSWNvbjogJ3FyY29kZScsIG1lc3NhZ2VJZDogJzk0JyB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYWN0aW9uTGlua3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgYWN0aW9uTGlua3MgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBtYXJnaW46ICcyMHB4IDAgMTBweCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgc3R5bGU6IHsgZmxleDogMSB9IH0pLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb25MaW5rcyxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IHN0eWxlOiB7IGZsZXg6IDEgfSB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFjdGlvbkxpbmtzID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnNob3dRUkNvZGUpIHtcbiAgICAgICAgICAgICAgICBxckNvZGUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUGFwZXIsXG4gICAgICAgICAgICAgICAgICAgIHsgekRlcHRoOiAxLCBzdHlsZTogeyB3aWR0aDogMTIwLCBwYWRkaW5nVG9wOiAxMCwgb3ZlcmZsb3c6ICdoaWRkZW4nLCBtYXJnaW46ICcwIGF1dG8nLCBoZWlnaHQ6IDEyMCwgdGV4dEFsaWduOiAnY2VudGVyJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9xcmNvZGVSZWFjdDJbJ2RlZmF1bHQnXSwgeyBzaXplOiAxMDAsIHZhbHVlOiBwdWJsaWNMaW5rLCBsZXZlbDogJ1EnIH0pXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcXJDb2RlID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuUGFwZXIsIHsgekRlcHRoOiAwLCBzdHlsZTogeyB3aWR0aDogMTIwLCBvdmVyZmxvdzogJ2hpZGRlbicsIG1hcmdpbjogJzAgYXV0bycsIGhlaWdodDogMCwgdGV4dEFsaWduOiAnY2VudGVyJyB9IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBhcGVyLFxuICAgICAgICAgICAgICAgIHsgekRlcHRoOiAwLCByb3VuZGVkOiBmYWxzZSwgY2xhc3NOYW1lOiAncHVibGljLWxpbmstY29udGFpbmVyJyB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnTGluaycsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWY6ICdwdWJsaWMtbGluay1maWVsZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcHVibGljTGluayxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRm9jdXM6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS50YXJnZXQuc2VsZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRTdHlsZTogeyB0ZXh0QWxpZ246ICdjZW50ZXInLCBiYWNrZ3JvdW5kQ29sb3I6ICcjZjVmNWY1JywgYm9yZGVyUmFkaXVzOiAyLCBwYWRkaW5nOiAnMCA1cHgnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB1bmRlcmxpbmVTdHlsZTogeyBib3JkZXJDb2xvcjogJyNmNWY1ZjUnLCB0ZXh0RGVjb3JhdGlvbjogbGlua01vZGVsLmlzRXhwaXJlZCgpID8gJ2xpbmUtdGhyb3VnaCcgOiBudWxsIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB1bmRlcmxpbmVGb2N1c1N0eWxlOiB7IGJvdHRvbTogMCB9XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBmYWxzZSAmJiB0aGlzLnByb3BzLmxpbmtEYXRhLnRhcmdldF91c2VycyAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfVGFyZ2V0ZWRVc2VyczJbJ2RlZmF1bHQnXSwgdGhpcy5wcm9wcyksXG4gICAgICAgICAgICAgICAgYWN0aW9uTGlua3MsXG4gICAgICAgICAgICAgICAgcXJDb2RlXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFB1YmxpY0xpbmtGaWVsZCA9ICgwLCBfbWF0ZXJpYWxVaVN0eWxlcy5tdWlUaGVtZWFibGUpKCkoUHVibGljTGlua0ZpZWxkKTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFB1YmxpY0xpbmtGaWVsZCA9ICgwLCBfU2hhcmVDb250ZXh0Q29uc3VtZXIyWydkZWZhdWx0J10pKFB1YmxpY0xpbmtGaWVsZCk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBQdWJsaWNMaW5rRmllbGQ7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9MaW5rTW9kZWwgPSByZXF1aXJlKCcuL0xpbmtNb2RlbCcpO1xuXG52YXIgX0xpbmtNb2RlbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9MaW5rTW9kZWwpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgTGFiZWxQYW5lbCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhMYWJlbFBhbmVsLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIExhYmVsUGFuZWwoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBMYWJlbFBhbmVsKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihMYWJlbFBhbmVsLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKExhYmVsUGFuZWwsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcbiAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSBfcHJvcHMubGlua01vZGVsO1xuXG4gICAgICAgICAgICB2YXIgbSA9IGZ1bmN0aW9uIG0oaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci4nICsgaWRdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciBsaW5rID0gbGlua01vZGVsLmdldExpbmsoKTtcbiAgICAgICAgICAgIHZhciB1cGRhdGVMYWJlbCA9IGZ1bmN0aW9uIHVwZGF0ZUxhYmVsKGUsIHYpIHtcbiAgICAgICAgICAgICAgICBsaW5rLkxhYmVsID0gdjtcbiAgICAgICAgICAgICAgICBsaW5rTW9kZWwudXBkYXRlTGluayhsaW5rKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciB1cGRhdGVEZXNjcmlwdGlvbiA9IGZ1bmN0aW9uIHVwZGF0ZURlc2NyaXB0aW9uKGUsIHYpIHtcbiAgICAgICAgICAgICAgICBsaW5rLkRlc2NyaXB0aW9uID0gdjtcbiAgICAgICAgICAgICAgICBsaW5rTW9kZWwudXBkYXRlTGluayhsaW5rKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRleHRGaWVsZCwgeyBzdHlsZTogeyBtYXJnaW5Ub3A6IC0xNCB9LCBmbG9hdGluZ0xhYmVsVGV4dDogbSgyNjUpLCB2YWx1ZTogbGluay5MYWJlbCwgb25DaGFuZ2U6IHVwZGF0ZUxhYmVsLCBmdWxsV2lkdGg6IHRydWUgfSksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7IHN0eWxlOiB7IG1hcmdpblRvcDogLTE0IH0sIGZsb2F0aW5nTGFiZWxUZXh0OiBtKDI2NiksIHZhbHVlOiBsaW5rLkRlc2NyaXB0aW9uLCBvbkNoYW5nZTogdXBkYXRlRGVzY3JpcHRpb24sIGZ1bGxXaWR0aDogdHJ1ZSB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBMYWJlbFBhbmVsO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbkxhYmVsUGFuZWwuUHJvcFR5cGVzID0ge1xuXG4gICAgcHlkaW86IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuaW5zdGFuY2VPZihfcHlkaW8yWydkZWZhdWx0J10pLFxuICAgIGxpbmtNb2RlbDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKF9MaW5rTW9kZWwyWydkZWZhdWx0J10pXG5cbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IExhYmVsUGFuZWw7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcHlkaW9IdHRwQXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9weWRpb0h0dHBBcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwQXBpKTtcblxudmFyIF9weWRpb0xhbmdPYnNlcnZhYmxlID0gcmVxdWlyZSgncHlkaW8vbGFuZy9vYnNlcnZhYmxlJyk7XG5cbnZhciBfcHlkaW9MYW5nT2JzZXJ2YWJsZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb0xhbmdPYnNlcnZhYmxlKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIgPSByZXF1aXJlKCcuLi9tYWluL1NoYXJlSGVscGVyJyk7XG5cbnZhciBfbWFpblNoYXJlSGVscGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21haW5TaGFyZUhlbHBlcik7XG5cbnZhciBfcHlkaW9IdHRwUmVzdEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvcmVzdC1hcGknKTtcblxudmFyIF9weWRpb1V0aWxQYXNzID0gcmVxdWlyZSgncHlkaW8vdXRpbC9wYXNzJyk7XG5cbnZhciBfcHlkaW9VdGlsUGFzczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb1V0aWxQYXNzKTtcblxudmFyIExpbmtNb2RlbCA9IChmdW5jdGlvbiAoX09ic2VydmFibGUpIHtcbiAgICBfaW5oZXJpdHMoTGlua01vZGVsLCBfT2JzZXJ2YWJsZSk7XG5cbiAgICBmdW5jdGlvbiBMaW5rTW9kZWwoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBMaW5rTW9kZWwpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKExpbmtNb2RlbC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMpO1xuICAgICAgICB0aGlzLmxpbmsgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuUmVzdFNoYXJlTGluaygpO1xuICAgICAgICB0aGlzLmxpbmsuUGVybWlzc2lvbnMgPSBbX3B5ZGlvSHR0cFJlc3RBcGkuUmVzdFNoYXJlTGlua0FjY2Vzc1R5cGUuY29uc3RydWN0RnJvbU9iamVjdChcIlByZXZpZXdcIiksIF9weWRpb0h0dHBSZXN0QXBpLlJlc3RTaGFyZUxpbmtBY2Nlc3NUeXBlLmNvbnN0cnVjdEZyb21PYmplY3QoXCJEb3dubG9hZFwiKV07XG4gICAgICAgIHRoaXMubGluay5Qb2xpY2llcyA9IFtdO1xuICAgICAgICB0aGlzLmxpbmsuUG9saWNpZXNDb250ZXh0RWRpdGFibGUgPSB0cnVlO1xuICAgICAgICB0aGlzLmxpbmsuUm9vdE5vZGVzID0gW107XG4gICAgICAgIHRoaXMuVmFsaWRQYXNzd29yZCA9IHRydWU7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKExpbmtNb2RlbCwgW3tcbiAgICAgICAga2V5OiAnaXNFZGl0YWJsZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBpc0VkaXRhYmxlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGluay5Qb2xpY2llc0NvbnRleHRFZGl0YWJsZTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnaXNEaXJ0eScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBpc0RpcnR5KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGlydHk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldExpbmtVdWlkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldExpbmtVdWlkKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGluay5VdWlkO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZXR1cm4ge1Jlc3RTaGFyZUxpbmt9XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0TGluaycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRMaW5rKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGluaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0UHVibGljVXJsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldFB1YmxpY1VybCgpIHtcbiAgICAgICAgICAgIHJldHVybiBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLmJ1aWxkUHVibGljVXJsKHB5ZGlvLCB0aGlzLmxpbmsuTGlua0hhc2gpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSBsaW5rIHtSZXN0U2hhcmVMaW5rfVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3VwZGF0ZUxpbmsnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlTGluayhsaW5rKSB7XG4gICAgICAgICAgICB0aGlzLmxpbmsgPSBsaW5rO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnlEaXJ0eSgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdub3RpZnlEaXJ0eScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBub3RpZnlEaXJ0eSgpIHtcbiAgICAgICAgICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ3VwZGF0ZScpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZXZlcnRDaGFuZ2VzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJldmVydENoYW5nZXMoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vcmlnaW5hbExpbmspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxpbmsgPSB0aGlzLmNsb25lKHRoaXMub3JpZ2luYWxMaW5rKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQYXNzd29yZCA9IHRoaXMuY3JlYXRlUGFzc3dvcmQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuVmFsaWRQYXNzd29yZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdoYXNQZXJtaXNzaW9uJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGhhc1Blcm1pc3Npb24ocGVybWlzc2lvblZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saW5rLlBlcm1pc3Npb25zLmZpbHRlcihmdW5jdGlvbiAocGVybSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwZXJtID09PSBwZXJtaXNzaW9uVmFsdWU7XG4gICAgICAgICAgICB9KS5sZW5ndGggPiAwO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdpc0V4cGlyZWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gaXNFeHBpcmVkKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubGluay5NYXhEb3dubG9hZHMgJiYgcGFyc2VJbnQodGhpcy5saW5rLkN1cnJlbnREb3dubG9hZHMpID49IHBhcnNlSW50KHRoaXMubGluay5NYXhEb3dubG9hZHMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5saW5rLkFjY2Vzc0VuZCkge1xuICAgICAgICAgICAgICAgIC8vIFRPRE9cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gdXVpZCBzdHJpbmdcbiAgICAgICAgICogQHJldHVybiB7UHJvbWlzZS48UmVzdFNoYXJlTGluaz59XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbG9hZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBsb2FkKHV1aWQpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuU2hhcmVTZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgICAgIHJldHVybiBhcGkuZ2V0U2hhcmVMaW5rKHV1aWQpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIF90aGlzLmxpbmsgPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5saW5rLlBlcm1pc3Npb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmxpbmsuUGVybWlzc2lvbnMgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5saW5rLlBvbGljaWVzKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmxpbmsuUG9saWNpZXMgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5saW5rLlJvb3ROb2Rlcykge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5saW5rLlJvb3ROb2RlcyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfdGhpcy5vcmlnaW5hbExpbmsgPSBfdGhpcy5jbG9uZShfdGhpcy5saW5rKTtcbiAgICAgICAgICAgICAgICBfdGhpcy5ub3RpZnkoXCJ1cGRhdGVcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc2V0Q3JlYXRlUGFzc3dvcmQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2V0Q3JlYXRlUGFzc3dvcmQocGFzc3dvcmQpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAocGFzc3dvcmQpIHtcbiAgICAgICAgICAgICAgICBfcHlkaW9VdGlsUGFzczJbJ2RlZmF1bHQnXS5jaGVja1Bhc3N3b3JkU3RyZW5ndGgocGFzc3dvcmQsIGZ1bmN0aW9uIChvaywgbXNnKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5WYWxpZFBhc3N3b3JkID0gb2s7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5WYWxpZFBhc3N3b3JkTWVzc2FnZSA9IG1zZztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5WYWxpZFBhc3N3b3JkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUGFzc3dvcmQgPSBwYXNzd29yZDtcbiAgICAgICAgICAgIHRoaXMubGluay5QYXNzd29yZFJlcXVpcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5RGlydHkoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc2V0VXBkYXRlUGFzc3dvcmQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2V0VXBkYXRlUGFzc3dvcmQocGFzc3dvcmQpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAocGFzc3dvcmQpIHtcbiAgICAgICAgICAgICAgICBfcHlkaW9VdGlsUGFzczJbJ2RlZmF1bHQnXS5jaGVja1Bhc3N3b3JkU3RyZW5ndGgocGFzc3dvcmQsIGZ1bmN0aW9uIChvaywgbXNnKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMy5WYWxpZFBhc3N3b3JkID0gb2s7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMy5WYWxpZFBhc3N3b3JkTWVzc2FnZSA9IG1zZztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5WYWxpZFBhc3N3b3JkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudXBkYXRlUGFzc3dvcmQgPSBwYXNzd29yZDtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5RGlydHkoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc2V0Q3VzdG9tTGluaycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRDdXN0b21MaW5rKG5ld0xpbmspIHtcbiAgICAgICAgICAgIHRoaXMuY3VzdG9tTGluayA9IG5ld0xpbms7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHJldHVybiB7KnxQcm9taXNlLjxSZXN0U2hhcmVMaW5rPn1cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzYXZlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNhdmUoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKCF0aGlzLlZhbGlkUGFzc3dvcmQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGhpcy5WYWxpZFBhc3N3b3JkTWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLlNoYXJlU2VydmljZUFwaShfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgICAgICB2YXIgcmVxdWVzdCA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5SZXN0UHV0U2hhcmVMaW5rUmVxdWVzdCgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuY3JlYXRlUGFzc3dvcmQpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0LlBhc3N3b3JkRW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5DcmVhdGVQYXNzd29yZCA9IHRoaXMuY3JlYXRlUGFzc3dvcmQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMudXBkYXRlUGFzc3dvcmQpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0LlBhc3N3b3JkRW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmxpbmsuUGFzc3dvcmRSZXF1aXJlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0LkNyZWF0ZVBhc3N3b3JkID0gdGhpcy51cGRhdGVQYXNzd29yZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0LlVwZGF0ZVBhc3N3b3JkID0gdGhpcy51cGRhdGVQYXNzd29yZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QuUGFzc3dvcmRFbmFibGVkID0gdGhpcy5saW5rLlBhc3N3b3JkUmVxdWlyZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5nZXRBdXRob3JpemF0aW9ucyhweWRpbykucGFzc3dvcmRfbWFuZGF0b3J5ICYmICFyZXF1ZXN0LlBhc3N3b3JkRW5hYmxlZCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignWW91IGNhbm5vdCBkaXNhYmxlIHBhc3Nvd3JkIG9uIHRoaXMgbGluaycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuY3VzdG9tTGluayAmJiB0aGlzLmN1c3RvbUxpbmsgIT09IHRoaXMubGluay5MaW5rSGFzaCkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QuVXBkYXRlQ3VzdG9tSGFzaCA9IHRoaXMuY3VzdG9tTGluaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcXVlc3QuU2hhcmVMaW5rID0gdGhpcy5saW5rO1xuICAgICAgICAgICAgcmV0dXJuIGFwaS5wdXRTaGFyZUxpbmsocmVxdWVzdCkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgX3RoaXM0LmxpbmsgPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgX3RoaXM0LmRpcnR5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgX3RoaXM0Lm9yaWdpbmFsTGluayA9IF90aGlzNC5jbG9uZShfdGhpczQubGluayk7XG4gICAgICAgICAgICAgICAgX3RoaXM0LnVwZGF0ZVBhc3N3b3JkID0gX3RoaXM0LmNyZWF0ZVBhc3N3b3JkID0gX3RoaXM0LmN1c3RvbUxpbmsgPSBudWxsO1xuICAgICAgICAgICAgICAgIF90aGlzNC5WYWxpZFBhc3N3b3JkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBfdGhpczQubm90aWZ5KCd1cGRhdGUnKTtcbiAgICAgICAgICAgICAgICBfdGhpczQubm90aWZ5KCdzYXZlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcmV0dXJuIHsqfFByb21pc2UuPFJlc3RTaGFyZUxpbms+fVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2RlbGV0ZUxpbmsnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZGVsZXRlTGluayhlbXB0eUxpbmspIHtcbiAgICAgICAgICAgIHZhciBfdGhpczUgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLlNoYXJlU2VydmljZUFwaShfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgICAgICByZXR1cm4gYXBpLmRlbGV0ZVNoYXJlTGluayh0aGlzLmxpbmsuVXVpZCkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgX3RoaXM1LmxpbmsgPSBlbXB0eUxpbms7XG4gICAgICAgICAgICAgICAgX3RoaXM1LmRpcnR5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgX3RoaXM1LnVwZGF0ZVBhc3N3b3JkID0gX3RoaXM1LmNyZWF0ZVBhc3N3b3JkID0gX3RoaXM1LmN1c3RvbUxpbmsgPSBudWxsO1xuICAgICAgICAgICAgICAgIF90aGlzNS5ub3RpZnkoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIGxpbmsge1Jlc3RTaGFyZUxpbmt9XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY2xvbmUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY2xvbmUobGluaykge1xuICAgICAgICAgICAgcmV0dXJuIF9weWRpb0h0dHBSZXN0QXBpLlJlc3RTaGFyZUxpbmsuY29uc3RydWN0RnJvbU9iamVjdChKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGxpbmspKSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gTGlua01vZGVsO1xufSkoX3B5ZGlvTGFuZ09ic2VydmFibGUyWydkZWZhdWx0J10pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBMaW5rTW9kZWw7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIgPSByZXF1aXJlKCcuLi9TaGFyZUNvbnRleHRDb25zdW1lcicpO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1NoYXJlQ29udGV4dENvbnN1bWVyKTtcblxudmFyIF9GaWVsZCA9IHJlcXVpcmUoJy4vRmllbGQnKTtcblxudmFyIF9GaWVsZDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9GaWVsZCk7XG5cbnZhciBfUGVybWlzc2lvbnMgPSByZXF1aXJlKCcuL1Blcm1pc3Npb25zJyk7XG5cbnZhciBfUGVybWlzc2lvbnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfUGVybWlzc2lvbnMpO1xuXG52YXIgX1RhcmdldGVkVXNlcnMgPSByZXF1aXJlKCcuL1RhcmdldGVkVXNlcnMnKTtcblxudmFyIF9UYXJnZXRlZFVzZXJzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1RhcmdldGVkVXNlcnMpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX0xpbmtNb2RlbCA9IHJlcXVpcmUoJy4vTGlua01vZGVsJyk7XG5cbnZhciBfTGlua01vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0xpbmtNb2RlbCk7XG5cbnZhciBfY29tcG9zaXRlQ29tcG9zaXRlTW9kZWwgPSByZXF1aXJlKCcuLi9jb21wb3NpdGUvQ29tcG9zaXRlTW9kZWwnKTtcblxudmFyIF9jb21wb3NpdGVDb21wb3NpdGVNb2RlbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jb21wb3NpdGVDb21wb3NpdGVNb2RlbCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIgPSByZXF1aXJlKCcuLi9tYWluL1NoYXJlSGVscGVyJyk7XG5cbnZhciBfbWFpblNoYXJlSGVscGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21haW5TaGFyZUhlbHBlcik7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdmb3JtJyk7XG5cbnZhciBWYWxpZFBhc3N3b3JkID0gX1B5ZGlvJHJlcXVpcmVMaWIuVmFsaWRQYXNzd29yZDtcblxudmFyIFB1YmxpY0xpbmtQYW5lbCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdQdWJsaWNMaW5rUGFuZWwnLFxuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIGxpbmtNb2RlbDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKF9MaW5rTW9kZWwyWydkZWZhdWx0J10pLFxuICAgICAgICBjb21wb3NpdGVNb2RlbDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKF9jb21wb3NpdGVDb21wb3NpdGVNb2RlbDJbJ2RlZmF1bHQnXSksXG4gICAgICAgIHB5ZGlvOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoX3B5ZGlvMlsnZGVmYXVsdCddKSxcbiAgICAgICAgYXV0aG9yaXphdGlvbnM6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0LFxuICAgICAgICBzaG93TWFpbGVyOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmNcbiAgICB9LFxuXG4gICAgdG9nZ2xlTGluazogZnVuY3Rpb24gdG9nZ2xlTGluaygpIHtcbiAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBsaW5rTW9kZWwgPSBfcHJvcHMubGlua01vZGVsO1xuICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMucHlkaW87XG4gICAgICAgIHZhciBzaG93VGVtcG9yYXJ5UGFzc3dvcmQgPSB0aGlzLnN0YXRlLnNob3dUZW1wb3JhcnlQYXNzd29yZDtcblxuICAgICAgICBpZiAoc2hvd1RlbXBvcmFyeVBhc3N3b3JkKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2hvd1RlbXBvcmFyeVBhc3N3b3JkOiBmYWxzZSwgdGVtcG9yYXJ5UGFzc3dvcmQ6IG51bGwgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIWxpbmtNb2RlbC5nZXRMaW5rVXVpZCgpICYmIF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uZ2V0QXV0aG9yaXphdGlvbnMocHlkaW8pLnBhc3N3b3JkX21hbmRhdG9yeSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNob3dUZW1wb3JhcnlQYXNzd29yZDogdHJ1ZSwgdGVtcG9yYXJ5UGFzc3dvcmQ6ICcnIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGxpbmtNb2RlbC5nZXRMaW5rVXVpZCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5jb21wb3NpdGVNb2RlbC5kZWxldGVMaW5rKGxpbmtNb2RlbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxpbmtNb2RlbC5zYXZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7IHNob3dUZW1wb3JhcnlQYXNzd29yZDogZmFsc2UsIHRlbXBvcmFyeVBhc3N3b3JkOiBudWxsLCBkaXNhYmxlZDogZmFsc2UgfTtcbiAgICB9LFxuXG4gICAgdXBkYXRlVGVtcG9yYXJ5UGFzc3dvcmQ6IGZ1bmN0aW9uIHVwZGF0ZVRlbXBvcmFyeVBhc3N3b3JkKHZhbHVlLCBldmVudCkge1xuICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFsdWUgPSBldmVudC5jdXJyZW50VGFyZ2V0LmdldFZhbHVlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHRlbXBvcmFyeVBhc3N3b3JkOiB2YWx1ZSB9KTtcbiAgICB9LFxuXG4gICAgZW5hYmxlTGlua1dpdGhQYXNzd29yZDogZnVuY3Rpb24gZW5hYmxlTGlua1dpdGhQYXNzd29yZCgpIHtcbiAgICAgICAgdmFyIGxpbmtNb2RlbCA9IHRoaXMucHJvcHMubGlua01vZGVsO1xuXG4gICAgICAgIGlmICghdGhpcy5yZWZzWyd2YWxpZC1wYXNzJ10uaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLnB5ZGlvLlVJLmRpc3BsYXlNZXNzYWdlKCdFUlJPUicsICdJbnZhbGlkIFBhc3N3b3JkJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGlua01vZGVsLnNldENyZWF0ZVBhc3N3b3JkKHRoaXMuc3RhdGUudGVtcG9yYXJ5UGFzc3dvcmQpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGlua01vZGVsLnNhdmUoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5weWRpby5VSS5kaXNwbGF5TWVzc2FnZSgnRVJST1InLCBlLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzaG93VGVtcG9yYXJ5UGFzc3dvcmQ6IGZhbHNlLCB0ZW1wb3JhcnlQYXNzd29yZDogbnVsbCB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIGxpbmtNb2RlbCA9IF9wcm9wczIubGlua01vZGVsO1xuICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMyLnB5ZGlvO1xuICAgICAgICB2YXIgY29tcG9zaXRlTW9kZWwgPSBfcHJvcHMyLmNvbXBvc2l0ZU1vZGVsO1xuXG4gICAgICAgIHZhciBwdWJsaWNMaW5rUGFuZXMgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICBwdWJsaWNMaW5rRmllbGQgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChsaW5rTW9kZWwuZ2V0TGlua1V1aWQoKSkge1xuICAgICAgICAgICAgcHVibGljTGlua0ZpZWxkID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX0ZpZWxkMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgcHlkaW86IHB5ZGlvLFxuICAgICAgICAgICAgICAgIGxpbmtNb2RlbDogbGlua01vZGVsLFxuICAgICAgICAgICAgICAgIHNob3dNYWlsZXI6IHRoaXMucHJvcHMuc2hvd01haWxlcixcbiAgICAgICAgICAgICAgICBlZGl0QWxsb3dlZDogKCF0aGlzLnByb3BzLmF1dGhvcml6YXRpb25zIHx8IHRoaXMucHJvcHMuYXV0aG9yaXphdGlvbnMuZWRpdGFibGVfaGFzaCkgJiYgbGlua01vZGVsLmlzRWRpdGFibGUoKSxcbiAgICAgICAgICAgICAgICBrZXk6ICdwdWJsaWMtbGluaydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcHVibGljTGlua1BhbmVzID0gW19yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIG51bGwpLCBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfUGVybWlzc2lvbnMyWydkZWZhdWx0J10sIHtcbiAgICAgICAgICAgICAgICBjb21wb3NpdGVNb2RlbDogY29tcG9zaXRlTW9kZWwsXG4gICAgICAgICAgICAgICAgbGlua01vZGVsOiBsaW5rTW9kZWwsXG4gICAgICAgICAgICAgICAgcHlkaW86IHB5ZGlvLFxuICAgICAgICAgICAgICAgIGtleTogJ3B1YmxpYy1wZXJtJ1xuICAgICAgICAgICAgfSldO1xuICAgICAgICAgICAgaWYgKGxpbmtNb2RlbC5nZXRMaW5rKCkuVGFyZ2V0VXNlcnMpIHtcbiAgICAgICAgICAgICAgICBwdWJsaWNMaW5rUGFuZXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5EaXZpZGVyLCBudWxsKSk7XG4gICAgICAgICAgICAgICAgcHVibGljTGlua1BhbmVzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX1RhcmdldGVkVXNlcnMyWydkZWZhdWx0J10sIHsgbGlua01vZGVsOiBsaW5rTW9kZWwsIHB5ZGlvOiBweWRpbyB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5zaG93VGVtcG9yYXJ5UGFzc3dvcmQpIHtcbiAgICAgICAgICAgIHB1YmxpY0xpbmtGaWVsZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ3NlY3Rpb24tbGVnZW5kJywgc3R5bGU6IHsgbWFyZ2luVG9wOiAyMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMjE1JylcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogJzEwMCUnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoVmFsaWRQYXNzd29yZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlczogeyBsYWJlbDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcyMycpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS50ZW1wb3JhcnlQYXNzd29yZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLnVwZGF0ZVRlbXBvcmFyeVBhc3N3b3JkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiBcInZhbGlkLXBhc3NcIlxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHRleHRBbGlnbjogJ2NlbnRlcicsIG1hcmdpblRvcDogMjAgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWlzZWRCdXR0b24sIHsgbGFiZWw6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnOTInKSwgc2Vjb25kYXJ5OiB0cnVlLCBvbkNsaWNrOiB0aGlzLmVuYWJsZUxpbmtXaXRoUGFzc3dvcmQgfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHVibGljTGlua0ZpZWxkID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmb250U2l6ZTogMTMsIGZvbnRXZWlnaHQ6IDUwMCwgY29sb3I6ICdyZ2JhKDAsMCwwLDAuNDMpJywgcGFkZGluZ0JvdHRvbTogMTYsIHBhZGRpbmdUb3A6IDE2IH0gfSxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE5MCcpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBzdHlsZTogdGhpcy5wcm9wcy5zdHlsZSB9LFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAnMTVweCAxMHB4IDExcHgnLCBiYWNrZ3JvdW5kQ29sb3I6ICcjZjVmNWY1JywgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNlMGUwZTAnLCBmb250U2l6ZTogMTUgfSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRvZ2dsZSwge1xuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5wcm9wcy5pc1JlYWRvbmx5KCkgfHwgdGhpcy5zdGF0ZS5kaXNhYmxlZCB8fCAhbGlua01vZGVsLmlzRWRpdGFibGUoKSxcbiAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGU6IHRoaXMudG9nZ2xlTGluayxcbiAgICAgICAgICAgICAgICAgICAgdG9nZ2xlZDogbGlua01vZGVsLmdldExpbmtVdWlkKCkgfHwgdGhpcy5zdGF0ZS5zaG93VGVtcG9yYXJ5UGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE4OScpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmc6IDIwIH0gfSxcbiAgICAgICAgICAgICAgICBwdWJsaWNMaW5rRmllbGRcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBwdWJsaWNMaW5rUGFuZXNcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gUHVibGljTGlua1BhbmVsID0gKDAsIF9TaGFyZUNvbnRleHRDb25zdW1lcjJbJ2RlZmF1bHQnXSkoUHVibGljTGlua1BhbmVsKTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFB1YmxpY0xpbmtQYW5lbDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lciA9IHJlcXVpcmUoJy4uL1NoYXJlQ29udGV4dENvbnN1bWVyJyk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU2hhcmVDb250ZXh0Q29uc3VtZXIpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX0xpbmtNb2RlbCA9IHJlcXVpcmUoJy4vTGlua01vZGVsJyk7XG5cbnZhciBfTGlua01vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0xpbmtNb2RlbCk7XG5cbnZhciBfbWFpblNoYXJlSGVscGVyID0gcmVxdWlyZSgnLi4vbWFpbi9TaGFyZUhlbHBlcicpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYWluU2hhcmVIZWxwZXIpO1xuXG52YXIgX3B5ZGlvSHR0cFJlc3RBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL3Jlc3QtYXBpJyk7XG5cbnZhciBQdWJsaWNMaW5rUGVybWlzc2lvbnMgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnUHVibGljTGlua1Blcm1pc3Npb25zJyxcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBsaW5rTW9kZWw6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuaW5zdGFuY2VPZihfTGlua01vZGVsMlsnZGVmYXVsdCddKSxcbiAgICAgICAgc3R5bGU6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0XG4gICAgfSxcblxuICAgIGNoYW5nZVBlcm1pc3Npb246IGZ1bmN0aW9uIGNoYW5nZVBlcm1pc3Npb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBldmVudC50YXJnZXQubmFtZTtcbiAgICAgICAgdmFyIGNoZWNrZWQgPSBldmVudC50YXJnZXQuY2hlY2tlZDtcbiAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBjb21wb3NpdGVNb2RlbCA9IF9wcm9wcy5jb21wb3NpdGVNb2RlbDtcbiAgICAgICAgdmFyIGxpbmtNb2RlbCA9IF9wcm9wcy5saW5rTW9kZWw7XG5cbiAgICAgICAgdmFyIGxpbmsgPSBsaW5rTW9kZWwuZ2V0TGluaygpO1xuICAgICAgICBpZiAoY2hlY2tlZCkge1xuICAgICAgICAgICAgbGluay5QZXJtaXNzaW9ucy5wdXNoKF9weWRpb0h0dHBSZXN0QXBpLlJlc3RTaGFyZUxpbmtBY2Nlc3NUeXBlLmNvbnN0cnVjdEZyb21PYmplY3QobmFtZSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGluay5QZXJtaXNzaW9ucyA9IGxpbmsuUGVybWlzc2lvbnMuZmlsdGVyKGZ1bmN0aW9uIChwZXJtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBlcm0gIT09IG5hbWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tcG9zaXRlTW9kZWwuZ2V0Tm9kZSgpLmlzTGVhZigpKSB7XG4gICAgICAgICAgICAvLyBSZWFkYXB0IHRlbXBsYXRlIGRlcGVuZGluZyBvbiBwZXJtaXNzaW9uc1xuICAgICAgICAgICAgaWYgKGxpbmtNb2RlbC5oYXNQZXJtaXNzaW9uKCdQcmV2aWV3JykpIHtcbiAgICAgICAgICAgICAgICBsaW5rLlZpZXdUZW1wbGF0ZU5hbWUgPSBcInB5ZGlvX3VuaXF1ZV9zdHJpcFwiO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaW5rLlZpZXdUZW1wbGF0ZU5hbWUgPSBcInB5ZGlvX3VuaXF1ZV9kbFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJvcHMubGlua01vZGVsLnVwZGF0ZUxpbmsobGluayk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBsaW5rTW9kZWwgPSBfcHJvcHMyLmxpbmtNb2RlbDtcbiAgICAgICAgdmFyIGNvbXBvc2l0ZU1vZGVsID0gX3Byb3BzMi5jb21wb3NpdGVNb2RlbDtcbiAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzMi5weWRpbztcblxuICAgICAgICB2YXIgbm9kZSA9IGNvbXBvc2l0ZU1vZGVsLmdldE5vZGUoKTtcbiAgICAgICAgdmFyIHBlcm1zID0gW10sXG4gICAgICAgICAgICBwcmV2aWV3V2FybmluZyA9IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAobm9kZS5pc0xlYWYoKSkge1xuICAgICAgICAgICAgdmFyIF9TaGFyZUhlbHBlciRub2RlSGFzRWRpdG9yID0gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5ub2RlSGFzRWRpdG9yKHB5ZGlvLCBub2RlKTtcblxuICAgICAgICAgICAgdmFyIHByZXZpZXcgPSBfU2hhcmVIZWxwZXIkbm9kZUhhc0VkaXRvci5wcmV2aWV3O1xuICAgICAgICAgICAgdmFyIHdyaXRlYWJsZSA9IF9TaGFyZUhlbHBlciRub2RlSGFzRWRpdG9yLndyaXRlYWJsZTtcblxuICAgICAgICAgICAgcGVybXMucHVzaCh7XG4gICAgICAgICAgICAgICAgTkFNRTogJ0Rvd25sb2FkJyxcbiAgICAgICAgICAgICAgICBMQUJFTDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCc3MycpLFxuICAgICAgICAgICAgICAgIERJU0FCTEVEOiAhcHJldmlldyB8fCAhbGlua01vZGVsLmhhc1Blcm1pc3Npb24oJ1ByZXZpZXcnKSAvLyBEb3dubG9hZCBPbmx5LCBjYW5ub3QgZWRpdCB0aGlzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChwcmV2aWV3KSB7XG4gICAgICAgICAgICAgICAgcGVybXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIE5BTUU6ICdQcmV2aWV3JyxcbiAgICAgICAgICAgICAgICAgICAgTEFCRUw6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnNzInKSxcbiAgICAgICAgICAgICAgICAgICAgRElTQUJMRUQ6ICFsaW5rTW9kZWwuaGFzUGVybWlzc2lvbignRG93bmxvYWQnKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChsaW5rTW9kZWwuaGFzUGVybWlzc2lvbignUHJldmlldycpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh3cml0ZWFibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcm1zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5BTUU6ICdVcGxvYWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIExBQkVMOiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzc0YicpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBlcm1zLnB1c2goe1xuICAgICAgICAgICAgICAgIE5BTUU6ICdQcmV2aWV3JyxcbiAgICAgICAgICAgICAgICBMQUJFTDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCc3MicpLFxuICAgICAgICAgICAgICAgIERJU0FCTEVEOiAhbGlua01vZGVsLmhhc1Blcm1pc3Npb24oJ1VwbG9hZCcpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHBlcm1zLnB1c2goe1xuICAgICAgICAgICAgICAgIE5BTUU6ICdEb3dubG9hZCcsXG4gICAgICAgICAgICAgICAgTEFCRUw6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnNzMnKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwZXJtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBOQU1FOiAnVXBsb2FkJyxcbiAgICAgICAgICAgICAgICBMQUJFTDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCc3NCcpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qXG4gICAgICAgIGlmKHRoaXMucHJvcHMuc2hhcmVNb2RlbC5pc1B1YmxpY0xpbmtQcmV2aWV3RGlzYWJsZWQoKSAmJiB0aGlzLnByb3BzLnNoYXJlTW9kZWwuZ2V0UHVibGljTGlua1Blcm1pc3Npb24obGlua0lkLCAncmVhZCcpKXtcbiAgICAgICAgICAgIHByZXZpZXdXYXJuaW5nID0gPGRpdj57dGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcxOTUnKX08L2Rpdj47XG4gICAgICAgIH1cbiAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7IHBhZGRpbmc6ICcxMHB4IDE2cHgnIH0sIHRoaXMucHJvcHMuc3R5bGUpIH0sXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogNTAwLCBjb2xvcjogJ3JnYmEoMCwwLDAsMC40MyknIH0gfSxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzcwcicpXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBtYXJnaW46ICcxMHB4IDAgMjBweCcgfSB9LFxuICAgICAgICAgICAgICAgIHBlcm1zLm1hcCgoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkNoZWNrYm94LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6IHAuTkFNRSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBwLkRJU0FCTEVEIHx8IHRoaXMucHJvcHMuaXNSZWFkb25seSgpIHx8ICFsaW5rTW9kZWwuaXNFZGl0YWJsZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHAuTkFNRSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBwLkxBQkVMLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGVjazogdGhpcy5jaGFuZ2VQZXJtaXNzaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZDogbGlua01vZGVsLmhhc1Blcm1pc3Npb24ocC5OQU1FKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsU3R5bGU6IHsgd2hpdGVTcGFjZTogJ25vd3JhcCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IG1hcmdpbjogJzEwcHggMCcgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpKSxcbiAgICAgICAgICAgICAgICBwcmV2aWV3V2FybmluZ1xuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBQdWJsaWNMaW5rUGVybWlzc2lvbnMgPSAoMCwgX1NoYXJlQ29udGV4dENvbnN1bWVyMlsnZGVmYXVsdCddKShQdWJsaWNMaW5rUGVybWlzc2lvbnMpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gUHVibGljTGlua1Blcm1pc3Npb25zO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyID0gcmVxdWlyZSgnLi4vU2hhcmVDb250ZXh0Q29uc3VtZXInKTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TaGFyZUNvbnRleHRDb25zdW1lcik7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfTGlua01vZGVsID0gcmVxdWlyZSgnLi9MaW5rTW9kZWwnKTtcblxudmFyIF9MaW5rTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfTGlua01vZGVsKTtcblxudmFyIFB1YmxpY0xpbmtUZW1wbGF0ZSA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhQdWJsaWNMaW5rVGVtcGxhdGUsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gUHVibGljTGlua1RlbXBsYXRlKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUHVibGljTGlua1RlbXBsYXRlKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihQdWJsaWNMaW5rVGVtcGxhdGUucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoUHVibGljTGlua1RlbXBsYXRlLCBbe1xuICAgICAgICBrZXk6ICdvbkRyb3BEb3duQ2hhbmdlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uRHJvcERvd25DaGFuZ2UoZXZlbnQsIGluZGV4LCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGxpbmtNb2RlbCA9IHRoaXMucHJvcHMubGlua01vZGVsO1xuXG4gICAgICAgICAgICBsaW5rTW9kZWwuZ2V0TGluaygpLlZpZXdUZW1wbGF0ZU5hbWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIGxpbmtNb2RlbC5ub3RpZnlEaXJ0eSgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIGNydExhYmVsID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdmFyIGxpbmtNb2RlbCA9IHRoaXMucHJvcHMubGlua01vZGVsO1xuXG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSBsaW5rTW9kZWwuZ2V0TGluaygpLlZpZXdUZW1wbGF0ZU5hbWU7XG4gICAgICAgICAgICB2YXIgbWVudUl0ZW1zID0gdGhpcy5wcm9wcy5sYXlvdXREYXRhLm1hcChmdW5jdGlvbiAobCkge1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZCAmJiBsLkxBWU9VVF9FTEVNRU5UID09PSBzZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICBjcnRMYWJlbCA9IGwuTEFZT1VUX0xBQkVMO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIXNlbGVjdGVkICYmICFjcnRMYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IGwuTEFZT1VUX0VMRU1FTlQ7XG4gICAgICAgICAgICAgICAgICAgIGNydExhYmVsID0gbC5MQVlPVVRfTEFCRUw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyBrZXk6IGwuTEFZT1VUX0VMRU1FTlQsIHZhbHVlOiBsLkxBWU9VVF9FTEVNRU5ULCBwcmltYXJ5VGV4dDogbC5MQVlPVVRfTEFCRUwgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB0aGlzLnByb3BzLnN0eWxlIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlNlbGVjdEZpZWxkLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkRyb3BEb3duQ2hhbmdlLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5wcm9wcy5pc1JlYWRvbmx5KCkgfHwgdGhpcy5wcm9wcy5yZWFkb25seSB8fCAhbGlua01vZGVsLmlzRWRpdGFibGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE1MScpXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG1lbnVJdGVtc1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gUHVibGljTGlua1RlbXBsYXRlO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cblB1YmxpY0xpbmtUZW1wbGF0ZS5Qcm9wVHlwZXMgPSB7XG4gICAgbGlua01vZGVsOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoX0xpbmtNb2RlbDJbJ2RlZmF1bHQnXSlcbn07XG5QdWJsaWNMaW5rVGVtcGxhdGUgPSAoMCwgX1NoYXJlQ29udGV4dENvbnN1bWVyMlsnZGVmYXVsdCddKShQdWJsaWNMaW5rVGVtcGxhdGUpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gUHVibGljTGlua1RlbXBsYXRlO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyID0gcmVxdWlyZSgnLi4vU2hhcmVDb250ZXh0Q29uc3VtZXInKTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TaGFyZUNvbnRleHRDb25zdW1lcik7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9MaW5rTW9kZWwgPSByZXF1aXJlKCcuL0xpbmtNb2RlbCcpO1xuXG52YXIgX0xpbmtNb2RlbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9MaW5rTW9kZWwpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlciA9IHJlcXVpcmUoJy4uL21haW4vU2hhcmVIZWxwZXInKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9weWRpb1V0aWxQYXNzID0gcmVxdWlyZSgncHlkaW8vdXRpbC9wYXNzJyk7XG5cbnZhciBfcHlkaW9VdGlsUGFzczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb1V0aWxQYXNzKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2Zvcm0nKTtcblxudmFyIFZhbGlkUGFzc3dvcmQgPSBfUHlkaW8kcmVxdWlyZUxpYi5WYWxpZFBhc3N3b3JkO1xuXG52YXIgZ2xvYlN0eWxlcyA9IHtcbiAgICBsZWZ0SWNvbjoge1xuICAgICAgICBtYXJnaW46ICcwIDIwcHggMCA0cHgnLFxuICAgICAgICBjb2xvcjogJyM3NTc1NzUnXG4gICAgfVxufTtcblxudmFyIFB1YmxpY0xpbmtTZWN1cmVPcHRpb25zID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1B1YmxpY0xpbmtTZWN1cmVPcHRpb25zJyxcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBsaW5rTW9kZWw6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuaW5zdGFuY2VPZihfTGlua01vZGVsMlsnZGVmYXVsdCddKS5pc1JlcXVpcmVkLFxuICAgICAgICBzdHlsZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5vYmplY3RcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9LFxuXG4gICAgdXBkYXRlRExFeHBpcmF0aW9uRmllbGQ6IGZ1bmN0aW9uIHVwZGF0ZURMRXhwaXJhdGlvbkZpZWxkKGV2ZW50KSB7XG4gICAgICAgIHZhciBuZXdWYWx1ZSA9IGV2ZW50LmN1cnJlbnRUYXJnZXQudmFsdWU7XG4gICAgICAgIGlmIChwYXJzZUludChuZXdWYWx1ZSkgPCAwKSB7XG4gICAgICAgICAgICBuZXdWYWx1ZSA9IC1wYXJzZUludChuZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGxpbmtNb2RlbCA9IHRoaXMucHJvcHMubGlua01vZGVsO1xuXG4gICAgICAgIHZhciBsaW5rID0gbGlua01vZGVsLmdldExpbmsoKTtcbiAgICAgICAgbGluay5NYXhEb3dubG9hZHMgPSBuZXdWYWx1ZTtcbiAgICAgICAgbGlua01vZGVsLnVwZGF0ZUxpbmsobGluayk7XG4gICAgfSxcblxuICAgIHVwZGF0ZURheXNFeHBpcmF0aW9uRmllbGQ6IGZ1bmN0aW9uIHVwZGF0ZURheXNFeHBpcmF0aW9uRmllbGQoZXZlbnQsIG5ld1ZhbHVlKSB7XG4gICAgICAgIGlmICghbmV3VmFsdWUpIHtcbiAgICAgICAgICAgIG5ld1ZhbHVlID0gZXZlbnQuY3VycmVudFRhcmdldC5nZXRWYWx1ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBsaW5rTW9kZWwgPSB0aGlzLnByb3BzLmxpbmtNb2RlbDtcblxuICAgICAgICB2YXIgbGluayA9IGxpbmtNb2RlbC5nZXRMaW5rKCk7XG4gICAgICAgIGxpbmsuQWNjZXNzRW5kID0gbmV3VmFsdWU7XG4gICAgICAgIGxpbmtNb2RlbC51cGRhdGVMaW5rKGxpbmspO1xuICAgIH0sXG5cbiAgICBvbkRhdGVDaGFuZ2U6IGZ1bmN0aW9uIG9uRGF0ZUNoYW5nZShldmVudCwgdmFsdWUpIHtcbiAgICAgICAgdmFyIGRhdGUyID0gRGF0ZS5VVEModmFsdWUuZ2V0RnVsbFllYXIoKSwgdmFsdWUuZ2V0TW9udGgoKSwgdmFsdWUuZ2V0RGF0ZSgpKTtcbiAgICAgICAgdGhpcy51cGRhdGVEYXlzRXhwaXJhdGlvbkZpZWxkKGV2ZW50LCBNYXRoLmZsb29yKGRhdGUyIC8gMTAwMCkgKyBcIlwiKTtcbiAgICB9LFxuXG4gICAgcmVzZXRQYXNzd29yZDogZnVuY3Rpb24gcmVzZXRQYXNzd29yZCgpIHtcbiAgICAgICAgdmFyIGxpbmtNb2RlbCA9IHRoaXMucHJvcHMubGlua01vZGVsO1xuXG4gICAgICAgIGxpbmtNb2RlbC5zZXRVcGRhdGVQYXNzd29yZCgnJyk7XG4gICAgICAgIGxpbmtNb2RlbC5nZXRMaW5rKCkuUGFzc3dvcmRSZXF1aXJlZCA9IGZhbHNlO1xuICAgICAgICBsaW5rTW9kZWwubm90aWZ5RGlydHkoKTtcbiAgICB9LFxuXG4gICAgc2V0VXBkYXRpbmdQYXNzd29yZDogZnVuY3Rpb24gc2V0VXBkYXRpbmdQYXNzd29yZChuZXdWYWx1ZSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIF9weWRpb1V0aWxQYXNzMlsnZGVmYXVsdCddLmNoZWNrUGFzc3dvcmRTdHJlbmd0aChuZXdWYWx1ZSwgZnVuY3Rpb24gKG9rLCBtc2cpIHtcbiAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgdXBkYXRpbmdQYXNzd29yZDogbmV3VmFsdWUsIHVwZGF0aW5nUGFzc3dvcmRWYWxpZDogb2sgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjaGFuZ2VQYXNzd29yZDogZnVuY3Rpb24gY2hhbmdlUGFzc3dvcmQoKSB7XG4gICAgICAgIHZhciBsaW5rTW9kZWwgPSB0aGlzLnByb3BzLmxpbmtNb2RlbDtcbiAgICAgICAgdmFyIHVwZGF0aW5nUGFzc3dvcmQgPSB0aGlzLnN0YXRlLnVwZGF0aW5nUGFzc3dvcmQ7XG5cbiAgICAgICAgbGlua01vZGVsLnNldFVwZGF0ZVBhc3N3b3JkKHVwZGF0aW5nUGFzc3dvcmQpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgcHdQb3A6IGZhbHNlLCB1cGRhdGluZ1Bhc3N3b3JkOiBcIlwiLCB1cGRhdGluZ1Bhc3N3b3JkVmFsaWQ6IGZhbHNlIH0pO1xuICAgICAgICBsaW5rTW9kZWwubm90aWZ5RGlydHkoKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlUGFzc3dvcmQ6IGZ1bmN0aW9uIHVwZGF0ZVBhc3N3b3JkKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICB2YXIgbGlua01vZGVsID0gdGhpcy5wcm9wcy5saW5rTW9kZWw7XG5cbiAgICAgICAgdmFyIHZhbGlkID0gdGhpcy5yZWZzLnB3ZC5pc1ZhbGlkKCk7XG4gICAgICAgIGlmICh2YWxpZCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGludmFsaWRQYXNzd29yZDogbnVsbCwgaW52YWxpZDogZmFsc2UgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGxpbmtNb2RlbC5zZXRVcGRhdGVQYXNzd29yZChuZXdWYWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBpbnZhbGlkUGFzc3dvcmQ6IG5ld1ZhbHVlLCBpbnZhbGlkOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHJlc2V0RG93bmxvYWRzOiBmdW5jdGlvbiByZXNldERvd25sb2FkcygpIHtcbiAgICAgICAgaWYgKHdpbmRvdy5jb25maXJtKHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTA2JykpKSB7XG4gICAgICAgICAgICB2YXIgbGlua01vZGVsID0gdGhpcy5wcm9wcy5saW5rTW9kZWw7XG5cbiAgICAgICAgICAgIGxpbmtNb2RlbC5nZXRMaW5rKCkuQ3VycmVudERvd25sb2FkcyA9IFwiMFwiO1xuICAgICAgICAgICAgbGlua01vZGVsLm5vdGlmeURpcnR5KCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVzZXRFeHBpcmF0aW9uOiBmdW5jdGlvbiByZXNldEV4cGlyYXRpb24oKSB7XG4gICAgICAgIHZhciBsaW5rTW9kZWwgPSB0aGlzLnByb3BzLmxpbmtNb2RlbDtcblxuICAgICAgICBsaW5rTW9kZWwuZ2V0TGluaygpLkFjY2Vzc0VuZCA9IFwiMFwiO1xuICAgICAgICBsaW5rTW9kZWwubm90aWZ5RGlydHkoKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyUGFzc3dvcmRDb250YWluZXI6IGZ1bmN0aW9uIHJlbmRlclBhc3N3b3JkQ29udGFpbmVyKCkge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICB2YXIgbGlua01vZGVsID0gdGhpcy5wcm9wcy5saW5rTW9kZWw7XG5cbiAgICAgICAgdmFyIGxpbmsgPSBsaW5rTW9kZWwuZ2V0TGluaygpO1xuICAgICAgICB2YXIgcGFzc3dvcmRGaWVsZCA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHJlc2V0UGFzc3dvcmQgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICB1cGRhdGVQYXNzd29yZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKGxpbmsuUGFzc3dvcmRSZXF1aXJlZCkge1xuICAgICAgICAgICAgcmVzZXRQYXNzd29yZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHtcbiAgICAgICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5wcm9wcy5pc1JlYWRvbmx5KCkgfHwgIWxpbmtNb2RlbC5pc0VkaXRhYmxlKCksXG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5OiB0cnVlLFxuICAgICAgICAgICAgICAgIG9uVG91Y2hUYXA6IHRoaXMucmVzZXRQYXNzd29yZCxcbiAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcxNzQnKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB1cGRhdGVQYXNzd29yZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwge1xuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5wcm9wcy5pc1JlYWRvbmx5KCkgfHwgIWxpbmtNb2RlbC5pc0VkaXRhYmxlKCksXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFRhcDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHB3UG9wOiB0cnVlLCBwd0FuY2hvcjogZS5jdXJyZW50VGFyZ2V0IH0pO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcxODEnKVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5Qb3BvdmVyLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiB0aGlzLnN0YXRlLnB3UG9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5jaG9yRWw6IHRoaXMuc3RhdGUucHdBbmNob3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmNob3JPcmlnaW46IHsgaG9yaXpvbnRhbDogJ3JpZ2h0JywgdmVydGljYWw6ICdib3R0b20nIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRPcmlnaW46IHsgaG9yaXpvbnRhbDogJ3JpZ2h0JywgdmVydGljYWw6ICd0b3AnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvblJlcXVlc3RDbG9zZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHB3UG9wOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6IDI4MCwgcGFkZGluZzogOCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChWYWxpZFBhc3N3b3JkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJ1cGRhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY6IFwicHdkVXBkYXRlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlczogeyBsYWJlbDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcyMycpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUudXBkYXRpbmdQYXNzd29yZCA/IHRoaXMuc3RhdGUudXBkYXRpbmdQYXNzd29yZCA6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRVcGRhdGluZ1Bhc3N3b3JkKHYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nVG9wOiAzNiwgdGV4dEFsaWduOiAncmlnaHQnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGxhYmVsOiBcIk9LXCIsIG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5jaGFuZ2VQYXNzd29yZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBkaXNhYmxlZDogIXRoaXMuc3RhdGUudXBkYXRpbmdQYXNzd29yZCB8fCAhdGhpcy5zdGF0ZS51cGRhdGluZ1Bhc3N3b3JkVmFsaWQgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBsYWJlbDogXCJDYW5jZWxcIiwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgcHdQb3A6IGZhbHNlLCB1cGRhdGluZ1Bhc3N3b3JkOiAnJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHBhc3N3b3JkRmllbGQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5UZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsVGV4dDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcyMycpLFxuICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAnKioqKioqKionLFxuICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMucHJvcHMuaXNSZWFkb25seSgpICYmIGxpbmtNb2RlbC5pc0VkaXRhYmxlKCkpIHtcbiAgICAgICAgICAgIHBhc3N3b3JkRmllbGQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChWYWxpZFBhc3N3b3JkLCB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3NoYXJlLXBhc3N3b3JkJyxcbiAgICAgICAgICAgICAgICByZWY6IFwicHdkXCIsXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczogeyBsYWJlbDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcyMycpIH0sXG4gICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUuaW52YWxpZFBhc3N3b3JkID8gdGhpcy5zdGF0ZS5pbnZhbGlkUGFzc3dvcmQgOiBsaW5rTW9kZWwudXBkYXRlUGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMudXBkYXRlUGFzc3dvcmRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXNzd29yZEZpZWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdwYXNzd29yZC1jb250YWluZXInLCBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdiYXNlbGluZScgfSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogJ21kaSBtZGktZmlsZS1sb2NrJywgc3R5bGU6IGdsb2JTdHlsZXMubGVmdEljb24gfSksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiByZXNldFBhc3N3b3JkID8gJzQwJScgOiAnMTAwJScsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgcGFzc3dvcmRGaWVsZFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgcmVzZXRQYXNzd29yZCAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6ICc2MCUnLCBkaXNwbGF5OiAnZmxleCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICByZXNldFBhc3N3b3JkLFxuICAgICAgICAgICAgICAgICAgICAnICcsXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZVBhc3N3b3JkXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGZvcm1hdERhdGU6IGZ1bmN0aW9uIGZvcm1hdERhdGUoZGF0ZU9iamVjdCkge1xuICAgICAgICB2YXIgZGF0ZUZvcm1hdERheSA9IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnZGF0ZV9mb3JtYXQnLCAnJykuc3BsaXQoJyAnKS5zaGlmdCgpO1xuICAgICAgICByZXR1cm4gZGF0ZUZvcm1hdERheS5yZXBsYWNlKCdZJywgZGF0ZU9iamVjdC5nZXRGdWxsWWVhcigpKS5yZXBsYWNlKCdtJywgZGF0ZU9iamVjdC5nZXRNb250aCgpICsgMSkucmVwbGFjZSgnZCcsIGRhdGVPYmplY3QuZ2V0RGF0ZSgpKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBsaW5rTW9kZWwgPSB0aGlzLnByb3BzLmxpbmtNb2RlbDtcblxuICAgICAgICB2YXIgbGluayA9IGxpbmtNb2RlbC5nZXRMaW5rKCk7XG5cbiAgICAgICAgdmFyIHBhc3NDb250YWluZXIgPSB0aGlzLnJlbmRlclBhc3N3b3JkQ29udGFpbmVyKCk7XG4gICAgICAgIHZhciBjcnRMaW5rRExBbGxvd2VkID0gbGlua01vZGVsLmhhc1Blcm1pc3Npb24oJ0Rvd25sb2FkJykgJiYgIWxpbmtNb2RlbC5oYXNQZXJtaXNzaW9uKCdQcmV2aWV3JykgJiYgIWxpbmtNb2RlbC5oYXNQZXJtaXNzaW9uKCdVcGxvYWQnKTtcbiAgICAgICAgdmFyIGRsTGltaXRWYWx1ZSA9IHBhcnNlSW50KGxpbmsuTWF4RG93bmxvYWRzKTtcbiAgICAgICAgdmFyIGV4cGlyYXRpb25EYXRlVmFsdWUgPSBwYXJzZUludChsaW5rLkFjY2Vzc0VuZCk7XG5cbiAgICAgICAgdmFyIGNhbEljb24gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBjbGFzc05hbWU6ICdtZGkgbWRpLWNhbGVuZGFyLWNsb2NrJywgc3R5bGU6IGdsb2JTdHlsZXMubGVmdEljb24gfSk7XG4gICAgICAgIHZhciBleHBEYXRlID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgbWF4RGF0ZSA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGRsQ291bnRlclN0cmluZyA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGRhdGVFeHBpcmVkID0gZmFsc2UsXG4gICAgICAgICAgICBkbEV4cGlyZWQgPSBmYWxzZTtcbiAgICAgICAgdmFyIHRvZGF5ID0gbmV3IERhdGUoKTtcblxuICAgICAgICB2YXIgYXV0aCA9IF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uZ2V0QXV0aG9yaXphdGlvbnModGhpcy5wcm9wcy5weWRpbyk7XG4gICAgICAgIGlmIChwYXJzZUludChhdXRoLm1heF9leHBpcmF0aW9uKSA+IDApIHtcbiAgICAgICAgICAgIG1heERhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgbWF4RGF0ZS5zZXREYXRlKHRvZGF5LmdldERhdGUoKSArIHBhcnNlSW50KGF1dGgubWF4X2V4cGlyYXRpb24pKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyc2VJbnQoYXV0aC5tYXhfZG93bmxvYWRzKSA+IDApIHtcbiAgICAgICAgICAgIGRsTGltaXRWYWx1ZSA9IE1hdGgubWluKGRsTGltaXRWYWx1ZSwgcGFyc2VJbnQoYXV0aC5tYXhfZG93bmxvYWRzKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXhwaXJhdGlvbkRhdGVWYWx1ZSkge1xuICAgICAgICAgICAgaWYgKGV4cGlyYXRpb25EYXRlVmFsdWUgPCAwKSB7XG4gICAgICAgICAgICAgICAgZGF0ZUV4cGlyZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXhwRGF0ZSA9IG5ldyBEYXRlKGV4cGlyYXRpb25EYXRlVmFsdWUgKiAxMDAwKTtcbiAgICAgICAgICAgIC8vZXhwRGF0ZS5zZXREYXRlKHRvZGF5LmdldERhdGUoKSArIHBhcnNlSW50KGV4cGlyYXRpb25EYXRlVmFsdWUpKTtcbiAgICAgICAgICAgIGNhbEljb24gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IGljb25TdHlsZTogeyBjb2xvcjogZ2xvYlN0eWxlcy5sZWZ0SWNvbi5jb2xvciB9LCBzdHlsZTogeyBtYXJnaW5MZWZ0OiAtOCwgbWFyZ2luUmlnaHQ6IDggfSwgaWNvbkNsYXNzTmFtZTogJ21kaSBtZGktY2xvc2UtY2lyY2xlJywgb25Ub3VjaFRhcDogdGhpcy5yZXNldEV4cGlyYXRpb24uYmluZCh0aGlzKSB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGxMaW1pdFZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgZGxDb3VudGVyID0gcGFyc2VJbnQobGluay5DdXJyZW50RG93bmxvYWRzKSB8fCAwO1xuICAgICAgICAgICAgdmFyIHJlc2V0TGluayA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChkbENvdW50ZXIpIHtcbiAgICAgICAgICAgICAgICByZXNldExpbmsgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2EnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInIH0sIG9uQ2xpY2s6IHRoaXMucmVzZXREb3dubG9hZHMuYmluZCh0aGlzKSwgdGl0bGU6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTcnKSB9LFxuICAgICAgICAgICAgICAgICAgICAnKCcsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTYnKSxcbiAgICAgICAgICAgICAgICAgICAgJyknXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBpZiAoZGxDb3VudGVyID49IGRsTGltaXRWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBkbEV4cGlyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRsQ291bnRlclN0cmluZyA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2RsQ291bnRlclN0cmluZycgfSxcbiAgICAgICAgICAgICAgICBkbENvdW50ZXIgKyAnLycgKyBkbExpbWl0VmFsdWUsXG4gICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgIHJlc2V0TGlua1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHsgcGFkZGluZzogMTAgfSwgdGhpcy5wcm9wcy5zdHlsZSkgfSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZm9udFNpemU6IDEzLCBmb250V2VpZ2h0OiA1MDAsIGNvbG9yOiAncmdiYSgwLDAsMCwwLjQzKScgfSB9LFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMjQnKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZ1JpZ2h0OiAxMCB9IH0sXG4gICAgICAgICAgICAgICAgcGFzc0NvbnRhaW5lcixcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnYmFzZWxpbmUnLCBwb3NpdGlvbjogJ3JlbGF0aXZlJyB9LCBjbGFzc05hbWU6IGRhdGVFeHBpcmVkID8gJ2xpbWl0LWJsb2NrLWV4cGlyZWQnIDogbnVsbCB9LFxuICAgICAgICAgICAgICAgICAgICBjYWxJY29uLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5EYXRlUGlja2VyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWY6ICdleHBpcmF0aW9uRGF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6ICdzdGFydCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZXhwRGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbkRhdGU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhEYXRlOiBtYXhEYXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b09rOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMucHJvcHMuaXNSZWFkb25seSgpIHx8ICFsaW5rTW9kZWwuaXNFZGl0YWJsZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25EYXRlQ2hhbmdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvd1llYXJTZWxlY3RvcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoZGF0ZUV4cGlyZWQgPyAnMjFiJyA6ICcyMScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZTogJ2xhbmRzY2FwZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXREYXRlOiB0aGlzLmZvcm1hdERhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBmbGV4OiAxIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmbGV4OiAxLCBhbGlnbkl0ZW1zOiAnYmFzZWxpbmUnLCBkaXNwbGF5OiBjcnRMaW5rRExBbGxvd2VkID8gJ2ZsZXgnIDogJ25vbmUnLCBwb3NpdGlvbjogJ3JlbGF0aXZlJyB9LCBjbGFzc05hbWU6IGRsRXhwaXJlZCA/ICdsaW1pdC1ibG9jay1leHBpcmVkJyA6IG51bGwgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRm9udEljb24sIHsgY2xhc3NOYW1lOiAnbWRpIG1kaS1kb3dubG9hZCcsIHN0eWxlOiBnbG9iU3R5bGVzLmxlZnRJY29uIH0pLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5UZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMucHJvcHMuaXNSZWFkb25seSgpIHx8ICFsaW5rTW9kZWwuaXNFZGl0YWJsZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZShkbEV4cGlyZWQgPyAnMjJiJyA6ICcyMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGRsTGltaXRWYWx1ZSA+IDAgPyBkbExpbWl0VmFsdWUgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLnVwZGF0ZURMRXhwaXJhdGlvbkZpZWxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgZmxleDogMSB9XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZm9udFNpemU6IDEzLCBmb250V2VpZ2h0OiA1MDAsIGNvbG9yOiAncmdiYSgwLDAsMCwwLjQzKScgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGxDb3VudGVyU3RyaW5nXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFB1YmxpY0xpbmtTZWN1cmVPcHRpb25zID0gKDAsIF9TaGFyZUNvbnRleHRDb25zdW1lcjJbJ2RlZmF1bHQnXSkoUHVibGljTGlua1NlY3VyZU9wdGlvbnMpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gUHVibGljTGlua1NlY3VyZU9wdGlvbnM7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcmVhY3REb20gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcblxudmFyIF9yZWFjdERvbTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdERvbSk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIgPSByZXF1aXJlKCcuLi9TaGFyZUNvbnRleHRDb25zdW1lcicpO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1NoYXJlQ29udGV4dENvbnN1bWVyKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9jbGlwYm9hcmQgPSByZXF1aXJlKCdjbGlwYm9hcmQnKTtcblxudmFyIF9jbGlwYm9hcmQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY2xpcGJvYXJkKTtcblxudmFyIF9saW5rc0xpbmtNb2RlbCA9IHJlcXVpcmUoJy4uL2xpbmtzL0xpbmtNb2RlbCcpO1xuXG52YXIgX2xpbmtzTGlua01vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2xpbmtzTGlua01vZGVsKTtcblxudmFyIFRhcmdldGVkVXNlckxpbmsgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoVGFyZ2V0ZWRVc2VyTGluaywgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBUYXJnZXRlZFVzZXJMaW5rKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBUYXJnZXRlZFVzZXJMaW5rKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihUYXJnZXRlZFVzZXJMaW5rLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0geyBjb3B5TWVzc2FnZTogJycgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoVGFyZ2V0ZWRVc2VyTGluaywgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fY2xpcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NsaXAuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuX2J1dHRvbikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NsaXAgPSBuZXcgX2NsaXBib2FyZDJbJ2RlZmF1bHQnXSh0aGlzLl9idXR0b24sIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogKGZ1bmN0aW9uICh0cmlnZ2VyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5saW5rO1xuICAgICAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2xpcC5vbignc3VjY2VzcycsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb3B5TWVzc2FnZTogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcxOTInKSB9LCB0aGlzLmNsZWFyQ29weU1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2NsaXAub24oJ2Vycm9yJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvcHlNZXNzYWdlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZ2xvYmFsLm5hdmlnYXRvci5wbGF0Zm9ybS5pbmRleE9mKFwiTWFjXCIpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3B5TWVzc2FnZSA9IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTQ0Jyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3B5TWVzc2FnZSA9IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnc2hhcmVfY2VudGVyLjE0MycpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb3B5TWVzc2FnZTogY29weU1lc3NhZ2UgfSwgdGhpcy5jbGVhckNvcHlNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFVubW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fY2xpcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NsaXAuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjbGVhckNvcHlNZXNzYWdlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNsZWFyQ29weU1lc3NhZ2UoKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvcHlNZXNzYWdlOiAnJyB9KTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcyksIDUwMDApO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0VXNlciA9IF9wcm9wcy50YXJnZXRVc2VyO1xuICAgICAgICAgICAgdmFyIGxpbmsgPSBfcHJvcHMubGluaztcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnIH0gfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSB9IH0sXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFVzZXIuRGlzcGxheSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW86IHRoaXMucHJvcHMucHlkaW8sXG4gICAgICAgICAgICAgICAgICAgICAgICByZWY6IGZ1bmN0aW9uIChyZWYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5fYnV0dG9uID0gX3JlYWN0RG9tMlsnZGVmYXVsdCddLmZpbmRET01Ob2RlKHJlZik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZTogJ21kaSBtZGktbGluaycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwOiB0aGlzLnN0YXRlLmNvcHlNZXNzYWdlIHx8IGxpbmssXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uU3R5bGU6IHsgZm9udFNpemU6IDEzLCBsaW5lSGVpZ2h0OiAnMTdweCcgfSwgc3R5bGU6IHsgd2lkdGg6IDM0LCBoZWlnaHQ6IDM0LCBwYWRkaW5nOiA2IH1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogNDAsIHRleHRBbGlnbjogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRVc2VyLkRvd25sb2FkQ291bnRcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFRhcmdldGVkVXNlckxpbms7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxudmFyIFRhcmdldGVkVXNlcnMgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQyKSB7XG4gICAgX2luaGVyaXRzKFRhcmdldGVkVXNlcnMsIF9SZWFjdCRDb21wb25lbnQyKTtcblxuICAgIGZ1bmN0aW9uIFRhcmdldGVkVXNlcnMocHJvcHMsIGNvbnRleHQpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFRhcmdldGVkVXNlcnMpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFRhcmdldGVkVXNlcnMucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcywgY29udGV4dCk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7IG9wZW46IGZhbHNlIH07XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFRhcmdldGVkVXNlcnMsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGxpbmtNb2RlbCA9IHRoaXMucHJvcHMubGlua01vZGVsO1xuXG4gICAgICAgICAgICB2YXIgbGluayA9IGxpbmtNb2RlbC5nZXRMaW5rKCk7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0VXNlcnMgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAobGluay5UYXJnZXRVc2Vycykge1xuICAgICAgICAgICAgICAgIHRhcmdldFVzZXJzID0gbGluay5UYXJnZXRVc2VycztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpdGVtcyA9IE9iamVjdC5rZXlzKHRhcmdldFVzZXJzKS5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICB2YXIgdGl0bGUgPSBsaW5rTW9kZWwuZ2V0UHVibGljVXJsKCkgKyAnP3U9JyArIGs7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFRhcmdldGVkVXNlckxpbmssIHsgdGFyZ2V0VXNlcjogdGFyZ2V0VXNlcnNba10sIGxpbms6IHRpdGxlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIWl0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcm9vdFN0eWxlID0ge1xuICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6ICczNHB4JyxcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNHB4IDEwcHggNHB4JyxcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMTQsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2ZhZmFmYScsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAyXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIGhlYWRlclN0eWxlID0ge1xuICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogdGhpcy5zdGF0ZS5vcGVuID8gJzFweCBzb2xpZCAjNzU3NTc1JyA6ICcnLFxuICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSgwLCAwLCAwLCAwLjM2KSdcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiByb290U3R5bGUgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHsgZGlzcGxheTogJ2ZsZXgnIH0sIGhlYWRlclN0eWxlKSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMjQ1JykucmVwbGFjZSgnJXMnLCBpdGVtcy5sZW5ndGgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ21kaSBtZGktY2hldnJvbi0nICsgKHRoaXMuc3RhdGUub3BlbiA/ICd1cCcgOiAnZG93bicpLCBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJyB9LCBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IG9wZW46ICFfdGhpczIuc3RhdGUub3BlbiB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUub3BlbiAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogNDAsIHRleHRBbGlnbjogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgJyNETCdcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5vcGVuICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbXNcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFRhcmdldGVkVXNlcnM7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuVGFyZ2V0ZWRVc2Vycy5wcm9wVHlwZXMgPSB7XG4gICAgbGlua01vZGVsOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoX2xpbmtzTGlua01vZGVsMlsnZGVmYXVsdCddKVxufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gVGFyZ2V0ZWRVc2VycyA9ICgwLCBfU2hhcmVDb250ZXh0Q29uc3VtZXIyWydkZWZhdWx0J10pKFRhcmdldGVkVXNlcnMpO1xuVGFyZ2V0ZWRVc2VyTGluayA9ICgwLCBfU2hhcmVDb250ZXh0Q29uc3VtZXIyWydkZWZhdWx0J10pKFRhcmdldGVkVXNlckxpbmspO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBUYXJnZXRlZFVzZXJzO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfc2xpY2VkVG9BcnJheSA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIHNsaWNlSXRlcmF0b3IoYXJyLCBpKSB7IHZhciBfYXJyID0gW107IHZhciBfbiA9IHRydWU7IHZhciBfZCA9IGZhbHNlOyB2YXIgX2UgPSB1bmRlZmluZWQ7IHRyeSB7IGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHsgX2Fyci5wdXNoKF9zLnZhbHVlKTsgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrOyB9IH0gY2F0Y2ggKGVycikgeyBfZCA9IHRydWU7IF9lID0gZXJyOyB9IGZpbmFsbHkgeyB0cnkgeyBpZiAoIV9uICYmIF9pWydyZXR1cm4nXSkgX2lbJ3JldHVybiddKCk7IH0gZmluYWxseSB7IGlmIChfZCkgdGhyb3cgX2U7IH0gfSByZXR1cm4gX2FycjsgfSByZXR1cm4gZnVuY3Rpb24gKGFyciwgaSkgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IHJldHVybiBhcnI7IH0gZWxzZSBpZiAoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKSB7IHJldHVybiBzbGljZUl0ZXJhdG9yKGFyciwgaSk7IH0gZWxzZSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2UnKTsgfSB9OyB9KSgpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lciA9IHJlcXVpcmUoJy4uL1NoYXJlQ29udGV4dENvbnN1bWVyJyk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU2hhcmVDb250ZXh0Q29uc3VtZXIpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfcHlkaW9IdHRwUG9saWNpZXMgPSByZXF1aXJlKCdweWRpby9odHRwL3BvbGljaWVzJyk7XG5cbnZhciBfcHlkaW9IdHRwUG9saWNpZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwUG9saWNpZXMpO1xuXG52YXIgX3B5ZGlvSHR0cFJlc3RBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL3Jlc3QtYXBpJyk7XG5cbnZhciBfTGlua01vZGVsID0gcmVxdWlyZSgnLi9MaW5rTW9kZWwnKTtcblxudmFyIF9MaW5rTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfTGlua01vZGVsKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2NvbXBvbmVudHMnKTtcblxudmFyIFJlc291cmNlUG9saWNpZXNQYW5lbCA9IF9QeWRpbyRyZXF1aXJlTGliLlJlc291cmNlUG9saWNpZXNQYW5lbDtcblxudmFyIFZpc2liaWxpdHlQYW5lbCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdWaXNpYmlsaXR5UGFuZWwnLFxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIGFzc29jaWF0ZWQgaGlkZGVuIHVzZXJzIHBvbGljaWVzLCBvdGhlcndpc2VcbiAgICAgKiB0aGUgcHVibGljIGxpbmsgdmlzaWJpbGl0eSBjYW5ub3QgYmUgY2hhbmdlZFxuICAgICAqIEBwYXJhbSBkaWZmUG9saWNpZXNcbiAgICAgKi9cbiAgICBvblNhdmVQb2xpY2llczogZnVuY3Rpb24gb25TYXZlUG9saWNpZXMoZGlmZlBvbGljaWVzKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBsaW5rTW9kZWwgPSBfcHJvcHMubGlua01vZGVsO1xuICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMucHlkaW87XG5cbiAgICAgICAgdmFyIGludGVybmFsVXNlciA9IGxpbmtNb2RlbC5nZXRMaW5rKCkuVXNlckxvZ2luO1xuICAgICAgICBfcHlkaW9IdHRwUG9saWNpZXMyWydkZWZhdWx0J10ubG9hZFBvbGljaWVzKCd1c2VyJywgaW50ZXJuYWxVc2VyKS50aGVuKGZ1bmN0aW9uIChwb2xpY2llcykge1xuICAgICAgICAgICAgaWYgKHBvbGljaWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHZhciByZXNvdXJjZUlkID0gcG9saWNpZXNbMF0uUmVzb3VyY2U7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1BvbGljaWVzID0gX3RoaXMuZGlmZlBvbGljaWVzKHBvbGljaWVzLCBkaWZmUG9saWNpZXMsIHJlc291cmNlSWQpO1xuICAgICAgICAgICAgICAgIF9weWRpb0h0dHBQb2xpY2llczJbJ2RlZmF1bHQnXS5zYXZlUG9saWNpZXMoJ3VzZXInLCBpbnRlcm5hbFVzZXIsIG5ld1BvbGljaWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGRpZmZQb2xpY2llczogZnVuY3Rpb24gZGlmZlBvbGljaWVzKHBvbGljaWVzLCBfZGlmZlBvbGljaWVzLCByZXNvdXJjZUlkKSB7XG4gICAgICAgIHZhciBuZXdQb2xzID0gW107XG4gICAgICAgIHBvbGljaWVzLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgdmFyIGtleSA9IHAuQWN0aW9uICsgJy8vLycgKyBwLlN1YmplY3Q7XG4gICAgICAgICAgICBpZiAoIV9kaWZmUG9saWNpZXMucmVtb3ZlW2tleV0pIHtcbiAgICAgICAgICAgICAgICBuZXdQb2xzLnB1c2gocCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3Qua2V5cyhfZGlmZlBvbGljaWVzLmFkZCkubWFwKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICB2YXIgbmV3UG9sID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLlNlcnZpY2VSZXNvdXJjZVBvbGljeSgpO1xuXG4gICAgICAgICAgICB2YXIgX2skc3BsaXQgPSBrLnNwbGl0KCcvLy8nKTtcblxuICAgICAgICAgICAgdmFyIF9rJHNwbGl0MiA9IF9zbGljZWRUb0FycmF5KF9rJHNwbGl0LCAyKTtcblxuICAgICAgICAgICAgdmFyIGFjdGlvbiA9IF9rJHNwbGl0MlswXTtcbiAgICAgICAgICAgIHZhciBzdWJqZWN0ID0gX2skc3BsaXQyWzFdO1xuXG4gICAgICAgICAgICBuZXdQb2wuUmVzb3VyY2UgPSByZXNvdXJjZUlkO1xuICAgICAgICAgICAgbmV3UG9sLkVmZmVjdCA9IF9weWRpb0h0dHBSZXN0QXBpLlNlcnZpY2VSZXNvdXJjZVBvbGljeVBvbGljeUVmZmVjdC5jb25zdHJ1Y3RGcm9tT2JqZWN0KCdhbGxvdycpO1xuICAgICAgICAgICAgbmV3UG9sLlN1YmplY3QgPSBzdWJqZWN0O1xuICAgICAgICAgICAgbmV3UG9sLkFjdGlvbiA9IGFjdGlvbjtcbiAgICAgICAgICAgIG5ld1BvbHMucHVzaChuZXdQb2wpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG5ld1BvbHM7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBsaW5rTW9kZWwgPSBfcHJvcHMyLmxpbmtNb2RlbDtcbiAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzMi5weWRpbztcblxuICAgICAgICB2YXIgc3ViamVjdHNIaWRkZW4gPSBbXTtcbiAgICAgICAgc3ViamVjdHNIaWRkZW5bXCJ1c2VyOlwiICsgbGlua01vZGVsLmdldExpbmsoKS5Vc2VyTG9naW5dID0gdHJ1ZTtcbiAgICAgICAgdmFyIHN1YmplY3REaXNhYmxlcyA9IHsgUkVBRDogc3ViamVjdHNIaWRkZW4sIFdSSVRFOiBzdWJqZWN0c0hpZGRlbiB9O1xuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgc3R5bGU6IHRoaXMucHJvcHMuc3R5bGUsIHRpdGxlOiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE5OScpIH0sXG4gICAgICAgICAgICBsaW5rTW9kZWwuZ2V0TGluaygpLlV1aWQgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoUmVzb3VyY2VQb2xpY2llc1BhbmVsLCB7XG4gICAgICAgICAgICAgICAgcHlkaW86IHB5ZGlvLFxuICAgICAgICAgICAgICAgIHJlc291cmNlVHlwZTogJ3dvcmtzcGFjZScsXG4gICAgICAgICAgICAgICAgcmVzb3VyY2VJZDogbGlua01vZGVsLmdldExpbmsoKS5VdWlkLFxuICAgICAgICAgICAgICAgIHNraXBUaXRsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBvblNhdmVQb2xpY2llczogdGhpcy5vblNhdmVQb2xpY2llcy5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgIHN1YmplY3RzRGlzYWJsZWQ6IHN1YmplY3REaXNhYmxlcyxcbiAgICAgICAgICAgICAgICBzdWJqZWN0c0hpZGRlbjogc3ViamVjdHNIaWRkZW4sXG4gICAgICAgICAgICAgICAgcmVhZG9ubHk6IHRoaXMucHJvcHMuaXNSZWFkb25seSgpIHx8ICFsaW5rTW9kZWwuaXNFZGl0YWJsZSgpLFxuICAgICAgICAgICAgICAgIHJlZjogJ3BvbGljaWVzJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxuVmlzaWJpbGl0eVBhbmVsLlByb3BUeXBlcyA9IHtcbiAgICBweWRpbzogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKF9weWRpbzJbJ2RlZmF1bHQnXSkuaXNSZXF1aXJlZCxcbiAgICBsaW5rTW9kZWw6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuaW5zdGFuY2VPZihfTGlua01vZGVsMlsnZGVmYXVsdCddKS5pc1JlcXVpcmVkXG59O1xuXG5WaXNpYmlsaXR5UGFuZWwgPSAoMCwgX1NoYXJlQ29udGV4dENvbnN1bWVyMlsnZGVmYXVsdCddKShWaXNpYmlsaXR5UGFuZWwpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gVmlzaWJpbGl0eVBhbmVsO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94MiwgX3gzLCBfeDQpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gyLCBwcm9wZXJ0eSA9IF94MywgcmVjZWl2ZXIgPSBfeDQ7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3gyID0gcGFyZW50OyBfeDMgPSBwcm9wZXJ0eTsgX3g0ID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9weWRpb0h0dHBBcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwQXBpKTtcblxudmFyIF9weWRpb01vZGVsTm9kZSA9IHJlcXVpcmUoJ3B5ZGlvL21vZGVsL25vZGUnKTtcblxudmFyIF9weWRpb01vZGVsTm9kZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb01vZGVsTm9kZSk7XG5cbnZhciBfcHlkaW9VdGlsUGF0aCA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvcGF0aCcpO1xuXG52YXIgX3B5ZGlvVXRpbFBhdGgyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9VdGlsUGF0aCk7XG5cbnZhciBfcHlkaW9IdHRwUmVzdEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvcmVzdC1hcGknKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2Jvb3QnKTtcblxudmFyIEFjdGlvbkRpYWxvZ01peGluID0gX1B5ZGlvJHJlcXVpcmVMaWIuQWN0aW9uRGlhbG9nTWl4aW47XG52YXIgTG9hZGVyID0gX1B5ZGlvJHJlcXVpcmVMaWIuTG9hZGVyO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIyID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2NvbXBvbmVudHMnKTtcblxudmFyIE1vZGFsQXBwQmFyID0gX1B5ZGlvJHJlcXVpcmVMaWIyLk1vZGFsQXBwQmFyO1xudmFyIEVtcHR5U3RhdGVWaWV3ID0gX1B5ZGlvJHJlcXVpcmVMaWIyLkVtcHR5U3RhdGVWaWV3O1xuXG52YXIgU2hhcmVWaWV3ID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFNoYXJlVmlldywgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBfY3JlYXRlQ2xhc3MoU2hhcmVWaWV3LCBbe1xuICAgICAgICBrZXk6ICdnZXRDaGlsZENvbnRleHQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0Q2hpbGRDb250ZXh0KCkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2VzID0gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaDtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZXM6IG1lc3NhZ2VzLFxuICAgICAgICAgICAgICAgIGdldE1lc3NhZ2U6IGZ1bmN0aW9uIGdldE1lc3NhZ2UobWVzc2FnZUlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuYW1lc3BhY2UgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAnc2hhcmVfY2VudGVyJyA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2VzW25hbWVzcGFjZSArIChuYW1lc3BhY2UgPyBcIi5cIiA6IFwiXCIpICsgbWVzc2FnZUlkXSB8fCBtZXNzYWdlSWQ7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlSWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGlzUmVhZG9ubHk6IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgZnVuY3Rpb24gU2hhcmVWaWV3KHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTaGFyZVZpZXcpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFNoYXJlVmlldy5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHJlc291cmNlczogW10sXG4gICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIHNlbGVjdGVkTW9kZWw6IG51bGwsXG4gICAgICAgICAgICBzaGFyZVR5cGU6IHByb3BzLmRlZmF1bHRTaGFyZVR5cGUgfHwgJ0xJTktTJ1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhTaGFyZVZpZXcsIFt7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudERpZE1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAgICAgdGhpcy5sb2FkKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2xvYWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbG9hZCgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuU2hhcmVTZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLlJlc3RMaXN0U2hhcmVkUmVzb3VyY2VzUmVxdWVzdCgpO1xuICAgICAgICAgICAgcmVxdWVzdC5TaGFyZVR5cGUgPSBfcHlkaW9IdHRwUmVzdEFwaS5MaXN0U2hhcmVkUmVzb3VyY2VzUmVxdWVzdExpc3RTaGFyZVR5cGUuY29uc3RydWN0RnJvbU9iamVjdCh0aGlzLnN0YXRlLnNoYXJlVHlwZSk7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5zdWJqZWN0KSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5TdWJqZWN0ID0gdGhpcy5wcm9wcy5zdWJqZWN0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0Lk93bmVkQnlTdWJqZWN0ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuICAgICAgICAgICAgYXBpLmxpc3RTaGFyZWRSZXNvdXJjZXMocmVxdWVzdCkudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyByZXNvdXJjZXM6IHJlcy5SZXNvdXJjZXMgfHwgW10sIGxvYWRpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgfSlbJ2NhdGNoJ10oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgbG9hZGluZzogZmFsc2UgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0TG9uZ2VzdFBhdGgnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0TG9uZ2VzdFBhdGgobm9kZSkge1xuICAgICAgICAgICAgaWYgKCFub2RlLkFwcGVhcnNJbikge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHBhdGg6IG5vZGUuUGF0aCwgYmFzZW5hbWU6IG5vZGUuUGF0aCB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHBhdGhzID0ge307XG4gICAgICAgICAgICBub2RlLkFwcGVhcnNJbi5tYXAoZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgICAgICBwYXRoc1thLlBhdGhdID0gYTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhwYXRocyk7XG4gICAgICAgICAgICBrZXlzLnNvcnQoKTtcbiAgICAgICAgICAgIHZhciBsb25nZXN0ID0ga2V5c1trZXlzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgdmFyIGxhYmVsID0gX3B5ZGlvVXRpbFBhdGgyWydkZWZhdWx0J10uZ2V0QmFzZW5hbWUobG9uZ2VzdCk7XG4gICAgICAgICAgICBpZiAoIWxhYmVsKSB7XG4gICAgICAgICAgICAgICAgbGFiZWwgPSBwYXRoc1tsb25nZXN0XS5Xc0xhYmVsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgcGF0aDogbG9uZ2VzdCwgYXBwZWFyc0luOiBwYXRoc1tsb25nZXN0XSwgYmFzZW5hbWU6IGxhYmVsIH07XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dvVG8nLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ29UbyhhcHBlYXJzSW4pIHtcbiAgICAgICAgICAgIHZhciBQYXRoID0gYXBwZWFyc0luLlBhdGg7XG4gICAgICAgICAgICB2YXIgV3NMYWJlbCA9IGFwcGVhcnNJbi5Xc0xhYmVsO1xuICAgICAgICAgICAgdmFyIFdzVXVpZCA9IGFwcGVhcnNJbi5Xc1V1aWQ7XG5cbiAgICAgICAgICAgIC8vIFJlbW92ZSBmaXJzdCBzZWdtZW50ICh3cyBzbHVnKVxuICAgICAgICAgICAgdmFyIHBhdGhlcyA9IFBhdGguc3BsaXQoJy8nKTtcbiAgICAgICAgICAgIHBhdGhlcy5zaGlmdCgpO1xuICAgICAgICAgICAgdmFyIHB5ZGlvTm9kZSA9IG5ldyBfcHlkaW9Nb2RlbE5vZGUyWydkZWZhdWx0J10ocGF0aGVzLmpvaW4oJy8nKSk7XG4gICAgICAgICAgICBweWRpb05vZGUuZ2V0TWV0YWRhdGEoKS5zZXQoJ3JlcG9zaXRvcnlfaWQnLCBXc1V1aWQpO1xuICAgICAgICAgICAgcHlkaW9Ob2RlLmdldE1ldGFkYXRhKCkuc2V0KCdyZXBvc2l0b3J5X2xhYmVsJywgV3NMYWJlbCk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLnB5ZGlvLmdvVG8ocHlkaW9Ob2RlKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25SZXF1ZXN0Q2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIHZhciBsb2FkaW5nID0gX3N0YXRlLmxvYWRpbmc7XG4gICAgICAgICAgICB2YXIgcmVzb3VyY2VzID0gX3N0YXRlLnJlc291cmNlcztcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gX3Byb3BzLnN0eWxlO1xuXG4gICAgICAgICAgICB2YXIgbSA9IGZ1bmN0aW9uIG0oaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci4nICsgaWRdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJlc291cmNlcy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgdmFyIGtBID0gYS5Ob2RlLlBhdGg7XG4gICAgICAgICAgICAgICAgdmFyIGtCID0gYi5Ob2RlLlBhdGg7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGtBID09PSBrQiA/IDAgOiBrQSA+IGtCID8gMSA6IC0xO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgZXh0ZW5zaW9ucyA9IHB5ZGlvLlJlZ2lzdHJ5LmdldEZpbGVzRXh0ZW5zaW9ucygpO1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHt9LCBzdHlsZSwgeyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nIH0pIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGJhY2tncm91bmRDb2xvcjogJyNGNUY1RjUnLCBib3JkZXJCb3R0b206ICcxcHggc29saWQgI0VFRUVFRScsIHBhZGRpbmc6ICczcHggMjBweCcsIGhlaWdodDogNTAgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlNlbGVjdEZpZWxkLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnNoYXJlVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUsIGksIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgc2hhcmVUeXBlOiB2IH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5sb2FkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5kZXJsaW5lU3R5bGU6IHsgZGlzcGxheTogJ25vbmUnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgd2lkdGg6IDE2MCB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgdmFsdWU6IFwiTElOS1NcIiwgcHJpbWFyeVRleHQ6IG0oMjQzKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHZhbHVlOiBcIkNFTExTXCIsIHByaW1hcnlUZXh0OiBtKDI1MCkgfSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbG9hZGluZyAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChMb2FkZXIsIHsgc3R5bGU6IHsgaGVpZ2h0OiAzMDAsIGZsZXg6IDEgfSB9KSxcbiAgICAgICAgICAgICAgICAhbG9hZGluZyAmJiByZXNvdXJjZXMubGVuZ3RoID09PSAwICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEVtcHR5U3RhdGVWaWV3LCB7XG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZTogXCJtZGkgbWRpLXNoYXJlLXZhcmlhbnRcIixcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeVRleHRJZDogbSgxMzEpLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBmbGV4OiAxLCBoZWlnaHQ6IDMwMCwgYmFja2dyb3VuZENvbG9yOiAndHJhbnNwYXJlbnQnIH1cbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAhbG9hZGluZyAmJiByZXNvdXJjZXMubGVuZ3RoID4gMCAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuTGlzdCxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmbGV4OiAxLCBtaW5IZWlnaHQ6IDMwMCwgb3ZlcmZsb3dZOiAnYXV0bycsIHBhZGRpbmdUb3A6IDAgfSB9LFxuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZXMubWFwKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfZ2V0TG9uZ2VzdFBhdGggPSBfdGhpczIuZ2V0TG9uZ2VzdFBhdGgocmVzLk5vZGUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXBwZWFyc0luID0gX2dldExvbmdlc3RQYXRoLmFwcGVhcnNJbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBiYXNlbmFtZSA9IF9nZXRMb25nZXN0UGF0aC5iYXNlbmFtZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGljb24gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmFzZW5hbWUuaW5kZXhPZignLicpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb24gPSAnbWRpIG1kaS1mb2xkZXInO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXh0ID0gX3B5ZGlvVXRpbFBhdGgyWydkZWZhdWx0J10uZ2V0RmlsZUV4dGVuc2lvbihiYXNlbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4dGVuc2lvbnMuaGFzKGV4dCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIF9leHRlbnNpb25zJGdldCA9IGV4dGVuc2lvbnMuZ2V0KGV4dCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZvbnRJY29uID0gX2V4dGVuc2lvbnMkZ2V0LmZvbnRJY29uO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb24gPSAnbWRpIG1kaS0nICsgZm9udEljb247XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbiA9ICdtZGkgbWRpLWZpbGUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5MaXN0SXRlbSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnlUZXh0OiBiYXNlbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlUZXh0OiByZXMuTGluayA/IG0oMjUxKSArICc6ICcgKyByZXMuTGluay5EZXNjcmlwdGlvbiA6IG0oMjg0KS5yZXBsYWNlKCclcycsIHJlcy5DZWxscy5sZW5ndGgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwZWFyc0luID8gX3RoaXMyLmdvVG8oYXBwZWFyc0luKSA6IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogIWFwcGVhcnNJbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0SWNvbjogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRm9udEljb24sIHsgY2xhc3NOYW1lOiBpY29uIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFNoYXJlVmlldztcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5TaGFyZVZpZXcuY2hpbGRDb250ZXh0VHlwZXMgPSB7XG4gICAgbWVzc2FnZXM6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0LFxuICAgIGdldE1lc3NhZ2U6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuYyxcbiAgICBpc1JlYWRvbmx5OiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmNcbn07XG5cbnZhciBTaGFyZVZpZXdNb2RhbCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdTaGFyZVZpZXdNb2RhbCcsXG5cbiAgICBtaXhpbnM6IFtBY3Rpb25EaWFsb2dNaXhpbl0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpYWxvZ1RpdGxlOiAnJyxcbiAgICAgICAgICAgIGRpYWxvZ1NpemU6ICdsZycsXG4gICAgICAgICAgICBkaWFsb2dQYWRkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGRpYWxvZ0lzTW9kYWw6IGZhbHNlLFxuICAgICAgICAgICAgZGlhbG9nU2Nyb2xsQm9keTogZmFsc2VcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgc3VibWl0OiBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICAgIHRoaXMuZGlzbWlzcygpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiAnMTAwJScsIGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicgfSB9LFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoTW9kYWxBcHBCYXIsIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFsnc2hhcmVfY2VudGVyLjk4J10sXG4gICAgICAgICAgICAgICAgc2hvd01lbnVJY29uQnV0dG9uOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lUmlnaHQ6ICdtZGkgbWRpLWNsb3NlJyxcbiAgICAgICAgICAgICAgICBvblJpZ2h0SWNvbkJ1dHRvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMy5kaXNtaXNzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChTaGFyZVZpZXcsIF9leHRlbmRzKHt9LCB0aGlzLnByb3BzLCB7IHN0eWxlOiB7IHdpZHRoOiAnMTAwJScsIGZsZXg6IDEgfSwgb25SZXF1ZXN0Q2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMzLmRpc21pc3MoKTtcbiAgICAgICAgICAgICAgICB9IH0pKVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbmV4cG9ydHMuU2hhcmVWaWV3ID0gU2hhcmVWaWV3O1xuZXhwb3J0cy5TaGFyZVZpZXdNb2RhbCA9IFNoYXJlVmlld01vZGFsO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lciA9IHJlcXVpcmUoJy4uL1NoYXJlQ29udGV4dENvbnN1bWVyJyk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU2hhcmVDb250ZXh0Q29uc3VtZXIpO1xuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgQ29tcG9uZW50ID0gX3JlcXVpcmUuQ29tcG9uZW50O1xudmFyIFByb3BUeXBlcyA9IF9yZXF1aXJlLlByb3BUeXBlcztcblxudmFyIF9yZXF1aXJlMiA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBJY29uQnV0dG9uID0gX3JlcXVpcmUyLkljb25CdXR0b247XG5cbnZhciBfcmVxdWlyZTMgPSByZXF1aXJlKCdtYXRlcmlhbC11aS9zdHlsZXMnKTtcblxudmFyIG11aVRoZW1lYWJsZSA9IF9yZXF1aXJlMy5tdWlUaGVtZWFibGU7XG5cbnZhciBBY3Rpb25CdXR0b24gPSAoZnVuY3Rpb24gKF9Db21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoQWN0aW9uQnV0dG9uLCBfQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIEFjdGlvbkJ1dHRvbigpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEFjdGlvbkJ1dHRvbik7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoQWN0aW9uQnV0dG9uLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEFjdGlvbkJ1dHRvbiwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBwYWxldHRlID0gdGhpcy5wcm9wcy5tdWlUaGVtZS5wYWxldHRlO1xuXG4gICAgICAgICAgICB2YXIgc3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgcm9vdDoge1xuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc1MCUnLFxuICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgJyArIHBhbGV0dGUucHJpbWFyeTFDb2xvcixcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMzYsIGhlaWdodDogMzYsXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IDgsXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzAgNnB4JyxcbiAgICAgICAgICAgICAgICAgICAgekluZGV4OiAwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpY29uOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBwYWxldHRlLnByaW1hcnkxQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodDogJzIwcHgnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoSWNvbkJ1dHRvbiwge1xuICAgICAgICAgICAgICAgIHN0eWxlOiBzdHlsZS5yb290LFxuICAgICAgICAgICAgICAgIGljb25TdHlsZTogc3R5bGUuaWNvbixcbiAgICAgICAgICAgICAgICBvblRvdWNoVGFwOiB0aGlzLnByb3BzLmNhbGxiYWNrIHx8IHRoaXMucHJvcHMub25Ub3VjaFRhcCxcbiAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lOiBcIm1kaSBtZGktXCIgKyB0aGlzLnByb3BzLm1kaUljb24sXG4gICAgICAgICAgICAgICAgdG9vbHRpcDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKHRoaXMucHJvcHMubWVzc2FnZUlkLCB0aGlzLnByb3BzLm1lc3NhZ2VDb3JlTmFtZXNwYWNlID8gJycgOiB1bmRlZmluZWQpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBBY3Rpb25CdXR0b247XG59KShDb21wb25lbnQpO1xuXG5BY3Rpb25CdXR0b24ucHJvcFR5cGVzID0ge1xuICAgIGNhbGxiYWNrOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvblRvdWNoVGFwOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBtZGlJY29uOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIG1lc3NhZ2VJZDogUHJvcFR5cGVzLnN0cmluZ1xufTtcblxuQWN0aW9uQnV0dG9uID0gKDAsIF9TaGFyZUNvbnRleHRDb25zdW1lcjJbJ2RlZmF1bHQnXSkoQWN0aW9uQnV0dG9uKTtcbkFjdGlvbkJ1dHRvbiA9IG11aVRoZW1lYWJsZSgpKEFjdGlvbkJ1dHRvbik7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEFjdGlvbkJ1dHRvbjtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9tYXRlcmlhbFVpU3R5bGVzID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWkvc3R5bGVzJyk7XG5cbnZhciBnbG9iYWxTdHlsZXMgPSB7XG4gICAgZ2xvYmFsTGVmdE1hcmdpbjogNjRcbn07XG5cbnZhciBHZW5lcmljTGluZSA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhHZW5lcmljTGluZSwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBHZW5lcmljTGluZSgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEdlbmVyaWNMaW5lKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihHZW5lcmljTGluZS5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhHZW5lcmljTGluZSwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIGljb25DbGFzc05hbWUgPSBfcHJvcHMuaWNvbkNsYXNzTmFtZTtcbiAgICAgICAgICAgIHZhciBsZWdlbmQgPSBfcHJvcHMubGVnZW5kO1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBfcHJvcHMuZGF0YTtcbiAgICAgICAgICAgIHZhciBkYXRhU3R5bGUgPSBfcHJvcHMuZGF0YVN0eWxlO1xuICAgICAgICAgICAgdmFyIGxlZ2VuZFN0eWxlID0gX3Byb3BzLmxlZ2VuZFN0eWxlO1xuICAgICAgICAgICAgdmFyIGljb25TdHlsZSA9IF9wcm9wcy5pY29uU3R5bGU7XG5cbiAgICAgICAgICAgIHZhciBzdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBpY29uOiBfZXh0ZW5kcyh7XG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzE2cHggMjBweCAwJ1xuICAgICAgICAgICAgICAgIH0sIGljb25TdHlsZSksXG4gICAgICAgICAgICAgICAgbGVnZW5kOiBfZXh0ZW5kcyh7XG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjYWFhYWFhJyxcbiAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogNTAwLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0VHJhbnNmb3JtOiAnbG93ZXJjYXNlJ1xuICAgICAgICAgICAgICAgIH0sIGxlZ2VuZFN0eWxlKSxcbiAgICAgICAgICAgICAgICBkYXRhOiBfZXh0ZW5kcyh7XG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxNSxcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZ1JpZ2h0OiA2LFxuICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgICAgICAgICAgICAgICAgIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJ1xuICAgICAgICAgICAgICAgIH0sIGRhdGFTdHlsZSlcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogX2V4dGVuZHMoeyBkaXNwbGF5OiAnZmxleCcsIG1hcmdpbkJvdHRvbTogOCwgb3ZlcmZsb3c6ICdoaWRkZW4nIH0sIHRoaXMucHJvcHMuc3R5bGUpIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiBnbG9iYWxTdHlsZXMuZ2xvYmFsTGVmdE1hcmdpbiB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNvbG9yOiAnI2FhYWFhYScsIGNsYXNzTmFtZTogaWNvbkNsYXNzTmFtZSwgc3R5bGU6IHN0eWxlLmljb24gfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlLmxlZ2VuZCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGVnZW5kXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBzdHlsZS5kYXRhIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEdlbmVyaWNMaW5lO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbnZhciBHZW5lcmljQ2FyZCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudDIpIHtcbiAgICBfaW5oZXJpdHMoR2VuZXJpY0NhcmQsIF9SZWFjdCRDb21wb25lbnQyKTtcblxuICAgIGZ1bmN0aW9uIEdlbmVyaWNDYXJkKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgR2VuZXJpY0NhcmQpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEdlbmVyaWNDYXJkLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEdlbmVyaWNDYXJkLCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHRpdGxlID0gX3Byb3BzMi50aXRsZTtcbiAgICAgICAgICAgIHZhciBvbkRpc21pc3NBY3Rpb24gPSBfcHJvcHMyLm9uRGlzbWlzc0FjdGlvbjtcbiAgICAgICAgICAgIHZhciBvbkVkaXRBY3Rpb24gPSBfcHJvcHMyLm9uRWRpdEFjdGlvbjtcbiAgICAgICAgICAgIHZhciBvbkRlbGV0ZUFjdGlvbiA9IF9wcm9wczIub25EZWxldGVBY3Rpb247XG4gICAgICAgICAgICB2YXIgbW9yZU1lbnVJdGVtcyA9IF9wcm9wczIubW9yZU1lbnVJdGVtcztcbiAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IF9wcm9wczIuY2hpbGRyZW47XG4gICAgICAgICAgICB2YXIgbXVpVGhlbWUgPSBfcHJvcHMyLm11aVRoZW1lO1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gX3Byb3BzMi5zdHlsZTtcbiAgICAgICAgICAgIHZhciBoZWFkZXJTbWFsbCA9IF9wcm9wczIuaGVhZGVyU21hbGw7XG4gICAgICAgICAgICB2YXIgcHJpbWFyeTFDb2xvciA9IG11aVRoZW1lLnBhbGV0dGUucHJpbWFyeTFDb2xvcjtcblxuICAgICAgICAgICAgdmFyIHN0eWxlcyA9IHtcbiAgICAgICAgICAgICAgICBoZWFkZXJIZWlnaHQ6IDEwMCxcbiAgICAgICAgICAgICAgICBidXR0b25CYXJIZWlnaHQ6IDYwLFxuICAgICAgICAgICAgICAgIGZhYlRvcDogODAsXG4gICAgICAgICAgICAgICAgYnV0dG9uOiB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgaWNvblN0eWxlOiB7IGNvbG9yOiAnd2hpdGUnIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKGhlYWRlclNtYWxsKSB7XG4gICAgICAgICAgICAgICAgc3R5bGVzID0ge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXJIZWlnaHQ6IDgwLFxuICAgICAgICAgICAgICAgICAgICBidXR0b25CYXJIZWlnaHQ6IDQwLFxuICAgICAgICAgICAgICAgICAgICBmYWJUb3A6IDYwLFxuICAgICAgICAgICAgICAgICAgICBidXR0b246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IHdpZHRoOiAzOCwgaGVpZ2h0OiAzOCwgcGFkZGluZzogOSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvblN0eWxlOiB7IGNvbG9yOiAnd2hpdGUnLCBmb250U2l6ZTogMTggfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBhcGVyLFxuICAgICAgICAgICAgICAgIHsgekRlcHRoOiAwLCBzdHlsZTogX2V4dGVuZHMoeyB3aWR0aDogJzEwMCUnLCBwb3NpdGlvbjogJ3JlbGF0aXZlJyB9LCBzdHlsZSkgfSxcbiAgICAgICAgICAgICAgICBvbkVkaXRBY3Rpb24gJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLkZsb2F0aW5nQWN0aW9uQnV0dG9uLFxuICAgICAgICAgICAgICAgICAgICB7IG9uVG91Y2hUYXA6IG9uRWRpdEFjdGlvbiwgbWluaTogdHJ1ZSwgc3R5bGU6IHsgcG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogc3R5bGVzLmZhYlRvcCwgbGVmdDogMTAgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBjbGFzc05hbWU6IFwibWRpIG1kaS1wZW5jaWxcIiB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBhcGVyLFxuICAgICAgICAgICAgICAgICAgICB7IHpEZXB0aDogMCwgc3R5bGU6IHsgYmFja2dyb3VuZENvbG9yOiBwcmltYXJ5MUNvbG9yLCBjb2xvcjogJ3doaXRlJywgaGVpZ2h0OiBzdHlsZXMuaGVhZGVySGVpZ2h0LCBib3JkZXJSYWRpdXM6ICcycHggMnB4IDAgMCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGhlaWdodDogc3R5bGVzLmJ1dHRvbkJhckhlaWdodCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgc3R5bGU6IHsgZmxleDogMSB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25EZWxldGVBY3Rpb24gJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBzdHlsZTogc3R5bGVzLmJ1dHRvbi5zdHlsZSwgaWNvblN0eWxlOiBzdHlsZXMuYnV0dG9uLmljb25TdHlsZSwgaWNvbkNsYXNzTmFtZTogXCJtZGkgbWRpLWRlbGV0ZVwiLCBvblRvdWNoVGFwOiBvbkRlbGV0ZUFjdGlvbiB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcmVNZW51SXRlbXMgJiYgbW9yZU1lbnVJdGVtcy5sZW5ndGggPiAwICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLkljb25NZW51LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiB7IHZlcnRpY2FsOiAndG9wJywgaG9yaXpvbnRhbDogaGVhZGVyU21hbGwgPyAncmlnaHQnIDogJ2xlZnQnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE9yaWdpbjogeyB2ZXJ0aWNhbDogJ3RvcCcsIGhvcml6b250YWw6IGhlYWRlclNtYWxsID8gJ3JpZ2h0JyA6ICdsZWZ0JyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQnV0dG9uRWxlbWVudDogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBzdHlsZTogc3R5bGVzLmJ1dHRvbi5zdHlsZSwgaWNvblN0eWxlOiBzdHlsZXMuYnV0dG9uLmljb25TdHlsZSwgaWNvbkNsYXNzTmFtZTogXCJtZGkgbWRpLWRvdHMtdmVydGljYWxcIiB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9yZU1lbnVJdGVtc1xuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRGlzbWlzc0FjdGlvbiAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IHN0eWxlOiBzdHlsZXMuYnV0dG9uLnN0eWxlLCBpY29uU3R5bGU6IHN0eWxlcy5idXR0b24uaWNvblN0eWxlLCBpY29uQ2xhc3NOYW1lOiBcIm1kaSBtZGktY2xvc2VcIiwgb25Ub3VjaFRhcDogb25EaXNtaXNzQWN0aW9uIH0pXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmdMZWZ0OiBvbkVkaXRBY3Rpb24gPyBnbG9iYWxTdHlsZXMuZ2xvYmFsTGVmdE1hcmdpbiA6IDIwLCBmb250U2l6ZTogMjAgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGVcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmdUb3A6IDEyLCBwYWRkaW5nQm90dG9tOiA4IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEdlbmVyaWNDYXJkO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHMuR2VuZXJpY0NhcmQgPSBHZW5lcmljQ2FyZCA9ICgwLCBfbWF0ZXJpYWxVaVN0eWxlcy5tdWlUaGVtZWFibGUpKCkoR2VuZXJpY0NhcmQpO1xuZXhwb3J0cy5HZW5lcmljQ2FyZCA9IEdlbmVyaWNDYXJkO1xuZXhwb3J0cy5HZW5lcmljTGluZSA9IEdlbmVyaWNMaW5lO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9tYXRlcmlhbFVpU3R5bGVzID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWkvc3R5bGVzJyk7XG5cbnZhciBFZGl0b3JUYWIgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoRWRpdG9yVGFiLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIEVkaXRvclRhYigpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEVkaXRvclRhYik7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoRWRpdG9yVGFiLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEVkaXRvclRhYiwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHRhYnMgPSBfcHJvcHMudGFicztcbiAgICAgICAgICAgIHZhciBhY3RpdmUgPSBfcHJvcHMuYWN0aXZlO1xuICAgICAgICAgICAgdmFyIG9uQ2hhbmdlID0gX3Byb3BzLm9uQ2hhbmdlO1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gX3Byb3BzLnN0eWxlO1xuICAgICAgICAgICAgdmFyIG11aVRoZW1lID0gX3Byb3BzLm11aVRoZW1lO1xuICAgICAgICAgICAgdmFyIHByaW1hcnkxQ29sb3IgPSBtdWlUaGVtZS5wYWxldHRlLnByaW1hcnkxQ29sb3I7XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7IGRpc3BsYXk6ICdmbGV4JyB9LCBzdHlsZSkgfSxcbiAgICAgICAgICAgICAgICB0YWJzLm1hcChmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXNBY3RpdmUgPSB0LlZhbHVlID09PSBhY3RpdmU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGxhYmVsOiB0LkxhYmVsLCBvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2UodC5WYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBwcmltYXJ5OiBpc0FjdGl2ZSwgc3R5bGU6IGlzQWN0aXZlID8geyBib3JkZXJCb3R0b206ICcycHggc29saWQgJyArIHByaW1hcnkxQ29sb3IgfSA6IHsgYm9yZGVyQm90dG9tOiAwIH0gfSk7XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IHN0eWxlOiB7IGZsZXg6IDEgfSB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBFZGl0b3JUYWI7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuRWRpdG9yVGFiID0gKDAsIF9tYXRlcmlhbFVpU3R5bGVzLm11aVRoZW1lYWJsZSkoKShFZGl0b3JUYWIpO1xuXG52YXIgRWRpdG9yVGFiQ29udGVudCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudDIpIHtcbiAgICBfaW5oZXJpdHMoRWRpdG9yVGFiQ29udGVudCwgX1JlYWN0JENvbXBvbmVudDIpO1xuXG4gICAgZnVuY3Rpb24gRWRpdG9yVGFiQ29udGVudCgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEVkaXRvclRhYkNvbnRlbnQpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEVkaXRvclRhYkNvbnRlbnQucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRWRpdG9yVGFiQ29udGVudCwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciB0YWJzID0gX3Byb3BzMi50YWJzO1xuICAgICAgICAgICAgdmFyIGFjdGl2ZSA9IF9wcm9wczIuYWN0aXZlO1xuXG4gICAgICAgICAgICB2YXIgYWN0aXZlQ29udGVudCA9IG51bGw7XG4gICAgICAgICAgICB0YWJzLm1hcChmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgICAgIGlmICh0LlZhbHVlID09PSBhY3RpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlQ29udGVudCA9IHQuQ29tcG9uZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGFjdGl2ZUNvbnRlbnQ7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gRWRpdG9yVGFiQ29udGVudDtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG52YXIgR2VuZXJpY0VkaXRvciA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudDMpIHtcbiAgICBfaW5oZXJpdHMoR2VuZXJpY0VkaXRvciwgX1JlYWN0JENvbXBvbmVudDMpO1xuXG4gICAgZnVuY3Rpb24gR2VuZXJpY0VkaXRvcihwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgR2VuZXJpY0VkaXRvcik7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoR2VuZXJpY0VkaXRvci5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGxlZnQ6IHByb3BzLnRhYnMubGVmdC5sZW5ndGggPyBwcm9wcy50YWJzLmxlZnRbMF0uVmFsdWUgOiAnJyxcbiAgICAgICAgICAgIHJpZ2h0OiBwcm9wcy50YWJzLnJpZ2h0Lmxlbmd0aCA/IHByb3BzLnRhYnMucmlnaHRbMF0uVmFsdWUgOiAnJ1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhHZW5lcmljRWRpdG9yLCBbe1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMocHJvcHMpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5sZWZ0ICYmIHByb3BzLnRhYnMubGVmdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbGVmdDogcHJvcHMudGFicy5sZWZ0WzBdLlZhbHVlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnJpZ2h0ICYmIHByb3BzLnRhYnMucmlnaHQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHJpZ2h0OiBwcm9wcy50YWJzLnJpZ2h0WzBdLlZhbHVlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIF9wcm9wczMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHRhYnMgPSBfcHJvcHMzLnRhYnM7XG4gICAgICAgICAgICB2YXIgaGVhZGVyID0gX3Byb3BzMy5oZWFkZXI7XG4gICAgICAgICAgICB2YXIgb25TYXZlQWN0aW9uID0gX3Byb3BzMy5vblNhdmVBY3Rpb247XG4gICAgICAgICAgICB2YXIgb25DbG9zZUFjdGlvbiA9IF9wcm9wczMub25DbG9zZUFjdGlvbjtcbiAgICAgICAgICAgIHZhciBvblJldmVydEFjdGlvbiA9IF9wcm9wczMub25SZXZlcnRBY3Rpb247XG4gICAgICAgICAgICB2YXIgc2F2ZUVuYWJsZWQgPSBfcHJvcHMzLnNhdmVFbmFibGVkO1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gX3Byb3BzMy5zdHlsZTtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wczMucHlkaW87XG4gICAgICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIHZhciBsZWZ0ID0gX3N0YXRlLmxlZnQ7XG4gICAgICAgICAgICB2YXIgcmlnaHQgPSBfc3RhdGUucmlnaHQ7XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGhlaWdodDogJzEwMCUnIH0sIHN0eWxlKSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIHBhZGRpbmc6ICcxMHB4IDIwcHggMjBweCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmbGV4OiAxLCBwYWRkaW5nUmlnaHQ6IDIwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlclxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nVG9wOiAxMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWlzZWRCdXR0b24sIHsgZGlzYWJsZWQ6ICFzYXZlRW5hYmxlZCwgcHJpbWFyeTogdHJ1ZSwgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWyc1MyddLCBvblRvdWNoVGFwOiBvblNhdmVBY3Rpb24gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGRpc2FibGVkOiAhc2F2ZUVuYWJsZWQsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnNjI4J10sIG9uVG91Y2hUYXA6IG9uUmV2ZXJ0QWN0aW9uLCBzdHlsZTogeyBtYXJnaW5MZWZ0OiAxMCB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBpY29uQ2xhc3NOYW1lOiBcIm1kaSBtZGktY2xvc2VcIiwgdG9vbHRpcDogcHlkaW8uTWVzc2FnZUhhc2hbJzg2J10sIG9uVG91Y2hUYXA6IG9uQ2xvc2VBY3Rpb24sIHN0eWxlOiB7IG1hcmdpbkxlZnQ6IDEwIH0gfSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEVkaXRvclRhYiwgeyB0YWJzOiB0YWJzLmxlZnQsIGFjdGl2ZTogbGVmdCwgc3R5bGU6IHsgZmxleDogMSB9LCBvbkNoYW5nZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBsZWZ0OiB2YWx1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gfSksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEVkaXRvclRhYiwgeyB0YWJzOiB0YWJzLnJpZ2h0LCBhY3RpdmU6IHJpZ2h0LCBzdHlsZTogeyBmbGV4OiAxIH0sIG9uQ2hhbmdlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IHJpZ2h0OiB2YWx1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIG51bGwpLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZsZXg6IDEgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogX2V4dGVuZHMoeyBvdmVyZmxvd1k6ICdhdXRvJywgd2lkdGg6ICc1MCUnLCBib3JkZXJSaWdodDogJzFweCBzb2xpZCAjZTBlMGUwJywgaGVpZ2h0OiAnMTAwJScsIHBhZGRpbmc6IDEwIH0sIHRhYnMubGVmdFN0eWxlKSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoRWRpdG9yVGFiQ29udGVudCwgeyB0YWJzOiB0YWJzLmxlZnQsIGFjdGl2ZTogbGVmdCB9KVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogX2V4dGVuZHMoeyBvdmVyZmxvd1k6ICdhdXRvJywgd2lkdGg6ICc1MCUnLCBoZWlnaHQ6ICcxMDAlJywgcGFkZGluZzogMTAgfSwgdGFicy5yaWdodFN0eWxlKSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoRWRpdG9yVGFiQ29udGVudCwgeyB0YWJzOiB0YWJzLnJpZ2h0LCBhY3RpdmU6IHJpZ2h0IH0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEdlbmVyaWNFZGl0b3I7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gR2VuZXJpY0VkaXRvcjtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX2NvbXBvc2l0ZUNvbXBvc2l0ZUNhcmQgPSByZXF1aXJlKCcuLi9jb21wb3NpdGUvQ29tcG9zaXRlQ2FyZCcpO1xuXG52YXIgX2NvbXBvc2l0ZUNvbXBvc2l0ZUNhcmQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY29tcG9zaXRlQ29tcG9zaXRlQ2FyZCk7XG5cbnZhciBfY2VsbHNDZWxsQ2FyZCA9IHJlcXVpcmUoJy4uL2NlbGxzL0NlbGxDYXJkJyk7XG5cbnZhciBfY2VsbHNDZWxsQ2FyZDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jZWxsc0NlbGxDYXJkKTtcblxudmFyIEluZm9QYW5lbCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhJbmZvUGFuZWwsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gSW5mb1BhbmVsKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBJbmZvUGFuZWwpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEluZm9QYW5lbC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHsgcG9wb3Zlck9wZW46IGZhbHNlIH07XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEluZm9QYW5lbCwgW3tcbiAgICAgICAga2V5OiAnb3BlblBvcG92ZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb3BlblBvcG92ZXIoZXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwb3BvdmVyT3BlbjogdHJ1ZSwgcG9wb3ZlckFuY2hvcjogZXZlbnQudGFyZ2V0IH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMucHlkaW87XG4gICAgICAgICAgICB2YXIgbm9kZSA9IF9wcm9wcy5ub2RlO1xuXG4gICAgICAgICAgICBpZiAobm9kZS5pc1Jvb3QoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgUHlkaW9Xb3Jrc3BhY2VzLkluZm9QYW5lbENhcmQsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmc6IDAgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX2NlbGxzQ2VsbENhcmQyWydkZWZhdWx0J10sIHsgY2VsbElkOiBweWRpby51c2VyLmFjdGl2ZVJlcG9zaXRvcnksIHB5ZGlvOiBweWRpbywgbW9kZTogJ2luZm9QYW5lbCcgfSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgUHlkaW9Xb3Jrc3BhY2VzLkluZm9QYW5lbENhcmQsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmc6IDAgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX2NvbXBvc2l0ZUNvbXBvc2l0ZUNhcmQyWydkZWZhdWx0J10sIHsgbm9kZTogbm9kZSwgcHlkaW86IHB5ZGlvLCBtb2RlOiAnaW5mb1BhbmVsJyB9KVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBJbmZvUGFuZWw7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gSW5mb1BhbmVsO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbnZhciBfcHlkaW9VdGlsWG1sID0gcmVxdWlyZSgncHlkaW8vdXRpbC94bWwnKTtcblxudmFyIF9weWRpb1V0aWxYbWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9VdGlsWG1sKTtcblxudmFyIF9weWRpb0h0dHBBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL2FwaScpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb0h0dHBBcGkpO1xuXG52YXIgX3B5ZGlvSHR0cFJlc3RBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL3Jlc3QtYXBpJyk7XG5cbnZhciBTaGFyZUhlbHBlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU2hhcmVIZWxwZXIoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTaGFyZUhlbHBlcik7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFNoYXJlSGVscGVyLCBudWxsLCBbe1xuICAgICAgICBrZXk6ICdnZXRBdXRob3JpemF0aW9ucycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRBdXRob3JpemF0aW9ucyhweWRpbykge1xuXG4gICAgICAgICAgICB2YXIgcGx1Z2luQ29uZmlncyA9IHB5ZGlvLmdldFBsdWdpbkNvbmZpZ3MoXCJhY3Rpb24uc2hhcmVcIik7XG4gICAgICAgICAgICB2YXIgYXV0aG9yaXphdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgZm9sZGVyX3B1YmxpY19saW5rOiBwbHVnaW5Db25maWdzLmdldChcIkVOQUJMRV9GT0xERVJfUFVCTElDX0xJTktcIiksXG4gICAgICAgICAgICAgICAgZm9sZGVyX3dvcmtzcGFjZXM6IHBsdWdpbkNvbmZpZ3MuZ2V0KFwiRU5BQkxFX0ZPTERFUl9JTlRFUk5BTF9TSEFSSU5HXCIpLFxuICAgICAgICAgICAgICAgIGZpbGVfcHVibGljX2xpbms6IHBsdWdpbkNvbmZpZ3MuZ2V0KFwiRU5BQkxFX0ZJTEVfUFVCTElDX0xJTktcIiksXG4gICAgICAgICAgICAgICAgZmlsZV93b3Jrc3BhY2VzOiBwbHVnaW5Db25maWdzLmdldChcIkVOQUJMRV9GSUxFX0lOVEVSTkFMX1NIQVJJTkdcIiksXG4gICAgICAgICAgICAgICAgZWRpdGFibGVfaGFzaDogcGx1Z2luQ29uZmlncy5nZXQoXCJIQVNIX1VTRVJfRURJVEFCTEVcIiksXG4gICAgICAgICAgICAgICAgcGFzc3dvcmRfbWFuZGF0b3J5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBtYXhfZXhwaXJhdGlvbjogcGx1Z2luQ29uZmlncy5nZXQoXCJGSUxFX01BWF9FWFBJUkFUSU9OXCIpLFxuICAgICAgICAgICAgICAgIG1heF9kb3dubG9hZHM6IHBsdWdpbkNvbmZpZ3MuZ2V0KFwiRklMRV9NQVhfRE9XTkxPQURcIilcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgcGFzc01hbmRhdG9yeSA9IHBsdWdpbkNvbmZpZ3MuZ2V0KFwiU0hBUkVfRk9SQ0VfUEFTU1dPUkRcIik7XG4gICAgICAgICAgICBpZiAocGFzc01hbmRhdG9yeSkge1xuICAgICAgICAgICAgICAgIGF1dGhvcml6YXRpb25zLnBhc3N3b3JkX21hbmRhdG9yeSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhdXRob3JpemF0aW9ucy5wYXNzd29yZF9wbGFjZWhvbGRlciA9IHBhc3NNYW5kYXRvcnkgPyBweWRpby5NZXNzYWdlSGFzaFsnc2hhcmVfY2VudGVyLjE3NiddIDogcHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci4xNDgnXTtcbiAgICAgICAgICAgIHJldHVybiBhdXRob3JpemF0aW9ucztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnYnVpbGRQdWJsaWNVcmwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gYnVpbGRQdWJsaWNVcmwocHlkaW8sIGxpbmtIYXNoKSB7XG4gICAgICAgICAgICB2YXIgc2hvcnRGb3JtID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBhcmd1bWVudHNbMl07XG5cbiAgICAgICAgICAgIHZhciBwbHVnaW5Db25maWdzID0gcHlkaW8uUGFyYW1ldGVycztcbiAgICAgICAgICAgIGlmIChzaG9ydEZvcm0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJy4uLicgKyBwbHVnaW5Db25maWdzLmdldCgnUFVCTElDX0JBU0VVUkknKSArICcvJyArIGxpbmtIYXNoO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGx1Z2luQ29uZmlncy5nZXQoJ0ZST05URU5EX1VSTCcpICsgcGx1Z2luQ29uZmlncy5nZXQoJ1BVQkxJQ19CQVNFVVJJJykgKyAnLycgKyBsaW5rSGFzaDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gcHlkaW8ge1B5ZGlvfVxuICAgICAgICAgKiBAcGFyYW0gbm9kZSB7QWp4cE5vZGV9XG4gICAgICAgICAqIEByZXR1cm4ge3twcmV2aWV3OiBib29sZWFuLCB3cml0ZWFibGU6IGJvb2xlYW59fVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ25vZGVIYXNFZGl0b3InLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbm9kZUhhc0VkaXRvcihweWRpbywgbm9kZSkge1xuICAgICAgICAgICAgaWYgKCFub2RlLmdldE1ldGFkYXRhKCkuaGFzKCdtaW1lX2hhc19wcmV2aWV3X2VkaXRvcicpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVkaXRvcnMgPSBweWRpby5SZWdpc3RyeS5maW5kRWRpdG9yc0Zvck1pbWUobm9kZS5nZXRBanhwTWltZSgpKTtcbiAgICAgICAgICAgICAgICBlZGl0b3JzID0gZWRpdG9ycy5maWx0ZXIoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGUuaWQgIT09ICdlZGl0b3IuYnJvd3NlcicgJiYgZS5pZCAhPT0gJ2VkaXRvci5vdGhlcic7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdmFyIHdyaXRlYWJsZSA9IGVkaXRvcnMuZmlsdGVyKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlLmNhbldyaXRlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIG5vZGUuZ2V0TWV0YWRhdGEoKS5zZXQoXCJtaW1lX2hhc19wcmV2aWV3X2VkaXRvclwiLCBlZGl0b3JzLmxlbmd0aCA+IDApO1xuICAgICAgICAgICAgICAgIG5vZGUuZ2V0TWV0YWRhdGEoKS5zZXQoXCJtaW1lX2hhc193cml0ZWFibGVfZWRpdG9yXCIsIHdyaXRlYWJsZS5sZW5ndGggPiAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcHJldmlldzogbm9kZS5nZXRNZXRhZGF0YSgpLmdldChcIm1pbWVfaGFzX3ByZXZpZXdfZWRpdG9yXCIpLFxuICAgICAgICAgICAgICAgIHdyaXRlYWJsZTogbm9kZS5nZXRNZXRhZGF0YSgpLmdldChcIm1pbWVfaGFzX3dyaXRlYWJsZV9lZGl0b3JcIilcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHB5ZGlvIHtQeWRpb31cbiAgICAgICAgICogQHBhcmFtIGxpbmtNb2RlbCB7Q29tcG9zaXRlTW9kZWx9XG4gICAgICAgICAqIEByZXR1cm4geyp9XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcGlsZUxheW91dERhdGEnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcGlsZUxheW91dERhdGEocHlkaW8sIGxpbmtNb2RlbCkge1xuXG4gICAgICAgICAgICAvLyBTZWFyY2ggcmVnaXN0cnkgZm9yIHRlbXBsYXRlIG5vZGVzIHN0YXJ0aW5nIHdpdGggbWluaXNpdGVfXG4gICAgICAgICAgICB2YXIgdG1wbCA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBjdXJyZW50RXh0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdmFyIG5vZGUgPSBsaW5rTW9kZWwuZ2V0Tm9kZSgpO1xuICAgICAgICAgICAgaWYgKG5vZGUuaXNMZWFmKCkpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50RXh0ID0gbm9kZS5nZXRBanhwTWltZSgpO1xuICAgICAgICAgICAgICAgIHRtcGwgPSBfcHlkaW9VdGlsWG1sMlsnZGVmYXVsdCddLlhQYXRoU2VsZWN0Tm9kZXMocHlkaW8uZ2V0WG1sUmVnaXN0cnkoKSwgXCIvL3RlbXBsYXRlW2NvbnRhaW5zKEBuYW1lLCAndW5pcXVlX3ByZXZpZXdfJyldXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0bXBsID0gX3B5ZGlvVXRpbFhtbDJbJ2RlZmF1bHQnXS5YUGF0aFNlbGVjdE5vZGVzKHB5ZGlvLmdldFhtbFJlZ2lzdHJ5KCksIFwiLy90ZW1wbGF0ZVtjb250YWlucyhAbmFtZSwgJ21pbmlzaXRlXycpXVwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0bXBsLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0bXBsLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBbeyBMQVlPVVRfTkFNRTogdG1wbFswXS5nZXRBdHRyaWJ1dGUoJ2VsZW1lbnQnKSwgTEFZT1VUX0xBQkVMOiAnJyB9XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBjcnRUaGVtZSA9IHB5ZGlvLlBhcmFtZXRlcnMuZ2V0KCd0aGVtZScpO1xuICAgICAgICAgICAgdmFyIHZhbHVlcyA9IFtdO1xuICAgICAgICAgICAgdG1wbC5tYXAoZnVuY3Rpb24gKHhtbE5vZGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGhlbWUgPSB4bWxOb2RlLmdldEF0dHJpYnV0ZSgndGhlbWUnKTtcbiAgICAgICAgICAgICAgICBpZiAodGhlbWUgJiYgdGhlbWUgIT09IGNydFRoZW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSB4bWxOb2RlLmdldEF0dHJpYnV0ZSgnZWxlbWVudCcpO1xuICAgICAgICAgICAgICAgIHZhciBuYW1lID0geG1sTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWwgPSB4bWxOb2RlLmdldEF0dHJpYnV0ZSgnbGFiZWwnKTtcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudEV4dCAmJiBuYW1lID09PSBcInVuaXF1ZV9wcmV2aWV3X2ZpbGVcIiAmJiAhU2hhcmVIZWxwZXIubm9kZUhhc0VkaXRvcihweWRpbywgbm9kZSkucHJldmlldykge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZ25vcmUgdGhpcyB0ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChsYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoTWVzc2FnZUhhc2hbbGFiZWxdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IE1lc3NhZ2VIYXNoW2xhYmVsXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsID0geG1sTm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFsdWVzW25hbWVdID0gZWxlbWVudDtcbiAgICAgICAgICAgICAgICB2YWx1ZXMucHVzaCh7IExBWU9VVF9OQU1FOiBuYW1lLCBMQVlPVVRfRUxFTUVOVDogZWxlbWVudCwgTEFZT1VUX0xBQkVMOiBsYWJlbCB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZm9yY2VNYWlsZXJPbGRTY2hvb2wnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZm9yY2VNYWlsZXJPbGRTY2hvb2woKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2xvYmFsLnB5ZGlvLmdldFBsdWdpbkNvbmZpZ3MoXCJhY3Rpb24uc2hhcmVcIikuZ2V0KFwiRU1BSUxfSU5WSVRFX0VYVEVSTkFMXCIpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdxcmNvZGVFbmFibGVkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHFyY29kZUVuYWJsZWQoKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2xvYmFsLnB5ZGlvLmdldFBsdWdpbkNvbmZpZ3MoXCJhY3Rpb24uc2hhcmVcIikuZ2V0KFwiQ1JFQVRFX1FSQ09ERVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gbm9kZVxuICAgICAgICAgKiBAcGFyYW0gY2VsbE1vZGVsXG4gICAgICAgICAqIEBwYXJhbSB0YXJnZXRVc2Vyc1xuICAgICAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzZW5kQ2VsbEludml0YXRpb24nLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2VuZENlbGxJbnZpdGF0aW9uKG5vZGUsIGNlbGxNb2RlbCwgdGFyZ2V0VXNlcnMpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMyB8fCBhcmd1bWVudHNbM10gPT09IHVuZGVmaW5lZCA/IGZ1bmN0aW9uICgpIHt9IDogYXJndW1lbnRzWzNdO1xuXG4gICAgICAgICAgICB2YXIgX1NoYXJlSGVscGVyJHByZXBhcmVFbWFpbCA9IFNoYXJlSGVscGVyLnByZXBhcmVFbWFpbChub2RlLCBudWxsLCBjZWxsTW9kZWwpO1xuXG4gICAgICAgICAgICB2YXIgdGVtcGxhdGVJZCA9IF9TaGFyZUhlbHBlciRwcmVwYXJlRW1haWwudGVtcGxhdGVJZDtcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZURhdGEgPSBfU2hhcmVIZWxwZXIkcHJlcGFyZUVtYWlsLnRlbXBsYXRlRGF0YTtcblxuICAgICAgICAgICAgdmFyIG1haWwgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuTWFpbGVyTWFpbCgpO1xuICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5NYWlsZXJTZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgICAgIG1haWwuVG8gPSBPYmplY3Qua2V5cyh0YXJnZXRVc2VycykubWFwKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHUgPSB0YXJnZXRVc2Vyc1trXTtcbiAgICAgICAgICAgICAgICB2YXIgdG8gPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuTWFpbGVyVXNlcigpO1xuICAgICAgICAgICAgICAgIGlmICh1LklkbVVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdG8uVXVpZCA9IHUuSWRtVXNlci5Mb2dpbjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0by5VdWlkID0gdS5pZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtYWlsLlRlbXBsYXRlSWQgPSB0ZW1wbGF0ZUlkO1xuICAgICAgICAgICAgbWFpbC5UZW1wbGF0ZURhdGEgPSB0ZW1wbGF0ZURhdGE7XG4gICAgICAgICAgICBhcGkuc2VuZChtYWlsKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIG5vZGUge05vZGV9XG4gICAgICAgICAqIEBwYXJhbSBsaW5rTW9kZWwge0xpbmtNb2RlbH1cbiAgICAgICAgICogQHBhcmFtIGNlbGxNb2RlbCB7Q2VsbE1vZGVsfVxuICAgICAgICAgKiBAcmV0dXJuIHt7dGVtcGxhdGVJZDogc3RyaW5nLCB0ZW1wbGF0ZURhdGE6IHt9LCBtZXNzYWdlOiBzdHJpbmcsIGxpbmtNb2RlbDogKn19XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAncHJlcGFyZUVtYWlsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHByZXBhcmVFbWFpbChub2RlKSB7XG4gICAgICAgICAgICB2YXIgbGlua01vZGVsID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgICAgIHZhciBjZWxsTW9kZWwgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzJdO1xuXG4gICAgICAgICAgICB2YXIgdGVtcGxhdGVEYXRhID0ge307XG4gICAgICAgICAgICB2YXIgdGVtcGxhdGVJZCA9IFwiXCI7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IFwiXCI7XG4gICAgICAgICAgICB2YXIgdXNlciA9IHB5ZGlvLnVzZXI7XG4gICAgICAgICAgICBpZiAodXNlci5nZXRQcmVmZXJlbmNlKFwiZGlzcGxheU5hbWVcIikpIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZURhdGFbXCJJbnZpdGVyXCJdID0gdXNlci5nZXRQcmVmZXJlbmNlKFwiZGlzcGxheU5hbWVcIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlRGF0YVtcIkludml0ZXJcIl0gPSB1c2VyLmlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxpbmtNb2RlbCkge1xuICAgICAgICAgICAgICAgIHZhciBsaW5rT2JqZWN0ID0gbGlua01vZGVsLmdldExpbmsoKTtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5pc0xlYWYoKSkge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZUlkID0gXCJQdWJsaWNGaWxlXCI7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlRGF0YVtcIkZpbGVOYW1lXCJdID0gbm9kZS5nZXRMYWJlbCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlSWQgPSBcIlB1YmxpY0ZvbGRlclwiO1xuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZURhdGFbXCJGb2xkZXJOYW1lXCJdID0gbm9kZS5nZXRMYWJlbCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZURhdGFbXCJMaW5rUGF0aFwiXSA9IFwiL3B1YmxpYy9cIiArIGxpbmtPYmplY3QuTGlua0hhc2g7XG4gICAgICAgICAgICAgICAgaWYgKGxpbmtPYmplY3QuTWF4RG93bmxvYWRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlRGF0YVtcIk1heERvd25sb2Fkc1wiXSA9IGxpbmtPYmplY3QuTWF4RG93bmxvYWRzICsgXCJcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGxpbmtPYmplY3QuQWNjZXNzRW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlRGF0YVtcIkV4cGlyZVwiXSA9IGxpbmtPYmplY3QuQWNjZXNzRW5kO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVJZCA9IFwiQ2VsbFwiO1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlRGF0YVtcIkNlbGxcIl0gPSBjZWxsTW9kZWwuZ2V0TGFiZWwoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZUlkOiB0ZW1wbGF0ZUlkLCB0ZW1wbGF0ZURhdGE6IHRlbXBsYXRlRGF0YSwgbWVzc2FnZTogbWVzc2FnZSwgbGlua01vZGVsOiBsaW5rTW9kZWxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gU2hhcmVIZWxwZXI7XG59KSgpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBTaGFyZUhlbHBlcjtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIl19
