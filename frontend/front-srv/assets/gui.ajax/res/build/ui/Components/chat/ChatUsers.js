'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioModelIdmObjectHelper = require('pydio/model/idm-object-helper');

var _pydioModelIdmObjectHelper2 = _interopRequireDefault(_pydioModelIdmObjectHelper);

var ChatUsers = (function (_React$Component) {
    _inherits(ChatUsers, _React$Component);

    function ChatUsers() {
        _classCallCheck(this, ChatUsers);

        _React$Component.apply(this, arguments);
    }

    ChatUsers.prototype.render = function render() {
        var _props = this.props;
        var ACLs = _props.ACLs;
        var roomUsers = _props.roomUsers;
        var pydio = _props.pydio;

        var style = {
            user: {
                marginRight: 10,
                whiteSpace: 'nowrap'
            },
            online: {
                color: '#4CAF50',
                marginRight: 5
            },
            offline: {
                marginRight: 5
            }
        };

        var users = Object.keys(ACLs).map(function (roleId) {
            var acl = ACLs[roleId];
            var online = undefined;
            var label = _pydioModelIdmObjectHelper2['default'].extractLabel(pydio, acl);
            if (acl.User) {
                online = roomUsers && roomUsers.indexOf(acl.User.Login) > -1;
            }
            return _react2['default'].createElement(
                'span',
                { style: style.user },
                online !== undefined && _react2['default'].createElement('span', { className: "mdi mdi-checkbox-blank-circle" + (online ? "" : "-outline"), style: online ? style.online : style.offline }),
                online === undefined && _react2['default'].createElement('span', { className: "mdi mdi-account-multiple-outline", style: style.offline }),
                label
            );
        });

        return _react2['default'].createElement(
            'div',
            { style: { padding: 16, fontWeight: 500, color: '#757575', borderBottom: '1px solid #e0e0e0' } },
            users
        );
    };

    return ChatUsers;
})(_react2['default'].Component);

exports['default'] = ChatUsers;
module.exports = exports['default'];
