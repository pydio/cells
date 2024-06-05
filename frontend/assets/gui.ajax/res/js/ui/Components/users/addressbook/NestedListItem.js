/*
 * Copyright 2007-2023 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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


import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {ListItem, FontIcon, Avatar} from 'material-ui'

/**
 * Left panel of the address book
 * Display treeview hierarchy of users, teams, groups.
 */
class NestedListItem extends Component{

    /**
     * Triggers this.props.onClick
     */
    onClick(){
        this.props.onClick(this.props.entry);
    }

    /**
     * Recursively build other NestedListItem
     * @param data
     */
    buildNestedItems(data){
        const {style, innerDivStyle, avatarSize} = this.props;
        return data.map(function(entry){
            return (
                <NestedListItem
                    nestedLevel={this.props.nestedLevel+1}
                    entry={entry}
                    onClick={this.props.onClick}
                    selected={this.props.selected}
                    showIcons={true}
                    style={style}
                    innerDivStyle={innerDivStyle}
                    avatarSize={avatarSize}
                />);
        }.bind(this));
    }

    render(){
        const {showIcons, entry, selected, style, innerDivStyle, avatarSize=36} = this.props;
        const {id, label, icon} = entry;
        const children = entry.collections || [];
        const nested = this.buildNestedItems(children);
        let fontIcon, leftAvatar;
        if(icon && showIcons){
            fontIcon = <FontIcon className={icon}/>;
            leftAvatar = <Avatar icon={<FontIcon className={icon}/>} size={avatarSize} />
        }
        return (
            <ListItem
                nestedLevel={this.props.nestedLevel}
                key={id}
                primaryText={label}
                onClick={this.onClick.bind(this)}
                nestedItems={nested}
                initiallyOpen={true}
                leftAvatar={leftAvatar}
                innerDivStyle={innerDivStyle}
                style={style}
            />
        );
    }

}

NestedListItem.propTypes = {
    /**
     * Keeps track of the current depth level
     */
    nestedLevel:PropTypes.number,
    /**
     * Currently selected node id
     */
    selected:PropTypes.string,
    /**
     * Callback triggered when an entry is selected
     */
    onClick:PropTypes.func
}

export {NestedListItem as default}