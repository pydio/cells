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

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _modelAjxpNode = require('../model/AjxpNode');

var _modelAjxpNode2 = _interopRequireDefault(_modelAjxpNode);

var _utilPathUtils = require('../util/PathUtils');

var _utilPathUtils2 = _interopRequireDefault(_utilPathUtils);

var _PydioApi = require('./PydioApi');

var _PydioApi2 = _interopRequireDefault(_PydioApi);

var _modelMetaNodeProvider = require('../model/MetaNodeProvider');

var _modelMetaNodeProvider2 = _interopRequireDefault(_modelMetaNodeProvider);

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

/**
 * WebSocket client
 */

var ReconnectingWebSocket = require('reconnecting-websocket');

var PydioWebSocket = (function () {

    /**
     *
     * @param pydioObject Pydio
     */

    function PydioWebSocket(pydioObject) {
        var _this = this;

        _classCallCheck(this, PydioWebSocket);

        this.pydio = pydioObject;

        this.connOpen = false;
        this.ws = null;
        this.reloadRepositoriesDebounced = _lodashDebounce2['default'](function () {
            _this.pydio.reloadRepositoriesList();
        }, 500);

        this.pydio.observe("repository_list_refreshed", (function (data) {

            var repoId = undefined;
            if (data.active) {
                repoId = data.active;
            } else if (this.pydio.repositoryId) {
                repoId = this.pydio.repositoryId;
            }
            if (!repoId) {
                this.close();
            } else if (!this.connOpen) {
                this.open();
            } else {
                this.refresh();
            }
        }).bind(this));
    }

    PydioWebSocket.prototype.isOpen = function isOpen() {
        return this.connOpen && this.ws !== null;
    };

    PydioWebSocket.prototype.close = function close() {
        if (!this.connOpen || this.ws === null) {
            return;
        }
        this.ws.close(1000, 'Closing', { keepClosed: true });
    };

    /**
     * Open a connection
     */

    PydioWebSocket.prototype.open = function open() {
        var _this2 = this;

        var wsPath = this.pydio.Parameters.get("ENDPOINT_WEBSOCKET");
        if (wsPath && wsPath[0] === '/') {
            wsPath = wsPath.substr(1);
        }
        var location = this.pydio.getFrontendUrl();
        var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
        var url = protocol + '://' + location.host + '/' + wsPath;
        this.ws = new ReconnectingWebSocket(url, [], {
            maxReconnectionDelay: 60000,
            reconnectionDelayGrowFactor: 1.6,
            maxRetries: 10
        });

        this.ws.addEventListener('open', function () {
            _this2.connOpen = true;
            PydioWebSocket.subscribeJWT(_this2.ws, true);
        });
        this.ws.addEventListener('message', this.parseWebsocketMessage.bind(this));
        this.ws.addEventListener('close', function (event) {
            _this2.connOpen = false;
            PydioWebSocket.logClose(event);
        });
        this.ws.addEventListener('error', function (error) {
            if (error.code === 'EHOSTDOWN') {
                console.error('WebSocket maxRetries reached, host is down!');
            }
        });
    };

    PydioWebSocket.prototype.refresh = function refresh() {
        if (this.ws) {
            PydioWebSocket.subscribeJWT(this.ws);
        } else {
            this.open();
        }
    };

    PydioWebSocket.prototype.parseWebsocketMessage = function parseWebsocketMessage(msg) {
        var dm = this.pydio.getContextHolder();
        var event = JSON.parse(msg.data);
        if (event === "dump") {
            return;
        }
        if (event['@type']) {
            this.pydio.fire("websocket_event:" + event['@type'], event);
        }
        if (event['@type'] && event['@type'] === "idm") {
            this.reloadRepositoriesDebounced();
            return;
        }
        if (event['TaskUpdated'] && event['Job']) {
            this.pydio.fire("task_message", event);
            return;
        }
        if (!event.Type && event.Target) {
            event.Type = "CREATE";
        }
        var target = undefined;
        var currentRepoId = this.pydio.user.getActiveRepository();
        if (!this.pydio.user.repositories.has(currentRepoId)) {
            return;
        }
        var currentRepoSlug = this.pydio.user.repositories.get(currentRepoId).getSlug();
        switch (event.Type) {
            case "CREATE":
                target = PydioWebSocket.parseEventNode(event.Target, currentRepoId, currentRepoSlug);
                if (target === null) {
                    return;
                }
                if (target.getPath() === "" || target.getPath() === "/") {
                    // This is probably a new cell folder
                    break;
                }
                dm.addNode(target, false);
                break;
            case "UPDATE_PATH":
            case "UPDATE_META":
            case "UPDATE_CONTENT":
                target = PydioWebSocket.parseEventNode(event.Target, currentRepoId, currentRepoSlug);
                if (target === null) {
                    return;
                }
                if (event.Source) {
                    var _source = PydioWebSocket.parseEventNode(event.Source, currentRepoId, currentRepoSlug);
                    target.getMetadata().set("original_path", _source.getPath());
                } else {
                    target.getMetadata().set("original_path", target.getPath());
                }
                dm.updateNode(target, false);
                break;
            case "DELETE":
                var source = PydioWebSocket.parseEventNode(event.Source, currentRepoId, currentRepoSlug);
                if (source === null) {
                    return;
                }
                dm.removeNodeByPath('/' + source.getPath());
                break;
            default:
                break;
        }
    };

    PydioWebSocket.parseEventNode = function parseEventNode(obj, currentRepoId, currentRepoSlug) {
        if (!obj) {
            return null;
        }
        var wsId = JSON.parse(obj.MetaStore.EventWorkspaceId);
        if (wsId !== currentRepoId) {
            return null;
        }
        return _modelMetaNodeProvider2['default'].parseTreeNode(obj, currentRepoSlug);
    };

    /**
     *
     * @param ws {ReconnectingWebSocket}
     * @param withRetries bool
     * @param retry integer
     * @return {*|Promise.<string>}
     */

    PydioWebSocket.subscribeJWT = function subscribeJWT(ws) {
        var withRetries = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
        var retry = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

        return _PydioApi2['default'].getRestClient().getOrUpdateJwt().then(function (jwt) {
            if (!jwt && withRetries && retry < 3) {
                console.log('WebSocket connected but without valid JWT, retry in 10 seconds');
                setTimeout(function () {
                    PydioWebSocket.subscribeJWT(ws, withRetries, retry + 1);
                }, 10000);
                return;
            }
            ws.send(JSON.stringify({
                "@type": "subscribe",
                "jwt": jwt
            }));
        });
    };

    PydioWebSocket.logClose = function logClose(event) {
        var reason = undefined;
        switch (event.code) {
            case 1000:
                reason = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
                break;
            case 1001:
                reason = "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
                break;
            case 1002:
                reason = "An endpoint is terminating the connection due to a protocol error";
                break;
            case 1003:
                reason = "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
                break;
            case 1004:
                reason = "Reserved. The specific meaning might be defined in the future.";
                break;
            case 1005:
                reason = "No status code was actually present.";
                break;
            case 1006:
                reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
                break;
            case 1007:
                reason = "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
                break;
            case 1008:
                reason = "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";
                break;
            case 1009:
                reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
                break;
            case 1010:
                // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
                reason = "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. Specifically, the extensions that are needed are: " + event.reason;
                break;
            case 1011:
                reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
                break;
            case 1015:
                reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
                break;
            default:
                reason = "Unknown reason";
                break;
        }
        if (event.code > 1000 && console) {
            console.log("WebSocket Closed Connection:" + reason + " (code " + event.code + ")");
        }
    };

    return PydioWebSocket;
})();

exports['default'] = PydioWebSocket;
module.exports = exports['default'];
