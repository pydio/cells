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

import React from 'react'
import Pydio from 'pydio'
import AdminStyles from '../styles/AdminStyles';
import Header from '../styles/Header'
import {muiThemeable} from 'material-ui/styles'
import {IconButton} from 'material-ui'
const {DynamicGrid} = Pydio.requireLib('components');
const {PydioContextConsumer} = Pydio.requireLib('boot');

class GridDashboard extends React.Component{

    getDefaultCards(){
        return [
            {
                id:'quick.links',
                componentClass:'AdminComponents.QuickLinks',
                props:{},
                defaultPosition:{
                    x:0, y:0
                }
            },
            {
                id:'software.update',
                componentClass:'AdminComponents.SoftwareUpdate',
                defaultPosition:{
                    x:0, y:1
                }
            },
            {
                id:'graph.files',
                componentClass:'AdminComponents.FakeGraph',
                defaultPosition:{
                    x:0, y:2
                },
                props:{
                    type:'files'
                }
            },
            {
                id:'graph.connections',
                componentClass:'AdminComponents.FakeGraph',
                defaultPosition:{
                    x:4, y:2
                },
                props:{
                    type:'connections'
                }
            },
            {
                id:'recent.logs',
                componentClass:'AdminComponents.RecentLogs',
                props:{
                    interval:60
                },
                defaultPosition:{
                    x:0, y:3
                }
            }
        ];
    }

    render(){

        const {pydio} = this.props;
        const message = (id) => {return pydio.MessageHash['admin_dashboard.' + id]};
        const adminStyles= AdminStyles(this.props.muiTheme.palette);

        const websiteButton = (
            <IconButton
                iconClassName={"icomoon-cells"}
                onClick={()=>{window.open('https://pydio.com')}}
                tooltip={pydio.MessageHash['settings.topbar.button.about']}
                tooltipPosition={"bottom-left"}
                {...adminStyles.props.header.iconButton}
            />
        );

        return (
            <div style={{height:'100%', display:'flex', flexDirection:'column', overflowY:'hidden'}}>
                <Header
                    title={message('welc.title')}
                    icon="mdi mdi-view-dashboard"
                    actions={[websiteButton]}
                />
                <DynamicGrid
                    storeNamespace="AdminComponents.Grid"
                    builderNamespaces={['AdminComponents']}
                    defaultCards={this.getDefaultCards()}
                    pydio={pydio}
                    style={{flex: 1}}
                    rglStyle={{position:'absolute', top: 6, left: 6, right: 6, bottom: 6}}
                    disableEdit={true}
                />
            </div>
        )

    }

}

GridDashboard = PydioContextConsumer(GridDashboard);
GridDashboard = muiThemeable()(GridDashboard)
export {GridDashboard as default}