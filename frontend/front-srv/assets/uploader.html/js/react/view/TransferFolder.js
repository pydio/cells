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
import PathUtils from 'pydio/util/path'
import TransferFile from './TransferFile'
import {LinearProgress} from 'material-ui'

class TransferFolder extends React.Component{

    constructor(props){
        super(props);
        this.state = {open: false};
    }

    recursivePg(children, accu = []){
        if(!children.length) {
            return;
        }
        children.forEach((entry) => {
            if(entry.item instanceof UploaderModel.FolderItem){
                this.recursivePg(entry.children, accu);
            } else {
                accu.push(entry.item.getProgress());
            }
        });
    }

    render(){
        const {item, children, className, style, showAll, limit} = this.props;
        const {open} = this.state;

        let statusMessage, childComps = [], folderProgress;

        if(children && children.length){
            if(open || !item){
                const sliced = showAll ? children : children.slice(0, limit);
                sliced.forEach(entry => {
                    if(entry.item instanceof UploaderModel.FolderItem){
                        childComps.push(<TransferFolder key={entry.item.getId()} item={entry.item} children={entry.children} showAll={showAll} limit={limit}/>);
                    } else {
                        childComps.push(<TransferFile key={entry.item.getId()} item={entry.item}/>);
                    }
                })
            } else if(!open) {
                // Compute recursive progress !
                const accu = [];
                this.recursivePg(children, accu);
                if(accu.length){
                    const sum = accu.reduce(function(a, b) { return a + b; });
                    const avg = sum / accu.length;
                    folderProgress = <div style={{width: 60}}><LinearProgress style={{backgroundColor:'#eeeeee'}} mode={"determinate"} min={0} max={100} value={avg}/></div>;
                }
            }
        }
        if(!item){ // Root Folder
            return <div style={style}>{childComps}</div>
        }

        if(item.getStatus() === 'loaded'){
            statusMessage = Pydio.getInstance().MessageHash['html_uploader.13'];
        }
        return (
            <div style={{paddingLeft: 20, ...style, fontSize:14, color:'#424242'}} className={"upload-" + item.getStatus() + " " + (className?className:"")}>
                <div style={{display:'flex', alignItems: 'center', paddingTop:3, paddingBottom:3}} onClick={()=>{this.setState({open:!open})}}>
                    <span className={"mdi mdi-folder"} style={{display: 'inline-block', width: 26, textAlign: 'center'}}/>
                    <span>{PathUtils.getBasename(item.getPath())}</span>
                    <span className={"mdi mdi-chevron-" + (open?"down":"right")}/>
                    <span className="status">{statusMessage}</span>
                    <span style={{flex: 1}}/>
                    {folderProgress}
                </div>
                {childComps}
            </div>
        );
    }
}

export {TransferFolder as default}

