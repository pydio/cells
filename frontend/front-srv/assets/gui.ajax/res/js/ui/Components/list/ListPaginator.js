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
import Pydio from 'pydio'
import {DropDownMenu, MenuItem, IconButton} from 'material-ui'

/**
 * Pagination component reading metadata "paginationData" from current node.
 */
export default class ListPaginator extends React.Component{

    // propTypes:{
    //     dataModel:React.PropTypes.instanceOf(PydioDataModel).isRequired,
    //     node:React.PropTypes.instanceOf(AjxpNode)
    // },

    constructor(props) {
        super(props);
        this.state = {node: this.props.node};
    }


    componentDidMount(){
        if(!this.props.node){
            let dm = this.props.dataModel;
            this._dmObserver = () => {
                this.setState({node: dm.getContextNode()});
            };
            dm.observe("context_changed", this._dmObserver);
            this.setState({node: dm.getContextNode()});
        }
    }

    componentWillUnmount(){
        if(this._dmObserver){
            this.props.dataModel.stopObserving("context_changed", this._dmObserver);
        }
    }

    changePage(event){
        this.state.node.getMetadata().get("paginationData").set("new_page", event.currentTarget.getAttribute('data-page'));
        this.props.dataModel.requireContextChange(this.state.node);
    }

    onMenuChange(event, index, value){
        this.state.node.getMetadata().get("paginationData").set("new_page", value);
        this.props.dataModel.requireContextChange(this.state.node);
    }

    render(){
        const {node} = this.state;
        const {toolbarDisplay, toolbarColor, smallDisplay, style, menuStyle, id} = this.props;
        if(!node || !node.getMetadata().get("paginationData")) {
            return null;
        }
        const pData = node.getMetadata().get("paginationData");
        const current = parseInt(pData.get("current"));
        const total = parseInt(pData.get("total"));
        let pages = [], next, last, previous, first;
        const pageWord = Pydio.getMessages()['331'];
        for(let i=1; i <= total; i++){
            pages.push(<MenuItem
                value={i}
                primaryText={pageWord + ' ' +i + (i === current?(' / ' + total ): '')}
                />
            );
        }
        if(pages.length <= 1){
            return null;
        }
        let customColor;
        let smallButtonsLabel, smallButtonsIcStyle;
        if(toolbarDisplay){
            if(toolbarColor){
                customColor = {color:toolbarColor};
            }
            if(smallDisplay){
                smallButtonsLabel = {fontSize:13};
                smallButtonsIcStyle = {fontSize:20};
            }
        }

        previous = (
            <IconButton
                onClick={() => {this.onMenuChange(null, 0, current-1)}}
                iconClassName={"mdi mdi-chevron-left"}
                disabled={current === 1}
                iconStyle={{...customColor, ...smallButtonsIcStyle}}
                style={smallDisplay?{marginRight:-10, marginTop: -2, width:40, height: 40}:null}
            />
        );
        next = (
            <IconButton
                onClick={() => {this.onMenuChange(null, 0, current+1)}}
                iconClassName={"mdi mdi-chevron-right"}
                disabled={current === total}
                style={smallDisplay?{marginLeft:-40, marginTop: -2, width:40, height: 40}:{marginLeft: -20}}
                iconStyle={{...customColor, ...smallButtonsIcStyle}}
            />
        );

        return (
            <div id={id} style={{display:'flex', alignItems:'center', ...style}}>
                {previous}
                <DropDownMenu
                    style={{width: 150, marginTop: -6}}
                    onChange={this.onMenuChange.bind(this)}
                    value={current}
                    underlineStyle={{display: 'none'}}
                    labelStyle={{...customColor, ...smallButtonsLabel}}
                    menuStyle={menuStyle}
                >{pages}</DropDownMenu>
                {next}
            </div>
        );
    }

}
