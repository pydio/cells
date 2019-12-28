"use strict";

exports.__esModule = true;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _queryString = require('query-string');

var _queryString2 = _interopRequireDefault(_queryString);

var RedirectNavigator = (function () {
    function RedirectNavigator(store) {
        _classCallCheck(this, RedirectNavigator);

        this.store = store;
    }

    RedirectNavigator.prototype.prepare = function prepare() {
        return Promise.resolve(this);
    };

    RedirectNavigator.prototype.navigate = function navigate(params) {
        var _this = this;

        return new Promise(function (resolve, reject) {
            if (!params || !params.url) {
                Log.error("RedirectNavigator.navigate: No url provided");
                return reject(new Error("No url provided"));
            }

            // const [url, query] = params.url.split('?')
            // const data = qs.parse(query)
            // data.format = 'json'

            // console.log(url, data, url + '?' + qs.stringify(data))
            console.log("Redirecting to ", params.url);

            fetch(params.url, {
                method: "GET",
                headers: {
                    'Accept': 'application/json'
                }
            }).then(function (response) {
                return response.json();
            }).then(function (response) {
                _this.store.setItem("challenge", response.challenge);
                _this.store.removeItem("fullRedirect");

                resolve();
            })["catch"](function (e) {
                return resolve();
            });
        });
    };

    _createClass(RedirectNavigator, [{
        key: "url",
        get: function get() {
            return window.location.href;
        }
    }]);

    return RedirectNavigator;
})();

exports.RedirectNavigator = RedirectNavigator;
