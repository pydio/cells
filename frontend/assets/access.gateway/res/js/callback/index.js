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

let pydio = global.pydio;
import ls from './ls'
import mkdir from './mkdir'
import deletef from './deleteAction'
import {renameFunction as rename, callback as renameCallback} from './rename'
import applycopy from './applyCopyOrMove'
import copy from './copy'
import move from './move'
import upload from './upload'
import download from './download'
import downloadPDF from './downloadPDF'
import downloadAll from './downloadAll'
import emptyRecycle from './emptyRecycle'
import restore from './restore'
import openInEditor from './openInEditor'
import ajxpLink from './ajxpLink'
import openOtherEditorPicker from './openOtherEditorPicker'
import lock from './lock'
import goTo from './goto'

const Callbacks = {
    ls                      : ls(pydio),
    mkdir                   : mkdir(pydio),
    deleteAction            : deletef(pydio),
    rename,
    renameCallback,
    applyCopyOrMove         : applycopy(pydio),
    copy                    : copy(pydio),
    move                    : move(pydio),
    upload                  : upload(pydio),
    download                : download(pydio),
    downloadPDF             : downloadPDF(pydio),
    downloadAll             : downloadAll(pydio),

    emptyRecycle            : emptyRecycle(pydio),
    restore                 : restore(pydio),
    openInEditor            : openInEditor(pydio),
    ajxpLink                : ajxpLink(pydio),
    openOtherEditorPicker   : openOtherEditorPicker(pydio),
    lock                    : lock(pydio),
    goTo                    : goTo(pydio)
};

export {Callbacks as default}