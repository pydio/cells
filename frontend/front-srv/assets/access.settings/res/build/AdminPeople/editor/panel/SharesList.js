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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _utilMessagesMixin = require('../util/MessagesMixin');

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var AsyncComponent = _Pydio$requireLib.AsyncComponent;
exports['default'] = _react2['default'].createClass({
    displayName: 'SharesList',

    mixins: [_utilMessagesMixin.RoleMessagesConsumerMixin],

    propTypes: {
        pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default']),
        userId: _react2['default'].PropTypes.string.isRequired,
        userData: _react2['default'].PropTypes.object.isRequired
    },

    render: function render() {
        var _props = this.props;
        var pydio = _props.pydio;
        var userId = _props.userId;

        return _react2['default'].createElement(
            'div',
            { className: 'vertical-layout', style: { height: '100%' } },
            _react2['default'].createElement(
                'h3',
                { className: 'paper-right-title' },
                this.context.getMessage('49'),
                _react2['default'].createElement(
                    'div',
                    { className: 'section-legend' },
                    this.context.getMessage('52')
                )
            ),
            _react2['default'].createElement(
                _materialUi.Paper,
                { style: { margin: 16 }, zDepth: 1, className: 'workspace-activity-block layout-fill vertical-layout' },
                _react2['default'].createElement(AsyncComponent, {
                    pydio: pydio,
                    subject: "user:" + userId,
                    defaultShareType: 'CELLS',
                    namespace: "ShareDialog",
                    componentName: "ShareView"
                })
            )
        );
    }
});
module.exports = exports['default'];
