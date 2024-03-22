/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React, {Fragment} from 'react';
import PropTypes from 'prop-types';

import {FlatButton, Paper} from 'material-ui'
import DataSourceEditor from '../editor/DataSourceEditor'
import VersionPolicyEditor from '../editor/VersionPolicyEditor'
import PydioDataModel from 'pydio/model/data-model'
import Node from 'pydio/model/node'
import LangUtils from 'pydio/util/lang'
import Pydio from 'pydio'
import PydioApi from 'pydio/http/api'
import ResourcesManager from 'pydio/http/resources-manager'
const {MaterialTable} = Pydio.requireLib('components');
import DataSource from '../model/DataSource'
import Workspace from '../model/Ws'
import {TreeVersioningPolicy,TreeVersioningKeepPeriod, ConfigServiceApi} from 'cells-sdk'
import {v4 as uuid} from 'uuid'
import VersionPolicyPeriods from '../editor/VersionPolicyPeriods'
import EncryptionKeys from './EncryptionKeys'
import {muiThemeable} from 'material-ui/styles'
const {JobsStore, moment} = Pydio.requireLib("boot");
import CreateDSDialog from "../editor/CreateDSDialog";

class DataSourcesBoard extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            dataSources: [],
            resyncJobs:{},
            versioningPolicies: [],
            dsLoaded: false,
            versionsLoaded: false,
            showExportKey: false,
            exportedKey : null,
            showImportKey: false,
            importResult: null,
            keyOperationError: null,
            startedServices: [],
            peerAddresses:[],
            m: (id) => props.pydio.MessageHash["ajxp_admin.ds." + id] || id,
        };
    }

    componentDidMount(){
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        const {pydio} = this.props;
        this.statusPoller = setInterval(()=>{
            if(!pydio.WebSocketClient.getStatus()){
                return
            }
            DataSource.loadStatuses().then(data => {
                this.setState({startedServices: data.Services || []});
            });
            api.listPeersAddresses().then(res => {
                this.setState({peerAddresses: res.PeerAddresses || []});
            })
        }, 2500);
        setTimeout(() => {
            this.syncPoller = setInterval(() => {
                if(!pydio.WebSocketClient.getStatus()){
                    return
                }
                this.syncStatuses();
            }, 2500);
        }, 1250)
        this.load();
    }

    componentWillUnmount(){
        clearInterval(this.statusPoller);
        clearInterval(this.syncPoller);
    }

    load(newDsName = null){
        this.setState({
            dsLoaded: false,
            versionsLoaded: false,
            newDsName:newDsName
        });
        DataSource.loadDatasources().then((data) => {
            this.setState({dataSources: data.DataSources || [], dsLoaded: true}, () => {this.syncStatuses()});
        });
        DataSource.loadVersioningPolicies().then((data) => {
            this.setState({versioningPolicies: data.Policies || [], versionsLoaded: true});
        });
        DataSource.loadStatuses().then(data => {
            this.setState({startedServices: data.Services});
        });
        if(this.refs && this.refs.encKeys){
            this.refs.encKeys.load();
        }
    }

    syncStatuses(){
        const {dataSources = []} = this.state;
        if(!dataSources.length){
            return;
        }
        JobsStore.getInstance().getAdminJobs(null, null, dataSources.map(d => 'resync-ds-' + d.Name), 1).then(response => {
            const resyncJobs = {};
            const jobs = response.Jobs || []
            jobs.forEach(job => {
                if(job.Tasks && job.Tasks.length){
                    resyncJobs[job.ID.replace('resync-ds-', '')] = job;
                }
            })
            this.setState({resyncJobs});
        })
    }

    closeEditor(){
        this.props.closeRightPane();
    }

    openDataSource(dataSources){
        if(!dataSources.length){
            return;
        }
        const dataSource = dataSources[0];
        const {openRightPane, accessByName, pydio, storageTypes} = this.props;
        openRightPane({
            COMPONENT:DataSourceEditor,
            PROPS:{
                ref:"editor",
                pydio:pydio,
                dataSource:dataSource,
                storageTypes:storageTypes,
                readonly:!accessByName('CreateDatasource'),
                closeEditor:this.closeEditor.bind(this),
                reloadList:this.load.bind(this),
            }
        });
    }

    makeStatusLabel(level, message){
        switch (level){
            case 'error':
                return <span style={{color:'#e53935'}}><span className={"mdi mdi-alert"}/> {message}</span>
            case 'running':
                return <span style={{color:'#ef6c00'}}><span className={"mdi mdi-timer-sand"}/> {message}</span>
            default:
                return <span style={{color: '#1b5e20'}}><span className={"mdi mdi-check"}/> {message}</span>
        }
    }

    computeStatus(dataSource, asNumber = false) {
        if(asNumber && dataSource.Disabled){
            return -1;
        }
        const {startedServices = [], peerAddresses = [], m, newDsName} = this.state;
        if(!startedServices.length){
            return m('status.na');
        }
        let index, sync, object;
        startedServices.map(service => {
            if (service.Name === 'pydio.grpc.data.sync.' + dataSource.Name && service.Status === 'STARTED'){
                sync = true;
            } else if (service.Name === 'pydio.grpc.data.index.' + dataSource.Name && service.Status === 'STARTED'){
                index = true;
            } else if (service.Name === 'pydio.grpc.data.objects.' + dataSource.ObjectsServiceName && service.Status === 'STARTED'){
                object = true;
            }
        });
        if(index && sync && object) {
            if (newDsName && dataSource.Name === newDsName) {
                setTimeout(() => {this.setState({newDsName: null})}, 100);
            }
            if(asNumber){
                return 0
            }
            return this.makeStatusLabel('ok', m('status.ok'));
        } else if (newDsName && dataSource.Name === newDsName) {
            if(asNumber){
                return 1
            }
            return this.makeStatusLabel('running', m('status.starting'));
        } else if (!index && !sync && !object) {
            let koMessage = m('status.ko');
            if(peerAddresses && peerAddresses.indexOf(dataSource.PeerAddress) === -1){
                koMessage = m('status.ko-peers').replace('%s', dataSource.PeerAddress);
            }
            if(asNumber){
                return 2
            }
            return this.makeStatusLabel('error', koMessage)
        } else {
            let services = [];
            if(!index) {
                services.push(m('status.index'));
            }
            if(!sync) {
                services.push(m('status.sync'));
            }
            if(!object) {
                services.push(m('status.object'));
            }
            if(asNumber){
                return 3
            }
            return this.makeStatusLabel('error', services.join(' - '));
        }
    }

    computeJobStatus(job){
        const task = job.Tasks[0];
        switch (task.Status) {
            case 'Finished':
                return this.makeStatusLabel('ok', moment(new Date(parseInt(task.EndTime) * 1000)).fromNow());
            case 'Running':
                return this.makeStatusLabel('running', task.StatusMessage || 'Running...');
            case 'Error':
                return this.makeStatusLabel('error', task.StatusMessage);
            case 'Queued':
                return this.makeStatusLabel('running', task.StatusMessage);
            default:
                break;
        }
        return this.makeStatusLabel('ok', task.StatusMessage);
    }

    openVersionPolicy(versionPolicies = undefined, clone = false){
        if(versionPolicies !== undefined && !versionPolicies.length){
            return;
        }
        let versionPolicy;
        let create = false;
        if(versionPolicies === undefined){
            create = true;
            versionPolicy = new TreeVersioningPolicy();
            versionPolicy.Uuid = uuid();
            versionPolicy.VersionsDataSourceName = "versions";
            versionPolicy.NodeDeletedStrategy = "KeepAll";
            const period = new TreeVersioningKeepPeriod();
            period.IntervalStart = "0";
            period.MaxNumber = -1;
            versionPolicy.KeepPeriods = [period];
        }else{
            versionPolicy = versionPolicies[0];
            if (clone) {
                create = true;
                versionPolicy = TreeVersioningPolicy.constructFromObject(JSON.parse(JSON.stringify(versionPolicy)));
                versionPolicy.Uuid = uuid();
                versionPolicy.Name += ' (Copy)';
            }
        }
        const {openRightPane, pydio, versioningReadonly, accessByName} = this.props;
        const {dataSources} = this.state;
        openRightPane({
            COMPONENT:VersionPolicyEditor,
            PROPS:{
                ref:"editor",
                versionPolicy:versionPolicy,
                create: create,
                pydio: pydio,
                internalSources:dataSources.filter((ds) => ds.StorageConfiguration && ds.StorageConfiguration.cellsInternal).map((ds) => ds.Name),
                readonly: versioningReadonly || !accessByName('CreateVersioning'),
                closeEditor:this.closeEditor.bind(this),
                reloadList:this.load.bind(this),
            }
        });
    }

    deleteVersionPolicy(policy){
        const {pydio} = this.props;
        pydio.UI.openConfirmDialog({
            message:pydio.MessageHash['ajxp_admin.versions.editor.delete.confirm'],
            destructive:[policy.Name],
            validCallback:() => {
                ResourcesManager.loadClass('EnterpriseSDK').then(sdk => {
                    const api = new sdk.EnterpriseConfigServiceApi(PydioApi.getRestClient());
                    api.deleteVersioningPolicy(policy.Uuid).then((r) =>{
                        this.load();
                    });
                });
            },
        });
    }

    createDataSource(storageStructure){
        const {pydio, storageTypes} = this.props;
        const {dataSources} = this.state;
        this.props.openRightPane({
            COMPONENT:DataSourceEditor,
            PROPS:{
                ref:"editor",
                create:true,
                createStructure: storageStructure,
                existingNames:dataSources.map(ds => ds.Name),
                pydio:pydio,
                storageTypes:storageTypes,
                closeEditor:this.closeEditor.bind(this),
                reloadList:this.load.bind(this),
            }
        });
    }

    resyncDataSource(pydio, m, row){
        pydio.UI.openConfirmDialog({
            message:m('editor.legend.resync'),
            skipNext:'datasource.resync.confirm',
            validCallback:() => {
                const ds = new DataSource(row);
                ds.resyncSource();
            },
        });
    }

    deleteDataSource(pydio, m, row){
        pydio.UI.openConfirmDialog({
            message:m('editor.delete.warning'),
            validCallback:() => {
                const ds = new DataSource(row);
                ds.deleteSource().then(()=> {
                    this.load();
                });
            },
            destructive:[row.Name]
        });
    }

    createWorkspaceFromDatasource(pydio, m, row){
        const ws = new Workspace();
        const model = ws.getModel();
        const dsName = row.Name;
        model.Label = dsName;
        model.Description = "Root of " + dsName;
        model.Slug = dsName;
        model.Attributes['DEFAULT_RIGHTS'] = '';
        const roots = model.RootNodes;
        const fakeRoot = {Uuid:'DATASOURCE:' +dsName, Path:dsName};
        roots[fakeRoot.Uuid] = fakeRoot;
        pydio.UI.openComponentInModal('PydioReactUI', 'PromptDialog', {
            dialogTitle:m('board.wsfromds.title'),
            legendId:m('board.wsfromds.legend').replace('%s', dsName),
            fieldLabelId:m('board.wsfromds.field'),
            defaultValue: m('board.wsfromds.defaultPrefix').replace('%s', dsName),
            submitValue:(v) => {
                model.Label = v;
                ws.save().then((newWS) => {
                    localStorage.setItem('admin.workspace.autoload', newWS.UUID)
                    pydio.goTo('/data/workspaces');
                });
            }
        });
    }

    render(){
        const {dataSources, resyncJobs, versioningPolicies, m, createDialog} = this.state;
        dataSources.sort(LangUtils.arraySorter('Name'));

        const splitSources = dataSources.filter(ds => !(ds.StorageConfiguration && ds.StorageConfiguration.cellsInternal));
        const internalSources = dataSources.filter(ds => ds.StorageConfiguration && ds.StorageConfiguration.cellsInternal);

        versioningPolicies.sort(LangUtils.arraySorter('Name'));

        const adminStyles = AdminComponents.AdminStyles(this.props.muiTheme.palette);
        const {body} = adminStyles;
        const {tableMaster} = body;
        const blockProps = body.block.props;
        const blockStyle = body.block.container;

        const {currentNode, pydio, versioningReadonly, accessByName} = this.props;
        let dsColumns = [
            {name:'Name', label:m('name'), style:{fontSize: 15, width: '15%'}, headerStyle:{width: '15%'}, sorter:{type:'string', default:true}},
            {name:'StorageType', label:m('storage'), style:{width:'15%'}, headerStyle:{width:'15%'}, renderCell:(row)=>{
                    let s = 'storage.fs';
                    switch (row.StorageType) {
                        case "S3":
                            s = 'storage.s3';
                            break;
                        case "AZURE":
                            s = 'storage.azure';
                            break;
                        case "GCS":
                            s = 'storage.gcs';
                            break;
                        default:
                            break;
                    }
                    return m(s);
                }, sorter:{type:'string'}},
            {name:'Status', label:m('status'), hideSmall: true,
                renderCell:(row)=>{
                    return row.Disabled ? <span style={{color:'#757575'}}><span className={"mdi mdi-checkbox-blank-circle-outline"}/> {m('status.disabled')}</span> : this.computeStatus(row);
                },
                sorter:{type:'number', value:row=>this.computeStatus(row, true)}
            },
            {name: 'SyncStatus', label:m('syncStatus'),  hideSmall: true,
                renderCell:(row)=> (resyncJobs && resyncJobs[row.Name]) ? this.computeJobStatus(resyncJobs[row.Name]) : 'n/a',
                sorter:{type:'number', value:(row) => resyncJobs && resyncJobs[row.Name]?resyncJobs[row.Name].Tasks[0].EndTime:0}
            },
            {name:'VersioningPolicyName', label:m('versioning'), style:{width:'15%'}, headerStyle:{width:'15%'}, hideSmall:true, renderCell:(row) => {
                const pol = versioningPolicies.find((obj)=>obj.Uuid === row['VersioningPolicyName']);
                if (pol) {
                    return pol.Name;
                } else {
                    return row['VersioningPolicyName'] || '-';
                }
            }, sorter:{type:'string'}},
            {
                name:'EncryptionMode',
                label:m('encryption'),
                hideSmall:true,
                style:{width:'8%', textAlign:'center'},
                headerStyle:{width:'8%'},
                renderCell:(row) => {
                    return row['EncryptionMode'] === 'MASTER' ? <span className={"mdi mdi-check"}/> : '-' ;
                },
                sorter:{type:'number', value:(row)=> row['EncryptionMode'] === 'MASTER' ? 1 : 0 }},
        ];
        if(!splitSources.filter(ds => !ds.FlatStorage).length){
            dsColumns = dsColumns.filter(col => col.name !== 'SyncStatus')
        }
        const internalColumns = dsColumns.filter(col => col.name !== 'VersioningPolicyName' && col.name !== 'SyncStatus')

        const title = currentNode.getLabel();
        const icon = currentNode.getMetadata().get('icon_class');
        let buttons = [];
        if(accessByName('CreateDatasource')){
            buttons.push(<FlatButton primary={true} label={pydio.MessageHash['ajxp_admin.ws.4']} onClick={() => this.setState({createDialog:true})} {...adminStyles.props.header.flatButton}/>)
        }
        const versioningEditable = !versioningReadonly && accessByName('CreateVersioning');
        if(versioningEditable){
            buttons.push(<FlatButton primary={true} label={pydio.MessageHash['ajxp_admin.ws.4b']} onClick={() => {this.openVersionPolicy()}} {...adminStyles.props.header.flatButton}/>)
        }
        const policiesColumns = [
            {name:'Name', label: m('versioning.name'), style:{width:180, fontSize:15}, headerStyle:{width:180}, sorter:{type:'string', default:true}},
            {name:'Description', label: m('versioning.description'), sorter:{type:'string'}},
            {name:'KeepPeriods', hideSmall:true, label: m('versioning.periods'), renderCell:(row) => {
                return <VersionPolicyPeriods rendering="short" policy={row} pydio={pydio}/>
            }},
            {name:'VersionsDataSourceName', style:{width:180}, headerStyle:{width:180}, label: m('versioning.storage'), sorter:{type:'string'}, hideSmall:true}
        ];

        const dsActions = [];
        if(accessByName('CreateDatasource')){
            dsActions.push({
                iconClassName:'mdi mdi-pencil',
                tooltip:'Edit datasource',
                onClick:row=>{this.openDataSource([row])}
            });
        }
        dsActions.push({
            iconClassName:'mdi mdi-folder-plus',
            tooltip:'Create workspace here',
            onClick:row => this.createWorkspaceFromDatasource(pydio, m, row)
        });
        if(accessByName('CreateDatasource')){
            dsActions.push({
                iconClassName:'mdi mdi-delete',
                tooltip:m('editor.legend.delete.button'),
                onClick:row => this.deleteDataSource(pydio, m, row)
            });
        }
        const internalActions = [...dsActions];
        if(splitSources.filter(ds => !ds.FlatStorage).length > 0) {
            dsActions.push({
                iconClassName:'mdi mdi-sync',
                tooltip:m('editor.legend.resync.button'),
                onClick:row => this.resyncDataSource(pydio, m, row),
                disable:(row=>row.FlatStorage)
            });
        }

        const vsActions = [];
        vsActions.push({
            iconClassName:versioningEditable?'mdi mdi-pencil':'mdi mdi-eye',
            tooltip: versioningEditable?'Edit policy':'Display policy',
            onClick:row => {this.openVersionPolicy([row])}
        });
        if(versioningEditable){
            vsActions.push({
                iconClassName:'mdi mdi-content-copy',
                tooltip:'Duplicate policy',
                onClick:row => this.openVersionPolicy([row], true)
            })
            vsActions.push({
                iconClassName:'mdi mdi-delete',
                tooltip:'Delete policy',
                destructive:true,
                onClick:row => this.deleteVersionPolicy(row)
            })
        }

        return (

            <div className="main-layout-nav-to-stack workspaces-board">
                <div className="vertical-layout" style={{width:'100%'}}>
                    <AdminComponents.Header
                        title={title}
                        icon={icon}
                        actions={buttons}
                        reloadAction={this.load.bind(this)}
                        loading={!(this.state.dsLoaded && this.state.versionsLoaded)}
                    />
                    <CreateDSDialog
                        open={createDialog}
                        onRequestClose={() => {this.setState({createDialog: false})}}
                        onSubmit={(value) => {this.createDataSource(value)}}
                    />
                    <div className="layout-fill">
                        <AdminComponents.SubHeader title={m('board.ds.title')} legend={m('board.ds.legend')}/>
                        <Paper {...blockProps} style={{...blockStyle}}>
                            <MaterialTable
                                data={splitSources}
                                columns={dsColumns}
                                actions={dsActions}
                                onSelectRows={this.openDataSource.bind(this)}
                                deselectOnClickAway={true}
                                showCheckboxes={false}
                                emptyStateString={m('emptyState')}
                                masterStyles={tableMaster}
                                storageKey={'console.datasources.list'}
                            />
                        </Paper>
                        {internalSources.length > 0 &&
                            <Fragment>
                                <div style={{padding: '0px 20px'}}>{m('board.ds.internalds')}</div>
                                <Paper {...blockProps} style={{...blockStyle}}>
                                    <MaterialTable
                                        data={internalSources}
                                        columns={internalColumns}
                                        actions={internalActions}
                                        onSelectRows={this.openDataSource.bind(this)}
                                        deselectOnClickAway={true}
                                        showCheckboxes={false}
                                        emptyStateString={m('emptyState')}
                                        masterStyles={tableMaster}
                                        storageKey={'console.internalsources.list'}
                                    />
                                </Paper>
                            </Fragment>
                        }

                        <AdminComponents.SubHeader title={m('board.versioning.title')} legend={m('board.versioning.legend')}/>
                        <Paper {...blockProps} style={{...blockStyle}}>
                            <MaterialTable
                                data={versioningPolicies}
                                columns={policiesColumns}
                                actions={vsActions}
                                onSelectRows={this.openVersionPolicy.bind(this)}
                                deselectOnClickAway={true}
                                showCheckboxes={false}
                                masterStyles={tableMaster}
                                storageKey={'console.versioning.policies.list'}
                            />
                        </Paper>

                        <AdminComponents.SubHeader  title={m('board.enc.title')} legend={m('board.enc.legend')}/>
                        <EncryptionKeys pydio={pydio} ref={"encKeys"} accessByName={accessByName} adminStyles={adminStyles}/>

                    </div>

                </div>
            </div>

        );
    }


}

DataSourcesBoard.propTypes = {
    dataModel:PropTypes.instanceOf(PydioDataModel).isRequired,
    rootNode:PropTypes.instanceOf(Node).isRequired,
    currentNode:PropTypes.instanceOf(Node).isRequired,
    openEditor:PropTypes.func.isRequired,
    openRightPane:PropTypes.func.isRequired,
    closeRightPane:PropTypes.func.isRequired,
    filter:PropTypes.string,
    versioningReadonly: PropTypes.bool,
};

DataSourcesBoard = muiThemeable()(DataSourcesBoard);

export {DataSourcesBoard as default}