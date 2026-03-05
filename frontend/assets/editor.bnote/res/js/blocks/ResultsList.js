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

import React, { useCallback, useEffect, useState } from 'react';
import Pydio from 'pydio';

import './styles/ChildrenListStyles.less';
import { FilesList } from './FilesList';
import { ResultsListSpecType } from '../specs/NodeRef';
import { MdOpenInBrowser } from 'react-icons/md';
const { withSearch } = Pydio.requireLib('hoc');
import { t } from '../messages';

export const ResultsList = withSearch(
    ({ editor, block, dataModel, searchTools }) => {
        const pydio = Pydio.getInstance();

        const { searchValues, sortInfo = { field: '', desc: false } } =
            block.props;
        const [contextNode, setContextNode] = useState(null);
        const { setValues, setSortField } = searchTools;

        useEffect(() => {
            setContextNode(dataModel.getSearchNode());
            setValues(searchValues);
            setSortField(sortInfo.field, sortInfo.desc);
        }, []);

        useEffect(() => {
            setValues(searchValues);
        }, [searchValues]);

        const editSearchQuery = useCallback(() => {
            const event = new CustomEvent('pydioOpenSelector', {
                detail: {
                    openValues: searchValues,
                    openSort: sortInfo,
                    onSelectSearch: (searchValues, sortField, sortDesc) => {
                        editor.updateBlock(block, {
                            type: ResultsListSpecType,
                            props: {
                                ...block.props,
                                searchValues,
                                sortInfo,
                            },
                        });
                    },
                    onSelectCancel: () => {},
                },
            });
            document.dispatchEvent(event);
        }, [searchValues, sortInfo, block]);

        return (
            <FilesList
                pydio={pydio}
                dataModel={dataModel}
                contextNode={contextNode}
                nodePath={'search'}
                resolvedNode={contextNode}
                resolveError={null}
                block={block}
                isResultsList={true}
                presetNodeActions={{
                    title: t('actions.title'),
                    values: [
                        {
                            value: 'edit',
                            title: t('results.edit-query'),
                            icon: MdOpenInBrowser,
                        },
                    ],
                    onValueSelected: editSearchQuery,
                }}
            />
        );
    },
    'ResultsList',
    'all',
    false,
);
