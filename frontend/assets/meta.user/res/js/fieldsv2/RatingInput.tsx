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
import {Input, Rating} from '@mantine/core'
import {MetaInputProps} from "./MetaInputProps";

export const RatingInput:React.FC<MetaInputProps> = (props: MetaInputProps) => {

    const {label, value, fieldname, errorText, readonly, onValueChange} = props;

    return (
        <Input.Wrapper
            label={label}
            error={errorText}
        >
            <div style={{display: 'flex', alignItems: 'center'}}>
                {!readonly &&
                    <span
                        className={'mdi mdi-star-off-outline'}
                        style={{fontSize: 19, marginRight: 5, cursor: 'pointer'}}
                        onClick={() => {onValueChange(fieldname, '', true)}}
                    />
                }
                <Rating
                    value={parseInt(value)||0}
                    onChange={(n) => onValueChange(fieldname, n, true)}
                    readOnly={readonly}
                />
            </div>
        </Input.Wrapper>
    )
}