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
import React from "react";
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types';
import Pydio from "pydio";
import {muiThemeable} from "material-ui/styles";
import Color from 'color'
import {CircularProgress, Popover, Dialog, Menu} from 'material-ui'
import { DropTarget} from 'react-dnd';
import Node from "pydio/model/node";
import DOMUtils from 'pydio/util/dom'
import ResourcesManager from 'pydio/http/resources-manager'
const {FoldersTree, DND, ChatIcon} = Pydio.requireLib('components');
import MetaNodeProvider from 'pydio/model/meta-node-provider'
import WorkspaceCard from "./WorkspaceCard";
import ContextMenuModel from 'pydio/model/context-menu'

const { Types, collectDrop, nodeDropTarget } = DND;


let Badge = ({children, muiTheme}) => {

    const style = {
        display: "inline-block",
        backgroundColor: muiTheme.palette.accent1Color,
        color: 'white',

        fontSize: 10,
        borderRadius: 6,
        padding: '0 5px',
        marginLeft: 5,
        height: 16,
        lineHeight: '17px',
        fontWeight: 500
    };

    return <span style={style}>{children}</span>

};

Badge = muiThemeable()(Badge);

class Confirm extends React.Component {
    static propTypes = {
        pydio       : PropTypes.instanceOf(Pydio),
        onDecline   : PropTypes.func,
        onAccept    : PropTypes.func,
        mode        : PropTypes.oneOf(['new_share','reject_accepted'])
    };

    render() {
        let messages = this.props.pydio.MessageHash,
            messageTitle = messages[545],
            messageBody = messages[546],
            actions = [
                { text: messages[548], ref: 'decline', onClick: this.props.onDecline},
                { text: messages[547], ref: 'accept', onClick: this.props.onAccept}
            ];
        if(this.props.mode === 'reject_accepted'){
            messageBody = messages[549];
            actions = [
                { text: messages[54], ref: 'decline', onClick: this.props.onDecline},
                { text: messages[551], ref: 'accept', onClick: this.props.onAccept}
            ];
        }

        Object.keys(this.props.replacements).forEach((key) => {
            messageTitle = messageTitle.replace(new RegExp(key), this.props.replacements[key]);
            messageBody = messageBody.replace(new RegExp(key), this.props.replacements[key]);
        });

        // TODO Retest this component as Dialog replace legacy materialui dialog
        return <div className='react-mui-context' style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'transparent'}}>
            <Dialog
                title={messageTitle}
                actions={actions}
                modal={false}
                dismissOnClickAway={true}
                onDismiss={this.props.onDismiss.bind(this)}
                open={true}
            >
                {messageBody}
            </Dialog>
        </div>
    }
}

class WorkspaceEntry extends React.Component {
    static propTypes = {
        pydio           : PropTypes.instanceOf(Pydio).isRequired,
        workspace       : PropTypes.instanceOf(Repository).isRequired,
        showFoldersTree : PropTypes.bool,
        onHoverLink     : PropTypes.func,
        onOutLink       : PropTypes.func
    };

    state = {
        openAlert:false,
        openFoldersTree: false,
        currentContextNode: this.props.pydio.getContextHolder().getContextNode()
    };

    getLetterBadge = () => {
        return {__html:this.props.workspace.getHtmlBadge(true)};
    };

    componentDidMount() {
        if(this.props.showFoldersTree){
            this._monitorFolder = function(){
                this.setState({currentContextNode: this.props.pydio.getContextHolder().getContextNode()});
            }.bind(this);
            this.props.pydio.getContextHolder().observe("context_changed", this._monitorFolder);
        }
    }

    componentWillUnmount() {
        if(this._monitorFolder){
            this.props.pydio.getContextHolder().stopObserving("context_changed", this._monitorFolder);
        }
    }

    handleAccept = () => {
        this.props.workspace.setAccessStatus('accepted');
        this.handleCloseAlert();
        this.onClick();
    };

    handleDecline = () => {
        // Switching status to decline
        this.props.workspace.setAccessStatus('declined');
        this.props.pydio.fire("repository_list_refreshed", {
            list: this.props.pydio.user.getRepositoriesList(),
            active: this.props.pydio.user.getActiveRepository()
        });
        this.handleCloseAlert();
    };

