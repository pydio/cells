'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _jointjs = require('jointjs');

var _graphConfigs = require("../graph/Configs");

var QueryConnector = (function (_shapes$devs$Model) {
    _inherits(QueryConnector, _shapes$devs$Model);

    function QueryConnector() {
        _classCallCheck(this, QueryConnector);

        var size = { width: 10, height: 10 };

        _get(Object.getPrototypeOf(QueryConnector.prototype), 'constructor', this).call(this, {
            size: _extends({}, size),
            inPorts: ['input'],
            markup: [{
                tagName: 'circle',
                selector: 'circle'
            }],
            attrs: {
                circle: _extends({}, size, { display: 'none' })
            },
            ports: _graphConfigs.PortsConfig
        });
    }

    return QueryConnector;
})(_jointjs.shapes.devs.Model);

exports['default'] = QueryConnector;
module.exports = exports['default'];
