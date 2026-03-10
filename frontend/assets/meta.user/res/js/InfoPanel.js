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
import React, { useRef, useEffect, useState, useCallback } from 'react'
import Pydio from 'pydio'
import MetaClient from "./MetaClient";
import { FlatButton } from 'material-ui';
import UserMetaPanelV2 from "./UserMetaPanelV2";
const { InfoPanelCard } = Pydio.requireLib('workspaces')
import { MetadataContextProvider } from './context/metadata.tsx';

// NOTE: this component is also used in:
// frontend/assets/gui.ajax/res/js/ui/Workspaces/views/OverlayIcon.js#62
const InfoPanel = ({
    pydio,
    node,
    popoverPanel,
    popoverRequestClose,
    style,
    ...infoProps
}) => {
    const panel = useRef(null);
    const [mode, setMode] = useState('idle');
    const [updateData, setUpdateData] = useState(null);
    const [saving, setSaving] = useState(false);

    const saveMeta = useCallback(
        (metadata) => {
            if (!metadata) {
                return Promise.resolve();
            }

            setSaving(true);
            return MetaClient.getInstance()
                .saveMeta([node], metadata)
                .then(() => {
                    node.replaceMetadata(metadata, true);
                    setUpdateData(null);
                    setMode('idle');
                })
                .catch((error) => {
                    throw error;
                })
                .finally(() => {
                    setSaving(false);

                    if (popoverPanel && popoverRequestClose) {
                        popoverRequestClose();
                    }
                });
        },
        [node, setSaving, setUpdateData],
    );

    const submitMetadata = useCallback(() => {
        if (saving || mode === 'invalid' || mode === 'idle') {
            return;
        }

        saveMeta(updateData);
        setUpdateData(null);
    }, [saveMeta, updateData, saving, mode]);

    let actions = [];
    const { MessageHash } = pydio;

    const readOnly = node.getMetadata().get('node_readonly') === 'true';
    let hasAction = false;
    if (!readOnly && mode !== 'idle') {
        hasAction = true
        actions.push(
            <FlatButton
                key="edit"
                label={MessageHash['meta.user.15']}
                onClick={submitMetadata}
                disabled={mode === 'invalid' || saving}
            />
        );
    }
    let panelStyle = {}
    if (popoverPanel) {
        panelStyle = {
            ...panelStyle,
            maxHeight: '80vh',
            overflowY: 'auto'
        }
    }
    if (!hasAction) {
        panelStyle = { ...panelStyle, paddingBottom: 16 }
    }

    return (
        <MetadataContextProvider
            node={node}
            saveMeta={saveMeta}
            savePartially={true}
            saving={saving}
            onDataChanged={(data, { mode }) => {
                setMode(mode)
                setUpdateData(data)
            }}
        >
            <InfoPanelCard
                {...infoProps}
                identifier={"meta-user"}
                style={style}
                title={MessageHash['meta.user.1']}
                actions={actions.length ? actions : null}
                icon="mdi mdi-tag-multiple-outline" iconColor="#00ACC1"
                popoverPanel={popoverPanel}
            >
                <UserMetaPanelV2
                    ref={panel}
                    className={"infoPanelFlexRow"}
                    node={node}
                    editMode={!readOnly}
                    pydio={pydio}
                    onChangeUpdateData={setUpdateData}
                    saving={saving}
                    style={panelStyle}
                    isToggable={!popoverPanel}
                />
            </InfoPanelCard>
        </MetadataContextProvider>
    );
}

export default InfoPanel
