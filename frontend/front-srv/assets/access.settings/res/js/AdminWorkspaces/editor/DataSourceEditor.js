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

import PropTypes from 'prop-types';

import Pydio from 'pydio';
import PydioApi from 'pydio/http/api'
import React,{Fragment} from 'react'
import DataSource from '../model/DataSource'
import {Dialog, Divider, Checkbox, Toggle, FlatButton, RaisedButton, MenuItem, Paper, Stepper, Step, StepLabel} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import DataSourceLocalSelector from './DataSourceLocalSelector'
import DsStorageSelector from './DsStorageSelector'
import DataSourceBucketSelector from './DataSourceBucketSelector'
const {PaperEditorLayout, AdminStyles} = AdminComponents;
const {ModernTextField, ModernSelectField, ModernStyles} = Pydio.requireLib('hoc');
import {ConfigServiceApi, EncryptionAdminCreateKeyRequest} from 'cells-sdk'

const createSteps = ['main', 'storage', 'data', 'advanced'];

class DataSourceEditor extends React.Component{

    constructor(props){
        super(props);
        const {pydio, create, dataSource, existingNames, createStructure} = props;
        const observable = new DataSource(dataSource, existingNames, createStructure);
        this.state = {
            dirty:false,
            create: create,
            observable: observable,
            model: observable.getModel(),
            loaded :false,
            valid: observable.isValid(),
            encryptionKeys: [],
            versioningPolicies: [],
            s3Custom: observable.getModel().StorageConfiguration.customEndpoint ? 'custom' : 'aws',
            m: (id) => pydio.MessageHash['ajxp_admin.ds.editor.' + id] || id
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
        const {model} = this.state
        if(value === 'VALUE_CREATE'){
            this.setState({showDialog:'enableEncryptionWithCreate', dialogTargetValue: value, newKeyName:model.Name||''});
        } else if (value === 'VALUE_CLEAR') {
            this.setState({showDialog:'disableEncryption', dialogTargetValue: value});
        } else if (model.EncryptionMode !== 'MASTER') {
            this.setState({showDialog:'enableEncryption', dialogTargetValue: value});
        } else {
            model.EncryptionKey = value;
        }
    }

    confirmEncryption(value){
        const {model, newKeyName} = this.state;

        if(value === 'VALUE_CREATE') {
            const api = new ConfigServiceApi(PydioApi.getRestClient());
            let req = new EncryptionAdminCreateKeyRequest();
            req.KeyID = newKeyName;
            req.Label = newKeyName;
            api.createEncryptionKey(req).then((result) => {
                model.EncryptionMode = 'MASTER';
                model.EncryptionKey = newKeyName;
                this.setState({showDialog: false, dialogTargetValue:null, encryptionKeys:[{ID:newKeyName, Label:newKeyName}]})
            }).catch(() => {
                //this.setState({showDialog: false})
            })
            return
        }

        if(value === 'VALUE_CLEAR') {
            model.EncryptionMode = 'CLEAR';
            model.EncryptionKey = '';
        } else {
            model.EncryptionMode = 'MASTER';
            model.EncryptionKey = value;
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

    stepperBack(){
        const {currentPane = 'main'} = this.state;
        const i = createSteps.indexOf(currentPane);
        if(i > 0) {
            this.setState({currentPane: createSteps[i-1]})
        }
    }
    stepperNext(){
        const {currentPane = 'main'} = this.state;
        const i = createSteps.indexOf(currentPane);
        if(i < createSteps.length - 1) {
            this.setState({currentPane: createSteps[i+1]})
        }
    }

    render(){
        const {storageTypes, pydio, readonly} = this.props;
        const {currentPane = 'main', model, create, observable, encryptionKeys, versioningPolicies, showDialog, dialogTargetValue, newKeyName, s3Custom, m} = this.state;

        let titleActionBarButtons = [];
        if(!readonly && !create){
            titleActionBarButtons.push(<Toggle style={{borderRight: '1px solid #e0e0e0', paddingRight: 14, zoom: 0.8}} labelStyle={{fontSize:17}} toggled={!model.Disabled} onToggle={(e,v)=>{model.Disabled=!v}} labelPosition={"right"} label={m('options.enabled')}/>)
            titleActionBarButtons.push(PaperEditorLayout.actionButton(this.context.getMessage('plugins.6'), 'mdi mdi-undo', ()=>{this.resetForm()}, !this.state.dirty));
            titleActionBarButtons.push(PaperEditorLayout.actionButton(this.context.getMessage('plugins.6'), 'mdi mdi-content-save', ()=>{this.saveSource()}, !this.state.dirty));
        }

        const leftNavOldLegends = (
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
        const adminStyles = AdminStyles(this.props.muiTheme.palette)
        const styles = {
            title: {
                ...adminStyles.body.block.headerFull,
                margin: '0 -20px',
            },
            legend: {},
            subLegend:{
                padding: '10px 6px 0 4px',
                fontSize: 12,
                lineHeight: '16px',
                color: 'rgba(0,0,0,0.6)',
                textAlign: 'justify',
            },
            section: {padding: '0 20px 20px', margin: 10, backgroundColor:'white', ...adminStyles.body.block.container},
            storageSection: {padding: 20, marginTop: -1},
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

        const makeStyle = (style, key) => {
            if(key === currentPane){
                return style
            } else {
                return {...style, display:'none'};
            }
        }

        let Steps, CreateButton;
        if(create) {
            const stepperStyle = {
                display:'flex',
                alignItems:'center',
                padding:'0 20px 0 8px',
                position: 'absolute',
                height: 64,
                zIndex: 10,
                top: 64,
                left: 0,
                right: 0,
                backgroundColor: 'rgb(246 246 248)',
                boxShadow: 'rgba(0, 0, 0, .1) 0px 1px 2px'
            };
            let backDisabled = createSteps.indexOf(currentPane) === 0;
            let nextDisabled = createSteps.indexOf(currentPane) === createSteps.length - 1
            if(currentPane === 'main' && (!model.Name || observable.getNameError(m))){
                nextDisabled = true;
            } else if(currentPane === 'storage' && !observable.isValid()){
                nextDisabled = true;
            }
            Steps = (
                <div style={stepperStyle}>
                    <div style={{flex: 1}}>
                        <Stepper activeStep={createSteps.indexOf(currentPane)}>
                            <Step>
                                <StepLabel>{m('tab.identifier')}</StepLabel>
                            </Step>
                            <Step>
                                <StepLabel>{m('tab.storage')}</StepLabel>
                            </Step>
                            <Step>
                                <StepLabel>{m('tab.lifecycle')}</StepLabel>
                            </Step>
                            <Step>
                                <StepLabel>{m('tab.advanced')}</StepLabel>
                            </Step>
                        </Stepper>
                    </div>
                </div>
            );
            CreateButton = (
                <div style={{...stepperStyle, top: null, bottom: 0, backgroundColor:'white', boxShadow:'rgba(0, 0, 0, .1) 0px -1px 2px'}}>
                    <span style={{flex: 1}}/>
                    <FlatButton primary={true} label={m('tab.button-back')} onClick={()=>this.stepperBack()} disabled={backDisabled}/>
                    <FlatButton primary={true} label={m('tab.button-next')} onClick={()=>this.stepperNext()} disabled={nextDisabled}/>
                    <div style={{width:1, height:40, backgroundColor:'#efefef', margin:'0 5px'}}/>
                    <FlatButton primary={true} label={m('tab.button-create')} onClick={()=>this.saveSource()} disabled={!observable.isValid()}/>
                </div>
            );
        }

        const EncDialog = (
            <Dialog
                open={showDialog}
                title={m('enc.warning')}
                onRequestClose={()=>{this.setState({showDialog:false, dialogTargetValue:null})}}
                actions={[
                    <FlatButton label={pydio.MessageHash['54']} onClick={()=>{this.setState({showDialog:false, dialogTargetValue:null})}}/>,
                    <FlatButton label={m('enc.validate')} disabled={showDialog === 'enableEncryptionWithCreate' && !newKeyName} onClick={()=>{this.confirmEncryption(dialogTargetValue)}}/>
                ]}
            >
                {(showDialog === 'enableEncryption' || showDialog === 'enableEncryptionWithCreate' ) &&
                <div style={{lineHeight:'1.6em'}}>
                    {m('enc.dialog.enable.1')}&nbsp;{m('enc.dialog.enable.2')} <b style={{fontWeight:500}}>{m('enc.dialog.enable.2bold')}</b>
                    <br/>{m('enc.dialog.enable.3')}
                    {showDialog === 'enableEncryptionWithCreate' &&
                    <div>
                        <ModernTextField hintText={m('enc.dialog.enable.create')} fullWidth={true} variant={'v2'} value={newKeyName} onChange={(e,v) => {this.setState({newKeyName:v})}} />
                    </div>
                    }
                </div>
                }
                {showDialog === 'disableEncryption' &&
                <div style={{lineHeight:'1.6em'}}>
                    {m('enc.dialog.disable')}
                </div>
                }
            </Dialog>
        );

        const MainOptions = (
            <Paper zDepth={0} style={makeStyle(styles.section, 'main')}>
                <div style={{...styles.title, marginBottom:16}}>{m('options')}</div>
                <ModernTextField fullWidth={true} variant={'v2'} hintText={m('options.id') + ' *'} disabled={!create} value={model.Name} onChange={(e,v)=>{model.Name = v}} errorText={observable.getNameError(m)}/>
            </Paper>
        );
        const DsType = (
            <Paper zDepth={0} style={makeStyle({...styles.section, padding: 0, marginBottom: create?200:null}, create?'storage':'main')}>
                <DsStorageSelector disabled={!create} value={model.StorageType} onChange={(e,i,v)=>{model.StorageType = v}} values={storageData}/>
                {model.StorageType === 'LOCAL' &&
                <div style={styles.storageSection}>
                    <div style={styles.legend}>{m('storage.legend.fs')}</div>
                    <DataSourceLocalSelector model={model} pydio={this.props.pydio} styles={styles}/>
                    {!model.FlatStorage &&
                        <div>
                            <Checkbox
                                labelPosition={"right"}
                                label={m('storage.fs.macos')}
                                checked={storageConfig.normalize === "true"}
                                onCheck={(e,v)=>{storageConfig.normalize = (v?"true":"false")}}
                                {...ModernStyles.toggleFieldV2}
                            />
                        </div>
                    }
                </div>
                }
                {model.StorageType === 'S3' &&
                <div style={styles.storageSection}>
                    <div style={styles.legend}>{m('storage.legend.s3')}</div>
                    <ModernSelectField fullWidth={true} variant={'v2'} hintText={"Endpoint type"} value={s3Custom} onChange={(e,i,v)=>{this.toggleS3Custom(v)}}>
                        <MenuItem value={"aws"} primaryText={m('storage.s3.endpoint.amazon')}/>
                        <MenuItem value={"custom"} primaryText={m('storage.s3.endpoint.custom')}/>
                    </ModernSelectField>
                    {s3Custom === 'custom' &&
                    <div>
                        <ModernTextField fullWidth={true} variant={'v2'} hintText={m('storage.s3.endpoint') + ' - ' + m('storage.s3.endpoint.hint')} value={model.StorageConfiguration.customEndpoint} onChange={(e, v) => {model.StorageConfiguration.customEndpoint = v}}/>
                        <ModernTextField fullWidth={true} variant={'v2'} hintText={m('storage.s3.region')} value={model.StorageConfiguration.customRegion} onChange={(e, v) => {model.StorageConfiguration.customRegion = v}}/>
                    </div>
                    }
                    <ModernTextField fullWidth={true} variant={'v2'} hintText={m('storage.s3.api') + ' *'} value={model.ApiKey} onChange={(e,v)=>{model.ApiKey = v}}/>
                    <form autoComplete={"off"}>
                        <input type="hidden" value="something"/>
                        <ModernTextField autoComplete={"off"} fullWidth={true} variant={'v2'} type={"password"} hintText={m('storage.s3.secret') + ' *'} value={model.ApiSecret} onChange={(e,v)=>{model.ApiSecret = v}}/>
                    </form>
                    <DataSourceBucketSelector dataSource={model} hintText={m('storage.s3.bucket')}/>
                    {model.ObjectsBucket && <div style={{paddingTop: 20}}>
                        <ModernTextField
                            fullWidth={true}
                            variant={"v2"}
                            hintText={m('storage.s3.bucketPathPrefix')}
                            value={model.ObjectsBaseFolder || ""}
                            onChange={(e,v) =>{model.ObjectsBaseFolder = v}}
                        />
                    </div>
                    }
                    <div style={{...styles.subLegend, paddingTop: 40}}>{m('storage.s3.legend.tags')}</div>
                    <div style={{display:'flex'}}>
                        <div style={{flex:1, marginRight: 5}}>
                            <ModernTextField
                                fullWidth={true}
                                variant={'v2'}
                                disabled={!!model.ObjectsBucket}
                                hintText={m('storage.s3.bucketsTags')}
                                value={model.StorageConfiguration.bucketsTags || ''}
                                onChange={(e,v)=>{model.StorageConfiguration.bucketsTags = v;}}/>
                        </div>
                        <div style={{flex:1, marginLeft: 5}}>
                            <ModernTextField
                                disabled={true}
                                fullWidth={true}
                                variant={'v2'}
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
                    <ModernTextField fullWidth={true} variant={'v2'} hintText={m('storage.azure.bucket') + ' *'} value={model.ObjectsBucket} onChange={(e,v)=>{model.ObjectsBucket = v}}/>
                    <ModernTextField fullWidth={true} variant={'v2'} hintText={m('storage.azure.api') + ' *'} value={model.ApiKey} onChange={(e,v)=>{model.ApiKey = v}}/>
                    <ModernTextField fullWidth={true} variant={'v2'} type={"password"} hintText={m('storage.azure.secret') + ' *'} value={model.ApiSecret} onChange={(e,v)=>{model.ApiSecret = v}}/>
                </div>
                }
                {model.StorageType === 'GCS' &&
                <div style={styles.storageSection}>
                    <div style={styles.legend}>{m('storage.legend.gcs')}</div>
                    <ModernTextField fullWidth={true} variant={'v2'} hintText={m('storage.gcs.bucket') + ' *'} value={model.ObjectsBucket} onChange={(e,v)=>{model.ObjectsBucket = v}}/>
                    <ModernTextField fullWidth={true} variant={'v2'} hintText={m('storage.gcs.credentials') + ' *'} value={model.StorageConfiguration.jsonCredentials} onChange={(e,v)=>{model.StorageConfiguration.jsonCredentials = v}} multiLine={true}/>
                    <ModernTextField fullWidth={true} variant={'v2'} hintText={m('storage.s3.path')} value={model.ObjectsBaseFolder} onChange={(e,v)=>{model.ObjectsBaseFolder = v}}/>
                </div>
                }
            </Paper>
        );
        const DataLifecycle = (
            <Paper zDepth={0} style={makeStyle(styles.section, 'data')}>

                <div style={styles.title}>{m('datamanagement')}</div>

                {!model.StorageConfiguration.cellsInternal &&
                <Fragment>
                    <div style={{...styles.subLegend, paddingTop: 20}}>{m('storage.legend.versioning')}</div>
                    <ModernSelectField fullWidth={true} variant={'v2'} hintText={m('versioning')} value={model.VersioningPolicyName} onChange={(e,i,v)=>{model.VersioningPolicyName = v}}>
                        <MenuItem value={undefined} primaryText={m('versioning.disabled')}/>
                        {versioningPolicies.map(key => {
                            return <MenuItem value={key.Uuid} primaryText={key.Name + ' (stored in ' + key.VersionsDataSourceName + ')'}/>
                        })}
                    </ModernSelectField>
                </Fragment>
                }

                <div style={{...styles.subLegend, paddingTop: 20}}>{m('storage.legend.encryption')}</div>
                <ModernSelectField fullWidth={true} variant={'v2'} hintText={m('enc.key')} value={model.EncryptionMode === 'MASTER' ? model.EncryptionKey : 'VALUE_CLEAR'} onChange={(e, i, v)=>{this.toggleEncryption(v)}}>
                    <MenuItem value={'VALUE_CLEAR'} primaryText={m('enc.key.clear')}/>
                    {encryptionKeys.map(key => {
                        return <MenuItem value={key.ID} primaryText={key.Label}/>
                    })}
                    {model.EncryptionMode !== 'MASTER' && encryptionKeys.length === 0 && <MenuItem value={'VALUE_CREATE'} primaryText={m('enc.key.create')}/>}
                </ModernSelectField>

            </Paper>
        );

        const AdvancedOptions = (
            <Paper zDepth={0} style={makeStyle(styles.section, 'advanced')}>
                <div style={styles.title}>{'Advanced storage options'}</div>

                {!model.StorageConfiguration.cellsInternal &&
                <div>
                    <div style={{...styles.subLegend, paddingTop: 20}}>{m('storage.legend.flatStorage')}</div>
                    <Checkbox
                        label={m('storage.flatStorage')}
                        labelPosition={"right"}
                        disabled={!create}
                        checked={!model.FlatStorage}
                        onCheck={(e,v)=>{model.FlatStorage = !v}}
                        {...ModernStyles.toggleFieldV2}
                    />
                    {create && model.FlatStorage &&
                    <ModernTextField
                        fullWidth={true}
                        variant={'v2'}
                        hintText={m('initFlatFromSnapshot')}
                        value={model.StorageConfiguration.initFromSnapshot || ''}
                        onChange={(e,v)=>{
                            if (v) {
                                model.StorageConfiguration.initFromSnapshot = v;
                            } else {
                                delete (model.StorageConfiguration.initFromSnapshot)
                            }
                        }}/>
                    }
                </div>
                }

                {!model.FlatStorage &&
                <div>
                    <div style={{...styles.subLegend, paddingTop: 20}}>{m('storage.legend.skipResync')}</div>
                    <Checkbox
                        label={m('storage.skipResync')}
                        labelPosition={"right"}
                        checked={model.SkipSyncOnRestart}
                        onCheck={(e,v)=>{model.SkipSyncOnRestart = v}}
                        {...ModernStyles.toggleFieldV2}
                    />
                </div>
                }


                {model.StorageType !== 'LOCAL' &&
                <div>
                    <div style={{...styles.subLegend, paddingTop: 20}}>{m('storage.legend.readOnly')}</div>
                    <Checkbox
                        label={m('storage.readOnly')}
                        labelPosition={"right"}
                        checked={model.StorageConfiguration.readOnly === 'true'}
                        onCheck={(e,v)=>{model.StorageConfiguration.readOnly = (v ? 'true' : '');}}
                        {...ModernStyles.toggleFieldV2}
                    />
                </div>
                }

                {(!model.StorageConfiguration.readOnly || model.StorageConfiguration.readOnly !== 'true') &&
                <div>
                    <div style={{...styles.subLegend, paddingTop: 20}}>{m('storage.legend.checksumMapper')}</div>
                    <Checkbox
                        label={m('storage.nativeEtags')}
                        labelPosition={"right"}
                        checked={model.StorageConfiguration.nativeEtags}
                        onCheck={(e,v)=>{model.StorageConfiguration.nativeEtags = (v ? 'true' : '');}}
                        {...ModernStyles.toggleFieldV2}
                    />
                    {!model.StorageConfiguration.nativeEtags &&
                    <div>
                        <Checkbox
                            label={m('storage.checksumMapper')}
                            labelPosition={"right"}
                            checked={model.StorageConfiguration.checksumMapper === 'dao'}
                            onCheck={(e,v)=>{model.StorageConfiguration.checksumMapper = (v ? 'dao' : '');}}
                            {...ModernStyles.toggleFieldV2}
                        />
                    </div>
                    }
                </div>
                }

            </Paper>
        );

        return (
            <PaperEditorLayout
                title={title}
                titleLeftIcon={'mdi mdi-database'}
                titleActionBar={titleActionBarButtons}
                closeAction={this.props.closeEditor}
                leftNavItems={create?null:[{
                    label:m('tab.main'), value:'main', icon:'mdi mdi-database-plus'},
                    {label:m('tab.lifecycle'), value:'data', icon:'mdi mdi-recycle'},
                    {label:m('tab.advanced'), value:'advanced', icon:'mdi mdi-settings'}
                    ]}
                leftNavSelected={currentPane}
                leftNavChange={(key) => {this.setState({currentPane:key})}}
                className="workspace-editor"
                contentFill={false}
                rightPanelStyle={create?{paddingTop: 64}:null}
            >
                {Steps}
                {EncDialog}
                {DsType}
                {MainOptions}
                {DataLifecycle}
                {AdvancedOptions}
                {CreateButton}
            </PaperEditorLayout>
        );
    }
}

DataSourceEditor.contextTypes = {
    messages    : PropTypes.object,
    getMessage  : PropTypes.func
};

DataSourceEditor = muiThemeable()(DataSourceEditor);

export {DataSourceEditor as default};