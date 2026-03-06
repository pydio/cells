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
import { FieldEdit } from './FieldEdit';

/**
 * Main component that handles a metadata field in edit or display mode
 */
export const TogglableField = ({
    context,
    fieldKey,
    meta,
    configsForGroup,
    supportTemplates,
    additionalProps,
}) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const { state } = context;
    const value = state.formState.get(fieldKey);

    // FIXME: Let's enable the togglable forms in a second step
    return (
        <FieldEdit
            isToggable={true}
            isEditing={isFocused || state.errors[fieldKey]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            context={context}
            name={fieldKey}
            meta={meta}
            value={value}
            configsForGroup={configsForGroup}
            supportTemplates={supportTemplates}
            additionalProps={additionalProps}
        />
    );
};
