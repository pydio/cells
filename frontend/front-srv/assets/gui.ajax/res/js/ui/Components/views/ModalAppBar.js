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
import {AppBar} from 'material-ui'

const ModalAppBar = (props) => {

    let {style, titleStyle, iconStyleRight, iconStyleLeft, ...otherProps} = props;
    const styles = {
        style: {
            flexShrink: 0,
            /*borderRadius: '2px 2px 0 0',*/
            ...style
        },
        titleStyle:{
            lineHeight: '56px',
            height: 56,
            marginLeft: -8,
            ...titleStyle
        },
        iconStyleRight:{
            marginTop: 4,
            ...iconStyleRight
        },
        iconStyleLeft: {
            marginTop: 4,
            ...iconStyleLeft
        }
    };

    return <AppBar {...otherProps} {...styles}/>

}

export {ModalAppBar as default}