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

import { useState } from 'react';

const localKey = 'pydio.layout.meta-groups-expanded';

/**
 * Custom hook to manage groups expanded/collapsed state
 */
export const useGroupsExpanded = () => {
    const [groupsExpanded, setGroupsExpanded] = useState(() => {
        if (localStorage.getItem(localKey)) {
            try {
                return JSON.parse(localStorage.getItem(localKey)) || {};
            } catch(e) {
                localStorage.removeItem(localKey);
                return {};
            }
        }
        return {};
    });

    const toggleGroup = (gPath) => {
        const newExpanded = {...groupsExpanded, [gPath]: !groupsExpanded[gPath]};
        setGroupsExpanded(newExpanded);
        localStorage.setItem(localKey, JSON.stringify(newExpanded));
    };

    return [groupsExpanded, toggleGroup];
};