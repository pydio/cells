/*
 * Copyright 2025 Abstrium SAS <team (at) pyd.io>
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

import React, {useState, useEffect, useMemo} from 'react'
import Pydio from 'pydio'
const {PydioContextConsumer} = Pydio.requireLib('boot');
const {InfoPanelCard} = Pydio.requireLib('workspaces');
import Pad from './pad'
import { muiThemeable } from 'material-ui/styles'

import {useNodeContent} from "./hooks/useNodeContent";

let InfoPanel = ({node, muiTheme, ...infoProps}) => {

    const {content, loaded, save} = useNodeContent(node)

    let body;
    if(!loaded) {
        return null
    }
    if(content) {
        body = (
            <Pad
                readOnly={false}
                darkMode={muiTheme.darkMode}
                initialContent={content}
                onChange={(blocks) => save(blocks)}
                node={node}
            />
        )
    }

    return (
        <InfoPanelCard {...infoProps} identifier={"folder-pad"} icon={"mdi mdi-history"} title={Pydio.getMessages()['bnote.ext']}>
            {body}
        </InfoPanelCard>
    )
}

InfoPanel = muiThemeable()(PydioContextConsumer(InfoPanel));
export default InfoPanel