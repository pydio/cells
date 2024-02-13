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

import React from 'react'
import InfoPanelCard from './InfoPanelCard'

export default class RootNode extends React.Component{

    constructor(props) {
        super(props);
        this.state = {repoKey: null}
    }

    componentDidMount() {
        this.loadData(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.pydio.user && nextProps.pydio.user.activeRepository !== this.state.repoKey) {
            this.loadData(nextProps);
        }
    }

    loadData(props) {
        if(!props.pydio.user) {
            return;
        }
        let cacheService = MetaCacheService.getInstance();
        cacheService.registerMetaStream('workspace.info', 'MANUAL_TRIGGER');
        let oThis = this;
        const render = function(data){
            oThis.setState({...data['core.users']});
        };
        const repoKey = pydio.user.getActiveRepository();
        this.setState({repoKey: repoKey})
        if(cacheService.hasKey('workspace.info', repoKey)){
            render(cacheService.getByKey('workspace.info', repoKey));
        }else{
            FuncUtils.bufferCallback("ajxp_load_repo_info_timer", 700,function(){
                if(!oThis.isMounted()) return;
                // Todo: load info about workspace
            });
        }
    }

    render() {
        const messages = this.props.pydio.MessageHash;
        let internal = messages[528];
        let external = messages[530];
        let shared = messages[527];

        let content, panelData;

        if(this.state && this.state.users){
            panelData = [
                {key: 'internal', label:internal, value:this.state.users},
                {key: 'external', label:external, value:this.state.groups}
            ];
        }

        return (
            <InfoPanelCard identifier={"file-info"} title={messages[249]} style={this.props.style} standardData={panelData} icon="account-multiple-outline" iconColor="00838f">{content}</InfoPanelCard>
        );
    }
}