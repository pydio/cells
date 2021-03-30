/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import Pydio from 'pydio';
const {ModernTextField, ModernSelectField} = Pydio.requireLib('hoc');
import {MenuItem} from 'material-ui'

class QuotaField extends React.Component{

    constructor(props) {
        super(props);
        if(props.value){
            this.state = this.divide(parseInt(props.value))
        } else {
            this.state = {
                quota: 0,
                unit: 'G',
            }
        }
    }

    divide(initialValue) {
        // Find lowest unit
        const uu = ["k", "M", "G", "T", "P"];
        let res = {quota: initialValue, unit: ''};
        for (let i=0;i<uu.length;i++) {
            const check = this.multiple(1, uu[i]);
            console.log(initialValue % check);
            if(initialValue >= check && initialValue % check === 0){
                res = {quota: initialValue / check, unit: uu[i]};
            }
        }
        return res;
    }

    multiple(v, u){
        const iV = parseFloat(v);
        switch(u){
            case "k":
                return iV * 1024;
            case "M":
                return iV * 1024 * 1024;
            case "G":
                return iV * 1024 * 1024 * 1024;
            case "T":
                return iV * 1024 * 1024 * 1024 * 1024;
            case "P":
                return iV * 1024 * 1024 * 1024 * 1024 * 1024;
            default:
                return iV
        }
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextState === this.state) {
            return;
        }

        let {quota, unit} = nextState;
        this.props.onChange(null, this.multiple(quota, unit))
    }

    render() {
        const sizeUnit = Pydio.getMessages()['byte_unit_symbol'] || 'B';
        const noQuota = Pydio.getMessages()['ajxp_admin.ws.editor.other.quota.noquota'];

        return (
            <div>
                <div style={{display:'flex'}}>
                    <ModernTextField
                        value={this.state.quota > 0 ? this.state.quota : null}
                        hintText={"Bytes Value"}
                        hintStyle={{paddingLeft: 52}}
                        style={{flex: 2}}
                        type={"number"}
                        variant={"v2"}
                        hasRightBlock={true}
                        onChange={(e,v) => {
                            this.setState({quota: Math.max(0, v) || 0})
                        }}
                    />
                    <ModernSelectField
                        value={this.state.unit}
                        variant={"v2"}
                        hintText={"Unit"}
                        hasRightLeft={true}
                        onChange={(e,i,v) => {
                            let {quota, unit} = this.state;
                            if(v !== unit) {
                                quota = quota * this.multiple(1, unit) / this.multiple(1, v);
                            }
                            this.setState({quota, unit: v});
                        }}
                        style={{flex: 1}}
                    >
                        <MenuItem value={''} primaryText={sizeUnit}/>
                        <MenuItem value={'k'} primaryText={'K' + sizeUnit}/>
                        <MenuItem value={'M'} primaryText={'M' + sizeUnit}/>
                        <MenuItem value={'G'} primaryText={'G' + sizeUnit}/>
                        <MenuItem value={'T'} primaryText={'T' + sizeUnit}/>
                        <MenuItem value={'P'} primaryText={'P' + sizeUnit}/>
                    </ModernSelectField>
                </div>
            </div>
        );
    }

}

export default QuotaField;