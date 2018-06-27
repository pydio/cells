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

import React from 'react';
const {PydioContextConsumer} = require('pydio').requireLib('boot')

import {TextField} from 'material-ui';

class SearchFileSizePanel extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            from:false,
            to: null
        }
    }

    onChange() {
        this.setState({
            from: this.refs.from.getValue() || 0,
            to: this.refs.to.getValue() || 1099511627776
        })
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextState === this.state) return

        const {from, to} = nextState

        this.props.onChange({
            ajxp_bytesize: (from && to) ? '['+from+' TO '+to+']' : null
        })
    }

    render() {

        const {inputStyle, getMessage, ...props} = this.props

        return (
            <div>
                <TextField
                    ref="from"
                    style={inputStyle}
                    hintText={getMessage(504)}
                    floatingLabelFixed={true}
                    floatingLabelText={getMessage(613)}
                    onChange={this.onChange.bind(this)}
                />
                <TextField
                    ref="to"
                    style={inputStyle}
                    hintText={getMessage(504)}
                    floatingLabelFixed={true}
                    floatingLabelText={getMessage(614)}
                    onChange={this.onChange.bind(this)}
                />
            </div>
        );
    }
}

SearchFileSizePanel = PydioContextConsumer(SearchFileSizePanel)
export default SearchFileSizePanel