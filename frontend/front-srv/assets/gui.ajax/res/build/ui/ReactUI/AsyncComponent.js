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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

/********************/
/* ASYNC COMPONENTS */
/********************/
/**
 * Load a component from server (if not already loaded) based on its namespace.
 */

var AsyncComponent = (function (_Component) {
    _inherits(AsyncComponent, _Component);

    function AsyncComponent(props) {
        _classCallCheck(this, AsyncComponent);

        _Component.call(this, props);

        this.state = {
            loaded: false
        };

        this._handleLoad = _lodash2['default'].debounce(this._handleLoad, 100);
    }

    AsyncComponent.prototype._handleLoad = function _handleLoad() {
        var _this = this;

        var callback = function callback() {
            if (_this.instance && !_this.loadFired && typeof _this.props.onLoad === 'function') {
                _this.props.onLoad(_this.instance);
                _this.loadFired = true;
            }
        };

        if (!this.state.loaded) {
            // Loading the class asynchronously
            _pydioHttpResourcesManager2['default'].loadClassesAndApply([this.props.namespace], function () {
                _this.setState({ loaded: true });
                callback();
            });
        } else {
            // Class is already available, just doing the callback
            callback();
        }
    };

    AsyncComponent.prototype.componentDidMount = function componentDidMount() {
        this._handleLoad();
    };

    AsyncComponent.prototype.componentWillReceiveProps = function componentWillReceiveProps(newProps) {
        if (this.props.namespace != newProps.namespace) {
            this.loadFired = false;
            this.setState({ loaded: false });
        }
    };

    AsyncComponent.prototype.componentDidUpdate = function componentDidUpdate() {
        this._handleLoad();
    };

    AsyncComponent.prototype.render = function render() {
        var _this2 = this;

        if (!this.state.loaded) return null;

        var props = this.props;
        var _props = props;
        var namespace = _props.namespace;
        var componentName = _props.componentName;
        var modalData = _props.modalData;

        var nsObject = window[this.props.namespace];
        var Component = FuncUtils.getFunctionByName(this.props.componentName, window[this.props.namespace]);

        if (Component) {
            if (modalData && modalData.payload) {
                props = _extends({}, props, modalData.payload);
            }

            return _react2['default'].createElement(Component, _extends({}, props, { ref: function (instance) {
                    _this2.instance = instance;
                } }));
        } else {
            return _react2['default'].createElement(
                'div',
                null,
                'Component ',
                namespace,
                '.',
                componentName,
                ' not found!'
            );
        }
    };

    return AsyncComponent;
})(_react.Component);

AsyncComponent.propTypes = {
    namespace: _react2['default'].PropTypes.string.isRequired,
    componentName: _react2['default'].PropTypes.string.isRequired
};

// AsyncComponent = PydioHOCs.withLoader(AsyncComponent)

exports['default'] = AsyncComponent;
module.exports = exports['default'];
