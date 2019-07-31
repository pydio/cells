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
import {FontIcon, Paper} from 'material-ui'

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
        role.updateAcl(workspace, null, newValue);
    },

    onNodesChange(nodeUuid, checkboxName, value){
        const {role, workspace} = this.props;
        role.updateAcl(null, nodeUuid, checkboxName, workspace);
    },

    getInitialState(){
        return {displayMask: false};
    },

    toggleDisplayMask(){
        this.setState({displayMask:!this.state.displayMask});
    },

    render(){

        const {workspace, role, advancedAcl} = this.props;

        console.log(workspace);
        if (!workspace.RootNodes || !Object.keys(workspace.RootNodes).length ){
            // This is not normal, a workspace should always have a root node!
            return (
                <PydioComponents.ListEntry
                    className={"workspace-acl-entry"}
                    firstLine={<span style={{textDecoration:'line-through', color:'#ef9a9a'}}>{workspace.Label + ' (' + this.context.getPydioRoleMessage('workspace.roots.invalid') + ')'}</span>}
                />
            );
        }

        const {aclString, inherited} = role.getAclString(workspace);

        const action = (
            <RightsSelector
                acl={aclString}
                onChange={this.onAclChange}
                hideLabels={true}
                advancedAcl={advancedAcl}
            />
        );

        let label = workspace.Label + (inherited ? ' ('+ this.context.getPydioRoleMessage('38') +')' : '');
        let secondLine;

        if(advancedAcl && (aclString.indexOf('read') !== -1 || aclString.indexOf('write') !== -1 )){

            label = (
                <div>
                    {label}
                    <FontIcon
                        className={"mdi mdi-" + (this.state.displayMask ? "minus" : "plus")}
                        onClick={this.toggleDisplayMask}
                        style={{cursor:'pointer', padding: '0 8px', fontSize: 16}}
                    />
                </div>
            );
            if(this.state.displayMask){
                let aclObject;
                if(aclString){
                    aclObject = {
                        read:aclString.indexOf('read') !== -1,
                        write:aclString.indexOf('write') !== -1
                    };
                }

                secondLine = (
                    <Paper zDepth={1} style={{margin: '30px 3px 3px'}}>
                        <PermissionMaskEditor
                            workspace={workspace}
                            role={role}
                            nodes={{}}
                            parentNodes={{}}
                            onNodesChange={this.onNodesChange}
                            showModal={this.props.showModal}
                            hideModal={this.props.hideModal}
                            globalWorkspacePermissions={aclObject}
                        />
                    </Paper>
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

