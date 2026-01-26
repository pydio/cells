import React from 'react'
import {Button, Menu} from "@mantine/core";

export interface LeftSectionMenuItem {
    value: string,
    className: string,
    label: string,
    labelId?: string,
    default?: boolean,
}

export interface LeftSectionMenuProps {
    items: LeftSectionMenuItem[];
    value: string,
    onChange: (value: string) => void,
}

export const NumberRangeModifiers: LeftSectionMenuItem[] = [
    {value: '', className:'mdi mdi-equal', label:'Equals', default:true},
    {value: '>=', className:'mdi mdi-greater-than-or-equal', label:'Greater than'},
    {value: '<=', className:'mdi mdi-less-than-or-equal', label:'Less than'},
    {value: '>', className:'mdi mdi-greater-than', label:'Greater than (strict)'},
    {value: '<', className:'mdi mdi-less-than', label:'Less than (strict)'},
]

export const DateRangeModifiers: LeftSectionMenuItem[] = [
    {value: '', className:'mdi mdi-equal', label:'Exact date', default:true},
    {value: '>=', className:'mdi mdi-greater-than-or-equal', label:'Start date'},
    {value: '<=', className:'mdi mdi-less-than-or-equal', label:'End date'},
]

export const TextSearchModifiers: LeftSectionMenuItem[] = [
    {value: '', className:'mdi mdi-equal', label:'Exact Match', default:true},
    {value: '*', className:'mdi mdi-format-letter-starts-with', label:'Starts with'},
    {value: '**', className:'mdi mdi-format-letter-matches', label:'Contains'},
]

export const LeftSectionMenu: React.FC<LeftSectionMenuProps> = ({items, value='', onChange}) => {

    const current = items.find(item => item.value === value) || items[0]

    return (
        <Menu withinPortal={false} position={'bottom-start'}>
            <Menu.Target>
                <Button style={{padding:0, height:26, width:26}} variant={current.default?"subtle":"filled"} size={"sm"}><span className={current.className}/></Button>
            </Menu.Target>
            <Menu.Dropdown>
                {items.map(item => (
                    <Menu.Item
                        onClick={()=>onChange(item.value)}
                        leftSection={<span className={item.className}/>}>
                        {item.label}
                    </Menu.Item>)
                )}
            </Menu.Dropdown>
        </Menu>
    )
}