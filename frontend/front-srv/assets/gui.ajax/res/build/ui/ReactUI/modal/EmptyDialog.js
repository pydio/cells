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
 * Sample Dialog class used for reference only, ready to be
 * copy/pasted :-)
 */
var createReactClass = require('create-react-class');
exports['default'] = createReactClass({

    mixins: [_ActionDialogMixin2['default'], _CancelButtonProviderMixin2['default'], _SubmitButtonProviderMixin2['default']],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: "Title",
            dialogIsModal: true
        };
    },
    submit: function submit() {
        this.dismiss();
    },
    render: function render() {
        return React.createElement(
            'div',
            null,
            'Empty'
        );
    }

});
module.exports = exports['default'];
