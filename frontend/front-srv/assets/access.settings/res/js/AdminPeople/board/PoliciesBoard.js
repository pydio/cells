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
import PropTypes from 'prop-types';

import Pydio from 'pydio';
import React from 'react'
import createReactClass from 'create-react-class';
import PydioDataModel from 'pydio/model/data-model'
import Node from 'pydio/model/node'
import ResourcesManager from 'pydio/http/resources-manager'
import {Paper, Dialog, FlatButton} from 'material-ui'
import {PolicyServiceApi, IdmListPolicyGroupsRequest} from 'cells-sdk'
import PydioApi from 'pydio/http/api'
import {muiThemeable} from 'material-ui/styles';
import {v4 as uuid} from 'uuid'
const {MaterialTable} = Pydio.requireLib('components');
const {ModernTextField} = Pydio.requireLib('hoc');

import Policy from '../policies/Policy'
import {PolicyPicker} from "../policies/PolicyPicker";

const ResourceGroups = ["acl", "rest", "oidc"];

let PoliciesBoard = createReactClass({
    displayName: 'PoliciesBoard',
    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        dataModel: PropTypes.instanceOf(PydioDataModel).isRequired,
        rootNode: PropTypes.instanceOf(Node).isRequired,
        currentNode: PropTypes.instanceOf(Node).isRequired,
        openEditor: PropTypes.func.isRequired,
        openRightPane: PropTypes.func.isRequired,
        closeRightPane: PropTypes.func.isRequired,
        readonly: PropTypes.bool
    },

    componentWillMount(){
        this.listPolicies();
    },

    getInitialState(){
        return {policies: {}, popoverOpen: false, anchorEl: null};
    },

    groupByResourcesGroups(policies) {
        let result = [];
        const filter = new RegExp('\-ro$|\-rw$|\-wo$')
        ResourceGroups.map((k) => {

            const groupPolicies = policies.PolicyGroups.filter((pol) => {
                const g = pol.ResourceGroup || 'rest';
                return !pol.Uuid.match(filter) && g === k;
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

    pickCreatePolicy(value) {
        if(value.template) {
            // Replace Group and Policies IDs
            const newID = uuid()
            const saveTpl = {...value.template, Uuid: newID}
            saveTpl.Policies.forEach(p => {
                p.id = uuid()
                p.subjects = ['policy:'+newID]
            })
            this.savePolicy(saveTpl, false);
        } else {
            this.setState({newPolicyType: value.ResourceGroup})
        }
    },

    /**
     *
     * @param policy IdmPolicyGroup
     * @param revertOnly
     */
    savePolicy(policy, revertOnly){
        this.setState({newPolicyId: null})
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

        const {newPolicyType, newPolicyName, newPolicyDescription} = this.state;
        const newId = uuid();

        const policy = {
            Uuid: newId,
            Name:newPolicyName,
            Description:newPolicyDescription,
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
            selectedPolicy: newId,
            newPolicyType: null,
            newPolicyName: '',
            newPolicyDescription: ''
        });

    },

    selectRows(rows){
        if(!rows.length){
            return;
        }
        const policy = rows[0];
        const {selectedPolicy} = this.state;
        this.setState({selectedPolicy:(selectedPolicy=== policy.Uuid?null : policy.Uuid)})
    },

    render(){

        const {muiTheme, currentNode, pydio, accessByName} = this.props;
        let {readonly} = this.props;
        readonly = readonly || !accessByName('Create');
        const {policies, selectedPolicy, newPolicyId, newPolicyName, newPolicyDescription, openPicker, newPolicyType} = this.state;
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
                onClick:(policy) => this.setState({selectedPolicy:(selectedPolicy=== policy.Uuid?null : policy.Uuid)})
            })
        } else {
            actions.push({
                iconClassName:'mdi mdi-pencil',
                tooltip:m('policy.edit'),
                onClick:(policy) => this.setState({selectedPolicy:(selectedPolicy=== policy.Uuid?null : policy.Uuid)})
            });
            actions.push({
                iconClassName:'mdi mdi-delete',
                tooltip:m('policy.delete'),
                onClick:(policy) => {this.deletePolicy(policy)}
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
            const localActions = (k === 'oidc') ? actions.filter(a => a.iconClassName !== 'mdi mdi-delete'): actions

            return (
                <div>
                    <AdminComponents.SubHeader title={title} legend={legend}/>
                    <Paper {...adminStyles.body.block.props} style={adminStyles.body.block.container}>
                        <MaterialTable
                            data={dd}
                            columns={columns}
                            actions={localActions}
                            onSelectRows={(rr) => this.selectRows(rr)}
                            deselectOnClickAway={true}
                            showCheckboxes={false}
                            masterStyles={adminStyles.body.tableMaster}
                            storageKey={'console.policies.' + k + '.list'}
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
                    onClick={() => this.setState({openPicker: true})}
                    label={m('policy.new')}
                />
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
                {!readonly &&
                    <PolicyPicker
                        m={m}
                        open={openPicker}
                        onPick={(value) => {
                            this.pickCreatePolicy(value);
                            this.setState({openPicker: false});
                        }}
                        onRequestClose={()=>this.setState({openPicker: false})}
                    />
                }
                {!readonly &&
                    <Dialog
                        title={m('policy.new')}
                        actions={[
                            <FlatButton label={pydio.MessageHash['54']} onClick={()=>this.setState({newPolicyType: null})}/>,
                            <FlatButton label={m('policy.create')} onClick={this.createPolicy.bind(this)}/>
                        ]}
                        modal={false}
                        open={newPolicyType}
                        contentStyle={{width: 320}}
                    >
                        <ModernTextField fullWidth={true} hintText={m('policy.name')} value={newPolicyName} focusOnMount={true} onChange={(e,v)=>this.setState({newPolicyName: v})} variant={"v2"}/>
                        <ModernTextField fullWidth={true} hintText={m('policy.description')}  value={newPolicyDescription} onChange={(e,v)=>this.setState({newPolicyDescription: v})} variant={"v2"}/>
                    </Dialog>

                }
            </div>
        );

    },
});


PoliciesBoard = muiThemeable()(PoliciesBoard);
export {PoliciesBoard as default}