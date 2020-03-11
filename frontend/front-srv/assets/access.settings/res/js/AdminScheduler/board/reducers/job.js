import {
    ATTACH_MODEL_ACTION,
    DETACH_MODEL_ACTION,
    DROP_FILTER_ACTION, EDITOR_REVERT,
    JOB_LOADED, JOB_SWITCH_TRIGGER, JOB_UPDATE_LABEL, JOB_UPDATE_PROPERTY, REMOVE_FILTER_ACTION,
    REMOVE_MODEL_ACTION, TOGGLE_FILTER_AS_CONDITION
} from "../actions/editor";
import {JobsJob} from 'pydio/http/rest-api';
import JobInput from "../graph/JobInput";
import Action from "../graph/Action";
import JobGraph from "../JobGraph";
import {AllowedKeys, linkAttr} from "../graph/Configs";
import ActionFilter from "../graph/ActionFilter";



export default function(job = new JobsJob(), action) {

    let linkView, sourceModel, targetModel, sourceRemoveKey = 'ChainedActions';
    if(action.type === ATTACH_MODEL_ACTION || action.type === DETACH_MODEL_ACTION) {
        linkView = action.linkView;
        sourceModel = linkView.sourceView.model;
        if(sourceModel instanceof ActionFilter){
            const sourcePort = linkView.model.attributes.source.port;
            if(sourcePort === 'negate'){
                sourceModel = sourceModel.getJobsAction().model;
                sourceRemoveKey = 'FailedFilterActions';
            } else {
                console.error("Cannot break this link!");
                return job
            }
        }

        targetModel = linkView.targetView.model;
        if(action.originalTarget){
            targetModel = action.originalTarget.model;
        }
    }

    switch (action.type) {
        case JOB_LOADED:
            return action.job;

        case JOB_UPDATE_LABEL:
            job.Label = action.label;
            return job;

        case JOB_UPDATE_PROPERTY:
            job[action.propertyName] = action.propertyValue;
            return job;

        case ATTACH_MODEL_ACTION:
            if (targetModel instanceof Action) {
                if (sourceModel instanceof JobInput) {
                    job.Actions = [...job.Actions, targetModel.getJobsAction()];
                } else if (sourceModel instanceof Action) {
                    const parentAction = sourceModel.getJobsAction();
                    const orig = parentAction[sourceRemoveKey] || [];
                    parentAction[sourceRemoveKey] = [...orig, targetModel.getJobsAction()];
                }
            }
            return job;

        case DETACH_MODEL_ACTION:

            const {toolView} = action;
            if (targetModel instanceof Action) {
                if(sourceModel instanceof  JobInput) {
                    job.Actions = job.Actions.filter((a => {
                        return a !== targetModel.getJobsAction();
                    }));
                    if(toolView){
                        linkView.model.remove({ ui: true, tool: toolView.cid });
                    }
                } else if (sourceModel instanceof Action) {
                    sourceModel.getJobsAction()[sourceRemoveKey] = sourceModel.getJobsAction()[sourceRemoveKey].filter(a => {
                        return a !== targetModel.getJobsAction();
                    });
                    if(toolView){
                        linkView.model.remove({ ui: true, tool: toolView.cid });
                    }
                }
            }
            return job;

        case TOGGLE_FILTER_AS_CONDITION:
            const {toggle, action} = action;
            if(toggle && !action.FailedFilterActions){
                action.FailedFilterActions = [];
            } else if(!toggle && action.FailedFilterActions) {
                // TODO MOVE ACTIONS IN EMPTY GRAPH IF THERE ARE ANY?
                action.FailedFilterActions = undefined;
            }
            return job;

        case DROP_FILTER_ACTION:

            const {target, dropped, filterOrSelector, objectType} = action;

            const dropOn = target instanceof JobsJob ? "job" : "action";
            const keySet = AllowedKeys.target[dropOn][filterOrSelector].filter(o => {
                return dropped instanceof o.type
            });
            if(keySet.length){
                target[keySet[0].key] = dropped;
                if(target instanceof JobsJob){
                    const hasData = JobGraph.jobInputCreatesData(target);
                    target.model.graph.getConnectedLinks(target.model).forEach((link) => {
                        link.attr(linkAttr(hasData));
                    });
                }
                if(target.model && target.model.notifyJobModel){ // REFRESH GRAPH MODEL
                    target.model.notifyJobModel(target);
                }
            }
            return job;

        case REMOVE_FILTER_ACTION:

            const removeTarget = action.target;
            const removeFilterOrSelector = action.filterOrSelector;
            const removeObjectType = action.objectType;
            if(removeTarget === job){
                if(removeFilterOrSelector === 'filter'){
                    switch (removeObjectType) {
                        case "user":
                            delete job.UserEventFilter;
                            break;
                        case "idm":
                            delete job.IdmFilter;
                            break;
                        case "context":
                            delete job.ContextMetaFilter;
                            break;
                        default: // NODE
                            delete job.NodeEventFilter;
                            break;
                    }
                } else if(removeFilterOrSelector === 'selector') {
                    switch (removeObjectType) {
                        case "user":
                            delete job.UsersSelector;
                            break;
                        case "idm":
                            delete job.IdmSelector;
                            break;
                        default: // NODE
                            delete job.NodesSelector;
                            break;
                    }
                }
                const hasData = JobGraph.jobInputCreatesData(removeTarget);
                removeTarget.model.graph.getConnectedLinks(removeTarget.model).forEach((link) => {
                    link.attr(linkAttr(hasData));
                });
            } else {
                // Target is an action
                if(removeFilterOrSelector === 'filter'){
                    switch (removeObjectType) {
                        case "user":
                            delete removeTarget.UsersFilter;
                            break;
                        case "idm":
                            delete removeTarget.IdmFilter;
                            break;
                        case "context":
                            delete removeTarget.ContextMetaFilter;
                            break;
                        case "output":
                            delete removeTarget.ActionOutputFilter;
                            break;
                        default: // NODE
                            delete removeTarget.NodesFilter;
                            break;
                    }
                    if(!removeTarget.UsersFilter && !removeTarget.IdmFilter && !removeTarget.ContextMetaFilter && !removeTarget.ActionOutputFilter && !removeTarget.NodesFilter) {
                        // There is no more filters, make sure to clear the FailedFilters branch as well
                        // TODO Store them in a tmp graph?
                        if(removeTarget.FailedFilterActions){
                            delete removeTarget.FailedFilterActions;
                        }
                    }
                } else if(removeFilterOrSelector === 'selector') {
                    switch (removeObjectType) {
                        case "user":
                            delete removeTarget.UsersSelector;
                            break;
                        case "idm":
                            delete removeTarget.IdmSelector;
                            break;
                        default: // NODE
                            delete removeTarget.NodesSelector;
                            break;
                    }
                }
            }
            if(removeTarget.model && removeTarget.model.notifyJobModel){ // REFRESH GRAPH MODEL
                removeTarget.model.notifyJobModel(removeTarget);
            }
            return job;

        case REMOVE_MODEL_ACTION:
            const {model, parentModel, removeFilter} = action;
            if(model instanceof Action) {
                //console.log(model, parentModel);
                if(parentModel) {
                    // Action is connected from Action
                    if(parentModel instanceof Action){
                        parentModel.getJobsAction().ChainedActions = parentModel.getJobsAction().ChainedActions.filter(a => {
                            return a !== model.getJobsAction();
                        });
                    } else if(parentModel instanceof JobInput){
                        job.Actions = job.Actions.filter(a => {
                            return a !== model.getJobsAction();
                        });
                    }
                }
                model.remove();
                if(removeFilter){
                    removeFilter.remove();
                }
            }
            return job;

        case JOB_SWITCH_TRIGGER :
            const {triggerType, triggerData} = action;
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
            if(job.model && job.model.notifyJobModel){
                job.model.notifyJobModel(job);
            }
            const hasData = JobGraph.jobInputCreatesData(job);
            job.model.graph.getConnectedLinks(job.model).forEach((link) => {
                link.attr(linkAttr(hasData));
            });
            return job;

        case EDITOR_REVERT:
            return JobsJob.constructFromObject(JSON.parse(JSON.stringify(action.original)));

        default:
            return job
    }
}