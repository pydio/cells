import Observable from "pydio/lang/observable";
import PydioApi from "pydio/http/api";
import ResourcesManager from 'pydio/http/resources-manager'
import {LogServiceApi, RestLogMessageCollection, LogListLogRequest, ListLogRequestLogFormat} from 'cells-sdk';

const levels = ['ERROR', 'WARN', 'INFO', 'DEBUG']

class Log extends Observable{

    /**
     * Build Bleve Query based on filter and date
     * @param filter {string}
     * @param serviceFilter {string}
     * @param level {string}
     * @param remoteAddress {string}
     * @param userName {string}
     * @param date {Date}
     * @param endDate {Date}
     * @return {string}
     */
    static buildQuery(filter, serviceFilter, level, remoteAddress, userName, date, endDate = undefined){

        let arr = [];

        if (filter) {
            arr.push('+Msg:"*' + filter + '*"');
        }
        if(serviceFilter) {
            arr.push('+Logger:*' + serviceFilter + '*');
        }
        if(level) {
            if (level.indexOf('<') === 0) {
                const limit = levels.indexOf(level.replace('<', ''))
                const all = levels.filter((l,i) => i <= limit).map(l => 'Level:'+l)
                arr.push(...all)
            } else {
                arr.push('+Level:' + level);
            }
        }
        if(remoteAddress){
            arr.push('+RemoteAddress:*' + remoteAddress + '*');
        }
        if(userName){
            arr.push('+UserName:*' + userName + '*');
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

    static buildTsQuery(timestamp, minutesWindow){
        let arr = [];
        arr.push('+Ts:>' + (timestamp - (minutesWindow*60)));
        arr.push('+Ts:<' + (timestamp + (minutesWindow*60)));
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
            return ResourcesManager.loadClass('EnterpriseSDK').then(sdk => {
                const api = new sdk.EnterpriseLogServiceApi(PydioApi.getRestClient());
                return api.audit(request);
            })
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
