import Utils from './Utils';
import MenuItemsConsumer from './MenuItemsConsumer';

/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio Cells.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */
import PropTypes from 'prop-types';

import React from 'react';
import ReactDOM from 'react-dom';
import { RaisedButton, FlatButton } from 'material-ui';
import Pydio from 'pydio';
const {
    ThemedContainers: { Popover },
} = Pydio.requireLib('hoc');

class ButtonMenu extends React.Component {
    static propTypes = {
        buttonTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
            .isRequired,
        menuItems: PropTypes.array.isRequired,
        className: PropTypes.string,
        raised: PropTypes.bool,
        direction: PropTypes.oneOf(['left', 'right']),
    };

    state = { showMenu: false };

    componentDidMount() {
        if (this.props.openOnEvent) {
            this.props.pydio.observe(this.props.openOnEvent, () => {
                this.showMenu();
            });
        }
    }

    showMenu = (event) => {
        let anchor;
        if (event) {
            anchor = event.currentTarget;
        } else {
            anchor = this._buttonDOM;
        }
        this.setState({
            showMenu: true,
            anchor: anchor,
        });
    };

    menuClicked = (event, index, object) => {
        this.setState({ showMenu: false });
    };

    render() {
        const { showMenu, anchor } = this.state;
        const {
            id,
            className,
            direction,
            menuItems,
            buttonTitle,
            buttonHoverColor,
            primary,
            secondary,
            disabled,
            raised,
            buttonStyle,
            buttonLabelStyle,
            buttonBackgroundColor,
            useLayerForClickAway = false,
        } = this.props;
        let label = (
            <span style={{ whiteSpace: 'nowrap' }}>
                {buttonTitle} <span className="mdi mdi-menu-down" />
            </span>
        );
        let button;
        let activeColor = buttonHoverColor || 'rgba(255,255,255,0.2)';
        const props = {
            primary: primary,
            secondary: secondary,
            disabled: disabled,
            label: label,
            onClick: this.showMenu,
            labelStyle: { ...buttonLabelStyle },
            style: buttonStyle,
            backgroundColor: showMenu ? activeColor : buttonBackgroundColor,
            hoverColor: buttonHoverColor,
        };
        if (menuItems.length) {
            if (raised) {
                button = (
                    <RaisedButton
                        {...props}
                        ref={(b) => {
                            this._buttonDOM = ReactDOM.findDOMNode(b);
                        }}
                    />
                );
            } else {
                button = (
                    <FlatButton
                        {...props}
                        ref={(b) => {
                            this._buttonDOM = ReactDOM.findDOMNode(b);
                        }}
                    />
                );
            }
        }
        return (
            <span id={id} className={className}>
                {button}
                <Popover
                    className="menuPopover"
                    open={showMenu}
                    anchorEl={anchor}
                    anchorOrigin={{
                        horizontal: direction || 'left',
                        vertical: 'bottom',
                    }}
                    targetOrigin={{
                        horizontal: direction || 'left',
                        vertical: 'top',
                    }}
                    onRequestClose={() => {
                        this.setState({ showMenu: false });
                    }}
                    style={{ marginTop: 1 }}
                    useLayerForClickAway={useLayerForClickAway}
                >
                    {Utils.itemsToMenu(menuItems, this.menuClicked)}
                </Popover>
            </span>
        );
    }
}

export default MenuItemsConsumer(ButtonMenu);
