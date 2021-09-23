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
import emptyDataModel from "./emptyDataModel";
import {debounce} from 'lodash';
import SearchApi from 'pydio/http/search-api'
import uuid from 'uuid4'


export default function withSearch(Component, historyIdentifier, scope){

    return class WithSearch extends React.Component {

        constructor(props) {
            super(props);
            this.performSearchD = debounce(this.performSearch.bind(this), 500)
            let {values = {}} = props;
            values = {scope: scope || props.scope || 'folder', ...values};
            this.state = {
                dataModel: props.dataModel || props.pydio.getContextHolder() || emptyDataModel(),
                values,
                limit: 30,
                empty: true,
                searchLoading: false,
                facets:[],
                activeFacets:[],
                history: []
            }
            if(historyIdentifier){
                this.loadHistory().then(hh => this.setState({history: hh}))
                this.loadSavedSearches().then(ss => this.setState({savedSearches: ss}))
            }
        }

        componentDidMount() {
            this._searchNodeObserver = ()=>{
                this.performSearch()
            }
            const {dataModel} = this.state;
            dataModel.getSearchNode().observe('reload_search', this._searchNodeObserver)
        }

        componentWillUnmount() {
            const {dataModel} = this.state;
            dataModel.getSearchNode().stopObserving('reload_search', this._searchNodeObserver)
        }

        componentDidUpdate(prevProps, prevState, snapshot) {
            if(prevState !== this.state) {
                const {onSearchStateChange} = this.props;
                if(onSearchStateChange) {
                    onSearchStateChange(this.state);
                }
            }
        }

        humanize(values) {
            let s;
            let typeScope;
            const {basenameOrContent, scope, ajxp_mime, searchLABEL, ...others} = values
            if(searchLABEL) {
                return searchLABEL;
            }
            typeScope = '';
            if(ajxp_mime === 'ajxp_folder'){
                typeScope = 'folders'
            } else if (ajxp_mime) {
                typeScope = '%s files'.replace('%s', ajxp_mime)
            }
            if(basenameOrContent === '*'){
                s = 'all %1'.replace('%1', typeScope || 'files and folders')
            } else if(basenameOrContent) {
                s = '%1%2'.replace('%1', basenameOrContent).replace('%2', typeScope ? ' in ' + typeScope : '')
            } else {
                s = '%1'.replace('%1', typeScope || 'files and folders')
            }
            const f = Object.keys(others).length
            if(f === 1){
                s += ' with one additional filter'
            } else if(f > 1) {
                s += ' with %1 additional filters'.replace('%1', f)
            }
            if(scope === 'ws') {
                s += ' in current workspace'
            } else if (scope === 'folder') {
                s += ' in current folder'
            }
            return s;
        }

        performSearch() {
            const {values, limit, dataModel, activeFacets} = this.state;
            const searchRootNode = dataModel.getSearchNode();
            searchRootNode.getMetadata().set('search_values', values);
            searchRootNode.getMetadata().set('active_facets', activeFacets);
            searchRootNode.observeOnce("loaded", ()=> {
                dataModel.setContextNode(searchRootNode, true);
            })
            searchRootNode.setChildren([]);
            searchRootNode.setLoaded(false);
            const {scope, ...searchValues} = values;

            const keys = Object.keys(searchValues);
            if (keys.length === 0 || (keys.length === 1 && keys[0] === 'basenameOrContent' && !values['basenameOrContent'])) {
                searchRootNode.clear();
                searchRootNode.setLoaded(true);
                searchRootNode.notify("loaded");
                this.setState({searchLoading: false,empty: true, facets:[], activeFacets:[]});
                return;
            }

            this.setState({searchLoading: true, empty: false});
            searchRootNode.setLoading(true);
            searchRootNode.notify("loading");
            const api = new SearchApi(Pydio.getInstance());
            api.search(this.mergeFacets(values, activeFacets), scope, limit).then(response => {
                searchRootNode.clear();
                const res = response.Results || []
                res.forEach(node => {
                    searchRootNode.addChild(node)
                })
                searchRootNode.setLoading(false);
                searchRootNode.setLoaded(true);
                searchRootNode.notify("loaded");
                if(historyIdentifier && values.basenameOrContent) {
                    this.pushHistory(values.basenameOrContent)
                }
                this.setState({
                    searchLoading: false,
                    facets: response.Facets ||[]
                });
            }).catch(()=>{
                searchRootNode.clear();
                searchRootNode.setLoading(false);
                searchRootNode.notify("loaded");
                this.setState({searchLoading: false});
            });

        }
        
        setValues(newValues){
            const {onUpdateSearch} = this.props;
            Object.keys(newValues).forEach(k => {
                if(!newValues[k]){
                    delete(newValues[k])
                }
            });
            let {scope, ...other} = newValues;
            if(!scope) {
                const {values} = this.state;
                scope = values.scope;
            }
            this.setState({values: {scope, ...other}, facets:[], activeFacets:[]}, this.performSearchD);
            if(onUpdateSearch){
                onUpdateSearch({values: newValues});
            }
        }

        setLimit(limit){
            this.setState({limit}, this.performSearch.bind(this));
        }

        toggleFacet(facet, toggle){
            const {activeFacets = []} = this.state;
            let newFacets = []
            if(toggle){
                newFacets = [...activeFacets, facet];
            } else {
                newFacets = activeFacets.filter(s => !(s.FieldName===facet.FieldName && s.Label === facet.Label))
            }
            this.setState({activeFacets:newFacets}, this.performSearch.bind(this))
        }

        mergeFacets(values = {}, facets = []){
            let data = {};
            const {basenameOrContent=''} = values;
            facets.forEach(facet => {
                switch (facet.FieldName){
                    case "Size":
                        data['ajxp_bytesize'] = {from:facet.Min, to:facet.Max}
                        break;
                    case "ModifTime":
                        data['ajxp_modiftime'] = {from:facet.Start*1000, to:facet.End*1000}
                        break;
                    case "Extension":
                        data['ajxp_mime'] = facet.Label
                        break;
                    case "NodeType":
                        data['ajxp_mime'] = 'ajxp_' + facet.Label
                        break;
                    case "TextContent":
                        data['basenameOrContent'] = ''
                        data['Content'] = basenameOrContent
                        break;
                    case "Basename":
                        data['basenameOrContent'] = ''
                        data['basename'] = basenameOrContent.replace('*', '') + '*' // wildchar basename
                        break;
                    default:
                        if(facet.FieldName.indexOf('Meta.') === 0) {
                            data['ajxp_meta_' + facet.FieldName.replace('Meta.', '')] = facet.Label;
                        }
                        break;
                }
            })
            return {...values, ...data};
        }


        getUserHistoryKey(){
            return Pydio.getInstance().user.getIdmUser().then(
                u => "cells.search-engine." + historyIdentifier + "." + u.Uuid
            );
        }

        loadHistory(){
            return this.getUserHistoryKey().then(key => {
                const i = localStorage.getItem(key)
                if(!i) {
                    return []
                }
                try {
                    const data = JSON.parse(i)
                    if(data.map){
                        return data;
                    }
                    return [];
                }catch (e){
                    return []
                }
            })
        }

        pushHistory(term){
            if(!term){
                return
            }
            const {history = []} = this.state;
            const newHistory = history.filter(f => f !== term).slice(0, 19); // store only 20 terms
            newHistory.unshift(term);
            this.getUserHistoryKey().then(key => {
                this.setState({history: newHistory}, () => {
                    localStorage.setItem(key, JSON.stringify(newHistory));
                })
            })
        }

        getSaveKey(){
            return Pydio.getInstance().user.getIdmUser().then(
                u => "cells.search-engine.saved." + historyIdentifier + "." + u.Uuid
            );
        }

        loadSavedSearches(){
            return this.getSaveKey().then(key => {
                const i = localStorage.getItem(key)
                if(!i) {
                    return []
                }
                try {
                    const data = JSON.parse(i)
                    if(data.map){
                        return data;
                    }
                    return [];
                }catch (e){
                    return []
                }
            })
        }

        pushSavedSearches(label){
            const {values, savedSearches = []} = this.state;
            const newValues = {...values, searchLABEL:label, searchID: values.searchID || uuid()};
            const newSaved = [...savedSearches.filter(vv => vv.searchID !== newValues.searchID), newValues]
            this.getSaveKey().then(key => {
                this.setState({savedSearches: newSaved}, () => {
                    localStorage.setItem(key, JSON.stringify(newSaved));
                    this.setState({values: newValues});
                })
            })
        }

        removeSavedSearch(uuid) {
            const {values, savedSearches = []} = this.state;
            const newSaved = savedSearches.filter(v => v.searchID !== uuid)
            this.getSaveKey().then(key => {
                this.setState({savedSearches: newSaved}, () => {
                    localStorage.setItem(key, JSON.stringify(newSaved));
                    if(values.searchID === uuid) {
                        const {searchID, ...others} = values;
                        this.setState({values: others})
                    }
                })
            })
        }

        render() {
            return (
                <Component 
                    {...this.props} 
                    {...this.state}
                    submitSearch={this.performSearch.bind(this)}
                    setValues={this.setValues.bind(this)}
                    setLimit={this.setLimit.bind(this)}
                    toggleFacet={this.toggleFacet.bind(this)}
                    humanizeValues={this.humanize.bind(this)}
                    saveSearch={this.pushSavedSearches.bind(this)}
                    clearSavedSearch={this.removeSavedSearch.bind(this)}
                />
            );
        }

    }

}