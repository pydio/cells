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
        const {action} = props;
        this.state = {
            action,
            actionInfo: this.getActionInfo(action),
        };
    }

    getActionInfo(action){
        const {actions} = this.props;
        let actionInfo;
        if(actions[action.ID]) {
            actionInfo = actions[action.ID];
            if (actionInfo.HasForm) {
                this.loadForm(action.ID);
            }
        } else if (action.ID === JOB_ACTION_EMPTY){
            actionInfo = {
                Name: JOB_ACTION_EMPTY,
                Label: 'Create Action',
                Icon: 'chip',
                Description:'Pick an action'
            }
        } else {
            actionInfo = {
                Name: action.ID,
                Label: action.ID,
                Icon: 'chip',
                Description:'No description provided'
            }
        }
        return actionInfo;
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.action !== this.state.action) {
            this.setState({
                action: nextProps.action,
                actionInfo: this.getActionInfo(nextProps.action)
            })
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

    onIdChange(id){
        const {action} = this.state;
        action.ID = id;
        // Refresh state
        this.setState({
            action,
            actionInfo: this.getActionInfo(action)
        })
    }

    actionPicker(){
        const {actions} = this.props;
        const {action} = this.state;
        let options = Object.keys(actions).map(id => {
            return <MenuItem primaryText={actions[id].Label || actions[id].Name} value={id}/>
        });
        return (
            <SelectField
                value={action.ID}
                onChange={(ev, i, value) => {
                    this.onIdChange(value);
                }}
            >{[<MenuItem value={JOB_ACTION_EMPTY} primaryText={"Please pick an action"}/>, ...options]}</SelectField>
        )
    }

    render(){

        const {onDismiss, onChange, create} = this.props;
        const {actionInfo, action, formParams} = this.state;
        const values = action.Parameters || {};

        return (
            <RightPanel title={actionInfo.Label} icon={actionInfo.Icon} onDismiss={onDismiss}>
                <div style={{padding: 10}}>{actionInfo.Description}</div>
                {create && this.actionPicker()}
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
                <div>
                    <RaisedButton
                        primary={true}
                        label={"SAVE"}
                        disabled={action.ID === JOB_ACTION_EMPTY}
                        onTouchTap={() => {
                            onChange(action);
                            onDismiss();
                        }}/>
                    </div>
            </RightPanel>
        )
    }
}

export default FormPanel;