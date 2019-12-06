import React from 'react'
import Pydio from 'pydio'
import {Paper} from 'material-ui'
import PydioApi from 'pydio/http/api';
import XMLUtils from 'pydio/util/xml';
const PydioForm = Pydio.requireLib('form');
import {styles, position} from './styles'

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
        if(props.actionInfo.HasForm){
            this.loadForm(props.action.ID);
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.action.ID !== this.props.action.ID && nextProps.actionInfo.HasForm) {
            this.loadForm(nextProps.action.ID);
        }
    }

    loadForm(actionID){
        FormLoader.loadAction(actionID).then((params) => {
            this.setState({formParams: params});
        })
    }

    onChange(values){
        console.log(values);
    }

    render(){

        const {actionInfo, action, onDismiss, sourcePosition, sourceSize, scrollLeft} = this.props;
        const {formParams} = this.state;
        let values = {};
        if(action.Parameters){
            values = action.Parameters;
        }
        const pos = position(300, sourceSize, sourcePosition, scrollLeft);
        return (
            <Paper style={{...styles.paper, ...pos}} zDepth={2}>
                <div style={styles.header}>
                    <div style={{flex: 1}}>
                        {actionInfo.Icon && <span className={'mdi mdi-' + actionInfo.Icon} style={{marginRight: 4}}/>}
                        {actionInfo.Label}
                    </div>
                    <span className={'mdi mdi-close'} onClick={()=>{onDismiss()}} style={styles.close}/>
                </div>
                <div style={styles.body}>{actionInfo.Description}</div>
                {formParams &&
                    <div style={{margin:-10}}>
                        <PydioForm.FormPanel
                            ref="formPanel"
                            depth={-1}
                            parameters={formParams}
                            values={values}
                            onChange={this.onChange.bind(this)}
                        />
                    </div>
                }
            </Paper>
        )
    }
}

export default FormPanel;