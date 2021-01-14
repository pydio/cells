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

import Observable from '../lang/Observable'
import PydioApi from '../http/PydioApi'

/**
 * A monitor for user "idle" state to prevent session timing out.
 */
export default class ActivityMonitor extends Observable{

    /**
     * Constructor
     * @param pydio Pydio
     */
    constructor(pydio){

        super();

        const serverSessionTime = pydio.Parameters.get('session_timeout');
        const clientSessionTime = pydio.Parameters.get('client_timeout');
        const warningMinutes    = pydio.Parameters.get('client_timeout_warning');

        this._pydio             = pydio;
        this._warningMinutes    = 3;
        this._renewMinutes      = 10;
        this._logoutMinutes     = 0;

        this._lastActive        = 0;
        this._state             = 'active';
        this._longTaskRunning   = 0;


        if(!serverSessionTime) {
            return;
        }

        if( serverSessionTime <= 60 * this._renewMinutes ){
            this._renewMinutes = 2;
        }
        if( clientSessionTime === -1 ){
            this._renewTime = serverSessionTime - this._renewMinutes*60;
            if(this._pydio.user){
                this.startServerLongPoller();
            }
            this._pydio.observe('user_logged', (u) => {
                if(u) this.startServerLongPoller();
                else this.stopServerLongPoller();
            });
            return;
        }

        this._serverSessionTime = serverSessionTime;
        if(warningMinutes) {
            this._warningMinutes = warningMinutes;
            this._warningTime = clientSessionTime - this._warningMinutes*60;
        }else{
            this._warningTime = false
        }
        this._logoutTime = clientSessionTime - this._logoutMinutes*60;
        this._renewTime = serverSessionTime - this._renewMinutes*60;
        this._lastActive = this.getNow();


        this._activityObserver = null;

        if(this._pydio.user){
            this.register();
        }
        this._pydio.observe('user_logged', (u) => {
            this.updateLastActive();
            if(u) this.register();
            else this.unregister();
        });

    }

    startServerLongPoller(){
        if(this._serverInterval) {
            return;
        }
        this._serverInterval = setInterval(()=>{
            PydioApi.getRestClient().getOrUpdateJwt().then(() => {});
        }, Math.min((Math.pow(2,31)-1), this._renewTime*1000));
    }

    stopServerLongPoller(){
        if(this._serverInterval){
            clearInterval(this._serverInterval);
            this._serverInterval = null;
        }
    }

    startIdlePoller(restartAt = null){
        if(restartAt){
            if(this._idleInterval) clearInterval(this._idleInterval);
            this._idleInterval = setInterval(this.idleObserver.bind(this), restartAt);
        }else{
            if(this._idleInterval) return;
            this._idleInterval = setInterval(this.idleObserver.bind(this), 5000);
        }
    }

    stopIdlePoller(){
        if(this._idleInterval){
            clearInterval(this._idleInterval);
            this._idleInterval = null;
        }
    }

    register(){
        if(this._activityObserver !== null){
            // Already registered
            return;
        }
        this._state = 'active';
        this._activityObserver = this.activityObserver.bind(this);
        this._pydio.observe('user_activity', this._activityObserver);
        this._pydio.observe('server_answer', this._activityObserver);
        this._ltsObserver = () => {
            //console.log('Long task starting...');
            this._longTaskRunning ++;
            this._activityObserver();
        };
        this._pydio.observe('longtask_starting', this._ltsObserver);
        this._ltfObserver = () => {
            //console.log('Long task finished...');
            this._longTaskRunning --;
            this._activityObserver();
        };
        this._pydio.observe('longtask_finished', this._ltfObserver);
        this.startIdlePoller();
        this.startServerLongPoller();
    }

    unregister(){
        if(this._activityObserver === null){
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

    }

    /**
     * Listener to clear the timer
     */
    activityObserver(event){
        if(event && ((event.memo && event.memo.discrete) || event.discrete)){
            return;
        }
        if(this._state === 'warning') {
            this.exitIdleState();
            return;
        }
        if(this._internalTimer) clearTimeout(this._internalTimer);
        this._internalTimer = setTimeout(this.updateLastActive.bind(this), 1000);
    }


    /**
     * Set last activity time
     */
    updateLastActive() {
        this._lastActive = this.getNow();
    }

    /**
     * Listener for "idle" state of the user
     */
    idleObserver(){
        const idleTime = (this.getNow() - this._lastActive);
        if(this._state === 'inactive') return;
        if(this._longTaskRunning){
            this.updateLastActive();
            return;
        }
        // console.log(idleTime, this._warningTime, this._logoutTime);
        if( idleTime >= this._logoutTime ){
            this.removeWarningState();
            this._state = 'active';
            this.stopIdlePoller();
            this.stopServerLongPoller();
            setTimeout(() => {
                this._pydio.getController().fireDefaultAction("expire");
            }, 1000);
            return;
        }
        if( this._warningTime && idleTime >= this._warningTime ){
            const timerString = this.getWarningTimer(this._logoutTime - idleTime);
            this.setWarningState(timerString, this._logoutTime - idleTime);
        }
    }

    /**
     * Reactivate window
     */
    exitIdleState(){
        this.removeWarningState();
        this.updateLastActive();
        this._state = 'active';
        this.startIdlePoller(5000);
    }

    /**
     * Put the window in "warning" state : overlay, shaking timer, chronometer.
     */
    setWarningState(warningTimerString, timeSeconds){
        this._state = 'warning';
        this.startIdlePoller(1000);

        this._pydio.notify('activity_state_change', {
            activeState: 'warning',
            lastActiveSince:this._warningTime/60,
            timerString: warningTimerString,
            lastActiveSeconds: this._warningTime,
            timerSeconds: timeSeconds
        });
    }

    /**
     * Chronometer for warning before timeout
     * @param time Integer
     */
    getWarningTimer(time){
        return Math.floor(time/60)+'mn'+(time%60) + 's';
    }

    /**
     * Removes the overlay of warning state
     */
    removeWarningState(){
        this._pydio.notify('activity_state_change', {
            activeState:'active'
        });
    }

    /**
     * Utility to get the time
     * @returns Integer
     */
    getNow(){
        return Math.round((new Date()).getTime() / 1000);
    }


}