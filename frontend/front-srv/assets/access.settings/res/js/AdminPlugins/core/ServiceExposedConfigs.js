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
import Pydio from 'pydio'
import React from 'react'
import PydioApi from 'pydio/http/api'
import {ConfigServiceApi, RestConfiguration} from 'cells-sdk'
const {Manager, FormPanel} = Pydio.requireLib('form')

class ServiceExposedConfigs extends React.Component{

    constructor(props){
        super(props);
        this.state = {};
    }

    componentDidMount(){
        const {serviceName} = this.props;
        if(serviceName){
            this.loadServiceData(serviceName);
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.serviceName && nextProps.serviceName !== this.props.serviceName){
            this.setState({values:{}, originalValues:{}}, () => {
                this.loadServiceData(nextProps.serviceName);
            });
        }
    }

    /**
     * @param {String} serviceName
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/RestDiscoveryResponse} and HTTP response
     */
    configFormsDiscoveryWithHttpInfo(serviceName) {
        let postBody = null;

        // verify that the required parameter 'serviceName' is set
        if (serviceName === undefined || serviceName === null) {
            throw new Error("Missing the required parameter 'serviceName' when calling configFormsDiscovery");
        }

        let pathParams = {
            'ServiceName': serviceName
        };
        let queryParams = {};
        let headerParams = {};
        let formParams = {};

        let authNames = [];
        let contentTypes = ['application/json'];
        let accepts = ['application/json'];
        let returnType = "String";

        return PydioApi.getRestClient().callApi(
            '/config/discovery/forms/{ServiceName}', 'GET',
            pathParams, queryParams, headerParams, formParams, postBody,
            authNames, contentTypes, accepts, returnType
        );
    }


    loadServiceData(serviceId){

        this.configFormsDiscoveryWithHttpInfo(serviceId).then((responseAndData) => {
            const xmlString = responseAndData.data;
            const domNode = XMLUtils.parseXml(xmlString);
            this.setState({
                parameters: Manager.parseParameters(domNode, "//param"),
                loaded: true,
            });
        });

        const api = new ConfigServiceApi(PydioApi.getRestClient());
        api.getConfig("services/" + serviceId).then((restConfig) => {
            if (restConfig.Data){
                const values = JSON.parse(restConfig.Data) || {};
                this.setState({
                    originalValues: Manager.JsonToSlashes(values),
                    values: Manager.JsonToSlashes(values),
                });
            }
        });

    }

    save(){
        const {values} = this.state;
        const {onBeforeSave, onAfterSave, serviceName} = this.props;

        const jsonValues = Manager.SlashesToJson(values);
        if(onBeforeSave){
            onBeforeSave(jsonValues);
        }
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        let body = new RestConfiguration();
        body.FullPath = "services/" + serviceName;
        body.Data = JSON.stringify(jsonValues);
        return api.putConfig(body.FullPath, body).then((res)=>{
            this.setState({dirty: false});
            if(onAfterSave){
                onAfterSave(body);
            }
        });
    }

    revert(){
        const {onRevert} = this.props;
        const {originalValues} = this.state;
        this.setState({dirty:false, values:originalValues});
        if(onRevert){
            onRevert(originalValues);
        }
    }

    onChange(formValues, dirty){
        const {onDirtyChange} = this.props;
        const jsonValues = Manager.SlashesToJson(formValues);
        const values = Manager.JsonToSlashes(jsonValues);
        this.setState({dirty:dirty, values:values});
        if(onDirtyChange){
            onDirtyChange(dirty, formValues);
        }
    }

    render() {

        const {parameters, values} = this.state;
        const {accessByName} = this.props;
        if(!parameters) {
            return null;
        }

        return (
            <FormPanel
                {...this.props}
                ref="formPanel"
                parameters={parameters}
                values={values}
                disabled={!accessByName('Create')}
                onChange={this.onChange.bind(this)}
                variant={"v2"}
                variantShowLegend={true}
            />
        );

    }

}

export {ServiceExposedConfigs as default}