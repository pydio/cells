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

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydioHttpWebsocket = require('pydio/http/websocket');

var _pydioHttpWebsocket2 = _interopRequireDefault(_pydioHttpWebsocket);

var _reconnectingWebsocket = require('reconnecting-websocket');

var _reconnectingWebsocket2 = _interopRequireDefault(_reconnectingWebsocket);

var ChatClient = (function (_PydioWebSocket) {
    _inherits(ChatClient, _PydioWebSocket);

    /**
     *
     * @param pydioObject
     * @return {ChatClient}
     */

    ChatClient.getInstance = function getInstance(pydioObject) {
        if (ChatClient._instance !== undefined) {
            return ChatClient._instance;
        } else {
            ChatClient._instance = new ChatClient(pydioObject);
            return ChatClient._instance;
        }
    };

    /**
     *
     * @param pydioObject {Pydio}
     */

    function ChatClient(pydioObject) {
        _classCallCheck(this, ChatClient);

        _PydioWebSocket.call(this, pydioObject);
        this.currentRepo = pydioObject.repositoryId;
        this.subscriptions = {};
        this.rooms = {};
        this.roomInfos = {};
        this.open();
    }

    ChatClient.prototype.getIdentifier = function getIdentifier(roomType, objectId) {
        return roomType + ':' + objectId;
    };

    ChatClient.prototype.getRoomInfoFromIdentifier = function getRoomInfoFromIdentifier(identifier) {
        var _identifier$split = identifier.split(':');

        var roomType = _identifier$split[0];
        var objectId = _identifier$split[1];

        return { roomType: roomType, objectId: objectId };
    };

    ChatClient.prototype.onRoomMessage = function onRoomMessage(msg) {
        if (msg) {
            var room = msg['Room'];
            var identifier = this.getIdentifier(room.Type, room.RoomTypeObject);
            this.roomInfos[identifier] = room;
        }
    };

    /**
     *
     * @param roomType string
     * @param objectId string
     * @param messageHandler Function
     * @param roomUpdateHandler Function
     * @param retry Number
     */

    ChatClient.prototype.joinRoom = function joinRoom(roomType, objectId, messageHandler, roomUpdateHandler) {
        var _this = this;

        var retry = arguments.length <= 4 || arguments[4] === undefined ? 0 : arguments[4];

        var identifier = this.getIdentifier(roomType, objectId);
        if (this.subscriptions[identifier]) {
            var already = false;
            this.subscriptions[identifier].map(function (v) {
                if (v.messageHandler === messageHandler) {
                    already = true;
                }
            });
            if (!already) {
                this.subscriptions[identifier].push({ messageHandler: messageHandler, roomUpdateHandler: roomUpdateHandler });
            }
            return this.roomInfos[identifier];
        }
        if (this.connecting) {
            if (retry < 3) {
                setTimeout(function () {
                    //console.log('Connecting state... retrying now', objectId);
                    _this.joinRoom(roomType, objectId, messageHandler, roomUpdateHandler, retry + 1);
                }, 1500);
                return null;
            }
        } else if (!this.connOpen) {
            this.open();
            setTimeout(function () {
                //console.log('Not open... retrying now', objectId);
                _this.joinRoom(roomType, objectId, messageHandler, roomUpdateHandler, retry + 1);
            }, 1500);
            return null;
        }
        //console.log('Now storing subscription for ', objectId);
        this.subscriptions[roomType + ':' + objectId] = [{ messageHandler: messageHandler, roomUpdateHandler: roomUpdateHandler }];
        var message = { "@type": "JOIN", "Room": { "Type": roomType, "RoomTypeObject": objectId } };
        this.ws.send(JSON.stringify(message));
        return this.roomInfos[identifier];
    };

    /**
     * Send a HISTORY request to receive existing messages in room
     * @param roomType
     * @param objectId
     * @param retry int
     */

    ChatClient.prototype.loadHistory = function loadHistory(roomType, objectId) {
        var _this2 = this;

        var retry = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

        if (this.connecting) {
            if (retry < 3) {
                setTimeout(function () {
                    _this2.loadHistory(roomType, objectId, retry + 1);
                }, 1500);
                return;
            }
        }
        var message = { "@type": "HISTORY", "Room": { "Type": roomType, "RoomTypeObject": objectId } };
        this.ws.send(JSON.stringify(message));
    };

    /**
     *
     * @param roomType
     * @param objectId
     * @param messageHandler Function
     */

    ChatClient.prototype.leaveRoom = function leaveRoom(roomType, objectId) {
        var _this3 = this;

        var messageHandler = arguments.length <= 2 || arguments[2] === undefined ? undefined : arguments[2];

        var keep = false;
        var identifier = this.getIdentifier(roomType, objectId);
        //console.log('Leaving room: ' + objectId);
        if (this.subscriptions[identifier]) {
            if (messageHandler) {
                // Just remove this handler
                this.subscriptions[identifier] = this.subscriptions[identifier].filter(function (v) {
                    return v.messageHandler !== messageHandler;
                });
                if (this.subscriptions[identifier].length) {
                    keep = true;
                } else {
                    delete this.subscriptions[identifier];
                }
            } else {
                delete this.subscriptions[identifier];
            }
        }
        if (!keep) {
            Object.keys(this.rooms).map(function (k) {
                if (_this3.rooms[k] === identifier) {
                    delete _this3.rooms[k];
                }
            });
            if (this.connOpen) {
                var message = { "@type": "LEAVE", "Room": { "Type": roomType, "RoomTypeObject": objectId } };
                this.ws.send(JSON.stringify(message));
            }
        }
    };

    /**
     *
     * @param msg
     */

    ChatClient.prototype.handleMessageReceived = function handleMessageReceived(msg) {
        var _this4 = this;

        var data = JSON.parse(msg['data']);
        if (data["@type"] === 'ROOM_UPDATE') {
            var identifier = this.getIdentifier(data.Room.Type, data.Room.RoomTypeObject);
            if (this.subscriptions[identifier]) {
                if (!this.rooms[data.Room.Uuid]) {
                    this.rooms[data.Room.Uuid] = identifier;
                }
                this.onRoomMessage(data);
                this.subscriptions[identifier].map(function (v) {
                    if (v.roomUpdateHandler) {
                        try {
                            v.roomUpdateHandler(data);
                        } catch (e) {}
                    }
                });
            }
        } else {
            (function () {
                var deleteMsg = false;
                var wsMessage = undefined;
                if (data["@type"] === 'DELETE_MSG') {
                    deleteMsg = true;
                    wsMessage = data["Message"];
                } else {
                    wsMessage = data;
                }
                if (wsMessage.RoomUuid && _this4.rooms[wsMessage.RoomUuid]) {
                    var subs = _this4.subscriptions[_this4.rooms[wsMessage.RoomUuid]];
                    var withRoomUpdateHandler = subs.filter(function (v) {
                        return v.roomUpdateHandler;
                    });
                    // If there is a subscriber with a roomUpdateHandler, it is an open room,
                    // so send message only to that one. The ones without are just notification listeners
                    if (withRoomUpdateHandler.length) {
                        subs = withRoomUpdateHandler;
                    }
                    subs.map(function (v) {
                        try {
                            v.messageHandler(wsMessage, deleteMsg);
                        } catch (e) {}
                    });
                }
            })();
        }
    };

    /**
     *
     * @param message
     */

    ChatClient.prototype.send = function send(message) {
        this.ws.send(message);
    };

    ChatClient.prototype.open = function open() {
        var _this5 = this;

        this.close();
        if (!this.currentRepo) {
            return;
        }
        var wsPath = this.pydio.Parameters.get("ENDPOINT_WEBSOCKET").replace('/event', '/chat');
        if (wsPath && wsPath[0] === '/') {
            wsPath = wsPath.substr(1);
        }
        var location = this.pydio.getFrontendUrl();
        var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
        var url = protocol + '://' + location.host + '/' + wsPath;
        this.ws = new _reconnectingWebsocket2['default'](url, [], {
            maxReconnectionDelay: 60000,
            reconnectionDelayGrowFactor: 1.6,
            maxRetries: 10
        });

        this.connecting = true;

        this.ws.addEventListener('open', function () {
            _pydioHttpWebsocket2['default'].subscribeJWT(_this5.ws).then(function () {
                _this5.connecting = false;
                _this5.connOpen = true;
            })['catch'](function () {
                _this5.connecting = false;
                _this5.connOpen = false;
            });
        });
        this.ws.addEventListener('message', function (msg) {
            _this5.handleMessageReceived(msg);
        });
        this.ws.addEventListener('close', function (event) {
            _this5.connOpen = false;
            _this5.connecting = false;
            _pydioHttpWebsocket2['default'].logClose(event);
        });
        this.ws.addEventListener('error', function (error) {
            if (error.code === 'EHOSTDOWN') {
                console.error('WebSocket maxRetries reached, host is down!');
            }
        });
        // Send pings on subscriptions
        this.hbInterval = setInterval(function () {
            return _this5.heartbeat();
        }, 15 * 1000);
        window.onbeforeunload = function () {
            _this5.close();
        };
    };

    ChatClient.prototype.close = function close() {
        var _this6 = this;

        if (this.ws === null) {
            return;
        }
        Object.keys(this.subscriptions).map(function (k) {
            var _getRoomInfoFromIdentifier = _this6.getRoomInfoFromIdentifier(k);

            var roomType = _getRoomInfoFromIdentifier.roomType;
            var objectId = _getRoomInfoFromIdentifier.objectId;

            _this6.leaveRoom(roomType, objectId);
        });
        this.ws.close(1000, 'Closing', { keepClosed: true });
        // Close regular ping
        if (this.hbInterval) {
            clearInterval(this.hbInterval);
        }
    };

    ChatClient.prototype.heartbeat = function heartbeat() {
        var _this7 = this;

        Object.keys(this.subscriptions).map(function (k) {
            var _getRoomInfoFromIdentifier2 = _this7.getRoomInfoFromIdentifier(k);

            var roomType = _getRoomInfoFromIdentifier2.roomType;
            var objectId = _getRoomInfoFromIdentifier2.objectId;

            var message = {
                "@type": "JOIN",
                "Room": { "Type": roomType, "RoomTypeObject": objectId },
                "Message": { "Message": "PING" }
            };
            try {
                _this7.ws.send(JSON.stringify(message));
            } catch (e) {}
        });
    };

    return ChatClient;
})(_pydioHttpWebsocket2['default']);

exports['default'] = ChatClient;
module.exports = exports['default'];
