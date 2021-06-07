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

import React from "react";
import Pydio from 'pydio';
import PropTypes from 'prop-types'
import createReactClass from 'create-react-class'
import LangUtils from 'pydio/util/lang';
import {TreeServiceApi, RestCreateNodesRequest, TreeNode, TreeNodeType} from 'cells-sdk';
import PydioDataModel from "pydio/model/data-model";
import {IconButton, MenuItem, Paper} from "material-ui";
const {ModernTextField, ModernSelectField} = Pydio.requireLib("hoc");

const {FoldersTree} = Pydio.requireLib('components');

const TreeDialog = createReactClass({

    propTypes:{
        isMove:PropTypes.bool.isRequired,
        submitValue:PropTypes.func.isRequired
    },

    mixins:[
        PydioReactUI.ActionDialogMixin,
        PydioReactUI.CancelButtonProviderMixin,
        PydioReactUI.SubmitButtonProviderMixin
    ],

    getDefaultProps(){
        return {
            dialogTitle: 'Copy/Move',
            dialogIsModal: true,
            dialogScrollBody: true
        };
    },

    submit(){
        this.props.submitValue(this.state.selectedNode.getPath(), (this.state.wsId === '__CURRENT__' ? null : this.state.wsId));
        this.dismiss();
    },

    getInitialState(){
        const dm = this.getCurrentDataModel();
        const root = dm.getRootNode();
        root.load(dm.getAjxpNodeProvider());
        return{
            dataModel: dm,
            selectedNode: root,
            wsId:root.getMetadata().get('repository_id') || '__CURRENT__'
        }
    },

    getCurrentDataModel(value = null){
        const {user} = this.props.pydio;
        let repoId, repoLabel = user.getRepositoriesList().get(user.activeRepository).getLabel();
        if(value !== null && value !== '__CURRENT__'){
            repoId = value;
            repoLabel = user.getCrossRepositories().get(value).getLabel();
        }else if(value === null){
            // Detect default value
            if(!user.canWrite() && user.canCrossRepositoryCopy() && user.hasCrossRepositories()){
                repoId = user.getCrossRepositories().keys().next().value;
                repoLabel = user.getCrossRepositories().get(repoId).getLabel();
            }
        }
        const dm = PydioDataModel.RemoteDataModelFactory(repoId ? {tmp_repository_id:repoId} : {}, repoLabel);
        const root = dm.getRootNode();
        if(repoId) {
            root.getMetadata().set('repository_id', repoId);
        }
        return dm;
    },

    onNodeSelected(n){
        const {dataModel} = this.state;
        n.load(dataModel.getAjxpNodeProvider());
        this.setState({
            selectedNode: n
        })
    },

    createNewFolder(){
        const {pydio} = this.props;
        let parent = this.state.selectedNode;
        let nodeName = this.refs.newfolder_input.getValue();
        let slug = pydio.user.getActiveRepositoryObject().getSlug();
        if(this.state.wsId !== '__CURRENT__') {
            const repo = pydio.user.getRepositoriesList().get(this.state.wsId);
            slug = repo.getSlug();
        }
        const api = new TreeServiceApi(PydioApi.getRestClient());
        const request = new RestCreateNodesRequest();

        const path = slug + LangUtils.trimRight(parent.getPath(), '/') + '/' + nodeName;
        const node = new TreeNode();
        node.Path = path;
        node.Type = TreeNodeType.constructFromObject('COLLECTION');
        request.Nodes = [node];
        api.createNodes(request).then(collection => {
            const fullpath = parent.getPath() + '/' + nodeName;
            parent.observeOnce('loaded', () => {
                let n = parent.getChildren().get(fullpath);
                if(n) {
                    this.setState({selectedNode:n});
                }
            });
            setTimeout(() => parent.reload(), 1500);
            this.setState({newFolderFormOpen: false});
        });
    },

    handleRepositoryChange(event, index, value){
        const dm = this.getCurrentDataModel(value);
        const root = dm.getRootNode();
        root.load();
        this.setState({dataModel:dm, selectedNode: root, wsId: value});
    },

    render(){
        let openNewFolderForm = () => {
            this.setState({newFolderFormOpen: !this.state.newFolderFormOpen});
        };

        let user = this.props.pydio.user;
        let wsSelector = <div style={{height: 30}}/> ;
        if(user && user.canCrossRepositoryCopy() && user.hasCrossRepositories()){
            let menuItems = [];
            let items = [];
            if(user.canWrite()){
                menuItems.push(<MenuItem key={'current'} value={'__CURRENT__'} primaryText={this.props.pydio.MessageHash[372]} />);
            }
            user.getCrossRepositories().forEach(function(repo, key){
                items.push({label:repo.getLabel(), item: <MenuItem key={key} value={key} primaryText={repo.getLabel()} />});
            });
            items.sort((a,b) => a.label.localeCompare(b.label, undefined, {numeric: true}));
            menuItems = [...menuItems, ...items.map(i => i.item)];
            wsSelector = (
                <div>
                    <ModernSelectField
                        style={{width:'100%'}}
                        floatingLabelText={this.props.pydio.MessageHash[373]}
                        value={this.state.wsId}
                        onChange={this.handleRepositoryChange}
                    >
                        {menuItems}
                    </ModernSelectField>
                </div>
            );
        }
        const {newFolderFormOpen} = this.state;
        return (
            <div style={{width:'100%', paddingTop: 18}}>
                {wsSelector}
                <Paper zDepth={0} style={{height: 300, overflowX:'auto', color: '#546E7A', fontSize: 14, padding: '6px 0px', backgroundColor: '#f5f5f5', marginTop:4}}>
                    <div style={{marginTop: -41, marginLeft: -21}}>
                        <FoldersTree
                            pydio={this.props.pydio}
                            dataModel={this.state.dataModel}
                            onNodeSelected={this.onNodeSelected}
                            showRoot={true}
                            draggable={false}
                        />
                    </div>
                </Paper>
                <Paper
                    className="bezier-transitions"
                    zDepth={0}
                    style={{
                        display:'flex',
                        alignItems:'baseline',
                        height:newFolderFormOpen?50:0,
                        overflow:newFolderFormOpen ? 'visible':'hidden',
                        opacity:newFolderFormOpen ? 1:0,
                        padding: 0,
                        marginTop: newFolderFormOpen ? 0:4
                    }}
                >
                    <ModernTextField fullWidth={true} floatingLabelText={this.props.pydio.MessageHash[173]} ref="newfolder_input" style={{flex:1}}/>
                    <IconButton iconClassName="mdi mdi-check" iconStyle={{color: '#546E7A'}} tooltip={this.props.pydio.MessageHash[48]} onClick={() => {this.createNewFolder() }}/>
                    <IconButton iconClassName="mdi mdi-close" iconStyle={{color: '#546E7A'}} tooltip={this.props.pydio.MessageHash[49]} onClick={openNewFolderForm}/>
                </Paper>
                <div style={{display:'flex',alignItems:'center'}}>
                    <ModernTextField
                        style={{flex:1,width:'100%', marginRight: 10}}
                        floatingLabelText={this.props.pydio.MessageHash[373]}
                        ref="input"
                        value={this.state.selectedNode.getPath()}
                        disabled={false}
                        onChange={()=>{}}
                    />
                    {!newFolderFormOpen &&
                        <IconButton
                            iconClassName="mdi mdi-folder-plus"
                            style={{height:38, width:38, padding: 6}}
                            iconStyle={{color: '#546E7A', fontSize: 24}}
                            tooltip={this.props.pydio.MessageHash[154]}
                            tooltipPosition={"top-left"}
                            onClick={openNewFolderForm}
                        />
                    }
                </div>
            </div>
        );
    }

});

export {TreeDialog as default}