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

var _materialUi = require('material-ui');

var _reactRedux = require('react-redux');

var _utils = require('./utils');

var _utils2 = require('../utils');

var Locate = (function (_React$Component) {
    _inherits(Locate, _React$Component);

    function Locate() {
        _classCallCheck(this, _Locate);

        _React$Component.apply(this, arguments);
    }

    Locate.prototype.render = function render() {
        return React.createElement(_materialUi.IconButton, _extends({ onClick: function () {
                return _utils2.handler("onLocate", props);
            }, iconClassName: 'mdi mdi-crosshairs' }, props));
    };

    var _Locate = Locate;
    Locate = _reactRedux.connect(_utils.mapStateToProps)(Locate) || Locate;
    return Locate;
})(React.Component);

exports.Locate = Locate;
