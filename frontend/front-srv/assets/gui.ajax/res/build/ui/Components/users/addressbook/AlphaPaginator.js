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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _materialUiStyles = require('material-ui/styles');

var _materialUi = require('material-ui');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib.PydioContextConsumer;

/**
 * Alphabet and pages generator to give a first-letter-based pagination
 */

var AlphaPaginator = (function (_Component) {
    _inherits(AlphaPaginator, _Component);

    function AlphaPaginator() {
        _classCallCheck(this, AlphaPaginator);

        _Component.apply(this, arguments);
    }

    AlphaPaginator.prototype.render = function render() {

        var letters = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
        letters = [-1].concat(letters);
        var _props = this.props;
        var item = _props.item;
        var paginatorCallback = _props.paginatorCallback;
        var style = _props.style;
        var getMessage = _props.getMessage;

        var paginator = undefined;
        if (item.pagination) {
            (function () {
                var _item$pagination = item.pagination;
                var start = _item$pagination.start;
                var end = _item$pagination.end;
                var max = _item$pagination.max;
                var interval = _item$pagination.interval;

                var total_pages = Math.ceil(max / interval);
                var current = Math.ceil(start / interval);
                var pages = [];
                for (var i = 0; i < total_pages; i++) {
                    pages.push(i);
                }paginator = React.createElement(
                    _materialUi.MuiThemeProvider,
                    { muiTheme: _materialUiStyles.getMuiTheme({ zIndex: { layer: 3000, popover: 3001 } }) },
                    React.createElement(
                        _materialUi.SelectField,
                        {
                            floatingLabelText: getMessage(331),
                            style: { width: 60 },
                            dropDownMenuProps: { anchorOrigin: { vertical: 'center', horizontal: 'right' } },
                            fullWidth: true,
                            value: current,
                            onChange: function (e, i, v) {
                                paginatorCallback(v * interval + '-' + (v + 1) * interval);
                            }
                        },
                        pages.map(function (p) {
                            return React.createElement(_materialUi.MenuItem, { value: p, key: p, primaryText: p + 1 });
                        })
                    )
                );
            })();
        }

        var currentPage = item.currentParams && item.currentParams.alpha_pages && item.currentParams.value || -1;

        return React.createElement(
            'div',
            { style: _extends({}, style, { display: 'flex', paddingRight: 8, alignItems: 'center' }) },
            React.createElement(
                'div',
                { style: { flex: 1 } },
                getMessage(249, '')
            ),
            paginator,
            React.createElement(
                _materialUi.MuiThemeProvider,
                { muiTheme: _materialUiStyles.getMuiTheme({ zIndex: { layer: 3000, popover: 3001 } }) },
                React.createElement(
                    _materialUi.SelectField,
                    {
                        floatingLabelText: getMessage(625),
                        style: { width: 60, marginLeft: 20 },
                        dropDownMenuProps: { anchorOrigin: { vertical: 'center', horizontal: 'right' } },
                        fullWidth: true,
                        value: currentPage,
                        onChange: function (e, i, v) {
                            paginatorCallback(v);
                        }
                    },
                    letters.map(function (l) {
                        return React.createElement(_materialUi.MenuItem, { value: l, key: l, primaryText: l === -1 ? getMessage(597, '') : l });
                    })
                )
            )
        );
    };

    return AlphaPaginator;
})(_react.Component);

AlphaPaginator.propTypes = {
    /**
     * Currently selected Item
     */
    item: _react.PropTypes.object,
    /**
     * When a letter is clicked, function(letter)
     */
    paginatorCallback: _react.PropTypes.func.isRequired,
    /**
     * Main instance of pydio
     */
    pydio: _react.PropTypes.instanceOf(_pydio2['default']),
    /**
     * Display mode, either large (book) or small picker ('selector', 'popover').
     */
    mode: _react.PropTypes.oneOf(['book', 'selector', 'popover']).isRequired
};

exports['default'] = AlphaPaginator = PydioContextConsumer(AlphaPaginator);
exports['default'] = AlphaPaginator = _materialUiStyles.muiThemeable()(AlphaPaginator);

exports['default'] = AlphaPaginator;
module.exports = exports['default'];
