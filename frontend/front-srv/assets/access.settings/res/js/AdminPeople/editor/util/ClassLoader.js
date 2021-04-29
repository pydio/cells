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
import FuncUtils from 'pydio/util/func'
import ResourcesManager from 'pydio/http/resources-manager'

function loadEditorClass(className = '', defaultComponent) {
    if (!className) {
        return Promise.resolve(defaultComponent);
    }
    const parts = className.split(".");
    const ns = parts.shift();
    const rest = parts.join('.');
    return ResourcesManager.loadClass(ns).then(c => {
        const comp = FuncUtils.getFunctionByName(rest, c);
        if (!comp) {
            if(typeof c === 'object' && c[ns]) {
                const c2 = FuncUtils.getFunctionByName(rest, c[ns])
                if (c2) {
                    return c2
                }
            }
            if(defaultComponent) {
                console.error('Cannot find editor component, using default instead', className, defaultComponent);
                return defaultComponent;
            } else {
                throw new Error("cannot find editor component")
            }
        }
        return comp;
    }).catch(e => {
        if(defaultComponent) {
            console.error('Cannot find editor component, using default instead', className, defaultComponent);
            return defaultComponent;
        } else {
            throw e
        }
    })
}

export {loadEditorClass}