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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

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

var ImageSizeProvider = (function (_React$PureComponent2) {
    _inherits(ImageSizeProvider, _React$PureComponent2);

    _createClass(ImageSizeProvider, null, [{
        key: 'propTypes',
        get: function get() {
            return {
                url: _react2['default'].PropTypes.string.isRequired,
                node: _react2['default'].PropTypes.instanceOf(AjxpNode).isRequired,
                children: _react2['default'].PropTypes.func.isRequired
            };
        }
    }]);

    function ImageSizeProvider(props) {
        var _this2 = this;

        _classCallCheck(this, ImageSizeProvider);

        _React$PureComponent2.call(this, props);

        var node = this.props.node;

        var meta = node.getMetadata();

        this.state = {
            imgWidth: meta.has('image_width') && parseInt(meta.get('image_width')) || 200,
            imgHeight: meta.has('image_height') && parseInt(meta.get('image_height')) || 200
        };

        this.updateSize = function (imgWidth, imgHeight) {
            return _this2.setState({ imgWidth: imgWidth, imgHeight: imgHeight });
        };
        this.getImageSize = _lodash2['default'].throttle(DOMUtils.imageLoader, 100);
    }

    ImageSizeProvider.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
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

    ImageSizeProvider.prototype.render = function render() {
        return this.props.children(this.state);
    };

    return ImageSizeProvider;
})(_react2['default'].PureComponent);

exports.ImageSizeProvider = ImageSizeProvider;
