(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PydioDiaporama = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var Image = (function (_Component) {
    _inherits(Image, _Component);

    function Image() {
        _classCallCheck(this, Image);

        _get(Object.getPrototypeOf(Image.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Image, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var src = _props.src;
            var style = _props.style;

            var remainingProps = _objectWithoutProperties(_props, ['src', 'style']);

            var cleanSrc = src.replace(new RegExp("'", 'g'), "\\'");
            cleanSrc = cleanSrc.replace(new RegExp("\\+", 'g'), encodeURIComponent("+"));

            return _react2['default'].createElement('div', _extends({}, remainingProps, {
                style: _extends({}, style, {
                    backgroundImage: 'url(\'' + cleanSrc + '\')',
                    backgroundSize: "cover",
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                    margin: 'auto'
                })
            }));
        }
    }]);

    return Image;
})(_react.Component);

exports.Image = Image;

var ImageContainer = (function (_Component2) {
    _inherits(ImageContainer, _Component2);

    function ImageContainer() {
        _classCallCheck(this, ImageContainer);

        _get(Object.getPrototypeOf(ImageContainer.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ImageContainer, [{
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var src = _props2.src;
            var style = _props2.style;
            var width = _props2.width;
            var height = _props2.height;
            var imgStyle = _props2.imgStyle;
            var imgClassName = _props2.imgClassName;
            var _props2$scale = _props2.scale;
            var scale = _props2$scale === undefined ? 1 : _props2$scale;

            return _react2['default'].createElement(
                'div',
                { style: _extends({}, ImageContainer.styles, style) },
                _react2['default'].createElement(Image, {
                    src: src,
                    className: imgClassName,
                    style: _extends({
                        width: width && width * scale || "100%",
                        height: height && height * scale || "100%"
                    }, imgStyle)
                })
            );
        }
    }], [{
        key: 'propTypes',
        get: function get() {
            return {
                src: _react2['default'].PropTypes.string.isRequired,
                imgClassName: _react2['default'].PropTypes.string,
                imgStyle: _react2['default'].PropTypes.object,
                width: _react2['default'].PropTypes.number,
                height: _react2['default'].PropTypes.number
            };
        }
    }, {
        key: 'defaultProps',
        get: function get() {
            return {
                src: ""
            };
        }
    }, {
        key: 'styles',
        get: function get() {
            return {
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                overflow: 'auto'
            };
        }
    }]);

    return ImageContainer;
})(_react.Component);

exports.ImageContainer = ImageContainer;

},{"react":"react"}],2:[function(require,module,exports){
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
var _PydioHOCs = PydioHOCs;
var SelectionControls = _PydioHOCs.SelectionControls;
var ResolutionControls = _PydioHOCs.ResolutionControls;
var SizeControls = _PydioHOCs.SizeControls;
exports.SelectionControls = SelectionControls;
exports.ResolutionControls = ResolutionControls;
exports.SizeControls = SizeControls;

},{}],3:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _components = require('./components');

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var conf = pydio.getPluginConfigs('editor.diaporama');
var sizes = conf && conf.get("PREVIEWER_LOWRES_SIZES").split(",") || [300, 700, 1000, 1300];

var _PydioHOCs = PydioHOCs;
var SizeProviders = _PydioHOCs.SizeProviders;
var withResolution = _PydioHOCs.withResolution;
var withSelection = _PydioHOCs.withSelection;
var withResize = _PydioHOCs.withResize;
var ImageSizeProvider = SizeProviders.ImageSizeProvider;
var ContainerSizeProvider = SizeProviders.ContainerSizeProvider;

var ExtendedImageContainer = withResize(_components.ImageContainer);

