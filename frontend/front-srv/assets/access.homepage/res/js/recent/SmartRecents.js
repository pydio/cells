/*
 * Copyright 2024 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import PathUtils from 'pydio/util/path'
import {Paper} from 'material-ui'
import MetaNodeProvider from 'pydio/model/meta-node-provider'
const { PydioContextConsumer, moment, M3Tooltip} = Pydio.requireLib('boot');
const {FilePreview} = Pydio.requireLib('workspaces');
import PydioApi from 'pydio/http/api'
import {GraphServiceApi, RestRecommendRequest} from 'cells-sdk'
const {PlaceHolder, PhTextRow, PhRoundShape} = Pydio.requireLib('hoc');

const Limit = 8

class RecoLoader {
    constructor(pydio, stater) {
        this.pydio = pydio;
        this.stater = stater;
    }

    m(id) {
        return this.pydio.MessageHash['user_home.reco.' + id] || id;
    }

    load() {
        const api = new GraphServiceApi(PydioApi.getRestClient())
        const req = new RestRecommendRequest()
        req.Limit = Limit
        return api.recommend(req).then(response => {
            const nn = response.Nodes || []
            return nn.map(n => {
                let slug;
                if (n.AppearsIn) {
                    slug = n.AppearsIn[0].WsSlug
                } else if (n.MetaStore['ws_slug']) {
                    slug = JSON.parse(n.MetaStore['ws_slug'])
                }
                if (n.MetaStore['reco-annotation']) {
                    const legend = JSON.parse(n.MetaStore['reco-annotation'])
                    if (legend.indexOf('activity:')===0) {
                        const ts = legend.replace('activity:', '')
                        n.MetaStore['card_legend'] = JSON.stringify(moment(ts * 1000).fromNow());
                    } else if (legend === 'bookmark') {
                        n.MetaStore['card_legend'] = JSON.stringify(this.m('bookmark'));
                    } else if (legend === 'workspace') {
                        if (n.MetaStore['ws_scope'] === "\"ROOM\"") {
                            n.MetaStore['card_legend'] = JSON.stringify(this.m('cell'));
                            n.MetaStore["fonticon"] = JSON.stringify('icomoon-cells')
                        } else {
                            n.MetaStore['card_legend'] = JSON.stringify(this.m('workspace'));
                        }
                    }
                }
                return MetaNodeProvider.parseTreeNode(n, slug)
            })
        })
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
        let {legend} = this.props;
        const {title, node, pydio, muiTheme, last, display='list'} = this.props;

        let styles={
            paper:{
                width: 140, height: 160,
                margin: 10,
                padding: 6,
                borderRadius: 6,
                boxShadow: hover?'0px 15px 30px -6px rgba(0, 0, 0, .15)' : '-1px 0px 15px 0px rgba(0, 0, 0, 0.1)',
                display:'flex', flexDirection:'column', cursor:'pointer',
                alignItems:'center', textAlign:'center',
                opacity: opacity,
                transition:'all 250ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'
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
            mimeFontStyle: {fontSize: 40},
            fontOverlay:{position:'absolute', bottom:0, right: 5},
            label:{fontSize:14, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', width: '100%'},
            title:{fontSize:14, marginTop: 10},
            legend:{fontSize: 11, fontWeight: 500, color: '#9E9E9E'},
            interDiv: {
                width:'100%', overflow:'hidden'
            }
        };
        if(muiTheme.userTheme === 'mui3') {
            const {palette:{mui3}} = muiTheme
            styles.paper = {
                ...styles.paper,
                width:160,
                height: 190,
                borderRadius: 12,
                boxShadow: null,
                margin: 4,
                padding: 0,
                paddingBottom: 6,
                background:mui3['surface'],
                color:mui3['on-surface']
            }
            styles.preview = {
                ...styles.preview,
                borderRadius: 12,
                boxShadow: null
            }
            styles.label = {
                ...styles.label,
                paddingLeft: 10,
                textAlign: 'left'
            }
            styles.title.fontWeight = 500
            styles.legend.color = mui3['on-surface-variant']
            styles.legend.fontWeight = 400

            // Override with line display
            if(display === 'list') {

                styles.paper = {
                    ...styles.paper,
                    background: hover ? 'var(--md-sys-color-hover-background)' : 'none',
                    border: 0,
                    margin: 0,
                    borderBottom: last ? 'none'  : '1px solid rgba(0,0,0,.05)'/* + mui3['outline-variant-50']*/,
                    borderRadius: 0,
                    width: '100%',
                    height: 74,
                    flexDirection: 'row',
                    padding:'0 16px',
                    paddingBottom: 0
                }
                styles.preview = {
                    borderRadius: 6,
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }
                styles.interDiv = {
                    flex: 1,
                    overflow: 'hidden',
                    paddingLeft: 8
                }
                styles.mimeFontStyle = {fontSize: 20}
                styles.title.marginTop = 0
                styles.title.fontSize = 15
                styles.legend.fontSize = 12

                if(node.getMetadata().has('reco-annotation') && (node.getMetadata().get('reco-annotation').indexOf('activity:') === 0 || node.getMetadata().get('reco-annotation') === 'bookmark')) {
                    const repoId= node.getMetadata().get('repository_id')
                    const repoLabel = pydio.user.getRepositoriesList().get(repoId).getLabel()
                    let dir = PathUtils.getDirname(node.getPath())
                    if(dir === '/' || !dir){
                        dir = ''
                    } else {
                        dir += ' - '
                    }
                    legend = '[' + repoLabel + '] ' + dir + legend
                }

            }

        }

        return (
            <Paper
                zDepth={0}
                style={styles.paper}
                onClick={() => {pydio.goTo(node);}}
                onMouseOver={()=>this.setState({hover:true})}
                onMouseOut={()=>this.setState({hover:false})}
                title={node && node.getLabel()}
            >
                {node &&
                    <FilePreview
                        node={node}
                        style={styles.preview}
                        mimeFontStyle={styles.mimeFontStyle}
                        loadThumbnail={true}
                        mimeFontOverlay={true}
                        mimeFontOverlayStyle={styles.fontOverlay}
                    />}
                <div  style={{...styles.interDiv}}>
                    <div style={{...styles.label, ...styles.title}}>{title}</div>
                    <div style={{...styles.label, ...styles.legend}}>{legend}</div>
                </div>
            </Paper>
        );
    }
}

