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

var _utilMixins = require('../util/Mixins');

var React = require('react');

var _require = require('material-ui/styles');

var muiThemeable = _require.muiThemeable;

var _require2 = require('material-ui');

var Paper = _require2.Paper;
var Card = _require2.Card;
var CardTitle = _require2.CardTitle;
var CardMedia = _require2.CardMedia;
var CardActions = _require2.CardActions;
var CardHeader = _require2.CardHeader;
var CardText = _require2.CardText;
var FlatButton = _require2.FlatButton;
var List = _require2.List;
var ListItem = _require2.ListItem;
var Divider = _require2.Divider;
var IconButton = _require2.IconButton;
var FontIcon = _require2.FontIcon;

var shuffle = require('lodash.shuffle');

var Dashboard = React.createClass({
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
        return React.createElement(IconButton, {
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
        return React.createElement(
            'div',
            { style: { width: 180 }, key: icon },
            React.createElement(FlatButton, {
                primary: true,
                style: { height: 110, lineHeight: '20px' },
                label: React.createElement(
                    'div',
                    null,
                    React.createElement('div', { style: { fontSize: 36 }, className: "mdi mdi-" + icon }),
                    React.createElement(
                        'div',
                        null,
                        message
                    )
                ),
                fullWidth: true,
                onTouchTap: function () {
                    window.open(link);
                }
            })
        );
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

        var horizontalFlex = { display: 'flex', width: '100%' };
        var verticalFlex = { display: 'flex', flexDirection: 'column', height: '100%' };
        var flexFill = { flex: 1 };
        var paperStyle = { flex: 1, minWidth: 450, margin: 5 };
        var flexContainerStyle = _extends({}, verticalFlex);
        var _props$muiTheme$palette = this.props.muiTheme.palette;
        var accent1Color = _props$muiTheme$palette.accent1Color;
        var accent2Color = _props$muiTheme$palette.accent2Color;

        var MEDIA_TEST_CARD = React.createElement(
            Card,
            { style: paperStyle },
            React.createElement(
                CardMedia,
                {
                    overlay: React.createElement(CardTitle, { title: 'Want to contribute?', subtitle: 'Pydio is Open Source and will always be' })
                },
                React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'div',
                        { style: { backgroundColor: '#b0bec5', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 } },
                        React.createElement('div', { className: 'mdi mdi-github-circle', style: { fontSize: 200, paddingBottom: 60 } })
                    )
                )
            ),
            React.createElement(
                CardActions,
                null,
                React.createElement(FlatButton, { label: 'Get Started' })
            )
        );

        var pydio = this.props.pydio;

        var message = function message(id) {
            return pydio.MessageHash['admin_dashboard.' + id];
        };
        var OPEN_IN_NEW_ICON = React.createElement(IconButton, { iconClassName: 'mdi mdi-arrow-right', iconStyle: { color: 'rgba(0,0,0,.33)' }, tooltip: 'Open in new window' });

        // ADMIN GUIDE BUTTONS
        var guidesButtons = [{ icon: 'clock-start', id: 'start', link: 'https://pydio.com/en/docs/cells/v1/getting-started' }, { icon: 'network', id: 'ws', link: 'https://pydio.com/en/docs/cells/v1/storage-data-and-metadata' }, { icon: 'account-multiple', id: 'users', link: 'https://pydio.com/en/docs/cells/v1/access-control-and-security' }, { icon: 'professional-hexagon', id: 'advanced', link: 'https://pydio.com/en/docs/cells/v1/advanced' }];

        // DOCS LIST
        var kbItems = [];
        shuffle(this.state.kb).forEach(function (object) {
            kbItems.push(React.createElement(ListItem, { key: object.title, primaryText: object.title, secondaryText: object.desc, rightIconButton: _this2.getOpenIcon(object.link), secondaryTextLines: 2, disabled: true }));
            kbItems.push(React.createElement(Divider, { key: object.title + '-divider' }));
        });
        // Remove last divider
        if (kbItems.length) {
            kbItems.pop();
        }

        var WELCOME_COMMUNITY_CARD = React.createElement(
            Card,
            { style: paperStyle },
            React.createElement(CardTitle, {
                title: message('welc.title'),
                subtitle: message('welc.subtitle')
            }),
            React.createElement(
                CardText,
                null,
                React.createElement('style', { dangerouslySetInnerHTML: { __html: '.doc-link{color: ' + accent2Color + ';cursor: pointer;}' } }),
                React.createElement('span', { dangerouslySetInnerHTML: { __html: message('welc.intro') }, onClick: this.welcomeClick })
            ),
            React.createElement(
                CardText,
                null,
                message('welc.guide'),
                React.createElement(
                    'div',
                    { style: _extends({}, horizontalFlex, { flexWrap: 'wrap', justifyContent: 'center', padding: '10px 20px 0' }) },
                    guidesButtons.map(function (object) {
                        return _this2.getDocButton(object.icon, message('welc.btn.' + object.id), object.link);
                    })
                )
            )
        );

        var GET_SOME_HELP_CARD = React.createElement(
            Card,
            { style: paperStyle, containerStyle: flexContainerStyle },
            React.createElement(CardTitle, {
                title: message('kb.title'),
                subtitle: message('kb.subtitle')
            }),
            React.createElement(
                CardText,
                null,
                message('kb.intro')
            ),
            React.createElement(
                List,
                { style: { overflow: 'auto', flex: 1, maxHeight: 320 } },
                kbItems
            ),
            React.createElement(Divider, null),
            React.createElement(
                CardActions,
                { style: { textAlign: 'right' } },
                React.createElement(FlatButton, { label: message('kb.btn.alldocs'), primary: true, onTouchTap: function () {
                        window.open('https://github.com/pydio/cells/wiki');
                    } }),
                React.createElement(FlatButton, { label: message('kb.btn.forum'), primary: true, onTouchTap: function () {
                        window.open('https://forum.pydio.com/');
                    } })
            )
        );

        var PAY_IT_FORWARD_CARD = React.createElement(
            Card,
            { style: paperStyle, containerStyle: flexContainerStyle },
            React.createElement(CardTitle, { title: message('cont.title'), subtitle: message('cont.subtitle') }),
            React.createElement(
                CardText,
                { style: flexFill },
                React.createElement('div', { className: 'mdi mdi-github-circle', style: { fontSize: 60, display: 'inline-block', float: 'left', marginRight: 10, marginBottom: 10 } }),
                message('cont.intro'),
                React.createElement(
                    List,
                    null,
                    React.createElement(ListItem, { disabled: true, primaryText: message('cont.topic.report'), rightIconButton: this.getOpenIcon('https://forum.pydio.com/') }),
                    React.createElement(Divider, null),
                    React.createElement(ListItem, { disabled: true, primaryText: message('cont.topic.report.2'), rightIconButton: this.getOpenIcon('https://github.com/pydio/cells') }),
                    React.createElement(Divider, null),
                    React.createElement(ListItem, { disabled: true, primaryText: message('cont.topic.pr'), rightIconButton: this.getOpenIcon('https://github.com/pydio/cells') }),
                    React.createElement(Divider, null),
                    React.createElement(ListItem, { disabled: true, primaryText: message('cont.topic.translate'), rightIconButton: this.getOpenIcon('https://pydio.com/en/community/contribute/adding-translation-pydio') })
                )
            ),
            React.createElement(Divider, null),
            React.createElement(
                CardActions,
                { style: { textAlign: 'center' } },
                React.createElement(FlatButton, { label: message('cont.btn.github'), primary: true, icon: React.createElement(FontIcon, { className: 'mdi mdi-github-box' }), onTouchTap: function () {
                        window.open('https://github.com/pydio/cells');
                    } }),
                React.createElement(FlatButton, { label: message('cont.btn.tw'), primary: true, icon: React.createElement(FontIcon, { className: 'mdi mdi-twitter-box' }), onTouchTap: function () {
                        window.open('https://twitter.com/Pydio');
                    } }),
                React.createElement(FlatButton, { label: message('cont.btn.fb'), primary: true, icon: React.createElement(FontIcon, { className: 'mdi mdi-facebook-box' }), onTouchTap: function () {
                        window.open('https://facebook.com/Pydio/');
                    } })
            )
        );

        var DISCOVER_ENTERPRISE_CARD = React.createElement(
            Card,
            { style: paperStyle },
            React.createElement(
                CardMedia,
                {
                    overlay: React.createElement(CardTitle, { title: message('ent.title'), subtitle: message('ent.subtitle') })
                },
                React.createElement('div', { style: { height: 230, backgroundImage: 'url(plug/access.settings/res/images/dashboard.png)', backgroundSize: 'cover', borderRadius: 3 } })
            ),
            React.createElement(
                List,
                null,
                React.createElement(ListItem, { leftIcon: React.createElement(FontIcon, { style: { color: accent2Color }, className: 'mdi mdi-certificate' }), primaryText: message('ent.features'), secondaryText: message('ent.features.legend') }),
                React.createElement(Divider, null),
                React.createElement(ListItem, { leftIcon: React.createElement(FontIcon, { style: { color: accent2Color }, className: 'mdi mdi-chart-areaspline' }), primaryText: message('ent.advanced'), secondaryText: message('ent.advanced.legend') }),
                React.createElement(Divider, null),
                React.createElement(ListItem, { leftIcon: React.createElement(FontIcon, { style: { color: accent2Color }, className: 'mdi mdi-message-alert' }), primaryText: message('ent.support'), secondaryText: message('ent.support.legend') })
            ),
            React.createElement(Divider, null),
            React.createElement(
                CardActions,
                { style: { textAlign: 'right' } },
                React.createElement(FlatButton, { label: message('ent.btn.more'), primary: true, onTouchTap: function () {
                        window.open('https://pydio.com/en/features/pydio-cells-overview');
                    } }),
                React.createElement(FlatButton, { label: message('ent.btn.contact'), primary: true, onTouchTap: function () {
                        window.open('https://pydio.com/en/pricing/contact');
                    } })
            )
        );

        return React.createElement(
            'div',
            { className: "main-layout-nav-to-stack vertical-layout" },
            React.createElement(AdminComponents.Header, {
                title: message('welc.title'),
                icon: 'icomoon-cells'
            }),
            React.createElement(
                'div',
                { className: "layout-fill", style: { display: 'flex', alignItems: 'top', flexWrap: 'wrap', padding: 5 } },
                WELCOME_COMMUNITY_CARD,
                DISCOVER_ENTERPRISE_CARD,
                PAY_IT_FORWARD_CARD
            )
        );
    }

});

exports['default'] = Dashboard = muiThemeable()(Dashboard);
exports['default'] = Dashboard;
module.exports = exports['default'];
