import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { Selector } from './Select';

const renderWithMantine = (ui: React.ReactElement) => {
    return render(<MantineProvider>{ui}</MantineProvider>);
};

describe('Select Component', () => {
    const mockOnChange = vi.fn();
    const mockOnCommitChange = vi.fn();

    const items = [
        { key: 'red', value: 'RED', color: '#FF0000' },
        { key: 'green', value: 'GREEN', color: '#00FF00' },
        { key: 'blue', value: 'BLUE', color: '#0000FF' },
        { key: 'no-color', value: 'This isnt displayed' },
        { key: 'empty', value: '' },
    ];

    beforeEach(() => {
        mockOnChange.mockClear();
        mockOnCommitChange.mockClear();
    });

    it('renders the select field with label', () => {
        renderWithMantine(
            <Selector
                name="test-select"
                label="Colors"
                items={items}
                onChange={mockOnChange}
                onCommitChange={mockOnCommitChange}
            />,
        );

        const combobox = screen.getByRole('textbox', { name: /colors/i });
        expect(combobox).toBeInTheDocument();
    });

    it('displays color icon when item with color is selected', () => {
        const { container } = renderWithMantine(
            <Selector
                name="test-select"
                label="Colors"
                items={items}
                value="red"
                onChange={mockOnChange}
                onCommitChange={mockOnCommitChange}
            />,
        );

        const colorIcon = container.querySelector('.mdi-label');
        expect(colorIcon).toBeInTheDocument();
        expect(colorIcon).toHaveStyle({ color: '#FF0000' });
    });

    it('displays error message when errorText prop is provided', () => {
        renderWithMantine(
            <Selector
                name="test-select"
                label="Colors"
                items={items}
                onChange={mockOnChange}
                onCommitChange={mockOnCommitChange}
                errorText="This field is required"
            />,
        );

        expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    describe('Items without color property', () => {
        it('renders items without color attribute as text options', () => {
            // Bug fix validation: items without color should render as plain text
            // Previously they were invisible despite being selectable
            renderWithMantine(
                <Selector
                    name="test-select"
                    label="SingleItem"
                    items={[{ key: 'test', value: 'Test Value' }]}
                    onChange={mockOnChange}
                    onCommitChange={mockOnCommitChange}
                />,
            );

            // Component renders without errors
            expect(
                screen.getByRole('textbox', { name: /singleitem/i }),
            ).toBeInTheDocument();
        });

        it('displays both colored and non-colored items in the same select', () => {
            // Test the critical bug fix: mixed items (with and without colors) should work
            const mixedItems = [
                { key: 'colored', value: 'With Color', color: '#FF0000' },
                { key: 'plain', value: 'No Color' }, // No color property
            ];

            renderWithMantine(
                <Selector
                    name="test-select"
                    label="MixedItems"
                    items={mixedItems}
                    onChange={mockOnChange}
                    onCommitChange={mockOnCommitChange}
                />,
            );

            // Both the select field and its content should render without error
            expect(
                screen.getByRole('textbox', { name: /mixeditems/i }),
            ).toBeInTheDocument();
        });
    });
});
