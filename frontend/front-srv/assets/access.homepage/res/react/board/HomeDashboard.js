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
import ConfigLogo from './ConfigLogo'
import {Paper, IconButton, Badge} from 'material-ui'
import WelcomeTour from './WelcomeTour'
import Pydio from 'pydio'
import HomeSearchForm from './HomeSearchForm'
import ActivityStreamsPanel from '../recent/ActivityStreams'
const {LeftPanel} = Pydio.requireLib('workspaces');

let AltDashboard = React.createClass({

    getDefaultCards: function(){

        const baseCards = [
            {
                id:'quick_upload',
                componentClass:'WelcomeComponents.QuickSendCard',
                defaultPosition:{
                    x: 0, y: 10
                }
            },
            {
                id:'downloads',
                componentClass:'WelcomeComponents.DlAppsCard',
                defaultPosition:{
                    x:0, y:20
                }
            },
            {
                id:'qr_code',
                componentClass:'WelcomeComponents.QRCodeCard',
                defaultPosition:{
                    x: 0, y: 30
                }
            },
            {
                id:'videos',
                componentClass:'WelcomeComponents.VideoCard',
                defaultPosition:{
                    x:0, y:50
                }
            },

        ];

        return baseCards;
    },

    getInitialState: function(){
        return {unreadStatus:0};
    },

    openDrawer: function(event){
        event.stopPropagation();
        this.setState({drawerOpen: true});
    },

    closeDrawer: function(){
        if(!this.state.drawerOpen){
            return;
        }
        this.setState({drawerOpen: false});
    },

    render:function() {

        const {pydio} = this.props;

        const Color = MaterialUI.Color;

        const appBarColor = new Color(this.props.muiTheme.appBar.color);

        const guiPrefs = this.props.pydio.user ? this.props.pydio.user.getPreference('gui_preferences', true) : [];
        const wTourEnabled = this.props.pydio.getPluginConfigs('gui.ajax').get('ENABLE_WELCOME_TOUR');

        const styles = {
            appBarStyle : {
                zIndex: 1,
                backgroundColor: appBarColor.alpha(.6).toString(),
                height: 100
            },
            buttonsStyle : {
                color: this.props.muiTheme.appBar.textColor
            },
            iconButtonsStyle :{
                color: appBarColor.darken(0.4).toString()
            },
            wsListsContainerStyle: {
                position:'absolute',
                zIndex: 10,
                top: 118,
                bottom: 0,
                right: 10,
                left: 260,
                display:'flex',
                flexDirection:'column'
            },
            rglStyle: {
                position:'absolute',
                top: 100,
                bottom: 0,
                right: 0,
                width: 260,
                overflowY:'auto',
                backgroundColor: '#ECEFF1'
            },
            centerTitleStyle:{
                padding: '20px 16px 10px',
                fontSize: 13,
                color: '#93a8b2',
                fontWeight: 500
            }
        };

        let mainClasses = ['vertical_layout', 'vertical_fit', 'react-fs-template', 'user-dashboard-template'];
        if(this.state.drawerOpen){
            mainClasses.push('drawer-open');
        }

        return (

            <div className={mainClasses.join(' ')} onTouchTap={this.closeDrawer}>
                {wTourEnabled && !guiPrefs['WelcomeComponent.Pydio8.TourGuide.Welcome'] && <WelcomeTour ref="welcome" pydio={this.props.pydio}/>}
                <LeftPanel
                    className="left-panel"
                    pydio={pydio}
                    style={{backgroundColor:'transparent'}}
                    userWidgetProps={{hideNotifications:false, style:{backgroundColor:appBarColor.darken(.2).alpha(.7).toString()}}}
                />
                <div className="desktop-container vertical_layout vertical_fit">
                    <Paper zDepth={1} style={styles.appBarStyle} rounded={false}>
                        <div id="workspace_toolbar" style={{display: "flex", justifyContent: "space-between"}}>
                            <span className="drawer-button"><IconButton style={{color: 'white'}} iconClassName="mdi mdi-menu" onTouchTap={this.openDrawer}/></span>
                            <span style={{flex:1}}></span>
                            <div style={{textAlign:'center', width: 250}}>
                                <ConfigLogo
                                    className="home-top-logo"
                                    pydio={this.props.pydio}
                                    pluginName="gui.ajax"
                                    pluginParameter="CUSTOM_DASH_LOGO"
                                />
                            </div>
                        </div>
                    </Paper>
                    <div style={{backgroundColor:'white'}} className="vertical_fit user-dashboard-main">

                        <HomeSearchForm zDepth={0} {...this.props} style={styles.wsListsContainerStyle}>
                            <div style={{flex:1, display:'flex', flexDirection:'column'}} id="history-block">
                                <ActivityStreamsPanel
                                    {...this.props}
                                    emptyStateProps={{style:{backgroundColor:'white'}}}
                                />
                            </div>
                        </HomeSearchForm>

                    </div>
                </div>
            </div>

        );

    }
});

AltDashboard = MaterialUI.Style.muiThemeable()(AltDashboard);

export {AltDashboard as default};
