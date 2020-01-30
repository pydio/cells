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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ServicesList = require('./ServicesList');

var _ServicesList2 = _interopRequireDefault(_ServicesList);

var _materialUi = require('material-ui');

exports['default'] = _react2['default'].createClass({
    displayName: 'Dashboard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        dataModel: _react2['default'].PropTypes.instanceOf(_pydioModelDataModel2['default']).isRequired,
        rootNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
        currentNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
        openEditor: _react2['default'].PropTypes.func.isRequired,
        openRightPane: _react2['default'].PropTypes.func.isRequired,
        closeRightPane: _react2['default'].PropTypes.func.isRequired,
        pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default'])
    },

    getInitialState: function getInitialState() {
        return { details: false, filter: '', peers: [], peerFilter: '' };
    },

    onDetailsChange: function onDetailsChange(event, value) {
        this.setState({ details: value });
    },

    onFilterChange: function onFilterChange(event, index, value) {
        this.setState({ filter: value });
    },

    onPeerFilterChange: function onPeerFilterChange(event, index, value) {
        this.setState({ peerFilter: value });
    },

    reloadList: function reloadList() {
        this.refs.servicesList.reload();
    },

    onUpdatePeers: function onUpdatePeers(peers) {
        this.setState({ peers: peers });
    },

    render: function render() {
        var pydio = this.props.pydio;
        var _state = this.state;
        var peers = _state.peers;
        var peerFilter = _state.peerFilter;
        var filter = _state.filter;
        var details = _state.details;

        var m = function m(id) {
            return pydio.MessageHash['ajxp_admin.services.' + id] || id;
        };

        var buttonContainer = _react2['default'].createElement(
            'div',
            { style: { display: 'flex', alignItems: 'center', padding: '0 20px', width: '100%' } },
            _react2['default'].createElement(_materialUi.Toggle, { label: m('toggle.details'), toggled: details, onToggle: this.onDetailsChange, labelPosition: "right", style: { width: 150 } }),
            peers.length && _react2['default'].createElement(
                _materialUi.DropDownMenu,
                { className: "media-small-hide", style: { marginTop: -10 }, underlineStyle: { display: 'none' }, value: peerFilter, onChange: this.onPeerFilterChange },
                _react2['default'].createElement(_materialUi.MenuItem, { value: '', primaryText: m('peerfilter.title') }),
                peers.map(function (peer) {
                    return _react2['default'].createElement(_materialUi.MenuItem, { value: peer, primaryText: peer });
                })
            ),
            _react2['default'].createElement(
                _materialUi.DropDownMenu,
                { className: "media-small-hide", style: { marginTop: -10 }, underlineStyle: { display: 'none' }, value: filter, onChange: this.onFilterChange },
                _react2['default'].createElement(_materialUi.MenuItem, { value: '', primaryText: m('filter.nofilter') }),
                _react2['default'].createElement(_materialUi.MenuItem, { value: 'STARTED', primaryText: m('filter.started') }),
                _react2['default'].createElement(_materialUi.MenuItem, { value: 'STOPPED', primaryText: m('filter.stopped') })
            )
        );

        return _react2['default'].createElement(
            'div',
            { className: 'main-layout-nav-to-stack workspaces-board' },
            _react2['default'].createElement(
                'div',
                { className: 'vertical-layout', style: { width: '100%' } },
                _react2['default'].createElement(AdminComponents.Header, {
                    title: this.context.getMessage('172', 'settings'),
                    icon: 'mdi mdi-access-point-network',
                    legend: this.context.getMessage('173', 'settings'),
                    actions: [buttonContainer],
                    reloadAction: this.reloadList.bind(this)
                }),
                _react2['default'].createElement(_ServicesList2['default'], {
                    ref: 'servicesList',
                    pydio: pydio,
                    className: 'layout-fill',
                    style: { paddingBottom: 16 },
                    dataModel: this.props.dataModel,
                    rootNode: this.props.rootNode,
                    currentNode: this.props.rootNode,
                    filter: filter,
                    peerFilter: peerFilter,
                    details: details,
                    onUpdatePeers: this.onUpdatePeers.bind(this)
                })
            )
        );
    }

});
module.exports = exports['default'];
