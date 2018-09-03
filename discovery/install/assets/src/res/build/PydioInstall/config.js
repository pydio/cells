'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var LOAD = 'pydio/install/LOAD';

var reducer = function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  switch (action.type) {
    case LOAD:
      return {
        data: action.data
      };
    default:
      return state;
  }
};

/**
 * Simulates data loaded into this reducer from somewhere
 */
var load = exports.load = function load(data) {
  return { type: LOAD, data: data };
};

exports.default = reducer;
