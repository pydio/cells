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

const phColor = "#f5f5f5"

export function TextRow(props) {
    return <Row color={phColor} {...props}/>
}

export function RoundShape(props) {
    return <Round color={phColor} {...props}/>
}

export function RectShape(props) {
    return <Rect color={phColor} {...props}/>
}

export function TextBlock(props) {
    return <Block color={phColor} {...props}/>
}

export function MediaBlock(props) {
    return <Media color={phColor} {...props}/>
}

export default ReactPlaceHolder