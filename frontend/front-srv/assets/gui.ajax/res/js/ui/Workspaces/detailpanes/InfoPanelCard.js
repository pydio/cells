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
import Pydio from 'pydio'
import {IconButton, Paper} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
const {Toolbar} = Pydio.requireLib('components')

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
        const styles = muiTheme.buildFSTemplate({}).infoPanel;
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
                <Toolbar
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

        let panelOpen = open?styles.card.panelOpen:{}
        if(popoverPanel) {
            panelOpen = {...panelOpen, margin: 0}
        }

        return (
            <Paper zDepth={styles.card.zDepth} className="panelCard" style={{...styles.card.panel, ...panelOpen, ...this.props.style}}>
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
