/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _pydioModelMetaNodeProvider = require('pydio/model/meta-node-provider');

var _pydioModelMetaNodeProvider2 = _interopRequireDefault(_pydioModelMetaNodeProvider);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _cellsSdk = require('cells-sdk');

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib.PydioContextConsumer;
var moment = _Pydio$requireLib.moment;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('workspaces');

var FilePreview = _Pydio$requireLib2.FilePreview;

var _Pydio$requireLib3 = _pydio2['default'].requireLib('PydioActivityStreams');

var ASClient = _Pydio$requireLib3.ASClient;

var Loader = (function () {
    function Loader(pydio, stater) {
        _classCallCheck(this, Loader);

        this.pydio = pydio;
        this.stater = stater;
        this.metaProvider = new _pydioModelMetaNodeProvider2['default']();
    }

    _createClass(Loader, [{
        key: 'load',
        value: function load() {
            var _this = this;

            var allLoaders = [this.loadActivities(), this.loadBookmarks(), this.workspacesAsNodes()];
            return Promise.all(allLoaders).then(function (results) {
                var allResolvers = [];
                var allNodes = [];
                var allKeys = {};
                results.map(function (resolvers) {
                    allResolvers = [].concat(_toConsumableArray(allResolvers), _toConsumableArray(resolvers));
                });
                return _this.resolveNext(allResolvers, allNodes, allKeys, 8);
            });
        }
    }, {
        key: 'resolveNext',
        value: function resolveNext(allResolvers, allNodes, allKeys) {
            var _this2 = this;

            var max = arguments.length <= 3 || arguments[3] === undefined ? 8 : arguments[3];

            if (allNodes.length > max || !allResolvers.length) {
                return Promise.resolve(allNodes);
            }
            var next = allResolvers.shift();
            return new Promise(next).then(function (node) {
                if (node && !allKeys[node.getMetadata().get("uuid")]) {
                    allNodes.push(node);
                    allKeys[node.getMetadata().get("uuid")] = node.getMetadata().get("uuid");
                    _this2.stater.setState({ nodes: [].concat(_toConsumableArray(allNodes)), loading: false });
                }
                return _this2.resolveNext(allResolvers, allNodes, allKeys, max);
            });
        }
    }, {
        key: 'loadBookmarks',
        value: function loadBookmarks() {
            var _this3 = this;

            var api = new _cellsSdk.UserMetaServiceApi(_pydioHttpApi2['default'].getRestClient());
            return new Promise(function (resolve) {
                api.userBookmarks(new _cellsSdk.RestUserBookmarksRequest()).then(function (collection) {
                    var nodes = [];
                    if (!collection.Nodes) {
                        resolve([]);
                        return;
                    }
                    collection.Nodes.slice(0, 4).forEach(function (n) {
                        if (!n.AppearsIn) {
                            return;
                        }
                        var path = n.AppearsIn[0].Path;
                        if (!path) {
                            path = '/';
                        }
                        var fakeNode = new _pydioModelNode2['default'](path, n.Type === 'LEAF');
                        fakeNode.getMetadata().set('repository_id', n.AppearsIn[0].WsUuid);
                        nodes.push(function (resolve1) {
                            _this3.metaProvider.refreshNodeAndReplace(fakeNode, function (freshNode) {
                                freshNode.getMetadata().set('card_legend', 'Bookmarked');
                                freshNode.getMetadata().set('repository_id', n.AppearsIn[0].WsUuid);
                                resolve1(freshNode);
                            }, function () {
                                resolve1(null);
                            });
                        });
                    });
                    resolve(nodes);
                });
            });
        }
    }, {
        key: 'loadActivities',
        value: function loadActivities() {
            var _this4 = this;

            return new Promise(function (resolve) {
                ASClient.loadActivityStreams('USER_ID', _this4.pydio.user.id, 'outbox', 'ACTOR', 0, 20).then(function (json) {
                    if (!json.items) {
                        resolve([]);
                        return;
                    }
                    var nodes = [];
                    json.items.filter(function (a) {
                        return !!a.object;
                    }).forEach(function (activity) {
                        var mom = moment(activity.updated);
                        var n = _this4.nodeFromActivityObject(activity.object);
                        if (n) {
                            nodes.push(function (resolve1) {
                                var wsId = n.getMetadata().get('repository_id');
                                var wsLabel = n.getMetadata().get('repository_label');
                                _this4.metaProvider.refreshNodeAndReplace(n, function (freshNode) {
                                    freshNode.getMetadata().set('repository_id', wsId);
                                    if (freshNode.getPath() === '' || freshNode.getPath() === '/') {
                                        freshNode.setLabel(wsLabel);
                                    }
                                    freshNode.getMetadata().set('card_legend', mom.fromNow());
                                    resolve1(freshNode);
                                }, function () {
                                    resolve1(null);
                                });
                            });
                        }
                    });
                    resolve(nodes);
                })['catch'](function (msg) {
                    resolve([]);
                });
            });
        }
    }, {
        key: 'workspacesAsNodes',
        value: function workspacesAsNodes() {
            var _this5 = this;

            var ws = [];
            var repos = [];
            this.pydio.user.getRepositoriesList().forEach(function (repo) {
                repos.push(repo);
            });
            repos.slice(0, 10).forEach(function (repoObject) {
                if (repoObject.getId() === 'homepage' || repoObject.getId() === 'settings') {
                    return;
                }
                var node = new _pydioModelNode2['default']('/', false, repoObject.getLabel());
                var fontIcon = 'folder';
                var legend = 'Workspace';
                if (repoObject.getRepositoryType() === "workspace-personal") {
                    fontIcon = 'folder-account';
                } else if (repoObject.getRepositoryType() === "cell") {
                    fontIcon = 'icomoon-cells';
                    legend = 'Cell';
                }
                ws.push(function (resolve) {
                    node.getMetadata().set("repository_id", repoObject.getId());
                    _this5.metaProvider.refreshNodeAndReplace(node, function (freshNode) {
                        freshNode.setLabel(repoObject.getLabel());
                        freshNode.getMetadata().set("repository_id", repoObject.getId());
                        freshNode.getMetadata().set("card_legend", legend);
                        freshNode.getMetadata().set("fonticon", fontIcon);
                        resolve(freshNode);
                    }, function () {
                        resolve(null);
                    });
                });
            });
            return Promise.resolve(ws);
        }
    }, {
        key: 'nodeFromActivityObject',
        value: function nodeFromActivityObject(object) {
            if (!object.partOf || !object.partOf.items || !object.partOf.items.length) {
                return null;
            }
            for (var i = 0; i < object.partOf.items.length; i++) {
                var ws = object.partOf.items[i];
                // Remove slug part
                var paths = ws.rel.split('/');
                paths.shift();
                var relPath = paths.join('/');
                var root = false;
                var label = _pydioUtilPath2['default'].getBasename(relPath);
                if (!relPath) {
                    root = true;
                    relPath = "/";
                    label = ws.name;
                }
                var node = new _pydioModelNode2['default'](relPath, object.type === 'Document', label);
                if (root) {
                    node.setRoot(true);
                }
                node.getMetadata().set('repository_id', ws.id);
                node.getMetadata().set('repository_label', ws.name);
                return node;
            }
            return null;
        }
    }]);

    return Loader;
})();

