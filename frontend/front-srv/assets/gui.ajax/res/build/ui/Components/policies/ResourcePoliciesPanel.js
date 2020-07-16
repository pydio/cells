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

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _pydioHttpPolicies = require('pydio/http/policies');

var _pydioHttpPolicies2 = _interopRequireDefault(_pydioHttpPolicies);

var _pydioHttpUsersApi = require('pydio/http/users-api');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _pydio2 = require('pydio');

var _pydio3 = _interopRequireDefault(_pydio2);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _usersUsersCompleter = require('../users/UsersCompleter');

var _usersUsersCompleter2 = _interopRequireDefault(_usersUsersCompleter);

var ResourcePoliciesPanel = (function (_React$Component) {
    _inherits(ResourcePoliciesPanel, _React$Component);

    function ResourcePoliciesPanel(props) {
        _classCallCheck(this, ResourcePoliciesPanel);

        if (!props.subjectsDisabled) {
            props.subjectsDisabled = { 'READ': {}, 'WRITE': {} };
        }
        if (props.cellAcls) {
            Object.keys(props.cellAcls).map(function (k) {
                if (props.cellAcls[k].RoleId) {
                    props.subjectsDisabled['READ']["role:" + props.cellAcls[k].RoleId] = true;
                }
            });
        }
        _React$Component.call(this, props);
        this.state = {
            edit: false,
            loading: true,
            policies: [],
            diffPolicies: { add: {}, remove: {} },
            hideGroups: _pydio3['default'].getInstance().getPluginConfigs("action.advanced_settings").get("DISABLE_SHARE_GROUPS") === true
        };
    }

    ResourcePoliciesPanel.prototype.componentDidMount = function componentDidMount() {
        this.setState({ loading: true });
        this.reload();
    };

    ResourcePoliciesPanel.prototype.reload = function reload() {
        var _this = this;

        var _props = this.props;
        var resourceType = _props.resourceType;
        var resourceId = _props.resourceId;
        var _pydio = pydio;
        var user = _pydio.user;

        var proms = [_pydioHttpPolicies2['default'].loadPolicies(resourceType, resourceId), user.getIdmUser()];
        if (resourceType !== 'team') {
            proms.push(_pydioHttpApi2['default'].getRestClient().getIdmApi().listTeams());
        }
        Promise.all(proms).then(function (result) {
            var policies = result[0];
            var resourceUuid = policies[0].Resource;
            var idmUser = result[1];
            var teams = [];
            if (resourceType !== 'team' && result[2]) {
                teams = result[2].Teams;
            }
            _this.setState({
                policies: policies,
                idmUser: idmUser,
                userTeams: teams,
                loading: false,
                resourceUuid: resourceUuid
            });
        })['catch'](function (error) {
            _this.setState({ error: error.message, loading: false });
        });
    };

    ResourcePoliciesPanel.prototype.revert = function revert() {
        this.setState({ dirtyPolicies: null, diffPolicies: { add: {}, remove: {} } });
    };

    ResourcePoliciesPanel.prototype.save = function save() {
        var _this2 = this;

        var _state = this.state;
        var dirtyPolicies = _state.dirtyPolicies;
        var diffPolicies = _state.diffPolicies;
        var _props2 = this.props;
        var resourceType = _props2.resourceType;
        var resourceId = _props2.resourceId;
        var onSavePolicies = _props2.onSavePolicies;

        _pydioHttpPolicies2['default'].savePolicies(resourceType, resourceId, dirtyPolicies).then(function (result) {
            _this2.setState({ policies: result, dirtyPolicies: null, diffPolicies: { add: {}, remove: {} } });
            if (onSavePolicies) {
                onSavePolicies(diffPolicies);
            }
        })['catch'](function (reason) {
            _this2.setState({ error: reason.message });
        });
        //console.log(dirtyPolicies, diffPolicies);
    };

    ResourcePoliciesPanel.prototype.removePolicy = function removePolicy(action, subject) {
        var _state2 = this.state;
        var policies = _state2.policies;
        var dirtyPolicies = _state2.dirtyPolicies;
        var diffPolicies = _state2.diffPolicies;

        if (dirtyPolicies) {
            policies = dirtyPolicies;
        }
        var newPolicies = [];
        policies.map(function (p) {
            if (p.Action !== action || p.Subject !== subject) {
                newPolicies.push(p);
            }
        });
        diffPolicies.remove[action + '///' + subject] = true;
        if (diffPolicies.add[action + '///' + subject]) {
            delete diffPolicies.add[action + '///' + subject];
        }
        this.setState({ dirtyPolicies: newPolicies, diffPolicies: diffPolicies });
    };

    ResourcePoliciesPanel.prototype.addPolicy = function addPolicy(action, subject) {
        var isPickedUser = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
        var _state3 = this.state;
        var policies = _state3.policies;
        var dirtyPolicies = _state3.dirtyPolicies;
        var resourceUuid = _state3.resourceUuid;
        var diffPolicies = _state3.diffPolicies;

        var newPolicies = dirtyPolicies ? [].concat(dirtyPolicies) : [].concat(policies);
        var newPol = new _pydioHttpRestApi.ServiceResourcePolicy();
        newPol.Resource = resourceUuid;
        newPol.Effect = 'allow';
        newPol.Subject = subject;
        newPol.Action = action;
        newPolicies.push(newPol);

        diffPolicies.add[action + '///' + subject] = true;
        if (diffPolicies.remove[action + '///' + subject]) {
            delete diffPolicies.remove[action + '///' + subject];
        }
        if (isPickedUser) {
            this.setState({ dirtyPolicies: newPolicies, diffPolicies: diffPolicies, pickedUser: null, pickedLabel: null });
        } else {
            this.setState({ dirtyPolicies: newPolicies, diffPolicies: diffPolicies });
        }
    };

    /**
     *
     * @param policies
     * @return {boolean}
     */

    ResourcePoliciesPanel.prototype.hasOneWrite = function hasOneWrite(policies) {
        var idmUser = this.state.idmUser;

        var userSubjects = idmUser.Roles.map(function (role) {
            return 'role:' + role.Uuid;
        });
        userSubjects.push('user:' + idmUser.Login);

        for (var i = 0; i < userSubjects.length; i++) {
            for (var j = 0; j < policies.length; j++) {
                if (policies[j].Subject === userSubjects[i] && policies[j].Action === 'WRITE') {
                    return true;
                }
            }
        }
        return false;
    };

    ResourcePoliciesPanel.prototype.findCrtUserSubject = function findCrtUserSubject(policies) {
        var idmUser = this.state.idmUser;

        var search = ['user:' + idmUser.Login, 'role:' + idmUser.Uuid];
        var pp = policies.filter(function (p) {
            return search.indexOf(p.Subject) > -1;
        });
        if (pp.length) {
            return pp[0].Subject;
        } else {
            return search[0];
        }
    };

    /**
     *
     * @param policies
     * @return {{groupBlocks: Array, hasWrite: boolean}}
     */

    ResourcePoliciesPanel.prototype.listUserRoles = function listUserRoles(policies) {
        var _state4 = this.state;
        var hideGroups = _state4.hideGroups;
        var idmUser = _state4.idmUser;

        var crtUserSubject = this.findCrtUserSubject(policies);
        var hasWrite = this.hasOneWrite(policies);

        var values = {};
        idmUser.Roles.map(function (role) {
            if (!role.GroupRole || hideGroups) {
                return;
            }
            values['role:' + role.Uuid] = role.Label;
        });

        // Add other subjects
        values = _extends({}, this.listOtherUsersSubjects(policies, crtUserSubject), values);
        values[crtUserSubject] = 'You';
        var keys = Object.keys(values);
        // Build Lines
        var groupBlocks = [];
        for (var i = keys.length - 1; i >= 0; i--) {
            var newKey = keys[i];
            var newVal = values[newKey];
            groupBlocks.push(this.renderLine(newKey, newVal, policies, !hasWrite || newKey === crtUserSubject));
        }
        return { groupBlocks: groupBlocks, hasWrite: hasWrite };
    };

    /**
     *
     * @param userTeams
     * @param policies
     * @param disabled
     * @return {XML}[]
     */

    ResourcePoliciesPanel.prototype.listUserTeams = function listUserTeams(userTeams, policies, disabled) {
        var _this3 = this;

        return userTeams.map(function (role) {
            return _this3.renderLine('role:' + role.Uuid, role.Label, policies, disabled);
        });
    };

    ResourcePoliciesPanel.prototype.listOtherUsersSubjects = function listOtherUsersSubjects(policies, currentUserSubject) {
        var _props3 = this.props;
        var resourceId = _props3.resourceId;
        var cellAcls = _props3.cellAcls;
        var hideGroups = this.state.hideGroups;

        var subs = {};
        policies.map(function (p) {
            if (p.Subject.indexOf('user:') === 0 && p.Subject !== currentUserSubject && p.Subject !== 'user:' + resourceId) {
                subs[p.Subject] = p.Subject.substr('user:'.length);
            }
            if (cellAcls && p.Subject.indexOf('role:') === 0 && cellAcls[p.Subject.substr('role:'.length)]) {
                var roleId = p.Subject.substr('role:'.length);
                if (cellAcls[roleId].User) {
                    var usr = cellAcls[roleId].User;
                    if (currentUserSubject !== 'user:' + usr.Login && currentUserSubject !== 'role:' + usr.Uuid) {
                        subs[p.Subject] = usr.Attributes && usr.Attributes['displayName'] ? usr.Attributes['displayName'] : usr.Login;
                    }
                } else if (cellAcls[roleId].Group && !hideGroups) {
                    var grp = cellAcls[roleId].Group;
                    subs[p.Subject] = grp.Attributes && grp.Attributes['displayName'] ? grp.Attributes['displayName'] : grp.GroupLabel;
                }
            }
        });
        return subs;
    };

    /**
     *
     * @param userOrRole {{IdmUser,IdmRole}}
     */

    ResourcePoliciesPanel.prototype.pickUser = function pickUser(userOrRole) {
        var subject = undefined,
            label = undefined;
        if (userOrRole.IdmUser) {
            var IdmUser = userOrRole.IdmUser;

            var attributes = IdmUser.Attributes || {};
            if (IdmUser.IsGroup) {
                subject = 'role:' + IdmUser.Uuid;
                label = attributes['displayName'] || IdmUser.GroupLabel;
            } else {
                subject = 'user:' + IdmUser.Login;
                label = attributes['displayName'] || IdmUser.Login;
            }
        } else {
            var IdmRole = userOrRole.IdmRole;

            subject = 'role:' + IdmRole.Uuid;
            label = IdmRole.Label;
        }
        this.setState({ pickedUser: subject, pickedLabel: label });
    };

    /**
     *
     * @param subject
     * @param label
     * @param policies
     * @param disabled
     * @param isPickedUser
     * @return {XML}
     */

    ResourcePoliciesPanel.prototype.renderLine = function renderLine(subject, label, policies, disabled) {
        var _this4 = this;

        var isPickedUser = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];
        var _props4 = this.props;
        var subjectsDisabled = _props4.subjectsDisabled;
        var subjectsHidden = _props4.subjectsHidden;
        var readonly = _props4.readonly;

        if (subjectsHidden && subjectsHidden[subject]) {
            return null;
        }

        var read = false,
            write = false;
        var readChange = function readChange() {
            _this4.addPolicy('READ', subject, isPickedUser);
        };
        var writeChange = function writeChange() {
            _this4.addPolicy('WRITE', subject, isPickedUser);
        };
        policies.map(function (p) {
            if (p.Subject !== subject) {
                return;
            }
            if (p.Action === 'WRITE') {
                write = p.Action === 'WRITE';
                writeChange = function () {
                    _this4.removePolicy('WRITE', subject);
                };
            } else if (p.Action === 'READ') {
                read = p.Action === 'READ';
                readChange = function () {
                    _this4.removePolicy('READ', subject);
                };
            }
        });
        var disableWrite = disabled;
        var disableRead = disabled;
        if (readonly) {
            disableRead = true;
            disableWrite = true;
        } else {
            if (subjectsDisabled && subjectsDisabled['READ'] && subjectsDisabled['READ'][subject]) {
                disableRead = true;
            }
            if (subjectsDisabled && subjectsDisabled['WRITE'] && subjectsDisabled['WRITE'][subject]) {
                disableWrite = true;
            }
        }
        console.log("Line", subject, label, disableRead, disableWrite);
        return _react2['default'].createElement(
            'div',
            { style: { display: 'flex', margin: 10, marginRight: 0 } },
            _react2['default'].createElement(
                'div',
                { style: { flex: 1 } },
                label
            ),
            _react2['default'].createElement(_materialUi.Checkbox, { checked: read, disabled: disableRead, style: { width: 40 }, onCheck: readChange }),
            _react2['default'].createElement(_materialUi.Checkbox, { checked: write, disabled: disableWrite, style: { width: 40 }, onCheck: writeChange })
        );
    };

    ResourcePoliciesPanel.prototype.render = function render() {
        var _this5 = this;

        var appBar = this.props.muiTheme.appBar;

        var styles = {
            title: {
                paddingLeft: 10,
                backgroundColor: appBar.color,
                display: 'flex',
                alignItems: 'center',
                fontSize: 16,
                color: appBar.textColor
            },
            subheader: {
                margin: 10,
                fontWeight: 500,
                color: '#9E9E9E',
                display: 'flex'
            },
            subject: {
                margin: 10
            },
            head: {
                display: 'inline-block',
                width: 40,
                textAlign: 'center',
                fontSize: 10
            }
        };
        var _state5 = this.state;
        var edit = _state5.edit;
        var policies = _state5.policies;
        var dirtyPolicies = _state5.dirtyPolicies;
        var error = _state5.error;
        var idmUser = _state5.idmUser;
        var userTeams = _state5.userTeams;
        var loading = _state5.loading;
        var pickedUser = _state5.pickedUser;
        var pickedLabel = _state5.pickedLabel;
        var _props5 = this.props;
        var onDismiss = _props5.onDismiss;
        var style = _props5.style;
        var skipTitle = _props5.skipTitle;
        var resourceId = _props5.resourceId;
        var pydio = _props5.pydio;
        var userListExcludes = _props5.userListExcludes;
        var readonly = _props5.readonly;
        var description = _props5.description;

        var blocks = [];
        var mess = pydio.MessageHash;

        if (!edit) {
            return _react2['default'].createElement(
                'div',
                { style: style },
                !skipTitle && _react2['default'].createElement(
                    'div',
                    { style: _extends({}, styles.title, { height: 48 }) },
                    _react2['default'].createElement(
                        'span',
                        { style: { flex: 1 } },
                        mess['visibility.panel.title']
                    )
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: 20, color: 'rgba(0,0,0,.43)', fontWeight: 500, textAlign: 'justify' } },
                    _react2['default'].createElement(
                        'div',
                        { style: { paddingBottom: 20 } },
                        description
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { textAlign: 'center' } },
                        _react2['default'].createElement(_materialUi.RaisedButton, { label: mess['visibility.panel.edit'], primary: true, onTouchTap: function () {
                                _this5.setState({ edit: true });
                            } })
                    )
                )
            );
        }

        if (!loading && !error) {
            var _listUserRoles = this.listUserRoles(dirtyPolicies ? dirtyPolicies : policies);

            var groupBlocks = _listUserRoles.groupBlocks;
            var hasWrite = _listUserRoles.hasWrite;

            var teamBlocks = this.listUserTeams(userTeams, dirtyPolicies ? dirtyPolicies : policies, !hasWrite);
            var heads = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'span',
                    { style: styles.head },
                    mess['visibility.panel.right-read']
                ),
                _react2['default'].createElement(
                    'span',
                    { style: styles.head },
                    mess['visibility.panel.right-edit']
                )
            );
            if (groupBlocks.length) {
                blocks.push(_react2['default'].createElement(
                    'div',
                    { style: styles.subheader },
                    _react2['default'].createElement(
                        'span',
                        { style: { flex: 1 } },
                        mess['visibility.panel.list.users']
                    ),
                    heads
                ));
                blocks.push(groupBlocks);
                blocks.push(_react2['default'].createElement(_materialUi.Divider, null));
            }
            if (teamBlocks.length) {
                blocks.push(_react2['default'].createElement(
                    'div',
                    { style: styles.subheader },
                    _react2['default'].createElement(
                        'span',
                        { style: { flex: 1 } },
                        mess['visibility.panel.list.teams']
                    ),
                    heads
                ));
                blocks.push(teamBlocks);
                blocks.push(_react2['default'].createElement(_materialUi.Divider, null));
            }
            if (pickedUser) {
                blocks.push(_react2['default'].createElement(
                    'div',
                    { style: styles.subheader },
                    mess['visibility.panel.setvisible']
                ));
                blocks.push(this.renderLine(pickedUser, pickedLabel, policies, false, true));
                blocks.push(_react2['default'].createElement(
                    'div',
                    { style: { textAlign: 'right' } },
                    _react2['default'].createElement(_materialUi.FlatButton, { label: mess[54], onTouchTap: function () {
                            _this5.setState({ pickedUser: null, pickedLabel: null });
                        } })
                ));
                blocks.push(_react2['default'].createElement(_materialUi.Divider, null));
            } else if (!readonly) {
                (function () {
                    var crtUserSubject = 'user:' + idmUser.Login;
                    var userSubjects = _this5.listOtherUsersSubjects(dirtyPolicies ? dirtyPolicies : policies, crtUserSubject);
                    var exludes = [];
                    Object.keys(userSubjects).map(function (k) {
                        exludes.push(userSubjects[k]);
                    });

                    // select an arbitrary resource
                    blocks.push(_react2['default'].createElement(
                        'div',
                        { style: styles.subheader },
                        mess['visibility.panel.setvisible']
                    ));
                    blocks.push(_react2['default'].createElement(
                        'div',
                        { style: { margin: '-30px 10px 0' } },
                        _react2['default'].createElement(_usersUsersCompleter2['default'], {
                            className: 'share-form-users',
                            fieldLabel: mess['visibility.panel.pickuser'],
                            renderSuggestion: function (userObject) {
                                return _react2['default'].createElement(
                                    'div',
                                    { style: { fontSize: 13 } },
                                    userObject.getExtendedLabel()
                                );
                            },
                            onValueSelected: _this5.pickUser.bind(_this5),
                            usersOnly: false,
                            existingOnly: true,
                            excludes: [resourceId].concat(userListExcludes, exludes),
                            pydio: pydio,
                            showAddressBook: false,
                            usersFrom: 'local'
                        })
                    ));
                    blocks.push(_react2['default'].createElement(_materialUi.Divider, null));
                })();
            }

            blocks.pop();
        }

        return _react2['default'].createElement(
            'div',
            { style: style },
            _react2['default'].createElement(
                'div',
                { style: styles.title },
                _react2['default'].createElement(
                    'span',
                    { style: { flex: 1 } },
                    skipTitle ? '' : mess['visibility.panel.title']
                ),
                dirtyPolicies && _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-undo-variant", tooltip: mess['visibility.panel.revert'], onTouchTap: this.revert.bind(this), iconStyle: { color: appBar.textColor } }),
                dirtyPolicies && _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-content-save", tooltip: mess['visibility.panel.save'], onTouchTap: this.save.bind(this), iconStyle: { color: appBar.textColor } }),
                !dirtyPolicies && onDismiss && _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-close", onTouchTap: onDismiss, iconStyle: { color: appBar.textColor } })
            ),
            error && _react2['default'].createElement(
                'div',
                null,
                mess['visibility.panel.error'],
                ': ',
                error
            ),
            _react2['default'].createElement(
                'div',
                null,
                blocks
            )
        );
    };

    return ResourcePoliciesPanel;
})(_react2['default'].Component);

ResourcePoliciesPanel.PropTypes = {
    pydio: _react2['default'].PropTypes.instanceOf(_pydio3['default']),
    resourceType: _react2['default'].PropTypes.string.isRequired,
    resourceId: _react2['default'].PropTypes.string.isRequired,
    description: _react2['default'].PropTypes.string.isRequired,
    onSavePolicies: _react2['default'].PropTypes.func,
    userListExcludes: _react2['default'].PropTypes.array,
    subjectsDisabled: _react2['default'].PropTypes.array,
    subjectsHidden: _react2['default'].PropTypes.object,
    readonly: _react2['default'].PropTypes.bool,
    cellAcls: _react2['default'].PropTypes.object,

    onDismiss: _react2['default'].PropTypes.func,
    style: _react2['default'].PropTypes.object,
    skipTitle: _react2['default'].PropTypes.bool

};

exports['default'] = ResourcePoliciesPanel = _materialUiStyles.muiThemeable()(ResourcePoliciesPanel);

exports['default'] = ResourcePoliciesPanel;
module.exports = exports['default'];
