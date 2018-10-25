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
import {Toolbar, RaisedButton, FlatButton} from 'material-ui'

class DropUploader extends React.Component {
    
    constructor(props){
        super(props);
        this.state = {
            showOptions: false,
            configs: UploaderModel.Configs.getInstance()
        }; 
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
        UploaderModel.Store.getInstance().processNext();
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

        let optionsEl;
        let messages = Pydio.getInstance().MessageHash;
        const connectDropTarget = this.props.connectDropTarget || (c => {return c});
        const {configs, showOptions} = this.state;


        optionsEl = <UploadOptionsPane configs={configs} open={showOptions} anchorEl={this.state.optionsAnchorEl} onDismiss={(e) => {this.toggleOptions(e);}}/>

        let folderButton, startButton;
        let e = global.document.createElement('input');
        e.setAttribute('type', 'file');
        if('webkitdirectory' in e){
            folderButton = <RaisedButton style={{marginRight: 10}} label={messages['html_uploader.5']} onTouchTap={this.openFolderPicker.bind(this)}/>;
        }
        e = null;

        if(!configs.getOptionAsBool('DEFAULT_AUTO_START', 'upload_auto_send', true)){
            startButton = <FlatButton style={{marginRight: 10}} label={messages['html_uploader.11']} onTouchTap={this.start.bind(this)} secondary={true}/>
        }
        return connectDropTarget(
            <div style={{position:'relative', padding: '10px'}}>
                <Toolbar style={{backgroundColor: '#fff'}}>
                    <div style={{display:'flex', justifyContent: 'space-between', padding: '0px 24px', width: '100%', height: '100%'}}>
                        <div style={{display:'flex', alignItems: 'center', marginLeft: '-48px'}}>
                            <RaisedButton secondary={true} style={{marginRight: 10}} label={messages['html_uploader.4']} onTouchTap={this.openFilePicker.bind(this)}/>
                            {folderButton}
                            {startButton}
                            <FlatButton label={messages['html_uploader.12']} style={{marginRight: 10}} onTouchTap={this.clear.bind(this)}/>
                        </div>
                        <div style={{display:'flex', alignItems: 'center', marginRight: '-48px'}}>
                            <FlatButton style={{float: 'right'}} label={messages['html_uploader.22']} onTouchTap={this.toggleOptions.bind(this)}/>
                        </div>
                    </div>
                </Toolbar>
                <FileDropZone
                    className="transparent-dropzone"
                    ref="dropzone"
                    multiple={true}
                    enableFolders={true}
                    supportClick={false}
                    ignoreNativeDrop={true}
                    onDrop={this.onDrop.bind(this)}
                    onFolderPicked={this.onFolderPicked.bind(this)}
                    style={{width:'100%', height: 300}}
                >
                    <TransfersList
                        autoStart={configs.getOptionAsBool('DEFAULT_AUTO_START', 'upload_auto_send')}
                        onDismiss={this.props.onDismiss}
                    />
                </FileDropZone>

                {optionsEl}
            </div>
        );
    }
}

DropUploader = dropProvider(DropUploader);

export {DropUploader as default}