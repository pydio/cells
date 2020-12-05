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

import {Component} from 'react'
import Pydio from 'pydio'
import {Paper, FontIcon, TextField, CircularProgress} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import PydioDataModel from 'pydio/model/data-model'
import SearchApi from 'pydio/http/search-api'
import EmptyNodeProvider from 'pydio/model/empty-node-provider'
import _ from 'lodash';

const {SimpleList} = Pydio.requireLib('components');
const {PydioContextConsumer} = Pydio.requireLib('boot');
const {FilePreview} = Pydio.requireLib('workspaces');

class HomeSearchForm extends Component{

    constructor(props) {
        super(props)

        // Create Fake DM
        this.basicDataModel = new PydioDataModel(true);
        let rNodeProvider = new EmptyNodeProvider();
        this.basicDataModel.setAjxpNodeProvider(rNodeProvider);
        const rootNode = new AjxpNode("/", false, '', '', rNodeProvider);
        this.basicDataModel.setRootNode(rootNode);

        this.state = {
            queryString: '',
            dataModel: this.basicDataModel,
            empty: true,
            loading: false
        };

        this.submit = _.debounce(this.submit, 500)
    }

    update(queryString) {
        this.setState({queryString}, ()=>{this.submit()});
    }

    submit(forceValue = null) {
        let {queryString} = this.state;
        if(forceValue) queryString = forceValue;
        if (!queryString) {
            this.setState({empty: true, loading: false});
            return;
        }
        const {dataModel} = this.state;
        const rootNode = dataModel.getRootNode();
        rootNode.setChildren([]);
        rootNode.setLoaded(true);
        this.setState({loading: true, empty: false});

        const api = new SearchApi(this.props.pydio);
        api.search({basenameOrContent: queryString}, 'all', this.props.limit || 10).then(response => {
            rootNode.setChildren(response.Results);
            rootNode.setLoaded(true);
            this.setState({
                loading: false,
                facets: response.Facets||[]
            });
        }).catch(e => {
            this.setState({loading: false})
        });

    }

    render(){

        const {loading, dataModel, empty, queryString, searchFocus} = this.state;
        const {style, zDepth, pydio, muiTheme} = this.props;
        const hintText = pydio.MessageHash[607];
        //const accent2Color = muiTheme.palette.primary1Color;
        const whiteTransp = 'rgba(0,0,0,.53)';
        const white = 'rgb(255,255,255)';

        const styles = {
            textFieldContainer: {
                display:'flex',
                backgroundColor: '#eceff1',
                height: 50,
                width:'96%',
                maxWidth:600,
                padding: '2px 4px 4px 4px',
                borderRadius: 50,
                position:'absolute',
                top: -25
            },
            textField: {flex: 1},
            textInput: {color: 'inherit'},
            textHint : {color: whiteTransp, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%'},
            magnifier: {color: whiteTransp, fontSize: 20, padding:'14px 8px'},
            close: {color: whiteTransp, fontSize: 20, padding:'14px 8px', cursor: 'pointer'}
        };


        const renderIcon = (node, entryProps = {}) => {
            return <FilePreview loadThumbnail={!entryProps['parentIsScrolling']} node={node}/>;
        };
        const renderSecondLine = (node) => {
            let path = node.getPath();
            return <div>{path}</div>
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
                <Paper zDepth={searchFocus || queryString ? 1 : 0} style={styles.textFieldContainer} className="home-search-form">
                    <FontIcon className="mdi mdi-magnify" style={styles.magnifier}/>
                    <TextField
                        ref={(input) => this.input = input}
                        style={styles.textField}
                        inputStyle={styles.textInput}
                        hintStyle={styles.textHint}
                        fullWidth={true}
                        underlineShow={false}
                        hintText={hintText}
                        value={queryString}
                        onChange={(e,v) => this.update(v)}
                        onKeyPress={(e) => (e.key === 'Enter' ? this.update(e.target.value) : null)}
                        onFocus={()=>{this.setState({searchFocus: true})}}
                        onBlur={()=>{this.setState({searchFocus: false})}}
                    />
                    {loading &&
                        <div style={{marginTop:14, marginRight: 8}} ><CircularProgress size={20} thickness={2}/></div>
                    }
                    {queryString && !loading &&
                        <FontIcon className="mdi mdi-close" style={styles.close} onTouchTap={()=>this.update('')}/>
                    }
                </Paper>
                {!empty &&
                    <PydioComponents.NodeListCustomProvider
                        ref="results"
                        containerStyle={{width:'86%', maxWidth:550, marginTop: 20}}
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
                            primaryTextId:478,
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

HomeSearchForm = PydioContextConsumer(HomeSearchForm);
HomeSearchForm = muiThemeable()(HomeSearchForm);
export {HomeSearchForm as default}