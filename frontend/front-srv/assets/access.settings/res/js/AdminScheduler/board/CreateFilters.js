/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import {JobsAction} from 'pydio/http/rest-api'
import {FontIcon, FlatButton, RaisedButton} from 'material-ui'
const {Stepper} = Pydio.requireLib("components");
const {Dialog, PanelBigButtons} = Stepper;
import {
    JobsActionOutputFilter,
    JobsContextMetaFilter,
    JobsIdmSelector,
    JobsNodesSelector
} from 'pydio/http/rest-api';
import QueryBuilder from "./builder/QueryBuilder";
import TplManager from "./graph/TplManager";


const tints = {
    nodes:'',
    idm : '#438db3',
    context: '#795649',
    output: '#009688',
    preset: '#F57C00'
};

const presetTagStyle = {
    display: 'inline-block',
    backgroundColor: tints.preset,
    padding: '0 5px',
    marginRight: 5,
    borderRadius: 5,
    color: 'white',
    fontSize: 12,
    lineHeight:'17px'
};

const types = {
    filters:{
        nodes:{
            title:'Files and folders',
            Actions:[
                {
                    title:'Filter file or folder',
                    description:'Exclude files or folders based on various criteria',
                    icon:'mdi mdi-file-tree',
                    value:()=>{
                        return {model: JobsNodesSelector.constructFromObject({}), type:''}
                    }
                },
                {
                    title:'Folders only',
                    description:'Match folders only, no files',
                    icon:'mdi mdi-folder',
                    preset: true,
                    value:()=>{
                        return {model: JobsNodesSelector.constructFromObject({"Query":{"SubQueries":[{"@type":"type.googleapis.com/tree.Query","Type":"COLLECTION"}],"Operation":"OR"}}), type:'', preset: true}
                    }
                },
                {
                    title:'Files only',
                    description:'Match files only, no folders',
                    icon:'mdi mdi-file',
                    preset: true,
                    value:()=>{
                        return {model: JobsNodesSelector.constructFromObject({"Query":{"SubQueries":[{"@type":"type.googleapis.com/tree.Query","Type":"LEAF"}],"Operation":"OR"}}), type:'', preset: true}
                    }
                },
            ],
        },
        idm:{
            title:'Identity Management',
            Actions:[
                {
                    title:'Filter User',
                    description:'Set criteria like profile, roles, group, etc... to match specific users or groups',
                    icon:'mdi mdi-account',
                    tint:tints.idm,
                    value:()=>{
                        return {model: JobsIdmSelector.constructFromObject({Type:'User'}), type:'idm'}
                    }
                },
                {
                    title:'Filter Workspaces',
                    description:'Set criteria like Scope (workspace/cell/link), uuid, etc... to match specific workspaces',
                    icon:'mdi mdi-folder',
                    tint:tints.idm,
                    value:()=>{
                        return {model: JobsIdmSelector.constructFromObject({Type:'Workspace'}), type:'idm'}
                    }
                },
                {
                    title:'Filter Roles',
                    description:'Set criteria to match specific roles. You can differentiate admin-defined roles, user teams, user roles, etc.',
                    icon:'mdi mdi-account-card-details',
                    tint:tints.idm,
                    value:()=>{
                        return {model: JobsIdmSelector.constructFromObject({Type:'Role'}), type:'idm'}
                    }
                },
                {
                    title:'Filter ACL',
                    description:'Set criteria to match specific Access Control List, by node, role and workspace UUIDs',
                    icon:'mdi mdi-view-list',
                    tint:tints.idm,
                    value:()=>{
                        return {model: JobsIdmSelector.constructFromObject({Type:'Role'}), type:'idm'}
                    }
                },
            ]
        },
        context: {
            title: 'Request Context',
            Actions: [
                {
                    title: 'Request Metadata',
                    description: 'Match specific informations carried by request, like User-Agent, IP of client connection, etc.',
                    icon: 'mdi mdi-tag',
                    tint:tints.context,
                    value: () => {
                        return {model: JobsContextMetaFilter.constructFromObject({}), type: 'context'}
                    }
                },
                {
                    title: 'Request User',
                    description: 'Match currently logged user attributes (like profile, roles, etc.)',
                    icon: 'mdi mdi-account',
                    tint:tints.context,
                    value: () => {
                        return {model: JobsContextMetaFilter.constructFromObject({Type: 'ContextUser'}), type: 'context'}
                    }
                }
            ]
        },
        output: {
            title: 'Previous action output',
            Actions: [
                {
                    title: 'Filter Action Output',
                    description: 'Actions append data to their input and send to the next one. This filter applies to the previous action output.',
                    icon: 'mdi mdi-code-braces',
                    tint:tints.output,
                    value: () => {
                        return {model: JobsActionOutputFilter.constructFromObject({}), type: 'output'}
                    }
                }
            ]
        }

    },
    selectors:{
        nodes:{
            title:'Files and folders',
            Actions:[
                {
                    title:'Select files or folders',
                    description:'Lookup existing files and folders matching various search criteria',
                    icon:'mdi mdi-file-tree',
                    value:()=>{
                        return {model: JobsNodesSelector.constructFromObject({}), type:''}
                    }
                }
            ],
        },
        idm:{
            title:'Identity Management',
            Actions:[
                {
                    title:'Select Users',
                    description:'Lookup existing users and groups matching various search criteria',
                    icon:'mdi mdi-account',
                    tint:tints.idm,
                    value:()=>{
                        return {model: JobsIdmSelector.constructFromObject({Type:'User'}), type:'idm'}
                    }
                },
                {
                    title:'Select Workspaces',
                    description:'Lookup existing workspaces matching various search criteria',
                    icon:'mdi mdi-folder',
                    tint:tints.idm,
                    value:()=>{
                        return {model: JobsIdmSelector.constructFromObject({Type:'Workspace'}), type:'idm'}
                    }
                },
                {
                    title:'Select Roles',
                    description:'Lookup existing roles matching various search criteria',
                    icon:'mdi mdi-account-card-details',
                    tint:tints.idm,
                    value:()=>{
                        return {model: JobsIdmSelector.constructFromObject({Type:'Role'}), type:'idm'}
                    }
                },
                {
                    title:'Select ACL',
                    description:'Lookup specific ACLs matching your search criteria',
                    icon:'mdi mdi-view-list',
                    tint:tints.idm,
                    value:()=>{
                        return {model: JobsIdmSelector.constructFromObject({Type:'Acl'}), type:'idm'}
                    }
                },
            ]
        },
    },
};

