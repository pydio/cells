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

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _SimpleList = require('./SimpleList');

var _SimpleList2 = _interopRequireDefault(_SimpleList);

/**
 * Simple to use list component encapsulated with its own query mechanism
 * using a set of properties for the remote node provider.
 */

var NodeListCustomProvider = (function (_React$Component) {
    _inherits(NodeListCustomProvider, _React$Component);

    // propTypes:{
    //     nodeProviderProperties:React.PropTypes.object,
    //     presetDataModel:React.PropTypes.instanceOf(PydioDataModel),
    //     autoRefresh:React.PropTypes.number,
    //     actionBarGroups:React.PropTypes.array,
    //     heightAutoWithMax:React.PropTypes.number,
    //     elementHeight:React.PropTypes.number.isRequired,
    //     nodeClicked:React.PropTypes.func,
    //     reloadOnServerMessage:React.PropTypes.string,
    //     entryRenderAsCard:React.PropTypes.func
    // },

    NodeListCustomProvider.prototype.reload = function reload() {
        if (this.refs.list && this.isMounted()) {
            this.refs.list.reload();
        }
    };

    NodeListCustomProvider.prototype.componentWillUnmount = function componentWillUnmount() {
        if (this._smObs) {
            this.props.pydio.stopObserving("server_message", this._smObs);
            this.props.pydio.stopObserving("server_message:" + this.props.reloadOnServerMessage, this.reload);
        }
    };

    NodeListCustomProvider.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
        if (this.props.nodeProviderProperties && this.props.nodeProviderProperties !== nextProps.nodeProviderProperties) {
            var _state = this.state;
            var dataModel = _state.dataModel;
            var node = _state.node;

            var provider = new RemoteNodeProvider(nextProps.nodeProviderProperties);
            dataModel.setAjxpNodeProvider(provider);
            node.updateProvider(provider);
            this.setState({ dataModel: dataModel, node: node });
        } else if (this.props.presetDataModel !== nextProps.presetDataModel) {
            this.setState({
                dataModel: nextProps.presetDataModel,
                node: nextProps.presetDataModel.getRootNode()
            });
        }
    };

    function NodeListCustomProvider(props) {
        _classCallCheck(this, NodeListCustomProvider);

        _React$Component.call(this, props);
        var dataModel = undefined;
        if (this.props.presetDataModel) {
            dataModel = this.props.presetDataModel;
        } else {
            dataModel = PydioDataModel.RemoteDataModelFactory(this.props.nodeProviderProperties);
        }
        var rootNode = dataModel.getRootNode();
        if (this.props.nodeClicked) {
            // leaf
            this.openEditor = (function (node) {
                this.props.nodeClicked(node);
                return false;
            }).bind(this);
            // dir
            dataModel.observe("selection_changed", (function (event) {
                var selectedNodes = event.memo.getSelectedNodes();
                if (selectedNodes.length) {
                    this.props.nodeClicked(selectedNodes[0]);
                    event.memo.setSelectedNodes([]);
                }
            }).bind(this));
        }
        if (this.props.reloadOnServerMessage && this.props.pydio) {
            this._smObs = (function (event) {
                if (XMLUtils.XPathSelectSingleNode(event, this.props.reloadOnServerMessage)) this.reload();
            }).bind(this);
            this.props.pydio.observe("server_message", this._smObs);
            this.props.pydio.observe("server_message:" + this.props.reloadOnServerMessage, this.reload);
        }
        this.state = { node: rootNode, dataModel: dataModel };
    }

    NodeListCustomProvider.prototype.render = function render() {
        return _react2['default'].createElement(
            'div',
            { className: this.props.heightAutoWithMax ? "" : "layout-fill vertical-layout", style: this.props.containerStyle },
            _react2['default'].createElement(_SimpleList2['default'], _extends({}, this.props, {
                openEditor: this.props.openEditor,
                ref: 'list',
                style: Object.assign({ height: '100%' }, this.props.style || {}),
                node: this.state.node,
                dataModel: this.state.dataModel,
                actionBarGroups: this.props.actionBarGroups,
                skipParentNavigation: true,
                observeNodeReload: true,
                hideToolbar: true
            }))
        );
    };

    return NodeListCustomProvider;
})(_react2['default'].Component);

exports['default'] = NodeListCustomProvider;
module.exports = exports['default'];
