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
