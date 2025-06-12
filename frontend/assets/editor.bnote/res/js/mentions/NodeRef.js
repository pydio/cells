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

import {createReactBlockSpec, createReactInlineContentSpec, SuggestionMenuController, useBlockNoteEditor} from "@blocknote/react";
import SearchApi from 'pydio/http/search-api';
import Pydio from 'pydio'
import {SingleNode} from "./SingleNode";
import uuid4 from 'uuid4'

const api = new SearchApi(Pydio.getInstance())

export const NodeRef = createReactInlineContentSpec(
    {
        type: "nodeRef",
        propSchema: {
            inlineId: { default: ''},
            path: { default: "" },
            label: { default: "" },
            repositoryId: { default: "" },
        },
        content: "none",
    },
    {
        render: (props) => <SingleNode {...props} inline={true} {...props.inlineContent.props}/>,
    }
);

export const NodeBlock = createReactBlockSpec(
    {
        type: "nodeBlock",
        propSchema: {
            inlineId: { default: ''},
            path: { default: "" },
            label: { default: "" },
            repositoryId: { default: "" },
            blockSize: { default: 'md'}
        },
        content: "none",
    },
    {
        render: (props) => {
            return <SingleNode {...props} inline={false} {...props.block.props}/>
        },
    }
);

export const getNodesMenuItems = (editor, query) => {
    return api.search({basename:query}, 'all', 10, true).then(res => {
        const {Results} = res;
        return Results.map(node => {
            const label = node.getLabel()
            return     {
                title: <span>{node.getMetadata().get('repository_display')} - {node.getPath()}</span>,
                onItemClick: () => {
                    editor.insertInlineContent([
                        { type: "nodeRef", props: { inlineId: uuid4(), label, path: node.getPath(), repositoryId:node.getMetadata().get('repository_id') } },
                        " ", // add a space after the mention
                    ]);
                }
            }

        })
    })
}

export const NodesSuggestionMenu = ({editor}) => <SuggestionMenuController
    triggerCharacter={"%"}
    getItems={(query) => getNodesMenuItems(editor, query)}
    minQueryLength={0}
/>
