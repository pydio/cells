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

import { Types, collect, collectDrop, nodeDragSource, nodeDropTarget } from '../util/DND';
import dnd from 'react-dnd'
import React from 'react';
import ReactDOM from 'react-dom'
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Pydio from 'pydio';
import {Checkbox, CircularProgress, IconButton} from 'material-ui'
const {withContextMenu} = Pydio.requireLib('hoc');
import {muiThemeable} from 'material-ui/styles'

let ContextMenuWrapper = (props) => {
    return (
        <div {...props} />
    )
};
ContextMenuWrapper = withContextMenu(ContextMenuWrapper);


/**
 * Tree Node
 */
var SimpleTreeNode = createReactClass({
    displayName: 'SimpleTreeNode',

    propTypes:{
        collapse:PropTypes.bool,
        forceExpand:PropTypes.bool,
        childrenOnly:PropTypes.bool,
        depth:PropTypes.number,
        onNodeSelect:PropTypes.func,
        node:PropTypes.instanceOf(AjxpNode),
        dataModel:PropTypes.instanceOf(PydioDataModel),
        forceLabel:PropTypes.string,
        // Optional currently selected detection
        nodeIsSelected: PropTypes.func,
        showLoader:PropTypes.bool,
        // Optional checkboxes
        checkboxes:PropTypes.array,
        checkboxesValues:PropTypes.object,
        checkboxesComputeStatus:PropTypes.func,
        onCheckboxCheck:PropTypes.func,
        paddingOffset:PropTypes.number,
    },

    getDefaultProps:function(){
        return {
            collapse: false,
            childrenOnly: false,
            depth:0,
            paddingOffset: 0,
            onNodeSelect: function(node){}
        }
    },

    listenToNode: function(node){
        this._childrenListener = function(){
            if(!this.isMounted()) {
                return;
            }
            this.setState({children:this._nodeToChildren(node)});
        }.bind(this);
        this._nodeListener = function(){
            if(!this.isMounted()) {
                return;
            }
            this.forceUpdate();
        }.bind(this);
        node.observe("child_added", this._childrenListener);
        node.observe("child_removed", this._childrenListener);
        node.observe("loaded", this._childrenListener);
        node.observe("loading", this._nodeListener);
        node.observe("node_replaced", this._nodeListener);
    },

    stopListening: function(node){
        node.stopObserving("child_added", this._childrenListener);
        node.stopObserving("child_removed", this._childrenListener);
        node.stopObserving("loaded", this._childrenListener);
        node.stopObserving("loading", this._nodeListener);
        node.stopObserving("node_replaced", this._nodeListener);
    },

    componentDidMount: function(){
        this.listenToNode(this.props.node);
    },

    componentWillUnmount:function(){
        this.stopListening(this.props.node);
    },

    componentWillReceiveProps: function(nextProps){
        var oldNode = this.props.node;
        var newNode = nextProps.node;
        if(newNode === oldNode && newNode.getMetadata().get("paginationData")){
            var remapedChildren = this.state.children.map(function(c){c.setParent(newNode);return c;});
            var remapedPathes = this.state.children.map(function(c){return c.getPath()});
            var newChildren = this._nodeToChildren(newNode);
            newChildren.forEach(function(nc){
                if(remapedPathes.indexOf(nc.getPath()) === -1){
                    remapedChildren.push(nc);
                }
            });
            this.setState({children:remapedChildren});
        }else{
            this.setState({children:this._nodeToChildren(newNode)});
        }
        if(newNode !== oldNode){
            this.stopListening(oldNode);
            this.listenToNode(newNode);
        }
    },

    getInitialState: function(){
        return {
            showChildren: !this.props.collapse || this.props.forceExpand,
            children:this._nodeToChildren(this.props.node)
        };
    },

    _nodeToChildren:function(){
        var children = [];
        this.props.node.getChildren().forEach(function(c){
            if(!c.isLeaf() || c.getAjxpMime() === 'ajxp_browsable_archive') {
                children.push(c);
            }
        });
        const sortFunction = (nodeA, nodeB) => {
            // Recycle always last
            if(nodeA.isRecycle()) {
                return 1;
            }
            if(nodeB.isRecycle()) {
                return -1;
            }
            return nodeA.getLabel().localeCompare(nodeB.getLabel(), undefined, {numeric: true});
        };
        children.sort(sortFunction);

        return children;
    },

    onNodeSelect: function (ev) {
        if (this.props.onNodeSelect) {
            this.props.onNodeSelect(this.props.node);
        }
        ev.preventDefault();
        ev.stopPropagation();
    },

    onChildDisplayToggle: function (ev) {
        if (this.props.node.getChildren().size) {
            this.setState({showChildren: !this.state.showChildren});
        }
        ev.preventDefault();
        ev.stopPropagation();
    },

    nodeIsSelected: function(n){
        if(this.props.nodeIsSelected) {
            return this.props.nodeIsSelected(n);
        } else {
            return (this.props.dataModel.getSelectedNodes().indexOf(n) !== -1);
        }
    },

    render: function () {
        const {node, dataModel, childrenOnly, canDrop, isOverCurrent,
            checkboxes, checkboxesComputeStatus, checkboxesValues, onCheckboxCheck,
            depth, paddingOffset, forceExpand, selectedItemStyle, getItemStyle, getRightIcon, forceLabel, showLoader, noPaginator} = this.props;
        const hasFolderChildrens = !!this.state.children.length;
        let hasChildren;
        if(hasFolderChildrens){
            hasChildren = (
                <span onClick={this.onChildDisplayToggle}>
                {this.state.showChildren || forceExpand?
                    <span className="tree-icon mdi mdi-chevron-down"></span>:
                    <span className="tree-icon mdi mdi-chevron-right"></span>
                }
                </span>);
        }else{
            let cname = "tree-icon mdi mdi-chevron-right";
            if(node.isLoaded()){
                cname += " no-folder-children";
            }
            hasChildren = <span className={cname}></span>;
        }
        var isSelected = (this.nodeIsSelected(node) ? 'mui-menu-item mui-is-selected' : 'mui-menu-item');
        var selfLabel;
        if(!childrenOnly){
            if(canDrop && isOverCurrent){
                isSelected += ' droppable-active';
            }
            var boxes;
            if(checkboxes){
                var values = {}, inherited = false, disabled = {}, additionalClassName = '';
                if(checkboxesComputeStatus){
                    var status = checkboxesComputeStatus(node);
                    values = status.VALUES;
                    inherited = status.INHERITED;
                    disabled = status.DISABLED;
                    if(status.CLASSNAME) {
                        additionalClassName = ' ' + status.CLASSNAME;
                    }
                }else if(checkboxesValues && checkboxesValues[node.getPath()]){
                    values = checkboxesValues[node.getPath()];
                }
                var valueClasses = [];
                boxes = checkboxes.map(function(c){
                    const selected = values[c] === undefined ? false : values[c];
                    const click = function(event, value){
                        onCheckboxCheck(node, c, value);
                    }.bind(this);
                    if(selected) {
                        valueClasses.push(c);
                    }
                    return (
                        <Checkbox
                            name={c}
                            key={c+"-"+(selected?"true":"false")}
                            checked={selected}
                            onCheck={click}
                            disabled={disabled[c]}
                            className={"cbox-" + c}
                            style={{width: 44}}
                        />
                    );
                }.bind(this));
                isSelected += inherited?" inherited ":"";
                isSelected += valueClasses.length ? (" checkbox-values-" + valueClasses.join('-')) : " checkbox-values-empty";
                boxes = <div style={{display:'flex', alignItems:'center'}} className={"tree-checkboxes" + additionalClassName}>{boxes}</div>;
            }
            let itemStyle = {paddingLeft:(paddingOffset + depth*20)};
            if(this.nodeIsSelected(node) && selectedItemStyle){
                itemStyle = {...itemStyle, ...selectedItemStyle};
            }
            if(getItemStyle){
                itemStyle = {...itemStyle, ...getItemStyle(node)};
            }
            let rightIcon;
            if(getRightIcon) {
                rightIcon = getRightIcon(node);
            }
            let icon = 'mdi mdi-folder';
            const ajxpMime = node.getAjxpMime();
            if(ajxpMime === 'ajxp_browsable_archive'){
                icon = 'mdi mdi-archive';
            }else if(ajxpMime === 'ajxp_recycle'){
                icon = 'mdi mdi-delete';
            }
            let loader;
            if(showLoader && node.isLoading()) {
                loader = <CircularProgress size={14} style={{marginLeft:7}} thickness={1}/>
            }
            selfLabel = (
                <ContextMenuWrapper node={node} className={'tree-item ' + isSelected + (boxes?' has-checkboxes':'')} style={itemStyle}>
                    <div className="tree-item-label" style={{display:'flex', alignItems: 'center'}} onClick={this.onNodeSelect} title={node.getLabel()}
                         data-id={node.getPath()}>
                        {hasChildren}
                        <span className={"tree-icon " + icon}/>
                        <span style={{flex:1}}>{forceLabel?forceLabel:node.getLabel()}</span>
                        {loader}
                        {rightIcon}
                    </div>
                    {boxes}
                </ContextMenuWrapper>
            );
        }

        var children = [];
        let connector = (instance) => instance;
        let draggable = false;
        if(dnd && this.props.connectDropTarget && this.props.connectDragSource){
            let connectDragSource = this.props.connectDragSource;
            let connectDropTarget = this.props.connectDropTarget;
            connector = (instance) => {
                connectDragSource(ReactDOM.findDOMNode(instance));
                connectDropTarget(ReactDOM.findDOMNode(instance));
            };
            draggable = true;
        }

        if(this.state.showChildren || forceExpand){
            children = this.state.children.map(function(child) {
                const props = {...this.props,
                    forceLabel: null,
                    childrenOnly:false,
                    key:child.getPath(),
                    node:child,
                    depth:depth+1
                };
                return React.createElement(draggable?DragDropTreeNode:SimpleTreeNode, props);
            }.bind(this));
        }
        return (
            <li ref={connector} className={"treenode" + node.getPath().replace(/\//g, '_')}>
                {selfLabel}
                <ul>
                    {!noPaginator && node.getMetadata().has('paginationData') && parseInt(node.getMetadata().get('paginationData').get('total')) > 1 &&
                    <TreePaginator node={node} dataModel={dataModel} depth={depth+1} paddingOffset={paddingOffset}/>
                    }
                    {children}
                </ul>
            </li>
        );
    },
});

let DragDropTreeNode = SimpleTreeNode;
if(dnd){
    DragDropTreeNode = dnd.flow(
        dnd.DragSource(Types.NODE_PROVIDER, nodeDragSource, collect),
        dnd.DropTarget(Types.NODE_PROVIDER, nodeDropTarget, collectDrop)
    )(SimpleTreeNode);
}

class TreePaginator extends React.Component {

    goTo(i){
        const {dataModel, node} = this.props;
        node.getMetadata().get('paginationData').set('new_page', i);
        dataModel.requireContextChange(node);
    }

    render(){
        const {node, depth, paddingOffset, muiTheme} = this.props;
        const icProps = {
            style:{width: 24, height: 24, padding: 0}
        };
        const data = node.getMetadata().get('paginationData');
        const crt = data.get('current');
        const total = data.get('total');
        const pageWord = Pydio.getMessages()['331'];
        const label = pageWord + ' ' + crt + ' / ' + total;
        return (
            <li>
                <div style={{paddingLeft: paddingOffset + depth * 20, paddingTop:5, paddingBottom: 5, display:'flex', alignItems:'center'}}>
                    <div style={{paddingLeft: 14, paddingRight: 6, color: 'rgba(0,0,0,.43)'}} className={"mdi mdi-format-list-bulleted"}/>
                    <div style={{display:'flex', alignItems:'center', color:'rgba(0,0,0,.73)', backgroundColor:'rgba(0,0,0,0.02)', borderRadius: 3, marginRight: 10}}>
                        <IconButton iconClassName={"mdi mdi-chevron-left"} onClick={()=>{this.goTo(crt -1 )}} disabled={crt === 1} {...icProps}/>
                        <div style={{padding: '0 20px', flex:1, textAlign:'center', fontSize: 13}}>{label}</div>
                        <IconButton iconClassName={"mdi mdi-chevron-right"} onClick={()=>{this.goTo(crt + 1 )}} disabled={crt === total} {...icProps}/>
                    </div>
                </div>
            </li>
        );
    }

}

TreePaginator = muiThemeable()(TreePaginator);


/**
 * Simple openable / loadable tree taking AjxpNode as inputs
 */
class DNDTreeView extends React.Component {
    static propTypes = {
        showRoot:PropTypes.bool,
        rootLabel:PropTypes.string,
        onNodeSelect:PropTypes.func,
        node:PropTypes.instanceOf(AjxpNode).isRequired,
        dataModel:PropTypes.instanceOf(PydioDataModel).isRequired,
        selectable:PropTypes.bool,
        selectableMultiple:PropTypes.bool,
        initialSelectionModel:PropTypes.array,
        onSelectionChange:PropTypes.func,
        forceExpand:PropTypes.bool,
        // Optional currently selected detection
        nodeIsSelected: PropTypes.func,
        showLoader:PropTypes.bool,
        // Optional checkboxes
        checkboxes:PropTypes.array,
        checkboxesValues:PropTypes.object,
        checkboxesComputeStatus:PropTypes.func,
        onCheckboxCheck:PropTypes.func,
        paddingOffset:PropTypes.number
    };

    static defaultProps = {
        showRoot:true,
        onNodeSelect: this.onNodeSelect
    };

    onNodeSelect = (node) => {
        if(this.props.onNodeSelect){
            this.props.onNodeSelect(node);
        }else{
            this.props.dataModel.setSelectedNodes([node]);
        }
    };

    render() {
        return(
            <ul className={this.props.className}>
                <DragDropTreeNode
                    childrenOnly={!this.props.showRoot}
                    forceExpand={this.props.forceExpand}
                    node={this.props.node?this.props.node:this.props.dataModel.getRootNode()}
                    dataModel={this.props.dataModel}
                    onNodeSelect={this.onNodeSelect}
                    nodeIsSelected={this.props.nodeIsSelected}
                    forceLabel={this.props.rootLabel}
                    checkboxes={this.props.checkboxes}
                    checkboxesValues={this.props.checkboxesValues}
                    checkboxesComputeStatus={this.props.checkboxesComputeStatus}
                    onCheckboxCheck={this.props.onCheckboxCheck}
                    selectedItemStyle={this.props.selectedItemStyle}
                    getItemStyle={this.props.getItemStyle}
                    getRightIcon={this.props.getRightIcon}
                    paddingOffset={this.props.paddingOffset}
                    noPaginator={this.props.noPaginator}
                    showLoader={this.props.showLoader}
                />
            </ul>
        )
    }
}

class TreeView extends React.Component {
    static propTypes = {
        showRoot:PropTypes.bool,
        rootLabel:PropTypes.string,
        onNodeSelect:PropTypes.func,
        node:PropTypes.instanceOf(AjxpNode).isRequired,
        dataModel:PropTypes.instanceOf(PydioDataModel).isRequired,
        selectable:PropTypes.bool,
        selectableMultiple:PropTypes.bool,
        initialSelectionModel:PropTypes.array,
        onSelectionChange:PropTypes.func,
        forceExpand:PropTypes.bool,
        // Optional currently selected detection
        nodeIsSelected: PropTypes.func,
        showLoader:PropTypes.bool,
        // Optional checkboxes
        checkboxes:PropTypes.array,
        checkboxesValues:PropTypes.object,
        checkboxesComputeStatus:PropTypes.func,
        onCheckboxCheck:PropTypes.func,
        paddingOffset:PropTypes.number
    };

    static defaultProps = {
        showRoot:true,
        onNodeSelect: this.onNodeSelect
    };

    onNodeSelect = (node) => {
        if(this.props.onNodeSelect){
            this.props.onNodeSelect(node);
        }else{
            this.props.dataModel.setSelectedNodes([node]);
        }
    };

    render() {
        return(
            <ul className={this.props.className}>
                <SimpleTreeNode
                    childrenOnly={!this.props.showRoot}
                    forceExpand={this.props.forceExpand}
                    node={this.props.node?this.props.node:this.props.dataModel.getRootNode()}
                    dataModel={this.props.dataModel}
                    onNodeSelect={this.onNodeSelect}
                    nodeIsSelected={this.props.nodeIsSelected}
                    forceLabel={this.props.rootLabel}
                    checkboxes={this.props.checkboxes}
                    checkboxesValues={this.props.checkboxesValues}
                    checkboxesComputeStatus={this.props.checkboxesComputeStatus}
                    onCheckboxCheck={this.props.onCheckboxCheck}
                    selectedItemStyle={this.props.selectedItemStyle}
                    getItemStyle={this.props.getItemStyle}
                    getRightIcon={this.props.getRightIcon}
                    paddingOffset={this.props.paddingOffset}
                    showLoader={this.props.showLoader}
                />
            </ul>
        )
    }
}

class FoldersTree extends React.Component {
    static propTypes = {
        pydio: PropTypes.instanceOf(Pydio).isRequired,
        dataModel: PropTypes.instanceOf(PydioDataModel).isRequired,
        className: PropTypes.string,
        onNodeSelected: PropTypes.func,
        draggable:PropTypes.bool,
        rootLabel: PropTypes.string
    };

    nodeObserver = () => {
        let r = this.props.dataModel.getRootNode();
        if(!r.isLoaded()) {
            r.observeOnce("loaded", function(){
                this.forceUpdate();
            }.bind(this));
        }else{
            this.forceUpdate();
        }
    };

    componentDidMount() {
        let dm = this.props.dataModel;
        this._dmObs = this.nodeObserver;
        dm.observe("context_changed", this._dmObs);
        dm.observe("root_node_changed", this._dmObs);
        this.nodeObserver();
    }

    componentWillUnmount() {
        if(this._dmObs){
            let dm = this.props.dataModel;
            dm.stopObserving("context_changed", this._dmObs);
            dm.stopObserving("root_node_changed", this._dmObs);
        }
    }

    treeNodeSelected = (n) => {
        if(this.props.onNodeSelected){
            this.props.onNodeSelected(n);
        }else{
            this.props.dataModel.requireContextChange(n);
        }
    };

    nodeIsSelected = (n) => {
        return n === this.props.dataModel.getContextNode();
    };

    render() {
        if(this.props.draggable){
            return (
                <DNDTreeView
                    onNodeSelect={this.treeNodeSelected}
                    nodeIsSelected={this.nodeIsSelected}
                    dataModel={this.props.dataModel}
                    node={this.props.rootNode || this.props.dataModel.getRootNode()}
                    showRoot={this.props.showRoot ? true : false}
                    selectedItemStyle={this.props.selectedItemStyle}
                    getItemStyle={this.props.getItemStyle}
                    getRightIcon={this.props.getRightIcon}
                    rootLabel={this.props.rootLabel}
                    noPaginator={this.props.noPaginator}
                    className={"folders-tree" + (this.props.className ? ' '+this.props.className : '')}
                />
            );
        }else{
            return (
                <TreeView
                    onNodeSelect={this.treeNodeSelected}
                    nodeIsSelected={this.nodeIsSelected}
                    dataModel={this.props.dataModel}
                    node={this.props.rootNode || this.props.dataModel.getRootNode()}
                    selectedItemStyle={this.props.selectedItemStyle}
                    getItemStyle={this.props.getItemStyle}
                    getRightIcon={this.props.getRightIcon}
                    showRoot={this.props.showRoot ? true : false}
                    rootLabel={this.props.rootLabel}
                    noPaginator={this.props.noPaginator}
                    className={"folders-tree" + (this.props.className ? ' '+this.props.className : '')}
                />
            );
        }
    }
}



export {TreeView, DNDTreeView, FoldersTree}