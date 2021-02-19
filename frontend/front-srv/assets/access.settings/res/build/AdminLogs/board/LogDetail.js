'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _cellsSdk = require('cells-sdk');

var _materialUi = require('material-ui');

var _clipboard = require('clipboard');

var _clipboard2 = _interopRequireDefault(_clipboard);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var UserAvatar = _Pydio$requireLib.UserAvatar;

var GenericLine = (function (_React$Component) {
    _inherits(GenericLine, _React$Component);

    function GenericLine() {
        _classCallCheck(this, GenericLine);

        _get(Object.getPrototypeOf(GenericLine.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(GenericLine, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var iconClassName = _props.iconClassName;
            var legend = _props.legend;
            var data = _props.data;
            var selectable = _props.selectable;

            var style = {
                icon: {
                    margin: '16px 20px 0'
                },
                legend: {
                    fontSize: 12,
                    color: '#aaaaaa',
                    fontWeight: 500,
                    textTransform: 'lowercase'
                },
                data: {
                    fontSize: 15,
                    paddingRight: 6,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    userSelect: 'text'
                }
            };
            return _react2['default'].createElement(
                'div',
                { style: { display: 'flex', marginBottom: 8, overflow: 'hidden' } },
                _react2['default'].createElement(
                    'div',
                    { style: { width: 64 } },
                    _react2['default'].createElement(_materialUi.FontIcon, { color: '#aaaaaa', className: iconClassName, style: style.icon })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { flex: 1 } },
                    _react2['default'].createElement(
                        'div',
                        { style: style.legend },
                        legend
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: style.data },
                        data
                    )
                )
            );
        }
    }]);

    return GenericLine;
})(_react2['default'].Component);

