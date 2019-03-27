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

"use strict";

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _materialUi = require("material-ui");

var _pydioUtilDom = require('pydio/util/dom');

var _pydioUtilDom2 = _interopRequireDefault(_pydioUtilDom);

var _ActionDialogMixin = require('./ActionDialogMixin');

var _ActionDialogMixin2 = _interopRequireDefault(_ActionDialogMixin);

var _CancelButtonProviderMixin = require('./CancelButtonProviderMixin');

var _CancelButtonProviderMixin2 = _interopRequireDefault(_CancelButtonProviderMixin);

var _SubmitButtonProviderMixin = require('./SubmitButtonProviderMixin');

var _SubmitButtonProviderMixin2 = _interopRequireDefault(_SubmitButtonProviderMixin);

/**
 * Ready-to-use dialog for requiring information (text or password) from the user
 *
 */
exports["default"] = _react2["default"].createClass({
    displayName: "PromptDialog",

    propTypes: {
        /**
         * Message ID used for the dialog title
         */
        dialogTitleId: _react2["default"].PropTypes.string,
        /**
         * Message ID or string used for dialog legend
         */
        legendId: _react2["default"].PropTypes.string,
        /**
         * MessageID used for the field Floating Label Text
         */
        fieldLabelId: _react2["default"].PropTypes.string,
        /**
         * Either text or password
         */
        fieldType: _react2["default"].PropTypes.oneOf(['text', 'password']),
        /**
         * Callback used at submit time
         */
        submitValue: _react2["default"].PropTypes.func.isRequired,
        /**
         * Preset value displayed in the text field
         */
        defaultValue: _react2["default"].PropTypes.string,
        /**
         * Select a part of the default value [NOT IMPLEMENTED]
         */
        defaultInputSelection: _react2["default"].PropTypes.string
    },

    mixins: [_ActionDialogMixin2["default"], _CancelButtonProviderMixin2["default"], _SubmitButtonProviderMixin2["default"]],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: '',
            dialogIsModal: true,
            fieldType: 'text'
        };
    },
    /**
     * Trigger props callback and dismiss modal
     */
    submit: function submit() {
        this.props.submitValue(this.refs.input.getValue());
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
                if (defaultInputSelection) {
                    _pydioUtilDom2["default"].selectBaseFileName(_this.refs.input.input);
                }
                _this.refs.input.focus();
            } catch (e) {}
        }, 150);
    },

    render: function render() {
        return _react2["default"].createElement(
            "div",
            { style: { width: '100%' } },
            _react2["default"].createElement(
                "div",
                { className: "dialogLegend" },
                MessageHash[this.props.legendId] || this.props.legendId
            ),
            _react2["default"].createElement(_materialUi.TextField, {
                floatingLabelText: MessageHash[this.props.fieldLabelId] || this.props.fieldLabelId,
                ref: "input",
                onKeyDown: this.submitOnEnterKey,
                defaultValue: this.props.defaultValue,
                type: this.props.fieldType,
                fullWidth: true
            })
        );
    }

});
module.exports = exports["default"];
