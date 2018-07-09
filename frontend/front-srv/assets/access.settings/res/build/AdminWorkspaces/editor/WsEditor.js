'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _modelWs = require('../model/Ws');

var _modelWs2 = _interopRequireDefault(_modelWs);

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

var _pydioHttpRestApi = require("pydio/http/rest-api");

var AutocompleteTree = (function (_React$Component) {
    _inherits(AutocompleteTree, _React$Component);

    function AutocompleteTree(props) {
        _classCallCheck(this, AutocompleteTree);

        _get(Object.getPrototypeOf(AutocompleteTree.prototype), 'constructor', this).call(this, props);
        this.debounced = (0, _lodashDebounce2['default'])(this.loadValues.bind(this), 300);
        this.state = { searchText: props.value, value: props.value };
        console.log(this.state);
    }

    _createClass(AutocompleteTree, [{
        key: 'handleUpdateInput',
        value: function handleUpdateInput(searchText) {
            this.debounced();
            this.setState({ searchText: searchText });
        }
    }, {
        key: 'handleNewRequest',
        value: function handleNewRequest(chosenValue) {
            var key = undefined;
            var chosenNode = undefined;
            var nodes = this.state.nodes;

            if (chosenValue.key === undefined) {
                if (chosenValue === '') {
                    this.props.onChange('');
                }
                key = chosenValue;
                var ok = false;
                nodes.map(function (node) {
                    if (node.Path === key) {
                        chosenNode = node;
                        ok = true;
                    }
                });
                if (!ok) {
                    nodes.map(function (node) {
                        if (node.Path.indexOf(key) === 0) {
                            key = node.Path;
                            chosenNode = node;
                            ok = true;
                        }
                    });
                }
                if (!ok) {
                    return;
                }
            } else {
                key = chosenValue.key;
                chosenNode = chosenValue.node;
            }
            this.setState({ value: key });
            this.props.onChange(key, chosenNode);
            this.loadValues(key);
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.lastSearch = null;
            var value = "";
            if (this.props.value) {
                value = this.props.value;
            }
            this.loadValues(value);
        }
    }, {
        key: 'loadValues',
        value: function loadValues() {
            var _this = this;

            var value = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
            var searchText = this.state.searchText;

            var basePath = value;
            if (!value && searchText) {
                var last = searchText.lastIndexOf('/');
                basePath = searchText.substr(0, last);
            }
            if (this.lastSearch !== null && this.lastSearch === basePath) {
                return;
            }
            this.lastSearch = basePath;

            var api = new _pydioHttpRestApi.AdminTreeServiceApi(PydioApi.getRestClient());
            var listRequest = new _pydioHttpRestApi.TreeListNodesRequest();
            var treeNode = new _pydioHttpRestApi.TreeNode();
            treeNode.Path = basePath;
            listRequest.Node = treeNode;
            this.setState({ loading: true });
            api.listAdminTree(listRequest).then(function (nodesColl) {
                _this.setState({ nodes: nodesColl.Children || [], loading: false });
            })['catch'](function () {
                _this.setState({ loading: false });
            });
        }
    }, {
        key: 'renderNode',
        value: function renderNode(node) {
            var label = _react2['default'].createElement(
                'span',
                null,
                node.Path
            );
            var icon = "mdi mdi-folder";
            var categ = "folder";
            if (!node.Uuid.startsWith("DATASOURCE:")) {
                icon = "mdi mdi-database";
                categ = "templatePath";
            }
            return {
                key: node.Path,
                text: node.Path,
                node: node,
                categ: categ,
                value: _react2['default'].createElement(
                    _materialUi.MenuItem,
                    null,
                    _react2['default'].createElement(_materialUi.FontIcon, { className: icon, color: '#616161', style: { float: 'left', marginRight: 8 } }),
                    ' ',
                    label
                )
            };
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props;
            var onDelete = _props.onDelete;
            var skipTemplates = _props.skipTemplates;
            var label = _props.label;
            var _state = this.state;
            var nodes = _state.nodes;
            var loading = _state.loading;

            var dataSource = [];
            if (nodes) {
                (function () {
                    var categs = {};
                    nodes.forEach(function (node) {
                        var data = _this2.renderNode(node);
                        if (!categs[data.categ]) {
                            categs[data.categ] = [];
                        }
                        categs[data.categ].push(data);
                    });
                    if (Object.keys(categs).length > 1) {
                        dataSource.push({ key: "h1", text: '', value: _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "DataSources and folders", style: { fontSize: 13, fontWeight: 500 }, disabled: true }) });
                        dataSource.push.apply(dataSource, _toConsumableArray(categs[Object.keys(categs)[0]]));
                        if (!skipTemplates) {
                            dataSource.push({ key: "h2", text: '', value: _react2['default'].createElement(_materialUi.MenuItem, { primaryText: "Preset Template Paths", style: { fontSize: 13, fontWeight: 500 }, disabled: true }) });
                            dataSource.push.apply(dataSource, _toConsumableArray(categs[Object.keys(categs)[1]]));
                        }
                    } else if (Object.keys(categs).length === 1) {
                        dataSource.push.apply(dataSource, _toConsumableArray(categs[Object.keys(categs)[0]]));
                    }
                })();
            }

            var displayText = this.state.value;

            return _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 1, style: { display: 'flex', alignItems: 'baseline', padding: 10, paddingTop: 0, marginTop: 10 } },
                _react2['default'].createElement(
                    'div',
                    { style: { position: 'relative', flex: 1, marginTop: -5 } },
                    _react2['default'].createElement(
                        'div',
                        { style: { position: 'absolute', right: 0, top: 30, width: 30 } },
                        _react2['default'].createElement(_materialUi.RefreshIndicator, {
                            size: 30,
                            left: 0,
                            top: 0,
                            status: loading ? "loading" : "hide"
                        })
                    ),
                    _react2['default'].createElement(_materialUi.AutoComplete, {
                        fullWidth: true,
                        searchText: displayText,
                        onUpdateInput: this.handleUpdateInput.bind(this),
                        onNewRequest: this.handleNewRequest.bind(this),
                        dataSource: dataSource,
                        floatingLabelText: label || 'Select a folder or a predefined template path',
                        floatingLabelStyle: { whiteSpace: 'nowrap' },
                        floatingLabelFixed: true,
                        filter: function (searchText, key) {
                            return key.toLowerCase().indexOf(searchText.toLowerCase()) === 0;
                        },
                        openOnFocus: true,
                        menuProps: { maxHeight: 200 }
                    })
                ),
                onDelete && _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-delete", onTouchTap: onDelete })
            );
        }
    }]);

    return AutocompleteTree;
})(_react2['default'].Component);

