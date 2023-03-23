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

import React from 'react'
import NestedListItem from "./NestedListItem";
import {Divider, List} from "material-ui";

export default class CollectionsPanel extends React.Component {

    constructor(props) {
        super(props);
        const {model} = props;
        model.observe('update', () => this.forceUpdate())
    }

    render() {

        const {listStyles={}, rootStyle={}, model} = this.props;

        let nestedRoots = [];
        const context = model.contextItem()

        model.getRoot().collections.map(function(e){
            nestedRoots.push(
                <NestedListItem
                    key={e.id}
                    selected={context && context.id}
                    nestedLevel={0}
                    entry={e}
                    onClick={(i,c) => model.setContext(i,c)}
                    {...listStyles.listItem}
                    avatarSize={listStyles.avatar?listStyles.avatar.avatarSize:undefined}
                    showIcons={true}
                />
            );
            nestedRoots.push(<Divider key={e.id + '-divider'}/>);
        }.bind(this));
        nestedRoots.pop();

        return (
            <div style={{...rootStyle, zIndex:2}}>
                <List>{nestedRoots}</List>
            </div>
        );

    }
}