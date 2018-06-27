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

const React = require('react')
import Palette from '../board/Palette'
const Color = require('color')
const {asGridItem, NodeListCustomProvider} = require('pydio').requireLib('components')
const {FilePreview} = require('pydio').requireLib('workspaces')
const {Paper, IconButton} = require('material-ui')
const {muiThemeable} = require('material-ui/styles')
import Node from 'pydio/model/node'

const PALETTE_INDEX = 3;

/**
 * Show a list of recently accessed files or folders.
 * This list is stored by the server in the user preferences, and served by the feed plugin
 */
let RecentAccessCard = React.createClass({

    getDefaultProps: function(){
        return {colored: true};
    },

    getCorrectNode: function(node){
        const originalPath = node.getMetadata().get('original_path');
        const label = (!originalPath || originalPath === '/')  ? '' : node.getLabel();
        let targetNode = new Node(originalPath, node.isLeaf(), label);
        targetNode.setMetadata(node.getMetadata());
        return targetNode;
    },

    /**
     *
     * @param node AjxpNode
     */
    goTo: function(node){
        this.props.pydio.goTo(this.getCorrectNode(node));
    },

    renderIcon: function(node){
        node = this.getCorrectNode(node);
        if(node.getPath() === '/' || !node.getPath()){
            const label = node.getMetadata().get('repository_label').split(" ").map(function (word) {
                return word.substr(0, 1);
            }).slice(0, 3).join("");
            const color = new Color(this.props.muiTheme.palette.primary1Color).saturationl(18).lightness(44).toString();
            const light = new Color(this.props.muiTheme.palette.primary1Color).saturationl(15).lightness(94).toString();
            return (
                <div className="mimefont-container" style={{backgroundColor:light}}>
                    <div className="mimefont" style={{fontSize: 14, color:color}}>{label}</div>
                </div>
            );
        }else{
            return <FilePreview node={node} loadThumbnail={true}/>
        }
    },

    renderLabel: function(node, data){
        node = this.getCorrectNode(node);
        const path = node.getPath();
        const meta = node.getMetadata();
        if(!path || path === '/'){
            return <span style={{fontSize: 14}}>{meta.get('repository_label')} <span style={{opacity: 0.33}}> (Workspace)</span></span>;
        }else{
            const dir = PathUtils.getDirname(node.getPath());
            let dirSegment;
            if(dir){
                dirSegment = <span style={{opacity: 0.33}}> ({node.getPath()})</span>
            }
            if(node.isLeaf()){
                return <span><span style={{fontSize: 14}}>{node.getLabel()}</span>{dirSegment}</span>;
            }else{
                return <span><span style={{fontSize: 14}}>{'/' + node.getLabel()}</span>{dirSegment}</span>;
            }
        }
    },

    renderAction: function(node, data){
        node = this.getCorrectNode(node);
        return <span style={{position:'relative'}}><IconButton
            iconClassName="mdi mdi-chevron-right"
            tooltip="Open ... "
            onTouchTap={() => {this.goTo(node)}}
            style={{position:'absolute', right:0}}
        /></span>
    },

    renderFirstLine: function(node){
        node = this.getCorrectNode(node);
        if(!node.getPath() || node.getPath() === '/'){
            return node.getMetadata().get('repository_label');
        }else{
            return node.getLabel();
        }
    },

    renderSecondLine: function(node){
        node = this.getCorrectNode(node);
        const {longLegend} = this.props;
        const meta = node.getMetadata();
        const accessDate = meta.get('recent_access_readable');
        if(longLegend){
            if(!node.getPath() || node.getPath() === '/'){
                return 'Workspace opened on ' + accessDate;
            }else{
                return (
                    <span>
                        {meta.get('repository_label')}
                        {' - '}
                        {node.isLeaf() ? PathUtils.getDirname(node.getPath()) : node.getPath()}
                        {' - '}
                        {accessDate}
                    </span>);
            }
        }else{
            return accessDate;
        }
    },

    render: function(){
        const {colored} = this.props;
        const c = new Color(Palette[PALETTE_INDEX]);
        let title;
        if(!this.props.noTitle){
            if(colored){
                title = <div style={{backgroundColor:c.darken(0.1).toString(),color:'white', padding:'16px 0 16px 12px', fontSize:20}}>{this.props.pydio.MessageHash['user_home.87']}</div>;
            }else{
                title = <div style={{padding:'16px 0 16px 12px', fontSize:20}}>{this.props.pydio.MessageHash['user_home.87']}</div>;
            }
        }

        const displayMode = this.props.displayMode || 'list';

        if(displayMode === 'table'){
            return (
                <Paper zDepth={this.props.zDepth !== undefined ? this.props.zDepth : 1} {...this.props} className="vertical-layout" transitionEnabled={false}>
                    {this.getCloseButton()}
                    <NodeListCustomProvider
                        className="recently-accessed-list table-mode"
                        nodeProviderProperties={{get_action:"load_user_recent_items"}}
                        elementHeight={PydioComponents.SimpleList.HEIGHT_ONE_LINE}
                        nodeClicked={(node) => {this.goTo(node);}}
                        hideToolbar={true}
                        tableKeys={{
                            label:{renderCell:this.renderLabel, label:'Recently Accessed Files', width:'60%'},
                            recent_access_readable:{label:'Accessed', width:'20%'},
                            repository_label:{label:'Workspace', width:'20%'},
                        }}
                        entryRenderActions={this.renderAction}
                    />
                </Paper>
            );
        }else{
            return (
                <Paper zDepth={this.props.zDepth !== undefined ? this.props.zDepth :1} {...this.props} className={"vertical-layout " + (this.props.className || '')} transitionEnabled={false}>
                    {this.props.closeButton}
                    {title}
                    <NodeListCustomProvider
                        className={this.props.listClassName?this.props.listClassName:"recently-accessed-list files-list"}
                        style={{backgroundColor:colored?Palette[PALETTE_INDEX]:'transparent'}}
                        nodeProviderProperties={{get_action:"load_user_recent_items"}}
                        elementHeight={63}
                        nodeClicked={(node) => {this.goTo(node);}}
                        hideToolbar={true}
                        delayInitialLoad={700}
                        entryRenderFirstLine={this.renderFirstLine}
                        entryRenderSecondLine={this.renderSecondLine}
                        entryRenderIcon={this.renderIcon}
                        emptyStateProps={{
                            style: {paddingTop: 20, paddingBottom: 20},
                            iconClassName: 'mdi mdi-timer-off',
                            primaryTextId: 'History Empty',
                            secondaryTextId: 'This list will display recently accessed or consulted files and folders. Enter a workspace on the left.',
                            ...this.props.emptyStateProps
                        }}
                    />
                </Paper>
            );
        }
    }

});

RecentAccessCard = muiThemeable()(RecentAccessCard);
export {RecentAccessCard as default}