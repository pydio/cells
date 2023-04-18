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
import ContextMenuModel from 'pydio/model/context-menu'

const withContextMenu = (Component) => {
    return class ContextMenu extends React.Component {
        onContextMenu(event) {
            
            const {node} = this.props
            event.preventDefault()
            event.stopPropagation()

            if (node) {
                ContextMenuModel.getInstance().openNodeAtPosition(node, event.clientX, event.clientY);
            } else {
                ContextMenuModel.getInstance().openAtPosition(event.clientX, event.clientY);
            }

        }

        render() {
            return <Component {...this.props} onContextMenu={this.onContextMenu.bind(this)} />
        }
    }
}

export {withContextMenu as default}
