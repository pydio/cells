/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import Pydio from 'pydio'
import React from 'react'
import {withRoleMessages} from '../util/MessagesMixin'
import RightsSelector from './RightsSelector'
const {ListEntry} = Pydio.requireLib('components');

class WorkspaceAcl extends React.Component{

    onAclChange(newValue, oldValue){
        const {role, workspace} = this.props;
        role.updateAcl(workspace, null, newValue);
    }

    render(){

        const {workspace, role, getPydioRoleMessage} = this.props;

        if (!workspace.RootNodes || !Object.keys(workspace.RootNodes).length ){
            // This is not normal, a workspace should always have a root node!
            return (
                <ListEntry
                    className={"workspace-acl-entry"}
                    firstLine={<span style={{textDecoration:'line-through', color:'#ef9a9a'}}>{workspace.Label + ' (' + getPydioRoleMessage('workspace.roots.invalid') + ')'}</span>}
                />
            );
        }

        const {aclString, inherited} = role.getAclString(workspace);
        const disabled = !!role.getUniqueRoleDisplay()

        const action = (
            <RightsSelector
                acl={aclString}
                onChange={this.onAclChange.bind(this)}
                hideLabels={true}
                disabled={disabled}
            />
        );

        let label = workspace.Label + (inherited ? ' ('+ getPydioRoleMessage('38') +')' : '');
        if(workspace.Description) {
            label = <span title={workspace.Description}>{label}</span>
        }

        return (
            <ListEntry
                className={ (inherited ? "workspace-acl-entry-inherited " : "") + "workspace-acl-entry"}
                firstLine={label}
                actions={action}
            />
        );


    }

}

export default withRoleMessages(WorkspaceAcl);

