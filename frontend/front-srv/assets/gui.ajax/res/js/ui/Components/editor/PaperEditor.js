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
import {IconButton, DropDownMenu} from 'material-ui'

/**
 * Two columns layout used for Workspaces and Plugins editors
 */
const PaperEditorLayout = React.createClass({

    propTypes:{
        title:React.PropTypes.any,
        titleActionBar:React.PropTypes.any,
        leftNav:React.PropTypes.any,
        contentFill:React.PropTypes.bool,
        className:React.PropTypes.string
    },


    toggleMenu:function(){
        const crtLeftOpen = (this.state && this.state.forceLeftOpen);
        this.setState({forceLeftOpen:!crtLeftOpen});
    },

    render:function(){

        const styles={
            title: {
                backgroundColor: '#455A64',
                borderRadius: '2px 2px 0 0',
                display:'flex',
            },
            titleH2: {
                color: 'white',
                flex: 1,
                fontSize: 26,
                padding: '14px 12px 10px',
                marginBottom: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            },
            titleBar: {
                marginTop: 15,
                marginRight: 16
            }
        };

        return (
            <div className={"paper-editor-content layout-fill vertical-layout" + (this.props.className?' '+ this.props.className:'')}>
                <div className="paper-editor-title" style={styles.title}>
                    <h2 style={styles.titleH2}>{this.props.title} <div className="left-picker-toggle"><IconButton iconClassName="icon-caret-down" onClick={this.toggleMenu} /></div></h2>
                    <div style={styles.titleBar}>{this.props.titleActionBar}</div>
                </div>
                <div className="layout-fill main-layout-nav-to-stack">
                    {this.props.leftNav &&
                        <div className={"paper-editor-left" + (this.state && this.state.forceLeftOpen? ' picker-open':'')} onClick={this.toggleMenu} >
                            {this.props.leftNav}
                        </div>
                    }
                    <div className={"layout-fill paper-editor-right" + (this.props.contentFill?' vertical-layout':'')} style={this.props.contentFill?{}:{overflowY: 'auto'}}>
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
});
/**
 * Navigation subheader used by PaperEditorLayout
 */
const PaperEditorNavHeader = React.createClass({

    propTypes:{
        label:React.PropTypes.string
    },

    render:function(){

        return (
            <div className={"mui-subheader"} style={{fontSize: 13, fontWeight: 500, color:'rgba(0, 0, 0, 0.25)', lineHeight:'48px', paddingLeft: 16}}>
                {this.props.children}
                {this.props.label}
            </div>
        );

    }

});
/**
 * Navigation entry used by PaperEditorLayout.
 */
const PaperEditorNavEntry = React.createClass({

    propTypes:{
        keyName:React.PropTypes.string.isRequired,
        onClick:React.PropTypes.func.isRequired,
        label:React.PropTypes.string,
        selectedKey:React.PropTypes.string,
        isLast:React.PropTypes.bool,
        // Drop Down Data
        dropDown:React.PropTypes.bool,
        dropDownData:React.PropTypes.object,
        dropDownChange:React.PropTypes.func,
        dropDownDefaultItems:React.PropTypes.array
    },

    onClick:function(){
        this.props.onClick(this.props.keyName);
    },

    captureDropDownClick: function(){
        if(this.preventClick){
            this.preventClick = false;
            return;
        }
        this.props.onClick(this.props.keyName);
    },

    dropDownChange: function(event, index, item){
        this.preventClick = true;
        this.props.dropDownChange(item);
    },

    render:function(){

        if(!this.props.dropDown || !this.props.dropDownData){
            return (
                <div
                    className={'menu-entry' + (this.props.keyName==this.props.selectedKey?' menu-entry-selected':'') + (this.props.isLast?' last':'')}
                    onClick={this.onClick}>
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
            <div onClick={this.captureDropDownClick} className={'menu-entry-dropdown' + (this.props.keyName==this.props.selectedKey?' menu-entry-selected':'') + (this.props.isLast?' last':'')}>
                <DropDownMenu
                    menuItems={menuItemsTpl}
                    className="dropdown-full-width"
                    style={{width:256}}
                    autoWidth={false}
                    onChange={this.dropDownChange}
                />
            </div>
        );

    }
});

export {PaperEditorLayout, PaperEditorNavEntry, PaperEditorNavHeader}