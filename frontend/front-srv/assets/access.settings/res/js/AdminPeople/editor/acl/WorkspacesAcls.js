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