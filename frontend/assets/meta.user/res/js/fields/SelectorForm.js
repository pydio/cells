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
const {ModernSelectField, ThemedModernStyles} = Pydio.requireLib('hoc')
import {muiThemeable} from 'material-ui/styles'

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
            itemsLoader((items, keys, stepper, labels) => {
                this.setState({menuItems: items, keys, stepper, labels});
            })
        }
    }

    next() {

    }

    render(){
        const {stepper, labels={}, keys = []} = this.state;
        const {value, label, updateValue, search, muiTheme} = this.props;
        let menuItems;
        if(this.state.menuItems === undefined){
            menuItems = [...this.props.menuItems]
        } else {
            menuItems = [...this.state.menuItems]
        }
        const ModernStyles = ThemedModernStyles(muiTheme);
        const {fillBlockV2Right, fillBlockV2Left, selectFieldV1Search, selectFieldV2} = ModernStyles;
        menuItems.unshift(<MenuItem value={''} primaryText=""/>);
        const selectProps = search ? {variant: "v1",...selectFieldV1Search} : {variant: "v2"}
        let prevLabel, nextLabel
        if(stepper && !search){
            const pos = keys.indexOf(value)
            if(pos > 0) {
                prevLabel = labels[keys[pos-1]]
            }
            if(pos < keys.length -1) {
                nextLabel = labels[keys[pos+1]]
            }
            // override border radius
            selectProps.style = {...selectFieldV2.style, borderRadius:0}
        }
        return (
            <div style={{display:'flex'}}>
                {stepper && !search &&
                <div style={{...fillBlockV2Left, marginRight: 2, padding: '2px 4px'}}>
                    <IconButton
                        iconClassName={"mdi mdi-chevron-left"}
                        disabled={!prevLabel}
                        tooltip={prevLabel}
                        tooltipPosition={"bottom-right"}
                        onClick={()=>updateValue(keys[keys.indexOf(value)-1], true)}
                        style={{width: 28, padding:'12px 0'}}
                    />
                </div>
                }
                <div style={{flex:1}}>
                    <ModernSelectField
                        fullWidth={true}
                        value={value}
                        hintText={label}
                        onChange={this.changeSelector.bind(this)}
                        {...selectProps}
                    >{menuItems}</ModernSelectField>
                </div>
                {stepper && !search &&
                <div style={{...fillBlockV2Right, marginLeft: 2, padding: '2px 4px'}}>
                    <IconButton
                        iconClassName={"mdi mdi-chevron-right"}
                        tooltip={nextLabel}
                        disabled={!nextLabel}
                        tooltipPosition={"bottom-left"}
                        onClick={()=>updateValue(keys[keys.indexOf(value)+1], true)}
                        style={{width: 28, padding:'12px 0'}}
                    />
                </div>
                }
            </div>
        );
    }
}
export default asMetaForm(muiThemeable()(SelectorForm));
