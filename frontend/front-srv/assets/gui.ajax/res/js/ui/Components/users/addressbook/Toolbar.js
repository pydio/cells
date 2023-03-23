/*
 * Copyright 2018-2023 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import {muiThemeable} from 'material-ui/styles'
import {Checkbox, IconButton, RaisedButton, TextField} from "material-ui";
import SearchForm from "./SearchForm";

class Toolbar extends React.Component {

    state={editLabel:false}

    onLabelKeyEnter(e){
        if (e.key === 'Enter'){
            this.updateLabel();
        }
    }
    onLabelChange(e, value){
        this.setState({editValue: value});
    }
    updateLabel(){
        const {model, onEditLabel} = this.props;
        const {editValue} = this.state;
        if(editValue !== model.contextItem().label){
            onEditLabel(model.contextItem(), editValue);
        }
        this.setState({editLabel: false});
    }

    render() {

        const {muiTheme, bookColumn, mode, getMessage, pydio, style,
            model, searchLabel, onSearch, enableSearch, onEditLabel,
            actionsPanel
        } = this.props;

        const item = model.contextItem()

        const selectionMode = model.getSelectionMode()
        const onFolderClicked= (i,c) => model.setContext(i,c)
        const reloadAction= ()=>model.reloadContext()
        const deleteAction= ()=>model.deleteMultipleSelection()
        const createAction= ()=>model.setCreateItem()

        const accentColor = muiTheme.userTheme==='mui3'?muiTheme.palette.mui3['primary'] : muiTheme.palette.accent2Color;
        let stylesProps = {
            toolbarHeight: mode === 'book' ? 56 : 48,
            titleFontsize: mode === 'book' ? 20 : 16,
            titleFontWeight: 400,
            titlePadding: 10,
            button: {
                border: '1px solid ' + accentColor,
                borderRadius: '50%',
                margin: '0 4px',
                width: 36,
                height: 36,
                padding: 6
            },
            icon : {
                fontSize: 22,
                color: accentColor
            }
        };
        if(bookColumn){
            stylesProps.titleFontsize = 14;
            stylesProps.titleFontWeight = 500;
            stylesProps.titlePadding = '10px 6px 10px 16px';
            stylesProps.button.margin = '0';
            stylesProps.button.border = '0';
            stylesProps.icon.color = accentColor;
        }
        let searchProps = {
            style:{flex:1, minWidth: 110},
        };
        if (mode === 'selector'){
            searchProps.inputStyle={color:'white'};
            searchProps.hintStyle={color:'rgba(255,255,255,.5)'};
            searchProps.underlineStyle={borderColor:'rgba(255,255,255,.5)'};
            searchProps.underlineFocusStyle={borderColor:'white'};
        }
        const ellipsis = {
            whiteSpace:'nowrap',
            textOverflow:'ellipsis',
            overflow:'hidden'
        };
        let createIcon = 'mdi mdi-account-plus';
        if(item.actions && item.actions.type === 'teams'){
            createIcon = 'mdi mdi-account-multiple-plus';
        }

        const {editLabel, editValue} = this.state;
        let mainTitle = item.label;
        if(onEditLabel && !selectionMode){
            if(editLabel){
                mainTitle = (
                    <div style={{display:'flex', alignItems:'center', flex: 1}}>
                        <TextField
                            style={{fontSize: 20}}
                            value={editValue}
                            onChange={this.onLabelChange.bind(this)}
                            onKeyDown={this.onLabelKeyEnter.bind(this)}
                            autoFocus={true}
                        />
                        <IconButton
                            iconStyle={{color: muiTheme.palette.mui3['primary']}}
                            secondary={true}
                            iconClassName={"mdi mdi-content-save"}
                            tooltip={getMessage(48)}
                            onClick={() => {this.updateLabel()}}
                        />
                    </div>
                );
            } else {
                mainTitle = (
                    <div style={{display:'flex', alignItems:'center', flex: 1}}>
                        {mainTitle}
                        <IconButton
                            iconStyle={{fontSize: 20, color: muiTheme.palette.mui3['primary']}}
                            iconClassName={"mdi mdi-pencil"}
                            tooltip={getMessage(48)}
                            onClick={() => {this.setState({editLabel:true, editValue:item.label})}}
                        />
                    </div>
                );
            }
        }

        let showBackIcon = (mode === "selector" && item._parent)
        let showCheckbox = (mode === 'book' && item.actions && item.actions.multiple)
        let showItemIcon = (mode === 'book' && !showCheckbox)
        let showCreateAction = (mode === 'book' || (mode === 'selector' && bookColumn)) && item.actions && item.actions.create && !selectionMode

        let showOpenAddressBook = (bookColumn && !item._parent && pydio.user.getRepositoriesList().has('directory'))
        let showMultipleDeleteAction = (mode === 'book' && item.actions && item.actions.remove && selectionMode)
        let showSearchForm = enableSearch && !bookColumn
        let showReloadAction=(reloadAction && (mode === 'book' || (mode === 'selector' && bookColumn)))

        const mainStyle = {
            color:muiTheme.palette.mui3['on-surface'],
            padding: stylesProps.titlePadding,
            height:stylesProps.toolbarHeight,
            minHeight:stylesProps.toolbarHeight,
            borderRadius: '2px 2px 0 0',
            display:'flex',
            alignItems:'center',
            ...style};

        return (
            <div style={mainStyle}>
                {showBackIcon &&
                    <IconButton style={{marginLeft: -10}} iconStyle={{color:stylesProps.titleColor}} iconClassName="mdi mdi-chevron-left" onClick={() => {onFolderClicked(item._parent)}}/>
                }
                {showItemIcon &&
                    <IconButton style={{marginLeft: -10}} iconStyle={{color:stylesProps.titleColor}} iconClassName={item.icon} onClick={() => {}}/>
                }
                {showCheckbox &&
                    <Checkbox style={{width:'initial', marginLeft: 0}} checked={selectionMode} onCheck={(e,v)=>model.setSelectionMode(v)}/>
                }
                <div style={{flex:2, fontSize:stylesProps.titleFontsize, fontWeight:stylesProps.titleFontWeight, ...ellipsis}}>{mainTitle}</div>
                {showCreateAction &&
                    <IconButton style={stylesProps.button} iconStyle={stylesProps.icon} iconClassName={createIcon} tooltipPosition={"bottom-left"} tooltip={getMessage(item.actions.create)} onClick={createAction}/>
                }
                {showOpenAddressBook &&
                    <IconButton style={stylesProps.button} iconStyle={stylesProps.icon} iconClassName={"mdi mdi-account-box-outline"} tooltipPosition={"bottom-left"} tooltip={pydio.MessageHash['411']} onClick={()=>{pydio.triggerRepositoryChange('directory')}}/>
                }
                {showMultipleDeleteAction &&
                    <RaisedButton secondary={true} label={getMessage(item.actions.remove)} disabled={!model.getMultipleSelection().length} onClick={deleteAction}/>
                }
                {!selectionMode && actionsPanel}
                {showSearchForm &&
                    <SearchForm searchLabel={searchLabel} onSearch={onSearch} {...searchProps}/>
                }
                {showReloadAction &&
                    <IconButton style={stylesProps.button} iconStyle={stylesProps.icon} iconClassName={"mdi mdi-refresh"} tooltipPosition={"bottom-left"} tooltip={pydio.MessageHash['149']} onClick={reloadAction} disabled={model.loading}/>
                }
            </div>
        );
    }

}

Toolbar = muiThemeable()(Toolbar)
export default Toolbar