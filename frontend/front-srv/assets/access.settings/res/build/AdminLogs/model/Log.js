'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydioHttpRestApi = require('pydio/http/rest-api');

var Observable = require('pydio/lang/observable');
var PydioApi = require('pydio/http/api');

var Log = (function (_Observable) {
    _inherits(Log, _Observable);

    function Log() {
        _classCallCheck(this, Log);

        _get(Object.getPrototypeOf(Log.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Log, null, [{
        key: 'buildQuery',

        /**
         * Build Bleve Query based on filter and date
         * @param filter {string}
         * @param date {Date}
         * @param endDate {Date}
         * @return {string}
         */
        value: function buildQuery(filter, date) {
            var endDate = arguments.length <= 2 || arguments[2] === undefined ? undefined : arguments[2];

            var arr = [];

            if (filter) {
                arr.push('Msg:*' + filter + '*');
                arr.push('RemoteAddress:*' + filter + '*');
                arr.push('Level:*' + filter + '*');
                arr.push('UserName:*' + filter + '*');
                arr.push('Logger:*' + filter + '*');
            }

            if (date) {
                var from = date;
                var to = new Date(from);
                if (endDate) {
                    to = endDate;
                } else {
                    to.setDate(from.getDate() + 1);
                }
                arr.push('+Ts:>' + Math.floor(from / 1000));
                arr.push('+Ts:<' + Math.floor(to / 1000));
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
    }, {
        key: 'loadLogs',
        value: function loadLogs(serviceName, query, page, size, contentType) {
            var request = new _pydioHttpRestApi.LogListLogRequest();
            request.Query = query;
            request.Page = page;
            request.Size = size;
            request.Format = _pydioHttpRestApi.ListLogRequestLogFormat.constructFromObject(contentType);
            if (serviceName === 'syslog') {
                var api = new _pydioHttpRestApi.LogServiceApi(PydioApi.getRestClient());
                return api.syslog(request);
            } else if (serviceName === 'audit') {
                var api = new _pydioHttpRestApi.EnterpriseLogServiceApi(PydioApi.getRestClient());
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
    }, {
        key: 'downloadLogs',
        value: function downloadLogs(serviceName, query, format) {
            var request = new _pydioHttpRestApi.LogListLogRequest();
            request.Query = query;
            request.Page = 0;
            request.Size = 100000;
            request.Format = _pydioHttpRestApi.ListLogRequestLogFormat.constructFromObject(format);
            return Log.auditExportWithHttpInfo(request, serviceName).then(function (response_and_data) {
                return response_and_data.response.body;
            });
        }

        /**
         * Auditable Logs, in Json or CSV format
         * @param {module:model/LogListLogRequest} body
         * @param serviceName {String} audit or syslog
         * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with an object containing data of type {@link module:model/RestLogMessageCollection} and HTTP response
         */
    }, {
        key: 'auditExportWithHttpInfo',
        value: function auditExportWithHttpInfo(body, serviceName) {
            var postBody = body;

            // verify the required parameter 'body' is set
            if (body === undefined || body === null) {
                throw new Error("Missing the required parameter 'body' when calling auditExport");
            }

            var pathParams = {};
            var queryParams = {};
            var headerParams = {};
            var formParams = {};

            var authNames = [];
            var contentTypes = ['application/json'];
            var accepts = ['application/json'];
            var returnType = 'Blob';

            return PydioApi.getRestClient().callApi('/log/' + serviceName + '/export', 'POST', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
        }
    }]);

    return Log;
})(Observable);

exports['default'] = Log;
module.exports = exports['default'];
