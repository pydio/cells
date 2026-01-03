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
import React, {Fragment, useState, useEffect, useCallback} from 'react'
import Renderer, {renderField} from "./Renderer";
import {muiThemeable} from "material-ui/styles";
import {chipsStyles} from "./AdvancedChipsStyles";
import Pydio from 'pydio'
import {useLocalStorage} from "react-use";
import {AdvancedPlusMenu} from "./AdvancedPlusMenu";
const {ThemedContainers:{Popover}} = Pydio.requireLib('hoc')

export const AdvancedAsChips = muiThemeable()((props) => {

    const {pydio, searchTools, containerStyle, tagStyle, title, titleTagStyle, append, appendUnstyled, prependUnstyled, muiTheme} = props;
    const {advancedValues, values, setValues, getSearchOptions, SearchConstants} = searchTools;

    const [popoverOpen, setPopoverOpen] = useState(false);
    const [popoverEl, setPopoverEl] = useState(null);
    const [popoverKey, setPopoverKey] = useState(null);
    const [popoverField, setPopoverField] = useState(null);
    const [displayed, setDisplayed, removeDisplayed] = useLocalStorage('search.advanced.chips.displayed', [])

    const styles = chipsStyles(muiTheme, containerStyle, tagStyle, true);
    const getMessage = (id) => Pydio.getMessages()[id]
    const byteSizeMeta = {name:SearchConstants.KeyBytesize, type:'bytesize', label: getMessage(2)}

    const aa = advancedValues()
    let mimeLabel = getMessage('searchengine.format.title')
    const mimeValue = aa.find(a => a.key === SearchConstants.KeyMime)
    if(mimeValue && mimeValue.label){
        mimeLabel = mimeValue.label
    }

    const [closableMeta, setClosableMeta] = useState([byteSizeMeta]);
    const hidden = closableMeta.filter(i => displayed.indexOf(i.name) === -1)
    const visibles = closableMeta.filter(i => displayed.indexOf(i.name) > -1)
    if(hidden.length){
        visibles.push({name:'__plus__', label:'More Filters...', type:'plus', plus: true})
    }
    const fields =  [
        {name:SearchConstants.KeyScope, type: 'scope', label: getMessage('searchengine.scope.title')},
        {name:SearchConstants.KeyMime, type: 'mime', label: mimeLabel},
        {name:SearchConstants.KeyMetaShared, type:'share', label: getMessage('searchengine.share.title')},
        {name:SearchConstants.KeyModifDate, type: 'modiftime', label: getMessage(4)},
        ... visibles.map(v => {return {...v, closable: true}})
    ]

    useEffect(()=>{
        getSearchOptions().then(oo => {
            const ii = oo.indexedMeta.map(m => {return {...m, name: m.namespace, userDefined: true}})
            setClosableMeta([...ii, byteSizeMeta])
        });
    }, [])

    // Utils
    const isValueEmpty = useCallback((values, key) => {
        return key === SearchConstants.KeyScope ? (values[key] === 'all') : !values[key]
    }, [])
    const emptyValue = useCallback((values, key) => {
        const newValues = {...values}
        if(key === SearchConstants.KeyScope) {
            newValues[key] = 'all'
        }else {
            delete newValues[key]
        }
        return newValues;
    }, [])


    let blocks = fields.map(field => {
        const cc = []
        if(field.plus) {
            return {contents:[<span className={"mdi mdi-plus"}/>], keyClick:field.name}
        }
        let key = field.name
        if(field.userDefined) {
            key = 'ajxp_meta_' + field.name
        }
        const {label, value} = Renderer.blockRenderer(props, {...field}, values[key]||'')
        label && cc.push(<span style={{fontWeight: isValueEmpty(values, key)?400:500, marginRight: 5}}>{label}</span>);
        value && cc.push(value);
        if((label || value) && !isValueEmpty(values, key)) {
            cc.push(<span className={"mdi mdi-close"} style={styles.tagRemove} onClick={(e) => e.stopPropagation() || setValues(emptyValue(values, key)) }/>)
        } else if(field.closable) {
            cc.push(<span className={"mdi mdi-close"} style={styles.tagHide} onClick={(e) => e.stopPropagation() || setDisplayed(displayed.filter(n => n !== field.name)) }/>)
        }

        return {contents: cc, keyClick: field.name, active: !isValueEmpty(values, key)};
    })

    const openPopover = useCallback((e, key) => {
        e.stopPropagation()
        if(popoverOpen && popoverKey === key) {
            setPopoverKey('')
            setPopoverOpen(false);
            return
        }
        setPopoverKey(key)
        setPopoverField(fields.find(f => f.name === key))
        setPopoverEl(e.currentTarget)
        setPopoverOpen(true);
    }, [popoverOpen, popoverKey, fields]);

    if(append && append.length > 0) {
        blocks = [...blocks, ...append.map(a => {return {contents: a}})]
    }

    if(!blocks.length && !appendUnstyled && !prependUnstyled) {
        return null
    }

    return(
        <Fragment>
            <Popover
                open={popoverOpen}
                anchorEl={popoverEl}
                anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
                useLayerForClickAway={false}
                onRequestClose={()=>setPopoverOpen(false)}
                style={{width:260, borderRadius:12, zIndex:2000, marginTop: 5, background:'var(--md-sys-color-surface-1)'}}
                zDepth={2}
            >
                {popoverField && <div style={styles.popoverTitle}>{popoverField.label}</div>}
                {popoverField && !popoverField.plus && renderField(pydio, searchTools, 'popover', popoverField,(cc)=> setValues({...values, ...cc}))}
                {popoverField && popoverField.plus &&
                    <AdvancedPlusMenu
                        pydio={pydio}
                        requestClose={()=>setPopoverOpen(false)}
                        displayed={displayed}
                        setDisplayed={setDisplayed}
                        indexedMetadata={closableMeta}
                    />
                }
            </Popover>
            <div style={styles.container}>
                {prependUnstyled}
                {title && <div style={{...styles.tag,...titleTagStyle}}>{title}</div>}
                {blocks.map((cc, idx) => {
                    let st = {...styles.tagField}
                    if(cc.keyClick) {
                        st = {...st, cursor: 'pointer'};
                        if(cc.keyClick === '__plus__') {
                            st = {...st, padding: '1px 3px', fontSize: 16};
                        }
                    }
                    if(cc.active) {
                        st = {...st, ...styles.tagFieldActive}
                    }
                    if(popoverOpen && popoverKey === cc.keyClick) {
                        st = {...st, ...styles.tagFieldOpen}
                    }
                    return (
                    <div
                        key={'block-'+idx} style={st}
                        onClick={cc.keyClick?(e)=>openPopover(e, cc.keyClick):undefined}
                    >{cc.contents}
                    </div>)
                })
                }
                {appendUnstyled}
            </div>
        </Fragment>
    )
})