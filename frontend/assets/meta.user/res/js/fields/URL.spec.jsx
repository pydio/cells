/**
 * @type {import('vitest')}
 * @type {import('@testing-library/react')}
 */
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { URLField, URLForm } from './URL';

function createPydioMock() {
    return {
        requireLib: vi.fn((lib) => {
            if (lib === 'hoc') {
                return {
                    ModernTextField: ({ value, hintText, onChange }) =>
                        React.createElement('input', {
                            'data-testid': 'url-input',
                            value: value || '',
                            placeholder: hintText,
                            onChange: (e) => onChange && onChange(e, e.target.value)
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

        expect(link.getAttribute('href')).toBe('https://example.com');
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
        vi.useFakeTimers();
        const updateValue = vi.fn();
        render(<URLForm {...defaultProps} updateValue={updateValue} />);
        const input = screen.getByTestId('url-input');

        fireEvent.change(input, {target: {value: 'https://newurl.com'}});

        expect(updateValue).not.toHaveBeenCalled();

        vi.advanceTimersByTime(300);
        vi.runAllTimers();

        expect(updateValue).toHaveBeenCalledWith('https://newurl.com');
        vi.useRealTimers();
    });
});
