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
import EditCellDialog from './EditCellDialog'
import CellModel from 'pydio/model/cell'
import {Paper, MenuItem} from 'material-ui'
import {GenericCard, GenericLine} from '../main/GenericCard'
import ShareHelper from "../main/ShareHelper";

class CellCard extends React.Component{

    constructor(props){
        super(props);
        this.state = {edit: false, model: new CellModel()};
        this._observer = () => {this.forceUpdate()};
    }

    componentDidMount(){
        const {pydio, cellId} = this.props;
        if(pydio.user.activeRepository === cellId) {
            pydio.user.getActiveRepositoryAsCell().then(cell => {
                this.setState({model: cell});
                cell.observe('update', this._observer);
            })
        } else {
            this.state.model.observe('update', ()=>{this.forceUpdate()});
            this.state.model.load(this.props.cellId);
        }
    }

    componentWillUnmount(){
        this.state.model.stopObserving('update', this._observer);
    }

    usersInvitations(userObjects) {
        ShareHelper.sendCellInvitation(this.props.node, this.state.model, userObjects);
    }

    render(){
        const {mode, pydio, editorOneColumn} = this.props;
        const {edit, model} = this.state;
        const m = (id) => pydio.MessageHash['share_center.' + id];

        let rootStyle = {width: 350, minHeight: 270};
        let content;

        if (edit) {
            if(editorOneColumn){
                rootStyle = {width: 350, height: 500};
            } else{
                rootStyle = {width: 700, height: 500};
            }
            content = <EditCellDialog {...this.props} model={model} sendInvitations={this.usersInvitations.bind(this)} editorOneColumn={editorOneColumn}/>;
        } else {
            let nodes = model.getRootNodes().map(node => {
                return model.getNodeLabelInContext(node);
            }).join(', ');
            if (!nodes) {
                nodes = model.getRootNodes().length + ' item(s)';
            }
            let deleteAction, editAction, moreMenuItems;
            if(mode !== 'infoPanel'){
                moreMenuItems = [];
                if(model.getUuid() !== pydio.user.activeRepository){
                    moreMenuItems.push(<MenuItem primaryText={m(246)} onTouchTap={()=>{
                        pydio.triggerRepositoryChange(model.getUuid());
                        this.props.onDismiss();
                    }}/>);
                }
                if(model.isEditable()){
                    deleteAction = ()=>{model.deleteCell().then(res=>{this.props.onDismiss()})};
                    editAction = () => {
                        this.setState({edit: true});
                        if(this.props.onHeightChange){
                            this.props.onHeightChange(500);
                        }
                    };
                    moreMenuItems.push(<MenuItem primaryText={m(247)} onTouchTap={()=>this.setState({edit:true})}/>);
                    moreMenuItems.push(<MenuItem primaryText={m(248)} onTouchTap={deleteAction}/>);
                }
            }
            content = (
                <GenericCard
                    pydio={pydio}
                    title={model.getLabel()}
                    onDismissAction={this.props.onDismiss}
                    onDeleteAction={deleteAction}
                    onEditAction={editAction}
                    headerSmall={mode === 'infoPanel'}
                    moreMenuItems={moreMenuItems}
                >
                    {model.getDescription() &&
                        <GenericLine iconClassName="mdi mdi-information" legend={m(145)} data={model.getDescription()}/>
                    }
                    <GenericLine iconClassName="mdi mdi-account-multiple" legend={m(54)} data={model.getAclsSubjects()}/>
                    <GenericLine iconClassName="mdi mdi-folder" legend={m(249)} data={nodes}/>
                </GenericCard>
            );
            if(mode === 'infoPanel'){
                return content;
            }
        }

        return <Paper zDepth={0} style={rootStyle}>{content}</Paper>

    }

}

//CellCard = PaletteModifier({primary1Color:'#009688'})(CellCard);
export {CellCard as default}