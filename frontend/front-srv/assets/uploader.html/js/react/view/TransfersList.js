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

class TransfersList extends React.Component{

    constructor(props){
        super(props);
    }

    render(){
        let components = [];
        const {items} = this.props;
        let isEmpty = true;
        if(items){
            const ext = Pydio.getInstance().Registry.getFilesExtensions();
            components = items.sessions.map(session => {
                if(session.getChildren().length) {
                    isEmpty = false;
                }
                return <Transfer item={session} style={{}} limit={10} level={0} extensions={ext}/>
            });
        }
        if(isEmpty){
            return (
                <div style={{display:'flex', alignItems:'center', height: '100%', width: '100%'}}>
                    <div style={{textAlign: 'center',width: '100%',fontWeight: 500, textTransform: 'uppercase', color: 'rgba(0,0,0,0.1)', fontSize: 24}}>
                        {Pydio.getMessages()["html_uploader.drophere"]}
                    </div>
                </div>
            );
        }

        const container = {
            height: '100%',
            overflowY: 'auto',
            borderBottom: '1px solid #eeeeee'
        };

        return (
            <div style={container}>
                {components}
            </div>
        )
    }
}

export {TransfersList as default}