'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;
var ModernSelectField = _Pydio$requireLib.ModernSelectField;

var Parameter = (function (_React$Component) {
    _inherits(Parameter, _React$Component);

    function Parameter(props) {
        _classCallCheck(this, Parameter);

        _get(Object.getPrototypeOf(Parameter.prototype), 'constructor', this).call(this, props);
        this.state = {
            edit: props.edit || false,
            editParameter: _pydioHttpRestApi.JobsJobParameter.constructFromObject(JSON.parse(JSON.stringify(props.parameter)))
        };
    }

    _createClass(Parameter, [{
        key: 'save',
        value: function save() {
            var editParameter = this.state.editParameter;
            var onChange = this.props.onChange;

            onChange(editParameter);
            this.setState({ edit: false });
        }
    }, {
        key: 'toggleEdit',
        value: function toggleEdit() {
            var edit = this.state.edit;

            this.setState({
                editParameter: _pydioHttpRestApi.JobsJobParameter.constructFromObject(JSON.parse(JSON.stringify(this.props.parameter))),
                edit: !edit
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props = this.props;
            var parameter = _props.parameter;
            var onChange = _props.onChange;
            var onDelete = _props.onDelete;
            var _state = this.state;
            var edit = _state.edit;
            var editParameter = _state.editParameter;

            var editChange = function editChange(val) {
                _this.setState({ editParameter: val });
            };
            var blockStyle = { margin: '0 5px' };
            if (!edit) {
                var _ret = (function () {
                    var choices = {};
                    try {
                        choices = JSON.parse(parameter.JsonChoices);
                    } catch (e) {}
                    return {
                        v: _react2['default'].createElement(
                            'div',
                            { style: { display: 'flex', alignItems: 'center' } },
                            _react2['default'].createElement(
                                'div',
                                { style: _extends({}, blockStyle, { fontSize: 15, width: 120 }) },
                                parameter.Name
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: { blockStyle: blockStyle, width: 200 } },
                                parameter.Type === 'select' && _react2['default'].createElement(
                                    ModernSelectField,
                                    { fullWidth: true, hintText: "Value", value: parameter.Value, onChange: function (e, i, v) {
                                            onChange(_extends({}, parameter, { Value: v }));
                                        } },
                                    Object.keys(choices).map(function (k) {
                                        return _react2['default'].createElement(_materialUi.MenuItem, { value: k, primaryText: choices[k] });
                                    })
                                ),
                                parameter.Type === 'text' && _react2['default'].createElement(ModernTextField, { fullWidth: true, hintText: "Value", value: parameter.Value, onChange: function (e, v) {
                                        onChange(_extends({}, parameter, { Value: v }));
                                    } }),
                                parameter.Type === 'integer' && _react2['default'].createElement(ModernTextField, { fullWidth: true, hintText: "Value", value: parseInt(parameter.Value), type: "number", onChange: function (e, v) {
                                        onChange(_extends({}, parameter, { Value: parseInt(v) }));
                                    } }),
                                parameter.Type === 'boolean' && _react2['default'].createElement(
                                    ModernSelectField,
                                    { fullWidth: true, hintText: "Value", value: parameter.Value, onChange: function (e, i, v) {
                                            onChange(_extends({}, parameter, { Value: v }));
                                        } },
                                    _react2['default'].createElement(_materialUi.MenuItem, { value: "true", primaryText: "Yes" }),
                                    _react2['default'].createElement(_materialUi.MenuItem, { value: "false", primaryText: "No" })
                                )
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: blockStyle },
                                parameter.Description
                            ),
                            _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-pencil", tooltip: "Edit", onTouchTap: function () {
                                    return _this.toggleEdit();
                                }, iconStyle: { color: '#e0e0e0' } })
                        )
                    };
                })();

                if (typeof _ret === 'object') return _ret.v;
            }
            return _react2['default'].createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255, 243, 224, 0.22)', borderRadius: 4, border: '1px solid #FFE0B2' } },
                _react2['default'].createElement(
                    'div',
                    { style: blockStyle },
                    _react2['default'].createElement(ModernTextField, { fullWidth: true, hintText: "Name", value: editParameter.Name, onChange: function (e, v) {
                            editChange(_extends({}, editParameter, { Name: v }));
                        } })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: blockStyle },
                    _react2['default'].createElement(ModernTextField, { fullWidth: true, hintText: "Default Value", value: editParameter.Value, onChange: function (e, v) {
                            editChange(_extends({}, editParameter, { Value: v }));
                        } })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: blockStyle },
                    _react2['default'].createElement(ModernTextField, { fullWidth: true, hintText: "Description", value: editParameter.Description, onChange: function (e, v) {
                            editChange(_extends({}, editParameter, { Description: v }));
                        } })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: _extends({}, blockStyle, { width: 120 }) },
                    _react2['default'].createElement(
                        ModernSelectField,
                        { fullWidth: true, value: editParameter.Type, onChange: function (e, i, v) {
                                editChange(_extends({}, editParameter, { Type: v }));
                            } },
                        _react2['default'].createElement(_materialUi.MenuItem, { value: "text", primaryText: "Text" }),
                        _react2['default'].createElement(_materialUi.MenuItem, { value: "integer", primaryText: "Integer" }),
                        _react2['default'].createElement(_materialUi.MenuItem, { value: "boolean", primaryText: "Boolean" }),
                        _react2['default'].createElement(_materialUi.MenuItem, { value: "select", primaryText: "SelectField" })
                    )
                ),
                editParameter.Type === 'select' && _react2['default'].createElement(
                    'div',
                    { style: blockStyle },
                    _react2['default'].createElement(ModernTextField, { fullWidth: true, hintText: '{"key":"value"} pairs', value: editParameter.JsonChoices, onChange: function (e, v) {
                            editChange(_extends({}, editParameter, { JsonChoices: v }));
                        } })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: blockStyle },
                    _react2['default'].createElement(_materialUi.Checkbox, { label: "Mandatory", checked: editParameter.Mandatory, onCheck: function (e, v) {
                            editChange(_extends({}, editParameter, { Mandatory: v }));
                        } })
                ),
                _react2['default'].createElement('div', { style: { flex: 1 } }),
                _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-undo", tooltip: "Close", onTouchTap: function () {
                        return _this.toggleEdit();
                    }, iconStyle: { color: '#9e9e9e' } }),
                _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-check", tooltip: "Save", onTouchTap: function () {
                        return _this.save();
                    }, iconStyle: { color: '#9e9e9e' } }),
                _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-delete", tooltip: "Remove", onTouchTap: function () {
                        onDelete();
                    }, iconStyle: { color: '#9e9e9e' } })
            );
        }
    }]);

    return Parameter;
})(_react2['default'].Component);

