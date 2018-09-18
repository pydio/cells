import React from 'react'
import {Stepper, Step, StepLabel, FontIcon} from 'material-ui'

class VersionPolicyPeriods extends React.Component{

    render(){

        const {periods, rendering, pydio} = this.props || [];
        const m = id => pydio.MessageHash['ajxp_admin.versions.period.' + id] || id;

        if (rendering === 'short') {

            let text;
            if(periods.length === 1){
                const p = periods[0];
                if(p.MaxNumber === -1){
                    text = m('keep-all.always')
                } else {
                    text = m('keep-n').replace('%s', p.MaxNumber);
                }
            } else {
                text = m('retentions-n').replace('%s', periods.length);
                const last = periods[periods.length - 1];
                if (last.MaxNumber === 0 || last.MaxNumber === undefined){
                    text += ' ' + m('remove-all-after').replace('%s', last.IntervalStart);
                } else {
                    text +=  '' + m('keep-n-after').replace('%1', last.MaxNumber).replace('%2', last.IntervalStart);
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
                label = m('keep-all');
            } else if(!p.MaxNumber) {
                label = m('remove-all');
                icon = <FontIcon className="mdi mdi-delete" style={{color:'#c62828'}}/>;
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

        return (
            <Stepper activeStep={periods.length - 1} linear={false}>
                {steps}
            </Stepper>
        );

    }

}

export {VersionPolicyPeriods as default}