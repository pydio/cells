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
import {IconButton, Paper} from 'material-ui'

const styles = {
    card: {
        backgroundColor: 'white'
    }
};

let CardsStates  = {};

/**
 * Default InfoPanel Card
 */
class InfoPanelCard extends React.Component{

    constructor(props){
        super(props);
        if (props.identifier && CardsStates[props.identifier] !== undefined){
            this.state = {open: CardsStates[props.identifier]};
        } else {
            this.state = {open: true};
        }
    }

    toggle(){
        const newState = !this.state.open;
        this.setState({open: newState});
        if(this.props.identifier){
            CardsStates[this.props.identifier] = newState;
        }
    }

    render(){
        const {open} = this.state;
        const {primaryToolbars} = this.props;
        const icon = <div className="panelIcon" style={{position: 'absolute', right: 2, top: open?8:2}}><IconButton onClick={()=>{this.toggle()}} iconClassName={"mdi mdi-chevron-" + (open?'up':'down')}/></div>;

        let openStyle;
        if(!open){
            openStyle = {paddingTop: 16};
        }
        let title = this.props.title ? <Paper zDepth={0} className="panelHeader" style={{position:'relative', ...openStyle}}>{icon}{this.props.title}</Paper> : null;
        let actions = this.props.actions ? <div className="panelActions">{this.props.actions}</div> : null;
        let rows, toolBar;
        if(this.props.standardData){
            rows = this.props.standardData.map(function(object){
                return (
                    <div className="infoPanelRow" key={object.key}>
                        <div className="infoPanelLabel">{object.label}</div>
                        <div className="infoPanelValue">{object.value}</div>
                    </div>
                );
            });
        }
        if(this.props.primaryToolbars){
            const themePalette = this.props.muiTheme.palette;
            const tBarStyle = {
                backgroundColor: themePalette.accent2Color,
                justifyContent: 'flex-end',
                position:'relative'
            };
            toolBar = (
                <PydioComponents.Toolbar
                    toolbarStyle={tBarStyle}
                    flatButtonStyle={{minWidth: 0}}
                    buttonStyle={{color:'white', paddingRight: 8, paddingLeft: 8}}
                    className="primaryToolbar"
                    renderingType="button"
                    toolbars={this.props.primaryToolbars}
                    controller={this.props.pydio.getController()}
                    fabAction={"share"}
                    buttonMenuNoLabel={true}
                    buttonMenuPopoverDirection={"right"}
                />
            );
        }

        return (
            <Paper zDepth={1} className="panelCard" style={{...this.props.style, ...styles.card}}>
                {title}
                {open &&
                    <div className="panelContent" style={this.props.contentStyle}>
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
    identifier: React.PropTypes.string,
    title:React.PropTypes.string,
    actions:React.PropTypes.array
};

InfoPanelCard = MaterialUI.Style.muiThemeable()(InfoPanelCard);

export {InfoPanelCard as default}
