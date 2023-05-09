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

export default class PeriodicalExecuter{

    constructor(callback, frequency) {
        this.callback = callback;
        this.frequency = frequency;
        this.currentlyExecuting = false;

        this.registerCallback();
    }

    registerCallback() {
        this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
    }

    execute() {
        this.callback(this);
    }

    stop() {
        if (!this.timer) return;
        clearInterval(this.timer);
        this.timer = null;
    }

    onTimerEvent() {
        if (!this.currentlyExecuting) {
            try {
                this.currentlyExecuting = true;
                this.execute();
                this.currentlyExecuting = false;
            } catch(e) {
                this.currentlyExecuting = false;
                throw e;
            }
        }
    }
}