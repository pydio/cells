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
import Pydio from 'pydio'
import {Paper} from 'material-ui'
import Node from 'pydio/model/node'
import PathUtils from 'pydio/util/path'
import MetaNodeProvider from 'pydio/model/meta-node-provider'
const { PydioContextConsumer, moment } = Pydio.requireLib('boot');
const {FilePreview} = Pydio.requireLib('workspaces');
const {ASClient} = Pydio.requireLib('PydioActivityStreams');
import PydioApi from 'pydio/http/api'
import {UserMetaServiceApi, RestUserBookmarksRequest} from 'pydio/http/rest-api'


class Loader {
    constructor(pydio) {
        this.pydio = pydio;
        this.metaProvider = new MetaNodeProvider();
    }

    load(){
        const allLoaders = [
            this.loadActivities(),
            this.loadBookmarks(),
            this.workspacesAsNodes()
        ];
        return Promise.all(allLoaders).then(results => {
            console.log(results);
            let allNodes = [];
            results.map(nodes => {
                allNodes = [...allNodes, ...nodes.slice(0, 6)]
            });
            return allNodes;
        });
    }

    loadBookmarks(){
        const api = new UserMetaServiceApi(PydioApi.getRestClient());
        return new Promise(resolve => {
            api.userBookmarks(new RestUserBookmarksRequest()).then(collection => {
                const nodes = [];
                collection.Nodes.forEach(n => {
                    if(!n.AppearsIn){
                        return;
                    }
                    let path = n.AppearsIn[0].Path;
                    if(!path) {
                        path = '/';
                    }
                    const fakeNode = new Node(path, n.Type === 'LEAF');
                    fakeNode.getMetadata().set('repository_id', n.AppearsIn[0].WsUuid);
                    nodes.push(new Promise(resolve1 => {
                        this.metaProvider.refreshNodeAndReplace(fakeNode, (freshNode)=>{
                            freshNode.getMetadata().set('card_legend', 'Bookmarked');
                            freshNode.getMetadata().set('repository_id', n.AppearsIn[0].WsUuid);
                            resolve1(freshNode);
                        })
                    }));
                });
                Promise.all(nodes).then(nodes => {
                    resolve(nodes);
                })
            });
        });
    }

    loadActivities(){
        return new Promise(resolve => {
            ASClient.loadActivityStreams((json) => {
                if(!json.items){
                    resolve([]);
                    return
                }
                let nodes = [];
                json.items.filter(a => !!a.object).forEach(activity => {
                    const mom = moment(activity.updated);
                    const n = this.nodeFromActivityObject(activity.object);
                    if(n){
                        nodes.push(new Promise(resolve1 => {
                            const wsId = n.getMetadata().get('repository_id');
                            this.metaProvider.refreshNodeAndReplace(n, (freshNode)=>{
                                freshNode.getMetadata().set('repository_id', wsId);
                                freshNode.getMetadata().set('card_legend', mom.fromNow());
                                resolve1(freshNode);
                            })
                        }))
                    }
                });
                Promise.all(nodes).then(nodes => {
                    resolve(nodes);
                })
            }, 'USER_ID', this.pydio.user.id, 'outbox', 'ACTOR', 0, 30)
        })
    }

    workspacesAsNodes() {
        const ws = [];
        this.pydio.user.getRepositoriesList().forEach(repoObject => {
            if(repoObject.getId() === 'homepage' || repoObject.getId() === 'settings'){
                return;
            }
            const node = new Node('/', false, repoObject.getLabel());
            let fontIcon = 'folder';
            let legend = 'Workspace';
            if (repoObject.getRepositoryType() === "workspace-personal"){
                fontIcon = 'folder-account';
            } else if(repoObject.getRepositoryType() === "cell") {
                fontIcon = 'icomoon-cells';
                legend = 'Cell';
            }
            node.getMetadata().set("repository_id", repoObject.getId());
            node.getMetadata().set("card_legend", legend);
            node.getMetadata().set("fonticon", fontIcon);
            ws.push(node);
        });
        return Promise.resolve(ws);
    }

    nodeFromActivityObject(object){
        if (!object.partOf || !object.partOf.items || !object.partOf.items.length){
            return null;
        }
        for(let i = 0; i < object.partOf.items.length; i++ ){
            let ws = object.partOf.items[i];
            // Remove slug part
            let paths = ws.rel.split('/');
            paths.shift();
            let relPath = paths.join('/');
            let root = false;
            let label = PathUtils.getBasename(relPath);
            if(!relPath) {
                root = true;
                relPath = "/";
                label = ws.name;
            }
            const node = new Node(relPath, (object.type === 'Document'), label);
            if (root) {
                node.setRoot(true);
            }
            node.getMetadata().set('repository_id', ws.id);
            node.getMetadata().set('repository_label', ws.name);
            return node;
        }
        return null;
    }

}

class RecentCard extends React.Component{
    render(){
        const styles={
            paper:{
                width: 120, height: 140, margin: 16, display:'flex', flexDirection:'column', cursor:'pointer',
                alignItems:'center', textAlign:'center', /*backgroundColor:'rgb(236, 239, 241)',*/
            },
            preview:{
                boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
                borderRadius: '50%',
                width: 90,
                flex:1, alignItems: 'center',justifyContent: 'center', display: 'flex'
            },
            label:{fontSize:14, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', width: '100%'},
            title:{fontSize:14, marginTop: 10},
            legend:{fontSize: 11, fontWeight: 500, color: '#9E9E9E'},
        };
        const {title, legend, node, pydio} = this.props;
        return (
            <Paper zDepth={0} style={styles.paper} onClick={() => {pydio.goTo(node);}}>
                {node && <FilePreview node={node} style={styles.preview} mimeFontStyle={{fontSize:40}} loadThumbnail={true}/>}
                <div style={{...styles.label, ...styles.title}}>{title}</div>
                <div style={{...styles.label, ...styles.legend}}>{legend}</div>
            </Paper>
        );
    }
}

class SmartRecents extends React.Component{

    constructor(props){
        super(props);
        this.loader = new Loader(props.pydio);
        this.state = {nodes:[]};
    }

    componentDidMount(){
        this.loader.load().then(nodes => {
            this.setState({nodes});
        });
    }

    workspacesAsCards() {
        const ws = [];
        this.pydio.user.getRepositoriesList().forEach(repoObject => {
            ws.push(
                <RecentCard
                    key={repoObject.getId()}
                    pydio={this.props.pydio}
                    title={repoObject.getLabel()}
                    legend={repoObject.getOwner() ? "Cell": "Workspace"}
                />
            );
        });
        return ws;
    }


    render(){

        const {pydio, style} = this.props;
        const {nodes} = this.state;

        if (!pydio.user || pydio.user.lock) {
            return <div></div>;
        }
        const cards = nodes.map(node => {
            return (
                <RecentCard
                    key={node.getMetadata().get("uuid")}
                    pydio={pydio}
                    node={node}
                    title={node.getLabel()}
                    legend={node.getMetadata().get('card_legend')}
                />)

        }).slice(0, 9);

        return (
            <div style={{display:'flex', flexWrap: 'wrap', justifyContent:'center', ...style}}>
                {cards}
            </div>
        );


    }

}

SmartRecents = PydioContextConsumer(SmartRecents);
export {SmartRecents as default};