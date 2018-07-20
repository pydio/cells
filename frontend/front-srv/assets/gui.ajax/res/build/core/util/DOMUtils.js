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
 * The latest code can be found at <https://pydio.com/>.
 *
 */
/**
 * Utilitary class for language specific methods
 */
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var DOMUtils = (function () {
    function DOMUtils() {
        _classCallCheck(this, DOMUtils);
    }

    DOMUtils.getBeziersTransition = function getBeziersTransition() {
        return 'all 550ms cubic-bezier(0.23, 1, 0.32, 1) 0ms';
    };

    DOMUtils.getBoxShadowDepth = function getBoxShadowDepth() {
        var depth = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

        return '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)';
    };

    DOMUtils.getUrlFromBase = function getUrlFromBase() {
        return document.getElementsByTagName('base').length ? document.getElementsByTagName('base')[0].href : '';
    };

    DOMUtils.getViewportWidth = function getViewportWidth() {
        return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    };

    DOMUtils.getViewportHeight = function getViewportHeight() {
        return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    };

    DOMUtils.imageLoader = function imageLoader(imageUrl, onLoad, onError) {
        var loader = document.createElement('img');
        loader.onload = onLoad.bind(loader);
        loader.onerror = onError.bind(loader);
        loader.src = imageUrl;
    };

    DOMUtils.observeWindowResize = function observeWindowResize(callback) {
        if (window.addEventListener) {
            window.addEventListener('resize', callback);
        } else {
            window.attachEvent('onresize', callback);
        }
    };

    DOMUtils.stopObservingWindowResize = function stopObservingWindowResize(callback) {
        if (window.removeEventListener) {
            window.removeEventListener('resize', callback);
        } else {
            window.detachEvent('onresize', callback);
        }
    };

    return DOMUtils;
})();

exports['default'] = DOMUtils;
module.exports = exports['default'];
