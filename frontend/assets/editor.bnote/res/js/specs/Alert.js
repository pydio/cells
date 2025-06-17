/*
 * Copyright 2025 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import {defaultProps, insertOrUpdateBlock} from "@blocknote/core";
import {createReactBlockSpec} from "@blocknote/react";
import {RiAlertFill} from "react-icons/ri";
import {AlertBlock} from "../blocks/AlertBlock";

// The Alert block.
export const Alert = createReactBlockSpec(
    {
        type: "alert",
        propSchema: {
            textAlignment: defaultProps.textAlignment,
            textColor: defaultProps.textColor,
            type: {
                default: "warning",
                values: ["warning", "error", "info", "success"],
            },
        },
        content: "inline",
    },
    {
        render: (props) => <AlertBlock {...props}/>,
    }
);

export const alertBlockSpecs = {alert: Alert}

// Custom Slash Menu item to insert a block after the current one.
export const insertAlertItem = (editor) => ({
    title: "Insert Warning Block",
    onItemClick: () =>
        // If the block containing the text caret is empty, `insertOrUpdateBlock`
        // changes its type to the provided block. Otherwise, it inserts the new
        // block below and moves the text caret to it. We use this function with
        // a block containing 'Hello World' in bold.
        insertOrUpdateBlock(editor, {
            type: "alert",
            props: {type:'warning'},
            content: [{ type: "text", text: "", styles:{}}],
        }),
    aliases: ["alert", "al"],
    group: "Others",
    icon: <RiAlertFill size={18} />,
    subtext: "Capture reader's attention with a warning",
});
