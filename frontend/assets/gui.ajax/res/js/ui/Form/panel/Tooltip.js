/*
 * Copyright 2023 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
const {M3Tooltip} = Pydio.requireLib("boot")


export default class Tooltip extends React.Component {

    render() {
        const {attributes, onAltTextSwitch, altTextSwitchTip, altTextSwitchTipOff, label, legendLabel, children} = this.props;

        let altSwitch;
        if(onAltTextSwitch && ['select', 'boolean', 'integer', 'integer-bytes'].indexOf(attributes['type']) > -1){
            const {alternativeText, name} = attributes;
            altSwitch = (
                <div style={{marginTop: 8, textAlign:'right'}}>
                    <span
                        style={{cursor: 'pointer', border:'1px solid white', borderRadius: 16, display:'inline-block', padding: '0px 4px'}}
                        onClick={()=>onAltTextSwitch(name, !alternativeText)}>
                        <span className={"mdi mdi-toggle-switch" + (alternativeText?"":"-off")}/>&nbsp;
                        {alternativeText ? altTextSwitchTipOff : altTextSwitchTip}
                    </span>
                </div>
            )
        }
        const tt = (
            <div style={{padding: 12}}>
                <div style={{fontSize: 16, paddingBottom: 4}}>{label}</div>
                <div style={{fontSize: 13}}>{legendLabel}</div>
                {altSwitch}
            </div>
        )
        return <M3Tooltip title={tt} placement={"left"}>{children}</M3Tooltip>

    }

}