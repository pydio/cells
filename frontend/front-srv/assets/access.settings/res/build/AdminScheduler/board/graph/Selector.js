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

var Selector = (function (_shapes$devs$Model) {
    _inherits(Selector, _shapes$devs$Model);

    function Selector(filterDefinition, filterType) {
        _classCallCheck(this, Selector);

        var typeLabel = filterType;
        if (filterType === 'idm') {
            typeLabel = filterDefinition.Type + 's';
        } else if (filterType === 'user') {
            typeLabel = 'Users';
        } else {
            typeLabel = 'Nodes';
        }

        _get(Object.getPrototypeOf(Selector.prototype), 'constructor', this).call(this, {
            size: _extends({}, _Configs.BoxSize, { fill: 'transparent', rx: 5, ry: 5, 'stroke-width': 1.5, 'stroke': '#31d0c6' }),
            inPorts: ['input'],
            outPorts: ['output'],
            markup: _Configs.TextIconMarkup,
            attrs: {
                rect: _extends({}, _Configs.BoxSize, _Configs.WhiteRect),
                icon: _extends({ text: (0, _Configs.IconToUnicode)('magnify') }, _Configs.DarkIcon, { fill: _Configs.Orange }),
                text: _extends({ text: 'Select ' + typeLabel, magnet: false }, _Configs.DarkLabel)
            },
            ports: _Configs.PortsConfig
        });
        this._jobModel = filterDefinition;
        this._filterType = filterType;
    }

    _createClass(Selector, [{
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
        key: 'getSelectorType',
        value: function getSelectorType() {
            return this._filterType;
        }
    }, {
        key: 'getSelector',
        value: function getSelector() {
            return this._jobModel;
        }
    }]);

    return Selector;
})(_jointjs.shapes.devs.Model);

exports['default'] = Selector;
module.exports = exports['default'];
