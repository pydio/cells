import {SELECTION_CHANGE_ACTION, SELECTION_CLEAR_ACTION} from "../actions/editor";

export default function selectionReducer(selection = {}, action) {
    switch (action.type) {
        case SELECTION_CLEAR_ACTION :
            return {};
        case SELECTION_CHANGE_ACTION:
            return {type: action.selectionType, model: action.selectionModel}
    }
}