var Editor = (function (_PureComponent) {
    _inherits(Editor, _PureComponent);

    function Editor() {
        _classCallCheck(this, Editor);

        _get(Object.getPrototypeOf(Editor.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Editor, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (this.props.selectionPlaying !== nextProps.selectionPlaying) {
                if (nextProps.selectionPlaying) {
                    this.pe = new PeriodicalExecuter(nextProps.onRequestSelectionPlay, 3);
                } else {
                    this.pe && this.pe.stop();
                }
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var node = _props.node;
            var src = _props.src;
            var editorData = _props.editorData;

            if (!node) return null;
            var orientation = undefined;
            if (node.getMetadata().get("image_exif_orientation")) {
                orientation = node.getMetadata().get("image_exif_orientation");
            }

            var imageClassName = ['diaporama-image-main-block'];

            if (orientation) {
                imageClassName = [].concat(_toConsumableArray(imageClassName), ['ort-rotate-' + orientation]);
            }

            return _react2['default'].createElement(
                ContainerSizeProvider,
                null,
                function (_ref) {
                    var containerWidth = _ref.containerWidth;
                    var containerHeight = _ref.containerHeight;
                    return _react2['default'].createElement(
                        ImageSizeProvider,
                        { url: src, node: node },
                        function (_ref2) {
                            var imgWidth = _ref2.imgWidth;
                            var imgHeight = _ref2.imgHeight;
                            return _react2['default'].createElement(ExtendedImageContainer, {
                                editorData: editorData,
                                node: node,
                                src: src,
                                width: imgWidth,
                                height: imgHeight,
                                containerWidth: containerWidth,
                                containerHeight: containerHeight,
                                imgClassName: imageClassName.join(" "),
                                style: { backgroundColor: '#424242' },
                                imgStyle: { boxShadow: 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px' }
                            });
                        }
                    );
                }
            );
        }
    }], [{
        key: 'propTypes',
        get: function get() {
            return {
                node: _react2['default'].PropTypes.instanceOf(AjxpNode).isRequired
            };
        }
    }]);

    return Editor;
})(_react.PureComponent);

var getSelectionFilter = function getSelectionFilter(node) {
    return node.getMetadata().get('is_image') === '1';
};
var getSelection = function getSelection(node) {
    return new Promise(function (resolve, reject) {
        var selection = [];

        node.getParent().getChildren().forEach(function (child) {
            return selection.push(child);
        });
        selection = selection.filter(getSelectionFilter);

        resolve({
            selection: selection,
            currentIndex: selection.reduce(function (currentIndex, current, index) {
                return current === node && index || currentIndex;
            }, 0)
        });
    });
};

var mapStateToProps = function mapStateToProps(state, props) {
    var tabs = state.tabs;

    var tab = tabs.filter(function (_ref3) {
        var editorData = _ref3.editorData;
        var node = _ref3.node;
        return (!editorData || editorData.id === props.editorData.id) && node.getPath() === props.node.getPath();
    })[0] || {};

    if (!tab) return props;

    var node = tab.node;
    var resolution = tab.resolution;

    return _extends({
        orientation: resolution === 'hi' ? node.getMetadata().get("image_exif_orientation") : null
    }, props);
};

exports['default'] = (0, _redux.compose)(withSelection(getSelection, getSelectionFilter), withResolution(sizes, function (node) {
    if (node) {
        return _pydioHttpApi2['default'].getClient().buildPresignedGetUrl(node, null, 'image/' + node.getAjxpMime());
    } else {
        return Promise.resolve("");
    }
}, function (node, dimension) {
    if (node) {
        return _pydioHttpApi2['default'].getClient().buildPresignedGetUrl(node, null, 'image/jpeg', {
            Bucket: 'io',
            Key: 'pydio-thumbstore/' + node.getMetadata().get('uuid') + '-512.jpg'
        });
    } else {
        return Promise.resolve("");
    }
}), (0, _reactRedux.connect)(mapStateToProps))(Editor);
module.exports = exports['default'];

},{"./components":1,"pydio/http/api":"pydio/http/api","react":"react","react-redux":"react-redux","redux":"redux"}],4:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _controls = require('./controls');

var Controls = _interopRequireWildcard(_controls);

