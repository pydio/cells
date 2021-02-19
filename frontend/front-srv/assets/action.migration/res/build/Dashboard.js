'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _materialUi = require('material-ui');

var _cellsSdk = require('cells-sdk');

var _stepsStepEmptyConfig = require('./steps/StepEmptyConfig');

var _stepsStepEmptyConfig2 = _interopRequireDefault(_stepsStepEmptyConfig);

var _stepsStepConnection = require('./steps/StepConnection');

var _stepsStepConnection2 = _interopRequireDefault(_stepsStepConnection);

var _stepsStepCategories = require('./steps/StepCategories');

var _stepsStepCategories2 = _interopRequireDefault(_stepsStepCategories);

var _stepsStepMetadata = require('./steps/StepMetadata');

var _stepsStepMetadata2 = _interopRequireDefault(_stepsStepMetadata);

var _stepsStepShares = require('./steps/StepShares');

var _stepsStepShares2 = _interopRequireDefault(_stepsStepShares);

var _stepsStepWorkspaces = require('./steps/StepWorkspaces');

var _stepsStepWorkspaces2 = _interopRequireDefault(_stepsStepWorkspaces);

var _stepsStepPrerequisites = require('./steps/StepPrerequisites');

var _stepsStepPrerequisites2 = _interopRequireDefault(_stepsStepPrerequisites);

var _stepsStepDisclaimer = require('./steps/StepDisclaimer');

var _stepsStepDisclaimer2 = _interopRequireDefault(_stepsStepDisclaimer);

var _TaskActivity = require('./TaskActivity');

var _TaskActivity2 = _interopRequireDefault(_TaskActivity);

var _actionsActions = require('./actions/actions');

var Actions = _interopRequireWildcard(_actionsActions);

var _Pydio$requireLib = _pydio2['default'].requireLib("boot");

var JobsStore = _Pydio$requireLib.JobsStore;
var moment = _Pydio$requireLib.moment;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('hoc');

var ModernSelectField = _Pydio$requireLib2.ModernSelectField;

var styles = {
    stepLegend: { color: '#757575', padding: '6px 0' }
};

