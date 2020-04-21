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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _modelVirtualNode = require('../model/VirtualNode');

var _modelVirtualNode2 = _interopRequireDefault(_modelVirtualNode);

var _modelDataSource = require('../model/DataSource');

var _modelDataSource2 = _interopRequireDefault(_modelDataSource);

var _virtualNodeCard = require('../virtual/NodeCard');

var _virtualNodeCard2 = _interopRequireDefault(_virtualNodeCard);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('components');

var MaterialTable = _Pydio$requireLib2.MaterialTable;

var VirtualNodes = (function (_React$Component) {
    _inherits(VirtualNodes, _React$Component);

    function VirtualNodes(props) {
        var _this = this;

        _classCallCheck(this, VirtualNodes);

        _get(Object.getPrototypeOf(VirtualNodes.prototype), 'constructor', this).call(this, props);
        this.state = { nodesLoaded: false, nodes: [], dataSourcesLoaded: false, dataSources: [] };
        _modelVirtualNode2['default'].loadNodes(function (result) {
            _this.setState({ nodes: result, nodesLoaded: true });
        });
        _modelDataSource2['default'].loadDatasources().then(function (result) {
            _this.setState({ dataSources: result.DataSources, dataSourcesLoaded: true });
        });
    }

    _createClass(VirtualNodes, [{
        key: 'reload',
        value: function reload() {
            var _this2 = this;

            this.setState({ nodesLoaded: false });
            _modelVirtualNode2['default'].loadNodes(function (result) {
                _this2.setState({ nodes: result, nodesLoaded: true });
            });
        }
    }, {
        key: 'createNode',
        value: function createNode() {
            this.handleRequestClose();
            var newNode = new _modelVirtualNode2['default']();
            newNode.setName(this.state.newName);
            var nodes = this.state.nodes;

            this.setState({ nodes: [].concat(_toConsumableArray(nodes), [newNode]) });
        }
    }, {
        key: 'handleTouchTap',
        value: function handleTouchTap(event) {
            var _this3 = this;

            // This prevents ghost click.
            event.preventDefault();
            this.setState({
                newName: '',
                open: true,
                anchorEl: event.currentTarget
            }, function () {
                setTimeout(function () {
                    if (_this3.refs['newNode']) _this3.refs['newNode'].focus();
                }, 300);
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
        key: 'render',
        value: function render() {
            var _this4 = this;

            var _props = this.props;
            var readonly = _props.readonly;
            var pydio = _props.pydio;
            var muiTheme = _props.muiTheme;
            var accessByName = _props.accessByName;
            var _state = this.state;
            var nodes = _state.nodes;
            var dataSources = _state.dataSources;
            var nodesLoaded = _state.nodesLoaded;
            var dataSourcesLoaded = _state.dataSourcesLoaded;
            var selectedNode = _state.selectedNode;

            var m = function m(id) {
                return pydio.MessageHash['ajxp_admin.virtual.' + id] || id;
            };
            var adminStyles = AdminComponents.AdminStyles(muiTheme.palette);

            var vNodes = nodes.map(function (node) {
                if (node.getName() === selectedNode) {
                    return {
                        node: node,
                        expandedRow: _react2['default'].createElement(_virtualNodeCard2['default'], {
                            pydio: pydio,
                            dataSources: dataSources,
                            node: node,
                            reloadList: _this4.reload.bind(_this4),
                            readonly: readonly || !accessByName('Create'),
                            adminStyles: adminStyles,
                            onSave: _this4.reload.bind(_this4)
                        })
                    };
                } else {
                    return { node: node };
                }
            });

            var headerActions = [];
            if (!readonly && accessByName('Create')) {
                headerActions.push(_react2['default'].createElement(_materialUi.FlatButton, _extends({ primary: true, label: m('create'), onTouchTap: this.handleTouchTap.bind(this) }, adminStyles.props.header.flatButton)));
            }

            var columns = [{ name: 'id', label: m('col.id'), style: { width: '25%', fontSize: 15 }, headerStyle: { width: '25%' }, renderCell: function renderCell(row) {
                    return row.node.getName();
                }, sorter: { type: 'string' } }, { name: 'code', label: m('col.code'), renderCell: function renderCell(row) {
                    return _react2['default'].createElement(
                        'pre',
                        null,
                        row.node.getValue().split('\n').pop()
                    );
                } }];
            var actions = [];
            if (readonly) {
                actions.push({
                    iconClassName: 'mdi mdi-eye',
                    tooltip: m('code.display'),
                    onTouchTap: function onTouchTap(row) {
                        return _this4.setState({ selectedNode: selectedNode === row.node.getName() ? null : row.node.getName() });
                    }
                });
            } else {
                actions.push({
                    iconClassName: 'mdi mdi-pencil',
                    tooltip: m('code.edit'),
                    onTouchTap: function onTouchTap(row) {
                        return _this4.setState({ selectedNode: selectedNode === row.node.getName() ? null : row.node.getName() });
                    }
                });
                actions.push({
                    iconClassName: 'mdi mdi-delete',
                    tooltip: m('delete'),
                    onTouchTap: function onTouchTap(row) {
                        pydio.UI.openConfirmDialog({
                            message: m('delete.confirm'),
                            destructive: [row.node.getName()],
                            validCallback: function validCallback() {
                                row.node.remove(function () {
                                    _this4.reload();
                                });
                            } });
                    },
                    disable: function disable(row) {
                        return row.node.getName() === 'cells' || row.node.getName() === 'my-files';
                    }
                });
            }

            return _react2['default'].createElement(
                'div',
                { className: 'vertical-layout workspaces-list layout-fill', style: { height: '100%' } },
                _react2['default'].createElement(AdminComponents.Header, {
                    title: m('title'),
                    icon: "mdi mdi-help-network",
                    actions: headerActions,
                    reloadAction: this.reload.bind(this),
                    loading: !(nodesLoaded && dataSourcesLoaded)
                }),
                _react2['default'].createElement(
                    _materialUi.Popover,
                    {
                        open: this.state.open,
                        anchorEl: this.state.anchorEl,
                        anchorOrigin: { horizontal: 'right', vertical: 'top' },
                        targetOrigin: { horizontal: 'right', vertical: 'top' },
                        onRequestClose: this.handleRequestClose.bind(this)
                    },
                    _react2['default'].createElement(
                        'div',
                        { style: { margin: '0 10px' } },
                        _react2['default'].createElement(ModernTextField, { ref: 'newNode', floatingLabelText: m('label'), value: this.state.newName, onChange: function (e, v) {
                                _this4.setState({ newName: v });
                            }, hintText: m('label.new') })
                    ),
                    _react2['default'].createElement(_materialUi.Divider, null),
                    _react2['default'].createElement(
                        'div',
                        { style: { textAlign: 'right', padding: '4px 10px' } },
                        _react2['default'].createElement(_materialUi.FlatButton, { label: pydio.MessageHash['54'], onClick: this.handleRequestClose.bind(this) }),
                        _react2['default'].createElement(_materialUi.RaisedButton, { primary: true, label: m('create.button'), onClick: this.createNode.bind(this) })
                    )
                ),
                _react2['default'].createElement(
                    'div',
                    { className: "layout-fill", style: { overflowY: 'auto' } },
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: 20, paddingBottom: 0 } },
                        m('legend.1')
                    ),
                    nodesLoaded && dataSourcesLoaded && _react2['default'].createElement(
                        _materialUi.Paper,
                        _extends({}, adminStyles.body.block.props, { style: adminStyles.body.block.container }),
                        _react2['default'].createElement(MaterialTable, {
                            columns: columns,
                            data: vNodes,
                            actions: actions,
                            deselectOnClickAway: true,
                            showCheckboxes: false,
                            masterStyles: adminStyles.body.tableMaster
                        })
                    ),
                    (!nodesLoaded || !dataSourcesLoaded) && _react2['default'].createElement(
                        'div',
                        { style: { margin: 16, textAlign: 'center', padding: 20 } },
                        pydio.MessageHash['ajxp_admin.home.6']
                    ),
                    !readonly && accessByName('Create') && _react2['default'].createElement(
                        'div',
                        { style: { padding: '0 24px', opacity: '.5' } },
                        m('legend.2')
                    )
                )
            );
        }
    }]);

    return VirtualNodes;
})(_react2['default'].Component);

exports['default'] = VirtualNodes = (0, _materialUiStyles.muiThemeable)()(VirtualNodes);

exports['default'] = VirtualNodes;
module.exports = exports['default'];
