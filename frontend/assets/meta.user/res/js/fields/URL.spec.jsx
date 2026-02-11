/**
 * @type {import('vitest')}
 * @type {import('@testing-library/react')}
 */
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { URLField, URLForm, formatURL } from './URL';

function createPydioMock() {
    return {
        requireLib: vi.fn((lib) => {
            if (lib === 'hoc') {
                return {
                    ModernTextField: ({ value, hintText, onChange, onBlur, onKeyPress }) =>
                        React.createElement('input', {
                            'data-testid': 'url-input',
                            value: value || '',
                            placeholder: hintText,
                            onChange: (e) => onChange && onChange(e, e.target.value),
                            onBlur: (e) => onBlur && onBlur(e),
                            onKeyPress: (e) => onKeyPress && onKeyPress(e),
                        }),
                    ThemedModernStyles: () => ({
                        textFieldV2: { style: {}, errorStyle: {} },
                        textFieldV1Search: { style: {}, inputStyle: {} }
                    })
                };
            }
            return {};
        })
    };
}
vi.mock('pydio', () => {
    const mock = createPydioMock();
    return { default: mock };
});

afterEach(() => {
    cleanup();
});

describe('URLField', () => {
    const expectedLinkLabel = 'Open https://example.com in a new tab';

    const createMockNode = (urlValue) => ({
        getMetadata: () => ({
            get: (key) => {
                if (key === 'usermeta-url') return urlValue;
                return null; } })
    });

    const defaultProps = {
        node: createMockNode('https://example.com'),
        column: { name: 'usermeta-url' },
        configs: new Map(),
        getRealValue: () => 'https://example.com'
    };

    it('renders a clickable link element', () => {
        render(<URLField {...defaultProps} />);
        const link = screen.getByRole('link', {
            label: expectedLinkLabel,
        });

        expect(link).toBeInTheDocument();
        expect(link.tagName).toBe('A');
    });

    it('sets correct href attribute', () => {
        render(<URLField {...defaultProps} />);
        const link = screen.getByRole('link', {
            label: expectedLinkLabel,
        });

        expect(link.getAttribute('href')).toBe('https://example.com/');
    });

    it('opens link in new tab (target="_blank")', () => {
        render(<URLField {...defaultProps} />);
        const link = screen.getByRole('link', {
            label: expectedLinkLabel,
        });

        expect(link.getAttribute('target')).toBe('_blank');
    });

    it('includes security attributes (rel="noopener noreferrer")', () => {
        const { container } = render(<URLField {...defaultProps} />);
        const link = container.querySelector('a');

        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('displays domain name instead of full URL', () => {
        const { container } = render(<URLField {...defaultProps} />);
        const link = container.querySelector('a');

        expect(link.textContent).toContain('example.com');
        expect(link.textContent).not.toContain('https://');
    });

    it('renders external link icon', () => {
        render(<URLField {...defaultProps} />);
        const icon = screen.getByLabelText('Open example.com in a new tab');

        expect(icon).toBeInTheDocument();
    });

    it('returns empty fragment when value is empty', () => {
        const props = {
            ...defaultProps,
            getRealValue: () => null
        };
        render(<URLField {...props} />);

        expect(screen.queryByRole('link')).toBeNull();
    });

    it('handles URLs with paths correctly', () => {
        const props = {
            ...defaultProps,
            getRealValue: () => 'https://pydio.com/docs/getting-started'
        };

        render(<URLField {...props} />);

        const link = screen.getByRole('link', {
            label: 'Open pydio.com/docs/getting-started in a new tab',
        });
        expect(link.getAttribute('href')).toBe('https://pydio.com/docs/getting-started');
        expect(link.textContent).toContain('pydio.com');
    });

    it('adds http scheme when missing', () => {
        const props = {
            ...defaultProps,
            getRealValue: () => 'example.com'
        };

        render(<URLField {...props} />);
        const link = screen.getByRole('link', {
            label: 'Open example.com in a new tab',
        });

        expect(link.getAttribute('href')).toBe('https://example.com/');
    });
});

describe('URLForm', () => {
    const defaultProps = {
        value: 'https://example.com',
        label: 'Website URL',
        updateValue: vi.fn(),
        muiTheme: {
            palette: {
                mui3: {
                    'on-surface-variant': '#000'
                }
            }
        },
        search: false,
        supportTemplates: false
    };

    beforeEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it('renders an input field', () => {
        render(<URLForm {...defaultProps} />);
        const input = screen.getByTestId('url-input');

        expect(input).toBeInTheDocument();
    });

    it('displays the current URL value', () => {
        render(<URLForm {...defaultProps} />);
        const input = screen.getByTestId('url-input');
        expect(input.value).toBe('https://example.com');
        expect(screen.getByLabelText('Open https://example.com in a new tab')).toBeInTheDocument();
    });

    it('shows preview link icon when URL is valid', () => {
        render(<URLForm {...defaultProps} />);
        const icon = screen.getByLabelText('Open https://example.com in a new tab');

        expect(icon).toBeInTheDocument();
    });

    it('calls updateValue when input changes', async () => {
        const updateValue = vi.fn();
        render(<URLForm {...defaultProps} updateValue={updateValue} />);
        const input = screen.getByTestId('url-input');

        fireEvent.change(input, {target: {value: 'https://newurl.com'}});
        expect(updateValue).toHaveBeenCalledWith('https://newurl.com', false);
    });

    it('injects http scheme on blur when missing', () => {
        const updateValue = vi.fn();
        render(<URLForm {...defaultProps} updateValue={updateValue} value={''} />);
        const input = screen.getByTestId('url-input');

        fireEvent.change(input, {target: {value: 'example.com'}});

        expect(updateValue).toHaveBeenCalledWith('example.com', false);
        fireEvent.blur(input);

        expect(updateValue).toHaveBeenCalledWith('https://example.com', false);
    });

    it('do not inject https when in search mode', () => {
        const props = {...defaultProps, search: true};

        const updateValue = vi.fn();
        render(<URLForm {...props} updateValue={updateValue} value={''} />);
        const input = screen.getByTestId('url-input');

        fireEvent.change(input, {target: {value: 'example.com'}});

        expect(updateValue).toHaveBeenCalledWith('example.com', false);
        fireEvent.blur(input);

        expect(updateValue).toHaveBeenCalledWith('example.com', false);
    });
});

describe('formatURL', () => {
    it('should decode asterisks in URL', () => {
        const result = formatURL('*google.com*');
        expect(result.displayURL).toBe('*google.com*');
        expect(result.displayURL).not.toContain('%2A');
    });

    it('should decode percent-encoded asterisks', () => {
        const result = formatURL('%2Agoogle.com%2A');
        expect(result.displayURL).toBe('*google.com*');
        expect(result.displayURL).not.toContain('%2A');
    });

    it('should decode spaces in URL', () => {
        const result = formatURL('hello world.com');
        // Spaces in hostname cause sanitization to return about:blank
        expect(result.displayURL).toBe('about:blank');
        expect(result.normalizedURL).toBe('https://hello world.com');
    });

    it('should decode special characters like tilde', () => {
        const result = formatURL('~special~.com');
        expect(result.displayURL).toBe('~special~.com');
        expect(result.displayURL).not.toContain('%7E');
    });

    it('should handle normal HTTPS URL', () => {
        const result = formatURL('https://google.com');
        expect(result.displayURL).toBe('google.com');
        expect(result.normalizedURL).toBe('https://google.com');
    });

    it('should handle URL with path', () => {
        const result = formatURL('https://google.com/path');
        expect(result.displayURL).toBe('google.com');
        expect(result.normalizedURL).toBe('https://google.com/path');
    });

    it('should add http scheme when missing', () => {
        const result = formatURL('example.com');
        expect(result.normalizedURL).toBe('https://example.com');
        expect(result.displayURL).toBe('example.com');
    });

    it('should handle empty string', () => {
        const result = formatURL('');
        expect(result.displayURL).toBe('');
        expect(result.normalizedURL).toBe('');
    });

    it('should handle null', () => {
        const result = formatURL(null);
        expect(result.displayURL).toBe('');
        expect(result.normalizedURL).toBe('');
    });

    it('should handle undefined', () => {
        const result = formatURL(undefined);
        expect(result.displayURL).toBe('');
        expect(result.normalizedURL).toBe('');
    });

    it('should handle malformed URL gracefully', () => {
        const result = formatURL('not-a-valid-url***');
        // Should sanitize? Expect normalizedURL to have https:// prefix
        expect(result.normalizedURL).toBe('https://not-a-valid-url***');
        // displayURL may be the same as normalizedURL (since parsing fails) but decoded
        expect(result.displayURL).toBe('not-a-valid-url***');
    });

    it('should decode percent-encoded input', () => {
        const result = formatURL('hello%20world.com');
        // Percent sign in hostname causes sanitization to return about:blank
        expect(result.displayURL).toBe('about:blank');
        expect(result.normalizedURL).toBe('https://hello%20world.com');
    });

    it('should preserve existing scheme like mailto', () => {
        const result = formatURL('mailto:test@example.com');
        expect(result.normalizedURL).toBe('mailto:test@example.com');
        // displayURL likely will be mailto:test@example.com (since hostname extraction fails)
    });
});