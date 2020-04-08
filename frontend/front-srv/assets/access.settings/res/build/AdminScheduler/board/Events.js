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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _Pydio$requireLib = _pydio2['default'].requireLib("components");

var Stepper = _Pydio$requireLib.Stepper;
var Dialog = Stepper.Dialog;
var PanelBigButtons = Stepper.PanelBigButtons;

var LightGrey = '#e0e0e0';

var eventMessages = {
    NODE_CHANGE: {
        title: 'Files and folders (nodes) events : detect files modifications to move them or update their metadata automatically.',
        '0': {
            title: 'trigger.create.node',
            icon: 'file-plus',
            description: 'A new file was uploaded or a new folder was created'
        },
        '1': {
            title: 'trigger.read.node',
            icon: 'eye',
            description: 'A file was downloaded or a folder content was listed'
        },
        '2': {
            title: 'trigger.update.path',
            icon: 'folder-move',
            description: 'A file or folder was moved or renamed'
        },
        '3': {
            title: 'trigger.update.content',
            icon: 'content-save',
            description: 'A file content was updated by edition or upload overwriting'
        },
        '5': {
            title: 'trigger.delete.node',
            icon: 'delete',
            description: 'A file or a folder was definitively deleted'
        },
        '4': {
            title: 'trigger.update.metadata',
            icon: 'tag',
            description: 'Internal metadata were modified on file or folder'
        },
        '6': {
            title: 'trigger.update.user-metadata',
            icon: 'tag-multiple',
            description: 'User-defined metadata were modified (event contains updated metadata)'
        }
    },
    IDM_CHANGE: {
        USER: {
            title: 'User events : triggered when adding/removing user and when users log in and log out. Can be used for triggering validation flows or assigning accesses.',
            '0': {
                title: 'trigger.create.user',
                icon: 'account-plus',
                tint: '#009688',
                description: 'A user or a group was created'
            },
            '1': {
                title: 'trigger.read.user',
                icon: 'account',
                tint: '#009688',
                description: 'A user or a group was accessed'
            },
            '2': {
                title: 'trigger.update.user',
                icon: 'account-box',
                tint: '#009688',
                description: 'A user or a group data was updated'
            },
            '3': {
                title: 'trigger.delete.user',
                icon: 'account-minus',
                tint: '#009688',
                description: 'A user or a group was deleted'
            },
            '4': {
                title: 'trigger.bind.user',
                icon: 'login',
                tint: '#009688',
                description: 'A user has logged in'
            },
            '5': {
                title: 'trigger.logout.user',
                icon: 'logout',
                tint: '#009688',
                description: 'A user has logged out'
            }
        },
        ROLE: {
            title: 'Role events : can be used to automate accesses based on role names. Use IsTeam, IsGroup, IsUser flags to filter roles.',
            '0': {
                title: 'Create Role',
                icon: 'account-card-details',
                tint: '#607d8b',
                description: 'New role created.'
            },
            '2': {
                title: 'Update Role',
                icon: 'pencil',
                tint: '#607d8b',
                description: 'A role has been updated'
            },
            '3': {
                title: 'Delete Role',
                icon: 'delete-forever',
                tint: '#607d8b',
                description: 'A role has been deleted'
            }
        },
        WORKSPACE: {
            title: 'Workspace events : triggered on workspace creation / deletion. Use the Scope flag to filter Workspaces from Cells',
            '0': {
                title: 'Create Workspace',
                icon: 'folder-plus',
                tint: '#ff9800',
                description: 'A workspace has been created'
            },
            '2': {
                title: 'Update Workspace',
                icon: 'pencil',
                tint: '#ff9800',
                description: 'A workspace has been updated'
            },
            '3': {
                title: 'Delete Workspace',
                icon: 'delete-forever',
                tint: '#ff9800',
                description: 'New file uploaded or folder created'
            }
        },
        ACL: {
            title: 'ACL events : access control lists link workspaces, nodes and roles together to provide accesses to data.',
            '0': {
                title: 'Create Acl',
                icon: 'view-list',
                tint: '#795548',
                description: 'An access control has been opened'
            },
            '3': {
                title: 'Delete Acl',
                icon: 'delete-forever',
                tint: '#795548',
                description: 'An access control has been closed'
            }
        }
    }
};

