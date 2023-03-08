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
import Pydio from 'pydio'
import { connect } from 'react-redux';
import { FloatingActionButton } from 'material-ui';
import makeRotate from './make-rotate';

const { EditorActions } = Pydio.requireLib('hoc');

class Button extends React.Component {

    render() {
        const {rotated} = this.props

        let iconClassName = 'mdi mdi-close'
        if (!rotated) {
            iconClassName = 'mdi mdi-animation'
        }

        return (
            <FloatingActionButton {...this.props} iconClassName={iconClassName}/>
        );
    }
};

const AnimatedButton = makeRotate(Button)

function mapStateToProps(state, ownProps) {
    const { editor } = state

    return  {
        ...editor.menu
    }
}

const ConnectedButton = connect(mapStateToProps, EditorActions)(AnimatedButton)

export default ConnectedButton
