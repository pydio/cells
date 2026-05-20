/**
 * @type {import('vitest')}
 * @type {import('@testing-library/react')}
 */
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    render,
    screen,
    cleanup,
    fireEvent,
    waitFor,
} from '@testing-library/react';
import TagsCloud from './TagsCloud';

function createPydioMock() {
    return {
        requireLib: vi.fn((lib) => {
            if (lib === 'hoc') {
                return {
                    ModernAutoComplete: ({
                        searchText,
                        hintText,
                        onUpdateInput,
                        onNewRequest,
                        onClose,
                    }) =>
                        React.createElement(
                            'div',
                            { 'data-testid': 'autocomplete-container' },
                            [
                                React.createElement('input', {
                                    key: 'tags-input',
                                    'data-testid': 'tags-input',
                                    value: searchText || '',
                                    placeholder: hintText,
                                    onChange: (e) =>
                                        onUpdateInput &&
                                        onUpdateInput(e.target.value),
                                    onKeyPress: (e) => {
                                        if (e.key === 'Enter') {
                                            onNewRequest &&
                                                onNewRequest(e.target.value);
                                        }
                                    },
                                    onBlur: () => onClose && onClose(),
                                }),
                            ],
                        ),
                    ThemedModernStyles: () => ({
                        textFieldV2: { style: {}, errorStyle: {} },
                        textFieldV1Search: { style: {}, inputStyle: {} },
                    }),
                    colorsFromString: () => ({
                        color: '#000',
                        backgroundColor: '#e0e0e0',
                    }),
                };
            }
            return {};
        }),
        getMessages: () => ({
            'meta.user.10': 'Add tags...',
        }),
    };
}

vi.mock('pydio', () => {
    const mock = createPydioMock();
    return { default: mock };
});

vi.mock('pydio/util/lang', () => ({
    default: {
        trim: (str) => str.trim(),
    },
}));

vi.mock('../hoc/asMetaForm', () => ({
    default: (Component) => Component,
}));

vi.mock('../MetaClient', () => ({
    default: {
        getInstance: () => ({
            listTags: vi.fn(() => Promise.resolve(['tag1', 'tag2', 'tag3'])),
        }),
    },
}));

vi.mock('material-ui/styles', () => ({
    muiThemeable: () => (Component) => (props) =>
        React.createElement(Component, {
            ...props,
            muiTheme: {
                palette: {
                    mui3: { 'on-surface-variant': '#000' },
                },
            },
        }),
}));

vi.mock('material-ui', () => ({
    MenuItem: ({ children, style, innerDivStyle }) =>
        React.createElement(
            'div',
            {
                'data-testid': 'menu-item',
                style: { ...style, ...innerDivStyle },
            },
            children,
        ),
    Chip: ({ children, onRequestDelete, backgroundColor, labelStyle, style }) =>
        React.createElement(
            'div',
            {
                'data-testid': 'chip',
                'data-tag': children,
                style: { ...style, backgroundColor, ...labelStyle },
                onClick: onRequestDelete,
            },
            children,
        ),
    AutoComplete: ({
        searchText,
        hintText,
        onUpdateInput,
        onNewRequest,
        onClose,
    }) =>
        React.createElement('input', {
            'data-testid': 'tags-input',
            value: searchText || '',
            placeholder: hintText,
            onChange: (e) => onUpdateInput && onUpdateInput(e.target.value),
            onKeyPress: (e) => {
                if (e.key === 'Enter') {
                    onNewRequest && onNewRequest(e.target.value);
                }
            },
            onBlur: () => onClose && onClose(),
        }),
}));

afterEach(() => {
    cleanup();
});

describe('TagsCloud - View Mode', () => {
    const createMockNode = (tagsValue) => ({
        getMetadata: () => ({
            get: (key) => {
                if (key === 'usermeta-tags') return tagsValue;
                return null;
            },
        }),
    });

    const defaultProps = {
        node: createMockNode('tag1,tag2,tag3'),
        column: { name: 'usermeta-tags' },
        editMode: false,
        updateValue: vi.fn(),
    };

    it('renders tags as chips in view mode', () => {
        render(React.createElement(TagsCloud, defaultProps));
        const chips = screen.getAllByTestId('chip');

        expect(chips).toHaveLength(3);
        expect(chips[0]).toHaveTextContent('tag1');
        expect(chips[1]).toHaveTextContent('tag2');
        expect(chips[2]).toHaveTextContent('tag3');
    });

    it('parses comma-separated tag values', () => {
        render(React.createElement(TagsCloud, defaultProps));
        const chips = screen.getAllByTestId('chip');

        expect(chips).toHaveLength(3);
    });

    it('parses JSON array tag values', () => {
        const props = {
            ...defaultProps,
            node: createMockNode('["tag1","tag2","tag3"]'),
        };
        render(React.createElement(TagsCloud, props));
        const chips = screen.getAllByTestId('chip');

        expect(chips).toHaveLength(3);
    });

    it('handles empty tag values', () => {
        const props = {
            ...defaultProps,
            node: createMockNode(''),
        };
        render(React.createElement(TagsCloud, props));
        const chips = screen.queryAllByTestId('chip');

        expect(chips).toHaveLength(0);
    });

    it('handles null tag values', () => {
        const props = {
            ...defaultProps,
            node: createMockNode(null),
        };
        render(React.createElement(TagsCloud, props));
        const chips = screen.queryAllByTestId('chip');

        expect(chips).toHaveLength(0);
    });

    it('filters out empty tags from comma-separated values', () => {
        const props = {
            ...defaultProps,
            node: createMockNode('tag1,,tag2, ,tag3'),
        };
        render(React.createElement(TagsCloud, props));
        const chips = screen.getAllByTestId('chip');

        expect(chips).toHaveLength(3);
    });
});

