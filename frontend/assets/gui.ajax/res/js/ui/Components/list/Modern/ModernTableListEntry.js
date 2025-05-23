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
        tableKeys,
        renderActions,
        actions: originalActions, // Rename to avoid conflict in spread props
        setInlineEditionAnchor,
        style,
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

    const generatedCells = Object.keys(tableKeys).map((key, index) => {
        const columnDef = tableKeys[key];
        let cellContent;
        let rawValue = '';

        if (node && node.getMetadata) {
            rawValue = node.getMetadata().get(key);
            if (columnDef.renderCell) {
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
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            paddingRight: '16px', // Spacing between cells
            display: 'table-cell',
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

    const determinedActions = renderActions ? renderActions(node) : originalActions;

    const entryStyle = {
        //display: 'flex',
        //alignItems: 'center',
        width: '100%', // Ensure it takes full width for table layout
        ...style,
    };

    // Override ModernListEntry's internal content flex direction
    // and provide a container for the cells that will allow them to layout inline
    const firstLineContainerStyle = {
        display: 'flex',
        flexDirection: 'row',
        flexGrow: 1,
        overflow: 'hidden', // Prevent cells from breaking the layout
    };

    return (
        <ModernListEntry
            {...restProps}
            element={'tr'}
            node={node}
            //style={entryStyle}
            iconCell={null} // Table rows usually don't have a single "main" icon
            actions={determinedActions}
            setInlineEditionAnchor={undefined} // Pass undefined as this component handles it
        >{generatedCells}</ModernListEntry>
    );
};

ModernTableListEntry.propTypes = {
    node: PropTypes.object, // Should be a Pydio Node object
    tableKeys: PropTypes.object.isRequired, // Defines columns, labels, widths, and custom renderers
    renderActions: PropTypes.func,
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
