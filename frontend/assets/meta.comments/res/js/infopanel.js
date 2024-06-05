/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import Pydio from 'pydio'
import React, {useContext} from 'react';
const {PydioContextConsumer} = Pydio.requireLib('boot');
const {InfoPanelCard, MultiColumnContext} = Pydio.requireLib('workspaces');
const {Chat} = Pydio.requireLib('components');

let InfoPanel = (props) => {

    const {currentPin} = useContext(MultiColumnContext) || {};
    const {node, pydio, popoverPanel, ...infoProps} = props;
    let style, msgContainerStyle;
    if(currentPin) {
        style = {height:'100%', display:'flex', flexDirection:'column'}
        msgContainerStyle = {flex: 1, maxHeight: 'inherit'}
    }
    return (
        <InfoPanelCard {...infoProps} identifier={"meta-comments"} icon={"mdi mdi-message-text-outline"} title={pydio.MessageHash['meta.comments.1']} popoverPanel={popoverPanel}>
            <Chat
                pydio={pydio}
                roomType="NODE"
                roomObjectId={node.getMetadata().get("uuid")}
                fieldHint={pydio.MessageHash['meta.comments.2']}
                style={style}
                msgContainerStyle={msgContainerStyle}
                emptyStateProps={{
                    iconClassName:'mdi mdi-comment-outline',
                    primaryTextId:pydio.MessageHash['meta.comments.empty-state'],
                    style:{padding:'10px 20px 20px', backgroundColor: 'transparent'},
                    iconStyle:{fontSize: 40},
                    legendStyle:{fontSize: 13}
                }}
                textFieldProps={{
                    style:{height: 40, lineHeight:'16px'},
                    hintStyle:{fontSize: 13, whiteSpace:'no-wrap'}
                }}
                popoverPanel={popoverPanel}
                readonly={node.getMetadata().get('node_readonly') === 'true'}
            />
        </InfoPanelCard>
    );

}

InfoPanel = PydioContextConsumer(InfoPanel);
export {InfoPanel as default}