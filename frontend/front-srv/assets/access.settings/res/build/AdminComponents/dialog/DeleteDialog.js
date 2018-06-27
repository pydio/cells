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

Object.defineProperty(exports, "__esModule", {
    value: true
});
var DeleteDialog = React.createClass({
    displayName: "DeleteDialog",

    propTypes: {
        userSelection: React.PropTypes.instanceOf(PydioDataModel)
    },

    getInitialState: function getInitialState() {

        var selection = this.props.userSelection;
        var firstNode = selection.getUniqueNode();
        var meta = firstNode.getMetadata();
        var deleteMessageId = undefined,
            fieldName = undefined,
            fieldValues = [],
            metaAttribute = 'basename';

        if (meta.get("ajxp_mime") == "user_editable") {
            deleteMessageId = 'settings.34';
            fieldName = "user_id";
        } else if (meta.get("ajxp_mime") == "role") {
            deleteMessageId = 'settings.126';
            fieldName = "role_id";
        } else if (meta.get("ajxp_mime") == "group") {
            deleteMessageId = 'settings.126';
            fieldName = "group";
            metaAttribute = "filename";
        } else {
            deleteMessageId = 'settings.35';
            fieldName = "repository_id";
            metaAttribute = "repository_id";
        }
        fieldValues = selection.getSelectedNodes().map(function (node) {
            if (metaAttribute === 'basename') {
                return PathUtils.getBasename(node.getMetadata().get('filename'));
            } else {
                return node.getMetadata().get(metaAttribute);
            }
        });
        return {
            node: firstNode,
            mime: firstNode.getMetadata().get('ajxp_mime'),
            deleteMessage: global.MessageHash[deleteMessageId],
            fieldName: fieldName,
            fieldValues: fieldValues
        };
    },

    getTitle: function getTitle() {
        return this.state.deleteMessage;
    },

    getDialogClassName: function getDialogClassName() {
        return "dialog-max-480";
    },

    getButtons: function getButtons() {
        return [{ text: 'Cancel' }, { text: 'Delete', onClick: this.submit, ref: 'submit' }];
    },

    submit: function submit(dialog) {
        if (!this.state.fieldValues.length) {
            return;
        }
        var parameters = {
            get_action: 'delete'
        };
        if (this.state.fieldValues.length === 1) {
            parameters[this.state.fieldName] = this.state.fieldValues[0];
        } else {
            parameters[this.state.fieldName + '[]'] = this.state.fieldValues;
        }
        PydioApi.getClient().request(parameters, (function (transport) {
            this.props.dismiss();
            if (this.state.node.getParent()) {
                this.state.node.getParent().reload();
            }
        }).bind(this));
    },

    render: function render() {
        return React.createElement("div", null);
    }

});

exports["default"] = DeleteDialog;
module.exports = exports["default"];
