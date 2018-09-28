import React from 'react'
import Role from "../model/Role";
import {IdmWorkspace} from 'pydio/http/rest-api';
import classNames from 'classNames';
import {IconButton} from 'material-ui';
import PydioDataModel from 'pydio/model/data-model';
import MaskNodesProvider from './MaskNodesProvider';


const PermissionMaskEditor = React.createClass({

    mixins:[AdminComponents.MessagesConsumerMixin],

    propTypes:{
        role:React.PropTypes.instanceOf(Role),
        workspace: React.PropTypes.instanceOf(IdmWorkspace),

        /* Global permissions may override the folders rights */
        globalWorkspacePermissions:React.PropTypes.object,
        showGlobalPermissions:React.PropTypes.bool,
        onGlobalPermissionsChange:React.PropTypes.func,

        /* Folders mask and parentMask */
        onNodesChange:React.PropTypes.func,

        /* Maybe used to alert about inconsistencies */
        showModal:React.PropTypes.func,
        hideModal:React.PropTypes.func
    },

    dmObserver(){
        const dataModel = this.state.dataModel;
        const sel = dataModel.getSelectedNodes();
        if(!sel.length) {
            return;
        }
        const selNode = sel[0];
        if (selNode.isLoaded()) {
            this.forceUpdate();
        } else {
            selNode.observeOnce("loaded", function () {
                this.forceUpdate();
            }.bind(this));
            selNode.load();
        }
    },

    componentDidMount(){
        this.state.dataModel.setSelectedNodes([this.state.node]);
    },

    componentWillReceiveProps(newProps){
        if(newProps.nodes !== this.state.nodes || newProps.parentNodes !== this.state.parentNodes){
            this.setState({
                nodes: newProps.nodes,
                parentNodes : newProps.parentNodes || {}
            });
        }
    },

    recursiveLoadNodesWithChildren(node, crtMask){
        const afterLoad = (loadedNode) => {
            "use strict";
            loadedNode.getChildren().forEach((c) => {
                if(crtMask[c.getMetadata().get('uuid')] && crtMask[c.getMetadata().get('uuid')]['children']){
                    c.observeOnce('loaded', () => {afterLoad(c);});
                    c.load();
                }
            });
        };
        if(node.isLoaded()){
            afterLoad(node);
        } else {
            node.observeOnce('loaded', () => {afterLoad(node);});
            node.load();
        }
    },

    recursiveClearNodeValues(node, values){
        "use strict";
        node.getChildren().forEach((c) => {
            if(values[c.getMetadata().get('uuid')]){
                this.recursiveClearNodeValues(c, values);
                delete(values[c.getMetadata().get('uuid')]);
            }
        });
    },

    getInitialState(){
        const dataModel = new PydioDataModel(true);
        const rNodeProvider = new MaskNodesProvider();
        dataModel.setAjxpNodeProvider(rNodeProvider);
        // Todo:  multiple roots
        const rootNodes = this.props.workspace.RootNodes;
        const firstNode = rootNodes[Object.keys(rootNodes).shift()];
        const rootNode = new AjxpNode("/" + firstNode.Path, false, "Whole workspace", "folder.png", rNodeProvider);
        rootNode.getMetadata().set("uuid", firstNode.Uuid);

        dataModel.setRootNode(rootNode);
        this.recursiveLoadNodesWithChildren(rootNode, this.props.nodes);
        dataModel.observe("selection_changed", this.dmObserver);

        return {
            node:rootNode,
            dataModel:dataModel,
            nodes:this.props.nodes,
            parentNodes:this.props.parentNodes,
            showResultingTree:false
        };
    },

    onCheckboxCheck(node, checkboxName, value){

        //console.log(node, checkboxName, value);
        const {role} = this.props;
        const nodeUuid = node.getMetadata().get('uuid');
        const {aclString, inherited} = role.getAclString(null, nodeUuid);
        // Rebuild new value
        let acls = [];
        if(checkboxName === 'deny' && value) {
            acls = [checkboxName];
        } else if(aclString){
            acls = aclString.split(',');
            if(acls.indexOf(checkboxName) > -1){
                acls = acls.filter((a) => a !== checkboxName);
            } else {
                acls.push(checkboxName);
            }
        } else if(value) {
            acls.push(checkboxName);
        }
        this.props.onNodesChange(nodeUuid, acls.join(','));

    },

    roleAclObject(node){
        const {role} = this.props;
        let {aclString, inherited} = role.getAclString(null, node.getMetadata().get("uuid"));
        const read = aclString.indexOf("read") > -1, write = aclString.indexOf("write") > -1, deny = aclString.indexOf("deny") > -1;
        return {
            VALUES:{read,write,deny},
            INHERITED:false,
            DISABLED:{},
            CLASSNAME:inherited ? "parent-inherited" : "",
            EMPTY: !read && !write && !deny
        };
    },

    checkboxesComputeStatus(node){

        const data = this.roleAclObject(node);
        let bNode = node, parent;
        let parentData;
        while(parent = bNode.getParent()){
            parentData = this.roleAclObject(parent);
            if(!parentData.EMPTY){
                break;
            }
            bNode = parent;
        }
        if(data.EMPTY && parentData){
            data.VALUES = parentData.VALUES;
            data.INHERITED = true;
        } else if(parentData && parentData.VALUES.deny){
            data.VALUES = parentData.VALUES;
            data.INHERITED = true;
        }
        if (data.VALUES.deny) {
            data.DISABLED = {read: true, write: true};
        }

        return data;

    },

    render(){
        const mainClassNames = classNames(
            "permission-mask-editor",
            {"tree-show-accessible-nodes":(this.state && this.state.showResultingTree)},
            {"permission-mask-global-noread":(this.props.globalWorkspacePermissions && !this.props.globalWorkspacePermissions.read)},
//            {"permission-mask-global-nowrite":(this.props.globalWorkspacePermissions && !this.props.globalWorkspacePermissions.write)}
        );
        return (
            <div className={mainClassNames}>
                <div style={{margin:'0 16px', position:'relative'}}>
                    <div style={{position: 'absolute'}}>
                        <IconButton
                            iconClassName="icon-filter" className="smaller-button"
                            tooltip={this.context.getMessage(this.state.showResultingTree?'react.13': 'react.14', 'ajxp_admin')}
                            onClick={function(){this.setState({showResultingTree:!this.state.showResultingTree});}.bind(this)}
                        />
                    </div>
                    <div className="read-write-header">
                        <span className="header-read">{this.context.getMessage('react.5a','ajxp_admin')}</span>
                        <span className="header-write">{this.context.getMessage('react.5b','ajxp_admin')}</span>
                        <span className="header-deny">{this.context.getMessage('react.5','ajxp_admin')}</span>
                    </div>
                    <br  style={{clear: 'both'}}/>
                    <PydioComponents.TreeView
                        ref="tree"
                        dataModel={this.state.dataModel}
                        node={this.state.node}
                        showRoot={true}
                        checkboxes={["read", "write", "deny"]}
                        checkboxesValues={this.state.mask}
                        checkboxesComputeStatus={this.checkboxesComputeStatus}
                        onCheckboxCheck={this.onCheckboxCheck}
                        forceExpand={true}
                    />
                </div>
            </div>
        );
    }

});

export {PermissionMaskEditor as default}