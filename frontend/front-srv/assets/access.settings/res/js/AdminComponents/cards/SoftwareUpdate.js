/*
 * Copyright 2007-2022 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio Cells.
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

import React, {Component} from 'react'
import Pydio from 'pydio'
import PydioApi from 'pydio/http/api'
const {asGridItem} = Pydio.requireLib('components');
const {PydioContextConsumer, moment} = Pydio.requireLib('boot');
import {UpdateServiceApi, UpdateUpdateRequest} from 'cells-sdk'
import AdminStyles from "../styles/AdminStyles";
import {Paper} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'

class SoftwareUpdate extends Component {

    constructor(props) {
        super(props);
        const {pydio} = props;
        this.state = {
            loading: false,
            backend: pydio.Parameters.get("backend")
        }
        this.load()
    }

    load() {
        const {pydio} = this.props;
        // Load version
        PydioApi.getRestClient().getOrUpdateJwt().then(jwt => {
            const url = pydio.Parameters.get('ENDPOINT_REST_API') + '/frontend/bootconf';
            const headers = {Authorization: 'Bearer ' + jwt};
            window.fetch(url, {
                method:'GET',
                credentials:'same-origin',
                headers
            }).then((response) => {
                response.json().then((data) => {
                    if(data.backend){
                        this.setState({backend:data.backend})
                    }
                }).catch(()=>{});
            }).catch(()=>{});
        });

        this.setState({loading: true})
        const api = new UpdateServiceApi(PydioApi.getRestClient());
        api.updateRequired(new UpdateUpdateRequest()).then(res => {
            let hasBinary = 0;
            if (res.AvailableBinaries) {
                //hasBinary = res.AvailableBinaries.length;
                this.setState({packages: res.AvailableBinaries, channel: res.Channel});
            } else {
                this.setState({no_upgrade: true});
            }
            //rootNode.getMetadata().set('flag', hasBinary);
            //AdminComponents.MenuItemListener.getInstance().notify("item_changed");
            this.setState({loading: false});
        }).catch(() => {
            this.setState({loading: false});
        });

    }

    render() {
        const {muiTheme, pydio} = this.props;
        const adminStyles = AdminStyles(muiTheme.palette)
        const subHeaderStyle = adminStyles.body.block.headerFull;
        const style  = {...this.props.style}
        const {backend, no_upgrade, packages=[], channel} = this.state
        const message = (id) => {return pydio.MessageHash['admin_dashboard.' + id]};
        return(
            <Paper
                {...this.props}
                {...adminStyles.body.block.props}
                style={{...adminStyles.body.block.container, margin:0,...style}}
                transitionEnabled={false}
            >
                <div style={subHeaderStyle}>{message('card.update.current')}</div>
                <div style={{padding:20, display:'flex', alignItems:'center'}}>
                    <span style={{flex: 1, fontSize: 15,}}>
                        <span className={'mdi mdi-archive'} style={{color:subHeaderStyle.color}}/> {backend.PackageLabel} {backend.Version}{backend.BuildStamp?' - ' + moment(backend.BuildStamp).format('LL'):''}
                    </span>
                    <span style={{flex: 1, textAlign:'right'}}>
                    {no_upgrade &&
                        <span style={{cursor:'pointer', fontWeight: 500, color:'#bdbdbd', fontStyle:'italic'}} onClick={() => pydio.goTo('/admin/update')}>{message('card.update.no-updates')}</span>
                    }
                    {packages.length > 0 &&
                        <span style={{fontSize: 15,cursor:'pointer', color:muiTheme.palette.accent1Color}} onClick={() => pydio.goTo('/admin/update')}>
                            <span className={'mdi mdi-alert'}/> {message('card.update.new-version')}: {packages[0].Version}
                        </span>
                    }
                    </span>
                </div>
            </Paper>
        )
    }
}


SoftwareUpdate = PydioContextConsumer(SoftwareUpdate);
SoftwareUpdate = muiThemeable()(SoftwareUpdate);
SoftwareUpdate = asGridItem(
    SoftwareUpdate,
    Pydio.getMessages()['advanced_settings.home.32'],
    {gridWidth:8,gridHeight:8},
    []
);

SoftwareUpdate.displayName = 'SoftwareUpdate';
export default SoftwareUpdate