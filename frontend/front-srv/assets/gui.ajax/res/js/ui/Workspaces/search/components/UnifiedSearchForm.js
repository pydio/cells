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
import Pydio from 'pydio'
import DOMUtils from 'pydio/util/dom'
import {AutoComplete, MenuItem, Popover} from 'material-ui'
import AdvancedSearch from "./AdvancedSearch";

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
        position: 'absolute',
        top: 7,
        right: 8,
        borderRadius: 15,
        padding: '1px 6px 0px 6px',
        cursor: 'pointer',
        fontSize: 15,
        fontWeight: 500
    },
    closeButton:{
        cursor: 'pointer',
        fontSize: 18
    }
}

class UnifiedSearchForm extends React.Component {

    constructor(props) {
        super(props);
        this.containerRef = React.createRef();
    }

    updateText(value) {
        const {onRequestOpen, onRequestClose, values, setValues, savedSearches, nlpMatches} = this.props;
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
            onRequestOpen();
            this.setState({
                popoverOpen: true,
                anchorElement:this.containerRef.current
            })
        }
    }

    focus() {
        const {active, onRequestOpen, values, setValues} = this.props;
        if(!active) {
            setValues(values);
        }
        onRequestOpen();
    }

    render() {

        const {onRequestClose, values, setValues, style, active, getSearchOptions, formStyles,
            nlpMatches, history = [], savedSearches = [], clearSavedSearch, saveSearch, pydio} = this.props;
        const {basenameOrContent=''} = values;
        const {popoverOpen, anchorElement, searchFocus} = this.state || {}
        const filtersCount = Object.keys(values)
            .filter(key => key !== 'basenameOrContent' && key !== 'searchLABEL' && key !== 'searchID')
            .filter(key => values[key])
            .filter(key => !(key === 'scope' && values[key] === 'all'))
            .length;
        let wStyle = {};
        if(active) {
            wStyle = {width: 420}
        }
        const {filterButton={}, filterButtonActive={}} = formStyles;
        const filterActiveStyles = filtersCount > 0 ? {backgroundColor:filterButton.color, color:'white', fontSize: 13, ...filterButtonActive} : {}


        const nlpTags = {
            container: {
                display: 'inline-block',
                backgroundColor: '#eceff1',
                padding: '0 5px',
                borderRadius: 5
            },
            value: {
                borderLeft: '1px solid white',
                fontWeight: 500
            }
        }

        const nlpSuggestions = []
        const filteredMatches = nlpMatches && nlpMatches.getMatches();
        if(filteredMatches) {
            const remainingString = nlpMatches.getRemaining()
            const block = (
                <span>Do you mean {filteredMatches.map(m => {
                    return (
                        <span style={nlpTags.container}>
                            {m.label}
                            {m.value && !m.labelOnly && ':'}
                            {!m.labelOnly && <span style={nlpTags.value}>{m.isDate?m.value.toLocaleDateString():m.value}</span>}
                        </span>
                    )
                })}{remainingString?' containing '+'"'+remainingString+'"':''}?
                </span>
            );
            nlpSuggestions.push({text:'#nlp#', value: <MenuItem primaryText={block}/>})
        }

        const completeDataSource = [
            ...nlpSuggestions,
            ...savedSearches.map(k=>{
                return{
                    text:'#saved#' + k.searchID,
                    value:(
                        <MenuItem
                            primaryText={
                                <span><span style={{opacity:.6, marginRight: 5}} className={"mdi mdi-content-save"}/> {k.searchLABEL}</span>
                            }
                        />
                    )}
            }),
            ...history.map(k=>{return{text:k,value:k}}),
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
                        getSearchOptions={getSearchOptions}
                        onChange={(newValues) => setValues({...values, ...newValues})}
                        rootStyle={{paddingBottom: 8, maxHeight: '80vh', overflowY: 'auto'}}
                        showScope={true}
                        savedSearches={savedSearches}
                        saveSearch={saveSearch}
                        clearSavedSearch={clearSavedSearch}
                    />
                </Popover>
                <div onClick={onRequestClose} style={{...styles.closeButton,...formStyles.magnifierStyle}}>
                    <span className={"mdi mdi-" + (active?'close':'magnify')}/>
                </div>
                <AutoComplete
                    dataSource={completeDataSource}
                    filter={(searchText, key) => (searchText === '' || key.indexOf(searchText) === 0 || key === '#nlp#') && searchText !== key}
                    open={searchFocus}
                    style={{marginLeft: 5, flex: 1}}
                    inputStyle={formStyles.inputStyle}
                    hintStyle={formStyles.hintStyle}
                    fullWidth={true}
                    underlineShow={false}
                    hintText={pydio.MessageHash['searchengine.main.placeholder']}
                    searchText={basenameOrContent || ''}
                    menuProps={{desktop:true}}
                    menuStyle={{maxHeight: 300, width: 400, ...formStyles.completeMenuStyle}}
                    onUpdateInput={(v) => this.updateText(v)}
                    onKeyPress={(e) => (e.key === 'Enter' ? this.updateText(e.target.value) : null)}
                    onFocus={()=>{this.focus(); setTimeout(() => {this.setState({searchFocus: true})}, 1000)}}
                    onBlur={()=>{this.setState({searchFocus: false})}}
                />
                {active &&
                    <div onClick={this.togglePopover.bind(this)} title={pydio.MessageHash['searchengine.advanced-filter.tooltip']} style={{...styles.filterButton, ...formStyles.filterButton, ...filterActiveStyles}}>
                        <span className={"mdi mdi-filter"}/>
                        {filtersCount > 0 && <span>{filtersCount}</span>}
                    </div>
                }
            </div>
        );
    }

}

export default UnifiedSearchForm
