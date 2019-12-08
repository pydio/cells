import {ATTACH_MODEL_ACTION, DETACH_MODEL_ACTION, JOB_LOADED, REMOVE_MODEL_ACTION} from "../actions/editor";
import {JobsJob} from 'pydio/http/rest-api';
import JobInput from "../graph/JobInput";
import Action from "../graph/Action";
import Filter from "../graph/Filter";
import Selector from "../graph/Selector";



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
            } else if(targetModel instanceof Filter && sourceModel instanceof JobInput) {
                switch (targetModel.getFilterType()) {
                    case "user":
                        job.UserEventFilter = targetModel.getFilter();
                        break;
                    case "idm":
                        job.IdmFilter = targetModel.getFilter();
                        break;
                    default: // NODE
                        job.NodeEventFilter = targetModel.getFilter();
                        break;
                }
            } else if(targetModel instanceof Selector) {

            }
            return job;

        case DETACH_MODEL_ACTION:
            console.log(sourceModel, targetModel);
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
            } else if(targetModel instanceof Filter) {



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

        default:
            return job
    }
}