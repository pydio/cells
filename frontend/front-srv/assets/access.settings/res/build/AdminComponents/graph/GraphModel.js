/**
 * PROTO FOR one point for a graph
 message TimeRangeResult{
    // a label for this time range
    string Name = 1;
    // begin timestamp
    int64 Start = 2;
    // end timestamp
    int64 End = 3;
    // nb of occurences found within this range
    int Count = 4;
    // a score between 1 and 100 that gives the relevance of this result:
    // if End > now, we ponderate the returned count with the duration of the last time range
    // for instance for a hour range if now is 6PM, last count will be
    // multiplied by 4/3 and have a relevance of 75.
    // Relevance will be almost always equals to 100
    int Relevance = 5;
}
 */
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

var _pydioHttpRestApi = require('pydio/http/rest-api');

var GraphModel = (function () {
    _createClass(GraphModel, null, [{
        key: 'makeStubResult',
        value: function makeStubResult(name, hoursFrom, refTime, frequency, count) {
            var relevance = arguments.length <= 5 || arguments[5] === undefined ? 100 : arguments[5];

            var refUnix = undefined;
            if (refTime === undefined) {
                refUnix = Math.floor(Date.now() / 1000);
            } else {
                refUnix = Math.floor(refTime / 1000);
            }
            var start = refUnix - hoursFrom * 60 * 60 * (frequency === 'D' ? 24 : 1);
            var end = refUnix - (hoursFrom + 1) * 60 * 60 * (frequency === 'D' ? 24 : 1);
            return { Name: name, Start: start, End: end, Count: count, Relevance: relevance };
        }
    }, {
        key: 'stubData',
        value: function stubData(frequency, refTime) {
            return [GraphModel.makeStubResult("Upload", 1, refTime, frequency, 10), GraphModel.makeStubResult("Upload", 2, refTime, frequency, 5), GraphModel.makeStubResult("Upload", 3, refTime, frequency, 2), GraphModel.makeStubResult("Upload", 4, refTime, frequency, 40), GraphModel.makeStubResult("Upload", 5, refTime, frequency, 30), GraphModel.makeStubResult("Upload", 6, refTime, frequency, 0), GraphModel.makeStubResult("Upload", 7, refTime, frequency, 10), GraphModel.makeStubResult("Upload", 8, refTime, frequency, 12), GraphModel.makeStubResult("Upload", 9, refTime, frequency, 12), GraphModel.makeStubResult("Upload", 10, refTime, frequency, 12)];
        }
    }, {
        key: 'stubLinks',
        value: function stubLinks(frequency, refTime) {
            var refUnix = undefined;
            if (refTime === undefined) {
                refUnix = Math.floor(Date.now() / 1000);
            } else {
                refUnix = Math.floor(refTime / 1000);
            }
            var links = [];
            if (refTime !== undefined) {
                links.push({ count: '10', cursor: '10', rel: 'previous' });
            }
            links.push({ count: '10', cursor: '10', rel: 'next' });
            return links;
        }
    }, {
        key: 'queryNameToMsgId',
        value: function queryNameToMsgId(queryName) {
            return ({
                LoginSuccess: "1",
                LoginFailed: "2",
                NodeCreate: "11",
                NodeRead: "12",
                NodeList: "13",
                NodeUpdate: "14",
                NodeDelete: "15",
                ObjectGet: "21",
                ObjectPut: "22",
                LinkCreated: "75"
            })[queryName];
        }
    }]);

    function GraphModel() {
        var stub = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        _classCallCheck(this, GraphModel);

        this.stub = stub;
    }

    /**
     *
     * @return {Promise<{labels: Array, points: Array}>}
     */

    _createClass(GraphModel, [{
        key: 'loadData',
        value: function loadData(queryName, frequency, refTime) {
            if (this.stub) {
                var data = GraphModel.stubData(frequency, refTime);
                var stubLinks = GraphModel.stubLinks(frequency, refTime);
                return Promise.resolve(this.parseData(data, stubLinks));
            } else {
                return _pydioHttpResourcesManager2['default'].loadClass('EnterpriseSDK').then(function (sdk) {
                    var api = new sdk.EnterpriseLogServiceApi(_pydioHttpApi2['default'].getRestClient());
                    var request = new sdk.LogTimeRangeRequest();
                    request.MsgId = GraphModel.queryNameToMsgId(queryName);
                    var refUnix = undefined;
                    if (refTime) {
                        refUnix = refTime;
                    } else {
                        refUnix = Math.floor(Date.now() / 1000);
                    }
                    request.RefTime = refUnix;
                    request.TimeRangeType = frequency;
                    return api.auditChartData(request).then(function (result) {
                        var labels = [],
                            points = [],
                            links = [];
                        if (result.Results) {
                            result.Results.map(function (res) {
                                labels.push(res.Name);
                                points.push(res.Count || 0);
                            });
                        }
                        if (result.Links) {
                            result.Links.map(function (link) {
                                links.push(link);
                            });
                        }
                        return { labels: labels, points: points, links: links };
                    });
                });
            }
        }

        /**
         *
         * @param data
         * @return {{labels: Array, points: Array}}
         */
    }, {
        key: 'parseData',
        value: function parseData(data, links) {
            var labels = [];
            var points = [];
            data.map(function (entry) {
                var start = entry.Start;
                var date = new Date(start * 1000).toDateString();
                labels.push(date);
                points.push(entry.Count);
            });
            return { labels: labels, points: points, links: links };
        }
    }]);

    return GraphModel;
})();

exports['default'] = GraphModel;
module.exports = exports['default'];
