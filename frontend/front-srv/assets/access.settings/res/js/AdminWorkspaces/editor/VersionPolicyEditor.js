import React from "react";
import ResourcesManager from 'pydio/http/resources-manager'
import {FlatButton, RaisedButton, Paper} from 'material-ui'
import {TreeVersioningPolicy,TreeVersioningKeepPeriod} from 'pydio/http/rest-api'
import PydioApi from 'pydio/http/api'
import XMLUtils from 'pydio/util/xml'
import Pydio from 'pydio'
import VersionPolicyPeriods from './VersionPolicyPeriods'
const PydioForm = Pydio.requireLib('form');

class VersionPolicyEditor extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            dirty:false,
            policy: props.versionPolicy,
            loaded :true,
            valid: true,
            parameters: null,
        };
    }

    componentWillReceiveProps(newProps){
        if(this.state.policy !== newProps.versionPolicy){
            this.setState({policy: newProps.versionPolicy});
        }
    }

    componentDidMount(){
        PydioApi.getRestClient().callApi(
            '/config/discovery/forms/{ServiceName}', 'GET',
            {ServiceName:'pydio.grpc.versions'}, {}, {}, {}, null,
            [], ['application/json'], ['application/json'], "String"
        ).then((responseAndData) => {
            const xmlString = responseAndData.data;
            const domNode = XMLUtils.parseXml(xmlString);
            this.setState({
                parameters: PydioForm.Manager.parseParameters(domNode, "//param"),
                loaded: true,
            });
        });
    }

    resetForm(){
        this.setState({valid: true, dirty: false, saveValue: null});
    }

    static valuesToTreeVersioningPolicy(values){
        const periods = [];
        const baseName = "IntervalStart";
        const baseNameMax = "MaxNumber";
        let nextName = baseName;
        let nextMax = baseNameMax;
        let index = 0;
        while(values[nextName] !== undefined && values[nextMax] !== undefined){
            let period = new TreeVersioningKeepPeriod();
            period.IntervalStart = values[nextName];
            period.MaxNumber = values[nextMax];
            periods.push(period);
            delete values[nextMax];
            delete values[nextName];
            index++;
            nextName = baseName + "_" + index;
            nextMax = baseNameMax + "_" + index;
        }
        values.KeepPeriods = periods;
        return TreeVersioningPolicy.constructFromObject(values);
    }

    static TreeVersioningPolicyToValues(policy){
        let values = {...policy};
        if (values.KeepPeriods) {
            let i = 0;
            values.KeepPeriods.map((p) => {
                if(i>0){
                    values['IntervalStart_' + i] = p.IntervalStart || 0;
                    values['MaxNumber_' + i] = p.MaxNumber || 0;
                } else {
                    values['IntervalStart'] = p.IntervalStart || 0;
                    values['MaxNumber'] = p.MaxNumber || 0;
                }
                i++;
            });
        }
        return values;
    }

    deleteSource(){
        if(confirm('Are you sure you want to delete this policy? This is undoable!')){
            ResourcesManager.loadClass('EnterpriseSDK').then(sdk => {
                const api = new sdk.EnterpriseConfigServiceApi(PydioApi.getRestClient());
                api.deleteVersioningPolicy(this.state.policy.Uuid).then((r) =>{
                    this.props.closeEditor();
                });
            });
        }
    }

    saveSource(){
        if(this.state.saveValue){
            const {saveValue} = this.state;
            ResourcesManager.loadClass('EnterpriseSDK').then(sdk => {
                const api = new sdk.EnterpriseConfigServiceApi(PydioApi.getRestClient());
                api.putVersioningPolicy(saveValue.Uuid, saveValue).then(() => {
                    this.props.reloadList();
                    this.setState({
                        dirty: false,
                        policy: saveValue,
                        saveValue: null
                    })
                });
            });
        }
    }

    onFormChange(values){
        let newPolicy = VersionPolicyEditor.valuesToTreeVersioningPolicy(values);
        // Check periods
        const periods = newPolicy.KeepPeriods || [];
        const deleteAll = periods.findIndex((p) => p.MaxNumber === 0);
        if(deleteAll > -1 && deleteAll < periods.length - 1){
            pydio.UI.displayMessage('ERROR', 'The Last period is configured to delete all version, you cannot add a new one!');
            let i = periods.length - 1 - deleteAll;
            while(i>0){periods.pop(); i--;}
        }
        newPolicy.KeepPeriods = periods;
        this.setState({
            saveValue: newPolicy,
            dirty: true
        });
    }

    updateValidStatus(valid){
        //this.setState({valid: valid});
    }

    render(){
        const {create, readonly} = this.props;
        const {loaded, parameters, policy, saveValue} = this.state;
        let form;
        if(parameters && loaded){
            let values = VersionPolicyEditor.TreeVersioningPolicyToValues(policy);
            if (saveValue){
                values = VersionPolicyEditor.TreeVersioningPolicyToValues(saveValue);
            }
            form = (
                <PydioForm.FormPanel
                    parameters={parameters}
                    values={values}
                    className="full-width"
                    onChange={this.onFormChange.bind(this)}
                    onValidStatusChange={this.updateValidStatus.bind(this)}
                    disabled={readonly}
                    depth={-2}
                />
            );
        }

        let titleActionBarButtons = [];
        if(!readonly){
            if(!create){
                titleActionBarButtons.push(<FlatButton key="delete" label={'Delete Policy'} secondary={true} onTouchTap={this.deleteSource.bind(this)}/>);
                titleActionBarButtons.push(<div style={{display: 'inline', borderRight: '1px solid #757575', margin: '0 2px'}} key="separator"></div>);
                titleActionBarButtons.push(<FlatButton key="reset" label={this.context.getMessage('plugins.6')} onTouchTap={this.resetForm.bind(this)} secondary={true} disabled={!this.state.dirty}/>);
            }
            titleActionBarButtons.push(<FlatButton key="save" label={this.context.getMessage('53', '')} onTouchTap={this.saveSource.bind(this)} secondary={true} disabled={!this.state.valid || !this.state.dirty}/>);
        }
        titleActionBarButtons.push(<RaisedButton key="close" label={this.context.getMessage('86', '')} onTouchTap={this.props.closeEditor}/>);

        let policyName = saveValue ? saveValue.Name : policy.Name;
        if(!policyName) {
            policyName = '';
        }

        return (
            <PydioComponents.PaperEditorLayout
                title={loaded && parameters ? "Policy " + policyName : "Loading..."}
                titleActionBar={titleActionBarButtons}
                className="workspace-editor"
                contentFill={true}
            >
                <Paper zDepth={1} style={{padding:'0 16px', backgroundColor:'#ECEFF1'}}>
                    <div style={{overflowX: 'auto'}}>
                        <VersionPolicyPeriods periods={saveValue?saveValue.KeepPeriods:policy.KeepPeriods}/>
                    </div>
                </Paper>
                {form}
            </PydioComponents.PaperEditorLayout>
        );
    }
}

VersionPolicyEditor.contextTypes = {
    messages    : React.PropTypes.object,
    getMessage  : React.PropTypes.func
};

export {VersionPolicyEditor as default};