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
import TransfersList from './TransfersList'
import {Paper, Toolbar, RaisedButton, FlatButton, IconButton, FontIcon} from 'material-ui'

class DropUploader extends React.Component {
    
    constructor(props){
        super(props);
        const store = UploaderModel.Store.getInstance();
        this._storeObserver = ()=>{
            this.setState({
                items: store.getItems(),
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
            items: store.getItems(),
            storeRunning: store.isRunning()
        }; 
    }


    componentWillReceiveProps(nextProps) {
        /*
        const autoStart = this.state.configs.getOptionAsBool('DEFAULT_AUTO_START', 'upload_auto_send');
        const store = UploaderModel.Store.getInstance();
        const items = store.getItems();
        if (autoStart && store) {
            UploaderModel.Store.getInstance().processNext();
        }
        */

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

    clear(e){
        e.preventDefault();
        UploaderModel.Store.getInstance().clearAll();
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

    render(){

        let messages = Pydio.getInstance().MessageHash;
        const connectDropTarget = this.props.connectDropTarget || (c => {return c});
        const {configs, showOptions, items, storeRunning} = this.state;
        const store = UploaderModel.Store.getInstance();
        let listEmpty = true;
        items.sessions.forEach(s => {
            if(s.getChildren().length){
                listEmpty = false;
            }
        });
        let folderButton, startButton;
        let e = global.document.createElement('input');
        e.setAttribute('type', 'file');
        if('webkitdirectory' in e){
            folderButton = <FlatButton icon={<FontIcon style={{fontSize:16}} className="mdi mdi-folder-plus"/>} primary={true} style={{marginRight: 10}} label={messages['html_uploader.5']} onTouchTap={this.openFolderPicker.bind(this)}/>;
        }
        e = null;

        if (storeRunning) {
            startButton = <FlatButton icon={<FontIcon style={{fontSize:16}} className="mdi mdi-pause"/>} label={"Pause"} onTouchTap={this.pause.bind(this)} secondary={true}/>
        } else if(store.hasQueue()){
            startButton = <FlatButton icon={<FontIcon style={{fontSize:16}} className="mdi mdi-play"/>} label={messages['html_uploader.11']} onTouchTap={this.start.bind(this)} secondary={true}/>
        }
        return connectDropTarget(
            <div style={{position:'relative', backgroundColor: '#FAFAFA'}}>
                <Paper zDepth={1} style={{position: 'relative', display:'flex', alignItems:'center', paddingLeft: 6, width: '100%', height: '100%'}}>
                    <FlatButton icon={<FontIcon style={{fontSize:16}} className="mdi mdi-file-plus"/>} primary={true} style={{marginRight: 6}} label={messages['html_uploader.4']} onTouchTap={this.openFilePicker.bind(this)}/>
                    {folderButton}
                    {startButton}
                    <span style={{flex: 1}}/>
                    {!listEmpty && <FlatButton label={messages['html_uploader.12']} style={{marginRight: 0}} primary={true} onTouchTap={this.clear.bind(this)}/>}
                    <IconButton iconClassName={"mdi mdi-dots-vertical"} iconStyle={{color:'#9e9e9e', fontSize: 18}} style={{padding:14}} tooltip={messages['html_uploader.22']} onTouchTap={this.toggleOptions.bind(this)}/>
                </Paper>
                <FileDropZone
                    className="transparent-dropzone"
                    ref="dropzone"
                    multiple={true}
                    enableFolders={true}
                    supportClick={false}
                    ignoreNativeDrop={true}
                    onDrop={this.onDrop.bind(this)}
                    onFolderPicked={this.onFolderPicked.bind(this)}
                    style={{width:'100%', height: 360}}
                >
                    <TransfersList
                        items={items}
                        autoStart={configs.getOptionAsBool('DEFAULT_AUTO_START', 'upload_auto_send')}
                        onDismiss={this.props.onDismiss}
                    />
                </FileDropZone>
                <UploadOptionsPane configs={configs} open={showOptions} anchorEl={this.state.optionsAnchorEl} onDismiss={(e) => {this.toggleOptions(e);}}/>
            </div>
        );
    }
}

DropUploader = dropProvider(DropUploader);

export {DropUploader as default}