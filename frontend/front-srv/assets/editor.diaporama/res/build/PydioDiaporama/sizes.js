"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

function urlForSize(node, viewType) {
    if (!node) {
        return Promise.resolve("");
    }
    var meta = node.getMetadata().get("thumbnails") || [];
    var thumbs = {};
    meta.map(function (m) {
        thumbs[m.size] = m;
        if (m.id) {
            thumbs[m.id] = m;
        }
    });
    var thumbsKeys = Object.keys(thumbs);
    var def = undefined;
    if (thumbsKeys.length) {
        def = thumbs[thumbsKeys[0]].size;
    }
    switch (viewType) {
        case "preview":
            if (thumbs['sm']) {
                // There is thumb with given ID
                return thumbUrl(node, thumbs['sm'].size);
            } else if (thumbs[256]) {
                // Pick 256 by default
                return thumbUrl(node, 256);
            } else if (def) {
                // Pick first thumb found
                return thumbUrl(node, def);
            } else {
                // Return HQ
                return hqUrl(node);
            }
        case "editor":
            if (thumbs['md']) {
                return thumbUrl(node, thumbs['md'].size);
            } else if (thumbs[512]) {
                return thumbUrl(node, 512);
            } else if (def) {
                return thumbUrl(node, def);
            } else {
                return hqUrl(node);
            }
        case "hq":
            return hqUrl(node);
        default:
            return hqUrl(node);
    }
}

function thumbUrl(node, size) {
    return _pydioHttpApi2["default"].getClient().buildPresignedGetUrl(node, null, 'image/jpeg', { Bucket: 'io', Key: 'pydio-thumbstore/' + node.getMetadata().get('uuid') + '-' + size + '.jpg' });
}

function hqUrl(node) {
    return _pydioHttpApi2["default"].getClient().buildPresignedGetUrl(node, null, 'image/' + node.getAjxpMime());
}

exports["default"] = urlForSize;
module.exports = exports["default"];
