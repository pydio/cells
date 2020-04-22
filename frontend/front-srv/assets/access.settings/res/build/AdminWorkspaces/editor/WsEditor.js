/*
 * Copyright 2007-2019 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _modelWs = require('../model/Ws');

var _modelWs2 = _interopRequireDefault(_modelWs);

var _WsAutoComplete = require('./WsAutoComplete');

var _WsAutoComplete2 = _interopRequireDefault(_WsAutoComplete);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var PaperEditorLayout = _Pydio$requireLib.PaperEditorLayout;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib2.ModernTextField;
var ModernSelectField = _Pydio$requireLib2.ModernSelectField;
var ModernStyles = _Pydio$requireLib2.ModernStyles;
var _AdminComponents = AdminComponents;
var QuotaField = _AdminComponents.QuotaField;

var WsEditor = (function (_React$Component) {
    _inherits(WsEditor, _React$Component);

    function WsEditor(props) {
        var _this = this;

        _classCallCheck(this, WsEditor);

        _get(Object.getPrototypeOf(WsEditor.prototype), 'constructor', this).call(this, props);
        var workspace = new _modelWs2['default'](props.workspace);
        workspace.observe('update', function () {
            _this.forceUpdate();
        });
        this.state = {
            workspace: workspace.getModel(),
            container: workspace,
            newFolderKey: Math.random(),
            showDialog: false
        };
    }

    _createClass(WsEditor, [{
        key: 'enableSync',
        value: function enableSync(value) {
            if (value) {
                this.setState({ showDialog: 'enableSync', dialogTargetValue: value });
            } else {
                this.setState({ showDialog: 'disableSync', dialogTargetValue: value });
            }
        }
    }, {
        key: 'confirmSync',
        value: function confirmSync(value) {
            var workspace = this.state.workspace;

            workspace.Attributes['ALLOW_SYNC'] = value;
            this.setState({ showDialog: false, dialogTargetValue: null });
        }
    }, {
        key: 'revert',
        value: function revert() {
            var _this2 = this;

            var container = this.state.container;

            container.revert();
            this.setState({ workspace: container.getModel() }, function () {
                _this2.forceUpdate();
            });
        }
    }, {
        key: 'save',
        value: function save() {
            var _this3 = this;

            var container = this.state.container;
            var _props = this.props;
            var reloadList = _props.reloadList;
            var closeEditor = _props.closeEditor;

            this.setState({ saving: true });
            var create = container.create;

            container.save().then(function () {
                reloadList();
                _this3.setState({
                    workspace: container.getModel(),
                    saving: false }, function () {
                    _this3.forceUpdate();
                });
                if (create) {
                    closeEditor();
                }
            })['catch'](function () {
                _this3.setState({ saving: false });
            });
        }
    }, {
        key: 'remove',
        value: function remove() {
            var container = this.state.container;
            var _props2 = this.props;
            var closeEditor = _props2.closeEditor;
            var reloadList = _props2.reloadList;
            var pydio = _props2.pydio;

            pydio.UI.openConfirmDialog({
                message: pydio.MessageHash['settings.35'],
                destructive: [container.getModel().Label],
                validCallback: function validCallback() {
                    container.remove().then(function () {
                        reloadList();
                        closeEditor();
                    });
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var _props3 = this.props;
            var closeEditor = _props3.closeEditor;
            var pydio = _props3.pydio;
            var advanced = _props3.advanced;
            var _state = this.state;
            var workspace = _state.workspace;
            var container = _state.container;
            var newFolderKey = _state.newFolderKey;
            var saving = _state.saving;
            var showDialog = _state.showDialog;
            var dialogTargetValue = _state.dialogTargetValue;

            var m = function m(id) {
                return pydio.MessageHash['ajxp_admin.' + id] || id;
            };
            var mS = function mS(id) {
                return pydio.MessageHash['settings.' + id] || id;
            };
            var readonly = !workspace.PoliciesContextEditable;

            var buttons = [];
            if (!container.create && !readonly) {
                buttons.push(PaperEditorLayout.actionButton(m('plugins.6'), "mdi mdi-undo", function () {
                    _this4.revert();
                }, !container.isDirty()));
            }
            if (!readonly) {
                buttons.push(PaperEditorLayout.actionButton(pydio.MessageHash['53'], "mdi mdi-content-save", function () {
                    _this4.save();
                }, saving || !(container.isDirty() && container.isValid())));
            }

            var delButton = undefined;
            if (!container.create && !readonly) {
                delButton = _react2['default'].createElement(
                    'div',
                    { style: { padding: 16, textAlign: 'center' } },
                    m('ws.editor.help.delete'),
                    _react2['default'].createElement('br', null),
                    _react2['default'].createElement('br', null),
                    _react2['default'].createElement(_materialUi.RaisedButton, { secondary: true, label: m('ws.23'), onTouchTap: function () {
                            _this4.remove();
                        } })
                );
            }
            var leftNav = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { style: { padding: 16, color: '#9e9e9e' } },
                    _react2['default'].createElement(
                        'div',
                        { style: { fontSize: 120, textAlign: 'center', paddingBottom: 10 } },
                        _react2['default'].createElement('i', { className: "mdi mdi-folder-open" })
                    ),
                    m('ws.editor.help.1'),
                    _react2['default'].createElement('br', null),
                    _react2['default'].createElement('br', null),
                    m('ws.editor.help.2')
                ),
                delButton && _react2['default'].createElement(_materialUi.Divider, null),
                delButton
            );

            var adminStyles = AdminComponents.AdminStyles(this.props.muiTheme.palette);
            var styles = {
                title: {
                    fontSize: 20,
                    paddingTop: 20,
                    marginBottom: 0
                },
                legend: { color: '#9E9E9E', paddingTop: 10 },
                section: _extends({ padding: '0 20px 20px', margin: 10, backgroundColor: 'white' }, adminStyles.body.block.container),
                toggleDiv: { height: 50, display: 'flex', alignItems: 'flex-end' }
            };

            var roots = workspace.RootNodes;
            var completers = Object.keys(roots).map(function (k) {
                var label = m('ws.editor.path.folder');
                if (_modelWs2['default'].rootIsTemplatePath(roots[k])) {
                    label = m('ws.editor.path.template');
                }
                return _react2['default'].createElement(_WsAutoComplete2['default'], {
                    key: roots[k].Uuid,
                    pydio: pydio,
                    label: label,
                    value: roots[k].Path,
                    onDelete: function () {
                        delete roots[k];_this4.forceUpdate();
                    },
                    onChange: function (key, node) {
                        delete roots[k];
                        if (key !== '') {
                            roots[node.Uuid] = node;
                        }
                    },
                    skipTemplates: container.hasFolderRoots()
                });
            });
            if (!container.hasTemplatePath()) {
                completers.push(_react2['default'].createElement(_WsAutoComplete2['default'], {
                    key: newFolderKey,
                    pydio: pydio,
                    value: "",
                    onChange: function (k, node) {
                        if (node) {
                            roots[node.Uuid] = node;_this4.setState({ newFolderKey: Math.random() });
                        }
                    },
                    skipTemplates: container.hasFolderRoots()
                }));
            }

            return _react2['default'].createElement(
                PaperEditorLayout,
                {
                    title: workspace.Label || mS('90'),
                    titleActionBar: buttons,
                    closeAction: closeEditor,
                    leftNav: leftNav,
                    className: 'workspace-editor',
                    contentFill: false
                },
                _react2['default'].createElement(
                    _materialUi.Dialog,
                    {
                        open: showDialog,
                        title: m('ws.editor.sync.warning'),
                        onRequestClose: function () {
                            _this4.confirmSync(!dialogTargetValue);
                        },
                        actions: [_react2['default'].createElement(_materialUi.FlatButton, { label: pydio.MessageHash['54'], onTouchTap: function () {
                                _this4.confirmSync(!dialogTargetValue);
                            } }), _react2['default'].createElement(_materialUi.FlatButton, { label: m('ws.editor.sync.warning.validate'), onTouchTap: function () {
                                _this4.confirmSync(dialogTargetValue);
                            } })]
                    },
                    showDialog === 'enableSync' && _react2['default'].createElement(
                        'div',
                        null,
                        m('ws.editor.sync.warning.enable')
                    ),
                    showDialog === 'disableSync' && _react2['default'].createElement(
                        'div',
                        null,
                        m('ws.editor.sync.warning.disable')
                    )
                ),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 0, style: styles.section },
                    _react2['default'].createElement(
                        'div',
                        { style: styles.title },
                        m('ws.30')
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: styles.legend },
                        m('ws.editor.options.legend')
                    ),
                    _react2['default'].createElement(ModernTextField, {
                        fullWidth: true,
                        errorText: workspace.Label ? "" : m('ws.editor.label.legend'),
                        floatingLabelText: mS('8'),
                        value: workspace.Label,
                        onChange: function (e, v) {
                            workspace.Label = v;
                        }
                    }),
                    _react2['default'].createElement(ModernTextField, {
                        fullWidth: true,
                        floatingLabelText: m("ws.editor.description"),
                        value: workspace.Description,
                        onChange: function (e, v) {
                            workspace.Description = v;
                        }
                    }),
                    _react2['default'].createElement(
                        'div',
                        { style: _extends({}, styles.legend, { marginTop: 8 }) },
                        m('ws.editor.slug.legend')
                    ),
                    _react2['default'].createElement(ModernTextField, {
                        fullWidth: true,
                        errorText: workspace.Label && !workspace.Slug ? m('ws.editor.slug.legend') : "",
                        floatingLabelText: m('ws.5'),
                        value: workspace.Slug,
                        onChange: function (e, v) {
                            workspace.Slug = v;
                        }
                    })
                ),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 0, style: styles.section },
                    _react2['default'].createElement(
                        'div',
                        { style: styles.title },
                        m('ws.editor.data.title')
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: styles.legend },
                        m('ws.editor.data.legend')
                    ),
                    completers,
                    _react2['default'].createElement(
                        'div',
                        { style: styles.legend },
                        m('ws.editor.default_rights')
                    ),
                    _react2['default'].createElement(
                        ModernSelectField,
                        {
                            fullWidth: true,
                            value: workspace.Attributes['DEFAULT_RIGHTS'] || '',
                            onChange: function (e, i, v) {
                                workspace.Attributes['DEFAULT_RIGHTS'] = v;
                            }
                        },
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: m('ws.editor.default_rights.none'), value: "" }),
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: m('ws.editor.default_rights.read'), value: "r" }),
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: m('ws.editor.default_rights.readwrite'), value: "rw" }),
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: m('ws.editor.default_rights.write'), value: "w" })
                    )
                ),
                advanced && _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 0, style: styles.section },
                    _react2['default'].createElement(
                        'div',
                        { style: styles.title },
                        m('ws.editor.other')
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: _extends({}, styles.legend, { marginTop: 8 }) },
                        m('ws.editor.other.sync.legend')
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: styles.toggleDiv },
                        _react2['default'].createElement(_materialUi.Toggle, _extends({
                            label: m('ws.editor.other.sync'),
                            labelPosition: "right",
                            toggled: workspace.Attributes['ALLOW_SYNC'],
                            onToggle: function (e, v) {
                                if (!container.hasTemplatePath() && v) {
                                    _this4.enableSync(v);
                                } else if (!v) {
                                    _this4.enableSync(v);
                                } else {
                                    workspace.Attributes['ALLOW_SYNC'] = v;
                                }
                            }
                        }, ModernStyles.toggleField))
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: _extends({}, styles.legend, { marginTop: 8 }) },
                        m('ws.editor.other.quota')
                    ),
                    _react2['default'].createElement(QuotaField, { value: workspace.Attributes['QUOTA'] || 0, onChange: function (e, v) {
                            if (v > 0) {
                                workspace.Attributes['QUOTA'] = v + '';
                            } else {
                                workspace.Attributes['QUOTA'] = '0';
                                delete workspace.Attributes['QUOTA'];
                            }
                        } }),
                    _react2['default'].createElement(
                        'div',
                        { style: _extends({}, styles.legend, { marginTop: 8 }) },
                        m('ws.editor.other.layout')
                    ),
                    _react2['default'].createElement(
                        ModernSelectField,
                        { fullWidth: true, value: workspace.Attributes['META_LAYOUT'] || "", onChange: function (e, i, v) {
                                workspace.Attributes['META_LAYOUT'] = v;
                            } },
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: m('ws.editor.other.layout.default'), value: "" }),
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: m('ws.editor.other.layout.easy'), value: "meta.layout_sendfile" })
                    )
                )
            );
        }
    }]);

    return WsEditor;
})(_react2['default'].Component);

exports['default'] = WsEditor = (0, _materialUiStyles.muiThemeable)()(WsEditor);
exports['default'] = WsEditor;
module.exports = exports['default'];
