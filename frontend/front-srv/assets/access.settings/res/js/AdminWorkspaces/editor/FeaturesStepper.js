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

const {Component, PropTypes} = require('react')
const {Stepper, Step, StepLabel, StepContent, Divider, RaisedButton, FlatButton, RadioButtonGroup, RadioButton, SelectField, Menu, MenuItem} = require('material-ui')
import Workspace from '../model/Workspace'

class TplOrDriverPicker extends Component {

    render(){
        const {onChange} = this.props;
        const localChange = (e,v) => {
            const newLabel = v==='driver' ? this.context.getMessage('ws.70') : this.context.getMessage('ws.69');
            const data = v==='driver'?{general:true}:null;
            onChange(v, newLabel, null)
        };
        return (
            <RadioButtonGroup name="driv_or_tpl" onChange={localChange} valueSelected={this.props.value}>
                <RadioButton value="driver" label={this.context.getMessage('ws.9')} style={{paddingTop: 10, paddingBottom: 10}}/>
                <RadioButton value="template" label={this.context.getMessage('ws.8')} style={{paddingTop: 5, paddingBottom: 5}} />
            </RadioButtonGroup>
        );

    }
}
TplOrDriverPicker.contextTypes =  { getMessage: PropTypes.func };


class DriverPicker extends Component {
    render() {
        const {onChange, driversLoaded, value} = this.props;
        if(!driversLoaded) return <div>Loading...</div>;
        const drivers = Workspace.DRIVERS;
        let items = [];
        drivers.forEach((d)=>{
            items.push(<MenuItem key={d.name} primaryText={d.label} value={d.name}/>);
        });
        const localChange = (e,i,v) => {
            onChange(v, this.context.getMessage('ws.9') + ': ' + drivers.get(v).label, {driver:v});
        };
        return (
            <SelectField autoWidth={true} hintText={this.context.getMessage('ws.17')} fullWidth={true} value={value} onChange={localChange}>{items}</SelectField>
        )
    }
}
DriverPicker.contextTypes = { getMessage: PropTypes.func };

class TemplatePicker extends Component {
    render() {
        const {onChange, driversLoaded, value} = this.props;
        if(!driversLoaded) return <div>Loading...</div>;
        const drivers = Workspace.TEMPLATES;
        let items = [];
        drivers.forEach((d)=>{
            items.push(<MenuItem key={d.name} primaryText={d.label} value={d.name}/>);
        });
        const localChange = (e,i,v) => {
            onChange(v, this.context.getMessage('ws.12').replace('%s', ': ' + drivers.get(v).label), {template:v});
        };
        return (
            <SelectField autoWidth={true} hintText={this.context.getMessage('ws.10')} fullWidth={true} value={value} onChange={localChange}>{items}</SelectField>
        )
    }
}
TemplatePicker.contextTypes = { getMessage: PropTypes.func };

class FeaturesStepper extends Component{

    constructor(props, context){
        super(props, context);
        this.state = {step: 0};
    }

    pathBranchToSteps(branch, steps = []){

        const values = this.state;

        branch.forEach((v) => {
            let stepData = {
                id: v.id,
                label: values[v.id+'-label'] || v.label
            }
            if(v.component || v.additionalComponent){
                if(v.component){
                    const onChange = (newValue, newLabel, data) => {
                        this.onStepValueChange(v.id, newValue, newLabel, data)
                    };
                    stepData.component =  <v.component {...this.props} value={values[v.id]} onChange={onChange}/>;
                }else{
                    stepData.component = this.props.additionalComponent;
                    stepData.additional = true;
                }
                if(values[v.id]) stepData.value = values[v.id];
                steps.push(stepData);
                if(v.choices && values[v.id] && v.choices[values[v.id]]){
                    this.pathBranchToSteps(v.choices[values[v.id]], steps);
                }
            }else {
                steps.push({
                    ...stepData,
                    form: v.edit,
                    valid: this.props.formIsValid || false,
                    component: null
                });
            }

        });

        if(steps.length === 1){
            steps.push({
                id:'next',
                label:this.context.getMessage('ws.73')
            });
        }

        return steps;

    }

    onStepValueChange(stepId, newValue, newLabel=null, data = null){
        let obj = {};
        obj[stepId] = newValue;
        if(newLabel){
            obj[stepId+'-label'] = newLabel;
        }
        this.setState(obj);
        if(data){
            if(data.general){
                this.props.onSelectionChange('general');
            }else if(data.driver){
                this.props.onSelectionChange('driver', data.driver);
            }else if(data.template){
                this.props.onSelectionChange('general', null, data.template);
            }
        }
        this.setState({step: this.state.step+1});
    }