var _preview = require('./preview');

exports.Badge = _interopRequire(_preview);
exports.Panel = _interopRequire(_preview);

var _editor = require('./editor');

exports.Editor = _interopRequire(_editor);
exports.Controls = Controls;

},{"./controls":2,"./editor":3,"./preview":5}],5:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _components = require('./components');

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var Preview = (function (_Component) {
    _inherits(Preview, _Component);

    function Preview(props) {
        _classCallCheck(this, Preview);

        _get(Object.getPrototypeOf(Preview.prototype), 'constructor', this).call(this, props);
        this.state = { src: '' };
    }

    _createClass(Preview, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;

            var node = this.props.node;

            var p = _pydioHttpApi2['default'].getClient().buildPresignedGetUrl(node, null, 'image/jpeg', { Bucket: 'io', Key: 'pydio-thumbstore/' + node.getMetadata().get('uuid') + '-512.jpg' });
            p.then(function (url) {
                _this.setState({ src: url });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var node = _props.node;

            var remainingProps = _objectWithoutProperties(_props, ['node']);

            var src = this.state.src;

            if (!src) {
                return null;
            }
            return _react2['default'].createElement(_components.ImageContainer, _extends({}, remainingProps, {
                src: src,
                imgStyle: {
                    width: "100%",
                    height: "100%",
                    flex: 1
                }
            }));
        }
    }]);

    return Preview;
})(_react.Component);

