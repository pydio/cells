'use strict';

exports.__esModule = true;

var _utils = require('../utils');

// Actions definitions
var onSizeChange = function onSizeChange(_ref) {
  var dispatch = _ref.dispatch;
  return function (data) {
    return dispatch(_utils.EditorActions.editorModify(data));
  };
};
exports.onSizeChange = onSizeChange;
