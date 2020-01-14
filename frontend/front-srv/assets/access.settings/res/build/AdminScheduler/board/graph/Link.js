'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _jointjs = require('jointjs');

var _Configs = require("./Configs");

var Link = (function (_shapes$devs$Link) {
    _inherits(Link, _shapes$devs$Link);

    function Link(sourceId, sourcePort, targetId, targetPort) {
        var hasData = arguments.length <= 4 || arguments[4] === undefined ? true : arguments[4];

        _classCallCheck(this, Link);

        _get(Object.getPrototypeOf(Link.prototype), 'constructor', this).call(this, {
            source: {
                id: sourceId,
                port: sourcePort
            },
            target: {
                id: targetId,
                port: targetPort
            },
            attrs: (0, _Configs.linkAttr)(hasData)
        });
        /*
        connector:{
            name:'smooth'
        }
        */
        this.attr('.link-tool/display', 'none');
    }

    return Link;
})(_jointjs.shapes.devs.Link);

exports['default'] = Link;
module.exports = exports['default'];
