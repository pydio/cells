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

import React from 'react';
import { InputProps } from './CommonInputProps';
import { TimePicker } from '@mantine/dates';

const timestampToDate = (timestamp: number) => {
    if (!timestamp) return '';

    const date = new Date(timestamp * 1000);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${hours}:${minutes}`;
};

const dateToTimestamp = (time: string) => {
    if (!time) return '';

    const [hours, minutes] = time.split(':');
    const timestamp = new Date();
    timestamp.setHours(parseInt(hours));
    timestamp.setMinutes(parseInt(minutes));

    return timestamp.getTime() / 1000;
};

export const TimeInput: React.FC<InputProps> = ({
    label,
    description,
    required,
    disabled,
    value,
    onChange,
    onFocus,
    onBlur,
    errorText,
}) => {
    return (
        <TimePicker
            label={label}
            disabled={disabled}
            error={errorText}
            required={required}
            radius={'md'}
            value={timestampToDate(value)}
            onChange={(v) => {
                onChange(dateToTimestamp(v));
            }}
            onFocus={onFocus}
            onBlur={onBlur}
            description={description}
            popoverProps={{ withinPortal: false }}
        />
    );
};
