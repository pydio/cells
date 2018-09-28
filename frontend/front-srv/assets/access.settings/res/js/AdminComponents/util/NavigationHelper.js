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

const {MenuItem, Divider, Subheader, FontIcon} = require('material-ui')

function renderItem(palette, node, text = null, noIcon = false, advanced = false){

    const iconStyle = {
        fontSize: 22,
        lineHeight: '20px',
        marginLeft: 20
    };
    const flagStyle = {
        display: 'inline',
        backgroundColor: palette.accent1Color,
        color: 'white',
        height: 22,
        borderRadius: 10,
        padding: '0 5px',
        marginLeft: 5
    };
    const ellispsis = {
        whiteSpace:'nowrap',
        overflow:'hidden',
        textOverflow:'ellipsis'
    };
    let mainStyle = {};
    if (advanced){
        mainStyle = {opacity: .7};
    }

    let label = text || node.getLabel();
    if(node.getMetadata().get('flag')){
        label = <div style={ellispsis}>{node.getLabel()} <span style={flagStyle}>{node.getMetadata().get('flag')}</span> </div>;
    } else {
        label = <div style={ellispsis}>{label}</div>
    }

    return (
        <MenuItem
            style={mainStyle}
            value={node}
            primaryText={label}
            leftIcon={!noIcon && <FontIcon className={node.getMetadata().get('icon_class')} style={iconStyle}/>}
        />);

}

class NavigationHelper{

    static buildNavigationItems(pydio, rootNode, palette, showAdvanced = false, noIcon = false){

        let items = [];

        const headerStyle = {
            fontSize: 12,
            color: 'rgba(0,0,0,0.25)',
            textTransform: 'uppercase'
        };

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
                    items.push(<Divider/>);
                    //if(showAdvanced){
                        items.push(<Subheader style={headerStyle}>{header.getLabel()}</Subheader>)
                    //}
                }
                items.push(...children);
            }
        });

        return items;

    }

}

export {NavigationHelper as default}