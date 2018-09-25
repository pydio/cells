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

var _reactRedux = require('react-redux');

var _utils = require('./utils');

var _utils2 = require('../utils');

var withContentControls = function withContentControls(Component) {
    return (function (_React$Component) {
        _inherits(ContentControls, _React$Component);

        function ContentControls() {
            _classCallCheck(this, _ContentControls);

            _React$Component.apply(this, arguments);
        }

        ContentControls.prototype.render = function render() {
            console.log(this.props);
            var fnSave = _utils2.handler("onSave", this.props);
            var fnUndo = _utils2.handler("onUndo", this.props);
            var fnRedo = _utils2.handler("onRedo", this.props);
            var fnToggleLineNumbers = _utils2.handler("onToggleLineNumbers", this.props);
            var fnToggleLineWrapping = _utils2.handler("onToggleLineWrapping", this.props);
            var fnSearch = _utils2.handler("onSearch", this.props);
            var fnJumpTo = _utils2.handler("onJumpTo", this.props);

            return React.createElement(Component, _extends({
                editable: typeof fnSave === "function" || typeof fnUndo === "function" || typeof fnRedo === "function",
                saveable: typeof fnSave === "function",
                undoable: typeof fnUndo === "function",
                redoable: typeof fnRedo === "function",
                editortools: typeof fnToggleLineNumbers === "function" || typeof fnToggleLineWrapping === "function",
                searchable: typeof fnSearch === "function" || typeof fnJumpTo === "function",
                onSave: fnSave,
                onUndo: fnUndo,
                onRedo: fnRedo,
                onToggleLineNumbers: fnToggleLineNumbers,
                onToggleLineWrapping: fnToggleLineWrapping,
                onSearch: function (value) {
                    return fnSearch(value);
                },
                onJumpTo: function (value) {
                    return fnJumpTo(value);
                }
            }, this.props));
        };

        var _ContentControls = ContentControls;
        ContentControls = _reactRedux.connect(_utils.mapStateToProps)(ContentControls) || ContentControls;
        return ContentControls;
    })(React.Component);
};
exports.withContentControls = withContentControls;
