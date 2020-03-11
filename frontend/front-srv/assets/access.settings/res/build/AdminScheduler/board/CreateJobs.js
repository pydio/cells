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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _materialUi = require('material-ui');

var _graphTplManager = require("./graph/TplManager");

var _graphTplManager2 = _interopRequireDefault(_graphTplManager);

var _uuid4 = require("uuid4");

var _uuid42 = _interopRequireDefault(_uuid4);

var _JobParameters = require("./JobParameters");

var _JobParameters2 = _interopRequireDefault(_JobParameters);

var _builderScheduleForm = require("./builder/ScheduleForm");

var _builderScheduleForm2 = _interopRequireDefault(_builderScheduleForm);

var _builderTriggers = require('./builder/Triggers');

var _actionsEditor = require("./actions/editor");

var _Pydio$requireLib = _pydio2['default'].requireLib("components");

var Stepper = _Pydio$requireLib.Stepper;
var Dialog = Stepper.Dialog;
var PanelBigButtons = Stepper.PanelBigButtons;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib2.ModernTextField;

var tints = {
    nodes: '',
    idm: '#438db3',
    context: '#795649',
    output: '#009688',
    preset: '#F57C00'
};

var presetTagStyle = {
    display: 'inline-block',
    backgroundColor: tints.preset,
    padding: '0 5px',
    marginRight: 5,
    borderRadius: 5,
    color: 'white',
    fontSize: 12,
    lineHeight: '17px'
};

