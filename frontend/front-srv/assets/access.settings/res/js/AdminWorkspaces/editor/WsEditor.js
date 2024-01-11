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
import React, {Fragment, Component} from 'react'
import {FlatButton, Paper, Checkbox, MenuItem, Dialog} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import Workspace from '../model/Ws'
import WsAutoComplete from './WsAutoComplete'
import {loadEditorClass} from "./MetaNamespace";
import stepper from "./stepper";
import PathUtils from 'pydio/util/path'
const {ModernTextField, ModernSelectField, ThemedModernStyles} = Pydio.requireLib('hoc');
const {InputIntegerBytes} = Pydio.requireLib('form');
const {PaperEditorLayout, AdminStyles} = AdminComponents;

class WsEditor extends Component {

    constructor(props){
        super(props);
        const workspace = props.presetModel || new Workspace(props.workspace);

        workspace.observe('update', () => {
            this.forceUpdate();
        });
        this.state = {
            workspace: workspace.getModel(),
            container: workspace,
            newFolderKey: Math.random(),
            showDialog: false
        };
        const {policiesBuilder} = this.props;
        if(policiesBuilder) {
            loadEditorClass(policiesBuilder, null).then(c => this.setState({PoliciesBuilder: c})).catch(e=>{});
        }

    }

    enableSync(value){
        if(value){
            this.setState({showDialog:'enableSync', dialogTargetValue: value});
        } else {
            this.setState({showDialog:'disableSync', dialogTargetValue: value});
        }
    }

    confirmSync(value){
        const {workspace} = this.state;
        workspace.Attributes['ALLOW_SYNC']= value;
        this.setState({showDialog: false, dialogTargetValue: null});
    }

    revert(){
        const {container} = this.state;
        container.revert();
        this.setState({workspace: container.getModel()}, () => {this.forceUpdate()});
    }

    save(){
        const {container} = this.state;
        const {reloadList, closeEditor} = this.props;
        this.setState({saving: true});
        const {create} = container;
        container.save().then(() => {
            reloadList();
            this.setState({
                workspace: container.getModel(),
                saving: false}, () => {this.forceUpdate()
            });
            if(create){
                closeEditor();
            }
        }).catch(()=>{
            this.setState({saving: false});
        });
    }

    remove(){
        const {container} = this.state;
        const {closeEditor, reloadList, pydio} = this.props;
        pydio.UI.openConfirmDialog({
            message:pydio.MessageHash['settings.35'],
            destructive:[container.getModel().Label],
            validCallback:() => {
                container.remove().then(() => {
                    reloadList();
                    closeEditor();
                });
            }
        });
    }

