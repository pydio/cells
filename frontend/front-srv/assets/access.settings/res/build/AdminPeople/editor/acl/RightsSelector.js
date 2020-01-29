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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _utilMessagesMixin = require("../util/MessagesMixin");

var RightsSelector = (function (_React$Component) {
    _inherits(RightsSelector, _React$Component);

    /*
    propTypes:{
        acl:React.PropTypes.string,
        disabled:React.PropTypes.bool,
        hideDeny:React.PropTypes.bool,
        hideLabels:React.PropTypes.bool,
        onChange:React.PropTypes.func
    }
    */

    function RightsSelector(props) {
        _classCallCheck(this, RightsSelector);

        _get(Object.getPrototypeOf(RightsSelector.prototype), 'constructor', this).call(this, props);
        this.state = { acl: props.acl };
    }

    _createClass(RightsSelector, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            this.setState({ acl: newProps.acl });
        }
    }, {
        key: 'getAcl',
        value: function getAcl() {
            return this.state.acl;
        }
    }, {
        key: 'updateAcl',
        value: function updateAcl() {

            if (this.props.disabled) {
                return;
            }

            var d = this.refs.deny.isChecked();
            var r = !d && this.refs.read.isChecked();
            var w = !d && this.refs.write.isChecked();
            var acl = undefined;
            var parts = [];
            if (d) {
                parts.push('deny');
            } else {
                if (r) {
                    parts.push('read');
                }
                if (w) {
                    parts.push('write');
                }
            }
            acl = parts.join(",");
            if (this.props.onChange) {
                this.props.onChange(acl, this.props.acl);
            }
            this.setState({ acl: acl });
        }
    }, {
        key: 'handleChangePolicy',
        value: function handleChangePolicy(event, value) {
            var acl = 'policy:' + value;
            if (this.props.onChange) {
                this.props.onChange(acl, this.props.acl);
            } else {
                this.setState({ acl: acl });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var hideDeny = _props.hideDeny;
            var hideLabels = _props.hideLabels;
            var disabled = _props.disabled;
            var getMessage = _props.getMessage;

            var acl = this.state.acl || '';

            if (acl.startsWith('policy:')) {
                return _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', width: 132, height: 40 } },
                    'Custom policy'
                );
            }

            var checkboxStyle = { width: 44 };

            return _react2['default'].createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center', width: 132, height: 40 } },
                _react2['default'].createElement(_materialUi.Checkbox, { ref: 'read',
                    label: hideLabels ? "" : getMessage('react.5a', 'ajxp_admin'),
                    value: 'read',
                    onCheck: this.updateAcl.bind(this),
                    disabled: disabled || acl.indexOf('deny') > -1,
                    checked: acl.indexOf('deny') === -1 && acl.indexOf('read') !== -1,
                    style: checkboxStyle
                }),
                _react2['default'].createElement(_materialUi.Checkbox, {
                    ref: 'write',
                    label: hideLabels ? "" : getMessage('react.5b', 'ajxp_admin'),
                    value: 'write',
                    onCheck: this.updateAcl.bind(this),
                    disabled: disabled || acl.indexOf('deny') > -1,
                    checked: acl.indexOf('deny') === -1 && acl.indexOf('write') !== -1,
                    style: checkboxStyle }),
                !hideDeny && _react2['default'].createElement(_materialUi.Checkbox, {
                    ref: 'deny',
                    label: hideLabels ? "" : getMessage('react.5', 'ajxp_admin'),
                    value: '-',
                    disabled: disabled,
                    onCheck: this.updateAcl.bind(this),
                    checked: acl.indexOf('deny') !== -1,
                    style: checkboxStyle
                })
            );
        }
    }]);

    return RightsSelector;
})(_react2['default'].Component);

exports['default'] = (0, _utilMessagesMixin.withRoleMessages)(RightsSelector);
module.exports = exports['default'];
