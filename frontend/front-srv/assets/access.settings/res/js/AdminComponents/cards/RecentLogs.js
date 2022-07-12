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

import {Component} from 'react'
import Pydio from 'pydio'
import PydioApi from 'pydio/http/api'
import {Paper, FlatButton, Toggle} from 'material-ui'
import AdminStyles from "../styles/AdminStyles";
import {LogServiceApi, LogListLogRequest, ListLogRequestLogFormat} from 'cells-sdk';
import ReloadWrapper from './ReloadWrapper'

const {asGridItem, MaterialTable} = Pydio.requireLib('components');
const {PydioContextConsumer} = Pydio.requireLib('boot');

class RecentLogs extends Component{

    constructor(props, context){
        super(props, context);
        this.state = {filter:'', logs: []}
    }

    loadLogs(){
        const {filter} = this.state;
        const api = new LogServiceApi(PydioApi.getRestClient());
        let request = new LogListLogRequest();
        request.Query = filter === 'error' ? '+Level:ERROR': '';
        request.Page = 0;
        request.Size = 30;
        request.Format = ListLogRequestLogFormat.constructFromObject('JSON');
        api.syslog(request).then(result => {
            if(result.Logs){
                this.setState({logs: result.Logs});
            }
        })
    }

    componentDidMount(){
        this.loadLogs();
    }

    changeFilter(value){
        this.setState({filter:value},
            ()=>this.triggerReload()
        );
    }

    triggerReload(){
        this.loadLogs();
    }

    render(){

        const {logs, filter} = this.state;
        const {pydio} = this.props;

        const style = {
            ...this.props.style,
            display:'flex',
            flexDirection:'column'
        };
        const adminStyles = AdminStyles();

        const columns = [
            {name:'Ts', label:'Time', useMoment:true, style:{width:120, paddingRight: 0, color:'rgba(0,0,0,.54)'}},
            {name:'Level', label:'Level', style:{width:60, paddingRight: 0, color:'rgba(0,0,0,.54)'}},
            {name:'Logger', label:'Service', style:{width:120, paddingRight: 0, color:'rgba(0,0,0,.54)'}},
            {name:'Msg', label:'Message'},
        ];

        let allButton;
        allButton = (
            <div>
                <FlatButton label={<span><span className={"mdi mdi-pulse"}/> {pydio.MessageHash['admin_dashboard.recentLogs.more']}</span>} onClick={()=>{pydio.goTo('/admin/logs')}} primary={true}/>
            </div>
        );

        return (
            <Paper
                {...this.props}
                {...adminStyles.body.block.props}
                style={{...adminStyles.body.block.container, margin:0,...style}}
                transitionEnabled={false}
            >
                <div style={{display:'flex', alignItems:'center', ...adminStyles.body.block.headerFull}}>
                    <div style={{flex: 1}}>{pydio.MessageHash['admin_dashboard.recentLogs.title']}</div>
                    <div style={{paddingRight: 16, borderRight: allButton ? '2px solid rgba(0,0,0,.1)': 'none'}}>
                        <Toggle
                            toggled={filter==='error'}
                            onToggle={(e,v)=>{this.changeFilter(v?'error':'')}}
                            label={pydio.MessageHash['admin_dashboard.recentLogs.errors']}
                            thumbStyle={{backgroundColor:adminStyles.body.block.headerFull.color}}
                            labelStyle={{whiteSpace:'nowrap', color:'#9e9e9e'}}
                            labelPosition={"right"}
                        />
                    </div>
                    {allButton}
                </div>
                <div style={{flex: 1, overflowY: 'auto'}}>
                    <MaterialTable
                        hideHeaders={true}
                        columns={columns}
                        data={logs}
                        showCheckboxes={false}
                        emptyStateString={pydio.MessageHash['admin_dashboard.recentLogs.emptyState']}
                        computeRowStyle={(row)=> row.Level === 'error' ? {color:'#E53935'} : {}}
                    />
                </div>
            </Paper>
        );

    }

}

const globalMessages = Pydio.getMessages();

RecentLogs = PydioContextConsumer(ReloadWrapper(RecentLogs));
RecentLogs = asGridItem(
    RecentLogs,
    globalMessages['admin_dashboard.recentLogs.title'],
    {gridWidth:8,gridHeight:30},
    []
);

RecentLogs.displayName = 'RecentLogs';
export {RecentLogs as default}