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

var PropTypes = require('prop-types');
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
        messages: PropTypes.object,
        getMessage: PropTypes.func,
        isReadonly: PropTypes.func
    };

    return ShareContextConsumer;
};

module.exports = exports['default'];

},{"prop-types":"prop-types","react":"react"}],2:[function(require,module,exports){
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _EditCellDialog = require('./EditCellDialog');

var _EditCellDialog2 = _interopRequireDefault(_EditCellDialog);

var _pydioModelCell = require('pydio/model/cell');

var _pydioModelCell2 = _interopRequireDefault(_pydioModelCell);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _materialUi = require('material-ui');

var _mainShareHelper = require("../main/ShareHelper");

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var _Pydio$requireLib = _pydio2['default'].requireLib("components");

var GenericCard = _Pydio$requireLib.GenericCard;
var GenericLine = _Pydio$requireLib.GenericLine;

var CellCard = (function (_React$Component) {
    _inherits(CellCard, _React$Component);

    function CellCard(props) {
        var _this = this;

        _classCallCheck(this, CellCard);

        _get(Object.getPrototypeOf(CellCard.prototype), 'constructor', this).call(this, props);
        this.state = { edit: false, model: new _pydioModelCell2['default'](), loading: true };
        this._observer = function () {
            _this.forceUpdate();
        };
        _pydioHttpResourcesManager2['default'].loadClassesAndApply(["PydioActivityStreams", "PydioCoreActions"], function () {
            _this.setState({ extLibs: true });
        });
        var rootNode = this.props.rootNode;

        if (rootNode) {
            if (rootNode.getMetadata().has('virtual_root')) {
                // Use node children instead
                if (rootNode.isLoaded()) {
                    this.state.rootNodes = [];
                    rootNode.getChildren().forEach(function (n) {
                        return _this.state.rootNodes.push(n);
                    });
                } else {
                    // Trigger children load
                    rootNode.observe('loaded', function () {
                        var rootNodes = [];
                        rootNode.getChildren().forEach(function (n) {
                            return rootNodes.push(n);
                        });
                        _this.setState({ rootNodes: rootNodes });
                    });
                    rootNode.load();
                }
            } else {
                this.state.rootNodes = [rootNode];
            }
        }
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
                    _this2.setState({ model: cell, loading: false });
                    cell.observe('update', _this2._observer);
                });
            } else {
                this.state.model.observe('update', function () {
                    _this2.setState({ loading: false });
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
            var extLibs = _state.extLibs;
            var rootNodes = _state.rootNodes;
            var loading = _state.loading;

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
            } else if (model) {
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
                var watchLine = undefined,
                    bmButton = undefined;
                if (extLibs && rootNodes && !loading) {
                    var selector = _react2['default'].createElement(PydioActivityStreams.WatchSelector, { pydio: pydio, nodes: rootNodes });
                    watchLine = _react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-bell-outline", legend: pydio.MessageHash['meta.watch.selector.legend'], data: selector, iconStyle: { marginTop: 32 } });
                    bmButton = _react2['default'].createElement(PydioCoreActions.BookmarkButton, { pydio: pydio, nodes: rootNodes, styles: { iconStyle: { color: 'white' } } });
                }

                content = _react2['default'].createElement(
                    GenericCard,
                    {
                        pydio: pydio,
                        title: model.getLabel(),
                        onDismissAction: this.props.onDismiss,
                        otherActions: bmButton,
                        onDeleteAction: deleteAction,
                        onEditAction: editAction,
                        headerSmall: mode === 'infoPanel',
                        moreMenuItems: moreMenuItems
                    },
                    !loading && model.getDescription() && _react2['default'].createElement(GenericLine, { iconClassName: 'mdi mdi-information', legend: m(145), data: model.getDescription() }),
                    !loading && _react2['default'].createElement(GenericLine, { iconClassName: 'mdi mdi-account-multiple', legend: m(54), data: model.getAclsSubjects() }),
                    !loading && _react2['default'].createElement(GenericLine, { iconClassName: 'mdi mdi-folder', legend: m(249), data: nodes }),
                    watchLine,
                    loading && _react2['default'].createElement(
                        'div',
                        { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, fontWeight: 500, color: '#aaa' } },
                        _pydio2['default'].getMessages()[466]
                    )
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

},{"../main/ShareHelper":29,"./EditCellDialog":4,"material-ui":"material-ui","pydio":"pydio","pydio/http/resources-manager":"pydio/http/resources-manager","pydio/model/cell":"pydio/model/cell","react":"react"}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

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

var CreateCellDialog = (function (_React$Component) {
    _inherits(CreateCellDialog, _React$Component);

    function CreateCellDialog() {
        var _this = this;

        _classCallCheck(this, CreateCellDialog);

        _get(Object.getPrototypeOf(CreateCellDialog.prototype), 'constructor', this).apply(this, arguments);

        this.state = { step: 'users', model: new _pydioModelCell2['default'](), saving: false };

        this.submit = function () {
            var model = _this.state.model;

            _this.setState({ saving: true });
            model.save().then(function (result) {
                _this.props.onDismiss();
                _this.setState({ saving: false });
            })['catch'](function (reason) {
                pydio.UI.displayMessage('ERROR', reason.message);
                _this.setState({ saving: false });
            });
        };

        this.m = function (id) {
            return _this.props.pydio.MessageHash['share_center.' + id];
        };

        this.computeSummaryString = function () {
            var model = _this.state.model;

            var users = 0;
            var groups = 0;
            var teams = 0;
            var userString = [];
            var objs = model.getAcls();
            Object.keys(objs).map(function (k) {
                var acl = objs[k];
                if (acl.Group) groups++;else if (acl.Role) teams++;else users++;
            });
            if (users) userString.push(users + ' ' + _this.m(270));
            if (groups) userString.push(groups + ' ' + _this.m(271));
            if (teams) userString.push(teams + ' ' + _this.m(272));
            var finalString = undefined;
            if (userString.length === 3) {
                finalString = userString[0] + ', ' + userString[1] + _this.m(274) + userString[3];
            } else if (userString.length === 0) {
                finalString = _this.m(273);
            } else {
                finalString = userString.join(_this.m(274));
            }
            return _this.m(269).replace('%USERS', finalString);
        };
    }

    _createClass(CreateCellDialog, [{
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
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            this.refs.title.focus();
            this.state.model.observe('update', function () {
                _this2.forceUpdate();
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.state.model.stopObserving('update');
        }
    }, {
        key: 'render',
        value: function render() {
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
    }], [{
        key: 'childContextTypes',
        value: {
            messages: _propTypes2['default'].object,
            getMessage: _propTypes2['default'].func,
            isReadonly: _propTypes2['default'].func
        },
        enumerable: true
    }]);

    return CreateCellDialog;
})(_react2['default'].Component);

exports['default'] = CreateCellDialog = (0, _materialUiStyles.muiThemeable)()(CreateCellDialog);
exports['default'] = CreateCellDialog;
module.exports = exports['default'];

},{"./NodesPicker":5,"./SharedUsers":7,"material-ui":"material-ui","material-ui/styles":"material-ui/styles","prop-types":"prop-types","pydio":"pydio","pydio/model/cell":"pydio/model/cell","react":"react"}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _SharedUsers = require('./SharedUsers');

var _SharedUsers2 = _interopRequireDefault(_SharedUsers);

var _NodesPicker = require('./NodesPicker');

var _NodesPicker2 = _interopRequireDefault(_NodesPicker);

var _mainGenericEditor = require('../main/GenericEditor');

var _mainGenericEditor2 = _interopRequireDefault(_mainGenericEditor);

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

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

var _default = (function (_React$Component) {
    _inherits(_default, _React$Component);

    function _default() {
        var _this = this;

        _classCallCheck(this, _default);

        _get(Object.getPrototypeOf(_default.prototype), 'constructor', this).apply(this, arguments);

        this.submit = function () {
            var _props = _this.props;
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
        };
    }

    _createClass(_default, [{
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
                isReadonly: function isReadonly() {
                    return false;
                }
            };
        }
    }, {
        key: 'render',
        value: function render() {
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
    }], [{
        key: 'childContextTypes',
        value: {
            messages: _propTypes2['default'].object,
            getMessage: _propTypes2['default'].func,
            isReadonly: _propTypes2['default'].func
        },
        enumerable: true
    }]);

    return _default;
})(React.Component);

exports['default'] = _default;
module.exports = exports['default'];

},{"../main/GenericEditor":27,"./NodesPicker":5,"./SharedUsers":7,"prop-types":"prop-types","pydio":"pydio","react":"react"}],5:[function(require,module,exports){
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
                leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-" + (node.Type === 'LEAF' ? 'file' : 'folder') }),
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

var _materialUi = require('material-ui');

var _UserBadge = require('./UserBadge');

var _UserBadge2 = _interopRequireDefault(_UserBadge);

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var PropTypes = require('prop-types');
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
var React = require('react');

var SharedUserEntry = (function (_React$Component) {
    _inherits(SharedUserEntry, _React$Component);

    function SharedUserEntry() {
        var _this = this;

        _classCallCheck(this, SharedUserEntry);

        _get(Object.getPrototypeOf(SharedUserEntry.prototype), 'constructor', this).apply(this, arguments);

        this.onRemove = function () {
            _this.props.onUserObjectRemove(_this.props.cellAcl.RoleId);
        };

        this.onInvite = function () {
            var targets = {};
            var userObject = PydioUsers.User.fromIdmUser(_this.props.cellAcl.User);
            targets[userObject.getId()] = userObject;
            _this.props.sendInvitations(targets);
        };

        this.onUpdateRight = function (name, checked) {
            _this.props.onUserObjectUpdateRight(_this.props.cellAcl.RoleId, name, checked);
        };
    }

    _createClass(SharedUserEntry, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props;
            var cellAcl = _props.cellAcl;
            var pydio = _props.pydio;

            var menuItems = [];
            var type = cellAcl.User ? 'user' : cellAcl.Group ? 'group' : 'team';

            // Do not render current user
            if (cellAcl.User && cellAcl.User.Login === pydio.user.id) {
                return null;
            }

            if (type !== 'group') {
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
                    if (cellAcl.Group.Attributes) {
                        label = cellAcl.Group.Attributes["displayName"] || cellAcl.Group.GroupLabel;
                    } else {
                        label = cellAcl.Group.Uuid;
                    }
                    break;
                case "team":
                    if (cellAcl.Role) {
                        label = cellAcl.Role.Label;
                    } else {
                        label = "No role found";
                    }
                    break;
                default:
                    label = cellAcl.RoleId;
                    break;
            }
            var read = false,
                write = false;
            cellAcl.Actions.map(function (action) {
                if (action.Name === 'read') {
                    read = true;
                }
                if (action.Name === 'write') {
                    write = true;
                }
            });
            var disabled = this.props.isReadonly() || this.props.readonly;
            var style = {
                display: 'flex',
                width: 70
            };
            if (!menuItems.length) {
                style = _extends({}, style, { marginRight: 48 });
            }

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
                    { style: style },
                    React.createElement(_materialUi.Checkbox, { disabled: disabled, checked: read, onCheck: function (e, v) {
                            _this2.onUpdateRight('read', v);
                        } }),
                    React.createElement(_materialUi.Checkbox, { disabled: disabled, checked: write, onCheck: function (e, v) {
                            _this2.onUpdateRight('write', v);
                        } })
                )
            );
        }
    }], [{
        key: 'propTypes',
        value: {
            cellAcl: PropTypes.object.isRequired,
            sendInvitations: PropTypes.func,
            onUserObjectRemove: PropTypes.func.isRequired,
            onUserObjectUpdateRight: PropTypes.func.isRequired
        },
        enumerable: true
    }]);

    return SharedUserEntry;
})(React.Component);

exports['default'] = SharedUserEntry = (0, _ShareContextConsumer2['default'])(SharedUserEntry);
exports['default'] = SharedUserEntry;
module.exports = exports['default'];

},{"../ShareContextConsumer":1,"./UserBadge":8,"material-ui":"material-ui","prop-types":"prop-types","react":"react"}],7:[function(require,module,exports){
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

var _SharedUserEntry = require('./SharedUserEntry');

var _SharedUserEntry2 = _interopRequireDefault(_SharedUserEntry);

var _mainActionButton = require('../main/ActionButton');

var _mainActionButton2 = _interopRequireDefault(_mainActionButton);

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var UsersCompleter = _Pydio$requireLib.UsersCompleter;

var SharedUsers = (function (_React$Component) {
    _inherits(SharedUsers, _React$Component);

    function SharedUsers() {
        var _this = this;

        _classCallCheck(this, SharedUsers);

        _get(Object.getPrototypeOf(SharedUsers.prototype), 'constructor', this).apply(this, arguments);

        this.sendInvitationToAllUsers = function () {
            var _props = _this.props;
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
            _this.props.sendInvitations(userObjects);
        };

        this.clearAllUsers = function () {
            Object.keys(_this.props.cellAcls).map(function (k) {
                _this.props.onUserObjectRemove(k);
            });
        };

        this.valueSelected = function (userObject) {
            if (userObject.IdmUser) {
                _this.props.onUserObjectAdd(userObject.IdmUser);
            } else {
                _this.props.onUserObjectAdd(userObject.IdmRole);
            }
        };
    }

    _createClass(SharedUsers, [{
        key: 'render',
        value: function render() {
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
    }], [{
        key: 'propTypes',
        value: {
            pydio: _propTypes2['default'].instanceOf(_pydio2['default']),

            cellAcls: _propTypes2['default'].object,

            saveSelectionAsTeam: _propTypes2['default'].func,
            sendInvitations: _propTypes2['default'].func,
            showTitle: _propTypes2['default'].bool,

            onUserObjectAdd: _propTypes2['default'].func.isRequired,
            onUserObjectRemove: _propTypes2['default'].func.isRequired,
            onUserObjectUpdateRight: _propTypes2['default'].func.isRequired

        },
        enumerable: true
    }]);

    return SharedUsers;
})(_react2['default'].Component);

exports['default'] = SharedUsers = (0, _ShareContextConsumer2['default'])(SharedUsers);
exports['default'] = SharedUsers;
module.exports = exports['default'];

},{"../ShareContextConsumer":1,"../main/ActionButton":26,"./SharedUserEntry":6,"prop-types":"prop-types","pydio":"pydio","react":"react"}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PropTypes = require('prop-types');
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

var _require = require('react');

var Component = _require.Component;

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
                    iconButtonElement: React.createElement(IconButton, { style: { padding: 16 }, iconStyle: iconStyle, iconClassName: 'mdi mdi-dots-vertical' }),
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
            if (this.props.type === 'group') {
                avatarColor = Color(avatarColor).darken(.2).toString();
                avatar = React.createElement('span', { className: 'avatar mdi mdi-account-multiple', style: { backgroundColor: avatarColor } });
            } else if (this.props.type === 'team') {
                avatarColor = Color(avatarColor).darken(.2).toString();
                avatar = React.createElement('span', { className: 'avatar mdi mdi-account-multiple-outline', style: { backgroundColor: avatarColor } });
            } else if (this.props.type === 'temporary') {
                avatarColor = Color(avatarColor).lighten(.2).toString();
                avatar = React.createElement('span', { className: 'avatar mdi mdi-account-plus', style: { backgroundColor: avatarColor } });
            } else if (this.props.type === 'remote_user') {
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

},{"color":"color","material-ui":"material-ui","material-ui/styles":"material-ui/styles","prop-types":"prop-types","react":"react"}],9:[function(require,module,exports){
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

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _CompositeModel = require('./CompositeModel');

var _CompositeModel2 = _interopRequireDefault(_CompositeModel);

var _mainShareHelper = require('../main/ShareHelper');

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var _cellsSharedUsers = require('../cells/SharedUsers');

var _cellsSharedUsers2 = _interopRequireDefault(_cellsSharedUsers);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

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
                    items.push(_react2['default'].createElement(_materialUi.MenuItem, { primaryText: repository.getLabel(), onTouchTap: touchTap, leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: "icomoon-cells" }) }));
                }
            });
            return items;
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps, nextContext) {
            var edit = this.state.edit;
            var compositeModel = nextProps.compositeModel;

            if (edit === 'NEWCELL' && !compositeModel.isDirty()) {
                this.setState({ edit: null });
                compositeModel.getCells().map(function (cellModel) {
                    var acls = cellModel.getAcls();
                    if (!Object.keys(acls).length) {
                        compositeModel.removeNewCell(cellModel);
                    }
                });
            }
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
                        ref: "addCellButton",
                        style: { marginLeft: 10 },
                        primary: true,
                        label: m(263),
                        onTouchTap: function (event) {
                            _this2.setState({ addMenuOpen: true, addMenuAnchor: _reactDom2['default'].findDOMNode(_this2.refs['addCellButton']) });
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

            var auth = _mainShareHelper2['default'].getAuthorizations();
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
                    _react2['default'].createElement(_materialUi.RaisedButton, { label: m(264), disabled: edit === 'NEWCELL', primary: true, onTouchTap: function () {
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
    pydio: _propTypes2['default'].instanceOf(_pydio2['default']),
    compositeModel: _propTypes2['default'].instanceOf(_CompositeModel2['default']).isRequired,
    usersInvitations: _propTypes2['default'].func
};

exports['default'] = CellsList = (0, _materialUiStyles.muiThemeable)()(CellsList);

exports['default'] = CellsList;
module.exports = exports['default'];

},{"../cells/SharedUsers":7,"../main/ShareHelper":29,"./CompositeModel":12,"material-ui":"material-ui","material-ui/styles":"material-ui/styles","prop-types":"prop-types","pydio":"pydio","react":"react","react-dom":"react-dom"}],10:[function(require,module,exports){
(function (global){
/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _Pydio$requireLib3 = _pydio2['default'].requireLib('components');

var GenericCard = _Pydio$requireLib3.GenericCard;
var GenericLine = _Pydio$requireLib3.GenericLine;

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
        key: 'confirmAndDismiss',
        value: function confirmAndDismiss() {
            var model = this.state.model;
            var _props = this.props;
            var pydio = _props.pydio;
            var onDismiss = _props.onDismiss;

            if (!model.isDirty() || confirm(pydio.MessageHash['share_center.dialog.close.confirm.unsaved'])) {
                onDismiss();
            }
        }
    }, {
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
                        return _mainShareHelper2['default'].buildPublicUrl(pydio, linkModel.getLink());
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

            var _props2 = this.props;
            var node = _props2.node;
            var mode = _props2.mode;

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

            var _props3 = this.props;
            var node = _props3.node;
            var mode = _props3.mode;
            var pydio = _props3.pydio;
            var editorOneColumn = _props3.editorOneColumn;
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
                    onCloseAction: function () {
                        return _this4.confirmAndDismiss();
                    },
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
                        lines.push(_react2['default'].createElement(GenericLine, { iconClassName: 'mdi mdi-account-multiple', legend: m(254), data: cells.join(', ') }));
                    }
                    var links = model.getLinks();
                    if (links.length) {
                        var ln = links[0];
                        if (ln.hasError()) {
                            var err = ln.hasError();
                            lines.push(_react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-alert-outline", legend: "Error", data: err.Detail || err.Msg || err }));
                        } else if (ln.getLink()) {
                            var publicLink = _mainShareHelper2['default'].buildPublicUrl(pydio, ln.getLink(), mode === 'infoPanel');
                            lines.push(_react2['default'].createElement(GenericLine, { iconClassName: 'mdi mdi-link', legend: m(121), style: { overflow: 'visible' }, dataStyle: { overflow: 'visible' }, data: _react2['default'].createElement(
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
                            GenericCard,
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

},{"../composite/CompositeModel":12,"../links/LabelPanel":17,"../links/Panel":19,"../links/PublicLinkTemplate":21,"../links/SecureOptions":22,"../links/VisibilityPanel":24,"../main/GenericEditor":27,"../main/ShareHelper":29,"./CellsList":9,"./Mailer":13,"clipboard":"clipboard","material-ui":"material-ui","pydio":"pydio","react":"react"}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _CompositeCard = require('./CompositeCard');

var _CompositeCard2 = _interopRequireDefault(_CompositeCard);

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var React = require('react');
var createReactClass = require('create-react-class');

var _require$requireLib = require('pydio').requireLib('boot');

var ActionDialogMixin = _require$requireLib.ActionDialogMixin;

var CompositeDialog = createReactClass({
    displayName: 'CompositeDialog',
    mixins: [ActionDialogMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: '',
            dialogIsModal: true,
            dialogPadding: false,
            dialogSize: 'lg'
        };
    },

    propTypes: {
        pydio: _propTypes2['default'].instanceOf(_pydio2['default']).isRequired,
        selection: _propTypes2['default'].instanceOf(_pydioModelDataModel2['default']),
        readonly: _propTypes2['default'].bool
    },

    childContextTypes: {
        messages: _propTypes2['default'].object,
        getMessage: _propTypes2['default'].func,
        isReadonly: _propTypes2['default'].func
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

},{"./CompositeCard":10,"create-react-class":"create-react-class","prop-types":"prop-types","pydio":"pydio","pydio/model/data-model":"pydio/model/data-model","react":"react"}],12:[function(require,module,exports){
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

var _cellsSdk = require('cells-sdk');

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
            var treeNode = new _cellsSdk.TreeNode();
            var auth = _mainShareHelper2['default'].getAuthorizations();
            treeNode.Uuid = node.getMetadata().get('uuid');
            link.getLink().Label = node.getLabel();
            link.getLink().Description = pydio.MessageHash['share_center.257'].replace('%s', moment(new Date()).format("YYYY/MM/DD"));
            link.getLink().RootNodes.push(treeNode);
            // Template / Permissions from node
            var defaultTemplate = undefined;
            var defaultPermissions = [_cellsSdk.RestShareLinkAccessType.constructFromObject('Download')];
            if (node.isLeaf()) {
                defaultTemplate = "pydio_unique_dl";

                var _ShareHelper$nodeHasEditor = _mainShareHelper2['default'].nodeHasEditor(pydio, node);

                var preview = _ShareHelper$nodeHasEditor.preview;

                if (preview && !auth.max_downloads) {
                    defaultTemplate = "pydio_unique_strip";
                    defaultPermissions.push(_cellsSdk.RestShareLinkAccessType.constructFromObject('Preview'));
                } else if (auth.max_downloads > 0) {
                    // If DL only and auth has default max download, set it
                    link.getLink().MaxDownloads = auth.max_downloads;
                }
            } else {
                defaultTemplate = "pydio_shared_folder";
                defaultPermissions.push(_cellsSdk.RestShareLinkAccessType.constructFromObject('Preview'));
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
            _pydio2['default'].getInstance().getContextHolder().requireNodeReload(this.node);
        }
    }, {
        key: 'deleteLink',
        value: function deleteLink(linkModel) {
            var _this4 = this;

            return linkModel.deleteLink(this.emptyLink(this.node).getLink()).then(function (res) {
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

},{"../links/LinkModel":18,"../main/ShareHelper":29,"cells-sdk":"cells-sdk","pydio":"pydio","pydio/lang/observable":"pydio/lang/observable","pydio/model/cell":"pydio/model/cell"}],13:[function(require,module,exports){
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

var _cellsSdk = require('cells-sdk');

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
                linkObject.TargetUsers[k] = _cellsSdk.RestShareLinkTargetUser.constructFromObject({ Display: users[u].getLabel(), DownloadCount: 0 });
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

},{"../main/ShareHelper":29,"cells-sdk":"cells-sdk","material-ui":"material-ui","pydio/http/resources-manager":"pydio/http/resources-manager","react":"react"}],14:[function(require,module,exports){
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

},{"../composite/CompositeModel":12,"../links/LabelPanel":17,"../links/Panel":19,"../links/PublicLinkTemplate":21,"../links/SecureOptions":22,"../links/VisibilityPanel":24,"../main/GenericEditor":27,"../main/ShareHelper":29,"./Mailer":13,"material-ui":"material-ui","pydio":"pydio","react":"react"}],15:[function(require,module,exports){
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

},{"./cells/CellCard":2,"./cells/CreateCellDialog":3,"./cells/EditCellDialog":4,"./composite/CompositeDialog":11,"./composite/SimpleLinkCard":14,"./links/LinkModel":18,"./lists/ShareView":25,"./main/InfoPanel":28,"./main/ShareHelper":29}],16:[function(require,module,exports){
(function (global){
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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _LinkModel = require('./LinkModel');

var _LinkModel2 = _interopRequireDefault(_LinkModel);

var _Pydio$requireLib = _pydio2['default'].requireLib("boot");

var Tooltip = _Pydio$requireLib.Tooltip;

var PublicLinkField = (function (_React$Component) {
    _inherits(PublicLinkField, _React$Component);

    function PublicLinkField() {
        var _this = this;

        _classCallCheck(this, PublicLinkField);

        _get(Object.getPrototypeOf(PublicLinkField.prototype), 'constructor', this).apply(this, arguments);

        this.state = { editLink: false, copyMessage: '', showQRCode: false };

        this.toggleEditMode = function () {
            var _props = _this.props;
            var linkModel = _props.linkModel;
            var pydio = _props.pydio;

            if (_this.state.editLink && _this.state.customLink) {
                var auth = _mainShareHelper2['default'].getAuthorizations();
                if (auth.hash_min_length && _this.state.customLink.length < auth.hash_min_length) {
                    pydio.UI.displayMessage('ERROR', _this.props.getMessage('223').replace('%s', auth.hash_min_length));
                    return;
                }
                linkModel.setCustomLink(_this.state.customLink);
                linkModel.save();
            }
            _this.setState({ editLink: !_this.state.editLink, customLink: undefined });
        };

        this.changeLink = function (event) {
            var value = event.target.value;
            value = _pydioUtilLang2['default'].computeStringSlug(value);
            _this.setState({ customLink: value });
        };

        this.clearCopyMessage = function () {
            global.setTimeout((function () {
                this.setState({ copyMessage: '' });
            }).bind(_this), 5000);
        };

        this.attachClipboard = function () {
            var _props2 = _this.props;
            var linkModel = _props2.linkModel;
            var pydio = _props2.pydio;

            _this.detachClipboard();
            if (_this.refs['copy-button']) {
                _this._clip = new _clipboard2['default'](_this.refs['copy-button'], {
                    text: (function (trigger) {
                        return _mainShareHelper2['default'].buildPublicUrl(pydio, linkModel.getLink());
                    }).bind(_this)
                });
                _this._clip.on('success', (function () {
                    this.setState({ copyMessage: this.props.getMessage('192') }, this.clearCopyMessage);
                }).bind(_this));
                _this._clip.on('error', (function () {
                    var copyMessage = undefined;
                    if (global.navigator.platform.indexOf("Mac") === 0) {
                        copyMessage = this.props.getMessage('144');
                    } else {
                        copyMessage = this.props.getMessage('143');
                    }
                    this.refs['public-link-field'].focus();
                    this.setState({ copyMessage: copyMessage }, this.clearCopyMessage);
                }).bind(_this));
            }
        };

        this.detachClipboard = function () {
            if (_this._clip) {
                _this._clip.destroy();
            }
        };

        this.openMailer = function () {
            _this.props.showMailer(_this.props.linkModel);
        };

        this.toggleQRCode = function () {
            _this.setState({ showQRCode: !_this.state.showQRCode });
        };
    }

    _createClass(PublicLinkField, [{
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            this.attachClipboard();
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.attachClipboard();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.detachClipboard();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props3 = this.props;
            var linkModel = _props3.linkModel;
            var pydio = _props3.pydio;

            var publicLink = _mainShareHelper2['default'].buildPublicUrl(pydio, linkModel.getLink());
            var auth = _mainShareHelper2['default'].getAuthorizations();
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
                            _this2.setState({ linkTooltip: true });
                        },
                        onMouseOut: function () {
                            _this2.setState({ linkTooltip: false });
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
    }], [{
        key: 'propTypes',
        value: {
            linkModel: _propTypes2['default'].instanceOf(_LinkModel2['default']),
            editAllowed: _propTypes2['default'].bool,
            onChange: _propTypes2['default'].func,
            showMailer: _propTypes2['default'].func
        },
        enumerable: true
    }]);

    return PublicLinkField;
})(_react2['default'].Component);

exports['default'] = PublicLinkField = (0, _materialUiStyles.muiThemeable)()(PublicLinkField);
exports['default'] = PublicLinkField = (0, _ShareContextConsumer2['default'])(PublicLinkField);
exports['default'] = PublicLinkField;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../ShareContextConsumer":1,"../main/ActionButton":26,"../main/ShareHelper":29,"./LinkModel":18,"./TargetedUsers":23,"clipboard":"clipboard","material-ui":"material-ui","material-ui/styles":"material-ui/styles","prop-types":"prop-types","pydio":"pydio","pydio/util/lang":"pydio/util/lang","pydio/util/path":"pydio/util/path","qrcode.react":"qrcode.react","react":"react"}],17:[function(require,module,exports){
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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

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

    pydio: _propTypes2['default'].instanceOf(_pydio2['default']),
    linkModel: _propTypes2['default'].instanceOf(_LinkModel2['default'])

};

exports['default'] = LabelPanel;
module.exports = exports['default'];

},{"./LinkModel":18,"prop-types":"prop-types","pydio":"pydio","react":"react"}],18:[function(require,module,exports){
/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioLangObservable = require('pydio/lang/observable');

var _pydioLangObservable2 = _interopRequireDefault(_pydioLangObservable);

var _mainShareHelper = require('../main/ShareHelper');

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var _cellsSdk = require('cells-sdk');

var _pydioUtilPass = require('pydio/util/pass');

var _pydioUtilPass2 = _interopRequireDefault(_pydioUtilPass);

var LinkModel = (function (_Observable) {
    _inherits(LinkModel, _Observable);

    function LinkModel() {
        _classCallCheck(this, LinkModel);

        _get(Object.getPrototypeOf(LinkModel.prototype), 'constructor', this).call(this);
        this.link = new _cellsSdk.RestShareLink();
        this.link.Permissions = [_cellsSdk.RestShareLinkAccessType.constructFromObject("Preview"), _cellsSdk.RestShareLinkAccessType.constructFromObject("Download")];
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
            return _mainShareHelper2['default'].buildPublicUrl(_pydio2['default'].getInstance(), this.link);
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

            var api = new _cellsSdk.ShareServiceApi(_pydioHttpApi2['default'].getRestClient());
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
            var api = new _cellsSdk.ShareServiceApi(_pydioHttpApi2['default'].getRestClient());
            var request = new _cellsSdk.RestPutShareLinkRequest();
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
            var authz = _mainShareHelper2['default'].getAuthorizations();
            if (authz.password_mandatory && !request.PasswordEnabled) {
                throw new Error(_pydio2['default'].getMessages()['share_center.175']);
            }
            if (parseInt(authz.max_downloads) > 0 && !parseInt(this.link.MaxDownloads)) {
                this.link.MaxDownloads = "" + parseInt(authz.max_downloads);
                this.notify('update');
            }
            if (parseInt(authz.max_expiration) > 0 && !parseInt(this.link.AccessEnd)) {
                this.link.AccessEnd = "" + (Math.round(new Date() / 1000) + parseInt(authz.max_expiration) * 60 * 60 * 24);
                this.notify('update');
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
                _pydio2['default'].getInstance().UI.displayMessage('ERROR', msg);
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

            var api = new _cellsSdk.ShareServiceApi(_pydioHttpApi2['default'].getRestClient());
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
            return _cellsSdk.RestShareLink.constructFromObject(JSON.parse(JSON.stringify(link)));
        }
    }]);

    return LinkModel;
})(_pydioLangObservable2['default']);

exports['default'] = LinkModel;
module.exports = exports['default'];

},{"../main/ShareHelper":29,"cells-sdk":"cells-sdk","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/lang/observable":"pydio/lang/observable","pydio/util/pass":"pydio/util/pass"}],19:[function(require,module,exports){
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

/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _mainShareHelper = require('../main/ShareHelper');

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var _Pydio$requireLib = _pydio2['default'].requireLib('form');

var ValidPassword = _Pydio$requireLib.ValidPassword;

var PublicLinkPanel = (function (_React$Component) {
    _inherits(PublicLinkPanel, _React$Component);

    function PublicLinkPanel() {
        var _this = this;

        _classCallCheck(this, PublicLinkPanel);

        _get(Object.getPrototypeOf(PublicLinkPanel.prototype), 'constructor', this).apply(this, arguments);

        this.state = { showTemporaryPassword: false, temporaryPassword: null, saving: false };

        this.toggleLink = function () {
            var _props = _this.props;
            var linkModel = _props.linkModel;
            var pydio = _props.pydio;
            var showTemporaryPassword = _this.state.showTemporaryPassword;

            if (showTemporaryPassword) {
                _this.setState({ showTemporaryPassword: false, temporaryPassword: null });
            } else if (!linkModel.getLinkUuid() && _mainShareHelper2['default'].getAuthorizations().password_mandatory) {
                _this.setState({ showTemporaryPassword: true, temporaryPassword: '' });
            } else {
                _this.setState({ saving: true });
                if (linkModel.getLinkUuid()) {
                    _this.props.compositeModel.deleteLink(linkModel)['catch'](function () {
                        _this.setState({ saving: false });
                    }).then(function () {
                        _this.setState({ saving: false });
                    });
                } else {
                    linkModel.save()['catch'](function () {
                        _this.setState({ saving: false });
                    }).then(function () {
                        _this.setState({ saving: false });
                    });
                }
            }
        };

        this.updateTemporaryPassword = function (value, event) {
            if (value === undefined) {
                value = event.currentTarget.getValue();
            }
            _this.setState({ temporaryPassword: value });
        };

        this.enableLinkWithPassword = function () {
            var linkModel = _this.props.linkModel;

            if (!_this.refs['valid-pass'].isValid()) {
                _this.props.pydio.UI.displayMessage('ERROR', 'Invalid Password');
                return;
            }
            linkModel.setCreatePassword(_this.state.temporaryPassword);
            try {
                linkModel.save();
            } catch (e) {
                _this.props.pydio.UI.displayMessage('ERROR', e.message);
            }
            _this.setState({ showTemporaryPassword: false, temporaryPassword: null });
        };
    }

    _createClass(PublicLinkPanel, [{
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var linkModel = _props2.linkModel;
            var pydio = _props2.pydio;
            var compositeModel = _props2.compositeModel;
            var _state = this.state;
            var showTemporaryPassword = _state.showTemporaryPassword;
            var temporaryPassword = _state.temporaryPassword;
            var saving = _state.saving;

            var authorizations = _mainShareHelper2['default'].getAuthorizations();
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
            } else if (showTemporaryPassword) {
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
                            value: temporaryPassword,
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
                        disabled: this.props.isReadonly() || saving || !linkModel.isEditable() || !linkModel.getLinkUuid() && !canEnable,
                        onToggle: this.toggleLink,
                        toggled: linkModel.getLinkUuid() || showTemporaryPassword,
                        label: this.props.getMessage('189')
                    })
                ),
                saving && _react2['default'].createElement(
                    'div',
                    { style: { width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                    _react2['default'].createElement(_materialUi.CircularProgress, null)
                ),
                !saving && _react2['default'].createElement(
                    'div',
                    { style: { padding: 20 } },
                    publicLinkField
                ),
                !saving && publicLinkPanes
            );
        }
    }], [{
        key: 'propTypes',
        value: {
            linkModel: _propTypes2['default'].instanceOf(_LinkModel2['default']),
            compositeModel: _propTypes2['default'].instanceOf(_compositeCompositeModel2['default']),
            pydio: _propTypes2['default'].instanceOf(_pydio2['default']),
            authorizations: _propTypes2['default'].object,
            showMailer: _propTypes2['default'].func
        },
        enumerable: true
    }]);

    return PublicLinkPanel;
})(_react2['default'].Component);

exports['default'] = PublicLinkPanel = (0, _ShareContextConsumer2['default'])(PublicLinkPanel);
exports['default'] = PublicLinkPanel;
module.exports = exports['default'];

},{"../ShareContextConsumer":1,"../composite/CompositeModel":12,"../main/ShareHelper":29,"./Field":16,"./LinkModel":18,"./Permissions":20,"./TargetedUsers":23,"material-ui":"material-ui","prop-types":"prop-types","pydio":"pydio","react":"react"}],20:[function(require,module,exports){
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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var _materialUi = require('material-ui');

var _LinkModel = require('./LinkModel');

var _LinkModel2 = _interopRequireDefault(_LinkModel);

var _mainShareHelper = require('../main/ShareHelper');

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var _cellsSdk = require('cells-sdk');

var PublicLinkPermissions = (function (_React$Component) {
    _inherits(PublicLinkPermissions, _React$Component);

    function PublicLinkPermissions() {
        var _this = this;

        _classCallCheck(this, PublicLinkPermissions);

        _get(Object.getPrototypeOf(PublicLinkPermissions.prototype), 'constructor', this).apply(this, arguments);

        this.changePermission = function (event) {
            var name = event.target.name;
            var checked = event.target.checked;
            var _props = _this.props;
            var compositeModel = _props.compositeModel;
            var linkModel = _props.linkModel;

            var link = linkModel.getLink();
            if (checked) {
                link.Permissions.push(_cellsSdk.RestShareLinkAccessType.constructFromObject(name));
            } else {
                link.Permissions = link.Permissions.filter(function (perm) {
                    return perm !== name;
                });
            }
            if (compositeModel.getNode().isLeaf()) {
                var auth = _mainShareHelper2['default'].getAuthorizations();
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
            _this.props.linkModel.updateLink(link);
        };
    }

    _createClass(PublicLinkPermissions, [{
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var linkModel = _props2.linkModel;
            var compositeModel = _props2.compositeModel;
            var pydio = _props2.pydio;

            var node = compositeModel.getNode();
            var perms = [],
                previewWarning = undefined;
            var auth = _mainShareHelper2['default'].getAuthorizations();

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
    }], [{
        key: 'propTypes',
        value: {
            linkModel: _propTypes2['default'].instanceOf(_LinkModel2['default']),
            style: _propTypes2['default'].object
        },
        enumerable: true
    }]);

    return PublicLinkPermissions;
})(_react2['default'].Component);

exports['default'] = PublicLinkPermissions = (0, _ShareContextConsumer2['default'])(PublicLinkPermissions);
exports['default'] = PublicLinkPermissions;
module.exports = exports['default'];

},{"../ShareContextConsumer":1,"../main/ShareHelper":29,"./LinkModel":18,"cells-sdk":"cells-sdk","material-ui":"material-ui","prop-types":"prop-types","pydio":"pydio","react":"react"}],21:[function(require,module,exports){
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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

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
    linkModel: _propTypes2['default'].instanceOf(_LinkModel2['default'])
};
PublicLinkTemplate = (0, _ShareContextConsumer2['default'])(PublicLinkTemplate);
exports['default'] = PublicLinkTemplate;
module.exports = exports['default'];

},{"../ShareContextConsumer":1,"./LinkModel":18,"material-ui":"material-ui","prop-types":"prop-types","pydio":"pydio","react":"react"}],22:[function(require,module,exports){
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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

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

var PublicLinkSecureOptions = (function (_React$Component) {
    _inherits(PublicLinkSecureOptions, _React$Component);

    function PublicLinkSecureOptions() {
        var _this = this;

        _classCallCheck(this, PublicLinkSecureOptions);

        _get(Object.getPrototypeOf(PublicLinkSecureOptions.prototype), 'constructor', this).apply(this, arguments);

        this.state = {};

        this.updateDLExpirationField = function (event) {
            var newValue = event.currentTarget.value;
            if (parseInt(newValue) < 0) {
                newValue = -parseInt(newValue);
            }
            var linkModel = _this.props.linkModel;

            var link = linkModel.getLink();
            link.MaxDownloads = newValue;
            linkModel.updateLink(link);
        };

        this.updateDaysExpirationField = function (event, newValue) {
            if (!newValue) {
                newValue = event.currentTarget.getValue();
            }
            var linkModel = _this.props.linkModel;

            var link = linkModel.getLink();
            link.AccessEnd = newValue;
            linkModel.updateLink(link);
        };

        this.onDateChange = function (event, value) {
            var date2 = Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
            _this.updateDaysExpirationField(event, Math.floor(date2 / 1000) + "");
        };

        this.resetPassword = function () {
            var linkModel = _this.props.linkModel;

            linkModel.setUpdatePassword('');
            linkModel.getLink().PasswordRequired = false;
            linkModel.notifyDirty();
        };

        this.setUpdatingPassword = function (newValue) {
            _pydioUtilPass2['default'].checkPasswordStrength(newValue, function (ok, msg) {
                _this.setState({ updatingPassword: newValue, updatingPasswordValid: ok });
            });
        };

        this.changePassword = function () {
            var linkModel = _this.props.linkModel;
            var updatingPassword = _this.state.updatingPassword;

            linkModel.setUpdatePassword(updatingPassword);
            _this.setState({ pwPop: false, updatingPassword: "", updatingPasswordValid: false });
            linkModel.notifyDirty();
        };

        this.updatePassword = function (newValue, oldValue) {
            var linkModel = _this.props.linkModel;

            var valid = _this.refs.pwd.isValid();
            if (valid) {
                _this.setState({ invalidPassword: null, invalid: false }, function () {
                    linkModel.setUpdatePassword(newValue);
                });
            } else {
                _this.setState({ invalidPassword: newValue, invalid: true });
            }
        };

        this.resetDownloads = function () {
            if (window.confirm(_this.props.getMessage('106'))) {
                var linkModel = _this.props.linkModel;

                linkModel.getLink().CurrentDownloads = "0";
                linkModel.notifyDirty();
            }
        };

        this.resetExpiration = function () {
            var linkModel = _this.props.linkModel;

            linkModel.getLink().AccessEnd = "0";
            linkModel.notifyDirty();
        };

        this.renderPasswordContainer = function () {
            var linkModel = _this.props.linkModel;

            var link = linkModel.getLink();
            var auth = _mainShareHelper2['default'].getAuthorizations();
            var passwordField = undefined,
                resetPassword = undefined,
                updatePassword = undefined;
            if (link.PasswordRequired) {
                resetPassword = _react2['default'].createElement(_materialUi.FlatButton, {
                    disabled: _this.props.isReadonly() || !linkModel.isEditable() || auth.password_mandatory,
                    secondary: true,
                    onTouchTap: _this.resetPassword,
                    label: _this.props.getMessage('174')
                });
                updatePassword = _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_materialUi.FlatButton, {
                        disabled: _this.props.isReadonly() || !linkModel.isEditable(),
                        secondary: true,
                        onTouchTap: function (e) {
                            _this.setState({ pwPop: true, pwAnchor: e.currentTarget });
                        },
                        label: _this.props.getMessage('181')
                    }),
                    _react2['default'].createElement(
                        _materialUi.Popover,
                        {
                            open: _this.state.pwPop,
                            anchorEl: _this.state.pwAnchor,
                            anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
                            targetOrigin: { horizontal: 'right', vertical: 'top' },
                            onRequestClose: function () {
                                _this.setState({ pwPop: false });
                            }
                        },
                        _react2['default'].createElement(
                            'div',
                            { style: { width: 280, padding: 8 } },
                            _react2['default'].createElement(ValidPassword, {
                                name: "update",
                                ref: "pwdUpdate",
                                attributes: { label: _this.props.getMessage('23') },
                                value: _this.state.updatingPassword ? _this.state.updatingPassword : "",
                                onChange: function (v) {
                                    _this.setUpdatingPassword(v);
                                }
                            }),
                            _react2['default'].createElement(
                                'div',
                                { style: { paddingTop: 20, textAlign: 'right' } },
                                _react2['default'].createElement(_materialUi.FlatButton, { label: _pydio2['default'].getMessages()['54'], onTouchTap: function () {
                                        _this.setState({ pwPop: false, updatingPassword: '' });
                                    } }),
                                _react2['default'].createElement(_materialUi.FlatButton, { style: { minWidth: 60 }, label: _pydio2['default'].getMessages()['48'], onTouchTap: function () {
                                        _this.changePassword();
                                    }, disabled: !_this.state.updatingPassword || !_this.state.updatingPasswordValid })
                            )
                        )
                    )
                );
                passwordField = _react2['default'].createElement(ModernTextField, {
                    floatingLabelText: _this.props.getMessage('23'),
                    disabled: true,
                    value: '********',
                    fullWidth: true
                });
            } else if (!_this.props.isReadonly() && linkModel.isEditable()) {
                passwordField = _react2['default'].createElement(ValidPassword, {
                    name: 'share-password',
                    ref: "pwd",
                    attributes: { label: _this.props.getMessage('23') },
                    value: _this.state.invalidPassword ? _this.state.invalidPassword : linkModel.updatePassword,
                    onChange: _this.updatePassword
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
        };

        this.formatDate = function (dateObject) {
            var dateFormatDay = _this.props.getMessage('date_format', '').split(' ').shift();
            return dateFormatDay.replace('Y', dateObject.getFullYear()).replace('m', dateObject.getMonth() + 1).replace('d', dateObject.getDate());
        };
    }

    _createClass(PublicLinkSecureOptions, [{
        key: 'render',
        value: function render() {
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

            var auth = _mainShareHelper2['default'].getAuthorizations();
            if (parseInt(auth.max_expiration) > 0) {
                maxDate = new Date();
                maxDate.setDate(today.getDate() + parseInt(auth.max_expiration));
            }
            if (parseInt(auth.max_downloads) > 0) {
                dlLimitValue = Math.max(1, Math.min(dlLimitValue, parseInt(auth.max_downloads)));
            }

            if (expirationDateValue) {
                if (expirationDateValue < 0) {
                    dateExpired = true;
                }
                expDate = new Date(expirationDateValue * 1000);
                if (!parseInt(auth.max_expiration)) {
                    calIcon = _react2['default'].createElement(_materialUi.IconButton, { iconStyle: { color: globStyles.leftIcon.color }, style: { marginLeft: -8, marginRight: 8 }, iconClassName: 'mdi mdi-close-circle', onTouchTap: this.resetExpiration.bind(this) });
                }
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
    }], [{
        key: 'propTypes',
        value: {
            linkModel: _propTypes2['default'].instanceOf(_LinkModel2['default']).isRequired,
            style: _propTypes2['default'].object
        },
        enumerable: true
    }]);

    return PublicLinkSecureOptions;
})(_react2['default'].Component);

exports['default'] = PublicLinkSecureOptions = (0, _ShareContextConsumer2['default'])(PublicLinkSecureOptions);
exports['default'] = PublicLinkSecureOptions;
module.exports = exports['default'];

},{"../ShareContextConsumer":1,"../main/ShareHelper":29,"./LinkModel":18,"material-ui":"material-ui","prop-types":"prop-types","pydio":"pydio","pydio/util/pass":"pydio/util/pass","react":"react"}],23:[function(require,module,exports){
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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

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
    linkModel: _propTypes2['default'].instanceOf(_linksLinkModel2['default'])
};

exports['default'] = TargetedUsers = (0, _ShareContextConsumer2['default'])(TargetedUsers);
TargetedUserLink = (0, _ShareContextConsumer2['default'])(TargetedUserLink);

exports['default'] = TargetedUsers;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../ShareContextConsumer":1,"../links/LinkModel":18,"clipboard":"clipboard","material-ui":"material-ui","prop-types":"prop-types","react":"react","react-dom":"react-dom"}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpPolicies = require('pydio/http/policies');

var _pydioHttpPolicies2 = _interopRequireDefault(_pydioHttpPolicies);

var _cellsSdk = require('cells-sdk');

var _LinkModel = require('./LinkModel');

var _LinkModel2 = _interopRequireDefault(_LinkModel);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var ResourcePoliciesPanel = _Pydio$requireLib.ResourcePoliciesPanel;

var VisibilityPanel = (function (_React$Component) {
    _inherits(VisibilityPanel, _React$Component);

    function VisibilityPanel() {
        var _this = this;

        _classCallCheck(this, VisibilityPanel);

        _get(Object.getPrototypeOf(VisibilityPanel.prototype), 'constructor', this).apply(this, arguments);

        this.onSavePolicies = function (diffPolicies) {
            var _props = _this.props;
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
        };

        this.diffPolicies = function (policies, diffPolicies, resourceId) {
            var newPols = [];
            policies.map(function (p) {
                var key = p.Action + '///' + p.Subject;
                if (!diffPolicies.remove[key]) {
                    newPols.push(p);
                }
            });
            Object.keys(diffPolicies.add).map(function (k) {
                var newPol = new _cellsSdk.ServiceResourcePolicy();

                var _k$split = k.split('///');

                var _k$split2 = _slicedToArray(_k$split, 2);

                var action = _k$split2[0];
                var subject = _k$split2[1];

                newPol.Resource = resourceId;
                newPol.Effect = _cellsSdk.ServiceResourcePolicyPolicyEffect.constructFromObject('allow');
                newPol.Subject = subject;
                newPol.Action = action;
                newPols.push(newPol);
            });
            return newPols;
        };
    }

    _createClass(VisibilityPanel, [{
        key: 'render',
        value: function render() {
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
    }]);

    return VisibilityPanel;
})(_react2['default'].Component);

VisibilityPanel.PropTypes = {
    pydio: _propTypes2['default'].instanceOf(_pydio2['default']).isRequired,
    linkModel: _propTypes2['default'].instanceOf(_LinkModel2['default']).isRequired
};

VisibilityPanel = (0, _ShareContextConsumer2['default'])(VisibilityPanel);
exports['default'] = VisibilityPanel;
module.exports = exports['default'];

/**
 * Update associated hidden users policies, otherwise
 * the public link visibility cannot be changed
 * @param diffPolicies
 */

},{"../ShareContextConsumer":1,"./LinkModel":18,"cells-sdk":"cells-sdk","prop-types":"prop-types","pydio":"pydio","pydio/http/policies":"pydio/http/policies","react":"react"}],25:[function(require,module,exports){
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

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _cellsSdk = require('cells-sdk');

var _materialUi = require('material-ui');

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;
var Loader = _Pydio$requireLib.Loader;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('components');

var ModalAppBar = _Pydio$requireLib2.ModalAppBar;
var EmptyStateView = _Pydio$requireLib2.EmptyStateView;

var _Pydio$requireLib3 = _pydio2['default'].requireLib("hoc");

var ModernTextField = _Pydio$requireLib3.ModernTextField;

var _require = require('material-ui/styles');

var muiThemeable = _require.muiThemeable;

var Selector = (function (_React$Component) {
    _inherits(Selector, _React$Component);

    function Selector() {
        _classCallCheck(this, Selector);

        _get(Object.getPrototypeOf(Selector.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Selector, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var value = _props.value;
            var onChange = _props.onChange;
            var muiTheme = _props.muiTheme;
            var m = _props.m;
            var palette = muiTheme.palette;

            var tabStyle = {
                color: '#616161'
            };
            var activeStyle = {
                color: palette.accent1Color
            };
            var spanStyle = {
                marginRight: 5
            };
            return _react2['default'].createElement(
                _materialUi.Tabs,
                { style: { width: 360 }, onChange: function (v) {
                        onChange(null, 0, v);
                    }, value: value, tabItemContainerStyle: { background: 'transparent' } },
                _react2['default'].createElement(_materialUi.Tab, { label: _react2['default'].createElement(
                        'span',
                        null,
                        _react2['default'].createElement('span', { style: spanStyle, className: "mdi mdi-share-variant" }),
                        m(243)
                    ), value: "LINKS", buttonStyle: value === 'LINKS' ? activeStyle : tabStyle }),
                _react2['default'].createElement(_materialUi.Tab, { label: _react2['default'].createElement(
                        'span',
                        null,
                        _react2['default'].createElement('span', { style: spanStyle, className: "icomoon-cells" }),
                        m(254)
                    ), value: "CELLS", buttonStyle: value === 'CELLS' ? activeStyle : tabStyle })
            );
        }
    }]);

    return Selector;
})(_react2['default'].Component);

Selector = muiThemeable()(Selector);

var ShareView = (function (_React$Component2) {
    _inherits(ShareView, _React$Component2);

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

            this.setState({ filter: '' });
            var api = new _cellsSdk.ShareServiceApi(_pydioHttpApi2['default'].getRestClient());
            var request = new _cellsSdk.RestListSharedResourcesRequest();
            request.ShareType = _cellsSdk.ListSharedResourcesRequestListShareType.constructFromObject(this.state.shareType);
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
            var _state$filter = _state.filter;
            var filter = _state$filter === undefined ? '' : _state$filter;
            var _props2 = this.props;
            var pydio = _props2.pydio;
            var style = _props2.style;

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
                { style: _extends({}, style, { display: 'flex', flexDirection: 'column', overflow: 'hidden' }) },
                _react2['default'].createElement(
                    'div',
                    { style: { backgroundColor: '#F5F5F5', borderBottom: '1px solid #EEEEEE', display: 'flex', paddingRight: 16, paddingTop: 3 } },
                    _react2['default'].createElement(Selector, {
                        m: m,
                        value: this.state.shareType,
                        onChange: function (e, i, v) {
                            _this2.setState({ shareType: v }, function () {
                                _this2.load();
                            });
                        }
                    }),
                    _react2['default'].createElement('span', { style: { flex: 1 } }),
                    _react2['default'].createElement(
                        'div',
                        { style: { width: 150 } },
                        _react2['default'].createElement(ModernTextField, { hintText: m('sharelist.quick-filter'), value: filter, onChange: function (e, v) {
                                _this2.setState({ filter: v });
                            }, fullWidth: true })
                    )
                ),
                loading && _react2['default'].createElement(Loader, { style: { height: 400 } }),
                !loading && resources.length === 0 && _react2['default'].createElement(EmptyStateView, {
                    pydio: pydio,
                    iconClassName: "mdi mdi-share-variant",
                    primaryTextId: m(131),
                    style: { flex: 1, height: 400, padding: '90px 0', backgroundColor: 'transparent' }
                }),
                !loading && resources.length > 0 && _react2['default'].createElement(
                    _materialUi.List,
                    { style: { flex: 1, minHeight: 400, maxHeight: 400, overflowY: 'auto', paddingTop: 0 } },
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
                        if (res.Link && res.Link.Label && res.Link.Label !== basename) {
                            basename = res.Link.Label + ' (' + basename + ')';
                        }

                        return {
                            primaryText: basename,
                            secondaryText: res.Link ? m(251) + ': ' + res.Link.Description : m(284).replace('%s', res.Cells.length),
                            icon: icon,
                            appearsIn: appearsIn
                        };
                    }).filter(function (props) {
                        console.log(filter);
                        return !filter || props.primaryText.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
                    }).map(function (props) {
                        var appearsIn = props.appearsIn;
                        var icon = props.icon;

                        return _react2['default'].createElement(_materialUi.ListItem, {
                            primaryText: props.primaryText,
                            secondaryText: props.secondaryText,
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
    messages: _propTypes2['default'].object,
    getMessage: _propTypes2['default'].func,
    isReadonly: _propTypes2['default'].func
};

var ShareViewModal = (0, _createReactClass2['default'])({
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

},{"cells-sdk":"cells-sdk","create-react-class":"create-react-class","material-ui":"material-ui","material-ui/styles":"material-ui/styles","prop-types":"prop-types","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/model/node":"pydio/model/node","pydio/util/path":"pydio/util/path","react":"react"}],26:[function(require,module,exports){
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

var PropTypes = require('prop-types');
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

var _require = require('react');

var Component = _require.Component;

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

},{"../ShareContextConsumer":1,"material-ui":"material-ui","material-ui/styles":"material-ui/styles","prop-types":"prop-types","react":"react"}],27:[function(require,module,exports){
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _cellsSdk = require('cells-sdk');

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
        value: function getAuthorizations() {
            var pydio = _pydio2['default'].getInstance();
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
        value: function buildPublicUrl(pydio, link) {
            var shortForm = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

            var params = pydio.Parameters;
            if (shortForm) {
                return '...' + params.get('PUBLIC_BASEURI') + '/' + link.LinkHash;
            } else {
                if (link.LinkUrl && link.LinkUrl.match(new RegExp('^http:\/\/|^https:\/\/'))) {
                    return link.LinkUrl;
                }
                var url = pydio.getFrontendUrl();
                return url.protocol + '//' + url.host + params.get('PUBLIC_BASEURI') + '/' + link.LinkHash;
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

            var mail = new _cellsSdk.MailerMail();
            var api = new _cellsSdk.MailerServiceApi(_pydioHttpApi2['default'].getRestClient());
            mail.To = [];
            var ignored = 0;
            Object.keys(targetUsers).map(function (k) {
                var u = targetUsers[k];
                var to = new _cellsSdk.MailerUser();
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

},{"cells-sdk":"cells-sdk","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/util/xml":"pydio/util/xml"}]},{},[15])(15)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvZGlhbG9nL1NoYXJlQ29udGV4dENvbnN1bWVyLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9jZWxscy9DZWxsQ2FyZC5qcyIsInJlcy9idWlsZC9kaWFsb2cvY2VsbHMvQ3JlYXRlQ2VsbERpYWxvZy5qcyIsInJlcy9idWlsZC9kaWFsb2cvY2VsbHMvRWRpdENlbGxEaWFsb2cuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2NlbGxzL05vZGVzUGlja2VyLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9jZWxscy9TaGFyZWRVc2VyRW50cnkuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2NlbGxzL1NoYXJlZFVzZXJzLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9jZWxscy9Vc2VyQmFkZ2UuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2NvbXBvc2l0ZS9DZWxsc0xpc3QuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2NvbXBvc2l0ZS9Db21wb3NpdGVDYXJkLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9jb21wb3NpdGUvQ29tcG9zaXRlRGlhbG9nLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9jb21wb3NpdGUvQ29tcG9zaXRlTW9kZWwuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2NvbXBvc2l0ZS9NYWlsZXIuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2NvbXBvc2l0ZS9TaW1wbGVMaW5rQ2FyZC5qcyIsInJlcy9idWlsZC9kaWFsb2cvaW5kZXguanMiLCJyZXMvYnVpbGQvZGlhbG9nL2xpbmtzL0ZpZWxkLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9saW5rcy9MYWJlbFBhbmVsLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9saW5rcy9MaW5rTW9kZWwuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2xpbmtzL1BhbmVsLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9saW5rcy9QZXJtaXNzaW9ucy5qcyIsInJlcy9idWlsZC9kaWFsb2cvbGlua3MvUHVibGljTGlua1RlbXBsYXRlLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9saW5rcy9TZWN1cmVPcHRpb25zLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9saW5rcy9UYXJnZXRlZFVzZXJzLmpzIiwicmVzL2J1aWxkL2RpYWxvZy9saW5rcy9WaXNpYmlsaXR5UGFuZWwuanMiLCJyZXMvYnVpbGQvZGlhbG9nL2xpc3RzL1NoYXJlVmlldy5qcyIsInJlcy9idWlsZC9kaWFsb2cvbWFpbi9BY3Rpb25CdXR0b24uanMiLCJyZXMvYnVpbGQvZGlhbG9nL21haW4vR2VuZXJpY0VkaXRvci5qcyIsInJlcy9idWlsZC9kaWFsb2cvbWFpbi9JbmZvUGFuZWwuanMiLCJyZXMvYnVpbGQvZGlhbG9nL21haW4vU2hhcmVIZWxwZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25RQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9UQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNyYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdldBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDak1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM1VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzdaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM09BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBmdW5jdGlvbiAoUHlkaW9Db21wb25lbnQpIHtcbiAgICB2YXIgU2hhcmVDb250ZXh0Q29uc3VtZXIgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICAgICAgX2luaGVyaXRzKFNoYXJlQ29udGV4dENvbnN1bWVyLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgICAgICBmdW5jdGlvbiBTaGFyZUNvbnRleHRDb25zdW1lcigpIHtcbiAgICAgICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTaGFyZUNvbnRleHRDb25zdW1lcik7XG5cbiAgICAgICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFNoYXJlQ29udGV4dENvbnN1bWVyLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cblxuICAgICAgICBfY3JlYXRlQ2xhc3MoU2hhcmVDb250ZXh0Q29uc3VtZXIsIFt7XG4gICAgICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgICAgICB2YXIgX2NvbnRleHQgPSB0aGlzLmNvbnRleHQ7XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2VzID0gX2NvbnRleHQubWVzc2FnZXM7XG4gICAgICAgICAgICAgICAgdmFyIGdldE1lc3NhZ2UgPSBfY29udGV4dC5nZXRNZXNzYWdlO1xuICAgICAgICAgICAgICAgIHZhciBpc1JlYWRvbmx5ID0gX2NvbnRleHQuaXNSZWFkb25seTtcblxuICAgICAgICAgICAgICAgIHZhciBjb250ZXh0UHJvcHMgPSB7IG1lc3NhZ2VzOiBtZXNzYWdlcywgZ2V0TWVzc2FnZTogZ2V0TWVzc2FnZSwgaXNSZWFkb25seTogaXNSZWFkb25seSB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFB5ZGlvQ29tcG9uZW50LCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcywgY29udGV4dFByb3BzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1dKTtcblxuICAgICAgICByZXR1cm4gU2hhcmVDb250ZXh0Q29uc3VtZXI7XG4gICAgfSkoUmVhY3QuQ29tcG9uZW50KTtcblxuICAgIFNoYXJlQ29udGV4dENvbnN1bWVyLmNvbnRleHRUeXBlcyA9IHtcbiAgICAgICAgbWVzc2FnZXM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgICAgIGdldE1lc3NhZ2U6IFByb3BUeXBlcy5mdW5jLFxuICAgICAgICBpc1JlYWRvbmx5OiBQcm9wVHlwZXMuZnVuY1xuICAgIH07XG5cbiAgICByZXR1cm4gU2hhcmVDb250ZXh0Q29uc3VtZXI7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9FZGl0Q2VsbERpYWxvZyA9IHJlcXVpcmUoJy4vRWRpdENlbGxEaWFsb2cnKTtcblxudmFyIF9FZGl0Q2VsbERpYWxvZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9FZGl0Q2VsbERpYWxvZyk7XG5cbnZhciBfcHlkaW9Nb2RlbENlbGwgPSByZXF1aXJlKCdweWRpby9tb2RlbC9jZWxsJyk7XG5cbnZhciBfcHlkaW9Nb2RlbENlbGwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9Nb2RlbENlbGwpO1xuXG52YXIgX3B5ZGlvSHR0cFJlc291cmNlc01hbmFnZXIgPSByZXF1aXJlKCdweWRpby9odHRwL3Jlc291cmNlcy1tYW5hZ2VyJyk7XG5cbnZhciBfcHlkaW9IdHRwUmVzb3VyY2VzTWFuYWdlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb0h0dHBSZXNvdXJjZXNNYW5hZ2VyKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIgPSByZXF1aXJlKFwiLi4vbWFpbi9TaGFyZUhlbHBlclwiKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoXCJjb21wb25lbnRzXCIpO1xuXG52YXIgR2VuZXJpY0NhcmQgPSBfUHlkaW8kcmVxdWlyZUxpYi5HZW5lcmljQ2FyZDtcbnZhciBHZW5lcmljTGluZSA9IF9QeWRpbyRyZXF1aXJlTGliLkdlbmVyaWNMaW5lO1xuXG52YXIgQ2VsbENhcmQgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoQ2VsbENhcmQsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gQ2VsbENhcmQocHJvcHMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2VsbENhcmQpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKENlbGxDYXJkLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0geyBlZGl0OiBmYWxzZSwgbW9kZWw6IG5ldyBfcHlkaW9Nb2RlbENlbGwyWydkZWZhdWx0J10oKSwgbG9hZGluZzogdHJ1ZSB9O1xuICAgICAgICB0aGlzLl9vYnNlcnZlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgIH07XG4gICAgICAgIF9weWRpb0h0dHBSZXNvdXJjZXNNYW5hZ2VyMlsnZGVmYXVsdCddLmxvYWRDbGFzc2VzQW5kQXBwbHkoW1wiUHlkaW9BY3Rpdml0eVN0cmVhbXNcIiwgXCJQeWRpb0NvcmVBY3Rpb25zXCJdLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGV4dExpYnM6IHRydWUgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgcm9vdE5vZGUgPSB0aGlzLnByb3BzLnJvb3ROb2RlO1xuXG4gICAgICAgIGlmIChyb290Tm9kZSkge1xuICAgICAgICAgICAgaWYgKHJvb3ROb2RlLmdldE1ldGFkYXRhKCkuaGFzKCd2aXJ0dWFsX3Jvb3QnKSkge1xuICAgICAgICAgICAgICAgIC8vIFVzZSBub2RlIGNoaWxkcmVuIGluc3RlYWRcbiAgICAgICAgICAgICAgICBpZiAocm9vdE5vZGUuaXNMb2FkZWQoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLnJvb3ROb2RlcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICByb290Tm9kZS5nZXRDaGlsZHJlbigpLmZvckVhY2goZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5zdGF0ZS5yb290Tm9kZXMucHVzaChuKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVHJpZ2dlciBjaGlsZHJlbiBsb2FkXG4gICAgICAgICAgICAgICAgICAgIHJvb3ROb2RlLm9ic2VydmUoJ2xvYWRlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByb290Tm9kZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb3ROb2RlLmdldENoaWxkcmVuKCkuZm9yRWFjaChmdW5jdGlvbiAobikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByb290Tm9kZXMucHVzaChuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyByb290Tm9kZXM6IHJvb3ROb2RlcyB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJvb3ROb2RlLmxvYWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUucm9vdE5vZGVzID0gW3Jvb3ROb2RlXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vQ2VsbENhcmQgPSBQYWxldHRlTW9kaWZpZXIoe3ByaW1hcnkxQ29sb3I6JyMwMDk2ODgnfSkoQ2VsbENhcmQpO1xuXG4gICAgX2NyZWF0ZUNsYXNzKENlbGxDYXJkLCBbe1xuICAgICAgICBrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcbiAgICAgICAgICAgIHZhciBjZWxsSWQgPSBfcHJvcHMuY2VsbElkO1xuXG4gICAgICAgICAgICBpZiAocHlkaW8udXNlci5hY3RpdmVSZXBvc2l0b3J5ID09PSBjZWxsSWQpIHtcbiAgICAgICAgICAgICAgICBweWRpby51c2VyLmdldEFjdGl2ZVJlcG9zaXRvcnlBc0NlbGwoKS50aGVuKGZ1bmN0aW9uIChjZWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IG1vZGVsOiBjZWxsLCBsb2FkaW5nOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgY2VsbC5vYnNlcnZlKCd1cGRhdGUnLCBfdGhpczIuX29ic2VydmVyKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5tb2RlbC5vYnNlcnZlKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IGxvYWRpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLm1vZGVsLmxvYWQodGhpcy5wcm9wcy5jZWxsSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsVW5tb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUubW9kZWwuc3RvcE9ic2VydmluZygndXBkYXRlJywgdGhpcy5fb2JzZXJ2ZXIpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd1c2Vyc0ludml0YXRpb25zJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVzZXJzSW52aXRhdGlvbnModXNlck9iamVjdHMpIHtcbiAgICAgICAgICAgIF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uc2VuZENlbGxJbnZpdGF0aW9uKHRoaXMucHJvcHMubm9kZSwgdGhpcy5zdGF0ZS5tb2RlbCwgdXNlck9iamVjdHMpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBtb2RlID0gX3Byb3BzMi5tb2RlO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzMi5weWRpbztcbiAgICAgICAgICAgIHZhciBlZGl0b3JPbmVDb2x1bW4gPSBfcHJvcHMyLmVkaXRvck9uZUNvbHVtbjtcbiAgICAgICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgdmFyIGVkaXQgPSBfc3RhdGUuZWRpdDtcbiAgICAgICAgICAgIHZhciBtb2RlbCA9IF9zdGF0ZS5tb2RlbDtcbiAgICAgICAgICAgIHZhciBleHRMaWJzID0gX3N0YXRlLmV4dExpYnM7XG4gICAgICAgICAgICB2YXIgcm9vdE5vZGVzID0gX3N0YXRlLnJvb3ROb2RlcztcbiAgICAgICAgICAgIHZhciBsb2FkaW5nID0gX3N0YXRlLmxvYWRpbmc7XG5cbiAgICAgICAgICAgIHZhciBtID0gZnVuY3Rpb24gbShpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBweWRpby5NZXNzYWdlSGFzaFsnc2hhcmVfY2VudGVyLicgKyBpZF07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgcm9vdFN0eWxlID0geyB3aWR0aDogMzUwLCBtaW5IZWlnaHQ6IDI3MCB9O1xuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgIGlmIChlZGl0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVkaXRvck9uZUNvbHVtbikge1xuICAgICAgICAgICAgICAgICAgICByb290U3R5bGUgPSB7IHdpZHRoOiAzNTAsIGhlaWdodDogNTAwIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcm9vdFN0eWxlID0geyB3aWR0aDogNzAwLCBoZWlnaHQ6IDUwMCB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250ZW50ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX0VkaXRDZWxsRGlhbG9nMlsnZGVmYXVsdCddLCBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcywgeyBtb2RlbDogbW9kZWwsIHNlbmRJbnZpdGF0aW9uczogdGhpcy51c2Vyc0ludml0YXRpb25zLmJpbmQodGhpcyksIGVkaXRvck9uZUNvbHVtbjogZWRpdG9yT25lQ29sdW1uIH0pKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobW9kZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgbm9kZXMgPSBtb2RlbC5nZXRSb290Tm9kZXMoKS5tYXAoZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1vZGVsLmdldE5vZGVMYWJlbEluQ29udGV4dChub2RlKTtcbiAgICAgICAgICAgICAgICB9KS5qb2luKCcsICcpO1xuICAgICAgICAgICAgICAgIGlmICghbm9kZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZXMgPSBtb2RlbC5nZXRSb290Tm9kZXMoKS5sZW5ndGggKyAnIGl0ZW0ocyknO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgZGVsZXRlQWN0aW9uID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICBlZGl0QWN0aW9uID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICBtb3JlTWVudUl0ZW1zID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGlmIChtb2RlICE9PSAnaW5mb1BhbmVsJykge1xuICAgICAgICAgICAgICAgICAgICBtb3JlTWVudUl0ZW1zID0gW107XG4gICAgICAgICAgICAgICAgICAgIGlmIChtb2RlbC5nZXRVdWlkKCkgIT09IHB5ZGlvLnVzZXIuYWN0aXZlUmVwb3NpdG9yeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9yZU1lbnVJdGVtcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHByaW1hcnlUZXh0OiBtKDI0NiksIG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW8udHJpZ2dlclJlcG9zaXRvcnlDaGFuZ2UobW9kZWwuZ2V0VXVpZCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnByb3BzLm9uRGlzbWlzcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChtb2RlbC5pc0VkaXRhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZUFjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RlbC5kZWxldGVDZWxsKCkudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMy5wcm9wcy5vbkRpc21pc3MoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0QWN0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMy5zZXRTdGF0ZSh7IGVkaXQ6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzMy5wcm9wcy5vbkhlaWdodENoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczMucHJvcHMub25IZWlnaHRDaGFuZ2UoNTAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9yZU1lbnVJdGVtcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHByaW1hcnlUZXh0OiBtKDI0NyksIG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzMy5zZXRTdGF0ZSh7IGVkaXQ6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb3JlTWVudUl0ZW1zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgcHJpbWFyeVRleHQ6IG0oMjQ4KSwgb25Ub3VjaFRhcDogZGVsZXRlQWN0aW9uIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgd2F0Y2hMaW5lID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICBibUJ1dHRvbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBpZiAoZXh0TGlicyAmJiByb290Tm9kZXMgJiYgIWxvYWRpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdG9yID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoUHlkaW9BY3Rpdml0eVN0cmVhbXMuV2F0Y2hTZWxlY3RvciwgeyBweWRpbzogcHlkaW8sIG5vZGVzOiByb290Tm9kZXMgfSk7XG4gICAgICAgICAgICAgICAgICAgIHdhdGNoTGluZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEdlbmVyaWNMaW5lLCB7IGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1iZWxsLW91dGxpbmVcIiwgbGVnZW5kOiBweWRpby5NZXNzYWdlSGFzaFsnbWV0YS53YXRjaC5zZWxlY3Rvci5sZWdlbmQnXSwgZGF0YTogc2VsZWN0b3IsIGljb25TdHlsZTogeyBtYXJnaW5Ub3A6IDMyIH0gfSk7XG4gICAgICAgICAgICAgICAgICAgIGJtQnV0dG9uID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoUHlkaW9Db3JlQWN0aW9ucy5Cb29rbWFya0J1dHRvbiwgeyBweWRpbzogcHlkaW8sIG5vZGVzOiByb290Tm9kZXMsIHN0eWxlczogeyBpY29uU3R5bGU6IHsgY29sb3I6ICd3aGl0ZScgfSB9IH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgR2VuZXJpY0NhcmQsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBtb2RlbC5nZXRMYWJlbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25EaXNtaXNzQWN0aW9uOiB0aGlzLnByb3BzLm9uRGlzbWlzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG90aGVyQWN0aW9uczogYm1CdXR0b24sXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkRlbGV0ZUFjdGlvbjogZGVsZXRlQWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25FZGl0QWN0aW9uOiBlZGl0QWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyU21hbGw6IG1vZGUgPT09ICdpbmZvUGFuZWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9yZU1lbnVJdGVtczogbW9yZU1lbnVJdGVtc1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAhbG9hZGluZyAmJiBtb2RlbC5nZXREZXNjcmlwdGlvbigpICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEdlbmVyaWNMaW5lLCB7IGljb25DbGFzc05hbWU6ICdtZGkgbWRpLWluZm9ybWF0aW9uJywgbGVnZW5kOiBtKDE0NSksIGRhdGE6IG1vZGVsLmdldERlc2NyaXB0aW9uKCkgfSksXG4gICAgICAgICAgICAgICAgICAgICFsb2FkaW5nICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEdlbmVyaWNMaW5lLCB7IGljb25DbGFzc05hbWU6ICdtZGkgbWRpLWFjY291bnQtbXVsdGlwbGUnLCBsZWdlbmQ6IG0oNTQpLCBkYXRhOiBtb2RlbC5nZXRBY2xzU3ViamVjdHMoKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgIWxvYWRpbmcgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoR2VuZXJpY0xpbmUsIHsgaWNvbkNsYXNzTmFtZTogJ21kaSBtZGktZm9sZGVyJywgbGVnZW5kOiBtKDI0OSksIGRhdGE6IG5vZGVzIH0pLFxuICAgICAgICAgICAgICAgICAgICB3YXRjaExpbmUsXG4gICAgICAgICAgICAgICAgICAgIGxvYWRpbmcgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLCBoZWlnaHQ6IDEyMCwgZm9udFdlaWdodDogNTAwLCBjb2xvcjogJyNhYWEnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9weWRpbzJbJ2RlZmF1bHQnXS5nZXRNZXNzYWdlcygpWzQ2Nl1cbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKG1vZGUgPT09ICdpbmZvUGFuZWwnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb250ZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBhcGVyLFxuICAgICAgICAgICAgICAgIHsgekRlcHRoOiAwLCBzdHlsZTogcm9vdFN0eWxlIH0sXG4gICAgICAgICAgICAgICAgY29udGVudFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBDZWxsQ2FyZDtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBDZWxsQ2FyZDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeDIsIF94MywgX3g0KSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94MiwgcHJvcGVydHkgPSBfeDMsIHJlY2VpdmVyID0gX3g0OyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94MiA9IHBhcmVudDsgX3gzID0gcHJvcGVydHk7IF94NCA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxuLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG52YXIgX3Byb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxudmFyIF9wcm9wVHlwZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHJvcFR5cGVzKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX21hdGVyaWFsVWlTdHlsZXMgPSByZXF1aXJlKCdtYXRlcmlhbC11aS9zdHlsZXMnKTtcblxudmFyIF9TaGFyZWRVc2VycyA9IHJlcXVpcmUoJy4vU2hhcmVkVXNlcnMnKTtcblxudmFyIF9TaGFyZWRVc2VyczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TaGFyZWRVc2Vycyk7XG5cbnZhciBfTm9kZXNQaWNrZXIgPSByZXF1aXJlKCcuL05vZGVzUGlja2VyJyk7XG5cbnZhciBfTm9kZXNQaWNrZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfTm9kZXNQaWNrZXIpO1xuXG52YXIgX3B5ZGlvTW9kZWxDZWxsID0gcmVxdWlyZSgncHlkaW8vbW9kZWwvY2VsbCcpO1xuXG52YXIgX3B5ZGlvTW9kZWxDZWxsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvTW9kZWxDZWxsKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2hvYycpO1xuXG52YXIgTW9kZXJuVGV4dEZpZWxkID0gX1B5ZGlvJHJlcXVpcmVMaWIuTW9kZXJuVGV4dEZpZWxkO1xuXG4vKipcbiAqIERpYWxvZyBmb3IgbGV0dGluZyB1c2VycyBjcmVhdGUgYSB3b3Jrc3BhY2VcbiAqL1xuXG52YXIgQ3JlYXRlQ2VsbERpYWxvZyA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhDcmVhdGVDZWxsRGlhbG9nLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIENyZWF0ZUNlbGxEaWFsb2coKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENyZWF0ZUNlbGxEaWFsb2cpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKENyZWF0ZUNlbGxEaWFsb2cucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0geyBzdGVwOiAndXNlcnMnLCBtb2RlbDogbmV3IF9weWRpb01vZGVsQ2VsbDJbJ2RlZmF1bHQnXSgpLCBzYXZpbmc6IGZhbHNlIH07XG5cbiAgICAgICAgdGhpcy5zdWJtaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbW9kZWwgPSBfdGhpcy5zdGF0ZS5tb2RlbDtcblxuICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBzYXZpbmc6IHRydWUgfSk7XG4gICAgICAgICAgICBtb2RlbC5zYXZlKCkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMucHJvcHMub25EaXNtaXNzKCk7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBzYXZpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgfSlbJ2NhdGNoJ10oZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgICAgICAgIHB5ZGlvLlVJLmRpc3BsYXlNZXNzYWdlKCdFUlJPUicsIHJlYXNvbi5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IHNhdmluZzogZmFsc2UgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm0gPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFsnc2hhcmVfY2VudGVyLicgKyBpZF07XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jb21wdXRlU3VtbWFyeVN0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBtb2RlbCA9IF90aGlzLnN0YXRlLm1vZGVsO1xuXG4gICAgICAgICAgICB2YXIgdXNlcnMgPSAwO1xuICAgICAgICAgICAgdmFyIGdyb3VwcyA9IDA7XG4gICAgICAgICAgICB2YXIgdGVhbXMgPSAwO1xuICAgICAgICAgICAgdmFyIHVzZXJTdHJpbmcgPSBbXTtcbiAgICAgICAgICAgIHZhciBvYmpzID0gbW9kZWwuZ2V0QWNscygpO1xuICAgICAgICAgICAgT2JqZWN0LmtleXMob2JqcykubWFwKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFjbCA9IG9ianNba107XG4gICAgICAgICAgICAgICAgaWYgKGFjbC5Hcm91cCkgZ3JvdXBzKys7ZWxzZSBpZiAoYWNsLlJvbGUpIHRlYW1zKys7ZWxzZSB1c2VycysrO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodXNlcnMpIHVzZXJTdHJpbmcucHVzaCh1c2VycyArICcgJyArIF90aGlzLm0oMjcwKSk7XG4gICAgICAgICAgICBpZiAoZ3JvdXBzKSB1c2VyU3RyaW5nLnB1c2goZ3JvdXBzICsgJyAnICsgX3RoaXMubSgyNzEpKTtcbiAgICAgICAgICAgIGlmICh0ZWFtcykgdXNlclN0cmluZy5wdXNoKHRlYW1zICsgJyAnICsgX3RoaXMubSgyNzIpKTtcbiAgICAgICAgICAgIHZhciBmaW5hbFN0cmluZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmICh1c2VyU3RyaW5nLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgICAgIGZpbmFsU3RyaW5nID0gdXNlclN0cmluZ1swXSArICcsICcgKyB1c2VyU3RyaW5nWzFdICsgX3RoaXMubSgyNzQpICsgdXNlclN0cmluZ1szXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodXNlclN0cmluZy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBmaW5hbFN0cmluZyA9IF90aGlzLm0oMjczKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmluYWxTdHJpbmcgPSB1c2VyU3RyaW5nLmpvaW4oX3RoaXMubSgyNzQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfdGhpcy5tKDI2OSkucmVwbGFjZSgnJVVTRVJTJywgZmluYWxTdHJpbmcpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhDcmVhdGVDZWxsRGlhbG9nLCBbe1xuICAgICAgICBrZXk6ICdnZXRDaGlsZENvbnRleHQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0Q2hpbGRDb250ZXh0KCkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2VzID0gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaDtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZXM6IG1lc3NhZ2VzLFxuICAgICAgICAgICAgICAgIGdldE1lc3NhZ2U6IGZ1bmN0aW9uIGdldE1lc3NhZ2UobWVzc2FnZUlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuYW1lc3BhY2UgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAnc2hhcmVfY2VudGVyJyA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2VzW25hbWVzcGFjZSArIChuYW1lc3BhY2UgPyBcIi5cIiA6IFwiXCIpICsgbWVzc2FnZUlkXSB8fCBtZXNzYWdlSWQ7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlSWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGlzUmVhZG9ubHk6IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLnJlZnMudGl0bGUuZm9jdXMoKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUubW9kZWwub2JzZXJ2ZSgndXBkYXRlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxVbm1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5tb2RlbC5zdG9wT2JzZXJ2aW5nKCd1cGRhdGUnKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgYnV0dG9ucyA9IFtdO1xuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSB0aGlzLnByb3BzLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgc3RlcCA9IF9zdGF0ZS5zdGVwO1xuICAgICAgICAgICAgdmFyIG1vZGVsID0gX3N0YXRlLm1vZGVsO1xuICAgICAgICAgICAgdmFyIHNhdmluZyA9IF9zdGF0ZS5zYXZpbmc7XG5cbiAgICAgICAgICAgIHZhciBkaWFsb2dMYWJlbCA9IHB5ZGlvLk1lc3NhZ2VIYXNoWyc0MTgnXTtcbiAgICAgICAgICAgIGlmIChzdGVwICE9PSAndXNlcnMnKSB7XG4gICAgICAgICAgICAgICAgZGlhbG9nTGFiZWwgPSBtb2RlbC5nZXRMYWJlbCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc3RlcCA9PT0gJ3VzZXJzJykge1xuXG4gICAgICAgICAgICAgICAgY29udGVudCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm0oMjc1KVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNb2Rlcm5UZXh0RmllbGQsIHsgcmVmOiBcInRpdGxlXCIsIGZsb2F0aW5nTGFiZWxUZXh0OiB0aGlzLm0oMjc2KSwgdmFsdWU6IG1vZGVsLmdldExhYmVsKCksIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZSwgdikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsLnNldExhYmVsKHYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVsbFdpZHRoOiB0cnVlIH0pLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNb2Rlcm5UZXh0RmllbGQsIHsgZmxvYXRpbmdMYWJlbFRleHQ6IHRoaXMubSgyNzcpLCB2YWx1ZTogbW9kZWwuZ2V0RGVzY3JpcHRpb24oKSwgb25DaGFuZ2U6IGZ1bmN0aW9uIChlLCB2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWwuc2V0RGVzY3JpcHRpb24odik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBmdWxsV2lkdGg6IHRydWUgfSlcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgaWYgKG1vZGVsLmdldExhYmVsKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9ucy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogJ3F1aWNrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogIW1vZGVsLmdldExhYmVsKCkgfHwgc2F2aW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMubSgnY2VsbHMuY3JlYXRlLmFkdmFuY2VkJyksIC8vIEFkdmFuY2VkXG4gICAgICAgICAgICAgICAgICAgICAgICBvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnNldFN0YXRlKHsgc3RlcDogJ2RhdGEnIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSk7XG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbnMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIG1hcmdpbjogJzAgIDEwcHgnLCBmb250U2l6ZTogMTQsIGZvbnRXZWlnaHQ6IDUwMCwgY29sb3I6ICcjOUU5RTlFJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm0oJ2NlbGxzLmNyZWF0ZS5idXR0b25zLnNlcGFyYXRvcicpXG4gICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJ1dHRvbnMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWlzZWRCdXR0b24sIHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnbmV4dDEnLFxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogIW1vZGVsLmdldExhYmVsKCkgfHwgc2F2aW5nLFxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy5tKDI3OSksIC8vIENyZWF0ZSBDZWxsXG4gICAgICAgICAgICAgICAgICAgIG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMy5zdWJtaXQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSB9KSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN0ZXAgPT09ICdkYXRhJykge1xuXG4gICAgICAgICAgICAgICAgY29udGVudCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnaDUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBtYXJnaW5Ub3A6IC0xMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm0oMjc4KVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfU2hhcmVkVXNlcnMyWydkZWZhdWx0J10sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbGxBY2xzOiBtb2RlbC5nZXRBY2xzKCksXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGV4Y2x1ZGVzOiBbcHlkaW8udXNlci5pZF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvblVzZXJPYmplY3RBZGQ6IG1vZGVsLmFkZFVzZXIuYmluZChtb2RlbCksXG4gICAgICAgICAgICAgICAgICAgICAgICBvblVzZXJPYmplY3RSZW1vdmU6IG1vZGVsLnJlbW92ZVVzZXIuYmluZChtb2RlbCksXG4gICAgICAgICAgICAgICAgICAgICAgICBvblVzZXJPYmplY3RVcGRhdGVSaWdodDogbW9kZWwudXBkYXRlVXNlclJpZ2h0LmJpbmQobW9kZWwpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIGJ1dHRvbnMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGtleTogJ3ByZXYxJywgcHJpbWFyeTogZmFsc2UsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnMzA0J10sIG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMy5zZXRTdGF0ZSh7IHN0ZXA6ICd1c2VycycgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gfSkpO1xuICAgICAgICAgICAgICAgIGJ1dHRvbnMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGtleTogJ25leHQyJywgcHJpbWFyeTogdHJ1ZSwgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWycxNzknXSwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzMy5zZXRTdGF0ZSh7IHN0ZXA6ICdsYWJlbCcgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gfSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2g1JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgbWFyZ2luVG9wOiAtMTAgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tKCdjZWxscy5jcmVhdGUudGl0bGUuZmlsbC5mb2xkZXJzJylcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgY29sb3I6ICcjOWU5ZTllJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXB1dGVTdW1tYXJ5U3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZ1RvcDogMTYgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX05vZGVzUGlja2VyMlsnZGVmYXVsdCddLCB7IHB5ZGlvOiBweWRpbywgbW9kZWw6IG1vZGVsIH0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgYnV0dG9ucy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsga2V5OiAncHJldjInLCBwcmltYXJ5OiBmYWxzZSwgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWyczMDQnXSwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnNldFN0YXRlKHsgc3RlcDogJ2RhdGEnIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IH0pKTtcbiAgICAgICAgICAgICAgICBidXR0b25zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuUmFpc2VkQnV0dG9uLCB7IGtleTogJ3N1Ym1pdCcsIGRpc2FibGVkOiBzYXZpbmcsIHByaW1hcnk6IHRydWUsIGxhYmVsOiB0aGlzLm0oMjc5KSwgb25Ub3VjaFRhcDogdGhpcy5zdWJtaXQuYmluZCh0aGlzKSB9KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiAzODAsIGZvbnRTaXplOiAxMywgY29sb3I6ICdyZ2JhKDAsMCwwLC44NyknLCBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBtaW5IZWlnaHQ6IDMwMCB9IH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIHBhZGRpbmdMZWZ0OiAyMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogXCJpY29tb29uLWNlbGxzLWZ1bGwtcGx1c1wiIH0pLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAyMCwgZm9udFNpemU6IDIyIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpYWxvZ0xhYmVsXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAnMjBweCAyMHB4IDEwcHgnLCBmbGV4OiAxIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmc6ICcxMnB4IDE2cHgnLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtZW5kJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbnNcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0sIFt7XG4gICAgICAgIGtleTogJ2NoaWxkQ29udGV4dFR5cGVzJyxcbiAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgIG1lc3NhZ2VzOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLm9iamVjdCxcbiAgICAgICAgICAgIGdldE1lc3NhZ2U6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uZnVuYyxcbiAgICAgICAgICAgIGlzUmVhZG9ubHk6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uZnVuY1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIENyZWF0ZUNlbGxEaWFsb2c7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ3JlYXRlQ2VsbERpYWxvZyA9ICgwLCBfbWF0ZXJpYWxVaVN0eWxlcy5tdWlUaGVtZWFibGUpKCkoQ3JlYXRlQ2VsbERpYWxvZyk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBDcmVhdGVDZWxsRGlhbG9nO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94MiwgX3gzLCBfeDQpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gyLCBwcm9wZXJ0eSA9IF94MywgcmVjZWl2ZXIgPSBfeDQ7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3gyID0gcGFyZW50OyBfeDMgPSBwcm9wZXJ0eTsgX3g0ID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9TaGFyZWRVc2VycyA9IHJlcXVpcmUoJy4vU2hhcmVkVXNlcnMnKTtcblxudmFyIF9TaGFyZWRVc2VyczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TaGFyZWRVc2Vycyk7XG5cbnZhciBfTm9kZXNQaWNrZXIgPSByZXF1aXJlKCcuL05vZGVzUGlja2VyJyk7XG5cbnZhciBfTm9kZXNQaWNrZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfTm9kZXNQaWNrZXIpO1xuXG52YXIgX21haW5HZW5lcmljRWRpdG9yID0gcmVxdWlyZSgnLi4vbWFpbi9HZW5lcmljRWRpdG9yJyk7XG5cbnZhciBfbWFpbkdlbmVyaWNFZGl0b3IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpbkdlbmVyaWNFZGl0b3IpO1xuXG4vKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbnZhciBfcHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG52YXIgX3Byb3BUeXBlczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wcm9wVHlwZXMpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdjb21wb25lbnRzJyk7XG5cbnZhciBSZXNvdXJjZVBvbGljaWVzUGFuZWwgPSBfUHlkaW8kcmVxdWlyZUxpYi5SZXNvdXJjZVBvbGljaWVzUGFuZWw7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYjIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignaG9jJyk7XG5cbnZhciBNb2Rlcm5UZXh0RmllbGQgPSBfUHlkaW8kcmVxdWlyZUxpYjIuTW9kZXJuVGV4dEZpZWxkO1xuXG4vKipcbiAqIERpYWxvZyBmb3IgbGV0dGluZyB1c2VycyBjcmVhdGUgYSB3b3Jrc3BhY2VcbiAqL1xuXG52YXIgX2RlZmF1bHQgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoX2RlZmF1bHQsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gX2RlZmF1bHQoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIF9kZWZhdWx0KTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihfZGVmYXVsdC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgIHRoaXMuc3VibWl0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IF90aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIG1vZGVsID0gX3Byb3BzLm1vZGVsO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuXG4gICAgICAgICAgICB2YXIgZGlydHlSb290cyA9IG1vZGVsLmhhc0RpcnR5Um9vdE5vZGVzKCk7XG4gICAgICAgICAgICBtb2RlbC5zYXZlKCkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgICAgICAgICBpZiAoZGlydHlSb290cyAmJiBtb2RlbC5nZXRVdWlkKCkgPT09IHB5ZGlvLnVzZXIuZ2V0QWN0aXZlUmVwb3NpdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvLmdvVG8oJy8nKTtcbiAgICAgICAgICAgICAgICAgICAgcHlkaW8uZmlyZUNvbnRleHRSZWZyZXNoKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlbJ2NhdGNoJ10oZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgICAgICAgIHB5ZGlvLlVJLmRpc3BsYXlNZXNzYWdlKCdFUlJPUicsIHJlYXNvbi5tZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhfZGVmYXVsdCwgW3tcbiAgICAgICAga2V5OiAnZ2V0Q2hpbGRDb250ZXh0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldENoaWxkQ29udGV4dCgpIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlcyA9IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiBtZXNzYWdlcyxcbiAgICAgICAgICAgICAgICBnZXRNZXNzYWdlOiBmdW5jdGlvbiBnZXRNZXNzYWdlKG1lc3NhZ2VJZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmFtZXNwYWNlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gJ3NoYXJlX2NlbnRlcicgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlc1tuYW1lc3BhY2UgKyAobmFtZXNwYWNlID8gXCIuXCIgOiBcIlwiKSArIG1lc3NhZ2VJZF0gfHwgbWVzc2FnZUlkO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZUlkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpc1JlYWRvbmx5OiBmdW5jdGlvbiBpc1JlYWRvbmx5KCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wczIucHlkaW87XG4gICAgICAgICAgICB2YXIgbW9kZWwgPSBfcHJvcHMyLm1vZGVsO1xuICAgICAgICAgICAgdmFyIHNlbmRJbnZpdGF0aW9ucyA9IF9wcm9wczIuc2VuZEludml0YXRpb25zO1xuXG4gICAgICAgICAgICB2YXIgbSA9IGZ1bmN0aW9uIG0oaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci4nICsgaWRdO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIGhlYWRlciA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KE1vZGVyblRleHRGaWVsZCwgeyBmbG9hdGluZ0xhYmVsVGV4dDogbSgyNjcpLCB2YWx1ZTogbW9kZWwuZ2V0TGFiZWwoKSwgb25DaGFuZ2U6IGZ1bmN0aW9uIChlLCB2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbC5zZXRMYWJlbCh2KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZnVsbFdpZHRoOiB0cnVlIH0pLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTW9kZXJuVGV4dEZpZWxkLCB7IGZsb2F0aW5nTGFiZWxUZXh0OiBtKDI2OCksIHZhbHVlOiBtb2RlbC5nZXREZXNjcmlwdGlvbigpLCBvbkNoYW5nZTogZnVuY3Rpb24gKGUsIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsLnNldERlc2NyaXB0aW9uKHYpO1xuICAgICAgICAgICAgICAgICAgICB9LCBmdWxsV2lkdGg6IHRydWUgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB2YXIgdGFicyA9IHtcbiAgICAgICAgICAgICAgICBsZWZ0OiBbe1xuICAgICAgICAgICAgICAgICAgICBMYWJlbDogbSg1NCksXG4gICAgICAgICAgICAgICAgICAgIFZhbHVlOiAndXNlcnMnLFxuICAgICAgICAgICAgICAgICAgICBDb21wb25lbnQ6IFJlYWN0LmNyZWF0ZUVsZW1lbnQoX1NoYXJlZFVzZXJzMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgICAgICBjZWxsQWNsczogbW9kZWwuZ2V0QWNscygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhjbHVkZXM6IFtweWRpby51c2VyLmlkXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRJbnZpdGF0aW9uczogc2VuZEludml0YXRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25Vc2VyT2JqZWN0QWRkOiBtb2RlbC5hZGRVc2VyLmJpbmQobW9kZWwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25Vc2VyT2JqZWN0UmVtb3ZlOiBtb2RlbC5yZW1vdmVVc2VyLmJpbmQobW9kZWwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25Vc2VyT2JqZWN0VXBkYXRlUmlnaHQ6IG1vZGVsLnVwZGF0ZVVzZXJSaWdodC5iaW5kKG1vZGVsKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgTGFiZWw6IG0oMjUzKSxcbiAgICAgICAgICAgICAgICAgICAgVmFsdWU6ICdwZXJtaXNzaW9ucycsXG4gICAgICAgICAgICAgICAgICAgIEFsd2F5c0xhc3Q6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIENvbXBvbmVudDogUmVhY3QuY3JlYXRlRWxlbWVudChSZXNvdXJjZVBvbGljaWVzUGFuZWwsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlVHlwZTogJ2NlbGwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG0oJ2NlbGwudmlzaWJpbGl0eS5hZHZhbmNlZCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VJZDogbW9kZWwuZ2V0VXVpZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgbWFyZ2luOiAtMTAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNraXBUaXRsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uU2F2ZVBvbGljaWVzOiBmdW5jdGlvbiAoKSB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRvbmx5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbGxBY2xzOiBtb2RlbC5nZXRBY2xzKClcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICByaWdodDogW3tcbiAgICAgICAgICAgICAgICAgICAgTGFiZWw6IG0oMjQ5KSxcbiAgICAgICAgICAgICAgICAgICAgVmFsdWU6ICdjb250ZW50JyxcbiAgICAgICAgICAgICAgICAgICAgQ29tcG9uZW50OiBSZWFjdC5jcmVhdGVFbGVtZW50KF9Ob2Rlc1BpY2tlcjJbJ2RlZmF1bHQnXSwgeyBweWRpbzogcHlkaW8sIG1vZGVsOiBtb2RlbCwgbW9kZTogJ2VkaXQnIH0pXG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYWluR2VuZXJpY0VkaXRvcjJbJ2RlZmF1bHQnXSwge1xuICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICB0YWJzOiB0YWJzLFxuICAgICAgICAgICAgICAgIGhlYWRlcjogaGVhZGVyLFxuICAgICAgICAgICAgICAgIGVkaXRvck9uZUNvbHVtbjogdGhpcy5wcm9wcy5lZGl0b3JPbmVDb2x1bW4sXG4gICAgICAgICAgICAgICAgc2F2ZUVuYWJsZWQ6IG1vZGVsLmlzRGlydHkoKSxcbiAgICAgICAgICAgICAgICBvblNhdmVBY3Rpb246IHRoaXMuc3VibWl0LmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgb25DbG9zZUFjdGlvbjogdGhpcy5wcm9wcy5vbkRpc21pc3MsXG4gICAgICAgICAgICAgICAgb25SZXZlcnRBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwucmV2ZXJ0Q2hhbmdlcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfV0sIFt7XG4gICAgICAgIGtleTogJ2NoaWxkQ29udGV4dFR5cGVzJyxcbiAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgIG1lc3NhZ2VzOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLm9iamVjdCxcbiAgICAgICAgICAgIGdldE1lc3NhZ2U6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uZnVuYyxcbiAgICAgICAgICAgIGlzUmVhZG9ubHk6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uZnVuY1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIF9kZWZhdWx0O1xufSkoUmVhY3QuQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gX2RlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSBhcnIyW2ldID0gYXJyW2ldOyByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfbWF0ZXJpYWxVaVN0eWxlcyA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpL3N0eWxlcycpO1xuXG52YXIgX3B5ZGlvTW9kZWxEYXRhTW9kZWwgPSByZXF1aXJlKCdweWRpby9tb2RlbC9kYXRhLW1vZGVsJyk7XG5cbnZhciBfcHlkaW9Nb2RlbERhdGFNb2RlbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb01vZGVsRGF0YU1vZGVsKTtcblxudmFyIF9yZXF1aXJlJHJlcXVpcmVMaWIgPSByZXF1aXJlKCdweWRpbycpLnJlcXVpcmVMaWIoJ2NvbXBvbmVudHMnKTtcblxudmFyIEZvbGRlcnNUcmVlID0gX3JlcXVpcmUkcmVxdWlyZUxpYi5Gb2xkZXJzVHJlZTtcblxudmFyIE5vZGVzUGlja2VyID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKE5vZGVzUGlja2VyLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIE5vZGVzUGlja2VyKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBOb2Rlc1BpY2tlcik7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoTm9kZXNQaWNrZXIucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHZhciBjcnRXcyA9IHVuZGVmaW5lZDtcblxuICAgICAgICB2YXIgdXNlciA9IHByb3BzLnB5ZGlvLnVzZXI7XG4gICAgICAgIHZhciBhdmFpbCA9IFtdO1xuICAgICAgICB1c2VyLmdldFJlcG9zaXRvcmllc0xpc3QoKS5mb3JFYWNoKGZ1bmN0aW9uIChyZXBvKSB7XG4gICAgICAgICAgICBpZiAocmVwby5nZXRBY2Nlc3NUeXBlKCkgPT09ICdnYXRld2F5Jykge1xuICAgICAgICAgICAgICAgIGlmIChyZXBvLmdldElkKCkgPT09IHVzZXIuYWN0aXZlUmVwb3NpdG9yeSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVwby5nZXRPd25lcigpID09PSAnc2hhcmVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBkbyBub3QgcHVzaCB0byB0aGUgbGlzdFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNydFdzID0gcmVwbztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXZhaWwucHVzaChyZXBvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBhdmFpbGFibGVXcyA9IFtdO1xuICAgICAgICB2YXIgbm90T3duZWQgPSBhdmFpbC5maWx0ZXIoZnVuY3Rpb24gKHJlcG8pIHtcbiAgICAgICAgICAgIHJldHVybiAhcmVwby5nZXRPd25lcigpO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIG93bmVkID0gYXZhaWwuZmlsdGVyKGZ1bmN0aW9uIChyZXBvKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVwby5nZXRPd25lcigpO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKG5vdE93bmVkLmxlbmd0aCAmJiBvd25lZC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGF2YWlsYWJsZVdzID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShub3RPd25lZCksIFsnRElWSURFUiddLCBfdG9Db25zdW1hYmxlQXJyYXkob3duZWQpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF2YWlsYWJsZVdzID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShub3RPd25lZCksIF90b0NvbnN1bWFibGVBcnJheShvd25lZCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRtID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoYXZhaWxhYmxlV3MubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoIWNydFdzKSB7XG4gICAgICAgICAgICAgICAgY3J0V3MgPSBhdmFpbGFibGVXc1swXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRtID0gX3B5ZGlvTW9kZWxEYXRhTW9kZWwyWydkZWZhdWx0J10uUmVtb3RlRGF0YU1vZGVsRmFjdG9yeSh7IHRtcF9yZXBvc2l0b3J5X2lkOiBjcnRXcy5nZXRJZCgpIH0pO1xuICAgICAgICAgICAgdmFyIHJvb3QgPSBkbS5nZXRSb290Tm9kZSgpO1xuICAgICAgICAgICAgcm9vdC5nZXRNZXRhZGF0YSgpLnNldCgncmVwb3NpdG9yeV9pZCcsIGNydFdzLmdldElkKCkpO1xuICAgICAgICAgICAgcm9vdC5sb2FkKGRtLmdldEFqeHBOb2RlUHJvdmlkZXIoKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZGF0YU1vZGVsOiBkbSxcbiAgICAgICAgICAgIG9wZW46IGZhbHNlLFxuICAgICAgICAgICAgYXZhaWxhYmxlV3M6IGF2YWlsYWJsZVdzLFxuICAgICAgICAgICAgY3J0V3M6IGNydFdzXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKE5vZGVzUGlja2VyLCBbe1xuICAgICAgICBrZXk6ICdzd2l0Y2hXb3Jrc3BhY2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc3dpdGNoV29ya3NwYWNlKHdzKSB7XG4gICAgICAgICAgICB2YXIgZG0gPSBfcHlkaW9Nb2RlbERhdGFNb2RlbDJbJ2RlZmF1bHQnXS5SZW1vdGVEYXRhTW9kZWxGYWN0b3J5KHsgdG1wX3JlcG9zaXRvcnlfaWQ6IHdzLmdldElkKCkgfSk7XG4gICAgICAgICAgICB2YXIgcm9vdCA9IGRtLmdldFJvb3ROb2RlKCk7XG4gICAgICAgICAgICByb290LmdldE1ldGFkYXRhKCkuc2V0KCdyZXBvc2l0b3J5X2lkJywgd3MuZ2V0SWQoKSk7XG4gICAgICAgICAgICByb290LmxvYWQoZG0uZ2V0QWp4cE5vZGVQcm92aWRlcigpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjcnRXczogd3MsIGRhdGFNb2RlbDogZG0gfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2hhbmRsZVRvdWNoVGFwJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZVRvdWNoVGFwKGV2ZW50KSB7XG4gICAgICAgICAgICAvLyBUaGlzIHByZXZlbnRzIGdob3N0IGNsaWNrLlxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgb3BlbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBhbmNob3JFbDogZXZlbnQuY3VycmVudFRhcmdldFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2hhbmRsZVJlcXVlc3RDbG9zZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBoYW5kbGVSZXF1ZXN0Q2xvc2UoKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBvcGVuOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29uVmFsaWRhdGVOb2RlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uVmFsaWRhdGVOb2RlKCkge1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IF9zdGF0ZS5ub2RlO1xuICAgICAgICAgICAgdmFyIGNydFdzID0gX3N0YXRlLmNydFdzO1xuXG4gICAgICAgICAgICB0aGlzLnByb3BzLm1vZGVsLmFkZFJvb3ROb2RlKG5vZGUsIGNydFdzLmdldElkKCkpO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVSZXF1ZXN0Q2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb25Ob2RlU2VsZWN0ZWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb25Ob2RlU2VsZWN0ZWQobm9kZSkge1xuICAgICAgICAgICAgdmFyIGRhdGFNb2RlbCA9IHRoaXMuc3RhdGUuZGF0YU1vZGVsO1xuXG4gICAgICAgICAgICBub2RlLmxvYWQoZGF0YU1vZGVsLmdldEFqeHBOb2RlUHJvdmlkZXIoKSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbm9kZTogbm9kZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gbm9kZSBUcmVlTm9kZVxuICAgICAgICAgKiBAcmV0dXJuIHtYTUx9XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyTm9kZUxpbmUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyTm9kZUxpbmUobm9kZSkge1xuICAgICAgICAgICAgdmFyIG1vZGVsID0gdGhpcy5wcm9wcy5tb2RlbDtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkxpc3RJdGVtLCB7XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgbGVmdEljb246IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogXCJtZGkgbWRpLVwiICsgKG5vZGUuVHlwZSA9PT0gJ0xFQUYnID8gJ2ZpbGUnIDogJ2ZvbGRlcicpIH0pLFxuICAgICAgICAgICAgICAgIHByaW1hcnlUZXh0OiBtb2RlbC5nZXROb2RlTGFiZWxJbkNvbnRleHQobm9kZSksXG4gICAgICAgICAgICAgICAgcmlnaHRJY29uQnV0dG9uOiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsLnJlbW92ZVJvb3ROb2RlKG5vZGUuVXVpZCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGljb25DbGFzc05hbWU6ICdtZGkgbWRpLWRlbGV0ZScsIHRvb2x0aXA6ICdSZW1vdmUnLCBpY29uU3R5bGU6IHsgY29sb3I6ICdyZ2JhKDAsMCwwLC40MyknIH0gfSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgbW9kZWwgPSBfcHJvcHMubW9kZWw7XG4gICAgICAgICAgICB2YXIgbXVpVGhlbWUgPSBfcHJvcHMubXVpVGhlbWU7XG4gICAgICAgICAgICB2YXIgbW9kZSA9IF9wcm9wcy5tb2RlO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuXG4gICAgICAgICAgICB2YXIgbSA9IGZ1bmN0aW9uIG0oaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci4nICsgaWRdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciBub2RlcyA9IG1vZGVsLmdldFJvb3ROb2RlcygpIHx8IFtdO1xuICAgICAgICAgICAgdmFyIG5vZGVMaW5lcyA9IFtdLFxuICAgICAgICAgICAgICAgIGVtcHR5U3RhdGVTdHJpbmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBub2Rlcy5tYXAoZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBub2RlTGluZXMucHVzaChfdGhpcy5yZW5kZXJOb2RlTGluZShub2RlKSk7XG4gICAgICAgICAgICAgICAgbm9kZUxpbmVzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRGl2aWRlciwgeyBpbnNldDogdHJ1ZSB9KSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG5vZGVMaW5lcy5wb3AoKTtcbiAgICAgICAgICAgIGlmICghbm9kZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1vZGUgPT09ICdlZGl0Jykge1xuICAgICAgICAgICAgICAgICAgICBlbXB0eVN0YXRlU3RyaW5nID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGNvbG9yOiAncmdiYSgwLDAsMCwuNTQpJywgZm9udFN0eWxlOiAnaXRhbGljJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtKDI4MClcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvL2VtcHR5U3RhdGVTdHJpbmcgPSA8c3BhbiBzdHlsZT17e2NvbG9yOidyZ2JhKDAsMCwwLC41NCknLCBmb250U3R5bGU6J2l0YWxpYyd9fT57bSgyODEpfTwvc3Bhbj47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHBpY2tCdXR0b24gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAobW9kZSA9PT0gJ2VkaXQnKSB7XG4gICAgICAgICAgICAgICAgcGlja0J1dHRvbiA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IG0oMjgyKSxcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFRhcDogdGhpcy5oYW5kbGVUb3VjaFRhcC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBtYXJnaW5Cb3R0b206IDEwIH0sXG4gICAgICAgICAgICAgICAgICAgIGljb246IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogXCJtZGkgbWRpLWZvbGRlci1wbHVzXCIgfSlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGlja0J1dHRvbiA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhaXNlZEJ1dHRvbiwge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogbSgyODIpLFxuICAgICAgICAgICAgICAgICAgICBvblRvdWNoVGFwOiB0aGlzLmhhbmRsZVRvdWNoVGFwLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnk6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBtYXJnaW5Cb3R0b206IDEwIH0sXG4gICAgICAgICAgICAgICAgICAgIGljb246IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogXCJtZGkgbWRpLWZvbGRlci1wbHVzXCIsIHN0eWxlOiB7IGZvbnRTaXplOiAyMCwgbWFyZ2luVG9wOiAtNCB9IH0pXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgX3N0YXRlMiA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IF9zdGF0ZTIubm9kZTtcbiAgICAgICAgICAgIHZhciBhdmFpbGFibGVXcyA9IF9zdGF0ZTIuYXZhaWxhYmxlV3M7XG4gICAgICAgICAgICB2YXIgY3J0V3MgPSBfc3RhdGUyLmNydFdzO1xuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBwaWNrQnV0dG9uLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5MaXN0LFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBub2RlTGluZXNcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGVtcHR5U3RhdGVTdHJpbmcsXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBvcG92ZXIsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46IHRoaXMuc3RhdGUub3BlbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuY2hvckVsOiB0aGlzLnN0YXRlLmFuY2hvckVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiB7IGhvcml6b250YWw6ICdsZWZ0JywgdmVydGljYWw6ICdib3R0b20nIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRPcmlnaW46IHsgaG9yaXpvbnRhbDogJ2xlZnQnLCB2ZXJ0aWNhbDogJ3RvcCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVxdWVzdENsb3NlOiB0aGlzLmhhbmRsZVJlcXVlc3RDbG9zZS5iaW5kKHRoaXMpXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiAzNzIsIGhlaWdodDogMzAwLCBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLkRyb3BEb3duTWVudSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGhlaWdodDogNTQgfSwgdmFsdWU6IGNydFdzLCBvbkNoYW5nZTogZnVuY3Rpb24gKGUsIGksIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnN3aXRjaFdvcmtzcGFjZSh2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZVdzLm1hcChmdW5jdGlvbiAod3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHdzID09PSAnRElWSURFUicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5EaXZpZGVyLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyB2YWx1ZTogd3MsIHByaW1hcnlUZXh0OiB3cy5nZXRMYWJlbCgpIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5EaXZpZGVyLCBudWxsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgbWFyZ2luTGVmdDogLTI2LCBmbGV4OiAnMScsIG92ZXJmbG93WTogJ2F1dG8nLCBmb250U2l6ZTogMTUsIGNvbG9yOiAncmdiYSgwLDAsMCwuNzMpJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoRm9sZGVyc1RyZWUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW86IHRoaXMucHJvcHMucHlkaW8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFNb2RlbDogdGhpcy5zdGF0ZS5kYXRhTW9kZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uTm9kZVNlbGVjdGVkOiB0aGlzLm9uTm9kZVNlbGVjdGVkLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dSb290OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRGl2aWRlciwgbnVsbCksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgcGFkZGluZzogJzRweCAxNnB4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGZvbnRTaXplOiAxNSB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgY29sb3I6ICdyZ2JhKDAsMCwwLC44NyknIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSAmJiBub2RlLmdldFBhdGgoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIW5vZGUgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZsZXg6IDEsIGNvbG9yOiAncmdiYSgwLDAsMCwuNTQpJywgZm9udFdlaWdodDogNTAwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgyODMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IGljb25TdHlsZTogeyBjb2xvcjogbXVpVGhlbWUucGFsZXR0ZS5wcmltYXJ5MUNvbG9yIH0sIGRpc2FibGVkOiAhbm9kZSwgaWNvbkNsYXNzTmFtZTogXCJtZGkgbWRpLXBsdXMtY2lyY2xlLW91dGxpbmVcIiwgb25Ub3VjaFRhcDogdGhpcy5vblZhbGlkYXRlTm9kZS5iaW5kKHRoaXMpIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIE5vZGVzUGlja2VyO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IE5vZGVzUGlja2VyID0gKDAsIF9tYXRlcmlhbFVpU3R5bGVzLm11aVRoZW1lYWJsZSkoKShOb2Rlc1BpY2tlcik7XG5leHBvcnRzWydkZWZhdWx0J10gPSBOb2Rlc1BpY2tlcjtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfVXNlckJhZGdlID0gcmVxdWlyZSgnLi9Vc2VyQmFkZ2UnKTtcblxudmFyIF9Vc2VyQmFkZ2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVXNlckJhZGdlKTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lciA9IHJlcXVpcmUoJy4uL1NoYXJlQ29udGV4dENvbnN1bWVyJyk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU2hhcmVDb250ZXh0Q29uc3VtZXIpO1xuXG52YXIgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIFNoYXJlZFVzZXJFbnRyeSA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhTaGFyZWRVc2VyRW50cnksIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gU2hhcmVkVXNlckVudHJ5KCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTaGFyZWRVc2VyRW50cnkpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFNoYXJlZFVzZXJFbnRyeS5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgIHRoaXMub25SZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy5wcm9wcy5vblVzZXJPYmplY3RSZW1vdmUoX3RoaXMucHJvcHMuY2VsbEFjbC5Sb2xlSWQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub25JbnZpdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0cyA9IHt9O1xuICAgICAgICAgICAgdmFyIHVzZXJPYmplY3QgPSBQeWRpb1VzZXJzLlVzZXIuZnJvbUlkbVVzZXIoX3RoaXMucHJvcHMuY2VsbEFjbC5Vc2VyKTtcbiAgICAgICAgICAgIHRhcmdldHNbdXNlck9iamVjdC5nZXRJZCgpXSA9IHVzZXJPYmplY3Q7XG4gICAgICAgICAgICBfdGhpcy5wcm9wcy5zZW5kSW52aXRhdGlvbnModGFyZ2V0cyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5vblVwZGF0ZVJpZ2h0ID0gZnVuY3Rpb24gKG5hbWUsIGNoZWNrZWQpIHtcbiAgICAgICAgICAgIF90aGlzLnByb3BzLm9uVXNlck9iamVjdFVwZGF0ZVJpZ2h0KF90aGlzLnByb3BzLmNlbGxBY2wuUm9sZUlkLCBuYW1lLCBjaGVja2VkKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoU2hhcmVkVXNlckVudHJ5LCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIGNlbGxBY2wgPSBfcHJvcHMuY2VsbEFjbDtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcblxuICAgICAgICAgICAgdmFyIG1lbnVJdGVtcyA9IFtdO1xuICAgICAgICAgICAgdmFyIHR5cGUgPSBjZWxsQWNsLlVzZXIgPyAndXNlcicgOiBjZWxsQWNsLkdyb3VwID8gJ2dyb3VwJyA6ICd0ZWFtJztcblxuICAgICAgICAgICAgLy8gRG8gbm90IHJlbmRlciBjdXJyZW50IHVzZXJcbiAgICAgICAgICAgIGlmIChjZWxsQWNsLlVzZXIgJiYgY2VsbEFjbC5Vc2VyLkxvZ2luID09PSBweWRpby51c2VyLmlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlICE9PSAnZ3JvdXAnKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc2VuZEludml0YXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNlbmQgaW52aXRhdGlvblxuICAgICAgICAgICAgICAgICAgICBtZW51SXRlbXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzQ1JyksXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogdGhpcy5vbkludml0ZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMucHJvcHMuaXNSZWFkb25seSgpICYmICF0aGlzLnByb3BzLnJlYWRvbmx5KSB7XG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIEVudHJ5XG4gICAgICAgICAgICAgICAgbWVudUl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzI1NycsICcnKSxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IHRoaXMub25SZW1vdmVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGxhYmVsID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIGF2YXRhciA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJ1c2VyXCI6XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsID0gY2VsbEFjbC5Vc2VyLkF0dHJpYnV0ZXNbXCJkaXNwbGF5TmFtZVwiXSB8fCBjZWxsQWNsLlVzZXIuTG9naW47XG4gICAgICAgICAgICAgICAgICAgIGF2YXRhciA9IGNlbGxBY2wuVXNlci5BdHRyaWJ1dGVzW1wiYXZhdGFyXCJdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiZ3JvdXBcIjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNlbGxBY2wuR3JvdXAuQXR0cmlidXRlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBjZWxsQWNsLkdyb3VwLkF0dHJpYnV0ZXNbXCJkaXNwbGF5TmFtZVwiXSB8fCBjZWxsQWNsLkdyb3VwLkdyb3VwTGFiZWw7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IGNlbGxBY2wuR3JvdXAuVXVpZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwidGVhbVwiOlxuICAgICAgICAgICAgICAgICAgICBpZiAoY2VsbEFjbC5Sb2xlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IGNlbGxBY2wuUm9sZS5MYWJlbDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsID0gXCJObyByb2xlIGZvdW5kXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBjZWxsQWNsLlJvbGVJZDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcmVhZCA9IGZhbHNlLFxuICAgICAgICAgICAgICAgIHdyaXRlID0gZmFsc2U7XG4gICAgICAgICAgICBjZWxsQWNsLkFjdGlvbnMubWFwKGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoYWN0aW9uLk5hbWUgPT09ICdyZWFkJykge1xuICAgICAgICAgICAgICAgICAgICByZWFkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGFjdGlvbi5OYW1lID09PSAnd3JpdGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHdyaXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBkaXNhYmxlZCA9IHRoaXMucHJvcHMuaXNSZWFkb25seSgpIHx8IHRoaXMucHJvcHMucmVhZG9ubHk7XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxuICAgICAgICAgICAgICAgIHdpZHRoOiA3MFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmICghbWVudUl0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHN0eWxlID0gX2V4dGVuZHMoe30sIHN0eWxlLCB7IG1hcmdpblJpZ2h0OiA0OCB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX1VzZXJCYWRnZTJbJ2RlZmF1bHQnXSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgYXZhdGFyOiBhdmF0YXIsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICAgICAgICAgIG1lbnVzOiBtZW51SXRlbXNcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogc3R5bGUgfSxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5DaGVja2JveCwgeyBkaXNhYmxlZDogZGlzYWJsZWQsIGNoZWNrZWQ6IHJlYWQsIG9uQ2hlY2s6IGZ1bmN0aW9uIChlLCB2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLm9uVXBkYXRlUmlnaHQoJ3JlYWQnLCB2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gfSksXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2hlY2tib3gsIHsgZGlzYWJsZWQ6IGRpc2FibGVkLCBjaGVja2VkOiB3cml0ZSwgb25DaGVjazogZnVuY3Rpb24gKGUsIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIub25VcGRhdGVSaWdodCgnd3JpdGUnLCB2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0sIFt7XG4gICAgICAgIGtleTogJ3Byb3BUeXBlcycsXG4gICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICBjZWxsQWNsOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgICAgICAgICBzZW5kSW52aXRhdGlvbnM6IFByb3BUeXBlcy5mdW5jLFxuICAgICAgICAgICAgb25Vc2VyT2JqZWN0UmVtb3ZlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICAgICAgb25Vc2VyT2JqZWN0VXBkYXRlUmlnaHQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWRcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgIH1dKTtcblxuICAgIHJldHVybiBTaGFyZWRVc2VyRW50cnk7XG59KShSZWFjdC5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBTaGFyZWRVc2VyRW50cnkgPSAoMCwgX1NoYXJlQ29udGV4dENvbnN1bWVyMlsnZGVmYXVsdCddKShTaGFyZWRVc2VyRW50cnkpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gU2hhcmVkVXNlckVudHJ5O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyID0gcmVxdWlyZSgnLi4vU2hhcmVDb250ZXh0Q29uc3VtZXInKTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TaGFyZUNvbnRleHRDb25zdW1lcik7XG5cbnZhciBfU2hhcmVkVXNlckVudHJ5ID0gcmVxdWlyZSgnLi9TaGFyZWRVc2VyRW50cnknKTtcblxudmFyIF9TaGFyZWRVc2VyRW50cnkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU2hhcmVkVXNlckVudHJ5KTtcblxudmFyIF9tYWluQWN0aW9uQnV0dG9uID0gcmVxdWlyZSgnLi4vbWFpbi9BY3Rpb25CdXR0b24nKTtcblxudmFyIF9tYWluQWN0aW9uQnV0dG9uMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21haW5BY3Rpb25CdXR0b24pO1xuXG4vKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbnZhciBfcHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG52YXIgX3Byb3BUeXBlczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wcm9wVHlwZXMpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdjb21wb25lbnRzJyk7XG5cbnZhciBVc2Vyc0NvbXBsZXRlciA9IF9QeWRpbyRyZXF1aXJlTGliLlVzZXJzQ29tcGxldGVyO1xuXG52YXIgU2hhcmVkVXNlcnMgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoU2hhcmVkVXNlcnMsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gU2hhcmVkVXNlcnMoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFNoYXJlZFVzZXJzKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihTaGFyZWRVc2Vycy5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgIHRoaXMuc2VuZEludml0YXRpb25Ub0FsbFVzZXJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IF90aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIGNlbGxBY2xzID0gX3Byb3BzLmNlbGxBY2xzO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuXG4gICAgICAgICAgICB2YXIgdXNlck9iamVjdHMgPSBbXTtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGNlbGxBY2xzKS5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICB2YXIgYWNsID0gY2VsbEFjbHNba107XG4gICAgICAgICAgICAgICAgaWYgKGFjbC5Vc2VyICYmIGFjbC5Vc2VyLkxvZ2luID09PSBweWRpby51c2VyLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGFjbC5Vc2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1c2VyT2JqZWN0ID0gUHlkaW9Vc2Vycy5Vc2VyLmZyb21JZG1Vc2VyKGFjbC5Vc2VyKTtcbiAgICAgICAgICAgICAgICAgICAgdXNlck9iamVjdHNbdXNlck9iamVjdC5nZXRJZCgpXSA9IHVzZXJPYmplY3Q7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBfdGhpcy5wcm9wcy5zZW5kSW52aXRhdGlvbnModXNlck9iamVjdHMpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY2xlYXJBbGxVc2VycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKF90aGlzLnByb3BzLmNlbGxBY2xzKS5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5wcm9wcy5vblVzZXJPYmplY3RSZW1vdmUoayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnZhbHVlU2VsZWN0ZWQgPSBmdW5jdGlvbiAodXNlck9iamVjdCkge1xuICAgICAgICAgICAgaWYgKHVzZXJPYmplY3QuSWRtVXNlcikge1xuICAgICAgICAgICAgICAgIF90aGlzLnByb3BzLm9uVXNlck9iamVjdEFkZCh1c2VyT2JqZWN0LklkbVVzZXIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5wcm9wcy5vblVzZXJPYmplY3RBZGQodXNlck9iamVjdC5JZG1Sb2xlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoU2hhcmVkVXNlcnMsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIGNlbGxBY2xzID0gX3Byb3BzMi5jZWxsQWNscztcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wczIucHlkaW87XG5cbiAgICAgICAgICAgIHZhciBhdXRoQ29uZmlncyA9IHB5ZGlvLmdldFBsdWdpbkNvbmZpZ3MoJ2NvcmUuYXV0aCcpO1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgICAgIHZhciB1c2VyRW50cmllcyA9IFtdO1xuICAgICAgICAgICAgT2JqZWN0LmtleXMoY2VsbEFjbHMpLm1hcChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgICAgIHZhciBhY2wgPSBjZWxsQWNsc1trXTtcbiAgICAgICAgICAgICAgICBpZiAoYWNsLlVzZXIgJiYgYWNsLlVzZXIuTG9naW4gPT09IHB5ZGlvLnVzZXIuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgIHVzZXJFbnRyaWVzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX1NoYXJlZFVzZXJFbnRyeTJbJ2RlZmF1bHQnXSwge1xuICAgICAgICAgICAgICAgICAgICBjZWxsQWNsOiBhY2wsXG4gICAgICAgICAgICAgICAgICAgIGtleTogaW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBfdGhpczIucHJvcHMucHlkaW8sXG4gICAgICAgICAgICAgICAgICAgIHJlYWRvbmx5OiBfdGhpczIucHJvcHMucmVhZG9ubHksXG4gICAgICAgICAgICAgICAgICAgIHNlbmRJbnZpdGF0aW9uczogX3RoaXMyLnByb3BzLnNlbmRJbnZpdGF0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgb25Vc2VyT2JqZWN0UmVtb3ZlOiBfdGhpczIucHJvcHMub25Vc2VyT2JqZWN0UmVtb3ZlLFxuICAgICAgICAgICAgICAgICAgICBvblVzZXJPYmplY3RVcGRhdGVSaWdodDogX3RoaXMyLnByb3BzLm9uVXNlck9iamVjdFVwZGF0ZVJpZ2h0XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZhciBhY3Rpb25MaW5rcyA9IFtdO1xuICAgICAgICAgICAgdmFyIGFjbHNMZW5ndGggPSBPYmplY3Qua2V5cyh0aGlzLnByb3BzLmNlbGxBY2xzKS5sZW5ndGg7XG4gICAgICAgICAgICBpZiAoYWNsc0xlbmd0aCAmJiAhdGhpcy5wcm9wcy5pc1JlYWRvbmx5KCkgJiYgIXRoaXMucHJvcHMucmVhZG9ubHkpIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25MaW5rcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYWluQWN0aW9uQnV0dG9uMlsnZGVmYXVsdCddLCB7IGtleTogJ2NsZWFyJywgY2FsbGJhY2s6IHRoaXMuY2xlYXJBbGxVc2VycywgdG9vbHRpcFBvc2l0aW9uOiBcInRvcC1jZW50ZXJcIiwgbWRpSWNvbjogJ2RlbGV0ZScsIG1lc3NhZ2VJZDogJzE4MCcgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFjbHNMZW5ndGggJiYgdGhpcy5wcm9wcy5zZW5kSW52aXRhdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25MaW5rcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYWluQWN0aW9uQnV0dG9uMlsnZGVmYXVsdCddLCB7IGtleTogJ2ludml0ZScsIGNhbGxiYWNrOiB0aGlzLnNlbmRJbnZpdGF0aW9uVG9BbGxVc2VycywgdG9vbHRpcFBvc2l0aW9uOiBcInRvcC1jZW50ZXJcIiwgbWRpSWNvbjogJ2VtYWlsLW91dGxpbmUnLCBtZXNzYWdlSWQ6ICc0NScgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc2F2ZVNlbGVjdGlvbkFzVGVhbSAmJiBhY2xzTGVuZ3RoID4gMSAmJiAhdGhpcy5wcm9wcy5pc1JlYWRvbmx5KCkgJiYgIXRoaXMucHJvcHMucmVhZG9ubHkpIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25MaW5rcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYWluQWN0aW9uQnV0dG9uMlsnZGVmYXVsdCddLCB7IGtleTogJ3RlYW0nLCBjYWxsYmFjazogdGhpcy5wcm9wcy5zYXZlU2VsZWN0aW9uQXNUZWFtLCBtZGlJY29uOiAnYWNjb3VudC1tdWx0aXBsZS1wbHVzJywgdG9vbHRpcFBvc2l0aW9uOiBcInRvcC1jZW50ZXJcIiwgbWVzc2FnZUlkOiAnNTA5JywgbWVzc2FnZUNvcmVOYW1lc3BhY2U6IHRydWUgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHJ3SGVhZGVyID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHVzZXJzSW5wdXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAodXNlckVudHJpZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcndIZWFkZXIgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBtYXJnaW5Cb3R0b206IC04LCBtYXJnaW5Ub3A6IC04LCBjb2xvcjogJ3JnYmEoMCwwLDAsLjMzKScsIGZvbnRTaXplOiAxMiB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IHN0eWxlOiB7IGZsZXg6IDEgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6IDQzLCB0ZXh0QWxpZ246ICdjZW50ZXInIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGJvcmRlckJvdHRvbTogJzJweCBzb2xpZCByZ2JhKDAsMCwwLDAuMTMpJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCczNjEnLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6IDQzLCB0ZXh0QWxpZ246ICdjZW50ZXInIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGJvcmRlckJvdHRvbTogJzJweCBzb2xpZCByZ2JhKDAsMCwwLDAuMTMpJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcxODEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnZGl2JywgeyBzdHlsZTogeyB3aWR0aDogNTIgfSB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMucHJvcHMuaXNSZWFkb25seSgpICYmICF0aGlzLnByb3BzLnJlYWRvbmx5KSB7XG4gICAgICAgICAgICAgICAgdmFyIGV4Y2x1ZGVzID0gT2JqZWN0LnZhbHVlcyhjZWxsQWNscykubWFwKGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhLlVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhLlVzZXIuTG9naW47XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYS5Hcm91cCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGEuR3JvdXAuVXVpZDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhLlJvbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhLlJvbGUuVXVpZDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkuZmlsdGVyKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAhIWs7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdXNlcnNJbnB1dCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFVzZXJzQ29tcGxldGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ3NoYXJlLWZvcm0tdXNlcnMnLFxuICAgICAgICAgICAgICAgICAgICBmaWVsZExhYmVsOiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzM0JyksXG4gICAgICAgICAgICAgICAgICAgIG9uVmFsdWVTZWxlY3RlZDogdGhpcy52YWx1ZVNlbGVjdGVkLFxuICAgICAgICAgICAgICAgICAgICBweWRpbzogdGhpcy5wcm9wcy5weWRpbyxcbiAgICAgICAgICAgICAgICAgICAgc2hvd0FkZHJlc3NCb29rOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB1c2Vyc0Zyb206ICdsb2NhbCcsXG4gICAgICAgICAgICAgICAgICAgIGV4Y2x1ZGVzOiBleGNsdWRlcyxcbiAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdPbmx5OiAhYXV0aENvbmZpZ3MuZ2V0KCdVU0VSX0NSRUFURV9VU0VSUycpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogdXNlckVudHJpZXMubGVuZ3RoID8geyBtYXJnaW46ICctMjBweCA4cHggMTZweCcgfSA6IHsgbWFyZ2luVG9wOiAtMjAgfSB9LFxuICAgICAgICAgICAgICAgICAgICB1c2Vyc0lucHV0XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICByd0hlYWRlcixcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJFbnRyaWVzXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAhdXNlckVudHJpZXMubGVuZ3RoICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBjb2xvcjogJ3JnYmEoMCwwLDAsMC40MyknIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcxODInKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgdXNlckVudHJpZXMubGVuZ3RoID4gMCAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgdGV4dEFsaWduOiAnY2VudGVyJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbkxpbmtzXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dLCBbe1xuICAgICAgICBrZXk6ICdwcm9wVHlwZXMnLFxuICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgcHlkaW86IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uaW5zdGFuY2VPZihfcHlkaW8yWydkZWZhdWx0J10pLFxuXG4gICAgICAgICAgICBjZWxsQWNsczogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5vYmplY3QsXG5cbiAgICAgICAgICAgIHNhdmVTZWxlY3Rpb25Bc1RlYW06IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uZnVuYyxcbiAgICAgICAgICAgIHNlbmRJbnZpdGF0aW9uczogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5mdW5jLFxuICAgICAgICAgICAgc2hvd1RpdGxlOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLmJvb2wsXG5cbiAgICAgICAgICAgIG9uVXNlck9iamVjdEFkZDogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgICAgICBvblVzZXJPYmplY3RSZW1vdmU6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICAgICAgb25Vc2VyT2JqZWN0VXBkYXRlUmlnaHQ6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uZnVuYy5pc1JlcXVpcmVkXG5cbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgIH1dKTtcblxuICAgIHJldHVybiBTaGFyZWRVc2Vycztcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBTaGFyZWRVc2VycyA9ICgwLCBfU2hhcmVDb250ZXh0Q29uc3VtZXIyWydkZWZhdWx0J10pKFNoYXJlZFVzZXJzKTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFNoYXJlZFVzZXJzO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG4vKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBDb21wb25lbnQgPSBfcmVxdWlyZS5Db21wb25lbnQ7XG5cbnZhciBfcmVxdWlyZTIgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgTWVudUl0ZW0gPSBfcmVxdWlyZTIuTWVudUl0ZW07XG52YXIgSWNvbk1lbnUgPSBfcmVxdWlyZTIuSWNvbk1lbnU7XG52YXIgSWNvbkJ1dHRvbiA9IF9yZXF1aXJlMi5JY29uQnV0dG9uO1xuXG52YXIgX3JlcXVpcmUzID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWkvc3R5bGVzJyk7XG5cbnZhciBtdWlUaGVtZWFibGUgPSBfcmVxdWlyZTMubXVpVGhlbWVhYmxlO1xuXG52YXIgQ29sb3IgPSByZXF1aXJlKCdjb2xvcicpO1xuXG52YXIgVXNlckJhZGdlID0gKGZ1bmN0aW9uIChfQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFVzZXJCYWRnZSwgX0NvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBVc2VyQmFkZ2UoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBVc2VyQmFkZ2UpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFVzZXJCYWRnZS5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhVc2VyQmFkZ2UsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlck1lbnUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyTWVudSgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5wcm9wcy5tZW51cyB8fCAhdGhpcy5wcm9wcy5tZW51cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBtZW51SXRlbXMgPSB0aGlzLnByb3BzLm1lbnVzLm1hcChmdW5jdGlvbiAobSkge1xuICAgICAgICAgICAgICAgIHZhciByaWdodEljb24gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKG0uY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICByaWdodEljb24gPSBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdtZGkgbWRpLWNoZWNrJyB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTWVudUl0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeVRleHQ6IG0udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFRhcDogbS5jYWxsYmFjayxcbiAgICAgICAgICAgICAgICAgICAgcmlnaHRJY29uOiByaWdodEljb24gfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBpY29uU3R5bGUgPSB7IGZvbnRTaXplOiAxOCB9O1xuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgSWNvbk1lbnUsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpY29uQnV0dG9uRWxlbWVudDogUmVhY3QuY3JlYXRlRWxlbWVudChJY29uQnV0dG9uLCB7IHN0eWxlOiB7IHBhZGRpbmc6IDE2IH0sIGljb25TdHlsZTogaWNvblN0eWxlLCBpY29uQ2xhc3NOYW1lOiAnbWRpIG1kaS1kb3RzLXZlcnRpY2FsJyB9KSxcbiAgICAgICAgICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiB7IGhvcml6b250YWw6ICdyaWdodCcsIHZlcnRpY2FsOiAndG9wJyB9LFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRPcmlnaW46IHsgaG9yaXpvbnRhbDogJ3JpZ2h0JywgdmVydGljYWw6ICd0b3AnIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG1lbnVJdGVtc1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBhdmF0YXIgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgYXZhdGFyQ29sb3IgPSB0aGlzLnByb3BzLm11aVRoZW1lLnBhbGV0dGUuYXZhdGFyc0NvbG9yO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMudHlwZSA9PT0gJ2dyb3VwJykge1xuICAgICAgICAgICAgICAgIGF2YXRhckNvbG9yID0gQ29sb3IoYXZhdGFyQ29sb3IpLmRhcmtlbiguMikudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBhdmF0YXIgPSBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdhdmF0YXIgbWRpIG1kaS1hY2NvdW50LW11bHRpcGxlJywgc3R5bGU6IHsgYmFja2dyb3VuZENvbG9yOiBhdmF0YXJDb2xvciB9IH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnR5cGUgPT09ICd0ZWFtJykge1xuICAgICAgICAgICAgICAgIGF2YXRhckNvbG9yID0gQ29sb3IoYXZhdGFyQ29sb3IpLmRhcmtlbiguMikudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBhdmF0YXIgPSBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdhdmF0YXIgbWRpIG1kaS1hY2NvdW50LW11bHRpcGxlLW91dGxpbmUnLCBzdHlsZTogeyBiYWNrZ3JvdW5kQ29sb3I6IGF2YXRhckNvbG9yIH0gfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMudHlwZSA9PT0gJ3RlbXBvcmFyeScpIHtcbiAgICAgICAgICAgICAgICBhdmF0YXJDb2xvciA9IENvbG9yKGF2YXRhckNvbG9yKS5saWdodGVuKC4yKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIGF2YXRhciA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ2F2YXRhciBtZGkgbWRpLWFjY291bnQtcGx1cycsIHN0eWxlOiB7IGJhY2tncm91bmRDb2xvcjogYXZhdGFyQ29sb3IgfSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy50eXBlID09PSAncmVtb3RlX3VzZXInKSB7XG4gICAgICAgICAgICAgICAgYXZhdGFyID0gUmVhY3QuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnYXZhdGFyIG1kaSBtZGktYWNjb3VudC1uZXR3b3JrJywgc3R5bGU6IHsgYmFja2dyb3VuZENvbG9yOiBhdmF0YXJDb2xvciB9IH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhdmF0YXIgPSBSZWFjdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdhdmF0YXIgbWRpIG1kaS1hY2NvdW50Jywgc3R5bGU6IHsgYmFja2dyb3VuZENvbG9yOiBhdmF0YXJDb2xvciB9IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG1lbnUgPSB0aGlzLnJlbmRlck1lbnUoKTtcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcInNoYXJlLWRpYWxvZyB1c2VyLWJhZGdlIHVzZXItdHlwZS1cIiArIHRoaXMucHJvcHMudHlwZSB9LFxuICAgICAgICAgICAgICAgIGF2YXRhcixcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAndXNlci1iYWRnZS1sYWJlbCcgfSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5sYWJlbFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5jaGlsZHJlbixcbiAgICAgICAgICAgICAgICBtZW51XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFVzZXJCYWRnZTtcbn0pKENvbXBvbmVudCk7XG5cblVzZXJCYWRnZS5wcm9wVHlwZXMgPSB7XG4gICAgbGFiZWw6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgYXZhdGFyOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHR5cGU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgbWVudXM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgbXVpVGhlbWU6IFByb3BUeXBlcy5vYmplY3Rcbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFVzZXJCYWRnZSA9IG11aVRoZW1lYWJsZSgpKFVzZXJCYWRnZSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFVzZXJCYWRnZTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKFwicmVhY3RcIik7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3JlYWN0RG9tID0gcmVxdWlyZSgncmVhY3QtZG9tJyk7XG5cbnZhciBfcmVhY3REb20yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3REb20pO1xuXG52YXIgX0NvbXBvc2l0ZU1vZGVsID0gcmVxdWlyZSgnLi9Db21wb3NpdGVNb2RlbCcpO1xuXG52YXIgX0NvbXBvc2l0ZU1vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NvbXBvc2l0ZU1vZGVsKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIgPSByZXF1aXJlKCcuLi9tYWluL1NoYXJlSGVscGVyJyk7XG5cbnZhciBfbWFpblNoYXJlSGVscGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21haW5TaGFyZUhlbHBlcik7XG5cbnZhciBfY2VsbHNTaGFyZWRVc2VycyA9IHJlcXVpcmUoJy4uL2NlbGxzL1NoYXJlZFVzZXJzJyk7XG5cbnZhciBfY2VsbHNTaGFyZWRVc2VyczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jZWxsc1NoYXJlZFVzZXJzKTtcblxudmFyIF9wcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbnZhciBfcHJvcFR5cGVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3Byb3BUeXBlcyk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9tYXRlcmlhbFVpU3R5bGVzID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWkvc3R5bGVzJyk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBDZWxsc0xpc3QgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoQ2VsbHNMaXN0LCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIENlbGxzTGlzdChwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2VsbHNMaXN0KTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihDZWxsc0xpc3QucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7IGVkaXQ6IG51bGwgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoQ2VsbHNMaXN0LCBbe1xuICAgICAgICBrZXk6ICdhZGRUb0NlbGxzTWVudUl0ZW1zJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGFkZFRvQ2VsbHNNZW51SXRlbXMoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICAgICAgICAgIC8vIExpc3QgdXNlciBhdmFpbGFibGUgY2VsbHMgLSBFeGNsdWRlIGNlbGxzIHdoZXJlIHRoaXMgbm9kZSBpcyBhbHJlYWR5IHNoYXJlZFxuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMucHlkaW87XG4gICAgICAgICAgICB2YXIgY29tcG9zaXRlTW9kZWwgPSBfcHJvcHMuY29tcG9zaXRlTW9kZWw7XG5cbiAgICAgICAgICAgIHZhciBjdXJyZW50Q2VsbHMgPSBjb21wb3NpdGVNb2RlbC5nZXRDZWxscygpLm1hcChmdW5jdGlvbiAoY2VsbE1vZGVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNlbGxNb2RlbC5nZXRVdWlkKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHB5ZGlvLnVzZXIuZ2V0UmVwb3NpdG9yaWVzTGlzdCgpLmZvckVhY2goZnVuY3Rpb24gKHJlcG9zaXRvcnkpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVwb3NpdG9yeS5nZXRPd25lcigpID09PSAnc2hhcmVkJyAmJiBjdXJyZW50Q2VsbHMuaW5kZXhPZihyZXBvc2l0b3J5LmdldElkKCkpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdG91Y2hUYXAgPSBmdW5jdGlvbiB0b3VjaFRhcCgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgYWRkTWVudU9wZW46IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9zaXRlTW9kZWwuYWRkVG9FeGlzdGluZ0NlbGwocmVwb3NpdG9yeS5nZXRJZCgpKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaXRlbXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyBwcmltYXJ5VGV4dDogcmVwb3NpdG9yeS5nZXRMYWJlbCgpLCBvblRvdWNoVGFwOiB0b3VjaFRhcCwgbGVmdEljb246IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogXCJpY29tb29uLWNlbGxzXCIgfSkgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzLCBuZXh0Q29udGV4dCkge1xuICAgICAgICAgICAgdmFyIGVkaXQgPSB0aGlzLnN0YXRlLmVkaXQ7XG4gICAgICAgICAgICB2YXIgY29tcG9zaXRlTW9kZWwgPSBuZXh0UHJvcHMuY29tcG9zaXRlTW9kZWw7XG5cbiAgICAgICAgICAgIGlmIChlZGl0ID09PSAnTkVXQ0VMTCcgJiYgIWNvbXBvc2l0ZU1vZGVsLmlzRGlydHkoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlZGl0OiBudWxsIH0pO1xuICAgICAgICAgICAgICAgIGNvbXBvc2l0ZU1vZGVsLmdldENlbGxzKCkubWFwKGZ1bmN0aW9uIChjZWxsTW9kZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFjbHMgPSBjZWxsTW9kZWwuZ2V0QWNscygpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIU9iamVjdC5rZXlzKGFjbHMpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9zaXRlTW9kZWwucmVtb3ZlTmV3Q2VsbChjZWxsTW9kZWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIGNvbXBvc2l0ZU1vZGVsID0gX3Byb3BzMi5jb21wb3NpdGVNb2RlbDtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wczIucHlkaW87XG4gICAgICAgICAgICB2YXIgdXNlcnNJbnZpdGF0aW9ucyA9IF9wcm9wczIudXNlcnNJbnZpdGF0aW9ucztcbiAgICAgICAgICAgIHZhciBtdWlUaGVtZSA9IF9wcm9wczIubXVpVGhlbWU7XG5cbiAgICAgICAgICAgIHZhciBtID0gZnVuY3Rpb24gbShpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBweWRpby5NZXNzYWdlSGFzaFsnc2hhcmVfY2VudGVyLicgKyBpZF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIGVkaXQgPSB0aGlzLnN0YXRlLmVkaXQ7XG5cbiAgICAgICAgICAgIHZhciBjZWxscyA9IFtdO1xuICAgICAgICAgICAgY29tcG9zaXRlTW9kZWwuZ2V0Q2VsbHMoKS5tYXAoZnVuY3Rpb24gKGNlbGxNb2RlbCkge1xuICAgICAgICAgICAgICAgIHZhciBsYWJlbCA9IGNlbGxNb2RlbC5nZXRMYWJlbCgpO1xuICAgICAgICAgICAgICAgIHZhciBpc0VkaXQgPSAhY2VsbE1vZGVsLmdldFV1aWQoKSAmJiBlZGl0ID09PSAnTkVXQ0VMTCcgfHwgZWRpdCA9PT0gY2VsbE1vZGVsLmdldFV1aWQoKTtcbiAgICAgICAgICAgICAgICB2YXIgdG9nZ2xlU3RhdGUgPSBmdW5jdGlvbiB0b2dnbGVTdGF0ZSgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRWRpdCAmJiBlZGl0ID09PSAnTkVXQ0VMTCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBuZXcgY2VsbCBpZiBpdCB3YXMgY3JlYXRlZCBlbXB0eVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFjbHMgPSBjZWxsTW9kZWwuZ2V0QWNscygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFPYmplY3Qua2V5cyhhY2xzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb3NpdGVNb2RlbC5yZW1vdmVOZXdDZWxsKGNlbGxNb2RlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgZWRpdDogaXNFZGl0ID8gbnVsbCA6IGNlbGxNb2RlbC5nZXRVdWlkKCkgfSk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHZhciByZW1vdmVOb2RlID0gZnVuY3Rpb24gcmVtb3ZlTm9kZSgpIHtcbiAgICAgICAgICAgICAgICAgICAgY2VsbE1vZGVsLnJlbW92ZVJvb3ROb2RlKGNvbXBvc2l0ZU1vZGVsLmdldE5vZGUoKS5nZXRNZXRhZGF0YSgpLmdldCgndXVpZCcpKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHZhciByaWdodEljb24gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKGlzRWRpdCkge1xuICAgICAgICAgICAgICAgICAgICByaWdodEljb24gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1jbG9zZVwiLCB0b29sdGlwOiBweWRpby5NZXNzYWdlSGFzaFsnODYnXSwgb25Ub3VjaFRhcDogdG9nZ2xlU3RhdGUgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjZWxsTW9kZWwuaXNFZGl0YWJsZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0SWNvbiA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuSWNvbk1lbnUsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkJ1dHRvbkVsZW1lbnQ6IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgaWNvbkNsYXNzTmFtZTogXCJtZGkgbWRpLWRvdHMtdmVydGljYWxcIiB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmNob3JPcmlnaW46IHsgaG9yaXpvbnRhbDogJ3JpZ2h0JywgdmVydGljYWw6ICd0b3AnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0T3JpZ2luOiB7IGhvcml6b250YWw6ICdyaWdodCcsIHZlcnRpY2FsOiAndG9wJyB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgcHJpbWFyeVRleHQ6IG0oMjU4KSwgb25Ub3VjaFRhcDogdG9nZ2xlU3RhdGUgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyBwcmltYXJ5VGV4dDogbSgyNTkpLCBvblRvdWNoVGFwOiByZW1vdmVOb2RlIH0pXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNlbGxzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTGlzdEl0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeVRleHQ6IGxhYmVsLFxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlUZXh0OiBjZWxsTW9kZWwuZ2V0QWNsc1N1YmplY3RzKCksXG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0SWNvbkJ1dHRvbjogcmlnaHRJY29uLFxuICAgICAgICAgICAgICAgICAgICBvblRvdWNoVGFwOiB0b2dnbGVTdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IGlzRWRpdCA/IHsgYmFja2dyb3VuZENvbG9yOiAncmdiKDI0NSwgMjQ1LCAyNDUpJyB9IDoge30sXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBlZGl0ID09PSAnTkVXQ0VMTCcgJiYgIWlzRWRpdFxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNFZGl0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNlbGxzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5QYXBlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgekRlcHRoOiAwLCBzdHlsZTogeyBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2IoMjQ1LCAyNDUsIDI0NSknLCBtYXJnaW46ICcwIDAgMTZweCcsIHBhZGRpbmc6ICcwIDEwcHggMTBweCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX2NlbGxzU2hhcmVkVXNlcnMyWydkZWZhdWx0J10sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VsbEFjbHM6IGNlbGxNb2RlbC5nZXRBY2xzKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhjbHVkZXM6IFtweWRpby51c2VyLmlkXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVzZXJPYmplY3RBZGQ6IGNlbGxNb2RlbC5hZGRVc2VyLmJpbmQoY2VsbE1vZGVsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVzZXJPYmplY3RSZW1vdmU6IGNlbGxNb2RlbC5yZW1vdmVVc2VyLmJpbmQoY2VsbE1vZGVsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVzZXJPYmplY3RVcGRhdGVSaWdodDogY2VsbE1vZGVsLnVwZGF0ZVVzZXJSaWdodC5iaW5kKGNlbGxNb2RlbCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VuZEludml0YXRpb25zOiBmdW5jdGlvbiAodGFyZ2V0VXNlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVzZXJzSW52aXRhdGlvbnModGFyZ2V0VXNlcnMsIGNlbGxNb2RlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzYXZlU2VsZWN0aW9uQXNUZWFtOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFkb25seTogIWNlbGxNb2RlbC5pc0VkaXRhYmxlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjZWxscy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIG51bGwpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2VsbHMucG9wKCk7XG5cbiAgICAgICAgICAgIHZhciBsZWdlbmQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAoY2VsbHMubGVuZ3RoICYmIGVkaXQgIT09ICdORVdDRUxMJykge1xuICAgICAgICAgICAgICAgIGxlZ2VuZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgbSgyNjApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2VsbHMubGVuZ3RoICYmIGVkaXQgPT09ICdORVdDRUxMJykge1xuICAgICAgICAgICAgICAgIGxlZ2VuZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgbSgyNjEpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGVnZW5kID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmc6ICcyMXB4IDE2cHggMjFweCAwcHgnLCBjdXJzb3I6ICdwb2ludGVyJywgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJyB9LCBvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9zaXRlTW9kZWwuY3JlYXRlRW1wdHlDZWxsKCk7X3RoaXMyLnNldFN0YXRlKHsgZWRpdDogJ05FV0NFTEwnIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IGljb25DbGFzc05hbWU6IFwiaWNvbW9vbi1jZWxscy1jbGVhci1wbHVzXCIsIGljb25TdHlsZTogeyBjb2xvcjogbXVpVGhlbWUucGFsZXR0ZS5wcmltYXJ5MUNvbG9yIH0gfSksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmbGV4OiAxLCBtYXJnaW5MZWZ0OiA4IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oMjYyKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGFkZENlbGxJdGVtcyA9IHRoaXMuYWRkVG9DZWxsc01lbnVJdGVtcygpO1xuICAgICAgICAgICAgdmFyIGFkZFRvQ2VsbE1lbnUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAoYWRkQ2VsbEl0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGFkZFRvQ2VsbE1lbnUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWlzZWRCdXR0b24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogXCJhZGRDZWxsQnV0dG9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBtYXJnaW5MZWZ0OiAxMCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBtKDI2MyksXG4gICAgICAgICAgICAgICAgICAgICAgICBvblRvdWNoVGFwOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBhZGRNZW51T3BlbjogdHJ1ZSwgYWRkTWVudUFuY2hvcjogX3JlYWN0RG9tMlsnZGVmYXVsdCddLmZpbmRET01Ob2RlKF90aGlzMi5yZWZzWydhZGRDZWxsQnV0dG9uJ10pIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5Qb3BvdmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46IHRoaXMuc3RhdGUuYWRkTWVudU9wZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5jaG9yRWw6IHRoaXMuc3RhdGUuYWRkTWVudUFuY2hvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblJlcXVlc3RDbG9zZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBhZGRNZW51T3BlbjogZmFsc2UgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmNob3JPcmlnaW46IHsgaG9yaXpvbnRhbDogJ2xlZnQnLCB2ZXJ0aWNhbDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRPcmlnaW46IHsgaG9yaXpvbnRhbDogJ2xlZnQnLCB2ZXJ0aWNhbDogJ3RvcCcgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLk1lbnUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRDZWxsSXRlbXNcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBhdXRoID0gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5nZXRBdXRob3JpemF0aW9ucygpO1xuICAgICAgICAgICAgaWYgKGNvbXBvc2l0ZU1vZGVsLmdldE5vZGUoKSkge1xuICAgICAgICAgICAgICAgIHZhciBub2RlTGVhZiA9IGNvbXBvc2l0ZU1vZGVsLmdldE5vZGUoKS5pc0xlYWYoKTtcbiAgICAgICAgICAgICAgICB2YXIgY2FuU2hhcmUgPSBub2RlTGVhZiAmJiBhdXRoLmZpbGVfd29ya3NwYWNlcyB8fCAhbm9kZUxlYWYgJiYgYXV0aC5mb2xkZXJfd29ya3NwYWNlcztcbiAgICAgICAgICAgICAgICBpZiAoIWNhblNoYXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmb250U2l6ZTogMTMsIGZvbnRXZWlnaHQ6IDUwMCwgY29sb3I6ICdyZ2JhKDAsIDAsIDAsIDAuNDMpJywgcGFkZGluZzogOCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtKG5vZGVMZWFmID8gJzIyNycgOiAnMjI4JylcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB0aGlzLnByb3BzLnN0eWxlIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmdCb3R0b206IDIwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuUmFpc2VkQnV0dG9uLCB7IGxhYmVsOiBtKDI2NCksIGRpc2FibGVkOiBlZGl0ID09PSAnTkVXQ0VMTCcsIHByaW1hcnk6IHRydWUsIG9uVG91Y2hUYXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb3NpdGVNb2RlbC5jcmVhdGVFbXB0eUNlbGwoKTtfdGhpczIuc2V0U3RhdGUoeyBlZGl0OiAnTkVXQ0VMTCcgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IH0pLFxuICAgICAgICAgICAgICAgICAgICBhZGRUb0NlbGxNZW51XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZm9udFNpemU6IDEzLCBmb250V2VpZ2h0OiA1MDAsIGNvbG9yOiAncmdiYSgwLCAwLCAwLCAwLjQzKScgfSB9LFxuICAgICAgICAgICAgICAgICAgICBsZWdlbmRcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5MaXN0LFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBjZWxsc1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQ2VsbHNMaXN0O1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbkNlbGxzTGlzdC5Qcm9wVHlwZXMgPSB7XG4gICAgcHlkaW86IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uaW5zdGFuY2VPZihfcHlkaW8yWydkZWZhdWx0J10pLFxuICAgIGNvbXBvc2l0ZU1vZGVsOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLmluc3RhbmNlT2YoX0NvbXBvc2l0ZU1vZGVsMlsnZGVmYXVsdCddKS5pc1JlcXVpcmVkLFxuICAgIHVzZXJzSW52aXRhdGlvbnM6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uZnVuY1xufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ2VsbHNMaXN0ID0gKDAsIF9tYXRlcmlhbFVpU3R5bGVzLm11aVRoZW1lYWJsZSkoKShDZWxsc0xpc3QpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBDZWxsc0xpc3Q7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDIwIENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9jb21wb3NpdGVDb21wb3NpdGVNb2RlbCA9IHJlcXVpcmUoJy4uL2NvbXBvc2l0ZS9Db21wb3NpdGVNb2RlbCcpO1xuXG52YXIgX2NvbXBvc2l0ZUNvbXBvc2l0ZU1vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbXBvc2l0ZUNvbXBvc2l0ZU1vZGVsKTtcblxudmFyIF9tYWluR2VuZXJpY0VkaXRvciA9IHJlcXVpcmUoJy4uL21haW4vR2VuZXJpY0VkaXRvcicpO1xuXG52YXIgX21haW5HZW5lcmljRWRpdG9yMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21haW5HZW5lcmljRWRpdG9yKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX2xpbmtzUGFuZWwgPSByZXF1aXJlKCcuLi9saW5rcy9QYW5lbCcpO1xuXG52YXIgX2xpbmtzUGFuZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbGlua3NQYW5lbCk7XG5cbnZhciBfbGlua3NTZWN1cmVPcHRpb25zID0gcmVxdWlyZSgnLi4vbGlua3MvU2VjdXJlT3B0aW9ucycpO1xuXG52YXIgX2xpbmtzU2VjdXJlT3B0aW9uczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9saW5rc1NlY3VyZU9wdGlvbnMpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlciA9IHJlcXVpcmUoJy4uL21haW4vU2hhcmVIZWxwZXInKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9NYWlsZXIgPSByZXF1aXJlKCcuL01haWxlcicpO1xuXG52YXIgX01haWxlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9NYWlsZXIpO1xuXG52YXIgX0NlbGxzTGlzdCA9IHJlcXVpcmUoJy4vQ2VsbHNMaXN0Jyk7XG5cbnZhciBfQ2VsbHNMaXN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NlbGxzTGlzdCk7XG5cbnZhciBfY2xpcGJvYXJkID0gcmVxdWlyZSgnY2xpcGJvYXJkJyk7XG5cbnZhciBfY2xpcGJvYXJkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NsaXBib2FyZCk7XG5cbnZhciBfbGlua3NQdWJsaWNMaW5rVGVtcGxhdGUgPSByZXF1aXJlKCcuLi9saW5rcy9QdWJsaWNMaW5rVGVtcGxhdGUnKTtcblxudmFyIF9saW5rc1B1YmxpY0xpbmtUZW1wbGF0ZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9saW5rc1B1YmxpY0xpbmtUZW1wbGF0ZSk7XG5cbnZhciBfbGlua3NWaXNpYmlsaXR5UGFuZWwgPSByZXF1aXJlKCcuLi9saW5rcy9WaXNpYmlsaXR5UGFuZWwnKTtcblxudmFyIF9saW5rc1Zpc2liaWxpdHlQYW5lbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9saW5rc1Zpc2liaWxpdHlQYW5lbCk7XG5cbnZhciBfbGlua3NMYWJlbFBhbmVsID0gcmVxdWlyZSgnLi4vbGlua3MvTGFiZWxQYW5lbCcpO1xuXG52YXIgX2xpbmtzTGFiZWxQYW5lbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9saW5rc0xhYmVsUGFuZWwpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignaG9jJyk7XG5cbnZhciBQYWxldHRlTW9kaWZpZXIgPSBfUHlkaW8kcmVxdWlyZUxpYi5QYWxldHRlTW9kaWZpZXI7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYjIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYihcImJvb3RcIik7XG5cbnZhciBUb29sdGlwID0gX1B5ZGlvJHJlcXVpcmVMaWIyLlRvb2x0aXA7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYjMgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignY29tcG9uZW50cycpO1xuXG52YXIgR2VuZXJpY0NhcmQgPSBfUHlkaW8kcmVxdWlyZUxpYjMuR2VuZXJpY0NhcmQ7XG52YXIgR2VuZXJpY0xpbmUgPSBfUHlkaW8kcmVxdWlyZUxpYjMuR2VuZXJpY0xpbmU7XG5cbnZhciBDb21wb3NpdGVDYXJkID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKENvbXBvc2l0ZUNhcmQsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gQ29tcG9zaXRlQ2FyZChwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ29tcG9zaXRlQ2FyZCk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoQ29tcG9zaXRlQ2FyZC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIG1vZGU6IHRoaXMucHJvcHMubW9kZSB8fCAndmlldycsXG4gICAgICAgICAgICBtb2RlbDogbmV3IF9jb21wb3NpdGVDb21wb3NpdGVNb2RlbDJbJ2RlZmF1bHQnXSh0aGlzLnByb3BzLm1vZGUgPT09ICdlZGl0JylcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoQ29tcG9zaXRlQ2FyZCwgW3tcbiAgICAgICAga2V5OiAnY29uZmlybUFuZERpc21pc3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29uZmlybUFuZERpc21pc3MoKSB7XG4gICAgICAgICAgICB2YXIgbW9kZWwgPSB0aGlzLnN0YXRlLm1vZGVsO1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMucHlkaW87XG4gICAgICAgICAgICB2YXIgb25EaXNtaXNzID0gX3Byb3BzLm9uRGlzbWlzcztcblxuICAgICAgICAgICAgaWYgKCFtb2RlbC5pc0RpcnR5KCkgfHwgY29uZmlybShweWRpby5NZXNzYWdlSGFzaFsnc2hhcmVfY2VudGVyLmRpYWxvZy5jbG9zZS5jb25maXJtLnVuc2F2ZWQnXSkpIHtcbiAgICAgICAgICAgICAgICBvbkRpc21pc3MoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnYXR0YWNoQ2xpcGJvYXJkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGF0dGFjaENsaXBib2FyZCgpIHtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IHRoaXMucHJvcHMucHlkaW87XG5cbiAgICAgICAgICAgIHZhciBtID0gZnVuY3Rpb24gbShpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBweWRpby5NZXNzYWdlSGFzaFsnc2hhcmVfY2VudGVyLicgKyBpZF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIG1vZGVsID0gdGhpcy5zdGF0ZS5tb2RlbDtcblxuICAgICAgICAgICAgdGhpcy5kZXRhY2hDbGlwYm9hcmQoKTtcbiAgICAgICAgICAgIGlmICghbW9kZWwuZ2V0TGlua3MoKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbGlua01vZGVsID0gbW9kZWwuZ2V0TGlua3MoKVswXTtcbiAgICAgICAgICAgIGlmICghbGlua01vZGVsLmdldExpbmsoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnJlZnNbJ2NvcHktYnV0dG9uJ10pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGlwID0gbmV3IF9jbGlwYm9hcmQyWydkZWZhdWx0J10odGhpcy5yZWZzWydjb3B5LWJ1dHRvbiddLCB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IChmdW5jdGlvbiAodHJpZ2dlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uYnVpbGRQdWJsaWNVcmwocHlkaW8sIGxpbmtNb2RlbC5nZXRMaW5rKCkpO1xuICAgICAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2xpcC5vbignc3VjY2VzcycsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvcHlNZXNzYWdlOiBtKCcxOTInKSB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGNvcHlNZXNzYWdlOiBudWxsIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMjUwMCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2NsaXAub24oJ2Vycm9yJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvcHlNZXNzYWdlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZ2xvYmFsLm5hdmlnYXRvci5wbGF0Zm9ybS5pbmRleE9mKFwiTWFjXCIpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3B5TWVzc2FnZSA9IG0oMTQ0KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcHlNZXNzYWdlID0gbSgxNDMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb3B5TWVzc2FnZTogY29weU1lc3NhZ2UgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgY29weU1lc3NhZ2U6IG51bGwgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAyNTAwKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2RldGFjaENsaXBib2FyZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBkZXRhY2hDbGlwYm9hcmQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fY2xpcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NsaXAuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IF9wcm9wczIubm9kZTtcbiAgICAgICAgICAgIHZhciBtb2RlID0gX3Byb3BzMi5tb2RlO1xuXG4gICAgICAgICAgICB0aGlzLnN0YXRlLm1vZGVsLm9ic2VydmUoXCJ1cGRhdGVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzMy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLm1vZGVsLmxvYWQobm9kZSwgbW9kZSA9PT0gJ2luZm9QYW5lbCcpO1xuICAgICAgICAgICAgdGhpcy5hdHRhY2hDbGlwYm9hcmQoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFVubW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLm1vZGVsLnN0b3BPYnNlcnZpbmcoXCJ1cGRhdGVcIik7XG4gICAgICAgICAgICB0aGlzLmRldGFjaENsaXBib2FyZCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnREaWRVcGRhdGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgICAgICAgICAgdGhpcy5hdHRhY2hDbGlwYm9hcmQoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKHByb3BzKSB7XG4gICAgICAgICAgICBpZiAocHJvcHMubm9kZSAmJiAocHJvcHMubm9kZSAhPT0gdGhpcy5wcm9wcy5ub2RlIHx8IHByb3BzLm5vZGUuZ2V0TWV0YWRhdGEoJ3B5ZGlvX3NoYXJlcycpICE9PSB0aGlzLnByb3BzLm5vZGUuZ2V0TWV0YWRhdGEoJ3B5ZGlvX3NoYXJlcycpKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUubW9kZWwubG9hZChwcm9wcy5ub2RlLCBwcm9wcy5tb2RlID09PSAnaW5mb1BhbmVsJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3VzZXJzSW52aXRhdGlvbnMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXNlcnNJbnZpdGF0aW9ucyh1c2VyT2JqZWN0cywgY2VsbE1vZGVsKSB7XG4gICAgICAgICAgICBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLnNlbmRDZWxsSW52aXRhdGlvbih0aGlzLnByb3BzLm5vZGUsIGNlbGxNb2RlbCwgdXNlck9iamVjdHMpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdsaW5rSW52aXRhdGlvbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBsaW5rSW52aXRhdGlvbihsaW5rTW9kZWwpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIG1haWxEYXRhID0gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5wcmVwYXJlRW1haWwodGhpcy5wcm9wcy5ub2RlLCBsaW5rTW9kZWwpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtYWlsZXJEYXRhOiBfZXh0ZW5kcyh7fSwgbWFpbERhdGEsIHsgdXNlcnM6IFtdLCBsaW5rTW9kZWw6IGxpbmtNb2RlbCB9KSB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBhbGVydChlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdkaXNtaXNzTWFpbGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRpc21pc3NNYWlsZXIoKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbWFpbGVyRGF0YTogbnVsbCB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc3VibWl0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5tb2RlbC5zYXZlKCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5weWRpby5VSS5kaXNwbGF5TWVzc2FnZSgnRVJST1InLCBlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfcHJvcHMzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBub2RlID0gX3Byb3BzMy5ub2RlO1xuICAgICAgICAgICAgdmFyIG1vZGUgPSBfcHJvcHMzLm1vZGU7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMzLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIGVkaXRvck9uZUNvbHVtbiA9IF9wcm9wczMuZWRpdG9yT25lQ29sdW1uO1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgbW9kZWwgPSBfc3RhdGUubW9kZWw7XG4gICAgICAgICAgICB2YXIgbWFpbGVyRGF0YSA9IF9zdGF0ZS5tYWlsZXJEYXRhO1xuICAgICAgICAgICAgdmFyIGxpbmtUb29sdGlwID0gX3N0YXRlLmxpbmtUb29sdGlwO1xuICAgICAgICAgICAgdmFyIGNvcHlNZXNzYWdlID0gX3N0YXRlLmNvcHlNZXNzYWdlO1xuXG4gICAgICAgICAgICB2YXIgbSA9IGZ1bmN0aW9uIG0oaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci4nICsgaWRdO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKG1vZGUgPT09ICdlZGl0Jykge1xuXG4gICAgICAgICAgICAgICAgdmFyIHB1YmxpY0xpbmtNb2RlbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBpZiAobW9kZWwuZ2V0TGlua3MoKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHVibGljTGlua01vZGVsID0gbW9kZWwuZ2V0TGlua3MoKVswXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGhlYWRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBpZiAocHVibGljTGlua01vZGVsICYmIHB1YmxpY0xpbmtNb2RlbC5nZXRMaW5rVXVpZCgpICYmIHB1YmxpY0xpbmtNb2RlbC5pc0VkaXRhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfTWFpbGVyMlsnZGVmYXVsdCddLCBfZXh0ZW5kcyh7fSwgbWFpbGVyRGF0YSwgeyBweWRpbzogcHlkaW8sIG9uRGlzbWlzczogdGhpcy5kaXNtaXNzTWFpbGVyLmJpbmQodGhpcykgfSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX2xpbmtzTGFiZWxQYW5lbDJbJ2RlZmF1bHQnXSwgeyBweWRpbzogcHlkaW8sIGxpbmtNb2RlbDogcHVibGljTGlua01vZGVsIH0pXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZm9udFNpemU6IDI0LCBwYWRkaW5nOiAnMjZweCAxMHB4IDAgJywgbGluZUhlaWdodDogJzI2cHgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9NYWlsZXIyWydkZWZhdWx0J10sIF9leHRlbmRzKHt9LCBtYWlsZXJEYXRhLCB7IHB5ZGlvOiBweWRpbywgb25EaXNtaXNzOiB0aGlzLmRpc21pc3NNYWlsZXIuYmluZCh0aGlzKSB9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKDI1NikucmVwbGFjZSgnJXMnLCBub2RlLmdldExhYmVsKCkpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciB0YWJzID0geyBsZWZ0OiBbXSwgcmlnaHQ6IFtdLCBsZWZ0U3R5bGU6IHsgcGFkZGluZzogMCB9IH07XG4gICAgICAgICAgICAgICAgdGFicy5yaWdodC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgTGFiZWw6IG0oMjUwKSxcbiAgICAgICAgICAgICAgICAgICAgVmFsdWU6IFwiY2VsbHNcIixcbiAgICAgICAgICAgICAgICAgICAgQ29tcG9uZW50OiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfQ2VsbHNMaXN0MlsnZGVmYXVsdCddLCB7IHB5ZGlvOiBweWRpbywgY29tcG9zaXRlTW9kZWw6IG1vZGVsLCB1c2Vyc0ludml0YXRpb25zOiB0aGlzLnVzZXJzSW52aXRhdGlvbnMuYmluZCh0aGlzKSwgc3R5bGU6IGVkaXRvck9uZUNvbHVtbiA/IHsgcGFkZGluZzogMTAgfSA6IHt9IH0pXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdmFyIGxpbmtzID0gbW9kZWwuZ2V0TGlua3MoKTtcbiAgICAgICAgICAgICAgICBpZiAocHVibGljTGlua01vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhYnMubGVmdC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIExhYmVsOiBtKDI1MSksXG4gICAgICAgICAgICAgICAgICAgICAgICBWYWx1ZTogJ3B1YmxpYy1saW5rJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIENvbXBvbmVudDogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX2xpbmtzUGFuZWwyWydkZWZhdWx0J10sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9zaXRlTW9kZWw6IG1vZGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtNb2RlbDogbGlua3NbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd01haWxlcjogX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5tYWlsZXJTdXBwb3J0ZWQocHlkaW8pID8gdGhpcy5saW5rSW52aXRhdGlvbi5iaW5kKHRoaXMpIDogbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwdWJsaWNMaW5rTW9kZWwuZ2V0TGlua1V1aWQoKSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGF5b3V0RGF0YSA9IF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uY29tcGlsZUxheW91dERhdGEocHlkaW8sIG1vZGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0ZW1wbGF0ZVBhbmUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobGF5b3V0RGF0YS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVQYW5lID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX2xpbmtzUHVibGljTGlua1RlbXBsYXRlMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtNb2RlbDogcHVibGljTGlua01vZGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dERhdGE6IGxheW91dERhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IHBhZGRpbmc6ICcxMHB4IDE2cHgnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRvbmx5OiBtb2RlbC5nZXROb2RlKCkuaXNMZWFmKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRhYnMubGVmdC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBMYWJlbDogbSgyNTIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZhbHVlOiAnbGluay1zZWN1cmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbXBvbmVudDogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbGlua3NTZWN1cmVPcHRpb25zMlsnZGVmYXVsdCddLCB7IHB5ZGlvOiBweWRpbywgbGlua01vZGVsOiBsaW5rc1swXSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVQYW5lICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIG51bGwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVBhbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsaW5rc1swXS5pc0VkaXRhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJzLmxlZnQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIExhYmVsOiBtKDI1MyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZhbHVlOiAnbGluay12aXNpYmlsaXR5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ29tcG9uZW50OiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbGlua3NWaXNpYmlsaXR5UGFuZWwyWydkZWZhdWx0J10sIHsgcHlkaW86IHB5ZGlvLCBsaW5rTW9kZWw6IGxpbmtzWzBdIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBbHdheXNMYXN0OiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21haW5HZW5lcmljRWRpdG9yMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgICAgIHRhYnM6IHRhYnMsXG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyOiBoZWFkZXIsXG4gICAgICAgICAgICAgICAgICAgIHNhdmVFbmFibGVkOiBtb2RlbC5pc0RpcnR5KCksXG4gICAgICAgICAgICAgICAgICAgIG9uU2F2ZUFjdGlvbjogdGhpcy5zdWJtaXQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgb25DbG9zZUFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzNC5jb25maXJtQW5kRGlzbWlzcygpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBvblJldmVydEFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWwucmV2ZXJ0Q2hhbmdlcygpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBlZGl0b3JPbmVDb2x1bW46IGVkaXRvck9uZUNvbHVtbixcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiBudWxsLCBmbGV4OiAxLCBtaW5IZWlnaHQ6IDU1MCwgY29sb3I6ICdyZ2JhKDAsMCwwLC44MyknLCBmb250U2l6ZTogMTMgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgX3JldCA9IChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGxpbmVzID0gW107XG4gICAgICAgICAgICAgICAgICAgIHZhciBjZWxscyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBtb2RlbC5nZXRDZWxscygpLm1hcChmdW5jdGlvbiAoY2VsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2VsbHMucHVzaChjZWxsLmdldExhYmVsKCkpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNlbGxzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChHZW5lcmljTGluZSwgeyBpY29uQ2xhc3NOYW1lOiAnbWRpIG1kaS1hY2NvdW50LW11bHRpcGxlJywgbGVnZW5kOiBtKDI1NCksIGRhdGE6IGNlbGxzLmpvaW4oJywgJykgfSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBsaW5rcyA9IG1vZGVsLmdldExpbmtzKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsaW5rcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsbiA9IGxpbmtzWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxuLmhhc0Vycm9yKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXJyID0gbG4uaGFzRXJyb3IoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEdlbmVyaWNMaW5lLCB7IGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1hbGVydC1vdXRsaW5lXCIsIGxlZ2VuZDogXCJFcnJvclwiLCBkYXRhOiBlcnIuRGV0YWlsIHx8IGVyci5Nc2cgfHwgZXJyIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobG4uZ2V0TGluaygpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHB1YmxpY0xpbmsgPSBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLmJ1aWxkUHVibGljVXJsKHB5ZGlvLCBsbi5nZXRMaW5rKCksIG1vZGUgPT09ICdpbmZvUGFuZWwnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEdlbmVyaWNMaW5lLCB7IGljb25DbGFzc05hbWU6ICdtZGkgbWRpLWxpbmsnLCBsZWdlbmQ6IG0oMTIxKSwgc3R5bGU6IHsgb3ZlcmZsb3c6ICd2aXNpYmxlJyB9LCBkYXRhU3R5bGU6IHsgb3ZlcmZsb3c6ICd2aXNpYmxlJyB9LCBkYXRhOiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogJ2NvcHktYnV0dG9uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgcG9zaXRpb246ICdyZWxhdGl2ZScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlT3ZlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczQuc2V0U3RhdGUoeyBsaW5rVG9vbHRpcDogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VPdXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXM0LnNldFN0YXRlKHsgbGlua1Rvb2x0aXA6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChUb29sdGlwLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGNvcHlNZXNzYWdlID8gY29weU1lc3NhZ2UgOiBtKDE5MSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9yaXpvbnRhbFBvc2l0aW9uOiBcImxlZnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNhbFBvc2l0aW9uOiBcInRvcFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3c6IGxpbmtUb29sdGlwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1YmxpY0xpbmtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlbGV0ZUFjdGlvbiA9IGZ1bmN0aW9uIGRlbGV0ZUFjdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25maXJtKG0oMjU1KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RlbC5zdG9wT2JzZXJ2aW5nKCd1cGRhdGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RlbC5kZWxldGVBbGwoKS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWwudXBkYXRlVW5kZXJseWluZ05vZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHY6IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdlbmVyaWNDYXJkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW86IHB5ZGlvLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogcHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci41MCddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkRpc21pc3NBY3Rpb246IF90aGlzNC5wcm9wcy5vbkRpc21pc3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRGVsZXRlQWN0aW9uOiBkZWxldGVBY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRWRpdEFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW8uQ29udHJvbGxlci5maXJlQWN0aW9uKCdzaGFyZS1lZGl0LXNoYXJlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJTbWFsbDogbW9kZSA9PT0gJ2luZm9QYW5lbCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVzXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSkoKTtcblxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgX3JldCA9PT0gJ29iamVjdCcpIHJldHVybiBfcmV0LnY7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQ29tcG9zaXRlQ2FyZDtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBDb21wb3NpdGVDYXJkID0gUGFsZXR0ZU1vZGlmaWVyKHsgcHJpbWFyeTFDb2xvcjogJyMwMDk2ODgnIH0pKENvbXBvc2l0ZUNhcmQpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gQ29tcG9zaXRlQ2FyZDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfQ29tcG9zaXRlQ2FyZCA9IHJlcXVpcmUoJy4vQ29tcG9zaXRlQ2FyZCcpO1xuXG52YXIgX0NvbXBvc2l0ZUNhcmQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfQ29tcG9zaXRlQ2FyZCk7XG5cbnZhciBfcHlkaW9Nb2RlbERhdGFNb2RlbCA9IHJlcXVpcmUoJ3B5ZGlvL21vZGVsL2RhdGEtbW9kZWwnKTtcblxudmFyIF9weWRpb01vZGVsRGF0YU1vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvTW9kZWxEYXRhTW9kZWwpO1xuXG4vKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbnZhciBfcHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG52YXIgX3Byb3BUeXBlczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wcm9wVHlwZXMpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgY3JlYXRlUmVhY3RDbGFzcyA9IHJlcXVpcmUoJ2NyZWF0ZS1yZWFjdC1jbGFzcycpO1xuXG52YXIgX3JlcXVpcmUkcmVxdWlyZUxpYiA9IHJlcXVpcmUoJ3B5ZGlvJykucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgQWN0aW9uRGlhbG9nTWl4aW4gPSBfcmVxdWlyZSRyZXF1aXJlTGliLkFjdGlvbkRpYWxvZ01peGluO1xuXG52YXIgQ29tcG9zaXRlRGlhbG9nID0gY3JlYXRlUmVhY3RDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdDb21wb3NpdGVEaWFsb2cnLFxuICAgIG1peGluczogW0FjdGlvbkRpYWxvZ01peGluXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlhbG9nVGl0bGU6ICcnLFxuICAgICAgICAgICAgZGlhbG9nSXNNb2RhbDogdHJ1ZSxcbiAgICAgICAgICAgIGRpYWxvZ1BhZGRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgZGlhbG9nU2l6ZTogJ2xnJ1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgcHlkaW86IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uaW5zdGFuY2VPZihfcHlkaW8yWydkZWZhdWx0J10pLmlzUmVxdWlyZWQsXG4gICAgICAgIHNlbGVjdGlvbjogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5pbnN0YW5jZU9mKF9weWRpb01vZGVsRGF0YU1vZGVsMlsnZGVmYXVsdCddKSxcbiAgICAgICAgcmVhZG9ubHk6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uYm9vbFxuICAgIH0sXG5cbiAgICBjaGlsZENvbnRleHRUeXBlczoge1xuICAgICAgICBtZXNzYWdlczogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5vYmplY3QsXG4gICAgICAgIGdldE1lc3NhZ2U6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uZnVuYyxcbiAgICAgICAgaXNSZWFkb25seTogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5mdW5jXG4gICAgfSxcblxuICAgIGdldENoaWxkQ29udGV4dDogZnVuY3Rpb24gZ2V0Q2hpbGRDb250ZXh0KCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBtZXNzYWdlcyA9IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtZXNzYWdlczogbWVzc2FnZXMsXG4gICAgICAgICAgICBnZXRNZXNzYWdlOiBmdW5jdGlvbiBnZXRNZXNzYWdlKG1lc3NhZ2VJZCkge1xuICAgICAgICAgICAgICAgIHZhciBuYW1lc3BhY2UgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAnc2hhcmVfY2VudGVyJyA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlc1tuYW1lc3BhY2UgKyAobmFtZXNwYWNlID8gXCIuXCIgOiBcIlwiKSArIG1lc3NhZ2VJZF0gfHwgbWVzc2FnZUlkO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2VJZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaXNSZWFkb25seTogZnVuY3Rpb24gaXNSZWFkb25seSgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMucHJvcHMucmVhZG9ubHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuICAgICAgICB2YXIgc2VsZWN0aW9uID0gX3Byb3BzLnNlbGVjdGlvbjtcblxuICAgICAgICB2YXIgbm9kZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHNlbGVjdGlvbi5nZXRVbmlxdWVOb2RlKCkpIHtcbiAgICAgICAgICAgIG5vZGUgPSBzZWxlY3Rpb24uZ2V0VW5pcXVlTm9kZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX0NvbXBvc2l0ZUNhcmQyWydkZWZhdWx0J10sIHtcbiAgICAgICAgICAgIGVkaXRvck9uZUNvbHVtbjogdGhpcy5wcm9wcy5lZGl0b3JPbmVDb2x1bW4sXG4gICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICBtb2RlOiAnZWRpdCcsXG4gICAgICAgICAgICBub2RlOiBub2RlLFxuICAgICAgICAgICAgb25EaXNtaXNzOiB0aGlzLnByb3BzLm9uRGlzbWlzc1xuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ29tcG9zaXRlRGlhbG9nO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3g0LCBfeDUsIF94NikgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeDQsIHByb3BlcnR5ID0gX3g1LCByZWNlaXZlciA9IF94NjsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeDQgPSBwYXJlbnQ7IF94NSA9IHByb3BlcnR5OyBfeDYgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3B5ZGlvTGFuZ09ic2VydmFibGUgPSByZXF1aXJlKCdweWRpby9sYW5nL29ic2VydmFibGUnKTtcblxudmFyIF9weWRpb0xhbmdPYnNlcnZhYmxlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvTGFuZ09ic2VydmFibGUpO1xuXG52YXIgX2xpbmtzTGlua01vZGVsID0gcmVxdWlyZSgnLi4vbGlua3MvTGlua01vZGVsJyk7XG5cbnZhciBfbGlua3NMaW5rTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbGlua3NMaW5rTW9kZWwpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlciA9IHJlcXVpcmUoJy4uL21haW4vU2hhcmVIZWxwZXInKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9weWRpb01vZGVsQ2VsbCA9IHJlcXVpcmUoJ3B5ZGlvL21vZGVsL2NlbGwnKTtcblxudmFyIF9weWRpb01vZGVsQ2VsbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb01vZGVsQ2VsbCk7XG5cbnZhciBfY2VsbHNTZGsgPSByZXF1aXJlKCdjZWxscy1zZGsnKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgbW9tZW50ID0gX1B5ZGlvJHJlcXVpcmVMaWIubW9tZW50O1xuXG52YXIgQ29tcG9zaXRlTW9kZWwgPSAoZnVuY3Rpb24gKF9PYnNlcnZhYmxlKSB7XG4gICAgX2luaGVyaXRzKENvbXBvc2l0ZU1vZGVsLCBfT2JzZXJ2YWJsZSk7XG5cbiAgICBmdW5jdGlvbiBDb21wb3NpdGVNb2RlbCgpIHtcbiAgICAgICAgdmFyIGVkaXQgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ29tcG9zaXRlTW9kZWwpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKENvbXBvc2l0ZU1vZGVsLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcyk7XG4gICAgICAgIHRoaXMuY2VsbHMgPSBbXTtcbiAgICAgICAgdGhpcy5saW5rcyA9IFtdO1xuICAgICAgICB0aGlzLmVkaXQgPSBlZGl0O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhDb21wb3NpdGVNb2RlbCwgW3tcbiAgICAgICAga2V5OiAnZW1wdHlMaW5rJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGVtcHR5TGluayhub2RlKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgbGluayA9IG5ldyBfbGlua3NMaW5rTW9kZWwyWydkZWZhdWx0J10oKTtcbiAgICAgICAgICAgIHZhciB0cmVlTm9kZSA9IG5ldyBfY2VsbHNTZGsuVHJlZU5vZGUoKTtcbiAgICAgICAgICAgIHZhciBhdXRoID0gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5nZXRBdXRob3JpemF0aW9ucygpO1xuICAgICAgICAgICAgdHJlZU5vZGUuVXVpZCA9IG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ3V1aWQnKTtcbiAgICAgICAgICAgIGxpbmsuZ2V0TGluaygpLkxhYmVsID0gbm9kZS5nZXRMYWJlbCgpO1xuICAgICAgICAgICAgbGluay5nZXRMaW5rKCkuRGVzY3JpcHRpb24gPSBweWRpby5NZXNzYWdlSGFzaFsnc2hhcmVfY2VudGVyLjI1NyddLnJlcGxhY2UoJyVzJywgbW9tZW50KG5ldyBEYXRlKCkpLmZvcm1hdChcIllZWVkvTU0vRERcIikpO1xuICAgICAgICAgICAgbGluay5nZXRMaW5rKCkuUm9vdE5vZGVzLnB1c2godHJlZU5vZGUpO1xuICAgICAgICAgICAgLy8gVGVtcGxhdGUgLyBQZXJtaXNzaW9ucyBmcm9tIG5vZGVcbiAgICAgICAgICAgIHZhciBkZWZhdWx0VGVtcGxhdGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgZGVmYXVsdFBlcm1pc3Npb25zID0gW19jZWxsc1Nkay5SZXN0U2hhcmVMaW5rQWNjZXNzVHlwZS5jb25zdHJ1Y3RGcm9tT2JqZWN0KCdEb3dubG9hZCcpXTtcbiAgICAgICAgICAgIGlmIChub2RlLmlzTGVhZigpKSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdFRlbXBsYXRlID0gXCJweWRpb191bmlxdWVfZGxcIjtcblxuICAgICAgICAgICAgICAgIHZhciBfU2hhcmVIZWxwZXIkbm9kZUhhc0VkaXRvciA9IF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10ubm9kZUhhc0VkaXRvcihweWRpbywgbm9kZSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgcHJldmlldyA9IF9TaGFyZUhlbHBlciRub2RlSGFzRWRpdG9yLnByZXZpZXc7XG5cbiAgICAgICAgICAgICAgICBpZiAocHJldmlldyAmJiAhYXV0aC5tYXhfZG93bmxvYWRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHRUZW1wbGF0ZSA9IFwicHlkaW9fdW5pcXVlX3N0cmlwXCI7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHRQZXJtaXNzaW9ucy5wdXNoKF9jZWxsc1Nkay5SZXN0U2hhcmVMaW5rQWNjZXNzVHlwZS5jb25zdHJ1Y3RGcm9tT2JqZWN0KCdQcmV2aWV3JykpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYXV0aC5tYXhfZG93bmxvYWRzID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiBETCBvbmx5IGFuZCBhdXRoIGhhcyBkZWZhdWx0IG1heCBkb3dubG9hZCwgc2V0IGl0XG4gICAgICAgICAgICAgICAgICAgIGxpbmsuZ2V0TGluaygpLk1heERvd25sb2FkcyA9IGF1dGgubWF4X2Rvd25sb2FkcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlZmF1bHRUZW1wbGF0ZSA9IFwicHlkaW9fc2hhcmVkX2ZvbGRlclwiO1xuICAgICAgICAgICAgICAgIGRlZmF1bHRQZXJtaXNzaW9ucy5wdXNoKF9jZWxsc1Nkay5SZXN0U2hhcmVMaW5rQWNjZXNzVHlwZS5jb25zdHJ1Y3RGcm9tT2JqZWN0KCdQcmV2aWV3JykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGluay5nZXRMaW5rKCkuVmlld1RlbXBsYXRlTmFtZSA9IGRlZmF1bHRUZW1wbGF0ZTtcbiAgICAgICAgICAgIGxpbmsuZ2V0TGluaygpLlBlcm1pc3Npb25zID0gZGVmYXVsdFBlcm1pc3Npb25zO1xuICAgICAgICAgICAgaWYgKGF1dGgubWF4X2V4cGlyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBsaW5rLmdldExpbmsoKS5BY2Nlc3NFbmQgPSBcIlwiICsgKE1hdGgucm91bmQobmV3IERhdGUoKSAvIDEwMDApICsgcGFyc2VJbnQoYXV0aC5tYXhfZXhwaXJhdGlvbikgKiA2MCAqIDYwICogMjQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsaW5rLm9ic2VydmUoXCJ1cGRhdGVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzLm5vdGlmeShcInVwZGF0ZVwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGluay5vYnNlcnZlKFwic2F2ZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMudXBkYXRlVW5kZXJseWluZ05vZGUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGxpbms7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NyZWF0ZUVtcHR5Q2VsbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjcmVhdGVFbXB0eUNlbGwoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGNlbGwgPSBuZXcgX3B5ZGlvTW9kZWxDZWxsMlsnZGVmYXVsdCddKHRydWUpO1xuICAgICAgICAgICAgY2VsbC5zZXRMYWJlbCh0aGlzLm5vZGUuZ2V0TGFiZWwoKSk7XG4gICAgICAgICAgICBjZWxsLmFkZFJvb3ROb2RlKHRoaXMubm9kZSk7XG4gICAgICAgICAgICBjZWxsLm9ic2VydmUoXCJ1cGRhdGVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5ub3RpZnkoXCJ1cGRhdGVcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNlbGwuZGlydHkgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuY2VsbHMucHVzaChjZWxsKTtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5KFwidXBkYXRlXCIpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdhZGRUb0V4aXN0aW5nQ2VsbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRUb0V4aXN0aW5nQ2VsbChjZWxsSWQpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgY2VsbCA9IG5ldyBfcHlkaW9Nb2RlbENlbGwyWydkZWZhdWx0J10odHJ1ZSk7XG4gICAgICAgICAgICBjZWxsLm9ic2VydmUoXCJ1cGRhdGVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzMy5ub3RpZnkoXCJ1cGRhdGVcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNlbGwubG9hZChjZWxsSWQpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNlbGwuYWRkUm9vdE5vZGUoX3RoaXMzLm5vZGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmNlbGxzLnB1c2goY2VsbCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3VwZGF0ZVVuZGVybHlpbmdOb2RlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZVVuZGVybHlpbmdOb2RlKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2tpcFVwZGF0ZVVuZGVybHlpbmdOb2RlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX3B5ZGlvMlsnZGVmYXVsdCddLmdldEluc3RhbmNlKCkuZ2V0Q29udGV4dEhvbGRlcigpLnJlcXVpcmVOb2RlUmVsb2FkKHRoaXMubm9kZSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2RlbGV0ZUxpbmsnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZGVsZXRlTGluayhsaW5rTW9kZWwpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczQgPSB0aGlzO1xuXG4gICAgICAgICAgICByZXR1cm4gbGlua01vZGVsLmRlbGV0ZUxpbmsodGhpcy5lbXB0eUxpbmsodGhpcy5ub2RlKS5nZXRMaW5rKCkpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgIF90aGlzNC51cGRhdGVVbmRlcmx5aW5nTm9kZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldE5vZGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0Tm9kZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm5vZGU7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIG5vZGUge1RyZWVOb2RlfVxuICAgICAgICAgKiBAcGFyYW0gb2JzZXJ2ZVJlcGxhY2UgYm9vbFxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2xvYWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbG9hZChub2RlKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXM1ID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIG9ic2VydmVSZXBsYWNlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgICAgIHRoaXMubm9kZSA9IG5vZGU7XG4gICAgICAgICAgICB0aGlzLmNlbGxzID0gW107XG4gICAgICAgICAgICB0aGlzLmxpbmtzID0gW107XG4gICAgICAgICAgICBpZiAobm9kZS5nZXRNZXRhZGF0YSgpLmdldCgncHlkaW9fc2hhcmVzJykpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2hhcmVNZXRhID0gSlNPTi5wYXJzZShub2RlLmdldE1ldGFkYXRhKCkuZ2V0KCdweWRpb19zaGFyZXMnKSk7XG4gICAgICAgICAgICAgICAgc2hhcmVNZXRhLm1hcChmdW5jdGlvbiAoc2hhcmVkV29ya3NwYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzaGFyZWRXb3Jrc3BhY2UuU2NvcGUgPT09IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIExpbmtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSBuZXcgX2xpbmtzTGlua01vZGVsMlsnZGVmYXVsdCddKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rTW9kZWwub2JzZXJ2ZShcInVwZGF0ZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXM1Lm5vdGlmeShcInVwZGF0ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGlua01vZGVsLm9ic2VydmUoXCJzYXZlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczUudXBkYXRlVW5kZXJseWluZ05vZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGlua01vZGVsLmxvYWQoc2hhcmVkV29ya3NwYWNlLlVVSUQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXM1LmxpbmtzLnB1c2gobGlua01vZGVsKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzaGFyZWRXb3Jrc3BhY2UuU2NvcGUgPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjZWxsID0gbmV3IF9weWRpb01vZGVsQ2VsbDJbJ2RlZmF1bHQnXSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2VsbC5vYnNlcnZlKFwidXBkYXRlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczUubm90aWZ5KFwidXBkYXRlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjZWxsLmxvYWQoc2hhcmVkV29ya3NwYWNlLlVVSUQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXM1LmNlbGxzLnB1c2goY2VsbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmVkaXQgJiYgIXRoaXMubGlua3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5saW5rcy5wdXNoKHRoaXMuZW1wdHlMaW5rKG5vZGUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvYnNlcnZlUmVwbGFjZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubm9kZS5vYnNlcnZlKCdub2RlX3JlcGxhY2VkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczUubG9hZChfdGhpczUubm9kZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdsb2FkVW5pcXVlTGluaycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBsb2FkVW5pcXVlTGluayhsaW5rVXVpZCwgbm9kZSkge1xuICAgICAgICAgICAgdmFyIF90aGlzNiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMubm9kZSA9IG5vZGU7XG4gICAgICAgICAgICB2YXIgbGlua01vZGVsID0gbmV3IF9saW5rc0xpbmtNb2RlbDJbJ2RlZmF1bHQnXSgpO1xuICAgICAgICAgICAgbGlua01vZGVsLm9ic2VydmUoXCJ1cGRhdGVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzNi5ub3RpZnkoXCJ1cGRhdGVcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxpbmtNb2RlbC5sb2FkKGxpbmtVdWlkKTtcbiAgICAgICAgICAgIHRoaXMubGlua3MucHVzaChsaW5rTW9kZWwpO1xuICAgICAgICAgICAgcmV0dXJuIGxpbmtNb2RlbDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc2F2ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzYXZlKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzNyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBwcm9tcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5jZWxscy5tYXAoZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgICAgICBpZiAoci5pc0RpcnR5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvbXMucHVzaChyLnNhdmUoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmxpbmtzLm1hcChmdW5jdGlvbiAobCkge1xuICAgICAgICAgICAgICAgIGlmIChsLmlzRGlydHkoKSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9tcy5wdXNoKGwuc2F2ZSgpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIFdhaXQgdGhhdCBhbGwgc2F2ZSBhcmUgZmluaXNoZWRcbiAgICAgICAgICAgIFByb21pc2UuYWxsKHByb21zKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgY2VsbHMgdGhhdCBkb24ndCBoYXZlIHRoaXMgbm9kZSBhbnltb3JlXG4gICAgICAgICAgICAgICAgdmFyIG5vZGVJZCA9IF90aGlzNy5ub2RlLmdldE1ldGFkYXRhKCkuZ2V0KCd1dWlkJyk7XG4gICAgICAgICAgICAgICAgX3RoaXM3LmNlbGxzID0gX3RoaXM3LmNlbGxzLmZpbHRlcihmdW5jdGlvbiAocikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gci5oYXNSb290Tm9kZShub2RlSWQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIF90aGlzNy51cGRhdGVVbmRlcmx5aW5nTm9kZSgpO1xuICAgICAgICAgICAgfSlbJ2NhdGNoJ10oZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBfdGhpczcudXBkYXRlVW5kZXJseWluZ05vZGUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdkZWxldGVBbGwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZGVsZXRlQWxsKCkge1xuICAgICAgICAgICAgdmFyIG5vZGVVdWlkID0gdGhpcy5ub2RlLmdldE1ldGFkYXRhKCkuZ2V0KCd1dWlkJyk7XG4gICAgICAgICAgICB2YXIgcCA9IFtdO1xuICAgICAgICAgICAgdGhpcy5jZWxscy5tYXAoZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgICAgICByLnJlbW92ZVJvb3ROb2RlKG5vZGVVdWlkKTtcbiAgICAgICAgICAgICAgICBwLnB1c2goci5zYXZlKCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmxpbmtzLm1hcChmdW5jdGlvbiAobCkge1xuICAgICAgICAgICAgICAgIHAucHVzaChsLmRlbGV0ZUxpbmsoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChwKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVtb3ZlTmV3Q2VsbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVOZXdDZWxsKGNlbGwpIHtcbiAgICAgICAgICAgIHRoaXMuY2VsbHMgPSB0aGlzLmNlbGxzLmZpbHRlcihmdW5jdGlvbiAocikge1xuICAgICAgICAgICAgICAgIHJldHVybiByICE9PSBjZWxsO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeShcInVwZGF0ZVwiKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmV2ZXJ0Q2hhbmdlcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZXZlcnRDaGFuZ2VzKCkge1xuICAgICAgICAgICAgLy8gUmVtb3ZlIGVtcHR5IGNlbGxzXG4gICAgICAgICAgICB0aGlzLmNlbGxzID0gdGhpcy5jZWxscy5maWx0ZXIoZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gci5nZXRVdWlkKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuY2VsbHMubWFwKGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHIuaXNEaXJ0eSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHIucmV2ZXJ0Q2hhbmdlcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5saW5rcy5tYXAoZnVuY3Rpb24gKGwpIHtcbiAgICAgICAgICAgICAgICBpZiAobC5pc0RpcnR5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbC5yZXZlcnRDaGFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeSgndXBkYXRlJyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2lzRGlydHknLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gaXNEaXJ0eSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNlbGxzLmZpbHRlcihmdW5jdGlvbiAocikge1xuICAgICAgICAgICAgICAgIHJldHVybiByLmlzRGlydHkoKTtcbiAgICAgICAgICAgIH0pLmxlbmd0aCB8fCB0aGlzLmxpbmtzLmZpbHRlcihmdW5jdGlvbiAobCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsLmlzRGlydHkoKTtcbiAgICAgICAgICAgIH0pLmxlbmd0aDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc3RvcE9ic2VydmluZycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzdG9wT2JzZXJ2aW5nKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzFdO1xuXG4gICAgICAgICAgICB0aGlzLmNlbGxzLm1hcChmdW5jdGlvbiAoY2VsbCkge1xuICAgICAgICAgICAgICAgIGNlbGwuc3RvcE9ic2VydmluZyhcInVwZGF0ZVwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5saW5rcy5tYXAoZnVuY3Rpb24gKGxpbmspIHtcbiAgICAgICAgICAgICAgICBsaW5rLnN0b3BPYnNlcnZpbmcoXCJ1cGRhdGVcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKENvbXBvc2l0ZU1vZGVsLnByb3RvdHlwZSksICdzdG9wT2JzZXJ2aW5nJywgdGhpcykuY2FsbCh0aGlzLCBldmVudCwgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRDZWxscycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRDZWxscygpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczggPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5ub2RlKSB7XG4gICAgICAgICAgICAgICAgdmFyIF9yZXQgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZUlkID0gX3RoaXM4Lm5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ3V1aWQnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHY6IF90aGlzOC5jZWxscy5maWx0ZXIoZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gci5oYXNSb290Tm9kZShub2RlSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBfcmV0ID09PSAnb2JqZWN0JykgcmV0dXJuIF9yZXQudjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2VsbHM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldExpbmtzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldExpbmtzKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGlua3M7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQ29tcG9zaXRlTW9kZWw7XG59KShfcHlkaW9MYW5nT2JzZXJ2YWJsZTJbJ2RlZmF1bHQnXSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IENvbXBvc2l0ZU1vZGVsO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94MiwgX3gzLCBfeDQpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gyLCBwcm9wZXJ0eSA9IF94MywgcmVjZWl2ZXIgPSBfeDQ7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3gyID0gcGFyZW50OyBfeDMgPSBwcm9wZXJ0eTsgX3g0ID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3B5ZGlvSHR0cFJlc291cmNlc01hbmFnZXIgPSByZXF1aXJlKCdweWRpby9odHRwL3Jlc291cmNlcy1tYW5hZ2VyJyk7XG5cbnZhciBfcHlkaW9IdHRwUmVzb3VyY2VzTWFuYWdlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb0h0dHBSZXNvdXJjZXNNYW5hZ2VyKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIgPSByZXF1aXJlKCcuLi9tYWluL1NoYXJlSGVscGVyJyk7XG5cbnZhciBfbWFpblNoYXJlSGVscGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX21haW5TaGFyZUhlbHBlcik7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfY2VsbHNTZGsgPSByZXF1aXJlKCdjZWxscy1zZGsnKTtcblxudmFyIE1haWxlciA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhNYWlsZXIsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gTWFpbGVyKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNYWlsZXIpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKE1haWxlci5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHsgbWFpbGVyRGF0YTogbnVsbCB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhNYWlsZXIsIFt7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wcykge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIHN1YmplY3QgPSBuZXdQcm9wcy5zdWJqZWN0O1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBuZXdQcm9wcy5tZXNzYWdlO1xuICAgICAgICAgICAgdmFyIHVzZXJzID0gbmV3UHJvcHMudXNlcnM7XG4gICAgICAgICAgICB2YXIgbGlua01vZGVsID0gbmV3UHJvcHMubGlua01vZGVsO1xuICAgICAgICAgICAgdmFyIHRlbXBsYXRlSWQgPSBuZXdQcm9wcy50ZW1wbGF0ZUlkO1xuICAgICAgICAgICAgdmFyIHRlbXBsYXRlRGF0YSA9IG5ld1Byb3BzLnRlbXBsYXRlRGF0YTtcblxuICAgICAgICAgICAgaWYgKHN1YmplY3QgfHwgdGVtcGxhdGVJZCkge1xuICAgICAgICAgICAgICAgIGlmIChfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLmZvcmNlTWFpbGVyT2xkU2Nob29sKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVuY1N1YmplY3QgPSBlbmNvZGVVUklDb21wb25lbnQoc3ViamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSBcIm1haWx0bzpjdXN0b20tZW1haWxAZG9tYWluLmNvbT9TdWJqZWN0PVwiICsgZW5jU3ViamVjdCArIFwiJkJvZHk9XCIgKyBtZXNzYWdlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vY29uc3QgbGlua0RhdGEgPSBoYXNoID8gdGhpcy5zdGF0ZS5tb2RlbC5nZXRMaW5rRGF0YShoYXNoKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBfcHlkaW9IdHRwUmVzb3VyY2VzTWFuYWdlcjJbJ2RlZmF1bHQnXS5sb2FkQ2xhc3Nlc0FuZEFwcGx5KFsnUHlkaW9NYWlsZXInXSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYWlsZXJEYXRhOiBfZXh0ZW5kcyh7fSwgbmV3UHJvcHMsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVJZGVudGlmaWNhdGlvbjogbGlua01vZGVsICYmIGxpbmtNb2RlbC5nZXRMaW5rKCkuVGFyZ2V0VXNlcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWRlbnRpZmllZE9ubHk6IGxpbmtNb2RlbCAmJiBsaW5rTW9kZWwuZ2V0TGluaygpLlJlc3RyaWN0VG9UYXJnZXRVc2VycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmlwcGxlSWRlbnRpZmljYXRpb25LZXlzOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1haWxlckRhdGE6IG51bGwgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3RvZ2dsZU1haWxlckRhdGEnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdG9nZ2xlTWFpbGVyRGF0YShkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbWFpbGVyRGF0YTogX2V4dGVuZHMoe30sIHRoaXMuc3RhdGUubWFpbGVyRGF0YSwgZGF0YSkgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Rpc21pc3NNYWlsZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZGlzbWlzc01haWxlcigpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25EaXNtaXNzKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ21haWxlclByb2Nlc3NQb3N0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG1haWxlclByb2Nlc3NQb3N0KEVtYWlsLCB1c2Vycywgc3ViamVjdCwgbWVzc2FnZSwgbGluaywgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBtYWlsZXJEYXRhID0gdGhpcy5zdGF0ZS5tYWlsZXJEYXRhO1xuICAgICAgICAgICAgdmFyIGNyaXBwbGVJZGVudGlmaWNhdGlvbktleXMgPSBtYWlsZXJEYXRhLmNyaXBwbGVJZGVudGlmaWNhdGlvbktleXM7XG4gICAgICAgICAgICB2YXIgaWRlbnRpZmllZE9ubHkgPSBtYWlsZXJEYXRhLmlkZW50aWZpZWRPbmx5O1xuICAgICAgICAgICAgdmFyIGxpbmtNb2RlbCA9IG1haWxlckRhdGEubGlua01vZGVsO1xuXG4gICAgICAgICAgICB2YXIgbGlua09iamVjdCA9IGxpbmtNb2RlbC5nZXRMaW5rKCk7XG4gICAgICAgICAgICBpZiAoIWxpbmtPYmplY3QuVGFyZ2V0VXNlcnMpIHtcbiAgICAgICAgICAgICAgICBsaW5rT2JqZWN0LlRhcmdldFVzZXJzID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsaW5rT2JqZWN0LlJlc3RyaWN0VG9UYXJnZXRVc2VycyA9IGlkZW50aWZpZWRPbmx5O1xuXG4gICAgICAgICAgICB2YXIgc2hhcmVNYWlscyA9IHt9O1xuICAgICAgICAgICAgT2JqZWN0LmtleXModXNlcnMpLmZvckVhY2goZnVuY3Rpb24gKHUpIHtcbiAgICAgICAgICAgICAgICB2YXIgayA9IGNyaXBwbGVJZGVudGlmaWNhdGlvbktleXMgPyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoNykgOiB1O1xuICAgICAgICAgICAgICAgIGxpbmtPYmplY3QuVGFyZ2V0VXNlcnNba10gPSBfY2VsbHNTZGsuUmVzdFNoYXJlTGlua1RhcmdldFVzZXIuY29uc3RydWN0RnJvbU9iamVjdCh7IERpc3BsYXk6IHVzZXJzW3VdLmdldExhYmVsKCksIERvd25sb2FkQ291bnQ6IDAgfSk7XG4gICAgICAgICAgICAgICAgc2hhcmVNYWlsc1trXSA9IHU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxpbmtNb2RlbC51cGRhdGVMaW5rKGxpbmtPYmplY3QpO1xuICAgICAgICAgICAgbGlua01vZGVsLnNhdmUoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZW1haWwgPSBuZXcgRW1haWwoKTtcbiAgICAgICAgICAgICAgICB2YXIgb3JpZ2luYWxMaW5rID0gbGlua01vZGVsLmdldFB1YmxpY1VybCgpO1xuICAgICAgICAgICAgICAgIHZhciByZWdleHAgPSBuZXcgUmVnRXhwKG9yaWdpbmFsTGluaywgJ2cnKTtcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhzaGFyZU1haWxzKS5mb3JFYWNoKGZ1bmN0aW9uICh1KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdMaW5rID0gb3JpZ2luYWxMaW5rICsgJz91PScgKyB1O1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TWVzc2FnZSA9IG1lc3NhZ2UucmVwbGFjZShyZWdleHAsIG5ld0xpbmspO1xuICAgICAgICAgICAgICAgICAgICBlbWFpbC5hZGRUYXJnZXQoc2hhcmVNYWlsc1t1XSwgc3ViamVjdCwgbmV3TWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZW1haWwucG9zdChmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHJlcyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0TWVzc2FnZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRNZXNzYWdlKGtleSkge1xuICAgICAgICAgICAgdmFyIG5hbWVzcGFjZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/ICdzaGFyZV9jZW50ZXInIDogYXJndW1lbnRzWzFdO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFtuYW1lc3BhY2UgKyAobmFtZXNwYWNlID8gJy4nIDogJycpICsga2V5XTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5tYWlsZXJEYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1haWxlckRhdGEgPSB0aGlzLnN0YXRlLm1haWxlckRhdGE7XG5cbiAgICAgICAgICAgICAgICB2YXIgY3VzdG9taXplTWVzc2FnZVBhbmUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKGZhbHNlICYmIG1haWxlckRhdGEubGlua01vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHlsZSA9IG1haWxlckRhdGEuZW5hYmxlSWRlbnRpZmljYXRpb24gPyB7IHBhZGRpbmc6ICcxMHB4IDIwcHgnLCBiYWNrZ3JvdW5kQ29sb3I6ICcjRUNFRkYxJywgZm9udFNpemU6IDE0IH0gOiB7IHBhZGRpbmc6ICcxMHB4IDIwcHggMCcsIGZvbnRTaXplOiAxNCB9O1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGV0VXNlckNob29zZUNyaXBwbGUgPSB0aGlzLnByb3BzLnB5ZGlvLmdldFBsdWdpbkNvbmZpZ3MoJ2FjdGlvbi5zaGFyZScpLmdldCgnRU1BSUxfUEVSU09OQUxfTElOS19TRU5EX0NMRUFSJyk7XG4gICAgICAgICAgICAgICAgICAgIGN1c3RvbWl6ZU1lc3NhZ2VQYW5lID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Ub2dnbGUsIHsgbGFiZWw6IHRoaXMuZ2V0TWVzc2FnZSgyMzUpLCB0b2dnbGVkOiBtYWlsZXJEYXRhLmVuYWJsZUlkZW50aWZpY2F0aW9uLCBvblRvZ2dsZTogZnVuY3Rpb24gKGUsIGMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnRvZ2dsZU1haWxlckRhdGEoeyBlbmFibGVJZGVudGlmaWNhdGlvbjogYyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFpbGVyRGF0YS5lbmFibGVJZGVudGlmaWNhdGlvbiAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Ub2dnbGUsIHsgbGFiZWw6IFwiLS0gXCIgKyB0aGlzLmdldE1lc3NhZ2UoMjM2KSwgdG9nZ2xlZDogbWFpbGVyRGF0YS5pZGVudGlmaWVkT25seSwgb25Ub2dnbGU6IGZ1bmN0aW9uIChlLCBjKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi50b2dnbGVNYWlsZXJEYXRhKHsgaWRlbnRpZmllZE9ubHk6IGMgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1haWxlckRhdGEuZW5hYmxlSWRlbnRpZmljYXRpb24gJiYgbGV0VXNlckNob29zZUNyaXBwbGUgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVG9nZ2xlLCB7IGxhYmVsOiBcIi0tIFwiICsgdGhpcy5nZXRNZXNzYWdlKDIzNyksIHRvZ2dsZWQ6IG1haWxlckRhdGEuY3JpcHBsZUlkZW50aWZpY2F0aW9uS2V5cywgb25Ub2dnbGU6IGZ1bmN0aW9uIChlLCBjKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi50b2dnbGVNYWlsZXJEYXRhKHsgY3JpcHBsZUlkZW50aWZpY2F0aW9uS2V5czogYyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChQeWRpb01haWxlci5QYW5lLCBfZXh0ZW5kcyh7fSwgbWFpbGVyRGF0YSwge1xuICAgICAgICAgICAgICAgICAgICBvbkRpc21pc3M6IHRoaXMuZGlzbWlzc01haWxlci5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICBvdmVybGF5OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdzaGFyZS1jZW50ZXItbWFpbGVyJyxcbiAgICAgICAgICAgICAgICAgICAgcGFuZWxUaXRsZTogdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFtcInNoYXJlX2NlbnRlci40NVwiXSxcbiAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbFBhbmVUb3A6IGN1c3RvbWl6ZU1lc3NhZ2VQYW5lLFxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzUG9zdDogbWFpbGVyRGF0YS5lbmFibGVJZGVudGlmaWNhdGlvbiA/IHRoaXMubWFpbGVyUHJvY2Vzc1Bvc3QuYmluZCh0aGlzKSA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IHdpZHRoOiA0MjAsIG1hcmdpbjogJzAgYXV0bycgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gTWFpbGVyO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IE1haWxlcjtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2NvbXBvc2l0ZUNvbXBvc2l0ZU1vZGVsID0gcmVxdWlyZSgnLi4vY29tcG9zaXRlL0NvbXBvc2l0ZU1vZGVsJyk7XG5cbnZhciBfY29tcG9zaXRlQ29tcG9zaXRlTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY29tcG9zaXRlQ29tcG9zaXRlTW9kZWwpO1xuXG52YXIgX21haW5HZW5lcmljRWRpdG9yID0gcmVxdWlyZSgnLi4vbWFpbi9HZW5lcmljRWRpdG9yJyk7XG5cbnZhciBfbWFpbkdlbmVyaWNFZGl0b3IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpbkdlbmVyaWNFZGl0b3IpO1xuXG52YXIgX2xpbmtzUGFuZWwgPSByZXF1aXJlKCcuLi9saW5rcy9QYW5lbCcpO1xuXG52YXIgX2xpbmtzUGFuZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbGlua3NQYW5lbCk7XG5cbnZhciBfbGlua3NTZWN1cmVPcHRpb25zID0gcmVxdWlyZSgnLi4vbGlua3MvU2VjdXJlT3B0aW9ucycpO1xuXG52YXIgX2xpbmtzU2VjdXJlT3B0aW9uczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9saW5rc1NlY3VyZU9wdGlvbnMpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlciA9IHJlcXVpcmUoJy4uL21haW4vU2hhcmVIZWxwZXInKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9NYWlsZXIgPSByZXF1aXJlKCcuL01haWxlcicpO1xuXG52YXIgX01haWxlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9NYWlsZXIpO1xuXG52YXIgX2xpbmtzUHVibGljTGlua1RlbXBsYXRlID0gcmVxdWlyZSgnLi4vbGlua3MvUHVibGljTGlua1RlbXBsYXRlJyk7XG5cbnZhciBfbGlua3NQdWJsaWNMaW5rVGVtcGxhdGUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbGlua3NQdWJsaWNMaW5rVGVtcGxhdGUpO1xuXG52YXIgX2xpbmtzVmlzaWJpbGl0eVBhbmVsID0gcmVxdWlyZSgnLi4vbGlua3MvVmlzaWJpbGl0eVBhbmVsJyk7XG5cbnZhciBfbGlua3NWaXNpYmlsaXR5UGFuZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbGlua3NWaXNpYmlsaXR5UGFuZWwpO1xuXG52YXIgX2xpbmtzTGFiZWxQYW5lbCA9IHJlcXVpcmUoJy4uL2xpbmtzL0xhYmVsUGFuZWwnKTtcblxudmFyIF9saW5rc0xhYmVsUGFuZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbGlua3NMYWJlbFBhbmVsKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9yZXF1aXJlJHJlcXVpcmVMaWIgPSByZXF1aXJlKCdweWRpbycpLnJlcXVpcmVMaWIoJ2hvYycpO1xuXG52YXIgUGFsZXR0ZU1vZGlmaWVyID0gX3JlcXVpcmUkcmVxdWlyZUxpYi5QYWxldHRlTW9kaWZpZXI7XG5cbnZhciBTaW1wbGVMaW5rQ2FyZCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhTaW1wbGVMaW5rQ2FyZCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBTaW1wbGVMaW5rQ2FyZChwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2ltcGxlTGlua0NhcmQpO1xuXG4gICAgICAgIHByb3BzLmVkaXRvck9uZUNvbHVtbiA9IHRydWU7XG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFNpbXBsZUxpbmtDYXJkLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB2YXIgbW9kZWwgPSBuZXcgX2NvbXBvc2l0ZUNvbXBvc2l0ZU1vZGVsMlsnZGVmYXVsdCddKHRydWUpO1xuICAgICAgICBtb2RlbC5za2lwVXBkYXRlVW5kZXJseWluZ05vZGUgPSB0cnVlO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgbW9kZTogdGhpcy5wcm9wcy5tb2RlIHx8ICd2aWV3JyxcbiAgICAgICAgICAgIG1vZGVsOiBtb2RlbFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhTaW1wbGVMaW5rQ2FyZCwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBub2RlID0gX3Byb3BzLm5vZGU7XG4gICAgICAgICAgICB2YXIgbGlua1V1aWQgPSBfcHJvcHMubGlua1V1aWQ7XG4gICAgICAgICAgICB2YXIgb25SZW1vdmVMaW5rID0gX3Byb3BzLm9uUmVtb3ZlTGluaztcbiAgICAgICAgICAgIHZhciBtb2RlbCA9IHRoaXMuc3RhdGUubW9kZWw7XG5cbiAgICAgICAgICAgIG1vZGVsLm9ic2VydmUoXCJ1cGRhdGVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSBtb2RlbC5sb2FkVW5pcXVlTGluayhsaW5rVXVpZCwgbm9kZSk7XG4gICAgICAgICAgICBsaW5rTW9kZWwub2JzZXJ2ZU9uY2UoXCJkZWxldGVcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChvblJlbW92ZUxpbmspIG9uUmVtb3ZlTGluaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxVbm1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5tb2RlbC5zdG9wT2JzZXJ2aW5nKFwidXBkYXRlXCIpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMocHJvcHMpIHtcbiAgICAgICAgICAgIGlmIChwcm9wcy5MaW5rVXVpZCAmJiBwcm9wcy5MaW5rVXVpZCAhPT0gdGhpcy5wcm9wcy5MaW5rVXVpZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUubW9kZWwubG9hZFVuaXF1ZUxpbmsocHJvcHMuTGlua1V1aWQsIHByb3BzLm5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdsaW5rSW52aXRhdGlvbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBsaW5rSW52aXRhdGlvbihsaW5rTW9kZWwpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIG1haWxEYXRhID0gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5wcmVwYXJlRW1haWwodGhpcy5wcm9wcy5ub2RlLCBsaW5rTW9kZWwpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtYWlsZXJEYXRhOiBfZXh0ZW5kcyh7fSwgbWFpbERhdGEsIHsgdXNlcnM6IFtdLCBsaW5rTW9kZWw6IGxpbmtNb2RlbCB9KSB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBhbGVydChlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdkaXNtaXNzTWFpbGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRpc21pc3NNYWlsZXIoKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbWFpbGVyRGF0YTogbnVsbCB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc3VibWl0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgICAgIHZhciBtb2RlbCA9IHRoaXMuc3RhdGUubW9kZWw7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIHB1YmxpY0xpbmtNb2RlbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBpZiAobW9kZWwuZ2V0TGlua3MoKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHVibGljTGlua01vZGVsID0gbW9kZWwuZ2V0TGlua3MoKVswXTtcbiAgICAgICAgICAgICAgICAgICAgcHVibGljTGlua01vZGVsLnNhdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5weWRpby5VSS5kaXNwbGF5TWVzc2FnZSgnRVJST1InLCBlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIG5vZGUgPSBfcHJvcHMyLm5vZGU7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMyLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIGVkaXRvck9uZUNvbHVtbiA9IF9wcm9wczIuZWRpdG9yT25lQ29sdW1uO1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgbW9kZWwgPSBfc3RhdGUubW9kZWw7XG4gICAgICAgICAgICB2YXIgbWFpbGVyRGF0YSA9IF9zdGF0ZS5tYWlsZXJEYXRhO1xuXG4gICAgICAgICAgICB2YXIgbSA9IGZ1bmN0aW9uIG0oaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci4nICsgaWRdO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHB1YmxpY0xpbmtNb2RlbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChtb2RlbC5nZXRMaW5rcygpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHB1YmxpY0xpbmtNb2RlbCA9IG1vZGVsLmdldExpbmtzKClbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaGVhZGVyID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKHB1YmxpY0xpbmtNb2RlbCAmJiBwdWJsaWNMaW5rTW9kZWwuZ2V0TGlua1V1aWQoKSAmJiBwdWJsaWNMaW5rTW9kZWwuaXNFZGl0YWJsZSgpKSB7XG4gICAgICAgICAgICAgICAgaGVhZGVyID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfTWFpbGVyMlsnZGVmYXVsdCddLCBfZXh0ZW5kcyh7fSwgbWFpbGVyRGF0YSwgeyBweWRpbzogcHlkaW8sIG9uRGlzbWlzczogdGhpcy5kaXNtaXNzTWFpbGVyLmJpbmQodGhpcykgfSkpLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbGlua3NMYWJlbFBhbmVsMlsnZGVmYXVsdCddLCB7IHB5ZGlvOiBweWRpbywgbGlua01vZGVsOiBwdWJsaWNMaW5rTW9kZWwgfSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBoZWFkZXIgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZm9udFNpemU6IDI0LCBwYWRkaW5nOiAnMjZweCAxMHB4IDAgJywgbGluZUhlaWdodDogJzI2cHgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX01haWxlcjJbJ2RlZmF1bHQnXSwgX2V4dGVuZHMoe30sIG1haWxlckRhdGEsIHsgcHlkaW86IHB5ZGlvLCBvbkRpc21pc3M6IHRoaXMuZGlzbWlzc01haWxlci5iaW5kKHRoaXMpIH0pKSxcbiAgICAgICAgICAgICAgICAgICAgbSgyNTYpLnJlcGxhY2UoJyVzJywgbm9kZS5nZXRMYWJlbCgpKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdGFicyA9IHsgbGVmdDogW10sIHJpZ2h0OiBbXSwgbGVmdFN0eWxlOiB7IHBhZGRpbmc6IDAgfSB9O1xuICAgICAgICAgICAgdmFyIGxpbmtzID0gbW9kZWwuZ2V0TGlua3MoKTtcbiAgICAgICAgICAgIGlmIChwdWJsaWNMaW5rTW9kZWwpIHtcbiAgICAgICAgICAgICAgICB0YWJzLmxlZnQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIExhYmVsOiBtKDI1MSksXG4gICAgICAgICAgICAgICAgICAgIFZhbHVlOiAncHVibGljLWxpbmsnLFxuICAgICAgICAgICAgICAgICAgICBDb21wb25lbnQ6IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9saW5rc1BhbmVsMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb3NpdGVNb2RlbDogbW9kZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rTW9kZWw6IGxpbmtzWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvd01haWxlcjogX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5tYWlsZXJTdXBwb3J0ZWQocHlkaW8pID8gdGhpcy5saW5rSW52aXRhdGlvbi5iaW5kKHRoaXMpIDogbnVsbFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChwdWJsaWNMaW5rTW9kZWwuZ2V0TGlua1V1aWQoKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBsYXlvdXREYXRhID0gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5jb21waWxlTGF5b3V0RGF0YShweWRpbywgbW9kZWwpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcGxhdGVQYW5lID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBpZiAobGF5b3V0RGF0YS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVBhbmUgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbGlua3NQdWJsaWNMaW5rVGVtcGxhdGUyWydkZWZhdWx0J10sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rTW9kZWw6IHB1YmxpY0xpbmtNb2RlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0RGF0YTogbGF5b3V0RGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBwYWRkaW5nOiAnMTBweCAxNnB4JyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRvbmx5OiBtb2RlbC5nZXROb2RlKCkuaXNMZWFmKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRhYnMubGVmdC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIExhYmVsOiBtKDI1MiksXG4gICAgICAgICAgICAgICAgICAgICAgICBWYWx1ZTogJ2xpbmstc2VjdXJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIENvbXBvbmVudDogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbGlua3NTZWN1cmVPcHRpb25zMlsnZGVmYXVsdCddLCB7IHB5ZGlvOiBweWRpbywgbGlua01vZGVsOiBsaW5rc1swXSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVBhbmUgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRGl2aWRlciwgbnVsbCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVQYW5lXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0YWJzLmxlZnQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBMYWJlbDogbSgyNTMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgVmFsdWU6ICdsaW5rLXZpc2liaWxpdHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgQ29tcG9uZW50OiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbGlua3NWaXNpYmlsaXR5UGFuZWwyWydkZWZhdWx0J10sIHsgcHlkaW86IHB5ZGlvLCBsaW5rTW9kZWw6IGxpbmtzWzBdIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgQWx3YXlzTGFzdDogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWFpbkdlbmVyaWNFZGl0b3IyWydkZWZhdWx0J10sIHtcbiAgICAgICAgICAgICAgICB0YWJzOiB0YWJzLFxuICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICBoZWFkZXI6IGhlYWRlcixcbiAgICAgICAgICAgICAgICBzYXZlRW5hYmxlZDogbW9kZWwuaXNEaXJ0eSgpLFxuICAgICAgICAgICAgICAgIG9uU2F2ZUFjdGlvbjogdGhpcy5zdWJtaXQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICBvbkNsb3NlQWN0aW9uOiB0aGlzLnByb3BzLm9uRGlzbWlzcyxcbiAgICAgICAgICAgICAgICBvblJldmVydEFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBtb2RlbC5yZXZlcnRDaGFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlZGl0b3JPbmVDb2x1bW46IGVkaXRvck9uZUNvbHVtbixcbiAgICAgICAgICAgICAgICBzdHlsZTogeyB3aWR0aDogJzEwMCUnLCBoZWlnaHQ6IG51bGwsIGZsZXg6IDEsIG1pbkhlaWdodDogNTUwLCBjb2xvcjogJ3JnYmEoMCwwLDAsLjgzKScsIGZvbnRTaXplOiAxMyB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBTaW1wbGVMaW5rQ2FyZDtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBTaW1wbGVMaW5rQ2FyZCA9IFBhbGV0dGVNb2RpZmllcih7IHByaW1hcnkxQ29sb3I6ICcjMDA5Njg4JyB9KShTaW1wbGVMaW5rQ2FyZCk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBTaW1wbGVMaW5rQ2FyZDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX2NlbGxzQ3JlYXRlQ2VsbERpYWxvZyA9IHJlcXVpcmUoJy4vY2VsbHMvQ3JlYXRlQ2VsbERpYWxvZycpO1xuXG52YXIgX2NlbGxzQ3JlYXRlQ2VsbERpYWxvZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jZWxsc0NyZWF0ZUNlbGxEaWFsb2cpO1xuXG52YXIgX2NlbGxzRWRpdENlbGxEaWFsb2cgPSByZXF1aXJlKCcuL2NlbGxzL0VkaXRDZWxsRGlhbG9nJyk7XG5cbnZhciBfY2VsbHNFZGl0Q2VsbERpYWxvZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jZWxsc0VkaXRDZWxsRGlhbG9nKTtcblxudmFyIF9jZWxsc0NlbGxDYXJkID0gcmVxdWlyZSgnLi9jZWxscy9DZWxsQ2FyZCcpO1xuXG52YXIgX2NlbGxzQ2VsbENhcmQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY2VsbHNDZWxsQ2FyZCk7XG5cbnZhciBfY29tcG9zaXRlU2ltcGxlTGlua0NhcmQgPSByZXF1aXJlKCcuL2NvbXBvc2l0ZS9TaW1wbGVMaW5rQ2FyZCcpO1xuXG52YXIgX2NvbXBvc2l0ZVNpbXBsZUxpbmtDYXJkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbXBvc2l0ZVNpbXBsZUxpbmtDYXJkKTtcblxudmFyIF9tYWluSW5mb1BhbmVsID0gcmVxdWlyZSgnLi9tYWluL0luZm9QYW5lbCcpO1xuXG52YXIgX21haW5JbmZvUGFuZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpbkluZm9QYW5lbCk7XG5cbnZhciBfY29tcG9zaXRlQ29tcG9zaXRlRGlhbG9nID0gcmVxdWlyZSgnLi9jb21wb3NpdGUvQ29tcG9zaXRlRGlhbG9nJyk7XG5cbnZhciBfY29tcG9zaXRlQ29tcG9zaXRlRGlhbG9nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbXBvc2l0ZUNvbXBvc2l0ZURpYWxvZyk7XG5cbnZhciBfbGlua3NMaW5rTW9kZWwgPSByZXF1aXJlKCcuL2xpbmtzL0xpbmtNb2RlbCcpO1xuXG52YXIgX2xpbmtzTGlua01vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2xpbmtzTGlua01vZGVsKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIgPSByZXF1aXJlKCcuL21haW4vU2hhcmVIZWxwZXInKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9saXN0c1NoYXJlVmlldyA9IHJlcXVpcmUoXCIuL2xpc3RzL1NoYXJlVmlld1wiKTtcblxuZXhwb3J0cy5DcmVhdGVDZWxsRGlhbG9nID0gX2NlbGxzQ3JlYXRlQ2VsbERpYWxvZzJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuRWRpdENlbGxEaWFsb2cgPSBfY2VsbHNFZGl0Q2VsbERpYWxvZzJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuQ2VsbENhcmQgPSBfY2VsbHNDZWxsQ2FyZDJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuSW5mb1BhbmVsID0gX21haW5JbmZvUGFuZWwyWydkZWZhdWx0J107XG5leHBvcnRzLkNvbXBvc2l0ZURpYWxvZyA9IF9jb21wb3NpdGVDb21wb3NpdGVEaWFsb2cyWydkZWZhdWx0J107XG5leHBvcnRzLkxpbmtNb2RlbCA9IF9saW5rc0xpbmtNb2RlbDJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuU2hhcmVIZWxwZXIgPSBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5TaGFyZVZpZXdNb2RhbCA9IF9saXN0c1NoYXJlVmlldy5TaGFyZVZpZXdNb2RhbDtcbmV4cG9ydHMuU2hhcmVWaWV3ID0gX2xpc3RzU2hhcmVWaWV3LlNoYXJlVmlldztcbmV4cG9ydHMuU2ltcGxlTGlua0NhcmQgPSBfY29tcG9zaXRlU2ltcGxlTGlua0NhcmQyWydkZWZhdWx0J107XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyID0gcmVxdWlyZSgnLi4vU2hhcmVDb250ZXh0Q29uc3VtZXInKTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TaGFyZUNvbnRleHRDb25zdW1lcik7XG5cbnZhciBfVGFyZ2V0ZWRVc2VycyA9IHJlcXVpcmUoJy4vVGFyZ2V0ZWRVc2VycycpO1xuXG52YXIgX1RhcmdldGVkVXNlcnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVGFyZ2V0ZWRVc2Vycyk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfcXJjb2RlUmVhY3QgPSByZXF1aXJlKCdxcmNvZGUucmVhY3QnKTtcblxudmFyIF9xcmNvZGVSZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9xcmNvZGVSZWFjdCk7XG5cbnZhciBfY2xpcGJvYXJkID0gcmVxdWlyZSgnY2xpcGJvYXJkJyk7XG5cbnZhciBfY2xpcGJvYXJkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NsaXBib2FyZCk7XG5cbnZhciBfbWFpbkFjdGlvbkJ1dHRvbiA9IHJlcXVpcmUoJy4uL21haW4vQWN0aW9uQnV0dG9uJyk7XG5cbnZhciBfbWFpbkFjdGlvbkJ1dHRvbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYWluQWN0aW9uQnV0dG9uKTtcblxudmFyIF9weWRpb1V0aWxQYXRoID0gcmVxdWlyZSgncHlkaW8vdXRpbC9wYXRoJyk7XG5cbnZhciBfcHlkaW9VdGlsUGF0aDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb1V0aWxQYXRoKTtcblxudmFyIF9weWRpb1V0aWxMYW5nID0gcmVxdWlyZSgncHlkaW8vdXRpbC9sYW5nJyk7XG5cbnZhciBfcHlkaW9VdGlsTGFuZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb1V0aWxMYW5nKTtcblxudmFyIF9tYXRlcmlhbFVpU3R5bGVzID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWkvc3R5bGVzJyk7XG5cbnZhciBfbWFpblNoYXJlSGVscGVyID0gcmVxdWlyZSgnLi4vbWFpbi9TaGFyZUhlbHBlcicpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYWluU2hhcmVIZWxwZXIpO1xuXG4vKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbnZhciBfcHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG52YXIgX3Byb3BUeXBlczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wcm9wVHlwZXMpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfTGlua01vZGVsID0gcmVxdWlyZSgnLi9MaW5rTW9kZWwnKTtcblxudmFyIF9MaW5rTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfTGlua01vZGVsKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoXCJib290XCIpO1xuXG52YXIgVG9vbHRpcCA9IF9QeWRpbyRyZXF1aXJlTGliLlRvb2x0aXA7XG5cbnZhciBQdWJsaWNMaW5rRmllbGQgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoUHVibGljTGlua0ZpZWxkLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFB1YmxpY0xpbmtGaWVsZCgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUHVibGljTGlua0ZpZWxkKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihQdWJsaWNMaW5rRmllbGQucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0geyBlZGl0TGluazogZmFsc2UsIGNvcHlNZXNzYWdlOiAnJywgc2hvd1FSQ29kZTogZmFsc2UgfTtcblxuICAgICAgICB0aGlzLnRvZ2dsZUVkaXRNb2RlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IF90aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIGxpbmtNb2RlbCA9IF9wcm9wcy5saW5rTW9kZWw7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMucHlkaW87XG5cbiAgICAgICAgICAgIGlmIChfdGhpcy5zdGF0ZS5lZGl0TGluayAmJiBfdGhpcy5zdGF0ZS5jdXN0b21MaW5rKSB7XG4gICAgICAgICAgICAgICAgdmFyIGF1dGggPSBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLmdldEF1dGhvcml6YXRpb25zKCk7XG4gICAgICAgICAgICAgICAgaWYgKGF1dGguaGFzaF9taW5fbGVuZ3RoICYmIF90aGlzLnN0YXRlLmN1c3RvbUxpbmsubGVuZ3RoIDwgYXV0aC5oYXNoX21pbl9sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHlkaW8uVUkuZGlzcGxheU1lc3NhZ2UoJ0VSUk9SJywgX3RoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMjIzJykucmVwbGFjZSgnJXMnLCBhdXRoLmhhc2hfbWluX2xlbmd0aCkpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxpbmtNb2RlbC5zZXRDdXN0b21MaW5rKF90aGlzLnN0YXRlLmN1c3RvbUxpbmspO1xuICAgICAgICAgICAgICAgIGxpbmtNb2RlbC5zYXZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGVkaXRMaW5rOiAhX3RoaXMuc3RhdGUuZWRpdExpbmssIGN1c3RvbUxpbms6IHVuZGVmaW5lZCB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNoYW5nZUxpbmsgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICAgICAgICAgIHZhbHVlID0gX3B5ZGlvVXRpbExhbmcyWydkZWZhdWx0J10uY29tcHV0ZVN0cmluZ1NsdWcodmFsdWUpO1xuICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBjdXN0b21MaW5rOiB2YWx1ZSB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNsZWFyQ29weU1lc3NhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBnbG9iYWwuc2V0VGltZW91dCgoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb3B5TWVzc2FnZTogJycgfSk7XG4gICAgICAgICAgICB9KS5iaW5kKF90aGlzKSwgNTAwMCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5hdHRhY2hDbGlwYm9hcmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzMiA9IF90aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIGxpbmtNb2RlbCA9IF9wcm9wczIubGlua01vZGVsO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzMi5weWRpbztcblxuICAgICAgICAgICAgX3RoaXMuZGV0YWNoQ2xpcGJvYXJkKCk7XG4gICAgICAgICAgICBpZiAoX3RoaXMucmVmc1snY29weS1idXR0b24nXSkge1xuICAgICAgICAgICAgICAgIF90aGlzLl9jbGlwID0gbmV3IF9jbGlwYm9hcmQyWydkZWZhdWx0J10oX3RoaXMucmVmc1snY29weS1idXR0b24nXSwge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0OiAoZnVuY3Rpb24gKHRyaWdnZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLmJ1aWxkUHVibGljVXJsKHB5ZGlvLCBsaW5rTW9kZWwuZ2V0TGluaygpKTtcbiAgICAgICAgICAgICAgICAgICAgfSkuYmluZChfdGhpcylcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBfdGhpcy5fY2xpcC5vbignc3VjY2VzcycsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb3B5TWVzc2FnZTogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcxOTInKSB9LCB0aGlzLmNsZWFyQ29weU1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0pLmJpbmQoX3RoaXMpKTtcbiAgICAgICAgICAgICAgICBfdGhpcy5fY2xpcC5vbignZXJyb3InLCAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29weU1lc3NhZ2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChnbG9iYWwubmF2aWdhdG9yLnBsYXRmb3JtLmluZGV4T2YoXCJNYWNcIikgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcHlNZXNzYWdlID0gdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcxNDQnKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvcHlNZXNzYWdlID0gdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcxNDMnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZnNbJ3B1YmxpYy1saW5rLWZpZWxkJ10uZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvcHlNZXNzYWdlOiBjb3B5TWVzc2FnZSB9LCB0aGlzLmNsZWFyQ29weU1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0pLmJpbmQoX3RoaXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRldGFjaENsaXBib2FyZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChfdGhpcy5fY2xpcCkge1xuICAgICAgICAgICAgICAgIF90aGlzLl9jbGlwLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9wZW5NYWlsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy5wcm9wcy5zaG93TWFpbGVyKF90aGlzLnByb3BzLmxpbmtNb2RlbCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy50b2dnbGVRUkNvZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IHNob3dRUkNvZGU6ICFfdGhpcy5zdGF0ZS5zaG93UVJDb2RlIH0pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhQdWJsaWNMaW5rRmllbGQsIFt7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudERpZFVwZGF0ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcbiAgICAgICAgICAgIHRoaXMuYXR0YWNoQ2xpcGJvYXJkKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudERpZE1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAgICAgdGhpcy5hdHRhY2hDbGlwYm9hcmQoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFVubW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgICAgICB0aGlzLmRldGFjaENsaXBib2FyZCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfcHJvcHMzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSBfcHJvcHMzLmxpbmtNb2RlbDtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wczMucHlkaW87XG5cbiAgICAgICAgICAgIHZhciBwdWJsaWNMaW5rID0gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5idWlsZFB1YmxpY1VybChweWRpbywgbGlua01vZGVsLmdldExpbmsoKSk7XG4gICAgICAgICAgICB2YXIgYXV0aCA9IF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uZ2V0QXV0aG9yaXphdGlvbnMoKTtcbiAgICAgICAgICAgIHZhciBlZGl0QWxsb3dlZCA9IHRoaXMucHJvcHMuZWRpdEFsbG93ZWQgJiYgYXV0aC5lZGl0YWJsZV9oYXNoICYmICF0aGlzLnByb3BzLmlzUmVhZG9ubHkoKSAmJiBsaW5rTW9kZWwuaXNFZGl0YWJsZSgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuZWRpdExpbmsgJiYgZWRpdEFsbG93ZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBiYWNrZ3JvdW5kQ29sb3I6ICcjZjVmNWY1JywgcGFkZGluZzogJzAgNnB4JywgbWFyZ2luOiAnMCAtNnB4JywgYm9yZGVyUmFkaXVzOiAyIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZvbnRTaXplOiAxNiwgY29sb3I6ICdyZ2JhKDAsMCwwLDAuNCknLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgbWF4V2lkdGg6IDE2MCwgd2hpdGVTcGFjZTogJ25vd3JhcCcsIG92ZXJmbG93OiAnaGlkZGVuJywgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcHlkaW9VdGlsUGF0aDJbJ2RlZmF1bHQnXS5nZXREaXJuYW1lKHB1YmxpY0xpbmspICsgJy8gJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRleHRGaWVsZCwgeyBzdHlsZTogeyBmbGV4OiAxLCBtYXJnaW5SaWdodDogMTAsIG1hcmdpbkxlZnQ6IDEwIH0sIG9uQ2hhbmdlOiB0aGlzLmNoYW5nZUxpbmssIHZhbHVlOiB0aGlzLnN0YXRlLmN1c3RvbUxpbmsgIT09IHVuZGVmaW5lZCA/IHRoaXMuc3RhdGUuY3VzdG9tTGluayA6IGxpbmtNb2RlbC5nZXRMaW5rKCkuTGlua0hhc2ggfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWFpbkFjdGlvbkJ1dHRvbjJbJ2RlZmF1bHQnXSwgeyBtZGlJY29uOiAnY2hlY2snLCBjYWxsYmFjazogdGhpcy50b2dnbGVFZGl0TW9kZSB9KVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB0ZXh0QWxpZ246ICdjZW50ZXInLCBmb250U2l6ZTogMTMsIGNvbG9yOiAncmdiYSgwLDAsMCwwLjQzKScsIHBhZGRpbmdUb3A6IDE2IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTk0JylcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgICAgIHZhciBjb3B5TWVzc2FnZSA9IF9zdGF0ZS5jb3B5TWVzc2FnZTtcbiAgICAgICAgICAgICAgICB2YXIgbGlua1Rvb2x0aXAgPSBfc3RhdGUubGlua1Rvb2x0aXA7XG5cbiAgICAgICAgICAgICAgICB2YXIgc2V0SHRtbCA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IF9faHRtbDogdGhpcy5zdGF0ZS5jb3B5TWVzc2FnZSB9O1xuICAgICAgICAgICAgICAgIH0pLmJpbmQodGhpcyk7XG4gICAgICAgICAgICAgICAgdmFyIGFjdGlvbkxpbmtzID0gW10sXG4gICAgICAgICAgICAgICAgICAgIHFyQ29kZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB2YXIgbXVpVGhlbWUgPSB0aGlzLnByb3BzLm11aVRoZW1lO1xuXG4gICAgICAgICAgICAgICAgYWN0aW9uTGlua3MucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogXCJjb3B5XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWY6ICdjb3B5LWJ1dHRvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBwb3NpdGlvbjogJ3JlbGF0aXZlJywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIHdpZHRoOiAzNiwgaGVpZ2h0OiAzNiwgcGFkZGluZzogJzhweCAxMHB4JywgbWFyZ2luOiAnMCA2cHgnLCBjdXJzb3I6ICdwb2ludGVyJywgYm9yZGVyUmFkaXVzOiAnNTAlJywgYm9yZGVyOiAnMXB4IHNvbGlkICcgKyBtdWlUaGVtZS5wYWxldHRlLnByaW1hcnkxQ29sb3IgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VPdmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgbGlua1Rvb2x0aXA6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZU91dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IGxpbmtUb29sdGlwOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoVG9vbHRpcCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGNvcHlNZXNzYWdlID8gY29weU1lc3NhZ2UgOiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE5MScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgaG9yaXpvbnRhbFBvc2l0aW9uOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmVydGljYWxQb3NpdGlvbjogXCJib3R0b21cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3c6IGxpbmtUb29sdGlwXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnY29weS1saW5rLWJ1dHRvbiBtZGkgbWRpLWNvbnRlbnQtY29weScsIHN0eWxlOiB7IGNvbG9yOiBtdWlUaGVtZS5wYWxldHRlLnByaW1hcnkxQ29sb3IgfSB9KVxuICAgICAgICAgICAgICAgICkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc2hvd01haWxlcikge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb25MaW5rcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYWluQWN0aW9uQnV0dG9uMlsnZGVmYXVsdCddLCB7IGtleTogJ291dGxpbmUnLCBjYWxsYmFjazogdGhpcy5vcGVuTWFpbGVyLCBtZGlJY29uOiAnZW1haWwtb3V0bGluZScsIG1lc3NhZ2VJZDogJzQ1JyB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChlZGl0QWxsb3dlZCkge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb25MaW5rcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYWluQWN0aW9uQnV0dG9uMlsnZGVmYXVsdCddLCB7IGtleTogJ3BlbmNpbCcsIGNhbGxiYWNrOiB0aGlzLnRvZ2dsZUVkaXRNb2RlLCBtZGlJY29uOiAncGVuY2lsJywgbWVzc2FnZUlkOiBcIjE5M1wiIH0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10ucXJjb2RlRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbkxpbmtzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21haW5BY3Rpb25CdXR0b24yWydkZWZhdWx0J10sIHsga2V5OiAncXJjb2RlJywgY2FsbGJhY2s6IHRoaXMudG9nZ2xlUVJDb2RlLCBtZGlJY29uOiAncXJjb2RlJywgbWVzc2FnZUlkOiAnOTQnIH0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGFjdGlvbkxpbmtzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb25MaW5rcyA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgbWFyZ2luOiAnMjBweCAwIDEwcHgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb25MaW5rcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb25MaW5rcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnNob3dRUkNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcXJDb2RlID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5QYXBlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgekRlcHRoOiAxLCBzdHlsZTogeyB3aWR0aDogMTIwLCBwYWRkaW5nVG9wOiAxMCwgb3ZlcmZsb3c6ICdoaWRkZW4nLCBtYXJnaW46ICcwIGF1dG8nLCBoZWlnaHQ6IDEyMCwgdGV4dEFsaWduOiAnY2VudGVyJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfcXJjb2RlUmVhY3QyWydkZWZhdWx0J10sIHsgc2l6ZTogMTAwLCB2YWx1ZTogcHVibGljTGluaywgbGV2ZWw6ICdRJyB9KVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHFyQ29kZSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlBhcGVyLCB7IHpEZXB0aDogMCwgc3R5bGU6IHsgd2lkdGg6IDEyMCwgb3ZlcmZsb3c6ICdoaWRkZW4nLCBtYXJnaW46ICcwIGF1dG8nLCBoZWlnaHQ6IDAsIHRleHRBbGlnbjogJ2NlbnRlcicgfSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5QYXBlcixcbiAgICAgICAgICAgICAgICAgICAgeyB6RGVwdGg6IDAsIHJvdW5kZWQ6IGZhbHNlLCBjbGFzc05hbWU6ICdwdWJsaWMtbGluay1jb250YWluZXInIH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdMaW5rJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY6ICdwdWJsaWMtbGluay1maWVsZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHB1YmxpY0xpbmssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Gb2N1czogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZS50YXJnZXQuc2VsZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgaGVpZ2h0OiA0MCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0U3R5bGU6IHsgdGV4dEFsaWduOiAnY2VudGVyJywgYmFja2dyb3VuZENvbG9yOiAnI2Y1ZjVmNScsIGJvcmRlclJhZGl1czogMiwgcGFkZGluZzogJzAgNXB4JyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuZGVybGluZVN0eWxlOiB7IGJvcmRlckNvbG9yOiAnI2Y1ZjVmNScsIHRleHREZWNvcmF0aW9uOiBsaW5rTW9kZWwuaXNFeHBpcmVkKCkgPyAnbGluZS10aHJvdWdoJyA6IG51bGwgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmRlcmxpbmVGb2N1c1N0eWxlOiB7IGJvdHRvbTogMCB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBmYWxzZSAmJiB0aGlzLnByb3BzLmxpbmtEYXRhLnRhcmdldF91c2VycyAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfVGFyZ2V0ZWRVc2VyczJbJ2RlZmF1bHQnXSwgdGhpcy5wcm9wcyksXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbkxpbmtzLFxuICAgICAgICAgICAgICAgICAgICBxckNvZGVcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfV0sIFt7XG4gICAgICAgIGtleTogJ3Byb3BUeXBlcycsXG4gICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICBsaW5rTW9kZWw6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uaW5zdGFuY2VPZihfTGlua01vZGVsMlsnZGVmYXVsdCddKSxcbiAgICAgICAgICAgIGVkaXRBbGxvd2VkOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLmJvb2wsXG4gICAgICAgICAgICBvbkNoYW5nZTogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5mdW5jLFxuICAgICAgICAgICAgc2hvd01haWxlcjogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5mdW5jXG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICB9XSk7XG5cbiAgICByZXR1cm4gUHVibGljTGlua0ZpZWxkO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFB1YmxpY0xpbmtGaWVsZCA9ICgwLCBfbWF0ZXJpYWxVaVN0eWxlcy5tdWlUaGVtZWFibGUpKCkoUHVibGljTGlua0ZpZWxkKTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFB1YmxpY0xpbmtGaWVsZCA9ICgwLCBfU2hhcmVDb250ZXh0Q29uc3VtZXIyWydkZWZhdWx0J10pKFB1YmxpY0xpbmtGaWVsZCk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBQdWJsaWNMaW5rRmllbGQ7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxudmFyIF9wcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbnZhciBfcHJvcFR5cGVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3Byb3BUeXBlcyk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9MaW5rTW9kZWwgPSByZXF1aXJlKCcuL0xpbmtNb2RlbCcpO1xuXG52YXIgX0xpbmtNb2RlbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9MaW5rTW9kZWwpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignaG9jJyk7XG5cbnZhciBNb2Rlcm5UZXh0RmllbGQgPSBfUHlkaW8kcmVxdWlyZUxpYi5Nb2Rlcm5UZXh0RmllbGQ7XG5cbnZhciBMYWJlbFBhbmVsID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKExhYmVsUGFuZWwsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gTGFiZWxQYW5lbCgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIExhYmVsUGFuZWwpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKExhYmVsUGFuZWwucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoTGFiZWxQYW5lbCwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIGxpbmtNb2RlbCA9IF9wcm9wcy5saW5rTW9kZWw7XG5cbiAgICAgICAgICAgIHZhciBtID0gZnVuY3Rpb24gbShpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBweWRpby5NZXNzYWdlSGFzaFsnc2hhcmVfY2VudGVyLicgKyBpZF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIGxpbmsgPSBsaW5rTW9kZWwuZ2V0TGluaygpO1xuICAgICAgICAgICAgdmFyIHVwZGF0ZUxhYmVsID0gZnVuY3Rpb24gdXBkYXRlTGFiZWwoZSwgdikge1xuICAgICAgICAgICAgICAgIGxpbmsuTGFiZWwgPSB2O1xuICAgICAgICAgICAgICAgIGxpbmtNb2RlbC51cGRhdGVMaW5rKGxpbmspO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHVwZGF0ZURlc2NyaXB0aW9uID0gZnVuY3Rpb24gdXBkYXRlRGVzY3JpcHRpb24oZSwgdikge1xuICAgICAgICAgICAgICAgIGxpbmsuRGVzY3JpcHRpb24gPSB2O1xuICAgICAgICAgICAgICAgIGxpbmtNb2RlbC51cGRhdGVMaW5rKGxpbmspO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoTW9kZXJuVGV4dEZpZWxkLCB7IGZsb2F0aW5nTGFiZWxUZXh0OiBtKDI2NSksIHZhbHVlOiBsaW5rLkxhYmVsLCBvbkNoYW5nZTogdXBkYXRlTGFiZWwsIGZ1bGxXaWR0aDogdHJ1ZSB9KSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNb2Rlcm5UZXh0RmllbGQsIHsgZmxvYXRpbmdMYWJlbFRleHQ6IG0oMjY2KSwgdmFsdWU6IGxpbmsuRGVzY3JpcHRpb24sIG9uQ2hhbmdlOiB1cGRhdGVEZXNjcmlwdGlvbiwgZnVsbFdpZHRoOiB0cnVlIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIExhYmVsUGFuZWw7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuTGFiZWxQYW5lbC5Qcm9wVHlwZXMgPSB7XG5cbiAgICBweWRpbzogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5pbnN0YW5jZU9mKF9weWRpbzJbJ2RlZmF1bHQnXSksXG4gICAgbGlua01vZGVsOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLmluc3RhbmNlT2YoX0xpbmtNb2RlbDJbJ2RlZmF1bHQnXSlcblxufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gTGFiZWxQYW5lbDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMjEgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX3B5ZGlvSHR0cEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cEFwaSk7XG5cbnZhciBfcHlkaW9MYW5nT2JzZXJ2YWJsZSA9IHJlcXVpcmUoJ3B5ZGlvL2xhbmcvb2JzZXJ2YWJsZScpO1xuXG52YXIgX3B5ZGlvTGFuZ09ic2VydmFibGUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9MYW5nT2JzZXJ2YWJsZSk7XG5cbnZhciBfbWFpblNoYXJlSGVscGVyID0gcmVxdWlyZSgnLi4vbWFpbi9TaGFyZUhlbHBlcicpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYWluU2hhcmVIZWxwZXIpO1xuXG52YXIgX2NlbGxzU2RrID0gcmVxdWlyZSgnY2VsbHMtc2RrJyk7XG5cbnZhciBfcHlkaW9VdGlsUGFzcyA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvcGFzcycpO1xuXG52YXIgX3B5ZGlvVXRpbFBhc3MyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9VdGlsUGFzcyk7XG5cbnZhciBMaW5rTW9kZWwgPSAoZnVuY3Rpb24gKF9PYnNlcnZhYmxlKSB7XG4gICAgX2luaGVyaXRzKExpbmtNb2RlbCwgX09ic2VydmFibGUpO1xuXG4gICAgZnVuY3Rpb24gTGlua01vZGVsKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTGlua01vZGVsKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihMaW5rTW9kZWwucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzKTtcbiAgICAgICAgdGhpcy5saW5rID0gbmV3IF9jZWxsc1Nkay5SZXN0U2hhcmVMaW5rKCk7XG4gICAgICAgIHRoaXMubGluay5QZXJtaXNzaW9ucyA9IFtfY2VsbHNTZGsuUmVzdFNoYXJlTGlua0FjY2Vzc1R5cGUuY29uc3RydWN0RnJvbU9iamVjdChcIlByZXZpZXdcIiksIF9jZWxsc1Nkay5SZXN0U2hhcmVMaW5rQWNjZXNzVHlwZS5jb25zdHJ1Y3RGcm9tT2JqZWN0KFwiRG93bmxvYWRcIildO1xuICAgICAgICB0aGlzLmxpbmsuUG9saWNpZXMgPSBbXTtcbiAgICAgICAgdGhpcy5saW5rLlBvbGljaWVzQ29udGV4dEVkaXRhYmxlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5saW5rLlJvb3ROb2RlcyA9IFtdO1xuICAgICAgICB0aGlzLlZhbGlkUGFzc3dvcmQgPSB0cnVlO1xuICAgICAgICB0aGlzLmxvYWRFcnJvciA9IG51bGw7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKExpbmtNb2RlbCwgW3tcbiAgICAgICAga2V5OiAnaGFzRXJyb3InLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gaGFzRXJyb3IoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sb2FkRXJyb3I7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2lzRWRpdGFibGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gaXNFZGl0YWJsZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxpbmsuUG9saWNpZXNDb250ZXh0RWRpdGFibGU7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2lzRGlydHknLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gaXNEaXJ0eSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRpcnR5O1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRMaW5rVXVpZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRMaW5rVXVpZCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxpbmsuVXVpZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcmV0dXJuIHtSZXN0U2hhcmVMaW5rfVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldExpbmsnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0TGluaygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxpbms7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldFB1YmxpY1VybCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRQdWJsaWNVcmwoKSB7XG4gICAgICAgICAgICByZXR1cm4gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5idWlsZFB1YmxpY1VybChfcHlkaW8yWydkZWZhdWx0J10uZ2V0SW5zdGFuY2UoKSwgdGhpcy5saW5rKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gbGluayB7UmVzdFNoYXJlTGlua31cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICd1cGRhdGVMaW5rJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZUxpbmsobGluaykge1xuICAgICAgICAgICAgdGhpcy5saW5rID0gbGluaztcbiAgICAgICAgICAgIHRoaXMubm90aWZ5RGlydHkoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnbm90aWZ5RGlydHknLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbm90aWZ5RGlydHkoKSB7XG4gICAgICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5KCd1cGRhdGUnKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmV2ZXJ0Q2hhbmdlcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZXZlcnRDaGFuZ2VzKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMub3JpZ2luYWxMaW5rKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5saW5rID0gdGhpcy5jbG9uZSh0aGlzLm9yaWdpbmFsTGluayk7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUGFzc3dvcmQgPSB0aGlzLmNyZWF0ZVBhc3N3b3JkID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLlZhbGlkUGFzc3dvcmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5KCd1cGRhdGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnaGFzUGVybWlzc2lvbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBoYXNQZXJtaXNzaW9uKHBlcm1pc3Npb25WYWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGluay5QZXJtaXNzaW9ucy5maWx0ZXIoZnVuY3Rpb24gKHBlcm0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGVybSA9PT0gcGVybWlzc2lvblZhbHVlO1xuICAgICAgICAgICAgfSkubGVuZ3RoID4gMDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnaXNFeHBpcmVkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGlzRXhwaXJlZCgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxpbmsuTWF4RG93bmxvYWRzICYmIHBhcnNlSW50KHRoaXMubGluay5DdXJyZW50RG93bmxvYWRzKSA+PSBwYXJzZUludCh0aGlzLmxpbmsuTWF4RG93bmxvYWRzKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubGluay5BY2Nlc3NFbmQpIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHV1aWQgc3RyaW5nXG4gICAgICAgICAqIEByZXR1cm4ge1Byb21pc2UuPFJlc3RTaGFyZUxpbms+fVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2xvYWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbG9hZCh1dWlkKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9jZWxsc1Nkay5TaGFyZVNlcnZpY2VBcGkoX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCkpO1xuICAgICAgICAgICAgcmV0dXJuIGFwaS5nZXRTaGFyZUxpbmsodXVpZCkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMubGluayA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICBpZiAoIV90aGlzLmxpbmsuUGVybWlzc2lvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMubGluay5QZXJtaXNzaW9ucyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIV90aGlzLmxpbmsuUG9saWNpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMubGluay5Qb2xpY2llcyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIV90aGlzLmxpbmsuUm9vdE5vZGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmxpbmsuUm9vdE5vZGVzID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF90aGlzLm9yaWdpbmFsTGluayA9IF90aGlzLmNsb25lKF90aGlzLmxpbmspO1xuICAgICAgICAgICAgICAgIF90aGlzLm5vdGlmeShcInVwZGF0ZVwiKTtcbiAgICAgICAgICAgIH0pWydjYXRjaCddKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5sb2FkRXJyb3IgPSBlcnI7XG4gICAgICAgICAgICAgICAgX3RoaXMubm90aWZ5KFwidXBkYXRlXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3NldENyZWF0ZVBhc3N3b3JkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNldENyZWF0ZVBhc3N3b3JkKHBhc3N3b3JkKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHBhc3N3b3JkKSB7XG4gICAgICAgICAgICAgICAgX3B5ZGlvVXRpbFBhc3MyWydkZWZhdWx0J10uY2hlY2tQYXNzd29yZFN0cmVuZ3RoKHBhc3N3b3JkLCBmdW5jdGlvbiAob2ssIG1zZykge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIuVmFsaWRQYXNzd29yZCA9IG9rO1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIuVmFsaWRQYXNzd29yZE1lc3NhZ2UgPSBtc2c7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuVmFsaWRQYXNzd29yZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVBhc3N3b3JkID0gcGFzc3dvcmQ7XG4gICAgICAgICAgICB0aGlzLmxpbmsuUGFzc3dvcmRSZXF1aXJlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeURpcnR5KCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3NldFVwZGF0ZVBhc3N3b3JkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNldFVwZGF0ZVBhc3N3b3JkKHBhc3N3b3JkKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHBhc3N3b3JkKSB7XG4gICAgICAgICAgICAgICAgX3B5ZGlvVXRpbFBhc3MyWydkZWZhdWx0J10uY2hlY2tQYXNzd29yZFN0cmVuZ3RoKHBhc3N3b3JkLCBmdW5jdGlvbiAob2ssIG1zZykge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczMuVmFsaWRQYXNzd29yZCA9IG9rO1xuICAgICAgICAgICAgICAgICAgICBfdGhpczMuVmFsaWRQYXNzd29yZE1lc3NhZ2UgPSBtc2c7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuVmFsaWRQYXNzd29yZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVBhc3N3b3JkID0gcGFzc3dvcmQ7XG4gICAgICAgICAgICB0aGlzLm5vdGlmeURpcnR5KCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3NldEN1c3RvbUxpbmsnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2V0Q3VzdG9tTGluayhuZXdMaW5rKSB7XG4gICAgICAgICAgICB0aGlzLmN1c3RvbUxpbmsgPSBuZXdMaW5rO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEByZXR1cm4geyp8UHJvbWlzZS48UmVzdFNoYXJlTGluaz59XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc2F2ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzYXZlKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5WYWxpZFBhc3N3b3JkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRoaXMuVmFsaWRQYXNzd29yZE1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfY2VsbHNTZGsuU2hhcmVTZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IF9jZWxsc1Nkay5SZXN0UHV0U2hhcmVMaW5rUmVxdWVzdCgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuY3JlYXRlUGFzc3dvcmQpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0LlBhc3N3b3JkRW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5DcmVhdGVQYXNzd29yZCA9IHRoaXMuY3JlYXRlUGFzc3dvcmQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMudXBkYXRlUGFzc3dvcmQpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0LlBhc3N3b3JkRW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmxpbmsuUGFzc3dvcmRSZXF1aXJlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0LkNyZWF0ZVBhc3N3b3JkID0gdGhpcy51cGRhdGVQYXNzd29yZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0LlVwZGF0ZVBhc3N3b3JkID0gdGhpcy51cGRhdGVQYXNzd29yZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QuUGFzc3dvcmRFbmFibGVkID0gdGhpcy5saW5rLlBhc3N3b3JkUmVxdWlyZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYXV0aHogPSBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLmdldEF1dGhvcml6YXRpb25zKCk7XG4gICAgICAgICAgICBpZiAoYXV0aHoucGFzc3dvcmRfbWFuZGF0b3J5ICYmICFyZXF1ZXN0LlBhc3N3b3JkRW5hYmxlZCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihfcHlkaW8yWydkZWZhdWx0J10uZ2V0TWVzc2FnZXMoKVsnc2hhcmVfY2VudGVyLjE3NSddKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYXJzZUludChhdXRoei5tYXhfZG93bmxvYWRzKSA+IDAgJiYgIXBhcnNlSW50KHRoaXMubGluay5NYXhEb3dubG9hZHMpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5saW5rLk1heERvd25sb2FkcyA9IFwiXCIgKyBwYXJzZUludChhdXRoei5tYXhfZG93bmxvYWRzKTtcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeSgndXBkYXRlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFyc2VJbnQoYXV0aHoubWF4X2V4cGlyYXRpb24pID4gMCAmJiAhcGFyc2VJbnQodGhpcy5saW5rLkFjY2Vzc0VuZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxpbmsuQWNjZXNzRW5kID0gXCJcIiArIChNYXRoLnJvdW5kKG5ldyBEYXRlKCkgLyAxMDAwKSArIHBhcnNlSW50KGF1dGh6Lm1heF9leHBpcmF0aW9uKSAqIDYwICogNjAgKiAyNCk7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuY3VzdG9tTGluayAmJiB0aGlzLmN1c3RvbUxpbmsgIT09IHRoaXMubGluay5MaW5rSGFzaCkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QuVXBkYXRlQ3VzdG9tSGFzaCA9IHRoaXMuY3VzdG9tTGluaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcXVlc3QuU2hhcmVMaW5rID0gdGhpcy5saW5rO1xuICAgICAgICAgICAgcmV0dXJuIGFwaS5wdXRTaGFyZUxpbmsocmVxdWVzdCkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgX3RoaXM0LmxpbmsgPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgX3RoaXM0LmRpcnR5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgX3RoaXM0Lm9yaWdpbmFsTGluayA9IF90aGlzNC5jbG9uZShfdGhpczQubGluayk7XG4gICAgICAgICAgICAgICAgX3RoaXM0LnVwZGF0ZVBhc3N3b3JkID0gX3RoaXM0LmNyZWF0ZVBhc3N3b3JkID0gX3RoaXM0LmN1c3RvbUxpbmsgPSBudWxsO1xuICAgICAgICAgICAgICAgIF90aGlzNC5WYWxpZFBhc3N3b3JkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBfdGhpczQubm90aWZ5KCd1cGRhdGUnKTtcbiAgICAgICAgICAgICAgICBfdGhpczQubm90aWZ5KCdzYXZlJyk7XG4gICAgICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1zZyA9IGVyci5EZXRhaWwgfHwgZXJyLm1lc3NhZ2UgfHwgZXJyO1xuICAgICAgICAgICAgICAgIF9weWRpbzJbJ2RlZmF1bHQnXS5nZXRJbnN0YW5jZSgpLlVJLmRpc3BsYXlNZXNzYWdlKCdFUlJPUicsIG1zZyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcmV0dXJuIHsqfFByb21pc2UuPFJlc3RTaGFyZUxpbms+fVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2RlbGV0ZUxpbmsnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZGVsZXRlTGluayhlbXB0eUxpbmspIHtcbiAgICAgICAgICAgIHZhciBfdGhpczUgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9jZWxsc1Nkay5TaGFyZVNlcnZpY2VBcGkoX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCkpO1xuICAgICAgICAgICAgcmV0dXJuIGFwaS5kZWxldGVTaGFyZUxpbmsodGhpcy5saW5rLlV1aWQpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIF90aGlzNS5saW5rID0gZW1wdHlMaW5rO1xuICAgICAgICAgICAgICAgIF90aGlzNS5kaXJ0eSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIF90aGlzNS51cGRhdGVQYXNzd29yZCA9IF90aGlzNS5jcmVhdGVQYXNzd29yZCA9IF90aGlzNS5jdXN0b21MaW5rID0gbnVsbDtcbiAgICAgICAgICAgICAgICBfdGhpczUubm90aWZ5KCd1cGRhdGUnKTtcbiAgICAgICAgICAgICAgICBfdGhpczUubm90aWZ5KCdkZWxldGUnKTtcbiAgICAgICAgICAgIH0pWydjYXRjaCddKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICB2YXIgbXNnID0gZXJyLkRldGFpbCB8fCBlcnIubWVzc2FnZSB8fCBlcnI7XG4gICAgICAgICAgICAgICAgcHlkaW8uVUkuZGlzcGxheU1lc3NhZ2UoJ0VSUk9SJywgbXNnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSBsaW5rIHtSZXN0U2hhcmVMaW5rfVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Nsb25lJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNsb25lKGxpbmspIHtcbiAgICAgICAgICAgIHJldHVybiBfY2VsbHNTZGsuUmVzdFNoYXJlTGluay5jb25zdHJ1Y3RGcm9tT2JqZWN0KEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobGluaykpKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBMaW5rTW9kZWw7XG59KShfcHlkaW9MYW5nT2JzZXJ2YWJsZTJbJ2RlZmF1bHQnXSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IExpbmtNb2RlbDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lciA9IHJlcXVpcmUoJy4uL1NoYXJlQ29udGV4dENvbnN1bWVyJyk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU2hhcmVDb250ZXh0Q29uc3VtZXIpO1xuXG52YXIgX0ZpZWxkID0gcmVxdWlyZSgnLi9GaWVsZCcpO1xuXG52YXIgX0ZpZWxkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0ZpZWxkKTtcblxudmFyIF9QZXJtaXNzaW9ucyA9IHJlcXVpcmUoJy4vUGVybWlzc2lvbnMnKTtcblxudmFyIF9QZXJtaXNzaW9uczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9QZXJtaXNzaW9ucyk7XG5cbnZhciBfVGFyZ2V0ZWRVc2VycyA9IHJlcXVpcmUoJy4vVGFyZ2V0ZWRVc2VycycpO1xuXG52YXIgX1RhcmdldGVkVXNlcnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVGFyZ2V0ZWRVc2Vycyk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfTGlua01vZGVsID0gcmVxdWlyZSgnLi9MaW5rTW9kZWwnKTtcblxudmFyIF9MaW5rTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfTGlua01vZGVsKTtcblxudmFyIF9jb21wb3NpdGVDb21wb3NpdGVNb2RlbCA9IHJlcXVpcmUoJy4uL2NvbXBvc2l0ZS9Db21wb3NpdGVNb2RlbCcpO1xuXG52YXIgX2NvbXBvc2l0ZUNvbXBvc2l0ZU1vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbXBvc2l0ZUNvbXBvc2l0ZU1vZGVsKTtcblxuLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMjEgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG52YXIgX3Byb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxudmFyIF9wcm9wVHlwZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHJvcFR5cGVzKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX21haW5TaGFyZUhlbHBlciA9IHJlcXVpcmUoJy4uL21haW4vU2hhcmVIZWxwZXInKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2Zvcm0nKTtcblxudmFyIFZhbGlkUGFzc3dvcmQgPSBfUHlkaW8kcmVxdWlyZUxpYi5WYWxpZFBhc3N3b3JkO1xuXG52YXIgUHVibGljTGlua1BhbmVsID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFB1YmxpY0xpbmtQYW5lbCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBQdWJsaWNMaW5rUGFuZWwoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFB1YmxpY0xpbmtQYW5lbCk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoUHVibGljTGlua1BhbmVsLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHsgc2hvd1RlbXBvcmFyeVBhc3N3b3JkOiBmYWxzZSwgdGVtcG9yYXJ5UGFzc3dvcmQ6IG51bGwsIHNhdmluZzogZmFsc2UgfTtcblxuICAgICAgICB0aGlzLnRvZ2dsZUxpbmsgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gX3RoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgbGlua01vZGVsID0gX3Byb3BzLmxpbmtNb2RlbDtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcbiAgICAgICAgICAgIHZhciBzaG93VGVtcG9yYXJ5UGFzc3dvcmQgPSBfdGhpcy5zdGF0ZS5zaG93VGVtcG9yYXJ5UGFzc3dvcmQ7XG5cbiAgICAgICAgICAgIGlmIChzaG93VGVtcG9yYXJ5UGFzc3dvcmQpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IHNob3dUZW1wb3JhcnlQYXNzd29yZDogZmFsc2UsIHRlbXBvcmFyeVBhc3N3b3JkOiBudWxsIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghbGlua01vZGVsLmdldExpbmtVdWlkKCkgJiYgX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5nZXRBdXRob3JpemF0aW9ucygpLnBhc3N3b3JkX21hbmRhdG9yeSkge1xuICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgc2hvd1RlbXBvcmFyeVBhc3N3b3JkOiB0cnVlLCB0ZW1wb3JhcnlQYXNzd29yZDogJycgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgc2F2aW5nOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIGlmIChsaW5rTW9kZWwuZ2V0TGlua1V1aWQoKSkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5wcm9wcy5jb21wb3NpdGVNb2RlbC5kZWxldGVMaW5rKGxpbmtNb2RlbClbJ2NhdGNoJ10oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBzYXZpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgc2F2aW5nOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGlua01vZGVsLnNhdmUoKVsnY2F0Y2gnXShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IHNhdmluZzogZmFsc2UgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBzYXZpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy51cGRhdGVUZW1wb3JhcnlQYXNzd29yZCA9IGZ1bmN0aW9uICh2YWx1ZSwgZXZlbnQpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBldmVudC5jdXJyZW50VGFyZ2V0LmdldFZhbHVlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IHRlbXBvcmFyeVBhc3N3b3JkOiB2YWx1ZSB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmVuYWJsZUxpbmtXaXRoUGFzc3dvcmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbGlua01vZGVsID0gX3RoaXMucHJvcHMubGlua01vZGVsO1xuXG4gICAgICAgICAgICBpZiAoIV90aGlzLnJlZnNbJ3ZhbGlkLXBhc3MnXS5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5wcm9wcy5weWRpby5VSS5kaXNwbGF5TWVzc2FnZSgnRVJST1InLCAnSW52YWxpZCBQYXNzd29yZCcpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxpbmtNb2RlbC5zZXRDcmVhdGVQYXNzd29yZChfdGhpcy5zdGF0ZS50ZW1wb3JhcnlQYXNzd29yZCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxpbmtNb2RlbC5zYXZlKCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMucHJvcHMucHlkaW8uVUkuZGlzcGxheU1lc3NhZ2UoJ0VSUk9SJywgZS5tZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgc2hvd1RlbXBvcmFyeVBhc3N3b3JkOiBmYWxzZSwgdGVtcG9yYXJ5UGFzc3dvcmQ6IG51bGwgfSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFB1YmxpY0xpbmtQYW5lbCwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSBfcHJvcHMyLmxpbmtNb2RlbDtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wczIucHlkaW87XG4gICAgICAgICAgICB2YXIgY29tcG9zaXRlTW9kZWwgPSBfcHJvcHMyLmNvbXBvc2l0ZU1vZGVsO1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgc2hvd1RlbXBvcmFyeVBhc3N3b3JkID0gX3N0YXRlLnNob3dUZW1wb3JhcnlQYXNzd29yZDtcbiAgICAgICAgICAgIHZhciB0ZW1wb3JhcnlQYXNzd29yZCA9IF9zdGF0ZS50ZW1wb3JhcnlQYXNzd29yZDtcbiAgICAgICAgICAgIHZhciBzYXZpbmcgPSBfc3RhdGUuc2F2aW5nO1xuXG4gICAgICAgICAgICB2YXIgYXV0aG9yaXphdGlvbnMgPSBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLmdldEF1dGhvcml6YXRpb25zKCk7XG4gICAgICAgICAgICB2YXIgbm9kZUxlYWYgPSBjb21wb3NpdGVNb2RlbC5nZXROb2RlKCkuaXNMZWFmKCk7XG4gICAgICAgICAgICB2YXIgY2FuRW5hYmxlID0gbm9kZUxlYWYgJiYgYXV0aG9yaXphdGlvbnMuZmlsZV9wdWJsaWNfbGluayB8fCAhbm9kZUxlYWYgJiYgYXV0aG9yaXphdGlvbnMuZm9sZGVyX3B1YmxpY19saW5rO1xuXG4gICAgICAgICAgICB2YXIgcHVibGljTGlua1BhbmVzID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHB1YmxpY0xpbmtGaWVsZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChsaW5rTW9kZWwuZ2V0TGlua1V1aWQoKSkge1xuICAgICAgICAgICAgICAgIHB1YmxpY0xpbmtGaWVsZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9GaWVsZDJbJ2RlZmF1bHQnXSwge1xuICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgIGxpbmtNb2RlbDogbGlua01vZGVsLFxuICAgICAgICAgICAgICAgICAgICBzaG93TWFpbGVyOiB0aGlzLnByb3BzLnNob3dNYWlsZXIsXG4gICAgICAgICAgICAgICAgICAgIGVkaXRBbGxvd2VkOiBhdXRob3JpemF0aW9ucy5lZGl0YWJsZV9oYXNoICYmIGxpbmtNb2RlbC5pc0VkaXRhYmxlKCksXG4gICAgICAgICAgICAgICAgICAgIGtleTogJ3B1YmxpYy1saW5rJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHB1YmxpY0xpbmtQYW5lcyA9IFtfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5EaXZpZGVyLCBudWxsKSwgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX1Blcm1pc3Npb25zMlsnZGVmYXVsdCddLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvc2l0ZU1vZGVsOiBjb21wb3NpdGVNb2RlbCxcbiAgICAgICAgICAgICAgICAgICAgbGlua01vZGVsOiBsaW5rTW9kZWwsXG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICAgICAga2V5OiAncHVibGljLXBlcm0nXG4gICAgICAgICAgICAgICAgfSldO1xuICAgICAgICAgICAgICAgIGlmIChsaW5rTW9kZWwuZ2V0TGluaygpLlRhcmdldFVzZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIHB1YmxpY0xpbmtQYW5lcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIG51bGwpKTtcbiAgICAgICAgICAgICAgICAgICAgcHVibGljTGlua1BhbmVzLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX1RhcmdldGVkVXNlcnMyWydkZWZhdWx0J10sIHsgbGlua01vZGVsOiBsaW5rTW9kZWwsIHB5ZGlvOiBweWRpbyB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChzaG93VGVtcG9yYXJ5UGFzc3dvcmQpIHtcbiAgICAgICAgICAgICAgICBwdWJsaWNMaW5rRmllbGQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ3NlY3Rpb24tbGVnZW5kJywgc3R5bGU6IHsgbWFyZ2luVG9wOiAyMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzIxNScpXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiAnMTAwJScgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoVmFsaWRQYXNzd29yZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHsgbGFiZWw6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMjMnKSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0ZW1wb3JhcnlQYXNzd29yZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy51cGRhdGVUZW1wb3JhcnlQYXNzd29yZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY6IFwidmFsaWQtcGFzc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB0ZXh0QWxpZ246ICdjZW50ZXInLCBtYXJnaW5Ub3A6IDIwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhaXNlZEJ1dHRvbiwgeyBsYWJlbDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCc5MicpLCBzZWNvbmRhcnk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljazogdGhpcy5lbmFibGVMaW5rV2l0aFBhc3N3b3JkIH0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghY2FuRW5hYmxlKSB7XG4gICAgICAgICAgICAgICAgcHVibGljTGlua0ZpZWxkID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogNTAwLCBjb2xvcjogJ3JnYmEoMCwwLDAsMC40MyknLCBwYWRkaW5nQm90dG9tOiAxNiwgcGFkZGluZ1RvcDogMTYgfSB9LFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmdldE1lc3NhZ2Uobm9kZUxlYWYgPyAnMjI1JyA6ICcyMjYnKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHB1YmxpY0xpbmtGaWVsZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmb250U2l6ZTogMTMsIGZvbnRXZWlnaHQ6IDUwMCwgY29sb3I6ICdyZ2JhKDAsMCwwLDAuNDMpJywgcGFkZGluZ0JvdHRvbTogMTYsIHBhZGRpbmdUb3A6IDE2IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcxOTAnKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogdGhpcy5wcm9wcy5zdHlsZSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAnMTVweCAxMHB4IDExcHgnLCBiYWNrZ3JvdW5kQ29sb3I6ICcjZjVmNWY1JywgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNlMGUwZTAnLCBmb250U2l6ZTogMTUgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Ub2dnbGUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiB0aGlzLnByb3BzLmlzUmVhZG9ubHkoKSB8fCBzYXZpbmcgfHwgIWxpbmtNb2RlbC5pc0VkaXRhYmxlKCkgfHwgIWxpbmtNb2RlbC5nZXRMaW5rVXVpZCgpICYmICFjYW5FbmFibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZTogdGhpcy50b2dnbGVMaW5rLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9nZ2xlZDogbGlua01vZGVsLmdldExpbmtVdWlkKCkgfHwgc2hvd1RlbXBvcmFyeVBhc3N3b3JkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTg5JylcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHNhdmluZyAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiAzMDAsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkNpcmN1bGFyUHJvZ3Jlc3MsIG51bGwpXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAhc2F2aW5nICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAyMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgIHB1YmxpY0xpbmtGaWVsZFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgIXNhdmluZyAmJiBwdWJsaWNMaW5rUGFuZXNcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSwgW3tcbiAgICAgICAga2V5OiAncHJvcFR5cGVzJyxcbiAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgIGxpbmtNb2RlbDogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5pbnN0YW5jZU9mKF9MaW5rTW9kZWwyWydkZWZhdWx0J10pLFxuICAgICAgICAgICAgY29tcG9zaXRlTW9kZWw6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uaW5zdGFuY2VPZihfY29tcG9zaXRlQ29tcG9zaXRlTW9kZWwyWydkZWZhdWx0J10pLFxuICAgICAgICAgICAgcHlkaW86IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uaW5zdGFuY2VPZihfcHlkaW8yWydkZWZhdWx0J10pLFxuICAgICAgICAgICAgYXV0aG9yaXphdGlvbnM6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10ub2JqZWN0LFxuICAgICAgICAgICAgc2hvd01haWxlcjogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5mdW5jXG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICB9XSk7XG5cbiAgICByZXR1cm4gUHVibGljTGlua1BhbmVsO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFB1YmxpY0xpbmtQYW5lbCA9ICgwLCBfU2hhcmVDb250ZXh0Q29uc3VtZXIyWydkZWZhdWx0J10pKFB1YmxpY0xpbmtQYW5lbCk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBQdWJsaWNMaW5rUGFuZWw7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxudmFyIF9wcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbnZhciBfcHJvcFR5cGVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3Byb3BUeXBlcyk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lciA9IHJlcXVpcmUoJy4uL1NoYXJlQ29udGV4dENvbnN1bWVyJyk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU2hhcmVDb250ZXh0Q29uc3VtZXIpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX0xpbmtNb2RlbCA9IHJlcXVpcmUoJy4vTGlua01vZGVsJyk7XG5cbnZhciBfTGlua01vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0xpbmtNb2RlbCk7XG5cbnZhciBfbWFpblNoYXJlSGVscGVyID0gcmVxdWlyZSgnLi4vbWFpbi9TaGFyZUhlbHBlcicpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9tYWluU2hhcmVIZWxwZXIpO1xuXG52YXIgX2NlbGxzU2RrID0gcmVxdWlyZSgnY2VsbHMtc2RrJyk7XG5cbnZhciBQdWJsaWNMaW5rUGVybWlzc2lvbnMgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoUHVibGljTGlua1Blcm1pc3Npb25zLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFB1YmxpY0xpbmtQZXJtaXNzaW9ucygpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUHVibGljTGlua1Blcm1pc3Npb25zKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihQdWJsaWNMaW5rUGVybWlzc2lvbnMucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICB0aGlzLmNoYW5nZVBlcm1pc3Npb24gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBuYW1lID0gZXZlbnQudGFyZ2V0Lm5hbWU7XG4gICAgICAgICAgICB2YXIgY2hlY2tlZCA9IGV2ZW50LnRhcmdldC5jaGVja2VkO1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IF90aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIGNvbXBvc2l0ZU1vZGVsID0gX3Byb3BzLmNvbXBvc2l0ZU1vZGVsO1xuICAgICAgICAgICAgdmFyIGxpbmtNb2RlbCA9IF9wcm9wcy5saW5rTW9kZWw7XG5cbiAgICAgICAgICAgIHZhciBsaW5rID0gbGlua01vZGVsLmdldExpbmsoKTtcbiAgICAgICAgICAgIGlmIChjaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgbGluay5QZXJtaXNzaW9ucy5wdXNoKF9jZWxsc1Nkay5SZXN0U2hhcmVMaW5rQWNjZXNzVHlwZS5jb25zdHJ1Y3RGcm9tT2JqZWN0KG5hbWUpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGluay5QZXJtaXNzaW9ucyA9IGxpbmsuUGVybWlzc2lvbnMuZmlsdGVyKGZ1bmN0aW9uIChwZXJtKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwZXJtICE9PSBuYW1lO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNvbXBvc2l0ZU1vZGVsLmdldE5vZGUoKS5pc0xlYWYoKSkge1xuICAgICAgICAgICAgICAgIHZhciBhdXRoID0gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5nZXRBdXRob3JpemF0aW9ucygpO1xuICAgICAgICAgICAgICAgIHZhciBtYXggPSBhdXRoLm1heF9kb3dubG9hZHM7XG4gICAgICAgICAgICAgICAgLy8gUmVhZGFwdCB0ZW1wbGF0ZSBkZXBlbmRpbmcgb24gcGVybWlzc2lvbnNcbiAgICAgICAgICAgICAgICBpZiAobGlua01vZGVsLmhhc1Blcm1pc3Npb24oJ1ByZXZpZXcnKSkge1xuICAgICAgICAgICAgICAgICAgICBsaW5rLlZpZXdUZW1wbGF0ZU5hbWUgPSBcInB5ZGlvX3VuaXF1ZV9zdHJpcFwiO1xuICAgICAgICAgICAgICAgICAgICBsaW5rLk1heERvd25sb2FkcyA9IDA7IC8vIENsZWFyIE1heCBEb3dubG9hZHMgaWYgUHJldmlldyBlbmFibGVkXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsuVmlld1RlbXBsYXRlTmFtZSA9IFwicHlkaW9fdW5pcXVlX2RsXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWF4ICYmICFsaW5rLk1heERvd25sb2Fkcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsuTWF4RG93bmxvYWRzID0gbWF4O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfdGhpcy5wcm9wcy5saW5rTW9kZWwudXBkYXRlTGluayhsaW5rKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoUHVibGljTGlua1Blcm1pc3Npb25zLCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIGxpbmtNb2RlbCA9IF9wcm9wczIubGlua01vZGVsO1xuICAgICAgICAgICAgdmFyIGNvbXBvc2l0ZU1vZGVsID0gX3Byb3BzMi5jb21wb3NpdGVNb2RlbDtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wczIucHlkaW87XG5cbiAgICAgICAgICAgIHZhciBub2RlID0gY29tcG9zaXRlTW9kZWwuZ2V0Tm9kZSgpO1xuICAgICAgICAgICAgdmFyIHBlcm1zID0gW10sXG4gICAgICAgICAgICAgICAgcHJldmlld1dhcm5pbmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgYXV0aCA9IF9tYWluU2hhcmVIZWxwZXIyWydkZWZhdWx0J10uZ2V0QXV0aG9yaXphdGlvbnMoKTtcblxuICAgICAgICAgICAgaWYgKG5vZGUuaXNMZWFmKCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgX1NoYXJlSGVscGVyJG5vZGVIYXNFZGl0b3IgPSBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLm5vZGVIYXNFZGl0b3IocHlkaW8sIG5vZGUpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHByZXZpZXcgPSBfU2hhcmVIZWxwZXIkbm9kZUhhc0VkaXRvci5wcmV2aWV3O1xuICAgICAgICAgICAgICAgIHZhciB3cml0ZWFibGUgPSBfU2hhcmVIZWxwZXIkbm9kZUhhc0VkaXRvci53cml0ZWFibGU7XG5cbiAgICAgICAgICAgICAgICBwZXJtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgTkFNRTogJ0Rvd25sb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgTEFCRUw6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnNzMnKSxcbiAgICAgICAgICAgICAgICAgICAgRElTQUJMRUQ6ICFwcmV2aWV3IHx8ICFsaW5rTW9kZWwuaGFzUGVybWlzc2lvbignUHJldmlldycpIC8vIERvd25sb2FkIE9ubHksIGNhbm5vdCBlZGl0IHRoaXNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAocHJldmlldyAmJiAhYXV0aC5tYXhfZG93bmxvYWRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHBlcm1zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgTkFNRTogJ1ByZXZpZXcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgTEFCRUw6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnNzInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIERJU0FCTEVEOiAhbGlua01vZGVsLmhhc1Blcm1pc3Npb24oJ0Rvd25sb2FkJylcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsaW5rTW9kZWwuaGFzUGVybWlzc2lvbignUHJldmlldycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAod3JpdGVhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVybXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5BTUU6ICdVcGxvYWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBMQUJFTDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCc3NGInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwZXJtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgTkFNRTogJ1ByZXZpZXcnLFxuICAgICAgICAgICAgICAgICAgICBMQUJFTDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCc3MicpLFxuICAgICAgICAgICAgICAgICAgICBESVNBQkxFRDogIWxpbmtNb2RlbC5oYXNQZXJtaXNzaW9uKCdVcGxvYWQnKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHBlcm1zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBOQU1FOiAnRG93bmxvYWQnLFxuICAgICAgICAgICAgICAgICAgICBMQUJFTDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCc3MycpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcGVybXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIE5BTUU6ICdVcGxvYWQnLFxuICAgICAgICAgICAgICAgICAgICBMQUJFTDogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCc3NCcpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBpZih0aGlzLnByb3BzLnNoYXJlTW9kZWwuaXNQdWJsaWNMaW5rUHJldmlld0Rpc2FibGVkKCkgJiYgdGhpcy5wcm9wcy5zaGFyZU1vZGVsLmdldFB1YmxpY0xpbmtQZXJtaXNzaW9uKGxpbmtJZCwgJ3JlYWQnKSl7XG4gICAgICAgICAgICAgICAgcHJldmlld1dhcm5pbmcgPSA8ZGl2Pnt0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE5NScpfTwvZGl2PjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogX2V4dGVuZHMoeyBwYWRkaW5nOiAnMTBweCAxNnB4JyB9LCB0aGlzLnByb3BzLnN0eWxlKSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmb250U2l6ZTogMTMsIGZvbnRXZWlnaHQ6IDUwMCwgY29sb3I6ICdyZ2JhKDAsMCwwLDAuNDMpJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnNzByJylcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBtYXJnaW46ICcxMHB4IDAgMjBweCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICBwZXJtcy5tYXAoKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2hlY2tib3gsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IHAuTkFNRSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogcC5ESVNBQkxFRCB8fCB0aGlzLnByb3BzLmlzUmVhZG9ubHkoKSB8fCAhbGlua01vZGVsLmlzRWRpdGFibGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHAuTkFNRSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogcC5MQUJFTCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoZWNrOiB0aGlzLmNoYW5nZVBlcm1pc3Npb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZDogbGlua01vZGVsLmhhc1Blcm1pc3Npb24ocC5OQU1FKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFN0eWxlOiB7IHdoaXRlU3BhY2U6ICdub3dyYXAnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgbWFyZ2luOiAnMTBweCAwJyB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKSksXG4gICAgICAgICAgICAgICAgICAgIHByZXZpZXdXYXJuaW5nXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dLCBbe1xuICAgICAgICBrZXk6ICdwcm9wVHlwZXMnLFxuICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgbGlua01vZGVsOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLmluc3RhbmNlT2YoX0xpbmtNb2RlbDJbJ2RlZmF1bHQnXSksXG4gICAgICAgICAgICBzdHlsZTogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5vYmplY3RcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgIH1dKTtcblxuICAgIHJldHVybiBQdWJsaWNMaW5rUGVybWlzc2lvbnM7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gUHVibGljTGlua1Blcm1pc3Npb25zID0gKDAsIF9TaGFyZUNvbnRleHRDb25zdW1lcjJbJ2RlZmF1bHQnXSkoUHVibGljTGlua1Blcm1pc3Npb25zKTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFB1YmxpY0xpbmtQZXJtaXNzaW9ucztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxuLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG52YXIgX3Byb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxudmFyIF9wcm9wVHlwZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHJvcFR5cGVzKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyID0gcmVxdWlyZSgnLi4vU2hhcmVDb250ZXh0Q29uc3VtZXInKTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TaGFyZUNvbnRleHRDb25zdW1lcik7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfTGlua01vZGVsID0gcmVxdWlyZSgnLi9MaW5rTW9kZWwnKTtcblxudmFyIF9MaW5rTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfTGlua01vZGVsKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2hvYycpO1xuXG52YXIgTW9kZXJuU2VsZWN0RmllbGQgPSBfUHlkaW8kcmVxdWlyZUxpYi5Nb2Rlcm5TZWxlY3RGaWVsZDtcblxudmFyIFB1YmxpY0xpbmtUZW1wbGF0ZSA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhQdWJsaWNMaW5rVGVtcGxhdGUsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gUHVibGljTGlua1RlbXBsYXRlKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUHVibGljTGlua1RlbXBsYXRlKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihQdWJsaWNMaW5rVGVtcGxhdGUucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoUHVibGljTGlua1RlbXBsYXRlLCBbe1xuICAgICAgICBrZXk6ICdvbkRyb3BEb3duQ2hhbmdlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uRHJvcERvd25DaGFuZ2UoZXZlbnQsIGluZGV4LCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGxpbmtNb2RlbCA9IHRoaXMucHJvcHMubGlua01vZGVsO1xuXG4gICAgICAgICAgICBsaW5rTW9kZWwuZ2V0TGluaygpLlZpZXdUZW1wbGF0ZU5hbWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIGxpbmtNb2RlbC5ub3RpZnlEaXJ0eSgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIGNydExhYmVsID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdmFyIGxpbmtNb2RlbCA9IHRoaXMucHJvcHMubGlua01vZGVsO1xuXG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSBsaW5rTW9kZWwuZ2V0TGluaygpLlZpZXdUZW1wbGF0ZU5hbWU7XG4gICAgICAgICAgICB2YXIgbWVudUl0ZW1zID0gdGhpcy5wcm9wcy5sYXlvdXREYXRhLm1hcChmdW5jdGlvbiAobCkge1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZCAmJiBsLkxBWU9VVF9FTEVNRU5UID09PSBzZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICBjcnRMYWJlbCA9IGwuTEFZT1VUX0xBQkVMO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIXNlbGVjdGVkICYmICFjcnRMYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IGwuTEFZT1VUX0VMRU1FTlQ7XG4gICAgICAgICAgICAgICAgICAgIGNydExhYmVsID0gbC5MQVlPVVRfTEFCRUw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyBrZXk6IGwuTEFZT1VUX0VMRU1FTlQsIHZhbHVlOiBsLkxBWU9VVF9FTEVNRU5ULCBwcmltYXJ5VGV4dDogbC5MQVlPVVRfTEFCRUwgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB0aGlzLnByb3BzLnN0eWxlIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogNTAwLCBjb2xvcjogJ3JnYmEoMCwwLDAsMC40MyknIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcxNTEnKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIE1vZGVyblNlbGVjdEZpZWxkLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkRyb3BEb3duQ2hhbmdlLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5wcm9wcy5pc1JlYWRvbmx5KCkgfHwgdGhpcy5wcm9wcy5yZWFkb25seSB8fCAhbGlua01vZGVsLmlzRWRpdGFibGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE1MScpXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG1lbnVJdGVtc1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gUHVibGljTGlua1RlbXBsYXRlO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cblB1YmxpY0xpbmtUZW1wbGF0ZS5Qcm9wVHlwZXMgPSB7XG4gICAgbGlua01vZGVsOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLmluc3RhbmNlT2YoX0xpbmtNb2RlbDJbJ2RlZmF1bHQnXSlcbn07XG5QdWJsaWNMaW5rVGVtcGxhdGUgPSAoMCwgX1NoYXJlQ29udGV4dENvbnN1bWVyMlsnZGVmYXVsdCddKShQdWJsaWNMaW5rVGVtcGxhdGUpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gUHVibGljTGlua1RlbXBsYXRlO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG4vKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbnZhciBfcHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG52YXIgX3Byb3BUeXBlczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wcm9wVHlwZXMpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfcHlkaW9VdGlsUGFzcyA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvcGFzcycpO1xuXG52YXIgX3B5ZGlvVXRpbFBhc3MyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9VdGlsUGFzcyk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIgPSByZXF1aXJlKCcuLi9TaGFyZUNvbnRleHRDb25zdW1lcicpO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1NoYXJlQ29udGV4dENvbnN1bWVyKTtcblxudmFyIF9MaW5rTW9kZWwgPSByZXF1aXJlKCcuL0xpbmtNb2RlbCcpO1xuXG52YXIgX0xpbmtNb2RlbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9MaW5rTW9kZWwpO1xuXG52YXIgX21haW5TaGFyZUhlbHBlciA9IHJlcXVpcmUoJy4uL21haW4vU2hhcmVIZWxwZXInKTtcblxudmFyIF9tYWluU2hhcmVIZWxwZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbWFpblNoYXJlSGVscGVyKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2Zvcm0nKTtcblxudmFyIFZhbGlkUGFzc3dvcmQgPSBfUHlkaW8kcmVxdWlyZUxpYi5WYWxpZFBhc3N3b3JkO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIyID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2hvYycpO1xuXG52YXIgTW9kZXJuVGV4dEZpZWxkID0gX1B5ZGlvJHJlcXVpcmVMaWIyLk1vZGVyblRleHRGaWVsZDtcbnZhciBNb2Rlcm5TdHlsZXMgPSBfUHlkaW8kcmVxdWlyZUxpYjIuTW9kZXJuU3R5bGVzO1xuXG52YXIgZ2xvYlN0eWxlcyA9IHtcbiAgICBsZWZ0SWNvbjoge1xuICAgICAgICBtYXJnaW46ICcwIDE2cHggMCA0cHgnLFxuICAgICAgICBjb2xvcjogJyM3NTc1NzUnXG4gICAgfVxufTtcblxudmFyIFB1YmxpY0xpbmtTZWN1cmVPcHRpb25zID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFB1YmxpY0xpbmtTZWN1cmVPcHRpb25zLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFB1YmxpY0xpbmtTZWN1cmVPcHRpb25zKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQdWJsaWNMaW5rU2VjdXJlT3B0aW9ucyk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoUHVibGljTGlua1NlY3VyZU9wdGlvbnMucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge307XG5cbiAgICAgICAgdGhpcy51cGRhdGVETEV4cGlyYXRpb25GaWVsZCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgdmFyIG5ld1ZhbHVlID0gZXZlbnQuY3VycmVudFRhcmdldC52YWx1ZTtcbiAgICAgICAgICAgIGlmIChwYXJzZUludChuZXdWYWx1ZSkgPCAwKSB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWUgPSAtcGFyc2VJbnQobmV3VmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGxpbmtNb2RlbCA9IF90aGlzLnByb3BzLmxpbmtNb2RlbDtcblxuICAgICAgICAgICAgdmFyIGxpbmsgPSBsaW5rTW9kZWwuZ2V0TGluaygpO1xuICAgICAgICAgICAgbGluay5NYXhEb3dubG9hZHMgPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgIGxpbmtNb2RlbC51cGRhdGVMaW5rKGxpbmspO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMudXBkYXRlRGF5c0V4cGlyYXRpb25GaWVsZCA9IGZ1bmN0aW9uIChldmVudCwgbmV3VmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghbmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZSA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSBfdGhpcy5wcm9wcy5saW5rTW9kZWw7XG5cbiAgICAgICAgICAgIHZhciBsaW5rID0gbGlua01vZGVsLmdldExpbmsoKTtcbiAgICAgICAgICAgIGxpbmsuQWNjZXNzRW5kID0gbmV3VmFsdWU7XG4gICAgICAgICAgICBsaW5rTW9kZWwudXBkYXRlTGluayhsaW5rKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9uRGF0ZUNoYW5nZSA9IGZ1bmN0aW9uIChldmVudCwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBkYXRlMiA9IERhdGUuVVRDKHZhbHVlLmdldEZ1bGxZZWFyKCksIHZhbHVlLmdldE1vbnRoKCksIHZhbHVlLmdldERhdGUoKSk7XG4gICAgICAgICAgICBfdGhpcy51cGRhdGVEYXlzRXhwaXJhdGlvbkZpZWxkKGV2ZW50LCBNYXRoLmZsb29yKGRhdGUyIC8gMTAwMCkgKyBcIlwiKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlc2V0UGFzc3dvcmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbGlua01vZGVsID0gX3RoaXMucHJvcHMubGlua01vZGVsO1xuXG4gICAgICAgICAgICBsaW5rTW9kZWwuc2V0VXBkYXRlUGFzc3dvcmQoJycpO1xuICAgICAgICAgICAgbGlua01vZGVsLmdldExpbmsoKS5QYXNzd29yZFJlcXVpcmVkID0gZmFsc2U7XG4gICAgICAgICAgICBsaW5rTW9kZWwubm90aWZ5RGlydHkoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNldFVwZGF0aW5nUGFzc3dvcmQgPSBmdW5jdGlvbiAobmV3VmFsdWUpIHtcbiAgICAgICAgICAgIF9weWRpb1V0aWxQYXNzMlsnZGVmYXVsdCddLmNoZWNrUGFzc3dvcmRTdHJlbmd0aChuZXdWYWx1ZSwgZnVuY3Rpb24gKG9rLCBtc2cpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IHVwZGF0aW5nUGFzc3dvcmQ6IG5ld1ZhbHVlLCB1cGRhdGluZ1Bhc3N3b3JkVmFsaWQ6IG9rIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jaGFuZ2VQYXNzd29yZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSBfdGhpcy5wcm9wcy5saW5rTW9kZWw7XG4gICAgICAgICAgICB2YXIgdXBkYXRpbmdQYXNzd29yZCA9IF90aGlzLnN0YXRlLnVwZGF0aW5nUGFzc3dvcmQ7XG5cbiAgICAgICAgICAgIGxpbmtNb2RlbC5zZXRVcGRhdGVQYXNzd29yZCh1cGRhdGluZ1Bhc3N3b3JkKTtcbiAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgcHdQb3A6IGZhbHNlLCB1cGRhdGluZ1Bhc3N3b3JkOiBcIlwiLCB1cGRhdGluZ1Bhc3N3b3JkVmFsaWQ6IGZhbHNlIH0pO1xuICAgICAgICAgICAgbGlua01vZGVsLm5vdGlmeURpcnR5KCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy51cGRhdGVQYXNzd29yZCA9IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSBfdGhpcy5wcm9wcy5saW5rTW9kZWw7XG5cbiAgICAgICAgICAgIHZhciB2YWxpZCA9IF90aGlzLnJlZnMucHdkLmlzVmFsaWQoKTtcbiAgICAgICAgICAgIGlmICh2YWxpZCkge1xuICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgaW52YWxpZFBhc3N3b3JkOiBudWxsLCBpbnZhbGlkOiBmYWxzZSB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmtNb2RlbC5zZXRVcGRhdGVQYXNzd29yZChuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgaW52YWxpZFBhc3N3b3JkOiBuZXdWYWx1ZSwgaW52YWxpZDogdHJ1ZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlc2V0RG93bmxvYWRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5jb25maXJtKF90aGlzLnByb3BzLmdldE1lc3NhZ2UoJzEwNicpKSkge1xuICAgICAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSBfdGhpcy5wcm9wcy5saW5rTW9kZWw7XG5cbiAgICAgICAgICAgICAgICBsaW5rTW9kZWwuZ2V0TGluaygpLkN1cnJlbnREb3dubG9hZHMgPSBcIjBcIjtcbiAgICAgICAgICAgICAgICBsaW5rTW9kZWwubm90aWZ5RGlydHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlc2V0RXhwaXJhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBsaW5rTW9kZWwgPSBfdGhpcy5wcm9wcy5saW5rTW9kZWw7XG5cbiAgICAgICAgICAgIGxpbmtNb2RlbC5nZXRMaW5rKCkuQWNjZXNzRW5kID0gXCIwXCI7XG4gICAgICAgICAgICBsaW5rTW9kZWwubm90aWZ5RGlydHkoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlbmRlclBhc3N3b3JkQ29udGFpbmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGxpbmtNb2RlbCA9IF90aGlzLnByb3BzLmxpbmtNb2RlbDtcblxuICAgICAgICAgICAgdmFyIGxpbmsgPSBsaW5rTW9kZWwuZ2V0TGluaygpO1xuICAgICAgICAgICAgdmFyIGF1dGggPSBfbWFpblNoYXJlSGVscGVyMlsnZGVmYXVsdCddLmdldEF1dGhvcml6YXRpb25zKCk7XG4gICAgICAgICAgICB2YXIgcGFzc3dvcmRGaWVsZCA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICByZXNldFBhc3N3b3JkID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHVwZGF0ZVBhc3N3b3JkID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKGxpbmsuUGFzc3dvcmRSZXF1aXJlZCkge1xuICAgICAgICAgICAgICAgIHJlc2V0UGFzc3dvcmQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBfdGhpcy5wcm9wcy5pc1JlYWRvbmx5KCkgfHwgIWxpbmtNb2RlbC5pc0VkaXRhYmxlKCkgfHwgYXV0aC5wYXNzd29yZF9tYW5kYXRvcnksXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFRhcDogX3RoaXMucmVzZXRQYXNzd29yZCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IF90aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE3NCcpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdXBkYXRlUGFzc3dvcmQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBfdGhpcy5wcm9wcy5pc1JlYWRvbmx5KCkgfHwgIWxpbmtNb2RlbC5pc0VkaXRhYmxlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvblRvdWNoVGFwOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgcHdQb3A6IHRydWUsIHB3QW5jaG9yOiBlLmN1cnJlbnRUYXJnZXQgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IF90aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE4MScpXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBvcG92ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogX3RoaXMuc3RhdGUucHdQb3AsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5jaG9yRWw6IF90aGlzLnN0YXRlLnB3QW5jaG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuY2hvck9yaWdpbjogeyBob3Jpem9udGFsOiAncmlnaHQnLCB2ZXJ0aWNhbDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRPcmlnaW46IHsgaG9yaXpvbnRhbDogJ3JpZ2h0JywgdmVydGljYWw6ICd0b3AnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25SZXF1ZXN0Q2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBwd1BvcDogZmFsc2UgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6IDI4MCwgcGFkZGluZzogOCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoVmFsaWRQYXNzd29yZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcInVwZGF0ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY6IFwicHdkVXBkYXRlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHsgbGFiZWw6IF90aGlzLnByb3BzLmdldE1lc3NhZ2UoJzIzJykgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IF90aGlzLnN0YXRlLnVwZGF0aW5nUGFzc3dvcmQgPyBfdGhpcy5zdGF0ZS51cGRhdGluZ1Bhc3N3b3JkIDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRVcGRhdGluZ1Bhc3N3b3JkKHYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmdUb3A6IDIwLCB0ZXh0QWxpZ246ICdyaWdodCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGxhYmVsOiBfcHlkaW8yWydkZWZhdWx0J10uZ2V0TWVzc2FnZXMoKVsnNTQnXSwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgcHdQb3A6IGZhbHNlLCB1cGRhdGluZ1Bhc3N3b3JkOiAnJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgc3R5bGU6IHsgbWluV2lkdGg6IDYwIH0sIGxhYmVsOiBfcHlkaW8yWydkZWZhdWx0J10uZ2V0TWVzc2FnZXMoKVsnNDgnXSwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmNoYW5nZVBhc3N3b3JkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBkaXNhYmxlZDogIV90aGlzLnN0YXRlLnVwZGF0aW5nUGFzc3dvcmQgfHwgIV90aGlzLnN0YXRlLnVwZGF0aW5nUGFzc3dvcmRWYWxpZCB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgcGFzc3dvcmRGaWVsZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE1vZGVyblRleHRGaWVsZCwge1xuICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsVGV4dDogX3RoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMjMnKSxcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnKioqKioqKionLFxuICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIV90aGlzLnByb3BzLmlzUmVhZG9ubHkoKSAmJiBsaW5rTW9kZWwuaXNFZGl0YWJsZSgpKSB7XG4gICAgICAgICAgICAgICAgcGFzc3dvcmRGaWVsZCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFZhbGlkUGFzc3dvcmQsIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3NoYXJlLXBhc3N3b3JkJyxcbiAgICAgICAgICAgICAgICAgICAgcmVmOiBcInB3ZFwiLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiB7IGxhYmVsOiBfdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcyMycpIH0sXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBfdGhpcy5zdGF0ZS5pbnZhbGlkUGFzc3dvcmQgPyBfdGhpcy5zdGF0ZS5pbnZhbGlkUGFzc3dvcmQgOiBsaW5rTW9kZWwudXBkYXRlUGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiBfdGhpcy51cGRhdGVQYXNzd29yZFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhc3N3b3JkRmllbGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ3Bhc3N3b3JkLWNvbnRhaW5lcicsIHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBjbGFzc05hbWU6ICdtZGkgbWRpLWZpbGUtbG9jaycsIHN0eWxlOiBnbG9iU3R5bGVzLmxlZnRJY29uIH0pLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogcmVzZXRQYXNzd29yZCA/ICc0MCUnIDogJzEwMCUnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXNzd29yZEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIHJlc2V0UGFzc3dvcmQgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6ICc2MCUnLCBkaXNwbGF5OiAnZmxleCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRQYXNzd29yZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZVBhc3N3b3JkXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmZvcm1hdERhdGUgPSBmdW5jdGlvbiAoZGF0ZU9iamVjdCkge1xuICAgICAgICAgICAgdmFyIGRhdGVGb3JtYXREYXkgPSBfdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCdkYXRlX2Zvcm1hdCcsICcnKS5zcGxpdCgnICcpLnNoaWZ0KCk7XG4gICAgICAgICAgICByZXR1cm4gZGF0ZUZvcm1hdERheS5yZXBsYWNlKCdZJywgZGF0ZU9iamVjdC5nZXRGdWxsWWVhcigpKS5yZXBsYWNlKCdtJywgZGF0ZU9iamVjdC5nZXRNb250aCgpICsgMSkucmVwbGFjZSgnZCcsIGRhdGVPYmplY3QuZ2V0RGF0ZSgpKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoUHVibGljTGlua1NlY3VyZU9wdGlvbnMsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgbGlua01vZGVsID0gdGhpcy5wcm9wcy5saW5rTW9kZWw7XG5cbiAgICAgICAgICAgIHZhciBsaW5rID0gbGlua01vZGVsLmdldExpbmsoKTtcblxuICAgICAgICAgICAgdmFyIHBhc3NDb250YWluZXIgPSB0aGlzLnJlbmRlclBhc3N3b3JkQ29udGFpbmVyKCk7XG4gICAgICAgICAgICB2YXIgY3J0TGlua0RMQWxsb3dlZCA9IGxpbmtNb2RlbC5oYXNQZXJtaXNzaW9uKCdEb3dubG9hZCcpICYmICFsaW5rTW9kZWwuaGFzUGVybWlzc2lvbignUHJldmlldycpICYmICFsaW5rTW9kZWwuaGFzUGVybWlzc2lvbignVXBsb2FkJyk7XG4gICAgICAgICAgICB2YXIgZGxMaW1pdFZhbHVlID0gcGFyc2VJbnQobGluay5NYXhEb3dubG9hZHMpO1xuICAgICAgICAgICAgdmFyIGV4cGlyYXRpb25EYXRlVmFsdWUgPSBwYXJzZUludChsaW5rLkFjY2Vzc0VuZCk7XG5cbiAgICAgICAgICAgIHZhciBjYWxJY29uID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRm9udEljb24sIHsgY2xhc3NOYW1lOiAnbWRpIG1kaS1jYWxlbmRhci1jbG9jaycsIHN0eWxlOiBnbG9iU3R5bGVzLmxlZnRJY29uIH0pO1xuICAgICAgICAgICAgdmFyIGV4cERhdGUgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgbWF4RGF0ZSA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBkbENvdW50ZXJTdHJpbmcgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgZGF0ZUV4cGlyZWQgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICBkbEV4cGlyZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciB0b2RheSA9IG5ldyBEYXRlKCk7XG5cbiAgICAgICAgICAgIHZhciBhdXRoID0gX21haW5TaGFyZUhlbHBlcjJbJ2RlZmF1bHQnXS5nZXRBdXRob3JpemF0aW9ucygpO1xuICAgICAgICAgICAgaWYgKHBhcnNlSW50KGF1dGgubWF4X2V4cGlyYXRpb24pID4gMCkge1xuICAgICAgICAgICAgICAgIG1heERhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICAgIG1heERhdGUuc2V0RGF0ZSh0b2RheS5nZXREYXRlKCkgKyBwYXJzZUludChhdXRoLm1heF9leHBpcmF0aW9uKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFyc2VJbnQoYXV0aC5tYXhfZG93bmxvYWRzKSA+IDApIHtcbiAgICAgICAgICAgICAgICBkbExpbWl0VmFsdWUgPSBNYXRoLm1heCgxLCBNYXRoLm1pbihkbExpbWl0VmFsdWUsIHBhcnNlSW50KGF1dGgubWF4X2Rvd25sb2FkcykpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGV4cGlyYXRpb25EYXRlVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXhwaXJhdGlvbkRhdGVWYWx1ZSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUV4cGlyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBleHBEYXRlID0gbmV3IERhdGUoZXhwaXJhdGlvbkRhdGVWYWx1ZSAqIDEwMDApO1xuICAgICAgICAgICAgICAgIGlmICghcGFyc2VJbnQoYXV0aC5tYXhfZXhwaXJhdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsSWNvbiA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgaWNvblN0eWxlOiB7IGNvbG9yOiBnbG9iU3R5bGVzLmxlZnRJY29uLmNvbG9yIH0sIHN0eWxlOiB7IG1hcmdpbkxlZnQ6IC04LCBtYXJnaW5SaWdodDogOCB9LCBpY29uQ2xhc3NOYW1lOiAnbWRpIG1kaS1jbG9zZS1jaXJjbGUnLCBvblRvdWNoVGFwOiB0aGlzLnJlc2V0RXhwaXJhdGlvbi5iaW5kKHRoaXMpIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkbExpbWl0VmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGxDb3VudGVyID0gcGFyc2VJbnQobGluay5DdXJyZW50RG93bmxvYWRzKSB8fCAwO1xuICAgICAgICAgICAgICAgIHZhciByZXNldExpbmsgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgaWYgKGRsQ291bnRlcikge1xuICAgICAgICAgICAgICAgICAgICByZXNldExpbmsgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcicgfSwgb25DbGljazogdGhpcy5yZXNldERvd25sb2Fkcy5iaW5kKHRoaXMpLCB0aXRsZTogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcxNycpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAnKCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzE2JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnKSdcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRsQ291bnRlciA+PSBkbExpbWl0VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRsRXhwaXJlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGxDb3VudGVyU3RyaW5nID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdkbENvdW50ZXJTdHJpbmcnIH0sXG4gICAgICAgICAgICAgICAgICAgIGRsQ291bnRlciArICcvJyArIGRsTGltaXRWYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgICAgICByZXNldExpbmtcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHsgcGFkZGluZzogMTAgfSwgdGhpcy5wcm9wcy5zdHlsZSkgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZm9udFNpemU6IDEzLCBmb250V2VpZ2h0OiA1MDAsIGNvbG9yOiAncmdiYSgwLDAsMCwwLjQzKScgfSB9LFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmdldE1lc3NhZ2UoJzI0JylcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nUmlnaHQ6IDEwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgcGFzc0NvbnRhaW5lcixcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnYmFzZWxpbmUnLCBwb3NpdGlvbjogJ3JlbGF0aXZlJyB9LCBjbGFzc05hbWU6IGRhdGVFeHBpcmVkID8gJ2xpbWl0LWJsb2NrLWV4cGlyZWQnIDogbnVsbCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsSWNvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRhdGVQaWNrZXIsIF9leHRlbmRzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY6ICdleHBpcmF0aW9uRGF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiAnc3RhcnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBleHBEYXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbkRhdGU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4RGF0ZTogbWF4RGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvT2s6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMucHJvcHMuaXNSZWFkb25seSgpIHx8ICFsaW5rTW9kZWwuaXNFZGl0YWJsZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uRGF0ZUNoYW5nZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93WWVhclNlbGVjdG9yOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpbnRUZXh0OiB0aGlzLnByb3BzLmdldE1lc3NhZ2UoZGF0ZUV4cGlyZWQgPyAnMjFiJyA6ICcyMScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGU6ICdsYW5kc2NhcGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdERhdGU6IHRoaXMuZm9ybWF0RGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBmbGV4OiAxIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBNb2Rlcm5TdHlsZXMudGV4dEZpZWxkKSlcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgYWxpZ25JdGVtczogJ2Jhc2VsaW5lJywgZGlzcGxheTogY3J0TGlua0RMQWxsb3dlZCA/ICdmbGV4JyA6ICdub25lJywgcG9zaXRpb246ICdyZWxhdGl2ZScgfSwgY2xhc3NOYW1lOiBkbEV4cGlyZWQgPyAnbGltaXQtYmxvY2stZXhwaXJlZCcgOiBudWxsIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBjbGFzc05hbWU6ICdtZGkgbWRpLWRvd25sb2FkJywgc3R5bGU6IGdsb2JTdHlsZXMubGVmdEljb24gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNb2Rlcm5UZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5wcm9wcy5pc1JlYWRvbmx5KCkgfHwgIWxpbmtNb2RlbC5pc0VkaXRhYmxlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZShkbEV4cGlyZWQgPyAnMjJiJyA6ICcyMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBkbExpbWl0VmFsdWUgPiAwID8gZGxMaW1pdFZhbHVlIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMudXBkYXRlRExFeHBpcmF0aW9uRmllbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGZsZXg6IDEgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwb3NpdGlvbjogJ2Fic29sdXRlJywgcmlnaHQ6IDEwLCB0b3A6IDE0LCBmb250U2l6ZTogMTMsIGZvbnRXZWlnaHQ6IDUwMCwgY29sb3I6ICdyZ2JhKDAsMCwwLDAuNDMpJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGxDb3VudGVyU3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0sIFt7XG4gICAgICAgIGtleTogJ3Byb3BUeXBlcycsXG4gICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICBsaW5rTW9kZWw6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uaW5zdGFuY2VPZihfTGlua01vZGVsMlsnZGVmYXVsdCddKS5pc1JlcXVpcmVkLFxuICAgICAgICAgICAgc3R5bGU6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10ub2JqZWN0XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICB9XSk7XG5cbiAgICByZXR1cm4gUHVibGljTGlua1NlY3VyZU9wdGlvbnM7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gUHVibGljTGlua1NlY3VyZU9wdGlvbnMgPSAoMCwgX1NoYXJlQ29udGV4dENvbnN1bWVyMlsnZGVmYXVsdCddKShQdWJsaWNMaW5rU2VjdXJlT3B0aW9ucyk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBQdWJsaWNMaW5rU2VjdXJlT3B0aW9ucztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG52YXIgX3Byb3BUeXBlczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wcm9wVHlwZXMpO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcmVhY3REb20gPSByZXF1aXJlKCdyZWFjdC1kb20nKTtcblxudmFyIF9yZWFjdERvbTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdERvbSk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIgPSByZXF1aXJlKCcuLi9TaGFyZUNvbnRleHRDb25zdW1lcicpO1xuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1NoYXJlQ29udGV4dENvbnN1bWVyKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9jbGlwYm9hcmQgPSByZXF1aXJlKCdjbGlwYm9hcmQnKTtcblxudmFyIF9jbGlwYm9hcmQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY2xpcGJvYXJkKTtcblxudmFyIF9saW5rc0xpbmtNb2RlbCA9IHJlcXVpcmUoJy4uL2xpbmtzL0xpbmtNb2RlbCcpO1xuXG52YXIgX2xpbmtzTGlua01vZGVsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2xpbmtzTGlua01vZGVsKTtcblxudmFyIFRhcmdldGVkVXNlckxpbmsgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoVGFyZ2V0ZWRVc2VyTGluaywgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBUYXJnZXRlZFVzZXJMaW5rKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBUYXJnZXRlZFVzZXJMaW5rKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihUYXJnZXRlZFVzZXJMaW5rLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0geyBjb3B5TWVzc2FnZTogJycgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoVGFyZ2V0ZWRVc2VyTGluaywgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fY2xpcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NsaXAuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuX2J1dHRvbikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NsaXAgPSBuZXcgX2NsaXBib2FyZDJbJ2RlZmF1bHQnXSh0aGlzLl9idXR0b24sIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogKGZ1bmN0aW9uICh0cmlnZ2VyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5saW5rO1xuICAgICAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2xpcC5vbignc3VjY2VzcycsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb3B5TWVzc2FnZTogdGhpcy5wcm9wcy5nZXRNZXNzYWdlKCcxOTInKSB9LCB0aGlzLmNsZWFyQ29weU1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2NsaXAub24oJ2Vycm9yJywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvcHlNZXNzYWdlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZ2xvYmFsLm5hdmlnYXRvci5wbGF0Zm9ybS5pbmRleE9mKFwiTWFjXCIpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3B5TWVzc2FnZSA9IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMTQ0Jyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3B5TWVzc2FnZSA9IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnc2hhcmVfY2VudGVyLjE0MycpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb3B5TWVzc2FnZTogY29weU1lc3NhZ2UgfSwgdGhpcy5jbGVhckNvcHlNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFVubW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fY2xpcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NsaXAuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjbGVhckNvcHlNZXNzYWdlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNsZWFyQ29weU1lc3NhZ2UoKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvcHlNZXNzYWdlOiAnJyB9KTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcyksIDUwMDApO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0VXNlciA9IF9wcm9wcy50YXJnZXRVc2VyO1xuICAgICAgICAgICAgdmFyIGxpbmsgPSBfcHJvcHMubGluaztcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnIH0gfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSB9IH0sXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFVzZXIuRGlzcGxheSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW86IHRoaXMucHJvcHMucHlkaW8sXG4gICAgICAgICAgICAgICAgICAgICAgICByZWY6IGZ1bmN0aW9uIChyZWYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5fYnV0dG9uID0gX3JlYWN0RG9tMlsnZGVmYXVsdCddLmZpbmRET01Ob2RlKHJlZik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZTogJ21kaSBtZGktbGluaycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwOiB0aGlzLnN0YXRlLmNvcHlNZXNzYWdlIHx8IGxpbmssXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uU3R5bGU6IHsgZm9udFNpemU6IDEzLCBsaW5lSGVpZ2h0OiAnMTdweCcgfSwgc3R5bGU6IHsgd2lkdGg6IDM0LCBoZWlnaHQ6IDM0LCBwYWRkaW5nOiA2IH1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogNDAsIHRleHRBbGlnbjogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRVc2VyLkRvd25sb2FkQ291bnRcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFRhcmdldGVkVXNlckxpbms7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxudmFyIFRhcmdldGVkVXNlcnMgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQyKSB7XG4gICAgX2luaGVyaXRzKFRhcmdldGVkVXNlcnMsIF9SZWFjdCRDb21wb25lbnQyKTtcblxuICAgIGZ1bmN0aW9uIFRhcmdldGVkVXNlcnMocHJvcHMsIGNvbnRleHQpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFRhcmdldGVkVXNlcnMpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFRhcmdldGVkVXNlcnMucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcywgY29udGV4dCk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7IG9wZW46IGZhbHNlIH07XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFRhcmdldGVkVXNlcnMsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGxpbmtNb2RlbCA9IHRoaXMucHJvcHMubGlua01vZGVsO1xuXG4gICAgICAgICAgICB2YXIgbGluayA9IGxpbmtNb2RlbC5nZXRMaW5rKCk7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0VXNlcnMgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAobGluay5UYXJnZXRVc2Vycykge1xuICAgICAgICAgICAgICAgIHRhcmdldFVzZXJzID0gbGluay5UYXJnZXRVc2VycztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpdGVtcyA9IE9iamVjdC5rZXlzKHRhcmdldFVzZXJzKS5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICB2YXIgdGl0bGUgPSBsaW5rTW9kZWwuZ2V0UHVibGljVXJsKCkgKyAnP3U9JyArIGs7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFRhcmdldGVkVXNlckxpbmssIHsgdGFyZ2V0VXNlcjogdGFyZ2V0VXNlcnNba10sIGxpbms6IHRpdGxlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIWl0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcm9vdFN0eWxlID0ge1xuICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6ICczNHB4JyxcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNHB4IDEwcHggNHB4JyxcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMTQsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2ZhZmFmYScsXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAyXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIGhlYWRlclN0eWxlID0ge1xuICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogdGhpcy5zdGF0ZS5vcGVuID8gJzFweCBzb2xpZCAjNzU3NTc1JyA6ICcnLFxuICAgICAgICAgICAgICAgIGNvbG9yOiAncmdiYSgwLCAwLCAwLCAwLjM2KSdcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiByb290U3R5bGUgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHsgZGlzcGxheTogJ2ZsZXgnIH0sIGhlYWRlclN0eWxlKSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnMjQ1JykucmVwbGFjZSgnJXMnLCBpdGVtcy5sZW5ndGgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ21kaSBtZGktY2hldnJvbi0nICsgKHRoaXMuc3RhdGUub3BlbiA/ICd1cCcgOiAnZG93bicpLCBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJyB9LCBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IG9wZW46ICFfdGhpczIuc3RhdGUub3BlbiB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUub3BlbiAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogNDAsIHRleHRBbGlnbjogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgJyNETCdcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5vcGVuICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbXNcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFRhcmdldGVkVXNlcnM7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuVGFyZ2V0ZWRVc2Vycy5wcm9wVHlwZXMgPSB7XG4gICAgbGlua01vZGVsOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLmluc3RhbmNlT2YoX2xpbmtzTGlua01vZGVsMlsnZGVmYXVsdCddKVxufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gVGFyZ2V0ZWRVc2VycyA9ICgwLCBfU2hhcmVDb250ZXh0Q29uc3VtZXIyWydkZWZhdWx0J10pKFRhcmdldGVkVXNlcnMpO1xuVGFyZ2V0ZWRVc2VyTGluayA9ICgwLCBfU2hhcmVDb250ZXh0Q29uc3VtZXIyWydkZWZhdWx0J10pKFRhcmdldGVkVXNlckxpbmspO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBUYXJnZXRlZFVzZXJzO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfc2xpY2VkVG9BcnJheSA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIHNsaWNlSXRlcmF0b3IoYXJyLCBpKSB7IHZhciBfYXJyID0gW107IHZhciBfbiA9IHRydWU7IHZhciBfZCA9IGZhbHNlOyB2YXIgX2UgPSB1bmRlZmluZWQ7IHRyeSB7IGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHsgX2Fyci5wdXNoKF9zLnZhbHVlKTsgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrOyB9IH0gY2F0Y2ggKGVycikgeyBfZCA9IHRydWU7IF9lID0gZXJyOyB9IGZpbmFsbHkgeyB0cnkgeyBpZiAoIV9uICYmIF9pWydyZXR1cm4nXSkgX2lbJ3JldHVybiddKCk7IH0gZmluYWxseSB7IGlmIChfZCkgdGhyb3cgX2U7IH0gfSByZXR1cm4gX2FycjsgfSByZXR1cm4gZnVuY3Rpb24gKGFyciwgaSkgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IHJldHVybiBhcnI7IH0gZWxzZSBpZiAoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKSB7IHJldHVybiBzbGljZUl0ZXJhdG9yKGFyciwgaSk7IH0gZWxzZSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2UnKTsgfSB9OyB9KSgpO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lciA9IHJlcXVpcmUoJy4uL1NoYXJlQ29udGV4dENvbnN1bWVyJyk7XG5cbnZhciBfU2hhcmVDb250ZXh0Q29uc3VtZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfU2hhcmVDb250ZXh0Q29uc3VtZXIpO1xuXG4vKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbnZhciBfcHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG52YXIgX3Byb3BUeXBlczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wcm9wVHlwZXMpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfcHlkaW9IdHRwUG9saWNpZXMgPSByZXF1aXJlKCdweWRpby9odHRwL3BvbGljaWVzJyk7XG5cbnZhciBfcHlkaW9IdHRwUG9saWNpZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwUG9saWNpZXMpO1xuXG52YXIgX2NlbGxzU2RrID0gcmVxdWlyZSgnY2VsbHMtc2RrJyk7XG5cbnZhciBfTGlua01vZGVsID0gcmVxdWlyZSgnLi9MaW5rTW9kZWwnKTtcblxudmFyIF9MaW5rTW9kZWwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfTGlua01vZGVsKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2NvbXBvbmVudHMnKTtcblxudmFyIFJlc291cmNlUG9saWNpZXNQYW5lbCA9IF9QeWRpbyRyZXF1aXJlTGliLlJlc291cmNlUG9saWNpZXNQYW5lbDtcblxudmFyIFZpc2liaWxpdHlQYW5lbCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhWaXNpYmlsaXR5UGFuZWwsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gVmlzaWJpbGl0eVBhbmVsKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBWaXNpYmlsaXR5UGFuZWwpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFZpc2liaWxpdHlQYW5lbC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgICAgIHRoaXMub25TYXZlUG9saWNpZXMgPSBmdW5jdGlvbiAoZGlmZlBvbGljaWVzKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gX3RoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgbGlua01vZGVsID0gX3Byb3BzLmxpbmtNb2RlbDtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wcy5weWRpbztcblxuICAgICAgICAgICAgdmFyIGludGVybmFsVXNlciA9IGxpbmtNb2RlbC5nZXRMaW5rKCkuVXNlckxvZ2luO1xuICAgICAgICAgICAgX3B5ZGlvSHR0cFBvbGljaWVzMlsnZGVmYXVsdCddLmxvYWRQb2xpY2llcygndXNlcicsIGludGVybmFsVXNlcikudGhlbihmdW5jdGlvbiAocG9saWNpZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAocG9saWNpZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXNvdXJjZUlkID0gcG9saWNpZXNbMF0uUmVzb3VyY2U7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdQb2xpY2llcyA9IF90aGlzLmRpZmZQb2xpY2llcyhwb2xpY2llcywgZGlmZlBvbGljaWVzLCByZXNvdXJjZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgX3B5ZGlvSHR0cFBvbGljaWVzMlsnZGVmYXVsdCddLnNhdmVQb2xpY2llcygndXNlcicsIGludGVybmFsVXNlciwgbmV3UG9saWNpZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGlmZlBvbGljaWVzID0gZnVuY3Rpb24gKHBvbGljaWVzLCBkaWZmUG9saWNpZXMsIHJlc291cmNlSWQpIHtcbiAgICAgICAgICAgIHZhciBuZXdQb2xzID0gW107XG4gICAgICAgICAgICBwb2xpY2llcy5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgICAgICB2YXIga2V5ID0gcC5BY3Rpb24gKyAnLy8vJyArIHAuU3ViamVjdDtcbiAgICAgICAgICAgICAgICBpZiAoIWRpZmZQb2xpY2llcy5yZW1vdmVba2V5XSkge1xuICAgICAgICAgICAgICAgICAgICBuZXdQb2xzLnB1c2gocCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhkaWZmUG9saWNpZXMuYWRkKS5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3UG9sID0gbmV3IF9jZWxsc1Nkay5TZXJ2aWNlUmVzb3VyY2VQb2xpY3koKTtcblxuICAgICAgICAgICAgICAgIHZhciBfayRzcGxpdCA9IGsuc3BsaXQoJy8vLycpO1xuXG4gICAgICAgICAgICAgICAgdmFyIF9rJHNwbGl0MiA9IF9zbGljZWRUb0FycmF5KF9rJHNwbGl0LCAyKTtcblxuICAgICAgICAgICAgICAgIHZhciBhY3Rpb24gPSBfayRzcGxpdDJbMF07XG4gICAgICAgICAgICAgICAgdmFyIHN1YmplY3QgPSBfayRzcGxpdDJbMV07XG5cbiAgICAgICAgICAgICAgICBuZXdQb2wuUmVzb3VyY2UgPSByZXNvdXJjZUlkO1xuICAgICAgICAgICAgICAgIG5ld1BvbC5FZmZlY3QgPSBfY2VsbHNTZGsuU2VydmljZVJlc291cmNlUG9saWN5UG9saWN5RWZmZWN0LmNvbnN0cnVjdEZyb21PYmplY3QoJ2FsbG93Jyk7XG4gICAgICAgICAgICAgICAgbmV3UG9sLlN1YmplY3QgPSBzdWJqZWN0O1xuICAgICAgICAgICAgICAgIG5ld1BvbC5BY3Rpb24gPSBhY3Rpb247XG4gICAgICAgICAgICAgICAgbmV3UG9scy5wdXNoKG5ld1BvbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBuZXdQb2xzO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhWaXNpYmlsaXR5UGFuZWwsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgbGlua01vZGVsID0gX3Byb3BzMi5saW5rTW9kZWw7XG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHJvcHMyLnB5ZGlvO1xuXG4gICAgICAgICAgICB2YXIgc3ViamVjdHNIaWRkZW4gPSBbXTtcbiAgICAgICAgICAgIHN1YmplY3RzSGlkZGVuW1widXNlcjpcIiArIGxpbmtNb2RlbC5nZXRMaW5rKCkuVXNlckxvZ2luXSA9IHRydWU7XG4gICAgICAgICAgICB2YXIgc3ViamVjdERpc2FibGVzID0geyBSRUFEOiBzdWJqZWN0c0hpZGRlbiwgV1JJVEU6IHN1YmplY3RzSGlkZGVuIH07XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogdGhpcy5wcm9wcy5zdHlsZSB9LFxuICAgICAgICAgICAgICAgIGxpbmtNb2RlbC5nZXRMaW5rKCkuVXVpZCAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChSZXNvdXJjZVBvbGljaWVzUGFuZWwsIHtcbiAgICAgICAgICAgICAgICAgICAgcHlkaW86IHB5ZGlvLFxuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZVR5cGU6ICdsaW5rJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSgnbGluay52aXNpYmlsaXR5LmFkdmFuY2VkJyksXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlSWQ6IGxpbmtNb2RlbC5nZXRMaW5rKCkuVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgc2tpcFRpdGxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBvblNhdmVQb2xpY2llczogdGhpcy5vblNhdmVQb2xpY2llcy5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICBzdWJqZWN0c0Rpc2FibGVkOiBzdWJqZWN0RGlzYWJsZXMsXG4gICAgICAgICAgICAgICAgICAgIHN1YmplY3RzSGlkZGVuOiBzdWJqZWN0c0hpZGRlbixcbiAgICAgICAgICAgICAgICAgICAgcmVhZG9ubHk6IHRoaXMucHJvcHMuaXNSZWFkb25seSgpIHx8ICFsaW5rTW9kZWwuaXNFZGl0YWJsZSgpLFxuICAgICAgICAgICAgICAgICAgICByZWY6ICdwb2xpY2llcydcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBWaXNpYmlsaXR5UGFuZWw7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuVmlzaWJpbGl0eVBhbmVsLlByb3BUeXBlcyA9IHtcbiAgICBweWRpbzogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5pbnN0YW5jZU9mKF9weWRpbzJbJ2RlZmF1bHQnXSkuaXNSZXF1aXJlZCxcbiAgICBsaW5rTW9kZWw6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uaW5zdGFuY2VPZihfTGlua01vZGVsMlsnZGVmYXVsdCddKS5pc1JlcXVpcmVkXG59O1xuXG5WaXNpYmlsaXR5UGFuZWwgPSAoMCwgX1NoYXJlQ29udGV4dENvbnN1bWVyMlsnZGVmYXVsdCddKShWaXNpYmlsaXR5UGFuZWwpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gVmlzaWJpbGl0eVBhbmVsO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG5cbi8qKlxuICogVXBkYXRlIGFzc29jaWF0ZWQgaGlkZGVuIHVzZXJzIHBvbGljaWVzLCBvdGhlcndpc2VcbiAqIHRoZSBwdWJsaWMgbGluayB2aXNpYmlsaXR5IGNhbm5vdCBiZSBjaGFuZ2VkXG4gKiBAcGFyYW0gZGlmZlBvbGljaWVzXG4gKi9cbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gyLCBfeDMsIF94NCkgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeDIsIHByb3BlcnR5ID0gX3gzLCByZWNlaXZlciA9IF94NDsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeDIgPSBwYXJlbnQ7IF94MyA9IHByb3BlcnR5OyBfeDQgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfY3JlYXRlUmVhY3RDbGFzcyA9IHJlcXVpcmUoJ2NyZWF0ZS1yZWFjdC1jbGFzcycpO1xuXG52YXIgX2NyZWF0ZVJlYWN0Q2xhc3MyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY3JlYXRlUmVhY3RDbGFzcyk7XG5cbnZhciBfcHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xuXG52YXIgX3Byb3BUeXBlczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wcm9wVHlwZXMpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9weWRpb0h0dHBBcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwQXBpKTtcblxudmFyIF9weWRpb01vZGVsTm9kZSA9IHJlcXVpcmUoJ3B5ZGlvL21vZGVsL25vZGUnKTtcblxudmFyIF9weWRpb01vZGVsTm9kZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb01vZGVsTm9kZSk7XG5cbnZhciBfcHlkaW9VdGlsUGF0aCA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvcGF0aCcpO1xuXG52YXIgX3B5ZGlvVXRpbFBhdGgyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9VdGlsUGF0aCk7XG5cbnZhciBfY2VsbHNTZGsgPSByZXF1aXJlKCdjZWxscy1zZGsnKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2Jvb3QnKTtcblxudmFyIEFjdGlvbkRpYWxvZ01peGluID0gX1B5ZGlvJHJlcXVpcmVMaWIuQWN0aW9uRGlhbG9nTWl4aW47XG52YXIgTG9hZGVyID0gX1B5ZGlvJHJlcXVpcmVMaWIuTG9hZGVyO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIyID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2NvbXBvbmVudHMnKTtcblxudmFyIE1vZGFsQXBwQmFyID0gX1B5ZGlvJHJlcXVpcmVMaWIyLk1vZGFsQXBwQmFyO1xudmFyIEVtcHR5U3RhdGVWaWV3ID0gX1B5ZGlvJHJlcXVpcmVMaWIyLkVtcHR5U3RhdGVWaWV3O1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIzID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoXCJob2NcIik7XG5cbnZhciBNb2Rlcm5UZXh0RmllbGQgPSBfUHlkaW8kcmVxdWlyZUxpYjMuTW9kZXJuVGV4dEZpZWxkO1xuXG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCdtYXRlcmlhbC11aS9zdHlsZXMnKTtcblxudmFyIG11aVRoZW1lYWJsZSA9IF9yZXF1aXJlLm11aVRoZW1lYWJsZTtcblxudmFyIFNlbGVjdG9yID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFNlbGVjdG9yLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFNlbGVjdG9yKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2VsZWN0b3IpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFNlbGVjdG9yLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFNlbGVjdG9yLCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBfcHJvcHMudmFsdWU7XG4gICAgICAgICAgICB2YXIgb25DaGFuZ2UgPSBfcHJvcHMub25DaGFuZ2U7XG4gICAgICAgICAgICB2YXIgbXVpVGhlbWUgPSBfcHJvcHMubXVpVGhlbWU7XG4gICAgICAgICAgICB2YXIgbSA9IF9wcm9wcy5tO1xuICAgICAgICAgICAgdmFyIHBhbGV0dGUgPSBtdWlUaGVtZS5wYWxldHRlO1xuXG4gICAgICAgICAgICB2YXIgdGFiU3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgY29sb3I6ICcjNjE2MTYxJ1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciBhY3RpdmVTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBjb2xvcjogcGFsZXR0ZS5hY2NlbnQxQ29sb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgc3BhblN0eWxlID0ge1xuICAgICAgICAgICAgICAgIG1hcmdpblJpZ2h0OiA1XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlRhYnMsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogMzYwIH0sIG9uQ2hhbmdlOiBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2UobnVsbCwgMCwgdik7XG4gICAgICAgICAgICAgICAgICAgIH0sIHZhbHVlOiB2YWx1ZSwgdGFiSXRlbUNvbnRhaW5lclN0eWxlOiB7IGJhY2tncm91bmQ6ICd0cmFuc3BhcmVudCcgfSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRhYiwgeyBsYWJlbDogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IHN0eWxlOiBzcGFuU3R5bGUsIGNsYXNzTmFtZTogXCJtZGkgbWRpLXNoYXJlLXZhcmlhbnRcIiB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oMjQzKVxuICAgICAgICAgICAgICAgICAgICApLCB2YWx1ZTogXCJMSU5LU1wiLCBidXR0b25TdHlsZTogdmFsdWUgPT09ICdMSU5LUycgPyBhY3RpdmVTdHlsZSA6IHRhYlN0eWxlIH0pLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRhYiwgeyBsYWJlbDogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IHN0eWxlOiBzcGFuU3R5bGUsIGNsYXNzTmFtZTogXCJpY29tb29uLWNlbGxzXCIgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKDI1NClcbiAgICAgICAgICAgICAgICAgICAgKSwgdmFsdWU6IFwiQ0VMTFNcIiwgYnV0dG9uU3R5bGU6IHZhbHVlID09PSAnQ0VMTFMnID8gYWN0aXZlU3R5bGUgOiB0YWJTdHlsZSB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBTZWxlY3Rvcjtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5TZWxlY3RvciA9IG11aVRoZW1lYWJsZSgpKFNlbGVjdG9yKTtcblxudmFyIFNoYXJlVmlldyA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudDIpIHtcbiAgICBfaW5oZXJpdHMoU2hhcmVWaWV3LCBfUmVhY3QkQ29tcG9uZW50Mik7XG5cbiAgICBfY3JlYXRlQ2xhc3MoU2hhcmVWaWV3LCBbe1xuICAgICAgICBrZXk6ICdnZXRDaGlsZENvbnRleHQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0Q2hpbGRDb250ZXh0KCkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2VzID0gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaDtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZXM6IG1lc3NhZ2VzLFxuICAgICAgICAgICAgICAgIGdldE1lc3NhZ2U6IGZ1bmN0aW9uIGdldE1lc3NhZ2UobWVzc2FnZUlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuYW1lc3BhY2UgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAnc2hhcmVfY2VudGVyJyA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2VzW25hbWVzcGFjZSArIChuYW1lc3BhY2UgPyBcIi5cIiA6IFwiXCIpICsgbWVzc2FnZUlkXSB8fCBtZXNzYWdlSWQ7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlSWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGlzUmVhZG9ubHk6IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgZnVuY3Rpb24gU2hhcmVWaWV3KHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTaGFyZVZpZXcpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFNoYXJlVmlldy5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHJlc291cmNlczogW10sXG4gICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIHNlbGVjdGVkTW9kZWw6IG51bGwsXG4gICAgICAgICAgICBzaGFyZVR5cGU6IHByb3BzLmRlZmF1bHRTaGFyZVR5cGUgfHwgJ0xJTktTJ1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhTaGFyZVZpZXcsIFt7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudERpZE1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAgICAgdGhpcy5sb2FkKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2xvYWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbG9hZCgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBmaWx0ZXI6ICcnIH0pO1xuICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfY2VsbHNTZGsuU2hhcmVTZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IF9jZWxsc1Nkay5SZXN0TGlzdFNoYXJlZFJlc291cmNlc1JlcXVlc3QoKTtcbiAgICAgICAgICAgIHJlcXVlc3QuU2hhcmVUeXBlID0gX2NlbGxzU2RrLkxpc3RTaGFyZWRSZXNvdXJjZXNSZXF1ZXN0TGlzdFNoYXJlVHlwZS5jb25zdHJ1Y3RGcm9tT2JqZWN0KHRoaXMuc3RhdGUuc2hhcmVUeXBlKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnN1YmplY3QpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0LlN1YmplY3QgPSB0aGlzLnByb3BzLnN1YmplY3Q7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QuT3duZWRCeVN1YmplY3QgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvYWRpbmc6IHRydWUgfSk7XG4gICAgICAgICAgICBhcGkubGlzdFNoYXJlZFJlc291cmNlcyhyZXF1ZXN0KS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IHJlc291cmNlczogcmVzLlJlc291cmNlcyB8fCBbXSwgbG9hZGluZzogZmFsc2UgfSk7XG4gICAgICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRMb25nZXN0UGF0aCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRMb25nZXN0UGF0aChub2RlKSB7XG4gICAgICAgICAgICBpZiAoIW5vZGUuQXBwZWFyc0luKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgcGF0aDogbm9kZS5QYXRoLCBiYXNlbmFtZTogbm9kZS5QYXRoIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcGF0aHMgPSB7fTtcbiAgICAgICAgICAgIG5vZGUuQXBwZWFyc0luLm1hcChmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgICAgIHBhdGhzW2EuUGF0aF0gPSBhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHBhdGhzKTtcbiAgICAgICAgICAgIGtleXMuc29ydCgpO1xuICAgICAgICAgICAgdmFyIGxvbmdlc3QgPSBrZXlzW2tleXMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICB2YXIgbGFiZWwgPSBfcHlkaW9VdGlsUGF0aDJbJ2RlZmF1bHQnXS5nZXRCYXNlbmFtZShsb25nZXN0KTtcbiAgICAgICAgICAgIGlmICghbGFiZWwpIHtcbiAgICAgICAgICAgICAgICBsYWJlbCA9IHBhdGhzW2xvbmdlc3RdLldzTGFiZWw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geyBwYXRoOiBsb25nZXN0LCBhcHBlYXJzSW46IHBhdGhzW2xvbmdlc3RdLCBiYXNlbmFtZTogbGFiZWwgfTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ29UbycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnb1RvKGFwcGVhcnNJbikge1xuICAgICAgICAgICAgdmFyIFBhdGggPSBhcHBlYXJzSW4uUGF0aDtcbiAgICAgICAgICAgIHZhciBXc0xhYmVsID0gYXBwZWFyc0luLldzTGFiZWw7XG4gICAgICAgICAgICB2YXIgV3NVdWlkID0gYXBwZWFyc0luLldzVXVpZDtcblxuICAgICAgICAgICAgLy8gUmVtb3ZlIGZpcnN0IHNlZ21lbnQgKHdzIHNsdWcpXG4gICAgICAgICAgICB2YXIgcGF0aGVzID0gUGF0aC5zcGxpdCgnLycpO1xuICAgICAgICAgICAgcGF0aGVzLnNoaWZ0KCk7XG4gICAgICAgICAgICB2YXIgcHlkaW9Ob2RlID0gbmV3IF9weWRpb01vZGVsTm9kZTJbJ2RlZmF1bHQnXShwYXRoZXMuam9pbignLycpKTtcbiAgICAgICAgICAgIHB5ZGlvTm9kZS5nZXRNZXRhZGF0YSgpLnNldCgncmVwb3NpdG9yeV9pZCcsIFdzVXVpZCk7XG4gICAgICAgICAgICBweWRpb05vZGUuZ2V0TWV0YWRhdGEoKS5zZXQoJ3JlcG9zaXRvcnlfbGFiZWwnLCBXc0xhYmVsKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMucHlkaW8uZ29UbyhweWRpb05vZGUpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblJlcXVlc3RDbG9zZSgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgdmFyIGxvYWRpbmcgPSBfc3RhdGUubG9hZGluZztcbiAgICAgICAgICAgIHZhciByZXNvdXJjZXMgPSBfc3RhdGUucmVzb3VyY2VzO1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSRmaWx0ZXIgPSBfc3RhdGUuZmlsdGVyO1xuICAgICAgICAgICAgdmFyIGZpbHRlciA9IF9zdGF0ZSRmaWx0ZXIgPT09IHVuZGVmaW5lZCA/ICcnIDogX3N0YXRlJGZpbHRlcjtcbiAgICAgICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wczIucHlkaW87XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBfcHJvcHMyLnN0eWxlO1xuXG4gICAgICAgICAgICB2YXIgbSA9IGZ1bmN0aW9uIG0oaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci4nICsgaWRdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJlc291cmNlcy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgdmFyIGtBID0gYS5Ob2RlLlBhdGg7XG4gICAgICAgICAgICAgICAgdmFyIGtCID0gYi5Ob2RlLlBhdGg7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGtBID09PSBrQiA/IDAgOiBrQSA+IGtCID8gMSA6IC0xO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgZXh0ZW5zaW9ucyA9IHB5ZGlvLlJlZ2lzdHJ5LmdldEZpbGVzRXh0ZW5zaW9ucygpO1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHt9LCBzdHlsZSwgeyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBvdmVyZmxvdzogJ2hpZGRlbicgfSkgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgYmFja2dyb3VuZENvbG9yOiAnI0Y1RjVGNScsIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjRUVFRUVFJywgZGlzcGxheTogJ2ZsZXgnLCBwYWRkaW5nUmlnaHQ6IDE2LCBwYWRkaW5nVG9wOiAzIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoU2VsZWN0b3IsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG06IG0sXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS5zaGFyZVR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGUsIGksIHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBzaGFyZVR5cGU6IHYgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIubG9hZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IHN0eWxlOiB7IGZsZXg6IDEgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6IDE1MCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNb2Rlcm5UZXh0RmllbGQsIHsgaGludFRleHQ6IG0oJ3NoYXJlbGlzdC5xdWljay1maWx0ZXInKSwgdmFsdWU6IGZpbHRlciwgb25DaGFuZ2U6IGZ1bmN0aW9uIChlLCB2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IGZpbHRlcjogdiB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdWxsV2lkdGg6IHRydWUgfSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgbG9hZGluZyAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChMb2FkZXIsIHsgc3R5bGU6IHsgaGVpZ2h0OiA0MDAgfSB9KSxcbiAgICAgICAgICAgICAgICAhbG9hZGluZyAmJiByZXNvdXJjZXMubGVuZ3RoID09PSAwICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEVtcHR5U3RhdGVWaWV3LCB7XG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZTogXCJtZGkgbWRpLXNoYXJlLXZhcmlhbnRcIixcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeVRleHRJZDogbSgxMzEpLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBmbGV4OiAxLCBoZWlnaHQ6IDQwMCwgcGFkZGluZzogJzkwcHggMCcsIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyB9XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgIWxvYWRpbmcgJiYgcmVzb3VyY2VzLmxlbmd0aCA+IDAgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLkxpc3QsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgbWluSGVpZ2h0OiA0MDAsIG1heEhlaWdodDogNDAwLCBvdmVyZmxvd1k6ICdhdXRvJywgcGFkZGluZ1RvcDogMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlcy5tYXAoZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIF9nZXRMb25nZXN0UGF0aCA9IF90aGlzMi5nZXRMb25nZXN0UGF0aChyZXMuTm9kZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhcHBlYXJzSW4gPSBfZ2V0TG9uZ2VzdFBhdGguYXBwZWFyc0luO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGJhc2VuYW1lID0gX2dldExvbmdlc3RQYXRoLmJhc2VuYW1lO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaWNvbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiYXNlbmFtZS5pbmRleE9mKCcuJykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbiA9ICdtZGkgbWRpLWZvbGRlcic7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBleHQgPSBfcHlkaW9VdGlsUGF0aDJbJ2RlZmF1bHQnXS5nZXRGaWxlRXh0ZW5zaW9uKGJhc2VuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXh0ZW5zaW9ucy5oYXMoZXh0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgX2V4dGVuc2lvbnMkZ2V0ID0gZXh0ZW5zaW9ucy5nZXQoZXh0KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9udEljb24gPSBfZXh0ZW5zaW9ucyRnZXQuZm9udEljb247XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbiA9ICdtZGkgbWRpLScgKyBmb250SWNvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uID0gJ21kaSBtZGktZmlsZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcy5MaW5rICYmIHJlcy5MaW5rLkxhYmVsICYmIHJlcy5MaW5rLkxhYmVsICE9PSBiYXNlbmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VuYW1lID0gcmVzLkxpbmsuTGFiZWwgKyAnICgnICsgYmFzZW5hbWUgKyAnKSc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeVRleHQ6IGJhc2VuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeVRleHQ6IHJlcy5MaW5rID8gbSgyNTEpICsgJzogJyArIHJlcy5MaW5rLkRlc2NyaXB0aW9uIDogbSgyODQpLnJlcGxhY2UoJyVzJywgcmVzLkNlbGxzLmxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogaWNvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBlYXJzSW46IGFwcGVhcnNJblxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSkuZmlsdGVyKGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZmlsdGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhZmlsdGVyIHx8IHByb3BzLnByaW1hcnlUZXh0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihmaWx0ZXIudG9Mb3dlckNhc2UoKSkgIT09IC0xO1xuICAgICAgICAgICAgICAgICAgICB9KS5tYXAoZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXBwZWFyc0luID0gcHJvcHMuYXBwZWFyc0luO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGljb24gPSBwcm9wcy5pY29uO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTGlzdEl0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5VGV4dDogcHJvcHMucHJpbWFyeVRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5VGV4dDogcHJvcHMuc2Vjb25kYXJ5VGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGVhcnNJbiA/IF90aGlzMi5nb1RvKGFwcGVhcnNJbikgOiBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6ICFhcHBlYXJzSW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdEljb246IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogaWNvbiB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBTaGFyZVZpZXc7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuU2hhcmVWaWV3LmNoaWxkQ29udGV4dFR5cGVzID0ge1xuICAgIG1lc3NhZ2VzOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLm9iamVjdCxcbiAgICBnZXRNZXNzYWdlOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLmZ1bmMsXG4gICAgaXNSZWFkb25seTogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5mdW5jXG59O1xuXG52YXIgU2hhcmVWaWV3TW9kYWwgPSAoMCwgX2NyZWF0ZVJlYWN0Q2xhc3MyWydkZWZhdWx0J10pKHtcbiAgICBkaXNwbGF5TmFtZTogJ1NoYXJlVmlld01vZGFsJyxcbiAgICBtaXhpbnM6IFtBY3Rpb25EaWFsb2dNaXhpbl0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpYWxvZ1RpdGxlOiAnJyxcbiAgICAgICAgICAgIGRpYWxvZ1NpemU6ICdsZycsXG4gICAgICAgICAgICBkaWFsb2dQYWRkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGRpYWxvZ0lzTW9kYWw6IGZhbHNlLFxuICAgICAgICAgICAgZGlhbG9nU2Nyb2xsQm9keTogZmFsc2VcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgc3VibWl0OiBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICAgIHRoaXMuZGlzbWlzcygpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiAnMTAwJScsIGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicgfSB9LFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoTW9kYWxBcHBCYXIsIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFsnc2hhcmVfY2VudGVyLjk4J10sXG4gICAgICAgICAgICAgICAgc2hvd01lbnVJY29uQnV0dG9uOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lUmlnaHQ6ICdtZGkgbWRpLWNsb3NlJyxcbiAgICAgICAgICAgICAgICBvblJpZ2h0SWNvbkJ1dHRvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMy5kaXNtaXNzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChTaGFyZVZpZXcsIF9leHRlbmRzKHt9LCB0aGlzLnByb3BzLCB7IHN0eWxlOiB7IHdpZHRoOiAnMTAwJScsIGZsZXg6IDEgfSwgb25SZXF1ZXN0Q2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMzLmRpc21pc3MoKTtcbiAgICAgICAgICAgICAgICB9IH0pKVxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5leHBvcnRzLlNoYXJlVmlldyA9IFNoYXJlVmlldztcbmV4cG9ydHMuU2hhcmVWaWV3TW9kYWwgPSBTaGFyZVZpZXdNb2RhbDtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX1NoYXJlQ29udGV4dENvbnN1bWVyID0gcmVxdWlyZSgnLi4vU2hhcmVDb250ZXh0Q29uc3VtZXInKTtcblxudmFyIF9TaGFyZUNvbnRleHRDb25zdW1lcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TaGFyZUNvbnRleHRDb25zdW1lcik7XG5cbnZhciBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG4vKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBDb21wb25lbnQgPSBfcmVxdWlyZS5Db21wb25lbnQ7XG5cbnZhciBfcmVxdWlyZTIgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgSWNvbkJ1dHRvbiA9IF9yZXF1aXJlMi5JY29uQnV0dG9uO1xuXG52YXIgX3JlcXVpcmUzID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWkvc3R5bGVzJyk7XG5cbnZhciBtdWlUaGVtZWFibGUgPSBfcmVxdWlyZTMubXVpVGhlbWVhYmxlO1xuXG52YXIgQWN0aW9uQnV0dG9uID0gKGZ1bmN0aW9uIChfQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKEFjdGlvbkJ1dHRvbiwgX0NvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBBY3Rpb25CdXR0b24oKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBBY3Rpb25CdXR0b24pO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEFjdGlvbkJ1dHRvbi5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhBY3Rpb25CdXR0b24sIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgcGFsZXR0ZSA9IHRoaXMucHJvcHMubXVpVGhlbWUucGFsZXR0ZTtcblxuICAgICAgICAgICAgdmFyIHN0eWxlID0ge1xuICAgICAgICAgICAgICAgIHJvb3Q6IHtcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNTAlJyxcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICcgKyBwYWxldHRlLnByaW1hcnkxQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDM2LCBoZWlnaHQ6IDM2LFxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiA4LFxuICAgICAgICAgICAgICAgICAgICBtYXJnaW46ICcwIDZweCcsXG4gICAgICAgICAgICAgICAgICAgIHpJbmRleDogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaWNvbjoge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogcGFsZXR0ZS5wcmltYXJ5MUNvbG9yLFxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMjAsXG4gICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6ICcyMHB4J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KEljb25CdXR0b24sIHtcbiAgICAgICAgICAgICAgICBzdHlsZTogc3R5bGUucm9vdCxcbiAgICAgICAgICAgICAgICBpY29uU3R5bGU6IHN0eWxlLmljb24sXG4gICAgICAgICAgICAgICAgb25Ub3VjaFRhcDogdGhpcy5wcm9wcy5jYWxsYmFjayB8fCB0aGlzLnByb3BzLm9uVG91Y2hUYXAsXG4gICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZTogXCJtZGkgbWRpLVwiICsgdGhpcy5wcm9wcy5tZGlJY29uLFxuICAgICAgICAgICAgICAgIHRvb2x0aXA6IHRoaXMucHJvcHMuZ2V0TWVzc2FnZSh0aGlzLnByb3BzLm1lc3NhZ2VJZCwgdGhpcy5wcm9wcy5tZXNzYWdlQ29yZU5hbWVzcGFjZSA/ICcnIDogdW5kZWZpbmVkKSxcbiAgICAgICAgICAgICAgICB0b29sdGlwUG9zaXRpb246IHRoaXMucHJvcHMudG9vbHRpcFBvc2l0aW9uXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBBY3Rpb25CdXR0b247XG59KShDb21wb25lbnQpO1xuXG5BY3Rpb25CdXR0b24ucHJvcFR5cGVzID0ge1xuICAgIGNhbGxiYWNrOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvblRvdWNoVGFwOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBtZGlJY29uOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIG1lc3NhZ2VJZDogUHJvcFR5cGVzLnN0cmluZ1xufTtcblxuQWN0aW9uQnV0dG9uID0gKDAsIF9TaGFyZUNvbnRleHRDb25zdW1lcjJbJ2RlZmF1bHQnXSkoQWN0aW9uQnV0dG9uKTtcbkFjdGlvbkJ1dHRvbiA9IG11aVRoZW1lYWJsZSgpKEFjdGlvbkJ1dHRvbik7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEFjdGlvbkJ1dHRvbjtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIGFycjJbaV0gPSBhcnJbaV07IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9tYXRlcmlhbFVpU3R5bGVzID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWkvc3R5bGVzJyk7XG5cbnZhciBFZGl0b3JUYWIgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoRWRpdG9yVGFiLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIEVkaXRvclRhYigpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEVkaXRvclRhYik7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoRWRpdG9yVGFiLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEVkaXRvclRhYiwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHRhYnMgPSBfcHJvcHMudGFicztcbiAgICAgICAgICAgIHZhciBhY3RpdmUgPSBfcHJvcHMuYWN0aXZlO1xuICAgICAgICAgICAgdmFyIG9uQ2hhbmdlID0gX3Byb3BzLm9uQ2hhbmdlO1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gX3Byb3BzLnN0eWxlO1xuICAgICAgICAgICAgdmFyIG11aVRoZW1lID0gX3Byb3BzLm11aVRoZW1lO1xuICAgICAgICAgICAgdmFyIHByaW1hcnkxQ29sb3IgPSBtdWlUaGVtZS5wYWxldHRlLnByaW1hcnkxQ29sb3I7XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7IGRpc3BsYXk6ICdmbGV4JyB9LCBzdHlsZSkgfSxcbiAgICAgICAgICAgICAgICB0YWJzLm1hcChmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXNBY3RpdmUgPSB0LlZhbHVlID09PSBhY3RpdmU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGxhYmVsOiB0LkxhYmVsLCBvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2UodC5WYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBwcmltYXJ5OiBpc0FjdGl2ZSwgc3R5bGU6IGlzQWN0aXZlID8geyBib3JkZXJCb3R0b206ICcycHggc29saWQgJyArIHByaW1hcnkxQ29sb3IgfSA6IHsgYm9yZGVyQm90dG9tOiAwIH0gfSk7XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IHN0eWxlOiB7IGZsZXg6IDEgfSB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBFZGl0b3JUYWI7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuRWRpdG9yVGFiID0gKDAsIF9tYXRlcmlhbFVpU3R5bGVzLm11aVRoZW1lYWJsZSkoKShFZGl0b3JUYWIpO1xuXG52YXIgRWRpdG9yVGFiQ29udGVudCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudDIpIHtcbiAgICBfaW5oZXJpdHMoRWRpdG9yVGFiQ29udGVudCwgX1JlYWN0JENvbXBvbmVudDIpO1xuXG4gICAgZnVuY3Rpb24gRWRpdG9yVGFiQ29udGVudCgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEVkaXRvclRhYkNvbnRlbnQpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEVkaXRvclRhYkNvbnRlbnQucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRWRpdG9yVGFiQ29udGVudCwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciB0YWJzID0gX3Byb3BzMi50YWJzO1xuICAgICAgICAgICAgdmFyIGFjdGl2ZSA9IF9wcm9wczIuYWN0aXZlO1xuXG4gICAgICAgICAgICB2YXIgYWN0aXZlQ29udGVudCA9IG51bGw7XG4gICAgICAgICAgICB0YWJzLm1hcChmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgICAgIGlmICh0LlZhbHVlID09PSBhY3RpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlQ29udGVudCA9IHQuQ29tcG9uZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGFjdGl2ZUNvbnRlbnQ7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gRWRpdG9yVGFiQ29udGVudDtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG52YXIgR2VuZXJpY0VkaXRvciA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudDMpIHtcbiAgICBfaW5oZXJpdHMoR2VuZXJpY0VkaXRvciwgX1JlYWN0JENvbXBvbmVudDMpO1xuXG4gICAgZnVuY3Rpb24gR2VuZXJpY0VkaXRvcihwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgR2VuZXJpY0VkaXRvcik7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoR2VuZXJpY0VkaXRvci5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGxlZnQ6IHByb3BzLnRhYnMubGVmdC5sZW5ndGggPyBwcm9wcy50YWJzLmxlZnRbMF0uVmFsdWUgOiAnJyxcbiAgICAgICAgICAgIHJpZ2h0OiBwcm9wcy50YWJzLnJpZ2h0Lmxlbmd0aCA/IHByb3BzLnRhYnMucmlnaHRbMF0uVmFsdWUgOiAnJ1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhHZW5lcmljRWRpdG9yLCBbe1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMocHJvcHMpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5sZWZ0ICYmIHByb3BzLnRhYnMubGVmdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbGVmdDogcHJvcHMudGFicy5sZWZ0WzBdLlZhbHVlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnJpZ2h0ICYmIHByb3BzLnRhYnMucmlnaHQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHJpZ2h0OiBwcm9wcy50YWJzLnJpZ2h0WzBdLlZhbHVlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIF9wcm9wczMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHRhYnMgPSBfcHJvcHMzLnRhYnM7XG4gICAgICAgICAgICB2YXIgaGVhZGVyID0gX3Byb3BzMy5oZWFkZXI7XG4gICAgICAgICAgICB2YXIgb25TYXZlQWN0aW9uID0gX3Byb3BzMy5vblNhdmVBY3Rpb247XG4gICAgICAgICAgICB2YXIgb25DbG9zZUFjdGlvbiA9IF9wcm9wczMub25DbG9zZUFjdGlvbjtcbiAgICAgICAgICAgIHZhciBvblJldmVydEFjdGlvbiA9IF9wcm9wczMub25SZXZlcnRBY3Rpb247XG4gICAgICAgICAgICB2YXIgc2F2ZUVuYWJsZWQgPSBfcHJvcHMzLnNhdmVFbmFibGVkO1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gX3Byb3BzMy5zdHlsZTtcbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9wcm9wczMucHlkaW87XG4gICAgICAgICAgICB2YXIgZWRpdG9yT25lQ29sdW1uID0gX3Byb3BzMy5lZGl0b3JPbmVDb2x1bW47XG4gICAgICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIHZhciBsZWZ0ID0gX3N0YXRlLmxlZnQ7XG4gICAgICAgICAgICB2YXIgcmlnaHQgPSBfc3RhdGUucmlnaHQ7XG5cbiAgICAgICAgICAgIGlmIChlZGl0b3JPbmVDb2x1bW4pIHtcblxuICAgICAgICAgICAgICAgIHZhciBtZXJnZWQgPSBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRhYnMubGVmdCksIF90b0NvbnN1bWFibGVBcnJheSh0YWJzLnJpZ2h0KSk7XG4gICAgICAgICAgICAgICAgdmFyIGhhc0xhc3QgPSBtZXJnZWQuZmlsdGVyKGZ1bmN0aW9uICh0YWIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhYi5BbHdheXNMYXN0O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChoYXNMYXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBtZXJnZWQgPSBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KG1lcmdlZC5maWx0ZXIoZnVuY3Rpb24gKHRhYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICF0YWIuQWx3YXlzTGFzdDtcbiAgICAgICAgICAgICAgICAgICAgfSkpLCBbaGFzTGFzdFswXV0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgaGVpZ2h0OiAnMTAwJScgfSwgc3R5bGUpIH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBiYWNrZ3JvdW5kQ29sb3I6ICcjRUVFRUVFJywgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdmbGV4LWVuZCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhaXNlZEJ1dHRvbiwgeyBkaXNhYmxlZDogIXNhdmVFbmFibGVkLCBwcmltYXJ5OiB0cnVlLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbJzUzJ10sIG9uVG91Y2hUYXA6IG9uU2F2ZUFjdGlvbiB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGRpc2FibGVkOiAhc2F2ZUVuYWJsZWQsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnNjI4J10sIG9uVG91Y2hUYXA6IG9uUmV2ZXJ0QWN0aW9uLCBzdHlsZTogeyBtYXJnaW5MZWZ0OiAxMCB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgaWNvbkNsYXNzTmFtZTogXCJtZGkgbWRpLWNsb3NlXCIsIHRvb2x0aXA6IHB5ZGlvLk1lc3NhZ2VIYXNoWyc4NiddLCBvblRvdWNoVGFwOiBvbkNsb3NlQWN0aW9uLCBzdHlsZTogeyBtYXJnaW5MZWZ0OiAxMCB9IH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmbGV4OiAxLCBwYWRkaW5nOiAnMTBweCAyMHB4JyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChFZGl0b3JUYWIsIHsgdGFiczogbWVyZ2VkLCBhY3RpdmU6IGxlZnQsIHN0eWxlOiB7IGZsZXg6IDEgfSwgb25DaGFuZ2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGxlZnQ6IHZhbHVlIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSlcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRGl2aWRlciwgbnVsbCksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleDogMSB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7IG92ZXJmbG93WTogJ2F1dG8nLCB3aWR0aDogJzEwMCUnLCBoZWlnaHQ6ICcxMDAlJywgcGFkZGluZzogMTAgfSwgdGFicy5sZWZ0U3R5bGUpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoRWRpdG9yVGFiQ29udGVudCwgeyB0YWJzOiBtZXJnZWQsIGFjdGl2ZTogbGVmdCB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGhlaWdodDogJzEwMCUnIH0sIHN0eWxlKSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIHBhZGRpbmc6ICcxMHB4IDIwcHggMjBweCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmbGV4OiAxLCBwYWRkaW5nUmlnaHQ6IDIwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmdUb3A6IDE4IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWlzZWRCdXR0b24sIHsgZGlzYWJsZWQ6ICFzYXZlRW5hYmxlZCwgcHJpbWFyeTogdHJ1ZSwgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWyc1MyddLCBvblRvdWNoVGFwOiBvblNhdmVBY3Rpb24gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBkaXNhYmxlZDogIXNhdmVFbmFibGVkLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbJzYyOCddLCBvblRvdWNoVGFwOiBvblJldmVydEFjdGlvbiwgc3R5bGU6IHsgbWFyZ2luTGVmdDogMTAgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1jbG9zZVwiLCB0b29sdGlwOiBweWRpby5NZXNzYWdlSGFzaFsnODYnXSwgb25Ub3VjaFRhcDogb25DbG9zZUFjdGlvbiwgc3R5bGU6IHsgbWFyZ2luTGVmdDogMTAgfSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoRWRpdG9yVGFiLCB7IHRhYnM6IHRhYnMubGVmdCwgYWN0aXZlOiBsZWZ0LCBzdHlsZTogeyBmbGV4OiAxIH0sIG9uQ2hhbmdlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBsZWZ0OiB2YWx1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoRWRpdG9yVGFiLCB7IHRhYnM6IHRhYnMucmlnaHQsIGFjdGl2ZTogcmlnaHQsIHN0eWxlOiB7IGZsZXg6IDEgfSwgb25DaGFuZ2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IHJpZ2h0OiB2YWx1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIG51bGwpLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZsZXg6IDEgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogX2V4dGVuZHMoeyBvdmVyZmxvd1k6ICdhdXRvJywgd2lkdGg6ICc1MCUnLCBib3JkZXJSaWdodDogJzFweCBzb2xpZCAjZTBlMGUwJywgcGFkZGluZzogMTAgfSwgdGFicy5sZWZ0U3R5bGUpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoRWRpdG9yVGFiQ29udGVudCwgeyB0YWJzOiB0YWJzLmxlZnQsIGFjdGl2ZTogbGVmdCB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHsgb3ZlcmZsb3dZOiAnYXV0bycsIHdpZHRoOiAnNTAlJywgcGFkZGluZzogMTAgfSwgdGFicy5yaWdodFN0eWxlKSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEVkaXRvclRhYkNvbnRlbnQsIHsgdGFiczogdGFicy5yaWdodCwgYWN0aXZlOiByaWdodCB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBHZW5lcmljRWRpdG9yO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEdlbmVyaWNFZGl0b3I7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9jb21wb3NpdGVDb21wb3NpdGVDYXJkID0gcmVxdWlyZSgnLi4vY29tcG9zaXRlL0NvbXBvc2l0ZUNhcmQnKTtcblxudmFyIF9jb21wb3NpdGVDb21wb3NpdGVDYXJkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbXBvc2l0ZUNvbXBvc2l0ZUNhcmQpO1xuXG52YXIgX2NlbGxzQ2VsbENhcmQgPSByZXF1aXJlKCcuLi9jZWxscy9DZWxsQ2FyZCcpO1xuXG52YXIgX2NlbGxzQ2VsbENhcmQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY2VsbHNDZWxsQ2FyZCk7XG5cbnZhciBJbmZvUGFuZWwgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoSW5mb1BhbmVsLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIEluZm9QYW5lbChwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgSW5mb1BhbmVsKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihJbmZvUGFuZWwucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7IHBvcG92ZXJPcGVuOiBmYWxzZSB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhJbmZvUGFuZWwsIFt7XG4gICAgICAgIGtleTogJ29wZW5Qb3BvdmVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9wZW5Qb3BvdmVyKGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcG9wb3Zlck9wZW46IHRydWUsIHBvcG92ZXJBbmNob3I6IGV2ZW50LnRhcmdldCB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3Byb3BzLnB5ZGlvO1xuICAgICAgICAgICAgdmFyIG5vZGUgPSBfcHJvcHMubm9kZTtcblxuICAgICAgICAgICAgaWYgKG5vZGUuaXNSb290KCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIFB5ZGlvV29ya3NwYWNlcy5JbmZvUGFuZWxDYXJkLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9jZWxsc0NlbGxDYXJkMlsnZGVmYXVsdCddLCB7IGNlbGxJZDogcHlkaW8udXNlci5hY3RpdmVSZXBvc2l0b3J5LCBweWRpbzogcHlkaW8sIG1vZGU6ICdpbmZvUGFuZWwnIH0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIFB5ZGlvV29ya3NwYWNlcy5JbmZvUGFuZWxDYXJkLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9jb21wb3NpdGVDb21wb3NpdGVDYXJkMlsnZGVmYXVsdCddLCB7IG5vZGU6IG5vZGUsIHB5ZGlvOiBweWRpbywgbW9kZTogJ2luZm9QYW5lbCcgfSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gSW5mb1BhbmVsO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEluZm9QYW5lbDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgX3B5ZGlvVXRpbFhtbCA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwveG1sJyk7XG5cbnZhciBfcHlkaW9VdGlsWG1sMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvVXRpbFhtbCk7XG5cbnZhciBfcHlkaW9IdHRwQXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9weWRpb0h0dHBBcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwQXBpKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX2NlbGxzU2RrID0gcmVxdWlyZSgnY2VsbHMtc2RrJyk7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdib290Jyk7XG5cbnZhciBtb21lbnQgPSBfUHlkaW8kcmVxdWlyZUxpYi5tb21lbnQ7XG5cbnZhciBTaGFyZUhlbHBlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU2hhcmVIZWxwZXIoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTaGFyZUhlbHBlcik7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFNoYXJlSGVscGVyLCBudWxsLCBbe1xuICAgICAgICBrZXk6ICdtYWlsZXJTdXBwb3J0ZWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbWFpbGVyU3VwcG9ydGVkKHB5ZGlvKSB7XG4gICAgICAgICAgICByZXR1cm4gcHlkaW8uUGFyYW1ldGVycy5nZXQoJ3ZhbGlkTWFpbGVyJyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldEF1dGhvcml6YXRpb25zJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEF1dGhvcml6YXRpb25zKCkge1xuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3B5ZGlvMlsnZGVmYXVsdCddLmdldEluc3RhbmNlKCk7XG4gICAgICAgICAgICB2YXIgcGx1Z2luQ29uZmlncyA9IHB5ZGlvLmdldFBsdWdpbkNvbmZpZ3MoXCJhY3Rpb24uc2hhcmVcIik7XG4gICAgICAgICAgICB2YXIgYXV0aG9yaXphdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgZm9sZGVyX3B1YmxpY19saW5rOiBwbHVnaW5Db25maWdzLmdldChcIkVOQUJMRV9GT0xERVJfUFVCTElDX0xJTktcIiksXG4gICAgICAgICAgICAgICAgZm9sZGVyX3dvcmtzcGFjZXM6IHBsdWdpbkNvbmZpZ3MuZ2V0KFwiRU5BQkxFX0ZPTERFUl9JTlRFUk5BTF9TSEFSSU5HXCIpLFxuICAgICAgICAgICAgICAgIGZpbGVfcHVibGljX2xpbms6IHBsdWdpbkNvbmZpZ3MuZ2V0KFwiRU5BQkxFX0ZJTEVfUFVCTElDX0xJTktcIiksXG4gICAgICAgICAgICAgICAgZmlsZV93b3Jrc3BhY2VzOiBwbHVnaW5Db25maWdzLmdldChcIkVOQUJMRV9GSUxFX0lOVEVSTkFMX1NIQVJJTkdcIiksXG4gICAgICAgICAgICAgICAgZWRpdGFibGVfaGFzaDogcGx1Z2luQ29uZmlncy5nZXQoXCJIQVNIX1VTRVJfRURJVEFCTEVcIiksXG4gICAgICAgICAgICAgICAgaGFzaF9taW5fbGVuZ3RoOiBwbHVnaW5Db25maWdzLmdldChcIkhBU0hfTUlOX0xFTkdUSFwiKSB8fCA2LFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkX21hbmRhdG9yeTogZmFsc2UsXG4gICAgICAgICAgICAgICAgbWF4X2V4cGlyYXRpb246IHBsdWdpbkNvbmZpZ3MuZ2V0KFwiRklMRV9NQVhfRVhQSVJBVElPTlwiKSxcbiAgICAgICAgICAgICAgICBtYXhfZG93bmxvYWRzOiBwbHVnaW5Db25maWdzLmdldChcIkZJTEVfTUFYX0RPV05MT0FEXCIpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHBhc3NNYW5kYXRvcnkgPSBwbHVnaW5Db25maWdzLmdldChcIlNIQVJFX0ZPUkNFX1BBU1NXT1JEXCIpO1xuICAgICAgICAgICAgaWYgKHBhc3NNYW5kYXRvcnkpIHtcbiAgICAgICAgICAgICAgICBhdXRob3JpemF0aW9ucy5wYXNzd29yZF9tYW5kYXRvcnkgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXV0aG9yaXphdGlvbnMucGFzc3dvcmRfcGxhY2Vob2xkZXIgPSBwYXNzTWFuZGF0b3J5ID8gcHlkaW8uTWVzc2FnZUhhc2hbJ3NoYXJlX2NlbnRlci4xNzYnXSA6IHB5ZGlvLk1lc3NhZ2VIYXNoWydzaGFyZV9jZW50ZXIuMTQ4J107XG4gICAgICAgICAgICByZXR1cm4gYXV0aG9yaXphdGlvbnM7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2J1aWxkUHVibGljVXJsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGJ1aWxkUHVibGljVXJsKHB5ZGlvLCBsaW5rKSB7XG4gICAgICAgICAgICB2YXIgc2hvcnRGb3JtID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBhcmd1bWVudHNbMl07XG5cbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSBweWRpby5QYXJhbWV0ZXJzO1xuICAgICAgICAgICAgaWYgKHNob3J0Rm9ybSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnLi4uJyArIHBhcmFtcy5nZXQoJ1BVQkxJQ19CQVNFVVJJJykgKyAnLycgKyBsaW5rLkxpbmtIYXNoO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAobGluay5MaW5rVXJsICYmIGxpbmsuTGlua1VybC5tYXRjaChuZXcgUmVnRXhwKCdeaHR0cDpcXC9cXC98Xmh0dHBzOlxcL1xcLycpKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGluay5MaW5rVXJsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgdXJsID0gcHlkaW8uZ2V0RnJvbnRlbmRVcmwoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdXJsLnByb3RvY29sICsgJy8vJyArIHVybC5ob3N0ICsgcGFyYW1zLmdldCgnUFVCTElDX0JBU0VVUkknKSArICcvJyArIGxpbmsuTGlua0hhc2g7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHB5ZGlvIHtQeWRpb31cbiAgICAgICAgICogQHBhcmFtIG5vZGUge0FqeHBOb2RlfVxuICAgICAgICAgKiBAcmV0dXJuIHt7cHJldmlldzogYm9vbGVhbiwgd3JpdGVhYmxlOiBib29sZWFufX1cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdub2RlSGFzRWRpdG9yJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG5vZGVIYXNFZGl0b3IocHlkaW8sIG5vZGUpIHtcbiAgICAgICAgICAgIGlmICghbm9kZS5nZXRNZXRhZGF0YSgpLmhhcygnbWltZV9oYXNfcHJldmlld19lZGl0b3InKSkge1xuICAgICAgICAgICAgICAgIHZhciBlZGl0b3JzID0gcHlkaW8uUmVnaXN0cnkuZmluZEVkaXRvcnNGb3JNaW1lKG5vZGUuZ2V0QWp4cE1pbWUoKSk7XG4gICAgICAgICAgICAgICAgZWRpdG9ycyA9IGVkaXRvcnMuZmlsdGVyKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlLmlkICE9PSAnZWRpdG9yLmJyb3dzZXInICYmIGUuaWQgIT09ICdlZGl0b3Iub3RoZXInO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHZhciB3cml0ZWFibGUgPSBlZGl0b3JzLmZpbHRlcihmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZS5jYW5Xcml0ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBub2RlLmdldE1ldGFkYXRhKCkuc2V0KFwibWltZV9oYXNfcHJldmlld19lZGl0b3JcIiwgZWRpdG9ycy5sZW5ndGggPiAwKTtcbiAgICAgICAgICAgICAgICBub2RlLmdldE1ldGFkYXRhKCkuc2V0KFwibWltZV9oYXNfd3JpdGVhYmxlX2VkaXRvclwiLCB3cml0ZWFibGUubGVuZ3RoID4gMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHByZXZpZXc6IG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoXCJtaW1lX2hhc19wcmV2aWV3X2VkaXRvclwiKSxcbiAgICAgICAgICAgICAgICB3cml0ZWFibGU6IG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoXCJtaW1lX2hhc193cml0ZWFibGVfZWRpdG9yXCIpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBweWRpbyB7UHlkaW99XG4gICAgICAgICAqIEBwYXJhbSBsaW5rTW9kZWwge0NvbXBvc2l0ZU1vZGVsfVxuICAgICAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBpbGVMYXlvdXREYXRhJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBpbGVMYXlvdXREYXRhKHB5ZGlvLCBsaW5rTW9kZWwpIHtcblxuICAgICAgICAgICAgLy8gU2VhcmNoIHJlZ2lzdHJ5IGZvciB0ZW1wbGF0ZSBub2RlcyBzdGFydGluZyB3aXRoIG1pbmlzaXRlX1xuICAgICAgICAgICAgdmFyIHRtcGwgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgY3VycmVudEV4dCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHZhciBub2RlID0gbGlua01vZGVsLmdldE5vZGUoKTtcbiAgICAgICAgICAgIGlmIChub2RlLmlzTGVhZigpKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudEV4dCA9IG5vZGUuZ2V0QWp4cE1pbWUoKTtcbiAgICAgICAgICAgICAgICB0bXBsID0gX3B5ZGlvVXRpbFhtbDJbJ2RlZmF1bHQnXS5YUGF0aFNlbGVjdE5vZGVzKHB5ZGlvLmdldFhtbFJlZ2lzdHJ5KCksIFwiLy90ZW1wbGF0ZVtjb250YWlucyhAbmFtZSwgJ3VuaXF1ZV9wcmV2aWV3XycpXVwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdG1wbCA9IF9weWRpb1V0aWxYbWwyWydkZWZhdWx0J10uWFBhdGhTZWxlY3ROb2RlcyhweWRpby5nZXRYbWxSZWdpc3RyeSgpLCBcIi8vdGVtcGxhdGVbY29udGFpbnMoQG5hbWUsICdtaW5pc2l0ZV8nKV1cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdG1wbC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodG1wbC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW3sgTEFZT1VUX05BTUU6IHRtcGxbMF0uZ2V0QXR0cmlidXRlKCdlbGVtZW50JyksIExBWU9VVF9MQUJFTDogJycgfV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgY3J0VGhlbWUgPSBweWRpby5QYXJhbWV0ZXJzLmdldCgndGhlbWUnKTtcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICAgICAgICAgIHRtcGwubWFwKGZ1bmN0aW9uICh4bWxOb2RlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRoZW1lID0geG1sTm9kZS5nZXRBdHRyaWJ1dGUoJ3RoZW1lJyk7XG4gICAgICAgICAgICAgICAgaWYgKHRoZW1lICYmIHRoZW1lICE9PSBjcnRUaGVtZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50ID0geG1sTm9kZS5nZXRBdHRyaWJ1dGUoJ2VsZW1lbnQnKTtcbiAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IHhtbE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyk7XG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsID0geG1sTm9kZS5nZXRBdHRyaWJ1dGUoJ2xhYmVsJyk7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRFeHQgJiYgbmFtZSA9PT0gXCJ1bmlxdWVfcHJldmlld19maWxlXCIgJiYgIVNoYXJlSGVscGVyLm5vZGVIYXNFZGl0b3IocHlkaW8sIG5vZGUpLnByZXZpZXcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWdub3JlIHRoaXMgdGVtcGxhdGVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKE1lc3NhZ2VIYXNoW2xhYmVsXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBNZXNzYWdlSGFzaFtsYWJlbF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IHhtbE5vZGUuZ2V0QXR0cmlidXRlKCduYW1lJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhbHVlc1tuYW1lXSA9IGVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgdmFsdWVzLnB1c2goeyBMQVlPVVRfTkFNRTogbmFtZSwgTEFZT1VUX0VMRU1FTlQ6IGVsZW1lbnQsIExBWU9VVF9MQUJFTDogbGFiZWwgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2ZvcmNlTWFpbGVyT2xkU2Nob29sJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGZvcmNlTWFpbGVyT2xkU2Nob29sKCkge1xuICAgICAgICAgICAgcmV0dXJuIGdsb2JhbC5weWRpby5nZXRQbHVnaW5Db25maWdzKFwiYWN0aW9uLnNoYXJlXCIpLmdldChcIkVNQUlMX0lOVklURV9FWFRFUk5BTFwiKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncXJjb2RlRW5hYmxlZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBxcmNvZGVFbmFibGVkKCkge1xuICAgICAgICAgICAgcmV0dXJuIGdsb2JhbC5weWRpby5nZXRQbHVnaW5Db25maWdzKFwiYWN0aW9uLnNoYXJlXCIpLmdldChcIkNSRUFURV9RUkNPREVcIik7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIG5vZGVcbiAgICAgICAgICogQHBhcmFtIGNlbGxNb2RlbFxuICAgICAgICAgKiBAcGFyYW0gdGFyZ2V0VXNlcnNcbiAgICAgICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc2VuZENlbGxJbnZpdGF0aW9uJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNlbmRDZWxsSW52aXRhdGlvbihub2RlLCBjZWxsTW9kZWwsIHRhcmdldFVzZXJzKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDMgfHwgYXJndW1lbnRzWzNdID09PSB1bmRlZmluZWQgPyBmdW5jdGlvbiAoKSB7fSA6IGFyZ3VtZW50c1szXTtcblxuICAgICAgICAgICAgdmFyIF9TaGFyZUhlbHBlciRwcmVwYXJlRW1haWwgPSBTaGFyZUhlbHBlci5wcmVwYXJlRW1haWwobm9kZSwgbnVsbCwgY2VsbE1vZGVsKTtcblxuICAgICAgICAgICAgdmFyIHRlbXBsYXRlSWQgPSBfU2hhcmVIZWxwZXIkcHJlcGFyZUVtYWlsLnRlbXBsYXRlSWQ7XG4gICAgICAgICAgICB2YXIgdGVtcGxhdGVEYXRhID0gX1NoYXJlSGVscGVyJHByZXBhcmVFbWFpbC50ZW1wbGF0ZURhdGE7XG5cbiAgICAgICAgICAgIHZhciBtYWlsID0gbmV3IF9jZWxsc1Nkay5NYWlsZXJNYWlsKCk7XG4gICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9jZWxsc1Nkay5NYWlsZXJTZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgICAgIG1haWwuVG8gPSBbXTtcbiAgICAgICAgICAgIHZhciBpZ25vcmVkID0gMDtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHRhcmdldFVzZXJzKS5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICB2YXIgdSA9IHRhcmdldFVzZXJzW2tdO1xuICAgICAgICAgICAgICAgIHZhciB0byA9IG5ldyBfY2VsbHNTZGsuTWFpbGVyVXNlcigpO1xuICAgICAgICAgICAgICAgIGlmICh1LklkbVVzZXIgJiYgdS5JZG1Vc2VyLkxvZ2luICYmIHUuSWRtVXNlci5BdHRyaWJ1dGVzICYmICh1LklkbVVzZXIuQXR0cmlidXRlc1snaGFzRW1haWwnXSB8fCB1LklkbVVzZXIuQXR0cmlidXRlc1snZW1haWwnXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdG8uVXVpZCA9IHUuSWRtVXNlci5Mb2dpbjtcbiAgICAgICAgICAgICAgICAgICAgbWFpbC5Uby5wdXNoKHRvKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZ25vcmVkKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0bztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2VzID0gX3B5ZGlvMlsnZGVmYXVsdCddLmdldEluc3RhbmNlKCkuTWVzc2FnZUhhc2g7XG4gICAgICAgICAgICBpZiAobWFpbC5Uby5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBtYWlsLlRlbXBsYXRlSWQgPSB0ZW1wbGF0ZUlkO1xuICAgICAgICAgICAgICAgIG1haWwuVGVtcGxhdGVEYXRhID0gdGVtcGxhdGVEYXRhO1xuICAgICAgICAgICAgICAgIGFwaS5zZW5kKG1haWwpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHZhciBtc2cgPSBtZXNzYWdlc1snY29yZS5tYWlsZXIuMSddLnJlcGxhY2UoJyVzJywgbWFpbC5Uby5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGlmIChpZ25vcmVkID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBtc2cgKz0gJyAnICsgbWVzc2FnZXNbJ2NvcmUubWFpbGVyLmVudHJpZXMuaWdub3JlZCddO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfcHlkaW8yWydkZWZhdWx0J10uZ2V0SW5zdGFuY2UoKS5VSS5kaXNwbGF5TWVzc2FnZSgnU1VDQ0VTUycsIG1zZyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF9weWRpbzJbJ2RlZmF1bHQnXS5nZXRJbnN0YW5jZSgpLlVJLmRpc3BsYXlNZXNzYWdlKCdFUlJPUicsIG1lc3NhZ2VzWydjb3JlLm1haWxlci5lbnRyaWVzLmlnbm9yZWQnXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIG5vZGUge05vZGV9XG4gICAgICAgICAqIEBwYXJhbSBsaW5rTW9kZWwge0xpbmtNb2RlbH1cbiAgICAgICAgICogQHBhcmFtIGNlbGxNb2RlbCB7Q2VsbE1vZGVsfVxuICAgICAgICAgKiBAcmV0dXJuIHt7dGVtcGxhdGVJZDogc3RyaW5nLCB0ZW1wbGF0ZURhdGE6IHt9LCBtZXNzYWdlOiBzdHJpbmcsIGxpbmtNb2RlbDogKn19XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAncHJlcGFyZUVtYWlsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHByZXBhcmVFbWFpbChub2RlKSB7XG4gICAgICAgICAgICB2YXIgbGlua01vZGVsID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgICAgIHZhciBjZWxsTW9kZWwgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzJdO1xuXG4gICAgICAgICAgICB2YXIgdGVtcGxhdGVEYXRhID0ge307XG4gICAgICAgICAgICB2YXIgdGVtcGxhdGVJZCA9IFwiXCI7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IFwiXCI7XG4gICAgICAgICAgICB2YXIgdXNlciA9IHB5ZGlvLnVzZXI7XG4gICAgICAgICAgICBpZiAodXNlci5nZXRQcmVmZXJlbmNlKFwiZGlzcGxheU5hbWVcIikpIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZURhdGFbXCJJbnZpdGVyXCJdID0gdXNlci5nZXRQcmVmZXJlbmNlKFwiZGlzcGxheU5hbWVcIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlRGF0YVtcIkludml0ZXJcIl0gPSB1c2VyLmlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxpbmtNb2RlbCkge1xuICAgICAgICAgICAgICAgIHZhciBsaW5rT2JqZWN0ID0gbGlua01vZGVsLmdldExpbmsoKTtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5pc0xlYWYoKSkge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZUlkID0gXCJQdWJsaWNGaWxlXCI7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlRGF0YVtcIkZpbGVOYW1lXCJdID0gbGlua09iamVjdC5MYWJlbCB8fCBub2RlLmdldExhYmVsKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVJZCA9IFwiUHVibGljRm9sZGVyXCI7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlRGF0YVtcIkZvbGRlck5hbWVcIl0gPSBsaW5rT2JqZWN0LkxhYmVsIHx8IG5vZGUuZ2V0TGFiZWwoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVEYXRhW1wiTGlua1BhdGhcIl0gPSBcIi9wdWJsaWMvXCIgKyBsaW5rT2JqZWN0LkxpbmtIYXNoO1xuICAgICAgICAgICAgICAgIGlmIChsaW5rT2JqZWN0Lk1heERvd25sb2Fkcykge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZURhdGFbXCJNYXhEb3dubG9hZHNcIl0gPSBsaW5rT2JqZWN0Lk1heERvd25sb2FkcyArIFwiXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChsaW5rT2JqZWN0LkFjY2Vzc0VuZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbSA9IG1vbWVudChuZXcgRGF0ZShsaW5rT2JqZWN0LkFjY2Vzc0VuZCAqIDEwMDApKTtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVEYXRhW1wiRXhwaXJlXCJdID0gbS5mb3JtYXQoJ0xMJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZUlkID0gXCJDZWxsXCI7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVEYXRhW1wiQ2VsbFwiXSA9IGNlbGxNb2RlbC5nZXRMYWJlbCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlSWQ6IHRlbXBsYXRlSWQsIHRlbXBsYXRlRGF0YTogdGVtcGxhdGVEYXRhLCBtZXNzYWdlOiBtZXNzYWdlLCBsaW5rTW9kZWw6IGxpbmtNb2RlbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBTaGFyZUhlbHBlcjtcbn0pKCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFNoYXJlSGVscGVyO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iXX0=
