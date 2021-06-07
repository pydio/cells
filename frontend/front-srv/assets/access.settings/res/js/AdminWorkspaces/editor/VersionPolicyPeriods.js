/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import {Stepper, Step, StepLabel, FontIcon} from 'material-ui'

class VersionPolicyPeriods extends React.Component{

    render(){

        const {policy, rendering, pydio} = this.props;
        const m = id => pydio.MessageHash['ajxp_admin.versions.period.' + id] || id;
        const {KeepPeriods=[], NodeDeletedStrategy} = policy;

        if (rendering === 'short') {

            let text;
            if(KeepPeriods.length === 1){
                const p = KeepPeriods[0];
                if(p.MaxNumber === -1){
                    text = m('keep-all.always')
                } else {
                    text = m('keep-n').replace('%s', p.MaxNumber);
                }
            } else {
                text = m('retentions-n').replace('%s', KeepPeriods.length);
                const last = KeepPeriods[KeepPeriods.length - 1];
                if (last.MaxNumber === 0 || last.MaxNumber === undefined){
                    text += ' | ' + m('remove-all-after').replace('%s', last.IntervalStart);
                } else {
                    text +=  ' | ' + m('keep-n-after').replace('%1', last.MaxNumber).replace('%2', last.IntervalStart);
                }
            }

            return <span>{text}</span>
        }

        const steps = KeepPeriods.map((p) => {
            let label = p.MaxNumber;
            let timeLabel;
            let icon = <FontIcon className="mdi mdi-ray-start-arrow"/>;
            let style = {};
            if (p.IntervalStart === undefined  || p.IntervalStart==="0"){
                icon = <FontIcon className="mdi mdi-clock-start"/>;
            } else {
                timeLabel = <span style={{fontWeight: 500, fontSize:16}}>{p.IntervalStart}&nbsp;</span>;
            }
            if(p.MaxNumber === -1){
                label = m('keep-all');
            } else if(!p.MaxNumber) {
                label = m('remove-all');
                icon = <FontIcon className="mdi mdi-clock-end" style={{color:'#c62828'}}/>;
                style={color: '#c62828'};
            } else {
                label = m('max-n').replace('%s', label)
            }
            return (
                <Step>
                    <StepLabel icon={icon} style={style}>{timeLabel}{label}</StepLabel>
                </Step>
            );
        });
        let label;
        let stepStyle= {color: '#c62828', fontWeight: 500, fontSize:16}
        switch (NodeDeletedStrategy){
            case 'KeepLast':
                label= 'Backup last'
                break;
            case 'KeepAll':
                stepStyle.color = null;
                label= 'Backup all'
                break;
            case 'KeepNone':
                label= 'Clean all'
                break;
            default:
                stepStyle.color = null;
                label= 'Backup all'
                break;
        }
        steps.push(
            <Step>
                <StepLabel style={stepStyle} icon={<FontIcon className="mdi mdi-delete" style={stepStyle}/>}>{label}</StepLabel>
            </Step>
        )

        return (
            <Stepper activeStep={KeepPeriods.length - 1} linear={false}>
                {steps}
            </Stepper>
        );

    }

}

export {VersionPolicyPeriods as default}