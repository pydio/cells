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
import React from 'react'
import PydioApi from 'pydio/http/api'
import LangUtils from 'pydio/util/lang'
import {WorkspaceServiceApi, RestSearchWorkspaceRequest, IdmWorkspaceSingleQuery} from 'pydio/http/rest-api';
import WorkspaceAcl from './WorkspaceAcl'

class WorkspacesAcls extends React.Component{

    constructor(props){
        super(props);
        this.state = {workspaces: []};
        const api = new WorkspaceServiceApi(PydioApi.getRestClient());
        const request = new RestSearchWorkspaceRequest();
        request.Queries = [IdmWorkspaceSingleQuery.constructFromObject({
            scope: 'ADMIN',
        })];
        api.searchWorkspaces(request).then(collection => {
            const workspaces = collection.Workspaces || [];
            workspaces.sort(LangUtils.arraySorter('Label', false, true));
            this.setState({workspaces});
        });
    }

    render(){
        const {role, advancedAcl} = this.props;
        const {workspaces} = this.state;
        if(!role){
            return <div></div>
        }
        return (
            <div className={"material-list"}>{workspaces.map(
                ws => {return (
                    <WorkspaceAcl
                        workspace={ws}
                        role={role}
                        advancedAcl={advancedAcl}
                    />
                )}
            )}</div>
        );

    }

}

export {WorkspacesAcls as default}