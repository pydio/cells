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

import { useState, useCallback } from 'react';
import { TextInput, Select, Button } from '@mantine/core';
import { BlockMenu } from './BlockMenu';
import {
    RiAlignLeft,
    RiAlignCenter,
    RiAlignRight,
    RiPencilFill,
} from 'react-icons/ri';
import { t } from '../messages';

import Pydio from 'pydio';
const { Toolbar } = Pydio.requireLib('components');

const TOOLBAR_TYPE = 'toolbar';

const alignmentOptions = [
    { value: 'left', title: 'Left', icon: RiAlignLeft },
    { value: 'center', title: 'Center', icon: RiAlignCenter },
    { value: 'right', title: 'Right', icon: RiAlignRight },
];

const alignmentToJustify = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
};

const InlineToolbarBlock = ({ editor, block }) => {
    const { toolbarNames, alignment } = block.props;
    const isNew = !toolbarNames;
    const [editing, setEditing] = useState(isNew);
    const [draftNames, setDraftNames] = useState(toolbarNames);
    const [draftAlignment, setDraftAlignment] = useState(alignment);

    const handleConfirm = useCallback(() => {
        editor.updateBlock(block, {
            type: TOOLBAR_TYPE,
            props: { toolbarNames: draftNames, alignment: draftAlignment },
        });
        setEditing(false);
    }, [editor, block, draftNames, draftAlignment]);

    const handleEdit = useCallback(() => {
        setDraftNames(block.props.toolbarNames);
        setDraftAlignment(block.props.alignment);
        setEditing(true);
    }, [block.props]);

    if (editing) {
        return (
            <div
                contentEditable={false}
                className={'small-outline'}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    padding: 12,
                    border: '1px dashed var(--md-sys-color-outline-variant, #ccc)',
                    borderRadius: 6,
                    width: '100%',
                }}
            >
                <TextInput
                    label={t('toolbar-block.names-label')}
                    value={draftNames}
                    onChange={(e) => setDraftNames(e.target.value)}
                    placeholder="name1, name2, name3"
                />
                <Select
                    label={t('toolbar-block.alignment-label')}
                    value={draftAlignment}
                    onChange={(v) => setDraftAlignment(v)}
                    data={alignmentOptions.map(({ value, title }) => ({
                        value,
                        label: title,
                    }))}
                />
                <Button
                    size="xs"
                    onClick={handleConfirm}
                    disabled={!draftNames.trim()}
                >
                    {isNew
                        ? t('toolbar-block.confirm')
                        : t('toolbar-block.update')}
                </Button>
            </div>
        );
    }

    const names = toolbarNames
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean);
    const menu = (
        <BlockMenu
            groups={[
                {
                    title: '',
                    values: [
                        {
                            value: 'edit',
                            title: t('toolbar-block.edit'),
                            icon: RiPencilFill,
                        },
                    ],
                    onValueSelected: handleEdit,
                },
                {
                    title: t('toolbar-block.alignment-label'),
                    values: alignmentOptions,
                    crtValue: alignment,
                    onValueSelected: (value) => {
                        editor.updateBlock(block, {
                            type: TOOLBAR_TYPE,
                            props: { ...block.props, alignment: value },
                        });
                    },
                },
            ]}
            position="bottom-start"
        />
    );

    return (
        <div
            contentEditable={false}
            className="disable-outline"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: alignmentToJustify[alignment] || 'flex-start',
                width: '100%',
            }}
        >
            {alignment === 'right' && menu}
            <Toolbar
                controller={Pydio.getInstance().getController()}
                toolbars={names}
                toolbarStyle={{ height: 30 }}
                flatButtonStyle={{
                    height: 30,
                    lineHeight: '24px',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    borderRadius: 8,
                    marginRight: 8,
                }}
                renderingType="button"
            />
            {alignment !== 'right' && menu}
        </div>
    );
};

export { InlineToolbarBlock };
