import React from 'react'
import {FlatButton, RaisedButton, SelectField, Paper, TextField, Divider, Toggle, MenuItem, AutoComplete, RefreshIndicator, FontIcon, IconButton, Subheader} from 'material-ui'
import Workspace from '../model/Ws'
import debounce from 'lodash.debounce'
import {AdminTreeServiceApi, TreeListNodesRequest, TreeNode} from "pydio/http/rest-api";

class AutocompleteTree extends React.Component{

    constructor(props){
        super(props);
        this.debounced = debounce(this.loadValues.bind(this), 300);
        this.state = {searchText: props.value, value: props.value};
        console.log(this.state);
    }

    handleUpdateInput(searchText) {
        this.debounced();
        this.setState({searchText: searchText});
    }

    handleNewRequest(chosenValue) {
        let key;
        let chosenNode;
        const {nodes} = this.state;
        if (chosenValue.key === undefined) {
            if(chosenValue === ''){
                this.props.onChange('');
            }
            key = chosenValue;
            let ok = false;
            nodes.map(node => {
                if (node.Path === key) {
                    chosenNode = node;
                    ok = true;
                }
            });
            if(!ok){
                nodes.map(node => {
                    if (node.Path.indexOf(key) === 0) {
                        key = node.Path;
                        chosenNode = node;
                        ok = true;
                    }
                });
            }
            if(!ok) {
                return;
            }
        } else {
            key = chosenValue.key;
            chosenNode = chosenValue.node;
        }
        this.setState({value:key});
        this.props.onChange(key, chosenNode);
        this.loadValues(key);
    }

    componentDidMount(){
        this.lastSearch = null;
        let value = "";
        if(this.props.value){
            value = this.props.value;
        }
        this.loadValues(value);
    }

    loadValues(value = "") {
        const {searchText} = this.state;

        let basePath = value;
        if (!value && searchText){
            let last = searchText.lastIndexOf('/');
            basePath = searchText.substr(0, last);
        }
        if(this.lastSearch !== null && this.lastSearch === basePath){
            return;
        }
        this.lastSearch = basePath;

        const api = new AdminTreeServiceApi(PydioApi.getRestClient());
        let listRequest = new TreeListNodesRequest();
        let treeNode = new TreeNode();
        treeNode.Path = basePath;
        listRequest.Node = treeNode;
        this.setState({loading: true});
        api.listAdminTree(listRequest).then(nodesColl => {
            this.setState({nodes: nodesColl.Children || [], loading: false});
        }).catch(() => {
            this.setState({loading: false});
        })
    }

    renderNode(node) {
        let label = <span>{node.Path}</span>;
        let icon = "mdi mdi-folder";
        let categ = "folder";
        if(!node.Uuid.startsWith("DATASOURCE:")){
            icon = "mdi mdi-database";
            categ = "templatePath";
        }
        return {
            key         : node.Path,
            text        : node.Path,
            node        : node,
            categ       : categ,
            value       : <MenuItem><FontIcon className={icon} color="#616161" style={{float:'left',marginRight:8}}/> {label}</MenuItem>
        };
    }

    render(){

        const {onDelete, skipTemplates, label} = this.props;
        const {nodes, loading} = this.state;
        let dataSource = [];
        if (nodes){
            let categs = {};
            nodes.forEach((node) => {
                const data = this.renderNode(node);
                if(!categs[data.categ]) {
                    categs[data.categ] = [];
                }
                categs[data.categ].push(data);
            });
            if(Object.keys(categs).length > 1) {
                dataSource.push({key: "h1", text: '', value: <MenuItem primaryText={"DataSources and folders"} style={{fontSize: 13, fontWeight: 500}} disabled={true}/>});
                dataSource.push(...categs[Object.keys(categs)[0]]);
                if(!skipTemplates){
                    dataSource.push({key: "h2", text: '' , value: <MenuItem primaryText={"Preset Template Paths"} style={{fontSize: 13, fontWeight: 500}} disabled={true}/>});
                    dataSource.push(...categs[Object.keys(categs)[1]]);
                }
            } else if (Object.keys(categs).length === 1) {
                dataSource.push(...categs[Object.keys(categs)[0]])
            }
        }

        let displayText = this.state.value;

        return (
            <Paper zDepth={1} style={{display:'flex', alignItems: 'baseline', padding:10, paddingTop: 0, marginTop: 10}}>
                <div style={{position:'relative', flex: 1, marginTop: -5}}>
                    <div style={{position:'absolute', right: 0, top: 30, width: 30}}>
                        <RefreshIndicator
                            size={30}
                            left={0}
                            top={0}
                            status={loading ? "loading" : "hide"}
                        />
                    </div>
                    <AutoComplete
                        fullWidth={true}
                        searchText={displayText}
                        onUpdateInput={this.handleUpdateInput.bind(this)}
                        onNewRequest={this.handleNewRequest.bind(this)}
                        dataSource={dataSource}
                        floatingLabelText={label || 'Select a folder or a predefined template path'}
                        floatingLabelStyle={{whiteSpace:'nowrap'}}
                        floatingLabelFixed={true}
                        filter={(searchText, key) => (key.toLowerCase().indexOf(searchText.toLowerCase()) === 0)}
                        openOnFocus={true}
                        menuProps={{maxHeight: 200}}
                    />
                </div>
                {onDelete &&
                <IconButton iconClassName={"mdi mdi-delete"} onTouchTap={onDelete}/>
                }
            </Paper>
        );
    }

}


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
        const {closeEditor, reloadList} = this.props;
        if (confirm('Are you sure?')){
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
                    <AutocompleteTree
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
                <AutocompleteTree
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
                    <SelectField fullWidth={true} floatingLabelFixed={true} floatingLabelText={"Default Access (all users)"} value={""}>
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