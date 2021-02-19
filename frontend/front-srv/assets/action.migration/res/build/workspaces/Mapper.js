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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Ws2Datasources = require('./Ws2Datasources');

var _Ws2Datasources2 = _interopRequireDefault(_Ws2Datasources);

var _materialUi = require('material-ui');

var _Loader = require("./Loader");

var _Loader2 = _interopRequireDefault(_Loader);

var _Ws2TemplatePaths = require("./Ws2TemplatePaths");

var _Ws2TemplatePaths2 = _interopRequireDefault(_Ws2TemplatePaths);

var _Ws2RootNodes = require("./Ws2RootNodes");

var _Ws2RootNodes2 = _interopRequireDefault(_Ws2RootNodes);

var _Pydio8Workspaces = require("./Pydio8Workspaces");

var _Pydio8Workspaces2 = _interopRequireDefault(_Pydio8Workspaces);

var _cellsSdk = require('cells-sdk');

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _PathTree = require('./PathTree');

var _PathTree2 = _interopRequireDefault(_PathTree);

var _Connect = require('./Connect');

var _Connect2 = _interopRequireDefault(_Connect);

var styles = {
    button: {
        margin: "0 10px 0"
    },
    addButton: {
        animation: "joyride-beacon-outer 1.2s infinite ease-in-out",
        color: "rgba(255, 215, 0, 1)",
        boxShadow: "1px",
        marginTop: -3
    },
    connect: {
        marginLeft: -9,
        marginRight: -5,
        zIndex: 2,
        marginTop: 30
    }
};

