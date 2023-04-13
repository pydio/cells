/*
 * Copyright 2007-2019 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import Pydio from 'pydio'
import {Paper, MenuItem, RefreshIndicator, FontIcon, IconButton} from 'material-ui'
import debounce from 'lodash.debounce'
import PathUtils from 'pydio/util/path'
import {AdminTreeServiceApi, TreeListNodesRequest, TreeNode} from 'cells-sdk';
const {ModernAutoComplete, ThemedModernStyles} = Pydio.requireLib('hoc');
import {muiThemeable} from 'material-ui/styles'

const ThemedBlock = muiThemeable()(({muiTheme, children, ...props})=> {
    const ModernStyles = ThemedModernStyles(muiTheme)
    return (
        <div style={ModernStyles.fillBlockV2Right} {...props}>{children}</div>
    )
})


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

    componentDidMount() {
        const {validateOnLoad} = this.props
        const {value} = this.state

        this.loadValues(value, () => {
            const {nodes, value} = this.state

            // Checking if we have a collection and load deeper values if it's the case
            const node = nodes
                .filter((node) => node.Path === value && (!node.Type || (node.Type == "COLLECTION" && !node.MetaStore && !node.MetaStore.resolution)))
                .map((node) => {

                    this.loadValues(value + "/")
                })

            if (validateOnLoad) {
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
            <Paper zDepth={zDepth} style={{display:'flex', alignItems: 'center', margin:'2px 0', ...this.props.style}}>
                <div style={{position:'relative', flex: 1, height: 60}}>
                    <div style={{position:'absolute', right: 0, top: 30, width: 30}}>
                        <RefreshIndicator
                            size={30}
                            left={0}
                            top={0}
                            status={loading ? "loading" : "hide"}
                        />
                    </div>
                    <ModernAutoComplete
                        fullWidth={true}
                        searchText={value}
                        onUpdateInput={(value) => this.handleUpdateInput(value)}
                        onNewRequest={(value) => this.handleNewRequest(value)}
                        onClose={() => this.handleNewRequest(value)}
                        dataSource={dataSource}
                        filter={(searchText, key) => (key.toLowerCase().indexOf(searchText.toLowerCase()) === 0)}
                        floatingLabelText={label || m('ws.complete.label')}
                        openOnFocus={true}
                        menuProps={{maxHeight: 200}}
                        hasRightBlock={true}
                    />
                </div>
                <ThemedBlock>
                    <IconButton style={{marginTop: 2}} iconStyle={{color:onDelete?'#9e9e9e':'#eee'}} iconClassName={"mdi mdi-delete"} onClick={onDelete} disabled={!onDelete}/>
                </ThemedBlock>
            </Paper>
        );
    }
}
