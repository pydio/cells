'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _PydioApi = require('./PydioApi');

var _PydioApi2 = _interopRequireDefault(_PydioApi);

var _modelMetaNodeProvider = require('../model/MetaNodeProvider');

var _modelMetaNodeProvider2 = _interopRequireDefault(_modelMetaNodeProvider);

var _genApiSearchServiceApi = require('./gen/api/SearchServiceApi');

var _genApiSearchServiceApi2 = _interopRequireDefault(_genApiSearchServiceApi);

var _genModelTreeSearchRequest = require('./gen/model/TreeSearchRequest');

var _genModelTreeSearchRequest2 = _interopRequireDefault(_genModelTreeSearchRequest);

var _genModelTreeQuery = require('./gen/model/TreeQuery');

var _genModelTreeQuery2 = _interopRequireDefault(_genModelTreeQuery);

var SearchApi = (function () {
    function SearchApi(pydio) {
        _classCallCheck(this, SearchApi);

        this.api = new _genApiSearchServiceApi2['default'](_PydioApi2['default'].getRestClient());
        this.pydio = pydio;
    }

    SearchApi.prototype.search = function search(values, scope, limit) {
        var _this = this;

        var query = new _genModelTreeQuery2['default']();
        var prefix = this.computePathPrefix(scope);
        if (prefix) {
            query.PathPrefix = [prefix];
        }

        var keys = Object.keys(values);
        if (keys.length === 1 && keys[0] === 'basename') {
            query.FileName = this.autoQuote(values['basename']);
        } else {
            (function () {
                var freeQueries = {};
                keys.map(function (k) {
                    var value = values[k];
                    if (k.indexOf('ajxp_meta_') === 0) {
                        var sK = k.replace('ajxp_meta_', '');
                        if (sK !== 'TextContent') {
                            sK = 'Meta.' + sK;
                        }
                        freeQueries[sK] = _this.autoQuote(value);
                    } else if (k === 'ajxp_mime') {
                        if (value === 'ajxp_folder') {
                            query.Type = 'COLLECTION';
                        } else {
                            query.Type = 'LEAF';
                            if (value !== 'ajxp_file') {
                                query.Extension = value;
                            }
                        }
                    } else if (k === 'basename') {
                        freeQueries['Basename'] = _this.autoQuote(value);
                    } else if (k === 'basenameOrContent') {
                        query.FileNameOrContent = _this.autoQuote(value);
                    } else if (k === 'Content') {
                        query.Content = _this.autoQuote(value);
                    } else if (k === 'ajxp_modiftime' && value && (value['from'] !== undefined || value['to'] !== undefined)) {
                        if (value['from']) {
                            query.MinDate = Math.floor(value['from'] / 1000) + '';
                        }
                        if (value['to']) {
                            query.MaxDate = Math.floor(value['to'] / 1000) + '';
                        }
                    } else if (k === 'ajxp_bytesize' && value && (value['from'] !== undefined || value['to'] !== undefined)) {
                        if (parseInt(value['from']) > 0) {
                            query.MinSize = value['from'] + '';
                        }
                        if (parseInt(value['to']) > 0 && parseInt(value['to']) < 1099511627776) {
                            query.MaxSize = value['to'] + '';
                        }
                    }
                });
                if (Object.keys(freeQueries).length) {
                    query.FreeString = Object.keys(freeQueries).map(function (k) {
                        return "+" + k + ":" + freeQueries[k];
                    }).join(" ");
                }
            })();
        }

        var request = new _genModelTreeSearchRequest2['default']();
        request.Query = query;
        request.Size = limit;

        var defaultSlug = this.pydio.user.getActiveRepositoryObject().getSlug();
        return new Promise(function (resolve, reject) {
            _this.api.nodes(request).then(function (response) {
                if (!response.Results) {
                    resolve({ Results: [], Total: 0 });
                }
                response.Results = response.Results.map(function (n) {
                    return _modelMetaNodeProvider2['default'].parseTreeNode(n, '', defaultSlug);
                });
                resolve(response);
            })['catch'](function (e) {
                reject(e);
            });
        });
    };

    SearchApi.prototype.computePathPrefix = function computePathPrefix(scope) {
        var slug = this.pydio.user.getActiveRepositoryObject().getSlug();
        switch (scope) {
            case 'all':
                // All workspaces
                return '';
            case 'ws':
                // Current workspace
                return slug + '/';
            case 'folder':
            default:
                // Current folder
                return slug + this.pydio.getContextHolder().getContextNode().getPath();
        }
    };

    SearchApi.prototype.autoQuote = function autoQuote(text) {
        if (typeof text === "string" && text.indexOf(" ") > -1) {
            return "\"" + text + "\"";
        }
        return text;
    };

    return SearchApi;
})();

exports['default'] = SearchApi;
module.exports = exports['default'];
