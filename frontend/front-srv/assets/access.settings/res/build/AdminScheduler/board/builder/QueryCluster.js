'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _jointjs = require('jointjs');

var _graphConfigs = require("../graph/Configs");

var QueryCluster = (function (_shapes$basic$Rect) {
    _inherits(QueryCluster, _shapes$basic$Rect);

    function QueryCluster(query) {
        _classCallCheck(this, QueryCluster);

        var typeLabel = query.Operation === 'AND' ? 'AND' : 'OR';

        _get(Object.getPrototypeOf(QueryCluster.prototype), 'constructor', this).call(this, {
            markup: [{
                tagName: 'rect',
                selector: 'rect'
            }, {
                tagName: 'rect',
                selector: 'hover-rect'
            }, {
                tagName: 'text',
                selector: 'type-label'
            }, {
                tagName: 'text',
                selector: 'swap-icon'
            }, {
                tagName: 'text',
                selector: 'add-icon'
            }, {
                tagName: 'text',
                selector: 'remove-icon'
            }, {
                tagName: 'text',
                selector: 'split-icon'
            }],
            attrs: {
                rect: { refWidth: '100%', refHeight: '100%', refY: 10, refHeight2: -20, rx: 5, ry: 5, fill: 'transparent', stroke: _graphConfigs.LightGrey, 'stroke-width': 2, strokeDasharray: '5,2', cursor: 'default' },
                'hover-rect': { refWidth: '100%', height: 20, refX: 0, refY: -10, fill: 'transparent' },
                'type-label': { text: typeLabel, fill: _graphConfigs.LightGrey, refX: '-50%', refX2: 5, refY: '-50%', 'text-anchor': 'left', cursor: 'pointer', event: 'cluster:type' },
                'swap-icon': { text: (0, _graphConfigs.IconToUnicode)('swap-horizontal'), fill: _graphConfigs.Blue, refX: '-50%', refX2: typeLabel === 'AND' ? 35 : 25, refY: '-50%', 'text-anchor': 'right', cursor: 'pointer', event: 'cluster:type' },
                'remove-icon': { text: (0, _graphConfigs.IconToUnicode)('delete'), fill: _graphConfigs.Destructive, refX: '50%', refX2: -60, refY: '-50%', 'text-anchor': 'right', cursor: 'pointer', event: 'cluster:delete' },
                'split-icon': { text: (0, _graphConfigs.IconToUnicode)('call-split'), fill: _graphConfigs.Blue, refX: '50%', refX2: -40, refY: '-50%', 'text-anchor': 'right', cursor: 'pointer', event: 'cluster:split' },
                'add-icon': { text: (0, _graphConfigs.IconToUnicode)('plus-circle-outline'), fill: _graphConfigs.Blue, refX: '50%', refX2: -20, refY: '-50%', 'text-anchor': 'right', cursor: 'pointer', event: 'cluster:add', title: 'Add condition' }
            }
        });

        this.query = query;

        if (this.query.SubQueries.length === 1) {
            this.attr('type-label/display', 'none');
            this.attr('swap-icon/display', 'none');
        }
        this.hover(false);
    }

    _createClass(QueryCluster, [{
        key: 'hover',
        value: function hover(value) {
            if (value) {
                this.attr('remove-icon/opacity', 1);
                this.attr('add-icon/opacity', 1);
                this.attr('swap-icon/opacity', 1);
                this.attr('split-icon/opacity', 1);
                this.attr('rect/stroke', _graphConfigs.Grey);
                this.attr('type-label/fill', _graphConfigs.Grey);
            } else {
                this.attr('remove-icon/opacity', 0);
                this.attr('swap-icon/opacity', 0);
                this.attr('add-icon/opacity', 0);
                this.attr('split-icon/opacity', 0);
                this.attr('rect/stroke', _graphConfigs.LightGrey);
                this.attr('type-label/fill', _graphConfigs.LightGrey);
            }
        }
    }]);

    return QueryCluster;
})(_jointjs.shapes.basic.Rect);

exports['default'] = QueryCluster;
module.exports = exports['default'];
