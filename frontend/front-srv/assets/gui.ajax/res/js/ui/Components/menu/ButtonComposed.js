/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio Cells.
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
import Utils from './Utils'
import MenuItemsConsumer from './MenuItemsConsumer'
import React from "react";
import ReactDOM from "react-dom";
import {Popover, RaisedButton, FlatButton} from "material-ui";

const ButtonComposed = React.createClass({

    propTypes:{
        buttonTitle : React.PropTypes.oneOfType([React.PropTypes.string,React.PropTypes.object]).isRequired,
        masterAction: React.PropTypes.func.isRequired,
        menuItems   : React.PropTypes.array.isRequired,
        className   : React.PropTypes.string,
        raised      : React.PropTypes.bool,
        direction   : React.PropTypes.oneOf(['left', 'right'])
    },

    componentDidMount(){
        if(this.props.openOnEvent){
            this.props.pydio.observe(this.props.openOnEvent, () => { this.showMenu();});
        }
    },

    getInitialState(){
        return {showMenu: false};
    },


    showMenu(event){
        let anchor;
        if(event){
            anchor = event.currentTarget;
        }else{
            anchor = this._buttonDOM;
        }
        this.setState({
            showMenu: true,
            anchor: anchor
        })
    },

    menuClicked(event, index, object){
        this.setState({showMenu: false});
    },

    render(){
        let masterButton, arrowButton;
        const {id, masterAction, buttonTitle, primary, secondary, disabled, raised, menuItems, buttonStyle, buttonLabelStyle, className, direction} = this.props;

        const masterProps = {
            primary: primary,
            secondary: secondary,
            disabled: disabled,
            label: buttonTitle,
            style: {...buttonStyle, minWidth: 60},
            labelStyle:{...buttonLabelStyle, paddingRight: 8},
            onTouchTap: masterAction,
            onClick:(e=>e.stopPropagation())
        };
        const arrowProps = {
            primary: primary,
            secondary: secondary,
            disabled: disabled,
            label: <span className={"mdi mdi-menu-down"}/>,
            onTouchTap: this.showMenu,
            style:{...buttonStyle, minWidth: 16},
            labelStyle:{...buttonLabelStyle, paddingLeft: 8, paddingRight: 8},
            onClick:(e=>e.stopPropagation())
        };
        const {showMenu, anchor, over} = this.state;
        if(menuItems.length){
            if(raised){
                arrowButton = <RaisedButton {...arrowProps} ref={(b) => {this._buttonDOM = ReactDOM.findDOMNode(b);}}/>;
                masterButton = <RaisedButton {...masterProps}/>;
            }else{
                arrowButton = <FlatButton {...arrowProps} ref={(b) => {this._buttonDOM = ReactDOM.findDOMNode(b);}}/>;
                masterButton = <FlatButton {...masterProps}/>;
            }
        }
        return (
            <span id={id} className={className}
                  onMouseOver={()=>{this.setState({over:true})}} onMouseOut={()=>{this.setState({over:false})}}
                  style={(over||showMenu)?{backgroundColor:'rgba(153, 153, 153, 0.2)',whiteSpace:'nowrap'}:{whiteSpace:'nowrap'}}
            >
                {masterButton}
                {arrowButton}
                <Popover
                    className="menuPopover"
                    open={showMenu}
                    anchorEl={anchor}
                    anchorOrigin={{horizontal: direction || 'left', vertical: 'bottom'}}
                    targetOrigin={{horizontal: direction || 'left', vertical: 'top'}}
                    onRequestClose={() => {this.setState({showMenu: false})}}
                    style={{marginTop: 1}}
                    useLayerForClickAway={false}
                >
                    {Utils.itemsToMenu(menuItems, this.menuClicked)}
                </Popover>
            </span>
        );
    }

});


export default MenuItemsConsumer(ButtonComposed)
