/*
 * Copyright 2007-2023 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import PathUtils from 'pydio/util/path'
import SearchScopeSelector from "./SearchScopeSelector";
import FileFormatPanel from "./FileFormatPanel";
import DatePanel from "./DatePanel";
import FileSizePanel from "./FileSizePanel";
import {Menu, MenuItem} from 'material-ui'
import {chipsStyles} from "./AdvancedChipsStyles";
const {ModernTextField, ModernSelectField, ModernStyles} = Pydio.requireLib('hoc');
const {moment} = Pydio.requireLib('boot')

export default class Renderer {
    static formRenderer(props, field, values, onChangeValues, mode) {
        const {pydio, searchTools} = props;
        const {type, name} = field
        switch (type) {
            case 'scope':
                return <SearchScopeSelector pydio={pydio} searchTools={searchTools} mode={mode} name={name} value={values.scope} onChange={(scope)=>{onChangeValues({...values, scope})}}/>
            case 'mime':
                return <FileFormatPanel compact={true} name={name} values={values} pydio={pydio} searchTools={searchTools} mode={mode} onChange={(values) => onChangeValues(values)} />
            case 'modiftime':
                return <DatePanel values={values} name={name} pydio={pydio} searchTools={searchTools} mode={mode} onChange={(values) => onChangeValues(values)} />
            case 'bytesize':
                return <FileSizePanel name={name} values={values} pydio={pydio} searchTools={searchTools}  mode={mode} onChange={(values) => onChangeValues(values)} />
            case 'share':
                if(mode === 'popover') {
                    const poStyles = chipsStyles({})
                    return (
                        <Menu listStyle={{...poStyles.popoverMenuStyle}} desktop={true} value={values[name]} onChange={(e,v) => onChangeValues({...values,[name]:v})}>
                            <MenuItem primaryText={<span style={{color:'var(--md-sys-color-outline)'}}>{pydio.MessageHash['searchengine.share.hint']}</span>} value={''}/>
                            <MenuItem primaryText={pydio.MessageHash['searchengine.share.option.link']} value={'link'}/>
                            <MenuItem primaryText={pydio.MessageHash['searchengine.share.option.cell']} value={'cell'}/>
                            <MenuItem primaryText={pydio.MessageHash['searchengine.share.option.any']} value={'any'}/>
                        </Menu>
                    )
                } else {
                    return (
                        <ModernSelectField name={name} hintText={pydio.MessageHash['searchengine.share.hint']} value={values[name]} pydio={pydio} onChange={(e,i,v) => onChangeValues({...values,[name]:v})} fullWidth={true} {...ModernStyles.selectFieldV1Search}>
                            <MenuItem primaryText={<span style={{color:'var(--md-sys-color-outline)'}}>{pydio.MessageHash['searchengine.share.hint']}</span>} value={''}/>
                            <MenuItem primaryText={pydio.MessageHash['searchengine.share.option.link']} value={'link'}/>
                            <MenuItem primaryText={pydio.MessageHash['searchengine.share.option.cell']} value={'cell'}/>
                            <MenuItem primaryText={pydio.MessageHash['searchengine.share.option.any']} value={'any'}/>
                        </ModernSelectField>
                    )
                }
            default:
                const {label} = field
                if(mode === 'popover') {
                    const poStyles = chipsStyles({})
                    return (
                        <div style={{...poStyles.popoverBlockStyle}}>
                        <ModernTextField
                            key={name}
                            value={values[name] || ''}
                            hintText={label}
                            fullWidth={true}
                            onChange={(e,v) => {onChangeValues({[name]:v})}}
                        />
                        </div>
                    )
                } else {
                    return (
                        <ModernTextField
                            key={name}
                            value={values[name] || ''}
                            hintText={label}
                            fullWidth={true}
                            onChange={(e,v) => {onChangeValues({[name]:v})}}
                            {...ModernStyles.textFieldV1Search}
                        />
                    )
                }
        }
    }

    static blockRenderer(props, field, value) {
        const {pydio=Pydio.getInstance(), searchTools} = props;
        const m = (id) => pydio.MessageHash[id]||id
        const kk = searchTools.SearchConstants
        if(field.blockRenderer) {
            const {label} = field;
            return {label, value:field.blockRenderer(value)}
        }
        const {type, isDate} =  field;
        let {label}=field, displayValue;
        switch (type) {
            case 'scope':
                if(value === 'previous_context'){
                    label = 'Folder'
                    const previous = pydio.getContextHolder().getSearchNode().getMetadata().get('previous_context')
                    displayValue = PathUtils.getBasename(previous)
                    if(!displayValue){
                        displayValue = '/'
                    }
                } else if(value !== 'all') {
                    let r;
                    pydio.user.getRepositoriesList().forEach(re => {if(re.getSlug()+'/' === value) r = re})
                    if (r){
                        label = 'Inside'
                        displayValue = r.getLabel();
                    }
                } else {
                    label = 'All Workspaces'
                }
                break
            case 'mime':
                if(!value) {
                    label = 'Format...'
                } else if(value === kk.ValueMimeFiles || value === kk.ValueMimeFolders) {
                    label = value === kk.ValueMimeFiles ? m('searchengine.format.file-only') : m('502')
                } else if ( value.indexOf('mimes:') === 0) {
                    displayValue = label
                    label = m('3')
                } else {
                    label = m('ajax_gui.mimegroup.byextension')
                    displayValue = value
                }
                break;
            case 'modiftime':
                const calendarOpts = {
                    sameDay: '['+m(493)+']',
                    nextDay: '['+m('494t')+']',
                    nextWeek: 'dddd',
                    lastDay: '['+m(494)+']',
                    lastWeek: '[Last] dddd',
                    sameElse: 'L'
                }

                if(isDate && value.getDate){
                    displayValue = moment(value).calendar(null, calendarOpts)
                    break
                }
                label = m('4')
                displayValue = ''
                let fromDisplay, toDisplay;
                if(value.from) {
                    fromDisplay = moment(value.from).calendar(null, calendarOpts)
                }
                if(value.to) {
                    toDisplay = moment(value.to).calendar(null, calendarOpts)
                }
                if(fromDisplay && toDisplay && fromDisplay !== toDisplay) {
                    displayValue = fromDisplay + ' > ' + toDisplay
                } else {
                    displayValue = fromDisplay || displayValue
                }
                break
            case 'bytesize':
                label = m('2')
                displayValue = ''
                if(value.from) {
                    displayValue += PathUtils.roundFileSize(value.from)
                    if(value.to) {
                        displayValue += ' <=> '
                    }
                }
                if(value.to) {
                    displayValue += PathUtils.roundFileSize(value.to)
                }
                break

            case 'share':
                switch (value){
                    case 'link':
                        label = pydio.MessageHash['searchengine.share.option.link']
                        break
                    case 'cell':
                        label = pydio.MessageHash['searchengine.share.option.cell']
                        break
                    case 'any':
                        label = pydio.MessageHash['searchengine.share.option.any']
                        break
                    default:
                        break
                }
                break

            default:
                if (typeof value === 'string' || typeof value === 'number' ) {
                    displayValue = value + ''
                }
                break
        }
        return {label, value:displayValue}
    }

}

export const renderField = (pydio, searchTools, mode='form', val, onChange) => {
    const {SearchConstants, values} = searchTools;
    const {name:key, renderer, label, userDefined} = val

    const isCore = (key === SearchConstants.KeyBasename || key === SearchConstants.KeyContent || key === SearchConstants.KeyBasenameOrContent)
    const fieldname = isCore ? key : SearchConstants.KeyMetaPrefix + key;
    //const {values} = this.props;
    const value = values[fieldname];

    if (renderer) {
        // Custom renderer
        const block = renderer({
            pydio,
            searchTools,
            label,
            value,
            fieldname: key,
            onChange,
            mode
        });
        if(mode === 'popover') {
            return <div style={chipsStyles({}).popoverBlockStyle}>{block}</div>
        } else {
            return block
        }
    } else if (userDefined) {
        // No Custom renderer but user-defined metadata
        // Output a simple textfied **wrapped with** KeyMetaPrefix
        return Renderer.formRenderer(
            {pydio, searchTools},
            {...val, name: fieldname},
            {[fieldname]: value},
            onChange,
            mode
        )
    } else {
        // Will switch on known field names (mime, scope, search, etc)
        return Renderer.formRenderer(
            {pydio, searchTools},
            val,
            values,
            onChange,
            mode
        )
    }

}
