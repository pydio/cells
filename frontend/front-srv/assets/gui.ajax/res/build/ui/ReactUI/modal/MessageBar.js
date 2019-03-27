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

var _PydioContextConsumer = require('../PydioContextConsumer');

var _PydioContextConsumer2 = _interopRequireDefault(_PydioContextConsumer);

var React = require('react');
var ReactDOM = require('react-dom');
var Clipboard = require('clipboard');

var _require = require('material-ui');

var Snackbar = _require.Snackbar;
var Divider = _require.Divider;
var FlatButton = _require.FlatButton;
var TextField = _require.TextField;

var ErrorStack = (function (_React$Component) {
    _inherits(ErrorStack, _React$Component);

    function ErrorStack(props) {
        _classCallCheck(this, ErrorStack);

        _React$Component.call(this, props);
        this.state = {
            copyMessage: false,
            copyError: false
        };
    }

    ErrorStack.prototype.componentDidMount = function componentDidMount() {
        this._attachClipboard();
    };

    ErrorStack.prototype.componentDidUpdate = function componentDidUpdate() {
        this._attachClipboard();
    };

    ErrorStack.prototype.componentWillUnmount = function componentWillUnmount() {
        this._detachClipboard();
    };

    ErrorStack.prototype._attachClipboard = function _attachClipboard() {
        var _this = this;

        this._detachClipboard();
        if (this._button) {
            this._clip = new Clipboard(this._button, {
                text: function text(trigger) {
                    return _this.props.fullMessage;
                }
            });
            this._clip.on('success', function () {
                _this.setState({ copyMessage: true }, _this.clearCopyMessage);
            });
            this._clip.on('error', function () {
                _this.setState({ copyError: true });
            });
        }
    };

    ErrorStack.prototype._detachClipboard = function _detachClipboard() {
        if (this._clip) {
            this._clip.destroy();
        }
    };

    ErrorStack.prototype.clearCopyMessage = function clearCopyMessage() {
        setTimeout((function () {
            this.setState({ copyMessage: false });
        }).bind(this), 5000);
    };

    ErrorStack.prototype.render = function render() {
        var _this2 = this;

        var _state = this.state;
        var copyMessage = _state.copyMessage;
        var copyError = _state.copyError;
        var _props = this.props;
        var errorStack = _props.errorStack;
        var fullMessage = _props.fullMessage;
        var pydio = _props.pydio;

        return React.createElement(
            'div',
            null,
            React.createElement(Divider, { style: { marginTop: 10, marginBottom: 10 } }),
            React.createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center' } },
                React.createElement(
                    'div',
                    { style: { flex: 1, fontSize: 16, fontWeight: 500 } },
                    pydio.MessageHash['622']
                ),
                React.createElement(FlatButton, { secondary: true, ref: function (e) {
                        _this2._button = ReactDOM.findDOMNode(e);
                    }, label: copyMessage ? pydio.MessageHash['624'] : pydio.MessageHash['623'] })
            ),
            copyError && React.createElement(TextField, { fullWidth: true, multiLine: true, value: fullMessage, textareaStyle: { fontSize: 13, color: 'white' }, ref: 'fullMessageCopy' }),
            !copyError && errorStack.map(function (m) {
                return React.createElement(
                    'div',
                    { style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } },
                    m
                );
            })
        );
    };

    return ErrorStack;
})(React.Component);

var MessageBar = (function (_React$Component2) {
    _inherits(MessageBar, _React$Component2);

    function MessageBar(props) {
        _classCallCheck(this, MessageBar);

        _React$Component2.call(this, props);
        this.state = { open: false };
    }

    MessageBar.prototype.componentDidMount = function componentDidMount() {
        this.props.getPydio().UI.registerMessageBar(this);
    };

    MessageBar.prototype.componentWillUnmount = function componentWillUnmount() {
        this.props.getPydio().UI.unregisterMessageBar();
    };

    MessageBar.prototype.error = function error(message, actionLabel, actionCallback) {
        this.setState({
            open: true,
            errorStatus: true,
            message: message,
            actionLabel: actionLabel,
            actionCallback: actionCallback
        });
    };

    MessageBar.prototype.info = function info(message, actionLabel, actionCallback) {
        this.setState({
            open: true,
            errorStatus: false,
            message: message,
            actionLabel: actionLabel,
            actionCallback: actionCallback
        });
    };

    MessageBar.prototype.handleClose = function handleClose() {
        this.setState({ open: false });
    };

    MessageBar.prototype.render = function render() {
        var message = this.state.message || '';
        var _state2 = this.state;
        var errorStatus = _state2.errorStatus;
        var actionLabel = _state2.actionLabel;
        var actionCallback = _state2.actionCallback;

        var mainStack = [];
        var errorStack = [];
        if (message.split('\n').length) {
            message.split('\n').forEach(function (m) {
                if (errorStatus && m.length && (m[0] === '#' || errorStack.length)) {
                    errorStack.push(m);
                } else {
                    mainStack.push(m);
                }
            });
            if (errorStack.length && !mainStack.length) mainStack = errorStack[0];
        } else {
            mainStack.push(message);
        }
        message = React.createElement(
            'span',
            null,
            errorStatus && React.createElement('span', { style: { float: 'left', marginRight: 6 }, className: 'mdi mdi-alert' }),
            mainStack.map(function (m) {
                return React.createElement(
                    'div',
                    null,
                    m
                );
            }),
            errorStack.length > 0 && React.createElement(ErrorStack, { fullMessage: message, errorStack: errorStack, pydio: this.props.pydio })
        );
        return React.createElement(Snackbar, {
            open: this.state.open,
            message: message,
            onRequestClose: this.handleClose.bind(this),
            autoHideDuration: errorStatus ? 9000 : 4000,
            action: actionLabel,
            onActionTouchTap: actionCallback,
            bodyStyle: { padding: '16px 24px', height: 'auto', maxHeight: 200, overflowY: 'auto', lineHeight: 'inherit' }
        });
    };

    return MessageBar;
})(React.Component);

exports['default'] = MessageBar = _PydioContextConsumer2['default'](MessageBar);

exports['default'] = MessageBar;
module.exports = exports['default'];
