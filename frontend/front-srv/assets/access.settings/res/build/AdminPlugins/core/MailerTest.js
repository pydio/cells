/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var MailerTest = (function (_React$Component) {
    _inherits(MailerTest, _React$Component);

    function MailerTest(props) {
        _classCallCheck(this, MailerTest);

        _get(Object.getPrototypeOf(MailerTest.prototype), 'constructor', this).call(this, props);
        this.state = { loaded: false };
    }

    _createClass(MailerTest, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;

            _pydioHttpResourcesManager2['default'].loadClass('PydioMailer').then(function () {
                _this.setState({ loaded: true });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var loaded = this.state.loaded;
            var MessageHash = this.props.pydio.MessageHash;

            if (!loaded) {
                return _react2['default'].createElement(
                    'div',
                    { style: { padding: 20 } },
                    MessageHash["ajxp_admin.mailer.test.loading"]
                );
            }

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(PydioMailer.Pane, {
                    pydio: this.props.pydio,
                    templateId: "AdminTestMail",
                    templateData: {},
                    overlay: false,
                    panelTitle: MessageHash["ajxp_admin.mailer.test.title"],
                    style: { margin: 16, padding: '20px 0 0' },
                    titleStyle: { fontSize: 24, padding: 0, paddingBottom: 0 },
                    usersBlockStyle: { padding: 0 },
                    messageBlockStyle: { padding: 0 },
                    zDepth: 0
                }),
                _react2['default'].createElement(
                    'div',
                    { style: { color: '#BDBDBD', margin: '20px 16px', fontSize: 12 } },
                    MessageHash["ajxp_admin.mailer.test.legend"]
                )
            );
        }
    }]);

    return MailerTest;
})(_react2['default'].Component);

exports['default'] = MailerTest;
module.exports = exports['default'];
