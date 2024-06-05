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
const PropTypes = require('prop-types');
const Controller = require('pydio/model/controller')
import Utils from './Utils'
import {debounce} from 'lodash'

function MenuItemConsumer(Component){

    class Wrapped extends React.Component{

        constructor(props, context){
            super(props, context);
            this.state = {
                menuItems: this.props.menuItems || []
            };
        }

        componentDidMount(){

            if(this.props.controller && !this.props.menuItems){
                const observer = () => {
                    const actions = this.props.controller.getContextActions('genericContext', null, this.props.toolbars);
                    const menuItems = Utils.pydioActionsToItems(actions);
                    this.setState({menuItems: menuItems});
                };
                this._observer = debounce(observer, 50);
                if(this.props.controller === this.props.pydio.Controller){
                    this.props.pydio.observe("actions_refreshed", this._observer);
                }else{
                    this.props.controller.observe("actions_refreshed", this._observer);
                }
                this._observer();
            }

        }

        componentWillUnmount(){
            if(this._observer){
                if(this.props.controller === this.props.pydio.Controller){
                    this.props.pydio.stopObserving("actions_refreshed", this._observer);
                }else{
                    this.props.controller.stopObserving("actions_refreshed", this._observer);
                }
            }
        }

        componentWillReceiveProps(nextProps){
            if(nextProps.menuItems && nextProps.menuItems !== this.props.menuItems){
                this.setState({menuItems: nextProps.menuItems});
            }
        }


        render(){
            return <Component {...this.props} menuItems={this.state.menuItems}/>
        }

    }


    Wrapped.propTypes = {
        menuItems   : PropTypes.array,
        toolbars    : PropTypes.array,
        controller  : PropTypes.instanceOf(Controller),
        pydio       : PropTypes.instanceOf(Pydio)
    };

    return Wrapped;

}

export default MenuItemConsumer