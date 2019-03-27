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

exports.withHideDisabled = withHideDisabled;
exports.withDisabled = withDisabled;
exports.withDimensions = withDimensions;
exports.withMouseTracker = withMouseTracker;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _redux = require('redux');

var _materialUi = require('material-ui');

var _reactContainerDimensions = require('react-container-dimensions');

var _reactContainerDimensions2 = _interopRequireDefault(_reactContainerDimensions);

var _sizeProviders = require('./size/providers');

var _utils = require('./utils');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var getDisplayName = function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
};

var withMenu = function withMenu(WrappedComponent) {
    return (function (_Component) {
        _inherits(_class, _Component);

        function _class() {
            _classCallCheck(this, _class);

            _Component.apply(this, arguments);
        }

        _class.prototype.getControlsFromObject = function getControlsFromObject(controls, group) {
            var _this = this;

            return Object.keys(controls).map(function (type) {
                var _props = _this.props;

                var disabled = _props['' + group + _utils.toTitleCase(type) + 'Disabled'];

                var handler = _props['on' + _utils.toTitleCase(group) + _utils.toTitleCase(type)];

                var props = _objectWithoutProperties(_props, ['' + group + _utils.toTitleCase(type) + 'Disabled', 'on' + _utils.toTitleCase(group) + _utils.toTitleCase(type)]);

                if (typeof handler !== "function") return null;

                return React.cloneElement(controls[type](handler), { disabled: disabled });
            }).filter(function (element) {
                return element;
            });
        };

        _class.prototype.render = function render() {
            var _this2 = this;

            var _props2 = this.props;
            var id = _props2.id;
            var controls = _props2.controls;
            var dispatch = _props2.dispatch;

            var remainingProps = _objectWithoutProperties(_props2, ['id', 'controls', 'dispatch']);

            var groups = Object.keys(controls);

            var toolbarGroups = groups.map(function (group) {
                return controls[group] instanceof Array ? controls[group] : _this2.getControlsFromObject(controls[group], group);
            }).filter(function (el) {
                return el.length > 0;
            }).map(function (controls, index) {
                return React.createElement(
                    _materialUi.ToolbarGroup,
                    { firstChild: index === 0, lastChild: index === groups.length - 1 },
                    controls
                );
            });

            return React.createElement(
                'div',
                { style: { display: "flex", flexDirection: "column", flex: 1, overflow: "auto" } },
                toolbarGroups.length > 0 && React.createElement(
                    _materialUi.Toolbar,
                    { style: { flexShrink: 0 } },
                    toolbarGroups
                ),
                React.createElement(WrappedComponent, remainingProps)
            );
        };

        _createClass(_class, null, [{
            key: 'displayName',
            get: function get() {
                return 'WithMenu(' + getDisplayName(WrappedComponent) + ')';
            }
        }, {
            key: 'defaultProps',
            get: function get() {
                return {
                    controls: []
                };
            }
        }]);

        return _class;
    })(_react.Component);
};

/*static get propTypes() {
    return Object.keys(newControls).map(type => ({
        [`${type}Disabled`]: React.PropTypes.bool,
        [`on${toTitleCase(type)}`]: React.PropTypes.func
    }))
}

static get defaultProps() {
    return Object.keys(newControls).map(type => ({
        [`${type}Disabled`]: false
    }))
}*/

var withControls = function withControls() {
    var newControls = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return function (WrappedComponent) {
        return (function (_Component2) {
            _inherits(_class2, _Component2);

            function _class2() {
                _classCallCheck(this, _class2);

                _Component2.apply(this, arguments);
            }

            _class2.prototype.render = function render() {
                var _props3 = this.props;
                var _props3$controls = _props3.controls;
                var controls = _props3$controls === undefined ? {} : _props3$controls;

                var remainingProps = _objectWithoutProperties(_props3, ['controls']);

                return React.createElement(WrappedComponent, _extends({}, remainingProps, { controls: _extends({}, newControls, controls) }));
            };

            _createClass(_class2, null, [{
                key: 'displayName',
                get: function get() {
                    return 'WithControls(' + getDisplayName(WrappedComponent) + ')';
                }
            }]);

            return _class2;
        })(_react.Component);
    };
};

var styles = {
    active: {
        backgroundColor: "rgb(0, 0, 0, 0.87)",
        color: "rgb(255, 255, 255, 1)"
    },
    disabled: {
        backgroundColor: "rgb(255, 255, 255, 0.87)",
        color: "rgb(0, 0, 0, 0.87)"
    }
};

