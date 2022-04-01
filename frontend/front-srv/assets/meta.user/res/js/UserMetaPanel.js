/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import MetaClient from "./MetaClient";
import StarsForm from "./fields/StarsForm";
import StarsField from "./fields/StarsField";
import CssLabelsField from "./fields/CssLabelsField";
import SelectorField from "./fields/SelectorField";
import TagsCloud from "./fields/TagsCloud";
import Renderer from "./Renderer";
import {Checkbox} from 'material-ui'
import {DateTimeField, DateTimeForm} from "./fields/DateTime";
import BooleanForm from "./fields/BooleanForm";
import {IntegerField, IntegerForm} from "./fields/Integer";
const {ModernTextField} = Pydio.requireLib("hoc")
const {EmptyStateView} = Pydio.requireLib('components');

export default class UserMetaPanel extends React.Component{

    constructor(props){
        if(props.editMode === undefined){
            props.editMode = false;
        }
        super(props);
        this.state = {
            updateMeta: new Map(),
            fields: {},
            configs: new Map()
        }
    }

    componentDidMount(){
        const promsConfigs = this.props.loader ? this.props.loader() : MetaClient.getInstance().loadConfigs();
        promsConfigs.then(configs => {
            const {node, loadChecks} = this.props;
            const fields= {};
            const updateMeta = new Map();
            if(loadChecks){
                configs.forEach((meta, key) => {
                    if(node.getMetadata().has(key)){
                        fields[key] = true;
                        updateMeta.set(key, node.getMetadata().get(key))
                    }
                })
            }
            this.setState({configs, fields, updateMeta});
        })
    }
    updateValue(name, value, submit = false){
        this.state.updateMeta.set(name, value);
        this.setState({
            updateMeta: this.state.updateMeta
        });
        if(this.props.onChangeUpdateData){
            this.props.onChangeUpdateData(this.state.updateMeta);
        }
        if(submit && this.props.autoSave){
            this.props.autoSave();
        }
    }
    deleteValue(name) {
        this.state.updateMeta.delete(name);
        this.setState({
            updateMeta: this.state.updateMeta
        });
        if(this.props.onChangeUpdateData){
            this.props.onChangeUpdateData(this.state.updateMeta);
        }
    }
    getUpdateData(){
        return this.state.updateMeta;
    }

    resetUpdateData(){
        this.setState({
            updateMeta: new Map()
        });
        if(this.props.onChangeUpdateData){
            this.props.onChangeUpdateData(new Map());
        }
    }
    onCheck(key, value){
        const {fields} = this.state;
        fields[key] = value;
        if(!value){
            this.deleteValue(key);
        }
        this.setState({fields});
    }
    render(){
        const {configs, updateMeta} = this.state;
        const {pydio, node, editMode, onRequestEditMode, supportTemplates, multiple, style} = this.props;
        let data = [];
        const metadata = node.getMetadata();
        let nonEmptyDataCount = 0;

        configs.forEach((meta, key) => {
            let value;
            const {label, type, readonly} = meta;
            if(type === 'json' && !supportTemplates){
                return;
            }
            value = metadata.get(key);
            if(updateMeta.has(key)){
                value = updateMeta.get(key);
            }
            let realValue = value;
            if(editMode && !readonly){
                let field;
                let baseProps = {
                    fieldname: key,
                    label,
                    value,
                    configs,
                    onValueChange: (name, value, submit) => this.updateValue(name, value, submit)
                };
                switch (type){
                    case 'stars_rate':
                        field = <StarsForm {...baseProps}/>;
                        break;
                    case 'choice':
                        field = Renderer.formPanelSelectorFilter(baseProps, configs);
                        break;
                    case 'css_label':
                        field = Renderer.formPanelCssLabels(baseProps, configs);
                        break;
                    case 'tags':
                        field = Renderer.formPanelTags(baseProps, configs);
                        break
                    case 'date':
                        field = <DateTimeForm type={type} {...baseProps} supportTemplates={supportTemplates}/>
                        break;
                    case 'integer':
                        field = <IntegerForm {...baseProps} supportTemplates={supportTemplates}/>
                        break
                    case 'boolean':
                        field = <BooleanForm {...baseProps}/>
                        break
                    default:
                        // text, integer, date, json
                        const isInteger = (type === 'integer' && !supportTemplates);
                        field = (
                            <ModernTextField
                                value={value || ""}
                                variant={"v2"}
                                fullWidth={true}
                                disabled={readonly}
                                floatingLabelText={label}
                                multiLine={type === 'textarea' || type === 'json'}
                                type={isInteger? "number" : null}
                                onChange={(event, value)=>{
                                    if(isInteger) {
                                        value = parseInt(value);
                                    }
                                    this.updateValue(key, value);
                                }}
                                onKeyPress={(event) => {
                                    if(event.key === 'Enter'){
                                        this.updateValue(key, value, true);
                                    }
                                }}
                            />
                        );
                        break
                }
                if(multiple){
                    const checked = this.state.fields[key] || false;
                    data.push(
                        <div className={"infoPanelRow"} key={key} style={{ marginBottom: 20}}>
                            <Checkbox checked={checked} label={label} onCheck={(e,v) => this.onCheck(key, v)}/>
                            {checked && <div className="infoPanelValue">{field}</div>}
                        </div>
                    );
                }else{
                    data.push(<div key={key}>{field}</div>);
                }
            }else{
                let column = {name:key};

                switch (type){
                    case 'stars_rate':
                        value = <StarsField node={node} column={column}/>
                        break;
                    case 'choice':
                        value = <SelectorField node={node} column={column}/>
                        break;
                    case 'css_label':
                        value = <CssLabelsField node={node} column={column}/>
                        break;
                    case 'tags':
                        value = <TagsCloud node={node} column={column}/>
                        break
                    case 'date':
                        value = <DateTimeField node={node} column={column} type={type}/>
                        break;
                    case 'integer':
                        value= <IntegerField node={node} column={column}/>
                        break;
                    case 'boolean':
                        value = value ? 'Yes' : 'No'
                        realValue = value;
                        break
                    default:
                        break
                }
                if(realValue) {
                    nonEmptyDataCount ++;
                }
                data.push(
                    <div className={"infoPanelRow" + (realValue ? '' : ' no-value')} key={key}>
                        <div className="infoPanelLabel">{label}</div>
                        <div className="infoPanelValue">{value}</div>
                    </div>
                );
            }
        });
        const mess = pydio.MessageHash;
        if(!editMode && !nonEmptyDataCount){
            let divProps = {}
            if(onRequestEditMode) {
                divProps = {onClick:onRequestEditMode, style:{cursor:'pointer'}}
            }
            return (
                <div {...divProps}>
                    <EmptyStateView
                        pydio={this.props.pydio}
                        iconClassName={"mdi mdi-tag-outline"}
                        primaryTextId={mess['meta.user.' + (onRequestEditMode?'11':'16')]}
                        style={{padding: '10px 40px 20px', backgroundColor:'transparent'}}
                        iconStyle={{fontSize: 40}}
                        legendStyle={{fontSize: 13}}
                    />
                </div>
            );
        } else {
            let legend;
            if(multiple){
                legend = <div style={{paddingBottom: 16}}><em>{mess['meta.user.12']}</em> {mess['meta.user.13']}</div>
            }
            return (<div style={{width: '100%', overflowY: 'scroll', ...style}}>{legend}{data}</div>);
        }
    }

}
