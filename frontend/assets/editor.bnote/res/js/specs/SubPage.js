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

import { RiFileEditLine } from 'react-icons/ri';
import { Callbacks } from '../Callbacks';
import { NodeRefSpecType } from './NodeRef';
import uuid4 from 'uuid4';
import { t } from '../messages';

// Custom Slash Menu item to insert a block after the current one.
export const insertSubPageItem = (editor) => ({
    title: t('node-spec.insert-page'),
    onItemClick: () => {
        Callbacks.mkPage((nodes) => {
            if (!nodes) {
                return;
            }
            editor.insertInlineContent([
                {
                    type: NodeRefSpecType,
                    props: { nodeUuid: nodes[0].Uuid, inlineId: uuid4() },
                },
            ]);
        });
    },
    aliases: ['page', 'pa'],
    group: editor.dictionary.slash_menu.table.group,
    icon: <RiFileEditLine size={18} />,
    subtext: t('node-spec.insert-page.subtext'),
});
