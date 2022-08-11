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
import Pydio from 'pydio'
import React from 'react'
import createReactClass from 'create-react-class'
const PydioReactUi = Pydio.requireLib('boot');
import Revisions from './Revisions'

class HistoryBrowser extends React.Component{

    render(){
        return (
            <div style={{display:'flex', flexDirection:'column', color:'rgba(0,0,0,.87)'}} className={"version-history"}>
                <Revisions node={this.props.node}/>
            </div>
        );
    }

}

const HistoryDialog = createReactClass({

    mixins:[
        PydioReactUi.ActionDialogMixin,
        PydioReactUi.SubmitButtonProviderMixin
    ],

    getDefaultProps: function(){
        return {
            dialogTitle: Pydio.getMessages()['meta.versions.2'],
            dialogIsModal: false,
            dialogSize:'lg',
            dialogPadding: false
        };
    },
    submit(){
        this.dismiss();
    },
    render: function(){
        return (
            <div style={{width: '100%'}} className="layout-fill vertical-layout">
                <HistoryBrowser node={this.props.node} onRequestClose={this.dismiss}/>
            </div>
        );
    }

});


export {HistoryDialog as default}