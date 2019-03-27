/*
 * Copyright 2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio Cells.
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioUtilDom = require('pydio/util/dom');

var _pydioUtilDom2 = _interopRequireDefault(_pydioUtilDom);

var CellsMessageToolbar = (function (_React$Component) {
    _inherits(CellsMessageToolbar, _React$Component);

    function CellsMessageToolbar(props) {
        _classCallCheck(this, CellsMessageToolbar);

        _React$Component.call(this, props);
        var pydio = props.pydio;

        var node = pydio.getContextHolder().getContextNode();
        if (node && node.getMetadata().has("virtual_root")) {
            this.state = { display: true };
        } else {
            this.state = { display: false };
        }
    }

    CellsMessageToolbar.prototype.componentDidMount = function componentDidMount() {
        var _this = this;

        var pydio = this.props.pydio;

        this._observer = function () {
            var node = pydio.getContextHolder().getContextNode();
            if (node && node.getMetadata().has("virtual_root")) {
                _this.setState({ display: true });
            } else {
                _this.setState({ display: false });
            }
        };
        pydio.observe('context_changed', this._observer);
    };

    CellsMessageToolbar.prototype.componentWillUnmount = function componentWillUnmount() {
        var pydio = this.props.pydio;

        pydio.stopObserving('context_changed', this._observer);
    };

    /**
     *
     * @return {*}
     */

    CellsMessageToolbar.prototype.render = function render() {
        var display = this.state.display;
        var pydio = this.props.pydio;

        if (!display) {
            return null;
        }
        var s = { padding: 16, color: '#9E9E9E', borderBottom: '1px solid #F5F5F5' };
        return _react2['default'].createElement(
            'div',
            { style: s },
            pydio.MessageHash['638']
        );
    };

    return CellsMessageToolbar;
})(_react2['default'].Component);

exports['default'] = CellsMessageToolbar;
module.exports = exports['default'];
