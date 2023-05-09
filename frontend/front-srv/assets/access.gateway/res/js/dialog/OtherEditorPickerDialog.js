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

const React = require('react')
const {FontIcon, ListItem, List, FlatButton} = require('material-ui')
const Pydio = require('pydio')
const PydioDataModel = require('pydio/model/data-model')
const LangUtils=  require('pydio/util/lang')
const {ActionDialogMixin} = Pydio.requireLib('boot')
import openInEditor from '../callback/openInEditor'
import createReactClass from 'create-react-class'
import PropTypes from 'prop-types'

let OtherEditorPickerDialog = createReactClass({

    propTypes:{
        pydio: PropTypes.instanceOf(Pydio),
        selection: PropTypes.instanceOf(PydioDataModel)
    },

    mixins:[
        ActionDialogMixin
    ],

    getButtons: function(updater){
        let actions = [];
        const mess = this.props.pydio.MessageHash;
        actions.push(<FlatButton
            key="clear"
            label={MessageHash['openother.5']}
            primary={false}
            onClick={this.clearAssociations}
        />);
        actions.push(<FlatButton
            label={mess['54']}
            primary={true}
            keyboardFocused={true}
            onClick={this.props.onDismiss}
        />);
        return actions;
    },

    getDefaultProps: function(){
        return {
            dialogTitleId: 'openother.2',
            dialogIsModal: false,
            dialogSize:'sm',
            dialogPadding: 0,
        };
    },
    findActiveEditors : function(mime){
        let editors = [];
        let checkWrite = false;
        const {pydio} = this.props;
        if(this.user != null && !this.user.canWrite()){
            checkWrite = true;
        }
        pydio.Registry.getActiveExtensionByType('editor').forEach(function(el){
            if(checkWrite && el.write) return;
            if(!el.openable) return;
            editors.push(el);
        });
        return editors;
    },

    clearAssociations: function(){
        const mime = this.props.selection.getUniqueNode().getAjxpMime();
        let guiPrefs, assoc;
        try{
            guiPrefs = this.props.pydio.user.getPreference("gui_preferences", true);
            assoc = guiPrefs["other_editor_extensions"];
        }catch(e){}
        if(assoc && assoc[mime]){
            const editorClassName = assoc[mime];
            let editor;
            this.props.pydio.Registry.getActiveExtensionByType("editor").forEach(function(ed){
                if(ed.editorClass === editorClassName) editor = ed;
            });
            if(editor && editor.mimes.indexOf(mime) !== -1){
                editor.mimes = LangUtils.arrayWithout(editor.mimes, editor.mimes.indexOf(mime));
            }
            delete assoc[mime];
            guiPrefs["other_editor_extensions"] = assoc;
            this.props.pydio.user.setPreference("gui_preferences", guiPrefs, true);
            this.props.pydio.user.savePreference("gui_preferences");
        }
        this.props.onDismiss();

    },

    selectEditor: function(editor, event){
        const {pydio, selection} = this.props;
        const mime = selection.getUniqueNode().getAjxpMime();
        editor.mimes.push(mime);
        let user = pydio.user;
        if(!user) return;

        let guiPrefs = user.getPreference("gui_preferences", true) || {};
        let exts = guiPrefs["other_editor_extensions"] || {};
        exts[mime] = editor.editorClass;
        guiPrefs["other_editor_extensions"] = exts;
        user.setPreference("gui_preferences", guiPrefs, true);
        user.savePreference("gui_preferences");
        openInEditor(pydio)(null, [editor]);
        this.dismiss();
    },

    render: function(){
        //let items = [];
        const items = this.findActiveEditors('*').map((e) => {
            const icon = <FontIcon className={e.icon_class}/>;
            return <ListItem onClick={this.selectEditor.bind(this, e)} primaryText={e.text} secondaryText={e.title} leftIcon={icon}/>;
        });
        return (
            <List style={{maxHeight: 320, overflowY: 'scroll', width: '100%', borderTop:'1px solid #e0e0e0'}}>
                {items}
            </List>
        );
    }

});

export {OtherEditorPickerDialog as default}