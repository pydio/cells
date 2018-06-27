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

import { IconButton } from 'material-ui';
import { connect } from 'react-redux';
import { mapStateToProps } from './utils';
import { handler } from '../utils';

const _Prev = (props) => <IconButton onClick={() => handler("onSelectionChange", props)(props.tab.selection.previous())} iconClassName="mdi mdi-arrow-left" disabled={props.tab.selection && !props.tab.selection.hasPrevious()} />
const _Play = (props) => <IconButton onClick={() => handler("onTogglePlaying", props)(true)} iconClassName="mdi mdi-play" disabled={props.tab.playing} />
const _Pause = (props) => <IconButton onClick={() => handler("onTogglePlaying", props)(false)} iconClassName="mdi mdi-pause" disabled={!props.tab.playing} />
const _Next = (props) => <IconButton onClick={() => handler("onSelectionChange", props)(props.tab.selection.next())} iconClassName="mdi mdi-arrow-right" disabled={props.tab.selection && !props.tab.selection.hasNext()} />

// Final export and connection
export const Prev = connect(mapStateToProps)(_Prev)
export const Play = connect(mapStateToProps)(_Play)
export const Pause = connect(mapStateToProps)(_Pause)
export const Next = connect(mapStateToProps)(_Next)
