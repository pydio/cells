(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUiStyles = require('material-ui/styles');

var _JobBoard = require('./JobBoard');

var _JobBoard2 = _interopRequireDefault(_JobBoard);

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _JobsList = require("./JobsList");

var _JobsList2 = _interopRequireDefault(_JobsList);

var _Pydio$requireLib = _pydio2['default'].requireLib("boot");

var JobsStore = _Pydio$requireLib.JobsStore;

var Dashboard = _react2['default'].createClass({
    displayName: 'Dashboard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    getInitialState: function getInitialState() {
        return {
            Owner: null,
            Filter: null
        };
    },

    load: function load() {
        var _this = this;

        var hideLoading = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
        var _state = this.state;
        var Owner = _state.Owner;
        var Filter = _state.Filter;

        if (!hideLoading) {
            this.setState({ loading: true });
        }
        JobsStore.getInstance().getAdminJobs(Owner, Filter, "", 1).then(function (jobs) {
            _this.setState({ result: jobs, loading: false });
        })['catch'](function (reason) {
            _this.setState({ error: reason.message, loading: false });
        });
    },

    loadOne: function loadOne(jobID) {
        var _this2 = this;

        var hideLoading = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        // Merge job inside global results
        var result = this.state.result;

        if (!hideLoading) {
            this.setState({ loading: true });
        }
        return JobsStore.getInstance().getAdminJobs(null, null, jobID).then(function (jobs) {
            result.Jobs.forEach(function (v, k) {
                if (v.ID === jobID) {
                    result.Jobs[k] = jobs.Jobs[0];
                }
            });
            _this2.setState({ result: result, loading: false });
            return result;
        })['catch'](function (reason) {
            _this2.setState({ error: reason.message, loading: false });
        });
    },

    componentDidMount: function componentDidMount() {
        var _this3 = this;

        this.load();
        this._loadDebounced = (0, _lodashDebounce2['default'])(function (jobId) {
            if (jobId && _this3.state && _this3.state.selectJob === jobId) {
                _this3.loadOne(jobId, true);
            } else {
                _this3.load(true);
            }
        }, 500);
        JobsStore.getInstance().observe("tasks_updated", this._loadDebounced);
        this._poll = setInterval(function () {
            if (_this3.state && _this3.state.selectJob) {
                _this3.loadOne(_this3.state.selectJob, true);
            } else {
                _this3.load(true);
            }
        }, 10000);
    },

    componentWillUnmount: function componentWillUnmount() {
        if (this._poll) {
            clearInterval(this._poll);
        }
        JobsStore.getInstance().stopObserving("tasks_updated");
    },

    selectRows: function selectRows(rows) {
        var _this4 = this;

        if (rows.length) {
            (function () {
                var jobID = rows[0].ID;
                _this4.loadOne(jobID).then(function () {
                    _this4.setState({ selectJob: jobID });
                });
            })();
        }
    },

    render: function render() {
        var _this5 = this;

        var _props = this.props;
        var pydio = _props.pydio;
        var jobsEditable = _props.jobsEditable;
        var muiTheme = _props.muiTheme;

        var m = function m(id) {
            return pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;
        };
        var adminStyles = AdminComponents.AdminStyles(muiTheme.palette);

        var _state2 = this.state;
        var result = _state2.result;
        var loading = _state2.loading;
        var selectJob = _state2.selectJob;

        if (selectJob && result && result.Jobs) {
            var found = result.Jobs.filter(function (j) {
                return j.ID === selectJob;
            });
            if (found.length) {
                return _react2['default'].createElement(_JobBoard2['default'], {
                    pydio: pydio,
                    job: found[0],
                    jobsEditable: jobsEditable,
                    onSave: function () {
                        _this5.load(true);
                    },
                    adminStyles: adminStyles,
                    onRequestClose: function (refresh) {
                        _this5.setState({ selectJob: null });
                        if (refresh) {
                            _this5.load();
                        }
                    }
                });
            }
        }

        return _react2['default'].createElement(
            'div',
            { style: { height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' } },
            _react2['default'].createElement(AdminComponents.Header, {
                title: m('title'),
                icon: 'mdi mdi-timetable',
                reloadAction: this.load.bind(this),
                loading: loading
            }),
            _react2['default'].createElement(_JobsList2['default'], {
                pydio: pydio,
                selectRows: function (rows) {
                    _this5.selectRows(rows);
                },
                jobs: result ? result.Jobs : [],
                loading: loading
            })
        );
    }

});

exports['default'] = Dashboard = (0, _materialUiStyles.muiThemeable)()(Dashboard);
exports['default'] = Dashboard;
module.exports = exports['default'];

},{"./JobBoard":3,"./JobsList":5,"lodash.debounce":"lodash.debounce","material-ui/styles":"material-ui/styles","pydio":"pydio","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],2:[function(require,module,exports){
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

},{"material-ui":"material-ui","pydio":"pydio","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],3:[function(require,module,exports){
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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _materialUi = require('material-ui');

var _TasksList = require('./TasksList');

var _TasksList2 = _interopRequireDefault(_TasksList);

var _JobSchedule = require('./JobSchedule');

var _JobSchedule2 = _interopRequireDefault(_JobSchedule);

var _Pydio$requireLib = _pydio2['default'].requireLib("boot");

var JobsStore = _Pydio$requireLib.JobsStore;

var JobBoard = (function (_React$Component) {
    _inherits(JobBoard, _React$Component);

    function JobBoard(props) {
        _classCallCheck(this, JobBoard);

        _get(Object.getPrototypeOf(JobBoard.prototype), 'constructor', this).call(this, props);
        this.state = {
            mode: 'log', // 'log' or 'selection'
            selectedRows: [],
            loading: false,
            taskLogs: null,
            job: props.job,
            create: props.create,
            descriptions: {}
        };
    }

    _createClass(JobBoard, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;

            // Load descriptions
            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            api.schedulerActionsDiscovery().then(function (data) {
                _this.setState({ descriptions: data.Actions });
            });
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.job && (nextProps.job.Tasks !== this.props.job.Tasks || nextProps.job.Inactive !== this.props.job.Inactive)) {
                this.setState({ job: nextProps.job });
            }
        }
    }, {
        key: 'onJobSave',
        value: function onJobSave(job) {
            this.setState({ job: job, create: false });
        }
    }, {
        key: 'onJsonSave',
        value: function onJsonSave(job) {
            var _this2 = this;

            // Artificial redraw : go null and back to job
            this.setState({ job: null, create: false }, function () {
                _this2.setState({ job: job });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var jobsEditable = _props.jobsEditable;
            var onRequestClose = _props.onRequestClose;
            var adminStyles = _props.adminStyles;
            var _state = this.state;
            var loading = _state.loading;
            var create = _state.create;
            var job = _state.job;
            var descriptions = _state.descriptions;

            if (!job) {
                return null;
            }
            var m = function m(id) {
                return pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;
            };

            var actions = [];
            var flatProps = _extends({}, adminStyles.props.header.flatButton);
            var iconColor = adminStyles.props.header.flatButton.labelStyle.color;
            if (!create) {
                if (!job.EventNames) {
                    if (jobsEditable) {
                        actions.push(_react2['default'].createElement(_JobSchedule2['default'], { job: job, edit: true, onUpdate: function () {} }));
                    }
                    var bProps = _extends({}, flatProps);
                    if (job.Inactive) {
                        bProps.backgroundColor = '#e0e0e0';
                    }
                    actions.push(_react2['default'].createElement(_materialUi.FlatButton, _extends({ icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-play", color: iconColor }), label: m('task.action.run'), disabled: job.Inactive, primary: true, onTouchTap: function () {
                            JobsStore.getInstance().controlJob(job, 'RunOnce');
                        } }, bProps)));
                }
                if (job.Inactive) {
                    actions.push(_react2['default'].createElement(_materialUi.FlatButton, _extends({ icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-checkbox-marked-circle-outline", color: iconColor }), label: m('task.action.enable'), primary: true, onTouchTap: function () {
                            JobsStore.getInstance().controlJob(job, 'Active');
                        } }, flatProps)));
                } else {
                    actions.push(_react2['default'].createElement(_materialUi.FlatButton, _extends({ icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-checkbox-blank-circle-outline", color: iconColor }), label: m('task.action.disable'), primary: true, onTouchTap: function () {
                            JobsStore.getInstance().controlJob(job, 'Inactive');
                        } }, flatProps)));
                }
            }

            return _react2['default'].createElement(
                'div',
                { style: { height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' } },
                _react2['default'].createElement(AdminComponents.Header, {
                    title: _react2['default'].createElement(
                        'span',
                        null,
                        _react2['default'].createElement(
                            'a',
                            { style: { cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,.87)' }, onTouchTap: onRequestClose },
                            pydio.MessageHash['ajxp_admin.scheduler.title']
                        ),
                        ' / ',
                        job.Label,
                        ' ',
                        job.Inactive ? ' [disabled]' : ''
                    ),
                    backButtonAction: onRequestClose,
                    actions: actions,
                    loading: loading
                }),
                _react2['default'].createElement(
                    'div',
                    { style: { flex: 1, overflowY: 'auto' } },
                    _react2['default'].createElement(_TasksList2['default'], {
                        pydio: pydio,
                        job: job,
                        onLoading: function (l) {
                            _this3.setState({ loading: l });
                        },
                        descriptions: descriptions,
                        adminStyles: adminStyles
                    })
                )
            );
        }
    }]);

    return JobBoard;
})(_react2['default'].Component);

