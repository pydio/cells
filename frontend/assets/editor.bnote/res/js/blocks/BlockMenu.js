import { Menu } from "@mantine/core";
import {Fragment} from "react";

const BlockMenu = ({target, groups, position='bottom-start'}) => {
    return (
        <Menu withinPortal={false} position={position}>
            <Menu.Target>{target}</Menu.Target>
            {/*Dropdown to change the Alert type*/}
            <Menu.Dropdown>
                {groups.map(({title, values = [], onValueSelected = (v)=>{}}) => {
                    return (
                        <Fragment>
                            <Menu.Label>{title}</Menu.Label>
                            {values.map((entry) => {
                                const ItemIcon = entry.icon;

                                return (
                                    <Menu.Item
                                        key={entry.value}
                                        leftSection={
                                            <ItemIcon
                                                className={"alert-icon"}
                                                data-alert-icon-type={entry.value}
                                            />
                                        }
                                        onClick={() => onValueSelected(entry.value)}>
                                        {entry.title}
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