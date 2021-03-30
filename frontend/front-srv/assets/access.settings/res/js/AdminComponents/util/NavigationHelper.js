/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import AdminStyles from "../styles/AdminStyles";

const {MenuItem, Divider, Subheader, FontIcon} = require('material-ui')

function renderItem(palette, node, text = null, noIcon = false, advanced = false){

    const {menu} = AdminStyles(palette);

    let label = text || node.getLabel();
    if(node.getMetadata().get('flag')){
        label = <div style={menu.menuLabel}>{node.getLabel()} <span style={menu.flag}>{node.getMetadata().get('flag')}</span> </div>;
    } else {
        label = <div style={menu.menuLabel}>{label}</div>

    }

    return (
        <MenuItem
            style={menu.menuItem}
            innerDivStyle={menu.menuItemInner}
            value={node}
            primaryText={label}
            leftIcon={!noIcon && <FontIcon className={node.getMetadata().get('icon_class')} style={menu.iconStyle}/>}
        />);

}

class NavigationHelper{

    static buildNavigationItems(pydio, rootNode, palette, showAdvanced = false, noIcon = false){

        let items = [];
        const {menu} = AdminStyles(palette);

        if(rootNode.getMetadata().get('component')){
            items.push(renderItem(palette, rootNode, pydio.MessageHash['ajxp_admin.menu.0'], noIcon));
        }
        rootNode.getChildren().forEach(function(header){
            if(!header.getChildren().size && header.getMetadata().get('component')) {
                items.push(renderItem(palette, header, null, noIcon));
            }else{
                let children = [];
                header.getChildren().forEach(function(child) {
                    if (!child.getLabel() || (!showAdvanced && child.getMetadata().get('advanced'))) {
                        return;
                    }
                    children.push(renderItem(palette, child, null, noIcon, child.getMetadata().get('advanced')));
                });
                if(!children.length){
                    return;
                }
                if(header.getLabel()){
                    //items.push(<Divider/>);
                    items.push(<Subheader style={menu.subHeader}>{header.getLabel()}</Subheader>)
                }
                items.push(...children);
            }
        });

        return items;

    }

}

export {NavigationHelper as default}