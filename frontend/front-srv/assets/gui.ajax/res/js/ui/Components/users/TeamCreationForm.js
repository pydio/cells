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
import PydioApi from 'pydio/http/api'
import { Component } from "react";
import {FlatButton} from "material-ui";
const {PydioContextConsumer} = Pydio.requireLib('boot');
const {ModernTextField} = Pydio.requireLib('hoc');

/**
 * Simple form for creating a team
 */
class TeamCreationForm extends Component{

    constructor(props, context){
        super(props, context);
        this.state = {value : ''};
    }

    onChange(e,value){
        this.setState({value: value});
    }

    submitCreationForm(){
        const value = this.state.value;
        PydioApi.getRestClient().getIdmApi().saveSelectionAsTeam(value, [], this.props.onTeamCreated);
    }

    render(){

        const {getMessage} = this.props;

        return (
            <div>
                <div style={{padding: 20}}>
                    <div>{getMessage(591)}</div>
                    <ModernTextField
                        focusOnMount={true}
                        floatingLabelText={getMessage(578)}
                        value={this.state.value}
                        onChange={this.onChange.bind(this)}
                        fullWidth={true}
                        onKeyPress={(ev) => {if(ev.key==='Enter'){
                            this.submitCreationForm();
                        }}}
                        variant={"v2"}
                    />
                </div>
                <div>
                    <div style={{textAlign:'right', padding: 8}}>
                        <FlatButton label={getMessage(49)} onClick={this.props.onCancel.bind(this)} />
                        <FlatButton label={getMessage(579)} primary={true} onClick={this.submitCreationForm.bind(this)} />
                    </div>
                </div>
            </div>
        );
    }

}

TeamCreationForm.propTypes = {
    /**
     * Callback triggered after team creation succeeded
     */
    onTeamCreated   : PropTypes.func.isRequired,
    /**
     * Request modal close
     */
    onCancel        : PropTypes.func.isRequired
};

TeamCreationForm = PydioContextConsumer(TeamCreationForm);

export {TeamCreationForm as default}