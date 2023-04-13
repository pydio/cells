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
import Pydio from 'pydio'
import {List, ListItem, FontIcon, FlatButton, RaisedButton, IconButton, Divider, DropDownMenu, MenuItem} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import PydioDataModel from 'pydio/model/data-model'
const {FoldersTree} = Pydio.requireLib('components');
const {ThemedContainers:{Popover}} = Pydio.requireLib('hoc');

class NodesPicker extends React.Component{

    constructor(props){
        super(props);
        let crtWs;

        const user = props.pydio.user;
        const avail = [] ;
        user.getRepositoriesList().forEach(repo => {
            if (repo.getAccessType() === 'gateway'){
                if(repo.getId() === user.activeRepository){
                    if(repo.getOwner() === 'shared'){
                        return; // do not push to the list
                    }
                    crtWs = repo;
                }
                avail.push(repo);
            }
        });
        let availableWs = [];
        const notOwned = avail.filter(repo => !repo.getOwner());
        const owned = avail.filter(repo => repo.getOwner());
        if(notOwned.length && owned.length){
            availableWs = [...notOwned, 'DIVIDER', ...owned];
        } else {
            availableWs = [...notOwned, ...owned];
        }

        let dm;
        if (availableWs.length){
            if(!crtWs) {
                crtWs = availableWs[0];
            }
            dm = PydioDataModel.RemoteDataModelFactory({tmp_repository_id:crtWs.getId()});
            const root = dm.getRootNode();
            root.getMetadata().set('repository_id', crtWs.getId());
            root.load(dm.getAjxpNodeProvider());
        }

        this.state = {
            dataModel: dm,
            open: false,
            availableWs: availableWs,
            crtWs : crtWs
        };
    }

    switchWorkspace(ws){
        const dm = PydioDataModel.RemoteDataModelFactory({tmp_repository_id:ws.getId()});
        const root = dm.getRootNode();
        root.getMetadata().set('repository_id', ws.getId());
        root.load(dm.getAjxpNodeProvider());
        this.setState({crtWs: ws, dataModel: dm});

    }

    handleTouchTap(event){
        // This prevents ghost click.
        event.preventDefault();

        this.setState({
            open: true,
            anchorEl: event.currentTarget,
        });
    }

    handleRequestClose(){
        this.setState({
            open: false,
        });
    }

    onValidateNode(){
        const {node, crtWs} = this.state;
        this.props.model.addRootNode(node, crtWs.getId());
        this.handleRequestClose();
    }

    onNodeSelected(node){
        const {dataModel} = this.state;
        node.load(dataModel.getAjxpNodeProvider());
        this.setState({node: node});
    }

    /**
     *
     * @param node TreeNode
     * @return {XML}
     */
    renderNodeLine(node){
        const {model} = this.props;
        return (
            <ListItem
                disabled={true}
                leftIcon={<FontIcon className={"mdi mdi-" + (node.Type === 'LEAF' ? 'file' : 'folder')}/>}
                primaryText={model.getNodeLabelInContext(node)}
                rightIconButton={<IconButton onClick={()=>{model.removeRootNode(node.Uuid);}} iconClassName="mdi mdi-delete" tooltip="Remove" iconStyle={{color:'var(--md-sys-color-secondary)'}}/>}
            />
        );
    }

    render(){

        const {model, muiTheme, mode, pydio} = this.props;
        const m = (id) => pydio.MessageHash['share_center.' + id];
        const nodes = model.getRootNodes() || [];
        let nodeLines = [], emptyStateString;
        nodes.map(node => {
            nodeLines.push(this.renderNodeLine(node));
            nodeLines.push(<Divider inset={true}/>)
        });
        nodeLines.pop();
        if(!nodes.length && mode === 'edit'){
            emptyStateString = <span style={{fontStyle:'italic'}}>{m(280)}</span>;
        }
        let pickButton;
        if(mode === 'edit'){
            pickButton = (<RaisedButton
                label={m(282)}
                onClick={this.handleTouchTap.bind(this)}
                primary={true}
                style={{marginBottom: 10}}
                icon={<FontIcon className={"mdi mdi-folder-plus"}/>}
            />);
        } else {
            pickButton = (<RaisedButton
                label={m(282)}
                onClick={this.handleTouchTap.bind(this)}
                secondary={true}
                style={{marginBottom: 10}}
                icon={<FontIcon className={"mdi mdi-folder-plus"} style={{fontSize: 20, marginTop: -4}}/>}
            />);
        }
        const {node, availableWs, crtWs} = this.state;

        return (
            <div>
                {pickButton}
                <List>{nodeLines}</List>
                {emptyStateString}
                <Popover
                    open={this.state.open}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                    targetOrigin={{horizontal: 'left', vertical: 'top'}}
                    onRequestClose={this.handleRequestClose.bind(this)}
                >
                    <div style={{width: 372, height: 300, display:'flex', flexDirection:'column'}}>
                        <DropDownMenu style={{height:54}} value={crtWs} onChange={(e,i,v) => {this.switchWorkspace(v);}}>
                            {availableWs.map(ws => {
                                if(ws === 'DIVIDER'){
                                    return <Divider/>
                                } else {
                                    return <MenuItem value={ws} primaryText={ws.getLabel()}/>;
                                }
                            })}
                        </DropDownMenu>
                        <Divider/>
                        <div style={{marginLeft: -26, flex:'1', overflowY: 'auto', fontSize: 15}}>
                            <FoldersTree
                                pydio={this.props.pydio}
                                dataModel={this.state.dataModel}
                                onNodeSelected={this.onNodeSelected.bind(this)}
                                showRoot={false}
                                draggable={false}
                            />
                        </div>
                        <Divider/>
                        <div style={{display:'flex', padding:'4px 16px', alignItems:'center', fontSize: 15}}>
                            <div style={{flex: 1}}>{(node && node.getPath())||m(283)}</div>
                            <IconButton iconStyle={{color:muiTheme.palette.primary1Color}} disabled={!node} iconClassName={"mdi mdi-plus-circle-outline"} onClick={this.onValidateNode.bind(this)}/>
                        </div>
                    </div>

                </Popover>
            </div>
        );

    }

}

NodesPicker = muiThemeable()(NodesPicker)
export {NodesPicker as default}