var CreateJobs = (function (_React$Component) {
    _inherits(CreateJobs, _React$Component);

    function CreateJobs(props) {
        _classCallCheck(this, CreateJobs);

        _get(Object.getPrototypeOf(CreateJobs.prototype), 'constructor', this).call(this, props);
        this.state = { filter: '', templates: [] };
    }

    _createClass(CreateJobs, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(next) {
            if (next.open && !this.props.open) {
                this.loadTemplates();
            }
        }
    }, {
        key: 'loadTemplates',
        value: function loadTemplates() {
            var _this = this;

            _graphTplManager2['default'].getInstance().listJobs().then(function (result) {
                _this.setState({ templates: result });
            });
        }
    }, {
        key: 'dismiss',
        value: function dismiss() {
            this.setState({ job: null, pickEvents: false, random: null });
            var onDismiss = this.props.onDismiss;

            onDismiss();
        }
    }, {
        key: 'save',
        value: function save() {
            var onCreate = this.props.onCreate;
            var _state = this.state;
            var job = _state.job;
            var isTemplate = _state.isTemplate;

            if (isTemplate) {
                // Save new instance directly and open editor
                _pydioHttpResourcesManager2['default'].loadClass('EnterpriseSDK').then(function (sdk) {
                    var SchedulerServiceApi = sdk.SchedulerServiceApi;
                    var JobsPutJobRequest = sdk.JobsPutJobRequest;

                    var api = new SchedulerServiceApi(PydioApi.getRestClient());
                    var req = new JobsPutJobRequest();
                    req.Job = job;
                    return api.putJob(req);
                }).then(function () {
                    onCreate(job);
                })['catch'](function (e) {
                    _pydio2['default'].getInstance().UI.displayMessage('ERROR', 'Cannot save job : ' + e.message);
                });
            } else {
                // Open editor to let user add actions
                onCreate(job);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var open = this.props.open;
            var _state2 = this.state;
            var job = _state2.job;
            var isTemplate = _state2.isTemplate;
            var pickEvents = _state2.pickEvents;
            var random = _state2.random;
            var templates = _state2.templates;
            var filter = _state2.filter;

            var title = undefined,
                content = undefined,
                dialogFilter = undefined,
                dialogProps = {};

            if (pickEvents) {

                var eventsModel = _builderTriggers.Events.eventsAsBBModel(filter);
                title = "Select event triggering the job";
                content = _react2['default'].createElement(PanelBigButtons, {
                    model: eventsModel,
                    onPick: function (eventId) {
                        if (!job.EventNames) {
                            job.EventNames = [];
                        }
                        job.EventNames.push(eventId);
                        _this2.setState({ pickEvents: false });
                    }
                });
                dialogFilter = function (v) {
                    _this2.setState({ filter: v.toLowerCase() });
                };
            } else if (job) {

                title = job.Label || "Create Job";
                var children = [];

                var sectionStyle = { fontSize: 13, fontWeight: 500, color: '#455a64', padding: '10px 0' };
                // Label
                children.push(_react2['default'].createElement(
                    'div',
                    { style: sectionStyle },
                    'Job Label'
                ));
                children.push(_react2['default'].createElement(ModernTextField, { hintText: "Job Label", fullWidth: true, value: job.Label || '', onChange: function (e, v) {
                        job.Label = v;_this2.setState({ job: job });
                    } }));

                if (isTemplate && job.Parameters && job.Parameters.length) {
                    children.push(_react2['default'].createElement(
                        'div',
                        { style: sectionStyle },
                        'Preset Parameters'
                    ));
                    children.push(_react2['default'].createElement(_JobParameters2['default'], { parameters: job.Parameters, onChange: function (v) {
                            job.Parameters = v;_this2.setState({ job: job });
                        }, inDialog: true }));
                }

                if (!isTemplate && job.Schedule) {

                    children.push(_react2['default'].createElement(
                        'div',
                        { style: sectionStyle },
                        'Job Schedule'
                    ));
                    children.push(_react2['default'].createElement(_builderScheduleForm2['default'], { schedule: job.Schedule, onChange: function (newSched) {
                            job.Schedule = newSched;
                            _this2.setState({ job: job });
                        }, edit: true }));
                }

                children.push(_react2['default'].createElement(
                    'div',
                    { style: { textAlign: 'right', paddingTop: 20 } },
                    _react2['default'].createElement(_materialUi.FlatButton, { label: "Cancel", onTouchTap: function () {
                            _this2.dismiss();
                        } }),
                    _react2['default'].createElement(_materialUi.RaisedButton, { disabled: !job.Label, label: "Create job", onTouchTap: function () {
                            _this2.save();
                        }, primary: true })
                ));

                content = _react2['default'].createElement(
                    'div',
                    null,
                    children
                );
                dialogProps = {
                    bodyStyle: {
                        backgroundColor: 'white',
                        padding: 12,
                        overflow: 'visible'
                    },
                    contentStyle: {
                        maxWidth: 800
                    }
                };
            } else {

                var bbModel = { Sections: [{
                        title: 'Blank Jobs',
                        Actions: [{
                            title: 'Event-based Job',
                            description: 'Blank job manually triggered',
                            icon: 'mdi mdi-pulse',
                            tint: '#43a047',
                            value: function value() {
                                return { job: _pydioHttpRestApi.JobsJob.constructFromObject({
                                        ID: (0, _uuid42['default'])(),
                                        Owner: 'pydio.system.user',
                                        Actions: [],
                                        EventNames: []
                                    }), pickEvents: true };
                            }
                        }, {
                            title: 'Scheduled Job',
                            description: 'Blank job manually triggered',
                            icon: 'mdi mdi-timer',
                            tint: '#03a9f4',
                            value: function value() {
                                return { job: _pydioHttpRestApi.JobsJob.constructFromObject({
                                        ID: (0, _uuid42['default'])(),
                                        Owner: 'pydio.system.user',
                                        Actions: [],
                                        Schedule: { "Iso8601Schedule": "R/2020-03-04T07:00:00.471Z/PT24H" }
                                    }) };
                            }
                        }, {
                            title: 'Manual Job',
                            description: 'Blank job manually triggered',
                            icon: 'mdi mdi-gesture-tap',
                            tint: '#607d8a',
                            value: function value() {
                                return { job: _pydioHttpRestApi.JobsJob.constructFromObject({
                                        ID: (0, _uuid42['default'])(),
                                        Owner: 'pydio.system.user',
                                        Actions: []
                                    }) };
                            }
                        }]
                    }] };
                if (templates && templates.length) {
                    var actions = templates.map(function (tpl) {
                        var parts = tpl.Label.split('||');
                        var title = undefined,
                            description = undefined,
                            icon = undefined;
                        if (parts.length === 3) {
                            title = parts[0];
                            description = parts[1];
                            icon = parts[2];
                        } else {
                            title = tpl.Label;
                            description = '';
                            icon = 'mdi mdi-chip';
                        }
                        return {
                            title: _react2['default'].createElement(
                                'span',
                                null,
                                _react2['default'].createElement(
                                    'span',
                                    { style: presetTagStyle },
                                    'preset'
                                ),
                                title
                            ),
                            description: description,
                            icon: icon,
                            onDelete: function onDelete() {
                                if (confirm('Do you want to remove this template?')) {
                                    _graphTplManager2['default'].getInstance().deleteJob(tpl.ID).then(function () {
                                        _this2.loadTemplates();
                                    });
                                }
                            },
                            value: function value() {
                                var newJob = _pydioHttpRestApi.JobsJob.constructFromObject(JSON.parse(JSON.stringify(tpl)));
                                newJob.ID = (0, _uuid42['default'])();
                                newJob.Label = title;
                                newJob.Owner = 'pydio.system.user';
                                return { job: newJob, isTemplate: true };
                            }
                        };
                    });
                    bbModel.Sections.push({ title: 'Job Templates', Actions: actions });
                }

                title = "Create a new job";
                content = _react2['default'].createElement(PanelBigButtons, {
                    model: bbModel,
                    onPick: function (constructor) {
                        return _this2.setState(constructor());
                    }
                });
            }

            return _react2['default'].createElement(
                Dialog,
                {
                    title: title,
                    open: open,
                    dialogProps: dialogProps,
                    onDismiss: function () {
                        _this2.dismiss();
                    },
                    onFilter: dialogFilter,
                    random: random
                },
                content
            );
        }
    }]);

    return CreateJobs;
})(_react2['default'].Component);

exports['default'] = CreateJobs;
module.exports = exports['default'];
