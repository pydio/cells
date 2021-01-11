/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioLangObservable = require('pydio/lang/observable');

var _pydioLangObservable2 = _interopRequireDefault(_pydioLangObservable);

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

var _Pydio$requireLib = _pydio2['default'].requireLib("boot");

var JobsStore = _Pydio$requireLib.JobsStore;

var Loader = (function (_Observable) {
    _inherits(Loader, _Observable);

    function Loader() {
        var jobId = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        _classCallCheck(this, Loader);

        _get(Object.getPrototypeOf(Loader.prototype), 'constructor', this).call(this);
        this.jobId = jobId;
    }

    _createClass(Loader, [{
        key: 'start',
        value: function start() {
            var _this = this;

            this.load(true);
            this._loadDebounced = (0, _lodashDebounce2['default'])(function () {
                _this.load(true);
            }, 500);
            JobsStore.getInstance().observe("tasks_updated", this._loadDebounced);
            this._poll = setInterval(function () {
                if (!_pydio2['default'].getInstance().WebSocketClient.getStatus()) {
                    return;
                }
                _this.load(true);
            }, 5000);
        }
    }, {
        key: 'stop',
        value: function stop() {
            if (this._poll) {
                JobsStore.getInstance().stopObserving("tasks_updated", this._loadDebounced);
                clearInterval(this._poll);
            }
        }
    }, {
        key: 'setFilter',
        value: function setFilter(owner, filter) {
            this.owner = owner;
            this.filter = filter;
            this.load();
        }
    }, {
        key: 'load',
        value: function load() {
            var _this2 = this;

            var hideLoading = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            if (!hideLoading) {
                this.notify('loading');
            }
            if (this.jobId) {
                JobsStore.getInstance().getAdminJobs(this.owner, null, this.jobId).then(function (result) {
                    if (!result.Jobs || result.Jobs.length === 0) {
                        return;
                    }
                    var job = result.Jobs[0];
                    _this2.notify('loaded', { job: job });
                })['catch'](function (reason) {
                    _this2.notify('loaded', { error: reason.message });
                });
            } else {
                JobsStore.getInstance().getAdminJobs(this.owner, null, "", 1).then(function (result) {
                    var jobs = result.Jobs || [];
                    _this2.notify('loaded', { jobs: jobs });
                })['catch'](function (reason) {
                    _this2.notify('loaded', { error: reason.message });
                });
            }
        }
    }]);

    return Loader;
})(_pydioLangObservable2['default']);

exports['default'] = Loader;
module.exports = exports['default'];
