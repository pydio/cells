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

import {createReactInlineContentSpec, SuggestionMenuController} from "@blocknote/react";
import PydioApi from 'pydio/http/api';

export const Mention = createReactInlineContentSpec(
    {
        type: "mention",
        propSchema: {
            user: {
                default: "Unknown",
            },
        },
        content: "none",
    },
    {
        render: (props) => (
            <span style={{ backgroundColor: "#8400ff33",padding: '2px 5px', fontSize:15, borderRadius: 5 }}>@{props.inlineContent.props.user}</span>
        ),
    }
);

export const getMentionMenuItems = (editor, query) => {
    const api = PydioApi.getRestClient().getIdmApi();
    return api.listUsers("/", query, true, 0, 10).then(res => {
        const {Users = []} = res;
        return Users.map(user => {
            const label = (user.Attributes && user.Attributes['displayName']) ? user.Attributes['displayName'] : user.Login;
            return {
                title:label,
                onItemClick: () => {
                    editor.insertInlineContent([
                        { type: "mention", props: { user: label } },
                        " ", // add a space after the mention
                    ]);
                }
            }
        })
    })
}

export const MentionSuggestionMenu = ({editor}) => <SuggestionMenuController
    triggerCharacter={"@"}
    getItems={(query) => getMentionMenuItems(editor, query)}
/>

export const mentionInlineSpecs = {mention: Mention}