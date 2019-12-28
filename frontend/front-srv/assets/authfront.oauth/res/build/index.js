'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _LoginConnectorsDialog = require('./LoginConnectorsDialog');

var _LoginConnectorsDialog2 = _interopRequireDefault(_LoginConnectorsDialog);

var Callbacks = (function () {
    function Callbacks() {
        _classCallCheck(this, Callbacks);
    }

    _createClass(Callbacks, null, [{
        key: 'login',
        value: function login() {
            PydioApi.getRestClient().getOrUpdateJwt().then(function (jwt) {
                if (jwt == "") {
                    pydio.UI.openComponentInModal('AuthfrontOAuth', 'LoginConnectorsDialog', { blur: true });
                } else {
                    pydio.Registry.load();
                }
            });
        }
    }]);

    return Callbacks;
})();

exports.LoginConnectorsDialog = _LoginConnectorsDialog2['default'];
exports.Callbacks = Callbacks;
