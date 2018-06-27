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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _materialUi = require('material-ui');

var _WsDashboard = require('./WsDashboard');

var _WsDashboard2 = _interopRequireDefault(_WsDashboard);

var _VirtualNodes = require('./VirtualNodes');

var _VirtualNodes2 = _interopRequireDefault(_VirtualNodes);

var PydioDataModel = require('pydio/model/data-model');
var AjxpNode = require('pydio/model/node');

exports['default'] = (0, _react.createClass)({

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        dataModel: _react.PropTypes.instanceOf(PydioDataModel).isRequired,
        rootNode: _react.PropTypes.instanceOf(AjxpNode).isRequired,
        currentNode: _react.PropTypes.instanceOf(AjxpNode).isRequired,
        openEditor: _react.PropTypes.func.isRequired,
        openRightPane: _react.PropTypes.func.isRequired,
        closeRightPane: _react.PropTypes.func.isRequired
    },

    render: function render() {
        return React.createElement(
            'div',
            { className: 'main-layout-nav-to-stack workspaces-board' },
            React.createElement(
                'div',
                { className: 'left-nav vertical-layout', style: { width: '100%' } },
                React.createElement(
                    'div',
                    { className: 'vertical-layout workspaces-list layout-fill' },
                    React.createElement(
                        'h1',
                        { className: 'admin-panel-title hide-on-vertical-layout' },
                        this.context.getMessage('2b', 'settings')
                    ),
                    React.createElement(
                        _materialUi.Paper,
                        { style: { margin: 16, overflowY: 'hidden' }, className: 'layout-fill' },
                        React.createElement(
                            _materialUi.Tabs,
                            { style: { height: '100%', display: 'flex', flexDirection: 'column' },
                                contentContainerStyle: { flex: 1, overflowY: 'auto' },
                                tabItemContainerStyle: { flexShrink: 0 },
                                inkBarStyle: { flexShrink: 0 }
                            },
                            React.createElement(
                                _materialUi.Tab,
                                { label: 'Workspaces' },
                                React.createElement(_WsDashboard2['default'], this.props)
                            ),
                            React.createElement(
                                _materialUi.Tab,
                                { label: 'DataSources' },
                                React.createElement(_WsDashboard2['default'], _extends({}, this.props, { filter: 'templates' }))
                            ),
                            React.createElement(
                                _materialUi.Tab,
                                { label: 'Dynamic Nodes' },
                                React.createElement(_VirtualNodes2['default'], null)
                            )
                        )
                    )
                )
            )
        );
    }

});
module.exports = exports['default'];
