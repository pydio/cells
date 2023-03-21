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
import Transfer from './Transfer'
import {muiThemeable} from 'material-ui/styles';
import DOMUtils from 'pydio/util/dom';

class TransfersList extends React.Component{

    constructor(props){
        super(props);
    }

    render(){

        const {sessions, store, muiTheme, onPickFile, onPickFolder} = this.props;
        const transition = DOMUtils.getBeziersTransition().replace('all ', 'color ');
        const messages = Pydio.getMessages();
        const css = `
            .drop-transfer-list{
                color:rgba(3, 169, 244, 0.5);
            }
            .transparent-dropzone.active .drop-transfer-list{
                color:rgba(3, 169, 244, 0.8);
            }
            .drop-transfer-list a,.drop-transfer-list a:hover {
                color:rgba(3, 169, 244, 1);
                cursor: pointer;
            }
        `;

        let sessionsList;
        if(sessions){
            let isEmpty = true;
            const ext = Pydio.getInstance().Registry.getFilesExtensions();
            const components = sessions.map(session => {
                if(session.getChildren().length) {
                    isEmpty = false;
                }
                return <Transfer item={session} store={store} style={{}} limit={10} level={0} extensions={ext} muiTheme={muiTheme}/>
            });
            if(!isEmpty){
                sessionsList = (
                    <div style={{height: '100%',overflowY: 'auto', padding: 10, paddingBottom: 20}}>
                        {components}
                    </div>
                );
            }
        }

        const dropper = (
            <div style={{display:'flex', alignItems:'center', height: '100%', width: '100%', transition}} className={"drop-transfer-list"}>
                <div style={{textAlign: 'center',width: '100%',fontWeight: 500, fontSize: 18, padding: 24, lineHeight:'28px'}}>
                    <div className="mdi mdi-cloud-upload" style={{fontSize: 110}}/>
                    <div>
                        {messages["html_uploader.drophere"]} {messages["html_uploader.drop-or"]} <a onClick={onPickFile}>{messages["html_uploader.drop-pick-file"]}</a>
                        {onPickFolder && <span> {messages["html_uploader.drop-or"]} <a onClick={onPickFolder}>{messages["html_uploader.drop-pick-folder"]}</a></span>}
                    </div>
                </div>
                <style type={"text/css"} dangerouslySetInnerHTML={{__html:css}}/>
            </div>
        );

        return (
            <div style={{display:'flex', height:'calc(100% - 10px)', margin:10, overflow:'hidden', borderRadius:muiTheme.borderRadius, backgroundColor:muiTheme.palette.mui3['surface']}}>
                <div style={{display:'flex', alignItems:'center', justifyContent: 'center', width: '100%'}}>{dropper}</div>
                {sessionsList && <div style={{width: 420, minWidth:420, maxWidth: 420}}>{sessionsList}</div>}
            </div>
        );

    }
}

TransfersList = muiThemeable()(TransfersList);
export {TransfersList as default}