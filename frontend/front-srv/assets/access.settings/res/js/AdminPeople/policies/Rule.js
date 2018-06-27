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

import React from 'react'
import {ListItem, FontIcon, IconButton} from 'material-ui'
import RuleEditor from './editor/RuleEditor'

class Rule extends React.Component{

    componentDidMount(){
        if(this.props.create) {
            this.openEditor();
        }
    }

    openEditor(){

        const {pydio, policy, rule, openRightPane} = this.props;

        if(this.refs.editor && this.refs.editor.isDirty()){
            if(!window.confirm(pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        const editorData = {
            COMPONENT:RuleEditor,
            PROPS:{
                ref:"editor",
                policy:policy,
                rule:rule,
                pydio: pydio,
                saveRule:this.props.onRuleChange,
                create:this.props.create,
                onRequestTabClose:this.closeEditor.bind(this)
            }
        };
        openRightPane(editorData);
        return true;

    }

    closeEditor(editor){
        const {pydio, closeRightPane} = this.props;

        if(editor && editor.isDirty()){
            if(editor.isCreate()){
                this.props.onRemoveRule(this.props.rule, true);
                closeRightPane();
                return true;
            }
            if(!window.confirm(pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        closeRightPane();
        return true;
    }


    removeRule(){
        if(window.confirm('Are you sure you want to remove this security rule?')){
            this.props.onRemoveRule(this.props.rule);
        }
    }

    render(){
        const {rule, readonly} = this.props;
        const iconColor = rule.effect === 'allow' ? '#33691e' : '#d32f2f';
        let buttons = [];
        if(!readonly){
            buttons = [
                <span className="mdi mdi-delete" style={{color: '#9e9e9e', cursor:'pointer', marginLeft: 5}} onTouchTap={this.removeRule.bind(this)}/>,
                <span className="mdi mdi-pencil" style={{color: '#9e9e9e', cursor:'pointer', marginLeft: 5}} onTouchTap={this.openEditor.bind(this)}/>
            ]
        }
        const label = (
            <div>
                {rule.description}
                {buttons}
            </div>
        );

        return (
            <ListItem
                {...this.props}
                style={{fontStyle:'italic', fontSize: 15}}
                primaryText={label}
                leftIcon={<FontIcon className="mdi mdi-traffic-light" color={iconColor}/>}
                disabled={true}
            />
        );
    }

}

export {Rule as default}