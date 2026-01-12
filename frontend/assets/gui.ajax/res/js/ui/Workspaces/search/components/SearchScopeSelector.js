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
import Repository from 'pydio/model/repository'
import {Menu, MenuItem, Divider, Subheader} from 'material-ui';
import {chipsStyles} from "./AdvancedChipsStyles";
const {ModernSelectField, ModernStyles} = Pydio.requireLib('hoc');
const {PydioContextConsumer} = Pydio.requireLib('boot')

class SearchScopeSelector extends Component {

    static get propTypes() {
        return {
            value           : PropTypes.string,
            onChange        : PropTypes.func.isRequired,
            onClick         : PropTypes.func.isRequired,
            style           : PropTypes.object,
            labelStyle      : PropTypes.object,
            mode            : PropTypes.string,
        };
    }

    render(){
        const {getMessage, pydio, onChange, mode} = this.props;
        let {value} = this.props;

        let items = [], folder = [], currentWs = [], otherW = [], otherC = [];

        const all = [<MenuItem value={'all'} primaryText={getMessage(610)}/>];

        const active = pydio.user.getActiveRepository();
        const activeWs = pydio.user.getRepositoriesList().get(active)
        const homePage = active === 'homepage'

        if(!homePage){
            const previous = pydio.getContextHolder().getSearchNode().getMetadata().get('previous_context')
            if(previous && previous !== '/') {
                folder.push(<MenuItem value={'previous_context'} primaryText={getMessage(170)}/>)
            }
        }
        if(pydio.user) {
            pydio.user.getRepositoriesList().forEach(ws => {
                if(Repository.isInternal(ws.getId())){
                    return;
                }
                if(ws.getId() === active) {
                    currentWs.push(<MenuItem value={ws.getSlug() + '/'} primaryText={getMessage(372)}/>)
                } else {
                    ws.getOwner() ? otherC.push(ws) : otherW.push(ws)
                }
            })
        }
        otherW.sort((a,b) => a.getLabel().localeCompare(b.getLabel()))
        otherC.sort((a,b) => a.getLabel().localeCompare(b.getLabel()))

        otherC = otherC.map(ws => <MenuItem value={ws.getSlug() + '/'} primaryText={ws.getLabel()}/>)
        otherW = otherW.map(ws => <MenuItem value={ws.getSlug() + '/'} primaryText={ws.getLabel()}/>)
        let shStyle = {}
        if(mode === 'popover') {
            shStyle = {paddingLeft: 24, lineHeight: '32px', opacity: 0.4, fontSize: 12};
        }
        if(otherW.length) {
            otherW.unshift(<Subheader style={shStyle}>Workspaces</Subheader>)
        }
        if(otherC.length) {
            otherC.unshift(<Subheader style={shStyle}>Cells</Subheader>)
        }

        if (homePage) {
            items = [
                ...all,
                ...otherW,
                ...otherC
            ]
        } else {
            if(otherW.length > 0 || otherC.length > 0){
                all.push(<Divider/>)
            }
            if(otherW.length > 0 && otherC.length > 0) {
                otherW.push(<Divider/>)
            }
            items = [
                ...folder,
                ...currentWs,
                ...all,
                ...otherW,
                ...otherC
            ]
        }

        if(value === 'previous_context' && folder.length === 0) {
            value = homePage ? 'all' : activeWs.getSlug()+'/'
        }

        if(mode === 'popover') {
            const poStyles = chipsStyles({})

            return (
                <Menu
                    value={value}
                    desktop={true}
                    onChange={(e,v) => {onChange(v)}}
                    listStyle={{...poStyles.popoverMenuStyle}}
                >{items}</Menu>
            )

        } else {

            return (
                <ModernSelectField
                    value={value}
                    onChange={(e,i,v) => {onChange(v)}}
                    fullWidth={true}
                    {...ModernStyles.selectFieldV1Search}
                >{items}</ModernSelectField>
            )

        }

    }

}

SearchScopeSelector = PydioContextConsumer(SearchScopeSelector);
export {SearchScopeSelector as default}