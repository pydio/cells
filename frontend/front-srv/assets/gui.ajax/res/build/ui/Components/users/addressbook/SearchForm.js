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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _materialUi = require('material-ui');

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

/**
 * Ready to use Form + Result List for search users
 */

var SearchForm = (function (_Component) {
    _inherits(SearchForm, _Component);

    function SearchForm(props, context) {
        _classCallCheck(this, SearchForm);

        _Component.call(this, props, context);
        this.state = { value: '' };
        this.search = _lodashDebounce2['default'](this.search.bind(this), 300);
    }

    SearchForm.prototype.search = function search() {
        this.props.onSearch(this.state.value);
    };

    SearchForm.prototype.onChange = function onChange(event, value) {
        this.setState({ value: value });
        this.search();
    };

    SearchForm.prototype.render = function render() {
        var _props = this.props;
        var underlineShow = _props.underlineShow;
        var searchLabel = _props.searchLabel;
        var style = _props.style;
        var inputStyle = _props.inputStyle;
        var underlineStyle = _props.underlineStyle;
        var underlineFocusStyle = _props.underlineFocusStyle;
        var hintStyle = _props.hintStyle;
        var value = this.state.value;

        return React.createElement(
            'div',
            { style: _extends({ minWidth: 320 }, style) },
            React.createElement(_materialUi.TextField, {
                fullWidth: true,
                value: value,
                onChange: this.onChange.bind(this),
                hintText: searchLabel,
                inputStyle: inputStyle,
                hintStyle: hintStyle,
                underlineStyle: underlineStyle,
                underlineFocusStyle: underlineFocusStyle,
                underlineShow: underlineShow === undefined ? true : underlineShow
            })
        );
    };

    return SearchForm;
})(_react.Component);

SearchForm.propTypes = {
    /**
     * Label displayed in the search field
     */
    searchLabel: _propTypes2['default'].string.isRequired,
    /**
     * Callback triggered to search
     */
    onSearch: _propTypes2['default'].func.isRequired,
    /**
     * Will be appended to the root element
     */
    style: _propTypes2['default'].object,
    /**
     * To be applied on TextField
     */
    underlineShow: _propTypes2['default'].bool
};

exports['default'] = SearchForm;
module.exports = exports['default'];
