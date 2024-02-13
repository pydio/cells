/*
 * Copyright 2024 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React, {Fragment, createContext, useState, useEffect} from 'react'
import {useLocalStorage} from "react-use";
import InfoPanel, {InfoPanelNoScroll} from "./InfoPanel";
import {ResizableColumn} from "./ResizableColumn";


const MultiColumnContext = createContext(null);

const MultiColumnPanel = ({afterResize = ()=>{}, storageKey, onContentChange, ...infoProps}) => {

    const [columns, setColumns] = useLocalStorage(storageKey + '.multicolumns', [])
    const [defaultColumn, setDefaultColumn] = useLocalStorage(storageKey + '.defaultColumn', {})
    const [ghostDrop, setGhostDrop] = useState(false)
    const [dragSession, setDragSession] = useState(0)

    const [storedSwitches, storeSwitches] = useLocalStorage(storageKey + '.switches', [])
    const [switches, setSwitches] = useState(storedSwitches)

    const [templates, setTemplates] = useState([])

    useEffect(() => {
        afterResize()
    }, [columns])

    // First column filter components that are NOT in other columns
    const secondaryComps = []
    columns.forEach(c => {
        secondaryComps.push(...c.components)
    })
    let allColumns = [{}, ...columns]

    const togglePinInColumn = (key, idx) => {
        if(idx === 0) {
            setDefaultColumn({...defaultColumn, pin: key});
        } else {
            columns[idx - 1].pin = key;
            setColumns(columns);
        }
    }

    const stickToColumn = (key, idx) => {
        if(!key) {
            return
        }
        // Remove from any column
        columns.forEach(c => {
            c.components = c.components.filter(comp => comp !== key)
        })
        let cleanColumns = columns.filter(c => c.components && c.components.length)
        // For column 0, store and return now
        if(idx === 0) {
            setColumns(cleanColumns);
            return
        }
        const target = idx - 1;
        // recreate intermediary columns if necessary
        for(let i=0; i<=target; i++) {
            if(!cleanColumns[i]) {
                cleanColumns[i] = {components: []}
            }
        }
        cleanColumns[target].components.push(key);
        // Clean again
        cleanColumns = cleanColumns.filter(c => c.components && c.components.length)
        setColumns(cleanColumns);
    }

    const switchItems = (source, target, end) => {
        if(end) {
            // Store without "dragSession" flag
            storeSwitches(switches.map(sw => {return {source:sw.source, target:sw.target}}))
            return;
        }
        // Enrich the values, do not append if very last is already the same
        let ss = [
            ...switches.filter((s, idx) => !(idx === switches.length -1 && s.dragSession === dragSession &&  s.source === source && s.target === target)),
            {source, target, dragSession}]
        setSwitches(ss)
    }

    if(ghostDrop) {
        // Create a fake additional column
        allColumns.push({components:[]})
    }
    const resizeStorageKey = storageKey + '.rightColumnWidth'

    return (
        <Fragment>{allColumns.map((col, idx) => {
            // Create custom context
            let displayForColumn = (key)=>true;
            let currentPin;
            if(idx === 0) {
                displayForColumn = (key) => {return !secondaryComps.includes(key)}
                currentPin = defaultColumn && defaultColumn.pin
            } else {
                displayForColumn = (key) => col.components && col.components.includes(key)
                currentPin = col.pin
            }
            const contextObject = {
                displayForColumn,
                stickToColumn,
                currentPin,
                setColumnPin:(key)=> togglePinInColumn(key, idx),
                currentColumn: idx,
                columnsLength: allColumns.length,
                startDragState:() => {setGhostDrop(true); setDragSession(Math.random())},
                endDragState:() => {setGhostDrop(false); setDragSession(0)},
                switchItems,
            };

            let {style, closed} = {infoProps}
            style = {...style}
            if(currentPin) {
                style = {...style, height: '100%', display:'flex', flexDirection:'column', overflow:'hidden'}
            }

            if(idx > 0 && !ghostDrop && !templates.filter(t => displayForColumn(t.COMPONENT)).length) {
                closed = true
            }

            let ghostColumn
            if(ghostDrop && idx === allColumns.length-1) {
                ghostColumn=true
            }

            const finalInfoProps = {
                ...infoProps,
                switches
            }
            if(idx === 0) {
                finalInfoProps.onTemplatesChange = (tpl) => {
                    setTemplates(tpl);
                    onContentChange(tpl.length)
                }
            }
            const isLast = idx === allColumns.length-1
            const isFirst = idx === 0

            return (
                <MultiColumnContext.Provider value={contextObject}>
                    <ResizableColumn
                        afterResize={afterResize}
                        storageKey={resizeStorageKey + '-' + idx}
                        isGhost={ghostColumn}
                        isLast={idx === allColumns.length-1}
                        minWidth={73}
                        defaultWith={isLast && !isFirst && !ghostColumn && 73 || 250}
                        dropColumnIndex={idx}
                        onColumnDrop={stickToColumn}
                        closed={closed}
                    >
                        {currentPin ? <InfoPanelNoScroll {...finalInfoProps} style={style}/> : <InfoPanel {...finalInfoProps}/> }
                    </ResizableColumn>
                </MultiColumnContext.Provider>
            );
        })}</Fragment>
    )

}

export {MultiColumnPanel, MultiColumnContext}