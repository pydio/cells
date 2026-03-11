import React from 'react'
import {Button, Menu} from "@mantine/core";
import Pydio from 'pydio'

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

// FIXME: Move to a common place see: .
export const NumberRangeModifiers: LeftSectionMenuItem[] = [
    {value: '', className:'mdi mdi-equal', label:'Equals', labelId:'meta.user.search.modifier.equals', default:true},
    {value: '>=', className:'mdi mdi-greater-than-or-equal', label:'Greater than', labelId:'meta.user.search.modifier.gte'},
    {value: '<=', className:'mdi mdi-less-than-or-equal', label:'Less than', labelId:'meta.user.search.modifier.lte'},
    {value: '>', className:'mdi mdi-greater-than', label:'Greater than (strict)', labelId:'meta.user.search.modifier.gt'},
    {value: '<', className:'mdi mdi-less-than', label:'Less than (strict)', labelId:'meta.user.search.modifier.lt'},
]

export const DateRangeModifiers: LeftSectionMenuItem[] = [
    {value: '', className:'mdi mdi-equal', label:'Exact date', labelId:'meta.user.search.modifier.exact-date', default:true},
    {value: '>=', className:'mdi mdi-greater-than-or-equal', label:'Start date', labelId:'meta.user.search.modifier.start-date'},
    {value: '<=', className:'mdi mdi-less-than-or-equal', label:'End date', labelId:'meta.user.search.modifier.end-date'},
]

export const TextSearchModifiers: LeftSectionMenuItem[] = [
    {value: '', className:'mdi mdi-equal', label:'Exact Match', labelId:'meta.user.search.modifier.exact-match', default:true},
    {value: '*', className:'mdi mdi-format-letter-starts-with', label:'Starts with', labelId:'meta.user.search.modifier.starts-with'},
    {value: '**', className:'mdi mdi-format-letter-matches', label:'Contains', labelId:'meta.user.search.modifier.contains'},
]

export const LeftSectionMenu: React.FC<LeftSectionMenuProps> = ({items, value='', onChange}) => {
    const messages = Pydio.getMessages ? Pydio.getMessages() : {}

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
                        {item.labelId ? (messages[item.labelId] || item.label) : item.label}
                    </Menu.Item>)
                )}
            </Menu.Dropdown>
        </Menu>
    )
}
