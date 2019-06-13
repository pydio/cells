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
        var _this = this;

        _classCallCheck(this, WsAutoComplete);

        _get(Object.getPrototypeOf(WsAutoComplete.prototype), 'constructor', this).call(this, props);

        var _props$value = props.value;
        var value = _props$value === undefined ? '' : _props$value;

        this.debounced = (0, _lodashDebounce2['default'])(function () {
            var value = _this.state.value;

            _this.loadValues(value);
        }, 300);

        this.state = {
            nodes: [],
            value: value
        };
    }

    _createClass(WsAutoComplete, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var validateOnLoad = this.props.validateOnLoad;
            var value = this.state.value;

            this.loadValues(value, function () {
                var _state = _this2.state;
                var nodes = _state.nodes;
                var value = _state.value;

                // Checking if we have a collection and load deeper values if it's the case
                var node = nodes.filter(function (node) {
                    return node.Path === value && (!node.Type || node.Type == "COLLECTION" && !node.MetaStore && !node.MetaStore.resolution);
                }).map(function (node) {

                    _this2.loadValues(value + "/");
                });

                if (validateOnLoad) {
                    _this2.handleNewRequest(value);
                }
            });
        }
    }, {
        key: 'handleUpdateInput',
        value: function handleUpdateInput(input) {
            this.debounced();
            this.setState({ value: input });
        }
    }, {
        key: 'handleNewRequest',
        value: function handleNewRequest(value) {
            var nodes = this.state.nodes;
            var _props = this.props;
            var _props$onChange = _props.onChange;
            var onChange = _props$onChange === undefined ? function () {} : _props$onChange;
            var _props$onDelete = _props.onDelete;
            var onDelete = _props$onDelete === undefined ? function () {} : _props$onDelete;
            var _props$onError = _props.onError;
            var onError = _props$onError === undefined ? function () {} : _props$onError;

            var key = undefined;
            var node = undefined;

            if (typeof value === 'string') {
                if (value === '') {
                    onDelete();
                    return;
                }

                key = value;

                // First we try to find an exact match
                node = nodes.filter(function (node) {
                    return node.Path === value;
                })[0];

                // Then we try to retrieve the first node that starts with what we are looking at
                if (!node) {
                    node = nodes.filter(function (node) {
                        return node.Path.indexOf(value) === 0;
                    })[0];
                }
            } else if (typeof value === 'object') {
                key = value.key;
                node = value.node;
            }

            if (!node) {
                return onError();
            }

            this.setState({ value: key });

            onChange(key, node);
        }
    }, {
        key: 'loadValues',
        value: function loadValues(value) {
            var _this3 = this;

            var cb = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

            var last = value.lastIndexOf('/');
            var basePath = value.substr(0, last);

            if (this.lastSearch !== null && this.lastSearch === basePath) {
                return;
            }

            this.lastSearch = basePath;

            this.setState({ loading: true });

            var api = new _pydioHttpRestApi.AdminTreeServiceApi(PydioApi.getRestClient());
            var listRequest = new _pydioHttpRestApi.TreeListNodesRequest();
            var treeNode = new _pydioHttpRestApi.TreeNode();

            treeNode.Path = basePath + "/";
            listRequest.Node = treeNode;

            api.listAdminTree(listRequest).then(function (nodesColl) {
                _this3.setState({ nodes: nodesColl.Children || [], loading: false }, function () {
                    return cb();
                });
            })['catch'](function () {
                _this3.setState({ loading: false }, function () {
                    return cb();
                });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var _state2 = this.state;
            var value = _state2.value;
            var nodes = _state2.nodes;
            var loading = _state2.loading;
            var _props2 = this.props;
            var pydio = _props2.pydio;
            var onDelete = _props2.onDelete;
            var skipTemplates = _props2.skipTemplates;
            var label = _props2.label;
            var _props2$zDepth = _props2.zDepth;
            var zDepth = _props2$zDepth === undefined ? 0 : _props2$zDepth;

            var m = function m(id) {
                return pydio.MessageHash['ajxp_admin.' + id] || id;
            };

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
                        var data = WsAutoComplete.renderNode(node, m);
                        if (!categs[data.categ]) {
                            categs[data.categ] = [];
                        }

                        categs[data.categ].push(data);
                    });

                    if (Object.keys(categs).length > 1) {
                        dataSource.push({ key: "h1", text: '', value: _react2['default'].createElement(_materialUi.MenuItem, { primaryText: m('ws.complete.datasources'), style: { fontSize: 13, fontWeight: 500 }, disabled: true }) });
                        var dValues = categs[Object.keys(categs)[0]];
                        dValues.sort(LangUtils.arraySorter("text"));
                        dataSource.push.apply(dataSource, _toConsumableArray(dValues));
                        if (!skipTemplates) {
                            dataSource.push({ key: "h2", text: '', value: _react2['default'].createElement(_materialUi.MenuItem, { primaryText: m('ws.complete.templates'), style: { fontSize: 13, fontWeight: 500 }, disabled: true }) });
                            var tValues = categs[Object.keys(categs)[1]];
                            tValues.sort(LangUtils.arraySorter("text"));
                            dataSource.push.apply(dataSource, _toConsumableArray(tValues));
                        }
                    } else if (Object.keys(categs).length === 1) {
                        dataSource.push.apply(dataSource, _toConsumableArray(categs[Object.keys(categs)[0]]));
                    }
                })();
            }

            return _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: zDepth, style: _extends({ display: 'flex', alignItems: 'baseline', margin: '10px 0 0 -8px', padding: '0 8px 10px', backgroundColor: '#fafafa' }, this.props.style) },
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
                        searchText: value,
                        onUpdateInput: function (value) {
                            return _this4.handleUpdateInput(value);
                        },
                        onNewRequest: function (value) {
                            return _this4.handleNewRequest(value);
                        },
                        onClose: function () {
                            return _this4.handleNewRequest(value);
                        },
                        dataSource: dataSource,
                        floatingLabelText: label || m('ws.complete.label'),
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
        value: function renderNode(node, m) {
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
                        '- ',
                        m('ws.complete.resolves'),
                        ' ',
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
