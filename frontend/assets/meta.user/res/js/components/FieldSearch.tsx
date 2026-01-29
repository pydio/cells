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

import React, {useCallback} from 'react';
import {getCssLabels} from "../fields/CssLabelsField";
import {TextInput} from "../fieldsv2/TextInput";
import {Selector} from "../fieldsv2/Select"
import {RatingInput} from "../fieldsv2/RatingInput";
import {SwitchInput} from "../fieldsv2/SwitchInput";
import {TagsCloudInput} from "../fieldsv2/TagsCloudInput";
import {InputProps, Items} from "../fieldsv2/CommonInputProps";
import MetaClient from "../MetaClient";
import {NamespaceMeta} from "./MetaSpec";
import {NumbersInputSearch} from "../fieldsv2/NumbersInputSearch";
import {DateTimeInputSearch} from "../fieldsv2/DateTimeInputSearch";
import {TextInputSearch} from "../fieldsv2/TextInputSearch";
import { useMetadataContext } from '../context/metadata';

export interface FieldSearchProps {
    name:string,
    meta:NamespaceMeta,
    value:any,
    updateValue:(f:string, v:any) => void,
}

/**
 * Renders a single metadata field in edit mode
 */
export const FieldSearch: React.FC<FieldSearchProps> = ({name, meta, value, updateValue}) => {
    const { state, actions } = useMetadataContext();

    const localChange = useCallback((value:any, submit?: boolean) => {
        updateValue(name, value);
        actions.setFormState(new Map(state.formState).set(name, value))
    }, [name])

    const localDataLoader = useCallback((filter?:string) => {
        return MetaClient.getInstance().listTags(name).then(tags => {
            return tags.filter(t => t)
        });
    }, [name])

    const {type, readonly, required, errorText, label} = meta;

    let baseProps:InputProps = {
        name,
        placeholder: label, // use label as placeholder
        required,
        disabled: readonly,
        value,
        onChange: localChange,
        errorText,
    };

    switch (type) {
        case 'stars_rate':
            return <RatingInput {...baseProps}/>;
        case 'choice':
            // Do not use stepper
            const {data:{items=[]}} = meta;
            return <Selector {...baseProps} items={items}/>;
        case 'css_label':
            const cssLabels = getCssLabels();
            const cssItems:Items[] = Object.keys(cssLabels).map((id) => {return {...cssLabels[id], key:id, value: cssLabels[id].label}})
            return <Selector {...baseProps} items={cssItems}/>;
        case 'tags':
            const valueData = state.formState.get(name) ? state.formState.get(name).split(',') : []
            const disabled = state.saving || state.shouldSave;
            const onCommitChange = (values) => {
                const nextFormState = new Map(state.formState)
                nextFormState.set(name, values)
                actions.setFormState(nextFormState)
                actions.setShouldSave(true)
                actions.setEditingTag('none')
                localChange(values)
            }

            return <TagsCloudInput
                {...baseProps}
                value={valueData}
                disabled={disabled}
                onCommitChange={onCommitChange}
                data={[]}
                dataLoader={localDataLoader}
            />;
        case 'date':
            return <DateTimeInputSearch {...baseProps}/>;
        case 'integer':
            return <NumbersInputSearch {...baseProps}/>;
        case 'boolean':
            return <SwitchInput {...baseProps}/>;
        case 'url':
            return <TextInput {...baseProps}/>;
        default:
            return <TextInputSearch {...baseProps} subType={type}/>;
    }
};

