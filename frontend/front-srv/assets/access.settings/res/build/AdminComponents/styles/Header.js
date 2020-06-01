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

var _react = require('react');

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _pydioUtilDom = require('pydio/util/dom');

var _pydioUtilDom2 = _interopRequireDefault(_pydioUtilDom);

var _AdminStyles = require("./AdminStyles");

var _AdminStyles2 = _interopRequireDefault(_AdminStyles);

var _boardAdminDashboard = require('../board/AdminDashboard');

var Header = (function (_Component) {
    _inherits(Header, _Component);

    function Header() {
        _classCallCheck(this, Header);

        _get(Object.getPrototypeOf(Header.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Header, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var reloadAction = _props.reloadAction;
            var loading = _props.loading;
            var backButtonAction = _props.backButtonAction;
            var scrolling = _props.scrolling;
            var title = _props.title;
            var centerContent = _props.centerContent;
            var actions = _props.actions;
            var tabs = _props.tabs;
            var tabValue = _props.tabValue;
            var onTabChange = _props.onTabChange;
            var muiTheme = _props.muiTheme;
            var editorMode = _props.editorMode;

            var adminStyles = (0, _AdminStyles2['default'])(muiTheme.palette);
            var listener = _boardAdminDashboard.LeftToggleListener.getInstance();

            var styles = {
                base: {
                    padding: listener.isActive() ? '0 16px 0 0' : '0 16px',
                    backgroundColor: '#ffffff',
                    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 2px',
                    zIndex: 10,
                    marginLeft: listener.isActive() && listener.isOpen() ? 256 : 0
                },
                container: {
                    display: 'flex',
                    width: '100%',
                    paddingLeft: 12,
                    height: 64,
                    alignItems: 'center'
                },
                title: {
                    fontSize: 18,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                },
                legend: {},
                icon: {
                    color: 'rgba(0,0,0,0.24)',
                    marginRight: 6
                },
                refresh: {
                    display: 'inline-block',
                    position: 'relative',
                    marginRight: 9,
                    marginLeft: 9
                },
                tabs: {
                    tab: {
                        fontSize: 15,
                        marginBottom: 0,
                        paddingBottom: 13,
                        paddingLeft: 20,
                        paddingRight: 20,
                        textTransform: 'uppercase',
                        fontWeight: 500,
                        cursor: 'pointer',
                        color: 'rgba(0, 0, 0, 0.73)',
                        transition: _pydioUtilDom2['default'].getBeziersTransition(),
                        borderBottom: '2px solid transparent'
                    },
                    tabIcon: {
                        fontSize: 14,
                        color: 'inherit',
                        marginRight: 5
                    },
                    tabActive: {
                        borderBottom: '2px solid ' + muiTheme.palette.primary2Color,
                        color: muiTheme.palette.primary2Color
                    }
                }
            };

            styles.scrolling = _extends({}, styles.base, {
                backgroundColor: 'rgba(236,239,241,0.8)',
                borderBottom: 0,
                position: 'absolute',
                zIndex: 8,
                left: 0,
                right: 0
            });

            if (editorMode) {
                styles.base = _extends({}, styles.base, {
                    backgroundColor: muiTheme.palette.primary1Color,
                    borderBottom: 0,
                    borderRadius: '2px 2px 0 0 '
                });
                styles.title = _extends({}, styles.title, {
                    color: 'white'
                });
                styles.container = _extends({}, styles.container, {
                    height: 48
                });
                styles.scrolling = _extends({}, styles.base, styles.scrolling, {
                    backgroundColor: muiTheme.palette.primary1Color
                });
            }

            var icon = undefined;
            if (listener.isActive()) {
                icon = React.createElement(_materialUi.IconButton, { iconClassName: listener.isOpen() ? "mdi mdi-backburger" : "mdi mdi-menu", iconStyle: styles.icon, onTouchTap: function () {
                        return listener.toggle();
                    } });
            } else if (this.props.icon) {
                icon = React.createElement(_materialUi.FontIcon, { className: this.props.icon, style: styles.icon });
            } else if (backButtonAction) {
                icon = React.createElement(_materialUi.IconButton, { style: { marginLeft: -18 }, iconClassName: "mdi mdi-chevron-left", onTouchTap: backButtonAction });
            }

            var reloadButton = undefined;
            if (reloadAction) {
                reloadButton = React.createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-reload", onTouchTap: reloadAction }, adminStyles.props.header.iconButton));
            }

            var headTitle = React.createElement(
                'h3',
                { style: styles.title },
                title
            );
            if (tabs) {
                headTitle = React.createElement(
                    'div',
                    { style: { display: 'flex' } },
                    tabs.map(function (tab) {
                        var st = styles.tabs.tab;
                        if (tab.Value === tabValue) {
                            st = _extends({}, st, styles.tabs.tabActive);
                        }
                        var icon = tab.Icon ? React.createElement(_materialUi.FontIcon, { className: tab.Icon, style: styles.tabs.tabIcon }) : null;
                        return React.createElement(
                            'h3',
                            { style: st, onClick: function () {
                                    return onTabChange(tab.Value);
                                } },
                            icon,
                            tab.Label
                        );
                    })
                );
            }
            var actionButtons = actions;
            if (!actionButtons) {
                actionButtons = [];
            } else if (!actionButtons.map) {
                actionButtons = [actionButtons];
            }

            return React.createElement(
                _materialUi.Paper,
                { style: scrolling ? styles.scrolling : styles.base, zDepth: scrolling ? 1 : 0 },
                React.createElement(
                    'div',
                    { style: styles.container },
                    icon,
                    headTitle,
                    React.createElement(
                        'div',
                        { style: { flex: 1, marginRight: centerContent ? 8 : 0 } },
                        centerContent
                    ),
                    React.createElement(
                        'div',
                        { style: { display: 'flex', alignItems: 'center', marginTop: -2 } },
                        actionButtons.map(function (a) {
                            return React.createElement(
                                'div',
                                { style: { margin: '0 8px' } },
                                a
                            );
                        }),
                        !loading && reloadButton,
                        loading && React.createElement(_materialUi.RefreshIndicator, {
                            size: 30,
                            left: 0,
                            top: 0,
                            status: 'loading',
                            style: styles.refresh
                        })
                    )
                )
            );
        }
    }]);

    return Header;
})(_react.Component);

exports['default'] = Header = (0, _materialUiStyles.muiThemeable)()(Header);
exports['default'] = Header;
module.exports = exports['default'];
