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
import {MenuItem} from 'material-ui'
const {ModernTextField, ModernSelectField, ModernStyles} = Pydio.requireLib('hoc');
const {moment} = Pydio.requireLib('boot')

export default class Renderer {
    static formRenderer(props, field, values, onChangeValues) {
        const {pydio, searchTools} = props;
        const {type, name} = field
        switch (type) {
            case 'scope':
                return <SearchScopeSelector pydio={pydio} searchTools={searchTools} name={name} value={values.scope} onChange={(scope)=>{onChangeValues({...values, scope})}}/>
            case 'mime':
                return <FileFormatPanel compact={true} name={name} values={values} pydio={pydio}  searchTools={searchTools} onChange={(values) => onChangeValues(values)} />
            case 'modiftime':
                return <DatePanel values={values} name={name} pydio={pydio} searchTools={searchTools} onChange={(values) => onChangeValues(values)} />
            case 'bytesize':
                return <FileSizePanel name={name} values={values} pydio={pydio} searchTools={searchTools} onChange={(values) => onChangeValues(values)} />
            case 'share':
                return (
                    <ModernSelectField name={name} hintText={pydio.MessageHash['searchengine.share.hint']} value={values[name]} pydio={pydio} onChange={(e,i,v) => onChangeValues({...values,[name]:v})} fullWidth={true} {...ModernStyles.selectFieldV1Search}>
                        <MenuItem primaryText={<span style={{color:'var(--md-sys-color-outline)'}}>{pydio.MessageHash['searchengine.share.hint']}</span>} value={''}/>
                        <MenuItem primaryText={pydio.MessageHash['searchengine.share.option.link']} value={'link'}/>
                        <MenuItem primaryText={pydio.MessageHash['searchengine.share.option.cell']} value={'cell'}/>
                        <MenuItem primaryText={pydio.MessageHash['searchengine.share.option.any']} value={'any'}/>
                    </ModernSelectField>
                )
            default:
                const {label} = field
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

    static blockRenderer(props, field, value) {
        const {pydio=Pydio.getInstance(), searchTools} = props;
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
                if(value === kk.ValueMimeFiles || value === kk.ValueMimeFolders) {
                    label = value === kk.ValueMimeFiles ? 'Files Only' : 'Folders Only'
                } else if (value && value.indexOf('mimes:') === 0) {
                    displayValue = label
                    label = "File Type"
                } else {
                    label = 'Extension'
                    displayValue = value
                }
                break;
            case 'modiftime':
                if(isDate && value.getDate){
                    displayValue = moment(value).calendar(null, {
                        sameDay: '[Today]',
                        nextDay: '[Tomorrow]',
                        nextWeek: 'dddd',
                        lastDay: '[Yesterday]',
                        lastWeek: '[Last] dddd',
                        sameElse: 'L'
                    })
                    break
                }
                label = 'Modified'
                displayValue = ''
                if(value.from) {
                    displayValue += moment(value.from).calendar(null, {
                        sameDay: '[Today]',
                        nextDay: '[Tomorrow]',
                        nextWeek: 'dddd',
                        lastDay: '[Yesterday]',
                        lastWeek: '[Last] dddd',
                        sameElse: 'L'
                    })
                    if(value.to) {
                        displayValue += ' to '
                    }
                }
                if(value.to) {
                    displayValue += moment(value.to).calendar(null, {
                        sameDay: '[Today]',
                        nextDay: '[Tomorrow]',
                        nextWeek: 'dddd',
                        lastDay: '[Yesterday]',
                        lastWeek: '[Last] dddd',
                        sameElse: 'L'
                    })
                }
                break
            case 'bytesize':
                label = 'Size'
                displayValue = ''
                if(value.from) {
                    displayValue += PathUtils.roundFileSize(value.from)
                    if(value.to) {
                        displayValue += ' to '
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