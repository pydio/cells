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

var ActionFilter = (function (_shapes$devs$Model) {
    _inherits(ActionFilter, _shapes$devs$Model);

    function ActionFilter(action) {
        _classCallCheck(this, ActionFilter);

        _get(Object.getPrototypeOf(ActionFilter.prototype), 'constructor', this).call(this, {
            size: _extends({}, _Configs.FilterBoxSize),
            markup: _Configs.TextIconMarkup,
            attrs: {
                rect: _extends({}, _Configs.FilterBoxSize, {
                    rx: 5, ry: 5, fill: 'white', 'stroke-width': 1.5, 'stroke': _Configs.LightGrey,
                    'style': 'transform: rotate(45deg) translate(19px, -26px) scale(0.8)', filter: _Configs.DropShadow,
                    event: 'element:filter:pointerdown'
                }),
                icon: _extends({ text: (0, _Configs.IconToUnicode)('filter') }, _Configs.DarkIcon, { fill: _Configs.Orange, refY: 20, event: 'element:filter:pointerdown' }),
                text: _extends({ text: 'Conditions' }, _Configs.DarkLabel, { 'font-size': 11, event: 'element:filter:pointerdown' })
            },
            inPorts: ['input'],
            outPorts: ['output'],
            ports: _Configs.FilterPortsConfig
        });
        this.addPort({ group: 'negate', id: 'negate' });
        this.action = action;
    }

    _createClass(ActionFilter, [{
        key: 'selectFilter',
        value: function selectFilter() {
            this.select();
        }
    }, {
        key: 'clearSelection',
        value: function clearSelection() {
            this.attr('rect/stroke', _Configs.LightGrey);
        }
    }, {
        key: 'select',
        value: function select() {
            this.attr('rect/stroke', _Configs.Orange);
        }
    }, {
        key: 'getJobsAction',
        value: function getJobsAction() {
            return this.action;
        }
    }]);

    return ActionFilter;
})(_jointjs.shapes.devs.Model);

exports['default'] = ActionFilter;
module.exports = exports['default'];
