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
import {FontIcon, IconButton, MenuItem, Paper, Chip, Avatar, Divider} from "material-ui";

const {ModernTextField, ModernSelectField} = Pydio.requireLib("hoc");
const {FoldersTree} = Pydio.requireLib('components');
const {ActionDialogMixin, CancelButtonProviderMixin, SubmitButtonProviderMixin} = Pydio.requireLib('boot')

let TreeDialog = createReactClass({

    propTypes:{
        isMove:PropTypes.bool.isRequired,
        submitValue:PropTypes.func.isRequired
    },

    mixins:[
        ActionDialogMixin,
        CancelButtonProviderMixin,
        SubmitButtonProviderMixin
    ],

    getDefaultProps(){
        return {
            dialogTitle: 'Copy/Move',
            dialogIsModal: true,
            dialogScrollBody: true
        };
    },

    submit(){
        const {pydio, submitValue} = this.props;
        const {dataModel, wsId} = this.state;
        const path = dataModel.getContextNode().getPath();
        submitValue(path, (wsId === '__CURRENT__' ? null : wsId));
        const storePath = (wsId === '__CURRENT__' ? pydio.user.activeRepository : wsId) + ':' + path;
        TreeDialog.RecentPlaces = TreeDialog.RecentPlaces.filter(p => p !== storePath)
        TreeDialog.RecentPlaces.unshift(storePath);
        TreeDialog.RecentPlaces = TreeDialog.RecentPlaces.slice(0, 5);
        this.dismiss();
    },

    getInitialState(){
        const dm = this.getCurrentDataModel();
        return{
            dataModel: dm,
            wsId:dm.getRootNode().getMetadata().get('repository_id') || '__CURRENT__'
        }
    },

    handleRepositoryChange(event, index, value){
        const dm = this.getCurrentDataModel(value);
        const root = dm.getRootNode();
        root.observeOnce('loaded', () => {
            this.forceUpdate()
        });
        root.load();
        this.setState({dataModel:dm, wsId: value});
    },

    getCurrentDataModel(value = null){
        const {pydio} = this.props;
        const {user} = pydio;
        let repoId, repoLabel = user.getRepositoriesList().get(user.activeRepository).getLabel();
        let startPath;
        if(value !== null && value !== '__CURRENT__'){
            repoId = value;
            repoLabel = user.getCrossRepositories().get(value).getLabel();
        }else if(value === null){
            // Detect default value
            if(!user.canWrite() && user.canCrossRepositoryCopy() && user.hasCrossRepositories()){
                repoId = user.getCrossRepositories().keys().next().value;
                repoLabel = user.getCrossRepositories().get(repoId).getLabel();
            }
            if(!pydio.getContextHolder().getContextNode().isRoot()) {
                startPath = pydio.getContextHolder().getContextNode().getPath();
            }
        }
        const dm = PydioDataModel.RemoteDataModelFactory(repoId ? {tmp_repository_id:repoId} : {}, repoLabel);
        const root = dm.getRootNode();
        if(repoId) {
            root.getMetadata().set('repository_id', repoId);
        }
        if(startPath) {
            // copy root from context holder
            pydio.getContextHolder().getRootNode().getChildren().forEach(child => {
                root.addChild(child);
            })
            dm.loadPathInfoAsync(startPath, function(foundNode){
                dm.requireContextChange(foundNode);
            }.bind(this));
        } else {
            root.observeOnce('loaded', () => {
                this.forceUpdate()
            })
            root.load(dm.getAjxpNodeProvider());
        }
        dm.observe('context_changed', () => {this.forceUpdate()})
        return dm;
    },

    onNodeSelected(n){
        const {dataModel} = this.state;
        dataModel.setContextNode(n);
        n.load(dataModel.getAjxpNodeProvider());
    },

    createNewFolder(){
        const {pydio} = this.props;
        const {dataModel, newFolderInput} = this.state;
        let parent = dataModel.getContextNode();
        let slug = pydio.user.getActiveRepositoryObject().getSlug();
        if(this.state.wsId !== '__CURRENT__') {
            const repo = pydio.user.getRepositoriesList().get(this.state.wsId);
            slug = repo.getSlug();
        }
        const api = new TreeServiceApi(PydioApi.getRestClient());
        const request = new RestCreateNodesRequest();

        const path = slug + LangUtils.trimRight(parent.getPath(), '/') + '/' + newFolderInput;
        const node = new TreeNode();
        node.Path = path;
        node.Type = TreeNodeType.constructFromObject('COLLECTION');
        request.Nodes = [node];
        api.createNodes(request).then(collection => {
            parent.observeOnce('loaded', () => {
                const fullpath = (parent.getPath() === '/'?'':parent.getPath()) + '/' + newFolderInput;
                let n = parent.getChildren().get(fullpath);
                if(n) {
                    dataModel.setContextNode(n);
                }
            });
            setTimeout(() => parent.reload(dataModel.getAjxpNodeProvider()), 1000);
            this.setState({newFolderFormOpen: false, newFolderInput: ""});
        });
    },

    toggleNewFolderForm(){
        const willOpen = !this.state.newFolderFormOpen
        this.setState({newFolderFormOpen: willOpen}, () => {
            if(!willOpen) {
                return;
            }
            this.refs.newfolder_input.focus();

        });
    },

    buildWsSelector() {
        const {pydio} = this.props;
        const {user} = pydio;
        const {wsId} = this.state;

        let wsSelector = <div style={{height: 30}}/> ;
        if(user && user.canCrossRepositoryCopy() && user.hasCrossRepositories()){
            let menuItems = [];
            let items = [];
            if(user.canWrite()){
                const crt = user.getActiveRepositoryObject()
                menuItems.push(
                    <MenuItem
                        key={'current'}
                        value={'__CURRENT__'}
                        primaryText={crt.getLabel() + ' - ' + pydio.MessageHash[372]}
                        leftIcon={<FontIcon style={{fontSize: 20, height:20, top: crt.getOwner()?5:1}} className={crt.getOwner()?'icomoon-cells':'mdi mdi-folder'} />}
                    />);
                menuItems.push(<Divider/>)
            }
            user.getCrossRepositories().forEach(function(repo, key){
                items.push({
                    label:repo.getLabel(),
                    owner:!!repo.getOwner(),
                    item: <MenuItem
                        key={key}
                        value={key}
                        primaryText={repo.getLabel()}
                        leftIcon={<FontIcon style={{fontSize: 20, height:20, top: repo.getOwner()?5:1}} className={repo.getOwner()?'icomoon-cells':'mdi mdi-folder'} />}
                    />});
            });
            items.sort((a,b) => {
                if(a.owner === b.owner){
                    return a.label.localeCompare(b.label, undefined, {numeric: true});
                }
                return a.owner ? 1 : -1
            });
            menuItems = [...menuItems, ...items.map(i => i.item)];
            wsSelector = (
                <div>
                    <ModernSelectField
                        fullWidth={true}
                        variant={"v2"}
                        floatingLabelText={pydio.MessageHash[455]}
                        value={wsId}
                        onChange={this.handleRepositoryChange.bind(this)}
                    >
                        {menuItems}
                    </ModernSelectField>
                </div>
            );
        }
        return wsSelector;
    },

    buildRecentLocations() {
        const {pydio} = this.props;
        const {user} = pydio;
        let recentPlaces;
        if(!TreeDialog.RecentPlaces || !TreeDialog.RecentPlaces.length){
            return recentPlaces;
        }

        const {submitValue}= this.props;
        recentPlaces = (
            <div style={{borderBottom: '1px solid #e0e0e0', padding: '3px 7px 1px', backgroundColor: '#F6F6F8'}}>
                <div style={{color: 'rgba(0,0,0,.3)', fontSize: 12}}>{pydio.MessageHash['action.copymove.recent']}</div>
                <div style={{display:'flex', flexWrap:'wrap', paddingTop: 2}}>{TreeDialog.RecentPlaces.map( p => {
                    const [ws, path] = p.split(":")
                    let avatar;
                    let tooltip = path;
                    if(user && user.getRepositoriesList().has(ws)){
                        // Show workspace letters
                        const repo = user.getRepositoriesList().get(ws)
                        avatar = <Avatar style={{fontSize: 12, height: 24, width: 24, fontWeight:500}}>{repo.getLettersBadge()}</Avatar>;
                        tooltip = repo.getLabel() + path;
                    }
                    return <Chip
                        style={{margin:'0 3px 4px 0'}}
                        labelStyle={{lineHeight:'24px'}}
                        title={tooltip}
                        onClick={() => {
                            submitValue(path, ws);
                            this.dismiss();
                        }}
                    >{avatar}{path}</Chip>
                })}</div>
            </div>
        )

        return recentPlaces;
    },

    render(){
        const {pydio} = this.props;
        const {newFolderFormOpen, dataModel, newFolderInput} = this.state;

        const wsSelector = this.buildWsSelector();
        const recentPlaces = this.buildRecentLocations();

        return (
            <div style={{width:'100%'}}>
                {recentPlaces}
                {wsSelector}
                <Paper zDepth={0} style={{height: 300, overflowX:'auto', color: 'var(--md-sys-color-on-surface-variant)', fontSize: 14, padding: '6px 0px', backgroundColor: 'var(--md-sys-color-surface-variant)', marginTop:4, borderBottom:'1px solid #e0e0e0', borderRadius:'2px 2px 0 0'}}>
                    <div style={{marginTop: -6, marginLeft: -5}}>
                        <FoldersTree
                            pydio={pydio}
                            dataModel={dataModel}
                            onNodeSelected={this.onNodeSelected.bind(this)}
                            showRoot={true}
                            draggable={false}
                            rootLabel={pydio.MessageHash['action.copymove.root']}
                            getItemStyle={(node) => {
                                if(dataModel.getContextNode() === node){
                                    return {fontWeight: 500, backgroundColor:'#ebebef'}
                                }
                                return {}
                            }}
                            getRightIcon={(node) => {
                                if(dataModel.getContextNode() === node){
                                    return (<IconButton
                                        iconClassName="mdi mdi-folder-plus"
                                        style={{height:18, width:18, padding: 0, marginRight:-15}}
                                        iconStyle={{opacity:.5, fontSize: 18}}
                                        tooltip={pydio.MessageHash[154]}
                                        tooltipPosition={"bottom-left"}
                                        onClick={() => this.toggleNewFolderForm()}
                                    />);
                                }
                                return null;
                            }}
                        />
                    </div>
                </Paper>
                <Paper
                    className="bezier-transitions"
                    zDepth={0}
                    style={{
                        position:'relative',
                        height:newFolderFormOpen?60:0,
                        overflow:newFolderFormOpen ? 'visible':'hidden',
                        opacity:newFolderFormOpen ? 1:0,
                        padding: 0,
                        marginTop: newFolderFormOpen ? 0:4
                    }}
                >
                    <ModernTextField
                        fullWidth={true}
                        floatingLabelText={pydio.MessageHash[173]}
                        ref="newfolder_input"
                        variant={"v2"}
                        value={newFolderInput}
                        onKeyDown={(e) =>{
                            if (e.key === 'Enter' && newFolderInput) {
                                this.createNewFolder();
                            }
                        }}
                        onChange={(e,v) => this.setState({newFolderInput: v})}
                    />
                    <div style={{position:"absolute", bottom:-2, right:0}}>
                        <IconButton iconClassName="mdi mdi-check" iconStyle={{color: '#546E7A'}} tooltip={this.props.pydio.MessageHash[48]} onClick={() => {this.createNewFolder() }}/>
                        <IconButton iconClassName="mdi mdi-close" iconStyle={{color: '#546E7A'}} tooltip={this.props.pydio.MessageHash[49]} onClick={() => this.toggleNewFolderForm()}/>
                    </div>
                </Paper>
            </div>
        );
    }

});

TreeDialog.RecentPlaces = [];

export {TreeDialog as default}