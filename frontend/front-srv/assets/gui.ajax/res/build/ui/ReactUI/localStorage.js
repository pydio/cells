// localStorage.js
'use strict';

exports.__esModule = true;
var loadState = function loadState() {
  try {
    var serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

exports.loadState = loadState;
var saveState = function saveState(state) {
  try {
    var serializedState = JSON.stringify(state);
    localStorage.setItem('state', serializedState);
  } catch (err) {
    // ignore write errors
    console.log(err);
  }
};
exports.saveState = saveState;
