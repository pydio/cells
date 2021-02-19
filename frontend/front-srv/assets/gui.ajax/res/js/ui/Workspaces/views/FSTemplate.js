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
import DOMUtils from 'pydio/util/dom'
const {ButtonMenu, Toolbar, ListPaginator} = Pydio.requireLib('components');

class FSTemplate extends React.Component {

    constructor(props){
        super(props);

        let rState = 'info-panel';
        if(localStorage.getItem('pydio.layout.rightColumnState') !== undefined && localStorage.getItem('pydio.layout.rightColumnState')){
            rState = localStorage.getItem('pydio.layout.rightColumnState');
        }
        const closedToggle = localStorage.getItem('pydio.layout.infoPanelToggle') === 'closed';
        const closedInfo = localStorage.getItem('pydio.layout.infoPanelOpen') === 'closed';
        const {pydio} = this.props;
        let themeLight = false;
        if(pydio.user && pydio.user.getPreference('theme') && pydio.user.getPreference('theme') !== 'default' ){
            themeLight = pydio.user.getPreference('theme') === 'light';
        } else if (pydio.getPluginConfigs('gui.ajax').get('GUI_THEME') === 'light'){
            themeLight = true;
        }
        const w = DOMUtils.getViewportWidth();
        this.state = {
            infoPanelOpen: !closedInfo,
            infoPanelToggle: !closedToggle,
            drawerOpen: false,
            rightColumnState: rState,
            searchFormState: {},
            themeLight: themeLight,
            smallScreen: w <= 758,
            xtraSmallScreen: w <= 420,
        };
    }

    componentDidMount(){
        const {pydio} = this.props;
        this._themeObserver = (user => {
            if(user){
                let uTheme;
                if(!user.getPreference('theme') || user.getPreference('theme') === 'default'){
                    uTheme = pydio.getPluginConfigs('gui.ajax').get('GUI_THEME');
                } else {
                    uTheme = user.getPreference('theme');
                }
                this.setState({themeLight: uTheme === 'light'});
            }
        });
        pydio.observe('user_logged', this._themeObserver);
        this._resizer = ()=>{
            const w = DOMUtils.getViewportWidth();
            this.setState({
                smallScreen : w < 758,
                xtraSmallScreen: w <= 420,
            });
        };
        DOMUtils.observeWindowResize(this._resizer);
    }

    componentWillUnmount(){
        const {pydio} = this.props;
        pydio.stopObserving('user_logged', this._themeObserver);
        DOMUtils.stopObservingWindowResize(this._resizer);
    }

    openRightPanel(name){
        const {rightColumnState} = this.state;
        if(name === rightColumnState){
            this.closeRightPanel();
            return;
        }
        this.setState({rightColumnState: name}, () => {
            let {infoPanelOpen} = this.state;
            if(name !== 'info-panel'){
                infoPanelOpen = true;
            }
            if(name !== 'advanced-search'){
                localStorage.setItem('pydio.layout.rightColumnState', name);
                localStorage.setItem('pydio.layout.infoPanelToggle', 'open');
                localStorage.setItem('pydio.layout.infoPanelOpen', infoPanelOpen?'open':'closed');
            }
            this.setState({infoPanelToggle:true, infoPanelOpen}, () => this.resizeAfterTransition())
        });
    }

    closeRightPanel() {
        const {rightColumnState} = this.state;
        if(rightColumnState === 'advanced-search'){
            // Reopen last saved state
            const rState = localStorage.getItem('pydio.layout.rightColumnState');
            if(rState !== undefined && rState && rState !== 'advanced-search'){
                this.openRightPanel(rState);
            } else {
                this.setState({infoPanelToggle: false}, () => {
                    this.resizeAfterTransition();
                });
            }
        } else {
            this.setState({infoPanelToggle: false}, () => {
                this.resizeAfterTransition();
            });
            localStorage.setItem('pydio.layout.rightColumnState', '');
            localStorage.setItem('pydio.layout.infoPanelToggle', 'closed');
        }
    }


