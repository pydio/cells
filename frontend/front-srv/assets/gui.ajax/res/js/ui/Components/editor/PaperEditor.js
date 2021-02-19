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
import {IconButton, DropDownMenu} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'

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
        const {muiTheme, closeAction, className, title, titleActionBar, leftNav, contentFill, children} = this.props;
        const {forceLeftOpen} = this.state;

        const styles={
            title: {
                backgroundColor: muiTheme.palette.accent2Color,
                borderRadius: '2px 2px 0 0',
                display:'flex',
                alignItems: 'center',
                height: 56,
                padding: '0 20px'
            },
            titleH2: {
                color: 'white',
                flex: 1,
                fontSize: 18,
                padding: 0,
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            },
            titleBar: {
                display: 'flex',
                alignItems: 'center',
            }
        };
        let closeButton;
        if(closeAction){
            closeButton = <IconButton
                tooltip={Pydio.getMessages()[86]}
                iconClassName={'mdi mdi-close'}
                onTouchTap={closeAction}
                iconStyle={{color:'white'}}
            />
        }
        return (
            <div className={"paper-editor-content layout-fill vertical-layout" + (className?' '+ className:'')}>
                <div className="paper-editor-title" style={styles.title}>
                    <h2 style={styles.titleH2}>{title} <div className="left-picker-toggle"><IconButton iconClassName="icon-caret-down" onClick={this.toggleMenu.bind(this)} /></div></h2>
                    <div style={styles.titleBar}>{titleActionBar}</div>
                    {closeButton}
                </div>
                <div className="layout-fill main-layout-nav-to-stack">
                    {leftNav &&
                        <div className={"paper-editor-left" + (forceLeftOpen? ' picker-open':'')} onClick={this.toggleMenu.bind(this)} >
                            {leftNav}
                        </div>
                    }
                    <div className={"layout-fill paper-editor-right" + (contentFill?' vertical-layout':'')} style={contentFill?{}:{overflowY: 'auto'}}>
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
PaperEditorLayout.actionButton = (label, icon, action, disabled=false)=> {
    return (
        <IconButton
            tooltip={label}
            iconClassName={icon}
            disabled={disabled}
            onTouchTap={action}
            iconStyle={{color:disabled?'rgba(255,255,255,0.5)':'white'}}
        />
    );
};

/**
 * Navigation subheader used by PaperEditorLayout
 */
class PaperEditorNavHeader extends React.Component{

    // static propTypes:{
    //     label:PropTypes.string
    // }

    render(){

        return (
            <div className={"mui-subheader"} style={{fontSize: 13, fontWeight: 500, color:'rgba(0, 0, 0, 0.25)', lineHeight:'48px', paddingLeft: 16}}>
                {this.props.children}
                {this.props.label}
            </div>
        );

    }

}
/**
 * Navigation entry used by PaperEditorLayout.
 */
class PaperEditorNavEntry extends React.Component{

    // static propTypes:{
    //     keyName:PropTypes.string.isRequired,
    //     onClick:PropTypes.func.isRequired,
    //     label:PropTypes.string,
    //     selectedKey:PropTypes.string,
    //     isLast:PropTypes.bool,
    //     // Drop Down Data
    //     dropDown:PropTypes.bool,
    //     dropDownData:PropTypes.object,
    //     dropDownChange:PropTypes.func,
    //     dropDownDefaultItems:PropTypes.array
    // }

    onClick(){
        this.props.onClick(this.props.keyName);
    }

    captureDropDownClick(){
        if(this.preventClick){
            this.preventClick = false;
            return;
        }
        this.props.onClick(this.props.keyName);
    }

    dropDownChange(event, index, item){
        this.preventClick = true;
        this.props.dropDownChange(item);
    }

    render(){

        if(!this.props.dropDown || !this.props.dropDownData){
            return (
                <div
                    className={'menu-entry' + (this.props.keyName===this.props.selectedKey?' menu-entry-selected':'') + (this.props.isLast?' last':'')}
                    onClick={this.onClick.bind(this)}>
                    {this.props.children}
                    {this.props.label}
                </div>
            );
        }

        // dropDown & dropDownData are loaded
        var menuItemsTpl = [{text:this.props.label, payload:'-1'}];
        if(this.props.dropDownDefaultItems){
            menuItemsTpl = menuItemsTpl.concat(this.props.dropDownDefaultItems);
        }
        this.props.dropDownData.forEach(function(v, k){
            menuItemsTpl.push({text:v.label, payload:v});
        });
        return (
            <div onClick={this.captureDropDownClick.bind(this)} className={'menu-entry-dropdown' + (this.props.keyName===this.props.selectedKey?' menu-entry-selected':'') + (this.props.isLast?' last':'')}>
                <DropDownMenu
                    menuItems={menuItemsTpl}
                    className="dropdown-full-width"
                    style={{width:256}}
                    autoWidth={false}
                    onChange={this.dropDownChange.bind(this)}
                />
            </div>
        );

    }
}

export {PaperEditorLayout, PaperEditorNavEntry, PaperEditorNavHeader}