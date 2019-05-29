'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _localStorage = require('localStorage');

var _localStorage2 = _interopRequireDefault(_localStorage);

var persistedState = _localStorage2['default']();
var store = createStore(app, persistedState);

store.subscribe(function () {
    saveState({
        todos: store.getState().todos
    });
});
