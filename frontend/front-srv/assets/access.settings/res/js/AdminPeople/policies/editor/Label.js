/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import {Divider, DropDownMenu, MenuItem, FontIcon, TextField} from 'material-ui'

class Label extends React.Component{

    onChange(event, newValue){
        const {rule} = this.props;
        this.props.onChange({...rule, description:newValue});
    }

    render(){
        const {rule, containerStyle} = this.props;
        return (
            <div>
                <div style={{...containerStyle, display:'flex', alignItems:'center', fontSize: 16, margin:'6px 16px'}}>
                    <div style={{width: 100, fontWeight:500}}>Label</div>
                    <TextField underlineShow={false} fullWidth={true} value={rule.description} onChange={this.onChange.bind(this)}/>
                </div>
                <Divider/>
            </div>
        );
    }

}

export {Label as default}