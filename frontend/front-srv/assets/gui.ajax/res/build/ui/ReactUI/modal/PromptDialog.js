"use strict";

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _materialUi = require("material-ui");

var _pydioUtilDom = require('pydio/util/dom');

var _pydioUtilDom2 = _interopRequireDefault(_pydioUtilDom);

var _ActionDialogMixin = require('./ActionDialogMixin');

var _ActionDialogMixin2 = _interopRequireDefault(_ActionDialogMixin);

var _CancelButtonProviderMixin = require('./CancelButtonProviderMixin');

var _CancelButtonProviderMixin2 = _interopRequireDefault(_CancelButtonProviderMixin);

var _SubmitButtonProviderMixin = require('./SubmitButtonProviderMixin');

var _SubmitButtonProviderMixin2 = _interopRequireDefault(_SubmitButtonProviderMixin);

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Pydio$requireLib = _pydio2["default"].requireLib("hoc");

var ModernTextField = _Pydio$requireLib.ModernTextField;

/**
 * Ready-to-use dialog for requiring information (text or password) from the user
 *
 */
exports["default"] = _createReactClass2["default"]({
    displayName: 'PromptDialog',

    propTypes: {
        /**
         * Message ID used for the dialog title
         */
        dialogTitleId: _propTypes2["default"].string,
        /**
         * Message ID or string used for dialog legend
         */
        legendId: _propTypes2["default"].string,
        /**
         * MessageID used for the field Floating Label Text
         */
        fieldLabelId: _propTypes2["default"].string,
        /**
         * Either text or password
         */
        fieldType: _propTypes2["default"].oneOf(['text', 'password']),
        /**
         * Callback used at submit time
         */
        submitValue: _propTypes2["default"].func.isRequired,
        /**
         * Preset value displayed in the text field
         */
        defaultValue: _propTypes2["default"].string,
        /**
         * Select a part of the default value [NOT IMPLEMENTED]
         */
        defaultInputSelection: _propTypes2["default"].string
    },

    mixins: [_ActionDialogMixin2["default"], _CancelButtonProviderMixin2["default"], _SubmitButtonProviderMixin2["default"]],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: '',
            dialogIsModal: true,
            fieldType: 'text'
        };
    },

    getInitialState: function getInitialState() {
        if (this.props.defaultValue) {
            return { internalValue: this.props.defaultValue };
        } else {
            return { internalValue: '' };
        }
    },

    /**
     * Trigger props callback and dismiss modal
     */
    submit: function submit() {
        this.props.submitValue(this.state.internalValue);
        this.dismiss();
    },

    /**
     * Focus on input at mount time
     */
    componentDidMount: function componentDidMount() {
        var _this = this;

        var defaultInputSelection = this.props.defaultInputSelection;

        setTimeout(function () {
            try {
                if (defaultInputSelection && _this.refs.input && _this.refs.input.getInput()) {
                    _pydioUtilDom2["default"].selectBaseFileName(_this.refs.input.getInput());
                }
                _this.refs.input.focus();
            } catch (e) {}
        }, 150);
    },

    render: function render() {
        var _this2 = this;

        var internalValue = this.state.internalValue;

        return _react2["default"].createElement(
            "div",
            { style: { width: '100%' } },
            _react2["default"].createElement(
                "div",
                { className: "dialogLegend" },
                MessageHash[this.props.legendId] || this.props.legendId
            ),
            _react2["default"].createElement(ModernTextField, {
                floatingLabelText: MessageHash[this.props.fieldLabelId] || this.props.fieldLabelId,
                ref: "input",
                onKeyDown: this.submitOnEnterKey,
                value: internalValue,
                onChange: function (e, v) {
                    return _this2.setState({ internalValue: v });
                },
                type: this.props.fieldType,
                fullWidth: true
            })
        );
    }
});
module.exports = exports["default"];
