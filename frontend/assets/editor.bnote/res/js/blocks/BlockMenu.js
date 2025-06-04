import { Menu } from "@mantine/core";
import {Fragment} from "react";

const BlockMenu = ({target, groups, position='bottom-start'}) => {
    return (
        <Menu withinPortal={false} position={position}>
            <Menu.Target>{target}</Menu.Target>
            {/*Dropdown to change the Alert type*/}
            <Menu.Dropdown>
                {groups && groups.map(({title, values = [], onValueSelected = (v)=>{}, crtValue}) => {
                    return (
                        <Fragment>
                            <Menu.Label>{title}</Menu.Label>
                            {values && values.map((entry) => {
                                const ItemIcon = entry.icon;

                                return (
                                    <Menu.Item
                                        key={entry.value}
                                        value={entry.value}
                                        leftSection={ <ItemIcon data-alert-icon-type={entry.value} /> }
                                        onClick={() => onValueSelected(entry.value)}>
                                        <span style={{fontWeight:entry.value===crtValue?'bold':'normal'}}>{entry.title}</span>
                                    </Menu.Item>
                                );
                            })}
                        </Fragment>
                    )
                })}
            </Menu.Dropdown>
        </Menu>
    )
}

export {BlockMenu}