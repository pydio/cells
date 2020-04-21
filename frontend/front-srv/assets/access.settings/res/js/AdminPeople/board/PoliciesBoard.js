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
import PydioDataModel from 'pydio/model/data-model'
import Node from 'pydio/model/node'
import ResourcesManager from 'pydio/http/resources-manager'
import {Paper, List, ListItem, Subheader, Divider, IconButton, FlatButton, IconMenu, MenuItem, Popover, SelectField, TextField} from 'material-ui'
import {PolicyServiceApi, IdmListPolicyGroupsRequest} from 'pydio/http/rest-api'
import PydioApi from 'pydio/http/api'
import {muiThemeable} from 'material-ui/styles';
import {v4 as uuid} from 'uuid'
const {MaterialTable} = Pydio.requireLib('components');

import Policy from '../policies/Policy'

const ResourceGroups = ["acl", "rest", "oidc"];

let PoliciesBoard = React.createClass({

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        dataModel: React.PropTypes.instanceOf(PydioDataModel).isRequired,
        rootNode: React.PropTypes.instanceOf(Node).isRequired,
        currentNode: React.PropTypes.instanceOf(Node).isRequired,
        openEditor: React.PropTypes.func.isRequired,
        openRightPane: React.PropTypes.func.isRequired,
        closeRightPane: React.PropTypes.func.isRequired,
        readonly: React.PropTypes.bool
    },

    componentWillMount(){
        this.listPolicies();
    },

    getInitialState(){
        return {policies: {}, popoverOpen: false, anchorEl: null};
    },

    groupByResourcesGroups(policies) {
        let result = [];
        ResourceGroups.map((k) => {

            const groupPolicies = policies.PolicyGroups.filter((pol) => {
                const g = pol.ResourceGroup || 'rest';
                return g === k;
            });
            if (groupPolicies.length){
                groupPolicies.sort((a,b) => {return a.Name.toLowerCase() < b.Name.toLowerCase() ? -1 : (a.Name.toLowerCase() === b.Name.toLowerCase() ? 0 : 1 )})
                result[k] = groupPolicies;
            }

        });

        return result;
    },

    listPolicies(){

        this.setState({loading: true});
        const api = new PolicyServiceApi(PydioApi.getRestClient());
        Pydio.startLoading();
        api.listPolicies(new IdmListPolicyGroupsRequest()).then((data) => {
            Pydio.endLoading();
            const grouped = this.groupByResourcesGroups(data);
            this.setState({policies:grouped, loading: false});
        }).catch((reason) => {
            Pydio.endLoading();
            this.setState({error: reason, loading: false});
        });

    },

    /**
     *
     * @param policy IdmPolicyGroup
     * @param revertOnly
     */
    savePolicy(policy, revertOnly){
        "use strict";
        if (revertOnly){
            this.listPolicies();
            return;
        }
        ResourcesManager.loadClass('EnterpriseSDK').then(sdk => {
            const api = new sdk.EnterprisePolicyServiceApi(PydioApi.getRestClient());
            api.putPolicy(policy).then(() => {
                this.listPolicies();
            }).catch((reason) => {
                this.setState({error: reason});
            });
        });
    },

    deletePolicy(policy){
        const {pydio} = this.props;
        pydio.UI.openConfirmDialog({
            message:pydio.MessageHash['ajxp_admin.policies.policy.delete.confirm'],
            destructive:[policy.Name],
            validCallback:() => {
                ResourcesManager.loadClass('EnterpriseSDK').then(sdk => {
                    const api = new sdk.EnterprisePolicyServiceApi(PydioApi.getRestClient());
                    api.deletePolicy(policy.Uuid).then(() => {
                        this.listPolicies();
                    }).catch((reason) => {
                        this.setState({error: reason});
                    });
                });
            }
        });
    },

    createPolicy(event){

        const {newPolicyName, newPolicyDescription} = this.refs;
        const {newPolicyType} = this.state;
        const newId = uuid();

        const policy = {
            Uuid: newId,
            Name:newPolicyName.getValue(),
            Description:newPolicyDescription.getValue(),
            ResourceGroup:newPolicyType,
            Policies:[]
        };

        let policies = {...this.state.policies};
        if (!policies[newPolicyType]){
            policies[newPolicyType] = [];
        }
        policies[newPolicyType].push(policy);
        this.setState({
            policies,
            popoverOpen: false,
            newPolicyId: newId,
        });

    },

    openPopover(event){
        "use strict";
        // This prevents ghost click.
        event.preventDefault();
        this.setState({
            newPolicyType: 'acl',
            popoverOpen: true,
            anchorEl: event.currentTarget,
        }, () => {
            setTimeout(() => {this.refs.newPolicyName.focus();}, 200);
        });
    },

    handleRequestClose(){
        this.setState({popoverOpen: false});
    },

    handleChangePolicyType(event, index, value){
        this.setState({newPolicyType: value});
    },

    render(){

        const {muiTheme, currentNode, pydio, accessByName} = this.props;
        let {readonly} = this.props;
        readonly = readonly || !accessByName('Create');
        const {policies, selectedPolicy, newPolicyId} = this.state;
        const m = (id) => pydio.MessageHash['ajxp_admin.policies.' + id] || id;
        const adminStyles = AdminComponents.AdminStyles(muiTheme.palette);

        const columns = [
            {name:'Name',label:m('policy.name'), style:{fontSize: 15}, sorter:{type:'string', default:true}},
            {name:'Rules', label:m('policy.rules'), style:{width:80, textAlign:'center'}, headerStyle:{width:80, textAlign:'center'}, renderCell:(row)=>row.Policies.length, sorter:{type:'number'}},
            {name:'Description',label:m('policy.description'), sorter:{type:'string'}},
        ];

        const actions = [];
        if(readonly){
            actions.push({
                iconClassName:'mdi mdi-eye',
                tooltip:m('policy.display'),
                onTouchTap:(policy) => this.setState({selectedPolicy:(selectedPolicy=== policy.Uuid?null : policy.Uuid)})
            })
        } else {
            actions.push({
                iconClassName:'mdi mdi-pencil',
                tooltip:m('policy.edit'),
                onTouchTap:(policy) => this.setState({selectedPolicy:(selectedPolicy=== policy.Uuid?null : policy.Uuid)})
            });
            actions.push({
                iconClassName:'mdi mdi-delete',
                tooltip:m('policy.delete'),
                onTouchTap:(policy) => {this.deletePolicy(policy)}
            });
        }

        const tables = Object.keys(policies).map((k)=> {
            if (readonly && k === 'acl') {
                return null;
            }
            const data = policies[k];
            const dd = data.map(policy => {
                if(policy.Uuid === selectedPolicy){
                    return {...policy, expandedRow: (
                        <Policy
                            {...this.props}
                            readonly={readonly}
                            key={policy.Name}
                            policy={policy}
                            savePolicy={this.savePolicy.bind(this)}
                            deletePolicy={this.deletePolicy.bind(this)}
                            newPolicyWithRule={newPolicyId === policy.Uuid ? policy.Name : null}
                        />
                    )}
                } else {
                    return policy
                }
            });
            const title = m('type.' + k + '.title');
            const legend = m('type.' + k + '.legend');
            return (
                <div>
                    <AdminComponents.SubHeader title={title} legend={legend}/>
                    <Paper {...adminStyles.body.block.props} style={adminStyles.body.block.container}>
                        <MaterialTable
                            data={dd}
                            columns={columns}
                            actions={actions}
                            deselectOnClickAway={true}
                            showCheckboxes={false}
                            masterStyles={adminStyles.body.tableMaster}
                        />
                    </Paper>
                </div>
            );
        });


        const action = (
            <div>
                <FlatButton
                    {...adminStyles.props.header.flatButton}
                    primary={true}
                    onTouchTap={this.openPopover.bind(this)}
                    label={m('policy.new')}
                />
                <Popover
                    open={this.state.popoverOpen}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                    targetOrigin={{horizontal: 'right', vertical: 'top'}}
                    onRequestClose={this.handleRequestClose.bind(this)}
                >
                    <div>
                        <div style={{padding : '0 12px'}}>
                            <TextField floatingLabelText={m('policy.name')} ref="newPolicyName"/>
                            <br/>
                            <TextField floatingLabelText={m('policy.description')} ref="newPolicyDescription"/>
                            <br/>
                            <SelectField
                                floatingLabelText={m('policy.type')}
                                ref="newPolicyType"
                                value={this.state.newPolicyType || 'rest'}
                                onChange={this.handleChangePolicyType.bind(this)}
                            >
                                {ResourceGroups.map((k) => <MenuItem value={k} primaryText={m('type.' + k + '.title')}/>)}
                            </SelectField>
                            </div>
                        <Divider/>
                        <div style={{textAlign: 'right', padding: '6px 12px'}}>
                            <FlatButton label={pydio.MessageHash['54']} onTouchTap={this.handleRequestClose.bind(this)}/>
                            <FlatButton label={m('policy.create')} onTouchTap={this.createPolicy.bind(this)}/>
                        </div>
                    </div>
                </Popover>
            </div>
        );


        return (
            <div className="vertical-layout" style={{height: '100%'}}>
                <AdminComponents.Header
                    title={currentNode.getLabel()}
                    icon={currentNode.getMetadata().get('icon_class')}
                    actions={readonly?null:action}
                    reloadAction={this.listPolicies.bind(this)}
                    loading={this.state.loading}
                />
                <div className="layout-fill">
                    {tables}
                </div>
            </div>
        );

    }

});


PoliciesBoard = muiThemeable()(PoliciesBoard);
export {PoliciesBoard as default}