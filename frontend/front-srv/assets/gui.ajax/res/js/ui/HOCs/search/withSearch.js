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
import Node from 'pydio/model/node'
import ResourcesManager from 'pydio/http/resources-manager'
import emptyDataModel from "./emptyDataModel";
import {debounce} from 'lodash';
import SearchApi from 'pydio/http/search-api'
import uuid from 'uuid4'
import deepEqual from 'deep-equal'
import nlpMatcher from './nlpMatcher'

const SearchConstants = {
    KeyBasename         : 'basename',
    KeyBasenameOrContent: 'basenameOrContent',
    KeyContent          : 'Content',
    KeyScope            : 'scope',
    KeyMime             : 'ajxp_mime',
    ValueMimeFiles      : 'ajxp_file',
    ValueMimeFolders    : 'ajxp_folder',
    KeyModifDate        : 'ajxp_modiftime',
    KeyBytesize         : 'ajxp_bytesize',
    KeyMetaPrefix       : 'ajxp_meta_',
    KeyMetaShared       : 'ajxp_meta_shared_resource_type',
    MimeGroups: [
        {id: "word", label:"word", mimes: "*word*"},
        {id: "excel", label:"spreadsheet", mimes: "*spreadsheet*|*excel*"},
        {id: "presentation", label:"presentation", mimes: "*presentation*|*powerpoint*"},
        {id: "pdfs", label:"pdf", mimes: "\"application/pdf\""},
        {id: "images", label:"image", mimes: "\"image/*\""},
        {id: "videos", label:"video", mimes: "\"video/*\""},
        {id: "audios", label:"audio", mimes: "\"audio/*\""}
    ],
    MimeGroupsMessage : (id) => 'ajax_gui.mimegroup.' + id
}

export {SearchConstants};


