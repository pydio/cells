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
import React, {useContext} from 'react'
import CompositeCard from '../composite/CompositeCard'
import CellCard from '../cells/CellCard'
const {InfoPanelCard, MultiColumnContext} = Pydio.requireLib('workspaces')

const InfoPanel = ({pydio, node, popoverPanel, popoverRequestClose, ...infoProps}) => {

    const {currentPin} = useContext(MultiColumnContext) || {}
    const m = (id) => pydio.MessageHash['share_center.' + id];
    if(node.isRoot()){
        return (
            <InfoPanelCard popoverPanel={popoverPanel} icon={"icomoon-cells"} closedTitle={"Cell Info"} {...infoProps}>
                <div style={{padding:0, height:currentPin?'100%':null}}>
                    <CellCard cellId={pydio.user.activeRepository} pydio={pydio} mode="infoPanel" popoverPanel={popoverPanel} genericFlex={currentPin} />
                </div>
            </InfoPanelCard>
        );
    } else {
        return (
            <InfoPanelCard popoverPanel={popoverPanel} icon={"mdi mdi-share-variant-outline"} closedTitle={m('share.panel.title-info')} {...infoProps}>
                <div style={{padding:0, height:currentPin?'100%':null}}>
                    <CompositeCard node={node} pydio={pydio} mode="infoPanel" popoverPanel={popoverPanel} popoverRequestClose={popoverRequestClose} genericFlex={currentPin}/>
                </div>
            </InfoPanelCard>
        );

    }

}

export {InfoPanel as default}
