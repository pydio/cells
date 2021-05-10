/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import asMetaField from "../hoc/asMetaField";

class SelectorField extends React.Component{
    render(){
        const {configs, getRealValue, column} = this.props;
        const value = getRealValue();
        let displayValue = getRealValue();
        let fieldConfig = configs.get(column.name);
        let color;
        if(fieldConfig && fieldConfig.data && fieldConfig.data.items){
            const found = fieldConfig.data.items.filter(i => i.key === value);
            if(found.length){
                displayValue = found[0].value;
                if(found[0].color){
                    color = <span className={'mdi mdi-label'} style={{color:found[0].color, marginRight: 5}}/>
                }
            }
        }
        return <span>{color}{displayValue}</span>;
    }
}
export default asMetaField(SelectorField);
