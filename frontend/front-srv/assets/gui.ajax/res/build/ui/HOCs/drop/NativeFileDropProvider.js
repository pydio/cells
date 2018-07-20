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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('react');

var Component = _require.Component;

var _require2 = require('react-dom');

var findDOMNode = _require2.findDOMNode;

exports['default'] = function (PydioComponent, onDropFunction) {

    var DND = undefined,
        Backend = undefined;
    try {
        DND = require('react-dnd');
        Backend = require('react-dnd-html5-backend');
    } catch (e) {
        return PydioComponent;
    }

    var NativeFileDropProvider = (function (_Component) {
        _inherits(NativeFileDropProvider, _Component);

        function NativeFileDropProvider() {
            _classCallCheck(this, NativeFileDropProvider);

            _Component.apply(this, arguments);
        }

        NativeFileDropProvider.prototype.render = function render() {
            var connectDropTarget = this.props.connectDropTarget;

            return React.createElement(PydioComponent, _extends({}, this.props, {
                ref: function (instance) {
                    connectDropTarget(findDOMNode(instance));
                }
            }));
        };

        return NativeFileDropProvider;
    })(Component);

    var fileTarget = {

        drop: function drop(props, monitor) {

            var dataTransfer = monitor.getItem().dataTransfer;
            var items = undefined;
            if (dataTransfer.items && dataTransfer.items.length && dataTransfer.items[0] && (dataTransfer.items[0].getAsEntry || dataTransfer.items[0].webkitGetAsEntry)) {
                items = dataTransfer.items;
            }
            onDropFunction(items, dataTransfer.files, props);
        }
    };

    NativeFileDropProvider = DND.DropTarget(Backend.NativeTypes.FILE, fileTarget, function (connect, monitor) {
        return {
            connectDropTarget: connect.dropTarget(),
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop()
        };
    })(NativeFileDropProvider);

    return NativeFileDropProvider;
};

module.exports = exports['default'];
