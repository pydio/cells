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
import Color from 'color'
import PydioApi from 'pydio/http/api'
import MetaNodeProvider from 'pydio/model/meta-node-provider'
import FilePreview from '../views/FilePreview'
import {muiThemeable} from 'material-ui/styles'
import {RefreshIndicator, IconButton, Popover} from 'material-ui'
import {UserMetaServiceApi, RestUserBookmarksRequest, UpdateUserMetaRequestUserMetaOp, IdmUpdateUserMetaRequest, IdmSearchUserMetaRequest} from 'cells-sdk'

const {EmptyStateView} = Pydio.requireLib("components");

const listCss = `
.bmListEntry{
    border-bottom: 1px solid rgba(0,0,0,0.025);
    padding: 2px 0;
}
.bmListEntry:hover{
    background-color:#FAFAFA;
    border-bottom-color: #FAFAFA;
}
.bmListEntryWs:hover{
    text-decoration:underline;
}
`;

class BookmarksList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            loading: false,
            bookmarks: null
        };
    }

    load(){
        this.setState({loading: true});
        const api = new UserMetaServiceApi(PydioApi.getRestClient());
        return api.userBookmarks(new RestUserBookmarksRequest()).then(collection => {
            this.setState({bookmarks: collection.Nodes, loading: false})
        }).catch(reason => {
            this.setState({loading: false});
        });
    }


    handleTouchTap(event) {
        // This prevents ghost click.
        event.preventDefault();
        this.load();
        this.setState({
            open: true,
            anchorEl: event.currentTarget,
        });
    }

    handleRequestClose() {
        this.setState({
            open: false,
        });
    }

    entryClicked(node) {
        this.handleRequestClose();
        this.props.pydio.goTo(node);
    }

    removeBookmark(node){
        const nodeUuid = node.getMetadata().get("uuid");
        const api = new UserMetaServiceApi(PydioApi.getRestClient());
        const searchRequest = new IdmSearchUserMetaRequest();
        searchRequest.NodeUuids = [nodeUuid];
        searchRequest.Namespace = "bookmark";
        let request = new IdmUpdateUserMetaRequest();
        return api.searchUserMeta(searchRequest).then(res => {
            if (res.Metadatas && res.Metadatas.length) {
                request.Operation = UpdateUserMetaRequestUserMetaOp.constructFromObject('DELETE');
                request.MetaDatas = res.Metadatas;
                api.updateUserMeta(request).then(() => {
                    this.load();
                });
            }
        });
    }

    bmToNodes(bm){

        return bm.AppearsIn.map(ws => {
            const copy = {...bm};
            copy.Path = ws.WsSlug + '/' + ws.Path;
            const node = MetaNodeProvider.parseTreeNode(copy, ws.WsSlug);
            node.getMetadata().set('repository_id', ws.WsUuid);
            node.getMetadata().set('WsLabel', ws.WsLabel);
            return node;
        })
    }

    render() {
        const {pydio, muiTheme, iconStyle} = this.props;
        const {loading, open, anchorEl, bookmarks} = this.state;
        const previewStyles = {
                style: {
                    height: 40,
                    width: 40,
                    borderRadius: '50%',
                },
                mimeFontStyle: {
                    fontSize: 24,
                    lineHeight: '40px',
                    textAlign:'center'
                }
            };

        if(!pydio.user.activeRepository){
            return null;
        }
        let items;
        if (bookmarks) {
            items = bookmarks.map(n=>{
                const nodes = this.bmToNodes(n);
                return (
                    <div className={"bmListEntry"} style={{display:'flex', alignItems:'center', width: '100%'}}>
                        <div style={{padding: '12px 16px', cursor:'pointer'}} onClick={()=>{this.entryClicked(nodes[0])}}>
                            <FilePreview pydio={pydio} node={nodes[0]} loadThumbnail={true} {...previewStyles}/>
                        </div>
                        <div style={{flex: 1, overflow:'hidden', cursor:'pointer'}} onClick={()=>{this.entryClicked(nodes[0])}}>
                            <div style={{fontSize:15, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{nodes[0].getLabel()||nodes[0].getMetadata().get('WsLabel')}</div>
                            <div style={{opacity:.33}}>{pydio.MessageHash['bookmark.secondary.inside']} {nodes.map((n,i) => {
                                const click = (e) => {
                                    e.stopPropagation();
                                    this.entryClicked(n);
                                };
                                const link = <a className={"bmListEntryWs"} onClick={click} style={{fontWeight:500}}>{n.getMetadata().get('WsLabel')}</a>;
                                if(i === nodes.length - 1) {
                                    return link;
                                } else {
                                    return <span>{link}, </span>
                                }
                            })}</div>
                        </div>
                        <div>
                            <IconButton
                                iconClassName={"mdi mdi-delete"}
                                iconStyle={{opacity:.33, fontSize:18}}
                                onClick={() => {this.removeBookmark(nodes[0])}}
                                tooltip={pydio.MessageHash['bookmark.button.tip.remove']}
                                tooltipPosition={"bottom-left"}
                            />
                        </div>
                    </div>
                );

            });
        }

        let buttonStyle = {borderRadius: '50%'};
        if(open && iconStyle && iconStyle.color){
            const c = Color(iconStyle.color);
            buttonStyle = {...buttonStyle, backgroundColor: c.fade(0.9).toString()}
        }

        return (
            <span>
                <IconButton
                    onClick={this.handleTouchTap.bind(this)}
                    iconClassName={"userActionIcon mdi mdi-star"}
                    tooltip={pydio.MessageHash['147']}
                    tooltipPosition={"bottom-left"}
                    className="userActionButton"
                    iconStyle={iconStyle}
                    style={buttonStyle}
                />
                <Popover
                    open={open}
                    anchorEl={anchorEl}
                    anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                    targetOrigin={{horizontal: 'left', vertical: 'top'}}
                    onRequestClose={this.handleRequestClose.bind(this)}
                    style={{width:320}}
                    zDepth={3}

                >
                    <div style={{display: 'flex', alignItems: 'center', borderRadius:'2px 2px 0 0', width: '100%',
                        backgroundColor:'#f8fafc', borderBottom: '1px solid #ECEFF1', color:muiTheme.palette.primary1Color}}>
                        <span className={"mdi mdi-star"} style={{fontSize: 18, margin:'12px 8px 14px 16px'}}/>
                        <span style={{fontSize:15, fontWeight: 500}}>{pydio.MessageHash[147]}</span>
                    </div>
                    {loading &&
                        <div style={{height: 260, backgroundColor:'white'}}>
                            <RefreshIndicator
                                size={40}
                                left={140}
                                top={120}
                                status="loading"
                                style={{}}
                            />
                        </div>
                    }
                    {!loading && items && items.length &&
                        <div style={{maxHeight:330, overflowY:'auto', overflowX:'hidden', padding: 0}}>{items}</div>
                    }
                    {!loading && (!items || !items.length) &&
                        <EmptyStateView
                            pydio={pydio}
                            iconClassName="mdi mdi-star-outline"
                            primaryTextId="145"
                            secondaryTextId={"482"}
                            style={{minHeight: 260, backgroundColor:'white'}}
                        />
                    }
                    <style type={"text/css"} dangerouslySetInnerHTML={{__html:listCss}}/>
                </Popover>
            </span>
        );

    }

}


BookmarksList = muiThemeable()(BookmarksList);
export {BookmarksList as default}
