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
import {muiThemeable} from 'material-ui/styles';
import {MetadataField} from './MetadataField';
import {TogglableField} from './TogglableField';
const {EmptyStateView} = Pydio.requireLib('components');
const { metadata } = Pydio.requireLib('hoc');
const useMetadataContext = metadata.useMetadataContext;

const StyledDiv = muiThemeable()(({style, children, muiTheme, ...other}) => {
    let cs = {...style};
    if (style.borderTop) {
        cs = {...style, borderTop: style.borderTop + 'px solid ' + muiTheme.palette.mui3['outline-variant-50']};
    }
    return <div style={cs} {...other}>{children}</div>;
});

/**
 * Recursively renders a group of metadata fields with collapsible nested groups
 */
export const MetadataGroup = ({
    current,
    tree,
    offset = -1,
    node,
    editMode,
    multiple,
    updateMeta,
    fields,
    updateValue,
    onCheck,
    supportTemplates,
    additionalProps,
    groupsExpanded,
    onToggleGroup,
    pydio,
    onRequestEditMode,
    useTogglableFields,
    autoSave,
    saving,
}) => {
    const context = useMetadataContext();
    const metadata = node.getMetadata();
    const elements = [];
    let nonEmptyDataCount = 0;

    const groupKeys = Object.keys(tree).filter(k => k !== '__NS__');
    groupKeys.sort();
    const configsForGroup = tree.__NS__ || new Map();

    // Render fields
    configsForGroup.forEach((meta, key) => {
        const {type} = meta;
        if (type === 'json' && !supportTemplates) {
            return;
        }

        let value = metadata.get(key);
        if (updateMeta.has(key)) {
            value = updateMeta.get(key);
        }

        if (!editMode && value) {
            nonEmptyDataCount++;
        }
        let Component = MetadataField
        if(useTogglableFields) {
            Component = TogglableField
        }

        elements.push(
            <Component
                context={context}
                key={key}
                fieldKey={key}
                meta={meta}
                node={node}
                editMode={editMode}
                multiple={multiple}
                value={value}
                checked={fields[key] || false}
                updateValue={updateValue}
                onCheck={onCheck}
                configsForGroup={configsForGroup}
                supportTemplates={supportTemplates}
                additionalProps={additionalProps}
                autoSave={autoSave}
                saving={saving}
            />
        );
    });

    // Styles for headers and fields
    const styles = {
        header: {
            fontSize: 18,
            fontWeight: 400,
            paddingTop: 10,
            paddingBottom: 24,
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            borderTop: 1
        },
        fields: {
            columnWidth: 250,
            columnCount: 2,
            columnGap: 12
        }
    };

    if (offset > 0) {
        styles.fields = {
            marginLeft: (offset) * 16 + 8,
            marginBottom: 10,
            marginTop: -8
        };
    }

    if (offset > -1) {
        styles.header = {
            ...styles.header,
            marginLeft: (offset + 1) * 16,
            borderTop: 0,
            paddingTop: 0,
            paddingBottom: 12
        };
    }

    // Render nested groups
    const nestedGroups = groupKeys.map((gName, index) => {
        const gPath = current + '/' + gName;
        const open = groupsExpanded[gPath];
        let sHead = styles.header;
        if (index === 0) {
            sHead = {...styles.header, borderTop: 0};
        }

        return (
            <React.Fragment key={gName}>
                {gName &&
                    <StyledDiv style={sHead} className={'nsgroup-header'} onClick={() => onToggleGroup(gPath)}>
                        <span
                            className={"mdi mdi-chevron-" + (open ? "down" : "right")}
                            style={{fontSize: 18, color: 'var(--md-sys-color-outline-variant)', marginLeft: -8, marginRight: 4}}
                        />
                        <span> {gName}</span>
                    </StyledDiv>
                }
                {groupsExpanded[gPath] && (
                    <MetadataGroup
                        current={gPath}
                        tree={tree[gName]}
                        offset={offset + 1}
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
                        onToggleGroup={onToggleGroup}
                        pydio={pydio}
                        onRequestEditMode={onRequestEditMode}
                        autoSave={autoSave}
                        saving={saving}
                        useTogglableFields={useTogglableFields}
                    />
                )}
            </React.Fragment>
        );
    });

    elements.push(...nestedGroups);

    // Show empty state if no data in display mode
    const mess = pydio.MessageHash;
    if (!editMode && !nonEmptyDataCount) {
        let divProps = {};
        if (onRequestEditMode) {
            divProps = {onClick: onRequestEditMode, style: {cursor: 'pointer'}};
        }
        return (
            <div {...divProps}>
                <EmptyStateView
                    pydio={pydio}
                    iconClassName={"mdi mdi-tag-outline"}
                    primaryTextId={mess['meta.user.' + (onRequestEditMode ? '11' : '16')]}
                    style={{padding: '10px 40px 20px', backgroundColor: 'transparent'}}
                    iconStyle={{fontSize: 40}}
                    legendStyle={{fontSize: 13}}
                />
            </div>
        );
    }

    return <div style={{...styles.fields}}>{elements}</div>;
};
