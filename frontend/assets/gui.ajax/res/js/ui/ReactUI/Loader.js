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

import React from 'react'
import {CircularProgress} from 'material-ui'

export default class Loader extends React.Component{

    render(){
        let style = Object.assign({background:'transparent',display:'flex',alignItems:'center',width:'100%',height:'100%'}, this.props.style || {});
        return (
            <div style={style}>
                <div style={{background:'transparent',flex:1,textAlign:'center'}}><CircularProgress/></div>
            </div>
        );
    }

}