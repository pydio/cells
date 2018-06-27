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

import {RoleMessagesConsumerMixin} from '../util/MessagesMixin'
import RightsSelector from './RightsSelector'
import PermissionMaskEditor from './PermissionMaskEditor'

export default React.createClass({

    mixins:[RoleMessagesConsumerMixin],

    propTypes:{
        id:React.PropTypes.string,
        label:React.PropTypes.string,
        role:React.PropTypes.object,
        roleParent:React.PropTypes.object,
        pluginsFilter:React.PropTypes.func,
        paramsFilter:React.PropTypes.func,
        toggleEdit:React.PropTypes.func,
        editMode:React.PropTypes.bool,
        titleOnly:React.PropTypes.bool,
        editOnly:React.PropTypes.bool,
        noParamsListEdit:React.PropTypes.bool,
        uniqueScope:React.PropTypes.bool,
        showModal:React.PropTypes.func,
        hideModal:React.PropTypes.func,
        Controller:React.PropTypes.object,
        advancedAcl:React.PropTypes.bool,
        supportsFolderBrowsing:React.PropTypes.bool
    },

    onAclChange:function(newValue, oldValue){
        this.props.Controller.updateAcl(this.props.id, newValue);
    },

    onNodesChange:function(values){
        this.props.Controller.updateMask(values);
    },

    getInitialState:function(){
        return {displayMask: false};
    },

    toggleDisplayMask: function(){
        this.setState({displayMask:!this.state.displayMask});
    },

    render: function(){
        const {role, roleParent, id, advancedAcl, supportsFolderBrowsing} = this.props;
        let {label} = this.props;

        const wsId = id;
        const parentAcls = (roleParent && roleParent.ACL) ?  roleParent.ACL : {};
        const acls = (role && role.ACL) ?  role.ACL : {};
        let inherited = false;
        if(!acls[wsId] && parentAcls[wsId]){
            label += ' ('+ this.context.getPydioRoleMessage('38') +')';
            inherited = true;
        }
        let secondLine, action;
        let aclString = acls[wsId] || parentAcls[wsId];
        if(!aclString) {
            aclString = "";
        }
        action = <RightsSelector
            acl={aclString}
            onChange={this.onAclChange}
            hideLabels={true}
            advancedAcl={advancedAcl}
        />;
        if(advancedAcl && (aclString.indexOf('read') !== -1 || aclString.indexOf('write') !== -1 ) && supportsFolderBrowsing){

            const toggleButton = <ReactMUI.FontIcon
                className={"icon-" + (this.state.displayMask ? "minus" : "plus")}
                onClick={this.toggleDisplayMask}
                style={{cursor:'pointer', padding: '0 8px'}}
            />;
            label = (
                <div>
                    {label} {toggleButton}
                </div>
            );
            if(this.state.displayMask){
                const parentNodes = roleParent.NODES || {};
                const nodes = role.NODES || {};
                action = null;
                let aclObject;
                if(aclString){
                    aclObject = {
                        read:aclString.indexOf('read') !== -1,
                        write:aclString.indexOf('write') !== -1
                    };
                }

                secondLine = (
                    <ReactMUI.Paper zDepth={1} style={{margin: '8px 20px', backgroundColor:'white', color:'rgba(0,0,0,0.87)'}}>
                        <PermissionMaskEditor
                            workspaceId={wsId}
                            parentNodes={parentNodes}
                            nodes={nodes}
                            onNodesChange={this.onNodesChange}
                            showModal={this.props.showModal}
                            hideModal={this.props.hideModal}
                            globalWorkspacePermissions={aclObject}
                        />
                    </ReactMUI.Paper>
                );
            }

        }

        return (
            <PydioComponents.ListEntry
                className={ (inherited ? "workspace-acl-entry-inherited " : "") + "workspace-acl-entry"}
                firstLine={label}
                secondLine={secondLine}
                actions={action}
            />
        );
    }

});

