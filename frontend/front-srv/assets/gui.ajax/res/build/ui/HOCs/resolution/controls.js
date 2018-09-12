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

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _materialUi = require('material-ui');

var _reactRedux = require('react-redux');

var _utils = require('./utils');

var _utils2 = require('../utils');

var _controls = require('../controls');

var withResolutionControls = function withResolutionControls() {
    return function (Component) {
        var ResolutionControls = (function (_React$Component) {
            _inherits(ResolutionControls, _React$Component);

            function ResolutionControls() {
                _classCallCheck(this, _ResolutionControls);

                _React$Component.apply(this, arguments);
            }

            ResolutionControls.prototype.render = function render() {
                var _props = this.props;
                var resolution = _props.resolution;

                var remaining = _objectWithoutProperties(_props, ['resolution']);

                return React.createElement(_materialUi.IconButton, _extends({ onClick: function () {
                        return _utils2.handler("onToggleResolution", props);
                    }, iconClassName: 'mdi mdi-crop-' + (resolution === "hi" ? "square" : "free") }, remaining));
            };

            var _ResolutionControls = ResolutionControls;
            ResolutionControls = _controls.withDisabled(function () {
                return false;
            })(ResolutionControls) || ResolutionControls;
            ResolutionControls = _reactRedux.connect(_utils.mapStateToProps)(ResolutionControls) || ResolutionControls;
            return ResolutionControls;
        })(React.Component);
    };
};
exports.withResolutionControls = withResolutionControls;
