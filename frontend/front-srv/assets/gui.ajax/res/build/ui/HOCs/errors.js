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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Errorbar = function Errorbar(_ref) {
    var error = _ref.error;

    return !error || error === "" ? null : React.createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', width: '100%', height: '100%' } },
        React.createElement(
            'div',
            { style: { flex: 1, textAlign: 'center', fontSize: 20 } },
            error
        )
    );
};

var withErrors = function withErrors(Component) {
    return (function (_React$Component) {
        _inherits(_class, _React$Component);

        function _class() {
            _classCallCheck(this, _class);

            _React$Component.apply(this, arguments);
        }

        _class.prototype.render = function render() {
            var error = this.props.error;

            if (!error || error === "") return React.createElement(Component, this.props);

            return React.createElement(Errorbar, { error: error });
        };

        return _class;
    })(React.Component);
};

exports['default'] = withErrors;
module.exports = exports['default'];
