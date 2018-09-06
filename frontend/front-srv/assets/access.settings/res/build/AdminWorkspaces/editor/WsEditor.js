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

var _modelWs = require('../model/Ws');

var _modelWs2 = _interopRequireDefault(_modelWs);

var _WsAutoComplete = require('./WsAutoComplete');

var _WsAutoComplete2 = _interopRequireDefault(_WsAutoComplete);

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
            newFolderKey: Math.random()
        };
    }

    _createClass(WsEditor, [{
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
            var reloadList = this.props.reloadList;

            container.save().then(function () {
                reloadList();
                _this3.setState({ workspace: container.getModel() }, function () {
                    _this3.forceUpdate();
                });
            });
        }
    }, {
        key: 'remove',
        value: function remove() {
            var container = this.state.container;
            var _props = this.props;
            var closeEditor = _props.closeEditor;
            var reloadList = _props.reloadList;
            var pydio = _props.pydio;

            if (confirm(pydio.MessageHash['settings.35'])) {
                container.remove().then(function () {
                    reloadList();
                    closeEditor();
                });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var closeEditor = this.props.closeEditor;
            var _state = this.state;
            var workspace = _state.workspace;
            var container = _state.container;
            var newFolderKey = _state.newFolderKey;

            var buttons = [];
            if (!container.create) {
                buttons.push(_react2['default'].createElement(_materialUi.FlatButton, { label: "Revert", secondary: true, disabled: !container.isDirty(), onTouchTap: function () {
                        _this4.revert();
                    } }));
            }
            buttons.push(_react2['default'].createElement(_materialUi.FlatButton, { label: "Save", secondary: true, disabled: !(container.isDirty() && container.isValid()), onTouchTap: function () {
                    _this4.save();
                } }));
            buttons.push(_react2['default'].createElement(_materialUi.RaisedButton, { label: "Close", onTouchTap: closeEditor }));

            var delButton = undefined;
            if (!container.create) {
                delButton = _react2['default'].createElement(
                    'div',
                    { style: { padding: 16, textAlign: 'center' } },
                    'Dangerous Operation: ',
                    _react2['default'].createElement('br', null),
                    _react2['default'].createElement('br', null),
                    _react2['default'].createElement(_materialUi.RaisedButton, { secondary: true, label: "Delete Workspace", onTouchTap: function () {
                            _this4.remove();
                        } })
                );
            }
            var leftNav = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { style: { padding: 16 } },
                    'Workspace are used to actually grant data access to the users.',
                    _react2['default'].createElement('br', null),
                    _react2['default'].createElement('br', null),
                    'It is composed of one or many "roots" that are exposed to the users. You can pick either a folder or a file from any datasource, or a preset Template Path that will be resolved automatically at run time (see the Storage section).',
                    _react2['default'].createElement('br', null),
                    _react2['default'].createElement('br', null),
                    'In the latter case (using template paths), you can only add one Template Path as root of a workspace.'
                ),
                delButton && _react2['default'].createElement(_materialUi.Divider, null),
                delButton
            );

            var styles = {
                title: {
                    fontSize: 20,
                    paddingTop: 20,
                    marginBottom: 0
                },
                legend: {},
                section: { padding: '0 20px 20px' },
                toggleDiv: { height: 50, display: 'flex', alignItems: 'flex-end' }
            };

            var roots = workspace.RootNodes;
            var completers = Object.keys(roots).map(function (k) {
                var label = "Folder Path";
                if (_modelWs2['default'].rootIsTemplatePath(roots[k])) {
                    label = "Template Path";
                }
                return _react2['default'].createElement(_WsAutoComplete2['default'], {
                    key: roots[k].Uuid,
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
                PydioComponents.PaperEditorLayout,
                {
                    title: workspace.Label || 'New Workspace',
                    titleActionBar: buttons,
                    leftNav: leftNav,
                    className: 'workspace-editor',
                    contentFill: false
                },
                _react2['default'].createElement(
                    'div',
                    { style: styles.section },
                    _react2['default'].createElement(
                        'div',
                        { style: styles.title },
                        'Main Options'
                    ),
                    _react2['default'].createElement(_materialUi.TextField, { fullWidth: true, floatingLabelFixed: true, floatingLabelText: "Workspace Label", value: workspace.Label, onChange: function (e, v) {
                            workspace.Label = v;
                        } }),
                    _react2['default'].createElement(_materialUi.TextField, { fullWidth: true, floatingLabelFixed: true, floatingLabelText: "Workspace Description", value: workspace.Description, onChange: function (e, v) {
                            workspace.Description = v;
                        } }),
                    _react2['default'].createElement(_materialUi.TextField, { fullWidth: true, floatingLabelFixed: true, floatingLabelText: "Workspace Slug (technical access)", value: workspace.Slug, onChange: function (e, v) {
                            workspace.Slug = v;
                        } })
                ),
                _react2['default'].createElement(_materialUi.Divider, null),
                _react2['default'].createElement(
                    'div',
                    { style: styles.section },
                    _react2['default'].createElement(
                        'div',
                        { style: styles.title },
                        'Permissions'
                    ),
                    completers,
                    _react2['default'].createElement(
                        _materialUi.SelectField,
                        {
                            fullWidth: true,
                            floatingLabelFixed: true,
                            floatingLabelText: "Default Access (all users)",
                            value: workspace.Attributes['DEFAULT_RIGHTS'],
                            onChange: function (e, i, v) {
                                workspace.Attributes['DEFAULT_RIGHTS'] = v;
                            }
                        },
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "None", value: "" }),
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "Read only", value: "r" }),
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "Read and write", value: "rw" }),
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "Write only", value: "w" })
                    )
                ),
                _react2['default'].createElement(_materialUi.Divider, null),
                _react2['default'].createElement(
                    'div',
                    { style: styles.section },
                    _react2['default'].createElement(
                        'div',
                        { style: styles.title },
                        'Other'
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: styles.toggleDiv },
                        _react2['default'].createElement(_materialUi.Toggle, { label: "Allow Synchronization", toggled: workspace.Attributes['ALLOW_SYNC'], onToggle: function (e, v) {
                                workspace.Attributes['ALLOW_SYNC'] = v;
                            } })
                    ),
                    _react2['default'].createElement(
                        _materialUi.SelectField,
                        { fullWidth: true, floatingLabelFixed: true, floatingLabelText: "Workspace Layout", value: workspace.Attributes['META_LAYOUT'] || "", onChange: function (e, i, v) {
                                workspace.Attributes['META_LAYOUT'] = v;
                            } },
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "Default", value: "" }),
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "Easy Transfer Layout", value: "meta.layout_sendfile" })
                    )
                )
            );
        }
    }]);

    return WsEditor;
})(_react2['default'].Component);

exports['default'] = WsEditor;
module.exports = exports['default'];
