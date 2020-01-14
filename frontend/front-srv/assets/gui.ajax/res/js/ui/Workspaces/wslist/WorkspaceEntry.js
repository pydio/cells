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
const {muiThemeable} = require('material-ui/styles')
import Color from 'color'
import {CircularProgress, Popover, Dialog} from 'material-ui'
import { DragSource, DropTarget, flow } from 'react-dnd';
import DOMUtils from 'pydio/util/dom'

const Pydio = require('pydio');
const PydioApi = require('pydio/http/api');
const Node = require('pydio/model/node');
import ResourcesManager from 'pydio/http/resources-manager'
const {FoldersTree, DND, ChatIcon} = Pydio.requireLib('components');
const {withContextMenu} = Pydio.requireLib('hoc');

const { Types, collect, collectDrop, nodeDragSource, nodeDropTarget } = DND;


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

const Confirm = React.createClass({

    propTypes:{
        pydio       : React.PropTypes.instanceOf(Pydio),
        onDecline   : React.PropTypes.func,
        onAccept    : React.PropTypes.func,
        mode        : React.PropTypes.oneOf(['new_share','reject_accepted'])
    },

    render () {
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

        for (let key in this.props.replacements) {
            messageTitle = messageTitle.replace(new RegExp(key), this.props.replacements[key]);
            messageBody = messageBody.replace(new RegExp(key), this.props.replacements[key]);
        }

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
});

let WorkspaceEntry =React.createClass({

    propTypes:{
        pydio           : React.PropTypes.instanceOf(Pydio).isRequired,
        workspace       : React.PropTypes.instanceOf(Repository).isRequired,
        showFoldersTree : React.PropTypes.bool,
        onHoverLink     : React.PropTypes.func,
        onOutLink       : React.PropTypes.func
    },

    getInitialState(){
        return {
            openAlert:false,
            openFoldersTree: false,
            currentContextNode: this.props.pydio.getContextHolder().getContextNode()
        };
    },

    getLetterBadge(){
        return {__html:this.props.workspace.getHtmlBadge(true)};
    },

    componentDidMount(){
        if(this.props.showFoldersTree){
            this._monitorFolder = function(){
                this.setState({currentContextNode: this.props.pydio.getContextHolder().getContextNode()});
            }.bind(this);
            this.props.pydio.getContextHolder().observe("context_changed", this._monitorFolder);
        }
    },

    componentWillUnmount(){
        if(this._monitorFolder){
            this.props.pydio.getContextHolder().stopObserving("context_changed", this._monitorFolder);
        }
    },

    handleAccept () {
        this.props.workspace.setAccessStatus('accepted');
        this.handleCloseAlert();
        this.onClick();
    },

    handleDecline () {
        // Switching status to decline
        this.props.workspace.setAccessStatus('declined');
        this.props.pydio.fire("repository_list_refreshed", {
            list: this.props.pydio.user.getRepositoriesList(),
            active: this.props.pydio.user.getActiveRepository()
        });
        this.handleCloseAlert();
    },

    handleOpenAlert (mode = 'new_share', event) {
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
    },

    handleCloseAlert() {
        ReactDOM.unmountComponentAtNode(this.wrapper);
        this.wrapper.remove();
    },

    onClick() {
        if(this.props.workspace.getId() === this.props.pydio.user.activeRepository && this.props.showFoldersTree){
            this.props.pydio.goTo('/');
        }else{
            this.props.pydio.observeOnce('repository_list_refreshed', () => {this.setState({loading: false})});
            this.setState({loading: true});
            this.props.pydio.triggerRepositoryChange(this.props.workspace.getId());
        }
    },

    toggleFoldersPanelOpen(ev){
        ev.stopPropagation();
        this.setState({openFoldersTree: !this.state.openFoldersTree});
    },

    getRootItemStyle(node){
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
    },

    getItemStyle(node){
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
    },

    roomPopover(event){
        event.stopPropagation();
        const {target} = event;
        const offsetTop  = target.getBoundingClientRect().top;
        const viewportH = DOMUtils.getViewportHeight();
        const viewportW = DOMUtils.getViewportWidth();
        const popoverTop = (viewportH - offsetTop < 250);
        ResourcesManager.loadClassesAndApply(["ShareDialog"], () => {
            const popoverContent = (<ShareDialog.CellCard
                pydio={this.props.pydio}
                cellId={this.props.workspace.getId()}
                onDismiss={()=>{this.setState({popoverOpen: false})}}
                onHeightChange={()=>{this.setState({popoverHeight: 500})}}
                editorOneColumn={viewportW < 700}
            />);
            this.setState({popoverAnchor:target, popoverOpen: true, popoverContent:popoverContent, popoverTop: popoverTop, popoverHeight: null})
        });
    },

    render(){

        const {workspace, pydio, onHoverLink, onOutLink, showFoldersTree} = this.props;

        let current = (pydio.user.getActiveRepository() === workspace.getId()),
            currentClass="workspace-entry",
            messages = pydio.MessageHash,
            onHover, onOut, onClick,
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

        onClick = this.onClick;
        let chatIcon;

        if(workspace.getOwner()){
            additionalAction = (
                <span className="workspace-additional-action with-hover mdi mdi-dots-vertical" onClick={this.roomPopover.bind(this)}/>
            );
            if (!pydio.getPluginConfigs("action.advanced_settings").get("GLOBAL_DISABLE_CHATS")){
                chatIcon = <ChatIcon pydio={pydio} roomType={'WORKSPACE'} objectId={workspace.getId()}/>
            }
        }

        if (workspace.getOwner() && !workspace.getAccessStatus() && !workspace.getLastConnection()) {
            //newWorkspace = <Badge>NEW</Badge>;
            // Dialog for remote shares
            if (workspace.getRepositoryType() === "remote") {
                onClick = this.handleOpenAlert.bind(this, 'new_share');
            }
        }else if(workspace.getRepositoryType() === "remote" && !current){
            // Remote share but already accepted, add delete
            additionalAction = <span className="workspace-additional-action with-hover mdi mdi-close" onClick={this.handleOpenAlert.bind(this, 'reject_accepted')} title={messages['550']}/>;
        }

        if(this.state && this.state.loading){
            additionalAction = <CircularProgress size={20} thickness={3} style={{marginTop: 2, marginRight: 6, opacity: .5}}/>
        }

        const accent2 = this.props.muiTheme.palette.accent2Color;
        let icon = "mdi mdi-folder";
        let iconStyle = {
            fontSize: 20,
            marginRight: 10,
            opacity: 0.3
        };
        if(workspace.getRepositoryType() === "workspace-personal"){
            icon = "mdi mdi-folder-account"
        } else if(workspace.getRepositoryType() === "cell"){
            icon = "icomoon-cells";
            iconStyle = {...iconStyle, fontSize: 22};
        }

        let menuNode;
        if(workspace.getId() === pydio.user.activeRepository ){
            menuNode = pydio.getContextHolder().getRootNode();
            if(showFoldersTree){
                const children = menuNode.getChildren();
                let hasFolders = false;
                children.forEach(c => {
                    if(!c.isLeaf()) {
                        hasFolders = true;
                    }
                });
                if(hasFolders){
                    let toggleIcon = this.state.openFoldersTree ? "mdi mdi-chevron-down" : "mdi mdi-chevron-right";
                    treeToggle = <span style={{opacity: .3}} className={'workspace-additional-action ' + toggleIcon} onClick={this.toggleFoldersPanelOpen}></span>;
                }
            }
            iconStyle.opacity = 1;
            iconStyle.color = accent2;
        }else{
            menuNode = new Node('/', false, workspace.getLabel());
            menuNode.setRoot(true);
            const metaMap = new Map();
            metaMap.set('repository_id', workspace.getId());
            metaMap.set('workspaceEntry', workspace);
            menuNode.setMetadata(metaMap);
        }

        const {popoverOpen, popoverAnchor, popoverTop, popoverHeight} = this.state;
        let title = workspace.getLabel();
        if(workspace.getDescription()){
            title += ' - ' + workspace.getDescription();
        }
        const entryIcon = <span className={icon} style={iconStyle}/>;
        let wsBlock = (
            <ContextMenuWrapper
                node={menuNode}
                className={currentClass}
                onClick={onClick}
                onMouseOver={onHover}
                onMouseOut={onOut}
                style={style}
            >
                {entryIcon}
                <span className="workspace-label" title={title}>{workspace.getLabel()}</span>
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
                >{this.state.popoverContent}</Popover>
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

});

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
ContextMenuWrapper = withContextMenu(ContextMenuWrapper)
ContextMenuWrapper = DropTarget(Types.NODE_PROVIDER, nodeDropTarget, collectDrop)(ContextMenuWrapper);
WorkspaceEntry = muiThemeable()(WorkspaceEntry);

export {WorkspaceEntry as default}