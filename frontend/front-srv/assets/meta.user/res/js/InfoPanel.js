/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import MetaClient from "./MetaClient";
import UserMetaPanel from './UserMetaPanel'
import {FlatButton} from 'material-ui';

export default class InfoPanel extends React.Component{

    constructor(props){
        super(props);
        this.state = {editMode: false};
        this._nodeObserver = () => {
            if(this.refs.panel){
                this.refs.panel.resetUpdateData();
            }
            this.forceUpdate();
            //this.setState({editMode: false}, ()=>{this.forceUpdate()});

        };
        if(props.node){
            props.node.observe('node_replaced', this._nodeObserver)
        }
    }

    openEditMode(){
        this.setState({editMode:true });
    }

    reset(){
        this.refs.panel.resetUpdateData();
        this.setState({editMode: false});
    }

    componentWillReceiveProps(newProps){
        if(this.props.node){
            this.props.node.stopObserving('node_replaced', this._nodeObserver)
        }
        if(newProps.node !== this.props.node && this.refs.panel){
            this.reset();
            newProps.node.observe('node_replaced', this._nodeObserver)
        }
    }

    componentWillUnmount(){
        if(this.props.node){
            this.props.node.stopObserving('node_replaced', this._nodeObserver)
        }
    }

    saveMeta(){
        let values = this.refs.panel.getUpdateData();
        return MetaClient.getInstance().saveMeta(this.props.pydio.getContextHolder().getSelectedNodes(), values);
    }

    saveAndClose(){
        this.saveMeta().then(()=> {
            this.reset();
        });
    }

    onChangeUpdateData(updateData){
        this.setState({updateData})
    }

    render(){
        let actions = [];
        const {node} = this.props;
        const {MessageHash} = this.props.pydio;
        const values = this.state.updateData || new Map();
        const readOnly = node.getMetadata().get('node_readonly') === 'true';

        if(this.state.editMode){
            actions.push(
                <FlatButton
                    key="cancel"
                    label={values.size ? MessageHash['54'] : MessageHash['86']}
                    onClick={()=>{this.reset()}}
                />
            );
            if(!readOnly && values.size > 0){
                actions.push(
                    <FlatButton
                        key="edit"
                        label={this.state.editMode?MessageHash['meta.user.15']:MessageHash['meta.user.14']}
                        onClick={()=>{this.saveAndClose()}}
                    />
                );
            }
        } else if (!readOnly) {
            actions.push(
                <FlatButton
                    key="edit"
                    label={this.state.editMode?MessageHash['meta.user.15']:MessageHash['meta.user.14']}
                    onClick={()=>{this.openEditMode()}}
                />
            );
        }

        return (
            <PydioWorkspaces.InfoPanelCard
                identifier={"meta-user"}
                style={this.props.style}
                title={this.props.pydio.MessageHash['meta.user.1']}
                actions={actions.length ? actions : null}
                icon="tag-multiple" iconColor="#00ACC1"
            >
                <UserMetaPanel
                    ref="panel"
                    node={this.props.node}
                    editMode={this.state.editMode}
                    onRequestEditMode={this.openEditMode.bind(this)}
                    pydio={this.props.pydio}
                    onChangeUpdateData={(d) => {this.onChangeUpdateData(d)}}
                    autoSave={()=>{
                        this.saveMeta().then(()=>{
                            this.refs.panel.resetUpdateData();
                        })
                    }}
                />
            </PydioWorkspaces.InfoPanelCard>
        );
    }

}
