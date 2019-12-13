'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _jointjs = require('jointjs');

var _graphConfigs = require("../graph/Configs");

var Query = (function (_shapes$devs$Model) {
    _inherits(Query, _shapes$devs$Model);

    function Query(proto, fieldName) {
        var parentQuery = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
        var isNot = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

        _classCallCheck(this, Query);

        var size = { width: 180, height: 40 };

        var typeLabel = fieldName;
        if (proto) {
            var fieldValue = proto.value[fieldName];
            if (fieldValue) {
                typeLabel = fieldName + (isNot ? ' != ' : ' = ') + fieldValue;
            }
        }
        if (typeLabel.length > 22) {
            typeLabel = typeLabel.substr(0, 19) + '...';
        }

        _get(Object.getPrototypeOf(Query.prototype), 'constructor', this).call(this, {
            size: _extends({}, size),
            inPorts: ['input'],
            outPorts: ['output'],
            markup: [{ tagName: 'rect', selector: 'body' }, { tagName: 'text', selector: 'label' }, { tagName: 'text', selector: 'remove-icon' }],
            attrs: {
                'body': _extends({}, size, _graphConfigs.WhiteRect, { event: 'query:select' }),
                'label': { text: typeLabel, magnet: false, refX: 12, refY: '50%', refY2: -8, fill: _graphConfigs.DarkGrey, 'text-anchor': 'left', 'font-size': 15, 'font-family': 'Roboto', 'font-weight': 500, event: 'query:select' },
                'remove-icon': { text: (0, _graphConfigs.IconToUnicode)('delete'), magnet: false, refX: '100%', refX2: -28, refY: '50%', refY2: -6, cursor: 'pointer', event: 'query:delete', fill: _graphConfigs.Destructive, 'font-size': 15, 'font-family': 'Roboto', 'font-weight': 500 }
            },
            ports: _graphConfigs.PortsConfig
        });

        if (!proto) {
            this.attr('remove-icon/text', (0, _graphConfigs.IconToUnicode)('plus-circle-outline'));
            this.attr('remove-icon/fill', _graphConfigs.Blue);
            this.attr('remove-icon/event', 'root:add');
        } else {
            this.attr('remove-icon/opacity', 0);
        }

        this.proto = proto;
        this.fieldName = fieldName;
        this.parentQuery = parentQuery;
    }

    _createClass(Query, [{
        key: 'select',
        value: function select() {
            this.attr('body/stroke', _graphConfigs.Orange);
        }
    }, {
        key: 'deselect',
        value: function deselect() {
            this.attr('body/stroke', _graphConfigs.LightGrey);
        }
    }, {
        key: 'hover',
        value: function hover(value) {
            if (!this.proto) {
                return;
            }
            if (value) {
                this.attr('remove-icon/opacity', 1);
            } else {
                this.attr('remove-icon/opacity', 0);
            }
        }
    }]);

    return Query;
})(_jointjs.shapes.devs.Model);

exports['default'] = Query;
module.exports = exports['default'];
