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

        this.state = {
            folder: this.props.values['ajxp_mime'] && this.props.values['ajxp_mime'] === 'ajxp_folder' ? true: undefined,
            ext: (this.props.values['ajxp_mime'] && this.props.values['ajxp_mime'] !== 'ajxp_folder' ? this.props.values['ajxp_mime'] : undefined),
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

    render() {

        const {inputStyle, getMessage} = this.props;

        return (
            <div>
                <div style={{...ModernStyles.div, margin:'6px 16px', padding:6, paddingRight:6}}>
                    <Toggle
                        fullWidth={true}
                        name="toggleFolder"
                        value="ajxp_folder"
                        label={getMessage(502)}
                        labelStyle={{fontSize:16, color:'rgba(0,0,0,.4)'}}
                        toggled={this.state.folder}
                        onToggle={(e, toggled) => this.setState({folder: toggled})}
                    />
                </div>
                {!this.state.folder &&
                    <ModernTextField
                        style={inputStyle}
                        className="mui-text-field"
                        hintText={getMessage(500)}
                        value={this.state.ext}
                        onChange={(e) => this.setState({ext: e.target.value})}
                    />
                }
            </div>
        );
    }
}

SearchFileFormatPanel = PydioContextConsumer(SearchFileFormatPanel);
export default SearchFileFormatPanel
