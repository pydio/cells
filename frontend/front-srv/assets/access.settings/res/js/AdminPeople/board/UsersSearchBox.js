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
import PropTypes from 'prop-types';

import Pydio from 'pydio';
import React from 'react'
import {IconButton, TextField} from 'material-ui'
import debounce from 'lodash.debounce'
import PydioApi from 'pydio/http/api'
import PydioDataModel from 'pydio/model/data-model'
import Node from 'pydio/model/node'
import LangUtils from 'pydio/util/lang';
const {ModernTextField} = Pydio.requireLib('hoc');


/**
 * Search input building a set of query parameters and calling
 * the callbacks to display / hide results
 */
class UsersSearchBox extends React.Component{

    constructor(props){
        super(props);
        const dm = new PydioDataModel();
        dm.setRootNode(new Node());
        this.state = {
            dataModel: dm,
            displayResult:props.displayResultsState,
            crtValue: ''
        };
        this.searchDebounced = debounce(this.triggerSearch, 350);
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
        const value = this.state.crtValue;
        if(!value) {
            this.hideResultsState();
            try{
                this.refs.query.refs.input.blur();
            } catch (e) {

            }
            return;
        }
        const dm = this.state.dataModel;
        const {limit = 100, filterQueries} = this.props;

        dm.getRootNode().setChildren([]);
        const p1 = PydioApi.getRestClient().getIdmApi().listGroups('/', value, true, 0, limit);
        const p2 = PydioApi.getRestClient().getIdmApi().listUsers('/', value, true, 0, limit, filterQueries);
        Promise.all([p1, p2]).then(result => {
            const groups = result[0];
            const users = result[1];
            groups.Groups.map(group => {
                const label = (group.Attributes && group.Attributes['displayName']) ? group.Attributes['displayName'] : group.GroupLabel;
                const gNode = new Node('/idm/users' + LangUtils.trimRight(group.GroupPath, '/') + '/' + group.GroupLabel, false, label);
                gNode.getMetadata().set('IdmUser', group);
                gNode.getMetadata().set('ajxp_mime', 'group');
                dm.getRootNode().addChild(gNode);
            });
            users.Users.map(user => {
                const label = (user.Attributes && user.Attributes['displayName']) ? user.Attributes['displayName'] : user.Login;
                const uNode = new Node('/idm/users/' + user.Login, true, label);
                uNode.getMetadata().set('IdmUser', user);
                uNode.getMetadata().set('ajxp_mime', 'user_editable');
                dm.getRootNode().addChild(uNode)
            });
            dm.getRootNode().setLoaded(true);
            this.displayResultsState();
            this.props.displayResults(value, dm, () => this.triggerSearch(), () => this.setState({crtValue: ''}));
        });
    }

    keyDown(event){
        if(event.key === 'Enter'){
            event.preventDefault();
            this.triggerSearch();
        } else {
            this.searchDebounced();
        }
    }

    render(){
        const {crtValue} = this.state;
        const {filterButton} = this.props;

        return (
            <div className={(this.props.className?this.props.className:'')} style={{display:'flex', alignItems:'center', justifyContent:'center', ...this.props.style}}>
                <div style={{flex: 1, maxWidth: 420}}>
                    <form autoComplete={"off"}>
                    <ModernTextField
                        ref={"query"}
                        onKeyDown={this.keyDown.bind(this)}
                        hintText={this.props.textLabel}
                        fullWidth={true}
                        value={crtValue}
                        onChange={(e,v) => {this.setState({crtValue: v})}}
                        variant={"compact"}
                    />
                    </form>
                </div>
                {filterButton}
            </div>
        );
    }

}

UsersSearchBox.PropTypes = {
    textLabel:PropTypes.string,
    displayResults:PropTypes.func,
    hideResults:PropTypes.func,
    displayResultsState:PropTypes.bool,
    limit:PropTypes.number,
    style:PropTypes.object
};

export {UsersSearchBox as default}

