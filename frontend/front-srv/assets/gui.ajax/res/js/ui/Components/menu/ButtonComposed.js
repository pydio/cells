import Utils from './Utils';
import MenuItemsConsumer from './MenuItemsConsumer'

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
import PropTypes from 'prop-types';

import React from "react";
import ReactDOM from "react-dom";
import {RaisedButton, FlatButton} from "material-ui";
import {Popover} from './ThemedContainer'
import {muiThemeable} from "material-ui/styles";

class ButtonComposed extends React.Component {
    static propTypes = {
        buttonTitle : PropTypes.oneOfType([PropTypes.string,PropTypes.object]).isRequired,
        masterAction: PropTypes.func.isRequired,
        menuItems   : PropTypes.array.isRequired,
        className   : PropTypes.string,
        raised      : PropTypes.bool,
        direction   : PropTypes.oneOf(['left', 'right'])
    };

    state = {showMenu: false};

    componentDidMount() {
        if(this.props.openOnEvent){
            this.props.pydio.observe(this.props.openOnEvent, () => { this.showMenu();});
        }
    }

    showMenu = (event) => {
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
    };

    menuClicked = (event, index, object) => {
        this.setState({showMenu: false});
    };

    render() {
        let masterButton, arrowButton;
        const {id, masterAction, buttonTitle, primary, secondary, disabled, raised, menuItems, buttonStyle, buttonLabelStyle, className, direction, muiTheme} = this.props;
        let masterLabelStyle = {...buttonLabelStyle};
        let arrowLabelStyle = {...buttonLabelStyle};
        if(masterLabelStyle.paddingRight){
            masterLabelStyle.paddingRight /= Math.floor(3);
        } else {
            masterLabelStyle.paddingRight = 8;
        }
        if(arrowLabelStyle.paddingLeft){
            arrowLabelStyle.paddingLeft /= Math.floor(3);
        } else {
            arrowLabelStyle.paddingLeft = 8;
        }
        arrowLabelStyle.paddingRight = arrowLabelStyle.paddingLeft;


        const masterProps = {
            primary: primary,
            secondary: secondary,
            disabled: disabled,
            label: buttonTitle,
            style: {...buttonStyle, minWidth: 60, borderRadius: `${muiTheme.borderRadius}px 0 0 ${muiTheme.borderRadius}px`},
            labelStyle:masterLabelStyle,
            onClick: masterAction,
        };
        const arrowProps = {
            primary: primary,
            secondary: secondary,
            disabled: disabled,
            label: <span className={"mdi mdi-menu-down"}/>,
            style:{...buttonStyle, minWidth: 16, borderRadius: `0 ${muiTheme.borderRadius}px ${muiTheme.borderRadius}px 0`},
            labelStyle:arrowLabelStyle,
            onClick: this.showMenu,
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
        const spanStyleBase = {
            whiteSpace:'nowrap',
            borderRadius: muiTheme.borderRadius
        }
        return (
            <span id={id} className={className}
                  onMouseOver={()=>{this.setState({over:true})}} onMouseOut={()=>{this.setState({over:false})}}
                  style={(over||showMenu)?{backgroundColor:'rgba(153, 153, 153, 0.2)',...spanStyleBase}:spanStyleBase}
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
}


export default MenuItemsConsumer(muiThemeable()(ButtonComposed))
