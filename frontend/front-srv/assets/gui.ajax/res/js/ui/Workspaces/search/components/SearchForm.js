/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React, {Component} from 'react'

import FilePreview from '../../views/FilePreview'
import AdvancedSearch from './AdvancedSearch'

import Pydio from 'pydio'
import AjxpNode from 'pydio/model/node'
import EmptyNodeProvider from 'pydio/model/empty-node-provider'
import LangUtils from 'pydio/util/lang'
import SearchApi from 'pydio/http/search-api'

const {EmptyStateView} = Pydio.requireLib('components');
const {PydioContextConsumer} = require('pydio').requireLib('boot');

import SearchScopeSelector from './SearchScopeSelector'
import MainSearch from './MainSearch'

import {Paper, FlatButton, IconButton} from 'material-ui';

import {debounce} from 'lodash';

/**
 * Multi-state search component
 */
class SearchForm extends Component {

    constructor(props) {
        super(props);

        // Create Fake DM
        const clearDataModel = () => {
            const basicDataModel = new PydioDataModel(true);
            let rNodeProvider = new EmptyNodeProvider();
            basicDataModel.setAjxpNodeProvider(rNodeProvider);
            const rootNode = new AjxpNode("/", false, '', '', rNodeProvider);
            basicDataModel.setRootNode(rootNode);
            return basicDataModel;
        };

        const {dataModel} = this.props;

        this.state = {
            values: (props.advancedPanel && props.values ? props.values : {}),
            display: props.advancedPanel ? 'advanced' : 'closed',
            dataModel: dataModel || clearDataModel(),
            empty: true,
            loading: false,
            searchScope: props.uniqueSearchScope || props.searchScope || 'folder',
            additional_limit: 9
        };

        this.setMode = debounce(this.setMode, 250);
        this.update = debounce(this.update, 500);
        this.submit = debounce(this.submit, 500);

        this.props.pydio.observe('repository_list_refreshed', () => {
            if(!props.advancedPanel){
                this.setState({
                    values: {},
                    display:'closed',
                    dataModel: dataModel || clearDataModel(),
                    empty: true,
                    loading: false
                });
            }
        });

        if(props.advancedPanel && props.values && Object.keys(props.values).length){
            this.submit();
        }

    }

    componentDidUpdate(prevProps, prevState) {
        if(this.refs.results && this.refs.results.refs.list){
            this.refs.results.refs.list.updateInfiniteContainerHeight();
            FuncUtils.bufferCallback('search_results_resize_list', 550, ()=>{
                try{
                    this.refs.results.refs.list.updateInfiniteContainerHeight();
                }catch(e){}
            });
        }
    }

    setMode(mode) {
        if (mode === 'small' && this.state.display !== 'closed') {
            // we can only set to small when the previous state was closed
            return
        }
        if(mode === 'small' && this.state.display === 'closed'){
            let {basenameOrContent, ...otherValues} = this.state.values;
            if(otherValues && Object.keys(otherValues).length){
                mode = 'advanced';
            }
        }
        this.setState({
            display: mode
        })
    }

    update(newValues) {
        const {onUpdateState, searchScope} = this.props;
        let values = {
            ...this.state.values,
            ...newValues
        };

        // Removing empty values
        Object.keys(values).forEach((key) => (!values[key]) && delete values[key]);

        this.setState({values}, this.submit);
        if(onUpdateState){
            onUpdateState({searchScope, values});
        }
    }

    changeSearchScope(scope){
        const {onUpdateState} = this.props;
        const {display, values} = this.state;
        if(display === 'small') {
            setTimeout(()=>this.setMode('small'), 250);
        }
        this.setState({searchScope:scope}, this.submit);
        if(onUpdateState){
            onUpdateState({searchScope: scope, values});
        }
    }

    loadMoreSearchResults() {
        const {additional_limit} = this.state;
        this.setState({additional_limit: additional_limit + 50}, this.submit)
    }

