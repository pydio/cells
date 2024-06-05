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
import {Paper} from 'material-ui'

/**
 * Simple MuiPaper with a figure and a legend
 */
export default class SimpleFigureBadge extends React.Component{

    // static propTypes:{
    //     colorIndicator:PropTypes.string,
    //     figure:PropTypes.number.isRequired,
    //     legend:PropTypes.string
    // };

    constructor(props){
        super({colorIndicator: '', ...props});
    }

    render(){
        return (
            <Paper style={{display:'inline-block', marginLeft:16}}>
                <div className="figure-badge" style={(this.props.colorIndicator?{borderLeftColor:this.props.colorIndicator}:{})}>
                    <div className="figure">{this.props.figure}</div>
                    <div className="legend">{this.props.legend}</div>
                </div>
            </Paper>
        );
    }
}