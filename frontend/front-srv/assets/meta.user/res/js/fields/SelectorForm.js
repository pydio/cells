/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import {MenuItem, IconButton} from 'material-ui'
import asMetaForm from "../hoc/asMetaForm";
const {ModernSelectField, ModernStyles} = Pydio.requireLib('hoc')

class SelectorForm extends React.Component{

    constructor(props) {
        super(props);
        this.state = {}
    }

    changeSelector(e, selectedIndex, payload){
        this.props.updateValue(payload, true);
    }

    componentDidMount(){
        const {itemsLoader} = this.props;
        if(itemsLoader){
            itemsLoader((items, keys, stepper) => {
                this.setState({menuItems: items, keys, stepper});
            })
        }
    }

    next() {

    }

    render(){
        const {stepper, keys = []} = this.state;
        const {value, label, updateValue, search} = this.props;
        let menuItems;
        if(this.state.menuItems === undefined){
            menuItems = [...this.props.menuItems]
        } else {
            menuItems = [...this.state.menuItems]
        }
        menuItems.unshift(<MenuItem value={''} primaryText=""/>);
        const selectProps = search ? {variant: "v1",...ModernStyles.selectFieldV1Search} : {variant: "v2"}
        return (
            <div style={{display:'flex'}}>
                {stepper && !search &&
                <div>
                    <IconButton
                        iconClassName={"mdi mdi-chevron-left"}
                        tooltip={"Previous Step"}
                        onClick={()=>updateValue(keys[keys.indexOf(value)-1], true)}
                        disabled={keys.indexOf(value) <= 0}
                        style={{width: 28, padding:'12px 0'}}
                    />
                </div>
                }
                <div style={{flex:1, maxWidth:(stepper&&!search)?'75%':null}}>
                    <ModernSelectField
                        fullWidth={true}
                        value={value}
                        hintText={label}
                        onChange={this.changeSelector.bind(this)}
                        {...selectProps}
                    >{menuItems}</ModernSelectField>
                </div>
                {stepper && !search &&
                <div>
                    <IconButton
                        iconClassName={"mdi mdi-chevron-right"}
                        tooltip={"Next Step"}
                        onClick={()=>updateValue(keys[keys.indexOf(value)+1], true)}
                        disabled={keys.indexOf(value) >= keys.length-1}
                        style={{width: 28, padding:'12px 0'}}
                    />
                </div>
                }
            </div>
        );
    }
}
export default asMetaForm(SelectorForm);
