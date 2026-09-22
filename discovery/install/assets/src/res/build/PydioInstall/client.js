'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _ApiClient2 = require('./gen/ApiClient');

var _ApiClient3 = _interopRequireDefault(_ApiClient2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Override callApi Method
var Client = function (_ApiClient) {
    _inherits(Client, _ApiClient);

    function Client() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Client);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Client.__proto__ || Object.getPrototypeOf(Client)).call.apply(_ref, [this].concat(args))), _this), _this.basePath = '/a', _this.hasReceivedEvents = false, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Client, [{
        key: 'pollEvents',
        // true once the install has started publishing real events

        value: function pollEvents(observer, reloadObserver) {
            var _this2 = this;

            var emptyCount = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

            var MAX_EMPTY = 5; // 5 × 4s = 20s of no new events → install done, move on
            var params = { timeout: 10, category: 'install' };
            if (this.lastEventsTimestamp) {
                params['since_time'] = this.lastEventsTimestamp;
            }
            _get(Client.prototype.__proto__ || Object.getPrototypeOf(Client.prototype), 'callApi', this).call(this, "/install/events", "GET", [], params, [], [], [], [], ["application/json"], ["application/json"], Object).then(function (response) {
                if (response && response.data) {
                    if (response.data.events && response.data.events.length) {
                        var events = [].concat(_toConsumableArray(response.data.events));
                        var lastEvent = events.pop();
                        _this2.lastEventsTimestamp = lastEvent.timestamp;
                        _this2.hasReceivedEvents = true; // install is running
                        observer(response.data.events);
                        if (lastEvent.data.Progress < 99) {
                            _this2.pollEvents(observer, reloadObserver, 0); // reset empty counter on real events
                        } else {
                            _this2.pollDiscovery(reloadObserver);
                        }
                    } else if (response.data.timestamp) {
                        _this2.lastEventsTimestamp = response.data.timestamp;
                        // Only count empty responses toward MAX_EMPTY once the install has started.
                        // Before install, empty responses are expected (user is still on the form).
                        if (_this2.hasReceivedEvents && emptyCount >= MAX_EMPTY) {
                            // Final event was missed (eventManager shut down before we polled) - move to discovery
                            _this2.pollDiscovery(reloadObserver);
                            return;
                        }
                        setTimeout(function () {
                            _this2.pollEvents(observer, reloadObserver, _this2.hasReceivedEvents ? emptyCount + 1 : 0);
                        }, 4000);
                    }
                } else {
                    _this2.pollDiscovery(reloadObserver);
                }
            }).catch(function () {
                _this2.pollDiscovery(reloadObserver);
            });
        }

        // Phase 1: wait for the REST API to come up (/config/discovery is only served
        // by the full Cells gateway, not the lightweight installer server).

    }, {
        key: 'pollDiscovery',
        value: function pollDiscovery(reloadObserver) {
            var _this3 = this;

            var retries = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            var MAX_RETRIES = 40; // ~120s
            _get(Client.prototype.__proto__ || Object.getPrototypeOf(Client.prototype), 'callApi', this).call(this, "/config/discovery", "GET", [], [], [], [], [], [], ["application/json"], ["application/json"], Object).then(function () {
                // REST API is up - now confirm the web frontend is actually serving pages.
                _this3.pollFrontend(reloadObserver);
            }).catch(function () {
                if (retries >= MAX_RETRIES) {
                    reloadObserver();
                    return;
                }
                setTimeout(function () {
                    return _this3.pollDiscovery(reloadObserver, retries + 1);
                }, 3000);
            });
        }

        // Phase 2: fetch '/' directly to confirm the web UI is serving before navigating.
        // This eliminates any arbitrary delay - we navigate exactly when the server is ready.

    }, {
        key: 'pollFrontend',
        value: function pollFrontend(reloadObserver) {
            var _this4 = this;

            var retries = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            var MAX_RETRIES = 10; // ~30s
            fetch('/', { method: 'GET', redirect: 'follow' }).then(function (resp) {
                if (resp.ok) {
                    reloadObserver();
                } else {
                    // Server responded but with an error - keep retrying
                    if (retries >= MAX_RETRIES) {
                        reloadObserver();return;
                    }
                    setTimeout(function () {
                        return _this4.pollFrontend(reloadObserver, retries + 1);
                    }, 3000);
                }
            }).catch(function () {
                if (retries >= MAX_RETRIES) {
                    reloadObserver();return;
                }
                setTimeout(function () {
                    return _this4.pollFrontend(reloadObserver, retries + 1);
                }, 3000);
            });
        }
    }]);

    return Client;
}(_ApiClient3.default);

exports.default = Client;
