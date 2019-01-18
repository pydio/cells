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

import React from 'react';
import Pydio from 'pydio';
import ReactDOM from 'react-dom'
import MessagesProviderMixin from '../MessagesProviderMixin'
import Breadcrumb from './Breadcrumb'
import {SearchForm} from '../search'
import MainFilesList from './MainFilesList'
import EditionPanel from './EditionPanel'
import InfoPanel from '../detailpanes/InfoPanel'
import WelcomeTour from './WelcomeTour'
import CellChat from './CellChat'
import {IconButton, Paper} from 'material-ui'
import AddressBookPanel from './AddressBookPanel'
import MasterLayout from './MasterLayout'
import {muiThemeable} from 'material-ui/styles'
const {ButtonMenu, Toolbar, ListPaginator} = Pydio.requireLib('components');

let FSTemplate = React.createClass({

    mixins: [MessagesProviderMixin],

    propTypes: {
        pydio:React.PropTypes.instanceOf(Pydio)
    },

    statics: {
        INFO_PANEL_WIDTH: 270
    },

    openRightPanel(name){
        this.setState({rightColumnState: name}, () => {
            let {infoPanelOpen} = this.state;
            if(name !== 'info-panel'){
                infoPanelOpen = true;
            }
            localStorage.setItem('pydio.layout.rightColumnState', name);
            localStorage.setItem('pydio.layout.infoPanelToggle', 'open');
            localStorage.setItem('pydio.layout.infoPanelOpen', infoPanelOpen?'open':'closed');
            this.setState({infoPanelToggle:true, infoPanelOpen}, () => this.resizeAfterTransition())
        });
    },

    closeRightPanel() {
        this.setState({infoPanelToggle: false}, () => {
            this.resizeAfterTransition();
        });
        localStorage.setItem('pydio.layout.rightColumnState', '');
        localStorage.setItem('pydio.layout.infoPanelToggle', 'closed');
    },

    getInitialState(){
        let rState = 'info-panel';
        if(localStorage.getItem('pydio.layout.rightColumnState') !== undefined && localStorage.getItem('pydio.layout.rightColumnState')){
            rState = localStorage.getItem('pydio.layout.rightColumnState');
        }
        const closedToggle = localStorage.getItem('pydio.layout.infoPanelToggle') === 'closed';
        const closedInfo = localStorage.getItem('pydio.layout.infoPanelOpen') === 'closed';
        return {
            infoPanelOpen: !closedInfo,
            infoPanelToggle: !closedToggle,
            drawerOpen: false,
            rightColumnState: rState
        };
    },

    resizeAfterTransition(){
        setTimeout(() => {
            if(this.refs.list) {
                this.refs.list.resize();
            }
            if(!this.state.infoPanelToggle){
                this.setState({rightColumnState: null});
            }
        }, 500);
    },

    infoPanelContentChange(numberOfCards){
        this.setState({infoPanelOpen: (numberOfCards > 0)}, () => this.resizeAfterTransition())
    },

    openDrawer(event){
        event.stopPropagation();
        this.setState({drawerOpen: true});
    },

    render () {

        const mobile = this.props.pydio.UI.MOBILE_EXTENSIONS;
        const Color = MaterialUI.Color;
        const appBarColor = Color(this.props.muiTheme.appBar.color);
        const appBarTextColor = Color(this.props.muiTheme.appBar.textColor);

        let styles = {
            appBarStyle : {
                zIndex: 1,
                backgroundColor: this.props.muiTheme.appBar.color,
                height: 100,
            },
            buttonsStyle : {
                width: 42,
                height: 42,
                borderBottom: 0,
                color: appBarTextColor.fade(0.03).toString()
            },
            buttonsIconStyle :{
                fontSize: 18,
                color: appBarTextColor.fade(0.03).toString()
            },
            activeButtonStyle: {
                borderBottom: '2px solid rgba(255,255,255,0.97)'
            },
            activeButtonIconStyle: {
                color: 'rgba(255,255,255,0.97)'
            },
            raisedButtonStyle : {
                height: 30,
                minWidth: 0
            },
            raisedButtonLabelStyle : {
                height: 30,
                lineHeight: '30px'
            },
            infoPanelStyle : {
                //backgroundColor: appBarColor.lightness(95).rgb().toString()
                backgroundColor: '#fafafa',
                borderLeft: '1px solid #e0e0e0'
            }
        };

        // Merge active styles
        styles.activeButtonStyle = {...styles.buttonsStyle, ...styles.activeButtonStyle};
        styles.activeButtonIconStyle = {...styles.buttonsIconStyle, ...styles.activeButtonIconStyle};

        const {infoPanelOpen, drawerOpen, infoPanelToggle} = this.state;
        let {rightColumnState} = this.state;

        let classes = ['vertical_layout', 'vertical_fit', 'react-fs-template'];
        if(infoPanelOpen && infoPanelToggle) {
            classes.push('info-panel-open');
        }

        let mainToolbars = ["info_panel", "info_panel_share"];
        let mainToolbarsOthers = ["change", "other"];
        if(infoPanelOpen && infoPanelToggle && (rightColumnState === 'info-panel')){
            mainToolbars = ["change_main"];
            mainToolbarsOthers = ["get", "change", "other"];
        }

        const {pydio} = this.props;
        const guiPrefs = pydio.user ? pydio.user.getPreference('gui_preferences', true) : [];
        const wTourEnabled = pydio.getPluginConfigs('gui.ajax').get('ENABLE_WELCOME_TOUR');

        let showChatTab = true;
        let showAddressBook = true;
        const repo = pydio.user.getRepositoriesList().get(pydio.user.activeRepository);
        if(repo && !repo.getOwner()){
            showChatTab = false;
            if(rightColumnState === 'chat') {
                rightColumnState = 'info-panel';
            }
        }
        if (pydio.getPluginConfigs("action.advanced_settings").get("GLOBAL_DISABLE_CHATS")) {
            showChatTab = false;
        }
        if (pydio.getPluginConfigs("action.user").get("DASH_DISABLE_ADDRESS_BOOK")) {
            showAddressBook = false;
        }

        // Making sure we only pass the style to the parent element
        const {style, ...props} = this.props;

        let tutorialComponent;
        if (wTourEnabled && !guiPrefs['WelcomeComponent.Pydio8.TourGuide.FSTemplate']){
            tutorialComponent = <WelcomeTour ref="welcome" pydio={this.props.pydio}/>;
        }

        return (
            <MasterLayout
                pydio={pydio}
                style={{...style, overflow:'hidden'}}
                classes={classes}
                tutorialComponent={tutorialComponent}
                drawerOpen={drawerOpen}
                onCloseDrawerRequested={()=>{this.setState({drawerOpen:false})}}
            >
                    <Paper zDepth={1} style={styles.appBarStyle} rounded={false}>
                        <div id="workspace_toolbar" style={{display: 'flex', height: 58}}>
                            <span className="drawer-button"><IconButton iconStyle={{color: 'white'}} iconClassName="mdi mdi-menu" onTouchTap={this.openDrawer}/></span>
                            <Breadcrumb {...props} startWithSeparator={false}/>
                            <span style={{flex:1}}/>
                            <SearchForm {...props}/>
                        </div>
                        <div id="main_toolbar">
                            <ButtonMenu
                                {...props}
                                buttonStyle={styles.raisedButtonStyle}
                                buttonLabelStyle={styles.raisedButtonLabelStyle}
                                id="create-button-menu"
                                toolbars={["upload", "create"]}
                                buttonTitle={this.props.pydio.MessageHash['198']}
                                raised={true}
                                secondary={true}
                                controller={props.pydio.Controller}
                                openOnEvent={'tutorial-open-create-menu'}
                            />
                            {!mobile &&
                                <Toolbar
                                    {...props}
                                    id="main-toolbar"
                                    toolbars={mainToolbars}
                                    groupOtherList={mainToolbarsOthers}
                                    renderingType="button"
                                    buttonStyle={styles.buttonsStyle}
                                />
                            }
                            {mobile && <span style={{flex:1}}></span>}
                            <ListPaginator
                                id="paginator-toolbar"
                                dataModel={props.pydio.getContextHolder()}
                                toolbarDisplay={true}
                            />
                            <Toolbar
                                {...props}
                                id="display-toolbar"
                                toolbars={["display_toolbar"]}
                                renderingType="icon-font"
                                buttonStyle={styles.buttonsIconStyle}
                            />
                            <div style={{borderLeft:'1px solid ' + appBarTextColor.fade(0.77).toString(), margin:10, marginBottom: 4}}/>
                            <div style={{marginTop:-3, display:'flex'}}>
                                <IconButton
                                    iconClassName={"mdi mdi-information"}
                                    style={rightColumnState === 'info-panel' ? styles.activeButtonStyle : styles.buttonsStyle}
                                    iconStyle={rightColumnState === 'info-panel' ? styles.activeButtonIconStyle : styles.buttonsIconStyle}
                                    onTouchTap={()=>{this.openRightPanel('info-panel')}}
                                    tooltip={pydio.MessageHash['341']}
                                />
                                {showChatTab &&
                                    <IconButton
                                        iconClassName={"mdi mdi-message-text"}
                                        style={rightColumnState === 'chat' ? styles.activeButtonStyle : styles.buttonsStyle}
                                        iconStyle={rightColumnState === 'chat' ? styles.activeButtonIconStyle : styles.buttonsIconStyle}
                                        onTouchTap={()=>{this.openRightPanel('chat')}}
                                        tooltip={pydio.MessageHash['635']}
                                    />
                                }
                                {showAddressBook &&
                                    <IconButton
                                        iconClassName={"mdi mdi-account-card-details"}
                                        style={rightColumnState === 'address-book' ? styles.activeButtonStyle : styles.buttonsStyle}
                                        iconStyle={rightColumnState === 'address-book' ? styles.activeButtonIconStyle : styles.buttonsIconStyle}
                                        onTouchTap={()=>{this.openRightPanel('address-book')}}
                                        tooltip={pydio.MessageHash['592']}
                                    />
                                }
                                <IconButton
                                    iconClassName={"mdi mdi-close"}
                                    style={styles.buttonsStyle}
                                    iconStyle={styles.buttonsIconStyle}
                                    onTouchTap={()=>{this.closeRightPanel()}}
                                    disabled={!rightColumnState}
                                    tooltip={pydio.MessageHash['86']}
                                />
                            </div>
                        </div>
                    </Paper>
                    <MainFilesList ref="list" pydio={this.props.pydio}/>
                {rightColumnState === 'info-panel' &&
                    <InfoPanel
                        {...props}
                        dataModel={props.pydio.getContextHolder()}
                        onContentChange={this.infoPanelContentChange}
                        style={styles.infoPanelStyle}
                    />
                }
                {rightColumnState === 'chat' &&
                    <CellChat pydio={pydio}/>
                }

                {rightColumnState === 'address-book' &&
                    <AddressBookPanel pydio={pydio}/>
                }

                <EditionPanel {...props}/>

            </MasterLayout>
        );


    }
});

//FSTemplate = dropProvider(FSTemplate);
//FSTemplate = withContextMenu(FSTemplate);
FSTemplate = muiThemeable()(FSTemplate);

export {FSTemplate as default}
