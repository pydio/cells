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

var _graphFilter = require("../graph/Filter");

var _graphFilter2 = _interopRequireDefault(_graphFilter);

var _graphSelector = require("../graph/Selector");

var _graphSelector2 = _interopRequireDefault(_graphSelector);

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

        case _actionsEditor.ATTACH_MODEL_ACTION:
            if (targetModel instanceof _graphAction2["default"]) {
                if (sourceModel instanceof _graphJobInput2["default"]) {
                    job.Actions = [].concat(_toConsumableArray(job.Actions), [targetModel.getJobsAction()]);
                } else if (sourceModel instanceof _graphAction2["default"]) {
                    var parentAction = sourceModel.getJobsAction();
                    var orig = parentAction.ChainedActions || [];
                    parentAction.ChainedActions = [].concat(_toConsumableArray(orig), [targetModel.getJobsAction()]);
                }
            } else if (targetModel instanceof _graphFilter2["default"] && sourceModel instanceof _graphJobInput2["default"]) {
                switch (targetModel.getFilterType()) {
                    case "user":
                        job.UserEventFilter = targetModel.getFilter();
                        break;
                    case "idm":
                        job.IdmFilter = targetModel.getFilter();
                        break;
                    default:
                        // NODE
                        job.NodeEventFilter = targetModel.getFilter();
                        break;
                }
            } else if (targetModel instanceof _graphSelector2["default"]) {}
            return job;

        case _actionsEditor.DETACH_MODEL_ACTION:
            console.log(sourceModel, targetModel);
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
            } else if (targetModel instanceof _graphFilter2["default"]) {}
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

        default:
            return job;
    }
};

module.exports = exports["default"];
