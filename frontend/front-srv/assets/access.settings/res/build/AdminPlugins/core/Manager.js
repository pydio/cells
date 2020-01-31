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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _PluginsList = require('./PluginsList');

var _PluginsList2 = _interopRequireDefault(_PluginsList);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

var PluginsManager = _react2['default'].createClass({
    displayName: 'PluginsManager',

    mixins: [AdminComponents.MessagesConsumerMixin],

    getInitialState: function getInitialState() {
        return { filter: '' };
    },

    reload: function reload() {
        this.refs.list.reload();
    },

    render: function render() {
        var _this = this;

        var filter = this.state.filter;

        var adminStyles = AdminComponents.AdminStyles();

        return _react2['default'].createElement(
            'div',
            { style: { height: '100%' }, className: 'vertical-layout' },
            _react2['default'].createElement(AdminComponents.Header, {
                title: this.props.currentNode.getLabel(),
                icon: this.props.currentNode.getMetadata().get('icon_class'),
                reloadAction: this.reload,
                actions: [_react2['default'].createElement(ModernTextField, { style: { width: 196 }, hintText: this.props.pydio.MessageHash['87'], value: filter, onChange: function (e, v) {
                        _this.setState({ filter: v });
                    } })]
            }),
            _react2['default'].createElement(
                _materialUi.Paper,
                _extends({}, adminStyles.body.block.props, { className: 'vertical-layout layout-fill' }),
                _react2['default'].createElement(_PluginsList2['default'], _extends({}, this.props, { hideToolbar: true, ref: 'list', filterString: filter }))
            )
        );
    }

});

exports['default'] = PluginsManager;
module.exports = exports['default'];
