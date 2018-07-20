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

var _require$requireLib = require('pydio').requireLib('boot');

var PydioContextConsumer = _require$requireLib.PydioContextConsumer;

var SearchDatePanel = (function (_React$Component) {
    _inherits(SearchDatePanel, _React$Component);

    _createClass(SearchDatePanel, null, [{
        key: 'styles',
        get: function get() {
            return {
                dropdownLabel: {
                    padding: 0
                },
                dropdownUnderline: {
                    marginLeft: 0,
                    marginRight: 0
                },
                dropdownIcon: {
                    right: 0
                },
                datePickerGroup: {
                    display: "flex",
                    justifyContent: "space-between"
                },
                datePicker: {
                    flex: 1
                },
                dateInput: {
                    width: "auto",
                    flex: 1
                },
                dateClose: {
                    lineHeight: "48px",
                    right: 5,
                    position: "relative"
                }
            };
        }
    }]);

    function SearchDatePanel(props) {
        _classCallCheck(this, SearchDatePanel);

        _React$Component.call(this, props);

        this.state = {
            value: 'custom',
            startDate: null,
            endDate: null
        };
    }

    SearchDatePanel.prototype.componentDidUpdate = function componentDidUpdate(prevProps, prevState) {
        if (prevState !== this.state) {
            var _state = this.state;
            var value = _state.value;
            var startDate = _state.startDate;
            var endDate = _state.endDate;

            if (value === 'custom' && !startDate && !endDate) {
                this.props.onChange({ ajxp_modiftime: null });
            }
            var startDay = function startDay(date) {
                date.setHours(0);
                date.setMinutes(0);
                date.setSeconds(1);
                return date;
            };
            var endDay = function endDay(date) {
                date.setHours(23);
                date.setMinutes(59);
                date.setSeconds(59);
                return date;
            };

            if (value === 'custom') {
                if (!startDate) {
                    startDate = new Date(0);
                }
                if (!endDate) {
                    // Next year
                    endDate = new Date();
                    endDate.setFullYear(endDate.getFullYear() + 1);
                }
                this.props.onChange({ ajxp_modiftime: { from: startDate, to: endDate } });
            } else if (value === 'PYDIO_SEARCH_RANGE_TODAY') {
                this.props.onChange({ ajxp_modiftime: {
                        from: startDay(new Date()),
                        to: endDay(new Date())
                    } });
            } else if (value === 'PYDIO_SEARCH_RANGE_YESTERDAY') {
                var y = new Date();
                y.setDate(y.getDate() - 1);
                var e = new Date();
                e.setDate(e.getDate() - 1);
                this.props.onChange({ ajxp_modiftime: {
                        from: startDay(y),
                        to: endDay(e)
                    } });
            } else if (value === 'PYDIO_SEARCH_RANGE_LAST_WEEK') {
                var s = new Date();
                s.setDate(s.getDate() - 7);
                var e = new Date();
                this.props.onChange({ ajxp_modiftime: {
                        from: s,
                        to: e
                    } });
            } else if (value === 'PYDIO_SEARCH_RANGE_LAST_MONTH') {
                var s = new Date();
                s.setMonth(s.getMonth() - 1);
                var e = new Date();
                this.props.onChange({ ajxp_modiftime: {
                        from: s,
                        to: e
                    } });

                this.props.onChange({ ajxp_modiftime: { from: startDate, to: endDate } });
            } else if (value === 'PYDIO_SEARCH_RANGE_LAST_YEAR') {
                var s = new Date();
                s.setFullYear(s.getFullYear() - 1);
                var e = new Date();
                this.props.onChange({ ajxp_modiftime: {
                        from: s,
                        to: e
                    } });
            }
        }
    };

    SearchDatePanel.prototype.render = function render() {
        var _this = this;

        var today = new Date();

        var _SearchDatePanel$styles = SearchDatePanel.styles;
        var dropdownLabel = _SearchDatePanel$styles.dropdownLabel;
        var dropdownUnderline = _SearchDatePanel$styles.dropdownUnderline;
        var dropdownIcon = _SearchDatePanel$styles.dropdownIcon;
        var datePickerGroup = _SearchDatePanel$styles.datePickerGroup;
        var datePicker = _SearchDatePanel$styles.datePicker;
        var dateInput = _SearchDatePanel$styles.dateInput;
        var dateClose = _SearchDatePanel$styles.dateClose;
        var _props = this.props;
        var inputStyle = _props.inputStyle;
        var getMessage = _props.getMessage;
        var _state2 = this.state;
        var value = _state2.value;
        var startDate = _state2.startDate;
        var endDate = _state2.endDate;

        return _react2['default'].createElement(
            'div',
            null,
            _react2['default'].createElement(
                DatePickerFeed,
                { pydio: this.props.pydio },
                function (items) {
                    return _react2['default'].createElement(
                        _materialUi.DropDownMenu,
                        { autoWidth: false, labelStyle: dropdownLabel, underlineStyle: dropdownUnderline, iconStyle: dropdownIcon, style: inputStyle, value: value, onChange: function (e, index, value) {
                                return _this.setState({ value: value });
                            } },
                        items.map(function (item) {
                            return _react2['default'].createElement(_materialUi.MenuItem, { value: item.payload, label: item.text, primaryText: item.text });
                        })
                    );
                }
            ),
            value === 'custom' && _react2['default'].createElement(
                'div',
                { style: _extends({}, datePickerGroup, inputStyle) },
                _react2['default'].createElement(_materialUi.DatePicker, {
                    textFieldStyle: dateInput,
                    style: datePicker,
                    value: startDate,
                    onChange: function (e, date) {
                        return _this.setState({ startDate: date });
                    },
                    hintText: getMessage(491),
                    autoOk: true,
                    maxDate: endDate || today,
                    defaultDate: startDate
                }),
                _react2['default'].createElement('span', { className: 'mdi mdi-close', style: dateClose, onClick: function () {
                        return _this.setState({ startDate: null });
                    } }),
                _react2['default'].createElement(_materialUi.DatePicker, {
                    textFieldStyle: dateInput,
                    style: datePicker,
                    value: endDate,
                    onChange: function (e, date) {
                        return _this.setState({ endDate: date });
                    },
                    hintText: getMessage(492),
                    autoOk: true,
                    minDate: startDate,
                    maxDate: today,
                    defaultDate: endDate
                }),
                _react2['default'].createElement('span', { className: 'mdi mdi-close', style: dateClose, onClick: function () {
                        return _this.setState({ endDate: null });
                    } })
            )
        );
    };

    return SearchDatePanel;
})(_react2['default'].Component);

var DatePickerFeed = function DatePickerFeed(_ref) {
    var pydio = _ref.pydio;
    var getMessage = _ref.getMessage;
    var children = _ref.children;

    var items = [{ payload: 'custom', text: getMessage('612') }, { payload: 'PYDIO_SEARCH_RANGE_TODAY', text: getMessage('493') }, { payload: 'PYDIO_SEARCH_RANGE_YESTERDAY', text: getMessage('494') }, { payload: 'PYDIO_SEARCH_RANGE_LAST_WEEK', text: getMessage('495') }, { payload: 'PYDIO_SEARCH_RANGE_LAST_MONTH', text: getMessage('496') }, { payload: 'PYDIO_SEARCH_RANGE_LAST_YEAR', text: getMessage('497') }];

    return children(items);
};

SearchDatePanel = PydioContextConsumer(SearchDatePanel);
DatePickerFeed = PydioContextConsumer(DatePickerFeed);
exports['default'] = SearchDatePanel;
module.exports = exports['default'];
