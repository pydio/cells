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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _pydioUtilXml = require('pydio/util/xml');

var _pydioUtilXml2 = _interopRequireDefault(_pydioUtilXml);

var _pydioUtilDom = require('pydio/util/dom');

var _pydioUtilDom2 = _interopRequireDefault(_pydioUtilDom);

var BackgroundImage = (function () {
    function BackgroundImage() {
        _classCallCheck(this, BackgroundImage);
    }

    /**
     *
     * @param pydio {Pydio}
     * @param configName string
     * @return {*}
     */

    BackgroundImage.computeBackgroundFromConfigs = function computeBackgroundFromConfigs(pydio, configName) {

        var bgrounds = undefined,
            paramPrefix = undefined,
            bStyles = undefined,
            index = undefined,
            i = undefined;

        var exp = configName.split("/");
        var plugin = exp[0];
        paramPrefix = exp[1];
        var registry = pydio.getXmlRegistry();
        var configs = _pydioUtilXml2['default'].XPathSelectNodes(registry, "plugins/*[@id='" + plugin + "']/plugin_configs/property[contains(@name, '" + paramPrefix + "')]");
        var defaults = _pydioUtilXml2['default'].XPathSelectNodes(registry, "plugins/*[@id='" + plugin + "']/server_settings/global_param[contains(@name, '" + paramPrefix + "')]");

        var windowWidth = _pydioUtilDom2['default'].getViewportWidth();
        var isRetina = matchMedia("(-webkit-min-device-pixel-ratio: 2), (min-device-pixel-ratio: 2), (min-resolution: 192dpi)").matches;
        var resize = 0;
        if (windowWidth <= 600) {
            resize = 800;
            if (isRetina) {
                resize = 1200;
            }
        } else if (windowWidth <= 1200 && !isRetina) {
            resize = 1200;
        }

        bgrounds = {};
        configs.map(function (c) {
            bgrounds[c.getAttribute("name")] = c.firstChild.nodeValue.replace(/"/g, '');
        });

        defaults.map(function (d) {
            if (!d.getAttribute('defaultImage')) {
                return;
            }
            var n = d.getAttribute("name");
            if (bgrounds[n]) {
                if (_pydioUtilPath2['default'].getBasename(bgrounds[n]) === bgrounds[n]) {
                    bgrounds[n] = pydio.Parameters.get('ENDPOINT_REST_API') + "/frontend/binaries/GLOBAL/" + bgrounds[n];
                    if (resize) {
                        bgrounds[n] += '?dim=' + resize;
                    }
                }
            } else {
                bgrounds[n] = d.getAttribute("defaultImage");
                if (resize) {
                    var dir = _pydioUtilPath2['default'].getDirname(bgrounds[n]);
                    var base = _pydioUtilPath2['default'].getBasename(bgrounds[n]);
                    bgrounds[n] = dir + '/' + resize + '/' + base;
                }
            }
        });
        bStyles = [];
        index = 1;
        while (bgrounds[paramPrefix + index]) {
            bStyles.push({
                backgroundImage: "url('" + bgrounds[paramPrefix + index] + "')",
                backgroundSize: "cover",
                backgroundPosition: "center center"
            });
            index++;
        }

        if (bStyles.length) {
            i = Math.floor(Math.random() * bStyles.length);
            return bStyles[i];
        }
        return {};
    };

    return BackgroundImage;
})();

exports['default'] = BackgroundImage;
module.exports = exports['default'];
