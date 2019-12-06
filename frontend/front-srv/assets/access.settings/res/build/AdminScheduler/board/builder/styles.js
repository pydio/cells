'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _graphConfigs = require("../graph/Configs");

var styles = {
    paper: {
        position: 'absolute',
        zIndex: 2,
        border: '2px solid #ffcc8f', // + Orange,
        borderRadius: 5
    },
    header: {
        padding: 10,
        fontSize: 15,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center'
    },
    body: {
        padding: 10
    },
    close: {
        color: '#9e9e9e',
        cursor: 'pointer'
    }
};

function position(width, sourceSize, sourcePosition, scrollLeft) {

    var top = undefined,
        left = undefined;
    left = sourcePosition.x + (sourceSize.width - width) / 2 - scrollLeft;
    top = sourcePosition.y + sourceSize.height + 10;
    return { top: top, left: left, width: width };
}

exports.styles = styles;
exports.position = position;
