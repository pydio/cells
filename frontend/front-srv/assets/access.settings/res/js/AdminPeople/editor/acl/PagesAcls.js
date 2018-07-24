import React from 'react'
import {IdmWorkspace, TreeNode} from 'pydio/http/rest-api';
import WorkspaceAcl from './WorkspaceAcl'

class PagesAcls extends React.Component{

    constructor(props){
        super(props);
        let workspaces = [];
        const homepageWorkspace = new IdmWorkspace();
        homepageWorkspace.UUID = "homepage";
        homepageWorkspace.Label = "Home Page";
        homepageWorkspace.Description = "First page after login";
        homepageWorkspace.Slug = "homepage";
        homepageWorkspace.RootNodes = {"homepage-ROOT": TreeNode.constructFromObject({Uuid:"homepage-ROOT"})};
        workspaces.push(homepageWorkspace);
        if(props.showSettings) {
            const settingsWorkspace = new IdmWorkspace();
            settingsWorkspace.UUID = "settings";
            settingsWorkspace.Label = "Settings Page";
            settingsWorkspace.Description = "Pydio Cells Administration dashboard";
            settingsWorkspace.Slug = "settings";
            settingsWorkspace.RootNodes = {"settings-ROOT": TreeNode.constructFromObject({Uuid:"settings-ROOT"})};
            workspaces.push(settingsWorkspace);
        }
        this.state = {workspaces};
    }

    render(){
        const {role} = this.props;
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
                        advancedAcl={false}
                    />
                )}
            )}</div>
        );

    }

}

export {PagesAcls as default}