var Dashboard = (function (_React$Component) {
    _inherits(Dashboard, _React$Component);

    function Dashboard(props) {
        _classCallCheck(this, Dashboard);

        _get(Object.getPrototypeOf(Dashboard.prototype), 'constructor', this).call(this, props);

        var features = {
            configs: { label: this.T('feature.configs'), value: false, action: Actions.getConfigsAction },
            users: { label: this.T('feature.users'), value: false, action: Actions.getUsersAction },
            workspaces: { label: this.T('feature.workspaces'), value: false, action: Actions.getWorkspacesAction, summary: Actions.getWorkspacesSummary },
            acls: { label: this.T('feature.acls'), value: false, action: Actions.getAclsAction, depends: 'workspaces' },
            metadata: { label: this.T('feature.meta'), value: false, action: Actions.getMetadataAction, summary: Actions.getMedataSummary, depends: 'workspaces' },
            shares: { label: this.T('feature.shares'), value: false, action: Actions.getSharesAction, summary: Actions.getSharesSummary, depends: 'workspaces' }
        };
        if (!props.advanced) {
            delete features.configs;
        }

        this.state = {
            activeStep: 0,
            url: "",
            user: "importer",
            pwd: "",
            cellAdmin: props.pydio.user.id,
            skipVerify: false,
            features: features,
            workspaces: [],
            workspaceMapping: {},
            localStatus: [],
            previousTasks: [],
            showLogs: null
        };
    }

    _createClass(Dashboard, [{
        key: 'T',
        value: function T(id) {
            return this.props.pydio.MessageHash['migration.dash.' + id] || this.props.pydio.MessageHash['migration.' + id] || id;
        }
    }, {
        key: 'loadPreviousTasks',
        value: function loadPreviousTasks() {
            var _this = this;

            JobsStore.getInstance().getAdminJobs(null, null, "pydio8-data-import", 20).then(function (response) {
                if (response.Jobs && response.Jobs.length) {
                    var tasks = response.Jobs[0].Tasks || [];
                    tasks.sort(_pydioUtilLang2['default'].arraySorter('StartTime'));
                    tasks.reverse();
                    _this.setState({ previousTasks: tasks });
                }
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var pydio = this.props.pydio;

            this._observer = function (jsonObject) {
                var Job = jsonObject.Job;
                var TaskUpdated = jsonObject.TaskUpdated;

                var job = _cellsSdk.JobsJob.constructFromObject(Job);
                if (job.ID === 'pydio8-data-import') {
                    var task = _cellsSdk.JobsTask.constructFromObject(TaskUpdated);
                    _this2.setState({ job: job, task: task });
                }
            };
            pydio.observe("task_message", this._observer);
            this.loadPreviousTasks();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this._observer) {
                var pydio = this.props.pydio;

                pydio.stopObserving("task_message", this._observer);
                this._observer = null;
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var openRightPane = _props.openRightPane;
            var closeRightPane = _props.closeRightPane;
            var advanced = _props.advanced;
            var currentNode = _props.currentNode;
            var _state = this.state;
            var activeStep = _state.activeStep;
            var url = _state.url;
            var skipVerify = _state.skipVerify;
            var user = _state.user;
            var pwd = _state.pwd;
            var features = _state.features;
            var task = _state.task;
            var showLogs = _state.showLogs;
            var localStatus = _state.localStatus;
            var previousTasks = _state.previousTasks;

            var remainingState = _objectWithoutProperties(_state, ['activeStep', 'url', 'skipVerify', 'user', 'pwd', 'features', 'task', 'showLogs', 'localStatus', 'previousTasks']);

            var adminStyles = AdminComponents.AdminStyles();

            var previousJobsSelector = _react2['default'].createElement(
                ModernSelectField,
                { fullWidth: true, value: showLogs, onChange: function (e, i, v) {
                        _this3.setState({ showLogs: v });
                    } },
                _react2['default'].createElement(_materialUi.MenuItem, { value: null, primaryText: this.T('job.new') }),
                previousTasks.length > 0 && _react2['default'].createElement(_materialUi.Divider, null),
                previousTasks.map(function (t) {
                    var label = undefined;
                    if (t.EndTime) {
                        label = t.Status + ' ' + moment(new Date(t.EndTime * 1000)).fromNow();
                    } else {
                        label = t.Status + ' ' + moment(new Date(t.StartTime * 1000)).fromNow();
                    }
                    return _react2['default'].createElement(_materialUi.MenuItem, { label: label, primaryText: label, value: t });
                })
            );

            var content = undefined;
            if (showLogs) {
                content = _react2['default'].createElement(
                    _materialUi.Paper,
                    adminStyles.body.block.props,
                    _react2['default'].createElement(_TaskActivity2['default'], { pydio: pydio, task: showLogs, styles: adminStyles })
                );
            } else {
                (function () {

                    var commonProps = {
                        pydio: pydio,
                        onBack: function onBack() {
                            return _this3.setState({ activeStep: activeStep - 1 });
                        },
                        onComplete: function onComplete() {
                            return _this3.setState({ activeStep: activeStep + 1 });
                        },
                        onChange: function onChange(params) {
                            return _this3.setState(params);
                        },
                        url: url,
                        skipVerify: skipVerify,
                        user: user,
                        pwd: pwd,
                        styles: styles,
                        hasRunning: task && task.Status === 'Running'
                    };

                    content = _react2['default'].createElement(
                        _materialUi.Paper,
                        _extends({}, adminStyles.body.block.props, { style: _extends({}, adminStyles.body.block.container, { paddingBottom: 16 }) }),
                        _react2['default'].createElement(
                            _materialUi.Stepper,
                            { style: { display: 'flex' }, orientation: 'vertical', activeStep: activeStep },
                            _react2['default'].createElement(_stepsStepDisclaimer2['default'], _extends({}, commonProps, { onBack: null, advanced: advanced })),
                            _react2['default'].createElement(_stepsStepPrerequisites2['default'], _extends({}, commonProps, { onBack: null, advanced: advanced })),
                            _react2['default'].createElement(_stepsStepConnection2['default'], _extends({}, commonProps, { url: url, skipVerify: skipVerify, user: user, pwd: pwd })),
                            _react2['default'].createElement(_stepsStepCategories2['default'], _extends({}, commonProps, { features: features,
                                onChange: function (newFeatures) {
                                    return _this3.setState({ features: _extends({}, features, newFeatures) });
                                }
                            })),
                            Object.keys(features).filter(function (k) {
                                return k === "configs" && features[k].value;
                            }).map(function (k) {
                                return _react2['default'].createElement(_stepsStepEmptyConfig2['default'], _extends({}, commonProps, {
                                    title: _this3.T('feature.configs'),
                                    legend: _this3.T('feature.configs.legend'),
                                    style: { flex: 1, paddingRight: 20, borderRight: '1px solid #e0e0e0' }
                                }));
                            }),
                            Object.keys(features).filter(function (k) {
                                return k === "users" && features[k].value;
                            }).map(function (k) {
                                return _react2['default'].createElement(_stepsStepEmptyConfig2['default'], _extends({}, commonProps, {
                                    title: _this3.T('feature.users'),
                                    legend: _this3.T('feature.users.legend'),
                                    style: { flex: 1, paddingRight: 20, borderRight: '1px solid #e0e0e0' }
                                }));
                            }),
                            Object.keys(features).filter(function (k) {
                                return k === "workspaces" && features[k].value;
                            }).map(function (k) {
                                return _react2['default'].createElement(_stepsStepWorkspaces2['default'], _extends({}, commonProps, {
                                    style: { flex: 1, paddingRight: 20, borderRight: '1px solid #e0e0e0' },
                                    openRightPane: openRightPane,
                                    closeRightPane: closeRightPane
                                }));
                            }),
                            Object.keys(features).filter(function (k) {
                                return k === "acls" && features[k].value;
                            }).map(function (k) {
                                return _react2['default'].createElement(_stepsStepEmptyConfig2['default'], _extends({}, commonProps, {
                                    title: _this3.T('feature.acls'),
                                    legend: _this3.T('feature.acls.legend'),
                                    style: { flex: 1, paddingRight: 20, borderRight: '1px solid #e0e0e0' }
                                }));
                            }),
                            Object.keys(features).filter(function (k) {
                                return k === "metadata" && features[k].value;
                            }).map(function (k) {
                                return _react2['default'].createElement(_stepsStepMetadata2['default'], _extends({}, commonProps, { style: { flex: 1, paddingRight: 20, borderRight: '1px solid #e0e0e0' } }));
                            }),
                            Object.keys(features).filter(function (k) {
                                return k === "shares" && features[k].value;
                            }).map(function (k) {
                                return _react2['default'].createElement(_stepsStepShares2['default'], _extends({}, commonProps, { style: { flex: 1, paddingRight: 20, borderRight: '1px solid #e0e0e0' } }));
                            }),
                            _react2['default'].createElement(_stepsStepCategories2['default'], _extends({}, commonProps, { features: features, summary: true, summaryState: _this3.state
                            }, remainingState, {
                                onComplete: function () {
                                    _this3.setState({ localStatus: [] }, function () {
                                        Actions.startJob(_this3.state, function (localUpdate) {
                                            _this3.setState({ localStatus: [].concat(_toConsumableArray(localStatus), [localUpdate]) });
                                        });
                                        setTimeout(function () {
                                            _this3.loadPreviousTasks();
                                        }, 1000);
                                    });
                                }
                            }))
                        )
                    );
                })();
            }

            return _react2['default'].createElement(
                'div',
                { className: 'main-layout-nav-to-stack workspaces-board' },
                _react2['default'].createElement(
                    'div',
                    { className: 'vertical-layout', style: { width: '100%' } },
                    _react2['default'].createElement(AdminComponents.Header, {
                        title: this.T('title'),
                        icon: currentNode.getMetadata().get('icon_class'),
                        actions: [previousJobsSelector]
                    }),
                    _react2['default'].createElement(
                        'div',
                        { className: 'layout-fill' },
                        (task || localStatus.length > 0) && _react2['default'].createElement(
                            _materialUi.Paper,
                            adminStyles.body.block.props,
                            _react2['default'].createElement(
                                'div',
                                { style: adminStyles.body.block.headerFull },
                                this.T('importing')
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: { padding: 16 } },
                                localStatus.length > 0 && _react2['default'].createElement(
                                    'div',
                                    null,
                                    localStatus.map(function (x) {
                                        return _react2['default'].createElement(
                                            'div',
                                            null,
                                            x
                                        );
                                    })
                                ),
                                task && _react2['default'].createElement(
                                    'div',
                                    null,
                                    _react2['default'].createElement(
                                        'h6',
                                        null,
                                        task.StatusMessage
                                    ),
                                    task.Status !== "Finished" && _react2['default'].createElement(_materialUi.LinearProgress, { mode: 'determinate', min: 0, max: 100, value: (task.Progress || 0) * 100, style: { width: '100%' } })
                                )
                            )
                        ),
                        content
                    )
                )
            );
        }
    }]);

    return Dashboard;
})(_react2['default'].Component);

exports['default'] = Dashboard;
module.exports = exports['default'];
