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

import React, {Component, PropTypes} from 'react'
import {MenuItem, DropDownMenu} from 'material-ui';
const {PydioContextConsumer} = require('pydio').requireLib('boot')

class SearchScopeSelector extends Component {

    static get propTypes() {
        return {
            value           : PropTypes.string,
            onChange        : PropTypes.func.isRequired,
            onTouchTap      : PropTypes.func.isRequired,
            style           : PropTypes.object,
            labelStyle      : PropTypes.object
        };
    }

    render(){
        const {getMessage} = this.props;
        return (
            <DropDownMenu
                value={this.props.value}
                onChange={(e,i,v) => {this.props.onChange(v)}}
                onTouchTap={this.props.onTouchTap}
                autoWidth={true}
                style={this.props.style}
                underlineStyle={{display:'none'}}
                labelStyle={this.props.labelStyle}
            >
                <MenuItem value={'folder'} primaryText={getMessage(608)}/>
                <MenuItem value={'ws'} primaryText={getMessage(609)}/>
                <MenuItem value={'all'} primaryText={getMessage(610)}/>
            </DropDownMenu>

        );
    }

}

SearchScopeSelector = PydioContextConsumer(SearchScopeSelector);
export {SearchScopeSelector as default}