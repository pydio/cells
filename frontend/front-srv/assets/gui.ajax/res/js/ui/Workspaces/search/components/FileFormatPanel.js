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
import Pydio from 'pydio';
const {ModernTextField, ModernSelectField, ThemedModernStyles} = Pydio.requireLib('hoc');
import {MenuItem, Divider} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
const {PydioContextConsumer} = Pydio.requireLib('boot')

const MimeGroups = [
    {id: "word", label:"word", mimes: "*word*"},
    {id: "excel", label:"spreadsheet", mimes: "*spreadsheet*|*excel*"},
    {id: "presentation", label:"presentation", mimes: "*presentation*|*powerpoint*"},
    {id: "pdfs", label:"pdf", mimes: "\"application/pdf\""},
    {id: "images", label:"image", mimes: "\"image/*\""},
    {id: "videos", label:"video", mimes: "\"video/*\""},
    {id: "audios", label:"audio", mimes: "\"audio/*\""}
]

class SearchFileFormatPanel extends Component {

    constructor(props) {
        super(props);
        this.state = this.propsToState(props)
    }

    propsToState(props) {
        const {values, name, searchTools:{SearchConstants}} = props;
        let selector, ext;
        if(this.state && this.state.selector && this.state.selector === 'extension'){
            selector = this.state.selector
        }
        const val = values[name];
        if(val){
            if(val === SearchConstants.ValueMimeFolders || val === SearchConstants.ValueMimeFiles) {
                selector = val
            } else if (val.indexOf('mimes:') === 0) {
                const mm = val.replace('mimes:', '')
                const gg = SearchConstants.MimeGroups.filter(gr => gr.mimes === mm)
                if (gg.length) {
                    selector = 'group:' + gg[0].id
                }
            } else {
                selector = 'extension'
                ext = val
            }
        }
        return {selector, ext}
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if(nextProps.values[nextProps.name] !== this.props.values[this.props.name]){
            this.setState(this.propsToState(nextProps))
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState === this.state) {
            return;
        }
        const {searchTools:{SearchConstants}} = this.props;
        const {ext, selector} = this.state;
        let searchValue;
        if(selector) {
            if(selector === 'extension'){
                searchValue = ext
            } else if(selector.indexOf('group:') === 0) {
                const gid = selector.replace('group:', '')
                searchValue = 'mimes:' + SearchConstants.MimeGroups.filter(gr => gr.id === gid)[0].mimes
            } else if (selector === SearchConstants.ValueMimeFolders || selector === SearchConstants.ValueMimeFiles) {
                searchValue = selector
            }
        }
        const {name, onChange} = this.props;
        onChange({
            [name]: searchValue
        })
    }

    render() {

        const {inputStyle, getMessage, muiTheme, compact = false, searchTools:{SearchConstants}} = this.props;
        const {folder, ext, selector = ''} = this.state;
        const mm = Pydio.getMessages()
        const mimeMessages = (id) => mm[SearchConstants.MimeGroupsMessage(id)]

        return (
            <div style={compact?{display: 'flex'}:{}}>
                <div style={{flex: 3, marginRight:4}}>
                    <ModernSelectField fullWidth={true} value={selector} onChange={(e,i,v)=> this.setState({selector:v, ext: ''}) }>
                        <MenuItem primaryText={<span style={{color:ThemedModernStyles(muiTheme).selectField.hintStyle.color}}>No filter</span>} value={''}/>
                        <MenuItem primaryText={getMessage(502)} value={SearchConstants.ValueMimeFolders}/>
                        <MenuItem primaryText={getMessage('searchengine.format.file-only')} value={SearchConstants.ValueMimeFiles}/>
                        <MenuItem primaryText={mimeMessages('byextension')} value={"extension"}/>
                        <Divider/>
                        {SearchConstants.MimeGroups.map(group => <MenuItem primaryText={mimeMessages(group.label)} value={'group:' + group.id}/> )}
                    </ModernSelectField>
                </div>
                {selector === 'extension' &&
                    <div style={{flex: 2, marginLeft:4}}>
                        <ModernTextField
                            disabled={folder}
                            style={{...inputStyle, opacity:folder?.5:1, marginLeft: compact?0:null, width:compact?'auto':null}}
                            className="mui-text-field"
                            hintText={getMessage(500)}
                            value={ext || ""}
                            onChange={(e, v) => this.setState({ext: v})}
                        />
                    </div>
                }
            </div>
        );
    }
}

SearchFileFormatPanel = PydioContextConsumer(muiThemeable()(SearchFileFormatPanel));
export default SearchFileFormatPanel
