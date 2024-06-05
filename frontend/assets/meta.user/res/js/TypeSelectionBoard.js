/*
 * Copyright 2007-2022 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React, {Fragment} from 'react'
const {ModernSelectField, ModernTextField, ThemedModernStyles} = Pydio.requireLib('hoc');
import {muiThemeable} from 'material-ui/styles'
import {MenuItem, IconButton, Toggle} from 'material-ui'


class TypeSelectionBoard extends React.Component{

    constructor(props) {
        super(props);
        this.state = {};
    }

    addSelectionValue(){
        const {selectorNewKey, selectorNewValue, selectorNewColor} = this.state;
        const {data, setAdditionalDataKey} = this.props;
        const {items = []} = data;
        items.push({key:selectorNewKey, value:selectorNewValue, color: selectorNewColor});
        setAdditionalDataKey('items', items);
        this.setState({selectorNewKey:'', selectorNewValue: '', selectorNewColor:''});
    }

    removeSelectionValue(k) {
        const {data, setAdditionalDataKey} = this.props;
        const {items = []} = data;
        setAdditionalDataKey('items', items.filter(i => i.key !== k));
    }

    renderColor(color = '', disabled=false) {
        const cc = [
            '#9c27b0',
            '#607d8b',
            '#66c',
            '#69c',
            '#6c6',
            '#696',
            '#c96',
            '#ff9800',
            '#c66',
            '#fff',
            '#ccc',
            '#999',
            '#000',
        ];
        if(disabled) {
            return <span className={'mdi mdi-label' + (color?'':'-outline')} style={{color:color||'#ccc', marginRight: 5}}/>
        }
        return (
            <span style={{width: 60, marginRight: 6}}>
                <ModernSelectField disabled={disabled} fullWidth={true} value={color} onChange={(e,i,v) => {this.setState({selectorNewColor:v})}}>
                    <MenuItem value={''} primaryText={<span className={'mdi mdi-label-outline'} style={{color:'#ccc'}}/>}/>
                    {cc.map(c => <MenuItem value={c} primaryText={<span className={'mdi mdi-label'} style={{color:c}}/>}/>)}
                </ModernSelectField>
            </span>
        )
    }

    render() {
        const {data, m, setAdditionalDataKey, muiTheme} = this.props;
        const {selectorNewKey, selectorNewValue, selectorNewColor} = this.state;
        const {items = []} = data;
        const ModernStyles = ThemedModernStyles(muiTheme)
        return(
            <Fragment>
                <div style={{padding: 10, paddingRight: 0, backgroundColor: '#f5f5f5', borderRadius: 3}}>
                    <div style={{fontSize: 13}}>{m('editor.selection')}</div>
                    <div>{items.map(i => {
                        const {key, value, color} = i;
                        return (
                            <div key={key} style={{display:'flex', alignItems:'center'}}>
                                {this.renderColor(color, true)}
                                <span style={{marginRight: 6, width: 80}}><ModernTextField value={key} disabled={true} fullWidth={true}/></span>
                                <span style={{flex: 1}}><ModernTextField value={value} disabled={true} fullWidth={true}/></span>
                                <span><IconButton iconClassName={"mdi mdi-delete"} iconStyle={{color:'rgba(0,0,0,.3)'}} onClick={()=>{this.removeSelectionValue(key)}}/></span>
                            </div>
                        )
                    })}</div>
                    <div style={{display:'flex'}} key={"new-selection-key"}>
                        {this.renderColor(selectorNewColor)}
                        <span style={{width: 80, marginRight: 6}}>
                        <ModernTextField value={selectorNewKey} onChange={(e,v)=>{this.setState({selectorNewKey:v})}} hintText={m('editor.selection.key')} fullWidth={true}/>
                    </span>
                        <span style={{flex: 1}}>
                        <ModernTextField value={selectorNewValue} onChange={(e,v)=>{this.setState({selectorNewValue:v})}} hintText={m('editor.selection.value')} fullWidth={true}/></span>
                        <span><IconButton iconClassName={"mdi mdi-plus"} onClick={()=>{this.addSelectionValue()}} disabled={!selectorNewKey || !selectorNewValue}/></span>
                    </div>
                </div>
                <div>
                    <Toggle label={m('editor.selection.steps')} labelPosition={"left"} toggled={data.steps} onToggle={(e,v) => setAdditionalDataKey('steps', v)} {...ModernStyles.toggleFieldV2}/>
                </div>
            </Fragment>
        );

    }
}

TypeSelectionBoard = muiThemeable()(TypeSelectionBoard)
export default TypeSelectionBoard