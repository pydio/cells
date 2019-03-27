'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _react = require('react');

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

    BackgroundImage.backgroundFromConfigs = function backgroundFromConfigs(pydio, configName) {

        if (BackgroundImage.PARSED) {
            return BackgroundImage.PARSED;
        }

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
                    (function () {
                        var str = bgrounds[n];
                        bgrounds[n] = {
                            orig: pydio.Parameters.get('ENDPOINT_REST_API') + "/frontend/binaries/GLOBAL/" + str,
                            resize: function resize(size) {
                                return pydio.Parameters.get('ENDPOINT_REST_API') + "/frontend/binaries/GLOBAL/" + str + '?dim=' + size;
                            }
                        };
                    })();
                }
            } else {
                (function () {
                    var defaultImage = d.getAttribute("defaultImage");
                    bgrounds[n] = {
                        orig: defaultImage,
                        resize: function resize(size) {
                            var dir = _pydioUtilPath2['default'].getDirname(defaultImage);
                            var base = _pydioUtilPath2['default'].getBasename(defaultImage);
                            return dir + '/' + size + '/' + base;
                        }
                    };
                })();
            }
        });

        var bgArr = [];
        index = 1;
        while (bgrounds[paramPrefix + index]) {
            bgArr.push(bgrounds[paramPrefix + index]);
            index++;
        }
        i = Math.floor(Math.random() * bgArr.length);
        BackgroundImage.PARSED = bgArr[i];
        return BackgroundImage.PARSED;
    };

    BackgroundImage.screenResize = function screenResize() {
        var resize = 0;
        var windowWidth = _pydioUtilDom2['default'].getViewportWidth();
        var isRetina = matchMedia("(-webkit-min-device-pixel-ratio: 2), (min-device-pixel-ratio: 2), (min-resolution: 192dpi)").matches;
        if (windowWidth <= 600) {
            resize = 800;
            if (isRetina) {
                resize = 1200;
            }
        } else if (windowWidth <= 1200 && !isRetina) {
            resize = 1200;
        }
        return resize;
    };

    return BackgroundImage;
})();

exports['default'] = function (PydioComponent) {
    var ProgressiveBgComponent = (function (_Component) {
        _inherits(ProgressiveBgComponent, _Component);

        function ProgressiveBgComponent(props) {
            _classCallCheck(this, ProgressiveBgComponent);

            _Component.call(this, props);
            var pydio = props.pydio;
            var imageBackgroundFromConfigs = props.imageBackgroundFromConfigs;

            if (imageBackgroundFromConfigs) {
                var background = BackgroundImage.backgroundFromConfigs(pydio, imageBackgroundFromConfigs);
                this.state = { background: background, loaded: false };
            }
        }

        ProgressiveBgComponent.prototype.componentWillMount = function componentWillMount() {
            var _this = this;

            var background = this.state.background;

            if (!background) {
                return;
            }
            var img = new Image();
            img.onload = function () {
                _this.setState({ loaded: true });
            };
            var resize = BackgroundImage.screenResize();
            var url = undefined;
            if (resize) {
                url = background.resize(resize);
            } else {
                url = background.orig;
            }
            img.src = url;
        };

        ProgressiveBgComponent.prototype.render = function render() {
            var _state = this.state;
            var background = _state.background;
            var loaded = _state.loaded;
            var pydio = this.props.pydio;

            var bgStyle = {};
            if (background) {
                var url = undefined,
                    _blur = undefined;
                if (loaded) {
                    var resize = BackgroundImage.screenResize();
                    if (resize) {
                        url = background.resize(resize);
                    } else {
                        url = background.orig;
                    }
                } else if (!pydio.user) {
                    // if user is logged, do not load small version of background
                    url = background.resize(40);
                    _blur = { filter: 'blur(50px)' };
                }
                if (url) {
                    bgStyle = _extends({
                        backgroundImage: "url('" + url + "')",
                        backgroundSize: "cover",
                        backgroundPosition: "center center"
                    }, _blur);
                }
            }
            return React.createElement(PydioComponent, _extends({}, this.props, { bgStyle: bgStyle }));
        };

        return ProgressiveBgComponent;
    })(_react.Component);

    return ProgressiveBgComponent;
};

module.exports = exports['default'];
