'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _jointjs = require('jointjs');

var _Configs = require("./Configs");

var JobInput = (function (_shapes$devs$Model) {
    _inherits(JobInput, _shapes$devs$Model);

    function JobInput(job) {
        _classCallCheck(this, JobInput);

        var label = 'Manual Trigger';
        var icon = (0, _Configs.IconToUnicode)('gesture-tap');
        var largeBoxWidth = 180;

        _get(Object.getPrototypeOf(JobInput.prototype), 'constructor', this).call(this, {
            size: _extends({}, _Configs.BoxSize),
            inPorts: [],
            outPorts: ['output'],
            markup: _Configs.TextIconFilterMarkup,
            attrs: {
                rect: _extends({}, _Configs.BoxSize, _Configs.WhiteRect),
                icon: _extends({ text: icon }, _Configs.DarkIcon),
                text: _extends({ text: label, magnet: 'passive' }, _Configs.DarkLabel),
                'separator': { display: 'none', x1: largeBoxWidth - 44, y1: 0, x2: largeBoxWidth - 44, y2: _Configs.BoxSize.height, stroke: _Configs.LightGrey, 'stroke-width': 1.5, 'stroke-dasharray': '3 3' },
                'filter-rect': { display: 'none', fill: _Configs.Orange, refX: largeBoxWidth - 34, refY: '50%', refY2: -12, width: 24, height: 24, rx: 12, ry: 12, event: 'element:filter:pointerdown' },
                'filter-icon': _extends({ display: 'none', text: (0, _Configs.IconToUnicode)('filter') }, _Configs.LightIcon, { fill: 'white', refX: largeBoxWidth - 22, refY: '50%', refY2: -3, event: 'element:filter:pointerdown' }),
                'selector-rect': { display: 'none', fill: _Configs.Orange, refX: largeBoxWidth - 34, refY: '50%', refY2: -12, width: 24, height: 24, rx: 12, ry: 12, event: 'element:selector:pointerdown' },
                'selector-icon': _extends({ display: 'none', text: (0, _Configs.IconToUnicode)('magnify') }, _Configs.LightIcon, { fill: 'white', refX: largeBoxWidth - 22, refY: '50%', refY2: -3, event: 'element:selector:pointerdown' })
            },
            ports: _Configs.PortsConfig
        });
        this.notifyJobModel(job);
    }

    _createClass(JobInput, [{
        key: 'notifyJobModel',
        value: function notifyJobModel(job) {
            this.setFilter(false);
            this.setSelector(false);
            if (job.NodeEventFilter || job.IdmFilter || job.UserEventFilter) {
                this.setFilter(true);
            }
            if (job.NodesSelector || job.IdmSelector || job.UsersSelector) {
                this.setSelector(true);
            }

            var label = 'Manual Trigger';
            var icon = (0, _Configs.IconToUnicode)('gesture-tap');
            if (job.EventNames) {
                var parts = job.EventNames[0].split(":");
                var eventType = parts.shift();
                if (eventType === 'IDM_CHANGE') {
                    eventType = parts.shift().toLowerCase();
                    eventType = eventType.charAt(0).toUpperCase() + eventType.slice(1);
                } else {
                    eventType = 'Node';
                }
                label = eventType + ' Events';
                // mdi-pulse
                icon = (0, _Configs.IconToUnicode)('pulse');
            } else if (job.Schedule) {
                //label = 'Schedule\n\n' + job.Schedule.Iso8601Schedule;
                label = 'Schedule';
                // mdi-clock
                icon = (0, _Configs.IconToUnicode)('clock');
            }

            this.attr('icon/text', icon);
            this.attr('text/text', label);
            job.model = this;
        }
    }, {
        key: 'clearSelection',
        value: function clearSelection() {
            this.attr('rect/stroke', _Configs.LightGrey);
            this.attr('filter-rect/stroke', 'transparent');
            this.attr('selector-rect/stroke', 'transparent');
        }
    }, {
        key: 'select',
        value: function select() {
            this.attr('rect/stroke', _Configs.Orange);
        }
    }, {
        key: 'selectFilter',
        value: function selectFilter() {
            this.attr('filter-rect/stroke', _Configs.Orange);
        }
    }, {
        key: 'selectSelector',
        value: function selectSelector() {
            this.attr('selector-rect/stroke', _Configs.Orange);
        }
    }, {
        key: 'setFilter',
        value: function setFilter(b) {
            this._rightFilter = b;
            (0, _Configs.positionFilters)(this, _Configs.BoxSize, this._rightFilter, this._rightSelector, 'right');
        }
    }, {
        key: 'setSelector',
        value: function setSelector(b) {
            this._rightSelector = b;
            (0, _Configs.positionFilters)(this, _Configs.BoxSize, this._rightFilter, this._rightSelector, 'right');
        }
    }]);

    return JobInput;
})(_jointjs.shapes.devs.Model);

exports['default'] = JobInput;
module.exports = exports['default'];