    handleOpenAlert = (mode = 'new_share', event) => {
        event.stopPropagation();
        this.wrapper = document.body.appendChild(document.createElement('div'));
        this.wrapper.style.zIndex = 11;
        const replacements = {
            '%%OWNER%%': this.props.workspace.getOwner()
        };
        ReactDOM.render(
            <Confirm
                {...this.props}
                mode={mode}
                replacements={replacements}
                onAccept={mode === 'new_share' ? this.handleAccept.bind(this) : this.handleDecline.bind(this)}
                onDecline={mode === 'new_share' ? this.handleDecline.bind(this) : this.handleCloseAlert.bind(this)}
                onDismiss={this.handleCloseAlert}
            />, this.wrapper);
    };

    handleCloseAlert = () => {
        ReactDOM.unmountComponentAtNode(this.wrapper);
        this.wrapper.remove();
    };

    onClick(){
        const {workspace, pydio, showFoldersTree, searchView, values, setValues, searchLoading} = this.props;
        if(searchView) {
            let scope = workspace.getSlug()
            if(scope !== 'all' && scope !== 'previous_context'){
                scope += '/'
            }
            setValues({...values, scope});
        } else if(workspace.getId() === pydio.user.activeRepository && showFoldersTree){
            pydio.goTo('/');
        }else{
            pydio.observeOnce('repository_list_refreshed', () => {this.setState({loading: false})});
            this.setState({loading: true});
            pydio.triggerRepositoryChange(workspace.getId());
        }
    }

    toggleFoldersPanelOpen = (ev) => {
        ev.stopPropagation();
        this.setState({openFoldersTree: !this.state.openFoldersTree});
    };

    getRootItemStyle = (node) => {
        const isContext = this.props.pydio.getContextHolder().getContextNode() === node;
        const accent2 = this.props.muiTheme.palette.accent2Color;
        if(isContext){
            return {
                borderLeft: '4px solid ' + accent2,
                paddingLeft: 12
            };
        } else {
            return {};
        }
    };

    getItemStyle = (node) => {
        const isContext = this.props.pydio.getContextHolder().getContextNode() === node;
        const accent2 = this.props.muiTheme.palette.accent2Color;
        if(isContext){
            return {
                color: 'rgba(0,0,0,.77)',
                fontWeight: 500,
                backgroundColor: Color(accent2).fade(.9).toString()
            };
        }
        const isSelected = this.props.pydio.getContextHolder().getSelectedNodes().indexOf(node) !== -1;
        if(isSelected){
            return {
                /*backgroundColor: Color(accent2).fade(.9).toString()*/
                color: accent2,
                fontWeight: 500,
            }
        }
        return {};
    };

    onContextMenu(event, menuNode) {

        event.preventDefault()
        event.stopPropagation()
        this.workspacePopover(event, menuNode);

    }

    workspacePopoverNode = (workspace, menuNode = undefined) => {
        if(menuNode){
            return Promise.resolve(menuNode)
        }
        return MetaNodeProvider.loadRoots([workspace.getSlug()]).then(results => {
            if(results && results[workspace.getSlug()]) {
                return results[workspace.getSlug()]
            }  else {
                const fakeNode = new Node('/', false, workspace.getLabel());
                fakeNode.setRoot(true);
                fakeNode.getMetadata().set('repository_id', workspace.getId());
                fakeNode.getMetadata().set('workspaceEntry', workspace);
                return fakeNode;
            }
        })
    };

