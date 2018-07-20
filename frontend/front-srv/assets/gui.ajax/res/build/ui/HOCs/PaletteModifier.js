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

var _require2 = require('material-ui');

var MuiThemeProvider = _require2.MuiThemeProvider;

var _require3 = require('material-ui/styles');

var muiThemeable = _require3.muiThemeable;
var getMuiTheme = _require3.getMuiTheme;

exports['default'] = function (palette) {

    return function (PydioComponent) {
        var PaletteModifier = (function (_Component) {
            _inherits(PaletteModifier, _Component);

            function PaletteModifier() {
                _classCallCheck(this, PaletteModifier);

                _Component.apply(this, arguments);
            }

            PaletteModifier.prototype.render = function render() {

                var currentPalette = this.props.muiTheme.palette;
                var newPalette = _extends({}, currentPalette, palette);
                var muiTheme = getMuiTheme({ palette: newPalette });
                var props = _extends({}, this.props, { muiTheme: muiTheme });
                return React.createElement(
                    MuiThemeProvider,
                    { muiTheme: muiTheme },
                    React.createElement(PydioComponent, props)
                );
            };

            return PaletteModifier;
        })(Component);

        PaletteModifier = muiThemeable()(PaletteModifier);

        return PaletteModifier;
    };
};

module.exports = exports['default'];
