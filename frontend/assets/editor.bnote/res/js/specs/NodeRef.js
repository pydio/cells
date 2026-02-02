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

import {createReactBlockSpec, createReactInlineContentSpec} from "@blocknote/react";
import {SingleNode} from "../blocks/SingleNode";
import {DroppedMonitor} from "../blocks/DroppedMonitor";
import uuid4 from 'uuid4'
import React, {useMemo} from "react";
import {RiFileFill, RiFolderOpenFill} from "react-icons/ri";
import {ChildrenList as ChildrenListBlock} from "../blocks/ChildrenList";
import {ResultsList as ResultsListBlock} from "../blocks/ResultsList";
const {emptyDataModel} = Pydio.requireLib('hoc')

export const NodeRefSpecType = 'nodeRef'
export const NodeBlockSpecType = 'nodeBlock'
export const ChildrenListSpecType = 'childrenList'
export const ResultsListSpecType = 'resultsList'
export const DroppedMonitorSpecType = 'droppedMonitor'

export const NodeRef = createReactInlineContentSpec(
    {
        type: NodeRefSpecType,
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

export const DroppedMonitorSpec = createReactBlockSpec(
    {
        type: DroppedMonitorSpecType,
        propSchema: {
            sessionUuid: { default: ''},
            blockId: { default: null },
        },
        content: "none",
    },
    {
        render: (props) => <DroppedMonitor {...props} editor={props.editor} block={props.block} blockId={props.block.id}/>,
    }
)

export const  pasteHandler= ({ event, editor, defaultPasteHandler }) => {
    const text = event.clipboardData?.getData("text/plain") || "";
    // split out any "node://UUID" chunks
    const parts = text.split(/(node:\/\/[A-Za-z0-9-]+)/g);
    if (parts.some((p) => p.startsWith("node://"))) {
        const inlineContent = parts.map((chunk) => {
            const m = /^node:\/\/([A-Za-z0-9-]+)$/.exec(chunk);
            if (m) {
                return {
                    type: NodeRefSpecType,
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
        type: NodeBlockSpecType,
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

// Listing block.
export const ChildrenList = createReactBlockSpec(
    {
        type: ChildrenListSpecType,
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
            return <ChildrenListBlock editor={props.editor} block={props.block}/>
        },
    }
);

// Listing block.
export const ResultsList = createReactBlockSpec(
    {
        type: ResultsListSpecType,
        propSchema: {
            display: {
                default: 'compact',
                values: ['compact', 'list', 'grid', 'detail', 'masonry-160']
            },
            searchValues: {
                default: {}
            },
            sortInfo: {
                default: {field:'', desc: false}
            }
        },
        content: "none",
    },
    {
        render: (props) => {
            const dm = useMemo(() => emptyDataModel(), []);
            return (
                <ResultsListBlock
                    editor={props.editor}
                    dataModel={dm}
                    block={props.block}
                />)
        },
    }
);


// Custom Slash Menu item to insert a block after the current one.
export const insertChildrenList = (editor) => ({
    key:'toc',
    title: "Table of Contents",
    onItemClick: () => {
        const currentBlock = editor.getTextCursorPosition().block;
        editor.insertBlocks(
            [{
                type: ChildrenListSpecType,
                props: {display: 'compact'},
            }],
            currentBlock,
            "after"
        );
    },
    aliases: ["toc", "contents", "co"],
    group: "Advanced",
    icon: <RiFolderOpenFill size={18}/>,
    subtext: "Display current folder contents",
});

// Custom Slash Menu item to insert a block after the current one.
export const insertResultsList = (editor) => ({
    key:'search',
    title: "Search Results",
    onItemClick: () => {
        const event = new CustomEvent('pydioOpenSelector', {
            detail: {
                openValues: {
                    basenameOrContent:'*',
                },
                openSort: {field: 'mtime', desc: true},
                onSelectSearch: (searchValues, sortField, sortDesc) => {
                    const currentBlock = editor.getTextCursorPosition().block;
                    editor.insertBlocks(
                        [{
                            type: ResultsListSpecType,
                            props: {
                                display: 'compact',
                                searchValues,
                                sortInfo: {field: sortField, desc: sortDesc}
                            },
                        }],
                        currentBlock,
                        "after"
                    );
                },
                onSelectCancel: () => {}
            }
        });
        document.dispatchEvent(event);
    },
    aliases: ["search", "results", "s"],
    group: "Advanced",
    icon: <RiFolderOpenFill size={18}/>,
    subtext: "Display a search results list",
});

// Custom Slash Menu item to insert a block after the current one.
export const insertNodePickerBlock = (editor) => ({
    key:'node',
    title: "File or Folder",
    onItemClick: () => {
        const event = new CustomEvent('pydioOpenSearch', {
            detail: {
                openValues: {
                    basenameOrContent:'*',
                },
                openSort: {field: 'mtime', desc: true},
                onSelectNode: (node) => {
                    const newProps = {
                        inlineId: uuid4(),
                        nodeUuid: node.getMetadata().get('uuid'),
                        path: node.getPath(),
                        repositoryId: node.getMetadata().get('repository_id')
                    }
                    editor.insertInlineContent([{type: NodeRefSpecType, props: newProps}], {updateSelection: true});
                },
                onSelectCancel: () => console.log('CANCELLED'),
            }
        })
        document.dispatchEvent(event)
    },
    aliases: ["file", "folder", "f"],
    group: "Advanced",
    icon: <RiFileFill size={18}/>,
    subtext: "Insert a file or folder",
});

export const nodeBlockSpecs = {
    childrenList: ChildrenList(),
    nodeBlock: NodeBlock(),
    droppedMonitor: DroppedMonitorSpec(),
    resultsList: ResultsList(),
}

export const nodeInlineSpecs = {
    nodeRef: NodeRef
}