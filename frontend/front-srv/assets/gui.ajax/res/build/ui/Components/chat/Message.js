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

var _usersAvatarUserAvatar = require('../users/avatar/UserAvatar');

var _usersAvatarUserAvatar2 = _interopRequireDefault(_usersAvatarUserAvatar);

var _materialUi = require('material-ui');

var _pydioUtilDom = require('pydio/util/dom');

var _pydioUtilDom2 = _interopRequireDefault(_pydioUtilDom);

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib.PydioContextConsumer;
var moment = _Pydio$requireLib.moment;

var Message = (function (_React$Component) {
    _inherits(Message, _React$Component);

    function Message(props) {
        _classCallCheck(this, Message);

        _React$Component.call(this, props);
        this.state = { hover: false };
    }

    Message.prototype.render = function render() {
        var _this = this;

        var _props = this.props;
        var message = _props.message;
        var pydio = _props.pydio;
        var hideDate = _props.hideDate;
        var sameAuthor = _props.sameAuthor;
        var onDeleteMessage = _props.onDeleteMessage;
        var moreLoader = _props.moreLoader;

        var mDate = moment(parseFloat(message.Timestamp) * 1000);

        var styles = {
            date: {
                color: 'rgba(0,0,0,.23)',
                textAlign: 'center',
                display: 'flex',
                margin: '5px 0'
            },
            dateLine: {
                flex: 1,
                margin: '10px 20px',
                borderBottom: '1px solid #eee'
            },
            loader: {
                paddingTop: 8,
                opacity: .8,
                textAlign: 'center'
            },
            comment: {
                padding: '6px 8px',
                display: 'flex',
                alignItems: 'flex-start'
            },
            commentContent: {
                flex: '1',
                marginLeft: 8,
                position: 'relative',
                padding: '8px 10px',
                backgroundColor: '#eee',
                userSelect: 'text',
                webkitUserSelect: 'text'
            },
            commentDeleteBox: {
                position: 'absolute',
                top: 9,
                right: 5,
                cursor: 'pointer',
                fontSize: 20,
                color: '#424242',
                opacity: 0,
                transition: _pydioUtilDom2['default'].getBeziersTransition()
            }
        };

        var authorIsLogged = false;
        if (pydio.user.id === message.Author) {
            authorIsLogged = true;
        }
        var avatar = _react2['default'].createElement(
            'div',
            { style: sameAuthor ? { visibility: 'hidden' } : { paddingTop: 2 } },
            _react2['default'].createElement(_usersAvatarUserAvatar2['default'], {
                avatarSize: 30,
                pydio: pydio,
                userId: message.Author,
                displayLabel: false,
                richOnHover: true,
                avatarLetters: true
            })
        );
        var textStyle = _extends({}, styles.commentContent);
        if (authorIsLogged) {
            textStyle = _extends({}, textStyle, { marginLeft: 0, marginRight: 8 });
        }
        if (sameAuthor) {
            textStyle = _extends({}, textStyle, { borderRadius: 0 });
        }
        var deleteBox = undefined;
        if (authorIsLogged) {
            var hover = this.state.hover;

            var deleteStyle = styles.commentDeleteBox;
            if (hover) {
                deleteStyle.opacity = 1;
            }
            deleteBox = _react2['default'].createElement('span', {
                onClick: onDeleteMessage,
                className: 'mdi mdi-close',
                style: styles.commentDeleteBox,
                title: pydio.MessageHash['7']
            });
        }
        var text = _react2['default'].createElement(
            _materialUi.Paper,
            { zDepth: 0, style: textStyle },
            deleteBox,
            message.Message
        );

        return _react2['default'].createElement(
            'div',
            { style: sameAuthor ? { marginTop: -16 } : {},
                onMouseOver: function () {
                    _this.setState({ hover: true });
                },
                onMouseOut: function () {
                    _this.setState({ hover: false });
                },
                onContextMenu: function (e) {
                    e.stopPropagation();
                }
            },
            moreLoader && _react2['default'].createElement(
                'div',
                { style: styles.loader },
                _react2['default'].createElement(_materialUi.FlatButton, { primary: true, label: _pydio2['default'].getMessages()['chat.load-older'], onClick: moreLoader })
            ),
            !hideDate && _react2['default'].createElement(
                'div',
                { style: styles.date },
                _react2['default'].createElement('span', { style: styles.dateLine }),
                _react2['default'].createElement(
                    'span',
                    null,
                    mDate.fromNow()
                ),
                _react2['default'].createElement('span', { style: styles.dateLine })
            ),
            authorIsLogged && _react2['default'].createElement(
                'div',
                { style: styles.comment },
                text,
                ' ',
                avatar
            ),
            !authorIsLogged && _react2['default'].createElement(
                'div',
                { style: styles.comment },
                avatar,
                ' ',
                text
            )
        );
    };

    return Message;
})(_react2['default'].Component);

Message.PropTypes = {
    message: _propTypes2['default'].object,
    hideDate: _propTypes2['default'].bool,
    sameAuthor: _propTypes2['default'].bool
};

exports['default'] = Message = PydioContextConsumer(Message);
exports['default'] = Message;
module.exports = exports['default'];
