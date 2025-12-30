import { describe, expect, it, vi } from 'vitest';

// Mock external dependencies that are not available in the test env
vi.mock('pydio/http/api', () => ({ default: { getRestClient: vi.fn() } }));
vi.mock('cells-sdk', () => ({
    UserMetaServiceApi: vi.fn(),
    IdmUpdateUserMetaRequest: vi.fn(),
    RestPutUserMetaTagRequest: { constructFromObject: vi.fn() },
    IdmUserMeta: vi.fn(),
    ServiceResourcePolicy: { constructFromObject: vi.fn() },
}));

import MetaClient from './MetaClient';

const buildClient = () => Object.create(MetaClient.prototype);

describe('MetaClient.namespacesAsPanelConfig', () => {
    it('builds base config and sorts by order', () => {
        const namespaces = [
            {
                Namespace: 'second',
                Label: 'Second',
                Indexable: true,
                Order: 2,
                PoliciesContextEditable: false,
                JsonSchema: { required: ['field'] },
            },
            {
                Namespace: 'first',
                Label: 'First',
                Indexable: false,
                Order: 1,
                PoliciesContextEditable: true,
                JsonSchema: {},
            },
        ];

        const configs = buildClient().namespacesAsPanelConfig(namespaces);
        const entries = Array.from(configs.entries());

        expect(entries.map(([ns]) => ns)).toEqual(['first', 'second']);
        expect(entries[0][1]).toMatchObject({
            label: 'First',
            indexable: false,
            order: 1,
            visible: true,
            readonly: false,
            required: undefined,
        });
        expect(entries[1][1]).toMatchObject({
            label: 'Second',
            indexable: true,
            order: 2,
            visible: true,
            readonly: true,
            required: true,
        });
    });

    it('merges JsonDefinition overrides and honors hide flag', () => {
        const namespaces = [
            {
                Namespace: 'with-def',
                Label: 'With Def',
                Indexable: false,
                Order: 0,
                PoliciesContextEditable: true,
                JsonSchema: {},
                JsonDefinition: JSON.stringify({
                    hide: true,
                    type: 'text',
                    placeholder: 'Enter value',
                }),
            },
        ];

        const cfg = buildClient().namespacesAsPanelConfig(namespaces).get('with-def');

        expect(cfg.visible).toBe(false);
        expect(cfg.type).toBe('text');
        expect(cfg.placeholder).toBe('Enter value');
    });

    it('converts legacy choice data strings into items', () => {
        const namespaces = [
            {
                Namespace: 'choices',
                Label: 'Choices',
                Indexable: false,
                Order: 0,
                PoliciesContextEditable: true,
                JsonSchema: {},
                JsonDefinition: JSON.stringify({
                    type: 'choice',
                    data: 'red|Red,blue|Blue',
                }),
            },
        ];

        const cfg = buildClient().namespacesAsPanelConfig(namespaces).get('choices');

        expect(cfg.type).toBe('choice');
        expect(cfg.data).toEqual({
            items: [
                { key: 'red', value: 'Red' },
                { key: 'blue', value: 'Blue' },
            ],
        });
    });
});
