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

const starsStyle = {
    fontSize: 20,
    color: '#FBC02D',
    marginTop:6,
    marginBottom: 6
};

class StarsField extends React.Component{
    render(){
        const {getRealValue, size} = this.props;
        let value = getRealValue() || 0;
        let stars = [0,1,2,3,4].map(function(v){
            return <span key={"star-" + v} className={"mdi mdi-star" + (value > v ? '' : '-outline')}></span>;
        });
        const style = size === 'small' ? {color: starsStyle.color} : starsStyle;
        return <span style={style}>{stars}</span>;
    }
}

export {starsStyle}
export default asMetaField(StarsField);
