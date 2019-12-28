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

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _queryString = require('query-string');

var _queryString2 = _interopRequireDefault(_queryString);

var LanguagePicker = function LanguagePicker(_ref) {
    var parent = _ref.parent;

    if (parent) {
        return React.createElement(parent.LanguagePicker, null);
    }

    return React.createElement('div', null);
};

exports['default'] = React.createClass({
    displayName: 'LoginConnectorsDialog',

    mixins: [PydioReactUI.ActionDialogMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogIsModal: true,
            dialogSize: 'sm'
        };
    },

    getInitialState: function getInitialState() {
        return {
            connectors: [{
                "Id": "pydio",
                "Name": "Pydio Aggregation Connector",
                "Type": "pydio"
            }, {
                "Id": "okta",
                "Name": "okta",
                "Type": "oidc"
            }]
        };
        // return {
        //     connectors: [],
        // }
    },

    useBlur: function useBlur() {
        return true;
    },

    componentDidMount: function componentDidMount(props) {
        var _this = this;

        pydio.observeOnce('user_logged', function () {
            return _this.dismiss();
        });

        ResourcesManager.loadClass('AuthfrontCoreActions').then(function (authfrontCoreActions) {
            return _this.setState({
                authfrontCoreActions: authfrontCoreActions
            });
        });
    },

    handleClick: function handleClick(connectorID) {
        if (connectorID == "pydio") {
            pydio.getController().fireAction('loginprev', { "createAuthRequest": false });
            return;
        }

        _pydioHttpApi2['default'].getRestClient().sessionLogin().then(function () {
            window.location.href = "/auth/dex/login/" + connectorID + "?challenge=" + window.sessionStorage.challenge;
        });

        // PydioApi.getRestClient().jwtWithAuthInfo({type: "create_auth_request", connectorID: connectorID, ...parsed}).then(() => {
        //     api.frontAuthState().then(({RequestID}) => {
        //         window.location.href = "/auth/dex/auth/" + connectorID + "?req=" + RequestID
        //     })
        // })
    },

    render: function render() {
        var _this2 = this;

        var _state = this.state;
        var connectors = _state.connectors;
        var authfrontCoreActions = _state.authfrontCoreActions;

        if (connectors.length <= 1) {
            return null;
        }

        var custom = this.props.pydio.Parameters.get('customWording');
        var logoUrl = custom.icon;
        if (custom.iconBinary) {
            logoUrl = pydio.Parameters.get('ENDPOINT_REST_API') + "/frontend/binaries/GLOBAL/" + custom.iconBinary;
        }

        var logoStyle = {
            backgroundSize: 'contain',
            backgroundImage: 'url(' + logoUrl + ')',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'absolute',
            top: -130,
            left: 0,
            width: 320,
            height: 120
        };

        return React.createElement(
            DarkThemeContainer,
            { style: { width: 270 } },
            logoUrl && React.createElement('div', { style: logoStyle }),
            React.createElement(
                'div',
                { className: 'dialogLegend', style: { fontSize: 22, paddingBottom: 12, lineHeight: '28px' } },
                pydio.MessageHash["oauth.login"],
                React.createElement(LanguagePicker, { parent: authfrontCoreActions })
            ),
            React.createElement(
                _materialUi.List,
                null,
                connectors.map(function (connector) {
                    return React.createElement(_materialUi.ListItem, {
                        primaryText: connector.Id !== "pydio" && connector.Name || pydio.getPluginConfigs("core.pydio").get("APPLICATION_TITLE"),
                        onClick: function () {
                            return _this2.handleClick(connector.Id);
                        },
                        rightIcon: React.createElement(_materialUi.FontIcon, { color: 'white', className: "mdi mdi-chevron-right" })
                    });
                })
            )
        );
    }
});

var DarkThemeContainer = (function (_React$Component) {
    _inherits(DarkThemeContainer, _React$Component);

    function DarkThemeContainer() {
        _classCallCheck(this, DarkThemeContainer);

        _get(Object.getPrototypeOf(DarkThemeContainer.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(DarkThemeContainer, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var muiTheme = _props.muiTheme;

            var props = _objectWithoutProperties(_props, ['muiTheme']);

            var baseTheme = _extends({}, _materialUiStyles.darkBaseTheme);
            baseTheme.palette.primary1Color = muiTheme.palette.accent1Color;
            var darkTheme = (0, _materialUiStyles.getMuiTheme)(baseTheme);

            return React.createElement(
                _materialUi.MuiThemeProvider,
                { muiTheme: darkTheme },
                React.createElement('div', props)
            );
        }
    }]);

    return DarkThemeContainer;
})(React.Component);

DarkThemeContainer = (0, _materialUiStyles.muiThemeable)()(DarkThemeContainer);
module.exports = exports['default'];
