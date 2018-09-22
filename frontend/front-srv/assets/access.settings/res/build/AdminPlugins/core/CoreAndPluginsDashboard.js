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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _PluginsList = require('./PluginsList');

var _PluginsList2 = _interopRequireDefault(_PluginsList);

var _PluginEditor = require('./PluginEditor');

var _PluginEditor2 = _interopRequireDefault(_PluginEditor);

var CoreAndPluginsDashboard = (function (_React$Component) {
    _inherits(CoreAndPluginsDashboard, _React$Component);

    function CoreAndPluginsDashboard() {
        _classCallCheck(this, CoreAndPluginsDashboard);

        _get(Object.getPrototypeOf(CoreAndPluginsDashboard.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(CoreAndPluginsDashboard, [{
        key: 'render',
        value: function render() {
            var basename = _pydioUtilPath2['default'].getBasename(this.props.rootNode.getPath());
            var type = undefined,
                pluginId = undefined;
            if (basename.indexOf('.') > -1) {
                type = basename.split('.')[1];
                pluginId = basename;
            } else {
                type = basename;
                pluginId = "core." + basename;
            }
            var pluginsList = _react2['default'].createElement(_PluginsList2['default'], _extends({}, this.props, {
                displaySmall: true,
                filterType: type,
                title: this.props.rootNode.getLabel()
            }));
            return _react2['default'].createElement(_PluginEditor2['default'], {
                currentNode: this.props.currentNode,
                pydio: this.props.pydio,
                pluginId: pluginId,
                additionalPanes: { top: [], bottom: [pluginsList] }
            });
        }
    }]);

    return CoreAndPluginsDashboard;
})(_react2['default'].Component);

exports['default'] = CoreAndPluginsDashboard;
module.exports = exports['default'];
