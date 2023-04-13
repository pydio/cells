/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import Pydio from 'pydio'
import ResourcesManager from 'pydio/http/resources-manager'

const {GenericCard, GenericLine, QuotaUsageLine} = Pydio.requireLib('components');

class WorkspaceCard extends React.Component {

    constructor(props){
        super(props);
        this.state = {};
        const {rootNode} = this.props;
        if(rootNode.getMetadata().has('virtual_root')){
            // Use node children instead
            if(rootNode.isLoaded()){
                this.state.rootNodes = [];
                rootNode.getChildren().forEach(n => this.state.rootNodes.push(n));
            } else {
                // Trigger children load
                rootNode.observeOnce('loaded', () => {
                    const rootNodes = [];
                    rootNode.getChildren().forEach(n => rootNodes.push(n));
                    this.setState({rootNodes});
                });
                rootNode.load();
            }
        } else {
            this.state.rootNodes = [rootNode];
        }
        ResourcesManager.loadClass("PydioActivityStreams").then ((lib) => {
            this.setState({ASLib: lib})
        });
        ResourcesManager.loadClass("PydioCoreActions").then((lib) => {
            this.setState({CALib: lib})
        });
    }

    render(){

        const {pydio, workspace, onDismiss} = this.props;
        const {rootNodes} = this.state;
        const {ASLib, CALib} = this.state;
        const lines = [];
        let otherActions = [];

        if (workspace.getDescription()) {
            lines.push(<GenericLine iconClassName="mdi mdi-information" legend={pydio.MessageHash['share_center.145']} data={workspace.getDescription()}/>)
        }
        if(rootNodes && rootNodes.length) {
            rootNodes.forEach((node) => {
                if(node.getMetadata().get("ws_quota")) {
                    lines.push(<QuotaUsageLine node={node}/>)
                }
            })
        }
        if(pydio.getPluginConfigs('core.activitystreams').get('ACTIVITY_SHOW_ACTIVITIES') && ASLib && rootNodes){
            const {WatchSelector} = ASLib
            const selector = <WatchSelector pydio={pydio} nodes={rootNodes} fullWidth={true}/>;
            lines.push(<GenericLine iconClassName={"mdi mdi-bell-outline"} legend={pydio.MessageHash['meta.watch.selector.legend']} iconStyle={{marginTop:32}} data={selector} dataStyle={{paddingRight: 16}}/>)

        }
        if (CALib && rootNodes){
            const {BookmarkButton, MaskWsButton} = CALib;
            otherActions.push(<MaskWsButton pydio={pydio} workspaceId={workspace.getId()} iconStyle={{color:'var(--md-sys-color-primary)'}}/>);
            otherActions.push(<BookmarkButton pydio={pydio} nodes={rootNodes} styles={{iconStyle:{color:'var(--md-sys-color-primary)'}}}/>);
        }

        return (
            <GenericCard
                pydio={pydio}
                title={workspace.getLabel()}
                onDismissAction={onDismiss}
                style={{width: 420}}
                otherActions={otherActions}
            >
                {lines}
            </GenericCard>
        );


    }

}

export default WorkspaceCard