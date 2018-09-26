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

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _utils = require('./utils');

var _providers = require('./providers');

var _utils2 = require('../utils');

var _reactPanAndZoomHoc = require('react-pan-and-zoom-hoc');

var _reactPanAndZoomHoc2 = _interopRequireDefault(_reactPanAndZoomHoc);

var withResize = function withResize(Component) {
    return(
        // @panAndZoomHoc
        (function (_React$Component) {
            _inherits(_class, _React$Component);

            function _class() {
                _classCallCheck(this, _class2);

                _React$Component.apply(this, arguments);
            }

            _class.prototype.componentDidMount = function componentDidMount() {
                this.loadSize(this.props);
            };

            _class.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
                var scale = nextProps.scale;
                var size = nextProps.size;
                var containerWidth = nextProps.containerWidth;
                var width = nextProps.width;
                var containerHeight = nextProps.containerHeight;
                var height = nextProps.height;

                if (size !== this.props.size || width !== this.props.width || height !== this.props.height || containerWidth !== this.props.containerWidth || containerHeight !== this.props.containerHeight) {
                    this.loadSize(nextProps);
                }
            };

            _class.prototype.loadSize = function loadSize(props) {
                var _props$scale = props.scale;
                var scale = _props$scale === undefined ? 1 : _props$scale;
                var _props$size = props.size;
                var size = _props$size === undefined ? "contain" : _props$size;
                var dispatch = props.dispatch;
                var containerWidth = props.containerWidth;
                var width = props.width;
                var containerHeight = props.containerHeight;
                var height = props.height;

                var state = {
                    size: size,
                    scale: _utils2.getRatio[size]({
                        scale: scale,
                        widthRatio: containerWidth / width,
                        heightRatio: containerHeight / height
                    })
                };

                dispatch(_utils2.EditorActions.editorModify(state));
            };

            _class.prototype.render = function render() {
                var _props = this.props;
                var scale = _props.scale;
                var dispatch = _props.dispatch;

                var remainingProps = _objectWithoutProperties(_props, ['scale', 'dispatch']);

                return _react2['default'].createElement(Component, _extends({}, remainingProps, {
                    scale: scale
                }));
            };

            _createClass(_class, null, [{
                key: 'displayName',
                get: function get() {
                    return 'WithResize(' + _utils2.getDisplayName(Component) + ')';
                }
            }, {
                key: 'propTypes',
                get: function get() {
                    return {
                        size: _react2['default'].PropTypes.oneOf(["contain", "cover", "auto"]).isRequired,
                        containerWidth: _react2['default'].PropTypes.number.isRequired,
                        containerHeight: _react2['default'].PropTypes.number.isRequired,
                        width: _react2['default'].PropTypes.number.isRequired,
                        height: _react2['default'].PropTypes.number.isRequired
                    };
                }
            }]);

            var _class2 = _class;
            _class = _reactRedux.connect(_utils.mapStateToProps)(_class) || _class;
            _class = _providers.withContainerSize(_class) || _class;
            _class = _providers.withImageSize(_class) || _class;
            return _class;
        })(_react2['default'].Component)
    );
};
exports.withResize = withResize;
