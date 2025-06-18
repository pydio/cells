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

import {createReactBlockSpec, createReactInlineContentSpec, SuggestionMenuController} from "@blocknote/react";
import SearchApi from 'pydio/http/search-api';
import Pydio from 'pydio'
import {SingleNode} from "../blocks/SingleNode";
import uuid4 from 'uuid4'
import React from "react";
import {insertOrUpdateBlock} from "@blocknote/core";
import {RiFolderOpenFill} from "react-icons/ri";
import {ModernList} from "../blocks/ChildrenList";

const api = new SearchApi(Pydio.getInstance())

export const NodeRef = createReactInlineContentSpec(
    {
        type: "nodeRef",
        propSchema: {
            inlineId: { default: ''},
            nodeUuid: { default: "" },
            path: { default: "" },
            label: { default: "" },
            repositoryId: { default: "" },
            displayPicker: { default: false }
        },
        content: "none",
    },
    {
        render: (props) => <SingleNode {...props} inline={true} {...props.inlineContent.props}/>,
    }
);

export const  pasteHandler= ({ event, editor, defaultPasteHandler }) => {
    const text = event.clipboardData?.getData("text/plain") || "";
    // split out any "node://UUID" chunks
    const parts = text.split(/(node:\/\/[A-Za-z0-9-]+)/g);
    if (parts.some((p) => p.startsWith("node://"))) {
        const inlineContent = parts.map((chunk) => {
            const m = /^node:\/\/([A-Za-z0-9-]+)$/.exec(chunk);
            if (m) {
                return {
                    type: "nodeRef",
                    props: { nodeUuid: m[1], inlineId: uuid4() },
                };
            }
            return chunk;
        });
        // insert your mix of text + captureNodes
        editor.insertInlineContent(inlineContent);
        return true;  // we handled it
    }
    // otherwise let BlockNote do its default thing
    return defaultPasteHandler();
}

export const NodeBlock = createReactBlockSpec(
    {
        type: "nodeBlock",
        propSchema: {
            inlineId: { default: ''},
            nodeUuid: { default: "" },
            path: { default: "" },
            repositoryId: { default: "" },
            label: { default: "" },
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

// Inline listing block.
export const ChildrenList = createReactBlockSpec(
    {
        type: "childrenList",
        propSchema: {
            display: {
                default: 'compact',
                values: ['compact', 'list', 'grid', 'detail', 'masonry-160']
            },
            nodeUuid: {default: ''},
            path: {default: ''},
            repositoryId: {default: ''}
        },
        content: "none",
    },
    {
        render: (props) => {
            return <ModernList editor={props.editor} block={props.block}/>
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
                        {
                            type: "nodeRef",
                            props: {
                                inlineId: uuid4(),
                                label,
                                nodeUuid: node.getMetadata().get('uuid'),
                                path: node.getPath(),
                                repositoryId:node.getMetadata().get('repository_id')
                            } },
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
// Custom Slash Menu item to insert a block after the current one.
export const insertChildrenList = (editor) => ({
    title: "Contents",
    onItemClick: () =>
        // If the block containing the text caret is empty, `insertOrUpdateBlock`
        // changes its type to the provided block. Otherwise, it inserts the new
        // block below and moves the text caret to it.
        insertOrUpdateBlock(editor, {
            type: "childrenList",
            props: {display: 'compact'},
        }),
    aliases: ["contents", "co"],
    group: "Others",
    icon: <RiFolderOpenFill size={18}/>,
    subtext: "Display current folder contents",
});

export const nodeBlockSpecs = {
    childrenList: ChildrenList,
    nodeBlock: NodeBlock
}

export const nodeInlineSpecs = {
    nodeRef: NodeRef
}