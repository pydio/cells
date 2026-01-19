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

import React, {useEffect, useState} from 'react';
import {FieldEdit} from './FieldEdit';
import {FieldDisplay} from './FieldDisplay';

/**
 * Main component that handles a metadata field in edit or display mode
 */
export const TogglableField = ({
      fieldKey,
      meta,
      node,
      value,
      updateValue,
      autoSave,
      saving,
      configsForGroup,
      supportTemplates,
      additionalProps,
    // Not used
       editMode,
       multiple,
       checked, onCheck,

  }) => {

    const [editing, setEditing] = useState(false);
    const [savePending, setSavePending] = useState(false);

    useEffect(() => {
        if(savePending && editing && !saving) {
            setSavePending(false);
            setEditing(false);
        }
    }, [saving]);

    if (editing || savePending) {
        return <FieldEdit
            fieldKey={fieldKey}
            meta={meta}
            value={value}
            updateValue={(key, value, submit) => {
                updateValue(key, value, submit);
                if(submit) {
                    setSavePending(true);
                }
            }}
            saving={savePending}
            requestToggleClose={()=> {
                setSavePending(true);
                autoSave && autoSave()
            }}
            configsForGroup={configsForGroup}
            supportTemplates={supportTemplates}
            additionalProps={additionalProps}
        />;
    }

    return (
        <FieldDisplay
            className={"togglable"}
            fieldKey={fieldKey}
            meta={meta}
            value={value}
            node={node}
            onValueClick={() => setEditing(true)}
        />
    );
};
