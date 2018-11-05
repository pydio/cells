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
import {LinearProgress} from 'material-ui'

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
        const {item, className} = this.props;
        const {progress} = this.state;
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
            stopButton = <span className="mdi mdi-stop" onClick={this.abortTransfer}/>;
        } else if (statusMessage === 'error'){
            stopButton = <span style={{fontWeight:500, marginBottom:0, color:'#e53935'}} onClick={() => {item.process()}}>RETRY <span className="mdi mdi-restart"/></span>;
        }else{
            stopButton = <span className="mdi mdi-close" onClick={this.abortTransfer.bind(this)}/>;
        }
        if(statusMessage === 'error' && item.getErrorMessage()){
            statusMessage = item.getErrorMessage();
        }
        if(pydio.MessageHash[messageIds[statusMessage]]){
            //statusMessage = pydio.MessageHash[messageIds[statusMessage]];
        }
        return (
            <div style={{paddingTop: 3, paddingBottom: 3, paddingLeft: 20, display:'flex', alignItems:'center'}} className={"upload-" + item.getStatus() + " " + (className?className:"")}>
                <span className="mdi mdi-file" style={{display: 'inline-block', width: 26, textAlign: 'center'}}/>{item.getFile().name}
                <span className="status">{statusMessage}</span>
                <span style={{flex: 1}}/>
                <div style={{width: 60, position:'relative'}}>
                    <LinearProgress style={{backgroundColor:'#eeeeee'}} min={0} max={100} value={progress} mode={"determinate"}/>
                </div>
                {stopButton}
            </div>
        );
    }
}

export {TransferFile as default}