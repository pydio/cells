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

import {Component} from 'react'
import {Subheader} from 'material-ui'
import {muiThemeable} from 'material-ui/styles';

class SubHeader extends Component {

    render() {
        const {title, legend, muiTheme, titleStyle, legendStyle} = this.props;
        const {accent2Color} = muiTheme.palette;

        const subheaderStyle = {
            textTransform: 'uppercase',
            fontSize: 12,
            color: accent2Color,
            paddingLeft: 20,
            paddingRight: 20,
            ...titleStyle
        };

        let legendS = {
            padding: '0 20px',
            ...legendStyle
        };
        if(!title){
            legendS = {
                padding: '20px 20px 0',
                ...legendStyle
            }
        }

        return (
            <div>
                {title &&
                    <Subheader style={subheaderStyle}>{title}</Subheader>
                }
                {legend &&
                    <div style={legendS}>{legend}</div>
                }
            </div>
        );
    }
}

SubHeader = muiThemeable()(SubHeader);
export {SubHeader as default};