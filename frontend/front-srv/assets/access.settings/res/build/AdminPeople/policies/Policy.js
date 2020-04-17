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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Rule = require('./Rule');

var _Rule2 = _interopRequireDefault(_Rule);

var _materialUi = require('material-ui');

var _uuid = require('uuid');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

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
        key: 'saveLabels',
        value: function saveLabels() {
            var _state = this.state;
            var pName = _state.pName;
            var pDesc = _state.pDesc;
            var policy = _state.policy;

            if (pName) {
                policy.Name = pName;
            }
            if (pDesc) {
                policy.Description = pDesc;
            }
            this.setState({ pName: null, pDesc: null });
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
        key: 'onAddRule',
        value: function onAddRule(event) {
            var _this = this;

            var ruleLabel = arguments.length <= 1 || arguments[1] === undefined ? "" : arguments[1];

            var label = ruleLabel;
            var policy = _extends({}, this.state.policy);
            if (!policy.Policies) {
                policy.Policies = [];
            }
            var newId = (0, _uuid.v4)();
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

            var _props = this.props;
            var readonly = _props.readonly;
            var pydio = _props.pydio;
            var _state2 = this.state;
            var policy = _state2.policy;
            var openRule = _state2.openRule;

            var m = function m(id) {
                return pydio.MessageHash['ajxp_admin.policies.' + id] || id;
            };

            var rules = policy.Policies.map(function (rule, i) {
                return _react2['default'].createElement(_Rule2['default'], _extends({}, _this2.props, {
                    key: rule.description,
                    rule: rule,
                    isLast: i === policy.Policies.length - 1,
                    create: openRule === rule.id,
                    onRuleChange: _this2.onRuleChange.bind(_this2),
                    onRemoveRule: _this2.onRemoveRule.bind(_this2)
                }));
            });

            var icButtonsProps = {
                iconStyle: { fontSize: 18, color: 'rgba(0,0,0,.33)' },
                style: { padding: 8, width: 36, height: 36 },
                tooltipPosition: "top-right"
            };

            var rulesTitle = _react2['default'].createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center' } },
                _react2['default'].createElement(
                    'div',
                    { style: { fontSize: 14, fontWeight: 500 } },
                    'Rules'
                ),
                !readonly && _react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-plus", tooltip: m('rule.create'), onTouchTap: this.onAddRule.bind(this) }, icButtonsProps, { tooltipPosition: "bottom-right" }))
            );

            var labelsBlock = undefined;
            if (!readonly) {
                (function () {
                    var _state3 = _this2.state;
                    var showLabels = _state3.showLabels;
                    var pName = _state3.pName;
                    var pDesc = _state3.pDesc;

                    var labelsModified = pName && pName !== policy.Name || pDesc && pDesc !== policy.Description;
                    labelsBlock = _react2['default'].createElement(
                        'div',
                        { style: { marginTop: 10, paddingTop: 10 } },
                        _react2['default'].createElement(
                            'div',
                            { style: { display: 'flex', alignItems: 'center' } },
                            _react2['default'].createElement(
                                'div',
                                { style: { fontSize: 14, fontWeight: 500 } },
                                'Edit Labels'
                            ),
                            _react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-chevron-" + (showLabels ? 'down' : 'right'), tooltip: m('policy.editLabels'), onTouchTap: function () {
                                    return _this2.setState({ showLabels: !showLabels });
                                } }, icButtonsProps))
                        ),
                        _react2['default'].createElement(
                            'div',
                            { style: { display: showLabels ? 'flex' : 'none' } },
                            _react2['default'].createElement(
                                'div',
                                { style: { marginRight: 6, flex: 1 } },
                                _react2['default'].createElement(ModernTextField, { value: pName || policy.Name, fullWidth: true, onChange: function (e, v) {
                                        _this2.setState({ pName: v });
                                    } })
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: { marginLeft: 6, flex: 1 } },
                                _react2['default'].createElement(ModernTextField, { value: pDesc || policy.Description, fullWidth: true, onChange: function (e, v) {
                                        _this2.setState({ pDesc: v });
                                    } })
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: { width: 80 } },
                                _react2['default'].createElement(_materialUi.IconButton, {
                                    disabled: !labelsModified,
                                    iconClassName: "mdi mdi-content-save",
                                    tooltip: m('policy.saveLabels'),
                                    tooltipPosition: "top-center",
                                    onTouchTap: function () {
                                        _this2.saveLabels();
                                    },
                                    iconStyle: { fontSize: 20, color: 'rgba(0,0,0,' + (labelsModified ? '.43' : '.10') + ')' },
                                    style: { padding: 14 }
                                })
                            )
                        )
                    );
                })();
            }

            return _react2['default'].createElement(
                'div',
                { style: { padding: '12px 24px', backgroundColor: '#f5f5f5' } },
                rulesTitle,
                rules,
                labelsBlock
            );
        }
    }]);

    return Policy;
})(_react2['default'].Component);

exports['default'] = Policy;
module.exports = exports['default'];
