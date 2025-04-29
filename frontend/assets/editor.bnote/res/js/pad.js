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
import React, {useState, useEffect} from 'react'
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote, getDefaultReactSlashMenuItems, SuggestionMenuController } from "@blocknote/react";
import { BlockNoteSchema, defaultBlockSpecs, defaultInlineContentSpecs, locales,  filterSuggestionItems } from "@blocknote/core";
import {ChildrenList} from './ChildrenList';
import {Mention, MentionSuggestionMenu} from './Mention'
import {NodeRef, NodesSuggestionMenu} from "./NodeRef";
import {Alert, insertAlertItem} from './Alert'

const schema = BlockNoteSchema.create({
    blockSpecs: {
        // Adds all default blocks.
        ...defaultBlockSpecs,
        // Adds the Alert block.
        childrenList: ChildrenList,
        alert: Alert,
    },
    inlineContentSpecs: {
        ...defaultInlineContentSpecs,
        mention:Mention,
        nodeRef:NodeRef,
    }
});

// List containing all default Slash Menu Items, as well as our custom one.
const getCustomSlashMenuItems = (
    editor
) => [
    ...getDefaultReactSlashMenuItems(editor),
    insertAlertItem(editor),
];

const css = `
        .bn-container *{
            white-space: pre-wrap;
            user-select: text;
            -webkit-user-select: text;
        }
        .bn-editor {
            background-color:transparent;
        }
        .bn-container.bn-readonly table {
            margin-bottom: 20px;
        }
        .bn-container.bn-readonly p.bn-inline-content {
            min-height: 20px;
        }
        .react-mui-context .bn-container h1,
        .react-mui-context .bn-container h2,
        .react-mui-context .bn-container h3,
        .react-mui-context .bn-container h4,
        .react-mui-context .bn-container h5,
        .react-mui-context .bn-container h6{
            font-weight: inherit;
        }
        .react-mui-context.mui3-token .bn-children-list .mimefont-container {
            background-color: transparent !important;
        }
        .react-mui-context.mui3-token .bn-container .bn-selected .mimefont-container div.mimefont, 
        .react-mui-context.mui3-token .bn-container .bn-selected .mimefont-container span.overlay-icon-span {
            color: var(--md-sys-color-on-secondary) !important;
        }
        .ProseMirror-selectednode>.bn-block-content[data-content-type="childrenList"]>*{
            outline: none;
        }
        .tree-icon.mdi.mdi-folder:before {
            content: '\\F0DC9';
        }
    `


export default ({initialContent = [], onChange, darkMode, readOnly, style}) => {

    const [htmlReady, setHtmlReady] = useState('')

    // Creates a new editor instance.
    const editor = useCreateBlockNote({
        schema,
        initialContent:initialContent.length?initialContent:null,
        // We override the `placeholders` in our dictionary
        dictionary: {
            ...locales.en,
            placeholders: {
                ...locales.en.placeholders,
                // We override the default placeholder
                default: "Type text or '/' for commands, '%' for mentioning a file, '@' for mentioning a user",
            }
        }
    });


    let main;
    if(false && readOnly) {
        useEffect(() => {
            editor.blocksToFullHTML(initialContent||[]).then(res => setHtmlReady(res))
        }, [initialContent])
        if(htmlReady) {
            main =(<div
                data-color-scheme={darkMode?"dark":"light"}
                className={"bn-container bn-readonly bn-editor bn-mantine bn-default-styles"}
                dangerouslySetInnerHTML={{__html:htmlReady}}
            />)
        } else {
            main = 'Rendering HTML...'
        }
    } else {
        main = (
            <BlockNoteView
                editable={!readOnly}
                onChange={() => onChange(editor.document)}
                editor={editor}
                theme={darkMode?"dark":"light"}
            >
                <SuggestionMenuController
                    triggerCharacter={"/"}
                    // Replaces the default Slash Menu items with our custom ones.
                    getItems={async (query) =>
                        filterSuggestionItems(getCustomSlashMenuItems(editor), query)
                    }
                />
                <MentionSuggestionMenu editor={editor}/>
                <NodesSuggestionMenu editor={editor}/>
            </BlockNoteView>
        )
    }

    // Renders the editor instance using a React component.
    return (
        <div style={{flex: 1, width: '100%', backgroundColor:'var(--md-sys-color-surface)', paddingTop: 20, userSelect:"inherit", ...style}}
             onClick={(e) => e.stopPropagation()}
             onKeyUp={(e) => e.stopPropagation()}
        >
            {main}
            <style type={"text/css"} dangerouslySetInnerHTML={{__html:css}}/>
        </div>
    );
};