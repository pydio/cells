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
const PydioDataModel = require('pydio/model/data-model');
const AjxpNode = require('pydio/model/node');
const RemoteNodeProvider = require('pydio/model/remote-node-provider');
const {MenuItem, SelectField, TextField, Paper, RaisedButton, IconButton, FlatButton} = require('material-ui');
const {FoldersTree} = require('pydio').requireLib('components');

const TreeDialog = React.createClass({

    propTypes:{
        isMove:React.PropTypes.bool.isRequired,
        submitValue:React.PropTypes.func.isRequired
    },

    mixins:[
        PydioReactUI.ActionDialogMixin,
        PydioReactUI.CancelButtonProviderMixin,
        PydioReactUI.SubmitButtonProviderMixin
    ],

    getDefaultProps: function(){
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

    getInitialState: function(){
        const dm = this.getCurrentDataModel();
        const root = dm.getRootNode();
        root.load();
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
        if(repoId) root.getMetadata().set('repository_id', repoId);
        return dm;
    },

    onNodeSelected: function(n){
        n.load();
        this.setState({
            selectedNode: n
        })
    },

    createNewFolder: function(){
        let parent = this.state.selectedNode;
        let nodeName = this.refs.newfolder_input.getValue();
        let oThis = this;
        const additional = (this.state.wsId !== '__CURRENT__') ? {tmp_repository_id:this.state.wsId} : {};

        PydioApi.getClient().request({
            get_action:'mkdir',
            dir: parent.getPath(),
            dirname:nodeName,
            ...additional
        }, function(){
            let fullpath = parent.getPath() + '/' + nodeName;
            parent.observeOnce('loaded', function(){
                let n = parent.getChildren().get(fullpath);
                if(n) oThis.setState({selectedNode:n});
            });
            global.setTimeout(function(){
                parent.reload();
            }, 500);
            oThis.setState({newFolderFormOpen: false});
        });

    },

    handleRepositoryChange: function(event, index, value){
        const dm = this.getCurrentDataModel(value);
        const root = dm.getRootNode();
        root.load();
        this.setState({dataModel:dm, selectedNode: root, wsId: value});
    },

    render: function(){
        let openNewFolderForm = function(){
            this.setState({newFolderFormOpen: !this.state.newFolderFormOpen});
        }.bind(this)

        let user = this.props.pydio.user;
        let wsSelector ;
        if(user && user.canCrossRepositoryCopy() && user.hasCrossRepositories()){
            let items = [];
            if(user.canWrite()){
                items.push(<MenuItem key={'current'} value={'__CURRENT__'} primaryText={this.props.pydio.MessageHash[372]} />);
            }
            user.getCrossRepositories().forEach(function(repo, key){
                items.push(<MenuItem key={key} value={key} primaryText={repo.getLabel()} />);
            });
            wsSelector = (
                <div>
                    <SelectField
                        style={{width:'100%'}}
                        floatingLabelText={this.props.pydio.MessageHash[373]}
                        value={this.state.wsId}
                        onChange={this.handleRepositoryChange}
                    >
                        {items}
                    </SelectField>
                </div>
            );
        }
        let openStyle = {flex:1,width:'100%'};
        let closeStyle = {width:0};
        const {newFolderFormOpen} = this.state;
        return (
            <div style={{width:'100%'}}>
                {wsSelector}
                <Paper zDepth={0} style={{height: 300, overflowX:'auto', color: '#546E7A', fontSize: 14, padding: '6px 0px', backgroundColor: '#eceff1', marginTop:-6}}>
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
                        backgroundColor:'#eceff1',
                        display:'flex',
                        alignItems:'baseline',
                        height:newFolderFormOpen?80:0,
                        overflow:newFolderFormOpen ? 'visible':'hidden',
                        opacity:newFolderFormOpen ? 1:0,
                        padding: '0 10px',
                        marginTop: 6
                    }}
                >
                    <TextField fullWidth={true} floatingLabelText={this.props.pydio.MessageHash[173]} ref="newfolder_input" style={{flex:1}}/>
                    <IconButton iconClassName="mdi mdi-undo" iconStyle={{color: '#546E7A'}} tooltip={this.props.pydio.MessageHash[49]} onTouchTap={openNewFolderForm}/>
                    <IconButton iconClassName="mdi mdi-check" iconStyle={{color: '#546E7A'}} tooltip={this.props.pydio.MessageHash[48]} onTouchTap={() => {this.createNewFolder() }}/>
                </Paper>
                <div style={{display:'flex',alignItems:'baseline'}}>
                    <TextField
                        style={{flex:1,width:'100%', marginRight: 10}}
                        floatingLabelText={this.props.pydio.MessageHash[373]}
                        ref="input"
                        value={this.state.selectedNode.getPath()}
                        disabled={false}
                        onChange={()=>{}}
                    />
                    {!newFolderFormOpen &&
                        <IconButton iconClassName="mdi mdi-folder-plus" style={{backgroundColor:'#eceff1', borderRadius: '50%'}} iconStyle={{color: '#546E7A'}} tooltip={this.props.pydio.MessageHash[154]} onTouchTap={openNewFolderForm}/>
                    }
                </div>
            </div>
        );
    }

});

export {TreeDialog as default}