/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import StatusItem from './StatusItem'
import Pydio from 'pydio'

class PartItem extends StatusItem {

    constructor(parent, index){
        super('part', null, parent);
        this._label = 'Part ' + index;
        this._retry = 0
    }

    setRetry(retry){
        this._retry = retry
    }

    getRetry() {
        return this._retry || 0
    }

    setProgress(newValue, bytes = null){
        this._progress = newValue;
        this.notify('progress', newValue);
        if(bytes !== null) {
            this.notify('bytes', bytes);
        }
    }


}

export {PartItem as default}