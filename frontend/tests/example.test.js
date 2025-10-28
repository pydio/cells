import { describe, it, expect } from 'vitest';

function formatGreeting(name) {
	const target = name && name.trim() ? name : 'there';
	return `Hello, ${target}!`;
}

describe('formatGreeting', () => {
	it('wraps the provided name in a friendly message', () => {
		expect(formatGreeting('Cells')).toBe('Hello, Cells!');
	});

	it('falls back to a generic greeting when name is empty', () => {
		expect(formatGreeting('')).toBe('Hello, there!');
	});
});
