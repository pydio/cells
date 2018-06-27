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

var _modelVirtualNode = require('../model/VirtualNode');

var _modelVirtualNode2 = _interopRequireDefault(_modelVirtualNode);

var _modelDataSource = require('../model/DataSource');

var _modelDataSource2 = _interopRequireDefault(_modelDataSource);

var _virtualNodeCard = require('../virtual/NodeCard');

var _virtualNodeCard2 = _interopRequireDefault(_virtualNodeCard);

var _materialUi = require('material-ui');

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

            var readonly = this.props.readonly;
            var _state = this.state;
            var nodes = _state.nodes;
            var dataSources = _state.dataSources;
            var nodesLoaded = _state.nodesLoaded;
            var dataSourcesLoaded = _state.dataSourcesLoaded;

            var vNodes = [];
            nodes.map(function (node) {
                vNodes.push(_react2['default'].createElement(_virtualNodeCard2['default'], { dataSources: dataSources, node: node, reloadList: _this4.reload.bind(_this4), readonly: readonly }));
            });

            var headerActions = [];
            if (!readonly) {
                headerActions.push(_react2['default'].createElement(_materialUi.FlatButton, { primary: true, label: "+ Template Path", onTouchTap: this.handleTouchTap.bind(this) }));
            }

            return _react2['default'].createElement(
                'div',
                { className: 'vertical-layout workspaces-list layout-fill' },
                _react2['default'].createElement(AdminComponents.Header, {
                    title: "Template Paths",
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
                        _react2['default'].createElement(_materialUi.TextField, { ref: 'newNode', floatingLabelText: "Label", value: this.state.newName, onChange: function (e, v) {
                                _this4.setState({ newName: v });
                            }, hintText: "Provide a label for this node" })
                    ),
                    _react2['default'].createElement(_materialUi.Divider, null),
                    _react2['default'].createElement(
                        'div',
                        { style: { textAlign: 'right', padding: '4px 10px' } },
                        _react2['default'].createElement(_materialUi.FlatButton, { label: "Cancel", onClick: this.handleRequestClose.bind(this) }),
                        _react2['default'].createElement(_materialUi.RaisedButton, { primary: true, label: "Create", onClick: this.createNode.bind(this) })
                    )
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: 20, paddingBottom: 0 } },
                    'Template Paths are dynamically computed depending on the context. They can be used as roots for workspaces in replacement of a fixed datasource path. They are used by default to create the Personal Files workspace that points to a different folder for each users, and for computing the location of the users Cells folders.',
                    _react2['default'].createElement('br', null),
                    !readonly && _react2['default'].createElement(
                        'span',
                        null,
                        'Use Ctrl+Space inside the editor to get hint about the possible values. Current values supported are: User.Name (dynamically resolved to the current user logged login) and DataSources (to pick a datasource dynamically).'
                    )
                ),
                nodesLoaded && dataSourcesLoaded && vNodes,
                (!nodesLoaded || !dataSourcesLoaded) && _react2['default'].createElement(
                    'div',
                    { style: { margin: 16, textAlign: 'center', padding: 20 } },
                    'Loading...'
                )
            );
        }
    }]);

    return VirtualNodes;
})(_react2['default'].Component);

exports['default'] = VirtualNodes;
module.exports = exports['default'];
