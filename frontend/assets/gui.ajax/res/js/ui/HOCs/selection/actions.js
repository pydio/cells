import { EditorActions } from '../utils';

// Actions definitions
export const onSelectionChange = ({dispatch, tab}) => (node) => dispatch(EditorActions.tabModify({id: tab.id, title: node.getLabel(), node}))
export const onTogglePlaying = ({dispatch, tab}) => (playing) => dispatch(EditorActions.tabModify({id: tab.id, playing}))
