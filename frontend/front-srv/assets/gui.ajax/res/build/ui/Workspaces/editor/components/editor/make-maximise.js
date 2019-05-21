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

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _reactMotion = require('react-motion');

var _HOCsUtils = require('../../../../HOCs/utils');

var ANIMATION = { stiffness: 400, damping: 30 };
var TARGET = 100;

var makeMaximise = function makeMaximise(Target) {
    return (function (_React$Component) {
        _inherits(_class, _React$Component);

        function _class(props) {
            _classCallCheck(this, _class);

            _React$Component.call(this, props);
            this.state = { maximised: props.maximised };
        }

        _class.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
            this.setState({
                maximised: nextProps.maximised
            });
        };

        _class.prototype.render = function render() {
            var _this = this;

            var _props$style = this.props.style;
            var style = _props$style === undefined ? {} : _props$style;
            var _style$width = style.width;
            var width = _style$width === undefined ? "0" : _style$width;
            var _style$height = style.height;
            var height = _style$height === undefined ? "0" : _style$height;
            var maximised = this.state.maximised;

            var motionStyle = {
                width: maximised ? _reactMotion.spring(TARGET, ANIMATION) : _reactMotion.spring(parseInt(width.replace(/%$/, '')), ANIMATION),
                height: maximised ? _reactMotion.spring(TARGET, ANIMATION) : _reactMotion.spring(parseInt(height.replace(/%$/, '')), ANIMATION)
            };

            return React.createElement(
                _reactMotion.Motion,
                { style: motionStyle },
                function (_ref) {
                    var width = _ref.width;
                    var height = _ref.height;

                    return React.createElement(Target, _extends({}, _this.props, {
                        style: _extends({}, style, {
                            width: width + '%',
                            height: height + '%',
                            transition: "none"
                        })
                    }));
                }
            );
        };

        _createClass(_class, null, [{
            key: 'displayName',
            get: function get() {
                return 'MakeMaximise(' + _HOCsUtils.getDisplayName(Target) + ')';
            }
        }]);

        return _class;
    })(React.Component);
};

exports['default'] = makeMaximise;
module.exports = exports['default'];
