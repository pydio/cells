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