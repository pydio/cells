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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _addressbookAddressBook = require('../addressbook/AddressBook');

var _addressbookAddressBook2 = _interopRequireDefault(_addressbookAddressBook);

var _policiesResourcePoliciesPanel = require('../../policies/ResourcePoliciesPanel');

var _policiesResourcePoliciesPanel2 = _interopRequireDefault(_policiesResourcePoliciesPanel);

var React = require('react');
var PydioApi = require('pydio/http/api');
var ResourcesManager = require('pydio/http/resources-manager');

var _require = require('material-ui');

var IconButton = _require.IconButton;
var Popover = _require.Popover;

var _require2 = require('material-ui/styles');

var muiThemeable = _require2.muiThemeable;

var _require$requireLib = require('pydio').requireLib('boot');

var PydioContextConsumer = _require$requireLib.PydioContextConsumer;
var AsyncComponent = _require$requireLib.AsyncComponent;

var ActionsPanel = (function (_React$Component) {
    _inherits(ActionsPanel, _React$Component);

    function ActionsPanel(props, context) {
        _classCallCheck(this, ActionsPanel);

        _React$Component.call(this, props, context);
        this.state = {
            showPicker: false, pickerAnchor: null,
            showMailer: false, mailerAnchor: null,
            showPolicies: false, policiesAnchor: null
        };
    }

    ActionsPanel.prototype.onTeamSelected = function onTeamSelected(item) {
        this.setState({ showPicker: false });
        if (item.IdmRole && item.IdmRole.IsTeam) {
            PydioApi.getRestClient().getIdmApi().addUserToTeam(item.IdmRole.Uuid, this.props.userId, this.props.reloadAction);
        }
    };

    ActionsPanel.prototype.onUserSelected = function onUserSelected(item) {
        //this.setState({showPicker: false});
        PydioApi.getRestClient().getIdmApi().addUserToTeam(this.props.team.id, item.IdmUser.Login, this.props.reloadAction);
    };

    ActionsPanel.prototype.openPicker = function openPicker(event) {
        this.setState({ showPicker: true, pickerAnchor: event.currentTarget });
    };

    ActionsPanel.prototype.openPolicies = function openPolicies(event) {
        this.setState({ showPolicies: true, policiesAnchor: event.currentTarget });
    };

    ActionsPanel.prototype.openMailer = function openMailer(event) {
        var _this = this;

        var target = event.currentTarget;
        ResourcesManager.loadClassesAndApply(['PydioMailer'], function () {
            _this.setState({ mailerLibLoaded: true }, function () {
                _this.setState({ showMailer: true, mailerAnchor: target });
            });
        });
    };

    ActionsPanel.prototype.componentDidUpdate = function componentDidUpdate(prevProps, prevState) {
        if (!this.props.lockOnSubPopoverOpen) {
            return;
        }
        if ((this.state.showPicker || this.state.showMailer) && !(prevState.showPicker || prevState.showMailer)) {
            this.props.lockOnSubPopoverOpen(true);
        } else if (!(this.state.showPicker || this.state.showMailer) && (prevState.showPicker || prevState.showMailer)) {
            this.props.lockOnSubPopoverOpen(false);
        }
    };

    ActionsPanel.prototype.render = function render() {
        var _this2 = this;

        var _props = this.props;
        var getMessage = _props.getMessage;
        var muiTheme = _props.muiTheme;
        var team = _props.team;
        var user = _props.user;
        var userEditable = _props.userEditable;
        var userId = _props.userId;
        var style = _props.style;
        var zDepth = _props.zDepth;

        var teamsEditable = _pydio2['default'].getInstance().getController().actions.has("user_team_create");

        var styles = {
            button: {
                //backgroundColor: muiTheme.palette.accent2Color,
                border: '1px solid ' + muiTheme.palette.accent2Color,
                borderRadius: '50%',
                margin: '0 4px',
                width: 36,
                height: 36,
                padding: 6
            },
            icon: {
                fontSize: 22,
                //color: 'white'
                color: muiTheme.palette.accent2Color
            }
        };
        var usermails = {};
        var actions = [];
        var resourceType = undefined,
            resourceId = undefined;
        if (user && user.IdmUser && user.IdmUser.Attributes && (user.IdmUser.Attributes['hasEmail'] || user.IdmUser.Attributes['email'])) {
            actions.push({ key: 'message', label: getMessage(598), icon: 'email', callback: this.openMailer.bind(this) });
            usermails[user.IdmUser.Login] = user.IdmUser;
        }
        if (team) {
            resourceType = 'team';
            resourceId = team.id;
            if (teamsEditable) {
                actions.push({ key: 'users', label: getMessage(599), icon: 'account-multiple-plus', callback: this.openPicker.bind(this) });
            }
        } else {
            resourceType = 'user';
            resourceId = userId;
            if (teamsEditable) {
                actions.push({ key: 'teams', label: getMessage(573), icon: 'account-multiple-plus', callback: this.openPicker.bind(this) });
            }
        }
        if (userEditable && !(this.props.team && !teamsEditable)) {
            if (this.props.onEditAction) {
                actions.push({ key: 'edit', label: this.props.team ? getMessage(580) : getMessage(600), icon: 'pencil', callback: this.props.onEditAction });
            }
            actions.push({ key: 'policies', label: 'Visibility', icon: 'security', callback: this.openPolicies.bind(this) });
            if (this.props.onDeleteAction) {
                actions.push({ key: 'delete', label: this.props.team ? getMessage(570) : getMessage(582), icon: 'delete', callback: this.props.onDeleteAction });
            }
        }
        if (actions.length === 0) {
            return null;
        }

        return React.createElement(
            'div',
            { style: _extends({ textAlign: 'center', paddingTop: 10, paddingBottom: 10, borderTop: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }, style) },
            actions.map(function (a) {
                return React.createElement(IconButton, {
                    key: a.key,
                    style: styles.button,
                    iconStyle: styles.icon,
                    tooltip: a.label,
                    iconClassName: "mdi mdi-" + a.icon,
                    onClick: a.callback
                });
            }),
            React.createElement(
                Popover,
                {
                    open: this.state.showPicker,
                    anchorEl: this.state.pickerAnchor,
                    anchorOrigin: { horizontal: 'right', vertical: 'top' },
                    targetOrigin: { horizontal: 'right', vertical: 'top' },
                    onRequestClose: function () {
                        _this2.setState({ showPicker: false });
                    },
                    useLayerForClickAway: false,
                    style: { zIndex: 2200 }
                },
                React.createElement(
                    'div',
                    { style: { width: 256, height: 320 } },
                    React.createElement(_addressbookAddressBook2['default'], {
                        mode: 'selector',
                        pydio: this.props.pydio,
                        loaderStyle: { width: 320, height: 320 },
                        onItemSelected: this.props.team ? this.onUserSelected.bind(this) : this.onTeamSelected.bind(this),
                        teamsOnly: !this.props.team,
                        usersOnly: !!this.props.team
                    })
                )
            ),
            React.createElement(
                Popover,
                {
                    open: this.state.showMailer,
                    anchorEl: this.state.mailerAnchor,
                    anchorOrigin: { horizontal: 'right', vertical: 'top' },
                    targetOrigin: { horizontal: 'right', vertical: 'top' },
                    useLayerForClickAway: false,
                    style: { zIndex: 2200 }
                },
                React.createElement(
                    'div',
                    { style: { width: 256, height: 320 } },
                    this.state.mailerLibLoaded && React.createElement(AsyncComponent, {
                        namespace: 'PydioMailer',
                        componentName: 'Pane',
                        pydio: _pydio2['default'].getInstance(),
                        zDepth: 0,
                        panelTitle: getMessage(598),
                        uniqueUserStyle: true,
                        users: usermails,
                        templateId: "DM",
                        templateData: { "From": _pydio2['default'].getInstance().user.getPreference('displayName') || _pydio2['default'].getInstance().user.id },
                        onDismiss: function () {
                            _this2.setState({ showMailer: false });
                        },
                        onFieldFocus: this.props.otherPopoverMouseOver
                    })
                )
            ),
            React.createElement(
                Popover,
                {
                    open: this.state.showPolicies,
                    anchorEl: this.state.policiesAnchor,
                    anchorOrigin: { horizontal: 'right', vertical: 'top' },
                    targetOrigin: { horizontal: 'right', vertical: 'top' },
                    useLayerForClickAway: false,
                    style: { zIndex: 2000 }
                },
                React.createElement(
                    'div',
                    { style: { width: 256, height: 320 } },
                    React.createElement(_policiesResourcePoliciesPanel2['default'], {
                        description: this.props.pydio.MessageHash['visibility.users.advanced'],
                        pydio: this.props.pydio,
                        resourceType: resourceType,
                        resourceId: resourceId,
                        onDismiss: function () {
                            _this2.setState({ showPolicies: false });
                        }
                    })
                )
            )
        );
    };

    return ActionsPanel;
})(React.Component);

ActionsPanel.propTypes = {

    /**
     * User data, props must pass at least one of 'user' or 'team'
     */
    user: _propTypes2['default'].object,
    /**
     * Team data, props must pass at least one of 'user' or 'team'
     */
    team: _propTypes2['default'].object,
    /**
     * For users, whether it is editable or not
     */
    userEditable: _propTypes2['default'].object

};

exports['default'] = ActionsPanel = PydioContextConsumer(ActionsPanel);
exports['default'] = ActionsPanel = muiThemeable()(ActionsPanel);

exports['default'] = ActionsPanel;
module.exports = exports['default'];
