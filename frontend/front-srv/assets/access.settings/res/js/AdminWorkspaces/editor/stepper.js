/*
 * Copyright 2024 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import {FlatButton, Stepper, Step, StepLabel} from 'material-ui'

const stepperStyle = {
    display:'flex',
    alignItems:'center',
    padding:'0 20px 0 8px',
    position: 'absolute',
    height: 64,
    zIndex: 10,
    top: 64,
    left: 0,
    right: 0,
    backgroundColor: 'rgb(246 246 248)',
    boxShadow: 'rgba(0, 0, 0, .1) 0px 1px 2px'
};

export default function stepper(steps, current, setCurrent, disableNext, onSave, validSave, buttonsLabels){
    const createSteps = Object.keys(steps);
    let backDisabled = createSteps.indexOf(current) === 0;
    let nextDisabled = disableNext || createSteps.indexOf(current) === createSteps.length - 1

    const stepperBack = () => {
        const i = createSteps.indexOf(current);
        if(i > 0) {
            setCurrent(createSteps[i-1])
        }
    }
    const stepperNext = () => {
        const i = createSteps.indexOf(current);
        if(i < createSteps.length - 1) {
            setCurrent(createSteps[i+1])
        }
    }

    const Steps = (
        <div style={stepperStyle}>
            <div style={{flex: 1}}>
                <Stepper activeStep={createSteps.indexOf(current)}>
                    {createSteps.map(k => {
                        return (
                            <Step>
                                <StepLabel>{steps[k]}</StepLabel>
                            </Step>
                        )
                    })}
                </Stepper>
            </div>
        </div>
    )
    const Buttons = (
        <div style={{...stepperStyle, top: null, bottom: 0, backgroundColor:'white', boxShadow:'rgba(0, 0, 0, .1) 0px -1px 2px'}}>
            <span style={{flex: 1}}/>
            <FlatButton primary={true} label={buttonsLabels['back']} onClick={stepperBack} disabled={backDisabled}/>
            <FlatButton primary={true} label={buttonsLabels['next']} onClick={stepperNext} disabled={nextDisabled}/>
            <div style={{width:1, height:40, backgroundColor:'#efefef', margin:'0 5px'}}/>
            <FlatButton primary={true} label={buttonsLabels['save']} onClick={onSave} disabled={!validSave()}/>
        </div>
    );

    return {Steps, Buttons}
}