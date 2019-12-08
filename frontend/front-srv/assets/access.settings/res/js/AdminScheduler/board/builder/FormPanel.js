import React from 'react'
import Pydio from 'pydio'
import {Paper, MenuItem, SelectField, RaisedButton} from 'material-ui'
import PydioApi from 'pydio/http/api';
import XMLUtils from 'pydio/util/xml';
const PydioForm = Pydio.requireLib('form');
import {RightPanel} from './styles'
import {JOB_ACTION_EMPTY} from "../actions/editor";

class FormLoader {

    static FormsCache;

    static loadAction(actionName){

        if (FormLoader.FormsCache[actionName]) {
            return Promise.resolve(FormLoader.FormsCache[actionName]);
        }

        let postBody = null;

        // verify the required parameter 'serviceName' is set
        if (actionName === undefined || actionName === null) {
            throw new Error("Missing the required parameter 'serviceName' when calling configFormsDiscovery");
        }
        let pathParams = {
            'ActionName': actionName
        };
        let queryParams = {};
        let headerParams = {};
        let formParams = {};

        let authNames = [];
        let contentTypes = ['application/json'];
        let accepts = ['application/json'];
        let returnType = "String";

        return PydioApi.getRestClient().callApi(
            '/config/scheduler/actions/{ActionName}', 'GET',
            pathParams, queryParams, headerParams, formParams, postBody,
            authNames, contentTypes, accepts, returnType
        ).then((responseAndData) => {
            const xmlString = responseAndData.data;
            const domNode = XMLUtils.parseXml(xmlString);
            const parameters = PydioForm.Manager.parseParameters(domNode, "//param");
            FormLoader.FormsCache[actionName] = parameters;
            return parameters;
        });
    }
}

FormLoader.FormsCache = {};

class FormPanel extends React.Component {

    constructor(props){
        super(props);
        this.state = {};
        if(props.actionInfo && props.actionInfo.HasForm){
            this.loadForm(props.action.ID);
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.action.ID !== this.props.action.ID && nextProps.actionInfo && nextProps.actionInfo.HasForm) {
            this.loadForm(nextProps.action.ID);
        }
    }

    loadForm(actionID){
        FormLoader.loadAction(actionID).then((params) => {
            this.setState({formParams: params});
        })
    }

    onFormChange(values){
        console.log(values);
    }

    actionPicker(){
        const {actions, onChange, onDismiss} = this.props;
        const {newActionID} = this.state;
        const options = Object.keys(actions).map(id => {
            return <MenuItem primaryText={actions[id].Label || actions[id].Name} value={id}/>
        });
        return (
            <div>
                <SelectField
                    value={newActionID}
                    onChange={(ev, i, value) => {
                        this.setState({newActionID:value});
                    }}
                >{options}</SelectField>
                <RaisedButton primary={true} label={"OK"} disabled={!newActionID} onTouchTap={() => {
                    const {action} = this.props;
                    action.ID = newActionID;
                    onChange(action);
                    onDismiss();
                }}/>
            </div>
        )
    }

    render(){

        const {actionInfo, action, onDismiss} = this.props;
        const {formParams} = this.state;
        let values = {};
        if(action.Parameters){
            values = action.Parameters;
        }
        let title, description, icon;
        if(action.ID === JOB_ACTION_EMPTY){
            title = 'New action';
            icon = 'chip';
            description = this.actionPicker();
        } else if (actionInfo) {
            title = actionInfo.Label;
            icon = actionInfo.Icon;
            description = actionInfo.Description;
        } else {
            title= action.ID;
            icon = 'chip';
            description = '';
        }
        return (
            <RightPanel title={title} icon={icon} onDismiss={onDismiss}>
                <div style={{padding: 10}}>{description}</div>
                {formParams &&
                <div style={{margin: -10}}>
                    <PydioForm.FormPanel
                        ref="formPanel"
                        depth={-1}
                        parameters={formParams}
                        values={values}
                        onChange={this.onFormChange.bind(this)}
                    />
                </div>
                }
            </RightPanel>
        )
    }
}

export default FormPanel;