import editor, {boundingRef, descriptions, dirty, original} from './editor'
import {graphReducer, layoutReducer} from "./graph";
import paperReducer from "./paper";
import jobReducer from './job';
import {combineReducers} from 'redux'

const allReducers = combineReducers({
    editMode: editor,
    graph: graphReducer,
    paper: paperReducer,
    job: jobReducer,
    dirty: dirty,
    boundingRef: boundingRef,
    bbox: layoutReducer,
    descriptions: descriptions,
    original,
    createLinkTool:(s,a) => s || null // identity
});

export default allReducers