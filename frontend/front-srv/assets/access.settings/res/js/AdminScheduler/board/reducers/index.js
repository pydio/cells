import editor from './editor'
import graphReducer from './graph'
import paperReducer from "./paper";
import jobReducer from './job';
import {combineReducers} from 'redux'

const allReducers = combineReducers({
    editMode: editor,
    graph: graphReducer,
    paper: paperReducer,
    job: jobReducer
});

export default allReducers