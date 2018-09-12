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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _reactContainerDimensions = require('react-container-dimensions');

var _reactContainerDimensions2 = _interopRequireDefault(_reactContainerDimensions);

var _utils = require('../utils');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var ContainerSizeProvider = (function (_React$PureComponent) {
    _inherits(ContainerSizeProvider, _React$PureComponent);

    function ContainerSizeProvider(props) {
        var _this = this;

        _classCallCheck(this, ContainerSizeProvider);

        _React$PureComponent.call(this, props);

        this.state = {};

        this._observer = function (e) {
            return _this.resize();
        };
    }

    ContainerSizeProvider.prototype.resize = function resize() {
        var node = ReactDOM.findDOMNode(this);
        var dimensions = node && _utils.getBoundingRect(node) || {};

        this.setState({
            containerWidth: parseInt(dimensions.width),
            containerHeight: parseInt(dimensions.height)
        });
    };

    ContainerSizeProvider.prototype.componentDidMount = function componentDidMount() {
        DOMUtils.observeWindowResize(this._observer);

        this.resize();
    };

    ContainerSizeProvider.prototype.componentWillUnmount = function componentWillUnmount() {
        DOMUtils.stopObservingWindowResize(this._observer);
    };

    ContainerSizeProvider.prototype.render = function render() {
        return this.props.children(this.state);
    };

    return ContainerSizeProvider;
})(_react2['default'].PureComponent);

exports.ContainerSizeProvider = ContainerSizeProvider;
var withContainerSize = function withContainerSize(Component) {
    return (function (_React$PureComponent2) {
        _inherits(_class, _React$PureComponent2);

        function _class(props) {
            var _this2 = this;

            _classCallCheck(this, _class);

            _React$PureComponent2.call(this, props);

            this.state = {};

            this._observer = function (e) {
                return _this2.resize();
            };
        }

        _class.prototype.resize = function resize() {
            var node = ReactDOM.findDOMNode(this);
            var dimensions = node && _utils.getBoundingRect(node) || {};

            this.setState({
                containerWidth: parseInt(dimensions.width),
                containerHeight: parseInt(dimensions.height)
            });
        };

        _class.prototype.componentDidMount = function componentDidMount() {
            DOMUtils.observeWindowResize(this._observer);

            this.resize();
        };

        _class.prototype.componentWillUnmount = function componentWillUnmount() {
            DOMUtils.stopObservingWindowResize(this._observer);
        };

        _class.prototype.render = function render() {
            var _this3 = this;

            var _state = this.state;
            var containerWidth = _state.containerWidth;
            var containerHeight = _state.containerHeight;

            return _react2['default'].createElement(
                _reactContainerDimensions2['default'],
                null,
                function (_ref) {
                    var width = _ref.width;
                    var height = _ref.height;
                    return _react2['default'].createElement(Component, _extends({ containerWidth: width, containerHeight: height }, _this3.props));
                }
            );
        };

        _createClass(_class, null, [{
            key: 'displayName',
            get: function get() {
                return 'WithContainerResize(' + _utils.getDisplayName(Component) + ')';
            }
        }]);

        return _class;
    })(_react2['default'].PureComponent);
};

exports.withContainerSize = withContainerSize;
var withImageSize = function withImageSize(Component) {
    return (function (_React$PureComponent3) {
        _inherits(_class2, _React$PureComponent3);

        _createClass(_class2, null, [{
            key: 'propTypes',
            get: function get() {
                return {
                    url: _react2['default'].PropTypes.string.isRequired,
                    node: _react2['default'].PropTypes.instanceOf(AjxpNode).isRequired,
                    children: _react2['default'].PropTypes.func.isRequired
                };
            }
        }]);

        function _class2(props) {
            var _this4 = this;

            _classCallCheck(this, _class2);

            _React$PureComponent3.call(this, props);

            var node = this.props.node;

            var meta = node.getMetadata();

            this.state = {
                imgWidth: meta.has('image_width') && parseInt(meta.get('image_width')) || 200,
                imgHeight: meta.has('image_height') && parseInt(meta.get('image_height')) || 200
            };

            this.updateSize = function (imgWidth, imgHeight) {
                return _this4.setState({ imgWidth: imgWidth, imgHeight: imgHeight });
            };
            this.getImageSize = _lodash2['default'].throttle(DOMUtils.imageLoader, 100);
        }

        _class2.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
            var url = nextProps.url;
            var node = nextProps.node;

            var meta = node.getMetadata();

            var update = this.updateSize;

            this.getImageSize(url, function () {
                if (!meta.has('image_width')) {
                    meta.set("image_width", this.width);
                    meta.set("image_height", this.height);
                }

                update(this.width, this.height);
            }, function () {
                if (meta.has('image_width')) {
                    update(meta.get('image_width'), meta.get('image_height'));
                }
            });
        };

        _class2.prototype.componentDidMount = function componentDidMount() {
            var test = ReactDOM.findDOMNode(this);
        };

        _class2.prototype.render = function render() {
            var _state2 = this.state;
            var imgWidth = _state2.imgWidth;
            var imgHeight = _state2.imgHeight;

            return _react2['default'].createElement(Component, _extends({ imgWidth: imgWidth, imgHeight: imgHeight }, this.props));
        };

        _createClass(_class2, null, [{
            key: 'displayName',
            get: function get() {
                return 'WithImageResize(' + _utils.getDisplayName(Component) + ')';
            }
        }]);

        return _class2;
    })(_react2['default'].PureComponent);
};
exports.withImageSize = withImageSize;