export default function withSearch(Component, historyIdentifier, defaultScope){

    return class WithSearch extends React.Component {

        constructor(props) {
            super(props);
            this.performSearchD = debounce(this.performSearch.bind(this), 500)
            let {values = {}} = props;
            values = {scope: props.scope || defaultScope , ...values};
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

        /**
         * @return Promise
         */
        getSearchOptions() {
            return ResourcesManager.loadClass('ReactMeta').then(rm => {
                const {MetaClient, Renderer} = rm;
                return MetaClient.getInstance().loadConfigs().then(configs => {
                    const options = {
                        indexedMeta: [],
                        indexedContent:Pydio.getInstance().getPluginConfigs("meta.user").get("indexContent"),
                    }
                    configs.forEach((v,k) => {
                        if(v.indexable) {
                            v.namespace = k
                            v.renderer = Renderer.typeFormRenderer(v.type)
                            const o = Renderer.typeColumnRenderer(v.type)
                            if(o && o.renderComponent) {
                                // create simpler signature
                                v.blockRenderer = (value) => {
                                    const n = new Node()
                                    n.getMetadata().set(v.namespace, value)
                                    return o.renderComponent(n, {name:v.namespace})
                                }
                            }
                            options.indexedMeta.push(v)
                        }
                    })
                    return options;
                })
            })
        }

        humanize(values) {
            let s;
            let typeScope;
            const {
                [SearchConstants.KeyBasenameOrContent]:basenameOrContent,
                [SearchConstants.KeyScope]:scope,
                [SearchConstants.KeyMime]:mime,
                searchLABEL, ...others} = values
            if(searchLABEL) {
                return searchLABEL;
            }
            typeScope = '';
            if(mime === SearchConstants.ValueMimeFolders){
                typeScope = 'folders'
            } else if (mime) {
                typeScope = '%s files'.replace('%s', mime)
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
            } else if (scope === 'previous_context') {
                s += ' in current folder'
            }
            return s;
        }

        computePreviousContext(dataModel) {
            return Pydio.getInstance().user.getActiveRepositoryObject().getSlug() + dataModel.getContextNode().getPath();
        }

        performSearch() {
            const {values, limit, dataModel, activeFacets} = this.state;
            const searchRootNode = dataModel.getSearchNode();
            searchRootNode.getMetadata().set('search_values', values);
            searchRootNode.getMetadata().set('active_facets', activeFacets);
            if(dataModel.getContextNode() !== searchRootNode){
                searchRootNode.getMetadata().set('previous_context', this.computePreviousContext(dataModel))
            }
            searchRootNode.observeOnce("loaded", ()=> {
                dataModel.setContextNode(searchRootNode, true);
            })
            searchRootNode.setChildren([]);
            searchRootNode.setLoaded(false);
            let {scope, ...searchValues} = values;
            if(scope === 'previous_context' && searchRootNode.getMetadata().get('previous_context')) {
                scope = searchRootNode.getMetadata().get('previous_context');
                this.setState({previousContext: scope})
            }

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
                res.forEach((node, i) => {
                    searchRootNode.addChild(node, i+':'+node.getPath())
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
            const {values={}, dataModel, previousContext} = this.state;
            let {scope, ...other} = newValues;
            let refreshPreviousContext;
            if(scope === 'previous_context' && (values.scope && values.scope === 'previous_context') && previousContext !== this.computePreviousContext(dataModel)) {
                refreshPreviousContext = true
            }
            if(Object.keys(other).length > 0 && deepEqual(values, newValues) && !refreshPreviousContext) {
                console.info('Do not re-run the search as values have not changed yet')
                const searchRootNode = dataModel.getSearchNode();
                if(dataModel.getContextNode() !== searchRootNode){
                    searchRootNode.getMetadata().set('previous_context', this.computePreviousContext(dataModel))
                }
                dataModel.setContextNode(searchRootNode, true);
                if(onUpdateSearch){
                    onUpdateSearch({values: newValues});
                }
                return
            }
            if(!scope) {
                scope = values.scope;
            }
            this.setState({values: {scope, ...other}, facets:[], activeFacets:[]}, this.performSearchD);
            if(onUpdateSearch){
                onUpdateSearch({values: newValues});
            }
            if(newValues.basenameOrContent) {
                nlpMatcher(newValues.basenameOrContent, this.getSearchOptions.bind(this)).then(matches => {
                    this.setState({nlpMatches: matches})
                })
            } else {
                this.setState({nlpMatches: null})
            }
        }

        isDefaultScope(scope){
            if(defaultScope === 'ws' && scope === Pydio.getInstance().user.getActiveRepositoryObject().getSlug() + '/'){
                return true
            }
            return (defaultScope === scope)
        }

        getDefaultScope() {
            return defaultScope;
        }

        advancedValues() {
            const {values} = this.state;
            const types = {
                [SearchConstants.KeyScope]: 'scope',
                [SearchConstants.KeyModifDate]: 'modiftime',
                [SearchConstants.KeyBytesize]: 'bytesize',
                [SearchConstants.KeyMime]: 'mime',
                [SearchConstants.KeyMetaShared]: 'share',
            }
            return Object.keys(values)
                .filter(key => key !== 'basenameOrContent' && key !== 'searchLABEL' && key !== 'searchID')
                .filter(key => values[key])
                .filter(key => !(key === 'scope' && this.isDefaultScope(values[key])))
                .map(key => {
                    const data= {key, value: values[key]};
                    if(types[key]) {
                        data.type = types[key]
                        if(data.type === 'mime' && data.value && data.value.indexOf('mimes:') === 0) {
                            const mimes = data.value.replace('mimes:', '')
                            const mmDef = SearchConstants.MimeGroups.find((g) => g.mimes === mimes)
                            if(mmDef){
                                data.label = Pydio.getMessages()[SearchConstants.MimeGroupsMessage(mmDef.label)]
                            }
                        }
                    }
                    return data;
                })
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
                        data[SearchConstants.KeyBytesize] = {from:facet.Min, to:facet.Max}
                        break;
                    case "ModifTime":
                        data[SearchConstants.KeyModifDate] = {from:facet.Start*1000, to:facet.End*1000}
                        break;
                    case "Extension":
                        data[SearchConstants.KeyMime] = facet.Label
                        break;
                    case "NodeType":
                        data[SearchConstants.KeyMime] = 'ajxp_' + facet.Label
                        break;
                    case "TextContent":
                        data[SearchConstants.KeyBasenameOrContent] = ''
                        data[SearchConstants.KeyContent] = basenameOrContent
                        break;
                    case "Basename":
                        data[SearchConstants.KeyBasenameOrContent] = ''
                        data[SearchConstants.KeyBasename] = basenameOrContent.replace('*', '') + '*' // wildchar basename
                        break;
                    default:
                        if(facet.FieldName.indexOf('Meta.') === 0) {
                            data[SearchConstants.KeyMetaPrefix + facet.FieldName.replace('Meta.', '')] = facet.Label;
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
                        data.forEach(s => {
                            // Unserialize dates to objects
                            if(s[SearchConstants.KeyModifDate]) {
                                if(s[SearchConstants.KeyModifDate].from) {
                                    s[SearchConstants.KeyModifDate].from = new Date(s[SearchConstants.KeyModifDate].from)
                                }
                                if(s[SearchConstants.KeyModifDate].to) {
                                    s[SearchConstants.KeyModifDate].to = new Date(s[SearchConstants.KeyModifDate].to)
                                }
                            }
                        })
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
            let {values} = this.state;
            if(values && values.scope === 'ws') {
                values = {...values, scope: Pydio.getInstance().user.getActiveRepositoryObject().getSlug() + '/'}
            }
            const searchTools = {
                ...this.state,
                values,
                submitSearch:this.performSearch.bind(this),
                setValues:this.setValues.bind(this),
                setLimit:this.setLimit.bind(this),
                toggleFacet:this.toggleFacet.bind(this),
                humanizeValues:this.humanize.bind(this),
                saveSearch:this.pushSavedSearches.bind(this),
                clearSavedSearch:this.removeSavedSearch.bind(this),
                getSearchOptions:this.getSearchOptions.bind(this),
                advancedValues:this.advancedValues.bind(this),
                isDefaultScope:this.isDefaultScope.bind(this),
                getDefaultScope:this.getDefaultScope.bind(this),
                SearchConstants
            }

            return (
                <Component 
                    {...this.props}
                    searchTools={searchTools}
                />
            );
        }

    }

}