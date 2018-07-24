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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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
var React = require('react');

var _require = require('material-ui');

var TextField = _require.TextField;
exports['default'] = React.createClass({
    displayName: 'PromptDialog',

    propTypes: {
        /**
         * Message ID used for the dialog title
         */
        dialogTitleId: React.PropTypes.string,
        /**
         * Message ID used for dialog legend
         */
        legendId: React.PropTypes.string,
        /**
         * MessageID used for the field Floating Label Text
         */
        fieldLabelId: React.PropTypes.string,
        /**
         * Either text or password
         */
        fieldType: React.PropTypes.oneOf(['text', 'password']),
        /**
         * Callback used at submit time
         */
        submitValue: React.PropTypes.func.isRequired,
        /**
         * Preset value displayed in the text field
         */
        defaultValue: React.PropTypes.string,
        /**
         * Select a part of the default value [NOT IMPLEMENTED]
         */
        defaultInputSelection: React.PropTypes.string
    },

    mixins: [_ActionDialogMixin2['default'], _CancelButtonProviderMixin2['default'], _SubmitButtonProviderMixin2['default']],

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

        setTimeout(function () {
            try {
                _this.refs.input.focus();
            } catch (e) {}
        }, 150);
    },

    render: function render() {
        return React.createElement(
            'div',
            { style: { width: '100%' } },
            React.createElement(
                'div',
                { className: 'dialogLegend' },
                MessageHash[this.props.legendId]
            ),
            React.createElement(TextField, {
                floatingLabelText: MessageHash[this.props.fieldLabelId],
                ref: 'input',
                onKeyDown: this.submitOnEnterKey,
                defaultValue: this.props.defaultValue,
                type: this.props.fieldType,
                fullWidth: true
            })
        );
    }

});
module.exports = exports['default'];
