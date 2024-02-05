import React from 'react'
import LangUtils from 'pydio/util/lang'
import {IdmWorkspace, TreeNode} from 'cells-sdk';
import WorkspaceAcl from './WorkspaceAcl'

class PagesAcls extends React.Component{

    constructor(props){
        super(props);
        const m = (id) => props.pydio.MessageHash['pydio_role.' + id] || id;

        let workspaces = [];
        const homepageWorkspace = new IdmWorkspace();
        homepageWorkspace.UUID = "homepage";
        homepageWorkspace.Label = m('workspace.statics.home.title');
        homepageWorkspace.Description = m('workspace.statics.home.description');
        homepageWorkspace.Slug = "homepage";
        homepageWorkspace.RootNodes = {"homepage-ROOT": TreeNode.constructFromObject({Uuid:"homepage-ROOT"})};
        workspaces.push(homepageWorkspace);

        const directoryWorkspace = new IdmWorkspace();
        directoryWorkspace.UUID = "directory";
        directoryWorkspace.Label = m('workspace.statics.directory.title');
        directoryWorkspace.Description = m('workspace.statics.directory.description');
        directoryWorkspace.Slug = "directory";
        directoryWorkspace.RootNodes = {"directory-ROOT": TreeNode.constructFromObject({Uuid:"directory-ROOT"})};
        workspaces.push(directoryWorkspace);

        if(props.showSettings) {
            const settingsWorkspace = new IdmWorkspace();
            settingsWorkspace.UUID = "settings";
            settingsWorkspace.Label = m('workspace.statics.settings.title');
            settingsWorkspace.Description = m('workspace.statics.settings.description');
            settingsWorkspace.Slug = "settings";
            settingsWorkspace.RootNodes = {"settings-ROOT": TreeNode.constructFromObject({Uuid:"settings-ROOT"})};
            workspaces.push(settingsWorkspace);
        }
        workspaces.sort(LangUtils.arraySorter('Label', false, true));
        this.state = {workspaces};
    }

    render(){
        const {role} = this.props;
        const {workspaces} = this.state;
        if(!role){
            return <div></div>
        }
        return (
            <div style={{backgroundColor:'white', clear:'both'}} className={"material-list"}>
                {workspaces.map( (ws,i) => {
                    let style = {}
                    if(i < workspaces.length-1) {
                        style = {borderBottom:'1px solid #e0e0e0'}
                    }
                    return <div style={style}><WorkspaceAcl workspace={ws} role={role} /></div>
                })}
            </div>
        );

    }

}

export {PagesAcls as default}