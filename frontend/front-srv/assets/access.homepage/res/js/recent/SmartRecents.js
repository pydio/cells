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
import {Paper,CircularProgress} from 'material-ui'
import Node from 'pydio/model/node'
import PathUtils from 'pydio/util/path'
import MetaNodeProvider from 'pydio/model/meta-node-provider'
const { PydioContextConsumer, moment } = Pydio.requireLib('boot');
const {FilePreview} = Pydio.requireLib('workspaces');
const {ASClient} = Pydio.requireLib('PydioActivityStreams');
import PydioApi from 'pydio/http/api'
import {UserMetaServiceApi, RestUserBookmarksRequest} from 'cells-sdk'
const {PlaceHolder, PhTextRow, PhRoundShape} = Pydio.requireLib('hoc');

class Loader {
    constructor(pydio, stater) {
        this.pydio = pydio;
        this.stater = stater;
        this.metaProvider = new MetaNodeProvider();
    }

    load(){
        const allLoaders = [
            this.loadActivities(),
            this.loadBookmarks(),
            this.workspacesAsNodes()
        ];
        return Promise.all(allLoaders).then(results => {
            let allResolvers = [];
            let allNodes = [];
            let allKeys = {};
            results.map(resolvers => {
                allResolvers = [...allResolvers, ...resolvers];
            });
            return this.resolveNext(allResolvers, allNodes, allKeys, 8);
        });
    }

    resolveNext(allResolvers, allNodes, allKeys, max = 8) {
        if(allNodes.length > max || !allResolvers.length) {
            return Promise.resolve(allNodes);
        }
        let next = allResolvers.shift();
        return new Promise(next).then(node => {
            if(node && !allKeys[node.getMetadata().get("uuid")]) {
                allNodes.push(node);
                allKeys[node.getMetadata().get("uuid")] = node.getMetadata().get("uuid");
                this.stater.setState({nodes: [...allNodes], loading: false});
            }
            return this.resolveNext(allResolvers, allNodes, allKeys, max);
        })
    }

    loadBookmarks(){
        const api = new UserMetaServiceApi(PydioApi.getRestClient());
        return new Promise(resolve => {
            api.userBookmarks(new RestUserBookmarksRequest()).then(collection => {
                const nodes = [];
                if(!collection.Nodes){
                    resolve([]);
                    return;
                }
                collection.Nodes.slice(0, 4).forEach(n => {
                    if(!n.AppearsIn){
                        return;
                    }
                    let path = n.AppearsIn[0].Path;
                    if(!path) {
                        path = '/';
                    }
                    const fakeNode = new Node(path, n.Type === 'LEAF');
                    fakeNode.getMetadata().set('repository_id', n.AppearsIn[0].WsUuid);
                    nodes.push(resolve1 => {
                        this.metaProvider.refreshNodeAndReplace(fakeNode, (freshNode)=>{
                            freshNode.getMetadata().set('card_legend', 'Bookmarked');
                            freshNode.getMetadata().set('repository_id', n.AppearsIn[0].WsUuid);
                            resolve1(freshNode);
                        }, ()=>{
                            resolve1(null)
                        })
                    });
                });
                resolve(nodes);
            });
        });
    }

    loadActivities(){
        return new Promise(resolve => {
            ASClient.loadActivityStreams('USER_ID', this.pydio.user.id, 'outbox', 'ACTOR', 0, 20).then((json) => {
                if(!json.items){
                    resolve([]);
                    return
                }
                let nodes = [];
                json.items.filter(a => !!a.object).forEach(activity => {
                    const mom = moment(activity.updated);
                    const n = this.nodeFromActivityObject(activity.object);
                    if(n){
                        nodes.push(resolve1 => {
                            const wsId = n.getMetadata().get('repository_id');
                            const wsLabel = n.getMetadata().get('repository_label');
                            this.metaProvider.refreshNodeAndReplace(n, (freshNode)=>{
                                freshNode.getMetadata().set('repository_id', wsId);
                                if(freshNode.getPath() === '' || freshNode.getPath() === '/'){
                                    freshNode.setLabel(wsLabel);
                                }
                                freshNode.getMetadata().set('card_legend', mom.fromNow());
                                resolve1(freshNode);
                            }, ()=>{
                                resolve1(null)
                            })
                        })
                    }
                });
                resolve(nodes);
            }).catch(msg => {
                resolve([]);
            })
        })
    }

