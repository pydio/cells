import React from 'react'
import {FlatButton, RaisedButton, SelectField, Paper, TextField, Divider, Toggle, MenuItem, AutoComplete, RefreshIndicator, FontIcon, IconButton, Subheader} from 'material-ui'
import debounce from 'lodash.debounce'
import PathUtils from 'pydio/util/path'
import {AdminTreeServiceApi, TreeListNodesRequest, TreeNode} from "pydio/http/rest-api";

export default class WsAutoComplete extends React.Component{

    constructor(props){
        super(props);
        this.debounced = debounce(this.loadValues.bind(this), 300);
        this.state = {
            nodes: [],
            searchText: props.value,
            value: props.value
        };
    }

    componentDidMount(){
        const {value = ""} = this.state

        this.lastSearch = null;

        this.loadValues(value, () => {
            if (value != "") {
                this.handleNewRequest(value)
            }
        });
    }

    handleUpdateInput(searchText) {
        this.debounced();
        this.setState({searchText: searchText});
    }

    handleNewRequest(chosenValue) {
        let key;
        let chosenNode;

        const {nodes} = this.state;

        console.log(nodes)
        const {autofill = true, onChange = () => {}, onError = () => {}} = this.props;

        if (chosenValue.key === undefined) {
            if(chosenValue === ''){
                this.props.onChange('');
            }
            key = chosenValue;
            let ok = false;
            nodes.map(node => {
                if (node.Path === key || node.Path === key + '/') {
                    chosenNode = node;
                    ok = true;
                }
            });
            if(!ok && autofill){
                nodes.map(node => {
                    if (node.Path.indexOf(key) === 0) {
                        key = node.Path;
                        chosenNode = node;
                        ok = true;
                    }
                });
            }
            if(!ok) {
                onError();
                return;
            }
        } else {
            key = chosenValue.key;
            chosenNode = chosenValue.node;
        }
        this.setState({value:key});
        onChange(key, chosenNode);
    }

    loadValues(value = "", cb = () => {}) {

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
            if (!nodesColl.Children && nodesColl.Parent) {
                this.setState({nodes: [nodesColl.Parent] || [], loading: false}, () => cb());
            } else {
                this.setState({nodes: nodesColl.Children || [], loading: false}, () => cb());
            }
        }).catch(() => {
            this.setState({loading: false}, () => cb());
        })
    }

    static renderNode(node, m) {
        let label = <span>{node.Path}</span>;
        let icon = "mdi mdi-folder";
        let categ = "folder";
        if(node.MetaStore && node.MetaStore["resolution"]){
            icon = "mdi mdi-file-tree";
            categ = "templatePath";
            const resolutionPart = node.MetaStore["resolution"].split("\n").pop();
            label = <span>{node.Path} <i style={{color: '#9e9e9e'}}>- {m('ws.complete.resolves')} {resolutionPart}</i></span>;
        } else if(node.Type === 'LEAF') {
            icon = "mdi mdi-file";
        }
        return {
            key         : node.Path,
            text        : node.Path,
            node        : node,
            categ       : categ,
            value       : <MenuItem><FontIcon className={icon} color="#607d8b" style={{float:'left',marginRight:8}}/> {label}</MenuItem>
        };
    }

    render(){

        const {searchText} = this.state;
        const {onDelete, skipTemplates, label, zDepth, pydio} = this.props;

        const m = (id) => pydio.MessageHash['ajxp_admin.' + id] || id;
        const {nodes, loading} = this.state;
        let dataSource = [];
        if (nodes){
            let categs = {};
            nodes.forEach((node) => {
                if (node.MetaStore && node.MetaStore["resolution"] && node.Uuid === "cells"){
                    // Skip "Cells" Template Path
                    return;
                } else if(PathUtils.getBasename(node.Path).startsWith(".")) {
                    // Skip hidden files
                    return;
                }
                const data = WsAutoComplete.renderNode(node, m);
                if(!categs[data.categ]) {
                    categs[data.categ] = [];
                }
                categs[data.categ].push(data);
            });
            if(Object.keys(categs).length > 1) {
                dataSource.push({key: "h1", text: '', value: <MenuItem primaryText={m('ws.complete.datasources')} style={{fontSize: 13, fontWeight: 500}} disabled={true}/>});
                const dValues = categs[Object.keys(categs)[0]];
                dValues.sort(LangUtils.arraySorter("text"));
                dataSource.push(...dValues);
                if(!skipTemplates){
                    dataSource.push({key: "h2", text: '' , value: <MenuItem primaryText={m('ws.complete.templates')} style={{fontSize: 13, fontWeight: 500}} disabled={true}/>});
                    const tValues = categs[Object.keys(categs)[1]];
                    tValues.sort(LangUtils.arraySorter("text"));
                    dataSource.push(...tValues);
                }
            } else if (Object.keys(categs).length === 1) {
                dataSource.push(...categs[Object.keys(categs)[0]])
            }
        }

        let displayText = this.state.value;
        let depth = 0;
        if(zDepth !== undefined){
            depth = zDepth;
        }

        return (
            <Paper zDepth={depth} style={{display:'flex', alignItems: 'baseline', margin:'10px 0 0 -8px', padding:'0 8px 10px', backgroundColor:'#fafafa', ...this.props.style}}>
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
                        onUpdateInput={(value) => this.handleUpdateInput(value)}
                        onNewRequest={(value) => this.handleNewRequest(value)}
                        onClose={() => this.handleNewRequest(searchText)}
                        dataSource={dataSource}
                        floatingLabelText={label || m('ws.complete.label')}
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
