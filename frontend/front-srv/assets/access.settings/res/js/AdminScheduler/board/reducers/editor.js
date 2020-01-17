import {EDITOR_SAVE_ERROR, EDITOR_SAVE_SUCCESS, EDITOR_SET_DIRTY, TOGGLE_EDITOR_MODE, EDITOR_SET_BOUNDING_REF, EDITOR_ACTIONS_DESCRIPTIONS} from "../actions/editor";
import {JobsJob} from "pydio/http/rest-api";

function editor (state = false, action) {
    switch (action.type) {
        case TOGGLE_EDITOR_MODE:
            return !state;
        default:
            return state;
    }
}

export function dirty(state = false, action) {
    switch (action.type) {
        case EDITOR_SET_DIRTY:
            return action.dirty;
        case EDITOR_SAVE_SUCCESS:
            return false;
        case EDITOR_SAVE_ERROR:
            return true;
        default:
            return state;
    }
}

export function original(state = null, action) {
    switch (action.type) {
        case EDITOR_SAVE_SUCCESS:
            return JobsJob.constructFromObject(JSON.parse(JSON.stringify(action.job)));
        default:
            return state;
    }
}

export function boundingRef(state = null, action) {
    switch (action.type) {
        case EDITOR_SET_BOUNDING_REF:
            return action.boundingRef;
        default:
            return state;
    }
}

export function descriptions(state = {}, action) {
    switch (action.type) {
        case EDITOR_ACTIONS_DESCRIPTIONS:
            return action.descriptions;
        default:
            return state;
    }
}

export default editor