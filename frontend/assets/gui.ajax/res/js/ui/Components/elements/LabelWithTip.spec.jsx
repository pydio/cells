import { describe, it, expect } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import LabelWithTip from './LabelWithTip';

describe('LabelWithTip', () => {
	it('shows the tooltip when hovered and hides it on mouse leave', () => {
		// Given
		const props = {
			className: 'label-with-tip',
			label: 'Storage quota',
			tooltip: 'Currently used space',
		};

		// When
		render(
			<LabelWithTip {...props}>
				<span>child element</span>
			</LabelWithTip>
		);

		// Then
		const label = screen.getByText('Storage quota');
		expect(label).toBeInTheDocument();
		const container = label.closest('.label-with-tip');
		expect(container).toBeInTheDocument();

		const tooltip = screen.getByRole('tooltip', { 
			label: 'Currently used space',
			hidden: true,
		});
		expect(tooltip).toBeInTheDocument();
		expect(tooltip).not.toBeVisible();

		// And
		fireEvent.mouseEnter(container);
		expect(tooltip).toBeVisible()

		fireEvent.mouseLeave(container);
		expect(tooltip).not.toBeVisible();

		expect(screen.getByText('child element')).toBeInTheDocument();
	});

	it('renders the label when no tooltip is provided', () => {
		const props = {
			label: 'Plain label',
		};

		render(<LabelWithTip {...props} />);

		expect(screen.getByText('Plain label')).toBeInTheDocument();
	});
});
