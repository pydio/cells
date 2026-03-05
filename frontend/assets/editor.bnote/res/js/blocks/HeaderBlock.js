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

import { useContext, useCallback } from 'react';
import Pydio from 'pydio';
import { SaveContext } from '../MainPanel';
import { MdSave, MdAddBox } from 'react-icons/md';
import { Tooltip } from '@mantine/core';
import { PydioContext } from '../hooks/context';
import { useNodeTitle } from '../hooks/useNodeTitle';
import { InlineEditableText } from './InlineEditableText';
import { ChildrenListSpecType } from '../specs/NodeRef';
import { useHover } from '../hooks/useHover';

const { moment } = Pydio.requireLib('boot');
const { ButtonMenu } = Pydio.requireLib('components');
const LangUtils = require('pydio/util/lang');
import { t } from '../messages';

export const HeaderBlock = ({ editor }) => {
    const { dataModel } = useContext(PydioContext);
    const { dirty } = useContext(SaveContext);
    const node = dataModel.getContextNode();
    const date = moment(
        new Date(parseInt(node.getMetadata().get('ajxp_modiftime')) * 1000),
    ).fromNow();
    const { title, description, renameCallback, abstractCallback } =
        useNodeTitle({ node });
    const activeRepo = Pydio.getInstance().user.getActiveRepositoryObject();

    const pydio = Pydio.getInstance();
    const newButtonProps = {
        buttonStyle: { height: 30, lineHeight: '26px', marginLeft: 6 },
        buttonLabelStyle: { fontSize: 20, paddingLeft: 6, paddingRight: 6 },
    };

    let segments = [];
    if (node.getPath().replace('/', '') !== '') {
        segments.push(
            <span
                className={'segment first'}
                style={{ cursor: 'pointer' }}
                onClick={() => pydio.goTo('/')}
            >
                {activeRepo.getLabel()}
            </span>,
        );
    }
    let rebuilt = '';
    // Remove last part
    const parts = LangUtils.trimLeft(node.getPath(), '/').split('/');
    parts.pop();
    parts.forEach((seg, i) => {
        if (!seg) {
            return;
        }
        const last = i === parts.length - 1;
        rebuilt += '/' + seg;
        const rebuiltCopy = rebuilt;
        segments.push(
            <span key={'bread_sep_' + i} className="separator">
                {' '}
                /{' '}
            </span>,
        );
        segments.push(
            <span
                key={'bread_' + i}
                style={{ cursor: 'pointer' }}
                className={'segment' + (last ? ' last' : '')}
                onClick={(e) => {
                    e.stopPropagation();
                    console.log(rebuiltCopy);
                    pydio.goTo(rebuiltCopy);
                }}
            >
                {seg}
            </span>,
        );
    });

    const subColor = 'var(--md-sys-color-outline)';
    const { hoverProps, hover } = useHover();

    const childrenSize = node.getChildren().size;
    let contentsLabel = false,
        showAddToc = false;
    const addToc = useCallback(() => {
        const last = editor.document[editor.document.length - 1];
        editor.insertBlocks(
            [
                {
                    type: ChildrenListSpecType,
                },
            ],
            last,
            'after',
        );
    }, [editor]);
    if (childrenSize) {
        showAddToc =
            editor.document
                .filter((block) => block.type === ChildrenListSpecType)
                .filter((block) => !block.props.nodeUuid && !block.props.path)
                .length === 0;
        let pages = 0,
            folders = 0,
            files = 0;
        node.getChildren().forEach((child) => {
            if (child.isLeaf()) {
                files++;
            } else if (child.getMetadata().get('usermeta-is-page')) {
                pages++;
            } else {
                folders++;
            }
        });
        let labels = [];
        if (pages) {
            labels.push(pages + ' sub-pages');
        }
        if (files) {
            labels.push(files + ' files');
        }
        if (folders) {
            labels.push(folders + ' folders');
        }
        contentsLabel = labels.join(', ');
        if (showAddToc && hover) {
            contentsLabel = (
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {contentsLabel}
                    <Tooltip
                        label={t('header.insert-toc')}
                        position={'bottom'}
                        style={{
                            backgroundColor: subColor,
                            color: 'var(--md-sys-color-surface)',
                            padding: '5px 10px',
                            borderRadius: 8,
                        }}
                    >
                        <span
                            onClick={addToc}
                            style={{
                                display: 'inline-block',
                                height: 19,
                                marginLeft: 5,
                                cursor: 'pointer',
                            }}
                        >
                            <MdAddBox />
                        </span>
                    </Tooltip>
                </span>
            );
        }
    }

    return (
        <div
            style={{ paddingBottom: 20 }}
            className={'disable-outline'}
            {...hoverProps}
        >
            {segments && <div style={{ fontSize: '0.8em' }}>{segments}</div>}
            <h1
                style={{
                    fontSize: '2em',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'baseline',
                }}
            >
                {/*Rich text field for user to type in*/}
                <div
                    className={'inline-content'}
                    style={{ flexGrow: 'initial', width: 'auto' }}
                >
                    {renameCallback ? (
                        <InlineEditableText
                            value={title}
                            onCommit={(v) => renameCallback(node, v)}
                        />
                    ) : (
                        title
                    )}
                </div>
                <ButtonMenu
                    pydio={pydio}
                    {...newButtonProps}
                    id="create-button-menu-inline"
                    toolbars={['upload', 'create']}
                    buttonTitle={'+'}
                    controller={pydio.Controller}
                />
                {dirty && (
                    <span
                        style={{
                            fontSize: 16,
                            fontWeight: 'normal',
                            opacity: 0.3,
                        }}
                    >
                        <MdSave />
                    </span>
                )}
            </h1>
            <div style={{ color: subColor }}>
                {!abstractCallback && description}
                {abstractCallback && (
                    <InlineEditableText
                        value={description || t('header.add-description')}
                        onCommit={(v) => abstractCallback(node, v)}
                    />
                )}
                &nbsp;-&nbsp;{t('header.created').replace('%s', date)}{' '}
                {contentsLabel && <>&nbsp;-&nbsp;{contentsLabel}</>}
            </div>
        </div>
    );
};
