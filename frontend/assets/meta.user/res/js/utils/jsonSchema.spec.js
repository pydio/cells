import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
    parseErrors,
    parseValueForValidation,
} from './jsonSchema';

describe('parseValueForValidation', () => {
    it('converts epoch seconds to ISO string for date-time formats', () => {
        const schema = { format: 'date-time' };
        const epochSeconds = 1_700_000_000;

        const result = parseValueForValidation(schema, epochSeconds);

        expect(result).toBe(new Date(epochSeconds * 1000).toISOString());
    });

    it('returns original value when format is not date-time', () => {
        const schema = { format: 'string' };
        const value = 'raw-value';

        expect(parseValueForValidation(schema, value)).toBe(value);
    });
});

describe('parseErrors', () => {
    beforeEach(() => {
        globalThis.pydio = {
            MessageHash: {
                'meta.user.validation.required': 'This field is required.',
                'meta.user.validation.type': 'Invalid type, expected {type}.',
            },
        };
    });

    afterEach(() => {
        delete globalThis.pydio;
    });

    it('maps ajv errors to namespace keyed object', () => {
        const errors = [
            { keyword: 'required', params: { missingProperty: 'preferences' }, message: 'is required' },
            { keyword: 'type', instancePath: '/profile', params: { type: 'string' }, message: 'must be a string' },
            { keyword: 'type', instancePath: '/profile/name', params: { type: 'string' }, message: 'must be a string' },
        ];

        const result = parseErrors(errors);

        expect(result).toEqual({
            preferences: 'This field is required.',
            profile: 'Invalid type, expected string.',
            'profile/name': 'Invalid type, expected string.',
        });
    });

    it('falls back to original ajv message for unsupported keywords', () => {
        const errors = [
            { keyword: 'multipleOf', instancePath: '/profile', params: { multipleOf: 2 }, message: 'must be multiple of 2' },
        ];

        const result = parseErrors(errors);

        expect(result).toEqual({
            profile: 'must be multiple of 2',
        });
    });
});
