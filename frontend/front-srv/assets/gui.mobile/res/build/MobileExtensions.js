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

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _smartAppBanner = require("smart-app-banner");

var _smartAppBanner2 = _interopRequireDefault(_smartAppBanner);

var _require$requireLib = require('pydio').requireLib('boot');

var PydioContextConsumer = _require$requireLib.PydioContextConsumer;

var MobileExtensions = (function (_Component) {
    _inherits(MobileExtensions, _Component);

    function MobileExtensions() {
        _classCallCheck(this, MobileExtensions);

        _get(Object.getPrototypeOf(MobileExtensions.prototype), "constructor", this).apply(this, arguments);
    }

    _createClass(MobileExtensions, [{
        key: "componentDidMount",
        value: function componentDidMount() {

            // @TODO
            // PASS THIS URL TO THE NATIVE APP FOR AUTO REGISTRATION OF THE SERVER
            /*
            var currentHref = document.location.href;
            $("ajxpserver-redir").href = cleanURL(currentHref).replace("http://", "ajxpserver://").replace("https://", "ajxpservers://");
            if(currentHref.indexOf("#") > -1){
                currentHref = currentHref.substr(0, currentHref.indexOf("#"));
            }
             */
            var pydio = this.props.pydio;

            var configs = pydio.getPluginConfigs("gui.mobile");
            if (configs.get('IOS_APP_ID') && configs.get('IOS_APP_ICON')) {
                var meta = document.createElement('meta');
                meta.setAttribute("name", "apple-itunes-app");
                meta.setAttribute("content", "app-id=" + configs.get('IOS_APP_ID'));
                meta.setAttribute("id", "apple-itunes-app-element");
                var link = document.createElement('link');
                link.setAttribute("rel", "apple-touch-icon");
                link.setAttribute("href", configs.get('IOS_APP_ICON'));
                link.setAttribute("id", "apple-touch-icon-element");
                document.head.appendChild(meta);
                document.head.appendChild(link);
            }
            if (configs.get('ANDROID_APP_ID') && configs.get('ANDROID_APP_ICON')) {
                var meta = document.createElement('meta');
                meta.setAttribute("name", "google-play-app");
                meta.setAttribute("content", "app-id=" + configs.get('ANDROID_APP_ID'));
                meta.setAttribute("id", "android-app-element");
                var link = document.createElement('link');
                link.setAttribute("rel", "android-touch-icon");
                link.setAttribute("href", configs.get('ANDROID_APP_ICON'));
                link.setAttribute("id", "android-touch-icon-element");
                document.head.appendChild(meta);
                document.head.appendChild(link);
            }

            pydio.UI.MOBILE_EXTENSIONS = true;
            pydio.UI.pydioSmartBanner = new _smartAppBanner2["default"]({
                daysHidden: 15, // days to hide banner after close button is clicked (defaults to 15)
                daysReminder: 90, // days to hide banner after "VIEW" button is clicked (defaults to 90)
                appStoreLanguage: 'us', // language code for the App Store (defaults to user's browser language)
                title: 'Pydio',
                author: 'Abstrium SAS',
                button: 'VIEW',
                store: {
                    ios: 'On the App Store',
                    android: 'In Google Play'
                },
                price: {
                    ios: 'FREE',
                    android: 'FREE'
                }
            });
        }
    }, {
        key: "componentWillUnmount",
        //, theme: '' // put platform type ('ios', 'android', etc.) here to force single theme on all device
        // , icon: '' // full path to icon image if not using website icon image
        //, force: 'android' // Uncomment for platform emulation
        value: function componentWillUnmount() {
            ["apple-itunes-app-element", "apple-touch-icon-element", "android-app-element", "android-touch-icon-element"].forEach(function (id) {
                var el = document.getElementById(id);
                if (el) {
                    el.parentNode.removeChild(el);
                }
            });
        }
    }, {
        key: "render",
        value: function render() {
            return null;
        }
    }]);

    return MobileExtensions;
})(_react.Component);

exports["default"] = MobileExtensions = PydioContextConsumer(MobileExtensions);
exports["default"] = MobileExtensions;
module.exports = exports["default"];