    workspacesAsNodes() {
        const ws = [];
        const repos = [];
        this.pydio.user.getRepositoriesList().forEach(repo => {repos.push(repo)});
        repos.slice(0, 10).forEach(repoObject => {
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
            ws.push(resolve => {
                node.getMetadata().set("repository_id", repoObject.getId());
                this.metaProvider.refreshNodeAndReplace(node, (freshNode)=>{
                    freshNode.setLabel(repoObject.getLabel());
                    freshNode.getMetadata().set("repository_id", repoObject.getId());
                    freshNode.getMetadata().set("card_legend", legend);
                    freshNode.getMetadata().set("fonticon", fontIcon);
                    resolve(freshNode);
                }, ()=>{
                    resolve(null)
                })
            });
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

    constructor(props){
        super(props);
        this.state = {opacity: 0};
    }

    componentDidMount(){
        setTimeout(()=>{this.setState({opacity: 1});}, 200);
    }

    render(){
        const {opacity, hover} = this.state;
        const styles={
            paper:{
                width: 140, height: 160,
                margin: 10,
                padding: 6,
                borderRadius: 6,
                boxShadow: hover?'0px 15px 30px -6px rgba(0, 0, 0, .15)' : '-1px 0px 15px 0px rgba(0, 0, 0, 0.1)',
                display:'flex', flexDirection:'column', cursor:'pointer',
                alignItems:'center', textAlign:'center',
                opacity: opacity,
                transition:'all 1000ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'
            },
            preview:{
                boxShadow: '0 0 0 1px #edf0f2',
                borderRadius: 6,
                width: '100%',
                flex:1,
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex'
            },
            fontOverlay:{position:'absolute', bottom:0, right: 5},
            label:{fontSize:14, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', width: '100%'},
            title:{fontSize:14, marginTop: 10},
            legend:{fontSize: 11, fontWeight: 500, color: '#9E9E9E'},
        };

        const {title, legend, node, pydio} = this.props;
        return (
            <Paper zDepth={0} style={styles.paper} onClick={() => {pydio.goTo(node);}} onMouseOver={()=>this.setState({hover:true})} onMouseOut={()=>this.setState({hover:false})} title={node && node.getLabel()}>
                {node && <FilePreview node={node} style={styles.preview} mimeFontStyle={{fontSize:40}} loadThumbnail={true} mimeFontOverlay={true} mimeFontOverlayStyle={styles.fontOverlay}/>}
                <div style={{...styles.label, ...styles.title}}>{title}</div>
                <div style={{...styles.label, ...styles.legend}}>{legend}</div>
            </Paper>
        );
    }
}

class SmartRecents extends React.Component{

    constructor(props){
        super(props);
        this.loader = new Loader(props.pydio, this);
        this.state = {nodes:[], loading:false};
    }

    componentDidMount(){
        this.setState({loading: true});
        this.loader.load().then(nodes => {
            this.setState({nodes, loading: false});
        }).catch(()=>{
            this.setState({loading: false});
        });
    }

    render(){

        const cardsPH = (
            <div style={{display:'flex', flexWrap:'wrap'}}>
                {[0,1,2,3,4,5,6,7].map(() => {
                    return (
                        <div style={{margin:10,width:140, height: 160, padding: 6, display:'flex', flexDirection:'column', alignItems:'center'}}>
                            <PhRoundShape style={{width:'100%', height:100, borderRadius: 6}}/>
                            <PhTextRow/>
                            <PhTextRow/>
                        </div>
                    );
                })}
            </div>
        );

        const {pydio, style} = this.props;
        const {nodes, loading} = this.state;

        if (!pydio.user || pydio.user.lock) {
            return <div></div>;
        }
        const keys = {};
        const cards = [];
        nodes.forEach((node) => {
            const k = node.getMetadata().get("uuid");
            if(keys[k] || cards.length >= 8){
                return;
            }
            keys[k] = k;
            cards.push(
                <RecentCard
                    key={k}
                    pydio={pydio}
                    node={node}
                    title={node.getLabel()}
                    legend={node.getMetadata().get('card_legend')}
            />)
        });

        return (
            <div style={{display:'flex', flexWrap: 'wrap', justifyContent:'center', ...style}}>
                <PlaceHolder ready={!loading} showLoadingAnimation customPlaceholder={cardsPH}>
                    {cards}
                </PlaceHolder>
            </div>
        );


    }

}

SmartRecents = PydioContextConsumer(SmartRecents);
export {SmartRecents as default};