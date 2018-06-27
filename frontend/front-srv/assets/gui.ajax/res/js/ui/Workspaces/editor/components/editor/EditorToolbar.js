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

const {ModalAppBar} = PydioComponents
const {ToolbarGroup, IconButton} = require('material-ui');

// Display components
const EditorToolbar = ({title, className, style, onFullScreen, onMinimise, onClose}) => {

    const innerStyle = {color: "#FFFFFF", fill: "#FFFFFF"}

    return (
        <ModalAppBar
            className={className}
            style={style}
            title={<span>{title}</span>}
            titleStyle={innerStyle}
            iconElementLeft={<IconButton iconClassName="mdi mdi-close" iconStyle={innerStyle} disabled={typeof onClose !== "function"} touch={true} onTouchTap={onClose}/>}
            iconElementRight={
                <ToolbarGroup>
                    <IconButton iconClassName="mdi mdi-window-minimize" iconStyle={innerStyle} disabled={typeof onMinimise !== "function"} touch={true} onTouchTap={onMinimise}/>
                    {!pydio.UI.MOBILE_EXTENSIONS &&
                        <IconButton iconClassName="mdi mdi-window-maximize" iconStyle={innerStyle}
                                disabled={typeof onFullScreen !== "function"} touch={true} onTouchTap={onFullScreen}/>
                    }
                </ToolbarGroup>
            }
        />
    )
}

export default EditorToolbar
