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
import Pydio from 'pydio';
import {Checkbox} from 'material-ui';
import StarsForm from "../fields/StarsForm";
import StarsField from "../fields/StarsField";
import CssLabelsField from "../fields/CssLabelsField";
import SelectorField from "../fields/SelectorField";
import TagsCloud from "../fields/TagsCloud";
import Renderer from "../Renderer";
import {DateTimeField, DateTimeForm} from "../fields/DateTime";
import BooleanForm from "../fields/BooleanForm";
import {IntegerField, IntegerForm} from "../fields/Integer";

const {ModernTextField} = Pydio.requireLib("hoc");

/**
 * Renders a single metadata field in edit mode
 */
const FieldEdit = ({fieldKey, meta, value, updateValue, configsForGroup, supportTemplates, additionalProps}) => {
    const {label, type, readonly} = meta;

    let baseProps = {
        fieldname: fieldKey,
        label,
        value,
        configs: configsForGroup,
        onValueChange: (name, value, submit) => updateValue(name, value, submit)
    };

    if (additionalProps && additionalProps[type]) {
        baseProps = {...baseProps, ...additionalProps[type]};
    }

    switch (type) {
        case 'stars_rate':
            return <StarsForm {...baseProps}/>;
        case 'choice':
            return Renderer.formPanelSelectorFilter(baseProps, configsForGroup);
        case 'css_label':
            return Renderer.formPanelCssLabels(baseProps, configsForGroup);
        case 'tags':
            return Renderer.formPanelTags(baseProps, configsForGroup);
        case 'date':
            return <DateTimeForm type={type} {...baseProps} supportTemplates={supportTemplates}/>;
        case 'integer':
            return <IntegerForm {...baseProps} supportTemplates={supportTemplates}/>;
        case 'boolean':
            return <BooleanForm {...baseProps}/>;
        default:
            const isInteger = (type === 'integer' && !supportTemplates);
            return (
                <ModernTextField
                    value={value || ""}
                    variant={"v2"}
                    fullWidth={true}
                    disabled={readonly}
                    floatingLabelText={label}
                    multiLine={type === 'textarea' || type === 'json'}
                    type={isInteger ? "number" : null}
                    onChange={(event, value) => {
                        if (isInteger) {
                            value = parseInt(value);
                        }
                        updateValue(fieldKey, value);
                    }}
                    onKeyPress={(event) => {
                        if (event.key === 'Enter' && type !== 'textarea' && type !== 'json') {
                            updateValue(fieldKey, value, true);
                        }
                    }}
                />
            );
    }
};

/**
 * Renders a single metadata field in display mode
 */
const FieldDisplay = ({fieldKey, meta, value, node}) => {
    const {label, type} = meta;
    const column = {name: fieldKey};
    let displayValue = value;

    switch (type) {
        case 'stars_rate':
            displayValue = <StarsField node={node} column={column}/>;
            break;
        case 'choice':
            displayValue = <SelectorField node={node} column={column}/>;
            break;
        case 'css_label':
            displayValue = <CssLabelsField node={node} column={column}/>;
            break;
        case 'tags':
            displayValue = <TagsCloud node={node} column={column}/>;
            break;
        case 'date':
            displayValue = <DateTimeField node={node} column={column} type={type}/>;
            break;
        case 'integer':
            displayValue = <IntegerField node={node} column={column}/>;
            break;
        case 'boolean':
            displayValue = value ? 'Yes' : 'No';
            break;
        default:
            break;
    }

    return (
        <div className={"infoPanelRow" + (value ? '' : ' no-value')}>
            <div className="infoPanelLabel">{label}</div>
            <div className="infoPanelValue">{displayValue}</div>
        </div>
    );
};

/**
 * Main component that handles a metadata field in edit or display mode
 */
export const MetadataField = ({
    fieldKey,
    meta,
    node,
    editMode,
    multiple,
    value,
    checked,
    updateValue,
    onCheck,
    configsForGroup,
    supportTemplates,
    additionalProps
}) => {
    const {label} = meta;

    if (editMode) {
        const field = (
            <FieldEdit
                fieldKey={fieldKey}
                meta={meta}
                value={value}
                updateValue={updateValue}
                configsForGroup={configsForGroup}
                supportTemplates={supportTemplates}
                additionalProps={additionalProps}
            />
        );

        if (multiple) {
            return (
                <div className={"infoPanelRow"} key={fieldKey} style={{marginBottom: 20}}>
                    <Checkbox checked={checked} label={label} onCheck={(e, v) => onCheck(fieldKey, v)}/>
                    {checked && <div className="infoPanelValue">{field}</div>}
                </div>
            );
        }

        return <div key={fieldKey}>{field}</div>;
    }

    return (
        <FieldDisplay
            fieldKey={fieldKey}
            meta={meta}
            value={value}
            node={node}
        />
    );
};