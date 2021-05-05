import React from 'react'
import Pydio from 'pydio'
const {ModernTextField} = Pydio.requireLib('hoc');
import {Step, StepLabel, StepContent, RaisedButton, Paper, Checkbox} from 'material-ui'
import StepActions from './StepActions'


class StepShares extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            features: {
                "links":{label:this.T('feature.links'), checked: true},
                "cells":{label:this.T('feature.cells'), checked: true},
            },
            ownerId: ''
        }
    }

    T(id){
        const m = Pydio.getInstance().MessageHash;
        return m['migration.step.shares.' + id] || m['migration.' + id] || m[id] || id;
    }

    exportFeatures(){
        const {features, ownerId} = this.state;
        const {onChange} = this.props;
        const state = {};
        if(!features.links.checked || !features.cells.checked){
            state.shareType = features.links.checked ? 'LINK' : 'CELL';
        }
        if(ownerId){
            state.ownerId = ownerId;
        }
        onChange({sharesFeatures: state});
    }

    toggle(featureName, checked){
        const {features} = this.state;
        features[featureName].checked = checked;
        if(!features.links.checked && !features.cells.checked){
            alert(this.T('alert'));
            return;
        }
        this.setState({features}, () => {this.exportFeatures()})
    }


    render() {
        const {onBack, onComplete, styles} = this.props;
        const {features, ownerId} = this.state;

        return (
            <Step {...this.props}>
                <StepLabel>{this.T('title')}</StepLabel>
                <StepContent>
                    <div style={styles.stepLegend}>{this.T('legend')}</div>
                    <div style={styles.stepLegend}>{this.T('legend.warning')}</div>

                    <div style={{marginTop: 10}}>{this.T('restrict.type')}</div>
                    <div style={{padding:'10px 0'}}>
                        {Object.keys(features).map(k => {
                            const f = features[k];
                            return <Checkbox style={{padding:'6px 0'}} label={f.label} checked={f.checked} onCheck={(e,v) => {this.toggle(k, v)}}/>
                        })}
                    </div>
                    <div>{this.T('restrict.user')}</div>
                    <ModernTextField hintText={this.T('restrict.user.login')} value={ownerId} onChange={(e,v) => {
                        this.setState({ownerId:v}, () => {this.exportFeatures()});
                    }}/>

                    <StepActions>
                        <RaisedButton
                            onClick={() => onBack()}
                            label={this.T('back')}
                        />&nbsp;&nbsp;
                        <RaisedButton
                            onClick={() => onComplete()}
                            label={this.T('next')}
                            disabled={!features.links.checked && !features.cells.checked}
                            primary={true}
                        />
                    </StepActions>

                </StepContent>
            </Step>
        )
    }
}

export {StepShares as default}