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

var _materialUi = require('material-ui');

var _utilMixins = require('../util/Mixins');

var GroupAdminDashboard = _react2['default'].createClass({
    displayName: 'GroupAdminDashboard',

    mixins: [_utilMixins.MessagesConsumerMixin],

    renderLink: function renderLink(node) {

        var label = _react2['default'].createElement(
            'span',
            null,
            _react2['default'].createElement('span', { className: node.iconClass + ' button-icon' }),
            ' ',
            node.label
        );
        return _react2['default'].createElement(
            'span',
            { style: { display: 'inline-block', margin: '0 5px' } },
            _react2['default'].createElement(_materialUi.RaisedButton, {
                key: node.path,
                secondary: true,
                onTouchTap: function () {
                    pydio.goTo(node.path);
                },
                label: label
            })
        );
    },

    render: function render() {

        var baseNodes = [{
            path: '/idm/users',
            label: this.context.getMessage('249', ''),
            iconClass: 'icon-user'
        }, {
            path: '/data/workspaces',
            label: this.context.getMessage('250', ''),
            iconClass: 'icon-hdd'
        }];
        return _react2['default'].createElement(
            'div',
            { style: { width: '100%', height: '100%' } },
            _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 1, style: { margin: 10 } },
                _react2['default'].createElement(
                    'div',
                    { style: { padding: 10 } },
                    this.context.getMessage('home.67')
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: 10, textAlign: 'center' } },
                    baseNodes.map((function (n) {
                        return this.renderLink(n);
                    }).bind(this)),
                    _react2['default'].createElement('br', null),
                    _react2['default'].createElement(_materialUi.FlatButton, {
                        label: this.context.getMessage('home.68'),
                        secondary: true,
                        onTouchTap: function () {
                            pydio.triggerRepositoryChange("homepage");
                        }
                    })
                )
            )
        );
    }

});

exports['default'] = GroupAdminDashboard;
module.exports = exports['default'];
