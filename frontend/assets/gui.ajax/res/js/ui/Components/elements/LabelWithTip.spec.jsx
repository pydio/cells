import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import LabelWithTip from './LabelWithTip';

describe('LabelWithTip', () => {
	it('shows the tooltip when hovered and hides it on mouse leave', () => {
		render(
			<LabelWithTip
				className="label-with-tip"
				label="Storage quota"
				tooltip="Currently used space"
			>
				<span>child element</span>
			</LabelWithTip>
		);

		const label = screen.getByText('Storage quota');
		const container = label.closest('.label-with-tip');
		expect(container).not.toBeNull();

		const tooltip = container.querySelector('div[label="Currently used space"]');
		expect(tooltip).not.toBeNull();
		expect(tooltip.style.display).toBe('none');

		fireEvent.mouseEnter(container);
		expect(tooltip.style.display).toBe('block');

		fireEvent.mouseLeave(container);
		expect(tooltip.style.display).toBe('none');
	});

	it('renders the label when no tooltip is provided', () => {
		render(<LabelWithTip label="Plain label" />);
		expect(screen.getByText('Plain label')).toBeInTheDocument();
	});
});
