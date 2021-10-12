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
import createReactClass from 'create-react-class';
import {Paper, List, ListItem, RaisedButton, FlatButton, IconButton, Checkbox, Divider, Subheader} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import PydioApi from 'pydio/http/api'
import {UpdateServiceApi, UpdateUpdateRequest, UpdateApplyUpdateRequest} from 'cells-sdk'
import Pydio from 'pydio'
import UpgraderWizard from './UpgraderWizard'
const {moment, SingleJobProgress} = Pydio.requireLib('boot');
import ServiceExposedConfigs from '../core/ServiceExposedConfigs'
const {MaterialTable} = Pydio.requireLib('components');

let UpdaterDashboard = createReactClass({
    displayName: 'UpdaterDashboard',
    mixins:[AdminComponents.MessagesConsumerMixin],

    getInitialState: function(){
        const {pydio} = this.props;
        return {
            check: -1,
            backend:pydio.Parameters.get("backend")
        };
    },

    componentDidMount:function(){
        this.checkForUpgrade();
    },

    checkForUpgrade: function(){
        const {pydio, rootNode} = this.props;
        this.setState({loading:true});

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

        const api = new UpdateServiceApi(PydioApi.getRestClient());
        Pydio.startLoading();
        api.updateRequired(new UpdateUpdateRequest()).then(res => {
            Pydio.endLoading();
            let hasBinary = 0;
            if (res.AvailableBinaries) {
                hasBinary = res.AvailableBinaries.length;
                this.setState({packages: res.AvailableBinaries});
            } else {
                this.setState({no_upgrade: true});
            }
            rootNode.getMetadata().set('flag', hasBinary);
            AdminComponents.MenuItemListener.getInstance().notify("item_changed");
            this.setState({loading: false});
        }).catch(() => {
            Pydio.endLoading();
            this.setState({loading: false});
        });

    },

    upgradeFinished(){
        const {pydio, rootNode} = this.props;
        this.setState({updateApplied: this.state.selectedPackage.Version});
        rootNode.getMetadata().set('flag', 0);
        AdminComponents.MenuItemListener.getInstance().notify("item_changed");
    },

    performUpgrade: function(){
        const {pydio} = this.props;
        const {check, packages} = this.state;

        if(check < 0 || !packages[check]){
            alert(this.context.getMessage('alert.noselect', 'updater'));
            return;
        }

        if(confirm(this.context.getMessage('confirm.update', 'updater'))){

            const toApply = packages[check];
            const version = toApply.Version;
            const api = new UpdateServiceApi(PydioApi.getRestClient());
            const req = new UpdateApplyUpdateRequest();
            req.TargetVersion = version;
            api.applyUpdate(version, req).then(res => {
                if (res.Success) {
                    this.setState({watchJob: res.Message});
                } else {
                    pydio.UI.displayMessage('ERROR', res.Message);
                }
            }).catch(()=>{

            });

        }
    },

    onCheckStateChange: function(index, value, pack){
        if(value) {
            this.setState({check: index, selectedPackage: pack});
        } else {
            this.setState({check: -1, selectedPackage: null});
        }
    },

    render:function(){

        let list = null;
        const {accessByName, muiTheme} = this.props;
        const {packages, check, loading, dirty, updateApplied, selectedPackage, watchJob, backend} = this.state;
        const {primary1Color} = muiTheme.palette;
        const adminStyles = AdminComponents.AdminStyles(muiTheme.palette);
        const subHeaderStyle = adminStyles.body.block.headerFull;

        let buttons = [];
        if(packages){
            const bProps = {...adminStyles.props.header.flatButton};
            const disabled = check < 0 || updateApplied || !accessByName('Create');
            if(disabled){
                bProps.backgroundColor = '#e0e0e0';
            }
            buttons.push(
                <FlatButton
                    disabled={disabled}
                    secondary={true}
                    label={this.context.getMessage('start.update', 'updater')}
                    onClick={this.performUpgrade}
                    {...bProps}
                />);
            const tableData = [];
            for (let index=packages.length - 1; index >= 0; index--) {
                const p = packages[index];
                tableData.push({
                    ...p,
                    index,
                    Checkbox: <Checkbox key={p} onCheck={(e,v)=> this.onCheckStateChange(index, v, p)} checked={check >= index} disabled={updateApplied || check > index || !accessByName('Create')} />,
                    Changelog:<IconButton
                        iconClassName={"mdi mdi-link"}
                        tooltip={this.context.getMessage('package.changelog', 'updater')}
                        tooltipPosition={"bottom-left"}
                        onClick={()=>{window.open(p.ChangeLog, '_blank')}}
                        iconStyle={{color:primary1Color}}
                    />
                });
            }
            const columns = [
                {name:'Checkbox', label:<span className={"mdi mdi-download"}/>, style:{width:50, paddingRight:0}, headerStyle:{width:50, paddingRight:0, fontSize:24}},
                {name:'Version', label:this.context.getMessage('package.version', 'updater'), style:{fontSize: 15, width: '9%'}, headerStyle:{width: '9%'}},
                {name:'Label', label:this.context.getMessage('package.label', 'updater'), style:{width: '18%'}, headerStyle:{width: '18%'}},
                {name:'ReleaseDate', label:this.context.getMessage('package.released', 'updater'), useMoment:true, style:{width: '15%'}, headerStyle:{width: '15%'}},
                {name:'Description', label:this.context.getMessage('package.details', 'updater')},
                {name:'Changelog', label:'',style:{width:50, paddingLeft:0, overflow:'visible'}, headerStyle:{width:50}},
            ];

            list = (
                <div>
                    <div style={{...subHeaderStyle,color:muiTheme.palette.accent1Color, textTransform:'uppercase'}}>
                        {this.context.getMessage('packages.available', 'updater')}
                    </div>
                    <MaterialTable
                        showCheckboxes={false}
                        columns={columns}
                        data={tableData}
                        masterStyles={adminStyles.body.tableMaster}
                        onSelectRows={(rows)=>{
                            if(!rows || rows.length !== 1) {
                                return;
                            }
                            const row = rows[0];
                            this.onCheckStateChange(row.index, row.index !== check, row);
                        }}
                    />
                </div>
            );

        }else if(loading){
            list = (
                <div>
                    <div style={subHeaderStyle}>{this.context.getMessage('packages.available', 'updater')}</div>
                    <div style={{padding: 16}}>{this.context.getMessage('checking', 'updater')}</div>
                </div>
            );
        }else{
            list = (
                <div style={{minHeight: 36}}>
                    <div style={subHeaderStyle}>{this.context.getMessage('check.button', 'updater')}</div>
                    <div style={{padding: '16px 16px 32px'}}>
                        <span style={{float:'right'}}>
                            <RaisedButton secondary={true} label={this.context.getMessage('check.button', 'updater')} onClick={this.checkForUpgrade}/>
                        </span>
                        { (this.state && this.state.no_upgrade) ? this.context.getMessage('noupdates', 'updater') : this.context.getMessage('check.legend', 'updater') }
                    </div>
                </div>
            );
        }

        if (dirty){
            buttons.push(<RaisedButton style={{marginLeft: 10}} secondary={true} label={this.context.getMessage('configs.save', 'updater')} onClick={()=>{
                this.refs.serviceConfigs.save().then((res) => {
                    this.setState({dirty: false});
                });
            }}/>)
        }

        let versionLabel = backend.PackageLabel + ' ' + backend.Version;
        let upgradeWizard, packagingInfoMain, packagingInfoOthers;
        if(backend.PackageType === "PydioHome" && backend.Version){
            upgradeWizard = <UpgraderWizard open={this.state.upgradeDialog} onDismiss={() => this.setState({upgradeDialog:false})} currentVersion={backend.Version} pydio={this.props.pydio}/>;
            versionLabel = <span>{versionLabel} <a style={{color:primary1Color, cursor:'pointer'}} onClick={() => this.setState({upgradeDialog:true})}>&gt; {this.context.getMessage('upgrade.ed.title', 'updater')}...</a></span>
        }

        if(backend.PackagingInfo && backend.PackagingInfo.map) {
            packagingInfoOthers = backend.PackagingInfo.filter(i => !!i)
            packagingInfoMain = "Package: " + packagingInfoOthers.shift()
        }

        return (
            <div className={"main-layout-nav-to-stack vertical-layout people-dashboard"}>
                <AdminComponents.Header
                    title={this.context.getMessage('title', 'updater')}
                    icon="mdi mdi-update"
                    actions={buttons}
                    reloadAction={()=>{this.checkForUpgrade()}}
                    loading={loading}
                />
                {upgradeWizard}
                <div style={{flex: 1, overflow: 'auto'}}>
                    <Paper {...adminStyles.body.block.props}>
                        <div style={subHeaderStyle}>{this.context.getMessage('current.version', 'updater')}</div>
                        <List style={{padding: 0}}>
                            <ListItem primaryText={versionLabel} disabled={true} secondaryTextLines={2} secondaryText={<span>
                                {this.context.getMessage('package.released', 'updater') + ": " + backend.BuildStamp}<br/>
                                {this.context.getMessage('package.revision', 'updater') + ": " + backend.BuildRevision}
                            </span>}/>
                            {packagingInfoOthers &&
                            <ListItem style={{paddingTop: 0, lineHeight:'19px'}} primaryText={packagingInfoMain} disabled={true} secondaryTextLines={1} secondaryText={<span>
                                {packagingInfoOthers.map(i => <span>{i}<br/></span>)}
                            </span>}/>
                            }
                        </List>
                    </Paper>
                    {watchJob &&
                        <Paper {...adminStyles.body.block.props} style={{...adminStyles.body.block.container, position:'relative'}}>
                            <div style={subHeaderStyle}>{selectedPackage ? (selectedPackage.PackageName + ' ' + selectedPackage.Version) : ''}</div>
                            <div style={{padding:16}}>
                                <SingleJobProgress
                                    jobID={watchJob}
                                    progressStyle={{paddingTop: 16}}
                                    lineStyle={{userSelect:'text'}}
                                    onEnd={()=>{this.upgradeFinished()}}
                                />
                            </div>
                        </Paper>
                    }
                    {!watchJob && list &&
                        <Paper {...adminStyles.body.block.props} style={{...adminStyles.body.block.container, position:'relative'}}>{list}</Paper>
                    }
                    {!watchJob &&
                        <ServiceExposedConfigs
                            className={"row-flex"}
                            serviceName={"pydio.grpc.update"}
                            ref={"serviceConfigs"}
                            accessByName={accessByName}
                            disabled={!accessByName('Create')}
                            onDirtyChange={(d)=>this.setState({dirty: d})}
                        />
                    }
                    {adminStyles.formCss()}
                    {adminStyles.formCssForceGroup()}
                </div>
            </div>

        );
    },
});

UpdaterDashboard = muiThemeable()(UpdaterDashboard);

export {UpdaterDashboard as default}