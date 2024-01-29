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

import PydioWebSocket from 'pydio/http/websocket'
import ReconnectingWebSocket from 'reconnecting-websocket'

class ChatClient extends PydioWebSocket {

    subscriptions;
    /**
     *
     * @param pydioObject
     * @return {ChatClient}
     */
    static getInstance(pydioObject) {
        if (ChatClient._instance !== undefined) {
            return ChatClient._instance;
        } else {
            ChatClient._instance = new ChatClient(pydioObject);
            return ChatClient._instance;
        }
    }

    /**
     *
     * @param pydioObject {Pydio}
     */
    constructor(pydioObject) {
        super(pydioObject);
        this.currentRepo = pydioObject.repositoryId;
        this.subscriptions = {};
        this.rooms = {};
        this.roomInfos = {};
        this.open();
    }

    getIdentifier(roomType, objectId){
        return roomType + ':' + objectId;
    }

    getRoomInfoFromIdentifier(identifier){
        const [roomType, objectId] = identifier.split(':');
        return {roomType, objectId};
    }

    onRoomMessage(msg){
        if(msg){
            const room = msg['Room'];
            const identifier = this.getIdentifier(room.Type, room.RoomTypeObject);
            this.roomInfos[identifier] = room;
        }
    }

    /**
     *
     * @param roomType string
     * @param objectId string
     * @param messageHandler Function
     * @param roomUpdateHandler Function
     * @param retry Number
     */
    joinRoom(roomType, objectId, messageHandler, roomUpdateHandler, retry = 0){
        const identifier = this.getIdentifier(roomType, objectId);
        if (this.subscriptions[identifier]){
            let already = false;
            this.subscriptions[identifier].map(v=>{
                if(v.messageHandler === messageHandler){
                    already = true;
                }
            });
            if(!already){
                this.subscriptions[identifier].push({messageHandler, roomUpdateHandler});
            }
            return this.roomInfos[identifier];
        }
        if(this.connecting) {
            if (retry < 3){
                setTimeout(()=>{
                    //console.log('Connecting state... retrying now', objectId);
                    this.joinRoom(roomType, objectId, messageHandler, roomUpdateHandler, retry + 1)
                }, 1500);
                return null;
            }
        } else if(!this.connOpen) {
            this.open();
            setTimeout(()=>{
                //console.log('Not open... retrying now', objectId);
                this.joinRoom(roomType, objectId, messageHandler, roomUpdateHandler, retry + 1)
            }, 1500);
            return null;
        }
        //console.log('Now storing subscription for ', objectId);
        this.subscriptions[roomType + ':' + objectId] = [{messageHandler, roomUpdateHandler}];
        let message = {"@type" : "JOIN", "Room":{"Type":roomType, "RoomTypeObject":objectId}};
        this.ws.send(JSON.stringify(message));
        return this.roomInfos[identifier];
    }

    /**
     * Send a HISTORY request to receive existing messages in room
     * @param roomType
     * @param objectId
     * @param offset
     * @param limit
     * @param retry int
     */
    loadHistory(roomType, objectId, offset=0, limit=40, retry = 0){
        if(this.connecting) {
            if (retry < 3){
                setTimeout(()=>{this.loadHistory(roomType, objectId, offset, limit, retry + 1)}, 1500);
                return;
            }
        }
        let message = {
            "@type" : "HISTORY",
            Room:{"Type":roomType, "RoomTypeObject":objectId},
            Message:{
                Message:JSON.stringify({Offset:offset, Limit: limit}) // Use Message to pass additional data
            }
        };
        this.ws.send(JSON.stringify(message));
    }

