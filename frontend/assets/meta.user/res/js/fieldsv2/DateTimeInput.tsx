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
import {DateTimePicker} from '@mantine/dates'
import {MetaInputProps} from "./MetaInputProps";
import '@mantine/dates/styles.css'
import {PopoverProps} from "@mantine/core";

export const DateTimeInput: React.FC<MetaInputProps> = ({fieldname, label, required, readonly, value, meta, onValueChange, requestToggleClose, errorText, supportTemplates, additionalProps}) => {
    const props = {
        label,
        disabled: readonly,
        error: errorText,
        required: required,
    }

    const popoverProps : PopoverProps = {withinPortal: false}
    if(requestToggleClose && !readonly) {
        popoverProps.opened = true
        popoverProps.onClose= requestToggleClose
    }

    return <DateTimePicker
        {...props}
        radius={"md"}
        value={value ? new Date(parseFloat(value)*1000) : null}
        onChange={(v) => {
            const d = new Date(v).getTime()/1000;
            onValueChange(fieldname, d, true)
        }}

        autoFocus={!!requestToggleClose}
        popoverProps={popoverProps}
    />
}