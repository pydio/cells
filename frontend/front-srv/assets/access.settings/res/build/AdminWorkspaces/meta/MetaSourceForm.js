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

var _require = require('material-ui');

var MenuItem = _require.MenuItem;
var SelectField = _require.SelectField;

var _require$requireLib = require('pydio').requireLib('boot');

var ActionDialogMixin = _require$requireLib.ActionDialogMixin;
var CancelButtonProviderMixin = _require$requireLib.CancelButtonProviderMixin;
var SubmitButtonProviderMixin = _require$requireLib.SubmitButtonProviderMixin;
var _AdminComponents = AdminComponents;
var MessagesConsumerMixin = _AdminComponents.MessagesConsumerMixin;

var MetaSourceForm = React.createClass({
    displayName: 'MetaSourceForm',

    mixins: [MessagesConsumerMixin, ActionDialogMixin, CancelButtonProviderMixin, SubmitButtonProviderMixin],

    propTypes: {
        model: React.PropTypes.object,
        editor: React.PropTypes.object,
        modalData: React.PropTypes.object
    },

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitleId: 'ajxp_admin.ws.46',
            dialogSize: 'sm'
        };
    },

    getInitialState: function getInitialState() {
        return { step: 'chooser' };
    },

    setModal: function setModal(pydioModal) {
        this.setState({ modal: pydioModal });
    },

    submit: function submit() {
        if (this.state.pluginId && this.state.pluginId !== -1) {
            this.dismiss();
            this.props.editor.addMetaSource(this.state.pluginId);
        }
    },

    render: function render() {
        var model = this.props.model;
        var currentMetas = model.getOption("META_SOURCES", true);
        var allMetas = model.getAllMetaSources();

        var menuItems = [];
        allMetas.map(function (metaSource) {
            var id = metaSource['id'];
            var type = id.split('.').shift();
            if (type === 'metastore' || type === 'index') {
                var already = false;
                Object.keys(currentMetas).map(function (metaKey) {
                    if (metaKey.indexOf(type) === 0) already = true;
                });
                if (already) return;
            } else {
                if (currentMetas[id]) return;
            }
            menuItems.push(React.createElement(MenuItem, { value: metaSource['id'], primaryText: metaSource['label'] }));
        });
        var change = (function (event, index, value) {
            if (value !== -1) {
                this.setState({ pluginId: value });
            }
        }).bind(this);
        return React.createElement(
            'div',
            { style: { width: '100%' } },
            React.createElement(
                SelectField,
                { value: this.state.pluginId, fullWidth: true, onChange: change },
                menuItems
            )
        );
    }

});

exports['default'] = MetaSourceForm;
module.exports = exports['default'];
