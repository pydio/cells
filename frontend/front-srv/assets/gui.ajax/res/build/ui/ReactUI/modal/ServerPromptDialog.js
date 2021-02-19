/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _materialUi = require('material-ui');

var _ActionDialogMixin = require('./ActionDialogMixin');

var _ActionDialogMixin2 = _interopRequireDefault(_ActionDialogMixin);

var _CancelButtonProviderMixin = require('./CancelButtonProviderMixin');

var _CancelButtonProviderMixin2 = _interopRequireDefault(_CancelButtonProviderMixin);

var _SubmitButtonProviderMixin = require('./SubmitButtonProviderMixin');

var _SubmitButtonProviderMixin2 = _interopRequireDefault(_SubmitButtonProviderMixin);

exports['default'] = _createReactClass2['default']({
    displayName: 'ServerPromptDialog',

    mixins: [_ActionDialogMixin2['default'], _CancelButtonProviderMixin2['default'], _SubmitButtonProviderMixin2['default']],

    propTypes: {
        /**
         * Message ID used for the dialog title
         */
        dialogTitleId: _propTypes2['default'].string,
        /**
         * Main Message displayed in the body of the dialog
         */
        dialogLegendId: _propTypes2['default'].string,
        /**
         * If not empty, dialog will display and then trigger a redirection.
         */
        autoRedirectUrl: _propTypes2['default'].string,
        /**
         * Object containing fields definition that must be shown to user
         * and sent back to server. Fields can be text, password or hidden.
         */
        fieldsDefinitions: _propTypes2['default'].object

    },

    getDefaultProps: function getDefaultProps() {
        return {
            dialogIsModal: true,
            dialogSize: 'sm'
        };
    },

    componentDidMount: function componentDidMount() {
        if (this.props.autoRedirectUrl) {
            this._redirectTimeout = setTimeout(this.redirect.bind(this), 3000);
        }
    },

    redirect: function redirect() {
        window.location.href = this.props.autoRedirectUrl;
    },

    submit: function submit() {
        var _this = this;

        var _props = this.props;
        var autoRedirectUrl = _props.autoRedirectUrl;
        var fieldsDefinitions = _props.fieldsDefinitions;
        var postSubmitCallback = _props.postSubmitCallback;

        if (autoRedirectUrl) {
            this.redirect();
            return;
        }
        if (fieldsDefinitions) {
            (function () {
                var parameters = {};
                Object.keys(fieldsDefinitions).forEach(function (k) {
                    var def = fieldsDefinitions[k];
                    if (def.type !== 'hidden') {
                        parameters[k] = _this.refs['input-' + k].getValue();
                    } else {
                        parameters[k] = def.value;
                    }
                });
                /*
                // Todo: should be rewired to a REST API call
                PydioApi.getClient().request(parameters, (transp) => {
                    if(postSubmitCallback){
                        eval(postSubmitCallback);
                    }
                    this.dismiss();
                });
                */
            })();
        } else {
                if (postSubmitCallback) {
                    eval(postSubmitCallback);
                }
                this.dismiss();
            }
    },

    cancel: function cancel() {
        if (this._redirectTimeout) {
            clearTimeout(this._redirectTimeout);
            this.dismiss();
            return;
        }
        this.dismiss();
    },

    render: function render() {
        var _this2 = this;

        var _props2 = this.props;
        var pydio = _props2.pydio;
        var dialogLegendId = _props2.dialogLegendId;
        var autoRedirectUrl = _props2.autoRedirectUrl;
        var fieldsDefinitions = _props2.fieldsDefinitions;
        var MessageHash = pydio.MessageHash;

        var legend = _react2['default'].createElement(
            'div',
            null,
            pydio.MessageHash[dialogLegendId]
        );

        if (fieldsDefinitions) {
            var _ret2 = (function () {
                var fields = [];
                Object.keys(fieldsDefinitions).forEach(function (k) {
                    var def = fieldsDefinitions[k];
                    if (def.type !== 'hidden') {
                        fields.push(_react2['default'].createElement(_materialUi.TextField, {
                            key: k,
                            floatingLabelText: MessageHash[def.labelId],
                            ref: "input-" + k,
                            defaultValue: def.value || '',
                            onKeyDown: _this2.submitOnEnterKey,
                            type: def.type,
                            fullWidth: true
                        }));
                    }
                });
                return {
                    v: _react2['default'].createElement(
                        'div',
                        null,
                        legend,
                        _react2['default'].createElement(
                            'form',
                            { autoComplete: 'off' },
                            fields
                        )
                    )
                };
            })();

            if (typeof _ret2 === 'object') return _ret2.v;
        } else if (autoRedirectUrl) {
            return _react2['default'].createElement(
                'div',
                null,
                legend,
                _react2['default'].createElement(
                    'div',
                    { style: { marginTop: 16 } },
                    _react2['default'].createElement(
                        'a',
                        { href: autoRedirectUrl },
                        autoRedirectUrl
                    )
                )
            );
        }
        return legend;
    }
});
module.exports = exports['default'];
