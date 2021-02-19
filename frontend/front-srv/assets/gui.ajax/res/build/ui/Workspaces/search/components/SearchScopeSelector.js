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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _require$requireLib = require('pydio').requireLib('boot');

var PydioContextConsumer = _require$requireLib.PydioContextConsumer;

var SearchScopeSelector = (function (_Component) {
    _inherits(SearchScopeSelector, _Component);

    function SearchScopeSelector() {
        _classCallCheck(this, SearchScopeSelector);

        _Component.apply(this, arguments);
    }

    SearchScopeSelector.prototype.render = function render() {
        var _this = this;

        var getMessage = this.props.getMessage;

        return _react2['default'].createElement(
            _materialUi.DropDownMenu,
            {
                value: this.props.value,
                onChange: function (e, i, v) {
                    _this.props.onChange(v);
                },
                onTouchTap: this.props.onTouchTap,
                autoWidth: true,
                style: this.props.style,
                underlineStyle: { display: 'none' },
                labelStyle: this.props.labelStyle
            },
            _react2['default'].createElement(_materialUi.MenuItem, { value: 'folder', primaryText: getMessage(608) }),
            _react2['default'].createElement(_materialUi.MenuItem, { value: 'ws', primaryText: getMessage(609) }),
            _react2['default'].createElement(_materialUi.MenuItem, { value: 'all', primaryText: getMessage(610) })
        );
    };

    _createClass(SearchScopeSelector, null, [{
        key: 'propTypes',
        get: function get() {
            return {
                value: _propTypes2['default'].string,
                onChange: _propTypes2['default'].func.isRequired,
                onTouchTap: _propTypes2['default'].func.isRequired,
                style: _propTypes2['default'].object,
                labelStyle: _propTypes2['default'].object
            };
        }
    }]);

    return SearchScopeSelector;
})(_react.Component);

exports['default'] = SearchScopeSelector = PydioContextConsumer(SearchScopeSelector);
exports['default'] = SearchScopeSelector;
module.exports = exports['default'];