var LogDetail = (function (_React$Component2) {
    _inherits(LogDetail, _React$Component2);

    function LogDetail(props) {
        _classCallCheck(this, LogDetail);

        _get(Object.getPrototypeOf(LogDetail.prototype), 'constructor', this).call(this, props);
        this.state = { copySuccess: false };
    }

    _createClass(LogDetail, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.attachClipboard();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.detachClipboard();
        }
    }, {
        key: 'attachClipboard',
        value: function attachClipboard() {
            var _props2 = this.props;
            var log = _props2.log;
            var pydio = _props2.pydio;

            this.detachClipboard();
            if (this.refs['copy-button']) {
                this._clip = new _clipboard2['default'](_reactDom2['default'].findDOMNode(this.refs['copy-button']), {
                    text: (function (trigger) {
                        var data = [];
                        Object.keys(log).map(function (k) {
                            var val = log[k];
                            if (!val) return;
                            if (k === 'RoleUuids') val = val.join(',');
                            data.push(k + ' : ' + val);
                        });
                        return data.join('\n');
                    }).bind(this)
                });
                this._clip.on('success', (function () {
                    var _this = this;

                    this.setState({ copySuccess: true }, function () {
                        setTimeout(function () {
                            _this.setState({ copySuccess: false });
                        }, 3000);
                    });
                }).bind(this));
                this._clip.on('error', (function () {}).bind(this));
            }
        }
    }, {
        key: 'detachClipboard',
        value: function detachClipboard() {
            if (this._clip) {
                this._clip.destroy();
            }
        }
    }, {
        key: 'focusPeriod',
        value: function focusPeriod() {
            var _props3 = this.props;
            var onSelectPeriod = _props3.onSelectPeriod;
            var log = _props3.log;

            var ts = log.Ts;
            onSelectPeriod(ts);
        }
    }, {
        key: 'unfocusPeriod',
        value: function unfocusPeriod() {
            var _props4 = this.props;
            var onSelectPeriod = _props4.onSelectPeriod;
            var focus = _props4.focus;

            if (focus) {
                onSelectPeriod(null);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props5 = this.props;
            var log = _props5.log;
            var pydio = _props5.pydio;
            var onRequestClose = _props5.onRequestClose;
            var onSelectPeriod = _props5.onSelectPeriod;
            var style = _props5.style;
            var focus = _props5.focus;
            var _props5$userDisplay = _props5.userDisplay;
            var userDisplay = _props5$userDisplay === undefined ? 'avatar' : _props5$userDisplay;
            var copySuccess = this.state.copySuccess;

            var styles = {
                divider: { marginTop: 5, marginBottom: 5 },
                userLegend: {
                    marginTop: -16,
                    paddingBottom: 10,
                    textAlign: 'center',
                    color: '#9E9E9E',
                    fontWeight: 500
                },
                buttons: {
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    display: 'flex'
                },
                button: {
                    height: 36,
                    width: 36,
                    padding: 8
                },
                buttonIcon: {
                    fontSize: 20
                }
            };

            var userLegend = undefined;
            if (log.Profile || log.RoleUuids || log.GroupPath) {
                var leg = [];
                if (log.Profile) leg.push('Profile: ' + log.Profile);
                if (log.GroupPath) leg.push('Group: ' + log.GroupPath);
                if (log.RoleUuids) leg.push('Roles: ' + log.RoleUuids.join(','));
                userLegend = leg.join(' - ');
            }

            var msg = log.Msg;
            if (log.Level === 'error') {
                msg = _react2['default'].createElement(
                    'span',
                    { style: { color: '#e53935' } },
                    log.Msg
                );
            }

            return _react2['default'].createElement(
                'div',
                { style: _extends({ fontSize: 13, color: 'rgba(0,0,0,.87)', paddingBottom: 10 }, style) },
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 1, style: { backgroundColor: '#f5f5f5', marginBottom: 10, position: 'relative' } },
                    _react2['default'].createElement(
                        'div',
                        { style: styles.buttons },
                        _react2['default'].createElement(_materialUi.IconButton, { style: styles.button, iconStyle: styles.buttonIcon, iconClassName: copySuccess ? 'mdi mdi-check' : 'mdi mdi-content-copy', tooltip: 'Copy log to clipboard', tooltipPosition: "bottom-left", ref: "copy-button" }),
                        onSelectPeriod && _react2['default'].createElement(_materialUi.IconButton, { style: styles.button, iconStyle: _extends({}, styles.buttonIcon, { color: focus ? '#ff5722' : null }), iconClassName: "mdi mdi-clock", onTouchTap: focus ? this.unfocusPeriod.bind(this) : this.focusPeriod.bind(this), tooltip: "Show +/- 5 minutes", tooltipPosition: "bottom-left" }),
                        _react2['default'].createElement(_materialUi.IconButton, { style: styles.button, iconStyle: styles.buttonIcon, iconClassName: "mdi mdi-close", onTouchTap: function () {
                                _this2.unfocusPeriod();onRequestClose();
                            }, tooltip: "Close log detail", tooltipPosition: "bottom-left" })
                    ),
                    userDisplay === 'avatar' && log.UserName && _react2['default'].createElement(UserAvatar, {
                        pydio: pydio,
                        userId: log.UserName,
                        richCard: true,
                        displayLabel: true,
                        displayAvatar: true,
                        noActionsPanel: true
                    }),
                    userDisplay === "avatar" && userLegend && _react2['default'].createElement(
                        'div',
                        { style: styles.userLegend },
                        userLegend
                    )
                ),
                log.UserName && userDisplay === 'inline' && _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-account", legend: "User", data: log.UserName }),
                    userLegend && _react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-account-multiple", legend: "User Attributes", data: userLegend }),
                    _react2['default'].createElement(_materialUi.Divider, { style: styles.divider })
                ),
                _react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-calendar", legend: "Event Date", data: new Date(log.Ts * 1000).toLocaleString() }),
                _react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-comment-text", legend: "Event Message", data: msg }),
                _react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-server-network", legend: "Service", data: log.Logger }),
                (log.RemoteAddress || log.UserAgent || log.HttpProtocol) && _react2['default'].createElement(_materialUi.Divider, { style: styles.divider }),
                log.RemoteAddress && _react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-cast-connected", legend: "Connection IP", data: log.RemoteAddress }),
                log.UserAgent && _react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-cellphone-link", legend: "User Agent", data: log.UserAgent }),
                log.HttpProtocol && _react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-open-in-app", legend: "Protocol", data: log.HttpProtocol }),
                log.NodePath && _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_materialUi.Divider, { style: styles.divider }),
                    _react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-file-tree", legend: "File/Folder", data: log.NodePath }),
                    _react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-folder-open", legend: "In Workspace", data: log.WsUuid })
                )
            );
        }
    }]);

    return LogDetail;
})(_react2['default'].Component);

LogDetail.PropTypes = {
    pydio: _propTypes2['default'].instanceOf(_pydio2['default']),
    log: _propTypes2['default'].instanceOf(_cellsSdk.LogLogMessage)
};

exports['default'] = LogDetail;
module.exports = exports['default'];
