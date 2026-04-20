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
import { Input, Switch } from '@mantine/core';
import { InputProps } from './CommonInputProps';

export const SwitchInput: React.FC<InputProps> = ({
    label,
    description,
    value,
    errorText,
    disabled,
    required,
    onCommitChange,
    onFocus,
    onBlur,
}: InputProps) => {
    return (
        <Input.Wrapper
            label={label}
            description={description}
            required={required}
            error={errorText}
        >
            <Input
                component={'div'}
                onFocus={onFocus}
                onBlur={(e) => {
                    if (onBlur) {
                        onBlur(e);
                    }
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        height: '100%',
                    }}
                >
                    <Switch
                        checked={value}
                        onChange={(e) =>
                            onCommitChange(e.currentTarget.checked)
                        }
                        disabled={disabled}
                    />
                </div>
            </Input>
        </Input.Wrapper>
    );
};
