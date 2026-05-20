import { describe, expect, it } from 'vitest';

import { localizeAjvError } from './ajvErrorLocalization';

const messages = {
    'meta.user.validation.required': 'This field is required.',
    'meta.user.validation.minLength':
        'Must contain at least {limit} characters.',
    'meta.user.validation.enum': 'Must be one of: {allowedValues}.',
    'meta.user.validation.format.email': 'Invalid email format.',
    'meta.user.validation.format.default': 'Invalid format: {format}.',
};

const t = (key) => messages[key];

describe('localizeAjvError', () => {
    it('returns localized required messages', () => {
        const result = localizeAjvError(
            {
                keyword: 'required',
                params: { missingProperty: 'email' },
                message: "must have required property 'email'",
            },
            t,
        );

        expect(result).toBe('This field is required.');
    });

    it('interpolates params for keywords with limits', () => {
        const result = localizeAjvError(
            {
                keyword: 'minLength',
                params: { limit: 3 },
                message: 'must NOT have fewer than 3 characters',
            },
            t,
        );

        expect(result).toBe('Must contain at least 3 characters.');
    });

    it('formats enum values', () => {
        const result = localizeAjvError(
            {
                keyword: 'enum',
                params: { allowedValues: ['A', 'B'] },
                message: 'must be equal to one of the allowed values',
            },
            t,
        );

        expect(result).toBe('Must be one of: A, B.');
    });

    it('supports format-specific keys', () => {
        const result = localizeAjvError(
            {
                keyword: 'format',
                params: { format: 'email' },
                message: 'must match format "email"',
            },
            t,
        );

        expect(result).toBe('Invalid email format.');
    });

    it('falls back to default format key', () => {
        const result = localizeAjvError(
            {
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "uuid"',
            },
            t,
        );

        expect(result).toBe('Invalid format: uuid.');
    });

    it('falls back to ajv message when key is missing', () => {
        const result = localizeAjvError(
            {
                keyword: 'maxItems',
                params: { limit: 2 },
                message: 'must NOT have more than 2 items',
            },
            t,
        );

        expect(result).toBe('must NOT have more than 2 items');
    });

    it('adds field alias from required missingProperty', () => {
        const result = localizeAjvError(
            {
                keyword: 'required',
                params: { missingProperty: 'email' },
                message: 'must have required property',
            },
            () => 'Missing {field}.',
        );

        expect(result).toBe('Missing email.');
    });

    it('uses Invalid value fallback when message is missing', () => {
        const result = localizeAjvError(
            {
                keyword: 'maxItems',
                params: { limit: 2 },
            },
            t,
        );

        expect(result).toBe('Invalid value');
    });
});
