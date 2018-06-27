import { EditorActions } from '../utils';

// Actions definitions
export const onSizeChange = ({dispatch}) => (data) => dispatch(EditorActions.editorModify(data))
