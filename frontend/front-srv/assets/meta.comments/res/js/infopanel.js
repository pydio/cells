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

    constructor(props){
        super(props);
        this.state = {chatOpen: true};
    }

    toggleChatOpen(){
        this.setState({chatOpen: !this.state.chatOpen});
    }

    render(){

        const {node, pydio} = this.props;
        const {chatOpen} = this.state;
        let icon = "comment-processing";
        let iconClick = this.toggleChatOpen.bind(this);
        if (chatOpen) {
            icon = "close";
        }
        return (
            <InfoPanelCard identifier={"meta-comments"} style={this.props.style} title={pydio.MessageHash['meta.comments.1']} iconClick={iconClick} icon={icon} iconColor="#7cb342">
                {!chatOpen &&
                    <div style={{textAlign: 'center', paddingBottom:20}}>
                        <RaisedButton onClick={this.toggleChatOpen.bind(this)} primary={true} label={"OPEN DISCUSSION"}/>
                    </div>
                }
                {chatOpen && <Chat roomType="NODE" roomObjectId={node.getMetadata().get("uuid")} fieldHint={pydio.MessageHash['meta.comments.2']}/>}
            </InfoPanelCard>
        );
    }

}

InfoPanel = PydioContextConsumer(InfoPanel);
export {InfoPanel as default}