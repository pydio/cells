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
import Pydio from 'pydio'
import {Paper, IconButton, Color} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import ConfigLogo from './ConfigLogo'
import WelcomeTour from './WelcomeTour'
import HomeSearchForm from './HomeSearchForm'
import SmartRecents from '../recent/SmartRecents'
const {MasterLayout} = Pydio.requireLib('workspaces');
import {debounce} from 'lodash'

class AltDashboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {unreadStatus: 0, drawerOpen: true};
        if (!this.showTutorial()) {
            this.closeTimeout = setTimeout(()=>{this.setState({drawerOpen: false})}, 2500);
        }
        this._resizeEventDebounced = debounce(()=>{
            window.dispatchEvent(new Event('resize'));
            this.setState({fullScreenTransition: false})
        }, 350)
    }

    showTutorial(){
        const {pydio} = this.props;
        const guiPrefs = pydio.user ? pydio.user.getPreference('gui_preferences', true) : [];
        const wTourEnabled = pydio.getPluginConfigs('gui.ajax').get('ENABLE_WELCOME_TOUR');
        return wTourEnabled && !guiPrefs['WelcomeComponent.Pydio8.TourGuide.Welcome'];
    }

    openDrawer(event) {
        event.stopPropagation();
        this.clearCloseTimeout();
        this.setState({drawerOpen: true});
    }

    clearCloseTimeout(){
        if(this.closeTimeout) {
            clearTimeout(this.closeTimeout);
        }
    }

    render() {

        const {pydio, muiTheme} = this.props;
        const {drawerOpen, fullScreen, fullScreenTransition} = this.state;

        const appBarColor = new Color(muiTheme.appBar.color);
        const isMui3 = muiTheme.userTheme === 'mui3'
        const {palette:{mui3}} = muiTheme

        const styles = muiTheme.buildFSTemplate({})
        styles.appBarStyle = {
            backgroundColor: muiTheme.darkMode? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.40)',
            height: fullScreen? 0: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }
        styles.buttonsStyle = {
            color: muiTheme.appBar.textColor
        }
        styles.iconButtonsStyle = {
            color: appBarColor.darken(0.4).toString()
        }
        styles.wsListsContainerStyle = {
            flex: 1,
            display:'flex',
            flexDirection:'column',
            alignItems:'center',
            backgroundColor: isMui3 ? mui3['surface']:'white',
            overflow:'hidden',
        }


        let mainClasses = ['vertical_fit', 'react-fs-template', 'user-dashboard-template'];

        let tutorialComponent;
        if (this.showTutorial()) {
            tutorialComponent = <WelcomeTour ref="welcome" pydio={pydio} onFinish={()=>{
                this.closeTimeout = setTimeout(()=>{this.setState({drawerOpen: false})}, 1500);
            }}/>;
        }

        const headerHeight = 72;
        let additionalStyle = {}
        if(muiTheme.userTheme !== 'mui3'){
            additionalStyle = {
                position:'absolute',
                bottom:0,
                top:0,
                zIndex: 1000,
                transform: drawerOpen?'translateX(0px)':'translateX(-250px)'
            }
        }

        const leftPanelProps = {
            style: {...styles.leftPanel.masterStyle, ...additionalStyle},
            headerHeight:headerHeight,
            onMouseOver:()=>{this.clearCloseTimeout()},
            userWidgetProps: {
                mergeButtonInAvatar:true,
                popoverDirection:'left',
                actionBarStyle:{
                    marginTop:0
                },
                style:{
                    height: headerHeight,
                    display:'flex',
                    alignItems:'center',
                    boxShadow: 'none',
                    background:'transparent'
                }
            }
        };

        const onFocusChange = (f)=>{
            if(f !== this.state.fullScreen){
                this.setState({fullScreen: f, fullScreenTransition: true}, this._resizeEventDebounced)
            }
        }


        return (

            <MasterLayout
                pydio={pydio}
                classes={mainClasses}
                style={{...styles.masterStyle, backgroundColor:'transparent'}}
                tutorialComponent={tutorialComponent}
                leftPanelProps={leftPanelProps}
                drawerOpen={drawerOpen}
                onCloseDrawerRequested={() => {
                    if(tutorialComponent !== undefined) {
                        return
                    }
                    this.setState({drawerOpen: false})
                }}
            >
                <Paper zDepth={0} style={{...styles.appBarStyle}} rounded={false}>
                    <span className="drawer-button" style={{position:'absolute', top: 0, left: 0, zIndex: 2}}>
                        <IconButton
                            iconStyle={{color: null}}
                            iconClassName="mdi mdi-menu"
                            onClick={this.openDrawer.bind(this)}/>
                    </span>
                    <div style={{width: 250}}>
                        <ConfigLogo
                            className="home-top-logo"
                            style={{maxHeight:100}}
                            pydio={this.props.pydio}
                            darkMode={muiTheme.darkMode}
                            pluginName="gui.ajax"
                            pluginParameter="CUSTOM_DASH_LOGO"
                        />
                    </div>
                </Paper>
                <HomeSearchForm zDepth={0} {...this.props} style={styles.wsListsContainerStyle} fullScreen={fullScreen} fullScreenTransition={fullScreenTransition} onFocusChange={onFocusChange}>
                    <SmartRecents {...this.props} style={{maxWidth: 680, width:'100%', padding:'8px 0'}} emptyStateProps={{style:{backgroundColor:'transparent'}}}/>
                </HomeSearchForm>
            </MasterLayout>

        );

    }
}

AltDashboard = muiThemeable()(AltDashboard);

export {AltDashboard as default};
