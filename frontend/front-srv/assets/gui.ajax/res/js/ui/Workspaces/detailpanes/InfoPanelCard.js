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

import PropTypes from 'prop-types';
import React from 'react';
import Color from 'color';
import {IconButton, Paper} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'

const getStyles = (palette) => {
    const colorHue = Color(palette.primary1Color).hsl().array()[0];
    const headerTitle = new Color({h:colorHue,s:30,l:43});

    return {
        card: {
            panel:{
                backgroundColor: 'white',
                borderRadius: 6,
                boxShadow: 'rgba(0, 0, 0, .15) 0px 0px 12px',
                margin: 10,
                overflow:'hidden'
            },
            header:{
                backgroundColor:'transparent',
                position:'relative',
                color:headerTitle.toString(),
                fontSize: 14,
                fontWeight: 500,
                padding: '12px 16px',
                cursor:'pointer'
            },
            content:{
                backgroundColor:'transparent',
                paddingBottom: 0
            },
            headerIcon:{
                position:'absolute',
                top: -1,
                right: 0,
                color:'#ccc'
            },
            actions:{
                padding: 2,
                textAlign: 'right',
                borderTop: '1px solid #e0e0e0'
            }
        },
        toolbar:{
            container: {
                justifyContent: 'flex-end',
                position:'relative',
                borderTop: '1px solid rgba(0,0,0,.15)'
            },
            button: {
                color:palette.accent2Color,
                paddingRight: 8,
                paddingLeft: 8
            },
            fabButton: {
                backgroundColor: '#009688'
            },
            flatButton:{
                minWidth: 0
            }
        }
    }
};

const storageKey = 'pydio.layout.infoPanel.cardStatuses'
let CardsStates  = {};
if(localStorage.getItem(storageKey)) {
    try {
        CardsStates = JSON.parse(localStorage.getItem(storageKey));
    }catch (e){}
}

/**
 * Default InfoPanel Card
 */
class InfoPanelCard extends React.Component{

    constructor(props){
        super(props);
        if (props.popoverPanel) {
            // Force open
            this.state = {open: true};
        } else if (props.identifier && CardsStates[props.identifier] !== undefined){
            this.state = {open: CardsStates[props.identifier]};
        } else if (props.identifier) {
            this.state = {open: props.defaultOpen || false};
        } else {
            this.state = {open: true};
        }
    }

    toggle(){
        const newState = !this.state.open;
        this.setState({open: newState});
        if(this.props.identifier){
            CardsStates[this.props.identifier] = newState;
            localStorage.setItem(storageKey, JSON.stringify(CardsStates));
        }
    }

    render(){
        const {open, hoverRow} = this.state;
        const {primaryToolbars, muiTheme, pydio, standardData, popoverPanel} = this.props;
        const styles = getStyles(muiTheme.palette);
        let title;
        if(popoverPanel) {
            // No toggle icon
            title = this.props.title ? <Paper zDepth={0} style={{...styles.card.header, cursor: 'default'}}>{this.props.title}</Paper> : null;
        } else {
            // Add toggle icon
            const icon = (
                <div
                    style={styles.card.headerIcon}>
                    <IconButton onClick={()=>{this.toggle()}} iconStyle={{color:styles.card.headerIcon.color}} iconClassName={"mdi mdi-chevron-" + (open?'up':'down')}/>
                </div>
            );
            title = this.props.title ? <Paper zDepth={0} style={styles.card.header} onClick={()=>{this.toggle()}}>{icon}{this.props.title}</Paper> : null;
        }
        let actions = this.props.actions ? <div style={styles.card.actions}>{this.props.actions}</div> : null;
        let rows, toolBar;
        if(standardData){
            rows = standardData.map((object)=>{
                const {key, label, value, hoverValue} = object;
                return (
                    <div className="infoPanelRow" key={key}>
                        <div className="infoPanelLabel">{label}</div>
                        <div className="infoPanelValue" style={{userSelect:'text'}} onMouseOver={()=>this.setState({hoverRow:key})} onMouseOut={()=>this.setState({hoverRow:null})}>
                            {hoverValue && hoverRow === key?hoverValue:value}
                        </div>
                    </div>
                );
            });
        }
        if(primaryToolbars){
            toolBar = (
                <PydioComponents.Toolbar
                    toolbarStyle={styles.toolbar.container}
                    flatButtonStyle={styles.toolbar.flatButton}
                    fabButtonStyle={styles.toolbar.fabButton}
                    buttonStyle={styles.toolbar.button}
                    className="primaryToolbar"
                    renderingType="button"
                    toolbars={primaryToolbars}
                    controller={pydio.getController()}
                    fabAction={"share"}
                    buttonMenuNoLabel={true}
                    buttonMenuPopoverDirection={"right"}
                />
            );
        }

        return (
            <Paper zDepth={1} className="panelCard" style={{...styles.card.panel, ...this.props.style}}>
                {title}
                {open &&
                    <div className="panelContent" style={{...styles.card.content, ...this.props.contentStyle}}>
                        {this.props.children}
                        {rows}
                        {toolBar}
                    </div>
                }
                {open && actions}
            </Paper>
        );
    }
}


InfoPanelCard.PropTypes = {
    identifier: PropTypes.string,
    title:PropTypes.string,
    actions:PropTypes.array
};

InfoPanelCard = muiThemeable()(InfoPanelCard);

export {InfoPanelCard as default}
