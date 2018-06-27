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

import React from 'react'
import {FlatButton} from 'material-ui'
import ActionDialogMixin from '../modal/ActionDialogMixin'
import Loader from '../Loader'

const CompatMigrationDialog = React.createClass({

    mixins:[
        ActionDialogMixin
    ],

    getInitialState: function(){
        return {loading: false};
    },

    getDefaultProps: function(){
        return {
            dialogTitle: 'Migration Required',
            dialogIsModal: true,
            dialogScrollBody: true
        };
    },

    performUpgrade: function(){

        this.setState({loading: true});
        PydioApi.getClient().request({
            get_action:'packages_upgrade_script'
        }, (transport) => {
            if(transport.responseJSON){
                this.setState({response: transport.responseJSON, loading:false});
                if(transport.responseJSON.success){
                    this._buttonUpdater([<FlatButton primary={true} label="Reload Page" onTouchTap={()=>{document.location.reload()}}/>]);
                }else{
                    this._buttonUpdater(null);
                }
            }else{
                this.setState({response: {error: 'Empty Response'}, loading:false});
                this._buttonUpdater(null);
            }
        });

    },

    getButtons: function(updater=null){
        if(updater !== null){
            this._buttonUpdater = updater;
        }
        return [<FlatButton primary={true} label="Upgrade Now" onTouchTap={this.performUpgrade.bind(this)}/>];
    },

    render: function(){

        const {response, loading} =  this.state;

        return (
            <div style={{fontSize: 13, width: '100%'}}>

                {!loading && !response &&
                    <div>
                        <p>Oops, it seems that your database version does not fit the current expected version, or that your are using a theme that is now deprecated!
                            Don't worry, a couple of additional steps are required to upgrade your installation.</p>
                        <p>Pydio will try to apply all necessary changes to have you up and running quickly.</p>
                    </div>
                }
                {loading &&
                    <Loader style={{minHeight:100}}/>
                }
                {response && response.success &&
                    <div>
                        <div style={{fontSize: 14, fontWeight:500, padding: '16px 0'}}>Successfully applied upgrade</div>
                        {response.result.map((r)=>{return <div style={{padding:'4px 0', borderBottom:'1px rgba(0,0,0,0.1) solid',whiteSpace:'nowrap',textOverflow:'ellipsis',overflow:'hidden'}}>{r}</div>})}
                        <div style={{padding:'16px 0'}}>You can now reload the page</div>
                    </div>
                }
                {response && response.error &&
                    <div>
                        <div style={{padding:'16px 0'}}>{response.error}: <br/><em>{response.exception}</em></div>
                        {response.db_mismatch &&
                            <div style={{padding:'16px 0'}}>Expected version of the database is {response.db_mismatch.target}, but current is set to {response.db_mismatch.current}.
                            If you are confident that your installation is already up-to-date, simply manually upgrade the database version by running the following query:
                                <br/><code>UPDATE version SET db_build={response.db_mismatch.target};</code>
                            </div>
                        }
                    </div>
                }
            </div>
        );

    }

});

export {CompatMigrationDialog as default}