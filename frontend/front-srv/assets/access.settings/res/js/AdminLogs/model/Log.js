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
}


export {Log as default};