const LayoutKey = "Recents.List.Display"

class SmartRecents extends React.Component{

    constructor(props){
        super(props);
        const {pydio, muiTheme} = props;
        this.loader = new RecoLoader(pydio, this);
        let list = false;
        if(muiTheme.userTheme === 'mui3') {
            list = pydio.user && pydio.user.getWorkspacePreference(LayoutKey, false)
        }
        this.state = {nodes:[], loading:false, list};
    }

    componentDidMount(){
        this.setState({loading: true});
        this.loader.load().then(nodes => {
            this.setState({nodes, loading: false});
        }).catch((err)=>{
            console.error(err)
            this.setState({loading: false});
        });
    }

    toggleList() {
        const {pydio} = this.props
        const {list} = this.state;
        const nl = !list
        this.setState({list: nl}, () => {
            pydio.user.setWorkspacePreference(LayoutKey, nl)
        })
    }

    render(){


        const {pydio, muiTheme} = this.props;
        const {nodes, loading, list} = this.state;

        const style = {
            display:(loading&&list)?'block':'flex',
            padding:list?'4px 0':4,
            flexWrap: 'wrap',
            justifyContent:'flex-start',
            maxWidth: 680,
            width:'100%'
        }
        let phStyle = {margin:10,width:140, height: 160, padding: 6, display:'flex', flexDirection:'column', alignItems:'center', borderRadius: 6}
        if(muiTheme.userTheme === 'mui3') {
            phStyle.width = 160;
            phStyle.height = 190;
            phStyle.margin=4;
            phStyle.borderRadius=12;
        }
        if(list) {
            phStyle.width = '100%'
            phStyle.display = 'flex'
            phStyle.flexDirection = 'row'
            phStyle.height = 'auto'
        }

        const cardsPH = (
            <div style={{display:'flex', flexWrap:'wrap'}}>
                {[...Array(Limit).keys()].map(() => {
                    if(list) {
                        return (
                            <div style={phStyle}>
                                <PhRoundShape style={{width:'100%', height:40, width: 40, borderRadius: phStyle.borderRadius}}/>
                                <div style={{flex: 1, marginTop: -8, marginLeft: 10}}>
                                    <PhTextRow/>
                                    <PhTextRow/>
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <div style={phStyle}>
                                <PhRoundShape style={{width:'100%', height:100, borderRadius: phStyle.borderRadius}}/>
                                <PhTextRow/>
                                <PhTextRow/>
                            </div>
                        );
                    }
                })}
            </div>
        );

        if (!pydio.user || pydio.user.lock) {
            return <div></div>;
        }
        const keys = {};
        const cards = [];
        let count = 0
        nodes.forEach((node) => {
            const k = node.getMetadata().get("uuid");
            if(keys[k] || cards.length >= Limit){
                return;
            }
            count++
            keys[k] = k;
            cards.push(
                <RecentCard
                    key={k}
                    last={count === Limit}
                    pydio={pydio}
                    muiTheme={muiTheme}
                    node={node}
                    title={node.getLabel()}
                    legend={node.getMetadata().get('card_legend')}
                    display={list?'list':'thumb'}
            />)
        });

        return (
            <div style={{maxHeight: 'calc(100%  - 40px)', overflow:'hidden', display:'flex', flexDirection:'column', borderRadius: 'var(--md-sys-color-paper-border-radius)', background:'var(--md-sys-color-surface-1)', marginTop: 20}}>
                <div style={{display:'flex', padding:'16px 16px 6px', color: 'var(--md-sys-color-secondary)', fontWeight: 500}}>
                    <div style={{flex: 1}} >{pydio.MessageHash['user_home.87']}</div>
                    {muiTheme.userTheme==='mui3' && <M3Tooltip title={<span style={{padding: '0 8px'}}>{pydio.MessageHash[list?'193':'192']}</span>}><span className={'mdi mdi-view-' + (list ? 'grid':'list')} onClick={()=>this.toggleList()} style={{cursor: 'pointer', fontSize: 16}}/></M3Tooltip>}
                </div>
                <div style={{overflowY: 'auto', flex: 1}}>
                    <div style={style}>
                        <PlaceHolder ready={!loading} showLoadingAnimation customPlaceholder={cardsPH}>
                            {cards}
                        </PlaceHolder>
                    </div>
                </div>
            </div>
        );


    }

}

SmartRecents = PydioContextConsumer(SmartRecents);
export {SmartRecents as default};