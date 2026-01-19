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
import React, {useImperativeHandle, forwardRef, useEffect} from 'react'
import { useMetadataState } from './hooks/useMetadataState';
import { MetadataGroup } from './components/MetadataGroup';
import { useGroupsExpanded } from './utils/groupsState';
import { pathsToTree, groupConfigsByNamespace } from './utils/treeUtils';
import '@mantine/core/styles.css';
import './components/TogglableField.css';
import {MantineProvider, createTheme, Input, TextInput, NumberInput, JsonInput, Textarea, Select, TagsInput} from '@mantine/core'
import {DateTimePicker} from '@mantine/dates'
import {muiThemeable} from 'material-ui/styles'

const ThemedGroup = muiThemeable() (({children, muiTheme}) => {
    const extension = {
        defaultProps: {
            size: 'sm',
            radius: 'md',
        },
    }
    const theme = createTheme({
        components: {
            Input: Input.extend(extension),
            TextInput: TextInput.extend(extension),
            NumberInput: NumberInput.extend(extension),
            Textarea: Textarea.extend(extension),
            JsonInput: JsonInput.extend(extension),
            Select: Select.extend(extension),
            TagsInput: TagsInput.extend(extension),
            DateTimePicker: DateTimePicker.extend(extension),
            InputWrapper: Input.Wrapper.extend({
                styles: {
                    root: {marginBottom: 8},
                },
            }),
        },
    });
    return (
    <MantineProvider forceColorScheme={muiTheme.darkMode?'dark':'light'} theme={theme}>
        {children}
    </MantineProvider>
    )
});

/**
 * Main component for displaying and editing metadata fields
 * Refactored version with better separation of concerns
 */
const UserMetaPanelV2 = forwardRef((props, ref) => {
    const {
        // Define if validation is "local" on input change
        // or "global" on form submit
        errorsScope = 'local',
        editMode = false,
        node,
        loader,
        loadChecks,
        supportTemplates,
        multiple,
        pydio,
        style,
        onChangeUpdateData,
        autoSave,
        saving,
        onRequestEditMode,
        onFormLoaded,
        onValidStatusChanged,
        additionalProps,
        useTogglableFields
    } = props;

    // State management
    const {
        updateMeta,
        fields,
        configs,
        updateValue,
        getUpdateData,
        resetUpdateData,
        onCheck,
        valid,
    } = useMetadataState({
        node,
        loader,
        loadChecks,
        onChangeUpdateData,
        autoSave,
        errorsScope
    });

    // Groups expand/collapse state
    const [groupsExpanded, toggleGroup] = useGroupsExpanded();

    useEffect(() => {
        if(onFormLoaded){
            onFormLoaded(configs)
        }
    }, [fields]);
    
    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        getUpdateData,
        resetUpdateData
    }), [getUpdateData, resetUpdateData]);


    useEffect(() => {
        if (onValidStatusChanged) {
            onValidStatusChanged(valid)
        }
    }, [valid]);

    // Build tree structure from configs
    const groupedNS = groupConfigsByNamespace(configs, supportTemplates);
    const tree = pathsToTree(groupedNS);

    // Legend for multiple selection mode
    let legend;
    if (multiple) {
        const mess = pydio.MessageHash;
        legend = <div style={{paddingBottom: 16}}><em>{mess['meta.user.12']}</em> {mess['meta.user.13']}</div>;
    }

    return (
        <ThemedGroup>
            <div style={{width: '100%', overflowY: 'scroll', overflowX: 'hidden', ...style}}>
                {legend}
                <MetadataGroup
                    current=""
                    tree={tree}
                    offset={-1}
                    node={node}
                    editMode={editMode}
                    multiple={multiple}
                    updateMeta={updateMeta}
                    fields={fields}
                    updateValue={updateValue}
                    onCheck={onCheck}
                    supportTemplates={supportTemplates}
                    additionalProps={additionalProps}
                    groupsExpanded={groupsExpanded}
                    onToggleGroup={toggleGroup}
                    pydio={pydio}
                    onRequestEditMode={onRequestEditMode}
                    useTogglableFields={useTogglableFields}
                    autoSave={autoSave}
                    saving={saving}
                />
            </div>
        </ThemedGroup>
    );
});

export default UserMetaPanelV2;
