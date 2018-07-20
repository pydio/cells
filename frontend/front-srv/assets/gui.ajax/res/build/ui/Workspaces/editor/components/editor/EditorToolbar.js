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

"use strict";

exports.__esModule = true;
var _PydioComponents = PydioComponents;
var ModalAppBar = _PydioComponents.ModalAppBar;

var _require = require('material-ui');

var ToolbarGroup = _require.ToolbarGroup;
var IconButton = _require.IconButton;

// Display components
var EditorToolbar = function EditorToolbar(_ref) {
    var title = _ref.title;
    var className = _ref.className;
    var style = _ref.style;
    var onFullScreen = _ref.onFullScreen;
    var onMinimise = _ref.onMinimise;
    var onClose = _ref.onClose;

    var innerStyle = { color: "#FFFFFF", fill: "#FFFFFF" };

    return React.createElement(ModalAppBar, {
        className: className,
        style: style,
        title: React.createElement(
            "span",
            null,
            title
        ),
        titleStyle: innerStyle,
        iconElementLeft: React.createElement(IconButton, { iconClassName: "mdi mdi-close", iconStyle: innerStyle, disabled: typeof onClose !== "function", touch: true, onTouchTap: onClose }),
        iconElementRight: React.createElement(
            ToolbarGroup,
            null,
            React.createElement(IconButton, { iconClassName: "mdi mdi-window-minimize", iconStyle: innerStyle, disabled: typeof onMinimise !== "function", touch: true, onTouchTap: onMinimise }),
            !pydio.UI.MOBILE_EXTENSIONS && React.createElement(IconButton, { iconClassName: "mdi mdi-window-maximize", iconStyle: innerStyle,
                disabled: typeof onFullScreen !== "function", touch: true, onTouchTap: onFullScreen })
        )
    });
};

exports["default"] = EditorToolbar;
module.exports = exports["default"];