var JobParameters = (function (_React$Component2) {
    _inherits(JobParameters, _React$Component2);

    function JobParameters(props) {
        _classCallCheck(this, JobParameters);

        _get(Object.getPrototypeOf(JobParameters.prototype), 'constructor', this).call(this, props);
        /*
        // For testing
        parameters = [
            {"Name":"RecyclePath","Description":"This is a description","Value":"recycle_bin","Type":"text","edit":true},
            {"Name":"AnotherParam","Description":"","Value":"true","Type":"boolean","edit":true},
            {"Name":"SelectValues","Description":"Delete users recycles as well","Value":"key1","Type":"select","JsonChoices":"{\"key1\":\"value1\"}","edit":true}
            ];
        */
    }

    _createClass(JobParameters, [{
        key: 'changeParam',
        value: function changeParam(index, newParam) {
            var _props2 = this.props;
            var onChange = _props2.onChange;
            var _props2$parameters = _props2.parameters;
            var parameters = _props2$parameters === undefined ? [] : _props2$parameters;

            var pp = parameters.map(function (p, i) {
                return i === index ? newParam : p;
            });
            onChange(pp);
        }
    }, {
        key: 'removeParam',
        value: function removeParam(index) {
            var _props3 = this.props;
            var onChange = _props3.onChange;
            var _props3$parameters = _props3.parameters;
            var parameters = _props3$parameters === undefined ? [] : _props3$parameters;

            var pp = parameters.filter(function (p, i) {
                return i !== index;
            });
            onChange(pp);
        }
    }, {
        key: 'addParam',
        value: function addParam() {
            var _props4 = this.props;
            var onChange = _props4.onChange;
            var _props4$parameters = _props4.parameters;
            var parameters = _props4$parameters === undefined ? [] : _props4$parameters;

            var newP = new _pydioHttpRestApi.JobsJobParameter();
            newP.Type = 'text';
            newP.edit = true;
            onChange([].concat(_toConsumableArray(parameters), [newP]));
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props$parameters = this.props.parameters;
            var parameters = _props$parameters === undefined ? [] : _props$parameters;

            return _react2['default'].createElement(
                'div',
                { style: { borderBottom: '1px solid rgb(236, 239, 241)' } },
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', padding: '0 10px' } },
                    _react2['default'].createElement(
                        'div',
                        { style: { flex: 1, padding: '16px 10px' } },
                        'Job-level parameters can be used by actions, filters and selectors.'
                    ),
                    _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-plus", tooltip: "Add Parameter", onTouchTap: function () {
                            return _this2.addParam();
                        } })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: 16, paddingTop: 0 } },
                    parameters.length === 0 && _react2['default'].createElement(
                        'div',
                        { style: { textAlign: 'center', fontStyle: 'italic', fontWeight: 500, color: '#90A4AE' } },
                        'No parameters defined'
                    ),
                    parameters.map(function (p, i) {
                        return _react2['default'].createElement(Parameter, { key: p.Name || "p-" + i, onChange: function (v) {
                                _this2.changeParam(i, v);
                            }, onDelete: function () {
                                return _this2.removeParam(i);
                            }, parameter: p, edit: p.edit });
                    })
                )
            );
        }
    }]);

    return JobParameters;
})(_react2['default'].Component);

exports['default'] = JobParameters;
module.exports = exports['default'];