    render(){

        const {closeEditor, pydio, advanced, muiTheme} = this.props;
        const {workspace, container, newFolderKey, saving, showDialog, dialogTargetValue, PoliciesBuilder, policiesEdit} = this.state;

        const ModernStyles = ThemedModernStyles(muiTheme)
        const m = id => pydio.MessageHash['ajxp_admin.' + id] || id;
        const mS = id => pydio.MessageHash['settings.' + id] || id;
        const policiesMS = id => pydio.MessageHash['advanced_settings.' + id] || id;
        const readonly = !workspace.PoliciesContextEditable;

        let buttons = [];
        if(!container.create && !readonly){
            buttons.push(PaperEditorLayout.actionButton(m('plugins.6'), "mdi mdi-undo", () => {this.revert()}, !container.isDirty()));
        }
        if(!readonly){
            buttons.push(PaperEditorLayout.actionButton(pydio.MessageHash['53'], "mdi mdi-content-save", ()=>{this.save()} ,saving || (!(container.isDirty() && container.isValid()))));
        }

        const adminStyles = AdminStyles(this.props.muiTheme.palette);
        const styles = {
            title: {...adminStyles.body.block.headerFull, margin:'0 -20px'},
            /*legend: {color: '#9E9E9E', paddingTop: 10, paddingLeft: 4},*/
            legend: {padding:'16px 4px 8px'},
            section: {padding: '0 20px 20px', margin: 10, backgroundColor:'white', ...adminStyles.body.block.container},
            toggleDiv:{},
            divider:{margin: '24px -20px 0px', height: 1, border: 'none', backgroundColor: 'rgb(236 239 241)'}
        };

        const roots = workspace.RootNodes;
        let completers = Object.keys(roots).map(
            (k)=> {
                const isTemplatePath = Workspace.rootIsTemplatePath(roots[k])
                const label = isTemplatePath ?  m('ws.editor.path.template') : m('ws.complete.folders');
                return (
                    <WsAutoComplete
                        key={roots[k].Uuid}
                        pydio={pydio}
                        label={label}
                        value={roots[k].Path}
                        isTemplatePath={isTemplatePath?roots[k]:null}
                        onDelete={() => {
                            delete(roots[k]);
                            this.forceUpdate()
                        }}
                        onChange={(key,node) => {
                            delete(roots[k]);
                            if(key !== '') {
                                roots[node.Uuid] = node;
                            }
                        }}
                        skipTemplates={container.hasFolderRoots()}
                    />
                )
            }
        );
        if(!container.hasTemplatePath()){
            const {newRoot = false} = this.state;
            const first = !Object.keys(roots).length
            if(first || newRoot) {
                completers.push(
                    <WsAutoComplete
                        key={newFolderKey}
                        pydio={pydio}
                        value={""}
                        onChange={(k,node) => {
                            if(node){
                                roots[node.Uuid] = node;
                                this.setState({newFolderKey: Math.random(), newRoot: false})
                            }
                        }}
                        skipTemplates={container.hasFolderRoots()}
                    />);
            } else {
                completers.push(
                    <FlatButton label={"+ "+m('ws.complete.additional')} onClick={() => this.setState({newRoot: true})} primary={true}/>
                )
            }
        }

        let Stepper, StepperButtons, makeStyle = (s, p) => s;
        if(container.create) {
            const {currentPane = 'data'} = this.state;
            const steps = {
                data:m('ws.editor.data.title'),
                main:m('ws.30'),
                other:m('ws.editor.other')
            }
            makeStyle = (s, p) => (p === currentPane ? {...s, marginTop: 80} : {display:'none'})
            let disableNext;
            if(currentPane === 'data' && Object.keys(roots).length === 0){
                disableNext = true
            }
            const stepperData = stepper(
                steps,
                currentPane,
                (p)=>{
                    if(currentPane === 'data' && p === 'main' && Object.keys(roots).length === 1 && !workspace.Label){
                        workspace.Label = PathUtils.getBasename(roots[Object.keys(roots)[0]].Path);
                    }
                    this.setState({currentPane:p})
                },
                disableNext,
                () => this.save(),
                ()=>container.isValid(),
                {
                    back:m('ds.editor.tab.button-back'),
                    next:m('ds.editor.tab.button-next'),
                    save:m('ds.editor.tab.button-create')
                }
            )
            Stepper = stepperData.Steps
            StepperButtons = stepperData.Buttons
        }

        const EncDialog = (
            <Dialog
                open={showDialog}
                title={m('ws.editor.sync.warning')}
                onRequestClose={()=>{this.confirmSync(!dialogTargetValue)}}
                actions={[
                    <FlatButton label={pydio.MessageHash['54']} onClick={()=>{this.confirmSync(!dialogTargetValue)}}/>,
                    <FlatButton label={m('ws.editor.sync.warning.validate')} onClick={()=>{this.confirmSync(dialogTargetValue)}}/>
                ]}
            >
                {showDialog === 'enableSync' &&
                    <div>
                        {m('ws.editor.sync.warning.enable')}
                    </div>
                }
                {showDialog === 'disableSync' &&
                    <div>
                        {m('ws.editor.sync.warning.disable')}
                    </div>
                }
            </Dialog>
        );
        const PaneLabel = (
            <Paper zDepth={0} style={makeStyle(styles.section, 'main')}>
                <div style={styles.title}>{m('ws.30')}</div>
                <div style={styles.legend}>{m('ws.editor.options.legend')}</div>

                <ModernTextField
                    fullWidth={true}
                    errorText={workspace.Label ? "" : m('ws.editor.label.legend')}
                    floatingLabelText={mS('8')}
                    value={workspace.Label}
                    onChange={(e,v)=>{workspace.Label = v}}
                    variant={'v2'}
                />
                <ModernTextField
                    fullWidth={true}
                    errorText={(workspace.Label && !workspace.Slug) ? m('ws.editor.slug.legend') : ""}
                    floatingLabelText={m('ws.5')}
                    value={workspace.Slug}
                    onChange={(e,v)=>{workspace.Slug = v}}
                    variant={'v2'}
                />
                <ModernTextField
                    fullWidth={true}
                    floatingLabelText={m("ws.editor.description")}
                    value={workspace.Description}
                    onChange={(e,v)=>{workspace.Description = v}}
                    variant={'v2'}
                />
            </Paper>
        );
        const PanePaths = (
            <Paper zDepth={0} style={makeStyle(styles.section, 'data')}>
                <div style={styles.title}>{m('ws.editor.data.title')}</div>
                <div style={styles.legend}>{m('ws.editor.data.legend')}</div>
                {completers}
                <div style={styles.legend}>{m('ws.editor.default_rights')}</div>
                <ModernSelectField
                    fullWidth={true}
                    value={workspace.Attributes['DEFAULT_RIGHTS'] || ''}
                    onChange={(e,i,v) => {workspace.Attributes['DEFAULT_RIGHTS'] = v}}
                    floatingLabelText={m('ws.editor.default_rights.hint')}
                    variant={'v2'}
                >
                    <MenuItem primaryText={m('ws.editor.default_rights.none')} value={""}/>
                    <MenuItem primaryText={m('ws.editor.default_rights.read')} value={"r"}/>
                    <MenuItem primaryText={m('ws.editor.default_rights.readwrite')} value={"rw"}/>
                    <MenuItem primaryText={m('ws.editor.default_rights.write')} value={"w"}/>
                </ModernSelectField>
            </Paper>
        );
        const PaneOptions = (
            <Paper zDepth={0} style={makeStyle(styles.section, 'other')}>
                <div style={styles.title}>{m('ws.editor.other')}</div>

                <div style={{...styles.legend}}>{m('ws.editor.other.skiprecycle.legend')}</div>
                <div style={styles.toggleDiv}>
                    <Checkbox
                        label={m('ws.editor.other.skiprecycle')}
                        labelPosition={"right"}
                        checked={workspace.Attributes['SKIP_RECYCLE']}
                        onCheck={(e,v) =>{
                            workspace.Attributes['SKIP_RECYCLE'] = v;
                        }}
                        {...ModernStyles.toggleFieldV2}
                    />
                </div>

                {advanced &&
                    <Fragment>
                        <hr style={styles.divider}/>
                        <div style={{...styles.legend}}>{m('ws.editor.other.sync.legend')}</div>
                        <div style={styles.toggleDiv}>
                            <Checkbox
                                label={m('ws.editor.other.sync')}
                                labelPosition={"right"}
                                checked={workspace.Attributes['ALLOW_SYNC']}
                                onCheck={(e,v) =>{
                                    if(!container.hasTemplatePath() && v) {
                                        this.enableSync(v)
                                    } else if (!v) {
                                        this.enableSync(v)
                                    } else {
                                        workspace.Attributes['ALLOW_SYNC'] = v;
                                    }
                                }}
                                {...ModernStyles.toggleFieldV2}
                            />
                        </div>

                        <hr style={styles.divider}/>
                        <div style={{...styles.legend}}>{m('ws.editor.other.quota')}</div>
                        <InputIntegerBytes
                            variant={'v2'}
                            attributes={{label:'Quota'}}
                            value={workspace.Attributes['QUOTA'] || 0}
                            onChange={(v) => {
                                if(v > 0){
                                    workspace.Attributes['QUOTA'] = v + '';
                                } else {
                                    workspace.Attributes['QUOTA'] = '0';
                                    delete(workspace.Attributes['QUOTA']);
                                }
                            }}
                        />
                        <hr style={styles.divider}/>
                        <div style={{...styles.legend}}>{m('ws.editor.other.layout')}</div>
                        <ModernSelectField fullWidth={true} floatingLabelText={m('ws.editor.other.layout')} variant={"v2"} value={workspace.Attributes['META_LAYOUT'] || ""} onChange={(e,i,v) => {workspace.Attributes['META_LAYOUT'] = v}}>
                            <MenuItem primaryText={m('ws.editor.other.layout.default')} value={""}/>
                            <MenuItem primaryText={m('ws.editor.other.layout.easy')} value={"meta.layout_sendfile"}/>
                        </ModernSelectField>
                    </Fragment>
                }
            </Paper>
        )
        let PanePolicies;
        if(PoliciesBuilder) {
            PanePolicies = (
                <Paper zDepth={0} style={makeStyle(styles.section, 'policies')}>
                <div style={styles.title}>{policiesMS('editor.visibility.workspace')}</div>
                <div style={{...styles.legend}}>
                    {policiesMS('editor.visibility.warning')}
                    {!policiesEdit && <span style={{fontWeight:500, cursor:'pointer'}} onClick={()=>this.setState({policiesEdit:true})}> - {policiesMS('editor.visibility.edit')}</span>}
                </div>
                <PoliciesBuilder
                    pydio={pydio}
                    policies={workspace.Policies}
                    onChangePolicies={(pols => workspace.Policies = pols )}
                    readonly={!policiesEdit}
                    showHeader={false}
                    forceCustom={true}
                    advancedLegend={<span/>}
                    advancedContainerStyle={policiesEdit?{paddingBottom: 300}:{}}
                    allowedActions={{
                        'READ':policiesMS('policies.builder.action.read'),
                        'WRITE':policiesMS('policies.builder.action.write')
                    }}
                />
            </Paper>
            );
        }


        return (
            <PaperEditorLayout
                title={workspace.Label || mS('90')}
                titleLeftIcon={"mdi mdi-folder-open"}
                titleActionBar={buttons}
                closeAction={closeEditor}
                className="workspace-editor"
                contentFill={false}
            >
                {Stepper}
                {EncDialog}
                {PaneLabel}
                {PanePaths}
                {PaneOptions}
                {PanePolicies}
                {StepperButtons}
            </PaperEditorLayout>
        );

    }


}

WsEditor = muiThemeable()(WsEditor);
export {WsEditor as default}
