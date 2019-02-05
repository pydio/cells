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
import FilePreview from '../views/FilePreview'
import {muiThemeable} from 'material-ui/styles'
import PathUtils from 'pydio/util/path'
import Color from 'color'
import {RefreshIndicator, IconButton, Popover, List, ListItem} from 'material-ui'
import Pydio from 'pydio'
const {EmptyStateView} = Pydio.requireLib("components");
import PydioApi from 'pydio/http/api'
import {UserMetaServiceApi, RestUserBookmarksRequest} from 'pydio/http/rest-api'
import Node from 'pydio/model/node'


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

    renderIcon(node) {
        return (
            <FilePreview
                loadThumbnail={true}
                node={node}
                pydio={this.props.pydio}
                rounded={true}
            />
        );
    }

    renderSecondLine(node) {
        return node.getPath();
    }

    entryClicked(node) {
        this.handleRequestClose();
        this.props.pydio.goTo(node);
    }

    render() {
        const {pydio, muiTheme, iconStyle} = this.props;
        const {loading, open, anchorEl, bookmarks} = this.state;

        if(!pydio.user.activeRepository){
            return null;
        }
        let items;
        if (bookmarks) {
            items = bookmarks.map(n=>{
                return <ListItem
                    primaryText={PathUtils.getBasename(n.Path)}
                    secondaryText={n.AppearsIn.map(ws => ws.WsLabel).join(', ')}
                    onTouchTap={() => {
                        let path = n.AppearsIn[0].Path;
                        if(!path) {
                            path = '/';
                        }
                        const fakeNode = new Node(path, n.Type === 'LEAF');
                        fakeNode.getMetadata().set('repository_id', n.AppearsIn[0].WsUuid);
                        pydio.goTo(fakeNode);
                    }}
                />
            });
        }

        let buttonStyle = {borderRadius: '50%'};
        if(open){
            buttonStyle = {...buttonStyle, backgroundColor: 'rgba(255, 255, 255, 0.098)'}
        }

        return (
            <span>
                <IconButton
                    onTouchTap={this.handleTouchTap.bind(this)}
                    iconClassName={"userActionIcon mdi mdi-star-outline"}
                    tooltip={pydio.MessageHash['147']}
                    className="userActionButton"
                    iconStyle={iconStyle}
                    style={buttonStyle}
                />
                <Popover
                    open={open}
                    anchorEl={anchorEl}
                    anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                    targetOrigin={{horizontal: 'left', vertical: 'top'}}
                    onRequestClose={this.handleRequestClose.bind(this)}
                    style={{width:320}}
                    zDepth={2}

                >
                    <div style={{display: 'flex', alignItems: 'center', borderRadius:'2px 2px 0 0', padding: '12px 16px', width: '100%',
                        backgroundColor: 'rgb(238, 238, 238)', borderBottom: '1px solid rgb(224, 224, 224)'}}>{pydio.MessageHash[147]}</div>
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
                        <List style={{maxHeight:280, overflowY:'auto', padding: 0}}>{items}</List>
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
                </Popover>
            </span>
        );

    }

}


BookmarksList = muiThemeable()(BookmarksList);
export {BookmarksList as default}
