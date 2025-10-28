import { describe, it, expect } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import LabelWithTip from './LabelWithTip';

describe('LabelWithTip', () => {
	it('shows the tooltip when hovered and hides it on mouse leave', async () => {
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
		expect(label).toBeInTheDocument();
		const container = label.closest('.label-with-tip');
		expect(container).toBeInTheDocument();

		const tooltip = screen.getByRole('tooltip', { hidden: true });
		expect(tooltip).toBeInTheDocument();
		expect(tooltip).not.toBeVisible();

		fireEvent.mouseEnter(container);
		await waitFor(() => expect(tooltip).toBeVisible());

		fireEvent.mouseLeave(container);
		await waitFor(() => expect(tooltip).not.toBeVisible());
	});

	it('renders the label when no tooltip is provided', () => {
		render(<LabelWithTip label="Plain label" />);
		expect(screen.getByText('Plain label')).toBeInTheDocument();
	});
});
