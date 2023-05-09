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
const createReactClass = require('create-react-class');
const Pydio = require('pydio')
const {ActionDialogMixin, SubmitButtonProviderMixin, AsyncComponent} = Pydio.requireLib('boot')
const {Tabs, Tab, FontIcon, FlatButton, Paper} = require('material-ui')
import ProfilePane from './ProfilePane'
import ComponentConfigParser from './ComponentConfigParser'
import {muiThemeable} from 'material-ui/styles'

let ModalDashboard = createReactClass({
    displayName: 'ModalDashboard',

    mixins: [
        ActionDialogMixin,
        SubmitButtonProviderMixin
    ],

    getDefaultProps: function(){
        return {
            dialogTitle: '',
            dialogSize: 'md',
            dialogPadding: false,
            dialogIsModal: false,
            dialogScrollBody: false
        };
    },

    submit: function(){
        this.dismiss();
    },

    getDefaultButtons: function(){
        return [<FlatButton label={this.props.pydio.MessageHash[86]} onClick={this.props.onDismiss}/>];
    },

    getButtons: function(updater){
        this._updater = updater;
        if(this.refs['profile']){
            return this.refs['profile'].getButtons(this._updater);
        }else{
            return this.getDefaultButtons();
        }
    },

    onTabChange: function(value){
        if(!this._updater) return;
        if(value && this.refs[value] && this.refs[value].getButtons){
            this._updater(this.refs[value].getButtons(this._updater));
        }else{
            this._updater(this.getDefaultButtons());
        }
    },

    render: function(){

        const buttonStyle = {
            textTransform: 'none'
        };
        let tabs = [
            (<Tab key="account" label={this.props.pydio.MessageHash['user_dash.title']} icon={<FontIcon className="mdi mdi-account"/>} buttonStyle={buttonStyle} value="profile">
                <ProfilePane {...this.props} ref="profile"/>
            </Tab>)
        ];

        ComponentConfigParser.getAccountTabs(this.props.pydio).map(function(tab){
            tabs.push(
                <Tab key={tab.id} label={this.props.pydio.MessageHash[tab.tabInfo.label]} icon={<FontIcon className={tab.tabInfo.icon}/>} buttonStyle={buttonStyle} value={tab.id}>
                    <AsyncComponent
                        ref={tab.id}
                        {...this.props}
                        {...tab.paneInfo}
                    />
                </Tab>
            );
        }.bind(this));

        if(tabs.length === 1) {
            return (
                <div style={{width:'100%', overflowY:'auto', minHeight: 350}}>
                    <ProfilePane {...this.props} ref={"profile"} style={{position:'relative', width:'100%'}} />
                </div>
            )
        }

        return (
            <Paper style={{width:'100%', overflow:'hidden', borderBottomRightRadius:0, borderBottomLeftRadius:0}} zDepth={0}>
                <Tabs
                    style={{display:'flex', flexDirection:'column', width:'100%', height: '100%'}}
                    tabItemContainerStyle={{minHeight:72}}
                    contentContainerStyle={{overflowY:'auto', minHeight: 350}}
                    onChange={this.onTabChange}
                >
                    {tabs}
                </Tabs>
            </Paper>
        );

    },
});

export {ModalDashboard as default}