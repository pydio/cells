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

var _Utils = require('./Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var React = require('react');
var Controller = require('pydio/model/controller');

exports['default'] = function (Component) {
    var Wrapped = (function (_React$Component) {
        _inherits(Wrapped, _React$Component);

        function Wrapped(props, context) {
            _classCallCheck(this, Wrapped);

            _React$Component.call(this, props, context);
            this.state = {
                menuItems: this.props.menuItems || []
            };
        }

        Wrapped.prototype.componentDidMount = function componentDidMount() {
            var _this = this;

            if (this.props.controller && !this.props.menuItems) {
                this._observer = function () {
                    var actions = _this.props.controller.getContextActions('genericContext', null, _this.props.toolbars);
                    var menuItems = _Utils2['default'].pydioActionsToItems(actions);
                    _this.setState({ menuItems: menuItems });
                };
                if (this.props.controller === this.props.pydio.Controller) {
                    this.props.pydio.observe("actions_refreshed", this._observer);
                } else {
                    this.props.controller.observe("actions_refreshed", this._observer);
                }
                this._observer();
            }
        };

        Wrapped.prototype.componentWillUnmount = function componentWillUnmount() {
            if (this._observer) {
                if (this.props.controller === this.props.pydio.Controller) {
                    this.props.pydio.stopObserving("actions_refreshed", this._observer);
                } else {
                    this.props.controller.stopObserving("actions_refreshed", this._observer);
                }
            }
        };

        Wrapped.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
            if (nextProps.menuItems && nextProps.menuItems !== this.props.menuItems) {
                this.setState({ menuItems: nextProps.menuItems });
            }
        };

        Wrapped.prototype.render = function render() {
            return React.createElement(Component, _extends({}, this.props, { menuItems: this.state.menuItems }));
        };

        return Wrapped;
    })(React.Component);

    Wrapped.propTypes = {
        menuItems: React.PropTypes.array,
        toolbars: React.PropTypes.array,
        controller: React.PropTypes.instanceOf(Controller),
        pydio: React.PropTypes.instanceOf(Pydio)
    };

    return Wrapped;
};

module.exports = exports['default'];
