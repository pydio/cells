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
const {ModernStyles, ModernTextField} = Pydio.requireLib('hoc');
const {PydioContextConsumer} = Pydio.requireLib('boot')

import {Toggle} from 'material-ui';

class SearchFileFormatPanel extends Component {

    constructor(props) {
        super(props);
        const {values} = this.props;
        this.state = {
            folder: values['ajxp_mime'] && values['ajxp_mime'] === 'ajxp_folder' ? true: undefined,
            ext: (values['ajxp_mime'] && values['ajxp_mime'] !== 'ajxp_folder' ? values['ajxp_mime'] : undefined),
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if(nextProps.values['ajxp_mime'] !== this.props.values['ajxp_mime']){
            const {values} = nextProps;
            this.setState({
                folder: values['ajxp_mime'] && values['ajxp_mime'] === 'ajxp_folder' ? true: undefined,
                ext: (values['ajxp_mime'] && values['ajxp_mime'] !== 'ajxp_folder' ? values['ajxp_mime'] : undefined),
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState === this.state) {
            return;
        }

        const {folder, ext} = this.state;

        this.props.onChange({
            ajxp_mime: (folder) ? 'ajxp_folder' : ext
        })
    }

    onToggle(e,v){
        if(v){
            this.setState({folder: v, ext: ''})
        } else {
            this.setState({folder: v})
        }
    }

    render() {

        const {inputStyle, getMessage, compact = false} = this.props;
        const {folder, ext} = this.state;

        return (
            <div style={compact?{display: 'flex'}:{}}>
                <div style={{...ModernStyles.div, padding:6, paddingRight:6, flex: 3, marginRight:4}}>
                    <Toggle
                        fullWidth={true}
                        name="toggleFolder"
                        value="ajxp_folder"
                        label={getMessage(502)}
                        labelStyle={{fontSize:16, color:'rgba(0,0,0,.4)'}}
                        toggled={folder}
                        onToggle={this.onToggle.bind(this)}
                    />
                </div>
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
            </div>
        );
    }
}

SearchFileFormatPanel = PydioContextConsumer(SearchFileFormatPanel);
export default SearchFileFormatPanel
