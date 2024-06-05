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
import {muiThemeable} from 'material-ui/styles'
import Pydio from 'pydio'
const {PydioContextConsumer} = Pydio.requireLib('boot');
const {ModernTextField, ModernStyles, AdditionalIcons:{DeleteOutline}} = Pydio.requireLib('hoc');
import Renderer from './Renderer'

const FieldRow = ({constants, name, label, values, children, style, muiTheme, getDefaultScope,isDefaultScope, onRemove = ()=>{}}) => {
    let labelStyle= {
        width: 100,
        fontSize: 13,
        fontWeight: 500,
        color: muiTheme.palette.mui3['on-surface'],
        height: 34,
        lineHeight: '35px',
        padding: '0 16px 0px 8px',
        borderRadius: ModernStyles.v1SearchRadiusLeft,
        backgroundColor:muiTheme.palette.mui3['surface-variant'],
        marginTop: 6,
        marginRight: 0,
        overflow:'hidden',
        textOverflow:'ellipsis',
        whiteSpace:'nowrap',
        display:'flex',
        flexShrink:0
    }
    let active, actualKey= name;
    if(values[name]) {
        active = true;
        if(name === constants.KeyScope) {
            active = !isDefaultScope(values[name])
        }
    } else if(values[constants.KeyMetaPrefix+name]) {
        actualKey = constants.KeyMetaPrefix+name
        active = true
    }
    if(active){
        labelStyle = {...labelStyle, backgroundColor: muiTheme.palette.mui3['tertiary-container'], color:muiTheme.palette.mui3['on-tertiary-container']}
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

const localKey = 'pydio.layout.meta-groups-expanded.search'

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
            basenameOrContent: props.values['basenameOrContent'] || '',
            expands: {}
        };
        if(localStorage.getItem(localKey)){
            try{
                this.state.expands = JSON.parse(localStorage.getItem(localKey))
            }catch(e){
                localStorage.removeItem(localKey)
            }
        }
        props.getSearchOptions().then(so => this.setState({searchOptions: so}))
    }

    onChange(values) {
        this.props.onChange(values)
    }

    renderField(val) {
        const {searchTools:{SearchConstants}} = this.props;
        const {name:key, renderer, label, userDefined} = val

        const isCore = (key === SearchConstants.KeyBasename || key === SearchConstants.KeyContent || key === SearchConstants.KeyBasenameOrContent)
        const fieldname = isCore ? key : SearchConstants.KeyMetaPrefix + key;
        const {values} = this.props;
        const value = values[fieldname];

        if (renderer) {
            // Custom renderer
            return renderer({
                ...this.props,
                label,
                value,
                fieldname: key,
                onChange: this.onChange.bind(this)
            });
        } else if (userDefined) {
            // No Custom renderer but user-defined metadata
            // Output a simple textfied **wrapped with** KeyMetaPrefix
            return Renderer.formRenderer(
                this.props,
                {...val, name: fieldname},
                {[fieldname]: value},
                this.onChange.bind(this)
            )
        } else {
            // Will switch on known field names (mime, scope, search, etc)
            return Renderer.formRenderer(
                this.props,
                val,
                values,
                this.onChange.bind(this)
            )
        }

    }

    clearAll() {
        const {values, onChange, searchTools:{SearchConstants, getDefaultScope}} = this.props;
        let clearVals = {}
        Object.keys(values).forEach(k => {
            if(k === SearchConstants.KeyBasenameOrContent) {
                clearVals[k] = values[k]
            } else if (k === SearchConstants.KeyScope) {
                clearVals[k] = getDefaultScope()
            } else {
                clearVals[k] = undefined;
            }
        })
        onChange(clearVals);
    }

    toggleGroup(group) {
        const {expands} = this.state;
        const newExpands = {...expands, [group]: !expands[group]}
        this.setState({expands: newExpands})
        localStorage.setItem(localKey, JSON.stringify(newExpands));
    }

    metaGroupsToTree(indexedMeta) {
        const groupedNS = {}
        indexedMeta.forEach((meta) => {
            const {groupName = ''} = meta
            if(!groupedNS[groupName]) {
                groupedNS[groupName] = new Map()
            }
            groupedNS[groupName].set(meta.namespace, meta)
        })
        const addNode = (tree, path, meta) => {
            let current = tree;
            for (let segment of path) {
                if (!current[segment]) {
                    current[segment] = {};
                }
                current = current[segment];
            }
            current.__NS__ = meta
        }
        const tree = {};
        Object.keys(groupedNS).map(path => {
            const meta = groupedNS[path]
            path = path.replace(/(^\/|\/$)/g, '').replace(/\\/g, '/');
            if (path === '') {
                tree.__NS__ = meta
                return
            }
            const segments = path.split('/');
            addNode(tree, segments, meta);
        })
        return tree;
    }

    treeToFields(tree, parent = '') {
        const {expands} = this.state
        const output = []
        const configs = tree.__NS__ || new Map()
        // Push Fields
        configs.forEach((m) => output.push({...m, name: m.namespace, userDefined: true}))
        // Push subgroups if there are
        const groupKeys = Object.keys(tree).filter(k => k !== '__NS__')
        groupKeys.sort()
        groupKeys.map(group => {
            const expandKey = parent+group;
            let label = parent+group
            const actives = this.treeToActives(tree[group])
            output.push({subheader: label, expandKey, expanded: expands[expandKey], actives})
            if(expands[expandKey]){
                output.push(...this.treeToFields(tree[group], group + '/'))
            }
        })
        return output
    }

    treeToActives(tree) {
        const {values, searchTools} = this.props;
        const {SearchConstants} = searchTools;
        let actives = 0
        const isActive= (name) => !!values[SearchConstants.KeyMetaPrefix+name]
        Object.keys(tree).forEach(key => {
            if(key === '__NS__') {
                tree[key].forEach(meta => {
                    if(isActive(meta.namespace)){
                        actives++
                    }
                })
            } else {
                // Count sub-branches
                actives += this.treeToActives(tree[key])
            }
        })
        return actives
    }


    render() {

        const {searchTools, getMessage, values, rootStyle, saveSearch, clearSavedSearch, muiTheme} = this.props;
        const {searchOptions, promptSearchLabel, currentSearchLabel} = this.state;
        const headerStyle = {
            fontSize: 13,
            color:'var(--md-sys-color-secondary)',// 'rgb(114, 140, 157)',
            textTransform: 'uppercase',
            fontWeight: 500,
            marginBottom: -10,
            marginTop: 10
        };
        const linkStyle = {
            padding: '12px 20px 0',
            color: muiTheme.palette.primary1Color,
            textDecoration: 'underline',
            cursor: 'pointer'
        }
        const linkIcon = {
            color: muiTheme.palette.primary1Color,
            cursor: 'pointer',
            display:'inline-block',
            marginLeft: 10
        }
        const activesBadge = {
            padding: '0 5px',
            marginLeft: 5,
            borderRadius: 4,
            backgroundColor: muiTheme.palette.mui3['tertiary-container'],
            color:muiTheme.palette.mui3['on-tertiary-container'],
            fontWeight: 600
        }
        const activesBadgeExpanded = {
            ...activesBadge,
            backgroundColor: 'transparent',
            border: '1px solid ' + muiTheme.palette.mui3['tertiary-container']
        }

        const {getDefaultScope, isDefaultScope, advancedValues} = searchTools
        const onRemove = (key) => {
            const newValues = {...values}
            newValues[key] = key === 'scope' ? getDefaultScope() : undefined;
            this.onChange(newValues);
        }
        const rowProps = {
            values,
            onRemove,
            isDefaultScope,
            getDefaultScope,
            muiTheme
        }

        const {searchID, searchLABEL} = values;
        const hasAdvanced = advancedValues().length > 0
        let showClear = hasAdvanced
        let showSaveNew = !searchID && !promptSearchLabel && hasAdvanced
        const kk = searchTools.SearchConstants


        const {indexedContent = false, indexedMeta = []} = searchOptions;
        const fNameLabel = getMessage(indexedContent?'searchengine.field.basenameOrContent' : 1);
        const tree = this.metaGroupsToTree(indexedMeta)
        const userFields = this.treeToFields(tree)

        const fields = [
            {name:'basenameOrContent', label: fNameLabel},
            {name:kk.KeyScope, type: 'scope', label: getMessage('searchengine.scope.title')},
            {name:kk.KeyMetaShared, type:'share', label: getMessage('searchengine.share.title')},
            {subheader:getMessage(489)},
            {name:kk.KeyMime, type: 'mime', label: getMessage('searchengine.format.title')},
            ... userFields,
            {subheader:getMessage(498)},
            {name:kk.KeyModifDate, type: 'modiftime', label: getMessage(4)},
            {name:kk.KeyBytesize, type:'bytesize', label: getMessage(2)},
        ]

        const close = () => {
            this.setState({promptSearchLabel:false, currentSearchLabel: ''})
        }
        const saveAndClose = () => {
            saveSearch(currentSearchLabel||searchLABEL);
            close()
        }

        const deleteAndClose = () => {
            if(window.confirm(getMessage('searchengine.query.action.delete-confirm'))){
                clearSavedSearch(searchID)
                close()
            }
        }

        return (
            <div className="search-advanced" style={{...rootStyle}}>

                {(searchID || promptSearchLabel) &&
                    <div style={{display: 'flex',alignItems: 'center', margin:8, borderRadius: 12, background:muiTheme.palette.mui3['surface-5']}}>
                        {promptSearchLabel &&
                            <div style={{flex: 1, paddingLeft:20}}>
                                <ModernTextField
                                    focusOnMount={true}
                                    fullWidth={true}
                                    hintText={getMessage('searchengine.query.save-label')}
                                    value={currentSearchLabel||searchLABEL||""}
                                    onChange={(e,v)=>this.setState({currentSearchLabel: v})}
                                    onKeyDown={(e)=>{if(e.key === 'Enter'){saveAndClose()}}}
                                />
                            </div>
                        }
                        {!promptSearchLabel &&
                            <div
                                style={{flex: 1, cursor: 'pointer', fontSize: 16, fontWeight:400, padding: '12px 20px', }}
                                onClick={() => this.setState({promptSearchLabel:true})}
                            >{searchLABEL}</div>
                        }
                        <div style={{padding: '12px 20px', fontSize: 15}}>
                            {promptSearchLabel &&
                                <a onClick={saveAndClose} style={linkIcon} title={getMessage('searchengine.query.action.save')}><span className={"mdi mdi-content-save"}/></a>
                            }
                            {promptSearchLabel &&
                                <a onClick={close} style={linkIcon} title={getMessage('54')}><span className={"mdi mdi-close"}/></a>
                            }
                            {!promptSearchLabel &&
                                <a onClick={() => this.setState({promptSearchLabel:true})} style={linkIcon} title={getMessage('54')}><span className={"mdi mdi-pencil"}/></a>
                            }
                            {!promptSearchLabel && searchID &&
                                <a onClick={deleteAndClose} title={getMessage('searchengine.query.action.delete')}>
                                    <DeleteOutline style={{...linkIcon, width: 16, height: 16, marginBottom: -2}}/>
                                </a>
                            }
                        </div>
                    </div>
                }


                <div style={{display:'flex'}}>
                <Subheader style={{...headerStyle, marginTop: 0, flex: 1}}>{getMessage(341)}</Subheader>
                    {(showSaveNew || showClear) &&
                        <div style={linkStyle}>
                            {showSaveNew && <a onClick={()=>this.setState({promptSearchLabel:true})}>{getMessage('searchengine.query.action.save-new')}</a>}
                            {showSaveNew && showClear && " | "}
                            {showClear && <a onClick={()=>this.clearAll()}>{getMessage('searchengine.query.action.clear-all')}</a>}
                        </div>
                    }
                </div>

                {fields.map(f => {
                    if(f.subheader) {
                        const cursor = f.expandKey ? {cursor: 'pointer'} : {}
                        const click = f.expandKey ? () => this.toggleGroup(f.expandKey) : null
                        return (
                            <Subheader style={{...headerStyle, ...cursor, marginTop: 0}} onClick={click}>
                                {f.expandKey && <span className={"mdi mdi-chevron-"+(f.expanded?'down':'right')}/>}
                                {f.subheader}
                                {f.actives > 0 && <span style={f.expanded?activesBadgeExpanded:activesBadge}>{f.actives}</span>}
                            </Subheader>
                        )
                    } else {
                        return <FieldRow {...rowProps} constants={kk} name={f.name} label={f.label}>{this.renderField(f)}</FieldRow>
                    }
                })}

            </div>
        )
    }
}

AdvancedSearch = PydioContextConsumer(muiThemeable()(AdvancedSearch));

export default AdvancedSearch
