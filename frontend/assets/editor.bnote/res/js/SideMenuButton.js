/*
 * Copyright 2025 Abstrium SAS <team (at) pyd.io>
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

import { useCallback } from 'react';
import {
    useBlockNoteEditor,
    useComponentsContext,
    RemoveBlockItem,
    BlockColorsItem,
    TableRowHeaderItem,
    TableColumnHeaderItem,
    useDictionary,
    useExtensionState,
    useExtension,
} from '@blocknote/react';
import { SideMenuExtension } from '@blocknote/core/extensions';
import { MdMoreVert } from 'react-icons/md';
import { HeaderSpecType } from './specs/Header';
import { t } from './messages';

// Custom Side Menu button to remove the hovered block.
export function SideMenuButton() {
    const editor = useBlockNoteEditor();
    const Components = useComponentsContext();
    const dict = useDictionary();

    // Get block from extension state
    const block = useExtensionState(SideMenuExtension, {
        selector: (state) => state?.block,
    });

    // Get the extension instance to access freezeMenu/unfreezeMenu methods
    const sideMenuExtension = useExtension(SideMenuExtension);

    const isTitle = useCallback((b) => {
        return b.type === HeaderSpecType;
    }, []);

    if (!block) return null;

    const previous = editor.getPrevBlock(block);
    const next = editor.getNextBlock(block);

    return (
        <Components.Generic.Menu.Root
            position={'left'}
            onOpenChange={(open) => {
                if (open && sideMenuExtension) {
                    sideMenuExtension.freezeMenu();
                } else if (!open && sideMenuExtension) {
                    sideMenuExtension.unfreezeMenu();
                }
            }}
        >
            <Components.Generic.Menu.Trigger>
                <Components.SideMenu.Button
                    label={'Options'}
                    className={'bn-button'}
                    icon={<MdMoreVert size={24} />}
                />
            </Components.Generic.Menu.Trigger>
            <Components.Generic.Menu.Dropdown
                className={'bn-menu-dropdown bn-drag-handle-menu'}
            >
                <>
                    {previous && !isTitle(previous) && (
                        <Components.Generic.Menu.Item
                            className={'bn-menu-item'}
                            onClick={() => {
                                editor.removeBlocks([block]);
                                editor.insertBlocks(
                                    [block],
                                    previous,
                                    'before',
                                );
                            }}
                        >
                            {t('side-button.move-up')}
                        </Components.Generic.Menu.Item>
                    )}
                    {next && !isTitle(block) && (
                        <Components.Generic.Menu.Item
                            className={'bn-menu-item'}
                            onClick={() => {
                                editor.removeBlocks([block]);
                                editor.insertBlocks([block], next, 'after');
                            }}
                        >
                            {t('side-button.move-down')}
                        </Components.Generic.Menu.Item>
                    )}
                    {!isTitle(block) && (
                        <RemoveBlockItem>
                            {dict.drag_handle.delete_menuitem}
                        </RemoveBlockItem>
                    )}
                    <BlockColorsItem>
                        {dict.drag_handle.colors_menuitem}
                    </BlockColorsItem>
                    <TableRowHeaderItem>
                        {dict.drag_handle.header_row_menuitem}
                    </TableRowHeaderItem>
                    <TableColumnHeaderItem>
                        {dict.drag_handle.header_column_menuitem}
                    </TableColumnHeaderItem>
                </>
            </Components.Generic.Menu.Dropdown>
        </Components.Generic.Menu.Root>
    );
}
