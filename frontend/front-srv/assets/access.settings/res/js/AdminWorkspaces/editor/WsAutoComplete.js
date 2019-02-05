import React from 'react'
import {FlatButton, RaisedButton, SelectField, Paper, TextField, Divider, Toggle, MenuItem, AutoComplete, RefreshIndicator, FontIcon, IconButton, Subheader} from 'material-ui'
import debounce from 'lodash.debounce'
import PathUtils from 'pydio/util/path'
import {AdminTreeServiceApi, TreeListNodesRequest, TreeNode} from "pydio/http/rest-api";

export default class WsAutoComplete extends React.Component{

    constructor(props){
        super(props);

        const {value = ''} = props

        this.debounced = debounce(() => {
            const {value} = this.state
            this.loadValues(value)
        }, 300);

        this.state = {
            nodes: [],
            value: value
        };
    }

    componentDidMount(){
        const {value} = this.state

        this.loadValues(value, () => {
            const {nodes, value} = this.state

            let done = false;

            // Checking if we have a collection and load deeper values if it's the case
            const node = nodes
                .filter((node) => node.Path === value && (!node.Type || (node.Type == "COLLECTION" && !node.MetaStore && !node.MetaStore.resolution)))
                .map((node) => {
                    done = true;

                    this.loadValues(value + "/")
                })

            if (!done) {
                this.handleNewRequest(value)
            }
        });
    }

    handleUpdateInput(input) {
        this.debounced();
        this.setState({value: input});
    }

    handleNewRequest(value) {
        const {nodes} = this.state;

        const {onChange = () => {}, onDelete = () => {}, onError = () => {}} = this.props;

        let key;
        let node;

        if (typeof value === 'string') {
            if (value === '') {
                onDelete()
                return
            }

            key = value

            // First we try to find an exact match
            node = nodes.filter(node => node.Path === value)[0]

            // Then we try to retrieve the first node that starts with what we are looking at
            if (!node) {
                node = nodes.filter(node => node.Path.indexOf(value) === 0)[0]
            }
        } else if (typeof value === 'object') {
            key = value.key
            node = value.node
        }

        if (!node) {
            return onError()
        }

        this.setState({value: key});

        onChange(key, node)
    }

    loadValues(value, cb = () => {}) {

        const last = value.lastIndexOf('/');
        const basePath = value.substr(0, last)

        if (this.lastSearch !== null && this.lastSearch === basePath) {
            return;
        }

        this.lastSearch = basePath;

        this.setState({loading: true});

        const api = new AdminTreeServiceApi(PydioApi.getRestClient());
        const listRequest = new TreeListNodesRequest();
        const treeNode = new TreeNode();

        treeNode.Path = basePath + "/";
        listRequest.Node = treeNode;

        api.listAdminTree(listRequest).then(nodesColl => {
            this.setState({nodes: nodesColl.Children || [], loading: false}, () => cb());
        }).catch(() => {
            this.setState({loading: false}, () => cb());
        })
    }

    static renderNode(node, m) {
        let label = <span>{node.Path}</span>;
        let icon = "mdi mdi-folder";
        let categ = "folder";
        if (node.MetaStore && node.MetaStore["resolution"]){
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

        const {value, nodes, loading} = this.state;

        const {pydio, onDelete, skipTemplates, label, zDepth = 0} = this.props;

        const m = (id) => pydio.MessageHash['ajxp_admin.' + id] || id;

        let dataSource = [];
        if (nodes) {
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
                if (!categs[data.categ]) {
                    categs[data.categ] = [];
                }

                categs[data.categ].push(data);
            });

            if (Object.keys(categs).length > 1) {
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

        return (
            <Paper zDepth={zDepth} style={{display:'flex', alignItems: 'baseline', margin:'10px 0 0 -8px', padding:'0 8px 10px', backgroundColor:'#fafafa', ...this.props.style}}>
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
                        searchText={value}
                        onUpdateInput={(value) => this.handleUpdateInput(value)}
                        onNewRequest={(value) => this.handleNewRequest(value)}
                        onClose={() => this.handleNewRequest(value)}
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
