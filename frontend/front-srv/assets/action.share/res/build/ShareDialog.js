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
                { style: { display: 'flex', alignItems: 'center', paddingLeft: 20 } },
                _react2['default'].createElement(_materialUi.FontIcon, { className: "icomoon-cells-full-plus" }),
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
            var excludes = Object.values(cellAcls).map(function (a) {
                if (a.User) {
                    return a.User.Login;
                } else if (a.Group) {
                    return a.Group.Uuid;
                } else if (a.Role) {
                    return a.Role.Uuid;
                } else {
                    return null;
                }
            }).filter(function (k) {
                return !!k;
            });
            usersInput = _react2['default'].createElement(UsersCompleter, {
                className: 'share-form-users',
                fieldLabel: this.props.getMessage('34'),
                onValueSelected: this.valueSelected,
                pydio: this.props.pydio,
                showAddressBook: true,
                usersFrom: 'local',
                excludes: excludes
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

var _mainShareHelper = require('../main/ShareHelper');

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

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

            var auth = _mainShareHelper2['default'].getAuthorizations(pydio);
            if (compositeModel.getNode()) {
                var nodeLeaf = compositeModel.getNode().isLeaf();
                var canShare = nodeLeaf && auth.file_workspaces || !nodeLeaf && auth.folder_workspaces;
                if (!canShare) {
                    return _react2['default'].createElement(
                        'div',
                        { style: { fontSize: 13, fontWeight: 500, color: 'rgba(0, 0, 0, 0.43)', padding: 8 } },
                        m(nodeLeaf ? '227' : '228')
                    );
                }
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

},{"../cells/SharedUsers":7,"../main/ShareHelper":29,"./CompositeModel":12,"material-ui":"material-ui","material-ui/styles":"material-ui/styles","pydio":"pydio","react":"react"}],10:[function(require,module,exports){
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
        readonly: React.PropTypes.bool
    },

    childContextTypes: {
        messages: React.PropTypes.object,
        getMessage: React.PropTypes.func,
        isReadonly: React.PropTypes.func
    },

    getChildContext: function getChildContext() {
        var _this = this;

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
                return _this.props.readonly;
            }
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
            var auth = _mainShareHelper2['default'].getAuthorizations(_pydio2['default'].getInstance());
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

                if (preview && !auth.max_downloads) {
                    defaultTemplate = "pydio_unique_strip";
                    defaultPermissions.push(_pydioHttpRestApi.RestShareLinkAccessType.constructFromObject('Preview'));
                } else if (auth.max_downloads > 0) {
                    // If DL only and auth has default max download, set it
                    link.getLink().MaxDownloads = auth.max_downloads;
                }
            } else {
                defaultTemplate = "pydio_shared_folder";
                defaultPermissions.push(_pydioHttpRestApi.RestShareLinkAccessType.constructFromObject('Preview'));
            }
            link.getLink().ViewTemplateName = defaultTemplate;
            link.getLink().Permissions = defaultPermissions;
            if (auth.max_expiration) {
                link.getLink().AccessEnd = "" + (Math.round(new Date() / 1000) + parseInt(auth.max_expiration) * 60 * 60 * 24);
            }

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
            var _this6 = this;

            var proms = [];
            this.cells.map(function (r) {
                if (r.isDirty()) {
                    proms.push(r.save());
                }
            });
            this.links.map(function (l) {
                if (l.isDirty()) {
                    proms.push(l.save());
                }
            });
            // Wait that all save are finished
            Promise.all(proms).then(function () {
                // Remove cells that don't have this node anymore
                var nodeId = _this6.node.getMetadata().get('uuid');
                _this6.cells = _this6.cells.filter(function (r) {
                    return r.hasRootNode(nodeId);
                });
                _this6.updateUnderlyingNode();
            })['catch'](function (e) {
                _this6.updateUnderlyingNode();
            });
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
            var _this7 = this;

            if (this.node) {
                var _ret = (function () {
                    var nodeId = _this7.node.getMetadata().get('uuid');
                    return {
                        v: _this7.cells.filter(function (r) {
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
                if (false && mailerData.linkModel) {
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
        var _props = this.props;
        var linkModel = _props.linkModel;
        var pydio = _props.pydio;

        if (this.state.editLink && this.state.customLink) {
            var auth = _mainShareHelper2['default'].getAuthorizations(pydio);
            if (auth.hash_min_length && this.state.customLink.length < auth.hash_min_length) {
                pydio.UI.displayMessage('ERROR', this.props.getMessage('223').replace('%s', auth.hash_min_length));
                return;
            }
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
        var _props2 = this.props;
        var linkModel = _props2.linkModel;
        var pydio = _props2.pydio;

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

        var _props3 = this.props;
        var linkModel = _props3.linkModel;
        var pydio = _props3.pydio;

        var publicLink = _mainShareHelper2['default'].buildPublicUrl(pydio, linkModel.getLink().LinkHash);
        var auth = _mainShareHelper2['default'].getAuthorizations(pydio);
        var editAllowed = this.props.editAllowed && auth.editable_hash && !this.props.isReadonly() && linkModel.isEditable();
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

        var authorizations = _mainShareHelper2['default'].getAuthorizations(pydio);
        var nodeLeaf = compositeModel.getNode().isLeaf();
        var canEnable = nodeLeaf && authorizations.file_public_link || !nodeLeaf && authorizations.folder_public_link;

        var publicLinkPanes = undefined,
            publicLinkField = undefined;
        if (linkModel.getLinkUuid()) {
            publicLinkField = _react2['default'].createElement(_Field2['default'], {
                pydio: pydio,
                linkModel: linkModel,
                showMailer: this.props.showMailer,
                editAllowed: authorizations.editable_hash && linkModel.isEditable(),
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
                    _react2['default'].createElement(_materialUi.RaisedButton, { label: this.props.getMessage('92'), secondary: true,
                        onClick: this.enableLinkWithPassword })
                )
            );
        } else if (!canEnable) {
            publicLinkField = _react2['default'].createElement(
                'div',
                { style: { fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.43)', paddingBottom: 16, paddingTop: 16 } },
                this.props.getMessage(nodeLeaf ? '225' : '226')
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
                    disabled: this.props.isReadonly() || this.state.disabled || !linkModel.isEditable() || !linkModel.getLinkUuid() && !canEnable,
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

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
            var auth = _mainShareHelper2['default'].getAuthorizations(_pydio2['default'].getInstance());
            var max = auth.max_downloads;
            // Readapt template depending on permissions
            if (linkModel.hasPermission('Preview')) {
                link.ViewTemplateName = "pydio_unique_strip";
                link.MaxDownloads = 0; // Clear Max Downloads if Preview enabled
            } else {
                    link.ViewTemplateName = "pydio_unique_dl";
                    if (max && !link.MaxDownloads) {
                        link.MaxDownloads = max;
                    }
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
        var auth = _mainShareHelper2['default'].getAuthorizations(_pydio2['default'].getInstance());

        if (node.isLeaf()) {
            var _ShareHelper$nodeHasEditor = _mainShareHelper2['default'].nodeHasEditor(pydio, node);

            var preview = _ShareHelper$nodeHasEditor.preview;
            var writeable = _ShareHelper$nodeHasEditor.writeable;

            perms.push({
                NAME: 'Download',
                LABEL: this.props.getMessage('73'),
                DISABLED: !preview || !linkModel.hasPermission('Preview') // Download Only, cannot edit this
            });
            if (preview && !auth.max_downloads) {
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

},{"../ShareContextConsumer":1,"../main/ShareHelper":29,"./LinkModel":17,"material-ui":"material-ui","pydio":"pydio","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],20:[function(require,module,exports){
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
                hash_min_length: pluginConfigs.get("HASH_MIN_LENGTH") || 6,
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvZGlhbG9nL1NoYXJlQ29udGV4dENvbnN1bWVyLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9jZWxscy9DZWxsQ2FyZC5qcyIsInJlcy9idWlsZC9kaWFsb2cvY2VsbHMvQ3JlYXRlQ2VsbERpYWxvZy5qcyIsInJlcy9idWlsZC9kaWFsb2cvY2VsbHMvRWRpdENlbGxEaWFsb2cuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2NlbGxzL05vZGVzUGlja2VyLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9jZWxscy9TaGFyZWRVc2VyRW50cnkuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2NlbGxzL1NoYXJlZFVzZXJzLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9jZWxscy9Vc2VyQmFkZ2UuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2NvbXBvc2l0ZS9DZWxsc0xpc3QuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2NvbXBvc2l0ZS9Db21wb3NpdGVDYXJkLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9jb21wb3NpdGUvQ29tcG9zaXRlRGlhbG9nLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9jb21wb3NpdGUvQ29tcG9zaXRlTW9kZWwuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2NvbXBvc2l0ZS9NYWlsZXIuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2luZGV4LmpzIiwicmVzL2J1aWxkL2RpYWxvZy9saW5rcy9GaWVsZC5qcyIsInJlcy9idWlsZC9kaWFsb2cvbGlua3MvTGFiZWxQYW5lbC5qcyIsInJlcy9idWlsZC9kaWFsb2cvbGlua3MvTGlua01vZGVsLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9saW5rcy9QYW5lbC5qcyIsInJlcy9idWlsZC9kaWFsb2cvbGlua3MvUGVybWlzc2lvbnMuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2xpbmtzL1B1YmxpY0xpbmtUZW1wbGF0ZS5qcyIsInJlcy9idWlsZC9kaWFsb2cvbGlua3MvU2VjdXJlT3B0aW9ucy5qcyIsInJlcy9idWlsZC9kaWFsb2cvbGlua3MvVGFyZ2V0ZWRVc2Vycy5qcyIsInJlcy9idWlsZC9kaWFsb2cvbGlua3MvVmlzaWJpbGl0eVBhbmVsLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9saXN0cy9TaGFyZVZpZXcuanMiLCJyZXMvYnVpbGQvZGlhbG9nL21haW4vQWN0aW9uQnV0dG9uLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9tYWluL0dlbmVyaWNDYXJkLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9tYWluL0dlbmVyaWNFZGl0b3IuanMiLCJyZXMvYnVpbGQvZGlhbG9nL21haW4vSW5mb1BhbmVsLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9tYWluL1NoYXJlSGVscGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM1UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3paQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDelNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25TQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBmdW5jdGlvbiAoUHlkaW9Db21wb25lbnQpIHtcbiAgICB2YXIgU2hhcmVDb250ZXh0Q29uc3VtZXIgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICAgICAgX2luaGVyaXRzKFNoYXJlQ29udGV4dENvbnN1bWVyLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgICAgICBmdW5jdGlvbiBTaGFyZUNvbnRleHRDb25zdW1lcigpIHtcbiAgICAgICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTaGFyZUNvbnRleHRDb25zdW1lcik7XG5cbiAgICAgICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFNoYXJlQ29udGV4dENvbnN1bWVyLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cblxuICAgICAgICBfY3JlYXRlQ2xhc3MoU2hhcmVDb250ZXh0Q29uc3VtZXIsIFt7XG4gICAgICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgICAgICB2YXIgX2NvbnRleHQgPSB0aGlzLmNvbnRleHQ7XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2VzID0gX2NvbnRleHQubWVzc2FnZXM7XG4gICAgICAgICAgICAgICAgdmFyIGdldE1lc3NhZ2UgPSBfY29udGV4dC5nZXRNZXNzYWdlO1xuICAgICAgICAgICAgICAgIHZhciBpc1JlYWRvbmx5ID0gX2NvbnRleHQuaXNSZWFkb25seTtcblxuICAgICAgICAgICAgICAgIHZhciBjb250ZXh0UHJvcHMgPSB7IG1lc3NhZ2VzOiBtZXNzYWdlcywgZ2V0TWVzc2FnZTogZ2V0TWVzc2FnZSwgaXNSZWFkb25seTogaXNSZWFkb25seSB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFB5ZGlvQ29tcG9uZW50LCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcywgY29udGV4dFByb3BzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1dKTtcblxuICAgICAgICByZXR1cm4gU2hhcmVDb250ZXh0Q29uc3VtZXI7XG4gICAgfSkoUmVhY3QuQ29tcG9uZW50KTtcblxuICAgIFNoYXJlQ29udGV4dENvbnN1bWVyLmNvbnRleHRUeXBlcyA9IHtcbiAgICAgICAgbWVzc2FnZXM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgICAgIGdldE1lc3NhZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgICAgICBpc1JlYWRvbmx5OiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuICAgIH07XG5cbiAgICByZXR1cm4gU2hhcmVDb250ZXh0Q29uc3VtZXI7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfRWRpdENlbGxEaWFsb2cgPSByZXF1aXJlKCcuL0VkaXRDZWxsRGlhbG9nJyk7XG5cbnZhciBfRWRpdENlbGxEaWFsb2cyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfRWRpdENlbGxEaWFsb2cpO1xuXG52YXIgX3B5ZGlvTW9kZWxDZWxsID0gcmVxdWlyZSgncHlkaW8vbW9kZWwvY2VsbCcpO1xuXG52YXIgX3B5ZGlvTW9kZWxDZWxsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvTW9kZWxDZWxsKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9tYWluR2VuZXJpY0NhcmQgPSByZXF1aXJlKCcuLi9tYWluL0dlbmVyaWNDYXJkJyk7XG5cbnZhciBfbWFpblNoYXJlSGVscGVyID0gcmVxdWlyZShcIi4uL21haW4vU2hhcmVIZWxwZXJcIik7XG5cbnZhciBfbWFpblNoYXJlSGVscGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21haW5TaGFyZUhlbHBlcik7XG5cbnZhciBDZWxsQ2FyZCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhDZWxsQ2FyZCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBDZWxsQ2FyZChwcm9wcykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDZWxsQ2FyZCk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoQ2VsbENhcmQucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7IGVkaXQ6IGZhbHNlLCBtb2RlbDogbmV3IF9weWRpb01vZGVsQ2VsbDJbJ2RlZmF1bHQnXSgpIH07XG4gICAgICAgIHRoaXMuX29ic2VydmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvL0NlbGxDYXJkID0gUGFsZXR0ZU1vZGlmaWVyKHtwcmltYXJ5MUNvbG9yOicjMDA5Njg4J30pKENlbGxDYXJkKTtcblxuICAgIF9jcmVhdGVDbGFzcyhDZWxsQ2FyZCwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMucHlkaW87XG4gICAgICAgICAgICB2YXIgY2VsbElkID0gX3Byb3BzLmNlbGxJZDtcblxuICAgICAgICAgICAgaWYgKHB5ZGlvLnVzZXIuYWN0aXZlUmVwb3NpdG9yeSA9PT0gY2VsbElkKSB7XG4gICAgICAgICAgICAgICAgcHlkaW8udXNlci5nZXRBY3RpdmVSZXBvc2l0b3J5QXNDZWxsKCkudGhlbihmdW5jdGlvbiAoY2VsbCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBtb2RlbDogY2VsbCB9KTtcbiAgICAgICAgICAgICAgICAgICAgY2VsbC5vYnNlcnZlKCd1cGRhdGUnLCBfdGhpczIuX29ic2VydmVyKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5tb2RlbC5vYnNlcnZlKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUubW9kZWwubG9hZCh0aGlzLnByb3BzLmNlbGxJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxVbm1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5tb2RlbC5zdG9wT2JzZXJ2aW5nKCd1cGRhdGUnLCB0aGlzLl9vYnNlcnZlcik7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3VzZXJzSW52aXRhdGlvbnMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXNlcnNJbnZpdGF0aW9ucyh1c2VyT2JqZWN0cykge1xuICAgICAgICAgICAgX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5zZW5kQ2VsbEludml0YXRpb24odGhpcy5wcm9wcy5ub2RlLCB0aGlzLnN0YXRlLm1vZGVsLCB1c2VyT2JqZWN0cyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIG1vZGUgPSBfcHJvcHMyLm1vZGU7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMyLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgZWRpdCA9IF9zdGF0ZS5lZGl0O1xuICAgICAgICAgICAgdmFyIG1vZGVsID0gX3N0YXRlLm1vZGVsO1xuXG4gICAgICAgICAgICB2YXIgbSA9IGZ1bmN0aW9uIG0oaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci4nICsgaWRdO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHJvb3RTdHlsZSA9IHsgd2lkdGg6IDM1MCwgbWluSGVpZ2h0OiAyNzAgfTtcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICBpZiAoZWRpdCkge1xuICAgICAgICAgICAgICAgIHJvb3RTdHlsZSA9IHsgd2lkdGg6IDcwMCwgaGVpZ2h0OiA1MDAgfTtcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX0VkaXRDZWxsRGlhbG9nMlsnZGVmYXVsdCddLCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcywgeyBtb2RlbDogbW9kZWwsIHNlbmRJbnZpdGF0aW9uczogdGhpcy51c2Vyc0ludml0YXRpb25zLmJpbmQodGhpcykgfSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgbm9kZXMgPSBtb2RlbC5nZXRSb290Tm9kZXMoKS5tYXAoZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsLmdldE5vZGVMYWJlbEluQ29udGV4dChub2RlKTtcbiAgICAgICAgICAgICAgICB9KS5qb2luKCcsICcpO1xuICAgICAgICAgICAgICAgIGlmICghbm9kZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZXMgPSBtb2RlbC5nZXRSb290Tm9kZXMoKS5sZW5ndGggKyAnIGl0ZW0ocyknO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgZGVsZXRlQWN0aW9uID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICBlZGl0QWN0aW9uID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICBtb3JlTWVudUl0ZW1zID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGlmIChtb2RlICE9PSAnaW5mb1BhbmVsJykge1xuICAgICAgICAgICAgICAgICAgICBtb3JlTWVudUl0ZW1zID0gW107XG4gICAgICAgICAgICAgICAgICAgIGlmIChtb2RlbC5nZXRVdWlkKCkgIT09IHB5ZGlvLnVzZXIuYWN0aXZlUmVwb3NpdG9yeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9yZU1lbnVJdGVtcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHByaW1hcnlUZXh0OiBtKDI0NiksIG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW8udHJpZ2dlclJlcG9zaXRvcnlDaGFuZ2UobW9kZWwuZ2V0VXVpZCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnByb3BzLm9uRGlzbWlzcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChtb2RlbC5pc0VkaXRhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZUFjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RlbC5kZWxldGVDZWxsKCkudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMy5wcm9wcy5vbkRpc21pc3MoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0QWN0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMy5zZXRTdGF0ZSh7IGVkaXQ6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzMy5wcm9wcy5vbkhlaWdodENoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczMucHJvcHMub25IZWlnaHRDaGFuZ2UoNTAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9yZU1lbnVJdGVtcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHByaW1hcnlUZXh0OiBtKDI0NyksIG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzMy5zZXRTdGF0ZSh7IGVkaXQ6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb3JlTWVudUl0ZW1zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgcHJpbWFyeVRleHQ6IG0oMjQ4KSwgb25Ub3VjaFRhcDogZGVsZXRlQWN0aW9uIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250ZW50ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYWluR2VuZXJpY0NhcmQuR2VuZXJpY0NhcmQsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBtb2RlbC5nZXRMYWJlbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25EaXNtaXNzQWN0aW9uOiB0aGlzLnByb3BzLm9uRGlzbWlzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRGVsZXRlQWN0aW9uOiBkZWxldGVBY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkVkaXRBY3Rpb246IGVkaXRBY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJTbWFsbDogbW9kZSA9PT0gJ2luZm9QYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb3JlTWVudUl0ZW1zOiBtb3JlTWVudUl0ZW1zXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsLmdldERlc2NyaXB0aW9uKCkgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21haW5HZW5lcmljQ2FyZC5HZW5lcmljTGluZSwgeyBpY29uQ2xhc3NOYW1lOiAnbWRpIG1kaS1pbmZvcm1hdGlvbicsIGxlZ2VuZDogbSgxNDUpLCBkYXRhOiBtb2RlbC5nZXREZXNjcmlwdGlvbigpIH0pLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWFpbkdlbmVyaWNDYXJkLkdlbmVyaWNMaW5lLCB7IGljb25DbGFzc05hbWU6ICdtZGkgbWRpLWFjY291bnQtbXVsdGlwbGUnLCBsZWdlbmQ6IG0oNTQpLCBkYXRhOiBtb2RlbC5nZXRBY2xzU3ViamVjdHMoKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21haW5HZW5lcmljQ2FyZC5HZW5lcmljTGluZSwgeyBpY29uQ2xhc3NOYW1lOiAnbWRpIG1kaS1mb2xkZXInLCBsZWdlbmQ6IG0oMjQ5KSwgZGF0YTogbm9kZXMgfSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmIChtb2RlID09PSAnaW5mb1BhbmVsJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29udGVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5QYXBlcixcbiAgICAgICAgICAgICAgICB7IHpEZXB0aDogMCwgc3R5bGU6IHJvb3RTdHlsZSB9LFxuICAgICAgICAgICAgICAgIGNvbnRlbnRcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQ2VsbENhcmQ7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ2VsbENhcmQ7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9tYXRlcmlhbFVpU3R5bGVzID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWkvc3R5bGVzJyk7XG5cbnZhciBfU2hhcmVkVXNlcnMgPSByZXF1aXJlKCcuL1NoYXJlZFVzZXJzJyk7XG5cbnZhciBfU2hhcmVkVXNlcnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU2hhcmVkVXNlcnMpO1xuXG52YXIgX05vZGVzUGlja2VyID0gcmVxdWlyZSgnLi9Ob2Rlc1BpY2tlcicpO1xuXG52YXIgX05vZGVzUGlja2VyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX05vZGVzUGlja2VyKTtcblxudmFyIF9weWRpb01vZGVsQ2VsbCA9IHJlcXVpcmUoJ3B5ZGlvL21vZGVsL2NlbGwnKTtcblxudmFyIF9weWRpb01vZGVsQ2VsbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb01vZGVsQ2VsbCk7XG5cbi8qKlxuICogRGlhbG9nIGZvciBsZXR0aW5nIHVzZXJzIGNyZWF0ZSBhIHdvcmtzcGFjZVxuICovXG52YXIgQ3JlYXRlQ2VsbERpYWxvZyA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdDcmVhdGVDZWxsRGlhbG9nJyxcblxuICAgIGNoaWxkQ29udGV4dFR5cGVzOiB7XG4gICAgICAgIG1lc3NhZ2VzOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgICAgZ2V0TWVzc2FnZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jLFxuICAgICAgICBpc1JlYWRvbmx5OiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmNcbiAgICB9LFxuXG4gICAgZ2V0Q2hpbGRDb250ZXh0OiBmdW5jdGlvbiBnZXRDaGlsZENvbnRleHQoKSB7XG4gICAgICAgIHZhciBtZXNzYWdlcyA9IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtZXNzYWdlczogbWVzc2FnZXMsXG4gICAgICAgICAgICBnZXRNZXNzYWdlOiBmdW5jdGlvbiBnZXRNZXNzYWdlKG1lc3NhZ2VJZCkge1xuICAgICAgICAgICAgICAgIHZhciBuYW1lc3BhY2UgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAnc2hhcmVfY2VudGVyJyA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlc1tuYW1lc3BhY2UgKyAobmFtZXNwYWNlID8gXCIuXCIgOiBcIlwiKSArIG1lc3NhZ2VJZF0gfHwgbWVzc2FnZUlkO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2VJZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaXNSZWFkb25seTogKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4geyBzdGVwOiAndXNlcnMnLCBtb2RlbDogbmV3IF9weWRpb01vZGVsQ2VsbDJbJ2RlZmF1bHQnXSgpIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB0aGlzLnJlZnMudGl0bGUuZm9jdXMoKTtcbiAgICAgICAgdGhpcy5zdGF0ZS5tb2RlbC5vYnNlcnZlKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLnN0YXRlLm1vZGVsLnN0b3BPYnNlcnZpbmcoJ3VwZGF0ZScpO1xuICAgIH0sXG5cbiAgICBzdWJtaXQ6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgdmFyIG1vZGVsID0gdGhpcy5zdGF0ZS5tb2RlbDtcblxuICAgICAgICBtb2RlbC5zYXZlKCkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICBfdGhpczIucHJvcHMub25EaXNtaXNzKCk7XG4gICAgICAgIH0pWydjYXRjaCddKGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgICAgIHB5ZGlvLlVJLmRpc3BsYXlNZXNzYWdlKCdFUlJPUicsIHJlYXNvbi5tZXNzYWdlKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIG06IGZ1bmN0aW9uIG0oaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci4nICsgaWRdO1xuICAgIH0sXG5cbiAgICBjb21wdXRlU3VtbWFyeVN0cmluZzogZnVuY3Rpb24gY29tcHV0ZVN1bW1hcnlTdHJpbmcoKSB7XG4gICAgICAgIHZhciBtb2RlbCA9IHRoaXMuc3RhdGUubW9kZWw7XG5cbiAgICAgICAgdmFyIHVzZXJzID0gMDtcbiAgICAgICAgdmFyIGdyb3VwcyA9IDA7XG4gICAgICAgIHZhciB0ZWFtcyA9IDA7XG4gICAgICAgIHZhciB1c2VyU3RyaW5nID0gW107XG4gICAgICAgIHZhciBvYmpzID0gbW9kZWwuZ2V0QWNscygpO1xuICAgICAgICBPYmplY3Qua2V5cyhvYmpzKS5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgIHZhciBhY2wgPSBvYmpzW2tdO1xuICAgICAgICAgICAgaWYgKGFjbC5Hcm91cCkgZ3JvdXBzKys7ZWxzZSBpZiAoYWNsLlJvbGUpIHRlYW1zKys7ZWxzZSB1c2VycysrO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHVzZXJzKSB1c2VyU3RyaW5nLnB1c2godXNlcnMgKyAnICcgKyB0aGlzLm0oMjcwKSk7XG4gICAgICAgIGlmIChncm91cHMpIHVzZXJTdHJpbmcucHVzaChncm91cHMgKyAnICcgKyB0aGlzLm0oMjcxKSk7XG4gICAgICAgIGlmICh0ZWFtcykgdXNlclN0cmluZy5wdXNoKHRlYW1zICsgJyAnICsgdGhpcy5tKDI3MikpO1xuICAgICAgICB2YXIgZmluYWxTdHJpbmcgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh1c2VyU3RyaW5nLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgZmluYWxTdHJpbmcgPSB1c2VyU3RyaW5nWzBdICsgJywgJyArIHVzZXJTdHJpbmdbMV0gKyB0aGlzLm0oMjc0KSArIHVzZXJTdHJpbmdbM107XG4gICAgICAgIH0gZWxzZSBpZiAodXNlclN0cmluZy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGZpbmFsU3RyaW5nID0gdGhpcy5tKDI3Myk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmaW5hbFN0cmluZyA9IHVzZXJTdHJpbmcuam9pbih0aGlzLm0oMjc0KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMubSgyNjkpLnJlcGxhY2UoJyVVU0VSUycsIGZpbmFsU3RyaW5nKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBidXR0b25zID0gW107XG4gICAgICAgIHZhciBjb250ZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuICAgICAgICB2YXIgbXVpVGhlbWUgPSBfcHJvcHMubXVpVGhlbWU7XG4gICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICB2YXIgc3RlcCA9IF9zdGF0ZS5zdGVwO1xuICAgICAgICB2YXIgbW9kZWwgPSBfc3RhdGUubW9kZWw7XG5cbiAgICAgICAgaWYgKHN0ZXAgPT09ICd1c2VycycpIHtcblxuICAgICAgICAgICAgY29udGVudCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm0oMjc1KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7IHJlZjogXCJ0aXRsZVwiLCBmbG9hdGluZ0xhYmVsVGV4dDogdGhpcy5tKDI3NiksIHZhbHVlOiBtb2RlbC5nZXRMYWJlbCgpLCBvbkNoYW5nZTogZnVuY3Rpb24gKGUsIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsLnNldExhYmVsKHYpO1xuICAgICAgICAgICAgICAgICAgICB9LCBmdWxsV2lkdGg6IHRydWUgfSksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7IGZsb2F0aW5nTGFiZWxUZXh0OiB0aGlzLm0oMjc3KSwgdmFsdWU6IG1vZGVsLmdldERlc2NyaXB0aW9uKCksIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSwgdikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWwuc2V0RGVzY3JpcHRpb24odik7XG4gICAgICAgICAgICAgICAgICAgIH0sIGZ1bGxXaWR0aDogdHJ1ZSB9KVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgYnV0dG9ucy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHtcbiAgICAgICAgICAgICAgICBrZXk6ICduZXh0MScsXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6ICFtb2RlbC5nZXRMYWJlbCgpLFxuICAgICAgICAgICAgICAgIHByaW1hcnk6IHRydWUsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWycxNzknXSwgLy8gTmV4dFxuICAgICAgICAgICAgICAgIG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnNldFN0YXRlKHsgc3RlcDogJ2RhdGEnIH0pO1xuICAgICAgICAgICAgICAgIH0gfSkpO1xuICAgICAgICB9IGVsc2UgaWYgKHN0ZXAgPT09ICdkYXRhJykge1xuXG4gICAgICAgICAgICBjb250ZW50ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubSgyNzgpXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfU2hhcmVkVXNlcnMyWydkZWZhdWx0J10sIHtcbiAgICAgICAgICAgICAgICAgICAgcHlkaW86IHB5ZGlvLFxuICAgICAgICAgICAgICAgICAgICBjZWxsQWNsczogbW9kZWwuZ2V0QWNscygpLFxuXG4gICAgICAgICAgICAgICAgICAgIGV4Y2x1ZGVzOiBbcHlkaW8udXNlci5pZF0sXG4gICAgICAgICAgICAgICAgICAgIG9uVXNlck9iamVjdEFkZDogbW9kZWwuYWRkVXNlci5iaW5kKG1vZGVsKSxcbiAgICAgICAgICAgICAgICAgICAgb25Vc2VyT2JqZWN0UmVtb3ZlOiBtb2RlbC5yZW1vdmVVc2VyLmJpbmQobW9kZWwpLFxuICAgICAgICAgICAgICAgICAgICBvblVzZXJPYmplY3RVcGRhdGVSaWdodDogbW9kZWwudXBkYXRlVXNlclJpZ2h0LmJpbmQobW9kZWwpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGJ1dHRvbnMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGtleTogJ3ByZXYxJywgcHJpbWFyeTogZmFsc2UsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnMzA0J10sIG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnNldFN0YXRlKHsgc3RlcDogJ3VzZXJzJyB9KTtcbiAgICAgICAgICAgICAgICB9IH0pKTtcbiAgICAgICAgICAgIGJ1dHRvbnMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGtleTogJ25leHQyJywgcHJpbWFyeTogdHJ1ZSwgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWycxNzknXSwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMzLnNldFN0YXRlKHsgc3RlcDogJ2xhYmVsJyB9KTtcbiAgICAgICAgICAgICAgICB9IH0pKTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgY29udGVudCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXB1dGVTdW1tYXJ5U3RyaW5nKClcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nVG9wOiAyNCB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9Ob2Rlc1BpY2tlcjJbJ2RlZmF1bHQnXSwgeyBweWRpbzogcHlkaW8sIG1vZGVsOiBtb2RlbCB9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGJ1dHRvbnMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGtleTogJ3ByZXYyJywgcHJpbWFyeTogZmFsc2UsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnMzA0J10sIG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnNldFN0YXRlKHsgc3RlcDogJ2RhdGEnIH0pO1xuICAgICAgICAgICAgICAgIH0gfSkpO1xuICAgICAgICAgICAgYnV0dG9ucy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsga2V5OiAnc3VibWl0JywgcHJpbWFyeTogdHJ1ZSwgbGFiZWw6IHRoaXMubSgyNzkpLCBvblRvdWNoVGFwOiB0aGlzLnN1Ym1pdC5iaW5kKHRoaXMpIH0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwcmltYXJ5MUNvbG9yID0gbXVpVGhlbWUucGFsZXR0ZS5wcmltYXJ5MUNvbG9yO1xuXG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogMzgwLCBmb250U2l6ZTogMTMsIGNvbG9yOiAncmdiYSgwLDAsMCwuODcpJywgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgbWluSGVpZ2h0OiAzMDAgfSB9LFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBwYWRkaW5nTGVmdDogMjAgfSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogXCJpY29tb29uLWNlbGxzLWZ1bGwtcGx1c1wiIH0pLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAyMCwgZm9udFNpemU6IDIyIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgcHlkaW8uTWVzc2FnZUhhc2hbJzQxOCddXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogJzIwcHggMjBweCAxMHB4JywgZmxleDogMSB9IH0sXG4gICAgICAgICAgICAgICAgY29udGVudFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogOCwgdGV4dEFsaWduOiAncmlnaHQnIH0gfSxcbiAgICAgICAgICAgICAgICBidXR0b25zXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ3JlYXRlQ2VsbERpYWxvZyA9ICgwLCBfbWF0ZXJpYWxVaVN0eWxlcy5tdWlUaGVtZWFibGUpKCkoQ3JlYXRlQ2VsbERpYWxvZyk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBDcmVhdGVDZWxsRGlhbG9nO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX1NoYXJlZFVzZXJzID0gcmVxdWlyZSgnLi9TaGFyZWRVc2VycycpO1xuXG52YXIgX1NoYXJlZFVzZXJzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1NoYXJlZFVzZXJzKTtcblxudmFyIF9Ob2Rlc1BpY2tlciA9IHJlcXVpcmUoJy4vTm9kZXNQaWNrZXInKTtcblxudmFyIF9Ob2Rlc1BpY2tlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Ob2Rlc1BpY2tlcik7XG5cbnZhciBfbWFpbkdlbmVyaWNFZGl0b3IgPSByZXF1aXJlKCcuLi9tYWluL0dlbmVyaWNFZGl0b3InKTtcblxudmFyIF9tYWluR2VuZXJpY0VkaXRvcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYWluR2VuZXJpY0VkaXRvcik7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZXF1aXJlID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIFRleHRGaWVsZCA9IF9yZXF1aXJlLlRleHRGaWVsZDtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2NvbXBvbmVudHMnKTtcblxudmFyIFJlc291cmNlUG9saWNpZXNQYW5lbCA9IF9QeWRpbyRyZXF1aXJlTGliLlJlc291cmNlUG9saWNpZXNQYW5lbDtcblxuLyoqXG4gKiBEaWFsb2cgZm9yIGxldHRpbmcgdXNlcnMgY3JlYXRlIGEgd29ya3NwYWNlXG4gKi9cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ0VkaXRDZWxsRGlhbG9nJyxcblxuICAgIGNoaWxkQ29udGV4dFR5cGVzOiB7XG4gICAgICAgIG1lc3NhZ2VzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LFxuICAgICAgICBnZXRNZXNzYWdlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgaXNSZWFkb25seTogUmVhY3QuUHJvcFR5cGVzLmZ1bmNcbiAgICB9LFxuXG4gICAgZ2V0Q2hpbGRDb250ZXh0OiBmdW5jdGlvbiBnZXRDaGlsZENvbnRleHQoKSB7XG4gICAgICAgIHZhciBtZXNzYWdlcyA9IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtZXNzYWdlczogbWVzc2FnZXMsXG4gICAgICAgICAgICBnZXRNZXNzYWdlOiBmdW5jdGlvbiBnZXRNZXNzYWdlKG1lc3NhZ2VJZCkge1xuICAgICAgICAgICAgICAgIHZhciBuYW1lc3BhY2UgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAnc2hhcmVfY2VudGVyJyA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlc1tuYW1lc3BhY2UgKyAobmFtZXNwYWNlID8gXCIuXCIgOiBcIlwiKSArIG1lc3NhZ2VJZF0gfHwgbWVzc2FnZUlkO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2VJZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaXNSZWFkb25seTogZnVuY3Rpb24gaXNSZWFkb25seSgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIHN1Ym1pdDogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgbW9kZWwgPSBfcHJvcHMubW9kZWw7XG4gICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcblxuICAgICAgICB2YXIgZGlydHlSb290cyA9IG1vZGVsLmhhc0RpcnR5Um9vdE5vZGVzKCk7XG4gICAgICAgIG1vZGVsLnNhdmUoKS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIF90aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgICAgICBpZiAoZGlydHlSb290cyAmJiBtb2RlbC5nZXRVdWlkKCkgPT09IHB5ZGlvLnVzZXIuZ2V0QWN0aXZlUmVwb3NpdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgcHlkaW8uZ29UbygnLycpO1xuICAgICAgICAgICAgICAgIHB5ZGlvLmZpcmVDb250ZXh0UmVmcmVzaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgICAgICBweWRpby5VSS5kaXNwbGF5TWVzc2FnZSgnRVJST1InLCByZWFzb24ubWVzc2FnZSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMyLnB5ZGlvO1xuICAgICAgICB2YXIgbW9kZWwgPSBfcHJvcHMyLm1vZGVsO1xuICAgICAgICB2YXIgc2VuZEludml0YXRpb25zID0gX3Byb3BzMi5zZW5kSW52aXRhdGlvbnM7XG5cbiAgICAgICAgdmFyIG0gPSBmdW5jdGlvbiBtKGlkKSB7XG4gICAgICAgICAgICByZXR1cm4gcHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci4nICsgaWRdO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBoZWFkZXIgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUZXh0RmllbGQsIHsgc3R5bGU6IHsgbWFyZ2luVG9wOiAtMTQgfSwgZmxvYXRpbmdMYWJlbFRleHQ6IG0oMjY3KSwgdmFsdWU6IG1vZGVsLmdldExhYmVsKCksIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSwgdikge1xuICAgICAgICAgICAgICAgICAgICBtb2RlbC5zZXRMYWJlbCh2KTtcbiAgICAgICAgICAgICAgICB9LCBmdWxsV2lkdGg6IHRydWUgfSksXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRleHRGaWVsZCwgeyBzdHlsZTogeyBtYXJnaW5Ub3A6IC0xNCB9LCBmbG9hdGluZ0xhYmVsVGV4dDogbSgyNjgpLCB2YWx1ZTogbW9kZWwuZ2V0RGVzY3JpcHRpb24oKSwgb25DaGFuZ2U6IGZ1bmN0aW9uIChlLCB2KSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsLnNldERlc2NyaXB0aW9uKHYpO1xuICAgICAgICAgICAgICAgIH0sIGZ1bGxXaWR0aDogdHJ1ZSB9KVxuICAgICAgICApO1xuICAgICAgICB2YXIgdGFicyA9IHtcbiAgICAgICAgICAgIGxlZnQ6IFt7XG4gICAgICAgICAgICAgICAgTGFiZWw6IG0oNTQpLFxuICAgICAgICAgICAgICAgIFZhbHVlOiAndXNlcnMnLFxuICAgICAgICAgICAgICAgIENvbXBvbmVudDogUmVhY3QuY3JlYXRlRWxlbWVudChfU2hhcmVkVXNlcnMyWydkZWZhdWx0J10sIHtcbiAgICAgICAgICAgICAgICAgICAgcHlkaW86IHB5ZGlvLFxuICAgICAgICAgICAgICAgICAgICBjZWxsQWNsczogbW9kZWwuZ2V0QWNscygpLFxuICAgICAgICAgICAgICAgICAgICBleGNsdWRlczogW3B5ZGlvLnVzZXIuaWRdLFxuICAgICAgICAgICAgICAgICAgICBzZW5kSW52aXRhdGlvbnM6IHNlbmRJbnZpdGF0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgb25Vc2VyT2JqZWN0QWRkOiBtb2RlbC5hZGRVc2VyLmJpbmQobW9kZWwpLFxuICAgICAgICAgICAgICAgICAgICBvblVzZXJPYmplY3RSZW1vdmU6IG1vZGVsLnJlbW92ZVVzZXIuYmluZChtb2RlbCksXG4gICAgICAgICAgICAgICAgICAgIG9uVXNlck9iamVjdFVwZGF0ZVJpZ2h0OiBtb2RlbC51cGRhdGVVc2VyUmlnaHQuYmluZChtb2RlbClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIExhYmVsOiBtKDI1MyksXG4gICAgICAgICAgICAgICAgVmFsdWU6ICdwZXJtaXNzaW9ucycsXG4gICAgICAgICAgICAgICAgQ29tcG9uZW50OiBSZWFjdC5jcmVhdGVFbGVtZW50KFJlc291cmNlUG9saWNpZXNQYW5lbCwge1xuICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlVHlwZTogJ3dvcmtzcGFjZScsXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlSWQ6IG1vZGVsLmdldFV1aWQoKSxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHt9LFxuICAgICAgICAgICAgICAgICAgICBza2lwVGl0bGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG9uU2F2ZVBvbGljaWVzOiBmdW5jdGlvbiAoKSB7fSxcbiAgICAgICAgICAgICAgICAgICAgcmVhZG9ubHk6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBjZWxsQWNsczogbW9kZWwuZ2V0QWNscygpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgcmlnaHQ6IFt7XG4gICAgICAgICAgICAgICAgTGFiZWw6IG0oMjQ5KSxcbiAgICAgICAgICAgICAgICBWYWx1ZTogJ2NvbnRlbnQnLFxuICAgICAgICAgICAgICAgIENvbXBvbmVudDogUmVhY3QuY3JlYXRlRWxlbWVudChfTm9kZXNQaWNrZXIyWydkZWZhdWx0J10sIHsgcHlkaW86IHB5ZGlvLCBtb2RlbDogbW9kZWwsIG1vZGU6ICdlZGl0JyB9KVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChfbWFpbkdlbmVyaWNFZGl0b3IyWydkZWZhdWx0J10sIHtcbiAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgIHRhYnM6IHRhYnMsXG4gICAgICAgICAgICBoZWFkZXI6IGhlYWRlcixcbiAgICAgICAgICAgIHNhdmVFbmFibGVkOiBtb2RlbC5pc0RpcnR5KCksXG4gICAgICAgICAgICBvblNhdmVBY3Rpb246IHRoaXMuc3VibWl0LmJpbmQodGhpcyksXG4gICAgICAgICAgICBvbkNsb3NlQWN0aW9uOiB0aGlzLnByb3BzLm9uRGlzbWlzcyxcbiAgICAgICAgICAgIG9uUmV2ZXJ0QWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbW9kZWwucmV2ZXJ0Q2hhbmdlcygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgYXJyMltpXSA9IGFycltpXTsgcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX21hdGVyaWFsVWlTdHlsZXMgPSByZXF1aXJlKCdtYXRlcmlhbC11aS9zdHlsZXMnKTtcblxudmFyIF9weWRpb01vZGVsRGF0YU1vZGVsID0gcmVxdWlyZSgncHlkaW8vbW9kZWwvZGF0YS1tb2RlbCcpO1xuXG52YXIgX3B5ZGlvTW9kZWxEYXRhTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9Nb2RlbERhdGFNb2RlbCk7XG5cbnZhciBfcmVxdWlyZSRyZXF1aXJlTGliID0gcmVxdWlyZSgncHlkaW8nKS5yZXF1aXJlTGliKCdjb21wb25lbnRzJyk7XG5cbnZhciBGb2xkZXJzVHJlZSA9IF9yZXF1aXJlJHJlcXVpcmVMaWIuRm9sZGVyc1RyZWU7XG5cbnZhciBOb2Rlc1BpY2tlciA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhOb2Rlc1BpY2tlciwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBOb2Rlc1BpY2tlcihwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTm9kZXNQaWNrZXIpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKE5vZGVzUGlja2VyLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB2YXIgY3J0V3MgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgdmFyIHVzZXIgPSBwcm9wcy5weWRpby51c2VyO1xuICAgICAgICB2YXIgYXZhaWwgPSBbXTtcbiAgICAgICAgdXNlci5nZXRSZXBvc2l0b3JpZXNMaXN0KCkuZm9yRWFjaChmdW5jdGlvbiAocmVwbykge1xuICAgICAgICAgICAgaWYgKHJlcG8uZ2V0QWNjZXNzVHlwZSgpID09PSAnZ2F0ZXdheScpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVwby5nZXRJZCgpID09PSB1c2VyLmFjdGl2ZVJlcG9zaXRvcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcG8uZ2V0T3duZXIoKSA9PT0gJ3NoYXJlZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjsgLy8gZG8gbm90IHB1c2ggdG8gdGhlIGxpc3RcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjcnRXcyA9IHJlcG87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGF2YWlsLnB1c2gocmVwbyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgYXZhaWxhYmxlV3MgPSBbXTtcbiAgICAgICAgdmFyIG5vdE93bmVkID0gYXZhaWwuZmlsdGVyKGZ1bmN0aW9uIChyZXBvKSB7XG4gICAgICAgICAgICByZXR1cm4gIXJlcG8uZ2V0T3duZXIoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBvd25lZCA9IGF2YWlsLmZpbHRlcihmdW5jdGlvbiAocmVwbykge1xuICAgICAgICAgICAgcmV0dXJuIHJlcG8uZ2V0T3duZXIoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChub3RPd25lZC5sZW5ndGggJiYgb3duZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICBhdmFpbGFibGVXcyA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkobm90T3duZWQpLCBbJ0RJVklERVInXSwgX3RvQ29uc3VtYWJsZUFycmF5KG93bmVkKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhdmFpbGFibGVXcyA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkobm90T3duZWQpLCBfdG9Db25zdW1hYmxlQXJyYXkob3duZWQpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkbSA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKGF2YWlsYWJsZVdzLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKCFjcnRXcykge1xuICAgICAgICAgICAgICAgIGNydFdzID0gYXZhaWxhYmxlV3NbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkbSA9IF9weWRpb01vZGVsRGF0YU1vZGVsMlsnZGVmYXVsdCddLlJlbW90ZURhdGFNb2RlbEZhY3RvcnkoeyB0bXBfcmVwb3NpdG9yeV9pZDogY3J0V3MuZ2V0SWQoKSB9KTtcbiAgICAgICAgICAgIHZhciByb290ID0gZG0uZ2V0Um9vdE5vZGUoKTtcbiAgICAgICAgICAgIHJvb3QuZ2V0TWV0YWRhdGEoKS5zZXQoJ3JlcG9zaXRvcnlfaWQnLCBjcnRXcy5nZXRJZCgpKTtcbiAgICAgICAgICAgIHJvb3QubG9hZCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGRhdGFNb2RlbDogZG0sXG4gICAgICAgICAgICBvcGVuOiBmYWxzZSxcbiAgICAgICAgICAgIGF2YWlsYWJsZVdzOiBhdmFpbGFibGVXcyxcbiAgICAgICAgICAgIGNydFdzOiBjcnRXc1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhOb2Rlc1BpY2tlciwgW3tcbiAgICAgICAga2V5OiAnc3dpdGNoV29ya3NwYWNlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHN3aXRjaFdvcmtzcGFjZSh3cykge1xuICAgICAgICAgICAgdmFyIGRtID0gX3B5ZGlvTW9kZWxEYXRhTW9kZWwyWydkZWZhdWx0J10uUmVtb3RlRGF0YU1vZGVsRmFjdG9yeSh7IHRtcF9yZXBvc2l0b3J5X2lkOiB3cy5nZXRJZCgpIH0pO1xuICAgICAgICAgICAgdmFyIHJvb3QgPSBkbS5nZXRSb290Tm9kZSgpO1xuICAgICAgICAgICAgcm9vdC5nZXRNZXRhZGF0YSgpLnNldCgncmVwb3NpdG9yeV9pZCcsIHdzLmdldElkKCkpO1xuICAgICAgICAgICAgcm9vdC5sb2FkKCk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY3J0V3M6IHdzLCBkYXRhTW9kZWw6IGRtIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdoYW5kbGVUb3VjaFRhcCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBoYW5kbGVUb3VjaFRhcChldmVudCkge1xuICAgICAgICAgICAgLy8gVGhpcyBwcmV2ZW50cyBnaG9zdCBjbGljay5cbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIG9wZW46IHRydWUsXG4gICAgICAgICAgICAgICAgYW5jaG9yRWw6IGV2ZW50LmN1cnJlbnRUYXJnZXRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdoYW5kbGVSZXF1ZXN0Q2xvc2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gaGFuZGxlUmVxdWVzdENsb3NlKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgb3BlbjogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvblZhbGlkYXRlTm9kZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvblZhbGlkYXRlTm9kZSgpIHtcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5zdGF0ZS5ub2RlO1xuXG4gICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLmFkZFJvb3ROb2RlKG5vZGUpO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVSZXF1ZXN0Q2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb25Ob2RlU2VsZWN0ZWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb25Ob2RlU2VsZWN0ZWQobm9kZSkge1xuICAgICAgICAgICAgbm9kZS5sb2FkKCk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbm9kZTogbm9kZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gbm9kZSBUcmVlTm9kZVxuICAgICAgICAgKiBAcmV0dXJuIHtYTUx9XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyTm9kZUxpbmUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyTm9kZUxpbmUobm9kZSkge1xuICAgICAgICAgICAgdmFyIG1vZGVsID0gdGhpcy5wcm9wcy5tb2RlbDtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkxpc3RJdGVtLCB7XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgbGVmdEljb246IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogJ21kaSBtZGktZm9sZGVyJyB9KSxcbiAgICAgICAgICAgICAgICBwcmltYXJ5VGV4dDogbW9kZWwuZ2V0Tm9kZUxhYmVsSW5Db250ZXh0KG5vZGUpLFxuICAgICAgICAgICAgICAgIHJpZ2h0SWNvbkJ1dHRvbjogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbC5yZW1vdmVSb290Tm9kZShub2RlLlV1aWQpO1xuICAgICAgICAgICAgICAgICAgICB9LCBpY29uQ2xhc3NOYW1lOiAnbWRpIG1kaS1kZWxldGUnLCB0b29sdGlwOiAnUmVtb3ZlJywgaWNvblN0eWxlOiB7IGNvbG9yOiAncmdiYSgwLDAsMCwuNDMpJyB9IH0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIG1vZGVsID0gX3Byb3BzLm1vZGVsO1xuICAgICAgICAgICAgdmFyIG11aVRoZW1lID0gX3Byb3BzLm11aVRoZW1lO1xuICAgICAgICAgICAgdmFyIG1vZGUgPSBfcHJvcHMubW9kZTtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcblxuICAgICAgICAgICAgdmFyIG0gPSBmdW5jdGlvbiBtKGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHB5ZGlvLk1lc3NhZ2VIYXNoWydzaGFyZV9jZW50ZXIuJyArIGlkXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgbm9kZXMgPSBtb2RlbC5nZXRSb290Tm9kZXMoKTtcbiAgICAgICAgICAgIHZhciBub2RlTGluZXMgPSBbXSxcbiAgICAgICAgICAgICAgICBlbXB0eVN0YXRlU3RyaW5nID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgbm9kZXMubWFwKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICAgICAgbm9kZUxpbmVzLnB1c2goX3RoaXMucmVuZGVyTm9kZUxpbmUobm9kZSkpO1xuICAgICAgICAgICAgICAgIG5vZGVMaW5lcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIHsgaW5zZXQ6IHRydWUgfSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBub2RlTGluZXMucG9wKCk7XG4gICAgICAgICAgICBpZiAoIW5vZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChtb2RlID09PSAnZWRpdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgZW1wdHlTdGF0ZVN0cmluZyA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBjb2xvcjogJ3JnYmEoMCwwLDAsLjU0KScsIGZvbnRTdHlsZTogJ2l0YWxpYycgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgyODApXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZW1wdHlTdGF0ZVN0cmluZyA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBjb2xvcjogJ3JnYmEoMCwwLDAsLjU0KScsIGZvbnRTdHlsZTogJ2l0YWxpYycgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgyODEpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IF9zdGF0ZS5ub2RlO1xuICAgICAgICAgICAgdmFyIGF2YWlsYWJsZVdzID0gX3N0YXRlLmF2YWlsYWJsZVdzO1xuICAgICAgICAgICAgdmFyIGNydFdzID0gX3N0YXRlLmNydFdzO1xuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBtKDI4MiksXG4gICAgICAgICAgICAgICAgICAgIG9uVG91Y2hUYXA6IHRoaXMuaGFuZGxlVG91Y2hUYXAuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgbWFyZ2luQm90dG9tOiAxMCB9LFxuICAgICAgICAgICAgICAgICAgICBpY29uOiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBjbGFzc05hbWU6IFwibWRpIG1kaS1mb2xkZXItcGx1c1wiIH0pXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLkxpc3QsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIG5vZGVMaW5lc1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgZW1wdHlTdGF0ZVN0cmluZyxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUG9wb3ZlcixcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogdGhpcy5zdGF0ZS5vcGVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5jaG9yRWw6IHRoaXMuc3RhdGUuYW5jaG9yRWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmNob3JPcmlnaW46IHsgaG9yaXpvbnRhbDogJ2xlZnQnLCB2ZXJ0aWNhbDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE9yaWdpbjogeyBob3Jpem9udGFsOiAnbGVmdCcsIHZlcnRpY2FsOiAndG9wJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgb25SZXF1ZXN0Q2xvc2U6IHRoaXMuaGFuZGxlUmVxdWVzdENsb3NlLmJpbmQodGhpcylcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6IDM3MiwgaGVpZ2h0OiAzMDAsIGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuRHJvcERvd25NZW51LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgaGVpZ2h0OiA1NCB9LCB2YWx1ZTogY3J0V3MsIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSwgaSwgdikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuc3dpdGNoV29ya3NwYWNlKHYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlV3MubWFwKGZ1bmN0aW9uICh3cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAod3MgPT09ICdESVZJREVSJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHZhbHVlOiB3cywgcHJpbWFyeVRleHQ6IHdzLmdldExhYmVsKCkgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIG51bGwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBtYXJnaW5MZWZ0OiAtMjYsIGZsZXg6ICcxJywgb3ZlcmZsb3dZOiAnYXV0bycsIGZvbnRTaXplOiAxNSwgY29sb3I6ICdyZ2JhKDAsMCwwLC43MyknIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChGb2xkZXJzVHJlZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBweWRpbzogdGhpcy5wcm9wcy5weWRpbyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YU1vZGVsOiB0aGlzLnN0YXRlLmRhdGFNb2RlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Ob2RlU2VsZWN0ZWQ6IHRoaXMub25Ob2RlU2VsZWN0ZWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd1Jvb3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5EaXZpZGVyLCBudWxsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBwYWRkaW5nOiAnNHB4IDE2cHgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZm9udFNpemU6IDE1IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmbGV4OiAxLCBjb2xvcjogJ3JnYmEoMCwwLDAsLjg3KScgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlICYmIG5vZGUuZ2V0UGF0aCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAhbm9kZSAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgY29sb3I6ICdyZ2JhKDAsMCwwLC41NCknLCBmb250V2VpZ2h0OiA1MDAgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKDI4MylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgaWNvblN0eWxlOiB7IGNvbG9yOiBtdWlUaGVtZS5wYWxldHRlLnByaW1hcnkxQ29sb3IgfSwgZGlzYWJsZWQ6ICFub2RlLCBpY29uQ2xhc3NOYW1lOiBcIm1kaSBtZGktcGx1cy1jaXJjbGUtb3V0bGluZVwiLCBvblRvdWNoVGFwOiB0aGlzLm9uVmFsaWRhdGVOb2RlLmJpbmQodGhpcykgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gTm9kZXNQaWNrZXI7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gTm9kZXNQaWNrZXIgPSAoMCwgX21hdGVyaWFsVWlTdHlsZXMubXVpVGhlbWVhYmxlKSgpKE5vZGVzUGlja2VyKTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IE5vZGVzUGlja2VyO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9Vc2VyQmFkZ2UgPSByZXF1aXJlKCcuL1VzZXJCYWRnZScpO1xuXG52YXIgX1VzZXJCYWRnZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Vc2VyQmFkZ2UpO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyID0gcmVxdWlyZSgnLi4vU2hhcmVDb250ZXh0Q29uc3VtZXInKTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TaGFyZUNvbnRleHRDb25zdW1lcik7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBTaGFyZWRVc2VyRW50cnkgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdTaGFyZWRVc2VyRW50cnknLFxuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIGNlbGxBY2w6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgc2VuZEludml0YXRpb25zOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgb25Vc2VyT2JqZWN0UmVtb3ZlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICBvblVzZXJPYmplY3RVcGRhdGVSaWdodDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZFxuICAgIH0sXG4gICAgb25SZW1vdmU6IGZ1bmN0aW9uIG9uUmVtb3ZlKCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uVXNlck9iamVjdFJlbW92ZSh0aGlzLnByb3BzLmNlbGxBY2wuUm9sZUlkKTtcbiAgICB9LFxuICAgIG9uSW52aXRlOiBmdW5jdGlvbiBvbkludml0ZSgpIHtcbiAgICAgICAgdmFyIHRhcmdldHMgPSB7fTtcbiAgICAgICAgdmFyIHVzZXJPYmplY3QgPSBQeWRpb1VzZXJzLlVzZXIuZnJvbUlkbVVzZXIodGhpcy5wcm9wcy5jZWxsQWNsLlVzZXIpO1xuICAgICAgICB0YXJnZXRzW3VzZXJPYmplY3QuZ2V0SWQoKV0gPSB1c2VyT2JqZWN0O1xuICAgICAgICB0aGlzLnByb3BzLnNlbmRJbnZpdGF0aW9ucyh0YXJnZXRzKTtcbiAgICB9LFxuICAgIG9uVXBkYXRlUmlnaHQ6IGZ1bmN0aW9uIG9uVXBkYXRlUmlnaHQoZXZlbnQpIHtcbiAgICAgICAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgdGhpcy5wcm9wcy5vblVzZXJPYmplY3RVcGRhdGVSaWdodCh0aGlzLnByb3BzLmNlbGxBY2wuUm9sZUlkLCB0YXJnZXQubmFtZSwgdGFyZ2V0LmNoZWNrZWQpO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgY2VsbEFjbCA9IF9wcm9wcy5jZWxsQWNsO1xuICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMucHlkaW87XG5cbiAgICAgICAgdmFyIG1lbnVJdGVtcyA9IFtdO1xuICAgICAgICB2YXIgdHlwZSA9IGNlbGxBY2wuVXNlciA/ICd1c2VyJyA6IGNlbGxBY2wuR3JvdXAgPyAnZ3JvdXAnIDogJ3RlYW0nO1xuXG4gICAgICAgIC8vIERvIG5vdCByZW5kZXIgY3VycmVudCB1c2VyXG4gICAgICAgIGlmIChjZWxsQWNsLlVzZXIgJiYgY2VsbEFjbC5Vc2VyLkxvZ2luID09PSBweWRpby51c2VyLmlkKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlICE9ICdncm91cCcpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnNlbmRJbnZpdGF0aW9ucykge1xuICAgICAgICAgICAgICAgIC8vIFNlbmQgaW52aXRhdGlvblxuICAgICAgICAgICAgICAgIG1lbnVJdGVtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCc0NScpLFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogdGhpcy5vbkludml0ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5pc1JlYWRvbmx5KCkgJiYgIXRoaXMucHJvcHMucmVhZG9ubHkpIHtcbiAgICAgICAgICAgIC8vIFJlbW92ZSBFbnRyeVxuICAgICAgICAgICAgbWVudUl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgIHRleHQ6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMjU3JywgJycpLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiB0aGlzLm9uUmVtb3ZlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsYWJlbCA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGF2YXRhciA9IHVuZGVmaW5lZDtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwidXNlclwiOlxuICAgICAgICAgICAgICAgIGxhYmVsID0gY2VsbEFjbC5Vc2VyLkF0dHJpYnV0ZXNbXCJkaXNwbGF5TmFtZVwiXSB8fCBjZWxsQWNsLlVzZXIuTG9naW47XG4gICAgICAgICAgICAgICAgYXZhdGFyID0gY2VsbEFjbC5Vc2VyLkF0dHJpYnV0ZXNbXCJhdmF0YXJcIl07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiZ3JvdXBcIjpcbiAgICAgICAgICAgICAgICBpZiAoIWNlbGxBY2wuR3JvdXAuQXR0cmlidXRlcykge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IGNlbGxBY2wuR3JvdXAuVXVpZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IGNlbGxBY2wuR3JvdXAuQXR0cmlidXRlc1tcImRpc3BsYXlOYW1lXCJdIHx8IGNlbGxBY2wuR3JvdXAuR3JvdXBMYWJlbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwidGVhbVwiOlxuICAgICAgICAgICAgICAgIGlmICghY2VsbEFjbC5Sb2xlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsID0gXCJObyByb2xlIGZvdW5kXCI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBjZWxsQWNsLlJvbGUuTGFiZWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBsYWJlbCA9IGNlbGxBY2wuUm9sZUlkO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZWFkID0gZmFsc2UsXG4gICAgICAgICAgICB3cml0ZSA9IGZhbHNlO1xuICAgICAgICBjZWxsQWNsLkFjdGlvbnMubWFwKGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGlmIChhY3Rpb24uTmFtZSA9PT0gJ3JlYWQnKSByZWFkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChhY3Rpb24uTmFtZSA9PT0gJ3dyaXRlJykgd3JpdGUgPSB0cnVlO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgIF9Vc2VyQmFkZ2UyWydkZWZhdWx0J10sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICAgICAgICAgIGF2YXRhcjogYXZhdGFyLFxuICAgICAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICAgICAgbWVudXM6IG1lbnVJdGVtc1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAndXNlci1iYWRnZS1yaWdodHMtY29udGFpbmVyJywgc3R5bGU6ICFtZW51SXRlbXMubGVuZ3RoID8geyBtYXJnaW5SaWdodDogNDggfSA6IHt9IH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7IHR5cGU6ICdjaGVja2JveCcsIG5hbWU6ICdyZWFkJywgZGlzYWJsZWQ6IHRoaXMucHJvcHMuaXNSZWFkb25seSgpIHx8IHRoaXMucHJvcHMucmVhZG9ubHksIGNoZWNrZWQ6IHJlYWQsIG9uQ2hhbmdlOiB0aGlzLm9uVXBkYXRlUmlnaHQgfSksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7IHR5cGU6ICdjaGVja2JveCcsIG5hbWU6ICd3cml0ZScsIGRpc2FibGVkOiB0aGlzLnByb3BzLmlzUmVhZG9ubHkoKSB8fCB0aGlzLnByb3BzLnJlYWRvbmx5LCBjaGVja2VkOiB3cml0ZSwgb25DaGFuZ2U6IHRoaXMub25VcGRhdGVSaWdodCB9KVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBTaGFyZWRVc2VyRW50cnkgPSAoMCwgX1NoYXJlQ29udGV4dENvbnN1bWVyMlsnZGVmYXVsdCddKShTaGFyZWRVc2VyRW50cnkpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gU2hhcmVkVXNlckVudHJ5O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyID0gcmVxdWlyZSgnLi4vU2hhcmVDb250ZXh0Q29uc3VtZXInKTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TaGFyZUNvbnRleHRDb25zdW1lcik7XG5cbnZhciBfVXNlckJhZGdlID0gcmVxdWlyZSgnLi9Vc2VyQmFkZ2UnKTtcblxudmFyIF9Vc2VyQmFkZ2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVXNlckJhZGdlKTtcblxudmFyIF9TaGFyZWRVc2VyRW50cnkgPSByZXF1aXJlKCcuL1NoYXJlZFVzZXJFbnRyeScpO1xuXG52YXIgX1NoYXJlZFVzZXJFbnRyeTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TaGFyZWRVc2VyRW50cnkpO1xuXG52YXIgX21haW5BY3Rpb25CdXR0b24gPSByZXF1aXJlKCcuLi9tYWluL0FjdGlvbkJ1dHRvbicpO1xuXG52YXIgX21haW5BY3Rpb25CdXR0b24yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpbkFjdGlvbkJ1dHRvbik7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2NvbXBvbmVudHMnKTtcblxudmFyIFVzZXJzQ29tcGxldGVyID0gX1B5ZGlvJHJlcXVpcmVMaWIuVXNlcnNDb21wbGV0ZXI7XG5cbnZhciBTaGFyZWRVc2VycyA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdTaGFyZWRVc2VycycsXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgcHlkaW86IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuaW5zdGFuY2VPZihfcHlkaW8yWydkZWZhdWx0J10pLFxuXG4gICAgICAgIGNlbGxBY2xzOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm9iamVjdCxcblxuICAgICAgICBzYXZlU2VsZWN0aW9uQXNUZWFtOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIHNlbmRJbnZpdGF0aW9uczogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jLFxuICAgICAgICBzaG93VGl0bGU6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuYm9vbCxcblxuICAgICAgICBvblVzZXJPYmplY3RBZGQ6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICBvblVzZXJPYmplY3RSZW1vdmU6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICBvblVzZXJPYmplY3RVcGRhdGVSaWdodDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWRcblxuICAgIH0sXG4gICAgc2VuZEludml0YXRpb25Ub0FsbFVzZXJzOiBmdW5jdGlvbiBzZW5kSW52aXRhdGlvblRvQWxsVXNlcnMoKSB7XG4gICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgY2VsbEFjbHMgPSBfcHJvcHMuY2VsbEFjbHM7XG4gICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcblxuICAgICAgICB2YXIgdXNlck9iamVjdHMgPSBbXTtcbiAgICAgICAgT2JqZWN0LmtleXMoY2VsbEFjbHMpLm1hcChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgdmFyIGFjbCA9IGNlbGxBY2xzW2tdO1xuICAgICAgICAgICAgaWYgKGFjbC5Vc2VyICYmIGFjbC5Vc2VyLkxvZ2luID09PSBweWRpby51c2VyLmlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFjbC5Vc2VyKSB7XG4gICAgICAgICAgICAgICAgdmFyIHVzZXJPYmplY3QgPSBQeWRpb1VzZXJzLlVzZXIuZnJvbUlkbVVzZXIoYWNsLlVzZXIpO1xuICAgICAgICAgICAgICAgIHVzZXJPYmplY3RzW3VzZXJPYmplY3QuZ2V0SWQoKV0gPSB1c2VyT2JqZWN0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wcm9wcy5zZW5kSW52aXRhdGlvbnModXNlck9iamVjdHMpO1xuICAgIH0sXG4gICAgY2xlYXJBbGxVc2VyczogZnVuY3Rpb24gY2xlYXJBbGxVc2VycygpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLnByb3BzLmNlbGxBY2xzKS5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgIF90aGlzLnByb3BzLm9uVXNlck9iamVjdFJlbW92ZShrKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICB2YWx1ZVNlbGVjdGVkOiBmdW5jdGlvbiB2YWx1ZVNlbGVjdGVkKHVzZXJPYmplY3QpIHtcbiAgICAgICAgaWYgKHVzZXJPYmplY3QuSWRtVXNlcikge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblVzZXJPYmplY3RBZGQodXNlck9iamVjdC5JZG1Vc2VyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25Vc2VyT2JqZWN0QWRkKHVzZXJPYmplY3QuSWRtUm9sZSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBjZWxsQWNscyA9IF9wcm9wczIuY2VsbEFjbHM7XG4gICAgICAgIHZhciBweWRpbyA9IF9wcm9wczIucHlkaW87XG5cbiAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgdmFyIHVzZXJFbnRyaWVzID0gW107XG4gICAgICAgIE9iamVjdC5rZXlzKGNlbGxBY2xzKS5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgIHZhciBhY2wgPSBjZWxsQWNsc1trXTtcbiAgICAgICAgICAgIGlmIChhY2wuVXNlciAmJiBhY2wuVXNlci5Mb2dpbiA9PT0gcHlkaW8udXNlci5pZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICB1c2VyRW50cmllcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9TaGFyZWRVc2VyRW50cnkyWydkZWZhdWx0J10sIHtcbiAgICAgICAgICAgICAgICBjZWxsQWNsOiBhY2wsXG4gICAgICAgICAgICAgICAga2V5OiBpbmRleCxcbiAgICAgICAgICAgICAgICBweWRpbzogX3RoaXMyLnByb3BzLnB5ZGlvLFxuICAgICAgICAgICAgICAgIHJlYWRvbmx5OiBfdGhpczIucHJvcHMucmVhZG9ubHksXG4gICAgICAgICAgICAgICAgc2VuZEludml0YXRpb25zOiBfdGhpczIucHJvcHMuc2VuZEludml0YXRpb25zLFxuICAgICAgICAgICAgICAgIG9uVXNlck9iamVjdFJlbW92ZTogX3RoaXMyLnByb3BzLm9uVXNlck9iamVjdFJlbW92ZSxcbiAgICAgICAgICAgICAgICBvblVzZXJPYmplY3RVcGRhdGVSaWdodDogX3RoaXMyLnByb3BzLm9uVXNlck9iamVjdFVwZGF0ZVJpZ2h0XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBhY3Rpb25MaW5rcyA9IFtdO1xuICAgICAgICB2YXIgYWNsc0xlbmd0aCA9IE9iamVjdC5rZXlzKHRoaXMucHJvcHMuY2VsbEFjbHMpLmxlbmd0aDtcbiAgICAgICAgaWYgKGFjbHNMZW5ndGggJiYgIXRoaXMucHJvcHMuaXNSZWFkb25seSgpICYmICF0aGlzLnByb3BzLnJlYWRvbmx5KSB7XG4gICAgICAgICAgICBhY3Rpb25MaW5rcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYWluQWN0aW9uQnV0dG9uMlsnZGVmYXVsdCddLCB7IGtleTogJ2NsZWFyJywgY2FsbGJhY2s6IHRoaXMuY2xlYXJBbGxVc2VycywgbWRpSWNvbjogJ2RlbGV0ZScsIG1lc3NhZ2VJZDogJzE4MCcgfSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhY2xzTGVuZ3RoICYmIHRoaXMucHJvcHMuc2VuZEludml0YXRpb25zKSB7XG4gICAgICAgICAgICBhY3Rpb25MaW5rcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYWluQWN0aW9uQnV0dG9uMlsnZGVmYXVsdCddLCB7IGtleTogJ2ludml0ZScsIGNhbGxiYWNrOiB0aGlzLnNlbmRJbnZpdGF0aW9uVG9BbGxVc2VycywgbWRpSWNvbjogJ2VtYWlsLW91dGxpbmUnLCBtZXNzYWdlSWQ6ICc0NScgfSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnNhdmVTZWxlY3Rpb25Bc1RlYW0gJiYgYWNsc0xlbmd0aCA+IDEgJiYgIXRoaXMucHJvcHMuaXNSZWFkb25seSgpICYmICF0aGlzLnByb3BzLnJlYWRvbmx5KSB7XG4gICAgICAgICAgICBhY3Rpb25MaW5rcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYWluQWN0aW9uQnV0dG9uMlsnZGVmYXVsdCddLCB7IGtleTogJ3RlYW0nLCBjYWxsYmFjazogdGhpcy5wcm9wcy5zYXZlU2VsZWN0aW9uQXNUZWFtLCBtZGlJY29uOiAnYWNjb3VudC1tdWx0aXBsZS1wbHVzJywgbWVzc2FnZUlkOiAnNTA5JywgbWVzc2FnZUNvcmVOYW1lc3BhY2U6IHRydWUgfSkpO1xuICAgICAgICB9XG4gICAgICAgIHZhciByd0hlYWRlciA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHVzZXJzSW5wdXQgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh1c2VyRW50cmllcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJ3SGVhZGVyID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIG1hcmdpbkJvdHRvbTogLTgsIG1hcmdpblRvcDogLTgsIGNvbG9yOiAncmdiYSgwLDAsMCwuMzMpJywgZm9udFNpemU6IDEyIH0gfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnZGl2JywgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiA0MywgdGV4dEFsaWduOiAnY2VudGVyJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBib3JkZXJCb3R0b206ICcycHggc29saWQgcmdiYSgwLDAsMCwwLjEzKScgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCczNjEnLCAnJylcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiA0MywgdGV4dEFsaWduOiAnY2VudGVyJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBib3JkZXJCb3R0b206ICcycHggc29saWQgcmdiYSgwLDAsMCwwLjEzKScgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcxODEnKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnZGl2JywgeyBzdHlsZTogeyB3aWR0aDogNTIgfSB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMucHJvcHMuaXNSZWFkb25seSgpICYmICF0aGlzLnByb3BzLnJlYWRvbmx5KSB7XG4gICAgICAgICAgICB2YXIgZXhjbHVkZXMgPSBPYmplY3QudmFsdWVzKGNlbGxBY2xzKS5tYXAoZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoYS5Vc2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhLlVzZXIuTG9naW47XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhLkdyb3VwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhLkdyb3VwLlV1aWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhLlJvbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGEuUm9sZS5VdWlkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmZpbHRlcihmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgICAgIHJldHVybiAhIWs7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHVzZXJzSW5wdXQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChVc2Vyc0NvbXBsZXRlciwge1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ3NoYXJlLWZvcm0tdXNlcnMnLFxuICAgICAgICAgICAgICAgIGZpZWxkTGFiZWw6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMzQnKSxcbiAgICAgICAgICAgICAgICBvblZhbHVlU2VsZWN0ZWQ6IHRoaXMudmFsdWVTZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBweWRpbzogdGhpcy5wcm9wcy5weWRpbyxcbiAgICAgICAgICAgICAgICBzaG93QWRkcmVzc0Jvb2s6IHRydWUsXG4gICAgICAgICAgICAgICAgdXNlcnNGcm9tOiAnbG9jYWwnLFxuICAgICAgICAgICAgICAgIGV4Y2x1ZGVzOiBleGNsdWRlc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB1c2VyRW50cmllcy5sZW5ndGggPyB7IG1hcmdpbjogJy0yMHB4IDhweCAxNnB4JyB9IDogeyBtYXJnaW5Ub3A6IC0yMCB9IH0sXG4gICAgICAgICAgICAgICAgdXNlcnNJbnB1dFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIHJ3SGVhZGVyLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICB1c2VyRW50cmllc1xuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICF1c2VyRW50cmllcy5sZW5ndGggJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBjb2xvcjogJ3JnYmEoMCwwLDAsMC40MyknIH0gfSxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE4MicpXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgdXNlckVudHJpZXMubGVuZ3RoID4gMCAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHRleHRBbGlnbjogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgIGFjdGlvbkxpbmtzXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFNoYXJlZFVzZXJzID0gKDAsIF9TaGFyZUNvbnRleHRDb25zdW1lcjJbJ2RlZmF1bHQnXSkoU2hhcmVkVXNlcnMpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gU2hhcmVkVXNlcnM7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZXF1aXJlID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIENvbXBvbmVudCA9IF9yZXF1aXJlLkNvbXBvbmVudDtcbnZhciBQcm9wVHlwZXMgPSBfcmVxdWlyZS5Qcm9wVHlwZXM7XG5cbnZhciBfcmVxdWlyZTIgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgTWVudUl0ZW0gPSBfcmVxdWlyZTIuTWVudUl0ZW07XG52YXIgSWNvbk1lbnUgPSBfcmVxdWlyZTIuSWNvbk1lbnU7XG52YXIgSWNvbkJ1dHRvbiA9IF9yZXF1aXJlMi5JY29uQnV0dG9uO1xuXG52YXIgX3JlcXVpcmUzID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWkvc3R5bGVzJyk7XG5cbnZhciBtdWlUaGVtZWFibGUgPSBfcmVxdWlyZTMubXVpVGhlbWVhYmxlO1xuXG52YXIgQ29sb3IgPSByZXF1aXJlKCdjb2xvcicpO1xuXG52YXIgVXNlckJhZGdlID0gKGZ1bmN0aW9uIChfQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFVzZXJCYWRnZSwgX0NvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBVc2VyQmFkZ2UoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBVc2VyQmFkZ2UpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFVzZXJCYWRnZS5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhVc2VyQmFkZ2UsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlck1lbnUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyTWVudSgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5wcm9wcy5tZW51cyB8fCAhdGhpcy5wcm9wcy5tZW51cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBtZW51SXRlbXMgPSB0aGlzLnByb3BzLm1lbnVzLm1hcChmdW5jdGlvbiAobSkge1xuICAgICAgICAgICAgICAgIHZhciByaWdodEljb24gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKG0uY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICByaWdodEljb24gPSBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdtZGkgbWRpLWNoZWNrJyB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTWVudUl0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeVRleHQ6IG0udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFRhcDogbS5jYWxsYmFjayxcbiAgICAgICAgICAgICAgICAgICAgcmlnaHRJY29uOiByaWdodEljb24gfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBpY29uU3R5bGUgPSB7IGZvbnRTaXplOiAxOCB9O1xuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgSWNvbk1lbnUsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpY29uQnV0dG9uRWxlbWVudDogUmVhY3QuY3JlYXRlRWxlbWVudChJY29uQnV0dG9uLCB7IHN0eWxlOiB7IHBhZGRpbmc6IDE2IH0sIGljb25TdHlsZTogaWNvblN0eWxlLCBpY29uQ2xhc3NOYW1lOiAnaWNvbi1lbGxpcHNpcy12ZXJ0aWNhbCcgfSksXG4gICAgICAgICAgICAgICAgICAgIGFuY2hvck9yaWdpbjogeyBob3Jpem9udGFsOiAncmlnaHQnLCB2ZXJ0aWNhbDogJ3RvcCcgfSxcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0T3JpZ2luOiB7IGhvcml6b250YWw6ICdyaWdodCcsIHZlcnRpY2FsOiAndG9wJyB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBtZW51SXRlbXNcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgYXZhdGFyID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdmFyIGF2YXRhckNvbG9yID0gdGhpcy5wcm9wcy5tdWlUaGVtZS5wYWxldHRlLmF2YXRhcnNDb2xvcjtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnR5cGUgPT0gJ2dyb3VwJykge1xuICAgICAgICAgICAgICAgIGF2YXRhckNvbG9yID0gQ29sb3IoYXZhdGFyQ29sb3IpLmRhcmtlbiguMikudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBhdmF0YXIgPSBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdhdmF0YXIgbWRpIG1kaS1hY2NvdW50LW11bHRpcGxlJywgc3R5bGU6IHsgYmFja2dyb3VuZENvbG9yOiBhdmF0YXJDb2xvciB9IH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnR5cGUgPT0gJ3RlYW0nKSB7XG4gICAgICAgICAgICAgICAgYXZhdGFyQ29sb3IgPSBDb2xvcihhdmF0YXJDb2xvcikuZGFya2VuKC4yKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIGF2YXRhciA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ2F2YXRhciBtZGkgbWRpLWFjY291bnQtbXVsdGlwbGUtb3V0bGluZScsIHN0eWxlOiB7IGJhY2tncm91bmRDb2xvcjogYXZhdGFyQ29sb3IgfSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy50eXBlID09ICd0ZW1wb3JhcnknKSB7XG4gICAgICAgICAgICAgICAgYXZhdGFyQ29sb3IgPSBDb2xvcihhdmF0YXJDb2xvcikubGlnaHRlbiguMikudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBhdmF0YXIgPSBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdhdmF0YXIgbWRpIG1kaS1hY2NvdW50LXBsdXMnLCBzdHlsZTogeyBiYWNrZ3JvdW5kQ29sb3I6IGF2YXRhckNvbG9yIH0gfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMudHlwZSA9PSAncmVtb3RlX3VzZXInKSB7XG4gICAgICAgICAgICAgICAgYXZhdGFyID0gUmVhY3QuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnYXZhdGFyIG1kaSBtZGktYWNjb3VudC1uZXR3b3JrJywgc3R5bGU6IHsgYmFja2dyb3VuZENvbG9yOiBhdmF0YXJDb2xvciB9IH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhdmF0YXIgPSBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdhdmF0YXIgbWRpIG1kaS1hY2NvdW50Jywgc3R5bGU6IHsgYmFja2dyb3VuZENvbG9yOiBhdmF0YXJDb2xvciB9IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG1lbnUgPSB0aGlzLnJlbmRlck1lbnUoKTtcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcInNoYXJlLWRpYWxvZyB1c2VyLWJhZGdlIHVzZXItdHlwZS1cIiArIHRoaXMucHJvcHMudHlwZSB9LFxuICAgICAgICAgICAgICAgIGF2YXRhcixcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAndXNlci1iYWRnZS1sYWJlbCcgfSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5sYWJlbFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5jaGlsZHJlbixcbiAgICAgICAgICAgICAgICBtZW51XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFVzZXJCYWRnZTtcbn0pKENvbXBvbmVudCk7XG5cblVzZXJCYWRnZS5wcm9wVHlwZXMgPSB7XG4gICAgbGFiZWw6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgYXZhdGFyOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHR5cGU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgbWVudXM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgbXVpVGhlbWU6IFByb3BUeXBlcy5vYmplY3Rcbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFVzZXJCYWRnZSA9IG11aVRoZW1lYWJsZSgpKFVzZXJCYWRnZSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFVzZXJCYWRnZTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX0NvbXBvc2l0ZU1vZGVsID0gcmVxdWlyZSgnLi9Db21wb3NpdGVNb2RlbCcpO1xuXG52YXIgX0NvbXBvc2l0ZU1vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NvbXBvc2l0ZU1vZGVsKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIgPSByZXF1aXJlKCcuLi9tYWluL1NoYXJlSGVscGVyJyk7XG5cbnZhciBfbWFpblNoYXJlSGVscGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21haW5TaGFyZUhlbHBlcik7XG5cbnZhciBfY2VsbHNTaGFyZWRVc2VycyA9IHJlcXVpcmUoJy4uL2NlbGxzL1NoYXJlZFVzZXJzJyk7XG5cbnZhciBfY2VsbHNTaGFyZWRVc2VyczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jZWxsc1NoYXJlZFVzZXJzKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX21hdGVyaWFsVWlTdHlsZXMgPSByZXF1aXJlKCdtYXRlcmlhbC11aS9zdHlsZXMnKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIENlbGxzTGlzdCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhDZWxsc0xpc3QsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gQ2VsbHNMaXN0KHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDZWxsc0xpc3QpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKENlbGxzTGlzdC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHsgZWRpdDogbnVsbCB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhDZWxsc0xpc3QsIFt7XG4gICAgICAgIGtleTogJ2FkZFRvQ2VsbHNNZW51SXRlbXMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gYWRkVG9DZWxsc01lbnVJdGVtcygpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBpdGVtcyA9IFtdO1xuICAgICAgICAgICAgLy8gTGlzdCB1c2VyIGF2YWlsYWJsZSBjZWxscyAtIEV4Y2x1ZGUgY2VsbHMgd2hlcmUgdGhpcyBub2RlIGlzIGFscmVhZHkgc2hhcmVkXG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcbiAgICAgICAgICAgIHZhciBjb21wb3NpdGVNb2RlbCA9IF9wcm9wcy5jb21wb3NpdGVNb2RlbDtcblxuICAgICAgICAgICAgdmFyIGN1cnJlbnRDZWxscyA9IGNvbXBvc2l0ZU1vZGVsLmdldENlbGxzKCkubWFwKGZ1bmN0aW9uIChjZWxsTW9kZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2VsbE1vZGVsLmdldFV1aWQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcHlkaW8udXNlci5nZXRSZXBvc2l0b3JpZXNMaXN0KCkuZm9yRWFjaChmdW5jdGlvbiAocmVwb3NpdG9yeSkge1xuICAgICAgICAgICAgICAgIGlmIChyZXBvc2l0b3J5LmdldE93bmVyKCkgPT09ICdzaGFyZWQnICYmIGN1cnJlbnRDZWxscy5pbmRleE9mKHJlcG9zaXRvcnkuZ2V0SWQoKSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0b3VjaFRhcCA9IGZ1bmN0aW9uIHRvdWNoVGFwKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBhZGRNZW51T3BlbjogZmFsc2UgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb3NpdGVNb2RlbC5hZGRUb0V4aXN0aW5nQ2VsbChyZXBvc2l0b3J5LmdldElkKCkpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHByaW1hcnlUZXh0OiByZXBvc2l0b3J5LmdldExhYmVsKCksIG9uVG91Y2hUYXA6IHRvdWNoVGFwIH0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBpdGVtcztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgY29tcG9zaXRlTW9kZWwgPSBfcHJvcHMyLmNvbXBvc2l0ZU1vZGVsO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzMi5weWRpbztcbiAgICAgICAgICAgIHZhciB1c2Vyc0ludml0YXRpb25zID0gX3Byb3BzMi51c2Vyc0ludml0YXRpb25zO1xuICAgICAgICAgICAgdmFyIG11aVRoZW1lID0gX3Byb3BzMi5tdWlUaGVtZTtcblxuICAgICAgICAgICAgdmFyIG0gPSBmdW5jdGlvbiBtKGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHB5ZGlvLk1lc3NhZ2VIYXNoWydzaGFyZV9jZW50ZXIuJyArIGlkXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgZWRpdCA9IHRoaXMuc3RhdGUuZWRpdDtcblxuICAgICAgICAgICAgdmFyIGNlbGxzID0gW107XG4gICAgICAgICAgICBjb21wb3NpdGVNb2RlbC5nZXRDZWxscygpLm1hcChmdW5jdGlvbiAoY2VsbE1vZGVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsID0gY2VsbE1vZGVsLmdldExhYmVsKCk7XG4gICAgICAgICAgICAgICAgdmFyIGlzRWRpdCA9ICFjZWxsTW9kZWwuZ2V0VXVpZCgpICYmIGVkaXQgPT09ICdORVdDRUxMJyB8fCBlZGl0ID09PSBjZWxsTW9kZWwuZ2V0VXVpZCgpO1xuICAgICAgICAgICAgICAgIHZhciB0b2dnbGVTdGF0ZSA9IGZ1bmN0aW9uIHRvZ2dsZVN0YXRlKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNFZGl0ICYmIGVkaXQgPT09ICdORVdDRUxMJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIG5ldyBjZWxsIGlmIGl0IHdhcyBjcmVhdGVkIGVtcHR5XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWNscyA9IGNlbGxNb2RlbC5nZXRBY2xzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIU9iamVjdC5rZXlzKGFjbHMpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvc2l0ZU1vZGVsLnJlbW92ZU5ld0NlbGwoY2VsbE1vZGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBlZGl0OiBpc0VkaXQgPyBudWxsIDogY2VsbE1vZGVsLmdldFV1aWQoKSB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdmFyIHJlbW92ZU5vZGUgPSBmdW5jdGlvbiByZW1vdmVOb2RlKCkge1xuICAgICAgICAgICAgICAgICAgICBjZWxsTW9kZWwucmVtb3ZlUm9vdE5vZGUoY29tcG9zaXRlTW9kZWwuZ2V0Tm9kZSgpLmdldE1ldGFkYXRhKCkuZ2V0KCd1dWlkJykpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdmFyIHJpZ2h0SWNvbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBpZiAoaXNFZGl0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0SWNvbiA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgaWNvbkNsYXNzTmFtZTogXCJtZGkgbWRpLWNsb3NlXCIsIHRvb2x0aXA6IHB5ZGlvLk1lc3NhZ2VIYXNoWyc4NiddLCBvblRvdWNoVGFwOiB0b2dnbGVTdGF0ZSB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNlbGxNb2RlbC5pc0VkaXRhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmlnaHRJY29uID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5JY29uTWVudSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uQnV0dG9uRWxlbWVudDogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBpY29uQ2xhc3NOYW1lOiBcIm1kaSBtZGktZG90cy12ZXJ0aWNhbFwiIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuY2hvck9yaWdpbjogeyBob3Jpem9udGFsOiAncmlnaHQnLCB2ZXJ0aWNhbDogJ3RvcCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRPcmlnaW46IHsgaG9yaXpvbnRhbDogJ3JpZ2h0JywgdmVydGljYWw6ICd0b3AnIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyBwcmltYXJ5VGV4dDogbSgyNTgpLCBvblRvdWNoVGFwOiB0b2dnbGVTdGF0ZSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHByaW1hcnlUZXh0OiBtKDI1OSksIG9uVG91Y2hUYXA6IHJlbW92ZU5vZGUgfSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2VsbHMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5MaXN0SXRlbSwge1xuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5VGV4dDogbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeVRleHQ6IGNlbGxNb2RlbC5nZXRBY2xzU3ViamVjdHMoKSxcbiAgICAgICAgICAgICAgICAgICAgcmlnaHRJY29uQnV0dG9uOiByaWdodEljb24sXG4gICAgICAgICAgICAgICAgICAgIG9uVG91Y2hUYXA6IHRvZ2dsZVN0YXRlLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogaXNFZGl0ID8geyBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2IoMjQ1LCAyNDUsIDI0NSknIH0gOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGVkaXQgPT09ICdORVdDRUxMJyAmJiAhaXNFZGl0XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIGlmIChpc0VkaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2VsbHMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBhcGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyB6RGVwdGg6IDAsIHN0eWxlOiB7IGJhY2tncm91bmRDb2xvcjogJ3JnYigyNDUsIDI0NSwgMjQ1KScsIG1hcmdpbjogJzAgMCAxNnB4JywgcGFkZGluZzogJzAgMTBweCAxMHB4JyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfY2VsbHNTaGFyZWRVc2VyczJbJ2RlZmF1bHQnXSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjZWxsQWNsczogY2VsbE1vZGVsLmdldEFjbHMoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGNsdWRlczogW3B5ZGlvLnVzZXIuaWRdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVXNlck9iamVjdEFkZDogY2VsbE1vZGVsLmFkZFVzZXIuYmluZChjZWxsTW9kZWwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVXNlck9iamVjdFJlbW92ZTogY2VsbE1vZGVsLnJlbW92ZVVzZXIuYmluZChjZWxsTW9kZWwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVXNlck9iamVjdFVwZGF0ZVJpZ2h0OiBjZWxsTW9kZWwudXBkYXRlVXNlclJpZ2h0LmJpbmQoY2VsbE1vZGVsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZW5kSW52aXRhdGlvbnM6IGZ1bmN0aW9uICh0YXJnZXRVc2Vycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdXNlcnNJbnZpdGF0aW9ucyh0YXJnZXRVc2VycywgY2VsbE1vZGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVTZWxlY3Rpb25Bc1RlYW06IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRvbmx5OiAhY2VsbE1vZGVsLmlzRWRpdGFibGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNlbGxzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRGl2aWRlciwgbnVsbCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjZWxscy5wb3AoKTtcblxuICAgICAgICAgICAgdmFyIGxlZ2VuZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChjZWxscy5sZW5ndGggJiYgZWRpdCAhPT0gJ05FV0NFTEwnKSB7XG4gICAgICAgICAgICAgICAgbGVnZW5kID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBtKDI2MClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjZWxscy5sZW5ndGggJiYgZWRpdCA9PT0gJ05FV0NFTEwnKSB7XG4gICAgICAgICAgICAgICAgbGVnZW5kID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBtKDI2MSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZWdlbmQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogJzIxcHggMTZweCAyMXB4IDBweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInIH0sIG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb3NpdGVNb2RlbC5jcmVhdGVFbXB0eUNlbGwoKTtfdGhpczIuc2V0U3RhdGUoeyBlZGl0OiAnTkVXQ0VMTCcgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgaWNvbkNsYXNzTmFtZTogXCJpY29tb29uLWNlbGxzLWNsZWFyLXBsdXNcIiwgaWNvblN0eWxlOiB7IGNvbG9yOiBtdWlUaGVtZS5wYWxldHRlLnByaW1hcnkxQ29sb3IgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZsZXg6IDEsIG1hcmdpbkxlZnQ6IDggfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgyNjIpXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgYWRkQ2VsbEl0ZW1zID0gdGhpcy5hZGRUb0NlbGxzTWVudUl0ZW1zKCk7XG4gICAgICAgICAgICB2YXIgYWRkVG9DZWxsTWVudSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChhZGRDZWxsSXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgYWRkVG9DZWxsTWVudSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhaXNlZEJ1dHRvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgbWFyZ2luTGVmdDogMTAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogbSgyNjMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFRhcDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgYWRkTWVudU9wZW46IHRydWUsIGFkZE1lbnVBbmNob3I6IGV2ZW50LnRhcmdldCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUG9wb3ZlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiB0aGlzLnN0YXRlLmFkZE1lbnVPcGVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuY2hvckVsOiB0aGlzLnN0YXRlLmFkZE1lbnVBbmNob3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25SZXF1ZXN0Q2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgYWRkTWVudU9wZW46IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiB7IGhvcml6b250YWw6ICdsZWZ0JywgdmVydGljYWw6ICdib3R0b20nIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0T3JpZ2luOiB7IGhvcml6b250YWw6ICdsZWZ0JywgdmVydGljYWw6ICd0b3AnIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5NZW51LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkQ2VsbEl0ZW1zXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgYXV0aCA9IF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uZ2V0QXV0aG9yaXphdGlvbnMocHlkaW8pO1xuICAgICAgICAgICAgaWYgKGNvbXBvc2l0ZU1vZGVsLmdldE5vZGUoKSkge1xuICAgICAgICAgICAgICAgIHZhciBub2RlTGVhZiA9IGNvbXBvc2l0ZU1vZGVsLmdldE5vZGUoKS5pc0xlYWYoKTtcbiAgICAgICAgICAgICAgICB2YXIgY2FuU2hhcmUgPSBub2RlTGVhZiAmJiBhdXRoLmZpbGVfd29ya3NwYWNlcyB8fCAhbm9kZUxlYWYgJiYgYXV0aC5mb2xkZXJfd29ya3NwYWNlcztcbiAgICAgICAgICAgICAgICBpZiAoIWNhblNoYXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmb250U2l6ZTogMTMsIGZvbnRXZWlnaHQ6IDUwMCwgY29sb3I6ICdyZ2JhKDAsIDAsIDAsIDAuNDMpJywgcGFkZGluZzogOCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtKG5vZGVMZWFmID8gJzIyNycgOiAnMjI4JylcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nQm90dG9tOiAyMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhaXNlZEJ1dHRvbiwgeyBsYWJlbDogbSgyNjQpLCBwcmltYXJ5OiB0cnVlLCBvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9zaXRlTW9kZWwuY3JlYXRlRW1wdHlDZWxsKCk7X3RoaXMyLnNldFN0YXRlKHsgZWRpdDogJ05FV0NFTEwnIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgYWRkVG9DZWxsTWVudVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogNTAwLCBjb2xvcjogJ3JnYmEoMCwgMCwgMCwgMC40MyknIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgbGVnZW5kXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuTGlzdCxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgY2VsbHNcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIENlbGxzTGlzdDtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5DZWxsc0xpc3QuUHJvcFR5cGVzID0ge1xuICAgIHB5ZGlvOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoX3B5ZGlvMlsnZGVmYXVsdCddKSxcbiAgICBjb21wb3NpdGVNb2RlbDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKF9Db21wb3NpdGVNb2RlbDJbJ2RlZmF1bHQnXSkuaXNSZXF1aXJlZCxcbiAgICB1c2Vyc0ludml0YXRpb25zOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmNcbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IENlbGxzTGlzdCA9ICgwLCBfbWF0ZXJpYWxVaVN0eWxlcy5tdWlUaGVtZWFibGUpKCkoQ2VsbHNMaXN0KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ2VsbHNMaXN0O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfbWFpbkdlbmVyaWNDYXJkID0gcmVxdWlyZSgnLi4vbWFpbi9HZW5lcmljQ2FyZCcpO1xuXG52YXIgX2NvbXBvc2l0ZUNvbXBvc2l0ZU1vZGVsID0gcmVxdWlyZSgnLi4vY29tcG9zaXRlL0NvbXBvc2l0ZU1vZGVsJyk7XG5cbnZhciBfY29tcG9zaXRlQ29tcG9zaXRlTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY29tcG9zaXRlQ29tcG9zaXRlTW9kZWwpO1xuXG52YXIgX21haW5HZW5lcmljRWRpdG9yID0gcmVxdWlyZSgnLi4vbWFpbi9HZW5lcmljRWRpdG9yJyk7XG5cbnZhciBfbWFpbkdlbmVyaWNFZGl0b3IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpbkdlbmVyaWNFZGl0b3IpO1xuXG52YXIgX2xpbmtzUGFuZWwgPSByZXF1aXJlKCcuLi9saW5rcy9QYW5lbCcpO1xuXG52YXIgX2xpbmtzUGFuZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbGlua3NQYW5lbCk7XG5cbnZhciBfbGlua3NTZWN1cmVPcHRpb25zID0gcmVxdWlyZSgnLi4vbGlua3MvU2VjdXJlT3B0aW9ucycpO1xuXG52YXIgX2xpbmtzU2VjdXJlT3B0aW9uczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9saW5rc1NlY3VyZU9wdGlvbnMpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlciA9IHJlcXVpcmUoJy4uL21haW4vU2hhcmVIZWxwZXInKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9NYWlsZXIgPSByZXF1aXJlKCcuL01haWxlcicpO1xuXG52YXIgX01haWxlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9NYWlsZXIpO1xuXG52YXIgX0NlbGxzTGlzdCA9IHJlcXVpcmUoJy4vQ2VsbHNMaXN0Jyk7XG5cbnZhciBfQ2VsbHNMaXN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NlbGxzTGlzdCk7XG5cbnZhciBfY2xpcGJvYXJkID0gcmVxdWlyZSgnY2xpcGJvYXJkJyk7XG5cbnZhciBfY2xpcGJvYXJkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NsaXBib2FyZCk7XG5cbnZhciBfbGlua3NQdWJsaWNMaW5rVGVtcGxhdGUgPSByZXF1aXJlKCcuLi9saW5rcy9QdWJsaWNMaW5rVGVtcGxhdGUnKTtcblxudmFyIF9saW5rc1B1YmxpY0xpbmtUZW1wbGF0ZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9saW5rc1B1YmxpY0xpbmtUZW1wbGF0ZSk7XG5cbnZhciBfbGlua3NWaXNpYmlsaXR5UGFuZWwgPSByZXF1aXJlKCcuLi9saW5rcy9WaXNpYmlsaXR5UGFuZWwnKTtcblxudmFyIF9saW5rc1Zpc2liaWxpdHlQYW5lbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9saW5rc1Zpc2liaWxpdHlQYW5lbCk7XG5cbnZhciBfbGlua3NMYWJlbFBhbmVsID0gcmVxdWlyZSgnLi4vbGlua3MvTGFiZWxQYW5lbCcpO1xuXG52YXIgX2xpbmtzTGFiZWxQYW5lbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9saW5rc0xhYmVsUGFuZWwpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfcmVxdWlyZSRyZXF1aXJlTGliID0gcmVxdWlyZSgncHlkaW8nKS5yZXF1aXJlTGliKCdob2MnKTtcblxudmFyIFBhbGV0dGVNb2RpZmllciA9IF9yZXF1aXJlJHJlcXVpcmVMaWIuUGFsZXR0ZU1vZGlmaWVyO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYihcImJvb3RcIik7XG5cbnZhciBUb29sdGlwID0gX1B5ZGlvJHJlcXVpcmVMaWIuVG9vbHRpcDtcblxudmFyIENvbXBvc2l0ZUNhcmQgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoQ29tcG9zaXRlQ2FyZCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBDb21wb3NpdGVDYXJkKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDb21wb3NpdGVDYXJkKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihDb21wb3NpdGVDYXJkLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgbW9kZTogdGhpcy5wcm9wcy5tb2RlIHx8ICd2aWV3JyxcbiAgICAgICAgICAgIG1vZGVsOiBuZXcgX2NvbXBvc2l0ZUNvbXBvc2l0ZU1vZGVsMlsnZGVmYXVsdCddKHRoaXMucHJvcHMubW9kZSA9PT0gJ2VkaXQnKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhDb21wb3NpdGVDYXJkLCBbe1xuICAgICAgICBrZXk6ICdhdHRhY2hDbGlwYm9hcmQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gYXR0YWNoQ2xpcGJvYXJkKCkge1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gdGhpcy5wcm9wcy5weWRpbztcblxuICAgICAgICAgICAgdmFyIG0gPSBmdW5jdGlvbiBtKGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHB5ZGlvLk1lc3NhZ2VIYXNoWydzaGFyZV9jZW50ZXIuJyArIGlkXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgbW9kZWwgPSB0aGlzLnN0YXRlLm1vZGVsO1xuXG4gICAgICAgICAgICB0aGlzLmRldGFjaENsaXBib2FyZCgpO1xuICAgICAgICAgICAgaWYgKCFtb2RlbC5nZXRMaW5rcygpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSBtb2RlbC5nZXRMaW5rcygpWzBdO1xuICAgICAgICAgICAgaWYgKCFsaW5rTW9kZWwuZ2V0TGluaygpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMucmVmc1snY29weS1idXR0b24nXSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NsaXAgPSBuZXcgX2NsaXBib2FyZDJbJ2RlZmF1bHQnXSh0aGlzLnJlZnNbJ2NvcHktYnV0dG9uJ10sIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogKGZ1bmN0aW9uICh0cmlnZ2VyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5idWlsZFB1YmxpY1VybChweWRpbywgbGlua01vZGVsLmdldExpbmsoKS5MaW5rSGFzaCk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmJpbmQodGhpcylcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGlwLm9uKCdzdWNjZXNzJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29weU1lc3NhZ2U6IG0oJzE5MicpIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgY29weU1lc3NhZ2U6IG51bGwgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAyNTAwKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2xpcC5vbignZXJyb3InLCAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgICAgICAgICB2YXIgY29weU1lc3NhZ2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChnbG9iYWwubmF2aWdhdG9yLnBsYXRmb3JtLmluZGV4T2YoXCJNYWNcIikgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcHlNZXNzYWdlID0gbSgxNDQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29weU1lc3NhZ2UgPSBtKDE0Myk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvcHlNZXNzYWdlOiBjb3B5TWVzc2FnZSB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBjb3B5TWVzc2FnZTogbnVsbCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDI1MDApO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGV0YWNoQ2xpcGJvYXJkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRldGFjaENsaXBib2FyZCgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9jbGlwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2xpcC5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudERpZE1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIG5vZGUgPSBfcHJvcHMubm9kZTtcbiAgICAgICAgICAgIHZhciBtb2RlID0gX3Byb3BzLm1vZGU7XG5cbiAgICAgICAgICAgIHRoaXMuc3RhdGUubW9kZWwub2JzZXJ2ZShcInVwZGF0ZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUubW9kZWwubG9hZChub2RlLCBtb2RlID09PSAnaW5mb1BhbmVsJyk7XG4gICAgICAgICAgICB0aGlzLmF0dGFjaENsaXBib2FyZCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsVW5tb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUubW9kZWwuc3RvcE9ic2VydmluZyhcInVwZGF0ZVwiKTtcbiAgICAgICAgICAgIHRoaXMuZGV0YWNoQ2xpcGJvYXJkKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudERpZFVwZGF0ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgICAgICAgICB0aGlzLmF0dGFjaENsaXBib2FyZCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMocHJvcHMpIHtcbiAgICAgICAgICAgIGlmIChwcm9wcy5ub2RlICYmIChwcm9wcy5ub2RlICE9PSB0aGlzLnByb3BzLm5vZGUgfHwgcHJvcHMubm9kZS5nZXRNZXRhZGF0YSgncHlkaW9fc2hhcmVzJykgIT09IHRoaXMucHJvcHMubm9kZS5nZXRNZXRhZGF0YSgncHlkaW9fc2hhcmVzJykpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5tb2RlbC5sb2FkKHByb3BzLm5vZGUsIHByb3BzLm1vZGUgPT09ICdpbmZvUGFuZWwnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndXNlcnNJbnZpdGF0aW9ucycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1c2Vyc0ludml0YXRpb25zKHVzZXJPYmplY3RzLCBjZWxsTW9kZWwpIHtcbiAgICAgICAgICAgIF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uc2VuZENlbGxJbnZpdGF0aW9uKHRoaXMucHJvcHMubm9kZSwgY2VsbE1vZGVsLCB1c2VyT2JqZWN0cyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2xpbmtJbnZpdGF0aW9uJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxpbmtJbnZpdGF0aW9uKGxpbmtNb2RlbCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgbWFpbERhdGEgPSBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLnByZXBhcmVFbWFpbCh0aGlzLnByb3BzLm5vZGUsIGxpbmtNb2RlbCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1haWxlckRhdGE6IF9leHRlbmRzKHt9LCBtYWlsRGF0YSwgeyB1c2VyczogW10sIGxpbmtNb2RlbDogbGlua01vZGVsIH0pIH0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGFsZXJ0KGUubWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Rpc21pc3NNYWlsZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZGlzbWlzc01haWxlcigpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtYWlsZXJEYXRhOiBudWxsIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzdWJtaXQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLm1vZGVsLnNhdmUoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnB5ZGlvLlVJLmRpc3BsYXlNZXNzYWdlKCdFUlJPUicsIGUubWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIG5vZGUgPSBfcHJvcHMyLm5vZGU7XG4gICAgICAgICAgICB2YXIgbW9kZSA9IF9wcm9wczIubW9kZTtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wczIucHlkaW87XG4gICAgICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIHZhciBtb2RlbCA9IF9zdGF0ZS5tb2RlbDtcbiAgICAgICAgICAgIHZhciBtYWlsZXJEYXRhID0gX3N0YXRlLm1haWxlckRhdGE7XG4gICAgICAgICAgICB2YXIgbGlua1Rvb2x0aXAgPSBfc3RhdGUubGlua1Rvb2x0aXA7XG4gICAgICAgICAgICB2YXIgY29weU1lc3NhZ2UgPSBfc3RhdGUuY29weU1lc3NhZ2U7XG5cbiAgICAgICAgICAgIHZhciBtID0gZnVuY3Rpb24gbShpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBweWRpby5NZXNzYWdlSGFzaFsnc2hhcmVfY2VudGVyLicgKyBpZF07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAobW9kZSA9PT0gJ2VkaXQnKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgcHVibGljTGlua01vZGVsID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGlmIChtb2RlbC5nZXRMaW5rcygpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBwdWJsaWNMaW5rTW9kZWwgPSBtb2RlbC5nZXRMaW5rcygpWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgaGVhZGVyID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGlmIChwdWJsaWNMaW5rTW9kZWwgJiYgcHVibGljTGlua01vZGVsLmdldExpbmtVdWlkKCkgJiYgcHVibGljTGlua01vZGVsLmlzRWRpdGFibGUoKSkge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXIgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9NYWlsZXIyWydkZWZhdWx0J10sIF9leHRlbmRzKHt9LCBtYWlsZXJEYXRhLCB7IHB5ZGlvOiBweWRpbywgb25EaXNtaXNzOiB0aGlzLmRpc21pc3NNYWlsZXIuYmluZCh0aGlzKSB9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbGlua3NMYWJlbFBhbmVsMlsnZGVmYXVsdCddLCB7IHB5ZGlvOiBweWRpbywgbGlua01vZGVsOiBwdWJsaWNMaW5rTW9kZWwgfSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBoZWFkZXIgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmb250U2l6ZTogMjQsIHBhZGRpbmc6ICcyNnB4IDEwcHggMCAnLCBsaW5lSGVpZ2h0OiAnMjZweCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX01haWxlcjJbJ2RlZmF1bHQnXSwgX2V4dGVuZHMoe30sIG1haWxlckRhdGEsIHsgcHlkaW86IHB5ZGlvLCBvbkRpc21pc3M6IHRoaXMuZGlzbWlzc01haWxlci5iaW5kKHRoaXMpIH0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oMjU2KS5yZXBsYWNlKCclcycsIG5vZGUuZ2V0TGFiZWwoKSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHRhYnMgPSB7IGxlZnQ6IFtdLCByaWdodDogW10sIGxlZnRTdHlsZTogeyBwYWRkaW5nOiAwIH0gfTtcbiAgICAgICAgICAgICAgICB0YWJzLnJpZ2h0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBMYWJlbDogbSgyNTApLFxuICAgICAgICAgICAgICAgICAgICBWYWx1ZTogXCJjZWxsc1wiLFxuICAgICAgICAgICAgICAgICAgICBDb21wb25lbnQ6IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9DZWxsc0xpc3QyWydkZWZhdWx0J10sIHsgcHlkaW86IHB5ZGlvLCBjb21wb3NpdGVNb2RlbDogbW9kZWwsIHVzZXJzSW52aXRhdGlvbnM6IHRoaXMudXNlcnNJbnZpdGF0aW9ucy5iaW5kKHRoaXMpIH0pXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdmFyIGxpbmtzID0gbW9kZWwuZ2V0TGlua3MoKTtcbiAgICAgICAgICAgICAgICBpZiAocHVibGljTGlua01vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhYnMubGVmdC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIExhYmVsOiBtKDI1MSksXG4gICAgICAgICAgICAgICAgICAgICAgICBWYWx1ZTogJ3B1YmxpYy1saW5rJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIENvbXBvbmVudDogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX2xpbmtzUGFuZWwyWydkZWZhdWx0J10sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9zaXRlTW9kZWw6IG1vZGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtNb2RlbDogbGlua3NbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd01haWxlcjogdGhpcy5saW5rSW52aXRhdGlvbi5iaW5kKHRoaXMpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHB1YmxpY0xpbmtNb2RlbC5nZXRMaW5rVXVpZCgpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsYXlvdXREYXRhID0gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5jb21waWxlTGF5b3V0RGF0YShweWRpbywgbW9kZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRlbXBsYXRlUGFuZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYXlvdXREYXRhLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVBhbmUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbGlua3NQdWJsaWNMaW5rVGVtcGxhdGUyWydkZWZhdWx0J10sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlua01vZGVsOiBwdWJsaWNMaW5rTW9kZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0RGF0YTogbGF5b3V0RGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgcGFkZGluZzogJzEwcHggMTZweCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhZG9ubHk6IG1vZGVsLmdldE5vZGUoKS5pc0xlYWYoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGFicy5sZWZ0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIExhYmVsOiBtKDI1MiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVmFsdWU6ICdsaW5rLXNlY3VyZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQ29tcG9uZW50OiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9saW5rc1NlY3VyZU9wdGlvbnMyWydkZWZhdWx0J10sIHsgcHlkaW86IHB5ZGlvLCBsaW5rTW9kZWw6IGxpbmtzWzBdIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVBhbmUgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRGl2aWRlciwgbnVsbCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlUGFuZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFicy5sZWZ0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIExhYmVsOiBtKDI1MyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVmFsdWU6ICdsaW5rLXZpc2liaWxpdHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbXBvbmVudDogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX2xpbmtzVmlzaWJpbGl0eVBhbmVsMlsnZGVmYXVsdCddLCB7IHB5ZGlvOiBweWRpbywgbGlua01vZGVsOiBsaW5rc1swXSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21haW5HZW5lcmljRWRpdG9yMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgICAgIHRhYnM6IHRhYnMsXG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyOiBoZWFkZXIsXG4gICAgICAgICAgICAgICAgICAgIHNhdmVFbmFibGVkOiBtb2RlbC5pc0RpcnR5KCksXG4gICAgICAgICAgICAgICAgICAgIG9uU2F2ZUFjdGlvbjogdGhpcy5zdWJtaXQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgb25DbG9zZUFjdGlvbjogdGhpcy5wcm9wcy5vbkRpc21pc3MsXG4gICAgICAgICAgICAgICAgICAgIG9uUmV2ZXJ0QWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbC5yZXZlcnRDaGFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IHdpZHRoOiAnMTAwJScsIGhlaWdodDogbnVsbCwgZmxleDogMSwgbWluSGVpZ2h0OiA1NTAsIGNvbG9yOiAncmdiYSgwLDAsMCwuODMpJywgZm9udFNpemU6IDEzIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIF9yZXQgPSAoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBsaW5lcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2VsbHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwuZ2V0Q2VsbHMoKS5tYXAoZnVuY3Rpb24gKGNlbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbGxzLnB1c2goY2VsbC5nZXRMYWJlbCgpKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjZWxscy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21haW5HZW5lcmljQ2FyZC5HZW5lcmljTGluZSwgeyBpY29uQ2xhc3NOYW1lOiAnbWRpIG1kaS1hY2NvdW50LW11bHRpcGxlJywgbGVnZW5kOiBtKDI1NCksIGRhdGE6IGNlbGxzLmpvaW4oJywgJykgfSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBsaW5rcyA9IG1vZGVsLmdldExpbmtzKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsaW5rcy5sZW5ndGggJiYgbGlua3NbMF0uZ2V0TGluaygpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHVibGljTGluayA9IF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uYnVpbGRQdWJsaWNVcmwocHlkaW8sIGxpbmtzWzBdLmdldExpbmsoKS5MaW5rSGFzaCwgbW9kZSA9PT0gJ2luZm9QYW5lbCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWFpbkdlbmVyaWNDYXJkLkdlbmVyaWNMaW5lLCB7IGljb25DbGFzc05hbWU6ICdtZGkgbWRpLWxpbmsnLCBsZWdlbmQ6IG0oMTIxKSwgc3R5bGU6IHsgb3ZlcmZsb3c6ICd2aXNpYmxlJyB9LCBkYXRhU3R5bGU6IHsgb3ZlcmZsb3c6ICd2aXNpYmxlJyB9LCBkYXRhOiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogJ2NvcHktYnV0dG9uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBwb3NpdGlvbjogJ3JlbGF0aXZlJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZU92ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczQuc2V0U3RhdGUoeyBsaW5rVG9vbHRpcDogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlT3V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXM0LnNldFN0YXRlKHsgbGlua1Rvb2x0aXA6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChUb29sdGlwLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogY29weU1lc3NhZ2UgPyBjb3B5TWVzc2FnZSA6IG0oMTkxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvcml6b250YWxQb3NpdGlvbjogXCJsZWZ0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNhbFBvc2l0aW9uOiBcInRvcFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvdzogbGlua1Rvb2x0aXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY0xpbmtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgZGVsZXRlQWN0aW9uID0gZnVuY3Rpb24gZGVsZXRlQWN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpcm0obSgyNTUpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsLnN0b3BPYnNlcnZpbmcoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsLmRlbGV0ZUFsbCgpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RlbC51cGRhdGVVbmRlcmx5aW5nTm9kZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdjogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX21haW5HZW5lcmljQ2FyZC5HZW5lcmljQ2FyZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHB5ZGlvLk1lc3NhZ2VIYXNoWydzaGFyZV9jZW50ZXIuNTAnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25EaXNtaXNzQWN0aW9uOiBfdGhpczQucHJvcHMub25EaXNtaXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkRlbGV0ZUFjdGlvbjogZGVsZXRlQWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkVkaXRBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvLkNvbnRyb2xsZXIuZmlyZUFjdGlvbignc2hhcmUtZWRpdC1zaGFyZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyU21hbGw6IG1vZGUgPT09ICdpbmZvUGFuZWwnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lc1xuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIF9yZXQgPT09ICdvYmplY3QnKSByZXR1cm4gX3JldC52O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIENvbXBvc2l0ZUNhcmQ7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ29tcG9zaXRlQ2FyZCA9IFBhbGV0dGVNb2RpZmllcih7IHByaW1hcnkxQ29sb3I6ICcjMDA5Njg4JyB9KShDb21wb3NpdGVDYXJkKTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IENvbXBvc2l0ZUNhcmQ7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX0NvbXBvc2l0ZUNhcmQgPSByZXF1aXJlKCcuL0NvbXBvc2l0ZUNhcmQnKTtcblxudmFyIF9Db21wb3NpdGVDYXJkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NvbXBvc2l0ZUNhcmQpO1xuXG52YXIgX3B5ZGlvTW9kZWxEYXRhTW9kZWwgPSByZXF1aXJlKCdweWRpby9tb2RlbC9kYXRhLW1vZGVsJyk7XG5cbnZhciBfcHlkaW9Nb2RlbERhdGFNb2RlbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb01vZGVsRGF0YU1vZGVsKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlcXVpcmUkcmVxdWlyZUxpYiA9IHJlcXVpcmUoJ3B5ZGlvJykucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgQWN0aW9uRGlhbG9nTWl4aW4gPSBfcmVxdWlyZSRyZXF1aXJlTGliLkFjdGlvbkRpYWxvZ01peGluO1xuXG52YXIgQ29tcG9zaXRlRGlhbG9nID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnQ29tcG9zaXRlRGlhbG9nJyxcblxuICAgIG1peGluczogW0FjdGlvbkRpYWxvZ01peGluXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlhbG9nVGl0bGU6ICcnLFxuICAgICAgICAgICAgZGlhbG9nSXNNb2RhbDogZmFsc2UsXG4gICAgICAgICAgICBkaWFsb2dQYWRkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGRpYWxvZ1NpemU6ICdsZydcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIHB5ZGlvOiBSZWFjdC5Qcm9wVHlwZXMuaW5zdGFuY2VPZihfcHlkaW8yWydkZWZhdWx0J10pLmlzUmVxdWlyZWQsXG4gICAgICAgIHNlbGVjdGlvbjogUmVhY3QuUHJvcFR5cGVzLmluc3RhbmNlT2YoX3B5ZGlvTW9kZWxEYXRhTW9kZWwyWydkZWZhdWx0J10pLFxuICAgICAgICByZWFkb25seTogUmVhY3QuUHJvcFR5cGVzLmJvb2xcbiAgICB9LFxuXG4gICAgY2hpbGRDb250ZXh0VHlwZXM6IHtcbiAgICAgICAgbWVzc2FnZXM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgICAgIGdldE1lc3NhZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgICAgICBpc1JlYWRvbmx5OiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuICAgIH0sXG5cbiAgICBnZXRDaGlsZENvbnRleHQ6IGZ1bmN0aW9uIGdldENoaWxkQ29udGV4dCgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB2YXIgbWVzc2FnZXMgPSB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbWVzc2FnZXM6IG1lc3NhZ2VzLFxuICAgICAgICAgICAgZ2V0TWVzc2FnZTogZnVuY3Rpb24gZ2V0TWVzc2FnZShtZXNzYWdlSWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmFtZXNwYWNlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gJ3NoYXJlX2NlbnRlcicgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZXNbbmFtZXNwYWNlICsgKG5hbWVzcGFjZSA/IFwiLlwiIDogXCJcIikgKyBtZXNzYWdlSWRdIHx8IG1lc3NhZ2VJZDtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlSWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGlzUmVhZG9ubHk6IGZ1bmN0aW9uIGlzUmVhZG9ubHkoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnByb3BzLnJlYWRvbmx5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcbiAgICAgICAgdmFyIHNlbGVjdGlvbiA9IF9wcm9wcy5zZWxlY3Rpb247XG5cbiAgICAgICAgdmFyIG5vZGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChzZWxlY3Rpb24uZ2V0VW5pcXVlTm9kZSgpKSB7XG4gICAgICAgICAgICBub2RlID0gc2VsZWN0aW9uLmdldFVuaXF1ZU5vZGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KF9Db21wb3NpdGVDYXJkMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICBtb2RlOiAnZWRpdCcsXG4gICAgICAgICAgICBub2RlOiBub2RlLFxuICAgICAgICAgICAgb25EaXNtaXNzOiB0aGlzLnByb3BzLm9uRGlzbWlzc1xuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ29tcG9zaXRlRGlhbG9nO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3g0LCBfeDUsIF94NikgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeDQsIHByb3BlcnR5ID0gX3g1LCByZWNlaXZlciA9IF94NjsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeDQgPSBwYXJlbnQ7IF94NSA9IHByb3BlcnR5OyBfeDYgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3B5ZGlvTGFuZ09ic2VydmFibGUgPSByZXF1aXJlKCdweWRpby9sYW5nL29ic2VydmFibGUnKTtcblxudmFyIF9weWRpb0xhbmdPYnNlcnZhYmxlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvTGFuZ09ic2VydmFibGUpO1xuXG52YXIgX2xpbmtzTGlua01vZGVsID0gcmVxdWlyZSgnLi4vbGlua3MvTGlua01vZGVsJyk7XG5cbnZhciBfbGlua3NMaW5rTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbGlua3NMaW5rTW9kZWwpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlciA9IHJlcXVpcmUoJy4uL21haW4vU2hhcmVIZWxwZXInKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9weWRpb01vZGVsQ2VsbCA9IHJlcXVpcmUoJ3B5ZGlvL21vZGVsL2NlbGwnKTtcblxudmFyIF9weWRpb01vZGVsQ2VsbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb01vZGVsQ2VsbCk7XG5cbnZhciBfcHlkaW9IdHRwUmVzdEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvcmVzdC1hcGknKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgbW9tZW50ID0gX1B5ZGlvJHJlcXVpcmVMaWIubW9tZW50O1xuXG52YXIgQ29tcG9zaXRlTW9kZWwgPSAoZnVuY3Rpb24gKF9PYnNlcnZhYmxlKSB7XG4gICAgX2luaGVyaXRzKENvbXBvc2l0ZU1vZGVsLCBfT2JzZXJ2YWJsZSk7XG5cbiAgICBmdW5jdGlvbiBDb21wb3NpdGVNb2RlbCgpIHtcbiAgICAgICAgdmFyIGVkaXQgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ29tcG9zaXRlTW9kZWwpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKENvbXBvc2l0ZU1vZGVsLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcyk7XG4gICAgICAgIHRoaXMuY2VsbHMgPSBbXTtcbiAgICAgICAgdGhpcy5saW5rcyA9IFtdO1xuICAgICAgICB0aGlzLmVkaXQgPSBlZGl0O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhDb21wb3NpdGVNb2RlbCwgW3tcbiAgICAgICAga2V5OiAnZW1wdHlMaW5rJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGVtcHR5TGluayhub2RlKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgbGluayA9IG5ldyBfbGlua3NMaW5rTW9kZWwyWydkZWZhdWx0J10oKTtcbiAgICAgICAgICAgIHZhciB0cmVlTm9kZSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5UcmVlTm9kZSgpO1xuICAgICAgICAgICAgdmFyIGF1dGggPSBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLmdldEF1dGhvcml6YXRpb25zKF9weWRpbzJbJ2RlZmF1bHQnXS5nZXRJbnN0YW5jZSgpKTtcbiAgICAgICAgICAgIHRyZWVOb2RlLlV1aWQgPSBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KCd1dWlkJyk7XG4gICAgICAgICAgICBsaW5rLmdldExpbmsoKS5MYWJlbCA9IG5vZGUuZ2V0TGFiZWwoKTtcbiAgICAgICAgICAgIGxpbmsuZ2V0TGluaygpLkRlc2NyaXB0aW9uID0gcHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci4yNTcnXS5yZXBsYWNlKCclcycsIG1vbWVudChuZXcgRGF0ZSgpKS5mb3JtYXQoXCJZWVlZL01NL0REXCIpKTtcbiAgICAgICAgICAgIGxpbmsuZ2V0TGluaygpLlJvb3ROb2Rlcy5wdXNoKHRyZWVOb2RlKTtcbiAgICAgICAgICAgIC8vIFRlbXBsYXRlIC8gUGVybWlzc2lvbnMgZnJvbSBub2RlXG4gICAgICAgICAgICB2YXIgZGVmYXVsdFRlbXBsYXRlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdmFyIGRlZmF1bHRQZXJtaXNzaW9ucyA9IFtfcHlkaW9IdHRwUmVzdEFwaS5SZXN0U2hhcmVMaW5rQWNjZXNzVHlwZS5jb25zdHJ1Y3RGcm9tT2JqZWN0KCdEb3dubG9hZCcpXTtcbiAgICAgICAgICAgIGlmIChub2RlLmlzTGVhZigpKSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdFRlbXBsYXRlID0gXCJweWRpb191bmlxdWVfZGxcIjtcblxuICAgICAgICAgICAgICAgIHZhciBfU2hhcmVIZWxwZXIkbm9kZUhhc0VkaXRvciA9IF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10ubm9kZUhhc0VkaXRvcihweWRpbywgbm9kZSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgcHJldmlldyA9IF9TaGFyZUhlbHBlciRub2RlSGFzRWRpdG9yLnByZXZpZXc7XG5cbiAgICAgICAgICAgICAgICBpZiAocHJldmlldyAmJiAhYXV0aC5tYXhfZG93bmxvYWRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHRUZW1wbGF0ZSA9IFwicHlkaW9fdW5pcXVlX3N0cmlwXCI7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHRQZXJtaXNzaW9ucy5wdXNoKF9weWRpb0h0dHBSZXN0QXBpLlJlc3RTaGFyZUxpbmtBY2Nlc3NUeXBlLmNvbnN0cnVjdEZyb21PYmplY3QoJ1ByZXZpZXcnKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhdXRoLm1heF9kb3dubG9hZHMgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIERMIG9ubHkgYW5kIGF1dGggaGFzIGRlZmF1bHQgbWF4IGRvd25sb2FkLCBzZXQgaXRcbiAgICAgICAgICAgICAgICAgICAgbGluay5nZXRMaW5rKCkuTWF4RG93bmxvYWRzID0gYXV0aC5tYXhfZG93bmxvYWRzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdFRlbXBsYXRlID0gXCJweWRpb19zaGFyZWRfZm9sZGVyXCI7XG4gICAgICAgICAgICAgICAgZGVmYXVsdFBlcm1pc3Npb25zLnB1c2goX3B5ZGlvSHR0cFJlc3RBcGkuUmVzdFNoYXJlTGlua0FjY2Vzc1R5cGUuY29uc3RydWN0RnJvbU9iamVjdCgnUHJldmlldycpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxpbmsuZ2V0TGluaygpLlZpZXdUZW1wbGF0ZU5hbWUgPSBkZWZhdWx0VGVtcGxhdGU7XG4gICAgICAgICAgICBsaW5rLmdldExpbmsoKS5QZXJtaXNzaW9ucyA9IGRlZmF1bHRQZXJtaXNzaW9ucztcbiAgICAgICAgICAgIGlmIChhdXRoLm1heF9leHBpcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgbGluay5nZXRMaW5rKCkuQWNjZXNzRW5kID0gXCJcIiArIChNYXRoLnJvdW5kKG5ldyBEYXRlKCkgLyAxMDAwKSArIHBhcnNlSW50KGF1dGgubWF4X2V4cGlyYXRpb24pICogNjAgKiA2MCAqIDI0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGluay5vYnNlcnZlKFwidXBkYXRlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5ub3RpZnkoXCJ1cGRhdGVcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxpbmsub2JzZXJ2ZShcInNhdmVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzLnVwZGF0ZVVuZGVybHlpbmdOb2RlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBsaW5rO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjcmVhdGVFbXB0eUNlbGwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY3JlYXRlRW1wdHlDZWxsKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBjZWxsID0gbmV3IF9weWRpb01vZGVsQ2VsbDJbJ2RlZmF1bHQnXSh0cnVlKTtcbiAgICAgICAgICAgIGNlbGwuc2V0TGFiZWwodGhpcy5ub2RlLmdldExhYmVsKCkpO1xuICAgICAgICAgICAgY2VsbC5hZGRSb290Tm9kZSh0aGlzLm5vZGUpO1xuICAgICAgICAgICAgY2VsbC5vYnNlcnZlKFwidXBkYXRlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpczIubm90aWZ5KFwidXBkYXRlXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjZWxsLmRpcnR5ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmNlbGxzLnB1c2goY2VsbCk7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeShcInVwZGF0ZVwiKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnYWRkVG9FeGlzdGluZ0NlbGwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gYWRkVG9FeGlzdGluZ0NlbGwoY2VsbElkKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGNlbGwgPSBuZXcgX3B5ZGlvTW9kZWxDZWxsMlsnZGVmYXVsdCddKHRydWUpO1xuICAgICAgICAgICAgY2VsbC5vYnNlcnZlKFwidXBkYXRlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpczMubm90aWZ5KFwidXBkYXRlXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjZWxsLmxvYWQoY2VsbElkKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjZWxsLmFkZFJvb3ROb2RlKF90aGlzMy5ub2RlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5jZWxscy5wdXNoKGNlbGwpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd1cGRhdGVVbmRlcmx5aW5nTm9kZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVVbmRlcmx5aW5nTm9kZSgpIHtcbiAgICAgICAgICAgIHB5ZGlvLmdldENvbnRleHRIb2xkZXIoKS5yZXF1aXJlTm9kZVJlbG9hZCh0aGlzLm5vZGUpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdkZWxldGVMaW5rJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlbGV0ZUxpbmsobGlua01vZGVsKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgICAgICAgbGlua01vZGVsLmRlbGV0ZUxpbmsodGhpcy5lbXB0eUxpbmsodGhpcy5ub2RlKS5nZXRMaW5rKCkpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgIF90aGlzNC51cGRhdGVVbmRlcmx5aW5nTm9kZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldE5vZGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0Tm9kZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm5vZGU7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIG5vZGUge1RyZWVOb2RlfVxuICAgICAgICAgKiBAcGFyYW0gb2JzZXJ2ZVJlcGxhY2UgYm9vbFxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2xvYWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbG9hZChub2RlKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXM1ID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIG9ic2VydmVSZXBsYWNlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgICAgIHRoaXMubm9kZSA9IG5vZGU7XG4gICAgICAgICAgICB0aGlzLmNlbGxzID0gW107XG4gICAgICAgICAgICB0aGlzLmxpbmtzID0gW107XG4gICAgICAgICAgICBpZiAobm9kZS5nZXRNZXRhZGF0YSgpLmdldCgncHlkaW9fc2hhcmVzJykpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2hhcmVNZXRhID0gSlNPTi5wYXJzZShub2RlLmdldE1ldGFkYXRhKCkuZ2V0KCdweWRpb19zaGFyZXMnKSk7XG4gICAgICAgICAgICAgICAgc2hhcmVNZXRhLm1hcChmdW5jdGlvbiAoc2hhcmVkV29ya3NwYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzaGFyZWRXb3Jrc3BhY2UuU2NvcGUgPT09IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIExpbmtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSBuZXcgX2xpbmtzTGlua01vZGVsMlsnZGVmYXVsdCddKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rTW9kZWwub2JzZXJ2ZShcInVwZGF0ZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXM1Lm5vdGlmeShcInVwZGF0ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGlua01vZGVsLm9ic2VydmUoXCJzYXZlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczUudXBkYXRlVW5kZXJseWluZ05vZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGlua01vZGVsLmxvYWQoc2hhcmVkV29ya3NwYWNlLlVVSUQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXM1LmxpbmtzLnB1c2gobGlua01vZGVsKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzaGFyZWRXb3Jrc3BhY2UuU2NvcGUgPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjZWxsID0gbmV3IF9weWRpb01vZGVsQ2VsbDJbJ2RlZmF1bHQnXSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2VsbC5vYnNlcnZlKFwidXBkYXRlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczUubm90aWZ5KFwidXBkYXRlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjZWxsLmxvYWQoc2hhcmVkV29ya3NwYWNlLlVVSUQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXM1LmNlbGxzLnB1c2goY2VsbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmVkaXQgJiYgIXRoaXMubGlua3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5saW5rcy5wdXNoKHRoaXMuZW1wdHlMaW5rKG5vZGUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvYnNlcnZlUmVwbGFjZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubm9kZS5vYnNlcnZlKCdub2RlX3JlcGxhY2VkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczUubG9hZChfdGhpczUubm9kZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzYXZlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNhdmUoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXM2ID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIHByb21zID0gW107XG4gICAgICAgICAgICB0aGlzLmNlbGxzLm1hcChmdW5jdGlvbiAocikge1xuICAgICAgICAgICAgICAgIGlmIChyLmlzRGlydHkoKSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9tcy5wdXNoKHIuc2F2ZSgpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubGlua3MubWFwKGZ1bmN0aW9uIChsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGwuaXNEaXJ0eSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb21zLnB1c2gobC5zYXZlKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gV2FpdCB0aGF0IGFsbCBzYXZlIGFyZSBmaW5pc2hlZFxuICAgICAgICAgICAgUHJvbWlzZS5hbGwocHJvbXMpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBjZWxscyB0aGF0IGRvbid0IGhhdmUgdGhpcyBub2RlIGFueW1vcmVcbiAgICAgICAgICAgICAgICB2YXIgbm9kZUlkID0gX3RoaXM2Lm5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ3V1aWQnKTtcbiAgICAgICAgICAgICAgICBfdGhpczYuY2VsbHMgPSBfdGhpczYuY2VsbHMuZmlsdGVyKGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByLmhhc1Jvb3ROb2RlKG5vZGVJZCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgX3RoaXM2LnVwZGF0ZVVuZGVybHlpbmdOb2RlKCk7XG4gICAgICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIF90aGlzNi51cGRhdGVVbmRlcmx5aW5nTm9kZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2RlbGV0ZUFsbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZWxldGVBbGwoKSB7XG4gICAgICAgICAgICB2YXIgbm9kZVV1aWQgPSB0aGlzLm5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ3V1aWQnKTtcbiAgICAgICAgICAgIHZhciBwID0gW107XG4gICAgICAgICAgICB0aGlzLmNlbGxzLm1hcChmdW5jdGlvbiAocikge1xuICAgICAgICAgICAgICAgIHIucmVtb3ZlUm9vdE5vZGUobm9kZVV1aWQpO1xuICAgICAgICAgICAgICAgIHAucHVzaChyLnNhdmUoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubGlua3MubWFwKGZ1bmN0aW9uIChsKSB7XG4gICAgICAgICAgICAgICAgcC5wdXNoKGwuZGVsZXRlTGluaygpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHApO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW1vdmVOZXdDZWxsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZU5ld0NlbGwoY2VsbCkge1xuICAgICAgICAgICAgdGhpcy5jZWxscyA9IHRoaXMuY2VsbHMuZmlsdGVyKGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHIgIT09IGNlbGw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5KFwidXBkYXRlXCIpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZXZlcnRDaGFuZ2VzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJldmVydENoYW5nZXMoKSB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgZW1wdHkgY2VsbHNcbiAgICAgICAgICAgIHRoaXMuY2VsbHMgPSB0aGlzLmNlbGxzLmZpbHRlcihmdW5jdGlvbiAocikge1xuICAgICAgICAgICAgICAgIHJldHVybiByLmdldFV1aWQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5jZWxscy5tYXAoZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgICAgICBpZiAoci5pc0RpcnR5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgci5yZXZlcnRDaGFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmxpbmtzLm1hcChmdW5jdGlvbiAobCkge1xuICAgICAgICAgICAgICAgIGlmIChsLmlzRGlydHkoKSkge1xuICAgICAgICAgICAgICAgICAgICBsLnJldmVydENoYW5nZXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5KCd1cGRhdGUnKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnaXNEaXJ0eScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBpc0RpcnR5KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2VsbHMuZmlsdGVyKGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHIuaXNEaXJ0eSgpO1xuICAgICAgICAgICAgfSkubGVuZ3RoIHx8IHRoaXMubGlua3MuZmlsdGVyKGZ1bmN0aW9uIChsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGwuaXNEaXJ0eSgpO1xuICAgICAgICAgICAgfSkubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzdG9wT2JzZXJ2aW5nJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHN0b3BPYnNlcnZpbmcoZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgICAgIHRoaXMuY2VsbHMubWFwKGZ1bmN0aW9uIChjZWxsKSB7XG4gICAgICAgICAgICAgICAgY2VsbC5zdG9wT2JzZXJ2aW5nKFwidXBkYXRlXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmxpbmtzLm1hcChmdW5jdGlvbiAobGluaykge1xuICAgICAgICAgICAgICAgIGxpbmsuc3RvcE9ic2VydmluZyhcInVwZGF0ZVwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoQ29tcG9zaXRlTW9kZWwucHJvdG90eXBlKSwgJ3N0b3BPYnNlcnZpbmcnLCB0aGlzKS5jYWxsKHRoaXMsIGV2ZW50LCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldENlbGxzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldENlbGxzKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzNyA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm5vZGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3JldCA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBub2RlSWQgPSBfdGhpczcubm9kZS5nZXRNZXRhZGF0YSgpLmdldCgndXVpZCcpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdjogX3RoaXM3LmNlbGxzLmZpbHRlcihmdW5jdGlvbiAocikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByLmhhc1Jvb3ROb2RlKG5vZGVJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIF9yZXQgPT09ICdvYmplY3QnKSByZXR1cm4gX3JldC52O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jZWxscztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0TGlua3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0TGlua3MoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saW5rcztcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBDb21wb3NpdGVNb2RlbDtcbn0pKF9weWRpb0xhbmdPYnNlcnZhYmxlMlsnZGVmYXVsdCddKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ29tcG9zaXRlTW9kZWw7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gyLCBfeDMsIF94NCkgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeDIsIHByb3BlcnR5ID0gX3gzLCByZWNlaXZlciA9IF94NDsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeDIgPSBwYXJlbnQ7IF94MyA9IHByb3BlcnR5OyBfeDQgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHlkaW9IdHRwUmVzb3VyY2VzTWFuYWdlciA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvcmVzb3VyY2VzLW1hbmFnZXInKTtcblxudmFyIF9weWRpb0h0dHBSZXNvdXJjZXNNYW5hZ2VyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cFJlc291cmNlc01hbmFnZXIpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlciA9IHJlcXVpcmUoJy4uL21haW4vU2hhcmVIZWxwZXInKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9weWRpb0h0dHBSZXN0QXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9yZXN0LWFwaScpO1xuXG52YXIgTWFpbGVyID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKE1haWxlciwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBNYWlsZXIocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1haWxlcik7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoTWFpbGVyLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0geyBtYWlsZXJEYXRhOiBudWxsIH07XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKE1haWxlciwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgc3ViamVjdCA9IG5ld1Byb3BzLnN1YmplY3Q7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IG5ld1Byb3BzLm1lc3NhZ2U7XG4gICAgICAgICAgICB2YXIgdXNlcnMgPSBuZXdQcm9wcy51c2VycztcbiAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSBuZXdQcm9wcy5saW5rTW9kZWw7XG4gICAgICAgICAgICB2YXIgdGVtcGxhdGVJZCA9IG5ld1Byb3BzLnRlbXBsYXRlSWQ7XG4gICAgICAgICAgICB2YXIgdGVtcGxhdGVEYXRhID0gbmV3UHJvcHMudGVtcGxhdGVEYXRhO1xuXG4gICAgICAgICAgICBpZiAoc3ViamVjdCB8fCB0ZW1wbGF0ZUlkKSB7XG4gICAgICAgICAgICAgICAgaWYgKF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uZm9yY2VNYWlsZXJPbGRTY2hvb2woKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZW5jU3ViamVjdCA9IGVuY29kZVVSSUNvbXBvbmVudChzdWJqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IFwibWFpbHRvOmN1c3RvbS1lbWFpbEBkb21haW4uY29tP1N1YmplY3Q9XCIgKyBlbmNTdWJqZWN0ICsgXCImQm9keT1cIiArIG1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9jb25zdCBsaW5rRGF0YSA9IGhhc2ggPyB0aGlzLnN0YXRlLm1vZGVsLmdldExpbmtEYXRhKGhhc2gpIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIF9weWRpb0h0dHBSZXNvdXJjZXNNYW5hZ2VyMlsnZGVmYXVsdCddLmxvYWRDbGFzc2VzQW5kQXBwbHkoWydQeWRpb01haWxlciddLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1haWxlckRhdGE6IF9leHRlbmRzKHt9LCBuZXdQcm9wcywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuYWJsZUlkZW50aWZpY2F0aW9uOiBsaW5rTW9kZWwgJiYgbGlua01vZGVsLmdldExpbmsoKS5UYXJnZXRVc2VycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZGVudGlmaWVkT25seTogbGlua01vZGVsICYmIGxpbmtNb2RlbC5nZXRMaW5rKCkuUmVzdHJpY3RUb1RhcmdldFVzZXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyaXBwbGVJZGVudGlmaWNhdGlvbktleXM6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbWFpbGVyRGF0YTogbnVsbCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndG9nZ2xlTWFpbGVyRGF0YScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB0b2dnbGVNYWlsZXJEYXRhKGRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtYWlsZXJEYXRhOiBfZXh0ZW5kcyh7fSwgdGhpcy5zdGF0ZS5tYWlsZXJEYXRhLCBkYXRhKSB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGlzbWlzc01haWxlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBkaXNtaXNzTWFpbGVyKCkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkRpc21pc3MoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbWFpbGVyUHJvY2Vzc1Bvc3QnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbWFpbGVyUHJvY2Vzc1Bvc3QoRW1haWwsIHVzZXJzLCBzdWJqZWN0LCBtZXNzYWdlLCBsaW5rLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIG1haWxlckRhdGEgPSB0aGlzLnN0YXRlLm1haWxlckRhdGE7XG4gICAgICAgICAgICB2YXIgY3JpcHBsZUlkZW50aWZpY2F0aW9uS2V5cyA9IG1haWxlckRhdGEuY3JpcHBsZUlkZW50aWZpY2F0aW9uS2V5cztcbiAgICAgICAgICAgIHZhciBpZGVudGlmaWVkT25seSA9IG1haWxlckRhdGEuaWRlbnRpZmllZE9ubHk7XG4gICAgICAgICAgICB2YXIgbGlua01vZGVsID0gbWFpbGVyRGF0YS5saW5rTW9kZWw7XG5cbiAgICAgICAgICAgIHZhciBsaW5rT2JqZWN0ID0gbGlua01vZGVsLmdldExpbmsoKTtcbiAgICAgICAgICAgIGlmICghbGlua09iamVjdC5UYXJnZXRVc2Vycykge1xuICAgICAgICAgICAgICAgIGxpbmtPYmplY3QuVGFyZ2V0VXNlcnMgPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxpbmtPYmplY3QuUmVzdHJpY3RUb1RhcmdldFVzZXJzID0gaWRlbnRpZmllZE9ubHk7XG5cbiAgICAgICAgICAgIHZhciBzaGFyZU1haWxzID0ge307XG4gICAgICAgICAgICBPYmplY3Qua2V5cyh1c2VycykuZm9yRWFjaChmdW5jdGlvbiAodSkge1xuICAgICAgICAgICAgICAgIHZhciBrID0gY3JpcHBsZUlkZW50aWZpY2F0aW9uS2V5cyA/IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZyg3KSA6IHU7XG4gICAgICAgICAgICAgICAgbGlua09iamVjdC5UYXJnZXRVc2Vyc1trXSA9IF9weWRpb0h0dHBSZXN0QXBpLlJlc3RTaGFyZUxpbmtUYXJnZXRVc2VyLmNvbnN0cnVjdEZyb21PYmplY3QoeyBEaXNwbGF5OiB1c2Vyc1t1XS5nZXRMYWJlbCgpLCBEb3dubG9hZENvdW50OiAwIH0pO1xuICAgICAgICAgICAgICAgIHNoYXJlTWFpbHNba10gPSB1O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsaW5rTW9kZWwudXBkYXRlTGluayhsaW5rT2JqZWN0KTtcbiAgICAgICAgICAgIGxpbmtNb2RlbC5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVtYWlsID0gbmV3IEVtYWlsKCk7XG4gICAgICAgICAgICAgICAgdmFyIG9yaWdpbmFsTGluayA9IGxpbmtNb2RlbC5nZXRQdWJsaWNVcmwoKTtcbiAgICAgICAgICAgICAgICB2YXIgcmVnZXhwID0gbmV3IFJlZ0V4cChvcmlnaW5hbExpbmssICdnJyk7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoc2hhcmVNYWlscykuZm9yRWFjaChmdW5jdGlvbiAodSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TGluayA9IG9yaWdpbmFsTGluayArICc/dT0nICsgdTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld01lc3NhZ2UgPSBtZXNzYWdlLnJlcGxhY2UocmVnZXhwLCBuZXdMaW5rKTtcbiAgICAgICAgICAgICAgICAgICAgZW1haWwuYWRkVGFyZ2V0KHNoYXJlTWFpbHNbdV0sIHN1YmplY3QsIG5ld01lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGVtYWlsLnBvc3QoZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhyZXMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldE1lc3NhZ2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0TWVzc2FnZShrZXkpIHtcbiAgICAgICAgICAgIHZhciBuYW1lc3BhY2UgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAnc2hhcmVfY2VudGVyJyA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2hbbmFtZXNwYWNlICsgKG5hbWVzcGFjZSA/ICcuJyA6ICcnKSArIGtleV07XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUubWFpbGVyRGF0YSkge1xuICAgICAgICAgICAgICAgIHZhciBtYWlsZXJEYXRhID0gdGhpcy5zdGF0ZS5tYWlsZXJEYXRhO1xuXG4gICAgICAgICAgICAgICAgdmFyIGN1c3RvbWl6ZU1lc3NhZ2VQYW5lID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGlmIChmYWxzZSAmJiBtYWlsZXJEYXRhLmxpbmtNb2RlbCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3R5bGUgPSBtYWlsZXJEYXRhLmVuYWJsZUlkZW50aWZpY2F0aW9uID8geyBwYWRkaW5nOiAnMTBweCAyMHB4JywgYmFja2dyb3VuZENvbG9yOiAnI0VDRUZGMScsIGZvbnRTaXplOiAxNCB9IDogeyBwYWRkaW5nOiAnMTBweCAyMHB4IDAnLCBmb250U2l6ZTogMTQgfTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxldFVzZXJDaG9vc2VDcmlwcGxlID0gdGhpcy5wcm9wcy5weWRpby5nZXRQbHVnaW5Db25maWdzKCdhY3Rpb24uc2hhcmUnKS5nZXQoJ0VNQUlMX1BFUlNPTkFMX0xJTktfU0VORF9DTEVBUicpO1xuICAgICAgICAgICAgICAgICAgICBjdXN0b21pemVNZXNzYWdlUGFuZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBzdHlsZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVG9nZ2xlLCB7IGxhYmVsOiB0aGlzLmdldE1lc3NhZ2UoMjM1KSwgdG9nZ2xlZDogbWFpbGVyRGF0YS5lbmFibGVJZGVudGlmaWNhdGlvbiwgb25Ub2dnbGU6IGZ1bmN0aW9uIChlLCBjKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi50b2dnbGVNYWlsZXJEYXRhKHsgZW5hYmxlSWRlbnRpZmljYXRpb246IGMgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1haWxlckRhdGEuZW5hYmxlSWRlbnRpZmljYXRpb24gJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVG9nZ2xlLCB7IGxhYmVsOiBcIi0tIFwiICsgdGhpcy5nZXRNZXNzYWdlKDIzNiksIHRvZ2dsZWQ6IG1haWxlckRhdGEuaWRlbnRpZmllZE9ubHksIG9uVG9nZ2xlOiBmdW5jdGlvbiAoZSwgYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIudG9nZ2xlTWFpbGVyRGF0YSh7IGlkZW50aWZpZWRPbmx5OiBjIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtYWlsZXJEYXRhLmVuYWJsZUlkZW50aWZpY2F0aW9uICYmIGxldFVzZXJDaG9vc2VDcmlwcGxlICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRvZ2dsZSwgeyBsYWJlbDogXCItLSBcIiArIHRoaXMuZ2V0TWVzc2FnZSgyMzcpLCB0b2dnbGVkOiBtYWlsZXJEYXRhLmNyaXBwbGVJZGVudGlmaWNhdGlvbktleXMsIG9uVG9nZ2xlOiBmdW5jdGlvbiAoZSwgYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIudG9nZ2xlTWFpbGVyRGF0YSh7IGNyaXBwbGVJZGVudGlmaWNhdGlvbktleXM6IGMgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoUHlkaW9NYWlsZXIuUGFuZSwgX2V4dGVuZHMoe30sIG1haWxlckRhdGEsIHtcbiAgICAgICAgICAgICAgICAgICAgb25EaXNtaXNzOiB0aGlzLmRpc21pc3NNYWlsZXIuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmxheTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnc2hhcmUtY2VudGVyLW1haWxlcicsXG4gICAgICAgICAgICAgICAgICAgIHBhbmVsVGl0bGU6IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2hbXCJzaGFyZV9jZW50ZXIuNDVcIl0sXG4gICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxQYW5lVG9wOiBjdXN0b21pemVNZXNzYWdlUGFuZSxcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc1Bvc3Q6IG1haWxlckRhdGEuZW5hYmxlSWRlbnRpZmljYXRpb24gPyB0aGlzLm1haWxlclByb2Nlc3NQb3N0LmJpbmQodGhpcykgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyB3aWR0aDogNDIwLCBtYXJnaW46ICcwIGF1dG8nIH1cbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIE1haWxlcjtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBNYWlsZXI7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9jZWxsc0NyZWF0ZUNlbGxEaWFsb2cgPSByZXF1aXJlKCcuL2NlbGxzL0NyZWF0ZUNlbGxEaWFsb2cnKTtcblxudmFyIF9jZWxsc0NyZWF0ZUNlbGxEaWFsb2cyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY2VsbHNDcmVhdGVDZWxsRGlhbG9nKTtcblxudmFyIF9jZWxsc0VkaXRDZWxsRGlhbG9nID0gcmVxdWlyZSgnLi9jZWxscy9FZGl0Q2VsbERpYWxvZycpO1xuXG52YXIgX2NlbGxzRWRpdENlbGxEaWFsb2cyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY2VsbHNFZGl0Q2VsbERpYWxvZyk7XG5cbnZhciBfY2VsbHNDZWxsQ2FyZCA9IHJlcXVpcmUoJy4vY2VsbHMvQ2VsbENhcmQnKTtcblxudmFyIF9jZWxsc0NlbGxDYXJkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NlbGxzQ2VsbENhcmQpO1xuXG52YXIgX21haW5JbmZvUGFuZWwgPSByZXF1aXJlKCcuL21haW4vSW5mb1BhbmVsJyk7XG5cbnZhciBfbWFpbkluZm9QYW5lbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYWluSW5mb1BhbmVsKTtcblxudmFyIF9jb21wb3NpdGVDb21wb3NpdGVEaWFsb2cgPSByZXF1aXJlKCcuL2NvbXBvc2l0ZS9Db21wb3NpdGVEaWFsb2cnKTtcblxudmFyIF9jb21wb3NpdGVDb21wb3NpdGVEaWFsb2cyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY29tcG9zaXRlQ29tcG9zaXRlRGlhbG9nKTtcblxudmFyIF9saW5rc0xpbmtNb2RlbCA9IHJlcXVpcmUoJy4vbGlua3MvTGlua01vZGVsJyk7XG5cbnZhciBfbGlua3NMaW5rTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbGlua3NMaW5rTW9kZWwpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlciA9IHJlcXVpcmUoJy4vbWFpbi9TaGFyZUhlbHBlcicpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYWluU2hhcmVIZWxwZXIpO1xuXG52YXIgX2xpc3RzU2hhcmVWaWV3ID0gcmVxdWlyZShcIi4vbGlzdHMvU2hhcmVWaWV3XCIpO1xuXG5leHBvcnRzLkNyZWF0ZUNlbGxEaWFsb2cgPSBfY2VsbHNDcmVhdGVDZWxsRGlhbG9nMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5FZGl0Q2VsbERpYWxvZyA9IF9jZWxsc0VkaXRDZWxsRGlhbG9nMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5DZWxsQ2FyZCA9IF9jZWxsc0NlbGxDYXJkMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5JbmZvUGFuZWwgPSBfbWFpbkluZm9QYW5lbDJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuQ29tcG9zaXRlRGlhbG9nID0gX2NvbXBvc2l0ZUNvbXBvc2l0ZURpYWxvZzJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuTGlua01vZGVsID0gX2xpbmtzTGlua01vZGVsMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5TaGFyZUhlbHBlciA9IF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J107XG5leHBvcnRzLlNoYXJlVmlld01vZGFsID0gX2xpc3RzU2hhcmVWaWV3LlNoYXJlVmlld01vZGFsO1xuZXhwb3J0cy5TaGFyZVZpZXcgPSBfbGlzdHNTaGFyZVZpZXcuU2hhcmVWaWV3O1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lciA9IHJlcXVpcmUoJy4uL1NoYXJlQ29udGV4dENvbnN1bWVyJyk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU2hhcmVDb250ZXh0Q29uc3VtZXIpO1xuXG52YXIgX1RhcmdldGVkVXNlcnMgPSByZXF1aXJlKCcuL1RhcmdldGVkVXNlcnMnKTtcblxudmFyIF9UYXJnZXRlZFVzZXJzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1RhcmdldGVkVXNlcnMpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX3FyY29kZVJlYWN0ID0gcmVxdWlyZSgncXJjb2RlLnJlYWN0Jyk7XG5cbnZhciBfcXJjb2RlUmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcXJjb2RlUmVhY3QpO1xuXG52YXIgX2NsaXBib2FyZCA9IHJlcXVpcmUoJ2NsaXBib2FyZCcpO1xuXG52YXIgX2NsaXBib2FyZDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jbGlwYm9hcmQpO1xuXG52YXIgX21haW5BY3Rpb25CdXR0b24gPSByZXF1aXJlKCcuLi9tYWluL0FjdGlvbkJ1dHRvbicpO1xuXG52YXIgX21haW5BY3Rpb25CdXR0b24yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpbkFjdGlvbkJ1dHRvbik7XG5cbnZhciBfcHlkaW9VdGlsUGF0aCA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvcGF0aCcpO1xuXG52YXIgX3B5ZGlvVXRpbFBhdGgyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9VdGlsUGF0aCk7XG5cbnZhciBfcHlkaW9VdGlsTGFuZyA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvbGFuZycpO1xuXG52YXIgX3B5ZGlvVXRpbExhbmcyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9VdGlsTGFuZyk7XG5cbnZhciBfbWF0ZXJpYWxVaVN0eWxlcyA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpL3N0eWxlcycpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlciA9IHJlcXVpcmUoJy4uL21haW4vU2hhcmVIZWxwZXInKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX0xpbmtNb2RlbCA9IHJlcXVpcmUoJy4vTGlua01vZGVsJyk7XG5cbnZhciBfTGlua01vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0xpbmtNb2RlbCk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKFwiYm9vdFwiKTtcblxudmFyIFRvb2x0aXAgPSBfUHlkaW8kcmVxdWlyZUxpYi5Ub29sdGlwO1xuXG52YXIgUHVibGljTGlua0ZpZWxkID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1B1YmxpY0xpbmtGaWVsZCcsXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgbGlua01vZGVsOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoX0xpbmtNb2RlbDJbJ2RlZmF1bHQnXSksXG4gICAgICAgIGVkaXRBbGxvd2VkOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIG9uQ2hhbmdlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIHNob3dNYWlsZXI6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuY1xuICAgIH0sXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7IGVkaXRMaW5rOiBmYWxzZSwgY29weU1lc3NhZ2U6ICcnLCBzaG93UVJDb2RlOiBmYWxzZSB9O1xuICAgIH0sXG4gICAgdG9nZ2xlRWRpdE1vZGU6IGZ1bmN0aW9uIHRvZ2dsZUVkaXRNb2RlKCkge1xuICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIGxpbmtNb2RlbCA9IF9wcm9wcy5saW5rTW9kZWw7XG4gICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lZGl0TGluayAmJiB0aGlzLnN0YXRlLmN1c3RvbUxpbmspIHtcbiAgICAgICAgICAgIHZhciBhdXRoID0gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5nZXRBdXRob3JpemF0aW9ucyhweWRpbyk7XG4gICAgICAgICAgICBpZiAoYXV0aC5oYXNoX21pbl9sZW5ndGggJiYgdGhpcy5zdGF0ZS5jdXN0b21MaW5rLmxlbmd0aCA8IGF1dGguaGFzaF9taW5fbGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcHlkaW8uVUkuZGlzcGxheU1lc3NhZ2UoJ0VSUk9SJywgdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcyMjMnKS5yZXBsYWNlKCclcycsIGF1dGguaGFzaF9taW5fbGVuZ3RoKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGlua01vZGVsLnNldEN1c3RvbUxpbmsodGhpcy5zdGF0ZS5jdXN0b21MaW5rKTtcbiAgICAgICAgICAgIGxpbmtNb2RlbC5zYXZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVkaXRMaW5rOiAhdGhpcy5zdGF0ZS5lZGl0TGluaywgY3VzdG9tTGluazogdW5kZWZpbmVkIH0pO1xuICAgIH0sXG4gICAgY2hhbmdlTGluazogZnVuY3Rpb24gY2hhbmdlTGluayhldmVudCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICAgIHZhbHVlID0gX3B5ZGlvVXRpbExhbmcyWydkZWZhdWx0J10uY29tcHV0ZVN0cmluZ1NsdWcodmFsdWUpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgY3VzdG9tTGluazogdmFsdWUgfSk7XG4gICAgfSxcbiAgICBjbGVhckNvcHlNZXNzYWdlOiBmdW5jdGlvbiBjbGVhckNvcHlNZXNzYWdlKCkge1xuICAgICAgICBnbG9iYWwuc2V0VGltZW91dCgoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvcHlNZXNzYWdlOiAnJyB9KTtcbiAgICAgICAgfSkuYmluZCh0aGlzKSwgNTAwMCk7XG4gICAgfSxcblxuICAgIGF0dGFjaENsaXBib2FyZDogZnVuY3Rpb24gYXR0YWNoQ2xpcGJvYXJkKCkge1xuICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBsaW5rTW9kZWwgPSBfcHJvcHMyLmxpbmtNb2RlbDtcbiAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzMi5weWRpbztcblxuICAgICAgICB0aGlzLmRldGFjaENsaXBib2FyZCgpO1xuICAgICAgICBpZiAodGhpcy5yZWZzWydjb3B5LWJ1dHRvbiddKSB7XG4gICAgICAgICAgICB0aGlzLl9jbGlwID0gbmV3IF9jbGlwYm9hcmQyWydkZWZhdWx0J10odGhpcy5yZWZzWydjb3B5LWJ1dHRvbiddLCB7XG4gICAgICAgICAgICAgICAgdGV4dDogKGZ1bmN0aW9uICh0cmlnZ2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLmJ1aWxkUHVibGljVXJsKHB5ZGlvLCBsaW5rTW9kZWwuZ2V0TGluaygpLkxpbmtIYXNoKTtcbiAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuX2NsaXAub24oJ3N1Y2Nlc3MnLCAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb3B5TWVzc2FnZTogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcxOTInKSB9LCB0aGlzLmNsZWFyQ29weU1lc3NhZ2UpO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLl9jbGlwLm9uKCdlcnJvcicsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvcHlNZXNzYWdlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGlmIChnbG9iYWwubmF2aWdhdG9yLnBsYXRmb3JtLmluZGV4T2YoXCJNYWNcIikgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29weU1lc3NhZ2UgPSB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE0NCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvcHlNZXNzYWdlID0gdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcxNDMnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZzWydwdWJsaWMtbGluay1maWVsZCddLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvcHlNZXNzYWdlOiBjb3B5TWVzc2FnZSB9LCB0aGlzLmNsZWFyQ29weU1lc3NhZ2UpO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGRldGFjaENsaXBib2FyZDogZnVuY3Rpb24gZGV0YWNoQ2xpcGJvYXJkKCkge1xuICAgICAgICBpZiAodGhpcy5fY2xpcCkge1xuICAgICAgICAgICAgdGhpcy5fY2xpcC5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbiBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcbiAgICAgICAgdGhpcy5hdHRhY2hDbGlwYm9hcmQoKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmF0dGFjaENsaXBib2FyZCgpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIHRoaXMuZGV0YWNoQ2xpcGJvYXJkKCk7XG4gICAgfSxcblxuICAgIG9wZW5NYWlsZXI6IGZ1bmN0aW9uIG9wZW5NYWlsZXIoKSB7XG4gICAgICAgIHRoaXMucHJvcHMuc2hvd01haWxlcih0aGlzLnByb3BzLmxpbmtNb2RlbCk7XG4gICAgfSxcblxuICAgIHRvZ2dsZVFSQ29kZTogZnVuY3Rpb24gdG9nZ2xlUVJDb2RlKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2hvd1FSQ29kZTogIXRoaXMuc3RhdGUuc2hvd1FSQ29kZSB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIF9wcm9wczMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgbGlua01vZGVsID0gX3Byb3BzMy5saW5rTW9kZWw7XG4gICAgICAgIHZhciBweWRpbyA9IF9wcm9wczMucHlkaW87XG5cbiAgICAgICAgdmFyIHB1YmxpY0xpbmsgPSBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLmJ1aWxkUHVibGljVXJsKHB5ZGlvLCBsaW5rTW9kZWwuZ2V0TGluaygpLkxpbmtIYXNoKTtcbiAgICAgICAgdmFyIGF1dGggPSBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLmdldEF1dGhvcml6YXRpb25zKHB5ZGlvKTtcbiAgICAgICAgdmFyIGVkaXRBbGxvd2VkID0gdGhpcy5wcm9wcy5lZGl0QWxsb3dlZCAmJiBhdXRoLmVkaXRhYmxlX2hhc2ggJiYgIXRoaXMucHJvcHMuaXNSZWFkb25seSgpICYmIGxpbmtNb2RlbC5pc0VkaXRhYmxlKCk7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVkaXRMaW5rICYmIGVkaXRBbGxvd2VkKSB7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgYmFja2dyb3VuZENvbG9yOiAnI2Y1ZjVmNScsIHBhZGRpbmc6ICcwIDZweCcsIG1hcmdpbjogJzAgLTZweCcsIGJvcmRlclJhZGl1czogMiB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmb250U2l6ZTogMTYsIGNvbG9yOiAncmdiYSgwLDAsMCwwLjQpJywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIG1heFdpZHRoOiAxNjAsIHdoaXRlU3BhY2U6ICdub3dyYXAnLCBvdmVyZmxvdzogJ2hpZGRlbicsIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcHlkaW9VdGlsUGF0aDJbJ2RlZmF1bHQnXS5nZXREaXJuYW1lKHB1YmxpY0xpbmspICsgJy8gJ1xuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5UZXh0RmllbGQsIHsgc3R5bGU6IHsgZmxleDogMSwgbWFyZ2luUmlnaHQ6IDEwLCBtYXJnaW5MZWZ0OiAxMCB9LCBvbkNoYW5nZTogdGhpcy5jaGFuZ2VMaW5rLCB2YWx1ZTogdGhpcy5zdGF0ZS5jdXN0b21MaW5rICE9PSB1bmRlZmluZWQgPyB0aGlzLnN0YXRlLmN1c3RvbUxpbmsgOiBsaW5rTW9kZWwuZ2V0TGluaygpLkxpbmtIYXNoIH0pLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWFpbkFjdGlvbkJ1dHRvbjJbJ2RlZmF1bHQnXSwgeyBtZGlJY29uOiAnY2hlY2snLCBjYWxsYmFjazogdGhpcy50b2dnbGVFZGl0TW9kZSB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHRleHRBbGlnbjogJ2NlbnRlcicsIGZvbnRTaXplOiAxMywgY29sb3I6ICdyZ2JhKDAsMCwwLDAuNDMpJywgcGFkZGluZ1RvcDogMTYgfSB9LFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE5NCcpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgdmFyIGNvcHlNZXNzYWdlID0gX3N0YXRlLmNvcHlNZXNzYWdlO1xuICAgICAgICAgICAgdmFyIGxpbmtUb29sdGlwID0gX3N0YXRlLmxpbmtUb29sdGlwO1xuXG4gICAgICAgICAgICB2YXIgc2V0SHRtbCA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgX19odG1sOiB0aGlzLnN0YXRlLmNvcHlNZXNzYWdlIH07XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgdmFyIGFjdGlvbkxpbmtzID0gW10sXG4gICAgICAgICAgICAgICAgcXJDb2RlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdmFyIG11aVRoZW1lID0gdGhpcy5wcm9wcy5tdWlUaGVtZTtcblxuICAgICAgICAgICAgYWN0aW9uTGlua3MucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGtleTogXCJjb3B5XCIsXG4gICAgICAgICAgICAgICAgICAgIHJlZjogJ2NvcHktYnV0dG9uJyxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgcG9zaXRpb246ICdyZWxhdGl2ZScsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCB3aWR0aDogMzYsIGhlaWdodDogMzYsIHBhZGRpbmc6ICc4cHggMTBweCcsIG1hcmdpbjogJzAgNnB4JywgY3Vyc29yOiAncG9pbnRlcicsIGJvcmRlclJhZGl1czogJzUwJScsIGJvcmRlcjogJzFweCBzb2xpZCAnICsgbXVpVGhlbWUucGFsZXR0ZS5wcmltYXJ5MUNvbG9yIH0sXG4gICAgICAgICAgICAgICAgICAgIG9uTW91c2VPdmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGxpbmtUb29sdGlwOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBvbk1vdXNlT3V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGxpbmtUb29sdGlwOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoVG9vbHRpcCwge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogY29weU1lc3NhZ2UgPyBjb3B5TWVzc2FnZSA6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTkxJyksXG4gICAgICAgICAgICAgICAgICAgIGhvcml6b250YWxQb3NpdGlvbjogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICAgICAgdmVydGljYWxQb3NpdGlvbjogXCJib3R0b21cIixcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogbGlua1Rvb2x0aXBcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnY29weS1saW5rLWJ1dHRvbiBtZGkgbWRpLWNvbnRlbnQtY29weScsIHN0eWxlOiB7IGNvbG9yOiBtdWlUaGVtZS5wYWxldHRlLnByaW1hcnkxQ29sb3IgfSB9KVxuICAgICAgICAgICAgKSk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnNob3dNYWlsZXIpIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25MaW5rcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYWluQWN0aW9uQnV0dG9uMlsnZGVmYXVsdCddLCB7IGtleTogJ291dGxpbmUnLCBjYWxsYmFjazogdGhpcy5vcGVuTWFpbGVyLCBtZGlJY29uOiAnZW1haWwtb3V0bGluZScsIG1lc3NhZ2VJZDogJzQ1JyB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZWRpdEFsbG93ZWQpIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25MaW5rcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYWluQWN0aW9uQnV0dG9uMlsnZGVmYXVsdCddLCB7IGtleTogJ3BlbmNpbCcsIGNhbGxiYWNrOiB0aGlzLnRvZ2dsZUVkaXRNb2RlLCBtZGlJY29uOiAncGVuY2lsJywgbWVzc2FnZUlkOiBcIjE5M1wiIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLnFyY29kZUVuYWJsZWQoKSkge1xuICAgICAgICAgICAgICAgIGFjdGlvbkxpbmtzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21haW5BY3Rpb25CdXR0b24yWydkZWZhdWx0J10sIHsga2V5OiAncXJjb2RlJywgY2FsbGJhY2s6IHRoaXMudG9nZ2xlUVJDb2RlLCBtZGlJY29uOiAncXJjb2RlJywgbWVzc2FnZUlkOiAnOTQnIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhY3Rpb25MaW5rcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25MaW5rcyA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIG1hcmdpbjogJzIwcHggMCAxMHB4JyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSksXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbkxpbmtzLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgc3R5bGU6IHsgZmxleDogMSB9IH0pXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYWN0aW9uTGlua3MgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2hvd1FSQ29kZSkge1xuICAgICAgICAgICAgICAgIHFyQ29kZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5QYXBlcixcbiAgICAgICAgICAgICAgICAgICAgeyB6RGVwdGg6IDEsIHN0eWxlOiB7IHdpZHRoOiAxMjAsIHBhZGRpbmdUb3A6IDEwLCBvdmVyZmxvdzogJ2hpZGRlbicsIG1hcmdpbjogJzAgYXV0bycsIGhlaWdodDogMTIwLCB0ZXh0QWxpZ246ICdjZW50ZXInIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX3FyY29kZVJlYWN0MlsnZGVmYXVsdCddLCB7IHNpemU6IDEwMCwgdmFsdWU6IHB1YmxpY0xpbmssIGxldmVsOiAnUScgfSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBxckNvZGUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5QYXBlciwgeyB6RGVwdGg6IDAsIHN0eWxlOiB7IHdpZHRoOiAxMjAsIG92ZXJmbG93OiAnaGlkZGVuJywgbWFyZ2luOiAnMCBhdXRvJywgaGVpZ2h0OiAwLCB0ZXh0QWxpZ246ICdjZW50ZXInIH0gfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUGFwZXIsXG4gICAgICAgICAgICAgICAgeyB6RGVwdGg6IDAsIHJvdW5kZWQ6IGZhbHNlLCBjbGFzc05hbWU6ICdwdWJsaWMtbGluay1jb250YWluZXInIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5UZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdMaW5rJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogJ3B1YmxpYy1saW5rLWZpZWxkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBwdWJsaWNMaW5rLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25Gb2N1czogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC5zZWxlY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dFN0eWxlOiB7IHRleHRBbGlnbjogJ2NlbnRlcicsIGJhY2tncm91bmRDb2xvcjogJyNmNWY1ZjUnLCBib3JkZXJSYWRpdXM6IDIsIHBhZGRpbmc6ICcwIDVweCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuZGVybGluZVN0eWxlOiB7IGJvcmRlckNvbG9yOiAnI2Y1ZjVmNScsIHRleHREZWNvcmF0aW9uOiBsaW5rTW9kZWwuaXNFeHBpcmVkKCkgPyAnbGluZS10aHJvdWdoJyA6IG51bGwgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuZGVybGluZUZvY3VzU3R5bGU6IHsgYm90dG9tOiAwIH1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGZhbHNlICYmIHRoaXMucHJvcHMubGlua0RhdGEudGFyZ2V0X3VzZXJzICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9UYXJnZXRlZFVzZXJzMlsnZGVmYXVsdCddLCB0aGlzLnByb3BzKSxcbiAgICAgICAgICAgICAgICBhY3Rpb25MaW5rcyxcbiAgICAgICAgICAgICAgICBxckNvZGVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gUHVibGljTGlua0ZpZWxkID0gKDAsIF9tYXRlcmlhbFVpU3R5bGVzLm11aVRoZW1lYWJsZSkoKShQdWJsaWNMaW5rRmllbGQpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gUHVibGljTGlua0ZpZWxkID0gKDAsIF9TaGFyZUNvbnRleHRDb25zdW1lcjJbJ2RlZmF1bHQnXSkoUHVibGljTGlua0ZpZWxkKTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFB1YmxpY0xpbmtGaWVsZDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX0xpbmtNb2RlbCA9IHJlcXVpcmUoJy4vTGlua01vZGVsJyk7XG5cbnZhciBfTGlua01vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0xpbmtNb2RlbCk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBMYWJlbFBhbmVsID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKExhYmVsUGFuZWwsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gTGFiZWxQYW5lbCgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIExhYmVsUGFuZWwpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKExhYmVsUGFuZWwucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoTGFiZWxQYW5lbCwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIGxpbmtNb2RlbCA9IF9wcm9wcy5saW5rTW9kZWw7XG5cbiAgICAgICAgICAgIHZhciBtID0gZnVuY3Rpb24gbShpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBweWRpby5NZXNzYWdlSGFzaFsnc2hhcmVfY2VudGVyLicgKyBpZF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIGxpbmsgPSBsaW5rTW9kZWwuZ2V0TGluaygpO1xuICAgICAgICAgICAgdmFyIHVwZGF0ZUxhYmVsID0gZnVuY3Rpb24gdXBkYXRlTGFiZWwoZSwgdikge1xuICAgICAgICAgICAgICAgIGxpbmsuTGFiZWwgPSB2O1xuICAgICAgICAgICAgICAgIGxpbmtNb2RlbC51cGRhdGVMaW5rKGxpbmspO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHVwZGF0ZURlc2NyaXB0aW9uID0gZnVuY3Rpb24gdXBkYXRlRGVzY3JpcHRpb24oZSwgdikge1xuICAgICAgICAgICAgICAgIGxpbmsuRGVzY3JpcHRpb24gPSB2O1xuICAgICAgICAgICAgICAgIGxpbmtNb2RlbC51cGRhdGVMaW5rKGxpbmspO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7IHN0eWxlOiB7IG1hcmdpblRvcDogLTE0IH0sIGZsb2F0aW5nTGFiZWxUZXh0OiBtKDI2NSksIHZhbHVlOiBsaW5rLkxhYmVsLCBvbkNoYW5nZTogdXBkYXRlTGFiZWwsIGZ1bGxXaWR0aDogdHJ1ZSB9KSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5UZXh0RmllbGQsIHsgc3R5bGU6IHsgbWFyZ2luVG9wOiAtMTQgfSwgZmxvYXRpbmdMYWJlbFRleHQ6IG0oMjY2KSwgdmFsdWU6IGxpbmsuRGVzY3JpcHRpb24sIG9uQ2hhbmdlOiB1cGRhdGVEZXNjcmlwdGlvbiwgZnVsbFdpZHRoOiB0cnVlIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIExhYmVsUGFuZWw7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuTGFiZWxQYW5lbC5Qcm9wVHlwZXMgPSB7XG5cbiAgICBweWRpbzogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKF9weWRpbzJbJ2RlZmF1bHQnXSksXG4gICAgbGlua01vZGVsOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoX0xpbmtNb2RlbDJbJ2RlZmF1bHQnXSlcblxufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gTGFiZWxQYW5lbDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9weWRpb0h0dHBBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL2FwaScpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb0h0dHBBcGkpO1xuXG52YXIgX3B5ZGlvTGFuZ09ic2VydmFibGUgPSByZXF1aXJlKCdweWRpby9sYW5nL29ic2VydmFibGUnKTtcblxudmFyIF9weWRpb0xhbmdPYnNlcnZhYmxlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvTGFuZ09ic2VydmFibGUpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlciA9IHJlcXVpcmUoJy4uL21haW4vU2hhcmVIZWxwZXInKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9weWRpb0h0dHBSZXN0QXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9yZXN0LWFwaScpO1xuXG52YXIgX3B5ZGlvVXRpbFBhc3MgPSByZXF1aXJlKCdweWRpby91dGlsL3Bhc3MnKTtcblxudmFyIF9weWRpb1V0aWxQYXNzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvVXRpbFBhc3MpO1xuXG52YXIgTGlua01vZGVsID0gKGZ1bmN0aW9uIChfT2JzZXJ2YWJsZSkge1xuICAgIF9pbmhlcml0cyhMaW5rTW9kZWwsIF9PYnNlcnZhYmxlKTtcblxuICAgIGZ1bmN0aW9uIExpbmtNb2RlbCgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIExpbmtNb2RlbCk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoTGlua01vZGVsLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcyk7XG4gICAgICAgIHRoaXMubGluayA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5SZXN0U2hhcmVMaW5rKCk7XG4gICAgICAgIHRoaXMubGluay5QZXJtaXNzaW9ucyA9IFtfcHlkaW9IdHRwUmVzdEFwaS5SZXN0U2hhcmVMaW5rQWNjZXNzVHlwZS5jb25zdHJ1Y3RGcm9tT2JqZWN0KFwiUHJldmlld1wiKSwgX3B5ZGlvSHR0cFJlc3RBcGkuUmVzdFNoYXJlTGlua0FjY2Vzc1R5cGUuY29uc3RydWN0RnJvbU9iamVjdChcIkRvd25sb2FkXCIpXTtcbiAgICAgICAgdGhpcy5saW5rLlBvbGljaWVzID0gW107XG4gICAgICAgIHRoaXMubGluay5Qb2xpY2llc0NvbnRleHRFZGl0YWJsZSA9IHRydWU7XG4gICAgICAgIHRoaXMubGluay5Sb290Tm9kZXMgPSBbXTtcbiAgICAgICAgdGhpcy5WYWxpZFBhc3N3b3JkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoTGlua01vZGVsLCBbe1xuICAgICAgICBrZXk6ICdpc0VkaXRhYmxlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlzRWRpdGFibGUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saW5rLlBvbGljaWVzQ29udGV4dEVkaXRhYmxlO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdpc0RpcnR5JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlzRGlydHkoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kaXJ0eTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0TGlua1V1aWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0TGlua1V1aWQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saW5rLlV1aWQ7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQHJldHVybiB7UmVzdFNoYXJlTGlua31cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRMaW5rJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldExpbmsoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saW5rO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRQdWJsaWNVcmwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0UHVibGljVXJsKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uYnVpbGRQdWJsaWNVcmwocHlkaW8sIHRoaXMubGluay5MaW5rSGFzaCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIGxpbmsge1Jlc3RTaGFyZUxpbmt9XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAndXBkYXRlTGluaycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVMaW5rKGxpbmspIHtcbiAgICAgICAgICAgIHRoaXMubGluayA9IGxpbms7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeURpcnR5KCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ25vdGlmeURpcnR5JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG5vdGlmeURpcnR5KCkge1xuICAgICAgICAgICAgdGhpcy5kaXJ0eSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeSgndXBkYXRlJyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JldmVydENoYW5nZXMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmV2ZXJ0Q2hhbmdlcygpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9yaWdpbmFsTGluaykge1xuICAgICAgICAgICAgICAgIHRoaXMubGluayA9IHRoaXMuY2xvbmUodGhpcy5vcmlnaW5hbExpbmspO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlydHkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVBhc3N3b3JkID0gdGhpcy5jcmVhdGVQYXNzd29yZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5WYWxpZFBhc3N3b3JkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeSgndXBkYXRlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2hhc1Blcm1pc3Npb24nLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gaGFzUGVybWlzc2lvbihwZXJtaXNzaW9uVmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxpbmsuUGVybWlzc2lvbnMuZmlsdGVyKGZ1bmN0aW9uIChwZXJtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBlcm0gPT09IHBlcm1pc3Npb25WYWx1ZTtcbiAgICAgICAgICAgIH0pLmxlbmd0aCA+IDA7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2lzRXhwaXJlZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBpc0V4cGlyZWQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5saW5rLk1heERvd25sb2FkcyAmJiBwYXJzZUludCh0aGlzLmxpbmsuQ3VycmVudERvd25sb2FkcykgPj0gcGFyc2VJbnQodGhpcy5saW5rLk1heERvd25sb2FkcykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmxpbmsuQWNjZXNzRW5kKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ET1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB1dWlkIHN0cmluZ1xuICAgICAgICAgKiBAcmV0dXJuIHtQcm9taXNlLjxSZXN0U2hhcmVMaW5rPn1cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdsb2FkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxvYWQodXVpZCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5TaGFyZVNlcnZpY2VBcGkoX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCkpO1xuICAgICAgICAgICAgcmV0dXJuIGFwaS5nZXRTaGFyZUxpbmsodXVpZCkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMubGluayA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICBpZiAoIV90aGlzLmxpbmsuUGVybWlzc2lvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMubGluay5QZXJtaXNzaW9ucyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIV90aGlzLmxpbmsuUG9saWNpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMubGluay5Qb2xpY2llcyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIV90aGlzLmxpbmsuUm9vdE5vZGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmxpbmsuUm9vdE5vZGVzID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF90aGlzLm9yaWdpbmFsTGluayA9IF90aGlzLmNsb25lKF90aGlzLmxpbmspO1xuICAgICAgICAgICAgICAgIF90aGlzLm5vdGlmeShcInVwZGF0ZVwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzZXRDcmVhdGVQYXNzd29yZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRDcmVhdGVQYXNzd29yZChwYXNzd29yZCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmIChwYXNzd29yZCkge1xuICAgICAgICAgICAgICAgIF9weWRpb1V0aWxQYXNzMlsnZGVmYXVsdCddLmNoZWNrUGFzc3dvcmRTdHJlbmd0aChwYXNzd29yZCwgZnVuY3Rpb24gKG9rLCBtc2cpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMyLlZhbGlkUGFzc3dvcmQgPSBvaztcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMyLlZhbGlkUGFzc3dvcmRNZXNzYWdlID0gbXNnO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLlZhbGlkUGFzc3dvcmQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jcmVhdGVQYXNzd29yZCA9IHBhc3N3b3JkO1xuICAgICAgICAgICAgdGhpcy5saW5rLlBhc3N3b3JkUmVxdWlyZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnlEaXJ0eSgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzZXRVcGRhdGVQYXNzd29yZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRVcGRhdGVQYXNzd29yZChwYXNzd29yZCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmIChwYXNzd29yZCkge1xuICAgICAgICAgICAgICAgIF9weWRpb1V0aWxQYXNzMlsnZGVmYXVsdCddLmNoZWNrUGFzc3dvcmRTdHJlbmd0aChwYXNzd29yZCwgZnVuY3Rpb24gKG9rLCBtc2cpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMzLlZhbGlkUGFzc3dvcmQgPSBvaztcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMzLlZhbGlkUGFzc3dvcmRNZXNzYWdlID0gbXNnO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLlZhbGlkUGFzc3dvcmQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy51cGRhdGVQYXNzd29yZCA9IHBhc3N3b3JkO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnlEaXJ0eSgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzZXRDdXN0b21MaW5rJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNldEN1c3RvbUxpbmsobmV3TGluaykge1xuICAgICAgICAgICAgdGhpcy5jdXN0b21MaW5rID0gbmV3TGluaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcmV0dXJuIHsqfFByb21pc2UuPFJlc3RTaGFyZUxpbms+fVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3NhdmUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2F2ZSgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuVmFsaWRQYXNzd29yZCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih0aGlzLlZhbGlkUGFzc3dvcmRNZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuU2hhcmVTZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLlJlc3RQdXRTaGFyZUxpbmtSZXF1ZXN0KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5jcmVhdGVQYXNzd29yZCkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QuUGFzc3dvcmRFbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXF1ZXN0LkNyZWF0ZVBhc3N3b3JkID0gdGhpcy5jcmVhdGVQYXNzd29yZDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy51cGRhdGVQYXNzd29yZCkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QuUGFzc3dvcmRFbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubGluay5QYXNzd29yZFJlcXVpcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QuQ3JlYXRlUGFzc3dvcmQgPSB0aGlzLnVwZGF0ZVBhc3N3b3JkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QuVXBkYXRlUGFzc3dvcmQgPSB0aGlzLnVwZGF0ZVBhc3N3b3JkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5QYXNzd29yZEVuYWJsZWQgPSB0aGlzLmxpbmsuUGFzc3dvcmRSZXF1aXJlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLmdldEF1dGhvcml6YXRpb25zKHB5ZGlvKS5wYXNzd29yZF9tYW5kYXRvcnkgJiYgIXJlcXVlc3QuUGFzc3dvcmRFbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgY2Fubm90IGRpc2FibGUgcGFzc293cmQgb24gdGhpcyBsaW5rJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5jdXN0b21MaW5rICYmIHRoaXMuY3VzdG9tTGluayAhPT0gdGhpcy5saW5rLkxpbmtIYXNoKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5VcGRhdGVDdXN0b21IYXNoID0gdGhpcy5jdXN0b21MaW5rO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVxdWVzdC5TaGFyZUxpbmsgPSB0aGlzLmxpbms7XG4gICAgICAgICAgICByZXR1cm4gYXBpLnB1dFNoYXJlTGluayhyZXF1ZXN0KS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBfdGhpczQubGluayA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICBfdGhpczQuZGlydHkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBfdGhpczQub3JpZ2luYWxMaW5rID0gX3RoaXM0LmNsb25lKF90aGlzNC5saW5rKTtcbiAgICAgICAgICAgICAgICBfdGhpczQudXBkYXRlUGFzc3dvcmQgPSBfdGhpczQuY3JlYXRlUGFzc3dvcmQgPSBfdGhpczQuY3VzdG9tTGluayA9IG51bGw7XG4gICAgICAgICAgICAgICAgX3RoaXM0LlZhbGlkUGFzc3dvcmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIF90aGlzNC5ub3RpZnkoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgICAgIF90aGlzNC5ub3RpZnkoJ3NhdmUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEByZXR1cm4geyp8UHJvbWlzZS48UmVzdFNoYXJlTGluaz59XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGVsZXRlTGluaycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZWxldGVMaW5rKGVtcHR5TGluaykge1xuICAgICAgICAgICAgdmFyIF90aGlzNSA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuU2hhcmVTZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgICAgIHJldHVybiBhcGkuZGVsZXRlU2hhcmVMaW5rKHRoaXMubGluay5VdWlkKS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBfdGhpczUubGluayA9IGVtcHR5TGluaztcbiAgICAgICAgICAgICAgICBfdGhpczUuZGlydHkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBfdGhpczUudXBkYXRlUGFzc3dvcmQgPSBfdGhpczUuY3JlYXRlUGFzc3dvcmQgPSBfdGhpczUuY3VzdG9tTGluayA9IG51bGw7XG4gICAgICAgICAgICAgICAgX3RoaXM1Lm5vdGlmeSgndXBkYXRlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gbGluayB7UmVzdFNoYXJlTGlua31cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjbG9uZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbG9uZShsaW5rKSB7XG4gICAgICAgICAgICByZXR1cm4gX3B5ZGlvSHR0cFJlc3RBcGkuUmVzdFNoYXJlTGluay5jb25zdHJ1Y3RGcm9tT2JqZWN0KEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobGluaykpKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBMaW5rTW9kZWw7XG59KShfcHlkaW9MYW5nT2JzZXJ2YWJsZTJbJ2RlZmF1bHQnXSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IExpbmtNb2RlbDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lciA9IHJlcXVpcmUoJy4uL1NoYXJlQ29udGV4dENvbnN1bWVyJyk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU2hhcmVDb250ZXh0Q29uc3VtZXIpO1xuXG52YXIgX0ZpZWxkID0gcmVxdWlyZSgnLi9GaWVsZCcpO1xuXG52YXIgX0ZpZWxkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0ZpZWxkKTtcblxudmFyIF9QZXJtaXNzaW9ucyA9IHJlcXVpcmUoJy4vUGVybWlzc2lvbnMnKTtcblxudmFyIF9QZXJtaXNzaW9uczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9QZXJtaXNzaW9ucyk7XG5cbnZhciBfVGFyZ2V0ZWRVc2VycyA9IHJlcXVpcmUoJy4vVGFyZ2V0ZWRVc2VycycpO1xuXG52YXIgX1RhcmdldGVkVXNlcnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVGFyZ2V0ZWRVc2Vycyk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfTGlua01vZGVsID0gcmVxdWlyZSgnLi9MaW5rTW9kZWwnKTtcblxudmFyIF9MaW5rTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfTGlua01vZGVsKTtcblxudmFyIF9jb21wb3NpdGVDb21wb3NpdGVNb2RlbCA9IHJlcXVpcmUoJy4uL2NvbXBvc2l0ZS9Db21wb3NpdGVNb2RlbCcpO1xuXG52YXIgX2NvbXBvc2l0ZUNvbXBvc2l0ZU1vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbXBvc2l0ZUNvbXBvc2l0ZU1vZGVsKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX21haW5TaGFyZUhlbHBlciA9IHJlcXVpcmUoJy4uL21haW4vU2hhcmVIZWxwZXInKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2Zvcm0nKTtcblxudmFyIFZhbGlkUGFzc3dvcmQgPSBfUHlkaW8kcmVxdWlyZUxpYi5WYWxpZFBhc3N3b3JkO1xuXG52YXIgUHVibGljTGlua1BhbmVsID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1B1YmxpY0xpbmtQYW5lbCcsXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgbGlua01vZGVsOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoX0xpbmtNb2RlbDJbJ2RlZmF1bHQnXSksXG4gICAgICAgIGNvbXBvc2l0ZU1vZGVsOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoX2NvbXBvc2l0ZUNvbXBvc2l0ZU1vZGVsMlsnZGVmYXVsdCddKSxcbiAgICAgICAgcHlkaW86IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuaW5zdGFuY2VPZihfcHlkaW8yWydkZWZhdWx0J10pLFxuICAgICAgICBhdXRob3JpemF0aW9uczogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5vYmplY3QsXG4gICAgICAgIHNob3dNYWlsZXI6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuY1xuICAgIH0sXG5cbiAgICB0b2dnbGVMaW5rOiBmdW5jdGlvbiB0b2dnbGVMaW5rKCkge1xuICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIGxpbmtNb2RlbCA9IF9wcm9wcy5saW5rTW9kZWw7XG4gICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcbiAgICAgICAgdmFyIHNob3dUZW1wb3JhcnlQYXNzd29yZCA9IHRoaXMuc3RhdGUuc2hvd1RlbXBvcmFyeVBhc3N3b3JkO1xuXG4gICAgICAgIGlmIChzaG93VGVtcG9yYXJ5UGFzc3dvcmQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzaG93VGVtcG9yYXJ5UGFzc3dvcmQ6IGZhbHNlLCB0ZW1wb3JhcnlQYXNzd29yZDogbnVsbCB9KTtcbiAgICAgICAgfSBlbHNlIGlmICghbGlua01vZGVsLmdldExpbmtVdWlkKCkgJiYgX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5nZXRBdXRob3JpemF0aW9ucyhweWRpbykucGFzc3dvcmRfbWFuZGF0b3J5KSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2hvd1RlbXBvcmFyeVBhc3N3b3JkOiB0cnVlLCB0ZW1wb3JhcnlQYXNzd29yZDogJycgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAobGlua01vZGVsLmdldExpbmtVdWlkKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNvbXBvc2l0ZU1vZGVsLmRlbGV0ZUxpbmsobGlua01vZGVsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGlua01vZGVsLnNhdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHsgc2hvd1RlbXBvcmFyeVBhc3N3b3JkOiBmYWxzZSwgdGVtcG9yYXJ5UGFzc3dvcmQ6IG51bGwsIGRpc2FibGVkOiBmYWxzZSB9O1xuICAgIH0sXG5cbiAgICB1cGRhdGVUZW1wb3JhcnlQYXNzd29yZDogZnVuY3Rpb24gdXBkYXRlVGVtcG9yYXJ5UGFzc3dvcmQodmFsdWUsIGV2ZW50KSB7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZ2V0VmFsdWUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgdGVtcG9yYXJ5UGFzc3dvcmQ6IHZhbHVlIH0pO1xuICAgIH0sXG5cbiAgICBlbmFibGVMaW5rV2l0aFBhc3N3b3JkOiBmdW5jdGlvbiBlbmFibGVMaW5rV2l0aFBhc3N3b3JkKCkge1xuICAgICAgICB2YXIgbGlua01vZGVsID0gdGhpcy5wcm9wcy5saW5rTW9kZWw7XG5cbiAgICAgICAgaWYgKCF0aGlzLnJlZnNbJ3ZhbGlkLXBhc3MnXS5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMucHlkaW8uVUkuZGlzcGxheU1lc3NhZ2UoJ0VSUk9SJywgJ0ludmFsaWQgUGFzc3dvcmQnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsaW5rTW9kZWwuc2V0Q3JlYXRlUGFzc3dvcmQodGhpcy5zdGF0ZS50ZW1wb3JhcnlQYXNzd29yZCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsaW5rTW9kZWwuc2F2ZSgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLnB5ZGlvLlVJLmRpc3BsYXlNZXNzYWdlKCdFUlJPUicsIGUubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNob3dUZW1wb3JhcnlQYXNzd29yZDogZmFsc2UsIHRlbXBvcmFyeVBhc3N3b3JkOiBudWxsIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgbGlua01vZGVsID0gX3Byb3BzMi5saW5rTW9kZWw7XG4gICAgICAgIHZhciBweWRpbyA9IF9wcm9wczIucHlkaW87XG4gICAgICAgIHZhciBjb21wb3NpdGVNb2RlbCA9IF9wcm9wczIuY29tcG9zaXRlTW9kZWw7XG5cbiAgICAgICAgdmFyIGF1dGhvcml6YXRpb25zID0gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5nZXRBdXRob3JpemF0aW9ucyhweWRpbyk7XG4gICAgICAgIHZhciBub2RlTGVhZiA9IGNvbXBvc2l0ZU1vZGVsLmdldE5vZGUoKS5pc0xlYWYoKTtcbiAgICAgICAgdmFyIGNhbkVuYWJsZSA9IG5vZGVMZWFmICYmIGF1dGhvcml6YXRpb25zLmZpbGVfcHVibGljX2xpbmsgfHwgIW5vZGVMZWFmICYmIGF1dGhvcml6YXRpb25zLmZvbGRlcl9wdWJsaWNfbGluaztcblxuICAgICAgICB2YXIgcHVibGljTGlua1BhbmVzID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgcHVibGljTGlua0ZpZWxkID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAobGlua01vZGVsLmdldExpbmtVdWlkKCkpIHtcbiAgICAgICAgICAgIHB1YmxpY0xpbmtGaWVsZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9GaWVsZDJbJ2RlZmF1bHQnXSwge1xuICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICBsaW5rTW9kZWw6IGxpbmtNb2RlbCxcbiAgICAgICAgICAgICAgICBzaG93TWFpbGVyOiB0aGlzLnByb3BzLnNob3dNYWlsZXIsXG4gICAgICAgICAgICAgICAgZWRpdEFsbG93ZWQ6IGF1dGhvcml6YXRpb25zLmVkaXRhYmxlX2hhc2ggJiYgbGlua01vZGVsLmlzRWRpdGFibGUoKSxcbiAgICAgICAgICAgICAgICBrZXk6ICdwdWJsaWMtbGluaydcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcHVibGljTGlua1BhbmVzID0gW19yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIG51bGwpLCBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfUGVybWlzc2lvbnMyWydkZWZhdWx0J10sIHtcbiAgICAgICAgICAgICAgICBjb21wb3NpdGVNb2RlbDogY29tcG9zaXRlTW9kZWwsXG4gICAgICAgICAgICAgICAgbGlua01vZGVsOiBsaW5rTW9kZWwsXG4gICAgICAgICAgICAgICAgcHlkaW86IHB5ZGlvLFxuICAgICAgICAgICAgICAgIGtleTogJ3B1YmxpYy1wZXJtJ1xuICAgICAgICAgICAgfSldO1xuICAgICAgICAgICAgaWYgKGxpbmtNb2RlbC5nZXRMaW5rKCkuVGFyZ2V0VXNlcnMpIHtcbiAgICAgICAgICAgICAgICBwdWJsaWNMaW5rUGFuZXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5EaXZpZGVyLCBudWxsKSk7XG4gICAgICAgICAgICAgICAgcHVibGljTGlua1BhbmVzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX1RhcmdldGVkVXNlcnMyWydkZWZhdWx0J10sIHsgbGlua01vZGVsOiBsaW5rTW9kZWwsIHB5ZGlvOiBweWRpbyB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5zaG93VGVtcG9yYXJ5UGFzc3dvcmQpIHtcbiAgICAgICAgICAgIHB1YmxpY0xpbmtGaWVsZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ3NlY3Rpb24tbGVnZW5kJywgc3R5bGU6IHsgbWFyZ2luVG9wOiAyMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMjE1JylcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogJzEwMCUnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoVmFsaWRQYXNzd29yZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlczogeyBsYWJlbDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcyMycpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS50ZW1wb3JhcnlQYXNzd29yZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLnVwZGF0ZVRlbXBvcmFyeVBhc3N3b3JkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiBcInZhbGlkLXBhc3NcIlxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHRleHRBbGlnbjogJ2NlbnRlcicsIG1hcmdpblRvcDogMjAgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWlzZWRCdXR0b24sIHsgbGFiZWw6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnOTInKSwgc2Vjb25kYXJ5OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljazogdGhpcy5lbmFibGVMaW5rV2l0aFBhc3N3b3JkIH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICghY2FuRW5hYmxlKSB7XG4gICAgICAgICAgICBwdWJsaWNMaW5rRmllbGQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogNTAwLCBjb2xvcjogJ3JnYmEoMCwwLDAsMC40MyknLCBwYWRkaW5nQm90dG9tOiAxNiwgcGFkZGluZ1RvcDogMTYgfSB9LFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZ2V0TWVzc2FnZShub2RlTGVhZiA/ICcyMjUnIDogJzIyNicpXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHVibGljTGlua0ZpZWxkID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmb250U2l6ZTogMTMsIGZvbnRXZWlnaHQ6IDUwMCwgY29sb3I6ICdyZ2JhKDAsMCwwLDAuNDMpJywgcGFkZGluZ0JvdHRvbTogMTYsIHBhZGRpbmdUb3A6IDE2IH0gfSxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE5MCcpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBzdHlsZTogdGhpcy5wcm9wcy5zdHlsZSB9LFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAnMTVweCAxMHB4IDExcHgnLCBiYWNrZ3JvdW5kQ29sb3I6ICcjZjVmNWY1JywgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNlMGUwZTAnLCBmb250U2l6ZTogMTUgfSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRvZ2dsZSwge1xuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5wcm9wcy5pc1JlYWRvbmx5KCkgfHwgdGhpcy5zdGF0ZS5kaXNhYmxlZCB8fCAhbGlua01vZGVsLmlzRWRpdGFibGUoKSB8fCAhbGlua01vZGVsLmdldExpbmtVdWlkKCkgJiYgIWNhbkVuYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGU6IHRoaXMudG9nZ2xlTGluayxcbiAgICAgICAgICAgICAgICAgICAgdG9nZ2xlZDogbGlua01vZGVsLmdldExpbmtVdWlkKCkgfHwgdGhpcy5zdGF0ZS5zaG93VGVtcG9yYXJ5UGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE4OScpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmc6IDIwIH0gfSxcbiAgICAgICAgICAgICAgICBwdWJsaWNMaW5rRmllbGRcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBwdWJsaWNMaW5rUGFuZXNcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gUHVibGljTGlua1BhbmVsID0gKDAsIF9TaGFyZUNvbnRleHRDb25zdW1lcjJbJ2RlZmF1bHQnXSkoUHVibGljTGlua1BhbmVsKTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFB1YmxpY0xpbmtQYW5lbDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyID0gcmVxdWlyZSgnLi4vU2hhcmVDb250ZXh0Q29uc3VtZXInKTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TaGFyZUNvbnRleHRDb25zdW1lcik7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfTGlua01vZGVsID0gcmVxdWlyZSgnLi9MaW5rTW9kZWwnKTtcblxudmFyIF9MaW5rTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfTGlua01vZGVsKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIgPSByZXF1aXJlKCcuLi9tYWluL1NoYXJlSGVscGVyJyk7XG5cbnZhciBfbWFpblNoYXJlSGVscGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21haW5TaGFyZUhlbHBlcik7XG5cbnZhciBfcHlkaW9IdHRwUmVzdEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvcmVzdC1hcGknKTtcblxudmFyIFB1YmxpY0xpbmtQZXJtaXNzaW9ucyA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdQdWJsaWNMaW5rUGVybWlzc2lvbnMnLFxuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIGxpbmtNb2RlbDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKF9MaW5rTW9kZWwyWydkZWZhdWx0J10pLFxuICAgICAgICBzdHlsZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5vYmplY3RcbiAgICB9LFxuXG4gICAgY2hhbmdlUGVybWlzc2lvbjogZnVuY3Rpb24gY2hhbmdlUGVybWlzc2lvbihldmVudCkge1xuICAgICAgICB2YXIgbmFtZSA9IGV2ZW50LnRhcmdldC5uYW1lO1xuICAgICAgICB2YXIgY2hlY2tlZCA9IGV2ZW50LnRhcmdldC5jaGVja2VkO1xuICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIGNvbXBvc2l0ZU1vZGVsID0gX3Byb3BzLmNvbXBvc2l0ZU1vZGVsO1xuICAgICAgICB2YXIgbGlua01vZGVsID0gX3Byb3BzLmxpbmtNb2RlbDtcblxuICAgICAgICB2YXIgbGluayA9IGxpbmtNb2RlbC5nZXRMaW5rKCk7XG4gICAgICAgIGlmIChjaGVja2VkKSB7XG4gICAgICAgICAgICBsaW5rLlBlcm1pc3Npb25zLnB1c2goX3B5ZGlvSHR0cFJlc3RBcGkuUmVzdFNoYXJlTGlua0FjY2Vzc1R5cGUuY29uc3RydWN0RnJvbU9iamVjdChuYW1lKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsaW5rLlBlcm1pc3Npb25zID0gbGluay5QZXJtaXNzaW9ucy5maWx0ZXIoZnVuY3Rpb24gKHBlcm0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGVybSAhPT0gbmFtZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb21wb3NpdGVNb2RlbC5nZXROb2RlKCkuaXNMZWFmKCkpIHtcbiAgICAgICAgICAgIHZhciBhdXRoID0gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5nZXRBdXRob3JpemF0aW9ucyhfcHlkaW8yWydkZWZhdWx0J10uZ2V0SW5zdGFuY2UoKSk7XG4gICAgICAgICAgICB2YXIgbWF4ID0gYXV0aC5tYXhfZG93bmxvYWRzO1xuICAgICAgICAgICAgLy8gUmVhZGFwdCB0ZW1wbGF0ZSBkZXBlbmRpbmcgb24gcGVybWlzc2lvbnNcbiAgICAgICAgICAgIGlmIChsaW5rTW9kZWwuaGFzUGVybWlzc2lvbignUHJldmlldycpKSB7XG4gICAgICAgICAgICAgICAgbGluay5WaWV3VGVtcGxhdGVOYW1lID0gXCJweWRpb191bmlxdWVfc3RyaXBcIjtcbiAgICAgICAgICAgICAgICBsaW5rLk1heERvd25sb2FkcyA9IDA7IC8vIENsZWFyIE1heCBEb3dubG9hZHMgaWYgUHJldmlldyBlbmFibGVkXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsaW5rLlZpZXdUZW1wbGF0ZU5hbWUgPSBcInB5ZGlvX3VuaXF1ZV9kbFwiO1xuICAgICAgICAgICAgICAgICAgICBpZiAobWF4ICYmICFsaW5rLk1heERvd25sb2Fkcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluay5NYXhEb3dubG9hZHMgPSBtYXg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wcm9wcy5saW5rTW9kZWwudXBkYXRlTGluayhsaW5rKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIGxpbmtNb2RlbCA9IF9wcm9wczIubGlua01vZGVsO1xuICAgICAgICB2YXIgY29tcG9zaXRlTW9kZWwgPSBfcHJvcHMyLmNvbXBvc2l0ZU1vZGVsO1xuICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMyLnB5ZGlvO1xuXG4gICAgICAgIHZhciBub2RlID0gY29tcG9zaXRlTW9kZWwuZ2V0Tm9kZSgpO1xuICAgICAgICB2YXIgcGVybXMgPSBbXSxcbiAgICAgICAgICAgIHByZXZpZXdXYXJuaW5nID0gdW5kZWZpbmVkO1xuICAgICAgICB2YXIgYXV0aCA9IF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uZ2V0QXV0aG9yaXphdGlvbnMoX3B5ZGlvMlsnZGVmYXVsdCddLmdldEluc3RhbmNlKCkpO1xuXG4gICAgICAgIGlmIChub2RlLmlzTGVhZigpKSB7XG4gICAgICAgICAgICB2YXIgX1NoYXJlSGVscGVyJG5vZGVIYXNFZGl0b3IgPSBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLm5vZGVIYXNFZGl0b3IocHlkaW8sIG5vZGUpO1xuXG4gICAgICAgICAgICB2YXIgcHJldmlldyA9IF9TaGFyZUhlbHBlciRub2RlSGFzRWRpdG9yLnByZXZpZXc7XG4gICAgICAgICAgICB2YXIgd3JpdGVhYmxlID0gX1NoYXJlSGVscGVyJG5vZGVIYXNFZGl0b3Iud3JpdGVhYmxlO1xuXG4gICAgICAgICAgICBwZXJtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBOQU1FOiAnRG93bmxvYWQnLFxuICAgICAgICAgICAgICAgIExBQkVMOiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzczJyksXG4gICAgICAgICAgICAgICAgRElTQUJMRUQ6ICFwcmV2aWV3IHx8ICFsaW5rTW9kZWwuaGFzUGVybWlzc2lvbignUHJldmlldycpIC8vIERvd25sb2FkIE9ubHksIGNhbm5vdCBlZGl0IHRoaXNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHByZXZpZXcgJiYgIWF1dGgubWF4X2Rvd25sb2Fkcykge1xuICAgICAgICAgICAgICAgIHBlcm1zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBOQU1FOiAnUHJldmlldycsXG4gICAgICAgICAgICAgICAgICAgIExBQkVMOiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzcyJyksXG4gICAgICAgICAgICAgICAgICAgIERJU0FCTEVEOiAhbGlua01vZGVsLmhhc1Blcm1pc3Npb24oJ0Rvd25sb2FkJylcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAobGlua01vZGVsLmhhc1Blcm1pc3Npb24oJ1ByZXZpZXcnKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAod3JpdGVhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBOQU1FOiAnVXBsb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBMQUJFTDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCc3NGInKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwZXJtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBOQU1FOiAnUHJldmlldycsXG4gICAgICAgICAgICAgICAgTEFCRUw6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnNzInKSxcbiAgICAgICAgICAgICAgICBESVNBQkxFRDogIWxpbmtNb2RlbC5oYXNQZXJtaXNzaW9uKCdVcGxvYWQnKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwZXJtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBOQU1FOiAnRG93bmxvYWQnLFxuICAgICAgICAgICAgICAgIExBQkVMOiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzczJylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcGVybXMucHVzaCh7XG4gICAgICAgICAgICAgICAgTkFNRTogJ1VwbG9hZCcsXG4gICAgICAgICAgICAgICAgTEFCRUw6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnNzQnKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKlxuICAgICAgICBpZih0aGlzLnByb3BzLnNoYXJlTW9kZWwuaXNQdWJsaWNMaW5rUHJldmlld0Rpc2FibGVkKCkgJiYgdGhpcy5wcm9wcy5zaGFyZU1vZGVsLmdldFB1YmxpY0xpbmtQZXJtaXNzaW9uKGxpbmtJZCwgJ3JlYWQnKSl7XG4gICAgICAgICAgICBwcmV2aWV3V2FybmluZyA9IDxkaXY+e3RoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTk1Jyl9PC9kaXY+O1xuICAgICAgICB9XG4gICAgICAgICovXG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBzdHlsZTogX2V4dGVuZHMoeyBwYWRkaW5nOiAnMTBweCAxNnB4JyB9LCB0aGlzLnByb3BzLnN0eWxlKSB9LFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmb250U2l6ZTogMTMsIGZvbnRXZWlnaHQ6IDUwMCwgY29sb3I6ICdyZ2JhKDAsMCwwLDAuNDMpJyB9IH0sXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCc3MHInKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgbWFyZ2luOiAnMTBweCAwIDIwcHgnIH0gfSxcbiAgICAgICAgICAgICAgICBwZXJtcy5tYXAoKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5DaGVja2JveCwge1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBwLk5BTUUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogcC5ESVNBQkxFRCB8fCB0aGlzLnByb3BzLmlzUmVhZG9ubHkoKSB8fCAhbGlua01vZGVsLmlzRWRpdGFibGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwLk5BTUUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogcC5MQUJFTCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hlY2s6IHRoaXMuY2hhbmdlUGVybWlzc2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ6IGxpbmtNb2RlbC5oYXNQZXJtaXNzaW9uKHAuTkFNRSksXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFN0eWxlOiB7IHdoaXRlU3BhY2U6ICdub3dyYXAnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBtYXJnaW46ICcxMHB4IDAnIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKSksXG4gICAgICAgICAgICAgICAgcHJldmlld1dhcm5pbmdcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gUHVibGljTGlua1Blcm1pc3Npb25zID0gKDAsIF9TaGFyZUNvbnRleHRDb25zdW1lcjJbJ2RlZmF1bHQnXSkoUHVibGljTGlua1Blcm1pc3Npb25zKTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFB1YmxpY0xpbmtQZXJtaXNzaW9ucztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lciA9IHJlcXVpcmUoJy4uL1NoYXJlQ29udGV4dENvbnN1bWVyJyk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU2hhcmVDb250ZXh0Q29uc3VtZXIpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX0xpbmtNb2RlbCA9IHJlcXVpcmUoJy4vTGlua01vZGVsJyk7XG5cbnZhciBfTGlua01vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0xpbmtNb2RlbCk7XG5cbnZhciBQdWJsaWNMaW5rVGVtcGxhdGUgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoUHVibGljTGlua1RlbXBsYXRlLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFB1YmxpY0xpbmtUZW1wbGF0ZSgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFB1YmxpY0xpbmtUZW1wbGF0ZSk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoUHVibGljTGlua1RlbXBsYXRlLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFB1YmxpY0xpbmtUZW1wbGF0ZSwgW3tcbiAgICAgICAga2V5OiAnb25Ecm9wRG93bkNoYW5nZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvbkRyb3BEb3duQ2hhbmdlKGV2ZW50LCBpbmRleCwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSB0aGlzLnByb3BzLmxpbmtNb2RlbDtcblxuICAgICAgICAgICAgbGlua01vZGVsLmdldExpbmsoKS5WaWV3VGVtcGxhdGVOYW1lID0gdmFsdWU7XG4gICAgICAgICAgICBsaW5rTW9kZWwubm90aWZ5RGlydHkoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBjcnRMYWJlbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSB0aGlzLnByb3BzLmxpbmtNb2RlbDtcblxuICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gbGlua01vZGVsLmdldExpbmsoKS5WaWV3VGVtcGxhdGVOYW1lO1xuICAgICAgICAgICAgdmFyIG1lbnVJdGVtcyA9IHRoaXMucHJvcHMubGF5b3V0RGF0YS5tYXAoZnVuY3Rpb24gKGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWQgJiYgbC5MQVlPVVRfRUxFTUVOVCA9PT0gc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY3J0TGFiZWwgPSBsLkxBWU9VVF9MQUJFTDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFzZWxlY3RlZCAmJiAhY3J0TGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSBsLkxBWU9VVF9FTEVNRU5UO1xuICAgICAgICAgICAgICAgICAgICBjcnRMYWJlbCA9IGwuTEFZT1VUX0xBQkVMO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsga2V5OiBsLkxBWU9VVF9FTEVNRU5ULCB2YWx1ZTogbC5MQVlPVVRfRUxFTUVOVCwgcHJpbWFyeVRleHQ6IGwuTEFZT1VUX0xBQkVMIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogdGhpcy5wcm9wcy5zdHlsZSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5TZWxlY3RGaWVsZCxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHNlbGVjdGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25Ecm9wRG93bkNoYW5nZS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMucHJvcHMuaXNSZWFkb25seSgpIHx8IHRoaXMucHJvcHMucmVhZG9ubHkgfHwgIWxpbmtNb2RlbC5pc0VkaXRhYmxlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsVGV4dDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcxNTEnKVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBtZW51SXRlbXNcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFB1YmxpY0xpbmtUZW1wbGF0ZTtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5QdWJsaWNMaW5rVGVtcGxhdGUuUHJvcFR5cGVzID0ge1xuICAgIGxpbmtNb2RlbDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKF9MaW5rTW9kZWwyWydkZWZhdWx0J10pXG59O1xuUHVibGljTGlua1RlbXBsYXRlID0gKDAsIF9TaGFyZUNvbnRleHRDb25zdW1lcjJbJ2RlZmF1bHQnXSkoUHVibGljTGlua1RlbXBsYXRlKTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFB1YmxpY0xpbmtUZW1wbGF0ZTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lciA9IHJlcXVpcmUoJy4uL1NoYXJlQ29udGV4dENvbnN1bWVyJyk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU2hhcmVDb250ZXh0Q29uc3VtZXIpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfTGlua01vZGVsID0gcmVxdWlyZSgnLi9MaW5rTW9kZWwnKTtcblxudmFyIF9MaW5rTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfTGlua01vZGVsKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIgPSByZXF1aXJlKCcuLi9tYWluL1NoYXJlSGVscGVyJyk7XG5cbnZhciBfbWFpblNoYXJlSGVscGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21haW5TaGFyZUhlbHBlcik7XG5cbnZhciBfcHlkaW9VdGlsUGFzcyA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvcGFzcycpO1xuXG52YXIgX3B5ZGlvVXRpbFBhc3MyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9VdGlsUGFzcyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdmb3JtJyk7XG5cbnZhciBWYWxpZFBhc3N3b3JkID0gX1B5ZGlvJHJlcXVpcmVMaWIuVmFsaWRQYXNzd29yZDtcblxudmFyIGdsb2JTdHlsZXMgPSB7XG4gICAgbGVmdEljb246IHtcbiAgICAgICAgbWFyZ2luOiAnMCAyMHB4IDAgNHB4JyxcbiAgICAgICAgY29sb3I6ICcjNzU3NTc1J1xuICAgIH1cbn07XG5cbnZhciBQdWJsaWNMaW5rU2VjdXJlT3B0aW9ucyA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdQdWJsaWNMaW5rU2VjdXJlT3B0aW9ucycsXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgbGlua01vZGVsOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoX0xpbmtNb2RlbDJbJ2RlZmF1bHQnXSkuaXNSZXF1aXJlZCxcbiAgICAgICAgc3R5bGU6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgfSxcblxuICAgIHVwZGF0ZURMRXhwaXJhdGlvbkZpZWxkOiBmdW5jdGlvbiB1cGRhdGVETEV4cGlyYXRpb25GaWVsZChldmVudCkge1xuICAgICAgICB2YXIgbmV3VmFsdWUgPSBldmVudC5jdXJyZW50VGFyZ2V0LnZhbHVlO1xuICAgICAgICBpZiAocGFyc2VJbnQobmV3VmFsdWUpIDwgMCkge1xuICAgICAgICAgICAgbmV3VmFsdWUgPSAtcGFyc2VJbnQobmV3VmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBsaW5rTW9kZWwgPSB0aGlzLnByb3BzLmxpbmtNb2RlbDtcblxuICAgICAgICB2YXIgbGluayA9IGxpbmtNb2RlbC5nZXRMaW5rKCk7XG4gICAgICAgIGxpbmsuTWF4RG93bmxvYWRzID0gbmV3VmFsdWU7XG4gICAgICAgIGxpbmtNb2RlbC51cGRhdGVMaW5rKGxpbmspO1xuICAgIH0sXG5cbiAgICB1cGRhdGVEYXlzRXhwaXJhdGlvbkZpZWxkOiBmdW5jdGlvbiB1cGRhdGVEYXlzRXhwaXJhdGlvbkZpZWxkKGV2ZW50LCBuZXdWYWx1ZSkge1xuICAgICAgICBpZiAoIW5ld1ZhbHVlKSB7XG4gICAgICAgICAgICBuZXdWYWx1ZSA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZ2V0VmFsdWUoKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbGlua01vZGVsID0gdGhpcy5wcm9wcy5saW5rTW9kZWw7XG5cbiAgICAgICAgdmFyIGxpbmsgPSBsaW5rTW9kZWwuZ2V0TGluaygpO1xuICAgICAgICBsaW5rLkFjY2Vzc0VuZCA9IG5ld1ZhbHVlO1xuICAgICAgICBsaW5rTW9kZWwudXBkYXRlTGluayhsaW5rKTtcbiAgICB9LFxuXG4gICAgb25EYXRlQ2hhbmdlOiBmdW5jdGlvbiBvbkRhdGVDaGFuZ2UoZXZlbnQsIHZhbHVlKSB7XG4gICAgICAgIHZhciBkYXRlMiA9IERhdGUuVVRDKHZhbHVlLmdldEZ1bGxZZWFyKCksIHZhbHVlLmdldE1vbnRoKCksIHZhbHVlLmdldERhdGUoKSk7XG4gICAgICAgIHRoaXMudXBkYXRlRGF5c0V4cGlyYXRpb25GaWVsZChldmVudCwgTWF0aC5mbG9vcihkYXRlMiAvIDEwMDApICsgXCJcIik7XG4gICAgfSxcblxuICAgIHJlc2V0UGFzc3dvcmQ6IGZ1bmN0aW9uIHJlc2V0UGFzc3dvcmQoKSB7XG4gICAgICAgIHZhciBsaW5rTW9kZWwgPSB0aGlzLnByb3BzLmxpbmtNb2RlbDtcblxuICAgICAgICBsaW5rTW9kZWwuc2V0VXBkYXRlUGFzc3dvcmQoJycpO1xuICAgICAgICBsaW5rTW9kZWwuZ2V0TGluaygpLlBhc3N3b3JkUmVxdWlyZWQgPSBmYWxzZTtcbiAgICAgICAgbGlua01vZGVsLm5vdGlmeURpcnR5KCk7XG4gICAgfSxcblxuICAgIHNldFVwZGF0aW5nUGFzc3dvcmQ6IGZ1bmN0aW9uIHNldFVwZGF0aW5nUGFzc3dvcmQobmV3VmFsdWUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBfcHlkaW9VdGlsUGFzczJbJ2RlZmF1bHQnXS5jaGVja1Bhc3N3b3JkU3RyZW5ndGgobmV3VmFsdWUsIGZ1bmN0aW9uIChvaywgbXNnKSB7XG4gICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IHVwZGF0aW5nUGFzc3dvcmQ6IG5ld1ZhbHVlLCB1cGRhdGluZ1Bhc3N3b3JkVmFsaWQ6IG9rIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY2hhbmdlUGFzc3dvcmQ6IGZ1bmN0aW9uIGNoYW5nZVBhc3N3b3JkKCkge1xuICAgICAgICB2YXIgbGlua01vZGVsID0gdGhpcy5wcm9wcy5saW5rTW9kZWw7XG4gICAgICAgIHZhciB1cGRhdGluZ1Bhc3N3b3JkID0gdGhpcy5zdGF0ZS51cGRhdGluZ1Bhc3N3b3JkO1xuXG4gICAgICAgIGxpbmtNb2RlbC5zZXRVcGRhdGVQYXNzd29yZCh1cGRhdGluZ1Bhc3N3b3JkKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHB3UG9wOiBmYWxzZSwgdXBkYXRpbmdQYXNzd29yZDogXCJcIiwgdXBkYXRpbmdQYXNzd29yZFZhbGlkOiBmYWxzZSB9KTtcbiAgICAgICAgbGlua01vZGVsLm5vdGlmeURpcnR5KCk7XG4gICAgfSxcblxuICAgIHVwZGF0ZVBhc3N3b3JkOiBmdW5jdGlvbiB1cGRhdGVQYXNzd29yZChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgdmFyIGxpbmtNb2RlbCA9IHRoaXMucHJvcHMubGlua01vZGVsO1xuXG4gICAgICAgIHZhciB2YWxpZCA9IHRoaXMucmVmcy5wd2QuaXNWYWxpZCgpO1xuICAgICAgICBpZiAodmFsaWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBpbnZhbGlkUGFzc3dvcmQ6IG51bGwsIGludmFsaWQ6IGZhbHNlIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsaW5rTW9kZWwuc2V0VXBkYXRlUGFzc3dvcmQobmV3VmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgaW52YWxpZFBhc3N3b3JkOiBuZXdWYWx1ZSwgaW52YWxpZDogdHJ1ZSB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZXNldERvd25sb2FkczogZnVuY3Rpb24gcmVzZXREb3dubG9hZHMoKSB7XG4gICAgICAgIGlmICh3aW5kb3cuY29uZmlybSh0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzEwNicpKSkge1xuICAgICAgICAgICAgdmFyIGxpbmtNb2RlbCA9IHRoaXMucHJvcHMubGlua01vZGVsO1xuXG4gICAgICAgICAgICBsaW5rTW9kZWwuZ2V0TGluaygpLkN1cnJlbnREb3dubG9hZHMgPSBcIjBcIjtcbiAgICAgICAgICAgIGxpbmtNb2RlbC5ub3RpZnlEaXJ0eSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHJlc2V0RXhwaXJhdGlvbjogZnVuY3Rpb24gcmVzZXRFeHBpcmF0aW9uKCkge1xuICAgICAgICB2YXIgbGlua01vZGVsID0gdGhpcy5wcm9wcy5saW5rTW9kZWw7XG5cbiAgICAgICAgbGlua01vZGVsLmdldExpbmsoKS5BY2Nlc3NFbmQgPSBcIjBcIjtcbiAgICAgICAgbGlua01vZGVsLm5vdGlmeURpcnR5KCk7XG4gICAgfSxcblxuICAgIHJlbmRlclBhc3N3b3JkQ29udGFpbmVyOiBmdW5jdGlvbiByZW5kZXJQYXNzd29yZENvbnRhaW5lcigpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgdmFyIGxpbmtNb2RlbCA9IHRoaXMucHJvcHMubGlua01vZGVsO1xuXG4gICAgICAgIHZhciBsaW5rID0gbGlua01vZGVsLmdldExpbmsoKTtcbiAgICAgICAgdmFyIHBhc3N3b3JkRmllbGQgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICByZXNldFBhc3N3b3JkID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgdXBkYXRlUGFzc3dvcmQgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChsaW5rLlBhc3N3b3JkUmVxdWlyZWQpIHtcbiAgICAgICAgICAgIHJlc2V0UGFzc3dvcmQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMucHJvcHMuaXNSZWFkb25seSgpIHx8ICFsaW5rTW9kZWwuaXNFZGl0YWJsZSgpLFxuICAgICAgICAgICAgICAgIHNlY29uZGFyeTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBvblRvdWNoVGFwOiB0aGlzLnJlc2V0UGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTc0JylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdXBkYXRlUGFzc3dvcmQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMucHJvcHMuaXNSZWFkb25seSgpIHx8ICFsaW5rTW9kZWwuaXNFZGl0YWJsZSgpLFxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG9uVG91Y2hUYXA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBwd1BvcDogdHJ1ZSwgcHdBbmNob3I6IGUuY3VycmVudFRhcmdldCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTgxJylcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUG9wb3ZlcixcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogdGhpcy5zdGF0ZS5wd1BvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuY2hvckVsOiB0aGlzLnN0YXRlLnB3QW5jaG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiB7IGhvcml6b250YWw6ICdyaWdodCcsIHZlcnRpY2FsOiAnYm90dG9tJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0T3JpZ2luOiB7IGhvcml6b250YWw6ICdyaWdodCcsIHZlcnRpY2FsOiAndG9wJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgb25SZXF1ZXN0Q2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBwd1BvcDogZmFsc2UgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiAyODAsIHBhZGRpbmc6IDggfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoVmFsaWRQYXNzd29yZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwidXBkYXRlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiBcInB3ZFVwZGF0ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHsgbGFiZWw6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMjMnKSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnVwZGF0aW5nUGFzc3dvcmQgPyB0aGlzLnN0YXRlLnVwZGF0aW5nUGFzc3dvcmQgOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0VXBkYXRpbmdQYXNzd29yZCh2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZ1RvcDogMzYsIHRleHRBbGlnbjogJ3JpZ2h0JyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBsYWJlbDogXCJPS1wiLCBvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuY2hhbmdlUGFzc3dvcmQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZGlzYWJsZWQ6ICF0aGlzLnN0YXRlLnVwZGF0aW5nUGFzc3dvcmQgfHwgIXRoaXMuc3RhdGUudXBkYXRpbmdQYXNzd29yZFZhbGlkIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgbGFiZWw6IFwiQ2FuY2VsXCIsIG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHB3UG9wOiBmYWxzZSwgdXBkYXRpbmdQYXNzd29yZDogJycgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBwYXNzd29yZEZpZWxkID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMjMnKSxcbiAgICAgICAgICAgICAgICBkaXNhYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogJyoqKioqKioqJyxcbiAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnByb3BzLmlzUmVhZG9ubHkoKSAmJiBsaW5rTW9kZWwuaXNFZGl0YWJsZSgpKSB7XG4gICAgICAgICAgICBwYXNzd29yZEZpZWxkID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoVmFsaWRQYXNzd29yZCwge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdzaGFyZS1wYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgcmVmOiBcInB3ZFwiLFxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHsgbGFiZWw6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMjMnKSB9LFxuICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLmludmFsaWRQYXNzd29yZCA/IHRoaXMuc3RhdGUuaW52YWxpZFBhc3N3b3JkIDogbGlua01vZGVsLnVwZGF0ZVBhc3N3b3JkLFxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLnVwZGF0ZVBhc3N3b3JkXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFzc3dvcmRGaWVsZCkge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAncGFzc3dvcmQtY29udGFpbmVyJywgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnYmFzZWxpbmUnIH0gfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBjbGFzc05hbWU6ICdtZGkgbWRpLWZpbGUtbG9jaycsIHN0eWxlOiBnbG9iU3R5bGVzLmxlZnRJY29uIH0pLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogcmVzZXRQYXNzd29yZCA/ICc0MCUnIDogJzEwMCUnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIHBhc3N3b3JkRmllbGRcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHJlc2V0UGFzc3dvcmQgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiAnNjAlJywgZGlzcGxheTogJ2ZsZXgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgcmVzZXRQYXNzd29yZCxcbiAgICAgICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVQYXNzd29yZFxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBmb3JtYXREYXRlOiBmdW5jdGlvbiBmb3JtYXREYXRlKGRhdGVPYmplY3QpIHtcbiAgICAgICAgdmFyIGRhdGVGb3JtYXREYXkgPSB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJ2RhdGVfZm9ybWF0JywgJycpLnNwbGl0KCcgJykuc2hpZnQoKTtcbiAgICAgICAgcmV0dXJuIGRhdGVGb3JtYXREYXkucmVwbGFjZSgnWScsIGRhdGVPYmplY3QuZ2V0RnVsbFllYXIoKSkucmVwbGFjZSgnbScsIGRhdGVPYmplY3QuZ2V0TW9udGgoKSArIDEpLnJlcGxhY2UoJ2QnLCBkYXRlT2JqZWN0LmdldERhdGUoKSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgbGlua01vZGVsID0gdGhpcy5wcm9wcy5saW5rTW9kZWw7XG5cbiAgICAgICAgdmFyIGxpbmsgPSBsaW5rTW9kZWwuZ2V0TGluaygpO1xuXG4gICAgICAgIHZhciBwYXNzQ29udGFpbmVyID0gdGhpcy5yZW5kZXJQYXNzd29yZENvbnRhaW5lcigpO1xuICAgICAgICB2YXIgY3J0TGlua0RMQWxsb3dlZCA9IGxpbmtNb2RlbC5oYXNQZXJtaXNzaW9uKCdEb3dubG9hZCcpICYmICFsaW5rTW9kZWwuaGFzUGVybWlzc2lvbignUHJldmlldycpICYmICFsaW5rTW9kZWwuaGFzUGVybWlzc2lvbignVXBsb2FkJyk7XG4gICAgICAgIHZhciBkbExpbWl0VmFsdWUgPSBwYXJzZUludChsaW5rLk1heERvd25sb2Fkcyk7XG4gICAgICAgIHZhciBleHBpcmF0aW9uRGF0ZVZhbHVlID0gcGFyc2VJbnQobGluay5BY2Nlc3NFbmQpO1xuXG4gICAgICAgIHZhciBjYWxJY29uID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRm9udEljb24sIHsgY2xhc3NOYW1lOiAnbWRpIG1kaS1jYWxlbmRhci1jbG9jaycsIHN0eWxlOiBnbG9iU3R5bGVzLmxlZnRJY29uIH0pO1xuICAgICAgICB2YXIgZXhwRGF0ZSA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG1heERhdGUgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICBkbENvdW50ZXJTdHJpbmcgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICBkYXRlRXhwaXJlZCA9IGZhbHNlLFxuICAgICAgICAgICAgZGxFeHBpcmVkID0gZmFsc2U7XG4gICAgICAgIHZhciB0b2RheSA9IG5ldyBEYXRlKCk7XG5cbiAgICAgICAgdmFyIGF1dGggPSBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLmdldEF1dGhvcml6YXRpb25zKHRoaXMucHJvcHMucHlkaW8pO1xuICAgICAgICBpZiAocGFyc2VJbnQoYXV0aC5tYXhfZXhwaXJhdGlvbikgPiAwKSB7XG4gICAgICAgICAgICBtYXhEYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIG1heERhdGUuc2V0RGF0ZSh0b2RheS5nZXREYXRlKCkgKyBwYXJzZUludChhdXRoLm1heF9leHBpcmF0aW9uKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcnNlSW50KGF1dGgubWF4X2Rvd25sb2FkcykgPiAwKSB7XG4gICAgICAgICAgICBkbExpbWl0VmFsdWUgPSBNYXRoLm1pbihkbExpbWl0VmFsdWUsIHBhcnNlSW50KGF1dGgubWF4X2Rvd25sb2FkcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV4cGlyYXRpb25EYXRlVmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChleHBpcmF0aW9uRGF0ZVZhbHVlIDwgMCkge1xuICAgICAgICAgICAgICAgIGRhdGVFeHBpcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV4cERhdGUgPSBuZXcgRGF0ZShleHBpcmF0aW9uRGF0ZVZhbHVlICogMTAwMCk7XG4gICAgICAgICAgICAvL2V4cERhdGUuc2V0RGF0ZSh0b2RheS5nZXREYXRlKCkgKyBwYXJzZUludChleHBpcmF0aW9uRGF0ZVZhbHVlKSk7XG4gICAgICAgICAgICBjYWxJY29uID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBpY29uU3R5bGU6IHsgY29sb3I6IGdsb2JTdHlsZXMubGVmdEljb24uY29sb3IgfSwgc3R5bGU6IHsgbWFyZ2luTGVmdDogLTgsIG1hcmdpblJpZ2h0OiA4IH0sIGljb25DbGFzc05hbWU6ICdtZGkgbWRpLWNsb3NlLWNpcmNsZScsIG9uVG91Y2hUYXA6IHRoaXMucmVzZXRFeHBpcmF0aW9uLmJpbmQodGhpcykgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRsTGltaXRWYWx1ZSkge1xuICAgICAgICAgICAgdmFyIGRsQ291bnRlciA9IHBhcnNlSW50KGxpbmsuQ3VycmVudERvd25sb2FkcykgfHwgMDtcbiAgICAgICAgICAgIHZhciByZXNldExpbmsgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAoZGxDb3VudGVyKSB7XG4gICAgICAgICAgICAgICAgcmVzZXRMaW5rID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdhJyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJyB9LCBvbkNsaWNrOiB0aGlzLnJlc2V0RG93bmxvYWRzLmJpbmQodGhpcyksIHRpdGxlOiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE3JykgfSxcbiAgICAgICAgICAgICAgICAgICAgJygnLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE2JyksXG4gICAgICAgICAgICAgICAgICAgICcpJ1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKGRsQ291bnRlciA+PSBkbExpbWl0VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZGxFeHBpcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkbENvdW50ZXJTdHJpbmcgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdkbENvdW50ZXJTdHJpbmcnIH0sXG4gICAgICAgICAgICAgICAgZGxDb3VudGVyICsgJy8nICsgZGxMaW1pdFZhbHVlLFxuICAgICAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgICAgICByZXNldExpbmtcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7IHBhZGRpbmc6IDEwIH0sIHRoaXMucHJvcHMuc3R5bGUpIH0sXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogNTAwLCBjb2xvcjogJ3JnYmEoMCwwLDAsMC40MyknIH0gfSxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzI0JylcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmdSaWdodDogMTAgfSB9LFxuICAgICAgICAgICAgICAgIHBhc3NDb250YWluZXIsXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZsZXg6IDEsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2Jhc2VsaW5lJywgcG9zaXRpb246ICdyZWxhdGl2ZScgfSwgY2xhc3NOYW1lOiBkYXRlRXhwaXJlZCA/ICdsaW1pdC1ibG9jay1leHBpcmVkJyA6IG51bGwgfSxcbiAgICAgICAgICAgICAgICAgICAgY2FsSWNvbixcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRGF0ZVBpY2tlciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiAnZXhwaXJhdGlvbkRhdGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiAnc3RhcnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGV4cERhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5EYXRlOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4RGF0ZTogbWF4RGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9PazogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLnByb3BzLmlzUmVhZG9ubHkoKSB8fCAhbGlua01vZGVsLmlzRWRpdGFibGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uRGF0ZUNoYW5nZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3dZZWFyU2VsZWN0b3I6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsVGV4dDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKGRhdGVFeHBpcmVkID8gJzIxYicgOiAnMjEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGU6ICdsYW5kc2NhcGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0RGF0ZTogdGhpcy5mb3JtYXREYXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgZmxleDogMSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgYWxpZ25JdGVtczogJ2Jhc2VsaW5lJywgZGlzcGxheTogY3J0TGlua0RMQWxsb3dlZCA/ICdmbGV4JyA6ICdub25lJywgcG9zaXRpb246ICdyZWxhdGl2ZScgfSwgY2xhc3NOYW1lOiBkbEV4cGlyZWQgPyAnbGltaXQtYmxvY2stZXhwaXJlZCcgOiBudWxsIH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogJ21kaSBtZGktZG93bmxvYWQnLCBzdHlsZTogZ2xvYlN0eWxlcy5sZWZ0SWNvbiB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLnByb3BzLmlzUmVhZG9ubHkoKSB8fCAhbGlua01vZGVsLmlzRWRpdGFibGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoZGxFeHBpcmVkID8gJzIyYicgOiAnMjInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBkbExpbWl0VmFsdWUgPiAwID8gZGxMaW1pdFZhbHVlIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy51cGRhdGVETEV4cGlyYXRpb25GaWVsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGZsZXg6IDEgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogNTAwLCBjb2xvcjogJ3JnYmEoMCwwLDAsMC40MyknIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRsQ291bnRlclN0cmluZ1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBQdWJsaWNMaW5rU2VjdXJlT3B0aW9ucyA9ICgwLCBfU2hhcmVDb250ZXh0Q29uc3VtZXIyWydkZWZhdWx0J10pKFB1YmxpY0xpbmtTZWN1cmVPcHRpb25zKTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFB1YmxpY0xpbmtTZWN1cmVPcHRpb25zO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3JlYWN0RG9tID0gcmVxdWlyZSgncmVhY3QtZG9tJyk7XG5cbnZhciBfcmVhY3REb20yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3REb20pO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyID0gcmVxdWlyZSgnLi4vU2hhcmVDb250ZXh0Q29uc3VtZXInKTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TaGFyZUNvbnRleHRDb25zdW1lcik7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfY2xpcGJvYXJkID0gcmVxdWlyZSgnY2xpcGJvYXJkJyk7XG5cbnZhciBfY2xpcGJvYXJkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NsaXBib2FyZCk7XG5cbnZhciBfbGlua3NMaW5rTW9kZWwgPSByZXF1aXJlKCcuLi9saW5rcy9MaW5rTW9kZWwnKTtcblxudmFyIF9saW5rc0xpbmtNb2RlbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9saW5rc0xpbmtNb2RlbCk7XG5cbnZhciBUYXJnZXRlZFVzZXJMaW5rID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFRhcmdldGVkVXNlckxpbmssIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gVGFyZ2V0ZWRVc2VyTGluayhwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVGFyZ2V0ZWRVc2VyTGluayk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoVGFyZ2V0ZWRVc2VyTGluay5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHsgY29weU1lc3NhZ2U6ICcnIH07XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFRhcmdldGVkVXNlckxpbmssIFt7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudERpZE1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2NsaXApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGlwLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLl9idXR0b24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGlwID0gbmV3IF9jbGlwYm9hcmQyWydkZWZhdWx0J10odGhpcy5fYnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IChmdW5jdGlvbiAodHJpZ2dlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMubGluaztcbiAgICAgICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuX2NsaXAub24oJ3N1Y2Nlc3MnLCAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29weU1lc3NhZ2U6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTkyJykgfSwgdGhpcy5jbGVhckNvcHlNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGlwLm9uKCdlcnJvcicsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb3B5TWVzc2FnZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdsb2JhbC5uYXZpZ2F0b3IucGxhdGZvcm0uaW5kZXhPZihcIk1hY1wiKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29weU1lc3NhZ2UgPSB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE0NCcpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29weU1lc3NhZ2UgPSB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJ3NoYXJlX2NlbnRlci4xNDMnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29weU1lc3NhZ2U6IGNvcHlNZXNzYWdlIH0sIHRoaXMuY2xlYXJDb3B5TWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxVbm1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2NsaXApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGlwLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY2xlYXJDb3B5TWVzc2FnZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhckNvcHlNZXNzYWdlKCkge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb3B5TWVzc2FnZTogJycgfSk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpLCA1MDAwKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHRhcmdldFVzZXIgPSBfcHJvcHMudGFyZ2V0VXNlcjtcbiAgICAgICAgICAgIHZhciBsaW5rID0gX3Byb3BzLmxpbms7XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JyB9IH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZsZXg6IDEgfSB9LFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRVc2VyLkRpc3BsYXksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvOiB0aGlzLnByb3BzLnB5ZGlvLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiBmdW5jdGlvbiAocmVmKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuX2J1dHRvbiA9IF9yZWFjdERvbTJbJ2RlZmF1bHQnXS5maW5kRE9NTm9kZShyZWYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU6ICdtZGkgbWRpLWxpbmsnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcDogdGhpcy5zdGF0ZS5jb3B5TWVzc2FnZSB8fCBsaW5rLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvblN0eWxlOiB7IGZvbnRTaXplOiAxMywgbGluZUhlaWdodDogJzE3cHgnIH0sIHN0eWxlOiB7IHdpZHRoOiAzNCwgaGVpZ2h0OiAzNCwgcGFkZGluZzogNiB9XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6IDQwLCB0ZXh0QWxpZ246ICdjZW50ZXInIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0VXNlci5Eb3dubG9hZENvdW50XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBUYXJnZXRlZFVzZXJMaW5rO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbnZhciBUYXJnZXRlZFVzZXJzID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50Mikge1xuICAgIF9pbmhlcml0cyhUYXJnZXRlZFVzZXJzLCBfUmVhY3QkQ29tcG9uZW50Mik7XG5cbiAgICBmdW5jdGlvbiBUYXJnZXRlZFVzZXJzKHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBUYXJnZXRlZFVzZXJzKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihUYXJnZXRlZFVzZXJzLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMsIGNvbnRleHQpO1xuICAgICAgICB0aGlzLnN0YXRlID0geyBvcGVuOiBmYWxzZSB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhUYXJnZXRlZFVzZXJzLCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSB0aGlzLnByb3BzLmxpbmtNb2RlbDtcblxuICAgICAgICAgICAgdmFyIGxpbmsgPSBsaW5rTW9kZWwuZ2V0TGluaygpO1xuICAgICAgICAgICAgdmFyIHRhcmdldFVzZXJzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKGxpbmsuVGFyZ2V0VXNlcnMpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRVc2VycyA9IGxpbmsuVGFyZ2V0VXNlcnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaXRlbXMgPSBPYmplY3Qua2V5cyh0YXJnZXRVc2VycykubWFwKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRpdGxlID0gbGlua01vZGVsLmdldFB1YmxpY1VybCgpICsgJz91PScgKyBrO1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChUYXJnZXRlZFVzZXJMaW5rLCB7IHRhcmdldFVzZXI6IHRhcmdldFVzZXJzW2tdLCBsaW5rOiB0aXRsZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFpdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHJvb3RTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBsaW5lSGVpZ2h0OiAnMzRweCcsXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzRweCAxMHB4IDRweCcsXG4gICAgICAgICAgICAgICAgZm9udFNpemU6IDE0LFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmYWZhZmEnLFxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogMlxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciBoZWFkZXJTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBib3JkZXJCb3R0b206IHRoaXMuc3RhdGUub3BlbiA/ICcxcHggc29saWQgIzc1NzU3NScgOiAnJyxcbiAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoMCwgMCwgMCwgMC4zNiknXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogcm9vdFN0eWxlIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7IGRpc3BsYXk6ICdmbGV4JyB9LCBoZWFkZXJTdHlsZSkgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzI0NScpLnJlcGxhY2UoJyVzJywgaXRlbXMubGVuZ3RoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdtZGkgbWRpLWNoZXZyb24tJyArICh0aGlzLnN0YXRlLm9wZW4gPyAndXAnIDogJ2Rvd24nKSwgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcicgfSwgb25DbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBvcGVuOiAhX3RoaXMyLnN0YXRlLm9wZW4gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLm9wZW4gJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6IDQwLCB0ZXh0QWxpZ246ICdjZW50ZXInIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcjREwnXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUub3BlbiAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBUYXJnZXRlZFVzZXJzO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cblRhcmdldGVkVXNlcnMucHJvcFR5cGVzID0ge1xuICAgIGxpbmtNb2RlbDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKF9saW5rc0xpbmtNb2RlbDJbJ2RlZmF1bHQnXSlcbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFRhcmdldGVkVXNlcnMgPSAoMCwgX1NoYXJlQ29udGV4dENvbnN1bWVyMlsnZGVmYXVsdCddKShUYXJnZXRlZFVzZXJzKTtcblRhcmdldGVkVXNlckxpbmsgPSAoMCwgX1NoYXJlQ29udGV4dENvbnN1bWVyMlsnZGVmYXVsdCddKShUYXJnZXRlZFVzZXJMaW5rKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gVGFyZ2V0ZWRVc2Vycztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkgeyB2YXIgX2FyciA9IFtdOyB2YXIgX24gPSB0cnVlOyB2YXIgX2QgPSBmYWxzZTsgdmFyIF9lID0gdW5kZWZpbmVkOyB0cnkgeyBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7IF9hcnIucHVzaChfcy52YWx1ZSk7IGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhazsgfSB9IGNhdGNoIChlcnIpIHsgX2QgPSB0cnVlOyBfZSA9IGVycjsgfSBmaW5hbGx5IHsgdHJ5IHsgaWYgKCFfbiAmJiBfaVsncmV0dXJuJ10pIF9pWydyZXR1cm4nXSgpOyB9IGZpbmFsbHkgeyBpZiAoX2QpIHRocm93IF9lOyB9IH0gcmV0dXJuIF9hcnI7IH0gcmV0dXJuIGZ1bmN0aW9uIChhcnIsIGkpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyByZXR1cm4gYXJyOyB9IGVsc2UgaWYgKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkgeyByZXR1cm4gc2xpY2VJdGVyYXRvcihhcnIsIGkpOyB9IGVsc2UgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlJyk7IH0gfTsgfSkoKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIgPSByZXF1aXJlKCcuLi9TaGFyZUNvbnRleHRDb25zdW1lcicpO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1NoYXJlQ29udGV4dENvbnN1bWVyKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX3B5ZGlvSHR0cFBvbGljaWVzID0gcmVxdWlyZSgncHlkaW8vaHR0cC9wb2xpY2llcycpO1xuXG52YXIgX3B5ZGlvSHR0cFBvbGljaWVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cFBvbGljaWVzKTtcblxudmFyIF9weWRpb0h0dHBSZXN0QXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9yZXN0LWFwaScpO1xuXG52YXIgX0xpbmtNb2RlbCA9IHJlcXVpcmUoJy4vTGlua01vZGVsJyk7XG5cbnZhciBfTGlua01vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0xpbmtNb2RlbCk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdjb21wb25lbnRzJyk7XG5cbnZhciBSZXNvdXJjZVBvbGljaWVzUGFuZWwgPSBfUHlkaW8kcmVxdWlyZUxpYi5SZXNvdXJjZVBvbGljaWVzUGFuZWw7XG5cbnZhciBWaXNpYmlsaXR5UGFuZWwgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnVmlzaWJpbGl0eVBhbmVsJyxcblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBhc3NvY2lhdGVkIGhpZGRlbiB1c2VycyBwb2xpY2llcywgb3RoZXJ3aXNlXG4gICAgICogdGhlIHB1YmxpYyBsaW5rIHZpc2liaWxpdHkgY2Fubm90IGJlIGNoYW5nZWRcbiAgICAgKiBAcGFyYW0gZGlmZlBvbGljaWVzXG4gICAgICovXG4gICAgb25TYXZlUG9saWNpZXM6IGZ1bmN0aW9uIG9uU2F2ZVBvbGljaWVzKGRpZmZQb2xpY2llcykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgbGlua01vZGVsID0gX3Byb3BzLmxpbmtNb2RlbDtcbiAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuXG4gICAgICAgIHZhciBpbnRlcm5hbFVzZXIgPSBsaW5rTW9kZWwuZ2V0TGluaygpLlVzZXJMb2dpbjtcbiAgICAgICAgX3B5ZGlvSHR0cFBvbGljaWVzMlsnZGVmYXVsdCddLmxvYWRQb2xpY2llcygndXNlcicsIGludGVybmFsVXNlcikudGhlbihmdW5jdGlvbiAocG9saWNpZXMpIHtcbiAgICAgICAgICAgIGlmIChwb2xpY2llcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzb3VyY2VJZCA9IHBvbGljaWVzWzBdLlJlc291cmNlO1xuICAgICAgICAgICAgICAgIHZhciBuZXdQb2xpY2llcyA9IF90aGlzLmRpZmZQb2xpY2llcyhwb2xpY2llcywgZGlmZlBvbGljaWVzLCByZXNvdXJjZUlkKTtcbiAgICAgICAgICAgICAgICBfcHlkaW9IdHRwUG9saWNpZXMyWydkZWZhdWx0J10uc2F2ZVBvbGljaWVzKCd1c2VyJywgaW50ZXJuYWxVc2VyLCBuZXdQb2xpY2llcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBkaWZmUG9saWNpZXM6IGZ1bmN0aW9uIGRpZmZQb2xpY2llcyhwb2xpY2llcywgX2RpZmZQb2xpY2llcywgcmVzb3VyY2VJZCkge1xuICAgICAgICB2YXIgbmV3UG9scyA9IFtdO1xuICAgICAgICBwb2xpY2llcy5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBwLkFjdGlvbiArICcvLy8nICsgcC5TdWJqZWN0O1xuICAgICAgICAgICAgaWYgKCFfZGlmZlBvbGljaWVzLnJlbW92ZVtrZXldKSB7XG4gICAgICAgICAgICAgICAgbmV3UG9scy5wdXNoKHApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmtleXMoX2RpZmZQb2xpY2llcy5hZGQpLm1hcChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgdmFyIG5ld1BvbCA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5TZXJ2aWNlUmVzb3VyY2VQb2xpY3koKTtcblxuICAgICAgICAgICAgdmFyIF9rJHNwbGl0ID0gay5zcGxpdCgnLy8vJyk7XG5cbiAgICAgICAgICAgIHZhciBfayRzcGxpdDIgPSBfc2xpY2VkVG9BcnJheShfayRzcGxpdCwgMik7XG5cbiAgICAgICAgICAgIHZhciBhY3Rpb24gPSBfayRzcGxpdDJbMF07XG4gICAgICAgICAgICB2YXIgc3ViamVjdCA9IF9rJHNwbGl0MlsxXTtcblxuICAgICAgICAgICAgbmV3UG9sLlJlc291cmNlID0gcmVzb3VyY2VJZDtcbiAgICAgICAgICAgIG5ld1BvbC5FZmZlY3QgPSBfcHlkaW9IdHRwUmVzdEFwaS5TZXJ2aWNlUmVzb3VyY2VQb2xpY3lQb2xpY3lFZmZlY3QuY29uc3RydWN0RnJvbU9iamVjdCgnYWxsb3cnKTtcbiAgICAgICAgICAgIG5ld1BvbC5TdWJqZWN0ID0gc3ViamVjdDtcbiAgICAgICAgICAgIG5ld1BvbC5BY3Rpb24gPSBhY3Rpb247XG4gICAgICAgICAgICBuZXdQb2xzLnB1c2gobmV3UG9sKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXdQb2xzO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgbGlua01vZGVsID0gX3Byb3BzMi5saW5rTW9kZWw7XG4gICAgICAgIHZhciBweWRpbyA9IF9wcm9wczIucHlkaW87XG5cbiAgICAgICAgdmFyIHN1YmplY3RzSGlkZGVuID0gW107XG4gICAgICAgIHN1YmplY3RzSGlkZGVuW1widXNlcjpcIiArIGxpbmtNb2RlbC5nZXRMaW5rKCkuVXNlckxvZ2luXSA9IHRydWU7XG4gICAgICAgIHZhciBzdWJqZWN0RGlzYWJsZXMgPSB7IFJFQUQ6IHN1YmplY3RzSGlkZGVuLCBXUklURTogc3ViamVjdHNIaWRkZW4gfTtcbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICB7IHN0eWxlOiB0aGlzLnByb3BzLnN0eWxlLCB0aXRsZTogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcxOTknKSB9LFxuICAgICAgICAgICAgbGlua01vZGVsLmdldExpbmsoKS5VdWlkICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFJlc291cmNlUG9saWNpZXNQYW5lbCwge1xuICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICByZXNvdXJjZVR5cGU6ICd3b3Jrc3BhY2UnLFxuICAgICAgICAgICAgICAgIHJlc291cmNlSWQ6IGxpbmtNb2RlbC5nZXRMaW5rKCkuVXVpZCxcbiAgICAgICAgICAgICAgICBza2lwVGl0bGU6IHRydWUsXG4gICAgICAgICAgICAgICAgb25TYXZlUG9saWNpZXM6IHRoaXMub25TYXZlUG9saWNpZXMuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBzdWJqZWN0c0Rpc2FibGVkOiBzdWJqZWN0RGlzYWJsZXMsXG4gICAgICAgICAgICAgICAgc3ViamVjdHNIaWRkZW46IHN1YmplY3RzSGlkZGVuLFxuICAgICAgICAgICAgICAgIHJlYWRvbmx5OiB0aGlzLnByb3BzLmlzUmVhZG9ubHkoKSB8fCAhbGlua01vZGVsLmlzRWRpdGFibGUoKSxcbiAgICAgICAgICAgICAgICByZWY6ICdwb2xpY2llcydcbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cblZpc2liaWxpdHlQYW5lbC5Qcm9wVHlwZXMgPSB7XG4gICAgcHlkaW86IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuaW5zdGFuY2VPZihfcHlkaW8yWydkZWZhdWx0J10pLmlzUmVxdWlyZWQsXG4gICAgbGlua01vZGVsOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoX0xpbmtNb2RlbDJbJ2RlZmF1bHQnXSkuaXNSZXF1aXJlZFxufTtcblxuVmlzaWJpbGl0eVBhbmVsID0gKDAsIF9TaGFyZUNvbnRleHRDb25zdW1lcjJbJ2RlZmF1bHQnXSkoVmlzaWJpbGl0eVBhbmVsKTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFZpc2liaWxpdHlQYW5lbDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeDIsIF94MywgX3g0KSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94MiwgcHJvcGVydHkgPSBfeDMsIHJlY2VpdmVyID0gX3g0OyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94MiA9IHBhcmVudDsgX3gzID0gcHJvcGVydHk7IF94NCA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX3B5ZGlvSHR0cEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cEFwaSk7XG5cbnZhciBfcHlkaW9Nb2RlbE5vZGUgPSByZXF1aXJlKCdweWRpby9tb2RlbC9ub2RlJyk7XG5cbnZhciBfcHlkaW9Nb2RlbE5vZGUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9Nb2RlbE5vZGUpO1xuXG52YXIgX3B5ZGlvVXRpbFBhdGggPSByZXF1aXJlKCdweWRpby91dGlsL3BhdGgnKTtcblxudmFyIF9weWRpb1V0aWxQYXRoMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvVXRpbFBhdGgpO1xuXG52YXIgX3B5ZGlvSHR0cFJlc3RBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL3Jlc3QtYXBpJyk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdib290Jyk7XG5cbnZhciBBY3Rpb25EaWFsb2dNaXhpbiA9IF9QeWRpbyRyZXF1aXJlTGliLkFjdGlvbkRpYWxvZ01peGluO1xudmFyIExvYWRlciA9IF9QeWRpbyRyZXF1aXJlTGliLkxvYWRlcjtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliMiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdjb21wb25lbnRzJyk7XG5cbnZhciBNb2RhbEFwcEJhciA9IF9QeWRpbyRyZXF1aXJlTGliMi5Nb2RhbEFwcEJhcjtcbnZhciBFbXB0eVN0YXRlVmlldyA9IF9QeWRpbyRyZXF1aXJlTGliMi5FbXB0eVN0YXRlVmlldztcblxudmFyIFNoYXJlVmlldyA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhTaGFyZVZpZXcsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgX2NyZWF0ZUNsYXNzKFNoYXJlVmlldywgW3tcbiAgICAgICAga2V5OiAnZ2V0Q2hpbGRDb250ZXh0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldENoaWxkQ29udGV4dCgpIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlcyA9IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiBtZXNzYWdlcyxcbiAgICAgICAgICAgICAgICBnZXRNZXNzYWdlOiBmdW5jdGlvbiBnZXRNZXNzYWdlKG1lc3NhZ2VJZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmFtZXNwYWNlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gJ3NoYXJlX2NlbnRlcicgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlc1tuYW1lc3BhY2UgKyAobmFtZXNwYWNlID8gXCIuXCIgOiBcIlwiKSArIG1lc3NhZ2VJZF0gfHwgbWVzc2FnZUlkO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZUlkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpc1JlYWRvbmx5OiAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIGZ1bmN0aW9uIFNoYXJlVmlldyhwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2hhcmVWaWV3KTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihTaGFyZVZpZXcucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICByZXNvdXJjZXM6IFtdLFxuICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICBzZWxlY3RlZE1vZGVsOiBudWxsLFxuICAgICAgICAgICAgc2hhcmVUeXBlOiBwcm9wcy5kZWZhdWx0U2hhcmVUeXBlIHx8ICdMSU5LUydcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoU2hhcmVWaWV3LCBbe1xuICAgICAgICBrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdsb2FkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxvYWQoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLlNoYXJlU2VydmljZUFwaShfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgICAgICB2YXIgcmVxdWVzdCA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5SZXN0TGlzdFNoYXJlZFJlc291cmNlc1JlcXVlc3QoKTtcbiAgICAgICAgICAgIHJlcXVlc3QuU2hhcmVUeXBlID0gX3B5ZGlvSHR0cFJlc3RBcGkuTGlzdFNoYXJlZFJlc291cmNlc1JlcXVlc3RMaXN0U2hhcmVUeXBlLmNvbnN0cnVjdEZyb21PYmplY3QodGhpcy5zdGF0ZS5zaGFyZVR5cGUpO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc3ViamVjdCkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QuU3ViamVjdCA9IHRoaXMucHJvcHMuc3ViamVjdDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5Pd25lZEJ5U3ViamVjdCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdHJ1ZSB9KTtcbiAgICAgICAgICAgIGFwaS5saXN0U2hhcmVkUmVzb3VyY2VzKHJlcXVlc3QpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgcmVzb3VyY2VzOiByZXMuUmVzb3VyY2VzIHx8IFtdLCBsb2FkaW5nOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIH0pWydjYXRjaCddKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldExvbmdlc3RQYXRoJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldExvbmdlc3RQYXRoKG5vZGUpIHtcbiAgICAgICAgICAgIGlmICghbm9kZS5BcHBlYXJzSW4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBwYXRoOiBub2RlLlBhdGgsIGJhc2VuYW1lOiBub2RlLlBhdGggfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwYXRocyA9IHt9O1xuICAgICAgICAgICAgbm9kZS5BcHBlYXJzSW4ubWFwKGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICAgICAgcGF0aHNbYS5QYXRoXSA9IGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocGF0aHMpO1xuICAgICAgICAgICAga2V5cy5zb3J0KCk7XG4gICAgICAgICAgICB2YXIgbG9uZ2VzdCA9IGtleXNba2V5cy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIHZhciBsYWJlbCA9IF9weWRpb1V0aWxQYXRoMlsnZGVmYXVsdCddLmdldEJhc2VuYW1lKGxvbmdlc3QpO1xuICAgICAgICAgICAgaWYgKCFsYWJlbCkge1xuICAgICAgICAgICAgICAgIGxhYmVsID0gcGF0aHNbbG9uZ2VzdF0uV3NMYWJlbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IHBhdGg6IGxvbmdlc3QsIGFwcGVhcnNJbjogcGF0aHNbbG9uZ2VzdF0sIGJhc2VuYW1lOiBsYWJlbCB9O1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnb1RvJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdvVG8oYXBwZWFyc0luKSB7XG4gICAgICAgICAgICB2YXIgUGF0aCA9IGFwcGVhcnNJbi5QYXRoO1xuICAgICAgICAgICAgdmFyIFdzTGFiZWwgPSBhcHBlYXJzSW4uV3NMYWJlbDtcbiAgICAgICAgICAgIHZhciBXc1V1aWQgPSBhcHBlYXJzSW4uV3NVdWlkO1xuXG4gICAgICAgICAgICAvLyBSZW1vdmUgZmlyc3Qgc2VnbWVudCAod3Mgc2x1ZylcbiAgICAgICAgICAgIHZhciBwYXRoZXMgPSBQYXRoLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICBwYXRoZXMuc2hpZnQoKTtcbiAgICAgICAgICAgIHZhciBweWRpb05vZGUgPSBuZXcgX3B5ZGlvTW9kZWxOb2RlMlsnZGVmYXVsdCddKHBhdGhlcy5qb2luKCcvJykpO1xuICAgICAgICAgICAgcHlkaW9Ob2RlLmdldE1ldGFkYXRhKCkuc2V0KCdyZXBvc2l0b3J5X2lkJywgV3NVdWlkKTtcbiAgICAgICAgICAgIHB5ZGlvTm9kZS5nZXRNZXRhZGF0YSgpLnNldCgncmVwb3NpdG9yeV9sYWJlbCcsIFdzTGFiZWwpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5weWRpby5nb1RvKHB5ZGlvTm9kZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uUmVxdWVzdENsb3NlKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgbG9hZGluZyA9IF9zdGF0ZS5sb2FkaW5nO1xuICAgICAgICAgICAgdmFyIHJlc291cmNlcyA9IF9zdGF0ZS5yZXNvdXJjZXM7XG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IF9wcm9wcy5zdHlsZTtcblxuICAgICAgICAgICAgdmFyIG0gPSBmdW5jdGlvbiBtKGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHB5ZGlvLk1lc3NhZ2VIYXNoWydzaGFyZV9jZW50ZXIuJyArIGlkXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXNvdXJjZXMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgIHZhciBrQSA9IGEuTm9kZS5QYXRoO1xuICAgICAgICAgICAgICAgIHZhciBrQiA9IGIuTm9kZS5QYXRoO1xuICAgICAgICAgICAgICAgIHJldHVybiBrQSA9PT0ga0IgPyAwIDoga0EgPiBrQiA/IDEgOiAtMTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGV4dGVuc2lvbnMgPSBweWRpby5SZWdpc3RyeS5nZXRGaWxlc0V4dGVuc2lvbnMoKTtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7fSwgc3R5bGUsIHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyB9KSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBiYWNrZ3JvdW5kQ29sb3I6ICcjRjVGNUY1JywgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNFRUVFRUUnLCBwYWRkaW5nOiAnM3B4IDIwcHgnLCBoZWlnaHQ6IDUwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5TZWxlY3RGaWVsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS5zaGFyZVR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlLCBpLCB2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHNoYXJlVHlwZTogdiB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIubG9hZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuZGVybGluZVN0eWxlOiB7IGRpc3BsYXk6ICdub25lJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IHdpZHRoOiAxNjAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHZhbHVlOiBcIkxJTktTXCIsIHByaW1hcnlUZXh0OiBtKDI0MykgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyB2YWx1ZTogXCJDRUxMU1wiLCBwcmltYXJ5VGV4dDogbSgyNTApIH0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGxvYWRpbmcgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoTG9hZGVyLCB7IHN0eWxlOiB7IGhlaWdodDogMzAwLCBmbGV4OiAxIH0gfSksXG4gICAgICAgICAgICAgICAgIWxvYWRpbmcgJiYgcmVzb3VyY2VzLmxlbmd0aCA9PT0gMCAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChFbXB0eVN0YXRlVmlldywge1xuICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1zaGFyZS12YXJpYW50XCIsXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlUZXh0SWQ6IG0oMTMxKSxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgZmxleDogMSwgaGVpZ2h0OiAzMDAsIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyB9XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgIWxvYWRpbmcgJiYgcmVzb3VyY2VzLmxlbmd0aCA+IDAgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLkxpc3QsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgbWluSGVpZ2h0OiAzMDAsIG92ZXJmbG93WTogJ2F1dG8nLCBwYWRkaW5nVG9wOiAwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VzLm1hcChmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgX2dldExvbmdlc3RQYXRoID0gX3RoaXMyLmdldExvbmdlc3RQYXRoKHJlcy5Ob2RlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFwcGVhcnNJbiA9IF9nZXRMb25nZXN0UGF0aC5hcHBlYXJzSW47XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYmFzZW5hbWUgPSBfZ2V0TG9uZ2VzdFBhdGguYmFzZW5hbWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpY29uID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2VuYW1lLmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uID0gJ21kaSBtZGktZm9sZGVyJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGV4dCA9IF9weWRpb1V0aWxQYXRoMlsnZGVmYXVsdCddLmdldEZpbGVFeHRlbnNpb24oYmFzZW5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleHRlbnNpb25zLmhhcyhleHQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfZXh0ZW5zaW9ucyRnZXQgPSBleHRlbnNpb25zLmdldChleHQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb250SWNvbiA9IF9leHRlbnNpb25zJGdldC5mb250SWNvbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uID0gJ21kaSBtZGktJyArIGZvbnRJY29uO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb24gPSAnbWRpIG1kaS1maWxlJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTGlzdEl0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5VGV4dDogYmFzZW5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5VGV4dDogcmVzLkxpbmsgPyBtKDI1MSkgKyAnOiAnICsgcmVzLkxpbmsuRGVzY3JpcHRpb24gOiBtKDI4NCkucmVwbGFjZSgnJXMnLCByZXMuQ2VsbHMubGVuZ3RoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVhcnNJbiA/IF90aGlzMi5nb1RvKGFwcGVhcnNJbikgOiBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6ICFhcHBlYXJzSW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdEljb246IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogaWNvbiB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBTaGFyZVZpZXc7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuU2hhcmVWaWV3LmNoaWxkQ29udGV4dFR5cGVzID0ge1xuICAgIG1lc3NhZ2VzOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm9iamVjdCxcbiAgICBnZXRNZXNzYWdlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMsXG4gICAgaXNSZWFkb25seTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jXG59O1xuXG52YXIgU2hhcmVWaWV3TW9kYWwgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnU2hhcmVWaWV3TW9kYWwnLFxuXG4gICAgbWl4aW5zOiBbQWN0aW9uRGlhbG9nTWl4aW5dLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaWFsb2dUaXRsZTogJycsXG4gICAgICAgICAgICBkaWFsb2dTaXplOiAnbGcnLFxuICAgICAgICAgICAgZGlhbG9nUGFkZGluZzogZmFsc2UsXG4gICAgICAgICAgICBkaWFsb2dJc01vZGFsOiBmYWxzZSxcbiAgICAgICAgICAgIGRpYWxvZ1Njcm9sbEJvZHk6IGZhbHNlXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIHN1Ym1pdDogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICB0aGlzLmRpc21pc3MoKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogJzEwMCUnLCBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nIH0gfSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE1vZGFsQXBwQmFyLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci45OCddLFxuICAgICAgICAgICAgICAgIHNob3dNZW51SWNvbkJ1dHRvbjogZmFsc2UsXG4gICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZVJpZ2h0OiAnbWRpIG1kaS1jbG9zZScsXG4gICAgICAgICAgICAgICAgb25SaWdodEljb25CdXR0b25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczMuZGlzbWlzcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoU2hhcmVWaWV3LCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcywgeyBzdHlsZTogeyB3aWR0aDogJzEwMCUnLCBmbGV4OiAxIH0sIG9uUmVxdWVzdENsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMy5kaXNtaXNzKCk7XG4gICAgICAgICAgICAgICAgfSB9KSlcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG5leHBvcnRzLlNoYXJlVmlldyA9IFNoYXJlVmlldztcbmV4cG9ydHMuU2hhcmVWaWV3TW9kYWwgPSBTaGFyZVZpZXdNb2RhbDtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIgPSByZXF1aXJlKCcuLi9TaGFyZUNvbnRleHRDb25zdW1lcicpO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1NoYXJlQ29udGV4dENvbnN1bWVyKTtcblxudmFyIF9yZXF1aXJlID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIENvbXBvbmVudCA9IF9yZXF1aXJlLkNvbXBvbmVudDtcbnZhciBQcm9wVHlwZXMgPSBfcmVxdWlyZS5Qcm9wVHlwZXM7XG5cbnZhciBfcmVxdWlyZTIgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgSWNvbkJ1dHRvbiA9IF9yZXF1aXJlMi5JY29uQnV0dG9uO1xuXG52YXIgX3JlcXVpcmUzID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWkvc3R5bGVzJyk7XG5cbnZhciBtdWlUaGVtZWFibGUgPSBfcmVxdWlyZTMubXVpVGhlbWVhYmxlO1xuXG52YXIgQWN0aW9uQnV0dG9uID0gKGZ1bmN0aW9uIChfQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKEFjdGlvbkJ1dHRvbiwgX0NvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBBY3Rpb25CdXR0b24oKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBBY3Rpb25CdXR0b24pO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEFjdGlvbkJ1dHRvbi5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhBY3Rpb25CdXR0b24sIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgcGFsZXR0ZSA9IHRoaXMucHJvcHMubXVpVGhlbWUucGFsZXR0ZTtcblxuICAgICAgICAgICAgdmFyIHN0eWxlID0ge1xuICAgICAgICAgICAgICAgIHJvb3Q6IHtcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNTAlJyxcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICcgKyBwYWxldHRlLnByaW1hcnkxQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDM2LCBoZWlnaHQ6IDM2LFxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiA4LFxuICAgICAgICAgICAgICAgICAgICBtYXJnaW46ICcwIDZweCcsXG4gICAgICAgICAgICAgICAgICAgIHpJbmRleDogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaWNvbjoge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogcGFsZXR0ZS5wcmltYXJ5MUNvbG9yLFxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMjAsXG4gICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6ICcyMHB4J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KEljb25CdXR0b24sIHtcbiAgICAgICAgICAgICAgICBzdHlsZTogc3R5bGUucm9vdCxcbiAgICAgICAgICAgICAgICBpY29uU3R5bGU6IHN0eWxlLmljb24sXG4gICAgICAgICAgICAgICAgb25Ub3VjaFRhcDogdGhpcy5wcm9wcy5jYWxsYmFjayB8fCB0aGlzLnByb3BzLm9uVG91Y2hUYXAsXG4gICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZTogXCJtZGkgbWRpLVwiICsgdGhpcy5wcm9wcy5tZGlJY29uLFxuICAgICAgICAgICAgICAgIHRvb2x0aXA6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSh0aGlzLnByb3BzLm1lc3NhZ2VJZCwgdGhpcy5wcm9wcy5tZXNzYWdlQ29yZU5hbWVzcGFjZSA/ICcnIDogdW5kZWZpbmVkKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQWN0aW9uQnV0dG9uO1xufSkoQ29tcG9uZW50KTtcblxuQWN0aW9uQnV0dG9uLnByb3BUeXBlcyA9IHtcbiAgICBjYWxsYmFjazogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25Ub3VjaFRhcDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgbWRpSWNvbjogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBtZXNzYWdlSWQ6IFByb3BUeXBlcy5zdHJpbmdcbn07XG5cbkFjdGlvbkJ1dHRvbiA9ICgwLCBfU2hhcmVDb250ZXh0Q29uc3VtZXIyWydkZWZhdWx0J10pKEFjdGlvbkJ1dHRvbik7XG5BY3Rpb25CdXR0b24gPSBtdWlUaGVtZWFibGUoKShBY3Rpb25CdXR0b24pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBBY3Rpb25CdXR0b247XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfbWF0ZXJpYWxVaVN0eWxlcyA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpL3N0eWxlcycpO1xuXG52YXIgZ2xvYmFsU3R5bGVzID0ge1xuICAgIGdsb2JhbExlZnRNYXJnaW46IDY0XG59O1xuXG52YXIgR2VuZXJpY0xpbmUgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoR2VuZXJpY0xpbmUsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gR2VuZXJpY0xpbmUoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBHZW5lcmljTGluZSk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoR2VuZXJpY0xpbmUucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoR2VuZXJpY0xpbmUsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBpY29uQ2xhc3NOYW1lID0gX3Byb3BzLmljb25DbGFzc05hbWU7XG4gICAgICAgICAgICB2YXIgbGVnZW5kID0gX3Byb3BzLmxlZ2VuZDtcbiAgICAgICAgICAgIHZhciBkYXRhID0gX3Byb3BzLmRhdGE7XG4gICAgICAgICAgICB2YXIgZGF0YVN0eWxlID0gX3Byb3BzLmRhdGFTdHlsZTtcbiAgICAgICAgICAgIHZhciBsZWdlbmRTdHlsZSA9IF9wcm9wcy5sZWdlbmRTdHlsZTtcbiAgICAgICAgICAgIHZhciBpY29uU3R5bGUgPSBfcHJvcHMuaWNvblN0eWxlO1xuXG4gICAgICAgICAgICB2YXIgc3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgaWNvbjogX2V4dGVuZHMoe1xuICAgICAgICAgICAgICAgICAgICBtYXJnaW46ICcxNnB4IDIwcHggMCdcbiAgICAgICAgICAgICAgICB9LCBpY29uU3R5bGUpLFxuICAgICAgICAgICAgICAgIGxlZ2VuZDogX2V4dGVuZHMoe1xuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnI2FhYWFhYScsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IDUwMCxcbiAgICAgICAgICAgICAgICAgICAgdGV4dFRyYW5zZm9ybTogJ2xvd2VyY2FzZSdcbiAgICAgICAgICAgICAgICB9LCBsZWdlbmRTdHlsZSksXG4gICAgICAgICAgICAgICAgZGF0YTogX2V4dGVuZHMoe1xuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTUsXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmdSaWdodDogNixcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcydcbiAgICAgICAgICAgICAgICB9LCBkYXRhU3R5bGUpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHsgZGlzcGxheTogJ2ZsZXgnLCBtYXJnaW5Cb3R0b206IDgsIG92ZXJmbG93OiAnaGlkZGVuJyB9LCB0aGlzLnByb3BzLnN0eWxlKSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogZ2xvYmFsU3R5bGVzLmdsb2JhbExlZnRNYXJnaW4gfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBjb2xvcjogJyNhYWFhYWEnLCBjbGFzc05hbWU6IGljb25DbGFzc05hbWUsIHN0eWxlOiBzdHlsZS5pY29uIH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBzdHlsZS5sZWdlbmQgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZ2VuZFxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogc3R5bGUuZGF0YSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBHZW5lcmljTGluZTtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG52YXIgR2VuZXJpY0NhcmQgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQyKSB7XG4gICAgX2luaGVyaXRzKEdlbmVyaWNDYXJkLCBfUmVhY3QkQ29tcG9uZW50Mik7XG5cbiAgICBmdW5jdGlvbiBHZW5lcmljQ2FyZCgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEdlbmVyaWNDYXJkKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihHZW5lcmljQ2FyZC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhHZW5lcmljQ2FyZCwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciB0aXRsZSA9IF9wcm9wczIudGl0bGU7XG4gICAgICAgICAgICB2YXIgb25EaXNtaXNzQWN0aW9uID0gX3Byb3BzMi5vbkRpc21pc3NBY3Rpb247XG4gICAgICAgICAgICB2YXIgb25FZGl0QWN0aW9uID0gX3Byb3BzMi5vbkVkaXRBY3Rpb247XG4gICAgICAgICAgICB2YXIgb25EZWxldGVBY3Rpb24gPSBfcHJvcHMyLm9uRGVsZXRlQWN0aW9uO1xuICAgICAgICAgICAgdmFyIG1vcmVNZW51SXRlbXMgPSBfcHJvcHMyLm1vcmVNZW51SXRlbXM7XG4gICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSBfcHJvcHMyLmNoaWxkcmVuO1xuICAgICAgICAgICAgdmFyIG11aVRoZW1lID0gX3Byb3BzMi5tdWlUaGVtZTtcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IF9wcm9wczIuc3R5bGU7XG4gICAgICAgICAgICB2YXIgaGVhZGVyU21hbGwgPSBfcHJvcHMyLmhlYWRlclNtYWxsO1xuICAgICAgICAgICAgdmFyIHByaW1hcnkxQ29sb3IgPSBtdWlUaGVtZS5wYWxldHRlLnByaW1hcnkxQ29sb3I7XG5cbiAgICAgICAgICAgIHZhciBzdHlsZXMgPSB7XG4gICAgICAgICAgICAgICAgaGVhZGVySGVpZ2h0OiAxMDAsXG4gICAgICAgICAgICAgICAgYnV0dG9uQmFySGVpZ2h0OiA2MCxcbiAgICAgICAgICAgICAgICBmYWJUb3A6IDgwLFxuICAgICAgICAgICAgICAgIGJ1dHRvbjoge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZToge30sXG4gICAgICAgICAgICAgICAgICAgIGljb25TdHlsZTogeyBjb2xvcjogJ3doaXRlJyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChoZWFkZXJTbWFsbCkge1xuICAgICAgICAgICAgICAgIHN0eWxlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVySGVpZ2h0OiA4MCxcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uQmFySGVpZ2h0OiA0MCxcbiAgICAgICAgICAgICAgICAgICAgZmFiVG9wOiA2MCxcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyB3aWR0aDogMzgsIGhlaWdodDogMzgsIHBhZGRpbmc6IDkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25TdHlsZTogeyBjb2xvcjogJ3doaXRlJywgZm9udFNpemU6IDE4IH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5QYXBlcixcbiAgICAgICAgICAgICAgICB7IHpEZXB0aDogMCwgc3R5bGU6IF9leHRlbmRzKHsgd2lkdGg6ICcxMDAlJywgcG9zaXRpb246ICdyZWxhdGl2ZScgfSwgc3R5bGUpIH0sXG4gICAgICAgICAgICAgICAgb25FZGl0QWN0aW9uICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5GbG9hdGluZ0FjdGlvbkJ1dHRvbixcbiAgICAgICAgICAgICAgICAgICAgeyBvblRvdWNoVGFwOiBvbkVkaXRBY3Rpb24sIG1pbmk6IHRydWUsIHN0eWxlOiB7IHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6IHN0eWxlcy5mYWJUb3AsIGxlZnQ6IDEwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRm9udEljb24sIHsgY2xhc3NOYW1lOiBcIm1kaSBtZGktcGVuY2lsXCIgfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5QYXBlcixcbiAgICAgICAgICAgICAgICAgICAgeyB6RGVwdGg6IDAsIHN0eWxlOiB7IGJhY2tncm91bmRDb2xvcjogcHJpbWFyeTFDb2xvciwgY29sb3I6ICd3aGl0ZScsIGhlaWdodDogc3R5bGVzLmhlYWRlckhlaWdodCwgYm9yZGVyUmFkaXVzOiAnMnB4IDJweCAwIDAnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBoZWlnaHQ6IHN0eWxlcy5idXR0b25CYXJIZWlnaHQgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IHN0eWxlOiB7IGZsZXg6IDEgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRGVsZXRlQWN0aW9uICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgc3R5bGU6IHN0eWxlcy5idXR0b24uc3R5bGUsIGljb25TdHlsZTogc3R5bGVzLmJ1dHRvbi5pY29uU3R5bGUsIGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1kZWxldGVcIiwgb25Ub3VjaFRhcDogb25EZWxldGVBY3Rpb24gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtb3JlTWVudUl0ZW1zICYmIG1vcmVNZW51SXRlbXMubGVuZ3RoID4gMCAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5JY29uTWVudSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuY2hvck9yaWdpbjogeyB2ZXJ0aWNhbDogJ3RvcCcsIGhvcml6b250YWw6IGhlYWRlclNtYWxsID8gJ3JpZ2h0JyA6ICdsZWZ0JyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRPcmlnaW46IHsgdmVydGljYWw6ICd0b3AnLCBob3Jpem9udGFsOiBoZWFkZXJTbWFsbCA/ICdyaWdodCcgOiAnbGVmdCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkJ1dHRvbkVsZW1lbnQ6IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgc3R5bGU6IHN0eWxlcy5idXR0b24uc3R5bGUsIGljb25TdHlsZTogc3R5bGVzLmJ1dHRvbi5pY29uU3R5bGUsIGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1kb3RzLXZlcnRpY2FsXCIgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vcmVNZW51SXRlbXNcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkRpc21pc3NBY3Rpb24gJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBzdHlsZTogc3R5bGVzLmJ1dHRvbi5zdHlsZSwgaWNvblN0eWxlOiBzdHlsZXMuYnV0dG9uLmljb25TdHlsZSwgaWNvbkNsYXNzTmFtZTogXCJtZGkgbWRpLWNsb3NlXCIsIG9uVG91Y2hUYXA6IG9uRGlzbWlzc0FjdGlvbiB9KVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nTGVmdDogb25FZGl0QWN0aW9uID8gZ2xvYmFsU3R5bGVzLmdsb2JhbExlZnRNYXJnaW4gOiAyMCwgZm9udFNpemU6IDIwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nVG9wOiAxMiwgcGFkZGluZ0JvdHRvbTogOCB9IH0sXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBHZW5lcmljQ2FyZDtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5leHBvcnRzLkdlbmVyaWNDYXJkID0gR2VuZXJpY0NhcmQgPSAoMCwgX21hdGVyaWFsVWlTdHlsZXMubXVpVGhlbWVhYmxlKSgpKEdlbmVyaWNDYXJkKTtcbmV4cG9ydHMuR2VuZXJpY0NhcmQgPSBHZW5lcmljQ2FyZDtcbmV4cG9ydHMuR2VuZXJpY0xpbmUgPSBHZW5lcmljTGluZTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfbWF0ZXJpYWxVaVN0eWxlcyA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpL3N0eWxlcycpO1xuXG52YXIgRWRpdG9yVGFiID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKEVkaXRvclRhYiwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBFZGl0b3JUYWIoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBFZGl0b3JUYWIpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEVkaXRvclRhYi5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhFZGl0b3JUYWIsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciB0YWJzID0gX3Byb3BzLnRhYnM7XG4gICAgICAgICAgICB2YXIgYWN0aXZlID0gX3Byb3BzLmFjdGl2ZTtcbiAgICAgICAgICAgIHZhciBvbkNoYW5nZSA9IF9wcm9wcy5vbkNoYW5nZTtcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IF9wcm9wcy5zdHlsZTtcbiAgICAgICAgICAgIHZhciBtdWlUaGVtZSA9IF9wcm9wcy5tdWlUaGVtZTtcbiAgICAgICAgICAgIHZhciBwcmltYXJ5MUNvbG9yID0gbXVpVGhlbWUucGFsZXR0ZS5wcmltYXJ5MUNvbG9yO1xuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogX2V4dGVuZHMoeyBkaXNwbGF5OiAnZmxleCcgfSwgc3R5bGUpIH0sXG4gICAgICAgICAgICAgICAgdGFicy5tYXAoZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlzQWN0aXZlID0gdC5WYWx1ZSA9PT0gYWN0aXZlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBsYWJlbDogdC5MYWJlbCwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlKHQuVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgcHJpbWFyeTogaXNBY3RpdmUsIHN0eWxlOiBpc0FjdGl2ZSA/IHsgYm9yZGVyQm90dG9tOiAnMnB4IHNvbGlkICcgKyBwcmltYXJ5MUNvbG9yIH0gOiB7IGJvcmRlckJvdHRvbTogMCB9IH0pO1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gRWRpdG9yVGFiO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbkVkaXRvclRhYiA9ICgwLCBfbWF0ZXJpYWxVaVN0eWxlcy5tdWlUaGVtZWFibGUpKCkoRWRpdG9yVGFiKTtcblxudmFyIEVkaXRvclRhYkNvbnRlbnQgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQyKSB7XG4gICAgX2luaGVyaXRzKEVkaXRvclRhYkNvbnRlbnQsIF9SZWFjdCRDb21wb25lbnQyKTtcblxuICAgIGZ1bmN0aW9uIEVkaXRvclRhYkNvbnRlbnQoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBFZGl0b3JUYWJDb250ZW50KTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihFZGl0b3JUYWJDb250ZW50LnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEVkaXRvclRhYkNvbnRlbnQsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgdGFicyA9IF9wcm9wczIudGFicztcbiAgICAgICAgICAgIHZhciBhY3RpdmUgPSBfcHJvcHMyLmFjdGl2ZTtcblxuICAgICAgICAgICAgdmFyIGFjdGl2ZUNvbnRlbnQgPSBudWxsO1xuICAgICAgICAgICAgdGFicy5tYXAoZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgICAgICBpZiAodC5WYWx1ZSA9PT0gYWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZUNvbnRlbnQgPSB0LkNvbXBvbmVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBhY3RpdmVDb250ZW50O1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEVkaXRvclRhYkNvbnRlbnQ7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxudmFyIEdlbmVyaWNFZGl0b3IgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQzKSB7XG4gICAgX2luaGVyaXRzKEdlbmVyaWNFZGl0b3IsIF9SZWFjdCRDb21wb25lbnQzKTtcblxuICAgIGZ1bmN0aW9uIEdlbmVyaWNFZGl0b3IocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEdlbmVyaWNFZGl0b3IpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEdlbmVyaWNFZGl0b3IucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBsZWZ0OiBwcm9wcy50YWJzLmxlZnQubGVuZ3RoID8gcHJvcHMudGFicy5sZWZ0WzBdLlZhbHVlIDogJycsXG4gICAgICAgICAgICByaWdodDogcHJvcHMudGFicy5yaWdodC5sZW5ndGggPyBwcm9wcy50YWJzLnJpZ2h0WzBdLlZhbHVlIDogJydcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoR2VuZXJpY0VkaXRvciwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKHByb3BzKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUubGVmdCAmJiBwcm9wcy50YWJzLmxlZnQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxlZnQ6IHByb3BzLnRhYnMubGVmdFswXS5WYWx1ZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5yaWdodCAmJiBwcm9wcy50YWJzLnJpZ2h0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyByaWdodDogcHJvcHMudGFicy5yaWdodFswXS5WYWx1ZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfcHJvcHMzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciB0YWJzID0gX3Byb3BzMy50YWJzO1xuICAgICAgICAgICAgdmFyIGhlYWRlciA9IF9wcm9wczMuaGVhZGVyO1xuICAgICAgICAgICAgdmFyIG9uU2F2ZUFjdGlvbiA9IF9wcm9wczMub25TYXZlQWN0aW9uO1xuICAgICAgICAgICAgdmFyIG9uQ2xvc2VBY3Rpb24gPSBfcHJvcHMzLm9uQ2xvc2VBY3Rpb247XG4gICAgICAgICAgICB2YXIgb25SZXZlcnRBY3Rpb24gPSBfcHJvcHMzLm9uUmV2ZXJ0QWN0aW9uO1xuICAgICAgICAgICAgdmFyIHNhdmVFbmFibGVkID0gX3Byb3BzMy5zYXZlRW5hYmxlZDtcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IF9wcm9wczMuc3R5bGU7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMzLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgbGVmdCA9IF9zdGF0ZS5sZWZ0O1xuICAgICAgICAgICAgdmFyIHJpZ2h0ID0gX3N0YXRlLnJpZ2h0O1xuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogX2V4dGVuZHMoeyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBoZWlnaHQ6ICcxMDAlJyB9LCBzdHlsZSkgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBwYWRkaW5nOiAnMTBweCAyMHB4IDIwcHgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgcGFkZGluZ1JpZ2h0OiAyMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZ1RvcDogMTAgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuUmFpc2VkQnV0dG9uLCB7IGRpc2FibGVkOiAhc2F2ZUVuYWJsZWQsIHByaW1hcnk6IHRydWUsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnNTMnXSwgb25Ub3VjaFRhcDogb25TYXZlQWN0aW9uIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBkaXNhYmxlZDogIXNhdmVFbmFibGVkLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbJzYyOCddLCBvblRvdWNoVGFwOiBvblJldmVydEFjdGlvbiwgc3R5bGU6IHsgbWFyZ2luTGVmdDogMTAgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgaWNvbkNsYXNzTmFtZTogXCJtZGkgbWRpLWNsb3NlXCIsIHRvb2x0aXA6IHB5ZGlvLk1lc3NhZ2VIYXNoWyc4NiddLCBvblRvdWNoVGFwOiBvbkNsb3NlQWN0aW9uLCBzdHlsZTogeyBtYXJnaW5MZWZ0OiAxMCB9IH0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChFZGl0b3JUYWIsIHsgdGFiczogdGFicy5sZWZ0LCBhY3RpdmU6IGxlZnQsIHN0eWxlOiB7IGZsZXg6IDEgfSwgb25DaGFuZ2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgbGVmdDogdmFsdWUgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IH0pLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChFZGl0b3JUYWIsIHsgdGFiczogdGFicy5yaWdodCwgYWN0aXZlOiByaWdodCwgc3R5bGU6IHsgZmxleDogMSB9LCBvbkNoYW5nZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyByaWdodDogdmFsdWUgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5EaXZpZGVyLCBudWxsKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4OiAxIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHsgb3ZlcmZsb3dZOiAnYXV0bycsIHdpZHRoOiAnNTAlJywgYm9yZGVyUmlnaHQ6ICcxcHggc29saWQgI2UwZTBlMCcsIGhlaWdodDogJzEwMCUnLCBwYWRkaW5nOiAxMCB9LCB0YWJzLmxlZnRTdHlsZSkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEVkaXRvclRhYkNvbnRlbnQsIHsgdGFiczogdGFicy5sZWZ0LCBhY3RpdmU6IGxlZnQgfSlcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHsgb3ZlcmZsb3dZOiAnYXV0bycsIHdpZHRoOiAnNTAlJywgaGVpZ2h0OiAnMTAwJScsIHBhZGRpbmc6IDEwIH0sIHRhYnMucmlnaHRTdHlsZSkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEVkaXRvclRhYkNvbnRlbnQsIHsgdGFiczogdGFicy5yaWdodCwgYWN0aXZlOiByaWdodCB9KVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBHZW5lcmljRWRpdG9yO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEdlbmVyaWNFZGl0b3I7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9jb21wb3NpdGVDb21wb3NpdGVDYXJkID0gcmVxdWlyZSgnLi4vY29tcG9zaXRlL0NvbXBvc2l0ZUNhcmQnKTtcblxudmFyIF9jb21wb3NpdGVDb21wb3NpdGVDYXJkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbXBvc2l0ZUNvbXBvc2l0ZUNhcmQpO1xuXG52YXIgX2NlbGxzQ2VsbENhcmQgPSByZXF1aXJlKCcuLi9jZWxscy9DZWxsQ2FyZCcpO1xuXG52YXIgX2NlbGxzQ2VsbENhcmQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY2VsbHNDZWxsQ2FyZCk7XG5cbnZhciBJbmZvUGFuZWwgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoSW5mb1BhbmVsLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIEluZm9QYW5lbChwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgSW5mb1BhbmVsKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihJbmZvUGFuZWwucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7IHBvcG92ZXJPcGVuOiBmYWxzZSB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhJbmZvUGFuZWwsIFt7XG4gICAgICAgIGtleTogJ29wZW5Qb3BvdmVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9wZW5Qb3BvdmVyKGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcG9wb3Zlck9wZW46IHRydWUsIHBvcG92ZXJBbmNob3I6IGV2ZW50LnRhcmdldCB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIG5vZGUgPSBfcHJvcHMubm9kZTtcblxuICAgICAgICAgICAgaWYgKG5vZGUuaXNSb290KCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIFB5ZGlvV29ya3NwYWNlcy5JbmZvUGFuZWxDYXJkLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9jZWxsc0NlbGxDYXJkMlsnZGVmYXVsdCddLCB7IGNlbGxJZDogcHlkaW8udXNlci5hY3RpdmVSZXBvc2l0b3J5LCBweWRpbzogcHlkaW8sIG1vZGU6ICdpbmZvUGFuZWwnIH0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIFB5ZGlvV29ya3NwYWNlcy5JbmZvUGFuZWxDYXJkLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9jb21wb3NpdGVDb21wb3NpdGVDYXJkMlsnZGVmYXVsdCddLCB7IG5vZGU6IG5vZGUsIHB5ZGlvOiBweWRpbywgbW9kZTogJ2luZm9QYW5lbCcgfSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gSW5mb1BhbmVsO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEluZm9QYW5lbDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgX3B5ZGlvVXRpbFhtbCA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwveG1sJyk7XG5cbnZhciBfcHlkaW9VdGlsWG1sMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvVXRpbFhtbCk7XG5cbnZhciBfcHlkaW9IdHRwQXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9weWRpb0h0dHBBcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwQXBpKTtcblxudmFyIF9weWRpb0h0dHBSZXN0QXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9yZXN0LWFwaScpO1xuXG52YXIgU2hhcmVIZWxwZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNoYXJlSGVscGVyKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2hhcmVIZWxwZXIpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhTaGFyZUhlbHBlciwgbnVsbCwgW3tcbiAgICAgICAga2V5OiAnZ2V0QXV0aG9yaXphdGlvbnMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0QXV0aG9yaXphdGlvbnMocHlkaW8pIHtcblxuICAgICAgICAgICAgdmFyIHBsdWdpbkNvbmZpZ3MgPSBweWRpby5nZXRQbHVnaW5Db25maWdzKFwiYWN0aW9uLnNoYXJlXCIpO1xuICAgICAgICAgICAgdmFyIGF1dGhvcml6YXRpb25zID0ge1xuICAgICAgICAgICAgICAgIGZvbGRlcl9wdWJsaWNfbGluazogcGx1Z2luQ29uZmlncy5nZXQoXCJFTkFCTEVfRk9MREVSX1BVQkxJQ19MSU5LXCIpLFxuICAgICAgICAgICAgICAgIGZvbGRlcl93b3Jrc3BhY2VzOiBwbHVnaW5Db25maWdzLmdldChcIkVOQUJMRV9GT0xERVJfSU5URVJOQUxfU0hBUklOR1wiKSxcbiAgICAgICAgICAgICAgICBmaWxlX3B1YmxpY19saW5rOiBwbHVnaW5Db25maWdzLmdldChcIkVOQUJMRV9GSUxFX1BVQkxJQ19MSU5LXCIpLFxuICAgICAgICAgICAgICAgIGZpbGVfd29ya3NwYWNlczogcGx1Z2luQ29uZmlncy5nZXQoXCJFTkFCTEVfRklMRV9JTlRFUk5BTF9TSEFSSU5HXCIpLFxuICAgICAgICAgICAgICAgIGVkaXRhYmxlX2hhc2g6IHBsdWdpbkNvbmZpZ3MuZ2V0KFwiSEFTSF9VU0VSX0VESVRBQkxFXCIpLFxuICAgICAgICAgICAgICAgIGhhc2hfbWluX2xlbmd0aDogcGx1Z2luQ29uZmlncy5nZXQoXCJIQVNIX01JTl9MRU5HVEhcIikgfHwgNixcbiAgICAgICAgICAgICAgICBwYXNzd29yZF9tYW5kYXRvcnk6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG1heF9leHBpcmF0aW9uOiBwbHVnaW5Db25maWdzLmdldChcIkZJTEVfTUFYX0VYUElSQVRJT05cIiksXG4gICAgICAgICAgICAgICAgbWF4X2Rvd25sb2FkczogcGx1Z2luQ29uZmlncy5nZXQoXCJGSUxFX01BWF9ET1dOTE9BRFwiKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciBwYXNzTWFuZGF0b3J5ID0gcGx1Z2luQ29uZmlncy5nZXQoXCJTSEFSRV9GT1JDRV9QQVNTV09SRFwiKTtcbiAgICAgICAgICAgIGlmIChwYXNzTWFuZGF0b3J5KSB7XG4gICAgICAgICAgICAgICAgYXV0aG9yaXphdGlvbnMucGFzc3dvcmRfbWFuZGF0b3J5ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF1dGhvcml6YXRpb25zLnBhc3N3b3JkX3BsYWNlaG9sZGVyID0gcGFzc01hbmRhdG9yeSA/IHB5ZGlvLk1lc3NhZ2VIYXNoWydzaGFyZV9jZW50ZXIuMTc2J10gOiBweWRpby5NZXNzYWdlSGFzaFsnc2hhcmVfY2VudGVyLjE0OCddO1xuICAgICAgICAgICAgcmV0dXJuIGF1dGhvcml6YXRpb25zO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdidWlsZFB1YmxpY1VybCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBidWlsZFB1YmxpY1VybChweWRpbywgbGlua0hhc2gpIHtcbiAgICAgICAgICAgIHZhciBzaG9ydEZvcm0gPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1syXTtcblxuICAgICAgICAgICAgdmFyIHBsdWdpbkNvbmZpZ3MgPSBweWRpby5QYXJhbWV0ZXJzO1xuICAgICAgICAgICAgaWYgKHNob3J0Rm9ybSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnLi4uJyArIHBsdWdpbkNvbmZpZ3MuZ2V0KCdQVUJMSUNfQkFTRVVSSScpICsgJy8nICsgbGlua0hhc2g7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBwbHVnaW5Db25maWdzLmdldCgnRlJPTlRFTkRfVVJMJykgKyBwbHVnaW5Db25maWdzLmdldCgnUFVCTElDX0JBU0VVUkknKSArICcvJyArIGxpbmtIYXNoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSBweWRpbyB7UHlkaW99XG4gICAgICAgICAqIEBwYXJhbSBub2RlIHtBanhwTm9kZX1cbiAgICAgICAgICogQHJldHVybiB7e3ByZXZpZXc6IGJvb2xlYW4sIHdyaXRlYWJsZTogYm9vbGVhbn19XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbm9kZUhhc0VkaXRvcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBub2RlSGFzRWRpdG9yKHB5ZGlvLCBub2RlKSB7XG4gICAgICAgICAgICBpZiAoIW5vZGUuZ2V0TWV0YWRhdGEoKS5oYXMoJ21pbWVfaGFzX3ByZXZpZXdfZWRpdG9yJykpIHtcbiAgICAgICAgICAgICAgICB2YXIgZWRpdG9ycyA9IHB5ZGlvLlJlZ2lzdHJ5LmZpbmRFZGl0b3JzRm9yTWltZShub2RlLmdldEFqeHBNaW1lKCkpO1xuICAgICAgICAgICAgICAgIGVkaXRvcnMgPSBlZGl0b3JzLmZpbHRlcihmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZS5pZCAhPT0gJ2VkaXRvci5icm93c2VyJyAmJiBlLmlkICE9PSAnZWRpdG9yLm90aGVyJztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB2YXIgd3JpdGVhYmxlID0gZWRpdG9ycy5maWx0ZXIoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGUuY2FuV3JpdGU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbm9kZS5nZXRNZXRhZGF0YSgpLnNldChcIm1pbWVfaGFzX3ByZXZpZXdfZWRpdG9yXCIsIGVkaXRvcnMubGVuZ3RoID4gMCk7XG4gICAgICAgICAgICAgICAgbm9kZS5nZXRNZXRhZGF0YSgpLnNldChcIm1pbWVfaGFzX3dyaXRlYWJsZV9lZGl0b3JcIiwgd3JpdGVhYmxlLmxlbmd0aCA+IDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwcmV2aWV3OiBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KFwibWltZV9oYXNfcHJldmlld19lZGl0b3JcIiksXG4gICAgICAgICAgICAgICAgd3JpdGVhYmxlOiBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KFwibWltZV9oYXNfd3JpdGVhYmxlX2VkaXRvclwiKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gcHlkaW8ge1B5ZGlvfVxuICAgICAgICAgKiBAcGFyYW0gbGlua01vZGVsIHtDb21wb3NpdGVNb2RlbH1cbiAgICAgICAgICogQHJldHVybiB7Kn1cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21waWxlTGF5b3V0RGF0YScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21waWxlTGF5b3V0RGF0YShweWRpbywgbGlua01vZGVsKSB7XG5cbiAgICAgICAgICAgIC8vIFNlYXJjaCByZWdpc3RyeSBmb3IgdGVtcGxhdGUgbm9kZXMgc3RhcnRpbmcgd2l0aCBtaW5pc2l0ZV9cbiAgICAgICAgICAgIHZhciB0bXBsID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRFeHQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IGxpbmtNb2RlbC5nZXROb2RlKCk7XG4gICAgICAgICAgICBpZiAobm9kZS5pc0xlYWYoKSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRFeHQgPSBub2RlLmdldEFqeHBNaW1lKCk7XG4gICAgICAgICAgICAgICAgdG1wbCA9IF9weWRpb1V0aWxYbWwyWydkZWZhdWx0J10uWFBhdGhTZWxlY3ROb2RlcyhweWRpby5nZXRYbWxSZWdpc3RyeSgpLCBcIi8vdGVtcGxhdGVbY29udGFpbnMoQG5hbWUsICd1bmlxdWVfcHJldmlld18nKV1cIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRtcGwgPSBfcHlkaW9VdGlsWG1sMlsnZGVmYXVsdCddLlhQYXRoU2VsZWN0Tm9kZXMocHlkaW8uZ2V0WG1sUmVnaXN0cnkoKSwgXCIvL3RlbXBsYXRlW2NvbnRhaW5zKEBuYW1lLCAnbWluaXNpdGVfJyldXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXRtcGwubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRtcGwubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFt7IExBWU9VVF9OQU1FOiB0bXBsWzBdLmdldEF0dHJpYnV0ZSgnZWxlbWVudCcpLCBMQVlPVVRfTEFCRUw6ICcnIH1dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGNydFRoZW1lID0gcHlkaW8uUGFyYW1ldGVycy5nZXQoJ3RoZW1lJyk7XG4gICAgICAgICAgICB2YXIgdmFsdWVzID0gW107XG4gICAgICAgICAgICB0bXBsLm1hcChmdW5jdGlvbiAoeG1sTm9kZSkge1xuICAgICAgICAgICAgICAgIHZhciB0aGVtZSA9IHhtbE5vZGUuZ2V0QXR0cmlidXRlKCd0aGVtZScpO1xuICAgICAgICAgICAgICAgIGlmICh0aGVtZSAmJiB0aGVtZSAhPT0gY3J0VGhlbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudCA9IHhtbE5vZGUuZ2V0QXR0cmlidXRlKCdlbGVtZW50Jyk7XG4gICAgICAgICAgICAgICAgdmFyIG5hbWUgPSB4bWxOb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpO1xuICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IHhtbE5vZGUuZ2V0QXR0cmlidXRlKCdsYWJlbCcpO1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50RXh0ICYmIG5hbWUgPT09IFwidW5pcXVlX3ByZXZpZXdfZmlsZVwiICYmICFTaGFyZUhlbHBlci5ub2RlSGFzRWRpdG9yKHB5ZGlvLCBub2RlKS5wcmV2aWV3KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElnbm9yZSB0aGlzIHRlbXBsYXRlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChNZXNzYWdlSGFzaFtsYWJlbF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gTWVzc2FnZUhhc2hbbGFiZWxdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSB4bWxOb2RlLmdldEF0dHJpYnV0ZSgnbmFtZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YWx1ZXNbbmFtZV0gPSBlbGVtZW50O1xuICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoKHsgTEFZT1VUX05BTUU6IG5hbWUsIExBWU9VVF9FTEVNRU5UOiBlbGVtZW50LCBMQVlPVVRfTEFCRUw6IGxhYmVsIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdmb3JjZU1haWxlck9sZFNjaG9vbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JjZU1haWxlck9sZFNjaG9vbCgpIHtcbiAgICAgICAgICAgIHJldHVybiBnbG9iYWwucHlkaW8uZ2V0UGx1Z2luQ29uZmlncyhcImFjdGlvbi5zaGFyZVwiKS5nZXQoXCJFTUFJTF9JTlZJVEVfRVhURVJOQUxcIik7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3FyY29kZUVuYWJsZWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcXJjb2RlRW5hYmxlZCgpIHtcbiAgICAgICAgICAgIHJldHVybiBnbG9iYWwucHlkaW8uZ2V0UGx1Z2luQ29uZmlncyhcImFjdGlvbi5zaGFyZVwiKS5nZXQoXCJDUkVBVEVfUVJDT0RFXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBub2RlXG4gICAgICAgICAqIEBwYXJhbSBjZWxsTW9kZWxcbiAgICAgICAgICogQHBhcmFtIHRhcmdldFVzZXJzXG4gICAgICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3NlbmRDZWxsSW52aXRhdGlvbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZW5kQ2VsbEludml0YXRpb24obm9kZSwgY2VsbE1vZGVsLCB0YXJnZXRVc2Vycykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzLmxlbmd0aCA8PSAzIHx8IGFyZ3VtZW50c1szXSA9PT0gdW5kZWZpbmVkID8gZnVuY3Rpb24gKCkge30gOiBhcmd1bWVudHNbM107XG5cbiAgICAgICAgICAgIHZhciBfU2hhcmVIZWxwZXIkcHJlcGFyZUVtYWlsID0gU2hhcmVIZWxwZXIucHJlcGFyZUVtYWlsKG5vZGUsIG51bGwsIGNlbGxNb2RlbCk7XG5cbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZUlkID0gX1NoYXJlSGVscGVyJHByZXBhcmVFbWFpbC50ZW1wbGF0ZUlkO1xuICAgICAgICAgICAgdmFyIHRlbXBsYXRlRGF0YSA9IF9TaGFyZUhlbHBlciRwcmVwYXJlRW1haWwudGVtcGxhdGVEYXRhO1xuXG4gICAgICAgICAgICB2YXIgbWFpbCA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5NYWlsZXJNYWlsKCk7XG4gICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLk1haWxlclNlcnZpY2VBcGkoX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCkpO1xuICAgICAgICAgICAgbWFpbC5UbyA9IE9iamVjdC5rZXlzKHRhcmdldFVzZXJzKS5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICB2YXIgdSA9IHRhcmdldFVzZXJzW2tdO1xuICAgICAgICAgICAgICAgIHZhciB0byA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5NYWlsZXJVc2VyKCk7XG4gICAgICAgICAgICAgICAgaWYgKHUuSWRtVXNlcikge1xuICAgICAgICAgICAgICAgICAgICB0by5VdWlkID0gdS5JZG1Vc2VyLkxvZ2luO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRvLlV1aWQgPSB1LmlkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdG87XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG1haWwuVGVtcGxhdGVJZCA9IHRlbXBsYXRlSWQ7XG4gICAgICAgICAgICBtYWlsLlRlbXBsYXRlRGF0YSA9IHRlbXBsYXRlRGF0YTtcbiAgICAgICAgICAgIGFwaS5zZW5kKG1haWwpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gbm9kZSB7Tm9kZX1cbiAgICAgICAgICogQHBhcmFtIGxpbmtNb2RlbCB7TGlua01vZGVsfVxuICAgICAgICAgKiBAcGFyYW0gY2VsbE1vZGVsIHtDZWxsTW9kZWx9XG4gICAgICAgICAqIEByZXR1cm4ge3t0ZW1wbGF0ZUlkOiBzdHJpbmcsIHRlbXBsYXRlRGF0YToge30sIG1lc3NhZ2U6IHN0cmluZywgbGlua01vZGVsOiAqfX1cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdwcmVwYXJlRW1haWwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcHJlcGFyZUVtYWlsKG5vZGUpIHtcbiAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzFdO1xuICAgICAgICAgICAgdmFyIGNlbGxNb2RlbCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbMl07XG5cbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZURhdGEgPSB7fTtcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZUlkID0gXCJcIjtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gXCJcIjtcbiAgICAgICAgICAgIHZhciB1c2VyID0gcHlkaW8udXNlcjtcbiAgICAgICAgICAgIGlmICh1c2VyLmdldFByZWZlcmVuY2UoXCJkaXNwbGF5TmFtZVwiKSkge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlRGF0YVtcIkludml0ZXJcIl0gPSB1c2VyLmdldFByZWZlcmVuY2UoXCJkaXNwbGF5TmFtZVwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVEYXRhW1wiSW52aXRlclwiXSA9IHVzZXIuaWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGlua01vZGVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxpbmtPYmplY3QgPSBsaW5rTW9kZWwuZ2V0TGluaygpO1xuICAgICAgICAgICAgICAgIGlmIChub2RlLmlzTGVhZigpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlSWQgPSBcIlB1YmxpY0ZpbGVcIjtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVEYXRhW1wiRmlsZU5hbWVcIl0gPSBub2RlLmdldExhYmVsKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVJZCA9IFwiUHVibGljRm9sZGVyXCI7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlRGF0YVtcIkZvbGRlck5hbWVcIl0gPSBub2RlLmdldExhYmVsKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRlbXBsYXRlRGF0YVtcIkxpbmtQYXRoXCJdID0gXCIvcHVibGljL1wiICsgbGlua09iamVjdC5MaW5rSGFzaDtcbiAgICAgICAgICAgICAgICBpZiAobGlua09iamVjdC5NYXhEb3dubG9hZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVEYXRhW1wiTWF4RG93bmxvYWRzXCJdID0gbGlua09iamVjdC5NYXhEb3dubG9hZHMgKyBcIlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobGlua09iamVjdC5BY2Nlc3NFbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVEYXRhW1wiRXhwaXJlXCJdID0gbGlua09iamVjdC5BY2Nlc3NFbmQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZUlkID0gXCJDZWxsXCI7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVEYXRhW1wiQ2VsbFwiXSA9IGNlbGxNb2RlbC5nZXRMYWJlbCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlSWQ6IHRlbXBsYXRlSWQsIHRlbXBsYXRlRGF0YTogdGVtcGxhdGVEYXRhLCBtZXNzYWdlOiBtZXNzYWdlLCBsaW5rTW9kZWw6IGxpbmtNb2RlbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBTaGFyZUhlbHBlcjtcbn0pKCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFNoYXJlSGVscGVyO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iXX0=
