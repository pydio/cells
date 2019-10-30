import React from 'react'
import Pydio from 'pydio'
import LangUtils from 'pydio/util/lang'
const {ModernTextField} = Pydio.requireLib('hoc');
import {Step, StepLabel, StepContent, RaisedButton, Paper, Checkbox} from 'material-ui'
import StepActions from './StepActions'

class StepConnection extends React.Component {

    constructor(props){
        super(props);
        this.state = {};
    }

    T(id){
        const m = Pydio.getInstance().MessageHash;
        return m['migration.step.connection.' + id] || m['migration.' + id] || m[id] || id;
    }

    testUrl(method, url, user, pwd){
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + pwd));
            xhr.onreadystatechange = () => {
                if (xhr.readyState !== 4)  {
                    return;
                }
                if (xhr.status !== 200)  {
                    reject(new Error(this.T('fail').replace('%s', url)));
                    return;
                }
                resolve();
            };
            xhr.send();
        })
    }

    handleNext() {
        const {url, user, pwd, pydio, onComplete} = this.props;

        if(!url || !user || !pwd){
            this.setState({error: this.T('missing')});
            return
        }

        this.testUrl('GET', LangUtils.trimRight(url, '/') + '/api/v2/admin/workspaces', user, pwd).then(()=> {

            pydio.UI.displayMessage("SUCCESS", this.T('success'));
            this.setState({error: null});
            onComplete();

        }).catch((e) => {

            this.setState({error: e.message});

        });
    }

    render() {
        const {url, user, pwd, skipVerify, onChange, styles, onBack, ...remainingProps} = this.props;
        const {error} = this.state;

        return (
            <Step {...remainingProps}>
                <StepLabel>{this.T('step.connection')}</StepLabel>
                <StepContent>
                    <div style={styles.stepLegend}>{this.T('legend')}</div>
                    <Paper zDepth={1} style={{padding:16, paddingTop: 24, margin: 3, width: 480}}>
                        <ModernTextField errorText={error} floatingLabelText={this.T('field.url')} hintText={"https://yourcompany.com/pydio"} value={url} onChange={(e, v)=>{onChange({url: v})}} fullWidth={true} style={{marginTop: -10}} />
                        <Checkbox label={this.T('field.skipssl')} checked={skipVerify} onCheck={(e, v) => {onChange({skipVerify: v})}} />
                        <div style={{display:'flex', width: '100%'}}>
                            <div style={{marginRight: 10, flex: 1}}><ModernTextField floatingLabelText={this.T('field.login')} value={user} onChange={(e, v)=>{onChange({user: v})}} fullWidth={true} inputStyle={{backgroundColor:'#fafafa'}} /></div>
                            <div style={{marginLeft: 10, flex: 1}}><ModernTextField floatingLabelText={this.T('field.pwd')} value={pwd} onChange={(e, v)=>{onChange({pwd: v})}} fullWidth={true} type={"password"} /></div>
                        </div>
                    </Paper>
                    <StepActions>
                        <RaisedButton
                            onClick={() => onBack()}
                            label={this.T('back')}
                        />&nbsp;&nbsp;
                        <RaisedButton
                            primary={true}
                            onClick={() => this.handleNext()}
                            disabled={!url || !user || !pwd}
                            label={this.T('button.connect')}
                        />
                    </StepActions>
                </StepContent>
            </Step>
        )
    }
}

export {StepConnection as default}