function withHideDisabled() {
    return function (WrappedComponent) {
        return (function (_Component3) {
            _inherits(_class3, _Component3);

            function _class3() {
                _classCallCheck(this, _class3);

                _Component3.apply(this, arguments);
            }

            _class3.prototype.render = function render() {
                var _props4 = this.props;
                var disabled = _props4.disabled;

                var remaining = _objectWithoutProperties(_props4, ['disabled']);

                if (disabled) {
                    return React.createElement('div', null);
                }

                return React.createElement(WrappedComponent, remaining);
            };

            _createClass(_class3, null, [{
                key: 'displayName',
                get: function get() {
                    return 'WithHideDisabled(' + getDisplayName(WrappedComponent) + ')';
                }
            }]);

            return _class3;
        })(_react.Component);
    };
}

function withDisabled(propName) {
    return function (WrappedComponent) {
        return (function (_Component4) {
            _inherits(_class4, _Component4);

            function _class4() {
                _classCallCheck(this, _class4);

                _Component4.apply(this, arguments);
            }

            _class4.prototype.render = function render() {
                var _ref, _ref2;

                var _props5 = this.props;
                var disabled = _props5.disabled;
                var old = _props5[propName];

                var remaining = _objectWithoutProperties(_props5, ['disabled', propName]);

                var newProps = disabled ? (_ref = {}, _ref[propName] = _extends({}, old, styles.disabled), _ref.disabled = true, _ref) : (_ref2 = {}, _ref2[propName] = _extends({}, old, styles.active), _ref2.disabled = false, _ref2);

                return React.createElement(WrappedComponent, _extends({}, remaining, newProps));
            };

            _createClass(_class4, null, [{
                key: 'displayName',
                get: function get() {
                    return 'WithDisabled(' + getDisplayName(WrappedComponent) + ')';
                }
            }]);

            return _class4;
        })(_react.Component);
    };
}

function withDimensions(WrappedComponent) {
    return (function (_Component5) {
        _inherits(_class5, _Component5);

        function _class5() {
            _classCallCheck(this, _class5);

            _Component5.apply(this, arguments);
        }

        _class5.prototype.render = function render() {
            return React.createElement(
                _reactContainerDimensions2['default'],
                null,
                React.createElement(WrappedComponent, this.props)
            );
        };

        _createClass(_class5, null, [{
            key: 'displayName',
            get: function get() {
                return 'WithContainerDimensions(' + getDisplayName(WrappedComponent) + ')';
            }
        }]);

        return _class5;
    })(_react.Component);
}

function withMouseTracker() {
    return function (WrappedComponent) {
        return (function (_Component6) {
            _inherits(_class6, _Component6);

            function _class6(props) {
                _classCallCheck(this, _class62);

                _Component6.call(this, props);

                this.state = {
                    isNearTop: false,
                    isNearBottom: true,
                    isNearLeft: false,
                    isNearRight: false
                };

                this._moveObserver = _lodash2['default'].throttle(this.onMouseMove.bind(this), 1000);
            }

            _class6.prototype.onMouseMove = function onMouseMove(props) {
                var _props6 = this.props;
                var top = _props6.top;
                var bottom = _props6.bottom;
                var left = _props6.left;
                var right = _props6.right;

                var state = {
                    isNearTop: false,
                    isNearBottom: true,
                    isNearLeft: false,
                    isNearRight: false
                };

                if (Math.abs(props.clientY - top) < 100) {
                    state.isNearTop = true;
                }

                if (Math.abs(props.clientY - bottom) < 100) {
                    state.isNearBottom = true;
                }

                if (Math.abs(props.clientX - left) < 100) {
                    state.isNearLeft = true;
                }

                if (Math.abs(props.clientX - right) < 100) {
                    state.isNearRight = true;
                }

                this.setState(state);
            };

            // Mounting

            _class6.prototype.componentDidMount = function componentDidMount() {
                document.addEventListener('mousemove', this._moveObserver);
            };

            _class6.prototype.componentWillUnmount = function componentWillUnmount() {
                document.removeEventListener('mousemove', this._moveObserver);
            };

            _class6.prototype.render = function render() {
                var _state = this.state;
                var isNearTop = _state.isNearTop;
                var isNearBottom = _state.isNearBottom;
                var isNearLeft = _state.isNearLeft;
                var isNearRight = _state.isNearRight;

                return React.createElement(WrappedComponent, _extends({}, this.props, { isNearTop: isNearTop, isNearBottom: isNearBottom, isNearLeft: isNearLeft, isNearRight: isNearRight }));
            };

            _createClass(_class6, null, [{
                key: 'displayName',
                get: function get() {
                    return 'WithMouseTracker(' + getDisplayName(WrappedComponent) + ')';
                }
            }]);

            var _class62 = _class6;
            _class6 = _sizeProviders.withContainerSize(_class6) || _class6;
            return _class6;
        })(_react.Component);
    };
}

exports.withControls = withControls;
exports.withMenu = withMenu;