var RecentCard = (function (_React$Component) {
    _inherits(RecentCard, _React$Component);

    function RecentCard(props) {
        _classCallCheck(this, RecentCard);

        _get(Object.getPrototypeOf(RecentCard.prototype), 'constructor', this).call(this, props);
        this.state = { opacity: 0 };
    }

    _createClass(RecentCard, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this6 = this;

            setTimeout(function () {
                _this6.setState({ opacity: 1 });
            }, 200);
        }
    }, {
        key: 'render',
        value: function render() {
            var opacity = this.state.opacity;

            var styles = {
                paper: {
                    width: 120, height: 140, margin: 16, display: 'flex', flexDirection: 'column', cursor: 'pointer',
                    alignItems: 'center', textAlign: 'center',
                    opacity: opacity,
                    transition: 'all 1000ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'
                },
                preview: {
                    boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
                    borderRadius: '50%',
                    width: 90,
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    display: 'flex'
                },
                label: { fontSize: 14, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' },
                title: { fontSize: 14, marginTop: 10 },
                legend: { fontSize: 11, fontWeight: 500, color: '#9E9E9E' }
            };

            var _props = this.props;
            var title = _props.title;
            var legend = _props.legend;
            var node = _props.node;
            var pydio = _props.pydio;

            return _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 0, style: styles.paper, onClick: function () {
                        pydio.goTo(node);
                    } },
                node && _react2['default'].createElement(FilePreview, { node: node, style: styles.preview, mimeFontStyle: { fontSize: 40 }, loadThumbnail: true }),
                _react2['default'].createElement(
                    'div',
                    { style: _extends({}, styles.label, styles.title) },
                    title
                ),
                _react2['default'].createElement(
                    'div',
                    { style: _extends({}, styles.label, styles.legend) },
                    legend
                )
            );
        }
    }]);

    return RecentCard;
})(_react2['default'].Component);

var SmartRecents = (function (_React$Component2) {
    _inherits(SmartRecents, _React$Component2);

    function SmartRecents(props) {
        _classCallCheck(this, SmartRecents);

        _get(Object.getPrototypeOf(SmartRecents.prototype), 'constructor', this).call(this, props);
        this.loader = new Loader(props.pydio, this);
        this.state = { nodes: [], loading: false };
    }

    _createClass(SmartRecents, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this7 = this;

            this.setState({ loading: true });
            this.loader.load().then(function (nodes) {
                _this7.setState({ nodes: nodes, loading: false });
            })['catch'](function () {
                _this7.setState({ loading: false });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var pydio = _props2.pydio;
            var style = _props2.style;
            var _state = this.state;
            var nodes = _state.nodes;
            var loading = _state.loading;

            if (!pydio.user || pydio.user.lock) {
                return _react2['default'].createElement('div', null);
            }
            var keys = {};
            var cards = [];
            nodes.forEach(function (node) {
                var k = node.getMetadata().get("uuid");
                if (keys[k] || cards.length >= 8) {
                    return;
                }
                keys[k] = k;
                cards.push(_react2['default'].createElement(RecentCard, {
                    key: k,
                    pydio: pydio,
                    node: node,
                    title: node.getLabel(),
                    legend: node.getMetadata().get('card_legend')
                }));
            });

            return _react2['default'].createElement(
                'div',
                { style: _extends({ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }, style) },
                loading && !cards.length && _react2['default'].createElement(
                    'div',
                    { style: { width: 32, paddingTop: 120 } },
                    _react2['default'].createElement(_materialUi.CircularProgress, { size: 30, thickness: 1.5 })
                ),
                cards
            );
        }
    }]);

    return SmartRecents;
})(_react2['default'].Component);

exports['default'] = SmartRecents = PydioContextConsumer(SmartRecents);
exports['default'] = SmartRecents;
module.exports = exports['default'];
