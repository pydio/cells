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
import React from 'react'
import {IconButton, TextField} from 'material-ui'
import debounce from 'lodash.debounce'

/**
 * Search input building a set of query parameters and calling
 * the callbacks to display / hide results
 */
class SearchBox extends React.Component{

    constructor(props){
        super(props);
        const dm = new PydioDataModel();
        dm.setRootNode(new AjxpNode());
        this.state = {
            dataModel: dm,
            displayResult:props.displayResultsState,
        };
        this.searchDebounced = debounce(this.triggerSearch, 500);
    }

    displayResultsState(){
        this.setState({
            displayResult:true
        });
    }

    hideResultsState(){
        this.setState({
            displayResult:false
        });
        this.props.hideResults();
    }

    triggerSearch(){
        const value = this.refs.query.getValue();
        if(!value) {
            this.hideResultsState();
            this.refs.query.blur();
            return;
        }
        const dm = this.state.dataModel;
        let params = this.props.parameters;
        params[this.props.queryParameterName] = value;
        params['limit'] = this.props.limit || 100;
        dm.getRootNode().setChildren([]);
        PydioApi.getClient().request(params, function(transport){
            let remoteNodeProvider = new RemoteNodeProvider({});
            remoteNodeProvider.parseNodes(dm.getRootNode(), transport);
            dm.getRootNode().setLoaded(true);
            this.displayResultsState();
            this.props.displayResults(value, dm);
        }.bind(this));
    }

    keyDown(event){
        if(event.key === 'Enter'){
            this.triggerSearch();
        } else {
            this.searchDebounced();
        }
    }

    render(){
        return (
            <div className={(this.props.className?this.props.className:'')} style={{display:'flex', alignItems:'center', maxWidth:220, ...this.props.style}}>
                <div style={{flex: 1}}>
                    <TextField ref="query" onKeyDown={this.keyDown.bind(this)} floatingLabelText={this.props.textLabel} fullWidth={true}/>
                </div>
                <div style={{paddingTop:22, opacity:0.3}}>
                    <IconButton
                        ref="button"
                        onTouchTap={this.triggerSearch.bind(this)}
                        iconClassName="mdi mdi-account-search"
                        tooltip="Search"
                    />
                </div>
            </div>
        );
    }

}

SearchBox.PropTypes = {
    // Required
    parameters:React.PropTypes.object.isRequired,
    queryParameterName:React.PropTypes.string.isRequired,
    // Other
    textLabel:React.PropTypes.string,
    displayResults:React.PropTypes.func,
    hideResults:React.PropTypes.func,
    displayResultsState:React.PropTypes.bool,
    limit:React.PropTypes.number,
    style:React.PropTypes.object
};

export {SearchBox as default}

