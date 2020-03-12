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
import Rule from './Rule'
import {ListItem, FontIcon, RaisedButton} from 'material-ui'
import InlineLabel from './InlineLabel'
import {v4 as uuid} from 'uuid'

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
        this.props.savePolicy(policy);
    }

    onDescriptionChange(value){
        let policy = {...this.state.policy};
        policy.Description = value;
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
        this.props.savePolicy(policy);

    }

    onRemoveRule(rule, dontSave = false){
        let policy = {...this.state.policy};
        policy.Policies = policy.Policies.filter((p) => (p.id !== rule.id));
        this.props.savePolicy(policy, dontSave);
    }

    onDeletePolicy(){
        if(window.confirm('Are you sure you want to delete this policy? This may break the security model of the application!')){
            this.props.deletePolicy(this.state.policy);
        }
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
        this.setState({policy: policy, openRule:newId}, () => {
            this.setState({openRule:null});
        });

    }

    render(){
        const {readonly} = this.props;
        const {policy, openRule} = this.state;
        let nestedItems = policy.Policies.map((rule) => {
            return (
                <Rule
                    {...this.props}
                    key={rule.description}
                    rule={rule}
                    create={openRule === rule.id}
                    onRuleChange={this.onRuleChange.bind(this)}
                    onRemoveRule={this.onRemoveRule.bind(this)}
                />
            );
        });

        if(!readonly){
            const buttonsContent = (
                <div>
                    <RaisedButton label={"Add New Rule"} onTouchTap={this.onAddRule.bind(this)}/>&nbsp;&nbsp;
                    <RaisedButton label={"Delete Policy"} onTouchTap={this.onDeletePolicy.bind(this)}/>
                </div>
            );
            nestedItems.push(
                <ListItem
                    primaryText={buttonsContent}
                    disabled={true}
                />
            );
        }

        let ruleWord = 'rule';
        const policyNumber = policy.Policies.length;
        if(policyNumber > 1) {
            ruleWord = 'rules';
        }
        const legend = <span>({policyNumber} {ruleWord})</span>;
        let primaryText, secondaryText;
        const secondaryStyle = {fontSize:14,color:'rgba(0, 0, 0, 0.54)'};
        if(readonly) {
            primaryText = policy.Name;
            secondaryText = <div style={secondaryStyle}>{policy.Description}</div>
        } else {
            primaryText = <InlineLabel label={policy.Name} onChange={this.onNameChange.bind(this)}/>;
            secondaryText = <div><InlineLabel onChange={this.onDescriptionChange.bind(this)} inputStyle={{fontSize:14,color:'rgba(0, 0, 0, 0.54)'}} label={policy.Description} legend={legend}/></div>;
        }

        return (
            <ListItem
                {...this.props}
                primaryText={primaryText}
                secondaryText={secondaryText}
                nestedItems={nestedItems}
                primaryTogglesNestedList={false}
                disabled={true}
                initiallyOpen={!!this.props.newPolicyWithRule}
            />
        );
    }

}

export {Policy as default}