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

import PropTypes from 'prop-types';

import React, { Component } from 'react';
import Pydio from 'pydio'
import {MenuItem, Divider} from 'material-ui';
import {sortWorkspaces} from "../../wslist/WorkspacesList";
const {ModernSelectField} = Pydio.requireLib('hoc');
const {PydioContextConsumer} = Pydio.requireLib('boot')

class SearchScopeSelector extends Component {

    static get propTypes() {
        return {
            value           : PropTypes.string,
            onChange        : PropTypes.func.isRequired,
            onClick      : PropTypes.func.isRequired,
            style           : PropTypes.object,
            labelStyle      : PropTypes.object
        };
    }

    render(){
        const {getMessage, pydio:{user}} = this.props;
        let items = [
            <MenuItem value={'all'} primaryText={getMessage(610)}/>
        ];
        if(user) {
            const {workspaces, cells} = sortWorkspaces(user.getRepositoriesList());
            const wsEntries = workspaces.map(ws => <MenuItem value={ws.getSlug() + '/'} primaryText={ws.getLabel()}/>);
            const cellsEntries = cells.map(ws => <MenuItem value={ws.getSlug() + '/'} primaryText={ws.getLabel()}/>);
            if(wsEntries.length || cellsEntries.length) {
                items.push(<Divider/>)
            }
            items = [...items, ...wsEntries];
            if(wsEntries.length && cellsEntries.length) {
                items.push(<Divider/>)
            }
            items = [...items, ...cellsEntries];
        }

        return (
            <ModernSelectField
                value={this.props.value}
                onChange={(e,i,v) => {this.props.onChange(v)}}
                fullWidth={true}
            >{items}</ModernSelectField>
        )
    }

}

SearchScopeSelector = PydioContextConsumer(SearchScopeSelector);
export {SearchScopeSelector as default}