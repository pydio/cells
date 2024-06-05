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

import PathUtils from 'pydio/util/path'
import openOtherEditorPicker from "../callback/openOtherEditorPicker";

export default function(pydio) {

    const openOtherEditorPickerCallback = openOtherEditorPicker(pydio)
    let {MessageHash} = pydio;

    return function () {

        let builderMenuItems = [];
        if (pydio.getUserSelection().isEmpty()) {
            return builderMenuItems;
        }
        const node = pydio.getUserSelection().getUniqueNode();
        const selectedMime = PathUtils.getAjxpMimeType(node);
        const nodeHasReadonly = node.getMetadata().get("node_readonly") === "true";

        const user = pydio.user;
        // Patch editors list before looking for available ones

        if(user) {
            const otherRegistered = user.getLayoutPreference("Editor.Associations", {})
            Object.keys(otherRegistered).forEach(function (key) {
                let editor;
                pydio.Registry.getActiveExtensionByType("editor").forEach(function (ed) {
                    if (ed.editorClass === otherRegistered[key]) {
                        editor = ed;
                    }
                });
                if (editor && editor.mimes.indexOf(key) === -1) {
                    editor.mimes.push(key);
                }
            }.bind(this));
        }

        const editors = pydio.Registry.findEditorsForMime(selectedMime, false);
        let index = 0, sepAdded = false;
        if (editors.length) {
            editors.forEach(function (el) {
                if (!el.openable || (el.write && nodeHasReadonly)) {
                    return;
                }
                if (el.mimes.indexOf('*') > -1) {
                    if (!sepAdded && index > 0) {
                        builderMenuItems.push({separator: true});
                    }
                    sepAdded = true;
                }
                builderMenuItems.push({
                    name: el.text,
                    alt: el.title,
                    isDefault: (index === 0),
                    icon_class: el.icon_class,
                    callback: function (e) {
                        this.apply([el]);
                    }.bind(this)
                });
                index++;
            }.bind(this));
        }
        if(builderMenuItems.length && !sepAdded) {
            builderMenuItems.push({separator: true})
        }
        builderMenuItems.push({
            name: MessageHash['openother.1'],
            alt: MessageHash['openother.2'],
            isDefault: (index === 0),
            icon_class: 'mdi mdi-view-list',
            callback: openOtherEditorPickerCallback
        });
        /*
        // Old "No Editor Available", not used anymore as there is always the Choose Other... option
        if (!index) {
            builderMenuItems.push({
                name: MessageHash[324],
                alt: MessageHash[324],
                callback: function (e) {
                }
            });
        }
         */
        return builderMenuItems;

    }
}