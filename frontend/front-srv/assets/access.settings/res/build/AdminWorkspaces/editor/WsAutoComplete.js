'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _pydioHttpRestApi = require("pydio/http/rest-api");

var WsAutoComplete = (function (_React$Component) {
    _inherits(WsAutoComplete, _React$Component);

    function WsAutoComplete(props) {
        _classCallCheck(this, WsAutoComplete);

        _get(Object.getPrototypeOf(WsAutoComplete.prototype), 'constructor', this).call(this, props);
        this.debounced = (0, _lodashDebounce2['default'])(this.loadValues.bind(this), 300);
        this.state = { searchText: props.value, value: props.value };
        console.log(this.state);
    }

    _createClass(WsAutoComplete, [{
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
        key: 'render',
        value: function render() {
            var _props = this.props;
            var onDelete = _props.onDelete;
            var skipTemplates = _props.skipTemplates;
            var label = _props.label;
            var zDepth = _props.zDepth;
            var _state = this.state;
            var nodes = _state.nodes;
            var loading = _state.loading;

            var dataSource = [];
            if (nodes) {
                (function () {
                    var categs = {};
                    nodes.forEach(function (node) {
                        if (node.MetaStore && node.MetaStore["resolution"] && node.Uuid === "cells") {
                            // Skip "Cells" Template Path
                            return;
                        } else if (_pydioUtilPath2['default'].getBasename(node.Path).startsWith(".")) {
                            // Skip hidden files
                            return;
                        }
                        var data = WsAutoComplete.renderNode(node);
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
            var depth = 0;
            if (zDepth !== undefined) {
                depth = zDepth;
            }

            return _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: depth, style: _extends({ display: 'flex', alignItems: 'baseline', margin: '10px 0 0 -8px', padding: '0 8px 10px', backgroundColor: '#fafafa' }, this.props.style) },
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
    }], [{
        key: 'renderNode',
        value: function renderNode(node) {
            var label = _react2['default'].createElement(
                'span',
                null,
                node.Path
            );
            var icon = "mdi mdi-folder";
            var categ = "folder";
            if (node.MetaStore && node.MetaStore["resolution"]) {
                icon = "mdi mdi-file-tree";
                categ = "templatePath";
                var resolutionPart = node.MetaStore["resolution"].split("\n").pop();
                label = _react2['default'].createElement(
                    'span',
                    null,
                    node.Path,
                    ' ',
                    _react2['default'].createElement(
                        'i',
                        { style: { color: '#9e9e9e' } },
                        '- Resolves to ',
                        resolutionPart
                    )
                );
            } else if (node.Type === 'LEAF') {
                icon = "mdi mdi-file";
            }
            return {
                key: node.Path,
                text: node.Path,
                node: node,
                categ: categ,
                value: _react2['default'].createElement(
                    _materialUi.MenuItem,
                    null,
                    _react2['default'].createElement(_materialUi.FontIcon, { className: icon, color: '#607d8b', style: { float: 'left', marginRight: 8 } }),
                    ' ',
                    label
                )
            };
        }
    }]);

    return WsAutoComplete;
})(_react2['default'].Component);

exports['default'] = WsAutoComplete;
module.exports = exports['default'];
