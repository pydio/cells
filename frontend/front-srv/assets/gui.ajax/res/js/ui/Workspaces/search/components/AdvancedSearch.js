import React, { Component } from 'react';

import XMLUtils from 'pydio/util/xml';
import {IconButton, Subheader} from 'material-ui';

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

import PropTypes from 'prop-types';

import Pydio from 'pydio'
const {PydioContextConsumer} = Pydio.requireLib('boot');
const {ModernTextField} = Pydio.requireLib('hoc');
import {FlatButton} from 'material-ui'
import DatePanel from './DatePanel';
import FileFormatPanel from './FileFormatPanel';
import FileSizePanel from './FileSizePanel';
import {debounce} from 'lodash';
import SearchScopeSelector from "./SearchScopeSelector";

const FieldRow = ({name, label, values, children, style, onRemove = ()=>{}}) => {
    let labelStyle= {
        width: 100,
        fontSize: 13,
        fontWeight: 500,
        color: '#616161',
        height: 34,
        lineHeight: '35px',
        padding: '0 7px',
        borderRadius: 4,
        marginTop: 6,
        marginRight: 8,
        overflow:'hidden',
        textOverflow:'ellipsis',
        whiteSpace:'nowrap',
        display:'flex'
    }
    let active, actualKey= name;
    if(values[name]) {
        active = true;
        if(name === 'scope') {
            active = values[name] !== 'all'
        }
    } else if(values['ajxp_meta_'+name]) {
        actualKey = 'ajxp_meta_'+name
        active = true
    }
    if(active){
        labelStyle = {...labelStyle, backgroundColor: '#e8f5e9', color:'#43a047'}
    }
    return (
        <div style={{display:'flex', alignItems:'flex-start', margin:'0 16px', ...style}}>
            <div style={labelStyle}>
                {active?<span className={"mdi mdi-close"} onClick={()=>onRemove(actualKey)} style={{cursor:'pointer'}}/>:""}
                <div style={{flex: 1, textAlign:'right'}}>{label}</div>
            </div>
            <div style={{flex: 1}}>{children}</div>
        </div>
    );
}

class AdvancedSearch extends Component {

    static get styles() {
        return {
            text: {}
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            searchOptions:{},
            basenameOrContent: props.values['basenameOrContent'] || ''
        };
        props.getSearchOptions().then(so => this.setState({searchOptions: so}))
    }

    textFieldChange(fieldName, value){
        this.props.onChange({[fieldName]:value});
    }

    onChange(values) {
        this.props.onChange(values)
    }

    renderField(key, val) {

        const {text} = AdvancedSearch.styles;
        const fieldname = (key === 'basename' || key === 'Content' || key === 'basenameOrContent') ? key : 'ajxp_meta_' + key;

        if (typeof val === 'object') {
            const value = this.props.values[fieldname];
            const {label, renderer} = val;

            // The field might have been assigned a method already
            if (renderer) {
                return renderer({
                    ...this.props,
                    label,
                    value,
                    fieldname:key,
                    onChange: (object)=>{this.onChange(object)}
                });
            }
        }

        return (
            <ModernTextField
                key={fieldname}
                value={this.props.values[fieldname] || ''}
                style={text}
                hintText={val}
                fullWidth={true}
                onChange={(e,v) => {this.textFieldChange(fieldname, v)}}
            />
        );
    }

    clearAll() {
        const {values, onChange} = this.props;
        let clearVals = {}
        Object.keys(values).forEach(k => {
            if(k === 'basenameOrContent') {
                clearVals[k] = values[k]
            } else if (k === 'scope') {
                clearVals[k] = 'all'
            } else {
                clearVals[k] = undefined;
            }
        })
        onChange(clearVals);
    }

