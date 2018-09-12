const Observable = require('pydio/lang/observable');
const PydioApi = require('pydio/http/api');
import {LogServiceApi, EnterpriseLogServiceApi, RestLogMessageCollection, LogListLogRequest, ListLogRequestLogFormat} from 'pydio/http/rest-api';

class Log extends Observable{

    /**
     * Build Bleve Query based on filter and date
     * @param filter {string}
     * @param date {Date}
     * @param endDate {Date}
     * @return {string}
     */
    static buildQuery(filter, date, endDate = undefined){

        let arr = [];

        if (filter) {
            arr.push('Msg:*' + filter + '*');
            arr.push('RemoteAddress:*' + filter + '*');
            arr.push('Level:*' + filter + '*');
            arr.push('UserName:*' + filter + '*');
            arr.push('Logger:*' + filter + '*');
        }

        if (date) {
            let from = date;
            let to = new Date(from);
            if (endDate) {
                to = endDate;
            } else {
                to.setDate(from.getDate() + 1);
            }
            arr.push('+Ts:>' + Math.floor(from/1000));
            arr.push('+Ts:<' + Math.floor(to/1000))
        }

        return arr.join(' ');

    }

    /**
     *
     * @param serviceName string syslog or audit
     * @param query string
     * @param page int
     * @param size int
     * @param contentType string JSON, CSV
     * @return {Promise}
     */
    static loadLogs(serviceName, query, page, size, contentType) {
        let request = new LogListLogRequest();
        request.Query = query;
        request.Page = page;
        request.Size = size;
        request.Format = ListLogRequestLogFormat.constructFromObject(contentType);
        if(serviceName === 'syslog'){
            const api = new LogServiceApi(PydioApi.getRestClient());
            return api.syslog(request);
        } else if(serviceName === 'audit') {
            const api = new EnterpriseLogServiceApi(PydioApi.getRestClient());
            return api.audit(request);
        } else {
            return Promise.reject("Unknown service name, must be 'syslog' or 'audit'");
        }
    }

    /**
     *
     * @param serviceName
     * @param query
     * @param format
     * @return {Promise<Blob>}
     */
    static downloadLogs(serviceName, query, format) {
        let request = new LogListLogRequest();
        request.Query = query;
        request.Page = 0;
        request.Size = 100000;
        request.Format = ListLogRequestLogFormat.constructFromObject(format);
        return Log.auditExportWithHttpInfo(request, serviceName).then(response_and_data => {
            return response_and_data.response.body;
        });
    }

    /**
     * Auditable Logs, in Json or CSV format
     * @param {module:model/LogListLogRequest} body
     * @param serviceName {String} audit or syslog
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/RestLogMessageCollection} and HTTP response
     */
    static auditExportWithHttpInfo(body, serviceName) {
        let postBody = body;

        // verify the required parameter 'body' is set
        if (body === undefined || body === null) {
            throw new Error("Missing the required parameter 'body' when calling auditExport");
        }


        let pathParams = {
        };
        let queryParams = {
        };
        let headerParams = {
        };
        let formParams = {
        };

        let authNames = [];
        let contentTypes = ['application/json'];
        let accepts = ['application/json'];
        let returnType = 'Blob';

        return PydioApi.getRestClient().callApi(
            '/log/' + serviceName + '/export', 'POST',
            pathParams, queryParams, headerParams, formParams, postBody,
            authNames, contentTypes, accepts, returnType
        );
    }


}


export {Log as default};
