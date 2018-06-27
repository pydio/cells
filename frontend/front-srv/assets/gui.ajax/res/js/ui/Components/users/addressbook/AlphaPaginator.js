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


import {Component, PropTypes} from 'react'
import {muiThemeable} from 'material-ui/styles'
import Pydio from 'pydio'
const {PydioContextConsumer} = Pydio.requireLib('boot')

import {SelectField, MenuItem} from 'material-ui';

/**
 * Alphabet and pages generator to give a first-letter-based pagination
 */
class AlphaPaginator extends Component{

    render(){

        let letters = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
        letters = [-1, ...letters];
        const {item, paginatorCallback, style, getMessage} = this.props;

        let paginator;
        if(item.pagination){

            const {start, end, max, interval} = item.pagination;

            const total_pages = Math.ceil(max / interval);
            const current = Math.ceil(start / interval);
            let pages = [];
            for(let i=0; i<total_pages;i++) pages.push(i);

            paginator = (
                <SelectField floatingLabelText={getMessage(331)} style={{width: 60}} fullWidth={true} value={current} onChange={(e,i,v) => { paginatorCallback((v*interval) + '-' + (v+1)*interval) }}>
                    {pages.map((p) => {
                        return <MenuItem value={p} key={p} primaryText={p+1}/>
                    })}
                </SelectField>
            );

        }

        const currentPage = (item.currentParams && item.currentParams.alpha_pages && item.currentParams.value) || -1;

        return (
            <div style={{...style, display:'flex', paddingRight: 8, alignItems:'center'}}>
                <div style={{flex:1}}>{getMessage(249, '')}</div>
                {paginator}
                <SelectField floatingLabelText={getMessage(625)} style={{width: 60, marginLeft: 20}} fullWidth={true} value={currentPage} onChange={(e,i,v) => { paginatorCallback(v) }}>
                    {letters.map((l) => {
                        return <MenuItem value={l} key={l} primaryText={l === -1 ? getMessage(597, '') : l}/>
                    })}
                </SelectField>
            </div>
        );
    }

}

AlphaPaginator.propTypes = {
    /**
     * Currently selected Item
     */
    item            : PropTypes.object,
    /**
     * When a letter is clicked, function(letter)
     */
    paginatorCallback: PropTypes.func.isRequired,
    /**
     * Main instance of pydio
     */
    pydio           : PropTypes.instanceOf(Pydio),
    /**
     * Display mode, either large (book) or small picker ('selector', 'popover').
     */
    mode            : PropTypes.oneOf(['book', 'selector', 'popover']).isRequired,
}


AlphaPaginator = PydioContextConsumer(AlphaPaginator);
AlphaPaginator = muiThemeable()(AlphaPaginator);

export {AlphaPaginator as default}