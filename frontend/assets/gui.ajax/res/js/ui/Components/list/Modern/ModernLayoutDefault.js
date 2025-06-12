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

import React, {useRef, useEffect, useCallback} from "react";
import {ModernListEntry} from "./ModernListEntry";
import {useFocusOnClick} from "./useFocusOnClick";

const ModernLayoutDefault = ({pydio, items, handleKeyDown, handleItemClick, handleItemDoubleClick, entryRenderIcon, entryRenderFirstLine, entryRenderSecondLine, entryRenderActions, selection, setItemsPerRow}) => {

    const ref = useRef()
    useFocusOnClick(ref)

    const update = useCallback(() => {
        const container = ref.current;
        if (!container) return;
        const children = Array.from(container.children);
        if (children.length < 2) return; // can't compute with 0–1 items
        const tops = children.map(child => child.offsetTop);
        // Find the first different offset (i.e. second row)
        const firstRowTop = tops[0];
        let rowBreakIndex = tops.findIndex(top => top !== firstRowTop);
        // If all items are on the same line, fallback to count them all
        if (rowBreakIndex === -1) rowBreakIndex = children.length;
        setItemsPerRow(rowBreakIndex);

    }, setItemsPerRow)

    useEffect(() => {
        if(!setItemsPerRow) {
            return
        }
        const observer = new ResizeObserver(update);
        if (ref.current) observer.observe(ref.current);

        return () => observer.disconnect();
    }, [setItemsPerRow]);

    return (
        <div className="list-area" style={{ width: '100%'}} tabIndex={100} onKeyDown={handleKeyDown} ref={ref}>
            {items.map((itemData, index) => {
                const {isGroupHeader, isParent, node, id, title} = itemData;
                const itemUniqueId = id || `item-${index}`; // Ensure unique key
                if (isGroupHeader) {
                    return <div key={itemUniqueId} className={"modern-group-header"}>{title}</div>
                }

                // Standard node item rendering
                const isSelected = node ? selection.get(node) || false : false; // Only node items can be selected
                const entryProps = {
                    key: itemUniqueId,
                    tabIndex:index+1,
                    node: node,
                    onClick: (e) => handleItemClick(itemData, e),
                    onDoubleClick: (e) => handleItemDoubleClick(itemData, e),
                    selected: isSelected,
                    entryRenderIcon: (n) => entryRenderIcon(n, {...itemData, parent: isParent}),
                    entryRenderActions,
                    entryRenderFirstLine,
                    entryRenderSecondLine
                };
                if (isParent) {
                    // ucfirst
                    let parentLabel = pydio.MessageHash['react.1']
                    parentLabel = parentLabel.charAt(0).toUpperCase() + parentLabel.slice(1);
                    if (entryRenderSecondLine) {
                        // 2 lines case
                        entryProps.entryRenderFirstLine = () => <span>..</span>
                        entryProps.entryRenderSecondLine = () => <span>{parentLabel}</span>
                    } else if (entryRenderFirstLine) {
                        entryProps.entryRenderFirstLine = () => <span>{parentLabel}</span>
                    }
                }
                return <ModernListEntry className={'modern-list-entry'} {...entryProps} />;
            })}
        </div>

    )

}

export {ModernLayoutDefault}