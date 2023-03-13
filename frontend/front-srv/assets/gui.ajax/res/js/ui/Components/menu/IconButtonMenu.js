const PropTypes = require('prop-types');
/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
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


const React = require('react')
import Utils from './Utils'
import {Popover, IconButton} from './ThemedContainer'

class IconButtonMenu extends React.Component{

    constructor(props, context){
        super(props, context);
        this.state = {showMenu: false};
    }

    showMenu(event){
        this.setState({
            showMenu: true,
            anchor: event.currentTarget
        })
    }

    closeMenu(event, index, menuItem){
        this.setState({showMenu: false});
    }

    render(){
        const {menuItems, className, buttonTitle, buttonClassName, containerStyle, style, buttonStyle, popoverDirection, popoverTargetPosition, menuProps} = this.props;
        if(!menuItems.length) {
            return null;
        }
        return (
            <span className={"toolbars-button-menu " + (className ? className  : '')} style={containerStyle}>
                <IconButton
                    ref="menuButton"
                    tooltip={buttonTitle}
                    iconClassName={buttonClassName}
                    onClick={this.showMenu.bind(this)}
                    iconStyle={buttonStyle}
                    style={style}
                />
                <Popover
                    open={this.state.showMenu}
                    anchorEl={this.state.anchor}
                    anchorOrigin={{horizontal: popoverDirection || 'right', vertical: popoverTargetPosition || 'bottom'}}
                    targetOrigin={{horizontal: popoverDirection || 'right', vertical: 'top'}}
                    onRequestClose={() => {this.setState({showMenu: false})}}
                    useLayerForClickAway={false}
                >
                    {Utils.itemsToMenu(menuItems, this.closeMenu.bind(this), false, menuProps || undefined)}
                </Popover>
            </span>
        );
    }
}

IconButtonMenu.propTypes =  {
    buttonTitle: PropTypes.string.isRequired,
    buttonClassName: PropTypes.string.isRequired,
    className: PropTypes.string,
    popoverDirection: PropTypes.oneOf(['right', 'left']),
    popoverPosition: PropTypes.oneOf(['top', 'bottom']),
    menuProps:PropTypes.object,
    menuItems: PropTypes.array.isRequired
}

import MenuItemsConsumer from './MenuItemsConsumer'

export default MenuItemsConsumer(IconButtonMenu)