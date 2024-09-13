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
import React, {createRef} from 'react'
import Pydio from 'pydio'
import MetaClient from "./MetaClient";
import UserMetaPanel from './UserMetaPanel'
import {FlatButton} from 'material-ui';
const {InfoPanelCard} = Pydio.requireLib('workspaces')

export default class InfoPanel extends React.Component{

    constructor(props){
        super(props);
        this.panel = createRef();

        this.state = {};
        this._nodeObserver = () => {
            this.panel.current && this.panel.current.resetUpdateData();
            this.forceUpdate();
        };
        if(props.node){
            props.node.observe('node_replaced', this._nodeObserver)
        }
    }

    componentWillReceiveProps(newProps){
        if (newProps.node === this.props.node) {
            return
        }
        this.panel.current && this.panel.current.resetUpdateData();
        this.props.node && this.props.node.stopObserving('node_replaced', this._nodeObserver)
        newProps.node && newProps.node.observe('node_replaced', this._nodeObserver)

    }

    componentWillUnmount(){
        this.props.node && this.props.node.stopObserving('node_replaced', this._nodeObserver)
    }

    saveMeta(){
        let values = this.panel.current.getUpdateData();
        const {node} = this.props;
        return MetaClient.getInstance().saveMeta([node], values).then(() => {
            //this.panel.current.resetUpdateData(); // Reset
        });
    }

    onChangeUpdateData(updateData){
        this.setState({updateData})
    }

    render(){
        let actions = [];
        const {pydio, node, popoverPanel, ...infoProps} = this.props;
        const {MessageHash} = pydio;
        const values = this.panel.current  ? this.panel.current.getUpdateData() : new Map();
        const readOnly = node.getMetadata().get('node_readonly') === 'true';
        let hasAction = false;

        if(!readOnly && values.size > 0) {
            hasAction = true
            actions.push(
                <FlatButton
                    key="edit"
                    label={MessageHash['meta.user.15']}
                    onClick={()=>{this.saveMeta()}}
                />
            );
        }
        let style = {}
        if(popoverPanel) {
            style = {...style,
                maxHeight: '80vh',
                overflowY: 'auto'
            }
        }
        if(!hasAction) {
            style = {...style, paddingBottom: 16}
        }

        return (
            <InfoPanelCard
                {...infoProps}
                identifier={"meta-user"}
                style={this.props.style}
                title={this.props.pydio.MessageHash['meta.user.1']}
                actions={actions.length ? actions : null}
                icon="mdi mdi-tag-multiple-outline" iconColor="#00ACC1"
                popoverPanel={popoverPanel}
            >
                <UserMetaPanel
                    ref={this.panel}
                    node={this.props.node}
                    editMode={!readOnly}
                    pydio={this.props.pydio}
                    onChangeUpdateData={(d) => {this.onChangeUpdateData(d)}}
                    autoSave={()=>{
                        this.saveMeta();
                    }}
                    style={style}
                />
            </InfoPanelCard>
        );
    }

}
