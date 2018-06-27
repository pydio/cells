import React from 'react'

const PermissionMaskEditor = React.createClass({

    mixins:[AdminComponents.MessagesConsumerMixin],

    propTypes:{
        workspaceId:React.PropTypes.string,

        /* Global permissions may override the folders rights */
        globalWorkspacePermissions:React.PropTypes.object,
        showGlobalPermissions:React.PropTypes.bool,
        onGlobalPermissionsChange:React.PropTypes.func,

        /* Folders mask and parentMask */
        nodes:React.PropTypes.object,
        parentNodes:React.PropTypes.object,
        onNodesChange:React.PropTypes.func,

        /* Maybe used to alert about inconsistencies */
        showModal:React.PropTypes.func,
        hideModal:React.PropTypes.func
    },

    dmObserver:function(){
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

    componentDidMount:function(){
        this.state.dataModel.setSelectedNodes([this.state.node]);
    },

    componentWillReceiveProps:function(newProps){
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

    getInitialState:function(){
        const nodeProviderProperties = {
            get_action:"ls",
            tmp_repository_id:this.props.workspaceId
        };
        const dataModel = new PydioDataModel(true);
        const rNodeProvider = new RemoteNodeProvider();
        dataModel.setAjxpNodeProvider(rNodeProvider);
        rNodeProvider.initProvider(nodeProviderProperties);
        const rootNode = new AjxpNode("/", false, "Whole workspace", "folder.png", rNodeProvider);
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

    updateRow: function(currentValues, checkboxName, value){
        if(checkboxName == "read" || checkboxName == "write" || checkboxName == "children"){
            if(value) currentValues[checkboxName] = value;
            else if (currentValues[checkboxName]) delete currentValues[checkboxName];

            if(value && (checkboxName == "read" || checkboxName == "write") && currentValues["deny"]){
                delete currentValues["deny"];
            }
        }else if(checkboxName == "deny"){
            if(value) {
                currentValues[checkboxName] = value;
                if(currentValues["read"]) delete currentValues["read"];
                if(currentValues["write"]) delete currentValues["write"];
            }else{
                if(currentValues["deny"]) delete currentValues["deny"];
            }
        }
        if(!Object.keys(currentValues).length){
            return "delete";
        }else{
            return "update";
        }
    },

    updateColumn: function(values, node, checkboxName, value, copy){
        // If we change the "children" status, remove children values
        if(checkboxName == "children"){
            if(copy){
                let currentValues = LangUtils.simpleCopy(values[node.getMetadata().get('uuid')]) || {};
                currentValues["children"] = false;
                node.getChildren().forEach(function(c){
                    if(!c.isLeaf()) {
                        values[c.getMetadata().get("uuid")] = LangUtils.simpleCopy(currentValues);
                    }
                });
            }else{
                this.recursiveClearNodeValues(node, values);
            }
        }
    },

    applyConfirm:function(value, event){
        this.refs.dialog.dismiss();
        switch(value){
            case "cancel":
                break;
            case "confirm-remove":
            case "confirm-set-clear":
                this.onCheckboxCheck(...Object.values(this.state.confirmPending), true);
                break;
            case "confirm-set-copy":
                this.onCheckboxCheck(this.state.confirmPending["node"], "children", "copy", true);
                break;
            default:
                break;
        }
        this.setState({confirm: null, confirmPending:null});
    },

    onCheckboxCheck:function(node, checkboxName, value, skipConfirm){

        let values = this.state.nodes;
        const nodeUuid = node.getMetadata().get('uuid');
        let nodeValues = values[nodeUuid] || {};
        if(checkboxName == "children" && !skipConfirm){
            if(value && !node.isLoaded()){
                const tree = this.refs.tree;
                node.observeOnce("loaded", function(){
                    global.setTimeout(function(){
                        tree.forceUpdate();
                    }, 200);
                });
                node.load();
            }
            let confirmationText, buttons;
            if(value){
                confirmationText = this.context.getMessage('react.8','ajxp_admin');
                buttons = [
                    {text:this.context.getMessage('react.10','ajxp_admin'), onClick:this.applyConfirm.bind(this, 'confirm-set-copy')},
                    {text:this.context.getMessage('react.11','ajxp_admin'), onClick:this.applyConfirm.bind(this, 'confirm-set-clear')},
                    {text:this.context.getMessage('54', ''), onClick:this.applyConfirm.bind(this, 'cancel')}
                ];
            }else{
                confirmationText = this.context.getMessage('react.9','ajxp_admin');
                buttons = [
                    {text:this.context.getMessage('react.12','ajxp_admin'), onClick:this.applyConfirm.bind(this, 'confirm-remove')},
                    {text:this.context.getMessage('54', ''), onTouchTap:this.applyConfirm.bind(this, 'cancel')}];
            }
            this.setState({
                confirm:{
                    text:confirmationText,
                    buttons:buttons
                },
                confirmPending:{
                    node:node,
                    checkboxName:checkboxName,
                    value:value
                }
            }, function(){this.refs.dialog.show();}.bind(this));
            return;
        }
        let copy;
        if(checkboxName == "children" && value == "copy"){
            copy = true;
            value = true;
            this.updateColumn(values, node, checkboxName, value, true);
        }
        let result = this.updateRow(nodeValues, checkboxName, value);
        if(!copy){
            this.updateColumn(values, node, checkboxName, value);
        }

        if(result == "delete" && values[nodeUuid]){
            delete values[nodeUuid];
        }else{
            nodeValues["uuid"] = nodeUuid;
            values[nodeUuid] = nodeValues;
        }
        if(this.props.onNodesChange){
            this.props.onNodesChange(values);
        }
        this.setState({nodes:values});
    },

    checkboxesComputeStatus:function(node, useParentMask=false){

        const nodeUuid = node.getMetadata().get('uuid');
        let values = {}, disabled = {};
        let inherited = false, foundParent = false, foundParentChecksChildren = false;
        let mask = this.state.nodes;
        if(useParentMask){
            mask = this.state.parentNodes;
        }
        let firstParent = node.getParent();
        if(firstParent && firstParent.getPath() != '/' && mask[firstParent.getMetadata().get('uuid')] && mask[firstParent.getMetadata().get('uuid')]['children']){
            foundParentChecksChildren = true;
        }
        if(mask[nodeUuid]){
            values = mask[nodeUuid]
        }else{
            let bNode = node, parent;
            // IF direct parent has not values at all, it will always be inherited
            if(firstParent && !mask[firstParent.getMetadata().get('uuid')]){
                inherited = true;
            }
            while(parent = bNode.getParent()){
                if(mask[parent.getMetadata().get('uuid')]){
                    const parentValues = mask[parent.getMetadata().get('uuid')];
                    foundParent = true;
                    if(!parentValues['children']){
                        inherited = true;
                        values = LangUtils.deepCopy(parentValues);
                    }
                    break;
                }
                bNode = parent;
            }
        }
        if(!Object.keys(values).length) {
            if(node.getPath() != '/' && !foundParent){
                inherited = true;
            }
        }
        // Update disabled state
        if(inherited) {
            disabled = {read: true, write:true, deny:true, children:true};
        } else{
            if(values['children']) {
                disabled = {read: true, write:true, deny:true};
                values['write'] = false;
                values['deny'] = false;
                values['read'] = true;
            } else if(values['deny']) {
                disabled = {read: true, write:true};
            }
        }
        let additionalClass;
        if(!values['read'] && !values['write'] && !values['deny']
            && Object.keys(this.state.parentNodes).length
            && !foundParentChecksChildren
            && !useParentMask){
            // Still no values, compute from parent
            additionalClass = 'parent-inherited';
            let data = this.checkboxesComputeStatus(node, true);
            values = data.VALUES;
            disabled = {read: false, write:false, deny:false, children:false};
            inherited = data.INHERITED;
        }
        return {
            VALUES:values,
            INHERITED:inherited,
            DISABLED:disabled,
            CLASSNAME:additionalClass
        };
    },

    render: function(){
        const mainClassNames = global.classNames(
            "permission-mask-editor",
            {"tree-show-accessible-nodes":(this.state && this.state.showResultingTree)},
            {"permission-mask-global-noread":(this.props.globalWorkspacePermissions && !this.props.globalWorkspacePermissions.read)},
            {"permission-mask-global-nowrite":(this.props.globalWorkspacePermissions && !this.props.globalWorkspacePermissions.write)}
        );
        return (
            <div className={mainClassNames}>
                <ReactMUI.Dialog
                    ref="dialog"
                    title="Warning"
                    actions={this.state && this.state.confirm ? this.state.confirm.buttons : []}
                    contentClassName="dialog-max-480"
                >
                    {this.state && this.state.confirm  ? this.state.confirm.text: ''}
                </ReactMUI.Dialog>
                <div style={{margin:'0 16px', position:'relative'}}>
                    <div style={{position: 'absolute'}}>
                        <ReactMUI.IconButton
                            iconClassName="icon-filter" className="smaller-button"
                            tooltip={this.context.getMessage(this.state.showResultingTree?'react.13': 'react.14', 'ajxp_admin')}
                            onClick={function(){this.setState({showResultingTree:!this.state.showResultingTree});}.bind(this)}
                        />
                    </div>
                    <div className="read-write-header">
                        <span className="header-read">{this.context.getMessage('react.5a','ajxp_admin')}</span>
                        <span className="header-write">{this.context.getMessage('react.5b','ajxp_admin')}</span>
                        <span className="header-deny">{this.context.getMessage('react.5','ajxp_admin')}</span>
                        <span  className="header-children">{this.context.getMessage('react.6','ajxp_admin')}</span>
                    </div>
                    <br  style={{clear: 'both'}}/>
                    <PydioComponents.TreeView
                        ref="tree"
                        dataModel={this.state.dataModel}
                        node={this.state.node}
                        showRoot={true}
                        checkboxes={["read", "write", "deny", "children"]}
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