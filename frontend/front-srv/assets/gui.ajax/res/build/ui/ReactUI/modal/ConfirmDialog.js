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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _ActionDialogMixin = require('./ActionDialogMixin');

var _ActionDialogMixin2 = _interopRequireDefault(_ActionDialogMixin);

var _CancelButtonProviderMixin = require('./CancelButtonProviderMixin');

var _CancelButtonProviderMixin2 = _interopRequireDefault(_CancelButtonProviderMixin);

var _SubmitButtonProviderMixin = require('./SubmitButtonProviderMixin');

var _SubmitButtonProviderMixin2 = _interopRequireDefault(_SubmitButtonProviderMixin);

var _materialUi = require('material-ui');

exports['default'] = React.createClass({
    displayName: 'ConfirmDialog',

    propTypes: {
        message: React.PropTypes.string.isRequired,
        validCallback: React.PropTypes.func.isRequired
    },

    mixins: [_ActionDialogMixin2['default'], _CancelButtonProviderMixin2['default'], _SubmitButtonProviderMixin2['default']],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: _pydio2['default'].getInstance().MessageHash['confirm.dialog.title'],
            dialogIsModal: true
        };
    },
    getInitialState: function getInitialState() {
        return {};
    },
    submit: function submit() {
        var _props = this.props;
        var validCallback = _props.validCallback;
        var skipNext = _props.skipNext;
        var skipChecked = this.state.skipChecked;

        if (skipNext && skipChecked) {
            localStorage.setItem('confirm.skip.' + skipNext, 'true');
        }
        validCallback();
        this.dismiss();
    },
    render: function render() {
        var _this = this;

        var _props2 = this.props;
        var destructive = _props2.destructive;
        var message = _props2.message;
        var skipNext = _props2.skipNext;
        var pydio = _props2.pydio;
        var skipChecked = this.state.skipChecked;

        var m = function m(id) {
            return pydio.MessageHash['confirm.dialog.' + id] || id;
        };
        var dMess = undefined,
            sMess = undefined;
        if (destructive && destructive.join) {
            dMess = React.createElement(
                'div',
                { style: { marginTop: 12 } },
                m('destructive'),
                ' : ',
                React.createElement(
                    'span',
                    { style: { color: '#C62828' } },
                    destructive.join(', ')
                ),
                '.'
            );
        }
        if (skipNext) {
            if (localStorage.getItem('confirm.skip.' + skipNext)) {
                this.submit();
                return null;
            } else {
                sMess = React.createElement(
                    'div',
                    { style: { marginTop: 24, marginBottom: -24 } },
                    React.createElement(_materialUi.Checkbox, {
                        checked: skipChecked,
                        onCheck: function (e, v) {
                            _this.setState({ skipChecked: v });
                        },
                        labelPosition: "right",
                        label: m('skipNext'),
                        labelStyle: { color: 'inherit' }
                    })
                );
            }
        }
        return React.createElement(
            'div',
            null,
            message,
            dMess && React.createElement('br', null),
            dMess,
            sMess && React.createElement('br', null),
            sMess
        );
    }

});
module.exports = exports['default'];
