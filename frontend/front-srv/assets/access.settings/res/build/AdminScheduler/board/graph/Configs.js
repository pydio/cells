'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var Blue = '#2196f3';
var DarkGrey = '#424242';
var LightGrey = '#e0e0e0';
var Grey = '#9e9e9e';
var White = '#ffffff';
var Orange = '#ff9800';
var Stale = '#607D8B';

var BoxSize = { width: 150, height: 64 };

var dropShadow = {
    name: 'dropShadow',
    args: {
        opacity: 0.1,
        dx: 1,
        dy: 1,
        blur: 5
    }
};

var TextIconMarkup = [{
    tagName: 'rect',
    selector: 'rect'
}, {
    tagName: 'text',
    selector: 'icon'
}, {
    tagName: 'text',
    selector: 'text'
}];

var PortsConfig = {
    groups: {
        'in': {
            attrs: {
                '.port-body': {
                    fill: Blue,
                    stroke: 'white',
                    'stroke-width': 1.5,
                    r: 5
                },
                '.port-label': {
                    fill: White
                }
            }
        },
        'out': {
            attrs: {
                '.port-body': {
                    fill: Blue,
                    stroke: 'white',
                    'stroke-width': 1.5,
                    r: 5
                },
                '.port-label': {
                    fill: White
                }
            }
        }
    }
};

var BlueRect = { fill: Blue, rx: 5, ry: 5, 'stroke-width': 1, 'stroke': Blue, filter: dropShadow };
var WhiteRect = { fill: White, rx: 5, ry: 5, 'stroke-width': 1, 'stroke': LightGrey, filter: dropShadow };

var LightIcon = { refY: 18, refY2: 0, 'text-anchor': 'middle', refX: '50%', fill: '#e3f2fd' };
var LightLabel = { refY: '60%', refY2: 0, 'text-anchor': 'middle', refX: '50%', 'font-size': 15, fill: White, 'font-family': 'Roboto', 'font-weight': 500 };
var DarkLabel = _extends({}, LightLabel, { fill: DarkGrey });
var DarkIcon = _extends({}, LightIcon, { fill: Blue });

exports.PortsConfig = PortsConfig;
exports.TextIconMarkup = TextIconMarkup;
exports.BoxSize = BoxSize;
exports.BlueRect = BlueRect;
exports.LightLabel = LightLabel;
exports.LightIcon = LightIcon;
exports.DarkIcon = DarkIcon;
exports.WhiteRect = WhiteRect;
exports.DarkLabel = DarkLabel;
exports.Blue = Blue;
exports.Orange = Orange;
exports.LightGrey = LightGrey;
exports.Grey = Grey;
exports.Stale = Stale;
