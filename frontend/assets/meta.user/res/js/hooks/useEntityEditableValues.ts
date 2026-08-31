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

import { useEffect, useState } from 'react';
import MetaClient from '../MetaClient';

/**
 * Resolves whether the current user may add new free-form values to a
 * tag_cloud namespace that is backed by an entity list.
 *
 * The flag is `true` when the entity does NOT carry a
 * `PoliciesContextEditable` key (policy grants free-form entry), or when
 * the fetch fails (fail-open so the UI is never silently locked).
 *
 * When `entityUUID` is absent the hook is a no-op:
 * `editableValues` stays `false` and `loading` is never raised.
 */
export const useEntityEditableValues = (
    entityUUID: string | undefined,
): { editableValues: boolean; loading: boolean } => {
    const [editableValues, setEditableValues] = useState(false);
    const [loading, setLoading] = useState(!!entityUUID);

    useEffect(() => {
        if (!entityUUID) {
            return;
        }

        setLoading(true);

        MetaClient.getInstance()
            .listEntities()
            .then((entities) => {
                const entity = entities.find((e) => e.Uuid === entityUUID);
                // Absence of PoliciesContextEditable → user may add new values
                setEditableValues(
                    !entity ||
                        !Object.prototype.hasOwnProperty.call(
                            entity,
                            'PoliciesContextEditable',
                        ),
                );
            })
            .catch(() => {
                // Fail-open: allow editing when the check cannot be completed
                setEditableValues(true);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [entityUUID]);

    return { editableValues, loading };
};
