import React from 'react'
import {FlatButton, RaisedButton, SelectField, Paper, TextField, Divider, Toggle, MenuItem, AutoComplete, RefreshIndicator, FontIcon, IconButton, Subheader} from 'material-ui'
import debounce from 'lodash.debounce'
import {AdminTreeServiceApi, TreeListNodesRequest, TreeNode} from "pydio/http/rest-api";

export default class WsAutoComplete extends React.Component{

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

        const {onDelete, skipTemplates, label, zDepth} = this.props;
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
        let depth = 1;
        if(zDepth !== undefined){
            depth = zDepth;
        }

        return (
            <Paper zDepth={depth} style={{display:'flex', alignItems: 'baseline', padding:10, paddingTop: 0, marginTop: 10, ...this.props.style}}>
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

