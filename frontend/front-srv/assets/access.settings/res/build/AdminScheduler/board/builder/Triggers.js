'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _styles = require('./styles');

var _materialUi = require('material-ui');

var _JobSchedule = require('../JobSchedule');

var _JobSchedule2 = _interopRequireDefault(_JobSchedule);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var eventMessages = {
    NODE_CHANGE: {
        '0': 'trigger.create.node',
        '1': 'trigger.read.node',
        '2': 'trigger.update.path',
        '3': 'trigger.update.content',
        '4': 'trigger.update.metadata',
        '5': 'trigger.delete.node'
    },
    IDM_CHANGE: {
        USER: {
            '0': 'trigger.create.user',
            '1': 'trigger.read.user',
            '2': 'trigger.update.user',
            '3': 'trigger.delete.user',
            '4': 'trigger.bind.user',
            '5': 'trigger.logout.user'
        },
        // TODO I18N
        ROLE: {
            '0': 'Create Role',
            '3': 'Delete Role'
        },
        WORKSPACE: {
            '0': 'Create Workspace',
            '3': 'Delete Workspace'
        },
        ACL: {
            '0': 'Create Acl',
            '3': 'Delete Acl'
        }
    }
};

var Schedule = (function (_React$Component) {
    _inherits(Schedule, _React$Component);

    function Schedule() {
        _classCallCheck(this, Schedule);

        _get(Object.getPrototypeOf(Schedule.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Schedule, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var schedule = _props.schedule;
            var onDismiss = _props.onDismiss;

            var state = _JobSchedule2['default'].parseIso8601(schedule.Iso8601Schedule);
            var scheduleString = _JobSchedule2['default'].readableString(state, Schedule.T);

            return _react2['default'].createElement(
                'div',
                null,
                scheduleString
            );
        }
    }], [{
        key: 'T',
        value: function T(id) {
            return _pydio2['default'].getMessages()['ajxp_admin.scheduler.' + id] || id;
        }
    }]);

    return Schedule;
})(_react2['default'].Component);

var Events = (function (_React$Component2) {
    _inherits(Events, _React$Component2);

    function Events() {
        _classCallCheck(this, Events);

        _get(Object.getPrototypeOf(Events.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Events, [{
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var events = _props2.events;
            var onDismiss = _props2.onDismiss;

            return _react2['default'].createElement(
                'div',
                { style: { padding: 10 } },
                events.map(function (e) {
                    return _react2['default'].createElement(
                        'div',
                        null,
                        Events.eventLabel(e, Events.T)
                    );
                })
            );
        }
    }], [{
        key: 'eventLabel',
        value: function eventLabel(e, T) {

            var parts = e.split(':');
            if (parts.length === 2 && eventMessages[parts[0]]) {
                return T(eventMessages[parts[0]][parts[1]]);
            } else if (parts.length === 3 && eventMessages[parts[0]] && eventMessages[parts[0]][parts[1]] && eventMessages[parts[0]][parts[1]][parts[2]]) {
                return T(eventMessages[parts[0]][parts[1]][parts[2]]);
            } else {
                return e;
            }
        }
    }, {
        key: 'T',
        value: function T(id) {
            return _pydio2['default'].getMessages()['ajxp_admin.scheduler.' + id] || id;
        }
    }]);

    return Events;
})(_react2['default'].Component);

var Triggers = (function (_React$Component3) {
    _inherits(Triggers, _React$Component3);

    function Triggers() {
        _classCallCheck(this, Triggers);

        _get(Object.getPrototypeOf(Triggers.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Triggers, [{
        key: 'onSwitch',
        value: function onSwitch(type) {
            var onChange = this.props.onChange;

            var data = null;
            if (type === 'manual') {
                data = [];
            } else if (type === 'schedule') {
                data = _pydioHttpRestApi.JobsSchedule.constructFromObject({ Iso8601Schedule: '' });
            }
            onChange(type, data);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props3 = this.props;
            var job = _props3.job;
            var onDismiss = _props3.onDismiss;

            var type = 'manual';
            if (job.Schedule) {
                type = 'schedule';
            } else if (job.EventNames !== undefined) {
                type = 'event';
            }
            return _react2['default'].createElement(
                _styles.RightPanel,
                { title: "Job Trigger", onDismiss: onDismiss },
                _react2['default'].createElement(
                    _materialUi.SelectField,
                    { value: type, onChange: function (e, i, v) {
                            return _this.onSwitch(v);
                        } },
                    _react2['default'].createElement(_materialUi.MenuItem, { value: "manual", primaryText: "Manual Trigger" }),
                    _react2['default'].createElement(_materialUi.MenuItem, { value: "schedule", primaryText: "Scheduled" }),
                    _react2['default'].createElement(_materialUi.MenuItem, { value: "event", primaryText: "Events" })
                ),
                _react2['default'].createElement(
                    'div',
                    null,
                    type === 'schedule' && _react2['default'].createElement(Schedule, { schedule: job.Schedule }),
                    type === 'event' && _react2['default'].createElement(Events, { events: job.EventNames || [] }),
                    type === 'manual' && _react2['default'].createElement(
                        'div',
                        null,
                        'No parameters'
                    )
                )
            );
        }
    }]);

    return Triggers;
})(_react2['default'].Component);

exports.Triggers = Triggers;
exports.Schedule = Schedule;
exports.Events = Events;
