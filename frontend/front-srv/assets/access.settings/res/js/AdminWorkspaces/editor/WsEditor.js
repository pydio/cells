import React from 'react'
import {FlatButton, RaisedButton, SelectField, Paper, TextField, Divider, Toggle, MenuItem, FontIcon, IconButton, Subheader} from 'material-ui'
import Workspace from '../model/Ws'
import WsAutoComplete from './WsAutoComplete'

class WsEditor extends React.Component {

    constructor(props){
        super(props);
        const workspace = new Workspace(props.workspace);
        workspace.observe('update', () => {
            this.forceUpdate();
        });
        this.state = {
            workspace: workspace.getModel(),
            container: workspace,
            newFolderKey: Math.random()
        };
    }

    revert(){
        const {container} = this.state;
        container.revert();
        this.setState({workspace: container.getModel()}, () => {this.forceUpdate()});
    }

    save(){
        const {container} = this.state;
        const {reloadList} = this.props;
        container.save().then(() => {
            reloadList();
            this.setState({workspace: container.getModel()}, () => {this.forceUpdate()});
        });
    }

    remove(){
        const {container} = this.state;
        const {closeEditor, reloadList, pydio} = this.props;
        if (confirm(pydio.MessageHash['settings.35'])){
            container.remove().then(() => {
                reloadList();
                closeEditor();
            });
        }
    }

    render(){

        const {closeEditor} = this.props;
        const {workspace, container, newFolderKey} = this.state;

        let buttons = [];
        if(!container.create){
            buttons.push(<FlatButton label={"Revert"} secondary={true} disabled={!container.isDirty()} onTouchTap={() => {this.revert()}}/>);
        }
        buttons.push(<FlatButton label={"Save"} secondary={true} disabled={!(container.isDirty() && container.isValid())} onTouchTap={() => {this.save()}}/>);
        buttons.push(<RaisedButton label={"Close"} onTouchTap={closeEditor}/>);

        let delButton;
        if(!container.create){
            delButton = (
                <div style={{padding: 16, textAlign:'center'}}>
                    Dangerous Operation: <br/><br/>
                    <RaisedButton secondary={true} label={"Delete Workspace"} onTouchTap={()=>{this.remove()}}/>
                </div>
            );
        }
        const leftNav = (
            <div>
                <div style={{padding: 16}}>
                    Workspace are used to actually grant data access to the users.
                    <br/><br/>
                    It is composed of one or many "roots" that are exposed to the users. You can pick either a folder or a
                    file from any datasource, or a preset Template Path that will be resolved automatically at run time (see
                    the Storage section).
                    <br/><br/>
                    In the latter case (using template paths), you can only add one Template Path as root of a workspace.
                </div>
                {delButton && <Divider/>}
                {delButton}
            </div>
        );

        const styles = {
            title: {
                fontSize: 20,
                paddingTop: 20,
                marginBottom: 0,
            },
            legend: {},
            section: {padding: '0 20px 20px'},
            toggleDiv:{height: 50, display:'flex', alignItems:'flex-end'}
        };

        const roots = workspace.RootNodes;
        let completers = Object.keys(roots).map(
            (k)=> {
                let label = "Folder Path";
                if(Workspace.rootIsTemplatePath(roots[k])){
                    label = "Template Path";
                }
                return (
                    <WsAutoComplete
                        key={roots[k].Uuid}
                        label={label}
                        value={roots[k].Path}
                        onDelete={() => {delete(roots[k]); this.forceUpdate()}}
                        onChange={(key,node) => {
                            delete(roots[k]);
                            if(key !== '') {
                                roots[node.Uuid] = node;
                            }
                        }}
                        skipTemplates={container.hasFolderRoots()}
                    />
                )
            }
        );
        if(!container.hasTemplatePath()){
            completers.push(
                <WsAutoComplete
                    key={newFolderKey}
                    value={""}
                    onChange={(k,node) => {if(node){ roots[node.Uuid] = node; this.setState({newFolderKey: Math.random()})}}}
                    skipTemplates={container.hasFolderRoots()}
                />);
        }

        return (
            <PydioComponents.PaperEditorLayout
                title={workspace.Label || 'New Workspace'}
                titleActionBar={buttons}
                leftNav={leftNav}
                className="workspace-editor"
                contentFill={false}
            >
                <div style={styles.section}>
                    <div style={styles.title}>Main Options</div>
                    <TextField fullWidth={true} floatingLabelFixed={true} floatingLabelText={"Workspace Label"} value={workspace.Label} onChange={(e,v)=>{workspace.Label = v}}/>
                    <TextField fullWidth={true} floatingLabelFixed={true} floatingLabelText={"Workspace Description"} value={workspace.Description} onChange={(e,v)=>{workspace.Description = v}}/>
                    <TextField fullWidth={true} floatingLabelFixed={true} floatingLabelText={"Workspace Slug (technical access)"} value={workspace.Slug} onChange={(e,v)=>{workspace.Slug = v}}/>
                </div>
                <Divider/>
                <div style={styles.section}>
                    <div style={styles.title}>Permissions</div>
                    {completers}
                    <SelectField
                        fullWidth={true}
                        floatingLabelFixed={true}
                        floatingLabelText={"Default Access (all users)"}
                        value={workspace.Attributes['DEFAULT_RIGHTS']}
                        onChange={(e,i,v) => {workspace.Attributes['DEFAULT_RIGHTS'] = v}}
                    >
                        <MenuItem primaryText={"None"} value={""}/>
                        <MenuItem primaryText={"Read only"} value={"r"}/>
                        <MenuItem primaryText={"Read and write"} value={"rw"}/>
                        <MenuItem primaryText={"Write only"} value={"w"}/>
                    </SelectField>
                </div>
                <Divider/>
                <div style={styles.section}>
                    <div style={styles.title}>Other</div>
                    <div style={styles.toggleDiv}><Toggle label={"Allow Synchronization"} toggled={workspace.Attributes['ALLOW_SYNC']} onToggle={(e,v) =>{workspace.Attributes['ALLOW_SYNC']=v}} /></div>
                    <SelectField fullWidth={true} floatingLabelFixed={true} floatingLabelText={"Workspace Layout"} value={workspace.Attributes['META_LAYOUT'] || ""} onChange={(e,i,v) => {workspace.Attributes['META_LAYOUT'] = v}}>
                        <MenuItem primaryText={"Default"} value={""}/>
                        <MenuItem primaryText={"Easy Transfer Layout"} value={"meta.layout_sendfile"}/>
                    </SelectField>
                </div>
            </PydioComponents.PaperEditorLayout>
        );

    }


}

export {WsEditor as default}