describe('TagsCloud - Edit Mode', () => {
    const createMockNode = (tagsValue) => ({
        getMetadata: () => ({
            get: (key) => {
                if (key === 'usermeta-tags') return tagsValue;
                return null;
            },
        }),
    });

    const defaultProps = {
        node: createMockNode('tag1,tag2'),
        column: { name: 'usermeta-tags' },
        editMode: true,
        updateValue: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders autocomplete input in edit mode', () => {
        render(React.createElement(TagsCloud, defaultProps));
        const input = screen.getByTestId('tags-input');

        expect(input).toBeInTheDocument();
    });

    it('renders existing tags with delete functionality', () => {
        render(React.createElement(TagsCloud, defaultProps));
        const chips = screen.getAllByTestId('chip');

        expect(chips).toHaveLength(2);
        expect(chips[0]).toHaveTextContent('tag1');
        expect(chips[1]).toHaveTextContent('tag2');
    });

    it('adds a new tag when input is submitted', () => {
        const updateValue = vi.fn();
        render(
            React.createElement(TagsCloud, { ...defaultProps, updateValue }),
        );
        const input = screen.getByTestId('tags-input');

        fireEvent.change(input, { target: { value: 'newtag' } });
        fireEvent.keyPress(input, {
            key: 'Enter',
            code: 'Enter',
            charCode: 13,
        });

        expect(updateValue).toHaveBeenCalledWith('tag1,tag2,newtag', true);
    });

    it('does not add duplicate tags', () => {
        const updateValue = vi.fn();
        render(
            React.createElement(TagsCloud, { ...defaultProps, updateValue }),
        );
        const input = screen.getByTestId('tags-input');

        fireEvent.change(input, { target: { value: 'tag1' } });
        fireEvent.keyPress(input, {
            key: 'Enter',
            code: 'Enter',
            charCode: 13,
        });

        expect(updateValue).not.toHaveBeenCalled();
    });

    it('does not add empty tags', () => {
        const updateValue = vi.fn();
        render(
            React.createElement(TagsCloud, { ...defaultProps, updateValue }),
        );
        const input = screen.getByTestId('tags-input');

        fireEvent.change(input, { target: { value: '' } });
        fireEvent.keyPress(input, {
            key: 'Enter',
            code: 'Enter',
            charCode: 13,
        });

        expect(updateValue).not.toHaveBeenCalled();
    });

    it('deletes a tag when chip is clicked', () => {
        const updateValue = vi.fn();
        render(
            React.createElement(TagsCloud, { ...defaultProps, updateValue }),
        );
        const chips = screen.getAllByTestId('chip');

        fireEvent.click(chips[0]);

        expect(updateValue).toHaveBeenCalledWith('tag2', true);
    });

    it('handles deletion of the last tag', () => {
        const updateValue = vi.fn();
        const props = {
            ...defaultProps,
            node: createMockNode('tag1'),
            updateValue,
        };
        render(React.createElement(TagsCloud, props));
        const chip = screen.getByTestId('chip');

        fireEvent.click(chip);

        expect(updateValue).toHaveBeenCalledWith('', true);
    });

    it('adds tag on autocomplete close with pending text', async () => {
        const updateValue = vi.fn();
        render(
            React.createElement(TagsCloud, { ...defaultProps, updateValue }),
        );
        const input = screen.getByTestId('tags-input');

        fireEvent.change(input, { target: { value: 'newtag' } });
        fireEvent.blur(input);

        await waitFor(() => {
            expect(updateValue).toHaveBeenCalledWith('tag1,tag2,newtag', true);
        });
    });
});

describe('TagsCloud - Value Prop Mode', () => {
    const defaultProps = {
        value: 'tag1,tag2,tag3',
        column: { name: 'usermeta-tags' },
        editMode: false,
        updateValue: vi.fn(),
    };

    it('renders tags from value prop when node is not provided', () => {
        render(React.createElement(TagsCloud, defaultProps));
        const chips = screen.getAllByTestId('chip');

        expect(chips).toHaveLength(3);
        expect(chips[0]).toHaveTextContent('tag1');
    });

    it('handles JSON array in value prop', () => {
        const props = {
            ...defaultProps,
            value: '["tag1","tag2"]',
        };
        render(React.createElement(TagsCloud, props));
        const chips = screen.getAllByTestId('chip');

        expect(chips).toHaveLength(2);
    });

    it('updates when value prop changes', () => {
        const { rerender } = render(
            React.createElement(TagsCloud, defaultProps),
        );
        let chips = screen.getAllByTestId('chip');
        expect(chips).toHaveLength(3);

        rerender(
            React.createElement(TagsCloud, {
                ...defaultProps,
                value: 'newTag1,newTag2',
            }),
        );
        chips = screen.getAllByTestId('chip');
        expect(chips).toHaveLength(2);
        expect(chips[0]).toHaveTextContent('newTag1');
    });
});
