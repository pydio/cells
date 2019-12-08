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

var TextIconFilterMarkup = [{
    tagName: 'rect',
    selector: 'rect'
}, {
    tagName: 'text',
    selector: 'icon'
}, {
    tagName: 'text',
    selector: 'text'
}, {
    tagName: 'line',
    selector: 'separator'
}, {
    tagName: 'rect',
    selector: 'filter-rect'
}, {
    tagName: 'text',
    selector: 'filter-icon'
}, {
    tagName: 'rect',
    selector: 'selector-rect'
}, {
    tagName: 'text',
    selector: 'selector-icon'
}];

var SimpleIconMarkup = [{
    tagName: 'rect',
    selector: 'rect'
}, {
    tagName: 'text',
    selector: 'icon'
}];

var ClusterConfig = {
    size: { width: 420, height: 104 },
    attrs: { rect: { width: 420, height: 104, rx: 5, ry: 5, fill: 'transparent', stroke: LightGrey, 'stroke-width': 2, strokeDasharray: '5,2' } }
};

var PortsConfig = {
    groups: {
        'in': {
            attrs: {
                '.port-body': {
                    fill: Blue,
                    stroke: 'white',
                    'stroke-width': 1.5,
                    r: 5,
                    magnet: 'passive'
                },
                '.port-label': {
                    display: 'none',
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
                    display: 'none',
                    fill: White
                }
            }
        }
    }
};

var unicodesCache = {};

/**
 * @param iconName
 * @return String unicode character for this mdi icon
 * @constructor
 */
function IconToUnicode(iconName) {
    if (unicodesCache[iconName]) {
        return unicodesCache[iconName];
    }
    try {
        var el = document.createElement('span');
        el.className = 'mdi mdi-' + iconName;
        el.style = 'visibility:hidden';
        var body = document.getElementsByTagName('body').item(0);
        body.appendChild(el);
        var uCode = window.getComputedStyle(el, ':before').getPropertyValue('content');
        body.removeChild(el);
        unicodesCache[iconName] = uCode.replace(/"/g, '');
        return unicodesCache[iconName];
    } catch (e) {
        console.warn('cannot find unicode for icon ' + iconName, 'Displaying Help icon', e);
        return '';
    }
}

function positionFilters(model, originalBox, filter, selector) {
    var anchor = arguments.length <= 4 || arguments[4] === undefined ? 'left' : arguments[4];

    if (!selector && !filter) {
        model.resize(originalBox.width, originalBox.height);
        model.attr({
            rect: _extends({}, originalBox),
            icon: { refX: LightIcon.refX, refX2: 0 },
            text: { refX: LightLabel.refX, refX2: 0 },
            'separator': { display: 'none' },
            'filter-rect': { display: 'none' },
            'filter-icon': { display: 'none' },
            'selector-rect': { display: 'none' },
            'selector-icon': { display: 'none' }
        });
        return;
    }
    // General resize
    var newBox = { width: 180, height: originalBox.height };
    model.resize(newBox.width, newBox.height);
    model.attr({
        rect: _extends({}, newBox),
        icon: { refX: anchor === 'left' ? 20 : -20, refX2: '50%' },
        text: { refX: anchor === 'left' ? 20 : -20, refX2: '50%' },
        'separator': { display: 'initial' }
    });
    // Position filter boxes
    var multiple = selector && filter;

    var position = undefined;
    position = function (i) {
        return {
            rect: { display: 'initial', refY: '50%', refY2: i * 14 - 12 },
            icon: { display: 'initial', refY: '50%', refY2: i * 14 - 3 }
        };
    };
    var filterPosition = undefined,
        selectorPosition = undefined;
    var hide = { rect: { display: 'none' }, icon: { display: 'none' } };
    if (multiple) {
        filterPosition = position(-1);
        selectorPosition = position(1);
    } else if (filter) {
        filterPosition = position(0);
        selectorPosition = hide;
    } else if (selector) {
        filterPosition = hide;
        selectorPosition = position(0);
    }
    model.attr({
        'filter-rect': filterPosition.rect,
        'filter-icon': filterPosition.icon,
        'selector-rect': selectorPosition.rect,
        'selector-icon': selectorPosition.icon
    });
}

var BlueRect = { fill: Blue, rx: 5, ry: 5, 'stroke-width': 1, 'stroke': Blue, filter: dropShadow };
var WhiteRect = { fill: White, rx: 5, ry: 5, 'stroke-width': 1, 'stroke': LightGrey, filter: dropShadow };

var LightIcon = { refY: 18, refY2: 0, 'text-anchor': 'middle', refX: '50%', fill: '#e3f2fd' };
var LightLabel = { refY: '60%', refY2: 0, 'text-anchor': 'middle', refX: '50%', 'font-size': 15, fill: White, 'font-family': 'Roboto', 'font-weight': 500, magnet: false };
var DarkLabel = _extends({}, LightLabel, { fill: DarkGrey });
var DarkIcon = _extends({}, LightIcon, { fill: Blue });

exports.PortsConfig = PortsConfig;
exports.ClusterConfig = ClusterConfig;
exports.TextIconMarkup = TextIconMarkup;
exports.TextIconFilterMarkup = TextIconFilterMarkup;
exports.SimpleIconMarkup = SimpleIconMarkup;
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
exports.DarkGrey = DarkGrey;
exports.Stale = Stale;
exports.IconToUnicode = IconToUnicode;
exports.positionFilters = positionFilters;
