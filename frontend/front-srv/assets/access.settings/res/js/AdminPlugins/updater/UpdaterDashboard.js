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
import {Paper, List, ListItem, RaisedButton, Checkbox, Divider, Subheader} from 'material-ui'
import PydioApi from 'pydio/http/api'
import {UpdateServiceApi} from 'pydio/http/rest-api'
import Pydio from 'pydio'
const {moment, Loader} = Pydio.requireLib('boot');
import ServiceExposedConfigs from '../core/ServiceExposedConfigs'

const UpdaterDashboard = React.createClass({

    mixins:[AdminComponents.MessagesConsumerMixin],


    getInitialState: function(){
        return {check: -1};
    },

    componentDidMount:function(){
        this.checkForUpgrade();
    },

    checkForUpgrade: function(){
        const {pydio} = this.props;
        this.setState({loading:true});

        const api = new UpdateServiceApi(PydioApi.getRestClient());
        api.updateRequired().then(res => {
            let hasBinary = 0;
            if (res.AvailableBinaries) {
                hasBinary = res.AvailableBinaries.length;
                this.setState({packages: res.AvailableBinaries});
            } else {
                this.setState({no_upgrade: true});
            }
            const node = pydio.getContextNode();
            node.getMetadata().set('flag', hasBinary);
            AdminComponents.MenuItemListener.getInstance().notify("item_changed");
            this.setState({loading: false});
        }).catch(() => {
            this.setState({loading: false});
        });

    },

    performUpgrade: function(){
        const {pydio} = this.props;
        const {check, packages} = this.state;

        if(check < 0 || !packages[check]){
            alert('Please select at least one package!');
            return;
        }

        if(confirm(this.context.getMessage('15', 'updater'))){

            const toApply = packages[check];
            const version = toApply.Version;
            const api = new UpdateServiceApi(PydioApi.getRestClient());
            this.setState({applying: true});
            api.applyUpdate(version).then(res => {
                pydio.UI.displayMessage(res.Success ? 'SUCCESS':'ERROR', res.Message);
                if(res.Success){
                    this.setState({updateApplied: version});
                    const node = pydio.getContextNode();
                    node.getMetadata().set('flag', 0);
                    AdminComponents.MenuItemListener.getInstance().notify("item_changed");
                }
            }).finally(()=>{
                this.setState({applying: false});
            });

        }
    },

    onCheckStateChange: function(index, value){
        if(value) this.setState({check: index});
        else this.setState({check: -1});
    },

    render:function(){

        let list = null;
        const {pydio} = this.props;
        const {packages, check, loading, dirty, updateApplied, applying} = this.state;
        let buttons = [];
        if(packages){
            buttons.push(<RaisedButton disabled={check < 0 || updateApplied} secondary={true} label={this.context.getMessage('4', 'updater')} onTouchTap={this.performUpgrade}/>);
            let items = [];
            if(updateApplied) {
                items.push(<ListItem primaryText={"An update has been applied. Please restart the backend now."}/>);
                items.push(<Divider/>);
            }
            for (let index=packages.length - 1; index >= 0; index--) {
                const p = packages[index];
                items.push(<ListItem
                    leftCheckbox={<Checkbox key={p} onCheck={(e,v)=> this.onCheckStateChange(index, v)} checked={index === check} disabled={updateApplied} />}
                    primaryText={p.PackageName + ' ' + p.Version}
                    secondaryText={p.Label + ' - ' + moment(new Date(p.ReleaseDate * 1000)).fromNow()}
                />);
                items.push(<Divider/>)
            }
            items.pop();
            list = (
                <div>
                    <List>
                        <Subheader>{this.context.getMessage('16', 'updater')}</Subheader>
                        {items}
                    </List>
                </div>
            );
        }else if(loading){
            list = (
                <div>{this.context.getMessage('17', 'updater')}</div>
            );
        }else{
            list = (
                <div style={{minHeight: 36}}>
                        <span style={{float:'right'}}>
                            <RaisedButton secondary={true} label={this.context.getMessage('20', 'updater')} onTouchTap={this.checkForUpgrade}/>
                        </span>
                    { (this.state && this.state.no_upgrade) ? this.context.getMessage('18', 'updater') : this.context.getMessage('19', 'updater') }
                </div>
            );
        }

        if (dirty){
            buttons.push(<RaisedButton style={{marginLeft: 10}} secondary={true} label={"Save Configs"} onTouchTap={()=>{
                this.refs.serviceConfigs.save().then((res) => {
                    this.setState({dirty: false});
                });
            }}/>)
        }

        const backend = pydio.Parameters.get("backend");


        return (
            <div className={"main-layout-nav-to-stack vertical-layout people-dashboard"}>
                <AdminComponents.Header
                    title={this.context.getMessage('2', 'updater')}
                    icon="mdi mdi-update"
                    actions={buttons}
                    reloadAction={()=>{this.checkForUpgrade()}}
                    loading={loading}
                />
                <div style={{flex: 1, overflow: 'auto'}}>
                    <Paper style={{margin:16, padding: '0 16px'}} zDepth={1}>
                        <List>
                            <ListItem primaryText={backend.PackageLabel + ' ' + backend.Version} disabled={true} secondaryTextLines={2} secondaryText={<span>
                                {"Released : " + backend.BuildStamp}<br/>
                                {"Revision : " + backend.BuildRevision}
                            </span>}/>
                        </List>
                    </Paper>
                    <Paper style={{margin:'0 16px', padding: 16, position:'relative'}} zDepth={1}>
                        {applying && <Loader style={{position: 'absolute', zIndex: 1000, top: 0, left: 0, backgroundColor: 'rgba(0, 0, 0, 0.43)'}}/>}
                        {list}
                    </Paper>
                    <ServiceExposedConfigs
                        serviceName={"pydio.grpc.update"}
                        ref={"serviceConfigs"}
                        onDirtyChange={(d)=>this.setState({dirty: d})}
                    />
                </div>
            </div>

        );
    }

});

export {UpdaterDashboard as default}