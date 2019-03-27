'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ChatClient = require('./ChatClient');

var _ChatClient2 = _interopRequireDefault(_ChatClient);

var ChatIcon = (function (_React$Component) {
    _inherits(ChatIcon, _React$Component);

    function ChatIcon(props) {
        _classCallCheck(this, ChatIcon);

        _React$Component.call(this, props);
        this.state = { newMessages: 0 };
        this._messageListener = this.onMessage.bind(this);
    }

    ChatIcon.prototype.onMessage = function onMessage(msg) {
        var deleteMsg = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        if (deleteMsg) {
            this.setState({ newMessages: Math.max(0, this.state.newMessages - 1) });
        } else {
            this.setState({ newMessages: this.state.newMessages + 1 });
        }
    };

    ChatIcon.prototype.listenToRoom = function listenToRoom(roomType, objectId) {
        var client = _ChatClient2['default'].getInstance(this.props.pydio);
        client.joinRoom(roomType, objectId, this._messageListener, null);
    };

    ChatIcon.prototype.leaveRoom = function leaveRoom(roomType, objectId) {
        var client = _ChatClient2['default'].getInstance(this.props.pydio);
        client.leaveRoom(roomType, objectId, this._messageListener);
    };

    ChatIcon.prototype.componentDidMount = function componentDidMount() {
        var _props = this.props;
        var roomType = _props.roomType;
        var objectId = _props.objectId;

        this.listenToRoom(roomType, objectId);
    };

    ChatIcon.prototype.componentWillUnmount = function componentWillUnmount() {
        var _props2 = this.props;
        var roomType = _props2.roomType;
        var objectId = _props2.objectId;

        this.leaveRoom(roomType, objectId);
    };

    ChatIcon.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
        var _this = this;

        var _props3 = this.props;
        var roomType = _props3.roomType;
        var objectId = _props3.objectId;

        if (nextProps.roomType !== roomType || nextProps.objectId !== objectId) {
            this.leaveRoom(roomType, objectId);
            this.setState({ newMessages: 0 }, function () {
                _this.listenToRoom(nextProps.roomType, nextProps.objectId);
            });
        }
    };

    ChatIcon.prototype.onClick = function onClick() {
        var pydio = this.props.pydio;

        pydio.Controller.fireAction('toggle_chat_panel');
        this.setState({ newMessages: 0 });
    };

    ChatIcon.prototype.render = function render() {
        var newMessages = this.state.newMessages;

        if (newMessages === 0) {
            return null;
        }
        var red = '';
        var green = '#8BC34A';
        var style = { display: 'inline-block', padding: '0 5px', fontSize: 15, textAlign: 'center',
            color: green, fontWeight: 500, position: 'relative' };
        var innerStyle = { fontSize: 13, display: 'inline-block', position: 'absolute', top: -1, marginLeft: 2 };
        return _react2['default'].createElement(
            'span',
            { onClick: this.onClick.bind(this), className: 'mdi mdi-comment', style: style },
            _react2['default'].createElement(
                'span',
                { style: innerStyle },
                newMessages
            )
        );
    };

    return ChatIcon;
})(_react2['default'].Component);

exports['default'] = ChatIcon;
module.exports = exports['default'];
