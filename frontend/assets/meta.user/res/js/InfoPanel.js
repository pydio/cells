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
import React, {useRef, useEffect, useState, useCallback} from 'react'
import Pydio from 'pydio'
import MetaClient from "./MetaClient";
import {FlatButton} from 'material-ui';
import UserMetaPanelV2 from "./UserMetaPanelV2";
const {InfoPanelCard} = Pydio.requireLib('workspaces')

const InfoPanel = ({pydio, node, popoverPanel, style, ...infoProps}) => {

    const panel = useRef(null);
    const [updateData, setUpdateData] = useState(null);
    const [valid, setValid] = useState(true);
    const [saving, setSaving] = useState(false);

    const _nodeObserver = () => {
        panel.current && panel.current.resetUpdateData();
        // this.forceUpdate();/// ?
    }
    useEffect(() => {
        node.observe('node_replaced', _nodeObserver);
        return () => {
            node.stopObserving('node_replaced', _nodeObserver);
        }
    }, [node, panel.current])


    const saveMeta = useCallback(() => {
        if(!updateData){
            return Promise.resolve()
        }
        setSaving(true);
        return MetaClient.getInstance().saveMeta([node], updateData).then(()=> {
            setSaving(false);
        }).catch(e => {
            setSaving(false);
        });
    }, [updateData, node])


    let actions = [];
    const {MessageHash} = pydio;

    const readOnly = node.getMetadata().get('node_readonly') === 'true';
    let hasAction = false;
    if(!readOnly && updateData && updateData.size > 0) {
        hasAction = true
        actions.push(
            <FlatButton
                key="edit"
                label={MessageHash['meta.user.15']}
                onClick={saveMeta}
                disabled={!valid}
            />
        );
    }
    let panelStyle = {}
    if(popoverPanel) {
        panelStyle = {...panelStyle,
            maxHeight: '80vh',
            overflowY: 'auto'
        }
    }
    if(!hasAction) {
        panelStyle = {...panelStyle, paddingBottom: 16}
    }

    return (
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
                onChangeUpdateData={(d) => {setUpdateData(d)}}
                onValidStatusChanged={(v) => {setValid(v)}}
                saving={saving}
                autoSave={saveMeta}
                style={panelStyle}
                useTogglableFields={true}
            />
        </InfoPanelCard>
    );
}

export default InfoPanel