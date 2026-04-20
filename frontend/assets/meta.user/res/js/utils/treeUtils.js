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

/**
 * Adds a metadata configuration to the tree at the specified path
 */
const addNode = (tree, path, meta) => {
    let current = tree;
    for (let segment of path) {
        if (!current[segment]) {
            current[segment] = {};
        }
        current = current[segment];
    }
    current.__NS__ = meta;
};

/**
 * Converts a flat map of namespace paths to a hierarchical tree structure
 */
export const pathsToTree = (groupedMap) => {
    const tree = {};

    Object.keys(groupedMap).forEach((path) => {
        const meta = groupedMap[path];
        path = path.replace(/(^\/|\/$)/g, '').replace(/\\/g, '/');

        if (path === '') {
            tree.__NS__ = meta;
            return;
        }

        const segments = path.split('/');
        addNode(tree, segments, meta);
    });

    return tree;
};

/**
 * Groups metadata configs by their namespace/group path
 */
export const groupConfigsByNamespace = (configs, supportTemplates) => {
    const groupedNS = {};

    configs.forEach((meta, key) => {
        const { type, groupName = '' } = meta;
        if (type === 'json' && !supportTemplates) {
            return;
        }
        if (!groupedNS[groupName]) {
            groupedNS[groupName] = new Map();
        }
        groupedNS[groupName].set(key, meta);
    });

    return groupedNS;
};
