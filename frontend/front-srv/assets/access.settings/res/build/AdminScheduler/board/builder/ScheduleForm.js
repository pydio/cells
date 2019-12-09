/*
 * Copyright 2007-2019 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _materialUi = require('material-ui');

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var moment = _Pydio$requireLib.moment;

var ScheduleForm = (function (_React$Component) {
    _inherits(ScheduleForm, _React$Component);

    function ScheduleForm(props) {
        _classCallCheck(this, ScheduleForm);

        _get(Object.getPrototypeOf(ScheduleForm.prototype), 'constructor', this).call(this, props);
        var schedule = props.schedule;

        if (schedule.Iso8601Schedule) {
            this.state = ScheduleForm.parseIso8601(schedule.Iso8601Schedule);
        } else {
            this.state = { frequency: 'daily', daytime: new Date() };
        }
    }

    _createClass(ScheduleForm, [{
        key: 'onUpdate',
        value: function onUpdate() {
            var _props = this.props;
            var schedule = _props.schedule;
            var onChange = _props.onChange;

            schedule.Iso8601Schedule = ScheduleForm.makeIso8601FromState(this.state);
            onChange(schedule);
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            if (prevState !== this.state) {
                this.onUpdate();
            }
        }
    }, {
        key: 'T',
        value: function T(id) {
            return _pydio2['default'].getMessages()['ajxp_admin.scheduler.' + id] || id;
        }
    }, {
        key: 'changeFrequency',
        value: function changeFrequency(f) {
            var _state = this.state;
            var monthday = _state.monthday;
            var weekday = _state.weekday;
            var daytime = _state.daytime;
            var everyminutes = _state.everyminutes;

            if (monthday === undefined) {
                monthday = 1;
            }
            if (weekday === undefined) {
                weekday = 1;
            }
            if (daytime === undefined) {
                daytime = moment();
                daytime.year(2012);
                daytime.hours(9);
                daytime.minutes(0);
                daytime = daytime.toDate();
            }
            if (everyminutes === undefined) {
                everyminutes = 15;
            }
            this.setState({ frequency: f, monthday: monthday, weekday: weekday, daytime: daytime, everyminutes: everyminutes });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var edit = this.props.edit;

            if (!edit) {
                return _react2['default'].createElement(
                    'div',
                    null,
                    ScheduleForm.readableString(this.state, this.T, true)
                );
            }
            var _state2 = this.state;
            var frequency = _state2.frequency;
            var monthday = _state2.monthday;
            var weekday = _state2.weekday;
            var daytime = _state2.daytime;
            var everyminutes = _state2.everyminutes;

            var monthdays = [];
            var weekdays = moment.weekdays();
            for (var i = 1; i < 30; i++) {
                monthdays.push(i);
            }
            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: { color: '#212121' } },
                        ScheduleForm.readableString(this.state, this.T, false)
                    ),
                    frequency !== 'manual' && _react2['default'].createElement(
                        'div',
                        { style: { fontSize: 11, paddingTop: 5 } },
                        'ISO8601: ',
                        ScheduleForm.makeIso8601FromState(this.state)
                    )
                ),
                _react2['default'].createElement(
                    _materialUi.SelectField,
                    {
                        floatingLabelText: this.T('schedule.type'),
                        value: frequency,
                        onChange: function (e, i, val) {
                            _this.changeFrequency(val);
                        },
                        fullWidth: true
                    },
                    _react2['default'].createElement(_materialUi.MenuItem, { value: 'manual', primaryText: this.T('schedule.type.manual') }),
                    _react2['default'].createElement(_materialUi.MenuItem, { value: 'monthly', primaryText: this.T('schedule.type.monthly') }),
                    _react2['default'].createElement(_materialUi.MenuItem, { value: 'weekly', primaryText: this.T('schedule.type.weekly') }),
                    _react2['default'].createElement(_materialUi.MenuItem, { value: 'daily', primaryText: this.T('schedule.type.daily') }),
                    _react2['default'].createElement(_materialUi.MenuItem, { value: 'timely', primaryText: this.T('schedule.type.timely') })
                ),
                frequency === 'monthly' && _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        _materialUi.SelectField,
                        {
                            floatingLabelText: this.T('schedule.detail.monthday'),
                            value: monthday,
                            onChange: function (e, i, val) {
                                _this.setState({ monthday: val });
                            },
                            fullWidth: true
                        },
                        monthdays.map(function (d) {
                            return _react2['default'].createElement(_materialUi.MenuItem, { value: d, primaryText: d });
                        })
                    )
                ),
                frequency === 'weekly' && _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        _materialUi.SelectField,
                        {
                            floatingLabelText: this.T('schedule.detail.weekday'),
                            value: weekday,
                            onChange: function (e, i, val) {
                                _this.setState({ weekday: val });
                            },
                            fullWidth: true
                        },
                        weekdays.map(function (d, i) {
                            return _react2['default'].createElement(_materialUi.MenuItem, { value: i, primaryText: d });
                        })
                    )
                ),
                (frequency === 'daily' || frequency === 'monthly' || frequency === 'weekly') && _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_materialUi.TimePicker, {
                        format: 'ampm',
                        minutesStep: 5,
                        floatingLabelText: this.T('schedule.detail.daytime'),
                        value: daytime,
                        onChange: function (e, v) {
                            _this.setState({ daytime: v });
                        },
                        fullWidth: true
                    })
                ),
                frequency === 'timely' && _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_materialUi.TextField, {
                        floatingLabelText: this.T('schedule.detail.minutes'),
                        value: everyminutes,
                        type: "number",
                        onChange: function (e, val) {
                            _this.setState({ everyminutes: parseInt(val) });
                        },
                        fullWidth: true
                    })
                )
            );
        }
    }], [{
        key: 'parseIso8601',
        value: function parseIso8601(value) {
            if (value === '' || value.indexOf('/') === -1) {
                return { frequency: 'manual' };
            }

            var _value$split = value.split('/');

            var _value$split2 = _slicedToArray(_value$split, 3);

            var R = _value$split2[0];
            var d = _value$split2[1];
            var i = _value$split2[2];

            var startDate = new Date(d);
            if (i === 'P1M') {
                return { frequency: 'monthly', monthday: startDate.getDate(), daytime: startDate };
            } else if (i === 'P7D') {
                var m = moment(startDate);
                return { frequency: 'weekly', weekday: m.day(), daytime: startDate };
            } else if (i === 'PT24H' || i === 'P1D') {
                return { frequency: 'daily', daytime: startDate };
            } else {
                var _d = moment.duration(i);
                if (_d.isValid()) {
                    var minutes = _d.minutes() + _d.hours() * 60;
                    return { frequency: 'timely', everyminutes: minutes };
                } else {
                    return { error: 'Cannot parse value ' + value };
                }
            }
        }
    }, {
        key: 'makeIso8601FromState',
        value: function makeIso8601FromState(state) {
            var frequency = state.frequency;
            var monthday = state.monthday;
            var weekday = state.weekday;
            var daytime = state.daytime;
            var everyminutes = state.everyminutes;

            var startDate = new Date('2012-01-01T00:00:00.828696-07:00');
            var duration = moment.duration(0);
            switch (frequency) {
                case "manual":
                    return "";
                case "monthly":
                    if (daytime) {
                        startDate.setTime(daytime.getTime());
                    }
                    startDate.setDate(monthday || 1);
                    duration = moment.duration(1, 'months');
                    break;
                case "weekly":
                    if (daytime) {
                        startDate.setTime(daytime.getTime());
                    }
                    var m = moment(startDate);
                    m.day(weekday === undefined ? 1 : weekday);
                    startDate = m.toDate();
                    duration = moment.duration(7, 'days');
                    break;
                case "daily":
                    if (daytime) {
                        startDate.setTime(daytime.getTime());
                    }
                    duration = moment.duration(24, 'hours');
                    break;
                case "timely":
                    duration = moment.duration(everyminutes, 'minutes');
                    break;
                default:
                    break;
            }
            return 'R/' + moment(startDate).toISOString() + '/' + duration.toISOString();
        }
    }, {
        key: 'readableString',
        value: function readableString(state, T) {
            var short = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
            var frequency = state.frequency;
            var monthday = state.monthday;
            var weekday = state.weekday;
            var daytime = state.daytime;
            var everyminutes = state.everyminutes;

            var dTRead = '0:00';
            if (daytime) {
                dTRead = moment(daytime).format('h:mm');
            }
            switch (frequency) {
                case "manual":
                    return T("trigger.manual");
                case "monthly":
                    if (short) {
                        return T("schedule.monthly.short").replace('%1', monthday);
                    } else {
                        return T("schedule.monthly").replace('%1', monthday).replace('%2', dTRead);
                    }
                case "weekly":
                    if (short) {
                        return T("schedule.weekly.short").replace('%1', moment.weekdays()[weekday]);
                    } else {
                        return T("schedule.weekly").replace('%1', moment.weekdays()[weekday]).replace('%2', dTRead);
                    }
                case "daily":
                    if (short) {
                        return T("schedule.daily.short").replace('%1', dTRead);
                    } else {
                        return T("schedule.daily").replace('%1', dTRead);
                    }
                case "timely":
                    var duration = moment.duration(everyminutes, 'minutes');
                    return T("schedule.timely").replace('%1', (duration.hours() ? duration.hours() + 'h' : '') + (duration.minutes() ? duration.minutes() + 'mn' : ''));
                default:
                    return "Error";
            }
        }
    }]);

    return ScheduleForm;
})(_react2['default'].Component);

exports['default'] = ScheduleForm;
module.exports = exports['default'];
