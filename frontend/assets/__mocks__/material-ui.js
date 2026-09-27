import React from 'react';

export const FontIcon = ({ className, style }) =>
	React.createElement('span', { className, style, 'data-testid': 'font-icon' });

export const FlatButton = ({ label, onClick, disabled, style }) =>
	React.createElement(
		'button',
		{
			onClick,
			disabled,
			style: { padding: '6px 12px', cursor: disabled ? 'default' : 'pointer', ...style },
		},
		label,
	);

// Legacy material-ui component stubs (not rendered in stories, satisfy imports)
const stub = (name) => (props) =>
	React.createElement('span', { 'data-testid': name, ...props });

export const Checkbox = stub('checkbox');
export const MenuItem = stub('menu-item');
export const Chip = stub('chip');
export const AutoComplete = stub('autocomplete');
export const IconButton = stub('icon-button');
export const Toggle = stub('toggle');
export const LinearProgress = stub('linear-progress');

export const muiThemeable = () => (Component) => Component;

export default {
	FontIcon,
	muiThemeable,
};