    resizeAfterTransition(){
        setTimeout(() => {
            if(this.refs.list) {
                this.refs.list.resize();
            }
            if(!this.state.infoPanelToggle){
                this.setState({rightColumnState: null});
            }
        }, 300);
    }

    infoPanelContentChange(numberOfCards){
        this.setState({infoPanelOpen: (numberOfCards > 0)}, () => this.resizeAfterTransition())
    }

    openDrawer(event){
        event.stopPropagation();
        this.setState({drawerOpen: true});
    }

    render () {

        const {muiTheme} = this.props;
        const mobile = this.props.pydio.UI.MOBILE_EXTENSIONS;
        const Color = MaterialUI.Color;

        let appBarTextColor = Color(muiTheme.appBar.textColor);
        let appBarBackColor = Color(muiTheme.appBar.color);

        const colorHue = Color(muiTheme.palette.primary1Color).hsl().array()[0];
        const superLightBack = new Color({h:colorHue,s:35,l:98});

        // Load from user prefs
        const {themeLight, smallScreen, xtraSmallScreen} = this.state;
        if(themeLight){
            appBarBackColor = superLightBack;//Color('#fafafa');
            appBarTextColor = Color(muiTheme.appBar.color);
        }

        const headerHeight = 72;
        const buttonsHeight = 23;
        const buttonsFont = 11;
        const crtWidth = DOMUtils.getViewportWidth();

        let styles = {
            appBarStyle : {
                zIndex: 1,
                backgroundColor: appBarBackColor.toString(),
                height: headerHeight,
                display:'flex',
                //borderBottom: themeLight?'1px solid #e0e0e0':null
            },
            buttonsStyle : {
                width: 40,
                height: 40,
                padding: 10,
                borderRadius: '50%',
                color: appBarTextColor.fade(0.03).toString(),
                transition: DOMUtils.getBeziersTransition()
            },
            buttonsIconStyle :{
                fontSize: 18,
                color: appBarTextColor.fade(0.03).toString()
            },
            activeButtonStyle: {
                backgroundColor: appBarTextColor.fade(0.9).toString()
            },
            activeButtonIconStyle: {
                color: appBarTextColor.fade(0.03).toString()//'rgba(255,255,255,0.97)'
            },
            raisedButtonStyle : {
                height: buttonsHeight,
                minWidth: 0
            },
            raisedButtonLabelStyle : {
                height: buttonsHeight,
                paddingLeft: 12,
                paddingRight: 8,
                lineHeight: buttonsHeight + 'px',
                fontSize: buttonsFont
            },
            flatButtonStyle : {
                height: buttonsHeight,
                lineHeight: buttonsHeight + 'px',
                minWidth: 0
            },
            flatButtonLabelStyle : {
                height: buttonsHeight,
                fontSize: buttonsFont,
                paddingLeft: 8,
                paddingRight: 8,
                color: appBarTextColor.fade(0.03).toString()
            },
            infoPanelStyle : {
                backgroundColor: 'transparent',
                top: headerHeight
            },
            otherPanelsStyle: {
                top: headerHeight,
                borderLeft: 0,
                margin: 10,
                width: 290
            },
            searchFormPanelStyle:{
                top: headerHeight,
                borderLeft: 0,
                margin: 10,
                width: smallScreen ? (xtraSmallScreen ? crtWidth : 420) : 520,
                right: xtraSmallScreen ? -10: null,
                overflowY: 'hidden',
                display:'flex',
                flexDirection:'column',
                backgroundColor:'white',
            },
            breadcrumbStyle:{},
            searchForm:{},
        };

        // Merge active styles
        styles.activeButtonStyle = {...styles.buttonsStyle, ...styles.activeButtonStyle};
        styles.activeButtonIconStyle = {...styles.buttonsIconStyle, ...styles.activeButtonIconStyle};

        const {infoPanelOpen, drawerOpen, infoPanelToggle, filesListDisplayMode} = this.state;
        let {rightColumnState} = this.state;

        let mainToolbars = [
            "change_main",
            "info_panel",
            "info_panel_share",
        ];
        let mainToolbarsOthers = ["change", "other"];

        const {pydio} = this.props;
        const guiPrefs = pydio.user ? pydio.user.getPreference('gui_preferences', true) : [];
        const wTourEnabled = pydio.getPluginConfigs('gui.ajax').get('ENABLE_WELCOME_TOUR');

        let showChatTab = (!pydio.getPluginConfigs("action.advanced_settings").get("GLOBAL_DISABLE_CHATS"));
        let showAddressBook = (!pydio.getPluginConfigs("action.user").get("DASH_DISABLE_ADDRESS_BOOK")) && !smallScreen;
        let showInfoPanel = !xtraSmallScreen;
        if(showChatTab){
            const repo = pydio.user.getRepositoriesList().get(pydio.user.activeRepository);
            if(repo && !repo.getOwner()){
                showChatTab = false;
            }
        }
        if(!showChatTab && rightColumnState === 'chat') {
            rightColumnState = 'info-panel';
        }
        if(!showInfoPanel && rightColumnState === 'info-panel'){
            rightColumnState = '';
        }

        let classes = ['vertical_layout', 'vertical_fit', 'react-fs-template'];
        const thumbDisplay = filesListDisplayMode && filesListDisplayMode.indexOf("grid-") === 0;
        if((infoPanelOpen || thumbDisplay) && infoPanelToggle) {
            classes.push('info-panel-open');
            if(rightColumnState !== 'info-panel'){
                classes.push('info-panel-open-lg');
            }
        }

        // Making sure we only pass the style to the parent element
        const {style, ...props} = this.props;

        let tutorialComponent;
        if (wTourEnabled && !guiPrefs['WelcomeComponent.Pydio8.TourGuide.FSTemplate']){
            tutorialComponent = <WelcomeTour ref="welcome" pydio={this.props.pydio}/>;
        }

        let uWidgetColor = 'rgba(255,255,255,.93)';
        let uWidgetBack = null;
        if(themeLight){
            const colorHue = Color(muiTheme.palette.primary1Color).hsl().array()[0];
            uWidgetColor = Color(muiTheme.palette.primary1Color).darken(0.1).alpha(0.87).toString();
            uWidgetBack = new Color({h:colorHue,s:35,l:98}).toString();
        }

        let newButtonProps = {
            buttonStyle:{...styles.flatButtonStyle, marginRight: 4},
            buttonLabelStyle:{...styles.flatButtonLabelStyle},
            buttonBackgroundColor:'rgba(255,255,255,0.17)',
            buttonHoverColor:'rgba(255,255,255,0.33)',
        };

        let leftPanelProps = {
            headerHeight:headerHeight,
            userWidgetProps: {
                color: uWidgetColor,
                mergeButtonInAvatar:true,
                popoverDirection:'left',
                actionBarStyle:{
                    marginTop:0
                },
                style:{
                    height: headerHeight,
                    display:'flex',
                    alignItems:'center',
                }
            }
        };
        if(themeLight){
            leftPanelProps.userWidgetProps.style = {
                ...leftPanelProps.userWidgetProps.style,
                boxShadow: 'none',
                backgroundColor: uWidgetBack,
                borderRight: '1px solid #e0e0e0'
            };
            styles.breadcrumbStyle = {
                color: appBarTextColor.toString()// '#616161',
            };
            styles.searchForm = {
                mainStyle:{border:'1px solid ' + appBarTextColor.fade(0.8).toString()},
                inputStyle:{color: appBarTextColor.toString()},
                hintStyle:{color: appBarTextColor.fade(0.5).toString()},
                magnifierStyle:{color: appBarTextColor.fade(0.1).toString()}
            };
            newButtonProps.buttonLabelStyle.color = muiTheme.palette.accent1Color;
            newButtonProps.buttonBackgroundColor = 'rgba(0,0,0,0.05)';
            newButtonProps.buttonHoverColor = 'rgba(0,0,0,0.10)';

        }


        const searchForm = (
            <SearchForm
                {...props}
                {...this.state.searchFormState}
                formStyles={styles.searchForm}
                style={rightColumnState === "advanced-search" ? styles.searchFormPanelStyle : {}}
                id={rightColumnState === "advanced-search" ? "info_panel": null}
                headerHeight={headerHeight}
                advancedPanel={rightColumnState === "advanced-search"}
                onOpenAdvanced={()=>{this.openRightPanel('advanced-search')}}
                onCloseAdvanced={()=>{this.closeRightPanel()}}
                onUpdateState={(s)=>{this.setState({searchFormState: s})}}
                smallScreen={smallScreen}
                xtraSmallScreen={xtraSmallScreen}
            />
        );

        return (
            <MasterLayout
                pydio={pydio}
                style={{...style, overflow:'hidden'}}
                classes={classes}
                tutorialComponent={tutorialComponent}
                drawerOpen={drawerOpen}
                leftPanelProps={leftPanelProps}
                onCloseDrawerRequested={()=>{this.setState({drawerOpen:false})}}
            >
                    <Paper zDepth={themeLight?0:1} style={styles.appBarStyle} rounded={false}>
                        <div id="workspace_toolbar" style={{flex:1, width:'calc(100% - 430px)', display:'flex'}}>
                            <span className="drawer-button" style={{marginLeft: 12, marginRight: -6}}>
                                <IconButton iconStyle={{color: appBarTextColor.fade(0.03).toString()}} iconClassName="mdi mdi-menu" onClick={this.openDrawer}/>
                            </span>
                            <div style={{flex: 1, overflow:'hidden'}}>
                                <Breadcrumb {...props} startWithSeparator={false} rootStyle={styles.breadcrumbStyle}/>
                                <div style={{height:32, paddingLeft: 20, alignItems:'center', display:'flex', overflow:'hidden'}}>
                                    <ButtonMenu
                                        {...props}
                                        {...newButtonProps}
                                        id="create-button-menu"
                                        toolbars={["upload", "create"]}
                                        buttonTitle={this.props.pydio.MessageHash['198']}
                                        raised={false}
                                        secondary={true}
                                        controller={props.pydio.Controller}
                                        openOnEvent={'tutorial-open-create-menu'}
                                    />
                                    <ListPaginator
                                        id="paginator-toolbar"
                                        style={{height: 23, borderRadius: 2, background: newButtonProps.buttonBackgroundColor, marginRight: 5}}
                                        dataModel={props.pydio.getContextHolder()}
                                        smallDisplay={true}
                                        toolbarDisplay={true}
                                        toolbarColor={appBarTextColor}
                                    />
                                    {!mobile &&
                                        <Toolbar
                                            {...props}
                                            id="main-toolbar"
                                            toolbars={mainToolbars}
                                            groupOtherList={mainToolbarsOthers}
                                            renderingType="button"
                                            toolbarStyle={{flex: 1, overflow:'hidden'}}
                                            flatButtonStyle={styles.flatButtonStyle}
                                            buttonStyle={styles.flatButtonLabelStyle}
                                        />
                                    }
                                    {mobile && <span style={{flex:1}}/>}
                                </div>
                            </div>
                        </div>
                        <div style={{display:'flex', alignItems:'center'}}>
                            <Toolbar
                                {...props}
                                id="display-toolbar"
                                toolbars={["display_toolbar"]}
                                renderingType="icon-font"
                                mergeItemsAsOneMenu={true}
                                mergedMenuIcom={"mdi mdi-settings"}
                                mergedMenuTitle={this.props.pydio.MessageHash['151']}
                                buttonStyle={styles.buttonsIconStyle}
                                flatButtonStyle={styles.buttonsStyle}
                            />
                            <div style={{position:'relative', width: (rightColumnState === "advanced-search" || smallScreen) ? 40 : 150, transition:DOMUtils.getBeziersTransition()}}>
                                {!smallScreen && rightColumnState !== "advanced-search" && searchForm}
                                {(rightColumnState === "advanced-search" || smallScreen) &&
                                    <IconButton
                                        iconClassName={"mdi mdi-magnify"}
                                        style={rightColumnState === "advanced-search" ? styles.activeButtonStyle : styles.buttonsStyle}
                                        iconStyle={rightColumnState === "advanced-search" ? styles.activeButtonIconStyle : styles.buttonsIconStyle}
                                        onClick={()=>{this.openRightPanel('advanced-search')}}
                                        tooltip={pydio.MessageHash[rightColumnState === 'info-panel' ? '86':'87']}
                                    />
                                }
                            </div>
                            <div style={{borderLeft:'1px solid ' + appBarTextColor.fade(0.77).toString(), margin:'0 10px', height: headerHeight, display:'none'}}/>
                            <div style={{display:'flex', paddingRight: 10}}>
                                {showInfoPanel &&
                                <IconButton
                                    iconClassName={"mdi mdi-information"}
                                    style={rightColumnState === 'info-panel' ? styles.activeButtonStyle : styles.buttonsStyle}
                                    iconStyle={rightColumnState === 'info-panel' ? styles.activeButtonIconStyle : styles.buttonsIconStyle}
                                    onClick={()=>{this.openRightPanel('info-panel')}}
                                    tooltip={pydio.MessageHash[rightColumnState === 'info-panel' ? '86':'341']}
                                />
                                }
                                {showAddressBook &&
                                    <IconButton
                                        iconClassName={"mdi mdi-account-card-details"}
                                        style={rightColumnState === 'address-book' ? styles.activeButtonStyle : styles.buttonsStyle}
                                        iconStyle={rightColumnState === 'address-book' ? styles.activeButtonIconStyle : styles.buttonsIconStyle}
                                        onClick={()=>{this.openRightPanel('address-book')}}
                                        tooltip={pydio.MessageHash[rightColumnState === 'address-book' ? '86':'592']}
                                        tooltipPosition={showChatTab?"bottom-center":"bottom-left"}
                                    />
                                }
                                {showChatTab &&
                                <IconButton
                                    iconClassName={"mdi mdi-message-text"}
                                    style={rightColumnState === 'chat' ? styles.activeButtonStyle : styles.buttonsStyle}
                                    iconStyle={rightColumnState === 'chat' ? styles.activeButtonIconStyle : styles.buttonsIconStyle}
                                    onClick={()=>{this.openRightPanel('chat')}}
                                    tooltip={pydio.MessageHash[rightColumnState === 'chat' ? '86':'635']}
                                    tooltipPosition={"bottom-left"}
                                />
                                }
                            </div>
                        </div>
                    </Paper>
                    <MainFilesList ref="list" pydio={pydio} onDisplayModeChange={(dMode) => {
                        this.setState({filesListDisplayMode: dMode});
                    }}/>
                {rightColumnState === 'info-panel' &&
                    <InfoPanel
                        {...props}
                        dataModel={props.pydio.getContextHolder()}
                        onRequestClose={()=>{this.closeRightPanel()}}
                        onContentChange={this.infoPanelContentChange.bind(this)}
                        style={styles.infoPanelStyle}
                    />
                }
                {rightColumnState === 'chat' &&
                    <CellChat pydio={pydio} style={styles.otherPanelsStyle} zDepth={1} onRequestClose={()=>{this.closeRightPanel()}}/>
                }

                {rightColumnState === 'address-book' &&
                    <AddressBookPanel pydio={pydio} style={styles.otherPanelsStyle} zDepth={1} onRequestClose={()=>{this.closeRightPanel()}}/>
                }
                {rightColumnState === "advanced-search" &&
                    searchForm
                }

                <EditionPanel {...props}/>

            </MasterLayout>
        );


    }
}

FSTemplate = muiThemeable()(FSTemplate);
FSTemplate.INFO_PANEL_WIDTH = 270

export {FSTemplate as default}