    submit() {
        const {display, values, searchScope, dataModel, additional_limit} = this.state;
        const {crossWorkspace, uniqueSearchScope} = this.props;
        const limit = (crossWorkspace || uniqueSearchScope || searchScope === 'all') ? additional_limit : (display === 'small' ? 9 : 100);
        const rootNode = dataModel.getRootNode();
        rootNode.setChildren([]);
        rootNode.setLoaded(false);

        const keys = Object.keys(values);
        if (keys.length === 0 || (keys.length === 1 && keys[0] === 'basenameOrContent' && !values['basenameOrContent'])) {
            this.setState({loading: false,empty: true});
            return;
        }

        this.setState({loading: true, empty: false});
        rootNode.setLoading(true);
        rootNode.notify("loading");
        const api = new SearchApi(this.props.pydio);
        api.search(values, crossWorkspace? 'all' : searchScope, limit).then(response => {
            rootNode.setChildren(response.Results);
            rootNode.setLoading(false);
            rootNode.setLoaded(true);
            rootNode.notify("loaded");
            this.setState({loading: false});
        }).catch(()=>{
            rootNode.setLoading(false);
            rootNode.notify("loaded");
            this.setState({loading: false});
        });

    }


    render() {

        const {crossWorkspace, pydio, getMessage, advancedPanel, onOpenAdvanced, onCloseAdvanced, id, xtraSmallScreen} = this.props;
        const {searchScope, display, loading, dataModel, empty, values} = this.state;

        let renderSecondLine = null, renderIcon = null, elementHeight = 49;
        if (display !== 'small' && display !== 'closed') {
            elementHeight = PydioComponents.SimpleList.HEIGHT_TWO_LINES + 10;
            renderSecondLine = (node) => {
                let path = node.getPath();
                if(searchScope === 'folder'){
                    const crtFolder = pydio.getContextHolder().getContextNode().getPath();
                    if(path.indexOf(crtFolder) === 0){
                        path = './' + LangUtils.trimLeft(path.substr(crtFolder.length), '/');
                    }
                }
                return <div>{path}</div>
            };
            renderIcon = (node, entryProps = {}) => {
                return <FilePreview loadThumbnail={!entryProps['parentIsScrolling']} node={node}/>;
            };
        }else{
            renderIcon = (node, entryProps = {}) => {
                return <FilePreview loadThumbnail={false} richPreview={false} node={node}
                                    style={{width:30,height:30, borderRadius:'50%',margin:'9px 6px'}}
                                    mimeFontStyle={{fontSize: 16, display: 'block', padding: '4px 7px'}}
                />;
            };
        }

        const nodeClicked = (node)=>{
            pydio.goTo(node);
            if(advancedPanel){
                const targetRepo = node.getMetadata().get('repository_id');
                if(targetRepo && targetRepo !== pydio.user.activeRepository){
                    onCloseAdvanced();
                }
            } else {
                this.setMode('closed');
            }
        };

        let style = {...this.props.style, backgroundColor:'transparent'};
        let searchResultsStyle = {};
        if(display !== 'closed' && !advancedPanel){
            searchResultsStyle = {
                backgroundColor:'white',
                position:'absolute',
                right: 0,
                display:'block',
                width: 256
            };
        }
        if(xtraSmallScreen){
            searchResultsStyle.width = '100%';
            searchResultsStyle.flex = 2;
        }

        const results = (
            <Paper className="search-results" zDepth={advancedPanel?0:2} style={searchResultsStyle} rounded={!advancedPanel}>
                {empty &&
                    <EmptyStateView
                        iconClassName=""
                        primaryTextId={611}
                        style={{minHeight: 180, backgroundColor: 'transparent', padding:'0 20px'}}
                    />
                }
                <PydioComponents.NodeListCustomProvider
                    ref="results"
                    className={display !== 'small' ? 'files-list' : null}
                    elementHeight={elementHeight}
                    entryRenderIcon={renderIcon}
                    entryRenderActions={function () {
                        return null
                    }}
                    entryRenderSecondLine={renderSecondLine}
                    presetDataModel={dataModel}
                    heightAutoWithMax={advancedPanel ? 0 : 500}
                    openCollection={nodeClicked}
                    nodeClicked={nodeClicked}
                    defaultGroupBy={(crossWorkspace || searchScope === 'all') ? 'repository_id' : null }
                    groupByLabel={(crossWorkspace || searchScope === 'all') ? 'repository_display' : null }
                    emptyStateProps={{
                        iconClassName: "",
                        primaryTextId: loading? 'searchengine.searching':478,
                        style: {
                            minHeight: (display === 'small' ? 180 : ( advancedPanel ? 240 : 412 )),
                            backgroundColor: 'transparent',
                            padding: '0 20px'
                        },
                        secondaryTextId: (searchScope === 'ws' ? 620 : (searchScope === 'folder' ? 619 : null)),
                        actionLabelId: (searchScope === 'ws' ? 610 : (searchScope === 'folder' ? 609 : null)),
                        actionCallback: (searchScope !== 'all' ? () => {
                            this.changeSearchScope(searchScope === 'ws' ? 'all' : 'ws');
                        } : null),
                        actionStyle: {marginTop: 10}
                    }}
                />

                {display === 'small' &&
                <div style={{display:'flex', alignItems:'center', padding:4, paddingTop: 0, backgroundColor:'#eeeeee', width:'100%'}}>
                    {!crossWorkspace && !this.props.uniqueSearchScope &&  <SearchScopeSelector style={{flex: 1}} labelStyle={{paddingLeft: 8}} value={searchScope} onChange={(scope)=>{this.changeSearchScope(scope)}} onClick={() => this.setMode('small')}/>}
                    <FlatButton style={{marginTop: 4, minWidth:0}} labelStyle={{padding:'0 8px'}} primary={true} label={getMessage(456)} onClick={() => {this.loadMoreSearchResults()}}/>
                </div>
                }
            </Paper>
        );

        if (advancedPanel) {
            return (
                <Paper ref="root" zDepth={0} className={"top_search_form " + display} style={style} id={id}>
                    <div style={{display:'flex', alignItems:'center', padding:'0 8px 8px', height: 44, width: '100%', backgroundColor:'#eee', borderBottom:'1px solid #e0e0e0'}}>
                        {!crossWorkspace && !this.props.uniqueSearchScope &&  <div style={{flex:1, height:48}}><SearchScopeSelector labelStyle={{paddingLeft: 8}} value={searchScope} onChange={(scope)=>{this.changeSearchScope(scope)}}/></div>}
                        <IconButton
                            iconClassName={"mdi mdi-close"}
                            style={{minWidth:0, marginTop: 4}}
                            tooltip={getMessage(86)}
                            onClick={() => {onCloseAdvanced()}}
                        />
                    </div>
                    <div style={{flex:1, display:'flex',  flexDirection:xtraSmallScreen?'column':'row', overflow:'hidden'}}>
                        <AdvancedSearch
                            {...this.props}
                            values={values}
                            onChange={(values) => this.update(values)}
                            onSubmit={() => this.submit()}
                            rootStyle={xtraSmallScreen?{flex:1, width: '100%', borderRight:0}:{}}
                        />
                        {results}
                    </div>
                </Paper>
            );
        } else {
            const {formStyles} = this.props;
            return (
                <Paper ref="root" zDepth={0} className={"top_search_form " + display} style={style} id={id}>
                    <MainSearch
                        mode={display}
                        value={values.basenameOrContent}
                        onOpen={() => this.setMode("small")}
                        onClose={() => this.setMode("closed")}
                        showAdvanced={!crossWorkspace}
                        onAdvanced={onOpenAdvanced}
                        onChange={(values) => this.update(values)}
                        onSubmit={() => this.submit()}
                        hintText={getMessage(crossWorkspace || searchScope === 'all' ? 607 : 87 ) + "..."}
                        loading={loading}
                        scopeSelectorProps={crossWorkspace || this.props.uniqueSearchScope ? null : {
                            value:searchScope,
                            onChange:this.changeSearchScope.bind(this)
                        }}
                        {...formStyles}
                    />
                    {results}
                </Paper>
            );

        }
    }
}


SearchForm = PydioContextConsumer(SearchForm);
export default SearchForm
