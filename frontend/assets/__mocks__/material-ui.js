import React from 'react';

export const FontIcon = ({ className, style }) =>
	React.createElement('span', { className, style, 'data-testid': 'font-icon' });

export const muiThemeable = () => (Component) => Component;

export default {
	FontIcon,
	muiThemeable,
};
