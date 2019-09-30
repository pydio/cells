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
import PydioApi from 'pydio/http/api'
import {ConfigServiceApi, RestListPeerFoldersRequest, TreeNode} from 'pydio/http/rest-api'
import {SelectField, TextField, MenuItem, FontIcon, AutoComplete, RefreshIndicator} from 'material-ui'
import debounce from 'lodash.debounce'
import LangUtils from 'pydio/util/lang'
import PathUtils from 'pydio/util/path'
const {ModernTextField, ModernSelectField, ModernStyles} = Pydio.requireLib('hoc');

class AutocompleteTree extends React.Component{

    constructor(props){
        super(props);
        this.debounced = debounce(this.loadValues.bind(this), 300);
        this.state = {searchText: props.value, value: props.value};
    }

    handleUpdateInput(searchText) {
        this.debounced();
        this.setState({searchText: searchText});
    }

    handleNewRequest(chosenValue) {
        let key;
        const {nodes} = this.state;
        let exist = false;
        if (chosenValue.key === undefined) {
            key = '/' + LangUtils.trim(chosenValue, '/');
            let ok = false;
            nodes.map(node => {
                //const test = node.Path + '/';
                if (node.Path === key || node.Path.indexOf(key + '/') === 0) {
                    ok = true;
                }
            });
            if (ok){
                exist = true;
            }
        } else {
            key = chosenValue.key;
            exist = true;
        }
        this.setState({value:key, exist});
        this.props.onChange(key, exist);
        this.loadValues(key);
    }

    componentWillMount(){
        this.lastSearch = null;
        let value = "";
        if(this.props.value){
            value = this.props.value;
        }
        this.loadValues(value);
    }

    componentWillReceiveProps(newProps){
        if(newProps.value && newProps.value !== this.state.value){
            this.setState({value:newProps.value, exist: true});
        }
    }

    loadValues(value = "") {
        const {peerAddress} = this.props;
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
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        let listRequest = new RestListPeerFoldersRequest();
        listRequest.PeerAddress = peerAddress;
        listRequest.Path = basePath;
        this.setState({loading: true});
        api.listPeerFolders(peerAddress, listRequest).then(nodesColl => {
            let children = nodesColl.Children || [];
            children = children.map(c => {
                if(c.Path[0] !== '/'){
                    c.Path = '/' + c.Path;
                }
                return c;
            });
            this.setState({nodes: children, loading: false});
        }).catch(() => {
            this.setState({loading: false});
        })
    }

    renderNode(node) {
        const base = PathUtils.getBasename(node.Path);
        const dir = PathUtils.getDirname(node.Path);
        let label = <span>{node.Path}</span>;
        let invalid = false;
        if(LangUtils.computeStringSlug(base) !== base) {
            label = <span><span>{dir}</span>/<span style={{color:'#c62828'}}>{base}</span></span>
        } else if (node.MetaStore && node.MetaStore['symlink']) {
            // Symbolic link
            label = <span><span>{dir}</span>/<span style={{color:'#1976d2'}}>{base}</span></span>
        }
        return {
            key         : node.Path,
            text        : node.Path,
            invalid     : invalid,
            value       : <MenuItem><FontIcon className={"mdi mdi-folder"} color="#616161" style={{float:'left',marginRight:8}}/> {label}</MenuItem>
        };
    }

    render(){

        const {nodes, loading, exist, value} = this.state;
        const {fieldLabel} = this.props;
        let dataSource = [];
        if (nodes){
            nodes.forEach((node) => {
                dataSource.push(this.renderNode(node));
            });
        }

        let displayText = this.state.value;

        return (
            <div style={{position:'relative', marginTop: -5}}>
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
                    hintText={fieldLabel}
                    filter={(searchText, key) => (key.toLowerCase().indexOf(searchText.toLowerCase()) === 0)}
                    openOnFocus={true}
                    menuProps={{maxHeight: 200}}
                    {...ModernStyles.textField}
                />
            </div>

        );
    }

}

class DataSourceLocalSelector extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            peerAddresses : [],
            invalid: false,
            m: id => props.pydio.MessageHash['ajxp_admin.ds.editor.' + id] || id
        }
    }

    componentDidMount(){
        const {model} = this.props;
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        api.listPeersAddresses().then(res => {
            if(res.PeerAddresses && res.PeerAddresses.length === 1 && !model.PeerAddress){
                model.PeerAddress = res.PeerAddresses[0];
            }
            this.setState({peerAddresses: res.PeerAddresses});
        })
    }

    baseIsInvalid(path) {
        const {m} = this.state;
        let invalid = false;
        const base = PathUtils.getBasename(path);
        const segments = LangUtils.trim(path, '/').split('/').length;
        if (segments < 2) {
            invalid = m('selector.error.depth');
        } else if(LangUtils.computeStringSlug(base) !== base) {
            invalid = m('selector.error.dnsname');
        }
        return invalid;
    }

    onPathChange(newValue, exists){
        const {model} = this.props;
        const invalid = this.baseIsInvalid(newValue);
        model.invalid = invalid;
        model.StorageConfiguration.folder = newValue;
        if(!exists){
            model.StorageConfiguration.create = 'true';
        } else if (model.StorageConfiguration['create'] !== undefined) {
            delete model.StorageConfiguration['create'];
        }
        this.setState({invalid: invalid});
    }

    render(){

        const {model} = this.props;
        const {peerAddresses, invalid, m} = this.state;

        return (
            <div>
                <div style={{display:'flex', alignItems:'center'}}>
                    <div style={{width: 180, marginRight: 10}}>
                        <ModernSelectField
                            value={model.PeerAddress || ''}
                            hintText={m('selector.peer') + ' *'}
                            onChange={(e,i,v) => {model.PeerAddress = v}}
                            fullWidth={true}
                        >
                            {peerAddresses.map(address => {
                                return <MenuItem value={address} primaryText={address}/>
                            })}
                        </ModernSelectField>
                    </div>
                    <div style={{flex: 1, height: 36}}>
                        {model.PeerAddress &&
                            <AutocompleteTree
                                value={model.StorageConfiguration.folder}
                                peerAddress={model.PeerAddress}
                                onChange={this.onPathChange.bind(this)}
                                fieldLabel={m('selector.completer') + (model.StorageConfiguration.create ? ' ('+m('selector.completer.create')+')':'') + ' *'}
                                hintText={m('selector.completer.hint')}
                            />
                        }
                        {!model.PeerAddress &&
                            <ModernTextField
                                style={{marginTop: -3}}
                                fullWidth={true}
                                disabled={true}
                                value={model.StorageConfiguration.folder}
                                floatingLabelText={m('selector.folder') + ' *'}
                                hintText={m('selector.folder.hint')}
                            />
                        }
                    </div>
                </div>
                {invalid &&  <div style={{color: '#c62828'}}>{invalid}</div>}
            </div>
        );

    }

}

export {DataSourceLocalSelector as default}