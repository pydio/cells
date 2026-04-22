import { describe, it, expect } from 'vitest';

import { isSafeForgotPasswordExternalLink } from './forgotPasswordLink';

describe('isSafeForgotPasswordExternalLink', () => {
	it('accepts http and https links', () => {
		expect(isSafeForgotPasswordExternalLink('https://example.com/reset')).toBe(true);
		expect(isSafeForgotPasswordExternalLink('http://example.com/reset')).toBe(true);
	});

	it('rejects empty, malformed, and unsafe links', () => {
		expect(isSafeForgotPasswordExternalLink('')).toBe(false);
		expect(isSafeForgotPasswordExternalLink()).toBe(false);
		expect(isSafeForgotPasswordExternalLink('not a url')).toBe(false);
		expect(isSafeForgotPasswordExternalLink('javascript:alert(1)')).toBe(false);
		expect(isSafeForgotPasswordExternalLink('data:text/html,<script>alert(1)</script>')).toBe(false);
	});
});
