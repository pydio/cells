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

import Manager from './manager/Manager'
import InputText from './fields/TextField'
import ValidPassword from './fields/ValidPassword'
import InputInteger from './fields/InputInteger'
import InputIntegerBytes from './fields/InputIntegerBytes'
import InputBoolean from './fields/InputBoolean'
import InputSelectBox from './fields/InputSelectBox'
import AutocompleteBox from './fields/AutocompleteBox'
import InputImage from './fields/InputImage'
import FormPanel from './panel/FormPanel'
import PydioHelper from './panel/FormHelper'
import FileDropZone from './fields/FileDropzone'
import AutocompleteTree from './fields/AutocompleteTree'

let PydioForm = {

    Manager,
    InputText,
    ValidPassword,
    InputBoolean,
    InputInteger,
    InputIntegerBytes,
    InputSelectBox,
    AutocompleteBox,
    AutocompleteTree,
    InputImage,
    FormPanel,
    PydioHelper,
    FileDropZone,
    createFormElement: Manager.createFormElement,
};

export {PydioForm as default}