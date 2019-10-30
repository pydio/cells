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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUiStyles = require('material-ui/styles');

var _materialUi = require('material-ui');

var _utilMixins = require('../util/Mixins');

var _lodashShuffle = require('lodash.shuffle');

var _lodashShuffle2 = _interopRequireDefault(_lodashShuffle);

var Dashboard = _react2['default'].createClass({
    displayName: 'Dashboard',

    mixins: [_utilMixins.MessagesConsumerMixin],

    getInitialState: function getInitialState() {
        return { kb: [] };
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        PydioApi.getClient().loadFile('plug/access.settings/res/i18n/kb.json', function (transport) {
            var data = transport.responseJSON;
            _this.setState({ kb: data });
        });
    },

    getOpenIcon: function getOpenIcon(link) {
        return _react2['default'].createElement(_materialUi.IconButton, {
            iconClassName: 'mdi mdi-arrow-right',
            iconStyle: { color: 'rgba(0,0,0,.33)' },
            tooltip: 'Open in new window',
            tooltipPosition: 'bottom-left',
            onTouchTap: function () {
                window.open(link);
            }
        });
    },

    getDocButton: function getDocButton(icon, message, link) {
        return _react2['default'].createElement(_materialUi.FlatButton, {
            key: message,
            label: message,
            primary: true,
            icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-" + icon }),
            onTouchTap: function () {
                window.open(link);
            } });
    },

    welcomeClick: function welcomeClick(e) {
        if (e.target.getAttribute('data-path')) {
            var p = e.target.getAttribute('data-path');
            if (p === '/plugins/manager') {
                p = '/parameters/manager';
            }
            this.props.pydio.goTo(p);
        }
    },

    render: function render() {
        var _this2 = this;

        var verticalFlex = { display: 'flex', flexDirection: 'column', height: '100%' };
        var flexFill = { flex: 1 };
        var paperStyle = { flex: 1, minWidth: 450, margin: 5 };
        var flexContainerStyle = _extends({}, verticalFlex);
        var accent2Color = this.props.muiTheme.palette.accent2Color;
        var pydio = this.props.pydio;

        var message = function message(id) {
            return pydio.MessageHash['admin_dashboard.' + id];
        };

        // ADMIN GUIDE BUTTONS
        var guidesButtons = [{ icon: 'clock-start', id: 'start', link: 'https://pydio.com/en/docs/cells/v1/getting-started' }, { icon: 'network', id: 'ws', link: 'https://pydio.com/en/docs/cells/v1/storage-data-and-metadata' }, { icon: 'account-multiple', id: 'users', link: 'https://pydio.com/en/docs/cells/v1/access-control-and-security' }, { icon: 'professional-hexagon', id: 'advanced', link: 'https://pydio.com/en/docs/cells/v1/advanced' }];

        // DOCS LIST
        var kbItems = [];
        (0, _lodashShuffle2['default'])(this.state.kb).forEach(function (object) {
            kbItems.push(_react2['default'].createElement(_materialUi.ListItem, { key: object.title, primaryText: object.title, secondaryText: object.desc, rightIconButton: _this2.getOpenIcon(object.link), secondaryTextLines: 2, disabled: true }));
            kbItems.push(_react2['default'].createElement(_materialUi.Divider, { key: object.title + '-divider' }));
        });
        // Remove last divider
        if (kbItems.length) {
            kbItems.pop();
        }

        var WELCOME_COMMUNITY_CARD = _react2['default'].createElement(
            _materialUi.Card,
            { style: _extends({}, paperStyle, { minWidth: '95%' }), containerStyle: flexContainerStyle },
            _react2['default'].createElement(_materialUi.CardTitle, {
                title: message('welc.title'),
                subtitle: message('welc.subtitle')
            }),
            _react2['default'].createElement(
                _materialUi.CardText,
                { style: flexFill },
                _react2['default'].createElement('style', { dangerouslySetInnerHTML: { __html: '.doc-link{color: ' + accent2Color + ';cursor: pointer;text-decoration:underline;}' } }),
                _react2['default'].createElement(
                    'div',
                    { style: { lineHeight: '1.6em' } },
                    _react2['default'].createElement('span', { dangerouslySetInnerHTML: { __html: message('welc.intro') }, onClick: this.welcomeClick }),
                    _react2['default'].createElement('span', { dangerouslySetInnerHTML: { __html: message('welc.import') }, onClick: this.welcomeClick })
                ),
                _react2['default'].createElement(
                    'p',
                    { style: { fontSize: 14 } },
                    message('welc.guide')
                )
            ),
            _react2['default'].createElement(_materialUi.Divider, null),
            _react2['default'].createElement(
                _materialUi.CardActions,
                { style: { textAlign: 'right' } },
                guidesButtons.map(function (object) {
                    return _this2.getDocButton(object.icon, message('welc.btn.' + object.id), object.link);
                })
            )
        );

        var PAY_IT_FORWARD_CARD = _react2['default'].createElement(
            _materialUi.Card,
            { style: paperStyle, containerStyle: flexContainerStyle },
            _react2['default'].createElement(_materialUi.CardTitle, { title: message('cont.title'), subtitle: message('cont.subtitle') }),
            _react2['default'].createElement(
                _materialUi.CardText,
                { style: flexFill },
                _react2['default'].createElement('div', { className: 'mdi mdi-github-circle', style: { fontSize: 60, display: 'inline-block', float: 'left', marginRight: 10, marginBottom: 10 } }),
                message('cont.intro'),
                _react2['default'].createElement(
                    _materialUi.List,
                    null,
                    _react2['default'].createElement(_materialUi.ListItem, { disabled: true, primaryText: message('cont.topic.report'), rightIconButton: this.getOpenIcon('https://forum.pydio.com/') }),
                    _react2['default'].createElement(_materialUi.Divider, null),
                    _react2['default'].createElement(_materialUi.ListItem, { disabled: true, primaryText: message('cont.topic.report.2'), rightIconButton: this.getOpenIcon('https://github.com/pydio/cells') }),
                    _react2['default'].createElement(_materialUi.Divider, null),
                    _react2['default'].createElement(_materialUi.ListItem, { disabled: true, primaryText: message('cont.topic.pr'), rightIconButton: this.getOpenIcon('https://github.com/pydio/cells') }),
                    _react2['default'].createElement(_materialUi.Divider, null),
                    _react2['default'].createElement(_materialUi.ListItem, { disabled: true, primaryText: message('cont.topic.translate'), rightIconButton: this.getOpenIcon('https://pydio.com/en/community/contribute/adding-translation-pydio') })
                )
            ),
            _react2['default'].createElement(_materialUi.Divider, null),
            _react2['default'].createElement(
                _materialUi.CardActions,
                { style: { textAlign: 'right' } },
                _react2['default'].createElement(_materialUi.FlatButton, { label: message('cont.btn.github'), primary: true, icon: _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-github-box' }), onTouchTap: function () {
                        window.open('https://github.com/pydio/cells');
                    } }),
                _react2['default'].createElement(_materialUi.FlatButton, { label: message('cont.btn.tw'), primary: true, icon: _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-twitter-box' }), onTouchTap: function () {
                        window.open('https://twitter.com/Pydio');
                    } }),
                _react2['default'].createElement(_materialUi.FlatButton, { label: message('cont.btn.fb'), primary: true, icon: _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-facebook-box' }), onTouchTap: function () {
                        window.open('https://facebook.com/Pydio/');
                    } })
            )
        );

        var DISCOVER_ENTERPRISE_CARD = _react2['default'].createElement(
            _materialUi.Card,
            { style: paperStyle, containerStyle: flexContainerStyle },
            _react2['default'].createElement(
                _materialUi.CardMedia,
                {
                    overlay: _react2['default'].createElement(_materialUi.CardTitle, { title: message('ent.title'), subtitle: message('ent.subtitle') })
                },
                _react2['default'].createElement('div', { style: { height: 230, backgroundImage: 'url(plug/access.settings/res/images/dashboard.png)', backgroundSize: 'cover', borderRadius: 3 } })
            ),
            _react2['default'].createElement(
                _materialUi.List,
                { style: flexFill },
                _react2['default'].createElement(_materialUi.ListItem, { leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { style: { color: accent2Color }, className: 'mdi mdi-certificate' }), primaryText: message('ent.features'), secondaryText: message('ent.features.legend'), disabled: true }),
                _react2['default'].createElement(_materialUi.Divider, null),
                _react2['default'].createElement(_materialUi.ListItem, { leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { style: { color: accent2Color }, className: 'mdi mdi-chart-areaspline' }), primaryText: message('ent.advanced'), secondaryText: message('ent.advanced.legend'), disabled: true }),
                _react2['default'].createElement(_materialUi.Divider, null),
                _react2['default'].createElement(_materialUi.ListItem, { leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { style: { color: accent2Color }, className: 'mdi mdi-message-alert' }), primaryText: message('ent.support'), secondaryText: message('ent.support.legend'), disabled: true }),
                _react2['default'].createElement(_materialUi.Divider, null),
                _react2['default'].createElement(_materialUi.ListItem, { leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { style: { color: accent2Color }, className: 'mdi mdi-download' }), onTouchTap: function () {
                        pydio.goTo('/admin/update');
                    }, primaryText: _react2['default'].createElement(
                        'span',
                        { style: { color: 'rgb(1, 141, 204)' } },
                        message('ent.upgrade')
                    ), secondaryText: message('ent.upgrade.legend') })
            ),
            _react2['default'].createElement(_materialUi.Divider, null),
            _react2['default'].createElement(
                _materialUi.CardActions,
                { style: { textAlign: 'right' } },
                _react2['default'].createElement(_materialUi.FlatButton, { label: message('ent.btn.more'), icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "icomoon-cells" }), primary: true, onTouchTap: function () {
                        window.open('https://pydio.com/en/features/pydio-cells-overview');
                    } }),
                _react2['default'].createElement(_materialUi.FlatButton, { label: message('ent.btn.contact'), icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-domain" }), primary: true, onTouchTap: function () {
                        window.open('https://pydio.com/en/pricing/contact');
                    } })
            )
        );

        return _react2['default'].createElement(
            'div',
            { className: "main-layout-nav-to-stack vertical-layout" },
            _react2['default'].createElement(
                'div',
                { className: "layout-fill", style: { display: 'flex', alignItems: 'top', flexWrap: 'wrap', padding: 5 } },
                WELCOME_COMMUNITY_CARD,
                DISCOVER_ENTERPRISE_CARD,
                PAY_IT_FORWARD_CARD
            )
        );
    }

});

exports['default'] = Dashboard = (0, _materialUiStyles.muiThemeable)()(Dashboard);
exports['default'] = Dashboard;
module.exports = exports['default'];
