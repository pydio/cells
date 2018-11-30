import Pydio from 'pydio'
import React from 'react'
import DataSource from '../model/DataSource'
import {Dialog, Divider, Subheader, TextField, SelectField, Toggle, FlatButton, RaisedButton, MenuItem} from 'material-ui'
import DataSourceLocalSelector from './DataSourceLocalSelector'
import DsStorageSelector from './DsStorageSelector'
const {PaperEditorLayout} = Pydio.requireLib('components');

class DataSourceEditor extends React.Component{

    constructor(props){
        super(props);
        const observable = new DataSource(props.dataSource);
        this.state = {
            dirty:false,
            create: props.create,
            observable: observable,
            model: observable.getModel(),
            loaded :false,
            valid: observable.isValid(),
            encryptionKeys: [],
            versioningPolicies: [],
            m: (id) => props.pydio.MessageHash['ajxp_admin.ds.editor.' + id] || id
        };
        DataSource.loadEncryptionKeys().then(res => {
            this.setState({encryptionKeys: res.Keys || []});
        });
        DataSource.loadVersioningPolicies().then(res => {
            this.setState({versioningPolicies: res.Policies || []});
        });
    }

    componentWillReceiveProps(newProps){
        if(newProps.dataSource && this.state.model.Name !== newProps.dataSource.Name){
            this.setState({model: new DataSource(newProps.dataSource).getModel()});
        }
        if(newProps.create && this.state.create !== newProps.create) {
            this.setState({create: newProps.create});
        }
    }

