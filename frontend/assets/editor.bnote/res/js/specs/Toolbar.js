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

import { createReactBlockSpec } from '@blocknote/react';
import { RiToolsFill } from 'react-icons/ri';
import { InlineToolbarBlock } from '../blocks/InlineToolbar';
import { t } from '../messages';

export const ToolbarSpecType = 'toolbar';

export const Toolbar = createReactBlockSpec(
    {
        type: ToolbarSpecType,
        propSchema: {
            toolbarNames: { default: '' },
            alignment: {
                default: 'left',
                values: ['left', 'center', 'right'],
            },
        },
        content: 'none',
    },
    {
        render: (props) => <InlineToolbarBlock {...props} />,
    },
);

export const toolbarBlockSpecs = { toolbar: Toolbar() };

export const insertToolbarItem = (editor) => ({
    title: t('toolbar-spec.title'),
    onItemClick: () => {
        const currentBlock = editor.getTextCursorPosition().block;
        editor.insertBlocks(
            [
                {
                    type: ToolbarSpecType,
                    props: { toolbarNames: '', alignment: 'left' },
                },
            ],
            currentBlock,
            'after',
        );
    },
    aliases: ['toolbar', 'tb'],
    group: editor.dictionary.slash_menu.table.group,
    icon: <RiToolsFill size={18} />,
    subtext: t('toolbar-spec.subtext'),
});
