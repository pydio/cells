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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var EditorActions = _Pydio$requireLib.EditorActions;
var onSelectionChange = function onSelectionChange(_ref) {
  var dispatch = _ref.dispatch;
  var tab = _ref.tab;
  return function (node) {
    return dispatch(EditorActions.tabModify({ id: tab.id, title: node.getLabel(), node: node }));
  };
};
exports.onSelectionChange = onSelectionChange;
var onToggleResolution = function onToggleResolution(_ref2) {
  var dispatch = _ref2.dispatch;
  return function (high) {
    return dispatch(EditorActions.editorModify({ resolution: high ? "hi" : "lo" }));
  };
};
exports.onToggleResolution = onToggleResolution;
var onTogglePlaying = function onTogglePlaying(_ref3) {
  var dispatch = _ref3.dispatch;
  var tab = _ref3.tab;
  return function (playing) {
    return dispatch(EditorActions.tabModify({ id: tab.id, playing: playing }));
  };
};
exports.onTogglePlaying = onTogglePlaying;
var onSizeChange = function onSizeChange(_ref4) {
  var dispatch = _ref4.dispatch;
  return function (data) {
    return dispatch(EditorActions.editorModify(data));
  };
};
exports.onSizeChange = onSizeChange;

},{"pydio":"pydio"}],2:[function(require,module,exports){
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

            var remaining = _objectWithoutProperties(_props2, ['src', 'style', 'width', 'height', 'imgStyle', 'imgClassName', 'scale']);

            return _react2['default'].createElement(
                'div',
                _extends({ style: _extends({}, ImageContainer.styles, style) }, remaining),
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
                overflow: 'auto',
                width: "100%",
                height: "100%"
            };
        }
    }]);

    return ImageContainer;
})(_react.Component);

