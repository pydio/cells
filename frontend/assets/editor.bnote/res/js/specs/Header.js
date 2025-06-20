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

// The Title block.
import {createReactBlockSpec} from "@blocknote/react";
import {defaultProps} from "@blocknote/core";
import {HeaderBlock} from "../blocks/HeaderBlock";

export const HeaderV0 = createReactBlockSpec(
    {
        type: "title",
        propSchema: {
            textAlignment: defaultProps.textAlignment,
            textColor: defaultProps.textColor
        },
        content: "inline",
    },
    {
        render: (props) => <HeaderBlock {...props}/>,
    }
);

export const Header = createReactBlockSpec(
    {
        type: "header",
        propSchema: {
            textColor: defaultProps.textColor
        },
        content: "none",
    },
    {
        render: (props) => <HeaderBlock {...props}/>,
    }
);

export const headerBlockSpecs = {header:Header, title: HeaderV0}