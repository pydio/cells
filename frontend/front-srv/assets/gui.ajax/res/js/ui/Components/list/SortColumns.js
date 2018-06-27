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


const React = require('react')
const Pydio = require('pydio')
const {PydioContextConsumer} = Pydio.requireLib('boot')
const {ToolbarGroup} = require('material-ui-legacy')
import IconButtonMenu from '../menu/IconButtonMenu'

let SortColumns = React.createClass({

    propTypes:{
        tableKeys           : React.PropTypes.object.isRequired,
        columnClicked       : React.PropTypes.func,
        sortingInfo         : React.PropTypes.object,
        displayMode         : React.PropTypes.string
    },

    onMenuClicked: function(object){
        this.props.columnClicked(object.payload);
    },

    onHeaderClick: function(key, callback){
        let data = this.props.tableKeys[key];
        if(data && data['sortType'] && this.props.columnClicked){
            data['name'] = key;
            this.props.columnClicked(data, callback);
        }
    },

    getColumnsItems: function(displayMode, controller = null){

        let items = [];
        const callback = () => {
            if(controller){
                controller.notify('actions_refreshed');
            }
        };

        for(let key in this.props.tableKeys){
            if(!this.props.tableKeys.hasOwnProperty(key)) continue;
            let data = this.props.tableKeys[key];
            let style = data['width']?{width:data['width']}:null;
            let icon;
            let className = 'cell header_cell cell-' + key;
            if(data['sortType']){
                className += ' sortable';
                if(this.props.sortingInfo && (
                    this.props.sortingInfo.attribute === key
                    || this.props.sortingInfo.attribute === data['sortAttribute']
                    || this.props.sortingInfo.attribute === data['remoteSortAttribute'])){
                    icon = this.props.sortingInfo.direction === 'asc' ? 'mdi mdi-arrow-up' : 'mdi mdi-arrow-down';
                    className += ' active-sort-' + this.props.sortingInfo.direction;
                }
            }
            if(displayMode === 'menu') {
                data['name'] = key;
                items.push({
                    payload: data,
                    text: data['label'],
                    iconClassName: icon
                });
            }else if(displayMode === 'menu_data'){
                items.push({
                    name            : data['label'],
                    callback        : () => { this.onHeaderClick(key, callback) },
                    icon_class      : icon || '__INSET__'
                });
            }else{
                items.push(<span
                    key={key}
                    className={className}
                    style={style}
                    onClick={ () => {this.onHeaderClick(key, callback)} }
                >{data['label']}</span>);

            }
        }
        return items;

    },

    buildSortingMenuItems: function(controller){
        return this.getColumnsItems('menu_data', controller);
    },

    componentDidMount: function(){

        const sortAction = new Action({
            name:'sort_action',
            icon_class:'mdi mdi-sort-descending',
            text_id:450,
            title_id:450,
            text:this.props.getMessage(450),
            title:this.props.getMessage(450),
            hasAccessKey:false,
            subMenu:true,
            subMenuUpdateImage:true
        }, {
            selection:false,
            dir:true,
            actionBar:true,
            actionBarGroup:'display_toolbar',
            contextMenu:false,
            infoPanel:false
        }, {}, {}, {
            dynamicBuilder:this.buildSortingMenuItems
        });
        let buttons = new Map();
        buttons.set('sort_action', sortAction);
        this.props.pydio.getController().updateGuiActions(buttons);

    },

    componentWillUnmount: function(){
        this.props.pydio.getController().deleteFromGuiActions('sort_action');
    },

    render: function(){
        if(this.props.displayMode === 'menu'){
            return (
                <IconButtonMenu buttonTitle="Sort by..." buttonClassName="mdi mdi-sort-descending" menuItems={this.getColumnsItems('menu', this.props.pydio.getController())} onMenuClicked={this.onMenuClicked}/>
            );
        }else{
            return (
                <ToolbarGroup float="left">{this.getColumnsItems('header', this.props.pydio.getController())}</ToolbarGroup>
            );
        }

    }
});

SortColumns = PydioContextConsumer(SortColumns)
export {SortColumns as default}