exports['default'] = JobBoard;
module.exports = exports['default'];

},{"./JobSchedule":4,"./TasksList":8,"material-ui":"material-ui","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/http/resources-manager":"pydio/http/resources-manager","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],4:[function(require,module,exports){
/*
 * Copyright 2007-2019 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _materialUi = require('material-ui');

var _ScheduleForm = require('./ScheduleForm');

var _ScheduleForm2 = _interopRequireDefault(_ScheduleForm);

var JobSchedule = (function (_React$Component) {
    _inherits(JobSchedule, _React$Component);

    function JobSchedule(props) {
        _classCallCheck(this, JobSchedule);

        _get(Object.getPrototypeOf(JobSchedule.prototype), 'constructor', this).call(this, props);
        var job = this.props.job;

        this.state = {
            open: false,
            job: job,
            rand: Math.random()
        };
    }

    _createClass(JobSchedule, [{
        key: 'updateJob',
        value: function updateJob() {
            var _this = this;

            var onUpdate = this.props.onUpdate;
            var _state = this.state;
            var job = _state.job;
            var formState = _state.formState;

            if (!formState) {
                this.setState({ open: false });
                return;
            }
            var frequency = formState.frequency;

            if (frequency === 'manual') {
                if (job.Schedule !== undefined) {
                    delete job.Schedule;
                }
                job.AutoStart = true;
            } else {
                job.Schedule = { Iso8601Schedule: _ScheduleForm2['default'].makeIso8601FromState(formState) };
                if (job.AutoStart !== undefined) {
                    delete job.AutoStart;
                }
            }
            _pydioHttpResourcesManager2['default'].loadClass('EnterpriseSDK').then(function (sdk) {
                var SchedulerServiceApi = sdk.SchedulerServiceApi;
                var JobsPutJobRequest = sdk.JobsPutJobRequest;

                var api = new SchedulerServiceApi(_pydioHttpApi2['default'].getRestClient());
                var req = new JobsPutJobRequest();
                // Clone and remove tasks
                req.Job = _pydioHttpRestApi.JobsJob.constructFromObject(JSON.parse(JSON.stringify(job)));
                if (req.Job.Tasks !== undefined) {
                    delete req.Job.Tasks;
                }
                api.putJob(req).then(function () {
                    onUpdate();
                    _this.setState({ open: false, job: req.Job, rand: Math.random() });
                })['catch'](function (e) {});
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state2 = this.state;
            var job = _state2.job;
            var rand = _state2.rand;

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(_materialUi.FlatButton, { primary: true, icon: _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-timer" }), key: rand, label: _react2['default'].createElement(_ScheduleForm2['default'], { schedule: job.Schedule, rand: rand }), onTouchTap: function () {
                        _this2.setState({ open: true });
                    } }),
                _react2['default'].createElement(
                    _materialUi.Dialog,
                    {
                        title: 'Job Schedule',
                        actions: [_react2['default'].createElement(_materialUi.FlatButton, { label: "Close", onTouchTap: function () {
                                _this2.setState({ open: false });
                            } }), _react2['default'].createElement(_materialUi.FlatButton, { label: "Save", onTouchTap: function () {
                                _this2.updateJob();
                            } })],
                        modal: false,
                        open: this.state.open,
                        contentStyle: { width: 320 }
                    },
                    _react2['default'].createElement(_ScheduleForm2['default'], {
                        schedule: job.Schedule,
                        onChangeState: function (s) {
                            _this2.setState({ formState: s });
                        },
                        edit: true,
                        includeManual: true
                    })
                )
            );
        }
    }]);

    return JobSchedule;
})(_react2['default'].Component);

exports['default'] = JobSchedule;
module.exports = exports['default'];

},{"./ScheduleForm":6,"material-ui":"material-ui","pydio/http/api":"pydio/http/api","pydio/http/resources-manager":"pydio/http/resources-manager","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],5:[function(require,module,exports){
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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _ScheduleForm = require("./ScheduleForm");

var _ScheduleForm2 = _interopRequireDefault(_ScheduleForm);

var _Events = require("./Events");

var _Events2 = _interopRequireDefault(_Events);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _Pydio$requireLib = _pydio2['default'].requireLib("boot");

var moment = _Pydio$requireLib.moment;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('components');

var MaterialTable = _Pydio$requireLib2.MaterialTable;

var JobsList = (function (_React$Component) {
    _inherits(JobsList, _React$Component);

    function JobsList() {
        _classCallCheck(this, JobsList);

        _get(Object.getPrototypeOf(JobsList.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(JobsList, [{
        key: 'extractRowsInfo',
        value: function extractRowsInfo(jobs, m) {

            var tagStyle = {
                color: 'white',
                borderRadius: 4,
                textAlign: 'center',
                padding: 4,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            };
            var system = [];
            var other = [];
            if (jobs === undefined) {
                return { system: system, other: other };
            }
            jobs.map(function (job) {

                var data = _extends({}, job, { SortEndTime: 0, SortStatus: 'UNKOWN' });
                if (job.Tasks !== undefined) {
                    // Sort task by StartTime
                    job.Tasks.sort(function (a, b) {
                        if (!a.StartTime || !b.StartTime || a.StartTime === b.StartTime) {
                            return a.ID > b.ID ? 1 : -1;
                        }
                        return a.StartTime > b.StartTime ? -1 : 1;
                    });
                    var t = job.Tasks[0];
                    data.TaskStartTime = moment(new Date(parseInt(t.StartTime) * 1000)).fromNow();
                    if (t.EndTime) {
                        data.TaskEndTime = moment(new Date(parseInt(t.EndTime) * 1000)).fromNow();
                    } else {
                        data.TaskEndTime = '-';
                    }
                    data.SortEndTime = t.EndTime || 0;
                    data.SortStatus = t.Status;
                    if (t.Status === 'Finished') {
                        data.TaskStatus = t.Status;
                    } else if (t.Status === 'Running') {
                        // There might be many tasks running
                        var count = job.Tasks.filter(function (ft) {
                            return ft.Status === 'Running';
                        }).length;
                        data.TaskStatus = _react2['default'].createElement(
                            'span',
                            { style: { fontWeight: 500, color: '#388e3c' } },
                            count,
                            ' tasks running'
                        );
                    } else if (t.Status === 'Error') {
                        data.TaskStatus = _react2['default'].createElement(
                            'span',
                            { style: { fontWeight: 500, color: '#E53935' } },
                            t.StatusMessage
                        );
                    } else if (t.Status === 'Queued') {
                        data.TaskStatus = _react2['default'].createElement(
                            'span',
                            { style: { fontWeight: 500, color: '#fb8c00' } },
                            t.StatusMessage
                        );
                    } else {
                        data.TaskStatus = _react2['default'].createElement(
                            'span',
                            null,
                            t.Status,
                            ' (',
                            t.StatusMessage,
                            ')'
                        );
                    }
                } else {
                    data.TaskStatus = "-";
                    data.TaskEndTime = "-";
                    data.TaskStartTime = "-";
                }
                var tagOpacity = undefined;
                if (job.Inactive) {
                    tagOpacity = { opacity: .43 };
                }
                if (job.Schedule) {
                    data.Trigger = _react2['default'].createElement(
                        'div',
                        { style: _extends({}, tagStyle, tagOpacity, { backgroundColor: '#03A9F4' }) },
                        _react2['default'].createElement('span', { className: "mdi mdi-timer" }),
                        _react2['default'].createElement(_ScheduleForm2['default'], { schedule: job.Schedule })
                    );
                    data.SortValue = '0-' + job.Label;
                } else if (job.EventNames) {
                    data.SortValue = '1-' + job.Label;
                    data.Trigger = _react2['default'].createElement(
                        'div',
                        { style: _extends({}, tagStyle, tagOpacity, { backgroundColor: '#43a047' }) },
                        _react2['default'].createElement('span', { className: "mdi mdi-pulse", title: m('trigger.events') }),
                        ' ',
                        job.EventNames.map(function (e) {
                            return _Events2['default'].eventData(e).title;
                        }).join(', ')
                    );
                } else {
                    data.Trigger = _react2['default'].createElement(
                        'div',
                        { style: _extends({}, tagStyle, tagOpacity, { backgroundColor: '#607d8b' }) },
                        _react2['default'].createElement('span', { className: "mdi mdi-gesture-tap" }),
                        ' ',
                        m('trigger.manual')
                    );
                    data.SortValue = '2-' + job.Label;
                }
                if (job.Inactive) {
                    data.Label = _react2['default'].createElement(
                        'span',
                        { style: { color: 'rgba(0,0,0,0.43)' } },
                        '[',
                        m('job.disabled'),
                        '] ',
                        data.Label
                    );
                    data.TaskStartTime = _react2['default'].createElement(
                        'span',
                        { style: { opacity: 0.43 } },
                        data.TaskStartTime
                    );
                    data.TaskEndTime = _react2['default'].createElement(
                        'span',
                        { style: { opacity: 0.43 } },
                        data.TaskEndTime
                    );
                    data.TaskStatus = _react2['default'].createElement(
                        'span',
                        { style: { opacity: 0.43 } },
                        data.TaskStatus
                    );
                    data.SortValue = '3-' + job.Label;
                }

                if (job.Owner === 'pydio.system.user') {
                    system.push(data);
                } else {
                    other.push(data);
                }
            });

            return { system: system, other: other };
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var pydio = _props.pydio;
            var selectRows = _props.selectRows;
            var muiTheme = _props.muiTheme;
            var _props$jobs = _props.jobs;
            var jobs = _props$jobs === undefined ? [] : _props$jobs;
            var loading = _props.loading;

            var m = function m(id) {
                return pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;
            };
            var adminStyles = AdminComponents.AdminStyles(muiTheme.palette);

            var keys = [{
                name: 'Trigger',
                label: m('job.trigger'),
                style: { width: 180, textAlign: 'left', paddingRight: 0 },
                headerStyle: { width: 180, paddingRight: 0 },
                hideSmall: true,
                sorter: {
                    type: 'number',
                    'default': true,
                    value: function value(row) {
                        return row.SortValue;
                    }
                }
            }, {
                name: 'Label',
                label: m('job.label'),
                style: { width: '40%', fontSize: 15 },
                headerStyle: { width: '40%' },
                sorter: { type: 'string' }
            }, {
                name: 'TaskEndTime',
                label: m('job.endTime'),
                style: { width: '15%' },
                headerStyle: { width: '15%' },
                sorter: { type: 'number', value: function value(row) {
                        return row.SortEndTime;
                    } },
                hideSmall: true
            }, {
                name: 'TaskStatus',
                label: m('job.status'),
                sorter: { type: 'string', value: function value(row) {
                        return row.SortStatus;
                    } }
            }];

            var userKeys = [].concat(keys);
            // Replace Trigger by Owner
            userKeys[1] = {
                name: 'Owner',
                label: m('job.owner'),
                style: { width: '15%' },
                headerStyle: { width: '15%' },
                hideSmall: true
            };

            var _extractRowsInfo = this.extractRowsInfo(jobs, m);

            var system = _extractRowsInfo.system;
            var other = _extractRowsInfo.other;

            var actions = [{
                iconClassName: 'mdi mdi-chevron-right',
                onTouchTap: function onTouchTap(row) {
                    return selectRows([row]);
                }
            }];

            return _react2['default'].createElement(
                'div',
                { style: { flex: 1, overflowY: 'auto' } },
                _react2['default'].createElement(AdminComponents.SubHeader, {
                    title: m('system.title'),
                    legend: m('system.legend')
                }),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    adminStyles.body.block.props,
                    _react2['default'].createElement(MaterialTable, {
                        data: system,
                        columns: keys,
                        actions: actions,
                        onSelectRows: function (rows) {
                            selectRows(rows);
                        },
                        showCheckboxes: false,
                        emptyStateString: loading ? _pydio2['default'].getInstance().MessageHash[466] : m('system.empty'),
                        masterStyles: adminStyles.body.tableMaster
                    })
                ),
                _react2['default'].createElement(AdminComponents.SubHeader, {
                    title: m('users.title'),
                    legend: m('users.legend')
                }),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    adminStyles.body.block.props,
                    _react2['default'].createElement(MaterialTable, {
                        data: other,
                        columns: userKeys,
                        onSelectRows: function (rows) {
                            selectRows(rows);
                        },
                        showCheckboxes: false,
                        emptyStateString: m('users.empty'),
                        masterStyles: adminStyles.body.tableMaster
                    })
                )
            );
        }
    }]);

    return JobsList;
})(_react2['default'].Component);

JobsList = (0, _materialUiStyles.muiThemeable)()(JobsList);
exports['default'] = JobsList;
module.exports = exports['default'];

},{"./Events":2,"./ScheduleForm":6,"material-ui":"material-ui","material-ui/styles":"material-ui/styles","pydio":"pydio","react":"react"}],6:[function(require,module,exports){
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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _materialUi = require('material-ui');

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var moment = _Pydio$requireLib.moment;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('hoc');

var ModernSelectField = _Pydio$requireLib2.ModernSelectField;
var ModernTextField = _Pydio$requireLib2.ModernTextField;
var ModernStyles = _Pydio$requireLib2.ModernStyles;

var Blue = '#2196f3';
var LightGrey = '#e0e0e0';

var ScheduleForm = (function (_React$Component) {
    _inherits(ScheduleForm, _React$Component);

    function ScheduleForm(props) {
        _classCallCheck(this, ScheduleForm);

        _get(Object.getPrototypeOf(ScheduleForm.prototype), 'constructor', this).call(this, props);
        var schedule = props.schedule;

        if (!schedule) {
            this.state = ScheduleForm.parseIso8601('');
        } else if (schedule.Iso8601Schedule) {
            this.state = ScheduleForm.parseIso8601(schedule.Iso8601Schedule);
        } else {
            this.state = { frequency: 'daily', daytime: new Date() };
        }
    }

    _createClass(ScheduleForm, [{
        key: 'onUpdate',
        value: function onUpdate() {
            var _props = this.props;
            var schedule = _props.schedule;
            var onChange = _props.onChange;
            var onChangeState = _props.onChangeState;

            if (onChangeState) {
                onChangeState(this.state);
            } else {
                schedule.Iso8601Schedule = ScheduleForm.makeIso8601FromState(this.state);
                onChange(schedule);
            }
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            if (prevState !== this.state) {
                this.onUpdate();
            }
        }
    }, {
        key: 'T',
        value: function T(id) {
            return _pydio2['default'].getMessages()['ajxp_admin.scheduler.' + id] || id;
        }
    }, {
        key: 'changeFrequency',
        value: function changeFrequency(f) {
            var _state = this.state;
            var monthday = _state.monthday;
            var weekday = _state.weekday;
            var daytime = _state.daytime;
            var everyminutes = _state.everyminutes;

            if (monthday === undefined) {
                monthday = 1;
            }
            if (weekday === undefined) {
                weekday = 1;
            }
            if (daytime === undefined) {
                daytime = moment();
                daytime.year(2012);
                daytime.hours(9);
                daytime.minutes(0);
                daytime = daytime.toDate();
            }
            if (everyminutes === undefined) {
                everyminutes = 15;
            }
            this.setState({ frequency: f, monthday: monthday, weekday: weekday, daytime: daytime, everyminutes: everyminutes });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props2 = this.props;
            var edit = _props2.edit;
            var includeManual = _props2.includeManual;

            if (!edit) {
                return _react2['default'].createElement(
                    'span',
                    null,
                    ScheduleForm.readableString(this.state, this.T, true)
                );
            }
            var _state2 = this.state;
            var frequency = _state2.frequency;
            var monthday = _state2.monthday;
            var weekday = _state2.weekday;
            var daytime = _state2.daytime;
            var everyminutes = _state2.everyminutes;

            var monthdays = [];
            var weekdays = moment.weekdays();
            for (var i = 1; i < 30; i++) {
                monthdays.push(i);
            }
            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { style: { padding: '10px 0', textAlign: 'center' } },
                    _react2['default'].createElement(
                        'div',
                        { style: { color: Blue, fontSize: 15, fontWeight: 500 } },
                        ScheduleForm.readableString(this.state, this.T, false)
                    ),
                    frequency !== 'manual' && _react2['default'].createElement(
                        'div',
                        { style: { fontSize: 11, paddingTop: 5, color: LightGrey } },
                        'ISO8601: ',
                        ScheduleForm.makeIso8601FromState(this.state)
                    )
                ),
                _react2['default'].createElement(
                    ModernSelectField,
                    {
                        floatingLabelText: this.T('schedule.type'),
                        value: frequency,
                        onChange: function (e, i, val) {
                            _this.changeFrequency(val);
                        },
                        fullWidth: true
                    },
                    includeManual && _react2['default'].createElement(_materialUi.MenuItem, { value: 'manual', primaryText: this.T('schedule.type.manual') }),
                    _react2['default'].createElement(_materialUi.MenuItem, { value: 'monthly', primaryText: this.T('schedule.type.monthly') }),
                    _react2['default'].createElement(_materialUi.MenuItem, { value: 'weekly', primaryText: this.T('schedule.type.weekly') }),
                    _react2['default'].createElement(_materialUi.MenuItem, { value: 'daily', primaryText: this.T('schedule.type.daily') }),
                    _react2['default'].createElement(_materialUi.MenuItem, { value: 'timely', primaryText: this.T('schedule.type.timely') })
                ),
                frequency === 'monthly' && _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        ModernSelectField,
                        {
                            floatingLabelText: this.T('schedule.detail.monthday'),
                            value: monthday,
                            onChange: function (e, i, val) {
                                _this.setState({ monthday: val });
                            },
                            fullWidth: true
                        },
                        monthdays.map(function (d) {
                            return _react2['default'].createElement(_materialUi.MenuItem, { value: d, primaryText: d });
                        })
                    )
                ),
                frequency === 'weekly' && _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        ModernSelectField,
                        {
                            floatingLabelText: this.T('schedule.detail.weekday'),
                            value: weekday,
                            onChange: function (e, i, val) {
                                _this.setState({ weekday: val });
                            },
                            fullWidth: true
                        },
                        weekdays.map(function (d, i) {
                            return _react2['default'].createElement(_materialUi.MenuItem, { value: i, primaryText: d });
                        })
                    )
                ),
                (frequency === 'daily' || frequency === 'monthly' || frequency === 'weekly') && _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_materialUi.TimePicker, _extends({
                        format: 'ampm',
                        minutesStep: 5,
                        hintText: this.T('schedule.detail.daytime'),
                        value: daytime,
                        onChange: function (e, v) {
                            _this.setState({ daytime: v });
                        },
                        fullWidth: true
                    }, ModernStyles.textField))
                ),
                frequency === 'timely' && _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(ModernTextField, {
                        floatingLabelText: this.T('schedule.detail.minutes'),
                        value: everyminutes,
                        type: "number",
                        onChange: function (e, val) {
                            _this.setState({ everyminutes: parseInt(val) });
                        },
                        fullWidth: true
                    })
                )
            );
        }
    }], [{
        key: 'parseIso8601',
        value: function parseIso8601(value) {
            if (value === '' || value.indexOf('/') === -1) {
                return { frequency: 'manual' };
            }

            var _value$split = value.split('/');

            var _value$split2 = _slicedToArray(_value$split, 3);

            var R = _value$split2[0];
            var d = _value$split2[1];
            var i = _value$split2[2];

            var startDate = new Date(d);
            if (i === 'P1M') {
                return { frequency: 'monthly', monthday: startDate.getDate(), daytime: startDate };
            } else if (i === 'P7D') {
                var m = moment(startDate);
                return { frequency: 'weekly', weekday: m.day(), daytime: startDate };
            } else if (i === 'PT24H' || i === 'P1D') {
                return { frequency: 'daily', daytime: startDate };
            } else {
                var _d = moment.duration(i);
                if (_d.isValid()) {
                    var minutes = _d.minutes() + _d.hours() * 60;
                    return { frequency: 'timely', everyminutes: minutes };
                } else {
                    return { error: 'Cannot parse value ' + value };
                }
            }
        }
    }, {
        key: 'makeIso8601FromState',
        value: function makeIso8601FromState(state) {
            var frequency = state.frequency;
            var monthday = state.monthday;
            var weekday = state.weekday;
            var daytime = state.daytime;
            var everyminutes = state.everyminutes;

            var startDate = new Date('2012-01-01T00:00:00.828696-07:00');
            var duration = moment.duration(0);
            switch (frequency) {
                case "manual":
                    return "";
                case "monthly":
                    if (daytime) {
                        startDate.setTime(daytime.getTime());
                    }
                    startDate.setDate(monthday || 1);
                    duration = moment.duration(1, 'months');
                    break;
                case "weekly":
                    if (daytime) {
                        startDate.setTime(daytime.getTime());
                    }
                    var m = moment(startDate);
                    m.day(weekday === undefined ? 1 : weekday);
                    startDate = m.toDate();
                    duration = moment.duration(7, 'days');
                    break;
                case "daily":
                    if (daytime) {
                        startDate.setTime(daytime.getTime());
                    }
                    duration = moment.duration(24, 'hours');
                    break;
                case "timely":
                    duration = moment.duration(everyminutes, 'minutes');
                    break;
                default:
                    break;
            }
            return 'R/' + moment(startDate).toISOString() + '/' + duration.toISOString();
        }
    }, {
        key: 'readableString',
        value: function readableString(state, T) {
            var short = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
            var frequency = state.frequency;
            var monthday = state.monthday;
            var weekday = state.weekday;
            var daytime = state.daytime;
            var everyminutes = state.everyminutes;

            var dTRead = '0:00';
            if (daytime) {
                dTRead = moment(daytime).format('h:mm a');
            }
            switch (frequency) {
                case "manual":
                    return T("trigger.manual");
                case "monthly":
                    if (short) {
                        return T("schedule.monthly.short").replace('%1', monthday);
                    } else {
                        return T("schedule.monthly").replace('%1', monthday).replace('%2', dTRead);
                    }
                case "weekly":
                    if (short) {
                        return T("schedule.weekly.short").replace('%1', moment.weekdays()[weekday]);
                    } else {
                        return T("schedule.weekly").replace('%1', moment.weekdays()[weekday]).replace('%2', dTRead);
                    }
                case "daily":
                    if (short) {
                        return T("schedule.daily.short").replace('%1', dTRead);
                    } else {
                        return T("schedule.daily").replace('%1', dTRead);
                    }
                case "timely":
                    var duration = moment.duration(everyminutes, 'minutes');
                    return T("schedule.timely").replace('%1', (duration.hours() ? duration.hours() + 'h' : '') + (duration.minutes() ? duration.minutes() + 'mn' : ''));
                default:
                    return "Error";
            }
        }
    }]);

    return ScheduleForm;
})(_react2['default'].Component);

exports['default'] = ScheduleForm;
module.exports = exports['default'];

},{"material-ui":"material-ui","pydio":"pydio","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],7:[function(require,module,exports){
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

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require("pydio/http/api");

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

var _Pydio$requireLib = _pydio2["default"].requireLib('components');

var MaterialTable = _Pydio$requireLib.MaterialTable;

var _Pydio$requireLib2 = _pydio2["default"].requireLib('boot');

var JobsStore = _Pydio$requireLib2.JobsStore;
var moment = _Pydio$requireLib2.moment;

var TaskActivity = (function (_React$Component) {
    _inherits(TaskActivity, _React$Component);

    function TaskActivity(props) {
        _classCallCheck(this, TaskActivity);

        _get(Object.getPrototypeOf(TaskActivity.prototype), "constructor", this).call(this, props);
        this.state = { activity: [], loading: false };
    }

    _createClass(TaskActivity, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this = this;

            this.loadActivity(this.props);
            this._loadDebounced = (0, _lodashDebounce2["default"])(function (jobId) {
                if (jobId && _this.props.task && _this.props.task.JobID === jobId) {
                    _this.loadActivity(_this.props);
                }
            }, 500);
            JobsStore.getInstance().observe("tasks_updated", this._loadDebounced);
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            if (this._loadDebounced) {
                JobsStore.getInstance().stopObserving("tasks_updated", this._loadDebounced);
            }
        }
    }, {
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            if (!this.props.task) {
                this.loadActivity(nextProps);
            }
            if (nextProps.task && this.props.task && nextProps.task.ID !== this.props.task.ID) {
                this.loadActivity(nextProps);
            }
        }
    }, {
        key: "loadActivity",
        value: function loadActivity(props) {
            var _this2 = this;

            var task = props.task;

            if (!task) {
                return;
            }
            var operationId = task.JobID + '-' + task.ID.substr(0, 8);
            var api = new _pydioHttpRestApi.JobsServiceApi(_pydioHttpApi2["default"].getRestClient());

            var request = new _pydioHttpRestApi.LogListLogRequest();
            request.Query = "+OperationUuid:\"" + operationId + "\"";
            request.Page = 0;
            request.Size = 200;
            request.Format = _pydioHttpRestApi.ListLogRequestLogFormat.constructFromObject('JSON');
            this.setState({ loading: true });
            api.listTasksLogs(request).then(function (response) {
                var ll = response.Logs || [];
                // Logs are reverse sorted on time
                ll.reverse();
                _this2.setState({ activity: ll, loading: false });
            })["catch"](function () {
                _this2.setState({ activity: [], loading: false });
            });
        }
    }, {
        key: "computeTag",
        value: function computeTag(row) {
            var _props = this.props;
            var job = _props.job;
            var descriptions = _props.descriptions;

            var pathTag = {
                backgroundColor: '#1e96f3',
                fontSize: 11,
                fontWeight: 500,
                color: 'white',
                padding: '0 8px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                borderRadius: 4,
                textAlign: 'center'
            };
            var path = row.SchedulerTaskActionPath;
            if (!path) {
                return null;
            }
            if (path === 'ROOT') {
                // Special case for trigger
                return _react2["default"].createElement(
                    "div",
                    { style: _extends({}, pathTag, { backgroundColor: 'white', color: 'rgba(0,0,0,.87)', border: '1px solid #e0e0e0' }) },
                    "Trigger"
                );
            }
            var action = undefined;
            try {
                action = this.findAction(path, job.Actions);
            } catch (e) {
                //console.error(e);
            }
            if (action) {
                if (action.Label) {
                    path = action.Label;
                } else if (descriptions && descriptions[action.ID]) {
                    path = descriptions[action.ID].Label;
                }
            } else {
                var last = path.split('/').pop();
                var actionId = last.split('$').shift();
                if (descriptions && descriptions[actionId]) {
                    path = descriptions[actionId].Label;
                }
            }
            return _react2["default"].createElement(
                "div",
                { style: pathTag },
                path
            );
        }
    }, {
        key: "findAction",
        value: function findAction(path, actions) {
            var parts = path.split('/');
            var first = parts.shift();
            var actionId = [].concat(_toConsumableArray(parts)).shift();
            var chainIndex = parseInt(actionId.split('$')[1]);
            var action = actions[chainIndex];
            var nextActions = undefined;
            if (actionId.indexOf('$FAIL') === -1) {
                nextActions = action.ChainedActions;
            } else {
                nextActions = action.FailedFilterActions;
            }
            if (parts.length > 1) {
                // Move on step forward
                return this.findAction(parts.join('/'), nextActions);
            } else {
                return action;
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            var _props2 = this.props;
            var pydio = _props2.pydio;
            var onRequestClose = _props2.onRequestClose;
            var activity = this.state.activity;

            var cellBg = "#f5f5f5";
            var lineHeight = 32;
            var columns = [{ name: 'SchedulerTaskActionPath', label: '', hideSmall: true, style: { width: 110, height: lineHeight, backgroundColor: cellBg, paddingLeft: 12, paddingRight: 0, userSelect: 'text' }, headerStyle: { width: 110, paddingLeft: 12, paddingRight: 0 }, renderCell: function renderCell(row) {
                    return _this3.computeTag(row);
                } }, { name: 'Ts', label: pydio.MessageHash['settings.17'], style: { width: 100, height: lineHeight, backgroundColor: cellBg, paddingRight: 10, userSelect: 'text' }, headerStyle: { width: 100, paddingRight: 10 }, renderCell: function renderCell(row) {
                    var m = moment(row.Ts * 1000);
                    return m.format('HH:mm:ss');
                } }, { name: 'Msg', label: pydio.MessageHash['ajxp_admin.logs.message'], style: { height: lineHeight, backgroundColor: cellBg, userSelect: 'text' } }];
            return _react2["default"].createElement(
                "div",
                { style: { paddingTop: 12, paddingBottom: 10, backgroundColor: cellBg } },
                _react2["default"].createElement(
                    "div",
                    { style: { padding: '0 24px 10px', fontWeight: 500, backgroundColor: cellBg, display: 'flex', alignItems: 'center' } },
                    _react2["default"].createElement(
                        "div",
                        { style: { flex: 1 } },
                        "Tasks Logs"
                    ),
                    _react2["default"].createElement(
                        "div",
                        { style: { paddingRight: 15, cursor: "pointer" }, onClick: onRequestClose },
                        _react2["default"].createElement(_materialUi.FontIcon, { className: "mdi mdi-close", color: "rgba(0,0,0,.3)", style: { fontSize: 16 } })
                    )
                ),
                _react2["default"].createElement(MaterialTable, {
                    hideHeaders: true,
                    columns: columns,
                    data: activity,
                    showCheckboxes: false,
                    emptyStateString: 'No activity found',
                    emptyStateStyle: { backgroundColor: cellBg },
                    computeRowStyle: function (row) {
                        return { borderBottomColor: '#fff', height: lineHeight };
                    }
                })
            );
        }
    }]);

    return TaskActivity;
})(_react2["default"].Component);

exports["default"] = TaskActivity;
module.exports = exports["default"];

},{"lodash.debounce":"lodash.debounce","material-ui":"material-ui","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],8:[function(require,module,exports){
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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _TaskActivity = require('./TaskActivity');

var _TaskActivity2 = _interopRequireDefault(_TaskActivity);

var _Pydio$requireLib = _pydio2['default'].requireLib("boot");

var JobsStore = _Pydio$requireLib.JobsStore;
var SingleJobProgress = _Pydio$requireLib.SingleJobProgress;
var moment = _Pydio$requireLib.moment;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('components');

var MaterialTable = _Pydio$requireLib2.MaterialTable;

var TasksList = (function (_React$Component) {
    _inherits(TasksList, _React$Component);

    function TasksList(props) {
        _classCallCheck(this, TasksList);

        _get(Object.getPrototypeOf(TasksList.prototype), 'constructor', this).call(this, props);
        this.state = {
            mode: 'log', // 'log' or 'selection'
            selectedRows: [],
            working: false,
            taskLogs: null
        };
    }

    _createClass(TasksList, [{
        key: 'renderActions',
        value: function renderActions(row) {
            var pydio = this.props.pydio;

            var m = function m(id) {
                return pydio.MessageHash['ajxp_admin.scheduler.task.action.' + id] || id;
            };

            var store = JobsStore.getInstance();
            var actions = [];
            var icProps = {
                iconStyle: { color: 'rgba(0,0,0,.3)' },
                onClick: function onClick(e) {
                    return e.stopPropagation();
                }
            };
            if (row.Status === 'Running' && row.CanPause) {
                actions.push(_react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-pause", tooltip: m('pause'), onTouchTap: function () {
                        store.controlTask(row, 'Pause');
                    } }, icProps)));
            }
            if (row.Status === 'Paused') {
                actions.push(_react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-play", tooltip: m('resume'), onTouchTap: function () {
                        store.controlTask(row, 'Resume');
                    } }, icProps)));
            }
            if (row.Status === 'Running' || row.Status === 'Paused') {
                if (row.CanStop) {
                    actions.push(_react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-stop", tooltip: m('stop'), onTouchTap: function () {
                            store.controlTask(row, 'Stop');
                        } }, icProps)));
                } else if (row.StatusMessage === 'Pending') {
                    actions.push(_react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-delete", tooltip: m('delete'), onTouchTap: function () {
                            store.controlTask(row, 'Delete');
                        } }, icProps)));
                }
            } else {
                actions.push(_react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-delete", tooltip: m('delete'), onTouchTap: function () {
                        store.controlTask(row, 'Delete');
                    } }, icProps)));
            }
            return actions;
        }
    }, {
        key: 'onSelectTaskRows',
        value: function onSelectTaskRows(rows) {
            var mode = this.state.mode;

            if (mode === 'selection') {
                this.setState({ selectedRows: rows });
            } else if (rows.length === 1) {
                this.setState({ taskLogs: rows[0] });
            }
        }
    }, {
        key: 'setLoading',
        value: function setLoading(bool) {
            var onLoading = this.props.onLoading;

            this.setState({ working: bool });
            if (onLoading) {
                onLoading(bool);
            }
        }
    }, {
        key: 'deleteSelection',
        value: function deleteSelection() {
            var _this = this;

            var selectedRows = this.state.selectedRows;
            var job = this.props.job;

            var store = JobsStore.getInstance();
            this.setLoading(true);
            store.deleteTasks(job.ID, selectedRows).then(function () {
                _this.setState({ selectedRows: [], mode: 'log' });
                _this.setLoading(false);
            })['catch'](function () {
                _this.setLoading(false);
            });
        }
    }, {
        key: 'deleteAll',
        value: function deleteAll() {
            var _this2 = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var job = _props.job;

            pydio.UI.openConfirmDialog({
                message: pydio.MessageHash['ajxp_admin.scheduler.tasks.delete.confirm'],
                validCallback: function validCallback() {
                    _this2.setLoading(true);
                    var store = JobsStore.getInstance();
                    store.deleteAllTasksForJob(job.ID).then(function () {
                        _this2.setLoading(false);
                    })['catch'](function () {
                        _this2.setLoading(false);
                    });
                }
            });
        }
    }, {
        key: 'insertTaskLogRow',
        value: function insertTaskLogRow(rows) {
            var _this3 = this;

            var _props2 = this.props;
            var pydio = _props2.pydio;
            var job = _props2.job;
            var _props2$descriptions = _props2.descriptions;
            var descriptions = _props2$descriptions === undefined ? [] : _props2$descriptions;
            var _state = this.state;
            var taskLogs = _state.taskLogs;
            var mode = _state.mode;

            if (mode === 'selection') {
                return rows;
            }
            return rows.map(function (t) {
                if (taskLogs && t.ID === taskLogs.ID) {
                    var expandedRow = _react2['default'].createElement(_TaskActivity2['default'], {
                        pydio: pydio,
                        task: taskLogs,
                        job: job,
                        descriptions: descriptions,
                        onRequestClose: function () {
                            _this3.setState({ taskLogs: null });
                        }
                    });
                    return _extends({}, t, { expandedRow: expandedRow });
                } else {
                    return t;
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var _props3 = this.props;
            var pydio = _props3.pydio;
            var adminStyles = _props3.adminStyles;
            var job = _props3.job;
            var _state2 = this.state;
            var selectedRows = _state2.selectedRows;
            var working = _state2.working;
            var mode = _state2.mode;

            if (!job) {
                return null;
            }
            var m = function m(id) {
                return pydio.MessageHash['ajxp_admin.scheduler.' + id] || id;
            };

            var actionsHeader = _react2['default'].createElement(
                'div',
                { style: { lineHeight: 'initial', marginLeft: 5 } },
                _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-delete-sweep", iconStyle: { color: 'rgba(0,0,0,.3)' }, tooltip: m('tasks.bulk.clear'), primary: true, onTouchTap: this.deleteAll.bind(this), disabled: working })
            );
            var idHeader = _react2['default'].createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center', marginLeft: -20 } },
                _react2['default'].createElement(
                    'div',
                    { style: { lineHeight: 'initial', marginLeft: 5 } },
                    _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-checkbox-multiple-" + (mode === 'selection' ? 'marked' : 'blank') + "-outline", iconStyle: { color: 'rgba(0,0,0,.3)' }, tooltip: mode === 'selection' ? m('tasks.bulk.disable') : m('tasks.bulk.enable'), primary: true, onTouchTap: function () {
                            _this4.setState({ mode: mode === 'selection' ? 'log' : 'selection', taskLogs: null });
                        }, disabled: working })
                ),
                _react2['default'].createElement(
                    'span',
                    null,
                    m('task.id')
                )
            );

            var keys = [{ name: 'ID', label: idHeader, hideSmall: true, style: { width: 110, fontSize: 15, paddingLeft: 20 }, headerStyle: { width: 110, paddingLeft: 20 }, renderCell: function renderCell(row) {
                    return row.ID.substr(0, 8);
                } }, { name: 'StartTime', style: { width: 100, paddingRight: 10 }, headerStyle: { width: 100, paddingRight: 10 }, label: m('task.start'), renderCell: function renderCell(row) {
                    var m = moment(row.StartTime * 1000);
                    var dateString = undefined;
                    if (m.isSame(Date.now(), 'day')) {
                        dateString = m.format('HH:mm:ss');
                    } else {
                        dateString = m.fromNow();
                    }
                    return dateString;
                } }, { name: 'StatusMessage', label: m('task.message'), hideSmall: true, renderCell: function renderCell(row) {
                    if (row.Status === 'Error') {
                        return _react2['default'].createElement(
                            'span',
                            { style: { fontWeight: 500, color: '#E53935' } },
                            row.StatusMessage
                        );
                    } else if (row.Status === 'Running') {
                        return _react2['default'].createElement(SingleJobProgress, { pydio: pydio, jobID: row.JobID, taskID: row.ID });
                    } else {
                        return row.StatusMessage;
                    }
                } }, { name: 'EndTime', style: { width: 100 }, headerStyle: { width: 100 }, label: m('task.duration'), hideSmall: true, renderCell: function renderCell(row) {
                    var e = moment(Date.now());
                    if (row.EndTime) {
                        e = moment(row.EndTime * 1000);
                    }
                    var d = e.diff(moment(row.StartTime * 1000));
                    var f = moment.utc(d);
                    var h = f.format('H');
                    var mn = f.format('m');
                    var ss = f.format('s');
                    if (h === '0' && mn === '0' && ss === '0') {
                        return '< 1s';
                    }
                    return (h === '0' ? '' : h + 'h:') + (h === '0' && mn === '0' ? '' : mn + 'mn:') + ss + 's';
                } }, { name: 'Actions', label: actionsHeader, style: { textAlign: 'right', width: 120, paddingLeft: 0 }, headerStyle: { width: 120, paddingLeft: 0, paddingRight: 20, textAlign: 'right' }, renderCell: this.renderActions.bind(this) }];
            var tasks = job.Tasks || [];
            var runningStatus = ['Running', 'Paused'];

            tasks.sort(function (a, b) {
                if (!a.StartTime || !b.StartTime || a.StartTime === b.StartTime) {
                    return a.ID > b.ID ? 1 : -1;
                }
                return a.StartTime > b.StartTime ? -1 : 1;
            });

            var running = tasks.filter(function (t) {
                return runningStatus.indexOf(t.Status) !== -1;
            });
            running = this.insertTaskLogRow(running);
            var other = tasks.filter(function (t) {
                return runningStatus.indexOf(t.Status) === -1;
            });
            other = this.insertTaskLogRow(other);

            return _react2['default'].createElement(
                'div',
                null,
                running.length > 0 && _react2['default'].createElement(AdminComponents.SubHeader, { title: m('tasks.running') }),
                running.length > 0 && _react2['default'].createElement(
                    _materialUi.Paper,
                    adminStyles.body.block.props,
                    _react2['default'].createElement(MaterialTable, {
                        data: running,
                        columns: keys,
                        hideHeaders: true,
                        showCheckboxes: false,
                        emptyStateString: m('tasks.running.empty'),
                        onSelectRows: function (rows) {
                            if (rows.length === 1 && running.length) {
                                _this4.setState({ taskLogs: rows[0] });
                            }
                        },
                        masterStyles: adminStyles.body.tableMaster
                    })
                ),
                _react2['default'].createElement(AdminComponents.SubHeader, {
                    title: _react2['default'].createElement(
                        'div',
                        { style: { display: 'flex', width: '100%', alignItems: 'baseline' } },
                        _react2['default'].createElement(
                            'div',
                            { style: { flex: 1 } },
                            m('tasks.history')
                        ),
                        mode === 'selection' && selectedRows.length > 1 && _react2['default'].createElement(
                            'div',
                            { style: { lineHeight: 'initial' } },
                            _react2['default'].createElement(_materialUi.RaisedButton, { label: m('tasks.bulk.delete'), secondary: true, onTouchTap: this.deleteSelection.bind(this), disabled: working })
                        )
                    )
                }),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    adminStyles.body.block.props,
                    _react2['default'].createElement(MaterialTable, {
                        data: other,
                        columns: keys,
                        showCheckboxes: mode === 'selection',
                        onSelectRows: this.onSelectTaskRows.bind(this),
                        emptyStateString: m('tasks.history.empty'),
                        selectedRows: selectedRows,
                        deselectOnClickAway: true,
                        masterStyles: adminStyles.body.tableMaster,
                        paginate: [10, 25, 50, 100],
                        defaultPageSize: 10
                    })
                )
            );
        }
    }]);

    return TasksList;
})(_react2['default'].Component);

exports['default'] = TasksList;
module.exports = exports['default'];

},{"./TaskActivity":7,"material-ui":"material-ui","pydio":"pydio","react":"react"}],9:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _boardDashboard = require('./board/Dashboard');

var _boardDashboard2 = _interopRequireDefault(_boardDashboard);

var _boardJobsList = require('./board/JobsList');

var _boardJobsList2 = _interopRequireDefault(_boardJobsList);

var _boardTasksList = require('./board/TasksList');

var _boardTasksList2 = _interopRequireDefault(_boardTasksList);

var _boardScheduleForm = require('./board/ScheduleForm');

var _boardScheduleForm2 = _interopRequireDefault(_boardScheduleForm);

var _boardEvents = require('./board/Events');

var _boardEvents2 = _interopRequireDefault(_boardEvents);

window.AdminScheduler = {
  Dashboard: _boardDashboard2['default'],
  JobsList: _boardJobsList2['default'],
  TasksList: _boardTasksList2['default'],
  ScheduleForm: _boardScheduleForm2['default'],
  Events: _boardEvents2['default']
};

},{"./board/Dashboard":1,"./board/Events":2,"./board/JobsList":5,"./board/ScheduleForm":6,"./board/TasksList":8}]},{},[9]);
