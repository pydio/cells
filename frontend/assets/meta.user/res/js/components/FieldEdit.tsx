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

import React, { useCallback } from 'react';
import { getCssLabels } from "../fields/CssLabelsField";
import { TextInput } from "../fieldsv2/TextInput";
import { Selector } from "../fieldsv2/Select"
import { RatingInput } from "../fieldsv2/RatingInput";
import { SwitchInput } from "../fieldsv2/SwitchInput";
import { NumbersInput } from "../fieldsv2/NumbersInput";
import { DateTimeInput } from "../fieldsv2/DateTimeInput";
import { URLInput } from "../fieldsv2/URLInput";
import { TagsCloudInput } from "../fieldsv2/TagsCloudInput";
import { InputProps, Items } from "../fieldsv2/CommonInputProps";
import MetaClient from "../MetaClient";
import { NamespaceMeta } from "./MetaSpec";
import { getNumberPrefix, getNumberSuffix } from "../formatters/numbers";

export interface FieldEditProps {
    context: any,
    name: string,
    meta: NamespaceMeta,
    saving: boolean,
    value: any,
    updateValue: (f: string, v: any, submit?: boolean) => void,
    supportTemplates?: boolean,
    requestToggleClose?: (data?: any) => void,
}

/**
 * Renders a single metadata field in edit mode
 */
export const FieldEdit: React.FC<FieldEditProps> = ({
    context,
    name,
    meta,
    saving,
    requestToggleClose,
}) => {
    const { state, actions } = context;
    const { type, readonly, required, label, data } = meta;

    const localDataLoader = useCallback((filter?: string) => {
        return MetaClient.getInstance().listTags(name).then(tags => {
            return tags.filter(t => t)
        });
    }, [name, ])

    const formatType = data?.format as NumberFormat;

    const value = state.formState.get(name)
    const errorText = state.errors?.[name];

    let baseProps: InputProps = {
        name,
        label,
        required,
        disabled: readonly || saving,
        value,
        onChange: (v) => {
            console.log('(FieldEdit:78) - @@@@@@ state.formState: ', state.formState);
            actions.setFormState(state.formState.set(name, v))
        },
        errorText,
        requestToggleClose: () => {
            actions.setShouldSave(true)
            actions.setEditingTag('none')
        },
    };

    const onCommitChange = (v) => {
        if (state.errors[name]) return

        console.log('(FieldEdit:88) - @@@@@@ state.formState: ', state.formState);
        actions.setFormState(state.formState.set(name, v))
        actions.setShouldSave(true)
        actions.setEditingTag('none')
    }

    switch (type) {
        case 'stars_rate':
            return <RatingInput {...baseProps} />;
        case 'choice':
            const { data: { items = [], steps = false } } = meta;
            return <Selector {...baseProps} items={items} stepper={steps} />;
        case 'css_label':
            const cssLabels = getCssLabels();
            const cssItems: Items[] = Object.keys(cssLabels).map((id) => { return { ...cssLabels[id], key: id, value: cssLabels[id].label } })
            return <Selector {...baseProps} items={cssItems} />;
        case 'tags':
            return <TagsCloudInput
                {...baseProps}
                value={state.formState.get(name)}
                disabled={state.saving || state.shouldSave}
                onCommitChange={onCommitChange}
                data={[]}
                dataLoader={localDataLoader}
            />;
        case 'date':
            return <DateTimeInput
                {...baseProps}
            />;
        case 'integer':
            return <NumbersInput
                {...baseProps}
                prefix={getNumberPrefix(formatType)}
                suffix={getNumberSuffix(formatType)}
            />;
        case 'boolean':
            return <SwitchInput {...baseProps} />;
        case 'url':
            return <URLInput {...baseProps} />;
        default:
            return <TextInput {...baseProps} subType={type} />;
    }
};

