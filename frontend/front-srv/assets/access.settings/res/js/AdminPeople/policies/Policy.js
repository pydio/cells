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
import Rule from './Rule'
import {ListItem, FontIcon, RaisedButton, IconButton} from 'material-ui'
import {v4 as uuid} from 'uuid'
const {ModernTextField} = Pydio.requireLib('hoc');

class Policy extends React.Component{

    constructor(props){
        super(props);
        this.state = {policy: props.policy};
    }

    componentWillReceiveProps(next){
        this.setState({policy: next.policy});
    }

    componentDidMount(){
        if(this.props.newPolicyWithRule){
            this.onAddRule(null, this.props.newPolicyWithRule);
        }
    }

    onNameChange(value){
        let policy = {...this.state.policy};
        policy.Name = value;
        this.setState({createRule:null});
        this.props.savePolicy(policy);
    }

    onDescriptionChange(value){
        let policy = {...this.state.policy};
        policy.Description = value;
        this.setState({createRule:null});
        this.props.savePolicy(policy);
    }

    saveLabels(){
        const {pName, pDesc, policy} = this.state;
        if(pName){
            policy.Name = pName;
        }
        if(pDesc) {
            policy.Description = pDesc;
        }
        this.setState({pName: null, pDesc: null, createRule: null});
        this.props.savePolicy(policy);
    }

    onRuleChange(rule){

        let policy = {...this.state.policy};

        if (policy.Policies) {
            policy.Policies = policy.Policies.filter((p) => (p.id !== rule.id));
            policy.Policies.push(rule);
        } else {
            policy.Policies = [rule];
        }
        this.setState({createRule:null});
        this.props.savePolicy(policy);

    }

    onRemoveRule(rule, dontSave = false){
        let policy = {...this.state.policy};
        policy.Policies = policy.Policies.filter((p) => (p.id !== rule.id));
        this.setState({createRule:null});
        this.props.savePolicy(policy, dontSave);
    }

    onAddRule(event, ruleLabel = ""){

        let label = ruleLabel;
        let policy = {...this.state.policy};
        if(!policy.Policies) {
            policy.Policies = [];
        }
        const newId = uuid();
        let subjects = [], resources = [], actions = [];
        if(policy.ResourceGroup === "acl"){
            subjects = ["policy:" + policy.Uuid];
            resources = ["acl"];
        } else if(policy.ResourceGroup === "oidc"){
            resources = ["oidc"];
        }
        policy.Policies.push({
            id          :newId,
            description :label,
            actions     :actions,
            subjects    :subjects,
            resources   :resources,
            effect      :"deny",
        });
        this.setState({policy: policy, createRule:newId}, () => {
            //this.setState({createRule:null});
        });

    }

    render(){
        const {readonly, pydio} = this.props;
        const {policy, createRule} = this.state;

        const m = (id) => pydio.MessageHash['ajxp_admin.policies.' + id] || id;

        // Handle new rule first as it will not display in list but will open an editor directly
        const sorter = (a,b) => {
            if(a.id === createRule) {
                return -1
            }
            if(b.id === createRule) {
                return 1
            }
            return a.description.localeCompare(b.description)
        }

        const rules = policy.Policies.sort(sorter).map((rule, i) => {
            return (
                <Rule
                    {...this.props}
                    key={rule.description}
                    rule={rule}
                    isLast={i === policy.Policies.length-1}
                    create={createRule === rule.id}
                    onRuleChange={this.onRuleChange.bind(this)}
                    onRemoveRule={this.onRemoveRule.bind(this)}
                />
            );
        });

        const icButtonsProps = {
            iconStyle:{fontSize:18, color:'rgba(0,0,0,.33)'},
            style:{padding:8, width:36, height: 36},
            tooltipPosition:"top-right"
        };

        const rulesTitle = (
            <div style={{display:'flex', alignItems:'center'}}>
                <div style={{fontSize: 14, fontWeight: 500}}>Rules</div>
                {!readonly && <IconButton iconClassName={"mdi mdi-plus"} tooltip={m('rule.create')} onClick={this.onAddRule.bind(this)} {...icButtonsProps} tooltipPosition={"bottom-right"}/>}
            </div>
        );

        let labelsBlock;
        if(!readonly) {
            const {showLabels, pName, pDesc} = this.state;
            const labelsModified = (pName && pName !== policy.Name) || (pDesc && pDesc !== policy.Description);
            labelsBlock = (
                <div style={{marginTop: 10, paddingTop: 10}}>
                    <div style={{display:'flex', alignItems:'center'}}>
                        <div  style={{fontSize: 14, fontWeight: 500}}>Edit Labels</div>
                        <IconButton iconClassName={"mdi mdi-chevron-" + (showLabels?'down':'right')} tooltip={m('policy.editLabels')} onClick={()=>this.setState({showLabels:!showLabels})} {...icButtonsProps}/>
                    </div>
                    <div style={{display: showLabels?'flex':'none'}}>
                        <div style={{marginRight:6, flex: 1}}>
                            <ModernTextField value={pName || policy.Name} fullWidth={true} onChange={(e,v)=>{this.setState({pName:v})}}/>
                        </div>
                        <div style={{marginLeft:6, flex: 1}}>
                            <ModernTextField value={pDesc || policy.Description} fullWidth={true} onChange={(e,v)=>{this.setState({pDesc:v})}}/>
                        </div>
                        <div style={{width: 80}}>
                            <IconButton
                                disabled={!labelsModified}
                                iconClassName={"mdi mdi-content-save"}
                                tooltip={m('policy.saveLabels')}
                                tooltipPosition={"top-center"}
                                onClick={()=>{
                                    this.saveLabels();
                                }}
                                iconStyle={{fontSize:20, color:'rgba(0,0,0,'+(labelsModified?'.43':'.10')+')'}}
                                style={{padding:14}}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div style={{padding:'12px 24px', backgroundColor:'#f5f5f5'}}>
                {rulesTitle}
                {rules}
                {labelsBlock}
            </div>
        );
    }

}

export {Policy as default}