    workspacePopover = (event, menuNode = undefined) => {
        const {pydio, workspace} = this.props;
        event.stopPropagation();
        const {target} = event;
        const offsetTop  = target.getBoundingClientRect().top;
        const viewportH = DOMUtils.getViewportHeight();
        const popoverTop = (viewportH - offsetTop < 250);
        this.workspacePopoverNode(workspace, menuNode).then(n => {
            if(workspace.getOwner()){
                ResourcesManager.loadClassesAndApply(["ShareDialog"], () => {
                    const popoverContent = (<ShareDialog.CellCard
                        pydio={pydio}
                        cellId={workspace.getId()}
                        onDismiss={()=>{this.setState({popoverOpen: false})}}
                        onHeightChange={()=>{this.setState({popoverHeight: 500})}}
                        editorOneColumn={true}
                        rootNode={n}
                    />);
                    this.setState({popoverAnchor:target, popoverOpen: true, popoverContent:popoverContent, popoverTop: popoverTop, popoverHeight: null})
                });
            } else{
                const popoverContent = (
                    <WorkspaceCard
                        pydio={pydio}
                        workspace={workspace}
                        rootNode={n}
                        onDismiss={()=>{this.setState({popoverOpen: false})}}
                    />
                );
                this.setState({popoverAnchor:target, popoverOpen: true, popoverContent:popoverContent, popoverTop: popoverTop, popoverHeight: null})
            }
        });
    };

