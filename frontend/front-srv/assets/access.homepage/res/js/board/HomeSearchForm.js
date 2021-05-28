/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import {Component} from 'react'
import Pydio from 'pydio'
import {Paper, FontIcon, IconButton, AutoComplete, CircularProgress} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import PathUtils from 'pydio/util/path'
import Facets from "./Facets";

const {SimpleList} = Pydio.requireLib('components');
const {PydioContextConsumer, moment} = Pydio.requireLib('boot');
const {FilePreview} = Pydio.requireLib('workspaces');
const {withSearch} = Pydio.requireLib('hoc')

class HomeSearchForm extends Component{

    constructor(props) {
        super(props)
    }

    update(queryString) {
        const {setValues} = this.props;
        setValues({basenameOrContent:queryString});
    }

    render(){

        // From HOC
        const {values, facets, activeFacets, toggleFacet, loading, dataModel, empty, history} = this.props;
        const {basenameOrContent:queryString} = values;
        const {searchFocus} = this.state || {};

        const {style, zDepth, pydio, fullScreen} = this.props;
        const hintText = pydio.MessageHash[607];
        const whiteTransp = 'rgba(0,0,0,.53)';

        const styles = {
            textFieldContainer: {
                display:'flex',
                backgroundColor: '#eceff1',
                height: 50,
                width:'96%',
                maxWidth:700,
                padding: '2px 4px 4px 4px',
                borderRadius: 50,
                position:'absolute',
                top: fullScreen? 25 : -25
            },
            textField: {flex: 1},
            textInput: {color: 'inherit'},
            textHint : {color: whiteTransp, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%'},
            magnifier: {color: whiteTransp, fontSize: 20, padding:'14px 8px'},
            close: {position:'absolute', right:0}
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
            const bSize = PathUtils.roundFileSize(parseInt(node.getMetadata().get('bytesize')))
            const dir = PathUtils.getDirname(path)
            let location
            if(dir){
                location = pydio.MessageHash['user_home.search.result.location'] + ': ' + PathUtils.getDirname(path) || '/';
            }
            return <div>{mDate} &bull; {bSize} {location ? <span>&bull;</span> : null} {location}</div>
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
                <Paper zDepth={searchFocus || queryString ? 1 : 0} style={styles.textFieldContainer} ref={"container"} className="home-search-form">
                    <FontIcon className="mdi mdi-magnify" style={styles.magnifier}/>
                    <AutoComplete
                        ref={(r) => {this.input = r}}
                        dataSource={history.map(k=>{return{text:k,value:k}})}
                        filter={(searchText, key) => (searchText === '' || key.indexOf(searchText) === 0) && searchText !== key }
                        openOnFocus={!queryString}
                        open={searchFocus}
                        menuProps={{desktop:true}}
                        style={styles.textField}
                        inputStyle={styles.textInput}
                        hintStyle={styles.textHint}
                        fullWidth={true}
                        underlineShow={false}
                        hintText={hintText}
                        searchText={queryString}
                        menuStyle={{maxHeight: 300}}
                        onUpdateInput={(v) => this.update(v)}
                        onKeyPress={(e) => (e.key === 'Enter' ? this.update(e.target.value) : null)}
                        onFocus={()=>{this.setState({searchFocus: true})}}
                        onBlur={()=>{this.setState({searchFocus: false})}}
                    />
                    {!loading && <div style={{width: 36}}/>}
                    {loading && <div style={{marginTop:14, marginRight: 8}} ><CircularProgress size={20} thickness={2}/></div>}
                </Paper>
                {fullScreen &&
                    <IconButton
                        iconClassName="mdi mdi-close"
                        style={styles.close}
                        onClick={()=>this.update('')}
                        tooltipPosition={"bottom-left"}
                        tooltip={pydio.MessageHash['86']}
                    />
                }
                {!empty && facets && <Facets facets={facets} selected={activeFacets} pydio={pydio} onSelectFacet={toggleFacet}/>}
                {!empty &&
                    <PydioComponents.NodeListCustomProvider
                        ref="results"
                        containerStyle={{width:'86%', maxWidth:650, marginTop: fullScreen ? 75 : 20}}
                        className={'files-list vertical_fit'}
                        elementHeight={SimpleList.HEIGHT_TWO_LINES}
                        entryRenderIcon={renderIcon}
                        entryRenderActions={function() {return null}}
                        entryRenderSecondLine={renderSecondLine}
                        entryRenderGroupHeader={renderGroupHeader}
                        presetDataModel={dataModel}
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
                }
                {this.props.children &&
                    <div style={{display:empty?'block':'none', flex:1, overflowY:'auto', marginTop: 40}} id="history-block">{this.props.children}</div>
                }

            </Paper>
        );

    }


}

HomeSearchForm = withSearch(HomeSearchForm, 'home', 'all');
HomeSearchForm = PydioContextConsumer(HomeSearchForm);
HomeSearchForm = muiThemeable()(HomeSearchForm);
export {HomeSearchForm as default}