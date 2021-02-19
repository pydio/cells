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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _callbackOpenInEditor = require('../callback/openInEditor');

var _callbackOpenInEditor2 = _interopRequireDefault(_callbackOpenInEditor);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var React = require('react');

var _require = require('material-ui');

var FontIcon = _require.FontIcon;
var ListItem = _require.ListItem;
var List = _require.List;
var FlatButton = _require.FlatButton;

var Pydio = require('pydio');
var PydioDataModel = require('pydio/model/data-model');
var LangUtils = require('pydio/util/lang');

var _Pydio$requireLib = Pydio.requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;

var OtherEditorPickerDialog = (0, _createReactClass2['default'])({

    propTypes: {
        pydio: _propTypes2['default'].instanceOf(Pydio),
        selection: _propTypes2['default'].instanceOf(PydioDataModel)
    },

    mixins: [ActionDialogMixin],

    getButtons: function getButtons(updater) {
        var actions = [];
        var mess = this.props.pydio.MessageHash;
        actions.push(React.createElement(FlatButton, {
            key: 'clear',
            label: MessageHash['openother.5'],
            primary: false,
            onTouchTap: this.clearAssociations
        }));
        actions.push(React.createElement(FlatButton, {
            label: mess['49'],
            primary: true,
            keyboardFocused: true,
            onTouchTap: this.props.onDismiss
        }));
        return actions;
    },

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitleId: 'openother.2',
            dialogIsModal: false,
            dialogSize: 'sm',
            dialogPadding: 0
        };
    },
    findActiveEditors: function findActiveEditors(mime) {
        var editors = [];
        var checkWrite = false;
        var pydio = this.props.pydio;

        if (this.user != null && !this.user.canWrite()) {
            checkWrite = true;
        }
        pydio.Registry.getActiveExtensionByType('editor').forEach(function (el) {
            if (checkWrite && el.write) return;
            if (!el.openable) return;
            editors.push(el);
        });
        return editors;
    },

    clearAssociations: function clearAssociations() {
        var _this = this;

        var mime = this.props.selection.getUniqueNode().getAjxpMime();
        var guiPrefs = undefined,
            assoc = undefined;
        try {
            guiPrefs = this.props.pydio.user.getPreference("gui_preferences", true);
            assoc = guiPrefs["other_editor_extensions"];
        } catch (e) {}
        if (assoc && assoc[mime]) {
            (function () {
                var editorClassName = assoc[mime];
                var editor = undefined;
                _this.props.pydio.Registry.getActiveExtensionByType("editor").forEach(function (ed) {
                    if (ed.editorClass === editorClassName) editor = ed;
                });
                if (editor && editor.mimes.indexOf(mime) !== -1) {
                    editor.mimes = LangUtils.arrayWithout(editor.mimes, editor.mimes.indexOf(mime));
                }
                delete assoc[mime];
                guiPrefs["other_editor_extensions"] = assoc;
                _this.props.pydio.user.setPreference("gui_preferences", guiPrefs, true);
                _this.props.pydio.user.savePreference("gui_preferences");
            })();
        }
        this.props.onDismiss();
    },

    selectEditor: function selectEditor(editor, event) {
        var _props = this.props;
        var pydio = _props.pydio;
        var selection = _props.selection;

        var mime = selection.getUniqueNode().getAjxpMime();
        editor.mimes.push(mime);
        var user = pydio.user;
        if (!user) return;

        var guiPrefs = user.getPreference("gui_preferences", true) || {};
        var exts = guiPrefs["other_editor_extensions"] || {};
        exts[mime] = editor.editorClass;
        guiPrefs["other_editor_extensions"] = exts;
        user.setPreference("gui_preferences", guiPrefs, true);
        user.savePreference("gui_preferences");
        (0, _callbackOpenInEditor2['default'])(pydio)(null, [editor]);
        this.dismiss();
    },

    render: function render() {
        var _this2 = this;

        //let items = [];
        var items = this.findActiveEditors('*').map(function (e) {
            var icon = React.createElement(FontIcon, { className: e.icon_class });
            return React.createElement(ListItem, { onTouchTap: _this2.selectEditor.bind(_this2, e), primaryText: e.text, secondaryText: e.title, leftIcon: icon });
        });
        return React.createElement(
            List,
            { style: { maxHeight: 320, overflowY: 'scroll', width: '100%', borderTop: '1px solid #e0e0e0' } },
            items
        );
    }

});

exports['default'] = OtherEditorPickerDialog;
module.exports = exports['default'];
