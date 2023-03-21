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
import {Checkbox} from 'material-ui'
import {withRoleMessages} from "../util/MessagesMixin";

class RightsSelector extends React.Component{

    /*
    propTypes:{
        acl:React.PropTypes.string,
        disabled:React.PropTypes.bool,
        hideDeny:React.PropTypes.bool,
        hideLabels:React.PropTypes.bool,
        onChange:React.PropTypes.func
    }
    */
    constructor(props) {
        super(props);
        this.state = {acl: props.acl}
    }


    componentWillReceiveProps(newProps){
        this.setState({acl:newProps.acl});
    }

    getAcl(){
        return this.state.acl;
    }

    updateAcl(){

        if(this.props.disabled) {
            return;
        }

        const d = this.refs.deny.isChecked();
        const r = !d && this.refs.read.isChecked();
        const w = !d && this.refs.write.isChecked();
        let acl;
        let parts = [];
        if (d) {
            parts.push('deny');
        } else {
            if (r) {
                parts.push('read');
            }
            if (w) {
                parts.push('write');
            }
        }
        acl = parts.join(",");
        if(this.props.onChange){
            this.props.onChange(acl, this.props.acl);
        }
        this.setState({acl: acl});
    }

    handleChangePolicy(event, value){
        const acl = 'policy:' + value;
        if(this.props.onChange){
            this.props.onChange(acl, this.props.acl);
        }else{
            this.setState({acl:acl});
        }
    }

    render(){
        const {hideDeny, hideLabels, disabled, getMessage} = this.props;
        const acl = this.state.acl || '';

        if(acl.startsWith('policy:')) {
            return <div style={{display:'flex', alignItems:'center', width: 132, height: 33}}>Custom policy</div>
        }

        const checkboxStyle = {width:44};

        return (
            <div style={{display:'flex', alignItems:'center', width: 132, height: 33}}>
                <Checkbox ref="read"
                          label={hideLabels ? "" : getMessage('react.5a', 'ajxp_admin')}
                          value="read"
                          onCheck={this.updateAcl.bind(this)}
                          disabled={disabled || acl.indexOf('deny') > -1}
                          checked={acl.indexOf('deny') === -1 && acl.indexOf('read') !== -1}
                          style={checkboxStyle}
                />
                <Checkbox
                    ref="write"
                    label={hideLabels?"": getMessage('react.5b', 'ajxp_admin')}
                    value="write"
                    onCheck={this.updateAcl.bind(this)}
                    disabled={disabled || acl.indexOf('deny') > -1}
                    checked={acl.indexOf('deny') === -1 && acl.indexOf('write') !== -1}
                    style={checkboxStyle}/>
                {!hideDeny &&
                    <Checkbox
                        ref="deny"
                        label={hideLabels?"": getMessage('react.5', 'ajxp_admin')}
                        value="-"
                        disabled={disabled}
                        onCheck={this.updateAcl.bind(this)}
                        checked={acl.indexOf('deny') !== -1}
                        style={checkboxStyle}
                    />
                }
            </div>
        );
    }

}

export default withRoleMessages(RightsSelector)