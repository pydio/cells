/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
const {dropProvider} = Pydio.requireLib('hoc');
const {FileDropZone} = Pydio.requireLib('form');
import UploadOptionsPane from './UploadOptionsPane'
import ClearOptionsPane from './ClearOptionsPane'
import TransfersList from './TransfersList'
import ConfirmExists from './ConfirmExists'
import {Paper, Toolbar, RaisedButton, FlatButton, IconButton, FontIcon} from 'material-ui'

class DropUploader extends React.Component {
    
    constructor(props){
        super(props);
        const store = UploaderModel.Store.getInstance();
        this._storeObserver = ()=>{
            this.setState({
                sessions: store.getSessions(),
                storeRunning: store.isRunning()
            });
        };
        store.observe("update", this._storeObserver);
        store.observe("auto_close", ()=>{
            if(this.props.onDismiss){
                this.props.onDismiss();
            }
        });

        this.state = {
            showOptions: false,
            configs: UploaderModel.Configs.getInstance(),
            sessions: store.getSessions(),
            storeRunning: store.isRunning(),
            confirmDialog: props.confirmDialog,
        }; 
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.confirmDialog !== this.state.confirmDialog){
            this.setState({confirmDialog: nextProps.confirmDialog});
        }
    }

    componentWillUnmount(){
        if(this._storeObserver){
            UploaderModel.Store.getInstance().stopObserving("update", this._storeObserver);
            UploaderModel.Store.getInstance().stopObserving("auto_close");
        }
    }
    
    onDrop(files){
        let contextNode = Pydio.getInstance().getContextHolder().getContextNode();
        UploaderModel.Store.getInstance().handleDropEventResults(null, files, contextNode);
    }

    onFolderPicked(files){
        let contextNode = Pydio.getInstance().getContextHolder().getContextNode();
        UploaderModel.Store.getInstance().handleFolderPickerResult(files, contextNode);
    }

    start(e){
        e.preventDefault();
        UploaderModel.Store.getInstance().resume();
    }

    pause(e){
        UploaderModel.Store.getInstance().pause()
    }

    openClear(e){
        e.preventDefault();
        this.setState({
            showClear: true,
            clearAnchorEl: e.currentTarget
        });
    }

    toggleOptions(e) {
        if (e.preventDefault) e.preventDefault();

        const {showOptions = false, currentTarget} = this.state;

        this.setState({
            showOptions: !showOptions,
            optionsAnchorEl: e.currentTarget,
        });
    }

    openFilePicker(e){
        e.preventDefault();
        this.refs.dropzone.open();
    }

    openFolderPicker(e){
        e.preventDefault();
        this.refs.dropzone.openFolderPicker();
    }

    dialogSubmit(newValue, saveValue){
        const {configs} = this.state;
        UploaderModel.Store.getInstance().getSessions().forEach((session) => {
            if(session.getStatus() === 'confirm'){
                session.prepare(newValue);
            }
        });
        if(saveValue){
            configs.updateOption('upload_existing', newValue);
        }
        this.setState({confirmDialog: false});
        Pydio.getInstance().getController().fireAction('upload'); // Clear
    }

    dialogCancel(){
        const store = UploaderModel.Store.getInstance() ;
        store.getSessions().forEach((session) => {
            if(session.getStatus() === 'confirm'){
                store.removeSession(session);
            }
        });
        this.setState({confirmDialog: false});
        Pydio.getInstance().getController().fireAction('upload'); // Clear
    }

    supportsFolder(){
        let supports = false;
        let e = global.document.createElement('input');
        e.setAttribute('type', 'file');
        if('webkitdirectory' in e){
            supports = true;
        }
        e = null
        return supports;
    }

    render(){

        let messages = Pydio.getInstance().MessageHash;
        const {showDismiss, onDismiss} = this.props;
        const connectDropTarget = this.props.connectDropTarget || (c => {return c});
        const {configs, showOptions, optionsAnchorEl, showClear, clearAnchorEl, sessions, storeRunning, confirmDialog} = this.state;
        const store = UploaderModel.Store.getInstance();

        let listEmpty = true;
        sessions.forEach(s => {
            if(s.getChildren().length){
                listEmpty = false;
            }
        });

        return connectDropTarget(
            <div style={{position:'relative'}}>
                <div style={{position: 'relative', display:'flex', alignItems:'center', paddingLeft: 16, paddingRight: 16, paddingTop: 8, width: '100%'}}>
                    <h3 style={{marginBottom: 16, display:'none'}}>{messages['html_uploader.dialog.title']}</h3>
                    <FlatButton icon={<FontIcon style={{fontSize:16}} className="mdi mdi-play"/>} label={messages['html_uploader.start']} onClick={this.start.bind(this)} disabled={store.isRunning() || !store.hasQueue()}/>
                    <FlatButton icon={<FontIcon style={{fontSize:16}} className="mdi mdi-pause"/>} label={messages['html_uploader.pause']} onClick={this.pause.bind(this)} disabled={!store.isRunning()}/>
                    <FlatButton icon={<FontIcon style={{fontSize:16}} className="mdi mdi-delete"/>} label={<span>{messages['html_uploader.clear']}<span className={"mdi mdi-menu-down"}/></span>} onClick={this.openClear.bind(this)} disabled={listEmpty}/>

                    <span style={{flex: 1}}/>
                    <FlatButton primary={true} label={messages['html_uploader.options']} onClick={this.toggleOptions.bind(this)}/>
                    {showDismiss && <IconButton iconClassName={"mdi mdi-close"} style={{padding:14}} onClick={()=>onDismiss()}/>}
                </div>
                <FileDropZone
                    className="transparent-dropzone"
                    ref="dropzone"
                    multiple={true}
                    enableFolders={true}
                    supportClick={false}
                    ignoreNativeDrop={true}
                    onDrop={this.onDrop.bind(this)}
                    onFolderPicked={this.onFolderPicked.bind(this)}
                    style={{width:'100%', height: 420}}
                >
                    <TransfersList
                        sessions={sessions}
                        autoStart={configs.getOptionAsBool('DEFAULT_AUTO_START', 'upload_auto_send')}
                        onDismiss={this.props.onDismiss}
                        store={store}
                        onPickFile={(ev)=>{this.openFilePicker(ev)}}
                        onPickFolder={this.supportsFolder() ? (ev) => {this.openFolderPicker(ev)} : null}
                    />
                </FileDropZone>
                <UploadOptionsPane configs={configs} open={showOptions} anchorEl={optionsAnchorEl} onDismiss={(e) => {this.toggleOptions(e);}}/>
                <ClearOptionsPane configs={configs} open={showClear} anchorEl={clearAnchorEl} onDismiss={() => {this.setState({showClear: false, clearAnchorEl:null})}}/>
                {confirmDialog && <ConfirmExists onConfirm={this.dialogSubmit.bind(this)} onCancel={this.dialogCancel.bind(this)}/>}
            </div>
        );
    }
}

DropUploader = dropProvider(DropUploader);

export {DropUploader as default}