    render() {

        const {workspace, pydio, onHoverLink, onOutLink, showFoldersTree, searchView, values, setValues, searchLoading} = this.props;

        let current, isSearchAll;
        if(searchView) {
            if(workspace.getSlug() === 'all' || workspace.getSlug() === 'previous_context') {
                current = values.scope === workspace.getSlug()
                isSearchAll = true
            } else {
                current = values.scope && values.scope.indexOf(workspace.getSlug() + '/') === 0
            }
        } else {
            current = (pydio.user.getActiveRepository() === workspace.getId())
        }

        let currentClass="workspace-entry",
            onHover, onOut,
            additionalAction,
            treeToggle;

        let style = {};

        if (current) {
            currentClass +=" workspace-current";
            style = this.getRootItemStyle(pydio.getContextHolder().getContextNode());
        }
        style = {paddingLeft: 16, ...style};

        currentClass += " workspace-access-" + workspace.getAccessType();

        if (onHoverLink) {
            onHover = function(event){
                onHoverLink(event, workspace)
            }.bind(this);
        }

        if (onOutLink) {
            onOut = function(event){
                onOutLink(event, workspace)
            }.bind(this);
        }

        let chatIcon;

        const accent2 = this.props.muiTheme.palette.accent2Color;
        let icon = "mdi mdi-folder";
        let iconStyle = {
            fontSize: 20,
            marginRight: 10,
            opacity: 0.3
        };
        if(searchView) {
            icon = isSearchAll ? 'mdi mdi-folder-multiple' : 'mdi mdi-folder'
            if(!current) {
                icon += '-outline'
            }
        } else if(workspace.getRepositoryType() === "workspace-personal"){
            icon = "mdi mdi-folder-account"
        } else if(workspace.getRepositoryType() === "cell"){
            icon = "icomoon-cells";
            iconStyle = {...iconStyle, fontSize: 22};
        }

        let menuNode;
        let popoverNode;
        if(current && !searchView) {
            menuNode = pydio.getContextHolder().getRootNode();
            if (showFoldersTree) {
                if(menuNode.isLoading()){
                    menuNode.observeOnce("loaded", () => {this.forceUpdate()});
                }
                const children = menuNode.getChildren();
                let hasFolders = false;
                children.forEach(c => {
                    if (!c.isLeaf()) {
                        hasFolders = true;
                    }
                });
                if (hasFolders) {
                    let toggleIcon = this.state.openFoldersTree ? "mdi mdi-chevron-down" : "mdi mdi-chevron-right";
                    treeToggle = <span style={{opacity: .3}} className={'workspace-additional-action ' + toggleIcon}
                                       onClick={this.toggleFoldersPanelOpen}></span>;
                }
            }
            iconStyle.opacity = 1;
            iconStyle.color = accent2;
            popoverNode = menuNode;
        }else{
            menuNode = new Node('/', false, workspace.getLabel());
            menuNode.setRoot(true);
            menuNode.getMetadata().set('repository_id', workspace.getId());
            menuNode.getMetadata().set('workspaceEntry', workspace);
        }

        const {popoverOpen, popoverAnchor, popoverTop, popoverHeight, loading} = this.state;

        if(loading){
            additionalAction = <CircularProgress size={20} thickness={2} style={{marginTop: 2, marginRight: 6, opacity: .5}}/>
        } else if (!searchView) {
            const addStyle = popoverOpen ? {opacity:1} : {};
            if(popoverOpen){
                style = {...style, backgroundColor:'rgba(133, 133, 133, 0.1)'}
            }
            additionalAction = (
                <span
                    className="workspace-additional-action with-hover mdi mdi-dots-vertical"
                    onClick={(e) => this.workspacePopover(e, popoverNode)}
                    style={addStyle}
                />
            );
        }

        if (!searchView && workspace.getOwner() && !pydio.getPluginConfigs("action.advanced_settings").get("GLOBAL_DISABLE_CHATS")){
            chatIcon = <ChatIcon pydio={pydio} roomType={'WORKSPACE'} objectId={workspace.getId()}/>
        }

        let title = workspace.getLabel();
        let label = workspace.getLabel();
        if(workspace.getDescription()){
            title += ' - ' + workspace.getDescription();
        }
        if(searchView){
            let count = 0;
            const results = pydio.getContextHolder().getSearchNode().getChildren();
            if(workspace.getSlug() === 'all') {
                count = results.size;
            } else {
                results.forEach(node => {
                    if(node.getMetadata().get('repository_id') === workspace.getId() || workspace.getSlug() === 'previous_context'){
                        count ++;
                    }
                })
            }
            const crtScopeAll = values.scope === 'all'
            if(count && (crtScopeAll || current)) {
                label += ' (' + count + ')'
            }
        }
        const entryIcon = <span className={icon} style={iconStyle}/>;
        let wsBlock = (
            <ContextMenuWrapper
                node={menuNode}
                className={currentClass}
                onClick={this.onClick.bind(this)}
                onMouseOver={onHover}
                onMouseOut={onOut}
                onContextMenu={(event) => this.onContextMenu(event, popoverNode)}
                style={style}
            >
                {entryIcon}
                <span className="workspace-label" title={title}>{label}</span>
                {chatIcon}
                {treeToggle}
                <span style={{flex: 1}}></span>
                {additionalAction}
                <Popover
                    open={popoverOpen}
                    anchorEl={popoverAnchor}
                    useLayerForClickAway={true}
                    autoCloseWhenOffScreen={false}
                    canAutoPosition={true}
                    onRequestClose={() => {this.setState({popoverOpen: false})}}
                    anchorOrigin={{horizontal:"right",vertical:popoverTop?"bottom":"center"}}
                    targetOrigin={{horizontal:"left",vertical:popoverTop?"bottom":"center"}}
                    zDepth={3}
                    style={{overflow:'hidden', borderRadius: 10, height: popoverHeight}}
                ><Menu style={{maxWidth:350}} listStyle={{paddingBottom: 0, paddingTop: 0}}>{this.state.popoverContent}</Menu></Popover>
            </ContextMenuWrapper>
        );

        if(showFoldersTree){
            return (
                <div>
                    {wsBlock}
                    <FoldersTree
                        pydio={pydio}
                        dataModel={pydio.getContextHolder()}
                        className={this.state.openFoldersTree?"open":"closed"}
                        draggable={true}
                        getItemStyle={this.getItemStyle}
                    />
                </div>
            )
        }else{
            return wsBlock;
        }

    }
}

let ContextMenuWrapper = (props) => {

    const {canDrop, isOver, connectDropTarget} = props;
    let className = props.className || '';
    if(canDrop && isOver){
        className += ' droppable-active';
    }
    return (
        <div
            {...props}
            className={className}
            ref={instance => {
                const node = ReactDOM.findDOMNode(instance)
                if (typeof connectDropTarget === 'function') connectDropTarget(node)
            }}
        />
    )
}
//ContextMenuWrapper = withContextMenu(ContextMenuWrapper)
ContextMenuWrapper = DropTarget(Types.NODE_PROVIDER, nodeDropTarget, collectDrop)(ContextMenuWrapper);
WorkspaceEntry = muiThemeable()(WorkspaceEntry);

export {WorkspaceEntry as default}