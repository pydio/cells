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
import FormPanel from './builder/FormPanel'
import TplManager from './graph/TplManager'
import {JobsAction} from 'pydio/http/rest-api'
import {FontIcon} from 'material-ui'
const {Stepper} = Pydio.requireLib("components");
const {Dialog, PanelBigButtons} = Stepper;

class CreateActions extends React.Component {

    constructor(props){
        super(props);
        this.state = {filter: '', templates: []};
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.open && !this.props.open){
            this.loadTemplates();
        }
    }

    loadTemplates(){
        const {descriptions} = this.props;
        TplManager.getInstance().listActions().then(aa => {
            let templates = {};
            aa.map((a, i) => {
                const ID = a.ID;
                if(descriptions[ID]){
                    const {TemplateName} = a;
                    templates[TemplateName] = {
                        ...descriptions[ID],
                        Label: a.Label,
                        Description: a.Description,
                        Parameters: a.Parameters
                    };
                }
            });
            this.setState({templates});
        })
    }

    dismiss(){
        this.setState({actionId:'', random: null});
        const {onDismiss} = this.props;
        onDismiss();
    }

    render() {
        const {descriptions, onSubmit, open} = this.props;
        const {filter, actionId, random, templates} = this.state;

        let title, content, dialogFilter, dialogProps = {};
        if(actionId) {
            let model, action, create = true;
            if(descriptions[actionId]){
                action = descriptions[actionId];
                model = JobsAction.constructFromObject({ID: actionId});
            } else if(templates[actionId]){
                create = false;
                const tpl = templates[actionId];
                action = descriptions[tpl.Name];
                model = JobsAction.constructFromObject({ID: action.Name, ...tpl})
            }
            const icon = 'mdi mdi-' + action.Icon || 'mdi mdi-chip';
            title = <span><FontIcon style={{marginRight: 8}} className={icon} color={action.Tint}/>{action.Label}</span>;
            content = (
                <FormPanel
                    actions={descriptions}
                    action={model}
                    onChange={(newAction) => { onSubmit(newAction); this.setState({actionId:''}) }}
                    create={create}
                    inDialog={true}
                    onDismiss={()=>{this.dismiss()}}
                    style={{margin:'10px -10px -10px'}}
                    onLoaded={()=>{ this.setState({random: Math.random()}) }}
                />
            );
            dialogProps = {
                bodyStyle: {
                    backgroundColor:'white'
                },
                contentStyle:{
                    maxWidth:600
                }
            }

        } else {

            const ss = {};
            const all = {...descriptions, ...templates};
            Object.keys(all).forEach(k => {
                const action = all[k];
                if(filter && action.Label.toLowerCase().indexOf(filter.toLowerCase()) === -1 && action.Description.toLowerCase().indexOf(filter.toLowerCase()) === -1) {
                    return;
                }
                const sName = action.Category;
                if(!ss[sName]){
                    const sp = sName.split(' - ');
                    ss[sName] = {title:sp[sp.length-1], Actions:[]};
                }
                const a = {
                    value: k,
                    title: action.Label,
                    icon: action.Icon ? 'mdi mdi-' + action.Icon : 'mdi mdi-chip',
                    tint: action.Tint,
                    description:action.Description
                };
                if(templates[k]){
                    a.onDelete = () => {
                        if (confirm('Do you want to delete this template?')){
                            TplManager.getInstance().deleteAction(actionId).then(() => {
                                this.loadTemplates();
                            })
                        }
                    }
                }
                ss[sName].Actions.push(a);
            });

            const keys = Object.keys(ss);
            keys.sort();
            const model = {
                Sections: keys.map(k => ss[k])
            };

            title = "Create Action";
            content = (
                <PanelBigButtons model={model} onPick={(actionId) => this.setState({actionId, filter:''})} />
            );
            dialogFilter = (v)=>{this.setState({filter: v})}

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

export default CreateActions;