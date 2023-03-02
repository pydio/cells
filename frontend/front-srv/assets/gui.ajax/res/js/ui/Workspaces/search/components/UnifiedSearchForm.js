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
import React from 'react'
import DOMUtils from 'pydio/util/dom'
import {Popover} from 'material-ui'

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import TuneIcon from '@mui/icons-material/Tune';

import AdvancedSearch from "./AdvancedSearch";
import Renderer from './Renderer'
import InputAdornment from "@mui/material/InputAdornment";
import AdvancedChips from "./AdvancedChips";


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
        hintStyle:{paddingLeft: 7, color:'rgba(0,0,0,0.5)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', width: '100%'},
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
        top: 0, padding: '8px 10px',
        fontSize: 13, fontWeight: 500,
        color:'rgba(17, 70, 97, 0.5)',
        backgroundColor:'rgba(255,255,255,.9)',
        textTransform:'uppercase'
    }
}

class UnifiedSearchForm extends React.Component {

    constructor(props) {
        super(props);
        this.containerRef = React.createRef();
        this.textfieldRef = React.createRef();
    }

    updateText(value) {
        const {onRequestOpen, searchTools:{values, setValues, savedSearches, nlpMatches}} = this.props;
        if(value.indexOf('#saved#') === 0) {
            const savedId = value.replace('#saved#', '')
            const newValues = savedSearches.filter(s => s.searchID === savedId)[0]
            setValues(newValues);
            return;
        } else if (value === '#nlp#') {
            const metas = nlpMatches.asValues();
            const newValues = {...values, ...metas}
            setValues(newValues);
            return;
        }
        setValues({...values, basenameOrContent:value});
        if(value) {
            onRequestOpen();
        } else {
         //   onRequestClose();
        }
    }

    togglePopover(e){
        const {popoverOpen} = this.state || {};
        const {onRequestOpen} = this.props;
        if(popoverOpen) {
            this.setState({popoverOpen: false})
        } else {
            this.textfieldRef.current.blur()
            if(e) {
                e.stopPropagation()
            }
            onRequestOpen();
            this.setState({
                popoverOpen: true,
                anchorElement:this.containerRef.current
            })
        }
    }

    focus() {
        const {active, onRequestOpen, searchTools:{values, setValues}} = this.props;
        if(!active) {
            setValues(values);
        }
        onRequestOpen();
    }

    render() {

        const {style, active, searchTools, formStyles, pydio, preventOpen} = this.props;

        const {values, setValues, advancedValues, getSearchOptions, nlpMatches, history=[], savedSearches=[], clearSavedSearch, saveSearch} = searchTools;
        const {basenameOrContent=''} = values;
        const {popoverOpen, anchorElement} = this.state || {}
        const filtersCount = advancedValues().length;
        let wStyle = {};
        if(active) {
            wStyle = {width: 420}
        }
        const {filterButton={}, filterButtonActive={}} = formStyles;
        const filterActiveStyles = filtersCount > 0 ? {backgroundColor:filterButton.color, color:'white', fontSize: 13, ...filterButtonActive} : {}


        const nlpTags = {
            container: {
                borderRadius: 20,
                backgroundColor: '#eceff1',
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
                        containerStyle={{paddingTop: 6, fontSize: 13, flex: 1}}
                        searchTools={searchTools}
                        title={"Filters:"}
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
                    <span>Do you mean&nbsp;</span>
                    {filteredMatches.map(m => {
                        const {label, value} = Renderer.blockRenderer(this.props, m.meta?m.meta:m, m.value)
                        if(value) {
                            return <span className={"nlpTag"} style={nlpTags.container}>{label}: <span style={nlpTags.value}>{value}</span></span>
                        } else {
                            return <span className={"nlpTag"} style={nlpTags.container}>{label}</span>
                        }
                    })}
                    <span>{remainingString?' containing '+'"'+remainingString+'"':''}?</span>
                </span>
            );
            nlpSuggestions.push({
                text:'#nlp#',
                value: block,
                icon:'mdi mdi-lightbulb-outline',
                group:'Advanced Suggestion'
            })
        }

        const completeDataSource = [
            ...currentFilters,
            ...nlpSuggestions,
            ...savedSearches.filter(k => !basenameOrContent).map(k=>{
                return{
                    text:'#saved#' + k.searchID,
                    icon:"mdi mdi-content-save",
                    value: k.searchLABEL,
                    group:'Saved Searches',
                }
            }),
            ...history.filter(k => (!basenameOrContent||(k.indexOf(basenameOrContent)===0&&k!==basenameOrContent))).map(k=>{return{text:k,value:k, group:'Last Searches', icon:'mdi mdi-magnify'}}),
        ]

        return (
            <div style={{...styles.container, ...formStyles.mainStyle, ...style, ...wStyle, transition:DOMUtils.getBeziersTransition()}} ref={this.containerRef}>
                <Popover
                    open={popoverOpen}
                    anchorEl={anchorElement}
                    anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                    targetOrigin={{horizontal: 'right', vertical: 'top'}}
                    onRequestClose={()=>{this.togglePopover()}}
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
                    renderInput={(params) => {
                        return (
                            <TextField
                                {...params}
                                variant={"standard"}
                                fullWidth={true}
                                inputRef={this.textfieldRef}
                                inputProps={{...params.inputProps, value: params.inputProps.value || basenameOrContent}}
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
                                            <div onClick={this.togglePopover.bind(this)} title={pydio.MessageHash['searchengine.advanced-filter.tooltip']} style={{...styles.filterButton, ...formStyles.filterButton, ...filterActiveStyles}}>
                                                <TuneIcon fontSize={'small'}/>
                                            </div>
                                        }
                                    </span>
                                    ),
                                    disableUnderline: true
                                }}
                                onFocus={()=>{this.focus(); setTimeout(() => {this.setState({searchFocus: true})}, 1000)}}
                                onBlur={()=>{this.setState({searchFocus: false})}}
                            />
                        )}}
                    onInputChange={(event, newInputValue) => {
                        if(event){
                            this.updateText(newInputValue)
                        }
                    }}
                    onChange={(event, newValue) => {
                        if(newValue) {
                            if(typeof newValue === 'string'){
                                this.updateText(newValue)
                            } else {
                                this.updateText(newValue.text)
                            }
                        } else {
                            this.updateText('')
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
                            return ''
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
                    filterOptions={(x) => x}
                    groupBy={option => option.group}
                    renderGroup={(params) => {
                        if (params.group) {
                            return (
                                <li key={params.key}>
                                    <div style={styles.groupHeader}>{params.group}</div>
                                    <ul style={{marginBottom: 20}}>{params.children}</ul>
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
                <style type={"text/css"} dangerouslySetInnerHTML={{__html:".MuiAutocomplete-option[aria-disabled='true']{opacity:1 !important; background-color: #f5f5f5;border-bottom: 1px solid #eee;}"}}/>
            </div>
        );
    }

}

export default UnifiedSearchForm
