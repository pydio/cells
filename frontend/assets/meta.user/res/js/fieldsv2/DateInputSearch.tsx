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
import { DatePickerInput } from '@mantine/dates';
import { PopoverProps } from '@mantine/core';
import { DateRangeModifiers } from './SearchModifiers';
import { DateTimeSearchModifierInput } from './SearchModifierInput';
import { textToDate, dateToTimestamp } from './dateTimeConversion';

export const DateInputSearch: React.FC<InputProps> = ({
    label,
    description,
    placeholder,
    required,
    disabled,
    value,
    onChange,
    errorText,
}) => {
    const popoverProps: PopoverProps = { withinPortal: false };

    return (
        <DateTimeSearchModifierInput
            value={value}
            onChange={onChange}
            items={DateRangeModifiers}
        >
            {({ text, leftSection, onTextChange }) => (
                <DatePickerInput
                    label={label}
                    disabled={disabled}
                    error={errorText}
                    required={required}
                    radius={'md'}
                    value={textToDate(text)}
                    leftSection={leftSection}
                    onChange={(date) => {
                        const timestamp = dateToTimestamp(date);
                        onTextChange(timestamp);
                    }}
                    description={description}
                    placeholder={placeholder}
                    popoverProps={popoverProps}
                />
            )}
        </DateTimeSearchModifierInput>
    );
};
