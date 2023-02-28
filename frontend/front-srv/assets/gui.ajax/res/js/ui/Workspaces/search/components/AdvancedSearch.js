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

import React, { Component } from 'react';
import {Subheader} from 'material-ui';
import Pydio from 'pydio'
const {PydioContextConsumer} = Pydio.requireLib('boot');
const {ModernTextField} = Pydio.requireLib('hoc');
import {FlatButton} from 'material-ui'
import Renderer from './Renderer'

const FieldRow = ({constants, name, label, values, children, style, onRemove = ()=>{}}) => {
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
        if(name === constants.KeyScope) {
            active = values[name] !== 'all'
        }
    } else if(values[constants.KeyMetaPrefix+name]) {
        actualKey = constants.KeyMetaPrefix+name
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

    onChange(values) {
        this.props.onChange(values)
    }

    renderField(val) {
        const {searchTools:{SearchConstants}} = this.props;
        const {name:key, renderer, label} = val

        const isCore = (key === SearchConstants.KeyBasename || key === SearchConstants.KeyContent || key === SearchConstants.KeyBasenameOrContent)
        const fieldname = isCore ? key : SearchConstants.KeyMetaPrefix + key;
        const {values} = this.props;
        const value = values[fieldname];

        if (renderer) {
            return renderer({
                ...this.props,
                label,
                value,
                fieldname:key,
                onChange: this.onChange.bind(this)
            });
        } else {
            return Renderer.formRenderer(
                this.props,
                val,
                values,
                this.onChange.bind(this)
            )
        }

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

        const {searchTools, getMessage, values, rootStyle, saveSearch, clearSavedSearch} = this.props;
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
        const kk = searchTools.SearchConstants


        const {indexedContent = false, indexedMeta = []} = searchOptions;
        const fNameLabel = getMessage(indexedContent?'searchengine.field.basenameOrContent' : 1);
        const fields = [
            {name:'basenameOrContent', label: fNameLabel},
            {name:kk.KeyScope, type: 'scope', label: getMessage('searchengine.scope.title')},
            {name:kk.KeyMime, type: 'mime', label: 'Format'},
            {subheader:getMessage(489)},
            ...indexedMeta.map(m => {return {...m, name: m.namespace}}), // copy namespace prop to name
            {subheader:getMessage(498)},
            {name:kk.KeyModifDate, type: 'modiftime', label: getMessage(4)},
            {name:kk.KeyBytesize, type:'bytesize', label: getMessage(2)},
        ]

        return (
            <div className="search-advanced" style={{...rootStyle}}>

                {promptSearchLabel &&
                    <div style={{display: 'flex',alignItems: 'center', padding: '4px 12px 2px', backgroundColor: '#f8fafc'}}>
                        <ModernTextField focusOnMount={true} hintText={getMessage('searchengine.query.save-label')} value={currentSearchLabel||searchLABEL||""} onChange={(e,v)=>this.setState({currentSearchLabel: v})}/>
                        <FlatButton label={getMessage('searchengine.query.action.save')} onClick={()=>{
                            saveSearch(currentSearchLabel||searchLABEL);
                            this.setState({promptSearchLabel:false, currentSearchLabel: ''})}
                        } disabled={!(currentSearchLabel||searchLABEL)}/>
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
                                {showSave && <a onClick={()=>this.setState({promptSearchLabel:true})}>{getMessage('searchengine.query.action.save')}</a>}
                                {showSave && showClear && " | "}
                                {showClear && <a onClick={()=>this.clearAll()}>{getMessage('searchengine.query.action.clear')}</a>}
                            </div>
                        }
                    </div>
                }

                {fields.map(f => {
                    if(f.subheader) {
                        return <Subheader style={{...headerStyle, marginTop: 0}}>{f.subheader}</Subheader>
                    } else {
                        return <FieldRow {...rowProps} constants={kk} name={f.name} label={f.label}>{this.renderField(f)}</FieldRow>
                    }
                })}

            </div>
        )
    }
}

AdvancedSearch = PydioContextConsumer(AdvancedSearch);

export default AdvancedSearch
