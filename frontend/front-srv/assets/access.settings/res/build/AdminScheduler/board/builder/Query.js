'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _jointjs = require('jointjs');

var _graphConfigs = require("../graph/Configs");

var Query = (function (_shapes$devs$Model) {
    _inherits(Query, _shapes$devs$Model);

    function Query(fieldName) {
        var fieldValue = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

        _classCallCheck(this, Query);

        var size = { width: 140, height: 40 };

        var typeLabel = fieldName;
        if (fieldValue) {
            typeLabel = fieldName + ': ' + fieldValue;
        }
        if (typeLabel.length > 20) {
            typeLabel = typeLabel.substr(0, 17) + '...';
        }

        _get(Object.getPrototypeOf(Query.prototype), 'constructor', this).call(this, {
            size: _extends({}, size),
            inPorts: ['input'],
            outPorts: ['output'],
            attrs: {
                '.body': _extends({}, size, _graphConfigs.WhiteRect),
                '.label': { text: typeLabel, magnet: false, refY: 2, fill: _graphConfigs.DarkGrey, 'text-anchor': 'middle', 'font-size': 15, 'font-family': 'Roboto', 'font-weight': 500 }
            },
            ports: _graphConfigs.PortsConfig
        });
    }

    return Query;
})(_jointjs.shapes.devs.Model);

exports['default'] = Query;
module.exports = exports['default'];