    render() {

        const {text} = AdvancedSearch.styles;

        const {pydio, getMessage, values, rootStyle, showScope, saveSearch, clearSavedSearch} = this.props;
        const {searchOptions, promptSearchLabel, currentSearchLabel} = this.state;
        const headerStyle = {
            fontSize: 13,
            color: 'rgb(144 165 178)',
            textTransform: 'uppercase',
            fontWeight: 500,
            marginBottom: -10,
            marginTop: 10
        };
        const linkStyle = {
            padding: '12px 20px 0',
            color: '#9e9e9e',
            textDecoration: 'underline',
            cursor: 'pointer'
        }

        const onRemove = (key) => {
            const newValues = {...values}
            newValues[key] = key === 'scope' ? 'all' : undefined;
            this.onChange(newValues);
        }
        const rowProps = {
            values,
            onRemove
        }

        const {basenameOrContent, scope, searchID, searchLABEL, ...others} = values;
        let showClear = scope !== 'all' || (others && Object.keys(others).length > 0)
        let showSave = scope !== 'all' || basenameOrContent || (others && Object.keys(others).length > 0)
        let showRemove = !!searchID
        const {indexedContent = false, indexedMeta = []} = searchOptions;
        const fNameLabel = getMessage(indexedContent?'searchengine.field.basenameOrContent' : 1);

        return (
            <div className="search-advanced" style={{...rootStyle}}>
                {promptSearchLabel &&
                    <div style={{display: 'flex',alignItems: 'center', padding: '4px 12px 2px', backgroundColor: '#f8fafc'}}>
                        <ModernTextField focusOnMount={true} hintText={getMessage('searchengine.query.save-label')} value={currentSearchLabel||""} onChange={(e,v)=>this.setState({currentSearchLabel: v})}/>
                        <FlatButton label={getMessage('searchengine.query.action.save')} onClick={()=>{
                            saveSearch(currentSearchLabel);
                            this.setState({promptSearchLabel:false, currentSearchLabel: ''})}
                        } disabled={!currentSearchLabel}/>
                        <FlatButton label={getMessage('54')} onClick={()=>{this.setState({currentSearchLabel:'', promptSearchLabel:false})}}/>
                    </div>
                }
                {!promptSearchLabel &&
                    <div style={{display:'flex'}}>
                    <Subheader style={{...headerStyle, marginTop: 0, flex: 1}}>{getMessage(341)}</Subheader>
                        {(showSave || showClear) &&
                            <div style={linkStyle}>
                                {showRemove && <a onClick={()=>clearSavedSearch(searchID)}>{getMessage('searchengine.query.action.delete')}</a>}
                                {showRemove && showSave && " | "}
                                {showSave && <a onClick={()=>searchID?saveSearch():this.setState({promptSearchLabel:true})}>{getMessage('searchengine.query.action.save')}</a>}
                                {showSave && showClear && " | "}
                                {showClear && <a onClick={()=>this.clearAll()}>{getMessage('searchengine.query.action.clear')}</a>}
                            </div>
                        }
                    </div>
                }
                <FieldRow {...rowProps} name={"basenameOrContent"} label={fNameLabel}>{this.renderField('basenameOrContent',fNameLabel)}</FieldRow>
                {showScope &&
                    <FieldRow {...rowProps} name={"scope"} label={getMessage('searchengine.scope.title')} style={{marginRight:16}}>
                        <SearchScopeSelector pydio={pydio} value={values.scope} onChange={(scope)=>{this.onChange({...values, scope})}}/>
                    </FieldRow>
                }
                <FieldRow {...rowProps} name={"ajxp_mime"} label={"Format"}>
                    <FileFormatPanel compact={showScope} values={values} pydio={pydio} inputStyle={text} onChange={(values) => this.onChange(values)} />
                </FieldRow>

                <Subheader style={{...headerStyle, marginTop: 0}}>{getMessage(489)}</Subheader>
                {indexedMeta.map(m => {
                    const key = m.namespace
                    const label = m.label
                    if(m.renderer) {
                        return <FieldRow {...rowProps} name={key} label={label}>{this.renderField(key,m)}</FieldRow>
                    } else {
                        return <FieldRow {...rowProps} name={key} label={label}>{this.renderField(key,label)}</FieldRow>
                    }
                })}
                <Subheader style={{...headerStyle}}>{getMessage(498)}</Subheader>
                <FieldRow {...rowProps} name={"ajxp_modiftime"} label={getMessage(4)}>
                    <DatePanel values={values} pydio={pydio} inputStyle={text} onChange={(values) => this.onChange(values)} />
                </FieldRow>
                <FieldRow {...rowProps} name={"ajxp_bytesize"} label={getMessage(2)}>
                    <FileSizePanel values={values} pydio={pydio} inputStyle={text} onChange={(values) => this.onChange(values)} />
                </FieldRow>
            </div>
        )
    }
}

AdvancedSearch = PydioContextConsumer(AdvancedSearch);

export default AdvancedSearch
