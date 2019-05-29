"use strict";

exports.__esModule = true;

var _reselect = require('reselect');

// Selectors
var editor = function editor(state) {
    return state.editor;
};
var tabs = function tabs(state) {
    return state.tabs;
};

var getActiveTabIdIndex = _reselect.createSelector(editor, function (_) {
    return _.activeTabId;
});

exports.getActiveTabIdIndex = getActiveTabIdIndex;
var getEditorResolution = _reselect.createSelector(editor, function (_) {
    return _.resolution || "lo";
});

exports.getEditorResolution = getEditorResolution;
var getActiveTab = _reselect.createSelector([tabs, getActiveTabIdIndex], function (tabs, activeTabId) {
    return tabs.reduce(function (current, tab) {
        return tab.id === activeTabId ? tab : current;
    }, {});
});
exports.getActiveTab = getActiveTab;
