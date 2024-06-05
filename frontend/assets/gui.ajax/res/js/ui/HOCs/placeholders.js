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
import ReactPlaceHolder from 'react-placeholder'
import { TextRow as Row, RoundShape as Round, RectShape as Rect, TextBlock as Block, MediaBlock as Media } from 'react-placeholder/lib/placeholders'
import {muiThemeable} from 'material-ui/styles'
import Color from 'color'

function getColor(props) {
    const base = props.muiTheme.palette.mui3['surface-variant'] || '#eee'
    if(props.muiTheme.darkMode){
        return base
    } else {
        return Color(base).fade(.5).toString()
    }
}

function TextRow(props) {
    return <Row color={getColor(props)} {...props}/>
}
TextRow = muiThemeable()(TextRow)

function RoundShape(props) {
    return <Round color={getColor(props)} {...props}/>
}
RoundShape = muiThemeable()(RoundShape)

function RectShape(props) {
    return <Rect color={getColor(props)} {...props}/>
}
RectShape = muiThemeable()(RectShape)

function TextBlock(props) {
    return <Block color={getColor(props)} {...props}/>
}
TextBlock = muiThemeable()(TextBlock)

function MediaBlock(props) {
    return <Media color={getColor(props)} {...props}/>
}
MediaBlock = muiThemeable()(MediaBlock)

export {TextRow, RoundShape, RectShape, TextBlock, MediaBlock}
export default ReactPlaceHolder