var WorkspaceMapper = (function (_React$Component) {
    _inherits(WorkspaceMapper, _React$Component);

    function WorkspaceMapper(props) {
        _classCallCheck(this, WorkspaceMapper);

        _get(Object.getPrototypeOf(WorkspaceMapper.prototype), 'constructor', this).call(this, props);
        var workspaces = props.workspaces;
        var cellsWorkspaces = props.cellsWorkspaces;

        // remove ones already mapped
        var filtered = workspaces.filter(function (workspace) {
            return cellsWorkspaces.filter(function (cW) {
                return cW.UUID === workspace.id;
            }).length === 0;
        });
        var mappedWorkspaces = workspaces.filter(function (workspace) {
            return cellsWorkspaces.filter(function (cW) {
                return cW.UUID === workspace.id;
            }).length > 0;
        });
        var correspondingWorkspaces = cellsWorkspaces.filter(function (ws) {
            return workspaces.filter(function (w) {
                return w.id === ws.UUID;
            }).length > 0;
        });
        this.state = {
            cellsWorkspaces: [].concat(_toConsumableArray(correspondingWorkspaces)),
            workspaces: filtered,
            mappedWorkspaces: mappedWorkspaces,
            showDatasources: true,
            showTemplatePaths: true,
            datasources: [],
            templatePaths: [],
            offset: 0,
            limit: 10
        };
        this.loader = new _Loader2['default']();
    }

    _createClass(WorkspaceMapper, [{
        key: 'T',
        value: function T(id) {
            var pydio = this.props.pydio;

            return pydio.MessageHash['migration.step.mapper.' + id] || pydio.MessageHash['migration.' + id] || id;
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.loadDatasources();
            this.loadTemplatePaths();
        }
    }, {
        key: 'loadDatasources',
        value: function loadDatasources() {
            var _this = this;

            this.loader.loadDataSources().then(function (datasources) {
                _this.setState({ datasources: datasources });
            });
        }
    }, {
        key: 'loadTemplatePaths',
        value: function loadTemplatePaths() {
            var _this2 = this;

            this.loader.loadTemplatePaths().then(function (templatePaths) {
                _this2.setState({ templatePaths: [null].concat(_toConsumableArray(templatePaths)) });
            });
        }
    }, {
        key: 'toggleRemap',
        value: function toggleRemap(check, cellsWorkspace) {
            var _state = this.state;
            var workspaces = _state.workspaces;
            var mappedWorkspaces = _state.mappedWorkspaces;

            var propsWorkspaces = this.props.workspaces;

            var newWs = undefined,
                newMapped = undefined;
            var workspace = propsWorkspaces.filter(function (ws) {
                return ws.id === cellsWorkspace.UUID;
            })[0];
            if (check) {
                newWs = workspaces.filter(function (ws) {
                    return ws.id !== cellsWorkspace.UUID;
                });
                newMapped = [].concat(_toConsumableArray(mappedWorkspaces), [workspace]);
            } else {
                newWs = [].concat(_toConsumableArray(workspaces), [workspace]);
                newMapped = mappedWorkspaces.filter(function (ws) {
                    return ws.id !== cellsWorkspace.UUID;
                });
            }
            this.setState({ workspaces: newWs, mappedWorkspaces: newMapped });
        }
    }, {
        key: 'getLinks',
        value: function getLinks(arr1, arr2, comp, color) {
            return arr1.reduce(function (res1, v1, idx1) {
                return [].concat(_toConsumableArray(res1), _toConsumableArray(arr2.reduce(function (res2, v2, idx2) {
                    var entry = comp(v1, v2);
                    if (!entry) {
                        return res2;
                    }

                    return [].concat(_toConsumableArray(res2), [{
                        left: idx1,
                        right: idx2,
                        color: color(entry)
                    }]);
                }, [])));
            }, []);
        }
    }, {
        key: 'handleSelectWorkspace',
        value: function handleSelectWorkspace(ws) {
            this.setState({
                selected: ws
            });
        }
    }, {
        key: 'handleSelectDatasource',
        value: function handleSelectDatasource(ds) {
            var selected = this.state.selected;

            var mapping = this.mapping;

            var newMapping = mapping.map(function (map) {
                if (map.workspace === selected) {
                    delete map.datasource;
                    delete map.templatePath;

                    return _extends({}, map, {
                        datasource: ds
                    });
                }

                return map;
            });

            this.setState({
                mapping: newMapping
            });
        }
    }, {
        key: 'handleSelectTemplatePath',
        value: function handleSelectTemplatePath(tp) {
            var _state2 = this.state;
            var datasources = _state2.datasources;
            var selected = _state2.selected;

            var mapping = this.mapping;

            // Retrieve datasource
            var datasourceName = getDatasource(removeComments(tp.MetaStore.resolution));

            var ds = datasources.filter(function (ds) {
                return ds.Name === datasourceName;
            })[0];

            var newMapping = mapping.map(function (map) {
                if (map.workspace === selected) {
                    delete map.datasource;
                    delete map.templatePath;

                    return _extends({}, map, {
                        datasource: ds,
                        templatePath: tp
                    });
                }

                return map;
            });

            this.setState({
                mapping: newMapping,
                selected: null
            });
        }
    }, {
        key: 'handleSelectRootNode',
        value: function handleSelectRootNode(ws, node) {
            var mapping = this.mapping;

            var newMapping = mapping.map(function (map) {
                if (map.workspace === ws) {
                    return _extends({}, map, {
                        rootNode: node,
                        valid: true
                    });
                }
                return map;
            });

            this.setState({
                mapping: newMapping
            });
        }
    }, {
        key: 'handleInvalidRootNode',
        value: function handleInvalidRootNode(ws) {
            var mapping = this.mapping;

            var newMapping = mapping.map(function (map) {
                if (map.workspace === ws) {
                    return _extends({}, map, {
                        valid: false
                    });
                }
                return map;
            });

            this.setState({
                mapping: newMapping
            });
        }
    }, {
        key: 'handleShowPath',
        value: function handleShowPath(ws) {
            this.setState({
                highlight: ws
            });
        }
    }, {
        key: 'handleHidePath',
        value: function handleHidePath() {
            var state = this.state;
            delete state.highlight;
            this.setState(state);
        }
    }, {
        key: 'handleShowDatasources',
        value: function handleShowDatasources() {
            this.setState({
                showDatasources: true
            });
        }
    }, {
        key: 'handleHideDatasources',
        value: function handleHideDatasources() {
            this.setState({
                showDatasources: false
            });
        }
    }, {
        key: 'handleShowTemplatePaths',
        value: function handleShowTemplatePaths() {
            this.setState({
                showTemplatePaths: true
            });
        }
    }, {
        key: 'handleHideTemplatePaths',
        value: function handleHideTemplatePaths() {
            this.setState({
                showTemplatePaths: false
            });
        }
    }, {
        key: 'handleCreateDatasource',
        value: function handleCreateDatasource() {
            var _this3 = this;

            var selected = this.state.selected;
            var _props = this.props;
            var pydio = _props.pydio;
            var openRightPane = _props.openRightPane;
            var closeRightPane = _props.closeRightPane;
            var display = selected.display;
            var accessType = selected.accessType;
            var parameters = selected.parameters;

            var presetDataSource = undefined;

            if (accessType === 's3') {
                presetDataSource = new _cellsSdk.ObjectDataSource();
                presetDataSource.Name = _pydioUtilLang2['default'].computeStringSlug(display).replace(/-/g, "");
                presetDataSource.StorageType = 'S3';
                presetDataSource.ApiKey = parameters['API_KEY'];
                presetDataSource.ApiSecret = parameters['SECRET_KEY'];
                presetDataSource.ObjectsBucket = parameters['CONTAINER'];
                presetDataSource.StorageConfiguration = {};
                if (parameters['STORAGE_URL']) {
                    presetDataSource.StorageConfiguration = { customEndpoint: parameters['STORAGE_URL'] };
                }
                if (parameters['PATH']) {
                    presetDataSource.ObjectsBaseFolder = parameters['PATH'];
                }
            } else if (accessType === 'fs') {
                presetDataSource = new _cellsSdk.ObjectDataSource();

                var path = parameters['PATH'] || "";

                if (selected) {
                    path = this.mapping.filter(function (_ref) {
                        var workspace = _ref.workspace;
                        return workspace === selected;
                    })[0].datasourcePath;
                }

                presetDataSource.Name = _pydioUtilLang2['default'].computeStringSlug(path.substr(1)).replace(/-/g, "");
                presetDataSource.StorageConfiguration = {};
                presetDataSource.StorageConfiguration.folder = path;
            }
            openRightPane({
                COMPONENT: AdminWorkspaces.DataSourceEditor,
                PROPS: {
                    ref: "editor",
                    pydio: pydio,
                    create: true,
                    dataSource: presetDataSource,
                    storageTypes: [],
                    closeEditor: function closeEditor() {
                        closeRightPane();
                    },
                    reloadList: function reloadList() {
                        _this3.loadDatasources();
                    }
                }
            });
        }
    }, {
        key: 'handleCreateTemplatePath',
        value: function handleCreateTemplatePath() {
            var _this4 = this;

            var containerEl = ReactDOM.findDOMNode(this.container);
            var el = ReactDOM.findDOMNode(this.templatePaths);

            var containerPosition = containerEl.getBoundingClientRect();
            var position = el.getBoundingClientRect();

            var selected = this.state.selected;

            var selection = this.mapping.filter(function (_ref2) {
                var workspace = _ref2.workspace;
                return selected === workspace;
            })[0];

            var _AdminWorkspaces = AdminWorkspaces;
            var TemplatePathEditor = _AdminWorkspaces.TemplatePathEditor;
            var TemplatePath = _AdminWorkspaces.TemplatePath;

            var newTpl = new TemplatePath();

            var path = " + \"" + selection.rootNodePath + "\";";
            // Special case for AJXP_USER
            path = path.replace(/AJXP_USER/g, "\" + User.Name + \"");
            // Stripping value at the end
            path = path.replace(/ \+ "";$/, ";");

            newTpl.setName(selected.slug);
            newTpl.setValue("Path = DataSources." + selection.datasource.Name + path);

            this.setState({
                dialogComponent: _react2['default'].createElement(TemplatePathEditor, {
                    dataSources: this.state.datasources,
                    node: newTpl,
                    oneLiner: true,
                    onSave: function () {
                        _this4.loadTemplatePaths();
                        _this4.setState({ dialogComponent: null });
                    },
                    onClose: function () {
                        return _this4.setState({ dialogComponent: null });
                    } }),
                dialogStyle: {
                    position: 'absolute',
                    zIndex: 2,
                    background: 'white',
                    top: position.y - containerPosition.y + position.height,
                    left: position.x + containerEl.scrollLeft - containerPosition.x,
                    width: position.w,
                    height: 48
                }
            });
        }
    }, {
        key: 'handleNext',
        value: function handleNext() {
            var onMapped = this.props.onMapped;
            var mappedWorkspaces = this.state.mappedWorkspaces;

            var mapping = this.mapping;
            var ret = { mapping: {}, create: {}, existing: {} };

            mappedWorkspaces.forEach(function (ws) {
                ret.mapping[ws.id] = ws.id;
                ret.existing[ws.id] = ws;
            });

            mapping.filter(function (_ref3) {
                var rootNode = _ref3.rootNode;
                return rootNode;
            }).map(function (_ref4) {
                var workspace = _ref4.workspace;
                var rootNode = _ref4.rootNode;

                var ws = new AdminWorkspaces.Workspace();
                var model = ws.getModel();
                // Map old properties to new object
                model.UUID = workspace.id;
                model.Label = workspace.display;
                model.Description = workspace.display;
                model.Slug = workspace.slug;
                model.Attributes['DEFAULT_RIGHTS'] = '';
                if (workspace.parameters['DEFAULT_RIGHTS']) {
                    //this should be handled via roles ACLs instead
                    //model.Attributes['DEFAULT_RIGHTS'] = workspace.parameters['DEFAULT_RIGHTS'];
                }
                if (workspace.features && workspace.features['meta.syncable'] && workspace.features['meta.syncable']['REPO_SYNCABLE'] === 'true') {
                    model.Attributes['ALLOW_SYNC'] = "true";
                }

                model.RootNodes = {}; // Nodes must be indexed by Uuid, not Path
                Object.keys(rootNode).forEach(function (rootKey) {
                    var root = rootNode[rootKey];
                    model.RootNodes[root.Uuid] = root;
                });

                // ws.save();

                ret.mapping[workspace.id] = model.UUID;
                ret.create[workspace.id] = ws;
            });

            onMapped(ret);
        }
    }, {
        key: 'isInvalid',
        value: function isInvalid(ws) {
            return this.mapping.filter(function (_ref5) {
                var workspace = _ref5.workspace;
                var valid = _ref5.valid;
                return workspace === ws && valid === false;
            }).length > 0;
        }
    }, {
        key: 'isValid',
        value: function isValid(ws) {
            return this.mapping.filter(function (_ref6) {
                var workspace = _ref6.workspace;
                var valid = _ref6.valid;
                return workspace === ws && valid === true;
            }).length > 0;
        }
    }, {
        key: 'isDatasourceSelectable',
        value: function isDatasourceSelectable(ds) {
            var selected = this.state.selected;

            return selected && selected.accessType === (typeof ds.StorageType === 'string' && ds.StorageType.toLowerCase() || "fs");
        }
    }, {
        key: 'isDatasourceHighlighted',
        value: function isDatasourceHighlighted(ds) {
            var highlight = this.state.highlight;

            return this.mapping.filter(function (_ref7) {
                var workspace = _ref7.workspace;
                var datasource = _ref7.datasource;
                return highlight === workspace && datasource === ds;
            }).length > 0;
        }
    }, {
        key: 'isTemplatePathSelectable',
        value: function isTemplatePathSelectable(tp) {
            var selected = this.state.selected;

            return selected && tp;
        }
    }, {
        key: 'isTemplatePathHighlighted',
        value: function isTemplatePathHighlighted(tp) {
            var highlight = this.state.highlight;

            return this.mapping.filter(function (_ref8) {
                var workspace = _ref8.workspace;
                var datasource = _ref8.datasource;
                var templatePath = _ref8.templatePath;
                return highlight === workspace && datasource && datasource.Name && templatePath === tp;
            }).length > 0;
        }
    }, {
        key: 'paginator',
        value: function paginator() {
            var _this5 = this;

            var _state3 = this.state;
            var workspaces = _state3.workspaces;
            var offset = _state3.offset;
            var limit = _state3.limit;

            if (workspaces.length <= limit) {
                return null;
            }
            var next = undefined,
                prev = undefined;
            if (workspaces.length - offset > limit) {
                next = offset + limit;
            }
            if (offset > 0) {
                prev = offset - limit;
            }
            return _react2['default'].createElement(
                'div',
                { style: { display: 'flex', justifyContent: 'center', position: 'absolute', top: -13, left: 0, right: 0 } },
                _react2['default'].createElement(_materialUi.FlatButton, { primary: true, icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-chevron-left" }), label: this.T('next10') + limit, disabled: prev === undefined, onTouchTap: function () {
                        _this5.setState({ offset: prev });
                    } }),
                _react2['default'].createElement(_materialUi.FlatButton, { primary: true, icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-chevron-right" }), label: this.T('prev10') + limit, labelPosition: "before", disabled: next === undefined, onTouchTap: function () {
                        _this5.setState({ offset: next });
                    } })
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _this6 = this;

            var _props2 = this.props;
            var loading = _props2.loading;
            var error = _props2.error;
            var progress = _props2.progress;
            var onBack = _props2.onBack;
            var _state4 = this.state;
            var selected = _state4.selected;
            var workspaces = _state4.workspaces;
            var datasources = _state4.datasources;
            var templatePaths = _state4.templatePaths;
            var dialogComponent = _state4.dialogComponent;
            var dialogStyle = _state4.dialogStyle;
            var mappedWorkspaces = _state4.mappedWorkspaces;
            var cellsWorkspaces = _state4.cellsWorkspaces;
            var offset = _state4.offset;
            var limit = _state4.limit;
            var _state5 = this.state;
            var showDatasources = _state5.showDatasources;
            var showTemplatePaths = _state5.showTemplatePaths;

            var mapping = this.mapping;

            var paths = mapping.map(function (_ref9) {
                var workspace = _ref9.workspace;
                var datasource = _ref9.datasource;
                var templatePath = _ref9.templatePath;
                var rootNodePath = _ref9.rootNodePath;

                if (templatePath) {
                    return templatePath.Path;
                }

                if (datasource && datasource.Name) {
                    return datasource.Name + rootNodePath;
                }
            });

            var count = Math.min(workspaces.length - offset, limit);

            return _react2['default'].createElement(
                'div',
                { ref: function (el) {
                        return _this6.container = el;
                    }, style: { position: 'relative', overflowX: 'scroll' } },
                cellsWorkspaces.length > 0 && _react2['default'].createElement(
                    'div',
                    { style: { padding: 16 } },
                    this.T('already'),
                    ' :',
                    cellsWorkspaces.map(function (ws) {
                        var label = ws.Label + " (" + ws.UUID + ")";
                        var mapped = mappedWorkspaces.filter(function (w) {
                            return ws.UUID === w.id;
                        }).length;
                        return _react2['default'].createElement(_materialUi.Checkbox, { label: label, checked: mapped, onCheck: function (e, v) {
                                _this6.toggleRemap(v, ws);
                            } });
                    })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: 16 } },
                    !loading && _react2['default'].createElement(
                        'div',
                        null,
                        this.T('wsnumber').replace('%s', workspaces.length)
                    ),
                    loading && _react2['default'].createElement(
                        'div',
                        null,
                        this.T('loading'),
                        progress && _react2['default'].createElement(_materialUi.LinearProgress, { mode: "determinate", max: progress.max, value: progress.value })
                    ),
                    error && _react2['default'].createElement(
                        'div',
                        { style: { color: 'red' } },
                        this.T('loading.error').replace('%s', error)
                    )
                ),
                dialogComponent && _react2['default'].createElement(
                    _materialUi.Paper,
                    { style: dialogStyle },
                    dialogComponent
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { display: "flex", marginLeft: 16, padding: 16, backgroundColor: '#fafafa', overflowX: 'scroll' }, onMouseLeave: function () {
                            return _this6.handleHidePath();
                        } },
                    _react2['default'].createElement(_materialUi.Divider, null),
                    _react2['default'].createElement(
                        _materialUi.Card,
                        null,
                        _react2['default'].createElement(_materialUi.CardHeader, {
                            title: this.T('p8.title'),
                            openIcon: _react2['default'].createElement(
                                _materialUi.IconMenu,
                                { iconButtonElement: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-dots-vertical" }) },
                                _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.T('p8.ds.show'), onTouchTap: function () {
                                        return _this6.handleShowDatasources();
                                    } }),
                                _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.T('p8.tpl.show'), onTouchTap: function () {
                                        return _this6.handleShowTemplatePaths();
                                    } })
                            ),
                            closeIcon: _react2['default'].createElement(
                                _materialUi.IconMenu,
                                { iconButtonElement: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-dots-vertical" }) },
                                _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.T('p8.ds.show'), onTouchTap: function () {
                                        return _this6.handleShowDatasources();
                                    } }),
                                _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.T('p8.tpl.show'), onTouchTap: function () {
                                        return _this6.handleShowTemplatePaths();
                                    } })
                            ),
                            showExpandableButton: true
                        }),
                        _react2['default'].createElement(
                            _materialUi.CardText,
                            { style: { position: 'relative', minWidth: 400 } },
                            _react2['default'].createElement(_Pydio8Workspaces2['default'], {
                                workspaces: workspaces.slice(offset, offset + count),
                                selected: selected,
                                isValid: function (ws) {
                                    return _this6.isValid(ws);
                                },
                                isInvalid: function (ws) {
                                    return _this6.isInvalid(ws);
                                },
                                onHover: function (ws) {
                                    return _this6.handleShowPath(ws);
                                },
                                onSelect: function (ws) {
                                    return _this6.handleSelectWorkspace(ws);
                                }
                            }),
                            this.paginator()
                        )
                    ),
                    showDatasources && _react2['default'].createElement(_Connect2['default'], { style: styles.connect, leftNumber: count, rightNumber: datasources.length, links: this.linkWorkspacesToDatasources }),
                    showDatasources && _react2['default'].createElement(
                        _materialUi.Card,
                        null,
                        _react2['default'].createElement(_materialUi.CardHeader, {
                            title: this.T('cells.title'),
                            closeIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-eye-off", onTouchTap: function () {
                                    return _this6.handleHideDatasources();
                                } }),
                            showExpandableButton: true
                        }),
                        _react2['default'].createElement(
                            _materialUi.CardText,
                            null,
                            _react2['default'].createElement(_Ws2Datasources2['default'], {
                                datasources: datasources,
                                selectable: function (ds) {
                                    return _this6.isDatasourceSelectable(ds);
                                },
                                highlighted: function (ds) {
                                    return _this6.isDatasourceHighlighted(ds);
                                },
                                onSelect: function (ds) {
                                    return _this6.handleSelectDatasource(ds);
                                }
                            })
                        ),
                        _react2['default'].createElement(
                            _materialUi.CardActions,
                            null,
                            selected && _react2['default'].createElement(_materialUi.RaisedButton, {
                                label: this.T('createds'),
                                style: styles.button,
                                icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-plus-circle-outline", style: styles.addButton }),
                                onTouchTap: function () {
                                    return _this6.handleCreateDatasource();
                                }
                            })
                        )
                    ),
                    showTemplatePaths && (showDatasources && _react2['default'].createElement(_Connect2['default'], { style: styles.connect, leftNumber: datasources.length, rightNumber: templatePaths.length, links: this.linkDatasourcesToTemplatePaths }) || _react2['default'].createElement(_Connect2['default'], { style: styles.connect, leftNumber: count, rightNumber: templatePaths.length, links: this.linkWorkspacesToTemplatePaths })),
                    showTemplatePaths && _react2['default'].createElement(
                        _materialUi.Card,
                        { style: { position: "relative" } },
                        _react2['default'].createElement(_materialUi.CardHeader, {
                            title: this.T('tpath.title'),
                            closeIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-eye-off", onTouchTap: function () {
                                    return _this6.handleHideTemplatePaths();
                                } }),
                            showExpandableButton: true
                        }),
                        _react2['default'].createElement(
                            _materialUi.CardText,
                            null,
                            _react2['default'].createElement(_Ws2TemplatePaths2['default'], {
                                style: { flex: 1 },
                                templatePaths: templatePaths,
                                selectable: function (tp) {
                                    return _this6.isTemplatePathSelectable(tp);
                                },
                                highlighted: function (tp) {
                                    return _this6.isTemplatePathHighlighted(tp);
                                },
                                onSelect: function (tp) {
                                    return _this6.handleSelectTemplatePath(tp);
                                }
                            })
                        ),
                        _react2['default'].createElement(
                            _materialUi.CardActions,
                            null,
                            selected && _react2['default'].createElement(_materialUi.RaisedButton, {
                                label: this.T('tpath.create'),
                                ref: function (el) {
                                    return _this6.templatePaths = el;
                                },
                                style: styles.button,
                                icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-plus-circle-outline", style: styles.addButton }),
                                onTouchTap: function () {
                                    return _this6.handleCreateTemplatePath();
                                }
                            })
                        )
                    ),
                    showTemplatePaths && _react2['default'].createElement(_Connect2['default'], { style: styles.connect, leftNumber: templatePaths.length, rightNumber: count, links: this.linkTemplatePathsToWorkspaces }),
                    !showTemplatePaths && showDatasources && _react2['default'].createElement(_Connect2['default'], { style: styles.connect, leftNumber: datasources.length, rightNumber: count, links: this.linkDatasourcesToWorkspaces }),
                    !showTemplatePaths && !showDatasources && _react2['default'].createElement(_Connect2['default'], { style: styles.connect, leftNumber: count, rightNumber: count, links: this.linkWorkspacesToWorkspaces }),
                    _react2['default'].createElement(
                        _materialUi.Card,
                        { style: { marginRight: 16 } },
                        _react2['default'].createElement(_materialUi.CardHeader, {
                            title: this.T('nodes.title')
                        }),
                        _react2['default'].createElement(
                            _materialUi.CardText,
                            null,
                            _react2['default'].createElement(_Ws2RootNodes2['default'], {
                                pydio: _pydio2['default'].getInstance(),
                                style: { flex: 1 },
                                workspaces: workspaces.slice(offset, offset + count),
                                paths: paths.slice(offset, offset + count),
                                onSelect: function (ws, node) {
                                    return _this6.handleSelectRootNode(ws, node);
                                },
                                onError: function (ws) {
                                    return _this6.handleInvalidRootNode(ws);
                                }
                            })
                        )
                    ),
                    _react2['default'].createElement('div', { style: { minWidth: 8 } })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: "20px 16px 2px" } },
                    _react2['default'].createElement(_materialUi.RaisedButton, { label: this.T('back'), onClick: function () {
                            return onBack();
                        } }),
                    '  ',
                    _react2['default'].createElement(_materialUi.RaisedButton, { label: this.T('next'), primary: true, onTouchTap: function () {
                            _this6.handleNext();
                        } })
                )
            );
        }
    }, {
        key: 'mapping',
        get: function get() {
            var _state6 = this.state;
            var mapping = _state6.mapping;
            var datasources = _state6.datasources;
            var templatePaths = _state6.templatePaths;
            var workspaces = _state6.workspaces;

            if (mapping) {
                return mapping;
            }

            var tree = new _PathTree2['default'](workspaces.map(function (workspace) {
                return _Pydio8Workspaces2['default'].extractPath(workspace);
            }), '/');

            // First we start the mapping by loading the workspaces
            var initialMapping = workspaces.map(function (workspace) {
                return { workspace: workspace };
            });

            // First we map the datasources
            initialMapping = initialMapping.map(function (map, idx) {
                var root = tree.getNewRoots(function (root) {
                    return root.ws === idx;
                })[0];

                var parentDs = root.parentDs;

                // let datasourcePath;

                // // Check if we have a perfect match for a datasource
                // const cellsDataPath = // TODO need to get this path from the loaded datasources
                // let datasource = datasources.filter((ds) => trimURL(template.replace(/AJXP_DATA_PATH/g, cellsDataPath)) === trimURL(Ws2Datasources.extractPath(ds)))[0]

                // if (!datasource) {
                //     // Check if we have a parent match for a datasource
                //     datasource = datasources.filter((ds) => trimURL(parentDs.replace(/AJXP_DATA_PATH/g, cellsDataPath)) === trimURL(Ws2Datasources.extractPath(ds)))[0]
                //     datasourcePath = parentDs
                // } else {
                //     datasourcePath = template
                // }

                return _extends({}, map, {
                    datasourcePath: parentDs,
                    datasource: {}
                });
            });

            // Then we map the potential template paths
            initialMapping = initialMapping.map(function (map, idx) {
                var datasource = map.datasource;

                var root = tree.getNewRoots(function (root) {
                    return root.template && root.ws === idx;
                })[0];

                var parentDs = root.parentDs;
                var template = root.template;

                var value = "Path = DataSources." + datasource.Name + " + \"" + template.substring(parentDs.length) + "\";";
                // Special case for AJXP_USER
                value = value.replace(/AJXP_USER/g, "\" + User.Name + \"");
                // Stripping value at the end
                value = value.replace(/ \+ "";$/, ";");

                // Trying to find if an existing template already is there
                var templatePath = templatePaths.filter(function (tp) {
                    return tp && removeComments(tp.MetaStore.resolution) === value;
                })[0];

                return _extends({}, map, {
                    templatePath: templatePath || null,
                    rootNodePath: template.substring(parentDs.length)
                });
            });

            return initialMapping;
        }
    }, {
        key: 'linkWorkspacesToDatasources',
        get: function get() {
            var _state7 = this.state;
            var datasources = _state7.datasources;
            var highlight = _state7.highlight;
            var selected = _state7.selected;
            var workspaces = _state7.workspaces;
            var offset = _state7.offset;
            var limit = _state7.limit;

            var mapping = this.mapping;
            var count = Math.min(workspaces.length - offset, limit);
            var wss = workspaces.slice(offset, offset + count);

            return this.getLinks(wss, datasources, function (ws, ds) {
                return mapping.filter(function (_ref10) {
                    var workspace = _ref10.workspace;
                    var datasource = _ref10.datasource;
                    return workspace == ws && datasource == ds;
                })[0];
            }, function (entry) {
                return entry.workspace === selected ? "#7C0A02" : entry.workspace === highlight ? "#000000" : "#cccccc";
            });
        }
    }, {
        key: 'linkWorkspacesToTemplatePaths',
        get: function get() {
            var _state8 = this.state;
            var templatePaths = _state8.templatePaths;
            var highlight = _state8.highlight;
            var selected = _state8.selected;
            var workspaces = _state8.workspaces;
            var offset = _state8.offset;
            var limit = _state8.limit;

            var mapping = this.mapping;
            var count = Math.min(workspaces.length - offset, limit);
            var wss = workspaces.slice(offset, offset + count);

            return this.getLinks(wss, templatePaths, function (ws, tp) {
                return mapping.filter(function (_ref11) {
                    var workspace = _ref11.workspace;
                    var templatePath = _ref11.templatePath;
                    var datasource = _ref11.datasource;
                    return workspace == ws && templatePath == tp && datasource && datasource.Name;
                })[0];
            }, function (entry) {
                return entry.workspace === selected ? "#7C0A02" : entry.workspace === highlight ? "#000000" : "#cccccc";
            });
        }
    }, {
        key: 'linkDatasourcesToTemplatePaths',
        get: function get() {
            var _state9 = this.state;
            var datasources = _state9.datasources;
            var templatePaths = _state9.templatePaths;
            var highlight = _state9.highlight;
            var selected = _state9.selected;

            var mapping = this.mapping;

            return this.getLinks(datasources, templatePaths, function (ds, tp) {
                return mapping.filter(function (_ref12) {
                    var datasource = _ref12.datasource;
                    return datasource == ds;
                }).filter(function (_ref13) {
                    var templatePath = _ref13.templatePath;
                    return templatePath == tp;
                })[0];
            }, function (entry) {
                return entry.workspace === selected ? "#7C0A02" : entry.workspace === highlight ? "#000000" : "#cccccc";
            });
        }
    }, {
        key: 'linkDatasourcesToWorkspaces',
        get: function get() {
            var _state10 = this.state;
            var datasources = _state10.datasources;
            var highlight = _state10.highlight;
            var selected = _state10.selected;
            var workspaces = _state10.workspaces;
            var offset = _state10.offset;
            var limit = _state10.limit;

            var mapping = this.mapping;
            var count = Math.min(workspaces.length - offset, limit);
            var wss = workspaces.slice(offset, offset + count);

            return this.getLinks(datasources, wss, function (ds, ws) {
                return mapping.filter(function (_ref14) {
                    var workspace = _ref14.workspace;
                    var datasource = _ref14.datasource;
                    return workspace == ws && datasource == ds;
                })[0];
            }, function (entry) {
                return entry.workspace === selected ? "#7C0A02" : entry.workspace === highlight ? "#000000" : "#cccccc";
            });
        }
    }, {
        key: 'linkTemplatePathsToWorkspaces',
        get: function get() {
            var _state11 = this.state;
            var templatePaths = _state11.templatePaths;
            var highlight = _state11.highlight;
            var selected = _state11.selected;
            var workspaces = _state11.workspaces;
            var offset = _state11.offset;
            var limit = _state11.limit;

            var mapping = this.mapping;
            var count = Math.min(workspaces.length - offset, limit);
            var wss = workspaces.slice(offset, offset + count);

            return this.getLinks(templatePaths, wss, function (tp, ws) {
                return mapping.filter(function (_ref15) {
                    var templatePath = _ref15.templatePath;
                    return templatePath == tp;
                }).filter(function (_ref16) {
                    var workspace = _ref16.workspace;
                    return workspace == ws;
                }).filter(function (_ref17) {
                    var datasource = _ref17.datasource;
                    return datasource.Name;
                })[0];
            }, function (entry) {
                return entry.workspace === selected ? "#7C0A02" : entry.workspace === highlight ? "#000000" : "#cccccc";
            });
        }
    }, {
        key: 'linkWorkspacesToWorkspaces',
        get: function get() {
            var _state12 = this.state;
            var datasources = _state12.datasources;
            var highlight = _state12.highlight;
            var selected = _state12.selected;
            var workspaces = _state12.workspaces;
            var offset = _state12.offset;
            var limit = _state12.limit;

            var mapping = this.mapping;
            var count = Math.min(workspaces.length - offset, limit);
            var wss = workspaces.slice(offset, offset + count);

            return this.getLinks(wss, wss, function (ws1, ws2) {
                return mapping.filter(function (_ref18) {
                    var workspace = _ref18.workspace;
                    return workspace == ws1 && workspace == ws2;
                })[0];
            }, function (entry) {
                return entry.workspace === selected ? "#7C0A02" : entry.workspace === highlight ? "#000000" : "#cccccc";
            });
        }
    }]);

    return WorkspaceMapper;
})(_react2['default'].Component);

exports['default'] = WorkspaceMapper;

var removeComments = function removeComments(str) {
    return str.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, "").replace(/(\r\n|\n|\r)/gm, "");
};

var getDatasource = function getDatasource(str) {
    return str.replace(/^Path = DataSources\.([^ ]*) \+ .*$/, "$1");
};

var trimURL = function trimURL(str) {
    return str.replace(/^\//, "").replace(/\/$/, "");
};
module.exports = exports['default'];
