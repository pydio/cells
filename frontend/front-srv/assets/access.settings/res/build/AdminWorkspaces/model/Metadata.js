'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var Metadata = (function () {
    function Metadata() {
        _classCallCheck(this, Metadata);
    }

    _createClass(Metadata, null, [{
        key: 'loadNamespaces',
        value: function loadNamespaces() {
            var api = new _pydioHttpRestApi.UserMetaServiceApi(_pydioHttpApi2['default'].getRestClient());
            return api.listUserMetaNamespace();
        }

        /**
         * @param namespace {IdmUserMetaNamespace}
         * @return {Promise}
         */
    }, {
        key: 'putNS',
        value: function putNS(namespace) {
            var api = new _pydioHttpRestApi.UserMetaServiceApi(_pydioHttpApi2['default'].getRestClient());
            var request = new _pydioHttpRestApi.IdmUpdateUserMetaNamespaceRequest();
            request.Operation = _pydioHttpRestApi.UpdateUserMetaNamespaceRequestUserMetaNsOp.constructFromObject('PUT');
            request.Namespaces = [namespace];
            return api.updateUserMetaNamespace(request);
        }

        /**
         * @param namespace {IdmUserMetaNamespace}
         * @return {Promise}
         */
    }, {
        key: 'deleteNS',
        value: function deleteNS(namespace) {
            var api = new _pydioHttpRestApi.UserMetaServiceApi(_pydioHttpApi2['default'].getRestClient());
            var request = new _pydioHttpRestApi.IdmUpdateUserMetaNamespaceRequest();
            request.Operation = _pydioHttpRestApi.UpdateUserMetaNamespaceRequestUserMetaNsOp.constructFromObject('DELETE');
            request.Namespaces = [namespace];
            return api.updateUserMetaNamespace(request);
        }
    }]);

    return Metadata;
})();

Metadata.MetaTypes = {
    "string": "Text",
    "textarea": "Long Text",
    "stars_rate": "Stars Rating",
    "css_label": "Color Labels",
    "tags": "Extensible Tags",
    "choice": "Selection"
};

exports['default'] = Metadata;
module.exports = exports['default'];
