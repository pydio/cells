/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioLangObservable = require('pydio/lang/observable');

var _pydioLangObservable2 = _interopRequireDefault(_pydioLangObservable);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var PoliciesLoader = (function (_Observable) {
    _inherits(PoliciesLoader, _Observable);

    function PoliciesLoader() {
        _classCallCheck(this, PoliciesLoader);

        _get(Object.getPrototypeOf(PoliciesLoader.prototype), 'constructor', this).call(this);
        this._loading = false;
        this._loaded = false;
        this._policies = [];
    }

    _createClass(PoliciesLoader, [{
        key: 'load',
        value: function load() {
            var _this = this;

            this._loading = true;
            var api = new _pydioHttpRestApi.PolicyServiceApi(_pydioHttpApi2['default'].getRestClient());
            _pydio2['default'].startLoading();
            api.listPolicies(new _pydioHttpRestApi.IdmListPolicyGroupsRequest()).then(function (data) {
                _pydio2['default'].endLoading();
                _this._policies = [];
                if (data.PolicyGroups) {
                    data.PolicyGroups.map(function (pGroup) {
                        if (pGroup.ResourceGroup === "acl") {
                            _this._policies.push({ id: pGroup.Uuid, label: pGroup.Name });
                        }
                    });
                }
                _this._loaded = true;
                _this._loading = false;
                _this.notify('loaded');
            })['catch'](function () {
                _pydio2['default'].endLoading();
            });
        }
    }, {
        key: 'getPolicies',

        /**
         * @return Promise
         */
        value: function getPolicies() {
            var _this2 = this;

            return new Promise(function (resolve, reject) {

                if (_this2._loaded) {

                    resolve(_this2._policies);
                } else {

                    _this2.observeOnce('loaded', function () {
                        resolve(_this2._policies);
                    });
                    if (!_this2._loading) {
                        _this2.load();
                    }
                }
            });
        }
    }], [{
        key: 'getInstance',
        value: function getInstance() {
            if (!PoliciesLoader.INSTANCE) {
                PoliciesLoader.INSTANCE = new PoliciesLoader();
            }
            return PoliciesLoader.INSTANCE;
        }
    }]);

    return PoliciesLoader;
})(_pydioLangObservable2['default']);

PoliciesLoader.INSTANCE = null;

exports['default'] = PoliciesLoader;
module.exports = exports['default'];
