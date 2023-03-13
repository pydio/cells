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
import Pydio from 'pydio'
import {Popover, Paper} from './ThemedContainer'
import {Divider, Subheader, Menu, MenuItem, FontIcon} from 'material-ui'

function pydioActionsToItems(actions = []){
    let items = [];
    let lastIsSeparator = false;
    const messages = Pydio.getMessages();

    actions.map(function(action){
        if(action.separator) {
            if(lastIsSeparator) {
                return;
            }
            items.push(action);
            lastIsSeparator = true;
            return;
        }
        lastIsSeparator = false;
        let label;
        if(action.label_id && messages[action.label_id]){
            label = messages[action.label_id];
        } else {
            label = action.raw_name?action.raw_name:action.name;
        }
        const iconClass = action.icon_class;
        if(action.subMenu){
            const subItems = action.subMenuBeforeShow ? pydioActionsToItems(action.subMenuBeforeShow()) : action.subMenu;
            items.push({
                text: label,
                iconClassName:iconClass,
                subItems: subItems
            });
        }else{
            items.push({
                text: label,
                iconClassName:iconClass,
                payload: action.callback
            });
        }
    }.bind(this));
    if(lastIsSeparator){
        items = items.slice(0, items.length - 1);
    }
    if(items.length && items[0] && items[0].separator){
        items.shift();
    }
    return items;
}

function itemsToMenu(items, closeMenuCallback, subItemsOnly = false, menuProps = {}){

    menuProps = {
        display:'normal',
        width: 216,
        desktop: true,
        autoWidth: false,
        ...menuProps
    };

    const menuItems = items.map((item, index) => {

        if(item.separator) {
            return <Divider key={"divider" + index}/>;
        }
        if(item.subHeader) {
            return <Subheader style={{marginTop: -10, marginBottom: -6}}>{item.subHeader}</Subheader>
        }

        let subItems, payload;
        if(item.subItems){
            subItems = itemsToMenu(item.subItems, closeMenuCallback, true);
        }else if(item.payload){
            payload = () => {
                item.payload();
                closeMenuCallback();
            };
        }

        let leftIcon, rightIcon;
        let {iconClassName} = item, inset = false;
        if(iconClassName === '__INSET__'){
            iconClassName = '';
            inset = true;
        }

        if(menuProps.display === 'normal'){
            leftIcon = iconClassName ? <FontIcon className={item.iconClassName + ' menu-icons'} style={{fontSize:16, padding:5}} /> : null;
        }else if(menuProps.display === 'right'){
            rightIcon = iconClassName ? <FontIcon className={item.iconClassName + ' menu-icons'} style={{fontSize:16, padding:5}} /> : null;
        }
        rightIcon = subItems && subItems.length ? <FontIcon className='mdi mdi-menu-right menu-icons'/> : rightIcon;

        return (
            <MenuItem
                key={item.text}
                primaryText={item.text}
                insetChildren={inset}
                leftIcon={leftIcon}
                rightIcon={rightIcon}
                onClick={payload}
                menuItems={subItems}
            />

        );

    });

    if(subItemsOnly) {
        return menuItems;
    } else {
        return <Menu {...menuProps}>{menuItems}</Menu>
    }

}

export default {pydioActionsToItems, itemsToMenu}