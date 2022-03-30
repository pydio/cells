/*
 * Copyright 2007-2022 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React, {Fragment} from 'react'
import Pydio from 'pydio'
import LangUtils from 'pydio/util/lang'
import {MenuItem} from 'material-ui'
import TypeSelectionBoard from "./TypeSelectionBoard";
const {ModernSelectField, ModernTextField} = Pydio.requireLib('hoc');

const MetaTypes = {
    "string":       "Text",
    "textarea":     "Long Text",
    "integer":      "Number",
    "boolean":      "Boolean",
    "date":         "Date",
    "choice":       "Selection",
    "tags":         "Extensible Tags",
    "stars_rate":   "Stars Rating",
    "css_label":    "Color Labels",
    "json":         "JSON"
}

class TypeEditor extends React.Component {

    updateType(value){
        const {namespace, onChange} = this.props;
        const newType = {type:value};
        if(newType === 'date') {
            newType.data = {format: 'date', display:'normal'};
        }
        namespace.JsonDefinition = JSON.stringify(newType);
        onChange(namespace);
    }

    updateLabel(value) {
        const {create, namespace, onChange, forcePrefix = ''} = this.props;
        if(create && (!namespace.Namespace || namespace.Namespace === (forcePrefix + LangUtils.computeStringSlug(namespace.Label)))){
            this.updateName(value);
        }
        namespace.Label = value;
        onChange(namespace);
    }

    updateName(value){
        const {namespace, onChange, forcePrefix} = this.props;
        let slug = LangUtils.computeStringSlug(value);
        if(forcePrefix && slug.indexOf(forcePrefix) !== 0){
            slug = forcePrefix + slug;
        }
        namespace.Namespace = slug;
        onChange(namespace);
    }

    getAdditionalData(defaultValue = {}){
        const {namespace} = this.props;
        try {
            const add = JSON.parse(namespace.JsonDefinition).data || defaultValue;
            if(defaultValue.items && add.split) {
                // Convert to new format
                const items = add.split(',').map(i => {
                    const [key, value] = i.split('|')
                    return {key, value};
                });
                return {items};
            }
            return add;
        }catch(e){}
        return defaultValue;
    }

    // Append data key
    setAdditionalDataKey(key, value) {
        const {namespace, onChange} = this.props;
        let def = JSON.parse(namespace.JsonDefinition);
        const add = {[key]: value}
        def.data = {...def.data, ...add};
        namespace.JsonDefinition = JSON.stringify(def);
        onChange(namespace)
    }

    render() {

        const {pydio, create, namespace, readonly, labelError, nameError, styles, metaTypes = MetaTypes} = this.props;
        let {m} = this.props;
        if(!m){
            m = (id) => pydio.MessageHash['ajxp_admin.metadata.' + id] || id;
        }
        let type = 'string';
        if(namespace.JsonDefinition){
            type = JSON.parse(namespace.JsonDefinition).type;
        }

        return (
            <div>
                <ModernTextField
                    floatingLabelText={m('label')}
                    value={namespace.Label}
                    onChange={(e,v) => {this.updateLabel(v)}}
                    fullWidth={true}
                    errorText={labelError}
                    disabled={readonly}
                    variant={"v2"}
                />
                <ModernTextField
                    floatingLabelText={m('namespace')}
                    disabled={!create}
                    value={namespace.Namespace}
                    onChange={(e,v) => {this.updateName(v)}}
                    fullWidth={true}
                    errorText={nameError}
                    variant={"v2"}
                />
                <div style={styles.section}>{m('type')}</div>
                <ModernSelectField
                    hintText={m('type')}
                    value={type}
                    onChange={(e,i,v) => this.updateType(v)}
                    disabled={readonly}
                    fullWidth={true}
                    variant={"v2"}
                >
                    {Object.keys(metaTypes).map(k => {
                        return <MenuItem value={k} primaryText={m('type.'+k) || metaTypes[k]}/>
                    })}
                </ModernSelectField>
                {type === 'choice' &&
                    <TypeSelectionBoard
                        data={this.getAdditionalData({items:[], steps:false})}
                        setAdditionalDataKey={this.setAdditionalDataKey.bind(this)}
                        m={m}
                    />
                }
                {type === 'date' &&
                    <Fragment>
                        <ModernSelectField
                            hintText={m('type.date.format')}
                            value={this.getAdditionalData({format:'date', display:'normal'}).format}
                            onChange={(e,i,v) => this.setAdditionalDataKey('format', v)}
                            disabled={readonly}
                            fullWidth={true}
                            variant={"v2"}
                        >
                            <MenuItem value={'date'} primaryText={m('type.date.format.date')}/>
                            <MenuItem value={'date-time'} primaryText={m('type.date.format.date-time')}/>
                            <MenuItem value={'time'} primaryText={m('type.date.format.time')}/>
                        </ModernSelectField>
                        <ModernSelectField
                            hintText={m('type.date.display')}
                            value={this.getAdditionalData({format:'date', display:'normal'}).display}
                            onChange={(e,i,v) => this.setAdditionalDataKey('display', v)}
                            disabled={readonly}
                            fullWidth={true}
                            variant={"v2"}
                        >
                            <MenuItem value={'normal'} primaryText={m('type.date.display.normal')}/>
                            <MenuItem value={'relative'} primaryText={m('type.date.display.relative')}/>
                        </ModernSelectField>
                    </Fragment>
                }
                {type === 'integer' &&
                    <Fragment>
                        <ModernSelectField
                            hintText={m('type.integer.format')}
                            value={this.getAdditionalData({format:'general'}).format || 'general'}
                            onChange={(e,i,v) => this.setAdditionalDataKey('format', v)}
                            disabled={readonly}
                            fullWidth={true}
                            variant={"v2"}
                        >
                            <MenuItem value={'general'} primaryText={m('type.integer.format.general')}/>
                            <MenuItem value={'bytesize'} primaryText={m('type.integer.format.bytesize')}/>
                            <MenuItem value={'percentage'} primaryText={m('type.integer.format.percentage')}/>
                            <MenuItem value={'progress'} primaryText={m('type.integer.format.progress')}/>
                        </ModernSelectField>
                    </Fragment>
                }
            </div>
        );
    }

}

TypeEditor.MetaTypes = MetaTypes;

export default TypeEditor