/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import {Divider, Chip} from 'material-ui'
import ValuesOrRegexp from './ValuesOrRegexp'

class ChipValues extends React.Component{

    addChip(newValue){
        if(this.props.values.find((v) => (v === newValue))) {
            // value already there, ignore
            return;
        }
        const newValues  = [...this.props.values, newValue];
        this.props.onChange(newValues);
    }

    deleteChip(chipValue){
        const newValues = this.props.values.filter((v) => (v !== chipValue));
        this.props.onChange(newValues);
    }

    render(){
        const {title, values, presetValues, allowAll, allowFreeString,
            containerStyle, freeStringDefaultPrefix, presetFreeStrings} = this.props;

        return (
            <div>
                <div style={{...containerStyle, margin:'6px 16px', display:'flex', alignItems:'center'}}>
                    <div style={{width: 100, fontWeight:500}}>{title} </div>
                    <div style={{flex: 1, display:'flex', alignItems:'center', flexWrap:'wrap'}}>
                        {values.map((a) => {
                            return <Chip style={{marginRight: 10, marginBottom: 5}} onRequestDelete={this.deleteChip.bind(this, a)}>{a}</Chip>
                        })}
                        {!values.length && <span style={{fontStyle:'italic',color:'#e9e9e9'}}>Please provide at least one value</span>}
                    </div>
                    <ValuesOrRegexp
                        presetValues={presetValues}
                        allowAll={allowAll}
                        allowFreeString={allowFreeString}
                        presetFreeStrings={presetFreeStrings}
                        onValueSelected={this.addChip.bind(this)}
                        freeStringDefaultPrefix={freeStringDefaultPrefix}
                    />
                </div>
                <Divider/>
            </div>
        );
    }

}

export {ChipValues as default}