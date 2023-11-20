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


import React from "react";
import Pydio from "pydio";
const {PydioContextConsumer} = Pydio.requireLib('boot');
import IconButtonMenu from '../menu/IconButtonMenu'


class SortColumns extends React.Component {
    // static propTypes = {
    //     tableKeys           : React.PropTypes.object.isRequired,
    //     columnClicked       : React.PropTypes.func,
    //     sortingInfo         : React.PropTypes.object,
    //     displayMode         : React.PropTypes.string
    // };

    onMenuClicked(object){
        this.props.columnClicked(object.payload);
    }

    onHeaderClick(key, callback){
        let data = this.props.tableKeys[key];
        if(data && data['sortType'] && this.props.columnClicked){
            data['name'] = key;
            this.props.columnClicked(data, callback);
        }
    }

    getColumnsItems(displayMode, controller = null){

        const callback = () => {
            if(controller){
                controller.notify('actions_refreshed');
            }
        };
        const {tableKeys, sortingInfo} = this.props;

        return Object.keys(tableKeys).map(key => {
            let data = tableKeys[key];
            let style = data['width']?{width:data['width']}:null;
            let icon;
            let className = 'cell header_cell cell-' + key;
            let isActive;
            if(data['sortType']){
                className += ' sortable';
                if(sortingInfo && ( sortingInfo.attribute === key || (sortingInfo.remote && data.remoteSortAttribute && sortingInfo.attribute === data.remoteSortAttribute))){
                    if(data['sortType'] === 'number') {
                        icon = sortingInfo.direction === 'asc' ? 'mdi mdi-sort-numeric-ascending' : 'mdi mdi-sort-numeric-descending';
                    } else {
                        icon = sortingInfo.direction === 'asc' ? 'mdi mdi-sort-alphabetical-ascending' : 'mdi mdi-sort-alphabetical-descending';
                    }
                    className += ' active-sort-' + sortingInfo.direction;
                    isActive = true
                }
            }
            if(displayMode === 'menu') {
                data['name'] = key;
                return {
                    payload: data,
                    text: data['label'],
                    iconClassName: icon
                }
            }else if(displayMode === 'menu_data'){
                return {
                    name            : (
                        <span style={{display:'flex'}}>
                            <span style={{flex:1, fontWeight:isActive?500:'inherit'}}>{data['label']}</span>
                            {isActive && <span className={'mdi mdi-checkbox-marked-circle-outline'}/>}
                        </span>),
                    callback        : () => { this.onHeaderClick(key, callback) },
                    icon_class      : icon || 'mdi mdi-sort'// (data['sortType'] === 'number' ? 'mdi mdi-sort-numeric':'mdi mdi-sort-alphabetical')// '__INSET__'
                }
            }else{
                return (<span
                    key={key}
                    className={className}
                    style={style}
                    onClick={ () => {this.onHeaderClick(key, callback)} }
                >{data['label']}</span>);
            }

        })

    }

    buildSortingMenuItems(controller){
        return this.getColumnsItems('menu_data', controller);
    }

    componentDidMount() {

        const sortAction = new Action({
            name:'sort_action',
            icon_class:'mdi mdi-sort-descending',
            text_id:450,
            title_id:450,
            text:this.props.getMessage(450),
            title:this.props.getMessage(450),
            hasAccessKey:false,
            subMenu:true,
            subMenuUpdateImage:true,
            weight: 50
        }, {
            selection:false,
            dir:true,
            actionBar:true,
            actionBarGroup:'display_toolbar',
            contextMenu:false,
            infoPanel:false
        }, {}, {}, {
            dynamicBuilder:this.buildSortingMenuItems.bind(this)
        });
        let buttons = new Map();
        buttons.set('sort_action', sortAction);
        this.props.pydio.getController().updateGuiActions(buttons);

    }

    componentWillUnmount() {
        this.props.pydio.getController().deleteFromGuiActions('sort_action');
    }

    render() {
        if(this.props.displayMode === 'hidden'){
            return null;
        } else if(this.props.displayMode === 'menu'){
            return (
                <IconButtonMenu buttonTitle="Sort by..." buttonClassName="mdi mdi-sort-descending" menuItems={this.getColumnsItems('menu', this.props.pydio.getController())} onMenuClicked={(o) => this.onMenuClicked(o)}/>
            );
        }else{
            return (
                <div className={"mui-toolbar-group mui-left"}>{this.getColumnsItems('header', this.props.pydio.getController())}</div>
            );
        }

    }
}

SortColumns = PydioContextConsumer(SortColumns);
export {SortColumns as default}