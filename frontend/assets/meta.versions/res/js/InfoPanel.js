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
        const {node, ...infoProps} = this.props;
        if(!node || !node.getMetadata().has('datasource_versioning')) {
            return null
        }
        const css = `
        .timeline.small.meta-revisions .tl-timeline .tl-block .tl-card .tl-actions {
            display: flex;
        }
        .timeline.meta-revisions .tl-timeline .tl-block.current-revision .tl-card{
            position:relative;
            box-shadow: none !important;
        }
        .timeline.meta-revisions.small .tl-timeline .tl-block.current-revision .tl-card{
            background-color: var(--md-sys-color-tertiary-container);
        }
        .timeline.meta-revisions .tl-timeline .tl-block.current-revision .tl-card:before {
            content: '';
            border: 1px solid var(--md-sys-color-tertiary);
            position: absolute;
            top: -6px;
            bottom: -6px;
            right: -6px;
            left: -6px;
            border-radius: 6px;
        }        
        .timeline.meta-revisions.small .tl-timeline .tl-block.current-revision .tl-card:before {
            border: 1px solid var(--md-sys-color-tertiary-container);
        }
        .timeline .tl-timeline .tl-block .tl-card .tl-actions a {
            color: var(--md-sys-color-primary);
            border: 1px solid var(--md-sys-color-primary);
            padding: 0 12px;
            border-radius: 20px; 
            cursor: pointer;
       }
        .timeline .tl-timeline .tl-block .tl-card .tl-actions a:hover {
            background-color: var(--md-sys-color-primary);
            border: 1px solid var(--md-sys-color-primary);
            color:var(--md-sys-color-on-primary) !important;
       }
        `
        return (
            <InfoPanelCard {...infoProps} identifier={"meta-versions"} icon={"mdi mdi-history"} style={this.props.style} title={Pydio.getMessages()['meta.versions.1']}>
                <Revisions node={node} className={"meta-revisions small"} onClick={(versionId) => Pydio.getInstance().Controller.fireAction('versions_history', versionId)}/>
                <style type={"text/css"} dangerouslySetInnerHTML={{__html: css}}/>
            </InfoPanelCard>
        )
    }
}

InfoPanel = PydioContextConsumer(InfoPanel);
export default InfoPanel