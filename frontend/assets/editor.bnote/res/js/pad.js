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
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Pydio from 'pydio';
// Default styles for the mantine editor
import '@blocknote/mantine/style.css';
import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import {
    useCreateBlockNote,
    getDefaultReactSlashMenuItems,
    SuggestionMenuController,
    AddBlockButton,
    SideMenu,
    SideMenuController,
} from '@blocknote/react';
import {
    BlockNoteSchema,
    defaultBlockSpecs,
    createCodeBlockSpec,
    defaultInlineContentSpecs,
} from '@blocknote/core';
import { filterSuggestionItems } from '@blocknote/core/extensions';
import {
    en,
    fr,
    pt,
    de,
    es,
    it,
    zhTW,
    ru,
    ja,
    vi,
} from '@blocknote/core/locales';
// This packages some of the most used languages in on-demand bundle
import { codeBlockOptions } from './blocks/codeblock';

import { MentionSuggestionMenu, mentionInlineSpecs } from './specs/Mention';
import {
    nodeBlockSpecs,
    nodeInlineSpecs,
    insertChildrenList,
    insertNodePickerBlock,
    insertResultsList,
    pasteHandler,
} from './specs/NodeRef';
import { alertBlockSpecs, insertAlertItem } from './specs/Alert';
import { toolbarBlockSpecs, insertToolbarItem } from './specs/Toolbar';
import { insertSubPageItem } from './specs/SubPage';
import { SideMenuButton } from './SideMenuButton';
import ContextMenuModel from 'pydio/model/context-menu';
import { headerBlockSpecs, HeaderSpecType } from './specs/Header';
import { findExistingHeader } from './hooks/useNodeTitle';

import { padFileDropHandler } from './hooks/padFileDropHandler';
import './pad-styles.less';
const { ModalSearch } = Pydio.requireLib('workspaces');
const { emptyDataModel } = Pydio.requireLib('hoc');

const schema = BlockNoteSchema.create({
    blockSpecs: {
        ...defaultBlockSpecs,
        ...nodeBlockSpecs,
        ...alertBlockSpecs,
        ...toolbarBlockSpecs,
        ...headerBlockSpecs,
        codeBlock: createCodeBlockSpec(codeBlockOptions),
    },
    inlineContentSpecs: {
        ...defaultInlineContentSpecs,
        ...nodeInlineSpecs,
        ...mentionInlineSpecs,
    },
});

const defaultExcludedKeys = ['audio', 'video', 'image', 'file'];

const languageMapping = {
    de: de,
    'en-us': en,
    'es-es': es,
    fr: fr,
    it: it,
    'pt-br': pt,
    ja: ja, // Japanese
    ru: ru, // Russian
    'vi-vn': vi, // Vietnamese
    'zh-cn': zhTW, // Chinese simplified => taiwan
};

// List containing all default Slash Menu Items, as well as our custom one.
const getCustomSlashMenuItems = (editor) => {
    const all = [
        ...getDefaultReactSlashMenuItems(editor).filter(
            (item) => defaultExcludedKeys.indexOf(item.key) === -1,
        ),
        insertChildrenList(editor),
        insertNodePickerBlock(editor),
        insertResultsList(editor),
        insertAlertItem(editor),
        insertToolbarItem(editor),
        insertSubPageItem(editor),
    ];
    // Ensure Groups ordering and grouping
    const groupsOrder = [
        editor.dictionary.slash_menu.paragraph.group,
        editor.dictionary.slash_menu.heading.group,
        editor.dictionary.slash_menu.table.group, // Advanced
        editor.dictionary.slash_menu.toggle_heading.group, // Togglable groups
        editor.dictionary.slash_menu.emoji.group, // Others
    ];
    let ordered = [];
    groupsOrder.forEach((group) => {
        ordered = [...ordered, ...all.filter((i) => i.group === group)];
    });
    return ordered;
};

export default ({
    initialContent = [],
    onChange,
    darkMode,
    readOnly,
    style,
}) => {
    const [htmlReady, setHtmlReady] = useState('');

    const dictionary =
        languageMapping[Pydio.getInstance().currentLanguage || 'en'] || en;

    // Creates a new editor instance.
    const editor = useCreateBlockNote({
        schema,
        initialContent: initialContent.length ? initialContent : null,
        // We override the `placeholders` in our dictionary
        dictionary,
        pasteHandler: pasteHandler,
        setIdAttribute: true,
        tables: {
            splitCells: true,
            cellBackgroundColor: true,
            cellTextColor: true,
            headers: true,
        },
    });

    const onChangePreventHeaderDelete = useCallback(() => {
        const blocks = editor.document;
        if (!findExistingHeader(blocks)) {
            editor.insertBlocks(
                [{ type: HeaderSpecType }],
                blocks && blocks.length ? blocks[0] : null,
                'before',
            );
            return;
        }
        onChange(blocks);
    }, [editor, onChange]);

    const searchDM = useMemo(() => emptyDataModel(), []);

    let main;
    if (false && readOnly) {
        useEffect(() => {
            editor
                .blocksToFullHTML(initialContent || [])
                .then((res) => setHtmlReady(res));
        }, [initialContent]);
        if (htmlReady) {
            main = (
                <div
                    data-color-scheme={darkMode ? 'dark' : 'light'}
                    className={
                        'bn-container bn-readonly bn-editor bn-mantine bn-default-styles'
                    }
                    dangerouslySetInnerHTML={{ __html: htmlReady }}
                />
            );
        } else {
            main = 'Rendering HTML...';
        }
    } else {
        const slashMenuItems = getCustomSlashMenuItems(editor);
        main = (
            <BlockNoteView
                editable={!readOnly}
                onChange={onChangePreventHeaderDelete}
                editor={editor}
                theme={darkMode ? 'dark' : 'light'}
                sideMenu={false}
                slashMenu={false}
                onClick={(e) => ContextMenuModel.getInstance().close()}
                onDrop={(e) => padFileDropHandler(editor, e)}
            >
                <SideMenuController
                    sideMenu={(props) => (
                        <SideMenu {...props}>
                            <AddBlockButton {...props} />
                            <SideMenuButton />
                        </SideMenu>
                    )}
                />
                <SuggestionMenuController
                    triggerCharacter={'/'}
                    // Replaces the default Slash Menu items with our custom ones.
                    getItems={async (query) =>
                        filterSuggestionItems(slashMenuItems, query)
                    }
                />
                <MentionSuggestionMenu editor={editor} />
            </BlockNoteView>
        );
    }

    // Renders the editor instance using a React component.
    return (
        <div
            style={{
                flex: 1,
                width: '100%',
                backgroundColor: 'var(--md-sys-color-surface)',
                paddingTop: 20,
                userSelect: 'inherit',
                ...style,
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            onDrop={(e) => padFileDropHandler(editor, e, true)}
        >
            {main}
            <ModalSearch
                pydio={Pydio.getInstance()}
                dataModel={searchDM}
                accessKey={''}
                eventName={'pydioOpenSelector'}
            />
        </div>
    );
};
