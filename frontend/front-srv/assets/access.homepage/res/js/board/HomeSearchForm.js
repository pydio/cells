/*
 * Copyright 2023 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import Pydio from 'pydio'
import {Paper, IconButton, CircularProgress} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import PathUtils from 'pydio/util/path'
//import Facets from "./Facets";

const {SimpleList, NodeListCustomProvider} = Pydio.requireLib('components');
const {PydioContextConsumer, moment} = Pydio.requireLib('boot');
const {UnifiedSearchForm, Facets, FilePreview, AdvancedChips} = Pydio.requireLib('workspaces');
const {withSearch} = Pydio.requireLib('hoc')

class HomeSearchForm extends Component{

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {onFocusChange} = this.props;
        this._escListener = (e) => {
            if(e.key === 'Escape'){
                onFocusChange(false)
            }
        }
        document.addEventListener("keyup", this._escListener)
    }

    componentWillUnmount() {
        document.removeEventListener("keyup", this._escListener)
    }

    update(queryString) {
        const {searchTools:{setValues}} = this.props;
        setValues({basenameOrContent:queryString});
    }

    render(){

        // From HOC
        const {searchTools, searchTools:{facets, activeFacets, toggleFacet, loading, dataModel, empty}} = this.props;
        const {style, zDepth, pydio, fullScreen, onFocusChange} = this.props;

        const whiteTransp = 'rgba(0,0,0,.53)';

        const styles = {
            mainContainer: {
                width:'100%',
                position:'absolute',
                top: fullScreen? 0 : 199,
                bottom: 0,
                transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
                display:'flex',
                flexDirection:'column',
                alignItems:'center'
            },
            searchContainer: {
                width: '100%',
                zIndex: 1,
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
                backgroundColor:'transparent',
                padding: fullScreen ? 10: 0
            },
            textFieldContainer: {
                width:'96%',
                maxWidth:700,
                display:'flex',
                alignItems:'center',
                backgroundColor: '#eceff1',
                height: fullScreen?40:50,
                padding: '2px 4px',
                borderRadius: 50,
                marginTop:fullScreen?0:-25
            },
            textField: {flex: 1},
            textInput: {color: 'inherit'},
            textHint : {color: whiteTransp, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%'},
            magnifier: {color: whiteTransp, fontSize: 20, padding:'14px 8px'},
            close: {position:'absolute', right:0, zIndex: 2},
            searchForm:{
                mainStyle:{
                    backgroundColor:'transparent',
                    height: 48,
                    border: 0
                },
                completeMenuStyle:{width: '100%'},
                inputStyle:{fontSize: 18},
                hintStyle:{fontSize: 18},
                magnifierStyle:{fontSize: 20, color:'rgba(0,0,0,0.73)', marginRight: 10}, //{color: appBarTextColor.fade(0.1).toString()},
                filterButton:{
                    color:'#03a9f4',
                    fontSize: 22,
                    width:24,
                    height: 24
                },
                filterButtonActive:{},
            },
            facets: {
                container: {
                    width: 230,
                    overflowY: 'auto',
                    color: '#5c7784',
                    paddingLeft: 16,
                    paddingRight: 16,
                    paddingTop: 10
                },
                header : {
                    fontWeight: 500,
                    padding: '10px 0',
                    fontSize: 15
                },
                subHeader:  {
                    fontWeight: 500,
                    textTransform:'uppercase',
                    padding: '12px 0'
                }
            }
        };


        const renderIcon = (node, entryProps = {}) => {
            return <FilePreview loadThumbnail={!entryProps['parentIsScrolling']} node={node}/>;
        };
        const renderSecondLine = (node) => {
            let path = node.getPath();
            const metaData = node.getMetadata();
            let date = new Date();
            date.setTime(parseInt(metaData.get('ajxp_modiftime'))*1000);
            const mDate = moment(date).fromNow();
            let bSize;
            if(parseInt(node.getMetadata().get('bytesize'))) {
                bSize = PathUtils.roundFileSize(parseInt(node.getMetadata().get('bytesize')))
            }
            const dir = PathUtils.getDirname(path)
            let location
            if(dir){
                location = pydio.MessageHash['user_home.search.result.location'] + ': ' + PathUtils.getDirname(path) || '/';
            }
            return <div>{mDate} {bSize?(<span>&bull; {bSize}</span>):''} {location ? <span>&bull; {location}</span> : null}</div>
        };
        const renderGroupHeader = (repoId, repoLabel) =>{
            return (
                <div style={{fontSize: 13,color: '#93a8b2',fontWeight: 500, cursor: 'pointer'}} onClick={() => pydio.triggerRepositoryChange(repoId)}>
                    {repoLabel}
                </div>
            );
        };

        return (
            <Paper style={style} zDepth={zDepth} className="vertical-layout home-center-paper" rounded={false}>

                <div style={styles.mainContainer}>
                    <Paper zDepth={fullScreen?1:0} rounded={false} style={styles.searchContainer}>
                        <Paper zDepth={0} style={styles.textFieldContainer} className="home-search-form">
                            <UnifiedSearchForm
                                style={{flex: 1}}
                                active={fullScreen}
                                pydio={pydio}
                                formStyles={styles.searchForm}
                                searchTools={searchTools}
                                onRequestOpen={()=>onFocusChange(true)}
                                onRequestClose={()=>onFocusChange(false)}
                            />
                            {loading && <div style={{marginTop:14, marginRight: 8}} ><CircularProgress size={20} thickness={2}/></div>}
                        </Paper>
                        {fullScreen && <AdvancedChips searchTools={searchTools} containerStyle={{paddingTop: 11, marginBottom: -4}}/>}
                    </Paper>
                    {fullScreen &&
                        <div className={"layout-fill"} style={{width: '100%', display:'flex'}}>
                            {!empty && facets && facets.length > 0 && <Facets facets={facets} activeFacets={activeFacets} pydio={pydio} onToggleFacet={toggleFacet} styles={styles.facets}/>}
                            <NodeListCustomProvider
                                containerStyle={{flex:1, marginLeft: 10}}
                                className={'files-list vertical_fit'}
                                elementHeight={SimpleList.HEIGHT_TWO_LINES}
                                entryRenderIcon={renderIcon}
                                entryRenderActions={function() {return null}}
                                entryRenderSecondLine={renderSecondLine}
                                entryRenderGroupHeader={renderGroupHeader}
                                presetDataModel={dataModel}
                                presetRootNode={dataModel.getSearchNode()}
                                openCollection={(node) => {pydio.goTo(node)}}
                                nodeClicked={(node) => {pydio.goTo(node)}}
                                defaultGroupBy="repository_id"
                                groupByLabel="repository_display"
                                emptyStateProps={{
                                    iconClassName:"",
                                    primaryTextId:loading?'searchengine.searching':478,
                                    style:{backgroundColor: 'transparent'}
                                }}
                            />
                        </div>
                    }
                    <div style={{display:fullScreen?'none':'block', flex:1, overflowY:'auto', marginTop: 40}} id="history-block">{this.props.children}</div>
                </div>
                {fullScreen &&
                <IconButton
                    iconClassName="mdi mdi-close"
                    style={styles.close}
                    onClick={()=>onFocusChange(false)}
                    tooltipPosition={"bottom-left"}
                    tooltip={pydio.MessageHash['86']}
                />
                }
            </Paper>
        );

    }


}

HomeSearchForm = withSearch(HomeSearchForm, 'home', 'all');
HomeSearchForm = PydioContextConsumer(HomeSearchForm);
HomeSearchForm = muiThemeable()(HomeSearchForm);
export {HomeSearchForm as default}