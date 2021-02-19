'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _ChatClient = require('./ChatClient');

var _ChatClient2 = _interopRequireDefault(_ChatClient);

var _Message = require('./Message');

var _Message2 = _interopRequireDefault(_Message);

var _viewsEmptyStateView = require('../views/EmptyStateView');

var _viewsEmptyStateView2 = _interopRequireDefault(_viewsEmptyStateView);

var _materialUi = require('material-ui');

var _ChatUsers = require('./ChatUsers');

var _ChatUsers2 = _interopRequireDefault(_ChatUsers);

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib.PydioContextConsumer;
var moment = _Pydio$requireLib.moment;

var LoadSize = 40;

var Chat = (function (_React$Component) {
    _inherits(Chat, _React$Component);

    function Chat(props) {
        _classCallCheck(this, Chat);

        _React$Component.call(this, props);
        this.client = null;
        this.state = { messages: [], room: null, value: "" };
        this._newMessageListener = this.onNewMessage.bind(this);
    }

    Chat.prototype.componentDidMount = function componentDidMount() {
        this.join(this.props.roomType, this.props.roomObjectId);
    };

    Chat.prototype.componentWillUnmount = function componentWillUnmount() {
        this.stop();
    };

    Chat.prototype.componentDidUpdate = function componentDidUpdate(prevProps, prevState) {
        if (prevState.messages.length <= this.state.messages.length) {
            var prevLastStamp = prevState.messages.length > 0 ? parseFloat(prevState.messages[prevState.messages.length - 1].Timestamp) : 0;
            var newLastStamp = this.state.messages.length > 0 ? parseFloat(this.state.messages[this.state.messages.length - 1].Timestamp) : 0;
            if (newLastStamp > prevLastStamp) {
                this.refs.comments.scrollTop = 100000;
            }
        }
    };

    Chat.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
        var pydio = nextProps.pydio;
        var roomType = nextProps.roomType;
        var roomObjectId = nextProps.roomObjectId;

        if (roomType !== this.props.roomType || roomObjectId !== this.props.roomObjectId) {
            if (this.client) {
                this.client.leaveRoom(this.props.roomType, this.props.roomObjectId, this._newMessageListener);
            }
            this.setState({ messages: [], room: null, value: "" });
            if (roomType && roomObjectId) {
                this.join(roomType, roomObjectId);
            }
        }
    };

    Chat.prototype.onRoomMessage = function onRoomMessage(msg) {
        if (msg) {
            this.setState({ room: msg['Room'] });
        }
    };

    Chat.prototype.onNewMessage = function onNewMessage(msg) {
        var deleteMsg = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        if (!msg) {
            return;
        }
        if (deleteMsg) {
            this.setState({ messages: this.state.messages.filter(function (m) {
                    return m.Uuid !== msg.Uuid;
                }) });
        } else {
            var messages = [].concat(this.state.messages, [msg]).filter(function (m) {
                return !!m.Message;
            });
            messages.sort(function (mA, mB) {
                if (mA.Timestamp === mB.Timestamp) {
                    return 0;
                }
                return parseFloat(mA.Timestamp) > parseFloat(mB.Timestamp) ? 1 : -1;
            });
            this.setState({ messages: messages });
        }
    };

    Chat.prototype.join = function join(roomType, roomObjectId) {
        if (!roomObjectId) {
            return;
        }
        var pydio = this.props.pydio;

        this.client = _ChatClient2['default'].getInstance(pydio);
        var room = this.client.joinRoom(roomType, roomObjectId, this._newMessageListener, this.onRoomMessage.bind(this));
        if (room !== null) {
            this.setState({ room: room });
        }
        this.client.loadHistory(roomType, roomObjectId, 0, LoadSize);
    };

    Chat.prototype.more = function more() {
        var _props = this.props;
        var roomType = _props.roomType;
        var roomObjectId = _props.roomObjectId;
        var messages = this.state.messages;

        if (this.client) {
            this.client.loadHistory(roomType, roomObjectId, messages.length - 1, LoadSize);
        }
    };

    Chat.prototype.stop = function stop() {
        var _props2 = this.props;
        var roomType = _props2.roomType;
        var roomObjectId = _props2.roomObjectId;

        if (this.client) {
            this.client.leaveRoom(roomType, roomObjectId, this._newMessageListener);
        }
    };

    Chat.prototype.postMessage = function postMessage() {
        if (!this.state.value) {
            return;
        }
        var room = this.state.room;

        if (!room || !room.Uuid) {
            console.error("Cannot find cell info");
            return;
        }
        var message = {
            "@type": "POST",
            "Message": { "RoomUuid": room.Uuid, "Message": this.state.value }
        };
        this.client.send(JSON.stringify(message));
        this.setState({ value: '' });
    };

    Chat.prototype.deleteMessage = function deleteMessage(msg) {
        var room = this.state.room;

        if (!room || !room.Uuid) {
            console.error("Cannot find cell info");
            return;
        }
        var message = {
            "@type": "DELETE_MSG",
            "Message": msg
        };
        this.client.send(JSON.stringify(message));
    };

    Chat.prototype.keyDown = function keyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.postMessage();
        }
    };

    Chat.prototype.render = function render() {
        var _this = this;

        var _props3 = this.props;
        var style = _props3.style;
        var msgContainerStyle = _props3.msgContainerStyle;
        var fieldHint = _props3.fieldHint;
        var emptyStateProps = _props3.emptyStateProps;
        var pydio = _props3.pydio;
        var pushMessagesToBottom = _props3.pushMessagesToBottom;
        var computePresenceFromACLs = _props3.computePresenceFromACLs;
        var _state = this.state;
        var messages = _state.messages;
        var room = _state.room;

        var data = [];
        var previousMDate = undefined;
        var previousAuthor = undefined;
        var showLoader = messages.length >= LoadSize;
        messages.forEach(function (m) {
            var mDate = moment(parseFloat(m.Timestamp) * 1000).fromNow();
            var hideDate = previousMDate && previousMDate === mDate;
            var sameAuthor = previousAuthor && previousAuthor === m.Author && hideDate;
            data.push(_react2['default'].createElement(_Message2['default'], {
                key: m.Uuid,
                message: m,
                hideDate: hideDate,
                sameAuthor: sameAuthor,
                onDeleteMessage: function () {
                    _this.deleteMessage(m);
                },
                moreLoader: showLoader ? function () {
                    _this.more();
                } : null
            }));
            showLoader = false;
            previousMDate = mDate;
            previousAuthor = m.Author;
        });
        var pushStyle = undefined;
        var pusher = undefined;
        if (pushMessagesToBottom) {
            pushStyle = { display: 'flex', flexDirection: 'column' };
            if (data && data.length) {
                pusher = _react2['default'].createElement('span', { style: { flex: 1 } });
            }
        }
        var emptyState = undefined;
        if (emptyStateProps && (!data || !data.length)) {
            emptyState = _react2['default'].createElement(_viewsEmptyStateView2['default'], _extends({ pydio: pydio }, emptyStateProps));
        }
        return _react2['default'].createElement(
            'div',
            { style: _extends({ padding: 0 }, style) },
            computePresenceFromACLs !== undefined && _react2['default'].createElement(_ChatUsers2['default'], { pydio: pydio, ACLs: computePresenceFromACLs, roomUsers: room ? room.Users : [] }),
            _react2['default'].createElement(
                'div',
                { ref: 'comments', className: 'comments_feed', style: _extends({ maxHeight: 300, overflowY: 'auto' }, pushStyle, msgContainerStyle) },
                pusher,
                data,
                emptyState
            ),
            _react2['default'].createElement(
                'div',
                { style: { backgroundColor: 'white', paddingLeft: 16, paddingRight: 16, borderTop: '1px solid #e0e0e0' } },
                _react2['default'].createElement(_materialUi.TextField, {
                    hintText: fieldHint,
                    hintStyle: { whiteSpace: 'nowrap' },
                    value: this.state.value,
                    onChange: function (event, newValue) {
                        _this.setState({ value: newValue });
                    },
                    multiLine: true,
                    ref: 'new_comment',
                    onKeyDown: this.keyDown.bind(this),
                    fullWidth: true,
                    underlineShow: false
                })
            )
        );
    };

    return Chat;
})(_react2['default'].Component);

Chat.PropTypes = {
    roomType: _propTypes2['default'].string,
    roomObjectId: _propTypes2['default'].string
};

exports['default'] = Chat = PydioContextConsumer(Chat);
exports['default'] = Chat;
module.exports = exports['default'];
