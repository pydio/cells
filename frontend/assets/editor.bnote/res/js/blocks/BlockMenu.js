/*
 * Copyright 2025 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import { Menu } from "@mantine/core";
import {Fragment, useMemo} from "react";
// import {VscSettings} from "react-icons/vsc"; // NOTION-Like Settings icon
import {HiOutlineDotsVertical} from "react-icons/hi";

const BlockMenu = ({target, groups, settingsStyle = {}, position='bottom-end'}) => {

    return useMemo(() => {
        const {Target, Dropdown, Label, Item} = Menu
        return (
            <Menu withinPortal={false} position={position}>
                <Target>
                    {target ? target : <span style={{fontSize:'1rem',lineHeight:'1rem', cursor:'pointer', opacity:0.73, ...settingsStyle}}><HiOutlineDotsVertical/></span>}
                </Target>
                <Dropdown>
                    {groups && groups.map(({title, values = [], onValueSelected = (v)=>{}, crtValue}) => {
                        return (
                            <Fragment>
                                <Label>{title}</Label>
                                {values && values.map((entry) => {
                                    const ItemIcon = entry.icon;
                                    return (
                                        <Item
                                            key={entry.value}
                                            value={entry.value}
                                            leftSection={ <ItemIcon data-alert-icon-type={entry.value} /> }
                                            onClick={() => onValueSelected(entry.value)}>
                                            <span style={{fontWeight:entry.value===crtValue?'bold':'normal'}}>{entry.title}</span>
                                        </Item>
                                    );
                                })}
                            </Fragment>
                        )
                    })}
                </Dropdown>
            </Menu>
        )
    }, [target, groups, settingsStyle, position])
}

export {BlockMenu}