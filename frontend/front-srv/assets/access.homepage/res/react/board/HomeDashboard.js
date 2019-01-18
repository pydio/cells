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
import {Paper, IconButton, Badge, Color} from 'material-ui'
import WelcomeTour from './WelcomeTour'
import Pydio from 'pydio'
import HomeSearchForm from './HomeSearchForm'
import ActivityStreamsPanel from '../recent/ActivityStreams'
const {MasterLayout} = Pydio.requireLib('workspaces');

class AltDashboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {unreadStatus: 0, drawerOpen: true};
        //setTimeout(()=>{this.setState({drawerOpen: false})}, 2000);
    }

    openDrawer(event) {
        event.stopPropagation();
        this.setState({drawerOpen: true});
        }

    render() {

        const {pydio, muiTheme} = this.props;
        const {drawerOpen} = this.state;

        const appBarColor = new Color(muiTheme.appBar.color);
        const guiPrefs = pydio.user ? pydio.user.getPreference('gui_preferences', true) : [];
        const wTourEnabled = pydio.getPluginConfigs('gui.ajax').get('ENABLE_WELCOME_TOUR');

        const styles = {
            appBarStyle : {
                zIndex: 1,
                backgroundColor: appBarColor.alpha(.6).toString(),
                height: 100
            },
            buttonsStyle : {
                color: muiTheme.appBar.textColor
            },
            iconButtonsStyle :{
                color: appBarColor.darken(0.4).toString()
            },
            wsListsContainerStyle: {
                position:'absolute',
                zIndex: 10,
                top: 108,
                bottom: 0,
                right: 0,
                left: 260,
                display:'flex',
                flexDirection:'column'
            }
        };

        let mainClasses = ['vertical_layout', 'vertical_fit', 'react-fs-template', 'user-dashboard-template'];

        let tutorialComponent;
        if (wTourEnabled && !guiPrefs['WelcomeComponent.Pydio8.TourGuide.Welcome']) {
            tutorialComponent = <WelcomeTour ref="welcome" pydio={pydio}/>;
        }

        const leftPanelProps = {
            style: {backgroundColor: 'transparent'},
            userWidgetProps: {
                hideNotifications: false,
                style: {
                    backgroundColor: appBarColor.darken(.2).alpha(.7).toString()
        }
            }
        };
        // Not used - to be used for toggling left menu
        const drawerIcon = (
            <span className="drawer-button" style={{position:'absolute'}}>
                <IconButton
                    iconStyle={{color: null, display:'none'}}
                    iconClassName="mdi mdi-menu"
                    onTouchTap={this.openDrawer.bind(this)}/>
            </span>
        );

        return (

            <MasterLayout
                pydio={pydio}
                classes={mainClasses}
                tutorialComponent={tutorialComponent}
                leftPanelProps={leftPanelProps}
                drawerOpen={drawerOpen}
                onCloseDrawerRequested={() => {
                    this.setState({drawerOpen: true})
                }}
            >
                <Paper zDepth={1} style={{...styles.appBarStyle}} rounded={false}>
                        <div id="workspace_toolbar" style={{display: "flex", justifyContent: "space-between"}}>
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
                <div style={{backgroundColor: 'rgba(255,255,255,1)'}} className="vertical_fit user-dashboard-main">

                        <HomeSearchForm zDepth={0} {...this.props} style={styles.wsListsContainerStyle}>
                            <div style={{flex:1, overflowY:'scroll'}} id="history-block">
                                <ActivityStreamsPanel
                                    {...this.props}
                                    emptyStateProps={{style:{backgroundColor:'white'}}}
                                />
                            </div>
                        </HomeSearchForm>

                    </div>
            </MasterLayout>

        );

    }
}

AltDashboard = MaterialUI.Style.muiThemeable()(AltDashboard);

export {AltDashboard as default};
