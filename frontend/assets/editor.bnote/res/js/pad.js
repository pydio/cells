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
import { useCreateBlockNote, } from "@blocknote/react";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import {ChildrenList} from './ChildrenList';

const schema = BlockNoteSchema.create({
    blockSpecs: {
        // Adds all default blocks.
        ...defaultBlockSpecs,
        // Adds the Alert block.
        childrenList: ChildrenList,
    },
});

export default ({initialContent = [], onChange, darkMode, readOnly, style, node}) => {

    const [htmlReady, setHtmlReady] = useState('')

    if(node) {
        let found = false;
        initialContent.map(block => {
            if(block.type === 'childrenList') {
                block.props.node = node
                found = true;
            }
        })
        if(!found) {
            initialContent.push({
                type: "childrenList",
                props:{
                    node: node,
                }
            })
        }
    }

    // Creates a new editor instance.
    const editor = useCreateBlockNote({
        schema,
        initialContent:initialContent.length?initialContent:null
    });

    const css = `
        .bn-container *{
            white-space: normal;
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
    `

    let main;
    if(readOnly) {
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
            main = 'Rendring HTML...'
        }
    } else {
        main = (
            <BlockNoteView
                onChange={() => onChange(editor.document)}
                editor={editor}
                theme={darkMode?"dark":"light"}
            />
        )
    }

    // Renders the editor instance using a React component.
    return (
        <div style={{flex: 1, width: '100%', backgroundColor:'var(--md-sys-color-surface)', padding: '10px 60px', userSelect:"inherit", ...style}}
             onClick={(e) => e.stopPropagation()}
             onKeyUp={(e) => e.stopPropagation()}
        >
            {main}
            <style type={"text/css"} dangerouslySetInnerHTML={{__html:css}}/>
        </div>
    );
};