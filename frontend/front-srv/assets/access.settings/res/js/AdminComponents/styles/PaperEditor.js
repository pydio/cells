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
import Pydio from 'pydio'
import React from 'react'
import PropTypes from 'prop-types'
import {IconButton,IconMenu, Menu, Subheader, MenuItem} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import AdminStyles from './AdminStyles'

/**
 * Two columns layout used for Workspaces and Plugins editors
 */
class PaperEditorLayout extends React.Component{

    constructor(props){
        super(props);
        this.state = {forceLeftOpen:false};
    }

    toggleMenu(){
        const crtLeftOpen = (this.state && this.state.forceLeftOpen);
        this.setState({forceLeftOpen:!crtLeftOpen});
    }

    render(){
        const {muiTheme, closeAction, className, title, titleLeftIcon, titleActionBar, rightPanelStyle, leftNavItems, leftNavSelected, leftNavChange, contentFill, children} = this.props;
        const {forceLeftOpen} = this.state;
        const adminStyles = AdminStyles(muiTheme.palette)

        const styles={
            title: {
                backgroundColor: 'white',
                borderRadius: '4px 4px 0 0',
                display:'flex',
                alignItems: 'center',
                height: 64,
                padding: '0 20px',
                zIndex: 12,
                boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 2px'
            },
            titleH2: {
                color: '',
                flex: 1,
                fontSize: 18,
                padding: 0,
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                borderRadius: '4px 4px 0 0',
            },
            titleLeftIcon:{
                color: 'rgba(0, 0, 0, 0.24)',
                fontSize: 24,
                marginRight: 6
            },
            titleBar: {
                display: 'flex',
                alignItems: 'center',
            },
            leftPanelStyle: {
                backgroundColor: adminStyles.menu.leftNav.backgroundColor,
                width: 200
            },
            rightPanelStyle: {
                backgroundColor: adminStyles.body.mainPanel.backgroundColor,
                overflowY:contentFill?null:'auto',
                ...rightPanelStyle
            }
        };
        let closeButton;
        if(closeAction){
            closeButton = <IconButton
                tooltip={Pydio.getMessages()[86]}
                iconClassName={'mdi mdi-close'}
                onClick={closeAction}
                iconStyle={{color:muiTheme.palette.primary1Color}}
            />
        }
        return (
            <div className={"paper-editor-content layout-fill vertical-layout" + (className?' '+ className:'')}>
                <div className="paper-editor-title" style={styles.title}>
                    {titleLeftIcon && <span style={styles.titleLeftIcon} className={titleLeftIcon + ' hide-720'}/>}
                    {leftNavItems &&
                    <IconMenu
                        onChange={(e,v)=>leftNavChange(v)}
                        iconButtonElement={<IconButton iconClassName="mdi mdi-menu" iconStyle={styles.titleLeftIcon} className={"show-720"}/>}>
                        {leftNavItems.map(i => i.subHeader ? <Subheader >{i.subHeader}</Subheader> : <MenuItem value={i.value} primaryText={i.label} /> )}
                    </IconMenu>}
                    <div style={styles.titleH2}>{title}</div>
                    <div style={styles.titleBar}>{titleActionBar}</div>
                    {closeButton}
                </div>
                <div className="layout-fill main-layout-nav-to-stack">
                    {leftNavItems &&
                        <div className={"paper-editor-left" + (forceLeftOpen? ' picker-open':'')} style={styles.leftPanelStyle} onClick={this.toggleMenu.bind(this)}>
                            <Menu
                                value={leftNavSelected}
                                onChange={(e,v) => leftNavChange(v)}
                                listStyle={adminStyles.menu.listStyle}
                                autoWidth={false}
                                disableAutoFocus={true}
                                width={200}
                            >
                                {leftNavItems.map(i => {
                                    if(i.subHeader){
                                        return <Subheader style={adminStyles.menu.subHeader}>{i.subHeader}</Subheader>
                                    } else {
                                        let primaryText = i.label;
                                        if(i.icon) {
                                            primaryText = <span style={{display:'flex', alignItems:'center'}}><span style={{fontSize: 20, marginRight: 16}} className={i.icon}/> {i.label}</span>
                                        }
                                        return <MenuItem
                                            style={adminStyles.menu.menuItem}
                                            value={i.value}
                                            primaryText={primaryText}
                                        />
                                    }
                                })}
                            </Menu>
                        </div>
                    }
                    <div className={"layout-fill paper-editor-right" + (contentFill?' vertical-layout':'')} style={styles.rightPanelStyle}>
                        {children}
                    </div>
                </div>
            </div>
        );
    }
}

PaperEditorLayout.propTypes = {
    title:PropTypes.any,
    titleActionBar:PropTypes.any,
    closeAction: PropTypes.func,
    leftNav:PropTypes.any,
    contentFill:PropTypes.bool,
    className:PropTypes.string
};
PaperEditorLayout = muiThemeable()(PaperEditorLayout);
class PaperIcon extends React.Component{
    render(){
        const {label, icon, action, disabled, muiTheme} = this.props;
        return (
            <IconButton
                tooltip={label}
                iconClassName={icon}
                disabled={disabled}
                onClick={action}
                iconStyle={{color:muiTheme.palette.primary1Color, opacity:disabled?'.3':'1'}}
            />
        );
    }
}
PaperIcon = muiThemeable()(PaperIcon)
PaperEditorLayout.actionButton = (label, icon, action, disabled=false)=> <PaperIcon label={label} icon={icon} action={action} disabled={disabled}/> ;

/**
 * Navigation subheader used by PaperEditorLayout
 */
class PaperEditorNavHeader extends React.Component{

    render(){

        const {muiTheme, children, label} = this.props;
        const styles = AdminStyles(muiTheme.palette);

        return (
            <Subheader style={styles.menu.subHeader}>
                {children}
                {label}
            </Subheader>
        );

    }

}
PaperEditorNavHeader = muiThemeable()(PaperEditorNavHeader)

/**
 * Navigation entry used by PaperEditorLayout.
 */
class PaperEditorNavEntry extends React.Component{

    render(){

        const {label, children, keyName, selectedKey, isLast, onClick} = this.props;
        const styles = AdminStyles(this.props.muiTheme.palette);

        return (
            <MenuItem
                style={styles.menu.menuItem}
                value={keyName}
                primaryText={label}
            />
        );


    }
}

PaperEditorNavEntry = muiThemeable()(PaperEditorNavEntry)

export {PaperEditorLayout, PaperEditorNavEntry, PaperEditorNavHeader}