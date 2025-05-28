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

import {useCallback} from "react";

const useGrouping = ({defaultGroupBy, groupSkipUnique, groupByLabel, renderGroupLabels, groupByValueFunc}) => {
    return useCallback((items) => {
        if(!defaultGroupBy || !items.length) {
            return items;
        }
        const output = [];
        const groups = new Map();
        items.forEach(item => {
            let groupValue;
            if(groupByValueFunc) {
                groupValue = groupByValueFunc(item.node.getMetadata().get(defaultGroupBy)) || 'N/A'
            } else {
                groupValue = item.node.getMetadata().get(defaultGroupBy) || 'N/A';
            }
            //const groupValue = item.node.getMetadata ? item.node.getMetadata().get(defaultGroupBy) : 'Undefined';
            if (!groups.has(groupValue)) {
                groups.set(groupValue, []);
            }
            groups.get(groupValue).push(item);
        });

        if (groupSkipUnique && groups.size === 1) {
            output.push(...items); // Add items directly without group header
        } else {
            new Map([...groups.entries()].sort()).forEach((groupItems, groupValue) => {
                let groupTitle = groupValue;
                if (groupByLabel && pydio.MessageHash && pydio.MessageHash[groupByLabel + '.' + groupValue]) {
                    groupTitle = pydio.MessageHash[groupByLabel + '.' + groupValue];
                } else if (renderGroupLabels && typeof renderGroupLabels === 'function') {
                    groupTitle = renderGroupLabels(defaultGroupBy, groupValue, groupItems);
                }
                output.push({ isGroupHeader: true, id: `group_header_${groupValue}`, title: groupTitle, value: groupValue });
                output.push(...groupItems);
            });
        }
        return output;
    }, [defaultGroupBy, groupSkipUnique, groupByLabel, renderGroupLabels, groupByValueFunc])
}

export {useGrouping}