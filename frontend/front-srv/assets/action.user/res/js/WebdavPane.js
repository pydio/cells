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

const React = require('react')
const {Toggle, Divider, TextField, RaisedButton} = require('material-ui')
const {ClipboardTextField} = require('pydio').requireLib('components')

let WebDAVPane = React.createClass({

    componentDidMount: function(){
        this.loadPrefs();
    },
    getMessage: function(id){
        return this.props.pydio.MessageHash[id];
    },
    onToggleChange: function(event, newValue){
        PydioApi.getClient().request({
            get_action : 'webdav_preferences',
            activate   : newValue ? "true":"false"
        }, function(t){
            this.setState({preferences: t.responseJSON || {}});
            this.props.pydio.displayMessage("SUCCESS", this.props.pydio.MessageHash[newValue?408:409]);
        }.bind(this));
    },
    savePassword: function(event){
        PydioApi.getClient().request({
            get_action : 'webdav_preferences',
            webdav_pass: this.refs['passfield'].getValue()
        }, function(t){
            this.setState({preferences: t.responseJSON || {}});
            this.props.pydio.displayMessage("SUCCESS", this.props.pydio.MessageHash[410]);
        }.bind(this));
    },
    loadPrefs: function(){
        if(!this.isMounted()) return;
        PydioApi.getClient().request({
            get_action:'webdav_preferences'
        }, function(t){
            this.setState({preferences: t.responseJSON || {}});
        }.bind(this));
    },

    renderPasswordField: function(){

        if(this.state.preferences.digest_set || !this.state.preferences.webdav_force_basic){
            return null;
        }
        return (
            <div>
                <Divider/>
                <div style={{padding:16}}>
                    <div>{this.getMessage(407)}</div>
                    <div style={{display:'flex', alignItems:'baseline'}}>
                        <TextField
                            type="password"
                            floatingLabelText={this.getMessage(523)}
                            ref="passfield"
                            style={{flex:1, marginRight: 10}}
                        />
                        <RaisedButton
                            label="Save"
                            onClick={this.savePassword}
                        />
                    </div>
                </div>
                <Divider/>
            </div>
        );
    },

    renderUrls: function(){

        let base = this.state.preferences.webdav_base_url;
        let otherUrls = [];
        const toggler = !!this.state.toggler;
        const {pydio} = this.props;
        const {preferences} = this.state;

        if(toggler){
            let userRepos = pydio.user.getRepositoriesList();
            let webdavRepos = preferences.webdav_repositories;
            userRepos.forEach(function(repo, key){
                if(!webdavRepos[key]) return;
                otherUrls.push(<ClipboardTextField key={key} floatingLabelText={repo.getLabel()} inputValue={webdavRepos[key]} getMessage={this.getMessage} />);
            }.bind(this));
        }

        return (
            <div>
                <div style={{padding:20}}>
                    <div>{this.getMessage(405)}</div>
                    <ClipboardTextField floatingLabelText={this.getMessage(468)} inputValue={base} getMessage={this.getMessage}/>
                </div>
                {toggler && <Divider/>}
                <div style={{padding: 20}}>
                <Toggle labelPosition="right" label={this.getMessage(465)} onToggle={() => {this.setState({toggler: !toggler})}} toggled={toggler}/>
                {otherUrls}
                </div>
            </div>
        );

    },


    render: function(){
        let webdavActive = this.state && this.state.preferences.webdav_active;
        return (
            <div style={{fontSize: 14}}>
                <div style={{padding:20}}>
                    <Toggle
                        labelPosition="right"
                        label={this.getMessage(406)}
                        toggled={webdavActive}
                        onToggle={this.onToggleChange}/>
                    {!webdavActive &&
                        <div style={{paddingTop: 20}}>{this.getMessage(404)}</div>
                    }
                </div>
                {webdavActive &&
                    <div>
                        <Divider/>
                        {this.renderPasswordField()}
                        {this.renderUrls()}
                    </div>
                }
            </div>
        );
    }

});

export {WebDAVPane as default}