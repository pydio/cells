/*
 * Copyright 2026 Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 */

// IMPORTANT: setup MUST be imported before InfoPanel to patch module-level mocks
import './InfoPanel.stories.setup';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import InfoPanel from './InfoPanel';

const meta: Meta<typeof InfoPanel> = {
    title: 'meta.user/InfoPanel',
    component: InfoPanel,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'Full metadata info panel with context provider, schema-driven field rendering, and save flow. Mocks MetaClient (schema/configs/save), Pydio.requireLib (InfoPanelCard), and node metadata.',
            },
        },
    },
};
export default meta;

type Story = StoryObj<typeof InfoPanel>;

// --- Mock node ---
const createNode = (metadata: Record<string, any> = {}) => {
    const map = new Map(Object.entries(metadata));
    return {
        getMetadata: () => map,
        getPath: () => '/files/report.pdf',
        replaceMetadata: (m: Map<string, any>) => {
            m.forEach((v, k) => map.set(k, v));
        },
        observe: () => {},
        stopObserving: () => {},
    };
};

// --- Mock pydio ---
const pydio = {
    MessageHash: {
        'meta.user.1': 'User Metadata',
        'meta.user.15': 'Save',
    },
    UI: { openComponentInModal: () => {} },
};

export const Default: Story = {
    render: () =>
        React.createElement(InfoPanel, {
            pydio,
            node: createNode({
                'usermeta-title': 'Quarterly Report',
                'usermeta-description': 'Q4 financial summary',
                'usermeta-tags': 'finance',
                'usermeta-rating': 4,
                'usermeta-status': 'review',
            }),
        }),
};

export const Empty: Story = {
    render: () =>
        React.createElement(InfoPanel, {
            pydio,
            node: createNode(),
        }),
};

export const PopoverMode: Story = {
    render: () =>
        React.createElement(InfoPanel, {
            pydio,
            node: createNode({
                'usermeta-title': 'Quick Edit',
                'usermeta-rating': 2,
            }),
            popoverPanel: true,
        }),
};

export const ReadOnly: Story = {
    render: () =>
        React.createElement(InfoPanel, {
            pydio,
            node: createNode({
                node_readonly: 'true',
                'usermeta-title': 'Locked Document',
                'usermeta-status': 'done',
            }),
        }),
};
