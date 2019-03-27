'use strict';

exports.__esModule = true;

var _utils = require('../utils');

// Actions definitions
var onSelectionChange = function onSelectionChange(_ref) {
  var dispatch = _ref.dispatch;
  var tab = _ref.tab;
  return function (node) {
    return dispatch(_utils.EditorActions.tabModify({ id: tab.id, title: node.getLabel(), node: node }));
  };
};
exports.onSelectionChange = onSelectionChange;
var onTogglePlaying = function onTogglePlaying(_ref2) {
  var dispatch = _ref2.dispatch;
  var tab = _ref2.tab;
  return function (playing) {
    return dispatch(_utils.EditorActions.tabModify({ id: tab.id, playing: playing }));
  };
};
exports.onTogglePlaying = onTogglePlaying;
