import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import testSchema from '../__fixtures__/test-schema.json';

import { useValidation } from './useValidation';

const buildConfigsFromSchema = (schema = testSchema) => new Map(
    Object.entries(schema.properties).map(([ns, propertySchema]) => ([
        ns,
        {
            ns,
            jsonSchema: {
                title: propertySchema.title,
                properties: { ...propertySchema },
            },
        },
    ])),
);

const buildConfigs = () => buildConfigsFromSchema();

const withDateConfig = (configs) => new Map([
    ...configs,
    ['username-datetime', {
        ns: 'username-datetime',
        jsonSchema: {
            title: 'Dates',
            properties: {
                type: 'string',
                format: 'date-time',
            },
        },
    }],
]);

describe('useValidation', () => {
    it('initializes globalErrors on mount for required namespaces', async () => {
        const configs = buildConfigs();

        const { result } = renderHook(() => useValidation({
            configs,
            namespaceJsonSchema: testSchema
        }));

        await waitFor(() => {
            expect(result.current.globalErrors).toMatchObject({
                'usermeta-text': "must have required property 'usermeta-text'",
                'usermeta-paragraph': "must have required property 'usermeta-paragraph'",
                'usermeta-number': "must have required property 'usermeta-number'",
            });
        });
    });

    it('runs global validation and reports required/global errors', () => {
        const configs = buildConfigs();

        const { result } = renderHook(() => useValidation({
            configs,
            namespaceJsonSchema: testSchema
        }));

        act(() => {
            const values = {
                'usermeta-text': 'short',
                'usermeta-number': 1,
            }; // missing paragraph -> required
            result.current.globalValidate(values);
        });

        expect(result.current.valid).toBe(false);
        expect(result.current.globalErrors).toMatchObject({ 'usermeta-paragraph': "must have required property 'usermeta-paragraph'" });
    });

    it('validates locally per namespace and reports first property error', () => {
        const configs = buildConfigs();
        const { result } = renderHook(() => useValidation({
            configs,
            namespaceJsonSchema: testSchema
        }));

        act(() => {
            const values = { 'usermeta-text': 'ab' };
            result.current.validate(values, ['usermeta-text']);
        });

        expect(result.current.valid).toBe(false);
        expect(result.current.errors).toMatchObject({
            'usermeta-text': expect.stringContaining('fewer than 3 characters'),
        });
    });

    it('parses date-time values before validation', () => {
        const configs = withDateConfig(buildConfigs());
        const { result } = renderHook(() => useValidation({
            configs,
            namespaceJsonSchema: testSchema
        }));

        const epochSeconds = 1_700_000_000;

        act(() => {
            const values = {
                'usermeta-datetime': epochSeconds,
            };
            result.current.validate(values, ['usermeta-datetime']);
        });

        expect(result.current.valid).toBe(true);
        expect(result.current.errors.dates).toBeUndefined();
    });

    it('ignores the empty fields when validating globally', () => {
        const configs = withDateConfig(buildConfigs());
        const { result } = renderHook(() => useValidation({
            configs,
            namespaceJsonSchema: testSchema
        }));

        act(() => {
            const values = {
                'usermeta-number': '',
            };
            result.current.validate(values, ['usermeta-number']);
        });

        expect(result.current.valid).toBe(false);
        expect(result.current.errors).toMatchObject({
            'usermeta-number': expect.stringContaining('must be number'),
        })
    });
});
