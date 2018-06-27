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
import {Checkbox, IconMenu, IconButton, MenuItem} from 'material-ui'
import {RoleMessagesConsumerMixin} from '../util/MessagesMixin'
import PoliciesLoader from './PoliciesLoader'

export default React.createClass({

    mixins:[RoleMessagesConsumerMixin],

    propTypes:{
        acl:React.PropTypes.string,
        disabled:React.PropTypes.bool,
        hideDeny:React.PropTypes.bool,
        hideLabels:React.PropTypes.bool,
        advancedAcl:React.PropTypes.bool,
        onChange:React.PropTypes.func
    },

    getInitialState:function(){
        return {
            acl: this.props.acl,
            loaded: false,
            policies:[],
        };
    },

    componentWillMount: function(){
        PoliciesLoader.getInstance().getPolicies().then((data) => {
            this.setState({policies: data, loaded: true});
        });
    },

    componentWillReceiveProps:function(newProps){
        this.setState({acl:newProps.acl});
    },

    getAcl:function(){
        return this.state.acl;
    },

    updateAcl: function(){

        if(this.props.disabled) {
            return;
        }

        const d = this.refs.deny.isChecked();
        const r = !d && this.refs.read.isChecked();
        const w = !d && this.refs.write.isChecked();
        let acl;
        if (d) {
            acl = 'PYDIO_VALUE_CLEAR';
            this.setState({acl: acl});
        } else {
            let parts = [];
            if (r) {
                parts.push("read");
            }
            if (w) {
                parts.push("write");
            }
            acl = parts.join(",");
            this.setState({acl: acl});
        }
        if(this.props.onChange){
            this.props.onChange(acl, this.props.acl);
        }else{
            this.setState({acl:acl});
        }
    },

    handleChangePolicy(event, value){
        const acl = 'policy:' + value;
        if(this.props.onChange){
            this.props.onChange(acl, this.props.acl);
        }else{
            this.setState({acl:acl});
        }
    },

    render: function(){

        const {advancedAcl} = this.props;

        const acl = this.state.acl || '';
        const {policies} = this.state;
        let selectedPolicy = 'manual-rights';
        let policyLabel;
        if(acl.startsWith('policy:')) {
            selectedPolicy = acl.replace('policy:', '');
            const pol = policies.find((entry) => {
                return entry.id === selectedPolicy;
            });
            if (pol) {
                policyLabel = pol.label;
            } else {
                policyLabel = 'Loading...';
            }
        }

        const checkboxStyle = {width:44};

        let deny;
        if(!this.props.hideDeny){
            deny = (
                <Checkbox ref="deny" label={this.props.hideLabels?"":this.context.getMessage('react.5', 'ajxp_admin')} value="-" disabled={this.props.disabled}
                                       onCheck={this.updateAcl} checked={acl.indexOf('PYDIO_VALUE_CLEAR') !== -1}  style={checkboxStyle}/>
            );
        }
        return (
            <div style={{display:'flex', alignItems:'center', width: advancedAcl? 180 : 140, height: 40}}>

                {advancedAcl &&
                    <IconMenu
                        iconButtonElement={<IconButton iconClassName={"mdi mdi-dots-vertical"}/>}
                        onChange={this.handleChangePolicy.bind(this)}
                        value={selectedPolicy}
                        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                        targetOrigin={{horizontal: 'right', vertical: 'top'}}
                    >
                        <MenuItem value={'manual-rights'} primaryText={"Rights set manually"} />
                        {policies.map((entry) => {
                            return <MenuItem value={entry.id} primaryText={entry.label} />;
                        })}
                    </IconMenu>
                }

                {selectedPolicy === 'manual-rights' &&
                    <Checkbox ref="read"
                              label={this.props.hideLabels ? "" : this.context.getMessage('react.5a', 'ajxp_admin')}
                              value="read"
                              onCheck={this.updateAcl} disabled={this.props.disabled || acl === 'PYDIO_VALUE_CLEAR'}
                              checked={acl !== 'PYDIO_VALUE_CLEAR' && acl.indexOf('read') !== -1}
                              style={checkboxStyle}
                    />
                }
                {selectedPolicy === 'manual-rights' &&
                    <Checkbox ref="write" label={this.props.hideLabels?"":this.context.getMessage('react.5b', 'ajxp_admin')} value="write"
                                       onCheck={this.updateAcl} disabled={this.props.disabled || acl==='PYDIO_VALUE_CLEAR'}
                                       checked={acl !== 'PYDIO_VALUE_CLEAR' && acl.indexOf('write') !== -1} style={checkboxStyle}/>
                }
                {selectedPolicy === 'manual-rights' && deny}
                {selectedPolicy !== 'manual-rights' &&
                    <div style={{padding: 12, paddingLeft: 0, fontSize: 14, width: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{policyLabel}</div>
                }
            </div>
        );
    }

});

