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
import { DateInput } from "../fieldsv2/DateInput";
import { TimeInput } from "../fieldsv2/TimeInput";
import { URLInput } from "../fieldsv2/URLInput";
import { TagsCloudInput } from "../fieldsv2/TagsCloudInput";
import { AutoCompleteInput } from "../fieldsv2/AutoCompleteInput";
import { InputProps, Items } from "../fieldsv2/CommonInputProps";
import MetaClient from "../MetaClient";
import { NamespaceMeta } from "./MetaSpec";
import { getNumberPrefix, getNumberSuffix } from "../formatters/numbers";

export interface FieldEditProps {
    context: any,
    name: string,
    meta: NamespaceMeta,
    value: any,
    updateValue: (f: string, v: any, submit?: boolean) => void,
    supportTemplates?: boolean,
    requestToggleClose?: (data?: any) => void,
}

/**
 * Renders a single metadata field in edit mode
 */
const FieldEditInternal: React.FC<FieldEditProps> = ({
    context,
    name,
    meta,
    // FIXME: Toggleable fields are disabled
    // updateValue,
    // requestToggleClose,
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

    const onCommitChange = useCallback((v) => {
        actions.setFormState(state.formState.set(name, v))

        // NOTE: Only save on change if there are no errors
        if (Object.keys(state.errors).length === 0) {
            actions.setShouldSave(true)
        }
    }, [state.formState, state.errors, actions])

    const onChange = useCallback((v) => {
        actions.setFormState(state.formState.set(name, v))
    }, [state.formState, actions])

    let baseProps: InputProps = {
        name,
        label,
        required,
        description: meta.description,
        disabled: readonly,
        value,
        onCommitChange,
        onChange,
        errorText,
        // FIXME: go over the code and remove this
        requestToggleClose: () => {},
    };

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
        case 'auto_complete':
            return <AutoCompleteInput
                {...baseProps}
                value={state.formState.get(name) || ""}
                onCommitChange={(v) => onCommitChange([v])}
                data={[]}
                dataLoader={localDataLoader}
            />;
        case 'tag_cloud':
            return <TagsCloudInput
                {...baseProps}
                value={state.formState.get(name) || ""}
                data={[]}
                dataLoader={localDataLoader}
            />;
        case 'tags':
            return <TagsCloudInput
                {...baseProps}
                value={state.formState.get(name) || ""}
                data={[]}
                dataLoader={localDataLoader}
            />;
        case 'date':
            if (formatType === 'time') {
                return <TimeInput
                    {...baseProps}
                />;
            }
            if (formatType === 'date') {
                return <DateInput
                    {...baseProps}
                />;
            }
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

export const FieldEdit = (props) => {
    // NOTE: fixes the issue with Field label/input split in
    // the Prompt To Upload dialog
    return (<div style={{
        width: '100%',
        overflowY: 'scroll',
        overflowX: 'hidden',
    }}>
        <FieldEditInternal {...props} />
    </div>)
}

