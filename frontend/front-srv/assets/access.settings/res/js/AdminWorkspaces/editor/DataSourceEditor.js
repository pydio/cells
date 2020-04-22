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

import Pydio from 'pydio'
import React from 'react'
import DataSource from '../model/DataSource'
import {Dialog, Divider, Subheader, SelectField, Toggle, FlatButton, RaisedButton, MenuItem, Paper} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import DataSourceLocalSelector from './DataSourceLocalSelector'
import DsStorageSelector from './DsStorageSelector'
import DataSourceBucketSelector from './DataSourceBucketSelector'
const {PaperEditorLayout} = Pydio.requireLib('components');
const {ModernTextField, ModernSelectField, ModernStyles} = Pydio.requireLib('hoc');

class DataSourceEditor extends React.Component{

    constructor(props){
        super(props);
        const observable = new DataSource(props.dataSource, props.existingNames);
        this.state = {
            dirty:false,
            create: props.create,
            observable: observable,
            model: observable.getModel(),
            loaded :false,
            valid: observable.isValid(),
            encryptionKeys: [],
            versioningPolicies: [],
            s3Custom: observable.getModel().StorageConfiguration.customEndpoint ? 'custom' : 'aws',
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
            if(this.state.dirty){
                alert(this.props.pydio.MessageHash['role_editor.19']);
            } else {
                const observable = new DataSource(newProps.dataSource);
                this.setState({
                    observable,
                    model: observable.getModel()
                });
            }
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
        const {m, observable} = this.state;
        const {pydio} = this.props;
        pydio.UI.openConfirmDialog({
            message:m('delete.warning'),
            validCallback:() => {
                observable.deleteSource().then(() => {
                    this.props.closeEditor();
                    this.props.reloadList();
                });
            },
            destructive:[observable.getModel().Name]
        });
    }

    saveSource(){
        const {observable, create} = this.state;
        this.state.observable.saveSource().then(() => {
            let newDsName = null;
            if(create){
                newDsName = observable.getModel().Name;
            }
            this.setState({valid: true, dirty: false, create: false});
            if (create){
                this.props.closeEditor();
            }
            this.props.reloadList(newDsName);
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
        const {model, encryptionKeys} = this.state;
        model.EncryptionMode = (value?"MASTER":"CLEAR");
        if(value && !model.EncryptionKey && encryptionKeys && encryptionKeys.length){
            model.EncryptionKey = encryptionKeys[0].ID;
        }
        this.setState({showDialog: false, dialogTargetValue: null});
    }

    toggleS3Custom(value){
        const {model} = this.state;
        if(value === "aws"){
            model.StorageConfiguration.customEndpoint = "";
            model.StorageConfiguration.customRegion = "";
        }
        this.setState({s3Custom: value});
    }

    render(){
        const {storageTypes, pydio, readonly} = this.props;
        const {model, create, observable, encryptionKeys, versioningPolicies, showDialog, dialogTargetValue, s3Custom, m} = this.state;

        let titleActionBarButtons = [];
        if(!readonly){
            if(!create){
                titleActionBarButtons.push(PaperEditorLayout.actionButton(this.context.getMessage('plugins.6'), 'mdi mdi-undo', ()=>{this.resetForm()}, !this.state.dirty));
            }
            titleActionBarButtons.push(PaperEditorLayout.actionButton(this.context.getMessage('53', ''), 'mdi mdi-content-save', ()=>{this.saveSource()}, !observable.isValid() || !this.state.dirty));
        }

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
                {!create && !readonly &&
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
        const adminStyles = AdminComponents.AdminStyles(this.props.muiTheme.palette)
        const styles = {
            title: {
                fontSize: 20,
                paddingTop: 20,
                marginBottom: 10,
            },
            legend: {},
            section: {padding: '0 20px 20px', margin: 10, backgroundColor:'white', ...adminStyles.body.block.container},
            storageSection: {padding: 20, marginTop: -1},
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

        const cannotEnableEnc = model.EncryptionMode !== 'MASTER' && (!encryptionKeys || !encryptionKeys.length);

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
                        <FlatButton label={pydio.MessageHash['54']} onTouchTap={()=>{this.confirmEncryption(!dialogTargetValue)}}/>,
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
                <Paper zDepth={0} style={styles.section}>
                    <div style={styles.title}>{m('options')}</div>
                    <ModernTextField fullWidth={true}  hintText={m('options.id') + ' *'} disabled={!create} value={model.Name} onChange={(e,v)=>{model.Name = v}} errorText={observable.getNameError(m)}/>
                    {!create &&
                        <div style={styles.toggleDiv}><Toggle labelPosition={"right"} label={m('options.enabled')} toggled={!model.Disabled} onToggle={(e,v) =>{model.Disabled = !v}} {...ModernStyles.toggleField} /></div>
                    }
                </Paper>
                <Paper zDepth={0} style={{...styles.section, padding: 0}}>
                    <DsStorageSelector disabled={!create} value={model.StorageType} onChange={(e,i,v)=>{model.StorageType = v}} values={storageData}/>
                    {model.StorageType === 'LOCAL' &&
                    <div style={styles.storageSection}>
                        <div style={styles.legend}>{m('storage.legend.fs')}</div>
                        <DataSourceLocalSelector model={model} pydio={this.props.pydio}/>
                        <div style={styles.toggleDiv}><Toggle labelPosition={"right"} label={m('storage.fs.macos')} toggled={storageConfig.normalize === "true"} onToggle={(e,v)=>{storageConfig.normalize = (v?"true":"false")}} {...ModernStyles.toggleField}/></div>
                    </div>
                    }
                    {model.StorageType === 'S3' &&
                        <div style={styles.storageSection}>
                            <div style={styles.legend}>{m('storage.legend.s3')}</div>
                            <ModernSelectField fullWidth={true} value={s3Custom} onChange={(e,i,v)=>{this.toggleS3Custom(v)}}>
                                <MenuItem value={"aws"} primaryText={m('storage.s3.endpoint.amazon')}/>
                                <MenuItem value={"custom"} primaryText={m('storage.s3.endpoint.custom')}/>
                            </ModernSelectField>
                            {s3Custom === 'custom' &&
                            <div>
                                <ModernTextField fullWidth={true} hintText={m('storage.s3.endpoint') + ' - ' + m('storage.s3.endpoint.hint')} value={model.StorageConfiguration.customEndpoint} onChange={(e, v) => {model.StorageConfiguration.customEndpoint = v}}/>
                                <ModernTextField fullWidth={true} hintText={m('storage.s3.region')} value={model.StorageConfiguration.customRegion} onChange={(e, v) => {model.StorageConfiguration.customRegion = v}}/>
                            </div>
                            }
                            <ModernTextField fullWidth={true} hintText={m('storage.s3.api') + ' *'} value={model.ApiKey} onChange={(e,v)=>{model.ApiKey = v}}/>
                            <form autoComplete={"off"}>
                                <input type="hidden" value="something"/>
                                <ModernTextField autoComplete={"off"} fullWidth={true} type={"password"} hintText={m('storage.s3.secret') + ' *'} value={model.ApiSecret} onChange={(e,v)=>{model.ApiSecret = v}}/>
                            </form>
                            <DataSourceBucketSelector dataSource={model} hintText={m('storage.s3.bucket')}/>
                            <div style={{...styles.legend, paddingTop: 40}}>{m('storage.s3.legend.tags')}</div>
                            <div style={{display:'flex'}}>
                                <div style={{flex:1, marginRight: 5}}>
                                    <ModernTextField
                                        fullWidth={true}
                                        disabled={!!model.StorageConfiguration.ObjectsBucket}
                                        hintText={m('storage.s3.bucketsTags')}
                                        value={model.StorageConfiguration.bucketsTags || ''}
                                        onChange={(e,v)=>{model.StorageConfiguration.bucketsTags = v;}}/>
                                </div>
                                <div style={{flex:1, marginLeft: 5}}>
                                    <ModernTextField
                                        disabled={true}
                                        fullWidth={true}
                                        hintText={m('storage.s3.objectsTags') + ' (not implemented yet)'}
                                        value={model.StorageConfiguration.objectsTags || ''}
                                        onChange={(e,v)=>{model.StorageConfiguration.objectsTags = v;}}/>
                                </div>
                            </div>
                        </div>
                    }
                    {model.StorageType === 'AZURE' &&
                        <div style={styles.storageSection}>
                            <div style={styles.legend}>{m('storage.legend.azure')}</div>
                            <ModernTextField fullWidth={true}  hintText={m('storage.azure.bucket') + ' *'} value={model.ObjectsBucket} onChange={(e,v)=>{model.ObjectsBucket = v}}/>
                            <ModernTextField fullWidth={true} hintText={m('storage.azure.api') + ' *'} value={model.ApiKey} onChange={(e,v)=>{model.ApiKey = v}}/>
                            <ModernTextField fullWidth={true} hintText={m('storage.azure.secret') + ' *'} value={model.ApiSecret} onChange={(e,v)=>{model.ApiSecret = v}}/>
                            <ModernTextField fullWidth={true} hintText={m('storage.s3.path')} value={model.ObjectsBaseFolder} onChange={(e,v)=>{model.ObjectsBaseFolder = v}}/>
                        </div>
                    }
                    {model.StorageType === 'GCS' &&
                    <div style={styles.storageSection}>
                        <div style={styles.legend}>{m('storage.legend.gcs')}</div>
                        <ModernTextField fullWidth={true} hintText={m('storage.gcs.bucket') + ' *'} value={model.ObjectsBucket} onChange={(e,v)=>{model.ObjectsBucket = v}}/>
                        <ModernTextField fullWidth={true} hintText={m('storage.gcs.credentials') + ' *'} value={model.StorageConfiguration.jsonCredentials} onChange={(e,v)=>{model.StorageConfiguration.jsonCredentials = v}} multiLine={true}/>
                        <ModernTextField fullWidth={true} hintText={m('storage.s3.path')} value={model.ObjectsBaseFolder} onChange={(e,v)=>{model.ObjectsBaseFolder = v}}/>
                    </div>
                    }
                </Paper>
                <Paper zDepth={0} style={styles.section}>
                    <div style={styles.title}>{m('datamanagement')}</div>

                    <div style={{...styles.legend, paddingTop: 20}}>{m('storage.legend.versioning')}</div>
                    <ModernSelectField fullWidth={true} value={model.VersioningPolicyName} onChange={(e,i,v)=>{model.VersioningPolicyName = v}}>
                        <MenuItem value={undefined} primaryText={m('versioning.disabled')}/>
                        {versioningPolicies.map(key => {
                            return <MenuItem value={key.Uuid} primaryText={key.Name}/>
                        })}
                    </ModernSelectField>

                    {model.StorageType !== 'LOCAL' &&
                    <div>
                        <div style={{...styles.legend, paddingTop: 20}}>{m('storage.legend.readOnly')}</div>
                        <Toggle
                            label={m('storage.readOnly')}
                            labelPosition={"right"}
                            toggled={model.StorageConfiguration.readOnly === 'true'}
                            onToggle={(e,v)=>{model.StorageConfiguration.readOnly = (v ? 'true' : '');}}
                            {...ModernStyles.toggleField}
                        />
                    </div>
                    }

                    {(!model.StorageConfiguration.readOnly || model.StorageConfiguration.readOnly !== 'true') &&
                    <div>
                        <div style={{...styles.legend, paddingTop: 20}}>{m('storage.legend.checksumMapper')}</div>
                        <Toggle
                            label={m('storage.nativeEtags')}
                            labelPosition={"right"}
                            toggled={model.StorageConfiguration.nativeEtags}
                            onToggle={(e,v)=>{model.StorageConfiguration.nativeEtags = (v ? 'true' : '');}}
                            {...ModernStyles.toggleField}
                        />
                        {!model.StorageConfiguration.nativeEtags &&
                            <div>
                                <Toggle
                                    label={m('storage.checksumMapper')}
                                    labelPosition={"right"}
                                    toggled={model.StorageConfiguration.checksumMapper === 'dao'}
                                    onToggle={(e,v)=>{model.StorageConfiguration.checksumMapper = (v ? 'dao' : '');}}
                                {...ModernStyles.toggleField}
                                />
                            </div>
                        }
                    </div>
                    }

                    <div style={{...styles.legend, paddingTop: 20}}>{m('storage.legend.encryption')}</div>
                    <div style={styles.toggleDiv}>
                        <Toggle labelPosition={"right"} label={m('enc') + (cannotEnableEnc ? ' (' + pydio.MessageHash['ajxp_admin.ds.encryption.key.emptyState']+')' :'')} toggled={model.EncryptionMode === "MASTER"} onToggle={(e,v)=>{this.toggleEncryption(v)}}
                                disabled={cannotEnableEnc} {...ModernStyles.toggleField}/>
                    </div>
                    {model.EncryptionMode === "MASTER" &&
                        <ModernSelectField fullWidth={true} hintText={m('enc.key')} value={model.EncryptionKey} onChange={(e,i,v)=>{model.EncryptionKey = v}}>
                            {encryptionKeys.map(key => {
                                return <MenuItem value={key.ID} primaryText={key.Label}/>
                            })}
                        </ModernSelectField>
                    }
                </Paper>

            </PydioComponents.PaperEditorLayout>
        );
    }
}

DataSourceEditor.contextTypes = {
    messages    : React.PropTypes.object,
    getMessage  : React.PropTypes.func
};

DataSourceEditor = muiThemeable()(DataSourceEditor);

export {DataSourceEditor as default};