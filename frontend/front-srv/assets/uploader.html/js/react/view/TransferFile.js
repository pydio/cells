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

class TransferFile extends React.Component {
    
    constructor(props){
        super(props);
        this.state = {
            progress: this.props.item.getProgress(),
            status: this.props.item.getStatus()
        };
    }

    componentDidMount(){
        this.props.item.observe('progress', function(value){
            this.setState({progress: value});
        }.bind(this));
        this.props.item.observe('status', function(value){
            this.setState({status: value});
        }.bind(this));
    }

    abortTransfer(){
        UploaderModel.Store.getInstance().stopOrRemoveItem(this.props.item);
    }

    render(){
        const {item, progress, className} = this.props;
        const pydio = Pydio.getInstance();
        let style, relativeMessage;
        const messageIds = {
            "new" : 433,
            "loading":434,
            "loaded":435,
            "error":436
        };
        let statusMessage = item.getStatus();
        let stopButton;
        if(statusMessage === 'loading') {
            stopButton = <span className="stop-button icon-stop" onClick={this.abortTransfer}/>;
        } else if (statusMessage === 'error'){
            stopButton = <span style={{fontWeight:500, marginBottom:0, color:'#e53935'}} className="stop-button" onClick={() => {item.process()}}>RETRY <span className="mdi mdi-restart"/></span>;
        }else{
            stopButton = <span className="stop-button mdi mdi-close" onClick={this.abortTransfer}/>;
        }
        if(statusMessage === 'error' && item.getErrorMessage()){
            statusMessage = item.getErrorMessage();
        }
        if(pydio.MessageHash[messageIds[statusMessage]]){
            statusMessage = pydio.MessageHash[messageIds[statusMessage]];
        }
        if(item.getRelativePath()){
            relativeMessage = <span className="path">{item.getRelativePath()}</span>;
        }
        if(progress){
            style = {width: progress + '%'};
        }
        return (
            <div className={"file-row upload-" + item.getStatus() + " " + (className?className:"")}>
                <span className="mdi mdi-file"/> {item.getFile().name}
                {relativeMessage}
                <span className="status">{statusMessage}</span>
                {stopButton}
                <div className="uploader-pgbar" style={style}/>
            </div>
        );
    }
}

export {TransferFile as default}