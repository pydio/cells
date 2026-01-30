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
import {InputProps} from './CommonInputProps'
import {TimePicker} from '@mantine/dates'
import {PopoverProps} from '@mantine/core'
import {DateRangeModifiers} from './SearchModifiers'
import {RangeSearchModifierInput} from './SearchModifierInput'

const timestampToTime = (raw: string) => {
    if (!raw) return ''
    const ts = parseFloat(raw)
    if (Number.isNaN(ts)) return ''
    const date = new Date(ts * 1000)
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
}

const timeToTimestamp = (time: string) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    if (!hours || !minutes) return ''
    const date = new Date()
    date.setHours(parseInt(hours, 10))
    date.setMinutes(parseInt(minutes, 10))
    date.setSeconds(0, 0)
    return Math.floor(date.getTime() / 1000).toString()
}

export const TimeInputSearch: React.FC<InputProps> = ({
    label,
    description,
    required,
    disabled,
    value,
    requestToggleClose,
    onChange,
    errorText
}) => {
    const props = {
        label,
        disabled,
        error: errorText,
        required: required,
    }

    const popoverProps: PopoverProps = {withinPortal: false}
    if (requestToggleClose && !disabled) {
        popoverProps.onClose = () => {
            requestToggleClose()
        }
    }

    return (
        <RangeSearchModifierInput
            value={value}
            onChange={onChange}
            items={DateRangeModifiers}
            requestToggleClose={requestToggleClose}
        >
            {({text, leftSection, onTextChange, onSubmit, autoFocus}) => (
                <TimePicker
                    {...props}
                    radius="md"
                    value={timestampToTime(text)}
                    leftSection={leftSection}
                    onChange={(next) => onTextChange(timeToTimestamp(next || ''))}
                    onKeyPress={(event) => {
                        if (event.key === 'Enter') {
                            onSubmit()
                        }
                    }}
                    description={description}
                    autoFocus={autoFocus}
                    popoverProps={popoverProps}
                />
            )}
        </RangeSearchModifierInput>
    )
}
