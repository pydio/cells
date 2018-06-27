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

var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _modelWorkspace = require('../model/Workspace');

var _modelWorkspace2 = _interopRequireDefault(_modelWorkspace);

var _require = require('react');

var Component = _require.Component;
var PropTypes = _require.PropTypes;

var _require2 = require('material-ui');

var Stepper = _require2.Stepper;
var Step = _require2.Step;
var StepLabel = _require2.StepLabel;
var StepContent = _require2.StepContent;
var Divider = _require2.Divider;
var RaisedButton = _require2.RaisedButton;
var FlatButton = _require2.FlatButton;
var RadioButtonGroup = _require2.RadioButtonGroup;
var RadioButton = _require2.RadioButton;
var SelectField = _require2.SelectField;
var Menu = _require2.Menu;
var MenuItem = _require2.MenuItem;

var TplOrDriverPicker = (function (_Component) {
    _inherits(TplOrDriverPicker, _Component);

    function TplOrDriverPicker() {
        _classCallCheck(this, TplOrDriverPicker);

        _get(Object.getPrototypeOf(TplOrDriverPicker.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(TplOrDriverPicker, [{
        key: 'render',
        value: function render() {
            var _this = this;

            var onChange = this.props.onChange;

            var localChange = function localChange(e, v) {
                var newLabel = v === 'driver' ? _this.context.getMessage('ws.70') : _this.context.getMessage('ws.69');
                var data = v === 'driver' ? { general: true } : null;
                onChange(v, newLabel, null);
            };
            return React.createElement(
                RadioButtonGroup,
                { name: 'driv_or_tpl', onChange: localChange, valueSelected: this.props.value },
                React.createElement(RadioButton, { value: 'driver', label: this.context.getMessage('ws.9'), style: { paddingTop: 10, paddingBottom: 10 } }),
                React.createElement(RadioButton, { value: 'template', label: this.context.getMessage('ws.8'), style: { paddingTop: 5, paddingBottom: 5 } })
            );
        }
    }]);

    return TplOrDriverPicker;
})(Component);

TplOrDriverPicker.contextTypes = { getMessage: PropTypes.func };

var DriverPicker = (function (_Component2) {
    _inherits(DriverPicker, _Component2);

    function DriverPicker() {
        _classCallCheck(this, DriverPicker);

        _get(Object.getPrototypeOf(DriverPicker.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(DriverPicker, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props;
            var onChange = _props.onChange;
            var driversLoaded = _props.driversLoaded;
            var value = _props.value;

            if (!driversLoaded) return React.createElement(
                'div',
                null,
                'Loading...'
            );
            var drivers = _modelWorkspace2['default'].DRIVERS;
            var items = [];
            drivers.forEach(function (d) {
                items.push(React.createElement(MenuItem, { key: d.name, primaryText: d.label, value: d.name }));
            });
            var localChange = function localChange(e, i, v) {
                onChange(v, _this2.context.getMessage('ws.9') + ': ' + drivers.get(v).label, { driver: v });
            };
            return React.createElement(
                SelectField,
                { autoWidth: true, hintText: this.context.getMessage('ws.17'), fullWidth: true, value: value, onChange: localChange },
                items
            );
        }
    }]);

    return DriverPicker;
})(Component);

DriverPicker.contextTypes = { getMessage: PropTypes.func };

var TemplatePicker = (function (_Component3) {
    _inherits(TemplatePicker, _Component3);

    function TemplatePicker() {
        _classCallCheck(this, TemplatePicker);

        _get(Object.getPrototypeOf(TemplatePicker.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(TemplatePicker, [{
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props2 = this.props;
            var onChange = _props2.onChange;
            var driversLoaded = _props2.driversLoaded;
            var value = _props2.value;

            if (!driversLoaded) return React.createElement(
                'div',
                null,
                'Loading...'
            );
            var drivers = _modelWorkspace2['default'].TEMPLATES;
            var items = [];
            drivers.forEach(function (d) {
                items.push(React.createElement(MenuItem, { key: d.name, primaryText: d.label, value: d.name }));
            });
            var localChange = function localChange(e, i, v) {
                onChange(v, _this3.context.getMessage('ws.12').replace('%s', ': ' + drivers.get(v).label), { template: v });
            };
            return React.createElement(
                SelectField,
                { autoWidth: true, hintText: this.context.getMessage('ws.10'), fullWidth: true, value: value, onChange: localChange },
                items
            );
        }
    }]);

    return TemplatePicker;
})(Component);

TemplatePicker.contextTypes = { getMessage: PropTypes.func };

var FeaturesStepper = (function (_Component4) {
    _inherits(FeaturesStepper, _Component4);

    function FeaturesStepper(props, context) {
        _classCallCheck(this, FeaturesStepper);

        _get(Object.getPrototypeOf(FeaturesStepper.prototype), 'constructor', this).call(this, props, context);
        this.state = { step: 0 };
    }

    _createClass(FeaturesStepper, [{
        key: 'pathBranchToSteps',
        value: function pathBranchToSteps(branch) {
            var _this4 = this;

            var steps = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

            var values = this.state;

            branch.forEach(function (v) {
                var stepData = {
                    id: v.id,
                    label: values[v.id + '-label'] || v.label
                };
                if (v.component || v.additionalComponent) {
                    if (v.component) {
                        var onChange = function onChange(newValue, newLabel, data) {
                            _this4.onStepValueChange(v.id, newValue, newLabel, data);
                        };
                        stepData.component = React.createElement(v.component, _extends({}, _this4.props, { value: values[v.id], onChange: onChange }));
                    } else {
                        stepData.component = _this4.props.additionalComponent;
                        stepData.additional = true;
                    }
                    if (values[v.id]) stepData.value = values[v.id];
                    steps.push(stepData);
                    if (v.choices && values[v.id] && v.choices[values[v.id]]) {
                        _this4.pathBranchToSteps(v.choices[values[v.id]], steps);
                    }
                } else {
                    steps.push(_extends({}, stepData, {
                        form: v.edit,
                        valid: _this4.props.formIsValid || false,
                        component: null
                    }));
                }
            });

            if (steps.length === 1) {
                steps.push({
                    id: 'next',
                    label: this.context.getMessage('ws.73')
                });
            }

            return steps;
        }
    }, {
        key: 'onStepValueChange',
        value: function onStepValueChange(stepId, newValue) {
            var newLabel = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
            var data = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

            var obj = {};
            obj[stepId] = newValue;
            if (newLabel) {
                obj[stepId + '-label'] = newLabel;
            }
            this.setState(obj);
            if (data) {
                if (data.general) {
                    this.props.onSelectionChange('general');
                } else if (data.driver) {
                    this.props.onSelectionChange('driver', data.driver);
                } else if (data.template) {
                    this.props.onSelectionChange('general', null, data.template);
                }
            }
            this.setState({ step: this.state.step + 1 });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this5 = this;

            var mess = this.context.getMessage;
            /*
            const PATH = {
                workspace:[
                    {
                        id        : 'ws_tpl_or_driver_picker',
                        label     : mess('ws.11'),
                        component : TplOrDriverPicker,
                        choices   : {
                            template:[
                                {id: 'ws_template_picker', label:mess('ws.12').replace('%s',':'), component: TemplatePicker},
                                {id: 'ws_template_options', label:mess('ws.13'), edit:'template'}
                            ],
                            driver:[
                                {id: 'ws_driver_picker', label:mess('ws.16') + ': ', component: DriverPicker},
                                {id: 'ws_driver_options', label:mess('41', 'settings'), edit:'driver'},
                                {id: 'ws_general', label:mess('ws.14'), edit:'general'},
                            ]
                        }
                    }
                ],
                template:[
                    {id: 'tpl_general_options', label:mess('ws.13'), edit:'general'},
                    {id: 'tpl_driver_picker', label:mess('ws.16'), component: DriverPicker},
                    {id: 'tpl_driver_options', label:mess('41', 'settings'), additionalComponent: true, edit:'driver'}
                ]
            };*/
            var PATH = {
                workspace: [{ id: 'ws_driver_options', label: mess('41', 'settings'), edit: 'driver' }, { id: 'ws_general', label: mess('ws.14'), edit: 'general' }],
                template: [{ id: 'tpl_driver_options', label: mess('41', 'settings'), edit: 'driver' }]
            };

            var _props3 = this.props;
            var onSelectionChange = _props3.onSelectionChange;
            var wizardType = _props3.wizardType;
            var save = _props3.save;
            var close = _props3.close;

            var mainState = PATH[wizardType];
            var steps = this.pathBranchToSteps(mainState);
            var active = this.state.step;
            var activeStep = steps[active];

            if (wizardType === 'template') {
                return React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'div',
                        { style: { padding: '16px 16px 0px', color: '#b6b6b6', fontSize: 14, fontWeight: 500 } },
                        this.context.getMessage('ws.74'),
                        React.createElement('br', null),
                        React.createElement('br', null),
                        this.context.getMessage('ws.75'),
                        this.context.getMessage('ws.76')
                    ),
                    React.createElement(
                        'div',
                        { style: { textAlign: 'right', padding: 16 } },
                        React.createElement(FlatButton, { primary: false, label: this.context.getMessage('54', ''), onTouchTap: close, style: { marginRight: 6 } }),
                        React.createElement(RaisedButton, { secondary: true, label: this.context.getMessage('ws.20'), onTouchTap: save, disabled: !activeStep.valid })
                    )
                );
            }

            var saveEnabled = active === steps.length - 1 && (activeStep.value || activeStep.valid || activeStep.additional);
            return React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    { style: { padding: '16px 16px 0px', color: '#b6b6b6', fontSize: 14, fontWeight: 500 } },
                    this.context.getMessage('ws.71')
                ),
                React.createElement(
                    Stepper,
                    { activeStep: active, orientation: 'vertical' },
                    steps.map(function (step, index) {
                        var nextStepForm = undefined,
                            nextCallback = undefined;
                        if (index < steps.length - 1) {
                            nextStepForm = steps[index + 1].form;
                            nextCallback = function () {
                                if (nextStepForm) onSelectionChange(nextStepForm);
                                _this5.setState({ step: _this5.state.step + 1 });
                            };
                        }
                        return React.createElement(
                            Step,
                            { key: 'step-' + index },
                            React.createElement(
                                StepLabel,
                                null,
                                step.label
                            ),
                            React.createElement(
                                StepContent,
                                null,
                                React.createElement(
                                    'div',
                                    null,
                                    step.component,
                                    step.form && !step.valid && React.createElement(
                                        'div',
                                        { style: { paddingBottom: 10, color: '#f44336' } },
                                        _this5.context.getMessage('ws.72')
                                    ),
                                    (step.form || step.additional) && nextCallback && React.createElement(
                                        'div',
                                        { style: { textAlign: 'right', padding: 3 } },
                                        React.createElement(RaisedButton, {
                                            disabled: !step.value && !step.valid && !step.additional,
                                            label: index < steps.length - 1 ? "next" : "save",
                                            onTouchTap: nextCallback
                                        })
                                    )
                                )
                            )
                        );
                    })
                ),
                React.createElement(
                    'div',
                    { style: { textAlign: 'right', padding: 16 } },
                    React.createElement(FlatButton, { primary: false, label: this.context.getMessage('54', ''), onTouchTap: close, style: { marginRight: 6 } }),
                    React.createElement(RaisedButton, { secondary: true, label: this.context.getMessage('ws.20'), onTouchTap: save, disabled: !saveEnabled })
                )
            );
        }
    }]);

    return FeaturesStepper;
})(Component);

;

FeaturesStepper.contextTypes = {
    getMessage: PropTypes.func
};

exports['default'] = FeaturesStepper;
module.exports = exports['default'];
