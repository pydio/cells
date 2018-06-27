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

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Rule = require('./Rule');

var _Rule2 = _interopRequireDefault(_Rule);

var _materialUi = require('material-ui');

var _editorInlineLabel = require('./editor/InlineLabel');

var _editorInlineLabel2 = _interopRequireDefault(_editorInlineLabel);

var _uuid4 = require('uuid4');

var _uuid42 = _interopRequireDefault(_uuid4);

var Policy = (function (_React$Component) {
    _inherits(Policy, _React$Component);

    function Policy(props) {
        _classCallCheck(this, Policy);

        _get(Object.getPrototypeOf(Policy.prototype), 'constructor', this).call(this, props);
        this.state = { policy: props.policy };
    }

    _createClass(Policy, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(next) {
            this.setState({ policy: next.policy });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (this.props.newPolicyWithRule) {
                this.onAddRule(null, this.props.newPolicyWithRule);
            }
        }
    }, {
        key: 'onNameChange',
        value: function onNameChange(value) {
            var policy = _extends({}, this.state.policy);
            policy.Name = value;
            this.props.savePolicy(policy);
        }
    }, {
        key: 'onDescriptionChange',
        value: function onDescriptionChange(value) {
            var policy = _extends({}, this.state.policy);
            policy.Description = value;
            this.props.savePolicy(policy);
        }
    }, {
        key: 'onRuleChange',
        value: function onRuleChange(rule) {

            var policy = _extends({}, this.state.policy);

            if (policy.Policies) {
                policy.Policies = policy.Policies.filter(function (p) {
                    return p.id !== rule.id;
                });
                policy.Policies.push(rule);
            } else {
                policy.Policies = [rule];
            }
            this.props.savePolicy(policy);
        }
    }, {
        key: 'onRemoveRule',
        value: function onRemoveRule(rule) {
            var dontSave = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            var policy = _extends({}, this.state.policy);
            policy.Policies = policy.Policies.filter(function (p) {
                return p.id !== rule.id;
            });
            this.props.savePolicy(policy, dontSave);
        }
    }, {
        key: 'onDeletePolicy',
        value: function onDeletePolicy() {
            if (window.confirm('Are you sure you want to delete this policy? This may break the security model of the application!')) {
                this.props.deletePolicy(this.state.policy);
            }
        }
    }, {
        key: 'onAddRule',
        value: function onAddRule(event) {
            var _this = this;

            var ruleLabel = arguments.length <= 1 || arguments[1] === undefined ? "" : arguments[1];

            var label = ruleLabel;
            var policy = _extends({}, this.state.policy);
            if (!policy.Policies) {
                policy.Policies = [];
            }
            var newId = (0, _uuid42['default'])();
            var subjects = [],
                resources = [],
                actions = [];
            if (policy.ResourceGroup === "acl") {
                subjects = ["policy:" + policy.Uuid];
                resources = ["acl"];
            } else if (policy.ResourceGroup === "oidc") {
                resources = ["oidc"];
            }
            policy.Policies.push({
                id: newId,
                description: label,
                actions: actions,
                subjects: subjects,
                resources: resources,
                effect: "deny"
            });
            this.setState({ policy: policy, openRule: newId }, function () {
                _this.setState({ openRule: null });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var readonly = this.props.readonly;
            var _state = this.state;
            var policy = _state.policy;
            var openRule = _state.openRule;

            var nestedItems = policy.Policies.map(function (rule) {
                return _react2['default'].createElement(_Rule2['default'], _extends({}, _this2.props, {
                    key: rule.description,
                    rule: rule,
                    create: openRule === rule.id,
                    onRuleChange: _this2.onRuleChange.bind(_this2),
                    onRemoveRule: _this2.onRemoveRule.bind(_this2)
                }));
            });

            if (!readonly) {
                var buttonsContent = _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_materialUi.RaisedButton, { label: "Add New Rule", onTouchTap: this.onAddRule.bind(this) }),
                    '  ',
                    _react2['default'].createElement(_materialUi.RaisedButton, { label: "Delete Policy", onTouchTap: this.onDeletePolicy.bind(this) })
                );
                nestedItems.push(_react2['default'].createElement(_materialUi.ListItem, {
                    primaryText: buttonsContent,
                    disabled: true
                }));
            }

            var ruleWord = 'rule';
            var policyNumber = policy.Policies.length;
            if (policyNumber > 1) {
                ruleWord = 'rules';
            }
            var legend = _react2['default'].createElement(
                'span',
                null,
                '(',
                policyNumber,
                ' ',
                ruleWord,
                ')'
            );
            var primaryText = undefined,
                secondaryText = undefined;
            var secondaryStyle = { fontSize: 14, color: 'rgba(0, 0, 0, 0.54)' };
            if (readonly) {
                primaryText = policy.Name;
                secondaryText = _react2['default'].createElement(
                    'div',
                    { style: secondaryStyle },
                    policy.Description
                );
            } else {
                primaryText = _react2['default'].createElement(_editorInlineLabel2['default'], { label: policy.Name, onChange: this.onNameChange.bind(this) });
                secondaryText = _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_editorInlineLabel2['default'], { onChange: this.onDescriptionChange.bind(this), inputStyle: { fontSize: 14, color: 'rgba(0, 0, 0, 0.54)' }, label: policy.Description, legend: legend })
                );
            }

            return _react2['default'].createElement(_materialUi.ListItem, _extends({}, this.props, {
                primaryText: primaryText,
                secondaryText: secondaryText,
                nestedItems: nestedItems,
                primaryTogglesNestedList: false,
                disabled: true,
                initiallyOpen: !!this.props.newPolicyWithRule
            }));
        }
    }]);

    return Policy;
})(_react2['default'].Component);

exports['default'] = Policy;
module.exports = exports['default'];
