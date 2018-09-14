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

var _materialUi = require('material-ui');

var _materialUiSvgIconsActionAspectRatio = require('material-ui/svg-icons/action/aspect-ratio');

var _materialUiSvgIconsActionAspectRatio2 = _interopRequireDefault(_materialUiSvgIconsActionAspectRatio);

var _reactRedux = require('react-redux');

var _utils = require('./utils');

var _utils2 = require('../utils');

var withSizeControls = function withSizeControls(Component) {
    return (function (_React$Component) {
        _inherits(_class, _React$Component);

        function _class() {
            _classCallCheck(this, _class2);

            _React$Component.apply(this, arguments);
        }

        _class.prototype.render = function render() {
            var _props = this.props;
            var size = _props.size;
            var scale = _props.scale;

            var remaining = _objectWithoutProperties(_props, ['size', 'scale']);

            var fn = _utils2.handler("onSizeChange", this.props);

            return React.createElement(Component, _extends({
                size: size,
                scale: scale,
                onSizeChange: function (sizeProps) {
                    return fn(sizeProps);
                }
            }, remaining));
        };

        _createClass(_class, null, [{
            key: 'displayName',
            get: function get() {
                return 'WithSizeControls(' + _utils2.getDisplayName(Component) + ')';
            }
        }]);

        var _class2 = _class;
        _class = _reactRedux.connect(_utils.mapStateToProps)(_class) || _class;
        return _class;
    })(React.Component);
};

exports.withSizeControls = withSizeControls;
var styles = {
    sliderContainer: {
        width: "100%",
        height: 150,
        display: "flex",
        justifyContent: "center"
    },
    slider: {
        margin: 0
    }
};

var AspectRatio = _reactRedux.connect(_utils.mapStateToProps)(function (props) {
    return React.createElement(
        _materialUi.IconButton,
        { onClick: function () {
                return _utils2.handler("onSizeChange", props)({ size: "contain" });
            } },
        React.createElement(_materialUiSvgIconsActionAspectRatio2['default'], null)
    );
});

exports.AspectRatio = AspectRatio;
var Scale = _reactRedux.connect(_utils.mapStateToProps)(function (props) {
    return React.createElement(
        _materialUi.DropDownMenu,
        null,
        React.createElement(_materialUi.MenuItem, { primaryText: parseInt(props.scale * 100) + '%' }),
        React.createElement(_materialUi.Slider, {
            axis: 'y',
            style: styles.sliderContainer,
            sliderStyle: styles.slider,
            value: props.scale,
            min: 0.01,
            max: 4,
            onChange: function (_, scale) {
                return _utils2.handler("onSizeChange", props)({ size: "auto", scale: scale });
            } })
    );
});
exports.Scale = Scale;
