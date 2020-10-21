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

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _langObservable = require('../lang/Observable');

var _langObservable2 = _interopRequireDefault(_langObservable);

var _httpPydioApi = require('../http/PydioApi');

var _httpPydioApi2 = _interopRequireDefault(_httpPydioApi);

/**
 * A monitor for user "idle" state to prevent session timing out.
 */

var ActivityMonitor = (function (_Observable) {
    _inherits(ActivityMonitor, _Observable);

    /**
     * Constructor
     * @param pydio Pydio
     */

    function ActivityMonitor(pydio) {
        var _this = this;

        _classCallCheck(this, ActivityMonitor);

        _Observable.call(this);

        var serverSessionTime = pydio.Parameters.get('session_timeout');
        var clientSessionTime = pydio.Parameters.get('client_timeout');
        var warningMinutes = pydio.Parameters.get('client_timeout_warning');

        this._pydio = pydio;
        this._warningMinutes = 3;
        this._renewMinutes = 10;
        this._logoutMinutes = 0;

        this._lastActive = 0;
        this._state = 'active';
        this._longTaskRunning = 0;

        if (!serverSessionTime) {
            return;
        }

        if (serverSessionTime <= 60 * this._renewMinutes) {
            this._renewMinutes = 2;
        }
        if (clientSessionTime === -1) {
            this._renewTime = serverSessionTime - this._renewMinutes * 60;
            if (this._pydio.user) {
                this.startServerLongPoller();
            }
            this._pydio.observe('user_logged', function (u) {
                if (u) _this.startServerLongPoller();else _this.stopServerLongPoller();
            });
            return;
        }

        this._serverSessionTime = serverSessionTime;
        if (warningMinutes) {
            this._warningMinutes = warningMinutes;
            this._warningTime = clientSessionTime - this._warningMinutes * 60;
        } else {
            this._warningTime = false;
        }
        this._logoutTime = clientSessionTime - this._logoutMinutes * 60;
        this._renewTime = serverSessionTime - this._renewMinutes * 60;
        this._lastActive = this.getNow();

        this._activityObserver = null;

        if (this._pydio.user) {
            this.register();
        }
        this._pydio.observe('user_logged', function (u) {
            _this.updateLastActive();
            if (u) _this.register();else _this.unregister();
        });
    }

    ActivityMonitor.prototype.startServerLongPoller = function startServerLongPoller() {
        if (this._serverInterval) {
            return;
        }
        this._serverInterval = setInterval(function () {
            _httpPydioApi2['default'].getRestClient().getOrUpdateJwt().then(function () {});
        }, Math.min(Math.pow(2, 31) - 1, this._renewTime * 1000));
    };

    ActivityMonitor.prototype.stopServerLongPoller = function stopServerLongPoller() {
        if (this._serverInterval) {
            clearInterval(this._serverInterval);
            this._serverInterval = null;
        }
    };

    ActivityMonitor.prototype.startIdlePoller = function startIdlePoller() {
        var restartAt = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        if (restartAt) {
            if (this._idleInterval) clearInterval(this._idleInterval);
            this._idleInterval = setInterval(this.idleObserver.bind(this), restartAt);
        } else {
            if (this._idleInterval) return;
            this._idleInterval = setInterval(this.idleObserver.bind(this), 5000);
        }
    };

    ActivityMonitor.prototype.stopIdlePoller = function stopIdlePoller() {
        if (this._idleInterval) {
            clearInterval(this._idleInterval);
            this._idleInterval = null;
        }
    };

    ActivityMonitor.prototype.register = function register() {
        var _this2 = this;

        if (this._activityObserver !== null) {
            // Already registered
            return;
        }
        this._state = 'active';
        this._activityObserver = this.activityObserver.bind(this);
        this._pydio.observe('user_activity', this._activityObserver);
        this._pydio.observe('server_answer', this._activityObserver);
        this._ltsObserver = function () {
            console.log('Long task starting...');
            _this2._longTaskRunning++;
            _this2._activityObserver();
        };
        this._pydio.observe('longtask_starting', this._ltsObserver);
        this._ltfObserver = function () {
            console.log('Long task finished...');
            _this2._longTaskRunning--;
            _this2._activityObserver();
        };
        this._pydio.observe('longtask_finished', this._ltfObserver);
        this.startIdlePoller();
        this.startServerLongPoller();
    };

    ActivityMonitor.prototype.unregister = function unregister() {
        if (this._activityObserver === null) {
            // Already inactive
            return;
        }
        this.stopIdlePoller();
        this.stopServerLongPoller();
        this._state = 'inactive';
        this._pydio.stopObserving('user_activity', this._activityObserver);
        this._pydio.stopObserving('server_answer', this._activityObserver);
        this._pydio.stopObserving('longtask_starting', this._ltsObserver);
        this._pydio.stopObserving('longtask_finished', this._ltfObserver);
        this._activityObserver = null;
    };

    /**
     * Listener to clear the timer
     */

    ActivityMonitor.prototype.activityObserver = function activityObserver(event) {
        if (event && (event.memo && event.memo.discrete || event.discrete)) {
            return;
        }
        if (this._state === 'warning') {
            this.exitIdleState();
            return;
        }
        if (this._internalTimer) clearTimeout(this._internalTimer);
        this._internalTimer = setTimeout(this.updateLastActive.bind(this), 1000);
    };

    /**
     * Set last activity time
     */

    ActivityMonitor.prototype.updateLastActive = function updateLastActive() {
        this._lastActive = this.getNow();
    };

    /**
     * Listener for "idle" state of the user
     */

    ActivityMonitor.prototype.idleObserver = function idleObserver() {
        var _this3 = this;

        var idleTime = this.getNow() - this._lastActive;
        if (this._state === 'inactive') return;
        if (this._longTaskRunning) {
            this.updateLastActive();
            return;
        }
        // console.log(idleTime, this._warningTime, this._logoutTime);
        if (idleTime >= this._logoutTime) {
            this.removeWarningState();
            this._state = 'active';
            this.stopIdlePoller();
            this.stopServerLongPoller();
            setTimeout(function () {
                _this3._pydio.getController().fireDefaultAction("expire");
            }, 1000);
            return;
        }
        if (this._warningTime && idleTime >= this._warningTime) {
            var timerString = this.getWarningTimer(this._logoutTime - idleTime);
            this.setWarningState(timerString, this._logoutTime - idleTime);
        }
    };

    /**
     * Reactivate window
     */

    ActivityMonitor.prototype.exitIdleState = function exitIdleState() {
        this.removeWarningState();
        this.updateLastActive();
        this._state = 'active';
        this.startIdlePoller(5000);
    };

    /**
     * Put the window in "warning" state : overlay, shaking timer, chronometer.
     */

    ActivityMonitor.prototype.setWarningState = function setWarningState(warningTimerString, timeSeconds) {
        this._state = 'warning';
        this.startIdlePoller(1000);

        this._pydio.notify('activity_state_change', {
            activeState: 'warning',
            lastActiveSince: this._warningTime / 60,
            timerString: warningTimerString,
            lastActiveSeconds: this._warningTime,
            timerSeconds: timeSeconds
        });
    };

    /**
     * Chronometer for warning before timeout
     * @param time Integer
     */

    ActivityMonitor.prototype.getWarningTimer = function getWarningTimer(time) {
        return Math.floor(time / 60) + 'mn' + time % 60 + 's';
    };

    /**
     * Removes the overlay of warning state
     */

    ActivityMonitor.prototype.removeWarningState = function removeWarningState() {
        this._pydio.notify('activity_state_change', {
            activeState: 'active'
        });
    };

    /**
     * Utility to get the time
     * @returns Integer
     */

    ActivityMonitor.prototype.getNow = function getNow() {
        return Math.round(new Date().getTime() / 1000);
    };

    return ActivityMonitor;
})(_langObservable2['default']);

exports['default'] = ActivityMonitor;
module.exports = exports['default'];
