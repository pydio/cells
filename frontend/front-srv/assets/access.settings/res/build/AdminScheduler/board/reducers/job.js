"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _actionsEditor = require("../actions/editor");

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _graphJobInput = require("../graph/JobInput");

var _graphJobInput2 = _interopRequireDefault(_graphJobInput);

var _graphAction = require("../graph/Action");

var _graphAction2 = _interopRequireDefault(_graphAction);

var _JobGraph = require("../JobGraph");

var _JobGraph2 = _interopRequireDefault(_JobGraph);

var _graphConfigs = require("../graph/Configs");

exports["default"] = function (job, action) {
    if (job === undefined) job = new _pydioHttpRestApi.JobsJob();

    var linkView = undefined,
        sourceModel = undefined,
        targetModel = undefined;
    if (action.type === _actionsEditor.ATTACH_MODEL_ACTION || action.type === _actionsEditor.DETACH_MODEL_ACTION) {
        linkView = action.linkView;
        sourceModel = linkView.sourceView.model;
        targetModel = linkView.targetView.model;
        if (action.originalTarget) {
            targetModel = action.originalTarget.model;
        }
    }

    switch (action.type) {
        case _actionsEditor.JOB_LOADED:
            return action.job;

        case _actionsEditor.JOB_UPDATE_LABEL:
            job.Label = action.label;
            return job;

        case _actionsEditor.ATTACH_MODEL_ACTION:
            if (targetModel instanceof _graphAction2["default"]) {
                if (sourceModel instanceof _graphJobInput2["default"]) {
                    job.Actions = [].concat(_toConsumableArray(job.Actions), [targetModel.getJobsAction()]);
                } else if (sourceModel instanceof _graphAction2["default"]) {
                    var parentAction = sourceModel.getJobsAction();
                    var orig = parentAction.ChainedActions || [];
                    parentAction.ChainedActions = [].concat(_toConsumableArray(orig), [targetModel.getJobsAction()]);
                }
            }
            return job;

        case _actionsEditor.DROP_FILTER_ACTION:
            var target = action.target,
                dropped = action.dropped,
                filterOrSelector = action.filterOrSelector,
                objectType = action.objectType;

            var dropOn = target instanceof _pydioHttpRestApi.JobsJob ? "job" : "action";
            var keySet = _graphConfigs.AllowedKeys.target[dropOn][filterOrSelector].filter(function (o) {
                return dropped instanceof o.type;
            });
            if (keySet.length) {
                target[keySet[0].key] = dropped;
                if (target instanceof _pydioHttpRestApi.JobsJob) {
                    (function () {
                        var hasData = _JobGraph2["default"].jobInputCreatesData(target);
                        target.model.graph.getConnectedLinks(target.model).forEach(function (link) {
                            link.attr((0, _graphConfigs.linkAttr)(hasData));
                        });
                    })();
                }
                if (target.model && target.model.notifyJobModel) {
                    // REFRESH GRAPH MODEL
                    target.model.notifyJobModel(target);
                }
            }
            return job;

        case _actionsEditor.REMOVE_FILTER_ACTION:

            var removeTarget = action.target;
            var removeFilterOrSelector = action.filterOrSelector;
            var removeObjectType = action.objectType;
            if (removeTarget === job) {
                (function () {
                    if (removeFilterOrSelector === 'filter') {
                        switch (removeObjectType) {
                            case "user":
                                delete job.UserEventFilter;
                                break;
                            case "idm":
                                delete job.IdmFilter;
                                break;
                            default:
                                // NODE
                                delete job.NodeEventFilter;
                                break;
                        }
                    } else if (removeFilterOrSelector === 'selector') {
                        switch (removeObjectType) {
                            case "user":
                                delete job.UsersSelector;
                                break;
                            case "idm":
                                delete job.IdmSelector;
                                break;
                            default:
                                // NODE
                                delete job.NodesSelector;
                                break;
                        }
                    }
                    var hasData = _JobGraph2["default"].jobInputCreatesData(removeTarget);
                    removeTarget.model.graph.getConnectedLinks(removeTarget.model).forEach(function (link) {
                        link.attr((0, _graphConfigs.linkAttr)(hasData));
                    });
                })();
            } else {
                // Target is an action
                if (removeFilterOrSelector === 'filter') {
                    switch (removeObjectType) {
                        case "user":
                            delete removeTarget.UsersFilter;
                            break;
                        case "idm":
                            delete removeTarget.IdmFilter;
                            break;
                        default:
                            // NODE
                            delete removeTarget.NodesFilter;
                            break;
                    }
                } else if (removeFilterOrSelector === 'selector') {
                    switch (removeObjectType) {
                        case "user":
                            delete removeTarget.UsersSelector;
                            break;
                        case "idm":
                            delete removeTarget.IdmSelector;
                            break;
                        default:
                            // NODE
                            delete removeTarget.NodesSelector;
                            break;
                    }
                }
            }
            if (removeTarget.model && removeTarget.model.notifyJobModel) {
                // REFRESH GRAPH MODEL
                removeTarget.model.notifyJobModel(removeTarget);
            }
            return job;

        case _actionsEditor.DETACH_MODEL_ACTION:
            var toolView = action.toolView;

            if (targetModel instanceof _graphAction2["default"]) {
                if (sourceModel instanceof _graphJobInput2["default"]) {
                    job.Actions = job.Actions.filter(function (a) {
                        return a !== targetModel.getJobsAction();
                    });
                    if (toolView) {
                        linkView.model.remove({ ui: true, tool: toolView.cid });
                    }
                } else if (sourceModel instanceof _graphAction2["default"]) {
                    sourceModel.getJobsAction().ChainedActions = sourceModel.getJobsAction().ChainedActions.filter(function (a) {
                        return a !== targetModel.getJobsAction();
                    });
                    if (toolView) {
                        linkView.model.remove({ ui: true, tool: toolView.cid });
                    }
                }
            }
            return job;

        case _actionsEditor.REMOVE_MODEL_ACTION:
            var model = action.model,
                parentModel = action.parentModel;

            if (model instanceof _graphAction2["default"]) {
                if (parentModel) {
                    // Action is connected from Action
                    if (parentModel instanceof _graphAction2["default"]) {
                        parentModel.getJobsAction().ChainedActions = parentModel.getJobsAction().ChainedActions.filter(function (a) {
                            return a !== model.getJobsAction();
                        });
                    } else if (parentModel instanceof _graphJobInput2["default"]) {
                        job.Actions = job.Actions.filter(function (a) {
                            return a !== model.getJobsAction();
                        });
                    }
                }
                model.remove();
            }
            return job;

        case _actionsEditor.JOB_SWITCH_TRIGGER:
            var triggerType = action.triggerType,
                triggerData = action.triggerData;

            switch (triggerType) {
                case "schedule":
                    delete job.EventNames;
                    job.Schedule = triggerData;
                    break;
                case "event":
                    delete job.Schedule;
                    job.EventNames = triggerData;
                    break;
                default:
                    delete job.EventNames;
                    delete job.Schedule;
                    break;
            }
            if (job.model && job.model.notifyJobModel) {
                job.model.notifyJobModel(job);
            }
            var hasData = _JobGraph2["default"].jobInputCreatesData(job);
            job.model.graph.getConnectedLinks(job.model).forEach(function (link) {
                link.attr((0, _graphConfigs.linkAttr)(hasData));
            });
            return job;

        case _actionsEditor.EDITOR_REVERT:
            return _pydioHttpRestApi.JobsJob.constructFromObject(JSON.parse(JSON.stringify(action.original)));

        default:
            return job;
    }
};

module.exports = exports["default"];
