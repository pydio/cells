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

import React, {Component} from 'react'
import Pydio from 'pydio'
import Revisions from "./Revisions";
const {PydioContextConsumer} = Pydio.requireLib('boot');
const {InfoPanelCard} = Pydio.requireLib('workspaces');


class InfoPanel extends Component {
    render() {
        const {node} = this.props;
        if(!node || !node.getMetadata().has('datasource_versioning')) {
            return null
        }
        return (
            <InfoPanelCard identifier={"meta-versions"} style={this.props.style} title={Pydio.getMessages()['meta.versions.1']}>
                <Revisions node={node} className={"small"} onClick={(versionId) => Pydio.getInstance().Controller.fireAction('versions_history', versionId)}/>
            </InfoPanelCard>
        )
    }
}

InfoPanel = PydioContextConsumer(InfoPanel);
export default InfoPanel