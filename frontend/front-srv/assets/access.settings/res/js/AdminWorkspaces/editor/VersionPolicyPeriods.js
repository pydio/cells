import React from 'react'
import {Stepper, Step, StepLabel, FontIcon} from 'material-ui'

class VersionPolicyPeriods extends React.Component{

    render(){

        const {periods, rendering} = this.props || [];

        if (rendering === 'short') {

            let text;
            if(periods.length === 1){
                const p = periods[0];
                if(p.MaxNumber === -1){
                    text = "Always keep all versions"
                } else {
                    text = "Keep " + p.MaxNumber + " versions";
                }
            } else {
                text = periods.length + " retention periods.";
                const last = periods[periods.length - 1];
                if (last.MaxNumber === 0 || last.MaxNumber === undefined){
                    text += " Remove all after " + last.IntervalStart;
                } else {
                    text += " Keep " + last.MaxNumber + " versions after " + last.IntervalStart;
                }
            }

            return <span>{text}</span>
        }

        const steps = periods.map((p) => {
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
                label = "Keep all";
            } else if(!p.MaxNumber) {
                label = "Remove all";
                icon = <FontIcon className="mdi mdi-delete" style={{color:'#c62828'}}/>;
                style={color: '#c62828'};
            } else {
                label = "Max. " + label + " versions"
            }
            return (
                <Step>
                    <StepLabel icon={icon} style={style}>{timeLabel}{label}</StepLabel>
                </Step>
            );
        });

        return (
            <Stepper activeStep={periods.length - 1} linear={false}>
                {steps}
            </Stepper>
        );

    }

}

export {VersionPolicyPeriods as default}