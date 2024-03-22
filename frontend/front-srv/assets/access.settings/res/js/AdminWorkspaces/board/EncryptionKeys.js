/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import PydioApi from 'pydio/http/api'
import Pydio from 'pydio'
import {Paper, RaisedButton, FlatButton, IconButton, Dialog} from 'material-ui'
import {ConfigServiceApi, EncryptionAdminExportKeyRequest, EncryptionAdminImportKeyRequest,
    EncryptionAdminListKeysRequest, EncryptionAdminCreateKeyRequest, EncryptionAdminDeleteKeyRequest, EncryptionKey} from 'cells-sdk'
import Workspace from "../model/Ws";
const {MaterialTable} = Pydio.requireLib('components');
const {ModernTextField} = Pydio.requireLib('hoc');

class EncryptionKeys extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            keys: [],
            showDialog: false,

            showExportKey: null,
            exportedKey : null,

            showCreateKey: null,
            showImportKey: null,

            m: id => props.pydio.MessageHash['ajxp_admin.ds.encryption.' + id] || id
        };
    }

    load() {
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        api.listEncryptionKeys(new EncryptionAdminListKeysRequest()).then(result => {
            this.setState({keys : result.Keys || []});
        })
    }

    componentDidMount(){
        this.load();
    }

    exportKey(){
        const {pydio} = this.props;
        const {m} = this.state;
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        const request = new EncryptionAdminExportKeyRequest();
        request.KeyID = this.state.showExportKey;
        request.StrPassword = this.refs['key-password-field'].getValue();
        const confirm = this.refs['key-password-confirm'].getValue();
        if(confirm !== request.StrPassword){
            pydio.UI.displayMessage('ERROR', 'Warning, passwords differ!');
            return;
        }
        api.exportEncryptionKey(request).then(response => {
            this.setState({exportedKey: response.Key, showExportKey: null}, () => {
                this.timeout = setTimeout(() => {
                    this.setState({exportedKey: '', showDialog: false})
                }, 10000);
            });
            this.setState({showExportKey: null});
        }).catch(reason => {
            pydio.UI.displayMessage('ERROR', m('key.export.fail') + " : " + reason.message);
            this.setState({showExportKey: null});
        });
    }

    createKey(){
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        let req = new EncryptionAdminCreateKeyRequest();
        req.KeyID = this.refs['createKeyId'].getValue();
        req.Label = this.refs['createKeyLabel'].getValue();
        api.createEncryptionKey(req).then((result) => {
            this.load();
            this.setState({showDialog: false})
        }).catch(() => {
            this.setState({showDialog: false})
        })
    }

    deleteKey(keyId){
        const {pydio} = this.props;
        const {m} = this.state;
        pydio.UI.openConfirmDialog({
            message:m('key.delete.warning'),
            destructive:[keyId],
            validCallback:() => {
                const api = new ConfigServiceApi(PydioApi.getRestClient());
                let req = new EncryptionAdminDeleteKeyRequest();
                req.KeyID = keyId;
                api.deleteEncryptionKey(req).then(result => {
                    this.load();
                });
            }
        });
    }

    importKey(){
        const {pydio} = this.props;
        const {m} = this.state;

        const api = new ConfigServiceApi(PydioApi.getRestClient());

        let importKey = this.state.showImportKey;
        let importExisting = true;
        if(!importKey.ID){
            importKey = new EncryptionKey();
            importKey.ID = this.refs['key-import-id'].getValue();
            importKey.Label = this.refs['key-import-label'].getValue();
            importExisting = false;
        }
        importKey.Content = this.refs['key-imported-field'].getValue();

        const request = new EncryptionAdminImportKeyRequest();
        request.StrPassword = this.refs['key-password-field'].getValue();
        request.Key = importKey;
        request.Override = importExisting;
        api.importEncryptionKey(request).then(response => {
            if (response.Success) {
                pydio.UI.displayMessage('SUCCESS', m('key.import.success'));
            } else {
                pydio.UI.displayMessage('ERROR', m('key.import.fail'));
            }
            this.load();
            this.setState({showImportKey: false, showDialog: false});
        }).catch(() => {
            this.setState({showImportKey: false, showDialog: false});
        })

    }

    render(){

        const {keys, showDialog, showImportKey, showExportKey, exportedKey, showCreateKey, m} = this.state;
        const {pydio, accessByName, adminStyles} = this.props;

        const columns = [
            {name:'Label', label: m('key.label'), style:{width:'30%', fontSize:15}, headerStyle:{width:'30%'}, sorter:{type:'string', default:true}},
            {name:'ID', label: m('key.id'), hideSmall:true, sorter:{type:'string'}},
            {name:'Owner', label: m('key.owner'), hideSmall:true, sorter:{type:'string'}},
            {name:'CreationDate', label: m('key.created'), hideSmall:true, useMoment:true, sorter:{type:'number'}},
        ];
        const actions = [];
        if(accessByName('CreateEncryption')){
            actions.push(
                {iconClassName:'mdi mdi-import', tooltip:m('key.import'), onClick:(row)=>{this.setState({showDialog: true, showImportKey:row})}},
                {iconClassName:'mdi mdi-export', tooltip:m('key.export'), onClick:(row)=>{this.setState({showDialog: true, showExportKey:row.ID})}},
                {iconClassName:'mdi mdi-delete', tooltip:m('key.delete'), onClick:(row)=>{this.deleteKey(row.ID)}},
            )
        }

        let dialogContent, dialogTitle, dialogActions = [];
        if(showExportKey || exportedKey){
            dialogTitle = m('key.export');
            if(exportedKey){
                dialogContent = (
                    <ModernTextField
                        value={exportedKey.Content}
                        fullWidth={true}
                        floatingLabelText={m('key.export.result.copy')}
                        multiLine={true}
                        ref="key-imported-field"
                    />
                );
                dialogActions = [
                    <FlatButton label={"Close"} onClick={()=>{
                        clearTimeout(this.timeout);
                        this.setState({showExportKey:null, exportedKey:'', showDialog: false})}
                    }/>
                ];
            } else {
                dialogContent = (
                    <div>
                        <ModernTextField floatingLabelText={m('key.export.password')} ref="key-password-field" type={"password"} fullWidth={true}/>
                        <ModernTextField floatingLabelText={m('key.export.confirm')} ref="key-password-confirm" type={"password"} fullWidth={true}/>
                    </div>
                );
                dialogActions = [
                    <FlatButton label={pydio.MessageHash['54']} onClick={()=>{this.setState({showExportKey:null, showDialog: false})}}/>,
                    <FlatButton label={m('key.export')} primary={true} onClick={()=>{this.exportKey()}}/>
                ];
            }
        } else if(showImportKey) {
            dialogTitle = m('key.import');
            dialogContent = (
                <div>
                    {!showImportKey.ID &&
                        <div>
                            <ModernTextField floatingLabelText={m('key.import.id')} ref="key-import-id" fullWidth={true}/>
                            <ModernTextField floatingLabelText={m('key.import.label')} ref="key-import-label" fullWidth={true}/>
                        </div>
                    }
                    <ModernTextField floatingLabelText={m('key.import.password')} ref="key-password-field" type={"password"} fullWidth={true}/>
                    <ModernTextField fullWidth={true} floatingLabelText={m('key.import.content')} multiLine={true} ref="key-imported-field"/>
                </div>
            );
            dialogActions =[
                <FlatButton label={pydio.MessageHash['54']} onClick={()=>{this.setState({showImportKey:null, showDialog: false})}}/>,
                <FlatButton label={m('key.import')} primary={true} onClick={()=>{this.importKey()}}/>
            ];
        } else if(showCreateKey) {
            dialogTitle = m('key.createone');
            dialogContent = (
                <div>
                    <ModernTextField floatingLabelText={m('key.import.id')} ref="createKeyId" fullWidth={true}/>
                    <ModernTextField floatingLabelText={m('key.import.label')} ref="createKeyLabel" fullWidth={true}/>
                </div>
            );
            dialogActions = [
                <FlatButton label={pydio.MessageHash['54']} onClick={()=>{this.setState({showCreateKey:null, showDialog: false})}}/>,
                <FlatButton label={m('key.create')} primary={true} onClick={()=>{this.createKey()}}/>
            ];
        }
        const {body} = AdminComponents.AdminStyles();
        const {tableMaster} = body;
        const blockProps = body.block.props;
        const blockStyle = body.block.container;

        return (
            <div>
                <Dialog
                    title={dialogTitle}
                    open={showDialog}
                    onRequestClose={()=>{this.setState({showDialog:false, showExportKey:null, showImportKey:null, showCreateKey: false})}}
                    modal={true}
                    actions={dialogActions}
                    contentStyle={{maxWidth: 340}}
                >
                    {dialogContent}
                </Dialog>
                <Paper {...blockProps} style={blockStyle}>
                    <MaterialTable
                        data={keys}
                        columns={columns}
                        actions={actions}
                        onSelectRows={()=>{}}
                        showCheckboxes={false}
                        emptyStateString={m('key.emptyState')}
                        masterStyles={tableMaster}
                        storageKey={'console.encryption-keys.list'}
                    />
                </Paper>
                {accessByName('CreateEncryption') &&
                <div style={{textAlign:'right', paddingRight: 24, paddingBottom: 24}}>
                    <FlatButton primary={true} label={m('key.import')} onClick={()=>{this.setState({showImportKey:{}, showDialog:true})}} {...adminStyles.props.header.flatButton}/>
                    <span style={{marginLeft: 8}}><FlatButton primary={true} label={m('key.create')} onClick={()=>{this.setState({showCreateKey:true, showDialog:true})}} {...adminStyles.props.header.flatButton}/></span>
                </div>
                }
            </div>
        );

    }

}


export default EncryptionKeys