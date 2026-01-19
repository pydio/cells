/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import {getCssLabels} from "../fields/CssLabelsField";
import {TextInput} from "../fieldsv2/TextInput";
import {Selector} from "../fieldsv2/Select"
import {RatingInput} from "../fieldsv2/RatingInput";
import {SwitchInput} from "../fieldsv2/SwitchInput";
import {NumbersInput} from "../fieldsv2/NumbersInput";
import {DateTimeInput} from "../fieldsv2/DateTimeInput";
import {URLInput} from "../fieldsv2/URLInput";
import {TagsCloudInput} from "../fieldsv2/TagsCloudInput";
import {MetaInputProps} from "../fieldsv2/MetaInputProps";


/**
 * Renders a single metadata field in edit mode
 */
export const FieldEdit = ({fieldKey, meta, saving, value, updateValue, configsForGroup, supportTemplates, requestToggleClose, additionalProps}) => {
    let {label} = meta;
    const {type, readonly, required, errorText} = meta;

    let baseProps:MetaInputProps = {
        fieldname: fieldKey,
        label,
        required,
        readonly: readonly || saving,
        value,
        onValueChange: updateValue,
        errorText,
        requestToggleClose,
        meta,
        //configs: configsForGroup
    };

    if (additionalProps && additionalProps[type]) {
        baseProps = {...baseProps, ...additionalProps[type]};
    }

    switch (type) {
        case 'stars_rate':
            return <RatingInput {...baseProps}/>;
        case 'choice':
            return <Selector {...baseProps}/>;
        case 'css_label':
            const cssLabels = getCssLabels();
            const cssMeta = {
                ...meta,
                data:{
                    items: Object.keys(cssLabels).map((id) => {return {...cssLabels[id], key:id, value: cssLabels[id].label}})
                },
            }
            return <Selector {...baseProps} meta={cssMeta}/>;
        case 'tags':
            return <TagsCloudInput {...baseProps}/>;
        case 'date':
            return <DateTimeInput {...baseProps} supportTemplates={supportTemplates}/>;
        case 'integer':
            return <NumbersInput {...baseProps} supportTemplates={supportTemplates}/>;
        case 'boolean':
            return <SwitchInput {...baseProps}/>;
        case 'url':
            return <URLInput {...baseProps} supportTemplates={supportTemplates}/>;
        default:
            return <TextInput {...baseProps} supportTemplates={supportTemplates}/>;
    }
};

