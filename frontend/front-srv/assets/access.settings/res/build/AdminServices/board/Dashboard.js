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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ServicesList = require('./ServicesList');

var _ServicesList2 = _interopRequireDefault(_ServicesList);

var _materialUi = require('material-ui');

exports['default'] = _react2['default'].createClass({
    displayName: 'Dashboard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        dataModel: _react2['default'].PropTypes.instanceOf(PydioDataModel).isRequired,
        rootNode: _react2['default'].PropTypes.instanceOf(AjxpNode).isRequired,
        currentNode: _react2['default'].PropTypes.instanceOf(AjxpNode).isRequired,
        openEditor: _react2['default'].PropTypes.func.isRequired,
        openRightPane: _react2['default'].PropTypes.func.isRequired,
        closeRightPane: _react2['default'].PropTypes.func.isRequired
    },

    getInitialState: function getInitialState() {
        return { details: true, filter: '' };
    },

    onDetailsChange: function onDetailsChange(event, value) {
        this.setState({ details: value });
    },

    onFilterChange: function onFilterChange(event, index, value) {
        this.setState({ filter: value });
    },

    reloadList: function reloadList() {
        this.refs.servicesList.reload();
    },

    render: function render() {
        var buttonContainer = _react2['default'].createElement(
            'div',
            { style: { display: 'flex', alignItems: 'baseline', padding: '0 20px', width: '100%' } },
            _react2['default'].createElement(_materialUi.Toggle, { label: "Show Details", toggled: this.state.details, onToggle: this.onDetailsChange, labelPosition: "right", style: { width: 150 } }),
            _react2['default'].createElement(
                _materialUi.DropDownMenu,
                { underlineStyle: { display: 'none' }, value: this.state.filter, onChange: this.onFilterChange },
                _react2['default'].createElement(_materialUi.MenuItem, { value: '', primaryText: 'No filter' }),
                _react2['default'].createElement(_materialUi.MenuItem, { value: 'STARTED', primaryText: 'Running Only' }),
                _react2['default'].createElement(_materialUi.MenuItem, { value: 'STOPPED', primaryText: 'Stopped Only' })
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
                    actions: buttonContainer,
                    reloadAction: this.reloadList.bind(this)
                }),
                _react2['default'].createElement(_ServicesList2['default'], {
                    ref: 'servicesList',
                    className: 'layout-fill',
                    style: { paddingBottom: 16 },
                    dataModel: this.props.dataModel,
                    rootNode: this.props.rootNode,
                    currentNode: this.props.rootNode,
                    filter: this.state.filter,
                    details: this.state.details
                })
            )
        );
    }

});
module.exports = exports['default'];
