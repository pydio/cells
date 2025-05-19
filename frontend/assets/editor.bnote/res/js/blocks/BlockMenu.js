import { Menu } from "@mantine/core";

const BlockMenu = ({target, title, values = [], onValueSelected = (v)=>{}, position='bottom-start'}) => {
    return (
        <Menu withinPortal={false} position={position}>
            <Menu.Target>{target}</Menu.Target>
            {/*Dropdown to change the Alert type*/}
            <Menu.Dropdown>
                <Menu.Label>{title}</Menu.Label>
                <Menu.Divider />
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
            </Menu.Dropdown>
        </Menu>
    )
}

export {BlockMenu}