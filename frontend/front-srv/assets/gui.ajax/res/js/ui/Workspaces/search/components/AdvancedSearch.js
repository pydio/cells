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

import React, {Component} from 'react';
import _ from 'lodash';

import {Subheader, TextField, CardTitle} from 'material-ui';
const {PydioContextConsumer} = require('pydio').requireLib('boot')

import DatePanel from './DatePanel';
import FileFormatPanel from './FileFormatPanel';
import FileSizePanel from './FileSizePanel';

class AdvancedSearch extends Component {

    static get styles() {
        return {
            text: {
                width: "calc(100% - 32px)",
                margin: "0 16px"
            }
        }
    }

    constructor(props) {
        super(props)

        this.state = {
            value: props.values['basename'] || ''
        };
    }

    onChange(values) {
        if (values.hasOwnProperty('basename')) {
            this.setState({
                value: values.basename
            })
        }
        this.props.onChange(values)
    }

    renderField(key, val) {

        const {text} = AdvancedSearch.styles

        const fieldname = (key === 'basename') ? key : 'ajxp_meta_' + key
        const value = this.props.values[fieldname];

        if (typeof val === 'object') {
            const {label, renderComponent} = val;

            // The field might have been assigned a method already
            if (renderComponent) {
                const component = renderComponent({
                    ...this.props,
                    label,
                    value,
                    fieldname:key,
                    onChange: (object)=>{this.onChange(object)}
                })
                return (
                    <div style={{margin:'0 16px'}}>
                        <div style={{color: 'rgba(0,0,0,0.33)', fontSize: 12, marginBottom: -10, marginTop: 10}}>{label}</div>
                        {component}
                    </div>
                );
            }
        }

        return (
            <TextField
                key={fieldname}
                value={this.state.value || ''}
                style={text}
                className="mui-text-field"
                floatingLabelFixed={true}
                floatingLabelText={val}
                hintText={val}
                onChange={(e,v) => {this.onChange({[fieldname]:v})}}
            />
        );
    }

    render() {

        const {text} = AdvancedSearch.styles

        const {pydio, onChange, getMessage, values} = this.props
        const headerStyle = {fontSize: 18, color: 'rgba(0,0,0,0.87)', fontWeight: 400, marginBottom: -10, marginTop: 10};

        return (
            <div className="search-advanced">
                <Subheader style={{...headerStyle, marginTop: 0}}>{getMessage(489)}</Subheader>
                <AdvancedMetaFields {...this.props}>
                    {fields =>
                        <div>
                            {Object.keys(fields).map((key) => this.renderField(key, fields[key]))}
                        </div>
                    }
                </AdvancedMetaFields>

                <Subheader style={headerStyle}>{getMessage(490)}</Subheader>
                <DatePanel values={values} pydio={pydio} inputStyle={text} onChange={(values) => this.onChange(values)} />

                <Subheader style={{...headerStyle, marginBottom: 10}}>{getMessage(498)}</Subheader>
                <FileFormatPanel values={values} pydio={pydio} inputStyle={text} onChange={(values) => this.onChange(values)} />

                <Subheader style={headerStyle}>{getMessage(503)}</Subheader>
                <FileSizePanel values={values} pydio={pydio} inputStyle={text} onChange={(values) => this.onChange(values)} />
            </div>
        )
    }
}

AdvancedSearch = PydioContextConsumer(AdvancedSearch);

class AdvancedMetaFields extends Component {

    constructor(props) {
        super(props)

        const {pydio} = props

        const registry = pydio.getXmlRegistry()

        // Parse client configs
        let options = JSON.parse(XMLUtils.XPathGetSingleNodeText(registry, 'client_configs/template_part[@ajxpClass="SearchEngine" and @theme="material"]/@ajxpOptions'));

        this.build = _.debounce(this.build, 500)

        this.state = {
            options,
            fields: {}
        }
    }

    componentWillMount() {
        this.build()
    }

    build() {

        const {options} = this.state
        let {metaColumns, reactColumnsRenderers} = {...options}
        if(!metaColumns){
            metaColumns = {};
        }
        if(!reactColumnsRenderers){
            reactColumnsRenderers = {};
        }

        const generic = {basename: this.props.getMessage(1)}

        // Looping through the options to check if we have a special renderer for any
        const specialRendererKeys = Object.keys({...reactColumnsRenderers})
        const standardRendererKeys = Object.keys({...metaColumns}).filter((key) => specialRendererKeys.indexOf(standardRendererKeys) > -1)

        const columns = standardRendererKeys.map((key) => {key: metaColumns[key]}).reduce((obj, current) => obj = {...obj, ...current}, [])

        const renderers = Object.keys({...reactColumnsRenderers}).map((key) => {
            const renderer = reactColumnsRenderers[key]
            const namespace = renderer.split('.',1).shift()

            // If the renderer is not loaded in memory, we trigger the load and send to rebuild
            if (!window[namespace]) {
                ResourcesManager.detectModuleToLoadAndApply(renderer, () => this.build(), true);
                return
            }

            return {
                [key]: {
                    label: metaColumns[key],
                    renderComponent: FuncUtils.getFunctionByName(renderer, global)
                }
            }
        }).reduce((obj, current) => obj = {...obj, ...current}, [])

        const fields = {
            ...generic,
            ...columns,
            ...renderers
        }

        this.setState({
            fields
        })
    }

    render() {
        return this.props.children(this.state.fields)
    }
}

AdvancedMetaFields.propTypes = {
    children: React.PropTypes.func.isRequired,
};

export default AdvancedSearch
