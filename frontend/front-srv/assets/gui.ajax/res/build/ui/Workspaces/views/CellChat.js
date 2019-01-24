'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var Chat = _Pydio$requireLib.Chat;

var CellChat = (function (_React$Component) {
    _inherits(CellChat, _React$Component);

    function CellChat(props) {
        _classCallCheck(this, CellChat);

        _React$Component.call(this, props);
        this.state = { cellModel: null, cellId: '' };
    }

    CellChat.prototype.loadRoomData = function loadRoomData() {
        var _this = this;

        var user = this.props.pydio.user;
        user.getActiveRepositoryAsCell().then(function (c) {
            _this.setState({ cellModel: c, cellId: c ? user.activeRepository : '' });
        });
    };

    CellChat.prototype.componentWillMount = function componentWillMount() {
        this.loadRoomData();
    };

    CellChat.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
        if (nextProps.pydio.user.activeRepository !== this.state.cellId) {
            this.loadRoomData();
        }
    };

    CellChat.prototype.render = function render() {
        var _props = this.props;
        var pydio = _props.pydio;
        var style = _props.style;
        var zDepth = _props.zDepth;
        var onRequestClose = _props.onRequestClose;
        var _state = this.state;
        var cellModel = _state.cellModel;
        var cellId = _state.cellId;

        var chatRoomType = 'WORKSPACE';
        return _react2['default'].createElement(
            _materialUi.Paper,
            { id: 'info_panel', zDepth: zDepth, rounded: false, style: _extends({ display: 'flex', flexDirection: 'column' }, style) },
            _react2['default'].createElement(Chat, {
                pydio: pydio,
                roomType: chatRoomType,
                roomObjectId: cellId,
                style: { flex: 1, display: 'flex', flexDirection: 'column' },
                msgContainerStyle: { maxHeight: null, flex: 1, paddingTop: '10px !important', backgroundColor: '#FAFAFA' },
                fieldHint: pydio.MessageHash['636'],
                pushMessagesToBottom: true,
                emptyStateProps: {
                    iconClassName: 'mdi mdi-comment-account-outline',
                    primaryTextId: pydio.MessageHash['637'],
                    style: { padding: '0 10px', backgroundColor: 'transparent' }
                },
                computePresenceFromACLs: cellModel ? cellModel.getAcls() : {},
                onRequestClose: onRequestClose
            })
        );
    };

    return CellChat;
})(_react2['default'].Component);

exports['default'] = CellChat;
module.exports = exports['default'];
