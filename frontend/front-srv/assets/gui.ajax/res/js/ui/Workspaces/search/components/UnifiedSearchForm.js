/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import React, {useRef, useState} from 'react'
import DOMUtils from 'pydio/util/dom'

import {IconButton} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import TextField from '@mui/material/TextField';
import InputAdornment from "@mui/material/InputAdornment";
import Autocomplete from '@mui/material/Autocomplete';

import AdvancedSearch from "./AdvancedSearch";
import AdvancedChips from "./AdvancedChips";
import Renderer from './Renderer'

import Pydio from 'pydio'
const {ThemedContainers:{Popover}} = Pydio.requireLib('hoc')


const styles = {
    container:{
        display:'flex',
        position:'relative',
        width: 120,
        height: 36,
        alignItems: 'center',
        borderRadius: 2,
        border: '1px solid #eee',
        marginRight: 8,
        paddingLeft: 8
    },
    textField:{
        inputStyle:{backgroundColor:'transparent',height: 34, borderRadius: 3, marginTop: 6, padding: 7},
        hintStyle:{paddingLeft: 7, /*color:'rgba(0,0,0,0.5)',*/ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', width: '100%'},
        underlineShow:false,
    },
    filterButton:{
        transition:DOMUtils.getBeziersTransition(),
        borderRadius: 15,
        cursor: 'pointer',
        fontSize: 15,
        fontWeight: 500,
        padding: 2
    },
    magnifierStyle:{
        fontSize: 20,
        opacity:.73,
        marginRight: 5
    },
    closeButton:{
        cursor: 'pointer',
        fontSize: 18
    },
    groupHeader:{
        position: 'sticky',
        top: -1,
        zIndex: 1,
        padding: '8px 10px',
        marginTop: 10,
        fontSize: 13, fontWeight: 500,
        color:'var(--md-sys-color-secondary)',
        textTransform:'uppercase'
    }
}

function UnifiedSearchForm (props){


    const containerRef = useRef()
    const textfieldRef = React.createRef();
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')

    const updateText = (value) => {
        const {onRequestOpen, searchTools:{values, setValues, savedSearches, nlpMatches}} = props;
        if(savedSearches.find(s => s.searchLABEL === value)){
            setInputValue('')
            return;
        }
        if(value.indexOf('#saved#') === 0) {
            const savedId = value.replace('#saved#', '')
            const newValues = savedSearches.filter(s => s.searchID === savedId)[0]
            setValues(newValues);
            setInputValue('')
            return;
        } else if (value === '#nlp#') {
            const metas = nlpMatches.asValues();
            const newValues = {...values, ...metas}
            setValues(newValues);
            setInputValue('')
            return;
        }
        setValues({...values, basenameOrContent:value});
        if(value) {
            onRequestOpen();
        } else {
         //   onRequestClose();
        }
    }

    const togglePopover = (e) => {
        const {onRequestOpen} = props;
        if(popoverOpen) {
            setPopoverOpen(false)
        } else {
            textfieldRef.current.blur()
            if(e) {
                e.stopPropagation()
            }
            onRequestOpen();
            setPopoverOpen(true)
        }
    }

    const focus =  () => {
        const {active, onRequestOpen, searchTools:{values, setValues}} = props;
        if(!active) {
            setValues(values);
        }
        onRequestOpen();
    }

    const {style, active, searchTools, formStyles, pydio, preventOpen, muiTheme} = props;
    const {values, setValues, advancedValues, getSearchOptions, nlpMatches, history=[], savedSearches=[], clearSavedSearch, saveSearch} = searchTools;

    const {basenameOrContent=''} = values;
    const filtersCount = advancedValues().length;
    let wStyle = {};
    if(active) {
        wStyle = {width: 420}
    }
    const {filterButton={}, filterButtonActive={}} = formStyles;
    const filterActiveStyles = filtersCount > 0 ? {backgroundColor:filterButton.color, color:'white', ...filterButtonActive} : {}
    const mergedButtonStyle = {...styles.filterButton, ...formStyles.filterButton, ...filterActiveStyles}
    const {fontSize=22, color, ...buttonStyle} =  mergedButtonStyle
    const buttonIconStyle = {fontSize, color}

    const nlpTags = {
        container: {
            borderRadius: 20,
            background: muiTheme.palette.mui3['surface-variant'],
            color: muiTheme.palette.mui3['on-surface-variant'],
            display: 'flex',
            alignItems: 'center',
            padding: '2px 10px',
            marginRight: 5,
            fontSize: 13,
            height: 25,
        },
        value: {
            fontWeight: 500
        }
    }

    const completeMessage = (id) => pydio.MessageHash['searchengine.complete.'+id] || id

    const currentFilters = []
    const ad = advancedValues()
    if(ad && ad.length > 0) {
        let additionalChild;
        if(basenameOrContent){
            additionalChild = [<span>{basenameOrContent}</span>]
        }
        currentFilters.push(
            {
                text:'',
                disable:true,
                value:(<AdvancedChips
                    muiTheme={muiTheme}
                    containerStyle={{paddingTop: 6, fontSize: 13, flex: 1}}
                    searchTools={searchTools}
                    title={completeMessage('activefilters')}
                    titleTagStyle={{backgroundColor:'transparent'}}
                    showRemove={false}
                    append={additionalChild}/>)
            }
        )
    }

    const nlpSuggestions = []
    const filteredMatches = nlpMatches && nlpMatches.getMatches();
    if(filteredMatches && filteredMatches.length) {
        const remainingString = nlpMatches.getRemaining()
        const block = (
            <span style={{display:'flex', flexWrap:'wrap', alignItems:'center'}}>
                <span>{completeMessage('suggestion.intro')}&nbsp;</span>
                {filteredMatches.map(m => {
                    const {label, value} = Renderer.blockRenderer(props, m.meta?m.meta:m, m.value)
                    if(value) {
                        return <span className={"nlpTag"} style={nlpTags.container}>{label}: <span style={nlpTags.value}>{value}</span></span>
                    } else {
                        return <span className={"nlpTag"} style={nlpTags.container}>{label}</span>
                    }
                })}
                <span>{remainingString?completeMessage('suggestion.remain').replace('%s', remainingString):''}?</span>
            </span>
        );
        nlpSuggestions.push({
            text:'#nlp#',
            label:'#nlp#',
            value: block,
            icon:'mdi mdi-lightbulb-outline',
            group:completeMessage('group.suggestion')
        })
    }

    const completeDataSource = [
        ...currentFilters,
        ...nlpSuggestions,
        ...savedSearches.map(k=>{
            return{
                text:'#saved#' + k.searchID,
                label:'#saved#' + k.searchID,
                icon:"mdi mdi-content-save",
                value: k.searchLABEL,
                isSaved:true,
                group:completeMessage('group.saved'),
            }
        }),
        ...history.map(k=>{
            return{
                text:k,
                label:k,
                value:k,
                icon:'mdi mdi-magnify',
                isLast:true,
                group:completeMessage('group.history')
            }
        }),
    ]

    return (
        <div style={{...styles.container, ...formStyles.mainStyle, ...style, ...wStyle, transition:DOMUtils.getBeziersTransition()}} ref={containerRef}>
            <Popover
                open={popoverOpen}
                anchorEl={containerRef.current}
                anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                onRequestClose={()=>{togglePopover()}}
                useLayerForClickAway={true}
                style={{width:420}}
                zDepth={3}
            >
                <AdvancedSearch
                    values={values}
                    searchTools={searchTools}
                    getSearchOptions={getSearchOptions}
                    onChange={(newValues) => setValues({...values, ...newValues})}
                    rootStyle={{paddingBottom: 8, maxHeight: '80vh', overflowY: 'auto'}}
                    showScope={true}
                    savedSearches={savedSearches}
                    saveSearch={saveSearch}
                    clearSavedSearch={clearSavedSearch}
                />
            </Popover>
            <Autocomplete
                fullWidth={true}
                slotProps={{paper:{elevation:5},popper:{modifiers: [{name: "offset", options: {offset: [0, 10]}}]}}}
                value={null}
                inputValue={inputValue || basenameOrContent}
                renderInput={(params) => {
                    return (
                        <TextField
                            {...params}
                            variant={"standard"}
                            fullWidth={true}
                            inputRef={textfieldRef}
                            placeholder={pydio.MessageHash['searchengine.main.placeholder']}
                            InputLabelProps={{sx:{fontSize:'1rem !important', marginLeft: '10px !important', marginTop: '-3px !important'}}}
                            InputProps={{
                                ...params.InputProps,
                                startAdornment:(
                                    <InputAdornment position={"start"}>
                                        <span className={"mdi mdi-magnify"} style={{...styles.magnifierStyle, ...formStyles.magnifierStyle}}/>
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                <span>
                                    {params.InputProps.endAdornment}
                                    {active &&
                                        <IconButton onClick={togglePopover} tooltip={pydio.MessageHash['searchengine.advanced-filter.tooltip']}
                                                    style={buttonStyle} iconStyle={buttonIconStyle} iconClassName={"mdi mdi-tune"}/>
                                    }
                                </span>
                                ),
                                disableUnderline: true
                            }}
                            onFocus={()=>{focus()}}
                        />
                    )}}
                onInputChange={(event, newInputValue) => {
                    if(event){
                        updateText(newInputValue)
                        setInputValue(newInputValue)
                    }
                }}
                onChange={(event, newValue) => {
                    if(newValue) {
                        if(typeof newValue === 'string'){
                            updateText(newValue)
                        } else {
                            updateText(newValue.text)
                        }
                    } else {
                        updateText('')
                    }
                }}
                popupIcon={null}
                options={preventOpen?[]:completeDataSource}
                getOptionLabel={o => {
                    if(typeof o === 'string') {
                        return o
                    } else if(o.text === '#nlp#'){
                        return basenameOrContent
                    } else if(o.text.indexOf('#saved#')> -1) {
                        return o.value
                    } else {
                        return o.text;
                    }
               }}
                renderOption={(props, o, state) => {
                    if(o.icon){
                        return <li {...props}><span style={{opacity:.5, marginRight: 10}} className={o.icon}/> {o.value}</li>
                    }else{
                        return <li {...props}>{o.value}</li>
                    }
                }}
                filterOptions={(x) => {
                    if(basenameOrContent){
                        // Filter out saved searches
                        return x.filter(o => !((o.isLast||o.isSaved)&&o.value.toLowerCase().indexOf(basenameOrContent.toLowerCase())===-1))
                    }
                    return x;
                }}
                groupBy={option => option.group}
                renderGroup={(params) => {
                    if (params.group) {
                        return (
                            <li key={params.key}>
                                <div style={styles.groupHeader}>{params.group}</div>
                                <ul style={{marginBottom: 10}}>{params.children}</ul>
                            </li>
                        )
                    } else {
                        return params.children
                    }
                }}
                isOptionEqualToValue={(o, v) => {
                    return o.text === v.text
                }}
                getOptionDisabled={(option) => option.disable}
                blurOnSelect
                autoComplete
                freeSolo
                disableClearable
            />
            <style type={"text/css"} dangerouslySetInnerHTML={{__html:".MuiAutocomplete-option[aria-disabled='true']{opacity:1 !important; border-bottom: 1px solid var(--md-sys-color-outline-variant);}"}}/>
        </div>
    );

}

UnifiedSearchForm = muiThemeable()(UnifiedSearchForm)
export default UnifiedSearchForm
