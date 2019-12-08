import {TOGGLE_EDITOR_MODE} from "../actions/editor";

function editor (state = false, action) {
    switch (action.type) {
        case TOGGLE_EDITOR_MODE:
            return !state;
        default:
            return state;
    }
}




export default editor