exports['default'] = Preview;
module.exports = exports['default'];

},{"./components":1,"pydio/http/api":"pydio/http/api","react":"react"}]},{},[4])(4)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvUHlkaW9EaWFwb3JhbWEvY29tcG9uZW50cy5qcyIsInJlcy9idWlsZC9QeWRpb0RpYXBvcmFtYS9jb250cm9scy5qcyIsInJlcy9idWlsZC9QeWRpb0RpYXBvcmFtYS9lZGl0b3IuanMiLCJyZXMvYnVpbGQvUHlkaW9EaWFwb3JhbWEvaW5kZXguanMiLCJyZXMvYnVpbGQvUHlkaW9EaWFwb3JhbWEvcHJldmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMob2JqLCBrZXlzKSB7IHZhciB0YXJnZXQgPSB7fTsgZm9yICh2YXIgaSBpbiBvYmopIHsgaWYgKGtleXMuaW5kZXhPZihpKSA+PSAwKSBjb250aW51ZTsgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBpKSkgY29udGludWU7IHRhcmdldFtpXSA9IG9ialtpXTsgfSByZXR1cm4gdGFyZ2V0OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBJbWFnZSA9IChmdW5jdGlvbiAoX0NvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhJbWFnZSwgX0NvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBJbWFnZSgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEltYWdlKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihJbWFnZS5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhJbWFnZSwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHNyYyA9IF9wcm9wcy5zcmM7XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBfcHJvcHMuc3R5bGU7XG5cbiAgICAgICAgICAgIHZhciByZW1haW5pbmdQcm9wcyA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhfcHJvcHMsIFsnc3JjJywgJ3N0eWxlJ10pO1xuXG4gICAgICAgICAgICB2YXIgY2xlYW5TcmMgPSBzcmMucmVwbGFjZShuZXcgUmVnRXhwKFwiJ1wiLCAnZycpLCBcIlxcXFwnXCIpO1xuICAgICAgICAgICAgY2xlYW5TcmMgPSBjbGVhblNyYy5yZXBsYWNlKG5ldyBSZWdFeHAoXCJcXFxcK1wiLCAnZycpLCBlbmNvZGVVUklDb21wb25lbnQoXCIrXCIpKTtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdkaXYnLCBfZXh0ZW5kcyh7fSwgcmVtYWluaW5nUHJvcHMsIHtcbiAgICAgICAgICAgICAgICBzdHlsZTogX2V4dGVuZHMoe30sIHN0eWxlLCB7XG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRJbWFnZTogJ3VybChcXCcnICsgY2xlYW5TcmMgKyAnXFwnKScsXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRTaXplOiBcImNvdmVyXCIsXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRQb3NpdGlvbjogJ2NlbnRlciBjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kUmVwZWF0OiAnbm8tcmVwZWF0JyxcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAnYXV0bydcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEltYWdlO1xufSkoX3JlYWN0LkNvbXBvbmVudCk7XG5cbmV4cG9ydHMuSW1hZ2UgPSBJbWFnZTtcblxudmFyIEltYWdlQ29udGFpbmVyID0gKGZ1bmN0aW9uIChfQ29tcG9uZW50Mikge1xuICAgIF9pbmhlcml0cyhJbWFnZUNvbnRhaW5lciwgX0NvbXBvbmVudDIpO1xuXG4gICAgZnVuY3Rpb24gSW1hZ2VDb250YWluZXIoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBJbWFnZUNvbnRhaW5lcik7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoSW1hZ2VDb250YWluZXIucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoSW1hZ2VDb250YWluZXIsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgc3JjID0gX3Byb3BzMi5zcmM7XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBfcHJvcHMyLnN0eWxlO1xuICAgICAgICAgICAgdmFyIHdpZHRoID0gX3Byb3BzMi53aWR0aDtcbiAgICAgICAgICAgIHZhciBoZWlnaHQgPSBfcHJvcHMyLmhlaWdodDtcbiAgICAgICAgICAgIHZhciBpbWdTdHlsZSA9IF9wcm9wczIuaW1nU3R5bGU7XG4gICAgICAgICAgICB2YXIgaW1nQ2xhc3NOYW1lID0gX3Byb3BzMi5pbWdDbGFzc05hbWU7XG4gICAgICAgICAgICB2YXIgX3Byb3BzMiRzY2FsZSA9IF9wcm9wczIuc2NhbGU7XG4gICAgICAgICAgICB2YXIgc2NhbGUgPSBfcHJvcHMyJHNjYWxlID09PSB1bmRlZmluZWQgPyAxIDogX3Byb3BzMiRzY2FsZTtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHt9LCBJbWFnZUNvbnRhaW5lci5zdHlsZXMsIHN0eWxlKSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEltYWdlLCB7XG4gICAgICAgICAgICAgICAgICAgIHNyYzogc3JjLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IGltZ0NsYXNzTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IF9leHRlbmRzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiB3aWR0aCAmJiB3aWR0aCAqIHNjYWxlIHx8IFwiMTAwJVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQgJiYgaGVpZ2h0ICogc2NhbGUgfHwgXCIxMDAlXCJcbiAgICAgICAgICAgICAgICAgICAgfSwgaW1nU3R5bGUpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSwgW3tcbiAgICAgICAga2V5OiAncHJvcFR5cGVzJyxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNyYzogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgICAgICAgICBpbWdDbGFzc05hbWU6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICAgICAgICAgIGltZ1N0eWxlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgICAgICAgICAgICB3aWR0aDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5udW1iZXIsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm51bWJlclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGVmYXVsdFByb3BzJyxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNyYzogXCJcIlxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc3R5bGVzJyxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGZsZXg6IDEsXG4gICAgICAgICAgICAgICAgZGlzcGxheTogXCJmbGV4XCIsXG4gICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICAgIG92ZXJmbG93OiAnYXV0bydcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gSW1hZ2VDb250YWluZXI7XG59KShfcmVhY3QuQ29tcG9uZW50KTtcblxuZXhwb3J0cy5JbWFnZUNvbnRhaW5lciA9IEltYWdlQ29udGFpbmVyO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbnZhciBfUHlkaW9IT0NzID0gUHlkaW9IT0NzO1xudmFyIFNlbGVjdGlvbkNvbnRyb2xzID0gX1B5ZGlvSE9Dcy5TZWxlY3Rpb25Db250cm9scztcbnZhciBSZXNvbHV0aW9uQ29udHJvbHMgPSBfUHlkaW9IT0NzLlJlc29sdXRpb25Db250cm9scztcbnZhciBTaXplQ29udHJvbHMgPSBfUHlkaW9IT0NzLlNpemVDb250cm9scztcbmV4cG9ydHMuU2VsZWN0aW9uQ29udHJvbHMgPSBTZWxlY3Rpb25Db250cm9scztcbmV4cG9ydHMuUmVzb2x1dGlvbkNvbnRyb2xzID0gUmVzb2x1dGlvbkNvbnRyb2xzO1xuZXhwb3J0cy5TaXplQ29udHJvbHMgPSBTaXplQ29udHJvbHM7XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSBhcnIyW2ldID0gYXJyW2ldOyByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcmVhY3RSZWR1eCA9IHJlcXVpcmUoJ3JlYWN0LXJlZHV4Jyk7XG5cbnZhciBfcmVkdXggPSByZXF1aXJlKCdyZWR1eCcpO1xuXG52YXIgX2NvbXBvbmVudHMgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMnKTtcblxudmFyIF9weWRpb0h0dHBBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL2FwaScpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb0h0dHBBcGkpO1xuXG52YXIgY29uZiA9IHB5ZGlvLmdldFBsdWdpbkNvbmZpZ3MoJ2VkaXRvci5kaWFwb3JhbWEnKTtcbnZhciBzaXplcyA9IGNvbmYgJiYgY29uZi5nZXQoXCJQUkVWSUVXRVJfTE9XUkVTX1NJWkVTXCIpLnNwbGl0KFwiLFwiKSB8fCBbMzAwLCA3MDAsIDEwMDAsIDEzMDBdO1xuXG52YXIgX1B5ZGlvSE9DcyA9IFB5ZGlvSE9DcztcbnZhciBTaXplUHJvdmlkZXJzID0gX1B5ZGlvSE9Dcy5TaXplUHJvdmlkZXJzO1xudmFyIHdpdGhSZXNvbHV0aW9uID0gX1B5ZGlvSE9Dcy53aXRoUmVzb2x1dGlvbjtcbnZhciB3aXRoU2VsZWN0aW9uID0gX1B5ZGlvSE9Dcy53aXRoU2VsZWN0aW9uO1xudmFyIHdpdGhSZXNpemUgPSBfUHlkaW9IT0NzLndpdGhSZXNpemU7XG52YXIgSW1hZ2VTaXplUHJvdmlkZXIgPSBTaXplUHJvdmlkZXJzLkltYWdlU2l6ZVByb3ZpZGVyO1xudmFyIENvbnRhaW5lclNpemVQcm92aWRlciA9IFNpemVQcm92aWRlcnMuQ29udGFpbmVyU2l6ZVByb3ZpZGVyO1xuXG52YXIgRXh0ZW5kZWRJbWFnZUNvbnRhaW5lciA9IHdpdGhSZXNpemUoX2NvbXBvbmVudHMuSW1hZ2VDb250YWluZXIpO1xuXG52YXIgRWRpdG9yID0gKGZ1bmN0aW9uIChfUHVyZUNvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhFZGl0b3IsIF9QdXJlQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIEVkaXRvcigpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEVkaXRvcik7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoRWRpdG9yLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEVkaXRvciwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuc2VsZWN0aW9uUGxheWluZyAhPT0gbmV4dFByb3BzLnNlbGVjdGlvblBsYXlpbmcpIHtcbiAgICAgICAgICAgICAgICBpZiAobmV4dFByb3BzLnNlbGVjdGlvblBsYXlpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wZSA9IG5ldyBQZXJpb2RpY2FsRXhlY3V0ZXIobmV4dFByb3BzLm9uUmVxdWVzdFNlbGVjdGlvblBsYXksIDMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGUgJiYgdGhpcy5wZS5zdG9wKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IF9wcm9wcy5ub2RlO1xuICAgICAgICAgICAgdmFyIHNyYyA9IF9wcm9wcy5zcmM7XG4gICAgICAgICAgICB2YXIgZWRpdG9yRGF0YSA9IF9wcm9wcy5lZGl0b3JEYXRhO1xuXG4gICAgICAgICAgICBpZiAoIW5vZGUpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgdmFyIG9yaWVudGF0aW9uID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoXCJpbWFnZV9leGlmX29yaWVudGF0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb24gPSBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KFwiaW1hZ2VfZXhpZl9vcmllbnRhdGlvblwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGltYWdlQ2xhc3NOYW1lID0gWydkaWFwb3JhbWEtaW1hZ2UtbWFpbi1ibG9jayddO1xuXG4gICAgICAgICAgICBpZiAob3JpZW50YXRpb24pIHtcbiAgICAgICAgICAgICAgICBpbWFnZUNsYXNzTmFtZSA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkoaW1hZ2VDbGFzc05hbWUpLCBbJ29ydC1yb3RhdGUtJyArIG9yaWVudGF0aW9uXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBDb250YWluZXJTaXplUHJvdmlkZXIsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoX3JlZikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29udGFpbmVyV2lkdGggPSBfcmVmLmNvbnRhaW5lcldpZHRoO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29udGFpbmVySGVpZ2h0ID0gX3JlZi5jb250YWluZXJIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIEltYWdlU2l6ZVByb3ZpZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyB1cmw6IHNyYywgbm9kZTogbm9kZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKF9yZWYyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGltZ1dpZHRoID0gX3JlZjIuaW1nV2lkdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGltZ0hlaWdodCA9IF9yZWYyLmltZ0hlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoRXh0ZW5kZWRJbWFnZUNvbnRhaW5lciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGl0b3JEYXRhOiBlZGl0b3JEYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlOiBub2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM6IHNyYyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGltZ1dpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGltZ0hlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyV2lkdGg6IGNvbnRhaW5lcldpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJIZWlnaHQ6IGNvbnRhaW5lckhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nQ2xhc3NOYW1lOiBpbWFnZUNsYXNzTmFtZS5qb2luKFwiIFwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgYmFja2dyb3VuZENvbG9yOiAnIzQyNDI0MicgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nU3R5bGU6IHsgYm94U2hhZG93OiAncmdiYSgwLCAwLCAwLCAwLjExNzY0NykgMHB4IDFweCA2cHgsIHJnYmEoMCwgMCwgMCwgMC4xMTc2NDcpIDBweCAxcHggNHB4JyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dLCBbe1xuICAgICAgICBrZXk6ICdwcm9wVHlwZXMnLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbm9kZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKEFqeHBOb2RlKS5pc1JlcXVpcmVkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEVkaXRvcjtcbn0pKF9yZWFjdC5QdXJlQ29tcG9uZW50KTtcblxudmFyIGdldFNlbGVjdGlvbkZpbHRlciA9IGZ1bmN0aW9uIGdldFNlbGVjdGlvbkZpbHRlcihub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ2lzX2ltYWdlJykgPT09ICcxJztcbn07XG52YXIgZ2V0U2VsZWN0aW9uID0gZnVuY3Rpb24gZ2V0U2VsZWN0aW9uKG5vZGUpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICB2YXIgc2VsZWN0aW9uID0gW107XG5cbiAgICAgICAgbm9kZS5nZXRQYXJlbnQoKS5nZXRDaGlsZHJlbigpLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uLnB1c2goY2hpbGQpO1xuICAgICAgICB9KTtcbiAgICAgICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uLmZpbHRlcihnZXRTZWxlY3Rpb25GaWx0ZXIpO1xuXG4gICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgc2VsZWN0aW9uOiBzZWxlY3Rpb24sXG4gICAgICAgICAgICBjdXJyZW50SW5kZXg6IHNlbGVjdGlvbi5yZWR1Y2UoZnVuY3Rpb24gKGN1cnJlbnRJbmRleCwgY3VycmVudCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudCA9PT0gbm9kZSAmJiBpbmRleCB8fCBjdXJyZW50SW5kZXg7XG4gICAgICAgICAgICB9LCAwKVxuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbnZhciBtYXBTdGF0ZVRvUHJvcHMgPSBmdW5jdGlvbiBtYXBTdGF0ZVRvUHJvcHMoc3RhdGUsIHByb3BzKSB7XG4gICAgdmFyIHRhYnMgPSBzdGF0ZS50YWJzO1xuXG4gICAgdmFyIHRhYiA9IHRhYnMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmMykge1xuICAgICAgICB2YXIgZWRpdG9yRGF0YSA9IF9yZWYzLmVkaXRvckRhdGE7XG4gICAgICAgIHZhciBub2RlID0gX3JlZjMubm9kZTtcbiAgICAgICAgcmV0dXJuICghZWRpdG9yRGF0YSB8fCBlZGl0b3JEYXRhLmlkID09PSBwcm9wcy5lZGl0b3JEYXRhLmlkKSAmJiBub2RlLmdldFBhdGgoKSA9PT0gcHJvcHMubm9kZS5nZXRQYXRoKCk7XG4gICAgfSlbMF0gfHwge307XG5cbiAgICBpZiAoIXRhYikgcmV0dXJuIHByb3BzO1xuXG4gICAgdmFyIG5vZGUgPSB0YWIubm9kZTtcbiAgICB2YXIgcmVzb2x1dGlvbiA9IHRhYi5yZXNvbHV0aW9uO1xuXG4gICAgcmV0dXJuIF9leHRlbmRzKHtcbiAgICAgICAgb3JpZW50YXRpb246IHJlc29sdXRpb24gPT09ICdoaScgPyBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KFwiaW1hZ2VfZXhpZl9vcmllbnRhdGlvblwiKSA6IG51bGxcbiAgICB9LCBwcm9wcyk7XG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSAoMCwgX3JlZHV4LmNvbXBvc2UpKHdpdGhTZWxlY3Rpb24oZ2V0U2VsZWN0aW9uLCBnZXRTZWxlY3Rpb25GaWx0ZXIpLCB3aXRoUmVzb2x1dGlvbihzaXplcywgZnVuY3Rpb24gKG5vZGUpIHtcbiAgICBpZiAobm9kZSkge1xuICAgICAgICByZXR1cm4gX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRDbGllbnQoKS5idWlsZFByZXNpZ25lZEdldFVybChub2RlLCBudWxsLCAnaW1hZ2UvJyArIG5vZGUuZ2V0QWp4cE1pbWUoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShcIlwiKTtcbiAgICB9XG59LCBmdW5jdGlvbiAobm9kZSwgZGltZW5zaW9uKSB7XG4gICAgaWYgKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0Q2xpZW50KCkuYnVpbGRQcmVzaWduZWRHZXRVcmwobm9kZSwgbnVsbCwgJ2ltYWdlL2pwZWcnLCB7XG4gICAgICAgICAgICBCdWNrZXQ6ICdpbycsXG4gICAgICAgICAgICBLZXk6ICdweWRpby10aHVtYnN0b3JlLycgKyBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KCd1dWlkJykgKyAnLTUxMi5qcGcnXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoXCJcIik7XG4gICAgfVxufSksICgwLCBfcmVhY3RSZWR1eC5jb25uZWN0KShtYXBTdGF0ZVRvUHJvcHMpKShFZGl0b3IpO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZShvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9ialsnZGVmYXVsdCddIDogb2JqOyB9XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKG9iaikgeyBpZiAob2JqICYmIG9iai5fX2VzTW9kdWxlKSB7IHJldHVybiBvYmo7IH0gZWxzZSB7IHZhciBuZXdPYmogPSB7fTsgaWYgKG9iaiAhPSBudWxsKSB7IGZvciAodmFyIGtleSBpbiBvYmopIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIG5ld09ialtrZXldID0gb2JqW2tleV07IH0gfSBuZXdPYmpbJ2RlZmF1bHQnXSA9IG9iajsgcmV0dXJuIG5ld09iajsgfSB9XG5cbnZhciBfY29udHJvbHMgPSByZXF1aXJlKCcuL2NvbnRyb2xzJyk7XG5cbnZhciBDb250cm9scyA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9jb250cm9scyk7XG5cbnZhciBfcHJldmlldyA9IHJlcXVpcmUoJy4vcHJldmlldycpO1xuXG5leHBvcnRzLkJhZGdlID0gX2ludGVyb3BSZXF1aXJlKF9wcmV2aWV3KTtcbmV4cG9ydHMuUGFuZWwgPSBfaW50ZXJvcFJlcXVpcmUoX3ByZXZpZXcpO1xuXG52YXIgX2VkaXRvciA9IHJlcXVpcmUoJy4vZWRpdG9yJyk7XG5cbmV4cG9ydHMuRWRpdG9yID0gX2ludGVyb3BSZXF1aXJlKF9lZGl0b3IpO1xuZXhwb3J0cy5Db250cm9scyA9IENvbnRyb2xzO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMob2JqLCBrZXlzKSB7IHZhciB0YXJnZXQgPSB7fTsgZm9yICh2YXIgaSBpbiBvYmopIHsgaWYgKGtleXMuaW5kZXhPZihpKSA+PSAwKSBjb250aW51ZTsgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBpKSkgY29udGludWU7IHRhcmdldFtpXSA9IG9ialtpXTsgfSByZXR1cm4gdGFyZ2V0OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfY29tcG9uZW50cyA9IHJlcXVpcmUoJy4vY29tcG9uZW50cycpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cEFwaSk7XG5cbnZhciBQcmV2aWV3ID0gKGZ1bmN0aW9uIChfQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFByZXZpZXcsIF9Db21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gUHJldmlldyhwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUHJldmlldyk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoUHJldmlldy5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHsgc3JjOiAnJyB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhQcmV2aWV3LCBbe1xuICAgICAgICBrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5wcm9wcy5ub2RlO1xuXG4gICAgICAgICAgICB2YXIgcCA9IF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0Q2xpZW50KCkuYnVpbGRQcmVzaWduZWRHZXRVcmwobm9kZSwgbnVsbCwgJ2ltYWdlL2pwZWcnLCB7IEJ1Y2tldDogJ2lvJywgS2V5OiAncHlkaW8tdGh1bWJzdG9yZS8nICsgbm9kZS5nZXRNZXRhZGF0YSgpLmdldCgndXVpZCcpICsgJy01MTIuanBnJyB9KTtcbiAgICAgICAgICAgIHAudGhlbihmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBzcmM6IHVybCB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IF9wcm9wcy5ub2RlO1xuXG4gICAgICAgICAgICB2YXIgcmVtYWluaW5nUHJvcHMgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoX3Byb3BzLCBbJ25vZGUnXSk7XG5cbiAgICAgICAgICAgIHZhciBzcmMgPSB0aGlzLnN0YXRlLnNyYztcblxuICAgICAgICAgICAgaWYgKCFzcmMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfY29tcG9uZW50cy5JbWFnZUNvbnRhaW5lciwgX2V4dGVuZHMoe30sIHJlbWFpbmluZ1Byb3BzLCB7XG4gICAgICAgICAgICAgICAgc3JjOiBzcmMsXG4gICAgICAgICAgICAgICAgaW1nU3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IFwiMTAwJVwiLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IFwiMTAwJVwiLFxuICAgICAgICAgICAgICAgICAgICBmbGV4OiAxXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFByZXZpZXc7XG59KShfcmVhY3QuQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gUHJldmlldztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIl19
