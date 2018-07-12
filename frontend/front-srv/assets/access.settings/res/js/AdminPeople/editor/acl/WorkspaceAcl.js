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
import Role from '../model/Role'
import {IdmWorkspace} from 'pydio/http/rest-api';

export default React.createClass({

    mixins:[RoleMessagesConsumerMixin],

    propTypes:{
        role:React.PropTypes.instanceOf(Role),
        workspace: React.PropTypes.instanceOf(IdmWorkspace),

        wsId:React.PropTypes.string,
        label:React.PropTypes.string,
        roleParent:React.PropTypes.object,

        showModal:React.PropTypes.func,
        hideModal:React.PropTypes.func,
        Controller:React.PropTypes.object,
        advancedAcl:React.PropTypes.bool,
        supportsFolderBrowsing:React.PropTypes.bool
    },

    onAclChange(newValue, oldValue){
        const {role, workspace} = this.props;
        role.updateAcl(workspace, newValue);
    },

    onNodesChange(values){
        this.props.Controller.updateMask(values);
    },

    getInitialState(){
        return {displayMask: false};
    },

    toggleDisplayMask(){
        this.setState({displayMask:!this.state.displayMask});
    },

    render(){

        const {workspace, role, advancedAcl} = this.props;
        const {aclString, inherited} = role.getAclString(workspace);

        const action = (
            <RightsSelector
                acl={aclString}
                onChange={this.onAclChange}
                hideLabels={true}
                advancedAcl={advancedAcl}
            />
        );

        /*

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

        */


        return (
            <PydioComponents.ListEntry
                className={ (inherited ? "workspace-acl-entry-inherited " : "") + "workspace-acl-entry"}
                firstLine={workspace.Label + (inherited ? ' ('+ this.context.getPydioRoleMessage('38') +')' : '')}
                secondLine={null}
                actions={action}
            />
        );


    }

});

