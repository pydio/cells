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

const React = require('react');
const {RaisedButton} = require('material-ui');
const {PydioContextConsumer} = require('pydio').requireLib('boot');
const {InfoPanelCard} = require('pydio').requireLib('workspaces');
const {Chat} = require('pydio').requireLib('components');

class InfoPanel extends React.Component {

    render(){

        const {node, pydio, popoverPanel} = this.props;
        return (
            <InfoPanelCard identifier={"meta-comments"} style={this.props.style} title={pydio.MessageHash['meta.comments.1']} popoverPanel={popoverPanel}>
                <Chat
                    roomType="NODE"
                    roomObjectId={node.getMetadata().get("uuid")}
                    fieldHint={pydio.MessageHash['meta.comments.2']}
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
                    readonly={node.getMetadata().get('node_readonly') === 'true'}
                />
            </InfoPanelCard>
        );
    }

}

InfoPanel = PydioContextConsumer(InfoPanel);
export {InfoPanel as default}