var WsEditor = (function (_React$Component2) {
    _inherits(WsEditor, _React$Component2);

    function WsEditor(props) {
        var _this3 = this;

        _classCallCheck(this, WsEditor);

        _get(Object.getPrototypeOf(WsEditor.prototype), 'constructor', this).call(this, props);
        var workspace = new _modelWs2['default'](props.workspace);
        workspace.observe('update', function () {
            _this3.forceUpdate();
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
            var _this4 = this;

            var container = this.state.container;

            container.revert();
            this.setState({ workspace: container.getModel() }, function () {
                _this4.forceUpdate();
            });
        }
    }, {
        key: 'save',
        value: function save() {
            var _this5 = this;

            var container = this.state.container;
            var reloadList = this.props.reloadList;

            container.save().then(function () {
                reloadList();
                _this5.setState({ workspace: container.getModel() }, function () {
                    _this5.forceUpdate();
                });
            });
        }
    }, {
        key: 'remove',
        value: function remove() {
            var container = this.state.container;
            var _props2 = this.props;
            var closeEditor = _props2.closeEditor;
            var reloadList = _props2.reloadList;

            if (confirm('Are you sure?')) {
                container.remove().then(function () {
                    reloadList();
                    closeEditor();
                });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this6 = this;

            var closeEditor = this.props.closeEditor;
            var _state2 = this.state;
            var workspace = _state2.workspace;
            var container = _state2.container;
            var newFolderKey = _state2.newFolderKey;

            var buttons = [];
            if (!container.create) {
                buttons.push(_react2['default'].createElement(_materialUi.FlatButton, { label: "Revert", secondary: true, disabled: !container.isDirty(), onTouchTap: function () {
                        _this6.revert();
                    } }));
            }
            buttons.push(_react2['default'].createElement(_materialUi.FlatButton, { label: "Save", secondary: true, disabled: !(container.isDirty() && container.isValid()), onTouchTap: function () {
                    _this6.save();
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
                            _this6.remove();
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
                return _react2['default'].createElement(AutocompleteTree, {
                    key: roots[k].Uuid,
                    label: label,
                    value: roots[k].Path,
                    onDelete: function () {
                        delete roots[k];_this6.forceUpdate();
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
                completers.push(_react2['default'].createElement(AutocompleteTree, {
                    key: newFolderKey,
                    value: "",
                    onChange: function (k, node) {
                        if (node) {
                            roots[node.Uuid] = node;_this6.setState({ newFolderKey: Math.random() });
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
                        { fullWidth: true, floatingLabelFixed: true, floatingLabelText: "Default Access (all users)", value: "" },
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
