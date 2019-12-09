import {
    ATTACH_MODEL_ACTION,
    DETACH_MODEL_ACTION,
    DROP_FILTER_ACTION,
    JOB_LOADED, JOB_SWITCH_TRIGGER, REMOVE_FILTER_ACTION,
    REMOVE_MODEL_ACTION
} from "../actions/editor";
import {JobsJob} from 'pydio/http/rest-api';
import JobInput from "../graph/JobInput";
import Action from "../graph/Action";



export default function(job = new JobsJob(), action) {

    let linkView, sourceModel, targetModel;
    if(action.type === ATTACH_MODEL_ACTION || action.type === DETACH_MODEL_ACTION) {
        linkView = action.linkView;
        sourceModel = linkView.sourceView.model;
        targetModel = linkView.targetView.model;
        if(action.originalTarget){
            targetModel = action.originalTarget.model;
        }
    }

    switch (action.type) {
        case JOB_LOADED:
            return action.job;

        case ATTACH_MODEL_ACTION:
            if (targetModel instanceof Action) {
                if (sourceModel instanceof JobInput) {
                    job.Actions = [...job.Actions, targetModel.getJobsAction()];
                } else if (sourceModel instanceof Action) {
                    const parentAction = sourceModel.getJobsAction();
                    const orig = parentAction.ChainedActions || [];
                    parentAction.ChainedActions = [...orig, targetModel.getJobsAction()];
                }
            }
            return job;

        case DROP_FILTER_ACTION:

            const {target, dropped, filterOrSelector, objectType} = action;
            if(target === job){
                if(filterOrSelector === 'filter'){
                    switch (objectType) {
                        case "user":
                            job.UserEventFilter = dropped;
                            break;
                        case "idm":
                            job.IdmFilter = dropped;
                            break;
                        default: // NODE
                            job.NodeEventFilter = dropped;
                            break;
                    }
                } else if(filterOrSelector === 'selector') {
                    switch (objectType) {
                        case "user":
                            job.UsersSelector = dropped;
                            break;
                        case "idm":
                            job.IdmSelector = dropped;
                            break;
                        default: // NODE
                            job.NodesSelector = dropped;
                            break;
                    }
                }
            } else {
                // Target is an action
                if(filterOrSelector === 'filter'){
                    switch (objectType) {
                        case "user":
                            target.UsersFilter = dropped;
                            break;
                        case "idm":
                            target.IdmFilter = dropped;
                            break;
                        default: // NODE
                            target.NodesFilter = dropped;
                            break;
                    }
                } else if(filterOrSelector === 'selector') {
                    switch (objectType) {
                        case "user":
                            target.UsersSelector = dropped;
                            break;
                        case "idm":
                            target.IdmSelector = dropped;
                            break;
                        default: // NODE
                            target.NodesSelector = dropped;
                            break;
                    }
                }
            }
            if(target.model && target.model.notifyJobModel){ // REFRESH GRAPH MODEL
                target.model.notifyJobModel(target);
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
                        default: // NODE
                            delete removeTarget.NodesFilter;
                            break;
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
                    sourceModel.getJobsAction().ChainedActions = sourceModel.getJobsAction().ChainedActions.filter(a => {
                        return a !== targetModel.getJobsAction();
                    });
                    if(toolView){
                        linkView.model.remove({ ui: true, tool: toolView.cid });
                    }
                }
            }
            return job;

        case REMOVE_MODEL_ACTION:
            const {model, parentModel} = action;
            if(model instanceof Action) {
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
            return job;

        default:
            return job
    }
}