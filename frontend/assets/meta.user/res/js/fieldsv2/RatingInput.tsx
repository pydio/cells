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
import { Input, Rating } from '@mantine/core'
import { InputProps } from "./CommonInputProps";

export const RatingInput: React.FC<InputProps> = ({
    label,
    description,
    value,
    errorText,
    disabled,
    required,
    onChange,
    requestToggleClose
}: InputProps) => {

    return (
        <Input.Wrapper
            className="rating-input-grid"
            data-testid="rating-input"
            label={label}
            error={errorText}
            description={description}
            required={required}
        >
            <Input
                component={"div"}
                disabled={disabled}
            >
                <div style={{ display: 'flex', alignItems: 'center' }} onBlur={requestToggleClose}>
                    <span
                        className={'mdi mdi-star-off-outline'}
                        style={{ fontSize: 19, marginRight: 5, cursor: 'pointer' }}
                        onClick={() => { !disabled ? onChange('', true) : null }}
                    />
                    <Rating
                        className={""}
                        value={parseInt(value) || 0}
                        onChange={(n) => onChange(n, true)}
                        readOnly={false}
                    />
                </div>
            </Input>
        </Input.Wrapper>
    )
}
