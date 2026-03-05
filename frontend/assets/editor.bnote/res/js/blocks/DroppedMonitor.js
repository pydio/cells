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

import React, { useEffect, useState, useCallback, useRef } from 'react';
import ResourcesManager from 'pydio/http/resources-manager';
import Pydio from 'pydio';
import { NodeBlockSpecType } from '../specs/NodeRef';
import { Progress, Paper, MantineProvider } from '@mantine/core';
import { muiThemeable } from 'material-ui/styles';
import { t } from '../messages';

export const DroppedMonitor = muiThemeable()(({
    editor,
    block,
    blockId,
    muiTheme,
}) => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const [session, setSession] = useState(null);
    const [item, setItem] = useState(null);
    console.log('BLOCK ID', blockId);

    // Keep the latest blockId available to async callbacks
    const blockIdRef = useRef(blockId);
    useEffect(() => {
        blockIdRef.current = blockId;
    }, [blockId]);

    const replaceSelf = useCallback(
        (nodeUuid) => {
            const id = blockIdRef.current; // always current
            if (editor.document.find((b) => b.id === id)) {
                editor.replaceBlocks(
                    [id],
                    [{ type: NodeBlockSpecType, props: { nodeUuid } }],
                );
            }
        },
        [editor],
    );

    useEffect(() => {
        const ctxNode = Pydio.getInstance().getContextNode();
        if (item && progress === 100) {
            const child = ctxNode.findChildByPath(
                '/' + item.getFullPath().split('/').slice(1).join('/'),
            );
            if (child && child.getMetadata().get('uuid')) {
                replaceSelf(child.getMetadata().get('uuid'));
                return;
            }
        }
        ctxNode.observeOnce('child_added', (data) => {
            const child = ctxNode.findChildByPath(data);
            const obs = (n) => {
                if (n.getMetadata().get('uuid')) {
                    const newID = n.getMetadata().get('uuid');
                    replaceSelf(newID);
                    child.stopObserving('node_replaced', obs);
                }
            };
            child.observe('node_replaced', obs);
        });
    }, [item, progress]);

    useEffect(() => {
        if (!session) {
            return;
        }
        setStatus(session.getStatus());
        session.observe('progress', setProgress);
        session.observe('status', setStatus);
        if (!item) {
            session.walk((item) => {
                setItem(item);
            });
        }
        return () => {
            session.stopObserving('progress', setProgress);
            session.stopObserving('status', setStatus);
        };
    }, [session, item]);

    useEffect(() => {
        const { sessionUuid } = block.props;
        ResourcesManager.loadClass('UploaderModel').then(({ Store }) => {
            const session = Store.getInstance().sessionByUuid(sessionUuid);
            if (!session) {
                editor.removeBlocks([blockId]);
            }
            setSession(session);
        });
    }, []);

    let readStatus = status;
    if (status === 'analyze' && session) {
        readStatus = session.getAnalyzeStatus();
    } else if (progress === 100) {
        readStatus = t('dropped.loading').replace(
            '%s',
            item ? item.getLabel() : '',
        );
    }

    const icStyle = {
        width: 30,
        height: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24,
        border: '1px solid var(--md-sys-color-outline-variant)',
        margin: 6,
        fontSize: 16,
        color: 'var(--md-sys-color-outline)',
    };

    return (
        <MantineProvider
            theme={{ colorScheme: muiTheme.darkMode ? 'dark' : 'light' }}
            inherit
        >
            <Paper
                shadow={'xs'}
                radius={'md'}
                withBorder={true}
                style={{ width: 320, cursor: 'pointer', overflow: 'hidden' }}
                className={'disable-outline'}
                onClick={() => {
                    Pydio.getInstance().Controller.fireAction('upload');
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {item && (
                        <div
                            className={
                                'mdi mdi-' + item.getType() + '-upload-outline'
                            }
                            style={icStyle}
                        ></div>
                    )}
                    <div
                        style={{
                            flex: 1,
                            padding: 6,
                            fontSize: 14,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {readStatus}
                    </div>
                </div>
                <Progress value={progress} size={'xs'} />
            </Paper>
        </MantineProvider>
    );
});
