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

import React, {useRef} from "react";
import {useSortingColumns} from "./useSorting";
import {ModernTableListEntry} from "./ModernTableListEntry";
import {useFocusOnClick} from "./useFocusOnClick";

const ModernLayoutTable = ({pydio, items, tableKeys, currentSortingInfo, handleSortChange, handleKeyDown, handleItemClick, handleItemDoubleClick, entryRenderIcon, tableEntryRenderCell, entryRenderActions, selection}) => {

    const ref = useRef()
    useFocusOnClick(ref)
    const {listColumns} = useSortingColumns({columns:tableKeys, sortingInfo:currentSortingInfo, onSortingInfoChanged:handleSortChange})
    const hasActions = !!entryRenderActions

    return (
        <table>
            <colgroup>
                {listColumns(({width}) => {
                    return <col style={{width}} width={width}/>
                })}
                {hasActions && <col/>}
            </colgroup>
            <thead><tr>
                {listColumns((data, className, onClick) => {
                    const {key, name, label, width} = data;
                    const fullClass = `cell header_cell cell-${key||name} ${className||''}`
                    return <th className={fullClass} style={{width}} width={width} onClick={onClick}>{label}</th>
                })}
                {hasActions && <th/>}
            </tr></thead>

            <tbody className="list-area" style={{width: '100%'}} tabIndex={0} onKeyDown={handleKeyDown}  ref={ref}>
            {items.map((itemData, index) => { // itemData can be node wrapper, parent, or group header
                const itemUniqueId = itemData.id || `item-${index}`; // Ensure unique key
                const isSelected = itemData.node ? selection.get(itemData.node) || false : false; // Only node items can be selected

                // Handle rendering for different item types
                if (itemData.isGroupHeader) {
                    return (
                        <tr key={itemUniqueId}  style={{columnSpan:'all'}}>
                            <td className={"modern-group-header"}>{itemData.title}</td>
                        </tr>
                    );
                }

                // Standard node item rendering
                const targetNode = itemData.node;

                const entryProps = {
                    key: itemUniqueId,
                    tabIndex:index+1,
                    node: targetNode,
                    onClick: (e) => handleItemClick(itemData, e),
                    onDoubleClick: (e) => handleItemDoubleClick(itemData, e),
                    selected: isSelected,
                    tableEntryRenderCell,
                    entryRenderActions,
                    entryRenderIcon,
                };
                return <ModernTableListEntry {...entryProps} isParent={itemData.isParent} tableKeys={tableKeys} pydio={pydio} />;

            })}
            </tbody>
        </table>

    )

}

export {ModernLayoutTable}