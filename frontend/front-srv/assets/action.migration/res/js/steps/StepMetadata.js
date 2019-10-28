import React from 'react'
import Pydio from 'pydio'
import {Step, StepLabel, StepContent, RaisedButton, Paper, Checkbox} from 'material-ui'
import StepActions from './StepActions'
import Loader from "../workspaces/Loader";
import MetadataMapper from "../workspaces/MetadataMapper";

class StepMetadata extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            features: {
                "watches":{label:this.T('feature.watches'), checked: true},
                "bookmarks":{label:this.T('feature.bookmark'), checked: true},
                "filesMeta":{label:this.T('feature.files'), checked: true},
            }
        }
    }

    T(id){
        const m = Pydio.getInstance().MessageHash;
        return m['migration.step.meta.' + id] || m['migration.' + id] || m[id] || id;
    }

    componentDidMount(){

        const loader = new Loader();
        const {url, user, pwd} = this.props;
        loader.loadWorkspaces(url, user, pwd)
            .catch(err => {
                this.setState({err})
            }).then(workspaces => {
            this.setState({workspaces}, ()=>{this.exportFeatures()});
        });

    }

    exportFeatures(){
        const {features} = this.state;
        const {onChange} = this.props;
        const c = [];
        Object.keys(features).forEach((k) => {
            if(features[k].checked){
                c.push(k);
            }
        });
        onChange({metadataFeatures: c});
    }

    toggle(featureName, checked){
        const {features} = this.state;
        features[featureName].checked = checked;
        this.setState({features}, () => {this.exportFeatures()})
    }

    render() {
        const {pydio, onBack, onChange, onComplete, styles} = this.props;
        const {workspaces, err, features} = this.state;

        return (
            <Step {...this.props}>
                <StepLabel>{this.T('title')}</StepLabel>
                <StepContent>
                    <div style={styles.stepLegend}>{this.T('legend')}</div>
                    <div style={{padding:'10px 0'}}>
                        {Object.keys(features).map(k => {
                            const f = features[k];
                            return <Checkbox style={{padding:'6px 0'}} label={f.label} checked={f.checked} onCheck={(e,v) => {this.toggle(k, v)}}/>
                        })}
                    </div>
                    {workspaces && features['filesMeta'].checked &&
                    <MetadataMapper
                        pydio={pydio}
                        workspaces={workspaces}
                        onMapped={(data) => {
                            const {mapping, create} = data;
                            onChange({metadataMapping:mapping, metadataCreate:create});
                        }}
                    />
                    }
                    {err &&
                    <div>{err.message}</div>
                    }
                    <StepActions>
                        <RaisedButton
                            onClick={() => onBack()}
                            label={this.T('back')}
                        />&nbsp;&nbsp;
                        <RaisedButton
                            onClick={() => onComplete()}
                            label={this.T('next')}
                            primary={true}
                        />
                    </StepActions>

                </StepContent>
            </Step>
        )
    }
}

export {StepMetadata as default}