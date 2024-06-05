import React from 'react'
import Pydio from 'pydio'
import {Step, StepLabel, StepContent, RaisedButton, Paper, TextField, Checkbox} from 'material-ui'
import StepActions from './StepActions'

class StepCategories extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            valid: false
        }
    }

    T(id){
        const m = Pydio.getInstance().MessageHash;
        return m['migration.step.categories.' + id] || m['migration.' + id] || m[id] || id;
    }

    componentWillReceiveProps(nextProps) {
        const {features} = nextProps;
        this.setState({
            valid: Object.keys(features).reduce((valid, key) => valid || features[key].value, false)
        })
    }

    render() {
        const {features, onBack, onChange, onComplete, summary, styles, summaryState, hasRunning, ...remainingProps} = this.props;
        const {valid} = this.state;

        let title, legend, boxes;
        if (summary){
            title = this.T("summary");
            legend = this.T("summary.legend");
            boxes = [];
            Object.keys(features).forEach(k => {
                const feature = features[k];
                if(feature.value){
                    boxes.push(
                        <div style={{padding:'6px 0'}}>
                            <Checkbox label={feature.label} checked={true} labelStyle={{fontWeight:500, fontSize: 15}}/>
                            {feature.summary  && <div style={{marginLeft: 40, marginTop: 10}}>{feature.summary(summaryState)}</div>}
                            {!feature.summary && <div style={{marginLeft: 40, marginTop: 10}}>{this.T('summary.empty')}</div>}
                        </div>
                    );
                }
            });
        } else {
            title = this.T("choose");
            legend = this.T("choose.legend");
            boxes = Object.keys(features).map(k => {
                const feature = features[k];
                const {...featureProps} = feature;
                return (
                    <div style={{padding:feature.depends ? '6px 20px' : '6px 0'}}>
                        <Checkbox label={feature.label} disabled={feature.depends && !features[feature.depends].value} checked={feature.value} onCheck={(e, v) => {
                            const changes = {[k]: {...featureProps, value: v}};
                            if(!v){
                                // Disable depending features
                                Object.keys(features).forEach(sub => {
                                    const subFeature = features[sub];
                                    if(subFeature.depends && subFeature.depends === k){
                                        changes[sub] = {...subFeature, value: false};
                                    }
                                });
                            }
                            onChange(changes);
                        }} />
                    </div>
                );
            });
        }

        return (
            <Step {...remainingProps}>
                <StepLabel>{title}</StepLabel>
                <StepContent>
                    <div style={styles.stepLegend}>{legend}</div>
                    <div>
                        {boxes}
                    </div>
                    <StepActions>
                        <RaisedButton
                            onClick={() => onBack()}
                            label={this.T('back')}
                        />&nbsp;&nbsp;
                        <RaisedButton
                            primary={true}
                            disabled={!valid || hasRunning}
                            onClick={() => onComplete()}
                            label={summary ? this.T('summary.launch') : this.T('next')}
                        />
                    </StepActions>
                </StepContent>
            </Step>
        )
    }
}

export {StepCategories as default}