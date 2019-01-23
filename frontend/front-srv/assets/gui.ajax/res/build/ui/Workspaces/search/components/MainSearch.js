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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _SearchScopeSelector = require('./SearchScopeSelector');

var _SearchScopeSelector2 = _interopRequireDefault(_SearchScopeSelector);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _materialUiStyles = require('material-ui/styles');

/**
 * Subpane for search form
 */

var _require$requireLib = require('pydio').requireLib('boot');

var PydioContextConsumer = _require$requireLib.PydioContextConsumer;

var MainSearch = (function (_Component) {
    _inherits(MainSearch, _Component);

    _createClass(MainSearch, null, [{
        key: 'propTypes',
        get: function get() {
            return {
                title: _react.PropTypes.string,
                mode: _react.PropTypes.string,
                onOpen: _react.PropTypes.func,
                onAdvanced: _react.PropTypes.func,
                onMore: _react.PropTypes.func,
                onClose: _react.PropTypes.func,
                hintText: _react.PropTypes.string,
                loading: _react.PropTypes.bool,
                scopeSelectorProps: _react.PropTypes.object,
                showAdvanced: _react.PropTypes.bool
            };
        }
    }, {
        key: 'styles',
        get: function get() {
            return {
                main: {
                    background: "#ffffff",
                    width: "100%",
                    height: 36,
                    border: "none",
                    transition: 'all .25s',
                    display: 'flex'
                },
                input: {
                    padding: "0 4px",
                    border: 0
                },
                hint: {
                    transition: 'all .25s',
                    width: "100%",
                    padding: "0 4px",
                    bottom: 0,
                    lineHeight: "36px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                },
                magnifier: {
                    padding: '7px 0 0 8px',
                    fontSize: 23,
                    color: 'rgba(0, 0, 0, 0.33)'
                },
                underline: {
                    display: "none"
                },
                closedMode: {
                    main: {
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255,255,255,.1)',
                        borderRadius: 2
                    },
                    magnifier: {
                        fontSize: 18,
                        color: 'rgba(255, 255, 255, 0.64)'
                    },
                    input: {
                        color: 'rgba(255, 255, 255, 0.64)'
                    },
                    hint: {
                        color: 'rgba(255, 255, 255, 0.64)'
                    }
                }
            };
        }
    }]);

    function MainSearch(props) {
        _classCallCheck(this, MainSearch);

        _Component.call(this, props);

        this.state = {
            mode: props.mode,
            value: props.value || ''
        };

        // Making sure we don't send too many requests
        // this.onChange = _.debounce(this.onChange, 500)
    }

    MainSearch.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
        this.setState({
            mode: nextProps.mode
        });
        if (nextProps.value && !this.state.value) {
            this.setState({ value: nextProps.value });
        }
    };

    MainSearch.prototype.componentDidUpdate = function componentDidUpdate() {
        if (this.state.mode !== 'closed') {
            this.input && this.input.focus();
        }
    };

    MainSearch.prototype.onChange = function onChange(value) {
        var _this = this;

        this.setState({ value: value }, function () {
            _this.props.onChange({ 'basename': value });
        });
    };

    MainSearch.prototype.render = function render() {
        var _this2 = this;

        var _props = this.props;
        var title = _props.title;
        var mode = _props.mode;
        var onOpen = _props.onOpen;
        var onAdvanced = _props.onAdvanced;
        var onMore = _props.onMore;
        var onClose = _props.onClose;
        var hintText = _props.hintText;
        var loading = _props.loading;
        var scopeSelectorProps = _props.scopeSelectorProps;
        var showAdvanced = _props.showAdvanced;
        var getMessage = _props.getMessage;
        var _MainSearch$styles = MainSearch.styles;
        var main = _MainSearch$styles.main;
        var input = _MainSearch$styles.input;
        var hint = _MainSearch$styles.hint;
        var underline = _MainSearch$styles.underline;
        var magnifier = _MainSearch$styles.magnifier;
        var closedMode = _MainSearch$styles.closedMode;

        if (mode === 'closed') {
            main = _extends({}, main, closedMode.main);
            hint = _extends({}, hint, closedMode.hint);
            input = _extends({}, input, closedMode.input);
            magnifier = _extends({}, magnifier, closedMode.magnifier);
        }
        var topStyle = {};
        if (mode !== 'closed') {
            topStyle = { backgroundColor: this.props.muiTheme.palette.accent2Color };
        }

        return _react2['default'].createElement(
            'div',
            { className: 'search-input', style: topStyle },
            _react2['default'].createElement(
                'div',
                { className: 'panel-header', style: { display: 'flex' } },
                scopeSelectorProps && _react2['default'].createElement(
                    'span',
                    null,
                    _react2['default'].createElement(_SearchScopeSelector2['default'], _extends({ style: { marginTop: -16, marginLeft: -26 }, labelStyle: { color: 'white' } }, scopeSelectorProps))
                ),
                _react2['default'].createElement('span', { style: { flex: 1 } }),
                showAdvanced && _react2['default'].createElement(
                    _materialUi.FlatButton,
                    { style: { textTransform: 'none', color: 'white', fontSize: 15, marginTop: -5, padding: '0 16px' }, onTouchTap: mode === 'advanced' ? onMore : onAdvanced },
                    mode === 'advanced' ? '- ' + getMessage(606) : '+ ' + getMessage(605)
                ),
                mode === 'advanced' && loading && _react2['default'].createElement(
                    'div',
                    { style: { marginRight: 10 } },
                    _react2['default'].createElement(_materialUi.CircularProgress, { size: 20, thickness: 3 })
                ),
                _react2['default'].createElement('span', { className: 'panel-header-close mdi mdi-close', onClick: this.props.onClose })
            ),
            mode !== 'advanced' && _react2['default'].createElement(
                'div',
                { style: main },
                _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-magnify', style: magnifier }),
                _react2['default'].createElement(_materialUi.TextField, {
                    ref: function (input) {
                        return _this2.input = input;
                    },
                    style: { flex: 1, height: main.height },
                    inputStyle: input,
                    hintStyle: hint,
                    fullWidth: true,
                    underlineShow: false,
                    onFocus: onOpen,
                    onBlur: mode === 'small' ? onClose : null,
                    hintText: hintText,
                    value: this.state.value || '',
                    onChange: function (e, v) {
                        return _this2.onChange(v);
                    },
                    onKeyPress: function (e) {
                        return e.key === 'Enter' ? _this2.onChange(e.target.value) : null;
                    }
                }),
                loading && _react2['default'].createElement(
                    'div',
                    { style: { marginTop: 9, marginRight: 9 } },
                    _react2['default'].createElement(_materialUi.CircularProgress, { size: 20, thickness: 3 })
                )
            )
        );
    };

    return MainSearch;
})(_react.Component);

exports['default'] = MainSearch = PydioContextConsumer(_materialUiStyles.muiThemeable()(MainSearch));
exports['default'] = MainSearch;
module.exports = exports['default'];