class CreateFilters extends React.Component {

    constructor(props){
        super(props);
        this.state = {filter: '', templates:{}}
    }

    componentWillReceiveProps(next){
        if( (next.open && !this.props.open)){
            this.loadTemplates(next.open);
        }
    }

    loadTemplates(open){
        TplManager.getInstance().listSelectors().then((result) => {
            if(open === 'selector'){
                this.setState({templates: result['selectors']});
            } else {
                this.setState({templates: result['filters']});
            }
        })
    }

    dismiss(){
        this.setState({action: null, model:null, type: '', random: null});
        const {onDismiss} = this.props;
        onDismiss();
    }

    insert(model, type){
        const {onSubmit} = this.props;
        onSubmit(model, type);
        console.log(model, type);
        this.setState({action: null, model:null, type:'', random: null});
    }

    actionFromList(value){
        const {selectors} = this.props;
        let a;
        const data = selectors ? types.selectors : types.filters;
        Object.keys(data).forEach(k => {
            data[k].Actions.forEach((action) => {
                if(action.value === value){
                    a = action;
                }
            })
        });
        return a;
    }

    render() {
        const {open, selectors} = this.props;
        const {filter, model, action, random, templates} = this.state;

        let title, content, dialogFilter, dialogProps = {};
        if(action) {
            const icon = action.icon || (selectors ? 'mdi mdi-magnify' : 'mdi mdi-chip');
            title = <span><FontIcon style={{marginRight: 8}} className={icon} color={action.tint}/>{action.title}</span>;
            content = [
                <QueryBuilder
                    cloner={(d) => d}
                    query={model}
                    queryType={selectors?'selector':'filter'}
                    style={{}}
                    autoSave={true}
                    onRemoveFilter={(modelType) => {}}
                    onSave={(newData) => {
                        this.setState({model: newData, random:Math.random()});
                    }}
                />,
                <div style={{display:'flex', padding:'24px 0 0'}}>
                    <FlatButton label={"<< Change"} default={true} onTouchTap={()=>{this.setState({model: null, action:null, type:''})}}/>
                    <span style={{flex: 1}}/>
                    <RaisedButton label={"Insert"} primary={true} onTouchTap={() => {
                        const {model, type} = this.state;
                        this.insert(model, type);
                    }}/>
                </div>
            ];

            dialogProps = {
                bodyStyle: {
                    backgroundColor:'white',
                    padding:12,
                    overflow:'visible'
                },
                contentStyle:{
                    maxWidth:800
                }
            }

        } else {

            const bbModel = {Sections:[]};
            const data = selectors ? types.selectors : types.filters;
            Object.keys(data).forEach(k => {
                // TODO : TRANSLATE
                const dd = data[k];
                let aa = dd.Actions;
                if (filter){
                    aa = aa.filter(a => {
                        return a.title.toLowerCase().indexOf(filter) > -1 || a.description.toLowerCase().indexOf(filter) > -1
                    });
                }
                const section = {title:dd.title, Actions:[]};
                section.Actions = aa.map(a => {
                    let title = a.title;
                    if(a.preset){
                        title = <span><span style={presetTagStyle}>preset</span>{a.title}</span>
                    }
                    return {...a, title}
                });
                // Add templates
                if(templates[k] && templates[k].length){
                    templates[k].forEach(tpl => {
                        let value, icon, tint;
                        switch (k) {
                            case "nodes":
                                value = () =>{
                                    return {model: JobsNodesSelector.constructFromObject(JSON.parse(JSON.stringify(tpl.NodesSelector))), type:k};
                                };
                                icon = 'mdi mdi-file-tree';
                                break;
                            case "idm":
                                value = () =>{
                                    return {model: JobsIdmSelector.constructFromObject(JSON.parse(JSON.stringify(tpl.IdmSelector))), type:k};
                                };
                                icon = 'mdi mdi-account';
                                break;
                            case "output":
                                value = () =>{
                                    return {model: JobsActionOutputFilter.constructFromObject(JSON.parse(JSON.stringify(tpl.ActionOutputFilter))), type:k};
                                };
                                icon = 'mdi mdi-code-braces';
                                break;
                            case "context":
                                value = () =>{
                                    return {model: JobsContextMetaFilter.constructFromObject(JSON.parse(JSON.stringify(tpl.ContextMetaFilter))), type:k};
                                };
                                icon = 'mdi mdi-tag';
                                break;
                            default:
                                break;
                        }
                        section.Actions.push({
                            title: <span><span style={presetTagStyle}>preset</span>{tpl.Label}</span>,
                            description: tpl.Description,
                            icon: icon,
                            tint: tints[k],
                            value
                        })
                    })
                }
                if(section.Actions.length){
                    bbModel.Sections.push(section);
                }
            });
            console.log(bbModel);

            title = selectors? "Feed input with data" : "Filter data input";
            content = (
                <PanelBigButtons
                    model={bbModel}
                    onPick={(constructor) => {
                        const action = this.actionFromList(constructor);
                        const {model, type} = constructor();
                        let preset = true;
                        if(action){
                            preset = action.preset;
                        }
                        if(preset){
                            this.insert(model, type);
                        } else {
                            this.setState({model, type, action, filter:''})
                        }
                    }}
                />
            );
            dialogFilter = (v)=>{this.setState({filter: v.toLowerCase()})}

        }

        return (
            <Dialog
                title={title}
                open={open}
                dialogProps={dialogProps}
                onDismiss={()=>{this.dismiss()}}
                onFilter={dialogFilter}
                random={random}
            >
                {content}
            </Dialog>
        );
    }

}

export default CreateFilters;