import { describe, it, expect } from 'vitest';

import { isSafeForgotPasswordExternalLink, resolveForgotPasswordNavigation } from './forgotPasswordLink';

describe('isSafeForgotPasswordExternalLink', () => {
	it('accepts http and https links', () => {
		expect(isSafeForgotPasswordExternalLink('https://example.com/reset')).toBe(true);
		expect(isSafeForgotPasswordExternalLink('http://example.com/reset')).toBe(true);
	});

	it('rejects empty, malformed, and unsafe links', () => {
		expect(isSafeForgotPasswordExternalLink('')).toBe(false);
		expect(isSafeForgotPasswordExternalLink()).toBe(false);
		expect(isSafeForgotPasswordExternalLink('not a url')).toBe(false);
		expect(isSafeForgotPasswordExternalLink('ftp://example.com/reset')).toBe(false);
		expect(isSafeForgotPasswordExternalLink('javascript:alert(1)')).toBe(false);
		expect(isSafeForgotPasswordExternalLink('data:text/html,<script>alert(1)</script>')).toBe(false);
	});
});

describe('resolveForgotPasswordNavigation', () => {
	it('prefers external links when they are safe', () => {
		expect(resolveForgotPasswordNavigation('https://example.com/reset', 'custom-reset')).toEqual({
			type: 'external-link',
			value: 'https://example.com/reset',
		});
	});

	it('falls back to provided or default action for unsafe links', () => {
		expect(resolveForgotPasswordNavigation('javascript:alert(1)', 'custom-reset')).toEqual({
			type: 'action',
			value: 'custom-reset',
		});
		expect(resolveForgotPasswordNavigation(undefined, undefined)).toEqual({
			type: 'action',
			value: 'reset-password-ask',
		});
	});
});
