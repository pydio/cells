'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioUtilXml = require('pydio/util/xml');

var _pydioUtilXml2 = _interopRequireDefault(_pydioUtilXml);

var PydioForm = _pydio2['default'].requireLib('form');

var FormLoader = (function () {
    function FormLoader() {
        _classCallCheck(this, FormLoader);
    }

    _createClass(FormLoader, null, [{
        key: 'loadAction',
        value: function loadAction(actionName) {

            if (FormLoader.FormsCache[actionName]) {
                return Promise.resolve(FormLoader.FormsCache[actionName]);
            }

            var postBody = null;

            // verify the required parameter 'serviceName' is set
            if (actionName === undefined || actionName === null) {
                throw new Error("Missing the required parameter 'serviceName' when calling configFormsDiscovery");
            }
            var pathParams = {
                'ActionName': actionName
            };
            var queryParams = {};
            var headerParams = {};
            var formParams = {};

            var authNames = [];
            var contentTypes = ['application/json'];
            var accepts = ['application/json'];
            var returnType = "String";

            return _pydioHttpApi2['default'].getRestClient().callApi('/config/scheduler/actions/{ActionName}', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType).then(function (responseAndData) {
                var xmlString = responseAndData.data;
                var domNode = _pydioUtilXml2['default'].parseXml(xmlString);
                var parameters = PydioForm.Manager.parseParameters(domNode, "//param");
                FormLoader.FormsCache[actionName] = parameters;
                return parameters;
            });
        }
    }]);

    return FormLoader;
})();

FormLoader.FormsCache = {};

exports['default'] = FormLoader;
module.exports = exports['default'];
