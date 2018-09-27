/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _editorActions = require('./editor/actions');

var EditorActions = _interopRequireWildcard(_editorActions);

var _contentActions = require('./content/actions');

var contentActions = _interopRequireWildcard(_contentActions);

var _resolutionActions = require('./resolution/actions');

var resolutionActions = _interopRequireWildcard(_resolutionActions);

var _selectionActions = require('./selection/actions');

var selectionActions = _interopRequireWildcard(_selectionActions);

var _sizeActions = require('./size/actions');

var sizeActions = _interopRequireWildcard(_sizeActions);

var _localisationActions = require('./localisation/actions');

var localisationActions = _interopRequireWildcard(_localisationActions);

exports.EditorActions = EditorActions;

var defaultActions = _extends({}, contentActions, resolutionActions, selectionActions, sizeActions, localisationActions);

// Helper functions
var getActions = function getActions(_ref) {
    var editorData = _ref.editorData;
    return editorData.editorActions && FuncUtils.getFunctionByName(editorData.editorActions, window) || {};
};

var handler = function handler(func, _ref2) {
    var dispatch = _ref2.dispatch;
    var tab = _ref2.tab;

    var fn = getActions(tab)[func];
    return typeof fn === "function" && fn({ dispatch: dispatch, tab: tab });
};

exports.handler = handler;
var toTitleCase = function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return '' + txt.charAt(0).toUpperCase() + txt.substr(1);
    });
};

exports.toTitleCase = toTitleCase;
var getDisplayName = function getDisplayName(Component) {
    return Component.displayName || Component.name || 'Component';
};

exports.getDisplayName = getDisplayName;
var getRatio = {
    cover: function cover(_ref3) {
        var widthRatio = _ref3.widthRatio;
        var heightRatio = _ref3.heightRatio;
        return Math.max(widthRatio, heightRatio);
    },
    contain: function contain(_ref4) {
        var widthRatio = _ref4.widthRatio;
        var heightRatio = _ref4.heightRatio;
        return Math.min(widthRatio, heightRatio);
    },
    auto: function auto(_ref5) {
        var scale = _ref5.scale;
        return scale;
    }
};

exports.getRatio = getRatio;
var getBoundingRect = function getBoundingRect(element) {

    var style = window.getComputedStyle(element);
    var keys = ["left", "right", "top", "bottom"];

    var margin = keys.reduce(function (current, key) {
        var _extends2;

        return _extends({}, current, (_extends2 = {}, _extends2[key] = parseInt(style['margin-' + key]) || 0, _extends2));
    }, {});
    var padding = keys.reduce(function (current, key) {
        var _extends3;

        return _extends({}, current, (_extends3 = {}, _extends3[key] = parseInt(style['padding-' + key]) || 0, _extends3));
    }, {});
    var border = keys.reduce(function (current, key) {
        var _extends4;

        return _extends({}, current, (_extends4 = {}, _extends4[key] = parseInt(style['border-' + key]) || 0, _extends4));
    }, {});

    var rect = element.getBoundingClientRect();

    var res = {
        left: rect.left - margin.left,
        right: rect.right - margin.right - padding.left - padding.right,
        top: rect.top - margin.top,
        bottom: rect.bottom - margin.bottom - padding.top - padding.bottom - border.bottom
    };

    return _extends({}, res, {
        width: res.right - res.left,
        height: res.bottom - res.top
    });
};
exports.getBoundingRect = getBoundingRect;