    componentDidMount(){
        const {observable} = this.state;
        observable.observe("update", () => {
            this.setState({dirty: true});
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        const {observable} = this.state;
        observable.stopObserving("update");
    }

    resetForm(){
        const {observable} = this.state;
        const newModel = observable.revert();
        this.setState({
            valid: true,
            dirty: false,
            model: newModel
        }, ()=>{this.forceUpdate()});
    }

    deleteSource(){
        const {m} = this.state;
        if(confirm(m('delete.warning'))){
            this.state.observable.deleteSource().then(() => {
                this.props.closeEditor();
                this.props.reloadList();
            });
        }
    }

    saveSource(){
        this.state.observable.saveSource().then(() => {
            this.setState({valid: true, dirty: false, create: false});
            this.props.reloadList();
        });
    }

    launchResync(){
        this.state.observable.resyncSource();
    }

    toggleEncryption(value){
        if(value){
            this.setState({showDialog:'enableEncryption', dialogTargetValue: value});
        } else {
            this.setState({showDialog:'disableEncryption', dialogTargetValue: value});
        }
    }

    confirmEncryption(value){
        const {model} = this.state;
        model.EncryptionMode = (value?"MASTER":"CLEAR");
        this.setState({showDialog: false, dialogTargetValue: null});
    }

    render(){
        const {storageTypes} = this.props;
        const {model, create, observable, encryptionKeys, versioningPolicies, showDialog, dialogTargetValue, m} = this.state;

        let titleActionBarButtons = [];
        if(!create){
            titleActionBarButtons.push(PaperEditorLayout.actionButton(this.context.getMessage('plugins.6'), 'mdi mdi-undo', ()=>{this.resetForm()}, !this.state.dirty));
        }
        titleActionBarButtons.push(PaperEditorLayout.actionButton(this.context.getMessage('53', ''), 'mdi mdi-content-save', ()=>{this.saveSource()}, !observable.isValid() || !this.state.dirty));

        const leftNav = (
            <div style={{padding: '6px 0', color: '#9E9E9E', fontSize: 13}}>
                <div style={{fontSize: 120, textAlign:'center'}}>
                    <i className="mdi mdi-database"/>
                </div>
                <div style={{padding: 16}}>
                    {this.context.getMessage('ws.75')}&nbsp;
                    {this.context.getMessage('ws.76')}
                </div>
                {create && model.StorageType === 'LOCAL' &&
                <div>
                    <Divider/>
                    <div style={{padding: 16}}>
                        {m('legend.local')}
                        <ul>
                            <li style={{listStyle:'disc', marginLeft: 20}}>{m('legend.local.li.1')}</li>
                            <li style={{listStyle:'disc', marginLeft: 20}}>{m('legend.local.li.2')}</li>
                            <li style={{listStyle:'disc', marginLeft: 20}}>{m('legend.local.li.3')}</li>
                        </ul>
                    </div>
                </div>
                }
                {create && model.StorageType === 'S3' &&
                <div>
                    <Divider/>
                    <div style={{padding: 16}}>
                        {m('legend.s3.1')}
                        <br/>
                        {m('legend.s3.2')}
                    </div>
                </div>
                }
                {!create &&
                    <div>
                        <Divider/>
                        <div style={{padding: 16}}>
                            {m('legend.resync')}
                            <div style={{textAlign:'center', marginTop: 10}}>
                                <RaisedButton label={m('legend.resync.button')} onClick={this.launchResync.bind(this)}/>
                            </div>
                        </div>
                    </div>
                }
                {!create &&
                    <div>
                        <Divider/>
                        <div style={{padding: 16}}>
                            {m('legend.delete.1')}
                            <br/>{m('legend.delete.2')}
                            <div style={{textAlign:'center', marginTop: 10}}>
                                <RaisedButton secondary={true} label={m('legend.delete.button')} onClick={this.deleteSource.bind(this)} style={{marginTop: 16}}/>
                            </div>
                        </div>
                    </div>
                }
            </div>
        );

        const title = model.Name ? m('title').replace('%s', model.Name) : m('new');
        let storageConfig = model.StorageConfiguration;
        const styles = {
            title: {
                fontSize: 20,
                paddingTop: 20,
                marginBottom: 0,
            },
            legend: {},
            section: {padding: '0 20px 20px'},
            storageSection: {border: '1px solid #e0e0e0', padding: 20, marginTop: -1, borderRadius: 2},
            toggleDiv:{height: 50, display:'flex', alignItems:'flex-end'}
        };

        let storages = {
            LOCAL: {primaryText:this.context.getMessage('ds.storage.fs', 'ajxp_admin'), image:'fs.png'},
            S3: {primaryText:this.context.getMessage('ds.storage.s3', 'ajxp_admin'), image:'s3-compat.png'},
            AZURE: {primaryText:this.context.getMessage('ds.storage.azure', 'ajxp_admin'), image:'azure.png'},
            GCS: {primaryText:this.context.getMessage('ds.storage.gcs', 'ajxp_admin'), image:'gcs.png'},
        };
        let storageData = {};
        storageTypes.forEach(type => {
            storageData[type] = storages[type];
        });
        if(model.StorageType && !storageData[model.StorageType]){
            storageData[model.StorageType] = storages[model.StorageType];
        }

        return (
            <PydioComponents.PaperEditorLayout
                title={title}
                titleActionBar={titleActionBarButtons}
                closeAction={this.props.closeEditor}
                leftNav={leftNav}
                className="workspace-editor"
                contentFill={false}
            >
                <Dialog
                    open={showDialog}
                    title={m('enc.warning')}
                    onRequestClose={()=>{this.confirmEncryption(!dialogTargetValue)}}
                    actions={[
                        <FlatButton label={"Cancel"} onTouchTap={()=>{this.confirmEncryption(!dialogTargetValue)}}/>,
                        <FlatButton label={m('enc.validate')} onTouchTap={()=>{this.confirmEncryption(dialogTargetValue)}}/>
                    ]}
                >
                    {showDialog === 'enableEncryption' &&
                        <div>
                            <p>{m('enc.dialog.enable.1')}</p>
                            <p>{m('enc.dialog.enable.2')} <b>{m('enc.dialog.enable.2bold')}</b></p>
                            <p>{m('enc.dialog.enable.3')}</p>
                        </div>
                    }
                    {showDialog === 'disableEncryption' &&
                        <div>
                            {m('enc.dialog.disable')}
                        </div>
                    }
                </Dialog>
                <div style={styles.section}>
                    <div style={styles.title}>{m('options')}</div>
                    <TextField fullWidth={true} floatingLabelFixed={true} floatingLabelText={m('options.id') + ' *'} disabled={!create} value={model.Name} onChange={(e,v)=>{model.Name = v}}/>
                    {!create &&
                        <div style={styles.toggleDiv}><Toggle labelPosition={"right"} label={m('options.enabled')} toggled={!model.Disabled} onToggle={(e,v) =>{model.Disabled = !v}} /></div>
                    }
                </div>
                <div style={styles.section}>
                    <DsStorageSelector disabled={!create} value={model.StorageType} onChange={(e,i,v)=>{model.StorageType = v}} values={storageData}/>
                    {model.StorageType === 'LOCAL' &&
                    <div style={styles.storageSection}>
                        <div style={styles.legend}>{m('storage.legend.fs')}</div>
                        <DataSourceLocalSelector model={model} pydio={this.props.pydio}/>
                        <div style={styles.toggleDiv}><Toggle labelPosition={"right"} label={m('storage.fs.macos')} toggled={storageConfig.normalize === "true"} onToggle={(e,v)=>{storageConfig.normalize = (v?"true":"false")}}/></div>
                    </div>
                    }
                    {model.StorageType === 'S3' &&
                        <div style={styles.storageSection}>
                            <div style={styles.legend}>{m('storage.legend.s3')}</div>
                            <TextField fullWidth={true}  floatingLabelFixed={true} floatingLabelText={m('storage.s3.bucket') + ' *'} value={model.ObjectsBucket} onChange={(e,v)=>{model.ObjectsBucket = v}}/>
                            <TextField fullWidth={true} floatingLabelFixed={true} floatingLabelText={m('storage.s3.api') + ' *'} value={model.ApiKey} onChange={(e,v)=>{model.ApiKey = v}}/>
                            <TextField fullWidth={true} floatingLabelFixed={true} floatingLabelText={m('storage.s3.secret') + ' *'} value={model.ApiSecret} onChange={(e,v)=>{model.ApiSecret = v}}/>
                            <TextField fullWidth={true} floatingLabelFixed={true} floatingLabelText={m('storage.s3.path')} value={model.ObjectsBaseFolder} onChange={(e,v)=>{model.ObjectsBaseFolder = v}}/>
                            <TextField fullWidth={true} floatingLabelFixed={true} floatingLabelText={m('storage.s3.endpoint')} hintText={m('storage.s3.endpoint.hint')} value={model.StorageConfiguration.customEndpoint} onChange={(e, v) => { model.StorageConfiguration.customEndpoint = v }}/>
                        </div>
                    }
                    {model.StorageType === 'AZURE' &&
                        <div style={styles.storageSection}>
                            <div style={styles.legend}>{m('storage.legend.azure')}</div>
                            <TextField fullWidth={true}  floatingLabelFixed={true} floatingLabelText={m('storage.azure.bucket') + ' *'} value={model.ObjectsBucket} onChange={(e,v)=>{model.ObjectsBucket = v}}/>
                            <TextField fullWidth={true} floatingLabelFixed={true} floatingLabelText={m('storage.azure.api') + ' *'} value={model.ApiKey} onChange={(e,v)=>{model.ApiKey = v}}/>
                            <TextField fullWidth={true} floatingLabelFixed={true} floatingLabelText={m('storage.azure.secret') + ' *'} value={model.ApiSecret} onChange={(e,v)=>{model.ApiSecret = v}}/>
                            <TextField fullWidth={true} floatingLabelFixed={true} floatingLabelText={m('storage.s3.path')} value={model.ObjectsBaseFolder} onChange={(e,v)=>{model.ObjectsBaseFolder = v}}/>
                        </div>
                    }
                    {model.StorageType === 'GCS' &&
                    <div style={styles.storageSection}>
                        <div style={styles.legend}>{m('storage.legend.gcs')}</div>
                        <TextField fullWidth={true}  floatingLabelFixed={true} floatingLabelText={m('storage.gcs.bucket') + ' *'} value={model.ObjectsBucket} onChange={(e,v)=>{model.ObjectsBucket = v}}/>
                        <TextField fullWidth={true} floatingLabelFixed={true} floatingLabelText={m('storage.gcs.credentials') + ' *'} value={model.StorageConfiguration.jsonCredentials} onChange={(e,v)=>{model.StorageConfiguration.jsonCredentials = v}} multiLine={true}/>
                        <TextField fullWidth={true} floatingLabelFixed={true} floatingLabelText={m('storage.s3.path')} value={model.ObjectsBaseFolder} onChange={(e,v)=>{model.ObjectsBaseFolder = v}}/>
                    </div>
                    }
                </div>
                <Divider/>
                <div style={styles.section}>
                    <div style={styles.title}>{m('datamanagement')}</div>
                    <SelectField fullWidth={true} floatingLabelFixed={true} floatingLabelText={m('versioning')} value={model.VersioningPolicyName} onChange={(e,i,v)=>{model.VersioningPolicyName = v}}>
                        <MenuItem value={undefined} primaryText={m('versioning.disabled')}/>
                        {versioningPolicies.map(key => {
                            return <MenuItem value={key.Uuid} primaryText={key.Name}/>
                        })}
                    </SelectField>
                    <div style={styles.toggleDiv}><Toggle labelPosition={"right"} label={m('enc')} toggled={model.EncryptionMode === "MASTER"} onToggle={(e,v)=>{this.toggleEncryption(v)}}/></div>
                    {model.EncryptionMode === "MASTER" &&
                        <SelectField fullWidth={true} floatingLabelFixed={true} floatingLabelText={m('enc.key')} value={model.EncryptionKey} onChange={(e,i,v)=>{model.EncryptionKey = v}}>
                            {encryptionKeys.map(key => {
                                return <MenuItem value={key.ID} primaryText={key.Label}/>
                            })}
                        </SelectField>
                    }
                </div>

            </PydioComponents.PaperEditorLayout>
        );
    }
}

DataSourceEditor.contextTypes = {
    messages    : React.PropTypes.object,
    getMessage  : React.PropTypes.func
};

export {DataSourceEditor as default};