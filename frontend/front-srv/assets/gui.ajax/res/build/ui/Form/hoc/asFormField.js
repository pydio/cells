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

/**
 * React Mixin for Form Element
 */

exports['default'] = function (Field) {
    var skipBufferChanges = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    var FormField = (function (_React$Component) {
        _inherits(FormField, _React$Component);

        // propTypes:{
        //     attributes:React.PropTypes.object.isRequired,
        //     name:React.PropTypes.string.isRequired,
        //
        //     displayContext:React.PropTypes.oneOf(['form', 'grid']),
        //     disabled:React.PropTypes.bool,
        //     multiple:React.PropTypes.bool,
        //     value:React.PropTypes.any,
        //     onChange:React.PropTypes.func,
        //     onChangeEditMode:React.PropTypes.func,
        //     binary_context:React.PropTypes.string,
        //     errorText:React.PropTypes.string
        // },

        function FormField(props) {
            _classCallCheck(this, FormField);

            props = _extends({ displayContext: 'form', disabled: false }, props);
            _React$Component.call(this, props);
            this.state = {
                editMode: false,
                dirty: false,
                value: this.props.value
            };
        }

        FormField.prototype.isDisplayGrid = function isDisplayGrid() {
            return this.props.displayContext === 'grid';
        };

        FormField.prototype.isDisplayForm = function isDisplayForm() {
            return this.props.displayContext === 'form';
        };

        FormField.prototype.toggleEditMode = function toggleEditMode() {
            if (this.isDisplayForm()) {
                return;
            }
            var newState = !this.state.editMode;
            this.setState({ editMode: newState });
            if (this.props.onChangeEditMode) {
                this.props.onChangeEditMode(newState);
            }
        };

        FormField.prototype.enterToToggle = function enterToToggle(event) {
            if (event.key === 'Enter') {
                this.toggleEditMode();
            }
        };

        FormField.prototype.bufferChanges = function bufferChanges(newValue, oldValue) {
            this.triggerPropsOnChange(newValue, oldValue);
        };

        FormField.prototype.onChange = function onChange(event, value) {
            if (value === undefined) {
                value = event.currentTarget.getValue ? event.currentTarget.getValue() : event.currentTarget.value;
            }
            if (this.changeTimeout) {
                clearTimeout(this.changeTimeout);
            }
            var newValue = value,
                oldValue = this.state.value;
            if (skipBufferChanges) {
                this.triggerPropsOnChange(newValue, oldValue);
            }
            this.setState({
                dirty: true,
                value: newValue
            });
            if (!skipBufferChanges) {
                var timerLength = 250;
                if (this.props.attributes['type'] === 'password') {
                    timerLength = 1200;
                }
                this.changeTimeout = setTimeout((function () {
                    this.bufferChanges(newValue, oldValue);
                }).bind(this), timerLength);
            }
        };

        FormField.prototype.triggerPropsOnChange = function triggerPropsOnChange(newValue, oldValue) {
            if (this.props.attributes['type'] === 'password') {
                this.toggleEditMode();
                this.props.onChange(newValue, oldValue, { type: this.props.attributes['type'] });
            } else {
                this.props.onChange(newValue, oldValue);
            }
        };

        FormField.prototype.componentWillReceiveProps = function componentWillReceiveProps(newProps) {
            this.setState({
                value: newProps.value,
                dirty: false
            });
        };

        FormField.prototype.render = function render() {
            var _this = this;

            return _react2['default'].createElement(Field, _extends({}, this.props, this.state, {
                onChange: function (e, v) {
                    return _this.onChange(e, v);
                },
                toggleEditMode: function () {
                    return _this.toggleEditMode();
                },
                enterToToggle: function (e) {
                    return _this.enterToToggle(e);
                },
                isDisplayGrid: function () {
                    return _this.isDisplayGrid();
                },
                isDisplayForm: function () {
                    return _this.isDisplayForm();
                }
            }));
        };

        return FormField;
    })(_react2['default'].Component);

    return FormField;
};

module.exports = exports['default'];