    /**
     *
     * @param roomType
     * @param objectId
     * @param messageHandler Function
     */
    leaveRoom(roomType, objectId, messageHandler = undefined) {
        let keep = false;
        const identifier = this.getIdentifier(roomType, objectId);
        //console.log('Leaving room: ' + objectId);
        if(this.subscriptions[identifier]){
            if(messageHandler){
                // Just remove this handler
                this.subscriptions[identifier] = this.subscriptions[identifier].filter(v => {
                    return v.messageHandler !== messageHandler
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
        if(!keep){
            Object.keys(this.rooms).map(k => {
                if (this.rooms[k] === identifier) {
                    delete this.rooms[k];
                }
            });
            if(this.connOpen) {
                let message = {"@type" : "LEAVE", "Room":{"Type":roomType, "RoomTypeObject":objectId}};
                this.ws.send(JSON.stringify(message));
            }
        }
    }

    /**
     *
     * @param msg
     */
    handleMessageReceived(msg){
        const data = JSON.parse(msg['data']);
        if(data["@type"] === 'ROOM_UPDATE') {
            const identifier = this.getIdentifier(data.Room.Type, data.Room.RoomTypeObject);
            if (this.subscriptions[identifier]) {
                if (!this.rooms[data.Room.Uuid]) {
                    this.rooms[data.Room.Uuid] = identifier;
                }
                this.onRoomMessage(data);
                this.subscriptions[identifier].map(v => {
                    if (v.roomUpdateHandler) {
                        try {
                            v.roomUpdateHandler(data);
                        } catch (e) {
                        }
                    }
                });
            }
        } else {
            let deleteMsg = false;
            let wsMessage;
            if (data["@type"] === 'DELETE_MSG') {
                deleteMsg = true;
                wsMessage = data["Message"]
            } else {
                wsMessage = data;
            }
            if (wsMessage.RoomUuid && this.rooms[wsMessage.RoomUuid]) {
                let subs = this.subscriptions[this.rooms[wsMessage.RoomUuid]];
                const withRoomUpdateHandler = subs.filter(v => v.roomUpdateHandler);
                // If there is a subscriber with a roomUpdateHandler, it is an open room,
                // so send message only to that one. The ones without are just notification listeners
                if(withRoomUpdateHandler.length){
                    subs = withRoomUpdateHandler
                }
                subs.map(v => {
                    try{
                        v.messageHandler(wsMessage, deleteMsg);
                    }catch(e){}
                })
            } else {
                console.log('Cannot find room ' + wsMessage.RoomUuid, this.rooms)
            }
        }
    }

    /**
     *
     * @param message
     */
    send(message){
        this.ws.send(message);
    }

    open(){
        this.close();
        if (!this.currentRepo) {
            return;
        }
        let wsPath = this.pydio.Parameters.get("ENDPOINT_WEBSOCKET").replace('/event', '/chat');
        if(wsPath && wsPath[0] === '/'){
            wsPath = wsPath.substr(1)
        }
        const location = this.pydio.getFrontendUrl();
        const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
        const url = `${protocol}://${location.host}/` + wsPath;
        this.ws = new ReconnectingWebSocket(url, [], {
            maxReconnectionDelay: 60000,
            reconnectionDelayGrowFactor: 1.6,
            maxRetries: 10
        });

        this.connecting = true;

        this.ws.addEventListener('open', () => {
            PydioWebSocket.subscribeJWT(this.ws).then(()=>{
                this.connecting = false;
                this.connOpen = true;
            }).catch(()=>{
                this.connecting = false;
                this.connOpen = false;
            });
        });
        this.ws.addEventListener('message', (msg) => {
            this.handleMessageReceived(msg);
        });
        this.ws.addEventListener('close', (event) => {
            this.connOpen = false;
            this.connecting = false;
            PydioWebSocket.logClose(event)
        });
        this.ws.addEventListener('error', (error) => {
            if (error.code === 'EHOSTDOWN') {
                console.error('WebSocket maxRetries reached, host is down!');
            }
        });
        // Send pings on subscriptions
        this.hbInterval = setInterval(()=>this.heartbeat(), 15 * 1000);
        window.onbeforeunload = () => {
            this.close();
        }
    }

    close(){
        if(this.ws === null) {
            return;
        }
        Object.keys(this.subscriptions).map(k => {
            const {roomType, objectId} = this.getRoomInfoFromIdentifier(k);
            this.leaveRoom(roomType, objectId);
        });
        this.ws.close(1000, 'Closing', {keepClosed: true});
        // Close regular ping
        if(this.hbInterval){
            clearInterval(this.hbInterval)
        }
    }

    heartbeat() {
        Object.keys(this.subscriptions).map(k => {
            const {roomType, objectId} = this.getRoomInfoFromIdentifier(k);
            let message = {
                "@type" : "JOIN",
                "Room":{"Type":roomType, "RoomTypeObject":objectId},
                "Message":{"Message": "PING"}
            };
            try {
                this.ws.send(JSON.stringify(message));
            } catch(e){}
        });
    }

}


export {ChatClient as default};