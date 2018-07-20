'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioModelMetaNodeProvider = require('pydio/model/meta-node-provider');

var _pydioModelMetaNodeProvider2 = _interopRequireDefault(_pydioModelMetaNodeProvider);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var SearchApi = (function () {
    function SearchApi(pydio) {
        _classCallCheck(this, SearchApi);

        this.api = new _pydioHttpRestApi.SearchServiceApi(_pydioHttpApi2['default'].getRestClient());
        this.pydio = pydio;
    }

    SearchApi.prototype.search = function search(values, scope, limit) {
        var _this = this;

        var query = new _pydioHttpRestApi.TreeQuery();
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
                        freeQueries["Meta." + k.replace('ajxp_meta_', '')] = _this.autoQuote(value);
                    } else if (k === 'ajxp_mime') {
                        if (value === 'ajxp_folder') {
                            query.Type = 'COLLECTION';
                        } else {
                            query.Type = 'LEAF';
                            query.Extension = value;
                        }
                    } else if (k === 'basename') {
                        freeQueries['Basename'] = _this.autoQuote(value);
                    } else if (k === 'ajxp_modiftime' && value && value['from'] !== undefined && value['to'] !== undefined) {
                        query.MinDate = Math.floor(value['from'] / 1000) + '';
                        query.MaxDate = Math.floor(value['to'] / 1000) + '';
                        console.log(query.MinDate, query.MaxDate);
                    } else if (k === 'ajxp_bytesize' && value && value['from'] !== undefined && value['to'] !== undefined) {
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

        var request = new _pydioHttpRestApi.TreeSearchRequest();
        request.Query = query;
        request.Size = limit;

        var defaultSlug = this.pydio.user.getActiveRepositoryObject().getSlug();
        return new Promise(function (resolve, reject) {
            _this.api.nodes(request).then(function (response) {
                if (!response.Results) {
                    resolve([]);
                }
                var nodes = response.Results.map(function (n) {
                    return _pydioModelMetaNodeProvider2['default'].parseTreeNode(n, '', defaultSlug);
                });
                console.log(request, nodes);
                resolve(nodes);
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
