/*
 * Copyright 2026 Abstrium SAS <team (at) pyd.io>
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

import React, {useMemo} from 'react'
import {LeftSectionMenu, LeftSectionMenuItem} from './SearchModifiers'

type ModifierParseResult = {
    modifier: string
    text: string
}

type ModifierRenderArgs = {
    modifier: string
    text: string
    composedValue: string
    leftSection: React.ReactNode
    autoFocus: boolean
    onBlur?: () => void
    onTextChange: (nextText: string) => void
    onSubmit: () => void
}

type SearchModifierInputProps = {
    value?: string
    onChange: (value: string, submit?: boolean) => void
    items: LeftSectionMenuItem[]
    applyModifier: (modifier: string, text: string) => string
    parseModifier: (input: string) => ModifierParseResult
    requestToggleClose?: () => void
    children: (args: ModifierRenderArgs) => React.ReactNode
}

export const SearchModifierInput: React.FC<SearchModifierInputProps> = ({
    value,
    onChange,
    items,
    applyModifier,
    parseModifier,
    requestToggleClose,
    children
}) => {
    const {modifier, text} = parseModifier(value || '')
    const composedValue = applyModifier(modifier, text)

    const leftSection = useMemo(() => (
        <LeftSectionMenu
            items={items}
            value={modifier}
            onChange={(nextModifier) => onChange(applyModifier(nextModifier, text))}
        />
    ), [items, modifier, text, onChange, applyModifier])

    return (
        <>
            {children({
                modifier,
                text,
                composedValue,
                leftSection,
                autoFocus: !!requestToggleClose,
                onBlur: () => requestToggleClose && requestToggleClose(),
                onTextChange: (nextText) => onChange(applyModifier(modifier, nextText)),
                onSubmit: () => onChange(composedValue, true)
            })}
        </>
    )
}

type ModifierWrapperProps = {
    value?: string
    onChange: (value: string, submit?: boolean) => void
    items: LeftSectionMenuItem[]
    requestToggleClose?: () => void
    children: (args: ModifierRenderArgs) => React.ReactNode
}

export const TextSearchModifierInput: React.FC<ModifierWrapperProps> = ({
    value,
    onChange,
    items,
    requestToggleClose,
    children
}) => {
    const applyModifier = (modifier: string, text: string) => {
        if (!text) return ''
        switch (modifier) {
            case '*':
                return text + '*'
            case '**':
                return '*' + text + '*'
            default:
                return text
        }
    }

    const parseModifier = (input: string): ModifierParseResult => {
        if (!input) return { modifier: '', text: '' }
        const startsWithWildcard = input.indexOf('*') === 0
        const endsWithWildcard = input.lastIndexOf('*') === input.length - 1
        if (endsWithWildcard && !startsWithWildcard) {
            return { modifier: '*', text: input.substring(0, input.length - 1) }
        }
        if (startsWithWildcard && endsWithWildcard) {
            return { modifier: '**', text: input.substring(1, input.length - 1) }
        }
        return { modifier: '', text: input }
    }

    return (
        <SearchModifierInput
            value={value}
            onChange={onChange}
            items={items}
            applyModifier={applyModifier}
            parseModifier={parseModifier}
            requestToggleClose={requestToggleClose}
        >
            {children}
        </SearchModifierInput>
    )
}

export const RangeSearchModifierInput: React.FC<ModifierWrapperProps> = ({
    value,
    onChange,
    items,
    requestToggleClose,
    children
}) => {
    const applyModifier = (modifier: string, text: string) => {
        if (!text) return ''
        return `${modifier}${text}`
    }

    const parseModifier = (input: string): ModifierParseResult => {
        if (!input) return { modifier: '', text: '' }
        if (input.indexOf('>=') === 0 || input.indexOf('<=') === 0) {
            return { modifier: input.substring(0, 2), text: input.substring(2) }
        }
        if (input.indexOf('>') === 0 || input.indexOf('<') === 0) {
            return { modifier: input.substring(0, 1), text: input.substring(1) }
        }
        return { modifier: '', text: input }
    }

    return (
        <SearchModifierInput
            value={value}
            onChange={onChange}
            items={items}
            applyModifier={applyModifier}
            parseModifier={parseModifier}
            requestToggleClose={requestToggleClose}
        >
            {children}
        </SearchModifierInput>
    )
}
