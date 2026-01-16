/*
 * Copyright 2026 Abstrium SAS <team (at) pyd.io>
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

import React from 'react'
import {TagsInput} from '@mantine/core'
import {MetaInputProps} from "./MetaInputProps";

export const TagsCloudInput: React.FC<MetaInputProps> = ({fieldname, label, readonly, value, meta, onValueChange, errorText, supportTemplates, additionalProps}) => {
    const props = {
        label,
        disabled: readonly,
        error: errorText,
    }
    const data= value ? value.split(',') : []
    const onChange = (values: string[]) => {
        onValueChange(fieldname, values.join(','), true)
    }

    return <TagsInput {...props} value={data} data={data} onChange={onChange} />
 }