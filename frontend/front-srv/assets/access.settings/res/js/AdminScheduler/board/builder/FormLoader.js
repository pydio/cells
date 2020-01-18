import Pydio from 'pydio'
import PydioApi from 'pydio/http/api';
import XMLUtils from 'pydio/util/xml';

const PydioForm = Pydio.requireLib('form');

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

export default FormLoader