    render(){

        const mess = this.context.getMessage;
        /*
        const PATH = {
            workspace:[
                {
                    id        : 'ws_tpl_or_driver_picker',
                    label     : mess('ws.11'),
                    component : TplOrDriverPicker,
                    choices   : {
                        template:[
                            {id: 'ws_template_picker', label:mess('ws.12').replace('%s',':'), component: TemplatePicker},
                            {id: 'ws_template_options', label:mess('ws.13'), edit:'template'}
                        ],
                        driver:[
                            {id: 'ws_driver_picker', label:mess('ws.16') + ': ', component: DriverPicker},
                            {id: 'ws_driver_options', label:mess('41', 'settings'), edit:'driver'},
                            {id: 'ws_general', label:mess('ws.14'), edit:'general'},
                        ]
                    }
                }
            ],
            template:[
                {id: 'tpl_general_options', label:mess('ws.13'), edit:'general'},
                {id: 'tpl_driver_picker', label:mess('ws.16'), component: DriverPicker},
                {id: 'tpl_driver_options', label:mess('41', 'settings'), additionalComponent: true, edit:'driver'}
            ]
        };*/
        const PATH = {
            workspace:[
                {id: 'ws_driver_options', label:mess('41', 'settings'), edit:'driver'},
                {id: 'ws_general', label:mess('ws.14'), edit:'general'}
            ],
            template:[
                {id: 'tpl_driver_options', label:mess('41', 'settings'), edit:'driver'}
            ]
        };

        const {onSelectionChange, wizardType, save, close} = this.props;
        const mainState = PATH[wizardType];
        const steps = this.pathBranchToSteps(mainState);
        const active = this.state.step;
        const activeStep = steps[active];

        if (wizardType === 'template') {
            return (
                <div>
                    <div style={{padding: '16px 16px 0px', color: '#b6b6b6', fontSize: 14,fontWeight: 500}}>
                        {this.context.getMessage('ws.74')}<br/><br/>
                        {this.context.getMessage('ws.75')}
                        {this.context.getMessage('ws.76')}
                    </div>
                    <div style={{textAlign:'right', padding: 16}}>
                        <FlatButton primary={false} label={this.context.getMessage('54', '')} onTouchTap={close} style={{marginRight: 6}}/>
                        <RaisedButton secondary={true} label={this.context.getMessage('ws.20')} onTouchTap={save} disabled={!activeStep.valid} />
                    </div>
                </div>
            );
        }

        const saveEnabled = (active === steps.length - 1 && (activeStep.value || activeStep.valid || activeStep.additional));
        return (
            <div>
                <div style={{padding: '16px 16px 0px', color: '#b6b6b6', fontSize: 14,fontWeight: 500}}>{this.context.getMessage('ws.71')}</div>
                <Stepper activeStep={active} orientation="vertical">
                    {steps.map((step, index) => {
                        let nextStepForm, nextCallback;
                        if(index < steps.length - 1){
                            nextStepForm = steps[index + 1].form;
                            nextCallback = () => {
                                if(nextStepForm) onSelectionChange(nextStepForm);
                                this.setState({step: this.state.step+1});
                            };
                        }
                        return (
                            <Step key={'step-'+index}>
                                <StepLabel>{step.label}</StepLabel>
                                <StepContent>
                                    <div>
                                    {step.component}
                                    {step.form && !step.valid &&
                                        <div style={{paddingBottom: 10, color: '#f44336'}}>{this.context.getMessage('ws.72')}</div>
                                    }
                                    {(step.form || step.additional) && nextCallback &&
                                        <div style={{textAlign:'right', padding: 3}}>
                                            <RaisedButton
                                                disabled={!step.value && !step.valid && !step.additional}
                                                label={index < steps.length - 1 ? "next":"save"}
                                                onTouchTap={nextCallback}
                                            />
                                        </div>
                                    }
                                    </div>
                                </StepContent>
                            </Step>
                        );
                    })}
                </Stepper>
                <div style={{textAlign:'right', padding: 16}}>
                    <FlatButton primary={false} label={this.context.getMessage('54', '')} onTouchTap={close} style={{marginRight: 6}}/>
                    <RaisedButton secondary={true} label={this.context.getMessage('ws.20')} onTouchTap={save} disabled={!saveEnabled} />
                </div>
            </div>
        );

    }



};

FeaturesStepper.contextTypes = {
    getMessage: PropTypes.func
};

export {FeaturesStepper as default}