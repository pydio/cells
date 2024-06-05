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
import Pydio from 'pydio'
import asMetaField from "../hoc/asMetaField";

const getCssLabels = () => {
    const messages = Pydio.getMessages();
    return {
        'low'       : {label:messages['meta.user.4'], sortValue:'5', color: '#66c'},
        'todo'      : {label:messages['meta.user.5'], sortValue:'4', color: '#69c'},
        'personal'  : {label:messages['meta.user.6'], sortValue:'3', color: '#6c6'},
        'work'      : {label:messages['meta.user.7'], sortValue:'2', color: '#c96'},
        'important' : {label:messages['meta.user.8'], sortValue:'1', color: '#c66'}
    }
}

class CSSLabelsField extends React.Component{
    render(){
        const {getRealValue} = this.props;
        let value = getRealValue();
        const data = getCssLabels();
        if(value && data[value]){
            let dV = data[value];
            return <span><span className="mdi mdi-label" style={{color: dV.color}} /> {dV.label}</span>
        }else{
            return <span>{value}</span>;
        }
    }
}
export {getCssLabels}
export default asMetaField(CSSLabelsField);
