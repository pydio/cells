/*
 * Setup module for InfoPanel stories.
 * MUST be imported before InfoPanel — patches module-level mocks that
 * InfoPanel.js evaluates at import time (Pydio.requireLib, MetaClient).
 */
import React from 'react';
import Pydio from 'pydio';
import MetaClient from './MetaClient';

// --- Mock InfoPanelCard (normally from gui.ajax via Pydio.requireLib) ---
const MockInfoPanelCard = ({
    title,
    icon,
    iconColor,
    actions,
    children,
    style,
}: any) =>
    React.createElement(
        'div',
        {
            style: {
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                overflow: 'hidden',
                ...style,
            },
        },
        React.createElement(
            'div',
            {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 16px',
                    borderBottom: '1px solid #f0f0f0',
                },
            },
            icon &&
                React.createElement('span', {
                    className: icon,
                    style: { color: iconColor, fontSize: 20 },
                }),
            title &&
                React.createElement('strong', null, title),
        ),
        React.createElement('div', { style: { padding: 16 } }, children),
        actions &&
            React.createElement(
                'div',
                {
                    style: {
                        display: 'flex',
                        gap: 8,
                        padding: '8px 16px 12px',
                        justifyContent: 'flex-end',
                    },
                },
                actions,
            ),
    );

// Patch requireLib BEFORE InfoPanel.js module-level code runs
(Pydio as any).requireLib = (lib: string) => {
    if (lib === 'workspaces') {
        return { InfoPanelCard: MockInfoPanelCard };
    }
    if (lib === 'components') {
        return {
            EmptyStateView: ({ primaryTextId, iconClassName, style }: any) =>
                React.createElement(
                    'div',
                    { style: { padding: '20px', textAlign: 'center', ...style } },
                    React.createElement('span', {
                        className: iconClassName,
                        style: { fontSize: 40, display: 'block' },
                    }),
                    React.createElement(
                        'div',
                    null,
                        primaryTextId || 'No metadata',
                    ),
                ),
        };
    }
    return {};
};

// --- Mock namespace schema + configs ---
const jsonSchema = {
    type: 'object',
    properties: {
        'usermeta-title': { type: 'string', title: 'Title' },
        'usermeta-description': { type: 'string', title: 'Description' },
        'usermeta-tags': { type: 'string', title: 'Tags' },
        'usermeta-rating': { type: 'integer', title: 'Rating' },
        'usermeta-status': {
            type: 'string',
            title: 'Status',
            enum: ['draft', 'review', 'done'],
        },
    },
};

const configs = new Map([
    [
        'usermeta-title',
        {
            ns: 'usermeta-title',
            label: 'Title',
            type: 'string',
            readonly: false,
            required: false,
            visible: true,
        },
    ],
    [
        'usermeta-description',
        {
            ns: 'usermeta-description',
            label: 'Description',
            type: 'string',
            readonly: false,
            required: false,
            visible: true,
        },
    ],
    [
        'usermeta-tags',
        {
            ns: 'usermeta-tags',
            label: 'Tags',
            type: 'tags',
            readonly: false,
            required: false,
            visible: true,
        },
    ],
    [
        'usermeta-rating',
        {
            ns: 'usermeta-rating',
            label: 'Rating',
            type: 'stars_rate',
            readonly: false,
            required: false,
            visible: true,
        },
    ],
    [
        'usermeta-status',
        {
            ns: 'usermeta-status',
            label: 'Status',
            type: 'choice',
            readonly: false,
            required: false,
            visible: true,
            data: {
                items: [
                    { key: 'draft', value: 'Draft' },
                    { key: 'review', value: 'In Review' },
                    { key: 'done', value: 'Done' },
                ],
            },
        },
    ],
]);

// Patch MetaClient
(MetaClient as any).getInstance = () => ({
    getNamespaceSchema: async () => ({ JsonSchema: jsonSchema }),
    loadConfigs: async () => configs,
    saveMeta: async () => {},
    listTags: async () => ['report', 'invoice', 'contract', 'image'],
    clearConfigs: () => {},
});
