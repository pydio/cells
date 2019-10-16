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
import {FlatButton, RaisedButton, Paper, Divider, Toggle, MenuItem, FontIcon, IconButton, Subheader} from 'material-ui'
import Workspace from '../model/Ws'
import WsAutoComplete from './WsAutoComplete'
const {PaperEditorLayout} = Pydio.requireLib('components');
const {ModernTextField, ModernSelectField, ModernStyles} = Pydio.requireLib('hoc');

class WsEditor extends React.Component {

    constructor(props){
        super(props);
        const workspace = new Workspace(props.workspace);
        workspace.observe('update', () => {
            this.forceUpdate();
        });
        this.state = {
            workspace: workspace.getModel(),
            container: workspace,
            newFolderKey: Math.random()
        };
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
        if (confirm(pydio.MessageHash['settings.35'])){
            container.remove().then(() => {
                reloadList();
                closeEditor();
            });
        }
    }

    render(){

        const {closeEditor, pydio, advanced} = this.props;
        const {workspace, container, newFolderKey, saving} = this.state;
        const m = id => pydio.MessageHash['ajxp_admin.' + id] || id;
        const mS = id => pydio.MessageHash['settings.' + id] || id;

        let buttons = [];
        if(!container.create){
            buttons.push(PaperEditorLayout.actionButton(m('plugins.6'), "mdi mdi-undo", () => {this.revert()}, !container.isDirty()));
        }
        buttons.push(PaperEditorLayout.actionButton(pydio.MessageHash['53'], "mdi mdi-content-save", ()=>{this.save()} ,saving || (!(container.isDirty() && container.isValid()))));

        let delButton;
        if(!container.create){
            delButton = (
                <div style={{padding: 16, textAlign:'center'}}>
                    {m('ws.editor.help.delete')}<br/><br/>
                    <RaisedButton secondary={true} label={m('ws.23')} onTouchTap={()=>{this.remove()}}/>
                </div>
            );
        }
        const leftNav = (
            <div>
                <div style={{padding: 16, color:'#9e9e9e'}}>
                    <div style={{fontSize: 120, textAlign:'center', paddingBottom: 10}}>
                        <i className={"mdi mdi-folder-open"}/>
                    </div>
                    {m('ws.editor.help.1')}
                    <br/><br/>
                    {m('ws.editor.help.2')}
                </div>
                {delButton && <Divider/>}
                {delButton}
            </div>
        );

        const styles = {
            title: {
                fontSize: 20,
                paddingTop: 20,
                marginBottom: 0,
            },
            legend: {color: '#9E9E9E', paddingTop: 10},
            section: {padding: '0 20px 20px', margin: 10, backgroundColor:'white'},
            toggleDiv:{height: 50, display:'flex', alignItems:'flex-end'}
        };

        const roots = workspace.RootNodes;
        let completers = Object.keys(roots).map(
            (k)=> {
                let label = m('ws.editor.path.folder');
                if(Workspace.rootIsTemplatePath(roots[k])){
                    label = m('ws.editor.path.template');
                }
                return (
                    <WsAutoComplete
                        key={roots[k].Uuid}
                        pydio={pydio}
                        label={label}
                        value={roots[k].Path}
                        onDelete={() => {delete(roots[k]); this.forceUpdate()}}
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
            completers.push(
                <WsAutoComplete
                    key={newFolderKey}
                    pydio={pydio}
                    value={""}
                    onChange={(k,node) => {if(node){ roots[node.Uuid] = node; this.setState({newFolderKey: Math.random()})}}}
                    skipTemplates={container.hasFolderRoots()}
                />);
        }

        return (
            <PaperEditorLayout
                title={workspace.Label || mS('90')}
                titleActionBar={buttons}
                closeAction={closeEditor}
                leftNav={leftNav}
                className="workspace-editor"
                contentFill={false}
            >
                <Paper zDepth={1} style={styles.section}>
                    <div style={styles.title}>{m('ws.30')}</div>
                    <div style={styles.legend}>{m('ws.editor.options.legend')}</div>

                    <ModernTextField
                        fullWidth={true}
                        errorText={workspace.Label ? "" : m('ws.editor.label.legend')}
                        floatingLabelText={mS('8')}
                        value={workspace.Label}
                        onChange={(e,v)=>{workspace.Label = v}}
                    />
                    <ModernTextField
                        fullWidth={true}
                        floatingLabelText={m("ws.editor.description")}
                        value={workspace.Description}
                        onChange={(e,v)=>{workspace.Description = v}}
                    />
                    <div style={{...styles.legend, marginTop: 8}}>{m('ws.editor.slug.legend')}</div>
                    <ModernTextField
                        fullWidth={true}
                        errorText={(workspace.Label && !workspace.Slug) ? m('ws.editor.slug.legend') : ""}
                        floatingLabelText={m('ws.5')}
                        value={workspace.Slug}
                        onChange={(e,v)=>{workspace.Slug = v}}
                    />
                </Paper>
                <Paper zDepth={1} style={styles.section}>
                    <div style={styles.title}>{m('ws.editor.data.title')}</div>
                    <div style={styles.legend}>{m('ws.editor.data.legend')}</div>
                    {completers}
                    <div style={styles.legend}>{m('ws.editor.default_rights')}</div>
                    <ModernSelectField
                        fullWidth={true}
                        value={workspace.Attributes['DEFAULT_RIGHTS']}
                        onChange={(e,i,v) => {workspace.Attributes['DEFAULT_RIGHTS'] = v}}
                    >
                        <MenuItem primaryText={m('ws.editor.default_rights.none')} value={""}/>
                        <MenuItem primaryText={m('ws.editor.default_rights.read')} value={"r"}/>
                        <MenuItem primaryText={m('ws.editor.default_rights.readwrite')} value={"rw"}/>
                        <MenuItem primaryText={m('ws.editor.default_rights.write')} value={"w"}/>
                    </ModernSelectField>
                </Paper>
                {advanced &&
                    <Paper zDepth={1} style={styles.section}>
                        <div style={styles.title}>{m('ws.editor.other')}</div>
                        <div style={{...styles.legend, marginTop: 8}}>{m('ws.editor.other.sync.legend')}</div>
                        <div style={styles.toggleDiv}>
                            <Toggle
                                label={m('ws.editor.other.sync') + (container.hasTemplatePath() ? '' : ' ' + m('ws.editor.other.sync-personal'))}
                                labelPosition={"right"}
                                toggled={workspace.Attributes['ALLOW_SYNC']}
                                onToggle={(e,v) =>{workspace.Attributes['ALLOW_SYNC']=v}}
                                disabled={!container.hasTemplatePath()}
                                {...ModernStyles.toggleField}
                            />
                        </div>
                        <div style={{...styles.legend, marginTop: 8}}>{m('ws.editor.other.layout')}</div>
                        <ModernSelectField fullWidth={true} value={workspace.Attributes['META_LAYOUT'] || ""} onChange={(e,i,v) => {workspace.Attributes['META_LAYOUT'] = v}}>
                            <MenuItem primaryText={m('ws.editor.other.layout.default')} value={""}/>
                            <MenuItem primaryText={m('ws.editor.other.layout.easy')} value={"meta.layout_sendfile"}/>
                        </ModernSelectField>
                    </Paper>
                }
            </PaperEditorLayout>
        );

    }


}

export {WsEditor as default}
