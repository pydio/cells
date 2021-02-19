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

import Node from 'pydio/model/node'
import PydioDataModel from 'pydio/model/data-model'
import RemoteNodeProvider from "pydio/model/remote-node-provider";

import NodeListCustomProvider from './NodeListCustomProvider'
import DataModelBadge from '../elements/DataModelBadge'

export default class CollapsableListProvider extends React.Component{

    // propTypes:{
    //     paneData:React.PropTypes.object,
    //     pydio:React.PropTypes.instanceOf(Pydio),
    //     nodeClicked:React.PropTypes.func,
    //     startOpen:React.PropTypes.bool,
    //     onBadgeIncrease: React.PropTypes.func,
    //     onBadgeChange: React.PropTypes.func
    // },

    constructor(props){
        super(props);
        const dataModel = new PydioDataModel(true);
        const rNodeProvider = new RemoteNodeProvider();
        dataModel.setAjxpNodeProvider(rNodeProvider);
        rNodeProvider.initProvider(this.props.paneData.options['nodeProviderProperties']);
        const rootNode = new Node("/", false, "loading", "folder.png", rNodeProvider);
        dataModel.setRootNode(rootNode);

        this.state = {
            open:false,
            componentLaunched:!!this.props.paneData.options['startOpen'],
            dataModel:dataModel
        };

    }

    toggleOpen(){
        this.setState({open:!this.state.open, componentLaunched:true});
    }

    onBadgeIncrease(newValue, prevValue, memoData){
        if(this.props.onBadgeIncrease){
            this.props.onBadgeIncrease(this.props.paneData, newValue, prevValue, memoData);
            if(!this.state.open) {
                this.toggleOpen();
            }
        }
    }

    onBadgeChange(newValue, prevValue, memoData){
        if(this.props.onBadgeChange){
            this.props.onBadgeChange(this.props.paneData, newValue, prevValue, memoData);
            if(!this.state.open) {
                this.toggleOpen();
            }
        }
    }

    render(){

        const messages = this.props.pydio.MessageHash;
        const {paneData} = this.props;

        const title = messages[paneData.options.title] || paneData.options.title;
        const className = 'simple-provider ' + (paneData.options['className'] ? paneData.options['className'] : '');
        const titleClassName = 'section-title ' + (paneData.options['titleClassName'] ? paneData.options['titleClassName'] : '');

        let badge;
        if(paneData.options.dataModelBadge){
            badge = <DataModelBadge
                dataModel={this.state.dataModel}
                options={paneData.options.dataModelBadge}
                onBadgeIncrease={this.onBadgeIncrease.bind(this)}
                onBadgeChange={this.onBadgeChange.bind(this)}
            />;
        }
        let emptyMessage;
        if(paneData.options.emptyChildrenMessage){
            emptyMessage = <DataModelBadge
                dataModel={this.state.dataModel}
                options={{
                    property:'root_children_empty',
                    className:'emptyMessage',
                    emptyMessage:messages[paneData.options.emptyChildrenMessage]
                }}
            />
        }

        let component;
        if(this.state.componentLaunched){
            let entryRenderFirstLine;
            if(paneData.options['tipAttribute']){
                entryRenderFirstLine = function(node){
                    const meta = node.getMetadata().get(paneData.options['tipAttribute']);
                    if(meta){
                        return <div title={meta.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?(\/)?>|<\/\w+>/gi, '')}>{node.getLabel()}</div>;
                    }else{
                        return node.getLabel();
                    }
                };
            }
            component = (
                <NodeListCustomProvider
                    pydio={this.props.pydio}
                    ref={paneData.id}
                    title={title}
                    elementHeight={36}
                    heightAutoWithMax={4000}
                    entryRenderFirstLine={entryRenderFirstLine}
                    nodeClicked={this.props.nodeClicked}
                    presetDataModel={this.state.dataModel}
                    reloadOnServerMessage={paneData.options['reloadOnServerMessage']}
                    actionBarGroups={paneData.options['actionBarGroups']?paneData.options['actionBarGroups']:[]}
                />
            );
        }

        return (
            <div className={className + (this.state.open?" open": " closed")}>
                <div className={titleClassName}>
                    <span className="toggle-button" onClick={this.toggleOpen.bind(this)}>{this.state.open?messages[514]:messages[513]}</span>
                    {title} {badge}
                </div>
                {component}
                {emptyMessage}
            </div>
        );

    }

}