import { createSelector } from 'reselect'

// Selectors
const editor = state => state.editor
const tabs = state => state.tabs

export const getActiveTabIdIndex = createSelector(
    editor,
    _ => _.activeTabId
)

export const getEditorResolution = createSelector(
    editor,
    _ => _.resolution || "lo"
)

export const getActiveTab = createSelector(
    [tabs, getActiveTabIdIndex],
    (tabs, activeTabId) => {
        return tabs.reduce((current, tab) => tab.id === activeTabId ? tab : current, {})
    }
)