var Events = (function (_React$Component) {
    _inherits(Events, _React$Component);

    function Events(props) {
        _classCallCheck(this, Events);

        _get(Object.getPrototypeOf(Events.prototype), 'constructor', this).call(this, props);
        this.state = { objEvents: this.toObject(props.events || []) };
    }

    _createClass(Events, [{
        key: 'onChange',
        value: function onChange() {
            this.props.onChange(Object.keys(this.state.objEvents));
        }
    }, {
        key: 'toObject',
        value: function toObject() {
            var ev = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

            var o = {};
            ev.forEach(function (e) {
                o[e] = e;
            });
            return o;
        }
    }, {
        key: 'remove',
        value: function remove(e) {
            var objEvents = this.state.objEvents;

            delete objEvents[e];
            this.setState({ objEvents: objEvents }, this.onChange.bind(this));
        }
    }, {
        key: 'add',
        value: function add(e) {
            var objEvents = this.state.objEvents;

            objEvents[e] = e;
            this.setState({ objEvents: objEvents }, this.onChange.bind(this));
        }
    }, {
        key: 'dismiss',
        value: function dismiss() {
            this.setState({ open: false, filter: '' });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _state = this.state;
            var objEvents = _state.objEvents;
            var open = _state.open;
            var filter = _state.filter;

            var list = [];
            Object.keys(objEvents).forEach(function (e) {
                list.push(_react2['default'].createElement(_materialUi.ListItem, {
                    key: e,
                    disabled: true,
                    primaryText: Events.eventData(e).title,
                    rightIconButton: _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-delete", iconStyle: { color: LightGrey }, onTouchTap: function () {
                            _this.remove(e);
                        } })
                }));
                list.push(_react2['default'].createElement(_materialUi.Divider, null));
            });
            list.pop();

            var model = Events.eventsAsBBModel(filter);

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    Dialog,
                    {
                        title: "Trigger job on...",
                        open: open,
                        dialogProps: {},
                        onDismiss: function () {
                            _this.dismiss();
                        },
                        onFilter: function (v) {
                            _this.setState({ filter: v.toLowerCase() });
                        }
                    },
                    _react2['default'].createElement(PanelBigButtons, {
                        model: model,
                        onPick: function (eventId) {
                            _this.add(eventId);_this.dismiss();
                        }
                    })
                ),
                _react2['default'].createElement(_materialUi.FlatButton, { style: { width: '100%' }, label: "Trigger job on...", primary: true, onTouchTap: function () {
                        return _this.setState({ open: true });
                    }, icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-pulse" }) }),
                _react2['default'].createElement(
                    _materialUi.List,
                    null,
                    list
                )
            );
        }
    }], [{
        key: 'eventData',
        value: function eventData(e) {

            var parts = e.split(':');
            var data = undefined;
            if (parts.length === 2 && eventMessages[parts[0]]) {
                data = eventMessages[parts[0]][parts[1]];
            } else if (parts.length === 3 && eventMessages[parts[0]] && eventMessages[parts[0]][parts[1]] && eventMessages[parts[0]][parts[1]][parts[2]]) {
                data = eventMessages[parts[0]][parts[1]][parts[2]];
            } else {
                data = { title: e, icon: 'pulse', description: '' };
            }
            return {
                title: Events.T(data.title),
                description: Events.T(data.description),
                icon: 'mdi mdi-' + data.icon,
                tint: data.tint
            };
        }
    }, {
        key: 'T',
        value: function T(id) {
            return _pydio2['default'].getMessages()['ajxp_admin.scheduler.' + id] || id;
        }
    }, {
        key: 'flatStruct',
        value: function flatStruct(s) {
            var pref = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

            var data = [];
            Object.keys(s).forEach(function (k) {
                if (k === 'title') {
                    return;
                }
                if (isNaN(k) && k !== 'IDM_CHANGE') {
                    data.push({ header: s[k].title });
                }
                var v = s[k];
                if (isNaN(k)) {
                    data.push.apply(data, _toConsumableArray(Events.flatStruct(v, [].concat(_toConsumableArray(pref), [k]))));
                } else {
                    data.push([].concat(_toConsumableArray(pref), [k]).join(':'));
                }
            });
            return data;
        }
    }, {
        key: 'eventsAsBBModel',
        value: function eventsAsBBModel(filter) {
            var flat = Events.flatStruct(eventMessages);
            var model = { Sections: [] };
            var section = undefined;
            flat.forEach(function (k) {
                if (k.header) {
                    if (section && section.Actions.length) {
                        model.Sections.push(section);
                    }
                    // Reset section
                    section = { title: k.header, Actions: [] };
                } else {
                    var eData = Events.eventData(k);
                    if (filter && eData.title.toLowerCase().indexOf(filter) === -1 && eData.description.toLowerCase().indexOf(filter) === -1) {
                        return;
                    }
                    section.Actions.push(_extends({}, eData, { value: k }));
                }
            });
            // Append last
            if (section) {
                model.Sections.push(section);
            }
            return model;
        }
    }]);

    return Events;
})(_react2['default'].Component);

exports['default'] = Events;
module.exports = exports['default'];
