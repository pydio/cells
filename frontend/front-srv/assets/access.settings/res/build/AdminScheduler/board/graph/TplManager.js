'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var TplManager = (function () {
    _createClass(TplManager, null, [{
        key: 'getInstance',
        value: function getInstance() {
            if (!TplManager.instance) {
                TplManager.instance = new TplManager();
            }
            return TplManager.instance;
        }
    }]);

    function TplManager() {
        _classCallCheck(this, TplManager);
    }

    _createClass(TplManager, [{
        key: 'getSdk',
        value: function getSdk() {
            return _pydioHttpResourcesManager2['default'].loadClass('EnterpriseSDK');
        }
    }, {
        key: 'listJobs',
        value: function listJobs() {}
    }, {
        key: 'saveJob',
        value: function saveJob(id, job) {}
    }, {
        key: 'deleteJob',
        value: function deleteJob(id) {}
    }, {
        key: 'listSelectors',
        value: function listSelectors() {
            return this.getSdk().then(function (sdk) {
                var EntListSelectorTemplatesRequest = sdk.EntListSelectorTemplatesRequest;
                var SchedulerServiceApi = sdk.SchedulerServiceApi;

                var api = new SchedulerServiceApi(_pydioHttpApi2['default'].getRestClient());
                return api.listSelectorTemplates(new EntListSelectorTemplatesRequest()).then(function (result) {
                    var data = {
                        filters: { nodes: [], idm: [], context: [], output: [] },
                        selectors: { nodes: [], idm: [], context: [], output: [] }
                    };
                    var tt = result.Templates || [];
                    tt.forEach(function (t) {
                        var first = 'selectors';
                        var second = undefined;
                        if (t.AsFilter) {
                            first = 'filters';
                        }
                        if (t.IdmSelector) {
                            second = 'idm';
                        } else if (t.ActionOutputFilter) {
                            second = 'output';
                        } else if (t.ContextMetaFilter) {
                            second = 'context';
                        } else {
                            second = 'nodes';
                        }
                        data[first][second].push(t);
                    });
                    return data;
                });
            });
        }
    }, {
        key: 'saveSelector',
        value: function saveSelector(id, asFilter, label, description, type, data) {
            return this.getSdk().then(function (sdk) {
                var EntPutSelectorTemplateRequest = sdk.EntPutSelectorTemplateRequest;
                var EntSelectorTemplate = sdk.EntSelectorTemplate;
                var SchedulerServiceApi = sdk.SchedulerServiceApi;

                var api = new SchedulerServiceApi(_pydioHttpApi2['default'].getRestClient());
                var req = new EntPutSelectorTemplateRequest();
                var tpl = new EntSelectorTemplate();
                tpl.Name = id;
                tpl.AsFilter = asFilter;
                tpl.Label = label;
                tpl.Description = description;
                switch (type) {
                    case "idm":
                        tpl.IdmSelector = data;
                        break;
                    case "context":
                        tpl.ContextMetaFilter = data;
                        break;
                    case "output":
                        tpl.ActionOutputFilter = data;
                        break;
                    default:
                        tpl.NodesSelector = data;
                        break;

                }
                req.Template = tpl;
                return api.putSelectorTemplate(req);
            });
        }
    }, {
        key: 'deleteSelector',
        value: function deleteSelector(id) {
            return this.getSdk().then(function (sdk) {
                var SchedulerServiceApi = sdk.SchedulerServiceApi;

                var api = new SchedulerServiceApi(_pydioHttpApi2['default'].getRestClient());
                return api.deleteSelectorTemplate(id);
            });
        }
    }, {
        key: 'listActions',
        value: function listActions() {
            return this.getSdk().then(function (sdk) {
                var EntListActionTemplatesRequest = sdk.EntListActionTemplatesRequest;
                var SchedulerServiceApi = sdk.SchedulerServiceApi;

                var api = new SchedulerServiceApi(_pydioHttpApi2['default'].getRestClient());
                return api.listActionTemplates(new EntListActionTemplatesRequest()).then(function (result) {
                    var tt = result.Templates || [];
                    return tt.map(function (t) {
                        var a = t.Action;
                        a.TemplateName = t.Name;
                        return a;
                    });
                });
            });
        }
    }, {
        key: 'saveAction',
        value: function saveAction(id, action) {
            return this.getSdk().then(function (sdk) {
                var EntPutActionTemplateRequest = sdk.EntPutActionTemplateRequest;
                var EntActionTemplate = sdk.EntActionTemplate;
                var SchedulerServiceApi = sdk.SchedulerServiceApi;

                var api = new SchedulerServiceApi(_pydioHttpApi2['default'].getRestClient());
                var req = new EntPutActionTemplateRequest();
                var tpl = new EntActionTemplate();
                tpl.Name = id;
                tpl.Action = action;
                req.Template = tpl;
                return api.putActionTemplate(req);
            });
        }
    }, {
        key: 'deleteAction',
        value: function deleteAction(tplName) {
            return this.getSdk().then(function (sdk) {
                var SchedulerServiceApi = sdk.SchedulerServiceApi;

                var api = new SchedulerServiceApi(_pydioHttpApi2['default'].getRestClient());
                return api.deleteActionTemplate(tplName);
            });
        }
    }]);

    return TplManager;
})();

exports['default'] = TplManager;
module.exports = exports['default'];
