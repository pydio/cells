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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var _materialUi = require('material-ui');

var _clipboard = require('clipboard');

var _clipboard2 = _interopRequireDefault(_clipboard);

var _linksLinkModel = require('../links/LinkModel');

var _linksLinkModel2 = _interopRequireDefault(_linksLinkModel);

var TargetedUserLink = (function (_React$Component) {
    _inherits(TargetedUserLink, _React$Component);

    function TargetedUserLink(props) {
        _classCallCheck(this, TargetedUserLink);

        _get(Object.getPrototypeOf(TargetedUserLink.prototype), 'constructor', this).call(this, props);
        this.state = { copyMessage: '' };
    }

    _createClass(TargetedUserLink, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (this._clip) {
                this._clip.destroy();
            }
            if (this._button) {
                this._clip = new _clipboard2['default'](this._button, {
                    text: (function (trigger) {
                        return this.props.link;
                    }).bind(this)
                });
                this._clip.on('success', (function () {
                    this.setState({ copyMessage: this.props.getMessage('192') }, this.clearCopyMessage);
                }).bind(this));
                this._clip.on('error', (function () {
                    var copyMessage = undefined;
                    if (global.navigator.platform.indexOf("Mac") === 0) {
                        copyMessage = this.props.getMessage('144');
                    } else {
                        copyMessage = this.props.getMessage('share_center.143');
                    }
                    this.setState({ copyMessage: copyMessage }, this.clearCopyMessage);
                }).bind(this));
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this._clip) {
                this._clip.destroy();
            }
        }
    }, {
        key: 'clearCopyMessage',
        value: function clearCopyMessage() {
            setTimeout((function () {
                this.setState({ copyMessage: '' });
            }).bind(this), 5000);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props = this.props;
            var targetUser = _props.targetUser;
            var link = _props.link;

            return _react2['default'].createElement(
                'div',
                { style: { display: 'flex' } },
                _react2['default'].createElement(
                    'div',
                    { style: { flex: 1 } },
                    targetUser.Display,
                    _react2['default'].createElement(_materialUi.IconButton, {
                        pydio: this.props.pydio,
                        ref: function (ref) {
                            _this._button = _reactDom2['default'].findDOMNode(ref);
                        },
                        iconClassName: 'mdi mdi-link',
                        tooltip: this.state.copyMessage || link,
                        iconStyle: { fontSize: 13, lineHeight: '17px' }, style: { width: 34, height: 34, padding: 6 }
                    })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { width: 40, textAlign: 'center' } },
                    targetUser.DownloadCount
                )
            );
        }
    }]);

    return TargetedUserLink;
})(_react2['default'].Component);

var TargetedUsers = (function (_React$Component2) {
    _inherits(TargetedUsers, _React$Component2);

    function TargetedUsers(props, context) {
        _classCallCheck(this, TargetedUsers);

        _get(Object.getPrototypeOf(TargetedUsers.prototype), 'constructor', this).call(this, props, context);
        this.state = { open: false };
    }

    _createClass(TargetedUsers, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var linkModel = this.props.linkModel;

            var link = linkModel.getLink();
            var targetUsers = undefined;
            if (link.TargetUsers) {
                targetUsers = link.TargetUsers;
            }
            var items = Object.keys(targetUsers).map(function (k) {
                var title = linkModel.getPublicUrl() + '?u=' + k;
                return _react2['default'].createElement(TargetedUserLink, { targetUser: targetUsers[k], link: title });
            });
            if (!items.length) {
                return null;
            }

            var rootStyle = {
                lineHeight: '34px',
                padding: '4px 10px 4px',
                fontSize: 14,
                backgroundColor: '#fafafa',
                borderRadius: 2
            };
            var headerStyle = {
                borderBottom: this.state.open ? '1px solid #757575' : '',
                color: 'rgba(0, 0, 0, 0.36)'
            };

            return _react2['default'].createElement(
                'div',
                { style: rootStyle },
                _react2['default'].createElement(
                    'div',
                    { style: _extends({ display: 'flex' }, headerStyle) },
                    _react2['default'].createElement(
                        'div',
                        { style: { flex: 1 } },
                        this.props.getMessage('245').replace('%s', items.length),
                        ' ',
                        _react2['default'].createElement('span', { className: 'mdi mdi-chevron-' + (this.state.open ? 'up' : 'down'), style: { cursor: 'pointer' }, onClick: function () {
                                _this2.setState({ open: !_this2.state.open });
                            } })
                    ),
                    this.state.open && _react2['default'].createElement(
                        'div',
                        { style: { width: 40, textAlign: 'center' } },
                        '#DL'
                    )
                ),
                this.state.open && _react2['default'].createElement(
                    'div',
                    null,
                    items
                )
            );
        }
    }]);

    return TargetedUsers;
})(_react2['default'].Component);

TargetedUsers.propTypes = {
    linkModel: _propTypes2['default'].instanceOf(_linksLinkModel2['default'])
};

exports['default'] = TargetedUsers = (0, _ShareContextConsumer2['default'])(TargetedUsers);
TargetedUserLink = (0, _ShareContextConsumer2['default'])(TargetedUserLink);

exports['default'] = TargetedUsers;
module.exports = exports['default'];