exports.ImageContainer = ImageContainer;

},{"react":"react"}],3:[function(require,module,exports){
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

var _sizes = require('./sizes');

var _sizes2 = _interopRequireDefault(_sizes);

var conf = pydio.getPluginConfigs('editor.diaporama');
var sizes = conf && conf.get("PREVIEWER_LOWRES_SIZES").split(",") || [300, 700, 1000, 1300];

var _Pydio$requireLib = Pydio.requireLib('hoc');

var SizeProviders = _Pydio$requireLib.SizeProviders;
var withResolution = _Pydio$requireLib.withResolution;
var withSelection = _Pydio$requireLib.withSelection;
var withResize = _Pydio$requireLib.withResize;
var EditorActions = _Pydio$requireLib.EditorActions;
var ImageSizeProvider = SizeProviders.ImageSizeProvider;
var ContainerSizeProvider = SizeProviders.ContainerSizeProvider;

var ExtendedImageContainer = withResize(_components.ImageContainer);

var Editor = (function (_PureComponent) {
    _inherits(Editor, _PureComponent);

    function Editor() {
        _classCallCheck(this, _Editor);

        _get(Object.getPrototypeOf(_Editor.prototype), 'constructor', this).apply(this, arguments);
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
            var editorModify = this.props.editorModify;

            if (nextProps.isActive) {
                editorModify({ fixedToolbar: false });
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

            //     <ContainerSizeProvider>
            //     {({containerWidth, containerHeight}) =>
            //         <ImageSizeProvider url={src} node={node}>
            //         {({imgWidth, imgHeight}) =>
            //
            //
            //     }
            //     </ImageSizeProvider>
            // }
            // </ContainerSizeProvider>

            // width={imgWidth}
            // height={imgHeight}
            // containerWidth={containerWidth}
            // containerHeight={containerHeight}
            if (!src) {
                return null;
            }
            return _react2['default'].createElement(ExtendedImageContainer, {
                editorData: editorData,
                node: node,
                src: src,
                renderOnChange: true,
                passOnProps: true,
                imgClassName: imageClassName.join(" "),
                imgStyle: { boxShadow: 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px' }
            });
        }
    }], [{
        key: 'propTypes',
        get: function get() {
            return {
                node: _react2['default'].PropTypes.instanceOf(AjxpNode).isRequired
            };
        }
    }]);

    var _Editor = Editor;
    Editor = (0, _reactRedux.connect)(null, EditorActions)(Editor) || Editor;
    return Editor;
})(_react.PureComponent);

var getSelectionFilter = function getSelectionFilter(node) {
    return node.getMetadata().get('is_image');
};
var getSelection = function getSelection(node) {
    return new Promise(function (resolve, reject) {
        var selection = [];

        node.getParent().getChildren().forEach(function (child) {
            return selection.push(child);
        });
        selection = selection.filter(getSelectionFilter).sort(function (a, b) {
            return a.getLabel().localeCompare(b.getLabel(), undefined, { numeric: true });
        });

        resolve({
            selection: selection,
            currentIndex: selection.reduce(function (currentIndex, current, index) {
                return current === node && index || currentIndex;
            }, 0)
        });
    });
};

var mapStateToProps = function mapStateToProps(state, props) {
    var node = props.node;
    var editorData = props.editorData;

    if (!node) return props;

    var tabs = state.tabs;

    var tab = tabs.filter(function (_ref) {
        var currentEditorData = _ref.editorData;
        var currentNode = _ref.node;
        return (!currentEditorData || currentEditorData.id === editorData.id) && currentNode.getPath() === node.getPath();
    })[0] || {};

    if (!tab) return props;

    var tabNode = tab.node;
    var tabResolution = tab.resolution;

    return _extends({
        orientation: tabResolution === 'hi' ? tabNode.getMetadata().get("image_exif_orientation") : null
    }, props);
};

exports['default'] = (0, _redux.compose)(withSelection(getSelection, getSelectionFilter), withResolution(sizes, function (node) {
    return (0, _sizes2['default'])(node, "hq");
}, function (node, dimension) {
    return (0, _sizes2['default'])(node, "editor");
}), (0, _reactRedux.connect)(mapStateToProps))(Editor);
module.exports = exports['default'];

},{"./components":2,"./sizes":6,"react":"react","react-redux":"react-redux","redux":"redux"}],4:[function(require,module,exports){
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

var _actions = require('./actions');

var Actions = _interopRequireWildcard(_actions);

exports.Actions = Actions;

var _preview = require('./preview');

exports.Badge = _interopRequire(_preview);
exports.Panel = _interopRequire(_preview);

var _editor = require('./editor');

exports.Editor = _interopRequire(_editor);

},{"./actions":1,"./editor":3,"./preview":5}],5:[function(require,module,exports){
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

var _sizes = require('./sizes');

var _sizes2 = _interopRequireDefault(_sizes);

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

            (0, _sizes2['default'])(node, 'preview').then(function (url) {
                if (url) {
                    _this.setState({ src: url });
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var node = _props.node;

            var remainingProps = _objectWithoutProperties(_props, ['node']);

            var orientation = undefined;
            if (node && node.getMetadata().get("image_exif_orientation")) {
                orientation = node.getMetadata().get("image_exif_orientation");
                if (remainingProps.className) {
                    remainingProps.className += ' ort-rotate-' + orientation;
                } else {
                    remainingProps.className = 'ort-rotate-' + orientation;
                }
                if (parseInt(orientation) >= 5 && remainingProps.style && remainingProps.style.height === 200) {
                    remainingProps.style.height = 250;
                }
            }

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

},{"./components":2,"./sizes":6,"react":"react"}],6:[function(require,module,exports){
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

},{"pydio/http/api":"pydio/http/api"}]},{},[4])(4)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvUHlkaW9EaWFwb3JhbWEvYWN0aW9ucy5qcyIsInJlcy9idWlsZC9QeWRpb0RpYXBvcmFtYS9jb21wb25lbnRzLmpzIiwicmVzL2J1aWxkL1B5ZGlvRGlhcG9yYW1hL2VkaXRvci5qcyIsInJlcy9idWlsZC9QeWRpb0RpYXBvcmFtYS9pbmRleC5qcyIsInJlcy9idWlsZC9QeWRpb0RpYXBvcmFtYS9wcmV2aWV3LmpzIiwicmVzL2J1aWxkL1B5ZGlvRGlhcG9yYW1hL3NpemVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignaG9jJyk7XG5cbnZhciBFZGl0b3JBY3Rpb25zID0gX1B5ZGlvJHJlcXVpcmVMaWIuRWRpdG9yQWN0aW9ucztcbnZhciBvblNlbGVjdGlvbkNoYW5nZSA9IGZ1bmN0aW9uIG9uU2VsZWN0aW9uQ2hhbmdlKF9yZWYpIHtcbiAgdmFyIGRpc3BhdGNoID0gX3JlZi5kaXNwYXRjaDtcbiAgdmFyIHRhYiA9IF9yZWYudGFiO1xuICByZXR1cm4gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICByZXR1cm4gZGlzcGF0Y2goRWRpdG9yQWN0aW9ucy50YWJNb2RpZnkoeyBpZDogdGFiLmlkLCB0aXRsZTogbm9kZS5nZXRMYWJlbCgpLCBub2RlOiBub2RlIH0pKTtcbiAgfTtcbn07XG5leHBvcnRzLm9uU2VsZWN0aW9uQ2hhbmdlID0gb25TZWxlY3Rpb25DaGFuZ2U7XG52YXIgb25Ub2dnbGVSZXNvbHV0aW9uID0gZnVuY3Rpb24gb25Ub2dnbGVSZXNvbHV0aW9uKF9yZWYyKSB7XG4gIHZhciBkaXNwYXRjaCA9IF9yZWYyLmRpc3BhdGNoO1xuICByZXR1cm4gZnVuY3Rpb24gKGhpZ2gpIHtcbiAgICByZXR1cm4gZGlzcGF0Y2goRWRpdG9yQWN0aW9ucy5lZGl0b3JNb2RpZnkoeyByZXNvbHV0aW9uOiBoaWdoID8gXCJoaVwiIDogXCJsb1wiIH0pKTtcbiAgfTtcbn07XG5leHBvcnRzLm9uVG9nZ2xlUmVzb2x1dGlvbiA9IG9uVG9nZ2xlUmVzb2x1dGlvbjtcbnZhciBvblRvZ2dsZVBsYXlpbmcgPSBmdW5jdGlvbiBvblRvZ2dsZVBsYXlpbmcoX3JlZjMpIHtcbiAgdmFyIGRpc3BhdGNoID0gX3JlZjMuZGlzcGF0Y2g7XG4gIHZhciB0YWIgPSBfcmVmMy50YWI7XG4gIHJldHVybiBmdW5jdGlvbiAocGxheWluZykge1xuICAgIHJldHVybiBkaXNwYXRjaChFZGl0b3JBY3Rpb25zLnRhYk1vZGlmeSh7IGlkOiB0YWIuaWQsIHBsYXlpbmc6IHBsYXlpbmcgfSkpO1xuICB9O1xufTtcbmV4cG9ydHMub25Ub2dnbGVQbGF5aW5nID0gb25Ub2dnbGVQbGF5aW5nO1xudmFyIG9uU2l6ZUNoYW5nZSA9IGZ1bmN0aW9uIG9uU2l6ZUNoYW5nZShfcmVmNCkge1xuICB2YXIgZGlzcGF0Y2ggPSBfcmVmNC5kaXNwYXRjaDtcbiAgcmV0dXJuIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgcmV0dXJuIGRpc3BhdGNoKEVkaXRvckFjdGlvbnMuZWRpdG9yTW9kaWZ5KGRhdGEpKTtcbiAgfTtcbn07XG5leHBvcnRzLm9uU2l6ZUNoYW5nZSA9IG9uU2l6ZUNoYW5nZTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gsIHByb3BlcnR5ID0gX3gyLCByZWNlaXZlciA9IF94MzsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeCA9IHBhcmVudDsgX3gyID0gcHJvcGVydHk7IF94MyA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKG9iaiwga2V5cykgeyB2YXIgdGFyZ2V0ID0ge307IGZvciAodmFyIGkgaW4gb2JqKSB7IGlmIChrZXlzLmluZGV4T2YoaSkgPj0gMCkgY29udGludWU7IGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgaSkpIGNvbnRpbnVlOyB0YXJnZXRbaV0gPSBvYmpbaV07IH0gcmV0dXJuIHRhcmdldDsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgSW1hZ2UgPSAoZnVuY3Rpb24gKF9Db21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoSW1hZ2UsIF9Db21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gSW1hZ2UoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBJbWFnZSk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoSW1hZ2UucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoSW1hZ2UsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBzcmMgPSBfcHJvcHMuc3JjO1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gX3Byb3BzLnN0eWxlO1xuXG4gICAgICAgICAgICB2YXIgcmVtYWluaW5nUHJvcHMgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoX3Byb3BzLCBbJ3NyYycsICdzdHlsZSddKTtcblxuICAgICAgICAgICAgdmFyIGNsZWFuU3JjID0gc3JjLnJlcGxhY2UobmV3IFJlZ0V4cChcIidcIiwgJ2cnKSwgXCJcXFxcJ1wiKTtcbiAgICAgICAgICAgIGNsZWFuU3JjID0gY2xlYW5TcmMucmVwbGFjZShuZXcgUmVnRXhwKFwiXFxcXCtcIiwgJ2cnKSwgZW5jb2RlVVJJQ29tcG9uZW50KFwiK1wiKSk7XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnZGl2JywgX2V4dGVuZHMoe30sIHJlbWFpbmluZ1Byb3BzLCB7XG4gICAgICAgICAgICAgICAgc3R5bGU6IF9leHRlbmRzKHt9LCBzdHlsZSwge1xuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6ICd1cmwoXFwnJyArIGNsZWFuU3JjICsgJ1xcJyknLFxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kU2l6ZTogXCJjb3ZlclwiLFxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kUG9zaXRpb246ICdjZW50ZXIgY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZFJlcGVhdDogJ25vLXJlcGVhdCcsXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbjogJ2F1dG8nXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBJbWFnZTtcbn0pKF9yZWFjdC5Db21wb25lbnQpO1xuXG5leHBvcnRzLkltYWdlID0gSW1hZ2U7XG5cbnZhciBJbWFnZUNvbnRhaW5lciA9IChmdW5jdGlvbiAoX0NvbXBvbmVudDIpIHtcbiAgICBfaW5oZXJpdHMoSW1hZ2VDb250YWluZXIsIF9Db21wb25lbnQyKTtcblxuICAgIGZ1bmN0aW9uIEltYWdlQ29udGFpbmVyKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgSW1hZ2VDb250YWluZXIpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEltYWdlQ29udGFpbmVyLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEltYWdlQ29udGFpbmVyLCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHNyYyA9IF9wcm9wczIuc3JjO1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gX3Byb3BzMi5zdHlsZTtcbiAgICAgICAgICAgIHZhciB3aWR0aCA9IF9wcm9wczIud2lkdGg7XG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gX3Byb3BzMi5oZWlnaHQ7XG4gICAgICAgICAgICB2YXIgaW1nU3R5bGUgPSBfcHJvcHMyLmltZ1N0eWxlO1xuICAgICAgICAgICAgdmFyIGltZ0NsYXNzTmFtZSA9IF9wcm9wczIuaW1nQ2xhc3NOYW1lO1xuICAgICAgICAgICAgdmFyIF9wcm9wczIkc2NhbGUgPSBfcHJvcHMyLnNjYWxlO1xuICAgICAgICAgICAgdmFyIHNjYWxlID0gX3Byb3BzMiRzY2FsZSA9PT0gdW5kZWZpbmVkID8gMSA6IF9wcm9wczIkc2NhbGU7XG5cbiAgICAgICAgICAgIHZhciByZW1haW5pbmcgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoX3Byb3BzMiwgWydzcmMnLCAnc3R5bGUnLCAnd2lkdGgnLCAnaGVpZ2h0JywgJ2ltZ1N0eWxlJywgJ2ltZ0NsYXNzTmFtZScsICdzY2FsZSddKTtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIF9leHRlbmRzKHsgc3R5bGU6IF9leHRlbmRzKHt9LCBJbWFnZUNvbnRhaW5lci5zdHlsZXMsIHN0eWxlKSB9LCByZW1haW5pbmcpLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEltYWdlLCB7XG4gICAgICAgICAgICAgICAgICAgIHNyYzogc3JjLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IGltZ0NsYXNzTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IF9leHRlbmRzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiB3aWR0aCAmJiB3aWR0aCAqIHNjYWxlIHx8IFwiMTAwJVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQgJiYgaGVpZ2h0ICogc2NhbGUgfHwgXCIxMDAlXCJcbiAgICAgICAgICAgICAgICAgICAgfSwgaW1nU3R5bGUpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSwgW3tcbiAgICAgICAga2V5OiAncHJvcFR5cGVzJyxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNyYzogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgICAgICAgICBpbWdDbGFzc05hbWU6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICAgICAgICAgIGltZ1N0eWxlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm9iamVjdCxcbiAgICAgICAgICAgICAgICB3aWR0aDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5udW1iZXIsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm51bWJlclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGVmYXVsdFByb3BzJyxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNyYzogXCJcIlxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc3R5bGVzJyxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGZsZXg6IDEsXG4gICAgICAgICAgICAgICAgZGlzcGxheTogXCJmbGV4XCIsXG4gICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICAgIG92ZXJmbG93OiAnYXV0bycsXG4gICAgICAgICAgICAgICAgd2lkdGg6IFwiMTAwJVwiLFxuICAgICAgICAgICAgICAgIGhlaWdodDogXCIxMDAlXCJcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gSW1hZ2VDb250YWluZXI7XG59KShfcmVhY3QuQ29tcG9uZW50KTtcblxuZXhwb3J0cy5JbWFnZUNvbnRhaW5lciA9IEltYWdlQ29udGFpbmVyO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgYXJyMltpXSA9IGFycltpXTsgcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3JlYWN0UmVkdXggPSByZXF1aXJlKCdyZWFjdC1yZWR1eCcpO1xuXG52YXIgX3JlZHV4ID0gcmVxdWlyZSgncmVkdXgnKTtcblxudmFyIF9jb21wb25lbnRzID0gcmVxdWlyZSgnLi9jb21wb25lbnRzJyk7XG5cbnZhciBfc2l6ZXMgPSByZXF1aXJlKCcuL3NpemVzJyk7XG5cbnZhciBfc2l6ZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc2l6ZXMpO1xuXG52YXIgY29uZiA9IHB5ZGlvLmdldFBsdWdpbkNvbmZpZ3MoJ2VkaXRvci5kaWFwb3JhbWEnKTtcbnZhciBzaXplcyA9IGNvbmYgJiYgY29uZi5nZXQoXCJQUkVWSUVXRVJfTE9XUkVTX1NJWkVTXCIpLnNwbGl0KFwiLFwiKSB8fCBbMzAwLCA3MDAsIDEwMDAsIDEzMDBdO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBQeWRpby5yZXF1aXJlTGliKCdob2MnKTtcblxudmFyIFNpemVQcm92aWRlcnMgPSBfUHlkaW8kcmVxdWlyZUxpYi5TaXplUHJvdmlkZXJzO1xudmFyIHdpdGhSZXNvbHV0aW9uID0gX1B5ZGlvJHJlcXVpcmVMaWIud2l0aFJlc29sdXRpb247XG52YXIgd2l0aFNlbGVjdGlvbiA9IF9QeWRpbyRyZXF1aXJlTGliLndpdGhTZWxlY3Rpb247XG52YXIgd2l0aFJlc2l6ZSA9IF9QeWRpbyRyZXF1aXJlTGliLndpdGhSZXNpemU7XG52YXIgRWRpdG9yQWN0aW9ucyA9IF9QeWRpbyRyZXF1aXJlTGliLkVkaXRvckFjdGlvbnM7XG52YXIgSW1hZ2VTaXplUHJvdmlkZXIgPSBTaXplUHJvdmlkZXJzLkltYWdlU2l6ZVByb3ZpZGVyO1xudmFyIENvbnRhaW5lclNpemVQcm92aWRlciA9IFNpemVQcm92aWRlcnMuQ29udGFpbmVyU2l6ZVByb3ZpZGVyO1xuXG52YXIgRXh0ZW5kZWRJbWFnZUNvbnRhaW5lciA9IHdpdGhSZXNpemUoX2NvbXBvbmVudHMuSW1hZ2VDb250YWluZXIpO1xuXG52YXIgRWRpdG9yID0gKGZ1bmN0aW9uIChfUHVyZUNvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhFZGl0b3IsIF9QdXJlQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIEVkaXRvcigpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIF9FZGl0b3IpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKF9FZGl0b3IucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRWRpdG9yLCBbe1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3Rpb25QbGF5aW5nICE9PSBuZXh0UHJvcHMuc2VsZWN0aW9uUGxheWluZykge1xuICAgICAgICAgICAgICAgIGlmIChuZXh0UHJvcHMuc2VsZWN0aW9uUGxheWluZykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBlID0gbmV3IFBlcmlvZGljYWxFeGVjdXRlcihuZXh0UHJvcHMub25SZXF1ZXN0U2VsZWN0aW9uUGxheSwgMyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wZSAmJiB0aGlzLnBlLnN0b3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZWRpdG9yTW9kaWZ5ID0gdGhpcy5wcm9wcy5lZGl0b3JNb2RpZnk7XG5cbiAgICAgICAgICAgIGlmIChuZXh0UHJvcHMuaXNBY3RpdmUpIHtcbiAgICAgICAgICAgICAgICBlZGl0b3JNb2RpZnkoeyBmaXhlZFRvb2xiYXI6IGZhbHNlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IF9wcm9wcy5ub2RlO1xuICAgICAgICAgICAgdmFyIHNyYyA9IF9wcm9wcy5zcmM7XG4gICAgICAgICAgICB2YXIgZWRpdG9yRGF0YSA9IF9wcm9wcy5lZGl0b3JEYXRhO1xuXG4gICAgICAgICAgICBpZiAoIW5vZGUpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgdmFyIG9yaWVudGF0aW9uID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoXCJpbWFnZV9leGlmX29yaWVudGF0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb24gPSBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KFwiaW1hZ2VfZXhpZl9vcmllbnRhdGlvblwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGltYWdlQ2xhc3NOYW1lID0gWydkaWFwb3JhbWEtaW1hZ2UtbWFpbi1ibG9jayddO1xuXG4gICAgICAgICAgICBpZiAob3JpZW50YXRpb24pIHtcbiAgICAgICAgICAgICAgICBpbWFnZUNsYXNzTmFtZSA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkoaW1hZ2VDbGFzc05hbWUpLCBbJ29ydC1yb3RhdGUtJyArIG9yaWVudGF0aW9uXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vICAgICA8Q29udGFpbmVyU2l6ZVByb3ZpZGVyPlxuICAgICAgICAgICAgLy8gICAgIHsoe2NvbnRhaW5lcldpZHRoLCBjb250YWluZXJIZWlnaHR9KSA9PlxuICAgICAgICAgICAgLy8gICAgICAgICA8SW1hZ2VTaXplUHJvdmlkZXIgdXJsPXtzcmN9IG5vZGU9e25vZGV9PlxuICAgICAgICAgICAgLy8gICAgICAgICB7KHtpbWdXaWR0aCwgaW1nSGVpZ2h0fSkgPT5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgIC8vICAgICA8L0ltYWdlU2l6ZVByb3ZpZGVyPlxuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gPC9Db250YWluZXJTaXplUHJvdmlkZXI+XG5cbiAgICAgICAgICAgIC8vIHdpZHRoPXtpbWdXaWR0aH1cbiAgICAgICAgICAgIC8vIGhlaWdodD17aW1nSGVpZ2h0fVxuICAgICAgICAgICAgLy8gY29udGFpbmVyV2lkdGg9e2NvbnRhaW5lcldpZHRofVxuICAgICAgICAgICAgLy8gY29udGFpbmVySGVpZ2h0PXtjb250YWluZXJIZWlnaHR9XG4gICAgICAgICAgICBpZiAoIXNyYykge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEV4dGVuZGVkSW1hZ2VDb250YWluZXIsIHtcbiAgICAgICAgICAgICAgICBlZGl0b3JEYXRhOiBlZGl0b3JEYXRhLFxuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgICAgICAgICAgc3JjOiBzcmMsXG4gICAgICAgICAgICAgICAgcmVuZGVyT25DaGFuZ2U6IHRydWUsXG4gICAgICAgICAgICAgICAgcGFzc09uUHJvcHM6IHRydWUsXG4gICAgICAgICAgICAgICAgaW1nQ2xhc3NOYW1lOiBpbWFnZUNsYXNzTmFtZS5qb2luKFwiIFwiKSxcbiAgICAgICAgICAgICAgICBpbWdTdHlsZTogeyBib3hTaGFkb3c6ICdyZ2JhKDAsIDAsIDAsIDAuMTE3NjQ3KSAwcHggMXB4IDZweCwgcmdiYSgwLCAwLCAwLCAwLjExNzY0NykgMHB4IDFweCA0cHgnIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfV0sIFt7XG4gICAgICAgIGtleTogJ3Byb3BUeXBlcycsXG4gICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBub2RlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoQWp4cE5vZGUpLmlzUmVxdWlyZWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICB2YXIgX0VkaXRvciA9IEVkaXRvcjtcbiAgICBFZGl0b3IgPSAoMCwgX3JlYWN0UmVkdXguY29ubmVjdCkobnVsbCwgRWRpdG9yQWN0aW9ucykoRWRpdG9yKSB8fCBFZGl0b3I7XG4gICAgcmV0dXJuIEVkaXRvcjtcbn0pKF9yZWFjdC5QdXJlQ29tcG9uZW50KTtcblxudmFyIGdldFNlbGVjdGlvbkZpbHRlciA9IGZ1bmN0aW9uIGdldFNlbGVjdGlvbkZpbHRlcihub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ2lzX2ltYWdlJyk7XG59O1xudmFyIGdldFNlbGVjdGlvbiA9IGZ1bmN0aW9uIGdldFNlbGVjdGlvbihub2RlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgdmFyIHNlbGVjdGlvbiA9IFtdO1xuXG4gICAgICAgIG5vZGUuZ2V0UGFyZW50KCkuZ2V0Q2hpbGRyZW4oKS5mb3JFYWNoKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGlvbi5wdXNoKGNoaWxkKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHNlbGVjdGlvbiA9IHNlbGVjdGlvbi5maWx0ZXIoZ2V0U2VsZWN0aW9uRmlsdGVyKS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5nZXRMYWJlbCgpLmxvY2FsZUNvbXBhcmUoYi5nZXRMYWJlbCgpLCB1bmRlZmluZWQsIHsgbnVtZXJpYzogdHJ1ZSB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICBzZWxlY3Rpb246IHNlbGVjdGlvbixcbiAgICAgICAgICAgIGN1cnJlbnRJbmRleDogc2VsZWN0aW9uLnJlZHVjZShmdW5jdGlvbiAoY3VycmVudEluZGV4LCBjdXJyZW50LCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50ID09PSBub2RlICYmIGluZGV4IHx8IGN1cnJlbnRJbmRleDtcbiAgICAgICAgICAgIH0sIDApXG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxudmFyIG1hcFN0YXRlVG9Qcm9wcyA9IGZ1bmN0aW9uIG1hcFN0YXRlVG9Qcm9wcyhzdGF0ZSwgcHJvcHMpIHtcbiAgICB2YXIgbm9kZSA9IHByb3BzLm5vZGU7XG4gICAgdmFyIGVkaXRvckRhdGEgPSBwcm9wcy5lZGl0b3JEYXRhO1xuXG4gICAgaWYgKCFub2RlKSByZXR1cm4gcHJvcHM7XG5cbiAgICB2YXIgdGFicyA9IHN0YXRlLnRhYnM7XG5cbiAgICB2YXIgdGFiID0gdGFicy5maWx0ZXIoZnVuY3Rpb24gKF9yZWYpIHtcbiAgICAgICAgdmFyIGN1cnJlbnRFZGl0b3JEYXRhID0gX3JlZi5lZGl0b3JEYXRhO1xuICAgICAgICB2YXIgY3VycmVudE5vZGUgPSBfcmVmLm5vZGU7XG4gICAgICAgIHJldHVybiAoIWN1cnJlbnRFZGl0b3JEYXRhIHx8IGN1cnJlbnRFZGl0b3JEYXRhLmlkID09PSBlZGl0b3JEYXRhLmlkKSAmJiBjdXJyZW50Tm9kZS5nZXRQYXRoKCkgPT09IG5vZGUuZ2V0UGF0aCgpO1xuICAgIH0pWzBdIHx8IHt9O1xuXG4gICAgaWYgKCF0YWIpIHJldHVybiBwcm9wcztcblxuICAgIHZhciB0YWJOb2RlID0gdGFiLm5vZGU7XG4gICAgdmFyIHRhYlJlc29sdXRpb24gPSB0YWIucmVzb2x1dGlvbjtcblxuICAgIHJldHVybiBfZXh0ZW5kcyh7XG4gICAgICAgIG9yaWVudGF0aW9uOiB0YWJSZXNvbHV0aW9uID09PSAnaGknID8gdGFiTm9kZS5nZXRNZXRhZGF0YSgpLmdldChcImltYWdlX2V4aWZfb3JpZW50YXRpb25cIikgOiBudWxsXG4gICAgfSwgcHJvcHMpO1xufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gKDAsIF9yZWR1eC5jb21wb3NlKSh3aXRoU2VsZWN0aW9uKGdldFNlbGVjdGlvbiwgZ2V0U2VsZWN0aW9uRmlsdGVyKSwgd2l0aFJlc29sdXRpb24oc2l6ZXMsIGZ1bmN0aW9uIChub2RlKSB7XG4gICAgcmV0dXJuICgwLCBfc2l6ZXMyWydkZWZhdWx0J10pKG5vZGUsIFwiaHFcIik7XG59LCBmdW5jdGlvbiAobm9kZSwgZGltZW5zaW9uKSB7XG4gICAgcmV0dXJuICgwLCBfc2l6ZXMyWydkZWZhdWx0J10pKG5vZGUsIFwiZWRpdG9yXCIpO1xufSksICgwLCBfcmVhY3RSZWR1eC5jb25uZWN0KShtYXBTdGF0ZVRvUHJvcHMpKShFZGl0b3IpO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZShvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9ialsnZGVmYXVsdCddIDogb2JqOyB9XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKG9iaikgeyBpZiAob2JqICYmIG9iai5fX2VzTW9kdWxlKSB7IHJldHVybiBvYmo7IH0gZWxzZSB7IHZhciBuZXdPYmogPSB7fTsgaWYgKG9iaiAhPSBudWxsKSB7IGZvciAodmFyIGtleSBpbiBvYmopIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIG5ld09ialtrZXldID0gb2JqW2tleV07IH0gfSBuZXdPYmpbJ2RlZmF1bHQnXSA9IG9iajsgcmV0dXJuIG5ld09iajsgfSB9XG5cbnZhciBfYWN0aW9ucyA9IHJlcXVpcmUoJy4vYWN0aW9ucycpO1xuXG52YXIgQWN0aW9ucyA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9hY3Rpb25zKTtcblxuZXhwb3J0cy5BY3Rpb25zID0gQWN0aW9ucztcblxudmFyIF9wcmV2aWV3ID0gcmVxdWlyZSgnLi9wcmV2aWV3Jyk7XG5cbmV4cG9ydHMuQmFkZ2UgPSBfaW50ZXJvcFJlcXVpcmUoX3ByZXZpZXcpO1xuZXhwb3J0cy5QYW5lbCA9IF9pbnRlcm9wUmVxdWlyZShfcHJldmlldyk7XG5cbnZhciBfZWRpdG9yID0gcmVxdWlyZSgnLi9lZGl0b3InKTtcblxuZXhwb3J0cy5FZGl0b3IgPSBfaW50ZXJvcFJlcXVpcmUoX2VkaXRvcik7XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94LCBfeDIsIF94MykgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeCwgcHJvcGVydHkgPSBfeDIsIHJlY2VpdmVyID0gX3gzOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94ID0gcGFyZW50OyBfeDIgPSBwcm9wZXJ0eTsgX3gzID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMob2JqLCBrZXlzKSB7IHZhciB0YXJnZXQgPSB7fTsgZm9yICh2YXIgaSBpbiBvYmopIHsgaWYgKGtleXMuaW5kZXhPZihpKSA+PSAwKSBjb250aW51ZTsgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBpKSkgY29udGludWU7IHRhcmdldFtpXSA9IG9ialtpXTsgfSByZXR1cm4gdGFyZ2V0OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfY29tcG9uZW50cyA9IHJlcXVpcmUoJy4vY29tcG9uZW50cycpO1xuXG52YXIgX3NpemVzID0gcmVxdWlyZSgnLi9zaXplcycpO1xuXG52YXIgX3NpemVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NpemVzKTtcblxudmFyIFByZXZpZXcgPSAoZnVuY3Rpb24gKF9Db21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoUHJldmlldywgX0NvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBQcmV2aWV3KHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQcmV2aWV3KTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihQcmV2aWV3LnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0geyBzcmM6ICcnIH07XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFByZXZpZXcsIFt7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudERpZE1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnByb3BzLm5vZGU7XG5cbiAgICAgICAgICAgICgwLCBfc2l6ZXMyWydkZWZhdWx0J10pKG5vZGUsICdwcmV2aWV3JykudGhlbihmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgICAgICAgICAgaWYgKHVybCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IHNyYzogdXJsIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IF9wcm9wcy5ub2RlO1xuXG4gICAgICAgICAgICB2YXIgcmVtYWluaW5nUHJvcHMgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoX3Byb3BzLCBbJ25vZGUnXSk7XG5cbiAgICAgICAgICAgIHZhciBvcmllbnRhdGlvbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChub2RlICYmIG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoXCJpbWFnZV9leGlmX29yaWVudGF0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb24gPSBub2RlLmdldE1ldGFkYXRhKCkuZ2V0KFwiaW1hZ2VfZXhpZl9vcmllbnRhdGlvblwiKTtcbiAgICAgICAgICAgICAgICBpZiAocmVtYWluaW5nUHJvcHMuY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZ1Byb3BzLmNsYXNzTmFtZSArPSAnIG9ydC1yb3RhdGUtJyArIG9yaWVudGF0aW9uO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZ1Byb3BzLmNsYXNzTmFtZSA9ICdvcnQtcm90YXRlLScgKyBvcmllbnRhdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KG9yaWVudGF0aW9uKSA+PSA1ICYmIHJlbWFpbmluZ1Byb3BzLnN0eWxlICYmIHJlbWFpbmluZ1Byb3BzLnN0eWxlLmhlaWdodCA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZ1Byb3BzLnN0eWxlLmhlaWdodCA9IDI1MDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzcmMgPSB0aGlzLnN0YXRlLnNyYztcblxuICAgICAgICAgICAgaWYgKCFzcmMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfY29tcG9uZW50cy5JbWFnZUNvbnRhaW5lciwgX2V4dGVuZHMoe30sIHJlbWFpbmluZ1Byb3BzLCB7XG4gICAgICAgICAgICAgICAgc3JjOiBzcmMsXG4gICAgICAgICAgICAgICAgaW1nU3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IFwiMTAwJVwiLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IFwiMTAwJVwiLFxuICAgICAgICAgICAgICAgICAgICBmbGV4OiAxXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFByZXZpZXc7XG59KShfcmVhY3QuQ29tcG9uZW50KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gUHJldmlldztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbnZhciBfcHlkaW9IdHRwQXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9weWRpb0h0dHBBcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwQXBpKTtcblxuZnVuY3Rpb24gdXJsRm9yU2l6ZShub2RlLCB2aWV3VHlwZSkge1xuICAgIGlmICghbm9kZSkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFwiXCIpO1xuICAgIH1cbiAgICB2YXIgbWV0YSA9IG5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoXCJ0aHVtYm5haWxzXCIpIHx8IFtdO1xuICAgIHZhciB0aHVtYnMgPSB7fTtcbiAgICBtZXRhLm1hcChmdW5jdGlvbiAobSkge1xuICAgICAgICB0aHVtYnNbbS5zaXplXSA9IG07XG4gICAgICAgIGlmIChtLmlkKSB7XG4gICAgICAgICAgICB0aHVtYnNbbS5pZF0gPSBtO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgdmFyIHRodW1ic0tleXMgPSBPYmplY3Qua2V5cyh0aHVtYnMpO1xuICAgIHZhciBkZWYgPSB1bmRlZmluZWQ7XG4gICAgaWYgKHRodW1ic0tleXMubGVuZ3RoKSB7XG4gICAgICAgIGRlZiA9IHRodW1ic1t0aHVtYnNLZXlzWzBdXS5zaXplO1xuICAgIH1cbiAgICBzd2l0Y2ggKHZpZXdUeXBlKSB7XG4gICAgICAgIGNhc2UgXCJwcmV2aWV3XCI6XG4gICAgICAgICAgICBpZiAodGh1bWJzWydzbSddKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlcmUgaXMgdGh1bWIgd2l0aCBnaXZlbiBJRFxuICAgICAgICAgICAgICAgIHJldHVybiB0aHVtYlVybChub2RlLCB0aHVtYnNbJ3NtJ10uc2l6ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRodW1ic1syNTZdKSB7XG4gICAgICAgICAgICAgICAgLy8gUGljayAyNTYgYnkgZGVmYXVsdFxuICAgICAgICAgICAgICAgIHJldHVybiB0aHVtYlVybChub2RlLCAyNTYpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChkZWYpIHtcbiAgICAgICAgICAgICAgICAvLyBQaWNrIGZpcnN0IHRodW1iIGZvdW5kXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRodW1iVXJsKG5vZGUsIGRlZik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFJldHVybiBIUVxuICAgICAgICAgICAgICAgIHJldHVybiBocVVybChub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSBcImVkaXRvclwiOlxuICAgICAgICAgICAgaWYgKHRodW1ic1snbWQnXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aHVtYlVybChub2RlLCB0aHVtYnNbJ21kJ10uc2l6ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRodW1ic1s1MTJdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRodW1iVXJsKG5vZGUsIDUxMik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRlZikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aHVtYlVybChub2RlLCBkZWYpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaHFVcmwobm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJocVwiOlxuICAgICAgICAgICAgcmV0dXJuIGhxVXJsKG5vZGUpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGhxVXJsKG5vZGUpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdGh1bWJVcmwobm9kZSwgc2l6ZSkge1xuICAgIHJldHVybiBfcHlkaW9IdHRwQXBpMltcImRlZmF1bHRcIl0uZ2V0Q2xpZW50KCkuYnVpbGRQcmVzaWduZWRHZXRVcmwobm9kZSwgbnVsbCwgJ2ltYWdlL2pwZWcnLCB7IEJ1Y2tldDogJ2lvJywgS2V5OiAncHlkaW8tdGh1bWJzdG9yZS8nICsgbm9kZS5nZXRNZXRhZGF0YSgpLmdldCgndXVpZCcpICsgJy0nICsgc2l6ZSArICcuanBnJyB9KTtcbn1cblxuZnVuY3Rpb24gaHFVcmwobm9kZSkge1xuICAgIHJldHVybiBfcHlkaW9IdHRwQXBpMltcImRlZmF1bHRcIl0uZ2V0Q2xpZW50KCkuYnVpbGRQcmVzaWduZWRHZXRVcmwobm9kZSwgbnVsbCwgJ2ltYWdlLycgKyBub2RlLmdldEFqeHBNaW1lKCkpO1xufVxuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHVybEZvclNpemU7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdO1xuIl19
