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


import { Component } from 'react';
import {TextField} from 'material-ui'
import debounce from 'lodash.debounce'

/**
 * Ready to use Form + Result List for search users
 */
class SearchForm extends Component{

    state = {}

    constructor(props, context){
        super(props, context);
        const {onSearch, setSearchTerm} = props;
        if(!setSearchTerm) {
            this.state = {value: ''};
            this.search = debounce(()=>{
                onSearch(this.state.value)
            }, 300);
        }
    }

    onChange(event, value){
        const {setSearchTerm} = this.props
        if(setSearchTerm) {
            setSearchTerm(value)
        } else {
            this.setState({value: value});
            this.search();
        }
    }

    render(){

        const {underlineShow, searchLabel, style, inputStyle, underlineStyle, underlineFocusStyle, hintStyle, searchTerm} = this.props;
        const {value} = this.state;

        return (
            <div style={{minWidth:320, ...style}}>
                <TextField
                    fullWidth={true}
                    value={value || searchTerm}
                    onChange={(e,v) => this.onChange(e,v)}
                    hintText={searchLabel}
                    inputStyle={inputStyle}
                    hintStyle={hintStyle}
                    underlineStyle={underlineStyle}
                    underlineFocusStyle={underlineFocusStyle}
                    underlineShow={underlineShow === undefined ? true : underlineShow}
                />
            </div>
        );

    }

}

SearchForm.propTypes = {
    /**
     * Label displayed in the search field
     */
    searchLabel     : PropTypes.string.isRequired,
    /**
     * Callback triggered to search
     */
    onSearch        : PropTypes.func.isRequired,
    /**
     * Will be appended to the root element
     */
    style           : PropTypes.object,
    /**
     * To be applied on TextField
     */
    underlineShow   : PropTypes.bool
};

export {SearchForm as default}