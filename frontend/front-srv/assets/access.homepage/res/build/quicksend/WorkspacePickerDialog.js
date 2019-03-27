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
var React = require('react');

var _require$requireLib = require('pydio').requireLib('boot');

var ActionDialogMixin = _require$requireLib.ActionDialogMixin;
var CancelButtonProviderMixin = _require$requireLib.CancelButtonProviderMixin;

var _require$requireLib2 = require('pydio').requireLib('workspaces');

var WorkspacesListMaterial = _require$requireLib2.WorkspacesListMaterial;

var WorkspacePickerDialog = React.createClass({
    displayName: 'WorkspacePickerDialog',

    mixins: [ActionDialogMixin, CancelButtonProviderMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitleId: 'user_home.90',
            dialogSize: 'sm',
            dialogPadding: false,
            dialogIsModal: true,
            dialogScrollBody: true
        };
    },

    submit: function submit() {
        this.dismiss();
    },

    workspaceTouchTap: function workspaceTouchTap(wsId) {
        this.dismiss();
        this.props.onWorkspaceTouchTap(wsId);
    },

    render: function render() {
        var pydio = this.props.pydio;

        return React.createElement(
            'div',
            { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column' } },
            this.props.legend,
            React.createElement(WorkspacesListMaterial, {
                pydio: pydio,
                workspaces: pydio.user ? pydio.user.getRepositoriesList() : [],
                showTreeForWorkspace: false,
                onWorkspaceTouchTap: this.workspaceTouchTap,
                filterByType: 'entries',
                sectionTitleStyle: { display: 'none' },
                style: { flex: 1, overflowY: 'auto', maxHeight: 400 }
            })
        );
    }

});

exports['default'] = WorkspacePickerDialog;
module.exports = exports['default'];
