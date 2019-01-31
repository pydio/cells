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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;
var ModernSelectField = _Pydio$requireLib.ModernSelectField;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib2.PydioContextConsumer;

var SearchFileSizePanel = (function (_React$Component) {
    _inherits(SearchFileSizePanel, _React$Component);

    function SearchFileSizePanel(props) {
        _classCallCheck(this, SearchFileSizePanel);

        _React$Component.call(this, props);

        this.state = {
            from: false,
            to: null,
            fromUnit: 'k',
            toUnit: 'k'
        };
    }

    SearchFileSizePanel.prototype.multiple = function multiple(v, u) {
        switch (u) {
            case "k":
                return v * 1024;
            case "M":
                return v * 1024 * 1024;
            case "G":
                return v * 1024 * 1024 * 1024;
            case "T":
                return v * 1024 * 1024 * 1024 * 1024;
            default:
                return v;
        }
    };

    SearchFileSizePanel.prototype.componentWillUpdate = function componentWillUpdate(nextProps, nextState) {
        if (nextState === this.state) {
            return;
        }

        var from = nextState.from;
        var to = nextState.to;
        var fromUnit = nextState.fromUnit;
        var toUnit = nextState.toUnit;

        this.props.onChange({
            ajxp_bytesize: from || to ? {
                from: this.multiple(from, fromUnit),
                to: this.multiple(to, toUnit)
            } : null
        });
    };

    SearchFileSizePanel.prototype.render = function render() {
        var _this = this;

        var sizeUnit = _pydio2['default'].getMessages()['byte_unit_symbol'] || 'B';
        var getMessage = this.props.getMessage;

        var blockStyle = { display: 'flex', margin: '0 16px' };
        return _react2['default'].createElement(
            'div',
            null,
            _react2['default'].createElement(
                'div',
                { style: blockStyle },
                _react2['default'].createElement(ModernTextField, {
                    style: { flex: 2, marginRight: 4 },
                    type: "number",
                    hintText: getMessage(613),
                    onChange: function (e, v) {
                        _this.setState({ from: v || 0 });
                    }
                }),
                _react2['default'].createElement(
                    ModernSelectField,
                    {
                        value: this.state.fromUnit,
                        onChange: function (e, i, v) {
                            _this.setState({ fromUnit: v });
                        },
                        style: { marginLeft: 4, flex: 1 }
                    },
                    _react2['default'].createElement(_materialUi.MenuItem, { value: '', primaryText: sizeUnit }),
                    _react2['default'].createElement(_materialUi.MenuItem, { value: 'k', primaryText: 'K' + sizeUnit }),
                    _react2['default'].createElement(_materialUi.MenuItem, { value: 'M', primaryText: 'M' + sizeUnit }),
                    _react2['default'].createElement(_materialUi.MenuItem, { value: 'G', primaryText: 'G' + sizeUnit }),
                    _react2['default'].createElement(_materialUi.MenuItem, { value: 'T', primaryText: 'T' + sizeUnit })
                )
            ),
            _react2['default'].createElement(
                'div',
                { style: blockStyle },
                _react2['default'].createElement(ModernTextField, {
                    style: { flex: 2, marginRight: 4 },
                    type: "number",
                    hintText: getMessage(614),
                    onChange: function (e, v) {
                        _this.setState({ to: v || 109951162 });
                    }
                }),
                _react2['default'].createElement(
                    ModernSelectField,
                    {
                        style: { marginLeft: 4, flex: 1 },
                        value: this.state.toUnit,
                        onChange: function (e, i, v) {
                            _this.setState({ toUnit: v });
                        }
                    },
                    _react2['default'].createElement(_materialUi.MenuItem, { value: '', primaryText: sizeUnit }),
                    _react2['default'].createElement(_materialUi.MenuItem, { value: 'k', primaryText: 'K' + sizeUnit }),
                    _react2['default'].createElement(_materialUi.MenuItem, { value: 'M', primaryText: 'M' + sizeUnit }),
                    _react2['default'].createElement(_materialUi.MenuItem, { value: 'G', primaryText: 'G' + sizeUnit }),
                    _react2['default'].createElement(_materialUi.MenuItem, { value: 'T', primaryText: 'T' + sizeUnit })
                )
            )
        );
    };

    return SearchFileSizePanel;
})(_react2['default'].Component);

SearchFileSizePanel = PydioContextConsumer(SearchFileSizePanel);
exports['default'] = SearchFileSizePanel;
module.exports = exports['default'];
