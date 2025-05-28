/*
 * Copyright 2025 Abstrium SAS <team (at) pyd.io>
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

import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
const {moment} = Pydio.requireLib('boot');
import { ModernListEntry } from './ModernListEntry';

// Simplified roundFileSize utility
const simpleRoundFileSize = (bytes) => {
    if (bytes === undefined || bytes === null || isNaN(Number(bytes))) return '';
    const numericBytes = Number(bytes);
    if (numericBytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(numericBytes) / Math.log(k));
    if (i < 0) return '0 B'; // Handle cases where bytes is less than 1, log would be negative
    return parseFloat((numericBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const ModernTableListEntry = (props) => {
    const {
        node,
        pydio,
        tableKeys,
        entryRenderActions,
        setInlineEditionAnchor,
        style,
        isParent,
        tableEntryRenderCell,
        ...restProps
    } = props;

    const renameRef = useRef(null);

    useEffect(() => {
        if (setInlineEditionAnchor && renameRef.current) {
            // The offset might need adjustment based on actual layout,
            // e.g., selector checkbox width, padding etc.
            // For now, using the specified 44, but this might be better calculated
            // based on whether showSelector is true, etc.
            let marginLeft = 0;
            if (props.showSelector) {
                marginLeft = 44; // Approx width of checkbox + padding
            } else {
                marginLeft = 16; // Default padding if no checkbox
            }
            setInlineEditionAnchor(renameRef.current, { marginLeft });
        }
    }, [node, tableKeys, setInlineEditionAnchor, props.showSelector]);


    const keys = Object.keys(tableKeys)
    let tableCells = []
    if(isParent) {
        let parentLabel = pydio.MessageHash['react.1']
        parentLabel = parentLabel.charAt(0).toUpperCase() + parentLabel.slice(1);
        tableCells.push(
            <td className={"cell cell-ajxp_label"} style={{cursor:'pointer'}} colSpan={keys.length + (entryRenderActions?1:0)}>
                    <span>
                        <div className={"mimefont-container"}><div className={"mimefont mdi mdi-chevron-left"}/></div>
                        <span>{parentLabel}</span>
                    </span>
            </td>
        )
    } else {

        tableCells = keys.map((key, index) => {

            const columnDef = tableKeys[key];
            let cellContent;
            let rawValue = '';

            if (node && node.getMetadata) {
                rawValue = node.getMetadata().get(key);
                if (key === 'ajxp_label' && tableEntryRenderCell) {
                    cellContent = tableEntryRenderCell(node)
                } else if (columnDef.renderCell) {
                    cellContent = columnDef.renderCell(node, {...columnDef, name:key});
                } else if (key === 'ajxp_modiftime') {
                    const timestamp = parseInt(rawValue, 10);
                    cellContent = timestamp ? moment(timestamp * 1000).calendar() : 'N/A';
                } else if (key === 'bytesize') {
                    cellContent = simpleRoundFileSize(rawValue);
                } else {
                    cellContent = rawValue || '';
                }
            } else {
                cellContent = 'N/A'; // Or some placeholder if node is not available
            }

            const cellStyle = {
                width: columnDef.width || 'auto',
            };

            // First cell gets the renameRef
            const cellRef = index === 0 ? renameRef : null;

            return (
                <td
                    ref={cellRef}
                    key={key}
                    className={`cell cell-${key}`}
                    title={typeof rawValue === 'string' || typeof rawValue === 'number' ? String(rawValue) : columnDef.label}
                    data-label={columnDef.label}
                    style={cellStyle}
                >
                    {cellContent}
                </td>
            );
        });

        if(entryRenderActions) {
            tableCells.push((
                <td key={"actions"} className={"cell material-list-actions"}>{entryRenderActions(node)}</td>
            ))
        }


    }


    return (
        <ModernListEntry
            {...restProps}
            element={'tr'}
            node={node}
            className={'modern-list-entry'}
        >{tableCells}</ModernListEntry>
    );
};

ModernTableListEntry.propTypes = {
    node: PropTypes.object, // Should be a Pydio Node object
    tableKeys: PropTypes.object.isRequired, // Defines columns, labels, widths, and custom renderers
    entryRenderActions: PropTypes.func,
    actions: PropTypes.element, // Passed to ModernListEntry if renderActions is not used
    setInlineEditionAnchor: PropTypes.func,
    style: PropTypes.object,
    showSelector: PropTypes.bool, // Propagated to ModernListEntry, used for renameRef offset

    // Props for ModernListEntry (ensure all necessary ones are listed or covered by ...restProps)
    selected: PropTypes.bool,
    selectorDisabled: PropTypes.bool,
    onSelect: PropTypes.func,
    onClick: PropTypes.func,
    onDoubleClick: PropTypes.func,
    onKeyDown: PropTypes.func,
    // iconCell: PropTypes.element, // Explicitly null
    // mainIcon: PropTypes.string, // Not used
    // secondLine: PropTypes.node, // Not used in typical table view
    // thirdLine: PropTypes.node, // Not used in typical table view
    className: PropTypes.string,
    noHover: PropTypes.bool,
    selectedAsBorder: PropTypes.bool,
};

ModernTableListEntry.defaultProps = {
    style: {},
    showSelector: false,
};

export { ModernTableListEntry };
