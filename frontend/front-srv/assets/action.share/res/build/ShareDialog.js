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
            var editorOneColumn = _props2.editorOneColumn;
            var _state = this.state;
            var edit = _state.edit;
            var model = _state.model;

            var m = function m(id) {
                return pydio.MessageHash['share_center.' + id];
            };

            var rootStyle = { width: 350, minHeight: 270 };
            var content = undefined;

            if (edit) {
                if (editorOneColumn) {
                    rootStyle = { width: 350, height: 500 };
                } else {
                    rootStyle = { width: 700, height: 500 };
                }
                content = _react2['default'].createElement(_EditCellDialog2['default'], _extends({}, this.props, { model: model, sendInvitations: this.usersInvitations.bind(this), editorOneColumn: editorOneColumn }));
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

},{"../main/GenericCard":27,"../main/ShareHelper":30,"./EditCellDialog":4,"material-ui":"material-ui","pydio/model/cell":"pydio/model/cell","react":"react"}],3:[function(require,module,exports){
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _SharedUsers = require('./SharedUsers');

var _SharedUsers2 = _interopRequireDefault(_SharedUsers);

var _NodesPicker = require('./NodesPicker');

var _NodesPicker2 = _interopRequireDefault(_NodesPicker);

var _pydioModelCell = require('pydio/model/cell');

var _pydioModelCell2 = _interopRequireDefault(_pydioModelCell);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

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
        return { step: 'users', model: new _pydioModelCell2['default'](), saving: false };
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

        this.setState({ saving: true });
        model.save().then(function (result) {
            _this2.props.onDismiss();
            _this2.setState({ saving: false });
        })['catch'](function (reason) {
            pydio.UI.displayMessage('ERROR', reason.message);
            _this2.setState({ saving: false });
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
        var pydio = this.props.pydio;
        var _state = this.state;
        var step = _state.step;
        var model = _state.model;
        var saving = _state.saving;

        var dialogLabel = pydio.MessageHash['418'];
        if (step !== 'users') {
            dialogLabel = model.getLabel();
        }

        if (step === 'users') {

            content = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    null,
                    this.m(275)
                ),
                _react2['default'].createElement(ModernTextField, { ref: "title", floatingLabelText: this.m(276), value: model.getLabel(), onChange: function (e, v) {
                        model.setLabel(v);
                    }, fullWidth: true }),
                _react2['default'].createElement(ModernTextField, { floatingLabelText: this.m(277), value: model.getDescription(), onChange: function (e, v) {
                        model.setDescription(v);
                    }, fullWidth: true })
            );

            if (model.getLabel()) {
                buttons.push(_react2['default'].createElement(_materialUi.FlatButton, {
                    key: 'quick',
                    primary: true,
                    disabled: !model.getLabel() || saving,
                    label: this.m('cells.create.advanced'), // Advanced
                    onTouchTap: function () {
                        _this3.setState({ step: 'data' });
                    } }));
                buttons.push(_react2['default'].createElement(
                    'span',
                    { style: { display: 'inline-block', margin: '0  10px', fontSize: 14, fontWeight: 500, color: '#9E9E9E' } },
                    this.m('cells.create.buttons.separator')
                ));
            }

            buttons.push(_react2['default'].createElement(_materialUi.RaisedButton, {
                key: 'next1',
                disabled: !model.getLabel() || saving,
                primary: true,
                label: this.m(279), // Create Cell
                onTouchTap: function () {
                    _this3.submit();
                } }));
        } else if (step === 'data') {

            content = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'h5',
                    { style: { marginTop: -10 } },
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
                    'h5',
                    { style: { marginTop: -10 } },
                    this.m('cells.create.title.fill.folders')
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { color: '#9e9e9e' } },
                    this.computeSummaryString()
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { paddingTop: 16 } },
                    _react2['default'].createElement(_NodesPicker2['default'], { pydio: pydio, model: model })
                )
            );

            buttons.push(_react2['default'].createElement(_materialUi.FlatButton, { key: 'prev2', primary: false, label: pydio.MessageHash['304'], onTouchTap: function () {
                    _this3.setState({ step: 'data' });
                } }));
            buttons.push(_react2['default'].createElement(_materialUi.RaisedButton, { key: 'submit', disabled: saving, primary: true, label: this.m(279), onTouchTap: this.submit.bind(this) }));
        }

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
                    dialogLabel
                )
            ),
            _react2['default'].createElement(
                'div',
                { style: { padding: '20px 20px 10px', flex: 1 } },
                content
            ),
            _react2['default'].createElement(
                'div',
                { style: { padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' } },
                buttons
            )
        );
    }

});

exports['default'] = CreateCellDialog = (0, _materialUiStyles.muiThemeable)()(CreateCellDialog);
exports['default'] = CreateCellDialog;
module.exports = exports['default'];

},{"./NodesPicker":5,"./SharedUsers":7,"material-ui":"material-ui","material-ui/styles":"material-ui/styles","pydio":"pydio","pydio/model/cell":"pydio/model/cell","react":"react"}],4:[function(require,module,exports){
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

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var ResourcePoliciesPanel = _Pydio$requireLib.ResourcePoliciesPanel;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib2.ModernTextField;

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
            React.createElement(ModernTextField, { floatingLabelText: m(267), value: model.getLabel(), onChange: function (e, v) {
                    model.setLabel(v);
                }, fullWidth: true }),
            React.createElement(ModernTextField, { floatingLabelText: m(268), value: model.getDescription(), onChange: function (e, v) {
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
                AlwaysLast: true,
                Component: React.createElement(ResourcePoliciesPanel, {
                    pydio: pydio,
                    resourceType: 'cell',
                    description: m('cell.visibility.advanced'),
                    resourceId: model.getUuid(),
                    style: { margin: -10 },
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
            editorOneColumn: this.props.editorOneColumn,
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

},{"../main/GenericEditor":28,"./NodesPicker":5,"./SharedUsers":7,"pydio":"pydio","react":"react"}],5:[function(require,module,exports){
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
            root.load(dm.getAjxpNodeProvider());
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
            root.load(dm.getAjxpNodeProvider());
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
            var _state = this.state;
            var node = _state.node;
            var crtWs = _state.crtWs;

            this.props.model.addRootNode(node, crtWs.getId());
            this.handleRequestClose();
        }
    }, {
        key: 'onNodeSelected',
        value: function onNodeSelected(node) {
            var dataModel = this.state.dataModel;

            node.load(dataModel.getAjxpNodeProvider());
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
            var nodes = model.getRootNodes() || [];
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
                    //emptyStateString = <span style={{color:'rgba(0,0,0,.54)', fontStyle:'italic'}}>{m(281)}</span>;
                }
            }
            var pickButton = undefined;
            if (mode === 'edit') {
                pickButton = _react2['default'].createElement(_materialUi.FlatButton, {
                    label: m(282),
                    onTouchTap: this.handleTouchTap.bind(this),
                    primary: true,
                    style: { marginBottom: 10 },
                    icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-folder-plus" })
                });
            } else {
                pickButton = _react2['default'].createElement(_materialUi.RaisedButton, {
                    label: m(282),
                    onTouchTap: this.handleTouchTap.bind(this),
                    primary: false,
                    style: { marginBottom: 10 },
                    icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-folder-plus", style: { fontSize: 20, marginTop: -4 } })
                });
            }
            var _state2 = this.state;
            var node = _state2.node;
            var availableWs = _state2.availableWs;
            var crtWs = _state2.crtWs;

            return _react2['default'].createElement(
                'div',
                null,
                pickButton,
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

        var authConfigs = pydio.getPluginConfigs('core.auth');
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
            actionLinks.push(_react2['default'].createElement(_mainActionButton2['default'], { key: 'clear', callback: this.clearAllUsers, tooltipPosition: "top-center", mdiIcon: 'delete', messageId: '180' }));
        }
        if (aclsLength && this.props.sendInvitations) {
            actionLinks.push(_react2['default'].createElement(_mainActionButton2['default'], { key: 'invite', callback: this.sendInvitationToAllUsers, tooltipPosition: "top-center", mdiIcon: 'email-outline', messageId: '45' }));
        }
        if (this.props.saveSelectionAsTeam && aclsLength > 1 && !this.props.isReadonly() && !this.props.readonly) {
            actionLinks.push(_react2['default'].createElement(_mainActionButton2['default'], { key: 'team', callback: this.props.saveSelectionAsTeam, mdiIcon: 'account-multiple-plus', tooltipPosition: "top-center", messageId: '509', messageCoreNamespace: true }));
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
                excludes: excludes,
                existingOnly: !authConfigs.get('USER_CREATE_USERS')
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

},{"../ShareContextConsumer":1,"../main/ActionButton":26,"./SharedUserEntry":6,"pydio":"pydio","react":"react"}],8:[function(require,module,exports){
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
                { style: this.props.style },
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

},{"../cells/SharedUsers":7,"../main/ShareHelper":30,"./CompositeModel":12,"material-ui":"material-ui","material-ui/styles":"material-ui/styles","pydio":"pydio","react":"react"}],10:[function(require,module,exports){
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

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

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var PaletteModifier = _Pydio$requireLib.PaletteModifier;

var _Pydio$requireLib2 = _pydio2['default'].requireLib("boot");

var Tooltip = _Pydio$requireLib2.Tooltip;

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
            var editorOneColumn = _props2.editorOneColumn;
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
                    Component: _react2['default'].createElement(_CellsList2['default'], { pydio: pydio, compositeModel: model, usersInvitations: this.usersInvitations.bind(this), style: editorOneColumn ? { padding: 10 } : {} })
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
                            showMailer: _mainShareHelper2['default'].mailerSupported(pydio) ? this.linkInvitation.bind(this) : null
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
                        if (links[0].isEditable()) {
                            tabs.left.push({
                                Label: m(253),
                                Value: 'link-visibility',
                                Component: _react2['default'].createElement(_linksVisibilityPanel2['default'], { pydio: pydio, linkModel: links[0] }),
                                AlwaysLast: true
                            });
                        }
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
                    editorOneColumn: editorOneColumn,
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
                    if (links.length) {
                        var ln = links[0];
                        if (ln.hasError()) {
                            var err = ln.hasError();
                            lines.push(_react2['default'].createElement(_mainGenericCard.GenericLine, { iconClassName: "mdi mdi-alert-outline", legend: "Error", data: err.Detail || err.Msg || err }));
                        } else if (ln.getLink()) {
                            var publicLink = _mainShareHelper2['default'].buildPublicUrl(pydio, ln.getLink().LinkHash, mode === 'infoPanel');
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

},{"../composite/CompositeModel":12,"../links/LabelPanel":17,"../links/Panel":19,"../links/PublicLinkTemplate":21,"../links/SecureOptions":22,"../links/VisibilityPanel":24,"../main/GenericCard":27,"../main/GenericEditor":28,"../main/ShareHelper":30,"./CellsList":9,"./Mailer":13,"clipboard":"clipboard","material-ui":"material-ui","pydio":"pydio","react":"react"}],11:[function(require,module,exports){
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
            editorOneColumn: this.props.editorOneColumn,
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
            if (this.skipUpdateUnderlyingNode) {
                return;
            }
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
        key: 'loadUniqueLink',
        value: function loadUniqueLink(linkUuid, node) {
            var _this6 = this;

            this.node = node;
            var linkModel = new _linksLinkModel2['default']();
            linkModel.observe("update", function () {
                _this6.notify("update");
            });
            linkModel.load(linkUuid);
            this.links.push(linkModel);
            return linkModel;
        }
    }, {
        key: 'save',
        value: function save() {
            var _this7 = this;

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
                var nodeId = _this7.node.getMetadata().get('uuid');
                _this7.cells = _this7.cells.filter(function (r) {
                    return r.hasRootNode(nodeId);
                });
                _this7.updateUnderlyingNode();
            })['catch'](function (e) {
                _this7.updateUnderlyingNode();
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
            var _this8 = this;

            if (this.node) {
                var _ret = (function () {
                    var nodeId = _this8.node.getMetadata().get('uuid');
                    return {
                        v: _this8.cells.filter(function (r) {
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

},{"../links/LinkModel":18,"../main/ShareHelper":30,"pydio":"pydio","pydio/http/rest-api":"pydio/http/rest-api","pydio/lang/observable":"pydio/lang/observable","pydio/model/cell":"pydio/model/cell"}],13:[function(require,module,exports){
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

},{"../main/ShareHelper":30,"material-ui":"material-ui","pydio/http/resources-manager":"pydio/http/resources-manager","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],14:[function(require,module,exports){
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

var _linksPublicLinkTemplate = require('../links/PublicLinkTemplate');

var _linksPublicLinkTemplate2 = _interopRequireDefault(_linksPublicLinkTemplate);

var _linksVisibilityPanel = require('../links/VisibilityPanel');

var _linksVisibilityPanel2 = _interopRequireDefault(_linksVisibilityPanel);

var _linksLabelPanel = require('../links/LabelPanel');

var _linksLabelPanel2 = _interopRequireDefault(_linksLabelPanel);

var _materialUi = require('material-ui');

var _require$requireLib = require('pydio').requireLib('hoc');

var PaletteModifier = _require$requireLib.PaletteModifier;

var SimpleLinkCard = (function (_React$Component) {
    _inherits(SimpleLinkCard, _React$Component);

    function SimpleLinkCard(props) {
        _classCallCheck(this, SimpleLinkCard);

        props.editorOneColumn = true;
        _get(Object.getPrototypeOf(SimpleLinkCard.prototype), 'constructor', this).call(this, props);
        var model = new _compositeCompositeModel2['default'](true);
        model.skipUpdateUnderlyingNode = true;
        this.state = {
            mode: this.props.mode || 'view',
            model: model
        };
    }

    _createClass(SimpleLinkCard, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;

            var _props = this.props;
            var node = _props.node;
            var linkUuid = _props.linkUuid;
            var onRemoveLink = _props.onRemoveLink;
            var model = this.state.model;

            model.observe("update", function () {
                _this.forceUpdate();
            });
            var linkModel = model.loadUniqueLink(linkUuid, node);
            linkModel.observeOnce("delete", function () {
                if (onRemoveLink) onRemoveLink();
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.state.model.stopObserving("update");
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(props) {
            if (props.LinkUuid && props.LinkUuid !== this.props.LinkUuid) {
                this.state.model.loadUniqueLink(props.LinkUuid, props.node);
            }
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
            var model = this.state.model;

            try {
                var publicLinkModel = undefined;
                if (model.getLinks().length) {
                    publicLinkModel = model.getLinks()[0];
                    publicLinkModel.save();
                }
            } catch (e) {
                this.props.pydio.UI.displayMessage('ERROR', e.message);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var node = _props2.node;
            var pydio = _props2.pydio;
            var editorOneColumn = _props2.editorOneColumn;
            var _state = this.state;
            var model = _state.model;
            var mailerData = _state.mailerData;

            var m = function m(id) {
                return pydio.MessageHash['share_center.' + id];
            };

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
            var links = model.getLinks();
            if (publicLinkModel) {
                tabs.left.push({
                    Label: m(251),
                    Value: 'public-link',
                    Component: _react2['default'].createElement(_linksPanel2['default'], {
                        pydio: pydio,
                        compositeModel: model,
                        linkModel: links[0],
                        showMailer: _mainShareHelper2['default'].mailerSupported(pydio) ? this.linkInvitation.bind(this) : null
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
                        Component: _react2['default'].createElement(_linksVisibilityPanel2['default'], { pydio: pydio, linkModel: links[0] }),
                        AlwaysLast: true
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
                editorOneColumn: editorOneColumn,
                style: { width: '100%', height: null, flex: 1, minHeight: 550, color: 'rgba(0,0,0,.83)', fontSize: 13 }
            });
        }
    }]);

    return SimpleLinkCard;
})(_react2['default'].Component);

exports['default'] = SimpleLinkCard = PaletteModifier({ primary1Color: '#009688' })(SimpleLinkCard);
exports['default'] = SimpleLinkCard;
module.exports = exports['default'];

},{"../composite/CompositeModel":12,"../links/LabelPanel":17,"../links/Panel":19,"../links/PublicLinkTemplate":21,"../links/SecureOptions":22,"../links/VisibilityPanel":24,"../main/GenericEditor":28,"../main/ShareHelper":30,"./Mailer":13,"material-ui":"material-ui","pydio":"pydio","react":"react"}],15:[function(require,module,exports){
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

var _compositeSimpleLinkCard = require('./composite/SimpleLinkCard');

var _compositeSimpleLinkCard2 = _interopRequireDefault(_compositeSimpleLinkCard);

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
exports.SimpleLinkCard = _compositeSimpleLinkCard2['default'];

},{"./cells/CellCard":2,"./cells/CreateCellDialog":3,"./cells/EditCellDialog":4,"./composite/CompositeDialog":11,"./composite/SimpleLinkCard":14,"./links/LinkModel":18,"./lists/ShareView":25,"./main/InfoPanel":29,"./main/ShareHelper":30}],16:[function(require,module,exports){
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
                        style: { height: 40 },
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

},{"../ShareContextConsumer":1,"../main/ActionButton":26,"../main/ShareHelper":30,"./LinkModel":18,"./TargetedUsers":23,"clipboard":"clipboard","material-ui":"material-ui","material-ui/styles":"material-ui/styles","pydio":"pydio","pydio/util/lang":"pydio/util/lang","pydio/util/path":"pydio/util/path","qrcode.react":"qrcode.react","react":"react"}],17:[function(require,module,exports){
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

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

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
                _react2['default'].createElement(ModernTextField, { floatingLabelText: m(265), value: link.Label, onChange: updateLabel, fullWidth: true }),
                _react2['default'].createElement(ModernTextField, { floatingLabelText: m(266), value: link.Description, onChange: updateDescription, fullWidth: true })
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

},{"./LinkModel":18,"pydio":"pydio","react":"react"}],18:[function(require,module,exports){
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
        this.loadError = null;
    }

    _createClass(LinkModel, [{
        key: 'hasError',
        value: function hasError() {
            return this.loadError;
        }
    }, {
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
            })['catch'](function (err) {
                _this.loadError = err;
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
            })['catch'](function (err) {
                var msg = err.Detail || err.message || err;
                Pydio.getInstance().UI.displayMessage('ERROR', msg);
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
                _this5.notify('delete');
            })['catch'](function (err) {
                var msg = err.Detail || err.message || err;
                pydio.UI.displayMessage('ERROR', msg);
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

},{"../main/ShareHelper":30,"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","pydio/lang/observable":"pydio/lang/observable","pydio/util/pass":"pydio/util/pass"}],19:[function(require,module,exports){
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

},{"../ShareContextConsumer":1,"../composite/CompositeModel":12,"../main/ShareHelper":30,"./Field":16,"./LinkModel":18,"./Permissions":20,"./TargetedUsers":23,"material-ui":"material-ui","pydio":"pydio","react":"react"}],20:[function(require,module,exports){
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

},{"../ShareContextConsumer":1,"../main/ShareHelper":30,"./LinkModel":18,"material-ui":"material-ui","pydio":"pydio","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],21:[function(require,module,exports){
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

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var _materialUi = require('material-ui');

var _LinkModel = require('./LinkModel');

var _LinkModel2 = _interopRequireDefault(_LinkModel);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernSelectField = _Pydio$requireLib.ModernSelectField;

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
                    'div',
                    { style: { fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.43)' } },
                    this.props.getMessage('151')
                ),
                _react2['default'].createElement(
                    ModernSelectField,
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

},{"../ShareContextConsumer":1,"./LinkModel":18,"material-ui":"material-ui","pydio":"pydio","react":"react"}],22:[function(require,module,exports){
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

var _pydioUtilPass = require('pydio/util/pass');

var _pydioUtilPass2 = _interopRequireDefault(_pydioUtilPass);

var _materialUi = require('material-ui');

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var _LinkModel = require('./LinkModel');

var _LinkModel2 = _interopRequireDefault(_LinkModel);

var _mainShareHelper = require('../main/ShareHelper');

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var _Pydio$requireLib = _pydio2['default'].requireLib('form');

var ValidPassword = _Pydio$requireLib.ValidPassword;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib2.ModernTextField;
var ModernStyles = _Pydio$requireLib2.ModernStyles;

var globStyles = {
    leftIcon: {
        margin: '0 16px 0 4px',
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
                            { style: { paddingTop: 20, textAlign: 'right' } },
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
            passwordField = _react2['default'].createElement(ModernTextField, {
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
                { className: 'password-container', style: { display: 'flex', alignItems: 'center' } },
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
                    _react2['default'].createElement(_materialUi.DatePicker, _extends({
                        ref: 'expirationDate',
                        key: 'start',
                        value: expDate,
                        minDate: new Date(),
                        maxDate: maxDate,
                        autoOk: true,
                        disabled: this.props.isReadonly() || !linkModel.isEditable(),
                        onChange: this.onDateChange,
                        showYearSelector: true,
                        hintText: this.props.getMessage(dateExpired ? '21b' : '21'),
                        mode: 'landscape',
                        formatDate: this.formatDate,
                        style: { flex: 1 },
                        fullWidth: true
                    }, ModernStyles.textField))
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { flex: 1, alignItems: 'baseline', display: crtLinkDLAllowed ? 'flex' : 'none', position: 'relative' }, className: dlExpired ? 'limit-block-expired' : null },
                    _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-download', style: globStyles.leftIcon }),
                    _react2['default'].createElement(ModernTextField, {
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
                        { style: { position: 'absolute', right: 10, top: 14, fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.43)' } },
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

},{"../ShareContextConsumer":1,"../main/ShareHelper":30,"./LinkModel":18,"material-ui":"material-ui","pydio":"pydio","pydio/util/pass":"pydio/util/pass","react":"react"}],23:[function(require,module,exports){
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

},{"../ShareContextConsumer":1,"../links/LinkModel":18,"clipboard":"clipboard","material-ui":"material-ui","react":"react","react-dom":"react-dom"}],24:[function(require,module,exports){
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
            { style: this.props.style },
            linkModel.getLink().Uuid && _react2['default'].createElement(ResourcePoliciesPanel, {
                pydio: pydio,
                resourceType: 'link',
                description: this.props.getMessage('link.visibility.advanced'),
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

},{"../ShareContextConsumer":1,"./LinkModel":18,"pydio":"pydio","pydio/http/policies":"pydio/http/policies","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],25:[function(require,module,exports){
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
                        if (res.Link && res.Link.Label) {
                            basename = res.Link.Label + ' (' + basename + ')';
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

},{"material-ui":"material-ui","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","pydio/model/node":"pydio/model/node","pydio/util/path":"pydio/util/path","react":"react"}],26:[function(require,module,exports){
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
                tooltip: this.props.getMessage(this.props.messageId, this.props.messageCoreNamespace ? '' : undefined),
                tooltipPosition: this.props.tooltipPosition
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

},{"../ShareContextConsumer":1,"material-ui":"material-ui","material-ui/styles":"material-ui/styles","react":"react"}],27:[function(require,module,exports){
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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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
            var editorOneColumn = _props3.editorOneColumn;
            var _state = this.state;
            var left = _state.left;
            var right = _state.right;

            if (editorOneColumn) {

                var merged = [].concat(_toConsumableArray(tabs.left), _toConsumableArray(tabs.right));
                var hasLast = merged.filter(function (tab) {
                    return tab.AlwaysLast;
                });
                if (hasLast.length) {
                    merged = [].concat(_toConsumableArray(merged.filter(function (tab) {
                        return !tab.AlwaysLast;
                    })), [hasLast[0]]);
                }

                return _react2['default'].createElement(
                    'div',
                    { style: _extends({ display: 'flex', flexDirection: 'column', height: '100%' }, style) },
                    _react2['default'].createElement(
                        'div',
                        { style: { display: 'flex', flexDirection: 'column' } },
                        _react2['default'].createElement(
                            'div',
                            { style: { backgroundColor: '#EEEEEE', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' } },
                            _react2['default'].createElement(_materialUi.RaisedButton, { disabled: !saveEnabled, primary: true, label: pydio.MessageHash['53'], onTouchTap: onSaveAction }),
                            _react2['default'].createElement(_materialUi.FlatButton, { disabled: !saveEnabled, label: pydio.MessageHash['628'], onTouchTap: onRevertAction, style: { marginLeft: 10 } }),
                            _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-close", tooltip: pydio.MessageHash['86'], onTouchTap: onCloseAction, style: { marginLeft: 10 } })
                        ),
                        _react2['default'].createElement(
                            'div',
                            { style: { flex: 1, padding: '10px 20px' } },
                            header
                        )
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { display: 'flex' } },
                        _react2['default'].createElement(EditorTab, { tabs: merged, active: left, style: { flex: 1 }, onChange: function (value) {
                                _this.setState({ left: value });
                            } })
                    ),
                    _react2['default'].createElement(_materialUi.Divider, null),
                    _react2['default'].createElement(
                        'div',
                        { style: { display: 'flex', flex: 1 } },
                        _react2['default'].createElement(
                            'div',
                            { style: _extends({ overflowY: 'auto', width: '100%', height: '100%', padding: 10 }, tabs.leftStyle) },
                            _react2['default'].createElement(EditorTabContent, { tabs: merged, active: left })
                        )
                    )
                );
            } else {

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
                            { style: { paddingTop: 18 } },
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
                            { style: _extends({ overflowY: 'auto', width: '50%', borderRight: '1px solid #e0e0e0', padding: 10 }, tabs.leftStyle) },
                            _react2['default'].createElement(EditorTabContent, { tabs: tabs.left, active: left })
                        ),
                        _react2['default'].createElement(
                            'div',
                            { style: _extends({ overflowY: 'auto', width: '50%', padding: 10 }, tabs.rightStyle) },
                            _react2['default'].createElement(EditorTabContent, { tabs: tabs.right, active: right })
                        )
                    )
                );
            }
        }
    }]);

    return GenericEditor;
})(_react2['default'].Component);

exports['default'] = GenericEditor;
module.exports = exports['default'];

},{"material-ui":"material-ui","material-ui/styles":"material-ui/styles","react":"react"}],29:[function(require,module,exports){
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

},{"../cells/CellCard":2,"../composite/CompositeCard":10,"material-ui":"material-ui","react":"react"}],30:[function(require,module,exports){
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var moment = _Pydio$requireLib.moment;

var ShareHelper = (function () {
    function ShareHelper() {
        _classCallCheck(this, ShareHelper);
    }

    _createClass(ShareHelper, null, [{
        key: 'mailerSupported',
        value: function mailerSupported(pydio) {
            return pydio.Parameters.get('validMailer');
        }
    }, {
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
            mail.To = [];
            var ignored = 0;
            Object.keys(targetUsers).map(function (k) {
                var u = targetUsers[k];
                var to = new _pydioHttpRestApi.MailerUser();
                if (u.IdmUser && u.IdmUser.Login && u.IdmUser.Attributes && (u.IdmUser.Attributes['hasEmail'] || u.IdmUser.Attributes['email'])) {
                    to.Uuid = u.IdmUser.Login;
                    mail.To.push(to);
                } else {
                    ignored++;
                }
                return to;
            });
            var messages = _pydio2['default'].getInstance().MessageHash;
            if (mail.To.length) {
                mail.TemplateId = templateId;
                mail.TemplateData = templateData;
                api.send(mail).then(function () {
                    callback();
                });
                var msg = messages['core.mailer.1'].replace('%s', mail.To.length);
                if (ignored > 0) {
                    msg += ' ' + messages['core.mailer.entries.ignored'];
                }
                _pydio2['default'].getInstance().UI.displayMessage('SUCCESS', msg);
            } else {
                _pydio2['default'].getInstance().UI.displayMessage('ERROR', messages['core.mailer.entries.ignored']);
            }
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
                    templateData["FileName"] = linkObject.Label || node.getLabel();
                } else {
                    templateId = "PublicFolder";
                    templateData["FolderName"] = linkObject.Label || node.getLabel();
                }
                templateData["LinkPath"] = "/public/" + linkObject.LinkHash;
                if (linkObject.MaxDownloads) {
                    templateData["MaxDownloads"] = linkObject.MaxDownloads + "";
                }
                if (linkObject.AccessEnd) {
                    var m = moment(new Date(linkObject.AccessEnd * 1000));
                    templateData["Expire"] = m.format('LL');
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

},{"pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","pydio/util/xml":"pydio/util/xml"}]},{},[15])(15)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvZGlhbG9nL1NoYXJlQ29udGV4dENvbnN1bWVyLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9jZWxscy9DZWxsQ2FyZC5qcyIsInJlcy9idWlsZC9kaWFsb2cvY2VsbHMvQ3JlYXRlQ2VsbERpYWxvZy5qcyIsInJlcy9idWlsZC9kaWFsb2cvY2VsbHMvRWRpdENlbGxEaWFsb2cuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2NlbGxzL05vZGVzUGlja2VyLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9jZWxscy9TaGFyZWRVc2VyRW50cnkuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2NlbGxzL1NoYXJlZFVzZXJzLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9jZWxscy9Vc2VyQmFkZ2UuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2NvbXBvc2l0ZS9DZWxsc0xpc3QuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2NvbXBvc2l0ZS9Db21wb3NpdGVDYXJkLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9jb21wb3NpdGUvQ29tcG9zaXRlRGlhbG9nLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9jb21wb3NpdGUvQ29tcG9zaXRlTW9kZWwuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2NvbXBvc2l0ZS9NYWlsZXIuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2NvbXBvc2l0ZS9TaW1wbGVMaW5rQ2FyZC5qcyIsInJlcy9idWlsZC9kaWFsb2cvaW5kZXguanMiLCJyZXMvYnVpbGQvZGlhbG9nL2xpbmtzL0ZpZWxkLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9saW5rcy9MYWJlbFBhbmVsLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9saW5rcy9MaW5rTW9kZWwuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2xpbmtzL1BhbmVsLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9saW5rcy9QZXJtaXNzaW9ucy5qcyIsInJlcy9idWlsZC9kaWFsb2cvbGlua3MvUHVibGljTGlua1RlbXBsYXRlLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9saW5rcy9TZWN1cmVPcHRpb25zLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9saW5rcy9UYXJnZXRlZFVzZXJzLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9saW5rcy9WaXNpYmlsaXR5UGFuZWwuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2xpc3RzL1NoYXJlVmlldy5qcyIsInJlcy9idWlsZC9kaWFsb2cvbWFpbi9BY3Rpb25CdXR0b24uanMiLCJyZXMvYnVpbGQvZGlhbG9nL21haW4vR2VuZXJpY0NhcmQuanMiLCJyZXMvYnVpbGQvZGlhbG9nL21haW4vR2VuZXJpY0VkaXRvci5qcyIsInJlcy9idWlsZC9kaWFsb2cvbWFpbi9JbmZvUGFuZWwuanMiLCJyZXMvYnVpbGQvZGlhbG9nL21haW4vU2hhcmVIZWxwZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDNVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcGFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdldBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDak1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25UQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBmdW5jdGlvbiAoUHlkaW9Db21wb25lbnQpIHtcbiAgICB2YXIgU2hhcmVDb250ZXh0Q29uc3VtZXIgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICAgICAgX2luaGVyaXRzKFNoYXJlQ29udGV4dENvbnN1bWVyLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgICAgICBmdW5jdGlvbiBTaGFyZUNvbnRleHRDb25zdW1lcigpIHtcbiAgICAgICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTaGFyZUNvbnRleHRDb25zdW1lcik7XG5cbiAgICAgICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFNoYXJlQ29udGV4dENvbnN1bWVyLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cblxuICAgICAgICBfY3JlYXRlQ2xhc3MoU2hhcmVDb250ZXh0Q29uc3VtZXIsIFt7XG4gICAgICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgICAgICB2YXIgX2NvbnRleHQgPSB0aGlzLmNvbnRleHQ7XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2VzID0gX2NvbnRleHQubWVzc2FnZXM7XG4gICAgICAgICAgICAgICAgdmFyIGdldE1lc3NhZ2UgPSBfY29udGV4dC5nZXRNZXNzYWdlO1xuICAgICAgICAgICAgICAgIHZhciBpc1JlYWRvbmx5ID0gX2NvbnRleHQuaXNSZWFkb25seTtcblxuICAgICAgICAgICAgICAgIHZhciBjb250ZXh0UHJvcHMgPSB7IG1lc3NhZ2VzOiBtZXNzYWdlcywgZ2V0TWVzc2FnZTogZ2V0TWVzc2FnZSwgaXNSZWFkb25seTogaXNSZWFkb25seSB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFB5ZGlvQ29tcG9uZW50LCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcywgY29udGV4dFByb3BzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1dKTtcblxuICAgICAgICByZXR1cm4gU2hhcmVDb250ZXh0Q29uc3VtZXI7XG4gICAgfSkoUmVhY3QuQ29tcG9uZW50KTtcblxuICAgIFNoYXJlQ29udGV4dENvbnN1bWVyLmNvbnRleHRUeXBlcyA9IHtcbiAgICAgICAgbWVzc2FnZXM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgICAgIGdldE1lc3NhZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgICAgICBpc1JlYWRvbmx5OiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuICAgIH07XG5cbiAgICByZXR1cm4gU2hhcmVDb250ZXh0Q29uc3VtZXI7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfRWRpdENlbGxEaWFsb2cgPSByZXF1aXJlKCcuL0VkaXRDZWxsRGlhbG9nJyk7XG5cbnZhciBfRWRpdENlbGxEaWFsb2cyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfRWRpdENlbGxEaWFsb2cpO1xuXG52YXIgX3B5ZGlvTW9kZWxDZWxsID0gcmVxdWlyZSgncHlkaW8vbW9kZWwvY2VsbCcpO1xuXG52YXIgX3B5ZGlvTW9kZWxDZWxsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvTW9kZWxDZWxsKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9tYWluR2VuZXJpY0NhcmQgPSByZXF1aXJlKCcuLi9tYWluL0dlbmVyaWNDYXJkJyk7XG5cbnZhciBfbWFpblNoYXJlSGVscGVyID0gcmVxdWlyZShcIi4uL21haW4vU2hhcmVIZWxwZXJcIik7XG5cbnZhciBfbWFpblNoYXJlSGVscGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21haW5TaGFyZUhlbHBlcik7XG5cbnZhciBDZWxsQ2FyZCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhDZWxsQ2FyZCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBDZWxsQ2FyZChwcm9wcykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDZWxsQ2FyZCk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoQ2VsbENhcmQucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7IGVkaXQ6IGZhbHNlLCBtb2RlbDogbmV3IF9weWRpb01vZGVsQ2VsbDJbJ2RlZmF1bHQnXSgpIH07XG4gICAgICAgIHRoaXMuX29ic2VydmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvL0NlbGxDYXJkID0gUGFsZXR0ZU1vZGlmaWVyKHtwcmltYXJ5MUNvbG9yOicjMDA5Njg4J30pKENlbGxDYXJkKTtcblxuICAgIF9jcmVhdGVDbGFzcyhDZWxsQ2FyZCwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMucHlkaW87XG4gICAgICAgICAgICB2YXIgY2VsbElkID0gX3Byb3BzLmNlbGxJZDtcblxuICAgICAgICAgICAgaWYgKHB5ZGlvLnVzZXIuYWN0aXZlUmVwb3NpdG9yeSA9PT0gY2VsbElkKSB7XG4gICAgICAgICAgICAgICAgcHlkaW8udXNlci5nZXRBY3RpdmVSZXBvc2l0b3J5QXNDZWxsKCkudGhlbihmdW5jdGlvbiAoY2VsbCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBtb2RlbDogY2VsbCB9KTtcbiAgICAgICAgICAgICAgICAgICAgY2VsbC5vYnNlcnZlKCd1cGRhdGUnLCBfdGhpczIuX29ic2VydmVyKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5tb2RlbC5vYnNlcnZlKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUubW9kZWwubG9hZCh0aGlzLnByb3BzLmNlbGxJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxVbm1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5tb2RlbC5zdG9wT2JzZXJ2aW5nKCd1cGRhdGUnLCB0aGlzLl9vYnNlcnZlcik7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3VzZXJzSW52aXRhdGlvbnMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXNlcnNJbnZpdGF0aW9ucyh1c2VyT2JqZWN0cykge1xuICAgICAgICAgICAgX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5zZW5kQ2VsbEludml0YXRpb24odGhpcy5wcm9wcy5ub2RlLCB0aGlzLnN0YXRlLm1vZGVsLCB1c2VyT2JqZWN0cyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIG1vZGUgPSBfcHJvcHMyLm1vZGU7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMyLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIGVkaXRvck9uZUNvbHVtbiA9IF9wcm9wczIuZWRpdG9yT25lQ29sdW1uO1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgZWRpdCA9IF9zdGF0ZS5lZGl0O1xuICAgICAgICAgICAgdmFyIG1vZGVsID0gX3N0YXRlLm1vZGVsO1xuXG4gICAgICAgICAgICB2YXIgbSA9IGZ1bmN0aW9uIG0oaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci4nICsgaWRdO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHJvb3RTdHlsZSA9IHsgd2lkdGg6IDM1MCwgbWluSGVpZ2h0OiAyNzAgfTtcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICBpZiAoZWRpdCkge1xuICAgICAgICAgICAgICAgIGlmIChlZGl0b3JPbmVDb2x1bW4pIHtcbiAgICAgICAgICAgICAgICAgICAgcm9vdFN0eWxlID0geyB3aWR0aDogMzUwLCBoZWlnaHQ6IDUwMCB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJvb3RTdHlsZSA9IHsgd2lkdGg6IDcwMCwgaGVpZ2h0OiA1MDAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29udGVudCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9FZGl0Q2VsbERpYWxvZzJbJ2RlZmF1bHQnXSwgX2V4dGVuZHMoe30sIHRoaXMucHJvcHMsIHsgbW9kZWw6IG1vZGVsLCBzZW5kSW52aXRhdGlvbnM6IHRoaXMudXNlcnNJbnZpdGF0aW9ucy5iaW5kKHRoaXMpLCBlZGl0b3JPbmVDb2x1bW46IGVkaXRvck9uZUNvbHVtbiB9KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBub2RlcyA9IG1vZGVsLmdldFJvb3ROb2RlcygpLm1hcChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWwuZ2V0Tm9kZUxhYmVsSW5Db250ZXh0KG5vZGUpO1xuICAgICAgICAgICAgICAgIH0pLmpvaW4oJywgJyk7XG4gICAgICAgICAgICAgICAgaWYgKCFub2Rlcykge1xuICAgICAgICAgICAgICAgICAgICBub2RlcyA9IG1vZGVsLmdldFJvb3ROb2RlcygpLmxlbmd0aCArICcgaXRlbShzKSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBkZWxldGVBY3Rpb24gPSB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIGVkaXRBY3Rpb24gPSB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIG1vcmVNZW51SXRlbXMgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKG1vZGUgIT09ICdpbmZvUGFuZWwnKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vcmVNZW51SXRlbXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1vZGVsLmdldFV1aWQoKSAhPT0gcHlkaW8udXNlci5hY3RpdmVSZXBvc2l0b3J5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb3JlTWVudUl0ZW1zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgcHJpbWFyeVRleHQ6IG0oMjQ2KSwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBweWRpby50cmlnZ2VyUmVwb3NpdG9yeUNoYW5nZShtb2RlbC5nZXRVdWlkKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczMucHJvcHMub25EaXNtaXNzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG1vZGVsLmlzRWRpdGFibGUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlQWN0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsLmRlbGV0ZUNlbGwoKS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnByb3BzLm9uRGlzbWlzcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRBY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnNldFN0YXRlKHsgZWRpdDogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMy5wcm9wcy5vbkhlaWdodENoYW5nZSg1MDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBtb3JlTWVudUl0ZW1zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgcHJpbWFyeVRleHQ6IG0oMjQ3KSwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMzLnNldFN0YXRlKHsgZWRpdDogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcmVNZW51SXRlbXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyBwcmltYXJ5VGV4dDogbSgyNDgpLCBvblRvdWNoVGFwOiBkZWxldGVBY3Rpb24gfSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21haW5HZW5lcmljQ2FyZC5HZW5lcmljQ2FyZCxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW86IHB5ZGlvLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IG1vZGVsLmdldExhYmVsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkRpc21pc3NBY3Rpb246IHRoaXMucHJvcHMub25EaXNtaXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25EZWxldGVBY3Rpb246IGRlbGV0ZUFjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRWRpdEFjdGlvbjogZWRpdEFjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlclNtYWxsOiBtb2RlID09PSAnaW5mb1BhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcmVNZW51SXRlbXM6IG1vcmVNZW51SXRlbXNcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwuZ2V0RGVzY3JpcHRpb24oKSAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWFpbkdlbmVyaWNDYXJkLkdlbmVyaWNMaW5lLCB7IGljb25DbGFzc05hbWU6ICdtZGkgbWRpLWluZm9ybWF0aW9uJywgbGVnZW5kOiBtKDE0NSksIGRhdGE6IG1vZGVsLmdldERlc2NyaXB0aW9uKCkgfSksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYWluR2VuZXJpY0NhcmQuR2VuZXJpY0xpbmUsIHsgaWNvbkNsYXNzTmFtZTogJ21kaSBtZGktYWNjb3VudC1tdWx0aXBsZScsIGxlZ2VuZDogbSg1NCksIGRhdGE6IG1vZGVsLmdldEFjbHNTdWJqZWN0cygpIH0pLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWFpbkdlbmVyaWNDYXJkLkdlbmVyaWNMaW5lLCB7IGljb25DbGFzc05hbWU6ICdtZGkgbWRpLWZvbGRlcicsIGxlZ2VuZDogbSgyNDkpLCBkYXRhOiBub2RlcyB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKG1vZGUgPT09ICdpbmZvUGFuZWwnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb250ZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBhcGVyLFxuICAgICAgICAgICAgICAgIHsgekRlcHRoOiAwLCBzdHlsZTogcm9vdFN0eWxlIH0sXG4gICAgICAgICAgICAgICAgY29udGVudFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBDZWxsQ2FyZDtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBDZWxsQ2FyZDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfbWF0ZXJpYWxVaVN0eWxlcyA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpL3N0eWxlcycpO1xuXG52YXIgX1NoYXJlZFVzZXJzID0gcmVxdWlyZSgnLi9TaGFyZWRVc2VycycpO1xuXG52YXIgX1NoYXJlZFVzZXJzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1NoYXJlZFVzZXJzKTtcblxudmFyIF9Ob2Rlc1BpY2tlciA9IHJlcXVpcmUoJy4vTm9kZXNQaWNrZXInKTtcblxudmFyIF9Ob2Rlc1BpY2tlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Ob2Rlc1BpY2tlcik7XG5cbnZhciBfcHlkaW9Nb2RlbENlbGwgPSByZXF1aXJlKCdweWRpby9tb2RlbC9jZWxsJyk7XG5cbnZhciBfcHlkaW9Nb2RlbENlbGwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9Nb2RlbENlbGwpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignaG9jJyk7XG5cbnZhciBNb2Rlcm5UZXh0RmllbGQgPSBfUHlkaW8kcmVxdWlyZUxpYi5Nb2Rlcm5UZXh0RmllbGQ7XG5cbi8qKlxuICogRGlhbG9nIGZvciBsZXR0aW5nIHVzZXJzIGNyZWF0ZSBhIHdvcmtzcGFjZVxuICovXG52YXIgQ3JlYXRlQ2VsbERpYWxvZyA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdDcmVhdGVDZWxsRGlhbG9nJyxcblxuICAgIGNoaWxkQ29udGV4dFR5cGVzOiB7XG4gICAgICAgIG1lc3NhZ2VzOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgICAgZ2V0TWVzc2FnZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jLFxuICAgICAgICBpc1JlYWRvbmx5OiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmNcbiAgICB9LFxuXG4gICAgZ2V0Q2hpbGRDb250ZXh0OiBmdW5jdGlvbiBnZXRDaGlsZENvbnRleHQoKSB7XG4gICAgICAgIHZhciBtZXNzYWdlcyA9IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtZXNzYWdlczogbWVzc2FnZXMsXG4gICAgICAgICAgICBnZXRNZXNzYWdlOiBmdW5jdGlvbiBnZXRNZXNzYWdlKG1lc3NhZ2VJZCkge1xuICAgICAgICAgICAgICAgIHZhciBuYW1lc3BhY2UgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAnc2hhcmVfY2VudGVyJyA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlc1tuYW1lc3BhY2UgKyAobmFtZXNwYWNlID8gXCIuXCIgOiBcIlwiKSArIG1lc3NhZ2VJZF0gfHwgbWVzc2FnZUlkO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2VJZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaXNSZWFkb25seTogKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4geyBzdGVwOiAndXNlcnMnLCBtb2RlbDogbmV3IF9weWRpb01vZGVsQ2VsbDJbJ2RlZmF1bHQnXSgpLCBzYXZpbmc6IGZhbHNlIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB0aGlzLnJlZnMudGl0bGUuZm9jdXMoKTtcbiAgICAgICAgdGhpcy5zdGF0ZS5tb2RlbC5vYnNlcnZlKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLnN0YXRlLm1vZGVsLnN0b3BPYnNlcnZpbmcoJ3VwZGF0ZScpO1xuICAgIH0sXG5cbiAgICBzdWJtaXQ6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgdmFyIG1vZGVsID0gdGhpcy5zdGF0ZS5tb2RlbDtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2F2aW5nOiB0cnVlIH0pO1xuICAgICAgICBtb2RlbC5zYXZlKCkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICBfdGhpczIucHJvcHMub25EaXNtaXNzKCk7XG4gICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBzYXZpbmc6IGZhbHNlIH0pO1xuICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgICAgICBweWRpby5VSS5kaXNwbGF5TWVzc2FnZSgnRVJST1InLCByZWFzb24ubWVzc2FnZSk7XG4gICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBzYXZpbmc6IGZhbHNlIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgbTogZnVuY3Rpb24gbShpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFsnc2hhcmVfY2VudGVyLicgKyBpZF07XG4gICAgfSxcblxuICAgIGNvbXB1dGVTdW1tYXJ5U3RyaW5nOiBmdW5jdGlvbiBjb21wdXRlU3VtbWFyeVN0cmluZygpIHtcbiAgICAgICAgdmFyIG1vZGVsID0gdGhpcy5zdGF0ZS5tb2RlbDtcblxuICAgICAgICB2YXIgdXNlcnMgPSAwO1xuICAgICAgICB2YXIgZ3JvdXBzID0gMDtcbiAgICAgICAgdmFyIHRlYW1zID0gMDtcbiAgICAgICAgdmFyIHVzZXJTdHJpbmcgPSBbXTtcbiAgICAgICAgdmFyIG9ianMgPSBtb2RlbC5nZXRBY2xzKCk7XG4gICAgICAgIE9iamVjdC5rZXlzKG9ianMpLm1hcChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgdmFyIGFjbCA9IG9ianNba107XG4gICAgICAgICAgICBpZiAoYWNsLkdyb3VwKSBncm91cHMrKztlbHNlIGlmIChhY2wuUm9sZSkgdGVhbXMrKztlbHNlIHVzZXJzKys7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodXNlcnMpIHVzZXJTdHJpbmcucHVzaCh1c2VycyArICcgJyArIHRoaXMubSgyNzApKTtcbiAgICAgICAgaWYgKGdyb3VwcykgdXNlclN0cmluZy5wdXNoKGdyb3VwcyArICcgJyArIHRoaXMubSgyNzEpKTtcbiAgICAgICAgaWYgKHRlYW1zKSB1c2VyU3RyaW5nLnB1c2godGVhbXMgKyAnICcgKyB0aGlzLm0oMjcyKSk7XG4gICAgICAgIHZhciBmaW5hbFN0cmluZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHVzZXJTdHJpbmcubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICBmaW5hbFN0cmluZyA9IHVzZXJTdHJpbmdbMF0gKyAnLCAnICsgdXNlclN0cmluZ1sxXSArIHRoaXMubSgyNzQpICsgdXNlclN0cmluZ1szXTtcbiAgICAgICAgfSBlbHNlIGlmICh1c2VyU3RyaW5nLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgZmluYWxTdHJpbmcgPSB0aGlzLm0oMjczKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpbmFsU3RyaW5nID0gdXNlclN0cmluZy5qb2luKHRoaXMubSgyNzQpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5tKDI2OSkucmVwbGFjZSgnJVVTRVJTJywgZmluYWxTdHJpbmcpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIGJ1dHRvbnMgPSBbXTtcbiAgICAgICAgdmFyIGNvbnRlbnQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHZhciBweWRpbyA9IHRoaXMucHJvcHMucHlkaW87XG4gICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICB2YXIgc3RlcCA9IF9zdGF0ZS5zdGVwO1xuICAgICAgICB2YXIgbW9kZWwgPSBfc3RhdGUubW9kZWw7XG4gICAgICAgIHZhciBzYXZpbmcgPSBfc3RhdGUuc2F2aW5nO1xuXG4gICAgICAgIHZhciBkaWFsb2dMYWJlbCA9IHB5ZGlvLk1lc3NhZ2VIYXNoWyc0MTgnXTtcbiAgICAgICAgaWYgKHN0ZXAgIT09ICd1c2VycycpIHtcbiAgICAgICAgICAgIGRpYWxvZ0xhYmVsID0gbW9kZWwuZ2V0TGFiZWwoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdGVwID09PSAndXNlcnMnKSB7XG5cbiAgICAgICAgICAgIGNvbnRlbnQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tKDI3NSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE1vZGVyblRleHRGaWVsZCwgeyByZWY6IFwidGl0bGVcIiwgZmxvYXRpbmdMYWJlbFRleHQ6IHRoaXMubSgyNzYpLCB2YWx1ZTogbW9kZWwuZ2V0TGFiZWwoKSwgb25DaGFuZ2U6IGZ1bmN0aW9uIChlLCB2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbC5zZXRMYWJlbCh2KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZnVsbFdpZHRoOiB0cnVlIH0pLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE1vZGVyblRleHRGaWVsZCwgeyBmbG9hdGluZ0xhYmVsVGV4dDogdGhpcy5tKDI3NyksIHZhbHVlOiBtb2RlbC5nZXREZXNjcmlwdGlvbigpLCBvbkNoYW5nZTogZnVuY3Rpb24gKGUsIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsLnNldERlc2NyaXB0aW9uKHYpO1xuICAgICAgICAgICAgICAgICAgICB9LCBmdWxsV2lkdGg6IHRydWUgfSlcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmIChtb2RlbC5nZXRMYWJlbCgpKSB7XG4gICAgICAgICAgICAgICAgYnV0dG9ucy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAncXVpY2snLFxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogIW1vZGVsLmdldExhYmVsKCkgfHwgc2F2aW5nLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy5tKCdjZWxscy5jcmVhdGUuYWR2YW5jZWQnKSwgLy8gQWR2YW5jZWRcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnNldFN0YXRlKHsgc3RlcDogJ2RhdGEnIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IH0pKTtcbiAgICAgICAgICAgICAgICBidXR0b25zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgbWFyZ2luOiAnMCAgMTBweCcsIGZvbnRTaXplOiAxNCwgZm9udFdlaWdodDogNTAwLCBjb2xvcjogJyM5RTlFOUUnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tKCdjZWxscy5jcmVhdGUuYnV0dG9ucy5zZXBhcmF0b3InKVxuICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBidXR0b25zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuUmFpc2VkQnV0dG9uLCB7XG4gICAgICAgICAgICAgICAga2V5OiAnbmV4dDEnLFxuICAgICAgICAgICAgICAgIGRpc2FibGVkOiAhbW9kZWwuZ2V0TGFiZWwoKSB8fCBzYXZpbmcsXG4gICAgICAgICAgICAgICAgcHJpbWFyeTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy5tKDI3OSksIC8vIENyZWF0ZSBDZWxsXG4gICAgICAgICAgICAgICAgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczMuc3VibWl0KCk7XG4gICAgICAgICAgICAgICAgfSB9KSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RlcCA9PT0gJ2RhdGEnKSB7XG5cbiAgICAgICAgICAgIGNvbnRlbnQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnaDUnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IG1hcmdpblRvcDogLTEwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tKDI3OClcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9TaGFyZWRVc2VyczJbJ2RlZmF1bHQnXSwge1xuICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgIGNlbGxBY2xzOiBtb2RlbC5nZXRBY2xzKCksXG5cbiAgICAgICAgICAgICAgICAgICAgZXhjbHVkZXM6IFtweWRpby51c2VyLmlkXSxcbiAgICAgICAgICAgICAgICAgICAgb25Vc2VyT2JqZWN0QWRkOiBtb2RlbC5hZGRVc2VyLmJpbmQobW9kZWwpLFxuICAgICAgICAgICAgICAgICAgICBvblVzZXJPYmplY3RSZW1vdmU6IG1vZGVsLnJlbW92ZVVzZXIuYmluZChtb2RlbCksXG4gICAgICAgICAgICAgICAgICAgIG9uVXNlck9iamVjdFVwZGF0ZVJpZ2h0OiBtb2RlbC51cGRhdGVVc2VyUmlnaHQuYmluZChtb2RlbClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgYnV0dG9ucy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsga2V5OiAncHJldjEnLCBwcmltYXJ5OiBmYWxzZSwgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWyczMDQnXSwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczMuc2V0U3RhdGUoeyBzdGVwOiAndXNlcnMnIH0pO1xuICAgICAgICAgICAgICAgIH0gfSkpO1xuICAgICAgICAgICAgYnV0dG9ucy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsga2V5OiAnbmV4dDInLCBwcmltYXJ5OiB0cnVlLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbJzE3OSddLCBvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpczMuc2V0U3RhdGUoeyBzdGVwOiAnbGFiZWwnIH0pO1xuICAgICAgICAgICAgICAgIH0gfSkpO1xuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBjb250ZW50ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2g1JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBtYXJnaW5Ub3A6IC0xMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubSgnY2VsbHMuY3JlYXRlLnRpdGxlLmZpbGwuZm9sZGVycycpXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgY29sb3I6ICcjOWU5ZTllJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29tcHV0ZVN1bW1hcnlTdHJpbmcoKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmdUb3A6IDE2IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX05vZGVzUGlja2VyMlsnZGVmYXVsdCddLCB7IHB5ZGlvOiBweWRpbywgbW9kZWw6IG1vZGVsIH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgYnV0dG9ucy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsga2V5OiAncHJldjInLCBwcmltYXJ5OiBmYWxzZSwgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWyczMDQnXSwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczMuc2V0U3RhdGUoeyBzdGVwOiAnZGF0YScgfSk7XG4gICAgICAgICAgICAgICAgfSB9KSk7XG4gICAgICAgICAgICBidXR0b25zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuUmFpc2VkQnV0dG9uLCB7IGtleTogJ3N1Ym1pdCcsIGRpc2FibGVkOiBzYXZpbmcsIHByaW1hcnk6IHRydWUsIGxhYmVsOiB0aGlzLm0oMjc5KSwgb25Ub3VjaFRhcDogdGhpcy5zdWJtaXQuYmluZCh0aGlzKSB9KSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6IDM4MCwgZm9udFNpemU6IDEzLCBjb2xvcjogJ3JnYmEoMCwwLDAsLjg3KScsIGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIG1pbkhlaWdodDogMzAwIH0gfSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgcGFkZGluZ0xlZnQ6IDIwIH0gfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBjbGFzc05hbWU6IFwiaWNvbW9vbi1jZWxscy1mdWxsLXBsdXNcIiB9KSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogMjAsIGZvbnRTaXplOiAyMiB9IH0sXG4gICAgICAgICAgICAgICAgICAgIGRpYWxvZ0xhYmVsXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogJzIwcHggMjBweCAxMHB4JywgZmxleDogMSB9IH0sXG4gICAgICAgICAgICAgICAgY29udGVudFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogJzEycHggMTZweCcsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnZmxleC1lbmQnIH0gfSxcbiAgICAgICAgICAgICAgICBidXR0b25zXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ3JlYXRlQ2VsbERpYWxvZyA9ICgwLCBfbWF0ZXJpYWxVaVN0eWxlcy5tdWlUaGVtZWFibGUpKCkoQ3JlYXRlQ2VsbERpYWxvZyk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBDcmVhdGVDZWxsRGlhbG9nO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX1NoYXJlZFVzZXJzID0gcmVxdWlyZSgnLi9TaGFyZWRVc2VycycpO1xuXG52YXIgX1NoYXJlZFVzZXJzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1NoYXJlZFVzZXJzKTtcblxudmFyIF9Ob2Rlc1BpY2tlciA9IHJlcXVpcmUoJy4vTm9kZXNQaWNrZXInKTtcblxudmFyIF9Ob2Rlc1BpY2tlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Ob2Rlc1BpY2tlcik7XG5cbnZhciBfbWFpbkdlbmVyaWNFZGl0b3IgPSByZXF1aXJlKCcuLi9tYWluL0dlbmVyaWNFZGl0b3InKTtcblxudmFyIF9tYWluR2VuZXJpY0VkaXRvcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYWluR2VuZXJpY0VkaXRvcik7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2NvbXBvbmVudHMnKTtcblxudmFyIFJlc291cmNlUG9saWNpZXNQYW5lbCA9IF9QeWRpbyRyZXF1aXJlTGliLlJlc291cmNlUG9saWNpZXNQYW5lbDtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliMiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdob2MnKTtcblxudmFyIE1vZGVyblRleHRGaWVsZCA9IF9QeWRpbyRyZXF1aXJlTGliMi5Nb2Rlcm5UZXh0RmllbGQ7XG5cbi8qKlxuICogRGlhbG9nIGZvciBsZXR0aW5nIHVzZXJzIGNyZWF0ZSBhIHdvcmtzcGFjZVxuICovXG5leHBvcnRzWydkZWZhdWx0J10gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdFZGl0Q2VsbERpYWxvZycsXG5cbiAgICBjaGlsZENvbnRleHRUeXBlczoge1xuICAgICAgICBtZXNzYWdlczogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgICAgZ2V0TWVzc2FnZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIGlzUmVhZG9ubHk6IFJlYWN0LlByb3BUeXBlcy5mdW5jXG4gICAgfSxcblxuICAgIGdldENoaWxkQ29udGV4dDogZnVuY3Rpb24gZ2V0Q2hpbGRDb250ZXh0KCkge1xuICAgICAgICB2YXIgbWVzc2FnZXMgPSB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbWVzc2FnZXM6IG1lc3NhZ2VzLFxuICAgICAgICAgICAgZ2V0TWVzc2FnZTogZnVuY3Rpb24gZ2V0TWVzc2FnZShtZXNzYWdlSWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmFtZXNwYWNlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gJ3NoYXJlX2NlbnRlcicgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZXNbbmFtZXNwYWNlICsgKG5hbWVzcGFjZSA/IFwiLlwiIDogXCJcIikgKyBtZXNzYWdlSWRdIHx8IG1lc3NhZ2VJZDtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlSWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGlzUmVhZG9ubHk6IGZ1bmN0aW9uIGlzUmVhZG9ubHkoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBzdWJtaXQ6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIG1vZGVsID0gX3Byb3BzLm1vZGVsO1xuICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMucHlkaW87XG5cbiAgICAgICAgdmFyIGRpcnR5Um9vdHMgPSBtb2RlbC5oYXNEaXJ0eVJvb3ROb2RlcygpO1xuICAgICAgICBtb2RlbC5zYXZlKCkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICBfdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgaWYgKGRpcnR5Um9vdHMgJiYgbW9kZWwuZ2V0VXVpZCgpID09PSBweWRpby51c2VyLmdldEFjdGl2ZVJlcG9zaXRvcnkoKSkge1xuICAgICAgICAgICAgICAgIHB5ZGlvLmdvVG8oJy8nKTtcbiAgICAgICAgICAgICAgICBweWRpby5maXJlQ29udGV4dFJlZnJlc2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlbJ2NhdGNoJ10oZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgICAgcHlkaW8uVUkuZGlzcGxheU1lc3NhZ2UoJ0VSUk9SJywgcmVhc29uLm1lc3NhZ2UpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzMi5weWRpbztcbiAgICAgICAgdmFyIG1vZGVsID0gX3Byb3BzMi5tb2RlbDtcbiAgICAgICAgdmFyIHNlbmRJbnZpdGF0aW9ucyA9IF9wcm9wczIuc2VuZEludml0YXRpb25zO1xuXG4gICAgICAgIHZhciBtID0gZnVuY3Rpb24gbShpZCkge1xuICAgICAgICAgICAgcmV0dXJuIHB5ZGlvLk1lc3NhZ2VIYXNoWydzaGFyZV9jZW50ZXIuJyArIGlkXTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgaGVhZGVyID0gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTW9kZXJuVGV4dEZpZWxkLCB7IGZsb2F0aW5nTGFiZWxUZXh0OiBtKDI2NyksIHZhbHVlOiBtb2RlbC5nZXRMYWJlbCgpLCBvbkNoYW5nZTogZnVuY3Rpb24gKGUsIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwuc2V0TGFiZWwodik7XG4gICAgICAgICAgICAgICAgfSwgZnVsbFdpZHRoOiB0cnVlIH0pLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChNb2Rlcm5UZXh0RmllbGQsIHsgZmxvYXRpbmdMYWJlbFRleHQ6IG0oMjY4KSwgdmFsdWU6IG1vZGVsLmdldERlc2NyaXB0aW9uKCksIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSwgdikge1xuICAgICAgICAgICAgICAgICAgICBtb2RlbC5zZXREZXNjcmlwdGlvbih2KTtcbiAgICAgICAgICAgICAgICB9LCBmdWxsV2lkdGg6IHRydWUgfSlcbiAgICAgICAgKTtcbiAgICAgICAgdmFyIHRhYnMgPSB7XG4gICAgICAgICAgICBsZWZ0OiBbe1xuICAgICAgICAgICAgICAgIExhYmVsOiBtKDU0KSxcbiAgICAgICAgICAgICAgICBWYWx1ZTogJ3VzZXJzJyxcbiAgICAgICAgICAgICAgICBDb21wb25lbnQ6IFJlYWN0LmNyZWF0ZUVsZW1lbnQoX1NoYXJlZFVzZXJzMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICAgICAgY2VsbEFjbHM6IG1vZGVsLmdldEFjbHMoKSxcbiAgICAgICAgICAgICAgICAgICAgZXhjbHVkZXM6IFtweWRpby51c2VyLmlkXSxcbiAgICAgICAgICAgICAgICAgICAgc2VuZEludml0YXRpb25zOiBzZW5kSW52aXRhdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIG9uVXNlck9iamVjdEFkZDogbW9kZWwuYWRkVXNlci5iaW5kKG1vZGVsKSxcbiAgICAgICAgICAgICAgICAgICAgb25Vc2VyT2JqZWN0UmVtb3ZlOiBtb2RlbC5yZW1vdmVVc2VyLmJpbmQobW9kZWwpLFxuICAgICAgICAgICAgICAgICAgICBvblVzZXJPYmplY3RVcGRhdGVSaWdodDogbW9kZWwudXBkYXRlVXNlclJpZ2h0LmJpbmQobW9kZWwpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBMYWJlbDogbSgyNTMpLFxuICAgICAgICAgICAgICAgIFZhbHVlOiAncGVybWlzc2lvbnMnLFxuICAgICAgICAgICAgICAgIEFsd2F5c0xhc3Q6IHRydWUsXG4gICAgICAgICAgICAgICAgQ29tcG9uZW50OiBSZWFjdC5jcmVhdGVFbGVtZW50KFJlc291cmNlUG9saWNpZXNQYW5lbCwge1xuICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlVHlwZTogJ2NlbGwnLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbSgnY2VsbC52aXNpYmlsaXR5LmFkdmFuY2VkJyksXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlSWQ6IG1vZGVsLmdldFV1aWQoKSxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgbWFyZ2luOiAtMTAgfSxcbiAgICAgICAgICAgICAgICAgICAgc2tpcFRpdGxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBvblNhdmVQb2xpY2llczogZnVuY3Rpb24gKCkge30sXG4gICAgICAgICAgICAgICAgICAgIHJlYWRvbmx5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY2VsbEFjbHM6IG1vZGVsLmdldEFjbHMoKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XSxcbiAgICAgICAgICAgIHJpZ2h0OiBbe1xuICAgICAgICAgICAgICAgIExhYmVsOiBtKDI0OSksXG4gICAgICAgICAgICAgICAgVmFsdWU6ICdjb250ZW50JyxcbiAgICAgICAgICAgICAgICBDb21wb25lbnQ6IFJlYWN0LmNyZWF0ZUVsZW1lbnQoX05vZGVzUGlja2VyMlsnZGVmYXVsdCddLCB7IHB5ZGlvOiBweWRpbywgbW9kZWw6IG1vZGVsLCBtb2RlOiAnZWRpdCcgfSlcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21haW5HZW5lcmljRWRpdG9yMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICB0YWJzOiB0YWJzLFxuICAgICAgICAgICAgaGVhZGVyOiBoZWFkZXIsXG4gICAgICAgICAgICBlZGl0b3JPbmVDb2x1bW46IHRoaXMucHJvcHMuZWRpdG9yT25lQ29sdW1uLFxuICAgICAgICAgICAgc2F2ZUVuYWJsZWQ6IG1vZGVsLmlzRGlydHkoKSxcbiAgICAgICAgICAgIG9uU2F2ZUFjdGlvbjogdGhpcy5zdWJtaXQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIG9uQ2xvc2VBY3Rpb246IHRoaXMucHJvcHMub25EaXNtaXNzLFxuICAgICAgICAgICAgb25SZXZlcnRBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBtb2RlbC5yZXZlcnRDaGFuZ2VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxufSk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSBhcnIyW2ldID0gYXJyW2ldOyByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfbWF0ZXJpYWxVaVN0eWxlcyA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpL3N0eWxlcycpO1xuXG52YXIgX3B5ZGlvTW9kZWxEYXRhTW9kZWwgPSByZXF1aXJlKCdweWRpby9tb2RlbC9kYXRhLW1vZGVsJyk7XG5cbnZhciBfcHlkaW9Nb2RlbERhdGFNb2RlbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb01vZGVsRGF0YU1vZGVsKTtcblxudmFyIF9yZXF1aXJlJHJlcXVpcmVMaWIgPSByZXF1aXJlKCdweWRpbycpLnJlcXVpcmVMaWIoJ2NvbXBvbmVudHMnKTtcblxudmFyIEZvbGRlcnNUcmVlID0gX3JlcXVpcmUkcmVxdWlyZUxpYi5Gb2xkZXJzVHJlZTtcblxudmFyIE5vZGVzUGlja2VyID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKE5vZGVzUGlja2VyLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIE5vZGVzUGlja2VyKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBOb2Rlc1BpY2tlcik7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoTm9kZXNQaWNrZXIucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHZhciBjcnRXcyA9IHVuZGVmaW5lZDtcblxuICAgICAgICB2YXIgdXNlciA9IHByb3BzLnB5ZGlvLnVzZXI7XG4gICAgICAgIHZhciBhdmFpbCA9IFtdO1xuICAgICAgICB1c2VyLmdldFJlcG9zaXRvcmllc0xpc3QoKS5mb3JFYWNoKGZ1bmN0aW9uIChyZXBvKSB7XG4gICAgICAgICAgICBpZiAocmVwby5nZXRBY2Nlc3NUeXBlKCkgPT09ICdnYXRld2F5Jykge1xuICAgICAgICAgICAgICAgIGlmIChyZXBvLmdldElkKCkgPT09IHVzZXIuYWN0aXZlUmVwb3NpdG9yeSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVwby5nZXRPd25lcigpID09PSAnc2hhcmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBkbyBub3QgcHVzaCB0byB0aGUgbGlzdFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNydFdzID0gcmVwbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXZhaWwucHVzaChyZXBvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBhdmFpbGFibGVXcyA9IFtdO1xuICAgICAgICB2YXIgbm90T3duZWQgPSBhdmFpbC5maWx0ZXIoZnVuY3Rpb24gKHJlcG8pIHtcbiAgICAgICAgICAgIHJldHVybiAhcmVwby5nZXRPd25lcigpO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIG93bmVkID0gYXZhaWwuZmlsdGVyKGZ1bmN0aW9uIChyZXBvKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVwby5nZXRPd25lcigpO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKG5vdE93bmVkLmxlbmd0aCAmJiBvd25lZC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGF2YWlsYWJsZVdzID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShub3RPd25lZCksIFsnRElWSURFUiddLCBfdG9Db25zdW1hYmxlQXJyYXkob3duZWQpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF2YWlsYWJsZVdzID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShub3RPd25lZCksIF90b0NvbnN1bWFibGVBcnJheShvd25lZCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRtID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoYXZhaWxhYmxlV3MubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoIWNydFdzKSB7XG4gICAgICAgICAgICAgICAgY3J0V3MgPSBhdmFpbGFibGVXc1swXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRtID0gX3B5ZGlvTW9kZWxEYXRhTW9kZWwyWydkZWZhdWx0J10uUmVtb3RlRGF0YU1vZGVsRmFjdG9yeSh7IHRtcF9yZXBvc2l0b3J5X2lkOiBjcnRXcy5nZXRJZCgpIH0pO1xuICAgICAgICAgICAgdmFyIHJvb3QgPSBkbS5nZXRSb290Tm9kZSgpO1xuICAgICAgICAgICAgcm9vdC5nZXRNZXRhZGF0YSgpLnNldCgncmVwb3NpdG9yeV9pZCcsIGNydFdzLmdldElkKCkpO1xuICAgICAgICAgICAgcm9vdC5sb2FkKGRtLmdldEFqeHBOb2RlUHJvdmlkZXIoKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZGF0YU1vZGVsOiBkbSxcbiAgICAgICAgICAgIG9wZW46IGZhbHNlLFxuICAgICAgICAgICAgYXZhaWxhYmxlV3M6IGF2YWlsYWJsZVdzLFxuICAgICAgICAgICAgY3J0V3M6IGNydFdzXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKE5vZGVzUGlja2VyLCBbe1xuICAgICAgICBrZXk6ICdzd2l0Y2hXb3Jrc3BhY2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc3dpdGNoV29ya3NwYWNlKHdzKSB7XG4gICAgICAgICAgICB2YXIgZG0gPSBfcHlkaW9Nb2RlbERhdGFNb2RlbDJbJ2RlZmF1bHQnXS5SZW1vdGVEYXRhTW9kZWxGYWN0b3J5KHsgdG1wX3JlcG9zaXRvcnlfaWQ6IHdzLmdldElkKCkgfSk7XG4gICAgICAgICAgICB2YXIgcm9vdCA9IGRtLmdldFJvb3ROb2RlKCk7XG4gICAgICAgICAgICByb290LmdldE1ldGFkYXRhKCkuc2V0KCdyZXBvc2l0b3J5X2lkJywgd3MuZ2V0SWQoKSk7XG4gICAgICAgICAgICByb290LmxvYWQoZG0uZ2V0QWp4cE5vZGVQcm92aWRlcigpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjcnRXczogd3MsIGRhdGFNb2RlbDogZG0gfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2hhbmRsZVRvdWNoVGFwJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZVRvdWNoVGFwKGV2ZW50KSB7XG4gICAgICAgICAgICAvLyBUaGlzIHByZXZlbnRzIGdob3N0IGNsaWNrLlxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgb3BlbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBhbmNob3JFbDogZXZlbnQuY3VycmVudFRhcmdldFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2hhbmRsZVJlcXVlc3RDbG9zZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBoYW5kbGVSZXF1ZXN0Q2xvc2UoKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBvcGVuOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29uVmFsaWRhdGVOb2RlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uVmFsaWRhdGVOb2RlKCkge1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IF9zdGF0ZS5ub2RlO1xuICAgICAgICAgICAgdmFyIGNydFdzID0gX3N0YXRlLmNydFdzO1xuXG4gICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLmFkZFJvb3ROb2RlKG5vZGUsIGNydFdzLmdldElkKCkpO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVSZXF1ZXN0Q2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb25Ob2RlU2VsZWN0ZWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb25Ob2RlU2VsZWN0ZWQobm9kZSkge1xuICAgICAgICAgICAgdmFyIGRhdGFNb2RlbCA9IHRoaXMuc3RhdGUuZGF0YU1vZGVsO1xuXG4gICAgICAgICAgICBub2RlLmxvYWQoZGF0YU1vZGVsLmdldEFqeHBOb2RlUHJvdmlkZXIoKSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbm9kZTogbm9kZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gbm9kZSBUcmVlTm9kZVxuICAgICAgICAgKiBAcmV0dXJuIHtYTUx9XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyTm9kZUxpbmUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyTm9kZUxpbmUobm9kZSkge1xuICAgICAgICAgICAgdmFyIG1vZGVsID0gdGhpcy5wcm9wcy5tb2RlbDtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkxpc3RJdGVtLCB7XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgbGVmdEljb246IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogJ21kaSBtZGktZm9sZGVyJyB9KSxcbiAgICAgICAgICAgICAgICBwcmltYXJ5VGV4dDogbW9kZWwuZ2V0Tm9kZUxhYmVsSW5Db250ZXh0KG5vZGUpLFxuICAgICAgICAgICAgICAgIHJpZ2h0SWNvbkJ1dHRvbjogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbC5yZW1vdmVSb290Tm9kZShub2RlLlV1aWQpO1xuICAgICAgICAgICAgICAgICAgICB9LCBpY29uQ2xhc3NOYW1lOiAnbWRpIG1kaS1kZWxldGUnLCB0b29sdGlwOiAnUmVtb3ZlJywgaWNvblN0eWxlOiB7IGNvbG9yOiAncmdiYSgwLDAsMCwuNDMpJyB9IH0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIG1vZGVsID0gX3Byb3BzLm1vZGVsO1xuICAgICAgICAgICAgdmFyIG11aVRoZW1lID0gX3Byb3BzLm11aVRoZW1lO1xuICAgICAgICAgICAgdmFyIG1vZGUgPSBfcHJvcHMubW9kZTtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcblxuICAgICAgICAgICAgdmFyIG0gPSBmdW5jdGlvbiBtKGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHB5ZGlvLk1lc3NhZ2VIYXNoWydzaGFyZV9jZW50ZXIuJyArIGlkXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgbm9kZXMgPSBtb2RlbC5nZXRSb290Tm9kZXMoKSB8fCBbXTtcbiAgICAgICAgICAgIHZhciBub2RlTGluZXMgPSBbXSxcbiAgICAgICAgICAgICAgICBlbXB0eVN0YXRlU3RyaW5nID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgbm9kZXMubWFwKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICAgICAgbm9kZUxpbmVzLnB1c2goX3RoaXMucmVuZGVyTm9kZUxpbmUobm9kZSkpO1xuICAgICAgICAgICAgICAgIG5vZGVMaW5lcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIHsgaW5zZXQ6IHRydWUgfSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBub2RlTGluZXMucG9wKCk7XG4gICAgICAgICAgICBpZiAoIW5vZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChtb2RlID09PSAnZWRpdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgZW1wdHlTdGF0ZVN0cmluZyA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBjb2xvcjogJ3JnYmEoMCwwLDAsLjU0KScsIGZvbnRTdHlsZTogJ2l0YWxpYycgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgyODApXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy9lbXB0eVN0YXRlU3RyaW5nID0gPHNwYW4gc3R5bGU9e3tjb2xvcjoncmdiYSgwLDAsMCwuNTQpJywgZm9udFN0eWxlOidpdGFsaWMnfX0+e20oMjgxKX08L3NwYW4+O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwaWNrQnV0dG9uID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKG1vZGUgPT09ICdlZGl0Jykge1xuICAgICAgICAgICAgICAgIHBpY2tCdXR0b24gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBtKDI4MiksXG4gICAgICAgICAgICAgICAgICAgIG9uVG91Y2hUYXA6IHRoaXMuaGFuZGxlVG91Y2hUYXAuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgbWFyZ2luQm90dG9tOiAxMCB9LFxuICAgICAgICAgICAgICAgICAgICBpY29uOiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBjbGFzc05hbWU6IFwibWRpIG1kaS1mb2xkZXItcGx1c1wiIH0pXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBpY2tCdXR0b24gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWlzZWRCdXR0b24sIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IG0oMjgyKSxcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFRhcDogdGhpcy5oYW5kbGVUb3VjaFRhcC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgbWFyZ2luQm90dG9tOiAxMCB9LFxuICAgICAgICAgICAgICAgICAgICBpY29uOiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBjbGFzc05hbWU6IFwibWRpIG1kaS1mb2xkZXItcGx1c1wiLCBzdHlsZTogeyBmb250U2l6ZTogMjAsIG1hcmdpblRvcDogLTQgfSB9KVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIF9zdGF0ZTIgPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgdmFyIG5vZGUgPSBfc3RhdGUyLm5vZGU7XG4gICAgICAgICAgICB2YXIgYXZhaWxhYmxlV3MgPSBfc3RhdGUyLmF2YWlsYWJsZVdzO1xuICAgICAgICAgICAgdmFyIGNydFdzID0gX3N0YXRlMi5jcnRXcztcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgcGlja0J1dHRvbixcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuTGlzdCxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgbm9kZUxpbmVzXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBlbXB0eVN0YXRlU3RyaW5nLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5Qb3BvdmVyLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVuOiB0aGlzLnN0YXRlLm9wZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmNob3JFbDogdGhpcy5zdGF0ZS5hbmNob3JFbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuY2hvck9yaWdpbjogeyBob3Jpem9udGFsOiAnbGVmdCcsIHZlcnRpY2FsOiAnYm90dG9tJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0T3JpZ2luOiB7IGhvcml6b250YWw6ICdsZWZ0JywgdmVydGljYWw6ICd0b3AnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvblJlcXVlc3RDbG9zZTogdGhpcy5oYW5kbGVSZXF1ZXN0Q2xvc2UuYmluZCh0aGlzKVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogMzcyLCBoZWlnaHQ6IDMwMCwgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5Ecm9wRG93bk1lbnUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBoZWlnaHQ6IDU0IH0sIHZhbHVlOiBjcnRXcywgb25DaGFuZ2U6IGZ1bmN0aW9uIChlLCBpLCB2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zd2l0Y2hXb3Jrc3BhY2Uodik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVXcy5tYXAoZnVuY3Rpb24gKHdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3cyA9PT0gJ0RJVklERVInKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRGl2aWRlciwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgdmFsdWU6IHdzLCBwcmltYXJ5VGV4dDogd3MuZ2V0TGFiZWwoKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRGl2aWRlciwgbnVsbCksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IG1hcmdpbkxlZnQ6IC0yNiwgZmxleDogJzEnLCBvdmVyZmxvd1k6ICdhdXRvJywgZm9udFNpemU6IDE1LCBjb2xvcjogJ3JnYmEoMCwwLDAsLjczKScgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEZvbGRlcnNUcmVlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvOiB0aGlzLnByb3BzLnB5ZGlvLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhTW9kZWw6IHRoaXMuc3RhdGUuZGF0YU1vZGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbk5vZGVTZWxlY3RlZDogdGhpcy5vbk5vZGVTZWxlY3RlZC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93Um9vdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIG51bGwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIHBhZGRpbmc6ICc0cHggMTZweCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBmb250U2l6ZTogMTUgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZsZXg6IDEsIGNvbG9yOiAncmdiYSgwLDAsMCwuODcpJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUgJiYgbm9kZS5nZXRQYXRoKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICFub2RlICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmbGV4OiAxLCBjb2xvcjogJ3JnYmEoMCwwLDAsLjU0KScsIGZvbnRXZWlnaHQ6IDUwMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oMjgzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBpY29uU3R5bGU6IHsgY29sb3I6IG11aVRoZW1lLnBhbGV0dGUucHJpbWFyeTFDb2xvciB9LCBkaXNhYmxlZDogIW5vZGUsIGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1wbHVzLWNpcmNsZS1vdXRsaW5lXCIsIG9uVG91Y2hUYXA6IHRoaXMub25WYWxpZGF0ZU5vZGUuYmluZCh0aGlzKSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBOb2Rlc1BpY2tlcjtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBOb2Rlc1BpY2tlciA9ICgwLCBfbWF0ZXJpYWxVaVN0eWxlcy5tdWlUaGVtZWFibGUpKCkoTm9kZXNQaWNrZXIpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gTm9kZXNQaWNrZXI7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX1VzZXJCYWRnZSA9IHJlcXVpcmUoJy4vVXNlckJhZGdlJyk7XG5cbnZhciBfVXNlckJhZGdlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1VzZXJCYWRnZSk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIgPSByZXF1aXJlKCcuLi9TaGFyZUNvbnRleHRDb25zdW1lcicpO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1NoYXJlQ29udGV4dENvbnN1bWVyKTtcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIFNoYXJlZFVzZXJFbnRyeSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1NoYXJlZFVzZXJFbnRyeScsXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgY2VsbEFjbDogUmVhY3QuUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgICBzZW5kSW52aXRhdGlvbnM6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgICAgICBvblVzZXJPYmplY3RSZW1vdmU6IFJlYWN0LlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIG9uVXNlck9iamVjdFVwZGF0ZVJpZ2h0OiBSZWFjdC5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkXG4gICAgfSxcbiAgICBvblJlbW92ZTogZnVuY3Rpb24gb25SZW1vdmUoKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25Vc2VyT2JqZWN0UmVtb3ZlKHRoaXMucHJvcHMuY2VsbEFjbC5Sb2xlSWQpO1xuICAgIH0sXG4gICAgb25JbnZpdGU6IGZ1bmN0aW9uIG9uSW52aXRlKCkge1xuICAgICAgICB2YXIgdGFyZ2V0cyA9IHt9O1xuICAgICAgICB2YXIgdXNlck9iamVjdCA9IFB5ZGlvVXNlcnMuVXNlci5mcm9tSWRtVXNlcih0aGlzLnByb3BzLmNlbGxBY2wuVXNlcik7XG4gICAgICAgIHRhcmdldHNbdXNlck9iamVjdC5nZXRJZCgpXSA9IHVzZXJPYmplY3Q7XG4gICAgICAgIHRoaXMucHJvcHMuc2VuZEludml0YXRpb25zKHRhcmdldHMpO1xuICAgIH0sXG4gICAgb25VcGRhdGVSaWdodDogZnVuY3Rpb24gb25VcGRhdGVSaWdodChldmVudCkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICB0aGlzLnByb3BzLm9uVXNlck9iamVjdFVwZGF0ZVJpZ2h0KHRoaXMucHJvcHMuY2VsbEFjbC5Sb2xlSWQsIHRhcmdldC5uYW1lLCB0YXJnZXQuY2hlY2tlZCk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBjZWxsQWNsID0gX3Byb3BzLmNlbGxBY2w7XG4gICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcblxuICAgICAgICB2YXIgbWVudUl0ZW1zID0gW107XG4gICAgICAgIHZhciB0eXBlID0gY2VsbEFjbC5Vc2VyID8gJ3VzZXInIDogY2VsbEFjbC5Hcm91cCA/ICdncm91cCcgOiAndGVhbSc7XG5cbiAgICAgICAgLy8gRG8gbm90IHJlbmRlciBjdXJyZW50IHVzZXJcbiAgICAgICAgaWYgKGNlbGxBY2wuVXNlciAmJiBjZWxsQWNsLlVzZXIuTG9naW4gPT09IHB5ZGlvLnVzZXIuaWQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGUgIT0gJ2dyb3VwJykge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc2VuZEludml0YXRpb25zKSB7XG4gICAgICAgICAgICAgICAgLy8gU2VuZCBpbnZpdGF0aW9uXG4gICAgICAgICAgICAgICAgbWVudUl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzQ1JyksXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiB0aGlzLm9uSW52aXRlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmlzUmVhZG9ubHkoKSAmJiAhdGhpcy5wcm9wcy5yZWFkb25seSkge1xuICAgICAgICAgICAgLy8gUmVtb3ZlIEVudHJ5XG4gICAgICAgICAgICBtZW51SXRlbXMucHVzaCh7XG4gICAgICAgICAgICAgICAgdGV4dDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcyNTcnLCAnJyksXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IHRoaXMub25SZW1vdmVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxhYmVsID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgYXZhdGFyID0gdW5kZWZpbmVkO1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJ1c2VyXCI6XG4gICAgICAgICAgICAgICAgbGFiZWwgPSBjZWxsQWNsLlVzZXIuQXR0cmlidXRlc1tcImRpc3BsYXlOYW1lXCJdIHx8IGNlbGxBY2wuVXNlci5Mb2dpbjtcbiAgICAgICAgICAgICAgICBhdmF0YXIgPSBjZWxsQWNsLlVzZXIuQXR0cmlidXRlc1tcImF2YXRhclwiXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJncm91cFwiOlxuICAgICAgICAgICAgICAgIGlmICghY2VsbEFjbC5Hcm91cC5BdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsID0gY2VsbEFjbC5Hcm91cC5VdWlkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsID0gY2VsbEFjbC5Hcm91cC5BdHRyaWJ1dGVzW1wiZGlzcGxheU5hbWVcIl0gfHwgY2VsbEFjbC5Hcm91cC5Hcm91cExhYmVsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJ0ZWFtXCI6XG4gICAgICAgICAgICAgICAgaWYgKCFjZWxsQWNsLlJvbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBcIk5vIHJvbGUgZm91bmRcIjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IGNlbGxBY2wuUm9sZS5MYWJlbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGxhYmVsID0gY2VsbEFjbC5Sb2xlSWQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlYWQgPSBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRlID0gZmFsc2U7XG4gICAgICAgIGNlbGxBY2wuQWN0aW9ucy5tYXAoZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgICAgICAgaWYgKGFjdGlvbi5OYW1lID09PSAncmVhZCcpIHJlYWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGFjdGlvbi5OYW1lID09PSAnd3JpdGUnKSB3cml0ZSA9IHRydWU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgX1VzZXJCYWRnZTJbJ2RlZmF1bHQnXSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgICAgICAgICAgYXZhdGFyOiBhdmF0YXIsXG4gICAgICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgICAgICBtZW51czogbWVudUl0ZW1zXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICd1c2VyLWJhZGdlLXJpZ2h0cy1jb250YWluZXInLCBzdHlsZTogIW1lbnVJdGVtcy5sZW5ndGggPyB7IG1hcmdpblJpZ2h0OiA0OCB9IDoge30gfSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHsgdHlwZTogJ2NoZWNrYm94JywgbmFtZTogJ3JlYWQnLCBkaXNhYmxlZDogdGhpcy5wcm9wcy5pc1JlYWRvbmx5KCkgfHwgdGhpcy5wcm9wcy5yZWFkb25seSwgY2hlY2tlZDogcmVhZCwgb25DaGFuZ2U6IHRoaXMub25VcGRhdGVSaWdodCB9KSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHsgdHlwZTogJ2NoZWNrYm94JywgbmFtZTogJ3dyaXRlJywgZGlzYWJsZWQ6IHRoaXMucHJvcHMuaXNSZWFkb25seSgpIHx8IHRoaXMucHJvcHMucmVhZG9ubHksIGNoZWNrZWQ6IHdyaXRlLCBvbkNoYW5nZTogdGhpcy5vblVwZGF0ZVJpZ2h0IH0pXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFNoYXJlZFVzZXJFbnRyeSA9ICgwLCBfU2hhcmVDb250ZXh0Q29uc3VtZXIyWydkZWZhdWx0J10pKFNoYXJlZFVzZXJFbnRyeSk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBTaGFyZWRVc2VyRW50cnk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIgPSByZXF1aXJlKCcuLi9TaGFyZUNvbnRleHRDb25zdW1lcicpO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1NoYXJlQ29udGV4dENvbnN1bWVyKTtcblxudmFyIF9TaGFyZWRVc2VyRW50cnkgPSByZXF1aXJlKCcuL1NoYXJlZFVzZXJFbnRyeScpO1xuXG52YXIgX1NoYXJlZFVzZXJFbnRyeTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TaGFyZWRVc2VyRW50cnkpO1xuXG52YXIgX21haW5BY3Rpb25CdXR0b24gPSByZXF1aXJlKCcuLi9tYWluL0FjdGlvbkJ1dHRvbicpO1xuXG52YXIgX21haW5BY3Rpb25CdXR0b24yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpbkFjdGlvbkJ1dHRvbik7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2NvbXBvbmVudHMnKTtcblxudmFyIFVzZXJzQ29tcGxldGVyID0gX1B5ZGlvJHJlcXVpcmVMaWIuVXNlcnNDb21wbGV0ZXI7XG5cbnZhciBTaGFyZWRVc2VycyA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdTaGFyZWRVc2VycycsXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgcHlkaW86IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuaW5zdGFuY2VPZihfcHlkaW8yWydkZWZhdWx0J10pLFxuXG4gICAgICAgIGNlbGxBY2xzOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm9iamVjdCxcblxuICAgICAgICBzYXZlU2VsZWN0aW9uQXNUZWFtOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIHNlbmRJbnZpdGF0aW9uczogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jLFxuICAgICAgICBzaG93VGl0bGU6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuYm9vbCxcblxuICAgICAgICBvblVzZXJPYmplY3RBZGQ6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICBvblVzZXJPYmplY3RSZW1vdmU6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICBvblVzZXJPYmplY3RVcGRhdGVSaWdodDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWRcblxuICAgIH0sXG4gICAgc2VuZEludml0YXRpb25Ub0FsbFVzZXJzOiBmdW5jdGlvbiBzZW5kSW52aXRhdGlvblRvQWxsVXNlcnMoKSB7XG4gICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgY2VsbEFjbHMgPSBfcHJvcHMuY2VsbEFjbHM7XG4gICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcblxuICAgICAgICB2YXIgdXNlck9iamVjdHMgPSBbXTtcbiAgICAgICAgT2JqZWN0LmtleXMoY2VsbEFjbHMpLm1hcChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgdmFyIGFjbCA9IGNlbGxBY2xzW2tdO1xuICAgICAgICAgICAgaWYgKGFjbC5Vc2VyICYmIGFjbC5Vc2VyLkxvZ2luID09PSBweWRpby51c2VyLmlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFjbC5Vc2VyKSB7XG4gICAgICAgICAgICAgICAgdmFyIHVzZXJPYmplY3QgPSBQeWRpb1VzZXJzLlVzZXIuZnJvbUlkbVVzZXIoYWNsLlVzZXIpO1xuICAgICAgICAgICAgICAgIHVzZXJPYmplY3RzW3VzZXJPYmplY3QuZ2V0SWQoKV0gPSB1c2VyT2JqZWN0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wcm9wcy5zZW5kSW52aXRhdGlvbnModXNlck9iamVjdHMpO1xuICAgIH0sXG4gICAgY2xlYXJBbGxVc2VyczogZnVuY3Rpb24gY2xlYXJBbGxVc2VycygpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLnByb3BzLmNlbGxBY2xzKS5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgIF90aGlzLnByb3BzLm9uVXNlck9iamVjdFJlbW92ZShrKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICB2YWx1ZVNlbGVjdGVkOiBmdW5jdGlvbiB2YWx1ZVNlbGVjdGVkKHVzZXJPYmplY3QpIHtcbiAgICAgICAgaWYgKHVzZXJPYmplY3QuSWRtVXNlcikge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblVzZXJPYmplY3RBZGQodXNlck9iamVjdC5JZG1Vc2VyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25Vc2VyT2JqZWN0QWRkKHVzZXJPYmplY3QuSWRtUm9sZSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBjZWxsQWNscyA9IF9wcm9wczIuY2VsbEFjbHM7XG4gICAgICAgIHZhciBweWRpbyA9IF9wcm9wczIucHlkaW87XG5cbiAgICAgICAgdmFyIGF1dGhDb25maWdzID0gcHlkaW8uZ2V0UGx1Z2luQ29uZmlncygnY29yZS5hdXRoJyk7XG4gICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgIHZhciB1c2VyRW50cmllcyA9IFtdO1xuICAgICAgICBPYmplY3Qua2V5cyhjZWxsQWNscykubWFwKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICB2YXIgYWNsID0gY2VsbEFjbHNba107XG4gICAgICAgICAgICBpZiAoYWNsLlVzZXIgJiYgYWNsLlVzZXIuTG9naW4gPT09IHB5ZGlvLnVzZXIuaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgdXNlckVudHJpZXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfU2hhcmVkVXNlckVudHJ5MlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgY2VsbEFjbDogYWNsLFxuICAgICAgICAgICAgICAgIGtleTogaW5kZXgsXG4gICAgICAgICAgICAgICAgcHlkaW86IF90aGlzMi5wcm9wcy5weWRpbyxcbiAgICAgICAgICAgICAgICByZWFkb25seTogX3RoaXMyLnByb3BzLnJlYWRvbmx5LFxuICAgICAgICAgICAgICAgIHNlbmRJbnZpdGF0aW9uczogX3RoaXMyLnByb3BzLnNlbmRJbnZpdGF0aW9ucyxcbiAgICAgICAgICAgICAgICBvblVzZXJPYmplY3RSZW1vdmU6IF90aGlzMi5wcm9wcy5vblVzZXJPYmplY3RSZW1vdmUsXG4gICAgICAgICAgICAgICAgb25Vc2VyT2JqZWN0VXBkYXRlUmlnaHQ6IF90aGlzMi5wcm9wcy5vblVzZXJPYmplY3RVcGRhdGVSaWdodFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgYWN0aW9uTGlua3MgPSBbXTtcbiAgICAgICAgdmFyIGFjbHNMZW5ndGggPSBPYmplY3Qua2V5cyh0aGlzLnByb3BzLmNlbGxBY2xzKS5sZW5ndGg7XG4gICAgICAgIGlmIChhY2xzTGVuZ3RoICYmICF0aGlzLnByb3BzLmlzUmVhZG9ubHkoKSAmJiAhdGhpcy5wcm9wcy5yZWFkb25seSkge1xuICAgICAgICAgICAgYWN0aW9uTGlua3MucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWFpbkFjdGlvbkJ1dHRvbjJbJ2RlZmF1bHQnXSwgeyBrZXk6ICdjbGVhcicsIGNhbGxiYWNrOiB0aGlzLmNsZWFyQWxsVXNlcnMsIHRvb2x0aXBQb3NpdGlvbjogXCJ0b3AtY2VudGVyXCIsIG1kaUljb246ICdkZWxldGUnLCBtZXNzYWdlSWQ6ICcxODAnIH0pKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYWNsc0xlbmd0aCAmJiB0aGlzLnByb3BzLnNlbmRJbnZpdGF0aW9ucykge1xuICAgICAgICAgICAgYWN0aW9uTGlua3MucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWFpbkFjdGlvbkJ1dHRvbjJbJ2RlZmF1bHQnXSwgeyBrZXk6ICdpbnZpdGUnLCBjYWxsYmFjazogdGhpcy5zZW5kSW52aXRhdGlvblRvQWxsVXNlcnMsIHRvb2x0aXBQb3NpdGlvbjogXCJ0b3AtY2VudGVyXCIsIG1kaUljb246ICdlbWFpbC1vdXRsaW5lJywgbWVzc2FnZUlkOiAnNDUnIH0pKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wcm9wcy5zYXZlU2VsZWN0aW9uQXNUZWFtICYmIGFjbHNMZW5ndGggPiAxICYmICF0aGlzLnByb3BzLmlzUmVhZG9ubHkoKSAmJiAhdGhpcy5wcm9wcy5yZWFkb25seSkge1xuICAgICAgICAgICAgYWN0aW9uTGlua3MucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWFpbkFjdGlvbkJ1dHRvbjJbJ2RlZmF1bHQnXSwgeyBrZXk6ICd0ZWFtJywgY2FsbGJhY2s6IHRoaXMucHJvcHMuc2F2ZVNlbGVjdGlvbkFzVGVhbSwgbWRpSWNvbjogJ2FjY291bnQtbXVsdGlwbGUtcGx1cycsIHRvb2x0aXBQb3NpdGlvbjogXCJ0b3AtY2VudGVyXCIsIG1lc3NhZ2VJZDogJzUwOScsIG1lc3NhZ2VDb3JlTmFtZXNwYWNlOiB0cnVlIH0pKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcndIZWFkZXIgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICB1c2Vyc0lucHV0ID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodXNlckVudHJpZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByd0hlYWRlciA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBtYXJnaW5Cb3R0b206IC04LCBtYXJnaW5Ub3A6IC04LCBjb2xvcjogJ3JnYmEoMCwwLDAsLjMzKScsIGZvbnRTaXplOiAxMiB9IH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsgc3R5bGU6IHsgZmxleDogMSB9IH0pLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogNDMsIHRleHRBbGlnbjogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgYm9yZGVyQm90dG9tOiAnMnB4IHNvbGlkIHJnYmEoMCwwLDAsMC4xMyknIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMzYxJywgJycpXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogNDMsIHRleHRBbGlnbjogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgYm9yZGVyQm90dG9tOiAnMnB4IHNvbGlkIHJnYmEoMCwwLDAsMC4xMyknIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTgxJylcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsgc3R5bGU6IHsgd2lkdGg6IDUyIH0gfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmlzUmVhZG9ubHkoKSAmJiAhdGhpcy5wcm9wcy5yZWFkb25seSkge1xuICAgICAgICAgICAgdmFyIGV4Y2x1ZGVzID0gT2JqZWN0LnZhbHVlcyhjZWxsQWNscykubWFwKGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICAgICAgaWYgKGEuVXNlcikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYS5Vc2VyLkxvZ2luO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYS5Hcm91cCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYS5Hcm91cC5VdWlkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYS5Sb2xlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhLlJvbGUuVXVpZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5maWx0ZXIoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gISFrO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB1c2Vyc0lucHV0ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoVXNlcnNDb21wbGV0ZXIsIHtcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdzaGFyZS1mb3JtLXVzZXJzJyxcbiAgICAgICAgICAgICAgICBmaWVsZExhYmVsOiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzM0JyksXG4gICAgICAgICAgICAgICAgb25WYWx1ZVNlbGVjdGVkOiB0aGlzLnZhbHVlU2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgcHlkaW86IHRoaXMucHJvcHMucHlkaW8sXG4gICAgICAgICAgICAgICAgc2hvd0FkZHJlc3NCb29rOiB0cnVlLFxuICAgICAgICAgICAgICAgIHVzZXJzRnJvbTogJ2xvY2FsJyxcbiAgICAgICAgICAgICAgICBleGNsdWRlczogZXhjbHVkZXMsXG4gICAgICAgICAgICAgICAgZXhpc3RpbmdPbmx5OiAhYXV0aENvbmZpZ3MuZ2V0KCdVU0VSX0NSRUFURV9VU0VSUycpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHVzZXJFbnRyaWVzLmxlbmd0aCA/IHsgbWFyZ2luOiAnLTIwcHggOHB4IDE2cHgnIH0gOiB7IG1hcmdpblRvcDogLTIwIH0gfSxcbiAgICAgICAgICAgICAgICB1c2Vyc0lucHV0XG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgcndIZWFkZXIsXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIHVzZXJFbnRyaWVzXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgIXVzZXJFbnRyaWVzLmxlbmd0aCAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGNvbG9yOiAncmdiYSgwLDAsMCwwLjQzKScgfSB9LFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTgyJylcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICB1c2VyRW50cmllcy5sZW5ndGggPiAwICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgdGV4dEFsaWduOiAnY2VudGVyJyB9IH0sXG4gICAgICAgICAgICAgICAgYWN0aW9uTGlua3NcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gU2hhcmVkVXNlcnMgPSAoMCwgX1NoYXJlQ29udGV4dENvbnN1bWVyMlsnZGVmYXVsdCddKShTaGFyZWRVc2Vycyk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBTaGFyZWRVc2Vycztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgQ29tcG9uZW50ID0gX3JlcXVpcmUuQ29tcG9uZW50O1xudmFyIFByb3BUeXBlcyA9IF9yZXF1aXJlLlByb3BUeXBlcztcblxudmFyIF9yZXF1aXJlMiA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBNZW51SXRlbSA9IF9yZXF1aXJlMi5NZW51SXRlbTtcbnZhciBJY29uTWVudSA9IF9yZXF1aXJlMi5JY29uTWVudTtcbnZhciBJY29uQnV0dG9uID0gX3JlcXVpcmUyLkljb25CdXR0b247XG5cbnZhciBfcmVxdWlyZTMgPSByZXF1aXJlKCdtYXRlcmlhbC11aS9zdHlsZXMnKTtcblxudmFyIG11aVRoZW1lYWJsZSA9IF9yZXF1aXJlMy5tdWlUaGVtZWFibGU7XG5cbnZhciBDb2xvciA9IHJlcXVpcmUoJ2NvbG9yJyk7XG5cbnZhciBVc2VyQmFkZ2UgPSAoZnVuY3Rpb24gKF9Db21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoVXNlckJhZGdlLCBfQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFVzZXJCYWRnZSgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFVzZXJCYWRnZSk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoVXNlckJhZGdlLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFVzZXJCYWRnZSwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyTWVudScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXJNZW51KCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnByb3BzLm1lbnVzIHx8ICF0aGlzLnByb3BzLm1lbnVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG1lbnVJdGVtcyA9IHRoaXMucHJvcHMubWVudXMubWFwKGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJpZ2h0SWNvbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBpZiAobS5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0SWNvbiA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ21kaSBtZGktY2hlY2snIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChNZW51SXRlbSwge1xuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5VGV4dDogbS50ZXh0LFxuICAgICAgICAgICAgICAgICAgICBvblRvdWNoVGFwOiBtLmNhbGxiYWNrLFxuICAgICAgICAgICAgICAgICAgICByaWdodEljb246IHJpZ2h0SWNvbiB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGljb25TdHlsZSA9IHsgZm9udFNpemU6IDE4IH07XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBJY29uTWVudSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGljb25CdXR0b25FbGVtZW50OiBSZWFjdC5jcmVhdGVFbGVtZW50KEljb25CdXR0b24sIHsgc3R5bGU6IHsgcGFkZGluZzogMTYgfSwgaWNvblN0eWxlOiBpY29uU3R5bGUsIGljb25DbGFzc05hbWU6ICdpY29uLWVsbGlwc2lzLXZlcnRpY2FsJyB9KSxcbiAgICAgICAgICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiB7IGhvcml6b250YWw6ICdyaWdodCcsIHZlcnRpY2FsOiAndG9wJyB9LFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRPcmlnaW46IHsgaG9yaXpvbnRhbDogJ3JpZ2h0JywgdmVydGljYWw6ICd0b3AnIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG1lbnVJdGVtc1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBhdmF0YXIgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgYXZhdGFyQ29sb3IgPSB0aGlzLnByb3BzLm11aVRoZW1lLnBhbGV0dGUuYXZhdGFyc0NvbG9yO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMudHlwZSA9PSAnZ3JvdXAnKSB7XG4gICAgICAgICAgICAgICAgYXZhdGFyQ29sb3IgPSBDb2xvcihhdmF0YXJDb2xvcikuZGFya2VuKC4yKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIGF2YXRhciA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ2F2YXRhciBtZGkgbWRpLWFjY291bnQtbXVsdGlwbGUnLCBzdHlsZTogeyBiYWNrZ3JvdW5kQ29sb3I6IGF2YXRhckNvbG9yIH0gfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMudHlwZSA9PSAndGVhbScpIHtcbiAgICAgICAgICAgICAgICBhdmF0YXJDb2xvciA9IENvbG9yKGF2YXRhckNvbG9yKS5kYXJrZW4oLjIpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgYXZhdGFyID0gUmVhY3QuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnYXZhdGFyIG1kaSBtZGktYWNjb3VudC1tdWx0aXBsZS1vdXRsaW5lJywgc3R5bGU6IHsgYmFja2dyb3VuZENvbG9yOiBhdmF0YXJDb2xvciB9IH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnR5cGUgPT0gJ3RlbXBvcmFyeScpIHtcbiAgICAgICAgICAgICAgICBhdmF0YXJDb2xvciA9IENvbG9yKGF2YXRhckNvbG9yKS5saWdodGVuKC4yKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIGF2YXRhciA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ2F2YXRhciBtZGkgbWRpLWFjY291bnQtcGx1cycsIHN0eWxlOiB7IGJhY2tncm91bmRDb2xvcjogYXZhdGFyQ29sb3IgfSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy50eXBlID09ICdyZW1vdGVfdXNlcicpIHtcbiAgICAgICAgICAgICAgICBhdmF0YXIgPSBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdhdmF0YXIgbWRpIG1kaS1hY2NvdW50LW5ldHdvcmsnLCBzdHlsZTogeyBiYWNrZ3JvdW5kQ29sb3I6IGF2YXRhckNvbG9yIH0gfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGF2YXRhciA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ2F2YXRhciBtZGkgbWRpLWFjY291bnQnLCBzdHlsZTogeyBiYWNrZ3JvdW5kQ29sb3I6IGF2YXRhckNvbG9yIH0gfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbWVudSA9IHRoaXMucmVuZGVyTWVudSgpO1xuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IFwic2hhcmUtZGlhbG9nIHVzZXItYmFkZ2UgdXNlci10eXBlLVwiICsgdGhpcy5wcm9wcy50eXBlIH0sXG4gICAgICAgICAgICAgICAgYXZhdGFyLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICd1c2VyLWJhZGdlLWxhYmVsJyB9LFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmxhYmVsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNoaWxkcmVuLFxuICAgICAgICAgICAgICAgIG1lbnVcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gVXNlckJhZGdlO1xufSkoQ29tcG9uZW50KTtcblxuVXNlckJhZGdlLnByb3BUeXBlcyA9IHtcbiAgICBsYWJlbDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBhdmF0YXI6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgdHlwZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBtZW51czogUHJvcFR5cGVzLm9iamVjdCxcbiAgICBtdWlUaGVtZTogUHJvcFR5cGVzLm9iamVjdFxufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gVXNlckJhZGdlID0gbXVpVGhlbWVhYmxlKCkoVXNlckJhZGdlKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gVXNlckJhZGdlO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoXCJyZWFjdFwiKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfQ29tcG9zaXRlTW9kZWwgPSByZXF1aXJlKCcuL0NvbXBvc2l0ZU1vZGVsJyk7XG5cbnZhciBfQ29tcG9zaXRlTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfQ29tcG9zaXRlTW9kZWwpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlciA9IHJlcXVpcmUoJy4uL21haW4vU2hhcmVIZWxwZXInKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9jZWxsc1NoYXJlZFVzZXJzID0gcmVxdWlyZSgnLi4vY2VsbHMvU2hhcmVkVXNlcnMnKTtcblxudmFyIF9jZWxsc1NoYXJlZFVzZXJzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NlbGxzU2hhcmVkVXNlcnMpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfbWF0ZXJpYWxVaVN0eWxlcyA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpL3N0eWxlcycpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgQ2VsbHNMaXN0ID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKENlbGxzTGlzdCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBDZWxsc0xpc3QocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENlbGxzTGlzdCk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoQ2VsbHNMaXN0LnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0geyBlZGl0OiBudWxsIH07XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKENlbGxzTGlzdCwgW3tcbiAgICAgICAga2V5OiAnYWRkVG9DZWxsc01lbnVJdGVtcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRUb0NlbGxzTWVudUl0ZW1zKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XG4gICAgICAgICAgICAvLyBMaXN0IHVzZXIgYXZhaWxhYmxlIGNlbGxzIC0gRXhjbHVkZSBjZWxscyB3aGVyZSB0aGlzIG5vZGUgaXMgYWxyZWFkeSBzaGFyZWRcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIGNvbXBvc2l0ZU1vZGVsID0gX3Byb3BzLmNvbXBvc2l0ZU1vZGVsO1xuXG4gICAgICAgICAgICB2YXIgY3VycmVudENlbGxzID0gY29tcG9zaXRlTW9kZWwuZ2V0Q2VsbHMoKS5tYXAoZnVuY3Rpb24gKGNlbGxNb2RlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjZWxsTW9kZWwuZ2V0VXVpZCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBweWRpby51c2VyLmdldFJlcG9zaXRvcmllc0xpc3QoKS5mb3JFYWNoKGZ1bmN0aW9uIChyZXBvc2l0b3J5KSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlcG9zaXRvcnkuZ2V0T3duZXIoKSA9PT0gJ3NoYXJlZCcgJiYgY3VycmVudENlbGxzLmluZGV4T2YocmVwb3NpdG9yeS5nZXRJZCgpKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRvdWNoVGFwID0gZnVuY3Rpb24gdG91Y2hUYXAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGFkZE1lbnVPcGVuOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvc2l0ZU1vZGVsLmFkZFRvRXhpc3RpbmdDZWxsKHJlcG9zaXRvcnkuZ2V0SWQoKSk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgcHJpbWFyeVRleHQ6IHJlcG9zaXRvcnkuZ2V0TGFiZWwoKSwgb25Ub3VjaFRhcDogdG91Y2hUYXAgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBjb21wb3NpdGVNb2RlbCA9IF9wcm9wczIuY29tcG9zaXRlTW9kZWw7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMyLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIHVzZXJzSW52aXRhdGlvbnMgPSBfcHJvcHMyLnVzZXJzSW52aXRhdGlvbnM7XG4gICAgICAgICAgICB2YXIgbXVpVGhlbWUgPSBfcHJvcHMyLm11aVRoZW1lO1xuXG4gICAgICAgICAgICB2YXIgbSA9IGZ1bmN0aW9uIG0oaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci4nICsgaWRdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciBlZGl0ID0gdGhpcy5zdGF0ZS5lZGl0O1xuXG4gICAgICAgICAgICB2YXIgY2VsbHMgPSBbXTtcbiAgICAgICAgICAgIGNvbXBvc2l0ZU1vZGVsLmdldENlbGxzKCkubWFwKGZ1bmN0aW9uIChjZWxsTW9kZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWwgPSBjZWxsTW9kZWwuZ2V0TGFiZWwoKTtcbiAgICAgICAgICAgICAgICB2YXIgaXNFZGl0ID0gIWNlbGxNb2RlbC5nZXRVdWlkKCkgJiYgZWRpdCA9PT0gJ05FV0NFTEwnIHx8IGVkaXQgPT09IGNlbGxNb2RlbC5nZXRVdWlkKCk7XG4gICAgICAgICAgICAgICAgdmFyIHRvZ2dsZVN0YXRlID0gZnVuY3Rpb24gdG9nZ2xlU3RhdGUoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0VkaXQgJiYgZWRpdCA9PT0gJ05FV0NFTEwnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgbmV3IGNlbGwgaWYgaXQgd2FzIGNyZWF0ZWQgZW1wdHlcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhY2xzID0gY2VsbE1vZGVsLmdldEFjbHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghT2JqZWN0LmtleXMoYWNscykubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9zaXRlTW9kZWwucmVtb3ZlTmV3Q2VsbChjZWxsTW9kZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IGVkaXQ6IGlzRWRpdCA/IG51bGwgOiBjZWxsTW9kZWwuZ2V0VXVpZCgpIH0pO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB2YXIgcmVtb3ZlTm9kZSA9IGZ1bmN0aW9uIHJlbW92ZU5vZGUoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNlbGxNb2RlbC5yZW1vdmVSb290Tm9kZShjb21wb3NpdGVNb2RlbC5nZXROb2RlKCkuZ2V0TWV0YWRhdGEoKS5nZXQoJ3V1aWQnKSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB2YXIgcmlnaHRJY29uID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGlmIChpc0VkaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmlnaHRJY29uID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBpY29uQ2xhc3NOYW1lOiBcIm1kaSBtZGktY2xvc2VcIiwgdG9vbHRpcDogcHlkaW8uTWVzc2FnZUhhc2hbJzg2J10sIG9uVG91Y2hUYXA6IHRvZ2dsZVN0YXRlIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2VsbE1vZGVsLmlzRWRpdGFibGUoKSkge1xuICAgICAgICAgICAgICAgICAgICByaWdodEljb24gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLkljb25NZW51LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25CdXR0b25FbGVtZW50OiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1kb3RzLXZlcnRpY2FsXCIgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiB7IGhvcml6b250YWw6ICdyaWdodCcsIHZlcnRpY2FsOiAndG9wJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE9yaWdpbjogeyBob3Jpem9udGFsOiAncmlnaHQnLCB2ZXJ0aWNhbDogJ3RvcCcgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHByaW1hcnlUZXh0OiBtKDI1OCksIG9uVG91Y2hUYXA6IHRvZ2dsZVN0YXRlIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgcHJpbWFyeVRleHQ6IG0oMjU5KSwgb25Ub3VjaFRhcDogcmVtb3ZlTm9kZSB9KVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjZWxscy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkxpc3RJdGVtLCB7XG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlUZXh0OiBsYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5VGV4dDogY2VsbE1vZGVsLmdldEFjbHNTdWJqZWN0cygpLFxuICAgICAgICAgICAgICAgICAgICByaWdodEljb25CdXR0b246IHJpZ2h0SWNvbixcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFRhcDogdG9nZ2xlU3RhdGUsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiBpc0VkaXQgPyB7IGJhY2tncm91bmRDb2xvcjogJ3JnYigyNDUsIDI0NSwgMjQ1KScgfSA6IHt9LFxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogZWRpdCA9PT0gJ05FV0NFTEwnICYmICFpc0VkaXRcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgaWYgKGlzRWRpdCkge1xuICAgICAgICAgICAgICAgICAgICBjZWxscy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUGFwZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHpEZXB0aDogMCwgc3R5bGU6IHsgYmFja2dyb3VuZENvbG9yOiAncmdiKDI0NSwgMjQ1LCAyNDUpJywgbWFyZ2luOiAnMCAwIDE2cHgnLCBwYWRkaW5nOiAnMCAxMHB4IDEwcHgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9jZWxsc1NoYXJlZFVzZXJzMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW86IHB5ZGlvLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNlbGxBY2xzOiBjZWxsTW9kZWwuZ2V0QWNscygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4Y2x1ZGVzOiBbcHlkaW8udXNlci5pZF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Vc2VyT2JqZWN0QWRkOiBjZWxsTW9kZWwuYWRkVXNlci5iaW5kKGNlbGxNb2RlbCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Vc2VyT2JqZWN0UmVtb3ZlOiBjZWxsTW9kZWwucmVtb3ZlVXNlci5iaW5kKGNlbGxNb2RlbCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Vc2VyT2JqZWN0VXBkYXRlUmlnaHQ6IGNlbGxNb2RlbC51cGRhdGVVc2VyUmlnaHQuYmluZChjZWxsTW9kZWwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRJbnZpdGF0aW9uczogZnVuY3Rpb24gKHRhcmdldFVzZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB1c2Vyc0ludml0YXRpb25zKHRhcmdldFVzZXJzLCBjZWxsTW9kZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZVNlbGVjdGlvbkFzVGVhbTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhZG9ubHk6ICFjZWxsTW9kZWwuaXNFZGl0YWJsZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2VsbHMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5EaXZpZGVyLCBudWxsKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNlbGxzLnBvcCgpO1xuXG4gICAgICAgICAgICB2YXIgbGVnZW5kID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKGNlbGxzLmxlbmd0aCAmJiBlZGl0ICE9PSAnTkVXQ0VMTCcpIHtcbiAgICAgICAgICAgICAgICBsZWdlbmQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIG0oMjYwKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNlbGxzLmxlbmd0aCAmJiBlZGl0ID09PSAnTkVXQ0VMTCcpIHtcbiAgICAgICAgICAgICAgICBsZWdlbmQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIG0oMjYxKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxlZ2VuZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAnMjFweCAxNnB4IDIxcHggMHB4JywgY3Vyc29yOiAncG9pbnRlcicsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicgfSwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvc2l0ZU1vZGVsLmNyZWF0ZUVtcHR5Q2VsbCgpO190aGlzMi5zZXRTdGF0ZSh7IGVkaXQ6ICdORVdDRUxMJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBpY29uQ2xhc3NOYW1lOiBcImljb21vb24tY2VsbHMtY2xlYXItcGx1c1wiLCBpY29uU3R5bGU6IHsgY29sb3I6IG11aVRoZW1lLnBhbGV0dGUucHJpbWFyeTFDb2xvciB9IH0pLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgbWFyZ2luTGVmdDogOCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtKDI2MilcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBhZGRDZWxsSXRlbXMgPSB0aGlzLmFkZFRvQ2VsbHNNZW51SXRlbXMoKTtcbiAgICAgICAgICAgIHZhciBhZGRUb0NlbGxNZW51ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKGFkZENlbGxJdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBhZGRUb0NlbGxNZW51ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuUmFpc2VkQnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBtYXJnaW5MZWZ0OiAxMCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBtKDI2MyksXG4gICAgICAgICAgICAgICAgICAgICAgICBvblRvdWNoVGFwOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBhZGRNZW51T3BlbjogdHJ1ZSwgYWRkTWVudUFuY2hvcjogZXZlbnQudGFyZ2V0IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5Qb3BvdmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46IHRoaXMuc3RhdGUuYWRkTWVudU9wZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5jaG9yRWw6IHRoaXMuc3RhdGUuYWRkTWVudUFuY2hvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblJlcXVlc3RDbG9zZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBhZGRNZW51T3BlbjogZmFsc2UgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmNob3JPcmlnaW46IHsgaG9yaXpvbnRhbDogJ2xlZnQnLCB2ZXJ0aWNhbDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRPcmlnaW46IHsgaG9yaXpvbnRhbDogJ2xlZnQnLCB2ZXJ0aWNhbDogJ3RvcCcgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLk1lbnUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRDZWxsSXRlbXNcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBhdXRoID0gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5nZXRBdXRob3JpemF0aW9ucyhweWRpbyk7XG4gICAgICAgICAgICBpZiAoY29tcG9zaXRlTW9kZWwuZ2V0Tm9kZSgpKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vZGVMZWFmID0gY29tcG9zaXRlTW9kZWwuZ2V0Tm9kZSgpLmlzTGVhZigpO1xuICAgICAgICAgICAgICAgIHZhciBjYW5TaGFyZSA9IG5vZGVMZWFmICYmIGF1dGguZmlsZV93b3Jrc3BhY2VzIHx8ICFub2RlTGVhZiAmJiBhdXRoLmZvbGRlcl93b3Jrc3BhY2VzO1xuICAgICAgICAgICAgICAgIGlmICghY2FuU2hhcmUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogNTAwLCBjb2xvcjogJ3JnYmEoMCwgMCwgMCwgMC40MyknLCBwYWRkaW5nOiA4IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0obm9kZUxlYWYgPyAnMjI3JyA6ICcyMjgnKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHRoaXMucHJvcHMuc3R5bGUgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZ0JvdHRvbTogMjAgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWlzZWRCdXR0b24sIHsgbGFiZWw6IG0oMjY0KSwgcHJpbWFyeTogdHJ1ZSwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvc2l0ZU1vZGVsLmNyZWF0ZUVtcHR5Q2VsbCgpO190aGlzMi5zZXRTdGF0ZSh7IGVkaXQ6ICdORVdDRUxMJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gfSksXG4gICAgICAgICAgICAgICAgICAgIGFkZFRvQ2VsbE1lbnVcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmb250U2l6ZTogMTMsIGZvbnRXZWlnaHQ6IDUwMCwgY29sb3I6ICdyZ2JhKDAsIDAsIDAsIDAuNDMpJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIGxlZ2VuZFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLkxpc3QsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGNlbGxzXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBDZWxsc0xpc3Q7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuQ2VsbHNMaXN0LlByb3BUeXBlcyA9IHtcbiAgICBweWRpbzogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKF9weWRpbzJbJ2RlZmF1bHQnXSksXG4gICAgY29tcG9zaXRlTW9kZWw6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuaW5zdGFuY2VPZihfQ29tcG9zaXRlTW9kZWwyWydkZWZhdWx0J10pLmlzUmVxdWlyZWQsXG4gICAgdXNlcnNJbnZpdGF0aW9uczogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jXG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBDZWxsc0xpc3QgPSAoMCwgX21hdGVyaWFsVWlTdHlsZXMubXVpVGhlbWVhYmxlKSgpKENlbGxzTGlzdCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IENlbGxzTGlzdDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX21haW5HZW5lcmljQ2FyZCA9IHJlcXVpcmUoJy4uL21haW4vR2VuZXJpY0NhcmQnKTtcblxudmFyIF9jb21wb3NpdGVDb21wb3NpdGVNb2RlbCA9IHJlcXVpcmUoJy4uL2NvbXBvc2l0ZS9Db21wb3NpdGVNb2RlbCcpO1xuXG52YXIgX2NvbXBvc2l0ZUNvbXBvc2l0ZU1vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbXBvc2l0ZUNvbXBvc2l0ZU1vZGVsKTtcblxudmFyIF9tYWluR2VuZXJpY0VkaXRvciA9IHJlcXVpcmUoJy4uL21haW4vR2VuZXJpY0VkaXRvcicpO1xuXG52YXIgX21haW5HZW5lcmljRWRpdG9yMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21haW5HZW5lcmljRWRpdG9yKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX2xpbmtzUGFuZWwgPSByZXF1aXJlKCcuLi9saW5rcy9QYW5lbCcpO1xuXG52YXIgX2xpbmtzUGFuZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbGlua3NQYW5lbCk7XG5cbnZhciBfbGlua3NTZWN1cmVPcHRpb25zID0gcmVxdWlyZSgnLi4vbGlua3MvU2VjdXJlT3B0aW9ucycpO1xuXG52YXIgX2xpbmtzU2VjdXJlT3B0aW9uczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9saW5rc1NlY3VyZU9wdGlvbnMpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlciA9IHJlcXVpcmUoJy4uL21haW4vU2hhcmVIZWxwZXInKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9NYWlsZXIgPSByZXF1aXJlKCcuL01haWxlcicpO1xuXG52YXIgX01haWxlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9NYWlsZXIpO1xuXG52YXIgX0NlbGxzTGlzdCA9IHJlcXVpcmUoJy4vQ2VsbHNMaXN0Jyk7XG5cbnZhciBfQ2VsbHNMaXN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NlbGxzTGlzdCk7XG5cbnZhciBfY2xpcGJvYXJkID0gcmVxdWlyZSgnY2xpcGJvYXJkJyk7XG5cbnZhciBfY2xpcGJvYXJkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NsaXBib2FyZCk7XG5cbnZhciBfbGlua3NQdWJsaWNMaW5rVGVtcGxhdGUgPSByZXF1aXJlKCcuLi9saW5rcy9QdWJsaWNMaW5rVGVtcGxhdGUnKTtcblxudmFyIF9saW5rc1B1YmxpY0xpbmtUZW1wbGF0ZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9saW5rc1B1YmxpY0xpbmtUZW1wbGF0ZSk7XG5cbnZhciBfbGlua3NWaXNpYmlsaXR5UGFuZWwgPSByZXF1aXJlKCcuLi9saW5rcy9WaXNpYmlsaXR5UGFuZWwnKTtcblxudmFyIF9saW5rc1Zpc2liaWxpdHlQYW5lbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9saW5rc1Zpc2liaWxpdHlQYW5lbCk7XG5cbnZhciBfbGlua3NMYWJlbFBhbmVsID0gcmVxdWlyZSgnLi4vbGlua3MvTGFiZWxQYW5lbCcpO1xuXG52YXIgX2xpbmtzTGFiZWxQYW5lbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9saW5rc0xhYmVsUGFuZWwpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignaG9jJyk7XG5cbnZhciBQYWxldHRlTW9kaWZpZXIgPSBfUHlkaW8kcmVxdWlyZUxpYi5QYWxldHRlTW9kaWZpZXI7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYjIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYihcImJvb3RcIik7XG5cbnZhciBUb29sdGlwID0gX1B5ZGlvJHJlcXVpcmVMaWIyLlRvb2x0aXA7XG5cbnZhciBDb21wb3NpdGVDYXJkID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKENvbXBvc2l0ZUNhcmQsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gQ29tcG9zaXRlQ2FyZChwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ29tcG9zaXRlQ2FyZCk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoQ29tcG9zaXRlQ2FyZC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIG1vZGU6IHRoaXMucHJvcHMubW9kZSB8fCAndmlldycsXG4gICAgICAgICAgICBtb2RlbDogbmV3IF9jb21wb3NpdGVDb21wb3NpdGVNb2RlbDJbJ2RlZmF1bHQnXSh0aGlzLnByb3BzLm1vZGUgPT09ICdlZGl0JylcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoQ29tcG9zaXRlQ2FyZCwgW3tcbiAgICAgICAga2V5OiAnYXR0YWNoQ2xpcGJvYXJkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGF0dGFjaENsaXBib2FyZCgpIHtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IHRoaXMucHJvcHMucHlkaW87XG5cbiAgICAgICAgICAgIHZhciBtID0gZnVuY3Rpb24gbShpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBweWRpby5NZXNzYWdlSGFzaFsnc2hhcmVfY2VudGVyLicgKyBpZF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIG1vZGVsID0gdGhpcy5zdGF0ZS5tb2RlbDtcblxuICAgICAgICAgICAgdGhpcy5kZXRhY2hDbGlwYm9hcmQoKTtcbiAgICAgICAgICAgIGlmICghbW9kZWwuZ2V0TGlua3MoKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbGlua01vZGVsID0gbW9kZWwuZ2V0TGlua3MoKVswXTtcbiAgICAgICAgICAgIGlmICghbGlua01vZGVsLmdldExpbmsoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnJlZnNbJ2NvcHktYnV0dG9uJ10pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGlwID0gbmV3IF9jbGlwYm9hcmQyWydkZWZhdWx0J10odGhpcy5yZWZzWydjb3B5LWJ1dHRvbiddLCB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IChmdW5jdGlvbiAodHJpZ2dlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uYnVpbGRQdWJsaWNVcmwocHlkaW8sIGxpbmtNb2RlbC5nZXRMaW5rKCkuTGlua0hhc2gpO1xuICAgICAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2xpcC5vbignc3VjY2VzcycsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvcHlNZXNzYWdlOiBtKCcxOTInKSB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGNvcHlNZXNzYWdlOiBudWxsIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMjUwMCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2NsaXAub24oJ2Vycm9yJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvcHlNZXNzYWdlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZ2xvYmFsLm5hdmlnYXRvci5wbGF0Zm9ybS5pbmRleE9mKFwiTWFjXCIpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3B5TWVzc2FnZSA9IG0oMTQ0KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcHlNZXNzYWdlID0gbSgxNDMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb3B5TWVzc2FnZTogY29weU1lc3NhZ2UgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgY29weU1lc3NhZ2U6IG51bGwgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAyNTAwKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2RldGFjaENsaXBib2FyZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZXRhY2hDbGlwYm9hcmQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fY2xpcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NsaXAuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBub2RlID0gX3Byb3BzLm5vZGU7XG4gICAgICAgICAgICB2YXIgbW9kZSA9IF9wcm9wcy5tb2RlO1xuXG4gICAgICAgICAgICB0aGlzLnN0YXRlLm1vZGVsLm9ic2VydmUoXCJ1cGRhdGVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzMy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLm1vZGVsLmxvYWQobm9kZSwgbW9kZSA9PT0gJ2luZm9QYW5lbCcpO1xuICAgICAgICAgICAgdGhpcy5hdHRhY2hDbGlwYm9hcmQoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFVubW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLm1vZGVsLnN0b3BPYnNlcnZpbmcoXCJ1cGRhdGVcIik7XG4gICAgICAgICAgICB0aGlzLmRldGFjaENsaXBib2FyZCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnREaWRVcGRhdGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgICAgICAgICAgdGhpcy5hdHRhY2hDbGlwYm9hcmQoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKHByb3BzKSB7XG4gICAgICAgICAgICBpZiAocHJvcHMubm9kZSAmJiAocHJvcHMubm9kZSAhPT0gdGhpcy5wcm9wcy5ub2RlIHx8IHByb3BzLm5vZGUuZ2V0TWV0YWRhdGEoJ3B5ZGlvX3NoYXJlcycpICE9PSB0aGlzLnByb3BzLm5vZGUuZ2V0TWV0YWRhdGEoJ3B5ZGlvX3NoYXJlcycpKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUubW9kZWwubG9hZChwcm9wcy5ub2RlLCBwcm9wcy5tb2RlID09PSAnaW5mb1BhbmVsJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3VzZXJzSW52aXRhdGlvbnMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXNlcnNJbnZpdGF0aW9ucyh1c2VyT2JqZWN0cywgY2VsbE1vZGVsKSB7XG4gICAgICAgICAgICBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLnNlbmRDZWxsSW52aXRhdGlvbih0aGlzLnByb3BzLm5vZGUsIGNlbGxNb2RlbCwgdXNlck9iamVjdHMpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdsaW5rSW52aXRhdGlvbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBsaW5rSW52aXRhdGlvbihsaW5rTW9kZWwpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIG1haWxEYXRhID0gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5wcmVwYXJlRW1haWwodGhpcy5wcm9wcy5ub2RlLCBsaW5rTW9kZWwpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtYWlsZXJEYXRhOiBfZXh0ZW5kcyh7fSwgbWFpbERhdGEsIHsgdXNlcnM6IFtdLCBsaW5rTW9kZWw6IGxpbmtNb2RlbCB9KSB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBhbGVydChlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdkaXNtaXNzTWFpbGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRpc21pc3NNYWlsZXIoKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbWFpbGVyRGF0YTogbnVsbCB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc3VibWl0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5tb2RlbC5zYXZlKCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5weWRpby5VSS5kaXNwbGF5TWVzc2FnZSgnRVJST1InLCBlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBub2RlID0gX3Byb3BzMi5ub2RlO1xuICAgICAgICAgICAgdmFyIG1vZGUgPSBfcHJvcHMyLm1vZGU7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMyLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIGVkaXRvck9uZUNvbHVtbiA9IF9wcm9wczIuZWRpdG9yT25lQ29sdW1uO1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgbW9kZWwgPSBfc3RhdGUubW9kZWw7XG4gICAgICAgICAgICB2YXIgbWFpbGVyRGF0YSA9IF9zdGF0ZS5tYWlsZXJEYXRhO1xuICAgICAgICAgICAgdmFyIGxpbmtUb29sdGlwID0gX3N0YXRlLmxpbmtUb29sdGlwO1xuICAgICAgICAgICAgdmFyIGNvcHlNZXNzYWdlID0gX3N0YXRlLmNvcHlNZXNzYWdlO1xuXG4gICAgICAgICAgICB2YXIgbSA9IGZ1bmN0aW9uIG0oaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci4nICsgaWRdO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKG1vZGUgPT09ICdlZGl0Jykge1xuXG4gICAgICAgICAgICAgICAgdmFyIHB1YmxpY0xpbmtNb2RlbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBpZiAobW9kZWwuZ2V0TGlua3MoKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHVibGljTGlua01vZGVsID0gbW9kZWwuZ2V0TGlua3MoKVswXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGhlYWRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBpZiAocHVibGljTGlua01vZGVsICYmIHB1YmxpY0xpbmtNb2RlbC5nZXRMaW5rVXVpZCgpICYmIHB1YmxpY0xpbmtNb2RlbC5pc0VkaXRhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfTWFpbGVyMlsnZGVmYXVsdCddLCBfZXh0ZW5kcyh7fSwgbWFpbGVyRGF0YSwgeyBweWRpbzogcHlkaW8sIG9uRGlzbWlzczogdGhpcy5kaXNtaXNzTWFpbGVyLmJpbmQodGhpcykgfSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX2xpbmtzTGFiZWxQYW5lbDJbJ2RlZmF1bHQnXSwgeyBweWRpbzogcHlkaW8sIGxpbmtNb2RlbDogcHVibGljTGlua01vZGVsIH0pXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZm9udFNpemU6IDI0LCBwYWRkaW5nOiAnMjZweCAxMHB4IDAgJywgbGluZUhlaWdodDogJzI2cHgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9NYWlsZXIyWydkZWZhdWx0J10sIF9leHRlbmRzKHt9LCBtYWlsZXJEYXRhLCB7IHB5ZGlvOiBweWRpbywgb25EaXNtaXNzOiB0aGlzLmRpc21pc3NNYWlsZXIuYmluZCh0aGlzKSB9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKDI1NikucmVwbGFjZSgnJXMnLCBub2RlLmdldExhYmVsKCkpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciB0YWJzID0geyBsZWZ0OiBbXSwgcmlnaHQ6IFtdLCBsZWZ0U3R5bGU6IHsgcGFkZGluZzogMCB9IH07XG4gICAgICAgICAgICAgICAgdGFicy5yaWdodC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgTGFiZWw6IG0oMjUwKSxcbiAgICAgICAgICAgICAgICAgICAgVmFsdWU6IFwiY2VsbHNcIixcbiAgICAgICAgICAgICAgICAgICAgQ29tcG9uZW50OiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfQ2VsbHNMaXN0MlsnZGVmYXVsdCddLCB7IHB5ZGlvOiBweWRpbywgY29tcG9zaXRlTW9kZWw6IG1vZGVsLCB1c2Vyc0ludml0YXRpb25zOiB0aGlzLnVzZXJzSW52aXRhdGlvbnMuYmluZCh0aGlzKSwgc3R5bGU6IGVkaXRvck9uZUNvbHVtbiA/IHsgcGFkZGluZzogMTAgfSA6IHt9IH0pXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdmFyIGxpbmtzID0gbW9kZWwuZ2V0TGlua3MoKTtcbiAgICAgICAgICAgICAgICBpZiAocHVibGljTGlua01vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhYnMubGVmdC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIExhYmVsOiBtKDI1MSksXG4gICAgICAgICAgICAgICAgICAgICAgICBWYWx1ZTogJ3B1YmxpYy1saW5rJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIENvbXBvbmVudDogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX2xpbmtzUGFuZWwyWydkZWZhdWx0J10sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9zaXRlTW9kZWw6IG1vZGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtNb2RlbDogbGlua3NbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd01haWxlcjogX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5tYWlsZXJTdXBwb3J0ZWQocHlkaW8pID8gdGhpcy5saW5rSW52aXRhdGlvbi5iaW5kKHRoaXMpIDogbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwdWJsaWNMaW5rTW9kZWwuZ2V0TGlua1V1aWQoKSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGF5b3V0RGF0YSA9IF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uY29tcGlsZUxheW91dERhdGEocHlkaW8sIG1vZGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0ZW1wbGF0ZVBhbmUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobGF5b3V0RGF0YS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVQYW5lID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX2xpbmtzUHVibGljTGlua1RlbXBsYXRlMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtNb2RlbDogcHVibGljTGlua01vZGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dERhdGE6IGxheW91dERhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IHBhZGRpbmc6ICcxMHB4IDE2cHgnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRvbmx5OiBtb2RlbC5nZXROb2RlKCkuaXNMZWFmKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRhYnMubGVmdC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBMYWJlbDogbSgyNTIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZhbHVlOiAnbGluay1zZWN1cmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbXBvbmVudDogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbGlua3NTZWN1cmVPcHRpb25zMlsnZGVmYXVsdCddLCB7IHB5ZGlvOiBweWRpbywgbGlua01vZGVsOiBsaW5rc1swXSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVQYW5lICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIG51bGwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVBhbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsaW5rc1swXS5pc0VkaXRhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJzLmxlZnQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIExhYmVsOiBtKDI1MyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZhbHVlOiAnbGluay12aXNpYmlsaXR5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ29tcG9uZW50OiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbGlua3NWaXNpYmlsaXR5UGFuZWwyWydkZWZhdWx0J10sIHsgcHlkaW86IHB5ZGlvLCBsaW5rTW9kZWw6IGxpbmtzWzBdIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBbHdheXNMYXN0OiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21haW5HZW5lcmljRWRpdG9yMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgICAgIHRhYnM6IHRhYnMsXG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyOiBoZWFkZXIsXG4gICAgICAgICAgICAgICAgICAgIHNhdmVFbmFibGVkOiBtb2RlbC5pc0RpcnR5KCksXG4gICAgICAgICAgICAgICAgICAgIG9uU2F2ZUFjdGlvbjogdGhpcy5zdWJtaXQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgb25DbG9zZUFjdGlvbjogdGhpcy5wcm9wcy5vbkRpc21pc3MsXG4gICAgICAgICAgICAgICAgICAgIG9uUmV2ZXJ0QWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbC5yZXZlcnRDaGFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGVkaXRvck9uZUNvbHVtbjogZWRpdG9yT25lQ29sdW1uLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyB3aWR0aDogJzEwMCUnLCBoZWlnaHQ6IG51bGwsIGZsZXg6IDEsIG1pbkhlaWdodDogNTUwLCBjb2xvcjogJ3JnYmEoMCwwLDAsLjgzKScsIGZvbnRTaXplOiAxMyB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBfcmV0ID0gKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgbGluZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNlbGxzID0gW107XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsLmdldENlbGxzKCkubWFwKGZ1bmN0aW9uIChjZWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjZWxscy5wdXNoKGNlbGwuZ2V0TGFiZWwoKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2VsbHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYWluR2VuZXJpY0NhcmQuR2VuZXJpY0xpbmUsIHsgaWNvbkNsYXNzTmFtZTogJ21kaSBtZGktYWNjb3VudC1tdWx0aXBsZScsIGxlZ2VuZDogbSgyNTQpLCBkYXRhOiBjZWxscy5qb2luKCcsICcpIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgbGlua3MgPSBtb2RlbC5nZXRMaW5rcygpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobGlua3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbG4gPSBsaW5rc1swXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsbi5oYXNFcnJvcigpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVyciA9IGxuLmhhc0Vycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWFpbkdlbmVyaWNDYXJkLkdlbmVyaWNMaW5lLCB7IGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1hbGVydC1vdXRsaW5lXCIsIGxlZ2VuZDogXCJFcnJvclwiLCBkYXRhOiBlcnIuRGV0YWlsIHx8IGVyci5Nc2cgfHwgZXJyIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobG4uZ2V0TGluaygpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHB1YmxpY0xpbmsgPSBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLmJ1aWxkUHVibGljVXJsKHB5ZGlvLCBsbi5nZXRMaW5rKCkuTGlua0hhc2gsIG1vZGUgPT09ICdpbmZvUGFuZWwnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYWluR2VuZXJpY0NhcmQuR2VuZXJpY0xpbmUsIHsgaWNvbkNsYXNzTmFtZTogJ21kaSBtZGktbGluaycsIGxlZ2VuZDogbSgxMjEpLCBzdHlsZTogeyBvdmVyZmxvdzogJ3Zpc2libGUnIH0sIGRhdGFTdHlsZTogeyBvdmVyZmxvdzogJ3Zpc2libGUnIH0sIGRhdGE6IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiAnY29weS1idXR0b24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBwb3NpdGlvbjogJ3JlbGF0aXZlJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VPdmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzNC5zZXRTdGF0ZSh7IGxpbmtUb29sdGlwOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZU91dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczQuc2V0U3RhdGUoeyBsaW5rVG9vbHRpcDogZmFsc2UgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFRvb2x0aXAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogY29weU1lc3NhZ2UgPyBjb3B5TWVzc2FnZSA6IG0oMTkxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBob3Jpem9udGFsUG9zaXRpb246IFwibGVmdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlcnRpY2FsUG9zaXRpb246IFwidG9wXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvdzogbGlua1Rvb2x0aXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVibGljTGlua1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgZGVsZXRlQWN0aW9uID0gZnVuY3Rpb24gZGVsZXRlQWN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpcm0obSgyNTUpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsLnN0b3BPYnNlcnZpbmcoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsLmRlbGV0ZUFsbCgpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RlbC51cGRhdGVVbmRlcmx5aW5nTm9kZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdjogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX21haW5HZW5lcmljQ2FyZC5HZW5lcmljQ2FyZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHB5ZGlvLk1lc3NhZ2VIYXNoWydzaGFyZV9jZW50ZXIuNTAnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25EaXNtaXNzQWN0aW9uOiBfdGhpczQucHJvcHMub25EaXNtaXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkRlbGV0ZUFjdGlvbjogZGVsZXRlQWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkVkaXRBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvLkNvbnRyb2xsZXIuZmlyZUFjdGlvbignc2hhcmUtZWRpdC1zaGFyZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyU21hbGw6IG1vZGUgPT09ICdpbmZvUGFuZWwnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lc1xuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIF9yZXQgPT09ICdvYmplY3QnKSByZXR1cm4gX3JldC52O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIENvbXBvc2l0ZUNhcmQ7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ29tcG9zaXRlQ2FyZCA9IFBhbGV0dGVNb2RpZmllcih7IHByaW1hcnkxQ29sb3I6ICcjMDA5Njg4JyB9KShDb21wb3NpdGVDYXJkKTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IENvbXBvc2l0ZUNhcmQ7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX0NvbXBvc2l0ZUNhcmQgPSByZXF1aXJlKCcuL0NvbXBvc2l0ZUNhcmQnKTtcblxudmFyIF9Db21wb3NpdGVDYXJkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NvbXBvc2l0ZUNhcmQpO1xuXG52YXIgX3B5ZGlvTW9kZWxEYXRhTW9kZWwgPSByZXF1aXJlKCdweWRpby9tb2RlbC9kYXRhLW1vZGVsJyk7XG5cbnZhciBfcHlkaW9Nb2RlbERhdGFNb2RlbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb01vZGVsRGF0YU1vZGVsKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlcXVpcmUkcmVxdWlyZUxpYiA9IHJlcXVpcmUoJ3B5ZGlvJykucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgQWN0aW9uRGlhbG9nTWl4aW4gPSBfcmVxdWlyZSRyZXF1aXJlTGliLkFjdGlvbkRpYWxvZ01peGluO1xuXG52YXIgQ29tcG9zaXRlRGlhbG9nID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnQ29tcG9zaXRlRGlhbG9nJyxcblxuICAgIG1peGluczogW0FjdGlvbkRpYWxvZ01peGluXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlhbG9nVGl0bGU6ICcnLFxuICAgICAgICAgICAgZGlhbG9nSXNNb2RhbDogZmFsc2UsXG4gICAgICAgICAgICBkaWFsb2dQYWRkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGRpYWxvZ1NpemU6ICdsZydcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIHB5ZGlvOiBSZWFjdC5Qcm9wVHlwZXMuaW5zdGFuY2VPZihfcHlkaW8yWydkZWZhdWx0J10pLmlzUmVxdWlyZWQsXG4gICAgICAgIHNlbGVjdGlvbjogUmVhY3QuUHJvcFR5cGVzLmluc3RhbmNlT2YoX3B5ZGlvTW9kZWxEYXRhTW9kZWwyWydkZWZhdWx0J10pLFxuICAgICAgICByZWFkb25seTogUmVhY3QuUHJvcFR5cGVzLmJvb2xcbiAgICB9LFxuXG4gICAgY2hpbGRDb250ZXh0VHlwZXM6IHtcbiAgICAgICAgbWVzc2FnZXM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgICAgIGdldE1lc3NhZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgICAgICBpc1JlYWRvbmx5OiBSZWFjdC5Qcm9wVHlwZXMuZnVuY1xuICAgIH0sXG5cbiAgICBnZXRDaGlsZENvbnRleHQ6IGZ1bmN0aW9uIGdldENoaWxkQ29udGV4dCgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB2YXIgbWVzc2FnZXMgPSB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbWVzc2FnZXM6IG1lc3NhZ2VzLFxuICAgICAgICAgICAgZ2V0TWVzc2FnZTogZnVuY3Rpb24gZ2V0TWVzc2FnZShtZXNzYWdlSWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmFtZXNwYWNlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gJ3NoYXJlX2NlbnRlcicgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZXNbbmFtZXNwYWNlICsgKG5hbWVzcGFjZSA/IFwiLlwiIDogXCJcIikgKyBtZXNzYWdlSWRdIHx8IG1lc3NhZ2VJZDtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlSWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGlzUmVhZG9ubHk6IGZ1bmN0aW9uIGlzUmVhZG9ubHkoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnByb3BzLnJlYWRvbmx5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcbiAgICAgICAgdmFyIHNlbGVjdGlvbiA9IF9wcm9wcy5zZWxlY3Rpb247XG5cbiAgICAgICAgdmFyIG5vZGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChzZWxlY3Rpb24uZ2V0VW5pcXVlTm9kZSgpKSB7XG4gICAgICAgICAgICBub2RlID0gc2VsZWN0aW9uLmdldFVuaXF1ZU5vZGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KF9Db21wb3NpdGVDYXJkMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICBlZGl0b3JPbmVDb2x1bW46IHRoaXMucHJvcHMuZWRpdG9yT25lQ29sdW1uLFxuICAgICAgICAgICAgcHlkaW86IHB5ZGlvLFxuICAgICAgICAgICAgbW9kZTogJ2VkaXQnLFxuICAgICAgICAgICAgbm9kZTogbm9kZSxcbiAgICAgICAgICAgIG9uRGlzbWlzczogdGhpcy5wcm9wcy5vbkRpc21pc3NcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IENvbXBvc2l0ZURpYWxvZztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94NCwgX3g1LCBfeDYpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3g0LCBwcm9wZXJ0eSA9IF94NSwgcmVjZWl2ZXIgPSBfeDY7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3g0ID0gcGFyZW50OyBfeDUgPSBwcm9wZXJ0eTsgX3g2ID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9weWRpb0xhbmdPYnNlcnZhYmxlID0gcmVxdWlyZSgncHlkaW8vbGFuZy9vYnNlcnZhYmxlJyk7XG5cbnZhciBfcHlkaW9MYW5nT2JzZXJ2YWJsZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb0xhbmdPYnNlcnZhYmxlKTtcblxudmFyIF9saW5rc0xpbmtNb2RlbCA9IHJlcXVpcmUoJy4uL2xpbmtzL0xpbmtNb2RlbCcpO1xuXG52YXIgX2xpbmtzTGlua01vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2xpbmtzTGlua01vZGVsKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIgPSByZXF1aXJlKCcuLi9tYWluL1NoYXJlSGVscGVyJyk7XG5cbnZhciBfbWFpblNoYXJlSGVscGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21haW5TaGFyZUhlbHBlcik7XG5cbnZhciBfcHlkaW9Nb2RlbENlbGwgPSByZXF1aXJlKCdweWRpby9tb2RlbC9jZWxsJyk7XG5cbnZhciBfcHlkaW9Nb2RlbENlbGwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9Nb2RlbENlbGwpO1xuXG52YXIgX3B5ZGlvSHR0cFJlc3RBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL3Jlc3QtYXBpJyk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2Jvb3QnKTtcblxudmFyIG1vbWVudCA9IF9QeWRpbyRyZXF1aXJlTGliLm1vbWVudDtcblxudmFyIENvbXBvc2l0ZU1vZGVsID0gKGZ1bmN0aW9uIChfT2JzZXJ2YWJsZSkge1xuICAgIF9pbmhlcml0cyhDb21wb3NpdGVNb2RlbCwgX09ic2VydmFibGUpO1xuXG4gICAgZnVuY3Rpb24gQ29tcG9zaXRlTW9kZWwoKSB7XG4gICAgICAgIHZhciBlZGl0ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBhcmd1bWVudHNbMF07XG5cbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENvbXBvc2l0ZU1vZGVsKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihDb21wb3NpdGVNb2RlbC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMpO1xuICAgICAgICB0aGlzLmNlbGxzID0gW107XG4gICAgICAgIHRoaXMubGlua3MgPSBbXTtcbiAgICAgICAgdGhpcy5lZGl0ID0gZWRpdDtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoQ29tcG9zaXRlTW9kZWwsIFt7XG4gICAgICAgIGtleTogJ2VtcHR5TGluaycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBlbXB0eUxpbmsobm9kZSkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGxpbmsgPSBuZXcgX2xpbmtzTGlua01vZGVsMlsnZGVmYXVsdCddKCk7XG4gICAgICAgICAgICB2YXIgdHJlZU5vZGUgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuVHJlZU5vZGUoKTtcbiAgICAgICAgICAgIHZhciBhdXRoID0gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5nZXRBdXRob3JpemF0aW9ucyhfcHlkaW8yWydkZWZhdWx0J10uZ2V0SW5zdGFuY2UoKSk7XG4gICAgICAgICAgICB0cmVlTm9kZS5VdWlkID0gbm9kZS5nZXRNZXRhZGF0YSgpLmdldCgndXVpZCcpO1xuICAgICAgICAgICAgbGluay5nZXRMaW5rKCkuTGFiZWwgPSBub2RlLmdldExhYmVsKCk7XG4gICAgICAgICAgICBsaW5rLmdldExpbmsoKS5EZXNjcmlwdGlvbiA9IHB5ZGlvLk1lc3NhZ2VIYXNoWydzaGFyZV9jZW50ZXIuMjU3J10ucmVwbGFjZSgnJXMnLCBtb21lbnQobmV3IERhdGUoKSkuZm9ybWF0KFwiWVlZWS9NTS9ERFwiKSk7XG4gICAgICAgICAgICBsaW5rLmdldExpbmsoKS5Sb290Tm9kZXMucHVzaCh0cmVlTm9kZSk7XG4gICAgICAgICAgICAvLyBUZW1wbGF0ZSAvIFBlcm1pc3Npb25zIGZyb20gbm9kZVxuICAgICAgICAgICAgdmFyIGRlZmF1bHRUZW1wbGF0ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHZhciBkZWZhdWx0UGVybWlzc2lvbnMgPSBbX3B5ZGlvSHR0cFJlc3RBcGkuUmVzdFNoYXJlTGlua0FjY2Vzc1R5cGUuY29uc3RydWN0RnJvbU9iamVjdCgnRG93bmxvYWQnKV07XG4gICAgICAgICAgICBpZiAobm9kZS5pc0xlYWYoKSkge1xuICAgICAgICAgICAgICAgIGRlZmF1bHRUZW1wbGF0ZSA9IFwicHlkaW9fdW5pcXVlX2RsXCI7XG5cbiAgICAgICAgICAgICAgICB2YXIgX1NoYXJlSGVscGVyJG5vZGVIYXNFZGl0b3IgPSBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLm5vZGVIYXNFZGl0b3IocHlkaW8sIG5vZGUpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHByZXZpZXcgPSBfU2hhcmVIZWxwZXIkbm9kZUhhc0VkaXRvci5wcmV2aWV3O1xuXG4gICAgICAgICAgICAgICAgaWYgKHByZXZpZXcgJiYgIWF1dGgubWF4X2Rvd25sb2Fkcykge1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0VGVtcGxhdGUgPSBcInB5ZGlvX3VuaXF1ZV9zdHJpcFwiO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0UGVybWlzc2lvbnMucHVzaChfcHlkaW9IdHRwUmVzdEFwaS5SZXN0U2hhcmVMaW5rQWNjZXNzVHlwZS5jb25zdHJ1Y3RGcm9tT2JqZWN0KCdQcmV2aWV3JykpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYXV0aC5tYXhfZG93bmxvYWRzID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiBETCBvbmx5IGFuZCBhdXRoIGhhcyBkZWZhdWx0IG1heCBkb3dubG9hZCwgc2V0IGl0XG4gICAgICAgICAgICAgICAgICAgIGxpbmsuZ2V0TGluaygpLk1heERvd25sb2FkcyA9IGF1dGgubWF4X2Rvd25sb2FkcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlZmF1bHRUZW1wbGF0ZSA9IFwicHlkaW9fc2hhcmVkX2ZvbGRlclwiO1xuICAgICAgICAgICAgICAgIGRlZmF1bHRQZXJtaXNzaW9ucy5wdXNoKF9weWRpb0h0dHBSZXN0QXBpLlJlc3RTaGFyZUxpbmtBY2Nlc3NUeXBlLmNvbnN0cnVjdEZyb21PYmplY3QoJ1ByZXZpZXcnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsaW5rLmdldExpbmsoKS5WaWV3VGVtcGxhdGVOYW1lID0gZGVmYXVsdFRlbXBsYXRlO1xuICAgICAgICAgICAgbGluay5nZXRMaW5rKCkuUGVybWlzc2lvbnMgPSBkZWZhdWx0UGVybWlzc2lvbnM7XG4gICAgICAgICAgICBpZiAoYXV0aC5tYXhfZXhwaXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGxpbmsuZ2V0TGluaygpLkFjY2Vzc0VuZCA9IFwiXCIgKyAoTWF0aC5yb3VuZChuZXcgRGF0ZSgpIC8gMTAwMCkgKyBwYXJzZUludChhdXRoLm1heF9leHBpcmF0aW9uKSAqIDYwICogNjAgKiAyNCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxpbmsub2JzZXJ2ZShcInVwZGF0ZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMubm90aWZ5KFwidXBkYXRlXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsaW5rLm9ic2VydmUoXCJzYXZlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy51cGRhdGVVbmRlcmx5aW5nTm9kZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gbGluaztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY3JlYXRlRW1wdHlDZWxsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNyZWF0ZUVtcHR5Q2VsbCgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgY2VsbCA9IG5ldyBfcHlkaW9Nb2RlbENlbGwyWydkZWZhdWx0J10odHJ1ZSk7XG4gICAgICAgICAgICBjZWxsLnNldExhYmVsKHRoaXMubm9kZS5nZXRMYWJlbCgpKTtcbiAgICAgICAgICAgIGNlbGwuYWRkUm9vdE5vZGUodGhpcy5ub2RlKTtcbiAgICAgICAgICAgIGNlbGwub2JzZXJ2ZShcInVwZGF0ZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMyLm5vdGlmeShcInVwZGF0ZVwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2VsbC5kaXJ0eSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5jZWxscy5wdXNoKGNlbGwpO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnkoXCJ1cGRhdGVcIik7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2FkZFRvRXhpc3RpbmdDZWxsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGFkZFRvRXhpc3RpbmdDZWxsKGNlbGxJZCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBjZWxsID0gbmV3IF9weWRpb01vZGVsQ2VsbDJbJ2RlZmF1bHQnXSh0cnVlKTtcbiAgICAgICAgICAgIGNlbGwub2JzZXJ2ZShcInVwZGF0ZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMzLm5vdGlmeShcInVwZGF0ZVwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2VsbC5sb2FkKGNlbGxJZCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY2VsbC5hZGRSb290Tm9kZShfdGhpczMubm9kZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuY2VsbHMucHVzaChjZWxsKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndXBkYXRlVW5kZXJseWluZ05vZGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlVW5kZXJseWluZ05vZGUoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5za2lwVXBkYXRlVW5kZXJseWluZ05vZGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBweWRpby5nZXRDb250ZXh0SG9sZGVyKCkucmVxdWlyZU5vZGVSZWxvYWQodGhpcy5ub2RlKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGVsZXRlTGluaycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZWxldGVMaW5rKGxpbmtNb2RlbCkge1xuICAgICAgICAgICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGxpbmtNb2RlbC5kZWxldGVMaW5rKHRoaXMuZW1wdHlMaW5rKHRoaXMubm9kZSkuZ2V0TGluaygpKS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgICAgICBfdGhpczQudXBkYXRlVW5kZXJseWluZ05vZGUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXROb2RlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldE5vZGUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ub2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSBub2RlIHtUcmVlTm9kZX1cbiAgICAgICAgICogQHBhcmFtIG9ic2VydmVSZXBsYWNlIGJvb2xcbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdsb2FkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxvYWQobm9kZSkge1xuICAgICAgICAgICAgdmFyIF90aGlzNSA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBvYnNlcnZlUmVwbGFjZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogYXJndW1lbnRzWzFdO1xuXG4gICAgICAgICAgICB0aGlzLm5vZGUgPSBub2RlO1xuICAgICAgICAgICAgdGhpcy5jZWxscyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5saW5rcyA9IFtdO1xuICAgICAgICAgICAgaWYgKG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ3B5ZGlvX3NoYXJlcycpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNoYXJlTWV0YSA9IEpTT04ucGFyc2Uobm9kZS5nZXRNZXRhZGF0YSgpLmdldCgncHlkaW9fc2hhcmVzJykpO1xuICAgICAgICAgICAgICAgIHNoYXJlTWV0YS5tYXAoZnVuY3Rpb24gKHNoYXJlZFdvcmtzcGFjZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2hhcmVkV29ya3NwYWNlLlNjb3BlID09PSAzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBMaW5rXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGlua01vZGVsID0gbmV3IF9saW5rc0xpbmtNb2RlbDJbJ2RlZmF1bHQnXSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGlua01vZGVsLm9ic2VydmUoXCJ1cGRhdGVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzNS5ub3RpZnkoXCJ1cGRhdGVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtNb2RlbC5vYnNlcnZlKFwic2F2ZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXM1LnVwZGF0ZVVuZGVybHlpbmdOb2RlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtNb2RlbC5sb2FkKHNoYXJlZFdvcmtzcGFjZS5VVUlEKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzNS5saW5rcy5wdXNoKGxpbmtNb2RlbCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2hhcmVkV29ya3NwYWNlLlNjb3BlID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2VsbCA9IG5ldyBfcHlkaW9Nb2RlbENlbGwyWydkZWZhdWx0J10oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbGwub2JzZXJ2ZShcInVwZGF0ZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXM1Lm5vdGlmeShcInVwZGF0ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2VsbC5sb2FkKHNoYXJlZFdvcmtzcGFjZS5VVUlEKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzNS5jZWxscy5wdXNoKGNlbGwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5lZGl0ICYmICF0aGlzLmxpbmtzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMubGlua3MucHVzaCh0aGlzLmVtcHR5TGluayhub2RlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob2JzZXJ2ZVJlcGxhY2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGUub2JzZXJ2ZSgnbm9kZV9yZXBsYWNlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXM1LmxvYWQoX3RoaXM1Lm5vZGUsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbG9hZFVuaXF1ZUxpbmsnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbG9hZFVuaXF1ZUxpbmsobGlua1V1aWQsIG5vZGUpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLm5vZGUgPSBub2RlO1xuICAgICAgICAgICAgdmFyIGxpbmtNb2RlbCA9IG5ldyBfbGlua3NMaW5rTW9kZWwyWydkZWZhdWx0J10oKTtcbiAgICAgICAgICAgIGxpbmtNb2RlbC5vYnNlcnZlKFwidXBkYXRlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpczYubm90aWZ5KFwidXBkYXRlXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsaW5rTW9kZWwubG9hZChsaW5rVXVpZCk7XG4gICAgICAgICAgICB0aGlzLmxpbmtzLnB1c2gobGlua01vZGVsKTtcbiAgICAgICAgICAgIHJldHVybiBsaW5rTW9kZWw7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3NhdmUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2F2ZSgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczcgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgcHJvbXMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuY2VsbHMubWFwKGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHIuaXNEaXJ0eSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb21zLnB1c2goci5zYXZlKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5saW5rcy5tYXAoZnVuY3Rpb24gKGwpIHtcbiAgICAgICAgICAgICAgICBpZiAobC5pc0RpcnR5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvbXMucHVzaChsLnNhdmUoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBXYWl0IHRoYXQgYWxsIHNhdmUgYXJlIGZpbmlzaGVkXG4gICAgICAgICAgICBQcm9taXNlLmFsbChwcm9tcykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIGNlbGxzIHRoYXQgZG9uJ3QgaGF2ZSB0aGlzIG5vZGUgYW55bW9yZVxuICAgICAgICAgICAgICAgIHZhciBub2RlSWQgPSBfdGhpczcubm9kZS5nZXRNZXRhZGF0YSgpLmdldCgndXVpZCcpO1xuICAgICAgICAgICAgICAgIF90aGlzNy5jZWxscyA9IF90aGlzNy5jZWxscy5maWx0ZXIoZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHIuaGFzUm9vdE5vZGUobm9kZUlkKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBfdGhpczcudXBkYXRlVW5kZXJseWluZ05vZGUoKTtcbiAgICAgICAgICAgIH0pWydjYXRjaCddKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgX3RoaXM3LnVwZGF0ZVVuZGVybHlpbmdOb2RlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGVsZXRlQWxsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlbGV0ZUFsbCgpIHtcbiAgICAgICAgICAgIHZhciBub2RlVXVpZCA9IHRoaXMubm9kZS5nZXRNZXRhZGF0YSgpLmdldCgndXVpZCcpO1xuICAgICAgICAgICAgdmFyIHAgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuY2VsbHMubWFwKGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICAgICAgci5yZW1vdmVSb290Tm9kZShub2RlVXVpZCk7XG4gICAgICAgICAgICAgICAgcC5wdXNoKHIuc2F2ZSgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5saW5rcy5tYXAoZnVuY3Rpb24gKGwpIHtcbiAgICAgICAgICAgICAgICBwLnB1c2gobC5kZWxldGVMaW5rKCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbW92ZU5ld0NlbGwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlTmV3Q2VsbChjZWxsKSB7XG4gICAgICAgICAgICB0aGlzLmNlbGxzID0gdGhpcy5jZWxscy5maWx0ZXIoZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gciAhPT0gY2VsbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnkoXCJ1cGRhdGVcIik7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JldmVydENoYW5nZXMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmV2ZXJ0Q2hhbmdlcygpIHtcbiAgICAgICAgICAgIC8vIFJlbW92ZSBlbXB0eSBjZWxsc1xuICAgICAgICAgICAgdGhpcy5jZWxscyA9IHRoaXMuY2VsbHMuZmlsdGVyKGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHIuZ2V0VXVpZCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmNlbGxzLm1hcChmdW5jdGlvbiAocikge1xuICAgICAgICAgICAgICAgIGlmIChyLmlzRGlydHkoKSkge1xuICAgICAgICAgICAgICAgICAgICByLnJldmVydENoYW5nZXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubGlua3MubWFwKGZ1bmN0aW9uIChsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGwuaXNEaXJ0eSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGwucmV2ZXJ0Q2hhbmdlcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ3VwZGF0ZScpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdpc0RpcnR5JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlzRGlydHkoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jZWxscy5maWx0ZXIoZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gci5pc0RpcnR5KCk7XG4gICAgICAgICAgICB9KS5sZW5ndGggfHwgdGhpcy5saW5rcy5maWx0ZXIoZnVuY3Rpb24gKGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbC5pc0RpcnR5KCk7XG4gICAgICAgICAgICB9KS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3N0b3BPYnNlcnZpbmcnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc3RvcE9ic2VydmluZyhldmVudCkge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICAgICAgdGhpcy5jZWxscy5tYXAoZnVuY3Rpb24gKGNlbGwpIHtcbiAgICAgICAgICAgICAgICBjZWxsLnN0b3BPYnNlcnZpbmcoXCJ1cGRhdGVcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubGlua3MubWFwKGZ1bmN0aW9uIChsaW5rKSB7XG4gICAgICAgICAgICAgICAgbGluay5zdG9wT2JzZXJ2aW5nKFwidXBkYXRlXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihDb21wb3NpdGVNb2RlbC5wcm90b3R5cGUpLCAnc3RvcE9ic2VydmluZycsIHRoaXMpLmNhbGwodGhpcywgZXZlbnQsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0Q2VsbHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0Q2VsbHMoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXM4ID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHRoaXMubm9kZSkge1xuICAgICAgICAgICAgICAgIHZhciBfcmV0ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vZGVJZCA9IF90aGlzOC5ub2RlLmdldE1ldGFkYXRhKCkuZ2V0KCd1dWlkJyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2OiBfdGhpczguY2VsbHMuZmlsdGVyKGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHIuaGFzUm9vdE5vZGUobm9kZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSkoKTtcblxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgX3JldCA9PT0gJ29iamVjdCcpIHJldHVybiBfcmV0LnY7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNlbGxzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRMaW5rcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRMaW5rcygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxpbmtzO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIENvbXBvc2l0ZU1vZGVsO1xufSkoX3B5ZGlvTGFuZ09ic2VydmFibGUyWydkZWZhdWx0J10pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBDb21wb3NpdGVNb2RlbDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeDIsIF94MywgX3g0KSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94MiwgcHJvcGVydHkgPSBfeDMsIHJlY2VpdmVyID0gX3g0OyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94MiA9IHBhcmVudDsgX3gzID0gcHJvcGVydHk7IF94NCA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpb0h0dHBSZXNvdXJjZXNNYW5hZ2VyID0gcmVxdWlyZSgncHlkaW8vaHR0cC9yZXNvdXJjZXMtbWFuYWdlcicpO1xuXG52YXIgX3B5ZGlvSHR0cFJlc291cmNlc01hbmFnZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwUmVzb3VyY2VzTWFuYWdlcik7XG5cbnZhciBfbWFpblNoYXJlSGVscGVyID0gcmVxdWlyZSgnLi4vbWFpbi9TaGFyZUhlbHBlcicpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYWluU2hhcmVIZWxwZXIpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX3B5ZGlvSHR0cFJlc3RBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL3Jlc3QtYXBpJyk7XG5cbnZhciBNYWlsZXIgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoTWFpbGVyLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIE1haWxlcihwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTWFpbGVyKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihNYWlsZXIucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7IG1haWxlckRhdGE6IG51bGwgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoTWFpbGVyLCBbe1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHMpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBzdWJqZWN0ID0gbmV3UHJvcHMuc3ViamVjdDtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gbmV3UHJvcHMubWVzc2FnZTtcbiAgICAgICAgICAgIHZhciB1c2VycyA9IG5ld1Byb3BzLnVzZXJzO1xuICAgICAgICAgICAgdmFyIGxpbmtNb2RlbCA9IG5ld1Byb3BzLmxpbmtNb2RlbDtcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZUlkID0gbmV3UHJvcHMudGVtcGxhdGVJZDtcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZURhdGEgPSBuZXdQcm9wcy50ZW1wbGF0ZURhdGE7XG5cbiAgICAgICAgICAgIGlmIChzdWJqZWN0IHx8IHRlbXBsYXRlSWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5mb3JjZU1haWxlck9sZFNjaG9vbCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbmNTdWJqZWN0ID0gZW5jb2RlVVJJQ29tcG9uZW50KHN1YmplY3QpO1xuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gXCJtYWlsdG86Y3VzdG9tLWVtYWlsQGRvbWFpbi5jb20/U3ViamVjdD1cIiArIGVuY1N1YmplY3QgKyBcIiZCb2R5PVwiICsgbWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvL2NvbnN0IGxpbmtEYXRhID0gaGFzaCA/IHRoaXMuc3RhdGUubW9kZWwuZ2V0TGlua0RhdGEoaGFzaCkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgX3B5ZGlvSHR0cFJlc291cmNlc01hbmFnZXIyWydkZWZhdWx0J10ubG9hZENsYXNzZXNBbmRBcHBseShbJ1B5ZGlvTWFpbGVyJ10sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFpbGVyRGF0YTogX2V4dGVuZHMoe30sIG5ld1Byb3BzLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlSWRlbnRpZmljYXRpb246IGxpbmtNb2RlbCAmJiBsaW5rTW9kZWwuZ2V0TGluaygpLlRhcmdldFVzZXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkZW50aWZpZWRPbmx5OiBsaW5rTW9kZWwgJiYgbGlua01vZGVsLmdldExpbmsoKS5SZXN0cmljdFRvVGFyZ2V0VXNlcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JpcHBsZUlkZW50aWZpY2F0aW9uS2V5czogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtYWlsZXJEYXRhOiBudWxsIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd0b2dnbGVNYWlsZXJEYXRhJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHRvZ2dsZU1haWxlckRhdGEoZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1haWxlckRhdGE6IF9leHRlbmRzKHt9LCB0aGlzLnN0YXRlLm1haWxlckRhdGEsIGRhdGEpIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdkaXNtaXNzTWFpbGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRpc21pc3NNYWlsZXIoKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRGlzbWlzcygpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdtYWlsZXJQcm9jZXNzUG9zdCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBtYWlsZXJQcm9jZXNzUG9zdChFbWFpbCwgdXNlcnMsIHN1YmplY3QsIG1lc3NhZ2UsIGxpbmssIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgbWFpbGVyRGF0YSA9IHRoaXMuc3RhdGUubWFpbGVyRGF0YTtcbiAgICAgICAgICAgIHZhciBjcmlwcGxlSWRlbnRpZmljYXRpb25LZXlzID0gbWFpbGVyRGF0YS5jcmlwcGxlSWRlbnRpZmljYXRpb25LZXlzO1xuICAgICAgICAgICAgdmFyIGlkZW50aWZpZWRPbmx5ID0gbWFpbGVyRGF0YS5pZGVudGlmaWVkT25seTtcbiAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSBtYWlsZXJEYXRhLmxpbmtNb2RlbDtcblxuICAgICAgICAgICAgdmFyIGxpbmtPYmplY3QgPSBsaW5rTW9kZWwuZ2V0TGluaygpO1xuICAgICAgICAgICAgaWYgKCFsaW5rT2JqZWN0LlRhcmdldFVzZXJzKSB7XG4gICAgICAgICAgICAgICAgbGlua09iamVjdC5UYXJnZXRVc2VycyA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGlua09iamVjdC5SZXN0cmljdFRvVGFyZ2V0VXNlcnMgPSBpZGVudGlmaWVkT25seTtcblxuICAgICAgICAgICAgdmFyIHNoYXJlTWFpbHMgPSB7fTtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHVzZXJzKS5mb3JFYWNoKGZ1bmN0aW9uICh1KSB7XG4gICAgICAgICAgICAgICAgdmFyIGsgPSBjcmlwcGxlSWRlbnRpZmljYXRpb25LZXlzID8gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDcpIDogdTtcbiAgICAgICAgICAgICAgICBsaW5rT2JqZWN0LlRhcmdldFVzZXJzW2tdID0gX3B5ZGlvSHR0cFJlc3RBcGkuUmVzdFNoYXJlTGlua1RhcmdldFVzZXIuY29uc3RydWN0RnJvbU9iamVjdCh7IERpc3BsYXk6IHVzZXJzW3VdLmdldExhYmVsKCksIERvd25sb2FkQ291bnQ6IDAgfSk7XG4gICAgICAgICAgICAgICAgc2hhcmVNYWlsc1trXSA9IHU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxpbmtNb2RlbC51cGRhdGVMaW5rKGxpbmtPYmplY3QpO1xuICAgICAgICAgICAgbGlua01vZGVsLnNhdmUoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZW1haWwgPSBuZXcgRW1haWwoKTtcbiAgICAgICAgICAgICAgICB2YXIgb3JpZ2luYWxMaW5rID0gbGlua01vZGVsLmdldFB1YmxpY1VybCgpO1xuICAgICAgICAgICAgICAgIHZhciByZWdleHAgPSBuZXcgUmVnRXhwKG9yaWdpbmFsTGluaywgJ2cnKTtcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhzaGFyZU1haWxzKS5mb3JFYWNoKGZ1bmN0aW9uICh1KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdMaW5rID0gb3JpZ2luYWxMaW5rICsgJz91PScgKyB1O1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TWVzc2FnZSA9IG1lc3NhZ2UucmVwbGFjZShyZWdleHAsIG5ld0xpbmspO1xuICAgICAgICAgICAgICAgICAgICBlbWFpbC5hZGRUYXJnZXQoc2hhcmVNYWlsc1t1XSwgc3ViamVjdCwgbmV3TWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZW1haWwucG9zdChmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHJlcyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0TWVzc2FnZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRNZXNzYWdlKGtleSkge1xuICAgICAgICAgICAgdmFyIG5hbWVzcGFjZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/ICdzaGFyZV9jZW50ZXInIDogYXJndW1lbnRzWzFdO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFtuYW1lc3BhY2UgKyAobmFtZXNwYWNlID8gJy4nIDogJycpICsga2V5XTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5tYWlsZXJEYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1haWxlckRhdGEgPSB0aGlzLnN0YXRlLm1haWxlckRhdGE7XG5cbiAgICAgICAgICAgICAgICB2YXIgY3VzdG9taXplTWVzc2FnZVBhbmUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKGZhbHNlICYmIG1haWxlckRhdGEubGlua01vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHlsZSA9IG1haWxlckRhdGEuZW5hYmxlSWRlbnRpZmljYXRpb24gPyB7IHBhZGRpbmc6ICcxMHB4IDIwcHgnLCBiYWNrZ3JvdW5kQ29sb3I6ICcjRUNFRkYxJywgZm9udFNpemU6IDE0IH0gOiB7IHBhZGRpbmc6ICcxMHB4IDIwcHggMCcsIGZvbnRTaXplOiAxNCB9O1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGV0VXNlckNob29zZUNyaXBwbGUgPSB0aGlzLnByb3BzLnB5ZGlvLmdldFBsdWdpbkNvbmZpZ3MoJ2FjdGlvbi5zaGFyZScpLmdldCgnRU1BSUxfUEVSU09OQUxfTElOS19TRU5EX0NMRUFSJyk7XG4gICAgICAgICAgICAgICAgICAgIGN1c3RvbWl6ZU1lc3NhZ2VQYW5lID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Ub2dnbGUsIHsgbGFiZWw6IHRoaXMuZ2V0TWVzc2FnZSgyMzUpLCB0b2dnbGVkOiBtYWlsZXJEYXRhLmVuYWJsZUlkZW50aWZpY2F0aW9uLCBvblRvZ2dsZTogZnVuY3Rpb24gKGUsIGMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnRvZ2dsZU1haWxlckRhdGEoeyBlbmFibGVJZGVudGlmaWNhdGlvbjogYyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFpbGVyRGF0YS5lbmFibGVJZGVudGlmaWNhdGlvbiAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Ub2dnbGUsIHsgbGFiZWw6IFwiLS0gXCIgKyB0aGlzLmdldE1lc3NhZ2UoMjM2KSwgdG9nZ2xlZDogbWFpbGVyRGF0YS5pZGVudGlmaWVkT25seSwgb25Ub2dnbGU6IGZ1bmN0aW9uIChlLCBjKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi50b2dnbGVNYWlsZXJEYXRhKHsgaWRlbnRpZmllZE9ubHk6IGMgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1haWxlckRhdGEuZW5hYmxlSWRlbnRpZmljYXRpb24gJiYgbGV0VXNlckNob29zZUNyaXBwbGUgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVG9nZ2xlLCB7IGxhYmVsOiBcIi0tIFwiICsgdGhpcy5nZXRNZXNzYWdlKDIzNyksIHRvZ2dsZWQ6IG1haWxlckRhdGEuY3JpcHBsZUlkZW50aWZpY2F0aW9uS2V5cywgb25Ub2dnbGU6IGZ1bmN0aW9uIChlLCBjKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi50b2dnbGVNYWlsZXJEYXRhKHsgY3JpcHBsZUlkZW50aWZpY2F0aW9uS2V5czogYyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChQeWRpb01haWxlci5QYW5lLCBfZXh0ZW5kcyh7fSwgbWFpbGVyRGF0YSwge1xuICAgICAgICAgICAgICAgICAgICBvbkRpc21pc3M6IHRoaXMuZGlzbWlzc01haWxlci5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICBvdmVybGF5OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdzaGFyZS1jZW50ZXItbWFpbGVyJyxcbiAgICAgICAgICAgICAgICAgICAgcGFuZWxUaXRsZTogdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFtcInNoYXJlX2NlbnRlci40NVwiXSxcbiAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbFBhbmVUb3A6IGN1c3RvbWl6ZU1lc3NhZ2VQYW5lLFxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzUG9zdDogbWFpbGVyRGF0YS5lbmFibGVJZGVudGlmaWNhdGlvbiA/IHRoaXMubWFpbGVyUHJvY2Vzc1Bvc3QuYmluZCh0aGlzKSA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IHdpZHRoOiA0MjAsIG1hcmdpbjogJzAgYXV0bycgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gTWFpbGVyO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IE1haWxlcjtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2NvbXBvc2l0ZUNvbXBvc2l0ZU1vZGVsID0gcmVxdWlyZSgnLi4vY29tcG9zaXRlL0NvbXBvc2l0ZU1vZGVsJyk7XG5cbnZhciBfY29tcG9zaXRlQ29tcG9zaXRlTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY29tcG9zaXRlQ29tcG9zaXRlTW9kZWwpO1xuXG52YXIgX21haW5HZW5lcmljRWRpdG9yID0gcmVxdWlyZSgnLi4vbWFpbi9HZW5lcmljRWRpdG9yJyk7XG5cbnZhciBfbWFpbkdlbmVyaWNFZGl0b3IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpbkdlbmVyaWNFZGl0b3IpO1xuXG52YXIgX2xpbmtzUGFuZWwgPSByZXF1aXJlKCcuLi9saW5rcy9QYW5lbCcpO1xuXG52YXIgX2xpbmtzUGFuZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbGlua3NQYW5lbCk7XG5cbnZhciBfbGlua3NTZWN1cmVPcHRpb25zID0gcmVxdWlyZSgnLi4vbGlua3MvU2VjdXJlT3B0aW9ucycpO1xuXG52YXIgX2xpbmtzU2VjdXJlT3B0aW9uczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9saW5rc1NlY3VyZU9wdGlvbnMpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlciA9IHJlcXVpcmUoJy4uL21haW4vU2hhcmVIZWxwZXInKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9NYWlsZXIgPSByZXF1aXJlKCcuL01haWxlcicpO1xuXG52YXIgX01haWxlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9NYWlsZXIpO1xuXG52YXIgX2xpbmtzUHVibGljTGlua1RlbXBsYXRlID0gcmVxdWlyZSgnLi4vbGlua3MvUHVibGljTGlua1RlbXBsYXRlJyk7XG5cbnZhciBfbGlua3NQdWJsaWNMaW5rVGVtcGxhdGUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbGlua3NQdWJsaWNMaW5rVGVtcGxhdGUpO1xuXG52YXIgX2xpbmtzVmlzaWJpbGl0eVBhbmVsID0gcmVxdWlyZSgnLi4vbGlua3MvVmlzaWJpbGl0eVBhbmVsJyk7XG5cbnZhciBfbGlua3NWaXNpYmlsaXR5UGFuZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbGlua3NWaXNpYmlsaXR5UGFuZWwpO1xuXG52YXIgX2xpbmtzTGFiZWxQYW5lbCA9IHJlcXVpcmUoJy4uL2xpbmtzL0xhYmVsUGFuZWwnKTtcblxudmFyIF9saW5rc0xhYmVsUGFuZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbGlua3NMYWJlbFBhbmVsKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9yZXF1aXJlJHJlcXVpcmVMaWIgPSByZXF1aXJlKCdweWRpbycpLnJlcXVpcmVMaWIoJ2hvYycpO1xuXG52YXIgUGFsZXR0ZU1vZGlmaWVyID0gX3JlcXVpcmUkcmVxdWlyZUxpYi5QYWxldHRlTW9kaWZpZXI7XG5cbnZhciBTaW1wbGVMaW5rQ2FyZCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhTaW1wbGVMaW5rQ2FyZCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBTaW1wbGVMaW5rQ2FyZChwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2ltcGxlTGlua0NhcmQpO1xuXG4gICAgICAgIHByb3BzLmVkaXRvck9uZUNvbHVtbiA9IHRydWU7XG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFNpbXBsZUxpbmtDYXJkLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB2YXIgbW9kZWwgPSBuZXcgX2NvbXBvc2l0ZUNvbXBvc2l0ZU1vZGVsMlsnZGVmYXVsdCddKHRydWUpO1xuICAgICAgICBtb2RlbC5za2lwVXBkYXRlVW5kZXJseWluZ05vZGUgPSB0cnVlO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgbW9kZTogdGhpcy5wcm9wcy5tb2RlIHx8ICd2aWV3JyxcbiAgICAgICAgICAgIG1vZGVsOiBtb2RlbFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhTaW1wbGVMaW5rQ2FyZCwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBub2RlID0gX3Byb3BzLm5vZGU7XG4gICAgICAgICAgICB2YXIgbGlua1V1aWQgPSBfcHJvcHMubGlua1V1aWQ7XG4gICAgICAgICAgICB2YXIgb25SZW1vdmVMaW5rID0gX3Byb3BzLm9uUmVtb3ZlTGluaztcbiAgICAgICAgICAgIHZhciBtb2RlbCA9IHRoaXMuc3RhdGUubW9kZWw7XG5cbiAgICAgICAgICAgIG1vZGVsLm9ic2VydmUoXCJ1cGRhdGVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSBtb2RlbC5sb2FkVW5pcXVlTGluayhsaW5rVXVpZCwgbm9kZSk7XG4gICAgICAgICAgICBsaW5rTW9kZWwub2JzZXJ2ZU9uY2UoXCJkZWxldGVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChvblJlbW92ZUxpbmspIG9uUmVtb3ZlTGluaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxVbm1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5tb2RlbC5zdG9wT2JzZXJ2aW5nKFwidXBkYXRlXCIpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMocHJvcHMpIHtcbiAgICAgICAgICAgIGlmIChwcm9wcy5MaW5rVXVpZCAmJiBwcm9wcy5MaW5rVXVpZCAhPT0gdGhpcy5wcm9wcy5MaW5rVXVpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUubW9kZWwubG9hZFVuaXF1ZUxpbmsocHJvcHMuTGlua1V1aWQsIHByb3BzLm5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdsaW5rSW52aXRhdGlvbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBsaW5rSW52aXRhdGlvbihsaW5rTW9kZWwpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIG1haWxEYXRhID0gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5wcmVwYXJlRW1haWwodGhpcy5wcm9wcy5ub2RlLCBsaW5rTW9kZWwpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtYWlsZXJEYXRhOiBfZXh0ZW5kcyh7fSwgbWFpbERhdGEsIHsgdXNlcnM6IFtdLCBsaW5rTW9kZWw6IGxpbmtNb2RlbCB9KSB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBhbGVydChlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdkaXNtaXNzTWFpbGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRpc21pc3NNYWlsZXIoKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbWFpbGVyRGF0YTogbnVsbCB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc3VibWl0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgICAgIHZhciBtb2RlbCA9IHRoaXMuc3RhdGUubW9kZWw7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIHB1YmxpY0xpbmtNb2RlbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBpZiAobW9kZWwuZ2V0TGlua3MoKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHVibGljTGlua01vZGVsID0gbW9kZWwuZ2V0TGlua3MoKVswXTtcbiAgICAgICAgICAgICAgICAgICAgcHVibGljTGlua01vZGVsLnNhdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5weWRpby5VSS5kaXNwbGF5TWVzc2FnZSgnRVJST1InLCBlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIG5vZGUgPSBfcHJvcHMyLm5vZGU7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMyLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIGVkaXRvck9uZUNvbHVtbiA9IF9wcm9wczIuZWRpdG9yT25lQ29sdW1uO1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgbW9kZWwgPSBfc3RhdGUubW9kZWw7XG4gICAgICAgICAgICB2YXIgbWFpbGVyRGF0YSA9IF9zdGF0ZS5tYWlsZXJEYXRhO1xuXG4gICAgICAgICAgICB2YXIgbSA9IGZ1bmN0aW9uIG0oaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci4nICsgaWRdO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHB1YmxpY0xpbmtNb2RlbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChtb2RlbC5nZXRMaW5rcygpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHB1YmxpY0xpbmtNb2RlbCA9IG1vZGVsLmdldExpbmtzKClbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaGVhZGVyID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKHB1YmxpY0xpbmtNb2RlbCAmJiBwdWJsaWNMaW5rTW9kZWwuZ2V0TGlua1V1aWQoKSAmJiBwdWJsaWNMaW5rTW9kZWwuaXNFZGl0YWJsZSgpKSB7XG4gICAgICAgICAgICAgICAgaGVhZGVyID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfTWFpbGVyMlsnZGVmYXVsdCddLCBfZXh0ZW5kcyh7fSwgbWFpbGVyRGF0YSwgeyBweWRpbzogcHlkaW8sIG9uRGlzbWlzczogdGhpcy5kaXNtaXNzTWFpbGVyLmJpbmQodGhpcykgfSkpLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbGlua3NMYWJlbFBhbmVsMlsnZGVmYXVsdCddLCB7IHB5ZGlvOiBweWRpbywgbGlua01vZGVsOiBwdWJsaWNMaW5rTW9kZWwgfSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBoZWFkZXIgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZm9udFNpemU6IDI0LCBwYWRkaW5nOiAnMjZweCAxMHB4IDAgJywgbGluZUhlaWdodDogJzI2cHgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX01haWxlcjJbJ2RlZmF1bHQnXSwgX2V4dGVuZHMoe30sIG1haWxlckRhdGEsIHsgcHlkaW86IHB5ZGlvLCBvbkRpc21pc3M6IHRoaXMuZGlzbWlzc01haWxlci5iaW5kKHRoaXMpIH0pKSxcbiAgICAgICAgICAgICAgICAgICAgbSgyNTYpLnJlcGxhY2UoJyVzJywgbm9kZS5nZXRMYWJlbCgpKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdGFicyA9IHsgbGVmdDogW10sIHJpZ2h0OiBbXSwgbGVmdFN0eWxlOiB7IHBhZGRpbmc6IDAgfSB9O1xuICAgICAgICAgICAgdmFyIGxpbmtzID0gbW9kZWwuZ2V0TGlua3MoKTtcbiAgICAgICAgICAgIGlmIChwdWJsaWNMaW5rTW9kZWwpIHtcbiAgICAgICAgICAgICAgICB0YWJzLmxlZnQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIExhYmVsOiBtKDI1MSksXG4gICAgICAgICAgICAgICAgICAgIFZhbHVlOiAncHVibGljLWxpbmsnLFxuICAgICAgICAgICAgICAgICAgICBDb21wb25lbnQ6IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9saW5rc1BhbmVsMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb3NpdGVNb2RlbDogbW9kZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rTW9kZWw6IGxpbmtzWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvd01haWxlcjogX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5tYWlsZXJTdXBwb3J0ZWQocHlkaW8pID8gdGhpcy5saW5rSW52aXRhdGlvbi5iaW5kKHRoaXMpIDogbnVsbFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChwdWJsaWNMaW5rTW9kZWwuZ2V0TGlua1V1aWQoKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBsYXlvdXREYXRhID0gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5jb21waWxlTGF5b3V0RGF0YShweWRpbywgbW9kZWwpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcGxhdGVQYW5lID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBpZiAobGF5b3V0RGF0YS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVBhbmUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbGlua3NQdWJsaWNMaW5rVGVtcGxhdGUyWydkZWZhdWx0J10sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rTW9kZWw6IHB1YmxpY0xpbmtNb2RlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0RGF0YTogbGF5b3V0RGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBwYWRkaW5nOiAnMTBweCAxNnB4JyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRvbmx5OiBtb2RlbC5nZXROb2RlKCkuaXNMZWFmKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRhYnMubGVmdC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIExhYmVsOiBtKDI1MiksXG4gICAgICAgICAgICAgICAgICAgICAgICBWYWx1ZTogJ2xpbmstc2VjdXJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIENvbXBvbmVudDogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbGlua3NTZWN1cmVPcHRpb25zMlsnZGVmYXVsdCddLCB7IHB5ZGlvOiBweWRpbywgbGlua01vZGVsOiBsaW5rc1swXSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVBhbmUgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRGl2aWRlciwgbnVsbCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVQYW5lXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0YWJzLmxlZnQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBMYWJlbDogbSgyNTMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgVmFsdWU6ICdsaW5rLXZpc2liaWxpdHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgQ29tcG9uZW50OiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbGlua3NWaXNpYmlsaXR5UGFuZWwyWydkZWZhdWx0J10sIHsgcHlkaW86IHB5ZGlvLCBsaW5rTW9kZWw6IGxpbmtzWzBdIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgQWx3YXlzTGFzdDogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWFpbkdlbmVyaWNFZGl0b3IyWydkZWZhdWx0J10sIHtcbiAgICAgICAgICAgICAgICB0YWJzOiB0YWJzLFxuICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICBoZWFkZXI6IGhlYWRlcixcbiAgICAgICAgICAgICAgICBzYXZlRW5hYmxlZDogbW9kZWwuaXNEaXJ0eSgpLFxuICAgICAgICAgICAgICAgIG9uU2F2ZUFjdGlvbjogdGhpcy5zdWJtaXQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBvbkNsb3NlQWN0aW9uOiB0aGlzLnByb3BzLm9uRGlzbWlzcyxcbiAgICAgICAgICAgICAgICBvblJldmVydEFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtb2RlbC5yZXZlcnRDaGFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlZGl0b3JPbmVDb2x1bW46IGVkaXRvck9uZUNvbHVtbixcbiAgICAgICAgICAgICAgICBzdHlsZTogeyB3aWR0aDogJzEwMCUnLCBoZWlnaHQ6IG51bGwsIGZsZXg6IDEsIG1pbkhlaWdodDogNTUwLCBjb2xvcjogJ3JnYmEoMCwwLDAsLjgzKScsIGZvbnRTaXplOiAxMyB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBTaW1wbGVMaW5rQ2FyZDtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBTaW1wbGVMaW5rQ2FyZCA9IFBhbGV0dGVNb2RpZmllcih7IHByaW1hcnkxQ29sb3I6ICcjMDA5Njg4JyB9KShTaW1wbGVMaW5rQ2FyZCk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBTaW1wbGVMaW5rQ2FyZDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX2NlbGxzQ3JlYXRlQ2VsbERpYWxvZyA9IHJlcXVpcmUoJy4vY2VsbHMvQ3JlYXRlQ2VsbERpYWxvZycpO1xuXG52YXIgX2NlbGxzQ3JlYXRlQ2VsbERpYWxvZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jZWxsc0NyZWF0ZUNlbGxEaWFsb2cpO1xuXG52YXIgX2NlbGxzRWRpdENlbGxEaWFsb2cgPSByZXF1aXJlKCcuL2NlbGxzL0VkaXRDZWxsRGlhbG9nJyk7XG5cbnZhciBfY2VsbHNFZGl0Q2VsbERpYWxvZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jZWxsc0VkaXRDZWxsRGlhbG9nKTtcblxudmFyIF9jZWxsc0NlbGxDYXJkID0gcmVxdWlyZSgnLi9jZWxscy9DZWxsQ2FyZCcpO1xuXG52YXIgX2NlbGxzQ2VsbENhcmQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY2VsbHNDZWxsQ2FyZCk7XG5cbnZhciBfY29tcG9zaXRlU2ltcGxlTGlua0NhcmQgPSByZXF1aXJlKCcuL2NvbXBvc2l0ZS9TaW1wbGVMaW5rQ2FyZCcpO1xuXG52YXIgX2NvbXBvc2l0ZVNpbXBsZUxpbmtDYXJkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbXBvc2l0ZVNpbXBsZUxpbmtDYXJkKTtcblxudmFyIF9tYWluSW5mb1BhbmVsID0gcmVxdWlyZSgnLi9tYWluL0luZm9QYW5lbCcpO1xuXG52YXIgX21haW5JbmZvUGFuZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpbkluZm9QYW5lbCk7XG5cbnZhciBfY29tcG9zaXRlQ29tcG9zaXRlRGlhbG9nID0gcmVxdWlyZSgnLi9jb21wb3NpdGUvQ29tcG9zaXRlRGlhbG9nJyk7XG5cbnZhciBfY29tcG9zaXRlQ29tcG9zaXRlRGlhbG9nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbXBvc2l0ZUNvbXBvc2l0ZURpYWxvZyk7XG5cbnZhciBfbGlua3NMaW5rTW9kZWwgPSByZXF1aXJlKCcuL2xpbmtzL0xpbmtNb2RlbCcpO1xuXG52YXIgX2xpbmtzTGlua01vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2xpbmtzTGlua01vZGVsKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIgPSByZXF1aXJlKCcuL21haW4vU2hhcmVIZWxwZXInKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9saXN0c1NoYXJlVmlldyA9IHJlcXVpcmUoXCIuL2xpc3RzL1NoYXJlVmlld1wiKTtcblxuZXhwb3J0cy5DcmVhdGVDZWxsRGlhbG9nID0gX2NlbGxzQ3JlYXRlQ2VsbERpYWxvZzJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuRWRpdENlbGxEaWFsb2cgPSBfY2VsbHNFZGl0Q2VsbERpYWxvZzJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuQ2VsbENhcmQgPSBfY2VsbHNDZWxsQ2FyZDJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuSW5mb1BhbmVsID0gX21haW5JbmZvUGFuZWwyWydkZWZhdWx0J107XG5leHBvcnRzLkNvbXBvc2l0ZURpYWxvZyA9IF9jb21wb3NpdGVDb21wb3NpdGVEaWFsb2cyWydkZWZhdWx0J107XG5leHBvcnRzLkxpbmtNb2RlbCA9IF9saW5rc0xpbmtNb2RlbDJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuU2hhcmVIZWxwZXIgPSBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5TaGFyZVZpZXdNb2RhbCA9IF9saXN0c1NoYXJlVmlldy5TaGFyZVZpZXdNb2RhbDtcbmV4cG9ydHMuU2hhcmVWaWV3ID0gX2xpc3RzU2hhcmVWaWV3LlNoYXJlVmlldztcbmV4cG9ydHMuU2ltcGxlTGlua0NhcmQgPSBfY29tcG9zaXRlU2ltcGxlTGlua0NhcmQyWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyID0gcmVxdWlyZSgnLi4vU2hhcmVDb250ZXh0Q29uc3VtZXInKTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TaGFyZUNvbnRleHRDb25zdW1lcik7XG5cbnZhciBfVGFyZ2V0ZWRVc2VycyA9IHJlcXVpcmUoJy4vVGFyZ2V0ZWRVc2VycycpO1xuXG52YXIgX1RhcmdldGVkVXNlcnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVGFyZ2V0ZWRVc2Vycyk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfcXJjb2RlUmVhY3QgPSByZXF1aXJlKCdxcmNvZGUucmVhY3QnKTtcblxudmFyIF9xcmNvZGVSZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9xcmNvZGVSZWFjdCk7XG5cbnZhciBfY2xpcGJvYXJkID0gcmVxdWlyZSgnY2xpcGJvYXJkJyk7XG5cbnZhciBfY2xpcGJvYXJkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NsaXBib2FyZCk7XG5cbnZhciBfbWFpbkFjdGlvbkJ1dHRvbiA9IHJlcXVpcmUoJy4uL21haW4vQWN0aW9uQnV0dG9uJyk7XG5cbnZhciBfbWFpbkFjdGlvbkJ1dHRvbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYWluQWN0aW9uQnV0dG9uKTtcblxudmFyIF9weWRpb1V0aWxQYXRoID0gcmVxdWlyZSgncHlkaW8vdXRpbC9wYXRoJyk7XG5cbnZhciBfcHlkaW9VdGlsUGF0aDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb1V0aWxQYXRoKTtcblxudmFyIF9weWRpb1V0aWxMYW5nID0gcmVxdWlyZSgncHlkaW8vdXRpbC9sYW5nJyk7XG5cbnZhciBfcHlkaW9VdGlsTGFuZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb1V0aWxMYW5nKTtcblxudmFyIF9tYXRlcmlhbFVpU3R5bGVzID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWkvc3R5bGVzJyk7XG5cbnZhciBfbWFpblNoYXJlSGVscGVyID0gcmVxdWlyZSgnLi4vbWFpbi9TaGFyZUhlbHBlcicpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYWluU2hhcmVIZWxwZXIpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfTGlua01vZGVsID0gcmVxdWlyZSgnLi9MaW5rTW9kZWwnKTtcblxudmFyIF9MaW5rTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfTGlua01vZGVsKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoXCJib290XCIpO1xuXG52YXIgVG9vbHRpcCA9IF9QeWRpbyRyZXF1aXJlTGliLlRvb2x0aXA7XG5cbnZhciBQdWJsaWNMaW5rRmllbGQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnUHVibGljTGlua0ZpZWxkJyxcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBsaW5rTW9kZWw6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuaW5zdGFuY2VPZihfTGlua01vZGVsMlsnZGVmYXVsdCddKSxcbiAgICAgICAgZWRpdEFsbG93ZWQ6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgb25DaGFuZ2U6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgc2hvd01haWxlcjogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jXG4gICAgfSxcbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHsgZWRpdExpbms6IGZhbHNlLCBjb3B5TWVzc2FnZTogJycsIHNob3dRUkNvZGU6IGZhbHNlIH07XG4gICAgfSxcbiAgICB0b2dnbGVFZGl0TW9kZTogZnVuY3Rpb24gdG9nZ2xlRWRpdE1vZGUoKSB7XG4gICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgbGlua01vZGVsID0gX3Byb3BzLmxpbmtNb2RlbDtcbiAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVkaXRMaW5rICYmIHRoaXMuc3RhdGUuY3VzdG9tTGluaykge1xuICAgICAgICAgICAgdmFyIGF1dGggPSBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLmdldEF1dGhvcml6YXRpb25zKHB5ZGlvKTtcbiAgICAgICAgICAgIGlmIChhdXRoLmhhc2hfbWluX2xlbmd0aCAmJiB0aGlzLnN0YXRlLmN1c3RvbUxpbmsubGVuZ3RoIDwgYXV0aC5oYXNoX21pbl9sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBweWRpby5VSS5kaXNwbGF5TWVzc2FnZSgnRVJST1InLCB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzIyMycpLnJlcGxhY2UoJyVzJywgYXV0aC5oYXNoX21pbl9sZW5ndGgpKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsaW5rTW9kZWwuc2V0Q3VzdG9tTGluayh0aGlzLnN0YXRlLmN1c3RvbUxpbmspO1xuICAgICAgICAgICAgbGlua01vZGVsLnNhdmUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZWRpdExpbms6ICF0aGlzLnN0YXRlLmVkaXRMaW5rLCBjdXN0b21MaW5rOiB1bmRlZmluZWQgfSk7XG4gICAgfSxcbiAgICBjaGFuZ2VMaW5rOiBmdW5jdGlvbiBjaGFuZ2VMaW5rKGV2ZW50KSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICAgICAgdmFsdWUgPSBfcHlkaW9VdGlsTGFuZzJbJ2RlZmF1bHQnXS5jb21wdXRlU3RyaW5nU2x1Zyh2YWx1ZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjdXN0b21MaW5rOiB2YWx1ZSB9KTtcbiAgICB9LFxuICAgIGNsZWFyQ29weU1lc3NhZ2U6IGZ1bmN0aW9uIGNsZWFyQ29weU1lc3NhZ2UoKSB7XG4gICAgICAgIGdsb2JhbC5zZXRUaW1lb3V0KChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29weU1lc3NhZ2U6ICcnIH0pO1xuICAgICAgICB9KS5iaW5kKHRoaXMpLCA1MDAwKTtcbiAgICB9LFxuXG4gICAgYXR0YWNoQ2xpcGJvYXJkOiBmdW5jdGlvbiBhdHRhY2hDbGlwYm9hcmQoKSB7XG4gICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIGxpbmtNb2RlbCA9IF9wcm9wczIubGlua01vZGVsO1xuICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMyLnB5ZGlvO1xuXG4gICAgICAgIHRoaXMuZGV0YWNoQ2xpcGJvYXJkKCk7XG4gICAgICAgIGlmICh0aGlzLnJlZnNbJ2NvcHktYnV0dG9uJ10pIHtcbiAgICAgICAgICAgIHRoaXMuX2NsaXAgPSBuZXcgX2NsaXBib2FyZDJbJ2RlZmF1bHQnXSh0aGlzLnJlZnNbJ2NvcHktYnV0dG9uJ10sIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiAoZnVuY3Rpb24gKHRyaWdnZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uYnVpbGRQdWJsaWNVcmwocHlkaW8sIGxpbmtNb2RlbC5nZXRMaW5rKCkuTGlua0hhc2gpO1xuICAgICAgICAgICAgICAgIH0pLmJpbmQodGhpcylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5fY2xpcC5vbignc3VjY2VzcycsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvcHlNZXNzYWdlOiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE5MicpIH0sIHRoaXMuY2xlYXJDb3B5TWVzc2FnZSk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMuX2NsaXAub24oJ2Vycm9yJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29weU1lc3NhZ2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKGdsb2JhbC5uYXZpZ2F0b3IucGxhdGZvcm0uaW5kZXhPZihcIk1hY1wiKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb3B5TWVzc2FnZSA9IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTQ0Jyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29weU1lc3NhZ2UgPSB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE0MycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnJlZnNbJ3B1YmxpYy1saW5rLWZpZWxkJ10uZm9jdXMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29weU1lc3NhZ2U6IGNvcHlNZXNzYWdlIH0sIHRoaXMuY2xlYXJDb3B5TWVzc2FnZSk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZGV0YWNoQ2xpcGJvYXJkOiBmdW5jdGlvbiBkZXRhY2hDbGlwYm9hcmQoKSB7XG4gICAgICAgIGlmICh0aGlzLl9jbGlwKSB7XG4gICAgICAgICAgICB0aGlzLl9jbGlwLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHMsIHByZXZTdGF0ZSkge1xuICAgICAgICB0aGlzLmF0dGFjaENsaXBib2FyZCgpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuYXR0YWNoQ2xpcGJvYXJkKCk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy5kZXRhY2hDbGlwYm9hcmQoKTtcbiAgICB9LFxuXG4gICAgb3Blbk1haWxlcjogZnVuY3Rpb24gb3Blbk1haWxlcigpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5zaG93TWFpbGVyKHRoaXMucHJvcHMubGlua01vZGVsKTtcbiAgICB9LFxuXG4gICAgdG9nZ2xlUVJDb2RlOiBmdW5jdGlvbiB0b2dnbGVRUkNvZGUoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzaG93UVJDb2RlOiAhdGhpcy5zdGF0ZS5zaG93UVJDb2RlIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB2YXIgX3Byb3BzMyA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBsaW5rTW9kZWwgPSBfcHJvcHMzLmxpbmtNb2RlbDtcbiAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzMy5weWRpbztcblxuICAgICAgICB2YXIgcHVibGljTGluayA9IF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uYnVpbGRQdWJsaWNVcmwocHlkaW8sIGxpbmtNb2RlbC5nZXRMaW5rKCkuTGlua0hhc2gpO1xuICAgICAgICB2YXIgYXV0aCA9IF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uZ2V0QXV0aG9yaXphdGlvbnMocHlkaW8pO1xuICAgICAgICB2YXIgZWRpdEFsbG93ZWQgPSB0aGlzLnByb3BzLmVkaXRBbGxvd2VkICYmIGF1dGguZWRpdGFibGVfaGFzaCAmJiAhdGhpcy5wcm9wcy5pc1JlYWRvbmx5KCkgJiYgbGlua01vZGVsLmlzRWRpdGFibGUoKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZWRpdExpbmsgJiYgZWRpdEFsbG93ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBiYWNrZ3JvdW5kQ29sb3I6ICcjZjVmNWY1JywgcGFkZGluZzogJzAgNnB4JywgbWFyZ2luOiAnMCAtNnB4JywgYm9yZGVyUmFkaXVzOiAyIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZvbnRTaXplOiAxNiwgY29sb3I6ICdyZ2JhKDAsMCwwLDAuNCknLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgbWF4V2lkdGg6IDE2MCwgd2hpdGVTcGFjZTogJ25vd3JhcCcsIG92ZXJmbG93OiAnaGlkZGVuJywgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9weWRpb1V0aWxQYXRoMlsnZGVmYXVsdCddLmdldERpcm5hbWUocHVibGljTGluaykgKyAnLyAnXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRleHRGaWVsZCwgeyBzdHlsZTogeyBmbGV4OiAxLCBtYXJnaW5SaWdodDogMTAsIG1hcmdpbkxlZnQ6IDEwIH0sIG9uQ2hhbmdlOiB0aGlzLmNoYW5nZUxpbmssIHZhbHVlOiB0aGlzLnN0YXRlLmN1c3RvbUxpbmsgIT09IHVuZGVmaW5lZCA/IHRoaXMuc3RhdGUuY3VzdG9tTGluayA6IGxpbmtNb2RlbC5nZXRMaW5rKCkuTGlua0hhc2ggfSksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYWluQWN0aW9uQnV0dG9uMlsnZGVmYXVsdCddLCB7IG1kaUljb246ICdjaGVjaycsIGNhbGxiYWNrOiB0aGlzLnRvZ2dsZUVkaXRNb2RlIH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgdGV4dEFsaWduOiAnY2VudGVyJywgZm9udFNpemU6IDEzLCBjb2xvcjogJ3JnYmEoMCwwLDAsMC40MyknLCBwYWRkaW5nVG9wOiAxNiB9IH0sXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTk0JylcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgY29weU1lc3NhZ2UgPSBfc3RhdGUuY29weU1lc3NhZ2U7XG4gICAgICAgICAgICB2YXIgbGlua1Rvb2x0aXAgPSBfc3RhdGUubGlua1Rvb2x0aXA7XG5cbiAgICAgICAgICAgIHZhciBzZXRIdG1sID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBfX2h0bWw6IHRoaXMuc3RhdGUuY29weU1lc3NhZ2UgfTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcyk7XG4gICAgICAgICAgICB2YXIgYWN0aW9uTGlua3MgPSBbXSxcbiAgICAgICAgICAgICAgICBxckNvZGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgbXVpVGhlbWUgPSB0aGlzLnByb3BzLm11aVRoZW1lO1xuXG4gICAgICAgICAgICBhY3Rpb25MaW5rcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiBcImNvcHlcIixcbiAgICAgICAgICAgICAgICAgICAgcmVmOiAnY29weS1idXR0b24nLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBwb3NpdGlvbjogJ3JlbGF0aXZlJywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIHdpZHRoOiAzNiwgaGVpZ2h0OiAzNiwgcGFkZGluZzogJzhweCAxMHB4JywgbWFyZ2luOiAnMCA2cHgnLCBjdXJzb3I6ICdwb2ludGVyJywgYm9yZGVyUmFkaXVzOiAnNTAlJywgYm9yZGVyOiAnMXB4IHNvbGlkICcgKyBtdWlUaGVtZS5wYWxldHRlLnByaW1hcnkxQ29sb3IgfSxcbiAgICAgICAgICAgICAgICAgICAgb25Nb3VzZU92ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgbGlua1Rvb2x0aXA6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG9uTW91c2VPdXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgbGlua1Rvb2x0aXA6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChUb29sdGlwLCB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBjb3B5TWVzc2FnZSA/IGNvcHlNZXNzYWdlIDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcxOTEnKSxcbiAgICAgICAgICAgICAgICAgICAgaG9yaXpvbnRhbFBvc2l0aW9uOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNhbFBvc2l0aW9uOiBcImJvdHRvbVwiLFxuICAgICAgICAgICAgICAgICAgICBzaG93OiBsaW5rVG9vbHRpcFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdjb3B5LWxpbmstYnV0dG9uIG1kaSBtZGktY29udGVudC1jb3B5Jywgc3R5bGU6IHsgY29sb3I6IG11aVRoZW1lLnBhbGV0dGUucHJpbWFyeTFDb2xvciB9IH0pXG4gICAgICAgICAgICApKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc2hvd01haWxlcikge1xuICAgICAgICAgICAgICAgIGFjdGlvbkxpbmtzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21haW5BY3Rpb25CdXR0b24yWydkZWZhdWx0J10sIHsga2V5OiAnb3V0bGluZScsIGNhbGxiYWNrOiB0aGlzLm9wZW5NYWlsZXIsIG1kaUljb246ICdlbWFpbC1vdXRsaW5lJywgbWVzc2FnZUlkOiAnNDUnIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlZGl0QWxsb3dlZCkge1xuICAgICAgICAgICAgICAgIGFjdGlvbkxpbmtzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21haW5BY3Rpb25CdXR0b24yWydkZWZhdWx0J10sIHsga2V5OiAncGVuY2lsJywgY2FsbGJhY2s6IHRoaXMudG9nZ2xlRWRpdE1vZGUsIG1kaUljb246ICdwZW5jaWwnLCBtZXNzYWdlSWQ6IFwiMTkzXCIgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10ucXJjb2RlRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAgICAgYWN0aW9uTGlua3MucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWFpbkFjdGlvbkJ1dHRvbjJbJ2RlZmF1bHQnXSwgeyBrZXk6ICdxcmNvZGUnLCBjYWxsYmFjazogdGhpcy50b2dnbGVRUkNvZGUsIG1kaUljb246ICdxcmNvZGUnLCBtZXNzYWdlSWQ6ICc5NCcgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFjdGlvbkxpbmtzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGFjdGlvbkxpbmtzID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgbWFyZ2luOiAnMjBweCAwIDEwcHgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IHN0eWxlOiB7IGZsZXg6IDEgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uTGlua3MsXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25MaW5rcyA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5zaG93UVJDb2RlKSB7XG4gICAgICAgICAgICAgICAgcXJDb2RlID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBhcGVyLFxuICAgICAgICAgICAgICAgICAgICB7IHpEZXB0aDogMSwgc3R5bGU6IHsgd2lkdGg6IDEyMCwgcGFkZGluZ1RvcDogMTAsIG92ZXJmbG93OiAnaGlkZGVuJywgbWFyZ2luOiAnMCBhdXRvJywgaGVpZ2h0OiAxMjAsIHRleHRBbGlnbjogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfcXJjb2RlUmVhY3QyWydkZWZhdWx0J10sIHsgc2l6ZTogMTAwLCB2YWx1ZTogcHVibGljTGluaywgbGV2ZWw6ICdRJyB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHFyQ29kZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlBhcGVyLCB7IHpEZXB0aDogMCwgc3R5bGU6IHsgd2lkdGg6IDEyMCwgb3ZlcmZsb3c6ICdoaWRkZW4nLCBtYXJnaW46ICcwIGF1dG8nLCBoZWlnaHQ6IDAsIHRleHRBbGlnbjogJ2NlbnRlcicgfSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5QYXBlcixcbiAgICAgICAgICAgICAgICB7IHpEZXB0aDogMCwgcm91bmRlZDogZmFsc2UsIGNsYXNzTmFtZTogJ3B1YmxpYy1saW5rLWNvbnRhaW5lcicgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRleHRGaWVsZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0xpbmsnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiAncHVibGljLWxpbmstZmllbGQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHB1YmxpY0xpbmssXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkZvY3VzOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUudGFyZ2V0LnNlbGVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGhlaWdodDogNDAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0U3R5bGU6IHsgdGV4dEFsaWduOiAnY2VudGVyJywgYmFja2dyb3VuZENvbG9yOiAnI2Y1ZjVmNScsIGJvcmRlclJhZGl1czogMiwgcGFkZGluZzogJzAgNXB4JyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5kZXJsaW5lU3R5bGU6IHsgYm9yZGVyQ29sb3I6ICcjZjVmNWY1JywgdGV4dERlY29yYXRpb246IGxpbmtNb2RlbC5pc0V4cGlyZWQoKSA/ICdsaW5lLXRocm91Z2gnIDogbnVsbCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5kZXJsaW5lRm9jdXNTdHlsZTogeyBib3R0b206IDAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgZmFsc2UgJiYgdGhpcy5wcm9wcy5saW5rRGF0YS50YXJnZXRfdXNlcnMgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX1RhcmdldGVkVXNlcnMyWydkZWZhdWx0J10sIHRoaXMucHJvcHMpLFxuICAgICAgICAgICAgICAgIGFjdGlvbkxpbmtzLFxuICAgICAgICAgICAgICAgIHFyQ29kZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBQdWJsaWNMaW5rRmllbGQgPSAoMCwgX21hdGVyaWFsVWlTdHlsZXMubXVpVGhlbWVhYmxlKSgpKFB1YmxpY0xpbmtGaWVsZCk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBQdWJsaWNMaW5rRmllbGQgPSAoMCwgX1NoYXJlQ29udGV4dENvbnN1bWVyMlsnZGVmYXVsdCddKShQdWJsaWNMaW5rRmllbGQpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gUHVibGljTGlua0ZpZWxkO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfTGlua01vZGVsID0gcmVxdWlyZSgnLi9MaW5rTW9kZWwnKTtcblxudmFyIF9MaW5rTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfTGlua01vZGVsKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2hvYycpO1xuXG52YXIgTW9kZXJuVGV4dEZpZWxkID0gX1B5ZGlvJHJlcXVpcmVMaWIuTW9kZXJuVGV4dEZpZWxkO1xuXG52YXIgTGFiZWxQYW5lbCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhMYWJlbFBhbmVsLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIExhYmVsUGFuZWwoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBMYWJlbFBhbmVsKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihMYWJlbFBhbmVsLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKExhYmVsUGFuZWwsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcbiAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSBfcHJvcHMubGlua01vZGVsO1xuXG4gICAgICAgICAgICB2YXIgbSA9IGZ1bmN0aW9uIG0oaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci4nICsgaWRdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciBsaW5rID0gbGlua01vZGVsLmdldExpbmsoKTtcbiAgICAgICAgICAgIHZhciB1cGRhdGVMYWJlbCA9IGZ1bmN0aW9uIHVwZGF0ZUxhYmVsKGUsIHYpIHtcbiAgICAgICAgICAgICAgICBsaW5rLkxhYmVsID0gdjtcbiAgICAgICAgICAgICAgICBsaW5rTW9kZWwudXBkYXRlTGluayhsaW5rKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciB1cGRhdGVEZXNjcmlwdGlvbiA9IGZ1bmN0aW9uIHVwZGF0ZURlc2NyaXB0aW9uKGUsIHYpIHtcbiAgICAgICAgICAgICAgICBsaW5rLkRlc2NyaXB0aW9uID0gdjtcbiAgICAgICAgICAgICAgICBsaW5rTW9kZWwudXBkYXRlTGluayhsaW5rKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE1vZGVyblRleHRGaWVsZCwgeyBmbG9hdGluZ0xhYmVsVGV4dDogbSgyNjUpLCB2YWx1ZTogbGluay5MYWJlbCwgb25DaGFuZ2U6IHVwZGF0ZUxhYmVsLCBmdWxsV2lkdGg6IHRydWUgfSksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoTW9kZXJuVGV4dEZpZWxkLCB7IGZsb2F0aW5nTGFiZWxUZXh0OiBtKDI2NiksIHZhbHVlOiBsaW5rLkRlc2NyaXB0aW9uLCBvbkNoYW5nZTogdXBkYXRlRGVzY3JpcHRpb24sIGZ1bGxXaWR0aDogdHJ1ZSB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBMYWJlbFBhbmVsO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbkxhYmVsUGFuZWwuUHJvcFR5cGVzID0ge1xuXG4gICAgcHlkaW86IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuaW5zdGFuY2VPZihfcHlkaW8yWydkZWZhdWx0J10pLFxuICAgIGxpbmtNb2RlbDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKF9MaW5rTW9kZWwyWydkZWZhdWx0J10pXG5cbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IExhYmVsUGFuZWw7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcHlkaW9IdHRwQXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9weWRpb0h0dHBBcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwQXBpKTtcblxudmFyIF9weWRpb0xhbmdPYnNlcnZhYmxlID0gcmVxdWlyZSgncHlkaW8vbGFuZy9vYnNlcnZhYmxlJyk7XG5cbnZhciBfcHlkaW9MYW5nT2JzZXJ2YWJsZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb0xhbmdPYnNlcnZhYmxlKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIgPSByZXF1aXJlKCcuLi9tYWluL1NoYXJlSGVscGVyJyk7XG5cbnZhciBfbWFpblNoYXJlSGVscGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21haW5TaGFyZUhlbHBlcik7XG5cbnZhciBfcHlkaW9IdHRwUmVzdEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvcmVzdC1hcGknKTtcblxudmFyIF9weWRpb1V0aWxQYXNzID0gcmVxdWlyZSgncHlkaW8vdXRpbC9wYXNzJyk7XG5cbnZhciBfcHlkaW9VdGlsUGFzczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb1V0aWxQYXNzKTtcblxudmFyIExpbmtNb2RlbCA9IChmdW5jdGlvbiAoX09ic2VydmFibGUpIHtcbiAgICBfaW5oZXJpdHMoTGlua01vZGVsLCBfT2JzZXJ2YWJsZSk7XG5cbiAgICBmdW5jdGlvbiBMaW5rTW9kZWwoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBMaW5rTW9kZWwpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKExpbmtNb2RlbC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMpO1xuICAgICAgICB0aGlzLmxpbmsgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuUmVzdFNoYXJlTGluaygpO1xuICAgICAgICB0aGlzLmxpbmsuUGVybWlzc2lvbnMgPSBbX3B5ZGlvSHR0cFJlc3RBcGkuUmVzdFNoYXJlTGlua0FjY2Vzc1R5cGUuY29uc3RydWN0RnJvbU9iamVjdChcIlByZXZpZXdcIiksIF9weWRpb0h0dHBSZXN0QXBpLlJlc3RTaGFyZUxpbmtBY2Nlc3NUeXBlLmNvbnN0cnVjdEZyb21PYmplY3QoXCJEb3dubG9hZFwiKV07XG4gICAgICAgIHRoaXMubGluay5Qb2xpY2llcyA9IFtdO1xuICAgICAgICB0aGlzLmxpbmsuUG9saWNpZXNDb250ZXh0RWRpdGFibGUgPSB0cnVlO1xuICAgICAgICB0aGlzLmxpbmsuUm9vdE5vZGVzID0gW107XG4gICAgICAgIHRoaXMuVmFsaWRQYXNzd29yZCA9IHRydWU7XG4gICAgICAgIHRoaXMubG9hZEVycm9yID0gbnVsbDtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoTGlua01vZGVsLCBbe1xuICAgICAgICBrZXk6ICdoYXNFcnJvcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBoYXNFcnJvcigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxvYWRFcnJvcjtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnaXNFZGl0YWJsZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBpc0VkaXRhYmxlKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGluay5Qb2xpY2llc0NvbnRleHRFZGl0YWJsZTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnaXNEaXJ0eScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBpc0RpcnR5KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGlydHk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldExpbmtVdWlkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldExpbmtVdWlkKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGluay5VdWlkO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZXR1cm4ge1Jlc3RTaGFyZUxpbmt9XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0TGluaycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRMaW5rKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGluaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0UHVibGljVXJsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldFB1YmxpY1VybCgpIHtcbiAgICAgICAgICAgIHJldHVybiBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLmJ1aWxkUHVibGljVXJsKHB5ZGlvLCB0aGlzLmxpbmsuTGlua0hhc2gpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSBsaW5rIHtSZXN0U2hhcmVMaW5rfVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3VwZGF0ZUxpbmsnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlTGluayhsaW5rKSB7XG4gICAgICAgICAgICB0aGlzLmxpbmsgPSBsaW5rO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnlEaXJ0eSgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdub3RpZnlEaXJ0eScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBub3RpZnlEaXJ0eSgpIHtcbiAgICAgICAgICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ3VwZGF0ZScpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZXZlcnRDaGFuZ2VzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJldmVydENoYW5nZXMoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vcmlnaW5hbExpbmspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxpbmsgPSB0aGlzLmNsb25lKHRoaXMub3JpZ2luYWxMaW5rKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQYXNzd29yZCA9IHRoaXMuY3JlYXRlUGFzc3dvcmQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuVmFsaWRQYXNzd29yZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdoYXNQZXJtaXNzaW9uJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGhhc1Blcm1pc3Npb24ocGVybWlzc2lvblZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saW5rLlBlcm1pc3Npb25zLmZpbHRlcihmdW5jdGlvbiAocGVybSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwZXJtID09PSBwZXJtaXNzaW9uVmFsdWU7XG4gICAgICAgICAgICB9KS5sZW5ndGggPiAwO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdpc0V4cGlyZWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gaXNFeHBpcmVkKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubGluay5NYXhEb3dubG9hZHMgJiYgcGFyc2VJbnQodGhpcy5saW5rLkN1cnJlbnREb3dubG9hZHMpID49IHBhcnNlSW50KHRoaXMubGluay5NYXhEb3dubG9hZHMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5saW5rLkFjY2Vzc0VuZCkge1xuICAgICAgICAgICAgICAgIC8vIFRPRE9cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gdXVpZCBzdHJpbmdcbiAgICAgICAgICogQHJldHVybiB7UHJvbWlzZS48UmVzdFNoYXJlTGluaz59XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbG9hZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBsb2FkKHV1aWQpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuU2hhcmVTZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgICAgIHJldHVybiBhcGkuZ2V0U2hhcmVMaW5rKHV1aWQpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIF90aGlzLmxpbmsgPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5saW5rLlBlcm1pc3Npb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmxpbmsuUGVybWlzc2lvbnMgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5saW5rLlBvbGljaWVzKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmxpbmsuUG9saWNpZXMgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5saW5rLlJvb3ROb2Rlcykge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5saW5rLlJvb3ROb2RlcyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfdGhpcy5vcmlnaW5hbExpbmsgPSBfdGhpcy5jbG9uZShfdGhpcy5saW5rKTtcbiAgICAgICAgICAgICAgICBfdGhpcy5ub3RpZnkoXCJ1cGRhdGVcIik7XG4gICAgICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMubG9hZEVycm9yID0gZXJyO1xuICAgICAgICAgICAgICAgIF90aGlzLm5vdGlmeShcInVwZGF0ZVwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzZXRDcmVhdGVQYXNzd29yZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRDcmVhdGVQYXNzd29yZChwYXNzd29yZCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmIChwYXNzd29yZCkge1xuICAgICAgICAgICAgICAgIF9weWRpb1V0aWxQYXNzMlsnZGVmYXVsdCddLmNoZWNrUGFzc3dvcmRTdHJlbmd0aChwYXNzd29yZCwgZnVuY3Rpb24gKG9rLCBtc2cpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMyLlZhbGlkUGFzc3dvcmQgPSBvaztcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMyLlZhbGlkUGFzc3dvcmRNZXNzYWdlID0gbXNnO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLlZhbGlkUGFzc3dvcmQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jcmVhdGVQYXNzd29yZCA9IHBhc3N3b3JkO1xuICAgICAgICAgICAgdGhpcy5saW5rLlBhc3N3b3JkUmVxdWlyZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnlEaXJ0eSgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzZXRVcGRhdGVQYXNzd29yZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRVcGRhdGVQYXNzd29yZChwYXNzd29yZCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmIChwYXNzd29yZCkge1xuICAgICAgICAgICAgICAgIF9weWRpb1V0aWxQYXNzMlsnZGVmYXVsdCddLmNoZWNrUGFzc3dvcmRTdHJlbmd0aChwYXNzd29yZCwgZnVuY3Rpb24gKG9rLCBtc2cpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMzLlZhbGlkUGFzc3dvcmQgPSBvaztcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMzLlZhbGlkUGFzc3dvcmRNZXNzYWdlID0gbXNnO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLlZhbGlkUGFzc3dvcmQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy51cGRhdGVQYXNzd29yZCA9IHBhc3N3b3JkO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnlEaXJ0eSgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzZXRDdXN0b21MaW5rJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNldEN1c3RvbUxpbmsobmV3TGluaykge1xuICAgICAgICAgICAgdGhpcy5jdXN0b21MaW5rID0gbmV3TGluaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcmV0dXJuIHsqfFByb21pc2UuPFJlc3RTaGFyZUxpbms+fVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3NhdmUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2F2ZSgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuVmFsaWRQYXNzd29yZCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih0aGlzLlZhbGlkUGFzc3dvcmRNZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuU2hhcmVTZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLlJlc3RQdXRTaGFyZUxpbmtSZXF1ZXN0KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5jcmVhdGVQYXNzd29yZCkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QuUGFzc3dvcmRFbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXF1ZXN0LkNyZWF0ZVBhc3N3b3JkID0gdGhpcy5jcmVhdGVQYXNzd29yZDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy51cGRhdGVQYXNzd29yZCkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QuUGFzc3dvcmRFbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubGluay5QYXNzd29yZFJlcXVpcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QuQ3JlYXRlUGFzc3dvcmQgPSB0aGlzLnVwZGF0ZVBhc3N3b3JkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QuVXBkYXRlUGFzc3dvcmQgPSB0aGlzLnVwZGF0ZVBhc3N3b3JkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5QYXNzd29yZEVuYWJsZWQgPSB0aGlzLmxpbmsuUGFzc3dvcmRSZXF1aXJlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLmdldEF1dGhvcml6YXRpb25zKHB5ZGlvKS5wYXNzd29yZF9tYW5kYXRvcnkgJiYgIXJlcXVlc3QuUGFzc3dvcmRFbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgY2Fubm90IGRpc2FibGUgcGFzc293cmQgb24gdGhpcyBsaW5rJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5jdXN0b21MaW5rICYmIHRoaXMuY3VzdG9tTGluayAhPT0gdGhpcy5saW5rLkxpbmtIYXNoKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5VcGRhdGVDdXN0b21IYXNoID0gdGhpcy5jdXN0b21MaW5rO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVxdWVzdC5TaGFyZUxpbmsgPSB0aGlzLmxpbms7XG4gICAgICAgICAgICByZXR1cm4gYXBpLnB1dFNoYXJlTGluayhyZXF1ZXN0KS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBfdGhpczQubGluayA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICBfdGhpczQuZGlydHkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBfdGhpczQub3JpZ2luYWxMaW5rID0gX3RoaXM0LmNsb25lKF90aGlzNC5saW5rKTtcbiAgICAgICAgICAgICAgICBfdGhpczQudXBkYXRlUGFzc3dvcmQgPSBfdGhpczQuY3JlYXRlUGFzc3dvcmQgPSBfdGhpczQuY3VzdG9tTGluayA9IG51bGw7XG4gICAgICAgICAgICAgICAgX3RoaXM0LlZhbGlkUGFzc3dvcmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIF90aGlzNC5ub3RpZnkoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgICAgIF90aGlzNC5ub3RpZnkoJ3NhdmUnKTtcbiAgICAgICAgICAgIH0pWydjYXRjaCddKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICB2YXIgbXNnID0gZXJyLkRldGFpbCB8fCBlcnIubWVzc2FnZSB8fCBlcnI7XG4gICAgICAgICAgICAgICAgUHlkaW8uZ2V0SW5zdGFuY2UoKS5VSS5kaXNwbGF5TWVzc2FnZSgnRVJST1InLCBtc2cpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHJldHVybiB7KnxQcm9taXNlLjxSZXN0U2hhcmVMaW5rPn1cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdkZWxldGVMaW5rJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlbGV0ZUxpbmsoZW1wdHlMaW5rKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXM1ID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5TaGFyZVNlcnZpY2VBcGkoX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCkpO1xuICAgICAgICAgICAgcmV0dXJuIGFwaS5kZWxldGVTaGFyZUxpbmsodGhpcy5saW5rLlV1aWQpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIF90aGlzNS5saW5rID0gZW1wdHlMaW5rO1xuICAgICAgICAgICAgICAgIF90aGlzNS5kaXJ0eSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIF90aGlzNS51cGRhdGVQYXNzd29yZCA9IF90aGlzNS5jcmVhdGVQYXNzd29yZCA9IF90aGlzNS5jdXN0b21MaW5rID0gbnVsbDtcbiAgICAgICAgICAgICAgICBfdGhpczUubm90aWZ5KCd1cGRhdGUnKTtcbiAgICAgICAgICAgICAgICBfdGhpczUubm90aWZ5KCdkZWxldGUnKTtcbiAgICAgICAgICAgIH0pWydjYXRjaCddKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICB2YXIgbXNnID0gZXJyLkRldGFpbCB8fCBlcnIubWVzc2FnZSB8fCBlcnI7XG4gICAgICAgICAgICAgICAgcHlkaW8uVUkuZGlzcGxheU1lc3NhZ2UoJ0VSUk9SJywgbXNnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSBsaW5rIHtSZXN0U2hhcmVMaW5rfVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Nsb25lJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNsb25lKGxpbmspIHtcbiAgICAgICAgICAgIHJldHVybiBfcHlkaW9IdHRwUmVzdEFwaS5SZXN0U2hhcmVMaW5rLmNvbnN0cnVjdEZyb21PYmplY3QoSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShsaW5rKSkpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIExpbmtNb2RlbDtcbn0pKF9weWRpb0xhbmdPYnNlcnZhYmxlMlsnZGVmYXVsdCddKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gTGlua01vZGVsO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyID0gcmVxdWlyZSgnLi4vU2hhcmVDb250ZXh0Q29uc3VtZXInKTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TaGFyZUNvbnRleHRDb25zdW1lcik7XG5cbnZhciBfRmllbGQgPSByZXF1aXJlKCcuL0ZpZWxkJyk7XG5cbnZhciBfRmllbGQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfRmllbGQpO1xuXG52YXIgX1Blcm1pc3Npb25zID0gcmVxdWlyZSgnLi9QZXJtaXNzaW9ucycpO1xuXG52YXIgX1Blcm1pc3Npb25zMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1Blcm1pc3Npb25zKTtcblxudmFyIF9UYXJnZXRlZFVzZXJzID0gcmVxdWlyZSgnLi9UYXJnZXRlZFVzZXJzJyk7XG5cbnZhciBfVGFyZ2V0ZWRVc2VyczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9UYXJnZXRlZFVzZXJzKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9MaW5rTW9kZWwgPSByZXF1aXJlKCcuL0xpbmtNb2RlbCcpO1xuXG52YXIgX0xpbmtNb2RlbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9MaW5rTW9kZWwpO1xuXG52YXIgX2NvbXBvc2l0ZUNvbXBvc2l0ZU1vZGVsID0gcmVxdWlyZSgnLi4vY29tcG9zaXRlL0NvbXBvc2l0ZU1vZGVsJyk7XG5cbnZhciBfY29tcG9zaXRlQ29tcG9zaXRlTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY29tcG9zaXRlQ29tcG9zaXRlTW9kZWwpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfbWFpblNoYXJlSGVscGVyID0gcmVxdWlyZSgnLi4vbWFpbi9TaGFyZUhlbHBlcicpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYWluU2hhcmVIZWxwZXIpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignZm9ybScpO1xuXG52YXIgVmFsaWRQYXNzd29yZCA9IF9QeWRpbyRyZXF1aXJlTGliLlZhbGlkUGFzc3dvcmQ7XG5cbnZhciBQdWJsaWNMaW5rUGFuZWwgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnUHVibGljTGlua1BhbmVsJyxcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBsaW5rTW9kZWw6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuaW5zdGFuY2VPZihfTGlua01vZGVsMlsnZGVmYXVsdCddKSxcbiAgICAgICAgY29tcG9zaXRlTW9kZWw6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuaW5zdGFuY2VPZihfY29tcG9zaXRlQ29tcG9zaXRlTW9kZWwyWydkZWZhdWx0J10pLFxuICAgICAgICBweWRpbzogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKF9weWRpbzJbJ2RlZmF1bHQnXSksXG4gICAgICAgIGF1dGhvcml6YXRpb25zOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgICAgc2hvd01haWxlcjogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jXG4gICAgfSxcblxuICAgIHRvZ2dsZUxpbms6IGZ1bmN0aW9uIHRvZ2dsZUxpbmsoKSB7XG4gICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgbGlua01vZGVsID0gX3Byb3BzLmxpbmtNb2RlbDtcbiAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuICAgICAgICB2YXIgc2hvd1RlbXBvcmFyeVBhc3N3b3JkID0gdGhpcy5zdGF0ZS5zaG93VGVtcG9yYXJ5UGFzc3dvcmQ7XG5cbiAgICAgICAgaWYgKHNob3dUZW1wb3JhcnlQYXNzd29yZCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNob3dUZW1wb3JhcnlQYXNzd29yZDogZmFsc2UsIHRlbXBvcmFyeVBhc3N3b3JkOiBudWxsIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKCFsaW5rTW9kZWwuZ2V0TGlua1V1aWQoKSAmJiBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLmdldEF1dGhvcml6YXRpb25zKHB5ZGlvKS5wYXNzd29yZF9tYW5kYXRvcnkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzaG93VGVtcG9yYXJ5UGFzc3dvcmQ6IHRydWUsIHRlbXBvcmFyeVBhc3N3b3JkOiAnJyB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChsaW5rTW9kZWwuZ2V0TGlua1V1aWQoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuY29tcG9zaXRlTW9kZWwuZGVsZXRlTGluayhsaW5rTW9kZWwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaW5rTW9kZWwuc2F2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4geyBzaG93VGVtcG9yYXJ5UGFzc3dvcmQ6IGZhbHNlLCB0ZW1wb3JhcnlQYXNzd29yZDogbnVsbCwgZGlzYWJsZWQ6IGZhbHNlIH07XG4gICAgfSxcblxuICAgIHVwZGF0ZVRlbXBvcmFyeVBhc3N3b3JkOiBmdW5jdGlvbiB1cGRhdGVUZW1wb3JhcnlQYXNzd29yZCh2YWx1ZSwgZXZlbnQpIHtcbiAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhbHVlID0gZXZlbnQuY3VycmVudFRhcmdldC5nZXRWYWx1ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0ZW1wb3JhcnlQYXNzd29yZDogdmFsdWUgfSk7XG4gICAgfSxcblxuICAgIGVuYWJsZUxpbmtXaXRoUGFzc3dvcmQ6IGZ1bmN0aW9uIGVuYWJsZUxpbmtXaXRoUGFzc3dvcmQoKSB7XG4gICAgICAgIHZhciBsaW5rTW9kZWwgPSB0aGlzLnByb3BzLmxpbmtNb2RlbDtcblxuICAgICAgICBpZiAoIXRoaXMucmVmc1sndmFsaWQtcGFzcyddLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5weWRpby5VSS5kaXNwbGF5TWVzc2FnZSgnRVJST1InLCAnSW52YWxpZCBQYXNzd29yZCcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxpbmtNb2RlbC5zZXRDcmVhdGVQYXNzd29yZCh0aGlzLnN0YXRlLnRlbXBvcmFyeVBhc3N3b3JkKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxpbmtNb2RlbC5zYXZlKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMucHlkaW8uVUkuZGlzcGxheU1lc3NhZ2UoJ0VSUk9SJywgZS5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2hvd1RlbXBvcmFyeVBhc3N3b3JkOiBmYWxzZSwgdGVtcG9yYXJ5UGFzc3dvcmQ6IG51bGwgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgIHZhciBsaW5rTW9kZWwgPSBfcHJvcHMyLmxpbmtNb2RlbDtcbiAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzMi5weWRpbztcbiAgICAgICAgdmFyIGNvbXBvc2l0ZU1vZGVsID0gX3Byb3BzMi5jb21wb3NpdGVNb2RlbDtcblxuICAgICAgICB2YXIgYXV0aG9yaXphdGlvbnMgPSBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLmdldEF1dGhvcml6YXRpb25zKHB5ZGlvKTtcbiAgICAgICAgdmFyIG5vZGVMZWFmID0gY29tcG9zaXRlTW9kZWwuZ2V0Tm9kZSgpLmlzTGVhZigpO1xuICAgICAgICB2YXIgY2FuRW5hYmxlID0gbm9kZUxlYWYgJiYgYXV0aG9yaXphdGlvbnMuZmlsZV9wdWJsaWNfbGluayB8fCAhbm9kZUxlYWYgJiYgYXV0aG9yaXphdGlvbnMuZm9sZGVyX3B1YmxpY19saW5rO1xuXG4gICAgICAgIHZhciBwdWJsaWNMaW5rUGFuZXMgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICBwdWJsaWNMaW5rRmllbGQgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChsaW5rTW9kZWwuZ2V0TGlua1V1aWQoKSkge1xuICAgICAgICAgICAgcHVibGljTGlua0ZpZWxkID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX0ZpZWxkMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgcHlkaW86IHB5ZGlvLFxuICAgICAgICAgICAgICAgIGxpbmtNb2RlbDogbGlua01vZGVsLFxuICAgICAgICAgICAgICAgIHNob3dNYWlsZXI6IHRoaXMucHJvcHMuc2hvd01haWxlcixcbiAgICAgICAgICAgICAgICBlZGl0QWxsb3dlZDogYXV0aG9yaXphdGlvbnMuZWRpdGFibGVfaGFzaCAmJiBsaW5rTW9kZWwuaXNFZGl0YWJsZSgpLFxuICAgICAgICAgICAgICAgIGtleTogJ3B1YmxpYy1saW5rJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwdWJsaWNMaW5rUGFuZXMgPSBbX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRGl2aWRlciwgbnVsbCksIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9QZXJtaXNzaW9uczJbJ2RlZmF1bHQnXSwge1xuICAgICAgICAgICAgICAgIGNvbXBvc2l0ZU1vZGVsOiBjb21wb3NpdGVNb2RlbCxcbiAgICAgICAgICAgICAgICBsaW5rTW9kZWw6IGxpbmtNb2RlbCxcbiAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAga2V5OiAncHVibGljLXBlcm0nXG4gICAgICAgICAgICB9KV07XG4gICAgICAgICAgICBpZiAobGlua01vZGVsLmdldExpbmsoKS5UYXJnZXRVc2Vycykge1xuICAgICAgICAgICAgICAgIHB1YmxpY0xpbmtQYW5lcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIG51bGwpKTtcbiAgICAgICAgICAgICAgICBwdWJsaWNMaW5rUGFuZXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfVGFyZ2V0ZWRVc2VyczJbJ2RlZmF1bHQnXSwgeyBsaW5rTW9kZWw6IGxpbmtNb2RlbCwgcHlkaW86IHB5ZGlvIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnNob3dUZW1wb3JhcnlQYXNzd29yZCkge1xuICAgICAgICAgICAgcHVibGljTGlua0ZpZWxkID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnc2VjdGlvbi1sZWdlbmQnLCBzdHlsZTogeyBtYXJnaW5Ub3A6IDIwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcyMTUnKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiAnMTAwJScgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChWYWxpZFBhc3N3b3JkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiB7IGxhYmVsOiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzIzJykgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnRlbXBvcmFyeVBhc3N3b3JkLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMudXBkYXRlVGVtcG9yYXJ5UGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWY6IFwidmFsaWQtcGFzc1wiXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgdGV4dEFsaWduOiAnY2VudGVyJywgbWFyZ2luVG9wOiAyMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhaXNlZEJ1dHRvbiwgeyBsYWJlbDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCc5MicpLCBzZWNvbmRhcnk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrOiB0aGlzLmVuYWJsZUxpbmtXaXRoUGFzc3dvcmQgfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKCFjYW5FbmFibGUpIHtcbiAgICAgICAgICAgIHB1YmxpY0xpbmtGaWVsZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZm9udFNpemU6IDEzLCBmb250V2VpZ2h0OiA1MDAsIGNvbG9yOiAncmdiYSgwLDAsMCwwLjQzKScsIHBhZGRpbmdCb3R0b206IDE2LCBwYWRkaW5nVG9wOiAxNiB9IH0sXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5nZXRNZXNzYWdlKG5vZGVMZWFmID8gJzIyNScgOiAnMjI2JylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwdWJsaWNMaW5rRmllbGQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogNTAwLCBjb2xvcjogJ3JnYmEoMCwwLDAsMC40MyknLCBwYWRkaW5nQm90dG9tOiAxNiwgcGFkZGluZ1RvcDogMTYgfSB9LFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTkwJylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICB7IHN0eWxlOiB0aGlzLnByb3BzLnN0eWxlIH0sXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmc6ICcxNXB4IDEwcHggMTFweCcsIGJhY2tncm91bmRDb2xvcjogJyNmNWY1ZjUnLCBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2UwZTBlMCcsIGZvbnRTaXplOiAxNSB9IH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVG9nZ2xlLCB7XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLnByb3BzLmlzUmVhZG9ubHkoKSB8fCB0aGlzLnN0YXRlLmRpc2FibGVkIHx8ICFsaW5rTW9kZWwuaXNFZGl0YWJsZSgpIHx8ICFsaW5rTW9kZWwuZ2V0TGlua1V1aWQoKSAmJiAhY2FuRW5hYmxlLFxuICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZTogdGhpcy50b2dnbGVMaW5rLFxuICAgICAgICAgICAgICAgICAgICB0b2dnbGVkOiBsaW5rTW9kZWwuZ2V0TGlua1V1aWQoKSB8fCB0aGlzLnN0YXRlLnNob3dUZW1wb3JhcnlQYXNzd29yZCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTg5JylcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogMjAgfSB9LFxuICAgICAgICAgICAgICAgIHB1YmxpY0xpbmtGaWVsZFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIHB1YmxpY0xpbmtQYW5lc1xuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBQdWJsaWNMaW5rUGFuZWwgPSAoMCwgX1NoYXJlQ29udGV4dENvbnN1bWVyMlsnZGVmYXVsdCddKShQdWJsaWNMaW5rUGFuZWwpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gUHVibGljTGlua1BhbmVsO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIgPSByZXF1aXJlKCcuLi9TaGFyZUNvbnRleHRDb25zdW1lcicpO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1NoYXJlQ29udGV4dENvbnN1bWVyKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9MaW5rTW9kZWwgPSByZXF1aXJlKCcuL0xpbmtNb2RlbCcpO1xuXG52YXIgX0xpbmtNb2RlbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9MaW5rTW9kZWwpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlciA9IHJlcXVpcmUoJy4uL21haW4vU2hhcmVIZWxwZXInKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9weWRpb0h0dHBSZXN0QXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9yZXN0LWFwaScpO1xuXG52YXIgUHVibGljTGlua1Blcm1pc3Npb25zID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1B1YmxpY0xpbmtQZXJtaXNzaW9ucycsXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgbGlua01vZGVsOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoX0xpbmtNb2RlbDJbJ2RlZmF1bHQnXSksXG4gICAgICAgIHN0eWxlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm9iamVjdFxuICAgIH0sXG5cbiAgICBjaGFuZ2VQZXJtaXNzaW9uOiBmdW5jdGlvbiBjaGFuZ2VQZXJtaXNzaW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciBuYW1lID0gZXZlbnQudGFyZ2V0Lm5hbWU7XG4gICAgICAgIHZhciBjaGVja2VkID0gZXZlbnQudGFyZ2V0LmNoZWNrZWQ7XG4gICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgY29tcG9zaXRlTW9kZWwgPSBfcHJvcHMuY29tcG9zaXRlTW9kZWw7XG4gICAgICAgIHZhciBsaW5rTW9kZWwgPSBfcHJvcHMubGlua01vZGVsO1xuXG4gICAgICAgIHZhciBsaW5rID0gbGlua01vZGVsLmdldExpbmsoKTtcbiAgICAgICAgaWYgKGNoZWNrZWQpIHtcbiAgICAgICAgICAgIGxpbmsuUGVybWlzc2lvbnMucHVzaChfcHlkaW9IdHRwUmVzdEFwaS5SZXN0U2hhcmVMaW5rQWNjZXNzVHlwZS5jb25zdHJ1Y3RGcm9tT2JqZWN0KG5hbWUpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxpbmsuUGVybWlzc2lvbnMgPSBsaW5rLlBlcm1pc3Npb25zLmZpbHRlcihmdW5jdGlvbiAocGVybSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwZXJtICE9PSBuYW1lO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbXBvc2l0ZU1vZGVsLmdldE5vZGUoKS5pc0xlYWYoKSkge1xuICAgICAgICAgICAgdmFyIGF1dGggPSBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLmdldEF1dGhvcml6YXRpb25zKF9weWRpbzJbJ2RlZmF1bHQnXS5nZXRJbnN0YW5jZSgpKTtcbiAgICAgICAgICAgIHZhciBtYXggPSBhdXRoLm1heF9kb3dubG9hZHM7XG4gICAgICAgICAgICAvLyBSZWFkYXB0IHRlbXBsYXRlIGRlcGVuZGluZyBvbiBwZXJtaXNzaW9uc1xuICAgICAgICAgICAgaWYgKGxpbmtNb2RlbC5oYXNQZXJtaXNzaW9uKCdQcmV2aWV3JykpIHtcbiAgICAgICAgICAgICAgICBsaW5rLlZpZXdUZW1wbGF0ZU5hbWUgPSBcInB5ZGlvX3VuaXF1ZV9zdHJpcFwiO1xuICAgICAgICAgICAgICAgIGxpbmsuTWF4RG93bmxvYWRzID0gMDsgLy8gQ2xlYXIgTWF4IERvd25sb2FkcyBpZiBQcmV2aWV3IGVuYWJsZWRcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmsuVmlld1RlbXBsYXRlTmFtZSA9IFwicHlkaW9fdW5pcXVlX2RsXCI7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXggJiYgIWxpbmsuTWF4RG93bmxvYWRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rLk1heERvd25sb2FkcyA9IG1heDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByb3BzLmxpbmtNb2RlbC51cGRhdGVMaW5rKGxpbmspO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgbGlua01vZGVsID0gX3Byb3BzMi5saW5rTW9kZWw7XG4gICAgICAgIHZhciBjb21wb3NpdGVNb2RlbCA9IF9wcm9wczIuY29tcG9zaXRlTW9kZWw7XG4gICAgICAgIHZhciBweWRpbyA9IF9wcm9wczIucHlkaW87XG5cbiAgICAgICAgdmFyIG5vZGUgPSBjb21wb3NpdGVNb2RlbC5nZXROb2RlKCk7XG4gICAgICAgIHZhciBwZXJtcyA9IFtdLFxuICAgICAgICAgICAgcHJldmlld1dhcm5pbmcgPSB1bmRlZmluZWQ7XG4gICAgICAgIHZhciBhdXRoID0gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5nZXRBdXRob3JpemF0aW9ucyhfcHlkaW8yWydkZWZhdWx0J10uZ2V0SW5zdGFuY2UoKSk7XG5cbiAgICAgICAgaWYgKG5vZGUuaXNMZWFmKCkpIHtcbiAgICAgICAgICAgIHZhciBfU2hhcmVIZWxwZXIkbm9kZUhhc0VkaXRvciA9IF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10ubm9kZUhhc0VkaXRvcihweWRpbywgbm9kZSk7XG5cbiAgICAgICAgICAgIHZhciBwcmV2aWV3ID0gX1NoYXJlSGVscGVyJG5vZGVIYXNFZGl0b3IucHJldmlldztcbiAgICAgICAgICAgIHZhciB3cml0ZWFibGUgPSBfU2hhcmVIZWxwZXIkbm9kZUhhc0VkaXRvci53cml0ZWFibGU7XG5cbiAgICAgICAgICAgIHBlcm1zLnB1c2goe1xuICAgICAgICAgICAgICAgIE5BTUU6ICdEb3dubG9hZCcsXG4gICAgICAgICAgICAgICAgTEFCRUw6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnNzMnKSxcbiAgICAgICAgICAgICAgICBESVNBQkxFRDogIXByZXZpZXcgfHwgIWxpbmtNb2RlbC5oYXNQZXJtaXNzaW9uKCdQcmV2aWV3JykgLy8gRG93bmxvYWQgT25seSwgY2Fubm90IGVkaXQgdGhpc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAocHJldmlldyAmJiAhYXV0aC5tYXhfZG93bmxvYWRzKSB7XG4gICAgICAgICAgICAgICAgcGVybXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIE5BTUU6ICdQcmV2aWV3JyxcbiAgICAgICAgICAgICAgICAgICAgTEFCRUw6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnNzInKSxcbiAgICAgICAgICAgICAgICAgICAgRElTQUJMRUQ6ICFsaW5rTW9kZWwuaGFzUGVybWlzc2lvbignRG93bmxvYWQnKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChsaW5rTW9kZWwuaGFzUGVybWlzc2lvbignUHJldmlldycpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh3cml0ZWFibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcm1zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5BTUU6ICdVcGxvYWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIExBQkVMOiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzc0YicpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBlcm1zLnB1c2goe1xuICAgICAgICAgICAgICAgIE5BTUU6ICdQcmV2aWV3JyxcbiAgICAgICAgICAgICAgICBMQUJFTDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCc3MicpLFxuICAgICAgICAgICAgICAgIERJU0FCTEVEOiAhbGlua01vZGVsLmhhc1Blcm1pc3Npb24oJ1VwbG9hZCcpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHBlcm1zLnB1c2goe1xuICAgICAgICAgICAgICAgIE5BTUU6ICdEb3dubG9hZCcsXG4gICAgICAgICAgICAgICAgTEFCRUw6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnNzMnKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwZXJtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBOQU1FOiAnVXBsb2FkJyxcbiAgICAgICAgICAgICAgICBMQUJFTDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCc3NCcpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qXG4gICAgICAgIGlmKHRoaXMucHJvcHMuc2hhcmVNb2RlbC5pc1B1YmxpY0xpbmtQcmV2aWV3RGlzYWJsZWQoKSAmJiB0aGlzLnByb3BzLnNoYXJlTW9kZWwuZ2V0UHVibGljTGlua1Blcm1pc3Npb24obGlua0lkLCAncmVhZCcpKXtcbiAgICAgICAgICAgIHByZXZpZXdXYXJuaW5nID0gPGRpdj57dGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcxOTUnKX08L2Rpdj47XG4gICAgICAgIH1cbiAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7IHBhZGRpbmc6ICcxMHB4IDE2cHgnIH0sIHRoaXMucHJvcHMuc3R5bGUpIH0sXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogNTAwLCBjb2xvcjogJ3JnYmEoMCwwLDAsMC40MyknIH0gfSxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzcwcicpXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBtYXJnaW46ICcxMHB4IDAgMjBweCcgfSB9LFxuICAgICAgICAgICAgICAgIHBlcm1zLm1hcCgoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkNoZWNrYm94LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6IHAuTkFNRSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBwLkRJU0FCTEVEIHx8IHRoaXMucHJvcHMuaXNSZWFkb25seSgpIHx8ICFsaW5rTW9kZWwuaXNFZGl0YWJsZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHAuTkFNRSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBwLkxBQkVMLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGVjazogdGhpcy5jaGFuZ2VQZXJtaXNzaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZDogbGlua01vZGVsLmhhc1Blcm1pc3Npb24ocC5OQU1FKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsU3R5bGU6IHsgd2hpdGVTcGFjZTogJ25vd3JhcCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IG1hcmdpbjogJzEwcHggMCcgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpKSxcbiAgICAgICAgICAgICAgICBwcmV2aWV3V2FybmluZ1xuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBQdWJsaWNMaW5rUGVybWlzc2lvbnMgPSAoMCwgX1NoYXJlQ29udGV4dENvbnN1bWVyMlsnZGVmYXVsdCddKShQdWJsaWNMaW5rUGVybWlzc2lvbnMpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gUHVibGljTGlua1Blcm1pc3Npb25zO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIgPSByZXF1aXJlKCcuLi9TaGFyZUNvbnRleHRDb25zdW1lcicpO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1NoYXJlQ29udGV4dENvbnN1bWVyKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9MaW5rTW9kZWwgPSByZXF1aXJlKCcuL0xpbmtNb2RlbCcpO1xuXG52YXIgX0xpbmtNb2RlbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9MaW5rTW9kZWwpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignaG9jJyk7XG5cbnZhciBNb2Rlcm5TZWxlY3RGaWVsZCA9IF9QeWRpbyRyZXF1aXJlTGliLk1vZGVyblNlbGVjdEZpZWxkO1xuXG52YXIgUHVibGljTGlua1RlbXBsYXRlID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFB1YmxpY0xpbmtUZW1wbGF0ZSwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBQdWJsaWNMaW5rVGVtcGxhdGUoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQdWJsaWNMaW5rVGVtcGxhdGUpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFB1YmxpY0xpbmtUZW1wbGF0ZS5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhQdWJsaWNMaW5rVGVtcGxhdGUsIFt7XG4gICAgICAgIGtleTogJ29uRHJvcERvd25DaGFuZ2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb25Ecm9wRG93bkNoYW5nZShldmVudCwgaW5kZXgsIHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgbGlua01vZGVsID0gdGhpcy5wcm9wcy5saW5rTW9kZWw7XG5cbiAgICAgICAgICAgIGxpbmtNb2RlbC5nZXRMaW5rKCkuVmlld1RlbXBsYXRlTmFtZSA9IHZhbHVlO1xuICAgICAgICAgICAgbGlua01vZGVsLm5vdGlmeURpcnR5KCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgY3J0TGFiZWwgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgbGlua01vZGVsID0gdGhpcy5wcm9wcy5saW5rTW9kZWw7XG5cbiAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9IGxpbmtNb2RlbC5nZXRMaW5rKCkuVmlld1RlbXBsYXRlTmFtZTtcbiAgICAgICAgICAgIHZhciBtZW51SXRlbXMgPSB0aGlzLnByb3BzLmxheW91dERhdGEubWFwKGZ1bmN0aW9uIChsKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkICYmIGwuTEFZT1VUX0VMRU1FTlQgPT09IHNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNydExhYmVsID0gbC5MQVlPVVRfTEFCRUw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghc2VsZWN0ZWQgJiYgIWNydExhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkID0gbC5MQVlPVVRfRUxFTUVOVDtcbiAgICAgICAgICAgICAgICAgICAgY3J0TGFiZWwgPSBsLkxBWU9VVF9MQUJFTDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IGtleTogbC5MQVlPVVRfRUxFTUVOVCwgdmFsdWU6IGwuTEFZT1VUX0VMRU1FTlQsIHByaW1hcnlUZXh0OiBsLkxBWU9VVF9MQUJFTCB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHRoaXMucHJvcHMuc3R5bGUgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZm9udFNpemU6IDEzLCBmb250V2VpZ2h0OiA1MDAsIGNvbG9yOiAncmdiYSgwLDAsMCwwLjQzKScgfSB9LFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE1MScpXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgTW9kZXJuU2VsZWN0RmllbGQsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBzZWxlY3RlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uRHJvcERvd25DaGFuZ2UuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLnByb3BzLmlzUmVhZG9ubHkoKSB8fCB0aGlzLnByb3BzLnJlYWRvbmx5IHx8ICFsaW5rTW9kZWwuaXNFZGl0YWJsZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTUxJylcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbWVudUl0ZW1zXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBQdWJsaWNMaW5rVGVtcGxhdGU7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuUHVibGljTGlua1RlbXBsYXRlLlByb3BUeXBlcyA9IHtcbiAgICBsaW5rTW9kZWw6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuaW5zdGFuY2VPZihfTGlua01vZGVsMlsnZGVmYXVsdCddKVxufTtcblB1YmxpY0xpbmtUZW1wbGF0ZSA9ICgwLCBfU2hhcmVDb250ZXh0Q29uc3VtZXIyWydkZWZhdWx0J10pKFB1YmxpY0xpbmtUZW1wbGF0ZSk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBQdWJsaWNMaW5rVGVtcGxhdGU7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9weWRpb1V0aWxQYXNzID0gcmVxdWlyZSgncHlkaW8vdXRpbC9wYXNzJyk7XG5cbnZhciBfcHlkaW9VdGlsUGFzczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb1V0aWxQYXNzKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lciA9IHJlcXVpcmUoJy4uL1NoYXJlQ29udGV4dENvbnN1bWVyJyk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU2hhcmVDb250ZXh0Q29uc3VtZXIpO1xuXG52YXIgX0xpbmtNb2RlbCA9IHJlcXVpcmUoJy4vTGlua01vZGVsJyk7XG5cbnZhciBfTGlua01vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0xpbmtNb2RlbCk7XG5cbnZhciBfbWFpblNoYXJlSGVscGVyID0gcmVxdWlyZSgnLi4vbWFpbi9TaGFyZUhlbHBlcicpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYWluU2hhcmVIZWxwZXIpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignZm9ybScpO1xuXG52YXIgVmFsaWRQYXNzd29yZCA9IF9QeWRpbyRyZXF1aXJlTGliLlZhbGlkUGFzc3dvcmQ7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYjIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignaG9jJyk7XG5cbnZhciBNb2Rlcm5UZXh0RmllbGQgPSBfUHlkaW8kcmVxdWlyZUxpYjIuTW9kZXJuVGV4dEZpZWxkO1xudmFyIE1vZGVyblN0eWxlcyA9IF9QeWRpbyRyZXF1aXJlTGliMi5Nb2Rlcm5TdHlsZXM7XG5cbnZhciBnbG9iU3R5bGVzID0ge1xuICAgIGxlZnRJY29uOiB7XG4gICAgICAgIG1hcmdpbjogJzAgMTZweCAwIDRweCcsXG4gICAgICAgIGNvbG9yOiAnIzc1NzU3NSdcbiAgICB9XG59O1xuXG52YXIgUHVibGljTGlua1NlY3VyZU9wdGlvbnMgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnUHVibGljTGlua1NlY3VyZU9wdGlvbnMnLFxuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIGxpbmtNb2RlbDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKF9MaW5rTW9kZWwyWydkZWZhdWx0J10pLmlzUmVxdWlyZWQsXG4gICAgICAgIHN0eWxlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm9iamVjdFxuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH0sXG5cbiAgICB1cGRhdGVETEV4cGlyYXRpb25GaWVsZDogZnVuY3Rpb24gdXBkYXRlRExFeHBpcmF0aW9uRmllbGQoZXZlbnQpIHtcbiAgICAgICAgdmFyIG5ld1ZhbHVlID0gZXZlbnQuY3VycmVudFRhcmdldC52YWx1ZTtcbiAgICAgICAgaWYgKHBhcnNlSW50KG5ld1ZhbHVlKSA8IDApIHtcbiAgICAgICAgICAgIG5ld1ZhbHVlID0gLXBhcnNlSW50KG5ld1ZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbGlua01vZGVsID0gdGhpcy5wcm9wcy5saW5rTW9kZWw7XG5cbiAgICAgICAgdmFyIGxpbmsgPSBsaW5rTW9kZWwuZ2V0TGluaygpO1xuICAgICAgICBsaW5rLk1heERvd25sb2FkcyA9IG5ld1ZhbHVlO1xuICAgICAgICBsaW5rTW9kZWwudXBkYXRlTGluayhsaW5rKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlRGF5c0V4cGlyYXRpb25GaWVsZDogZnVuY3Rpb24gdXBkYXRlRGF5c0V4cGlyYXRpb25GaWVsZChldmVudCwgbmV3VmFsdWUpIHtcbiAgICAgICAgaWYgKCFuZXdWYWx1ZSkge1xuICAgICAgICAgICAgbmV3VmFsdWUgPSBldmVudC5jdXJyZW50VGFyZ2V0LmdldFZhbHVlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGxpbmtNb2RlbCA9IHRoaXMucHJvcHMubGlua01vZGVsO1xuXG4gICAgICAgIHZhciBsaW5rID0gbGlua01vZGVsLmdldExpbmsoKTtcbiAgICAgICAgbGluay5BY2Nlc3NFbmQgPSBuZXdWYWx1ZTtcbiAgICAgICAgbGlua01vZGVsLnVwZGF0ZUxpbmsobGluayk7XG4gICAgfSxcblxuICAgIG9uRGF0ZUNoYW5nZTogZnVuY3Rpb24gb25EYXRlQ2hhbmdlKGV2ZW50LCB2YWx1ZSkge1xuICAgICAgICB2YXIgZGF0ZTIgPSBEYXRlLlVUQyh2YWx1ZS5nZXRGdWxsWWVhcigpLCB2YWx1ZS5nZXRNb250aCgpLCB2YWx1ZS5nZXREYXRlKCkpO1xuICAgICAgICB0aGlzLnVwZGF0ZURheXNFeHBpcmF0aW9uRmllbGQoZXZlbnQsIE1hdGguZmxvb3IoZGF0ZTIgLyAxMDAwKSArIFwiXCIpO1xuICAgIH0sXG5cbiAgICByZXNldFBhc3N3b3JkOiBmdW5jdGlvbiByZXNldFBhc3N3b3JkKCkge1xuICAgICAgICB2YXIgbGlua01vZGVsID0gdGhpcy5wcm9wcy5saW5rTW9kZWw7XG5cbiAgICAgICAgbGlua01vZGVsLnNldFVwZGF0ZVBhc3N3b3JkKCcnKTtcbiAgICAgICAgbGlua01vZGVsLmdldExpbmsoKS5QYXNzd29yZFJlcXVpcmVkID0gZmFsc2U7XG4gICAgICAgIGxpbmtNb2RlbC5ub3RpZnlEaXJ0eSgpO1xuICAgIH0sXG5cbiAgICBzZXRVcGRhdGluZ1Bhc3N3b3JkOiBmdW5jdGlvbiBzZXRVcGRhdGluZ1Bhc3N3b3JkKG5ld1ZhbHVlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgX3B5ZGlvVXRpbFBhc3MyWydkZWZhdWx0J10uY2hlY2tQYXNzd29yZFN0cmVuZ3RoKG5ld1ZhbHVlLCBmdW5jdGlvbiAob2ssIG1zZykge1xuICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyB1cGRhdGluZ1Bhc3N3b3JkOiBuZXdWYWx1ZSwgdXBkYXRpbmdQYXNzd29yZFZhbGlkOiBvayB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNoYW5nZVBhc3N3b3JkOiBmdW5jdGlvbiBjaGFuZ2VQYXNzd29yZCgpIHtcbiAgICAgICAgdmFyIGxpbmtNb2RlbCA9IHRoaXMucHJvcHMubGlua01vZGVsO1xuICAgICAgICB2YXIgdXBkYXRpbmdQYXNzd29yZCA9IHRoaXMuc3RhdGUudXBkYXRpbmdQYXNzd29yZDtcblxuICAgICAgICBsaW5rTW9kZWwuc2V0VXBkYXRlUGFzc3dvcmQodXBkYXRpbmdQYXNzd29yZCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwd1BvcDogZmFsc2UsIHVwZGF0aW5nUGFzc3dvcmQ6IFwiXCIsIHVwZGF0aW5nUGFzc3dvcmRWYWxpZDogZmFsc2UgfSk7XG4gICAgICAgIGxpbmtNb2RlbC5ub3RpZnlEaXJ0eSgpO1xuICAgIH0sXG5cbiAgICB1cGRhdGVQYXNzd29yZDogZnVuY3Rpb24gdXBkYXRlUGFzc3dvcmQobmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgIHZhciBsaW5rTW9kZWwgPSB0aGlzLnByb3BzLmxpbmtNb2RlbDtcblxuICAgICAgICB2YXIgdmFsaWQgPSB0aGlzLnJlZnMucHdkLmlzVmFsaWQoKTtcbiAgICAgICAgaWYgKHZhbGlkKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgaW52YWxpZFBhc3N3b3JkOiBudWxsLCBpbnZhbGlkOiBmYWxzZSB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbGlua01vZGVsLnNldFVwZGF0ZVBhc3N3b3JkKG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGludmFsaWRQYXNzd29yZDogbmV3VmFsdWUsIGludmFsaWQ6IHRydWUgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVzZXREb3dubG9hZHM6IGZ1bmN0aW9uIHJlc2V0RG93bmxvYWRzKCkge1xuICAgICAgICBpZiAod2luZG93LmNvbmZpcm0odGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcxMDYnKSkpIHtcbiAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSB0aGlzLnByb3BzLmxpbmtNb2RlbDtcblxuICAgICAgICAgICAgbGlua01vZGVsLmdldExpbmsoKS5DdXJyZW50RG93bmxvYWRzID0gXCIwXCI7XG4gICAgICAgICAgICBsaW5rTW9kZWwubm90aWZ5RGlydHkoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZXNldEV4cGlyYXRpb246IGZ1bmN0aW9uIHJlc2V0RXhwaXJhdGlvbigpIHtcbiAgICAgICAgdmFyIGxpbmtNb2RlbCA9IHRoaXMucHJvcHMubGlua01vZGVsO1xuXG4gICAgICAgIGxpbmtNb2RlbC5nZXRMaW5rKCkuQWNjZXNzRW5kID0gXCIwXCI7XG4gICAgICAgIGxpbmtNb2RlbC5ub3RpZnlEaXJ0eSgpO1xuICAgIH0sXG5cbiAgICByZW5kZXJQYXNzd29yZENvbnRhaW5lcjogZnVuY3Rpb24gcmVuZGVyUGFzc3dvcmRDb250YWluZXIoKSB7XG4gICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgIHZhciBsaW5rTW9kZWwgPSB0aGlzLnByb3BzLmxpbmtNb2RlbDtcblxuICAgICAgICB2YXIgbGluayA9IGxpbmtNb2RlbC5nZXRMaW5rKCk7XG4gICAgICAgIHZhciBwYXNzd29yZEZpZWxkID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgcmVzZXRQYXNzd29yZCA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHVwZGF0ZVBhc3N3b3JkID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAobGluay5QYXNzd29yZFJlcXVpcmVkKSB7XG4gICAgICAgICAgICByZXNldFBhc3N3b3JkID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwge1xuICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLnByb3BzLmlzUmVhZG9ubHkoKSB8fCAhbGlua01vZGVsLmlzRWRpdGFibGUoKSxcbiAgICAgICAgICAgICAgICBzZWNvbmRhcnk6IHRydWUsXG4gICAgICAgICAgICAgICAgb25Ub3VjaFRhcDogdGhpcy5yZXNldFBhc3N3b3JkLFxuICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE3NCcpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHVwZGF0ZVBhc3N3b3JkID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLnByb3BzLmlzUmVhZG9ubHkoKSB8fCAhbGlua01vZGVsLmlzRWRpdGFibGUoKSxcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBvblRvdWNoVGFwOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgcHdQb3A6IHRydWUsIHB3QW5jaG9yOiBlLmN1cnJlbnRUYXJnZXQgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE4MScpXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBvcG92ZXIsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46IHRoaXMuc3RhdGUucHdQb3AsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmNob3JFbDogdGhpcy5zdGF0ZS5wd0FuY2hvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuY2hvck9yaWdpbjogeyBob3Jpem9udGFsOiAncmlnaHQnLCB2ZXJ0aWNhbDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE9yaWdpbjogeyBob3Jpem9udGFsOiAncmlnaHQnLCB2ZXJ0aWNhbDogJ3RvcCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVxdWVzdENsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgcHdQb3A6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogMjgwLCBwYWRkaW5nOiA4IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFZhbGlkUGFzc3dvcmQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcInVwZGF0ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogXCJwd2RVcGRhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiB7IGxhYmVsOiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzIzJykgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS51cGRhdGluZ1Bhc3N3b3JkID8gdGhpcy5zdGF0ZS51cGRhdGluZ1Bhc3N3b3JkIDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFVwZGF0aW5nUGFzc3dvcmQodik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmdUb3A6IDIwLCB0ZXh0QWxpZ246ICdyaWdodCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgbGFiZWw6IFwiT0tcIiwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLmNoYW5nZVBhc3N3b3JkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGRpc2FibGVkOiAhdGhpcy5zdGF0ZS51cGRhdGluZ1Bhc3N3b3JkIHx8ICF0aGlzLnN0YXRlLnVwZGF0aW5nUGFzc3dvcmRWYWxpZCB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGxhYmVsOiBcIkNhbmNlbFwiLCBvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBwd1BvcDogZmFsc2UsIHVwZGF0aW5nUGFzc3dvcmQ6ICcnIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcGFzc3dvcmRGaWVsZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE1vZGVyblRleHRGaWVsZCwge1xuICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzIzJyksXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgdmFsdWU6ICcqKioqKioqKicsXG4gICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5wcm9wcy5pc1JlYWRvbmx5KCkgJiYgbGlua01vZGVsLmlzRWRpdGFibGUoKSkge1xuICAgICAgICAgICAgcGFzc3dvcmRGaWVsZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFZhbGlkUGFzc3dvcmQsIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnc2hhcmUtcGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgIHJlZjogXCJwd2RcIixcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiB7IGxhYmVsOiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzIzJykgfSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS5pbnZhbGlkUGFzc3dvcmQgPyB0aGlzLnN0YXRlLmludmFsaWRQYXNzd29yZCA6IGxpbmtNb2RlbC51cGRhdGVQYXNzd29yZCxcbiAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy51cGRhdGVQYXNzd29yZFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhc3N3b3JkRmllbGQpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ3Bhc3N3b3JkLWNvbnRhaW5lcicsIHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogJ21kaSBtZGktZmlsZS1sb2NrJywgc3R5bGU6IGdsb2JTdHlsZXMubGVmdEljb24gfSksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiByZXNldFBhc3N3b3JkID8gJzQwJScgOiAnMTAwJScsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgcGFzc3dvcmRGaWVsZFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgcmVzZXRQYXNzd29yZCAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6ICc2MCUnLCBkaXNwbGF5OiAnZmxleCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICByZXNldFBhc3N3b3JkLFxuICAgICAgICAgICAgICAgICAgICAnICcsXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZVBhc3N3b3JkXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGZvcm1hdERhdGU6IGZ1bmN0aW9uIGZvcm1hdERhdGUoZGF0ZU9iamVjdCkge1xuICAgICAgICB2YXIgZGF0ZUZvcm1hdERheSA9IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnZGF0ZV9mb3JtYXQnLCAnJykuc3BsaXQoJyAnKS5zaGlmdCgpO1xuICAgICAgICByZXR1cm4gZGF0ZUZvcm1hdERheS5yZXBsYWNlKCdZJywgZGF0ZU9iamVjdC5nZXRGdWxsWWVhcigpKS5yZXBsYWNlKCdtJywgZGF0ZU9iamVjdC5nZXRNb250aCgpICsgMSkucmVwbGFjZSgnZCcsIGRhdGVPYmplY3QuZ2V0RGF0ZSgpKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBsaW5rTW9kZWwgPSB0aGlzLnByb3BzLmxpbmtNb2RlbDtcblxuICAgICAgICB2YXIgbGluayA9IGxpbmtNb2RlbC5nZXRMaW5rKCk7XG5cbiAgICAgICAgdmFyIHBhc3NDb250YWluZXIgPSB0aGlzLnJlbmRlclBhc3N3b3JkQ29udGFpbmVyKCk7XG4gICAgICAgIHZhciBjcnRMaW5rRExBbGxvd2VkID0gbGlua01vZGVsLmhhc1Blcm1pc3Npb24oJ0Rvd25sb2FkJykgJiYgIWxpbmtNb2RlbC5oYXNQZXJtaXNzaW9uKCdQcmV2aWV3JykgJiYgIWxpbmtNb2RlbC5oYXNQZXJtaXNzaW9uKCdVcGxvYWQnKTtcbiAgICAgICAgdmFyIGRsTGltaXRWYWx1ZSA9IHBhcnNlSW50KGxpbmsuTWF4RG93bmxvYWRzKTtcbiAgICAgICAgdmFyIGV4cGlyYXRpb25EYXRlVmFsdWUgPSBwYXJzZUludChsaW5rLkFjY2Vzc0VuZCk7XG5cbiAgICAgICAgdmFyIGNhbEljb24gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBjbGFzc05hbWU6ICdtZGkgbWRpLWNhbGVuZGFyLWNsb2NrJywgc3R5bGU6IGdsb2JTdHlsZXMubGVmdEljb24gfSk7XG4gICAgICAgIHZhciBleHBEYXRlID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgbWF4RGF0ZSA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGRsQ291bnRlclN0cmluZyA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGRhdGVFeHBpcmVkID0gZmFsc2UsXG4gICAgICAgICAgICBkbEV4cGlyZWQgPSBmYWxzZTtcbiAgICAgICAgdmFyIHRvZGF5ID0gbmV3IERhdGUoKTtcblxuICAgICAgICB2YXIgYXV0aCA9IF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uZ2V0QXV0aG9yaXphdGlvbnModGhpcy5wcm9wcy5weWRpbyk7XG4gICAgICAgIGlmIChwYXJzZUludChhdXRoLm1heF9leHBpcmF0aW9uKSA+IDApIHtcbiAgICAgICAgICAgIG1heERhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgbWF4RGF0ZS5zZXREYXRlKHRvZGF5LmdldERhdGUoKSArIHBhcnNlSW50KGF1dGgubWF4X2V4cGlyYXRpb24pKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyc2VJbnQoYXV0aC5tYXhfZG93bmxvYWRzKSA+IDApIHtcbiAgICAgICAgICAgIGRsTGltaXRWYWx1ZSA9IE1hdGgubWluKGRsTGltaXRWYWx1ZSwgcGFyc2VJbnQoYXV0aC5tYXhfZG93bmxvYWRzKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXhwaXJhdGlvbkRhdGVWYWx1ZSkge1xuICAgICAgICAgICAgaWYgKGV4cGlyYXRpb25EYXRlVmFsdWUgPCAwKSB7XG4gICAgICAgICAgICAgICAgZGF0ZUV4cGlyZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXhwRGF0ZSA9IG5ldyBEYXRlKGV4cGlyYXRpb25EYXRlVmFsdWUgKiAxMDAwKTtcbiAgICAgICAgICAgIC8vZXhwRGF0ZS5zZXREYXRlKHRvZGF5LmdldERhdGUoKSArIHBhcnNlSW50KGV4cGlyYXRpb25EYXRlVmFsdWUpKTtcbiAgICAgICAgICAgIGNhbEljb24gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IGljb25TdHlsZTogeyBjb2xvcjogZ2xvYlN0eWxlcy5sZWZ0SWNvbi5jb2xvciB9LCBzdHlsZTogeyBtYXJnaW5MZWZ0OiAtOCwgbWFyZ2luUmlnaHQ6IDggfSwgaWNvbkNsYXNzTmFtZTogJ21kaSBtZGktY2xvc2UtY2lyY2xlJywgb25Ub3VjaFRhcDogdGhpcy5yZXNldEV4cGlyYXRpb24uYmluZCh0aGlzKSB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGxMaW1pdFZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgZGxDb3VudGVyID0gcGFyc2VJbnQobGluay5DdXJyZW50RG93bmxvYWRzKSB8fCAwO1xuICAgICAgICAgICAgdmFyIHJlc2V0TGluayA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChkbENvdW50ZXIpIHtcbiAgICAgICAgICAgICAgICByZXNldExpbmsgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2EnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInIH0sIG9uQ2xpY2s6IHRoaXMucmVzZXREb3dubG9hZHMuYmluZCh0aGlzKSwgdGl0bGU6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTcnKSB9LFxuICAgICAgICAgICAgICAgICAgICAnKCcsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTYnKSxcbiAgICAgICAgICAgICAgICAgICAgJyknXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBpZiAoZGxDb3VudGVyID49IGRsTGltaXRWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBkbEV4cGlyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRsQ291bnRlclN0cmluZyA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2RsQ291bnRlclN0cmluZycgfSxcbiAgICAgICAgICAgICAgICBkbENvdW50ZXIgKyAnLycgKyBkbExpbWl0VmFsdWUsXG4gICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgIHJlc2V0TGlua1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHsgcGFkZGluZzogMTAgfSwgdGhpcy5wcm9wcy5zdHlsZSkgfSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZm9udFNpemU6IDEzLCBmb250V2VpZ2h0OiA1MDAsIGNvbG9yOiAncmdiYSgwLDAsMCwwLjQzKScgfSB9LFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMjQnKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZ1JpZ2h0OiAxMCB9IH0sXG4gICAgICAgICAgICAgICAgcGFzc0NvbnRhaW5lcixcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnYmFzZWxpbmUnLCBwb3NpdGlvbjogJ3JlbGF0aXZlJyB9LCBjbGFzc05hbWU6IGRhdGVFeHBpcmVkID8gJ2xpbWl0LWJsb2NrLWV4cGlyZWQnIDogbnVsbCB9LFxuICAgICAgICAgICAgICAgICAgICBjYWxJY29uLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5EYXRlUGlja2VyLCBfZXh0ZW5kcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWY6ICdleHBpcmF0aW9uRGF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6ICdzdGFydCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZXhwRGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbkRhdGU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhEYXRlOiBtYXhEYXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b09rOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMucHJvcHMuaXNSZWFkb25seSgpIHx8ICFsaW5rTW9kZWwuaXNFZGl0YWJsZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25EYXRlQ2hhbmdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvd1llYXJTZWxlY3RvcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhpbnRUZXh0OiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoZGF0ZUV4cGlyZWQgPyAnMjFiJyA6ICcyMScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZTogJ2xhbmRzY2FwZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXREYXRlOiB0aGlzLmZvcm1hdERhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBmbGV4OiAxIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfSwgTW9kZXJuU3R5bGVzLnRleHRGaWVsZCkpXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgYWxpZ25JdGVtczogJ2Jhc2VsaW5lJywgZGlzcGxheTogY3J0TGlua0RMQWxsb3dlZCA/ICdmbGV4JyA6ICdub25lJywgcG9zaXRpb246ICdyZWxhdGl2ZScgfSwgY2xhc3NOYW1lOiBkbEV4cGlyZWQgPyAnbGltaXQtYmxvY2stZXhwaXJlZCcgOiBudWxsIH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogJ21kaSBtZGktZG93bmxvYWQnLCBzdHlsZTogZ2xvYlN0eWxlcy5sZWZ0SWNvbiB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoTW9kZXJuVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLnByb3BzLmlzUmVhZG9ubHkoKSB8fCAhbGlua01vZGVsLmlzRWRpdGFibGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoZGxFeHBpcmVkID8gJzIyYicgOiAnMjInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBkbExpbWl0VmFsdWUgPiAwID8gZGxMaW1pdFZhbHVlIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy51cGRhdGVETEV4cGlyYXRpb25GaWVsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGZsZXg6IDEgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBvc2l0aW9uOiAnYWJzb2x1dGUnLCByaWdodDogMTAsIHRvcDogMTQsIGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogNTAwLCBjb2xvcjogJ3JnYmEoMCwwLDAsMC40MyknIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRsQ291bnRlclN0cmluZ1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBQdWJsaWNMaW5rU2VjdXJlT3B0aW9ucyA9ICgwLCBfU2hhcmVDb250ZXh0Q29uc3VtZXIyWydkZWZhdWx0J10pKFB1YmxpY0xpbmtTZWN1cmVPcHRpb25zKTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFB1YmxpY0xpbmtTZWN1cmVPcHRpb25zO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3JlYWN0RG9tID0gcmVxdWlyZSgncmVhY3QtZG9tJyk7XG5cbnZhciBfcmVhY3REb20yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3REb20pO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyID0gcmVxdWlyZSgnLi4vU2hhcmVDb250ZXh0Q29uc3VtZXInKTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TaGFyZUNvbnRleHRDb25zdW1lcik7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfY2xpcGJvYXJkID0gcmVxdWlyZSgnY2xpcGJvYXJkJyk7XG5cbnZhciBfY2xpcGJvYXJkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NsaXBib2FyZCk7XG5cbnZhciBfbGlua3NMaW5rTW9kZWwgPSByZXF1aXJlKCcuLi9saW5rcy9MaW5rTW9kZWwnKTtcblxudmFyIF9saW5rc0xpbmtNb2RlbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9saW5rc0xpbmtNb2RlbCk7XG5cbnZhciBUYXJnZXRlZFVzZXJMaW5rID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFRhcmdldGVkVXNlckxpbmssIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gVGFyZ2V0ZWRVc2VyTGluayhwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVGFyZ2V0ZWRVc2VyTGluayk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoVGFyZ2V0ZWRVc2VyTGluay5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHsgY29weU1lc3NhZ2U6ICcnIH07XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFRhcmdldGVkVXNlckxpbmssIFt7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudERpZE1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2NsaXApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGlwLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLl9idXR0b24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGlwID0gbmV3IF9jbGlwYm9hcmQyWydkZWZhdWx0J10odGhpcy5fYnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IChmdW5jdGlvbiAodHJpZ2dlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMubGluaztcbiAgICAgICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuX2NsaXAub24oJ3N1Y2Nlc3MnLCAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29weU1lc3NhZ2U6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTkyJykgfSwgdGhpcy5jbGVhckNvcHlNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGlwLm9uKCdlcnJvcicsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb3B5TWVzc2FnZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdsb2JhbC5uYXZpZ2F0b3IucGxhdGZvcm0uaW5kZXhPZihcIk1hY1wiKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29weU1lc3NhZ2UgPSB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE0NCcpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29weU1lc3NhZ2UgPSB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJ3NoYXJlX2NlbnRlci4xNDMnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29weU1lc3NhZ2U6IGNvcHlNZXNzYWdlIH0sIHRoaXMuY2xlYXJDb3B5TWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxVbm1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2NsaXApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGlwLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY2xlYXJDb3B5TWVzc2FnZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhckNvcHlNZXNzYWdlKCkge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb3B5TWVzc2FnZTogJycgfSk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpLCA1MDAwKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHRhcmdldFVzZXIgPSBfcHJvcHMudGFyZ2V0VXNlcjtcbiAgICAgICAgICAgIHZhciBsaW5rID0gX3Byb3BzLmxpbms7XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JyB9IH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZsZXg6IDEgfSB9LFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRVc2VyLkRpc3BsYXksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvOiB0aGlzLnByb3BzLnB5ZGlvLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiBmdW5jdGlvbiAocmVmKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuX2J1dHRvbiA9IF9yZWFjdERvbTJbJ2RlZmF1bHQnXS5maW5kRE9NTm9kZShyZWYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU6ICdtZGkgbWRpLWxpbmsnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcDogdGhpcy5zdGF0ZS5jb3B5TWVzc2FnZSB8fCBsaW5rLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvblN0eWxlOiB7IGZvbnRTaXplOiAxMywgbGluZUhlaWdodDogJzE3cHgnIH0sIHN0eWxlOiB7IHdpZHRoOiAzNCwgaGVpZ2h0OiAzNCwgcGFkZGluZzogNiB9XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6IDQwLCB0ZXh0QWxpZ246ICdjZW50ZXInIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0VXNlci5Eb3dubG9hZENvdW50XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBUYXJnZXRlZFVzZXJMaW5rO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbnZhciBUYXJnZXRlZFVzZXJzID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50Mikge1xuICAgIF9pbmhlcml0cyhUYXJnZXRlZFVzZXJzLCBfUmVhY3QkQ29tcG9uZW50Mik7XG5cbiAgICBmdW5jdGlvbiBUYXJnZXRlZFVzZXJzKHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBUYXJnZXRlZFVzZXJzKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihUYXJnZXRlZFVzZXJzLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMsIGNvbnRleHQpO1xuICAgICAgICB0aGlzLnN0YXRlID0geyBvcGVuOiBmYWxzZSB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhUYXJnZXRlZFVzZXJzLCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSB0aGlzLnByb3BzLmxpbmtNb2RlbDtcblxuICAgICAgICAgICAgdmFyIGxpbmsgPSBsaW5rTW9kZWwuZ2V0TGluaygpO1xuICAgICAgICAgICAgdmFyIHRhcmdldFVzZXJzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKGxpbmsuVGFyZ2V0VXNlcnMpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRVc2VycyA9IGxpbmsuVGFyZ2V0VXNlcnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaXRlbXMgPSBPYmplY3Qua2V5cyh0YXJnZXRVc2VycykubWFwKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRpdGxlID0gbGlua01vZGVsLmdldFB1YmxpY1VybCgpICsgJz91PScgKyBrO1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChUYXJnZXRlZFVzZXJMaW5rLCB7IHRhcmdldFVzZXI6IHRhcmdldFVzZXJzW2tdLCBsaW5rOiB0aXRsZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFpdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHJvb3RTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBsaW5lSGVpZ2h0OiAnMzRweCcsXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzRweCAxMHB4IDRweCcsXG4gICAgICAgICAgICAgICAgZm9udFNpemU6IDE0LFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmYWZhZmEnLFxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogMlxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciBoZWFkZXJTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBib3JkZXJCb3R0b206IHRoaXMuc3RhdGUub3BlbiA/ICcxcHggc29saWQgIzc1NzU3NScgOiAnJyxcbiAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoMCwgMCwgMCwgMC4zNiknXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogcm9vdFN0eWxlIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7IGRpc3BsYXk6ICdmbGV4JyB9LCBoZWFkZXJTdHlsZSkgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzI0NScpLnJlcGxhY2UoJyVzJywgaXRlbXMubGVuZ3RoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdtZGkgbWRpLWNoZXZyb24tJyArICh0aGlzLnN0YXRlLm9wZW4gPyAndXAnIDogJ2Rvd24nKSwgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcicgfSwgb25DbGljazogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBvcGVuOiAhX3RoaXMyLnN0YXRlLm9wZW4gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLm9wZW4gJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6IDQwLCB0ZXh0QWxpZ246ICdjZW50ZXInIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcjREwnXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUub3BlbiAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBUYXJnZXRlZFVzZXJzO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cblRhcmdldGVkVXNlcnMucHJvcFR5cGVzID0ge1xuICAgIGxpbmtNb2RlbDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKF9saW5rc0xpbmtNb2RlbDJbJ2RlZmF1bHQnXSlcbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFRhcmdldGVkVXNlcnMgPSAoMCwgX1NoYXJlQ29udGV4dENvbnN1bWVyMlsnZGVmYXVsdCddKShUYXJnZXRlZFVzZXJzKTtcblRhcmdldGVkVXNlckxpbmsgPSAoMCwgX1NoYXJlQ29udGV4dENvbnN1bWVyMlsnZGVmYXVsdCddKShUYXJnZXRlZFVzZXJMaW5rKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gVGFyZ2V0ZWRVc2Vycztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkgeyB2YXIgX2FyciA9IFtdOyB2YXIgX24gPSB0cnVlOyB2YXIgX2QgPSBmYWxzZTsgdmFyIF9lID0gdW5kZWZpbmVkOyB0cnkgeyBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7IF9hcnIucHVzaChfcy52YWx1ZSk7IGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhazsgfSB9IGNhdGNoIChlcnIpIHsgX2QgPSB0cnVlOyBfZSA9IGVycjsgfSBmaW5hbGx5IHsgdHJ5IHsgaWYgKCFfbiAmJiBfaVsncmV0dXJuJ10pIF9pWydyZXR1cm4nXSgpOyB9IGZpbmFsbHkgeyBpZiAoX2QpIHRocm93IF9lOyB9IH0gcmV0dXJuIF9hcnI7IH0gcmV0dXJuIGZ1bmN0aW9uIChhcnIsIGkpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyByZXR1cm4gYXJyOyB9IGVsc2UgaWYgKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkgeyByZXR1cm4gc2xpY2VJdGVyYXRvcihhcnIsIGkpOyB9IGVsc2UgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlJyk7IH0gfTsgfSkoKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIgPSByZXF1aXJlKCcuLi9TaGFyZUNvbnRleHRDb25zdW1lcicpO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1NoYXJlQ29udGV4dENvbnN1bWVyKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX3B5ZGlvSHR0cFBvbGljaWVzID0gcmVxdWlyZSgncHlkaW8vaHR0cC9wb2xpY2llcycpO1xuXG52YXIgX3B5ZGlvSHR0cFBvbGljaWVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cFBvbGljaWVzKTtcblxudmFyIF9weWRpb0h0dHBSZXN0QXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9yZXN0LWFwaScpO1xuXG52YXIgX0xpbmtNb2RlbCA9IHJlcXVpcmUoJy4vTGlua01vZGVsJyk7XG5cbnZhciBfTGlua01vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0xpbmtNb2RlbCk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdjb21wb25lbnRzJyk7XG5cbnZhciBSZXNvdXJjZVBvbGljaWVzUGFuZWwgPSBfUHlkaW8kcmVxdWlyZUxpYi5SZXNvdXJjZVBvbGljaWVzUGFuZWw7XG5cbnZhciBWaXNpYmlsaXR5UGFuZWwgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnVmlzaWJpbGl0eVBhbmVsJyxcblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBhc3NvY2lhdGVkIGhpZGRlbiB1c2VycyBwb2xpY2llcywgb3RoZXJ3aXNlXG4gICAgICogdGhlIHB1YmxpYyBsaW5rIHZpc2liaWxpdHkgY2Fubm90IGJlIGNoYW5nZWRcbiAgICAgKiBAcGFyYW0gZGlmZlBvbGljaWVzXG4gICAgICovXG4gICAgb25TYXZlUG9saWNpZXM6IGZ1bmN0aW9uIG9uU2F2ZVBvbGljaWVzKGRpZmZQb2xpY2llcykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgbGlua01vZGVsID0gX3Byb3BzLmxpbmtNb2RlbDtcbiAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuXG4gICAgICAgIHZhciBpbnRlcm5hbFVzZXIgPSBsaW5rTW9kZWwuZ2V0TGluaygpLlVzZXJMb2dpbjtcbiAgICAgICAgX3B5ZGlvSHR0cFBvbGljaWVzMlsnZGVmYXVsdCddLmxvYWRQb2xpY2llcygndXNlcicsIGludGVybmFsVXNlcikudGhlbihmdW5jdGlvbiAocG9saWNpZXMpIHtcbiAgICAgICAgICAgIGlmIChwb2xpY2llcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzb3VyY2VJZCA9IHBvbGljaWVzWzBdLlJlc291cmNlO1xuICAgICAgICAgICAgICAgIHZhciBuZXdQb2xpY2llcyA9IF90aGlzLmRpZmZQb2xpY2llcyhwb2xpY2llcywgZGlmZlBvbGljaWVzLCByZXNvdXJjZUlkKTtcbiAgICAgICAgICAgICAgICBfcHlkaW9IdHRwUG9saWNpZXMyWydkZWZhdWx0J10uc2F2ZVBvbGljaWVzKCd1c2VyJywgaW50ZXJuYWxVc2VyLCBuZXdQb2xpY2llcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBkaWZmUG9saWNpZXM6IGZ1bmN0aW9uIGRpZmZQb2xpY2llcyhwb2xpY2llcywgX2RpZmZQb2xpY2llcywgcmVzb3VyY2VJZCkge1xuICAgICAgICB2YXIgbmV3UG9scyA9IFtdO1xuICAgICAgICBwb2xpY2llcy5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBwLkFjdGlvbiArICcvLy8nICsgcC5TdWJqZWN0O1xuICAgICAgICAgICAgaWYgKCFfZGlmZlBvbGljaWVzLnJlbW92ZVtrZXldKSB7XG4gICAgICAgICAgICAgICAgbmV3UG9scy5wdXNoKHApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmtleXMoX2RpZmZQb2xpY2llcy5hZGQpLm1hcChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgdmFyIG5ld1BvbCA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5TZXJ2aWNlUmVzb3VyY2VQb2xpY3koKTtcblxuICAgICAgICAgICAgdmFyIF9rJHNwbGl0ID0gay5zcGxpdCgnLy8vJyk7XG5cbiAgICAgICAgICAgIHZhciBfayRzcGxpdDIgPSBfc2xpY2VkVG9BcnJheShfayRzcGxpdCwgMik7XG5cbiAgICAgICAgICAgIHZhciBhY3Rpb24gPSBfayRzcGxpdDJbMF07XG4gICAgICAgICAgICB2YXIgc3ViamVjdCA9IF9rJHNwbGl0MlsxXTtcblxuICAgICAgICAgICAgbmV3UG9sLlJlc291cmNlID0gcmVzb3VyY2VJZDtcbiAgICAgICAgICAgIG5ld1BvbC5FZmZlY3QgPSBfcHlkaW9IdHRwUmVzdEFwaS5TZXJ2aWNlUmVzb3VyY2VQb2xpY3lQb2xpY3lFZmZlY3QuY29uc3RydWN0RnJvbU9iamVjdCgnYWxsb3cnKTtcbiAgICAgICAgICAgIG5ld1BvbC5TdWJqZWN0ID0gc3ViamVjdDtcbiAgICAgICAgICAgIG5ld1BvbC5BY3Rpb24gPSBhY3Rpb247XG4gICAgICAgICAgICBuZXdQb2xzLnB1c2gobmV3UG9sKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXdQb2xzO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICB2YXIgbGlua01vZGVsID0gX3Byb3BzMi5saW5rTW9kZWw7XG4gICAgICAgIHZhciBweWRpbyA9IF9wcm9wczIucHlkaW87XG5cbiAgICAgICAgdmFyIHN1YmplY3RzSGlkZGVuID0gW107XG4gICAgICAgIHN1YmplY3RzSGlkZGVuW1widXNlcjpcIiArIGxpbmtNb2RlbC5nZXRMaW5rKCkuVXNlckxvZ2luXSA9IHRydWU7XG4gICAgICAgIHZhciBzdWJqZWN0RGlzYWJsZXMgPSB7IFJFQUQ6IHN1YmplY3RzSGlkZGVuLCBXUklURTogc3ViamVjdHNIaWRkZW4gfTtcbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICB7IHN0eWxlOiB0aGlzLnByb3BzLnN0eWxlIH0sXG4gICAgICAgICAgICBsaW5rTW9kZWwuZ2V0TGluaygpLlV1aWQgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoUmVzb3VyY2VQb2xpY2llc1BhbmVsLCB7XG4gICAgICAgICAgICAgICAgcHlkaW86IHB5ZGlvLFxuICAgICAgICAgICAgICAgIHJlc291cmNlVHlwZTogJ2xpbmsnLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJ2xpbmsudmlzaWJpbGl0eS5hZHZhbmNlZCcpLFxuICAgICAgICAgICAgICAgIHJlc291cmNlSWQ6IGxpbmtNb2RlbC5nZXRMaW5rKCkuVXVpZCxcbiAgICAgICAgICAgICAgICBza2lwVGl0bGU6IHRydWUsXG4gICAgICAgICAgICAgICAgb25TYXZlUG9saWNpZXM6IHRoaXMub25TYXZlUG9saWNpZXMuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBzdWJqZWN0c0Rpc2FibGVkOiBzdWJqZWN0RGlzYWJsZXMsXG4gICAgICAgICAgICAgICAgc3ViamVjdHNIaWRkZW46IHN1YmplY3RzSGlkZGVuLFxuICAgICAgICAgICAgICAgIHJlYWRvbmx5OiB0aGlzLnByb3BzLmlzUmVhZG9ubHkoKSB8fCAhbGlua01vZGVsLmlzRWRpdGFibGUoKSxcbiAgICAgICAgICAgICAgICByZWY6ICdwb2xpY2llcydcbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cblZpc2liaWxpdHlQYW5lbC5Qcm9wVHlwZXMgPSB7XG4gICAgcHlkaW86IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuaW5zdGFuY2VPZihfcHlkaW8yWydkZWZhdWx0J10pLmlzUmVxdWlyZWQsXG4gICAgbGlua01vZGVsOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoX0xpbmtNb2RlbDJbJ2RlZmF1bHQnXSkuaXNSZXF1aXJlZFxufTtcblxuVmlzaWJpbGl0eVBhbmVsID0gKDAsIF9TaGFyZUNvbnRleHRDb25zdW1lcjJbJ2RlZmF1bHQnXSkoVmlzaWJpbGl0eVBhbmVsKTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFZpc2liaWxpdHlQYW5lbDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeDIsIF94MywgX3g0KSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94MiwgcHJvcGVydHkgPSBfeDMsIHJlY2VpdmVyID0gX3g0OyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94MiA9IHBhcmVudDsgX3gzID0gcHJvcGVydHk7IF94NCA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX3B5ZGlvSHR0cEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cEFwaSk7XG5cbnZhciBfcHlkaW9Nb2RlbE5vZGUgPSByZXF1aXJlKCdweWRpby9tb2RlbC9ub2RlJyk7XG5cbnZhciBfcHlkaW9Nb2RlbE5vZGUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9Nb2RlbE5vZGUpO1xuXG52YXIgX3B5ZGlvVXRpbFBhdGggPSByZXF1aXJlKCdweWRpby91dGlsL3BhdGgnKTtcblxudmFyIF9weWRpb1V0aWxQYXRoMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvVXRpbFBhdGgpO1xuXG52YXIgX3B5ZGlvSHR0cFJlc3RBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL3Jlc3QtYXBpJyk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdib290Jyk7XG5cbnZhciBBY3Rpb25EaWFsb2dNaXhpbiA9IF9QeWRpbyRyZXF1aXJlTGliLkFjdGlvbkRpYWxvZ01peGluO1xudmFyIExvYWRlciA9IF9QeWRpbyRyZXF1aXJlTGliLkxvYWRlcjtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliMiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdjb21wb25lbnRzJyk7XG5cbnZhciBNb2RhbEFwcEJhciA9IF9QeWRpbyRyZXF1aXJlTGliMi5Nb2RhbEFwcEJhcjtcbnZhciBFbXB0eVN0YXRlVmlldyA9IF9QeWRpbyRyZXF1aXJlTGliMi5FbXB0eVN0YXRlVmlldztcblxudmFyIFNoYXJlVmlldyA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhTaGFyZVZpZXcsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgX2NyZWF0ZUNsYXNzKFNoYXJlVmlldywgW3tcbiAgICAgICAga2V5OiAnZ2V0Q2hpbGRDb250ZXh0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldENoaWxkQ29udGV4dCgpIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlcyA9IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiBtZXNzYWdlcyxcbiAgICAgICAgICAgICAgICBnZXRNZXNzYWdlOiBmdW5jdGlvbiBnZXRNZXNzYWdlKG1lc3NhZ2VJZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmFtZXNwYWNlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gJ3NoYXJlX2NlbnRlcicgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlc1tuYW1lc3BhY2UgKyAobmFtZXNwYWNlID8gXCIuXCIgOiBcIlwiKSArIG1lc3NhZ2VJZF0gfHwgbWVzc2FnZUlkO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZUlkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpc1JlYWRvbmx5OiAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIGZ1bmN0aW9uIFNoYXJlVmlldyhwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2hhcmVWaWV3KTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihTaGFyZVZpZXcucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICByZXNvdXJjZXM6IFtdLFxuICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICBzZWxlY3RlZE1vZGVsOiBudWxsLFxuICAgICAgICAgICAgc2hhcmVUeXBlOiBwcm9wcy5kZWZhdWx0U2hhcmVUeXBlIHx8ICdMSU5LUydcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoU2hhcmVWaWV3LCBbe1xuICAgICAgICBrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdsb2FkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxvYWQoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLlNoYXJlU2VydmljZUFwaShfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgICAgICB2YXIgcmVxdWVzdCA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5SZXN0TGlzdFNoYXJlZFJlc291cmNlc1JlcXVlc3QoKTtcbiAgICAgICAgICAgIHJlcXVlc3QuU2hhcmVUeXBlID0gX3B5ZGlvSHR0cFJlc3RBcGkuTGlzdFNoYXJlZFJlc291cmNlc1JlcXVlc3RMaXN0U2hhcmVUeXBlLmNvbnN0cnVjdEZyb21PYmplY3QodGhpcy5zdGF0ZS5zaGFyZVR5cGUpO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc3ViamVjdCkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QuU3ViamVjdCA9IHRoaXMucHJvcHMuc3ViamVjdDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5Pd25lZEJ5U3ViamVjdCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdHJ1ZSB9KTtcbiAgICAgICAgICAgIGFwaS5saXN0U2hhcmVkUmVzb3VyY2VzKHJlcXVlc3QpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgcmVzb3VyY2VzOiByZXMuUmVzb3VyY2VzIHx8IFtdLCBsb2FkaW5nOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIH0pWydjYXRjaCddKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldExvbmdlc3RQYXRoJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldExvbmdlc3RQYXRoKG5vZGUpIHtcbiAgICAgICAgICAgIGlmICghbm9kZS5BcHBlYXJzSW4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBwYXRoOiBub2RlLlBhdGgsIGJhc2VuYW1lOiBub2RlLlBhdGggfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwYXRocyA9IHt9O1xuICAgICAgICAgICAgbm9kZS5BcHBlYXJzSW4ubWFwKGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICAgICAgcGF0aHNbYS5QYXRoXSA9IGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocGF0aHMpO1xuICAgICAgICAgICAga2V5cy5zb3J0KCk7XG4gICAgICAgICAgICB2YXIgbG9uZ2VzdCA9IGtleXNba2V5cy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIHZhciBsYWJlbCA9IF9weWRpb1V0aWxQYXRoMlsnZGVmYXVsdCddLmdldEJhc2VuYW1lKGxvbmdlc3QpO1xuICAgICAgICAgICAgaWYgKCFsYWJlbCkge1xuICAgICAgICAgICAgICAgIGxhYmVsID0gcGF0aHNbbG9uZ2VzdF0uV3NMYWJlbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IHBhdGg6IGxvbmdlc3QsIGFwcGVhcnNJbjogcGF0aHNbbG9uZ2VzdF0sIGJhc2VuYW1lOiBsYWJlbCB9O1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnb1RvJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdvVG8oYXBwZWFyc0luKSB7XG4gICAgICAgICAgICB2YXIgUGF0aCA9IGFwcGVhcnNJbi5QYXRoO1xuICAgICAgICAgICAgdmFyIFdzTGFiZWwgPSBhcHBlYXJzSW4uV3NMYWJlbDtcbiAgICAgICAgICAgIHZhciBXc1V1aWQgPSBhcHBlYXJzSW4uV3NVdWlkO1xuXG4gICAgICAgICAgICAvLyBSZW1vdmUgZmlyc3Qgc2VnbWVudCAod3Mgc2x1ZylcbiAgICAgICAgICAgIHZhciBwYXRoZXMgPSBQYXRoLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICBwYXRoZXMuc2hpZnQoKTtcbiAgICAgICAgICAgIHZhciBweWRpb05vZGUgPSBuZXcgX3B5ZGlvTW9kZWxOb2RlMlsnZGVmYXVsdCddKHBhdGhlcy5qb2luKCcvJykpO1xuICAgICAgICAgICAgcHlkaW9Ob2RlLmdldE1ldGFkYXRhKCkuc2V0KCdyZXBvc2l0b3J5X2lkJywgV3NVdWlkKTtcbiAgICAgICAgICAgIHB5ZGlvTm9kZS5nZXRNZXRhZGF0YSgpLnNldCgncmVwb3NpdG9yeV9sYWJlbCcsIFdzTGFiZWwpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5weWRpby5nb1RvKHB5ZGlvTm9kZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uUmVxdWVzdENsb3NlKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgbG9hZGluZyA9IF9zdGF0ZS5sb2FkaW5nO1xuICAgICAgICAgICAgdmFyIHJlc291cmNlcyA9IF9zdGF0ZS5yZXNvdXJjZXM7XG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IF9wcm9wcy5zdHlsZTtcblxuICAgICAgICAgICAgdmFyIG0gPSBmdW5jdGlvbiBtKGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHB5ZGlvLk1lc3NhZ2VIYXNoWydzaGFyZV9jZW50ZXIuJyArIGlkXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXNvdXJjZXMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgIHZhciBrQSA9IGEuTm9kZS5QYXRoO1xuICAgICAgICAgICAgICAgIHZhciBrQiA9IGIuTm9kZS5QYXRoO1xuICAgICAgICAgICAgICAgIHJldHVybiBrQSA9PT0ga0IgPyAwIDoga0EgPiBrQiA/IDEgOiAtMTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGV4dGVuc2lvbnMgPSBweWRpby5SZWdpc3RyeS5nZXRGaWxlc0V4dGVuc2lvbnMoKTtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7fSwgc3R5bGUsIHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyB9KSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBiYWNrZ3JvdW5kQ29sb3I6ICcjRjVGNUY1JywgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNFRUVFRUUnLCBwYWRkaW5nOiAnM3B4IDIwcHgnLCBoZWlnaHQ6IDUwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5TZWxlY3RGaWVsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS5zaGFyZVR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChlLCBpLCB2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHNoYXJlVHlwZTogdiB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIubG9hZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuZGVybGluZVN0eWxlOiB7IGRpc3BsYXk6ICdub25lJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IHdpZHRoOiAxNjAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHZhbHVlOiBcIkxJTktTXCIsIHByaW1hcnlUZXh0OiBtKDI0MykgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyB2YWx1ZTogXCJDRUxMU1wiLCBwcmltYXJ5VGV4dDogbSgyNTApIH0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGxvYWRpbmcgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoTG9hZGVyLCB7IHN0eWxlOiB7IGhlaWdodDogMzAwLCBmbGV4OiAxIH0gfSksXG4gICAgICAgICAgICAgICAgIWxvYWRpbmcgJiYgcmVzb3VyY2VzLmxlbmd0aCA9PT0gMCAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChFbXB0eVN0YXRlVmlldywge1xuICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1zaGFyZS12YXJpYW50XCIsXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlUZXh0SWQ6IG0oMTMxKSxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgZmxleDogMSwgaGVpZ2h0OiAzMDAsIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyB9XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgIWxvYWRpbmcgJiYgcmVzb3VyY2VzLmxlbmd0aCA+IDAgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLkxpc3QsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgbWluSGVpZ2h0OiAzMDAsIG92ZXJmbG93WTogJ2F1dG8nLCBwYWRkaW5nVG9wOiAwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VzLm1hcChmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgX2dldExvbmdlc3RQYXRoID0gX3RoaXMyLmdldExvbmdlc3RQYXRoKHJlcy5Ob2RlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFwcGVhcnNJbiA9IF9nZXRMb25nZXN0UGF0aC5hcHBlYXJzSW47XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYmFzZW5hbWUgPSBfZ2V0TG9uZ2VzdFBhdGguYmFzZW5hbWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpY29uID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2VuYW1lLmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uID0gJ21kaSBtZGktZm9sZGVyJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGV4dCA9IF9weWRpb1V0aWxQYXRoMlsnZGVmYXVsdCddLmdldEZpbGVFeHRlbnNpb24oYmFzZW5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleHRlbnNpb25zLmhhcyhleHQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfZXh0ZW5zaW9ucyRnZXQgPSBleHRlbnNpb25zLmdldChleHQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb250SWNvbiA9IF9leHRlbnNpb25zJGdldC5mb250SWNvbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uID0gJ21kaSBtZGktJyArIGZvbnRJY29uO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb24gPSAnbWRpIG1kaS1maWxlJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzLkxpbmsgJiYgcmVzLkxpbmsuTGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlbmFtZSA9IHJlcy5MaW5rLkxhYmVsICsgJyAoJyArIGJhc2VuYW1lICsgJyknO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkxpc3RJdGVtLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeVRleHQ6IGJhc2VuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeVRleHQ6IHJlcy5MaW5rID8gbSgyNTEpICsgJzogJyArIHJlcy5MaW5rLkRlc2NyaXB0aW9uIDogbSgyODQpLnJlcGxhY2UoJyVzJywgcmVzLkNlbGxzLmxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBlYXJzSW4gPyBfdGhpczIuZ29UbyhhcHBlYXJzSW4pIDogbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiAhYXBwZWFyc0luLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnRJY29uOiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBjbGFzc05hbWU6IGljb24gfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gU2hhcmVWaWV3O1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cblNoYXJlVmlldy5jaGlsZENvbnRleHRUeXBlcyA9IHtcbiAgICBtZXNzYWdlczogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5vYmplY3QsXG4gICAgZ2V0TWVzc2FnZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jLFxuICAgIGlzUmVhZG9ubHk6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuY1xufTtcblxudmFyIFNoYXJlVmlld01vZGFsID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1NoYXJlVmlld01vZGFsJyxcblxuICAgIG1peGluczogW0FjdGlvbkRpYWxvZ01peGluXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlhbG9nVGl0bGU6ICcnLFxuICAgICAgICAgICAgZGlhbG9nU2l6ZTogJ2xnJyxcbiAgICAgICAgICAgIGRpYWxvZ1BhZGRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgZGlhbG9nSXNNb2RhbDogZmFsc2UsXG4gICAgICAgICAgICBkaWFsb2dTY3JvbGxCb2R5OiBmYWxzZVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBzdWJtaXQ6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgdGhpcy5kaXNtaXNzKCk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6ICcxMDAlJywgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyB9IH0sXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNb2RhbEFwcEJhciwge1xuICAgICAgICAgICAgICAgIHRpdGxlOiB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoWydzaGFyZV9jZW50ZXIuOTgnXSxcbiAgICAgICAgICAgICAgICBzaG93TWVudUljb25CdXR0b246IGZhbHNlLFxuICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWVSaWdodDogJ21kaSBtZGktY2xvc2UnLFxuICAgICAgICAgICAgICAgIG9uUmlnaHRJY29uQnV0dG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMzLmRpc21pc3MoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFNoYXJlVmlldywgX2V4dGVuZHMoe30sIHRoaXMucHJvcHMsIHsgc3R5bGU6IHsgd2lkdGg6ICcxMDAlJywgZmxleDogMSB9LCBvblJlcXVlc3RDbG9zZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczMuZGlzbWlzcygpO1xuICAgICAgICAgICAgICAgIH0gfSkpXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxuZXhwb3J0cy5TaGFyZVZpZXcgPSBTaGFyZVZpZXc7XG5leHBvcnRzLlNoYXJlVmlld01vZGFsID0gU2hhcmVWaWV3TW9kYWw7XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyID0gcmVxdWlyZSgnLi4vU2hhcmVDb250ZXh0Q29uc3VtZXInKTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TaGFyZUNvbnRleHRDb25zdW1lcik7XG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBDb21wb25lbnQgPSBfcmVxdWlyZS5Db21wb25lbnQ7XG52YXIgUHJvcFR5cGVzID0gX3JlcXVpcmUuUHJvcFR5cGVzO1xuXG52YXIgX3JlcXVpcmUyID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIEljb25CdXR0b24gPSBfcmVxdWlyZTIuSWNvbkJ1dHRvbjtcblxudmFyIF9yZXF1aXJlMyA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpL3N0eWxlcycpO1xuXG52YXIgbXVpVGhlbWVhYmxlID0gX3JlcXVpcmUzLm11aVRoZW1lYWJsZTtcblxudmFyIEFjdGlvbkJ1dHRvbiA9IChmdW5jdGlvbiAoX0NvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhBY3Rpb25CdXR0b24sIF9Db21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gQWN0aW9uQnV0dG9uKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQWN0aW9uQnV0dG9uKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihBY3Rpb25CdXR0b24ucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoQWN0aW9uQnV0dG9uLCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIHBhbGV0dGUgPSB0aGlzLnByb3BzLm11aVRoZW1lLnBhbGV0dGU7XG5cbiAgICAgICAgICAgIHZhciBzdHlsZSA9IHtcbiAgICAgICAgICAgICAgICByb290OiB7XG4gICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzUwJScsXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAnICsgcGFsZXR0ZS5wcmltYXJ5MUNvbG9yLFxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAzNiwgaGVpZ2h0OiAzNixcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogOCxcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAnMCA2cHgnLFxuICAgICAgICAgICAgICAgICAgICB6SW5kZXg6IDBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGljb246IHtcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IHBhbGV0dGUucHJpbWFyeTFDb2xvcixcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDIwLFxuICAgICAgICAgICAgICAgICAgICBsaW5lSGVpZ2h0OiAnMjBweCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChJY29uQnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgc3R5bGU6IHN0eWxlLnJvb3QsXG4gICAgICAgICAgICAgICAgaWNvblN0eWxlOiBzdHlsZS5pY29uLFxuICAgICAgICAgICAgICAgIG9uVG91Y2hUYXA6IHRoaXMucHJvcHMuY2FsbGJhY2sgfHwgdGhpcy5wcm9wcy5vblRvdWNoVGFwLFxuICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1cIiArIHRoaXMucHJvcHMubWRpSWNvbixcbiAgICAgICAgICAgICAgICB0b29sdGlwOiB0aGlzLnByb3BzLmdldE1lc3NhZ2UodGhpcy5wcm9wcy5tZXNzYWdlSWQsIHRoaXMucHJvcHMubWVzc2FnZUNvcmVOYW1lc3BhY2UgPyAnJyA6IHVuZGVmaW5lZCksXG4gICAgICAgICAgICAgICAgdG9vbHRpcFBvc2l0aW9uOiB0aGlzLnByb3BzLnRvb2x0aXBQb3NpdGlvblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQWN0aW9uQnV0dG9uO1xufSkoQ29tcG9uZW50KTtcblxuQWN0aW9uQnV0dG9uLnByb3BUeXBlcyA9IHtcbiAgICBjYWxsYmFjazogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25Ub3VjaFRhcDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgbWRpSWNvbjogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBtZXNzYWdlSWQ6IFByb3BUeXBlcy5zdHJpbmdcbn07XG5cbkFjdGlvbkJ1dHRvbiA9ICgwLCBfU2hhcmVDb250ZXh0Q29uc3VtZXIyWydkZWZhdWx0J10pKEFjdGlvbkJ1dHRvbik7XG5BY3Rpb25CdXR0b24gPSBtdWlUaGVtZWFibGUoKShBY3Rpb25CdXR0b24pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBBY3Rpb25CdXR0b247XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfbWF0ZXJpYWxVaVN0eWxlcyA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpL3N0eWxlcycpO1xuXG52YXIgZ2xvYmFsU3R5bGVzID0ge1xuICAgIGdsb2JhbExlZnRNYXJnaW46IDY0XG59O1xuXG52YXIgR2VuZXJpY0xpbmUgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoR2VuZXJpY0xpbmUsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gR2VuZXJpY0xpbmUoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBHZW5lcmljTGluZSk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoR2VuZXJpY0xpbmUucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoR2VuZXJpY0xpbmUsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBpY29uQ2xhc3NOYW1lID0gX3Byb3BzLmljb25DbGFzc05hbWU7XG4gICAgICAgICAgICB2YXIgbGVnZW5kID0gX3Byb3BzLmxlZ2VuZDtcbiAgICAgICAgICAgIHZhciBkYXRhID0gX3Byb3BzLmRhdGE7XG4gICAgICAgICAgICB2YXIgZGF0YVN0eWxlID0gX3Byb3BzLmRhdGFTdHlsZTtcbiAgICAgICAgICAgIHZhciBsZWdlbmRTdHlsZSA9IF9wcm9wcy5sZWdlbmRTdHlsZTtcbiAgICAgICAgICAgIHZhciBpY29uU3R5bGUgPSBfcHJvcHMuaWNvblN0eWxlO1xuXG4gICAgICAgICAgICB2YXIgc3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgaWNvbjogX2V4dGVuZHMoe1xuICAgICAgICAgICAgICAgICAgICBtYXJnaW46ICcxNnB4IDIwcHggMCdcbiAgICAgICAgICAgICAgICB9LCBpY29uU3R5bGUpLFxuICAgICAgICAgICAgICAgIGxlZ2VuZDogX2V4dGVuZHMoe1xuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnI2FhYWFhYScsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IDUwMCxcbiAgICAgICAgICAgICAgICAgICAgdGV4dFRyYW5zZm9ybTogJ2xvd2VyY2FzZSdcbiAgICAgICAgICAgICAgICB9LCBsZWdlbmRTdHlsZSksXG4gICAgICAgICAgICAgICAgZGF0YTogX2V4dGVuZHMoe1xuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTUsXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmdSaWdodDogNixcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcydcbiAgICAgICAgICAgICAgICB9LCBkYXRhU3R5bGUpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHsgZGlzcGxheTogJ2ZsZXgnLCBtYXJnaW5Cb3R0b206IDgsIG92ZXJmbG93OiAnaGlkZGVuJyB9LCB0aGlzLnByb3BzLnN0eWxlKSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogZ2xvYmFsU3R5bGVzLmdsb2JhbExlZnRNYXJnaW4gfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBjb2xvcjogJyNhYWFhYWEnLCBjbGFzc05hbWU6IGljb25DbGFzc05hbWUsIHN0eWxlOiBzdHlsZS5pY29uIH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBzdHlsZS5sZWdlbmQgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZ2VuZFxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogc3R5bGUuZGF0YSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBHZW5lcmljTGluZTtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG52YXIgR2VuZXJpY0NhcmQgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQyKSB7XG4gICAgX2luaGVyaXRzKEdlbmVyaWNDYXJkLCBfUmVhY3QkQ29tcG9uZW50Mik7XG5cbiAgICBmdW5jdGlvbiBHZW5lcmljQ2FyZCgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEdlbmVyaWNDYXJkKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihHZW5lcmljQ2FyZC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhHZW5lcmljQ2FyZCwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciB0aXRsZSA9IF9wcm9wczIudGl0bGU7XG4gICAgICAgICAgICB2YXIgb25EaXNtaXNzQWN0aW9uID0gX3Byb3BzMi5vbkRpc21pc3NBY3Rpb247XG4gICAgICAgICAgICB2YXIgb25FZGl0QWN0aW9uID0gX3Byb3BzMi5vbkVkaXRBY3Rpb247XG4gICAgICAgICAgICB2YXIgb25EZWxldGVBY3Rpb24gPSBfcHJvcHMyLm9uRGVsZXRlQWN0aW9uO1xuICAgICAgICAgICAgdmFyIG1vcmVNZW51SXRlbXMgPSBfcHJvcHMyLm1vcmVNZW51SXRlbXM7XG4gICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSBfcHJvcHMyLmNoaWxkcmVuO1xuICAgICAgICAgICAgdmFyIG11aVRoZW1lID0gX3Byb3BzMi5tdWlUaGVtZTtcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IF9wcm9wczIuc3R5bGU7XG4gICAgICAgICAgICB2YXIgaGVhZGVyU21hbGwgPSBfcHJvcHMyLmhlYWRlclNtYWxsO1xuICAgICAgICAgICAgdmFyIHByaW1hcnkxQ29sb3IgPSBtdWlUaGVtZS5wYWxldHRlLnByaW1hcnkxQ29sb3I7XG5cbiAgICAgICAgICAgIHZhciBzdHlsZXMgPSB7XG4gICAgICAgICAgICAgICAgaGVhZGVySGVpZ2h0OiAxMDAsXG4gICAgICAgICAgICAgICAgYnV0dG9uQmFySGVpZ2h0OiA2MCxcbiAgICAgICAgICAgICAgICBmYWJUb3A6IDgwLFxuICAgICAgICAgICAgICAgIGJ1dHRvbjoge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZToge30sXG4gICAgICAgICAgICAgICAgICAgIGljb25TdHlsZTogeyBjb2xvcjogJ3doaXRlJyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChoZWFkZXJTbWFsbCkge1xuICAgICAgICAgICAgICAgIHN0eWxlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVySGVpZ2h0OiA4MCxcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uQmFySGVpZ2h0OiA0MCxcbiAgICAgICAgICAgICAgICAgICAgZmFiVG9wOiA2MCxcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyB3aWR0aDogMzgsIGhlaWdodDogMzgsIHBhZGRpbmc6IDkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25TdHlsZTogeyBjb2xvcjogJ3doaXRlJywgZm9udFNpemU6IDE4IH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5QYXBlcixcbiAgICAgICAgICAgICAgICB7IHpEZXB0aDogMCwgc3R5bGU6IF9leHRlbmRzKHsgd2lkdGg6ICcxMDAlJywgcG9zaXRpb246ICdyZWxhdGl2ZScgfSwgc3R5bGUpIH0sXG4gICAgICAgICAgICAgICAgb25FZGl0QWN0aW9uICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5GbG9hdGluZ0FjdGlvbkJ1dHRvbixcbiAgICAgICAgICAgICAgICAgICAgeyBvblRvdWNoVGFwOiBvbkVkaXRBY3Rpb24sIG1pbmk6IHRydWUsIHN0eWxlOiB7IHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6IHN0eWxlcy5mYWJUb3AsIGxlZnQ6IDEwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRm9udEljb24sIHsgY2xhc3NOYW1lOiBcIm1kaSBtZGktcGVuY2lsXCIgfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5QYXBlcixcbiAgICAgICAgICAgICAgICAgICAgeyB6RGVwdGg6IDAsIHN0eWxlOiB7IGJhY2tncm91bmRDb2xvcjogcHJpbWFyeTFDb2xvciwgY29sb3I6ICd3aGl0ZScsIGhlaWdodDogc3R5bGVzLmhlYWRlckhlaWdodCwgYm9yZGVyUmFkaXVzOiAnMnB4IDJweCAwIDAnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBoZWlnaHQ6IHN0eWxlcy5idXR0b25CYXJIZWlnaHQgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IHN0eWxlOiB7IGZsZXg6IDEgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRGVsZXRlQWN0aW9uICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgc3R5bGU6IHN0eWxlcy5idXR0b24uc3R5bGUsIGljb25TdHlsZTogc3R5bGVzLmJ1dHRvbi5pY29uU3R5bGUsIGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1kZWxldGVcIiwgb25Ub3VjaFRhcDogb25EZWxldGVBY3Rpb24gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtb3JlTWVudUl0ZW1zICYmIG1vcmVNZW51SXRlbXMubGVuZ3RoID4gMCAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5JY29uTWVudSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuY2hvck9yaWdpbjogeyB2ZXJ0aWNhbDogJ3RvcCcsIGhvcml6b250YWw6IGhlYWRlclNtYWxsID8gJ3JpZ2h0JyA6ICdsZWZ0JyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRPcmlnaW46IHsgdmVydGljYWw6ICd0b3AnLCBob3Jpem9udGFsOiBoZWFkZXJTbWFsbCA/ICdyaWdodCcgOiAnbGVmdCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkJ1dHRvbkVsZW1lbnQ6IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgc3R5bGU6IHN0eWxlcy5idXR0b24uc3R5bGUsIGljb25TdHlsZTogc3R5bGVzLmJ1dHRvbi5pY29uU3R5bGUsIGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1kb3RzLXZlcnRpY2FsXCIgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vcmVNZW51SXRlbXNcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkRpc21pc3NBY3Rpb24gJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBzdHlsZTogc3R5bGVzLmJ1dHRvbi5zdHlsZSwgaWNvblN0eWxlOiBzdHlsZXMuYnV0dG9uLmljb25TdHlsZSwgaWNvbkNsYXNzTmFtZTogXCJtZGkgbWRpLWNsb3NlXCIsIG9uVG91Y2hUYXA6IG9uRGlzbWlzc0FjdGlvbiB9KVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nTGVmdDogb25FZGl0QWN0aW9uID8gZ2xvYmFsU3R5bGVzLmdsb2JhbExlZnRNYXJnaW4gOiAyMCwgZm9udFNpemU6IDIwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nVG9wOiAxMiwgcGFkZGluZ0JvdHRvbTogOCB9IH0sXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBHZW5lcmljQ2FyZDtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5leHBvcnRzLkdlbmVyaWNDYXJkID0gR2VuZXJpY0NhcmQgPSAoMCwgX21hdGVyaWFsVWlTdHlsZXMubXVpVGhlbWVhYmxlKSgpKEdlbmVyaWNDYXJkKTtcbmV4cG9ydHMuR2VuZXJpY0NhcmQgPSBHZW5lcmljQ2FyZDtcbmV4cG9ydHMuR2VuZXJpY0xpbmUgPSBHZW5lcmljTGluZTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSBhcnIyW2ldID0gYXJyW2ldOyByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfbWF0ZXJpYWxVaVN0eWxlcyA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpL3N0eWxlcycpO1xuXG52YXIgRWRpdG9yVGFiID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKEVkaXRvclRhYiwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBFZGl0b3JUYWIoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBFZGl0b3JUYWIpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEVkaXRvclRhYi5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhFZGl0b3JUYWIsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciB0YWJzID0gX3Byb3BzLnRhYnM7XG4gICAgICAgICAgICB2YXIgYWN0aXZlID0gX3Byb3BzLmFjdGl2ZTtcbiAgICAgICAgICAgIHZhciBvbkNoYW5nZSA9IF9wcm9wcy5vbkNoYW5nZTtcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IF9wcm9wcy5zdHlsZTtcbiAgICAgICAgICAgIHZhciBtdWlUaGVtZSA9IF9wcm9wcy5tdWlUaGVtZTtcbiAgICAgICAgICAgIHZhciBwcmltYXJ5MUNvbG9yID0gbXVpVGhlbWUucGFsZXR0ZS5wcmltYXJ5MUNvbG9yO1xuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogX2V4dGVuZHMoeyBkaXNwbGF5OiAnZmxleCcgfSwgc3R5bGUpIH0sXG4gICAgICAgICAgICAgICAgdGFicy5tYXAoZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlzQWN0aXZlID0gdC5WYWx1ZSA9PT0gYWN0aXZlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBsYWJlbDogdC5MYWJlbCwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlKHQuVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgcHJpbWFyeTogaXNBY3RpdmUsIHN0eWxlOiBpc0FjdGl2ZSA/IHsgYm9yZGVyQm90dG9tOiAnMnB4IHNvbGlkICcgKyBwcmltYXJ5MUNvbG9yIH0gOiB7IGJvcmRlckJvdHRvbTogMCB9IH0pO1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gRWRpdG9yVGFiO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbkVkaXRvclRhYiA9ICgwLCBfbWF0ZXJpYWxVaVN0eWxlcy5tdWlUaGVtZWFibGUpKCkoRWRpdG9yVGFiKTtcblxudmFyIEVkaXRvclRhYkNvbnRlbnQgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQyKSB7XG4gICAgX2luaGVyaXRzKEVkaXRvclRhYkNvbnRlbnQsIF9SZWFjdCRDb21wb25lbnQyKTtcblxuICAgIGZ1bmN0aW9uIEVkaXRvclRhYkNvbnRlbnQoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBFZGl0b3JUYWJDb250ZW50KTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihFZGl0b3JUYWJDb250ZW50LnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEVkaXRvclRhYkNvbnRlbnQsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgdGFicyA9IF9wcm9wczIudGFicztcbiAgICAgICAgICAgIHZhciBhY3RpdmUgPSBfcHJvcHMyLmFjdGl2ZTtcblxuICAgICAgICAgICAgdmFyIGFjdGl2ZUNvbnRlbnQgPSBudWxsO1xuICAgICAgICAgICAgdGFicy5tYXAoZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgICAgICBpZiAodC5WYWx1ZSA9PT0gYWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZUNvbnRlbnQgPSB0LkNvbXBvbmVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBhY3RpdmVDb250ZW50O1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEVkaXRvclRhYkNvbnRlbnQ7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxudmFyIEdlbmVyaWNFZGl0b3IgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQzKSB7XG4gICAgX2luaGVyaXRzKEdlbmVyaWNFZGl0b3IsIF9SZWFjdCRDb21wb25lbnQzKTtcblxuICAgIGZ1bmN0aW9uIEdlbmVyaWNFZGl0b3IocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEdlbmVyaWNFZGl0b3IpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEdlbmVyaWNFZGl0b3IucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBsZWZ0OiBwcm9wcy50YWJzLmxlZnQubGVuZ3RoID8gcHJvcHMudGFicy5sZWZ0WzBdLlZhbHVlIDogJycsXG4gICAgICAgICAgICByaWdodDogcHJvcHMudGFicy5yaWdodC5sZW5ndGggPyBwcm9wcy50YWJzLnJpZ2h0WzBdLlZhbHVlIDogJydcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoR2VuZXJpY0VkaXRvciwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKHByb3BzKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUubGVmdCAmJiBwcm9wcy50YWJzLmxlZnQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxlZnQ6IHByb3BzLnRhYnMubGVmdFswXS5WYWx1ZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5yaWdodCAmJiBwcm9wcy50YWJzLnJpZ2h0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyByaWdodDogcHJvcHMudGFicy5yaWdodFswXS5WYWx1ZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfcHJvcHMzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciB0YWJzID0gX3Byb3BzMy50YWJzO1xuICAgICAgICAgICAgdmFyIGhlYWRlciA9IF9wcm9wczMuaGVhZGVyO1xuICAgICAgICAgICAgdmFyIG9uU2F2ZUFjdGlvbiA9IF9wcm9wczMub25TYXZlQWN0aW9uO1xuICAgICAgICAgICAgdmFyIG9uQ2xvc2VBY3Rpb24gPSBfcHJvcHMzLm9uQ2xvc2VBY3Rpb247XG4gICAgICAgICAgICB2YXIgb25SZXZlcnRBY3Rpb24gPSBfcHJvcHMzLm9uUmV2ZXJ0QWN0aW9uO1xuICAgICAgICAgICAgdmFyIHNhdmVFbmFibGVkID0gX3Byb3BzMy5zYXZlRW5hYmxlZDtcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IF9wcm9wczMuc3R5bGU7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMzLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIGVkaXRvck9uZUNvbHVtbiA9IF9wcm9wczMuZWRpdG9yT25lQ29sdW1uO1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgbGVmdCA9IF9zdGF0ZS5sZWZ0O1xuICAgICAgICAgICAgdmFyIHJpZ2h0ID0gX3N0YXRlLnJpZ2h0O1xuXG4gICAgICAgICAgICBpZiAoZWRpdG9yT25lQ29sdW1uKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgbWVyZ2VkID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0YWJzLmxlZnQpLCBfdG9Db25zdW1hYmxlQXJyYXkodGFicy5yaWdodCkpO1xuICAgICAgICAgICAgICAgIHZhciBoYXNMYXN0ID0gbWVyZ2VkLmZpbHRlcihmdW5jdGlvbiAodGFiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0YWIuQWx3YXlzTGFzdDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoaGFzTGFzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VkID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShtZXJnZWQuZmlsdGVyKGZ1bmN0aW9uICh0YWIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhdGFiLkFsd2F5c0xhc3Q7XG4gICAgICAgICAgICAgICAgICAgIH0pKSwgW2hhc0xhc3RbMF1dKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGhlaWdodDogJzEwMCUnIH0sIHN0eWxlKSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgYmFja2dyb3VuZENvbG9yOiAnI0VFRUVFRScsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnZmxleC1lbmQnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWlzZWRCdXR0b24sIHsgZGlzYWJsZWQ6ICFzYXZlRW5hYmxlZCwgcHJpbWFyeTogdHJ1ZSwgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWyc1MyddLCBvblRvdWNoVGFwOiBvblNhdmVBY3Rpb24gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBkaXNhYmxlZDogIXNhdmVFbmFibGVkLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbJzYyOCddLCBvblRvdWNoVGFwOiBvblJldmVydEFjdGlvbiwgc3R5bGU6IHsgbWFyZ2luTGVmdDogMTAgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1jbG9zZVwiLCB0b29sdGlwOiBweWRpby5NZXNzYWdlSGFzaFsnODYnXSwgb25Ub3VjaFRhcDogb25DbG9zZUFjdGlvbiwgc3R5bGU6IHsgbWFyZ2luTGVmdDogMTAgfSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgcGFkZGluZzogJzEwcHggMjBweCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlclxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoRWRpdG9yVGFiLCB7IHRhYnM6IG1lcmdlZCwgYWN0aXZlOiBsZWZ0LCBzdHlsZTogeyBmbGV4OiAxIH0sIG9uQ2hhbmdlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBsZWZ0OiB2YWx1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIG51bGwpLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZsZXg6IDEgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogX2V4dGVuZHMoeyBvdmVyZmxvd1k6ICdhdXRvJywgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiAnMTAwJScsIHBhZGRpbmc6IDEwIH0sIHRhYnMubGVmdFN0eWxlKSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEVkaXRvclRhYkNvbnRlbnQsIHsgdGFiczogbWVyZ2VkLCBhY3RpdmU6IGxlZnQgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogX2V4dGVuZHMoeyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBoZWlnaHQ6ICcxMDAlJyB9LCBzdHlsZSkgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBwYWRkaW5nOiAnMTBweCAyMHB4IDIwcHgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgcGFkZGluZ1JpZ2h0OiAyMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nVG9wOiAxOCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuUmFpc2VkQnV0dG9uLCB7IGRpc2FibGVkOiAhc2F2ZUVuYWJsZWQsIHByaW1hcnk6IHRydWUsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnNTMnXSwgb25Ub3VjaFRhcDogb25TYXZlQWN0aW9uIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgZGlzYWJsZWQ6ICFzYXZlRW5hYmxlZCwgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWyc2MjgnXSwgb25Ub3VjaFRhcDogb25SZXZlcnRBY3Rpb24sIHN0eWxlOiB7IG1hcmdpbkxlZnQ6IDEwIH0gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBpY29uQ2xhc3NOYW1lOiBcIm1kaSBtZGktY2xvc2VcIiwgdG9vbHRpcDogcHlkaW8uTWVzc2FnZUhhc2hbJzg2J10sIG9uVG91Y2hUYXA6IG9uQ2xvc2VBY3Rpb24sIHN0eWxlOiB7IG1hcmdpbkxlZnQ6IDEwIH0gfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEVkaXRvclRhYiwgeyB0YWJzOiB0YWJzLmxlZnQsIGFjdGl2ZTogbGVmdCwgc3R5bGU6IHsgZmxleDogMSB9LCBvbkNoYW5nZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgbGVmdDogdmFsdWUgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEVkaXRvclRhYiwgeyB0YWJzOiB0YWJzLnJpZ2h0LCBhY3RpdmU6IHJpZ2h0LCBzdHlsZTogeyBmbGV4OiAxIH0sIG9uQ2hhbmdlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyByaWdodDogdmFsdWUgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5EaXZpZGVyLCBudWxsKSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4OiAxIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHsgb3ZlcmZsb3dZOiAnYXV0bycsIHdpZHRoOiAnNTAlJywgYm9yZGVyUmlnaHQ6ICcxcHggc29saWQgI2UwZTBlMCcsIHBhZGRpbmc6IDEwIH0sIHRhYnMubGVmdFN0eWxlKSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEVkaXRvclRhYkNvbnRlbnQsIHsgdGFiczogdGFicy5sZWZ0LCBhY3RpdmU6IGxlZnQgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7IG92ZXJmbG93WTogJ2F1dG8nLCB3aWR0aDogJzUwJScsIHBhZGRpbmc6IDEwIH0sIHRhYnMucmlnaHRTdHlsZSkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChFZGl0b3JUYWJDb250ZW50LCB7IHRhYnM6IHRhYnMucmlnaHQsIGFjdGl2ZTogcmlnaHQgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gR2VuZXJpY0VkaXRvcjtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBHZW5lcmljRWRpdG9yO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfY29tcG9zaXRlQ29tcG9zaXRlQ2FyZCA9IHJlcXVpcmUoJy4uL2NvbXBvc2l0ZS9Db21wb3NpdGVDYXJkJyk7XG5cbnZhciBfY29tcG9zaXRlQ29tcG9zaXRlQ2FyZDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jb21wb3NpdGVDb21wb3NpdGVDYXJkKTtcblxudmFyIF9jZWxsc0NlbGxDYXJkID0gcmVxdWlyZSgnLi4vY2VsbHMvQ2VsbENhcmQnKTtcblxudmFyIF9jZWxsc0NlbGxDYXJkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NlbGxzQ2VsbENhcmQpO1xuXG52YXIgSW5mb1BhbmVsID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKEluZm9QYW5lbCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBJbmZvUGFuZWwocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEluZm9QYW5lbCk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoSW5mb1BhbmVsLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0geyBwb3BvdmVyT3BlbjogZmFsc2UgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoSW5mb1BhbmVsLCBbe1xuICAgICAgICBrZXk6ICdvcGVuUG9wb3ZlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuUG9wb3ZlcihldmVudCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBvcG92ZXJPcGVuOiB0cnVlLCBwb3BvdmVyQW5jaG9yOiBldmVudC50YXJnZXQgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcbiAgICAgICAgICAgIHZhciBub2RlID0gX3Byb3BzLm5vZGU7XG5cbiAgICAgICAgICAgIGlmIChub2RlLmlzUm9vdCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBQeWRpb1dvcmtzcGFjZXMuSW5mb1BhbmVsQ2FyZCxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfY2VsbHNDZWxsQ2FyZDJbJ2RlZmF1bHQnXSwgeyBjZWxsSWQ6IHB5ZGlvLnVzZXIuYWN0aXZlUmVwb3NpdG9yeSwgcHlkaW86IHB5ZGlvLCBtb2RlOiAnaW5mb1BhbmVsJyB9KVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBQeWRpb1dvcmtzcGFjZXMuSW5mb1BhbmVsQ2FyZCxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfY29tcG9zaXRlQ29tcG9zaXRlQ2FyZDJbJ2RlZmF1bHQnXSwgeyBub2RlOiBub2RlLCBweWRpbzogcHlkaW8sIG1vZGU6ICdpbmZvUGFuZWwnIH0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEluZm9QYW5lbDtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBJbmZvUGFuZWw7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF9weWRpb1V0aWxYbWwgPSByZXF1aXJlKCdweWRpby91dGlsL3htbCcpO1xuXG52YXIgX3B5ZGlvVXRpbFhtbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb1V0aWxYbWwpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cEFwaSk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9weWRpb0h0dHBSZXN0QXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9yZXN0LWFwaScpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgbW9tZW50ID0gX1B5ZGlvJHJlcXVpcmVMaWIubW9tZW50O1xuXG52YXIgU2hhcmVIZWxwZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNoYXJlSGVscGVyKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2hhcmVIZWxwZXIpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhTaGFyZUhlbHBlciwgbnVsbCwgW3tcbiAgICAgICAga2V5OiAnbWFpbGVyU3VwcG9ydGVkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG1haWxlclN1cHBvcnRlZChweWRpbykge1xuICAgICAgICAgICAgcmV0dXJuIHB5ZGlvLlBhcmFtZXRlcnMuZ2V0KCd2YWxpZE1haWxlcicpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRBdXRob3JpemF0aW9ucycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRBdXRob3JpemF0aW9ucyhweWRpbykge1xuXG4gICAgICAgICAgICB2YXIgcGx1Z2luQ29uZmlncyA9IHB5ZGlvLmdldFBsdWdpbkNvbmZpZ3MoXCJhY3Rpb24uc2hhcmVcIik7XG4gICAgICAgICAgICB2YXIgYXV0aG9yaXphdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgZm9sZGVyX3B1YmxpY19saW5rOiBwbHVnaW5Db25maWdzLmdldChcIkVOQUJMRV9GT0xERVJfUFVCTElDX0xJTktcIiksXG4gICAgICAgICAgICAgICAgZm9sZGVyX3dvcmtzcGFjZXM6IHBsdWdpbkNvbmZpZ3MuZ2V0KFwiRU5BQkxFX0ZPTERFUl9JTlRFUk5BTF9TSEFSSU5HXCIpLFxuICAgICAgICAgICAgICAgIGZpbGVfcHVibGljX2xpbms6IHBsdWdpbkNvbmZpZ3MuZ2V0KFwiRU5BQkxFX0ZJTEVfUFVCTElDX0xJTktcIiksXG4gICAgICAgICAgICAgICAgZmlsZV93b3Jrc3BhY2VzOiBwbHVnaW5Db25maWdzLmdldChcIkVOQUJMRV9GSUxFX0lOVEVSTkFMX1NIQVJJTkdcIiksXG4gICAgICAgICAgICAgICAgZWRpdGFibGVfaGFzaDogcGx1Z2luQ29uZmlncy5nZXQoXCJIQVNIX1VTRVJfRURJVEFCTEVcIiksXG4gICAgICAgICAgICAgICAgaGFzaF9taW5fbGVuZ3RoOiBwbHVnaW5Db25maWdzLmdldChcIkhBU0hfTUlOX0xFTkdUSFwiKSB8fCA2LFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkX21hbmRhdG9yeTogZmFsc2UsXG4gICAgICAgICAgICAgICAgbWF4X2V4cGlyYXRpb246IHBsdWdpbkNvbmZpZ3MuZ2V0KFwiRklMRV9NQVhfRVhQSVJBVElPTlwiKSxcbiAgICAgICAgICAgICAgICBtYXhfZG93bmxvYWRzOiBwbHVnaW5Db25maWdzLmdldChcIkZJTEVfTUFYX0RPV05MT0FEXCIpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHBhc3NNYW5kYXRvcnkgPSBwbHVnaW5Db25maWdzLmdldChcIlNIQVJFX0ZPUkNFX1BBU1NXT1JEXCIpO1xuICAgICAgICAgICAgaWYgKHBhc3NNYW5kYXRvcnkpIHtcbiAgICAgICAgICAgICAgICBhdXRob3JpemF0aW9ucy5wYXNzd29yZF9tYW5kYXRvcnkgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXV0aG9yaXphdGlvbnMucGFzc3dvcmRfcGxhY2Vob2xkZXIgPSBwYXNzTWFuZGF0b3J5ID8gcHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci4xNzYnXSA6IHB5ZGlvLk1lc3NhZ2VIYXNoWydzaGFyZV9jZW50ZXIuMTQ4J107XG4gICAgICAgICAgICByZXR1cm4gYXV0aG9yaXphdGlvbnM7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2J1aWxkUHVibGljVXJsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGJ1aWxkUHVibGljVXJsKHB5ZGlvLCBsaW5rSGFzaCkge1xuICAgICAgICAgICAgdmFyIHNob3J0Rm9ybSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogYXJndW1lbnRzWzJdO1xuXG4gICAgICAgICAgICB2YXIgcGx1Z2luQ29uZmlncyA9IHB5ZGlvLlBhcmFtZXRlcnM7XG4gICAgICAgICAgICBpZiAoc2hvcnRGb3JtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcuLi4nICsgcGx1Z2luQ29uZmlncy5nZXQoJ1BVQkxJQ19CQVNFVVJJJykgKyAnLycgKyBsaW5rSGFzaDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBsdWdpbkNvbmZpZ3MuZ2V0KCdGUk9OVEVORF9VUkwnKSArIHBsdWdpbkNvbmZpZ3MuZ2V0KCdQVUJMSUNfQkFTRVVSSScpICsgJy8nICsgbGlua0hhc2g7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHB5ZGlvIHtQeWRpb31cbiAgICAgICAgICogQHBhcmFtIG5vZGUge0FqeHBOb2RlfVxuICAgICAgICAgKiBAcmV0dXJuIHt7cHJldmlldzogYm9vbGVhbiwgd3JpdGVhYmxlOiBib29sZWFufX1cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdub2RlSGFzRWRpdG9yJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG5vZGVIYXNFZGl0b3IocHlkaW8sIG5vZGUpIHtcbiAgICAgICAgICAgIGlmICghbm9kZS5nZXRNZXRhZGF0YSgpLmhhcygnbWltZV9oYXNfcHJldmlld19lZGl0b3InKSkge1xuICAgICAgICAgICAgICAgIHZhciBlZGl0b3JzID0gcHlkaW8uUmVnaXN0cnkuZmluZEVkaXRvcnNGb3JNaW1lKG5vZGUuZ2V0QWp4cE1pbWUoKSk7XG4gICAgICAgICAgICAgICAgZWRpdG9ycyA9IGVkaXRvcnMuZmlsdGVyKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlLmlkICE9PSAnZWRpdG9yLmJyb3dzZXInICYmIGUuaWQgIT09ICdlZGl0b3Iub3RoZXInO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHZhciB3cml0ZWFibGUgPSBlZGl0b3JzLmZpbHRlcihmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZS5jYW5Xcml0ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBub2RlLmdldE1ldGFkYXRhKCkuc2V0KFwibWltZV9oYXNfcHJldmlld19lZGl0b3JcIiwgZWRpdG9ycy5sZW5ndGggPiAwKTtcbiAgICAgICAgICAgICAgICBub2RlLmdldE1ldGFkYXRhKCkuc2V0KFwibWltZV9oYXNfd3JpdGVhYmxlX2VkaXRvclwiLCB3cml0ZWFibGUubGVuZ3RoID4gMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHByZXZpZXc6IG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoXCJtaW1lX2hhc19wcmV2aWV3X2VkaXRvclwiKSxcbiAgICAgICAgICAgICAgICB3cml0ZWFibGU6IG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoXCJtaW1lX2hhc193cml0ZWFibGVfZWRpdG9yXCIpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBweWRpbyB7UHlkaW99XG4gICAgICAgICAqIEBwYXJhbSBsaW5rTW9kZWwge0NvbXBvc2l0ZU1vZGVsfVxuICAgICAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBpbGVMYXlvdXREYXRhJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBpbGVMYXlvdXREYXRhKHB5ZGlvLCBsaW5rTW9kZWwpIHtcblxuICAgICAgICAgICAgLy8gU2VhcmNoIHJlZ2lzdHJ5IGZvciB0ZW1wbGF0ZSBub2RlcyBzdGFydGluZyB3aXRoIG1pbmlzaXRlX1xuICAgICAgICAgICAgdmFyIHRtcGwgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgY3VycmVudEV4dCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHZhciBub2RlID0gbGlua01vZGVsLmdldE5vZGUoKTtcbiAgICAgICAgICAgIGlmIChub2RlLmlzTGVhZigpKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudEV4dCA9IG5vZGUuZ2V0QWp4cE1pbWUoKTtcbiAgICAgICAgICAgICAgICB0bXBsID0gX3B5ZGlvVXRpbFhtbDJbJ2RlZmF1bHQnXS5YUGF0aFNlbGVjdE5vZGVzKHB5ZGlvLmdldFhtbFJlZ2lzdHJ5KCksIFwiLy90ZW1wbGF0ZVtjb250YWlucyhAbmFtZSwgJ3VuaXF1ZV9wcmV2aWV3XycpXVwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdG1wbCA9IF9weWRpb1V0aWxYbWwyWydkZWZhdWx0J10uWFBhdGhTZWxlY3ROb2RlcyhweWRpby5nZXRYbWxSZWdpc3RyeSgpLCBcIi8vdGVtcGxhdGVbY29udGFpbnMoQG5hbWUsICdtaW5pc2l0ZV8nKV1cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdG1wbC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodG1wbC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW3sgTEFZT1VUX05BTUU6IHRtcGxbMF0uZ2V0QXR0cmlidXRlKCdlbGVtZW50JyksIExBWU9VVF9MQUJFTDogJycgfV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgY3J0VGhlbWUgPSBweWRpby5QYXJhbWV0ZXJzLmdldCgndGhlbWUnKTtcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICAgICAgICAgIHRtcGwubWFwKGZ1bmN0aW9uICh4bWxOb2RlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRoZW1lID0geG1sTm9kZS5nZXRBdHRyaWJ1dGUoJ3RoZW1lJyk7XG4gICAgICAgICAgICAgICAgaWYgKHRoZW1lICYmIHRoZW1lICE9PSBjcnRUaGVtZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50ID0geG1sTm9kZS5nZXRBdHRyaWJ1dGUoJ2VsZW1lbnQnKTtcbiAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IHhtbE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyk7XG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsID0geG1sTm9kZS5nZXRBdHRyaWJ1dGUoJ2xhYmVsJyk7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRFeHQgJiYgbmFtZSA9PT0gXCJ1bmlxdWVfcHJldmlld19maWxlXCIgJiYgIVNoYXJlSGVscGVyLm5vZGVIYXNFZGl0b3IocHlkaW8sIG5vZGUpLnByZXZpZXcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWdub3JlIHRoaXMgdGVtcGxhdGVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKE1lc3NhZ2VIYXNoW2xhYmVsXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBNZXNzYWdlSGFzaFtsYWJlbF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IHhtbE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhbHVlc1tuYW1lXSA9IGVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgdmFsdWVzLnB1c2goeyBMQVlPVVRfTkFNRTogbmFtZSwgTEFZT1VUX0VMRU1FTlQ6IGVsZW1lbnQsIExBWU9VVF9MQUJFTDogbGFiZWwgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2ZvcmNlTWFpbGVyT2xkU2Nob29sJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGZvcmNlTWFpbGVyT2xkU2Nob29sKCkge1xuICAgICAgICAgICAgcmV0dXJuIGdsb2JhbC5weWRpby5nZXRQbHVnaW5Db25maWdzKFwiYWN0aW9uLnNoYXJlXCIpLmdldChcIkVNQUlMX0lOVklURV9FWFRFUk5BTFwiKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncXJjb2RlRW5hYmxlZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBxcmNvZGVFbmFibGVkKCkge1xuICAgICAgICAgICAgcmV0dXJuIGdsb2JhbC5weWRpby5nZXRQbHVnaW5Db25maWdzKFwiYWN0aW9uLnNoYXJlXCIpLmdldChcIkNSRUFURV9RUkNPREVcIik7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIG5vZGVcbiAgICAgICAgICogQHBhcmFtIGNlbGxNb2RlbFxuICAgICAgICAgKiBAcGFyYW0gdGFyZ2V0VXNlcnNcbiAgICAgICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc2VuZENlbGxJbnZpdGF0aW9uJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNlbmRDZWxsSW52aXRhdGlvbihub2RlLCBjZWxsTW9kZWwsIHRhcmdldFVzZXJzKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDMgfHwgYXJndW1lbnRzWzNdID09PSB1bmRlZmluZWQgPyBmdW5jdGlvbiAoKSB7fSA6IGFyZ3VtZW50c1szXTtcblxuICAgICAgICAgICAgdmFyIF9TaGFyZUhlbHBlciRwcmVwYXJlRW1haWwgPSBTaGFyZUhlbHBlci5wcmVwYXJlRW1haWwobm9kZSwgbnVsbCwgY2VsbE1vZGVsKTtcblxuICAgICAgICAgICAgdmFyIHRlbXBsYXRlSWQgPSBfU2hhcmVIZWxwZXIkcHJlcGFyZUVtYWlsLnRlbXBsYXRlSWQ7XG4gICAgICAgICAgICB2YXIgdGVtcGxhdGVEYXRhID0gX1NoYXJlSGVscGVyJHByZXBhcmVFbWFpbC50ZW1wbGF0ZURhdGE7XG5cbiAgICAgICAgICAgIHZhciBtYWlsID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLk1haWxlck1haWwoKTtcbiAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuTWFpbGVyU2VydmljZUFwaShfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgICAgICBtYWlsLlRvID0gW107XG4gICAgICAgICAgICB2YXIgaWdub3JlZCA9IDA7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyh0YXJnZXRVc2VycykubWFwKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHUgPSB0YXJnZXRVc2Vyc1trXTtcbiAgICAgICAgICAgICAgICB2YXIgdG8gPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuTWFpbGVyVXNlcigpO1xuICAgICAgICAgICAgICAgIGlmICh1LklkbVVzZXIgJiYgdS5JZG1Vc2VyLkxvZ2luICYmIHUuSWRtVXNlci5BdHRyaWJ1dGVzICYmICh1LklkbVVzZXIuQXR0cmlidXRlc1snaGFzRW1haWwnXSB8fCB1LklkbVVzZXIuQXR0cmlidXRlc1snZW1haWwnXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdG8uVXVpZCA9IHUuSWRtVXNlci5Mb2dpbjtcbiAgICAgICAgICAgICAgICAgICAgbWFpbC5Uby5wdXNoKHRvKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZ25vcmVkKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0bztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2VzID0gX3B5ZGlvMlsnZGVmYXVsdCddLmdldEluc3RhbmNlKCkuTWVzc2FnZUhhc2g7XG4gICAgICAgICAgICBpZiAobWFpbC5Uby5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBtYWlsLlRlbXBsYXRlSWQgPSB0ZW1wbGF0ZUlkO1xuICAgICAgICAgICAgICAgIG1haWwuVGVtcGxhdGVEYXRhID0gdGVtcGxhdGVEYXRhO1xuICAgICAgICAgICAgICAgIGFwaS5zZW5kKG1haWwpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHZhciBtc2cgPSBtZXNzYWdlc1snY29yZS5tYWlsZXIuMSddLnJlcGxhY2UoJyVzJywgbWFpbC5Uby5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGlmIChpZ25vcmVkID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBtc2cgKz0gJyAnICsgbWVzc2FnZXNbJ2NvcmUubWFpbGVyLmVudHJpZXMuaWdub3JlZCddO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfcHlkaW8yWydkZWZhdWx0J10uZ2V0SW5zdGFuY2UoKS5VSS5kaXNwbGF5TWVzc2FnZSgnU1VDQ0VTUycsIG1zZyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF9weWRpbzJbJ2RlZmF1bHQnXS5nZXRJbnN0YW5jZSgpLlVJLmRpc3BsYXlNZXNzYWdlKCdFUlJPUicsIG1lc3NhZ2VzWydjb3JlLm1haWxlci5lbnRyaWVzLmlnbm9yZWQnXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIG5vZGUge05vZGV9XG4gICAgICAgICAqIEBwYXJhbSBsaW5rTW9kZWwge0xpbmtNb2RlbH1cbiAgICAgICAgICogQHBhcmFtIGNlbGxNb2RlbCB7Q2VsbE1vZGVsfVxuICAgICAgICAgKiBAcmV0dXJuIHt7dGVtcGxhdGVJZDogc3RyaW5nLCB0ZW1wbGF0ZURhdGE6IHt9LCBtZXNzYWdlOiBzdHJpbmcsIGxpbmtNb2RlbDogKn19XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAncHJlcGFyZUVtYWlsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHByZXBhcmVFbWFpbChub2RlKSB7XG4gICAgICAgICAgICB2YXIgbGlua01vZGVsID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgICAgIHZhciBjZWxsTW9kZWwgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzJdO1xuXG4gICAgICAgICAgICB2YXIgdGVtcGxhdGVEYXRhID0ge307XG4gICAgICAgICAgICB2YXIgdGVtcGxhdGVJZCA9IFwiXCI7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IFwiXCI7XG4gICAgICAgICAgICB2YXIgdXNlciA9IHB5ZGlvLnVzZXI7XG4gICAgICAgICAgICBpZiAodXNlci5nZXRQcmVmZXJlbmNlKFwiZGlzcGxheU5hbWVcIikpIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZURhdGFbXCJJbnZpdGVyXCJdID0gdXNlci5nZXRQcmVmZXJlbmNlKFwiZGlzcGxheU5hbWVcIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlRGF0YVtcIkludml0ZXJcIl0gPSB1c2VyLmlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxpbmtNb2RlbCkge1xuICAgICAgICAgICAgICAgIHZhciBsaW5rT2JqZWN0ID0gbGlua01vZGVsLmdldExpbmsoKTtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5pc0xlYWYoKSkge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZUlkID0gXCJQdWJsaWNGaWxlXCI7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlRGF0YVtcIkZpbGVOYW1lXCJdID0gbGlua09iamVjdC5MYWJlbCB8fCBub2RlLmdldExhYmVsKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVJZCA9IFwiUHVibGljRm9sZGVyXCI7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlRGF0YVtcIkZvbGRlck5hbWVcIl0gPSBsaW5rT2JqZWN0LkxhYmVsIHx8IG5vZGUuZ2V0TGFiZWwoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVEYXRhW1wiTGlua1BhdGhcIl0gPSBcIi9wdWJsaWMvXCIgKyBsaW5rT2JqZWN0LkxpbmtIYXNoO1xuICAgICAgICAgICAgICAgIGlmIChsaW5rT2JqZWN0Lk1heERvd25sb2Fkcykge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZURhdGFbXCJNYXhEb3dubG9hZHNcIl0gPSBsaW5rT2JqZWN0Lk1heERvd25sb2FkcyArIFwiXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChsaW5rT2JqZWN0LkFjY2Vzc0VuZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbSA9IG1vbWVudChuZXcgRGF0ZShsaW5rT2JqZWN0LkFjY2Vzc0VuZCAqIDEwMDApKTtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVEYXRhW1wiRXhwaXJlXCJdID0gbS5mb3JtYXQoJ0xMJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZUlkID0gXCJDZWxsXCI7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVEYXRhW1wiQ2VsbFwiXSA9IGNlbGxNb2RlbC5nZXRMYWJlbCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlSWQ6IHRlbXBsYXRlSWQsIHRlbXBsYXRlRGF0YTogdGVtcGxhdGVEYXRhLCBtZXNzYWdlOiBtZXNzYWdlLCBsaW5rTW9kZWw6IGxpbmtNb2RlbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBTaGFyZUhlbHBlcjtcbn0pKCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFNoYXJlSGVscGVyO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iXX0=
