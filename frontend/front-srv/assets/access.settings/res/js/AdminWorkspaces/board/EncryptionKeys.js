import React from 'react'
import PydioApi from 'pydio/http/api'
import Pydio from 'pydio'
import {Paper, TextField, RaisedButton, FlatButton, IconButton, Dialog} from 'material-ui'
import {ConfigServiceApi, EncryptionAdminExportKeyRequest, EncryptionAdminImportKeyRequest,
    EncryptionAdminListKeysRequest, EncryptionAdminCreateKeyRequest, EncryptionAdminDeleteKeyRequest, EncryptionKey} from 'pydio/http/rest-api'
const {MaterialTable} = Pydio.requireLib('components');

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
        };
    }

    load() {
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        api.listEncryptionKeys(new EncryptionAdminListKeysRequest()).then(result => {
            if(result.Keys){
                this.setState({keys : result.Keys});
            }
        })
    }

    componentDidMount(){
        this.load();
    }

    exportKey(){
        const {pydio} = this.props;
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
            pydio.UI.displayMessage('ERROR', 'Something went wrong: ' + reason.message);
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
        if (confirm('This is a very dangerous operation, are you sure you want to do that??!')){
            const api = new ConfigServiceApi(PydioApi.getRestClient());
            let req = new EncryptionAdminDeleteKeyRequest();
            req.KeyID = keyId;
            api.deleteEncryptionKey(req).then(result => {
                this.load();
            });
        }
    }

    importKey(){
        const {pydio} = this.props;

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
                pydio.UI.displayMessage('SUCCESS', 'Import was successful');
            } else {
                pydio.UI.displayMessage('ERROR', 'Something went wrong!');
            }
            this.load();
            this.setState({showImportKey: false, showDialog: false});
        }).catch(() => {
            this.setState({showImportKey: false, showDialog: false});
        })

    }

    render(){

        const {keys, showDialog, showImportKey, showExportKey, exportedKey, showCreateKey} = this.state;

        const columns = [
            {name:'Label', label: 'Label', style:{width:'30%', fontSize:15}, headerStyle:{width:'30%'}},
            {name:'ID', label: 'Id'},
            {name:'Owner', label: 'Owner'},
            {name:'CreationDate', label: 'Created', renderCell:(row) => new Date(row.CreationDate*1000).toUTCString()},
            {name:'Actions', label:'', style:{width:160, textAlign:'right', overflow:'visible'}, headerStyle:{width:'160'}, renderCell:(row => {
                return (
                    <div>
                        <IconButton tooltip={"Import"} iconStyle={{color:'#9e9e9e'}} iconClassName={"mdi mdi-import"} onTouchTap={() => {this.setState({showDialog: true, showImportKey:row})}} onClick={e=>e.stopPropagation()}/>
                        <IconButton tooltip={"Export"} iconStyle={{color:'#9e9e9e'}} iconClassName={"mdi mdi-export"} onTouchTap={() => {this.setState({showDialog: true, showExportKey:row.ID})}} onClick={e=>e.stopPropagation()}/>
                        <IconButton tooltip={"Delete"} iconStyle={{color:'#9e9e9e'}} iconClassName={"mdi mdi-delete"} onTouchTap={() => {this.deleteKey(row.ID)}} onClick={e=>e.stopPropagation()}/>
                    </div>
                );
            })}
        ];

        let dialogContent, dialogTitle, dialogActions = [];
        if(showExportKey || exportedKey){
            dialogTitle = "Export Encryption Key";
            if(exportedKey){
                dialogContent = (
                    <TextField
                        value={exportedKey.Content}
                        fullWidth={true}
                        floatingLabelText={"Copy result to a file to save the key"}
                        multiLine={true}
                        ref="key-imported-field"
                    />
                );
                dialogActions = [
                    <FlatButton label={"Close"} onTouchTap={()=>{
                        clearTimeout(this.timeout);
                        this.setState({showExportKey:null, exportedKey:'', showDialog: false})}
                    }/>
                ];
            } else {
                dialogContent = (
                    <div>
                        <TextField floatingLabelText={"Please provide a password"} ref="key-password-field" type={"password"} fullWidth={true}/>
                        <TextField floatingLabelText={"Confirm your password"} ref="key-password-confirm" type={"password"} fullWidth={true}/>
                    </div>
                );
                dialogActions = [
                    <FlatButton label={"Cancel"} onTouchTap={()=>{this.setState({showExportKey:null, showDialog: false})}}/>,
                    <FlatButton label={"Export"} primary={true} onTouchTap={()=>{this.exportKey()}}/>
                ];
            }
        } else if(showImportKey) {
            dialogTitle = "Import key content";
            dialogContent = (
                <div>
                    {!showImportKey.ID &&
                        <div>
                            <TextField floatingLabelText={"Provide an identifier for this key"} ref="key-import-id" fullWidth={true}/>
                            <TextField floatingLabelText={"Provide a readable label for this key"} ref="key-import-label" fullWidth={true}/>
                        </div>
                    }
                    <TextField floatingLabelText={"Password you used at export"} ref="key-password-field" type={"password"} fullWidth={true}/>
                    <TextField fullWidth={true} floatingLabelText={"Paste key from your backup file."} multiLine={true} ref="key-imported-field"/>
                </div>
            );
            dialogActions =[
                <FlatButton label={"Cancel"} onTouchTap={()=>{this.setState({showImportKey:null, showDialog: false})}}/>,
                <FlatButton label={"Import"} primary={true} onTouchTap={()=>{this.importKey()}}/>
            ];
        } else if(showCreateKey) {
            dialogTitle = "Create a Key";
            dialogContent = (
                <div>
                    <TextField floatingLabelText={"Provide an identifier for this key"} ref="createKeyId" fullWidth={true}/>
                    <TextField floatingLabelText={"Provide a readable label for this key"} ref="createKeyLabel" fullWidth={true}/>
                </div>
            );
            dialogActions = [
                <FlatButton label={"Cancel"} onTouchTap={()=>{this.setState({showCreateKey:null, showDialog: false})}}/>,
                <FlatButton label={"Create"} primary={true} onTouchTap={()=>{this.createKey()}}/>
            ];
        }

        return (
            <Paper zDepth={1} style={{margin: 16, padding: 16}}>
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
                <div style={{textAlign:'right'}}>
                    <RaisedButton primary={true} label={"Import Key..."} onTouchTap={()=>{this.setState({showImportKey:{}, showDialog:true})}} style={{marginLeft: 16}}/>
                    <RaisedButton primary={true} label={"Create Key..."} onTouchTap={()=>{this.setState({showCreateKey:true, showDialog:true})}} style={{marginLeft: 16}}/>
                </div>
                <MaterialTable
                    data={keys}
                    columns={columns}
                    onSelectRows={()=>{}}
                    showCheckboxes={false}
                />
            </Paper>
        );

    }

}


export default EncryptionKeys